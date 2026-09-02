const express = require("express");
const router = express.Router();
const db = require("../config/db");

const sample = {
  patients: [
    {
      id: 1,
      patient_code: "MCP-2026-001",
      full_name: "Amina Hassan",
      date_of_birth: "1988-04-12",
      gender: "Female",
      phone: "+254 700 111 222",
      email: "amina.hassan@example.com",
      address: "Nairobi, Kenya",
      blood_group: "O+",
      allergies: "Penicillin",
      emergency_contact: "Omar Hassan - +254 700 222 333",
      medical_history: "Hypertension monitoring; no surgeries recorded.",
    },
    {
      id: 2,
      patient_code: "MCP-2026-002",
      full_name: "Daniel Otieno",
      date_of_birth: "1979-09-23",
      gender: "Male",
      phone: "+254 711 333 444",
      email: "daniel.otieno@example.com",
      address: "Kisumu, Kenya",
      blood_group: "A-",
      allergies: "None recorded",
      emergency_contact: "Grace Otieno - +254 711 444 555",
      medical_history: "Orthopedic review after sports injury.",
    },
    {
      id: 3,
      patient_code: "MCP-2026-003",
      full_name: "Mary Wanjiku",
      date_of_birth: "1994-01-06",
      gender: "Female",
      phone: "+254 722 555 666",
      email: "mary.wanjiku@example.com",
      address: "Nakuru, Kenya",
      blood_group: "B+",
      allergies: "Latex",
      emergency_contact: "Peter Wanjiku - +254 722 666 777",
      medical_history: "General medicine follow-up and allergy note.",
    },
  ],
  doctors: [
    {
      id: 1,
      full_name: "Dr. Lydia Mwangi",
      specialty: "Cardiology",
      phone: "+254 733 111 222",
      email: "lydia.mwangi@medicore.local",
      department: "Cardiology",
      schedule: "Mon, Wed, Fri",
    },
    {
      id: 2,
      full_name: "Dr. Samuel Kariuki",
      specialty: "Pediatrics",
      phone: "+254 744 333 444",
      email: "samuel.kariuki@medicore.local",
      department: "Pediatrics",
      schedule: "Tue, Thu",
    },
    {
      id: 3,
      full_name: "Dr. Faith Njeri",
      specialty: "General Medicine",
      phone: "+254 755 555 666",
      email: "faith.njeri@medicore.local",
      department: "Outpatient",
      schedule: "Weekdays",
    },
  ],
  appointments: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      patient_name: "Amina Hassan",
      doctor_name: "Dr. Lydia Mwangi",
      appointment_date: "2026-08-24 09:00",
      status: "confirmed",
      reason: "Cardiology review",
    },
    {
      id: 2,
      patient_id: 3,
      doctor_id: 3,
      patient_name: "Mary Wanjiku",
      doctor_name: "Dr. Faith Njeri",
      appointment_date: "2026-08-25 14:00",
      status: "scheduled",
      reason: "General medical follow-up",
    },
    {
      id: 3,
      patient_id: 2,
      doctor_id: 2,
      patient_name: "Daniel Otieno",
      doctor_name: "Dr. Samuel Kariuki",
      appointment_date: "2026-08-24 11:30",
      status: "ongoing",
      reason: "Pain management",
    },
  ],
  medicines: [
    { id: 1, name: "Amoxicillin", generic_name: "Amoxicillin", category: "Antibiotic", dosage_form: "Capsule", stock_quantity: 42, unit_price: 6.5, expiry_date: "2027-02-10", reorder_level: 30 },
    { id: 2, name: "Paracetamol", generic_name: "Acetaminophen", category: "Analgesic", dosage_form: "Tablet", stock_quantity: 380, unit_price: 1.25, expiry_date: "2028-01-15", reorder_level: 100 },
    { id: 3, name: "Salbutamol", generic_name: "Albuterol", category: "Respiratory", dosage_form: "Inhaler", stock_quantity: 18, unit_price: 14.75, expiry_date: "2026-10-01", reorder_level: 25 },
    { id: 4, name: "Metformin", generic_name: "Metformin HCl", category: "Diabetes", dosage_form: "Tablet", stock_quantity: 92, unit_price: 2.1, expiry_date: "2027-06-30", reorder_level: 50 },
  ],
  invoices: [
    { id: 1, invoice_code: "INV-1001", patient_name: "Amina Hassan", total_amount: 8500, paid_amount: 8500, status: "paid", due_date: "2026-08-28" },
    { id: 2, invoice_code: "INV-1002", patient_name: "Mary Wanjiku", total_amount: 4300, paid_amount: 1500, status: "partial", due_date: "2026-08-30" },
    { id: 3, invoice_code: "INV-1003", patient_name: "Daniel Otieno", total_amount: 6700, paid_amount: 0, status: "pending", due_date: "2026-08-27" },
  ],
  visits: [
    { patient_id: 1, date: "2026-08-24", doctor: "Dr. Lydia Mwangi", symptoms: "Elevated BP, fatigue", diagnosis: "I10 Essential hypertension", vitals: "BP 138/86, Pulse 78", prescription: "Amlodipine 5mg daily" },
    { patient_id: 2, date: "2026-08-23", doctor: "Dr. Kevin Maina", symptoms: "Knee pain", diagnosis: "M25.56 Joint pain", vitals: "Temp 36.8C, Weight 82kg", prescription: "Paracetamol as needed" },
    { patient_id: 3, date: "2026-08-22", doctor: "Dr. Faith Njeri", symptoms: "Cough, mild fever", diagnosis: "J06.9 Upper respiratory infection", vitals: "Temp 37.8C, Pulse 88", prescription: "Salbutamol inhaler" },
  ],
  notifications: [
    { id: 1, title: "Appointment booked", message: "Amina Hassan confirmed for Cardiology at 09:00.", is_read: false, created_at: "Today" },
    { id: 2, title: "Low stock", message: "Salbutamol is below reorder level.", is_read: false, created_at: "Today" },
    { id: 3, title: "Invoice generated", message: "INV-1003 generated for Daniel Otieno.", is_read: true, created_at: "Yesterday" },
  ],
};

