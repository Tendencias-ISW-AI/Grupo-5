import { useState } from 'react';

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
  const [items, setItems] = useState([]);

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
  return { items, addProduct };
}
