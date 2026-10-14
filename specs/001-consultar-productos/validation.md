# Validation — HU-09

Fecha: 2026-10-13. Rama: feature/backend-hu-09-consultar-productos. Directorio activo: specs/001-consultar-productos. Sin cambios de rama, commits, push o merge.

## Flujo SDD ejecutado

Specify existente conservado. Se aplicaron las habilidades reales instaladas speckit-clarify, speckit-plan, speckit-tasks, speckit-analyze y speckit-implement en ese orden, bajo autorización general del usuario.

- Clarify: check-prerequisites.sh --json --paths-only; decisiones aprobadas incorporadas a spec.md y marcadores del checklist actualizados (16/16).
- Plan: setup-plan.sh --json y plantilla oficial; plan.md, research.md, data-model.md, contracts/products.openapi.yaml y quickstart.md generados. Investigación de documentación primaria MySQL; Constitution verificada antes y después del diseño.
- Tasks: setup-tasks.sh --json y plantilla oficial; 18 tareas por dependencias y escenarios US1/US2, incluyendo pruebas y MySQL real.
- Analyze: check-prerequisites.sh --json --require-spec --require-tasks --include-tasks; análisis estrictamente de lectura, sin modificar archivos en esa fase.
- Implement: check-prerequisites.sh --json --require-tasks --include-tasks; gate del checklist PASS; ejecución por fases, pruebas antes del código, tareas completadas y evidencia final.
- No existen hooks de extensión en .specify/extensions.yml. No se generó otra especificación o rama. El identificador interno 001-consultar-productos no sustituye la rama Git existente.

## Resultado de Analyze previo a código

| ID | Categoría | Severidad | Ubicación | Hallazgo | Decisión |
|---|---|---|---|---|---|
| I1 | Notas históricas | LOW | checklists/requirements.md, notas de Specify | Conservan referencias a aclaraciones inicialmente pendientes | Las decisiones vigentes están en spec.md/Clarifications; solo se actualizaron marcadores conforme a Clarify |

| Requisito | Tareas | Cobertura |
|---|---|---|
| FR-001/003/004/005/006 | T007–T013 | Colección, duplicados, vacío, solo lectura y orden |
| FR-002 | T004/T008/T010/T013 | Cuatro atributos y tipos |
| FR-007 | T013/T018 | Persistencia y reinicio |
| FR-008 | T014/T015 | Errores y recuperación |
| FR-009 | T003/T007/T008/T013/T014/T017 | Pruebas |
| FR-010 | T001/T003–T006 | Inicialización segura |
| FR-011 | T002/T012/T016–T018 | Restricciones y regresión |
| FR-012 | T008/T011/T014/T015 | Contrato HTTP |
| SC-001–004 | T013/T018 | Integridad, vacío, tres consultas y reinicio |
| SC-005 | T014/T015/T018 | Fallo controlado y recuperación |
| SC-006 | T002/T006/T017/T018 | Scope, frontend y otras bases |

Métricas: 12 FR y 6 SC con cobertura 100%; 18 tareas; 0 tareas sin correspondencia; 0 ambigüedades bloqueantes, 0 duplicaciones relevantes, 0 conflictos críticos o con Constitution. Una observación LOW histórica sin impacto en la implementación.

## MySQL real

Conexión local comprobada: MySQL 8.0.41. Antes de inicializar no existían smartlist_db ni products. npm run db:init creó ambos y verificó esquema y CHECK enforced. Segunda ejecución: databaseCreated=false, tableCreated=false. Ningún ALTER/DROP/TRUNCATE ni modificación de otras bases.

La tabla tiene exactamente los cuatro campos aprobados. Pruebas reales usan fixtures con UUID propios; se registran únicamente los IDs insertados exitosamente y se eliminan solo esos IDs al cerrar la suite. Intentos inválidos se ejecutan en transacciones con rollback. La colección previa queda restaurada; no se dejan productos de prueba. DB_USER=root se utiliza solo en prácticas, con contraseña local no expuesta ni versionada.

