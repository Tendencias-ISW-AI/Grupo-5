import { vi } from 'vitest';

export function jsonResponse(body, status = 200) {
  return { status, ok: status >= 200 && status < 300, json: vi.fn(async () => structuredClone(body)) };
}

export function createProductsServer(initial = []) {
  let items = structuredClone(initial);
  let counter = 0;
  const fetch = vi.fn(async (url, options = {}) => {
    if (options.signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    const path = new URL(url).pathname.replace(/^\/api/, '');
    const method = options.method ?? 'GET';
    const data = options.body ? JSON.parse(options.body) : undefined;
    const [, , encodedId, status] = path.split('/');
    const id = encodedId ? decodeURIComponent(encodedId) : undefined;
    if (method === 'GET') return jsonResponse(items);
    if (method === 'POST') {
      const item = { id: `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`, ...data, purchased: false };
      items = [...items, item]; return jsonResponse(item, 201);
    }
    const index = items.findIndex(item => item.id === id);
    if (index < 0) return jsonResponse({ error: { message: 'Producto no encontrado.' } }, 404);
    if (method === 'DELETE') {
      items = items.filter(item => item.id !== id);
      return { status: 204, ok: true, json: vi.fn(() => { throw new Error('204 no tiene JSON'); }) };
    }
    if (method === 'PUT' || (method === 'PATCH' && status === 'status')) {
      items = items.map((item, current) => current === index ? { ...item, ...data } : item);
      return jsonResponse(items[index]);
    }
    return jsonResponse({ error: { message: 'Ruta no encontrada.' } }, 404);
  });
  return { fetch, seed: data => { items = structuredClone(data); }, items: () => structuredClone(items) };
}
