import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { closePool, getPool } from '../src/config/database.js';
import { unusedPort, withServerProcess } from './serverProcess.helper.js';

describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('SMARLIST-15 PATCH MySQL real', () => {
  let server, origin, baseline, schema;
  const ids = [];
  async function send(method, path, body) {
    return fetch(`${origin}${path}`, { method, headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  }
  async function read() { const response = await send('GET', '/api/products'); expect(response.status).toBe(200); return response.json(); }
  beforeAll(async () => {
    if (process.env.DB_NAME !== 'smartlist_db' || !['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? 'localhost')) throw new Error('Se requiere smartlist_db local.');
    const [definition] = await getPool().execute('SHOW CREATE TABLE products'); schema = definition[0]['Create Table'].replace(/ AUTO_INCREMENT=\d+/g, '');
    server = app.listen(0, '127.0.0.1'); await once(server, 'listening'); origin = `http://127.0.0.1:${server.address().port}`;
    baseline = await read();
    const name = `HU14-${randomUUID()}-Arroz`;
    for (let index = 0; index < 2; index++) {
      const response = await send('POST', '/api/products', { name, quantity: index + 2 });
      expect(response.status).toBe(201); ids.push((await response.json()).id);
    }
  });
  afterAll(async () => {
    try {
      for (const id of ids) await getPool().execute('DELETE FROM products WHERE id = ?', [id]);
      if (baseline) {
        expect(await read()).toEqual(baseline);
        const [definition] = await getPool().execute('SHOW CREATE TABLE products'); expect(definition[0]['Create Table'].replace(/ AUTO_INCREMENT=\d+/g, '')).toBe(schema);
      }
    } finally { if (server) await new Promise(resolve => server.close(resolve)); await closePool(); }
  });

  it.each([true, true, false, false])('estado %s confirmado, duplicado/otros intactos', async purchased => {
    const before = await read(); const target = before.find(item => item.id === ids[0]);
    const response = await send('PATCH', `/api/products/${ids[0]}/status`, { purchased });
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ ...target, purchased });
    expect(await read()).toEqual(before.map(item => item.id === ids[0] ? { ...item, purchased } : item));
  });
  it.each([{}, { purchased: 'true' }, { purchased: 1 }, { purchased: true, quantity: 3 }])('datos inválidos %j 400 sin cambios', async data => {
    const before = await read(); expect((await send('PATCH', `/api/products/${ids[0]}/status`, data)).status).toBe(400); expect(await read()).toEqual(before);
  });
  it('UUID inválido400 e inexistente404', async () => {
    const before = await read();
    expect((await send('PATCH', '/api/products/invalid/status', { purchased: true })).status).toBe(400);
    expect((await send('PATCH', `/api/products/${randomUUID()}/status`, { purchased: true })).status).toBe(404);
    expect(await read()).toEqual(before);
  });
  it('estado persiste en proceso nuevo y PUT conserva comprado', async () => {
    expect((await send('PATCH', `/api/products/${ids[0]}/status`, { purchased: true })).status).toBe(200);
    const target = (await read()).find(item => item.id === ids[0]);
    const edited = await send('PUT', `/api/products/${ids[0]}`, { name: target.name, quantity: 7 });
    expect(edited.status).toBe(200); expect((await edited.json()).purchased).toBe(true);
    const expected = await read(); const port = await unusedPort();
    await withServerProcess(async origin => {
      const response = await fetch(`${origin}/api/products`); expect(response.status).toBe(200); expect(await response.json()).toEqual(expected);
    }, { port });
  });
  it('indisponibilidad real503 segura, recuperación y DELETE anterior', async () => {
    const before = await read(); const originalPort = process.env.DB_PORT; const port = await unusedPort(); await closePool();
    try {
      process.env.DB_PORT = String(port);
      const response = await send('PATCH', `/api/products/${ids[0]}/status`, { purchased: false });
      expect(response.status).toBe(503); expect(await response.json()).toEqual({ error: 'Servicio temporalmente no disponible' });
    } finally { await closePool(); if (originalPort === undefined) delete process.env.DB_PORT; else process.env.DB_PORT = originalPort; }
    expect(await read()).toEqual(before);
    const deleted = await send('DELETE', `/api/products/${ids[1]}`); expect(deleted.status).toBe(204); expect(await deleted.text()).toBe('');
    expect(await read()).toEqual(before.filter(item => item.id !== ids[1]));
  });
});
