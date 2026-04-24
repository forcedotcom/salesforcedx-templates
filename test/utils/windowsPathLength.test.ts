/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'vitest';
import {
  PLACEHOLDER_KEYS,
  WINDOWS_MAX_ALLOWABLE_PATH_LENGTH,
  PACKAGE_DIR_PLACEHOLDER,
  MAIN_DEFAULT_PLACEHOLDER,
  UI_BUNDLES_PLACEHOLDER,
  APP_PLACEHOLDER,
  DIGITAL_EXPERIENCE_CONFIGS_PLACEHOLDER,
  DIGITAL_EXPERIENCES_PLACEHOLDER,
  SITE_PLACEHOLDER,
  APP_SUFFIX_PLACEHOLDER,
  A4DRULES_PLACEHOLDER,
  A4D_SKILL_AGENTFORCE_PLACEHOLDER,
  FEATURES_PLACEHOLDER,
  OBJECT_SEARCH_PLACEHOLDER,
  EXAMPLES_PLACEHOLDER,
  GLOBAL_SEARCH_PLACEHOLDER,
  COMPONENTS_PLACEHOLDER,
  DETAIL_PLACEHOLDER,
  FORMATTED_PLACEHOLDER,
} from '../../src/utils/uiBundleTemplateUtils';

const copyTemplatesPath = path.join(
  __dirname,
  '../../scripts/copy-templates.js',
);
const { PLACEHOLDERS: copyScriptPlaceholders } = require(copyTemplatesPath);

/** Map of placeholder key → value for sync assertion (single source: uiBundleTemplateUtils). */
const UI_BUNDLE_PLACEHOLDERS: Record<
  (typeof PLACEHOLDER_KEYS)[number],
  string
> = {
  PACKAGE_DIR_PLACEHOLDER,
  MAIN_DEFAULT_PLACEHOLDER,
  UI_BUNDLES_PLACEHOLDER,
  APP_PLACEHOLDER,
  DIGITAL_EXPERIENCE_CONFIGS_PLACEHOLDER,
  DIGITAL_EXPERIENCES_PLACEHOLDER,
  SITE_PLACEHOLDER,
  APP_SUFFIX_PLACEHOLDER,
  A4DRULES_PLACEHOLDER,
  A4D_SKILL_AGENTFORCE_PLACEHOLDER,
  FEATURES_PLACEHOLDER,
  OBJECT_SEARCH_PLACEHOLDER,
  EXAMPLES_PLACEHOLDER,
  GLOBAL_SEARCH_PLACEHOLDER,
  COMPONENTS_PLACEHOLDER,
  DETAIL_PLACEHOLDER,
  FORMATTED_PLACEHOLDER,
};

/**
 * Path prefix for template paths as seen by pack:verify in the CLI (tmp/sf).
 * pack:verify measures paths under node_modules, e.g. node_modules/@salesforce/templates/lib/...
 */
const PACKAGE_TEMPLATES_LIB_PREFIX =
  'node_modules/@salesforce/templates/lib/templates/';

const getTemplateRoot = (): string => {
  const fromCwd = process.cwd();
  const libTemplates = path.join(fromCwd, 'lib', 'templates');
  const srcTemplates = path.join(fromCwd, 'src', 'templates');
  return fs.existsSync(libTemplates)
    ? libTemplates
    : fs.existsSync(srcTemplates)
      ? srcTemplates
      : '';
};

describe('Placeholder sync (copy-templates.js ↔ uiBundleTemplateUtils.ts)', () => {
  it('placeholder constants in copy-templates.js match uiBundleTemplateUtils.ts', () => {
    for (const key of PLACEHOLDER_KEYS) {
      assert.strictEqual(
        copyScriptPlaceholders[key],
        UI_BUNDLE_PLACEHOLDERS[key],
        `Mismatch for ${key}`,
      );
    }
  });
});

describe('Windows path length (pack:verify)', () => {
  it('all template files stay within Windows max allowable path length', (ctx) => {
    const templatesRoot = getTemplateRoot();
    if (!templatesRoot) {
      ctx.skip();
      return;
    }

    const rels = (
      fs.readdirSync(templatesRoot, {
        recursive: true,
        withFileTypes: true,
      }) as fs.Dirent[]
    )
      .filter((d) => d.isFile())
      .map((d) =>
        path
          .relative(templatesRoot, path.join(d.parentPath, d.name))
          .split(path.sep)
          .join('/'),
      );

    const longPaths = rels
      .map((rel) => ({ rel, packagePath: PACKAGE_TEMPLATES_LIB_PREFIX + rel }))
      .filter(
        ({ packagePath }) =>
          packagePath.length >= WINDOWS_MAX_ALLOWABLE_PATH_LENGTH,
      )
      .map(({ packagePath }) => ({
        length: packagePath.length,
        path: packagePath,
      }));

    assert.strictEqual(
      longPaths.length,
      0,
      `Paths exceed Windows max allowable length (${WINDOWS_MAX_ALLOWABLE_PATH_LENGTH}). ` +
        'Run "yarn build:copy-templates" so placeholders shorten paths. Long paths:\n' +
        longPaths
          .sort((a, b) => b.length - a.length)
          .map((p) => `  ${p.length} - ${p.path}`)
          .join('\n'),
    );
  });
});
