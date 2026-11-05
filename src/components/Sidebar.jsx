import { useState } from 'react'

const links = [
  ['dashboard', '▦ Dashboard'],
  ['customers', '♙ Customers'],
  ['sessions', '▤ Sessions'],
  ['payments', '＄ Payments'],
]

export default function Sidebar({ theme, onToggleTheme }) {
  const [active, setActive] = useState('dashboard')
  return (
    <aside className="sidebar">
      <h2 className="brand">Flow<span>Desk</span></h2>
      <p className="menu-label">WORKSPACE</p>
      <nav>
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={() => setActive(id)}
             className={`nav-link ${active === id ? 'active' : ''}`}>{label}</a>
        ))}
      </nav>
      <button type="button" className="theme-toggle" onClick={onToggleTheme}>
        {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
      </button>
      <div className="profile">
        <div className="avatar">F</div>
        <div><strong>Studio Admin</strong><small>Workspace owner</small></div>
      </div>
    </aside>
  )
}
