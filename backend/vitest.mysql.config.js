import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/products.mysql.test.js'],
    env: { RUN_MYSQL_TESTS: '1' },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
