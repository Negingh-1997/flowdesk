// Money, date and small domain helpers shared by the UI and the validators.
// Imports use explicit ".js" extensions so the tests can run under plain Node.

export const CURRENCY = 'USD'

const withCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY })
const whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })

export const formatMoney = (n) => {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0
  return Number.isInteger(v) ? whole.format(v) : withCents.format(v)
}

// Money is summed as integer cents so 0.1 + 0.2 never drifts.
export const toCents = (n) => Math.round((Number(n) || 0) * 100)
export const fromCents = (c) => c / 100
export const sumMoney = (values) => fromCents(values.reduce((t, v) => t + toCents(v), 0))
export const remaining = (fee, paid) => fromCents(Math.max(0, toCents(fee) - toCents(paid)))
export const percentPaid = (fee, paid) => {
  const f = toCents(fee)
  const p = toCents(paid)
  if (f <= 0) return p > 0 ? 100 : 0
  return Math.max(0, Math.min(100, (p / f) * 100))
}

const pad = (n) => String(n).padStart(2, '0')
// Local calendar date (toISOString would use UTC and can be off by one day).
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const localToday = () => toISODate(new Date())
export const addDays = (n, from = new Date()) =>
  toISODate(new Date(from.getFullYear(), from.getMonth(), from.getDate() + n))

// A session is "upcoming" until it is marked done or its date has passed.
export const isUpcoming = (session, today) => session.status === 'Scheduled' && session.date >= today
