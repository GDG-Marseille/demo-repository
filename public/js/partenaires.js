// Affiche les partenaires et mécènes à partir de data/partenaires.json.
// Les soutiens sont regroupés par niveau ; plus le niveau est élevé, plus la carte est grande.
document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('partners-wall');
    if (!root) return;

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function safeUrl(value) {
        try {
            const url = new URL(value, location.href);
            return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    function initials(name) {
        return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
    }

    function card(item, size) {
        const url = safeUrl(item.url);
        const wrapper = el(url ? 'a' : 'div', 'pw-card pw-card--' + size);
        if (url) {
            wrapper.href = url;
            wrapper.target = '_blank';
            wrapper.rel = 'noopener noreferrer';
            wrapper.setAttribute('aria-label', item.nom + ' (nouvel onglet)');
        }
        if (item.logo) {
            const img = el('img', 'pw-logo');
            img.src = item.logo;
            img.alt = 'Logo ' + item.nom;
            img.loading = 'lazy';
            wrapper.append(img);
        } else {
            const badge = el('span', 'pw-initials', initials(item.nom));
            badge.setAttribute('aria-hidden', 'true');
            wrapper.append(badge);
        }
        wrapper.append(el('h3', 'pw-name', item.nom));
        if (item.description) wrapper.append(el('p', 'pw-desc', item.description));
        return wrapper;
    }

    function section(title, items, size) {
        const block = el('section', 'pw-level pw-level--' + size);
        block.append(el('h2', 'pw-level-title', title));
        const grid = el('div', 'pw-grid');
        items.forEach(item => grid.append(card(item, size)));
        block.append(grid);
        return block;
    }

    try {
        const response = await fetch('data/partenaires.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const actifs = (data.soutiens || []).filter(item => item.actif);
        const sizeByIndex = ['xl', 'lg', 'md', 'sm'];
        let rendered = 0;

        const groups = [
            { groupe: 'entreprise', titre: null },
            { groupe: 'mecene', titre: null }
        ];
        groups.forEach(({ groupe }) => {
            const niveaux = data.niveaux.filter(level => level.groupe === groupe);
            niveaux.forEach((level, index) => {
                const items = actifs.filter(item => item.niveau === level.id);
                if (!items.length) return;
                root.append(section(level.label, items, groupe === 'mecene' ? 'sm' : sizeByIndex[index] || 'sm'));
                rendered += items.length;
            });
        });

        const sansNiveau = actifs.filter(item => !data.niveaux.some(level => level.id === item.niveau));
        if (sansNiveau.length) {
            root.append(section('Ils nous soutiennent', sansNiveau, 'md'));
            rendered += sansNiveau.length;
        }
        if (!rendered) root.append(el('p', 'pw-empty', 'Les premiers partenaires seront présentés ici très bientôt.'));
    } catch (error) {
        console.error('Impossible de charger les partenaires', error);
        root.append(el('p', 'pw-empty', 'La liste des partenaires est momentanément indisponible.'));
    }
});
