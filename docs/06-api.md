# API

Auth:
- POST /auth/login
- POST /auth/logout
- POST /auth/change-password

Administrador:
- POST /uploads
- GET /uploads
- GET /uploads/rows?upload_id=
- GET /users
- GET /dashboard/conceptos

Dashboard:
- GET /dashboard/macro?upload_id=
- GET /dashboard/eje?upload_id=
- GET /dashboard/secretaria?eje_id=
- GET /dashboard/subsecretaria?secretaria_id=
- GET /dashboard/direccion?subsecretaria_id=
- GET /dashboard/concepto?codigo=
- GET /dashboard/completo
- GET /dashboard/summary
- GET /dashboard/concurrentes
- GET /dashboard/ampliaciones
- GET /dashboard/resumen

Health:
- GET /health
- GET /health/db
- GET /health/full

Export:
- GET /export/csv?upload_id=

Version:
- GET /version

Filtros comunes:
- upload_id, eje_id, secretaria_id, subsecretaria_id, codigo

Errores:
- 400 validación
- 401 no autenticado
- 403 sin permiso
- 404 no encontrado
- 422 datos inválidos
