# Validation — SMARLIST-12 / HU-11 y mantenimiento del título

Fecha: 2026-10-13. Rama verificada al inicio y al cierre: feature/SMARLIST-12-hu-11-registro-de-productos. Estado inicial limpio. Sin commits, push, merge o ramas nuevas.

## A. HU-11 — Registro persistente

### Flujo SDD real

Habilidades oficiales instaladas ejecutadas en orden, bajo autorización completa del usuario. No se ejecutaron comandos ficticios ni se duplicó la especificación de HU-09.

1. Specify: plantilla oficial resuelta con specify preset resolve spec-template; copiada y completada en specs/002-registro-productos/spec.md. Numeración secuencial002 conforme a init-options.json. Ruta activa persistida en .specify/feature.json; directorio y rama independientes. Checklist16/16.
2. Clarify: check-prerequisites.sh --json --paths-only; decisiones ya aprobadas incorporadas en Clarifications. Cero preguntas necesarias. Cobertura de alcance, datos, errores, integración, límites, terminología y finalización clara; rendimiento sin objetivos adicionales. Checklist16/16→16/16, sin regresiones ni pendientes.
3. Plan: setup-plan.sh --json y plantilla oficial; plan, research, modelo, contrato OpenAPI y quickstart. Investigación delegada de documentación primaria Node/MySQL/mysql2 conforme a la habilidad; Constitution verificada antes y después del diseño.
4. Tasks: setup-tasks.sh --json y plantilla oficial;17 tareas por dependencias, escenarios US1/US2 y mantenimiento separado. Pruebas antes del código, tareas MySQL real identificadas.
5. Analyze: check-prerequisites.sh --json --require-spec --require-tasks --include-tasks; análisis de solo lectura. Resultado sin conflictos bloqueantes o con Constitution.
6. Implement: check-prerequisites.sh --json --require-tasks --include-tasks; checklist PASS16/16, ejecución de tareas, pruebas, documentación y evidencia. Todas las tareas completadas.

No existen hooks de extensión. Constitution v1.0.0, AGENTS.md y documentos SDD de HU-09 conservados. La modificación del frontend está autorizada expresamente como mantenimiento independiente; no integra React con la API.

### Análisis y trazabilidad

| Requisito | Tareas | Criterios/resultado |
|---|---|---|
| FR001/005 | T003/T007/T009/T017 | CA01/02/06: POST201 producto JSON |
| FR002/003/006 | T003/T006/T010–T012 | CA03/04/07: validación, UUID, pendiente y400 sin INSERT |
| FR004/008 | T005/T008/T009/T012 | CA05 y compatibilidad GET/persistencia |
| FR007 | T010/T011 | Errores seguros HU-09 |
| FR009 | T001/T004/T013–T017 | Alcance, esquema y mantenimiento separado |
| SC001–004 | T009/T012/T015/T017 | Integridad, rechazo, duplicados y errores |

Analyze:9 FR,4 SC,17 tareas, cobertura100%;0 tareas sin correspondencia;0 ambigüedades bloqueantes;0 duplicaciones relevantes;0 conflictos críticos o constitucionales. Decisión menor documentada: contrato estricto name/quantity, UTF-8 válido y límites del esquema. Mantenimiento del título no se atribuye a un CA de HU-11.

### Implementación

Se reutilizan productRoutes, productController, productService y productRepository. Servicio valida primero, aplica trim, comprueba name string UTF-8 bien formado de1..150 caracteres Unicode y quantity number entero1..2147483647. Rechaza cuerpo no objeto, campos faltantes/desconocidos y cualquier intento de imponer id/purchased. randomUUID genera UUIDv4 y purchased=false.

INSERT estático con cuatro parámetros, comprado0; comprobar affectedRows=1 antes de201. No hay interpolación de datos ni reintento automático. Se comparte clasificación de almacenamiento mediante helper local, preservando503/500. JSON malformado responde400 genérico sin eco del payload. GET conserva consulta, orden y cuatro campos; solo su comprobación de longitud cuenta caracteres Unicode como VARCHAR para recuperar los nombres válidos de POST.

### CA-01 a CA-07

| Criterio | Estado | Evidencia |
|---|---|---|
| CA01 POST /api/products | Cumplido | Pruebas HTTP aisladas y reales |
| CA02 nombre y cantidad | Cumplido | Registro y validaciones |
| CA03 rechazar nombres vacíos/cantidad no entera positiva | Cumplido | Matriz inválida y ausencia de SQL |
| CA04 ID único y estado pendiente | Cumplido | UUIDv4, duplicados independientes, false |
| CA05 guardar en MySQL | Cumplido | SQL real y reconexión |
| CA06 HTTP201 producto creado | Cumplido | HTTP real y JSON exacto |
| CA07 HTTP400 sin insertar inválidos | Cumplido | Spy SQL y snapshots MySQL |

