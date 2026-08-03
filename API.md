# Insurance Wizard — API Reference

> Complete REST API reference for the Insurance Wizard backend (FastAPI). See also [PROJECT.md](PROJECT.md), [backend/PROJECT.md](backend/PROJECT.md), [frontend/PROJECT.md](frontend/PROJECT.md).

---

## Conventions

- **Base URL:** `<backend-host>` — `http://localhost:8000` (local) or `https://insurance-api.emper.ai` (prod).
- **Content type:** `application/json` unless noted (uploads use `multipart/form-data`).
- **Auth:** protected endpoints require the header `Authorization: Bearer <JWT>`. The JWT is obtained from `POST /api/auth/verify`.
- **Interactive docs:** a running backend auto-serves Swagger UI at `/docs` and ReDoc at `/redoc`.
- **CORS:** the caller's origin must be on the backend allowlist or browsers block the response.

### Endpoint index

| # | Method | Path | Auth | Purpose |
|---|---|---|---|---|
| 1 | POST | `/api/auth/otp` | — | Send login OTP |
| 2 | POST | `/api/auth/verify` | — | Verify OTP, issue JWT |
| 3 | GET | `/api/user/profile` | ✅ | Get profile + recommendation history |
| 4 | POST | `/api/user/save-progress` | ✅ | Save wizard progress |
| 5 | POST | `/api/user/sync-profile` | ✅ | Partial profile update |
| 6 | POST | `/api/recommend` | optional | Generate recommendation |
| 7 | POST | `/api/policy-recommendations` | ✅ | Specific product recs (gap analysis) |
| 8 | POST | `/api/policy/extract-multiple` | ✅ | Extract data from policy PDFs |
| 9 | GET | `/api/superadmin/organizations` | superadmin | List organizations |
| 10 | POST | `/api/superadmin/organizations` | superadmin | Create organization |
| 11 | GET | `/api/superadmin/organizations/{id}/admins` | superadmin | List org admins |
| 12 | PUT | `/api/superadmin/organizations/{id}` | superadmin | Update organization |
| 13 | POST | `/api/superadmin/organizations/{id}/upload` | superadmin | Bulk CSV employee import |
| 14 | GET | `/api/portability/status` | ✅ | Disclaimer status |
| 15 | POST | `/api/portability/accept-disclaimer` | ✅ | Accept disclaimer |
| 16 | POST | `/api/whatsapp/webhook` | — | Inbound WhatsApp messages |
| 17 | GET | `/api/whatsapp/webhook` | — | Webhook verification |
| 18 | GET | `/` | — | Health check |

---

## 1. Authentication — `/api/auth`

### `POST /api/auth/otp`
Generates a 6-digit OTP (5-min expiry, in-memory) and emails it. In non-production, login isn't blocked if email fails.

**Auth:** none
**Request**
```json
{ "email": "user@example.com" }
```
**Response 200**
```json
{ "message": "OTP sent successfully" }
```
**Errors:** `500` — email delivery failed (production only).

---

### `POST /api/auth/verify`
Validates the OTP, creates/looks-up the user, assigns default `no_org`, marks verified, and issues a JWT (HS256, 24h). ⚠️ Non-production accepts **any** OTP.

