# Multi-app structure proposal

**Goal:** Static storefront + static admin + minimal serverless only for secret operations (R2 presigned URLs). No Next middleware for admin; no server-side admin route protection; DB writes protected by Supabase RLS. Workflow and preview excluded.

---

## 1. Target folder structure

```
saree-store/
├── apps/
│   ├── storefront/                    # Static public storefront
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── information/
│   │   │   ├── kanchipuram-silks/
│   │   │   └── saree/[slug]/
│   │   ├── components/                # Storefront-only UI (Header, Footer, etc.)
│   │   ├── lib/                       # Storefront-only helpers (media-url, supabase client)
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   └── tsconfig.json
│   │
│   └── admin/                         # Static admin SPA
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── login/
│       │   ├── dashboard/
│       │   ├── products/
│       │   ├── attributes/
│       │   ├── types/
│       │   ├── settings/
│       │   ├── change-password/
│       │   └── (client-side auth only; no middleware)
│       ├── components/                # Admin UI (forms, shells, managers)
│       ├── lib/                       # Admin helpers (supabase server/browser, auth)
│       ├── actions/                   # Server Actions (products, auth, settings, etc.)
│       ├── package.json
│       ├── next.config.mjs
│       └── tsconfig.json
│
├── workers/
│   └── upload-signer/                 # Cloudflare Worker: R2 presigned PUT URLs only
│       ├── src/
│       │   └── index.ts               # POST { storage_key, content_type? } → { put_url, storage_key }
│       ├── wrangler.toml
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                          # (Optional) shared code
│   └── shared/
│       ├── types/                     # database.ts, storefront.types, etc.
│       └── constants/                 # attribute-definitions-shared, etc.
│
├── package.json                       # Root workspace (npm/pnpm workspaces)
└── docs/
```

**Notes:**
- **Storefront** and **admin** are separate Next.js apps; each can be built with `output: 'export'` (storefront) or static export / standard build (admin) and deployed to any static host (Cloudflare Pages, Vercel static, Netlify, etc.).
- **upload-signer** is a single Cloudflare Worker. No Next.js; only the presign logic and R2 credentials. Zero-cost at low volume (Workers free tier).
- **packages/shared** is optional at first; you can duplicate minimal types in each app until you need a monorepo.

---

## 2. Responsibilities

| Part | Responsibility | What it does **not** do |
|------|----------------|-------------------------|
| **apps/storefront** | Public site: home, category pages, product detail, info. Read-only from Supabase (anon). Static export; no server. | No auth, no admin, no upload-sign, no middleware. |
| **apps/admin** | Admin UI: login, dashboard, products CRUD, attributes, types, settings, change password. Uses Supabase Auth (cookies) and Server Actions that call Supabase. Client-side route guard only (redirect to login if no session). | No middleware; no server-side route protection. No R2 credentials; calls upload-signer worker for presigned URLs. |
| **workers/upload-signer** | One job: validate `storage_key`, return presigned PUT URL for R2. Keeps R2 secret key out of admin app. | No file handling, no DB, no auth (admin calls it with auth in header if you add it later). |

---

## 3. What can be reused from the current codebase

- **Storefront:**  
  - `src/storefront/*` (pages, components, services, types) → move into `apps/storefront` (or keep as `packages/storefront` and have app import from it).  
  - `src/lib/data/storefront-specs.ts`, `site-settings.ts`, `storefront-specs` usage.  
  - `src/lib/media-url.ts` (public image URLs).  
  - Cookie-less Supabase client pattern (build-time only, anon key).

- **Admin:**  
  - All `src/app/(admin)/*` routes and `src/components/admin/*`.  
  - All `src/app/actions/*` except preview/workflow (auth, products, settings, types, attribute-definitions, draft-images, cleanup-temp).  
  - `src/lib/supabase/*` (server, browser, middleware-style client for auth).  
  - `src/modules/auth/*`, `src/components/auth/*`.  
  - Product/specs/image modules used by admin: `src/modules/products`, `src/modules/images` (except presign; admin only calls worker), `src/modules/attributes`, etc.  
  - **Do not** reuse: `src/middleware.ts`, `src/app/actions/preview-mode.ts`, preview/preview-data, workflow-specific components (e.g. ProductWorkflowActions if you drop workflow).

- **Upload-signer:**  
  - Logic from `src/app/api/upload-sign/route.ts` (validation + call to get presigned URL).  
  - Presign implementation from `src/modules/images/r2Provider.ts` (`getPresignedPutUrl` + R2 config and signing helpers).  
  - **Do not** ship full `r2Provider` (upload/delete/list) in the worker; only what’s needed to generate a presigned PUT URL.

---

## 4. Mapping: current → new locations

### 4.1 To **apps/storefront**

