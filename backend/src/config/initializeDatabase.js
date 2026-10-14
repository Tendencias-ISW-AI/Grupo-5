import { readFile } from 'node:fs/promises';

const schemaName = 'smartlist_db';

async function verifyTable(connection) {
  const [columns] = await connection.execute(
    'SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
    [schemaName, 'products'],
  );
  const [checks] = await connection.execute(
    "SELECT cc.CHECK_CLAUSE, tc.ENFORCED FROM information_schema.TABLE_CONSTRAINTS tc JOIN information_schema.CHECK_CONSTRAINTS cc ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME WHERE tc.TABLE_SCHEMA = ? AND tc.TABLE_NAME = ? AND tc.CONSTRAINT_TYPE = 'CHECK'",
    [schemaName, 'products'],
  );
  const [extraUniqueIndexes] = await connection.execute(
    "SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'",
    [schemaName, 'products'],
  );
  const fields = Object.fromEntries(columns.map(column => [column.COLUMN_NAME, column]));
  // HU-15: cuatro columnas es la versión anterior (sin category), migrable por initializeDatabase.
  const legacy = columns.length === 4;
  const validCategory = legacy || (columns.length === 5
    && fields.category?.DATA_TYPE === 'varchar' && fields.category.CHARACTER_MAXIMUM_LENGTH === 30
    && String(fields.category.COLUMN_DEFAULT) === 'Otros');
  const validColumns = validCategory
    && columns.every(column => column.IS_NULLABLE === 'NO')
    && fields.id?.DATA_TYPE === 'varchar' && fields.id.CHARACTER_MAXIMUM_LENGTH === 36
    && fields.id.COLUMN_KEY === 'PRI' && columns.filter(column => column.COLUMN_KEY === 'PRI').length === 1
    && fields.name?.DATA_TYPE === 'varchar' && fields.name.CHARACTER_MAXIMUM_LENGTH === 150
    && fields.quantity?.DATA_TYPE === 'int'
    && fields.purchased?.DATA_TYPE === 'tinyint' && String(fields.purchased.COLUMN_DEFAULT) === '0';
  const clauses = checks.filter(check => check.ENFORCED === 'YES')
    .map(check => check.CHECK_CLAUSE.toLowerCase().replace(/[\s`()]/g, ''));
  const validChecks = ['quantity>0', 'purchasedin0,1', 'char_lengthtrimname>0', 'char_lengthtrimid>0']
    .every(required => clauses.includes(required));
  if (!validColumns || !validChecks || extraUniqueIndexes.length > 0) {
    throw new Error('La estructura existente de products es incompatible; no se aplicaron reparaciones.');
  }
  return legacy ? 'legacy' : 'current';
}

async function readStatements(file) {
  const sql = await readFile(new URL(`../../database/${file}`, import.meta.url), 'utf8');
  return sql.replace(/--[^\n]*/g, '').split(';').map(statement => statement.trim()).filter(Boolean);
}

export async function initializeDatabase(connection) {
  const [[{ version }]] = await connection.execute('SELECT VERSION() AS version');
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  const supported = match && !/mariadb/i.test(version)
    && (Number(match[1]) > 8 || (Number(match[1]) === 8 && (Number(match[2]) > 0 || Number(match[3]) >= 16)));
  if (!supported) throw new Error('La versión debe ser MySQL 8.0.16 o superior para aplicar CHECK.');

  const [databases] = await connection.execute('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', [schemaName]);
  const [tables] = await connection.execute('SELECT TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?', [schemaName, 'products']);
  if (tables.length && tables[0].TABLE_TYPE !== 'BASE TABLE') {
    throw new Error('El objeto products existente es incompatible; no se modificó.');
  }
  const structure = tables.length ? await verifyTable(connection) : null;

  const statements = await readStatements('schema.sql');
  if (!databases.length) await connection.execute(statements[0]);
  if (!tables.length) {
    await connection.execute(statements[1]);
    if (await verifyTable(connection) !== 'current') throw new Error('La tabla creada no incluye category.');
  }
  const categoryAdded = structure === 'legacy';
  if (categoryAdded) {
    const [addCategory] = await readStatements('add-product-category.sql');
    await connection.execute(addCategory);
    if (await verifyTable(connection) !== 'current') {
      throw new Error('La migración de category no produjo la estructura esperada.');
    }
  }
  return { databaseCreated: databases.length === 0, tableCreated: tables.length === 0, categoryAdded };
}
