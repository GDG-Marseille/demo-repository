// === CONTADOR DE MIEMBROS ===
// Simulación (más tarde se conectará a la API de Bevy)
document.addEventListener('DOMContentLoaded', function () {
    const counterEl = document.getElementById('memberCounter');
    if (!counterEl) return;

    // Valor final (ejemplo: 130 miembros iniciales)
    const target = 130;
    let current = 0;
    const step = Math.ceil(target / 60); // 1 segundo aprox (60fps)

    function animateCounter() {
        if (current < target) {
            current += step;
            if (current > target) current = target;
            counterEl.textContent = current;
            requestAnimationFrame(animateCounter);
        }
    }
    // Iniciar cuando el elemento sea visible (opcional: IntersectionObserver)
    animateCounter();
});

// === MENÚ MÓVIL ===
const toggleBtn = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');

if (toggleBtn && navList) {
    toggleBtn.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
        this.setAttribute('aria-expanded', expanded);
        navList.classList.toggle('open');
    });
}