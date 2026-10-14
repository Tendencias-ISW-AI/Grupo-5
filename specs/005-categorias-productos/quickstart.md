# Quickstart — SMARLIST-19 / HU-15 (backend)

## Ejecutar

```bash
cd backend
npm install
npm test               # pruebas aisladas (sin MySQL)
npm run db:init        # crea la tabla con category o migra una tabla existente a "Otros"
npm run test:mysql     # opcional, requiere backend/.env con smartlist_db local
npm start              # http://localhost:3000
```

Regresión del frontend desde la raíz: `npm test` y `npm run build`.

## Verificación manual (con MySQL local)

1. Con una tabla de la versión anterior que tenga productos, ejecutar `npm run db:init`: la salida incluye `"categoryAdded":true` y `GET /api/products` devuelve todos con `"category":"Otros"`. Repetir `db:init`: `"categoryAdded":false`.
2. `POST /api/products` con `{"name":"Leche","quantity":1,"category":"Lácteos"}` → 201 con `"category":"Lácteos"`.
3. `POST` con `{"name":"Pan","quantity":1}` → 201 con `"category":"Otros"`.
4. `PUT /api/products/<id>` con `{"name":"Leche","quantity":2,"category":"Bebidas"}` → 200 con `Bebidas`; repetir sin `category` → conserva `Bebidas`.
5. `POST` o `PUT` con `"category":"Juguetes"`, `"lácteos"` o `null` → 400 y `GET` sin cambios.
6. Retirar los productos de prueba con `DELETE /api/products/<id>`.
