// functions/api/forms/cfp.js
import { validateCFP } from '../../utils/validation.js';
import { verifyTurnstile } from '../../utils/turnstile.js';
import { createBrevoContact } from '../../utils/brevo.js';

export default async function handler(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // 1. Validar
    const errors = validateCFP(data);
    if (errors.length > 0) {
      return new Response(JSON.stringify({ errors }), { status: 400 });
    }

    // 2. Verificar Turnstile
    const token = data['cf-turnstile-response'];
    const isValid = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Captcha inválido' }), { status: 400 });
    }

    // 3. Enviar notificación al equipo (usando Brevo)
    // Podrías enviar un email a contact@gdgmarseille.fr con los datos
    await sendTeamNotification(data, env.BREVO_API_KEY);

    // 4. (Opcional) Guardar en Brevo como contacto o en una lista específica
    await createBrevoContact(data.email, data.nom, env.BREVO_API_KEY);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Función auxiliar para notificar al equipo (puedes ampliarla)
async function sendTeamNotification(data, apiKey) {
  // Aquí podrías usar Brevo para enviar un email a los organizadores
  // con los detalles del CFP. Por simplicidad, solo registramos.
  console.log('Nuevo CFP:', data);
}