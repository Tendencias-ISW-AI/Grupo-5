# HU-14 — Integración Full Stack

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-15](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-15) |
| Título en Jira | HU-14 · INTEGRACIÓN FULL STACK |
| Requisitos relacionados | RF-14; RF-07, RF-11 y RF-12 |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero gestionar mi lista de compras desde la aplicación web y que mis cambios se almacenen en MySQL, para conservar la información mediante el backend.

## 3. Criterios de aceptación según Jira

1. Al abrir SmartList, deben cargarse los productos desde `GET /api/products`.
2. Agregar un producto debe utilizar el endpoint POST.
3. Editar un producto debe utilizar PUT.
4. Marcar y desmarcar productos debe utilizar PATCH.
5. Eliminar productos debe utilizar DELETE.
6. La interfaz debe reflejar los resultados confirmados por la API.
7. Los filtros y el resumen deben continuar funcionando.
8. Al recargar, los datos deben recuperarse desde MySQL y no desde `localStorage`.
9. Las pruebas existentes deben adaptarse a la nueva fuente de persistencia sin perder cobertura funcional.

## 4. Alcance vigente y contraste de fuentes

La especificación resuelve la alternativa de datos antiguos planteada en Jira: iniciar desde MySQL, sin leer, importar, sincronizar, sobrescribir ni borrar automáticamente `smartlist.products`. La utilidad antigua solo conserva pruebas del formato histórico. React distingue carga, error y lista vacía, y refleja escrituras confirmadas; un fallo conserva los datos confirmados y el borrador. La categoría se incorpora posteriormente por HU-15.

## 5. Referencias

- [Especificación 005-integracion-full-stack](../../specs/005-integracion-full-stack/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
