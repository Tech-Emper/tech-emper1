# Insurance Wizard — Backend Documentation

> Technical reference for the **backend** service of the Insurance Wizard ("Emper") platform — an AI-powered insurance recommendation engine for the Indian market.

---

## 1. Overview

The backend is a **FastAPI (Python)** REST API that powers:

- **Passwordless authentication** via email OTP + JWT.
- **AI-driven insurance recommendations** (life & health cover) using Google Gemini, with a deterministic rule-based fallback.
- **Gap analysis** and **specific product recommendations** (Phase 2).
- **Policy document extraction** — reads uploaded PDFs (incl. password-protected) with Gemini multimodal.
- **B2B multi-tenant management** — organizations, admins, and bulk employee import (Super Admin).
- **Insurance portability** disclaimer tracking.
- **WhatsApp conversational bot** (via Gupshup) that runs a reduced wizard over chat.
- **Automated email lifecycle** — OTP, welcome, and 3/6-day onboarding reminders.

---

## 2. Technology Stack

| Concern | Technology |
|---|---|
| Language | Python 3.10+ |
| Web framework | FastAPI `0.115.6` |
| ASGI server | Uvicorn |
| ORM | SQLAlchemy |
| Validation / schemas | Pydantic v2 (`pydantic-settings`) |
| Database | PostgreSQL (production, via `psycopg2-binary`) / SQLite (local) |
| AI | Google Gemini via `google-genai` SDK (default model `gemini-1.5-flash`) |
| Email | Resend API (production) + `smtplib`/Gmail SMTP (local fallback) |
| PDF handling | `pikepdf` (decryption) + Gemini multimodal (extraction) |
| Background jobs | APScheduler |
| Auth tokens | `PyJWT` (HS256) |
| File uploads | `python-multipart` |
| HTTP client (tests) | `httpx` |
| Testing | `pytest`, `pytest-asyncio` |

Full list in [requirements.txt](requirements.txt).

---

## 3. Project Structure

```
backend/
├── main.py                 # App entry point, lifespan, CORS, router registration
├── auth.py                 # OTP generation, JWT, email sending (Resend/SMTP), reminders
├── database.py             # SQLAlchemy engine, ORM models, init_db + auto-migration
├── logic.py                # Recommendation engine (AI + rule-based dispatcher)
├── schemas.py              # Pydantic request/response models
├── scheduler.py            # APScheduler job for onboarding reminder emails
├── whatsapp_bot.py         # Stateful WhatsApp Q&A conversation engine
├── gupshup_service.py      # Gupshup WhatsApp send-message client
├── requirements.txt
├── Procfile                # web: uvicorn main:app --host 0.0.0.0 --port $PORT
├── .env / .env.example     # Environment configuration
├── routers/
│   ├── auth.py             # /api/auth  — OTP login + verify
│   ├── users.py            # /api/user  — profile, save-progress, sync-profile
│   ├── recommendations.py  # /api       — recommend + policy-recommendations
│   ├── superadmin.py       # /api/superadmin — org & employee management
│   ├── portability.py      # /api/portability — disclaimer status/accept
│   └── whatsapp.py         # /api/whatsapp — Gupshup webhook
├── policy_service/
│   ├── router.py           # /api/policy — multi-file extraction endpoint
│   ├── engine.py           # PolicyEngine: PDF decrypt + Gemini extraction
│   └── schemas.py          # Pydantic models for extraction results
└── data/                   # Local SQLite DB (dev only)
```

---

## 4. Running the Backend

### Local development
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows  (source venv/bin/activate on *nix)
pip install -r requirements.txt
# create .env from .env.example
uvicorn main:app --reload --port 8000
```
- With no `DATABASE_URL`, it auto-creates SQLite at `backend/data/insurance_wizard.db`.
- Interactive API docs: **`http://localhost:8000/docs`** (Swagger) and **`/redoc`**.

### Production (Render)
Started via `uvicorn main:app --host 0.0.0.0 --port $PORT` against a managed PostgreSQL instance. See [../render.yaml](../render.yaml).

