---

description: "Lista de tareas de SMARLIST-20 / HU-16"
---

# Tasks: SMARLIST-20 / HU-16 — Filtrar y agrupar por categoría

**Input**: `specs/008-filtrar-agrupar-categoria/`.

**Tests**: Requeridos (subtarea "Pruebas de la combinación de filtros"). Se escriben antes del código.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Verificar rama `feature/SMARLIST-20-hu-16-filtrar-agrupar-categoria` desde `main` y línea base (`npm test`, `npm run build`, `backend/` `npm test`).

## Phase 2: Foundational

- [X] T002 [P] Escribir CP-12 (funciones puras) en `tests/categoryFilters.test.js`.
- [X] T003 Implementar `matchesCategory`, `category` en `filterProducts`, `groupByCategory` y `emptyMessageFor` en `src/utils/productFilters.js`.

## Phase 3: User Story 1 - Filtrar por categoría (P1) 🎯 MVP

- [X] T004 [US1] Escribir CP-01 a CP-05 y CP-11 en `tests/categoryFilters.test.js`.
- [X] T005 [US1] Agregar el selector de categoría en `src/components/ShoppingFilters.jsx` (FR-001).
- [X] T006 [US1] Estado `categoryFilter` y `emptyMessageFor` en `src/App.jsx` (FR-002, FR-006, FR-007).

## Phase 4: User Story 2 - Lista agrupada (P2)

- [X] T007 [US2] Escribir CP-06 a CP-10 en `tests/categoryFilters.test.js`.
- [X] T008 [US2] Botón "Agrupar por categoría" en `src/components/ShoppingFilters.jsx` y estado en `src/App.jsx` (FR-003).
- [X] T009 [US2] Vista agrupada con encabezados y conteo en `src/components/ShoppingList.jsx` (FR-003, FR-004, FR-005).

## Phase 5: Polish

- [X] T010 [P] Estilos en `src/App.css`, adaptables a móvil.
- [X] T011 [P] Documentar en `README.md` y `docs/architecture.md`.
- [X] T012 Ejecutar `npm test`, `npm run build` y `backend/` `npm test`; registrar en `specs/008-filtrar-agrupar-categoria/validation.md`.

## Dependencies & Execution Order

T001 → T002–T003 → T004–T006 → T007–T009 → T010–T012.

## Coverage

| Requisito / Criterio | Tareas |
|---|---|
| FR-001 / CA-01 | T004, T005 |
| FR-002 / CA-02 | T002, T003, T004, T006 |
| FR-003 / CA-03 | T007, T008, T009 |
| FR-004 / CA-04 | T002, T007, T009 |
| FR-005 / CA-05 | T002, T007, T009 |
| FR-006 | T002, T004, T006 |
| FR-007 / CA-06 | T004, T006 |
| FR-008 | T012 |
