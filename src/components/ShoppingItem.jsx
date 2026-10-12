export default function ShoppingItem({ item, onTogglePurchased, onRemoveProduct }) {
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
