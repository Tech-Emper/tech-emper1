from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from database import get_db
from whatsapp_bot import advance_conversation

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

@router.post("/webhook")
async def gupshup_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook endpoint to receive incoming messages from Gupshup.
    """
    try:
        data = await request.json()
        print(f"--- [WEBHOOK RAW DATA] {data}")
        
        # Check if this is an incoming message event (Legacy Gupshup format)
        if data.get("type") == "message":
            payload = data.get("payload", {})
            message_type = payload.get("type")
            
            # We only handle text messages for now
            if message_type == "text":
                sender_phone = payload.get("sender", {}).get("phone")
                user_message = payload.get("payload", {}).get("text", "")
                
                if sender_phone and user_message:
                    print(f"--- [WHATSAPP WEBHOOK] Received message from {sender_phone}: {user_message}")
                    advance_conversation(sender_phone, user_message, db)
                    
        # Check if this is an incoming message event (Meta Cloud API format)
        elif data.get("object") == "whatsapp_business_account":
            for entry in data.get("entry", []):
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    for message in value.get("messages", []):
                        if message.get("type") == "text":
                            sender_phone = message.get("from")
                            user_message = message.get("text", {}).get("body", "")
                            
                            if sender_phone and user_message:
                                print(f"--- [WHATSAPP WEBHOOK] Received message from {sender_phone}: {user_message}")
                                advance_conversation(sender_phone, user_message, db)
                                
        return {"status": "success"}
    except Exception as e:
        print(f"--- [WHATSAPP WEBHOOK] Error processing webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@router.get("/webhook")
def gupshup_webhook_verify():
    """
    In case Gupshup sends a GET request to verify the webhook URL.
    """
    return "Webhook is active"
