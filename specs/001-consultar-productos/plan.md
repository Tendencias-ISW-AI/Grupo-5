# Implementation Plan: HU-09 — Consultar productos

**Branch**: `feature/backend-hu-09-consultar-productos` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)
**Input**: Especificación existente, aclarada con las decisiones autorizadas.

## Summary

Implementar exclusivamente GET /api/products: arreglo JSON persistido en MySQL, ordenado por id ascendente; colección vacía 200 y error de indisponibilidad 503. Reutilizar Express, configuración y middleware. Inicialización explícita, idempotente y con inspección previa de objetos existentes.

## Technical Context

**Language/Version**: JavaScript ES Modules, Node.js 22.14.0, npm 11.12.1.
**Primary Dependencies**: Express 5, mysql2/promise, dotenv, cors existentes; sin nuevas dependencias.
**Storage**: MySQL local 8.0.41, localhost:3306, smartlist_db.products; secretos solo en backend/.env.
**Testing**: Vitest y Supertest; pruebas aisladas por defecto y MySQL real opt-in con fixtures propios.
**Target Platform**: Backend Node.js local; frontend React/Vite conservado.
**Project Type**: API HTTP por capas.
**Performance Goals**: Sin objetivos cuantitativos definidos; consulta completa sin paginación.
**Constraints**: Sin endpoints de escritura, frontend, ORM, autenticación ni operaciones Git automáticas.
**Scale/Scope**: Una colección y un endpoint de lectura; sin usuarios o relaciones adicionales.

## Constitution Check

Gates previos a investigación y posteriores al diseño: PASS en los siete principios.

1. Routes → Controllers → Services → Repositories → MySQL; SQL solo en repositorio e inicialización explícita.
2. Specify conservado; Clarify, Plan, Tasks, Analyze e Implement en orden bajo autorización general.
3. SQL estático o parametrizado; secretos excluidos y respuestas de error genéricas.
4. Pruebas de contrato, servicio, repositorio e infraestructura; regresión backend/frontend y build.
5. Exactamente id, name, quantity, purchased; sin integración React ni cambio de localStorage.
6. ES Modules, infraestructura reutilizada y ninguna dependencia nueva.
7. Referencia HU-09 sin inventar clave Jira; artefactos versionables y rama existente.

## Project Structure

### Documentation (this feature)

```text
specs/001-consultar-productos/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/products.openapi.yaml
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/app.js
├── src/config/{database,environment,initializeDatabase}.js
├── src/routes/productRoutes.js
├── src/controllers/productController.js
├── src/services/productService.js
├── src/repositories/productRepository.js
├── src/middleware/errorHandler.js
├── database/{schema.sql,initialize.js}
└── tests/ (existentes y HU-09)
```

**Structure Decision**: Frontend en raíz y backend separado. Repositorio devuelve filas; servicio valida y convierte purchased; controlador entrega arreglo 200; middleware reconoce indisponibilidad 503 y conserva los otros errores.

## Design decisions

- Consulta estática SELECT id, name, quantity, purchased FROM products ORDER BY BINARY id ASC: concreta el orden sin depender de collation.
- Pool existente diferido; sin conexión o DDL durante importación, /health o inicio del servidor.
- Inicialización explícita: inspeccionar versión, base, columnas, PK, defaults y CHECK; detenerse ante tabla incompatible sin ALTER o reemplazar datos. Crear solo objetos faltantes de smartlist_db. MySQL mínimo 8.0.16 para CHECK enforced.
- Esquema aprobado con CHECK quantity > 0 y purchased IN (0,1), IDs y nombres no vacíos. Sin campos adicionales.
- Fallos conocidos de conexión/configuración de almacenamiento: error identificado y 503 exacto sin detalles; errores inesperados o filas incompatibles: 500 genérico existente.
- Pruebas reales opt-in con IDs propios, fixtures parametrizados y limpieza exclusiva de esos IDs. Comprobar reconexión del pool y reinicio del servidor. Ninguna API de escritura.

## Complexity Tracking

Sin violaciones de Constitution ni complejidad adicional que justificar.
