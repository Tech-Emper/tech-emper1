# FORCE UNBUFFERED PRINT FOR RAILWAY LOGS
import sys
import os
import logging
import traceback
from typing import Dict, Optional
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

from datetime import datetime

def log_now(msg):
    print(f"--- [STARTUP LOG] {msg}", file=sys.stdout, flush=True)

log_now("--- BACKEND MODULE LOADING ---")

# Diagnostic for Railway import issues
try:
    import google
    log_now(f"Google package found at: {getattr(google, '__path__', 'Unknown')}")
    from google.genai import Client
    log_now("Google GenAI Client imported successfully.")
except Exception as diag_e:
    log_now(f"DIAGNOSTIC: GenAI import failed early: {diag_e}")
    try:
        import pkgutil
        log_now(f"Google submodules: {[m.name for m in pkgutil.iter_modules(google.__path__)]}")
    except:
        pass

try:
    from fastapi import FastAPI, HTTPException, Depends, Header, Request
    from fastapi.exceptions import RequestValidationError
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from sqlalchemy.orm import Session
    
    from logic import calculate_recommendation
    from auth import generate_otp, store_otp, send_otp_email, verify_otp_logic, create_access_token, decode_access_token
    from database import init_db, get_db, User, Recommendation
    from policy_service.router import router as policy_router
    log_now("Modules imported successfully.")
except Exception as e:
    log_now(f"FATAL: Module import failed: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

from contextlib import asynccontextmanager

# Initialize Database on Startup using modern lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    log_now("Starting startup lifespan sequence...")
    try:
        log_now("Initializing database...")
        init_db()
        log_now("Database initialized successfully.")
    except Exception as e:
        log_now(f"FATAL: Database initialization failed: {str(e)}")
        traceback.print_exc()
        sys.exit(1)
    
    yield # Application runs here
    
    log_now("--- BACKEND SHUTTING DOWN ---")

app = FastAPI(lifespan=lifespan)

log_now("Configuring CORS...")
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://insurance.emper.ai",
    "https://insurance-api.emper.ai",
]
raw_frontend_url = os.getenv("FRONTEND_URL", "").strip()
if raw_frontend_url:
    # AUTOMATICALLY FIX MISSING PROTOCOL
    if not raw_frontend_url.startswith('http'):
        frontend_url = f"https://{raw_frontend_url}"
    else:
        frontend_url = raw_frontend_url
    
    # Remove trailing slash for Starlette compatibility
    frontend_url = frontend_url.rstrip('/')
    
    origins.append(frontend_url)
    log_now(f"Added CORS origin: {frontend_url}")
