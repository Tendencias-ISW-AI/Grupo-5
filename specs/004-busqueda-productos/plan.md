# Implementation Plan: SMARLIST-21 / HU-17 — Búsqueda de productos por nombre

**Branch**: `feature/SMARLIST-21-hu-17-busqueda-productos` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: Especificación de `specs/004-busqueda-productos/spec.md`, autorizada para flujo SDD completo.

## Summary

Agregar un campo de búsqueda controlado sobre la lista que filtre en vivo por nombre, con normalización de mayúsculas, tildes y espacios. El filtrado de estado actual (inline en `App.jsx`) se traslada a un módulo puro `src/utils/productFilters.js` que combina criterios independientes (`status`, `query`) y admite sumar `category` más adelante. El estado de la búsqueda vive en `App`, no se persiste y no toca `useShoppingList` ni el backend.

## Technical Context

**Language/Version**: JavaScript (ES Modules, JSX), React 19.

**Primary Dependencies**: React, Vite 7, Vitest 5 + jsdom (existentes). Sin dependencias nuevas.

**Storage**: N/A. La búsqueda no se guarda; localStorage (HU-07) no cambia.

**Testing**: Vitest en `tests/` con `react-dom/client` y `act`, igual que `tests/shoppingList.test.js`. Pruebas unitarias de la normalización y del filtrado, e integración en `App`.

**Target Platform**: Navegadores modernos (`String.prototype.normalize` con NFD).

**Project Type**: Aplicación web (frontend en la raíz; `backend/` fuera de alcance).

**Performance Goals**: Actualización en el mismo render de cada pulsación; listas locales pequeñas, sin debounce.

**Constraints**: No modificar `backend/`, `src/hooks/useShoppingList.js`, el modelo de producto ni la persistencia (SMARLIST-15 trabaja sobre el hook). No TypeScript ni dependencias.

**Scale/Scope**: Un componente nuevo, un módulo de utilidades, integración en `App.jsx`, estilos y pruebas.

## Constitution Check

La Constitution v1.0.0 gobierna `backend/`; esta historia es exclusivamente frontend y se rige por `AGENTS.md`. Se verifican los principios aplicables:

| Principio | Estado | Justificación |
|---|---|---|
| I. Arquitectura en capas | PASS (N/A) | Sin cambios en backend. |
| II. Desarrollo guiado por especificaciones | PASS | Specify → Clarify → Plan → Tasks → Analyze → Implement con artefactos en `specs/004-busqueda-productos/`, ejecución continua autorizada por el usuario. |
| III. Seguridad y validación | PASS | La búsqueda trata el texto como literal (sin RegExp dinámica) y React escapa el mensaje mostrado. |
| IV. Calidad y pruebas | PASS | Pruebas nuevas por criterio y regresión completa de frontend, build y backend. |
| V. Compatibilidad | PASS | Modelo de cuatro atributos, persistencia y contratos del hook intactos. |
| VI. Simplicidad | PASS | Funciones puras pequeñas; sin dependencias ni refactors ajenos (solo se mueve el filtrado de estado a la utilidad reutilizable que exige CA-04). |
| VII. Trazabilidad | PASS | Rama y commits con SMARLIST-21; tareas vinculadas a FR/CA/CP. |

Re-evaluación después del diseño: PASS, sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/004-busqueda-productos/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── product-search.md
├── checklists/
│   └── requirements.md
├── tasks.md
└── validation.md
```

### Source Code (repository root)

```text
src/
├── App.jsx                     # MODIFICAR: estado `searchQuery`, uso de filterProducts y mensaje vacío
├── App.css                     # MODIFICAR: estilos de .product-search
├── components/
│   └── ProductSearch.jsx       # NUEVO: campo controlado + botón "Limpiar búsqueda"
└── utils/
    └── productFilters.js       # NUEVO: normalizeText, matchesStatus, matchesSearch, filterProducts

tests/
└── productSearch.test.js       # NUEVO: unitarias e integración HU-17

