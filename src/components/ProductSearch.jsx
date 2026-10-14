import { useRef } from 'react';

export default function ProductSearch({ query, onQueryChange }) {
  const inputRef = useRef(null);

  function clearSearch() {
    onQueryChange('');
    inputRef.current?.focus();
  }

  return (
    <div className="product-search" role="search">
      <label htmlFor="product-search">Buscar producto</label>
      <div className="product-search-controls">
        <input
          ref={inputRef}
          id="product-search" name="product-search" type="search" autoComplete="off"
          placeholder="Escribe el nombre de un producto"
          value={query} onChange={(event) => onQueryChange(event.target.value)}
        />
        <button type="button" onClick={clearSearch} disabled={query === ''}>
          Limpiar búsqueda
        </button>
      </div>
    </div>
  );
}
