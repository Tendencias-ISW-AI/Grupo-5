# Feature Specification: SMARLIST-21 / HU-17 — Búsqueda de productos por nombre

**Feature Branch**: `feature/SMARLIST-21-hu-17-busqueda-productos`

**Created**: 2026-10-14

**Status**: Autorizada para flujo completo SDD

**Input**: Como usuario, quiero buscar productos por su nombre, para encontrar rápidamente un artículo en una lista larga.

## Clarifications

### Session 2026-10-14

- Q: ¿Qué capa abarca la historia? → A: Solo frontend (React). No se modifica `backend/` ni el hook `useShoppingList`, que está siendo trabajado en SMARLIST-15 (integración full stack). La búsqueda opera sobre la colección que el hook ya expone.
- Q: ¿Cómo se cumple el criterio "combinarse con los filtros de estado y categoría" si la categoría aún no existe? → A: La categoría corresponde a SMARLIST-19 (HU-15) y SMARLIST-20 (HU-16), ambas pendientes. La búsqueda se combina hoy con el filtro de estado y la lógica de filtrado queda preparada para incorporar un criterio de categoría sin reescribir la búsqueda ni el filtro de estado. No se agrega el atributo `category` al modelo.
- Q: ¿Qué significa "coincidir"? → A: El texto buscado debe aparecer en cualquier posición del nombre (coincidencia parcial), después de normalizar ambos textos.
- Q: ¿Qué normalización se aplica? → A: Minúsculas, eliminación de tildes y diacríticos, espacios externos recortados y espacios internos consecutivos reducidos a uno. "limon" encuentra "Limón" y "LIMÓN"; como efecto de quitar diacríticos, "pina" también encuentra "Piña".
- Q: ¿Qué ocurre con una búsqueda vacía o solo con espacios? → A: Equivale a no buscar: se muestran los productos del filtro de estado activo con sus mensajes actuales.
- Q: ¿Se conserva la búsqueda al recargar? → A: No. Igual que el filtro de estado (HU-06/HU-07), la búsqueda vive en memoria y no se escribe en localStorage.
- Q: ¿Qué mensaje se muestra sin coincidencias? → A: `No se encontraron productos que coincidan con "<texto>"`, mostrando el texto tal como lo escribió el usuario (recortado). Si la lista original está vacía, se conserva "Tu lista de compras está vacía".

Sin ambigüedades críticas pendientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar un producto mientras se escribe (Priority: P1)

El usuario escribe parte del nombre de un producto en un campo visible sobre la lista y la lista se reduce, en cada pulsación, a los productos cuyo nombre contiene ese texto, sin importar mayúsculas, minúsculas ni tildes.

**Why this priority**: Es el objetivo central de HU-17; por sí sola ya permite localizar artículos en una lista larga.

**Independent Test**: Registrar "Limón", "Leche" y "Arroz", escribir "limon" y comprobar que solo aparece "Limón"; escribir "LE" y comprobar que aparece "Leche".

**Acceptance Scenarios**:

1. **Given** la aplicación abierta, **When** el usuario observa la sección de la lista, **Then** existe un campo de búsqueda etiquetado ubicado antes de la lista.
2. **Given** productos registrados, **When** el usuario escribe cada carácter, **Then** la lista visible se actualiza inmediatamente sin enviar formularios ni recargar.
3. **Given** el producto "Limón", **When** busca "limon", "LIMÓN" o "imó", **Then** "Limón" aparece en los resultados.
4. **Given** nombres repetidos, **When** busca ese nombre, **Then** se muestran todos los registros coincidentes en su orden de registro.

---

### User Story 2 - Combinar búsqueda con el filtro de estado (Priority: P2)

El usuario puede buscar dentro de los productos pendientes o comprados: ambos criterios se aplican a la vez.

**Why this priority**: Criterio 4 de la historia; aporta precisión cuando la lista es larga.

**Independent Test**: Con "Leche" pendiente y "Lechuga" comprada, buscar "lech" con el filtro Pendientes y comprobar que solo aparece "Leche".

**Acceptance Scenarios**:

1. **Given** una búsqueda activa, **When** cambia el filtro de estado, **Then** solo se muestran productos que cumplen ambos criterios.
2. **Given** una búsqueda activa, **When** marca, desmarca, edita o elimina un producto, **Then** la lista visible se recalcula con ambos criterios.
3. **Given** una búsqueda activa, **When** registra un producto que coincide (o no), **Then** aparece (o no) según los criterios vigentes.
4. **Given** cualquier búsqueda, **When** se consulta el resumen de compras, **Then** el resumen sigue representando toda la lista.

---

### User Story 3 - Estado vacío y limpieza de la búsqueda (Priority: P3)

Si nada coincide, el usuario recibe un mensaje claro y dispone de una opción para limpiar la búsqueda y volver a ver la lista.

**Why this priority**: Criterios 5 y 6; mejora la comprensión y la recuperación ante búsquedas fallidas.

