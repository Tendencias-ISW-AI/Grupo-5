import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';
import useShoppingList from '../src/hooks/useShoppingList.js';
import { createProductsServer, jsonResponse } from './helpers/productsServer.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container, root, server;
const fixture = { id: '00000000-0000-4000-8000-000000000099', name: 'Arroz', quantity: 2, purchased: false };
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
async function render(component = createElement(App)) { await act(async () => root.render(component)); }
async function hook(strict = false) {
  let current;
  function Harness() { current = useShoppingList(); return null; }
  await render(strict ? createElement(StrictMode, null, createElement(Harness)) : createElement(Harness));
  return () => current;
}
async function input(selector, value) {
  await act(async () => {
    const element = container.querySelector(selector);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function submit() { await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); }
beforeEach(() => {
  localStorage.clear(); server = createProductsServer(); vi.stubGlobal('fetch', server.fetch);
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });

describe('SMARLIST-15 integración asíncrona', () => {
  it('carga no representa lista vacía ni permite escrituras', async () => {
    const loading = deferred(); server.fetch.mockReturnValueOnce(loading.promise);
    const current = await hook();
    expect(current().loadState).toBe('loading');
    expect((await current().addProduct('Pan', 1)).success).toBe(false);
    expect(server.fetch).toHaveBeenCalledOnce();
    await act(async () => loading.resolve(jsonResponse([fixture])));
    expect(current().loadState).toBe('ready'); expect(current().items).toEqual([fixture]);
  });
  it('interfaz distingue carga, error y vacío sin mostrar cero como datos recuperados', async () => {
    const loading = deferred(); server.fetch.mockReturnValueOnce(loading.promise);
    await render(); expect(container.textContent).toContain('Cargando productos...');
    expect(container.querySelector('dd')).toBeNull(); expect(container.textContent).not.toContain('Tu lista de compras está vacía');
    await act(async () => loading.reject(new TypeError('offline')));
    expect(container.querySelector('[role="alert"]').textContent).toContain('No se pudo conectar');
    expect(container.querySelector('button[type="submit"]').disabled).toBe(true);
    expect(container.textContent).not.toContain('Tu lista de compras está vacía');
  });
  it('POST pendiente bloquea controles y solo limpia tras confirmación', async () => {
    await render(); await input('#product-name', 'Pan'); await input('#product-quantity', '2');
    const saving = deferred(); server.fetch.mockReturnValueOnce(saving.promise);
    await submit(); expect(container.querySelector('li')).toBeNull();
    expect(container.querySelector('#product-name').value).toBe('Pan'); expect(container.querySelector('button[type="submit"]').disabled).toBe(true);
    const confirmed = { ...fixture, name: 'Pan' };
    await act(async () => saving.resolve(jsonResponse(confirmed, 201)));
    expect(container.querySelector('.product-name').textContent).toBe('Pan'); expect(container.querySelector('#product-name').value).toBe('');
  });
  it('dos submits en el mismo ciclo no duplican el registro', async () => {
    await render(); await input('#product-name', 'Pan'); await input('#product-quantity', '2');
    const gate = deferred(); server.fetch.mockReturnValueOnce(gate.promise);
    await act(async () => {
      const form = container.querySelector('form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(server.fetch.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
    await act(async () => gate.resolve(jsonResponse({ ...fixture, name: 'Pan' }, 201)));
    expect(container.querySelectorAll('li')).toHaveLength(1);
  });
  it.each([400, 503])('POST rechazado%s conserva formulario y colección', async status => {
    await render(); await input('#product-name', 'Pan'); await input('#product-quantity', '2');
    server.fetch.mockResolvedValueOnce(jsonResponse({ error: 'Registro rechazado.' }, status)); await submit();
    expect(container.querySelector('li')).toBeNull(); expect(container.querySelector('#product-name').value).toBe('Pan');
    expect(container.querySelector('[role="alert"]').textContent).toBe('Registro rechazado.');
  });
  it('PUT fallido conserva borrador, producto e identidad', async () => {
    server.seed([fixture]); await render();
    await act(async () => container.querySelector('.edit-button').click()); await input('li [name="name"]', 'Pan');
    server.fetch.mockResolvedValueOnce(jsonResponse({ error: 'Edición rechazada.' }, 503));
    await act(async () => container.querySelector('li form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(container.querySelector('li [name="name"]').value).toBe('Pan'); expect(server.items()).toEqual([fixture]);
    expect(container.querySelector('li [role="alert"]').textContent).toBe('Edición rechazada.');
    await act(async () => container.querySelector('li button[type="button"]').click()); expect(container.querySelector('.product-name').textContent).toBe('Arroz');
  });
  it.each(['PATCH', 'DELETE'])('%s fallido no muestra cambios persistidos', async method => {
    server.seed([fixture]); const current = await hook(); const previous = current().items;
    server.fetch.mockResolvedValueOnce(jsonResponse({ error: 'Operación rechazada.' }, 503));
    let result; await act(async () => { result = await (method === 'PATCH' ? current().togglePurchased(fixture.id) : current().removeProduct(fixture.id)); });
    expect(result.success).toBe(false); expect(current().items).toBe(previous); expect(current().error).toBe('Operación rechazada.');
  });
  it('error de red en escritura no altera estado confirmado', async () => {
    server.seed([fixture]); const current = await hook();
    server.fetch.mockRejectedValueOnce(new TypeError('offline'));
    await act(async () => { expect((await current().removeProduct(fixture.id)).success).toBe(false); });
    expect(current().items).toEqual([fixture]); expect(current().error).toContain('No se pudo conectar');
  });
  it('alternancias concurrentes se serializan y calculan booleanos al ejecutar', async () => {
    server.seed([fixture]); const current = await hook(); const gate = deferred();
    const normalFetch = server.fetch.getMockImplementation(); let writes = 0;
    server.fetch.mockImplementation(async (...args) => { if (args[1].method === 'PATCH' && ++writes === 1) await gate.promise; return normalFetch(...args); });
    let first, second, third;
    await act(async () => { first = current().togglePurchased(fixture.id); second = current().togglePurchased(fixture.id); third = current().togglePurchased(fixture.id); });
    expect(server.fetch.mock.calls.filter(([, options]) => options.method === 'PATCH')).toHaveLength(1);
    expect(current().items[0].purchased).toBe(false); expect(current().pending).toBe(true);
    await act(async () => { gate.resolve(); await Promise.all([first, second, third]); });
    expect(current().items[0].purchased).toBe(true); expect(current().pending).toBe(false);
    expect(server.fetch.mock.calls.filter(([, options]) => options.method === 'PATCH').map(([, options]) => JSON.parse(options.body).purchased)).toEqual([true, false, true]);
  });
  it('PATCH, PUT y DELETE agrupados no pierden confirmaciones ni generan resurrecciones', async () => {
    server.seed([fixture]); const current = await hook();
    await act(async () => { await Promise.all([current().togglePurchased(fixture.id), current().updateProduct(fixture.id, { name: 'Pan', quantity: 3 })]); });
    expect(current().items[0]).toEqual({ ...fixture, name: 'Pan', quantity: 3, purchased: true });
    await act(async () => { await Promise.all([current().removeProduct(fixture.id), current().togglePurchased(fixture.id)]); });
    expect(current().items).toEqual([]); expect(server.items()).toEqual([]);
    expect(server.fetch.mock.calls.filter(([, options]) => options.method === 'PATCH')).toHaveLength(1);
  });
  it('StrictMode ignora GET obsoleto aunque fetch no respete cancelación', async () => {
    const old = deferred(); server.fetch.mockReturnValueOnce(old.promise); server.seed([fixture]);
    const current = await hook(true); expect(current().items).toEqual([fixture]);
    await act(async () => { await current().addProduct('Pan', 1); });
    const confirmed = current().items;
    await act(async () => old.resolve(jsonResponse([])));
    expect(current().items).toBe(confirmed); expect(current().items).toHaveLength(2);
    expect(server.fetch.mock.calls[0][1].signal.aborted).toBe(true);
  });
  it('desmontaje ignora respuesta de escritura tardía', async () => {
    const current = await hook(); const gate = deferred(); server.fetch.mockReturnValueOnce(gate.promise);
    let saving; await act(async () => { saving = current().addProduct('Pan', 1); });
    await act(async () => root.unmount());
    await act(async () => { gate.resolve(jsonResponse(fixture, 201)); expect((await saving).success).toBe(false); });
    expect(current().items).toEqual([]);
  });
  it('ocultar formulario durante PUT conserva la confirmación global sin recuperar borrador', async () => {
    server.seed([fixture]); await render();
    await act(async () => container.querySelector('.edit-button').click()); await input('li [name="name"]', 'Pan');
    const gate = deferred(); server.fetch.mockReturnValueOnce(gate.promise);
    await act(async () => container.querySelector('li form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    await act(async () => container.querySelector('[aria-pressed="false"]:last-child').click());
    expect(container.querySelector('li form')).toBeNull();
    await act(async () => gate.resolve(jsonResponse({ ...fixture, name: 'Pan' })));
    await act(async () => container.querySelector('[aria-pressed]').click());
    expect(container.querySelector('.product-name').textContent).toBe('Pan'); expect(container.querySelector('li form')).toBeNull();
  });
  it('no lee, escribe, migra ni borra localStorage y UUID es exclusivamente del servidor', async () => {
    const serialized = JSON.stringify([{ ...fixture, name: 'Histórico' }]); localStorage.setItem('smartlist.products', serialized);
    const read = vi.spyOn(Storage.prototype, 'getItem'); const write = vi.spyOn(Storage.prototype, 'setItem'); const remove = vi.spyOn(Storage.prototype, 'removeItem');
    const uuid = vi.spyOn(crypto, 'randomUUID').mockImplementation(() => { throw new Error('UUID cliente prohibido'); });
    const current = await hook(); expect(current().items).toEqual([]);
    await act(async () => { await current().addProduct('Pan', 1); });
    expect(current().items[0].id).toBe(server.items()[0].id);
    expect(read).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled(); expect(remove).not.toHaveBeenCalled(); expect(uuid).not.toHaveBeenCalled();
    expect(localStorage.getItem('smartlist.products')).toBe(serialized);
    expect(server.items()).toHaveLength(1);
  });
  it('filtros y renderizados conservan resumen sin solicitudes de escritura', async () => {
    server.seed([fixture, { ...fixture, id: 'segundo', name: 'Pan', purchased: true }]); await render();
    for (const button of container.querySelectorAll('[aria-pressed]')) await act(async () => button.click());
    await render(); expect([...container.querySelectorAll('dd')].map(node => node.textContent)).toEqual(['2', '1', '1']);
    expect(server.fetch).toHaveBeenCalledOnce(); expect(server.fetch.mock.calls[0][1].method).toBe('GET');
  });
  it('límites de esquema se validan antes de SQL/API', async () => {
    const current = await hook();
    for (const [name, quantity] of [['x'.repeat(151), 1], ['Pan', 2147483648], ['\ud800', 1]]) {
      expect((await current().addProduct(name, quantity)).success).toBe(false);
    }
    expect(server.fetch).toHaveBeenCalledOnce();
  });
});
