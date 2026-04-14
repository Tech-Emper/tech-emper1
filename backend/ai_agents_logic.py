import os
import json
from google.genai import Client
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    # Sanitize the key to ensure no hidden spaces or quotes are passed
    clean_key = api_key.strip().replace('"', '').replace("'", "")
    return Client(api_key=clean_key)

def extract_json_from_response(response_text: str) -> dict:
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()
    return json.loads(response_text)

def format_user_context(data: dict) -> str:
    return f"""
    - Name: {data.get("first_name", "User")} {data.get("last_name", "")}
    - Income Level: {data.get("income_level", "Unknown")}
    - City: {data.get("city", "Unknown")}
    - Age/DOB: {data.get("dob", "Unknown")}
    - Marital Status: {data.get("marital_status", "Single")}
    - Children: {data.get("num_children", 0)}
    - Existing Life Cover: {data.get("existing_life_cover", "None")}
    - Existing Health Cover: {data.get("existing_health_cover", "None")}
    """

def get_financial_plan(profile_data: dict) -> dict:
    try:
        client = get_gemini_client()
        model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        
        prompt = f"""
        You are an expert Indian financial planner. Based on the user's profile below, provide a high-level financial plan.
        Include a savings strategy, investment split (percentages adding up to 100), emergency fund recommendation, and retirement planning advice.
        
        {format_user_context(profile_data)}
        
        Return ONLY valid JSON matching this structure:
        {{
            "savings_plan": "A description of the recommended savings approach.",
            "investment_split": [
                {{"category": "Equity/Mutual Funds", "percentage": 50}},
                {{"category": "Debt/Fixed Deposits", "percentage": 30}},
                {{"category": "Gold/Real Estate", "percentage": 20}}
            ],
            "emergency_fund": "Amount or multiplier recommended (e.g., 6 months of expenses).",
            "retirement_planning": "A short advice on how to start or improve retirement planning."
        }}
        """
        response = client.models.generate_content(model=model_name, contents=prompt)
        return extract_json_from_response(response.text.strip())
    except Exception as e:
        print(f"get_financial_plan error: {e}")
        return {"error": str(e)}

def get_health_risk(profile_data: dict) -> dict:
    try:
        client = get_gemini_client()
        model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        
        prompt = f"""
        You are a health and wellness expert. Based on the user's profile below, provide a health assessment.
        Include a hypothetical Health Risk Score (0 means lowest risk, 100 means highest risk), list 3 healthy habits, and give lifestyle improvement tips.
        
        User Context:
        - Lifestyle: {profile_data.get("lifestyle", "Unknown")}
        - Smoking Status: {profile_data.get("smoking_status", "Never")}
        - Family Health History: {profile_data.get("family_health_history", [])}
        {format_user_context(profile_data)}
        
        Return ONLY valid JSON matching this structure:
        {{
            "health_risk_score": 35,
            "healthy_habits": ["Drink 2L water", "Walk 10k steps daily", "Sleep 7-8 hours"],
            "lifestyle_improvement": "A short paragraph on what they should change specifically based on their lifestyle."
        }}
        """
        response = client.models.generate_content(model=model_name, contents=prompt)
        return extract_json_from_response(response.text.strip())
    except Exception as e:
        print(f"get_health_risk error: {e}")
        return {"error": str(e)}

def get_policy_explainer(profile_data: dict) -> dict:
    try:
        client = get_gemini_client()
        model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        
        prompt = f"""
        You are an insurance expert. Review the user's existing insurance policies below. 
        Explain what they likely cover, list their primary benefits, and identify any critical gaps given their family structure and location.
        
        User Context:
        - Life Provider: {profile_data.get("life_provider", "None")}
        - Life Policy: {profile_data.get("life_policy_name", "None")}
        - Life Cover: {profile_data.get("existing_life_cover", "None")}
        - Health Provider: {profile_data.get("health_provider", "None")}
        - Health Policy: {profile_data.get("health_policy_name", "None")}
        - Health Cover: {profile_data.get("existing_health_cover", "None")}
        {format_user_context(profile_data)}
        
        Return ONLY valid JSON matching this structure:
        {{
            "policy_explanation": "A general summary of what their current portfolio looks like.",
            "benefits": [
                "Benefit of life policy based on its name/type.",
                "Benefit of health policy based on its name/type."
            ],
            "gaps": [
                "Missing critical illness cover.",
                "Cover might be too low for their city tier."
            ]
        }}
        """
        response = client.models.generate_content(model=model_name, contents=prompt)
        return extract_json_from_response(response.text.strip())
    except Exception as e:
        print(f"get_policy_explainer error: {e}")
        return {"error": str(e)}
