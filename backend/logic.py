import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
# Load environment variables from the same directory as this file
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

# ============================================================================
# RULE-BASED LOGIC (Original)
# ============================================================================

def get_city_tier(city_name: str) -> str:
    tier_1 = ["mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai", "kolkata", "pune"]
    tier_2 = ["ahmedabad", "surat", "jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam"]
    
    city = city_name.lower().strip()
    if city in tier_1:
        return "Tier 1"
    elif city in tier_2:
        return "Tier 2"
    return "Tier 3"

def parse_income(income_level: str) -> int:
    # New Tier Mapping
    tier_mapping = {
        "Essential Tier": 400000,
        "Standard Tier": 625000,
        "Enhanced Tier": 1125000,
        "Premium Tier": 2000000,
        "Comprehensive Tier": 3250000,
        "Elite Tier": 5000000
    }
    
    # Check if any tier name is in the string
    for tier, val in tier_mapping.items():
        if tier in income_level:
            return val

    # Old Mapping / Fallback heuristics
    mapping = {
        "<5L": 400000,
        "5-10L": 750000,
        "10-20L": 1500000,
        ">20L": 2500000,
        "Under ₹5 lakhs": 400000,
        "₹5-10 lakhs": 750000,
        "₹10-20 lakhs": 1500000,
        "₹35+ lakhs": 4000000
    }
    return mapping.get(income_level, 500000)

def calculate_age(dob_str: str) -> int:
    try:
        dob = datetime.fromisoformat(dob_str)
        today = datetime.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except (ValueError, TypeError):
        return 30  # Default age if parsing fails

def parse_amount_from_string(amount_str: str) -> int:
    """Safely derive numeric value from Indian currency strings like '₹1 Crore' or '₹50 Lakhs'"""
    if not amount_str:
        return 0
    try:
        # Clean string: remove ₹, commas, spaces
        clean_str = amount_str.replace('₹', '').replace(',', '').strip().lower()
        
        multiplier = 1
        if 'crore' in clean_str or 'cr' in clean_str:
            multiplier = 10000000
            clean_str = clean_str.replace('crore', '').replace('cr', '').strip()
        elif 'lakh' in clean_str or 'l' in clean_str:
            multiplier = 100000
            clean_str = clean_str.replace('lakhs', '').replace('lakh', '').replace('l', '').strip()
            
        # Extract numeric part
        value = float(clean_str)
        return int(value * multiplier)
    except Exception as e:
        print(f"Error parsing amount string '{amount_str}': {e}")
        return 0

def calculate_recommendation_rule(data: dict) -> dict:
    """Updated rule-based recommendation logic for full family structure"""
    income_val = parse_income(data.get("income_level", "<5L"))
    age = calculate_age(data.get("dob", ""))
    city_tier = get_city_tier(data.get("city", ""))
    is_smoker = data.get("is_smoker", False)
    dependents = data.get("dependents", {})
    num_children = data.get("num_children", 0)

    # Life Insurance Rule: 15x-20x Annual Income based on age and dependents
    multiplier = 15
    if age < 35:
        multiplier = 20
    elif age > 50:
        multiplier = 10
        
    # Boost multiplier if they have kids or spouse
    if dependents.get("Spouse") or num_children > 0:
        multiplier += 2
    
    # Smoking impact: Smoker might need more coverage or higher premium (logic-wise we increase coverage requirement)
    if is_smoker:
        # Increase coverage by 20% if smoker
        life_cover_amount = int(income_val * multiplier * 1.2)
    else:
        life_cover_amount = income_val * multiplier
    
    # Health Insurance Rule
    base_health = 500000
    if city_tier == "Tier 1":
        base_health = 1000000
    elif city_tier == "Tier 2":
        base_health = 750000
        
    # family impact
    members_count = 1 # Self
    if dependents.get("Spouse"): members_count += 1
    members_count += num_children
    if dependents.get("Mother"): members_count += 1
    if dependents.get("Father"): members_count += 1
    if dependents.get("Mother-In-Law"): members_count += 1
    if dependents.get("Father-In-Law"): members_count += 1
    
    # Increase health cover based on family members
    if members_count > 1:
        base_health = int(base_health * (1 + (members_count - 1) * 0.3))

    # Format strings
    life_cover_str = f"\u20B9{life_cover_amount/10000000:.1f} Crore" if life_cover_amount >= 10000000 else f"\u20B9{life_cover_amount/100000:.0f} Lakhs"
    health_cover_str = f"\u20B9{base_health/100000:.0f} Lakhs"
    
    details = f"Coverage designed for your profile including {members_count} family members in a {city_tier} city."
    if is_smoker:
        details += " Note: Smoking status affects premium and coverage needs."

    return {
        "life_cover": life_cover_str,
        "life_cover_val": life_cover_amount,
        "health_cover": health_cover_str,
        "health_cover_val": base_health,
        "persona_name": "The Shield Bearer" if dependents.get("Spouse") or num_children > 0 else "The Dynamic Planner",
        "tagline": details,
        "summary": f"Based on your profile, I recommend {life_cover_str} life cover and {health_cover_str} health cover to protect your family's future.",
        "reasoning": f"After analyzing your income of {data.get('income_level')} and family size of {members_count}, I recommend this coverage level to ensure your financial stability.",
        "recommended_features": [
            {"name": "Critical Illness Cover", "reason": "Recommended for long-term health protection."},
            {"name": "No Room Rent Capping", "reason": "Ensures you get any room type during hospitalization."}
        ],
        "icon": "\U0001F680" if life_cover_amount > 10000000 else "\U0001F6E1\uFE0F",
        "prompt_sent": "Rule-based logic used."
    }

