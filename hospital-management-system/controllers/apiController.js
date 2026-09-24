const db = require("../config/db");
const sample = require("../data/sample");
const dashboardController = require("./dashboardController");

async function stats(req, res) {
  try {
    res.json(await dashboardController.loadStats());
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.json({
      totalPatients: sample.patients.length,
      todayAppointments: 2,
      doctorsOnDuty: sample.doctors.length,
      totalAppointments: sample.appointments.length,
      pendingBills: sample.invoices.filter((i) => i.status !== "paid").length,
      lowStock: sample.medicines.filter((m) => m.stock_quantity <= m.reorder_level).length,
      unreadNotifications: sample.notifications.filter((n) => !n.is_read).length,
      demo: true,
    });
  }
}

async function patients(req, res) {
  try {
    res.json(await db.query("SELECT id, patient_code, full_name, phone, blood_group FROM patients ORDER BY id DESC"));
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.json(sample.patients);
  }
}

async function medicines(req, res) {
  try {
    res.json(await db.query("SELECT id, name, stock_quantity, reorder_level, unit_price FROM medicines ORDER BY name"));
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.json(sample.medicines);
  }
}

async function notifications(req, res) {
  try {
    res.json(await db.query("SELECT id, title, message, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT 20"));
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.json(sample.notifications);
  }
}

module.exports = { stats, patients, medicines, notifications };
