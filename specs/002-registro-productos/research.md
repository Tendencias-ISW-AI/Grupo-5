# Research — SMARLIST-12 / HU-11

Sin incógnitas técnicas pendientes. Investigación requerida por speckit-plan delegada en agente de solo lectura.

- **Decision**: randomUUID de node:crypto. **Rationale**: UUIDv4 nativo, sin dependencias. **Alternatives considered**: UUID del cliente o librería externa; no cumplen control del servidor o son innecesarias. [Node22](https://nodejs.org/docs/latest-v22.x/api/crypto.html#cryptorandomuuidoptions).
- **Decision**: pool.execute con INSERT estático y valores separados. **Rationale**: statements preparados y parámetros; comprado inicial0/false. **Alternatives considered**: interpolación SQL u ORM; inseguros o fuera de alcance. [mysql2](https://sidorares.github.io/node-mysql2/docs/documentation/prepared-statements).
- **Decision**: quantity1..2147483647. **Rationale**: INT firmado existente. **Alternatives considered**: cambiar esquema a BIGINT o coerción de strings; no autorizados. [MySQL INT](https://dev.mysql.com/doc/refman/8.0/en/integer-types.html).
- **Decision**: nombre normalizado máximo150 puntos de código Unicode. **Rationale**: VARCHAR mide caracteres, no unidades UTF-16 o bytes; comprobar UTF-8 bien formado evita sustituciones. Ajustar comprobación de longitud GET permite recuperar exactamente nombres válidos creados por POST. **Alternatives considered**: limitar bytes o truncar; altera datos o restringe innecesariamente. [MySQL strings](https://dev.mysql.com/doc/refman/8.0/en/string-type-syntax.html).
- **Decision**: conservar errores HU-09 mediante helper local de servicio y 400 genérico para JSON inválido. **Rationale**: reutilización sin nuevas capas ni divulgación del payload. **Alternatives considered**: duplicación o nuevo framework; innecesarios.
- **Decision**: MySQL real opt-in y suites secuenciales; snapshots inicial/final con limpieza por IDs creados. **Rationale**: preserva registros ajenos y evita interferencias entre HU-09/HU-11. No alterar esquema ni aplicar DDL.
