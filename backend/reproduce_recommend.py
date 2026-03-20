import traceback
from fastapi.testclient import TestClient
from main import app
from schemas import UserData

client = TestClient(app)

def test_api():
    try:
        # We need a valid token to bypass 401. Let's mock a token or use the auth override if available.
        # Actually, if we just pass a valid token... wait, user is logging in with admin@emper.ai.
        
        # Let's perform a login to get a token
        login_res = client.post("/api/auth/verify", json={"email": "admin@emper.ai", "otp": "000000"})
        if login_res.status_code != 200:
            print("Login failed:", login_res.text)
            return
            
        token = login_res.json()["access_token"]
        
        # Now hit recommend
        data = UserData(
            first_name="Admin",
            dob="1990-01-01",
            mobile="9876543210",
            income_level="1L-3L",
            city="Mumbai",
            gender="Male",
        ).model_dump()
        
        res = client.post(
            "/api/recommend",
            json=data,
            headers={"Authorization": f"Bearer {token}"}
        )
        print("STATUS:", res.status_code)
        print("BODY:", res.text)
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    test_api()
