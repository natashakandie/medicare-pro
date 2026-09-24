const bcrypt = require("bcryptjs");
const db = require("../config/db");
const sample = require("../data/sample");

function showLogin(req, res) {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("dashboard/login", {
    title: "Login | MediCore Pro",
    error: null,
  });
}

async function login(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const fail = (message) => {
    res.status(401);
    return res.render("dashboard/login", {
      title: "Login | MediCore Pro",
      error: message,
    });
  };

  if (!email || !password) return fail("Enter both email and password.");

  try {
    const dbUser = await db.queryOne(
      "SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (!dbUser) return fail("No account matches that email address.");
    if (!dbUser.is_active) return fail("This account has been disabled. Contact an administrator.");

    const valid = await bcrypt.compare(password, dbUser.password_hash);
    if (!valid) return fail("Incorrect password.");

    req.session.user = { id: dbUser.id, name: dbUser.full_name, email: dbUser.email, role: dbUser.role };
    db.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [dbUser.id]).catch(() => {});

    const redirectTo = req.session.returnTo || "/dashboard";
    delete req.session.returnTo;
    return res.redirect(redirectTo);
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;

    // Demo fallback so the UI can still be presented without a database.
    const demoUser = sample.demoAccounts.find((account) => account.email === email);
    if (!demoUser || demoUser.password !== password) {
      return fail("Database is unavailable and no matching demo account was found.");
    }

    req.session.user = { id: demoUser.id, name: demoUser.full_name, email: demoUser.email, role: demoUser.role };
    req.session.demoMode = true;
    const demoRedirectTo = req.session.returnTo || "/dashboard";
    delete req.session.returnTo;
    return res.redirect(demoRedirectTo);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
}

module.exports = { showLogin, login, logout };
