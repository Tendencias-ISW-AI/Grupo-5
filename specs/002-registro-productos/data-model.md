# Data Model — SMARLIST-12 / HU-11

Tabla existente products, sin modificaciones.

| Campo | Entrada | Salida/almacenamiento | Restricción |
|---|---|---|---|
| id | Prohibida | UUID string / VARCHAR(36) PK | Generado por servidor, único |
| name | string | string / VARCHAR(150) | trim, no vacío, UTF-8 válido, máximo150 caracteres Unicode |
| quantity | number | number / INT | Entero entre1 y2147483647; sin coerción |
| purchased | Prohibida | false boolean /0 BOOLEAN | Inicializado por servidor |

Solicitud: objeto con exclusivamente name y quantity obligatorios. Campos desconocidos rechazados. Nombres repetidos permitidos; sin relaciones ni atributos nuevos. Transición de HU-11: inexistente → nuevo registro pendiente. No modifica otros productos. Registro exitoso aparece en GET existente por id ascendente y persiste al reabrir conexión.
