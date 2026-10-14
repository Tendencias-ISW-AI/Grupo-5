import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const { execute, getPool } = vi.hoisted(() => ({ execute: vi.fn(), getPool: vi.fn() }));
vi.mock('../src/config/database.js', () => ({ getPool }));
import app from '../src/app.js';
import { createProduct } from '../src/services/productService.js';
import { insertProduct } from '../src/repositories/productRepository.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const invalid = [
  ['nombre vacío', { name: '', quantity: 2 }],
  ['solo espacios', { name: ' \t\n ', quantity: 2 }],
  ['nombre no string', { name: 42, quantity: 2 }],
  ['nombre null', { name: null, quantity: 2 }],
  ['cantidad cero', { name: 'Arroz', quantity: 0 }],
  ['cantidad negativa', { name: 'Arroz', quantity: -1 }],
  ['cantidad decimal', { name: 'Arroz', quantity: 1.5 }],
  ['cantidad string', { name: 'Arroz', quantity: '2' }],
  ['cantidad booleana', { name: 'Arroz', quantity: true }],
  ['sin nombre', { quantity: 2 }],
  ['sin cantidad', { name: 'Arroz' }],
  ['sin campos', {}],
  ['ID impuesto', { name: 'Arroz', quantity: 2, id: 'cliente' }],
  ['ID null', { name: 'Arroz', quantity: 2, id: null }],
  ['estado impuesto', { name: 'Arroz', quantity: 2, purchased: true }],
  ['estado false impuesto', { name: 'Arroz', quantity: 2, purchased: false }],
  ['campo desconocido', { name: 'Arroz', quantity: 2, extra: 1 }],
  ['nombre demasiado largo', { name: 'a'.repeat(151), quantity: 2 }],
  ['INT fuera de rango', { name: 'Arroz', quantity: 2147483648 }],
  ['Unicode mal formado', { name: '\ud800', quantity: 2 }],
  ['arreglo', []],
  ['cuerpo null', null],
];

beforeEach(() => {
  execute.mockReset(); getPool.mockReset();
  getPool.mockReturnValue({ execute });
  execute.mockResolvedValue([{ affectedRows: 1 }, []]);
});

describe('SMARLIST-12 / HU-11 registro', () => {
  it('CA01/02/04/05/06: POST201 con UUID, atributos, pendiente y categoría Otros; INSERT parametrizado', async () => {
    const response = await request(app).post('/api/products').send({ name: '  Arroz  ', quantity: 2 });
    expect(response.status).toBe(201);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ id: expect.stringMatching(uuid), name: 'Arroz', quantity: 2, purchased: false, category: 'Otros' });
    expect(execute).toHaveBeenCalledExactlyOnceWith(
      'INSERT INTO products (id, name, quantity, purchased, category) VALUES (?, ?, ?, ?, ?)',
      [response.body.id, 'Arroz', 2, 0, 'Otros'],
    );
  });

  it('permite nombres repetidos con UUID distintos sin mutar entrada', async () => {
    const data = Object.freeze({ name: 'Arroz', quantity: 2 });
    const first = await createProduct(data);
    const second = await createProduct(data);
    expect(first.id).toMatch(uuid); expect(second.id).toMatch(uuid);
    expect(first.id).not.toBe(second.id);
    expect(data).toEqual({ name: 'Arroz', quantity: 2 });
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('el repositorio vincula texto de apariencia SQL sin interpolarlo', async () => {
    const product = { id: 'test-id', name: "Arroz'); DELETE FROM products; --", quantity: 2, purchased: false, category: 'Otros' };
    await insertProduct(product);
    expect(execute).toHaveBeenCalledExactlyOnceWith(
      'INSERT INTO products (id, name, quantity, purchased, category) VALUES (?, ?, ?, ?, ?)',
      [product.id, product.name, 2, 0, 'Otros'],
    );
  });

  it.each(invalid)('CA03/07: %s devuelve400 sin SQL', async (_label, body) => {
    const response = await request(app).post('/api/products').send(body);
    expect(response.status).toBe(400);
    expect(response.body.error.message).toEqual(expect.any(String));
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([undefined, NaN, Infinity, -Infinity])('validación independiente en servicio rechaza quantity %s', async quantity => {
    await expect(createProduct({ name: 'Arroz', quantity })).rejects.toMatchObject({ status: 400 });
    expect(execute).not.toHaveBeenCalled();
  });

  it('rechaza cuerpo ausente y JSON malformado sin eco del payload', async () => {
    expect((await request(app).post('/api/products')).status).toBe(400);
    const response = await request(app).post('/api/products').set('Content-Type', 'application/json').send('{"privado-ficticio":');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { message: 'JSON inválido.' } });
    expect(execute).not.toHaveBeenCalled();
  });

  it('acepta límites INT y150 caracteres Unicode; GET recupera el mismo nombre', async () => {
    const name = '🍚'.repeat(150);
    const product = await createProduct({ name: ` ${name} `, quantity: 2147483647 });
    expect(product.name).toBe(name);
    execute.mockResolvedValueOnce([[{ ...product, purchased: 0 }], []]);
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([product]);
  });

  it.each(['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'PROTOCOL_CONNECTION_LOST'])('falla INSERT con %s:503 seguro y /health200', async code => {
    execute.mockRejectedValue(Object.assign(new Error('SQL interno password=ficticio'), { code }));
    const response = await request(app).post('/api/products').send({ name: 'Arroz', quantity: 2 });
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: 'Servicio temporalmente no disponible' });
    expect((await request(app).get('/health')).status).toBe(200);
  });

  it('error inesperado500 sin detalles y recuperación de escritura sin reintento automático', async () => {
    execute.mockRejectedValueOnce(Object.assign(new Error('Detalles SQL privados'), { code: 'ER_PARSE_ERROR' }));
    const response = await request(app).post('/api/products').send({ name: 'Arroz', quantity: 2 });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: { message: 'Error interno del servidor.' } });
    expect(execute).toHaveBeenCalledOnce();
    expect((await request(app).post('/api/products').send({ name: 'Arroz', quantity: 2 })).status).toBe(201);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
