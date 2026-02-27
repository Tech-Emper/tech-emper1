import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from main import sync_profile, ProfileSyncRequest, get_db
from database import User, SessionLocal

def test_sync():
    print("Testing sync_profile manually...")
    db = SessionLocal()
    try:
        # Create a test request
        data = ProfileSyncRequest(
            first_name="TestSync",
            mobile="9999988888",
            aadhar_number="123412341234",
            secondary_email="test@sync.com"
        )
        
        # Mock payload
        payload = {"sub": "shiva@emper.ai"} # Using a real-looking email
        
        # Call sync
        result = sync_profile(data, payload, db)
        print(f"Result: {result}")
        
        # Verify in DB
        user = db.query(User).filter(User.email == payload["sub"]).first()
        if user:
            print(f"User in DB: Name={user.first_name}, Mobile={user.mobile}, Aadhar={user.aadhar_number}")
            if user.first_name == "TestSync" and user.aadhar_number == "123412341234":
                print("SUCCESS: Persistence is working at the DB level.")
            else:
                print("FAILURE: Data in DB does not match request.")
        else:
            print("FAILURE: User not found in DB.")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_sync()
