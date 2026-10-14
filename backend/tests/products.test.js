import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const { listProducts } = vi.hoisted(() => ({ listProducts: vi.fn() }));
vi.mock('../src/repositories/productRepository.js', () => ({ listProducts, insertProduct: vi.fn() }));
import app from '../src/app.js';

beforeEach(() => { listProducts.mockReset(); listProducts.mockResolvedValue([]); });

describe('HU-09 GET /api/products', () => {
  it('devuelve 200 JSON con arreglo vacío directo', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual([]);
  });

  it('devuelve todos los registros con tipos compatibles y nombres repetidos separados', async () => {
    listProducts.mockResolvedValue([
      { id: 'a', name: 'Arroz', quantity: 2, purchased: 0 },
      { id: 'b', name: 'Arroz', quantity: 5, purchased: 1 },
    ]);
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 'a', name: 'Arroz', quantity: 2, purchased: false },
      { id: 'b', name: 'Arroz', quantity: 5, purchased: true },
    ]);
  });

  it('tres consultas conservan la misma colección y no agregan atributos', async () => {
    const rows = [{ id: 'a', name: 'Leche', quantity: 3, purchased: 0 }];
    listProducts.mockResolvedValue(rows);
    const responses = [];
    for (let index = 0; index < 3; index++) responses.push((await request(app).get('/api/products')).body);
    expect(responses[0]).toEqual(responses[1]);
    expect(responses[1]).toEqual(responses[2]);
    expect(Object.keys(responses[0][0]).sort()).toEqual(['id', 'name', 'purchased', 'quantity']);
    expect(rows[0].purchased).toBe(0);
    expect(listProducts).toHaveBeenCalledTimes(3);
  });

  it.each(['post', 'put', 'patch', 'delete'])('rechaza escritura inválida/no disponible: %s /api/products', async method => {
    const response = await request(app)[method]('/api/products').send({ name: 'No registrar' });
    expect(response.status).toBe(method === 'post' ? 400 : 404);
    expect(listProducts).not.toHaveBeenCalled();
  });

  it('devuelve 503 exacto sin secretos ni SQL y /health permanece disponible', async () => {
    listProducts.mockRejectedValue(Object.assign(new Error('SELECT privado; password=secreto-ficticio; host=privado; stack'), { code: 'ECONNREFUSED' }));
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: 'Servicio temporalmente no disponible' });
    expect(JSON.stringify(response.body)).not.toMatch(/SELECT|password|host|stack|secreto-ficticio/);
    expect((await request(app).get('/health')).status).toBe(200);
  });

  it('puede consultar de nuevo cuando se recupera conexión', async () => {
    listProducts.mockRejectedValueOnce(Object.assign(new Error('Fallo simulado'), { code: 'ECONNRESET' }))
      .mockResolvedValueOnce([{ id: 'a', name: 'Arroz', quantity: 2, purchased: 0 }]);
    expect((await request(app).get('/api/products')).status).toBe(503);
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'a', name: 'Arroz', quantity: 2, purchased: false }]);
  });

  it('no expone detalles de errores inesperados', async () => {
    listProducts.mockRejectedValue(Object.assign(new Error('SELECT privado'), { code: 'ER_PARSE_ERROR' }));
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: { message: 'Error interno del servidor.' } });
  });
});
