# Ingesta Excel Major

Fuente inicial: hoja `BBDD`.

Columnas esperadas:
Agrupamiento, Imputación, Calculado, Recaud. al 31/8, Recaud. al 30/9, Total, % R/C, ORIGEN, EJE, SECRETARIAS, SUBSECRETARIAS, DIRECCIONES GENERALES, DIRECCION, CONCURRENTES.

Validaciones:
- Hoja BBDD presente.
- Encabezados exactos.
- Código e imputación obligatorios.
- Origen/eje/dependencias válidos o nulos controlados.
- Detección de duplicados por código+fecha.

Proceso:
1. Upload.
2. Parseo.
3. Normalización.
4. Persistencia raw + canónica.
5. Generación de snapshot.
6. Reporte de errores.
