// Lightweight defensive sanitizers for user-supplied plain text.
// React already escapes rendered content; these helpers add a second layer
// for values that get persisted to the database.

const HTML_TAG_RE = /<\/?[a-zA-Z][^>]*>/g;
// Strip C0 control chars except \t (\x09) and \n (\x0A)
const CONTROL_CHARS_RE = /[\x00-\x08\x0B-\x1F\x7F]/g;

export function sanitizePlainText(value, maxLength = Infinity) {
  if (value == null) return '';
  let out = String(value);
  out = out.replace(HTML_TAG_RE, '');
  out = out.replace(CONTROL_CHARS_RE, '');
  out = out.trim();
  if (out.length > maxLength) out = out.slice(0, maxLength);
  return out;
}

// Username (students, bulk create): letters, digits, dot, dash, underscore.
export const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,30}$/;

// Quiz Battle room code: 4-8 uppercase alphanumerics.
export const ROOM_CODE_RE = /^[A-Z0-9]{4,8}$/;

// Teacher/free password policy: >=8 chars, at least one letter and one digit.
export function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 8) {
    return 'La contrasena debe tener al menos 8 caracteres';
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'La contrasena debe incluir al menos una letra y un digito';
  }
  return null;
}
