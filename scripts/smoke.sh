#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../backend"
php -S 127.0.0.1:8099 -t public >/tmp/hacienda-smoke.log 2>&1 &
PID=$!
sleep 1
curl -fsS http://127.0.0.1:8099/health
echo
TOKEN=$(curl -fsS -X POST http://127.0.0.1:8099/auth/login -H 'Content-Type: application/json' -d '{"username":"operador","password":"operador123"}' | php -r "echo json_decode(file_get_contents('php://stdin'),true)['token'];")
curl -fsS -H "Authorization: Bearer $TOKEN" -F "file=@../MAJOR 30092026(OCTUBRE).xlsx" http://127.0.0.1:8099/uploads
echo
curl -fsS http://127.0.0.1:8099/dashboard/resumen
echo
kill $PID
