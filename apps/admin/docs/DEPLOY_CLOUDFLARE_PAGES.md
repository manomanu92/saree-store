# Deploy admin to Cloudflare Pages (GitHub Actions)

The admin app uses **`output: "export"`** (static `out/`). CI builds Next.js, then uploads **`apps/admin/out`** to **Cloudflare Pages** via [cloudflare/pages-action](https://github.com/cloudflare/pages-action).

---

## 1. Pages project name (no special “Direct Upload” step)

Cloudflare’s dashboard changes often; you **do not** need a legacy **“Direct Upload”** menu item.

**Pick a project name** (default in our workflow: **`saree-admin`**) and set GitHub variable **`CLOUDFLARE_PAGES_PROJECT_NAME`** if you use a different name.

Then either:

- **Let the first deploy create it:** With a token that has **Cloudflare Pages → Edit**, the first successful **`cloudflare/pages-action`** run often **creates** the Pages project automatically if it does not exist yet, **or**
- **Create an empty project first:** **Workers & Pages** → **Create** / **Create application** → choose **Pages** and finish the wizard until you have a project whose **name** matches `CLOUDFLARE_PAGES_PROJECT_NAME` (you can connect Git later or leave it disconnected — GitHub Actions uploads the `out/` folder).

If the workflow errors with “project not found”, create the project manually once with that exact name, then re-run the workflow.

---

## 2. API token (Pages + account)

Use a Cloudflare **API token** that can deploy to Pages:

- **Account** → **Cloudflare Pages** → **Edit**
- **Account** → **Account Settings** → **Read** (if required)

Or extend the token you use for **upload-signer** with **Cloudflare Pages → Edit** so one token can deploy both.

Store as GitHub secret: **`CLOUDFLARE_API_TOKEN`**.

Also add **`CLOUDFLARE_ACCOUNT_ID`** (Workers & Pages → overview → **Account ID**).

---

## 3. GitHub secrets (build-time env)

`NEXT_PUBLIC_*` values are **baked in at build time**. Set them under **Repository → Settings → Secrets and variables → Actions**.

### Required

| Secret | Purpose |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `NEXT_PUBLIC_UPLOAD_SIGNER_URL` | Base URL of **upload-signer** Worker (no trailing slash) |

### Optional

| Secret | Purpose |
|--------|--------|
| `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE_URL` | Public R2/custom domain base for image URLs (if you use it) |
| `NEXT_PUBLIC_SITE_URL` | Canonical admin URL (if your app uses it) |

See also [ENVIRONMENT.md](./ENVIRONMENT.md).

---

## 4. GitHub variable (project name)

**Settings → Secrets and variables → Actions → Variables** (not a secret):

| Variable | Purpose |
|----------|--------|
| `CLOUDFLARE_PAGES_PROJECT_NAME` | Must match the **Cloudflare Pages** project name. If unset, the workflow defaults to **`saree-admin`**. |

---

## 5. Workflow file

**`.github/workflows/deploy-admin.yml`**

Runs on push to **`main`** when **`apps/admin/**` changes (or manual **Run workflow**).

Steps: `npm ci` → `npm run build` in `apps/admin` → **Publish** `apps/admin/out` to Pages.

---

## 6. Upload-signer CORS

After the admin has a Pages URL (e.g. `https://saree-admin.pages.dev` or a custom domain), add that **origin** to the Worker:

- GitHub secret **`UPLOAD_SIGNER_CORS_ORIGINS`** on the upload-signer workflow, **or**
- Worker variable **`CORS_ORIGINS`** in the Cloudflare dashboard,

so the browser can call `POST /sign-upload` from the deployed admin.

---

## 7. Custom domain (optional)

Cloudflare Pages → your project → **Custom domains** → add domain and complete DNS.

Update **`NEXT_PUBLIC_SITE_URL`** (if used) and **CORS** on upload-signer to include the new origin.

---

## Troubleshooting

| Issue | Check |
|--------|--------|
| Pages deploy 403 / failed | API token includes **Cloudflare Pages → Edit** |
| Build fails “missing NEXT_PUBLIC_*” | All three required secrets set in GitHub |
| Upload fails in deployed admin | `NEXT_PUBLIC_UPLOAD_SIGNER_URL` correct; Worker **CORS** includes admin origin |
| Wrong project | `CLOUDFLARE_PAGES_PROJECT_NAME` matches Cloudflare project name |

### Upload-signer returns **403 Forbidden** on `POST /sign-upload`

The worker only returns **403** when the JWT **verifies** but **`role` is not `admin`** in the token (`app_metadata` or `user_metadata`).

1. In **Supabase** → **Authentication** → **Users** → your user → set **App metadata** / raw JSON so `role` is **`admin`**, **or** run SQL on `auth.users` / `raw_app_meta_data` (see [ENVIRONMENT.md](./ENVIRONMENT.md)).
2. **Sign out** of the admin app and **sign in again** so the browser gets a **new access token** (old sessions won’t include the new metadata).

### Upload-signer returns **401** on `POST /sign-upload`

The JWT **did not verify** with the Worker’s **`SUPABASE_JWT_SECRET`**.

1. In **Supabase** → **Settings** → **API** → copy **JWT Secret** (long string).
2. In **Cloudflare** → **Workers** → **upload-signer** → **Settings** → **Variables** → confirm secret **`SUPABASE_JWT_SECRET`** matches **exactly** (same Supabase project as the admin’s `NEXT_PUBLIC_SUPABASE_URL`).
3. If you deploy secrets from GitHub, update the **`SUPABASE_JWT_SECRET`** repository secret and re-run the upload-signer workflow.

### Browser shows **CORS** error (no response body)

If **`CORS_ORIGINS`** on the worker is set, it must include your **exact** admin origin (e.g. `https://saree-admin.pages.dev` — **no** path). If unset, the worker allows any origin (dev only).

---

## Related

- [ENVIRONMENT.md](./ENVIRONMENT.md) — local `.env.local` and Supabase admin role  
- [../../upload-signer/docs/DEPLOY_FROM_GITHUB.md](../../upload-signer/docs/DEPLOY_FROM_GITHUB.md) — upload-signer from GitHub  
- [../../upload-signer/docs/TESTING.md](../../upload-signer/docs/TESTING.md) — curl tests  

