// Recherche et filtres des événements.
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('events-search-form');
    const searchInput = document.getElementById('event-search-input');
    const filterPills = document.querySelectorAll('#filter-pills-container .filter-pill');
    const linkVoirTout = document.getElementById('link-voir-tout');
    const resetButton = document.getElementById('events-reset');
    const status = document.getElementById('events-search-status');
    let items = [];
    const sections = document.querySelectorAll('.featured-event-section, .upcoming-events-section');
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();
    let records = [];
    function indexEvents() {
        items = Array.from(document.querySelectorAll('.featured-banner, .ev-card-modern')).filter(item => item.dataset.available !== 'false');
        records = items.map(item => ({ item, tags: normalize(item.dataset.tags || '').split(' '), text: normalize(item.textContent + ' ' + (item.dataset.tags || '')) }));
        applyFilterAndSearch();
    }
    let currentFilter = 'tous';

    function applyFilterAndSearch() {
        const words = normalize(searchInput.value).split(' ').filter(Boolean);
        let count = 0;
        records.forEach(({ item, tags, text }) => {
            const matches = (currentFilter === 'tous' || tags.includes(currentFilter)) && words.every(word => text.includes(word));
            item.hidden = !matches;
            if (matches) count++;
        });
        sections.forEach(section => {
            section.hidden = !items.some(item => section.contains(item) && !item.hidden);
        });
        filterPills.forEach(pill => {
            const active = pill.dataset.filter === currentFilter;
            pill.classList.toggle('active', active);
            pill.setAttribute('aria-pressed', String(active));
        });
        status.textContent = count === 0
            ? 'Aucun événement ne correspond à votre recherche. Essayez un autre mot-clé ou une autre catégorie.'
            : count + (count === 1 ? ' événement trouvé.' : ' événements trouvés.');
        resetButton.hidden = !words.length && currentFilter === 'tous';
    }

    function resetFilters(event) {
        event.preventDefault();
        currentFilter = 'tous';
        searchInput.value = '';
        applyFilterAndSearch();
        searchInput.focus();
    }

    filterPills.forEach(pill => pill.addEventListener('click', function() {
        currentFilter = this.dataset.filter;
        applyFilterAndSearch();
    }));
    searchInput.addEventListener('input', applyFilterAndSearch);
    searchInput.addEventListener('search', applyFilterAndSearch);
    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        applyFilterAndSearch();
    });
    resetButton.addEventListener('click', resetFilters);
    if (linkVoirTout) linkVoirTout.addEventListener('click', resetFilters);
    document.addEventListener('gdg:events-updated', indexEvents);
    indexEvents();

});