---

## 5. Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | If absent → SQLite. `postgres://` auto-rewritten to `postgresql://`. |
| `GEMINI_API_KEY` | Google Gemini API key | Required for AI mode & PDF extraction. |
| `GEMINI_MODEL` | Model name | Default `gemini-1.5-flash`. |
| `RECOMMENDATION_MODE` | `AI` or `RULE` | Prod = `AI`. Dispatches recommendation logic. |
| `JWT_SECRET` | JWT signing key (HS256) | Auto-generated in prod. Fallback default exists — override in prod. |
| `ENVIRONMENT` | `local` / `production` | ⚠️ Non-production **bypasses OTP** (accepts any code). |
| `FRONTEND_URL` | Allowed CORS origin | Appended to the CORS allowlist. |
| `RESEND_API_KEY` | Resend email API key | If set → email via Resend; else SMTP. |
| `SMTP_FROM_EMAIL` | "From" address | Default `tech@emper.ai`. |
| `SMTP_HOST` / `SMTP_PORT` | SMTP server | e.g. `smtp.gmail.com` / `587`. |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | SMTP creds | Gmail App Password. |
| `GUPSHUP_API_KEY` / `GUPSHUP_APP_NAME` / `GUPSHUP_SOURCE_NUMBER` | WhatsApp (Gupshup) | Not in render.yaml — set manually if used. |
| `SHOW_DEBUG_INFO` | `true`/`false` | Adds `prompt_sent`/debug flags to responses. |

---

## 6. Application Bootstrap — `main.py`

- Uses FastAPI **`lifespan`** context manager: on startup calls `init_db()` then `start_scheduler()`; logs shutdown.
- **CORS**: allowlist = `localhost:5173/5174` + `FRONTEND_URL` (auto-adds `https://`, strips trailing slash). `allow_credentials=True`, all methods/headers. *(Note: the deployed `deployment` branch additionally hardcodes `insurance.emper.ai` and `insurance-api.emper.ai`.)*
- Registers 7 routers (policy, auth, users, recommendations, superadmin, portability, whatsapp).
- Custom `RequestValidationError` handler returns the offending body for 422 debugging.
- `GET /` health check → `{"message": "Insurance Wizard Backend is Running!"}`.

---

## 7. Database

### Engine selection — `database.py`
- `DATABASE_URL` present → PostgreSQL (rewrites `postgres://` → `postgresql://`).
- Absent → SQLite at `backend/data/insurance_wizard.db` (`check_same_thread=False`).
- `get_db()` yields a session per-request (FastAPI dependency).

### Auto-migration
`init_db()` runs `create_all()` then **inspects every table and `ALTER TABLE ADD COLUMN`** for any model column missing in the DB (with sensible defaults). ⚠️ There is **no Alembic**; this custom mechanism only *adds* columns — it cannot rename, drop, or change types.

### Schema

**`organizations`**
| Column | Type | Notes |
|---|---|---|
| id | Integer | PK, indexed |
| name | String | unique, indexed, not null |
| created_at | DateTime | default utcnow |

**`users`** (primary profile entity)
| Column | Type | Notes |
|---|---|---|
| id | Integer | PK, indexed |
| organization_id | Integer | FK → organizations.id, indexed |
| email | String | unique, indexed |
| role | String | `user` / `Admin` / `HR manager` / `superadmin` |
| password_hash | String | reserved (unused) |
| is_otp_verified | Boolean | |
| first_name, last_name, dob, mobile | String | |
| secondary_phone, secondary_email, aadhar_number | String | |
| income_level, city, gender, marital_status | String | |
| support_parents | Boolean | |
| career_stage, employment_type, lifestyle, smoking_status | String | |
| family_health_history | JSON | list of conditions |
| company_name, industry_type, designation | String | |
| has_life_insurance / has_health_insurance | Boolean | gap-analysis |
| existing_life_cover / existing_health_cover | String | e.g. "₹50 Lakhs" |
| existing_life_cover_val / existing_health_cover_val | Integer | numeric rupees |
| health_source | String | Employer/Personal/Both |
| parents_covered | Boolean | |
| parents_health_cover / parents_health_cover_val | String / Integer | |
| life_provider, life_policy_name, health_provider, health_policy_name | String | existing policies |
| dependents_data | JSON | dependents structure |
| insured_members | JSON | self/spouse/children/parents + ages |
| num_children | Integer | |
| is_smoker | Boolean | |
| current_step | Integer | wizard resume point |
| onboarding_started_at | DateTime | arms reminders |
| reminder_1_sent / reminder_2_sent | Boolean | |
| created_at | DateTime | |

