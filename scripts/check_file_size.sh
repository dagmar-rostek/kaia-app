#!/usr/bin/env bash
# Blocks Python files over 500 lines — prevents LLM-generated monoliths.
# Exemptions: simulation/runner.py, prompts/templates.py (handled by pre-commit exclude pattern)
set -e
LIMIT=500
FAILED=0
for f in "$@"; do
    lines=$(wc -l < "$f")
    if [ "$lines" -gt "$LIMIT" ]; then
        echo "ERROR: $f has $lines lines (limit: $LIMIT). Extract a module."
        FAILED=1
    fi
done
exit $FAILED
