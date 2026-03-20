import os
import sys
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User, Recommendation
from auth import get_current_user
from schemas import UserData, PolicyRecommendationRequest

router = APIRouter(prefix="/api", tags=["recommendations"])

def log_now(msg):
    print(f"--- [REC ROUTER] {msg}", file=sys.stdout, flush=True)

@router.post("/recommend")
def get_recommendation(data: UserData, user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        from logic import calculate_recommendation
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
    except Exception as e:
        import traceback
        with open("error_log.txt", "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/policy-recommendations")
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
