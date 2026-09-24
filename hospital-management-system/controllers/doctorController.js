const db = require("../config/db");
const sample = require("../data/sample");

async function list(req, res) {
  try {
    const doctors = await db.query(
      `SELECT d.id, d.full_name, d.specialty, d.department, d.schedule, d.phone, d.email,
              COUNT(a.id) AS total_appointments,
              SUM(DATE(a.appointment_date) = CURDATE()) AS appointments_today
       FROM doctors d
       LEFT JOIN appointments a ON a.doctor_id = d.id
       GROUP BY d.id, d.full_name, d.specialty, d.department, d.schedule, d.phone, d.email
       ORDER BY d.full_name`,
    );

    res.render("dashboard/doctors", {
      title: "Doctors | MediCore Pro",
      doctors,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.render("dashboard/doctors", {
      title: "Doctors | MediCore Pro",
      doctors: sample.doctors,
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data; new doctors can't be saved right now.`,
    });
  }
}

async function create(req, res) {
  const { full_name, specialty, department, schedule, phone, email } = req.body;

  if (!full_name || !full_name.trim()) {
    req.flash("error", "Doctor name is required.");
    return res.redirect("/doctors");
  }

  try {
    await db.query(
      "INSERT INTO doctors (full_name, specialty, department, schedule, phone, email) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name.trim(), specialty || null, department || specialty || null, schedule || "Weekdays", phone || null, email || null],
    );
    req.flash("success", `${full_name.trim()} was added to the staff directory.`);
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", `Could not save doctor: database is unavailable (${error.code || error.message}).`);
  }

  res.redirect("/doctors");
}

module.exports = { list, create };
