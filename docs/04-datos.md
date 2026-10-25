# Datos

Entidades principales:
- ingresos
- origenes
- ejes
- secretarias
- subsecretarias
- direcciones_generales
- direcciones
- uploads
- snapshots

Campos clave ingreso:
- codigo, imputacion, presupuesto, recaudado_fecha1, recaudado_fecha2, total, porcentaje_rc, origen_id, eje_id, secretaria_id, subsecretaria_id, direccion_general_id, direccion_id, upload_id

Reglas:
- Snapshot por fecha de carga.
- Histórico acumulativo.
- Auditoría de usuario y fecha.
