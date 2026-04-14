import os
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from database import SessionLocal, User, Organization
from auth import send_reminder_1_email, send_reminder_2_email

logger = logging.getLogger(__name__)

def check_onboarding_reminders():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        # threshold 1: older than 3 days
        three_days_ago = now - timedelta(days=3)
        # threshold 2: older than 6 days
        six_days_ago = now - timedelta(days=6)
        
        # We need users who have NOT verified OTP, have an onboarding_started_at date
        target_users = db.query(User).filter(
            User.is_otp_verified == False,
            User.onboarding_started_at != None
        ).all()
        
        for user in target_users:
            org = db.query(Organization).filter(Organization.id == user.organization_id).first()
            org_name = org.name if org else "Your Organization"
            
            # Check Reminder 2 (6+ days old)
            if user.onboarding_started_at < six_days_ago and not user.reminder_2_sent:
                logger.info(f"Sending Reminder 2 to {user.email}")
                success, msg = send_reminder_2_email(user.email, user.first_name, org_name)
                if success:
                    user.reminder_2_sent = True
                    user.reminder_1_sent = True # Safety catch
                    db.commit()
            
            # Check Reminder 1 (3+ days old)
            elif user.onboarding_started_at < three_days_ago and not user.reminder_1_sent:
                logger.info(f"Sending Reminder 1 to {user.email}")
                success, msg = send_reminder_1_email(user.email, user.first_name, org_name)
                if success:
                    user.reminder_1_sent = True
                    db.commit()

    except Exception as e:
        logger.error(f"Error in check_onboarding_reminders: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        check_onboarding_reminders,
        trigger=IntervalTrigger(hours=1),
        id="onboarding_reminders_job",
        name="Check and send 3/6 day onboarding email reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Background job scheduler started (Onboarding reminders)")
