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

export async function deleteProductById(id) {
  const [result] = await getPool().execute('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows;
}

async function updateProductFields(id, query, values, changes) {
  const connection = await getPool().getConnection();
  let reusable = true;
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT id, name, quantity, purchased FROM products WHERE id = ? FOR UPDATE', [id],
    );
    if (!rows.length) {
      await connection.rollback();
      return null;
    }
    await connection.execute(query, [...values, id]);
    await connection.commit();
    return { ...rows[0], ...changes };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Una transacción cuyo rollback falla no debe volver al pool.
      reusable = false;
      connection.destroy();
    }
    throw error;
  } finally {
    if (reusable) connection.release();
  }
}

export function updateProductById(id, data) {
  return updateProductFields(id, 'UPDATE products SET name = ?, quantity = ? WHERE id = ?',
    [data.name, data.quantity], { name: data.name, quantity: data.quantity });
}

export function updateProductStatusById(id, purchased) {
  return updateProductFields(id, 'UPDATE products SET purchased = ? WHERE id = ?',
    [Number(purchased)], { purchased: Number(purchased) });
}
