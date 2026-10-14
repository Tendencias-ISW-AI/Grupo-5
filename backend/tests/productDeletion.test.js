import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const { execute, getPool } = vi.hoisted(() => ({ execute: vi.fn(), getPool: vi.fn() }));
vi.mock('../src/config/database.js', () => ({ getPool }));
import app from '../src/app.js';
import { deleteProduct } from '../src/services/productService.js';
import { deleteProductById } from '../src/repositories/productRepository.js';

const id = randomUUID();
beforeEach(() => {
  vi.resetAllMocks(); getPool.mockReturnValue({ execute });
  execute.mockResolvedValue([{ affectedRows: 1 }, []]);
});

describe('SMARLIST-14 / HU-13 eliminación', () => {
  it.each([false, true])('CP01–04/17:204 sin cuerpo,purchased=%s no cambia selección', async purchased => {
    const response = await request(app).delete(`/api/products/${id}`).send({ id: randomUUID(), purchased, name: 'Ignorado' });
    expect(response.status).toBe(204); expect(response.text).toBe('');
    expect(response.headers['content-type']).toBeUndefined();
    expect(execute).toHaveBeenCalledExactlyOnceWith('DELETE FROM products WHERE id = ?', [id]);
    expect(getPool).toHaveBeenCalledOnce();
  });

  it('CP05:0filas404 con error consistente', async () => {
    execute.mockResolvedValue([{ affectedRows: 0 }, []]);
    const response = await request(app).delete(`/api/products/${id}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { message: 'Producto no encontrado.' } });
  });

  it.each([' ', 'no-es-uuid', `${id} `, ` ${id}`, id.replaceAll('-', ''), 'z'.repeat(36), `${id}0`, "x' OR '1'='1"])(
    'CP06/16:ID inválido%j400 sinSQL', async invalid => {
      const response = await request(app).delete(`/api/products/${encodeURIComponent(invalid)}`);
      expect(response.status).toBe(400); expect(response.body.error.message).toEqual(expect.any(String));
      expect(getPool).not.toHaveBeenCalled(); expect(execute).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, null, 1, '', '\ud800'])('CP06/16:servicio valida ID%j antes deSQL', async invalid => {
    await expect(deleteProduct(invalid)).rejects.toMatchObject({ status: 400 });
    expect(execute).not.toHaveBeenCalled();
  });

  it('UUID mayúscula y versión no específica válidos,se conserva identidad exacta', async () => {
    const uppercase = id.toUpperCase();
    expect((await request(app).delete(`/api/products/${uppercase}`)).status).toBe(204);
    expect(execute).toHaveBeenLastCalledWith('DELETE FROM products WHERE id = ?', [uppercase]);
    const nil = '00000000-0000-0000-0000-000000000000';
    execute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
    expect((await request(app).delete(`/api/products/${nil}`)).status).toBe(404);
  });

  it('CP12:segunda eliminación404', async () => {
    execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]).mockResolvedValueOnce([{ affectedRows: 0 }, []]);
    expect((await request(app).delete(`/api/products/${id}`)).status).toBe(204);
    expect((await request(app).delete(`/api/products/${id}`)).status).toBe(404);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('CP17:repositorio usa un DELETE parametrizado sin consulta previa', async () => {
    const value = "x' OR '1'='1";
    expect(await deleteProductById(value)).toBe(1);
    expect(execute).toHaveBeenCalledExactlyOnceWith('DELETE FROM products WHERE id = ?', [value]);
  });

  it.each(['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'PROTOCOL_CONNECTION_LOST'])('CP13/14:%s503 sin detalles', async code => {
    execute.mockRejectedValue(Object.assign(new Error('SQL password=ficticio ruta/interna'), { code }));
    const response = await request(app).delete(`/api/products/${id}`);
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: 'Servicio temporalmente no disponible' });
    expect((await request(app).get('/health')).status).toBe(200);
  });

  it('CP14:inesperado500 genérico,sin secretos', async () => {
    execute.mockRejectedValue(Object.assign(new Error('SQL privado'), { code: 'ER_PARSE_ERROR' }));
    const response = await request(app).delete(`/api/products/${id}`);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: { message: 'Error interno del servidor.' } });
  });

  it.each([2, undefined])('resultadoinesperado%j no produce éxito falso', async affectedRows => {
    execute.mockResolvedValue([{ affectedRows }, []]);
    expect((await request(app).delete(`/api/products/${id}`)).status).toBe(500);
  });

  it('CP15:rutaDELETE sin parámetro continúa404', async () => {
    expect((await request(app).delete('/api/products')).status).toBe(404);
    expect(execute).not.toHaveBeenCalled();
  });
});
