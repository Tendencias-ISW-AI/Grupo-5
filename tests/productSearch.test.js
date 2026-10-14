import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';
import {
  filterProducts,
  matchesSearch,
  matchesStatus,
  normalizeText,
} from '../src/utils/productFilters.js';
import { createProductsServer } from './helpers/productsServer.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container;
let root;
let server;

beforeEach(() => {
  localStorage.clear();
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
  localStorage.clear();
});

async function render() {
  await act(async () => root.render(createElement(App)));
}

async function setInputValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function submit(name, quantity) {
  await setInputValue(container.querySelector('#product-name'), name);
  await setInputValue(container.querySelector('#product-quantity'), quantity);
  await act(async () => container.querySelector('.shopping-form').dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  ));
}

function searchInput() {
  return container.querySelector('#product-search');
}

async function search(value) {
  await setInputValue(searchInput(), value);
}

function clearButton() {
  return [...container.querySelectorAll('[role="search"] button')]
    .find((button) => button.textContent === 'Limpiar búsqueda');
}

async function click(element) {
  await act(async () => element.click());
}

async function selectFilter(label) {
  const group = container.querySelector('[role="group"]');
  await click([...group.querySelectorAll('button')].find((node) => node.textContent === label));
}

function names() {
  return [...container.querySelectorAll('li .product-name')].map((node) => node.textContent.trim());
}

function statusMessage() {
  return container.querySelector('[role="status"]')?.textContent;
}

async function togglePurchased(name) {
  const row = [...container.querySelectorAll('li')]
    .find((node) => node.querySelector('.product-name').textContent.trim() === name);
  await click(row.querySelector('input[type="checkbox"]'));
}

const products = [
  { id: '1', name: 'Limón', quantity: 2, purchased: false },
  { id: '2', name: 'Leche', quantity: 1, purchased: true },
  { id: '3', name: 'Arroz integral', quantity: 1, purchased: false },
  { id: '4', name: 'Limón', quantity: 5, purchased: true },
];

describe('HU-17: normalización y filtrado', () => {
  it('normaliza mayúsculas, tildes, diacríticos y espacios', () => {
    expect(normalizeText('  LIMÓN  ')).toBe('limon');
    expect(normalizeText('Café   con  Leche')).toBe('cafe con leche');
    expect(normalizeText('Piña Ñame Pingüino')).toBe('pina name pinguino');
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });

  it('matchesStatus reproduce los filtros de HU-06', () => {
    const pending = { purchased: false };
    const purchased = { purchased: true };
    expect([matchesStatus(pending, 'all'), matchesStatus(purchased, 'all')]).toEqual([true, true]);
    expect([matchesStatus(pending, 'pending'), matchesStatus(purchased, 'pending')]).toEqual([true, false]);
    expect([matchesStatus(pending, 'purchased'), matchesStatus(purchased, 'purchased')]).toEqual([false, true]);
    expect(matchesStatus(pending, 'desconocido')).toBe(false);
  });

  it('CP-03, CP-04 y CP-05: coincidencia parcial sin mayúsculas ni tildes', () => {
    for (const query of ['limon', 'LIMÓN', 'LiMoN', 'imó', 'limón']) {
      expect(filterProducts(products, { query }).map((item) => item.id)).toEqual(['1', '4']);
    }
    expect(matchesSearch({ name: 'Arroz' }, normalizeText('arróz'))).toBe(true);
    expect(filterProducts(products, { query: 'le' }).map((item) => item.id)).toEqual(['2']);
  });

  it('CP-06 y CP-07: ignora espacios externos, múltiples o búsqueda solo con espacios', () => {
    expect(filterProducts(products, { query: '  arroz   integral ' }).map((item) => item.id)).toEqual(['3']);
    expect(filterProducts(products, { query: '   ' })).toEqual(products);
    expect(filterProducts(products)).toEqual(products);
  });

  it('CP-08: combina búsqueda y estado', () => {
    expect(filterProducts(products, { status: 'pending', query: 'limon' }).map((item) => item.id)).toEqual(['1']);
    expect(filterProducts(products, { status: 'purchased', query: 'limon' }).map((item) => item.id)).toEqual(['4']);
    expect(filterProducts(products, { status: 'pending', query: 'leche' })).toEqual([]);
  });

  it('CP-14 y CP-15: conserva orden y referencias sin mutar la colección', () => {
    const snapshot = structuredClone(products);
    const result = filterProducts(products, { query: 'limon' });
    expect(result).not.toBe(products);
    expect(result[0]).toBe(products[0]);
    expect(result[1]).toBe(products[3]);
    expect(products).toEqual(snapshot);
  });

  it('CP-16: trata caracteres especiales como texto literal', () => {
    const special = [{ id: 'x', name: 'Salsa (picante) 2.5*', quantity: 1, purchased: false }];
    for (const query of ['(', '*', '.', '(picante)', '2.5*', '[', '\\']) {
      expect(() => filterProducts(special, { query })).not.toThrow();
    }
    expect(filterProducts(special, { query: '(picante)' })).toHaveLength(1);
    expect(filterProducts(special, { query: '.*' })).toHaveLength(0);
  });
});

