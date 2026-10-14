import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const { connection, getPool } = vi.hoisted(() => ({
  connection: { execute: vi.fn(), beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn(), destroy: vi.fn() },
  getPool: vi.fn(),
}));
vi.mock('../src/config/database.js', () => ({ getPool }));
import app from '../src/app.js';

const id = randomUUID();
const row = { id, name: 'Arroz', quantity: 2, purchased: 0 };
beforeEach(() => {
  vi.resetAllMocks();
  getPool.mockReturnValue({ getConnection: vi.fn().mockResolvedValue(connection) });
  connection.execute.mockResolvedValueOnce([[row], []]).mockResolvedValue([{ affectedRows: 1 }, []]);
});

describe('SMARLIST-15 PATCH de estado', () => {
  it.each([[0, true], [1, false], [0, false], [1, true]])('estado %s → %s, 200 idempotente y atributos intactos', async (previous, purchased) => {
    connection.execute.mockReset().mockResolvedValueOnce([[{ ...row, purchased: previous }], []]).mockResolvedValue([{ affectedRows: previous === Number(purchased) ? 0 : 1 }, []]);
    const response = await request(app).patch(`/api/products/${id}/status`).send({ purchased });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...row, purchased });
    expect(connection.execute.mock.calls).toEqual([
      ['SELECT id, name, quantity, purchased FROM products WHERE id = ? FOR UPDATE', [id]],
      ['UPDATE products SET purchased = ? WHERE id = ?', [Number(purchased), id]],
    ]);
    expect(connection.commit).toHaveBeenCalledOnce(); expect(connection.release).toHaveBeenCalledOnce();
  });

  it.each([{}, { purchased: 'true' }, { purchased: 1 }, { purchased: null }, { purchased: false, id }, { purchased: true, name: 'Otro' }, { purchased: true, quantity: 9 }, [], null])('cuerpo inválido %j, 400 sin SQL', async body => {
    const response = await request(app).patch(`/api/products/${id}/status`).send(body);
    expect(response.status).toBe(400); expect(getPool).not.toHaveBeenCalled();
  });

  it.each(['no-es-uuid', ' ', `${id} `, 'z'.repeat(36)])('ID inválido %j, 400 sin SQL', async invalid => {
    const response = await request(app).patch(`/api/products/${encodeURIComponent(invalid)}/status`).send({ purchased: true });
    expect(response.status).toBe(400); expect(getPool).not.toHaveBeenCalled();
  });

  it('inexistente 404, rollback sin UPDATE', async () => {
    connection.execute.mockReset().mockResolvedValue([[], []]);
    const response = await request(app).patch(`/api/products/${id}/status`).send({ purchased: true });
    expect(response.status).toBe(404); expect(response.body.error.message).toBe('Producto no encontrado.');
    expect(connection.execute).toHaveBeenCalledOnce(); expect(connection.rollback).toHaveBeenCalledOnce();
  });

  it.each(['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR'])('%s → 503 seguro', async code => {
    connection.execute.mockReset().mockRejectedValue(Object.assign(new Error('SQL password privado'), { code }));
    const response = await request(app).patch(`/api/products/${id}/status`).send({ purchased: true });
    expect(response.status).toBe(503); expect(response.body).toEqual({ error: 'Servicio temporalmente no disponible' });
    expect(connection.rollback).toHaveBeenCalledOnce();
  });

  it('error inesperado 500 seguro y conexión defectuosa fuera del pool', async () => {
    connection.execute.mockReset().mockRejectedValue(new Error('ruta interna'));
    connection.rollback.mockRejectedValue(new Error('rollback'));
    const response = await request(app).patch(`/api/products/${id}/status`).send({ purchased: false });
    expect(response.status).toBe(500); expect(response.body).toEqual({ error: { message: 'Error interno del servidor.' } });
    expect(connection.destroy).toHaveBeenCalledOnce(); expect(connection.release).not.toHaveBeenCalled();
  });
});
