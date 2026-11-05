import { readFile } from 'node:fs/promises';
import { SOURCE, parseCalendar, mergeEvents } from '../lib/event-calendar.js';
import { json } from '../lib/form-submission.js';
let cached;
let expires = 0;
export default { async fetch(request) {
  if (request.method !== 'GET') return json({ error: 'method' }, 405, { Allow: 'GET' });
  if (!cached) cached = JSON.parse(await readFile(new URL('../public/data/events.json', import.meta.url), 'utf8'));
  if (Date.now() >= expires) {
    try {
      const response = await fetch(SOURCE, { signal: AbortSignal.timeout(7000), redirect: 'error', headers: { Accept: 'text/calendar', 'User-Agent': 'GDGMarseille-Calendar/1.0' } });
      if (!response.ok) throw new Error('Calendar unavailable');
      const reader = response.body.getReader();
      const chunks = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2097152) { await reader.cancel(); throw new Error('Calendar too large'); }
        chunks.push(value);
      }
      cached = { source: SOURCE, updatedAt: new Date().toISOString(), events: mergeEvents(cached.events, parseCalendar(Buffer.concat(chunks).toString('utf8'))) };
      expires = Date.now() + 3600000;
    } catch { expires = Date.now() + 300000; }
  }
  return json(cached, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
} };
