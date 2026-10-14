# SmartList Backend Constitution

## Core Principles

### I. Arquitectura en capas

El backend DEBE mantener el flujo Routes → Controllers → Services → Repositories → MySQL.
Routes DEBE definir endpoints y asociarlos con controladores. Controllers DEBE interpretar
solicitudes HTTP y producir respuestas. Services DEBE aplicar reglas de negocio y validaciones.
Repositories DEBE ejecutar las consultas SQL y el acceso a datos. Config DEBE centralizar
variables de entorno y conexión; Middleware DEBE gestionar funciones transversales.

NO DEBE existir SQL en rutas o controladores ni reglas de negocio directamente en rutas.
La aplicación Express DEBE permanecer separada del inicio del servidor. Importar módulos
NO DEBE abrir puertos ni conexiones MySQL. NO DEBEN incorporarse microservicios, ORM ni
abstracciones sin una necesidad aprobada que justifique modificar esta decisión.
Esta separación permite probar responsabilidades y mantener una aplicación pequeña.

### II. Desarrollo guiado por especificaciones

Toda nueva historia del backend DEBE seguir Specify → Clarify → Plan → Tasks → Analyze →
Implement. Cada etapa DEBE respetar esta Constitution y conservar sus artefactos en el
repositorio. La especificación DEBE delimitar alcance, reglas, requisitos verificables
y criterios de aceptación; Clarify DEBE registrar las ambigüedades resueltas o confirmar
que no quedan dudas relevantes.

NO DEBE implementarse una funcionalidad antes de la aprobación expresa de su especificación
y planificación. Las tareas DEBEN derivarse del plan y los requisitos. Analyze DEBE revisar
su consistencia antes de Implement; los conflictos bloqueantes DEBEN resolverse antes de
generar código. Las fases NO DEBEN ejecutarse automáticamente en cadena sin autorización.
La especificación acordada delimita el trabajo de la IA y permite revisar su cumplimiento.

### III. Seguridad y validación

Las solicitudes de la API DEBEN validarse en el límite HTTP y las reglas esenciales DEBEN
comprobarse en Services; el backend NO DEBE confiar en validaciones exclusivas del frontend.
Toda consulta SQL con datos variables DEBE utilizar parámetros, sin concatenar entradas
del usuario. Las credenciales DEBEN obtenerse de variables de entorno; secretos y archivos
`.env` NO DEBEN almacenarse en Git. `.env.example` DEBE contener únicamente ejemplos.

Los errores DEBEN manejarse de forma consistente con códigos HTTP adecuados. Las respuestas
NO DEBEN exponer trazas, credenciales, detalles SQL ni información interna del servidor.
Los detalles de contratos y mensajes públicos DEBEN definirse en la especificación y el plan.
Estas reglas reducen entradas incorrectas, inyección SQL y divulgación de información.

### IV. Calidad y pruebas

Cada funcionalidad DEBE disponer de pruebas automatizadas vinculadas a sus criterios,
incluyendo respuestas correctas, validaciones y escenarios de error. Las pruebas anteriores
DEBEN conservarse; NO DEBEN eliminarse ni debilitarse para ocultar fallos. Vitest y Supertest
DEBEN reutilizarse para la lógica y HTTP. Las pruebas aisladas NO DEBEN requerir una base
real; las pruebas de integración MySQL necesarias DEBEN declararse y configurarse en el plan.

Antes de completar una historia DEBEN ejecutarse sus pruebas y las regresiones pertinentes,
incluidas las pruebas y compilación del frontend para comprobar compatibilidad. El informe
DEBE indicar comandos, resultados, limitaciones y verificaciones no ejecutadas. Un fallo
preexistente DEBE identificarse y comunicarse sin atribuirle éxito ni repararlo fuera del
alcance autorizado. NO DEBE declararse completa una historia con criterios incumplidos
o validaciones críticas pendientes. La evidencia permite distinguir implementación de aceptación.

### V. Compatibilidad

El modelo DEBE conservar los atributos `id: string`, `name: string`, `quantity: number`
y `purchased: boolean`. Los IDs DEBEN ser no vacíos, únicos y estables; el nombre DEBE ser
válido y normalizado según las reglas existentes, la cantidad DEBE ser entera positiva
y el estado DEBE ser booleano. Los nombres repetidos DEBEN seguir representando registros
independientes. Editar nombre o cantidad NO DEBE modificar ID ni estado de compra.

Las reglas funcionales de SmartList DEBEN conservarse. Las historias exclusivas del backend
NO DEBEN modificar componentes React, contratos del frontend ni su persistencia local.
La conexión con React y cualquier transición de localStorage a la API DEBEN realizarse
únicamente en una historia de integración expresamente aprobada. Esta separación evita
regresiones mientras el backend evoluciona.

### VI. Simplicidad y mantenibilidad

