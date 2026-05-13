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

def _send_email_base(email: str, subject: str, html_content: str):
    resend_api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("SMTP_FROM_EMAIL", "tech@emper.ai")

    # --- PROD: USE RESEND API ---
    if resend_api_key:
        try:
            import resend
            resend.api_key = resend_api_key.strip()
            params = {
                "from": from_email,
                "to": [email],
                "subject": subject,
                "html": html_content
            }
            resend.Emails.send(params)
            return True, "Sent"
        except Exception as e:
            error_msg = str(e)
            log_now(f"CRITICAL: Resend API Error: {error_msg}")
            if not os.getenv("SMTP_HOST"):
                return False, f"Resend API Error: {error_msg}."

    # --- LOCAL/FALLBACK: USE SMTP ---
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")

    if not all([smtp_host, smtp_user, smtp_pass]):
        return False, "Email server not configured."

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html'))

    ports_to_try = [smtp_port]
    if smtp_port != 465:
        ports_to_try.append(465)

    for port in ports_to_try:
        try:
            if port == 465:
                server = smtplib.SMTP_SSL(smtp_host, port, timeout=10)
            else:
                server = smtplib.SMTP(smtp_host, port, timeout=10)
                server.starttls()
            
            with server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            return True, "Sent"
        except Exception as e:
            if port == ports_to_try[-1]:
                return False, f"Email delivery failed: {str(e)}"
    
    return False, "Failed"

def send_welcome_email(email: str, first_name: str, org_name: str):
    """Send welcome email to newly imported users."""
    first_name_display = first_name if first_name else "Employee"
    subject = f"{org_name} is introducing a new insurance offerings for employees"
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hello {first_name_display},</p>
        <p>At <strong>{org_name}</strong>, we believe that when our people feel secure about their future, they can focus on doing their best work today.</p>
        <p>Your health, your family’s wellbeing, and your financial protection matter to us. That’s why {org_name} has partnered with Emper to help you build complete insurance coverage for you and your family.</p>
        <p>When your insurance needs are taken care of, you can stay focused on what really matters—growing in your career, achieving your goals, and building a bright future.</p>
        <p><strong>What you can do with Emper</strong></p>
        <p>To start with, the platform will help you:</p>
        <ul>
            <li>Port your existing health insurance to better plans while preserving benefits</li>
            <li>Strengthen your health coverage with add-ons like super top-ups and riders</li>
        </ul>
        <p><em>Launching soon are more protection options, including life insurance, pet insurance, and other policies</em></p>
        <div style="margin: 30px 0;">
            <a href="https://demo.emper.ai/welcome" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">👉 Activate your personalized insurance experience</a>
        </div>
        <p>It only takes a few minutes to get started.</p>
        <p>Warm regards,<br/>Team {org_name}</p>
    </body>
    </html>
    """
    return _send_email_base(email, subject, html_content)

def send_reminder_1_email(email: str, first_name: str, org_name: str):
    """Send reminder 1 (3 days)"""
    first_name_display = first_name if first_name else "Employee"
    subject = "Reminder: Access personalized insurance advisory from Emper"
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hello {first_name_display},</p>
        <p>Last week we shared that <strong>{org_name}</strong> has partnered with Emper to help employees build complete insurance coverage for themselves and their families.</p>
        <p>If you haven’t had a chance yet, we encourage you to take a few minutes to explore it.</p>
        <p>With Emper, you can:</p>
        <ul>
            <li>Port your existing health insurance to better plans while preserving benefits</li>
            <li>Strengthen your health coverage with add-ons like super top-ups and riders</li>
            <li>Soon access more protection options, including life insurance, pet insurance, and other policies</li>
        </ul>
        <p>It only takes a few minutes to understand your current coverage and see if there are any gaps.</p>
        <div style="margin: 30px 0;">
            <a href="https://demo.emper.ai/welcome" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">👉 Activate your personalized insurance experience</a>
        </div>
        <p>Warm regards,<br/>Team {org_name}</p>
    </body>
    </html>
    """
    return _send_email_base(email, subject, html_content)

def send_reminder_2_email(email: str, first_name: str, org_name: str):
    """Send reminder 2 (6 days)"""
    first_name_display = first_name if first_name else "Employee"
    subject = "Don’t forget to check your insurance coverage"
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hello {first_name_display},</p>
        <p>A quick reminder about the insurance platform that we introduced in partnership with Emper.</p>
        <p>Many employees have already started using the platform to review their coverage and explore ways to strengthen protection for themselves and their families.</p>
        <p>If you haven’t had the chance yet, we encourage you to take a few minutes to check your coverage.</p>
        <p>With Emper, you can:</p>
        <ul>
            <li>Port your existing health insurance to better plans</li>
            <li>Add important health riders and super top-ups</li>
        </ul>
        <p><em>Additional protection options like life insurance and pet insurance will also be launching soon.</em></p>
        <div style="margin: 30px 0;">
            <a href="https://demo.emper.ai/welcome" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">👉 Activate your personalized insurance experience</a>
        </div>
        <p>The process takes just a few minutes.</p>
        <p>Warm regards,<br/>Team {org_name}</p>
    </body>
    </html>
    """
    return _send_email_base(email, subject, html_content)

def store_otp(email: str, otp: str):
    """Store OTP with expiry timestamp."""
    expires_at = datetime.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp_store[email] = {"otp": otp, "expires_at": expires_at}

def verify_otp_logic(email: str, code: str):
    """Verify OTP and check for expiry."""
    # Local Environment Bypass (accepts any OTP)
    # UNCOMMENT THE BELOW BLOCK TO BYPASS OTP LOCALLY DURING TESTING
    if os.getenv("ENVIRONMENT", "local").lower() != "production":
        log_now(f"Local bypass triggered: accepting OTP {code} for {email}")
        if email in otp_store:
            del otp_store[email]
        return True, "Verified"

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
