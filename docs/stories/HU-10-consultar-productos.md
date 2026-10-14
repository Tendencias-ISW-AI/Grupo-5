# HU-10 — Consultar productos en MySQL

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-11](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-11) |
| Título en Jira | HU-10 · CONSULTA DE PRODUCTOS |
| Requisitos relacionados | RF-09; RF-07 |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero consultar mis productos almacenados en la base de datos, para visualizar mi lista de compras aunque cierre y vuelva a abrir la aplicación.

## 3. Criterios de aceptación según Jira

1. El backend debe exponer `GET /api/products`.
2. El endpoint debe devolver todos los productos registrados.
3. Cada producto debe incluir `id`, `name`, `quantity` y `purchased`.
4. Cuando no existan productos, debe devolver un arreglo vacío.
5. Si ocurre un error de base de datos, debe devolver una respuesta HTTP adecuada sin exponer información sensible.

## 4. Alcance vigente y contraste de fuentes

La especificación enlazada conserva el identificador histórico HU-09 y una clave Jira pendiente. La consulta corresponde en Jira a **HU-10 / SMARLIST-11**, por coincidencia de objetivo y criterios, no a la mejora visual HU-09. Actualmente GET incluye también `category` por HU-15. En esta rama el SQL ordena por `BINARY id ASC`; no garantiza orden de registro (D-05 del registro de discrepancias).

## 5. Referencias

- [Especificación 001-consultar-productos](../../specs/001-consultar-productos/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
