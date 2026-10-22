/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const buildTemplatesScript = path.resolve(
  __dirname,
  '../../scripts/build-templates.js'
);

describe('build-templates', () => {
  let root: string;
  let source: string;
  let destination: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-templates-'));
    source = path.join(root, 'src', 'templates');
    destination = path.join(root, 'lib', 'templates');
    fs.mkdirSync(path.join(source, 'project'), { recursive: true });
    fs.writeFileSync(
      path.join(source, 'project', 'config.json'),
      '{"name":"template"}'
    );
    fs.writeFileSync(path.join(source, '.hidden'), 'hidden template');
    fs.writeFileSync(
      path.join(source, 'image.bin'),
      Buffer.from([0, 128, 255])
    );
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  const build = (): void => {
    execFileSync(process.execPath, [buildTemplatesScript], { cwd: root });
  };

  const assertTemplatesCopied = (): void => {
    assert.deepStrictEqual(
      fs.readdirSync(destination, { recursive: true }).sort(),
      fs.readdirSync(source, { recursive: true }).sort()
    );
    for (const file of ['project/config.json', '.hidden', 'image.bin']) {
      assert.deepStrictEqual(
        fs.readFileSync(path.join(destination, file)),
        fs.readFileSync(path.join(source, file))
      );
    }
  };

  it('copies templates when lib does not exist', () => {
    build();
    assertTemplatesCopied();
  });

  it('copies into an existing template directory without nesting templates', () => {
    fs.mkdirSync(path.join(destination, 'project'), { recursive: true });
    fs.copyFileSync(
      path.join(source, 'project', 'config.json'),
      path.join(destination, 'project', 'config.json')
    );

    build();
    assertTemplatesCopied();
  });

  it('can run twice without nesting templates', () => {
    build();
    build();
    assertTemplatesCopied();
  });
});
