#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
cp -n .env.example .env 2>/dev/null || true
php -S 127.0.0.1:8099 -t public &
BACKEND_PID=$!
cd "$ROOT/frontend"
npm run start &
FRONTEND_PID=$!
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
