import io
import csv
import json
from datetime import datetime, timedelta, date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db, Lead, CorporateLead, User
from schemas import LeadUpdate, CorporateLeadUpdate, SuperTopUpDetails, PortabilityDetails
from routers.superadmin import verify_superadmin

router = APIRouter(prefix="/api/superadmin", tags=["admin-leads"])

# Which `details` keys to flatten into CSV columns, per product (single-product export)
DETAIL_FIELDS = {
    "super_top_up": list(SuperTopUpDetails.model_fields.keys()),
    "portability": list(PortabilityDetails.model_fields.keys()),
    "general": [],
}

LEAD_BASE_EXPORT_FIELDS = [
    "id", "created_at", "product_category", "product_subcategory", "product_name",
    "full_name", "mobile", "email", "city", "employer", "respondent_type",
    "service_interested_in", "preferred_contact_method", "callback_date_time",
    "callback_consent", "callback_date", "callback_time_slot", "consent_timestamp",
    "source", "source_page_url", "designation", "message",
    "call_center_status", "document_status", "insurer_status", "case_status", "case_owner",
]

SORTABLE = {
    "created_at": Lead.created_at, "updated_at": Lead.updated_at, "full_name": Lead.full_name,
    "call_center_status": Lead.call_center_status, "case_status": Lead.case_status,
}


# ---- helpers ----

def _iso(v):
    return v.isoformat() if isinstance(v, (datetime, date)) else v


def _serialize_lead(l: Lead) -> dict:
    return {
        "id": l.id,
        "product_category": l.product_category,
        "product_subcategory": l.product_subcategory,
        "product_name": l.product_name,
        "full_name": l.full_name,
        "mobile": l.mobile,
        "email": l.email,
        "city": l.city,
        "employer": l.employer,
        "respondent_type": l.respondent_type,
        "service_interested_in": l.service_interested_in,
        "preferred_contact_method": l.preferred_contact_method,
        "callback_date_time": _iso(l.callback_date_time),
        "callback_consent": l.callback_consent,
        "consent_timestamp": _iso(l.consent_timestamp),
        "source": l.source,
        "source_page_url": l.source_page_url,
        "ip_address": l.ip_address,
        "user_agent": l.user_agent,
        "message": l.message,
        "designation": l.designation,
        "callback_date": _iso(l.callback_date),
        "callback_time_slot": l.callback_time_slot,
        "details": l.details or {},
        "call_center_status": l.call_center_status,
        "document_status": l.document_status,
        "insurer_status": l.insurer_status,
        "case_status": l.case_status,
        "case_owner": l.case_owner,
        "internal_notes": l.internal_notes or [],
        "created_at": _iso(l.created_at),
        "updated_at": _iso(l.updated_at),
    }


def _serialize_corporate(c: CorporateLead) -> dict:
    return {
        "id": c.id, "company_name": c.company_name, "num_employees": c.num_employees,
        "locations": c.locations, "hr_contact_name": c.hr_contact_name,
        "hr_contact_mobile": c.hr_contact_mobile, "hr_contact_email": c.hr_contact_email,
        "package_or_service_of_interest": c.package_or_service_of_interest, "message": c.message,
        "consent": c.consent, "consent_timestamp": _iso(c.consent_timestamp),
        "source": c.source, "source_page_url": c.source_page_url,
        "status": c.status, "assigned_advisor": c.assigned_advisor, "note": c.note,
        "created_at": _iso(c.created_at), "updated_at": _iso(c.updated_at),
    }


def _parse_iso(s: Optional[str]):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def _apply_lead_filters(query, *, date_from, date_to, product_category, product_subcategory,
                        call_center_status, case_status, city, q):
    cf = _parse_iso(date_from)
    if cf:
        query = query.filter(Lead.created_at >= cf)
    ct = _parse_iso(date_to)
    if ct:
        if date_to and len(date_to) == 10:      # date-only => inclusive whole day
            query = query.filter(Lead.created_at < ct + timedelta(days=1))
        else:
            query = query.filter(Lead.created_at <= ct)
    if product_category:
        query = query.filter(Lead.product_category == product_category)
    if product_subcategory:
        query = query.filter(Lead.product_subcategory == product_subcategory)
    if call_center_status:
        query = query.filter(Lead.call_center_status == call_center_status)
    if case_status:
        query = query.filter(Lead.case_status == case_status)
    if city:
        query = query.filter(Lead.city.ilike(f"%{city}%"))
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Lead.full_name.ilike(like), Lead.mobile.ilike(like), Lead.email.ilike(like)))
    return query


def _csv_response(header, data_rows, filename):
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(header)
    writer.writerows(data_rows)
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ============================================================================
# Employee leads
# ============================================================================

@router.get("/leads")
def list_leads(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    product_category: Optional[str] = None,
    product_subcategory: Optional[str] = None,
    call_center_status: Optional[str] = None,
    case_status: Optional[str] = None,
    city: Optional[str] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "-created_at",
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    admin: User = Depends(verify_superadmin),
    db: Session = Depends(get_db),
):
    query = _apply_lead_filters(
        db.query(Lead), date_from=date_from, date_to=date_to,
        product_category=product_category, product_subcategory=product_subcategory,
        call_center_status=call_center_status, case_status=case_status, city=city, q=q,
    )
    total = query.count()

    col = SORTABLE.get((sort or "").lstrip("-"), Lead.created_at)
    query = query.order_by(col.desc() if (sort or "-created_at").startswith("-") else col.asc())

    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total, "page": page, "page_size": page_size,
        "results": [_serialize_lead(r) for r in rows],
    }


