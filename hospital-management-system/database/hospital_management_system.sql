-- MediCore Pro Hospital Management Database
-- Purpose: schema, starter data, and presentation-ready reporting queries.

CREATE DATABASE IF NOT EXISTS hospital_management_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hospital_management_system;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NULL,
  gender VARCHAR(20) NULL,
  phone VARCHAR(25) NULL,
  email VARCHAR(255) NULL,
  address TEXT NULL,
  blood_group VARCHAR(10) NULL,
  allergies TEXT NULL,
  emergency_contact TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NULL,
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
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
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
-- Safe upgrades for older local databases
-- ---------------------------------------------------------------------------

SET @schema_name = DATABASE();

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE patients ADD COLUMN blood_group VARCHAR(10) NULL',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'patients'
    AND COLUMN_NAME = 'blood_group'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE patients ADD COLUMN allergies TEXT NULL',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'patients'
    AND COLUMN_NAME = 'allergies'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE patients ADD COLUMN emergency_contact TEXT NULL',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'patients'
    AND COLUMN_NAME = 'emergency_contact'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE appointments ADD COLUMN reason TEXT NULL',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'reason'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE appointments ADD COLUMN notes TEXT NULL',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'notes'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- Helpful indexes for fast lookups and dashboard queries
-- ---------------------------------------------------------------------------

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_patients_full_name ON patients(full_name)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'patients'
    AND INDEX_NAME = 'idx_patients_full_name'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_doctors_full_name ON doctors(full_name)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'doctors'
    AND INDEX_NAME = 'idx_doctors_full_name'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_appointments_date ON appointments(appointment_date)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'appointments'
    AND INDEX_NAME = 'idx_appointments_date'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_appointments_status ON appointments(status)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'appointments'
    AND INDEX_NAME = 'idx_appointments_status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- Professional starter records
-- ---------------------------------------------------------------------------

INSERT INTO patients (
  full_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group,
  allergies,
  emergency_contact
)
SELECT
  'Amina Hassan',
  '1988-04-12',
  'Female',
  '+254 700 111 222',
  'amina.hassan@example.com',
  'Nairobi, Kenya',
  'O+',
  'Penicillin',
  'Omar Hassan - +254 700 222 333'
WHERE NOT EXISTS (
  SELECT 1 FROM patients WHERE email = 'amina.hassan@example.com'
);

INSERT INTO patients (
  full_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group,
  allergies,
  emergency_contact
)
SELECT
  'Daniel Otieno',
  '1979-09-23',
  'Male',
  '+254 711 333 444',
  'daniel.otieno@example.com',
  'Kisumu, Kenya',
  'A-',
  'None recorded',
  'Grace Otieno - +254 711 444 555'
WHERE NOT EXISTS (
  SELECT 1 FROM patients WHERE email = 'daniel.otieno@example.com'
);

INSERT INTO patients (
  full_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group,
  allergies,
  emergency_contact
)
SELECT
  'Mary Wanjiku',
  '1994-01-06',
  'Female',
  '+254 722 555 666',
  'mary.wanjiku@example.com',
  'Nakuru, Kenya',
  'B+',
  'Latex',
  'Peter Wanjiku - +254 722 666 777'
WHERE NOT EXISTS (
  SELECT 1 FROM patients WHERE email = 'mary.wanjiku@example.com'
);

INSERT INTO patients (
  full_name,
  date_of_birth,
  gender,
  phone,
  email,
  address,
  blood_group,
  allergies,
  emergency_contact
)
SELECT
  'Brian Kimani',
  '2001-11-18',
  'Male',
  '+254 733 777 888',
  'brian.kimani@example.com',
  'Thika, Kenya',
  'AB+',
  'None recorded',
  'Jane Kimani - +254 733 888 999'
WHERE NOT EXISTS (
  SELECT 1 FROM patients WHERE email = 'brian.kimani@example.com'
);

INSERT INTO doctors (full_name, specialty, phone, email)
SELECT
  'Dr. Lydia Mwangi',
  'Cardiology',
  '+254 733 111 222',
  'lydia.mwangi@medicore.local'
WHERE NOT EXISTS (
  SELECT 1 FROM doctors WHERE email = 'lydia.mwangi@medicore.local'
);

