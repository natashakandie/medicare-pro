const { canAccess } = require("../lib/permissions");

/** Redirects anonymous visitors to the login page, remembering where they wanted to go. */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();

  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Only remember real page navigations. Otherwise a browser's automatic
  // /favicon.ico (or similar) request gets stored here first and hijacks the
  // post-login redirect away from /dashboard.
  if (req.method === "GET" && req.accepts("html") === "html") {
    req.session.returnTo = req.originalUrl;
  }

  req.flash("error", "Please sign in to continue.");
  return res.redirect("/login");
}

/** Blocks users whose role is not allowed on the page. */
function requirePage(pageKey) {
  return (req, res, next) => {
    const role = req.session.user?.role;
    if (canAccess(role, pageKey)) return next();

    req.flash("error", `Your ${role} account does not have access to that area.`);
    return res.redirect("/dashboard");
  };
}

/** Allows only the listed roles (Admin always passes). */
function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.session.user?.role;
    if (role === "Admin" || roles.includes(role)) return next();

    req.flash("error", "You do not have permission to perform that action.");
    return res.redirect(req.get("Referrer") || "/dashboard");
  };
}

module.exports = { requireAuth, requirePage, requireRole };
