const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const DB_NAME = process.env.DB_NAME || 'occre_app';

const pool = mysql.createPool({ ...DB_CONFIG, database: DB_NAME });

async function ensureDatabase() {
  const conn = await mysql.createConnection({ ...DB_CONFIG });
  try {
    await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`[DB] Base de datos asegurada: ${DB_NAME}`);
  } finally {
    await conn.end();
  }
}

module.exports = pool;
module.exports.ensureDatabase = ensureDatabase;
module.exports.DB_NAME = DB_NAME;
