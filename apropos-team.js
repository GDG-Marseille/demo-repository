// ===== CARGAR EQUIPO DINÁMICAMENTE PARA LA PÁGINA À PROPOS =====
document.addEventListener("DOMContentLoaded", function () {
    const teamGrid = document.getElementById("apropos-team-grid");
    if (!teamGrid) return; // Si no estamos en la página que tiene este grid, no hace nada

    const teamMembers = [
        {
            name: "Méryl Stretti",
            role: "Fondatrice & Lead Organizer",
            roleClass: "blue-text",
            img: "images/meryl-portrait.png"
        },
        {
            name: "Eric Huang",
            role: "Conseil et support tech",
            roleClass: "green-text",
            img: "images/eric-portrait.png"
        },
        {
            name: "Mathias Rodriguez",
            role: "Responsable Cybersécurité",
            roleClass: "yellow-text",
            img: "images/mathias-portrait.png"
        }
    ];

    teamGrid.innerHTML = teamMembers.map(member => `
        <div class="apropos-team-card">
            <img src="${member.img}" alt="${member.name}" class="team-avatar-img" />
            <h3>${member.name}</h3>
            <p class="team-card-role ${member.roleClass}">${member.role}</p>
        </div>
    `).join("");
});
