(() => {
    let configPromise;
    let captchaPromise;
    const config = () => configPromise ||= fetch('/api/config').then(response => {
        if (!response.ok) throw new Error('Configuration indisponible');
        return response.json();
    });
    const captcha = () => captchaPromise ||= new Promise((resolve, reject) => {
        window.gdgCaptchaReady = resolve;
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=gdgCaptchaReady';
        script.onerror = reject;
        document.head.appendChild(script);
    });
    async function prepare(form) {
        if (form.dataset.bound) return;
        form.dataset.bound = 'true';
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        status.style.gridColumn = '1 / -1';
        form.appendChild(status);
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!form.reportValidity() || button.disabled) return;
            button.disabled = true;
            status.textContent = 'Envoi en cours…';
            try {
                const response = await fetch(`/api/forms/${form.dataset.apiForm}`, { method: 'POST', body: new FormData(form) });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.error || 'L’envoi n’a pas été confirmé.');
                status.textContent = form.dataset.apiForm === 'newsletter' ? 'Votre inscription est enregistrée.' : 'Votre demande a bien été envoyée.';
                form.reset();
                document.getElementById('contact_motif')?.dispatchEvent(new Event('change'));
            } catch (error) {
                status.textContent = error.message === 'Failed to fetch' ? 'Connexion impossible. Réessayez plus tard.' : error.message;
            } finally {
                button.disabled = false;
                if (form.captchaId !== undefined) window.turnstile.reset(form.captchaId);
            }
        });
        try {
            const settings = await config();
            if (!settings.turnstileSiteKey || !settings.formsEnabled) throw new Error('Configuration indisponible');
            await captcha();
            form.captchaId = window.turnstile.render(form.querySelector('.captcha-slot'), { sitekey: settings.turnstileSiteKey });
            button.disabled = false;
        } catch {
            if (form.dataset.apiForm === 'newsletter') {
                button.title = 'Inscription non connectée';
                button.setAttribute('aria-label', 'Inscription non connectée');
            } else if (form.dataset.apiForm === 'partner') {
                button.title = 'Envoi non connecté — contactez partenariat@gdgmarseille.fr';
                button.setAttribute('aria-label', 'Envoi non connecté — contactez partenariat@gdgmarseille.fr');
            } else {
                button.title = 'Envoi non connecté — contactez hello@gdgmarseille.fr';
                button.setAttribute('aria-label', 'Envoi non connecté — contactez hello@gdgmarseille.fr');
            }
        }
    }
    const scan = () => document.querySelectorAll('[data-api-form]').forEach(prepare);
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
