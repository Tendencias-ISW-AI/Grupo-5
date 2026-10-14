# Tasks: SMARLIST-12 / HU-11

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/products.openapi.yaml.
**Tests**: Requeridos, antes del código. [MYSQL REAL] requiere entorno local; demás tareas no requieren MySQL.

## Phase 1: Setup

- [X] T001 Verificar rama, ignores y estado MySQL/schema existente sin DDL en backend/src/config/database.js y backend/database/schema.sql [MYSQL REAL].
- [X] T002 Verificar contrato y regresiones existentes en backend/tests/products.test.js y tests/shoppingList.test.js; mantener specs/001-consultar-productos intacto.

## Phase 2: Foundational

- [X] T003 Crear fixtures de entradas válidas/inválidas y pruebas antes del código en backend/tests/productRegistration.test.js para contrato HTTP, servicio e INSERT.
- [X] T004 Preparar ejecución real secuencial en backend/vitest.mysql.config.js, sin nuevas dependencias.

## Phase 3: US1 — Registro persistente (P1, MVP)

**Goal**: Crear producto pendiente y recuperarlo conservando datos existentes.
**Independent Test**: POST201 de modelo exacto, UUID distintos, INSERT parametrizado y GET compatible.

- [X] T005 [US1] Agregar insertProduct en backend/src/repositories/productRepository.js con INSERT de cuatro columnas y parámetros separados.
- [X] T006 [US1] Agregar createProduct en backend/src/services/productService.js: name string trim no vacío UTF-8 válido máximo150 caracteres Unicode; quantity number entero1..2147483647 sin coerción; id UUID generado y purchased=false, prohibidos al cliente.
- [X] T007 [US1] Agregar controlador201 en backend/src/controllers/productController.js y POST en backend/src/routes/productRoutes.js, conservando GET.
- [X] T008 [US1] Ajustar únicamente longitud Unicode del nombre recuperado en backend/src/services/productService.js y mocks/expectativa POST histórica en backend/tests/products.test.js, conservando verificaciones GET y prohibición PUT/PATCH/DELETE.
- [X] T009 [US1] Crear y ejecutar backend/tests/productRegistration.mysql.test.js: POST/GET real, UUID, duplicados, normalización, reconexión, límites y conservación de colección previa; fixtures propios limpiados exclusivamente por ID [MYSQL REAL].

## Phase 4: US2 — Validación y errores (P2)

**Goal**: Ninguna inserción inválida; errores400/503/500 seguros.
**Independent Test**: Matriz inválida no invoca INSERT; fallo/recovery de escritura tiene contrato HU-09.

- [X] T010 [US2] Verificar casos inválidos, error MySQL, respuesta sin secretos y recuperación en backend/tests/productRegistration.test.js antes de implementar.
- [X] T011 [US2] Reutilizar clasificación de almacenamiento en backend/src/services/productService.js y respuesta pública400; sanitizar JSON malformado en backend/src/middleware/errorHandler.js sin modificar contratos503/500.
- [X] T012 [US2] Verificar mediante backend/tests/productRegistration.mysql.test.js ausencia de inserción inválida y preservación de datos existentes [MYSQL REAL].

## Phase 5: Mantenimiento separado del frontend

- [X] T013 Cambiar solo texto del h1 de src/App.jsx: SmartList; no modificar tests/shoppingList.test.js, estilos o funcionalidad.

## Phase 6: Polish & Cross-Cutting

- [X] T014 Actualizar README.md y docs/architecture.md con registro HU-11, límites y pruebas; no modificar especificación HU-09.
- [X] T015 Ejecutar backend npm test y npm run test:mysql; registrar resultados reales en specs/002-registro-productos/validation.md [MYSQL REAL para segunda suite].
- [X] T016 Ejecutar npm test y npm run build de raíz; comprobar111 casos conservados y diff de src/App.jsx; registrar mantenimiento por separado en specs/002-registro-productos/validation.md.
- [X] T017 Iniciar backend/src/server.js y verificar HTTP real GET/health, POST válido/inválido y GET recuperable; limpiar solo registros propios, revisar git status/diff y documentar en specs/002-registro-productos/validation.md [MYSQL REAL].

## Dependencies & Execution Order

T001–T002 → T003–T004 → US1 T005–T009 → US2 T010–T012 → mantenimiento T013 → cierre T014–T017. T003 incluye pruebas de ambos escenarios antes de implementación. T009 y T012 comparten suite sin duplicar casos. Modificaciones del mismo archivo secuenciales; ejecución MySQL secuencial por snapshots.

## Parallel examples

Las comprobaciones de lectura de backend y frontend T002 pueden ejecutarse juntas. Después de implementación, pruebas aisladas/backend y frontend/build pueden ejecutarse independientemente; suites que escriben fixtures MySQL se serializan.

## Implementation Strategy

Validar infraestructura sin DDL, escribir pruebas y comprobar fallos previos, implementar registro MVP, cerrar errores, corregir título y ejecutar regresión completa. No realizar commits ni publicar. Marcar tareas[X] tras evidencia.

## Coverage

FR001/005: T003/T007/T009/T017; FR002/003/006: T003/T006/T010–T012; FR004/008: T005/T008/T009/T012; FR007:T010/T011; FR009:T001/T004/T013–T017. SC001–004:T009/T012/T015/T017. CA01–07 cubiertos; mantenimientoT013/T016 independiente.


