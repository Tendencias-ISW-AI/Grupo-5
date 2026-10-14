# Tasks: SMARLIST-13 / HU-12

**Input**: spec,plan,research,data-model,contrato y quickstart del directorio activo.
**Tests**: Obligatorios antes del código. [MYSQL REAL] identifica dependencias del entorno.

## Phase 1: Setup

- [X] T001 Verificar rama, secreto excluido, esquema InnoDB existente y ausencia de triggers mediante backend/src/config/database.js, sin DDL [MYSQL REAL].
- [X] T002 Verificar contratos, dependencias y regresiones en backend/tests/products.test.js, productRegistration.test.js y frontend tests/shoppingList.test.js; conservar specs/001 y002.

## Phase 2: Foundational

- [X] T003 Crear pruebas aisladas antes del código en backend/tests/productEditing.test.js para transacción,ID,validación,modelo,HTTP,errores y mismos valores.
- [X] T004 Extraer validación de nombre/cantidad en backend/src/services/productService.js: string UTF-8 válido trim no vacío máximo150 Unicode y number entero1..2147483647 sin coerción; reutilizar en POST/PUT conservando mensajes y contrato.

## Phase 3: US1 — Edición consistente (P1)

**Goal**:200 con identidad/estado preservados y solo producto seleccionado modificado.
**Independent Test**: Ambos estados,mismos valores,SQL parametrizado y GET/persistencia.

- [X] T005 [US1] Implementar updateProductById en backend/src/repositories/productRepository.js: conexión única,begin,SELECT porID FOR UPDATE,UPDATE solo name/quantity,commit y retorno reconstruido; no depender de affectedRows.
- [X] T006 [US1] Implementar updateProduct en backend/src/services/productService.js con ID string bien formado1..36 unidadesUTF-16 sin espacios externos, validación compartida y conservación id/purchased; sin UUID nuevo.
- [X] T007 [US1] Agregar controlador200 en backend/src/controllers/productController.js y ruta PUT/:id en backend/src/routes/productRoutes.js.
- [X] T008 [US1] Crear y ejecutar backend/tests/productEditing.mysql.test.js: POST/PUT/GET reales,ambos estados,duplicados,mismos valores,otros registros intactos y reinicio del servidor; retirar soloIDs propios [MYSQL REAL].

## Phase 4: US2 — Rechazo y errores (P2)

**Goal**:400 antes deSQL,404 por ausencia real,503 seguro sin modificar colección.
**Independent Test**: Matriz inválida,ID inexistente,falla conexión/rollback y datos intactos.

- [X] T009 [US2] Aplicar errores400/404/503 reutilizados en backend/src/services/productService.js y rollback/release/destroy en backend/src/repositories/productRepository.js; sin ocultar error original.
- [X] T010 [US2] Verificar escenarios inválidos/inexistentes y persistencia sin cambios con backend/tests/productEditing.test.js y productEditing.mysql.test.js [MYSQL REAL para segunda suite].

## Phase 5: Polish & Cross-Cutting

- [X] T011 Adaptar únicamente exports de mocks existentes si es necesario en backend/tests/productService.test.js y products.test.js, sin reducir cobertura GET/POST.
- [X] T012 Actualizar README.md y docs/architecture.md con PUT,límites,errores y consistencia; no modificar artefactos anteriores.
- [X] T013 Ejecutar npm test y npm run test:mysql del backend, documentando resultados en specs/003-edicion-productos/validation.md [MYSQL REAL para integración].
- [X] T014 Ejecutar npm test y npm run build en raíz, comprobar111 casos/frontend intacto y registrar en specs/003-edicion-productos/validation.md.
- [X] T015 Verificar backend/src/server.js y HTTP real GET/POST/PUT,400/404,limpieza propia y git diff/status; completar evidencia en specs/003-edicion-productos/validation.md [MYSQL REAL].

## Dependencies & Execution Order

T001–T002→T003–T004→T005–T008→T009–T010→T011–T015. T003 cubre pruebas de ambos escenarios antes del código. T008/T010 comparten suite sin duplicación. Cambios del mismo archivo secuenciales; pruebas reales serializadas por configuración existente.

## Parallel examples

Lecturas de contratos y pruebas T002 independientes; regresiones backend aislado/frontend/build pueden ejecutarse juntas tras implementar. No paralelizar suites MySQL que comparan snapshots.

## Implementation Strategy

Validar entorno, escribir pruebas y comprobar fallos,extraer reglas,implementar transacción/servicio/HTTP,validar rechazos,regresión/documentación y evidencia final. No publicaciones ni commits. Marcar[X] solo tras ejecución.

## Coverage

FR001/006:T003/T007/T008/T015;FR002:T003/T004/T010;FR003:T003/T006/T009;FR004:T005/T006/T008;FR005:T003/T005/T009/T010;FR007:T003/T009/T010;FR008:T001/T002/T008/T011–T015. SC001–004:T008/T010/T013–T015. CA01–07 completos.