**`recommendations`**
| Column | Type | Notes |
|---|---|---|
| id | Integer | PK, indexed |
| user_id | Integer | FK → users.id (not explicitly indexed) |
| life_cover / health_cover | String | display strings |
| life_cover_val / health_cover_val | Integer | numeric rupees |
| persona_name, tagline, details, reasoning | String | |
| features | JSON | recommended features |
| icon | String | emoji |
| prompt_sent | String | LLM prompt (debug) |
| mode | String | `AI` / `RULE` |
| life_recommendations / health_recommendations | JSON | Phase 2 product arrays |
| created_at | DateTime | |

**`portability_users`**
| Column | Type | Notes |
|---|---|---|
| id | Integer | PK |
| user_id | Integer | FK → users.id, unique, indexed |
| disclaimer_accepted | Boolean | |
| created_at | DateTime | |

**`whatsapp_sessions`**
| Column | Type | Notes |
|---|---|---|
| phone_number | String | PK, indexed |
| current_question_id | String | FSM state (default `START`) |
| collected_data | JSON | answers collected so far |
| updated_at | DateTime | auto-updated |

### Indexing summary
Indexed: all PKs, `organizations.name`, `users.email`, `users.organization_id`, `portability_users.user_id`, `whatsapp_sessions.phone_number`. **`recommendations.user_id` is not indexed** (FKs are not auto-indexed in Postgres) — a candidate for optimization.

---

## 8. Recommendation Engine — `logic.py`

`calculate_recommendation(data)` is the dispatcher; reads `RECOMMENDATION_MODE`:

- **`calculate_recommendation_rule(data)`** — deterministic: life cover = 10–20× income (multiplier by age/dependents/smoker), health cover scales by city tier (Tier 1/2/3) + family size.
- **`calculate_recommendation_ai(data)`** — builds a detailed prompt with the profile, calls Gemini, extracts JSON (strips markdown fences), and applies a **hallucination guardrail** (`parse_amount_from_string` re-derives numeric values from display strings). Falls back to rule-based on any error.
- **`calculate_policy_recommendations_ai(data)`** — Phase 2: computes life/health gaps (recommended − existing) and asks Gemini for up to 3 specific named Indian products per line, pinned to the gap amount.

Helpers: `get_city_tier`, `parse_income` (tier mapping), `calculate_age`, `parse_amount_from_string` (parses "₹1 Crore"/"₹50 Lakhs").

---

## 9. Policy Document Extraction — `policy_service/`

- **`PolicyEngine`** (singleton) initialized with `GEMINI_API_KEY`.
- `extract_details(bytes, filename, mime, password)`:
  1. Detects PDF encryption with `pikepdf`; returns `is_locked=True` if locked and no password; decrypts if password provided.
  2. Sends file **bytes directly to Gemini multimodal** with a structured extraction prompt.
  3. Returns a validated `PolicyExtractionResult`.
- Router runs multiple files **concurrently** via `asyncio.gather`.
- **Files are processed entirely in memory — never persisted to disk or object storage.**

---

## 10. Email System — `auth.py`

Strategy for all emails: **Resend API if `RESEND_API_KEY` is set, else SMTP** (with automatic port 587→465 retry). Functions:
- `send_otp_email` — login OTP.
- `send_welcome_email` — new employee/admin onboarding.
- `send_reminder_1_email` / `send_reminder_2_email` — 3-day / 6-day nudges.

