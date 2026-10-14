import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProductsServer } from './helpers/productsServer.js';
import App from '../src/App.jsx';
import ShoppingForm from '../src/components/ShoppingForm.jsx';
import ShoppingList from '../src/components/ShoppingList.jsx';
import useShoppingList from '../src/hooks/useShoppingList.js';
import { STORAGE_KEY, readShoppingList, writeShoppingList } from '../src/utils/shoppingListStorage.js';
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
async function render(component = createElement(App)) {
  await act(async () => root.render(component));
}
async function enterValue(id, value) {
  const input = container.querySelector(`#${id}`);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', {
      bubbles: true
    }));
  });
}
async function submit(name, quantity) {
  await enterValue('product-name', name);
  await enterValue('product-quantity', quantity);
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', {
    bubbles: true,
    cancelable: true
  })));
}
async function renderHook() {
  let current;
  function Harness() {
    current = useShoppingList();
    return null;
  }
  await render(createElement(Harness));
  return () => current;
}
describe('HU-01: registro desde la interfaz', () => {
  it('CP-01: agrega Arroz, 2 y actualiza la lista inmediatamente', async () => {
    await render();
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
    await submit('Arroz', '2');
    const item = container.querySelector('li');
    expect(item.textContent).toContain('Arroz');
    expect(item.textContent).toContain('Cantidad: 2');
    expect(item.textContent).toContain('Pendiente');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
  it.each([['CP-02', '', '2', 'name'], ['CP-03', '   ', '2', 'name'], ['CP-04', 'Arroz', '0', 'quantity'], ['CP-05', 'Arroz', '-1', 'quantity'], ['CP-06', 'Arroz', '1.5', 'quantity'], ['CP-07', 'Arroz', 'abc', 'quantity'], ['Cantidad obligatoria', 'Arroz', '', 'quantity'], ['Cantidad con espacios', 'Arroz', '   ', 'quantity']])('%s: rechaza datos inválidos y conserva los campos', async (_id, name, quantity, field) => {
    await render();
    await submit(name, quantity);
    expect(container.querySelector('li')).toBeNull();
    expect(container.querySelector(`#${field}-error`).textContent).not.toBe('');
    expect(container.querySelector('#product-name').value).toBe(name);
    expect(container.querySelector('#product-quantity').value).toBe(quantity);
  });
  it('CP-09: limpia ambos campos tras un registro exitoso', async () => {
    await render();
    await submit('Arroz', '2');
    expect(container.querySelector('#product-name').value).toBe('');
    expect(container.querySelector('#product-quantity').value).toBe('');
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
  it('CP-11: muestra el nombre normalizado', async () => {
    await render();
    await submit('  Arroz integral  ', '2');
    expect(container.querySelector('.product-name').textContent).toBe('Arroz integral');
  });
  it('permite corregir un error y registrar el producto', async () => {
    await render();
    await submit('Arroz', '0');
    await submit('Arroz', '2');
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
  it('asocia etiquetas y errores con los campos accesibles', async () => {
    await render();
    expect(container.querySelector('label[for="product-name"]')).not.toBeNull();
    expect(container.querySelector('label[for="product-quantity"]')).not.toBeNull();
    expect(container.querySelector('button[type="submit"]')).not.toBeNull();
    await submit('', '');
    for (const [id, errorId] of [['product-name', 'name-error'], ['product-quantity', 'quantity-error']]) {
      const input = container.querySelector(`#${id}`);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe(errorId);
    }
  });
  it('conserva los campos si la operación de registro rechaza la solicitud', async () => {
    await render(createElement(ShoppingForm, {
      onAddProduct: () => ({
        success: false,
        errors: {
          quantity: 'Registro rechazado.'
        }
      })
    }));
    await submit('Arroz', '2');
    expect(container.querySelector('#product-name').value).toBe('Arroz');
    expect(container.querySelector('#product-quantity').value).toBe('2');
    expect(container.querySelector('#quantity-error').textContent).toBe('Registro rechazado.');
  });
});
describe('HU-02: visualización de productos', () => {
  it('CP-03 y CP-06: muestra todos los datos de una colección con estados mixtos', async () => {
    const items = [{
      id: 'arroz',
      name: 'Arroz',
      quantity: 2,
      purchased: false
    }, {
      id: 'pan',
      name: 'Pan',
      quantity: 3,
      purchased: true
    }, {
      id: 'leche',
      name: 'Leche',
      quantity: 1,
      purchased: false
    }];
    await render(createElement(ShoppingList, {
      items
    }));
    const rows = container.querySelectorAll('li');
    expect(rows).toHaveLength(items.length);
    items.forEach((item, index) => {
      expect(rows[index].querySelector('.product-name').textContent).toBe(item.name);
      expect(rows[index].textContent).toContain(`Cantidad: ${item.quantity}`);
      expect(rows[index].querySelector('.product-status').textContent).toBe(item.purchased ? 'Comprado' : 'Pendiente');
    });
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelectorAll('button:not(.remove-button):not(.edit-button), input:not([type="checkbox"])')).toHaveLength(0);
    expect(container.querySelectorAll('button.remove-button')).toHaveLength(items.length);
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(items.length);
  });
  it('CP-09: muestra registros con nombres repetidos por separado', async () => {
    await render();
    await submit('Arroz', '2');
    await submit('Arroz', '3');
    const rows = container.querySelectorAll('li');
    expect(rows).toHaveLength(2);
    expect([...rows].map(row => row.querySelector('.product-name').textContent)).toEqual(['Arroz', 'Arroz']);
    expect(rows[0].textContent).toContain('Cantidad: 2');
    expect(rows[1].textContent).toContain('Cantidad: 3');
  });
});
describe('HU-03: marcar y desmarcar productos', () => {
  it('CP-01: cada producto nuevo tiene un checkbox accesible desmarcado', async () => {
    await render();
    await submit('Arroz', '2');
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);
    expect(checkbox.getAttribute('aria-label')).toBe('Comprado: Arroz');
  });
  it('CP-02, CP-03 y CP-07: marcar actualiza checkbox, indicador y tachado inmediatamente', async () => {
    await render();
    await submit('Arroz', '2');
    const checkbox = container.querySelector('input[type="checkbox"]');
    const name = container.querySelector('.product-name');
    await act(async () => checkbox.click());
    expect(checkbox.checked).toBe(true);
    expect(container.querySelector('.product-status').textContent).toBe('Comprado');
    expect(name.classList.contains('product-name-purchased')).toBe(true);
    expect(container.querySelector('.product-status').classList.contains('product-name-purchased')).toBe(false);
  });
  it('CP-04 y CP-05: desmarcar restaura estado y apariencia', async () => {
    await render();
    await submit('Arroz', '2');
    const checkbox = container.querySelector('input[type="checkbox"]');
    await act(async () => checkbox.click());
    await act(async () => checkbox.click());
    expect(checkbox.checked).toBe(false);
    expect(container.querySelector('.product-status').textContent).toBe('Pendiente');
    expect(container.querySelector('.product-name').classList.contains('product-name-purchased')).toBe(false);
  });
  it('CP-06: cambia solo el registro seleccionado entre nombres repetidos', async () => {
    await render();
    await submit('Arroz', '2');
    await submit('Arroz', '3');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    await act(async () => checkboxes[1].click());
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
    expect([...container.querySelectorAll('.product-status')].map(node => node.textContent)).toEqual(['Pendiente', 'Comprado']);
  });
  it('CP-08: procesa alternancias consecutivas incluso en una misma actualización', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    const id = current().items[0].id;
    await act(async () => {
      await current().togglePurchased(id);
      await current().togglePurchased(id);
      await current().togglePurchased(id);
    });
    expect(current().items[0].purchased).toBe(true);
    await act(async () => {
      await current().togglePurchased(id);
    });
    expect(current().items[0].purchased).toBe(false);
  });
  it('CP-09: un ID inexistente conserva la colección y sus registros', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().togglePurchased('inexistente');
    });
    expect(current().items).toEqual([]);
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    const previousItems = current().items;
    await act(async () => {
      await current().togglePurchased('inexistente');
    });
    expect(current().items).toBe(previousItems);
  });
  it('CP-02, CP-06 y CP-10: invierte purchased sin mutar ni alterar otros atributos o productos', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
      await current().addProduct('Pan', 1);
    });
    const previousItems = current().items;
    const original = previousItems[0];
    Object.freeze(original);
    Object.freeze(previousItems);
    await act(async () => {
      await current().togglePurchased(original.id);
    });
    expect(current().items).not.toBe(previousItems);
    expect(current().items[0]).toEqual({
      ...original,
      purchased: true
    });
    expect(original.purchased).toBe(false);
    expect(current().items[1]).toBe(previousItems[1]);
    await act(async () => {
      await current().togglePurchased(original.id);
    });
    expect(current().items[0]).toEqual(original);
  });
});
describe('HU-04: eliminar productos', () => {
  it('CP-01: cada producto tiene un botón accesible de eliminación', async () => {
    await render();
    await submit('Arroz', '2');
    await submit('Pan', '1');
    const buttons = container.querySelectorAll('li button[aria-label^="Eliminar "]');
    expect(buttons).toHaveLength(2);
    expect([...buttons].map(button => button.getAttribute('aria-label'))).toEqual(['Eliminar Arroz', 'Eliminar Pan']);
    for (const button of buttons) {
      expect(button.type).toBe('button');
      expect(button.textContent).toBe('Eliminar');
    }
  });
  it.each([false, true])('CP-02, CP-05, CP-06, CP-08 y CP-09: elimina el último producto (comprado=%s)', async purchased => {
    await render();
    await submit('Arroz', '2');
    if (purchased) await act(async () => container.querySelector('li input').click());
    await act(async () => container.querySelector('li button[aria-label^="Eliminar "]').click());
    expect(container.querySelector('li')).toBeNull();
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
    expect(container.querySelector('h1').textContent).toBe('SmartList');
    await submit('Pan', '1');
    expect(container.querySelector('li').textContent).toContain('Pan');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
  it('CP-03 y CP-04: elimina solo el registro seleccionado entre nombres repetidos', async () => {
    await render();
    await submit('Arroz', '2');
    await submit('Arroz', '3');
    await submit('Pan', '1');
    const rows = container.querySelectorAll('li');
    await act(async () => rows[1].querySelector('input').click());
    await act(async () => rows[0].querySelector('button[aria-label^="Eliminar "]').click());
    const remaining = container.querySelectorAll('li');
    expect(remaining).toHaveLength(2);
    expect(remaining[0]).toBe(rows[1]);
    expect(remaining[1]).toBe(rows[2]);
    expect(remaining[0].querySelector('.product-name').textContent).toBe('Arroz');
    expect(remaining[0].textContent).toContain('Cantidad: 3');
    expect(remaining[0].querySelector('input').checked).toBe(true);
    expect(remaining[0].querySelector('.product-status').textContent).toBe('Comprado');
    await act(async () => remaining[0].querySelector('input').click());
    expect(remaining[0].querySelector('.product-status').textContent).toBe('Pendiente');
  });
  it('CP-07: un ID inexistente conserva la misma colección', async () => {
    const current = await renderHook();
    const emptyItems = current().items;
    await act(async () => {
      await current().removeProduct('inexistente');
    });
    expect(current().items).toBe(emptyItems);
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    const previousItems = current().items;
    await act(async () => {
      await current().removeProduct('inexistente');
    });
    expect(current().items).toBe(previousItems);
  });
  it('CP-10: conserva orden, objetos y atributos sin mutar el estado anterior', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
      await current().addProduct('Pan', 1);
      await current().addProduct('Leche', 3);
    });
    await act(async () => {
      await current().togglePurchased(current().items[2].id);
    });
    const previousItems = current().items;
    const snapshot = previousItems.map(item => ({
      ...item
    }));
    previousItems.forEach(Object.freeze);
    Object.freeze(previousItems);
    await act(async () => {
      await current().removeProduct(previousItems[1].id);
    });
    expect(previousItems).toEqual(snapshot);
    expect(current().items).not.toBe(previousItems);
    expect(current().items).toEqual([snapshot[0], snapshot[2]]);
    expect(current().items[0]).toBe(previousItems[0]);
    expect(current().items[1]).toBe(previousItems[2]);
  });
  it('CP-11: procesa eliminaciones consecutivas en una misma actualización', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
      await current().addProduct('Pan', 1);
      await current().addProduct('Leche', 3);
    });
    const [first, second, third] = current().items;
    await act(async () => {
      await current().removeProduct(first.id);
      await current().removeProduct(first.id);
      await current().removeProduct(second.id);
    });
    expect(current().items).toEqual([third]);
    await act(async () => {
      await current().removeProduct(third.id);
    });
    expect(current().items).toEqual([]);
  });
});
describe('HU-05: edición local', () => {
  async function beginEdit(index = 0) {
    const row = container.querySelectorAll('li')[index];
    await act(async () => row.querySelector('button[aria-label^="Editar "]').click());
    return container.querySelectorAll('li')[index].querySelector('form');
  }
  async function change(form, field, value) {
    const input = form.querySelector(`input[name="${field}"]`);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    await act(async () => {
      setter.call(input, value);
      input.dispatchEvent(new Event('input', {
        bubbles: true
      }));
    });
  }
  async function save(form) {
    await act(async () => form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    })));
  }
  it('CP-01 y CP-02: opción accesible y precarga de valores con IDs únicos', async () => {
    await render();
    await submit('Arroz', '2');
    await submit('Pan', '1');
    expect(container.querySelectorAll('button[aria-label^="Editar "]')).toHaveLength(2);
    const first = await beginEdit();
    const second = await beginEdit(1);
    expect(first.querySelector('[name="name"]').value).toBe('Arroz');
    expect(first.querySelector('[name="quantity"]').value).toBe('2');
    expect(first.querySelector('[name="name"]').id).not.toBe(second.querySelector('[name="name"]').id);
    for (const input of first.querySelectorAll('input')) {
      expect([...first.querySelectorAll('label')].some(label => label.htmlFor === input.id)).toBe(true);
    }
    expect(first.querySelector('input[type="checkbox"]')).toBeNull();
    expect(first.querySelector('.remove-button')).toBeNull();
  });
  it.each([['name', '  Arroz integral  ', 'Arroz integral'], ['quantity', '5', 'Cantidad: 5']])('CP-03, CP-04, CP-10, CP-18 y CP-19: guarda %s y termina edición', async (field, value, visible) => {
    await render();
    await submit('Arroz', '2');
    const form = await beginEdit();
    await change(form, field, value);
    await save(form);
    expect(container.querySelector('li form')).toBeNull();
    expect(container.querySelector('li').textContent).toContain(visible);
  });
  it.each([['CP-05', 'name', ''], ['CP-06', 'name', '   '], ['CP-07', 'quantity', '0'], ['CP-08', 'quantity', '-1'], ['CP-09 decimal', 'quantity', '1.5'], ['CP-09 texto', 'quantity', 'abc'], ['Cantidad obligatoria', 'quantity', '']])('%s: conserva borrador inválido y no guarda', async (_case, field, value) => {
    await render();
    await submit('Arroz', '2');
    const form = await beginEdit();
    await change(form, field, value);
    await save(form);
    expect(container.querySelector('li form')).toBe(form);
    expect(form.querySelector('[role="alert"]')).not.toBeNull();
    expect(form.querySelector(`[name="${field}"]`).value).toBe(value);
    await act(async () => form.querySelector('button[type="button"]').click());
    const reopened = await beginEdit();
    expect(reopened.querySelector('[name="name"]').value).toBe('Arroz');
    expect(reopened.querySelector('[name="quantity"]').value).toBe('2');
    expect(reopened.querySelector('[role="alert"]')).toBeNull();
  });
  it('CP-11: cancela ambos cambios y reabre los datos vigentes después de guardar', async () => {
    await render();
    await submit('Arroz', '2');
    let form = await beginEdit();
    await change(form, 'name', 'Pan');
    await change(form, 'quantity', '5');
    await act(async () => form.querySelector('button[type="button"]').click());
    expect(container.querySelector('li').textContent).toContain('Arroz');
    expect(container.querySelector('li').textContent).toContain('Cantidad: 2');
    form = await beginEdit();
    await change(form, 'name', 'Leche');
    await save(form);
    expect((await beginEdit()).querySelector('[name="name"]').value).toBe('Leche');
  });
  it.each([false, true])('CP-12 a CP-15: conserva estado %s e independencia entre duplicados', async purchased => {
    await render();
    await submit('Arroz', '2');
    await submit('Arroz', '3');
    if (purchased) await act(async () => container.querySelector('li input').click());
    const form = await beginEdit();
    await change(form, 'name', 'Pan');
    await save(form);
    const rows = container.querySelectorAll('li');
    expect(rows[0].querySelector('input').checked).toBe(purchased);
    expect(rows[0].querySelector('.product-name').classList.contains('product-name-purchased')).toBe(purchased);
    expect(rows[1].querySelector('.product-name').textContent).toBe('Arroz');
    expect(rows[1].textContent).toContain('Cantidad: 3');
  });
  it('CP-14 y CP-17: protege ID, estado, orden e inmutabilidad en el hook', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
      await current().addProduct('Pan', 1);
    });
    const [original, other] = current().items;
    const oldItems = current().items;
    Object.freeze(original);
    Object.freeze(oldItems);
    let result;
    await act(async () => {
      result = await current().updateProduct(original.id, {
        name: '  Leche  ',
        quantity: '3',
        id: 'otro',
        purchased: true
      });
    });
    expect(result.success).toBe(true);
    expect(current().items[0]).toEqual({
      ...original,
      name: 'Leche',
      quantity: 3
    });
    expect(current().items[1]).toBe(other);
    expect(original.name).toBe('Arroz');
    expect(current().items).not.toBe(oldItems);
  });
  it('conserva purchased vigente ante cambios agrupados', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    const id = current().items[0].id;
    await act(async () => {
      await current().togglePurchased(id);
      await current().updateProduct(id, {
        name: 'Pan',
        quantity: 3
      });
    });
    expect(current().items[0]).toEqual({
      id,
      name: 'Pan',
      quantity: 3,
      purchased: true
    });
  });
  it('CP-16: ID inexistente no modifica la colección', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    const oldItems = current().items;
    let result;
    await act(async () => {
      result = await current().updateProduct('inexistente', {
        name: 'Pan',
        quantity: 1
      });
    });
    expect(result.success).toBe(false);
    expect(current().items).toBe(oldItems);
  });
  it.each([['', 1], ['  ', 1], ['Pan', 0], ['Pan', -1], ['Pan', 1.5], ['Pan', 'abc'], ['Pan', '']])('valida (%s, %s) independientemente en el hook', async (name, quantity) => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    const oldItems = current().items;
    let result;
    await act(async () => {
      result = await current().updateProduct(oldItems[0].id, {
        name,
        quantity
      });
    });
    expect(result.success).toBe(false);
    expect(current().items).toBe(oldItems);
  });
});
describe('HU-06: filtros por estado', () => {
  async function selectFilter(label) {
    const group = container.querySelector('[role="group"]');
    const button = [...group.querySelectorAll('button')].find(node => node.textContent === label);
    await act(async () => button.click());
    return button;
  }
  function names() {
    return [...container.querySelectorAll('li .product-name')].map(node => node.textContent.trim());
  }
  async function mixedProducts() {
    await render();
    await submit('Arroz', '2');
    await submit('Pan', '1');
    await submit('Leche', '3');
    await act(async () => container.querySelectorAll('li input[type="checkbox"]')[1].click());
  }
  it('CP-01 y CP-02: tres botones accesibles con Todos inicialmente activo', async () => {
    await render();
    const group = container.querySelector('[role="group"]');
    expect(group.getAttribute('aria-label')).toBe('Filtrar productos por estado');
    const buttons = [...group.querySelectorAll('button')];
    expect(buttons.map(button => button.textContent)).toEqual(['Todos', 'Pendientes', 'Comprados']);
    expect(buttons.map(button => button.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    buttons.forEach(button => expect(button.type).toBe('button'));
  });
  it('CP-03 a CP-06 y CP-10: filtra inmediatamente y conserva datos y orden al alternar', async () => {
    await mixedProducts();
    const originalRows = [...container.querySelectorAll('li')].map(row => ({
      name: row.querySelector('.product-name').textContent,
      quantity: row.textContent.match(/Cantidad: \d+/)[0],
      state: row.querySelector('.product-status').textContent
    }));
    for (let index = 0; index < 3; index += 1) {
      expect((await selectFilter('Pendientes')).getAttribute('aria-pressed')).toBe('true');
      expect(names()).toEqual(['Arroz', 'Leche']);
      await selectFilter('Comprados');
      expect(names()).toEqual(['Pan']);
      await selectFilter('Todos');
      expect(names()).toEqual(['Arroz', 'Pan', 'Leche']);
    }
    expect([...container.querySelectorAll('li')].map(row => ({
      name: row.querySelector('.product-name').textContent,
      quantity: row.textContent.match(/Cantidad: \d+/)[0],
      state: row.querySelector('.product-status').textContent
    }))).toEqual(originalRows);
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
  });
  it('CP-07 y CP-08: mensajes específicos cuando hay productos sin coincidencias', async () => {
    await render();
    await submit('Arroz', '2');
    await selectFilter('Comprados');
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos comprados');
    await selectFilter('Todos');
    await act(async () => container.querySelector('li input').click());
    await selectFilter('Pendientes');
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos pendientes');
  });
  it('CP-09: colección original vacía conserva el mensaje en cualquier filtro', async () => {
    await render();
    for (const label of ['Todos', 'Pendientes', 'Comprados']) {
      await selectFilter(label);
      expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
    }
  });
  it('CP-11 y CP-12: marcar y desmarcar retira el registro de la vista correspondiente', async () => {
    await render();
    await submit('Arroz', '2');
    await selectFilter('Pendientes');
    await act(async () => container.querySelector('li input').click());
    expect(names()).toEqual([]);
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos pendientes');
    await selectFilter('Comprados');
    expect(names()).toEqual(['Arroz']);
    await act(async () => container.querySelector('li input').click());
    expect(names()).toEqual([]);
    await selectFilter('Pendientes');
    expect(names()).toEqual(['Arroz']);
  });
  it('CP-13 y CP-14: registro visible en Pendientes y oculto en Comprados', async () => {
    await render();
    await selectFilter('Pendientes');
    await submit('Arroz', '2');
    expect(names()).toEqual(['Arroz']);
    await selectFilter('Comprados');
    await submit('Pan', '1');
    expect(names()).toEqual([]);
    expect(container.querySelector('#product-name').value).toBe('');
    await selectFilter('Todos');
    expect(names()).toEqual(['Arroz', 'Pan']);
  });
  it('CP-15: elimina el producto visible y conserva registros ocultos', async () => {
    await mixedProducts();
    await selectFilter('Comprados');
    await act(async () => container.querySelector('li button[aria-label^="Eliminar "]').click());
    expect(names()).toEqual([]);
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos comprados');
    await selectFilter('Todos');
    expect(names()).toEqual(['Arroz', 'Leche']);
    await selectFilter('Pendientes');
    while (container.querySelector('li')) {
      await act(async () => container.querySelector('li button[aria-label^="Eliminar "]').click());
    }
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
  });
  it('CP-16: edita producto comprado filtrado conservando estado y datos ocultos', async () => {
    await mixedProducts();
    await selectFilter('Comprados');
    await act(async () => container.querySelector('li button[aria-label^="Editar "]').click());
    const form = container.querySelector('li form');
    const input = form.querySelector('[name="name"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Pan integral');
      input.dispatchEvent(new Event('input', {
        bubbles: true
      }));
    });
    await act(async () => form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    })));
    expect(names()).toEqual(['Pan integral']);
    expect(container.querySelector('li input').checked).toBe(true);
    await selectFilter('Todos');
    expect(names()).toEqual(['Arroz', 'Pan integral', 'Leche']);
  });
  it('CP-17: nombres repetidos se filtran por el estado de cada registro', async () => {
    await render();
    await submit('Arroz', '2');
    await submit('Arroz', '3');
    await act(async () => container.querySelectorAll('li input')[1].click());
    await selectFilter('Pendientes');
    expect(names()).toEqual(['Arroz']);
    expect(container.querySelector('li').textContent).toContain('Cantidad: 2');
    await selectFilter('Comprados');
    expect(names()).toEqual(['Arroz']);
    expect(container.querySelector('li').textContent).toContain('Cantidad: 3');
    await selectFilter('Todos');
    expect(names()).toEqual(['Arroz', 'Arroz']);
  });
  it('descarta borrador al ocultar un producto sin cambiar los datos guardados', async () => {
    await render();
    await submit('Arroz', '2');
    await act(async () => container.querySelector('li button[aria-label^="Editar "]').click());
    const input = container.querySelector('li [name="name"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Borrador');
      input.dispatchEvent(new Event('input', {
        bubbles: true
      }));
    });
    await selectFilter('Comprados');
    await selectFilter('Todos');
    expect(names()).toEqual(['Arroz']);
    expect(container.querySelector('li form')).toBeNull();
  });
});
describe('HU-07 adaptada: persistencia API sin migración local', () => {
  const fixtures = [{
    id: 'uno',
    name: 'Arroz',
    quantity: 2,
    purchased: false
  }, {
    id: 'dos',
    name: 'Pan',
    quantity: 3,
    purchased: true
  }];
  function storedItems() {
    return server.items();
  }
  async function remount(component = createElement(App)) {
    await act(async () => root.unmount());
    root = createRoot(container);
    await render(component);
  }
  it('CP-01 y CP-02: guarda automáticamente y recupera tras remontar', async () => {
    await render();
    await submit('Arroz', '2');
    const saved = storedItems();
    expect(saved).toEqual([{
      id: expect.any(String),
      name: 'Arroz',
      quantity: 2,
      purchased: false
    }]);
    await remount();
    expect(container.querySelector('.product-name').textContent.trim()).toBe('Arroz');
    expect(storedItems()).toEqual(saved);
  });
  it('CP-03, CP-04 y CP-15: recupera API con atributos, estados y orden sin escrituras locales', async () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    server.seed(fixtures);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const current = await renderHook();
    expect(current().items).toEqual(fixtures);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
  });
  it('CP-05: guarda edición y recupera nombre, cantidad, ID y estado', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtures));
    server.seed(fixtures);
    const current = await renderHook();
    await act(async () => {
      await current().updateProduct('dos', {
        name: 'Pan integral',
        quantity: 5
      });
    });
    expect(storedItems()).toEqual([fixtures[0], {
      ...fixtures[1],
      name: 'Pan integral',
      quantity: 5
    }]);
    await remount();
    const rows = container.querySelectorAll('li');
    expect(rows[1].textContent).toContain('Pan integral');
    expect(rows[1].textContent).toContain('Cantidad: 5');
    expect(rows[1].querySelector('input').checked).toBe(true);
  });
  it('CP-06: producto eliminado no reaparece tras remontar', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtures));
    server.seed(fixtures);
    const current = await renderHook();
    await act(async () => {
      await current().removeProduct('uno');
    });
    await remount();
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.querySelector('.product-name').textContent.trim()).toBe('Pan');
    expect(storedItems()).toEqual([fixtures[1]]);
  });
  it('CP-07: persiste marcación y desmarcación con su último estado', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fixtures[0]]));
    server.seed([fixtures[0]]);
    const current = await renderHook();
    await act(async () => {
      await current().togglePurchased('uno');
    });
    expect(storedItems()[0].purchased).toBe(true);
    await act(async () => {
      await current().togglePurchased('uno');
    });
    await remount();
    expect(container.querySelector('li input').checked).toBe(false);
    expect(storedItems()[0].purchased).toBe(false);
  });
  it('CP-08: sin datos inicia vacío sin crear escrituras', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    await render();
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
  it.each([['CP-09 JSON corrupto', '{'], ['CP-10 objeto', '{}'], ['CP-10 null', 'null'], ['CP-11 IDs duplicados', JSON.stringify([fixtures[0], fixtures[0]])], ['CP-12 incompleto', JSON.stringify([{
    id: 'uno',
    name: 'Pan'
  }])], ['ID vacío', JSON.stringify([{
    ...fixtures[0],
    id: ' '
  }])], ['Nombre inválido', JSON.stringify([{
    ...fixtures[0],
    name: '  '
  }])], ['Cantidad texto', JSON.stringify([{
    ...fixtures[0],
    quantity: '2'
  }])], ['Cantidad decimal', JSON.stringify([{
    ...fixtures[0],
    quantity: 1.5
  }])], ['Cantidad cero', JSON.stringify([{
    ...fixtures[0],
    quantity: 0
  }])], ['Estado inválido', JSON.stringify([{
    ...fixtures[0],
    purchased: 'false'
  }])], ['Colección parcialmente inválida', JSON.stringify([fixtures[0], {
    id: 'mal'
  }])], ['Propiedad adicional', JSON.stringify([{
    ...fixtures[0],
    extra: true
  }])]])('%s: ignora datos locales históricos y los conserva incluso después de cambios API', async (_case, serialized) => {
    localStorage.setItem(STORAGE_KEY, serialized);
    const read = vi.spyOn(Storage.prototype, 'getItem');
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const current = await renderHook();
    expect(read).not.toHaveBeenCalled();
    expect(current().items).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    expect(write).not.toHaveBeenCalled();
    await act(async () => {
      await current().addProduct('', 2);
      await current().removeProduct('inexistente');
    });
    expect(write).not.toHaveBeenCalled();
    await act(async () => {
      await current().addProduct('Leche', 1);
    });
    expect(storedItems()).toEqual(current().items);
    expect(storedItems()).toHaveLength(1);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    expect(write).not.toHaveBeenCalled();
  });
  it('CP-13: fallo de lectura local no afecta operaciones API', async () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Lectura');
    });
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const current = await renderHook();
    expect(current().items).toEqual([]);
    expect(read).not.toHaveBeenCalled();
    read.mockRestore();
    await act(async () => {
      await current().addProduct('Leche', 1);
    });
    const id = current().items[0].id;
    await act(async () => {
      await current().togglePurchased(id);
      await current().updateProduct(id, {
        name: 'Leche entera',
        quantity: 2
      });
    });
    await act(async () => {
      await current().removeProduct(id);
    });
    expect(current().items).toEqual([]);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
  });
  it('CP-13: acceso local restringido permite seguir trabajando con API', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('Acceso');
    });
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    expect(current().items[0].name).toBe('Arroz');
    vi.restoreAllMocks();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
  it('CP-14: escritura local restringida no afecta persistencia API ni datos históricos', async () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    server.seed(fixtures);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Cuota');
    });
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Leche', 1);
    });
    expect(current().items).toHaveLength(3);
    await act(async () => {
      await current().updateProduct('uno', {
        name: 'Arroz integral',
        quantity: 5
      });
    });
    expect(current().items[0].name).toBe('Arroz integral');
    await act(async () => {
      await current().togglePurchased('uno');
      await current().removeProduct('dos');
    });
    expect(current().items).toHaveLength(2);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
  });
  it('CP-16 y CP-17: filtros y borradores cancelados no causan escrituras', async () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    server.seed(fixtures);
    await render();
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const buttons = container.querySelectorAll('[role="group"] button');
    await act(async () => buttons[1].click());
    await act(async () => container.querySelector('li .edit-button').click());
    const form = container.querySelector('li form');
    const input = form.querySelector('[name="name"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Borrador');
      input.dispatchEvent(new Event('input', {
        bubbles: true
      }));
    });
    await act(async () => form.querySelector('button[type="button"]').click());
    await act(async () => buttons[2].click());
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    await remount();
    expect(container.querySelector('[role="group"] button').getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('li form')).toBeNull();
  });
  it('CP-18: guarda y recupera lista completamente vacía', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fixtures[0]]));
    server.seed([fixtures[0]]);
    const current = await renderHook();
    await act(async () => {
      await current().removeProduct('uno');
    });
    expect(server.items()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([fixtures[0]]));
    await remount();
    expect(container.querySelector('li')).toBeNull();
    expect(server.items()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([fixtures[0]]));
  });
  it('CP-19: StrictMode y remontes no sobrescriben datos ni causan bucles', async () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    server.seed(fixtures);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const strictApp = createElement(StrictMode, null, createElement(App));
    await render(strictApp);
    await remount(strictApp);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    await submit('Leche', '1');
    expect(write).not.toHaveBeenCalled();
    expect(server.fetch.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
    const saved = storedItems();
    await remount(strictApp);
    expect(storedItems()).toEqual(saved);
    expect(container.querySelectorAll('li')).toHaveLength(3);
  });
  it('el módulo serializa sin mutar y gestiona fallos de serialización', () => {
    const items = fixtures.map(item => Object.freeze({
      ...item
    }));
    Object.freeze(items);
    expect(writeShoppingList(items)).toBe(true);
    expect(readShoppingList().items).toEqual(fixtures);
    const cyclic = [];
    cyclic.push(cyclic);
    expect(writeShoppingList(cyclic)).toBe(false);
    expect(readShoppingList().items).toEqual(fixtures);
  });
});
describe('HU-08: resumen global de compras', () => {
  function expectCounts(total, pending, purchased) {
    const summary = container.querySelector('section[aria-labelledby]');
    expect(summary.querySelector('h2').textContent).toBe('Resumen de compras');
    expect([...summary.querySelectorAll('dt')].map(node => node.textContent)).toEqual(['Total de productos', 'Pendientes', 'Comprados']);
    const values = [...summary.querySelectorAll('dd')].map(node => Number(node.textContent));
    expect(values).toEqual([total, pending, purchased]);
    expect(values[0]).toBe(values[1] + values[2]);
  }
  it('CP-01, CP-02, CP-05 y CP-15: cero inicial y conteos de registros al agregar', async () => {
    await render();
    expectCounts(0, 0, 0);
    await submit('Arroz', '8');
    expectCounts(1, 1, 0);
    await submit('Pan', '3');
    expectCounts(2, 2, 0);
  });
  it('CP-03, CP-06 y CP-07: marcar y desmarcar actualizan indicadores', async () => {
    await render();
    await submit('Arroz', '2');
    const checkbox = container.querySelector('li input');
    await act(async () => checkbox.click());
    expectCounts(1, 0, 1);
    await act(async () => checkbox.click());
    expectCounts(1, 1, 0);
  });
  it('CP-04, CP-08, CP-09 y CP-14: elimina pendientes, comprados y el último registro', async () => {
    await render();
    await submit('Arroz', '2');
    await submit('Pan', '3');
    await submit('Leche', '1');
    await act(async () => container.querySelectorAll('li input')[1].click());
    expectCounts(3, 2, 1);
    await act(async () => container.querySelector('button[aria-label="Eliminar Arroz"]').click());
    expectCounts(2, 1, 1);
    await act(async () => container.querySelector('button[aria-label="Eliminar Pan"]').click());
    expectCounts(1, 1, 0);
    await act(async () => container.querySelector('button[aria-label="Eliminar Leche"]').click());
    expectCounts(0, 0, 0);
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
  });
  it('CP-10: editar nombre y cantidad no altera indicadores ni almacena contadores', async () => {
    await render();
    await submit('Arroz', '2');
    await act(async () => container.querySelector('li input').click());
    expectCounts(1, 0, 1);
    await act(async () => container.querySelector('button[aria-label="Editar Arroz"]').click());
    const form = container.querySelector('li form');
    for (const [field, value] of [['name', 'Pan'], ['quantity', '20']]) {
      const input = form.querySelector(`[name="${field}"]`);
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
        input.dispatchEvent(new Event('input', {
          bubbles: true
        }));
      });
    }
    expectCounts(1, 0, 1);
    await act(async () => form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    })));
    expectCounts(1, 0, 1);
    const saved = server.items();
    expect(saved).toEqual([{
      id: expect.any(String),
      name: 'Pan',
      quantity: 20,
      purchased: true
    }]);
  });
  it('CP-11 a CP-13: recuperación y filtros conservan resumen global sin escrituras extra', async () => {
    const fixtures = [{
      id: 'uno',
      name: 'Arroz',
      quantity: 8,
      purchased: false
    }, {
      id: 'dos',
      name: 'Pan',
      quantity: 5,
      purchased: true
    }, {
      id: 'tres',
      name: 'Leche',
      quantity: 2,
      purchased: false
    }];
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    server.seed(fixtures);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    await render();
    expectCounts(3, 2, 1);
    const filters = container.querySelectorAll('[role="group"] button');
    await act(async () => filters[1].click());
    expectCounts(3, 2, 1);
    expect(container.querySelectorAll('li')).toHaveLength(2);
    await act(async () => filters[2].click());
    expectCounts(3, 2, 1);
    expect(container.querySelectorAll('li')).toHaveLength(1);
    await render();
    expectCounts(3, 2, 1);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    expect(localStorage.length).toBe(1);
  });
});
describe('useShoppingList: validación independiente y estado', () => {
  it('CP-08: crea el modelo exacto con estado pendiente', async () => {
    const current = await renderHook();
    let result;
    await act(async () => {
      result = await current().addProduct('  Arroz  ', 2);
    });
    expect(result.success).toBe(true);
    expect(current().items).toEqual([{
      id: expect.any(String),
      name: 'Arroz',
      quantity: 2,
      purchased: false
    }]);
    expect(current().items[0].id).not.toBe('');
  });
  it('CP-10: permite duplicados con IDs diferentes y estado inmutable', async () => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Arroz', 2);
    });
    const previousItems = current().items;
    const previousProduct = previousItems[0];
    await act(async () => {
      await current().addProduct('Arroz', 3);
    });
    expect(current().items).toHaveLength(2);
    expect(current().items[0].id).not.toBe(current().items[1].id);
    expect(previousItems).toHaveLength(1);
    expect(current().items).not.toBe(previousItems);
    expect(current().items[0]).toBe(previousProduct);
    expect(current().items.map(item => item.quantity)).toEqual([2, 3]);
  });
  it.each([['', 2], ['   ', 2], [null, 2], [123, 2], ['Arroz', 0], ['Arroz', -1], ['Arroz', 1.5], ['Arroz', 'abc'], ['Arroz', ''], ['Arroz', '   '], ['Arroz', null], ['Arroz', undefined], ['Arroz', true], ['Arroz', Infinity], ['Arroz', NaN]])('rechaza (%s, %s) sin modificar la lista existente', async (name, quantity) => {
    const current = await renderHook();
    await act(async () => {
      await current().addProduct('Pan', 1);
    });
    const previousItems = current().items;
    let result;
    await act(async () => {
      result = await current().addProduct(name, quantity);
    });
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    expect(current().items).toBe(previousItems);
  });
});
