# Tasks: SMARLIST-14 / HU-13

**Input**:spec,plan,research,data-model,contrato,quickstart.
**Tests**:Requeridos antes decódigo. [MYSQL REAL] distingue entorno local.

## Phase 1: Setup

- [X] T001 Verificar rama,configuración local,snapshot de esquema/PK/autocommit ydatos previos mediante backend/src/config/database.js,sinDDL [MYSQL REAL].
- [X] T002 Revisar validaciones yregresiones GET/POST/PUT en backend/src/services/productService.js y backend/tests/;preservar frontend/especificaciones anteriores.

## Phase 2: Foundational

- [X] T003 Crear pruebas antes decódigo en backend/tests/productDeletion.test.js:UUID,SQL,parametrización,204 vacío,404/503/500 yCP01–19 aplicables.
- [X] T004 Extraer validación básicaID compartida dePUT en backend/src/services/productService.js sin cambiar lógica/mensaje;añadir formatoUUID8-4-4-4-12 soloDELETE.

## Phase 3: US1 — Eliminación física (P1)

**Goal**:204 sin cuerpo,soloUUIDseleccionado,ausencia persistente.
**Independent Test**: Pendiente/comprado,duplicados,SQLWHEREID yGET/reinicio con otros intactos.

- [X] T005 [US1] Implementar deleteProductById en backend/src/repositories/productRepository.js,DELETE FROM products WHERE id = ? yretornoaffectedRows;sinconsulta previa.
- [X] T006 [US1] Implementar deleteProduct en backend/src/services/productService.js:validarUUIDantes deSQL,coordinar yconservar contratoserrores existentes.
- [X] T007 [US1] Agregar controlador204.end() en backend/src/controllers/productController.js yrutaDELETE/:id en backend/src/routes/productRoutes.js.
- [X] T008 [US1] Crear/ejecutar backend/tests/productDeletion.mysql.test.js con fixturespropios,ambos estados,duplicados,GETausencia,otros atributosintactos ypersistencia trasreinicio [MYSQL REAL].

## Phase 4: US2 — Inexistencia/errores (P2)

**Goal**:0filas404,IDinválido400sinSQL,indisponible503seguro.
**Independent Test**: SegundoDELETE404,UUIDinexistente,errores sin secretos yninguna eliminación ajena.

- [X] T009 [US2] Aplicar0→404,1→éxito,resultadoinesperado500 yclasificación503 existente en backend/src/services/productService.js,sin alterarGET/POST/PUT.
- [X] T010 [US2] VerificarCP05/06/12/13/14/16 en backend/tests/productDeletion.test.js yproductDeletion.mysql.test.js,soloUUIDpropios [MYSQL REAL para segunda suite].

## Phase 5: Polish & Cross-Cutting

- [X] T011 Actualizar README.md ydocs/architecture.md con DELETEfísico,UUID,errorres yalcance;sin modificarSDDprevio.
- [X] T012 Ejecutar backend/npm test y npm run test:mysql,regresionesGET/POST/PUT,integridad/limpieza y registrar en specs/004-eliminacion-productos/validation.md [MYSQL REAL para integración].
- [X] T013 Ejecutar npm test/npm run build en raíz ycomprobar111casos/frontendintacto;registrar en specs/004-eliminacion-productos/validation.md.
- [X] T014 Iniciar backend/src/server.js,verificarHTTP GET/POST/PUT/DELETE/204/400/404/503,retiroexclusivo defixtures yschema/tabla/datosprevios;revisarGit ycompletar specs/004-eliminacion-productos/validation.md [MYSQL REAL].

## Dependencies & Execution Order

T001–T002→T003–T004→T005–T008→T009–T010→T011–T014. PruebasUS1/US2 preparadasT003antesdecódigo;T008/T010 comparten suite. Cambiosmismoarchivo secuenciales yMySQL serializado.

## Parallel examples

Lecturas decontratos/pruebas independientes;regresiónbackendaislado/frontend/build puede coexistir. No paralelizar suitesMySQL con snapshots.

## Implementation Strategy

Preflightlectura,pruebasque fallen,implementación mínima porcapas,pruebasreales yregresiones,documentación/evidencia. No publicaciones/commits. Marcar[X] con evidencia.

## Coverage

FR001/004:T003/T007/T008/T014;FR002:T003/T004/T006/T010;FR003:T005/T008;FR005:T003/T009/T010;FR006:T008/T012/T014;FR007:T009/T010;FR008:T001/T002/T011–T014. SC001–004:T008/T010/T012–T014. CP01–04:T003/T008;CP05/06/12/13/14/16:T003/T010;CP07/08/09/10/11/18/19:T008/T012/T014;CP15:T012/T014;CP17:T003/T005. CA01–06 completos.


