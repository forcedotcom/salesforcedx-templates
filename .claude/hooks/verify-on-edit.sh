#!/usr/bin/env bash
# PostToolUse: compile after each Edit/Write.
set -euo pipefail

cat > /dev/null
cd "$CLAUDE_PROJECT_DIR"

if OUTPUT=$(yarn run compile 2>&1); then
  echo "[verify-on-edit] compile passed" >&2
else
  printf '%s' "$OUTPUT" | node -e '
    const output = require("node:fs").readFileSync(0, "utf8").slice(0, 500);
    console.log(JSON.stringify({ decision: "block", reason: `Compile failed after edit. Fix the errors:\n${output}` }));
  '
fi
