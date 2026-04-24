#!/usr/bin/env bash
# Stop hook: run compile, lint, test, knip.
# On first failure, block with reason for agent to fix. Wireit cache hits = success.
# stderr → Hooks output channel
set -e

# Read stdin to check stop_hook_active
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active // false')" = "true" ]; then
  echo "[verify-stop] stop_hook_active=true, allowing stop" >&2
  exit 0
fi

ROOT="${CURSOR_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-.}}"
cd "$ROOT"

# Ensure Volta-managed node/npm are on PATH (hook runs in a non-login shell)
export VOLTA_HOME="${VOLTA_HOME:-$HOME/.volta}"
export PATH="$VOLTA_HOME/bin:$PATH"

echo "[verify-stop] starting" >&2

fail() {
  local step="$1"
  local out="$2"
  # Strip control chars (incl. ANSI codes) so JSON stays valid; escape \ " for JSON
  local err
  err=$(printf '%s' "$out" | head -c 500 | tr -d '\000-\037\177' | tr '\n' ' ' | sed 's/\\/\\\\/g; s/"/\\"/g')
  echo "[verify-stop] failed: $step" >&2
  echo "{\"decision\": \"block\", \"reason\": \"Verification failed: $step — $err. Fix the errors and try again.\"}"
  exit 0
}

run_step() {
  local step="$1"
  local cmd="$2"
  local out
  out=$(eval "$cmd" 2>&1) || fail "$step" "$out"
}

# Check if this agent session made any changes.
# mark-edit.sh touches this file via PostToolUse on every Edit/Write.
SESSION_MARKER="$ROOT/.claude/.edit-marker"

if [ ! -f "$SESSION_MARKER" ]; then
  echo "[verify-stop] no edits in this session, skipping verification" >&2
  exit 0
fi

echo "[verify-stop] edits detected in session, running verification" >&2
# Clean up marker for next run
rm -f "$SESSION_MARKER"

run_step "compile" "npm run compile" && echo "[verify-stop] compile ok" >&2
run_step "lint" "npm run lint" && echo "[verify-stop] lint ok" >&2
run_step "test" "npm run test:hook" && echo "[verify-stop] test ok" >&2
run_step "knip" "npm run check:knip" && echo "[verify-stop] knip ok" >&2
echo "[verify-stop] all passed" >&2
