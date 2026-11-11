const contactReason = document.getElementById('contact_motif');
const reason = new URLSearchParams(location.search).get('motif');
if (contactReason) {
    if ([...contactReason.options].some(option => option.value === reason)) contactReason.value = reason;
    const updatePhone = () => {
        const required = contactReason.value === 'rappel';
        document.getElementById('phone-group').hidden = !required;
        document.getElementById('contact_phone').required = required;
    };
    contactReason.addEventListener('change', updatePhone);
    updatePhone();
}

