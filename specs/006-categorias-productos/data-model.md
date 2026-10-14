# Data Model — SMARLIST-19 / HU-15

## Tabla `smartlist_db.products`

| Columna | Tipo | Reglas | Cambio |
|---|---|---|---|
| `id` | VARCHAR(36) utf8mb4_bin, PK | No vacío | Sin cambio |
| `name` | VARCHAR(150) | No vacío tras trim | Sin cambio |
| `quantity` | INT | > 0 | Sin cambio |
| `purchased` | BOOLEAN (tinyint) | 0/1, default 0 | Sin cambio |
| `category` | VARCHAR(30) NOT NULL DEFAULT 'Otros' | Valor de la lista fija (validado en servicio) | **Nuevo** |

## Producto en la API

```json
{ "id": "uuid", "name": "Leche", "quantity": 1, "purchased": false, "category": "Lácteos" }
```

## Categorías válidas (orden fijo)

1. Frutas y verduras
2. Carnes y pescados
3. Lácteos
4. Panadería
5. Despensa
6. Bebidas
7. Aseo
8. Otros (por defecto)

## Transiciones

- **Creación**: `category` recibida o `Otros`.
- **Edición**: `category` recibida o la actual; ID y `purchased` nunca cambian.
- **Migración**: tabla de cuatro columnas → cinco columnas; filas existentes con `Otros`.
- **Eliminación**: sin cambios.
