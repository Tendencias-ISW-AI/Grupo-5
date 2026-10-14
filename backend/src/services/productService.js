import { listProducts } from '../repositories/productRepository.js';

const unavailableCodes = new Set([
  'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR',
  'ER_NO_SUCH_TABLE', 'ER_CON_COUNT_ERROR',
]);

export async function getProducts() {
  let rows;
  try {
    rows = await listProducts();
  } catch (error) {
    if (!unavailableCodes.has(error.code)) throw error;
    const unavailable = new Error('Servicio temporalmente no disponible');
    unavailable.status = 503;
    unavailable.code = 'PRODUCT_STORAGE_UNAVAILABLE';
    throw unavailable;
  }
  const ids = new Set();
  return rows.map(row => {
    const valid = typeof row.id === 'string' && row.id.trim().length > 0 && row.id.length <= 36
      && !ids.has(row.id)
      && typeof row.name === 'string' && row.name.trim().length > 0 && row.name.length <= 150
      && row.name === row.name.trim()
      && Number.isInteger(row.quantity) && row.quantity > 0
      && (row.purchased === 0 || row.purchased === 1);
    if (!valid) throw new Error('Producto almacenado incompatible con el modelo.');
    ids.add(row.id);
    return { id: row.id, name: row.name, quantity: row.quantity, purchased: row.purchased === 1 };
  });
}
