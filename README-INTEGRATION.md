# Running the frontend

This environment couldn't reach the npm registry to install packages
(same restriction as Composer on the backend), so `node_modules` isn't
here — install on your own machine where you do have internet.

## 1. Install

```bash
cd expense-web
npm install
cp .env.example .env
```

Edit `.env` and set `VITE_API_URL` to your server's actual LAN IP (the same
one used for `SANCTUM_STATEFUL_DOMAINS` on the backend), e.g.
`http://192.168.1.42:8000`.

## 2. Run it

```bash
npm run dev
```

`--host 0.0.0.0` is already baked into the `dev` script, so this is
reachable from your phone at `http://<server-lan-ip>:5173` as soon as the
backend's CORS/Sanctum config allows that origin.

## 3. Try it on your phone

- Android: open the URL above in Chrome → menu → "Add to Home screen."
- iOS: open it in Safari → Share → "Add to Home Screen."

Both install the PWA (manifest + service worker from `vite-plugin-pwa`) so
it opens full-screen without browser chrome, like a native app icon.

## 4. Build for a permanent install

```bash
npm run build   # outputs to dist/
```

Serve `dist/` from the same host as the API (e.g. Nginx alongside PHP-FPM)
once you're past `php artisan serve` for daily use — see the backend
README's phase 10 notes.

## What's wired up

Auth (login/signup/logout via Sanctum cookies), the invitation-accept flow
at `/invitations/:token`, the Dashboard with live envelope cards and a
one-thumb quick-add expense form, Income logging, Budgets (category
creation + monthly allocation), Expenses list with filters, Members
(Admin-only invite/role management), and Reports (3-month ledger + PDF/print
export links).

Every screen uses React Query — logging an expense or income invalidates
the relevant queries and every screen showing those numbers re-renders
itself automatically, with no page reload and no manual "refresh" button
anywhere in the app.

Icons in `public/icons/` are placeholders generated for this pass — swap
them for real artwork whenever you like, the manifest already points at
the right filenames.
