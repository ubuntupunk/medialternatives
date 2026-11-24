# Temporary Cloudflare Failover Plan — medialternatives.com

**Status**: Ready for cutover approval — Worker deployed and validated on `workers.dev`; production routes untouched  
**Owner**: Dev Team  
**Created**: 2026-11-24  
**Tracking**: `medialternatives-8vv` (failover), `medialternatives-a6n` (Vercel CPU root cause)

---

## 1. Incident summary

Vercel reports:

> Total CPU time of Vercel functions running on Fluid for medialternatives: 6h 20m, 93.7% of the free-tier 4-hour limit.

Production is currently returning:

```text
HTTP/2 402
x-vercel-error: DEPLOYMENT_DISABLED
Payment required

DEPLOYMENT_DISABLED
cpt1::...
```

Confirmed on `/`, `/wp-login.php`, `/xmlrpc.php`, `/sitemap.xml`, and `/api/robots`.

This is an active outage. Code fixes alone will not restore service until Vercel billing/deployment is re-enabled.

---

## 2. Evidence collected

### Cloudflare account and DNS

- Account: `Ubuntupunk@gmail.com's Account`
- Account ID: `17f6081fecc2e14456c47f0628cf17f5`
- Zone: `medialternatives.com`
- Zone ID: `13d78476de4fb4c3dfa307b6ec9760c4`
- Nameservers: `curt.ns.cloudflare.com`, `ulla.ns.cloudflare.com`
- Existing proxied origin:
  - `medialternatives.com` → `A 216.198.79.1`, proxied, comment `vercel verify`
  - `www.medialternatives.com` → CNAME to apex, proxied
- Cloudflare Pages projects: none found
- Existing unrelated Workers: `chat-gpt-muddy-union-9f27`, `mcp-server-chart`, `startup-connect`
- Cloudflare MCP: connected via OAuth for reads; classic token verification still returns `401 / 1000 Invalid API Token`
- Wrangler OAuth login: successful as `ubuntupunk@gmail.com`; this token also works as `CLOUDFLARE_API_TOKEN` for OpenNext/Cloudflare SDK calls

### WordPress.com API

- 1,292 posts (`x-wp-total: 1292`)
- `GET /posts?per_page=100&_embed=true`: 1,295,607 bytes in 14.7s

### Likely CPU drivers on Vercel

Hypothesis, not yet proven because Vercel CLI is unauthenticated here:

- `next.config.ts` rewrite `/:slug` → `/post/:slug` makes any single-segment path eligible for a WordPress lookup before a 404.
- `src/middleware.ts` matches nearly every path except auth/static/image assets.
- ISR revalidation is frequent: 300s on home/blog/category, 600s on posts.
- `_embed: true` is globally enabled and returns very large payloads.
- Bot probes hit `/wp-login.php`, `/xmlrpc.php`, `/sitemap.xml`, and `/api/*`.

---

## 3. Decision

Use **Cloudflare Workers with the OpenNext Cloudflare adapter**, routed by **Workers Routes** in front of the existing proxied Vercel origin.

Rejected alternatives:

- **Custom Domain** — makes the Worker the origin and manages DNS/certificates; rollback requires DNS/origin change.
- **Cloudflare Pages** — no Pages project exists; Cloudflare now recommends Workers for full-stack Next.js.
- **DNS failover** — slower, more error-prone, and unnecessary because the zone is already proxied.

Workers Routes run before the existing proxied origin and can be removed instantly to return traffic to Vercel.

---

## 4. Target architecture

```text
Visitor
   │
   ▼
Cloudflare edge
   │
   ├─ Route: medialternatives.com/*       ─┐
   └─ Route: www.medialternatives.com/*   ─┤
                                             ▼
                               medialternatives-failover Worker
                                             │
                                             ├─ public content served from Worker
                                             └─ unsupported paths:
                                                fetch(request) → Vercel origin
   │
   └─ routes removed ───────────────────────► Vercel origin again
```

No DNS records, nameservers, or Vercel domain settings were changed.

---

## 5. Plan limits and cost

| Item | Workers Free | Workers Paid |
|---|---:|---:|
| Requests | 100,000/day | No daily request cap |
| CPU per HTTP request | 10 ms | 30s default, configurable up to 5 min |
| Base price | $0 | $5/month |
| Notes | Likely too tight for SSR/ISR + bots | Recommended for this failover |

Workers CPU time excludes network wait. WordPress.com fetch latency does not count as CPU, but JSON parsing, RSC rendering, and Middleware execution do.

**Decision needed**: use Workers Paid for the failover month. Do not cut over production until this is decided or accepted risk is recorded.

---

## 6. Implementation checklist

### 6.1 Prepare repository

