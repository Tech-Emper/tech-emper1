import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

def log_now(msg):
    import sys
    print(f"--- [AUTH LOG] {msg}", file=sys.stdout, flush=True)

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = "HS256"
OTP_EXPIRY_MINUTES = 5
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

# In-memory OTP storage: { email: { "otp": "123456", "expires_at": datetime } }
otp_store = {}

def generate_otp():
    """Generate a 6-digit numeric OTP."""
    return "".join([str(secrets.randbelow(10)) for _ in range(6)])

def send_otp_email(email: str, otp: str):
    """Send OTP to user email via Resend API (Production) or SMTP (Local)."""
    resend_api_key = os.getenv("RESEND_API_KEY")
    log_now(f"Checking for RESEND_API_KEY... Found: {resend_api_key is not None and len(resend_api_key.strip()) > 0}")
    
    # --- PROD: USE RESEND API ---
    if resend_api_key:
        log_now(f"RESEND_API_KEY detected (Length: {len(resend_api_key.strip())}). Attempting to use Resend...")
        try:
            import resend
            resend.api_key = resend_api_key.strip()
            
            log_now("Sending email via Resend API...")
            params = {
                "from": os.getenv("SMTP_FROM_EMAIL", "tech@emper.ai"),
                "to": [email],
                "subject": f"{otp} is your Insurance Wizard verification code",
                "html": f"""
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #6366f1;">Insurance Wizard Authentication</h2>
                        <p>Hello,</p>
                        <p>Your verification code is below. It will expire in {OTP_EXPIRY_MINUTES} minutes.</p>
                        <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">{otp}</span>
                        </div>
                        <p>If you didn't request this code, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #94a3b8;">This is an automated message. Please do not reply.</p>
                    </div>
                </body>
                </html>
                """
            }
            resend.Emails.send(params)
            log_now("Email sent successfully via Resend.")
            return True, "Sent"
        except Exception as e:
            error_msg = str(e)
            log_now(f"CRITICAL: Resend API Error: {error_msg}")
            
            # Specific handling for the domain/recipient restriction
            if "domain is not verified" in error_msg.lower():
                return False, "Resend Error: Please set SMTP_FROM_EMAIL to 'tech@emper.ai' in Railway."
            if "restricted" in error_msg.lower() or "unauthorized" in error_msg.lower():
                return False, "Resend Restriction: You can only send to your own email address until you verify your domain on Resend.com."
            
            # If we have a Resend key, we should NOT fall back to SMTP unless STMP is fully configured.
            # This avoids the "Email server not configured" error which is confusing.
            if not os.getenv("SMTP_HOST"):
                return False, f"Resend API Error: {error_msg}. (SMTP fallback disabled because SMTP_HOST is not set)"
            
            log_now("Falling back to SMTP...")
    
    # --- LOCAL/FALLBACK: USE SMTP ---
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", "tech@emper.ai")

    if not all([smtp_host, smtp_user, smtp_pass]):
        missing = f"host={smtp_host}, user={smtp_user}, pass={'SET' if smtp_pass else 'MISSING'}"
        log_now(f"CRITICAL: SMTP configuration is missing! {missing}")
        return False, f"Email server not configured. {missing}"

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = email
    msg['Subject'] = f"{otp} is your Insurance Wizard verification code"

    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #6366f1;">Insurance Wizard Authentication</h2>
            <p>Hello,</p>
            <p>Your verification code is below. It will expire in {OTP_EXPIRY_MINUTES} minutes.</p>
            <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">{otp}</span>
            </div>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #94a3b8;">This is an automated message. Please do not reply.</p>
        </div>
    </body>
    </html>
    """
    msg.attach(MIMEText(body, 'html'))

    ports_to_try = [smtp_port]
    if smtp_port != 465:
        ports_to_try.append(465)

    last_error = "Unknown Error"
    for port in ports_to_try:
        try:
            if port == 465:
                log_now(f"Connecting to SMTP SSL {smtp_host}:{port}...")
                server = smtplib.SMTP_SSL(smtp_host, port, timeout=10)
            else:
                log_now(f"Connecting to SMTP {smtp_host}:{port}...")
                server = smtplib.SMTP(smtp_host, port, timeout=10)
                server.starttls()
            
            with server:
                log_now(f"SMTP connected on port {port}. Logging in...")
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
                log_now("Email sent successfully.")
            return True, "Sent"
        except smtplib.SMTPAuthenticationError:
            log_now(f"CRITICAL: SMTP Authentication Failed on port {port}. Check your App Password.")
            return False, "SMTP Authentication Failed. Check App Password."
        except Exception as e:
            last_error = str(e)
            log_now(f"Connection failed on port {port}: {last_error}")
            if port == ports_to_try[-1]:
                log_now("All SMTP ports exhausted. Failed to send email.")
                return False, f"Email delivery failed: {last_error}"
            log_now("Attempting fallback to Port 465...")

    return False, f"Email delivery failed: {last_error}"

def store_otp(email: str, otp: str):
    """Store OTP with expiry timestamp."""
    expires_at = datetime.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp_store[email] = {"otp": otp, "expires_at": expires_at}

def verify_otp_logic(email: str, code: str):
    """Verify OTP and check for expiry."""
    data = otp_store.get(email)
    if not data:
        return False, "No OTP found for this email."
    
    if datetime.now() > data["expires_at"]:
        del otp_store[email]
        return False, "OTP has expired."
    
    if data["otp"] != code:
        return False, "Invalid verification code."
    
    # Success
    del otp_store[email]
    return True, "Verified"

def create_access_token(data: dict):
    """Generate JWT token."""
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Dependency to verify JWT
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        log_now("AUTH ERROR: Missing Authorization header")
        raise HTTPException(status_code=401, detail="Missing authorization header")
        
    if not authorization.startswith("Bearer "):
        log_now(f"AUTH ERROR: Invalid header format: {authorization[:20]}...")
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]
    if token == "null" or token == "undefined" or not token:
        log_now(f"AUTH ERROR: Token is literal '{token}'")
        raise HTTPException(status_code=401, detail="Invalid token value")

    payload = decode_access_token(token)
    if not payload:
        log_now("AUTH ERROR: Token decoding failed (expired or invalid signature)")
        raise HTTPException(status_code=401, detail="Token expired or invalid")
        
    return payload
