import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';
import ShoppingForm from '../src/components/ShoppingForm.jsx';
import ShoppingList from '../src/components/ShoppingList.jsx';
import useShoppingList from '../src/hooks/useShoppingList.js';
import { STORAGE_KEY, readShoppingList, writeShoppingList } from '../src/utils/shoppingListStorage.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container;
let root;

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  localStorage.clear();
});

function render(component = createElement(App)) {
  act(() => root.render(component));
}

function enterValue(id, value) {
  const input = container.querySelector(`#${id}`);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function submit(name, quantity) {
  enterValue('product-name', name);
  enterValue('product-quantity', quantity);
  act(() => container.querySelector('form').dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  ));
}

function renderHook() {
  let current;
  function Harness() {
    current = useShoppingList();
    return null;
  }
  render(createElement(Harness));
  return () => current;
}

describe('HU-01: registro desde la interfaz', () => {
  it('CP-01: agrega Arroz, 2 y actualiza la lista inmediatamente', () => {
    render();
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
    submit('Arroz', '2');
    const item = container.querySelector('li');
    expect(item.textContent).toContain('Arroz');
    expect(item.textContent).toContain('Cantidad: 2');
    expect(item.textContent).toContain('Pendiente');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it.each([
    ['CP-02', '', '2', 'name'],
    ['CP-03', '   ', '2', 'name'],
    ['CP-04', 'Arroz', '0', 'quantity'],
    ['CP-05', 'Arroz', '-1', 'quantity'],
    ['CP-06', 'Arroz', '1.5', 'quantity'],
    ['CP-07', 'Arroz', 'abc', 'quantity'],
    ['Cantidad obligatoria', 'Arroz', '', 'quantity'],
    ['Cantidad con espacios', 'Arroz', '   ', 'quantity'],
  ])('%s: rechaza datos inválidos y conserva los campos', (_id, name, quantity, field) => {
    render();
    submit(name, quantity);
    expect(container.querySelector('li')).toBeNull();
    expect(container.querySelector(`#${field}-error`).textContent).not.toBe('');
    expect(container.querySelector('#product-name').value).toBe(name);
    expect(container.querySelector('#product-quantity').value).toBe(quantity);
  });

  it('CP-09: limpia ambos campos tras un registro exitoso', () => {
    render();
    submit('Arroz', '2');
    expect(container.querySelector('#product-name').value).toBe('');
    expect(container.querySelector('#product-quantity').value).toBe('');
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('CP-11: muestra el nombre normalizado', () => {
    render();
    submit('  Arroz integral  ', '2');
    expect(container.querySelector('.product-name').textContent).toBe('Arroz integral');
  });

  it('permite corregir un error y registrar el producto', () => {
    render();
    submit('Arroz', '0');
    submit('Arroz', '2');
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('asocia etiquetas y errores con los campos accesibles', () => {
    render();
    expect(container.querySelector('label[for="product-name"]')).not.toBeNull();
    expect(container.querySelector('label[for="product-quantity"]')).not.toBeNull();
    expect(container.querySelector('button[type="submit"]')).not.toBeNull();
    submit('', '');
    for (const [id, errorId] of [['product-name', 'name-error'], ['product-quantity', 'quantity-error']]) {
      const input = container.querySelector(`#${id}`);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe(errorId);
    }
  });

  it('conserva los campos si la operación de registro rechaza la solicitud', () => {
    render(createElement(ShoppingForm, {
      onAddProduct: () => ({ success: false, errors: { quantity: 'Registro rechazado.' } }),
    }));
    submit('Arroz', '2');
    expect(container.querySelector('#product-name').value).toBe('Arroz');
    expect(container.querySelector('#product-quantity').value).toBe('2');
    expect(container.querySelector('#quantity-error').textContent).toBe('Registro rechazado.');
  });
});

describe('HU-02: visualización de productos', () => {
  it('CP-03 y CP-06: muestra todos los datos de una colección con estados mixtos', () => {
    const items = [
      { id: 'arroz', name: 'Arroz', quantity: 2, purchased: false },
      { id: 'pan', name: 'Pan', quantity: 3, purchased: true },
      { id: 'leche', name: 'Leche', quantity: 1, purchased: false },
    ];
    render(createElement(ShoppingList, { items }));
    const rows = container.querySelectorAll('li');
    expect(rows).toHaveLength(items.length);
    items.forEach((item, index) => {
      expect(rows[index].querySelector('.product-name').textContent).toBe(item.name);
      expect(rows[index].textContent).toContain(`Cantidad: ${item.quantity}`);
      expect(rows[index].querySelector('.product-status').textContent)
        .toBe(item.purchased ? 'Comprado' : 'Pendiente');
    });
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelectorAll('button:not(.remove-button):not(.edit-button), input:not([type="checkbox"])')).toHaveLength(0);
    expect(container.querySelectorAll('button.remove-button')).toHaveLength(items.length);
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(items.length);
  });

  it('CP-09: muestra registros con nombres repetidos por separado', () => {
    render();
    submit('Arroz', '2');
    submit('Arroz', '3');
    const rows = container.querySelectorAll('li');
    expect(rows).toHaveLength(2);
    expect([...rows].map((row) => row.querySelector('.product-name').textContent))
      .toEqual(['Arroz', 'Arroz']);
    expect(rows[0].textContent).toContain('Cantidad: 2');
    expect(rows[1].textContent).toContain('Cantidad: 3');
  });
});

describe('HU-03: marcar y desmarcar productos', () => {
  it('CP-01: cada producto nuevo tiene un checkbox accesible desmarcado', () => {
    render();
    submit('Arroz', '2');
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);
    expect(checkbox.getAttribute('aria-label')).toBe('Comprado: Arroz');
  });

  it('CP-02, CP-03 y CP-07: marcar actualiza checkbox, indicador y tachado inmediatamente', () => {
    render();
    submit('Arroz', '2');
    const checkbox = container.querySelector('input[type="checkbox"]');
    const name = container.querySelector('.product-name');
    act(() => checkbox.click());
    expect(checkbox.checked).toBe(true);
    expect(container.querySelector('.product-status').textContent).toBe('Comprado');
    expect(name.classList.contains('product-name-purchased')).toBe(true);
    expect(container.querySelector('.product-status').classList.contains('product-name-purchased')).toBe(false);
  });

  it('CP-04 y CP-05: desmarcar restaura estado y apariencia', () => {
    render();
    submit('Arroz', '2');
    const checkbox = container.querySelector('input[type="checkbox"]');
    act(() => checkbox.click());
    act(() => checkbox.click());
    expect(checkbox.checked).toBe(false);
    expect(container.querySelector('.product-status').textContent).toBe('Pendiente');
    expect(container.querySelector('.product-name').classList.contains('product-name-purchased')).toBe(false);
  });

  it('CP-06: cambia solo el registro seleccionado entre nombres repetidos', () => {
    render();
    submit('Arroz', '2');
    submit('Arroz', '3');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    act(() => checkboxes[1].click());
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
    expect([...container.querySelectorAll('.product-status')].map((node) => node.textContent))
      .toEqual(['Pendiente', 'Comprado']);
  });

  it('CP-08: procesa alternancias consecutivas incluso en una misma actualización', () => {
    const current = renderHook();
    act(() => { current().addProduct('Arroz', 2); });
    const id = current().items[0].id;
    act(() => {
      current().togglePurchased(id);
      current().togglePurchased(id);
      current().togglePurchased(id);
    });
    expect(current().items[0].purchased).toBe(true);
    act(() => { current().togglePurchased(id); });
    expect(current().items[0].purchased).toBe(false);
  });

  it('CP-09: un ID inexistente conserva la colección y sus registros', () => {
    const current = renderHook();
    act(() => { current().togglePurchased('inexistente'); });
    expect(current().items).toEqual([]);
    act(() => { current().addProduct('Arroz', 2); });
    const previousItems = current().items;
    act(() => { current().togglePurchased('inexistente'); });
    expect(current().items).toBe(previousItems);
  });

  it('CP-02, CP-06 y CP-10: invierte purchased sin mutar ni alterar otros atributos o productos', () => {
    const current = renderHook();
    act(() => {
      current().addProduct('Arroz', 2);
      current().addProduct('Pan', 1);
    });
    const previousItems = current().items;
    const original = previousItems[0];
    Object.freeze(original);
    Object.freeze(previousItems);
    act(() => { current().togglePurchased(original.id); });
    expect(current().items).not.toBe(previousItems);
    expect(current().items[0]).toEqual({ ...original, purchased: true });
    expect(original.purchased).toBe(false);
    expect(current().items[1]).toBe(previousItems[1]);
    act(() => { current().togglePurchased(original.id); });
    expect(current().items[0]).toEqual(original);
  });
});

describe('HU-04: eliminar productos', () => {
  it('CP-01: cada producto tiene un botón accesible de eliminación', () => {
    render();
    submit('Arroz', '2');
    submit('Pan', '1');
    const buttons = container.querySelectorAll('li button[aria-label^="Eliminar "]');
    expect(buttons).toHaveLength(2);
    expect([...buttons].map((button) => button.getAttribute('aria-label')))
      .toEqual(['Eliminar Arroz', 'Eliminar Pan']);
    for (const button of buttons) {
      expect(button.type).toBe('button');
      expect(button.textContent).toBe('Eliminar');
    }
  });

  it.each([false, true])('CP-02, CP-05, CP-06, CP-08 y CP-09: elimina el último producto (comprado=%s)', (purchased) => {
    render();
    submit('Arroz', '2');
    if (purchased) act(() => container.querySelector('li input').click());
    act(() => container.querySelector('li button[aria-label^="Eliminar "]').click());
    expect(container.querySelector('li')).toBeNull();
    expect(container.querySelector('[role="status"]').textContent)
      .toBe('Tu lista de compras está vacía');
    expect(container.querySelector('h1').textContent).toBe('SmartList');
    submit('Pan', '1');
    expect(container.querySelector('li').textContent).toContain('Pan');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('CP-03 y CP-04: elimina solo el registro seleccionado entre nombres repetidos', () => {
    render();
    submit('Arroz', '2');
    submit('Arroz', '3');
    submit('Pan', '1');
    const rows = container.querySelectorAll('li');
    act(() => rows[1].querySelector('input').click());
    act(() => rows[0].querySelector('button[aria-label^="Eliminar "]').click());
    const remaining = container.querySelectorAll('li');
    expect(remaining).toHaveLength(2);
    expect(remaining[0]).toBe(rows[1]);
    expect(remaining[1]).toBe(rows[2]);
    expect(remaining[0].querySelector('.product-name').textContent).toBe('Arroz');
    expect(remaining[0].textContent).toContain('Cantidad: 3');
    expect(remaining[0].querySelector('input').checked).toBe(true);
    expect(remaining[0].querySelector('.product-status').textContent).toBe('Comprado');
    act(() => remaining[0].querySelector('input').click());
    expect(remaining[0].querySelector('.product-status').textContent).toBe('Pendiente');
  });

  it('CP-07: un ID inexistente conserva la misma colección', () => {
    const current = renderHook();
    const emptyItems = current().items;
    act(() => { current().removeProduct('inexistente'); });
    expect(current().items).toBe(emptyItems);
    act(() => { current().addProduct('Arroz', 2); });
    const previousItems = current().items;
    act(() => { current().removeProduct('inexistente'); });
    expect(current().items).toBe(previousItems);
  });

  it('CP-10: conserva orden, objetos y atributos sin mutar el estado anterior', () => {
    const current = renderHook();
    act(() => {
      current().addProduct('Arroz', 2);
      current().addProduct('Pan', 1);
      current().addProduct('Leche', 3);
    });
    act(() => { current().togglePurchased(current().items[2].id); });
    const previousItems = current().items;
    const snapshot = previousItems.map((item) => ({ ...item }));
    previousItems.forEach(Object.freeze);
    Object.freeze(previousItems);
    act(() => { current().removeProduct(previousItems[1].id); });
    expect(previousItems).toEqual(snapshot);
    expect(current().items).not.toBe(previousItems);
    expect(current().items).toEqual([snapshot[0], snapshot[2]]);
    expect(current().items[0]).toBe(previousItems[0]);
    expect(current().items[1]).toBe(previousItems[2]);
  });

  it('CP-11: procesa eliminaciones consecutivas en una misma actualización', () => {
    const current = renderHook();
    act(() => {
      current().addProduct('Arroz', 2);
      current().addProduct('Pan', 1);
      current().addProduct('Leche', 3);
    });
    const [first, second, third] = current().items;
    act(() => {
      current().removeProduct(first.id);
      current().removeProduct(first.id);
      current().removeProduct(second.id);
    });
    expect(current().items).toEqual([third]);
    act(() => { current().removeProduct(third.id); });
    expect(current().items).toEqual([]);
  });
});

describe('HU-05: edición local', () => {
  function beginEdit(index = 0) {
    const row = container.querySelectorAll('li')[index];
    act(() => row.querySelector('button[aria-label^="Editar "]').click());
    return container.querySelectorAll('li')[index].querySelector('form');
  }
  function change(form, field, value) {
    const input = form.querySelector(`input[name="${field}"]`);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    act(() => {
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  function save(form) {
    act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  }

  it('CP-01 y CP-02: opción accesible y precarga de valores con IDs únicos', () => {
    render(); submit('Arroz', '2'); submit('Pan', '1');
    expect(container.querySelectorAll('button[aria-label^="Editar "]')).toHaveLength(2);
    const first = beginEdit();
    const second = beginEdit(1);
    expect(first.querySelector('[name="name"]').value).toBe('Arroz');
    expect(first.querySelector('[name="quantity"]').value).toBe('2');
    expect(first.querySelector('[name="name"]').id).not.toBe(second.querySelector('[name="name"]').id);
    for (const input of first.querySelectorAll('input')) {
      expect([...first.querySelectorAll('label')].some((label) => label.htmlFor === input.id)).toBe(true);
    }
    expect(first.querySelector('input[type="checkbox"]')).toBeNull();
    expect(first.querySelector('.remove-button')).toBeNull();
  });

  it.each([['name', '  Arroz integral  ', 'Arroz integral'], ['quantity', '5', 'Cantidad: 5']])(
    'CP-03, CP-04, CP-10, CP-18 y CP-19: guarda %s y termina edición', (field, value, visible) => {
      render(); submit('Arroz', '2');
      const form = beginEdit(); change(form, field, value); save(form);
      expect(container.querySelector('li form')).toBeNull();
      expect(container.querySelector('li').textContent).toContain(visible);
    },
  );

  it.each([
    ['CP-05', 'name', ''], ['CP-06', 'name', '   '],
    ['CP-07', 'quantity', '0'], ['CP-08', 'quantity', '-1'],
    ['CP-09 decimal', 'quantity', '1.5'], ['CP-09 texto', 'quantity', 'abc'],
    ['Cantidad obligatoria', 'quantity', ''],
  ])('%s: conserva borrador inválido y no guarda', (_case, field, value) => {
    render(); submit('Arroz', '2');
    const form = beginEdit(); change(form, field, value); save(form);
    expect(container.querySelector('li form')).toBe(form);
    expect(form.querySelector('[role="alert"]')).not.toBeNull();
    expect(form.querySelector(`[name="${field}"]`).value).toBe(value);
    act(() => form.querySelector('button[type="button"]').click());
    const reopened = beginEdit();
    expect(reopened.querySelector('[name="name"]').value).toBe('Arroz');
    expect(reopened.querySelector('[name="quantity"]').value).toBe('2');
    expect(reopened.querySelector('[role="alert"]')).toBeNull();
  });

  it('CP-11: cancela ambos cambios y reabre los datos vigentes después de guardar', () => {
    render(); submit('Arroz', '2');
    let form = beginEdit(); change(form, 'name', 'Pan'); change(form, 'quantity', '5');
    act(() => form.querySelector('button[type="button"]').click());
    expect(container.querySelector('li').textContent).toContain('Arroz');
    expect(container.querySelector('li').textContent).toContain('Cantidad: 2');
    form = beginEdit(); change(form, 'name', 'Leche'); save(form);
    expect(beginEdit().querySelector('[name="name"]').value).toBe('Leche');
  });

  it.each([false, true])('CP-12 a CP-15: conserva estado %s e independencia entre duplicados', (purchased) => {
    render(); submit('Arroz', '2'); submit('Arroz', '3');
    if (purchased) act(() => container.querySelector('li input').click());
    const form = beginEdit(); change(form, 'name', 'Pan'); save(form);
    const rows = container.querySelectorAll('li');
    expect(rows[0].querySelector('input').checked).toBe(purchased);
    expect(rows[0].querySelector('.product-name').classList.contains('product-name-purchased')).toBe(purchased);
    expect(rows[1].querySelector('.product-name').textContent).toBe('Arroz');
    expect(rows[1].textContent).toContain('Cantidad: 3');
  });

  it('CP-14 y CP-17: protege ID, estado, orden e inmutabilidad en el hook', () => {
    const current = renderHook();
    act(() => { current().addProduct('Arroz', 2); current().addProduct('Pan', 1); });
    const [original, other] = current().items;
    const oldItems = current().items;
    Object.freeze(original); Object.freeze(oldItems);
    let result;
    act(() => { result = current().updateProduct(original.id, {
      name: '  Leche  ', quantity: '3', id: 'otro', purchased: true,
    }); });
    expect(result.success).toBe(true);
    expect(current().items[0]).toEqual({ ...original, name: 'Leche', quantity: 3 });
    expect(current().items[1]).toBe(other);
    expect(original.name).toBe('Arroz');
    expect(current().items).not.toBe(oldItems);
  });

  it('conserva purchased vigente ante cambios agrupados', () => {
    const current = renderHook();
    act(() => { current().addProduct('Arroz', 2); });
    const id = current().items[0].id;
    act(() => { current().togglePurchased(id); current().updateProduct(id, { name: 'Pan', quantity: 3 }); });
    expect(current().items[0]).toEqual({ id, name: 'Pan', quantity: 3, purchased: true });
  });

  it('CP-16: ID inexistente no modifica la colección', () => {
    const current = renderHook();
    act(() => { current().addProduct('Arroz', 2); });
    const oldItems = current().items;
    let result;
    act(() => { result = current().updateProduct('inexistente', { name: 'Pan', quantity: 1 }); });
    expect(result.success).toBe(false);
    expect(current().items).toBe(oldItems);
  });

  it.each([['', 1], ['  ', 1], ['Pan', 0], ['Pan', -1], ['Pan', 1.5], ['Pan', 'abc'], ['Pan', '']])(
    'valida (%s, %s) independientemente en el hook', (name, quantity) => {
      const current = renderHook(); act(() => { current().addProduct('Arroz', 2); });
      const oldItems = current().items;
      let result;
      act(() => { result = current().updateProduct(oldItems[0].id, { name, quantity }); });
      expect(result.success).toBe(false);
      expect(current().items).toBe(oldItems);
    },
  );
});

describe('HU-06: filtros por estado', () => {
  function selectFilter(label) {
    const group = container.querySelector('[role="group"]');
    const button = [...group.querySelectorAll('button')].find((node) => node.textContent === label);
    act(() => button.click());
    return button;
  }
  function names() {
    return [...container.querySelectorAll('li .product-name')].map((node) => node.textContent.trim());
  }
  function mixedProducts() {
    render(); submit('Arroz', '2'); submit('Pan', '1'); submit('Leche', '3');
    act(() => container.querySelectorAll('li input[type="checkbox"]')[1].click());
  }

  it('CP-01 y CP-02: tres botones accesibles con Todos inicialmente activo', () => {
    render();
    const group = container.querySelector('[role="group"]');
    expect(group.getAttribute('aria-label')).toBe('Filtrar productos por estado');
    const buttons = [...group.querySelectorAll('button')];
    expect(buttons.map((button) => button.textContent)).toEqual(['Todos', 'Pendientes', 'Comprados']);
    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    buttons.forEach((button) => expect(button.type).toBe('button'));
  });

  it('CP-03 a CP-06 y CP-10: filtra inmediatamente y conserva datos y orden al alternar', () => {
    mixedProducts();
    const originalRows = [...container.querySelectorAll('li')].map((row) => ({
      name: row.querySelector('.product-name').textContent,
      quantity: row.textContent.match(/Cantidad: \d+/)[0],
      state: row.querySelector('.product-status').textContent,
    }));
    for (let index = 0; index < 3; index += 1) {
      expect(selectFilter('Pendientes').getAttribute('aria-pressed')).toBe('true');
      expect(names()).toEqual(['Arroz', 'Leche']);
      selectFilter('Comprados'); expect(names()).toEqual(['Pan']);
      selectFilter('Todos'); expect(names()).toEqual(['Arroz', 'Pan', 'Leche']);
    }
    expect([...container.querySelectorAll('li')].map((row) => ({
      name: row.querySelector('.product-name').textContent,
      quantity: row.textContent.match(/Cantidad: \d+/)[0],
      state: row.querySelector('.product-status').textContent,
    }))).toEqual(originalRows);
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
  });

  it('CP-07 y CP-08: mensajes específicos cuando hay productos sin coincidencias', () => {
    render(); submit('Arroz', '2');
    selectFilter('Comprados');
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos comprados');
    selectFilter('Todos'); act(() => container.querySelector('li input').click());
    selectFilter('Pendientes');
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos pendientes');
  });

  it('CP-09: colección original vacía conserva el mensaje en cualquier filtro', () => {
    render();
    for (const label of ['Todos', 'Pendientes', 'Comprados']) {
      selectFilter(label);
      expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
    }
  });

  it('CP-11 y CP-12: marcar y desmarcar retira el registro de la vista correspondiente', () => {
    render(); submit('Arroz', '2');
    selectFilter('Pendientes'); act(() => container.querySelector('li input').click());
    expect(names()).toEqual([]);
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos pendientes');
    selectFilter('Comprados'); expect(names()).toEqual(['Arroz']);
    act(() => container.querySelector('li input').click());
    expect(names()).toEqual([]);
    selectFilter('Pendientes'); expect(names()).toEqual(['Arroz']);
  });

  it('CP-13 y CP-14: registro visible en Pendientes y oculto en Comprados', () => {
    render(); selectFilter('Pendientes'); submit('Arroz', '2');
    expect(names()).toEqual(['Arroz']);
    selectFilter('Comprados'); submit('Pan', '1'); expect(names()).toEqual([]);
    expect(container.querySelector('#product-name').value).toBe('');
    selectFilter('Todos'); expect(names()).toEqual(['Arroz', 'Pan']);
  });

  it('CP-15: elimina el producto visible y conserva registros ocultos', () => {
    mixedProducts(); selectFilter('Comprados');
    act(() => container.querySelector('li button[aria-label^="Eliminar "]').click());
    expect(names()).toEqual([]);
    expect(container.querySelector('[role="status"]').textContent).toBe('No tienes productos comprados');
    selectFilter('Todos'); expect(names()).toEqual(['Arroz', 'Leche']);
    selectFilter('Pendientes');
    while (container.querySelector('li')) {
      act(() => container.querySelector('li button[aria-label^="Eliminar "]').click());
    }
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
  });

  it('CP-16: edita producto comprado filtrado conservando estado y datos ocultos', () => {
    mixedProducts(); selectFilter('Comprados');
    act(() => container.querySelector('li button[aria-label^="Editar "]').click());
    const form = container.querySelector('li form');
    const input = form.querySelector('[name="name"]');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Pan integral');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(names()).toEqual(['Pan integral']);
    expect(container.querySelector('li input').checked).toBe(true);
    selectFilter('Todos'); expect(names()).toEqual(['Arroz', 'Pan integral', 'Leche']);
  });

  it('CP-17: nombres repetidos se filtran por el estado de cada registro', () => {
    render(); submit('Arroz', '2'); submit('Arroz', '3');
    act(() => container.querySelectorAll('li input')[1].click());
    selectFilter('Pendientes'); expect(names()).toEqual(['Arroz']);
    expect(container.querySelector('li').textContent).toContain('Cantidad: 2');
    selectFilter('Comprados'); expect(names()).toEqual(['Arroz']);
    expect(container.querySelector('li').textContent).toContain('Cantidad: 3');
    selectFilter('Todos'); expect(names()).toEqual(['Arroz', 'Arroz']);
  });

  it('descarta borrador al ocultar un producto sin cambiar los datos guardados', () => {
    render(); submit('Arroz', '2');
    act(() => container.querySelector('li button[aria-label^="Editar "]').click());
    const input = container.querySelector('li [name="name"]');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Borrador');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    selectFilter('Comprados'); selectFilter('Todos');
    expect(names()).toEqual(['Arroz']);
    expect(container.querySelector('li form')).toBeNull();
  });
});

describe('HU-07: persistencia local', () => {
  const fixtures = [
    { id: 'uno', name: 'Arroz', quantity: 2, purchased: false },
    { id: 'dos', name: 'Pan', quantity: 3, purchased: true },
  ];
  function storedItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }
  function remount(component = createElement(App)) {
    act(() => root.unmount());
    root = createRoot(container);
    render(component);
  }

  it('CP-01 y CP-02: guarda automáticamente y recupera tras remontar', () => {
    render(); submit('Arroz', '2');
    const saved = storedItems();
    expect(saved).toEqual([{ id: expect.any(String), name: 'Arroz', quantity: 2, purchased: false }]);
    remount();
    expect(container.querySelector('.product-name').textContent.trim()).toBe('Arroz');
    expect(storedItems()).toEqual(saved);
  });

  it('CP-03, CP-04 y CP-15: recupera atributos, estados y orden sin escrituras al montar', () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const current = renderHook();
    expect(current().items).toEqual(fixtures);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
  });

  it('CP-05: guarda edición y recupera nombre, cantidad, ID y estado', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtures));
    const current = renderHook();
    act(() => { current().updateProduct('dos', { name: 'Pan integral', quantity: 5 }); });
    expect(storedItems()).toEqual([fixtures[0], { ...fixtures[1], name: 'Pan integral', quantity: 5 }]);
    remount();
    const rows = container.querySelectorAll('li');
    expect(rows[1].textContent).toContain('Pan integral');
    expect(rows[1].textContent).toContain('Cantidad: 5');
    expect(rows[1].querySelector('input').checked).toBe(true);
  });

  it('CP-06: producto eliminado no reaparece tras remontar', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixtures));
    const current = renderHook();
    act(() => { current().removeProduct('uno'); });
    remount();
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.querySelector('.product-name').textContent.trim()).toBe('Pan');
    expect(storedItems()).toEqual([fixtures[1]]);
  });

  it('CP-07: persiste marcación y desmarcación con su último estado', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fixtures[0]]));
    const current = renderHook();
    act(() => { current().togglePurchased('uno'); });
    expect(storedItems()[0].purchased).toBe(true);
    act(() => { current().togglePurchased('uno'); });
    remount();
    expect(container.querySelector('li input').checked).toBe(false);
    expect(storedItems()[0].purchased).toBe(false);
  });

  it('CP-08: sin datos inicia vacío sin crear escrituras', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    render();
    expect(container.querySelector('[role="status"]').textContent).toBe('Tu lista de compras está vacía');
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it.each([
    ['CP-09 JSON corrupto', '{'],
    ['CP-10 objeto', '{}'],
    ['CP-10 null', 'null'],
    ['CP-11 IDs duplicados', JSON.stringify([fixtures[0], fixtures[0]])],
    ['CP-12 incompleto', JSON.stringify([{ id: 'uno', name: 'Pan' }])],
    ['ID vacío', JSON.stringify([{ ...fixtures[0], id: ' ' }])],
    ['Nombre inválido', JSON.stringify([{ ...fixtures[0], name: '  ' }])],
    ['Cantidad texto', JSON.stringify([{ ...fixtures[0], quantity: '2' }])],
    ['Cantidad decimal', JSON.stringify([{ ...fixtures[0], quantity: 1.5 }])],
    ['Cantidad cero', JSON.stringify([{ ...fixtures[0], quantity: 0 }])],
    ['Estado inválido', JSON.stringify([{ ...fixtures[0], purchased: 'false' }])],
    ['Colección parcialmente inválida', JSON.stringify([fixtures[0], { id: 'mal' }])],
    ['Propiedad adicional', JSON.stringify([{ ...fixtures[0], extra: true }])],
  ])('%s: rechaza toda la colección y conserva contenido hasta una modificación confirmada', (_case, serialized) => {
    localStorage.setItem(STORAGE_KEY, serialized);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const current = renderHook();
    expect(current().items).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    expect(write).not.toHaveBeenCalled();
    act(() => { current().addProduct('', 2); current().removeProduct('inexistente'); });
    expect(write).not.toHaveBeenCalled();
    act(() => { current().addProduct('Leche', 1); });
    expect(storedItems()).toEqual(current().items);
    expect(storedItems()).toHaveLength(1);
  });

  it('CP-13: fallo de lectura impide escrituras durante toda la sesión', () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Lectura'); });
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const current = renderHook();
    expect(current().items).toEqual([]);
    read.mockRestore();
    act(() => { current().addProduct('Leche', 1); });
    const id = current().items[0].id;
    act(() => { current().togglePurchased(id); current().updateProduct(id, { name: 'Leche entera', quantity: 2 }); });
    act(() => { current().removeProduct(id); });
    expect(current().items).toEqual([]);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
  });

  it('CP-13: acceso restringido permite seguir trabajando en memoria', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('Acceso'); });
    const current = renderHook();
    act(() => { current().addProduct('Arroz', 2); });
    expect(current().items[0].name).toBe('Arroz');
    vi.restoreAllMocks();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('CP-14: fallo de escritura conserva estado React y almacenamiento anterior', () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Cuota'); });
    const current = renderHook();
    act(() => { current().addProduct('Leche', 1); });
    expect(current().items).toHaveLength(3);
    act(() => { current().updateProduct('uno', { name: 'Arroz integral', quantity: 5 }); });
    expect(current().items[0].name).toBe('Arroz integral');
    act(() => { current().togglePurchased('uno'); current().removeProduct('dos'); });
    expect(current().items).toHaveLength(2);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
  });

  it('CP-16 y CP-17: filtros y borradores cancelados no causan escrituras', () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    render();
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const buttons = container.querySelectorAll('[role="group"] button');
    act(() => buttons[1].click());
    act(() => container.querySelector('li .edit-button').click());
    const form = container.querySelector('li form');
    const input = form.querySelector('[name="name"]');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Borrador');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => form.querySelector('button[type="button"]').click());
    act(() => buttons[2].click());
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    remount();
    expect(container.querySelector('[role="group"] button').getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('li form')).toBeNull();
  });

  it('CP-18: guarda y recupera lista completamente vacía', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([fixtures[0]]));
    const current = renderHook();
    act(() => { current().removeProduct('uno'); });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
    remount();
    expect(container.querySelector('li')).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });

  it('CP-19: StrictMode y remontes no sobrescriben datos ni causan bucles', () => {
    const serialized = JSON.stringify(fixtures);
    localStorage.setItem(STORAGE_KEY, serialized);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const strictApp = createElement(StrictMode, null, createElement(App));
    render(strictApp);
    remount(strictApp);
    expect(write).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(serialized);
    submit('Leche', '1');
    expect(write).toHaveBeenCalledTimes(1);
    const saved = storedItems();
    remount(strictApp);
    expect(storedItems()).toEqual(saved);
    expect(container.querySelectorAll('li')).toHaveLength(3);
  });

  it('el módulo serializa sin mutar y gestiona fallos de serialización', () => {
    const items = fixtures.map((item) => Object.freeze({ ...item }));
    Object.freeze(items);
    expect(writeShoppingList(items)).toBe(true);
    expect(readShoppingList().items).toEqual(fixtures);
    const cyclic = []; cyclic.push(cyclic);
    expect(writeShoppingList(cyclic)).toBe(false);
    expect(storedItems()).toEqual(fixtures);
  });
});

