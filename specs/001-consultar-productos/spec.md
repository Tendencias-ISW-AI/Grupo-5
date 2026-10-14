# Feature Specification: HU-09 — Consultar productos

**Feature Branch**: `feature/backend-hu-09-consultar-productos`

**Created**: 2026-10-13

**Status**: Clarified — alcance y decisiones aprobados para el flujo completo HU-09

**Input**: User description: "Como usuario, quiero consultar los productos almacenados
en una base de datos, para recuperar y visualizar mi lista de compras cuando utilice
la aplicación. La ejecución completa de HU-09 fue autorizada posteriormente."

## Clarifications

### Session 2026-10-13

- Q: ¿Qué orden debe utilizarse? → A: `id` ascendente, determinista entre consultas.
- Q: ¿Cuál es el contrato de consulta? → A: GET `/api/products`, HTTP 200 y un arreglo
  JSON directo; sin productos responde `[]` con HTTP 200.
- Q: ¿Cómo se comunica MySQL no disponible? → A: HTTP 503 con
  `{"error":"Servicio temporalmente no disponible"}`, sin información interna.
- Q: ¿Qué infraestructura y alcance están autorizados? → A: MySQL local,
  `smartlist_db` y `products`, creación idempotente solo de objetos faltantes, sin
  borrar datos ni modificar otras bases; no existen endpoints de escritura o integración React.
- Q: ¿Cómo se identifica la historia? → A: HU-09; la clave Jira definitiva queda pendiente
  y no impide esta implementación expresamente autorizada.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recuperar la lista almacenada (Priority: P1)

Como usuario, quiero consultar todos los productos conservados para conocer mi lista
de compras con sus nombres, cantidades y estados actuales.

**Why this priority**: La consulta es el objetivo central de HU-09 y permite recuperar
información previamente almacenada sin alterarla.

**Independent Test**: Preparar datos de prueba controlados, solicitar la lista y comparar
todos los registros y atributos con los originales. No requiere endpoints de escritura
ni conectar el frontend.

**Acceptance Scenarios**:

1. **Given** una colección almacenada con productos pendientes y comprados,
   **When** se consulta, **Then** se reciben todos los registros una sola vez,
   con `id`, `name`, `quantity` y `purchased` y sus tipos compatibles con SmartList.
2. **Given** dos productos con el mismo nombre e IDs diferentes,
   **When** se consulta, **Then** ambos se reciben como registros independientes.
3. **Given** que no existen productos, **When** se consulta,
   **Then** se recibe una colección vacía como resultado correcto, no como error.
4. **Given** una colección sin cambios entre consultas, **When** se consulta repetidamente,
   **Then** los resultados mantienen el mismo orden conforme al criterio acordado en FR-006.
5. **Given** una colección almacenada, **When** se consulta,
   **Then** permanecen intactos sus registros, atributos y estados.
6. **Given** productos conservados, **When** la aplicación servidora se reinicia
   y se vuelve a consultar, **Then** se recuperan los mismos datos.

### User Story 2 - Reconocer una consulta no disponible (Priority: P2)

Como usuario, quiero distinguir una consulta fallida de una lista realmente vacía,
para no interpretar una indisponibilidad como pérdida de mis productos.

**Why this priority**: Un fallo de acceso al almacenamiento debe comunicarse de manera
controlada sin ocultar datos ni revelar información interna.

**Independent Test**: Simular indisponibilidad del almacenamiento y comprobar un error
controlado distinto del resultado vacío exitoso, sin modificar los productos.

**Acceptance Scenarios**:

1. **Given** almacenamiento no disponible, **When** se consulta,
   **Then** se recibe un error controlado y no una respuesta de éxito con colección vacía.
2. **Given** un fallo de consulta, **When** se devuelve el error,
   **Then** la respuesta no contiene credenciales, consultas internas ni trazas.
3. **Given** una consulta fallida, **When** se restablece el almacenamiento
   y se consulta nuevamente, **Then** la lista puede recuperarse sin reiniciar datos.

### Edge Cases

- Colección vacía: resultado exitoso sin registros.
- Nombres repetidos: no deduplicar ni identificar por nombre.
- Cantidad mayor que uno: conservar su valor, sin expandirla en varios productos.
- Todos pendientes o todos comprados: recuperar la colección completa, sin filtros.
- Reinicio del servidor: no perder información persistente.
- Fallos de conexión, credenciales o consulta: error público controlado, nunca secretos.
- Almacenamiento sin preparar: reportar un fallo controlado; consultar no debe crear el esquema.
- Infraestructura existente: su preparación futura no debe borrar datos ni afectar otras bases.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir consultar todos los productos registrados, sin
  implementar filtros, paginación ni consultas individuales en esta historia.
