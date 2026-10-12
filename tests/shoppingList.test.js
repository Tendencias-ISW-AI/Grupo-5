import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App.jsx';
import ShoppingForm from '../src/components/ShoppingForm.jsx';
import ShoppingList from '../src/components/ShoppingList.jsx';
import useShoppingList from '../src/hooks/useShoppingList.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
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
    expect(container.querySelectorAll('button:not(.remove-button), input:not([type="checkbox"])')).toHaveLength(0);
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
    const buttons = container.querySelectorAll('li button');
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
    act(() => container.querySelector('li button').click());
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
    act(() => rows[0].querySelector('button').click());
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
