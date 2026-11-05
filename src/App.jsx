import './App.css'
import { useState, useEffect, useRef } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import Sidebar from './components/Sidebar'
import RevenueChart from './components/RevenueChart'
import {
  LIMITS, MAX_MONEY, newId, cleanStr, cleanMoney,
  sanitizeCustomers, sanitizeSessions, sanitizePayments, sanitizeTheme,
} from './utils/sanitize'

const money = (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
// Local calendar date (toISOString would use UTC and can be off by one day).
const today = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

const demoCustomers = [
  { id: '1', fullName: 'Alex Morgan', email: 'alex@example.com', phone: '555-0101', totalFee: 360 },
  { id: '2', fullName: 'Jamie Lee', email: 'jamie@example.com', phone: '555-0102', totalFee: 240 },
  { id: '3', fullName: 'Taylor Smith', email: 'taylor@example.com', phone: '555-0103', totalFee: 200 },
]
const demoSessions = [
  { id: '1', time: '09:00', title: 'Morning training', customerId: '1', type: 'Personal training', status: 'Scheduled' },
  { id: '2', time: '11:30', title: 'Strength class', customerId: '2', type: 'Group session', status: 'Scheduled' },
  { id: '3', time: '16:00', title: 'Kickboxing', customerId: '3', type: 'Kickboxing', status: 'Scheduled' },
]
const demoPayments = [
  { id: '1', customerId: '1', description: 'Monthly membership', amount: 120, date: '2026-11-01', method: 'Card' },
  { id: '2', customerId: '2', description: 'Training package', amount: 240, date: '2026-11-02', method: 'Cash' },
  { id: '3', customerId: '3', description: 'Monthly membership', amount: 80, date: '2026-11-03', method: 'Bank transfer' },
]

function App() {
  const [customers, setCustomers] = useLocalStorage('fd-customers', demoCustomers, sanitizeCustomers)
  const [sessions, setSessions] = useLocalStorage('fd-sessions', demoSessions, sanitizeSessions)
  const [payments, setPayments] = useLocalStorage('fd-payments', demoPayments, sanitizePayments)
  const [theme, setTheme] = useLocalStorage('fd-theme', 'dark', sanitizeTheme)
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const [form, setForm] = useState(null) // 'customer' | 'session' | 'payment' | null
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const customerFormRef = useRef(null)
  const [formOpenCount, setFormOpenCount] = useState(0)

  const nameOf = (id) => customers.find((c) => c.id === id)?.fullName || 'Deleted customer'
  const paidBy = (id) => payments.filter((p) => p.customerId === id).reduce((t, p) => t + p.amount, 0)
  const totalRevenue = payments.reduce((t, p) => t + p.amount, 0)
  const outstanding = customers.reduce((t, c) => t + Math.max(0, c.totalFee - paidBy(c.id)), 0)
  const visible = customers.filter((c) => c.fullName.toLowerCase().includes(search.toLowerCase()))
  const upcoming = sessions.filter((s) => s.status === 'Scheduled').length

  const submit = (handler) => (e) => {
    e.preventDefault()
    if (handler(Object.fromEntries(new FormData(e.currentTarget))) === false) return
    setForm(null)
  }

  const saveCustomer = (d) => {
    const data = {
      fullName: cleanStr(d.fullName, LIMITS.name),
      email: cleanStr(d.email, LIMITS.email),
      phone: cleanStr(d.phone, LIMITS.phone),
      totalFee: cleanMoney(d.totalFee),
    }
    if (!data.fullName) return false
    setCustomers((prev) =>
      editing ? prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)) : [...prev, { id: newId(), ...data }]
    )
  }
  const openCustomerForm = (c = null) => {
    setEditing(c)
    setForm('customer')
    setFormOpenCount((n) => n + 1)
  }
  // The form sits above the list: after it renders, bring it into view and focus the first field.
  useEffect(() => {
    if (formOpenCount === 0 || !customerFormRef.current) return
    customerFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    customerFormRef.current.querySelector('input')?.focus({ preventScroll: true })
  }, [formOpenCount])
  const addSession = (d) => {
    const title = cleanStr(d.title, LIMITS.title)
    const customerId = String(d.customerId)
    if (!title || !customers.some((c) => c.id === customerId)) return false
    setSessions((prev) => [
      ...prev,
      { id: newId(), title, customerId, time: d.time, type: cleanStr(d.type, LIMITS.short), status: 'Scheduled' },
    ])
  }
  const addPayment = (d) => {
    const customerId = String(d.customerId)
    const customer = customers.find((c) => c.id === customerId)
    const amount = cleanMoney(d.amount)
    if (!customer || amount <= 0) return false
    const remaining = Math.max(0, customer.totalFee - paidBy(customerId))
    if (amount > remaining && !window.confirm(
      `This payment (${money(amount)}) is more than the remaining balance (${money(remaining)}). Save anyway?`
    )) return false
    setPayments((prev) => [
      {
        id: newId(), customerId, amount, date: d.date,
        method: cleanStr(d.method, LIMITS.short),
        description: cleanStr(d.description, LIMITS.description),
      },
      ...prev,
    ])
  }

  const deleteCustomer = (id) => {
    if (!window.confirm('Delete this customer and all their sessions and payments?')) return
    setCustomers((p) => p.filter((c) => c.id !== id))
    setSessions((p) => p.filter((s) => s.customerId !== id))
    setPayments((p) => p.filter((x) => x.customerId !== id))
  }
  const toggleSession = (id) =>
    setSessions((p) => p.map((s) => (s.id === id ? { ...s, status: s.status === 'Done' ? 'Scheduled' : 'Done' } : s)))
  const removeSession = (id) => {
    if (!window.confirm('Delete this session?')) return
    setSessions((p) => p.filter((s) => s.id !== id))
  }
  const removePayment = (id) => {
    if (!window.confirm('Delete this payment? This cannot be undone.')) return
    setPayments((p) => p.filter((x) => x.id !== id))
  }

  const customerSelect = (
    <select name="customerId" defaultValue="" required>
      <option value="" disabled>Select customer</option>
      {customers.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
    </select>
  )

  return (
    <div className="app">
      <Sidebar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>
          <button className="primary-button" type="button" onClick={() => openCustomerForm()}>+ New customer</button>
        </header>

        {form === 'customer' && (
          <section className="panel customer-form" ref={customerFormRef}>
            <div className="panel-heading">
              <h2>{editing ? 'Edit customer' : 'New customer'}</h2>
              <button type="button" onClick={() => setForm(null)}>Close ✕</button>
            </div>
            <form key={editing?.id ?? 'new'} onSubmit={submit(saveCustomer)}>
              <label>Full name<input name="fullName" maxLength={LIMITS.name} defaultValue={editing?.fullName ?? ''} placeholder="Enter customer name" required /></label>
              <label>Email address<input name="email" maxLength={LIMITS.email} defaultValue={editing?.email ?? ''} type="email" placeholder="Enter email address" /></label>
              <label>Phone number<input name="phone" maxLength={LIMITS.phone} defaultValue={editing?.phone ?? ''} type="tel" placeholder="Enter phone number" /></label>
              <label>Total fee ($)<input name="totalFee" max={MAX_MONEY} defaultValue={editing?.totalFee ?? ''} type="number" min="0" step="0.01" placeholder="e.g. 300" required /></label>
              <button className="primary-button" type="submit">{editing ? 'Update customer' : 'Save customer'}</button>
            </form>
          </section>
        )}

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
            <h2>Welcome back!</h2>
            <p>Manage your customers, sessions and payments in one place.</p>
          </div>
          <div className="welcome-mark">F.</div>
        </section>

        <section className="stats">
          {[
            ['Total customers', customers.length, 'Active clients'],
            ['Upcoming sessions', upcoming, 'Not completed yet'],
            ['Payments received', money(totalRevenue), 'All time'],
            ['Outstanding balance', money(outstanding), 'Still to collect'],
          ].map(([label, value, note]) => (
            <article className="stat-card" key={label}>
              <p>{label}</p><h2>{value}</h2><small>{note}</small>
            </article>
          ))}
        </section>

        <RevenueChart payments={payments} />

        <section className="panel" id="customers">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CUSTOMER MANAGEMENT</p>
              <h2>Customers</h2>
            </div>
            <span>{customers.length} customers</span>
          </div>
          <input type="text" placeholder="Search customers..." maxLength={LIMITS.name} value={search} onChange={(e) => setSearch(e.target.value)} />
          {customers.length === 0 && <p>No customers added yet.</p>}
          {customers.length > 0 && visible.length === 0 && <p>No customers match your search.</p>}
          {visible.map((c) => (
            <div className="session-row" key={c.id}>
              <div className="avatar-sm">{c.fullName[0]?.toUpperCase()}</div>
              <div className="session-info">
                <strong>{c.fullName}</strong>
                <small>{c.email || 'No email'} · {c.phone || 'No phone'}</small>
                <small>Fee: {money(c.totalFee)} · Paid: {money(paidBy(c.id))} · Remaining: {money(Math.max(0, c.totalFee - paidBy(c.id)))}</small>
                <div className="progress"><span style={{ width: `${Math.min(100, (paidBy(c.id) / (c.totalFee || 1)) * 100)}%` }} /></div>
              </div>
              <button type="button" className="edit-button" onClick={() => openCustomerForm(c)}>Edit</button>
              <button type="button" className="delete-button" onClick={() => deleteCustomer(c.id)}>Delete</button>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel" id="sessions">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR SCHEDULE</p>
                <h2>Upcoming sessions</h2>
              </div>
              <button type="button" className="add-session-button" onClick={() => setForm('session')}>+ Add Session</button>
            </div>
            {form === 'session' && (
              <form className="session-form" onSubmit={submit(addSession)}>
                <input name="title" maxLength={LIMITS.title} placeholder="Session title" required />
                {customerSelect}
                <input name="time" type="time" required />
                <select name="type" defaultValue="" required>
                  <option value="" disabled>Select session type</option>
                  <option>Personal training</option>
                  <option>Group session</option>
                  <option>Kickboxing</option>
                </select>
                <button type="submit">Save Session</button>
                <button type="button" onClick={() => setForm(null)}>Cancel</button>
              </form>
            )}
            {sessions.length === 0 && <p>No sessions yet.</p>}
            {[...sessions].sort((a, b) => a.time.localeCompare(b.time)).map((s) => (
              <div className="session-row" key={s.id}>
                <div className="session-time">{s.time}</div>
                <div className="session-info">
                  <strong>{s.title}</strong>
                  <small>{nameOf(s.customerId)} · {s.type}</small>
                </div>
                <button type="button" className={`status ${s.status === 'Done' ? 'done' : ''}`} onClick={() => toggleSession(s.id)}>{s.status}</button>
                <button type="button" className="delete-button" onClick={() => removeSession(s.id)}>✕</button>
              </div>
            ))}
          </article>

          <article className="panel" id="payments">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">FINANCIAL OVERVIEW</p>
                <h2>Recent payments</h2>
              </div>
              <button type="button" className="add-session-button" onClick={() => setForm('payment')}>+ Add Payment</button>
            </div>
            {form === 'payment' && (
              <form className="session-form" onSubmit={submit(addPayment)}>
                {customerSelect}
                <input name="amount" type="number" min="0.01" max={MAX_MONEY} step="0.01" placeholder="Payment amount" required />
                <input name="date" type="date" defaultValue={today()} required />
                <select name="method" defaultValue="" required>
                  <option value="" disabled>Select payment method</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Bank transfer</option>
                </select>
                <input name="description" placeholder="Payment description" required maxLength={150} />
                <button type="submit">Save Payment</button>
                <button type="button" onClick={() => setForm(null)}>Cancel</button>
              </form>
            )}
            {payments.length === 0 && <p>No payments yet.</p>}
            {[...payments].sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
              <div className="payment-row" key={p.id}>
                <div>
                  <strong>{nameOf(p.customerId)}</strong>
                  <small>{p.description} · {p.date} · {p.method}</small>
                </div>
                <strong className="amount">+{money(p.amount)}</strong>
                <button type="button" className="delete-button" onClick={() => removePayment(p.id)}>✕</button>
              </div>
            ))}
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
