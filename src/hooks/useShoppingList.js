import { useState } from 'react';

export default function useShoppingList() {
  const [items] = useState([]);

  // Las operaciones y la persistencia se añadirán en futuras historias.
  return { items };
}
