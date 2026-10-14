# Quickstart — SMARLIST-22

## Ejecutar

```bash
cd backend && npm run db:init && npm start     # API en http://localhost:3000
npm run dev                                    # en la raíz, http://localhost:5173
npm test && npm run build                      # raíz
cd backend && npm test                         # regresión del backend
```

## Verificación manual

1. El formulario muestra "Categoría" con "Otros" seleccionado y las 8 opciones.
2. Registrar "Leche" con "Lácteos": la fila muestra "Lácteos" y el selector vuelve a "Otros".
3. Registrar "Pan" sin cambiar el selector: la fila muestra "Otros".
4. Editar "Pan": el selector muestra "Otros"; elegir "Panadería" y guardar → la fila muestra "Panadería". Recargar: se conserva.
5. Editar y cancelar: la categoría no cambia.
6. Buscar y filtrar: cada resultado conserva su categoría visible.
7. Revisar en ancho móvil que el selector y la etiqueta no desborden.
