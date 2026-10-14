# Validation — SMARLIST-13 / HU-12

Fecha:2026-10-13. Rama:feature/SMARLIST-13-hu-12-edicion-de-productos, verificada al inicio y al cierre. Estado inicial limpio. Sin nuevas ramas, commits, push o merge.

## Flujo SDD real

Las habilidades oficiales instaladas speckit-specify,clarify,plan,tasks,analyze,implement se aplicaron consecutivamente bajo autorización completa.

1. Specify: resolve spec-template mediante CLI oficial, copia de plantilla y especificación en specs/003-edicion-productos; numeración secuencial existente. feature.json local activa nuevo directorio sin tocar ramas. Checklist16/16.
2. Clarify: check-prerequisites.sh --json --paths-only. Cero preguntas necesarias; decisiones del usuario y supuestos menores incorporados a Clarifications. PUT completo,validación compartida,atributos preservados,errores y mismos valores definidos. ID string genérico1..36 unidades UTF-16 bien formado y sin espacios externos para compatibilidad HU-09. Checklist16/16→16/16,sin cambios de marcadores o pendientes. Alcance,modelo,flujos,errores,dependencias,términos y finalización claros; no objetivos de rendimiento inventados.
3. Plan: setup-plan.sh --json y plantilla oficial; investigación primaria delegada conforme a habilidad,modelo,contrato y quickstart. Constitution revisada antes/después del diseño, siete principios PASS.
4. Tasks: setup-tasks.sh --json y plantilla oficial;15 tareas por dependencias y escenariosUS1/US2,con MySQL real identificado.
5. Analyze: check-prerequisites.sh --json --require-spec --require-tasks --include-tasks; fase de solo lectura sin modificaciones.8FR,4SC,15tareas,100% de cobertura;CA01–07 cubiertos;0 tareas sin correspondencia,ambigüedades bloqueantes,duplicaciones relevantes o conflictos constitucionales.
6. Implement: check-prerequisites.sh --json --require-tasks --include-tasks; gate checklist16/16 PASS,pruebas antes de código,ejecución de todas las tareas y validación final.

No existen hooks de extensión. Especificaciones anteriores y Constitution intactas. Se completó el contrato de errores con esquemas JSON durante revisión documental final, sin cambiar requisitos o comportamiento.

## Cobertura de análisis

| Requisito | Tareas | Evidencia |
|---|---|---|
| FR001/006 | T003/T007/T008/T015 | PUT200 y modelo exacto |
| FR002 | T003/T004/T010 | Reglas POST reutilizadas |
| FR003 | T003/T006/T009 | ID validado antes deSQL |
| FR004 | T005/T006/T008 | Identidad,estado y otros registros conservados |
| FR005 | T003/T005/T009/T010 |404 por lectura y200 sin cambios |
| FR007 | T003/T009/T010 |400/404/503/500 seguros |
| FR008 | T001/T002/T008/T011–T015 | Persistencia,regresiones y alcance |
| SC001–004 | T008/T010/T013–T015 | Integridad,rechazo,reinicio y regresión |

## Decisiones e implementación

Routes→Controllers→Services→Repositories→MySQL, reutilizando cuatro módulos. validateProductData se extrae localmente de createProduct y se comparte con updateProduct sin alterar reglas o mensajes de POST. ID/cuerpo se validan antes de adquirir conexión; ID no se normaliza o regenera. Cuerpo exclusivo name/quantity completos, mismos límites y ausencia de coerción de POST.

Repositorio adquiere una conexión:beginTransaction,SELECT cuatro campos porID FOR UPDATE,UPDATE parametrizado únicamente name/quantity y commit. Selección vacía ejecuta rollback y devuelve null; servicio404. Existencia nunca depende de affectedRows; mismos valores responden200. Respuesta reconstruida con id/purchased bloqueados y los dos datos confirmados, sin consulta extra.

Ante fallo se revierte y libera conexión. Si rollback falla,se destruye para evitar devolver transacción abierta al pool y se conserva el error original. Servicio reutiliza clasificación503 y middleware400/404/500 existente. Sin cambios a middleware,pool o esquema. No hay PATCH,upsert,eliminación,cambio de estado o reintentos automáticos.

Preflight de solo lectura:MySQL8.0.41,InnoDB,0triggers y0productos iniciales. Esto valida reconstrucción de respuesta y bloqueos transaccionales sin modificar estructura.

