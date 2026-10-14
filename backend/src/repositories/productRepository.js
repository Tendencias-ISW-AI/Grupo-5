import { getPool } from '../config/database.js';

export async function listProducts() {
  const [rows] = await getPool().execute('SELECT id, name, quantity, purchased FROM products ORDER BY BINARY id ASC');
  return rows;
}
