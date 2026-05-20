import os
import sys
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, User, PortabilityUser
from auth import get_current_user

router = APIRouter(prefix="/api/portability", tags=["portability"])

def log_now(msg):
    print(f"--- [PORTABILITY ROUTER] {msg}", file=sys.stdout, flush=True)

@router.get("/status")
def get_portability_status(user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    email = user_payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return {"message": "User not found", "disclaimer_accepted": False}
        
    portability_user = db.query(PortabilityUser).filter(PortabilityUser.user_id == user.id).first()
    
    accepted = False
    if portability_user:
        accepted = portability_user.disclaimer_accepted
        
    return {
        "disclaimer_accepted": accepted
    }

@router.post("/accept-disclaimer")
def accept_portability_disclaimer(user_payload = Depends(get_current_user), db: Session = Depends(get_db)):
    email = user_payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    portability_user = db.query(PortabilityUser).filter(PortabilityUser.user_id == user.id).first()
    
    if not portability_user:
        portability_user = PortabilityUser(user_id=user.id, disclaimer_accepted=True)
        db.add(portability_user)
    else:
        portability_user.disclaimer_accepted = True
        
    try:
        db.commit()
        return {"message": "Disclaimer accepted successfully"}
    except Exception as e:
        db.rollback()
        log_now(f"Error saving portability disclaimer for {email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
