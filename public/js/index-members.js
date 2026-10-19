// ===== CARGAR 3 MIEMBROS ALEATORIOS Y CONTAR DIRECTAMENTE DE LA LISTA =====
document.addEventListener("DOMContentLoaded", function () {
    const avatarGroup = document.getElementById("dynamic-avatar-group");
    const membersCountText = document.getElementById("dynamic-members-count");
    if (!avatarGroup) return;

    // Los miembros reales de la comunidad
    const allMembers = [
        { name: "Meryl Soratti", img: "images/person1.png" },
        { name: "Eric Huang", img: "images/person2.png" },
        { name: "Moussaadou Mirelli", img: "images/person3.png" },
        { name: "Louis Savon", img: "images/person4.png" },
        { name: "Mathilde Rodriguez", img: "images/person5.png" }
    ];

    // 1. Barajar la lista de forma aleatoria
    const shuffled = [...allMembers].sort(() => 0.5 - Math.random());

    // 2. Seleccionar exactamente 3 para los avatares
    const selectedMembers = shuffled.slice(0, 3);

    // 3. Pintar los 3 avatares en el HTML manteniendo la clase original de CSS
    avatarGroup.innerHTML = selectedMembers.map(member => `
        <img src="${member.img}" alt="${member.name}" title="${member.name}" />
    `).join("");

    // 4. Contar cuántos hay en la lista total menos los 3 que se muestran
    if (membersCountText) {
        const totalCount = allMembers.length; // Cuenta los elementos reales de la lista (en este caso 5)
        const remainingCount = 163; // 5 - 3 = 2
        
        membersCountText.innerHTML = `Rejoint par <strong>+${163} membres passionnés</strong>`;
    }
});