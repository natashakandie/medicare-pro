-- MediCore Pro Hospital Management Database
-- Safe to run repeatedly: tables are created if missing, columns are added if
-- missing, and starter records are only inserted once.
--
-- This file intentionally has no CREATE DATABASE / USE statement so it can be
-- imported directly into an existing database via phpMyAdmin (cPanel, etc.),
-- where the database must already exist and be selected before importing.
--
--   Local / full-privilege setup: npm run db:setup (creates the database too)
--   Shared hosting (cPanel): create the database in "MySQL Databases", open
--   it in phpMyAdmin, then use Import > choose this file > Go.

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'Admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_code VARCHAR(30) NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NULL,
  gender VARCHAR(20) NULL,
  phone VARCHAR(25) NULL,
  email VARCHAR(255) NULL,
  address TEXT NULL,
  blood_group VARCHAR(10) NULL,
  allergies TEXT NULL,
  emergency_contact TEXT NULL,
  medical_history TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NULL,
  department VARCHAR(120) NULL,
  schedule VARCHAR(120) NULL,
  phone VARCHAR(25) NULL,
  email VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  reason TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NULL,
  symptoms TEXT NULL,
  diagnosis VARCHAR(255) NULL,
  vitals TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_visits_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_visits_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NULL,
  category VARCHAR(120) NULL,
  dosage_form VARCHAR(120) NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  expiry_date DATE NULL,
  reorder_level INT NOT NULL DEFAULT 20,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_id INT NOT NULL,
  prescribed_by INT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ready',
  prescribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prescriptions_visit FOREIGN KEY (visit_id) REFERENCES visits(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (prescribed_by) REFERENCES doctors(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prescription_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prescription_id INT NOT NULL,
  medicine_id INT NOT NULL,
  dosage VARCHAR(120) NULL,
  frequency VARCHAR(120) NULL,
  duration VARCHAR(120) NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_prescription_items_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_prescription_items_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT NOT NULL,
  quantity_change INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_by VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_logs_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_code VARCHAR(40) NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(80) NOT NULL,
  transaction_id VARCHAR(120) NULL,
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Safe upgrades for databases created by older versions of this file
-- ---------------------------------------------------------------------------

SET @schema_name = DATABASE();

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE patients ADD COLUMN patient_code VARCHAR(30) NULL AFTER id', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'patient_code');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE patients ADD COLUMN blood_group VARCHAR(10) NULL', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'blood_group');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE patients ADD COLUMN allergies TEXT NULL', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'allergies');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE patients ADD COLUMN emergency_contact TEXT NULL', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'emergency_contact');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE patients ADD COLUMN medical_history TEXT NULL', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'medical_history');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE doctors ADD COLUMN department VARCHAR(120) NULL AFTER specialty', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'doctors' AND COLUMN_NAME = 'department');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE doctors ADD COLUMN schedule VARCHAR(120) NULL AFTER department', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'doctors' AND COLUMN_NAME = 'schedule');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE appointments ADD COLUMN reason TEXT NULL', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'reason');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE appointments ADD COLUMN notes TEXT NULL', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'notes');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL', 'SELECT 1')
  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Indexes for dashboard lookups
SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX idx_patients_full_name ON patients(full_name)', 'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'idx_patients_full_name');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE UNIQUE INDEX idx_patients_code ON patients(patient_code)', 'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'idx_patients_code');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX idx_doctors_full_name ON doctors(full_name)', 'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'doctors' AND INDEX_NAME = 'idx_doctors_full_name');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX idx_appointments_date ON appointments(appointment_date)', 'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'appointments' AND INDEX_NAME = 'idx_appointments_date');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX idx_appointments_status ON appointments(status)', 'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'appointments' AND INDEX_NAME = 'idx_appointments_status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(COUNT(*) = 0, 'CREATE INDEX idx_notifications_read ON notifications(is_read, created_at)', 'SELECT 1')
  FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'notifications' AND INDEX_NAME = 'idx_notifications_read');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- Login accounts (passwords are bcrypt hashes)
