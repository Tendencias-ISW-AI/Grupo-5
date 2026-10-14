import { PRODUCT_CATEGORIES } from './productCategories.js';

export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesStatus(item, status) {
  if (status === 'all') return true;
  if (status === 'pending') return item.purchased === false;
  if (status === 'purchased') return item.purchased === true;
  return false;
}

export function matchesSearch(item, normalizedQuery) {
  return normalizedQuery === '' || normalizeText(item.name).includes(normalizedQuery);
}

export function matchesCategory(item, category) {
  return category === 'all' || item.category === category;
}

// Cada criterio se evalúa con su propio predicado.
export function filterProducts(items, { status = 'all', query = '', category = 'all' } = {}) {
  const normalizedQuery = normalizeText(query);
  return items.filter(
    (item) => matchesStatus(item, status) && matchesSearch(item, normalizedQuery)
      && matchesCategory(item, category),
  );
}

// Grupos en el orden fijo de categorías, solo con productos visibles; los pendientes
// se cuentan sobre toda la lista para que el filtro de estado no los oculte.
export function groupByCategory(visibleItems, allItems = visibleItems) {
  return PRODUCT_CATEGORIES
    .map((category) => ({
      category,
      items: visibleItems.filter((item) => item.category === category),
      pending: allItems.filter((item) => item.category === category && item.purchased === false).length,
    }))
    .filter((group) => group.items.length > 0);
}

const statusLabels = { pending: 'pendientes ', purchased: 'comprados ' };

export function emptyMessageFor({ total, query = '', status = 'all', category = 'all' }) {
  const trimmedQuery = query.trim();
  if (total === 0) return 'Tu lista de compras está vacía';
  if (trimmedQuery !== '') return `No se encontraron productos que coincidan con "${trimmedQuery}"`;
  if (category !== 'all') return `No hay productos ${statusLabels[status] ?? ''}en la categoría ${category}`;
  if (status === 'pending') return 'No tienes productos pendientes';
  if (status === 'purchased') return 'No tienes productos comprados';
  return 'Tu lista de compras está vacía';
}
