# Implementation Plan: SMARLIST-13 / HU-12

**Branch**: `feature/SMARLIST-13-hu-12-edicion-de-productos` | **Date**:2026-10-13 | **Spec**:[spec.md](spec.md)
**Input**: Especificación autorizada para flujo completo.

## Summary

PUT completo reutilizando cuatro capas; validación compartida con POST, transacción MySQL para consultar/bloquear y actualizar únicamente nombre/cantidad,200 con estado e identidad preservados.404 depende de existencia consultada, nunca del contador de cambios.

## Technical Context

**Language/Version**: JavaScript ES Modules y Node22 existente.
**Primary Dependencies**: Express5, mysql2/promise, dotenv/cors y Vitest/Supertest existentes, sin nuevas dependencias.
**Storage**: smartlist_db.products local existente; motor InnoDB requerido y sin triggers que transformen atributos; verificar metadatos antes de implementar sin alterar esquema.
**Testing**: Suite aislada con mocks y suite MySQL opt-in secuencial; regresión GET/POST y frontend111 casos/build.
**Target Platform**: API local Node.js.
**Project Type**: Backend por capas.
**Performance Goals**: Sin metas cuantitativas especificadas.
**Constraints**: Sin frontend, DDL, otras historias, nuevas ramas o Git automático.
**Scale/Scope**: Un producto por PUT; sin historial, PATCH, upsert o control optimista.

## Constitution Check

PASS previo y posterior al diseño: I capas existentes;II flujo SDD aprobado completo;III entradas validadas, SQL parametrizado y secretos por entorno;IV pruebas/regresión;V cuatro atributos y frontend intacto;VI reutilización sin dependencias;VII trazabilidad SMARLIST-13 y rama verificada. Sin enmiendas necesarias.

## Project Structure

### Documentation (this feature)

specs/003-edicion-productos/{spec,plan,research,data-model,quickstart,tasks,validation}.md,checklists/requirements.md,contracts/products.openapi.yaml. Los dos directorios anteriores permanecen intactos.

### Source Code (repository root)

backend/src/routes/productRoutes.js; controllers/productController.js; services/productService.js; repositories/productRepository.js. Nuevas suites backend/tests/productEditing.test.js y productEditing.mysql.test.js. Config/pool/esquema/middleware reutilizados sin cambios salvo necesidad verificada. README.md y docs/architecture.md documentan alcance.

**Structure Decision**: Extraer validateProductData como función local del servicio, compartida por createProduct/updateProduct, conservando reglas/mensajes POST. Validar ID antes de adquirir conexión. Repositorio updateProductById devuelve fila actualizada o null. Servicio404 si null y convierte purchased0/1 a booleano. Controlador200 y next(error); ruta PUT/:id.

## Consistency strategy

Adquirir una conexión del pool y beginTransaction; SELECT id,name,quantity,purchased FROM products WHERE id=? FOR UPDATE. Si vacío, rollback y null sin UPDATE. Si existe, UPDATE products SET name=?,quantity=? WHERE id=?; commit. Reconstruir respuesta con id/purchased de fila bloqueada y los dos valores confirmados: dos consultas, sin tercero innecesario ni dependencia de FOUND_ROWS/affectedRows. Mismos valores200. Una conexión para toda la transacción; bloqueo mantiene estado vigente y serializa ediciones. Ante error rollback y release; si rollback falla destruir conexión y preservar error original. Sin reintentos automáticos de escritura.

Comprobar InnoDB y ausencia de triggers antes de usar retorno reconstruido. Si no se cumple, detener y reportar incompatibilidad sin ALTER. No ejecutar SQL de preparación de esquema.

## Validation strategy

Pruebas antes del código: ID inválido/cuerpo inválido no SQL; ambos estados y modelo exacto;404 sin UPDATE; mismos valores200; SQL parametrizado, commit/rollback/release; fallo de rollback destruye conexión; error503/500 genérico. MySQL real: fixtures propios, POST/PUT/GET reales, duplicados,100% de atributos restantes conservados, edición inválida/inexistente sin cambios, reconexión y reinicio de proceso. Limpieza por IDs propios incluso si cambia nombre; no depender del nombre nuevo para retirar fixtures. Suites reales secuenciales existentes.

Adaptar mocks históricos del repositorio para exponer updateProductById sin debilitar verificaciones GET/POST. PUT sin/:id continúa404. No cambiar frontend/pruebas frontend ni dependencias/especificaciones anteriores.

## Complexity Tracking

Transacción mínima justificada por consistencia y preservación del estado; sin violaciones o capas adicionales.
