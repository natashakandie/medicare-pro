# MediCore Pro

A capstone-ready hospital management dashboard built with Node.js, Express, EJS, and MySQL. It follows the MediCore Pro prompt with role-based demo access, patient records, appointments, EMR-style patient detail pages, pharmacy inventory, billing, notifications, reports, and JSON API samples.

## Features

- Operations dashboard with live patient, doctor, and appointment counts
- Patient registration and patient directory
- Patient detail pages with demographics, allergies, vitals, visit notes, prescriptions, and invoices
- Doctor registration and staff directory
- Appointment booking connected to patients and doctors
- Pharmacy inventory with low-stock alerts and simulated dispensing
- Billing dashboard with invoice/payment status and print action
- Reports dashboard with revenue, appointment, medicine, and stock indicators
- In-app notifications and account settings
- Demo fallback data when MySQL is not connected, so the app can still be presented
- JSON API samples for dashboard stats, patients, medicines, and notifications
- Graceful empty states when the database is unavailable
- Formal MySQL schema with sample records, indexes, foreign keys, EMR, pharmacy, billing, notifications, and reporting views

## Setup

1. Install dependencies from the project root:

   ```bash
   npm install
   ```

2. Create and seed the database:

   ```bash
   mysql -u root -p < hospital-management-system/database/hospital_management_system.sql
   ```

3. Optional: create a `.env` file in the project root or in `hospital-management-system`:

   ```env
   PORT=3000
   SESSION_SECRET=replace-this-secret
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=hospital_management_system
   ```

4. Start the app:

   ```bash
   npm start
   ```

5. Open `http://localhost:3000`.

## Database Overview

The database file at `database/hospital_management_system.sql` creates the capstone core tables:

- `patients`, `doctors`, and `appointments` for registration and scheduling
- `visits`, `prescriptions`, and `prescription_items` for EMR workflows
- `medicines` and `inventory_logs` for pharmacy stock control
- `invoices`, `invoice_items`, and `payments` for billing
- `notifications` for in-app alerts

It also adds useful indexes for dashboard lookups and four reporting views:

- `appointment_overview` shows appointment details with patient and doctor names.
- `daily_appointment_summary` groups appointments by day and status.
- `doctor_schedule_summary` shows each doctor's workload and next appointment.
- `patient_care_summary` shows visit history and upcoming visits per patient.

Example presentation queries:

```sql
SELECT * FROM appointment_overview ORDER BY appointment_date DESC;
SELECT * FROM daily_appointment_summary ORDER BY appointment_day DESC;
SELECT * FROM doctor_schedule_summary ORDER BY doctor_name;
SELECT * FROM patient_care_summary ORDER BY latest_visit DESC;
```

You can also run the prepared query set:

```bash
mysql -u root -p < hospital-management-system/database/presentation_queries.sql
```

## Demo Login

Use any valid email and password on the login page. These sample accounts match the prompt and automatically select a role for local demos:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@medicore.pro` | `Admin@123` |
| Doctor | `doctor@medicore.pro` | `Doctor@123` |
| Nurse | `nurse@medicore.pro` | `Nurse@123` |
| Receptionist | `reception@medicore.pro` | `Reception@123` |
| Pharmacist | `pharmacy@medicore.pro` | `Pharmacy@123` |
| Patient | `patient@medicore.pro` | `Patient@123` |

## Useful Routes

- `/dashboard`
- `/patients`
- `/patients/1`
- `/appointments`
- `/doctors`
- `/pharmacy`
- `/billing`
- `/reports`
- `/notifications`
- `/settings`

## API Samples

- `GET /api/dashboard/stats`
- `GET /api/patients`
- `GET /api/medicines`
- `GET /api/notifications`
