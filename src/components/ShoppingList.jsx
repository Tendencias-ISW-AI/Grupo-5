import ShoppingItem from './ShoppingItem.jsx';

export default function ShoppingList({ items = [], onTogglePurchased, onRemoveProduct }) {
  if (items.length === 0) {
    return <p role="status">Tu lista de compras está vacía</p>;
  }

  return (
    <ul className="shopping-list" aria-label="Lista de compras">
      {items.map((item) => (
        <ShoppingItem
          key={item.id}
          item={item}
          onTogglePurchased={onTogglePurchased}
          onRemoveProduct={onRemoveProduct}
        />
      ))}
    </ul>
  );
}