--   admin@medicore.pro      Admin@123
--   doctor@medicore.pro     Doctor@123
--   nurse@medicore.pro      Nurse@123
--   reception@medicore.pro  Reception@123
--   pharmacy@medicore.pro   Pharmacy@123
--   patient@medicore.pro    Patient@123
-- ---------------------------------------------------------------------------

INSERT INTO users (full_name, email, password_hash, role)
SELECT * FROM (SELECT 'System Administrator' AS full_name, 'admin@medicore.pro' AS email, '$2b$10$s6fzX1BWLzfouyYZCMOrvuvwRxWVahO8HKtvdVRIjp.QELSfnTTdu' AS password_hash, 'Admin' AS role) AS t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@medicore.pro');

INSERT INTO users (full_name, email, password_hash, role)
SELECT * FROM (SELECT 'Dr. Lydia Mwangi' AS full_name, 'doctor@medicore.pro' AS email, '$2b$10$smBnisi5yEuUy3EMbWY1Ou0K5O5IbgPSh2v9KdEObQOwbusO0EbgK' AS password_hash, 'Doctor' AS role) AS t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor@medicore.pro');

INSERT INTO users (full_name, email, password_hash, role)
SELECT * FROM (SELECT 'Nurse Joy Achieng' AS full_name, 'nurse@medicore.pro' AS email, '$2b$10$I2Y9kVxua8wZtmbxijtP1uky3bW6i0Qcu.Os3fM5611e/g3w5Ozna' AS password_hash, 'Nurse' AS role) AS t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nurse@medicore.pro');

INSERT INTO users (full_name, email, password_hash, role)
SELECT * FROM (SELECT 'Front Desk' AS full_name, 'reception@medicore.pro' AS email, '$2b$10$tXUvv5M5E.qinN/tmvGSaewe1XSiwnSBj0bURt4U0bYuwHgq3nZSG' AS password_hash, 'Receptionist' AS role) AS t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'reception@medicore.pro');

INSERT INTO users (full_name, email, password_hash, role)
SELECT * FROM (SELECT 'Pharmacy Desk' AS full_name, 'pharmacy@medicore.pro' AS email, '$2b$10$ONU.Cysp2EIJe7IAZ4CcBu2Ju5n36voZBvY1/3F.VJG8jtk9.KMue' AS password_hash, 'Pharmacist' AS role) AS t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pharmacy@medicore.pro');

INSERT INTO users (full_name, email, password_hash, role)
SELECT * FROM (SELECT 'Amina Hassan' AS full_name, 'patient@medicore.pro' AS email, '$2b$10$eGeKQ/7UoHFaUqBggmTgnuxIibJ5Tpd1.jPrhTRS/QQXXsL1e0RK2' AS password_hash, 'Patient' AS role) AS t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'patient@medicore.pro');

-- ---------------------------------------------------------------------------
-- Starter patients and doctors
-- ---------------------------------------------------------------------------

INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, medical_history)
SELECT * FROM (SELECT 'MCP-2026-001' AS patient_code, 'Amina Hassan' AS full_name, '1988-04-12' AS date_of_birth, 'Female' AS gender, '+254 700 111 222' AS phone, 'amina.hassan@example.com' AS email, 'Nairobi, Kenya' AS address, 'O+' AS blood_group, 'Penicillin' AS allergies, 'Omar Hassan - +254 700 222 333' AS emergency_contact, 'Hypertension monitoring; no surgeries recorded.' AS medical_history) AS t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'amina.hassan@example.com');

INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, medical_history)
SELECT * FROM (SELECT 'MCP-2026-002' AS patient_code, 'Daniel Otieno' AS full_name, '1979-09-23' AS date_of_birth, 'Male' AS gender, '+254 711 333 444' AS phone, 'daniel.otieno@example.com' AS email, 'Kisumu, Kenya' AS address, 'A-' AS blood_group, 'None recorded' AS allergies, 'Grace Otieno - +254 711 444 555' AS emergency_contact, 'Orthopedic review after sports injury.' AS medical_history) AS t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'daniel.otieno@example.com');

INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, medical_history)
SELECT * FROM (SELECT 'MCP-2026-003' AS patient_code, 'Mary Wanjiku' AS full_name, '1994-01-06' AS date_of_birth, 'Female' AS gender, '+254 722 555 666' AS phone, 'mary.wanjiku@example.com' AS email, 'Nakuru, Kenya' AS address, 'B+' AS blood_group, 'Latex' AS allergies, 'Peter Wanjiku - +254 722 666 777' AS emergency_contact, 'General medicine follow-up and allergy note.' AS medical_history) AS t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'mary.wanjiku@example.com');

INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, medical_history)
SELECT * FROM (SELECT 'MCP-2026-004' AS patient_code, 'Brian Kimani' AS full_name, '2001-11-18' AS date_of_birth, 'Male' AS gender, '+254 733 777 888' AS phone, 'brian.kimani@example.com' AS email, 'Thika, Kenya' AS address, 'AB+' AS blood_group, 'None recorded' AS allergies, 'Jane Kimani - +254 733 888 999' AS emergency_contact, 'Routine wellness checks only.' AS medical_history) AS t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'brian.kimani@example.com');

INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, medical_history)
SELECT * FROM (SELECT 'MCP-2026-005' AS patient_code, 'Grace Wambui' AS full_name, '1965-02-27' AS date_of_birth, 'Female' AS gender, '+254 745 121 314' AS phone, 'grace.wambui@example.com' AS email, 'Eldoret, Kenya' AS address, 'O-' AS blood_group, 'Sulfa drugs' AS allergies, 'Joseph Wambui - +254 745 141 516' AS emergency_contact, 'Type 2 diabetes; on metformin since 2019.' AS medical_history) AS t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE email = 'grace.wambui@example.com');

-- Backfill patient codes for rows created before codes existed
UPDATE patients SET patient_code = CONCAT('MCP-', YEAR(created_at), '-', LPAD(id, 3, '0')) WHERE patient_code IS NULL;

INSERT INTO doctors (full_name, specialty, department, schedule, phone, email)
SELECT * FROM (SELECT 'Dr. Lydia Mwangi' AS full_name, 'Cardiology' AS specialty, 'Cardiology' AS department, 'Mon, Wed, Fri' AS schedule, '+254 733 111 222' AS phone, 'lydia.mwangi@medicore.local' AS email) AS t
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE email = 'lydia.mwangi@medicore.local');

INSERT INTO doctors (full_name, specialty, department, schedule, phone, email)
SELECT * FROM (SELECT 'Dr. Samuel Kariuki' AS full_name, 'Pediatrics' AS specialty, 'Pediatrics' AS department, 'Tue, Thu' AS schedule, '+254 744 333 444' AS phone, 'samuel.kariuki@medicore.local' AS email) AS t
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE email = 'samuel.kariuki@medicore.local');

INSERT INTO doctors (full_name, specialty, department, schedule, phone, email)
SELECT * FROM (SELECT 'Dr. Faith Njeri' AS full_name, 'General Medicine' AS specialty, 'Outpatient' AS department, 'Weekdays' AS schedule, '+254 755 555 666' AS phone, 'faith.njeri@medicore.local' AS email) AS t
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE email = 'faith.njeri@medicore.local');

INSERT INTO doctors (full_name, specialty, department, schedule, phone, email)
SELECT * FROM (SELECT 'Dr. Kevin Maina' AS full_name, 'Orthopedics' AS specialty, 'Surgery' AS department, 'Mon - Thu' AS schedule, '+254 766 777 888' AS phone, 'kevin.maina@medicore.local' AS email) AS t
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE email = 'kevin.maina@medicore.local');

