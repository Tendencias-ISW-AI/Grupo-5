import { useEffect, useRef, useState } from 'react';
import * as productsApi from '../services/productsApi.js';
import { DEFAULT_PRODUCT_CATEGORY, isValidProductCategory } from '../utils/productCategories.js';

export function validateProduct(name, quantity, category) {
  const errors = {};
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const hasQuantity = typeof quantity === 'number' ||
    (typeof quantity === 'string' && quantity.trim() !== '');
  const normalizedQuantity = hasQuantity ? Number(quantity) : NaN;
  if (!normalizedName) errors.name = 'Ingresa el nombre del producto.';
  else if (!normalizedName.isWellFormed() || Array.from(normalizedName).length > 150) errors.name = 'El nombre debe tener hasta 150 caracteres válidos.';
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) errors.quantity = 'Ingresa una cantidad entera mayor que cero.';
  else if (normalizedQuantity > 2147483647) errors.quantity = 'La cantidad máxima es 2147483647.';
  if (category !== undefined && !isValidProductCategory(category)) errors.category = 'Elige una categoría válida.';
  return { errors, name: normalizedName, quantity: normalizedQuantity, category };
}

export default function useShoppingList() {
  const [items, setItems] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const currentItems = useRef([]);
  const session = useRef({ generation: 0, mounted: false, ready: false });
  const queue = useRef(Promise.resolve());
  const pendingCount = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const generation = ++session.current.generation;
    session.current.mounted = true;
    session.current.ready = false;
    setLoadState('loading');
    productsApi.getProducts({ signal: controller.signal }).then(recovered => {
      if (controller.signal.aborted || generation !== session.current.generation) return;
      currentItems.current = recovered;
      setItems(recovered);
      session.current.ready = true;
      setLoadState('ready');
    }).catch(cause => {
      if (controller.signal.aborted || generation !== session.current.generation) return;
      setError(cause.message);
      setLoadState('error');
    });
    return () => { controller.abort(); session.current.mounted = false; session.current.ready = false; };
  }, []);

  function mutate(operation, reportError = true) {
    if (!session.current.ready) return Promise.resolve({ success: false, errors: { product: 'Espera a que se cargue la lista.' } });
    const generation = session.current.generation;
    pendingCount.current++;
    setPending(true);
    setError('');
    const result = queue.current.then(async () => {
      try {
        if (!session.current.mounted || generation !== session.current.generation) return { success: false, errors: { product: 'La solicitud fue cancelada.' } };
        const confirmed = await operation(currentItems.current);
        if (!session.current.mounted || generation !== session.current.generation) return { success: false, errors: { product: 'La solicitud fue cancelada.' } };
        currentItems.current = confirmed;
        setItems(confirmed);
        return { success: true, errors: {} };
      } catch (cause) {
        if (session.current.mounted && generation === session.current.generation && reportError) setError(cause.message);
        return { success: false, errors: { product: cause.message } };
      } finally {
        pendingCount.current--;
        if (session.current.mounted && generation === session.current.generation) setPending(pendingCount.current > 0);
      }
    });
    queue.current = result.then(() => undefined);
    return result;
  }

  function findProduct(collection, id) {
    const item = collection.find(product => product.id === id);
    if (!item) throw new Error('El producto ya no está disponible.');
    return item;
  }

  async function addProduct(name, quantity, category = DEFAULT_PRODUCT_CATEGORY) {
    const validated = validateProduct(name, quantity, category);
    if (Object.keys(validated.errors).length) return { success: false, errors: validated.errors };
    return mutate(async collection => {
      const product = await productsApi.createProduct({ name: validated.name, quantity: validated.quantity, category: validated.category });
      if (collection.some(item => item.id === product.id)) throw new Error('El servidor devolvió un identificador repetido.');
      return [...collection, product];
    }, false);
  }

  function togglePurchased(id) {
    return mutate(async collection => {
      const item = findProduct(collection, id);
      const product = await productsApi.updateProductStatus(id, !item.purchased);
      return collection.map(current => current.id === id ? product : current);
    });
  }

  function removeProduct(id) {
    return mutate(async collection => {
      findProduct(collection, id);
      await productsApi.deleteProduct(id);
      return collection.filter(item => item.id !== id);
    });
  }

  async function updateProduct(id, data) {
    const validated = validateProduct(data?.name, data?.quantity, data?.category);
    if (Object.keys(validated.errors).length) return { success: false, errors: validated.errors };
    const changes = { name: validated.name, quantity: validated.quantity };
    if (validated.category !== undefined) changes.category = validated.category;
    return mutate(async collection => {
      findProduct(collection, id);
      const product = await productsApi.updateProduct(id, changes);
      return collection.map(item => item.id === id ? product : item);
    }, false);
  }

  return { items, loadState, pending, error, addProduct, togglePurchased, removeProduct, updateProduct };
}
