import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';
import { purgeCache } from '@opennextjs/cloudflare/overrides/cache-purge/index';

/**
 * Workers Free allows only 10 ms of CPU per request. The defaults boot the
 * Next server for every ISR hit, which routinely exceeds that budget.
 * These overrides keep cached pages on the fast path so the Worker stays
 * within the Free limit during the temporary Vercel failover.
 */
export default defineCloudflareConfig({
  // Regional Cache API avoids repeated R2 reads. With long-lived mode the
  // default `bypassTagCacheOnCacheHit` skips the D1 tag lookup on hits.
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
  }),
  // Dedupe repeated time-based revalidation requests before the DO queue.
  queue: queueCache(doQueue, { regionalCacheTtlSec: 30 }),
  tagCache: d1NextTagCache,
  // Buffer on-demand CDN purges through a DO to avoid API rate limits.
  cachePurge: purgeCache({ type: 'durableObject' }),
  // Serve cached ISR/SSG pages directly, without loading the Next server.
  enableCacheInterception: true,
});
