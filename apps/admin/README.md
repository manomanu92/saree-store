# Admin (`apps/admin`)

Next.js app for staff: dashboard, products, attributes, types, settings, login. No Next.js middleware; route protection is client + server layout checks.

**Not a pure static site:** it uses **Server Components** and **Server Actions**. For what “fully static” would require vs hosting on Cloudflare with full Next.js, see **[docs/STATIC_EXPORT.md](./docs/STATIC_EXPORT.md)**.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server on **port 3002** |
| `npm run build` | Production build |
| `npm run start` | Serve production (port 3002) |
| `npm run lint` | ESLint |

## Environment variables

See **[docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md)** for the full list.

Minimum for local dev:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (if server actions need it — follow your existing setup)
- **`NEXT_PUBLIC_UPLOAD_SIGNER_URL`** — **Required** for image uploads. Must be the deployed Cloudflare Worker URL (e.g. `https://upload-signer.<account>.workers.dev`). The admin app calls **`apps/upload-signer`** only; there is no in-app presign fallback.

## Documentation (in this app)

| File | Contents |
|------|----------|
| [docs/DEPLOY_CLOUDFLARE.md](./docs/DEPLOY_CLOUDFLARE.md) | **Cloudflare deployment** (Pages + env + upload-signer URL) |
| [docs/STATIC_EXPORT.md](./docs/STATIC_EXPORT.md) | Pure static export vs current server features |
| [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) | Environment variables and secrets |

## Related apps

- **Storefront:** `apps/storefront` — public site (static export).
- **Upload signer:** `apps/upload-signer` — deploy with Wrangler; admin uses `NEXT_PUBLIC_UPLOAD_SIGNER_URL`.
