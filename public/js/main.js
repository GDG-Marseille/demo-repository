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

    // Cargar header y footer EN PARALELO (uno no bloquea al otro)
    await Promise.all([
        loadComponent('header-container', 'header.html'),
        loadComponent('footer-container', 'footer.html')
    ]);
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

// ===== ENVÍO DE FORMULARIOS =====
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Envoi en cours...';
            }

            const formData = new FormData(this);
            let endpoint = '/api/forms/';
            if (this.id === 'formMembre') endpoint += 'membre';
            else if (this.id === 'formCFP') endpoint += 'cfp';
            else if (this.id === 'formContact') endpoint += 'contact';
            else if (this.id === 'formBenevole') endpoint += 'benevole';
            else if (this.id === 'formSpeaker') endpoint += 'speaker';
            else if (this.id === 'formCoorganize') endpoint += 'coorganize';
            else if (this.id === 'formPartner') endpoint += 'partner';
            else if (this.id === 'formInstitution') endpoint += 'institution';
            else {
                endpoint += this.id.replace('form', '').toLowerCase();
            }

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    alert('✅ Envoi réussi !');
                    this.reset();
                    if (window.turnstile) {
                        const widget = this.querySelector('.cf-turnstile');
                        if (widget) turnstile.reset(widget);
                    }
                } else {
                    let errorMsg = '❌ Erreur : ';
                    if (result.errors && result.errors.length > 0) {
                        errorMsg += result.errors.join(', ');
                    } else {
                        errorMsg += result.error || 'Veuillez réessayer.';
                    }
                    alert(errorMsg);
                }
            } catch (err) {
                alert('❌ Erreur réseau. Vérifiez votre connexion.');
                console.error(err);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Envoyer';
                }
            }
        });
    });
});