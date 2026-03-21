# Deploy admin on Cloudflare

The admin app is **Next.js 15** (App Router, server actions, Supabase). You can run it on **Cloudflare Pages** using Cloudflare’s Next.js support, or deploy the same app elsewhere (e.g. Vercel). This guide focuses on **Cloudflare**.

> **Pairing:** Deploy **`apps/upload-signer`** first (see `apps/upload-signer/docs/DEPLOY_CLOUDFLARE.md`), then set `NEXT_PUBLIC_UPLOAD_SIGNER_URL` to that Worker’s URL.

## Option A — Cloudflare Pages (recommended path)

Cloudflare documents Next.js deployment here:  
**[Cloudflare Pages – Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/)**

Follow the latest guide for your Next.js version. Typical shape:

1. Connect the Git repo in **Workers & Pages** → **Create** → **Pages** → your repo.
2. **Root directory:** `apps/admin`
3. **Build command** (example — confirm against Cloudflare’s current Next guide):

   ```bash
   npm ci && npm run build
   ```

   Some setups require an extra adapter step (e.g. OpenNext / `@cloudflare/next-on-pages`). Use whatever the official Cloudflare Next.js guide specifies for Next 15.

4. **Build output directory:** As given in that guide (often produced by the adapter, not always `.next` alone).

5. **Environment variables** (Pages → Settings → Environment variables):

   | Variable | Notes |
   |----------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | If your server code uses it — **encrypt / restrict to Production** |
   | **`NEXT_PUBLIC_UPLOAD_SIGNER_URL`** | **Required** — full URL of the upload-signer Worker (see upload-signer deploy doc) |
   | Any other vars your `apps/admin` code expects | Match `.env.local` locally |

6. **Node version:** Set in Pages to match local (e.g. `20` via `NODE_VERSION` or `.nvmrc` if you add one under `apps/admin`).

7. Deploy and open the Pages URL; test login and product image upload (must hit the Worker URL).

## Option B — Admin on Vercel, Cloudflare only for Worker + storefront

Many teams host **admin** on **Vercel** (simple Next.js) and use Cloudflare only for:

- **Storefront** static export → Cloudflare Pages (`apps/storefront`)
- **upload-signer** → Cloudflare Workers

That is valid; set `NEXT_PUBLIC_UPLOAD_SIGNER_URL` in Vercel to the Worker URL.

## CORS and the upload-signer

The admin origin must be allowed by the Worker. Set `CORS_ORIGINS` in the Worker (see upload-signer deploy doc) to your admin URL, e.g.:

`https://your-project.pages.dev`

## Checklist before go-live

- [ ] `apps/upload-signer` deployed; secrets set.
- [ ] `NEXT_PUBLIC_UPLOAD_SIGNER_URL` = Worker base URL (no trailing slash).
- [ ] Worker `CORS_ORIGINS` includes admin URL (or dev-only `*`).
- [ ] Supabase redirect URLs / site URL updated if the admin URL changed.
- [ ] Image upload tested on **production** admin URL.

## Related

- [ENVIRONMENT.md](./ENVIRONMENT.md) — all env vars for admin
- [apps/upload-signer/docs/DEPLOY_CLOUDFLARE.md](../../upload-signer/docs/DEPLOY_CLOUDFLARE.md) — Worker deploy
