// src/apps/criptograma/cipherGenerator.js
// Genera un criptograma: cada letra del alfabeto se mapea a un símbolo/número único.
// El jugador descifra la frase adivinando qué letra corresponde a cada símbolo.

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Crea un mapa de cifrado: cada letra del alfabeto → un número único (1-27).
 * Garantiza que ninguna letra se mapea a su propio valor "natural".
 */
export function generateCipherMap() {
  const letters = ALPHABET.split('');
  const numbers = letters.map((_, i) => i + 1);

  let mapping;
  let attempts = 0;
  do {
    mapping = shuffle(numbers);
    attempts++;
    // Asegurar que ninguna letra queda en su posición (derangement parcial)
  } while (
    attempts < 50 &&
    mapping.some((n, i) => n === i + 1) // al menos una coincide
  );

  const letterToCode = {};
  const codeToLetter = {};
  letters.forEach((letter, i) => {
    letterToCode[letter] = mapping[i];
    codeToLetter[mapping[i]] = letter;
  });

  return { letterToCode, codeToLetter };
}

/**
 * Cifra un texto y devuelve la estructura para jugar.
 * @param {string} text - Texto original
 * @param {Object} letterToCode - Mapa de cifrado
 * @returns {Array<{original: string, normalized: string, code: number|null, isLetter: boolean, index: number}>}
 */
export function encryptText(text, letterToCode) {
  const chars = Array.from(text);
  return chars.map((ch, index) => {
    const norm = normalize(ch);
    const isLetter = /[A-ZÑ]/.test(norm);
    return {
      original: ch,
      normalized: norm,
      code: isLetter ? letterToCode[norm] : null,
      isLetter,
      index,
    };
  });
}

/**
 * Devuelve las letras únicas que aparecen en el texto normalizado,
 * ordenadas por frecuencia descendente.
 */
export function getUniqueLetters(text) {
  const norm = normalize(text);
  const freq = {};
  for (const ch of norm) {
    if (/[A-ZÑ]/.test(ch)) {
      freq[ch] = (freq[ch] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([letter, count]) => ({ letter, count }));
}

/**
 * Tabla de frecuencia del español (aproximada) para la ayuda visual.
 */
export const SPANISH_FREQ = {
  E: 13.7, A: 12.5, O: 8.7, S: 7.9, R: 6.9, N: 6.7, I: 6.2,
  D: 5.9, L: 5.0, C: 4.7, T: 4.6, U: 3.9, M: 3.2, P: 2.5,
  B: 1.4, G: 1.0, V: 0.9, Y: 0.9, Q: 0.9, H: 0.7, F: 0.7,
  J: 0.4, Z: 0.5, X: 0.2, W: 0.01, K: 0.01, Ñ: 0.3,
};
