import { useState } from 'react'
import CustomerSelect from './CustomerSelect.jsx'
import { LIMITS, MAX_MONEY, PAYMENT_METHODS } from '../utils/sanitize.js'
import { formatMoney } from '../utils/format.js'

const RECENT = 8

function PaymentForm({ payment, customers, today, onSave, onClose }) {
  const [error, setError] = useState('')
  const methods = payment?.method && !PAYMENT_METHODS.includes(payment.method) ? [...PAYMENT_METHODS, payment.method] : PAYMENT_METHODS

  const submit = (e) => {
    e.preventDefault()
    const result = onSave(Object.fromEntries(new FormData(e.currentTarget)))
    if (typeof result === 'string') setError(result)
    else if (result !== false) onClose()
  }

  return (
    <form className="session-form" onSubmit={submit}>
      <label>Customer<CustomerSelect customers={customers} defaultValue={payment?.customerId ?? ''} /></label>
      <label>Amount<input name="amount" type="number" min="0.01" max={MAX_MONEY} step="0.01" inputMode="decimal" defaultValue={payment?.amount ?? ''} placeholder="Payment amount" required /></label>
      <label>Date<input name="date" type="date" defaultValue={payment?.date ?? today} required /></label>
      <label>Method
        <select name="method" defaultValue={payment?.method ?? ''} required>
          <option value="" disabled>Select payment method</option>
          {methods.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label>Description<input name="description" maxLength={LIMITS.description} defaultValue={payment?.description ?? ''} placeholder="Payment description" required /></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button type="submit">{payment ? 'Update payment' : 'Save payment'}</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  )
}

export default function PaymentPanel({ payments, customers, nameOf, today, onSave, onDelete }) {
  const [form, setForm] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date))
  const rows = showAll ? sorted : sorted.slice(0, RECENT)

  const confirmDelete = (p) => {
    if (window.confirm(`Delete this ${formatMoney(p.amount)} payment? This cannot be undone.`)) onDelete(p.id)
  }

  return (
    <article className="panel" id="payments">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FINANCIAL OVERVIEW</p>
          <h2>Recent payments</h2>
        </div>
        <button type="button" className="add-session-button" disabled={customers.length === 0} onClick={() => setForm({ payment: null })}>+ Add Payment</button>
      </div>
      {customers.length === 0 && <p className="empty">Add a customer first to record payments.</p>}
      {form && (
        <PaymentForm
          key={form.payment?.id ?? 'new'}
          payment={form.payment}
          customers={customers}
          today={today}
          onSave={(d) => onSave(d, form.payment)}
          onClose={() => setForm(null)}
        />
      )}
      {payments.length === 0 && <p className="empty">No payments yet.</p>}
      {rows.map((p) => (
        <div className="payment-row" key={p.id}>
          <div>
            <strong>{nameOf(p.customerId)}</strong>
            <small>{p.description} · {p.date} · {p.method}</small>
          </div>
          <strong className="amount">+{formatMoney(p.amount)}</strong>
          <div className="row-actions">
            <button type="button" className="edit-button" onClick={() => setForm({ payment: p })} aria-label={`Edit payment from ${nameOf(p.customerId)}`}>Edit</button>
            <button type="button" className="delete-button" onClick={() => confirmDelete(p)} aria-label={`Delete payment from ${nameOf(p.customerId)}`}>✕</button>
          </div>
        </div>
      ))}
      {payments.length > RECENT && (
        <button type="button" className="link-button" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show fewer' : `Show all (${payments.length})`}
        </button>
      )}
    </article>
  )
}
