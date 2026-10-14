-- HU-09: ejecutar explícitamente después de inspeccionar la estructura existente.
-- db:init verifica compatibilidad; IF NOT EXISTS por sí solo no la garantiza.
CREATE DATABASE IF NOT EXISTS smartlist_db CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS smartlist_db.products (
  id VARCHAR(36) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  purchased BOOLEAN NOT NULL DEFAULT FALSE,
  category VARCHAR(30) NOT NULL DEFAULT 'Otros',
  creation_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  UNIQUE KEY uq_product_creation_order (creation_order),
  CONSTRAINT chk_product_id CHECK (CHAR_LENGTH(TRIM(id)) > 0),
  CONSTRAINT chk_product_name CHECK (CHAR_LENGTH(TRIM(name)) > 0),
  CONSTRAINT chk_product_quantity CHECK (quantity > 0),
  CONSTRAINT chk_product_purchased CHECK (purchased IN (0, 1))
) CHARACTER SET utf8mb4;
