# Insurance Wizard ("Emper") — Project Overview

> AI-powered insurance recommendation platform for the Indian market. This root document ties together the system architecture. For detail, see **[backend/PROJECT.md](backend/PROJECT.md)**, **[frontend/PROJECT.md](frontend/PROJECT.md)**, and the full **[API.md](API.md)**.

---

## 1. What it does

The platform helps users determine the right **life and health insurance coverage** through an AI-guided flow:

1. **Passwordless login** via email OTP.
2. A **multi-step wizard** captures demographics, income, family structure, and existing policies.
3. **Google Gemini** recommends ideal cover amounts, computes protection **gaps**, and suggests **specific products**.
4. Users can **upload policy PDFs** for automatic data extraction.
5. A **Super Admin** console enables **B2B onboarding** (organizations + bulk employee import).
6. Supporting features: policy wallet, insurance portability, dashboard/report, and a **WhatsApp bot**.

---

## 2. High-Level Architecture

```
                         ┌─────────────────────────────────────────────┐
                         │                 Cloudflare                   │
                         │        (edge / TLS / proxy for *.emper.ai)   │
                         └───────────────┬───────────────┬─────────────┘
                                         │               │
                 ┌───────────────────────┘               └────────────────────────┐
                 ▼                                                                  ▼
   ┌───────────────────────────┐                               ┌────────────────────────────────┐
   │   FRONTEND (React + Vite)  │   fetch + Bearer JWT (REST)   │      BACKEND (FastAPI/uvicorn)   │
   │   insurance.emper.ai       │ ─────────────────────────────▶│      insurance-api.emper.ai      │
   │   demo.emper.ai            │◀───────────────────────────── │                                  │
   └───────────────────────────┘         JSON responses         │  Routers: auth, users,           │
                 │                                               │  recommendations, policy,        │
                 │ localStorage (JWT, wallet)                    │  superadmin, portability,        │
                 ▼                                               │  whatsapp                        │
        (client-only wallet)                                     └───────┬──────────┬───────────────┘
                                                                         │          │
                                             ┌───────────────────────────┘          └──────────────┐
                                             ▼                                                      ▼
                                   ┌────────────────────┐                            ┌──────────────────────────┐
                                   │  PostgreSQL (Render)│                            │   External services      │
                                   │  users, orgs,       │                            │  • Google Gemini (AI)    │
                                   │  recommendations,   │                            │  • Resend / Gmail SMTP   │
                                   │  portability,       │                            │  • Gupshup (WhatsApp)    │
                                   │  whatsapp_sessions  │                            └──────────────────────────┘
                                   └────────────────────┘
```

---

## 3. Technology Summary

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Framer Motion, React Router 7, Lucide |
| Backend | Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic v2 |
| Database | PostgreSQL (prod) / SQLite (local) |
| AI | Google Gemini (`google-genai`, `gemini-1.5-flash`) |
| Email | Resend (prod) + Gmail SMTP (local) |
| PDF | pikepdf + Gemini multimodal |
| Jobs | APScheduler |
| Messaging | Gupshup WhatsApp API |
| Hosting | Render (2 web services + managed Postgres), fronted by Cloudflare |

---

## 4. Repository Layout

```
tech-emper1/
├── PROJECT.md              # ← this file (system overview)
├── API.md                  # Full REST API reference
├── render.yaml             # Render Blueprint (IaC)
├── backend/
│   ├── PROJECT.md          # Backend deep-dive
│   ├── main.py, auth.py, database.py, logic.py, schemas.py, scheduler.py
│   ├── whatsapp_bot.py, gupshup_service.py
│   ├── routers/            # auth, users, recommendations, superadmin, portability, whatsapp
│   └── policy_service/     # PDF extraction (router, engine, schemas)
└── frontend/
    ├── PROJECT.md          # Frontend deep-dive
    └── src/                # App, context, components, steps, wallet, portability, services
```

---

## 5. Core Request Flow (recommendation)

1. User completes the wizard → frontend derives a `UserData` payload.
2. `POST /api/recommend` with optional `Authorization: Bearer <JWT>`.
3. Backend (`logic.py`) dispatches to **AI** (Gemini) or **rule-based** logic per `RECOMMENDATION_MODE`.
4. If authenticated, the profile and recommendation are persisted to PostgreSQL.
5. Response returns cover amounts, persona, reasoning, and recommended features.
6. Phase 2: `POST /api/policy-recommendations` computes gaps and returns specific named products.

See **[API.md](API.md)** for every endpoint's payload and response.

---

## 6. Authentication Model

- **Passwordless**: email OTP → JWT (HS256, 24h), stored in browser `localStorage`.
- Stateless: any origin with a valid JWT is accepted (same `JWT_SECRET`).
- Per-origin login (localStorage isn't shared across domains), but **server-side data is shared** across sites (same DB, keyed by email).
- Superadmin is the hardcoded email `tech@emper.ai`.

---

## 7. Data Ownership

| Data | Location |
|---|---|
| Profiles, orgs, recommendations, portability, WhatsApp sessions | PostgreSQL (server) |
| JWT + email | Browser `localStorage` (per origin) |
| Policy wallet | Browser `localStorage` (per origin, per email) — **not** server-synced |
| OTP codes | In-memory dict (server, single-instance) |
| Uploaded PDFs / CSVs | **Not stored** — processed in memory, discarded |
| Logos / favicon | Bundled into the frontend build |

> There is **no object storage** (no S3/GCS/bucket). Uploaded files are never persisted.

---

## 8. Deployment Topology

Defined in [render.yaml](render.yaml):

- **Backend web service** — `uvicorn main:app`; `DATABASE_URL`, `FRONTEND_URL`, `JWT_SECRET`, and AI/email secrets via env. Public at `insurance-api.emper.ai`.
- **Frontend web service** — `npm run build` → `vite preview`; `VITE_API_BASE_URL` wired to the backend. Public at `insurance.emper.ai`.
- **Managed PostgreSQL** (free plan).
- Both services sit behind **Cloudflare** on the `emper.ai` zone.
- **CORS**: backend allowlist controls which frontends may call it. The deployed **`deployment` branch** hardcodes `insurance.emper.ai` + `insurance-api.emper.ai` and appends `FRONTEND_URL`. Additional sites (e.g. `demo.emper.ai`) must be added to this allowlist.

---

## 9. Known Constraints & Tech Debt

- In-memory OTP store (not multi-instance safe; lost on restart).
- Non-production **bypasses OTP** (`ENVIRONMENT != production` accepts any code).
- **No rate limiting** on the OTP endpoint.
- No Alembic — a custom auto-migration only **adds** columns.
- Wallet is client-side only; `recommendations.user_id` is not indexed.
- Employee import is **CSV only** (not Excel).
- Theme is locked to light mode.

---

## 10. Further Reading

- **[backend/PROJECT.md](backend/PROJECT.md)** — modules, database schema, engine, deployment.
- **[frontend/PROJECT.md](frontend/PROJECT.md)** — routing, state, screens, wizard, wallet.
- **[API.md](API.md)** — complete endpoint reference with payloads and responses.
