#!/usr/bin/env bash
# Installiert den KAIA Pre-Commit Hook.
# Einmalig ausführen: bash scripts/setup-hooks.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_TARGET="$REPO_ROOT/.git/hooks/pre-commit"
HOOK_SOURCE="$REPO_ROOT/scripts/pre-commit-hook.sh"

chmod +x "$HOOK_SOURCE"
ln -sf "$HOOK_SOURCE" "$HOOK_TARGET"
chmod +x "$HOOK_TARGET"

echo "✅ Pre-Commit Hook installiert."
echo "   Läuft ab jetzt vor jedem: git commit"
echo ""
echo "   Deaktivieren (Notfall): git commit --no-verify"
echo "   Deinstallieren:         rm .git/hooks/pre-commit"
