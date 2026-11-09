import { useState } from 'react'
import CustomerSelect from './CustomerSelect.jsx'
import { LIMITS, SESSION_TYPES } from '../utils/sanitize.js'
import { isUpcoming } from '../utils/format.js'

function SessionForm({ session, customers, today, onSave, onClose }) {
  const [error, setError] = useState('')
  // A session saved before the type list changed keeps its old type selectable.
  const types = session?.type && !SESSION_TYPES.includes(session.type) ? [...SESSION_TYPES, session.type] : SESSION_TYPES

  const submit = (e) => {
    e.preventDefault()
    const result = onSave(Object.fromEntries(new FormData(e.currentTarget)))
    if (typeof result === 'string') setError(result)
    else if (result !== false) onClose()
  }

  return (
    <form className="session-form" onSubmit={submit}>
      <label>Title<input name="title" maxLength={LIMITS.title} defaultValue={session?.title ?? ''} placeholder="Session title" required /></label>
      <label>Customer<CustomerSelect customers={customers} defaultValue={session?.customerId ?? ''} /></label>
      <label>Date<input name="date" type="date" defaultValue={session?.date ?? today} required /></label>
      <label>Time<input name="time" type="time" defaultValue={session?.time ?? ''} required /></label>
      <label>Type
        <select name="type" defaultValue={session?.type ?? ''} required>
          <option value="" disabled>Select session type</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button type="submit">{session ? 'Update session' : 'Save session'}</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  )
}

export default function SessionPanel({ sessions, customers, nameOf, today, onSave, onToggle, onDelete }) {
  const [form, setForm] = useState(null) // null = closed, { session } = open (session is null when adding)
  const [showPast, setShowPast] = useState(false)

  const when = (s) => `${s.date}T${s.time}`
  const upcoming = sessions.filter((s) => isUpcoming(s, today)).sort((a, b) => when(a).localeCompare(when(b)))
  const past = sessions.filter((s) => !isUpcoming(s, today)).sort((a, b) => when(b).localeCompare(when(a)))
  const rows = showPast ? [...upcoming, ...past] : upcoming

  const confirmDelete = (s) => {
    if (window.confirm(`Delete the session “${s.title}”?`)) onDelete(s.id)
  }

  return (
    <article className="panel" id="sessions">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">YOUR SCHEDULE</p>
          <h2>{showPast ? 'All sessions' : 'Upcoming sessions'}</h2>
        </div>
        <button type="button" className="add-session-button" disabled={customers.length === 0} onClick={() => setForm({ session: null })}>+ Add Session</button>
      </div>
      {customers.length === 0 && <p className="empty">Add a customer first to schedule sessions.</p>}
      {form && (
        <SessionForm
          key={form.session?.id ?? 'new'}
          session={form.session}
          customers={customers}
          today={today}
          onSave={(d) => onSave(d, form.session)}
          onClose={() => setForm(null)}
        />
      )}
      {rows.length === 0 && <p className="empty">{showPast ? 'No sessions yet.' : 'No upcoming sessions.'}</p>}
      {rows.map((s) => (
        <div className="session-row" key={s.id}>
          <div className="session-time"><strong>{s.time}</strong><small>{s.date}</small></div>
          <div className="session-info">
            <strong>{s.title}</strong>
            <small>{nameOf(s.customerId)} · {s.type || 'No type'}</small>
          </div>
          <div className="row-actions">
            <button type="button" className="edit-button" onClick={() => setForm({ session: s })} aria-label={`Edit session ${s.title}`}>Edit</button>
            <button type="button" className={`status ${s.status === 'Done' ? 'done' : ''}`} onClick={() => onToggle(s.id)} aria-label={`${s.title}: mark as ${s.status === 'Done' ? 'scheduled' : 'done'}`}>{s.status}</button>
            <button type="button" className="delete-button" onClick={() => confirmDelete(s)} aria-label={`Delete session ${s.title}`}>✕</button>
          </div>
        </div>
      ))}
      {past.length > 0 && (
        <button type="button" className="link-button" onClick={() => setShowPast((v) => !v)}>
          {showPast ? 'Hide past & completed' : `Show past & completed (${past.length})`}
        </button>
      )}
    </article>
  )
}
