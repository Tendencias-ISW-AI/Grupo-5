# Feature Specification: SMARLIST-15 / HU-14 — Integración Full Stack

**Feature Branch**:`feature/SMARLIST-15-hu-14-integracion-full-stack`
**Created**:2026-10-14
**Status**:Flujo completo autorizado, incluyendo PATCH por ampliación expresa del responsable
**Input**: Gestionar la lista desde React y conservar todos los cambios en MySQL mediante cinco endpoints REST.

## Clarifications

### Session 2026-10-14

- Q: ¿PATCH está autorizado aquí? → A: Sí, dentroHU14 por ampliación expresa;booleano estricto,UUID deDELETE e idempotencia.
- Q: ¿Qué datos gobiernan interfaz/persistencia? → A: Productos confirmados porAPI/MySQL;React no generaIDs o persiste copias.
- Q: ¿Qué ocurre con datos locales históricos? → A: No leer,migrar,borrar o sincronizar automáticamente;documentar separación.
- Q: ¿Cómo tratar carga/errores/concurrencia? → A: Estados diferenciados,carga protegida y escrituras serializadas,sin optimismo;fallos conservan datos y entradas.
- Q: ¿Cómo funcionan filtros/resumen? → A: Desde colección global confirmada,vistas derivadas y sin escrituras.

Sin ambigüedades críticas. Supuestos menores:URL pública configurable,pending global para controles,carga fallida requiere recarga y utilidades históricas solo para regresión del formato sin efectos de producción. Checklist completo,no autorización adicional necesaria.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completar estado persistente (Priority: P1)

Como usuario quiero marcar y desmarcar productos sin alterar sus otros datos.
**Why this priority**: Dependencia necesaria para conservar marcación en la integración.
**Independent Test**: PATCH de ambos valores y mismo estado,modelo completo y persistencia;validaciones400/404/503.
**Acceptance Scenarios**:
1. **Given** producto existente, **When** PATCH/status con purchased booleano, **Then**200 con id/name/quantity conservados y nuevo estado, incluso si ya coincidía.
2. **Given** ID/cuerpo inválido, **When** PATCH, **Then**400 sin modificación;UUID inexistente404;MySQL indisponible503 seguro.
3. **Given** otros productos, **When** se cambia estado de uno, **Then** los demás quedan intactos y GET/POST/PUT/DELETE conservan contratos.

### User Story 2 - Gestionar lista conectada (Priority: P2)

Como usuario gestiono la lista desde React con cambios confirmados por MySQL y sin persistencia local activa.
**Why this priority**: Objetivo principal de integración, depende del contrato completo.
**Independent Test**: Cargar,registrar,editar,marcar/desmarcar,filtrar,resumir,recargar y eliminar mediante API.
**Acceptance Scenarios**:
1. **Given** productos MySQL, **When** inicia o recarga React, **Then** GET recupera colección y filtros/resumen globales correctos.
2. **Given** registro/edición/marcación/eliminación válida, **When** se confirma POST/PUT/PATCH/DELETE, **Then** React refleja resultado del servidor con identidad estable.
3. **Given** carga inicial pendiente o fallida, **When** se muestra interfaz, **Then** se distingue de una lista realmente vacía y no se presentan cambios como guardados.
4. **Given** solicitudes consecutivas, **When** respuestas llegan en distintos tiempos, **Then** no se pierde estado confirmado o se sobrescribe con carga antigua.
5. **Given** datos históricos locales, **When** se inicia y opera aplicación, **Then** no se leen como productos del servidor ni se borran, migran o sincronizan automáticamente.

### Edge Cases

