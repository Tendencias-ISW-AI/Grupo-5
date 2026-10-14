# Modelo — HU-14

Producto confirmado: id string, name string, quantity number, purchased boolean.

- UUID generado exclusivamente por POST backend; PATCH valida como DELETE.
- Nombre string válido, trim, entre 1 y 150 caracteres Unicode.
- Cantidad estrictamente number entero entre 1 y 2147483647; formulario convierte texto antes de enviar.
- PATCH acepta únicamente purchased booleano sin coerción ni atributos adicionales.
- PUT solo nombre/cantidad; PATCH solo purchased. Identidad y otros registros intactos.
- Esquema sin cambios; BOOLEAN 0/1 se convierte a JSON booleano.

React conserva colección confirmada, carga, error y actividad de solicitudes. Filtro/contadores derivados, borradores temporales; sin persistencia adicional.
