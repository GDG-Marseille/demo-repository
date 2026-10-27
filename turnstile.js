// functions/utils/turnstile.js
// Verifica el token de Cloudflare Turnstile

/**
 * Verifica el token de Turnstile con la API de Cloudflare
 * @param {string} token - Token obtenido del widget
 * @param {string} secretKey - Clave secreta de Turnstile
 * @returns {Promise<boolean>}
 */
export async function verifyTurnstile(token, secretKey) {
  if (!token) return false;
  
  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: secretKey,
      response: token
    })
  });
  const data = await response.json();
  return data.success === true;
}