/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    allowOnly: false,
    restoreMocks: true,
    testTimeout: 600000,
    hookTimeout: 600000,
    chaiConfig: { truncateThreshold: 100000 },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/templates/**', 'src/i18n/localization.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 75,
        statements: 75,
        functions: 75,
        branches: 75
      }
    }
  }
});
