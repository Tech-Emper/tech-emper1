"""SQLAlchemy ORM models + leads taxonomy/status constants.

Separated from database.py (which holds the engine/session/Base configuration)
for structure. Everything defined here is re-exported by `database`, so existing
imports like `from database import User` continue to work unchanged across the
codebase.
"""
from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="user") # 'user', 'superadmin'
    password_hash = Column(String, nullable=True) # For future use
    is_otp_verified = Column(Boolean, default=False)
    first_name = Column(String)
    last_name = Column(String) # Keeping in DB for now to avoid migration issues, but will remove from UI
    dob = Column(String)
    mobile = Column(String)
    secondary_phone = Column(String)
    secondary_email = Column(String)
    aadhar_number = Column(String)
    income_level = Column(String)
    city = Column(String)
    gender = Column(String)
    marital_status = Column(String)
    support_parents = Column(Boolean, default=False)
    career_stage = Column(String)
    employment_type = Column(String)
    lifestyle = Column(String)
    smoking_status = Column(String) # Never, Occasionally, Regularly
    family_health_history = Column(JSON) # List of conditions
    company_name = Column(String)
    industry_type = Column(String)
    designation = Column(String)
    # Gap Analysis fields (Phase 2)
    has_life_insurance = Column(Boolean, default=False)
    existing_life_cover = Column(String) # Stored as string like "₹50 Lakhs"
    existing_life_cover_val = Column(Integer, default=0)
    has_health_insurance = Column(Boolean, default=False)
    existing_health_cover = Column(String)
    existing_health_cover_val = Column(Integer, default=0)
    health_source = Column(String) # Employer, Personal, Both
    parents_covered = Column(Boolean, default=False)
    parents_health_cover = Column(String) # For parents' specific health cover
    parents_health_cover_val = Column(Integer, default=0)
    # Existing Policy Details
    life_provider = Column(String)
    life_policy_name = Column(String)
    health_provider = Column(String)
    health_policy_name = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    # JSON field for dependents structure
    dependents_data = Column(JSON)
    insured_members = Column(JSON, default=dict)
    num_children = Column(Integer, default=0)
    is_smoker = Column(Boolean, default=False)
    current_step = Column(Integer, default=1)

    # Tracking states
    onboarding_started_at = Column(DateTime)
    reminder_1_sent = Column(Boolean, default=False)
    reminder_2_sent = Column(Boolean, default=False)

    organization = relationship("Organization", back_populates="users")
    recommendations = relationship("Recommendation", back_populates="user")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    life_cover = Column(String)
    life_cover_val = Column(Integer, default=0)
    health_cover = Column(String)
    health_cover_val = Column(Integer, default=0)
    persona_name = Column(String)
    tagline = Column(String)
    details = Column(String)
    reasoning = Column(String)
    features = Column(JSON)
    icon = Column(String)
    prompt_sent = Column(String) # Store the prompt for debugging
    mode = Column(String) # AI or RULE
    life_recommendations = Column(JSON) # Array of specific life plans (Phase 2)
    health_recommendations = Column(JSON) # Array of specific health plans (Phase 2)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")


class PortabilityUser(Base):
    __tablename__ = "portability_users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    disclaimer_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="portability_profile")


# ============================================================================
# Leads feature — data models + taxonomy/status value sets
# ============================================================================

