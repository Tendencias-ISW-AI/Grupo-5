-- SMARLIST-23: initializeDatabase rellena la columna bajo bloqueo antes de finalizar.
ALTER TABLE smartlist_db.products ADD COLUMN creation_order BIGINT UNSIGNED NULL;
ALTER TABLE smartlist_db.products MODIFY COLUMN creation_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ADD UNIQUE KEY uq_product_creation_order (creation_order);