UPDATE doctors SET department = COALESCE(department, specialty), schedule = COALESCE(schedule, 'Weekdays');

-- ---------------------------------------------------------------------------
-- Appointments (relative to today so the dashboard always has live data)
-- ---------------------------------------------------------------------------

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes)
SELECT p.id, d.id, CURDATE() + INTERVAL 9 HOUR, 'confirmed', 'Cardiology review', 'Bring recent blood pressure log.'
FROM patients p JOIN doctors d ON d.email = 'lydia.mwangi@medicore.local'
WHERE p.email = 'amina.hassan@example.com'
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = d.id AND a.reason = 'Cardiology review')
LIMIT 1;

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes)
SELECT p.id, d.id, CURDATE() + INTERVAL 11 HOUR + INTERVAL 30 MINUTE, 'scheduled', 'Diabetes follow-up', 'Fasting glucose results to be reviewed.'
FROM patients p JOIN doctors d ON d.email = 'faith.njeri@medicore.local'
WHERE p.email = 'grace.wambui@example.com'
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = d.id AND a.reason = 'Diabetes follow-up')
LIMIT 1;

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes)
SELECT p.id, d.id, CURDATE() + INTERVAL 1 DAY + INTERVAL 11 HOUR, 'scheduled', 'Child wellness consultation', 'First morning slot requested.'
FROM patients p JOIN doctors d ON d.email = 'samuel.kariuki@medicore.local'
WHERE p.email = 'brian.kimani@example.com'
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = d.id AND a.reason = 'Child wellness consultation')
LIMIT 1;

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes)
SELECT p.id, d.id, CURDATE() + INTERVAL 2 DAY + INTERVAL 14 HOUR, 'scheduled', 'General medical follow-up', 'Review recovery progress and medication plan.'
FROM patients p JOIN doctors d ON d.email = 'faith.njeri@medicore.local'
WHERE p.email = 'mary.wanjiku@example.com'
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = d.id AND a.reason = 'General medical follow-up')
LIMIT 1;

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes)
SELECT p.id, d.id, CURDATE() - INTERVAL 1 DAY + INTERVAL 10 HOUR, 'completed', 'Orthopedic assessment', 'X-ray reviewed; physiotherapy recommended.'
FROM patients p JOIN doctors d ON d.email = 'kevin.maina@medicore.local'
WHERE p.email = 'daniel.otieno@example.com'
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = d.id AND a.reason = 'Orthopedic assessment')
LIMIT 1;

INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes)
SELECT p.id, d.id, CURDATE() - INTERVAL 3 DAY + INTERVAL 15 HOUR, 'cancelled', 'Allergy consultation', 'Patient rescheduled.'
FROM patients p JOIN doctors d ON d.email = 'faith.njeri@medicore.local'
WHERE p.email = 'mary.wanjiku@example.com'
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = p.id AND a.doctor_id = d.id AND a.reason = 'Allergy consultation')
LIMIT 1;

-- ---------------------------------------------------------------------------
-- Pharmacy inventory
-- ---------------------------------------------------------------------------

INSERT INTO medicines (name, generic_name, category, dosage_form, stock_quantity, unit_price, expiry_date, reorder_level)
SELECT * FROM (SELECT 'Amoxicillin 500mg' AS name, 'Amoxicillin' AS generic_name, 'Antibiotic' AS category, 'Capsule' AS dosage_form, 42 AS stock_quantity, 6.50 AS unit_price, '2027-02-10' AS expiry_date, 30 AS reorder_level) AS t
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Amoxicillin 500mg');

INSERT INTO medicines (name, generic_name, category, dosage_form, stock_quantity, unit_price, expiry_date, reorder_level)
SELECT * FROM (SELECT 'Paracetamol 500mg' AS name, 'Acetaminophen' AS generic_name, 'Analgesic' AS category, 'Tablet' AS dosage_form, 380 AS stock_quantity, 1.25 AS unit_price, '2028-01-15' AS expiry_date, 100 AS reorder_level) AS t
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Paracetamol 500mg');

