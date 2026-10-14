import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProductsServer, jsonResponse } from './helpers/productsServer.js';
import { getProducts, createProduct, updateProduct, updateProductStatus, deleteProduct } from '../src/services/productsApi.js';

let server;
beforeEach(() => { server = createProductsServer(); vi.stubGlobal('fetch', server.fetch); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('HU-14 servicio HTTP', () => {
  it('cinco endpoints, JSON y DELETE 204 sin deserializar', async () => {
    expect(await getProducts()).toEqual([]);
    const item = await createProduct({ name: 'Arroz', quantity: 2 });
    expect(item.purchased).toBe(false);
    expect(await updateProduct(item.id, { name: 'Pan', quantity: 3 })).toEqual({ ...item, name: 'Pan', quantity: 3 });
    expect((await updateProductStatus(item.id, true)).purchased).toBe(true);
    await deleteProduct(item.id); expect(server.items()).toEqual([]);
    const response = await server.fetch.mock.results.at(-1).value;
    expect(response.json).not.toHaveBeenCalled();
    expect(server.fetch.mock.calls.map(([, options]) => options.method)).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  });
  it('URL configurable pública sin secretos', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3456/api/');
    await getProducts(); expect(server.fetch.mock.calls[0][0]).toBe('http://localhost:3456/api/products');
  });
  it.each([400, 404, 503])('error HTTP %s no representa éxito', async status => {
    server.fetch.mockResolvedValueOnce(jsonResponse({ error: { message: 'Solicitud rechazada.' } }, status));
    await expect(createProduct({ name: 'Pan', quantity: 1 })).rejects.toThrow('Solicitud rechazada.');
  });
  it('error plano503 y error de red', async () => {
    server.fetch.mockResolvedValueOnce(jsonResponse({ error: 'Servicio temporalmente no disponible' }, 503));
    await expect(getProducts()).rejects.toThrow('Servicio temporalmente no disponible');
    server.fetch.mockRejectedValueOnce(new TypeError('host privado'));
    await expect(getProducts()).rejects.toThrow('No se pudo conectar con el servidor.');
  });
  it.each([{}, [{ id: 'x', name: 'Pan', quantity: '2', purchased: false }], [{ id: '', name: 'Pan', quantity: 2, purchased: false }], [{ id: 'x', name: 'Pan', quantity: 2, purchased: 1 }]])('rechaza colección incompatible %j', async body => {
    server.fetch.mockResolvedValueOnce(jsonResponse(body)); await expect(getProducts()).rejects.toThrow('respuesta');
  });
  it('rechaza IDs duplicados y respuesta PUT con otra identidad', async () => {
    const item = { id: 'uno', name: 'Pan', quantity: 2, purchased: false };
    server.fetch.mockResolvedValueOnce(jsonResponse([item, item])); await expect(getProducts()).rejects.toThrow('respuesta');
    server.fetch.mockResolvedValueOnce(jsonResponse(item)); await expect(updateProduct('otro', { name: 'Pan', quantity: 2 })).rejects.toThrow('respuesta');
  });
  it('JSON corrupto y DELETE distinto de204 no confirman cambios', async () => {
    server.fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => { throw new SyntaxError('JSON'); } });
    await expect(getProducts()).rejects.toThrow('respuesta');
    server.fetch.mockResolvedValueOnce(jsonResponse({}, 200)); await expect(deleteProduct('uno')).rejects.toThrow('respuesta');
  });
});
