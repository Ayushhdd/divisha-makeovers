# Divisha Makeovers

Combined project for the Divisha Makeovers public website, booking/admin portal, and backend API.

## Project Structure

```text
.
├── src/                 # Main Next.js public website
├── public/              # Website assets
├── backend/             # Express + MongoDB API for auth, services, appointments, payments, admin
└── portal-frontend/     # Vite React customer/admin portal
```

## First-Time Setup

Install dependencies for each app:

```bash
npm install
npm run install:backend
npm run install:portal
```

Create local env files from the examples:

```bash
copy backend\.env.example backend\.env
copy portal-frontend\.env.example portal-frontend\.env
```

Then update `backend/.env` with the real MongoDB, JWT, email, and admin values.

## Run Locally

Run the local project. This starts the backend API and the main website:

```bash
npm run dev
```

Run only the main website:

```bash
npm run dev:site
```

Run only the backend API:

```bash
npm run dev:backend
```

Run the customer/admin portal:

```bash
npm run dev:portal
```

Build the portal into the main website so `/portal/divisha/dashboard` works from the public site:

```bash
npm run build:portal
```

Default local URLs:

- Website: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Website-to-backend proxy: `http://localhost:3000/backend-api`
- Portal: Vite will print the local URL, usually `http://localhost:5173`
- Combined portal route from the website: `http://localhost:3000/portal/divisha/dashboard`

## Backend API

Backend docs are in:

- `backend/API.md`
- `backend/SCHEMA.md`

Important backend routes:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/services`
- `POST /api/appointments`
- `POST /api/payments`
- `GET /api/admin/settings/public`

## Notes

- `.env` files are local only and should not be committed.
- Uploaded images use `backend/uploads/` by default. With `UPLOAD_STORAGE=mongodb`, compressed QR codes and payment screenshots are saved in the database and survive backend redeploys and restarts. Reviewed payment screenshots retain the existing seven-day cleanup policy; QR codes and pending screenshots are preserved.
- The portal frontend reads `VITE_API_URL`; it defaults to `/backend-api`, which the Next.js website proxies to `BACKEND_API_URL`.

## Render Free deployment

Create a Node web service from this repository's `main` branch with root directory `backend`, build command `npm ci --omit=dev`, start command `npm start`, and health check `/api/health`. The health check returns 200 only when MongoDB is connected.

Configure `NODE_ENV=production`, `TZ=Asia/Kolkata`, `MONGODB_URI` (including the intended database name), strong `JWT_SECRET` and `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `CLIENT_URL` (website origins), `API_URL` (Render public URL without `/api`), `UPLOAD_STORAGE=mongodb`, and `UPLOAD_DIR=/tmp/divisha-uploads`. For a fresh database, `INITIAL_UPI_ID` and `INITIAL_BUSINESS_EMAIL` initialize payment settings; existing settings are never overwritten.

Allow the service's outbound CIDR ranges in Atlas Network Access. Grant its database user `readWrite` only on the application's database. Do not open database access to all IP addresses.

On Vercel, set production `BACKEND_API_URL` to `https://<service>.onrender.com/api` and redeploy the website to rebuild the proxy. Keep portal `VITE_API_URL=/backend-api`.

Render Free blocks SMTP ports. Set backend `EMAIL_RELAY_URL=https://<website>/api/backend-email` and a random server-only `EMAIL_RELAY_SECRET`. On Vercel, set the same secret plus the existing `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` as production secrets. The HTTPS relay verifies an HMAC signature and a short timestamp window before sending; unauthenticated browser requests cannot send mail. A signed `verifyOnly` request verifies SMTP connectivity without sending an email.

Run `npm --prefix backend run test:migration` to test against an isolated temporary MongoDB instance, including image retrieval after a backend restart and payment approvals and receipts. The test never connects to production data or sends real email.

Free services sleep when idle and take time to wake. In-process hourly appointment reminders run only while the service is awake. Use an always-on service or an external scheduler if reminders must be delivered on time. The database's free storage quota also includes uploaded images.

Replacing a database connection does not copy historical records or Railway volume files. Import a verified database export and old uploads separately if available; never silently treat an empty database as a completed data migration.
