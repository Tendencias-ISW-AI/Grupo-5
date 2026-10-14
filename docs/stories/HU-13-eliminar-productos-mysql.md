# HU-13 — Eliminar productos de MySQL

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-14](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-14) |
| Título en Jira | HU-13 · ELIMINACIÓN DE PRODUCTOS |
| Requisitos relacionados | RF-13; RF-04 |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero eliminar productos de la base de datos, para mantener mi lista actualizada y evitar que vuelvan a aparecer.

## 3. Criterios de aceptación según Jira

1. El backend debe exponer `DELETE /api/products/:id`.
2. Debe eliminar únicamente el producto identificado por su ID.
3. Los demás productos deben permanecer intactos.
4. Debe responder `204` cuando se elimine correctamente.
5. Si el producto no existe, debe responder `404`.
6. El producto eliminado no debe aparecer en futuras consultas.

## 4. Alcance vigente y contraste de fuentes

La eliminación es física, por UUID válido, tanto para pendientes como comprados. Éxito devuelve 204 sin cuerpo ni JSON; un segundo intento devuelve 404. No hay papelera, restauración ni eliminación por nombre.

## 5. Referencias

- [Especificación 004-eliminacion-productos](../../specs/004-eliminacion-productos/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
