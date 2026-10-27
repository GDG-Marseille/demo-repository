// ===== FILTROS Y BÚSQUEDA DE EVENTOS + ENLACES DINÁMICOS =====
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('event-search-input');
    const filterPills = document.querySelectorAll('.filter-pill');
    const btnFiltrer = document.getElementById('btn-filtrer');
    const linkVoirTout = document.getElementById('link-voir-tout');
    const items = document.querySelectorAll('.featured-banner, .ev-card-modern, .archive-card');

    let currentFilter = 'tous';

    // Manejar clics en los botones de filtro (pills)
    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter').toLowerCase();
            applyFilterAndSearch();
        });
    });

    // Filtrar al escribir en la barra de búsqueda o hacer clic en "Filtrer"
    if (searchInput) {
        searchInput.addEventListener('input', applyFilterAndSearch);
    }
    if (btnFiltrer) {
        btnFiltrer.addEventListener('click', applyFilterAndSearch);
    }

    // Restablecer filtros al hacer clic en "Voir tout"
    if (linkVoirTout) {
        linkVoirTout.addEventListener('click', function(e) {
            e.preventDefault();
            currentFilter = 'tous';
            if (searchInput) searchInput.value = '';
            
            filterPills.forEach(p => {
                if (p.getAttribute('data-filter').toLowerCase() === 'tous') {
                    p.classList.add('active');
                } else {
                    p.classList.remove('active');
                }
            });

            applyFilterAndSearch();
        });
    }

    function applyFilterAndSearch() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        items.forEach(item => {
            const tags = (item.getAttribute('data-tags') || '').toLowerCase();
            const text = item.textContent.toLowerCase();

            const matchesFilter = (currentFilter === 'tous' || tags.includes(currentFilter));
            const matchesSearch = (query === '' || text.includes(query) || tags.includes(query));

            if (matchesFilter && matchesSearch) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // ===== ASIGNACIÓN DE ENLACES ESPECÍFICOS PARA LOS BOTONES DE EVENTOS =====
    // Si Méryl te pasa los enlaces exactos de esos dos eventos, solo tienes que ponerlos aquí abajo:
    
    // 1. Botón "S'inscrire" del evento de Epitech
    const btnEpitech = document.querySelector('.ev-card-modern:nth-of-type(1) .btn-card-blue');
    if (btnEpitech) {
        btnEpitech.addEventListener('click', function(e) {
            e.preventDefault();
            // Reemplaza esta URL con el enlace real que te indique Méryl para Epitech
            window.open('https://gdg.community.dev/events/details/google-gdg-marseille-presents-gdg-marseille-x-epitech-summit-ia-cloud-amp-cyber/', '_blank');
        });
    }

    // 2. Botón "Voir le programme" del evento pasado
    const btnPastEvent = document.querySelector('.ev-card-modern.no-img-card .btn-card-outline-blue');
    if (btnPastEvent) {
        btnPastEvent.addEventListener('click', function(e) {
            e.preventDefault();
            // Reemplaza esta URL con el enlace real del programa o recurso pasado
            window.open('https://gdg.community.dev/events/details/google-gdg-marseille-presents-projet-au-delai-impossible-comment-lia-nous-a-permis-de-livrer/', '_blank');
        });
    }
});