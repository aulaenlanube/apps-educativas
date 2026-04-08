// src/apps/sopa-de-letras/wordSearchGenerator.js
// Generador de sopa de letras: coloca palabras en 8 direcciones
// y rellena los huecos con letras aleatorias.

const DIRECTIONS = [
  { dr: 0, dc: 1, name: 'h' },     // derecha
  { dr: 0, dc: -1, name: 'hr' },   // izquierda (inversa)
  { dr: 1, dc: 0, name: 'v' },     // abajo
  { dr: -1, dc: 0, name: 'vr' },   // arriba (inversa)
  { dr: 1, dc: 1, name: 'd1' },    // diagonal abajo-derecha
  { dr: -1, dc: -1, name: 'd1r' }, // diagonal arriba-izquierda
  { dr: 1, dc: -1, name: 'd2' },   // diagonal abajo-izquierda
  { dr: -1, dc: 1, name: 'd2r' },  // diagonal arriba-derecha
];

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-ZÑ]/g, '');

function canPlace(grid, word, row, col, dir, size) {
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    const existing = grid[r][c];
    if (existing && existing !== word[i]) return false;
  }
  return true;
}

function placeWordInGrid(grid, word, row, col, dir) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    const r = row + dir.dr * i;
    const c = col + dir.dc * i;
    grid[r][c] = word[i];
    cells.push({ r, c });
  }
  return cells;
}

/**
 * Genera una sopa de letras con las palabras indicadas.
 * @param {Array<{word: string, clue?: string}>} wordList
 * @param {Object} options
 * @param {number} options.size - Tamaño del grid (N×N)
 * @param {number} options.targetWords - Palabras a colocar como máximo
 * @param {boolean} options.allowReverse - Permitir palabras invertidas
 * @param {boolean} options.allowDiagonal - Permitir diagonales
 */
export function generateWordSearch(wordList, options = {}) {
  const size = options.size || 13;
  const targetWords = options.targetWords || 12;
  const allowReverse = options.allowReverse !== false;
  const allowDiagonal = options.allowDiagonal !== false;
  const maxAttempts = 120;

  // Normalizar y filtrar
  const normalized = wordList
    .map((w) => ({
      word: normalize(w.word || ''),
      clue: w.clue || '',
      original: String(w.word || '').trim(),
    }))
    .filter((w) => w.word.length >= 3 && w.word.length <= size);

  // Quitar duplicados
  const seen = new Set();
  const unique = normalized.filter((w) => {
    if (seen.has(w.word)) return false;
    seen.add(w.word);
    return true;
  });

  if (unique.length === 0) return null;

  // Barajar para variedad, pero asegurar que las largas entren primero
  const shuffled = [...unique].sort(() => Math.random() - 0.5);
  shuffled.sort((a, b) => b.word.length - a.word.length);

  // Direcciones habilitadas
  const allowedDirs = DIRECTIONS.filter((d) => {
    if (!allowReverse && ['hr', 'vr', 'd1r', 'd2r'].includes(d.name)) return false;
    if (!allowDiagonal && ['d1', 'd2', 'd1r', 'd2r'].includes(d.name)) return false;
    return true;
  });

  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placed = [];

  for (const w of shuffled) {
    if (placed.length >= targetWords) break;
    if (w.word.length > size) continue;

    let success = false;
    for (let attempt = 0; attempt < maxAttempts && !success; attempt++) {
      const dir = allowedDirs[Math.floor(Math.random() * allowedDirs.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (canPlace(grid, w.word, row, col, dir, size)) {
        const cells = placeWordInGrid(grid, w.word, row, col, dir);
        placed.push({
          word: w.word,
          clue: w.clue,
          original: w.original,
          row,
          col,
          dir: dir.name,
          cells,
          found: false,
        });
        success = true;
      }
    }
  }

  // Rellenar huecos con letras aleatorias
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, size, placed };
}

/**
 * Ajusta una selección a una línea válida (horizontal, vertical o diagonal 45°)
 * y devuelve todas las celdas intermedias de la línea.
 */
export function snapSelection(r1, c1, r2, c2) {
  const dr = r2 - r1;
  const dc = c2 - c1;
  const adr = Math.abs(dr);
  const adc = Math.abs(dc);

  if (adr === 0 && adc === 0) return [{ r: r1, c: c1 }];

  let stepR, stepC, length;
  if (adr === 0) {
    stepR = 0;
    stepC = dc > 0 ? 1 : -1;
    length = adc;
  } else if (adc === 0) {
    stepR = dr > 0 ? 1 : -1;
    stepC = 0;
    length = adr;
  } else if (adr > adc * 2) {
    // Mayormente vertical
    stepR = dr > 0 ? 1 : -1;
    stepC = 0;
    length = adr;
  } else if (adc > adr * 2) {
    // Mayormente horizontal
    stepR = 0;
    stepC = dc > 0 ? 1 : -1;
    length = adc;
  } else {
    // Diagonal
    stepR = dr > 0 ? 1 : -1;
    stepC = dc > 0 ? 1 : -1;
    length = Math.max(adr, adc);
  }

  const cells = [];
  for (let i = 0; i <= length; i++) {
    cells.push({ r: r1 + stepR * i, c: c1 + stepC * i });
  }
  return cells;
}

/**
 * Comprueba si las celdas seleccionadas forman una palabra del puzzle.
 * Devuelve la entrada encontrada o null.
 */
export function checkSelection(cells, grid, placed) {
  if (!cells || cells.length < 2) return null;
  const word = cells
    .map(({ r, c }) => (grid?.[r]?.[c] || ''))
    .join('');
  const reversed = word.split('').reverse().join('');
  for (const p of placed) {
    if (p.found) continue;
    if (p.word === word || p.word === reversed) return p;
  }
  return null;
}