Reminders are driven by **`scheduler.py`** (APScheduler, hourly): finds unverified users with `onboarding_started_at` past 3/6-day thresholds and sends once each (tracked by `reminder_1_sent`/`reminder_2_sent`).

---

## 11. WhatsApp Bot — `whatsapp_bot.py` + `gupshup_service.py`

- Finite-state chatbot; state stored in `whatsapp_sessions` (keyed by phone).
- 8-question script (name, gender, city, marital status, DOB, income, smoking) with numbered-reply mapping.
- On completion, creates/updates a `User` (placeholder email `{phone}@whatsapp.emper.ai`), runs the shared `calculate_recommendation`, saves a `Recommendation`, and replies via Gupshup.
- Webhook (`routers/whatsapp.py`) handles **both** legacy Gupshup and Meta Cloud API payload formats.

---

## 12. Complete API Reference

Base URL: `<backend-host>` (e.g. `http://localhost:8000`). Auth header where required: `Authorization: Bearer <JWT>`.

### 12.1 Authentication — `/api/auth`

#### `POST /api/auth/otp`
Generate & email a 6-digit OTP (5-min expiry, in-memory store).
- **Auth:** none
- **Request:**
```json
{ "email": "user@example.com" }
```
- **Response 200:**
```json
{ "message": "OTP sent successfully" }
```
- **Errors:** `500` if email fails in production.

#### `POST /api/auth/verify`
Verify OTP, create/lookup user, issue JWT (24h). ⚠️ Non-production accepts any OTP.
- **Auth:** none
- **Request:**
```json
{ "email": "user@example.com", "otp": "123456" }
```
- **Response 200:**
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```
- **Errors:** `400` invalid/expired OTP.

### 12.2 User Profile — `/api/user`

#### `GET /api/user/profile`
Full profile + all recommendations (newest first).
- **Auth:** required
- **Request:** none
- **Response 200:**
```json
{
  "email": "user@example.com",
  "profile": { "first_name": "...", "dob": "...", "city": "...", "income_level": "...",
               "dependents": {}, "insured_members": {}, "current_step": 5,
               "has_life_insurance": false, "existing_life_cover_val": 0, "...": "..." },
  "recommendations": [
    { "id": 1, "life_cover": "₹1 Crore", "life_cover_val": 10000000,
      "health_cover": "₹10 Lakhs", "health_cover_val": 1000000, "persona_name": "...",
      "tagline": "...", "reasoning": "...", "recommended_features": [], "icon": "🛡️",
      "mode": "AI", "created_at": "2026-..." }
  ],
  "show_debug": false
}
```
- If user missing → `{ "message": "User not found" }` (still 200).

#### `POST /api/user/save-progress`
Persist full wizard form + current step.
- **Auth:** required
- **Request** (`ProgressRequest`):
```json
{ "formData": { /* UserData — see 12.6 */ }, "current_step": 6 }
```
- **Response 200:** `{ "message": "Progress saved successfully" }`
- **Errors:** `500` DB error.

#### `POST /api/user/sync-profile`
Patch-style update (only non-null fields applied). Setting a coverage value auto-flags `has_*_insurance`.
- **Auth:** required
- **Request** (`ProfileSyncRequest`, all optional/nullable):
```json
{ "first_name": "Priya", "dob": "1990-05-24", "city": "Pune", "marital_status": "Married",
  "num_children": 1, "existing_life_cover_val": 5000000, "life_provider": "HDFC Life",
  "existing_health_cover_val": 1000000, "health_provider": "Star Health" }