In `frontend-app/`:

- [x] `pnpm add @opennextjs/cloudflare@latest` — installed `1.20.18`
- [x] `pnpm add -D wrangler@latest` — installed `4.167.0`
- [x] Add `wrangler.toml`:
  - `name = "medialternatives-failover"`
  - `main = ".open-next/worker.js"`
  - `upload_source_maps = true`
  - `compatibility_date = "2026-11-24"`
  - `compatibility_flags = ["nodejs_compat"]`
  - `[assets] directory = ".open-next/assets"`, `binding = "ASSETS"`
  - `[observability] enabled = true`
- [x] Add `open-next.config.ts` using `defineCloudflareConfig()`
- [x] Add scripts:
  - `build:cloudflare`: builds with unoptimized images and prepares asset exclusions/redirects
  - `preview`: `pnpm build:cloudflare && opennextjs-cloudflare preview`
  - `deploy`: `pnpm build:cloudflare && opennextjs-cloudflare deploy`
  - `cf-typegen`: `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts`
- [x] Allowed `esbuild` and `workerd` builds in `pnpm-workspace.yaml`

### 6.2 Port Vercel-only behavior

- [x] Move `vercel.json` rewrites into `next.config.ts`:
  - `/robots.txt` → `/api/robots`
  - `/sitemap.xml` → `/api/sitemap`
  - `/feed.xml` → `/api/feed`