## Criterios de aceptación

| Criterio | Resultado | Evidencia |
|---|---|---|
| CA01 PUT/api/products/:id | Cumplido | HTTP aislado y real |
| CA02 editar nombre/cantidad | Cumplido | Modelo confirmado porGET |
| CA03 mismas validaciones de registro | Cumplido | Función compartida y matriz inválida |
| CA04 conservar id/purchased | Cumplido | Ambos estados yUUIDoriginal |
| CA05 solo producto porID | Cumplido | SQL parametrizado y snapshots restantes |
| CA06 inexistente404 | Cumplido | Sin UPDATE/upsert,colección intacta |
| CA07 JSON actualizado | Cumplido |200 y cuatro tipos exactos |

## Pruebas automatizadas ejecutadas

| Comando | Resultado real |
|---|---|
| backend/npm test |125aprobadas;45MySQL omitidas intencionalmente |
| backend/npm run test:mysql |45aprobadas en tres suites secuenciales |
| Total backend distinto |170aprobadas,0fallidas |
| Nuevas pruebasHU12 |40aisladas y21MySQL |
| raíz/npm test |111aprobadas de111,0fallidas |
| raíz/npm run build |Aprobado,36módulos transformados |

Las40pruebas nuevas fallaron antes de implementar PUT y luego pasaron. Se corrigió la parametrización del caso arreglo en la suite nueva para que se pruebe realmente un arreglo y no un argumento ausente. No se eliminaron o debilitaron pruebas anteriores; tampoco se requirieron cambios en sus mocks.

Cobertura aislada:ambos estados,ID original,trim,cantidad,JSON4campos,validación independiente,nombres vacíos/largos,cantidades inválidas/campos faltantes/protegidos,ID inválido,inexistente404,mismos valores200 incluso affectedRows0,SQL parametrizado en una conexión,commit/rollback/release,rollback fallido/destroy,error503/500 y salud independiente.

Integración real:POST crea fixtures,PUT edita pendientes y comprados,GET recupera; comparación de productos restantes,nombres duplicados,límites VARCHAR Unicode/INT,matriz inválida400,ID inválido400,inexistente404,sin cambios en colección. Fixture comprado se prepara con SQL limitado exclusivamente a su ID propio; no se añadió endpoint de marcado. Conexión realmente rechazada mediante puerto temporal produce503 y recuperación sin cambios. Dos procesos nuevos de src/server.js recuperan exactamente la edición después de reiniciar.

## Comprobación adicional con npm start

Servidor temporal en3000. GET/health200,POST201,PUT200,PUT con mismos valores200,cuerpo inválido400,ID inválido400,ID inexistente404 yGET200 con el producto editado conservando ID/estado. No se modificaron registros anteriores. Limpieza parametrizada exclusivamente por ID propio,comparación final confirma colección original restaurada. Servidor detenido al terminar.

## Seguridad,scope y límites

Fixtures identificables y sus IDs registrados antes de editar; limpieza no depende del nombre actualizado. Las suites reales conservan snapshots previos y los restauran sin DROP/TRUNCATE ni DELETE abierto. No quedan datos temporales. Sin modificaciones de otras bases,esquema,credenciales o archivos .env. backend/.env ignorado por Git y nunca impreso.

Frontend,localStorage,tests frontend,dependencias y configuración sin cambios. Documentos SDD deHU09/HU11 yConstitution intactos. No se añadieron dependencias o funcionalidades futuras. No hay bloqueos pendientes; integración React–API,eliminación y cambio de estado permanecen fuera del alcance. Sin control optimista/historial; ediciones concurrentes del mismo registro se serializan por bloqueo transaccional.

## Archivos

Modificados:backend/src/routes/productRoutes.js;backend/src/controllers/productController.js;backend/src/services/productService.js;backend/src/repositories/productRepository.js;README.md;docs/architecture.md.

Creados:backend/tests/productEditing.test.js;backend/tests/productEditing.mysql.test.js;specs/003-edicion-productos/spec.md;checklists/requirements.md;plan.md;research.md;data-model.md;contracts/products.openapi.yaml;quickstart.md;tasks.md;validation.md. feature.json local actualizado según Specify.

git diff --check sin errores; rama correcta y frontend/esquema/especificaciones anteriores sin diferencias. Las15tareas completas quedan disponibles para revisión sin commit.
