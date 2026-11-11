// ===== CARGAR 3 MIEMBROS ALEATORIOS Y CONTAR DIRECTAMENTE DE LA LISTA =====
document.addEventListener("DOMContentLoaded", function () {
    const avatarGroup = document.getElementById("dynamic-avatar-group");
    const membersCountText = document.getElementById("dynamic-members-count");
    if (!avatarGroup) return;

    // Fictional decorative portraits, independent of the organizing team.
    const allMembers = [
        { img: "images/avatar-fictional-1.png" },
        { img: "images/avatar-fictional-2.png" },
        { img: "images/avatar-fictional-4.png" }
    ];

    // 1. Barajar la lista de forma aleatoria
    const shuffled = [...allMembers].sort(() => 0.5 - Math.random());

    // 2. Seleccionar exactamente 3 para los avatares
    const selectedMembers = shuffled.slice(0, 3);

    // 3. Pintar los 3 avatares en el HTML manteniendo la clase original de CSS
    avatarGroup.setAttribute("aria-hidden", "true");
    avatarGroup.innerHTML = selectedMembers.map(member => `
        <img src="${member.img}" alt="" width="36" height="36" />
    `).join("");

    // 4. Contar cuántos hay en la lista total menos los 3 que se muestran
    if (membersCountText) {
        membersCountText.innerHTML = `Rejoint par <strong>150+ membres passionnés</strong>`;
    }
});
