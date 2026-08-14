#!/usr/bin/env bash
# Claude adapter for the repository-owned safeguard engine.
ROOT="${CLAUDE_PROJECT_DIR:-${CURSOR_PROJECT_DIR:-$(git rev-parse --show-toplevel)}}"
exec node "$ROOT/scripts/block-no-verify-cli.js"
