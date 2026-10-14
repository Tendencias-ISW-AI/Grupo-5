# Feature Specification: SMARLIST-12 / HU-11 — Registro de productos

**Feature Branch**: `feature/SMARLIST-12-hu-11-registro-de-productos`
**Created**: 2026-10-13
**Status**: Especificación autorizada para flujo SDD completo
**Input**: Como usuario, quiero agregar productos a mi lista y almacenarlos en una base de datos, para conservar la información de mis compras.

## Clarifications

### Session 2026-10-13

- Q: ¿Quién controla identidad y estado inicial? → A: El servidor genera UUID y purchased=false; rechaza id/purchased del cliente.
- Q: ¿Cómo validar nombre y cantidad? → A: String normalizado con trim, number entero positivo sin conversiones y límites del esquema existente.
- Q: ¿Se permiten nombres repetidos? → A: Sí, con IDs independientes y sin deduplicación.
- Q: ¿Qué respuestas corresponden? → A: 201 producto creado, 400 solicitud inválida sin INSERT, 503 y 500 seguros conforme a HU-09.
- Q: ¿Cuál es el alcance adicional aprobado? → A: Solo texto del h1 de React, como mantenimiento separado; sin integración API.

No se detectaron ambigüedades críticas. Supuestos menores: campos adicionales rechazados, nombre UTF-8 válido hasta 150 caracteres Unicode, quantity hasta el máximo INT firmado y errores 400 con error.message. No se añaden objetivos de rendimiento, autenticación o reintentos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar y recuperar un producto (Priority: P1)

El usuario registra nombre y cantidad y recibe un producto pendiente con identidad propia, recuperable en la consulta existente.
**Why this priority**: Proporciona registro persistente, objetivo central de HU-11.
**Independent Test**: Registrar datos válidos y comprobar respuesta, almacenamiento y recuperación sin modificar registros anteriores.
**Acceptance Scenarios**:
1. **Given** nombre Arroz y cantidad 2, **When** se registra, **Then** responde 201 con id único, name Arroz, quantity 2 y purchased false.
2. **Given** nombre con espacios externos, **When** se registra, **Then** conserva el nombre normalizado con trim.
3. **Given** dos solicitudes con el mismo nombre, **When** se registran, **Then** reciben identificadores distintos y registros independientes.
4. **Given** un producto creado, **When** se consulta después de reabrir la conexión, **Then** sus cuatro atributos están conservados y los registros anteriores siguen intactos.

### User Story 2 - Rechazar solicitudes inválidas y controlar fallos (Priority: P2)

El usuario recibe errores claros sin que se guarden registros inválidos ni se divulguen detalles internos.
**Why this priority**: Protege integridad de datos y seguridad.
**Independent Test**: Solicitudes inválidas no invocan inserción; almacenamiento inaccesible genera error controlado.
**Acceptance Scenarios**:
1. **Given** nombre no string, vacío o únicamente espacios; cantidad ausente, string, cero, negativa, decimal o fuera de rango, **When** se registra, **Then** responde 400 y no inserta.
2. **Given** id, purchased o campos adicionales en la solicitud, **When** se registra, **Then** responde 400 sin insertar ni permitir asignación de campos del servidor.
3. **Given** almacenamiento no disponible, **When** se registra, **Then** responde 503 con el mismo mensaje público de HU-09, sin credenciales, SQL o trazas.

### Edge Cases

- Cuerpo ausente, null, arreglo, primitivo o JSON malformado: rechazo sin inserción.
- Nombres repetidos permitidos; espacios externos eliminados, espacios internos conservados.
- Nombre normalizado máximo 150 caracteres Unicode y válido para almacenamiento UTF-8; cantidad máxima 2147483647, sin conversiones numéricas automáticas.
- Pérdida de respuesta después de una escritura: no se promete deduplicación de reintentos ni idempotencia; cada registro válido genera nueva identidad.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Exponer POST /api/products para recibir un objeto JSON con exclusivamente name y quantity.
- **FR-002**: name debe ser string, normalizado con trim, no vacío y máximo 150 caracteres; quantity debe ser number entero positivo y máximo 2147483647. Validar antes de insertar; no convertir strings ni truncar datos.
- **FR-003**: El servidor genera UUID y purchased=false; rechazar cualquier campo id o purchased del cliente, incluso null o false, y cualquier campo adicional.
- **FR-004**: Persistir exactamente id, name, quantity, purchased, conservar datos existentes y permitir nombres repetidos con IDs distintos.
- **FR-005**: Registro exitoso responde HTTP 201 con producto JSON directo y únicamente los cuatro atributos del modelo.
- **FR-006**: Datos o cuerpo inválidos responden HTTP 400 sin inserción. El error utiliza la estructura existente error.message con mensaje público en español, sin detalles internos.
- **FR-007**: Indisponibilidad mantiene HTTP 503 y {"error":"Servicio temporalmente no disponible"}; errores inesperados mantienen 500 genérico de HU-09.
- **FR-008**: GET /api/products conserva contrato, orden y solo lectura, y recupera productos creados.
- **FR-009**: Mantener esquema, credenciales locales excluidas, dependencias y ausencia de integración React–API. No implementar edición, eliminación o cambio de estado.

### Acceptance Criteria

| Criterio | Requisito aprobado |
|---|---|
| CA-01 | Exponer POST /api/products |
| CA-02 | Recibir el nombre y la cantidad del producto |
| CA-03 | Rechazar nombres vacíos y cantidades que no sean números enteros positivos |
| CA-04 | Generar un identificador único y estado inicial pendiente |
| CA-05 | Guardar el producto correctamente en MySQL |
| CA-06 | Devolver HTTP 201 con el producto creado |
| CA-07 | Responder HTTP 400 a solicitudes inválidas sin insertar registros |

### Key Entities

Producto: id string único generado, name string normalizado, quantity number entero positivo y purchased boolean inicialmente false. Sin atributos adicionales.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de registros válidos probados conserva sus cuatro atributos y puede recuperarse posteriormente.
- **SC-002**: El 100% de solicitudes inválidas probadas es rechazado sin crear ni modificar registros.
- **SC-003**: Dos registros con el mismo nombre poseen IDs distintos, sin afectar datos anteriores.
- **SC-004**: Todos los fallos probados tienen respuestas controladas sin detalles internos; las consultas anteriores continúan funcionando.

## Assumptions

- El esquema existente define los límites; no se modifica ni se crean nuevos objetos.
- Se rechazan campos desconocidos para mantener un contrato simple y verificable.
- No hay autenticación, deduplicación de solicitudes ni garantía de idempotencia del registro.
- No se fijan objetivos de rendimiento no solicitados.
- Mantenimiento separado autorizado en la misma rama: reemplazar exclusivamente el texto del h1 de React de 🛒 SmartList a SmartList, sin modificar tests, estilos ni funcionalidades. No constituye un criterio de HU-11 ni integración frontend–API.
