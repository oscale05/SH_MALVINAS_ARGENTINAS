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
- GET /health
- GET /health/db
- POST /auth/login
- POST /uploads (operador)
- GET /uploads
- GET /dashboard/macro
- GET /dashboard/eje
- GET /dashboard/secretaria
- GET /dashboard/resumen

## Pruebas
```bash
cd backend
php tests/test_xlsx_parser.php
./scripts/run-all-endpoints.sh  # requiere servidor activo
php tests/test_integration.php  # requiere servidor activo (scripts/run-integration.sh)
```

## Despliegue (producción)
```bash
# Build frontend
./scripts/build-prod.sh

# Copiar archivos al servidor
# Habilitar modulos: a2enmod rewrite proxy proxy_http
# Configurar Apache con deploy/apache.conf
# Habilitar servicio systemd con deploy/hacienda.service
# Ajustar .env (DB, JWT_SECRET)
```
