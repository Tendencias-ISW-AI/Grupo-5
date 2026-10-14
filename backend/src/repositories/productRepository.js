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

export async function updateProductById(id, data) {
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
    // HU-15: sin categoría en la solicitud se conserva la almacenada.
    const category = data.category ?? rows[0].category;
    await connection.execute(
      'UPDATE products SET name = ?, quantity = ?, category = ? WHERE id = ?', [data.name, data.quantity, category, id],
    );
    await connection.commit();
    return { id: rows[0].id, name: data.name, quantity: data.quantity, purchased: rows[0].purchased, category };
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
