// ===== CARGAR EQUIPO DINÁMICAMENTE PARA LA PÁGINA À PROPOS =====
document.addEventListener("DOMContentLoaded", function () {
    const teamGrid = document.getElementById("apropos-team-grid");
    if (!teamGrid) return; // Si no estamos en la página que tiene este grid, no hace nada

    const teamMembers = [
        {
            name: "Méryl Stretti",
            role: "Fondatrice & Organisatrice principale",
            roleClass: "blue-text",
            img: "images/meryl-conference.jpeg",
            links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/merylstretti/" }, { label: "Site web", url: "https://kwdcreative.fr/" }]
        },
        {
            name: "Eric Huang",
            role: "Responsable des technologies et des projets",
            roleClass: "green-text",
            img: "images/eric-portrait.png",
            links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/eric-huang-lin/" }, { label: "Site web", url: "https://ams-cg.com/" }]
        },
        {
            name: "Mathias Rodriguez",
            role: "Responsable Cybersécurité",
            roleClass: "yellow-text",
            img: "images/mathias-portrait.png",
            links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/mathias-rodrigues-1084182b5/" }]
        },
        {
            name: "Charlotte Garcia",
            role: "Responsable Communication",
            roleClass: "blue-text",
            img: "images/charlotte-portrait.jpg",
            links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/charlotte-garcia-7425341b2/" }, { label: "Site web", url: "https://www.instagram.com/cgcommunication__/" }]
        }
    ];

    teamGrid.innerHTML = teamMembers.map(member => `
        <div class="apropos-team-card">
            ${member.img ? `<img src="${member.img}" alt="${member.name}" class="team-avatar-img" />` : `<div class="team-avatar-img team-avatar-initials" aria-hidden="true">${member.initials}</div>`}
            <h3>${member.name}</h3>
            <p class="team-card-role ${member.roleClass}">${member.role}</p>
            <div class="team-profile-links">${member.links.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.label} — ${member.name}">${link.label}</a>`).join("")}</div>
        </div>
    `).join("");
});
