import { useId } from 'react';

export default function ShoppingSummary({ total, pending, purchased }) {
  const headingId = useId();

  return (
    <section className="shopping-summary" aria-labelledby={headingId}>
      <h2 id={headingId}>Resumen de compras</h2>

      <dl>
        <div className="summary-card total">
          <dt>Total de productos</dt>
          <dd>{total}</dd>
        </div>

        <div className="summary-card pending">
          <dt>Pendientes</dt>
          <dd>{pending}</dd>
        </div>

        <div className="summary-card purchased">
          <dt>Comprados</dt>
          <dd>{purchased}</dd>
        </div>
      </dl>
    </section>
  );
}