/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, it } from 'vitest';

const root = path.resolve(__dirname, '..');
const eslint = new ESLint({
  cwd: root,
  overrideConfigFile: path.join(root, 'eslint.config.mjs')
});
const header = `/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */`;

describe('ESLint flat config', () => {
  it('enables type-aware rules for source and tests', async () => {
    for (const filePath of [path.join(root, 'src/index.ts'), path.join(root, 'test/eslintConfig.test.ts')]) {
      const config = await eslint.calculateConfigForFile(filePath);
      assert.equal(config?.rules['@typescript-eslint/no-floating-promises']?.[0], 2, filePath);
      assert.equal(config?.rules['@typescript-eslint/no-unused-vars']?.[0], 2, filePath);
    }
  });

  it('requires a BSD-3 header, preserving existing copyright years', async () => {
    const [missingHeader] = await eslint.lintText('export const value = 1;\n', {
      filePath: 'src/index.ts'
    });
    assert.ok(missingHeader.messages.some((message) => message.ruleId === 'header/header'));

    const [validHeader] = await eslint.lintText(`${header}\nexport const value = 1;\n`, {
      filePath: 'src/index.ts'
    });
    assert.deepEqual(validHeader.messages, []);
  });

  it('allows Vitest property assertions in tests, not in source', async () => {
    const code = `${header}\nconst expect = (value: boolean) => ({ to: { be: { true: value } } });\nexpect(true).to.be.true;\n`;
    const testCode = code;
    const sourceCode = code;
    const [testResult] = await eslint.lintText(testCode, { filePath: path.join(root, 'test/eslintConfig.test.ts') });
    assert.deepEqual(testResult.messages, []);
    const [sourceResult] = await eslint.lintText(sourceCode, { filePath: path.join(root, 'src/index.ts') });
    assert.ok(sourceResult.messages.some((message) => message.ruleId === '@typescript-eslint/no-unused-expressions'));
  });

  it('preserves the Vercel MIT header exemption', async () => {
    const filePath = path.join(root, 'src/service/gitRepoUtils.ts');
    const source = await readFile(filePath, 'utf8');
    assert.ok(source.startsWith('/* eslint header/header: off */'));
    assert.match(source, /Copyright \(c\) 2021 Vercel, Inc\./);
    assert.match(source, /Licensed under the MIT License/);
    const [result] = await eslint.lintText(source, { filePath });
    assert.equal(result.fatalErrorCount, 0);
    assert.ok(!result.messages.some((message) => message.ruleId === 'header/header'));
  });

  it('ignores generated code, template inputs, and fixtures', async () => {
    for (const filePath of [
      'lib/index.js',
      'coverage/index.js',
      'src/templates/lightningcomponent/lwc/typeScript/typeScript.ts',
      'src/templates/project/typescript/project.eslint.config.js',
      'test/fixtures/project-templates/reactinternalapp/sample.ts'
    ]) {
      assert.ok(await eslint.isPathIgnored(path.join(root, filePath)), filePath);
    }
  });
});
