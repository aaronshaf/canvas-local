import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './packages/shared-lib/vitest.config.ts',
  './packages/ui-components/vitest.config.ts',
  './apps/canvas-local/vitest.config.ts',
]);
