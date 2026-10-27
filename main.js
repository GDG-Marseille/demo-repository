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

// ===== CONTADOR DE MIEMBROS (desde Bevy) =====
async function fetchMemberCount() {
    try {
        const response = await fetch('/api/bevy/members');
        if (!response.ok) throw new Error('Error al obtener contador');
        const data = await response.json();
        const counterEl = document.getElementById('memberCounter');
        if (counterEl && data.count !== undefined) {
            let current = 0;
            const target = data.count;
            const step = Math.ceil(target / 60);
            function animate() {
                if (current < target) {
                    current += step;
                    if (current > target) current = target;
                    counterEl.textContent = current;
                    requestAnimationFrame(animate);
                }
            }
            animate();
        }
    } catch (error) {
        console.error('Error al cargar el contador:', error);
        const counterEl = document.getElementById('memberCounter');
        if (counterEl) counterEl.textContent = '0';
    }
}

// Ejecutar al cargar la página
fetchMemberCount();


const formScript = document.createElement('script');
formScript.src = 'js/forms.js';
document.body.appendChild(formScript);

