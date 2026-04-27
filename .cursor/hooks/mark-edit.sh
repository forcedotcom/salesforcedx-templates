#!/usr/bin/env bash
# afterFileEdit hook: mark that an edit occurred in this session.

ROOT=$(git rev-parse --show-toplevel)
mkdir -p "$ROOT/.claude"
touch "$ROOT/.claude/.edit-marker"
echo "[afterFileEdit] marked session as dirty" >&2
exit 0
