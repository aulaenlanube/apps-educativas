// src/apps/crucigrama/crosswordGenerator.js
// Generador de crucigramas sencillo basado en algoritmo greedy con intersecciones.

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-ZÑ]/g, '');

/**
 * Comprueba si se puede colocar una palabra en la posición indicada.
 * - La palabra debe caber dentro del grid.
 * - Las letras que ya existen deben coincidir (intersección).
 * - Las celdas vacías no pueden tocar otras letras perpendiculares.
 * - Las celdas antes/después de la palabra en la misma dirección deben estar vacías.
 */
function canPlace(grid, word, row, col, dir, maxSize) {
  if (row < 0 || col < 0) return false;
  if (dir === 'h' && col + word.length > maxSize) return false;
  if (dir === 'v' && row + word.length > maxSize) return false;

  // Celda justo antes (misma dirección) debe estar vacía
  if (dir === 'h') {
    if (col > 0 && grid[row][col - 1]) return false;
    if (col + word.length < maxSize && grid[row][col + word.length]) return false;
  } else {
    if (row > 0 && grid[row - 1][col]) return false;
    if (row + word.length < maxSize && grid[row + word.length][col]) return false;
  }

  let hasIntersection = false;
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'v' ? row + i : row;
    const c = dir === 'h' ? col + i : col;
    const existing = grid[r][c];

    if (existing) {
      if (existing !== word[i]) return false;
      hasIntersection = true;
    } else {
      // Celda vacía: los vecinos perpendiculares no deben tener letras
      if (dir === 'h') {
        if (r > 0 && grid[r - 1][c]) return false;
        if (r < maxSize - 1 && grid[r + 1][c]) return false;
      } else {
        if (c > 0 && grid[r][c - 1]) return false;
        if (c < maxSize - 1 && grid[r][c + 1]) return false;
      }
    }
  }
  return hasIntersection;
}

function placeWord(grid, word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'v' ? row + i : row;
    const c = dir === 'h' ? col + i : col;
    grid[r][c] = word[i];
  }
}

/**
 * Intenta colocar una palabra cruzándola con las ya colocadas.
 * Devuelve {row, col, dir} o null.
 */
function findPlacement(grid, placed, word, maxSize) {
  const candidates = [];
  for (let l = 0; l < word.length; l++) {
    const letter = word[l];
    for (const p of placed) {
      for (let k = 0; k < p.word.length; k++) {
        if (p.word[k] !== letter) continue;
        const newDir = p.direction === 'h' ? 'v' : 'h';
        let newRow, newCol;
        if (p.direction === 'h') {
          newRow = p.row - l;
          newCol = p.col + k;
        } else {
          newRow = p.row + k;
          newCol = p.col - l;
        }
        if (canPlace(grid, word, newRow, newCol, newDir, maxSize)) {
          // Priorizar colocaciones que crean más intersecciones (score = 1 por ahora)
          candidates.push({ row: newRow, col: newCol, dir: newDir });
        }
      }
    }
  }
  if (candidates.length === 0) return null;
  // Elegir al azar entre las válidas para variedad
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Recorta el grid al bounding box real (elimina filas/columnas vacías en los bordes).
 */
function trimGrid(grid, placed) {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c]) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }
  if (minR === Infinity) return { grid: [], width: 0, height: 0, placed: [] };

  const height = maxR - minR + 1;
  const width = maxC - minC + 1;
  const out = Array.from({ length: height }, () => Array(width).fill(null));
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      out[r][c] = grid[r + minR][c + minC];
    }
  }
  const trimmedPlaced = placed.map((p) => ({
    ...p,
    row: p.row - minR,
    col: p.col - minC,
  }));
  return { grid: out, width, height, placed: trimmedPlaced };
}

/**
 * Asigna numeración a las celdas donde empiezan palabras (1, 2, 3, ...)
 * y devuelve pistas ordenadas por horizontal/vertical.
 */
