export default function ShoppingItem({ item }) {
  return (
    <li className="shopping-item">
      <span className="product-name">{item.name}</span>
      <span>Cantidad: {item.quantity}</span>
      <span className="product-status">Pendiente</span>
    </li>
  );
}
