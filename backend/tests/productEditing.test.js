import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(), getConnection: vi.fn(), getPool: vi.fn(),
  beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), destroy: vi.fn(),
}));
vi.mock('../src/config/database.js', () => ({ getPool: mocks.getPool }));
import app from '../src/app.js';
import { createProduct, updateProduct } from '../src/services/productService.js';
import { updateProductById } from '../src/repositories/productRepository.js';

const row = Object.freeze({ id: 'id-original', name: 'Pan', quantity: 1, purchased: 0 });
const body = { name: '  Arroz integral  ', quantity: 3 };
const invalid = [
  { name: '', quantity: 1 }, { name: ' \t ', quantity: 1 }, { name: 2, quantity: 1 },
  { name: 'a'.repeat(151), quantity: 1 }, { name: '\ud800', quantity: 1 },
  { name: 'Pan', quantity: 0 }, { name: 'Pan', quantity: -1 }, { name: 'Pan', quantity: 1.5 },
  { name: 'Pan', quantity: '2' }, { name: 'Pan', quantity: true }, { name: 'Pan', quantity: 2147483648 },
  { name: 'Pan' }, { quantity: 2 }, {}, { name: 'Pan', quantity: 1, id: 'otro' },
  { name: 'Pan', quantity: 1, purchased: false }, { name: 'Pan', quantity: 1, purchased: true },
  { name: 'Pan', quantity: 1, extra: 2 }, [], null,
];

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getPool.mockReturnValue({ execute: mocks.execute, getConnection: mocks.getConnection });
  mocks.getConnection.mockResolvedValue({ ...mocks });
  mocks.execute.mockImplementation(async sql => sql.startsWith('SELECT') ? [[row], []] : [{ affectedRows: 1 }, []]);
});

