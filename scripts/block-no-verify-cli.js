#!/usr/bin/env node
/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Claude Code PreToolUse adapter for the no-verify safeguard. Reads the hook's
 * JSON payload on stdin and, if the Bash command it's about to run trips the
 * no-verify guard, prints a deny decision that Claude Code enforces.
 */

const { noVerifyDenial } = require('./ai-safeguards.js');

const readStdin = () =>
  new Promise((resolveStdin) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolveStdin(data));
  });

const main = async () => {
  const raw = await readStdin();
  const input = JSON.parse(raw || '{}');
  const command = input.tool_input?.command ?? input.command ?? '';
  const reason = noVerifyDenial(command);
  if (reason) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: reason,
        },
      })
    );
  }
};

main();
