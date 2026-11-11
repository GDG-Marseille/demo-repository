// Only the newsletter list is managed here: never delete a shared CRM contact.
export const CONSENT_ATTRIBUTE = 'GDG_NEWSLETTER_CONSENT_AT';

export function isExpired(contact, now) {
  const raw = contact.attributes?.[CONSENT_ATTRIBUTE];
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(raw)) return false;
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) return false;
  const month = date.getUTCMonth();
  date.setUTCFullYear(date.getUTCFullYear() + 3);
  if (date.getUTCMonth() !== month) date.setUTCDate(0); // February 29
  return date <= now;
}

export async function runRetention(env, now = new Date(), request = fetch) {
  const listId = Number(env.BREVO_LIST_ID);
  if (!env.BREVO_API_KEY || !Number.isSafeInteger(listId) || listId <= 0) {
    throw new Error('Retention requires BREVO_API_KEY and BREVO_LIST_ID');
  }
  const headers = { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' };
  const api = async (path, options = {}) => {
    const response = await request(`https://api.brevo.com/v3/${path}`, { ...options, headers });
    if (!response.ok) throw new Error(`Retention API failure: ${response.status}`);
    return response.json();
  };
  // Snapshot first, then mutate: removals must not shift pagination offsets.
  const candidates = new Set();
  let scanned = 0;
  let missingDate = 0;
  for (let offset = 0; ; offset += 500) {
    if (offset >= 10000) throw new Error('Retention list exceeds scan limit; no changes made');
    const page = await api(`contacts/lists/${listId}/contacts?limit=500&offset=${offset}&sort=asc`);
    if (!Array.isArray(page.contacts)) throw new Error('Invalid retention response');
    for (const contact of page.contacts) {
      scanned++;
      if (!contact.attributes?.[CONSENT_ATTRIBUTE]) missingDate++;
      if (isExpired(contact, now) && Number.isSafeInteger(contact.id)) candidates.add(contact.id);
    }
    if (page.contacts.length < 500) break;
  }
  let removed = 0;
  if (env.RETENTION_MODE === 'live') {
    for (const id of candidates) {
      // Recheck consent immediately before removal (a subscription may have renewed).
      const current = await api(`contacts/${id}`);
      if (!isExpired(current, now) || !current.listIds?.includes(listId)) continue;
      const result = await api(`contacts/lists/${listId}/contacts/remove`, {
        method: 'POST', body: JSON.stringify({ ids: [id] })
      });
      if (result.contacts?.failure?.length) throw new Error('Retention removal rejected');
      removed++;
    }
  }
  // Aggregate counts only: never log email addresses, keys or message bodies.
  return { mode: env.RETENTION_MODE === 'live' ? 'live' : 'dry-run', scanned, missingDate, expired: candidates.size, removed };
}
