import { useRef, useState } from 'react';
import { validateProduct } from '../hooks/useShoppingList.js';
import CategorySelect from './CategorySelect.jsx';
import { DEFAULT_PRODUCT_CATEGORY } from '../utils/productCategories.js';

export default function ShoppingForm({ onAddProduct, disabled = false }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState(DEFAULT_PRODUCT_CATEGORY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current || disabled) return;
    const validated = validateProduct(name, quantity, category);
    if (Object.keys(validated.errors).length > 0) {
      setErrors(validated.errors);
      return;
    }
    submitting.current = true;
    setSaving(true);
    const result = await onAddProduct(validated.name, validated.quantity, validated.category);
    submitting.current = false;
    setSaving(false);
    setErrors(result.errors);
    if (result.success) {
      setName('');
      setQuantity('');
      setCategory(DEFAULT_PRODUCT_CATEGORY);
    }
  }

  return (
    <form className="shopping-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="product-name">Nombre del producto</label>
        <input
          id="product-name" name="product-name" type="text" required disabled={disabled || saving}
          value={name} onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && <p id="name-error" className="error" role="alert">{errors.name}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="product-quantity">Cantidad</label>
        <input
          id="product-quantity" name="product-quantity" type="text" inputMode="numeric" required disabled={disabled || saving}
          value={quantity} onChange={(event) => setQuantity(event.target.value)}
          aria-invalid={Boolean(errors.quantity)}
          aria-describedby={errors.quantity ? 'quantity-error' : undefined}
        />
        {errors.quantity && <p id="quantity-error" className="error" role="alert">{errors.quantity}</p>}
      </div>
      <CategorySelect
        id="product-category" value={category} onChange={setCategory}
        disabled={disabled || saving} error={errors.category}
      />
      {errors.product && <p className="error" role="alert">{errors.product}</p>}
      <button type="submit" disabled={disabled || saving}>Agregar producto</button>
    </form>
  );
}
