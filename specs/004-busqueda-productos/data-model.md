# Data Model — SMARLIST-21 / HU-17

## Producto (existente, sin cambios)

| Atributo | Tipo | Uso en HU-17 |
|---|---|---|
| `id` | string | Clave de renderizado; no participa en la búsqueda |
| `name` | string | Único campo comparado (normalizado solo para comparar, nunca se modifica) |
| `quantity` | number | Sin uso |
| `purchased` | boolean | Criterio `status` |

No se agregan atributos ni se cambia la persistencia `smartlist.products`.

## Criterios de filtrado (estado de interfaz, no persistente)

```js
{
  status: 'all' | 'pending' | 'purchased', // activeFilter, inicial 'all'
  query: string,                            // searchQuery, inicial ''
  // category: futuro, SMARLIST-20
}
```

- Viven en `App` con `useState`; se reinician al recargar.
- `query` se guarda tal como se escribe (el input es controlado); la normalización solo se aplica al comparar.
- La colección visible es derivada: `filterProducts(items, criteria)`. Mantiene orden de registro, referencias originales y no muta `items`.

## Reglas de coincidencia

1. `normalizeText(query)` vacío → todos los productos pasan el criterio de búsqueda.
2. En otro caso, un producto coincide si `normalizeText(name).includes(normalizeText(query))`.
3. Un producto es visible si cumple todos los criterios activos (conjunción).
