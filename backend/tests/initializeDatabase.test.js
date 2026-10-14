import { describe, expect, it, vi } from 'vitest';
import { initializeDatabase } from '../src/config/initializeDatabase.js';

const legacyColumns = [
  { COLUMN_NAME: 'id', DATA_TYPE: 'varchar', CHARACTER_MAXIMUM_LENGTH: 36, IS_NULLABLE: 'NO', COLUMN_KEY: 'PRI', COLUMN_DEFAULT: null },
  { COLUMN_NAME: 'name', DATA_TYPE: 'varchar', CHARACTER_MAXIMUM_LENGTH: 150, IS_NULLABLE: 'NO', COLUMN_KEY: '', COLUMN_DEFAULT: null },
  { COLUMN_NAME: 'quantity', DATA_TYPE: 'int', CHARACTER_MAXIMUM_LENGTH: null, IS_NULLABLE: 'NO', COLUMN_KEY: '', COLUMN_DEFAULT: null },
  { COLUMN_NAME: 'purchased', DATA_TYPE: 'tinyint', CHARACTER_MAXIMUM_LENGTH: null, IS_NULLABLE: 'NO', COLUMN_KEY: '', COLUMN_DEFAULT: '0' },
];
const categoryColumn = { COLUMN_NAME: 'category', DATA_TYPE: 'varchar', CHARACTER_MAXIMUM_LENGTH: 30, IS_NULLABLE: 'NO', COLUMN_KEY: '', COLUMN_DEFAULT: 'Otros' };
const categoryColumns = [...legacyColumns, categoryColumn];
const sequenceColumn = { COLUMN_NAME: 'creation_order', DATA_TYPE: 'bigint', COLUMN_TYPE: 'bigint unsigned', EXTRA: 'auto_increment', IS_NULLABLE: 'NO', COLUMN_KEY: 'UNI' };
const sequenceIndex = { INDEX_NAME: 'uq_product_creation_order', COLUMN_NAME: 'creation_order', SEQ_IN_INDEX: 1 };
const columns = [...categoryColumns, sequenceColumn];
const checks = ['quantity > 0', 'purchased in (0,1)', 'char_length(trim(name)) > 0', 'char_length(trim(id)) > 0']
  .map(CHECK_CLAUSE => ({ CHECK_CLAUSE, ENFORCED: 'YES' }));

function connection({ exists = true, version = '8.0.41', fields = columns, constraints = checks, uniqueIndexes = fields.some(c => c.EXTRA === 'auto_increment') ? [sequenceIndex] : [] } = {}) {
  let databaseExists = exists;
  let tableExists = exists;
  let currentFields = fields;
  let indexes = uniqueIndexes;
  const db = { execute: vi.fn(async (sql) => {
    if (sql.startsWith('SELECT @@SESSION.autocommit')) return [[{ autocommit: 1 }]];
    if (sql.startsWith('SELECT VERSION')) return [[{ version }]];
    if (sql.includes('information_schema.SCHEMATA')) return [databaseExists ? [{ SCHEMA_NAME: 'smartlist_db' }] : []];
    if (sql.includes('information_schema.TABLES')) return [tableExists ? [{ TABLE_TYPE: 'BASE TABLE' }] : []];
    if (sql.includes('information_schema.COLUMNS')) return [currentFields];
    if (sql.includes('information_schema.TABLE_CONSTRAINTS')) return [constraints];
    if (sql.includes('information_schema.STATISTICS')) return [indexes];
    if (sql.startsWith('CREATE DATABASE')) { databaseExists = true; return [{}]; }
    if (sql.startsWith('CREATE TABLE')) { tableExists = true; currentFields = columns; indexes = [sequenceIndex]; return [{}]; }
    if (sql.includes('ADD COLUMN category')) { currentFields = [...currentFields, categoryColumn]; return [{}]; }
    if (sql.includes('ADD COLUMN creation_order')) { currentFields = [...currentFields, { ...sequenceColumn, IS_NULLABLE: 'YES', EXTRA: '', COLUMN_KEY: '' }]; return [{}]; }
    if (sql.includes('MODIFY COLUMN creation_order')) { currentFields = currentFields.map(c => c.COLUMN_NAME === 'creation_order' ? sequenceColumn : c); indexes = [sequenceIndex]; return [{}]; }
    if (sql.startsWith('SELECT id FROM')) return [[{ id: 'a' }, { id: 'z' }]];
    if (/^(LOCK|UNLOCK|UPDATE|SET|ROLLBACK)/.test(sql)) return [{}];
    throw new Error('Consulta no prevista');
  }) };
  db.query = vi.fn((...args) => db.execute(...args));
  return db;
}

