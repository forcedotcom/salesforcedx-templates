#!/usr/bin/env node
/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Shared safeguard engine: detects `git commit`/`git push` invocations that pass
 * `--no-verify` (directly, or via shell wrappers/dynamic shell expansion), so hooks
 * can block them before they run. Ported from salesforcedx-vscode's
 * scripts/ai-safeguards.mjs, trimmed to the no-verify guard this repo needs.
 */

const NO_VERIFY_REASON =
  'git with --no-verify is blocked. Run without --no-verify so hooks run.';
const DYNAMIC_GIT_REASON =
  'Git commands assembled with shell expansion are blocked because safeguards cannot verify the resulting command. Use literal Git arguments.';
const SHELL_EXECUTORS = new Set(['bash', 'sh', 'zsh']);
const WRAPPERS = new Set(['command', 'env', 'sudo']);
const BLOCKED_OPERATIONS = new Set(['commit', 'push']);
const GIT_VALUE_OPTIONS = new Set([
  '-C',
  '-c',
  '--config-env',
  '--exec-path',
  '--git-dir',
  '--work-tree',
  '--namespace',
]);
const SUDO_VALUE_OPTIONS = new Set([
  '-C',
  '-g',
  '-h',
  '-p',
  '-R',
  '-T',
  '-u',
  '--chdir',
  '--group',
  '--host',
  '--prompt',
  '--user',
]);

const shellSegments = (command) => {
  const parsed = [...command].reduce(
    (state, character, index, characters) => {
      if (state.escaped) {
        return character === '\n'
          ? { ...state, escaped: false }
          : { ...state, escaped: false, word: `${state.word}${character}` };
      }
      if (character === '\\' && state.quote !== "'") {
        const escapedCharacter = characters[index + 1];
        return state.quote === '"' &&
          escapedCharacter &&
          !['$', '`', '"', '\\', '\n'].includes(escapedCharacter)
          ? { ...state, word: `${state.word}${character}` }
          : { ...state, escaped: true };
      }
      if (state.quote) {
        return character === state.quote
          ? { ...state, quote: undefined }
          : {
              ...state,
              word: `${state.word}${character}`,
              dynamic:
                state.dynamic ||
                (state.quote === '"' &&
                  (character === '$' || character === '`')),
            };
      }
      if (character === '"' || character === "'")
        return { ...state, quote: character };
      if (/\s/.test(character)) {
        return state.word
          ? {
              ...state,
              segments: [
                ...state.segments.slice(0, -1),
                [
                  ...state.segments.at(-1),
                  { dynamic: state.dynamic, value: state.word },
                ],
              ],
              word: '',
              dynamic: false,
            }
          : state;
      }
      if (';&|'.includes(character)) {
        const segment = state.word
          ? [
              ...state.segments.at(-1),
              { dynamic: state.dynamic, value: state.word },
            ]
          : state.segments.at(-1);
        return {
          ...state,
          segments: [...state.segments.slice(0, -1), segment, []],
          word: '',
          dynamic: false,
        };
      }
      return {
        ...state,
        word: `${state.word}${character}`,
        dynamic: state.dynamic || character === '$' || character === '`',
      };
    },
    {
      segments: [[]],
      word: '',
      quote: undefined,
      escaped: false,
      dynamic: false,
    }
  );
  const last = parsed.word
    ? [
        ...parsed.segments.at(-1),
        { dynamic: parsed.dynamic, value: parsed.word },
      ]
    : parsed.segments.at(-1);
  return [...parsed.segments.slice(0, -1), last].filter(
    (segment) => segment.length
  );
};

const gitOperation = (words) =>
  words.slice(1).reduce(
    (state, word) => {
      if (state.operation) return state;
      if (state.awaiting) return { ...state, awaiting: false };
      if (GIT_VALUE_OPTIONS.has(word.value))
        return { ...state, awaiting: true };
      if (word.value.startsWith('-')) return state;
      return { ...state, operation: word.value };
    },
    { awaiting: false, operation: undefined }
  ).operation;

const unwrapCommand = (tokens) => {
  const start = tokens.findIndex(
    (token) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(token.value)
  );
  const command = tokens.slice(start < 0 ? tokens.length : start);
  if (!command.length) return { command: [] };
  if (command[0].dynamic) return { reason: DYNAMIC_GIT_REASON };
  if (!WRAPPERS.has(command[0].value)) return { command };
  const wrapped = command.slice(1).reduce(
    (state, token) => {
      if (state.done) return state;
      if (state.reason) return state;
      if (state.awaiting) return { ...state, awaiting: false };
      if (
        state.wrapper === 'env' &&
        /^[A-Za-z_][A-Za-z0-9_]*=/.test(token.value)
      )
        return state;
      if (
        state.wrapper === 'env' &&
        (token.value === '-S' || token.value === '--split-string')
      ) {
        return { ...state, reason: DYNAMIC_GIT_REASON };
      }
      if (state.wrapper === 'sudo' && SUDO_VALUE_OPTIONS.has(token.value))
        return { ...state, awaiting: true };
      if (token.value.startsWith('-')) return state;
      return {
        ...state,
        command: command.slice(command.indexOf(token)),
        done: true,
      };
    },
    {
      awaiting: false,
      command: [],
      done: false,
      reason: undefined,
      wrapper: command[0].value,
    }
  );
  if (wrapped.reason) return { reason: wrapped.reason };
  return wrapped.command.length
    ? unwrapCommand(wrapped.command)
    : { command: [] };
};

const inspectCommand = (command, inspect) =>
  shellSegments(command).reduce(
    (state, tokens) => {
      if (state.reason) return state;
      const unwrapped = unwrapCommand(tokens);
      if (unwrapped.reason) return { ...state, reason: unwrapped.reason };
      const words = unwrapped.command;
      const executable = words[0]?.value;
      if (!executable) return state;
      if (SHELL_EXECUTORS.has(executable)) {
        const commandIndex = words.findIndex((token) =>
          /^-[^-]*c/.test(token.value)
        );
        const nested = words[commandIndex + 1];
        return commandIndex >= 0 && nested
          ? inspectCommand(nested.value, inspect)
          : state;
      }
      if (executable === 'eval') {
        const nested = words
          .slice(1)
          .map((token) => token.value)
          .join(' ');
        return /(?:^|[;&|]\s*)(?:bash|sh|zsh)(?:\s|$)/.test(nested)
          ? { ...state, reason: DYNAMIC_GIT_REASON }
          : inspectCommand(nested, inspect);
      }
      return executable === 'git'
        ? { ...state, reason: inspect(words) }
        : state;
    },
    { reason: undefined }
  );

/**
 * Returns a denial reason if `command` invokes `git commit`/`git push` with
 * `--no-verify` (directly or via shell wrappers/dynamic expansion), otherwise
 * `undefined`.
 */
const noVerifyDenial = (command) =>
  inspectCommand(command, (words) => {
    if (words.some((word) => word.dynamic)) return DYNAMIC_GIT_REASON;
    return BLOCKED_OPERATIONS.has(gitOperation(words)) &&
      words.some((word) => word.value === '--no-verify')
      ? NO_VERIFY_REASON
      : undefined;
  }).reason;

module.exports = { NO_VERIFY_REASON, DYNAMIC_GIT_REASON, noVerifyDenial };
