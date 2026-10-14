import { describe, expect, it, vi } from 'vitest';
import { initializeDatabase } from '../src/config/initializeDatabase.js';

const columns = [
  { COLUMN_NAME: 'id', DATA_TYPE: 'varchar', CHARACTER_MAXIMUM_LENGTH: 36, IS_NULLABLE: 'NO', COLUMN_KEY: 'PRI', COLUMN_DEFAULT: null },
  { COLUMN_NAME: 'name', DATA_TYPE: 'varchar', CHARACTER_MAXIMUM_LENGTH: 150, IS_NULLABLE: 'NO', COLUMN_KEY: '', COLUMN_DEFAULT: null },
  { COLUMN_NAME: 'quantity', DATA_TYPE: 'int', CHARACTER_MAXIMUM_LENGTH: null, IS_NULLABLE: 'NO', COLUMN_KEY: '', COLUMN_DEFAULT: null },
  { COLUMN_NAME: 'purchased', DATA_TYPE: 'tinyint', CHARACTER_MAXIMUM_LENGTH: null, IS_NULLABLE: 'NO', COLUMN_KEY: '', COLUMN_DEFAULT: '0' },
];
const checks = ['quantity > 0', 'purchased in (0,1)', 'char_length(trim(name)) > 0', 'char_length(trim(id)) > 0']
  .map(CHECK_CLAUSE => ({ CHECK_CLAUSE, ENFORCED: 'YES' }));

function connection({ exists = true, version = '8.0.41', fields = columns, constraints = checks, uniqueIndexes = [] } = {}) {
  let databaseExists = exists;
  let tableExists = exists;
  return { execute: vi.fn(async (sql) => {
    if (sql.startsWith('SELECT VERSION')) return [[{ version }]];
    if (sql.includes('information_schema.SCHEMATA')) return [databaseExists ? [{ SCHEMA_NAME: 'smartlist_db' }] : []];
    if (sql.includes('information_schema.TABLES')) return [tableExists ? [{ TABLE_TYPE: 'BASE TABLE' }] : []];
    if (sql.includes('information_schema.COLUMNS')) return [fields];
    if (sql.includes('information_schema.TABLE_CONSTRAINTS')) return [constraints];
    if (sql.includes('information_schema.STATISTICS')) return [uniqueIndexes];
    if (sql.startsWith('CREATE DATABASE')) { databaseExists = true; return [{}]; }
    if (sql.startsWith('CREATE TABLE')) { tableExists = true; return [{}]; }
    throw new Error('Consulta no prevista');
  }) };
}

describe('Inicialización no destructiva', () => {
  it('crea solo los objetos faltantes y el segundo inicio no ejecuta DDL', async () => {
    const db = connection({ exists: false });
    expect(await initializeDatabase(db)).toEqual({ databaseCreated: true, tableCreated: true });
    const firstDdl = db.execute.mock.calls.filter(([sql]) => sql.startsWith('CREATE'));
    expect(firstDdl).toHaveLength(2);
    expect(await initializeDatabase(db)).toEqual({ databaseCreated: false, tableCreated: false });
    expect(db.execute.mock.calls.filter(([sql]) => sql.startsWith('CREATE'))).toHaveLength(2);
    expect(db.execute.mock.calls.every(([sql]) => !/\b(DROP|ALTER|TRUNCATE|DELETE)\b/i.test(sql))).toBe(true);
  });

  it('conserva una tabla compatible sin DDL', async () => {
    const db = connection();
    await initializeDatabase(db);
    expect(db.execute.mock.calls.some(([sql]) => sql.startsWith('CREATE'))).toBe(false);
  });

  it.each(['8.0.15', '5.7.44', '10.11.0-MariaDB'])('rechaza versión sin CHECK garantizado: %s', async version => {
    const db = connection({ version });
    await expect(initializeDatabase(db)).rejects.toThrow(/versión/i);
    expect(db.execute).toHaveBeenCalledOnce();
  });

  it.each([
    ['cantidad con tipo incorrecto', columns.map(c => c.COLUMN_NAME === 'quantity' ? { ...c, DATA_TYPE: 'decimal' } : c), checks],
    ['sin clave primaria', columns.map(c => ({ ...c, COLUMN_KEY: '' })), checks],
    ['CHECK no enforced', columns, checks.map(c => ({ ...c, ENFORCED: 'NO' }))],
    ['CHECK faltante', columns, checks.slice(1)],
  ])('detiene sin alterar tabla incompatible: %s', async (_description, fields, constraints) => {
    const db = connection({ fields, constraints });
    await expect(initializeDatabase(db)).rejects.toThrow(/incompatible/i);
    expect(db.execute.mock.calls.some(([sql]) => /^(CREATE|ALTER|DROP)/.test(sql))).toBe(false);
  });

  it('rechaza índices únicos adicionales que podrían impedir nombres repetidos', async () => {
    const db = connection({ uniqueIndexes: [{ INDEX_NAME: 'unique_name' }] });
    await expect(initializeDatabase(db)).rejects.toThrow(/incompatible/i);
    expect(db.execute.mock.calls.some(([sql]) => /^(CREATE|ALTER|DROP)/.test(sql))).toBe(false);
  });
});
