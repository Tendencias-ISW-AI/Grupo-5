import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../src/App.jsx';

describe('Configuración inicial de SmartList', () => {
  it('renderiza la aplicación con una lista vacía', () => {
    const markup = renderToStaticMarkup(createElement(App));

    expect(markup).toContain('<h1>SmartList</h1>');
    expect(markup).toContain('<ul aria-label="Lista de compras"></ul>');
  });
});
