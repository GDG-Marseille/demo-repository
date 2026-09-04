// functions/api/bevy/members.js
export default async function handler(request, env) {
  const url = `https://api.bevy.com/v1/communities/${env.BEVY_COMMUNITY_ID}/members/count`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${env.BEVY_API_KEY}` }
  });
  const data = await response.json();
  return new Response(JSON.stringify({ count: data.count }), {
    headers: { 'Content-Type': 'application/json' }
  });
}