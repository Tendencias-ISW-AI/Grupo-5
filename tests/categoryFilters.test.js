import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';
import {
  emptyMessageFor, filterProducts, groupByCategory, matchesCategory,
} from '../src/utils/productFilters.js';
import { PRODUCT_CATEGORIES } from '../src/utils/productCategories.js';
import { createProductsServer } from './helpers/productsServer.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container;
let root;
let server;

const product = (id, name, category, purchased = false) => ({ id: `00000000-0000-4000-8000-00000000000${id}`, name, quantity: 1, purchased, category });
const leche = product(1, 'Leche', 'Lácteos');
const queso = product(2, 'Queso', 'Lácteos', true);
const pan = product(3, 'Pan', 'Panadería');
const jabon = product(4, 'Jabón', 'Aseo');
const all = [leche, queso, pan, jabon];

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

async function render(items = all) {
  server.seed(items);
  await act(async () => root.render(createElement(App)));
}

async function change(element, value) {
  const prototype = element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
}

async function click(element) {
  await act(async () => element.click());
}

const categoryFilter = () => container.querySelector('#category-filter');
const groupToggle = () => container.querySelector('#group-by-category');
const selectCategory = value => change(categoryFilter(), value);
const selectStatus = label => click([...container.querySelectorAll('[role="group"] button')].find(b => b.textContent === label));
const names = () => [...container.querySelectorAll('li .product-name')].map(node => node.textContent.trim());
const statusMessage = () => container.querySelector('[role="status"]')?.textContent;
const groups = () => [...container.querySelectorAll('section.category-group')].map(section => ({
  title: section.querySelector('h3').firstChild.textContent.trim(),
  pending: section.querySelector('.group-pending').textContent,
  names: [...section.querySelectorAll('li .product-name')].map(node => node.textContent.trim()),
}));

