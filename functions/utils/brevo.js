// functions/utils/brevo.js
export async function createBrevoContact(email, firstname, apiKey) {
  const url = 'https://api.brevo.com/v3/contacts';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      email,
      attributes: { PRENOM: firstname },
      listIds: [2], // ID de tu lista en Brevo
      updateEnabled: true
    })
  });
  if (!response.ok) {
    throw new Error(`Brevo error: ${response.status}`);
  }
  return response.json();
}