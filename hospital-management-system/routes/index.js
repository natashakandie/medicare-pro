const express = require("express");
const router = express.Router();

const { requireAuth, requirePage, requireRole } = require("../middleware/auth");
const auth = require("../controllers/authController");
const dashboard = require("../controllers/dashboardController");
const patients = require("../controllers/patientController");
const doctors = require("../controllers/doctorController");
const appointments = require("../controllers/appointmentController");
const pharmacy = require("../controllers/pharmacyController");
const billing = require("../controllers/billingController");
const reports = require("../controllers/reportController");
const notifications = require("../controllers/notificationController");
const settings = require("../controllers/settingsController");
const staff = require("../controllers/staffController");
const api = require("../controllers/apiController");
const db = require("../config/db");

/** Wraps an async handler so a rejected promise reaches Express's error handler. */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// --- Public -----------------------------------------------------------
router.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("dashboard/home", { title: "MediCore Pro | Smart Hospital Platform" });
});

router.get("/login", auth.showLogin);
router.post("/login", wrap(auth.login));
router.get("/logout", auth.logout);

// Browsers request this automatically on every page load. Without a real
// route it fell through to the auth guard, which broke the post-login redirect.
router.get("/favicon.ico", (req, res) => res.redirect(301, "/images/medicore-logo.svg"));

router.get("/health", wrap(async (req, res) => {
  const result = await db.healthCheck();
  res.status(result.ok ? 200 : 503).json(result);
}));

// --- Everything below requires a signed-in session ---------------------
router.use(requireAuth);

router.get("/dashboard", requirePage("dashboard"), wrap(dashboard.index));

router.get("/patients", requirePage("patients"), wrap(patients.list));
router.post("/patients", requirePage("patients"), requireRole("Admin", "Receptionist", "Nurse"), wrap(patients.create));
router.get("/patients/:id", requirePage("patients"), wrap(patients.detail));

router.get("/doctors", requirePage("doctors"), wrap(doctors.list));
router.post("/doctors", requirePage("doctors"), requireRole("Admin"), wrap(doctors.create));

router.get("/staff", requirePage("staff"), requireRole("Admin"), wrap(staff.list));
router.post("/staff", requirePage("staff"), requireRole("Admin"), wrap(staff.create));
router.post("/staff/:id/status", requirePage("staff"), requireRole("Admin"), wrap(staff.toggleActive));
router.post("/staff/:id/reset-password", requirePage("staff"), requireRole("Admin"), wrap(staff.resetPassword));

router.get("/appointments", requirePage("appointments"), wrap(appointments.list));
router.post("/appointments", requirePage("appointments"), requireRole("Admin", "Receptionist", "Doctor", "Nurse"), wrap(appointments.create));
router.post("/appointments/:id/status", requirePage("appointments"), requireRole("Admin", "Receptionist", "Doctor", "Nurse"), wrap(appointments.updateStatus));

router.get("/pharmacy", requirePage("pharmacy"), wrap(pharmacy.list));
router.post("/pharmacy/dispense", requirePage("pharmacy"), requireRole("Admin", "Pharmacist"), wrap(pharmacy.dispense));

router.get("/billing", requirePage("billing"), wrap(billing.list));
router.post("/billing/:id/pay", requirePage("billing"), requireRole("Admin", "Receptionist"), wrap(billing.recordPayment));

router.get("/reports", requirePage("reports"), wrap(reports.index));

router.get("/notifications", requirePage("notifications"), wrap(notifications.list));
router.post("/notifications/:id/read", requirePage("notifications"), wrap(notifications.markRead));
router.post("/notifications/read-all", requirePage("notifications"), wrap(notifications.markAllRead));

router.get("/settings", requirePage("settings"), settings.show);
router.post("/settings/profile", requirePage("settings"), wrap(settings.updateProfile));
router.post("/settings/password", requirePage("settings"), wrap(settings.changePassword));

router.get("/api/dashboard/stats", wrap(api.stats));
router.get("/api/patients", requirePage("patients"), wrap(api.patients));
router.get("/api/medicines", requirePage("pharmacy"), wrap(api.medicines));
router.get("/api/notifications", wrap(api.notifications));

module.exports = router;