INSERT INTO medicines (name, generic_name, category, dosage_form, stock_quantity, unit_price, expiry_date, reorder_level)
SELECT * FROM (SELECT 'Salbutamol Inhaler' AS name, 'Albuterol' AS generic_name, 'Respiratory' AS category, 'Inhaler' AS dosage_form, 18 AS stock_quantity, 14.75 AS unit_price, '2026-10-01' AS expiry_date, 25 AS reorder_level) AS t
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Salbutamol Inhaler');

INSERT INTO medicines (name, generic_name, category, dosage_form, stock_quantity, unit_price, expiry_date, reorder_level)
SELECT * FROM (SELECT 'Metformin 850mg' AS name, 'Metformin HCl' AS generic_name, 'Diabetes' AS category, 'Tablet' AS dosage_form, 92 AS stock_quantity, 2.10 AS unit_price, '2027-06-30' AS expiry_date, 50 AS reorder_level) AS t
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Metformin 850mg');

INSERT INTO medicines (name, generic_name, category, dosage_form, stock_quantity, unit_price, expiry_date, reorder_level)
SELECT * FROM (SELECT 'Amlodipine 5mg' AS name, 'Amlodipine' AS generic_name, 'Cardiovascular' AS category, 'Tablet' AS dosage_form, 150 AS stock_quantity, 3.40 AS unit_price, '2027-09-12' AS expiry_date, 40 AS reorder_level) AS t
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Amlodipine 5mg');

INSERT INTO medicines (name, generic_name, category, dosage_form, stock_quantity, unit_price, expiry_date, reorder_level)
SELECT * FROM (SELECT 'Ibuprofen 400mg' AS name, 'Ibuprofen' AS generic_name, 'Analgesic' AS category, 'Tablet' AS dosage_form, 12 AS stock_quantity, 2.00 AS unit_price, '2026-11-20' AS expiry_date, 60 AS reorder_level) AS t
WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Ibuprofen 400mg');

-- ---------------------------------------------------------------------------
-- Visits, prescriptions and dispensing logs (EMR)
-- ---------------------------------------------------------------------------

INSERT INTO visits (patient_id, doctor_id, symptoms, diagnosis, vitals, notes, created_at)
SELECT p.id, d.id, 'Elevated BP, fatigue', 'I10 Essential hypertension', 'BP 138/86, Pulse 78, Temp 36.9C', 'Amlodipine 5mg once daily. Review in 4 weeks.', NOW() - INTERVAL 2 DAY
FROM patients p JOIN doctors d ON d.email = 'lydia.mwangi@medicore.local'
WHERE p.email = 'amina.hassan@example.com'
  AND NOT EXISTS (SELECT 1 FROM visits v WHERE v.patient_id = p.id AND v.diagnosis = 'I10 Essential hypertension')
LIMIT 1;

INSERT INTO visits (patient_id, doctor_id, symptoms, diagnosis, vitals, notes, created_at)
SELECT p.id, d.id, 'Knee pain after football', 'M25.56 Joint pain, knee', 'Temp 36.8C, Weight 82kg', 'Rest, ice and paracetamol as needed. Physiotherapy referral.', NOW() - INTERVAL 1 DAY
FROM patients p JOIN doctors d ON d.email = 'kevin.maina@medicore.local'
WHERE p.email = 'daniel.otieno@example.com'
  AND NOT EXISTS (SELECT 1 FROM visits v WHERE v.patient_id = p.id AND v.diagnosis = 'M25.56 Joint pain, knee')
LIMIT 1;

