export default function ShoppingItem({ item, onTogglePurchased }) {
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
    </li>
  );
}