| Current location | New location |
|------------------|--------------|
| `apps/storefront/app/*` (existing pages/layout) | `apps/storefront/app/*` (keep; fix imports) |
| `src/storefront/*` (index, pages, components, services, types) | `apps/storefront/lib/storefront/` or `apps/storefront/storefront/` (or `packages/storefront`) |
| `src/lib/data/storefront-specs.ts` | `apps/storefront/lib/data/storefront-specs.ts` (or shared package) |
| `src/lib/data/site-settings.ts` | `apps/storefront/lib/data/site-settings.ts` (or shared) |
| `src/lib/media-url.ts` | `apps/storefront/lib/media-url.ts` |
| `src/lib/data/storefront-specs.ts` + `getPublicImageUrl` usage | Same; storefront uses only anon Supabase + public R2 URLs |
| Storefront Supabase client (cookie-less) | `apps/storefront/lib/supabase/client.ts` (from `src/storefront/services/supabase.client.ts`) |
| `src/modules/storefront/*` (if used only by storefront) | `apps/storefront/lib/storefront/` or keep in shared and import from storefront app |

**Storefront-specific:**  
- No `src/app/(store)/*` from root app (those are replaced by current `apps/storefront` pages).  
- No `middleware`, no `api/`, no `actions/` (except any future read-only spec helpers you choose to move into storefront as serverless if you ever add a single serverless route).

### 4.2 To **apps/admin**

| Current location | New location |
|------------------|--------------|
| `src/app/(admin)/admin/*` (all admin routes) | `apps/admin/app/*` (layout, login, dashboard, products, attributes, types, settings, change-password) |
| `src/components/admin/*` | `apps/admin/components/admin/*` |
| `src/components/auth/*` | `apps/admin/components/auth/*` |
| `src/app/actions/auth.ts` | `apps/admin/actions/auth.ts` |
| `src/app/actions/products.ts` | `apps/admin/actions/products.ts` |
| `src/app/actions/settings.ts` | `apps/admin/actions/settings.ts` |
| `src/app/actions/types.ts` | `apps/admin/actions/types.ts` |
| `src/app/actions/attribute-definitions.ts` | `apps/admin/actions/attribute-definitions.ts` |
| `src/app/actions/draft-images.ts` | `apps/admin/actions/draft-images.ts` |
| `src/app/actions/cleanup-temp.ts` | `apps/admin/actions/cleanup-temp.ts` |
| `src/app/actions/specs.ts` | `apps/admin/actions/specs.ts` (if admin needs it) |
| `src/lib/supabase/server.ts` | `apps/admin/lib/supabase/server.ts` |
| `src/lib/supabase/browser.ts` | `apps/admin/lib/supabase/browser.ts` |
| `src/lib/supabase/client.ts` | `apps/admin/lib/supabase/client.ts` |
| `src/modules/auth/*` | `apps/admin/lib/auth/` or `apps/admin/modules/auth/` |
| `src/modules/products/*` | `apps/admin/modules/products/` |
| `src/modules/images/*` (except presign; use worker) | `apps/admin/modules/images/` (image.service for non-presign: upload proxy if any, delete, head; admin calls worker for presign) |
| `src/modules/attributes/*` | `apps/admin/modules/attributes/` |
| `src/modules/storefront/*` (only if admin needs read for dropdowns etc.) | `apps/admin/modules/storefront/` or shared |
| `src/lib/media-url.ts` | `apps/admin/lib/media-url.ts` (for displaying image URLs in admin) |
| `src/lib/data/attribute-definitions.ts` | `apps/admin/lib/data/attribute-definitions.ts` |
| `src/lib/data/attribute-definitions-shared.ts` | `packages/shared` or `apps/admin/lib/data/` |
| `src/lib/data/site-settings.ts` (if admin edits settings) | `apps/admin/lib/data/site-settings.ts` or shared |
| `src/types/database.ts` | `packages/shared/types/` or copy into `apps/admin/types/` |
| **Do not move** | `src/middleware.ts` (delete for admin; client-side guard only) |
| **Do not move** | `src/app/actions/preview-mode.ts`, `src/lib/preview-data.ts`, PreviewBar, OpenPreviewButton, ProductWorkflowActions (excluded) |

**Upload-sign in admin:**  
- Admin UI continues to call “upload sign” via **absolute URL** to the worker (e.g. `UPLOAD_SIGNER_URL` env).  
- Replace `fetch("/api/upload-sign", ...)` with `fetch(\`${process.env.NEXT_PUBLIC_UPLOAD_SIGNER_URL}/sign\`, ...)` (or similar path) in `ProductImageUploader`, `ProductImageManager`, `DraftImageManager`.

### 4.3 To **workers/upload-signer**

| Current location | New location |
|------------------|--------------|
| `src/app/api/upload-sign/route.ts` (request validation, key rules, response shape) | `workers/upload-signer/src/index.ts` (POST handler) |
| `src/modules/images/r2Provider.ts`: `getPresignedPutUrl`, `getConfig`, signing helpers (`sha256Hex`, `hmacSha256`, etc.), `getEndpoint` | `workers/upload-signer/src/r2-presign.ts` (or inline in index); env: R2 account, bucket, access key, secret key |
| **Do not** move | Full `r2Provider` (upload/delete/list/head/download); worker only signs PUTs |

