export default function StatCards({ items }) {
  return (
    <section className="stats" aria-label="Key figures">
      {items.map(([label, value, note]) => (
        <article className="stat-card" key={label}>
          <p>{label}</p><h2>{value}</h2><small>{note}</small>
        </article>
      ))}
    </section>
  )
}
