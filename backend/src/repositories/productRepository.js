import { getPool } from '../config/database.js';

export async function listProducts() {
  const [rows] = await getPool().execute('SELECT id, name, quantity, purchased, category FROM products ORDER BY BINARY id ASC');
  return rows;
}

export async function insertProduct(product) {
  const [result] = await getPool().execute(
    'INSERT INTO products (id, name, quantity, purchased, category) VALUES (?, ?, ?, ?, ?)',
    [product.id, product.name, product.quantity, product.purchased ? 1 : 0, product.category],
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
      'SELECT id, name, quantity, purchased, category FROM products WHERE id = ? FOR UPDATE', [id],
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

// HU-15: sin categoría en la solicitud, COALESCE conserva la almacenada y la fila bloqueada la devuelve.
export function updateProductById(id, data) {
  const changes = { name: data.name, quantity: data.quantity };
  if (data.category !== undefined) changes.category = data.category;
  return updateProductFields(id, 'UPDATE products SET name = ?, quantity = ?, category = COALESCE(?, category) WHERE id = ?',
    [data.name, data.quantity, data.category ?? null], changes);
}

export function updateProductStatusById(id, purchased) {
  return updateProductFields(id, 'UPDATE products SET purchased = ? WHERE id = ?',
    [Number(purchased)], { purchased: Number(purchased) });
}
