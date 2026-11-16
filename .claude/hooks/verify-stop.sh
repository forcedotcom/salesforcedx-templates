#!/usr/bin/env bash
# Stop: verify edited work with this repo's compile, lint, and test targets.
set -euo pipefail

STOP_HOOK_ACTIVE=$(node -e '
  const input = JSON.parse(require("node:fs").readFileSync(0, "utf8"));
  console.log(input.stop_hook_active === true);
')
if [[ "$STOP_HOOK_ACTIVE" == true ]]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
MARKER="$CLAUDE_PROJECT_DIR/.claude/.edit-marker"
if [[ ! -f "$MARKER" ]]; then
  echo "[verify-stop] no edits, skipping verification" >&2
  exit 0
fi

for step in compile lint test; do
  if OUTPUT=$(yarn run "$step" 2>&1); then
    echo "[verify-stop] $step passed" >&2
  else
    printf '%s' "$OUTPUT" | node -e '
      const output = require("node:fs").readFileSync(0, "utf8").slice(0, 500);
      console.log(JSON.stringify({
        decision: "block",
        reason: `Verification failed: ${process.argv[1]} — ${output}. Fix the errors and try again.`
      }));
    ' "$step"
    exit 0
  fi
done

# Keep the marker on failure so the next stop retries verification.
rm "$MARKER"
