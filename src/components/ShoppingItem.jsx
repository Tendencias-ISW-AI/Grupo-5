import { useId, useState } from 'react';
import { validateProduct } from '../hooks/useShoppingList.js';

export default function ShoppingItem({ item, onTogglePurchased, onRemoveProduct, onUpdateProduct }) {
  const fieldId = useId();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState({});

  function startEditing() {
    setName(item.name);
    setQuantity(String(item.quantity));
    setErrors({});
    setEditing(true);
  }

  function finishEditing() {
    setEditing(false);
    setName('');
    setQuantity('');
    setErrors({});
  }

  function saveChanges(event) {
    event.preventDefault();
    const validated = validateProduct(name, quantity);
    if (Object.keys(validated.errors).length > 0) {
      setErrors(validated.errors);
      return;
    }
    const result = onUpdateProduct(item.id, { name: validated.name, quantity: validated.quantity });
    setErrors(result.errors);
    if (result.success) finishEditing();
  }

  if (editing) {
    return (
      <li className="shopping-item">
        <form className="edit-form" aria-label={`Editar ${item.name}`} onSubmit={saveChanges} noValidate>
          <div className="form-field">
            <label htmlFor={`${fieldId}-name`}>Nombre del producto</label>
            <input
              id={`${fieldId}-name`} name="name" type="text" required autoFocus
              value={name} onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
            />
            {errors.name && <p className="error" id={`${fieldId}-name-error`} role="alert">{errors.name}</p>}
          </div>
          <div className="form-field">
            <label htmlFor={`${fieldId}-quantity`}>Cantidad</label>
            <input
              id={`${fieldId}-quantity`} name="quantity" type="text" inputMode="numeric" required
              value={quantity} onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={errors.quantity ? `${fieldId}-quantity-error` : undefined}
            />
            {errors.quantity && <p className="error" id={`${fieldId}-quantity-error`} role="alert">{errors.quantity}</p>}
          </div>
          {errors.product && <p className="error" role="alert">{errors.product}</p>}
          <div className="edit-actions">
            <button type="submit">Guardar</button>
            <button type="button" onClick={finishEditing}>Cancelar</button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="shopping-item">
      <input
        className="purchase-checkbox"
        type="checkbox"
        checked={item.purchased}
        aria-label={`Comprado: ${item.name}`}
        onChange={() => onTogglePurchased(item.id)}
      />
      <span className={`product-name${item.purchased ? ' product-name-purchased' : ''}`}>
        {item.name}
      </span>
      <span>Cantidad: {item.quantity}</span>
      <span className="product-status">{item.purchased ? 'Comprado' : 'Pendiente'}</span>
      <button type="button" className="edit-button" aria-label={`Editar ${item.name}`} onClick={startEditing}>
        Editar
      </button>
      <button
        type="button"
        className="remove-button"
        aria-label={`Eliminar ${item.name}`}
        onClick={() => onRemoveProduct(item.id)}
      >
        Eliminar
      </button>
    </li>
  );
}
