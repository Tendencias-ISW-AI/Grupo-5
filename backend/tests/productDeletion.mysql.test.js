import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { closePool, getPool } from '../src/config/database.js';

async function unusedPort() {
  const probe = createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve)); return port;
}

async function freshServerProducts() {
  const port = await unusedPort();
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), env: { ...process.env, PORT: String(port) },
    windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'],
  });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Servidor de prueba no disponible')), 5000);
      child.once('error', () => { clearTimeout(timer); reject(new Error('No se pudo iniciar proceso de prueba')); });
      child.once('exit', () => { clearTimeout(timer); reject(new Error('Proceso terminó prematuramente')); });
      child.stdout.on('data', data => {
        if (data.toString().includes('disponible')) { clearTimeout(timer); resolve(); }
      });
    });
    const response = await fetch(`http://127.0.0.1:${port}/api/products`);
    expect(response.status).toBe(200); return await response.json();
  } finally {
    if (child.exitCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
  }
}

describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('SMARLIST-14 HU-13 MySQL y HTTP reales', () => {
  let server, origin, baseline, schema, prefix;
  const ids = [];

  async function readProducts() {
    const response = await fetch(`${origin}/api/products`); expect(response.status).toBe(200); return response.json();
  }

  async function send(method, path, body) {
    return fetch(`${origin}${path}`, {
      method, headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }

  beforeAll(async () => {
    if (process.env.DB_NAME !== 'smartlist_db' || !['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? 'localhost')) {
      throw new Error('Las pruebas reales requieren smartlist_db local.');
    }
    const [definition] = await getPool().execute('SHOW CREATE TABLE products'); schema = definition[0]['Create Table'].replace(/ AUTO_INCREMENT=\d+/g, '');
    server = app.listen(0, '127.0.0.1'); await once(server, 'listening'); origin = `http://127.0.0.1:${server.address().port}`;
    baseline = await readProducts();
    do { prefix = `HU13-${randomUUID()}-`; } while (baseline.some(product => product.name.startsWith(prefix)));
    for (let index = 0; index < 3; index++) {
      const response = await send('POST', '/api/products', { name: `${prefix}Arroz`, quantity: index + 2 });
      expect(response.status).toBe(201); const product = await response.json(); ids.push(product.id);
      if (index === 1) await getPool().execute('UPDATE products SET purchased = ? WHERE id = ?', [1, product.id]);
    }
  });

  afterAll(async () => {
    try {
      if (baseline && prefix) {
        const [untracked] = await getPool().execute('SELECT id FROM products WHERE name LIKE ?', [`${prefix}%`]);
        for (const id of new Set([...ids, ...untracked.map(product => product.id)])) {
          await getPool().execute('DELETE FROM products WHERE id = ?', [id]);
        }
        // CP19: limpieza propia completa, atributos previos y tabla/esquema conservados.
        expect(await readProducts()).toEqual(baseline);
        const [definition] = await getPool().execute('SHOW CREATE TABLE products');
        expect(definition[0]['Create Table'].replace(/ AUTO_INCREMENT=\d+/g, '')).toBe(schema);
      }
    } finally {
      if (server) await new Promise(resolve => server.close(resolve)); await closePool();
    }
  });

  it.each([0, 1])('CP01–04/07–10/18:elimina comprado=%s,sin cuerpo,otros duplicados intactos', async index => {
    const before = await readProducts(); const id = ids[index];
    expect(before.find(product => product.id === id).purchased).toBe(index === 1);
    const response = await send('DELETE', `/api/products/${id}`);
    expect(response.status).toBe(204); expect(await response.text()).toBe('');
    expect(response.headers.get('content-type')).toBeNull();
    expect(await readProducts()).toEqual(before.filter(product => product.id !== id));
  });

  it('CP05/12:segundoDELETE e inexistente404 sin modificar colección', async () => {
    const before = await readProducts();
    let missing; do { missing = randomUUID(); } while (before.some(product => product.id === missing));
    for (const id of [ids[0], missing]) {
      const response = await send('DELETE', `/api/products/${id}`);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: { message: 'Producto no encontrado.' } });
    }
    expect(await readProducts()).toEqual(before);
  });

  it.each([' ', 'no-es-uuid', 'z'.repeat(36)])('CP06/16:IDinválido%j400,sin cambios', async id => {
    const before = await readProducts();
    expect((await send('DELETE', `/api/products/${encodeURIComponent(id)}`)).status).toBe(400);
    expect(await readProducts()).toEqual(before);
  });

  it('CP11:ausencia persiste tras reiniciar dos procesos del servidor', async () => {
    const expected = await readProducts();
    expect(expected.some(product => ids.slice(0, 2).includes(product.id))).toBe(false);
    expect(await freshServerProducts()).toEqual(expected); expect(await freshServerProducts()).toEqual(expected);
  });

  it('CP13/14:conexión realmente rechazada503 y recuperación sin eliminación', async () => {
    const before = await readProducts(); const originalPort = process.env.DB_PORT;
    const port = await unusedPort(); await closePool();
    try {
      process.env.DB_PORT = String(port);
      const response = await send('DELETE', `/api/products/${ids[2]}`);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'Servicio temporalmente no disponible' });
      expect((await fetch(`${origin}/health`)).status).toBe(200);
    } finally {
      await closePool();
      if (originalPort === undefined) delete process.env.DB_PORT; else process.env.DB_PORT = originalPort;
    }
    expect(await readProducts()).toEqual(before);
  });

  it('CP15:POST/PUT/GET conservan contratos;solo fixtures propios', async () => {
    const before = await readProducts(); const id = ids[2];
    const response = await send('PUT', `/api/products/${id}`, { name: `${prefix}Editado`, quantity: 7 });
    expect(response.status).toBe(200);
    const updated = await response.json(); expect(updated).toEqual({ id, name: `${prefix}Editado`, quantity: 7, purchased: false, category: 'Otros' });
    const after = await readProducts(); expect(after.find(product => product.id === id)).toEqual(updated);
    expect(after.filter(product => product.id !== id)).toEqual(before.filter(product => product.id !== id));
    expect(after.filter(product => !ids.includes(product.id))).toEqual(baseline);
  });
});
