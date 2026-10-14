# Quickstart — SMARLIST-20 / HU-16

```bash
cd backend && npm start      # API (requiere backend/.env y db:init)
npm run dev                  # raíz
npm test && npm run build    # raíz
```

## Verificación manual

1. Registrar "Leche" (Lácteos), "Queso" (Lácteos), "Pan" (Panadería) y "Jabón" (Aseo); marcar "Queso" como comprado.
2. Elegir "Lácteos" en "Categoría" → Leche y Queso. Pulsar "Pendientes" → solo Leche. Buscar "que" → "No se encontraron…".
3. Limpiar la búsqueda, volver a "Todos" y elegir "Bebidas" → "No hay productos en la categoría Bebidas".
4. Elegir "Todas" y pulsar "Agrupar por categoría" → secciones Lácteos (1 pendiente), Panadería (1 pendiente), Aseo (1 pendiente), en ese orden; no aparecen categorías vacías.
5. Pulsar "Comprados" con la vista agrupada → solo la sección Lácteos con Queso, que sigue indicando "1 pendiente".
6. Editar "Pan" a "Despensa" → pasa a la sección Despensa.
7. El resumen muestra siempre 4 productos. Revisar en móvil.