INSERT INTO visits (patient_id, doctor_id, symptoms, diagnosis, vitals, notes, created_at)
SELECT p.id, d.id, 'Cough, mild fever', 'J06.9 Upper respiratory infection', 'Temp 37.8C, Pulse 88', 'Salbutamol inhaler when wheezy. Fluids and rest.', NOW() - INTERVAL 5 DAY
FROM patients p JOIN doctors d ON d.email = 'faith.njeri@medicore.local'
WHERE p.email = 'mary.wanjiku@example.com'
  AND NOT EXISTS (SELECT 1 FROM visits v WHERE v.patient_id = p.id AND v.diagnosis = 'J06.9 Upper respiratory infection')
LIMIT 1;

INSERT INTO prescriptions (visit_id, prescribed_by, status)
SELECT v.id, v.doctor_id, 'dispensed'
FROM visits v WHERE v.diagnosis = 'I10 Essential hypertension'
  AND NOT EXISTS (SELECT 1 FROM prescriptions pr WHERE pr.visit_id = v.id)
LIMIT 1;

INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, quantity)
SELECT pr.id, m.id, '5mg', 'Once daily', '30 days', 30
FROM prescriptions pr JOIN visits v ON v.id = pr.visit_id JOIN medicines m ON m.name = 'Amlodipine 5mg'
WHERE v.diagnosis = 'I10 Essential hypertension'
  AND NOT EXISTS (SELECT 1 FROM prescription_items pi WHERE pi.prescription_id = pr.id)
LIMIT 1;

INSERT INTO prescriptions (visit_id, prescribed_by, status)
SELECT v.id, v.doctor_id, 'ready'
FROM visits v WHERE v.diagnosis = 'M25.56 Joint pain, knee'
  AND NOT EXISTS (SELECT 1 FROM prescriptions pr WHERE pr.visit_id = v.id)
LIMIT 1;

INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, quantity)
SELECT pr.id, m.id, '500mg', 'Every 6 hours as needed', '5 days', 20
FROM prescriptions pr JOIN visits v ON v.id = pr.visit_id JOIN medicines m ON m.name = 'Paracetamol 500mg'
WHERE v.diagnosis = 'M25.56 Joint pain, knee'
  AND NOT EXISTS (SELECT 1 FROM prescription_items pi WHERE pi.prescription_id = pr.id)
LIMIT 1;

INSERT INTO prescriptions (visit_id, prescribed_by, status)
SELECT v.id, v.doctor_id, 'dispensed'
FROM visits v WHERE v.diagnosis = 'J06.9 Upper respiratory infection'
  AND NOT EXISTS (SELECT 1 FROM prescriptions pr WHERE pr.visit_id = v.id)
LIMIT 1;

INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, quantity)
SELECT pr.id, m.id, '2 puffs', 'As needed', '14 days', 1
FROM prescriptions pr JOIN visits v ON v.id = pr.visit_id JOIN medicines m ON m.name = 'Salbutamol Inhaler'
WHERE v.diagnosis = 'J06.9 Upper respiratory infection'
  AND NOT EXISTS (SELECT 1 FROM prescription_items pi WHERE pi.prescription_id = pr.id)
LIMIT 1;

INSERT INTO inventory_logs (medicine_id, quantity_change, reason, created_by, created_at)
SELECT m.id, 200, 'Opening stock', 'pharmacy@medicore.pro', NOW() - INTERVAL 10 DAY
FROM medicines m WHERE m.name = 'Amlodipine 5mg'
  AND NOT EXISTS (SELECT 1 FROM inventory_logs l WHERE l.medicine_id = m.id AND l.reason = 'Opening stock');

INSERT INTO inventory_logs (medicine_id, quantity_change, reason, created_by, created_at)
SELECT m.id, -30, 'Dispensed: Amina Hassan', 'pharmacy@medicore.pro', NOW() - INTERVAL 2 DAY
FROM medicines m WHERE m.name = 'Amlodipine 5mg'
  AND NOT EXISTS (SELECT 1 FROM inventory_logs l WHERE l.medicine_id = m.id AND l.reason = 'Dispensed: Amina Hassan');

