# Research — SMARLIST-13 / HU-12

Investigación primaria delegada conforme a speckit-plan. Sin decisiones pendientes, sujeto al preflight InnoDB/sin triggers transformadores.

- **Decision**: SELECT por PK FOR UPDATE y UPDATE parametrizados, misma conexión y transacción. **Rationale**: lectura vigente y bloqueo hasta commit/rollback; id/purchased no se escriben. **Alternatives considered**: consulta sin bloqueo o pool.execute en cada paso; no garantiza consistencia. [MySQL locking reads](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html).
- **Decision**:404 por SELECT vacío,200 aun sin cambios. **Rationale**: MySQL puede no modificar columnas iguales; affectedRows no basta para determinar inexistencia. **Alternatives considered**: depender de FOUND_ROWS o changedRows; innecesario. [MySQL UPDATE](https://dev.mysql.com/doc/refman/8.0/en/update.html).
- **Decision**: reconstruir respuesta con datos confirmados y estado/ID bloqueados. **Rationale**: dos consultas, esquema sin triggers transformadores comprobado. **Alternatives considered**: tercer SELECT; solo sería necesario si triggers transforman valores, fuera del esquema actual.
- **Decision**: rollback/release al fallar y destroy si rollback falla, sin ocultar error original. **Rationale**: evitar reciclar transacción abierta. [mysql2 Promise](https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper), [API oficial](https://github.com/sidorares/node-mysql2/blob/master/promise.d.ts).
- **Decision**: validación POST compartida e ID string compatible con HU-09 sin normalización. **Rationale**: no duplicar reglas ni imponer nuevo modelo UUID a datos válidos anteriores.
