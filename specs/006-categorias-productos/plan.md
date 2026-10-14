# Implementation Plan: SMARLIST-19 / HU-15 — Categorías de productos (backend)

**Branch**: `feature/SMARLIST-19-hu-15-categorias-productos` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: Especificación de `specs/006-categorias-productos/spec.md`, alcance backend autorizado.

## Summary

Agregar `category` al producto en las cuatro capas existentes. Un módulo `productCategories.js` define la lista fija y el valor por defecto `Otros`. El servicio valida `category` opcional en POST/PUT (400 antes de SQL), usa `Otros` por defecto al crear y conserva la actual al editar sin categoría. El repositorio lee y escribe la columna con consultas parametrizadas. La inicialización crea la tabla con la columna o migra una tabla compatible de cuatro columnas con un único `ALTER TABLE ... ADD COLUMN`, de modo que los registros existentes quedan en `Otros`.

## Technical Context

**Language/Version**: JavaScript ES Modules, Node.js 22.

**Primary Dependencies**: Express 5, mysql2/promise, Vitest, Supertest (existentes). Sin dependencias nuevas.

**Storage**: MySQL 8.0.16+, `smartlist_db.products` + columna `category VARCHAR(30) NOT NULL DEFAULT 'Otros'`.

**Testing**: Pruebas aisladas con mocks (`npm test`) y suites MySQL opt-in (`npm run test:mysql`). Las MySQL se actualizan y amplían, pero no se ejecutan (sin `backend/.env`).

**Target Platform**: API local Node.js.

**Project Type**: Backend por capas en `backend/`.

**Performance Goals**: Sin objetivos cuantitativos; mismas consultas por operación que antes.

**Constraints**: No tocar frontend ni `useShoppingList` (SMARLIST-15). Consultas parametrizadas. Migración no destructiva e idempotente.

**Scale/Scope**: Un atributo nuevo; 8 categorías fijas.

## Constitution Check

| Principio | Estado | Justificación |
|---|---|---|
| I. Arquitectura en capas | PASS | Lista en módulo de servicio; validación en servicio; SQL solo en repositorio; DDL solo en `config/initializeDatabase.js` y `database/`. |
| II. SDD | PASS | Specify → Clarify → Plan → Tasks → Analyze → Implement con artefactos versionados; ejecución continua autorizada. |
| III. Seguridad y validación | PASS | Validación en el límite HTTP vía servicio, 400 antes de SQL, parámetros `?`, sin exponer detalles. |
| IV. Calidad y pruebas | PASS con limitación | Pruebas aisladas nuevas y regresión completa. Las aserciones de forma existentes se amplían con `category` (no se eliminan ni debilitan). MySQL real no ejecutado: se declara. |
| V. Compatibilidad | PASS | Se conservan los cuatro atributos y sus reglas; `category` se añade. Editar no cambia ID ni estado. Frontend y localStorage intactos. Historia aprobada en Jira que modifica el modelo. |
| VI. Simplicidad | PASS | Sin tabla de categorías, ORM ni dependencias. |
| VII. Trazabilidad | PASS | Rama y commit con SMARLIST-19; tareas ligadas a FR/CA. |

Re-evaluación después del diseño: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/006-categorias-productos/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md, validation.md
├── contracts/products.openapi.yaml
└── checklists/requirements.md
```

### Source Code

```text
backend/
├── database/
│   ├── schema.sql                         # MODIFICAR: columna category en CREATE TABLE
│   └── add-product-category.sql           # NUEVO: ALTER TABLE para tablas existentes
├── src/
│   ├── config/initializeDatabase.js       # MODIFICAR: verificar 4 (legado) o 5 columnas; migrar legado
│   ├── services/productCategories.js      # NUEVO: PRODUCT_CATEGORIES, DEFAULT_PRODUCT_CATEGORY, isValidProductCategory
│   ├── services/productService.js         # MODIFICAR: validar category; default; mapear filas
│   └── repositories/productRepository.js  # MODIFICAR: SELECT/INSERT/UPDATE con category
└── tests/
    ├── productCategories.test.js          # NUEVO: aisladas HU-15
    ├── productCategories.mysql.test.js    # NUEVO: MySQL real HU-15 (opt-in)
    └── (existentes)                       # AMPLIAR aserciones de forma con category
