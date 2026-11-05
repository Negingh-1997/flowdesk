import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Content-Security-Policy is injected only in production builds:
// the dev server needs inline scripts for hot reload, which this policy would block.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const cspPlugin = () => ({
  name: 'flowdesk-csp',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
  ],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin()],
})
