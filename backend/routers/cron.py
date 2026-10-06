import os
import io
import csv
import sys
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db, Lead
from auth import SUPERADMIN_EMAILS, send_email_with_attachment

router = APIRouter(prefix="/api/cron", tags=["cron"])

IST = timezone(timedelta(hours=5, minutes=30))

# Statuses considered "done" — excluded from the to-call list
TERMINAL_STATUSES = ["converted", "closed"]


def log_now(msg):
    print(f"--- [CRON] {msg}", file=sys.stdout, flush=True)


@router.post("/callback-digest")
def callback_digest(x_cron_secret: str = Header(None), db: Session = Depends(get_db)):
    """Email superadmins today's (IST) employee-lead callback list as a CSV attachment.
    Protected by the CRON_SECRET header. Sends nothing when there are no callbacks."""
    expected = os.getenv("CRON_SECRET")
    if not expected or x_cron_secret != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

    today = datetime.now(IST).date()

    leads = (
        db.query(Lead)
        .filter(Lead.callback_date == today)
        .filter(or_(Lead.call_center_status.is_(None),
                    Lead.call_center_status.notin_(TERMINAL_STATUSES)))
        .order_by(Lead.callback_time_slot.asc(), Lead.created_at.asc())
        .all()
    )

    if not leads:
        log_now(f"No callbacks for {today} — no email sent.")
        return {"sent": False, "count": 0, "date": today.isoformat()}

    # Build CSV in memory (utf-8-sig so Excel opens it cleanly)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Name", "Mobile", "Email", "Employer", "City", "Product",
                     "Callback date", "Time slot", "Preferred contact", "Status", "Designation"])
    for l in leads:
        writer.writerow([
            l.full_name, l.mobile, l.email, l.employer, l.city, l.product_name,
            l.callback_date.isoformat() if l.callback_date else "",
            l.callback_time_slot, l.preferred_contact_method, l.call_center_status, l.designation,
        ])
    csv_bytes = buf.getvalue().encode("utf-8-sig")

    filename = f"callbacks_{today.isoformat()}.csv"
    n = len(leads)
    subject = f"Callback schedule for {today.isoformat()} — {n} lead{'s' if n != 1 else ''}"
    html = (
        f"<p>Hello,</p>"
        f"<p><b>{n}</b> callback{'s are' if n != 1 else ' is'} scheduled for today "
        f"(<b>{today.isoformat()}</b>, IST). The full list is attached as a CSV file.</p>"
        f"<p>— Insurance Wizard</p>"
    )

    recipients = sorted(SUPERADMIN_EMAILS)
    sent_to, failed = [], []
    for em in recipients:
        ok, _ = send_email_with_attachment(em, subject, html, filename, csv_bytes)
        (sent_to if ok else failed).append(em)

    log_now(f"Callback digest for {today}: {n} lead(s); sent={sent_to}; failed={failed}")
    return {"sent": True, "count": n, "date": today.isoformat(),
            "recipients": sent_to, "failed": failed}
