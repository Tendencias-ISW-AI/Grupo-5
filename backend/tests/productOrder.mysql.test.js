import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mysql from 'mysql2/promise';
import request from 'supertest';
import app from '../src/app.js';
import { closePool, getPool } from '../src/config/database.js';
import { initializeDatabase } from '../src/config/initializeDatabase.js';

describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('SMARLIST-23 orden persistente en MySQL', () => {
  const ids = [];
  let baseline;
  beforeAll(async () => {
    if (process.env.DB_NAME !== 'smartlist_db' || !['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? 'localhost')) {
      throw new Error('Las pruebas requieren smartlist_db local.');
    }
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    baseline = response.body;
  });
  afterAll(async () => {
    try {
      for (const id of ids) await getPool().execute('DELETE FROM products WHERE id = ?', [id]);
      if (baseline) expect((await request(app).get('/api/products')).body).toEqual(baseline);
    } finally { await closePool(); }
  });

  it('registra Leche, Queso, Pan y Jabón rápidamente y mantiene el orden tras reconectar', async () => {
    const created = [];
    for (const name of ['Leche', 'Queso', 'Pan', 'Jabón']) {
      const response = await request(app).post('/api/products').send({ name, quantity: 1 });
      expect(response.status).toBe(201);
      ids.push(response.body.id);
      created.push(response.body);
    }
    const expected = [...baseline, ...created];
    expect((await request(app).get('/api/products')).body).toEqual(expected);
    await closePool();
    expect((await request(app).get('/api/products')).body).toEqual(expected);
    const [[counts]] = await getPool().execute('SELECT COUNT(*) AS total, COUNT(DISTINCT creation_order) AS distinct_orders FROM products');
    expect(counts.total).toBe(counts.distinct_orders);
  });

  it('las inserciones concurrentes reciben secuencias únicas y GET respeta la asignación de MySQL', async () => {
    const results = await Promise.all(Array.from({ length: 12 }, (_, index) =>
      request(app).post('/api/products').send({ name: `SMARLIST-23 concurrente ${index}`, quantity: 1 })
        .then(response => { if (response.status === 201) ids.push(response.body.id); return response; })));
    expect(results.every(response => response.status === 201)).toBe(true);
    const [stored] = await getPool().execute('SELECT id FROM products ORDER BY creation_order ASC');
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body.map(product => product.id)).toEqual(stored.map(product => product.id));
  });
});

// Cada escenario usa un esquema propio. Nunca se altera products de la base del usuario.
describe.skipIf(process.env.RUN_MYSQL_TESTS !== '1')('SMARLIST-23 migración MySQL en esquemas desechables', () => {
  it.each(['empty', 'legacy', 'category', 'pending'])('inicializa dos veces y conserva datos: %s', async state => {
    if (!['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? 'localhost')) {
      throw new Error('Las migraciones de prueba requieren MySQL local.');
    }
    const schema = `smartlist_order_test_${randomUUID().replaceAll('-', '')}`;
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST ?? 'localhost', port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER, password: process.env.DB_PASSWORD ?? '',
    });
    const adapter = {
      execute: (sql, values) => connection.execute(sql.replaceAll('smartlist_db', schema),
        values?.map(value => value === 'smartlist_db' ? schema : value)),
      query: (sql, values) => connection.query(sql.replaceAll('smartlist_db', schema), values),
    };
    try {
      if (state !== 'empty') {
        let sql = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
        sql = sql.replace(/  creation_order[^\n]*\n/, '').replace(/  UNIQUE KEY uq_product_creation_order[^\n]*\n/, '');
        if (state === 'legacy') sql = sql.replace(/  category[^\n]*\n/, '');
        for (const statement of sql.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(Boolean)) {
          await adapter.execute(statement);
        }
        for (const id of ['z', 'a', 'm']) {
          await adapter.execute('INSERT INTO smartlist_db.products (id, name, quantity, purchased) VALUES (?, ?, ?, ?)', [id, `Anterior ${id}`, 2, 1]);
        }
        if (state === 'pending') {
          await adapter.execute('ALTER TABLE smartlist_db.products ADD COLUMN creation_order BIGINT UNSIGNED NULL');
          await adapter.execute('UPDATE smartlist_db.products SET creation_order = 10 WHERE id = ?', ['z']);
        }
      }
      const first = await initializeDatabase(adapter);
      expect(first.creationOrderAdded).toBe(state !== 'empty');
      const [before] = await adapter.execute('SELECT * FROM smartlist_db.products ORDER BY creation_order ASC');
      expect(before.map(row => row.id)).toEqual(state === 'empty' ? [] : ['a', 'm', 'z']);
      for (const row of before) expect(row).toMatchObject({ name: `Anterior ${row.id}`, quantity: 2, purchased: 1, category: 'Otros' });
      expect(await initializeDatabase(adapter)).toEqual({ databaseCreated: false, tableCreated: false, categoryAdded: false, creationOrderAdded: false });
      expect((await adapter.execute('SELECT * FROM smartlist_db.products ORDER BY creation_order ASC'))[0]).toEqual(before);
      await adapter.execute('INSERT INTO smartlist_db.products (id, name, quantity) VALUES (?, ?, ?)', ['0', 'Nuevo', 1]);
      const [after] = await adapter.execute('SELECT id FROM smartlist_db.products ORDER BY creation_order ASC');
      expect(after.map(row => row.id)).toEqual([...before.map(row => row.id), '0']);
    } finally {
      // Solo el esquema aleatorio creado por este caso; nunca smartlist_db.
      await connection.execute(`DROP DATABASE IF EXISTS ${schema}`);
      await connection.end();
    }
  });
});
