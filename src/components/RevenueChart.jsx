const money = (n) => `$${Math.round(n).toLocaleString()}`

export default function RevenueChart({ payments }) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { key, label: d.toLocaleString('en', { month: 'short' }), total: 0 }
  })
  payments.forEach((p) => {
    const m = months.find((x) => x.key === p.date.slice(0, 7))
    if (m) m.total += p.amount
  })
  const max = Math.max(...months.map((m) => m.total), 1)

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">INSIGHTS</p>
          <h2>Revenue – last 6 months</h2>
        </div>
      </div>
      <div className="chart">
        {months.map((m) => (
          <div className="bar-col" key={m.key}>
            <span className="bar-value">{m.total ? money(m.total) : ''}</span>
            <div className="bar" style={{ height: `${(m.total / max) * 100}%` }} />
            <small>{m.label}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
