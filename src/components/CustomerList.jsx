import { useState } from 'react'
import { LIMITS } from '../utils/sanitize.js'
import { formatMoney, percentPaid, remaining } from '../utils/format.js'

export default function CustomerList({ customers, paidBy, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const q = search.trim().toLowerCase()
  const visible = q
    ? customers.filter((c) => [c.fullName, c.email, c.phone].some((v) => v.toLowerCase().includes(q)))
    : customers

  const confirmDelete = (c) => {
    if (window.confirm(`Delete ${c.fullName} and all of their sessions and payments?`)) onDelete(c.id)
  }

  return (
    <section className="panel" id="customers">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">CUSTOMER MANAGEMENT</p>
          <h2>Customers</h2>
        </div>
        <span>{customers.length} customers</span>
      </div>
      <input
        type="search"
        className="search-input"
        aria-label="Search customers by name, email or phone"
        placeholder="Search customers..."
        maxLength={LIMITS.name}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {customers.length === 0 && <p className="empty">No customers added yet.</p>}
      {customers.length > 0 && visible.length === 0 && <p className="empty">No customers match your search.</p>}
      {visible.map((c) => {
        const paid = paidBy(c.id)
        const pct = percentPaid(c.totalFee, paid)
        return (
          <div className="session-row" key={c.id}>
            <div className="avatar-sm" aria-hidden="true">{c.fullName[0]?.toUpperCase()}</div>
            <div className="session-info">
              <strong>{c.fullName}</strong>
              <small>{c.email || 'No email'} · {c.phone || 'No phone'}</small>
              <small>Fee: {formatMoney(c.totalFee)} · Paid: {formatMoney(paid)} · Remaining: {formatMoney(remaining(c.totalFee, paid))}</small>
              <div className="progress" role="progressbar" aria-label={`${c.fullName} payment progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(pct)}>
                <svg viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="0" width={pct} height="6" rx="3" /></svg>
              </div>
            </div>
            <div className="row-actions">
              <button type="button" className="edit-button" onClick={() => onEdit(c)} aria-label={`Edit ${c.fullName}`}>Edit</button>
              <button type="button" className="delete-button" onClick={() => confirmDelete(c)} aria-label={`Delete ${c.fullName}`}>Delete</button>
            </div>
          </div>
        )
      })}
    </section>
  )
}