---

## 5. Zero-cost / startup-friendly choices

- **Storefront:** Static export → host on Cloudflare Pages, Netlify, or Vercel static. No server runtime cost.  
- **Admin:** Static or standard Next build; host on same or separate static/CDN. No middleware = no edge/server needed for route protection; auth is client-side redirect + Supabase RLS.  
- **Upload-signer:** Single Cloudflare Worker; free tier is generous. No DB, no file streaming.  
- **Supabase:** Auth + Postgres + RLS; free tier.  
- **R2:** Storage + optional public bucket; pay-for-use, no egress to internet if using R2 public URL.  
- Optional **packages/shared** keeps duplication low without forcing a heavy monorepo; you can start without it and add when you have two apps sharing types.

---

## 6. First migration step

Recommended order:

1. **Create `workers/upload-signer` and deploy**
   - New Cloudflare Worker: copy validation from `src/app/api/upload-sign/route.ts` and presign logic from `src/modules/images/r2Provider.ts`.
   - Env: R2 credentials (same as today). No auth on the worker initially (admin is not public; you can add a simple secret header later if needed).
   - Deploy and get URL (e.g. `https://upload-signer.<your-subdomain>.workers.dev`).

2. **Point admin at the worker (before splitting apps)**
   - In the **current** monorepo/root app, add env `NEXT_PUBLIC_UPLOAD_SIGNER_URL`.
   - In `ProductImageUploader`, `ProductImageManager`, `DraftImageManager`: if `NEXT_PUBLIC_UPLOAD_SIGNER_URL` is set, call it instead of `/api/upload-sign`; else fallback to `/api/upload-sign`.
   - Verify admin uploads still work with the worker. Then you can remove `src/app/api/upload-sign/route.ts` from the root app.

3. **Extract `apps/admin` from current root**
   - Create `apps/admin` with Next.js, move `(admin)` routes, components, actions, and the modules/lib listed above.  
   - Remove middleware usage; add client-side “session check + redirect to login” in admin layout or shell.  
   - Admin uses `NEXT_PUBLIC_UPLOAD_SIGNER_URL` only (no local upload-sign route).  
   - Root app can become storefront-only or be deprecated in favor of `apps/storefront`.

4. **Align storefront**
   - Ensure `apps/storefront` uses only the storefront package (or in-app storefront lib), build with static export, and has no dependency on root `src/app/(store)` or middleware.

This keeps one deployable unit (worker) first, then splits admin from the current app without big-bang.

---

## 7. Risks to watch for

| Risk | Mitigation |
|------|------------|
| **Admin route protection** | No middleware means anyone can open `/admin/products` etc. RLS and Supabase Auth still protect data. Use client-side redirect to login when `getSession()` is null; sensitive mutations already go through Server Actions with server-side `getSession()`. |
| **CORS** | Upload-signer worker must allow admin origin in CORS for `fetch()` from the browser. Configure `Access-Control-Allow-Origin` (or use a proxy in admin if you add one later). |
| **Upload-signer auth** | Worker today has no auth. If the worker URL is public, anyone could get presigned URLs for valid key patterns. Mitigate: (1) restrict key patterns tightly (temp/, product IDs), (2) add a shared secret header from admin, or (3) short-lived presigned URLs (you already have 1h). |
| **Duplicate types** | Without `packages/shared`, database and product types live in both apps. Keep one source of truth (e.g. admin) and copy into storefront until you introduce a shared package; or add shared from day one. |
| **Storefront build-time Supabase** | Storefront needs Supabase anon key at build time for static data. Ensure CI/build env has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; no secret key. |
| **Admin Server Actions and cookies()** | Admin remains a Next app with Server Actions that use `cookies()`. Deploy admin as a Node server (e.g. Vercel, or a minimal Node server) so that Server Actions and cookie-based auth work. Do not use static export for admin if you rely on Server Actions. |
| **Path/import breaks** | When moving files, `@/` and relative imports will break. Prefer a single “move” step per app and fix imports in one pass; or introduce path aliases that mirror the new structure. |
| **Preview/workflow removed** | Components that depend on `preview-mode` or workflow will break once those are removed. Remove or stub those components (e.g. PreviewBar, OpenPreviewButton, ProductWorkflowActions) in the admin app. |

---

## Summary

- **apps/storefront:** Static site; current `apps/storefront` + code from `src/storefront` and storefront-only lib/data; no auth, no API, no middleware.  
- **apps/admin:** Full admin UI and Server Actions; auth via Supabase (cookies); no middleware; calls **workers/upload-signer** for R2 presigned URLs.  
- **workers/upload-signer:** Single endpoint, presign only; R2 credentials live here only.  
- First step: implement and deploy the worker, switch current app to use it, then extract admin into `apps/admin` and rely on RLS + client-side redirect for “protection” of admin routes.
