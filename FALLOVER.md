# Temporary Cloudflare Failover Plan — medialternatives.com

**Status**: Cutover complete — production Workers Routes active on Workers Free; CPU hardening deployed; rollback procedure ready  
**Owner**: Dev Team  
**Created**: 2026-11-24  
**Tracking**: `medialternatives-8vv` (failover), `medialternatives-a6n` (Vercel CPU root cause), `medialternatives-56k` (Workers Free limits), `medialternatives-23n` (DO queue), `medialternatives-esx` (WAF rules)

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

**Decision recorded**: use **Workers Free** for the failover. Accepted risk: 100,000 requests/day and 10 ms CPU/request. Monitor request volume and CPU closely; upgrade to Workers Paid if limits are approached.

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
- [x] Avoided the invalid `CLOUDFLARE_API_TOKEN` from `.env.local` with `--env-file /dev/null`; Wrangler then uses its own OAuth config and refresh token

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

Deploy command used (Wrangler OAuth credentials stay in `~/.config/.wrangler/config/default.toml`):

```bash
cd frontend-app
pnpm exec wrangler deploy --env-file /dev/null
```

`--env-file /dev/null` is required so the invalid `CLOUDFLARE_API_TOKEN` in `.env.local` is ignored. Do not copy the OAuth token into `CLOUDFLARE_API_TOKEN`; that bypasses refresh and causes `503 / 10001` on several Cloudflare API endpoints.

`workers.dev` validation passed. Production Workers Routes were added only after explicit user approval on 2026-11-24.

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

### Production validation after cutover

Validated on 2026-11-24 on both apex and `www`:

