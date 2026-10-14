---

description: "Lista de tareas de SMARLIST-19 / HU-15 (backend)"
---

# Tasks: SMARLIST-19 / HU-15 — Categorías de productos (backend)

**Input**: `specs/006-categorias-productos/` (spec, plan, research, data-model, contracts, quickstart).

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/products.openapi.yaml.

**Tests**: Requeridos por CA-08 y la subtarea "Pruebas unitarias e integración con MySQL". Se escriben antes del código. [MYSQL REAL] = suite opt-in no ejecutada en esta entrega.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Verificar rama `feature/SMARLIST-19-hu-15-categorias-productos` desde `main`, árbol limpio y línea base (`npm test` en `backend/`, `npm test` y `npm run build` en la raíz).
- [X] T002 Revisar `backend/src/services/productService.js`, `backend/src/repositories/productRepository.js`, `backend/src/config/initializeDatabase.js` y las pruebas que fijan la forma del producto.

---

## Phase 2: Foundational

- [X] T003 [P] Escribir pruebas de la lista fija (CP-07) en `backend/tests/productCategories.test.js`.
- [X] T004 Crear `backend/src/services/productCategories.js` con `PRODUCT_CATEGORIES`, `DEFAULT_PRODUCT_CATEGORY` e `isValidProductCategory` (FR-002).
- [X] T005 Agregar `category VARCHAR(30) NOT NULL DEFAULT 'Otros'` en `backend/database/schema.sql` y crear `backend/database/add-product-category.sql` (FR-001).

**Checkpoint**: Lista y esquema definidos.

---

## Phase 3: User Story 1 - Registrar y editar con categoría (Priority: P1) 🎯 MVP

**Independent Test**: POST con `Lácteos` → 201; PUT con `Bebidas` → 200; PUT sin categoría conserva; GET devuelve la categoría.

### Tests for User Story 1

- [X] T006 [US1] Escribir CP-01 a CP-04 y CP-06 en `backend/tests/productCategories.test.js`.
- [X] T007 [US1] Ampliar con `category` las aserciones de forma de `backend/tests/{products,productService,productRepository,productRegistration,productEditing,productDeletion}.test.js`, sin eliminar casos (CP-12).

### Implementation for User Story 1

- [X] T008 [US1] Leer, insertar y actualizar `category` con parámetros en `backend/src/repositories/productRepository.js`; PUT sin categoría usa la actual dentro de la transacción (FR-003, FR-004, FR-008).
- [X] T009 [US1] Aceptar `category` opcional, aplicar `Otros` al crear y devolver `category` en GET/POST/PUT en `backend/src/services/productService.js` (FR-003, FR-004, FR-007).

**Checkpoint**: US1 funcional con pruebas aisladas.

---

## Phase 4: User Story 2 - Rechazar categorías no válidas (Priority: P2)

### Tests for User Story 2

- [X] T010 [US2] Escribir CP-05 (POST y PUT, 400 sin SQL) en `backend/tests/productCategories.test.js`.

### Implementation for User Story 2

- [X] T011 [US2] Validar `category` exacta y claves permitidas en `validateProductData` de `backend/src/services/productService.js` (FR-005).

---

## Phase 5: User Story 3 - Existentes en "Otros" (Priority: P3)

### Tests for User Story 3

- [X] T012 [US3] Escribir CP-08 a CP-11 en `backend/tests/initializeDatabase.test.js`, conservando los casos existentes.

### Implementation for User Story 3

- [X] T013 [US3] Detectar tabla legado/actual, ejecutar `add-product-category.sql` y reverificar en `backend/src/config/initializeDatabase.js`; reportar `categoryAdded` (FR-006).

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T014 [P] Actualizar las suites MySQL existentes con `category` y crear `backend/tests/productCategories.mysql.test.js` (CP-13) [MYSQL REAL].
- [X] T015 [P] Documentar HU-15 en `README.md` y `docs/architecture.md`.
- [X] T016 Ejecutar `npm test` en `backend/` y `npm test`/`npm run build` en la raíz; confirmar sin cambios en `src/` del frontend.
- [X] T017 Registrar resultados, cobertura y limitaciones en `specs/006-categorias-productos/validation.md`.

---

## Dependencies & Execution Order

- T001–T002 → T003–T005 → T006–T009 → T010–T011 → T012–T013 → T014–T017.
- T008/T009/T011 editan el servicio o repositorio: secuenciales.
- US2 depende de la validación de US1 (mismo archivo); US3 depende solo de T005.

### Parallel Opportunities

- T003 y T005; T014 y T015.

## Implementation Strategy

1. Lista y esquema. 2. US1 (MVP API). 3. US2. 4. US3 (migración). 5. Documentación y validación.

## Coverage

| Requisito / Criterio | Tareas |
|---|---|
| FR-001 / CA-01 | T005, T012, T013 |
| FR-002 / CA-02 | T003, T004 |
| FR-003, FR-004 / CA-03 | T006, T008, T009 |
| FR-005 / CA-04 | T010, T011 |
| FR-006 / CA-05 | T012, T013 |
| FR-007 | T006, T007, T009 |
| FR-008 / CA-08 | T007, T014, T016 |
| CA-06, CA-07 | Diferidos (SMARLIST-15) |
| SC-001 a SC-004 | T006, T010, T012, T016, T017 |
