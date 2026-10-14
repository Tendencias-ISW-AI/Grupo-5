---

description: "Lista de tareas de SMARLIST-21 / HU-17"
---

# Tasks: SMARLIST-21 / HU-17 — Búsqueda de productos por nombre

**Input**: `specs/004-busqueda-productos/` (spec, plan, research, data-model, contracts, quickstart).

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/product-search.md.

**Tests**: Requeridos por la subtarea Jira "Pruebas de búsqueda y del estado vacío". Se escriben antes del código y deben fallar primero.

**Organization**: Tareas agrupadas por historia (US1–US3) y ligadas a FR, CA y CP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias).
- **[Story]**: Historia a la que pertenece (US1, US2, US3).

## Phase 1: Setup

- [X] T001 Verificar la rama `feature/SMARLIST-21-hu-17-busqueda-productos`, árbol limpio y línea base (`npm test`, `npm run build` en la raíz y `npm test` en `backend/`).
- [X] T002 Revisar `src/App.jsx`, `src/components/ShoppingFilters.jsx`, `src/components/ShoppingList.jsx` y `tests/shoppingList.test.js` para reutilizar el patrón de filtrado y de pruebas sin modificar `src/hooks/useShoppingList.js`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Módulo de filtrado puro usado por todas las historias (subtarea Jira "normalización de texto").

- [X] T003 [P] Escribir pruebas unitarias de `normalizeText`, `matchesStatus`, `matchesSearch` y `filterProducts` (CP-03 a CP-08, CP-14 a CP-16) en `tests/productSearch.test.js`.
- [X] T004 Implementar `normalizeText`, `matchesStatus`, `matchesSearch` y `filterProducts` en `src/utils/productFilters.js` según `contracts/product-search.md` (FR-003, FR-004, FR-007).

**Checkpoint**: Las pruebas unitarias de T003 pasan.

---

## Phase 3: User Story 1 - Encontrar un producto mientras se escribe (Priority: P1) 🎯 MVP

**Goal**: Campo visible sobre la lista que filtra en vivo sin distinguir mayúsculas ni tildes.

**Independent Test**: Registrar "Limón", "Leche" y "Arroz"; escribir "limon" → solo "Limón".

### Tests for User Story 1

- [X] T005 [P] [US1] Escribir pruebas de integración CP-01 a CP-07 y CP-14 sobre `App` en `tests/productSearch.test.js`.

### Implementation for User Story 1

- [X] T006 [P] [US1] Crear `src/components/ProductSearch.jsx` con `role="search"`, etiqueta "Buscar producto" e `input#product-search` controlado (FR-001, FR-002).
- [X] T007 [US1] Integrar `ProductSearch` en `src/App.jsx` con el estado `searchQuery`, después del título de la lista y antes de `ShoppingFilters`, y calcular `visibleItems` con `filterProducts` (FR-001, FR-002, FR-003).
- [X] T008 [P] [US1] Agregar estilos `.product-search` adaptables a móvil en `src/App.css`.

**Checkpoint**: US1 funcional y probada.

---

## Phase 4: User Story 2 - Combinar búsqueda con el filtro de estado (Priority: P2)

**Goal**: Búsqueda y filtro de estado se aplican a la vez; lógica preparada para la categoría.

**Independent Test**: "Leche" pendiente y "Lechuga" comprada; "lech" + Pendientes → solo "Leche".

### Tests for User Story 2

- [X] T009 [US2] Escribir pruebas de integración CP-08, CP-09 y CP-15 (cambio de filtro, marcar/desmarcar, editar, eliminar, registrar, resumen global y ausencia de escrituras en localStorage) en `tests/productSearch.test.js`.

### Implementation for User Story 2

- [X] T010 [US2] Sustituir el filtrado de estado inline de `src/App.jsx` por `filterProducts(items, { status: activeFilter, query: searchQuery })`, conservando las condiciones de HU-06 (FR-004, FR-007).

**Checkpoint**: US1 y US2 funcionan; las pruebas HU-06 siguen aprobadas.

---

## Phase 5: User Story 3 - Estado vacío y limpieza de la búsqueda (Priority: P3)

**Goal**: Mensaje claro sin coincidencias y botón para limpiar.

**Independent Test**: Buscar "xyz" → mensaje; "Limpiar búsqueda" → campo vacío y lista restaurada.

### Tests for User Story 3

- [X] T011 [US3] Escribir pruebas de integración CP-10 a CP-13 en `tests/productSearch.test.js`.

### Implementation for User Story 3

- [X] T012 [US3] Agregar el botón "Limpiar búsqueda" (deshabilitado con campo vacío, devuelve el foco) en `src/components/ProductSearch.jsx` (FR-006).
- [X] T013 [US3] Calcular el mensaje vacío de búsqueda en `src/App.jsx` con la precedencia de `contracts/product-search.md` (FR-005).

**Checkpoint**: Las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T014 [P] Documentar HU-17 en `README.md` (funcionalidades, verificación manual, estado) y `docs/architecture.md` (componente, utilidad y decisión de filtrado).
- [X] T015 Ejecutar `npm test` y `npm run build` en la raíz y `npm test` en `backend/`; confirmar que `backend/` y `src/hooks/useShoppingList.js` no tienen cambios (`git diff --stat`).
- [X] T016 Registrar resultados, cobertura de CA/CP y limitaciones en `specs/004-busqueda-productos/validation.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T002) → Foundational (T003–T004) → US1 (T005–T008) → US2 (T009–T010) → US3 (T011–T013) → Polish (T014–T016).

### User Story Dependencies

- **US1**: depende de T004.
- **US2**: depende de T004 y de la integración de T007 en `App.jsx`.
- **US3**: depende de T006 (componente) y T007 (estado en `App`).

### Within Each User Story

- Las pruebas se escriben primero y se verifica que fallen.
- Las tareas que tocan `src/App.jsx` (T007, T010, T013) o `tests/productSearch.test.js` son secuenciales.

### Parallel Opportunities

- T003 y T006 (archivos distintos); T008 y T014 con cualquier tarea que no edite el mismo archivo.

---

## Implementation Strategy

1. Utilidad pura con pruebas (MVP técnico).
2. US1 → validar → US2 → validar regresión HU-06 → US3.
3. Documentación y validación final.

## Coverage

| Requisito / Criterio | Tareas |
|---|---|
| FR-001 / CA-01 | T005, T006, T007 |
| FR-002 / CA-02 | T005, T006, T007 |
| FR-003 / CA-03 | T003, T004, T005 |
| FR-004 / CA-04 | T003, T004, T009, T010 |
| FR-005 / CA-05 | T011, T013 |
| FR-006 / CA-06 | T011, T012 |
| FR-007 | T003, T009, T010 |
| FR-008 | T002, T015 |
| SC-001 a SC-004 | T003, T005, T009, T011, T015, T016 |

## Notes

- Sin cambios en `backend/` ni en `src/hooks/useShoppingList.js` (SMARLIST-15).
- La categoría (SMARLIST-19/20) queda fuera de alcance; solo se prepara la extensión de `filterProducts`.