describe('SMARLIST-13 / HU-12 edición', () => {
  it.each([0, 1])('CA01/02/04/07:200 cuatro atributos,ID original y estado %s conservado', async purchased => {
    mocks.execute.mockResolvedValueOnce([[{ ...row, purchased }], []]).mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const response = await request(app).put(`/api/products/${row.id}`).send(body);
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ id: row.id, name: 'Arroz integral', quantity: 3, purchased: purchased === 1 });
    expect(mocks.beginTransaction).toHaveBeenCalledOnce(); expect(mocks.commit).toHaveBeenCalledOnce();
    expect(mocks.release).toHaveBeenCalledOnce(); expect(mocks.rollback).not.toHaveBeenCalled();
    expect(row.name).toBe('Pan');
  });

  it('CA05: consulta bloqueante y UPDATE parametrizados afectan solo ID', async () => {
    const id = "x' OR '1'='1";
    await updateProductById(id, { name: "Arroz'); SQL --", quantity: 2 });
    expect(mocks.execute.mock.calls).toEqual([
      ['SELECT id, name, quantity, purchased FROM products WHERE id = ? FOR UPDATE', [id]],
      ['UPDATE products SET name = ?, quantity = ? WHERE id = ?', ["Arroz'); SQL --", 2, id]],
    ]);
    expect(mocks.getConnection).toHaveBeenCalledOnce();
  });

  it('mismos valores200 incluso affectedRows=0; no falso404', async () => {
    mocks.execute.mockResolvedValueOnce([[row], []]).mockResolvedValueOnce([{ affectedRows: 0 }, []]);
    const response = await request(app).put(`/api/products/${row.id}`).send({ name: row.name, quantity: row.quantity });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...row, purchased: false });
  });

  it('CA06:ID válido inexistente404,sin UPDATE ni creación', async () => {
    mocks.execute.mockResolvedValueOnce([[], []]);
    const response = await request(app).put('/api/products/no-existe').send(body);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { message: 'Producto no encontrado.' } });
    expect(mocks.execute).toHaveBeenCalledOnce(); expect(mocks.rollback).toHaveBeenCalledOnce();
    expect(mocks.commit).not.toHaveBeenCalled(); expect(mocks.release).toHaveBeenCalledOnce();
  });

  it.each(invalid.map(data => [data]))('CA03:entrada inválida400 antes deSQL: %j', async data => {
    const response = await request(app).put(`/api/products/${row.id}`).send(data);
    expect(response.status).toBe(400);
    expect(response.body.error.message).toEqual(expect.any(String));
    expect(mocks.getConnection).not.toHaveBeenCalled(); expect(mocks.execute).not.toHaveBeenCalled();
  });

  it.each([' ', ' id', 'id ', 'a'.repeat(37)])('ID inválido %j responde400 antes deSQL', async id => {
    const response = await request(app).put(`/api/products/${encodeURIComponent(id)}`).send(body);
    expect(response.status).toBe(400);
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it.each([undefined, null, 1, '', '\ud800'])('servicio valida ID %j independientemente', async id => {
    await expect(updateProduct(id, body)).rejects.toMatchObject({ status: 400 });
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it('POST y PUT comparten rechazo y mensaje, sin modificar entrada', async () => {
    const data = Object.freeze({ name: 'Pan', quantity: '2' });
    const postError = await createProduct(data).catch(error => error);
    const putError = await updateProduct(row.id, data).catch(error => error);
    expect(putError.status).toBe(400); expect(putError.message).toBe(postError.message);
    expect(data.quantity).toBe('2'); expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('cuerpo ausente y JSON malformado400 sin SQL', async () => {
    expect((await request(app).put(`/api/products/${row.id}`)).status).toBe(400);
    const response = await request(app).put(`/api/products/${row.id}`).set('Content-Type', 'application/json').send('{');
    expect(response.status).toBe(400); expect(response.body).toEqual({ error: { message: 'JSON inválido.' } });
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it('fallo de conexión503 y /health200,sin secretos', async () => {
    mocks.getConnection.mockRejectedValue(Object.assign(new Error('SQL password=ficticio'), { code: 'ECONNREFUSED' }));
    const response = await request(app).put(`/api/products/${row.id}`).send(body);
    expect(response.status).toBe(503); expect(response.body).toEqual({ error: 'Servicio temporalmente no disponible' });
    expect((await request(app).get('/health')).status).toBe(200);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it('fallo en UPDATE ejecuta rollback y release,sin commit', async () => {
    mocks.execute.mockResolvedValueOnce([[row], []]).mockRejectedValueOnce(Object.assign(new Error('Privado'), { code: 'ECONNRESET' }));
    await expect(updateProduct(row.id, body)).rejects.toMatchObject({ status: 503 });
    expect(mocks.rollback).toHaveBeenCalledOnce(); expect(mocks.release).toHaveBeenCalledOnce();
    expect(mocks.commit).not.toHaveBeenCalled();
  });

  it('si rollback falla destruye conexión y conserva error original', async () => {
    const original = Object.assign(new Error('Fallo privado'), { code: 'ECONNRESET' });
    mocks.execute.mockRejectedValueOnce(original); mocks.rollback.mockRejectedValueOnce(new Error('Rollback falló'));
    await expect(updateProductById(row.id, body)).rejects.toBe(original);
    expect(mocks.destroy).toHaveBeenCalledOnce(); expect(mocks.release).not.toHaveBeenCalled();
  });

  it('error SQL inesperado500 genérico; rollback y release', async () => {
    mocks.execute.mockRejectedValueOnce(Object.assign(new Error('SQL interno'), { code: 'ER_PARSE_ERROR' }));
    const response = await request(app).put(`/api/products/${row.id}`).send(body);
    expect(response.status).toBe(500); expect(response.body).toEqual({ error: { message: 'Error interno del servidor.' } });
    expect(mocks.rollback).toHaveBeenCalledOnce(); expect(mocks.release).toHaveBeenCalledOnce();
  });
});
