# Research — SMARLIST-14 / HU-13

Investigación primaria delegada conforme a speckit-plan. Sin incógnitas técnicas pendientes.

- **Decision**: pool.execute con DELETE estático WHERE id = ? y parámetros separados. **Rationale**: statement preparado y selección limitada aPK. **Alternatives considered**: interpolarSQL,identificar por nombre o lotes;no autorizados/inseguros. [mysql2](https://sidorares.github.io/node-mysql2/docs/documentation/prepared-statements).
- **Decision**: affectedRows1→204,0→404. **Rationale**: DELETE reporta filas realmente eliminadas yPKlimita auna. **Alternatives considered**: SELECTprevio o éxito silencioso0;innecesario o contrario alcontrato. [MySQL DELETE](https://dev.mysql.com/doc/refman/8.0/en/delete.html),[ResultSetHeader](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/protocol/packets/ResultSetHeader.d.ts).
- **Decision**: una sentencia con autocommit InnoDB vigente,sin transacción adicional. **Rationale**: atomicidad y confirmación al completar;no pasos que coordinar. **Alternatives considered**: transacción manual;sin necesidad funcional. [MySQL autocommit](https://dev.mysql.com/doc/refman/8.0/en/innodb-autocommit-commit-rollback.html).
- **Decision**: response.status(204).end(). **Rationale**: finalizar sin contenido oJSON. **Alternatives considered**: devolver producto/mensaje;contradice204. [Express5 fuente oficial](https://github.com/expressjs/expressjs.com/blob/main/src/content/api/5x/api/response/index.mdx).
- **Decision**: UUID canónicohex sin normalización,validación adicional soloDELETE y base compartida conPUT. **Rationale**: respeta decisión expresaHU13 y compatibilidad de endpoints anteriores. Sin dependenciaUUID externa.
