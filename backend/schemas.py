from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, Dict, List
import re
from datetime import datetime, date
from database import (
    PRODUCT_SUBCATEGORIES, PREFERRED_CONTACT_METHODS,
    PLANNING_FOR_OPTIONS, PLANNING_PRIORITY_OPTIONS,
    EMPLOYMENT_STATUSES, CURRENT_COVER_AMOUNTS, PORTABILITY_REASONS,
    CALL_CENTER_STATUSES, DOCUMENT_STATUSES, INSURER_STATUSES, CASE_STATUSES,
    CORPORATE_LEAD_STATUSES,
)
class OrganizationBase(BaseModel):
    name: str

class AdminUserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    mobile: str
    designation: Optional[str] = ""
    role: str = "Admin"

class OrganizationCreate(OrganizationBase):
    admins: Optional[List[AdminUserCreate]] = []

class OrganizationUpdate(BaseModel):
    name: str
    admins: Optional[List[AdminUserCreate]] = []
    removed_admins: Optional[List[int]] = []

class OrganizationResponse(OrganizationBase):
    id: int
    employees: int
    
    class Config:
        from_attributes = True

class AdminUserResponse(BaseModel):
    id: int
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: str
    mobile: Optional[str] = ""
    designation: Optional[str] = ""
    role: str

    class Config:
        from_attributes = True

class UserData(BaseModel):
    organization_id: Optional[int] = None
    role: Optional[str] = "user"
    is_otp_verified: Optional[bool] = False
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    dob: Optional[str] = ""
    mobile: Optional[str] = ""
    secondary_phone: Optional[str] = ""
    secondary_email: Optional[str] = ""
    aadhar_number: Optional[str] = ""
    income_level: Optional[str] = ""
    city: Optional[str] = ""
    gender: Optional[str] = ""
    marital_status: Optional[str] = "Single"
    support_parents: Optional[bool] = False
    career_stage: Optional[str] = ""
    employment_type: Optional[str] = ""
    lifestyle: Optional[str] = ""
    smoking_status: Optional[str] = ""
    family_health_history: Optional[list[str]] = []
    company_name: Optional[str] = ""
    industry_type: Optional[str] = ""
    is_smoker: Optional[bool] = False
    dependents: Optional[Dict[str, bool]] = {}
    num_children: Optional[int] = 0
    insured_members: Optional[Dict] = {}
    
    # Phase 2 Fields
    has_life_insurance: Optional[bool] = False
    existing_life_cover: Optional[str] = ""
    existing_life_cover_val: Optional[int] = 0
    has_health_insurance: Optional[bool] = False
    existing_health_cover: Optional[str] = ""
    existing_health_cover_val: Optional[int] = 0
    health_source: Optional[str] = ""
    parents_covered: Optional[bool] = False
    parents_health_cover: Optional[str] = ""
    parents_health_cover_val: Optional[int] = 0
    # Existing Policy Details
    life_provider: Optional[str] = ""
    life_policy_name: Optional[str] = ""
    health_provider: Optional[str] = ""
    health_policy_name: Optional[str] = ""

class ProgressRequest(BaseModel):
    formData: UserData
    current_step: int

class LoginRequest(BaseModel):
    email: str

class VerifyRequest(BaseModel):
    email: str
    otp: str

class PolicyRecommendationRequest(BaseModel):
    recommended_life_cover: Optional[str] = ""
    recommended_life_cover_val: Optional[int] = 0
    recommended_health_cover: Optional[str] = ""
    recommended_health_cover_val: Optional[int] = 0
    recommended_features: Optional[list[str]] = []
    has_life_insurance: Optional[bool] = False
    existing_life_cover_val: Optional[int] = 0
    life_provider: Optional[str] = ""
    life_policy_name: Optional[str] = ""
    has_health_insurance: Optional[bool] = False
    existing_health_cover_val: Optional[int] = 0
    health_provider: Optional[str] = ""
    health_policy_name: Optional[str] = ""
    health_source: Optional[str] = ""
    # Profile context
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    age: Optional[int] = 30
    income_level: Optional[str] = ""
    city: Optional[str] = ""

class ProfileSyncRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    mobile: Optional[str] = None
    secondary_phone: Optional[str] = None
    secondary_email: Optional[str] = None
    aadhar_number: Optional[str] = None
    existing_life_cover_val: Optional[int] = None
    life_provider: Optional[str] = None
    life_policy_name: Optional[str] = None
    existing_health_cover_val: Optional[int] = None
    health_provider: Optional[str] = None
    health_policy_name: Optional[str] = None
    marital_status: Optional[str] = None
    num_children: Optional[int] = None
    income_level: Optional[str] = None
    smoking_status: Optional[str] = None
    lifestyle: Optional[str] = None
    employment_type: Optional[str] = None


# ============================================================================
# Leads feature (Phase 2) — request/response schemas
# ============================================================================

_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


def _normalize_mobile(v: str) -> str:
    """Normalize to a bare 10-digit Indian mobile; raises on invalid input."""
    digits = re.sub(r"\D", "", v or "")
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if not _MOBILE_RE.match(digits):
        raise ValueError("Invalid Indian mobile number (must be 10 digits starting 6-9)")
    return digits


# ---- Product-specific `details` models ----

class SuperTopUpDetails(BaseModel):
    planning_for: str
    planning_priority: str

    @field_validator("planning_for")
    @classmethod
    def _pf(cls, v):
        if v not in PLANNING_FOR_OPTIONS:
            raise ValueError(f"planning_for must be one of {PLANNING_FOR_OPTIONS}")
        return v

    @field_validator("planning_priority")
    @classmethod
    def _pp(cls, v):
        if v not in PLANNING_PRIORITY_OPTIONS:
            raise ValueError(f"planning_priority must be one of {PLANNING_PRIORITY_OPTIONS}")
        return v


class PortabilityDetails(BaseModel):
    employment_status: str
    last_working_date: Optional[date] = None
    current_group_insurer: Optional[str] = None
    current_cover_amount: str
    covered_members: List[str]
    portability_reason: str

    @field_validator("employment_status")
    @classmethod
    def _es(cls, v):
        if v not in EMPLOYMENT_STATUSES:
            raise ValueError(f"employment_status must be one of {EMPLOYMENT_STATUSES}")
        return v

    @field_validator("current_cover_amount")
    @classmethod
    def _cca(cls, v):
        if v not in CURRENT_COVER_AMOUNTS:
            raise ValueError(f"current_cover_amount must be one of {CURRENT_COVER_AMOUNTS}")
        return v

    @field_validator("portability_reason")
    @classmethod
    def _pr(cls, v):
        if v not in PORTABILITY_REASONS:
            raise ValueError(f"portability_reason must be one of {PORTABILITY_REASONS}")
        return v

    @field_validator("covered_members")
    @classmethod
    def _cm(cls, v):
        if not v:
            raise ValueError("covered_members cannot be empty")
        return v

    @model_validator(mode="after")
    def _conditional_last_working_date(self):
        if self.employment_status in {"in_notice_period", "already_exited", "retiring"} and not self.last_working_date:
            raise ValueError("last_working_date is required when employment_status is in_notice_period, already_exited, or retiring")
        return self


class GeneralDetails(BaseModel):
    """General inquiry has no product-specific fields."""
    pass


DETAILS_MODEL_BY_SUBCATEGORY = {
    "super_top_up": SuperTopUpDetails,
    "portability": PortabilityDetails,
    "general": GeneralDetails,
}


# ---- Public request models ----