- [x] Recreate security headers in `next.config.ts` and `public/_headers`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: origin-when-cross-origin`
  - immutable cache header for `/_next/static/*`
- [x] Confirmed `src/middleware.ts` remains Edge-compatible (only imports `next/server`)
- [x] Configured image handling:
  - temporary fallback: `NEXT_IMAGE_UNOPTIMIZED=true` for Cloudflare builds
  - Cloudflare Images binding left as a future option
- [x] Worker secrets/build vars taken from `.env.local` without committing values
- [x] Avoided the invalid `CLOUDFLARE_API_TOKEN` from `.env.local` by overriding it in the deploy environment with the Wrangler OAuth token

### 6.3 Configure ISR caching

The app uses time-based revalidation and has an on-demand revalidation API.

Configured for failover:

- [x] R2 incremental cache binding: `NEXT_INC_CACHE_R2_BUCKET` → `medialternatives-failover-cache`
- [x] Durable Object queue: `NEXT_CACHE_DO_QUEUE`, class `DOQueueHandler`
- [x] D1 tag cache: `NEXT_TAG_CACHE_D1` → `medialternatives-failover-tags` (`7ac09614-7163-4116-8c0c-46bacf765624`)
- [x] Self-reference service binding: `WORKER_SELF_REFERENCE`
- [x] Migration for SQLite Durable Object classes
- [x] R2 public dev URL enabled for oversized PDFs:
  - `https://pub-2b74eecbeae64a8492463f9cf7a95392.r2.dev`
- [x] Three oversized PDFs uploaded to R2 and excluded from Worker assets with 302 redirects

Avoided Workers KV as the primary incremental cache because it is eventually consistent.

### 6.4 Deploy without production cutover

- [x] Authenticated Wrangler via OAuth device login
- [x] Created R2 bucket / D1 database
- [x] Ran OpenNext Cloudflare build
- [x] Populated remote R2 cache: 59 entries
- [x] Created D1 tag cache table
- [x] Deployed Worker
- [x] Confirmed Worker is live at:
  - `https://medialternatives-failover.ubuntupunk.workers.dev`
  - Current Version ID: `4d7bf8bf-dfe0-44b7-a26e-c2b2ca1bf4c6`

Deploy command used (token value omitted):

```bash
CF_TOKEN="$(python3 - <<'PY'
import tomllib, pathlib
p = pathlib.Path('/home/ubuntupunk/.config/.wrangler/config/default.toml')
d = tomllib.load(p.open('rb'))
print(d['oauth_token'])
PY
)"
CLOUDFLARE_API_TOKEN="$CF_TOKEN" \
CLOUDFLARE_ACCOUNT_ID=17f6081fecc2e14456c47f0628cf17f5 \
pnpm exec wrangler deploy --env-file /dev/null
```

**Do not add Workers Routes until the workers.dev validation passes and the user approves cutover.**

---

## 7. Validation checklist

Validated against `https://medialternatives-failover.ubuntupunk.workers.dev` on 2026-11-24:

| Check | Result | Notes |
|---|---|---|
| `/` | ✅ 200 | 145,875 bytes, 1.63s first request |
| `/post/<slug>` | ✅ 200 | 82,320 bytes, 0.81s |
| `/<clean-slug>` | ✅ 200 | 82,900 bytes, 0.24s; rewrite works and cache hit is faster |
| `/blog` | ✅ 200 | 146,393 bytes, 1.62s |
| `/page/2` | ✅ 200 | 68,063 bytes, 2.56s |
| `/category/activism` | ✅ 200 | 157,688 bytes, 2.05s |
| `/tag/feesmustfall` | ✅ 200 | 96,041 bytes, 1.63s |
| `/robots.txt` | ✅ 200 | rewrite works |
| `/sitemap.xml` | ✅ 200 | rewrite works |
| `/feed.xml` | ✅ 200 | rewrite works |
| `_next/static/*` | ✅ 200 | `cache-control: public,max-age=31536000,immutable` |
| Security headers | ✅ present | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` |
| Featured images | ✅ present | home HTML includes WordPress.com image URLs; no `/_next/image` paths |
| Oversized PDF redirects | ✅ 302 | all three PDFs redirect to public R2 URLs |
| R2 PDF objects | ✅ 200 | `application/pdf`; responses are large and slow to download over the public dev URL |
| Unknown paths | ✅ 404 | no accidental catch-all pass-through |
| Bot probes | ✅ 404 | `/wp-login.php`, `/xmlrpc.php` return 404 |
| Vercel outage header | ✅ absent | no `x-vercel-error` on Worker responses |

Still to observe after cutover:

- [ ] Full 300s/600s ISR revalidation cycle
- [ ] Worker CPU time against the 10 ms/request Free limit (or confirm Paid plan)
- [ ] Durable Object queue behavior on on-demand revalidation
- [ ] Cache hit rate and WordPress.com request volume under real traffic

Deployment emitted a non-fatal Wrangler warning that `DOQueueHandler` was not found as an exported Durable Object class. The generated `.open-next/worker.js` does export it, and the Worker deployed and served requests successfully. Monitor revalidation; if queue errors appear, fix the generated export/bundling before relying on on-demand revalidation.

---

## 8. Cutover procedure

Only after validation and explicit approval:

1. Audit existing Workers Routes on `medialternatives.com` for overlap.
2. Add route:
   - pattern: `medialternatives.com/*`
   - worker: `medialternatives-failover`
   - zone: `medialternatives.com`
3. Add route:
   - pattern: `www.medialternatives.com/*`
   - worker: `medialternatives-failover`
   - zone: `medialternatives.com`
4. Verify:
   - `curl -I https://medialternatives.com/`
   - `curl -I https://www.medialternatives.com/`
   - no `x-vercel-error: DEPLOYMENT_DISABLED`
   - Worker logs show requests
5. Monitor Cloudflare CPU, request volume, cache hit rate, R2 operations, and WordPress.com API calls.

Optional hardening after cutover:

- Cloudflare WAF/rate limiting for `/wp-login.php`, `/xmlrpc.php`, `/api/*`
- bot filtering for crawler probes
- longer ISR intervals to reduce revalidation churn

---

## 9. Rollback to Vercel

When Vercel is available again:

1. Delete or disable both Workers Routes.
2. Traffic returns automatically to the proxied Vercel A/CNAME records.
3. Confirm:
   - `curl -I https://medialternatives.com/`
   - Vercel deployment serves the site
4. Keep the Worker deployed but idle for future failovers.
5. Close `medialternatives-8vv`.

No DNS edit, TTL wait, certificate change, or Vercel domain reconfiguration is required.

---

## 10. Known blockers and follow-ups

- Vercel CLI is unauthenticated; no route-level CPU telemetry available. Tracked in `medialternatives-a6n`.
- Workers Paid billing decision is outstanding. Free plan has 100,000 requests/day and 10 ms CPU/request.
- `.windsurfconfig` referenced by project docs does not exist in the repo root.
- Local Node is `v24.10.0`; project target is `22.x.x`. The Cloudflare build still passed.
- Existing `.documents` submodule is modified from prior work and must be left untouched.
- Cloudflare MCP OAuth works for reads; classic token verify still fails.
- `.env.local` contains an invalid `CLOUDFLARE_API_TOKEN`; it was overridden for deploy but should be replaced or removed later.
- Wrangler emitted a non-fatal `DOQueueHandler` export warning; monitor on-demand revalidation. Tracked in `medialternatives-23n`.

---

## 11. Change log

- 2026-11-24 — Created plan, verified Cloudflare zone/DNS/Workers/Pages state, opened tracking issues.
- 2026-11-24 — Added OpenNext/Wrangler config, ported Vercel rewrites/headers, configured R2/D1/DO caching, excluded oversized PDFs, and deployed Worker.
- 2026-11-24 — Validated all core routes, rewrites, security headers, static assets, PDF redirects, and clean URLs on `workers.dev`. No production routes or DNS changed.
