#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../backend"
php -S 127.0.0.1:8099 -t public >/tmp/all-endpoints.log 2>&1 &
PID=$!
sleep 1
php tests/test_all_endpoints.php
RESULT=$?
kill $PID 2>/dev/null
exit $RESULT
