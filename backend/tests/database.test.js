import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createPool: vi.fn(),
  getConnection: vi.fn(),
  ping: vi.fn(),
  release: vi.fn(),
  end: vi.fn(),
}));
vi.mock('mysql2/promise', () => ({ default: { createPool: mocks.createPool } }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('DB_USER', 'test-user');
  vi.stubEnv('DB_NAME', 'test-db');
  mocks.createPool.mockReturnValue({ getConnection: mocks.getConnection, end: mocks.end });
  mocks.getConnection.mockResolvedValue({ ping: mocks.ping, release: mocks.release });
  mocks.ping.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe('Pool MySQL sin conexión real', () => {
  it('importar la configuración no crea un pool ni conecta', async () => {
    await import('../src/config/database.js');
    expect(mocks.createPool).not.toHaveBeenCalled();
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it('la comprobación explícita utiliza ping y libera la conexión', async () => {
    const database = await import('../src/config/database.js');
    expect(await database.checkDatabaseConnection()).toBe(true);
    expect(mocks.ping).toHaveBeenCalledOnce();
    expect(mocks.release).toHaveBeenCalledOnce();
    await database.closePool();
    expect(mocks.end).toHaveBeenCalledOnce();
  });

  it('libera la conexión incluso si falla ping', async () => {
    mocks.ping.mockRejectedValue(new Error('Conexión no disponible'));
    const database = await import('../src/config/database.js');
    await expect(database.checkDatabaseConnection()).rejects.toThrow('Conexión no disponible');
    expect(mocks.release).toHaveBeenCalledOnce();
  });
});
