# API

Auth:
- POST /auth/login
- POST /auth/logout

Operador:
- POST /uploads
- GET /uploads
- GET /uploads/{id}/errors

Observador:
- GET /dashboard/macro
- GET /dashboard/origen/{id}
- GET /dashboard/eje/{id}
- GET /dashboard/secretaria/{id}
- GET /dashboard/subsecretaria/{id}
- GET /dashboard/direccion/{id}
- GET /dashboard/concepto/{codigo}

Filtros comunes:
- fecha, ejercicio, origen, eje, secretaria, subsecretaria, direccion.

Errores:
- 400 validación
- 401 no autenticado
- 403 sin permiso
- 404 no encontrado
- 422 datos inválidos
