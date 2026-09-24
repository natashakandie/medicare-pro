const db = require("../config/db");
const sample = require("../data/sample");

const VALID_STATUSES = new Set(["scheduled", "confirmed", "completed", "cancelled"]);

async function loadFormData() {
  const [appointments, patients, doctors] = await Promise.all([
    db.query(
      `SELECT a.id, a.appointment_date, a.status, a.reason, p.full_name AS patient_name, d.full_name AS doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       ORDER BY a.appointment_date DESC`,
    ),
    db.query("SELECT id, full_name FROM patients ORDER BY full_name"),
    db.query("SELECT id, full_name FROM doctors ORDER BY full_name"),
  ]);
  return { appointments, patients, doctors };
}

async function list(req, res) {
  try {
    const data = await loadFormData();
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      ...data,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.render("dashboard/appointments", {
      title: "Appointments | MediCore Pro",
      appointments: sample.appointments,
      patients: sample.patients,
      doctors: sample.doctors,
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data; bookings can't be saved right now.`,
    });
  }
}

async function create(req, res) {
  const { patient_id, doctor_id, appointment_date, status, reason, notes } = req.body;

  if (!patient_id || !doctor_id || !appointment_date) {
    req.flash("error", "Patient, doctor and date/time are all required.");
    return res.redirect("/appointments");
  }

  const safeStatus = VALID_STATUSES.has(status) ? status : "scheduled";

  try {
    await db.query(
      "INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [Number(patient_id), Number(doctor_id), appointment_date.replace("T", " "), safeStatus, reason || null, notes || null],
    );
    req.flash("success", "Appointment booked successfully.");
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", `Could not book appointment: database is unavailable (${error.code || error.message}).`);
  }

  res.redirect("/appointments");
}

async function updateStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || !VALID_STATUSES.has(status)) {
    req.flash("error", "Invalid appointment status update.");
    return res.redirect("/appointments");
  }

  try {
    await db.query("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
    req.flash("success", `Appointment marked as ${status}.`);
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", `Could not update appointment: database is unavailable (${error.code || error.message}).`);
  }

  res.redirect("/appointments");
}

module.exports = { list, create, updateStatus };
