import ShoppingItem from './ShoppingItem.jsx';

export default function ShoppingList({
  items = [],
  emptyMessage = 'Tu lista de compras está vacía',
  onTogglePurchased,
  onRemoveProduct,
  onUpdateProduct,
  disabled = false,
}) {
  if (items.length === 0) {
    return <p role="status">{emptyMessage}</p>;
  }

  return (
    <ul className="shopping-list" aria-label="Lista de compras">
      {items.map((item) => (
        <ShoppingItem
          key={item.id}
          item={item}
          disabled={disabled}
          onTogglePurchased={onTogglePurchased}
          onRemoveProduct={onRemoveProduct}
          onUpdateProduct={onUpdateProduct}
        />
      ))}
    </ul>
  );
}
