import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      exclude: ['**/tests/e2e/**', '**/node_modules/**', '**/dist/**'],
    },
    extends: './packages/shared-lib/vitest.config.ts',
  },
  {
    test: {
      exclude: ['**/tests/e2e/**', '**/node_modules/**', '**/dist/**'],
    },
    extends: './packages/ui-components/vitest.config.ts',
  },
  {
    test: {
      exclude: ['**/tests/e2e/**', '**/node_modules/**', '**/dist/**'],
    },
    extends: './apps/panda/vitest.config.ts',
  },
]);
