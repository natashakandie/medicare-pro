const express = require("express");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const db = require("./config/db");
const flash = require("./middleware/flash");
const locals = require("./middleware/locals");
const securityHeaders = require("./middleware/security");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");
// Behind cPanel's Passenger/LiteSpeed reverse proxy, TLS is terminated before
// Node ever sees the request. Without this, Express thinks every request is
// plain HTTP, so a "secure" session cookie (required in production) is never
// set and logins silently fail to persist.
app.set("trust proxy", 1);

app.use(securityHeaders);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), { maxAge: isProduction ? "1d" : 0 }));

if (!process.env.SESSION_SECRET) {
  console.warn("[medicore] SESSION_SECRET is not set in .env — using an insecure default. Set it before deploying.");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "medicare-pro-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  }),
);

app.use(flash);
app.use(locals);

app.use(require("./routes/index"));

// 404
app.use((req, res) => {
  res.status(404).render("errors/404", { title: "Not found | MediCore Pro" });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(`[medicore] ${req.method} ${req.originalUrl} ->`, err);
  const status = err.status || 500;
  res.status(status).render("errors/500", {
    title: "Error | MediCore Pro",
    message: isProduction ? "An unexpected error occurred. Please try again." : err.message,
  });
});

function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, () => {
    console.log(`MediCore Pro is running at http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.log(`Port ${port} is busy. Trying ${port + 1}...`);
      startServer(port + 1, attemptsLeft - 1);
      return;
    }
    console.error("Failed to start server:", err);
    process.exit(1);
  });

  return server;
}

async function main() {
  const health = await db.healthCheck();
  console.log(health.ok ? `[medicore] Database OK: ${health.message}` : `[medicore] Database WARNING: ${health.message}`);
  if (!health.ok) {
    console.log('[medicore] The app will still start and fall back to demo data. Run "npm run db:setup" to fix this.');
  }
  startServer(PORT);
}

main();

process.on("SIGTERM", () => {
  db.pool.end().finally(() => process.exit(0));
});

module.exports = app;
