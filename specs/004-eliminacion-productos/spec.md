# Feature Specification: SMARLIST-14 / HU-13 — Eliminación de productos

**Feature Branch**: `feature/SMARLIST-14-hu-13-eliminacion-de-productos`
**Created**:2026-10-13
**Status**:Autorizada para flujo completo SDD
**Input**: Como usuario, quiero eliminar productos de la base de datos para mantener mi lista actualizada y evitar que vuelvan a aparecer.

## Clarifications

### Session 2026-10-13

- Q: ¿Cómo se elimina? → A: Físicamente porUUID,no nombre ni estado,sin recuperación o borrado lógico.
- Q: ¿Qué responde éxito? → A:204 sin cuerpoJSON.
- Q: ¿Qué responde ausencia o repetición? → A:404, incluso segundoDELETE,sin éxito falso.
- Q: ¿Cómo validar identidad? → A: Reutilizar base deHU12 y exigir formatoUUID solo paraDELETE por decisión expresa;400 antes deSQL,sin normalización.
- Q: ¿Cómo tratar fallos y datos previos? → A:503/500 seguros existentes;pruebas solo sobre fixtures propios y conservación íntegra de datos anteriores.

Sin ambigüedades críticas. Supuestos menores sobre formatoUUID y ausencia de cuerpo documentados;PUT sigue su contrato histórico. No se añaden autenticación,métricas de rendimiento o funcionalidades futuras.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retirar un producto persistentemente (Priority: P1)

Eliminar por identidad tanto pendientes como comprados sin afectar los demás registros.
**Why this priority**: Objetivo central deHU13.
**Independent Test**: Crear fixtures propios,eliminar uno,verificar204 sin cuerpo,ausencia en consultas y tras reinicio,y otros productos intactos.
**Acceptance Scenarios**:
1. **Given** un producto pendiente o comprado, **When** DELETE por su UUID, **Then**204 sin JSON y el producto desaparece persistentemente.
2. **Given** varios productos,incluidos nombres repetidos, **When** se elimina uno porID, **Then** los demás conservan nombre,cantidad,estado e identidad.
3. **Given** eliminación confirmada, **When** GET o reinicio de servidor, **Then** el registro no reaparece.

### User Story 2 - Rechazar eliminación inválida o inexistente (Priority: P2)

Distinguir una eliminación real de identidad inválida,inexistencia o indisponibilidad,sin divulgar detalles.
**Why this priority**: Integridad y errores comprensibles.
**Independent Test**: UUID inválido400 sin almacenamiento,inexistente404,segundo DELETE404 y falla503 sin datos sensibles.
**Acceptance Scenarios**:
1. **Given** identificador inválido, **When** DELETE, **Then**400 sin ejecutar eliminación.
2. **Given** UUID válido inexistente o previamente eliminado, **When** DELETE, **Then**404 y colección intacta.
3. **Given** MySQL inaccesible, **When** DELETE válido, **Then**503 con contrato seguro existente y sin éxito falso.

### Edge Cases

- UUID formato hexadecimal8-4-4-4-12,sin espacios,case-insensitive para validación. No imponer versión específica ni convertir el valor:comparación por identidad exacta según esquema existente.
- PUT conserva validación string histórica; UUID más específico aplica solo al nuevo DELETE por decisión expresa del usuario.
- Segundo DELETE404; no recuperación,borrado lógico,papelera o restauración.
- Identidad proviene solo del parámetro de ruta; cuerpo,nombre y purchased no seleccionan registros.
- Ruta sin/:id no coincide y conserva404 de rutas inexistentes. Parámetro inválido400.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Exponer DELETE /api/products/:id exclusivamente en backend.
- **FR-002**: Validar identificador UUID antes de acceder a almacenamiento;inválido400,error.message público. Reutilizar validación básica vigente sin alterar PUT.
- **FR-003**: Eliminar físicamente solo registro con eseID,sin distinguir purchased;conservar todos los demás,independientes de nombres repetidos.
- **FR-004**: Eliminación confirmada204 sin cuerpo ni JSON.
- **FR-005**: UUID válido inexistente404 con {"error":{"message":"Producto no encontrado."}};segundo intento404,no éxito silencioso.
- **FR-006**: Registro eliminado no vuelve en GET o reinicio;no soft delete,recuperación o atributos nuevos.
- **FR-007**: Indisponibilidad503 {"error":"Servicio temporalmente no disponible"};inesperado500 genérico existente,sin secretos o detalles internos.
- **FR-008**: Conservar GET/POST/PUT,frontend,localStorage,esquema,dependencias y artefactos previos. Pruebas reales solo modifican fixtures propios y deben retirarlos completamente.

### Acceptance Criteria

| Criterio | Requisito aprobado |
|---|---|
| CA-01 | DELETE/api/products/:id |
| CA-02 | Solo producto porID |
| CA-03 | Otros productos intactos |
| CA-04 | HTTP204 al eliminar |
| CA-05 | Inexistente404 |
| CA-06 | Ausente en futuras consultas |

### Key Entities

Producto existente:modelo de cuatro atributos intacto. Eliminación física,no nueva entidad o estado. ID UUID identifica registro;name no participa en selección.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**:100% de eliminaciones válidas probadas responden sin contenido y no reaparecen tras consultar/reiniciar.
- **SC-002**:100% de registros distintos del eliminado conserva sus cuatro atributos,incluidos duplicados.
- **SC-003**:100% de identificadores inválidos/inexistentes o fallos probados produce error controlado,sin eliminación indebida o detalles sensibles.
- **SC-004**:CP01–19 y regresiones anteriores verificadas;datos previos y esquema intactos,cero fixtures restantes.

## Assumptions

- UUID es representación hexadecimal8-4-4-4-12,no restringida av4;se acepta mayúscula/minúscula en formato pero no se normaliza identidad.
- Sin criterio nuevo para PUT ni cambios en modelo general:id sigue string. DELETE de IDs históricos noUUID devuelve400,conforme al alcance UUID expresamente aprobado.
- Sin autenticación,integraciónReact,papelera,confirmaciones o cambio de estado.
- Fixtures y limpieza limitados a sus IDs;datos existentes del usuario jamás utilizados como objetivos de DELETE.
- No objetivos de rendimiento inventados. Errores reutilizan convenciones HTTP existentes.
