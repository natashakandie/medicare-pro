const db = require("../config/db");
const sample = require("../data/sample");

async function loadStats() {
  const [
    totalPatients,
    todayAppointments,
    doctorsOnDuty,
    totalAppointments,
    pendingBills,
    lowStock,
    unreadNotifications,
  ] = await Promise.all([
    db.queryOne("SELECT COUNT(*) AS count FROM patients"),
    db.queryOne("SELECT COUNT(*) AS count FROM appointments WHERE DATE(appointment_date) = CURDATE()"),
    db.queryOne("SELECT COUNT(*) AS count FROM doctors"),
    db.queryOne("SELECT COUNT(*) AS count FROM appointments"),
    db.queryOne("SELECT COUNT(*) AS count FROM invoices WHERE status <> 'paid'"),
    db.queryOne("SELECT COUNT(*) AS count FROM medicines WHERE stock_quantity <= reorder_level"),
    db.queryOne("SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0"),
  ]);

  return {
    totalPatients: totalPatients.count,
    todayAppointments: todayAppointments.count,
    doctorsOnDuty: doctorsOnDuty.count,
    totalAppointments: totalAppointments.count,
    pendingBills: pendingBills.count,
    lowStock: lowStock.count,
    unreadNotifications: unreadNotifications.count,
  };
}

async function index(req, res) {
  try {
    const [patients, appointments, stats] = await Promise.all([
      db.query("SELECT id, full_name, phone, blood_group FROM patients ORDER BY id DESC LIMIT 5"),
      db.query(
        `SELECT a.id, a.appointment_date, a.status, p.full_name AS patient_name, d.full_name AS doctor_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN doctors d ON a.doctor_id = d.id
         ORDER BY a.appointment_date DESC LIMIT 5`,
      ),
      loadStats(),
    ]);

    res.render("dashboard/index", {
      title: "Dashboard | MediCore Pro",
      patients,
      appointments,
      stats,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;

    res.render("dashboard/index", {
      title: "Dashboard | MediCore Pro",
      patients: sample.patients.slice(0, 5),
      appointments: sample.appointments.slice(0, 5),
      stats: {
        totalPatients: sample.patients.length,
        todayAppointments: sample.appointments.filter((a) => a.appointment_date.startsWith(new Date().toISOString().slice(0, 10))).length,
        doctorsOnDuty: sample.doctors.length,
        totalAppointments: sample.appointments.length,
        pendingBills: sample.invoices.filter((i) => i.status !== "paid").length,
        lowStock: sample.medicines.filter((m) => m.stock_quantity <= m.reorder_level).length,
        unreadNotifications: sample.notifications.filter((n) => !n.is_read).length,
      },
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data.`,
    });
  }
}

module.exports = { index, loadStats };
