import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Single source of truth for the production security headers.
// - A <meta> CSP is injected into index.html (works on any static host).
// - A Netlify `_headers` file is emitted into dist/ with the same policy plus the
//   directives and headers that a <meta> tag cannot carry (frame-ancestors, HSTS, ...).
// Neither is applied by the dev server, which needs inline scripts for hot reload.
const directives = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]
const metaCsp = directives.join('; ')
const headerCsp = [...directives, "frame-ancestors 'none'", 'upgrade-insecure-requests'].join('; ')

const headersFile = `/*
  Content-Security-Policy: ${headerCsp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`

const securityPlugin = () => ({
  name: 'flowdesk-security',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: metaCsp }, injectTo: 'head-prepend' },
  ],
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: '_headers', source: headersFile })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), securityPlugin()],
})
