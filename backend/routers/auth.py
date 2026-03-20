from fastapi import APIRouter, HTTPException
from schemas import LoginRequest, VerifyRequest
from auth import generate_otp, store_otp, send_otp_email, verify_otp_logic, create_access_token

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
async def verify(request: VerifyRequest):
    email = request.email.lower().strip()
    success, message = verify_otp_logic(email, request.otp)
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    # Generate JWT
    token = create_access_token({"sub": email})
    return {"access_token": token, "token_type": "bearer"}
