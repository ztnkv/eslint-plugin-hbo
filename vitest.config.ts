import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // __test-support__ holds on-disk fixtures (including files that look like
    // `*.test.ts`) consumed by fs-aware rule tests — they must not be collected.
    exclude: [...configDefaults.exclude, '**/__test-support__/**'],
  },
});
