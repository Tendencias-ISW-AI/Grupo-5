# Feature Specification: SMARLIST-22 — Categorías de productos en la interfaz

**Feature Branch**: `feature/SMARLIST-22-hu-15-categorias-interfaz`

**Created**: 2026-10-14

**Status**: Autorizada para flujo completo SDD

**Input**: Como usuario, quiero elegir la categoría de cada producto al agregarlo o editarlo y verla en la lista, para organizar mejor mi lista de compras. Continuación de SMARLIST-19 (HU-15, criterios 6 y 7).

## Clarifications

### Session 2026-10-14

- Q: ¿Sobre qué base se construye? → A: Sobre la rama de SMARLIST-19 (PR #18), que agrega `category` a la API, porque aún no está en `main`. El PR incluirá esos commits hasta que #18 se fusione.
- Q: ¿De dónde salen las categorías en el frontend? → A: De una constante del frontend con la misma lista fija y orden que el backend (`Otros` por defecto). Una prueba compara ambas listas para evitar que se desincronicen. No se agrega un endpoint nuevo.
- Q: ¿Qué control se usa? → A: Un `<select>` etiquetado "Categoría" en el formulario de registro (valor inicial `Otros`, vuelve a `Otros` tras registrar) y en el formulario de edición (precargado con la categoría actual).
- Q: ¿Cómo se muestra en la lista? → A: Una etiqueta de texto con el nombre de la categoría en cada producto, visible también para productos comprados.
- Q: ¿Qué valida el cliente? → A: `validateProduct` acepta una categoría opcional y la rechaza si no está en la lista; `productsApi` exige que cada producto recibido tenga una categoría válida (ya no acepta productos de cuatro atributos).
- Q: ¿Cambia el filtrado? → A: No. Filtrar o agrupar por categoría es SMARLIST-20.

Sin ambigüedades críticas pendientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir la categoría al registrar (Priority: P1)

**Why this priority**: Es la forma de asignar categorías desde la app (CA-01).

**Independent Test**: Registrar "Leche" eligiendo "Lácteos" y comprobar que la API recibe `category: "Lácteos"` y la lista lo muestra.

**Acceptance Scenarios**:

1. **Given** el formulario de registro, **When** se abre la app, **Then** existe un selector "Categoría" con las 8 categorías y "Otros" seleccionado.
2. **Given** una categoría elegida, **When** se registra el producto, **Then** se envía a la API y, tras la confirmación, el selector vuelve a "Otros".
3. **Given** que no se cambia el selector, **When** se registra, **Then** el producto queda en "Otros".

---

### User Story 2 - Ver la categoría de cada producto (Priority: P1)

**Why this priority**: Criterio 7 de HU-15 (CA-03).

**Independent Test**: Cargar productos con distintas categorías y comprobar que cada fila muestra la suya.

**Acceptance Scenarios**:

1. **Given** productos cargados de la API, **When** se muestra la lista, **Then** cada producto muestra su categoría.
2. **Given** filtros o búsqueda activos, **When** se muestran resultados, **Then** cada uno conserva su categoría visible.

---

### User Story 3 - Cambiar la categoría al editar (Priority: P2)

**Why this priority**: CA-02; completa la gestión de la categoría.

**Independent Test**: Editar un producto de "Despensa", elegir "Bebidas", guardar y comprobar la API y la lista.

**Acceptance Scenarios**:

1. **Given** un producto, **When** se abre su edición, **Then** el selector muestra su categoría actual.
2. **Given** otra categoría elegida, **When** se guarda, **Then** se envía en el PUT y la lista muestra la categoría confirmada.
3. **Given** una edición cancelada, **When** se vuelve a la lista, **Then** la categoría no cambia.

### Edge Cases

- Respuesta de la API sin `category` o con una categoría fuera de la lista: se trata como respuesta inválida y no se confirma el cambio.
- Error de la API al registrar o editar: se conservan el formulario y la categoría elegida.
- Editar solo nombre y cantidad: la categoría precargada se reenvía sin cambios.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario de registro DEBE ofrecer un selector "Categoría" con las categorías válidas en orden fijo y `Otros` por defecto.
- **FR-002**: El formulario de edición DEBE ofrecer el mismo selector precargado con la categoría actual.
- **FR-003**: Cada producto de la lista DEBE mostrar su categoría.
- **FR-004**: `addProduct` y `updateProduct` DEBEN enviar la categoría a la API (POST y PUT) y reflejar el producto confirmado por el servidor.
- **FR-005**: `validateProduct` DEBE rechazar una categoría fuera de la lista; `productsApi` DEBE rechazar productos sin categoría válida.
- **FR-006**: La lista de categorías del frontend DEBE coincidir con la del backend (verificado por prueba).
- **FR-007**: Se conservan búsqueda, filtros, resumen, marcado, eliminación y la gestión de errores y estados de carga existentes.

### Acceptance Criteria (Jira SMARLIST-22)

| Criterio | Descripción | Requisitos |
|---|---|---|
| CA-01 | Selector en agregar, "Otros" por defecto | FR-001 |
| CA-02 | Edición muestra y permite cambiar la categoría | FR-002 |
| CA-03 | Cada producto muestra su categoría | FR-003 |
| CA-04 | Se envía a la API y se refleja lo confirmado | FR-004, FR-005 |
| CA-05 | Pruebas existentes y nuevas | FR-006, FR-007 |

### Key Entities

- **Producto** (API): `id`, `name`, `quantity`, `purchased`, `category`.
- **Categorías**: `Frutas y verduras`, `Carnes y pescados`, `Lácteos`, `Panadería`, `Despensa`, `Bebidas`, `Aseo`, `Otros`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las categorías se pueden elegir al registrar y al editar.
- **SC-002**: El 100 % de los productos visibles muestran su categoría.
- **SC-003**: Cero regresiones en las pruebas del frontend y del backend; la compilación es correcta.

## Assumptions

- PR #18 se fusionará antes que este PR o junto con él.
- Mantener la lista duplicada es aceptable mientras una prueba garantice que coincide con la del backend.
