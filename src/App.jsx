import { useState } from "react";
import ProductSearch from "./components/ProductSearch.jsx";
import ShoppingFilters from "./components/ShoppingFilters.jsx";
import ShoppingForm from "./components/ShoppingForm.jsx";
import ShoppingList from "./components/ShoppingList.jsx";
import ShoppingSummary from "./components/ShoppingSummary.jsx";
import useShoppingList from "./hooks/useShoppingList.js";
import { emptyMessageFor, filterProducts, groupByCategory } from "./utils/productFilters.js";

export default function App() {
  const { items, loadState, pending: busy, error, addProduct, togglePurchased, removeProduct, updateProduct } =
    useShoppingList();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [groupedView, setGroupedView] = useState(false);
  const total = items.length;
  const pending = items.filter((item) => item.purchased === false).length;
  const purchased = items.filter((item) => item.purchased === true).length;
  const visibleItems = filterProducts(items, {
    status: activeFilter,
    query: searchQuery,
    category: categoryFilter,
  });
  const emptyMessage = emptyMessageFor({
    total,
    query: searchQuery,
    status: activeFilter,
    category: categoryFilter,
  });

  return (
    <main className="app">
      <header className="app-header">
        <h1>SmartList</h1>
        <p>Organiza tus compras de forma rápida y sencilla.</p>
      </header>
      <ShoppingForm onAddProduct={addProduct} disabled={loadState !== 'ready' || busy} />
      {error && <p className="error" role="alert">{error}</p>}
      {loadState === 'ready' && <ShoppingSummary total={total} pending={pending} purchased={purchased} />}
      <h2>Lista de compras</h2>
      <ProductSearch query={searchQuery} onQueryChange={setSearchQuery} />
      <ShoppingFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        groupByCategory={groupedView}
        onGroupByCategoryChange={setGroupedView}
      />
      {loadState === 'loading' && <p role="status">Cargando productos...</p>}
      {loadState === 'error' && <p>La lista no pudo cargarse. Comprueba la conexión y recarga la página.</p>}
      {loadState === 'ready' && <ShoppingList
        items={visibleItems}
        groups={groupedView ? groupByCategory(visibleItems, items) : undefined}
        emptyMessage={emptyMessage}
        onTogglePurchased={togglePurchased}
        onRemoveProduct={removeProduct}
        onUpdateProduct={updateProduct}
        disabled={busy}
      />}
    </main>
  );
}
