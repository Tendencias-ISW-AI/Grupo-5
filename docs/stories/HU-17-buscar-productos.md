# HU-17 — Buscar productos por nombre

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-21](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-21) |
| Título en Jira | HU-17 · BÚSQUEDA DE PRODUCTOS POR NOMBRE |
| Requisitos relacionados | RF-18; RF-06 y RF-16 |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero buscar productos por su nombre, para encontrar rápidamente un artículo en una lista larga.

## 3. Criterios de aceptación según Jira

1. Debe existir un campo de búsqueda visible sobre la lista.
2. La búsqueda debe filtrar mientras se escribe.
3. No debe distinguir mayúsculas, minúsculas ni tildes ("limon" encuentra "Limón").
4. Debe combinarse con los filtros de estado y categoría.
5. Si no hay coincidencias, debe mostrarse un mensaje claro.
6. Debe existir una opción para limpiar la búsqueda.

## 4. Alcance vigente y contraste de fuentes

La búsqueda es parcial y literal sobre el nombre, normalizando minúsculas, diacríticos y espacios. Vacío o solo espacios equivale a no buscar; limpiar devuelve el foco al campo. La especificación inicial de búsqueda pospone categoría, y `008-filtrar-agrupar-categoria` documenta su integración posterior, presente en el código. No se consulta un endpoint de búsqueda ni se persiste el texto. El resumen continúa siendo global.

## 5. Referencias

- [Especificación 004-busqueda-productos](../../specs/004-busqueda-productos/spec.md).
- [Especificación 008-filtrar-agrupar-categoria](../../specs/008-filtrar-agrupar-categoria/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
