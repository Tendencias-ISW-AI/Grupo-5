# Implementation Plan: SMARLIST-14 / HU-13

**Branch**:`feature/SMARLIST-14-hu-13-eliminacion-de-productos` | **Date**:2026-10-13 | **Spec**:[spec.md](spec.md)
**Input**: Especificación autorizada para flujoSDD completo.

## Summary

DELETE porUUID en capas existentes,eliminación física mediante consulta parametrizada porID y affectedRows,204 sin cuerpo,404 cero filas,400 validación previa y503/500 seguros. Sin cambios de frontend,esquema u otras historias.

## Technical Context

**Language/Version**: JavaScript ES Modules,Node22 existente.
**Primary Dependencies**: Express5,mysql2/promise,dotenv/cors,Vitest/Supertest existentes;sin instalaciones.
**Storage**: smartlist_db.products MySQL local existente,PK id;sinDDL.
**Testing**: Pruebas aisladas y suiteMySQL opt-in secuencial,regresión GET/POST/PUT yfrontend111/build.
**Target Platform**: API local Node.js.
**Project Type**: Backend porcapas.
**Performance Goals**: Sin objetivos cuantitativos definidos.
**Constraints**: Sin operaciones sobre datos preexistentes en validación,otras bases,frontend,softdelete,restore,nuevasramas oGitautomático.
**Scale/Scope**: Un registro por DELETE, sin lotes o papelera.

## Constitution Check

PASS previo/postdiseño:I capas vigentes;II flujo autorizado;III SQL parametrizado,validación ysecretos porentorno;IV pruebas/regresión;V modelo/frontend conservados;VI infraestructura reutilizada;VII trazabilidadSMARLIST14/rama correcta. DiferenciaUUID soloDELETE expresamente aprobada;PUT no cambia.

## Project Structure

### Documentation (this feature)

specs/004-eliminacion-productos/{spec,plan,research,data-model,quickstart,tasks,validation}.md,checklists/requirements.md,contracts/products.openapi.yaml. Directorios001–003 intactos.

### Source Code (repository root)

Reutilizar backend/src/{routes/productRoutes,controllers/productController,services/productService,repositories/productRepository}.js. Nuevas suites backend/tests/productDeletion.test.js yproductDeletion.mysql.test.js. README.md/docs/architecture.md actualizados. Pool/middleware/esquema/dependencias/frontend intactos.

**Structure Decision**: Repositorio deleteProductById ejecuta DELETE FROM products WHERE id = ? con array[id] y retorna filas afectadas. Servicio deleteProduct comparte validateProductId básico con PUT,y valida formatohex8-4-4-4-12 adicional soloDELETE.0filas→404,1→éxito;resultado inesperado→500 genérico,sin éxito falso. Clasificadorerrores existente reutilizado. Controlador response.status(204).end(). Sin JSON ni Content-TypeJSON en éxito. Ruta DELETE/:id.

## Decisions and validation

- Extracción mínima de validaciónID dePUT preservando su lógica y mensaje exactos. UUID no normalizado,no restricciónv4;identidad exacta stringcase conforme PK existente.
- Una sentencia acotada porPK,autocommit existente;sin SELECTprevio,transacción adicional o reintento. DosDELETEconsecutivos:204/404.
- Mantener error404 Producto no encontrado. con error.message;503 exactoHU09,500 genérico. No registrar entradas/credencialesSQL.
- DELETE usa únicamente ruta,ignora campos del cuerpo como criterios de selección. JSON malformado conserva middleware400 existente.
- Preflight sololectura verificando tabla,PK,engine,triggers yhuella deesquema;capturar colección anterior y comprobar integridad final. Ninguna eliminación sobre IDs previos altest.
- CP01–19 trazados en tareas/validation. Real:fixtures pendientes/comprados,incluidos nombresduplicados;IDs registrados,limpieza porIDs propios,DELETEreal204 sin cuerpo,GETausencia,segundo404,restart deprocesos,error503 mediante puerto localinactivo. Suites secuenciales vigentes.
- Regresiones anteriores no debilitadas;DELETE sin/:id continúa404. NoSQLdestructivo masivo ni nuevasdependencias.

## Complexity Tracking

Sin violaciones o complejidad adicional.