- **FR-002**: Cada registro devuelto DEBE contener únicamente `id` string no vacío,
  `name` string válido, `quantity` número entero positivo y `purchased` booleano.
- **FR-003**: Los identificadores DEBEN conservarse y ser únicos; los nombres repetidos
  NO DEBEN fusionarse. Los valores devueltos DEBEN coincidir con los almacenados válidos.
- **FR-004**: Si no existen productos, el resultado DEBE ser una colección vacía exitosa.
- **FR-005**: La consulta DEBE ser de solo lectura: NO DEBE agregar, modificar o eliminar
  productos ni crear infraestructura durante una solicitud.
- **FR-006**: Los resultados DEBEN ordenarse por `id` ascendente, con comparación
  binaria de identificadores para evitar ambigüedades de mayúsculas o acentos. El ID
  único define un orden total sin un segundo criterio.
- **FR-007**: La información DEBE persistir independientemente del proceso servidor
  y conservarse después de reiniciarlo.
- **FR-008**: La indisponibilidad o un fallo del almacenamiento DEBE producir un error
  controlado, distinguible de una colección vacía correcta y sin detalles internos.
- **FR-009**: La historia DEBE poder verificarse con pruebas de consulta, colección vacía,
  compatibilidad, orden, conservación de datos, persistencia y escenarios de error.
- **FR-010**: El alcance DEBE incluir la preparación mínima del almacenamiento necesaria
  para consultar, sin afectar otras bases de datos ni destruir información preexistente.
- **FR-011**: Esta historia NO DEBE proporcionar registro, edición, eliminación ni cambio
  de estado como funcionalidades, ni modificar el frontend o su almacenamiento local.
- **FR-012**: GET `/api/products` DEBE devolver HTTP 200 con un arreglo JSON directo,
  incluido `[]` para colección vacía. Indisponibilidad de MySQL DEBE devolver HTTP 503
  con `{"error":"Servicio temporalmente no disponible"}`. Errores inesperados DEBEN
  utilizar el manejo existente con respuesta genérica y sin detalles internos.

### Key Entities *(include if feature involves data)*

- **Producto**: registro de compra identificado de forma única por `id`, con nombre,
  cantidad entera positiva y estado comprado o pendiente. Mantiene el modelo vigente.
- **Colección de productos**: conjunto persistente consultado en su totalidad, presentado
  en un orden acordado y estable. No introduce atributos adicionales al producto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En los escenarios de aceptación con datos válidos, el 100% de los productos
  y sus cuatro atributos coinciden con los originales, incluidos nombres repetidos.
- **SC-002**: Todas las consultas de una colección vacía producen cero registros y se
  distinguen de los escenarios de indisponibilidad.
- **SC-003**: Al menos tres consultas sucesivas de datos sin cambios producen exactamente
  la misma secuencia según el criterio aprobado, sin alterar ningún registro.
- **SC-004**: Después de un reinicio del servidor, la colección recuperada conserva el
  100% de los identificadores, nombres, cantidades y estados preparados para la prueba.
- **SC-005**: Todos los fallos previstos se comunican de forma controlada sin revelar
  secretos o detalles internos; al recuperar disponibilidad, se puede consultar nuevamente.
- **SC-006**: La revisión de aceptación confirma que no se añadieron funciones de escritura
  ni cambios al frontend, y que la infraestructura no afecta otras bases de datos.

## Assumptions

- Esta es una historia exclusiva del backend; visualizar en React mediante la API será
  una historia de integración posterior. No importa productos desde localStorage.
- La colección es la lista única existente de SmartList; no se incorpora autenticación,
  usuarios ni separación por propietario.
- Para probar una consulta sin funcionalidades de escritura se utilizarán datos de prueba
  preparados de forma controlada. No se presupone una carga automática de datos reales.
- La preparación técnica futura utilizará MySQL local, la base `smartlist_db` y la tabla
  `products`, según la restricción expresa del usuario. Plan definirá esquema, contratos
  y preparación segura: ningún SQL se ejecuta en Specify.
- Si la base o la tabla ya existen, se conservarán los datos; cualquier incompatibilidad
  requerirá revisión antes de actuar. No se autoriza reemplazo ni borrado automático.
- El contrato HTTP está aprobado en FR-012. Plan definirá la preparación segura y
  los tipos de columnas proporcionados por el usuario; no se ejecuta SQL durante diseño.
- No se fija un objetivo de latencia o volumen sin requisitos proporcionados.
- La clave Jira definitiva no está confirmada. Se usa HU-09 por autorización expresa;
  el enlace definitivo podrá completarse después sin inventar un identificador.
- La comparación binaria de IDs es un supuesto técnico simple para garantizar orden
  y unicidad exacta; no cambia el modelo ni agrega atributos.