- PATCH exige cuerpo exclusivo purchased booleano;rechaza strings,números,null,campos ausentes/protegidos o adicionales. UUID como DELETE;no coerción o normalización.
- DELETE204 no se interpreta como JSON. Respuesta inválida o falloHTTP/red no confirma operación.
- Campos de formulario permanecen tras error y se limpian/cierran solo tras confirmación.
- StrictMode,desmontaje o carga tardía no producen sobrescrituras;escrituras serializadas y controles deshabilitados mientras se confirman.
- Filtros no escriben;resumen deriva de colección completa,independiente de quantity/filtro.
- No migración,borrado de historia local,UUID generado porReact,estado duplicado persistente,autenticación o experiencia avanzada de reintentos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Implementar PATCH /api/products/:id/status dentro de esta historia por autorización expresa;actualiza exclusivamente purchased con booleano estricto,200 producto completo y mismo estado idempotente.
- **FR-002**: Reutilizar UUID deDELETE,validar antes deSQL,400 inválido,404 inexistente,503 seguro/500 genérico,sin modificar otros atributos/filas o esquema.
- **FR-003**: React carga colección exclusivamente mediante GET,incluyendo recarga/reapertura,con estados diferenciados de carga,éxito vacío y error.
- **FR-004**: Registrar,editar,alternar y eliminar mediante POST/PUT/PATCH/DELETE,sin cambios confirmados ficticios. Utilizar el ID y los productos devueltos por servidor;retirar solo tras204.
- **FR-005**: Centralizar fetch en productsApi con URL pública configurable,JSON,códigosHTTP,validación básica y erroresred;no secretos MySQL o dependencias nuevas.
- **FR-006**: Conservar validaciones,componentes,edición guardar/cancelar,checkbox,duplicados,filtros y resumen desde única colecciónReact confirmada.
- **FR-007**: No recuperar,sincronizar,migrar o borrar productos históricos de localStorage. Persistencia únicamenteMySQL;contadores/filtros/borradores no se persisten.
- **FR-008**: Evitar conflictos y respuestas obsoletas mediante carga protegida y operaciones serializadas;operación fallida conserva datos confirmados y permite corregir entradas.
- **FR-009**: Mantener contratos anteriores,esquema,datos ajenos y coberturafuncional. Adaptar pruebas asincrónicas sin eliminarlas;validación real con fixtures propios y limpieza limitada.

### Acceptance Criteria

| Criterio | Comportamiento aprobado |
|---|---|
| CA01 | Carga inicial GET |
| CA02 | Registro POST |
| CA03 | Edición PUT |
| CA04 | Marcación/desmarcación PATCH/status |
| CA05 | Eliminación DELETE |
| CA06 | React refleja confirmaciones |
| CA07 | Filtros/resumen globales |
| CA08 | Recuperación MySQL tras recarga/reapertura |
| CA09 | Funcionalidades/cobertura conservadas |

### Key Entities

Producto exacto{id:string,name:string,quantity:number,purchased:boolean}. MySQLpersistente,React única colección de representación confirmada. Sin nuevas columnas/entidades,ID backend solamente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los cinco flujos probados conservan100% de atributos/identidades confirmados y persisten tras recarga.
- **SC-002**: Todos los fallos probados conservan la colección confirmada;ningún rechazo se presenta como guardado.
- **SC-003**: Filtros/resumen correctos y solicitudes consecutivas sin pérdida en100% de escenarios probados.
- **SC-004**: Cero lecturas/escrituras activas de productos locales o migraciones y cero datos ajenos modificados durante pruebas;regresiones cubiertas.

## Assumptions

- URL predeterminada pública http://localhost:3000/api configurable porVITE_API_BASE_URL;CORS existente respetado.
- Escrituras globalmente serializadas para simplicidad;sin optimismo,reintentos automáticos o sincronización entre clientes.
- Carga fallida bloquea escrituras de esa sesión hasta recargar;errores de operación mantienen datos/formularios,con mensajes sencillos.
- Utilidad antigua de almacenamiento puede conservarse únicamente para regresión del formato histórico,sin importación desde producción ni efectos activos.
- El alcance nuevo sustituye explícitamente el bloqueo anterior porPATCH y autoriza integraciónReact/MySQL sin enmendar Constitution.
