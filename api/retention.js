import { timingSafeEqual } from 'node:crypto';
import { runRetention } from '../lib/newsletter-retention.js';
import { json } from '../lib/form-submission.js';
export default { async fetch(request) {
  if (request.method !== 'GET') return json({ error: 'method' }, 405, { Allow: 'GET' });
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get('authorization') || '');
  const expected = Buffer.from(`Bearer ${secret || ''}`);
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return json({ error: 'unauthorized' }, 401);
  try {
    // Bound work to the function deadline. Remaining candidates are retried next day.
    const deadline = AbortSignal.timeout(50000);
    const stats = await runRetention(process.env, new Date(), (url, options) => fetch(url, {
      ...options, redirect: 'error', signal: AbortSignal.any([deadline, AbortSignal.timeout(10000)])
    }));
    return json(stats);
  } catch { return json({ error: 'retention_failed' }, 503); }
} };
