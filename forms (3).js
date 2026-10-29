(() => {
    let configPromise;
    let captchaPromise;
    const request = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(45000) });
    const config = () => configPromise ||= request('/api/config').then(response => {
        if (!response.ok) throw new Error('unavailable');
        return response.json();
    }).catch(error => { configPromise = null; throw error; });
    const captcha = () => {
        if (window.turnstile) return Promise.resolve();
        return captchaPromise ||= new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const timer = setTimeout(() => fail(), 20000);
            const fail = () => {
                clearTimeout(timer);
                script.remove();
                reject(new Error('unavailable'));
            };
            window.gdgCaptchaReady = () => { clearTimeout(timer); resolve(); };
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=gdgCaptchaReady';
            script.onerror = fail;
            document.head.appendChild(script);
        }).catch(error => { captchaPromise = null; throw error; });
    };
    function prepare(form) {
        if (form.dataset.bound) return;
        form.dataset.bound = 'true';
        const kind = form.dataset.apiForm;
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        status.style.gridColumn = '1 / -1';
        status.hidden = true;
        form.appendChild(status);
        const message = text => { status.textContent = text; status.hidden = !text; };
        const button = form.querySelector('button[type="submit"]');
        let sending = false;
        let setupPromise;
        const updateButton = () => {
            const email = form.querySelector('input[name="email"]');
            const consent = form.querySelector('input[name="rgpd"]');
            const invalidNewsletter = kind === 'newsletter' &&
                (!email?.value.trim() || !email.validity.valid || !consent?.checked);
            button.disabled = sending || invalidNewsletter;
        };
        const setup = () => setupPromise ||= (async () => {
            const settings = await config();
            if (!settings.turnstileSiteKey || !settings.forms?.[kind]) {
                configPromise = null;
                throw new Error('unavailable');
            }
            await captcha();
            if (form.captchaId === undefined) {
                form.captchaId = window.turnstile.render(form.querySelector('.captcha-slot'), {
                    sitekey: settings.turnstileSiteKey,
                    size: kind === 'newsletter' ? 'compact' : 'flexible',
                    'error-callback': () => true
                });
            }
        })().catch(error => { setupPromise = null; throw error; });
        form.addEventListener('input', updateButton);
        form.addEventListener('change', updateButton);
        form.addEventListener('reset', () => queueMicrotask(updateButton));
        updateButton();
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (sending || !form.reportValidity() || button.disabled) return;
            sending = true;
            updateButton();
            message('Envoi en cours…');
            let attempted = false;
            try {
                await setup();
                if (!window.turnstile.getResponse(form.captchaId)) {
                    message('Terminez la vérification de sécurité, puis réessayez.');
                    return;
                }
                attempted = true;
                const response = await request(`/api/submit?kind=${encodeURIComponent(kind)}`, {
                    method: 'POST', body: new FormData(form)
                });
                const result = await response.json();
                if (!response.ok || !result.success) {
                    const errors = {
                        email: 'Vérifiez votre adresse e-mail.',
                        consent: 'Cochez la case d’accord pour continuer.',
                        phone: 'Vérifiez votre numéro de téléphone.',
                        invalid: 'Vérifiez les champs du formulaire.',
                        captcha: 'La vérification de sécurité a expiré. Réessayez.'
                    };
                    if (errors[result.error]) { message(errors[result.error]); return; }
                    throw new Error('unavailable');
                }
                message(kind === 'newsletter' ? 'Votre demande d’inscription a bien été enregistrée.' : 'Votre demande a bien été envoyée. Merci !');
                form.reset();
                document.getElementById('contact_motif')?.dispatchEvent(new Event('change'));
            } catch {
                message(kind === 'newsletter'
                    ? 'L’inscription n’a pas pu aboutir. Réessayez dans quelques instants.'
                    : 'Votre demande n’a pas pu être envoyée. Réessayez ou écrivez à contact@gdgmarseille.fr.');
            } finally {
                sending = false;
                updateButton();
                if (attempted && form.captchaId !== undefined) window.turnstile.reset(form.captchaId);
            }
        });
        setup().catch(() => {});
    }
    const scan = () => document.querySelectorAll('[data-api-form]').forEach(prepare);
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
