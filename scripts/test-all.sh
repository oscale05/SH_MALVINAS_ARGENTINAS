#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
php -S 127.0.0.1:8099 -t public >/tmp/test-all.log 2>&1 &
PID=$!
sleep 1
echo "=== Backend unit tests ==="
php tests/test_xlsx_parser.php
php tests/test_auth.php
php tests/test_health.php
php tests/test_summary.php
php tests/test_macro.php
php tests/test_completo.php
echo "=== Integration tests ==="
php tests/test_all_endpoints.php
echo "=== Frontend tests ==="
cd "$ROOT/frontend"
ng test --watch=false
RESULT=$?
kill $PID 2>/dev/null
exit $RESULT
