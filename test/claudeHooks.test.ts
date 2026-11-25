/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'vitest';

const repoRoot = path.resolve(__dirname, '..');
const settings = JSON.parse(readFileSync(path.join(repoRoot, '.claude/settings.json'), 'utf8')) as {
  hooks: Record<string, { matcher?: string; hooks: { command: string; timeout?: number }[] }[]>;
};
const postToolHooks = settings.hooks.PostToolUse[0];
const markEdit = postToolHooks.hooks[0].command;
const verifyEdit = postToolHooks.hooks[1].command;
const verifyStop = settings.hooks.Stop[0].hooks[0].command;
const failureOutput = 'Failure: "quoted" \\ path\nsecond line\t雪\n';

describe('Claude verification hooks', () => {
  let root: string;
  let marker: string;
  let log: string;

  beforeEach(() => {
    // Expand Windows 8.3 temp paths to match the child process's cwd.
    root = realpathSync.native(mkdtempSync(path.join(tmpdir(), 'templates hooks ')));
    marker = path.join(root, '.claude/.edit-marker');
    log = path.join(root, 'yarn-calls.jsonl');
    mkdirSync(path.join(root, 'nested'));
    mkdirSync(path.join(root, 'bin'));
    cpSync(path.join(repoRoot, '.claude/hooks'), path.join(root, '.claude/hooks'), { recursive: true });
    writeFileSync(
      path.join(root, 'bin/yarn'),
      `#!/usr/bin/env node
const { appendFileSync } = require('node:fs');
appendFileSync(process.env.HOOK_TEST_LOG, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n');
if (process.argv[3] === process.env.HOOK_TEST_FAIL_STEP) {
  console.error(${JSON.stringify(failureOutput)}.repeat(100));
  process.exit(1);
}
`,
      { mode: 0o755 }
    );
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const runHook = (command: string, input = {}, failStep = '') => {
    const result = spawnSync('sh', ['-c', command], {
      cwd: path.join(root, 'nested'),
      input: JSON.stringify(input),
      encoding: 'utf8',
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: root,
        PATH: `${path.join(root, 'bin')}${path.delimiter}${process.env.PATH}`,
        HOOK_TEST_LOG: log,
        HOOK_TEST_FAIL_STEP: failStep
      }
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    return result;
  };

  const yarnCalls = () =>
    existsSync(log)
      ? readFileSync(log, 'utf8')
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line) as { args: string[]; cwd: string })
      : [];

  it('registers Edit/Write and Stop hooks alongside the existing Bash safeguard', () => {
    assert.equal(settings.hooks.PreToolUse[0].matcher, 'Bash');
    assert.match(settings.hooks.PreToolUse[0].hooks[0].command, /block-no-verify\.sh$/);
    assert.equal(postToolHooks.matcher, 'Edit|Write');
    assert.match(markEdit, /mark-edit\.sh$/);
    assert.match(verifyEdit, /verify-on-edit\.sh$/);
    assert.match(verifyStop, /verify-stop\.sh$/);
    assert.ok((settings.hooks.Stop[0].hooks[0].timeout ?? 0) > 600);
  });

  it('marks edits in the project root even when invoked from a nested directory with spaces', () => {
    runHook(markEdit, { tool_name: 'Write', tool_input: { file_path: path.join(root, 'src/example.ts') } });
    assert.ok(existsSync(marker));
    assert.deepEqual(yarnCalls(), []);
  });

  it('skips verification when there is no edit marker', () => {
    assert.equal(runHook(verifyStop, { stop_hook_active: false }).stdout, '');
    assert.deepEqual(yarnCalls(), []);
  });

  it('allows recursive stops without consuming pending edits', () => {
    runHook(markEdit);
    assert.equal(runHook(verifyStop, { stop_hook_active: true }).stdout, '');
    assert.ok(existsSync(marker));
    assert.deepEqual(yarnCalls(), []);
  });

  it('runs only compile, lint, test in order and clears the marker after success', () => {
    runHook(markEdit);
    assert.equal(runHook(verifyStop).stdout, '');
    assert.deepEqual(
      yarnCalls(),
      ['compile', 'lint', 'test'].map((step) => ({ args: ['run', step], cwd: root }))
    );
    assert.equal(existsSync(marker), false);
    runHook(verifyStop);
    assert.equal(yarnCalls().length, 3);
  });

  for (const [index, step] of ['compile', 'lint', 'test'].entries()) {
    it(`blocks on ${step} failure, retains the marker, and retries on the next stop`, () => {
      runHook(markEdit);
      const result = runHook(verifyStop, {}, step);
      const decision = JSON.parse(result.stdout) as { decision: string; reason: string };
      assert.equal(decision.decision, 'block');
      assert.ok(decision.reason.startsWith(`Verification failed: ${step}`));
      assert.ok(decision.reason.includes(failureOutput));
      assert.ok(decision.reason.length < 700);
      assert.ok(existsSync(marker));
      assert.deepEqual(
        yarnCalls().map((call) => call.args),
        ['compile', 'lint', 'test'].slice(0, index + 1).map((target) => ['run', target])
      );
      runHook(verifyStop);
      assert.equal(existsSync(marker), false);
      assert.deepEqual(
        yarnCalls()
          .slice(index + 1)
          .map((call) => call.args),
        ['compile', 'lint', 'test'].map((target) => ['run', target])
      );
    });
  }

  it('compiles on edit without clearing the stop marker or running other checks', () => {
    runHook(markEdit);
    assert.equal(runHook(verifyEdit).stdout, '');
    assert.deepEqual(yarnCalls(), [{ args: ['run', 'compile'], cwd: root }]);
    assert.ok(existsSync(marker));
  });

  it('reports compile errors using PostToolUse decision JSON', () => {
    runHook(markEdit);
    const decision = JSON.parse(runHook(verifyEdit, {}, 'compile').stdout) as { decision: string; reason: string };
    assert.equal(decision.decision, 'block');
    assert.ok(decision.reason.startsWith('Compile failed after edit'));
    assert.ok(decision.reason.includes(failureOutput));
    assert.ok(decision.reason.length < 600);
    assert.ok(existsSync(marker));
  });

  it('ignores the edit marker in Git', () => {
    const result = spawnSync('git', ['check-ignore', '--no-index', '.claude/.edit-marker'], {
      cwd: repoRoot,
      encoding: 'utf8'
    });
    assert.equal(result.status, 0, result.stderr);
  });
});