class Lead(Base):
    """Unified employee-lead table. Common fields are typed columns; product-specific
    input fields live in `details` (JSON). Workflow/status columns are set by the API
    (per product) and updated by admins. HR submissions go to CorporateLead instead."""
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Taxonomy — server derives category/name/source from product_subcategory (see PRODUCT_MAP)
    product_category = Column(String, index=True)      # Health / General
    product_subcategory = Column(String, index=True)   # super_top_up / portability / general (routing key)
    product_name = Column(String)                       # display label

    # Common contact / base fields (collected by the shared modal)
    full_name = Column(String)
    mobile = Column(String, index=True)
    email = Column(String, index=True)
    city = Column(String)
    employer = Column(String)
    respondent_type = Column(String, default="employee")   # HR toggle routes to CorporateLead instead
    service_interested_in = Column(String)
    preferred_contact_method = Column(String)              # phone / email / whatsapp
    callback_date_time = Column(DateTime)                  # user-selected slot (IST)

    # Consent & compliance
    callback_consent = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime)                   # server UTC when saved
    source = Column(String)
    source_page_url = Column(String)                       # full referring URL (compliance)
    ip_address = Column(String)
    user_agent = Column(String)

    # Product-specific input fields (Super Top-Up / Portability); empty {} for General
    details = Column(JSON, default=dict)
    message = Column(String, nullable=True)                # optional free-text (e.g. general-inquiry note)
    designation = Column(String, nullable=True)            # respondent's designation
    callback_date = Column(Date, nullable=True)            # preferred callback date (slot-based UX)
    callback_time_slot = Column(String, nullable=True)     # preferred slot, e.g. morning / afternoon / evening

    # Workflow / case-management (nullable — API sets per-product defaults at creation,
    # admins update later; only the columns relevant to a product are populated)
    call_center_status = Column(String, nullable=True, index=True)   # Super Top-Up & General
    document_status = Column(String, nullable=True)                  # Portability
    insurer_status = Column(String, nullable=True)                   # Portability
    case_status = Column(String, nullable=True, index=True)          # Portability
    case_owner = Column(String, nullable=True)                       # assigned advisor
    internal_notes = Column(JSON, default=list)                      # append-only log: [{ts, by, note}]

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CorporateLead(Base):
    """Separate HR/corporate lead table (routed from the modal's HR toggle)."""
    __tablename__ = "corporate_leads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    company_name = Column(String, index=True)
    num_employees = Column(Integer)
    locations = Column(String)
    hr_contact_name = Column(String)
    hr_contact_mobile = Column(String, index=True)
    hr_contact_email = Column(String, index=True)
    package_or_service_of_interest = Column(String)
    message = Column(String)

    # Consent & compliance
    consent = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime)
    source = Column(String)
    source_page_url = Column(String)                       # full referring URL (compliance)
    ip_address = Column(String)
    user_agent = Column(String)

    # Workflow
    status = Column(String, nullable=True, index=True)
    assigned_advisor = Column(String, nullable=True)
    note = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---- Taxonomy & status value sets --------------------------------------------
# Single source of truth for API validation (Phase 2) and admin dropdowns (Phase 5).

# product_subcategory -> derived taxonomy (server sets category/name/source; the
# modal only sends the subcategory). Pets deferred (not ready).
PRODUCT_MAP = {
    "super_top_up": {"category": "Health",  "name": "Super Top-Up",                "source": "super-topup-page"},
    "portability":  {"category": "Health",  "name": "Group-to-Retail Portability", "source": "portability-page"},
    "general":      {"category": "General", "name": "General Inquiry",             "source": "general-inquiry"},
}
PRODUCT_SUBCATEGORIES = list(PRODUCT_MAP.keys())

# Workflow status enums (ordered pipelines)
CALL_CENTER_STATUSES = ["pending", "pushed", "contacted", "converted", "closed"]
DOCUMENT_STATUSES    = ["not_requested", "requested", "received", "incomplete", "complete"]
INSURER_STATUSES     = ["not_submitted", "submitted", "under_review", "query_raised", "terms_received", "declined", "issued"]
CASE_STATUSES        = ["lead_received", "advisor_assigned", "documents_requested", "submitted_to_insurer", "payment_pending", "policy_issued", "closed"]
CORPORATE_LEAD_STATUSES = ["pending", "contacted", "converted", "closed"]

# Input-field enums (validated at the API layer in Phase 2)
PREFERRED_CONTACT_METHODS = ["phone", "email", "whatsapp"]
PLANNING_FOR_OPTIONS      = ["Self", "Spouse", "Children", "Parents"]
PLANNING_PRIORITY_OPTIONS = ["Higher cover", "Affordable premium", "Family protection", "Not sure"]
EMPLOYMENT_STATUSES       = ["currently_employed", "in_notice_period", "already_exited", "retiring", "other"]
CURRENT_COVER_AMOUNTS     = ["not_sure", "up_to_3l", "3l_to_5l", "5l_to_10l", "above_10l"]
PORTABILITY_REASONS       = ["leaving_job", "retirement", "career_break", "want_personal_cover", "not_sure"]

# Default workflow-status values applied at creation time, per product (used in Phase 2).
DEFAULT_STATUSES = {
    "super_top_up": {"call_center_status": "pending"},
    "general":      {"call_center_status": "pending"},
    "portability":  {
        "document_status": "not_requested",
        "insurer_status":  "not_submitted",
        "case_status":     "lead_received",
    },
}
