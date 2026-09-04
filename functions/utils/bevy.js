// functions/utils/bevy.js
// Cliente para interactuar con la API de Bevy

/**
 * Obtiene el número total de miembros de la comunidad
 * @param {string} apiKey - API Key de Bevy
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise<number>}
 */
export async function getMemberCount(apiKey, communityId) {
  const url = `https://api.bevy.com/v1/communities/${communityId}/members/count`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    throw new Error(`Bevy count error: ${response.status}`);
  }
  const data = await response.json();
  return data.count || 0;
}

/**
 * Crea un nuevo miembro en Bevy
 * @param {string} email - Email del miembro
 * @param {string} firstName - Nombre
 * @param {string} apiKey - API Key de Bevy
 * @param {string} communityId - ID de la comunidad
 * @returns {Promise<object>}
 */
export async function createBevyMember(email, firstName, apiKey, communityId) {
  const url = `https://api.bevy.com/v1/communities/${communityId}/members`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      // Puedes añadir más campos según la API de Bevy
    })
  });
  if (!response.ok) {
    throw new Error(`Bevy create error: ${response.status}`);
  }
  return response.json();
}