else:
    log_now("No FRONTEND_URL found, using defaults.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(policy_router)
log_now(f"CORS configured with origins: {origins}")
log_now("CORS configuration complete.")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    log_now(f"VALIDATION ERROR: {exc.errors()}")
    log_now(f"BODY: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(await request.body())},
    )

class UserData(BaseModel):
    first_name: Optional[str] = ""
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
    age: Optional[int] = 30
    income_level: Optional[str] = ""
    city: Optional[str] = ""

# Dependency to verify JWT
from auth import generate_otp, store_otp, send_otp_email, verify_otp_logic, create_access_token, decode_access_token, get_current_user

@app.get("/")
def read_root():
    return {"message": "Insurance Wizard Backend is Running!"}

@app.post("/api/auth/otp")
async def login(request: LoginRequest):
    email = request.email.lower().strip()
    otp = generate_otp()
    
    # Send email
    success, error_msg = send_otp_email(email, otp)
    if not success:
        raise HTTPException(status_code=500, detail=error_msg)
    
    # Store for verification
    store_otp(email, otp)
    return {"message": "OTP sent successfully"}

@app.post("/api/auth/verify")
async def verify(request: VerifyRequest):
    email = request.email.lower().strip()
    success, message = verify_otp_logic(email, request.otp)
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    # Generate JWT
    token = create_access_token({"sub": email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/recommend")
def get_recommendation(data: UserData, user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    email = user_payload.get("sub")
    
    # Persist or update User data BEFORE calculating (as requested for Phase 1 end)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
    
    user.first_name = data.first_name
    user.dob = data.dob
    user.mobile = data.mobile
    # PROTECT fields that might be missing from the Wizard payload
    if data.secondary_phone: user.secondary_phone = data.secondary_phone
    if data.secondary_email: user.secondary_email = data.secondary_email
    if data.aadhar_number: user.aadhar_number = data.aadhar_number
    user.income_level = data.income_level
    user.city = data.city
    user.gender = data.gender
    user.marital_status = data.marital_status
    user.support_parents = data.support_parents
    user.career_stage = data.career_stage
    user.employment_type = data.employment_type
    user.lifestyle = data.lifestyle
    user.smoking_status = data.smoking_status
    user.family_health_history = data.family_health_history
    user.company_name = data.company_name
    user.industry_type = data.industry_type
    user.num_children = data.num_children
    user.dependents_data = data.dependents
    user.is_smoker = data.is_smoker
    user.has_life_insurance = data.has_life_insurance
    user.existing_life_cover = data.existing_life_cover if data.has_life_insurance else ""
    user.existing_life_cover_val = data.existing_life_cover_val if data.has_life_insurance else 0
    user.has_health_insurance = data.has_health_insurance
    user.existing_health_cover = data.existing_health_cover if data.has_health_insurance else ""
    user.existing_health_cover_val = data.existing_health_cover_val if data.has_health_insurance else 0
    user.health_source = data.health_source if data.has_health_insurance else ""
    user.parents_covered = data.parents_covered if data.has_health_insurance else False
    user.parents_health_cover = data.parents_health_cover if (data.has_health_insurance and data.parents_covered) else ""
    user.parents_health_cover_val = data.parents_health_cover_val if (data.has_health_insurance and data.parents_covered) else 0
    
    # Policy Details
    user.life_provider = data.life_provider if data.has_life_insurance else ""
    user.life_policy_name = data.life_policy_name if data.has_life_insurance else ""
    user.health_provider = data.health_provider if data.has_health_insurance else ""
    user.health_policy_name = data.health_policy_name if data.has_health_insurance else ""
    
    db.commit() # Save user progress before calling potentially slow LLM

    # Calculate recommendation
    result = calculate_recommendation(data.model_dump())
    
    # Save the recommendation
    db_recommendation = Recommendation(
        user=user,
        life_cover=result.get("life_cover"),
        life_cover_val=result.get("life_cover_val"),
        health_cover=result.get("health_cover"),
        health_cover_val=result.get("health_cover_val"),
        persona_name=result.get("persona_name"),
        tagline=result.get("tagline"),
        details=result.get("tagline"), # Fallback
        reasoning=result.get("reasoning"),
        features=result.get("recommended_features"),
        icon=result.get("icon"),
        mode=result.get("mode"),
        prompt_sent=result.get("prompt_sent")
    )
    db.add(db_recommendation)
    db.commit()
    
    # Return result with debug flag
    show_debug = os.getenv("SHOW_DEBUG_INFO", "false").lower() == "true"
    result["show_debug"] = show_debug
    
    return result

@app.post("/api/policy-recommendations")
def get_policy_recommendations(request: PolicyRecommendationRequest, user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    from logic import calculate_policy_recommendations_ai
    result = calculate_policy_recommendations_ai(request.model_dump())
    
    # Persist the Phase 2 recommendations to the latest record
    email = user_payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if user:
        latest_rec = db.query(Recommendation).filter(Recommendation.user_id == user.id).order_by(Recommendation.created_at.desc()).first()
        if latest_rec:
            latest_rec.life_recommendations = result.get("life_recommendations")
            latest_rec.health_recommendations = result.get("health_recommendations")
            db.commit()

    result["show_debug"] = os.getenv("SHOW_DEBUG_INFO", "false").lower() == "true"
    return result

@app.get("/api/user/profile")
def get_user_profile(user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    email = user_payload.get("sub")
    log_now(f"GET profile called for {email}")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        log_now(f"User {email} not found in GET profile")
        return {"message": "User not found"}
    
    log_now(f"Returning profile for {email}: First={user.first_name}, Mobile={user.mobile}, Aadhar={user.aadhar_number}")
    
    # Get all recommendations sorted by most recent first
    all_recs = db.query(Recommendation).filter(Recommendation.user_id == user.id).order_by(Recommendation.created_at.desc()).all()
    
    recs_data = [
        {
            "id": rec.id,
            "life_cover": rec.life_cover,
            "life_cover_val": rec.life_cover_val,
            "health_cover": rec.health_cover,
            "health_cover_val": rec.health_cover_val,
            "persona_name": rec.persona_name,
            "tagline": rec.tagline or rec.details,
            "reasoning": rec.reasoning,
            "recommended_features": rec.features,
            "icon": rec.icon,
            "mode": rec.mode,
            "prompt_sent": rec.prompt_sent,
            "show_debug": os.getenv("SHOW_DEBUG_INFO", "false").lower() == "true",
            "created_at": rec.created_at.isoformat()
        } for rec in all_recs
    ]

    return {
        "email": user.email,
        "profile": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "dob": user.dob,
            "mobile": user.mobile,
            "secondary_phone": user.secondary_phone,
            "secondary_email": user.secondary_email,
            "aadhar_number": user.aadhar_number,
            "income_level": user.income_level,
            "city": user.city,
            "gender": user.gender,
            "marital_status": user.marital_status,
            "support_parents": user.support_parents,
            "career_stage": user.career_stage,
            "employment_type": user.employment_type,
            "lifestyle": user.lifestyle,
            "smoking_status": user.smoking_status,
            "family_health_history": user.family_health_history,
            "dependents": user.dependents_data,
            "num_children": user.num_children,
            "company_name": user.company_name,
            "industry_type": user.industry_type,
            "current_step": user.current_step,
            "has_life_insurance": user.has_life_insurance,
            "existing_life_cover": user.existing_life_cover,
            "existing_life_cover_val": user.existing_life_cover_val,
            "has_health_insurance": user.has_health_insurance,
            "existing_health_cover": user.existing_health_cover,
            "existing_health_cover_val": user.existing_health_cover_val,
            "health_source": user.health_source,
            "parents_covered": user.parents_covered,
            "parents_health_cover": user.parents_health_cover,
            "parents_health_cover_val": user.parents_health_cover_val,
            "life_provider": user.life_provider,
            "life_policy_name": user.life_policy_name,
            "health_provider": user.health_provider,
            "health_policy_name": user.health_policy_name
        },
        "recommendations": recs_data,
        "show_debug": os.getenv("SHOW_DEBUG_INFO", "false").lower() == "true"
    }

@app.post("/api/user/save-progress")
def save_progress(request: ProgressRequest, user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    email = user_payload.get("sub")
    log_now(f"Saving progress for {email} to step {request.current_step}")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        log_now(f"User {email} not found, creating new record.")
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    data = request.formData
    user.first_name = data.first_name
    user.dob = data.dob
    user.mobile = data.mobile
    # PROTECT fields that might be missing from the Wizard payload
    if data.secondary_phone: user.secondary_phone = data.secondary_phone
    if data.secondary_email: user.secondary_email = data.secondary_email
    if data.aadhar_number: user.aadhar_number = data.aadhar_number
    user.income_level = data.income_level
    user.city = data.city
    user.gender = data.gender
    user.marital_status = data.marital_status
    user.support_parents = data.support_parents
    user.career_stage = data.career_stage
    user.employment_type = data.employment_type
    user.lifestyle = data.lifestyle
    user.smoking_status = data.smoking_status
    user.family_health_history = data.family_health_history
    user.company_name = data.company_name
    user.industry_type = data.industry_type
    user.dependents_data = data.dependents
    user.num_children = data.num_children
    user.secondary_phone = data.secondary_phone
    
    # Phase 2 persistence
    user.has_life_insurance = data.has_life_insurance
    user.existing_life_cover = data.existing_life_cover
    user.existing_life_cover_val = data.existing_life_cover_val
    user.has_health_insurance = data.has_health_insurance
    user.existing_health_cover = data.existing_health_cover
    user.existing_health_cover_val = data.existing_health_cover_val
    user.health_source = data.health_source
    user.parents_covered = data.parents_covered
    user.parents_health_cover = data.parents_health_cover
    user.parents_health_cover_val = data.parents_health_cover_val
    user.life_provider = data.life_provider
    user.life_policy_name = data.life_policy_name
    user.health_provider = data.health_provider
    user.health_policy_name = data.health_policy_name
    
    # Update progress
    user.current_step = request.current_step
    
    try:
        db.commit()
        log_now(f"Progress saved successfully for {email}")
    except Exception as e:
        db.rollback()
        log_now(f"Failed to commit progress for {email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
    
    return {"message": "Progress saved successfully"}

class ProfileSyncRequest(BaseModel):
    first_name: Optional[str] = None
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

@app.post("/api/user/sync-profile")
def sync_profile(data: ProfileSyncRequest, user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    email = user_payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
    
    log_now(f"Syncing profile for {email}")
    
    if data.first_name is not None: user.first_name = data.first_name
    if data.dob is not None: user.dob = data.dob
    if data.gender is not None: user.gender = data.gender
    if data.city is not None: user.city = data.city
    if data.mobile is not None: user.mobile = data.mobile
    if data.secondary_phone is not None: user.secondary_phone = data.secondary_phone
    if data.secondary_email is not None: user.secondary_email = data.secondary_email
    if data.aadhar_number is not None: user.aadhar_number = data.aadhar_number
    if data.marital_status is not None: user.marital_status = data.marital_status
    if data.num_children is not None: user.num_children = data.num_children
    if data.income_level is not None: user.income_level = data.income_level
    if data.smoking_status is not None: user.smoking_status = data.smoking_status
    if data.lifestyle is not None: user.lifestyle = data.lifestyle
    if data.employment_type is not None: user.employment_type = data.employment_type
    
    # Coverage data
    if data.existing_life_cover_val is not None:
        user.existing_life_cover_val = data.existing_life_cover_val
        user.has_life_insurance = True
    if data.life_provider is not None: user.life_provider = data.life_provider
    if data.life_policy_name is not None: user.life_policy_name = data.life_policy_name
    
    try:
        if data.existing_health_cover_val is not None:
            user.existing_health_cover_val = data.existing_health_cover_val
            user.has_health_insurance = True
        if data.health_provider: user.health_provider = data.health_provider
        if data.health_policy_name: user.health_policy_name = data.health_policy_name
        
        db.commit()
        log_now(f"Profile synced successfully for {email}")
        return {"message": "Profile synced successfully"}
    except Exception as e:
        db.rollback()
        log_now(f"CRITICAL ERROR during sync_profile for {email}: {str(e)}")
        log_now(f"Data that failed to sync: {data.model_dump()}")
        raise HTTPException(status_code=500, detail=f"Database sync error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use the port assigned by Railway or default to 8000
    port = int(os.getenv("PORT", 8000))
    log_now(f"Starting Uvicorn manual runner on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
