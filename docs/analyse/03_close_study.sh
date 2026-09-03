#!/usr/bin/env bash
# Pilotstudie schließen — auf dem Server als root ausführen
# Voraussetzung: cd /root/kaia-app && git pull

set -euo pipefail

echo "=== Schritt 1: Env-Variablen setzen ==="

# STUDY_MODE für das Backend (blockiert Login + Registrierung)
if grep -q "^STUDY_MODE=" infra/.env; then
  sed -i 's/^STUDY_MODE=.*/STUDY_MODE=locked/' infra/.env
else
  echo "STUDY_MODE=locked" >> infra/.env
fi

# STUDY_CLOSED für das Frontend (blockiert Chat-Zugang per Redirect)
if grep -q "^STUDY_CLOSED=" infra/.env; then
  sed -i 's/^STUDY_CLOSED=.*/STUDY_CLOSED=true/' infra/.env
else
  echo "STUDY_CLOSED=true" >> infra/.env
fi

echo "  ✓ STUDY_MODE=locked und STUDY_CLOSED=true gesetzt"

echo ""
echo "=== Schritt 2: Alle Teilnehmenden suspendieren ==="

docker compose -f infra/docker-compose.prod.yml exec -T db psql -U kaia -d kaia <<SQL
UPDATE users
   SET status = 'suspended'
 WHERE study_participant = true
   AND status = 'active';
SELECT username, email, study_participant, status FROM users ORDER BY study_participant DESC, username;
SQL

echo "  ✓ Teilnehmende suspendiert"

echo ""
echo "=== Schritt 3: Alle aktiven Refresh-Tokens widerrufen ==="

docker compose -f infra/docker-compose.prod.yml exec -T db psql -U kaia -d kaia <<SQL
UPDATE refresh_tokens
   SET revoked = true
 WHERE revoked = false;
SQL

echo "  ✓ Refresh-Tokens widerrufen (bestehende Sessions laufen aus)"

echo ""
echo "=== Schritt 4: Neu deployen ==="

docker compose -f infra/docker-compose.prod.yml up -d --build

echo ""
echo "=== Fertig ==="
echo "  Pilotstudie offiziell geschlossen."
echo "  Chat ist für alle deaktiviert."
echo "  Teilnehmende werden auf /pilotstudie-abschluss weitergeleitet."
