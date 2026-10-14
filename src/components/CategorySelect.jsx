import { PRODUCT_CATEGORIES } from '../utils/productCategories.js';

export default function CategorySelect({ id, name = id, value, onChange, disabled = false, error }) {
  const errorId = `${id}-error`;
  return (
    <div className="form-field">
      <label htmlFor={id}>Categoría</label>
      <select
        id={id} name={name} value={value} disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      >
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      {error && <p id={errorId} className="error" role="alert">{error}</p>}
    </div>
  );
}
