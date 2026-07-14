const express = require("express");
const router = express.Router();
const db = require("../config/db");

function ensureDemoUser(req) {
  if (!req.session.user) {
    req.session.user = {
      name: "Demo Administrator",
      email: "admin@medicare.com",
      role: "Administrator",
    };
  }
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
  const email = req.body.email || "";
  req.session.user = {
    name: email.split("@")[0].replace(/\./g, " "),
    email,
    role: "Care Coordinator",
  };
  res.redirect("/dashboard");
});

router.get("/dashboard", async (req, res) => {
  ensureDemoUser(req);

  try {
    const [patients] = await db.query(
      "SELECT id, full_name, phone, blood_group FROM patients ORDER BY id DESC LIMIT 5",
    );
    const [appointments] = await db.query(
      "SELECT a.id, a.appointment_date, a.status, p.full_name AS patient_name, d.full_name AS doctor_name FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id ORDER BY a.appointment_date DESC LIMIT 5",
    );

    res.render("dashboard/index", {
      title: "Dashboard | MediCore Pro",
      user: req.session.user,
      patients,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.render("dashboard/index", {
      title: "Dashboard | MediCore Pro",
      user: req.session.user,
      patients: [],
      appointments: [],
      dbMessage: "Database connection unavailable. Showing empty placeholders.",
    });
  }
});

router.get("/patients", async (req, res) => {
  ensureDemoUser(req);

  try {
    const [patients] = await db.query(
      "SELECT id, full_name, phone, blood_group, emergency_contact FROM patients ORDER BY id DESC",
    );
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients,
      successMessage: null,
    });
  } catch (error) {
    console.error(error);
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients: [],
      successMessage: null,
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

    const [patients] = await db.query(
      "SELECT id, full_name, phone, blood_group, emergency_contact FROM patients ORDER BY id DESC",
    );
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients,
      successMessage: "Patient added successfully.",
    });
  } catch (error) {
    console.error(error);
    const [patients] = await db.query(
      "SELECT id, full_name, phone, blood_group, emergency_contact FROM patients ORDER BY id DESC",
    );
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      user: req.session.user,
      patients,
      successMessage: "Unable to save patient record right now.",
    });
  }
});

router.get("/appointments", async (req, res) => {
  ensureDemoUser(req);

  try {
    const [appointments] = await db.query(
      "SELECT a.id, a.appointment_date, a.status, p.full_name AS patient_name, d.full_name AS doctor_name FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id ORDER BY a.appointment_date DESC",
    );
    const [patients] = await db.query(
      "SELECT id, full_name FROM patients ORDER BY full_name",
    );
    const [doctors] = await db.query(
      "SELECT id, full_name FROM doctors ORDER BY full_name",
    );
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      appointments,
      patients,
      doctors,
      successMessage: null,
    });
  } catch (error) {
    console.error(error);
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      appointments: [],
      patients: [],
      doctors: [],
      successMessage: null,
    });
  }
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

    const [appointments] = await db.query(
      "SELECT a.id, a.appointment_date, a.status, p.full_name AS patient_name, d.full_name AS doctor_name FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id ORDER BY a.appointment_date DESC",
    );
    const [patients] = await db.query(
      "SELECT id, full_name FROM patients ORDER BY full_name",
    );
    const [doctors] = await db.query(
      "SELECT id, full_name FROM doctors ORDER BY full_name",
    );
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      appointments,
      patients,
      doctors,
      successMessage: "Appointment booked successfully.",
    });
  } catch (error) {
    console.error(error);
    const [appointments] = await db.query(
      "SELECT a.id, a.appointment_date, a.status, p.full_name AS patient_name, d.full_name AS doctor_name FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id ORDER BY a.appointment_date DESC",
    );
    const [patients] = await db.query(
      "SELECT id, full_name FROM patients ORDER BY full_name",
    );
    const [doctors] = await db.query(
      "SELECT id, full_name FROM doctors ORDER BY full_name",
    );
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      user: req.session.user,
      appointments,
      patients,
      doctors,
      successMessage: "Unable to create appointment right now.",
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
