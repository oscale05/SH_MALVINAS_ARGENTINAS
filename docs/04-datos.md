# Datos

Entidades principales:
- ingresos
- origenes
- ejes
- secretarias
- subsecretarias
- direcciones_generales
- direcciones
- concurrentes
- uploads
- snapshots
- ampliaciones
- users

Campos clave ingreso:
- codigo, imputacion, presupuesto, recaudado_fecha_1, recaudado_fecha_2, total, porcentaje_rc
- origen_id, eje_id, secretaria_id, subsecretaria_id, direccion_general_id, direccion_id, concurrente_id
- upload_id, mes, anio

Reglas:
- Snapshot por fecha de carga.
- Histórico acumulativo.
- Auditoría de usuario y fecha.
- FONDOS AFECTADOS se registra cuando ORIGEN es null/vacío.
- Ampliaciones de presupuesto/partidas se registran en tabla ampliaciones.
