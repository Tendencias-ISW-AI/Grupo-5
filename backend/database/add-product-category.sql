-- HU-15: db:init lo ejecuta solo sobre una tabla products compatible de la versión anterior.
-- Las filas existentes reciben el valor por defecto 'Otros'.
ALTER TABLE smartlist_db.products ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'Otros';
