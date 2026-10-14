import { readFile } from 'node:fs/promises';

const schemaName = 'smartlist_db';

async function verifyTable(connection) {
  const [columns] = await connection.execute(
    'SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, EXTRA, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
    [schemaName, 'products'],
  );
  const [checks] = await connection.execute(
    "SELECT cc.CHECK_CLAUSE, tc.ENFORCED FROM information_schema.TABLE_CONSTRAINTS tc JOIN information_schema.CHECK_CONSTRAINTS cc ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME WHERE tc.TABLE_SCHEMA = ? AND tc.TABLE_NAME = ? AND tc.CONSTRAINT_TYPE = 'CHECK'",
    [schemaName, 'products'],
  );
  const [extraUniqueIndexes] = await connection.execute(
    "SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'",
    [schemaName, 'products'],
  );
  const fields = Object.fromEntries(columns.map(column => [column.COLUMN_NAME, column]));
  const legacy = !fields.category;
  const sequence = fields.creation_order;
  const sequenceIndex = extraUniqueIndexes.filter(index => index.INDEX_NAME === 'uq_product_creation_order');
  const ordered = sequence?.DATA_TYPE === 'bigint' && sequence.COLUMN_TYPE === 'bigint unsigned'
    && sequence.IS_NULLABLE === 'NO' && sequence.EXTRA === 'auto_increment'
    && sequenceIndex.length === 1 && sequenceIndex[0].COLUMN_NAME === 'creation_order'
    && sequenceIndex[0].SEQ_IN_INDEX === 1;
  // Una interrupción anterior al último ALTER permite retomar el relleno.
  const pending = sequence?.DATA_TYPE === 'bigint' && sequence.COLUMN_TYPE === 'bigint unsigned'
    && sequence.IS_NULLABLE === 'YES' && sequence.EXTRA === '' && extraUniqueIndexes.length === 0;
  const validCategory = legacy || (
    fields.category?.DATA_TYPE === 'varchar' && fields.category.CHARACTER_MAXIMUM_LENGTH === 30
    && String(fields.category.COLUMN_DEFAULT) === 'Otros');
  const validColumns = validCategory
    && columns.length === 4 + Number(!legacy) + Number(Boolean(sequence))
    && (!sequence || ordered || pending)
    && columns.every(column => column.COLUMN_NAME === 'creation_order' || column.IS_NULLABLE === 'NO')
    && fields.id?.DATA_TYPE === 'varchar' && fields.id.CHARACTER_MAXIMUM_LENGTH === 36
    && fields.id.COLUMN_KEY === 'PRI' && columns.filter(column => column.COLUMN_KEY === 'PRI').length === 1
    && fields.name?.DATA_TYPE === 'varchar' && fields.name.CHARACTER_MAXIMUM_LENGTH === 150
    && fields.quantity?.DATA_TYPE === 'int'
    && fields.purchased?.DATA_TYPE === 'tinyint' && String(fields.purchased.COLUMN_DEFAULT) === '0';
  const clauses = checks.filter(check => check.ENFORCED === 'YES')
    .map(check => check.CHECK_CLAUSE.toLowerCase().replace(/[\s`()]/g, ''));
  const validChecks = ['quantity>0', 'purchasedin0,1', 'char_lengthtrimname>0', 'char_lengthtrimid>0']
    .every(required => clauses.includes(required));
  if (!validColumns || !validChecks || extraUniqueIndexes.length !== (ordered ? 1 : 0)) {
    throw new Error('La estructura existente de products es incompatible; no se aplicaron reparaciones.');
  }
  return { legacy, ordered, pending };
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
  let structure = tables.length ? await verifyTable(connection) : null;

  const statements = await readStatements('schema.sql');
  if (!databases.length) await connection.execute(statements[0]);
  if (!tables.length) {
    await connection.execute(statements[1]);
    structure = await verifyTable(connection);
    if (structure.legacy || !structure.ordered) throw new Error('La tabla creada no incluye category y creation_order.');
  }
  const categoryAdded = structure.legacy;
  if (categoryAdded) {
    const [addCategory] = await readStatements('add-product-category.sql');
    await connection.execute(addCategory);
    structure = await verifyTable(connection);
    if (structure.legacy) {
      throw new Error('La migración de category no produjo la estructura esperada.');
    }
  }
  const creationOrderAdded = !structure.ordered;
  if (creationOrderAdded) {
    const [addSequence, finalizeSequence] = await readStatements('add-product-creation-order.sql');
    if (!structure.pending) await connection.execute(addSequence);
    const [[{ autocommit }]] = await connection.execute('SELECT @@SESSION.autocommit AS autocommit');
    await connection.query('SET autocommit = 0');
    try {
      // LOCK TABLES no admite el protocolo de sentencias preparadas de MySQL.
      await connection.query('LOCK TABLES smartlist_db.products WRITE');
      // MySQL fija el orden histórico; JavaScript no ordena productos ni depende del reloj.
      const [rows] = await connection.execute('SELECT id FROM smartlist_db.products ORDER BY BINARY id ASC');
      for (let index = 0; index < rows.length; index++) {
        await connection.execute('UPDATE smartlist_db.products SET creation_order = ? WHERE id = ?', [index + 1, rows[index].id]);
      }
      await connection.execute(finalizeSequence);
    } finally {
      try {
        await connection.query('ROLLBACK');
      } finally {
        try { await connection.query('UNLOCK TABLES'); }
        finally { await connection.query('SET autocommit = ?', [autocommit]); }
      }
    }
    if (!(await verifyTable(connection)).ordered) throw new Error('La migración de creation_order no produjo la estructura esperada.');
  }
  return { databaseCreated: databases.length === 0, tableCreated: tables.length === 0, categoryAdded, creationOrderAdded };
}