```
- **Response 200:** `{ "message": "Profile synced successfully" }`
- **Errors:** `500` DB error.

### 12.3 Recommendations — `/api`

#### `POST /api/recommend`
Core engine. Returns life/health recommendation. Persists profile + recommendation **only if authenticated**.
- **Auth:** optional (works anonymously)
- **Request** (`UserData` — see 12.6). Key fields: `first_name, dob, gender, city, income_level, marital_status, num_children, support_parents, smoking_status, lifestyle, family_health_history, dependents, is_smoker`.
- **Response 200:**
```json
{
  "life_cover": "₹1.5 Crore", "life_cover_val": 15000000,
  "health_cover": "₹10 Lakhs", "health_cover_val": 1000000,
  "persona_name": "The Family Anchor", "tagline": "...", "summary": "...", "reasoning": "...",
  "recommended_features": [ { "name": "Maternity Benefit", "reason": "..." } ],
  "icon": "🛡️", "mode": "AI", "prompt_sent": "...", "show_debug": false
}
```
- **Errors:** `500` (writes traceback to `error_log.txt`).

#### `POST /api/policy-recommendations`
Phase 2 gap analysis → up to 3 specific named products per line.
- **Auth:** required
- **Request** (`PolicyRecommendationRequest`):
```json
{ "recommended_life_cover_val": 15000000, "existing_life_cover_val": 5000000,
  "recommended_health_cover_val": 1000000, "existing_health_cover_val": 300000,
  "recommended_features": ["Critical Illness Cover"],
  "has_life_insurance": true, "life_provider": "LIC",
  "has_health_insurance": true, "health_provider": "Star Health",
  "first_name": "Priya", "age": 35, "income_level": "...", "city": "Pune" }
```
- **Response 200:**
```json
{
  "life_recommendations": [
    { "product_name": "HDFC Life Click 2 Protect", "provider": "HDFC Life",
      "recommended_cover": "₹1 Crore", "gap_filled": "...", "why_this": "...",
      "key_benefits": ["..."] }
  ],
  "health_recommendations": [
    { "product_name": "...", "provider": "...", "recommended_cover": "...",
      "feature_match_analysis": "...", "gap_filled": "...", "why_this": "...", "key_benefits": ["..."] }
  ],
  "overall_narrative": "...", "prompt_sent": "...", "show_debug": false
}
```
- Empty list `[]` for a line when its gap is 0.

### 12.4 Policy Extraction — `/api/policy`

#### `POST /api/policy/extract-multiple`
Extract structured data from one or more policy documents (parallel).
- **Auth:** required
- **Request:** `multipart/form-data`
  - `files`: one or more files (required)
  - `passwords`: optional JSON string `{"file.pdf": "1234"}`
- **Response 200** (`BatchExtractionResponse`):
```json
{
  "results": [
    { "filename": "policy.pdf", "provider_name": "Star Health", "policy_name": "Family Optima",
      "coverage_amount_val": 1000000, "coverage_amount_str": "10 Lakhs", "currency": "INR",
      "add_ons": [ { "name": "...", "description": "..." } ], "expiry_date": "2027-03-01",
      "premium_amount": 12000, "is_valid_policy": true, "confidence_score": 0.9,
      "policy_type": "HEALTH", "is_locked": false,
      "user_hint": { "full_name": "...", "dob": "...", "gender": "...", "city": "...",
                     "marital_status": "...", "num_children": 1 } }
  ],
  "total_processed": 1, "success_count": 1,
  "aggregated_profile": { "full_name": "...", "dob": "...", "city": "..." },
  "show_debug": false
}
```
- Locked PDF without password → result with `is_locked: true`.
- **Errors:** `400` no files.

### 12.5 Super Admin — `/api/superadmin`
All require JWT with `role == "superadmin"` (else `403`).

#### `GET /api/superadmin/organizations`
- **Response:** `[ { "id": 1, "name": "Acme Inc", "employees": 42 } ]`

#### `POST /api/superadmin/organizations`
Create org + attach admins + queue welcome emails.
- **Request** (`OrganizationCreate`):
```json
{ "name": "Acme Inc",
  "admins": [ { "first_name": "Asha", "last_name": "R", "email": "asha@acme.com",
                "mobile": "98765...", "designation": "HR Head", "role": "HR manager" } ] }
