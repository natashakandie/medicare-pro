const bcrypt = require("bcryptjs");
const db = require("../config/db");

function show(req, res) {
  res.render("dashboard/settings", {
    title: "Settings | MediCore Pro",
    demoAccounts: [
      { email: "admin@medicore.pro", password: "Admin@123" },
      { email: "doctor@medicore.pro", password: "Doctor@123" },
      { email: "nurse@medicore.pro", password: "Nurse@123" },
      { email: "reception@medicore.pro", password: "Reception@123" },
      { email: "pharmacy@medicore.pro", password: "Pharmacy@123" },
      { email: "patient@medicore.pro", password: "Patient@123" },
    ],
  });
}

async function updateProfile(req, res) {
  const fullName = String(req.body.full_name || "").trim();
  if (!fullName) {
    req.flash("error", "Name cannot be empty.");
    return res.redirect("/settings");
  }

  try {
    await db.query("UPDATE users SET full_name = ? WHERE id = ?", [fullName, req.session.user.id]);
    req.session.user.name = fullName;
    req.flash("success", "Profile updated.");
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", "Database unavailable; profile changes are not saved in demo mode.");
  }

  res.redirect("/settings");
}

async function changePassword(req, res) {
  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password || new_password !== confirm_password) {
    req.flash("error", "Check your current password and make sure the new password matches its confirmation.");
    return res.redirect("/settings");
  }
  if (new_password.length < 8) {
    req.flash("error", "New password must be at least 8 characters.");
    return res.redirect("/settings");
  }

  try {
    const user = await db.queryOne("SELECT password_hash FROM users WHERE id = ?", [req.session.user.id]);
    const valid = user && (await bcrypt.compare(current_password, user.password_hash));
    if (!valid) {
      req.flash("error", "Current password is incorrect.");
      return res.redirect("/settings");
    }

    const hash = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.session.user.id]);
    req.flash("success", "Password changed successfully.");
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", "Database unavailable; password changes are not saved in demo mode.");
  }

  res.redirect("/settings");
}

module.exports = { show, updateProfile, changePassword };
