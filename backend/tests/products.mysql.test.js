import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { closePool, getPool } from '../src/config/database.js';
import { unusedPort, withServerProcess } from './serverProcess.helper.js';

const fixtures = [
  { id: randomUUID(), name: 'HU09 prueba Arroz', quantity: 2, purchased: 0 },
  { id: randomUUID(), name: 'HU09 prueba Arroz', quantity: 5, purchased: 1 },
];
const ids = fixtures.map(product => product.id);
// Insertados sin category: MySQL aplica el valor por defecto 'Otros' (HU-15).
const expected = fixtures.map(product => ({ ...product, purchased: product.purchased === 1, category: 'Otros' }));

describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('HU-09 MySQL real (fixtures propios)', () => {
  let baseline;
  const insertedIds = [];
  beforeAll(async () => {
    if (process.env.DB_NAME !== 'smartlist_db' || !['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? 'localhost')) {
      throw new Error('Las pruebas reales solo están autorizadas en smartlist_db local.');
    }
    baseline = (await request(app).get('/api/products')).body;
    expect(Array.isArray(baseline)).toBe(true);
    for (const product of fixtures) {
      await getPool().execute('INSERT INTO products (id, name, quantity, purchased) VALUES (?, ?, ?, ?)',
        [product.id, product.name, product.quantity, product.purchased]);
      insertedIds.push(product.id);
    }
  });

  afterAll(async () => {
    try {
      if (Array.isArray(baseline)) {
        for (const id of insertedIds) {
          await getPool().execute('DELETE FROM products WHERE id = ?', [id]);
        }
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(baseline);
      }
    } finally {
      await closePool();
    }
  });

  it('recupera los atributos, booleanos, categoría por defecto y duplicados con orden determinista', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.filter(product => ids.includes(product.id))).toEqual(expected);
    const resultIds = response.body.map(product => product.id);
    const [stored] = await getPool().execute('SELECT id FROM products ORDER BY creation_order ASC');
    expect(resultIds).toEqual(stored.map(product => product.id));
  });

  it('tres GET consecutivos son iguales y no modifican MySQL', async () => {
    const [before] = await getPool().execute('SELECT id, name, quantity, purchased FROM products ORDER BY BINARY id ASC');
    const responses = [];
    for (let index = 0; index < 3; index++) {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      responses.push(response.body);
    }
    expect(responses[0]).toEqual(responses[1]);
    expect(responses[1]).toEqual(responses[2]);
    const [after] = await getPool().execute('SELECT id, name, quantity, purchased FROM products ORDER BY BINARY id ASC');
    expect(after).toEqual(before);
  });

  it('conserva datos al cerrar y reabrir el pool', async () => {
    await closePool();
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.filter(product => ids.includes(product.id))).toEqual(expected);
  });

  it('recupera los mismos datos después de reiniciar el proceso servidor', async () => {
    const port = await unusedPort();
    const results = [];
    for (let index = 0; index < 2; index++) {
      results.push(await withServerProcess(async origin => {
        const response = await fetch(`${origin}/api/products`);
        expect(response.status).toBe(200);
        return response.json();
      }, { port }));
    }
    expect(results[0].filter(product => ids.includes(product.id))).toEqual(expected);
    expect(results[1]).toEqual(results[0]);
  });

  it.each([
    ['quantity', 0], ['quantity', -1], ['purchased', 2], ['name', '   '], ['id', ''],
  ])('CHECK impide datos inválidos en %s', async (field, value) => {
    const product = { id: randomUUID(), name: 'HU09 inválido', quantity: 1, purchased: 0, [field]: value };
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      await expect(connection.execute('INSERT INTO products (id, name, quantity, purchased) VALUES (?, ?, ?, ?)',
        [product.id, product.name, product.quantity, product.purchased])).rejects.toMatchObject({ code: 'ER_CHECK_CONSTRAINT_VIOLATED' });
    } finally {
      await connection.rollback();
      connection.release();
    }
  });
});
