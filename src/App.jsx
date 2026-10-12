import ShoppingForm from './components/ShoppingForm.jsx';
import ShoppingList from './components/ShoppingList.jsx';
import useShoppingList from './hooks/useShoppingList.js';

export default function App() {
  const { items } = useShoppingList();

  return (
    <main className="app">
      <h1>SmartList</h1>
      <p>Aplicación educativa para gestionar listas de compras.</p>
      <p>Configuración inicial. Las funcionalidades se desarrollarán en próximas historias.</p>
      <ShoppingForm />
      <ShoppingList items={items} />
    </main>
  );
}
