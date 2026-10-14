# Data Model — SMARLIST-13 / HU-12

products existente, sin cambios.

| Atributo | Regla PUT | Conservación |
|---|---|---|
| id | Parámetro string válido1..36 unidades UTF-16, sin espacios externos, bien formado; no cuerpo | ID original, sin UUID nuevo |
| name | String UTF-8 válido, trim,no vacío,máximo150 caracteres Unicode | Solo registro seleccionado |
| quantity | Number entero1..2147483647,sin coerción | Solo registro seleccionado |
| purchased | Prohibido en cuerpo | Estado vigentefalse/true conservado |

Objeto de entrada exclusivo name/quantity obligatorios. Campos adicionales rechazados. Salida exacta id:string,name:string,quantity:number,purchased:boolean. Nombres duplicados permitidos. Sin nuevas entidades, relaciones o versión. Edición completa, no upsert; mismos valores siguen siendo operación exitosa.
