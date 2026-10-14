---

description: "Lista de tareas de SMARLIST-22"
---

# Tasks: SMARLIST-22 — Categorías de productos en la interfaz

**Input**: `specs/007-categorias-interfaz/`.

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-categories.md.

**Tests**: Requeridos (CA-05). Se escriben antes del código.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Verificar rama `feature/SMARLIST-22-hu-15-categorias-interfaz` creada desde la rama de SMARLIST-19 y línea base (`npm test`, `npm run build`, `backend/` `npm test`).

## Phase 2: Foundational

- [X] T002 [P] Escribir CP-10 y CP-11 en `tests/productCategoriesUi.test.js`.
- [X] T003 Crear `src/utils/productCategories.js` (FR-006).
- [X] T004 Extender `validateProduct` con `category` opcional en `src/hooks/useShoppingList.js` (FR-005).
- [X] T005 Hacer que `tests/helpers/productsServer.js` devuelva `category` (`Otros` por defecto) como la API real.

## Phase 3: User Story 1 - Registrar con categoría (P1) 🎯 MVP

- [X] T006 [US1] Escribir CP-01 a CP-03 y CP-08 en `tests/productCategoriesUi.test.js`.
- [X] T007 [US1] Enviar `category` en `addProduct` (`src/hooks/useShoppingList.js`) (FR-004).
- [X] T008 [US1] Agregar el selector en `src/components/ShoppingForm.jsx` (FR-001).

## Phase 4: User Story 2 - Ver la categoría (P1)

- [X] T009 [US2] Escribir CP-04 y CP-09 en `tests/productCategoriesUi.test.js`.
- [X] T010 [US2] Mostrar `span.product-category` en `src/components/ShoppingItem.jsx` (FR-003).
- [X] T011 [US2] Exigir `category` válida en `isProduct` de `src/services/productsApi.js` (FR-005).

## Phase 5: User Story 3 - Editar la categoría (P2)

- [X] T012 [US3] Escribir CP-05 a CP-07 en `tests/productCategoriesUi.test.js`.
- [X] T013 [US3] Selector precargado en la edición de `src/components/ShoppingItem.jsx` y `category` en `updateProduct` (FR-002, FR-004).

## Phase 6: Polish

- [X] T014 [P] Estilos de selector y etiqueta en `src/App.css`, adaptables a móvil.
- [X] T015 Ampliar con `category` los fixtures de pruebas existentes que comparan la forma exacta, sin eliminar casos (CP-12).
- [X] T016 [P] Documentar en `README.md` y `docs/architecture.md`.
- [X] T017 Ejecutar `npm test`, `npm run build` y `backend/` `npm test`; registrar en `specs/007-categorias-interfaz/validation.md`.

## Dependencies & Execution Order

T001 → T002–T005 → T006–T008 → T009–T011 → T012–T013 → T014–T017. Las tareas sobre el mismo archivo son secuenciales.

## Coverage

| Requisito / Criterio | Tareas |
|---|---|
| FR-001 / CA-01 | T006, T008 |
| FR-002 / CA-02 | T012, T013 |
| FR-003 / CA-03 | T009, T010 |
| FR-004, FR-005 / CA-04 | T004, T007, T009, T011, T013 |
| FR-006 / CA-05 | T002, T003 |
| FR-007 / CA-05 | T005, T015, T017 |
