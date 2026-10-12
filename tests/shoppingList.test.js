import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App.jsx';
import ShoppingForm from '../src/components/ShoppingForm.jsx';
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
    expect(container.querySelector('[role="status"]').textContent).toContain('vacía');
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
