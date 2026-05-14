import os
import requests
import json

def send_whatsapp_message(destination_phone: str, message: str):
    """
    Sends a WhatsApp message via Gupshup API.
    """
    api_key = os.getenv("GUPSHUP_API_KEY", "").strip(" \"'")
    app_name = os.getenv("GUPSHUP_APP_NAME", "").strip(" \"'")
    source_number = os.getenv("GUPSHUP_SOURCE_NUMBER", "").strip(" \"'")

    if not api_key or not app_name or not source_number:
        print("--- [GUPSHUP] Missing credentials in .env")
        return False
        
    masked_key = api_key[:4] + "***" + api_key[-4:] if len(api_key) > 8 else "***"
    print(f"--- [GUPSHUP] Using API Key: {masked_key} | App: {app_name}")

    url = "https://api.gupshup.io/wa/api/v1/msg"
    headers = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": api_key
    }
    
    # Gupshup expects the message to be stringified JSON
    message_obj = {
        "type": "text",
        "text": message
    }
    
    payload = {
        "channel": "whatsapp",
        "source": source_number,
        "destination": destination_phone,
        "src.name": app_name,
        "message": json.dumps(message_obj)
    }

    try:
        print(f"--- [GUPSHUP] Sending message to {destination_phone}: {message}")
        response = requests.post(url, headers=headers, data=payload)
        if response.status_code == 200 or response.status_code == 202:
            print("--- [GUPSHUP] Message sent successfully:", response.text)
            return True
        else:
            print(f"--- [GUPSHUP] Failed to send message. Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print(f"--- [GUPSHUP] Exception sending message: {str(e)}")
        return False
