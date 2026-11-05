export const CONSENT_VERSION = 'newsletter-2026-10-28';
export const CONSENT_TEXT = 'J’accepte de recevoir la newsletter.';
export const json = (body, status = 200, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers }
});
const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export function ready(env, kind) {
  if (!['BREVO_API_KEY', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY', 'SITE_URL'].every(k => env[k])) return false;
  try { if (new URL(env.SITE_URL).protocol !== 'https:') return false; } catch { return false; }
  if (kind === 'newsletter') return /^\d+$/.test(env.BREVO_LIST_ID) && Number.isSafeInteger(+env.BREVO_LIST_ID) && +env.BREVO_LIST_ID > 0;
  return emailValid(env.BREVO_SENDER_EMAIL) && emailValid(env.CONTACT_TO_EMAIL)
    && (kind !== 'partner' || emailValid(env.PARTNER_TO_EMAIL || env.CONTACT_TO_EMAIL));
}
export function validate(data, kind) {
  if (Object.values(data).some(v => typeof v !== 'string' || v.length > 10000)) return 'invalid';
  if (!emailValid(data.email)) return 'email';
  if (data.rgpd !== 'on') return 'consent';
  if (kind !== 'newsletter' && !data.nom?.trim()) return 'invalid';
  if (kind === 'contact' && (!data.prenom?.trim() || !data.message?.trim() || !['evenement','partenariat','rappel','talk','benevolat','soutien','autre'].includes(data.motif))) return 'invalid';
  if (kind === 'partner' && !data.entreprise?.trim()) return 'invalid';
  if (kind === 'contact' && data.motif === 'rappel' && !/^[+\d\s().-]{6,30}$/.test(data.telephone || '')) return 'phone';
  return null;
}
export function payload(data, kind, env, now = new Date()) {
  const email = data.email.trim();
  if (kind === 'newsletter') return {
    email, listIds: [+env.BREVO_LIST_ID], updateEnabled: true,
    // Do not reset emailBlacklisted: keep existing unsubscribe exclusions.
    attributes: {
      GDG_NEWSLETTER_CONSENT_AT: now.toISOString(),
      GDG_NEWSLETTER_CONSENT_VERSION: CONSENT_VERSION,
      GDG_NEWSLETTER_CONSENT_TEXT: CONSENT_TEXT,
      GDG_NEWSLETTER_CONSENT_SOURCE: new URL(env.SITE_URL).origin + '/#newsletter'
    }
  };
  const fields = ['prenom','nom','email','entreprise','motif','telephone','message'];
  const textContent = fields.filter(key => data[key] && (key !== 'telephone' || (kind === 'contact' && data.motif === 'rappel')))
    .map(key => `${key}: ${data[key]}`).join('\n\n');
  return {
    sender: { name: 'GDG Marseille', email: env.BREVO_SENDER_EMAIL },
    to: [{ email: kind === 'partner' ? (env.PARTNER_TO_EMAIL || env.CONTACT_TO_EMAIL) : env.CONTACT_TO_EMAIL }],
    replyTo: { email },
    subject: kind === 'partner' ? 'Demande de partenariat — GDG Marseille' : 'Demande de contact — GDG Marseille',
    textContent
  };
}
async function limitedBody(request) {
  if (Number(request.headers.get('content-length')) > 65536) throw new Error('too-large');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65536) { await reader.cancel(); throw new Error('too-large'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function submit(request, env = process.env, send = fetch) {
  if (request.method !== 'POST') return json({ error: 'method' }, 405, { Allow: 'POST' });
  const kind = new URL(request.url).searchParams.get('kind');
  if (!['contact','partner','newsletter'].includes(kind)) return json({ error: 'invalid' }, 400);
  if (!ready(env, kind)) return json({ error: 'unavailable' }, 503);
  const origin = new URL(env.SITE_URL).origin;
  if (request.headers.has('origin') && request.headers.get('origin') !== origin) return json({ error: 'invalid' }, 403);
  let data;
  try {
    const body = await limitedBody(request);
    const form = await new Response(body, { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData();
    data = Object.create(null);
    for (const [key, value] of form) {
      if (Object.hasOwn(data, key) || typeof value !== 'string') return json({ error: 'invalid' }, 400);
      data[key] = value;
    }
  } catch (error) { return json({ error: 'invalid' }, error.message === 'too-large' ? 413 : 400); }
  const error = validate(data, kind);
  if (error) return json({ error }, 400);
  const token = data['cf-turnstile-response'];
  if (!token || token.length > 2048) return json({ error: 'captcha' }, 400);
  try {
    const check = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token })
    });
    if (!check.ok) throw new Error('provider');
    const captcha = await check.json();
    if (!captcha.success || captcha.hostname !== new URL(origin).hostname) return json({ error: 'captcha' }, 400);
    const result = await send('https://api.brevo.com/v3/' + (kind === 'newsletter' ? 'contacts' : 'smtp/email'), {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body: JSON.stringify(payload(data, kind, env))
    });
    if (!result.ok) throw new Error('provider');
    return json({ success: true });
  } catch { return json({ error: 'unavailable' }, 503); }
}
