# Arquitectura

Stack:
- Backend: PHP 8.3/8.4 nativo.
- Frontend: Angular latest.
- Base de datos: MySQL/PostgreSQL.
- App móvil futura: Flutter (evaluar después de web responsive).

Backend:
- Front controller + router ligero.
- Capas: controllers, services, repositories.
- PDO con prepared statements.
- Auth por tokens y middleware de roles.
- Parser adapter para Excel Major.

Frontend:
- Standalone components, signals, nuevo control flow.
- Servicios HTTP y guards por rol.
- Responsive mobile-first.
