# Feature Specification: SMARLIST-13 / HU-12 — Edición de productos

**Feature Branch**: `feature/SMARLIST-13-hu-12-edicion-de-productos`
**Created**: 2026-10-13
**Status**: Autorizada para flujo SDD completo
**Input**: Como usuario, quiero modificar nombre y cantidad de productos almacenados sin perder su identificador ni estado de compra.

## Clarifications

### Session 2026-10-13

- Q: ¿PUT es completo? → A: Sí, exige nombre y cantidad, sin PATCH ni upsert.
- Q: ¿Qué atributos se conservan? → A: id y purchased vigentes; solo nombre/cantidad editables.
- Q: ¿Qué validaciones y errores aplicar? → A: Reutilizar POST;400 inválido,404 inexistente,200 actualización y503/500 seguros existentes.
- Q: ¿Qué ocurre con valores iguales? → A: Producto existente responde200; cero filas cambiadas no significa inexistencia.
- Q: ¿Cuál es el formato de ID? → A: String compatible con el modelo HU-09,1..36 unidades UTF-16 bien formado y sin espacios externos; no se impone UUID ni se normaliza.

Sin ambigüedades críticas. Prioridad de validación y rechazo de campos adicionales documentados como decisiones menores compatibles con POST. No se introducen objetivos de rendimiento, autenticación o nuevas entidades.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Corregir un producto (Priority: P1)

Editar completamente nombre y cantidad, conservando identidad, estado y registros restantes.
**Why this priority**: Objetivo central de HU-12.
**Independent Test**: Editar un producto pendiente/comprado y recuperar los cuatro atributos; comprobar otros productos intactos.
**Acceptance Scenarios**:
1. **Given** producto existente, **When** PUT con nombre y cantidad válidos, **Then**200 producto JSON actualizado sin cambiar id/purchased.
2. **Given** producto comprado, **When** se edita, **Then** sigue comprado y únicamente cambian nombre/cantidad.
3. **Given** valores iguales a los guardados, **When** PUT válido, **Then**200 con producto, sin falso404.
4. **Given** nombres repetidos, **When** se edita por ID, **Then** solo ese registro cambia.
5. **Given** edición confirmada, **When** GET o reinicio del servidor, **Then** se recuperan los mismos datos actualizados.

### User Story 2 - Rechazar edición inválida o inexistente (Priority: P2)

Recibir error claro sin modificar productos ni crear registros.
**Why this priority**: Integridad de datos y distinción entre inválido, inexistente e indisponible.
**Independent Test**: Datos/ID inválidos400, ID válido inexistente404, almacenamiento inaccesible503; colección intacta.
**Acceptance Scenarios**:
1. **Given** nombre/cantidad inválidos, campos faltantes o adicionales, **When** PUT, **Then**400 sin modificar datos.
2. **Given** intento de establecer id/purchased, **When** PUT, **Then**400 sin modificación.
3. **Given** ID inválido, **When** PUT, **Then**400 antes de acceder a almacenamiento.
4. **Given** ID válido inexistente y cuerpo válido, **When** PUT, **Then**404 sin creación automática.
5. **Given** MySQL indisponible, **When** PUT, **Then**503 seguro conforme a HU-09.

### Edge Cases

- Nombre trim, string UTF-8 válido no vacío de hasta150 caracteres Unicode; quantity number entero1..2147483647, sin coerción.
- Cuerpo ausente, null, arreglo, JSON corrupto, id/purchased o campo extra:400.
- ID string bien formado,1..36 unidades UTF-16, sin espacios externos; no se normaliza ni restringe a UUID para conservar compatibilidad con IDs válidos de HU-09.
- ID y cuerpo se validan antes de buscar; cuerpo inválido prevalece sobre404 para ID válido inexistente.
- Ediciones concurrentes del mismo producto se serializan; no se incluye control de versiones u optimista. Se conserva purchased vigente al bloquear el registro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Exponer PUT /api/products/:id para actualización completa, sin PATCH.
- **FR-002**: Exigir exclusivamente name y quantity y aplicar exactamente validaciones/límites de POST, normalizando únicamente name con trim.
- **FR-003**: Validar ID como string bien formado1..36, no vacío ni espacios externos; inválido400 antes de almacenamiento. Mantener ID original, sin UUID nuevo.
- **FR-004**: Actualizar solo name/quantity del registro identificado y preservar purchased y todos los demás productos; nombres repetidos permitidos.
- **FR-005**: Registro inexistente con datos válidos responde404 y no se crea. Valores sin cambios en registro existente responden200.
- **FR-006**: Respuesta200 es producto JSON directo con exactamente id:string,name:string,quantity:number,purchased:boolean.
- **FR-007**: Datos inválidos400 sin modificación; id/purchased y campos desconocidos rechazados. Errores400/404 siguen estructura error.message; MySQL503 {"error":"Servicio temporalmente no disponible"}, inesperado500 genérico existente.
- **FR-008**: Conservar GET/POST y persistir edición tras reiniciar. No cambiar frontend, esquema, dependencias o credenciales ni implementar eliminación/cambio de estado.

### Acceptance Criteria

| Criterio | Requisito aprobado |
|---|---|
| CA-01 | El backend expone PUT /api/products/:id |
| CA-02 | Permite actualizar nombre y cantidad |
| CA-03 | Mismas validaciones utilizadas en registro |
| CA-04 | Conserva identificador y purchased |
| CA-05 | Modifica únicamente producto seleccionado por ID |
| CA-06 | Si no existe responde404 |
| CA-07 | Devuelve producto actualizado en JSON |

### Key Entities

Producto existente con los cuatro atributos vigentes. Campos editables:name/quantity. Inmutables durante edición:id/purchased. Sin nuevas entidades o propiedades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**:100% de ediciones válidas probadas recuperables con atributos actualizados e id/purchased conservados, incluidos mismos valores y nombres repetidos.
- **SC-002**:100% de entradas inválidas/inexistentes probadas deja colección sin cambios y sin nuevos productos.
- **SC-003**:Registros anteriores y demás productos permanecen100% intactos durante edición y tras reinicio.
- **SC-004**:Todos los errores previstos son controlados sin detalles internos y regresiones anteriores permanecen aprobadas.

## Assumptions

- ID genérico compatible con HU-09; no nueva exigencia de UUID, ni normalización silenciosa.
- No se agrega control optimista, historial, PATCH, upsert, eliminación o cambio de estado.
- Mensajes400 reutilizan registro;404 utiliza Producto no encontrado.;503/500 conservan HU-09.
- No se inventan objetivos de rendimiento. MySQL y esquema existentes; fixtures propios y limpieza limitada a sus IDs.
