import { useId } from 'react';

export default function ShoppingSummary({ total, pending, purchased }) {
  const headingId = useId();

  return (
    <section className="shopping-summary" aria-labelledby={headingId}>
      <h2 id={headingId}>Resumen de compras</h2>
      <dl>
        <div><dt>Total de productos</dt><dd>{total}</dd></div>
        <div><dt>Pendientes</dt><dd>{pending}</dd></div>
        <div><dt>Comprados</dt><dd>{purchased}</dd></div>
      </dl>
    </section>
  );
}
