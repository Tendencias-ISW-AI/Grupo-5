// Debe coincidir con backend/src/services/productCategories.js (lo verifica tests/productCategoriesUi.test.js).
export const PRODUCT_CATEGORIES = Object.freeze([
  'Frutas y verduras', 'Carnes y pescados', 'Lácteos', 'Panadería', 'Despensa', 'Bebidas', 'Aseo', 'Otros',
]);

export const DEFAULT_PRODUCT_CATEGORY = 'Otros';

export function isValidProductCategory(value) {
  return typeof value === 'string' && PRODUCT_CATEGORIES.includes(value);
}
