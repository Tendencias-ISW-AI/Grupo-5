import { beforeEach, describe, expect, it, vi } from 'vitest';

const { execute, getPool } = vi.hoisted(() => ({ execute: vi.fn(), getPool: vi.fn() }));
vi.mock('../src/config/database.js', () => ({ getPool }));
import { listProducts } from '../src/repositories/productRepository.js';

beforeEach(() => { vi.clearAllMocks(); getPool.mockReturnValue({ execute }); });

describe('Repositorio de productos', () => {
  it('consulta las cinco columnas y ordena por secuencia de registro ascendente', async () => {
    const rows = [{ id: 'a', name: 'Arroz', quantity: 2, purchased: 0, category: 'Otros' }];
    execute.mockResolvedValue([rows, []]);
    expect(await listProducts()).toBe(rows);
    expect(execute).toHaveBeenCalledExactlyOnceWith('SELECT id, name, quantity, purchased, category FROM products ORDER BY creation_order ASC');
    expect(getPool).toHaveBeenCalledOnce();
  });

  it('propaga errores sin devolver una colección vacía falsa', async () => {
    const error = Object.assign(new Error('Fallo privado de prueba'), { code: 'ECONNREFUSED' });
    execute.mockRejectedValue(error);
    await expect(listProducts()).rejects.toBe(error);
  });
});
