import { isValidProductCategory } from '../utils/productCategories.js';

function baseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
}

function isProduct(item) {
  return item && Object.keys(item).length === 5 && isValidProductCategory(item.category)
    && typeof item.id === 'string' && item.id.isWellFormed() && item.id.length <= 36
    && item.id.trim().length > 0 && item.id === item.id.trim()
    && typeof item.name === 'string' && item.name.trim().length > 0
    && item.name.isWellFormed() && item.name === item.name.trim() && Array.from(item.name).length <= 150
    && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 2147483647
    && typeof item.purchased === 'boolean';
}

async function request(path, method, expectedStatus, { body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl()}${path}`, { method, signal,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No se pudo conectar con el servidor.');
  }
  if (!response.ok) {
    let data;
    try { data = await response.json(); } catch { /* La respuesta de error puede no contener JSON. */ }
    const message = typeof data?.error === 'string' ? data.error : data?.error?.message;
    throw new Error(typeof message === 'string' ? message : `La solicitud falló (HTTP ${response.status}).`);
  }
  if (response.status !== expectedStatus) throw new Error('El servidor devolvió una respuesta inesperada.');
  if (expectedStatus === 204) return;
  try { return await response.json(); } catch { throw new Error('El servidor devolvió una respuesta inválida.'); }
}

function confirmedProduct(item, id) {
  if (!isProduct(item) || (id !== undefined && item.id !== id)) throw new Error('El servidor devolvió una respuesta inválida.');
  return item;
}

export async function getProducts({ signal } = {}) {
  const items = await request('/products', 'GET', 200, { signal });
  if (!Array.isArray(items) || !items.every(isProduct) || new Set(items.map(item => item.id)).size !== items.length) {
    throw new Error('El servidor devolvió una respuesta inválida.');
  }
  return items;
}

export async function createProduct(data) {
  return confirmedProduct(await request('/products', 'POST', 201, { body: data }));
}

export async function updateProduct(id, data) {
  return confirmedProduct(await request(`/products/${encodeURIComponent(id)}`, 'PUT', 200, { body: data }), id);
}

export async function updateProductStatus(id, purchased) {
  return confirmedProduct(await request(`/products/${encodeURIComponent(id)}/status`, 'PATCH', 200, { body: { purchased } }), id);
}

export function deleteProduct(id) {
  return request(`/products/${encodeURIComponent(id)}`, 'DELETE', 204);
}
