// Carte flottante de l'accueil : montre le prochain rendez-vous seulement s'il est proche (moins de 150 jours),
// sinon elle invite à rejoindre la communauté. Le reste de la page ne dépend pas du calendrier.
document.addEventListener('DOMContentLoaded', async () => {
    const link = document.getElementById('hv-floatlink');
    if (!link) return;
    const safe = url => /^https:\/\/www\.meetup\.com\/(?:fr-fr\/)?google-developer-group-marseille\/events\/\d+\/?$/.test(url);
    const clean = value => String(value).replace(/🚀\uFE0F?\s*/gu, '').replace(/\s{2,}/g, ' ').trim();
    try {
        const response = await fetch('/api/events', { signal: AbortSignal.timeout(8000) });
        if (!response.ok) return;
        const data = await response.json();
        const now = Date.now(), horizon = now + 150 * 24 * 3600 * 1000;
        const next = (data.events || []).filter(e => !e.cancelled && Date.parse(e.end) > now && Date.parse(e.start) < horizon)
            .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];
        if (!next || !safe(next.url)) return;
        const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date(next.start));
        document.getElementById('hv-float-kicker').textContent = 'Prochain rendez-vous · ' + date;
        document.getElementById('hv-float-title').textContent = clean(next.title);
        link.href = next.url;
    } catch (error) { /* on garde l'invitation à rejoindre la communauté */ }
});
