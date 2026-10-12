export const STORAGE_KEY = 'smartlist.products';

export function isValidShoppingList(items) {
  if (!Array.isArray(items)) return false;
  const ids = new Set();
  return items.every((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const valid = Object.keys(item).length === 4 &&
      typeof item.id === 'string' && item.id.trim() !== '' && !ids.has(item.id) &&
      typeof item.name === 'string' && item.name.trim() !== '' &&
      typeof item.quantity === 'number' && Number.isInteger(item.quantity) && item.quantity > 0 &&
      typeof item.purchased === 'boolean';
    if (valid) ids.add(item.id);
    return valid;
  });
}

export function readShoppingList() {
  let stored;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { items: [], canWrite: false };
  }
  if (stored === null) return { items: [], canWrite: true };
  try {
    const items = JSON.parse(stored);
    return { items: isValidShoppingList(items) ? items : [], canWrite: true };
  } catch {
    return { items: [], canWrite: true };
  }
}

export function writeShoppingList(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
