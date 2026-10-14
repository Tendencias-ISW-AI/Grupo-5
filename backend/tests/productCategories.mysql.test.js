import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { closePool, getPool } from '../src/config/database.js';

const prefix = `HU15-${randomUUID()}-`;

describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('SMARLIST-19 HU-15 categorías con MySQL y HTTP reales', () => {
  let server;
  let origin;
  let baseline;
  const ids = [];

  async function send(method, path, body) {
    const response = await fetch(`${origin}${path}`, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  async function readProducts() {
    const response = await fetch(`${origin}/api/products`);
    expect(response.status).toBe(200);
    return response.json();
  }

  async function create(body) {
    const response = await send('POST', '/api/products', body);
    expect(response.status).toBe(201);
    ids.push(response.body.id);
    return response.body;
  }

  beforeAll(async () => {
    if (process.env.DB_NAME !== 'smartlist_db' || !['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? 'localhost')) {
      throw new Error('Las pruebas reales requieren smartlist_db local.');
    }
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    origin = `http://127.0.0.1:${server.address().port}`;
    baseline = await readProducts();
  });

  afterAll(async () => {
    try {
      if (baseline) {
        const [untracked] = await getPool().execute('SELECT id FROM products WHERE name LIKE ?', [`${prefix}%`]);
        for (const id of new Set([...ids, ...untracked.map(row => row.id)])) {
          await getPool().execute('DELETE FROM products WHERE id = ?', [id]);
        }
        expect(await readProducts()).toEqual(baseline);
      }
    } finally {
      if (server) await new Promise(resolve => server.close(resolve));
      await closePool();
    }
  });

  it('POST guarda la categoría recibida y Otros por defecto', async () => {
    const dairy = await create({ name: `${prefix}Leche`, quantity: 1, category: 'Lácteos' });
    const other = await create({ name: `${prefix}Pan`, quantity: 1 });
    expect(dairy.category).toBe('Lácteos');
    expect(other.category).toBe('Otros');
    const [stored] = await getPool().execute(
      'SELECT id, category FROM products WHERE id IN (?, ?) ORDER BY BINARY id ASC', [dairy.id, other.id],
    );
    expect(Object.fromEntries(stored.map(row => [row.id, row.category])))
      .toEqual({ [dairy.id]: 'Lácteos', [other.id]: 'Otros' });
    const all = await readProducts();
    expect(all.find(product => product.id === dairy.id)).toEqual(dairy);
  });

  it('PUT cambia la categoría y la conserva cuando se omite', async () => {
    const product = await create({ name: `${prefix}Jugo`, quantity: 1, category: 'Despensa' });
    const changed = await send('PUT', `/api/products/${product.id}`, { name: `${prefix}Jugo`, quantity: 2, category: 'Bebidas' });
    expect(changed).toEqual({ status: 200, body: { ...product, quantity: 2, category: 'Bebidas' } });
    const kept = await send('PUT', `/api/products/${product.id}`, { name: `${prefix}Jugo natural`, quantity: 2 });
    expect(kept.body.category).toBe('Bebidas');
    expect((await readProducts()).find(item => item.id === product.id)).toEqual(kept.body);
  });

  it.each(['Juguetes', 'lácteos', ' Lácteos ', '', null, 5])('categoría %j responde400 sin modificar registros', async category => {
    const product = await create({ name: `${prefix}Arroz`, quantity: 1, category: 'Despensa' });
    const before = await readProducts();
    expect((await send('POST', '/api/products', { name: `${prefix}Inválido`, quantity: 1, category })).status).toBe(400);
    expect((await send('PUT', `/api/products/${product.id}`, { name: `${prefix}Arroz`, quantity: 9, category })).status).toBe(400);
    expect(await readProducts()).toEqual(before);
  });

  it('la columna category es NOT NULL con Otros por defecto', async () => {
    const [[column]] = await getPool().execute(
      'SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      ['smartlist_db', 'products', 'category'],
    );
    expect(column).toEqual({ DATA_TYPE: 'varchar', CHARACTER_MAXIMUM_LENGTH: 30, IS_NULLABLE: 'NO', COLUMN_DEFAULT: 'Otros' });
  });
});
