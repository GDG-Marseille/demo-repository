// functions/api/bevy/members.js
import { getMemberCount } from '../../utils/bevy.js';

export default async function handler(request, env) {
  try {
    const count = await getMemberCount(env.BEVY_API_KEY, env.BEVY_COMMUNITY_ID);
    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}