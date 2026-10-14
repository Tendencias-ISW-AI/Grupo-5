import { randomUUID } from 'node:crypto';
import { deleteProductById, insertProduct, listProducts, updateProductById, updateProductStatusById } from '../repositories/productRepository.js';

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

function validateProductId(id) {
  if (typeof id !== 'string' || !id.isWellFormed() || !id.length || id.length > 36 || id.trim() !== id) {
    invalidRequest('El identificador debe ser un string válido de hasta 36 caracteres, sin espacios externos.');
  }
}

function productNotFound() {
  const error = new Error('Producto no encontrado.');
  error.status = 404;
  throw error;
}

function validateProductData(data) {
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
  return { name, quantity: data.quantity };
}

export async function createProduct(data) {
  const { name, quantity } = validateProductData(data);
  const product = { id: randomUUID(), name, quantity, purchased: false };
  try {
    await insertProduct(product);
  } catch (error) {
    throwStorageError(error);
  }
  return product;
}

export async function updateProduct(id, data) {
  validateProductId(id);
  const editable = validateProductData(data);
  let row;
  try {
    row = await updateProductById(id, editable);
  } catch (error) {
    throwStorageError(error);
  }
  if (!row) productNotFound();
  return { id: row.id, name: row.name, quantity: row.quantity, purchased: row.purchased === 1 };
}

function validateProductUuid(id) {
  validateProductId(id);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    invalidRequest('El identificador debe tener formato UUID válido.');
  }
}

export async function updateProductStatus(id, data) {
  validateProductUuid(id);
  if (!data || typeof data !== 'object' || Array.isArray(data)
    || Object.keys(data).length !== 1 || !Object.hasOwn(data, 'purchased') || typeof data.purchased !== 'boolean') {
    invalidRequest('La solicitud debe contener únicamente purchased de tipo booleano.');
  }
  let row;
  try {
    row = await updateProductStatusById(id, data.purchased);
  } catch (error) {
    throwStorageError(error);
  }
  if (!row) productNotFound();
  return { id: row.id, name: row.name, quantity: row.quantity, purchased: row.purchased === 1 };
}

export async function deleteProduct(id) {
  validateProductUuid(id);
  let affectedRows;
  try {
    affectedRows = await deleteProductById(id);
  } catch (error) {
    throwStorageError(error);
  }
  if (affectedRows === 0) productNotFound();
  if (affectedRows !== 1) throw new Error('Resultado de eliminación inesperado.');
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
