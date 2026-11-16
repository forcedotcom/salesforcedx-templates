#!/usr/bin/env bash
# PostToolUse: record edits for the stop hook.
set -euo pipefail

cat > /dev/null
touch "$CLAUDE_PROJECT_DIR/.claude/.edit-marker"
