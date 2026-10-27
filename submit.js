import { verifyTurnstile } from '../../utils/turnstile.js';

const json = (data, status = 200) => Response.json(data, { status });
export default async function submit(request, env, kind) {
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  if (env.PRIVACY_APPROVED !== 'true') return json({ error: 'Les formulaires ne sont pas encore ouverts. Écrivez à hello@gdgmarseille.fr.' }, 503);
  if (request.headers.get('Origin') && request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Origine non autorisée.' }, 403);
  const required = ['BREVO_API_KEY', 'TURNSTILE_SECRET_KEY', ...(kind === 'newsletter' ? ['BREVO_LIST_ID'] : ['CONTACT_TO_EMAIL', 'BREVO_SENDER_EMAIL'])];
  if (required.some(key => !env[key] || env[key].startsWith('your-'))) return json({ error: 'Service temporairement indisponible. Contactez hello@gdgmarseille.fr.' }, 503);
  try {
    const data = Object.fromEntries(await request.formData());
    const email = String(data.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !data.rgpd) return json({ error: 'Vérifiez votre e-mail et votre consentement.' }, 400);
    if (Object.values(data).some(value => typeof value !== 'string' || value.length > 10000)) return json({ error: 'Données trop volumineuses.' }, 400);
    if (kind !== 'newsletter' && (!data.nom?.trim() || (kind === 'contact' && (!data.message?.trim() || !data.motif)))) return json({ error: 'Complétez les champs obligatoires.' }, 400);
    if (kind === 'partner' && !data.entreprise?.trim()) return json({ error: 'Indiquez votre entreprise.' }, 400);
    if (data.motif === 'rappel' && !/^[+\d\s().-]{6,30}$/.test(data.telephone || '')) return json({ error: 'Indiquez un numéro de téléphone valide.' }, 400);
    if (!await verifyTurnstile(data['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY)) return json({ error: 'Veuillez renouveler la vérification anti-spam.' }, 400);
    let endpoint, payload;
    if (kind === 'newsletter') {
      const listId = Number(env.BREVO_LIST_ID);
      if (!Number.isInteger(listId) || listId <= 0) return json({ error: 'Newsletter indisponible.' }, 503);
      endpoint = 'contacts';
      payload = { email, listIds: [listId], updateEnabled: true };
    } else {
      endpoint = 'smtp/email';
      payload = {
        sender: { name: 'GDG Marseille', email: env.BREVO_SENDER_EMAIL },
        to: [{ email: env.CONTACT_TO_EMAIL }], replyTo: { email },
        subject: kind === 'partner' ? 'Demande de partenariat — site GDG' : 'Demande de contact — site GDG',
        textContent: ['prenom', 'nom', 'email', 'entreprise', 'motif', 'telephone', 'message'].map(key => `${key}: ${data[key] || ''}`).join('\n\n')
      };
    }
    const response = await fetch(`https://api.brevo.com/v3/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY }, body: JSON.stringify(payload) });
    if (!response.ok) return json({ error: 'L’envoi a échoué. Réessayez plus tard ou écrivez à hello@gdgmarseille.fr.' }, 502);
    return json({ success: true });
  } catch {
    return json({ error: 'Service indisponible. Votre demande n’a pas été confirmée.' }, 503);
  }
}
