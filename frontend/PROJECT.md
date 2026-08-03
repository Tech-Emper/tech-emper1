# Insurance Wizard — Frontend Documentation

> Technical reference for the **frontend** of the Insurance Wizard ("Emper") platform — a React SPA that delivers an AI-powered insurance recommendation experience for the Indian market.

---

## 1. Overview

A single-page application (SPA) built with **React 19 + Vite**. It provides:

- **Passwordless login** (email OTP) with JWT stored in `localStorage`.
- A **multi-step onboarding wizard** that captures demographics, income, family, and existing coverage.
- **AI-generated recommendations**, gap analysis, and specific product suggestions.
- **Policy document upload** (PDF) with AI extraction to auto-fill the profile.
- A **client-side policy wallet**, an **insurance portability** flow, a user **dashboard/report**, and a **Super Admin** console for B2B org management.
- A premium, glassmorphic, mobile-first UI with animations (Framer Motion). Theme is currently **locked to light mode**.

---

## 2. Technology Stack

| Concern | Technology |
|---|---|
| Framework | React `19.2` |
| Build tool | Vite `7.2` (`@vitejs/plugin-react`) |
| Routing | `react-router-dom` `7.13` |
| Styling | Tailwind CSS `4.1` (`@tailwindcss/vite`) + CSS variables |
| Animation | `framer-motion` `12.23` |
| Icons | `lucide-react` |
| Forms | `react-hook-form` |
| Class utils | `clsx`, `tailwind-merge` |
| Linting | ESLint `9` |
| Node | `>= 20` |

Full manifest in [package.json](package.json).

---

## 3. Project Structure

```
frontend/
├── index.html                  # Vite entry HTML (title: "Secure Your Future")
├── vite.config.js              # React + Tailwind plugins; preview allowedHosts
├── package.json
├── src/
│   ├── main.jsx                # Root render; wraps App in ThemeProvider
│   ├── App.jsx                 # Router + AuthProvider + route guards
│   ├── config.js               # API_BASE_URL resolution (VITE_API_BASE_URL)
│   ├── index.css / App.css     # Global styles, theme CSS variables
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state, login/verify/logout, profile fetch
│   │   └── ThemeContext.jsx    # Theme (locked to light)
│   ├── hooks/
│   │   └── useThemeStyles.js   # Theme-aware style helper
│   ├── services/
│   │   └── walletService.js    # localStorage-backed policy wallet CRUD
│   ├── assets/images/          # Logo, favicon
│   └── components/
│       ├── LandingPage.jsx     # Public landing
│       ├── Login.jsx           # Email + OTP login
│       ├── OTPModal.jsx        # OTP entry modal
│       ├── Wizard.jsx          # Multi-step onboarding orchestrator
│       ├── Dashboard.jsx / DashboardWrapped.jsx  # Results dashboard
│       ├── Profile.jsx         # Profile view/edit
│       ├── Report.jsx          # Recommendation report
│       ├── DesignDetails.jsx   # Design-system documentation page
│       ├── SuperAdmin.jsx      # B2B org management console
│       ├── FeatureSelector.jsx, Background.jsx, ThemeToggle.jsx
│       ├── PolicyReviewSession.jsx, ReverseGapFlow.jsx
│       ├── common/Navbar.jsx
│       ├── steps/              # Wizard step components (Step01…Step09)
│       ├── portability/        # Portability landing/disclaimer/dashboard
│       └── wallet/             # Wallet dashboard + add-policy flow
```

---

## 4. Running & Building

```bash
cd frontend
npm install
npm run dev        # dev server on http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the build (vite preview)
npm run start      # vite preview --host 0.0.0.0 --port $PORT  (used on Render)
```

---

## 5. Backend Connection & Configuration — `config.js`

The API base URL is resolved at build time:

```js
if (import.meta.env.VITE_API_BASE_URL) {
    // prepend https:// if missing, strip trailing slash
    return url;
}
return 'http://localhost:8000'; // dev default
```

- **`VITE_API_BASE_URL`** is the only required env var. On Render it's wired from the backend service URL. Locally it defaults to `http://localhost:8000`.
- All API calls are plain `fetch` with a manually attached `Authorization: Bearer <token>` header (no axios, no central interceptor).
- **CORS caveat:** the frontend origin must be present in the backend's allowlist, or browser requests are blocked.

