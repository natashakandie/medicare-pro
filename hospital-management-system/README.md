# MediCore Pro

A hospital management dashboard built with Node.js, Express, EJS, and MySQL. It
has real authentication, role-based access control, and every page reads and
writes from the database — patient records, appointments, pharmacy inventory,
billing, and notifications all persist.

## Features

- Session-based login with bcrypt-hashed passwords (no more "any password works")
- Six roles (Admin, Doctor, Nurse, Receptionist, Pharmacist, Patient), each seeing
  only the pages and actions their role permits
- Patient directory with search, registration, and a full EMR-style detail page
  (visits, diagnoses, prescriptions, appointments, invoices)
- Doctor directory with live appointment counts per doctor
- Appointment booking and status updates (scheduled / confirmed / completed / cancelled)
- Pharmacy inventory with real stock deduction and an inventory log when medicine
  is dispensed
- Billing with partial/full payment recording that updates invoice status automatically
- Reports dashboard driven by live SQL aggregates (revenue, appointment status
  breakdown, stock levels, most-dispensed medicine)
- Notifications with mark-as-read / mark-all-read
- Account settings: update your name, change your password
- Graceful demo-data fallback if MySQL is unreachable, so the UI still renders
- `GET /health` for a quick database connectivity check
- JSON API endpoints for dashboard stats, patients, medicines, notifications

## Setup

1. Install dependencies from the project root (one level up from this folder):

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your local MySQL/MariaDB credentials:

   ```bash
   cp hospital-management-system/.env.example hospital-management-system/.env
   ```

   Set `SESSION_SECRET` to a long random string (generate one with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   and set `DB_PASSWORD` to your MySQL root (or dedicated app user) password.

3. Create and seed the database. This is safe to run any time — it only creates
   what's missing and never duplicates seed rows:

   ```bash
   npm run db:setup
   ```

4. Start the app:

   ```bash
   npm run dev      # auto-restarts on file changes
   # or
   npm start
   ```

5. Open `http://localhost:3000` and sign in (see demo accounts below).

To confirm the database connection independently at any time:

```bash
npm run db:healthcheck
```

### Deploying to cPanel

See [DEPLOYMENT.md](DEPLOYMENT.md) for a full walkthrough: Node.js Selector
setup, creating the database through cPanel's MySQL UI, importing the schema
(or your real data) via phpMyAdmin, and environment variables.

## Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@medicore.pro` | `Admin@123` |
| Doctor | `doctor@medicore.pro` | `Doctor@123` |
| Nurse | `nurse@medicore.pro` | `Nurse@123` |
| Receptionist | `reception@medicore.pro` | `Reception@123` |
| Pharmacist | `pharmacy@medicore.pro` | `Pharmacy@123` |
| Patient | `patient@medicore.pro` | `Patient@123` |

Passwords are stored as bcrypt hashes in the `users` table — change them any
time from the Settings page once signed in.

## Role Access

| Page | Admin | Doctor | Nurse | Receptionist | Pharmacist | Patient |
|---|---|---|---|---|---|---|
| Dashboard | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Patients | ✔ | ✔ | ✔ | ✔ | — | — |
| Appointments | ✔ | ✔ | ✔ | ✔ | — | view only |
| Doctors | ✔ | view | view | view | — | view |
| Pharmacy | ✔ | view | view | — | ✔ | — |
| Billing | ✔ | — | — | ✔ | — | view |
| Reports | ✔ | ✔ | — | — | ✔ | — |

Admins can always reach every page. Write actions (adding a patient, booking
an appointment, dispensing medicine, recording a payment) are further
restricted to the roles listed in `routes/index.js`.

## Database Overview

`database/hospital_management_system.sql` is idempotent: run it as many times
as you like against an existing database and it will only add what's missing.
It creates:

- `users` — login accounts (bcrypt password hashes, role)
- `patients`, `doctors`, `appointments` — registration and scheduling
- `visits`, `prescriptions`, `prescription_items` — EMR workflow
- `medicines`, `inventory_logs` — pharmacy stock control
- `invoices`, `invoice_items`, `payments` — billing
- `notifications` — in-app alerts

Reporting views: `appointment_overview`, `daily_appointment_summary`,
`doctor_schedule_summary`, `patient_care_summary`, `billing_summary`,
`low_stock_medicines`. Example queries live in `database/presentation_queries.sql`.

## Project Structure

```
config/db.js          MySQL connection pool + health check
controllers/           Route handlers, one file per feature area
middleware/             auth guard, flash messages, shared view locals, security headers
lib/                    formatting helpers, role/permission table
data/sample.js          demo data used only when the database is unreachable
routes/index.js         all routes, wired to controllers with role guards
scripts/setup-db.js     applies database/hospital_management_system.sql
scripts/healthcheck.js  standalone DB connectivity check
views/                  EJS templates
public/                 static CSS/JS/images
```

## Security Notes

- Never commit `.env`. It's already in `.gitignore`; use `.env.example` as the
  template and keep real credentials local.
- If this repository's `.env` was ever committed with a real database
  password, treat that password as compromised: rotate it and scrub it from
  git history.
- Session cookies are `httpOnly`, `sameSite=lax`, and marked `secure` automatically
  when `NODE_ENV=production` (requires HTTPS in that case).
