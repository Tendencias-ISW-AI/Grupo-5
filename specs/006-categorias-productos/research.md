# Research — SMARLIST-19 / HU-15

Sin incógnitas técnicas pendientes.

## R-01. Representación de la categoría

- **Decision**: Columna `VARCHAR(30) NOT NULL DEFAULT 'Otros'` y lista fija en el backend.
- **Rationale**: Mínimo cambio de esquema; el valor por defecto rellena automáticamente los registros existentes al agregar la columna.
- **Alternatives considered**: `ENUM` (cambiar la lista exige `ALTER` y complica la verificación del esquema); tabla `categories` con clave foránea (complejidad no requerida, la lista es fija y no editable); `CHECK category IN (...)` (MySQL reescribe la cláusula y acoplaría `verifyTable` a la lista exacta; la regla de negocio queda en el servicio, conforme a la Constitution).

## R-02. Migración de tablas existentes

- **Decision**: `ALTER TABLE smartlist_db.products ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'Otros'` ejecutado por `db:init` solo cuando la tabla coincide exactamente con el esquema anterior de cuatro columnas.
- **Rationale**: En MySQL 8, `ADD COLUMN ... NOT NULL DEFAULT` asigna el valor por defecto a todas las filas existentes (criterio 5) y es una operación instantánea en InnoDB. Verificar antes y después mantiene la política "no reparar estructuras desconocidas".
- **Alternatives considered**: script manual (riesgo de olvidarlo); `UPDATE` posterior (innecesario con `DEFAULT`); columna `NULL` interpretada como `Otros` en lectura (dos representaciones del mismo valor).

## R-03. PUT sin categoría

- **Decision**: Conservar la categoría actual.
- **Rationale**: Compatibilidad con clientes de HU-12 y con la integración en curso (SMARLIST-15), que todavía envían solo nombre y cantidad; evita pérdidas silenciosas de datos.
- **Alternatives considered**: Restablecer a `Otros` (borraría información); exigir categoría (rompería clientes existentes).

## R-04. Validación exacta

- **Decision**: `typeof value === 'string' && PRODUCT_CATEGORIES.includes(value)`.
- **Rationale**: Contrato predecible; el frontend usará un selector con los valores exactos.
- **Alternatives considered**: Normalizar mayúsculas/tildes (ambigüedad en lo que se guarda y devuelve).
