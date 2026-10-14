# Contrato frontend — SMARLIST-21 / HU-17

HU-17 no expone ni consume endpoints HTTP. Este contrato define las interfaces internas del frontend.

## `src/utils/productFilters.js`

| Export | Firma | Contrato |
|---|---|---|
| `normalizeText` | `(text: unknown) => string` | Convierte a string (`null`/`undefined` → `''`), quita diacríticos (NFD + `\p{M}`), pasa a minúsculas, reduce espacios consecutivos y recorta. Pura. |
| `matchesStatus` | `(item, status) => boolean` | `all` → `true`; `pending` → `item.purchased === false`; `purchased` → `item.purchased === true`; valor desconocido → `false`. |
| `matchesSearch` | `(item, normalizedQuery) => boolean` | `''` → `true`; en otro caso `normalizeText(item.name).includes(normalizedQuery)`. Recibe la query ya normalizada. |
| `filterProducts` | `(items, { status = 'all', query = '' } = {}) => Product[]` | Nuevo arreglo con los productos que cumplen todos los criterios; orden y referencias conservados; no muta `items`. |

Extensión prevista (SMARLIST-20): añadir `matchesCategory(item, category)` y la clave `category` en los criterios de `filterProducts`, sin cambiar las firmas anteriores.

## `src/components/ProductSearch.jsx`

```jsx
<ProductSearch query={string} onQueryChange={(value: string) => void} />
```

| Elemento | Contrato |
|---|---|
| Contenedor | `div.product-search` con `role="search"` |
| Etiqueta | `<label htmlFor="product-search">Buscar producto</label>` |
| Campo | `input#product-search`, `type="search"`, controlado por `query`, `autoComplete="off"`, placeholder "Escribe el nombre de un producto"; cada `change` invoca `onQueryChange(event.target.value)` |
| Limpiar | `button[type="button"]` con texto "Limpiar búsqueda"; `disabled` si `query === ''`; al pulsarlo invoca `onQueryChange('')` y enfoca el campo |

## Mensajes de estado vacío (`App` → `ShoppingList.emptyMessage`)

| Condición (en orden) | Mensaje |
|---|---|
| Colección original vacía | `Tu lista de compras está vacía` |
| `searchQuery.trim()` no vacío | `No se encontraron productos que coincidan con "<searchQuery.trim()>"` |
| Filtro `all` | `Tu lista de compras está vacía` |
| Filtro `pending` | `No tienes productos pendientes` |
| Filtro `purchased` | `No tienes productos comprados` |
