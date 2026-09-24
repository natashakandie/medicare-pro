/**
 * Demo data used only when MySQL is unreachable, so the app can still be
 * presented. Write operations are disabled in demo mode.
 */
const today = new Date();
const at = (dayOffset, hour, minute = 0) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, hour, minute);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

const demoAccounts = [
  { id: 1, full_name: "System Administrator", email: "admin@medicore.pro", password: "Admin@123", role: "Admin" },
  { id: 2, full_name: "Dr. Lydia Mwangi", email: "doctor@medicore.pro", password: "Doctor@123", role: "Doctor" },
  { id: 3, full_name: "Nurse Joy Achieng", email: "nurse@medicore.pro", password: "Nurse@123", role: "Nurse" },
  { id: 4, full_name: "Front Desk", email: "reception@medicore.pro", password: "Reception@123", role: "Receptionist" },
  { id: 5, full_name: "Pharmacy Desk", email: "pharmacy@medicore.pro", password: "Pharmacy@123", role: "Pharmacist" },
  { id: 6, full_name: "Amina Hassan", email: "patient@medicore.pro", password: "Patient@123", role: "Patient" },
];

const patients = [
  { id: 1, patient_code: "MCP-2026-001", full_name: "Amina Hassan", date_of_birth: "1988-04-12", gender: "Female", phone: "+254 700 111 222", email: "amina.hassan@example.com", address: "Nairobi, Kenya", blood_group: "O+", allergies: "Penicillin", emergency_contact: "Omar Hassan - +254 700 222 333", medical_history: "Hypertension monitoring; no surgeries recorded.", created_at: at(-40, 9) },
  { id: 2, patient_code: "MCP-2026-002", full_name: "Daniel Otieno", date_of_birth: "1979-09-23", gender: "Male", phone: "+254 711 333 444", email: "daniel.otieno@example.com", address: "Kisumu, Kenya", blood_group: "A-", allergies: "None recorded", emergency_contact: "Grace Otieno - +254 711 444 555", medical_history: "Orthopedic review after sports injury.", created_at: at(-30, 9) },
  { id: 3, patient_code: "MCP-2026-003", full_name: "Mary Wanjiku", date_of_birth: "1994-01-06", gender: "Female", phone: "+254 722 555 666", email: "mary.wanjiku@example.com", address: "Nakuru, Kenya", blood_group: "B+", allergies: "Latex", emergency_contact: "Peter Wanjiku - +254 722 666 777", medical_history: "General medicine follow-up and allergy note.", created_at: at(-20, 9) },
  { id: 4, patient_code: "MCP-2026-004", full_name: "Brian Kimani", date_of_birth: "2001-11-18", gender: "Male", phone: "+254 733 777 888", email: "brian.kimani@example.com", address: "Thika, Kenya", blood_group: "AB+", allergies: "None recorded", emergency_contact: "Jane Kimani - +254 733 888 999", medical_history: "Routine wellness checks only.", created_at: at(-10, 9) },
  { id: 5, patient_code: "MCP-2026-005", full_name: "Grace Wambui", date_of_birth: "1965-02-27", gender: "Female", phone: "+254 745 121 314", email: "grace.wambui@example.com", address: "Eldoret, Kenya", blood_group: "O-", allergies: "Sulfa drugs", emergency_contact: "Joseph Wambui - +254 745 141 516", medical_history: "Type 2 diabetes; on metformin since 2019.", created_at: at(-3, 9) },
];

const doctors = [
  { id: 1, full_name: "Dr. Lydia Mwangi", specialty: "Cardiology", department: "Cardiology", schedule: "Mon, Wed, Fri", phone: "+254 733 111 222", email: "lydia.mwangi@medicore.local", total_appointments: 1, appointments_today: 1 },
  { id: 2, full_name: "Dr. Samuel Kariuki", specialty: "Pediatrics", department: "Pediatrics", schedule: "Tue, Thu", phone: "+254 744 333 444", email: "samuel.kariuki@medicore.local", total_appointments: 1, appointments_today: 0 },
  { id: 3, full_name: "Dr. Faith Njeri", specialty: "General Medicine", department: "Outpatient", schedule: "Weekdays", phone: "+254 755 555 666", email: "faith.njeri@medicore.local", total_appointments: 3, appointments_today: 1 },
  { id: 4, full_name: "Dr. Kevin Maina", specialty: "Orthopedics", department: "Surgery", schedule: "Mon - Thu", phone: "+254 766 777 888", email: "kevin.maina@medicore.local", total_appointments: 1, appointments_today: 0 },
];

