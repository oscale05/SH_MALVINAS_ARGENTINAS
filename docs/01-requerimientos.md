# Requerimientos

Funcionales:
- Carga de Excel Major desde interfaz web.
- Validación de hojas/columnas y detección de duplicados por fecha/ejercicio.
- Procesamiento acumulativo de cargas.
- Dashboard con KPIs y cascada macro→micro.
- Filtros por fecha, ejercicio, origen, eje y dependencia.
- Roles operador/observador.

No funcionales:
- Mobile-first, responsive.
- Seguridad por roles.
- Auditoría de cargas.
- Extensible a nuevas fuentes.
- Tests y CI.

Criterios de aceptación:
- Una carga válida genera snapshot consultable.
- Drill-down hasta concepto individual.
- Observador no puede cargar datos.
