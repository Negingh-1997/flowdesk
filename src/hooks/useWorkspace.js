import useLocalStorage from './useLocalStorage.js'
import { makeDemoData } from '../utils/demoData.js'
import {
  LIMITS, SESSION_TYPES, PAYMENT_METHODS, newId, cleanStr, parseMoney, isDate, isTime,
  isEmail, isPhone, pickChoice, sanitizeCustomers, sanitizeSessions, sanitizePayments,
} from '../utils/sanitize.js'
import { localToday, toCents, fromCents, formatMoney, isUpcoming } from '../utils/format.js'

/**
 * All workspace data and the actions that change it.
 * Every save* action returns `null` on success, an error message (string) to show
 * in the form, or `false` to keep the form open without a message.
 */
export default function useWorkspace() {
  const [customers, setCustomers] = useLocalStorage('fd-customers', () => makeDemoData().customers, sanitizeCustomers)
  const [sessions, setSessions] = useLocalStorage('fd-sessions', () => makeDemoData().sessions, sanitizeSessions)
  const [payments, setPayments] = useLocalStorage('fd-payments', () => makeDemoData().payments, sanitizePayments)

  const today = localToday()

  const paidCents = new Map()
  for (const p of payments) paidCents.set(p.customerId, (paidCents.get(p.customerId) ?? 0) + toCents(p.amount))

  const nameOf = (id) => customers.find((c) => c.id === id)?.fullName || 'Deleted customer'
  const paidBy = (id) => fromCents(paidCents.get(id) ?? 0)
  const totalRevenue = fromCents([...paidCents.values()].reduce((t, c) => t + c, 0))
  const outstanding = fromCents(
    customers.reduce((t, c) => t + Math.max(0, toCents(c.totalFee) - (paidCents.get(c.id) ?? 0)), 0),
  )
  const upcomingCount = sessions.filter((s) => isUpcoming(s, today)).length

  // Remaining balance for a customer, ignoring one payment (the one being edited).
  const remainingFor = (customerId, ignore = null) => {
    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return 0
    const paid = (paidCents.get(customerId) ?? 0) - (ignore?.customerId === customerId ? toCents(ignore.amount) : 0)
    return fromCents(Math.max(0, toCents(customer.totalFee) - paid))
  }

  const saveCustomer = (d, editing = null) => {
    const fullName = cleanStr(d.fullName, LIMITS.name)
    const email = cleanStr(d.email, LIMITS.email)
    const phone = cleanStr(d.phone, LIMITS.phone)
    const totalFee = parseMoney(d.totalFee)
    if (!fullName) return 'Please enter the customer’s name.'
    if (email && !isEmail(email)) return 'Please enter a valid email address.'
    if (phone && !isPhone(phone)) return 'Phone numbers can only contain digits, spaces and + ( ) - .'
    if (totalFee === null) return 'Please enter a valid fee (0 or more).'
    const data = { fullName, email, phone, totalFee }
    setCustomers((prev) =>
      editing ? prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)) : [...prev, { id: newId(), ...data }],
    )
    return null
  }

  const saveSession = (d, editing = null) => {
    const title = cleanStr(d.title, LIMITS.title)
    const customerId = typeof d.customerId === 'string' ? d.customerId : ''
    const type = pickChoice(d.type, SESSION_TYPES, editing?.type)
    if (!title) return 'Please enter a session title.'
    if (!customers.some((c) => c.id === customerId)) return 'Please choose a customer.'
    if (!isDate(d.date)) return 'Please choose a valid date.'
    if (!isTime(d.time)) return 'Please choose a valid time.'
    if (!type) return 'Please choose a session type.'
    const data = { title, customerId, date: d.date, time: d.time, type }
    setSessions((prev) =>
      editing
        ? prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
        : [...prev, { id: newId(), ...data, status: 'Scheduled' }],
    )
    return null
  }

  const savePayment = (d, editing = null) => {
    const customerId = typeof d.customerId === 'string' ? d.customerId : ''
    const amount = parseMoney(d.amount)
    const method = pickChoice(d.method, PAYMENT_METHODS, editing?.method)
    if (!customers.some((c) => c.id === customerId)) return 'Please choose a customer.'
    if (amount === null || amount <= 0) return 'Please enter an amount greater than zero.'
    if (!isDate(d.date)) return 'Please choose a valid date.'
    if (!method) return 'Please choose a payment method.'
    const left = remainingFor(customerId, editing)
    if (
      toCents(amount) > toCents(left) &&
      !window.confirm(`This payment (${formatMoney(amount)}) is more than the remaining balance (${formatMoney(left)}). Save anyway?`)
    ) return false
    const data = { customerId, amount, date: d.date, method, description: cleanStr(d.description, LIMITS.description) || 'Payment' }
    setPayments((prev) =>
      editing ? prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)) : [{ id: newId(), ...data }, ...prev],
    )
    return null
  }

  const deleteCustomer = (id) => {
    setCustomers((p) => p.filter((c) => c.id !== id))
    setSessions((p) => p.filter((s) => s.customerId !== id))
    setPayments((p) => p.filter((x) => x.customerId !== id))
  }
  const toggleSession = (id) =>
    setSessions((p) => p.map((s) => (s.id === id ? { ...s, status: s.status === 'Done' ? 'Scheduled' : 'Done' } : s)))
  const deleteSession = (id) => setSessions((p) => p.filter((s) => s.id !== id))
  const deletePayment = (id) => setPayments((p) => p.filter((x) => x.id !== id))

  return {
    customers, sessions, payments, today,
    nameOf, paidBy, totalRevenue, outstanding, upcomingCount,
    saveCustomer, saveSession, savePayment,
    deleteCustomer, toggleSession, deleteSession, deletePayment,
  }
}
