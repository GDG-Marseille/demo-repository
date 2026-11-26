// Carte « prochain événement » de l'accueil : mise à jour depuis le calendrier Meetup.
// Le Summit reste affiché avec son programme (texte écrit dans la page) ; un autre événement affiche son titre et sa date.
document.addEventListener('DOMContentLoaded', async () => {
    const card = document.getElementById('hv-event');
    if (!card) return;
    const safe = url => /^https:\/\/www\.meetup\.com\/(?:fr-fr\/)?google-developer-group-marseille\/events\/\d+\/?$/.test(url);
    const clean = value => String(value).replace(/🚀️?\s*/gu, '').replace(/\s{2,}/g, ' ').trim();
    const set = (id, text) => { const node = document.getElementById(id); if (node) node.textContent = text; };
    const link = (id, url, label) => { const node = document.getElementById(id); if (!node) return; if (safe(url)) node.href = url; if (label) node.textContent = label; };
    try {
        const response = await fetch('/api/events', { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return;
        const data = await response.json();
        const now = Date.now();
        const next = (data.events || []).filter(e => !e.cancelled && Date.parse(e.end) > now)
            .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];
        if (!next) {
            card.hidden = true;
            document.getElementById('hv-floatlink')?.remove();
            link('hv-main-cta', 'https://www.meetup.com/fr-fr/google-developer-group-marseille/', 'Voir le calendrier Meetup');
            document.getElementById('hv-main-cta')?.setAttribute('href', 'https://www.meetup.com/fr-fr/google-developer-group-marseille/');
            return;
        }
        if (/Epitech Summit/i.test(next.title)) return; // le contenu de la page est déjà celui du Summit
        const start = new Date(next.start);
        const fmt = options => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', ...options }).format(start);
        set('hv-wd', fmt({ weekday: 'long' }));
        set('hv-day', fmt({ day: '2-digit' }));
        set('hv-mon', fmt({ month: 'short', year: 'numeric' }));
        set('hv-title', clean(next.title));
        set('hv-meta', next.location ? clean(next.location) : 'Marseille');
        document.getElementById('hv-prog')?.remove();
        document.getElementById('hv-tag')?.remove();
        link('hv-reg', next.url, 'Je m’inscris');
        link('hv-main-cta', next.url, 'S’inscrire au prochain événement');
    } catch (error) { /* on garde le contenu de la page */ }
});