El backend DEBE utilizar Node.js, Express, MySQL, JavaScript y ES Modules, con npm para
dependencias. NO DEBE introducir TypeScript ni dependencias adicionales sin justificación
y autorización. El código DEBE ser modular, legible, con funciones pequeñas y nombres
descriptivos; las responsabilidades existentes DEBEN reutilizarse antes de crear otras.

Las decisiones arquitectónicas relevantes DEBEN documentarse con su motivo y consecuencias.
NO DEBEN realizarse refactorizaciones ajenas a la historia ni implementar funcionalidades
fuera de la especificación aprobada. Se prioriza la solución mínima que cumpla los criterios,
para mantener el proyecto comprensible y verificable.

### VII. Trazabilidad y control de cambios

Cada funcionalidad DEBE relacionarse con su historia Jira. Especificaciones, planes y tareas
DEBEN mantenerse versionados y permitir vincular criterios de aceptación con cambios y pruebas.
Cada trabajo DEBE utilizar su rama Git independiente; la rama activa DEBE verificarse antes
de modificar archivos. NO DEBE cambiarse de rama sin autorización.

NO DEBEN realizarse commits, push ni merge sin autorización expresa. El informe de cada
historia DEBE listar archivos modificados, evidencia de pruebas, estado de los criterios,
riesgos y limitaciones. Las automatizaciones de Spec Kit NO DEBEN sobrepasar el alcance
ni las autorizaciones del usuario. Esta trazabilidad facilita revisión académica y control
de versiones sin acciones implícitas.

## Alcance y restricciones técnicas

Esta Constitution gobierna el nuevo backend ubicado en `backend/`, dentro del repositorio
SmartList. El frontend React + Vite y las HU-01 a HU-08 constituyen la base funcional existente.
La configuración Node.js, Express y MySQL por capas está autorizada; el backend NO DEBE
incorporar autenticación, bases de datos externas adicionales ni nuevas funcionalidades
sin una especificación aprobada.

Las restricciones históricas de frontend en `docs/requirements.md` y la documentación
anterior describen la etapa sin backend. NO DEBEN interpretarse como autorización para
alterar ese frontend, ni como prohibición de la ampliación backend expresamente solicitada.
`AGENTS.md`, `backend/AGENTS.md` y esta Constitution DEBEN aplicarse dentro de sus ámbitos.
Toda contradicción nueva DEBE comunicarse antes de implementar una decisión que la afecte.

Crear esta Constitution NO autoriza endpoints, servicios, repositorios, tablas, migraciones
ni integración React. Tampoco autoriza ejecutar las siguientes fases SDD. La configuración
de persistencia local existente DEBE conservarse hasta su historia de integración.

## Flujo de desarrollo y revisión

1. Verificar rama, cambios existentes y documentación, e identificar la historia Jira.
2. Ejecutar Specify con alcance funcional y criterios verificables; someterla a revisión.
3. Ejecutar Clarify y registrar decisiones antes de planificar.
4. Elaborar Plan con arquitectura, contratos, datos, validaciones y estrategia de pruebas;
   obtener aprobación antes de implementar.
5. Generar Tasks vinculadas a requisitos, ordenadas por dependencias y limitadas al plan.
6. Ejecutar Analyze y resolver inconsistencias bloqueantes con revisión del usuario.
7. Ejecutar Implement únicamente con autorización, conservar las operaciones existentes
   y reunir evidencia de validación y regresión.
8. Presentar los resultados para revisión; NO ejecutar fases posteriores ni operaciones Git
   de publicación sin autorización.

La revisión DEBE comprobar los siete principios, los criterios de la historia, la protección
del frontend y las pruebas declaradas. Las desviaciones o validaciones imposibles DEBEN
quedar explícitas; una aprobación anterior NO autoriza ampliar el alcance.

## Governance

Esta Constitution inicial v1.0.0 fue aprobada expresamente por el usuario y ratificada el 2026-10-13.

Toda enmienda DEBE documentar motivo, principios afectados, impacto en artefactos y medidas
de transición cuando correspondan. El usuario DEBE aprobarla antes de aplicar una decisión
incompatible. La versión DEBE seguir semántica: MAJOR para retirar o redefinir principios
de forma incompatible; MINOR para agregar principios o ampliar obligaciones; PATCH para
aclaraciones sin cambio de obligaciones. La fecha de última modificación DEBE actualizarse
cuando cambie la Constitution; la fecha de ratificación original DEBE conservarse.

La revisión de cada especificación, plan, tarea y cambio DEBE verificar cumplimiento.
Dentro del ámbito backend, esta Constitution define las reglas de gobernanza; no reemplaza
las instrucciones expresas del usuario ni autoriza ejecutar acciones no solicitadas.
Los artefactos dependientes DEBEN consultarla en tiempo de ejecución; no se modifican
plantillas o código como efecto automático de esta actualización.

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
