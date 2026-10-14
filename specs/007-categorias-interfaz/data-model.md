# Data Model — SMARLIST-22

## Producto en el frontend

| Atributo | Tipo | Origen |
|---|---|---|
| `id` | string | API |
| `name` | string | Formulario / API |
| `quantity` | number | Formulario / API |
| `purchased` | boolean | API |
| `category` | string (lista fija) | Selector / API |

Los productos se guardan en el estado de `useShoppingList` tal como los confirma la API; no hay persistencia local.

## Estado de los formularios

- Registro: `name`, `quantity`, `category` (inicial `Otros`, se reinicia tras registrar).
- Edición: `name`, `quantity`, `category` (precargados desde el producto; se descartan al cancelar).

## Categorías

`Frutas y verduras`, `Carnes y pescados`, `Lácteos`, `Panadería`, `Despensa`, `Bebidas`, `Aseo`, `Otros` (por defecto). Igual al backend.
