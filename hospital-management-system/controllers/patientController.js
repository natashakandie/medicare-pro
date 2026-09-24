const db = require("../config/db");
const sample = require("../data/sample");

const PATIENT_COLUMNS =
  "id, patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact, medical_history, created_at";

function nextPatientCode() {
  return `MCP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
}

async function list(req, res) {
  const search = String(req.query.q || "").trim();

  try {
    const patients = search
      ? await db.query(
          `SELECT ${PATIENT_COLUMNS} FROM patients
           WHERE full_name LIKE ? OR phone LIKE ? OR patient_code LIKE ?
           ORDER BY id DESC`,
          [`%${search}%`, `%${search}%`, `%${search}%`],
        )
      : await db.query(`SELECT ${PATIENT_COLUMNS} FROM patients ORDER BY id DESC`);

    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      patients,
      search,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.render("dashboard/patients", {
      title: "Patients | MediCore Pro",
      patients: sample.patients,
      search,
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data; new patients can't be saved right now.`,
    });
  }
}

async function create(req, res) {
  const { full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact } = req.body;

  if (!full_name || !full_name.trim()) {
    req.flash("error", "Full name is required.");
    return res.redirect("/patients");
  }

  try {
    await db.query(
      `INSERT INTO patients
        (patient_code, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextPatientCode(),
        full_name.trim(),
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
    req.flash("success", `${full_name.trim()} was added to the patient directory.`);
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", `Could not save patient: database is unavailable (${error.code || error.message}).`);
  }

  res.redirect("/patients");
}

async function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).render("errors/404", { title: "Not found" });

  try {
    const patient = await db.queryOne(`SELECT ${PATIENT_COLUMNS} FROM patients WHERE id = ?`, [id]);
    if (!patient) return res.status(404).render("errors/404", { title: "Patient not found" });

    const [visits, invoices, appointments] = await Promise.all([
      db.query(
        `SELECT v.id, v.symptoms, v.diagnosis, v.vitals, v.notes, v.created_at, d.full_name AS doctor_name
         FROM visits v LEFT JOIN doctors d ON d.id = v.doctor_id
         WHERE v.patient_id = ? ORDER BY v.created_at DESC`,
        [id],
      ),
      db.query(
        "SELECT id, invoice_code, total_amount, paid_amount, status, due_date FROM invoices WHERE patient_id = ? ORDER BY created_at DESC",
        [id],
      ),
      db.query(
        `SELECT a.id, a.appointment_date, a.status, a.reason, d.full_name AS doctor_name
         FROM appointments a JOIN doctors d ON d.id = a.doctor_id
         WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`,
        [id],
      ),
    ]);

    res.render("dashboard/patient-detail", {
      title: `${patient.full_name} | MediCore Pro`,
      patient,
      visits,
      invoices,
      appointments,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;

    const patient = sample.patients.find((item) => item.id === id) || sample.patients[0];
    res.render("dashboard/patient-detail", {
      title: `${patient.full_name} | MediCore Pro`,
      patient,
      visits: sample.visits.filter((v) => v.patient_id === patient.id),
      invoices: sample.invoices.filter((i) => i.patient_id === patient.id),
      appointments: sample.appointments.filter((a) => a.patient_id === patient.id),
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data.`,
    });
  }
}

module.exports = { list, create, detail };