describe('HU-17: búsqueda en la interfaz', () => {
  it('CP-01: campo etiquetado, vacío y ubicado antes de filtros y lista', async () => {
    await render(); await submit('Arroz', '1');
    const region = container.querySelector('[role="search"]');
    const input = searchInput();
    expect(region).not.toBeNull();
    expect(input.type).toBe('search');
    expect(input.value).toBe('');
    expect(container.querySelector('label[for="product-search"]').textContent).toBe('Buscar producto');
    const filters = container.querySelector('[role="group"]');
    const list = container.querySelector('.shopping-list');
    expect(region.compareDocumentPosition(filters) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(region.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('CP-02 y CP-05: filtra en cada pulsación', async () => {
    await render(); await submit('Limón', '2'); await submit('Leche', '1'); await submit('Lechuga', '3'); await submit('Arroz', '1');
    await search('l'); expect(names()).toEqual(['Limón', 'Leche', 'Lechuga']);
    await search('le'); expect(names()).toEqual(['Leche', 'Lechuga']);
    await search('lechu'); expect(names()).toEqual(['Lechuga']);
    await search('le'); expect(names()).toEqual(['Leche', 'Lechuga']);
    await search(''); expect(names()).toEqual(['Limón', 'Leche', 'Lechuga', 'Arroz']);
  });

  it('CP-03, CP-04, CP-06 y CP-07: sin distinción de mayúsculas, tildes ni espacios', async () => {
    await render(); await submit('Limón', '2'); await submit('Arroz integral', '1');
    for (const query of ['limon', 'LIMÓN', '  limón  ']) {
      await search(query); expect(names()).toEqual(['Limón']);
    }
    await search('arroz    integral'); expect(names()).toEqual(['Arroz integral']);
    await search('   '); expect(names()).toEqual(['Limón', 'Arroz integral']);
    expect(statusMessage()).toBeUndefined();
  });

  it('CP-14: muestra todos los registros con nombres repetidos en orden', async () => {
    await render(); await submit('Arroz', '2'); await submit('Pan', '1'); await submit('Arroz', '3');
    await search('arroz');
    const rows = [...container.querySelectorAll('li')].map((row) => row.textContent);
    expect(names()).toEqual(['Arroz', 'Arroz']);
    expect(rows[0]).toContain('Cantidad: 2');
    expect(rows[1]).toContain('Cantidad: 3');
  });

  it('CP-08: combina la búsqueda con el filtro de estado', async () => {
    await render(); await submit('Leche', '1'); await submit('Lechuga', '3'); await submit('Arroz', '1');
    await togglePurchased('Lechuga');
    await search('lech');
    expect(names()).toEqual(['Leche', 'Lechuga']);
    await selectFilter('Pendientes'); expect(names()).toEqual(['Leche']);
    await selectFilter('Comprados'); expect(names()).toEqual(['Lechuga']);
    await selectFilter('Todos'); expect(names()).toEqual(['Leche', 'Lechuga']);
    expect(searchInput().value).toBe('lech');
  });

  it('CP-09: recalcula la vista al marcar, desmarcar, editar, eliminar y registrar', async () => {
    await render(); await submit('Leche', '1'); await submit('Lechuga', '3'); await submit('Arroz', '1');
    await search('lech'); await selectFilter('Pendientes');
    await togglePurchased('Leche'); expect(names()).toEqual(['Lechuga']);
    await selectFilter('Comprados'); expect(names()).toEqual(['Leche']);
    await togglePurchased('Leche'); expect(names()).toEqual([]);
    await selectFilter('Todos');

    await click(container.querySelector('li button[aria-label="Editar Lechuga"]'));
    await setInputValue(container.querySelector('li form [name="name"]'), 'Tomate');
    await act(async () => container.querySelector('li form').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    ));
    expect(names()).toEqual(['Leche']);

    await click(container.querySelector('li button[aria-label="Eliminar Leche"]'));
    expect(names()).toEqual([]);

    await submit('Leche deslactosada', '2'); expect(names()).toEqual(['Leche deslactosada']);
    await submit('Pan', '1'); expect(names()).toEqual(['Leche deslactosada']);
    await search(''); expect(names()).toEqual(['Tomate', 'Arroz', 'Leche deslactosada', 'Pan']);
  });

  it('CP-15: el resumen es global y la búsqueda no hace solicitudes a la API', async () => {
    await render(); await submit('Leche', '1'); await submit('Arroz', '1');
    const requests = server.fetch.mock.calls.length;
    const stored = server.items();
    await search('leche'); await search('xyz'); await search('');
    expect(server.fetch.mock.calls).toHaveLength(requests);
    expect(server.items()).toEqual(stored);
    await search('xyz');
    const counts = [...container.querySelectorAll('.shopping-summary dd')].map((node) => node.textContent);
    expect(counts).toEqual(['2', '2', '0']);
  });

  it('CP-15: la búsqueda no se conserva al remontar la aplicación', async () => {
    await render(); await submit('Leche', '1'); await search('xyz');
    await act(async () => root.unmount());
    root = createRoot(container);
    await render();
    expect(searchInput().value).toBe('');
    expect(names()).toEqual(['Leche']);
  });

  it('descarta el borrador de un producto que deja de coincidir', async () => {
    await render(); await submit('Leche', '1');
    await click(container.querySelector('li button[aria-label="Editar Leche"]'));
    await setInputValue(container.querySelector('li form [name="name"]'), 'Borrador');
    await search('xyz'); await search('');
    expect(names()).toEqual(['Leche']);
    expect(container.querySelector('li form')).toBeNull();
  });
});

describe('HU-17: estado vacío y limpieza', () => {
  it('CP-10: mensaje claro cuando no hay coincidencias', async () => {
    await render(); await submit('Leche', '1');
    await search('  xyz ');
    expect(names()).toEqual([]);
    expect(statusMessage()).toBe('No se encontraron productos que coincidan con "xyz"');
    await selectFilter('Pendientes');
    expect(statusMessage()).toBe('No se encontraron productos que coincidan con "xyz"');
    await search('leche'); await selectFilter('Comprados');
    expect(statusMessage()).toBe('No se encontraron productos que coincidan con "leche"');
    await search('');
    expect(statusMessage()).toBe('No tienes productos comprados');
  });

  it('CP-11: lista original vacía conserva su mensaje', async () => {
    await render();
    await search('leche');
    expect(statusMessage()).toBe('Tu lista de compras está vacía');
  });

  it('CP-12: limpiar vacía el campo, devuelve el foco y restaura la vista del filtro', async () => {
    await render(); await submit('Leche', '1'); await submit('Arroz', '1'); await togglePurchased('Arroz');
    await selectFilter('Pendientes'); await search('xyz');
    expect(clearButton().disabled).toBe(false);
    await click(clearButton());
    expect(searchInput().value).toBe('');
    expect(document.activeElement).toBe(searchInput());
    expect(names()).toEqual(['Leche']);
    expect(statusMessage()).toBeUndefined();
  });

  it('CP-13: el botón limpiar está deshabilitado sin búsqueda', async () => {
    await render();
    const button = clearButton();
    expect(button.type).toBe('button');
    expect(button.disabled).toBe(true);
    await search('a'); expect(clearButton().disabled).toBe(false);
    await search(''); expect(clearButton().disabled).toBe(true);
  });
});
