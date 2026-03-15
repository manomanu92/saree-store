# Saree Store – Architecture Document

**Purpose:** Shareable reference for LLM or human review. Describes the current architecture as implemented (no aspirational design).

**Stack:** Next.js 14 (App Router), TypeScript, Supabase (Auth + Postgres), Cloudflare R2 (images). Target: near-zero runtime cost for public traffic.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Public storefront (/, /kanchipuram-silks, /saree/[slug])               │
│  • Renders from cached/static-friendly pages (revalidate 3600)          │
│  • Product data: Server Components → Supabase (server client)           │
│  • Images: direct R2/CDN URLs (getPublicImageUrl) — no app proxy         │
│  • Admin preview: optional lazy chunk (HomePreviewBridge, etc.)         │
├─────────────────────────────────────────────────────────────────────────┤
│  Admin (/admin/*)                                                        │
│  • Protected by middleware (Supabase session)                           │
│  • Upload: GET presigned URL from app → PUT file directly to R2         │
│  • Temp cleanup: Server Action (no /api/cleanup-temp)                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP (Server / Edge)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Middleware        → Session from Supabase Auth; /admin protection        │
│  Server Components → createClient() (Supabase server), storefront reads   │
│  Server Actions    → Auth, products, draft-images, settings, cleanup    │
│  API routes        → POST /api/upload-sign only (presigned PUT URL)      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Supabase         │    │  Supabase        │    │  Cloudflare R2   │
│  Auth             │    │  Postgres        │    │  (product images)│
│  • signInWithPwd  │    │  • products       │    │  • Presigned PUT │
│  • session/cookies│    │  • product_images │    │  • Public bucket │
│  • profiles.role  │    │  • product_drafts │    │  • Direct URLs   │
│  (preview-mode)   │    │  • types, etc.   │    │  (no proxy)      │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 2. Directory Structure (Source of Truth)

```
src/
├── app/
│   ├── (store)/                    # Public storefront route group
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Homepage (server: live data only)
│   │   ├── StorefrontHomePage.tsx   # Client; lazy-loads HomePreviewBridge
│   │   ├── HomePreviewBridge.tsx    # Admin preview (draft data) – lazy chunk
│   │   ├── kanchipuram-silks/
│   │   │   ├── page.tsx
│   │   │   ├── StorefrontListingPage.tsx
│   │   │   └── KanchipuramSilksClient.tsx
│   │   ├── saree/[slug]/
│   │   │   ├── page.tsx
│   │   │   └── StorefrontDetailPage.tsx
│   │   ├── login/page.tsx
│   │   └── information/page.tsx
│   ├── (admin)/                    # Admin route group
│   │   ├── layout.tsx               # getSession(); redirect if not admin
│   │   └── admin/
│   │       ├── page.tsx, dashboard/, login/, change-password/
│   │       ├── products/, products/new/, products/[id]/edit/
│   │       ├── types/, attributes/, settings/
│   │       └── login/AdminLoginMessage.tsx
│   ├── actions/
│   │   ├── auth.ts                  # login, logout, changePassword
│   │   ├── products.ts               # CRUD, workflow, revalidatePath
│   │   ├── draft-images.ts
│   │   ├── attribute-definitions.ts
│   │   ├── settings.ts
│   │   ├── types.ts
│   │   ├── preview-mode.ts          # Cookie-based admin preview
│   │   ├── cleanup-temp.ts          # Server actions (no API route)
│   │   └── specs.ts                 # getProductSpecsForDisplayAction
│   ├── api/
│   │   └── upload-sign/route.ts     # POST: presigned PUT URL for R2 (only API route)
│   ├── update-password/page.tsx     # Password reset (hash-based)
│   ├── layout.tsx
│   └── globals.css
├── modules/                         # Feature / business logic
│   ├── auth/
│   │   ├── auth.service.ts          # getSession, getSessionFromRequest, requireAdmin, isAdminRoute
│   │   └── index.ts
│   ├── images/
│   │   ├── image.service.ts         # getPresignedPutUrl, getProductImageUrl, upload, download, head, deleteByKey, list
│   │   ├── r2Provider.ts            # R2 S3-compatible API; getR2PublicUrl
│   │   ├── image.types.ts
│   │   ├── temp-upload-helpers.ts   # finalizeTempUploads, cleanupTempUploadsByKeys, cleanupAbandonedTempUploads
│   │   └── index.ts
│   └── storefront/
│       ├── storefront.repository.ts # listApprovedProducts, getApprovedProductBySlug (Supabase)
│       ├── storefront.service.ts    # listProducts, getProductBySlug, getCarouselImageUrls, listProductsForHomepage
│       ├── storefront.types.ts
│       └── index.ts
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 # createClient() for Server Components / Actions
│   │   ├── browser.ts
│   │   ├── client.ts
│   │   └── middleware.ts
│   ├── data/
│   │   ├── sarees.ts                # Facade → storefront.service
│   │   ├── attribute-definitions.ts
│   │   ├── attribute-definitions-shared.ts
│   │   └── site-settings.ts
│   ├── media-url.ts                 # getPublicImageUrl, getMediaUrl (direct R2 only; no image proxy)
│   ├── preview-data.ts              # loadProductForPreview, loadProductsForPreview (draft merge)
│   ├── types.ts                     # Saree, SareeImage
│   ├── utils.ts
│   └── auth/
│       ├── session.ts               # Re-export from modules/auth
│       └── index.ts
├── components/
│   ├── admin/                       # ProductForm, ProductImageUploader, PreviewBar, etc.
│   ├── auth/                        # LoginForm, UpdatePassword, ChangePasswordForm
│   ├── layout/                      # PublicHeader, PublicFooter, Container
│   ├── saree/                       # SareeCard, SareeGallery, PriceLine, ProductSpecifications
│   └── sections/                   # SignatureCarousel, BrandStory, CuratedPreviewGrid, TopBrandBar
├── types/
│   └── database.ts
└── middleware.ts                    # Admin route protection via getSessionFromRequest
```

---

## 3. Authentication & Authorization

- **Provider:** Supabase Auth (email/password). Session in HTTP-only cookies via `@supabase/ssr`.
- **Middleware:** For paths under `/admin`, runs `getSessionFromRequest(request)`. If no user or not admin → redirect to `/admin/login` with `?next=`. Login page is allowed without session.
- **Admin layout:** Uses `getSession()` (server). If no user or `user.role !== "admin"` → redirect to login. **Note:** `auth.service` currently returns `role: "admin"` for any logged-in user; it does not read `profiles.role`. Preview-mode and RLS policies use `profiles.role = 'admin'`.
- **Key files:** `src/modules/auth/auth.service.ts`, `src/app/actions/auth.ts`, `src/middleware.ts`, `src/app/(admin)/admin/layout.tsx`.
- **Flows:** Login → `signInWithPassword` → redirect. Logout → `signOut` → redirect. Change password → `updateUser({ password })` (change-password page). Password reset → `/update-password` (hash-based).

---

## 4. Data Flow

### 4.1 Public storefront (zero-cost intent)

- **Pages:** `(store)/page.tsx`, `kanchipuram-silks/page.tsx`, `saree/[slug]/page.tsx`. All use `revalidate = 3600`; no `cookies()` in server data path so responses can be cached.
- **Data:** Server fetches via `lib/data/sarees.ts` → `modules/storefront/storefront.service` → `storefront.repository` (Supabase). Only `status = 'approved'` and `is_discontinued = false`.
- **Images:** URLs built with `getPublicImageUrl(storageKey)` (in `lib/media-url.ts` and storefront.service). Direct R2 base URL only; no image proxy API. Requires `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE_URL` (or server-side equivalent).
- **Revalidation:** After product create/update/approve/discontinue/draft-approve, `revalidatePath("/")`, `revalidatePath("/kanchipuram-silks")`, and `revalidatePath(\`/saree/${slug}\`)` in `app/actions/products.ts`.

### 4.2 Admin product CRUD & images

- **Products:** Server Actions in `app/actions/products.ts` (create, update, workflow, drafts). Supabase `products`, `product_images`, `product_drafts`, etc.
- **Image upload:** Client requests presigned URL from `POST /api/upload-sign` with `{ storage_key, content_type? }`. Then `PUT` file to returned `put_url` (browser → R2). No file through Next.js.
- **Temp uploads:** Keys like `temp/<sessionId>/<uuid>.<ext>`. On product create, `finalizeTempUploads` (from `modules/images/temp-upload-helpers`) copies temp → `productId/...` and deletes temp. Cleanup: `cleanupTempUploadsByKeysAction` / `cleanupAbandonedTempUploadsAction` in `app/actions/cleanup-temp.ts` (no API route).

### 4.3 Admin preview on storefront

- **Cookie:** `admin_preview_mode` (set by preview-mode actions; admin-only).
- **Storefront pages:** Server always fetches live data. Client can lazy-load a “preview bridge” (e.g. `HomePreviewBridge`) that calls `getPreviewModeStatus()` and, if preview on, `loadProductsForPreview` / `loadProductForPreview` and swaps UI to draft-merged data.
- **Preview data:** `lib/preview-data.ts` merges `product_drafts` with live products when cookie is set and user is admin (via `profiles.role`).

---

## 5. API Routes (Current)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/upload-sign` | POST | Return presigned PUT URL for R2. Only API route; required for admin uploads (browser → R2 without sending file through app). |

There is no `/api/media` (removed); storefront and admin both use direct R2 URLs via `getPublicImageUrl` / `getMediaUrl`. There is no `/api/cleanup-temp`; cleanup is done via Server Actions only.

---

## 6. Environment & Configuration

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Used for Auth and Postgres.
- **R2:** `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET`. For presigning and optional server-side operations.
- **R2 public URLs:** `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE_URL` or `CLOUDFLARE_R2_PUBLIC_BASE_URL`. Required for storefront image URLs (direct R2/CDN).
- **Next.js images:** `next.config.mjs` uses `remotePatterns` for `*.r2.dev`. Custom domain needs an extra pattern if used.

---

## 7. Database (Supabase Postgres)

- **Auth:** `auth.users` (Supabase built-in). Optional `public.profiles` (e.g. `user_id`, `role`) for admin check in preview and RLS.
- **Core:** `products` (with status, is_discontinued, slug, etc.), `product_images` (storage_key, sort_order, is_primary, show_on_homepage), `product_drafts`, `product_attribute_values`, `attribute_definitions`, `types`, `store_settings`, `site_settings`. Migrations live under `supabase/migrations/`.

---

## 8. Conventions for Reviewers

- **Storefront:** Use `getPublicImageUrl` and direct R2 URLs only; no image proxy API.
- **Admin images:** Use `getMediaUrl` (same behaviour as getPublicImageUrl: direct R2 only). R2 public base URL must be set for admin to see images.
- **Uploads:** Browser → presigned URL from `/api/upload-sign` → PUT to R2. Only API route is `/api/upload-sign`.
- **Cleanup:** Server Actions in `app/actions/cleanup-temp.ts` only; no cleanup API route.
- **Auth:** Supabase Auth + middleware + admin layout. `profiles.role` used in preview and RLS; middleware/admin layout currently treat any logged-in user as admin in code (no profile check there).
- **Revalidation:** After product mutations, `revalidatePath` for `/`, `/kanchipuram-silks`, and `/saree/[slug]` as appropriate.

This document reflects the codebase as of the last review. Use it to review or recommend changes (e.g. tightening admin check to `profiles.role`).
