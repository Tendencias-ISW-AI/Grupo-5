# Tasks: HU-09 — Consultar productos

**Input**: spec.md, plan.md, research.md, data-model.md y contracts/ del directorio activo specs/001-consultar-productos.
**Tests**: Obligatorios por solicitud y Constitution. Escribir y ejecutar antes de su implementación.
**Organization**: US1 consulta (P1), US2 indisponibilidad/recuperación (P2). [MYSQL REAL] distingue validación dependiente del entorno; el resto es aislado.

## Phase 1: Setup

- [X] T001 Verificar rama, secreto local excluido y configuración existente en backend/src/config/database.js y backend/.env.example [MYSQL REAL para conexión/versionado].
- [X] T002 Verificar ignores y conservar pruebas/dependencias existentes en .gitignore y backend/package.json, sin instalaciones nuevas.

## Phase 2: Foundational

- [X] T003 Crear pruebas aisladas de versión, incompatibilidades e idempotencia en backend/tests/initializeDatabase.test.js; ejecutar antes del inicializador.
- [X] T004 Definir backend/database/schema.sql: id VARCHAR(36) clave primaria obligatorio no vacío; name VARCHAR(150) obligatorio no vacío ni únicamente espacios; quantity INT obligatorio entero positivo; purchased BOOLEAN obligatorio FALSE predeterminado únicamente 0 o 1; sin atributos adicionales.
- [X] T005 Implementar inspección previa no destructiva en backend/src/config/initializeDatabase.js y ejecución explícita en backend/database/initialize.js, verificar MySQL >= 8.0.16 y CHECK enforced; agregar db:init en backend/package.json.
- [X] T006 Ejecutar backend/database/initialize.js: comprobar existencia/compatibilidad y crear solamente smartlist_db/products faltantes; comprobar segundo inicio sin cambios [MYSQL REAL].

## Phase 3: US1 — Consulta completa (P1, MVP)

**Goal**: Arreglo JSON correcto, vacío o con todos los registros, orden determinista, sin modificar datos.
**Independent Test**: GET /api/products 200; modelos exactos, duplicados independientes, SELECT sin escrituras y persistencia real.

- [X] T007 [P] [US1] Crear pruebas del SQL de solo lectura y orden binario en backend/tests/productRepository.test.js y ejecutarlas antes del repositorio.
- [X] T008 [P] [US1] Crear pruebas HTTP/servicio de colección vacía, tipos, múltiples registros y nombres repetidos en backend/tests/products.test.js y backend/tests/productService.test.js; ejecutar antes del código.
- [X] T009 [US1] Implementar SELECT de cuatro columnas ORDER BY BINARY id ASC en backend/src/repositories/productRepository.js, reutilizando getPool.
- [X] T010 [US1] Implementar coordinación y modelo validado en backend/src/services/productService.js: id string no vacío máximo 36; name string no vacío máximo 150; quantity número entero positivo; purchased exclusivamente 0/1 convertido a booleano; no mutar filas.
- [X] T011 [US1] Implementar backend/src/controllers/productController.js y backend/src/routes/productRoutes.js para GET /api/products 200 arreglo directo.
- [X] T012 [US1] Integrar ruta en backend/src/app.js sin modificar /health, CORS, JSON ni comportamiento de rutas inexistentes.
- [X] T013 [US1] Crear y ejecutar pruebas reales en backend/tests/products.mysql.test.js: integridad, orden, tres consultas, no modificaciones, reconexión/persistencia y CHECK; fixtures con IDs exclusivos y limpieza propia; agregar test:mysql en backend/package.json [MYSQL REAL].

## Phase 4: US2 — Indisponibilidad y recuperación (P2)

**Goal**: 503 exacto sin detalles sensibles y siguiente consulta correcta cuando se recupera conexión.
**Independent Test**: Fallo simulado, respuesta pública genérica, recuperación y /health independiente.

- [X] T014 [US2] Agregar pruebas de errores de conexión, ausencia de secretos, error inesperado 500 y recuperación en backend/tests/products.test.js y backend/tests/productService.test.js antes de implementar.
- [X] T015 [US2] Clasificar errores conocidos del almacenamiento en backend/src/services/productService.js y responder 503 {"error":"Servicio temporalmente no disponible"} desde backend/src/middleware/errorHandler.js, conservando los demás contratos.

## Phase 5: Polish & Cross-Cutting

- [X] T016 Documentar inicialización, configuración, contrato y alcance en README.md y docs/architecture.md sin modificar frontend ni historias anteriores.
- [X] T017 Ejecutar npm test del backend, npm test y npm run build de raíz; registrar evidencia y fallos históricos en specs/001-consultar-productos/validation.md.
- [X] T018 Iniciar backend/src/server.js mediante npm start, consultar /health y /api/products, reiniciar y comparar respuesta; revisar scope/secretos/git diff y documentar resultados en specs/001-consultar-productos/validation.md [MYSQL REAL].

## Dependencies & Execution Order

Setup T001–T002 → Foundational T003–T006 → US1 T007–T013 → US2 T014–T015 → cierre T016–T018. Pruebas antes del código; no iniciar endpoint antes de validar infraestructura. US2 reutiliza consulta US1 pero se verifica independientemente con mocks. T007/T008 pueden prepararse en paralelo en archivos diferentes; ejecución de MySQL y modificaciones del mismo archivo secuenciales.

## Parallel examples

US1: pruebas de repositorio T007 y contrato/servicio T008 son independientes. US2: verificar matrices de fallos de servicio y contrato HTTP en archivos distintos después de definir el contrato común. No se requiere trabajo paralelo ni nuevas capas.

## Implementation Strategy

Completar infraestructura y consulta MVP; validar US1; incorporar manejo de indisponibilidad y validar US2; terminar regresión y evidencia real. No publicar, desplegar ni realizar commits automáticamente. Tareas completas se marcan [X] solo tras ejecución y evidencia.

## Requirements coverage

FR-001/003/004/005/006: T007–T013. FR-002: T004/T008/T010/T013. FR-007: T013/T018. FR-008: T014/T015. FR-009: T003/T007/T008/T013/T014/T017. FR-010: T001/T003–T006. FR-011: T002/T012/T016–T018. FR-012: T008/T011/T014/T015. SC-001–006: T013/T017/T018 y T014/T015 para errores/recuperación.



