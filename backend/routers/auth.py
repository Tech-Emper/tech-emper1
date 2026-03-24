from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas import LoginRequest, VerifyRequest
from auth import generate_otp, store_otp, send_otp_email, verify_otp_logic, create_access_token
from database import get_db, User, Organization

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/otp")
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

@router.post("/verify")
def verify(request: VerifyRequest, db: Session = Depends(get_db)):
    email = request.email.lower().strip()
    success, message = verify_otp_logic(email, request.otp)
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    # User Creation & no_org assignment
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create no_org if it doesn't exist
        no_org = db.query(Organization).filter(Organization.name == "no_org").first()
        if not no_org:
            no_org = Organization(name="no_org")
            db.add(no_org)
            db.commit()
            db.refresh(no_org)
            
        user = User(
            email=email,
            organization_id=no_org.id,
            is_otp_verified=True,
            role="superadmin" if email == "tech@emper.ai" else "user"
        )
        db.add(user)
        db.commit()
    else:
        # If user exists but no org, assign to no_org
        if not user.organization_id:
            no_org = db.query(Organization).filter(Organization.name == "no_org").first()
            if not no_org:
                no_org = Organization(name="no_org")
                db.add(no_org)
                db.commit()
                db.refresh(no_org)
            user.organization_id = no_org.id
            
        if email == "tech@emper.ai" and user.role != "superadmin":
            user.role = "superadmin"
        
        user.is_otp_verified = True
        db.commit()
    
    # Generate JWT
    token = create_access_token({"sub": email})
    return {"access_token": token, "token_type": "bearer"}
