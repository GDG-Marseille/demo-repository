// js/newsletter.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".footer__newsletter-form");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Evita que la página se recargue

            const emailInput = form.querySelector("input[type='email']");
            const email = emailInput.value;

            // Datos que pide la API de Brevo
            const data = {
                email: email,
                // includeListId: true, // Si te da un ID de lista
                // listIds: [ID_DE_LISTA] 
            };

            try {
                const response = await fetch("https://api.brevo.com/v3/contacts", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "api-key": "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" // Te la dará Méryl[cite: 1]
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert("¡Gracias por suscribirte a la newsletter!");
                    form.reset(); // Limpia el input
                } else {
                    const errorData = await response.json();
                    console.error("Error de Brevo:", errorData);
                    alert("Hubo un error al suscribirte. Inténtalo de nuevo.");
                }
            } catch (error) {
                console.error("Error de red:", error);
                alert("Error de conexión con el servidor.");
            }
        });
    }
});
