import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/*.mysql.test.js'],
    fileParallelism: false,
    env: { RUN_MYSQL_TESTS: '1' },
    testTimeout: 60000,
    hookTimeout: 30000,
  },
});