### Pruebas backend y HTTP real

| Ejecución | Resultado |
|---|---|
| backend/npm test |85 aprobadas;24 MySQL omitidas intencionalmente |
| backend/npm run test:mysql |24 aprobadas, suites HU-09/HU-11 secuenciales |
| Total backend distinto |109 aprobadas,0 fallidas |
| Nuevos casos HU-11 |35 aislados y15 MySQL reales |
| npm start y GET /health |200,{"status":"ok"} |
| GET /api/products |200 arreglo, contrato conservado |
| POST válido HTTP real |201 producto normalizado con UUID y false |
| POST inválido HTTP real |400, sin registro adicional |
| Recuperación posterior por GET |Producto exacto y datos anteriores conservados |

Las35 pruebas nuevas fallaron antes de implementar POST/módulos y después pasaron; se conservaron todas las pruebas anteriores. La prueba histórica que prohibía POST mantiene su caso con nueva expectativa400 para cuerpo inválido; PUT/PATCH/DELETE continúan404. Mocks existentes exponen insertProduct para la nueva dependencia sin alterar verificaciones GET.

Las15 pruebas reales de HU-11 verifican POST/GET sobre servidor TCP local, normalización, duplicados, límites INT/VARCHAR Unicode, reconexión,10 solicitudes inválidas sin modificaciones y fallo real de conexión mediante puerto temporal sin servicio. Este último devuelve503 y /health200; restaurar configuración permite consultar sin cambios. No se modificó .env ni se detuvo MySQL.

Se ejecutó adicionalmente npm start en3000 y se verificaron /health, POST201, POST400 y GET recuperable. Fixture de nombre exclusivo y UUID generado retirado mediante DELETE parametrizado únicamente por su ID/nombre. Comparación final confirma colección previa restaurada. Servidor temporal detenido al terminar.

### MySQL y seguridad

MySQL local8.0.41, smartlist_db.products existente y compatible. Preflight de solo lectura verificó cuatro columnas y0 registros iniciales. No se ejecutó DDL ni se modificaron esquema u otras bases. Suites reales crean nombres con marca única por ejecución, limpian solo IDs asociados a esa marca y comparan colección inicial/final. Los datos ajenos quedan intactos y no se dejan fixtures temporales.

Credenciales exclusivamente en backend/.env ignorado por Git; no se imprimieron. Sin dependencias nuevas, edición, eliminación o marcado API, autenticación, integración React–API o cambios de localStorage. Sin bloqueos pendientes. Reintentar POST puede crear otro registro; no se implementa idempotencia, documentada fuera de alcance.

## B. Corrección puntual del frontend

Únicamente src/App.jsx: <h1>🛒 SmartList</h1> → <h1>SmartList</h1>. Se conserva h1 semántico y todo el componente restante. Sin cambios de estilos, formularios, filtros, resumen, hooks, localStorage, configuración, dependencias o tests del frontend.

| Ejecución | Resultado |
|---|---|
| raíz/npm test |111 aprobadas de111;0 fallidas |
| raíz/npm run build |Aprobado;36 módulos transformados |

Los dos fallos históricos del título quedan resueltos sin modificar expectativas. Se verificó diff de una línea en React. No se realizó comprobación visual en navegador; mantenimiento validado por suite existente, build y revisión del cambio.

## Archivos y revisión final

Modificados: README.md; docs/architecture.md; backend/src/routes/productRoutes.js; backend/src/controllers/productController.js; backend/src/services/productService.js; backend/src/repositories/productRepository.js; backend/src/middleware/errorHandler.js; backend/tests/products.test.js; backend/tests/productService.test.js; backend/vitest.mysql.config.js; src/App.jsx.

Creados: backend/tests/productRegistration.test.js; backend/tests/productRegistration.mysql.test.js; specs/002-registro-productos/spec.md; checklists/requirements.md; plan.md; research.md; data-model.md; contracts/products.openapi.yaml; quickstart.md; tasks.md; validation.md. Ruta activa local .specify/feature.json actualizada por Specify según su flujo instalado.

git diff --check sin errores. Frontend: únicamente src/App.jsx modificado; tests y archivos de dependencias intactos. HU-09 SDD, Constitution, esquema, configuración MySQL y secretos sin cambios versionables.