## Pruebas y compilación

| Ejecución | Resultado real |
|---|---|
| backend/: npm test | 50 aprobadas; 9 reales omitidas intencionalmente en esta ejecución aislada |
| backend/: npm run test:mysql | 9 aprobadas con MySQL real |
| Total backend distinto | 59 aprobadas; ninguna fallida |
| raíz: npm test | 109 aprobadas, 2 fallidas, de 111 |
| raíz: npm run build | Aprobado; Vite transformó 36 módulos |

Los dos fallos frontend son preexistentes: tests/shoppingList.test.js:280 espera h1='SmartList', mientras src/App.jsx contiene '🛒 SmartList'. Ambos contenidos se confirmaron en HEAD y no se modificaron. Se conservaron todas las pruebas anteriores. No se presenta la suite frontend como totalmente aprobada.

El aislamiento del entorno bloqueó inicialmente sockets locales de Supertest (EACCES) y realpath de Vite (EPERM). Se repitieron las validaciones con el permiso necesario y obtuvieron los resultados anteriores. Durante desarrollo, las pruebas nuevas fallaron antes de implementar los módulos/contratos correspondientes y después pasaron sin debilitar expectativas.

## HTTP y persistencia

- npm start inició el servidor en puerto 3000; proceso temporal detenido al terminar.
- GET /health: 200, {"status":"ok"}.
- GET /api/products sobre colección realmente vacía: 200, [].
- Suite real: múltiples productos, nombres repetidos, tipos JSON exactos, orden binario, tres GET iguales y comparación de filas SQL antes/después sin modificaciones.
- Suite real: cerrar/reabrir pool y reiniciar dos procesos independientes de src/server.js conserva los mismos registros y atributos.
- Comprobación adicional con un puerto temporal sin MySQL: /api/products responde 503 exacto {"error":"Servicio temporalmente no disponible"}; /health continúa 200. Restaurar la configuración solo en ese proceso temporal permite volver a consultar 200 []. No se detuvo MySQL ni se modificó .env.
- Sin endpoints POST/PUT/PATCH/DELETE de productos; pruebas verifican 404. Importaciones y arranque no crean infraestructura.

## Criterios de aceptación

Consulta completa, modelo compatible, colección vacía exitosa, persistencia, solo lectura, orden determinista, error controlado y verificabilidad: cumplidos con pruebas aisladas y reales. SC-001 a SC-006 satisfechos para HU-09. La regresión global conserva dos fallos históricos de frontend pendientes de su tarea correspondiente.

## Alcance y limitaciones

Frontend, modelo React, localStorage, sus pruebas, configuración y dependencias no se modificaron. No se añadieron dependencias, ORM, autenticación, Docker ni otras historias. No se integró React con la API ni se verificó una nueva interfaz en navegador: esta historia expone únicamente HTTP y se validó a ese nivel.

Clave Jira definitiva pendiente; referencias mantenidas como HU-09. La tabla está preparada y vacía al finalizar. Para uso fuera del ejercicio se recomienda un usuario MySQL con mínimos privilegios. El esquema admite id hasta 36 caracteres y name hasta 150, conforme a los tipos autorizados.

## Archivos

Modificados: README.md, docs/architecture.md, backend/package.json, backend/database/schema.sql, backend/src/app.js, backend/src/middleware/errorHandler.js. Especificación existente aclarada y marcadores de checklists/requirements.md actualizados, conservando el resto.

Creados: backend/database/initialize.js, backend/src/config/initializeDatabase.js, productRoutes.js, productController.js, productService.js, productRepository.js en sus capas; backend/vitest.mysql.config.js; cinco suites de pruebas HU-09. Artefactos nuevos: plan.md, research.md, data-model.md, contracts/products.openapi.yaml, quickstart.md, tasks.md y este informe en el directorio de especificación existente.