def calculate_policy_recommendations_ai(data: dict) -> dict:
    """AI-powered specific policy recommendations based on gaps and existing policy features"""
    try:
        from google.genai import Client
        import json
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        client = Client(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        
        # Format existing health features if possible
        existing_health_info = ""
        if data.get('has_health_insurance'):
            existing_health_info = f"""
Existing Health Policy:
- Provider: {data.get('health_provider')}
- Policy: {data.get('health_policy_name')}
- Source: {data.get('health_source')}
"""
        
        existing_life_info = ""
        if data.get('has_life_insurance'):
            existing_life_info = f"""
Existing Life Policy:
- Provider: {data.get('life_provider')}
- Policy: {data.get('life_policy_name')}
"""
        
        # Calculate gaps
        life_gap_val = max(0, data.get('recommended_life_cover_val', 0) - data.get('existing_life_cover_val', 0))
        health_gap_val = max(0, data.get('recommended_health_cover_val', 0) - data.get('existing_health_cover_val', 0))
        
        life_gap_str = f"\u20B9{life_gap_val/10000000:.1f} Crore" if life_gap_val >= 10000000 else f"\u20B9{life_gap_val/100000:.0f} Lakhs"
        health_gap_str = f"\u20B9{health_gap_val/100000:.0f} Lakhs"

        prompt = f"""You are an expert Indian insurance advisor. Based on the user's profile, gaps identified, and existing policy details, recommend UP TO 3 specific Life Insurance plans and UP TO 3 specific Health Insurance plans available in the Indian market ONLY IF NECESSARY.

CRITICAL MATHEMATICAL RULES:
1. RECOMMEND NEW LIFE POLICIES IF: Gap to Fill in Life Cover ({life_gap_val}) > 0.
   - For each recommended plan, "recommended_cover" MUST be EXACTLY the Gap to Fill amount: {life_gap_str}.
   - If Life Gap is 0, set "life_recommendations" to an empty list [].
2. RECOMMEND NEW HEALTH POLICIES IF: 
   - Gap to Fill in Health Cover ({health_gap_val}) > 0.
   - For each recommended plan, "recommended_cover" MUST be EXACTLY the Gap to Fill amount: {health_gap_str}.
   - OR their current policy likely lacks specific features like Maternity, Critical Illness, etc. In this case, recommend top-up or new plans with at least {health_gap_str} cover.
   - If both amount and features are adequate, set "health_recommendations" to an empty list [].

UNITS REMINDER:
- 1 Crore = 1,00,00,000 (7 Zeros)
- 10 Lakhs = 10,00,000 (6 Zeros)

Provide recommendations in EXACTLY this JSON format (provide UP TO 3 for each list):
{{
  "life_recommendations": [
    {{
      "product_name": "Specific Plan Name (e.g. HDFC Life Click 2 Protect)",
      "provider": "Company Name",
      "recommended_cover": "{life_gap_str}",
      "gap_filled": "Briefly explain how this fills the shortfall.",
      "why_this": "1-2 sentences on why this fits.",
      "key_benefits": ["Benefit 1", "Benefit 2"]
    }}
  ],
  "health_recommendations": [
    {{
      "product_name": "Specific Plan Name (e.g. HDFC Ergo Optima Restore)",
      "provider": "Company Name",
      "recommended_cover": "{health_gap_str}",
      "feature_match_analysis": "Mention missing features like Maternity/OPD if applicable.",
      "gap_filled": "Briefly explain how this fills the shortfall.",
      "why_this": "1-2 sentences on why this fits.",
      "key_benefits": ["Benefit 1", "Benefit 2"]
    }}
  ],
  "overall_narrative": "A personal 2-3 sentence summary of your strategy."
}}

User Context:
- Name: {data.get('first_name', 'User')}
- Recommended Ideal Life Cover: {data.get('recommended_life_cover', 'Not calculated')}
- Existing Life Cover: \u20B9{data.get('existing_life_cover_val', 0)/10000000 if data.get('existing_life_cover_val', 0) >= 10000000 else data.get('existing_life_cover_val', 0)/100000:.1f} {'Cr' if data.get('existing_life_cover_val', 0) >= 10000000 else 'L'}
- SHORTFALL TO BE COVERED (LIFE): {life_gap_str}
- Recommended Ideal Health Cover: {data.get('recommended_health_cover', 'Not calculated')}
- Existing Health Cover: \u20B9{data.get('existing_health_cover_val', 0)/100000:.1f} Lakhs
- SHORTFALL TO BE COVERED (HEALTH): {health_gap_str}
- Recommended Features: {', '.join(data.get('recommended_features', []))}
{existing_health_info}
{existing_life_info}

Be very specific about product names available in India. Use a FIRST-PERSON NARRATIVE."""

        response = client.models.generate_content(model=model_name, contents=prompt)
        response_text = response.text.strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        result["prompt_sent"] = prompt
        return result
        
    except Exception as e:
        import traceback
        print(f"Policy recommendation AI failed: {e}")
        traceback.print_exc()
        # Fallback basic response
        return {
            "life_recommendations": [{
                "product_name": "Premium Term Life Plan",
                "provider": "Leading Indian Insurer",
                "why_this": "I recommend a comprehensive term plan to secure your family's future.",
                "key_benefits": ["High Sum Assured", "Critical Illness Add-on"]
            }],
            "health_recommendations": [{
                "product_name": "Comprehensive Health Guard",
                "provider": "Leading Health Insurer",
                "feature_match_analysis": "This plan provides the comprehensive coverage your profile requires.",
                "why_this": "I suggest this for its wide hospital network and no-claim bonus.",
                "key_benefits": ["Cashless Treatment", "No Room Rent Limit"]
            }],
            "overall_narrative": "I've chosen these plans to ensure you have multiple robust options for your financial safety net."
        }

# ============================================================================
# AI-BASED LOGIC (Gemini)
# ============================================================================

def calculate_recommendation_ai(data: dict) -> dict:
    """AI-powered recommendation using Google Gemini"""
    try:
        from google.genai import Client
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        client = Client(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        
        # Build prompt
        age = data.get('age') or calculate_age(data.get('dob', ''))
        prompt = f"""You are an expert Indian insurance advisor. Based on the following user profile, recommend life and health insurance coverage amounts.
        
        CRITICAL: Use a FIRST-PERSON NARRATIVE (e.g., "I recommend...", "I've analyzed your profile and I believe...", "I suggest...") instead of third-person or collective "we".

Provide a recommendation in EXACTLY this JSON format:
{{
  "life_cover": "\u20B9X Crore" or "\u20B9X Lakhs",
  "life_cover_val": numeric_amount_in_rupees (e.g., 10000000 for 1 Cr, 5000000 for 50L),
  "health_cover": "\u20B9X Lakhs",
  "health_cover_val": numeric_amount_in_rupees (e.g., 1000000 for 10L),
  "persona_name": "A creative title (e.g., The Family Anchor, The Rising Star)",
  "tagline": "A short tagline summary (one sentence).",
  "summary": "A concise 1-2 sentence summary of the core recommendation.",
  "reasoning": "A detailed explanation of WHY these specific cover amounts were chosen based on the user's age, gender, income, smoking status, career stage, and city tier.",
  "recommended_features": [
    {{ "name": "Maternity Benefit", "reason": "Justification based on demographic/life stage." }},
    {{ "name": "Critical Illness Cover", "reason": "Justification based on age/lifestyle." }},
    {{ "name": "No Room Rent Capping", "reason": "Justification based on city tier." }}
  ],
  "icon": "\U0001F680" or "\U0001F6E1\uFE0F" or "\U0001F4BC"
}}

CRITICAL UNIT REMINDER:
- 1 Crore = 1,00,00,000 (1 followed by 7 zeros)
- 10 Lakhs = 10,00,000 (1 followed by 6 zeros)
- 50 Lakhs = 50,00,000 (5 followed by 6 zeros)
Ensure life_cover_val and health_cover_val reflect these absolute rupee values accurately.

User Context:
- Name: {data.get('first_name', 'User')}
- Age: {age}
- Gender: {data.get('gender', 'Not specified')}
- City: {data.get('city', 'Unknown')}
- Annual Income: {data.get('income_level', '<5L')}
- Marital Status: {data.get('marital_status', 'Single')}
- Children: {data.get('num_children', 0)}
- Supports Parents: {'Yes' if data.get('support_parents') else 'No'}
- Career Stage: {data.get('career_stage', 'Building foundation')}
- Employment: {data.get('employment_type', 'Salaried')}
- Lifestyle: {data.get('lifestyle', 'Moderately Active')}
- Smoking Status: {data.get('smoking_status', 'Never')}
- Family Health History: {', '.join(data.get('family_health_history', [])) if data.get('family_health_history') else 'No significant history'}

Be specific and empathetic. Avoid generic advice. Mention the user's specific career stage or family responsibilities."""

        response = client.models.generate_content(model=model_name, contents=prompt)
        response_text = response.text.strip()
        
        # Try to extract JSON from response
        # Sometimes Gemini wraps JSON in markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        
        # Validate and Fix numeric values using our parser as a safety net
        # This prevents AI hallucinations from breaking gap calculations
        if "life_cover" in result:
            expected_val = parse_amount_from_string(result["life_cover"])
            if expected_val > 0 and result.get("life_cover_val", 0) != expected_val:
                print(f"DEBUG: Correcting life_cover_val from {result.get('life_cover_val')} to {expected_val}")
                result["life_cover_val"] = expected_val

        if "health_cover" in result:
            expected_val = parse_amount_from_string(result["health_cover"])
            if expected_val > 0 and result.get("health_cover_val", 0) != expected_val:
                print(f"DEBUG: Correcting health_cover_val from {result.get('health_cover_val')} to {expected_val}")
                result["health_cover_val"] = expected_val

        # Add the prompt to the result for debugging
        result["prompt_sent"] = prompt
        
        return result
        
    except Exception as e:
        import traceback
        error_msg = f"AI recommendation failed: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        print("Falling back to rule-based logic...")
        rule_result = calculate_recommendation_rule(data)
        rule_result["prompt_sent"] = f"{error_msg}. Falling back to rule-based. Original Prompt: {prompt if 'prompt' in locals() else 'Not generated'}"
        return rule_result

# ============================================================================
# MAIN DISPATCHER
# ============================================================================

def calculate_recommendation(data: dict) -> dict:
    """Main entry point - dispatches to AI or Rule based on config"""
    mode = os.getenv("RECOMMENDATION_MODE", "RULE").upper()
    print(f"DEBUG: Recommendation Mode: {mode}")
    
    if mode == "AI":
        print("DEBUG: Calling AI logic...")
        result = calculate_recommendation_ai(data)
    else:
        print("DEBUG: Calling Rule logic...")
        result = calculate_recommendation_rule(data)
    
    print(f"DEBUG: Final Mode in result: {result.get('mode', mode)}")
    
    # Add mode to response for debugging
    result["mode"] = mode
    return result
