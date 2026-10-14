# Validation — SMARLIST-20 / HU-16

Fecha: 2026-10-14. Rama: `feature/SMARLIST-20-hu-16-filtrar-agrupar-categoria`, creada desde `main` (dd80985, con HU-15, SMARLIST-22 y HU-17 integrados).

## Flujo SDD ejecutado

Specify → Clarify → Plan → Tasks → Analyze → Implement sin pausas, por autorización del usuario.

- **Specify/Clarify**: `specs/008-filtrar-agrupar-categoria/` con los scripts de `.specify/`; ocho decisiones registradas (selector, combinación con estado y búsqueda, agrupación opcional, conteo de pendientes sobre toda la lista, sin grupos vacíos, mensajes, no persistencia, resumen global). Checklist 16/16.
- **Plan**: plan, research, data-model, contrato de interfaz y quickstart; Constitution Check PASS.
- **Tasks**: 12 tareas por historia.
- **Analyze**: 8 FR, 3 SC, 6 CA, 13 CP; cobertura 100 %; sin conflictos.
- **Implement**: pruebas primero (12 fallaban antes del código). La primera versión usaba una casilla para agrupar; tres pruebas de HU-03 que toman "la primera casilla" de la página fallaron, por lo que se cambió a un botón alternable con `aria-pressed` (más coherente con los filtros de estado y sin ambigüedad con las casillas de compra). No se modificaron pruebas anteriores.

## Implementación

- `src/utils/productFilters.js`: `matchesCategory`, `category` en `filterProducts`, `groupByCategory`, `emptyMessageFor`.
- `src/components/ShoppingFilters.jsx`: selector "Categoría" y botón "Agrupar por categoría".
- `src/components/ShoppingList.jsx`: vista agrupada opcional (`groups`).
- `src/App.jsx`: estados `categoryFilter` y `groupedView`; mensajes con `emptyMessageFor`.
- `src/App.css`, `README.md`, `docs/architecture.md`.
- `tests/categoryFilters.test.js` (nuevo, 12 casos).

Sin cambios en backend, hook ni cliente de la API.

## Criterios de aceptación

| Criterio | Resultado | Evidencia |
|---|---|---|
| CA-01 Filtro con "Todas" y una opción por categoría | Cumplido | CP-01, CP-02, CP-05 |
| CA-02 Combinación con estado | Cumplido | CP-03, CP-04, CP-12 |
| CA-03 Lista agrupada con encabezado | Cumplido | CP-06, CP-09, CP-10 |
| CA-04 Pendientes por grupo | Cumplido | CP-07, CP-10 |
| CA-05 Sin grupos vacíos | Cumplido | CP-08, CP-09 |
| CA-06 Resumen con filtros | Cumplido | CP-11 |

## Pruebas ejecutadas

| Comando | Resultado |
|---|---|
| Raíz `npm test` | 185/185 aprobadas (173 previas + 12 nuevas) |
| Raíz `npm run build` | Correcta |
| `backend/` `npm test` | 225 aprobadas, 74 omitidas (MySQL opt-in); sin cambios en el backend |

## Verificación manual

Con backend y Vite locales y 4 productos de prueba creados por la API (Leche y Queso en Lácteos, Queso comprado; Pan en Panadería; Jabón en Aseo): el selector y el botón aparecen bajo los filtros de estado; al activar "Agrupar por categoría" se ven las secciones Lácteos, Panadería y Aseo con "1 pendiente" cada una. Los productos de prueba se eliminaron al terminar (base vacía como al inicio). No se pudo reducir la ventana del navegador para revisar el ancho móvil; los estilos móviles siguen el patrón existente de los filtros.