const appointments = [
  { id: 1, patient_id: 1, doctor_id: 1, patient_name: "Amina Hassan", doctor_name: "Dr. Lydia Mwangi", specialty: "Cardiology", appointment_date: at(0, 9), status: "confirmed", reason: "Cardiology review", notes: "Bring recent blood pressure log." },
  { id: 2, patient_id: 5, doctor_id: 3, patient_name: "Grace Wambui", doctor_name: "Dr. Faith Njeri", specialty: "General Medicine", appointment_date: at(0, 11, 30), status: "scheduled", reason: "Diabetes follow-up", notes: "" },
  { id: 3, patient_id: 4, doctor_id: 2, patient_name: "Brian Kimani", doctor_name: "Dr. Samuel Kariuki", specialty: "Pediatrics", appointment_date: at(1, 11), status: "scheduled", reason: "Child wellness consultation", notes: "" },
  { id: 4, patient_id: 3, doctor_id: 3, patient_name: "Mary Wanjiku", doctor_name: "Dr. Faith Njeri", specialty: "General Medicine", appointment_date: at(2, 14), status: "scheduled", reason: "General medical follow-up", notes: "" },
  { id: 5, patient_id: 2, doctor_id: 4, patient_name: "Daniel Otieno", doctor_name: "Dr. Kevin Maina", specialty: "Orthopedics", appointment_date: at(-1, 10), status: "completed", reason: "Orthopedic assessment", notes: "X-ray reviewed." },
  { id: 6, patient_id: 3, doctor_id: 3, patient_name: "Mary Wanjiku", doctor_name: "Dr. Faith Njeri", specialty: "General Medicine", appointment_date: at(-3, 15), status: "cancelled", reason: "Allergy consultation", notes: "Patient rescheduled." },
];

const medicines = [
  { id: 1, name: "Amoxicillin 500mg", generic_name: "Amoxicillin", category: "Antibiotic", dosage_form: "Capsule", stock_quantity: 42, unit_price: 6.5, expiry_date: "2027-02-10", reorder_level: 30 },
  { id: 2, name: "Paracetamol 500mg", generic_name: "Acetaminophen", category: "Analgesic", dosage_form: "Tablet", stock_quantity: 380, unit_price: 1.25, expiry_date: "2028-01-15", reorder_level: 100 },
  { id: 3, name: "Salbutamol Inhaler", generic_name: "Albuterol", category: "Respiratory", dosage_form: "Inhaler", stock_quantity: 18, unit_price: 14.75, expiry_date: "2026-10-01", reorder_level: 25 },
  { id: 4, name: "Metformin 850mg", generic_name: "Metformin HCl", category: "Diabetes", dosage_form: "Tablet", stock_quantity: 92, unit_price: 2.1, expiry_date: "2027-06-30", reorder_level: 50 },
  { id: 5, name: "Amlodipine 5mg", generic_name: "Amlodipine", category: "Cardiovascular", dosage_form: "Tablet", stock_quantity: 150, unit_price: 3.4, expiry_date: "2027-09-12", reorder_level: 40 },
  { id: 6, name: "Ibuprofen 400mg", generic_name: "Ibuprofen", category: "Analgesic", dosage_form: "Tablet", stock_quantity: 12, unit_price: 2, expiry_date: "2026-11-20", reorder_level: 60 },
];

const inventoryLogs = [
  { id: 1, medicine_id: 5, medicine_name: "Amlodipine 5mg", quantity_change: 200, reason: "Opening stock", created_by: "pharmacy@medicore.pro", created_at: at(-10, 8) },
  { id: 2, medicine_id: 5, medicine_name: "Amlodipine 5mg", quantity_change: -30, reason: "Dispensed: Amina Hassan", created_by: "pharmacy@medicore.pro", created_at: at(-2, 10) },
];

