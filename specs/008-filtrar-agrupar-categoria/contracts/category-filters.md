# Contrato frontend — SMARLIST-20 / HU-16

## `src/utils/productFilters.js`

| Export | Contrato |
|---|---|
| `matchesCategory(item, category)` | `'all'` → `true`; si no, `item.category === category` |
| `filterProducts(items, { status = 'all', query = '', category = 'all' })` | Productos que cumplen estado, búsqueda y categoría; orden y referencias conservados |
| `groupByCategory(visibleItems, allItems = visibleItems)` | `[{ category, items, pending }]` en orden de `PRODUCT_CATEGORIES`, solo categorías con visibles; `pending` = `allItems` de la categoría con `purchased === false` |
| `emptyMessageFor({ total, query, status, category })` | Ver tabla de mensajes |

### Mensajes (en orden)

| Condición | Mensaje |
|---|---|
| `total === 0` | `Tu lista de compras está vacía` |
| búsqueda no vacía | `No se encontraron productos que coincidan con "<texto>"` |
| `category !== 'all'` y estado `all` | `No hay productos en la categoría <X>` |
| `category !== 'all'` y `pending` | `No hay productos pendientes en la categoría <X>` |
| `category !== 'all'` y `purchased` | `No hay productos comprados en la categoría <X>` |
| estado `all` | `Tu lista de compras está vacía` |
| `pending` / `purchased` | Mensajes de HU-06 |

## Componentes

| Componente | Elemento | Contrato |
|---|---|---|
| `ShoppingFilters` | `div[role=group]` "Filtrar productos por estado" | Sin cambios, primero |
| `ShoppingFilters` | `label[for=category-filter]` "Categoría" + `select#category-filter` | `all` ("Todas") + 8 categorías |
| `ShoppingFilters` | `button#group-by-category[aria-pressed]` "Agrupar por categoría" | Inactivo por defecto; un checkbox se confundiría con los de cada producto |
| `ShoppingList` | prop `groups` | Si existe: `section.category-group` con `h3` (categoría + `span.group-pending` "N pendiente(s)") y `ul.shopping-list[aria-label=<categoría>]` |
