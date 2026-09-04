// functions/api/_worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Mapeo de rutas a módulos (importación dinámica)
    const routes = {
      '/api/forms/membre': () => import('./forms/membre.js'),
      '/api/forms/cfp': () => import('./forms/cfp.js'),
      '/api/forms/contact': () => import('./forms/contact.js'),
      '/api/bevy/members': () => import('./bevy/members.js'),
    };

    for (const [route, importer] of Object.entries(routes)) {
      if (path === route) {
        const module = await importer();
        return module.default(request, env);
      }
    }

    // Si la ruta no existe, devolver 404
    return new Response('Not Found', { status: 404 });
  }
};