const visits = [
  { id: 1, patient_id: 1, doctor_id: 1, doctor_name: "Dr. Lydia Mwangi", symptoms: "Elevated BP, fatigue", diagnosis: "I10 Essential hypertension", vitals: "BP 138/86, Pulse 78, Temp 36.9C", notes: "Amlodipine 5mg once daily. Review in 4 weeks.", created_at: at(-2, 10), prescription_status: "dispensed", prescription: "Amlodipine 5mg - 5mg Once daily for 30 days" },
  { id: 2, patient_id: 2, doctor_id: 4, doctor_name: "Dr. Kevin Maina", symptoms: "Knee pain after football", diagnosis: "M25.56 Joint pain, knee", vitals: "Temp 36.8C, Weight 82kg", notes: "Rest, ice and paracetamol as needed.", created_at: at(-1, 10), prescription_status: "ready", prescription: "Paracetamol 500mg - 500mg Every 6 hours for 5 days" },
  { id: 3, patient_id: 3, doctor_id: 3, doctor_name: "Dr. Faith Njeri", symptoms: "Cough, mild fever", diagnosis: "J06.9 Upper respiratory infection", vitals: "Temp 37.8C, Pulse 88", notes: "Salbutamol inhaler when wheezy.", created_at: at(-5, 10), prescription_status: "dispensed", prescription: "Salbutamol Inhaler - 2 puffs As needed for 14 days" },
];

const invoices = [
  { id: 1, invoice_code: "INV-1001", patient_id: 1, patient_name: "Amina Hassan", total_amount: 8500, paid_amount: 8500, balance: 0, status: "paid", due_date: at(5, 0).slice(0, 10), created_at: at(-2, 9) },
  { id: 2, invoice_code: "INV-1002", patient_id: 3, patient_name: "Mary Wanjiku", total_amount: 4300, paid_amount: 1500, balance: 2800, status: "partial", due_date: at(7, 0).slice(0, 10), created_at: at(-5, 9) },
  { id: 3, invoice_code: "INV-1003", patient_id: 2, patient_name: "Daniel Otieno", total_amount: 6700, paid_amount: 0, balance: 6700, status: "pending", due_date: at(3, 0).slice(0, 10), created_at: at(-1, 9) },
];

const invoiceItems = [
  { invoice_id: 1, description: "Cardiology consultation", quantity: 1, unit_price: 6000 },
  { invoice_id: 1, description: "ECG test", quantity: 1, unit_price: 2500 },
  { invoice_id: 2, description: "General consultation", quantity: 1, unit_price: 2500 },
  { invoice_id: 2, description: "Salbutamol Inhaler", quantity: 1, unit_price: 1800 },
  { invoice_id: 3, description: "Orthopedic consultation", quantity: 1, unit_price: 4500 },
  { invoice_id: 3, description: "Knee X-ray", quantity: 1, unit_price: 2200 },
];

const payments = [
  { id: 1, invoice_id: 1, amount: 8500, method: "M-Pesa", transaction_id: "QHX7RT2K9L", paid_at: at(-2, 12) },
  { id: 2, invoice_id: 2, amount: 1500, method: "Cash", transaction_id: null, paid_at: at(-4, 12) },
];

const notifications = [
  { id: 1, title: "Appointment confirmed", message: "Amina Hassan confirmed for Cardiology at 09:00 today.", is_read: 0, created_at: at(0, 8) },
  { id: 2, title: "Low stock alert", message: "Salbutamol Inhaler and Ibuprofen 400mg are below their reorder levels.", is_read: 0, created_at: at(0, 6) },
  { id: 3, title: "Invoice generated", message: "INV-1003 generated for Daniel Otieno (KES 6,700).", is_read: 1, created_at: at(-1, 9) },
  { id: 4, title: "Payment received", message: "M-Pesa payment of KES 8,500 received for INV-1001.", is_read: 1, created_at: at(-2, 12) },
];

module.exports = {
  demoAccounts,
  patients,
  doctors,
  appointments,
  medicines,
  inventoryLogs,
  visits,
  invoices,
  invoiceItems,
  payments,
  notifications,
};