const emptyStats = {
  totalPatients: 0,
  todayAppointments: 0,
  doctorsOnDuty: 0,
  totalAppointments: 0,
  pendingBills: 0,
  lowStock: 0,
};

function ensureDemoUser(req) {
  if (!req.session.user) {
    req.session.user = {
      name: "Demo Administrator",
      email: "admin@medicore.pro",
      role: "Admin",
    };
  }
}

function databaseMessage(error) {
  console.warn(`Database unavailable: ${error.message}`);
  return "Database connection unavailable. Connect MySQL and import the schema to use live records.";
}

async function queryRows(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows;
}

async function loadDashboardData() {
  const [
    patients,
    appointments,
    patientCount,
    todayAppointmentCount,
    doctorCount,
    totalAppointmentCount,
  ] = await Promise.all([
      queryRows(
        "SELECT id, full_name, phone, blood_group FROM patients ORDER BY id DESC LIMIT 5",
      ),
      queryRows(
        "SELECT a.id, a.appointment_date, a.status, p.full_name AS patient_name, d.full_name AS doctor_name FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id ORDER BY a.appointment_date DESC LIMIT 5",
      ),
      queryRows("SELECT COUNT(*) AS count FROM patients"),
      queryRows(
        "SELECT COUNT(*) AS count FROM appointments WHERE DATE(appointment_date) = CURDATE()",
      ),
      queryRows("SELECT COUNT(*) AS count FROM doctors"),
      queryRows("SELECT COUNT(*) AS count FROM appointments"),
    ]);

  return {
    patients,
    appointments,
    stats: {
      totalPatients: patientCount[0]?.count || 0,
      todayAppointments: todayAppointmentCount[0]?.count || 0,
      doctorsOnDuty: doctorCount[0]?.count || 0,
      totalAppointments: totalAppointmentCount[0]?.count || 0,
      pendingBills: 2,
      lowStock: 1,
    },
  };
}

