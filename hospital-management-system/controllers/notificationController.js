const db = require("../config/db");
const sample = require("../data/sample");

async function list(req, res) {
  try {
    const notifications = await db.query("SELECT id, title, message, is_read, created_at FROM notifications ORDER BY created_at DESC");
    res.render("dashboard/notifications", {
      title: "Notifications | MediCore Pro",
      notifications,
      dbMessage: null,
    });
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    res.render("dashboard/notifications", {
      title: "Notifications | MediCore Pro",
      notifications: sample.notifications,
      dbMessage: `Database unavailable (${error.code || error.message}). Showing demo data.`,
    });
  }
}

async function markRead(req, res) {
  const id = Number(req.params.id);
  try {
    if (Number.isInteger(id)) await db.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
  }
  res.redirect("/notifications");
}

async function markAllRead(req, res) {
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
    req.flash("success", "All notifications marked as read.");
  } catch (error) {
    if (!db.isDbUnavailable(error)) throw error;
    req.flash("error", "Database unavailable; couldn't update notifications.");
  }
  res.redirect("/notifications");
}

module.exports = { list, markRead, markAllRead };
