#!/usr/bin/env bash
# Deployment-Skript für KAIA auf Hetzner
# Verwendung: ./scripts/deploy.sh [web|api|all]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f ${ROOT}/infra/docker-compose.prod.yml --env-file ${ROOT}/.env"
TARGET="${1:-all}"

echo "==> KAIA Deploy: ${TARGET}"
echo "==> Env: ${ROOT}/.env"
echo "==> Compose: ${ROOT}/infra/docker-compose.prod.yml"

if [[ ! -f "${ROOT}/.env" ]]; then
  echo "ERROR: .env nicht gefunden unter ${ROOT}/.env" >&2
  exit 1
fi

case "${TARGET}" in
  web)
    $COMPOSE up -d --build web
    ;;
  api)
    $COMPOSE up -d --build api
    ;;
  all)
    $COMPOSE up -d --build
    ;;
  *)
    echo "Verwendung: $0 [web|api|all]" >&2
    exit 1
    ;;
esac

echo "==> Fertig"
$COMPOSE ps
