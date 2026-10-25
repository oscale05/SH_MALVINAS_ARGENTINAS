# Deploy

Entornos:
- local
- staging
- production

Requisitos:
- PHP 8.3/8.4
- Composer
- Node/Angular CLI
- MariaDB/MySQL
- Apache 2.4+

Procesos:
- Migraciones versionadas.
- Backups de BD y uploads.
- Variables de entorno (.env).
- Logs de aplicación.

Apache:
- mod_rewrite, mod_proxy, mod_proxy_http
- DocumentRoot: frontend/dist/frontend/browser
- Proxy /api/ → PHP backend

CI/CD:
- GitHub Actions
- Tests automáticos.
- Build Angular.
- Deploy por rama.
