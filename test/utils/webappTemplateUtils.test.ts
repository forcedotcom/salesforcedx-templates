/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as assert from 'node:assert';
import {
  PLACEHOLDER_KEYS,
  toAlphanumericForPath,
  WINDOWS_MAX_ALLOWABLE_PATH_LENGTH,
} from '../../src/utils/webappTemplateUtils';

describe('webappTemplateUtils', () => {
  describe('toAlphanumericForPath', () => {
    it('strips non-alphanumeric characters', () => {
      assert.strictEqual(toAlphanumericForPath('My App'), 'MyApp');
      assert.strictEqual(toAlphanumericForPath('my-app_1'), 'myapp1');
      assert.strictEqual(toAlphanumericForPath('a1b2'), 'a1b2');
    });

    it('returns empty string when only non-alphanumeric', () => {
      assert.strictEqual(toAlphanumericForPath('---'), '');
    });
  });

  describe('placeholder constants', () => {
    it('WINDOWS_MAX_ALLOWABLE_PATH_LENGTH is positive', () => {
      assert.ok(
        Number.isInteger(WINDOWS_MAX_ALLOWABLE_PATH_LENGTH),
        'should be integer'
      );
      assert.ok(WINDOWS_MAX_ALLOWABLE_PATH_LENGTH > 0, 'should be positive');
    });

    it('PLACEHOLDER_KEYS lists all placeholder constant names', () => {
      assert.strictEqual(PLACEHOLDER_KEYS.length, 9);
      assert.ok(PLACEHOLDER_KEYS.includes('PACKAGE_DIR_PLACEHOLDER'));
      assert.ok(PLACEHOLDER_KEYS.includes('A4D_SKILL_AGENTFORCE_PLACEHOLDER'));
    });
  });
});
