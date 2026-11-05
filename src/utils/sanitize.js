// Validation helpers for data coming from localStorage and from forms.

export const LIMITS = { name: 80, email: 120, phone: 30, title: 100, description: 150, short: 40 }
export const MAX_MONEY = 1_000_000_000

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const cleanStr = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export const cleanMoney = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.min(n, MAX_MONEY) : 0
}

const cleanId = (v) => {
  if (typeof v !== 'string' && typeof v !== 'number') return null
  const s = String(v).trim().slice(0, 64)
  return s || null
}

const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const isTime = (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// Keeps only valid items and drops duplicate ids. Returns undefined if not an array.
function sanitizeList(value, mapItem) {
  if (!Array.isArray(value)) return undefined
  const seen = new Set()
  const out = []
  for (const raw of value) {
    if (!isObj(raw)) continue
    const item = mapItem(raw)
    if (!item || seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}

export const sanitizeCustomers = (value) =>
  sanitizeList(value, (c) => {
    const id = cleanId(c.id)
    const fullName = cleanStr(c.fullName, LIMITS.name)
    if (!id || !fullName) return null
    return {
      id,
      fullName,
      email: cleanStr(c.email, LIMITS.email),
      phone: cleanStr(c.phone, LIMITS.phone),
      totalFee: cleanMoney(c.totalFee),
    }
  })

export const sanitizeSessions = (value) =>
  sanitizeList(value, (s) => {
    const id = cleanId(s.id)
    const customerId = cleanId(s.customerId)
    const title = cleanStr(s.title, LIMITS.title)
    if (!id || !customerId || !title || !isTime(s.time)) return null
    return {
      id,
      customerId,
      title,
      time: s.time,
      type: cleanStr(s.type, LIMITS.short),
      status: s.status === 'Done' ? 'Done' : 'Scheduled',
    }
  })

export const sanitizePayments = (value) =>
  sanitizeList(value, (p) => {
    const id = cleanId(p.id)
    const customerId = cleanId(p.customerId)
    if (!id || !customerId || !isDate(p.date)) return null
    return {
      id,
      customerId,
      description: cleanStr(p.description, LIMITS.description),
      amount: cleanMoney(p.amount),
      date: p.date,
      method: cleanStr(p.method, LIMITS.short),
    }
  })

export const sanitizeTheme = (v) => (v === 'dark' || v === 'light' ? v : undefined)
