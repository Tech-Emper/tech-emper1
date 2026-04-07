import os
import sys
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User, Recommendation
from auth import get_current_user
from schemas import ProgressRequest, ProfileSyncRequest

router = APIRouter(prefix="/api/user", tags=["users"])

def log_now(msg):
    print(f"--- [USER ROUTER] {msg}", file=sys.stdout, flush=True)

@router.get("/profile")
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
            "insured_members": user.insured_members,
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

@router.post("/save-progress")
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
    user.last_name = data.last_name
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
    user.insured_members = data.insured_members
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


@router.post("/sync-profile")
def sync_profile(data: ProfileSyncRequest, user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    email = user_payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
    
    log_now(f"Syncing profile for {email}")
    
    if data.first_name is not None: user.first_name = data.first_name
    if data.last_name is not None: user.last_name = data.last_name
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
