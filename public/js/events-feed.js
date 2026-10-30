// One calendar drives the homepage, event listings and next-meetup links.
document.addEventListener('DOMContentLoaded', () => {
    const groupUrl = 'https://www.meetup.com/fr-fr/google-developer-group-marseille/';
    let events = [];
    let phase = '';
    const date = value => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Europe/Paris' }).format(new Date(value));
    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const text = (root, selector, value) => { const node = root.querySelector(selector); if (node) node.textContent = value; };
    const safeUrl = url => /^https:\/\/www\.meetup\.com\/(?:fr-fr\/)?google-developer-group-marseille\/events\/\d+\/?$/.test(url)
        || /^https:\/\/gdg\.community\.dev\/events\/details\/google-gdg-marseille-[a-z0-9-]+\/$/.test(url);
    const safeImage = image => typeof image === 'string' && /^images\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp)$/.test(image);
    function link(className, label, url) {
        const a = el('a', className, label);
        a.href = url;
        return a;
    }
    function background(node, event) {
        node.style.backgroundImage = safeImage(event.image) ? `url("${event.image}")` : 'linear-gradient(135deg, #174ea6, #202124)';
    }
    function renderCard(event, now) {
        const past = Date.parse(event.end) <= now;
        const card = el('article', 'ev-card-modern' + (safeImage(event.image) ? '' : ' no-img-card'));
        card.dataset.tags = event.tags.join(' ');
        if (safeImage(event.image)) {
            const img = el('img', 'ev-card-img'); img.src = event.image; img.alt = ''; img.loading = 'lazy'; card.append(img);
        }
        const body = el('div', 'ev-card-body full-height-body');
        const meta = el('div', 'ev-meta-row');
        meta.append(el('span', 'ev-date-blue', date(event.start)), el('span', 'ev-tag-gray', past ? 'Événement passé' : 'À venir'));
        const footer = el('div', 'ev-footer-row');
        footer.append(link('btn-card-blue', past ? "Voir l’événement" : "S’inscrire", event.url));
        body.append(meta, el('h3', 'ev-title', event.title), el('p', 'ev-desc flex-grow-text', event.description), footer);
        card.append(body);
        return card;
    }
    function render() {
        const now = Date.now();
        const upcoming = events.filter(e => Date.parse(e.end) > now).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
        const past = events.filter(e => Date.parse(e.end) <= now).sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
        const next = upcoming[0];
        phase = events.map(e => Date.parse(e.end) > now).join(',');
        const nextUrl = next ? next.url : groupUrl;
        document.querySelectorAll('.hero__tilt-card, .hero__floating-card').forEach(a => {
            a.href = nextUrl; a.setAttribute('aria-label', next ? 'Découvrir ' + next.title : 'Voir le calendrier Meetup');
        });
        text(document, '.floating-title', next ? 'Prochain Meetup' : 'Nos rencontres');
        text(document, '.floating-subtitle', next ? next.title : 'Voir le calendrier Meetup');
        const join = document.querySelector('.dark-cta-box');
        if (join) {
            text(join, 'p', next ? `${next.title} — ${date(next.start)}. Retrouvez les détails et inscrivez-vous sur Meetup.` : 'Retrouvez nos rencontres sur Meetup et suivez le groupe pour être informé des prochaines dates.');
            const a = join.querySelector('.btn-pill-blue');
            a.href = nextUrl; a.textContent = next ? 'Découvrir le prochain meetup' : 'Voir le calendrier Meetup';
        }
        text(document, 'a[href="#dernier-meetup"]', next ? 'Prochain Meetup' : 'Nos meetups');
        const banner = document.querySelector('.featured-banner');
        if (banner) {
            banner.dataset.available = String(Boolean(next));
            banner.hidden = !next;
            if (next) {
                background(banner, next); banner.dataset.tags = next.tags.join(' ');
                text(banner, '.featured-date', date(next.start));
                text(banner, '.featured-title', next.title);
                text(banner, '.featured-desc', next.description);
                banner.querySelectorAll('.featured-actions a').forEach(a => { a.href = next.url; });
                text(banner, '.btn-pill-blue', "S’inscrire →");
            }
            const grid = document.querySelector('.upcoming-grid-2');
            grid.replaceChildren(...[...upcoming.slice(1), ...past].map(e => renderCard(e, now)));
            text(document, '.upcoming-events-section .section-title-bold', 'Tous les événements');
            text(document, '.upcoming-events-section .section-subtitle-gray', 'Nos prochaines rencontres et nos événements passés.');
        }
        const preview = document.querySelector('.events-preview');
        if (preview) {
            const featured = preview.querySelector('.event-card--featured');
            featured.hidden = !next;
            if (next) {
                background(featured, next);
                text(featured, '.event-tag', Date.parse(next.start) <= now ? 'EN COURS' : 'À VENIR');
                text(featured, '.event-date-small', date(next.start));
                text(featured, 'h3', next.title); text(featured, '.event-card__content p', next.description);
                featured.querySelector('a').href = next.url;
            }
            const second = upcoming[1] || past[0];
            const side = preview.querySelector('.event-card--side');
            side.hidden = !second;
            if (second) {
                text(side, '.event-tag-green', Date.parse(second.end) <= now ? 'Événement passé' : 'À venir');
                text(side, 'h3', second.title); text(side, '.event-card__body > p', second.description);
                text(side, '.event-date', date(second.start)); side.querySelector('a').href = second.url;
            }
            let empty = preview.querySelector('.events-empty');
            if (!empty) { empty = el('p', 'events-empty'); preview.querySelector('.container').append(empty); }
            empty.hidden = Boolean(next);
            empty.textContent = 'Les prochaines dates seront annoncées sur Meetup.';
        }
        document.dispatchEvent(new Event('gdg:events-updated'));
    }
    function accept(data) {
        if (!data || !Array.isArray(data.events)) throw new Error('Invalid calendar');
        const valid = data.events.every(e => typeof e.title === 'string' && typeof e.description === 'string'
            && Number.isFinite(Date.parse(e.start)) && Number.isFinite(Date.parse(e.end)) && safeUrl(e.url)
            && Array.isArray(e.tags) && e.tags.every(t => typeof t === 'string'));
        if (!valid) throw new Error('Invalid event');
        events = data.events.filter(e => !e.cancelled);
        render();
    }
    async function refresh() {
        try {
            const response = await fetch('/api/events', { signal: AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error('Calendar unavailable');
            accept(await response.json());
        } catch (_) { /* Preserve the last successfully loaded calendar. */ }
    }
    // A local snapshot also works on static previews; the Vercel API refreshes Meetup events.
    fetch('data/events.json').then(r => { if (!r.ok) throw new Error('Snapshot unavailable'); return r.json(); })
        .then(accept).catch(() => {}).finally(refresh);
    setInterval(refresh, 3600000);
    const checkRollover = () => {
        if (events.length && events.map(e => Date.parse(e.end) > Date.now()).join(',') !== phase) render();
    };
    setInterval(checkRollover, 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkRollover(); });
});
