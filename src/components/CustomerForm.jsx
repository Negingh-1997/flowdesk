import { useEffect, useRef, useState } from 'react'
import { LIMITS, MAX_MONEY } from '../utils/sanitize.js'
import { CURRENCY } from '../utils/format.js'

// Mounted fresh (via `key`) every time it is opened, so it scrolls into view and focuses the first field.
export default function CustomerForm({ customer, onSave, onClose }) {
  const ref = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    el.querySelector('input')?.focus({ preventScroll: true })
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const result = onSave(Object.fromEntries(new FormData(e.currentTarget)))
    if (typeof result === 'string') setError(result)
    else if (result !== false) onClose()
  }

  return (
    <section className="panel customer-form" ref={ref} aria-label={customer ? 'Edit customer' : 'New customer'}>
      <div className="panel-heading">
        <h2>{customer ? 'Edit customer' : 'New customer'}</h2>
        <button type="button" onClick={onClose}>Close ✕</button>
      </div>
      <form onSubmit={submit}>
        <label>Full name<input name="fullName" maxLength={LIMITS.name} defaultValue={customer?.fullName ?? ''} placeholder="Enter customer name" required /></label>
        <label>Email address<input name="email" maxLength={LIMITS.email} defaultValue={customer?.email ?? ''} type="email" placeholder="Enter email address" /></label>
        <label>Phone number<input name="phone" maxLength={LIMITS.phone} defaultValue={customer?.phone ?? ''} type="tel" placeholder="Enter phone number" /></label>
        <label>Total fee ({CURRENCY})<input name="totalFee" max={MAX_MONEY} defaultValue={customer?.totalFee ?? ''} type="number" min="0" step="0.01" inputMode="decimal" placeholder="e.g. 300" required /></label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary-button" type="submit">{customer ? 'Update customer' : 'Save customer'}</button>
      </form>
    </section>
  )
}
