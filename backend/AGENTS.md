# SmartList — Desarrollo del backend

Estas reglas complementan `../AGENTS.md`. La ampliación autorizada utiliza Node.js, Express y MySQL; el alcance anterior del frontend se conserva.

- Utilizar JavaScript con ES Modules y npm; no TypeScript, ORM ni frameworks adicionales sin autorización.
- Mantener el flujo Routes → Controllers → Services → Repositories → MySQL.
- `routes/`: endpoints y asociación con controladores. `controllers/`: parámetros HTTP y respuestas. `services/`: reglas de negocio y validación. `repositories/`: SQL y acceso a datos. `config/`: variables de entorno y pool. `middleware/`: funciones transversales y errores.
- Separar `app.js` de `server.js`; importar la aplicación no debe abrir puertos ni conectar la base de datos.
- Validar entradas en el límite HTTP y las reglas esenciales en servicios. No confiar únicamente en el frontend.
- Usar obligatoriamente consultas SQL parametrizadas; nunca concatenar entradas del usuario en SQL.
- Leer credenciales desde variables de entorno. No guardar `.env`, contraseñas, tokens ni conexiones reales en código, documentación o pruebas.
- Mantener respuestas de error consistentes; no exponer trazas internas ni credenciales.
- Usar Vitest y Supertest. Las pruebas iniciales no dependen de MySQL real. Las pruebas de futuras historias deben cubrir sus criterios y regresiones.
- Antes de implementar una historia, seguir SDD: Constitution acordada → Specify → Clarify → Plan → Tasks → Analyze → Implement. Revisar cada fase con el usuario. Usar las habilidades oficiales `speckit-*` instaladas en la raíz.
- Conservar especificaciones y planes en el repositorio. Vincular futuras tareas con requisitos y la clave Jira cuando esté definida.
- No ejecutar automáticamente etapas SDD, migraciones, CRUD, autenticación ni integración con React fuera de la tarea autorizada.
- No modificar frontend, modelo de producto ni localStorage sin una historia aprobada.
- No cambiar de rama, realizar commits, push o merge automáticamente.
- Validar con `npm test` dentro de `backend/`; ejecutar pruebas y compilación del frontend al comprobar regresiones.
