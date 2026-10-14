# Validation — SMARLIST-15 / HU-14

Fecha: 2026-10-14. Rama verificada al inicio y cierre: feature/SMARLIST-15-hu-14-integracion-full-stack. Estado inicial limpio. Sin nuevas ramas, commits, push ni merge.

## Fases SDD reales

Se aplicaron las habilidades oficiales instaladas de Spec Kit 1.0.13, en orden y bajo autorización completa:

- **Specify**: CLI oficial `specify preset resolve spec-template`, copia de plantilla y nueva especificación005. Puntero local feature.json actualizado; no hooks ni creación de rama. Checklist16/16.
- **Clarify**: `check-prerequisites.sh --json --paths-only`; las decisiones aprobadas resuelven PATCH, autoridad API, ausencia de migración, carga/error y concurrencia. Cero preguntas adicionales; checklist16/16.
- **Plan**: `setup-plan.sh --json` con plantilla oficial, investigación delegada de solo lectura según la habilidad; plan, research, data-model, contrato y quickstart. Constitution siete principios PASS antes/después del diseño.
- **Tasks**: `setup-tasks.sh --json`, plantilla oficial y20 tareas por dependencias: US1 PATCH y US2 integración.
- **Analyze**: `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks`, revisión de solo lectura:9FR,4SC,9CA y20tareas. Cero conflictos constitucionales, requisitos sin cobertura, tareas ajenas o ambigüedades bloqueantes. Revisión final mantiene la distinción del ID string de PUT frente al UUID exigido por DELETE/PATCH.
- **Implement**: `check-prerequisites.sh --json --require-tasks --include-tasks`; gate16/16 PASS, pruebas antes de código y ejecución de tareas.

No se modificaron Constitution, AGENTS, especificaciones001–004, requisitos/historias anteriores, esquema ni dependencias. La ampliación expresa autoriza PATCH dentro de HU-14.

## Implementación

PATCH reutiliza Routes→Controllers→Services→Repositories. Cuerpo exclusivo purchased booleano, UUID como DELETE, sin coerción. SQL constante parametrizado `UPDATE products SET purchased = ? WHERE id = ?`, con SELECT FOR UPDATE en transacción compartida con PUT. Solo cambia estado; conserva otras columnas y responde200 incluso con estado igual,400 inválido antes de SQL,404 ausencia,503 seguro/500 genérico. GET/POST/PUT/DELETE conservan contratos.

React usa productsApi con fetch y URL pública configurable. Hook carga con AbortController/generación y serializa escrituras leyendo los productos confirmados vigentes; no genera UUID. Formularios esperan confirmación, conservan errores/borradores ante rechazo y evitan doble envío. DELETE exige204 sin interpretar JSON. Filtros/resumen permanecen derivados de la colección global. Carga, error y vacío distintos; sin optimismo ni reintentos automáticos.

Sin imports de shoppingListStorage desde producción, lectura/guardado/migración/borrado local. Utilidad histórica conservada solo por su prueba aislada de formato. Datos antiguos no aparecerán en la lista API.

## Criterios de aceptación y trazabilidad

| Criterio | Estado | Tareas y evidencia |
|---|---|---|
| CA-01 GET inicial | Cumplido | T011–T014/T016: carga, abort, StrictMode, navegador |
| CA-02 POST | Cumplido | T011–T015: formulario, servidor genera ID, HTTP201/MySQL |
| CA-03 PUT | Cumplido | T011–T016: edición/cancelación, confirmación y borrador al fallar |
| CA-04 PATCH | Cumplido | T004–T009/T012: ambas direcciones, estado igual, HTTP/MySQL |
| CA-05 DELETE | Cumplido | T011–T016:204 antes de retirar, fallo conserva producto |
| CA-06 confirmación API | Cumplido | T012/T013/T016: no optimismo, cola, fallos/red/respuestas tardías |
| CA-07 filtros/resumen | Cumplido | T014–T016: colección global, sin escrituras, navegador |
| CA-08 recuperación MySQL | Cumplido | T005/T015/T019: remontaje, proceso nuevo y recarga navegador |
| CA-09 regresiones | Cumplido | T009/T015–T017/T020: suites completas, contratos y cobertura anterior |

FR001/002→T004–T009; FR003→T011–T014/T016; FR004/005→T010–T013; FR006→T013–T016; FR007→T012/T015/T016/T018; FR008→T012/T013/T016; FR009→T009/T015–T020. SC001–004 comprobados por persistencia, fallos, filtros/concurrencia y aislamiento de datos.

## Pruebas ejecutadas y resultados finales

| Comando | Resultado |
|---|---|
| backend/npm test |173 aprobadas,65 MySQL omitidas intencionalmente;0 fallidas |
| backend/npm run test:mysql |65 aprobadas en5 suites secuenciales;0 fallidas |
| Total backend distinto |238 aprobadas;0 fallidas |
| raíz/npm test |141 aprobadas en3 archivos;0 fallidas |
| raíz/npm run build |Correcto,36 módulos; JS234.26kB (73.00kB gzip) |

