# Data Model — SMARLIST-20 / HU-16

## Producto

Sin cambios: `id`, `name`, `quantity`, `purchased`, `category` (HU-15).

## Estado de interfaz en `App` (no persistente)

```js
{
  activeFilter: 'all' | 'pending' | 'purchased',   // HU-06
  searchQuery: string,                              // HU-17
  categoryFilter: 'all' | <categoría>,              // HU-16, inicial 'all'
  groupByCategory: boolean,                         // HU-16, inicial false
}
```

## Derivados

- `visibleItems = filterProducts(items, { status, query, category })`.
- `groups = groupByCategory(visibleItems, items)` → `[{ category, items, pending }]` en el orden de `PRODUCT_CATEGORIES`, sin grupos vacíos; `pending` cuenta en `items` completo.
- `emptyMessage = emptyMessageFor({ total, query, status, category })`.