-- ---------------------------------------------------------------------------
-- Billing
-- ---------------------------------------------------------------------------

INSERT INTO invoices (invoice_code, patient_id, total_amount, paid_amount, status, due_date, created_at)
SELECT 'INV-1001', p.id, 8500.00, 8500.00, 'paid', CURDATE() + INTERVAL 5 DAY, NOW() - INTERVAL 2 DAY
FROM patients p WHERE p.email = 'amina.hassan@example.com'
  AND NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_code = 'INV-1001');

INSERT INTO invoices (invoice_code, patient_id, total_amount, paid_amount, status, due_date, created_at)
SELECT 'INV-1002', p.id, 4300.00, 1500.00, 'partial', CURDATE() + INTERVAL 7 DAY, NOW() - INTERVAL 5 DAY
FROM patients p WHERE p.email = 'mary.wanjiku@example.com'
  AND NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_code = 'INV-1002');

INSERT INTO invoices (invoice_code, patient_id, total_amount, paid_amount, status, due_date, created_at)
SELECT 'INV-1003', p.id, 6700.00, 0.00, 'pending', CURDATE() + INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY
FROM patients p WHERE p.email = 'daniel.otieno@example.com'
  AND NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_code = 'INV-1003');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
SELECT i.id, 'Cardiology consultation', 1, 6000.00 FROM invoices i WHERE i.invoice_code = 'INV-1001'
  AND NOT EXISTS (SELECT 1 FROM invoice_items x WHERE x.invoice_id = i.id);
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
SELECT i.id, 'ECG test', 1, 2500.00 FROM invoices i WHERE i.invoice_code = 'INV-1001'
  AND NOT EXISTS (SELECT 1 FROM invoice_items x WHERE x.invoice_id = i.id AND x.description = 'ECG test');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
SELECT i.id, 'General consultation', 1, 2500.00 FROM invoices i WHERE i.invoice_code = 'INV-1002'
  AND NOT EXISTS (SELECT 1 FROM invoice_items x WHERE x.invoice_id = i.id);
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
SELECT i.id, 'Salbutamol Inhaler', 1, 1800.00 FROM invoices i WHERE i.invoice_code = 'INV-1002'
  AND NOT EXISTS (SELECT 1 FROM invoice_items x WHERE x.invoice_id = i.id AND x.description = 'Salbutamol Inhaler');

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
SELECT i.id, 'Orthopedic consultation', 1, 4500.00 FROM invoices i WHERE i.invoice_code = 'INV-1003'
  AND NOT EXISTS (SELECT 1 FROM invoice_items x WHERE x.invoice_id = i.id);
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
SELECT i.id, 'Knee X-ray', 1, 2200.00 FROM invoices i WHERE i.invoice_code = 'INV-1003'
  AND NOT EXISTS (SELECT 1 FROM invoice_items x WHERE x.invoice_id = i.id AND x.description = 'Knee X-ray');

INSERT INTO payments (invoice_id, amount, method, transaction_id, paid_at)
SELECT i.id, 8500.00, 'M-Pesa', 'QHX7RT2K9L', NOW() - INTERVAL 2 DAY FROM invoices i WHERE i.invoice_code = 'INV-1001'
  AND NOT EXISTS (SELECT 1 FROM payments x WHERE x.invoice_id = i.id);

INSERT INTO payments (invoice_id, amount, method, transaction_id, paid_at)
SELECT i.id, 1500.00, 'Cash', NULL, NOW() - INTERVAL 4 DAY FROM invoices i WHERE i.invoice_code = 'INV-1002'
  AND NOT EXISTS (SELECT 1 FROM payments x WHERE x.invoice_id = i.id);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