function loadDemoDashboardData() {
  return {
    patients: sample.patients,
    appointments: sample.appointments,
    stats: {
      totalPatients: sample.patients.length,
      todayAppointments: 2,
      doctorsOnDuty: sample.doctors.length,
      totalAppointments: sample.appointments.length,
      pendingBills: sample.invoices.filter((invoice) => invoice.status !== "paid").length,
      lowStock: sample.medicines.filter((medicine) => medicine.stock_quantity <= medicine.reorder_level).length,
    },
  };
}

async function loadAppointmentFormData() {
  const [appointments, patients, doctors] = await Promise.all([
    queryRows(
      "SELECT a.id, a.appointment_date, a.status, p.full_name AS patient_name, d.full_name AS doctor_name FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id ORDER BY a.appointment_date DESC",
    ),
    queryRows("SELECT id, full_name FROM patients ORDER BY full_name"),
    queryRows("SELECT id, full_name FROM doctors ORDER BY full_name"),
  ]);

  return { appointments, patients, doctors };
}

router.get("/", (req, res) => {
  res.render("dashboard/home", {
    title: "MediCore Pro | Smart Hospital Platform",
  });
});

router.get("/login", (req, res) => {
  res.render("dashboard/login", {
    title: "Login | MediCore Pro",
  });
});

router.post("/login", (req, res) => {
  const email = req.body.email || "admin@medicare.com";
  req.session.user = {
    name: email.split("@")[0].replace(/\./g, " "),
    email,
    role: roleFromEmail(email),
  };
  res.redirect("/dashboard");
});

function roleFromEmail(email) {
  if (email.startsWith("doctor")) return "Doctor";
  if (email.startsWith("nurse")) return "Nurse";
  if (email.startsWith("reception")) return "Receptionist";
  if (email.startsWith("pharmacy")) return "Pharmacist";
  if (email.startsWith("patient")) return "Patient";
  return "Admin";
}

router.get("/dashboard", async (req, res) => {
  ensureDemoUser(req);

  try {
    const data = await loadDashboardData();
    res.render("dashboard/index", {
      title: "Dashboard | MediCore Pro",
      user: req.session.user,
      ...data,
    });
  } catch (error) {
    const data = loadDemoDashboardData();
    res.render("dashboard/index", {
      title: "Dashboard | MediCore Pro",
      user: req.session.user,
      ...data,
      dbMessage: databaseMessage(error),
    });
  }
});

router.get("/patients", async (req, res) => {
  ensureDemoUser(req);

  try {
    const patients = await queryRows(
      "SELECT id, full_name, phone, blood_group, emergency_contact FROM patients ORDER BY id DESC",
    );
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients,
      successMessage: null,
    });
  } catch (error) {
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients: sample.patients,
      successMessage: databaseMessage(error),
    });
  }
});

router.post("/patients", async (req, res) => {
  ensureDemoUser(req);

  try {
    const {
      full_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      blood_group,
      allergies,
      emergency_contact,
    } = req.body;

    await db.query(
      "INSERT INTO patients (full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        full_name,
        date_of_birth || null,
        gender || null,
        phone || null,
        email || null,
        address || null,
        blood_group || null,
        allergies || null,
        emergency_contact || null,
      ],
    );

    const patients = await queryRows(
      "SELECT id, full_name, phone, blood_group, emergency_contact FROM patients ORDER BY id DESC",
    );
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients,
      successMessage: "Patient added successfully.",
    });
  } catch (error) {
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients: [],
      successMessage: databaseMessage(error),
    });
  }
});

router.get("/doctors", async (req, res) => {
  ensureDemoUser(req);

  try {
    const doctors = await queryRows(
      "SELECT id, full_name, specialty, phone, email FROM doctors ORDER BY full_name",
    );
    res.render("dashboard/doctors", {
      title: "Doctors | MediCore Pro",
      user: req.session.user,
      doctors,
      successMessage: null,
    });
  } catch (error) {
    res.render("dashboard/doctors", {
      title: "Doctors | MediCore Pro",
      user: req.session.user,
      doctors: sample.doctors,
      successMessage: databaseMessage(error),
    });
  }
});

