import { randomUUID } from 'node:crypto';
import { insertProduct, listProducts } from '../repositories/productRepository.js';

const unavailableCodes = new Set([
  'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR',
  'ER_NO_SUCH_TABLE', 'ER_CON_COUNT_ERROR',
]);

function throwStorageError(error) {
  if (!unavailableCodes.has(error.code)) throw error;
  const unavailable = new Error('Servicio temporalmente no disponible');
  unavailable.status = 503;
  unavailable.code = 'PRODUCT_STORAGE_UNAVAILABLE';
  throw unavailable;
}

function invalidRequest(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

export async function createProduct(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)
    || Object.keys(data).length !== 2 || !Object.hasOwn(data, 'name') || !Object.hasOwn(data, 'quantity')) {
    invalidRequest('La solicitud debe contener únicamente nombre y cantidad.');
  }
  if (typeof data.name !== 'string' || !data.name.isWellFormed()) {
    invalidRequest('El nombre debe ser un texto válido.');
  }
  const name = data.name.trim();
  if (!name || Array.from(name).length > 150) {
    invalidRequest('El nombre es obligatorio y debe tener hasta 150 caracteres.');
  }
  if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 2147483647) {
    invalidRequest('La cantidad debe ser un número entero entre 1 y 2147483647.');
  }
  const product = { id: randomUUID(), name, quantity: data.quantity, purchased: false };
  try {
    await insertProduct(product);
  } catch (error) {
    throwStorageError(error);
  }
  return product;
}

export async function getProducts() {
  let rows;
  try {
    rows = await listProducts();
  } catch (error) {
    throwStorageError(error);
  }
  const ids = new Set();
  return rows.map(row => {
    const valid = typeof row.id === 'string' && row.id.trim().length > 0 && row.id.length <= 36
      && !ids.has(row.id)
      && typeof row.name === 'string' && row.name.trim().length > 0 && Array.from(row.name).length <= 150
      && row.name === row.name.trim()
      && Number.isInteger(row.quantity) && row.quantity > 0
      && (row.purchased === 0 || row.purchased === 1);
    if (!valid) throw new Error('Producto almacenado incompatible con el modelo.');
    ids.add(row.id);
    return { id: row.id, name: row.name, quantity: row.quantity, purchased: row.purchased === 1 };
  });
}
