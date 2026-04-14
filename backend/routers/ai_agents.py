from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User
from auth import get_current_user
from schemas import UserData
from ai_agents_logic import get_financial_plan, get_health_risk, get_policy_explainer

router = APIRouter(prefix="/api/ai-agents", tags=["ai_agents"])

def get_user_profile(user_payload, db: Session) -> dict:
    email = user_payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Dump user to dict for AI context
    profile_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "dob": user.dob,
        "mobile": user.mobile,
        "income_level": user.income_level,
        "city": user.city,
        "gender": user.gender,
        "marital_status": user.marital_status,
        "num_children": user.num_children,
        "support_parents": user.support_parents,
        "career_stage": user.career_stage,
        "employment_type": user.employment_type,
        "lifestyle": user.lifestyle,
        "smoking_status": user.smoking_status,
        "family_health_history": user.family_health_history,
        "has_life_insurance": user.has_life_insurance,
        "existing_life_cover": user.existing_life_cover,
        "has_health_insurance": user.has_health_insurance,
        "existing_health_cover": user.existing_health_cover,
        "life_provider": user.life_provider,
        "life_policy_name": user.life_policy_name,
        "health_provider": user.health_provider,
        "health_policy_name": user.health_policy_name
    }
    return profile_data

@router.get("/financial-planning")
def financial_planning_agent(user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = get_user_profile(user_payload, db)
    result = get_financial_plan(profile_data)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/health-risk")
def health_risk_agent(user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = get_user_profile(user_payload, db)
    result = get_health_risk(profile_data)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/policy-explainer")
def policy_explainer_agent(user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = get_user_profile(user_payload, db)
    result = get_policy_explainer(profile_data)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
