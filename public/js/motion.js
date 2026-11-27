// Animations : apparitions au défilement, compteurs, parallaxe, ombre du menu. Sans effet si « réduire les animations » est activé.
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.header');
    const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 8);
    document.addEventListener('scroll', onScroll, { passive: true });
    if (reduce || !('IntersectionObserver' in window)) return;

    function setup() {
        document.documentElement.classList.add('motion');
        const seen = new WeakSet();
        const add = (el, i, kind) => {
            if (!el || seen.has(el) || el.matches('script, style, [hidden]')) return;
            seen.add(el);
            el.setAttribute('data-reveal', kind || '');
            el.style.setProperty('--d', Math.min(i, 7) * 90 + 'ms');
        };
        document.querySelectorAll('main > section, main > div').forEach(section => {
            if (section.matches('.hero-photo, .hv-hero')) return;
            const wrap = section.querySelector(':scope > .container, :scope > [class$="-wrap"], :scope > [class*="container"]') || section;
            [...wrap.children].forEach(child => {
                const kids = [...child.children];
                const display = getComputedStyle(child).display;
                if (kids.length >= 3 && (display.includes('grid') || display.includes('flex'))) kids.forEach((kid, i) => add(kid, i));
                else add(child, 0);
            });
        });
        const io = new IntersectionObserver(entries => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            io.unobserve(entry.target);
        }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

        // compteurs
        const counters = document.querySelectorAll('.hv-stats b, .stat-number, .partner-stat-number');
        const co = new IntersectionObserver(entries => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            co.unobserve(entry.target);
            const node = entry.target, match = node.textContent.trim().match(/^(\d[\d\s]*)(.*)$/);
            if (!match) return;
            const target = parseInt(match[1].replace(/\s/g, ''), 10), suffix = match[2];
            const start = performance.now(), duration = 1300;
            const tick = now => {
                const t = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - t, 3);
                node.textContent = Math.round(target * eased) + suffix;
                if (t < 1) requestAnimationFrame(tick);
            };
            node.textContent = '0' + suffix;
            requestAnimationFrame(tick);
        }), { threshold: 0.6 });
        counters.forEach(c => co.observe(c));

        // parallaxe douce
        const layers = [...document.querySelectorAll('.hero-photo, .hv-photocard, .ab-band')];
        let ticking = false;
        const update = () => {
            ticking = false;
            layers.forEach(layer => {
                const r = layer.getBoundingClientRect();
                if (r.bottom < 0 || r.top > innerHeight) return;
                const offset = (r.top + r.height / 2 - innerHeight / 2) * -0.06;
                layer.style.setProperty('--py', Math.max(-40, Math.min(40, offset)).toFixed(1) + 'px');
            });
        };
        document.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
        // filet de sécurité : rien ne reste caché si l'observateur ne se déclenche pas
        setTimeout(() => document.querySelectorAll('[data-reveal]:not(.in)').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 1.2) el.classList.add('in');
        }), 2500);
    }
    // laisser les contenus dynamiques (équipe, événements) s'afficher avant de les animer
    window.addEventListener('load', () => setTimeout(setup, 250));
    onScroll();
})();
