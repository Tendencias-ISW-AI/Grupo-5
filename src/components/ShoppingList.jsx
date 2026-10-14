import { useId } from 'react';
import ShoppingItem from './ShoppingItem.jsx';

function ItemList({ items, label, disabled, onTogglePurchased, onRemoveProduct, onUpdateProduct }) {
  return (
    <ul className="shopping-list" aria-label={label}>
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

export default function ShoppingList({
  items = [],
  groups,
  emptyMessage = 'Tu lista de compras está vacía',
  onTogglePurchased,
  onRemoveProduct,
  onUpdateProduct,
  disabled = false,
}) {
  const headingPrefix = useId();
  const handlers = { disabled, onTogglePurchased, onRemoveProduct, onUpdateProduct };

  if (items.length === 0) {
    return <p role="status">{emptyMessage}</p>;
  }

  if (!groups) return <ItemList items={items} label="Lista de compras" {...handlers} />;

  return (
    <div className="category-groups">
      {groups.map(({ category, items: groupItems, pending }, index) => {
        const headingId = `${headingPrefix}-${index}`;
        return (
          <section key={category} className="category-group" aria-labelledby={headingId}>
            <h3 id={headingId}>
              {category}
              <span className="group-pending">{pending} {pending === 1 ? 'pendiente' : 'pendientes'}</span>
            </h3>
            <ItemList items={groupItems} label={category} {...handlers} />
          </section>
        );
      })}
    </div>
  );
}