function assignNumbers(trimmed) {
  const { grid, placed, width, height } = trimmed;
  const cellNumbers = Array.from({ length: height }, () => Array(width).fill(0));
  // Ordenamos las palabras por fila y luego columna para numerar correctamente
  const sorted = [...placed].sort((a, b) => (a.row - b.row) || (a.col - b.col));
  let counter = 0;
  const numbered = [];
  for (const p of sorted) {
    const existing = cellNumbers[p.row][p.col];
    let num;
    if (existing) {
      num = existing;
    } else {
      counter += 1;
      num = counter;
      cellNumbers[p.row][p.col] = counter;
    }
    numbered.push({ ...p, number: num });
  }
  // Reordenar: numerar todas las posibles esquinas top-left en orden lectura
  // En realidad ya lo hemos hecho, pero normalizar numeración definitiva:
  const finalNumbers = Array.from({ length: height }, () => Array(width).fill(0));
  const byStart = new Map();
  for (const p of numbered) {
    const key = `${p.row},${p.col}`;
    if (!byStart.has(key)) byStart.set(key, []);
    byStart.get(key).push(p);
  }
  let finalNum = 0;
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const key = `${r},${c}`;
      if (byStart.has(key)) {
        finalNum += 1;
        finalNumbers[r][c] = finalNum;
        for (const p of byStart.get(key)) {
          p.number = finalNum;
        }
      }
    }
  }
  return {
    grid,
    width,
    height,
    placed: numbered,
    numbers: finalNumbers,
  };
}

/**
 * Genera un crucigrama a partir de una lista de palabras.
 * @param {Array<{word: string, clue: string}>} wordList
 * @param {Object} options
 * @param {number} options.targetWords - Número aproximado de palabras a colocar
 * @param {number} options.maxSize - Tamaño máximo del grid interno
 * @returns {Object|null} crucigrama generado o null si falla
 */
export function generateCrossword(wordList, options = {}) {
  const targetWords = options.targetWords || 10;
  const maxSize = options.maxSize || 20;

  // Normalizar y filtrar
  const candidatos = wordList
    .map((w) => ({
      original: String(w.word || '').trim(),
      word: normalize(w.word || ''),
      clue: String(w.clue || '').trim(),
    }))
    .filter((w) => w.word.length >= 3 && w.word.length <= maxSize - 2 && w.clue);

  // Quitar duplicados por palabra
  const seen = new Set();
  const unique = candidatos.filter((w) => {
    if (seen.has(w.word)) return false;
    seen.add(w.word);
    return true;
  });

  if (unique.length === 0) return null;

  // Intentar varias veces con diferentes órdenes y quedarse con el mejor
  let mejor = null;
  const intentos = 8;
  for (let intento = 0; intento < intentos; intento++) {
    // Ordenar: longest first en el primer intento, shuffled en el resto
    let orden;
    if (intento === 0) {
      orden = [...unique].sort((a, b) => b.word.length - a.word.length);
    } else {
      orden = [...unique].sort(() => Math.random() - 0.5);
      // Primera palabra debe ser larga
      orden.sort((a, b) => {
        if (a === orden[0]) return -1;
        return b.word.length - a.word.length;
      });
    }

    const grid = Array.from({ length: maxSize }, () => Array(maxSize).fill(null));
    const placed = [];

    // Colocar primera palabra horizontalmente en el centro
    const first = orden[0];
    const mid = Math.floor(maxSize / 2);
    const startCol = mid - Math.floor(first.word.length / 2);
    placeWord(grid, first.word, mid, startCol, 'h');
    placed.push({
      original: first.original,
      word: first.word,
      clue: first.clue,
      row: mid,
      col: startCol,
      direction: 'h',
    });

    // Intentar colocar el resto
    for (let i = 1; i < orden.length && placed.length < targetWords; i++) {
      const w = orden[i];
      const pos = findPlacement(grid, placed, w.word, maxSize);
      if (pos) {
        placeWord(grid, w.word, pos.row, pos.col, pos.dir);
        placed.push({
          original: w.original,
          word: w.word,
          clue: w.clue,
          row: pos.row,
          col: pos.col,
          direction: pos.dir,
        });
      }
    }

    if (!mejor || placed.length > mejor.placed.length) {
      mejor = { grid, placed };
    }
    if (placed.length >= targetWords) break;
  }

  if (!mejor || mejor.placed.length < 2) return null;

  const trimmed = trimGrid(mejor.grid, mejor.placed);
  const result = assignNumbers(trimmed);
  return result;
}

/**
 * Dado un crucigrama, devuelve las palabras agrupadas por dirección y ordenadas por número.
 */
export function groupClues(crossword) {
  const h = crossword.placed.filter((p) => p.direction === 'h').sort((a, b) => a.number - b.number);
  const v = crossword.placed.filter((p) => p.direction === 'v').sort((a, b) => a.number - b.number);
  return { horizontales: h, verticales: v };
}
