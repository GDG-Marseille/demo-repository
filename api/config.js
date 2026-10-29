import { ready, json } from '../lib/forms.js';
export default { fetch(request) {
  if (request.method !== 'GET') return json({ error: 'method' }, 405, { Allow: 'GET' });
  const env = process.env;
  return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
    forms: Object.fromEntries(['contact','partner','newsletter'].map(kind => [kind, ready(env, kind)])) });
} };
