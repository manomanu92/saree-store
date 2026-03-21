# Repository documentation

**App-specific docs** (canonical for each deployable) live **inside each app folder**:

| App | Location |
|-----|----------|
| **Storefront** (static Next.js) | [`apps/storefront/README.md`](../apps/storefront/README.md) · [`apps/storefront/docs/`](../apps/storefront/docs/) |
| **Admin** | [`apps/admin/README.md`](../apps/admin/README.md) · [`apps/admin/docs/`](../apps/admin/docs/) — Cloudflare: [`DEPLOY_CLOUDFLARE.md`](../apps/admin/docs/DEPLOY_CLOUDFLARE.md) |
| **Upload-signer** (Cloudflare Worker) | [`apps/upload-signer/README.md`](../apps/upload-signer/README.md) — Cloudflare: [`DEPLOY_CLOUDFLARE.md`](../apps/upload-signer/docs/DEPLOY_CLOUDFLARE.md) |

The files below are **cross-cutting** or historical architecture notes for the whole monorepo:

- `ARCHITECTURE.md`
- `MULTI_APP_STRUCTURE_PROPOSAL.md`
- `ZERO_COST_MIGRATION.md`
- `PREVIEW_MODE.md`
- Others as listed in this directory

When storefront-, admin-, or worker-only instructions conflict with these, prefer the **README / docs under `apps/<name>/`**.
