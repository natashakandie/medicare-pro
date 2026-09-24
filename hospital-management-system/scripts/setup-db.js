/**
 * Creates the database (if needed) and applies schema.sql, which is safe to
 * run repeatedly: tables/columns are added only if missing, and starter rows
 * are inserted only if they don't already exist.
 *
 *   npm run db:setup
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const SQL_FILE = path.join(__dirname, "..", "database", "hospital_management_system.sql");

async function main() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "hospital_management_system";

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  console.log(`Creating database "${database}" if it doesn't exist...`);
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.query(`USE \`${database}\``);

  const sql = fs.readFileSync(SQL_FILE, "utf8");

  console.log("Applying hospital_management_system.sql ...");
  await connection.query(sql);
  await connection.end();

  console.log("Database is ready.");
  console.log("");
  console.log("Demo login accounts (email / password):");
  console.log("  admin@medicore.pro      / Admin@123");
  console.log("  doctor@medicore.pro     / Doctor@123");
  console.log("  nurse@medicore.pro      / Nurse@123");
  console.log("  reception@medicore.pro  / Reception@123");
  console.log("  pharmacy@medicore.pro   / Pharmacy@123");
  console.log("  patient@medicore.pro    / Patient@123");
}

main().catch((error) => {
  console.error("Database setup failed:");
  console.error(`  ${error.code || ""} ${error.message}`);
  if (error.code === "ER_ACCESS_DENIED_ERROR") {
    console.error("  Check DB_USER / DB_PASSWORD in your .env file.");
  }
  if (error.code === "ECONNREFUSED") {
    console.error("  Is MySQL/MariaDB running? Start it and try again.");
  }
  process.exit(1);
});