class LeadCreate(BaseModel):
    product_subcategory: str
    full_name: str
    mobile: str
    email: EmailStr
    city: Optional[str] = None
    employer: Optional[str] = None
    respondent_type: Optional[str] = "employee"
    service_interested_in: Optional[str] = None
    preferred_contact_method: Optional[str] = None
    callback_date_time: Optional[datetime] = None
    callback_consent: bool
    callback_date: Optional[date] = None
    callback_time_slot: Optional[str] = None
    designation: Optional[str] = None
    source_page_url: Optional[str] = None
    message: Optional[str] = None
    details: Optional[Dict] = None
    # anti-spam (invisible)
    hp_field: Optional[str] = ""          # honeypot — must be empty
    form_render_ts: Optional[int] = None  # epoch ms when the form was rendered

    @field_validator("product_subcategory")
    @classmethod
    def _sub(cls, v):
        if v not in PRODUCT_SUBCATEGORIES:
            raise ValueError(f"product_subcategory must be one of {PRODUCT_SUBCATEGORIES}")
        return v

    @field_validator("full_name")
    @classmethod
    def _name(cls, v):
        if not v or not v.strip():
            raise ValueError("full_name is required")
        return v.strip()

    @field_validator("mobile")
    @classmethod
    def _mob(cls, v):
        return _normalize_mobile(v)

    @field_validator("email")
    @classmethod
    def _email_lower(cls, v):
        return str(v).lower()

    @field_validator("preferred_contact_method")
    @classmethod
    def _pcm(cls, v):
        if v is not None and v not in PREFERRED_CONTACT_METHODS:
            raise ValueError(f"preferred_contact_method must be one of {PREFERRED_CONTACT_METHODS}")
        return v

    @field_validator("callback_consent")
    @classmethod
    def _consent(cls, v):
        if v is not True:
            raise ValueError("callback_consent must be true to submit")
        return v


class CorporateLeadCreate(BaseModel):
    company_name: str
    num_employees: Optional[int] = None
    locations: Optional[str] = None
    hr_contact_name: str
    hr_contact_mobile: str
    hr_contact_email: EmailStr
    package_or_service_of_interest: Optional[str] = None
    message: Optional[str] = None
    consent: bool
    source_page_url: Optional[str] = None
    hp_field: Optional[str] = ""
    form_render_ts: Optional[int] = None

    @field_validator("company_name", "hr_contact_name")
    @classmethod
    def _required(cls, v):
        if not v or not v.strip():
            raise ValueError("field is required")
        return v.strip()

    @field_validator("hr_contact_mobile")
    @classmethod
    def _mob(cls, v):
        return _normalize_mobile(v)

    @field_validator("hr_contact_email")
    @classmethod
    def _email_lower(cls, v):
        return str(v).lower()

    @field_validator("consent")
    @classmethod
    def _consent(cls, v):
        if v is not True:
            raise ValueError("consent must be true to submit")
        return v


class LeadResponse(BaseModel):
    status: str
    lead_id: Optional[str] = None
    message: str


# ---- Admin update models (Phase 3) ----

class LeadUpdate(BaseModel):
    """Partial update of a lead's workflow/case fields (Super Admin Action column)."""
    call_center_status: Optional[str] = None
    document_status: Optional[str] = None
    insurer_status: Optional[str] = None
    case_status: Optional[str] = None
    case_owner: Optional[str] = None
    internal_note: Optional[str] = None   # a single note to append to the log
    note_author: Optional[str] = None     # who added it (falls back to admin email)

    @field_validator("call_center_status")
    @classmethod
    def _ccs(cls, v):
        if v is not None and v not in CALL_CENTER_STATUSES:
            raise ValueError(f"call_center_status must be one of {CALL_CENTER_STATUSES}")
        return v

    @field_validator("document_status")
    @classmethod
    def _ds(cls, v):
        if v is not None and v not in DOCUMENT_STATUSES:
            raise ValueError(f"document_status must be one of {DOCUMENT_STATUSES}")
        return v

    @field_validator("insurer_status")
    @classmethod
    def _is(cls, v):
        if v is not None and v not in INSURER_STATUSES:
            raise ValueError(f"insurer_status must be one of {INSURER_STATUSES}")
        return v

    @field_validator("case_status")
    @classmethod
    def _cs(cls, v):
        if v is not None and v not in CASE_STATUSES:
            raise ValueError(f"case_status must be one of {CASE_STATUSES}")
        return v


class CorporateLeadUpdate(BaseModel):
    status: Optional[str] = None
    assigned_advisor: Optional[str] = None
    note: Optional[str] = None

    @field_validator("status")
    @classmethod
    def _s(cls, v):
        if v is not None and v not in CORPORATE_LEAD_STATUSES:
            raise ValueError(f"status must be one of {CORPORATE_LEAD_STATUSES}")
        return v
