# HU-11 — Registrar productos en MySQL

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-12](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-12) |
| Título en Jira | HU-11 · REGISTRO DE PRODUCTOS |
| Requisitos relacionados | RF-10; RF-01 y RF-15 |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero agregar productos a mi lista y almacenarlos en una base de datos, para conservar la información de mis compras.

## 3. Criterios de aceptación según Jira

1. El backend debe exponer `POST /api/products`.
2. Debe recibir el nombre y la cantidad del producto.
3. Debe rechazar nombres vacíos y cantidades que no sean enteros positivos.
4. Cada producto debe recibir un identificador único y estado inicial pendiente.
5. El producto debe guardarse correctamente en MySQL.
6. Debe devolver el producto creado con código HTTP `201`.
7. Las solicitudes inválidas deben devolver `400` sin insertar registros.

## 4. Alcance vigente y contraste de fuentes

La especificación original contempla cuatro atributos. HU-15 amplía POST con `category` opcional y respuesta de cinco atributos. El servidor genera el UUID y aplica `purchased=false`; permite nombres repetidos, normaliza el nombre con trim y valida los límites del esquema.

## 5. Referencias

- [Especificación 002-registro-productos](../../specs/002-registro-productos/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
