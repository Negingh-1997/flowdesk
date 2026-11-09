import { formatMoney, sumMoney } from '../utils/format.js'

export default function RevenueChart({ payments }) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { key, label: d.toLocaleString('en', { month: 'short' }), amounts: [] }
  })
  for (const p of payments) months.find((m) => m.key === p.date.slice(0, 7))?.amounts.push(p.amount)
  const data = months.map((m) => ({ ...m, total: sumMoney(m.amounts) }))
  const max = Math.max(...data.map((m) => m.total), 1)

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">INSIGHTS</p>
          <h2>Revenue – last 6 months</h2>
        </div>
      </div>
      <div className="chart">
        {data.map((m) => {
          const h = Math.max(3, (m.total / max) * 120)
          return (
            <div className="bar-col" key={m.key}>
              <span className="bar-value">{m.total ? formatMoney(Math.round(m.total)) : ''}</span>
              <svg className="bar-chart" viewBox="0 0 56 120" preserveAspectRatio="none" role="img" aria-label={`${m.label}: ${formatMoney(m.total)} revenue`}>
                <rect x="0" y={120 - h} width="56" height={h} rx="5" />
              </svg>
              <small>{m.label}</small>
            </div>
          )
        })}
      </div>
    </section>
  )
}