```
- **Response:** `{ "id": 1, "name": "Acme Inc", "employees": 1 }`
- **Errors:** `400` duplicate name.

#### `GET /api/superadmin/organizations/{org_id}/admins`
- **Response:** `[ { "id": 5, "first_name": "Asha", "last_name": "R", "email": "...", "mobile": "...", "designation": "...", "role": "HR manager" } ]`

#### `PUT /api/superadmin/organizations/{org_id}`
Rename, add admins, demote removed admins to `user`.
- **Request** (`OrganizationUpdate`):
```json
{ "name": "Acme Corp",
  "admins": [ { "first_name": "...", "email": "...", "mobile": "...", "role": "Admin" } ],
  "removed_admins": [ 7, 9 ] }
```
- **Response:** `{ "id": 1, "name": "Acme Corp", "employees": 43 }`
- **Errors:** `404` not found, `400` name taken.

#### `POST /api/superadmin/organizations/{org_id}/upload`
Bulk employee import via **CSV** (UTF-8). Headers accepted: `email`; `first_name`/`name`; `mobile`/`phone`.
- **Request:** `multipart/form-data` with `file` (`.csv`)
- **Response:**
```json
{ "message": "Successfully processed CSV. Added 10 new users, updated 2 existing users.",
  "organization": { "id": 1, "name": "Acme Inc", "employees": 54 } }
```
- **Errors:** `400` non-CSV/non-UTF-8, `404` not found, `500` DB error.

### 12.6 Portability — `/api/portability`

#### `GET /api/portability/status`
- **Auth:** required → `{ "disclaimer_accepted": false }`

#### `POST /api/portability/accept-disclaimer`
- **Auth:** required → `{ "message": "Disclaimer accepted successfully" }`
- **Errors:** `404` user not found, `500` DB error.

### 12.7 WhatsApp — `/api/whatsapp`

#### `POST /api/whatsapp/webhook`
Inbound message handler (Gupshup/Meta). Always returns `{ "status": "success" }`.
#### `GET /api/whatsapp/webhook`
Verification handshake → `"Webhook is active"`.

### 12.8 Health
#### `GET /`
→ `{ "message": "Insurance Wizard Backend is Running!" }`

### Shared Pydantic model — `UserData` (used by `/api/recommend`, save-progress)
All fields optional with defaults. Key fields:
`first_name, last_name, dob, mobile, secondary_phone, secondary_email, aadhar_number, income_level, city, gender, marital_status(Single), support_parents(false), career_stage, employment_type, lifestyle, smoking_status, family_health_history([]), company_name, industry_type, is_smoker(false), dependents({}), num_children(0), insured_members({})` + Phase-2: `has_life_insurance, existing_life_cover, existing_life_cover_val, has_health_insurance, existing_health_cover, existing_health_cover_val, health_source, parents_covered, parents_health_cover, parents_health_cover_val, life_provider, life_policy_name, health_provider, health_policy_name`. Full definition in [schemas.py](schemas.py).

---

## 13. Security Notes

- **OTP store is in-memory** — lost on restart; not multi-instance safe.
- **Non-production bypasses OTP** — ensure `ENVIRONMENT=production` in prod.
- **No rate limiting** on `/api/auth/otp` — consider adding before public exposure.
- **Superadmin is a hardcoded email** (`tech@emper.ai`) in `routers/auth.py`.
- CORS uses an explicit allowlist with `allow_credentials=True` (no wildcard permitted).
- Secrets (Gemini, Resend keys) are server-side only.

---

## 14. Deployment

Defined in [../render.yaml](../render.yaml) as a Render Blueprint:
- **Backend web service** (`python`): `pip install -r backend/requirements.txt` → `uvicorn main:app`. `DATABASE_URL` wired from managed DB; `FRONTEND_URL` wired from the frontend service; `JWT_SECRET` auto-generated; `GEMINI/RESEND/SMTP` set as dashboard secrets; `RECOMMENDATION_MODE=AI`, `ENVIRONMENT=production`.
- **Managed PostgreSQL** (free plan).
- Sits behind **Cloudflare** in production (`insurance-api.emper.ai`).
- The actively deployed branch is **`deployment`** (which hardcodes additional CORS origins).
