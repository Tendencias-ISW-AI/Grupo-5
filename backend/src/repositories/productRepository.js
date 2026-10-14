import { getPool } from '../config/database.js';

export async function listProducts() {
  const [rows] = await getPool().execute('SELECT id, name, quantity, purchased FROM products ORDER BY BINARY id ASC');
  return rows;
}

export async function insertProduct(product) {
  const [result] = await getPool().execute(
    'INSERT INTO products (id, name, quantity, purchased) VALUES (?, ?, ?, ?)',
    [product.id, product.name, product.quantity, product.purchased ? 1 : 0],
  );
  if (result.affectedRows !== 1) throw new Error('No se confirmó la inserción del producto.');
}
