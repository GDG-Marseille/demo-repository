// functions/api/forms/contact.js
import { validateContact } from '../../utils/validation.js';
import { verifyTurnstile } from '../../utils/turnstile.js';

export default async function handler(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const errors = validateContact(data);
    if (errors.length > 0) {
      return new Response(JSON.stringify({ errors }), { status: 400 });
    }

    const token = data['cf-turnstile-response'];
    const isValid = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Captcha inválido' }), { status: 400 });
    }

    // Aquí podrías enviar un email al equipo usando Brevo
    // Por simplicidad, solo respondemos éxito
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}