/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BUILT_IN_FULL_TEMPLATES,
  PLACEHOLDER_KEYS,
  WINDOWS_MAX_ALLOWABLE_PATH_LENGTH,
  PACKAGE_DIR_PLACEHOLDER,
  MAIN_DEFAULT_PLACEHOLDER,
  WEBAPPLICATIONS_PLACEHOLDER,
  APP_PLACEHOLDER,
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
} from '../../src/utils/webappTemplateUtils';

const copyTemplatesPath = path.join(
  __dirname,
  '../../scripts/copy-templates.js'
);
const { PLACEHOLDERS: copyScriptPlaceholders } = require(copyTemplatesPath);

/** Map of placeholder key → value for sync assertion (single source: webappTemplateUtils). */
const WEBAPP_PLACEHOLDERS: Record<(typeof PLACEHOLDER_KEYS)[number], string> = {
  PACKAGE_DIR_PLACEHOLDER,
  MAIN_DEFAULT_PLACEHOLDER,
  WEBAPPLICATIONS_PLACEHOLDER,
  APP_PLACEHOLDER,
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
const PACKAGE_TEMPLATES_PREFIX =
  'node_modules/@salesforce/templates/lib/templates/project/';

function* walkFiles(dir: string, relativeTo: string): Generator<string> {
  if (!fs.existsSync(dir)) {
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(relativeTo, full);
    if (entry.isDirectory()) {
      yield* walkFiles(full, relativeTo);
    } else {
      yield path.posix.normalize(rel.split(path.sep).join(path.posix.sep));
    }
  }
}

function getTemplateRoot(): string {
  const fromCwd = process.cwd();
  const libProject = path.join(fromCwd, 'lib', 'templates', 'project');
  const srcProject = path.join(fromCwd, 'src', 'templates', 'project');
  if (fs.existsSync(libProject)) {
    return path.join(fromCwd, 'lib', 'templates');
  }
  if (fs.existsSync(srcProject)) {
    return path.join(fromCwd, 'src', 'templates');
  }
  return '';
}

describe('Placeholder sync (copy-templates.js ↔ webappTemplateUtils.ts)', () => {
  it('placeholder constants in copy-templates.js match webappTemplateUtils.ts', () => {
    for (const key of PLACEHOLDER_KEYS) {
      assert.strictEqual(
        copyScriptPlaceholders[key],
        WEBAPP_PLACEHOLDERS[key],
        `Mismatch for ${key}`
      );
    }
  });
});

describe('Windows path length (pack:verify)', () => {
  it('project template paths (reactinternalapp, reactexternalapp) stay within Windows max allowable path length', function () {
    const templatesRoot = getTemplateRoot();
    if (!templatesRoot) {
      this.skip();
      return;
    }

    const projectRoot = path.join(templatesRoot, 'project');
    if (!fs.existsSync(projectRoot)) {
      this.skip();
      return;
    }

    const longPaths: { length: number; path: string }[] = [];

    for (const templateName of BUILT_IN_FULL_TEMPLATES) {
      const templateDir = path.join(projectRoot, templateName);
      if (!fs.existsSync(templateDir)) {
        continue;
      }

      for (const rel of walkFiles(templateDir, templateDir)) {
        const packagePath = PACKAGE_TEMPLATES_PREFIX + templateName + '/' + rel;
        if (packagePath.length >= WINDOWS_MAX_ALLOWABLE_PATH_LENGTH) {
          longPaths.push({ length: packagePath.length, path: packagePath });
        }
      }
    }

    assert.strictEqual(
      longPaths.length,
      0,
      `Paths exceed Windows max allowable length (${WINDOWS_MAX_ALLOWABLE_PATH_LENGTH}). ` +
        'Run "yarn build:copy-templates" so placeholders shorten paths. Long paths:\n' +
        longPaths
          .sort((a, b) => b.length - a.length)
          .map((p) => `  ${p.length} - ${p.path}`)
          .join('\n')
    );
  });
});
