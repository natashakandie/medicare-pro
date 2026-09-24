const format = require("../lib/format");
const { pagesFor } = require("../lib/permissions");
const { name, version } = require("../../package.json");
const db = require("../config/db");
const icon = require("../lib/icons");

/** Values every view can use without controllers passing them explicitly. */
async function locals(req, res, next) {
  const user = req.session?.user || null;
  res.locals.user = user;
  res.locals.navPages = user ? pagesFor(user.role) : [];
  res.locals.currentPath = req.path;
  res.locals.appName = "MediCore Pro";
  res.locals.appVersion = version;
  res.locals.packageName = name;
  res.locals.demoMode = false;
  res.locals.fmt = format;
  res.locals.icon = icon;
  res.locals.csrfToken = null; // placeholder; forms use same-site cookies
  res.locals.unreadCount = 0;

  if (user) {
    try {
      const row = await db.queryOne("SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0");
      res.locals.unreadCount = row.count;
    } catch (error) {
      if (!db.isDbUnavailable(error)) throw error;
      res.locals.unreadCount = 0;
    }
  }

  next();
}

module.exports = locals;
