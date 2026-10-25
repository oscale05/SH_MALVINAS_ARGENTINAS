# Guía de despliegue en producción (Apache + MariaDB)

## Requisitos
- PHP 8.3+ con extensiones: pdo_mysql, zip, simplexml
- MariaDB/MySQL 10.4+
- Apache 2.4+ con mod_rewrite, mod_proxy, mod_proxy_http
- Node.js 22+ (solo para build)

## 1. Base de datos
```bash
mysql -u root -p -e "CREATE DATABASE hacienda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p hacienda < backend/database/migrations/001_initial.sql
mysql -u root -p -e "CREATE USER 'hacienda'@'localhost' IDENTIFIED BY 'PASSWORD_SEGURA'; GRANT ALL ON hacienda.* TO 'hacienda'@'localhost'; FLUSH PRIVILEGES;"
```

## 2. Backend
```bash
cd /var/www/hacienda/backend
cp .env.example .env
# Editar .env: DB_USERNAME, DB_PASSWORD, JWT_SECRET, APP_ENV=production
composer install --no-dev --optimize-autoloader
```

## 3. Frontend
```bash
cd /var/www/hacienda/frontend
npm install --legacy-peer-deps
ng build --configuration production
```

## 4. Apache
```bash
sudo a2enmod rewrite proxy proxy_http
sudo cp deploy/apache.conf /etc/apache2/sites-available/hacienda.conf
sudo a2ensite hacienda
sudo systemctl reload apache2
```

## 5. Servicio backend (systemd)
```bash
sudo cp deploy/hacienda.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now hacienda
```

## 6. Verificación
```bash
curl http://localhost/api/health/full
```

## Notas
- Cambiar `JWT_SECRET` en producción
- Configurar backups de BD y storage/
- El frontend se sirve desde `frontend/dist/frontend/browser/`