| Check | Result | Notes |
|---|---|---|
| Apex and `www` routes active | ✅ | Both patterns listed on zone `13d78476de4fb4c3dfa307b6ec9760c4` |
| `/` | ✅ 200 | `server: cloudflare`, no `x-vercel-error` |
| `/blog` | ✅ 200 | apex and `www` |
| Clean post URL | ✅ 200 | apex and `www` |
| `/robots.txt`, `/sitemap.xml`, `/feed.xml` | ✅ 200 | rewrites work in production |
| Security headers | ✅ present | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` |
| Oversized PDF redirect | ✅ 302 | redirects to public R2 URL |
| `/wp-login.php` | ✅ 404 | no Vercel outage response |

Post-cutover findings (2026-11-26):

- [x] Workers CPU-limit failures identified: 1,633 `Worker exceeded CPU time limit.` events, ~10,900 invocations over 10 ms CPU (avg 73 ms, max 951 ms), 551 HTTP 503s (`medialternatives-56k`)
- [x] Worker HTML caching verified after enabling Workers Cache: `cf-cache-status: MISS` then `HIT`, plus `x-opennext-cache: HIT`
- [x] Legacy WordPress probes short-circuited: `/wp-login.php` and `/xmlrpc.php` return 404 without rendering Next.js
- [ ] Workers Free request volume against 100,000/day after hardening (`medialternatives-56k`)
- [ ] Post-hardening CPU/error trend after the bot-UA build is deployed (`medialternatives-56k`)
- [ ] Full 300s/600s ISR revalidation cycle
- [ ] Durable Object queue behavior on on-demand revalidation (`medialternatives-23n`)
- [ ] Cache hit rate and WordPress.com request volume under real traffic

Deployment emitted a non-fatal Wrangler warning that `DOQueueHandler` was not found as an exported Durable Object class. The generated `.open-next/worker.js` does export it, and the Worker deployed and served requests successfully. Monitor revalidation; if queue errors appear, fix the generated export/bundling before relying on on-demand revalidation.

---

## 8. Cutover procedure

Completed on 2026-11-24 after validation and explicit user approval.

1. Audited existing Workers Routes on `medialternatives.com` — none existed.
2. Added route:
   - pattern: `medialternatives.com/*`
   - worker: `medialternatives-failover`
   - zone: `medialternatives.com`
   - route ID: `2d38c55884a443c3a6b678fd42a24e9e`
3. Added route:
   - pattern: `www.medialternatives.com/*`
   - worker: `medialternatives-failover`
   - zone: `medialternatives.com`
   - route ID: `06f5022d9829401593b9adda44ed74b1`
4. Verify:
   - `curl -I https://medialternatives.com/`
   - `curl -I https://www.medialternatives.com/`
   - no `x-vercel-error: DEPLOYMENT_DISABLED`
   - Worker logs show requests
5. Monitor Cloudflare CPU, request volume, cache hit rate, R2 operations, and WordPress.com API calls.

Hardening after cutover is documented in section 8a. Remaining optional work:

- Cloudflare WAF/rate limiting for `/wp-login.php`, `/xmlrpc.php`, `/api/*` once a token with ruleset edit scope is available (`medialternatives-esx`)
- longer ISR intervals if revalidation churn remains high after cache interception is verified under live traffic

---

## 8a. Workers Free CPU hardening (2026-11-26)

The failover stayed on Workers Free. No Paid upgrade was made.

### Root causes

- Cached ISR/SSG pages were still being rendered by the Worker on many hits.
- Time-based revalidation produced repeated DO queue work; 105 revalidation failures were observed.
- Zone CDN cache rules do not cache Worker-generated responses. Before `cache.enabled = true`, responses had no `cf-cache-status` and every request invoked the Worker.
- Bots and legacy WordPress probes generated expensive 404 renders.

### Changes

- `open-next.config.ts`:
  - `withRegionalCache(r2IncrementalCache, { mode: 'long-lived' })`
  - `queueCache(doQueue, { regionalCacheTtlSec: 30 })`
  - `purgeCache({ type: 'durableObject' })`
  - `enableCacheInterception: true`
- `wrangler.toml`:
  - `[cache] enabled = true`
  - `NEXT_CACHE_DO_PURGE` binding for `BucketCachePurge`
  - migration `v2`
- `src/middleware.ts`:
  - cheap 404 for `/wp-login.php`, `/xmlrpc.php`, `/wp-admin/`, `/wp-content/`, `/wp-includes/`
  - cheap 403 for high-volume scraper/AI-crawler UAs (built, redeploy pending OAuth re-auth)
- Worker secret `CACHE_PURGE_API_TOKEN` and `CACHE_PURGE_ZONE_ID` were set with a token that only has Cache Purge permission. The token value is not stored in the repository.

### Verified

- Deployed cache-hardened version: `a3cb274b-671a-45d3-a04a-e4186e25da4c`
- Deployed bot-UA short-circuit version: `65910e4d-9af6-4927-92ce-b918dcb89a8b` (2026-11-27)
- `/` → `200`, `x-opennext-cache: HIT`
- `cf-cache-status: MISS` on first request, then `HIT`
- `/wp-login.php` → `404`, `/xmlrpc.php` → `404`
- `PetalBot` / `ClaudeBot` with cache-busting query → `403`; normal browser UA → `200`
- Live tail of 7 forced-uncached requests: all `ok`, avg CPU 67.4 ms, p50 34 ms, max 233 ms; repeated fixed URLs are edge-cached and do not invoke the Worker
- `pnpm type-check` and `pnpm lint` passed; `pnpm build:cloudflare` succeeded

### Blocked

- WAF custom rules for scraper UAs and legacy paths could not be created: Cloudflare API returns `HTTP 503 / code 10001` for `http_request_firewall_custom` with both the MCP connection and Wrangler OAuth token. Tracked in `medialternatives-esx`.
- The redundant zone cache rule `e39615356e0b492c97034e8002f51e2e` was added before Workers Cache was understood; it is harmless but should be deleted with a token that has ruleset edit scope.
- WAF custom rules and redundant zone cache-rule deletion remain blocked (`medialternatives-esx`). Cloudflare REST ruleset endpoints return `HTTP 403 / code 10000 Authentication error` for the Wrangler OAuth token, which has `zone:read` but no ruleset-edit scope; the MCP token is still invalid.
- Post-hardening telemetry is now observable via `wrangler tail`. Forced-uncached requests still exceed the 10 ms Free CPU budget, but normal repeated URLs are served from Workers Cache without invoking the Worker; keep `medialternatives-56k` open until a longer real-traffic trend confirms the error rate.

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

### Quick Worker troubleshooting recipes

```bash
just cf-tail             # live logs as JSON
just cf-tail-errors      # only failed invocations
just cf-deployments      # deployment history
just cf-versions         # version history
just cf-deploy-debug     # redeploy with Wrangler debug logging
```

Each recipe runs from `frontend-app/` and passes `--env-file /dev/null` so the invalid `.env.local` token is ignored.

---

## 10. Known blockers and follow-ups

- Vercel CLI is unauthenticated; no route-level CPU telemetry available. Tracked in `medialternatives-a6n`.
- Workers Free is active by user decision; 100,000 requests/day and 10 ms CPU/request limits are accepted and must be monitored.
- `.windsurfconfig` referenced by project docs does not exist in the repo root.
- Local Node is `v24.10.0`; project target is `22.x.x`. The Cloudflare build still passed.
- Existing `.documents` submodule is modified from prior work and must be left untouched.
- Cloudflare MCP OAuth works for cache-rule reads/writes but returns `503 / 10001` for WAF rulesets; Wrangler OAuth has the same WAF scope limitation (`medialternatives-esx`).
- `.env.local` contains an invalid `CLOUDFLARE_API_TOKEN`; always use `--env-file /dev/null`. Do not copy the OAuth token into `CLOUDFLARE_API_TOKEN` because that bypasses refresh and causes API auth failures.
- Wrangler emitted a non-fatal `DOQueueHandler`/`BucketCachePurge` export warning; generated worker exports both classes. Monitor on-demand revalidation (`medialternatives-23n`).
- Wrangler OAuth works for Worker deploys and tails as of 2026-11-27. Cloudflare ruleset endpoints return `403 / 10000` for that token and the MCP token is invalid; WAF/ruleset cleanup remains `medialternatives-esx`.

---

## 11. Change log

- 2026-11-24 — Created plan, verified Cloudflare zone/DNS/Workers/Pages state, opened tracking issues.
- 2026-11-24 — Added OpenNext/Wrangler config, ported Vercel rewrites/headers, configured R2/D1/DO caching, excluded oversized PDFs, and deployed Worker.
- 2026-11-24 — Validated all core routes, rewrites, security headers, static assets, PDF redirects, and clean URLs on `workers.dev`. No production routes or DNS changed.
- 2026-11-24 — After explicit approval and Workers Free selection, added both production Workers Routes and verified apex/www traffic is served by the Worker with no Vercel outage response.
- 2026-11-24 — Added reusable `just` recipes for Wrangler log tails, deployment history, version history, and debug deploys.
- 2026-11-26 — Diagnosed Workers Free CPU-limit notices: uncached Worker HTML, ISR revalidation failures, and bot/legacy traffic.
- 2026-11-26 — Deployed OpenNext cache interception, regional cache, queue dedupe, DO purge binding, and Workers Cache; verified `cf-cache-status` and `x-opennext-cache` hits.
- 2026-11-26 — Added legacy-path and scraper-UA middleware short-circuits; legacy 404s went live and WAF rules were blocked (`medialternatives-esx`).
- 2026-11-27 — Wrangler OAuth access restored; deployed bot-UA middleware as version `65910e4d-9af6-4927-92ce-b918dcb89a8b` and verified 403/200/404 behavior plus live CPU telemetry. WAF rules still require a ruleset-scoped token.