**Auth:** none
**Request**
```json
{ "email": "user@example.com", "otp": "123456" }
```
**Response 200**
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```
**Errors:** `400` — invalid or expired OTP.

---

## 2. User Profile — `/api/user`

### `GET /api/user/profile`
Returns the profile and all recommendations (newest first).

**Auth:** required
**Request:** none
**Response 200**
```json
{
  "email": "user@example.com",
  "profile": {
    "email": "user@example.com", "first_name": "Priya", "last_name": "", "dob": "1990-05-24",
    "mobile": "98765...", "secondary_phone": "", "secondary_email": "", "aadhar_number": "",
    "income_level": "Standard Tier", "city": "Pune", "gender": "Female",
    "marital_status": "Married", "support_parents": true, "career_stage": "...",
    "employment_type": "Salaried", "lifestyle": "Moderately Active", "smoking_status": "Never",
    "family_health_history": ["Diabetes"], "dependents": {}, "insured_members": {},
    "num_children": 1, "company_name": "...", "industry_type": "...", "current_step": 5,
    "has_life_insurance": false, "existing_life_cover": "", "existing_life_cover_val": 0,
    "has_health_insurance": false, "existing_health_cover": "", "existing_health_cover_val": 0,
    "health_source": "", "parents_covered": false, "parents_health_cover": "",
    "parents_health_cover_val": 0, "life_provider": "", "life_policy_name": "",
    "health_provider": "", "health_policy_name": ""
  },
  "recommendations": [
    {
      "id": 1, "life_cover": "₹1.5 Crore", "life_cover_val": 15000000,
      "health_cover": "₹10 Lakhs", "health_cover_val": 1000000,
      "persona_name": "The Family Anchor", "tagline": "...", "reasoning": "...",
      "recommended_features": [ { "name": "Maternity Benefit", "reason": "..." } ],
      "icon": "🛡️", "mode": "AI", "prompt_sent": "...", "show_debug": false,
      "created_at": "2026-07-14T12:00:00"
    }
  ],
  "show_debug": false
}
```
**Note:** if the user doesn't exist, returns `{ "message": "User not found" }` with status 200.

---

### `POST /api/user/save-progress`
Persists the full wizard form and current step. Creates the user if missing.

**Auth:** required
**Request** (`ProgressRequest`)
```json
{
  "formData": { /* full UserData object — see Appendix A */ },
  "current_step": 6
}
```
**Response 200**
```json
{ "message": "Progress saved successfully" }
```
**Errors:** `500` — database error.

---

### `POST /api/user/sync-profile`
Patch-style update — only non-null fields are applied. Providing a coverage value auto-sets the corresponding `has_*_insurance` flag.

**Auth:** required
**Request** (`ProfileSyncRequest`, all fields optional/nullable)
```json
{
  "first_name": "Priya", "last_name": null, "dob": "1990-05-24", "gender": "Female",
  "city": "Pune", "mobile": "98765...", "secondary_phone": null, "secondary_email": null,
  "aadhar_number": null, "marital_status": "Married", "num_children": 1,
  "income_level": "Standard Tier", "smoking_status": "Never", "lifestyle": "Active",
  "employment_type": "Salaried",
  "existing_life_cover_val": 5000000, "life_provider": "HDFC Life", "life_policy_name": "Click 2 Protect",
  "existing_health_cover_val": 1000000, "health_provider": "Star Health", "health_policy_name": "Family Optima"
}
```
**Response 200**
```json
{ "message": "Profile synced successfully" }
```
**Errors:** `500` — database sync error (detail included).

---

## 3. Recommendations — `/api`

### `POST /api/recommend`
Core engine. Returns a life/health recommendation. Persists the profile and recommendation **only if authenticated**; works anonymously otherwise.

**Auth:** optional
**Request** (`UserData` — see Appendix A). Minimum meaningful fields:
```json
{
  "first_name": "Priya", "dob": "1990-05-24", "gender": "Female", "city": "Pune",
  "income_level": "Standard Tier", "marital_status": "Married", "num_children": 1,
  "support_parents": true, "smoking_status": "Never", "lifestyle": "Moderately Active",
  "family_health_history": ["Diabetes"], "dependents": { "Spouse": true }, "is_smoker": false
}
```
**Response 200**
```json
{
  "life_cover": "₹1.5 Crore", "life_cover_val": 15000000,
  "health_cover": "₹10 Lakhs", "health_cover_val": 1000000,
  "persona_name": "The Family Anchor",
  "tagline": "...", "summary": "...", "reasoning": "...",
  "recommended_features": [
    { "name": "Maternity Benefit", "reason": "..." },
    { "name": "Critical Illness Cover", "reason": "..." }
  ],
  "icon": "🛡️", "mode": "AI", "prompt_sent": "...", "show_debug": false
}
```
**Errors:** `500` — internal error (traceback written to `error_log.txt`).

---

### `POST /api/policy-recommendations`
Phase 2. Computes life/health gaps (recommended − existing) and returns up to 3 specific named products per line; a line with zero gap returns `[]`.

**Auth:** required
**Request** (`PolicyRecommendationRequest`)
```json
{
  "recommended_life_cover": "₹1.5 Crore", "recommended_life_cover_val": 15000000,
  "recommended_health_cover": "₹10 Lakhs", "recommended_health_cover_val": 1000000,
  "recommended_features": ["Critical Illness Cover"],
  "has_life_insurance": true, "existing_life_cover_val": 5000000,
  "life_provider": "LIC", "life_policy_name": "Jeevan Anand",
  "has_health_insurance": true, "existing_health_cover_val": 300000,
  "health_provider": "Star Health", "health_policy_name": "Family Optima", "health_source": "Personal",
  "first_name": "Priya", "last_name": "", "age": 35, "income_level": "Standard Tier", "city": "Pune"
}
```
**Response 200**
```json
{
  "life_recommendations": [
    {
      "product_name": "HDFC Life Click 2 Protect", "provider": "HDFC Life",
      "recommended_cover": "₹1 Crore", "gap_filled": "...", "why_this": "...",
      "key_benefits": ["High sum assured", "Critical illness add-on"]
    }
  ],
  "health_recommendations": [
    {
      "product_name": "HDFC Ergo Optima Restore", "provider": "HDFC Ergo",
      "recommended_cover": "₹7 Lakhs", "feature_match_analysis": "...", "gap_filled": "...",
      "why_this": "...", "key_benefits": ["Restore benefit", "No room rent cap"]
    }
  ],
  "overall_narrative": "...", "prompt_sent": "...", "show_debug": false
}
```

---

## 4. Policy Extraction — `/api/policy`

### `POST /api/policy/extract-multiple`
Extracts structured data from one or more policy documents, processed in parallel. Handles PDF decryption. Files are processed in memory and never stored.

**Auth:** required
**Request:** `multipart/form-data`
- `files` — one or more files (required)
- `passwords` — optional JSON string mapping filename → password, e.g. `{"policy.pdf": "1234"}`

**Response 200** (`BatchExtractionResponse`)
```json
{
  "results": [
    {
      "filename": "policy.pdf", "provider_name": "Star Health", "policy_name": "Family Optima",
      "coverage_amount_val": 1000000, "coverage_amount_str": "10 Lakhs", "currency": "INR",
      "add_ons": [ { "name": "Maternity", "description": "..." } ],
      "expiry_date": "2027-03-01", "premium_amount": 12000.0,
      "is_valid_policy": true, "confidence_score": 0.9, "policy_type": "HEALTH", "is_locked": false,
      "user_hint": {
        "full_name": "Priya Sharma", "dob": "1990-05-24", "gender": "Female",
        "city": "Pune", "marital_status": "Married", "num_children": 1
      }
    }
  ],
  "total_processed": 1, "success_count": 1,
  "aggregated_profile": { "full_name": "Priya Sharma", "dob": "1990-05-24", "gender": "Female",
                          "city": "Pune", "marital_status": "Married", "num_children": 1 },
  "show_debug": false
}
```
- A locked PDF with no password returns a result with `is_locked: true`.
- **Errors:** `400` — no files provided.

---

## 5. Super Admin — `/api/superadmin`
All endpoints require a JWT whose user has `role == "superadmin"` (else `403 Forbidden`).

### `GET /api/superadmin/organizations`
**Response 200**
```json
[ { "id": 1, "name": "Acme Inc", "employees": 42 } ]
```

### `POST /api/superadmin/organizations`
Creates an org, attaches key members, and queues welcome emails.
**Request** (`OrganizationCreate`)
```json
{
  "name": "Acme Inc",
  "admins": [
    { "first_name": "Asha", "last_name": "R", "email": "asha@acme.com",
      "mobile": "98765...", "designation": "HR Head", "role": "HR manager" }
  ]
}
```
**Response 200**
```json
{ "id": 1, "name": "Acme Inc", "employees": 1 }
```
**Errors:** `400` — organization name already exists.

### `GET /api/superadmin/organizations/{org_id}/admins`
**Response 200**
```json
[ { "id": 5, "first_name": "Asha", "last_name": "R", "email": "asha@acme.com",
    "mobile": "98765...", "designation": "HR Head", "role": "HR manager" } ]
