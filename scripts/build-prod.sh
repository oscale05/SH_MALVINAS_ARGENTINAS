#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"
npm install --legacy-peer-deps
ng build --configuration production
cd "$ROOT/backend"
echo "Frontend built in $ROOT/frontend/dist/frontend"
echo "Backend ready. Configure nginx and systemd service."
