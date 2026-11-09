import { useEffect, useRef, useState } from 'react'

const links = [
  ['dashboard', '▦', 'Dashboard'],
  ['customers', '♙', 'Customers'],
  ['sessions', '▤', 'Sessions'],
  ['payments', '＄', 'Payments'],
]

export default function Sidebar({ theme, onToggleTheme }) {
  const [active, setActive] = useState('dashboard')
  const lockUntil = useRef(0)

  // Highlight the section that is crossing a band near the top of the viewport.
  // After a click the highlight is locked briefly so smooth scrolling doesn't flicker it.
  useEffect(() => {
    const visible = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        if (Date.now() < lockUntil.current || visible.size === 0) return
        setActive((cur) => (visible.has(cur) ? cur : links.map((l) => l[0]).find((id) => visible.has(id))))
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const [id] of links) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <aside className="sidebar">
      <p className="brand">Flow<span>Desk</span></p>
      <p className="menu-label">WORKSPACE</p>
      <nav aria-label="Workspace sections">
        {links.map(([id, icon, label]) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? 'location' : undefined}
            onClick={() => {
              lockUntil.current = Date.now() + 900
              setActive(id)
            }}
            className={`nav-link ${active === id ? 'active' : ''}`}
          >
            <span className="nav-icon" aria-hidden="true">{icon}</span> {label}
          </a>
        ))}
      </nav>
      <button type="button" className="theme-toggle" onClick={onToggleTheme}>
        {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
      </button>
      <div className="profile">
        <div className="avatar" aria-hidden="true">F</div>
        <div><strong>Studio Admin</strong><small>Workspace owner</small></div>
      </div>
    </aside>
  )
}
