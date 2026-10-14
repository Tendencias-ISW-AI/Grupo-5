# Implementation Plan: SMARLIST-22 — Categorías de productos en la interfaz

**Branch**: `feature/SMARLIST-22-hu-15-categorias-interfaz` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: `specs/007-categorias-interfaz/spec.md`.

## Summary

Agregar un selector de categoría en el registro y en la edición, mostrar la categoría en cada producto y enviarla a la API. Una constante del frontend replica la lista del backend y una prueba garantiza que coinciden. `productsApi` pasa a exigir `category` válida en las respuestas, y el servidor simulado de las pruebas se comporta como la API real (siempre devuelve `category`, `Otros` por defecto).

## Technical Context

**Language/Version**: JavaScript (ES Modules, JSX), React 19.

**Primary Dependencies**: React, Vite, Vitest + jsdom (existentes). Sin dependencias nuevas.

**Storage**: API REST + MySQL (SMARLIST-15/19). Sin cambios en el backend.

**Testing**: Vitest con `tests/helpers/productsServer.js`; regresión completa de frontend, build y backend.

**Target Platform**: Navegadores modernos.

**Project Type**: Aplicación web (frontend en la raíz).

**Performance Goals**: Sin cambios.

**Constraints**: Sin cambios en `backend/`. Accesibilidad: selector con `<label>` asociado.

**Scale/Scope**: Un módulo de categorías, cambios en hook, cliente API, formulario, ítem, estilos y pruebas.

## Constitution Check

La Constitution v1.0.0 gobierna el backend; esta historia es de frontend (`AGENTS.md`). Principios aplicables: II SDD (artefactos en `specs/007-categorias-interfaz/`, ejecución continua autorizada), IV pruebas (nuevas + regresión, sin debilitar casos), V compatibilidad (modelo de cinco atributos de SMARLIST-19, sin tocar el backend), VI simplicidad (constante + prueba de sincronía en vez de un endpoint nuevo), VII trazabilidad (SMARLIST-22). PASS antes y después del diseño.

## Project Structure

```text
src/
├── utils/productCategories.js     # NUEVO: PRODUCT_CATEGORIES, DEFAULT_PRODUCT_CATEGORY, isValidProductCategory
├── hooks/useShoppingList.js       # MODIFICAR: validateProduct(name, quantity, category?), addProduct(name, quantity, category), updateProduct con category
├── services/productsApi.js        # MODIFICAR: isProduct exige category válida (5 atributos)
├── components/ShoppingForm.jsx    # MODIFICAR: selector Categoría
├── components/ShoppingItem.jsx    # MODIFICAR: etiqueta de categoría y selector en edición
└── App.css                        # MODIFICAR: estilos de selector y etiqueta
tests/
├── productCategoriesUi.test.js    # NUEVO
├── helpers/productsServer.js      # MODIFICAR: category por defecto Otros como la API real
└── (existentes)                   # AMPLIAR fixtures con category donde se compara la forma exacta
```

## Design

- `validateProduct(name, quantity, category)`: si `category !== undefined` y no es válida → `errors.category = 'Elige una categoría válida.'`; devuelve `category`.
- `addProduct(name, quantity, category = DEFAULT_PRODUCT_CATEGORY)` → `createProduct({ name, quantity, category })`.
- `updateProduct(id, { name, quantity, category })` → incluye `category` en el PUT solo si viene definida.
- `ShoppingForm`: estado `category` (inicial `Otros`), `<select id="product-category">`, se reinicia tras éxito.
- `ShoppingItem`: `<span className="product-category">` con `item.category`; en edición `<select name="category">` precargado.
- `productsApi.isProduct`: exactamente cinco atributos y `isValidProductCategory(item.category)`.
- Mock: POST `category: data.category ?? 'Otros'`; `seed` e inicial normalizan `category ?? 'Otros'`.

## Test Cases

| ID | Escenario | Esperado | CA |
|---|---|---|---|
| CP-01 | Abrir app | Selector "Categoría" con 8 opciones en orden y "Otros" seleccionado | CA-01 |
| CP-02 | Registrar con "Lácteos" | POST con `category: "Lácteos"`; fila muestra "Lácteos"; selector vuelve a "Otros" | CA-01, CA-04 |
| CP-03 | Registrar sin cambiar | Producto en "Otros" | CA-01 |
| CP-04 | Lista con varias categorías | Cada fila muestra la suya | CA-03 |
| CP-05 | Abrir edición | Selector precargado con la categoría actual | CA-02 |
| CP-06 | Editar a "Bebidas" | PUT con `category: "Bebidas"`; fila muestra "Bebidas" | CA-02, CA-04 |
| CP-07 | Cancelar edición | Categoría sin cambios, sin PUT | CA-02 |
| CP-08 | Error al registrar | Formulario y categoría elegida se conservan | CA-04 |
| CP-09 | Respuesta sin categoría o inválida | Rechazada por `productsApi` | CA-04 |
| CP-10 | Lista de categorías | Igual a la del backend | CA-05 |
| CP-11 | `validateProduct` con categoría inválida | Error de categoría | CA-04 |
| CP-12 | Regresión | Todas las suites existentes aprobadas | CA-05 |

## Complexity Tracking

Sin violaciones.
