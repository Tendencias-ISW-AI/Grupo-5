# HU-15 — Categorías de productos

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-19](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-19); continuación [SMARLIST-22](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-22) |
| Título en Jira | HU-15 · CATEGORÍAS DE PRODUCTOS |
| Requisitos relacionados | RF-15 |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero asignar una categoría a cada producto (por ejemplo Frutas y verduras, Lácteos, Aseo), para organizar mejor mi lista de compras.

## 3. Criterios de aceptación según Jira

1. La tabla `products` debe incluir un campo `category`.
2. Debe existir un conjunto fijo de categorías válidas, incluida la categoría por defecto "Otros".
3. `POST /api/products` y `PUT /api/products/:id` deben aceptar la categoría.
4. Las categorías no válidas deben devolver `400` sin modificar registros.
5. Los productos existentes sin categoría deben quedar en "Otros".
6. El formulario de agregar y editar producto debe permitir elegir la categoría.
7. Cada producto en la lista debe mostrar su categoría.
8. Las pruebas existentes deben seguir pasando y debe haber pruebas nuevas para la categoría.

### Continuación de interfaz — SMARLIST-22

1. El formulario de agregar producto debe permitir elegir la categoría entre las categorías válidas, con "Otros" seleccionada por defecto.
2. La edición de un producto debe mostrar su categoría actual y permitir cambiarla.
3. Cada producto en la lista debe mostrar su categoría.
4. La categoría elegida debe enviarse a la API (`POST` y `PUT`) y la interfaz debe reflejar la categoría confirmada por el servidor.
5. Las pruebas existentes deben seguir pasando y debe haber pruebas nuevas para la categoría en la interfaz.

## 4. Alcance vigente y contraste de fuentes

SMARLIST-19 contiene los criterios completos; SMARLIST-22 continúa la parte de interfaz (criterios 6 y 7). Jira registra un enlace «Relates» entre ambos y la continuación declara dependencia del backend; SMARLIST-19 declara dependencia de HU-14.

Las categorías verificadas en especificaciones y código son: Frutas y verduras, Carnes y pescados, Lácteos, Panadería, Despensa, Bebidas, Aseo y Otros. No se pueden crear categorías desde la aplicación. POST omitido usa Otros; PUT omitido conserva la categoría. La migración agrega category a tablas anteriores compatibles sin perder productos y es idempotente. La interfaz envía y muestra la categoría confirmada por la API.

## 5. Referencias

- [Especificación 006-categorias-productos](../../specs/006-categorias-productos/spec.md).
- [Especificación 007-categorias-interfaz](../../specs/007-categorias-interfaz/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
