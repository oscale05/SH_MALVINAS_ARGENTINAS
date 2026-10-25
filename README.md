# Sistema Hacienda - Malvinas Argentinas

Backend PHP nativo + Frontend Angular.

## Base de datos
```bash
mysql -e "CREATE DATABASE IF NOT EXISTS hacienda CHARACTER SET utf8mb4;"
mysql hacienda < backend/database/migrations/001_initial.sql
```

## Backend
```bash
cd backend
cp .env.example .env
# ajustar DB_USERNAME/DB_PASSWORD
php -S 127.0.0.1:8099 -t public
```

## Frontend
```bash
cd frontend
npm install --legacy-peer-deps
ng serve
```

## Endpoints principales
- GET /health, /health/full, /version
- POST /auth/login, /auth/change-password
- POST /uploads (administrador)
- GET /uploads, /uploads/rows
- GET /dashboard/macro, /eje, /secretaria, /subsecretaria, /direccion, /concepto, /conceptos, /completo, /summary, /concurrentes, /ampliaciones, /resumen
- GET /export/csv

## Pruebas
```bash
cd backend
php tests/test_xlsx_parser.php
php tests/test_auth.php
php tests/test_health.php
php tests/test_summary.php
php tests/test_macro.php
php tests/test_completo.php
./scripts/run-all-endpoints.sh
cd frontend && ng test --watch=false
```

## Despliegue (producción Apache)
```bash
# Build frontend
./scripts/build-prod.sh
# Habilitar modulos: a2enmod rewrite proxy proxy_http
# Configurar Apache con deploy/apache.conf
# Habilitar servicio systemd con deploy/hacienda.service
```
