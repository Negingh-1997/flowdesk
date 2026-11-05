# FlowDesk

A clean business dashboard for small studios and freelancers: manage **customers**, **sessions** and **payments** in one place.

## Features
- Add / delete customers, with live search
- Track each customer's fee, amount paid and remaining balance
- Schedule sessions and mark them as done
- Record payments linked to customers
- Dashboard stats update automatically
- Data is saved in the browser (localStorage)
- Responsive layout

## Tech
React 19 · Vite · custom hook (`useLocalStorage`) · plain CSS

## Run locally
```bash
npm install
npm run dev
```

## Security notes
- No `dangerouslySetInnerHTML` / `eval`; React escapes all rendered text.
- Data read from localStorage is validated and cleaned on load (corrupted or edited data cannot crash the app); writes are wrapped in try/catch.
- Production builds ship a strict Content-Security-Policy; no third-party requests (Google Fonts removed, system font fallback is used).
- Inputs are trimmed and length-limited; IDs use `crypto.randomUUID()`.
- **Not solved client-side:** there is no authentication, and customer data is stored unencrypted in the browser. Do not use it for real customer data until a backend with login (and server-side storage) is added. Also set `X-Frame-Options` / `frame-ancestors` as HTTP headers when you deploy.

## Roadmap
Edit forms, charts, React Router pages, backend API.