---

## 6. Routing Map — `App.jsx`

Wrapped in `BrowserRouter` → `AuthProvider` → `MainApp`. Wallet routes are **lazy-loaded** (`React.lazy` + `Suspense`).

| Path | Component | Access |
|---|---|---|
| `/` | LandingPage (or redirect to `/dashboard` if authed) | Public |
| `/login` | Login | Public (redirects if authed) |
| `/details` | Wizard | Public / semi-public |
| `/report` | Report | Public |
| `/design-details` | DesignDetails | Public |
| `/portability` | PortabilityLanding | Public |
| `/portability/disclaimer` | PortabilityDisclaimer | Public |
| `/dashboard` | DashboardWrapped (redirects to `/details` if `current_step < 9`) | Protected |
| `/profile` | Profile | Protected |
| `/superadmin` | SuperAdmin | Protected (role-checked in component) |
| `/portability/dashboard` | PortabilityDashboard | Protected |
| `/wallet` | WalletDashboard | Protected (lazy) |
| `/wallet/add-policy[...]` | PolicyTypeSelector → CompanySelector → PolicyDetailsForm → PolicyConfirmation | Protected (lazy) |
| `/wallet/policy/:id[/edit]` | PolicyDetailView / PolicyDetailsForm | Protected (lazy) |
| `*` | Redirect to `/` | — |

---

## 7. State Management

### AuthContext — `context/AuthContext.jsx`
Single source of truth for authentication and profile. Persists `auth_token` and `auth_email` in **`localStorage`**.

Exposed API:
| Value/Method | Description |
|---|---|
| `user` | `{ token, email, role }` (role derived: `tech@emper.ai` → superadmin) |
| `profile` | Server profile object |
| `recommendations` | Array of past recommendations |
| `loading` | Auth initialization flag |
| `isAuthenticated` | `!!user` |
| `login(email)` | POST `/api/auth/otp` |
| `verify(email, otp)` | POST `/api/auth/verify`, stores token, fetches profile |
| `logout()` | Clears localStorage + state |
| `updateProfile(data)` | POST `/api/user/sync-profile` then refresh |
| `refreshProfile()` | GET `/api/user/profile` |

On mount, it rehydrates from `localStorage` and fetches the profile.

### ThemeContext — `context/ThemeContext.jsx`
Theme is **hardcoded to `light`**; the toggle is disabled and any saved preference is cleared. Styling still uses CSS variables (`--text-auth-primary`, `--bg-auth-card`, etc.) so a dark theme could be re-enabled later.

---

## 8. Screens & Their API Usage

This maps each UI area to the backend endpoints it calls.

| Screen / Component | Purpose | Backend APIs used |
|---|---|---|
| **Login** + **OTPModal** | Email entry → OTP verification | `POST /api/auth/otp`, `POST /api/auth/verify` (via AuthContext) |
| **Wizard** (`Wizard.jsx`) | Multi-step onboarding; saves progress; fetches recommendation | `POST /api/user/save-progress`, `POST /api/recommend` |
| **Step05b_PolicyEntry** | Upload existing policy PDFs during wizard | `POST /api/policy/extract-multiple` |
| **Step09_ProductRecommendations** | Phase-2 specific product suggestions | `POST /api/policy-recommendations` |
| **DashboardWrapped / Dashboard** | Overview of plans & recommendation history | (reads `profile`/`recommendations` from AuthContext) |
| **WalletDashboard** | Policy wallet; also reads server profile | `GET /api/user/profile` + `walletService` (localStorage) |
| **Profile** | View/edit personal + coverage details | `POST /api/user/sync-profile`, `GET /api/user/profile` (via AuthContext) |
| **ReverseGapFlow** | Upload-first flow: extract → sync → recommend | `GET /api/user/profile`, `POST /api/policy/extract-multiple`, `POST /api/user/sync-profile`, `POST /api/recommend` |
| **PolicyReviewSession** | Standalone policy extraction/review | `POST /api/policy/extract-multiple` |
| **SuperAdmin** | Org & employee management console | `GET/POST/PUT /api/superadmin/organizations`, `GET .../{id}/admins`, `POST .../{id}/upload` |
| **PortabilityDashboard / PortabilityDisclaimer** | Portability disclaimer flow | `GET /api/portability/status`, `POST /api/portability/accept-disclaimer` |
| **Report** | Printable/shareable recommendation report | (reads recommendation data) |

