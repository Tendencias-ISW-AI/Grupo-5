import { useState } from "react";
import ShoppingFilters from "./components/ShoppingFilters.jsx";
import ShoppingForm from "./components/ShoppingForm.jsx";
import ShoppingList from "./components/ShoppingList.jsx";
import ShoppingSummary from "./components/ShoppingSummary.jsx";
import useShoppingList from "./hooks/useShoppingList.js";

export default function App() {
  const { items, addProduct, togglePurchased, removeProduct, updateProduct } =
    useShoppingList();
  const [activeFilter, setActiveFilter] = useState("all");
  const total = items.length;
  const pending = items.filter((item) => item.purchased === false).length;
  const purchased = items.filter((item) => item.purchased === true).length;
  const visibleItems = items.filter(
    (item) =>
      activeFilter === "all" ||
      (activeFilter === "pending" && item.purchased === false) ||
      (activeFilter === "purchased" && item.purchased === true),
  );
  const emptyMessage =
    items.length === 0 || activeFilter === "all"
      ? "Tu lista de compras está vacía"
      : activeFilter === "pending"
        ? "No tienes productos pendientes"
        : "No tienes productos comprados";

  return (
    <main className="app">
      <header className="app-header">
        <h1>SmartList</h1>
        <p>Organiza tus compras de forma rápida y sencilla.</p>
      </header>
      <ShoppingForm onAddProduct={addProduct} />
      <ShoppingSummary total={total} pending={pending} purchased={purchased} />
      <h2>Lista de compras</h2>
      <ShoppingFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <ShoppingList
        items={visibleItems}
        emptyMessage={emptyMessage}
        onTogglePurchased={togglePurchased}
        onRemoveProduct={removeProduct}
        onUpdateProduct={updateProduct}
      />
    </main>
  );
}