INSERT INTO notifications (title, message, is_read, created_at)
SELECT * FROM (SELECT 'Appointment confirmed' AS title, 'Amina Hassan confirmed for Cardiology at 09:00 today.' AS message, FALSE AS is_read, NOW() - INTERVAL 1 HOUR AS created_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Appointment confirmed');

INSERT INTO notifications (title, message, is_read, created_at)
SELECT * FROM (SELECT 'Low stock alert' AS title, 'Salbutamol Inhaler and Ibuprofen 400mg are below their reorder levels.' AS message, FALSE AS is_read, NOW() - INTERVAL 3 HOUR AS created_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Low stock alert');

INSERT INTO notifications (title, message, is_read, created_at)
SELECT * FROM (SELECT 'Invoice generated' AS title, 'INV-1003 generated for Daniel Otieno (KES 6,700).' AS message, TRUE AS is_read, NOW() - INTERVAL 1 DAY AS created_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Invoice generated');

INSERT INTO notifications (title, message, is_read, created_at)
SELECT * FROM (SELECT 'Payment received' AS title, 'M-Pesa payment of KES 8,500 received for INV-1001.' AS message, TRUE AS is_read, NOW() - INTERVAL 2 DAY AS created_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE title = 'Payment received');

-- ---------------------------------------------------------------------------
-- Reporting views
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW appointment_overview AS
SELECT
  a.id AS appointment_id,
  a.appointment_date,
  DATE(a.appointment_date) AS appointment_day,
  TIME(a.appointment_date) AS appointment_time,
  a.status,
  a.reason,
  a.notes,
  p.id AS patient_id,
  p.full_name AS patient_name,
  p.phone AS patient_phone,
  p.blood_group,
  d.id AS doctor_id,
  d.full_name AS doctor_name,
  d.specialty
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN doctors d ON d.id = a.doctor_id;

CREATE OR REPLACE VIEW daily_appointment_summary AS
SELECT
  DATE(appointment_date) AS appointment_day,
  COUNT(*) AS total_appointments,
  SUM(status = 'scheduled') AS scheduled_count,
  SUM(status = 'confirmed') AS confirmed_count,
  SUM(status = 'completed') AS completed_count,
  SUM(status = 'cancelled') AS cancelled_count
FROM appointments
GROUP BY DATE(appointment_date);

CREATE OR REPLACE VIEW doctor_schedule_summary AS
SELECT
  d.id AS doctor_id,
  d.full_name AS doctor_name,
  d.specialty,
  COUNT(a.id) AS total_appointments,
  SUM(DATE(a.appointment_date) = CURDATE()) AS appointments_today,
  MIN(CASE WHEN a.appointment_date >= NOW() AND a.status IN ('scheduled', 'confirmed') THEN a.appointment_date END) AS next_appointment
FROM doctors d
LEFT JOIN appointments a ON a.doctor_id = d.id
GROUP BY d.id, d.full_name, d.specialty;

CREATE OR REPLACE VIEW patient_care_summary AS
SELECT
  p.id AS patient_id,
  p.full_name AS patient_name,
  p.phone,
  p.email,
  p.blood_group,
  COUNT(a.id) AS total_visits,
  MAX(a.appointment_date) AS latest_visit,
  MIN(CASE WHEN a.appointment_date >= NOW() AND a.status IN ('scheduled', 'confirmed') THEN a.appointment_date END) AS next_visit
FROM patients p
LEFT JOIN appointments a ON a.patient_id = p.id
GROUP BY p.id, p.full_name, p.phone, p.email, p.blood_group;

CREATE OR REPLACE VIEW billing_summary AS
SELECT
  i.id AS invoice_id,
  i.invoice_code,
  i.status,
  i.total_amount,
  i.paid_amount,
  i.total_amount - i.paid_amount AS balance,
  i.due_date,
  p.full_name AS patient_name
FROM invoices i
JOIN patients p ON p.id = i.patient_id;

CREATE OR REPLACE VIEW low_stock_medicines AS
SELECT id, name, generic_name, stock_quantity, reorder_level, expiry_date
FROM medicines
WHERE stock_quantity <= reorder_level;
