import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listProducts } = vi.hoisted(() => ({ listProducts: vi.fn() }));
vi.mock('../src/repositories/productRepository.js', () => ({ listProducts, insertProduct: vi.fn() }));
import { getProducts } from '../src/services/productService.js';

beforeEach(() => vi.clearAllMocks());

describe('Servicio de consulta', () => {
  it('conserva atributos, orden y registros con nombres repetidos, sin mutar filas', async () => {
    const rows = Object.freeze([
      Object.freeze({ id: 'A', name: 'Arroz', quantity: 2, purchased: 0 }),
      Object.freeze({ id: 'b', name: 'Arroz', quantity: 5, purchased: 1 }),
    ]);
    listProducts.mockResolvedValue(rows);
    expect(await getProducts()).toEqual([
      { id: 'A', name: 'Arroz', quantity: 2, purchased: false },
      { id: 'b', name: 'Arroz', quantity: 5, purchased: true },
    ]);
    expect(rows[1].purchased).toBe(1);
  });

  it('devuelve colección vacía', async () => {
    listProducts.mockResolvedValue([]);
    expect(await getProducts()).toEqual([]);
  });

  it.each([
    { id: '', name: 'Arroz', quantity: 1, purchased: 0 },
    { id: 'a', name: '  ', quantity: 1, purchased: 0 },
    { id: 'a', name: ' Arroz ', quantity: 1, purchased: 0 },
    { id: 'a', name: 'Arroz', quantity: 0, purchased: 0 },
    { id: 'a', name: 'Arroz', quantity: 1.5, purchased: 0 },
    { id: 'a', name: 'Arroz', quantity: '2', purchased: 0 },
    { id: 'a', name: 'Arroz', quantity: 1, purchased: 2 },
  ])('rechaza filas incompatibles sin convertirlas silenciosamente: %j', async row => {
    listProducts.mockResolvedValue([row]);
    await expect(getProducts()).rejects.toThrow();
  });

  it.each(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_CON_COUNT_ERROR'])('clasifica indisponibilidad %s sin exponer detalles', async code => {
    listProducts.mockRejectedValue(Object.assign(new Error('Detalle SQL privado de prueba'), { code }));
    await expect(getProducts()).rejects.toMatchObject({ status: 503, code: 'PRODUCT_STORAGE_UNAVAILABLE', message: 'Servicio temporalmente no disponible' });
  });

  it('conserva un error inesperado para el mecanismo existente', async () => {
    const error = Object.assign(new Error('Detalle interno'), { code: 'ER_PARSE_ERROR' });
    listProducts.mockRejectedValue(error);
    await expect(getProducts()).rejects.toBe(error);
  });
});
