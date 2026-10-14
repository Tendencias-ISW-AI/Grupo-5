# Feature Specification: SMARLIST-19 / HU-15 — Categorías de productos (backend)

**Feature Branch**: `feature/SMARLIST-19-hu-15-categorias-productos`

**Created**: 2026-10-14

**Status**: Autorizada para flujo completo SDD (alcance backend)

**Input**: Como usuario, quiero asignar una categoría a cada producto (por ejemplo Frutas y verduras, Lácteos, Aseo), para organizar mejor mi lista de compras.

## Clarifications

### Session 2026-10-14

- Q: ¿Qué alcance tiene esta entrega? → A: Solo backend (criterios 1–5 y 8). Los criterios 6 y 7 (selector en `ShoppingForm`/edición y categoría visible en `ShoppingItem`) dependen de la integración full stack SMARLIST-15 (HU-14), en curso sobre `useShoppingList`; se implementarán cuando esa historia esté en `main`. Decisión expresa del usuario.
- Q: ¿Cuál es el conjunto fijo de categorías? → A: `Frutas y verduras`, `Carnes y pescados`, `Lácteos`, `Panadería`, `Despensa`, `Bebidas`, `Aseo` y `Otros` (por defecto). Incluye los tres ejemplos de la historia.
- Q: ¿Cómo se compara una categoría recibida? → A: Coincidencia exacta con un valor de la lista (mayúsculas, tildes y espacios incluidos). No se normaliza ni se recorta; cualquier otro valor, incluido `null`, es inválido.
- Q: ¿Es obligatoria en POST? → A: No. Si se omite, el producto se crea con `Otros`.
- Q: ¿Qué hace PUT si se omite la categoría? → A: Conserva la categoría actual del producto, para no borrarla en clientes que solo editan nombre y cantidad. Si se envía, la reemplaza.
- Q: ¿Cómo quedan los productos existentes? → A: La inicialización (`npm run db:init`) agrega la columna `category` con valor por defecto `Otros` a una tabla `products` compatible de la versión anterior, de modo que todos los registros existentes quedan en `Otros`, sin alterar otros datos.
- Q: ¿Se valida también en MySQL? → A: La columna es `NOT NULL` con valor por defecto `Otros`; la lista de valores válidos se valida en el servicio (regla de negocio), igual que el resto de reglas de HU-11/HU-12. No se agrega `CHECK` de categorías para no acoplar la verificación del esquema a la lista.
- Q: ¿Cambia la forma de las respuestas? → A: Sí. GET, POST y PUT devuelven el producto con cinco atributos: `id`, `name`, `quantity`, `purchased`, `category`. DELETE no cambia.

Sin ambigüedades críticas pendientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar y editar productos con categoría (Priority: P1)

Un cliente de la API asigna una categoría al crear un producto y puede cambiarla al editarlo; las consultas devuelven la categoría guardada.

**Why this priority**: Es el valor central de HU-15.

**Independent Test**: `POST {name:"Leche", quantity:1, category:"Lácteos"}` → 201 con `category:"Lácteos"`; `PUT` con `category:"Bebidas"` → 200; `GET` devuelve `Bebidas`.

**Acceptance Scenarios**:

1. **Given** una categoría válida, **When** se envía POST, **Then** 201 y el producto creado incluye esa categoría.
2. **Given** un POST sin categoría, **When** se procesa, **Then** el producto se crea con `Otros`.
3. **Given** un producto existente, **When** se envía PUT con categoría válida, **Then** 200 con la nueva categoría y el mismo ID y estado.
4. **Given** un producto con categoría `Lácteos`, **When** se envía PUT solo con nombre y cantidad, **Then** conserva `Lácteos`.
5. **Given** productos con categoría, **When** se consulta GET, **Then** cada uno incluye su categoría.

---

### User Story 2 - Rechazar categorías no válidas (Priority: P2)

Las categorías fuera de la lista se rechazan con 400 sin modificar ningún registro.

**Why this priority**: Integridad de datos (criterio 4).

**Independent Test**: `POST`/`PUT` con `category:"Juguetes"`, `"lácteos"`, `""`, `null` o `5` → 400 y ninguna consulta SQL.

**Acceptance Scenarios**:

1. **Given** una categoría inexistente o con distinta escritura, **When** POST o PUT, **Then** 400 con mensaje público y sin acceso a MySQL.
2. **Given** una categoría de tipo distinto de string o `null`, **When** POST o PUT, **Then** 400.

---

### User Story 3 - Productos existentes en "Otros" (Priority: P3)

Al inicializar una base de la versión anterior, todos los productos existentes quedan con categoría `Otros`.

