/** Quick standalone DB connectivity check: `npm run db:healthcheck` */
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { healthCheck, pool } = require("../config/db");

healthCheck().then((result) => {
  console.log(result.ok ? "OK" : "FAILED", "-", result.message);
  pool.end();
  process.exit(result.ok ? 0 : 1);
});