Nuevos casos backend:22 aislados de PATCH y11 MySQL. Se volvieron a ejecutar las151 pruebas aisladas y54 MySQL anteriores. Antes de implementar, los22 casos PATCH fallaron por ruta ausente. Servicio HTTP frontend también se comprobó antes de existir, fallando su importación; después pasa.

Frontend conserva exactamente los111 casos de la suite anterior, ahora asíncronos con await act y API simulada independiente. No se eliminaron assertions de registro, validaciones, edición/cancelación, independencia/inmutabilidad, checkbox, eliminación, filtros o resumen. HU-07 se adapta a recuperación API y conservación de datos históricos:13 variantes corruptas permanecen intactas, sin migración incluso después de registrar. Utilidad legacy conserva prueba de serialización. Se añaden30 casos:12 de productsApi y18 de integración asíncrona, incluidos doble submit, cola, fallos, StrictMode/GET obsoleto y formulario oculto durante PUT.

## Cobertura de los18 escenarios PATCH solicitados

| Escenarios | Evidencia y resultado |
|---|---|
|1–4 false→true, true→false, mismo estado,200 completo |Aisladas y MySQL, aprobado |
|5–7 identidad/nombre/cantidad |Modelo exacto antes/después, aprobado |
|8–10 falta purchased/string/número |400 sin SQL y sin cambio real, aprobado |
|11–12 ID inválido/inexistente |400/404, aprobado |
|13–14 MySQL fallido/sin detalles sensibles |Mocks y puerto local rechazado503;500 genérico, aprobado |
|15 parametrización |Spy de consultas exactas y parámetros, aprobado |
|16 reinicio |Proceso Node nuevo recupera estado confirmado, aprobado |
|17 otros productos |Comparación de colección/duplicados, aprobado |
|18 contratos anteriores |Regresiones y recorrido HTTP GET/POST/PUT/DELETE, aprobado |

## HTTP real

Backend iniciado con npm start en3000 y Vite con npm run dev en5173. Comprobación adicional con fetch real: /health200, GET200, POST201, PUT200, PATCH200 true/mismo/false, DELETE204 sin cuerpo, POST/cuerpoPATCH/ID inválidos400, UUID inexistente404 y segunda eliminación404. El producto confirmado se recuperó mediante GET. Indisponibilidad real503 se verifica en la suite MySQL mediante puerto temporal sin detener MySQL ni cambiar .env; conexión restaurada sin cambios de datos.

## Navegador y presentación

Comprobado mediante navegador integrado contra servidores reales:

- Lista inicial vacía y resumen0/0/0.
- Registro desde React; consulta SQL por nombre del fixture confirma UUID servidor, quantity2 y purchased0.
- Edición nombre/cantidad a3 guardada con Enter, sin alterar total.
- Marcación con Espacio, filtro Pendientes vacío y Comprados visible, resumen1/0/1.
- Recarga recupera producto editado/comprado desde MySQL y filtro Todos inicial.
- Desmarcación con Espacio y filtro Pendientes, resumen1/1/0.
- Edición móvil con cantidad0 muestra error, conserva borrador y Cancelar recupera quantity3.
- Eliminación exclusivamente del fixture propio; recarga no lo recupera y muestra vacío/resumen0.
- Consola: cero entradas warn/error observadas en la pestaña de prueba.
- Escritorio y móvil390×844; en móvil ancho útil375 y scrollWidth375, sin desbordamiento. Formulario y botones visibles/utilizables. Override retirado.

Capturas locales de prueba antes de limpiar: tmp/hu14-desktop.jpg y tmp/hu14-mobile.jpg, excluidas de Git. No se realizó prueba física en dispositivo móvil ni entre múltiples clientes.

## Integridad

MySQL8.0.41; tabla InnoDB, cero triggers. Inicio0 registros, cierre0. Las suites comparan SHOW CREATE TABLE y colección inicial/final; sin cambios. Fixtures SQL, HTTP y UI propios retirados, sin DROP/TRUNCATE/DELETE abierto ni registros ajenos modificados. No se alteró esquema, .env, lockfiles, backend/config, políticas de otros contratos o históricos de navegador.

## Archivos

- Backend modificados: cuatro módulos productRoutes/productController/productService/productRepository; nuevas pruebas productStatus.test.js y productStatus.mysql.test.js.
- Frontend modificados: useShoppingList, ShoppingForm, ShoppingItem, ShoppingList, App.jsx/App.css y shoppingList.test.js. Nuevos productsApi.js, .env.example, productsApi.test.js, fullStack.test.js y helpers/productsServer.js.
- Documentación: README.md, docs/architecture.md y nueve artefactos en esta especificación (incluido validation.md).

## Límites conocidos

Sin errores pendientes detectados dentro del alcance. No hay migración automática, offline, autenticación, sincronización en tiempo real entre clientes ni reintentos avanzados. Una respuesta perdida después de una escritura aceptada puede requerir recargar para reconciliar; no existe deduplicación POST, ya fuera del contrato histórico. GET conserva orden ID ascendente; durante la sesión se conserva el orden de la colección recibida y se añade el nuevo registro al final.

Los servidores temporales de validación se detienen al cerrar; para revisión manual, iniciar MySQL, backend/npm start y raíz/npm run dev. No se publicaron comentarios Jira ni cambios Git.