**Independent Test**: Buscar "xyz", comprobar el mensaje sin coincidencias, pulsar "Limpiar búsqueda" y comprobar que el campo queda vacío y reaparecen todos los productos del filtro activo.

**Acceptance Scenarios**:

1. **Given** productos registrados, **When** la búsqueda no tiene coincidencias, **Then** se muestra `No se encontraron productos que coincidan con "<texto>"`.
2. **Given** la lista original vacía, **When** se escribe una búsqueda, **Then** se conserva "Tu lista de compras está vacía".
3. **Given** una búsqueda escrita, **When** pulsa "Limpiar búsqueda", **Then** el campo queda vacío, recibe el foco y se muestran los productos del filtro activo.
4. **Given** el campo vacío, **When** consulta la opción de limpiar, **Then** está deshabilitada.

---

### Edge Cases

- Búsqueda solo con espacios: se trata como vacía; no se muestra mensaje de búsqueda.
- Espacios internos múltiples ("arroz   integral") coinciden con "Arroz integral".
- Tildes en la búsqueda y no en el nombre ("arróz" → "Arroz"): coincide, la normalización es simétrica.
- Caracteres especiales de expresiones regulares ("(", "*", "."): se tratan como texto literal, sin errores.
- Producto en edición que deja de coincidir al cambiar la búsqueda: se oculta y su borrador se descarta, igual que con el filtro de estado (HU-06).
- Editar el nombre de un producto visible para que deje de coincidir: desaparece de la vista; los datos guardados son los editados.
- Búsqueda + filtro sin resultados: prevalece el mensaje de búsqueda, que es la causa más específica que el usuario puede corregir.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mostrar un campo de búsqueda con etiqueta accesible "Buscar producto" dentro de la sección de la lista, antes de los filtros y del listado.
- **FR-002**: Filtrar la lista visible en cada cambio del campo, sin acción de envío.
- **FR-003**: Comparar nombre y búsqueda tras normalizarlos: minúsculas, sin tildes ni diacríticos, recortados y con espacios internos reducidos. Coincide si el nombre normalizado contiene la búsqueda normalizada.
- **FR-004**: Aplicar la búsqueda junto con el filtro de estado activo (Todos, Pendientes, Comprados). La lógica de filtrado debe aceptar criterios adicionales (categoría, SMARLIST-20) sin modificar los existentes.
- **FR-005**: Sin coincidencias y con productos registrados, mostrar `No se encontraron productos que coincidan con "<texto>"` en la región de estado de la lista. Con la lista original vacía, conservar "Tu lista de compras está vacía". Sin búsqueda, conservar los mensajes de HU-06.
- **FR-006**: Ofrecer el botón "Limpiar búsqueda" que vacía el campo, devuelve el foco al campo y restaura la vista del filtro activo; deshabilitado cuando el campo está vacío.
- **FR-007**: La búsqueda no agrega, modifica, reordena ni elimina productos; no escribe en localStorage ni altera el resumen de compras.
- **FR-008**: Conservar sin cambios `backend/`, `src/hooks/useShoppingList.js`, el modelo de producto, la persistencia y el comportamiento de HU-01 a HU-08.

### Acceptance Criteria (Jira SMARLIST-21)

| Criterio | Descripción | Requisitos |
|---|---|---|
| CA-01 | Campo de búsqueda visible sobre la lista | FR-001 |
| CA-02 | Filtra mientras se escribe | FR-002 |
| CA-03 | Sin distinción de mayúsculas, minúsculas ni tildes | FR-003 |
| CA-04 | Se combina con filtros de estado y categoría | FR-004 (estado hoy; categoría preparada) |
| CA-05 | Mensaje claro sin coincidencias | FR-005 |
| CA-06 | Opción para limpiar la búsqueda | FR-006 |

### Key Entities

- **Producto** (existente, sin cambios): `id: string`, `name: string`, `quantity: number`, `purchased: boolean`.
- **Criterios de filtrado** (estado de interfaz, no persistente): `status` (`all` | `pending` | `purchased`) y `query` (texto libre). Preparado para un futuro `category`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los casos de prueba de búsqueda (CP-01 a CP-16) se aprueba con pruebas automatizadas.
- **SC-002**: Escribir un carácter actualiza la lista visible en la misma interacción, sin pasos adicionales del usuario.
- **SC-003**: El 100 % de las variantes con mayúsculas o tildes probadas encuentra el mismo producto que su forma sin tildes.
- **SC-004**: Cero regresiones: todas las pruebas existentes del frontend y del backend siguen aprobadas y la compilación de producción es correcta.

## Assumptions

- La categoría de producto no existe todavía; su filtro se integrará en SMARLIST-20 reutilizando la función de filtrado.
- Quitar diacríticos hace que "n" y "ñ" coincidan; se acepta como comportamiento habitual de búsqueda.
- No se requiere debounce: la lista es local y pequeña.
- No se resaltan coincidencias ni se ordena por relevancia; se mantiene el orden de registro.
- La búsqueda se reinicia al recargar la página.