describe('Inicialización no destructiva', () => {
  it('crea solo los objetos faltantes y el segundo inicio no ejecuta DDL', async () => {
    const db = connection({ exists: false });
    expect(await initializeDatabase(db)).toEqual({ databaseCreated: true, tableCreated: true, categoryAdded: false, creationOrderAdded: false });
    const firstDdl = db.execute.mock.calls.filter(([sql]) => sql.startsWith('CREATE'));
    expect(firstDdl).toHaveLength(2);
    expect(await initializeDatabase(db)).toEqual({ databaseCreated: false, tableCreated: false, categoryAdded: false, creationOrderAdded: false });
    expect(db.execute.mock.calls.filter(([sql]) => sql.startsWith('CREATE'))).toHaveLength(2);
    expect(db.execute.mock.calls.every(([sql]) => !/\b(DROP|ALTER|TRUNCATE|DELETE)\b/i.test(sql))).toBe(true);
  });

  it('conserva una tabla compatible sin DDL', async () => {
    const db = connection();
    await initializeDatabase(db);
    expect(db.execute.mock.calls.some(([sql]) => /^(CREATE|ALTER|DROP)/.test(sql))).toBe(false);
  });

  it('CP-10: la tabla nueva incluye category con Otros por defecto', async () => {
    const db = connection({ exists: false });
    await initializeDatabase(db);
    const createTable = db.execute.mock.calls.map(([sql]) => sql).find(sql => sql.startsWith('CREATE TABLE'));
    expect(createTable).toContain("category VARCHAR(30) NOT NULL DEFAULT 'Otros'");
  });

  it('CP-08: migra una tabla sin category ni secuencia y la reverifica', async () => {
    const db = connection({ fields: legacyColumns });
    expect(await initializeDatabase(db)).toEqual({ databaseCreated: false, tableCreated: false, categoryAdded: true, creationOrderAdded: true });
    const ddl = db.execute.mock.calls.map(([sql]) => sql).filter(sql => /^(CREATE|ALTER|DROP)/.test(sql));
    expect(ddl).toHaveLength(3);
    expect(ddl[0]).toBe("ALTER TABLE smartlist_db.products ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'Otros'");
    expect(db.execute.mock.calls.filter(([sql]) => sql.startsWith('UPDATE')).map(([, values]) => values)).toEqual([[1, 'a'], [2, 'z']]);
    expect(db.execute.mock.calls.filter(([sql]) => sql.includes('information_schema.COLUMNS'))).toHaveLength(3);
    expect(await initializeDatabase(db)).toEqual({ databaseCreated: false, tableCreated: false, categoryAdded: false, creationOrderAdded: false });
    expect(db.execute.mock.calls.filter(([sql]) => sql.startsWith('ALTER'))).toHaveLength(3);
  });

  it('migra la versión con category sin alterar los atributos existentes', async () => {
    const db = connection({ fields: categoryColumns });
    expect(await initializeDatabase(db)).toEqual({ databaseCreated: false, tableCreated: false, categoryAdded: false, creationOrderAdded: true });
    await initializeDatabase(db);
    expect(db.execute.mock.calls.filter(([sql]) => sql.startsWith('ALTER'))).toHaveLength(2);
  });

  it('retoma una migración interrumpida y libera el bloqueo si falla el relleno', async () => {
    const db = connection({ fields: [...categoryColumns, { ...sequenceColumn, IS_NULLABLE: 'YES', EXTRA: '', COLUMN_KEY: '' }] });
    await initializeDatabase(db);
    expect(db.execute.mock.calls.some(([sql]) => sql.includes('ADD COLUMN creation_order'))).toBe(false);
    const failing = connection({ fields: categoryColumns });
    const execute = failing.execute.getMockImplementation();
    failing.execute.mockImplementation((sql, values) => {
      if (sql.startsWith('UPDATE')) throw new Error('Fallo de relleno');
      return execute(sql, values);
    });
    await expect(initializeDatabase(failing)).rejects.toThrow('Fallo de relleno');
    expect(failing.query).toHaveBeenCalledWith('UNLOCK TABLES');
    expect(failing.query).toHaveBeenLastCalledWith('SET autocommit = ?', [1]);
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
    ['legado con CHECK faltante', legacyColumns, checks.slice(1)],
    ['category con longitud distinta', columns.map(c => c.COLUMN_NAME === 'category' ? { ...c, CHARACTER_MAXIMUM_LENGTH: 50 } : c), checks],
    ['category sin valor por defecto Otros', columns.map(c => c.COLUMN_NAME === 'category' ? { ...c, COLUMN_DEFAULT: null } : c), checks],
    ['category nullable', columns.map(c => c.COLUMN_NAME === 'category' ? { ...c, IS_NULLABLE: 'YES' } : c), checks],
    ['secuencia sin AUTO_INCREMENT', columns.map(c => c.COLUMN_NAME === 'creation_order' ? { ...c, EXTRA: '' } : c), checks],
    ['secuencia con tipo incorrecto', columns.map(c => c.COLUMN_NAME === 'creation_order' ? { ...c, COLUMN_TYPE: 'bigint' } : c), checks],
    ['columna adicional desconocida', [...columns, { ...categoryColumn, COLUMN_NAME: 'color' }], checks],
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
