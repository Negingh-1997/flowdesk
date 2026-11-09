import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { sanitizeTheme } from './utils/sanitize.js'

// Apply the saved theme before the first paint so light-mode users don't see a dark flash.
// (An inline <script> in index.html would be blocked by the CSP, so it lives here.)
try {
  document.documentElement.dataset.theme = sanitizeTheme(JSON.parse(localStorage.getItem('fd-theme'))) ?? 'dark'
} catch {
  document.documentElement.dataset.theme = 'dark'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
