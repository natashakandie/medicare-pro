const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { ROLES } = require("../lib/permissions");

async function list(req, res) {
  try {
    const staff = await db.query(
      "SELECT id, full_name, email, role, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC",
    );
    res.render("dashboard/staff", { title: "Staff | MediCore Pro", staff, roles: ROLES, dbMessage: null });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.render("dashboard/staff", {
      title: "Staff | MediCore Pro",
      staff: [],
      roles: ROLES,
      dbMessage: `Database unavailable (${error.code || error.message}). Staff accounts can't be managed right now.`,
    });
  }
}

async function create(req, res) {
  const fullName = String(req.body.full_name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "");
  const { specialty, department, schedule, phone } = req.body;

  if (!fullName || !email) {
    req.flash("error", "Full name and email are required.");
    return res.redirect("/staff");
  }
  if (!ROLES.includes(role)) {
    req.flash("error", "Choose a valid role.");
    return res.redirect("/staff");
  }
  if (password.length < 8) {
    req.flash("error", "Password must be at least 8 characters.");
    return res.redirect("/staff");
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    await db.transaction(async (connection) => {
      await connection.query(
        "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [fullName, email, hash, role],
      );

      // Doctor accounts also need a directory entry so they show up for scheduling.
      if (role === "Doctor") {
        await connection.query(
          "INSERT INTO doctors (full_name, specialty, department, schedule, phone, email) VALUES (?, ?, ?, ?, ?, ?)",
          [fullName, specialty || null, department || specialty || null, schedule || "Weekdays", phone || null, email],
        );
      }
    });

    req.flash("success", `${fullName} was registered as ${role}. Share the password with them securely — it won't be shown again.`);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      req.flash("error", `An account with ${email} already exists.`);
    } else if (db.isDbUnavailable(error)) {
      req.flash("error", `Could not register staff: database is unavailable (${error.code || error.message}).`);
    } else {
      throw error;
    }
  }

  res.redirect("/staff");
}

async function toggleActive(req, res) {
  const id = Number(req.params.id);

  if (id === req.session.user.id) {
    req.flash("error", "You can't disable your own account.");
    return res.redirect("/staff");
  }

  try {
    const user = await db.queryOne("SELECT is_active, full_name FROM users WHERE id = ?", [id]);
    if (!user) {
      req.flash("error", "That staff account no longer exists.");
      return res.redirect("/staff");
    }

    await db.query("UPDATE users SET is_active = ? WHERE id = ?", [user.is_active ? 0 : 1, id]);
    req.flash("success", `${user.full_name} was ${user.is_active ? "disabled" : "re-enabled"}.`);
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", "Database unavailable; account status can't be changed right now.");
  }

  res.redirect("/staff");
}

async function resetPassword(req, res) {
  const id = Number(req.params.id);
  const newPassword = String(req.body.new_password || "");

  if (newPassword.length < 8) {
    req.flash("error", "New password must be at least 8 characters.");
    return res.redirect("/staff");
  }

  try {
    const user = await db.queryOne("SELECT full_name FROM users WHERE id = ?", [id]);
    if (!user) {
      req.flash("error", "That staff account no longer exists.");
      return res.redirect("/staff");
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, id]);
    req.flash("success", `Password reset for ${user.full_name}.`);
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", "Database unavailable; password can't be reset right now.");
  }

  res.redirect("/staff");
}

module.exports = { list, create, toggleActive, resetPassword };
