-- MediCore Pro presentation and reporting queries
-- Run after importing hospital_management_system.sql.

USE hospital_management_system;

-- 1. Full appointment schedule with patient and doctor details.
SELECT
  appointment_id,
  appointment_date,
  status,
  patient_name,
  patient_phone,
  doctor_name,
  specialty,
  reason
FROM appointment_overview
ORDER BY appointment_date DESC;

-- 2. Daily appointment performance by status.
SELECT
  appointment_day,
  total_appointments,
  scheduled_count,
  confirmed_count,
  completed_count,
  cancelled_count
FROM daily_appointment_summary
ORDER BY appointment_day DESC;

-- 3. Doctor workload and next appointment.
SELECT
  doctor_name,
  specialty,
  total_appointments,
  appointments_today,
  next_appointment
FROM doctor_schedule_summary
ORDER BY doctor_name;

-- 4. Patient care history and upcoming visit.
SELECT
  patient_name,
  phone,
  email,
  blood_group,
  total_visits,
  latest_visit,
  next_visit
FROM patient_care_summary
ORDER BY latest_visit DESC;

-- 5. Patients who need allergy attention.
SELECT
  full_name,
  phone,
  blood_group,
  allergies,
  emergency_contact
FROM patients
WHERE allergies IS NOT NULL
  AND allergies <> ''
  AND LOWER(allergies) <> 'none recorded'
ORDER BY full_name;
