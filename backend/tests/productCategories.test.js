import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(), getConnection: vi.fn(), getPool: vi.fn(),
  beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), destroy: vi.fn(),
}));
vi.mock('../src/config/database.js', () => ({ getPool: mocks.getPool }));
import app from '../src/app.js';
import {
  DEFAULT_PRODUCT_CATEGORY, PRODUCT_CATEGORIES, isValidProductCategory,
} from '../src/services/productCategories.js';
import { createProduct, updateProduct } from '../src/services/productService.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const row = Object.freeze({ id: 'id-original', name: 'Leche', quantity: 1, purchased: 1, category: 'Lácteos' });
const invalidCategories = ['Juguetes', 'lácteos', 'Lacteos', ' Lácteos ', 'OTROS', '', null, 5, true, [], {}];

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getPool.mockReturnValue({ execute: mocks.execute, getConnection: mocks.getConnection });
  mocks.getConnection.mockResolvedValue({ ...mocks });
  mocks.execute.mockImplementation(async sql => sql.startsWith('SELECT') ? [[row], []] : [{ affectedRows: 1 }, []]);
});

describe('SMARLIST-19 / HU-15 lista fija de categorías', () => {
  it('CP-07: ocho categorías inmutables con Otros por defecto', () => {
    expect(PRODUCT_CATEGORIES).toEqual([
      'Frutas y verduras', 'Carnes y pescados', 'Lácteos', 'Panadería', 'Despensa', 'Bebidas', 'Aseo', 'Otros',
    ]);
    expect(DEFAULT_PRODUCT_CATEGORY).toBe('Otros');
    expect(PRODUCT_CATEGORIES).toContain(DEFAULT_PRODUCT_CATEGORY);
    expect(Object.isFrozen(PRODUCT_CATEGORIES)).toBe(true);
  });

  it('valida solo coincidencias exactas', () => {
    PRODUCT_CATEGORIES.forEach(category => expect(isValidProductCategory(category)).toBe(true));
    invalidCategories.forEach(category => expect(isValidProductCategory(category)).toBe(false));
    expect(isValidProductCategory(undefined)).toBe(false);
  });
});

describe('SMARLIST-19 / HU-15 POST con categoría', () => {
  it.each(PRODUCT_CATEGORIES)('CP-01: registra con categoría %s e INSERT parametrizado', async category => {
    const response = await request(app).post('/api/products').send({ name: ' Leche ', quantity: 2, category });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: expect.stringMatching(uuid), name: 'Leche', quantity: 2, purchased: false, category });
    expect(mocks.execute).toHaveBeenCalledExactlyOnceWith(
      'INSERT INTO products (id, name, quantity, purchased, category) VALUES (?, ?, ?, ?, ?)',
      [response.body.id, 'Leche', 2, 0, category],
    );
  });

  it('CP-02: sin categoría usa Otros', async () => {
    const response = await request(app).post('/api/products').send({ name: 'Pan', quantity: 1 });
    expect(response.status).toBe(201);
    expect(response.body.category).toBe('Otros');
    expect(mocks.execute.mock.calls[0][1].at(-1)).toBe('Otros');
  });

  it.each(invalidCategories.map(category => [category]))('CP-05: categoría inválida %j responde400 sin SQL', async category => {
    const response = await request(app).post('/api/products').send({ name: 'Pan', quantity: 1, category });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { message: expect.stringMatching(/categoría/i) } });
    expect(mocks.getPool).not.toHaveBeenCalled();
  });

  it('CP-05: valida categoría en el servicio sin mutar la entrada', async () => {
    const data = Object.freeze({ name: 'Pan', quantity: 1, category: 'Juguetes' });
    await expect(createProduct(data)).rejects.toMatchObject({ status: 400 });
    expect(data.category).toBe('Juguetes');
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('sigue rechazando id, purchased y campos desconocidos junto a category', async () => {
    for (const extra of [{ id: 'x' }, { purchased: true }, { color: 'rojo' }]) {
      const response = await request(app).post('/api/products').send({ name: 'Pan', quantity: 1, category: 'Otros', ...extra });
      expect(response.status).toBe(400);
    }
    expect(mocks.getPool).not.toHaveBeenCalled();
  });
});

