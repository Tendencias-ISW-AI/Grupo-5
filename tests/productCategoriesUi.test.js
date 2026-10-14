import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';
import { validateProduct } from '../src/hooks/useShoppingList.js';
import { getProducts, updateProduct } from '../src/services/productsApi.js';
import {
  DEFAULT_PRODUCT_CATEGORY, PRODUCT_CATEGORIES, isValidProductCategory,
} from '../src/utils/productCategories.js';
import { PRODUCT_CATEGORIES as BACKEND_CATEGORIES } from '../backend/src/services/productCategories.js';
import { createProductsServer, jsonResponse } from './helpers/productsServer.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container;
let root;
let server;

const dairy = { id: '00000000-0000-4000-8000-000000000101', name: 'Leche', quantity: 1, purchased: false, category: 'Lácteos' };
const bread = { id: '00000000-0000-4000-8000-000000000102', name: 'Pan', quantity: 2, purchased: true, category: 'Panadería' };

beforeEach(() => {
  server = createProductsServer();
  vi.stubGlobal('fetch', server.fetch);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render() {
  await act(async () => root.render(createElement(App)));
}

async function setValue(element, value) {
  const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
}

async function submitForm(form) {
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

async function register(name, quantity, category) {
  await setValue(container.querySelector('#product-name'), name);
  await setValue(container.querySelector('#product-quantity'), quantity);
  if (category !== undefined) await setValue(container.querySelector('#product-category'), category);
  await submitForm(container.querySelector('.shopping-form'));
}

function categorySelect() {
  return container.querySelector('#product-category');
}

function rowCategories() {
  return [...container.querySelectorAll('li')].map(row => [
    row.querySelector('.product-name').textContent.trim(), row.querySelector('.product-category').textContent.trim(),
  ]);
}

function requests(method) {
  return server.fetch.mock.calls.filter(([, options = {}]) => (options.method ?? 'GET') === method)
    .map(([, options]) => JSON.parse(options.body));
}

async function openEdit(name) {
  await act(async () => container.querySelector(`li button[aria-label="Editar ${name}"]`).click());
  return container.querySelector('li form');
}

describe('SMARLIST-22: lista de categorías', () => {
  it('CP-10: coincide con la lista del backend, con Otros por defecto', () => {
    expect(PRODUCT_CATEGORIES).toEqual(BACKEND_CATEGORIES);
    expect(DEFAULT_PRODUCT_CATEGORY).toBe('Otros');
    expect(Object.isFrozen(PRODUCT_CATEGORIES)).toBe(true);
    expect(isValidProductCategory('Lácteos')).toBe(true);
    expect(isValidProductCategory('lácteos')).toBe(false);
  });

  it('CP-11: validateProduct rechaza categorías fuera de la lista y acepta su ausencia', () => {
    expect(validateProduct('Pan', '1', 'Juguetes').errors).toEqual({ category: 'Elige una categoría válida.' });
    expect(validateProduct('Pan', '1', null).errors.category).toBeDefined();
    expect(validateProduct('Pan', '1', 'Panadería')).toMatchObject({ errors: {}, category: 'Panadería' });
    expect(validateProduct('Pan', '1').errors).toEqual({});
  });
});

describe('SMARLIST-22: registro con categoría', () => {
  it('CP-01: selector etiquetado con las 8 categorías en orden y Otros seleccionado', async () => {
    await render();
    const select = categorySelect();
    expect(container.querySelector('label[for="product-category"]').textContent).toBe('Categoría');
    expect([...select.options].map(option => option.value)).toEqual([...PRODUCT_CATEGORIES]);
    expect(select.value).toBe('Otros');
  });

  it('CP-02: envía la categoría elegida, la muestra y reinicia el selector', async () => {
    await render();
    await register('Leche', '1', 'Lácteos');
    expect(requests('POST')).toEqual([{ name: 'Leche', quantity: 1, category: 'Lácteos' }]);
    expect(rowCategories()).toEqual([['Leche', 'Lácteos']]);
    expect(categorySelect().value).toBe('Otros');
  });

  it('CP-03: sin cambiar el selector registra en Otros', async () => {
    await render();
    await register('Pan', '1');
    expect(requests('POST')[0].category).toBe('Otros');
    expect(rowCategories()).toEqual([['Pan', 'Otros']]);
  });

  it('CP-08: un error de la API conserva el formulario y la categoría elegida', async () => {
    await render();
    server.fetch.mockResolvedValueOnce(jsonResponse({ error: 'Servicio temporalmente no disponible' }, 503));
    await register('Leche', '1', 'Lácteos');
    expect(container.querySelector('li')).toBeNull();
    expect(container.querySelector('#product-name').value).toBe('Leche');
    expect(categorySelect().value).toBe('Lácteos');
  });
});

describe('SMARLIST-22: categoría visible', () => {
  it('CP-04: cada producto muestra su categoría, también con búsqueda y filtros', async () => {
    server.seed([dairy, bread]);
    await render();
    expect(rowCategories()).toEqual([['Leche', 'Lácteos'], ['Pan', 'Panadería']]);
    await act(async () => [...container.querySelectorAll('[role="group"] button')].find(b => b.textContent === 'Comprados').click());
    expect(rowCategories()).toEqual([['Pan', 'Panadería']]);
  });

  it('CP-09: productsApi rechaza productos sin categoría o con categoría inválida', async () => {
    const { category, ...withoutCategory } = dairy;
    for (const invalid of [withoutCategory, { ...dairy, category: 'Juguetes' }, { ...dairy, category: '' }]) {
      server.fetch.mockResolvedValueOnce(jsonResponse([invalid]));
      await expect(getProducts()).rejects.toThrow('respuesta inválida');
    }
    server.fetch.mockResolvedValueOnce(jsonResponse(withoutCategory));
    await expect(updateProduct(dairy.id, { name: 'Leche', quantity: 1 })).rejects.toThrow('respuesta inválida');
    expect(category).toBe('Lácteos');
  });
});

describe('SMARLIST-22: edición de la categoría', () => {
  it('CP-05: la edición precarga la categoría actual', async () => {
    server.seed([dairy]);
    await render();
    const form = await openEdit('Leche');
    const select = form.querySelector('select[name="category"]');
    expect(form.querySelector(`label[for="${select.id}"]`).textContent).toBe('Categoría');
    expect(select.value).toBe('Lácteos');
  });

  it('CP-06: guardar envía la nueva categoría y muestra la confirmada', async () => {
    server.seed([{ ...dairy, category: 'Despensa' }]);
    await render();
    const form = await openEdit('Leche');
    await setValue(form.querySelector('select[name="category"]'), 'Bebidas');
    await submitForm(form);
    expect(requests('PUT')).toEqual([{ name: 'Leche', quantity: 1, category: 'Bebidas' }]);
    expect(rowCategories()).toEqual([['Leche', 'Bebidas']]);
    expect(server.items()[0].category).toBe('Bebidas');
  });

  it('CP-07: cancelar no cambia la categoría ni llama a la API', async () => {
    server.seed([dairy]);
    await render();
    const form = await openEdit('Leche');
    await setValue(form.querySelector('select[name="category"]'), 'Aseo');
    await act(async () => [...form.querySelectorAll('button')].find(b => b.textContent === 'Cancelar').click());
    expect(requests('PUT')).toEqual([]);
    expect(rowCategories()).toEqual([['Leche', 'Lácteos']]);
  });
});