@router.get("/leads/export")
def export_leads(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    product_category: Optional[str] = None,
    product_subcategory: Optional[str] = None,
    call_center_status: Optional[str] = None,
    case_status: Optional[str] = None,
    city: Optional[str] = None,
    q: Optional[str] = None,
    admin: User = Depends(verify_superadmin),
    db: Session = Depends(get_db),
):
    query = _apply_lead_filters(
        db.query(Lead), date_from=date_from, date_to=date_to,
        product_category=product_category, product_subcategory=product_subcategory,
        call_center_status=call_center_status, case_status=case_status, city=city, q=q,
    ).order_by(Lead.created_at.desc())
    rows = query.all()

    # Single-product export flattens that product's detail keys; otherwise dump `details` as JSON
    detail_cols = DETAIL_FIELDS.get(product_subcategory) if product_subcategory else None
    header = LEAD_BASE_EXPORT_FIELDS + (detail_cols if detail_cols else ["details"]) + ["internal_notes"]

    data_rows = []
    for l in rows:
        base = [_iso(getattr(l, f)) for f in LEAD_BASE_EXPORT_FIELDS]
        if detail_cols is not None:
            d = l.details or {}
            base += [d.get(k) for k in detail_cols]
        else:
            base.append(json.dumps(l.details or {}, ensure_ascii=False))
        base.append(json.dumps(l.internal_notes or [], ensure_ascii=False))
        data_rows.append(base)

    fname = f"leads_{date_from or 'all'}_{date_to or 'all'}.csv"
    return _csv_response(header, data_rows, fname)


@router.get("/leads/{lead_id}")
def get_lead(lead_id: str, admin: User = Depends(verify_superadmin), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _serialize_lead(lead)


@router.patch("/leads/{lead_id}")
def update_lead(lead_id: str, payload: LeadUpdate, admin: User = Depends(verify_superadmin), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    for field in ("call_center_status", "document_status", "insurer_status", "case_status", "case_owner"):
        val = getattr(payload, field)
        if val is not None:
            setattr(lead, field, val)

    # Append-only internal note log
    if payload.internal_note and payload.internal_note.strip():
        entry = {
            "ts": datetime.utcnow().isoformat(),
            "by": payload.note_author or admin.email,
            "note": payload.internal_note.strip(),
        }
        lead.internal_notes = (lead.internal_notes or []) + [entry]  # reassign so SQLAlchemy tracks the change

    db.commit()
    db.refresh(lead)
    return _serialize_lead(lead)


# ============================================================================
# Corporate / HR leads
# ============================================================================

@router.get("/corporate-leads")
def list_corporate_leads(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    admin: User = Depends(verify_superadmin),
    db: Session = Depends(get_db),
):
    query = db.query(CorporateLead)
    cf = _parse_iso(date_from)
    if cf:
        query = query.filter(CorporateLead.created_at >= cf)
    ct = _parse_iso(date_to)
    if ct:
        if date_to and len(date_to) == 10:
            query = query.filter(CorporateLead.created_at < ct + timedelta(days=1))
        else:
            query = query.filter(CorporateLead.created_at <= ct)
    if status:
        query = query.filter(CorporateLead.status == status)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(
            CorporateLead.company_name.ilike(like), CorporateLead.hr_contact_name.ilike(like),
            CorporateLead.hr_contact_mobile.ilike(like), CorporateLead.hr_contact_email.ilike(like),
        ))

    total = query.count()
    rows = query.order_by(CorporateLead.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total, "page": page, "page_size": page_size,
        "results": [_serialize_corporate(r) for r in rows],
    }


@router.get("/corporate-leads/export")
def export_corporate_leads(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    admin: User = Depends(verify_superadmin),
    db: Session = Depends(get_db),
):
    query = db.query(CorporateLead)
    cf = _parse_iso(date_from)
    if cf:
        query = query.filter(CorporateLead.created_at >= cf)
    ct = _parse_iso(date_to)
    if ct:
        if date_to and len(date_to) == 10:
            query = query.filter(CorporateLead.created_at < ct + timedelta(days=1))
        else:
            query = query.filter(CorporateLead.created_at <= ct)
    if status:
        query = query.filter(CorporateLead.status == status)
    rows = query.order_by(CorporateLead.created_at.desc()).all()

    fields = ["id", "created_at", "company_name", "num_employees", "locations",
              "hr_contact_name", "hr_contact_mobile", "hr_contact_email",
              "package_or_service_of_interest", "message", "consent", "consent_timestamp",
              "source", "source_page_url", "status", "assigned_advisor", "note"]
    data_rows = [[_iso(getattr(c, f)) for f in fields] for c in rows]
    fname = f"corporate_leads_{date_from or 'all'}_{date_to or 'all'}.csv"
    return _csv_response(fields, data_rows, fname)


@router.patch("/corporate-leads/{lead_id}")
def update_corporate_lead(lead_id: str, payload: CorporateLeadUpdate, admin: User = Depends(verify_superadmin), db: Session = Depends(get_db)):
    lead = db.query(CorporateLead).filter(CorporateLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Corporate lead not found")
    for field in ("status", "assigned_advisor", "note"):
        val = getattr(payload, field)
        if val is not None:
            setattr(lead, field, val)
    db.commit()
    db.refresh(lead)
    return _serialize_corporate(lead)
