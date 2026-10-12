import ShoppingForm from './components/ShoppingForm.jsx';
import ShoppingList from './components/ShoppingList.jsx';
import useShoppingList from './hooks/useShoppingList.js';

export default function App() {
  const { items, addProduct, togglePurchased } = useShoppingList();

  return (
    <main className="app">
      <h1>SmartList</h1>
      <p>Aplicación educativa para gestionar listas de compras.</p>
      <ShoppingForm onAddProduct={addProduct} />
      <h2>Lista de compras</h2>
      <ShoppingList items={items} onTogglePurchased={togglePurchased} />
    </main>
  );
}
