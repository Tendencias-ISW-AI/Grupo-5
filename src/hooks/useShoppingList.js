import { useEffect, useRef, useState } from 'react';
import { readShoppingList, writeShoppingList } from '../utils/shoppingListStorage.js';

export function validateProduct(name, quantity) {
  const errors = {};
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const hasQuantity = typeof quantity === 'number' ||
    (typeof quantity === 'string' && quantity.trim() !== '');
  const normalizedQuantity = hasQuantity ? Number(quantity) : NaN;

  if (!normalizedName) errors.name = 'Ingresa el nombre del producto.';
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    errors.quantity = 'Ingresa una cantidad entera mayor que cero.';
  }
  return { errors, name: normalizedName, quantity: normalizedQuantity };
}

export default function useShoppingList() {
  const storageSession = useRef({ canWrite: false });
  const [items, setItems] = useState(() => {
    const recovered = readShoppingList();
    storageSession.current.canWrite = recovered.canWrite;
    return recovered.items;
  });
  const previousItems = useRef(items);

  useEffect(() => {
    // El montaje (incluido StrictMode) no debe reemplazar datos preexistentes.
    if (previousItems.current === items) return;
    previousItems.current = items;
    if (storageSession.current.canWrite) writeShoppingList(items);
  }, [items]);

  function addProduct(name, quantity) {
    const validated = validateProduct(name, quantity);
    if (Object.keys(validated.errors).length > 0) {
      return { success: false, errors: validated.errors };
    }
    const product = {
      id: crypto.randomUUID(),
      name: validated.name,
      quantity: validated.quantity,
      purchased: false,
    };
    setItems((currentItems) => [...currentItems, product]);
    return { success: true, errors: {} };
  }
  function togglePurchased(id) {
    setItems((currentItems) => {
      if (!currentItems.some((item) => item.id === id)) return currentItems;
      return currentItems.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item,
      );
    });
  }

  function removeProduct(id) {
    setItems((currentItems) => {
      if (!currentItems.some((item) => item.id === id)) return currentItems;
      return currentItems.filter((item) => item.id !== id);
    });
  }

  function updateProduct(id, data) {
    if (!items.some((item) => item.id === id)) {
      return { success: false, errors: { product: 'El producto ya no está disponible.' } };
    }
    const validated = validateProduct(data?.name, data?.quantity);
    if (Object.keys(validated.errors).length > 0) {
      return { success: false, errors: validated.errors };
    }
    setItems((currentItems) => {
      if (!currentItems.some((item) => item.id === id)) return currentItems;
      return currentItems.map((item) => item.id === id
        ? { ...item, name: validated.name, quantity: validated.quantity }
        : item);
    });
    return { success: true, errors: {} };
  }

  return { items, addProduct, togglePurchased, removeProduct, updateProduct };
}
