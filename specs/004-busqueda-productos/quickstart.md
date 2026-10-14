# Quickstart — SMARLIST-21 / HU-17

## Ejecutar

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # pruebas del frontend
npm run build     # compilación de producción
cd backend && npm test   # regresión del backend (sin cambios en HU-17)
```

## Verificación manual

1. Registrar "Limón" (2), "Leche" (1), "Lechuga" (3) y "Arroz" (1).
2. Comprobar que el campo "Buscar producto" aparece sobre los filtros y la lista, y que "Limpiar búsqueda" está deshabilitado.
3. Escribir `l`, `le`, `lec`: la lista se reduce en cada pulsación.
4. Escribir `limon`, `LIMÓN` y `  limón  `: aparece "Limón".
5. Marcar "Lechuga" como comprada, buscar `lech` y alternar filtros: Todos → Leche y Lechuga; Pendientes → Leche; Comprados → Lechuga.
6. Buscar `xyz`: aparece `No se encontraron productos que coincidan con "xyz"`; el resumen sigue mostrando 4 productos.
7. Pulsar "Limpiar búsqueda": el campo queda vacío y con foco, y reaparecen los productos del filtro activo.
8. Recargar la página: los productos se conservan y la búsqueda vuelve a estar vacía.
9. Revisar en ancho móvil (≤ 640 px) que el campo y el botón no desborden horizontalmente.