INSERT INTO doctors (full_name, specialty, phone, email)
SELECT
  'Dr. Samuel Kariuki',
  'Pediatrics',
  '+254 744 333 444',
  'samuel.kariuki@medicore.local'
WHERE NOT EXISTS (
  SELECT 1 FROM doctors WHERE email = 'samuel.kariuki@medicore.local'
);

INSERT INTO doctors (full_name, specialty, phone, email)
SELECT
  'Dr. Faith Njeri',
  'General Medicine',
  '+254 755 555 666',
  'faith.njeri@medicore.local'
WHERE NOT EXISTS (
  SELECT 1 FROM doctors WHERE email = 'faith.njeri@medicore.local'
);

INSERT INTO doctors (full_name, specialty, phone, email)
SELECT
  'Dr. Kevin Maina',
  'Orthopedics',
  '+254 766 777 888',
  'kevin.maina@medicore.local'
WHERE NOT EXISTS (
  SELECT 1 FROM doctors WHERE email = 'kevin.maina@medicore.local'
);

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  status,
  reason,
  notes
)
SELECT
  p.id,
  d.id,
  DATE_ADD(CURDATE(), INTERVAL 9 HOUR),
  'confirmed',
  'Cardiology review',
  'Bring recent blood pressure log.'
FROM patients p
JOIN doctors d ON d.email = 'lydia.mwangi@medicore.local'
WHERE p.email = 'amina.hassan@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.patient_id = p.id
      AND a.doctor_id = d.id
      AND a.reason = 'Cardiology review'
  )
LIMIT 1;

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  status,
  reason,
  notes
)
SELECT
  p.id,
  d.id,
  DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 11 HOUR,
  'scheduled',
  'Child wellness consultation',
  'First morning slot requested.'
FROM patients p
JOIN doctors d ON d.email = 'samuel.kariuki@medicore.local'
WHERE p.email = 'brian.kimani@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.patient_id = p.id
      AND a.doctor_id = d.id
      AND a.reason = 'Child wellness consultation'
  )
LIMIT 1;

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  status,
  reason,
  notes
)
SELECT
  p.id,
  d.id,
  DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 14 HOUR,
  'scheduled',
  'General medical follow-up',
  'Review recovery progress and medication plan.'
FROM patients p
JOIN doctors d ON d.email = 'faith.njeri@medicore.local'
WHERE p.email = 'mary.wanjiku@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.patient_id = p.id
      AND a.doctor_id = d.id
      AND a.reason = 'General medical follow-up'
  )
LIMIT 1;

INSERT INTO appointments (
  patient_id,
  doctor_id,
  appointment_date,
  status,
  reason,
  notes
)
SELECT
  p.id,
  d.id,
  DATE_SUB(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR,
  'completed',
  'Orthopedic assessment',
  'X-ray reviewed; physiotherapy recommended.'
FROM patients p
JOIN doctors d ON d.email = 'kevin.maina@medicore.local'
WHERE p.email = 'daniel.otieno@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM appointments a
    WHERE a.patient_id = p.id
      AND a.doctor_id = d.id
      AND a.reason = 'Orthopedic assessment'
  )
LIMIT 1;

-- ---------------------------------------------------------------------------
-- Presentation-ready reporting queries
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
  MIN(CASE
    WHEN a.appointment_date >= NOW()
      AND a.status IN ('scheduled', 'confirmed')
    THEN a.appointment_date
  END) AS next_appointment
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
  MIN(CASE
    WHEN a.appointment_date >= NOW()
      AND a.status IN ('scheduled', 'confirmed')
    THEN a.appointment_date
  END) AS next_visit
FROM patients p
LEFT JOIN appointments a ON a.patient_id = p.id
GROUP BY p.id, p.full_name, p.phone, p.email, p.blood_group;

-- Quick examples for reports and demonstrations:
-- SELECT * FROM appointment_overview ORDER BY appointment_date DESC;
-- SELECT * FROM daily_appointment_summary ORDER BY appointment_day DESC;
-- SELECT * FROM doctor_schedule_summary ORDER BY doctor_name;
-- SELECT * FROM patient_care_summary ORDER BY latest_visit DESC;