router.post("/doctors", async (req, res) => {
  ensureDemoUser(req);

  try {
    const { full_name, specialty, phone, email } = req.body;
    await db.query(
      "INSERT INTO doctors (full_name, specialty, phone, email) VALUES (?, ?, ?, ?)",
      [full_name, specialty || null, phone || null, email || null],
    );

    const doctors = await queryRows(
      "SELECT id, full_name, specialty, phone, email FROM doctors ORDER BY full_name",
    );
    res.render("dashboard/doctors", {
      title: "Doctors | MediCore Pro",
      user: req.session.user,
      doctors,
      successMessage: "Doctor added successfully.",
    });
  } catch (error) {
    res.render("dashboard/doctors", {
      title: "Doctors | MediCore Pro",
      user: req.session.user,
      doctors: [],
      successMessage: databaseMessage(error),
    });
  }
});

router.get("/appointments", async (req, res) => {
  ensureDemoUser(req);

  try {
    const data = await loadAppointmentFormData();
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      ...data,
      successMessage: null,
    });
  } catch (error) {
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      appointments: sample.appointments,
      patients: sample.patients,
      doctors: sample.doctors,
      successMessage: databaseMessage(error),
    });
  }
});

router.get("/patients/:id", (req, res) => {
  ensureDemoUser(req);
  const patient = sample.patients.find((item) => item.id === Number(req.params.id)) || sample.patients[0];
  res.render("dashboard/patient-detail", {
    title: `${patient.full_name} | MediCore Pro`,
    user: req.session.user,
    patient,
    visits: sample.visits.filter((visit) => visit.patient_id === patient.id),
    invoices: sample.invoices.filter((invoice) => invoice.patient_name === patient.full_name),
  });
});

router.get("/pharmacy", (req, res) => {
  ensureDemoUser(req);
  res.render("dashboard/pharmacy", {
    title: "Pharmacy | MediCore Pro",
    user: req.session.user,
    medicines: sample.medicines,
    successMessage: null,
  });
});

router.post("/pharmacy/dispense", (req, res) => {
  ensureDemoUser(req);
  res.render("dashboard/pharmacy", {
    title: "Pharmacy | MediCore Pro",
    user: req.session.user,
    medicines: sample.medicines,
    successMessage: "Prescription dispensed and inventory log simulated.",
  });
});

router.get("/billing", (req, res) => {
  ensureDemoUser(req);
  res.render("dashboard/billing", {
    title: "Billing | MediCore Pro",
    user: req.session.user,
    invoices: sample.invoices,
  });
});

router.get("/reports", (req, res) => {
  ensureDemoUser(req);
  res.render("dashboard/reports", {
    title: "Reports | MediCore Pro",
    user: req.session.user,
    appointments: sample.appointments,
    medicines: sample.medicines,
    invoices: sample.invoices,
  });
});

router.get("/notifications", (req, res) => {
  ensureDemoUser(req);
  res.render("dashboard/notifications", {
    title: "Notifications | MediCore Pro",
    user: req.session.user,
    notifications: sample.notifications,
  });
});

router.get("/settings", (req, res) => {
  ensureDemoUser(req);
  res.render("dashboard/settings", {
    title: "Settings | MediCore Pro",
    user: req.session.user,
  });
});

router.get("/api/dashboard/stats", (req, res) => {
  res.json(loadDemoDashboardData().stats);
});

router.get("/api/patients", (req, res) => {
  res.json(sample.patients);
});

router.get("/api/medicines", (req, res) => {
  res.json(sample.medicines);
});

router.get("/api/notifications", (req, res) => {
  res.json(sample.notifications);
});

router.post("/appointments", async (req, res) => {
  ensureDemoUser(req);

  try {
    const { patient_id, doctor_id, appointment_date, status, reason, notes } =
      req.body;
    await db.query(
      "INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [
        patient_id,
        doctor_id,
        appointment_date,
        status || "scheduled",
        reason || null,
        notes || null,
      ],
    );

    const data = await loadAppointmentFormData();
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      ...data,
      successMessage: "Appointment booked successfully.",
    });
  } catch (error) {
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      appointments: [],
      patients: [],
      doctors: [],
      successMessage: databaseMessage(error),
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