describe('SMARLIST-19 / HU-15 PUT con categoría', () => {
  it('CP-03: cambia la categoría, conserva ID y estado, UPDATE parametrizado', async () => {
    const response = await request(app).put(`/api/products/${row.id}`).send({ name: 'Leche entera', quantity: 2, category: 'Bebidas' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: row.id, name: 'Leche entera', quantity: 2, purchased: true, category: 'Bebidas' });
    expect(mocks.execute.mock.calls).toEqual([
      ['SELECT id, name, quantity, purchased, category FROM products WHERE id = ? FOR UPDATE', [row.id]],
      ['UPDATE products SET name = ?, quantity = ?, category = COALESCE(?, category) WHERE id = ?', ['Leche entera', 2, 'Bebidas', row.id]],
    ]);
    expect(mocks.commit).toHaveBeenCalledOnce();
  });

  it('CP-04: sin categoría conserva la actual (COALESCE con null)', async () => {
    const response = await request(app).put(`/api/products/${row.id}`).send({ name: 'Leche', quantity: 3 });
    expect(response.status).toBe(200);
    expect(response.body.category).toBe('Lácteos');
    expect(mocks.execute.mock.calls[1]).toEqual(
      ['UPDATE products SET name = ?, quantity = ?, category = COALESCE(?, category) WHERE id = ?', ['Leche', 3, null, row.id]],
    );
  });

  it('PATCH de estado conserva y devuelve la categoría', async () => {
    const id = '0f8fad5b-d9cb-469f-a165-70867728950e';
    mocks.execute.mockResolvedValueOnce([[{ ...row, id, purchased: 0 }], []]);
    const response = await request(app).patch(`/api/products/${id}/status`).send({ purchased: true });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id, name: 'Leche', quantity: 1, purchased: true, category: 'Lácteos' });
    expect(mocks.execute.mock.calls[1]).toEqual(['UPDATE products SET purchased = ? WHERE id = ?', [1, id]]);
  });

  it.each(invalidCategories.map(category => [category]))('CP-05: PUT con categoría %j responde400 sin SQL', async category => {
    const response = await request(app).put(`/api/products/${row.id}`).send({ name: 'Leche', quantity: 1, category });
    expect(response.status).toBe(400);
    expect(mocks.getConnection).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('POST y PUT comparten mensaje de categoría inválida', async () => {
    const data = { name: 'Leche', quantity: 1, category: 'Juguetes' };
    const postError = await createProduct(data).catch(error => error);
    const putError = await updateProduct(row.id, data).catch(error => error);
    expect(putError.message).toBe(postError.message);
    expect(postError.message).toContain(PRODUCT_CATEGORIES.join(', '));
  });

  it('producto inexistente con categoría válida responde404 sin UPDATE', async () => {
    mocks.execute.mockResolvedValueOnce([[], []]);
    const response = await request(app).put('/api/products/no-existe').send({ name: 'Leche', quantity: 1, category: 'Bebidas' });
    expect(response.status).toBe(404);
    expect(mocks.execute).toHaveBeenCalledOnce();
  });
});

describe('SMARLIST-19 / HU-15 GET con categoría', () => {
  it('CP-06: devuelve la categoría almacenada y consulta la columna', async () => {
    mocks.execute.mockResolvedValueOnce([[{ id: 'a', name: 'Pan', quantity: 1, purchased: 0, category: 'Panadería' }], []]);
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'a', name: 'Pan', quantity: 1, purchased: false, category: 'Panadería' }]);
    expect(mocks.execute).toHaveBeenCalledExactlyOnceWith(
      'SELECT id, name, quantity, purchased, category FROM products ORDER BY creation_order ASC',
    );
  });

  it.each([null, '', 'Juguetes', undefined])('CP-06: fila con categoría %j responde500 genérico', async category => {
    mocks.execute.mockResolvedValueOnce([[{ id: 'a', name: 'Pan', quantity: 1, purchased: 0, category }], []]);
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: { message: 'Error interno del servidor.' } });
  });
});