```

Sin cambios: `backend/src/{app,server}.js`, rutas, controladores, middleware, `src/**` del frontend, `package.json`.

## Design

- **Lista**: `PRODUCT_CATEGORIES = Object.freeze(['Frutas y verduras', 'Carnes y pescados', 'Lácteos', 'Panadería', 'Despensa', 'Bebidas', 'Aseo', 'Otros'])`, `DEFAULT_PRODUCT_CATEGORY = 'Otros'`, `isValidProductCategory(value)` = `typeof value === 'string' && PRODUCT_CATEGORIES.includes(value)`.
- **Validación** (`validateProductData`): claves permitidas `name`, `quantity` (obligatorias) y `category` (opcional); cualquier otra clave o ausencia → 400 `La solicitud debe contener nombre y cantidad, y opcionalmente categoría.`. Si `category` está presente y no es válida → 400 `La categoría debe ser una de: Frutas y verduras, …, Otros.`. Devuelve `{ name, quantity, category }` con `category` `undefined` si se omitió. El orden de validación es el actual (forma, nombre, cantidad) y luego categoría.
- **POST**: `category ?? DEFAULT_PRODUCT_CATEGORY`; `INSERT INTO products (id, name, quantity, purchased, category) VALUES (?, ?, ?, ?, ?)`.
- **PUT**: transacción existente; `SELECT id, name, quantity, purchased, category ... FOR UPDATE`; `category = data.category ?? rows[0].category`; `UPDATE products SET name = ?, quantity = ?, category = ? WHERE id = ?`; respuesta con `category`.
- **GET**: `SELECT id, name, quantity, purchased, category FROM products ORDER BY BINARY id ASC`; la validación de filas exige `isValidProductCategory(row.category)`.
- **Inicialización**: `verifyTable` devuelve `'current'` (5 columnas con `category varchar(30) NOT NULL DEFAULT 'Otros'`) o `'legacy'` (4 columnas anteriores); cualquier otra forma → error sin reparar. Si es `'legacy'`, ejecutar `database/add-product-category.sql` y volver a verificar exigiendo `'current'`. Resultado añade `categoryAdded: boolean`.

## Test Cases

| ID | Escenario | Esperado | CA |
|---|---|---|---|
| CP-01 | POST con cada categoría válida | 201 con esa categoría; INSERT con 5 parámetros | CA-03 |
| CP-02 | POST sin categoría | 201 con `Otros` | CA-02, CA-03 |
| CP-03 | PUT con categoría válida | 200 con nueva categoría, ID y estado conservados; UPDATE parametrizado | CA-03 |
| CP-04 | PUT sin categoría | Conserva la categoría actual | CA-03 |
| CP-05 | POST/PUT con categoría inválida (`Juguetes`, `lácteos`, `" Lácteos "`, `""`, `null`, `5`, `[]`, `{}`) | 400 sin SQL | CA-04 |
| CP-06 | GET con filas con categoría | Devuelve `category`; fila con categoría inválida → 500 genérico | CA-01, CA-08 |
| CP-07 | Lista fija | 8 valores, incluye `Otros`, inmutable | CA-02 |
| CP-08 | db:init tabla legado | Un `ALTER TABLE` y verificación final; `categoryAdded: true` | CA-01, CA-05 |
| CP-09 | db:init tabla actual | Sin DDL | CA-01 |
| CP-10 | db:init base nueva | `CREATE TABLE` con `category`, sin `ALTER` | CA-01 |
| CP-11 | db:init columna `category` incompatible | Error sin DDL | CA-01 |
| CP-12 | Regresión GET/POST/PUT/DELETE, 404/503/500 | Sin cambios salvo `category` en la forma | CA-08 |
| CP-13 | MySQL real (opt-in): POST/PUT/GET, 400 sin cambios, default `Otros` | Declarado, no ejecutado | CA-03, CA-04, CA-05 |

## Complexity Tracking

Sin violaciones.
