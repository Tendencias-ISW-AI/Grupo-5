# Research — HU-09

Fecha: 2026-10-13. Sin decisiones técnicas pendientes.

## Restricciones de MySQL

- **Decision**: MySQL >= 8.0.16 y verificar CHECK enforced; entorno comprobado: 8.0.41.
- **Rationale**: Antes de 8.0.16 CHECK podía aceptarse e ignorarse. Proteger quantity positivo y purchased 0/1.
- **Alternatives considered**: Triggers o validación exclusivamente en servicios futuros; innecesarios o insuficientes.
- Fuentes oficiales: [CHECK](https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html), [ENFORCED](https://dev.mysql.com/doc/refman/8.0/en/information-schema-table-constraints-table.html).

## Booleanos y orden

- **Decision**: BOOLEAN en SQL, conversión explícita 0/1 a false/true en el servicio; ORDER BY BINARY id ASC.
- **Rationale**: BOOLEAN es TINYINT(1), sin restricción implícita al dominio booleano. Comparación binaria elimina ambigüedad por collation.
- **Alternatives considered**: BINARY(16) para IDs o ordenar en JavaScript; innecesarios y el primero altera el modelo.
- Fuentes oficiales: [Tipos numéricos](https://dev.mysql.com/doc/refman/8.0/en/numeric-type-syntax.html), [Collations binarias](https://dev.mysql.com/doc/refman/8.0/en/charset-binary-collations.html).

## Inicialización no destructiva

- **Decision**: Inspeccionar metadatos y crear exclusivamente objetos faltantes; detener ante incompatibilidad.
- **Rationale**: IF NOT EXISTS no verifica estructura. Preflight confirmó que smartlist_db y products no existen.
- **Alternatives considered**: DDL al arrancar, migrations u ORM; fuera de alcance.
- Fuente oficial: [CREATE TABLE](https://dev.mysql.com/doc/refman/8.0/en/create-table.html).

## Infraestructura y pruebas

- **Decision**: Reutilizar configuración, pool, Express y middleware; mocks para pruebas normales, MySQL real explícito.
- **Rationale**: GET y /health no crean infraestructura. Simular errores y recuperación sin detener MySQL.
- **Alternatives considered**: Nueva capa o segunda aplicación HTTP; no necesarias.
- Las únicas escrituras de productos son fixtures controlados en pruebas reales, no funcionalidades API. Limpiar exclusivamente sus IDs propios.
