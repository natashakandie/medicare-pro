const db = require("../config/db");
const sample = require("../data/sample");

async function list(req, res) {
  try {
    const medicines = await db.query(
      "SELECT id, name, generic_name, category, dosage_form, stock_quantity, unit_price, expiry_date, reorder_level FROM medicines ORDER BY name",
    );
    res.render("dashboard/pharmacy", {
      title: "Pharmacy | MediCore Pro",
      medicines,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.render("dashboard/pharmacy", {
      title: "Pharmacy | MediCore Pro",
      medicines: sample.medicines,
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data; dispensing is disabled.`,
    });
  }
}

async function dispense(req, res) {
  const medicineId = Number(req.body.medicine_id);
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(medicineId) || !Number.isInteger(quantity) || quantity <= 0) {
    req.flash("error", "Choose a medicine and a valid quantity to dispense.");
    return res.redirect("/pharmacy");
  }

  try {
    await db.transaction(async (connection) => {
      const [rows] = await connection.query("SELECT name, stock_quantity FROM medicines WHERE id = ? FOR UPDATE", [medicineId]);
      const medicine = rows[0];
      if (!medicine) throw new Error("NOT_FOUND");
      if (medicine.stock_quantity < quantity) throw new Error("INSUFFICIENT_STOCK");

      await connection.query("UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?", [quantity, medicineId]);
      await connection.query(
        "INSERT INTO inventory_logs (medicine_id, quantity_change, reason, created_by) VALUES (?, ?, ?, ?)",
        [medicineId, -quantity, "Dispensed via pharmacy desk", req.session.user?.email || "system"],
      );

      req.flash("success", `Dispensed ${quantity} unit(s) of ${medicine.name}.`);
    });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      req.flash("error", "That medicine no longer exists.");
    } else if (error.message === "INSUFFICIENT_STOCK") {
      req.flash("error", "Not enough stock to dispense that quantity.");
    } else if (db.isDbUnavailable(error)) {
      req.flash("error", `Could not dispense: database is unavailable (${error.code || error.message}).`);
    } else {
      throw error;
    }
  }

  res.redirect("/pharmacy");
}

module.exports = { list, dispense };