describe('HU-16: funciones de filtrado y agrupación', () => {
  it('CP-12: matchesCategory y filterProducts combinan categoría, estado y búsqueda', () => {
    expect(matchesCategory(leche, 'all')).toBe(true);
    expect(matchesCategory(leche, 'Lácteos')).toBe(true);
    expect(matchesCategory(leche, 'Aseo')).toBe(false);
    expect(filterProducts(all, { category: 'Lácteos' })).toEqual([leche, queso]);
    expect(filterProducts(all, { category: 'Lácteos', status: 'pending' })).toEqual([leche]);
    expect(filterProducts(all, { category: 'Lácteos', status: 'purchased' })).toEqual([queso]);
    expect(filterProducts(all, { category: 'Lácteos', query: 'que' })).toEqual([queso]);
    expect(filterProducts(all)).toEqual(all);
  });

  it('CP-12: groupByCategory ordena por categoría, omite vacías y cuenta pendientes en toda la lista', () => {
    expect(groupByCategory(all)).toEqual([
      { category: 'Lácteos', items: [leche, queso], pending: 1 },
      { category: 'Panadería', items: [pan], pending: 1 },
      { category: 'Aseo', items: [jabon], pending: 1 },
    ]);
    expect(groupByCategory([queso], all)).toEqual([{ category: 'Lácteos', items: [queso], pending: 1 }]);
    expect(groupByCategory([])).toEqual([]);
    const order = groupByCategory(all).map(group => PRODUCT_CATEGORIES.indexOf(group.category));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('CP-12: emptyMessageFor respeta la precedencia de mensajes', () => {
    expect(emptyMessageFor({ total: 0, query: 'x', status: 'pending', category: 'Aseo' })).toBe('Tu lista de compras está vacía');
    expect(emptyMessageFor({ total: 2, query: ' x ', status: 'all', category: 'Aseo' })).toBe('No se encontraron productos que coincidan con "x"');
    expect(emptyMessageFor({ total: 2, query: '', status: 'all', category: 'Bebidas' })).toBe('No hay productos en la categoría Bebidas');
    expect(emptyMessageFor({ total: 2, query: '', status: 'pending', category: 'Aseo' })).toBe('No hay productos pendientes en la categoría Aseo');
    expect(emptyMessageFor({ total: 2, query: '', status: 'purchased', category: 'Aseo' })).toBe('No hay productos comprados en la categoría Aseo');
    expect(emptyMessageFor({ total: 2, query: '', status: 'all', category: 'all' })).toBe('Tu lista de compras está vacía');
    expect(emptyMessageFor({ total: 2, query: '', status: 'pending', category: 'all' })).toBe('No tienes productos pendientes');
    expect(emptyMessageFor({ total: 2, query: '', status: 'purchased', category: 'all' })).toBe('No tienes productos comprados');
  });
});

describe('HU-16: filtro de categoría en la interfaz', () => {
  it('CP-01: selector etiquetado con Todas y las 8 categorías', async () => {
    await render();
    const select = categoryFilter();
    expect(container.querySelector('label[for="category-filter"]').textContent).toBe('Categoría');
    expect([...select.options].map(option => option.value)).toEqual(['all', ...PRODUCT_CATEGORIES]);
    expect(select.options[0].textContent).toBe('Todas');
    expect(select.value).toBe('all');
    expect(container.querySelector('[role="group"]').getAttribute('aria-label')).toBe('Filtrar productos por estado');
  });

  it('CP-02 y CP-03: filtra por categoría combinada con el estado', async () => {
    await render();
    await selectCategory('Lácteos'); expect(names()).toEqual(['Leche', 'Queso']);
    await selectStatus('Pendientes'); expect(names()).toEqual(['Leche']);
    await selectStatus('Comprados'); expect(names()).toEqual(['Queso']);
    await selectCategory('all'); expect(names()).toEqual(['Queso']);
    await selectStatus('Todos'); expect(names()).toEqual(['Leche', 'Queso', 'Pan', 'Jabón']);
  });

  it('CP-04: se combina con la búsqueda por nombre', async () => {
    await render();
    await selectCategory('Lácteos');
    await change(container.querySelector('#product-search'), 'que');
    expect(names()).toEqual(['Queso']);
    await change(container.querySelector('#product-search'), 'pan');
    expect(statusMessage()).toBe('No se encontraron productos que coincidan con "pan"');
  });

  it('CP-05: mensaje claro cuando la categoría no tiene coincidencias', async () => {
    await render();
    await selectCategory('Bebidas');
    expect(names()).toEqual([]);
    expect(statusMessage()).toBe('No hay productos en la categoría Bebidas');
    await selectCategory('Aseo'); await selectStatus('Comprados');
    expect(statusMessage()).toBe('No hay productos comprados en la categoría Aseo');
  });

  it('CP-11: el resumen sigue siendo global y filtrar no llama a la API', async () => {
    await render();
    const requests = server.fetch.mock.calls.length;
    await selectCategory('Aseo'); await selectStatus('Pendientes'); await click(groupToggle());
    const counts = [...container.querySelectorAll('.shopping-summary dd')].map(node => node.textContent);
    expect(counts).toEqual(['4', '3', '1']);
    expect(server.fetch.mock.calls).toHaveLength(requests);
  });
});

describe('HU-16: lista agrupada', () => {
  it('CP-06 y CP-07: agrupa en orden fijo con encabezado y pendientes por grupo', async () => {
    await render();
    expect(groupToggle().getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelector('section.category-group')).toBeNull();
    expect(groupToggle().textContent).toBe('Agrupar por categoría');
    expect(groupToggle().type).toBe('button');
    await click(groupToggle());
    expect(groupToggle().getAttribute('aria-pressed')).toBe('true');
    expect(groups()).toEqual([
      { title: 'Lácteos', pending: '1 pendiente', names: ['Leche', 'Queso'] },
      { title: 'Panadería', pending: '1 pendiente', names: ['Pan'] },
      { title: 'Aseo', pending: '1 pendiente', names: ['Jabón'] },
    ]);
    const section = container.querySelector('section.category-group');
    expect(section.getAttribute('aria-labelledby')).toBe(section.querySelector('h3').id);
    expect(section.querySelector('ul').getAttribute('aria-label')).toBe('Lácteos');
    await click(groupToggle());
    expect(container.querySelector('section.category-group')).toBeNull();
    expect(names()).toEqual(['Leche', 'Queso', 'Pan', 'Jabón']);
  });

  it('CP-07: el conteo usa plural y cuenta en toda la lista aunque haya filtros', async () => {
    await render([leche, product(5, 'Yogur', 'Lácteos'), queso]);
    await click(groupToggle());
    expect(groups()[0].pending).toBe('2 pendientes');
    await selectStatus('Comprados');
    expect(groups()).toEqual([{ title: 'Lácteos', pending: '2 pendientes', names: ['Queso'] }]);
  });

  it('CP-08 y CP-09: no muestra grupos vacíos con filtros activos', async () => {
    await render();
    await click(groupToggle());
    expect(groups().map(group => group.title)).not.toContain('Bebidas');
    await selectStatus('Comprados');
    expect(groups().map(group => group.title)).toEqual(['Lácteos']);
    await selectCategory('Aseo');
    expect(container.querySelector('section.category-group')).toBeNull();
    expect(statusMessage()).toBe('No hay productos comprados en la categoría Aseo');
  });

  it('CP-10: marcar y cambiar la categoría actualizan grupos y conteos', async () => {
    await render();
    await click(groupToggle());
    await click(container.querySelector('input[aria-label="Comprado: Leche"]'));
    expect(groups()[0]).toEqual({ title: 'Lácteos', pending: '0 pendientes', names: ['Leche', 'Queso'] });

    await click(container.querySelector('li button[aria-label="Editar Pan"]'));
    const form = container.querySelector('li form');
    await change(form.querySelector('select[name="category"]'), 'Despensa');
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(groups().map(group => group.title)).toEqual(['Lácteos', 'Despensa', 'Aseo']);
    expect(groups()[1]).toEqual({ title: 'Despensa', pending: '1 pendiente', names: ['Pan'] });
  });
});
