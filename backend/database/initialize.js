import '../src/config/environment.js';
import mysql from 'mysql2/promise';
import { initializeDatabase } from '../src/config/initializeDatabase.js';

let connection;
try {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 3306);
  if (!['localhost', '127.0.0.1', '::1'].includes(host) || process.env.DB_NAME !== 'smartlist_db'
    || !process.env.DB_USER || !Number.isInteger(port) || port !== 3306) {
    throw new Error('Configuración incompatible con la inicialización local autorizada.');
  }
  connection = await mysql.createConnection({
    host, port, user: process.env.DB_USER, password: process.env.DB_PASSWORD ?? '', connectTimeout: 5000,
  });
  const result = await initializeDatabase(connection);
  console.log(JSON.stringify({ database: 'smartlist_db', table: 'products', ...result }));
} catch (error) {
  // Nunca imprimir mensajes del driver: pueden incluir datos de conexión.
  console.error('Inicialización detenida. Comprueba la conexión local, versión y compatibilidad del esquema.');
  console.error(error.code ? `Código: ${error.code}` : 'No se aplicaron reparaciones automáticas.');
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
