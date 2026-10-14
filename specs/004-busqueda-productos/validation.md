# Validation — SMARLIST-21 / HU-17

Fecha: 2026-10-14. Rama: `feature/SMARLIST-21-hu-17-busqueda-productos`, creada desde `main` (7494a29) y verificada al inicio y al cierre.

## Flujo SDD ejecutado

Ejecución continua Specify → Clarify → Plan → Tasks → Analyze → Implement, autorizada por el usuario sin pausas entre fases.

- **Specify**: plantilla `spec-template` resuelta con los scripts de `.specify/`; directorio `specs/004-busqueda-productos/` fijado con `SPECIFY_FEATURE_DIRECTORY` y registrado en `.specify/feature.json` (local, ignorado por Git). Criterios y subtareas tomados de Jira SMARLIST-21. Checklist 16/16.
- **Clarify**: siete decisiones registradas en `spec.md` (alcance frontend, categoría diferida a SMARLIST-19/20, coincidencia parcial, normalización, búsqueda vacía, no persistencia, mensaje sin coincidencias). Sin marcadores pendientes. Checklist 16/16.
- **Plan**: `setup-plan.sh --json`; `plan.md`, `research.md`, `data-model.md`, `contracts/product-search.md` y `quickstart.md`. Constitution Check PASS antes y después del diseño.
- **Tasks**: `setup-tasks.sh --json`; 16 tareas por fases y por historia, con trazabilidad a FR/CA/CP.
- **Analyze**: `check-prerequisites.sh --json --require-tasks --include-tasks`; análisis de solo lectura. 8 FR, 4 SC, 6 CA, 16 CP y 16 tareas; cobertura 100 %. Cero conflictos críticos o constitucionales. Observaciones no bloqueantes:
  - A1 (bajo): el prefijo `004` ya lo usa `specs/004-eliminacion-productos`; el nombre `004-busqueda-productos` fue indicado expresamente. Los scripts resuelven por `feature.json`, por lo que no hay ambigüedad operativa.
  - A2 (medio): CA-04 menciona el filtro de categoría, que no existe hasta SMARLIST-19/20. Se cumple para el estado y la extensión queda preparada y documentada.
- **Implement**: pruebas escritas primero. Antes del código, el archivo de pruebas falló al no existir `src/utils/productFilters.js`; tras la utilidad pasaron 7 unitarias y fallaron las 13 de interfaz; tras el componente e integración pasaron las 20.

## Implementación

- `src/utils/productFilters.js` (nuevo): `normalizeText`, `matchesStatus`, `matchesSearch`, `filterProducts`.
- `src/components/ProductSearch.jsx` (nuevo): landmark `role="search"`, campo `#product-search` controlado y botón "Limpiar búsqueda".
- `src/App.jsx`: estado `searchQuery`, `visibleItems` mediante `filterProducts` y mensaje vacío de búsqueda.
- `src/App.css`: estilos `.product-search` y apilado en móvil.
- `tests/productSearch.test.js` (nuevo): 20 casos.
- `README.md`, `docs/architecture.md`: documentación de HU-17.

Sin cambios: `backend/**`, `src/hooks/useShoppingList.js`, `src/utils/shoppingListStorage.js`, componentes existentes y `tests/shoppingList.test.js` (verificado con `git diff --stat`).

## Criterios de aceptación

| Criterio | Resultado | Evidencia |
|---|---|---|
| CA-01 Campo visible sobre la lista | Cumplido | CP-01 |
| CA-02 Filtra mientras se escribe | Cumplido | CP-02, CP-05, CP-07, CP-14, CP-16 |
| CA-03 Sin mayúsculas ni tildes | Cumplido | CP-03, CP-04, CP-06 |
| CA-04 Combinación con estado y categoría | Cumplido para estado; categoría preparada (SMARLIST-20) | CP-08, CP-09 |
| CA-05 Mensaje sin coincidencias | Cumplido | CP-10, CP-11 |
| CA-06 Opción para limpiar | Cumplido | CP-12, CP-13 |

## Casos de prueba

| Caso | Resultado |
|---|---|
| CP-01 a CP-16 | Aprobados (unitarias e integración en `tests/productSearch.test.js`) |
| Borrador de producto oculto por la búsqueda | Aprobado (se descarta, igual que con el filtro de estado) |

## Pruebas ejecutadas

| Comando | Resultado |
|---|---|
| Línea base raíz `npm test` | 111/111 aprobadas |
| Línea base raíz `npm run build` | Correcta |
| Línea base `backend/` `npm test` | 151 aprobadas, 54 omitidas (suites MySQL opcionales) |
| Raíz `npm test` | 131/131 aprobadas (111 previas + 20 nuevas) |
| Raíz `npm run build` | Correcta |
| `backend/` `npm test` | 151 aprobadas, 54 omitidas (sin cambios respecto de la línea base) |
| `git diff --check` | Sin errores |

## Limitaciones

- El filtro por categoría no se implementa; depende de SMARLIST-19 (modelo) y SMARLIST-20 (filtro).
- Quitar diacríticos hace que "n" y "ñ" coincidan ("pina" encuentra "Piña").
- Las suites MySQL del backend no se ejecutaron (requieren base local) y no son relevantes, pues el backend no cambió.
- La verificación visual en navegador queda indicada en `quickstart.md` para la revisión del PR.
