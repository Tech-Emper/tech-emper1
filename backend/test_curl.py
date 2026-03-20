import requests
import traceback

def test():
    try:
        # Get token
        res = requests.post("http://localhost:8000/api/auth/verify", json={"email": "admin@emper.ai", "otp": "000000"})
        if res.status_code != 200:
            print("Login failed", res.text)
            return
        
        token = res.json()["access_token"]
        
        data = {
            "first_name": "Admin",
            "dob": "1990-01-01",
            "mobile": "9876543210",
            "income_level": "1L-3L",
            "city": "Mumbai",
            "gender": "Male",
            "marital_status": "Single",
            "support_parents": False,
            "career_stage": "Mid",
            "employment_type": "Salaried",
            "lifestyle": "Active",
            "smoking_status": "Never",
            "family_health_history": [],
            "company_name": "",
            "industry_type": "",
            "num_children": 0,
            "dependents": {},
            "is_smoker": False,
            "has_life_insurance": False,
            "has_health_insurance": False
        }
        
        res = requests.post(
            "http://localhost:8000/api/recommend",
            json=data,
            headers={"Authorization": f"Bearer {token}"}
        )
        print("Status:", res.status_code)
        
        # safely print response without crashing on Windows cmd
        # print string as utf-8 bytes
        print("Response:", res.content.decode('utf-8'))
        
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    test()