describe('useShoppingList: validación independiente y estado', () => {
  it('CP-08: crea el modelo exacto con estado pendiente', () => {
    const current = renderHook();
    let result;
    act(() => { result = current().addProduct('  Arroz  ', 2); });
    expect(result.success).toBe(true);
    expect(current().items).toEqual([{
      id: expect.any(String), name: 'Arroz', quantity: 2, purchased: false,
    }]);
    expect(current().items[0].id).not.toBe('');
  });

  it('CP-10: permite duplicados con IDs diferentes y estado inmutable', () => {
    const current = renderHook();
    act(() => { current().addProduct('Arroz', 2); });
    const previousItems = current().items;
    const previousProduct = previousItems[0];
    act(() => { current().addProduct('Arroz', 3); });
    expect(current().items).toHaveLength(2);
    expect(current().items[0].id).not.toBe(current().items[1].id);
    expect(previousItems).toHaveLength(1);
    expect(current().items).not.toBe(previousItems);
    expect(current().items[0]).toBe(previousProduct);
    expect(current().items.map((item) => item.quantity)).toEqual([2, 3]);
  });

  it.each([
    ['', 2], ['   ', 2], [null, 2], [123, 2],
    ['Arroz', 0], ['Arroz', -1], ['Arroz', 1.5], ['Arroz', 'abc'],
    ['Arroz', ''], ['Arroz', '   '], ['Arroz', null], ['Arroz', undefined],
    ['Arroz', true], ['Arroz', Infinity], ['Arroz', NaN],
  ])('rechaza (%s, %s) sin modificar la lista existente', (name, quantity) => {
    const current = renderHook();
    act(() => { current().addProduct('Pan', 1); });
    const previousItems = current().items;
    let result;
    act(() => { result = current().addProduct(name, quantity); });
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    expect(current().items).toBe(previousItems);
  });
});
