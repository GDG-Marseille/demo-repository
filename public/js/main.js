// ===== CARGAR HEADER Y FOOTER REUTILIZABLES =====
document.addEventListener("DOMContentLoaded", async () => {
    async function loadComponent(id, file) {
        const container = document.getElementById(id);
        if (container) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    container.innerHTML = await response.text();
                } else {
                    console.error(`Erreur lors du chargement de ${file}: ${response.status}`);
                }
            } catch (error) {
                console.error(`Erreur réseau pour ${file}:`, error);
            }
        }
    }

    // Cargar header y footer EN PARALELO
    await Promise.all([
        loadComponent('header-container', 'header.html'),
        loadComponent('footer-container', 'footer.html')
    ]);

    // Inicializar el menú móvil UNA VEZ que el header ya está cargado en la página
    initMobileMenu();
    // Reuse the footer's social logos and destinations throughout the site.
    const socialLinks = document.querySelector('.footer__socials-circles');
    if (socialLinks) {
        document.querySelectorAll('.info-social-icons').forEach(group => {
            group.classList.add('social-links-shared');
            group.replaceChildren(...[...socialLinks.children].map(link => link.cloneNode(true)));
        });
    }
});
// ===== MENÚ MÓVIL (Movido a una función para reutilizarla) =====
function initMobileMenu() {
    const toggleBtn = document.querySelector('.nav__toggle');
    const navList = document.querySelector('.nav__list');
    if (toggleBtn && navList) {
        // Evitamos duplicar event listeners si se llama varias veces
        toggleBtn.replaceWith(toggleBtn.cloneNode(true));
        const newToggleBtn = document.querySelector('.nav__toggle');

        navList.id = 'primary-navigation';
        newToggleBtn.setAttribute('aria-controls', navList.id);
        const links = [...navList.querySelectorAll('a')];
        function setOpen(open, restoreFocus = false) {
            newToggleBtn.setAttribute('aria-expanded', String(open));
            newToggleBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
            newToggleBtn.textContent = open ? '×' : '☰';
            navList.classList.toggle('open', open);
            if (open) links[0]?.focus();
            else if (restoreFocus) newToggleBtn.focus();
        }
        newToggleBtn.setAttribute('aria-label', 'Ouvrir le menu');
        newToggleBtn.addEventListener('click', () => setOpen(newToggleBtn.getAttribute('aria-expanded') !== 'true'));
        links.forEach(link => link.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', event => {
            if (newToggleBtn.getAttribute('aria-expanded') !== 'true') return;
            if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
            if (event.key === 'Tab') {
                const controls = [newToggleBtn, ...links];
                const index = controls.indexOf(document.activeElement);
                if (event.shiftKey && index === 0) { event.preventDefault(); links.at(-1)?.focus(); }
                else if (!event.shiftKey && index === controls.length - 1) { event.preventDefault(); newToggleBtn.focus(); }
            }
        });
        window.matchMedia('(max-width: 768px)').addEventListener('change', () => setOpen(false));
    }
}

// Le nombre de membres affiché est maintenu dans le contenu du site.


const formScript = document.createElement('script');
formScript.src = 'js/forms.js';
document.body.appendChild(formScript);

