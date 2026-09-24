const mysql = require("mysql2/promise");

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hospital_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 4000,
  dateStrings: true,
  decimalNumbers: true,
};

const pool = mysql.createPool(config);

const DB_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "PROTOCOL_CONNECTION_LOST",
  "ER_ACCESS_DENIED_ERROR",
  "ER_BAD_DB_ERROR",
  "ER_NO_SUCH_TABLE",
  "ER_BAD_FIELD_ERROR",
  "ER_DBACCESS_DENIED_ERROR",
]);

/** True when the error means "the database is not usable", so demo data should be shown. */
function isDbUnavailable(error) {
  return Boolean(error && (DB_ERROR_CODES.has(error.code) || error.fatal));
}

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

/** Run `work(connection)` inside a transaction. Rolls back on any error. */
async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/** Ping the database. Resolves to { ok, message }. Never throws. */
async function healthCheck() {
  try {
    await pool.query("SELECT 1");
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'",
    );
    const tables = rows[0]?.count || 0;
    if (tables === 0) {
      return {
        ok: false,
        message: `Connected to "${config.database}" but no tables exist. Run "npm run db:setup".`,
      };
    }
    return { ok: true, message: `Connected to ${config.database} at ${config.host}:${config.port} (${tables} tables)` };
  } catch (error) {
    return { ok: false, message: `${error.code || "ERROR"}: ${error.message}` };
  }
}

module.exports = { pool, query, queryOne, transaction, healthCheck, isDbUnavailable, config };
