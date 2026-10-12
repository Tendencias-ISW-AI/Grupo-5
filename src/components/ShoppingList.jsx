import ShoppingItem from './ShoppingItem.jsx';

export default function ShoppingList({ items = [] }) {
  return (
    <ul aria-label="Lista de compras">
      {items.map((item) => (
        <ShoppingItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
