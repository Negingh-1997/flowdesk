import './App.css'
import { useEffect, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage.js'
import useWorkspace from './hooks/useWorkspace.js'
import Sidebar from './components/Sidebar.jsx'
import StatCards from './components/StatCards.jsx'
import RevenueChart from './components/RevenueChart.jsx'
import CustomerForm from './components/CustomerForm.jsx'
import CustomerList from './components/CustomerList.jsx'
import SessionPanel from './components/SessionPanel.jsx'
import PaymentPanel from './components/PaymentPanel.jsx'
import { sanitizeTheme } from './utils/sanitize.js'
import { formatMoney } from './utils/format.js'

const THEME_COLORS = { dark: '#0b1220', light: '#f1f5f9' }

function App() {
  const ws = useWorkspace()
  const [theme, setTheme] = useLocalStorage('fd-theme', 'dark', sanitizeTheme)
  const [customerForm, setCustomerForm] = useState(null) // { customer, nonce } while open

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])

  const openCustomerForm = (customer = null) =>
    setCustomerForm((prev) => ({ customer, nonce: (prev?.nonce ?? 0) + 1 }))

  const deleteCustomer = (id) => {
    if (customerForm?.customer?.id === id) setCustomerForm(null)
    ws.deleteCustomer(id)
  }

  return (
    <div className="app">
      <a className="skip-link" href="#customers">Skip to customers</a>
      <Sidebar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <main className="main-content">
        <div id="dashboard">
          <header className="topbar">
            <div>
              <p className="eyebrow">WORKSPACE / OVERVIEW</p>
              <h1>Dashboard</h1>
              <p className="topbar-subtitle">A clear view of your clients, schedule and revenue.</p>
            </div>
            <div className="topbar-actions">
              <span className="demo-chip">DEMO WORKSPACE</span>
              <button className="primary-button" type="button" onClick={() => openCustomerForm()}>+ New customer</button>
            </div>
          </header>

          {customerForm && (
            <CustomerForm
              key={customerForm.nonce}
              customer={customerForm.customer}
              onSave={(d) => ws.saveCustomer(d, customerForm.customer)}
              onClose={() => setCustomerForm(null)}
            />
          )}

          <section className="welcome">
            <div>
              <p className="eyebrow">YOUR BUSINESS AT A GLANCE</p>
              <h2>Welcome back!</h2>
              <p>Manage your customers, sessions and payments in one place.</p>
              <span className="demo-note">Demo data is saved in this browser only.</span>
            </div>
            <div className="welcome-mark" aria-hidden="true">F.</div>
          </section>

          <StatCards
            items={[
              ['Total customers', ws.customers.length, 'Active clients'],
              ['Upcoming sessions', ws.upcomingCount, 'Not completed yet'],
              ['Payments received', formatMoney(ws.totalRevenue), 'All time'],
              ['Outstanding balance', formatMoney(ws.outstanding), 'Still to collect'],
            ]}
          />

          <RevenueChart payments={ws.payments} />
        </div>

        <CustomerList
          customers={ws.customers}
          paidBy={ws.paidBy}
          onEdit={openCustomerForm}
          onDelete={deleteCustomer}
        />

        <section className="content-grid">
          <SessionPanel
            sessions={ws.sessions}
            customers={ws.customers}
            nameOf={ws.nameOf}
            today={ws.today}
            onSave={ws.saveSession}
            onToggle={ws.toggleSession}
            onDelete={ws.deleteSession}
          />
          <PaymentPanel
            payments={ws.payments}
            customers={ws.customers}
            nameOf={ws.nameOf}
            today={ws.today}
            onSave={ws.savePayment}
            onDelete={ws.deletePayment}
          />
        </section>
      </main>
    </div>
  )
}

export default App
