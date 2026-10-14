# HU-16 — Filtrar y agrupar por categoría

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-20](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-20) |
| Título en Jira | HU-16 · FILTRAR Y AGRUPAR POR CATEGORÍA |
| Requisitos relacionados | RF-16 y RF-17; RF-06 y RF-08 |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero ver mis productos agrupados y filtrados por categoría, para recorrer el mercado sección por sección.

## 3. Criterios de aceptación según Jira

1. Debe existir un filtro de categoría con la opción "Todas" y una opción por cada categoría.
2. El filtro de categoría debe combinarse con el filtro por estado existente (Todos / Pendientes / Comprados).
3. La lista debe poder mostrarse agrupada por categoría, con un encabezado por grupo.
4. Cada grupo debe indicar cuántos productos pendientes tiene.
5. Las categorías sin productos no deben mostrarse como grupo vacío.
6. El resumen general debe seguir funcionando con los filtros aplicados.

## 4. Alcance vigente y contraste de fuentes

Jira declara dependencia de HU-15. La especificación aclara que el contador de pendientes de cada grupo usa **toda la categoría**, sin aplicar filtros; solo se muestran grupos con productos visibles. Los grupos siguen el orden fijo de categorías y conservan dentro de cada grupo el orden recibido. El resumen es global; filtros y agrupación son estado de interfaz, sin persistencia ni escrituras API.

## 5. Referencias

- [Especificación 008-filtrar-agrupar-categoria](../../specs/008-filtrar-agrupar-categoria/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
