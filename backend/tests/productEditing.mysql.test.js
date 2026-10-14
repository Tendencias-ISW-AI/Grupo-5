import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { closePool, getPool } from '../src/config/database.js';

const prefix = `HU12-${randomUUID()}-`;

async function unusedPort() {
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  return port;
}

async function readFromFreshProcess() {
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
    expect(response.status).toBe(200);
    return await response.json();
  } finally {
    if (child.exitCode === null) {
      const exited = once(child, 'exit'); child.kill(); await exited;
    }
  }
}

describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('SMARLIST-13 HU-12 MySQL y HTTP reales', () => {
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

  beforeAll(async () => {
    if (process.env.DB_NAME !== 'smartlist_db' || !['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? 'localhost')) {
      throw new Error('Las pruebas reales requieren smartlist_db local.');
    }
    server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    origin = `http://127.0.0.1:${server.address().port}`;
    baseline = await readProducts();
    for (const purchased of [0, 1]) {
      const response = await send('POST', '/api/products', { name: `${prefix}${purchased}`, quantity: 2 });
      expect(response.status).toBe(201);
      ids.push(response.body.id);
      // Preparación exclusiva del fixture comprado; no endpoint de cambio de estado.
      if (purchased) await getPool().execute('UPDATE products SET purchased = ? WHERE id = ?', [1, response.body.id]);
    }
  });

  afterAll(async () => {
    try {
      if (baseline) {
        const [untracked] = await getPool().execute('SELECT id FROM products WHERE name LIKE ?', [`${prefix}%`]);
        // Los IDs creados se conservan aunque la edición cambie completamente el nombre.
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

  it.each([0, 1])('edita comprado=%s por HTTP,conserva ID/estado/otros y GET recupera', async purchased => {
    const before = await readProducts();
    const id = ids[purchased];
    const response = await send('PUT', `/api/products/${id}`, { name: '  Arroz integral  ', quantity: 3 });
    expect(response).toEqual({ status: 200, body: { id, name: 'Arroz integral', quantity: 3, purchased: purchased === 1, category: 'Otros' } });
    const after = await readProducts();
    expect(after.find(product => product.id === id)).toEqual(response.body);
    expect(after.filter(product => product.id !== id)).toEqual(before.filter(product => product.id !== id));
  });

  it('mismos valores200 sin modificar colección', async () => {
    const before = await readProducts();
    const product = before.find(item => item.id === ids[0]);
    const response = await send('PUT', `/api/products/${product.id}`, { name: product.name, quantity: product.quantity });
    expect(response).toEqual({ status: 200, body: product });
    expect(await readProducts()).toEqual(before);
  });

  it('nombres duplicados no alteran registro distinto', async () => {
    const before = await readProducts();
    const other = before.find(product => product.id === ids[1]);
    const response = await send('PUT', `/api/products/${ids[0]}`, { name: other.name, quantity: 5 });
    expect(response.status).toBe(200);
    const after = await readProducts();
    expect(after.find(product => product.id === ids[1])).toEqual(other);
    expect(after.filter(product => product.name === other.name && ids.includes(product.id))).toHaveLength(2);
  });

  it('acepta límites VARCHAR Unicode e INT,conserva estado comprado', async () => {
    const response = await send('PUT', `/api/products/${ids[1]}`, { name: '🍚'.repeat(150), quantity: 2147483647 });
    expect(response.status).toBe(200); expect(response.body.purchased).toBe(true);
    expect((await readProducts()).find(product => product.id === ids[1])).toEqual(response.body);
  });

  it.each([
    { name: '', quantity: 1 }, { name: '  ', quantity: 1 }, { name: 'a'.repeat(151), quantity: 1 },
    { name: 'Pan', quantity: 0 }, { name: 'Pan', quantity: -1 }, { name: 'Pan', quantity: 1.5 },
    { name: 'Pan', quantity: '2' }, { name: 'Pan' }, { quantity: 2 },
    { name: 'Pan', quantity: 1, id: randomUUID() }, { name: 'Pan', quantity: 1, purchased: false },
  ])('entrada inválida400 sin cambios: %j', async body => {
    const before = await readProducts();
    expect((await send('PUT', `/api/products/${ids[0]}`, body)).status).toBe(400);
    expect(await readProducts()).toEqual(before);
  });

  it.each([' ', 'a'.repeat(37)])('ID inválido400 sin cambios: %j', async id => {
    const before = await readProducts();
    expect((await send('PUT', `/api/products/${encodeURIComponent(id)}`, { name: 'Pan', quantity: 1 })).status).toBe(400);
    expect(await readProducts()).toEqual(before);
  });

  it('ID válido inexistente404 sin upsert', async () => {
    const before = await readProducts();
    const response = await send('PUT', `/api/products/${randomUUID()}`, { name: 'Pan', quantity: 1 });
    expect(response).toEqual({ status: 404, body: { error: { message: 'Producto no encontrado.' } } });
    expect(await readProducts()).toEqual(before);
  });

  it('rechazo real de conexión503 y recuperación sin cambios', async () => {
    const before = await readProducts(); const originalPort = process.env.DB_PORT;
    const port = await unusedPort(); await closePool();
    try {
      process.env.DB_PORT = String(port);
      const response = await send('PUT', `/api/products/${ids[0]}`, { name: 'Sin conexión', quantity: 1 });
      expect(response).toEqual({ status: 503, body: { error: 'Servicio temporalmente no disponible' } });
      expect((await fetch(`${origin}/health`)).status).toBe(200);
    } finally {
      await closePool();
      if (originalPort === undefined) delete process.env.DB_PORT;
      else process.env.DB_PORT = originalPort;
    }
    expect(await readProducts()).toEqual(before);
  });

  it('persiste edición después de reiniciar dos procesos del servidor', async () => {
    const expected = await readProducts();
    expect(await readFromFreshProcess()).toEqual(expected);
    expect(await readFromFreshProcess()).toEqual(expected);
    expect(expected.filter(product => !ids.includes(product.id))).toEqual(baseline);
  });
});
