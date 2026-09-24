const db = require("../config/db");
const sample = require("../data/sample");

async function list(req, res) {
  try {
    const invoices = await db.query(
      `SELECT i.id, i.invoice_code, i.total_amount, i.paid_amount, i.status, i.due_date, p.full_name AS patient_name
       FROM invoices i JOIN patients p ON p.id = i.patient_id
       ORDER BY i.created_at DESC`,
    );
    res.render("dashboard/billing", {
      title: "Billing | MediCore Pro",
      invoices,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.render("dashboard/billing", {
      title: "Billing | MediCore Pro",
      invoices: sample.invoices,
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data; payments can't be recorded right now.`,
    });
  }
}

async function recordPayment(req, res) {
  const id = Number(req.params.id);
  const amount = Number(req.body.amount);
  const method = String(req.body.method || "Cash");

  if (!Number.isInteger(id) || !(amount > 0)) {
    req.flash("error", "Enter a valid payment amount.");
    return res.redirect("/billing");
  }

  try {
    await db.transaction(async (connection) => {
      const [rows] = await connection.query("SELECT invoice_code, total_amount, paid_amount FROM invoices WHERE id = ? FOR UPDATE", [id]);
      const invoice = rows[0];
      if (!invoice) throw new Error("NOT_FOUND");

      const newPaid = Math.min(Number(invoice.paid_amount) + amount, Number(invoice.total_amount));
      const status = newPaid >= Number(invoice.total_amount) ? "paid" : newPaid > 0 ? "partial" : "pending";

      await connection.query("UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?", [newPaid, status, id]);
      await connection.query("INSERT INTO payments (invoice_id, amount, method) VALUES (?, ?, ?)", [id, amount, method]);

      req.flash("success", `Payment of KES ${amount.toLocaleString()} recorded for ${invoice.invoice_code}.`);
    });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      req.flash("error", "That invoice no longer exists.");
    } else if (db.isDbUnavailable(error)) {
      req.flash("error", `Could not record payment: database is unavailable (${error.code || error.message}).`);
    } else {
      throw error;
    }
  }

  res.redirect("/billing");
}

module.exports = { list, recordPayment };