---

## 9. The Onboarding Wizard — `components/Wizard.jsx`

The central user journey. Notable design:

- **Step is kept in the URL** (`?step=`) so it's bookmarkable and survives refresh.
- Form state initialized from `initialFormData` (all profile + `insured_members` structure with self/spouse/son/daughter/father/mother and ages).
- **Persistence:**
  - Authenticated → `POST /api/user/save-progress` on each `handleNext`.
  - Unauthenticated → progress mirrored to `localStorage` (`wizard_progress`), with a resume prompt.
- **Validation** per step (`isStepValid`): Step 1 requires name/city/gender/marital status and valid adult ages (18–100); Step 2 requires company/employment/income; Step 3 requires smoking/lifestyle/health history. Forward navigation limited to one step ahead (`canGoToStep`).
- **Recommendation** (`fetchRecommendation`): derives a `dependents` object from `insured_members`, sets `is_smoker`, and POSTs to `/api/recommend` (with Bearer token if present).
- **Deferred auth:** an email modal + `OTPModal` can verify the user mid-flow (`handleVerifyOtp`), after which local progress is flushed to the backend.

Step components live in `components/steps/` (Splash, Personal Info, Life/Career Stage, Financial Reality, Health Snapshot, Results, Policy Entry, Existing Coverage, Gap Analysis, Product Recommendations).

---

## 10. Policy Wallet — `services/walletService.js`

- **100% client-side**, stored in `localStorage` namespaced per email (`user_policies_<email>`, or `user_policies_guest`).
- CRUD: `getPolicies`, `getPolicyById`, `addPolicy` (assigns `crypto.randomUUID()` + `createdAt`), `updatePolicy`, `deletePolicy`.
- **Lazy migration:** on login, merges any guest/legacy wallet entries into the user's namespace, then clears the old keys.
- ⚠️ **Not synced to the server** — wallet data is device- and origin-bound and lost if `localStorage` is cleared. It is **not shared across different domains**.

---

## 11. Super Admin Console — `components/SuperAdmin.jsx`

- Guarded client-side: redirects unless `user.role === 'superadmin'` (backend re-checks on every call).
- Lists organizations with live employee counts; client-side search.
- **Add/Edit modal**: org name + dynamic "Key Members" list (Admin / HR manager). Existing members are read-only (removable); new members are editable. Validates first name + email + mobile.
- **CSV upload**: per-org file input (`.csv` only), POSTed as `multipart/form-data` to the upload endpoint; shows the server's summary via `alert()`.

---

## 12. Styling & Theming

- **Tailwind CSS v4** via the Vite plugin, plus global **CSS variables** for auth/card/text colors (enables theme switching in principle).
- Theme is **locked to light** (`ThemeContext`).
- Heavy use of **Framer Motion** for entrance/exit animations and modals; glassmorphic cards (`backdrop-blur`, translucent backgrounds).
- Mobile-first responsive layout; brand accent color and Emper logo assets under `src/assets/images/`.

---

## 13. Authentication Flow (End-to-End)

1. User enters email on **Login** → `login()` → `POST /api/auth/otp`.
2. **OTPModal** collects the code → `verify()` → `POST /api/auth/verify`.
3. On success, JWT + email saved to `localStorage`; `AuthContext` sets `user` and fetches `/api/user/profile`.
4. Protected routes render based on `isAuthenticated`; `/dashboard` redirects back to `/details` until the wizard is complete (`current_step >= 9`).
5. Every subsequent API call attaches `Authorization: Bearer <token>`.

> Note: auth is **per-origin** — `localStorage` is not shared across domains, so a user logging into two different sites logs in separately, though server-side profile/recommendations are shared (same backend + DB, keyed by email).

---

## 14. Deployment

Defined in [../render.yaml](../render.yaml):
- **Frontend web service** (`node`): `npm install && npm run build` → `npm run start` (`vite preview`).
- `VITE_API_BASE_URL` wired from the backend service's external URL.
- Served in production at `insurance.emper.ai` (behind Cloudflare). A second deployment serves `demo.emper.ai`.
- Static assets (logo/favicon) are bundled into `dist/` — there is no external asset/object storage.
