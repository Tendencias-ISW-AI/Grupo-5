import './environment.js';
import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    const port = Number(process.env.DB_PORT ?? 3306);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('DB_PORT debe ser un puerto válido.');
    }
    if (!process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error('Configura DB_USER y DB_NAME antes de utilizar MySQL.');
    }
    pool = mysql.createPool({
      host: process.env.DB_HOST ?? 'localhost',
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 5000,
    });
  }
  return pool;
}

export async function checkDatabaseConnection() {
  const connection = await getPool().getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
