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
});
// ===== MENÚ MÓVIL (Movido a una función para reutilizarla) =====
function initMobileMenu() {
    const toggleBtn = document.querySelector('.nav__toggle');
    const navList = document.querySelector('.nav__list');
    if (toggleBtn && navList) {
        // Evitamos duplicar event listeners si se llama varias veces
        toggleBtn.replaceWith(toggleBtn.cloneNode(true));
        const newToggleBtn = document.querySelector('.nav__toggle');

        newToggleBtn.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
            this.setAttribute('aria-expanded', expanded);
            navList.classList.toggle('open');
        });
    }
}

// Le nombre de membres affiché est maintenu dans le contenu du site.


const formScript = document.createElement('script');
formScript.src = 'js/forms.js';
document.body.appendChild(formScript);

