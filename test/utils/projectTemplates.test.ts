/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as assert from 'node:assert';
import { PROJECT_TEMPLATES } from '../../src';
import { BUILT_IN_FULL_TEMPLATES } from '../../src/utils/uiBundleTemplateUtils';

describe('PROJECT_TEMPLATES', () => {
  it('is exported from the package entry point without duplicates', () => {
    assert.strictEqual(new Set(PROJECT_TEMPLATES).size, PROJECT_TEMPLATES.length);
  });

  it('includes every built-in full template', () => {
    const projectTemplates: readonly string[] = PROJECT_TEMPLATES;
    for (const template of BUILT_IN_FULL_TEMPLATES) {
      assert.ok(projectTemplates.includes(template), `${template} missing from PROJECT_TEMPLATES`);
    }
  });
});
