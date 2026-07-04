#!/usr/bin/env bash
# KAIA Pre-Commit Hook
# Läuft automatisch vor jedem git commit.
# Einmalige Installation: bash scripts/setup-hooks.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_ROOT="$(git rev-parse --show-toplevel)"

echo "🔍 Pre-Commit Checks..."

# ── 1. Python: ruff check ────────────────────────────────────────────────────

if git diff --cached --name-only | grep -q "^apps/api/.*\.py$"; then
  echo -n "  → ruff check ... "
  if (cd "$REPO_ROOT/apps/api" && source .venv/bin/activate && ruff check . 2>&1); then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}  Fix: cd apps/api && source .venv/bin/activate && ruff check --fix .${NC}"
    exit 1
  fi

  echo -n "  → ruff format ... "
  if (cd "$REPO_ROOT/apps/api" && source .venv/bin/activate && ruff format --check . 2>&1); then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}  Fix: cd apps/api && source .venv/bin/activate && ruff format .${NC}"
    exit 1
  fi

  echo -n "  → mypy ... "
  if (cd "$REPO_ROOT/apps/api" && source .venv/bin/activate && mypy app/ 2>&1); then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}  Fix: cd apps/api && source .venv/bin/activate && mypy app/${NC}"
    exit 1
  fi
fi

# ── 2. TypeScript: ESLint ────────────────────────────────────────────────────

if git diff --cached --name-only | grep -q "^apps/web/.*\.\(ts\|tsx\)$"; then
  echo -n "  → ESLint ... "
  if (cd "$REPO_ROOT/apps/web" && npm run lint --silent 2>&1); then
    echo -e "${GREEN}✓${NC}"
  else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}  Fix: cd apps/web && npm run lint -- --fix${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Alle Checks bestanden — Commit läuft.${NC}"
