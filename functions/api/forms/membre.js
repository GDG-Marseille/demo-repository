// functions/api/forms/membre.js
import { verifyTurnstile } from '../../utils/turnstile.js';
import { createBrevoContact } from '../../utils/brevo.js';
import { createBevyMember } from '../../utils/bevy.js';
import { validateMembre } from '../../utils/validation.js';

export default async function handler(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // 1. Validar campos y RGPD
    const errors = validateMembre(data);
    if (errors.length > 0) {
      return new Response(JSON.stringify({ errors }), { status: 400 });
    }

    // 2. Verificar Turnstile
    const turnstileToken = data['cf-turnstile-response'];
    const isValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Captcha inválido' }), { status: 400 });
    }

    // 3. Crear contacto en Brevo (email de bienvenida)
    await createBrevoContact(data.email, data.prenom, env.BREVO_API_KEY);

    // 4. Sincronizar con Bevy (crear miembro)
    await createBevyMember(data.email, data.prenom, env.BEVY_API_KEY, env.BEVY_COMMUNITY_ID);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}