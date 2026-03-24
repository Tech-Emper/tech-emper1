from pydantic import BaseModel
from typing import Optional, Dict
class OrganizationBase(BaseModel):
    name: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int
    employees: int
    
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
