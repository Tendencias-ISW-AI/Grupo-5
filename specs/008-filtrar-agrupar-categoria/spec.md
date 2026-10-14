# Feature Specification: SMARLIST-20 / HU-16 — Filtrar y agrupar por categoría

**Feature Branch**: `feature/SMARLIST-20-hu-16-filtrar-agrupar-categoria`

**Created**: 2026-10-14

**Status**: Autorizada para flujo completo SDD

**Input**: Como usuario, quiero ver mis productos agrupados y filtrados por categoría, para recorrer el mercado sección por sección.

## Clarifications

### Session 2026-10-14

- Q: ¿Qué control usa el filtro de categoría? → A: Un selector "Categoría" con "Todas" (valor inicial) y las 8 categorías en el orden fijo de HU-15, junto a los botones de estado.
- Q: ¿Con qué se combina? → A: Con el filtro de estado (CA-02) y con la búsqueda por nombre de HU-17; un producto es visible si cumple los tres criterios.
- Q: ¿La agrupación es permanente? → A: No. un botón alternable "Agrupar por categoría", inactivo por defecto, alterna entre la lista plana actual y la vista agrupada ("debe poder mostrarse agrupada").
- Q: ¿Qué cuenta "pendientes" en cada grupo? → A: Los productos pendientes de esa categoría en toda la lista, sin aplicar filtros (como el resumen global). Con el filtro "Comprados" un conteo de solo visibles sería siempre 0. El texto es "N pendiente(s)".
- Q: ¿Qué grupos se muestran? → A: Solo las categorías con al menos un producto visible tras los filtros, en el orden fijo de categorías; dentro de cada grupo se conserva el orden de la lista.
- Q: ¿Qué mensaje sin resultados? → A: Lista vacía → "Tu lista de compras está vacía"; búsqueda → mensaje de HU-17; categoría elegida → "No hay productos en la categoría X" (con "pendientes"/"comprados" si hay filtro de estado); si no, los mensajes de HU-06.
- Q: ¿Se conservan filtros y agrupación al recargar? → A: No; son estado de la interfaz, como el resto de filtros.
- Q: ¿Cambia el resumen? → A: No; sigue siendo global (CA-06).

Sin ambigüedades críticas pendientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar por categoría (Priority: P1)

**Why this priority**: CA-01 y CA-02; permite ver solo una sección del mercado.

**Independent Test**: Con "Leche" (Lácteos, pendiente), "Queso" (Lácteos, comprado) y "Pan" (Panadería), elegir "Lácteos" → Leche y Queso; además "Pendientes" → solo Leche.

**Acceptance Scenarios**:

1. **Given** la lista, **When** se consulta el filtro, **Then** existe un selector "Categoría" con "Todas" seleccionada y una opción por categoría.
2. **Given** una categoría elegida, **When** se muestra la lista, **Then** solo aparecen productos de esa categoría.
3. **Given** categoría y estado elegidos, **When** se muestra la lista, **Then** se aplican ambos (y la búsqueda si existe).
4. **Given** una categoría sin coincidencias, **When** se muestra la lista, **Then** aparece "No hay productos en la categoría X".

---

### User Story 2 - Ver la lista agrupada (Priority: P2)

**Why this priority**: CA-03 a CA-05; recorrer el mercado por secciones.

**Independent Test**: Pulsar "Agrupar por categoría" con productos de Lácteos y Panadería → dos secciones con encabezado y conteo de pendientes.

**Acceptance Scenarios**:

1. **Given** el botón inactivo, **When** se muestra la lista, **Then** la lista es plana como antes.
2. **Given** el botón activo, **When** se muestra la lista, **Then** hay un encabezado por categoría con productos visibles, en el orden fijo de categorías.
3. **Given** un grupo, **When** se lee su encabezado, **Then** indica cuántos productos pendientes tiene esa categoría.
4. **Given** categorías sin productos visibles, **When** se agrupa, **Then** no aparecen.
5. **Given** la vista agrupada, **When** se marca, edita o elimina un producto, **Then** los grupos y conteos se actualizan.

### Edge Cases

- Filtro de categoría + búsqueda + estado sin resultados: prevalece el mensaje de búsqueda (HU-17), luego el de categoría.
- Agrupar con filtros activos: solo grupos con productos visibles.
- Editar la categoría de un producto en la vista agrupada: pasa al grupo correspondiente (o desaparece si no coincide con el filtro).
- Categoría con todos sus productos comprados: el grupo muestra "0 pendientes".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mostrar un selector "Categoría" con "Todas" y las categorías válidas en orden fijo.
- **FR-002**: Filtrar por categoría combinado con estado y búsqueda.
- **FR-003**: Ofrecer un botón alternable "Agrupar por categoría" (inactivo por defecto) que muestre una sección por categoría con encabezado.
- **FR-004**: Cada encabezado DEBE indicar los productos pendientes de la categoría en toda la lista.
- **FR-005**: No mostrar grupos sin productos visibles.
- **FR-006**: Mensaje claro cuando la categoría no tiene coincidencias.
- **FR-007**: El resumen sigue siendo global; filtros y agrupación no modifican productos ni llaman a la API.
- **FR-008**: Sin cambios en backend, hook ni API.

### Acceptance Criteria (Jira SMARLIST-20)

| Criterio | Descripción | Requisitos |
|---|---|---|
| CA-01 | Filtro de categoría con "Todas" y una opción por categoría | FR-001 |
| CA-02 | Se combina con el filtro por estado | FR-002 |
| CA-03 | Lista agrupada con encabezado por grupo | FR-003 |
| CA-04 | Cada grupo indica sus pendientes | FR-004 |
| CA-05 | Sin grupos vacíos | FR-005 |
| CA-06 | El resumen sigue funcionando con filtros | FR-007 |

### Key Entities

- **Criterios de filtrado** (interfaz): `status`, `query` (HU-17) y `category` (`all` o una categoría).
- **Grupo** (derivado): `{ category, items, pending }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las combinaciones probadas de categoría, estado y búsqueda muestran exactamente los productos esperados.
- **SC-002**: El 100 % de los grupos mostrados tiene encabezado y conteo correcto; ninguno vacío.
- **SC-003**: Cero regresiones; compilación correcta.

## Assumptions

- La lista de categorías es la de `src/utils/productCategories.js` (HU-15).
- No se requiere persistir filtros ni agrupación.