README.md, docs/architecture.md # MODIFICAR: documentación de HU-17
```

Sin cambios: `backend/**`, `src/hooks/useShoppingList.js`, `src/utils/shoppingListStorage.js`, `src/components/{ShoppingFilters,ShoppingForm,ShoppingItem,ShoppingList,ShoppingSummary}.jsx`, `tests/shoppingList.test.js`.

**Structure Decision**: Separar presentación (`ProductSearch`) y lógica (`productFilters`) como pide `AGENTS.md`. `filterProducts(items, criteria)` aplica cada criterio con un predicado independiente; para la categoría bastará añadir `matchesCategory` y la clave `category` en los criterios.

## Design

- `normalizeText(text)`: `String(text ?? '')` → `normalize('NFD')` → eliminar marcas combinantes `\p{M}` → `toLowerCase()` → reducir `\s+` a un espacio → `trim()`.
- `matchesStatus(item, status)`: `all` → true; `pending` → `purchased === false`; `purchased` → `purchased === true`. Reproduce exactamente la condición actual de `App.jsx`.
- `matchesSearch(item, normalizedQuery)`: query vacía → true; si no, `normalizeText(item.name).includes(normalizedQuery)` (búsqueda literal).
- `filterProducts(items, { status = 'all', query = '' } = {})`: normaliza la query una vez y devuelve un nuevo arreglo con `items.filter`, sin mutar ni reordenar.
- `ProductSearch({ query, onQueryChange })`: `<div role="search">` (sin `<form>` para no interferir con el formulario de registro ni con Enter), `<label for="product-search">Buscar producto</label>`, `<input type="search" id="product-search" autoComplete="off">` y botón `type="button"` "Limpiar búsqueda", deshabilitado si `query` está vacío; al limpiar llama `onQueryChange('')` y enfoca el input mediante `useRef`.
- `App`: `const [searchQuery, setSearchQuery] = useState('')`; `visibleItems = filterProducts(items, { status: activeFilter, query: searchQuery })`. Mensaje vacío: lista original vacía → mensaje original; búsqueda no vacía → mensaje de búsqueda con `searchQuery.trim()`; en otro caso, mensajes de HU-06.
- Ubicación: dentro de la sección de la lista, después de `<h2>Lista de compras</h2>` y antes de `ShoppingFilters`.

## Test Cases

| ID | Escenario | Resultado esperado | CA |
|---|---|---|---|
| CP-01 | Abrir la aplicación | Campo "Buscar producto" visible, vacío, antes de filtros y lista | CA-01 |
| CP-02 | Escribir carácter a carácter | La lista cambia en cada pulsación | CA-02 |
| CP-03 | "limon" con "Limón" | Coincide | CA-03 |
| CP-04 | "LIMÓN" / "LiMoN" | Coincide | CA-03 |
| CP-05 | Coincidencia parcial ("imó", "le") | Coinciden los nombres que contienen el texto | CA-02 |
| CP-06 | Espacios externos e internos múltiples | Ignorados al comparar | CA-03 |
| CP-07 | Solo espacios | Equivale a búsqueda vacía | CA-02 |
| CP-08 | Búsqueda + Pendientes / Comprados | Solo productos que cumplen ambos | CA-04 |
| CP-09 | Marcar o desmarcar con búsqueda activa | Vista recalculada con ambos criterios | CA-04 |
| CP-10 | Sin coincidencias con productos | Mensaje `No se encontraron productos que coincidan con "<texto>"` | CA-05 |
| CP-11 | Lista vacía con búsqueda | "Tu lista de compras está vacía" | CA-05 |
| CP-12 | Limpiar búsqueda | Campo vacío, foco en el campo, vista del filtro activo | CA-06 |
| CP-13 | Campo vacío | Botón limpiar deshabilitado | CA-06 |
| CP-14 | Nombres repetidos | Todos los coincidentes, en orden de registro | CA-02 |
| CP-15 | Integridad | Sin mutación, resumen global intacto y sin escrituras en localStorage | FR-007 |
| CP-16 | Caracteres especiales ("(", "*", ".") | Búsqueda literal sin errores | CA-02 |

## Complexity Tracking

Sin violaciones ni complejidad adicional que justificar.
