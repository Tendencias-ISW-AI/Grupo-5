# Implementation Plan: SMARLIST-12 / HU-11

**Branch**: `feature/SMARLIST-12-hu-11-registro-de-productos` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)
**Input**: Especificación aprobada para ejecución completa.

## Summary

Agregar POST /api/products reutilizando rutas, controlador, servicio, repositorio, pool y errores de HU-09. Validar antes de SQL, generar UUID nativo e insertar cuatro atributos con parámetros. Conservar GET. Mantenimiento independiente: cambiar exclusivamente el texto del h1 de src/App.jsx.

## Technical Context

**Language/Version**: JavaScript ES Modules, Node.js 22 compatible con entorno existente.
**Primary Dependencies**: Express 5, mysql2/promise, dotenv y cors existentes; Vitest/Supertest existentes, sin instalaciones.
**Storage**: MySQL local smartlist_db.products, esquema HU-09 sin cambios.
**Testing**: Pruebas aisladas de servicio/repositorio/HTTP y suite MySQL opt-in; regresión frontend111 casos y build.
**Target Platform**: API local Node.js y mantenimiento puntual React.
**Project Type**: API HTTP por capas.
**Performance Goals**: No especificados; sin objetivos inventados.
**Constraints**: Sin otros endpoints CRUD, cambios de esquema, integración React–API, ramas nuevas ni Git automático.
**Scale/Scope**: Registro de un producto por solicitud; no cargas masivas, autenticación o idempotencia.

## Constitution Check

PASS previo y posterior al diseño para I–VII: capas existentes respetadas; SDD completo autorizado; validación/SQL parametrizado y secretos locales; pruebas/regresiones; cuatro atributos; simplicidad y dependencias conservadas; trazabilidad SMARLIST-12 en rama correcta. La modificación de React es mantenimiento expresamente autorizado y separado de la historia backend, sin integración ni cambios de persistencia.

## Project Structure

### Documentation (this feature)

specs/002-registro-productos/{spec.md,plan.md,research.md,data-model.md,quickstart.md,tasks.md,validation.md}, checklists/requirements.md y contracts/products.openapi.yaml. No modificar specs/001-consultar-productos.

### Source Code (repository root)

Reutilizar backend/src/routes/productRoutes.js, controllers/productController.js, services/productService.js, repositories/productRepository.js y middleware/errorHandler.js. Mantener config/database.js y schema.sql. Nuevas suites backend/tests/productRegistration*.test.js; extender vitest.mysql.config.js para pruebas reales secuenciales. Solo una línea de frontend en src/App.jsx.

**Structure Decision**: Servicio valida un objeto con exclusivamente name/quantity. Name.trim, string UTF-8 válido y máximo150 puntos de código; quantity number entero1..2147483647. randomUUID genera ID; purchased false. Repositorio INSERT INTO products (id,name,quantity,purchased) VALUES (?,?,?,?), pasando 0 para boolean SQL. Servicio devuelve producto solo cuando INSERT se confirma. Controlador 201 JSON; errores al middleware.

## Decisions and validation

- Compartir clasificación de errores de almacenamiento entre GET y POST mediante pequeña función local del servicio; no nueva capa. 503 y 500 existentes conservados. Validaciones producen 400 con {error:{message:mensaje público}}; JSON malformado recibe mensaje genérico, sin eco del payload.
- MySQL VARCHAR mide caracteres Unicode; adaptar únicamente la comprobación de longitud del nombre en GET para aceptar el mismo límite del registro, sin modificar su contrato, SQL, orden o campos.
- No necesidad de Location, consulta individual, retry de INSERT o colisión artificial de UUID; errores inesperados de inserción son500 y no reintentan escrituras.
- Adaptar prueba histórica que prohibía POST: conservar su caso con nueva expectativa400 para cuerpo inválido, sin invocar repositorio; PUT/PATCH/DELETE continúan404. Mocks existentes deben exportar insertProduct sin alterar verificaciones GET.
- Suite real se ejecuta con fileParallelism=false: ambas historias comparan colección inicial/final y no deben interferir entre sí. Fixtures creados por POST se identifican por IDs devueltos y marca exclusiva en nombre; cleanup solamente esos IDs. Verificar POST/GET por HTTP real en servidor temporal y reconexión. Credenciales nunca se imprimen.
- Pruebas cubren CA01–07, límites, null/arrays/cuerpo ausente, campos protegidos, nombres repetidos, datos anteriores y errores. Pruebas antes del código.

## Complexity Tracking

Sin violaciones o complejidad adicional que justificar.