**Why this priority**: Compatibilidad con datos ya guardados (criterio 5).

**Independent Test**: Inicialización sobre una tabla de cuatro columnas compatible → se ejecuta un único `ALTER TABLE ... ADD COLUMN category ... DEFAULT 'Otros'`; una segunda inicialización no ejecuta DDL.

**Acceptance Scenarios**:

1. **Given** una tabla `products` compatible sin `category`, **When** `db:init`, **Then** se agrega la columna con `Otros` y la estructura resultante se verifica.
2. **Given** una tabla con `category` correcta, **When** `db:init`, **Then** no se ejecuta DDL.
3. **Given** una base nueva, **When** `db:init`, **Then** la tabla se crea ya con `category`.
4. **Given** una tabla incompatible, **When** `db:init`, **Then** se detiene sin modificarla.

### Edge Cases

- Categoría con espacios externos (`" Lácteos "`) o en minúsculas (`"lácteos"`): 400, no se normaliza.
- Cuerpo con `category` y campos no permitidos (`id`, `purchased`, otros): 400 como antes.
- PUT sobre producto inexistente con categoría válida: 404 sin crear registros.
- Fila almacenada con categoría fuera de la lista: GET responde 500 genérico (dato incompatible), igual que otras filas inválidas.
- Repetir `db:init` tras la migración: idempotente, sin DDL.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La tabla `products` DEBE incluir `category VARCHAR(30) NOT NULL DEFAULT 'Otros'`, tanto en `schema.sql` como en la inicialización.
- **FR-002**: DEBE existir un conjunto fijo de categorías válidas en un único módulo del backend, con `Otros` como valor por defecto.
- **FR-003**: `POST /api/products` DEBE aceptar `category` opcional; si se omite se usa `Otros`.
- **FR-004**: `PUT /api/products/:id` DEBE aceptar `category` opcional; si se omite se conserva la actual.
- **FR-005**: Una categoría no válida DEBE responder 400 con `{"error":{"message":"..."}}` antes de cualquier consulta SQL.
- **FR-006**: `db:init` DEBE migrar una tabla compatible sin `category` agregando la columna con `Otros`, sin otros cambios, y ser idempotente.
- **FR-007**: GET, POST y PUT DEBEN devolver `category` junto a los cuatro atributos existentes; GET DEBE rechazar filas con categoría inválida.
- **FR-008**: Las consultas DEBEN seguir parametrizadas; se conservan los contratos 404/503/500, DELETE y `/health`. Sin cambios en el frontend ni dependencias nuevas.

### Acceptance Criteria (Jira SMARLIST-19)

| Criterio | Descripción | Requisitos | Estado en esta entrega |
|---|---|---|---|
| CA-01 | Campo `category` en `products` | FR-001, FR-006 | Incluido |
| CA-02 | Conjunto fijo con "Otros" por defecto | FR-002 | Incluido |
| CA-03 | POST y PUT aceptan la categoría | FR-003, FR-004 | Incluido |
| CA-04 | Categoría no válida → 400 sin modificar registros | FR-005 | Incluido |
| CA-05 | Existentes sin categoría quedan en "Otros" | FR-006 | Incluido |
| CA-06 | Formulario de agregar/editar permite elegir categoría | — | Diferido (depende de SMARLIST-15) |
| CA-07 | Cada producto muestra su categoría en la lista | — | Diferido (depende de SMARLIST-15) |
| CA-08 | Pruebas existentes pasan y hay pruebas nuevas | FR-007, FR-008 | Incluido (backend) |

### Key Entities

- **Producto**: `id: string`, `name: string`, `quantity: number`, `purchased: boolean`, `category: string` (nuevo, uno de las categorías válidas).
- **Categoría**: valor de un conjunto fijo y ordenado; no es una tabla ni una entidad editable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las categorías válidas se pueden registrar y editar, y se devuelven idénticas en GET.
- **SC-002**: El 100 % de las categorías inválidas probadas responden 400 sin ejecutar SQL.
- **SC-003**: El 100 % de los productos existentes queda en `Otros` tras la inicialización, sin otros cambios.
- **SC-004**: Cero regresiones en las pruebas del backend y del frontend; la compilación del frontend es correcta.

## Assumptions

- La lista de categorías es una decisión de producto razonable a partir de los ejemplos de la historia; se cambia en un solo módulo.
- Las pruebas de integración con MySQL real se actualizan y amplían, pero no se ejecutan en esta entrega por falta de credenciales locales (`backend/.env`).
- Los criterios 6 y 7 se cubrirán en una entrega posterior de SMARLIST-19 sobre la integración de SMARLIST-15.
