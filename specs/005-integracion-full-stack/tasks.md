# Tasks: SMARLIST-15 / HU-14

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md.
**Tests**: obligatorias. Organización por US1 PATCH y US2 integración; sin commits automáticos.

## Phase 1: Setup
- [x] T001 Verificar rama, instrucciones y contratos existentes en backend/src/routes/productRoutes.js y .specify/memory/constitution.md.
- [x] T002 Verificar MySQL local, baseline y esquema desde backend/src/config/database.js sin exponer backend/.env.

## Phase 2: Foundational
- [x] T003 Revisar contrato y controles de seguridad en specs/005-integracion-full-stack/contracts/openapi.yaml; completar Analyze antes de código.

## Phase 3: US1 — PATCH (P1, MVP)
**Goal**: actualización segura e idempotente exclusivamente de purchased.
**Independent Test**: HTTP 200/400/404/503, SQL parametrizado y persistencia sin alterar otros registros.
- [x] T004 [P] [US1] Crear pruebas aisladas antes de implementación en backend/tests/productStatus.test.js.
- [x] T005 [P] [US1] Crear pruebas MySQL propias y limpieza limitada en backend/tests/productStatus.mysql.test.js.
- [x] T006 [US1] Compartir validación UUID DELETE y exigir purchased estrictamente booleano, sin campos adicionales, en backend/src/services/productService.js.
- [x] T007 [US1] Compartir transacción PUT y actualizar solo purchased con WHERE id parametrizado en backend/src/repositories/productRepository.js.
- [x] T008 [US1] Conectar PATCH 200 y errores seguros en backend/src/controllers/productController.js y backend/src/routes/productRoutes.js.
- [x] T009 [US1] Ejecutar suites aisladas/MySQL y regresiones GET/POST/PUT/DELETE; registrar evidencia en specs/005-integracion-full-stack/validation.md.

## Phase 4: US2 — React/API (P2)
**Goal**: operaciones confirmadas por API, filtros/resumen completos y recuperación MySQL sin uso activo de localStorage.
**Independent Test**: servidor simulado y recorrido real de los cinco endpoints; fallos no se muestran guardados.
- [x] T010 [P] [US2] Crear pruebas HTTP y respuestas inválidas en tests/productsApi.test.js y servidor simulado en tests/helpers/productsServer.js.
- [x] T011 [US2] Crear src/services/productsApi.js con fetch, DELETE 204 sin JSON, URL pública y validación de respuestas; añadir .env.example.
- [x] T012 [US2] Adaptar carga cancelable, cola de escrituras y estado confirmado en src/hooks/useShoppingList.js; eliminar imports/efectos localStorage y UUID cliente. Nombre entre 1 y 150 caracteres Unicode; cantidad entero entre 1 y 2147483647.
- [x] T013 [US2] Esperar registro/edición, conservar borradores al fallar y controlar actividad en src/components/ShoppingForm.jsx y ShoppingItem.jsx; propagar controles en ShoppingList.jsx.
- [x] T014 [US2] Diferenciar carga/error/vacío, preservar filtros/resumen y estilos mínimos en src/App.jsx y src/App.css.
- [x] T015 [US2] Adaptar los 111 casos sin reducir cobertura en tests/shoppingList.test.js a API y preservación de datos locales históricos.
- [x] T016 [US2] Añadir pruebas de red, fallos, concurrencia, carga obsoleta, StrictMode y ausencia de migración/escrituras en tests/fullStack.test.js.
- [x] T017 [US2] Ejecutar frontend y build; registrar resultados reales en specs/005-integracion-full-stack/validation.md.

## Phase 5: Polish & Cross-Cutting
- [x] T018 Documentar PATCH, ejecución API y política de persistencia en README.md y docs/architecture.md.
- [x] T019 Ejecutar quickstart, HTTP real, navegador escritorio/móvil/teclado si disponible y retirar solo fixtures propios; registrar evidencia en specs/005-integracion-full-stack/validation.md.
- [x] T020 Ejecutar regresión final frontend/backend/MySQL, revisar git diff, esquema/datos intactos y tareas en specs/005-integracion-full-stack/validation.md.

## Dependencies & Execution Order
T001→T002→T003. US1 T004/T005 pueden prepararse independientemente; T006–T008 dependen de pruebas y T009 de implementación. US2 inicia tras T009: T010→T011→T012→T013→T014→T015/T016→T017. T018–T020 requieren ambas historias.

## Parallel Examples
US1: preparar pruebas aisladas T004 y MySQL T005 en archivos separados. US2: revisión de casos T015 y nuevos escenarios T016 tras completar el código. No ejecutar simultáneamente suites MySQL que compartan baseline.

## Implementation Strategy
MVP PATCH primero, validar antes de React. Después integración incremental carga→registro→edición→estado→eliminación, pruebas completas y documentación. Sin nuevas dependencias ni cambios de esquema/rama.

