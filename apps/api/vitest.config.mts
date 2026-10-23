import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only the TypeScript sources: the compiled copies in dist/ are CommonJS
    // and fail to load under Vitest, reporting false failures
    include: ['src/**/*.test.ts'],
  },
});
