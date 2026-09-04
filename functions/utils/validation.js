// functions/utils/validation.js
// Validaciones comunes para los formularios (RGPD, campos obligatorios, email, etc.)

/**
 * Valida los campos del formulario de membresía
 * @param {object} data - Datos del formulario
 * @returns {string[]} - Lista de errores (vacía si todo ok)
 */
export function validateMembre(data) {
  const errors = [];
  if (!data.prenom?.trim()) errors.push('Le prénom est obligatoire.');
  if (!data.email?.trim()) errors.push("L'email est obligatoire.");
  if (data.email && !isValidEmail(data.email)) errors.push("L'email n'est pas valide.");
  if (!data.rgpd) errors.push('Vous devez accepter la politique de confidentialité.');
  return errors;
}

/**
 * Valida los campos del Call for Papers
 * @param {object} data - Datos del formulario
 * @returns {string[]}
 */
export function validateCFP(data) {
  const errors = [];
  if (!data.nom?.trim()) errors.push('Le nom est obligatoire.');
  if (!data.email?.trim()) errors.push("L'email est obligatoire.");
  if (data.email && !isValidEmail(data.email)) errors.push("L'email n'est pas valide.");
  if (!data.titre?.trim()) errors.push('Le titre du talk est obligatoire.');
  if (!data.format) errors.push('Le format est obligatoire.');
  if (!data.niveau) errors.push('Le niveau est obligatoire.');
  if (!data.theme) errors.push('La thématique est obligatoire.');
  if (!data.description?.trim()) errors.push('La description est obligatoire.');
  if (data.description && (data.description.length < 150 || data.description.length > 500)) {
    errors.push('La description doit faire entre 150 et 500 caractères.');
  }
  if (!data.rgpd) errors.push('Vous devez accepter la politique de confidentialité.');
  return errors;
}

/**
 * Valida el formulario de contacto
 */
export function validateContact(data) {
  const errors = [];
  if (!data.nom?.trim()) errors.push('Le nom est obligatoire.');
  if (!data.email?.trim()) errors.push("L'email est obligatoire.");
  if (data.email && !isValidEmail(data.email)) errors.push("L'email n'est pas valide.");
  if (!data.sujet?.trim()) errors.push('Le sujet est obligatoire.');
  if (!data.message?.trim()) errors.push('Le message est obligatoire.');
  if (!data.rgpd) errors.push('Vous devez accepter la politique de confidentialité.');
  return errors;
}

// Helper: validar formato de email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}