// ===== CARGAR EQUIPO DINÁMICAMENTE PARA LA PÁGINA À PROPOS =====
document.addEventListener("DOMContentLoaded", function () {
    const teamGrid = document.getElementById("apropos-team-grid");
    if (!teamGrid) return; // Si no estamos en la página que tiene este grid, no hace nada

    const teamMembers = [
        {
            name: "Meryl Soratti",
            role: "Fondatrice & Lead Organizer",
            roleClass: "blue-text",
            img: "images/person1.png"
        },
        {
            name: "Eric Huang",
            role: "Stratégie & Partenariats",
            roleClass: "green-text",
            img: "images/person2.png"
        },
        {
            name: "Moussaadou Mirelli",
            role: "Responsable Site Web",
            roleClass: "orange-text",
            img: "images/person3.png"
        },
        {
            name: "Louis Savon",
            role: "Développement & Outils",
            roleClass: "red-text",
            img: "images/person4.png"
        },
        {
            name: "Mathilde Rodriguez",
            role: "Responsable Cybersécurité",
            roleClass: "yellow-text",
            img: "images/person5.png"
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