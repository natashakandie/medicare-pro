const db = require("../config/db");
const sample = require("../data/sample");

async function index(req, res) {
  try {
    const [revenueRow, statusCounts, appointmentTotal, medicines, topMedicineRow] = await Promise.all([
      db.queryOne("SELECT COALESCE(SUM(paid_amount), 0) AS revenue FROM invoices"),
      db.query("SELECT status, COUNT(*) AS count FROM appointments GROUP BY status"),
      db.queryOne("SELECT COUNT(*) AS count FROM appointments"),
      db.query("SELECT id, name, stock_quantity, reorder_level FROM medicines ORDER BY stock_quantity DESC"),
      db.queryOne(
        `SELECT m.name, SUM(pi.quantity) AS total_dispensed
         FROM prescription_items pi JOIN medicines m ON m.id = pi.medicine_id
         GROUP BY m.id, m.name ORDER BY total_dispensed DESC LIMIT 1`,
      ),
    ]);

    res.render("dashboard/reports", {
      title: "Reports | MediCore Pro",
      revenue: revenueRow.revenue,
      statusCounts,
      totalAppointments: appointmentTotal.count,
      medicines,
      topMedicine: topMedicineRow ? topMedicineRow.name : "No dispensing data yet",
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;

    const statusTally = {};
    for (const a of sample.appointments) statusTally[a.status] = (statusTally[a.status] || 0) + 1;

    res.render("dashboard/reports", {
      title: "Reports | MediCore Pro",
      revenue: sample.payments.reduce((sum, p) => sum + p.amount, 0),
      statusCounts: Object.entries(statusTally).map(([status, count]) => ({ status, count })),
      totalAppointments: sample.appointments.length,
      medicines: sample.medicines,
      topMedicine: "Paracetamol 500mg",
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data.`,
    });
  }
}

module.exports = { index };
