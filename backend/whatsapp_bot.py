from sqlalchemy.orm import Session
from database import WhatsAppSession, User, Recommendation
from gupshup_service import send_whatsapp_message
from logic import calculate_recommendation
import json

# Define the sequence of questions
QUESTIONS = [
    {
        "id": "first_name",
        "text": "Welcome to Emper Insurance Wizard! Let's get started. What is your first name?"
    },
    {
        "id": "last_name",
        "text": "What is your last name?"
    },
    {
        "id": "gender",
        "text": "What is your gender? (Reply 1 for Male, 2 for Female, 3 for Other)"
    },
    {
        "id": "city",
        "text": "Which city do you live in?"
    },
    {
        "id": "marital_status",
        "text": "What is your marital status? (Reply 1 for Single, 2 for Married)"
    },
    {
        "id": "dob",
        "text": "What is your Date of Birth? (Format: YYYY-MM-DD, e.g., 1990-05-24)"
    },
    {
        "id": "income_level",
        "text": "What is your approximate annual income? (Reply 1 for <5L, 2 for 5-10L, 3 for 10-20L, 4 for >20L)"
    },
    {
        "id": "smoking_status",
        "text": "Do you smoke? (Reply 1 for Never, 2 for Occasionally, 3 for Regularly)"
    }
]

def map_gender(val: str):
    mapping = {"1": "Male", "2": "Female", "3": "Other"}
    return mapping.get(val.strip(), "Other")

def map_marital(val: str):
    mapping = {"1": "Single", "2": "Married"}
    return mapping.get(val.strip(), "Single")

def map_income(val: str):
    mapping = {"1": "< 5 Lakhs", "2": "5 - 10 Lakhs", "3": "10 - 20 Lakhs", "4": "> 20 Lakhs"}
    return mapping.get(val.strip(), "5 - 10 Lakhs")

def map_smoking(val: str):
    mapping = {"1": "Never", "2": "Occasionally", "3": "Regularly"}
    return mapping.get(val.strip(), "Never")

def advance_conversation(phone_number: str, user_message: str, db: Session):
    # Retrieve or create session
    session = db.query(WhatsAppSession).filter(WhatsAppSession.phone_number == phone_number).first()
    
    if not session:
        session = WhatsAppSession(phone_number=phone_number, current_question_id="START", collected_data={})
        db.add(session)
        db.commit()
    
    current_q_id = session.current_question_id
    
    # Check if they said "Hi" to start/restart
    if user_message.strip().lower() in ['hi', 'hello', 'start', 'restart']:
        session.current_question_id = QUESTIONS[0]["id"]
        session.collected_data = {}
        db.commit()
        send_whatsapp_message(phone_number, QUESTIONS[0]["text"])
        return
        
    # If starting fresh
    if current_q_id == "START":
        session.current_question_id = QUESTIONS[0]["id"]
        db.commit()
        send_whatsapp_message(phone_number, QUESTIONS[0]["text"])
        return

    # Find where we are in the sequence
    q_index = -1
    for i, q in enumerate(QUESTIONS):
        if q["id"] == current_q_id:
            q_index = i
            break
            
    if q_index == -1:
        # Invalid state, restart
        session.current_question_id = QUESTIONS[0]["id"]
        db.commit()
        send_whatsapp_message(phone_number, QUESTIONS[0]["text"])
        return
        
    # Process the answer
    ans = user_message.strip()
    data = dict(session.collected_data)
    
    if current_q_id == "gender":
        ans = map_gender(ans)
    elif current_q_id == "marital_status":
        ans = map_marital(ans)
    elif current_q_id == "income_level":
        ans = map_income(ans)
    elif current_q_id == "smoking_status":
        ans = map_smoking(ans)
        
    data[current_q_id] = ans
    session.collected_data = data
    
    # Move to next question or finish
    next_index = q_index + 1
    if next_index < len(QUESTIONS):
        next_q = QUESTIONS[next_index]
        session.current_question_id = next_q["id"]
        db.commit()
        send_whatsapp_message(phone_number, next_q["text"])
    else:
        # Finished!
        session.current_question_id = "DONE"
        db.commit()
        
        send_whatsapp_message(phone_number, "Thank you! Calculating your personalized insurance recommendation. Please wait a moment...")
        
        # Build user profile and trigger recommendation
        process_and_recommend(phone_number, data, db)

def process_and_recommend(phone_number: str, data: dict, db: Session):
    try:
        # Check if user exists
        user = db.query(User).filter(User.mobile == phone_number).first()
        if not user:
            user = User(mobile=phone_number, email=f"{phone_number}@whatsapp.emper.ai") # placeholder email
            db.add(user)
            
        user.first_name = data.get("first_name", "")
        user.last_name = data.get("last_name", "")
        user.gender = data.get("gender", "")
        user.city = data.get("city", "")
        user.marital_status = data.get("marital_status", "")
        user.dob = data.get("dob", "")
        user.income_level = data.get("income_level", "")
        user.smoking_status = data.get("smoking_status", "")
        user.is_smoker = user.smoking_status != "Never"
        
        db.commit()
        
        # Prepare payload for logic module
        payload = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "gender": user.gender,
            "city": user.city,
            "marital_status": user.marital_status,
            "dob": user.dob,
            "income_level": user.income_level,
            "is_smoker": user.is_smoker,
            "dependents": {},
            "family_health_history": [],
            "smoking_status": user.smoking_status,
            "has_health_insurance": False,
            "has_life_insurance": False
        }
        
        result = calculate_recommendation(payload)
        
        # Save recommendation
        db_rec = Recommendation(
            user=user,
            life_cover=result.get("life_cover"),
            life_cover_val=result.get("life_cover_val"),
            health_cover=result.get("health_cover"),
            health_cover_val=result.get("health_cover_val"),
            persona_name=result.get("persona_name"),
            tagline=result.get("tagline"),
            reasoning=result.get("reasoning")
        )
        db.add(db_rec)
        db.commit()
        
        # Send final message
        final_msg = f"*{result.get('persona_name', 'Your Profile')}*\n_{result.get('tagline', '')}_\n\n"
        final_msg += f"Recommended Health Cover: *{result.get('health_cover', 'N/A')}*\n"
        final_msg += f"Recommended Life Cover: *{result.get('life_cover', 'N/A')}*\n\n"
        final_msg += f"Why? {result.get('reasoning', '')}"
        
        send_whatsapp_message(phone_number, final_msg)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        send_whatsapp_message(phone_number, "Sorry, we encountered an error while calculating your recommendation.")
