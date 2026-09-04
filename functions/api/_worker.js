// functions/api/_worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Rutas de la API
    if (path.startsWith('/api/forms/')) {
      const formType = path.replace('/api/forms/', '');
      const handler = await import(`./forms/${formType}.js`);
      return handler.default(request, env);
    }

    if (path === '/api/bevy/members') {
      const handler = await import('./bevy/members.js');
      return handler.default(request, env);
    }

    // Si no coincide, devolver 404
    return new Response('Not Found', { status: 404 });
  }
};