```

### `PUT /api/superadmin/organizations/{org_id}`
Renames the org, adds admins, and demotes removed admins to `user`.
**Request** (`OrganizationUpdate`)
```json
{
  "name": "Acme Corp",
  "admins": [ { "first_name": "Ravi", "last_name": "K", "email": "ravi@acme.com",
                "mobile": "99999...", "designation": "Admin", "role": "Admin" } ],
  "removed_admins": [ 7, 9 ]
}
```
**Response 200**
```json
{ "id": 1, "name": "Acme Corp", "employees": 43 }
```
**Errors:** `404` — org not found; `400` — name taken by another org.

### `POST /api/superadmin/organizations/{org_id}/upload`
Bulk employee import via **CSV** (UTF-8). Accepted headers: `email`; `first_name` or `name`; `mobile` or `phone`.
**Request:** `multipart/form-data` with `file` (a `.csv`)
Example CSV:
```csv
email,first_name,mobile
priya@acme.com,Priya,9876543210
rahul@acme.com,Rahul,9876500000
```
**Response 200**
```json
{
  "message": "Successfully processed CSV. Added 2 new users, updated 0 existing users.",
  "organization": { "id": 1, "name": "Acme Inc", "employees": 44 }
}
```
**Errors:** `400` — not a CSV / not UTF-8; `404` — org not found; `500` — DB error.

---

## 6. Portability — `/api/portability`

### `GET /api/portability/status`
**Auth:** required
**Response 200**
```json
{ "disclaimer_accepted": false }
```

### `POST /api/portability/accept-disclaimer`
**Auth:** required
**Request:** none
**Response 200**
```json
{ "message": "Disclaimer accepted successfully" }
```
**Errors:** `404` — user not found; `500` — DB error.

---

## 7. WhatsApp — `/api/whatsapp`

### `POST /api/whatsapp/webhook`
Inbound message handler for Gupshup / Meta Cloud API payloads. Drives the stateful Q&A bot. Always returns 200.
**Auth:** none (called by the messaging provider)
**Response 200**
```json
{ "status": "success" }
```

### `GET /api/whatsapp/webhook`
Provider verification handshake.
**Response 200:** `"Webhook is active"`

---

## 8. Health

### `GET /`
**Response 200**
```json
{ "message": "Insurance Wizard Backend is Running!" }
```

---

## Appendix A — `UserData` model

Shared request body for `POST /api/recommend` and (nested as `formData`) `POST /api/user/save-progress`. All fields optional with defaults.

| Field | Type | Default |
|---|---|---|
| organization_id | int? | null |
| role | str | "user" |
| is_otp_verified | bool | false |
| first_name, last_name | str | "" |
| dob, mobile | str | "" |
| secondary_phone, secondary_email, aadhar_number | str | "" |
| income_level, city, gender | str | "" |
| marital_status | str | "Single" |
| support_parents | bool | false |
| career_stage, employment_type, lifestyle, smoking_status | str | "" |
| family_health_history | list[str] | [] |
| company_name, industry_type | str | "" |
| is_smoker | bool | false |
| dependents | dict[str,bool] | {} |
| num_children | int | 0 |
| insured_members | dict | {} |
| has_life_insurance | bool | false |
| existing_life_cover | str | "" |
| existing_life_cover_val | int | 0 |
| has_health_insurance | bool | false |
| existing_health_cover | str | "" |
| existing_health_cover_val | int | 0 |
| health_source | str | "" |
| parents_covered | bool | false |
| parents_health_cover | str | "" |
| parents_health_cover_val | int | 0 |
| life_provider, life_policy_name | str | "" |
| health_provider, health_policy_name | str | "" |

Source of truth: [backend/schemas.py](backend/schemas.py).

---

## Appendix B — Error format

FastAPI errors return:
```json
{ "detail": "Human-readable message" }
```
Validation errors (`422`) additionally include the offending body:
```json
{ "detail": [ { "loc": ["body","email"], "msg": "field required", "type": "value_error.missing" } ],
  "body": "..." }
```
