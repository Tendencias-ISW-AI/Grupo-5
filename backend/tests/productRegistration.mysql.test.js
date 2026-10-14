import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { closePool, getPool } from '../src/config/database.js';

const prefix = `HU11-${randomUUID()}-`;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('SMARLIST-12 HU-11 MySQL y HTTP reales', () => {
  let server;
  let origin;
  let baseline;
  let created;

  async function post(body) {
    const response = await fetch(`${origin}/api/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  async function readProducts() {
    const response = await fetch(`${origin}/api/products`);
    expect(response.status).toBe(200);
    return response.json();
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
        // Marca única por ejecución; protege incluso un fixture insertado cuya respuesta falle.
        const [ownRows] = await getPool().execute('SELECT id FROM products WHERE name LIKE ?', [`${prefix}%`]);
        for (const row of ownRows) {
          await getPool().execute('DELETE FROM products WHERE id = ? AND name LIKE ?', [row.id, `${prefix}%`]);
        }
        expect(await readProducts()).toEqual(baseline);
      }
    } finally {
      if (server) await new Promise(resolve => server.close(resolve));
      await closePool();
    }
  });

  it('HTTP real /health200, POST201, cuatro atributos y GET recuperable sin alterar anteriores', async () => {
    const health = await fetch(`${origin}/health`);
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: 'ok' });
    const response = await post({ name: `  ${prefix}Arroz  `, quantity: 2 });
    expect(response.status).toBe(201);
    created = response.body;
    expect(created).toEqual({ id: expect.stringMatching(uuid), name: `${prefix}Arroz`, quantity: 2, purchased: false });
    const all = await readProducts();
    expect(all.find(product => product.id === created.id)).toEqual(created);
    expect(all.filter(product => !product.name.startsWith(prefix))).toEqual(baseline);
    const [[stored]] = await getPool().execute('SELECT id, name, quantity, purchased FROM products WHERE id = ?', [created.id]);
    expect(stored).toEqual({ ...created, purchased: 0 });
  });

  it('nombres repetidos se almacenan como registros independientes', async () => {
    const second = await post({ name: created.name, quantity: 3 });
    expect(second.status).toBe(201);
    expect(second.body.id).toMatch(uuid);
    expect(second.body.id).not.toBe(created.id);
    const all = await readProducts();
    expect(all.filter(product => product.name === created.name)).toHaveLength(2);
  });

  it('reconexión conserva atributos y orden de GET', async () => {
    const before = await readProducts();
    await closePool();
    expect(await readProducts()).toEqual(before);
  });

  it('acepta los límites reales VARCHAR Unicode e INT sin truncar', async () => {
    const name = prefix + '🍚'.repeat(150 - Array.from(prefix).length);
    const response = await post({ name, quantity: 2147483647 });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(name);
    expect((await readProducts()).find(product => product.id === response.body.id)).toEqual(response.body);
  });

  it.each([
    { name: '', quantity: 1 }, { name: '  ', quantity: 1 },
    { name: `${prefix}inválido`, quantity: 0 }, { name: `${prefix}inválido`, quantity: -1 },
    { name: `${prefix}inválido`, quantity: 1.5 }, { name: `${prefix}inválido`, quantity: '2' },
    { quantity: 1 }, { name: `${prefix}inválido` },
    { name: `${prefix}inválido`, quantity: 1, id: randomUUID() },
    { name: `${prefix}inválido`, quantity: 1, purchased: true },
  ])('HTTP400 no inserta datos inválidos: %j', async body => {
    const before = await readProducts();
    expect((await post(body)).status).toBe(400);
    expect(await readProducts()).toEqual(before);
  });

  it('conexión realmente rechazada devuelve503 y se recupera sin modificar datos', async () => {
    const before = await readProducts();
    const originalPort = process.env.DB_PORT;
    const probe = createServer();
    probe.listen(0, '127.0.0.1');
    await once(probe, 'listening');
    const port = probe.address().port;
    await new Promise(resolve => probe.close(resolve));
    await closePool();
    try {
      process.env.DB_PORT = String(port);
      const response = await post({ name: `${prefix}sin-conexión`, quantity: 1 });
      expect(response).toEqual({ status: 503, body: { error: 'Servicio temporalmente no disponible' } });
      expect((await fetch(`${origin}/health`)).status).toBe(200);
    } finally {
      await closePool();
      if (originalPort === undefined) delete process.env.DB_PORT;
      else process.env.DB_PORT = originalPort;
    }
    expect(await readProducts()).toEqual(before);
  });
});
