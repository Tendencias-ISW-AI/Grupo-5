import { PRODUCT_CATEGORIES } from '../utils/productCategories.js';

const options = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'purchased', label: 'Comprados' },
];

export default function ShoppingFilters({
  activeFilter,
  onFilterChange,
  categoryFilter = 'all',
  onCategoryChange = () => {},
  groupByCategory = false,
  onGroupByCategoryChange = () => {},
}) {
  return (
    <div className="shopping-filters-panel">
      <div className="shopping-filters" role="group" aria-label="Filtrar productos por estado">
        {options.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={activeFilter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="category-filters">
        <div className="form-field">
          <label htmlFor="category-filter">Categoría</label>
          <select
            id="category-filter" value={categoryFilter}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">Todas</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <button
          id="group-by-category" type="button" className="group-toggle"
          aria-pressed={groupByCategory}
          onClick={() => onGroupByCategoryChange(!groupByCategory)}
        >
          Agrupar por categoría
        </button>
      </div>
    </div>
  );
}
