const options = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'purchased', label: 'Comprados' },
];

export default function ShoppingFilters({ activeFilter, onFilterChange }) {
  return (
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
  );
}
