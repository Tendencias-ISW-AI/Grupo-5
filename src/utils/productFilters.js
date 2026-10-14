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

// Cada criterio se evalúa con su propio predicado; para sumar la categoría
// basta con añadir `category` a los criterios y un `matchesCategory`.
export function filterProducts(items, { status = 'all', query = '' } = {}) {
  const normalizedQuery = normalizeText(query);
  return items.filter(
    (item) => matchesStatus(item, status) && matchesSearch(item, normalizedQuery),
  );
}
