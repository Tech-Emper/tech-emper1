import os
import sys
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db, Lead, CorporateLead, PRODUCT_MAP, DEFAULT_STATUSES
from schemas import LeadCreate, CorporateLeadCreate, LeadResponse, DETAILS_MODEL_BY_SUBCATEGORY
from auth import _send_email_base

router = APIRouter(prefix="/api", tags=["leads"])

# ---- Anti-spam configuration (invisible only — no user challenge) ----
MIN_FILL_MS = 2000              # submissions faster than this are treated as bots
IP_RATE_WINDOW_SECONDS = 600    # 10-minute sliding window
IP_RATE_MAX = 8                 # max submissions per IP per window
DEDUP_WINDOW_SECONDS = 600      # same mobile+product within this window => duplicate


def log_now(msg):
    print(f"--- [LEADS ROUTER] {msg}", file=sys.stdout, flush=True)


def _client_ip(request: Request):
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else None


def _now_ms():
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def _too_fast(form_render_ts):
    if not form_render_ts:
        return False
    try:
        return (_now_ms() - int(form_render_ts)) < MIN_FILL_MS
    except (TypeError, ValueError):
        return False


def _notification_recipient():
    return os.getenv("LEADS_NOTIFICATION_EMAIL") or os.getenv("SMTP_FROM_EMAIL", "tech@emper.ai")


def _notify_new_lead(subject: str, rows: dict):
    """Best-effort advisor-assignment notification (runs as a background task)."""
    try:
        body = "".join(f"<p><b>{k}:</b> {v if v not in (None, '') else '-'}</p>" for k, v in rows.items())
        html = f"<html><body><h3>New lead captured</h3>{body}</body></html>"
        _send_email_base(_notification_recipient(), subject, html)
    except Exception as e:  # never let notification failure affect the response
        log_now(f"Notification failed: {e}")


@router.post("/leads", response_model=LeadResponse)
def create_lead(payload: LeadCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Invisible anti-spam — silently accept (don't tip off bots) and skip persistence
    if (payload.hp_field or "").strip():
        return LeadResponse(status="success", message="Received")
    if _too_fast(payload.form_render_ts):
        return LeadResponse(status="success", message="Received")

    # 2. HR submissions belong to the corporate endpoint
    if (payload.respondent_type or "employee").lower() == "hr":
        raise HTTPException(status_code=400, detail="HR submissions must use /api/corporate-leads")

    # 3. Per-product validation of the `details` object
    details_model = DETAILS_MODEL_BY_SUBCATEGORY[payload.product_subcategory]
    try:
        details_obj = details_model(**(payload.details or {}))
        details = details_obj.model_dump(mode="json", exclude_none=True)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid details for {payload.product_subcategory}: {e}")

    ip = _client_ip(request)
    ua = request.headers.get("user-agent")
    now = datetime.utcnow()

    # 4. Rate limit per IP (DB-based sliding window — multi-instance safe)
    if ip:
        recent = db.query(Lead).filter(
            Lead.ip_address == ip,
            Lead.created_at >= now - timedelta(seconds=IP_RATE_WINDOW_SECONDS),
        ).count()
        if recent >= IP_RATE_MAX:
            raise HTTPException(status_code=429, detail="Too many submissions. Please try again later.")

    # 5. Duplicate suppression (same mobile + product within the window)
    dup = db.query(Lead).filter(
        Lead.mobile == payload.mobile,
        Lead.product_subcategory == payload.product_subcategory,
        Lead.created_at >= now - timedelta(seconds=DEDUP_WINDOW_SECONDS),
    ).order_by(Lead.created_at.desc()).first()
    if dup:
        return LeadResponse(status="success", lead_id=dup.id, message="Lead already received")

    # 6. Derive taxonomy + persist
    meta = PRODUCT_MAP[payload.product_subcategory]
    lead = Lead(
        product_subcategory=payload.product_subcategory,
        product_category=meta["category"],
        product_name=meta["name"],
        source=meta["source"],
        source_page_url=payload.source_page_url,
        full_name=payload.full_name,
        mobile=payload.mobile,
        email=payload.email,
        city=payload.city,
        employer=payload.employer,
        respondent_type="employee",
        service_interested_in=payload.service_interested_in,
        preferred_contact_method=payload.preferred_contact_method,
        callback_date_time=payload.callback_date_time,
        callback_consent=payload.callback_consent,
        consent_timestamp=now,
        ip_address=ip,
        user_agent=ua,
        message=payload.message,
        designation=payload.designation,
        callback_date=payload.callback_date,
        callback_time_slot=payload.callback_time_slot,
        details=details,
    )
    # per-product default workflow statuses
    for key, value in DEFAULT_STATUSES.get(payload.product_subcategory, {}).items():
        setattr(lead, key, value)

    db.add(lead)
    db.commit()
    db.refresh(lead)

    # 7. Advisor notification (best-effort, background)
    background_tasks.add_task(
        _notify_new_lead,
        f"New lead: {meta['name']} — {payload.full_name}",
        {"Product": meta["name"], "Name": payload.full_name, "Mobile": payload.mobile,
         "Email": payload.email, "City": payload.city, "Callback": payload.callback_date_time,
         "Lead ID": lead.id},
    )

    return LeadResponse(status="success", lead_id=lead.id, message="Lead captured successfully")


@router.post("/corporate-leads", response_model=LeadResponse)
def create_corporate_lead(payload: CorporateLeadCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Invisible anti-spam
    if (payload.hp_field or "").strip():
        return LeadResponse(status="success", message="Received")
    if _too_fast(payload.form_render_ts):
        return LeadResponse(status="success", message="Received")

    ip = _client_ip(request)
    ua = request.headers.get("user-agent")
    now = datetime.utcnow()

    if ip:
        recent = db.query(CorporateLead).filter(
            CorporateLead.ip_address == ip,
            CorporateLead.created_at >= now - timedelta(seconds=IP_RATE_WINDOW_SECONDS),
        ).count()
        if recent >= IP_RATE_MAX:
            raise HTTPException(status_code=429, detail="Too many submissions. Please try again later.")

    dup = db.query(CorporateLead).filter(
        CorporateLead.hr_contact_mobile == payload.hr_contact_mobile,
        CorporateLead.created_at >= now - timedelta(seconds=DEDUP_WINDOW_SECONDS),
    ).order_by(CorporateLead.created_at.desc()).first()
    if dup:
        return LeadResponse(status="success", lead_id=dup.id, message="Lead already received")

    lead = CorporateLead(
        company_name=payload.company_name,
        num_employees=payload.num_employees,
        locations=payload.locations,
        hr_contact_name=payload.hr_contact_name,
        hr_contact_mobile=payload.hr_contact_mobile,
        hr_contact_email=payload.hr_contact_email,
        package_or_service_of_interest=payload.package_or_service_of_interest,
        message=payload.message,
        consent=payload.consent,
        consent_timestamp=now,
        source="corporate-hr",
        source_page_url=payload.source_page_url,
        ip_address=ip,
        user_agent=ua,
        status="pending",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    background_tasks.add_task(
        _notify_new_lead,
        f"New corporate lead: {payload.company_name}",
        {"Company": payload.company_name, "Employees": payload.num_employees,
         "HR Contact": payload.hr_contact_name, "Mobile": payload.hr_contact_mobile,
         "Email": payload.hr_contact_email, "Interested in": payload.package_or_service_of_interest,
         "Lead ID": lead.id},
    )

    return LeadResponse(status="success", lead_id=lead.id, message="Corporate lead captured successfully")
