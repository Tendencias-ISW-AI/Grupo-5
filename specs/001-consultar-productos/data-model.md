# Data Model — HU-09

## Product / smartlist_db.products

| Campo | SQL | JSON | Restricción |
|---|---|---|---|
| id | VARCHAR(36) | string | Clave primaria, obligatorio, no vacío; no se genera durante consulta |
| name | VARCHAR(150) | string | Obligatorio, no vacío ni únicamente espacios; nombres repetidos permitidos |
| quantity | INT | number | Obligatorio, entero positivo |
| purchased | BOOLEAN (TINYINT(1)) | boolean | Obligatorio, FALSE predeterminado; únicamente 0 o 1 |

Sin relaciones, propietarios, timestamps o atributos adicionales. La consulta conserva los datos y rechaza filas incompatibles con error interno genérico antes de devolver un modelo inválido.

## Consulta y persistencia

Colección completa por id ascendente con comparación binaria. Número de filas independiente de quantity. Sin filtros, paginación ni transiciones en HU-09. Persistencia MySQL tras reiniciar proceso; sin cambios en React/localStorage.

## Inicialización

MySQL >= 8.0.16, utf8mb4, CHECK enforced para quantity > 0, purchased IN (0,1), id y nombre no vacíos. Crear solo smartlist_db/products faltantes. Comprobar tipos, obligatoriedad, PK, default y restricciones de tablas existentes; detener sin reparación destructiva ante incompatibilidad.
