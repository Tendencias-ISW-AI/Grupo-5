# Implementation Plan: SMARLIST-20 / HU-16 — Filtrar y agrupar por categoría

**Branch**: `feature/SMARLIST-20-hu-16-filtrar-agrupar-categoria` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

## Summary

Extender `filterProducts` con el criterio `category` (preparado en HU-17), agregar `groupByCategory` y `emptyMessageFor` como funciones puras, sumar a `ShoppingFilters` el selector de categoría y el botón de agrupación, y hacer que `ShoppingList` muestre secciones por categoría cuando se pide. El estado vive en `App`; backend, hook y API no cambian.

## Technical Context

**Language/Version**: JavaScript (ES Modules, JSX), React 19. **Dependencies**: existentes, sin nuevas. **Storage**: sin cambios. **Testing**: Vitest + jsdom con `tests/helpers/productsServer.js`. **Constraints**: accesibilidad (etiquetas, encabezados, `aria-labelledby`), sin persistencia de filtros, móvil.

## Constitution Check

Frontend (`AGENTS.md`); principios aplicables de la Constitution: II SDD, IV pruebas y regresión, V compatibilidad (sin tocar modelo ni API), VI simplicidad (funciones puras reutilizadas), VII trazabilidad (SMARLIST-20). PASS antes y después del diseño.

## Project Structure

```text
src/
├── utils/productFilters.js        # MODIFICAR: matchesCategory, category en filterProducts, groupByCategory, emptyMessageFor
├── components/ShoppingFilters.jsx # MODIFICAR: selector de categoría y botón Agrupar (el grupo de estado se conserva)
├── components/ShoppingList.jsx    # MODIFICAR: vista agrupada opcional
├── App.jsx                        # MODIFICAR: estados categoryFilter y groupByCategory; usa emptyMessageFor
└── App.css                        # MODIFICAR: estilos de filtros y grupos
tests/
└── categoryFilters.test.js        # NUEVO
```

## Design

- `matchesCategory(item, category)`: `all` → true; si no, `item.category === category`.
- `filterProducts(items, { status, query, category = 'all' })`: conjunción de los tres predicados.
- `groupByCategory(visibleItems, allItems)`: recorre `PRODUCT_CATEGORIES`; incluye solo categorías con productos visibles; `pending` = productos de la categoría con `purchased === false` en `allItems`.
- `emptyMessageFor({ total, query, status, category })`: lista vacía → original; búsqueda → HU-17; categoría ≠ `all` → "No hay productos [pendientes|comprados] en la categoría X"; si no, HU-06.
- `ShoppingFilters`: conserva `div[role=group]` de estado (primero); añade `select#category-filter` con etiqueta "Categoría" y `button#group-by-category` con `aria-pressed` "Agrupar por categoría".
- `ShoppingList`: prop `groups`; si se recibe, renderiza `section.category-group` con `h3` (nombre + `span.group-pending`) y una `ul.shopping-list` por grupo con `aria-label` de la categoría.

## Test Cases

| ID | Escenario | Esperado | CA |
|---|---|---|---|
| CP-01 | Selector | "Todas" + 8 categorías, "Todas" inicial | CA-01 |
| CP-02 | Elegir "Lácteos" | Solo Lácteos | CA-01 |
| CP-03 | Lácteos + Pendientes / Comprados | Ambos criterios | CA-02 |
| CP-04 | Categoría + búsqueda | Tres criterios | CA-02 |
| CP-05 | Categoría sin coincidencias | Mensaje de categoría | CA-01 |
| CP-06 | Agrupar | Encabezados en orden fijo, productos en su grupo | CA-03 |
| CP-07 | Conteo pendientes | Pendientes de la categoría en toda la lista | CA-04 |
| CP-08 | Grupos vacíos | No se muestran | CA-05 |
| CP-09 | Agrupar + filtros | Solo grupos con visibles | CA-03, CA-05 |
| CP-10 | Marcar/editar categoría en vista agrupada | Grupos y conteos actualizados | CA-03, CA-04 |
| CP-11 | Resumen con filtros | Global, sin solicitudes extra a la API | CA-06 |
| CP-12 | Funciones puras | `filterProducts`, `groupByCategory`, `emptyMessageFor` | CA-01–CA-05 |
| CP-13 | Regresión | Suites existentes aprobadas | — |

## Complexity Tracking

Sin violaciones.
