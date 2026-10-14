# Contrato frontend — SMARLIST-22

## `src/utils/productCategories.js`

| Export | Contrato |
|---|---|
| `PRODUCT_CATEGORIES` | Arreglo congelado con las 8 categorías en el orden del backend |
| `DEFAULT_PRODUCT_CATEGORY` | `'Otros'` |
| `isValidProductCategory(value)` | `true` solo si `value` es un string incluido en la lista (coincidencia exacta) |

## `useShoppingList`

| Función | Cambio |
|---|---|
| `validateProduct(name, quantity, category?)` | Con `category` definida e inválida añade `errors.category`; devuelve `category` |
| `addProduct(name, quantity, category = 'Otros')` | `POST /api/products` con `{ name, quantity, category }` |
| `updateProduct(id, { name, quantity, category? })` | `PUT /api/products/:id` con `category` si está definida |

## `productsApi`

`isProduct(item)`: exactamente `id`, `name`, `quantity`, `purchased`, `category`, con `category` válida. Cualquier otra forma → `El servidor devolvió una respuesta inválida.`

## Componentes

| Componente | Elemento | Contrato |
|---|---|---|
| `ShoppingForm` | `label[for="product-category"]` "Categoría" + `select#product-category` | 8 opciones, valor inicial `Otros`, se reinicia tras registrar |
| `ShoppingItem` (vista) | `span.product-category` | Texto = `item.category` |
| `ShoppingItem` (edición) | `label` "Categoría" + `select[name="category"]` | Precargado con `item.category` |

La API (POST/PUT) es la definida en `specs/006-categorias-productos/contracts/products.openapi.yaml`.
