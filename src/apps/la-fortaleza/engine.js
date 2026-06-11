// src/apps/la-fortaleza/engine.js
// Motor determinista de La Fortaleza (tower defense educativo).
// Todo el azar sale de un seed (mulberry32): mismo seed + mismos pools = misma partida.
// Preparado para duelo 1 vs 1: injectEnemies() permite insertar enemigos en caliente
// y el estado completo vive en un objeto plano sin singletons ni Date.now().

// ---------------------------------------------------------------------------
// RNG con semilla
// ---------------------------------------------------------------------------

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(arr, rng) {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ---------------------------------------------------------------------------
// Constantes de equilibrio (tuning centralizado)
// ---------------------------------------------------------------------------

export const GRID = { cols: 16, rows: 9, cell: 60 };
export const WORLD = { w: GRID.cols * GRID.cell, h: GRID.rows * GRID.cell }; // 960x540

export const CATEGORY_COLORS = ['#22c55e', '#38bdf8', '#fbbf24', '#f472b6'];

export const STARTING_COINS = 220;
export const STARTING_LIVES = 10;
export const COINS_PER_CORRECT = 80;
export const COINS_STREAK_BONUS = 10;   // por punto de racha, capado
export const COINS_STREAK_CAP = 50;
export const JAM_SECONDS = 3;           // atasco al fallar una clasificación

// --- flujo continuo: nivel de amenaza en lugar de oleadas ---
export const LEVEL_SECONDS = 30;        // cada 30 s sube el nivel de amenaza
export const LEVEL_COIN_BONUS = 35;     // paga automática al subir de nivel
export const EXAM_VICTORY_LEVEL = 9;    // examen: sobrevive hasta el nivel 9 (~4 min)
export const BOSS_EVERY_LEVELS = 4;     // jefe al alcanzar los niveles 4, 8, 12...
export const MINIGAME_EVERY_LEVELS = 3; // Desafío Relámpago en los niveles 3, 6, 9...
export const SPAWN_BASE_INTERVAL = 3.4; // s entre enemigos al empezar
export const SPAWN_DECAY = 0.88;        // el intervalo se multiplica por esto cada nivel
export const SPAWN_MIN_INTERVAL = 0.55;
export const GRACE_SECONDS = 6;         // respiro inicial antes del primer enemigo
// puertas activas según el nivel de amenaza: 1 (nv. 1-2) → 2 (nv. 3-4) → 3 (nv. 5+)
export const gateCountForLevel = (level, totalGates) =>
  Math.min(1 + Math.floor((level - 1) / 2), totalGates);

// --- preguntas periódicas durante la acción ---
export const QUESTION_FIRST = 12;        // s hasta la primera pregunta
export const QUESTION_INTERVAL = 30;     // s entre preguntas
export const QUESTION_INTERVAL_ORACLE = 16; // con el Oráculo construido
export const CLASSIFY_DMG_PCT = 0.45;   // daño del disparo de precisión (sobre HP máx)
export const REVEALED_DMG_MULT = 1.25;  // enemigos clasificados reciben más daño

// --- energía y habilidades activas (el conocimiento se convierte en poder) ---
export const ENERGY_MAX = 100;
export const ENERGY_START = 40;
export const ENERGY_PER_CORRECT = 25;   // por pregunta acertada
export const ENERGY_PER_CRIT = 20;      // por clasificación correcta
export const ENERGY_PER_KILL = 2;
export const ABILITY_GLOBAL_CD = 2;     // segundos entre habilidades

export const ABILITIES = {
  meteoro:  { id: 'meteoro', name: 'Meteoro', emoji: '☄️', cost: 50, radius: 85, desc: 'Impacto en área que daña a CUALQUIER categoría.' },
  ventisca: { id: 'ventisca', name: 'Ventisca', emoji: '🌨️', cost: 30, radius: 110, slowPct: 0.6, slowDur: 3.5, desc: 'Congela la zona: todos los enemigos van mucho más lentos.' },
  rayo:     { id: 'rayo', name: 'Rayo', emoji: '⚡', cost: 40, radius: 70, desc: 'Fulmina al enemigo más avanzado de la zona.' },
};

export const TOWER_TYPES = {
  arquero: { id: 'arquero', name: 'Arquero', emoji: '🏹', cost: 80, dmg: 14, range: 115, rate: 1.1, projSpeed: 420, kind: 'single', needsCategory: true, desc: 'Equilibrado. Dispara flechas a su categoría.' },
  rafaga:  { id: 'rafaga', name: 'Ráfaga', emoji: '⚡', cost: 110, dmg: 6, range: 95, rate: 3.2, projSpeed: 520, kind: 'single', needsCategory: true, desc: 'Disparo muy rápido de poco daño.' },
  canon:   { id: 'canon', name: 'Cañón', emoji: '💣', cost: 160, dmg: 24, range: 105, rate: 0.55, projSpeed: 300, kind: 'splash', splash: 55, needsCategory: true, desc: 'Daño en área a su categoría. Lento pero demoledor.' },
  hielo:   { id: 'hielo', name: 'Hielo', emoji: '❄️', cost: 130, dmg: 4, range: 105, rate: 1.0, projSpeed: 380, kind: 'slow', slowPct: 0.5, slowDur: 2, needsCategory: false, desc: 'Apoyo: ralentiza a CUALQUIER enemigo.' },
  prisma:  { id: 'prisma', name: 'Prisma', emoji: '🔮', cost: 260, dmg: 16, range: 130, rate: 1.3, kind: 'beam', needsCategory: false, desc: 'Rayo universal: daña a cualquier categoría.' },
  muralla: { id: 'muralla', name: 'Muralla', emoji: '🧱', cost: 100, dmg: 0, range: 0, rate: 0, kind: 'barrier', needsCategory: false, baseHp: 260, hpPerLevel: 140, desc: 'Se coloca SOBRE el camino y bloquea el paso hasta que la derriban.' },
  oraculo: { id: 'oraculo', name: 'Oráculo', emoji: '🧿', cost: 150, dmg: 0, range: 0, rate: 0, kind: 'oracle', needsCategory: false, unique: true, desc: 'Acelera las preguntas durante la acción: más monedas y energía.' },
  santuario: { id: 'santuario', name: 'Santuario', emoji: '💖', cost: 200, dmg: 0, range: 130, rate: 0, kind: 'sanctuary', needsCategory: false, unique: true, desc: 'Cura 1 vida a la Biblioteca cada 30 s y ralentiza a los enemigos cercanos.' },
};

// --- Santuario: se desbloquea acertando preguntas durante la partida ---
export const SANCT_UNLOCK_CORRECT = 8;  // aciertos académicos para desbloquearlo
export const SANCT_HEAL_INTERVAL = 30;  // s entre curaciones (+1 vida, máx 10)
export const SANCT_SLOW_PCT = 0.25;     // ralentización del aura

// --- mejoras de la fortaleza: se compran en orden, cada una más cara ---
export const FORT_WALL_R = 80; // px: media anchura de la muralla externa (anillo)
export const FORT_UPGRADES = [
  {
    id: 'muralla_fort', name: 'Muralla externa', emoji: '🛡️', cost: 150, shield: 4,
    desc: 'Rodea la Biblioteca: absorbe los 4 primeros enemigos que lleguen (un jefe gasta 3). Recupera 1 escudo al subir de nivel.',
  },
  {
    id: 'torretas_fort', name: 'Torretas gemelas', emoji: '🗼', cost: 280,
    dmg: 7, range: 140, rate: 2.8, projSpeed: 500, proj: 'fort_turret',
    desc: 'Dos torretas en las esquinas de la muralla: disparo rápido de corto alcance que daña a CUALQUIER categoría.',
  },
  {
    id: 'canon_fort', name: 'Gran Cañón', emoji: '💥', cost: 450,
    dmg: 95, range: 430, rate: 1 / 6, projSpeed: 240, splash: 70, proj: 'fort_canon',
    desc: 'Cañón de largo alcance en el tejado: tarda 6 s en recargar pero su impacto devasta en área a cualquier categoría.',
  },
];
// proyectiles del armamento de la fortaleza (universales, sin categoría)
const FORT_PROJ = {
  fort_turret: { kind: 'single' },
  fort_canon: { kind: 'splash', splash: FORT_UPGRADES[2].splash },
};

// ---------------------------------------------------------------------------
// Reliquias (roguelite): cada RELIC_OFFER_EVERY niveles el juego ofrece 3 al
// azar (con la rng de la partida: determinista) y el jugador se queda una.
// Efectos pasivos acumulables que el resto del engine lee en game.relicMods.
// ---------------------------------------------------------------------------
export const RELICS = {
  catalejo:   { id: 'catalejo', name: 'Catalejo del vigía', desc: '+15% de alcance para todas las torres.' },
  forja:      { id: 'forja', name: 'Forja encantada', desc: '+20% de daño para todas las torres.' },
  argamasa:   { id: 'argamasa', name: 'Argamasa de obsidiana', desc: 'Las murallas nuevas tienen +60% de vida y todas se reparan solas (4/s).' },
  bolsa:      { id: 'bolsa', name: 'Bolsa del mercader', desc: '+35% de monedas en respuestas y pagas de nivel.' },
  estandarte: { id: 'estandarte', name: 'Estandarte real', desc: 'Los caballeros salen un 35% más a menudo y con +40% de vida.' },
  polvora:    { id: 'polvora', name: 'Pólvora refinada', desc: '+40% de radio de explosión para cañones y Gran Cañón.' },
  reloj:      { id: 'reloj', name: 'Reloj de arena', desc: 'Las habilidades se recargan un 40% más rápido.' },
  amuleto:    { id: 'amuleto', name: 'Amuleto del bibliotecario', desc: 'La Biblioteca recupera 1 vida al subir de nivel (máx. 10).' },
};
export const RELIC_OFFER_EVERY = 2;  // niveles entre ofertas
export const MAX_RELICS = 5;         // tope por partida

const RELIC_EFFECTS = {
  catalejo:   (m) => { m.range *= 1.15; },
  forja:      (m) => { m.dmg *= 1.2; },
  argamasa:   (m) => { m.wallHp *= 1.6; m.wallRegen += 4; },
  bolsa:      (m) => { m.coins *= 1.35; },
  estandarte: (m) => { m.allyRate *= 0.74; m.allyHp *= 1.4; },
  polvora:    (m) => { m.splash *= 1.4; },
  reloj:      (m) => { m.abilityCd *= 0.6; },
  amuleto:    (m) => { m.lifePerLevel += 1; },
};

function defaultRelicMods() {
  return { range: 1, dmg: 1, wallHp: 1, wallRegen: 0, coins: 1, allyRate: 1, allyHp: 1, splash: 1, abilityCd: 1, lifePerLevel: 0 };
}

function recomputeRelicMods(game) {
  const m = defaultRelicMods();
  for (const id of game.relics) RELIC_EFFECTS[id]?.(m);
  game.relicMods = m;
}

/** El jugador elige una de las reliquias ofrecidas (evento relic_offer). */
export function chooseRelic(game, relicId) {
  if (!game.pendingRelics || !game.pendingRelics.includes(relicId)) return false;
  game.relics.push(relicId);
  game.pendingRelics = null;
  recomputeRelicMods(game);
  pushText(game, WORLD.w / 2, WORLD.h / 2 - 30, `¡${RELICS[relicId].name}!`, '#c084fc');
  return true;
}

// ---------------------------------------------------------------------------
// Asedio infinito: tras ganar el examen se puede seguir jugando. La nota ya
// está sellada en la UI; aquí solo crece la dificultad y el botín de puntos.
// ---------------------------------------------------------------------------
export const scoreMult = (game) => (game.endless ? 1 + 0.25 * (game.level - EXAM_VICTORY_LEVEL) : 1);
const endlessHpMult = (game) => (game.endless ? 1 + 0.15 * (game.level - EXAM_VICTORY_LEVEL) : 1);
const endlessSpeedMult = (game) => (game.endless ? 1 + Math.min(0.03 * (game.level - EXAM_VICTORY_LEVEL), 0.45) : 1);

export function enterEndless(game) {
  if (game.mode !== 'exam' || game.endless || game.level < EXAM_VICTORY_LEVEL) return false;
  game.endless = true;
  game.phase = 'run';
  game.levelUpAt = game.time + LEVEL_SECONDS;
  pushText(game, WORLD.w / 2, WORLD.h / 2 - 40, '⚔️ ¡ASEDIO INFINITO!', '#f87171');
  return true;
}

export const MAX_TOWER_LEVEL = 3;
export const MOVE_COST = 30;            // recolocar cualquier construcción
// --- estructuras destructibles y saboteadores ---
export const TOWER_BASE_HP = 90;        // +45 por nivel (mejorar repara del todo)
export const TOWER_HP_PER_LEVEL = 45;
export const SABO_RANGE = 65;           // px: distancia a la que ataca torres
export const SABO_DMG = 12;             // por golpe (1/s) → ~8s por torre nueva

// --- aliados: caballeros que salen de la fortaleza ---
export const ALLY = {
  interval: 16,      // s entre caballeros
  firstDelay: 3,     // s tras empezar la oleada
  max: 2,            // vivos a la vez
  hp: 60,            // escalado por oleada
  dmg: 13,
  attackRate: 0.7,   // s entre espadazos
  speed: 55,
  radius: 14,
  engageDist: 26,    // px sobre el camino para trabar combate
};
export const upgradeCost = (type, level) => Math.round(TOWER_TYPES[type].cost * (level === 1 ? 0.6 : 0.9));
export const sellValue = (tower) => Math.round(tower.invested * 0.75);

export const ENEMY_TYPES = {
  scout:  { id: 'scout', hp: 18, speed: 80, radius: 12, melee: 5 },
  normal: { id: 'normal', hp: 32, speed: 50, radius: 16, melee: 8 },
  brute:  { id: 'brute', hp: 85, speed: 33, radius: 21, melee: 16 },
  sabo:   { id: 'sabo', hp: 55, speed: 40, radius: 17, melee: 10 }, // demoledor de torres
  boss:   { id: 'boss', hp: 400, speed: 24, radius: 30, melee: 40 },
};

// Curva agresiva por nivel de amenaza: partidas cortas e intensas.
const levelHpMult = (level) => 1 + 0.3 * (level - 1) + 0.033 * (level - 1) * (level - 1);
const levelSpeedMult = (level) => 1 + Math.min(0.04 * (level - 1), 0.7);
export const spawnInterval = (level) => Math.max(SPAWN_BASE_INTERVAL * Math.pow(SPAWN_DECAY, level - 1), SPAWN_MIN_INTERVAL);
export const killPoints = (enemy, wave) => (enemy.type === 'boss' ? 300 : 10 + 2 * wave);

// ---------------------------------------------------------------------------
// Generación procedural del mapa (camino ortogonal + suavizado Chaikin)
// ---------------------------------------------------------------------------

function buildPathData(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  return { points: pts, cum, totalLen: cum[cum.length - 1] };
}

const center = ([cc, rr]) => ({ x: cc * GRID.cell + GRID.cell / 2, y: rr * GRID.cell + GRID.cell / 2 });

// Mapa con 3 puertas: un tronco principal de izquierda a derecha y dos ramas
// en L que entran por los bordes superior/inferior y se unen al tronco en dos
// puntos distintos. Las puertas se abren progresivamente con el nivel de
// amenaza (1 → 2 → 3); el tramo común tras la última unión es el cuello de
// botella definitivo.
function generateMap(rng) {
  const { cols, rows, cell } = GRID;
  let r = 2 + Math.floor(rng() * 5); // fila inicial 2..6
  let c = 0;
  const cells = [[c, r]];
  const visited = new Set([`${c},${r}`]);

  while (c < cols - 1) {
    // tramo horizontal corto (1..2 celdas): el camino serpentea más y es más largo
    const hLen = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < hLen && c < cols - 1; i++) {
      c++; cells.push([c, r]); visited.add(`${c},${r}`);
    }
    if (c >= cols - 1) break;
    // tramo vertical (1..3 celdas) sin salirse de 1..7 ni pisar celdas previas
    const dir = rng() < 0.5 ? -1 : 1;
    const vLen = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < vLen; i++) {
      const nr = r + dir;
      if (nr < 1 || nr > rows - 2 || visited.has(`${c},${nr}`)) break;
      r = nr; cells.push([c, r]); visited.add(`${c},${r}`);
    }
  }

  // --- ramas secundarias: en L desde un borde hasta una celda de unión ---
  // Busca una rama cuya unión caiga en la ventana [loFrac, hiFrac) del tronco.
  // preferTop fuerza el borde de entrada (con fallback al contrario).
  const tryBranch = (loFrac, hiFrac, preferTop) => {
    const candidates = [];
    for (let i = Math.floor(cells.length * loFrac); i < Math.floor(cells.length * hiFrac); i++) candidates.push(i);
    for (const idx of seededShuffle(candidates, rng)) {
      const [jc, jr] = cells[idx];
      const farTop = jr >= Math.floor(rows / 2); // el borde más lejano da ramas más largas
      const first = preferTop != null ? preferTop : farTop;
      for (const fromTop of [first, !first]) {
        const edgeRow = fromTop ? 0 : rows - 1;
        const step = fromTop ? 1 : -1;
        for (const cc of seededShuffle([jc - 3, jc - 2, jc + 2, jc + 3, jc - 1, jc + 1], rng)) {
          if (cc < 1 || cc > cols - 2) continue;
          const tryCells = [];
          let ok = true;
          for (let rr = edgeRow; rr !== jr && ok; rr += step) {
            if (visited.has(`${cc},${rr}`)) ok = false;
            else tryCells.push([cc, rr]);
          }
          const dirH = cc < jc ? 1 : -1;
          for (let xx = cc; xx !== jc && ok; xx += dirH) {
            if (visited.has(`${xx},${jr}`)) ok = false;
            else tryCells.push([xx, jr]);
          }
          if (ok && tryCells.length >= 4) return { cells: tryCells, junctionIdx: idx, fromTop };
        }
      }
    }
    return null;
  };

  const branches = [];
  const commitBranch = (b) => {
    if (!b) return;
    for (const [cc, rr] of b.cells) visited.add(`${cc},${rr}`);
    branches.push(b);
  };
  const b1 = tryBranch(0.18, 0.46, null);
  commitBranch(b1);
  // la segunda rama intenta entrar por el borde contrario y unirse más adelante
  commitBranch(tryBranch(0.5, 0.78, b1 ? !b1.fromTop : null));

  // Camino principal: entrada y salida fuera de pantalla
  const mainPts = [
    { x: -cell / 2, y: center(cells[0]).y },
    ...cells.map(center),
    { x: WORLD.w + cell / 2, y: center(cells[cells.length - 1]).y },
  ];
  const paths = [buildPathData(mainPts)];

  for (const b of branches) {
    const first = center(b.cells[0]);
    const entry = { x: first.x, y: b.cells[0][1] === 0 ? -cell / 2 : WORLD.h + cell / 2 };
    // la rama continúa por el tronco desde la unión (índice +1 por el punto de entrada)
    const branchPts = [entry, ...b.cells.map(center), ...mainPts.slice(b.junctionIdx + 1)];
    paths.push(buildPathData(branchPts));
  }

  const main = paths[0];

  // ancla de la fortaleza (justo tras el final del tronco) y explanada
  // reservada: las celdas que ocupará la muralla externa no son edificables
  const fortP = pointAtDistance(main, main.totalLen - 24);
  const [ec, er] = cells[cells.length - 1];
  const fortCells = new Set();
  for (const rr of [er - 1, er + 1]) {
    if (rr >= 0 && rr < rows) fortCells.add(`${ec},${rr}`);
  }

  return {
    paths,
    pathCells: visited,
    fortCells,
    fort: { x: fortP.x + 18, y: fortP.y },
    points: main.points,
    cum: main.cum,
    totalLen: main.totalLen,
    endCell: cells[cells.length - 1],
  };
}

export function pointAtDistance(map, d) {
  const { points, cum, totalLen } = map;
  if (d <= 0) return { ...points[0], angle: 0 };
  if (d >= totalLen) return { ...points[points.length - 1], angle: 0 };
  let lo = 0, hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= d) lo = mid; else hi = mid;
  }
  const t = (d - cum[lo]) / Math.max(cum[hi] - cum[lo], 0.0001);
  const p = points[lo], q = points[hi];
  return {
    x: p.x + (q.x - p.x) * t,
    y: p.y + (q.y - p.y) * t,
    angle: Math.atan2(q.y - p.y, q.x - p.x),
  };
}

// ---------------------------------------------------------------------------
// Creación de partida
// ---------------------------------------------------------------------------

/**
 * cfg = {
 *   seed: number,
 *   mode: 'practice' | 'exam',
 *   categories: [{ name, words: [string] }],  // 2-4 categorías activas
 * }
 */
export function createGame(cfg) {
  const rng = mulberry32(cfg.seed);
  const map = generateMap(rng);

  const categories = cfg.categories.map((cat, i) => ({
    name: cat.name,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    words: [...cat.words],
    deck: seededShuffle(cat.words, rng), // se reparte sin repetir hasta agotar
  }));

  return {
    mode: cfg.mode,
    seed: cfg.seed,
    rng,
    map,
    categories,
    time: 0,
    level: 1,              // nivel de amenaza (sube cada LEVEL_SECONDS)
    levelUpAt: 0,
    phase: 'idle',         // idle (preparación) | run (acción continua) | ended
    coins: STARTING_COINS,
    lives: STARTING_LIVES,
    score: 0,
    energy: ENERGY_START,
    abilityCdUntil: 0,
    enemies: [],
    towers: [],
    allies: [],
    allyNextAt: 0,
    allyGateRot: 0,        // reparto rotatorio de caballeros entre puertas abiertas
    gatesOpen: 1,          // puertas activas (sube con el nivel de amenaza)
    projectiles: [],
    particles: [],
    injected: [],          // cola del duelo futuro (injectEnemies)
    spawnTimer: 0,
    cluster: { catIdx: 0, remaining: 0 }, // ráfagas de la misma categoría
    jams: categories.map(() => 0), // instante hasta el que cada categoría está atascada
    questionNextAt: 0,             // próxima pregunta periódica
    sanctHealAt: 0,                // próxima curación del Santuario
    fortUpgrades: [],              // ids de FORT_UPGRADES comprados (en orden)
    fortShield: 0,                 // cargas de la muralla externa
    fortShieldMax: 0,
    fortTurrets: [],               // {x, y, cooldown, aim, flash}
    fortCannon: null,              // {x, y, cooldown, aim, flash}
    nextId: 1,
    relics: [],                    // ids de RELICS elegidas
    relicMods: defaultRelicMods(), // efectos acumulados (se recalculan al elegir)
    pendingRelics: null,           // oferta activa [3 ids] a la espera de elección
    endless: false,                // asedio infinito tras la victoria del examen
    stats: { kills: 0, leaks: 0, towersBuilt: 0, shielded: 0 },
  };
}

function drawWord(game, catIdx) {
  const cat = game.categories[catIdx];
  if (cat.deck.length === 0) cat.deck = seededShuffle(cat.words, game.rng);
  return cat.deck.pop();
}

// ---------------------------------------------------------------------------
// Flujo continuo: la acción empieza con startRun y ya no para
// ---------------------------------------------------------------------------

/** Arranca la acción continua tras la fase de preparación. */
export function startRun(game) {
  game.phase = 'run';
  game.levelUpAt = game.time + LEVEL_SECONDS;
  game.spawnTimer = GRACE_SECONDS;
  game.questionNextAt = game.time + QUESTION_FIRST;
  game.allyNextAt = game.time + ALLY.firstDelay;
}

/** Elige tipo y categoría del siguiente enemigo según el nivel de amenaza. */
function nextSpawnEntry(game) {
  const rng = game.rng;
  const level = game.level;
  // ráfagas de 2-4 enemigos de la misma categoría
  if (game.cluster.remaining <= 0) {
    const catCount = level <= 1 ? Math.min(2, game.categories.length) : game.categories.length;
    game.cluster = {
      catIdx: Math.floor(rng() * catCount),
      remaining: 2 + Math.floor(rng() * 3),
      pathId: Math.floor(rng() * game.gatesOpen), // cada ráfaga elige una puerta ABIERTA
    };
  }
  game.cluster.remaining--;

  let type = 'normal';
  const roll = rng();
  const scoutP = level >= 2 ? Math.min(0.12 + 0.02 * level, 0.3) : 0;
  const saboP = level >= 3 ? Math.min(0.03 + 0.013 * level, 0.14) : 0;
  if (roll < scoutP) type = 'scout';
  else if (roll < scoutP + saboP) type = 'sabo';
  else if (level >= 3 && roll > 1 - Math.min(0.08 + 0.025 * level, 0.3)) type = 'brute';
  return { type, catIdx: game.cluster.catIdx, pathId: game.cluster.pathId };
}

function spawnEnemy(game, entry) {
  const base = ENEMY_TYPES[entry.type];
  const hpMult = entry.type === 'boss' ? 1 + 0.45 * (game.level - 1) : levelHpMult(game.level);
  const maxHp = Math.round(base.hp * hpMult * endlessHpMult(game));
  const pathId = Math.min(entry.pathId ?? 0, game.map.paths.length - 1);
  const enemy = {
    id: game.nextId++,
    type: entry.type,
    pathId,
    catIdx: entry.catIdx,
    word: drawWord(game, entry.catIdx),
    dist: 0,
    hp: maxHp,
    maxHp,
    speed: base.speed * levelSpeedMult(game.level) * endlessSpeedMult(game),
    radius: base.radius,
    slowUntil: 0,
    slowPct: 0,
    classified: false,
    revealed: false,
    enraged: false,
    // variación procedural con semilla (tamaño, fase de animación, tono)
    shape: Array.from({ length: 8 }, () => 0.82 + game.rng() * 0.32),
    phase: game.rng() * Math.PI * 2,
    hue: Math.floor(game.rng() * 360),
    x: game.map.paths[pathId].points[0].x,
    y: game.map.paths[pathId].points[0].y,
    angle: 0,
  };
  game.enemies.push(enemy);
  return enemy;
}

/** Duelo futuro: el rival inyecta enemigos extra en el flujo. */
export function injectEnemies(game, entries) {
  for (const e of entries) {
    game.injected.push({ type: e.type || 'normal', catIdx: e.catIdx ?? 0 });
  }
}

// ---------------------------------------------------------------------------
// Torres
// ---------------------------------------------------------------------------

export function canBuildAt(game, col, row) {
  if (col < 0 || row < 0 || col >= GRID.cols || row >= GRID.rows) return false;
  if (game.map.pathCells.has(`${col},${row}`)) return false;
  if (game.map.fortCells.has(`${col},${row}`)) return false; // explanada de la fortaleza
  return !game.towers.some((t) => t.col === col && t.row === row);
}

export function placeTower(game, col, row, typeId, catIdx = null) {
  const type = TOWER_TYPES[typeId];
  // la muralla va SOBRE el camino; el resto, fuera de él (canPlace decide)
  if (!type || game.coins < type.cost || !canPlace(game, typeId, col, row)) return null;
  if (type.unique && game.towers.some((t) => t.type === typeId)) return null;
  game.coins -= type.cost;
  const baseHp = Math.round((type.baseHp || TOWER_BASE_HP) * (type.kind === 'barrier' ? game.relicMods.wallHp : 1));
  const tower = {
    id: game.nextId++,
    type: typeId,
    catIdx: type.needsCategory ? catIdx : null,
    col, row,
    x: col * GRID.cell + GRID.cell / 2,
    y: row * GRID.cell + GRID.cell / 2,
    level: 1,
    cooldown: 0,
    aim: -Math.PI / 2,
    invested: type.cost,
    flash: 0,
    hp: baseHp,
    maxHp: baseHp,
  };
  if (type.kind === 'barrier') tower.pathDists = barrierPathDists(game, col, row);
  if (type.kind === 'sanctuary') game.sanctHealAt = game.time + SANCT_HEAL_INTERVAL;
  game.towers.push(tower);
  game.stats.towersBuilt++;
  return tower;
}

/**
 * La muralla se coloca SOBRE el camino: celda de camino libre de estructuras.
 * El resto de construcciones usan canBuildAt (celdas fuera del camino).
 */
export function canPlaceBarrier(game, col, row) {
  if (col < 0 || row < 0 || col >= GRID.cols || row >= GRID.rows) return false;
  if (!game.map.pathCells.has(`${col},${row}`)) return false;
  return !game.towers.some((t) => t.col === col && t.row === row);
}

export function canPlace(game, typeId, col, row) {
  return TOWER_TYPES[typeId]?.kind === 'barrier'
    ? canPlaceBarrier(game, col, row)
    : canBuildAt(game, col, row);
}

/**
 * Distancia a lo largo de cada camino del centro de una celda de camino.
 * null si la celda no pertenece a ese camino (una muralla en el tramo común
 * tras la unión bloquea AMBOS frentes).
 */
function barrierPathDists(game, col, row) {
  const cx = col * GRID.cell + GRID.cell / 2;
  const cy = row * GRID.cell + GRID.cell / 2;
  return game.map.paths.map(({ points, cum }) => {
    let best = null, bestD = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.hypot(points[i].x - cx, points[i].y - cy);
      if (d < bestD) { bestD = d; best = cum[i]; }
    }
    return bestD <= GRID.cell / 2 ? best : null;
  });
}

/** Recoloca una construcción a otra celda válida por MOVE_COST monedas. */
export function moveTower(game, towerId, col, row) {
  const t = game.towers.find((x) => x.id === towerId);
  if (!t || game.coins < MOVE_COST || !canPlace(game, t.type, col, row)) return false;
  game.coins -= MOVE_COST;
  t.col = col; t.row = row;
  t.x = col * GRID.cell + GRID.cell / 2;
  t.y = row * GRID.cell + GRID.cell / 2;
  if (TOWER_TYPES[t.type].kind === 'barrier') t.pathDists = barrierPathDists(game, col, row);
  return true;
}

export function upgradeTower(game, towerId) {
  const t = game.towers.find((x) => x.id === towerId);
  if (!t || t.level >= MAX_TOWER_LEVEL || TOWER_TYPES[t.type].kind === 'oracle') return false;
  const cost = upgradeCost(t.type, t.level);
  if (game.coins < cost) return false;
  const type = TOWER_TYPES[t.type];
  game.coins -= cost;
  t.invested += cost;
  t.level++;
  const wallMult = type.kind === 'barrier' ? game.relicMods.wallHp : 1;
  t.maxHp = Math.round(((type.baseHp || TOWER_BASE_HP) + (type.hpPerLevel || TOWER_HP_PER_LEVEL) * (t.level - 1)) * wallMult);
  t.hp = t.maxHp; // mejorar también repara
  return true;
}

export function sellTower(game, towerId) {
  const idx = game.towers.findIndex((x) => x.id === towerId);
  if (idx === -1) return false;
  game.coins += sellValue(game.towers[idx]);
  game.towers.splice(idx, 1);
  return true;
}

// El segundo parámetro (game) aplica las reliquias; sin él, valores base.
const towerDmg = (t, g) => TOWER_TYPES[t.type].dmg * Math.pow(1.4, t.level - 1) * (g?.relicMods.dmg ?? 1);
export const towerRange = (t, g) => (TOWER_TYPES[t.type].range + 12 * (t.level - 1)) * (g?.relicMods.range ?? 1);

// ---------------------------------------------------------------------------
// Mejoras de la fortaleza (muralla externa → torretas → gran cañón)
// ---------------------------------------------------------------------------

/** Siguiente mejora disponible (se compran en orden) o null si está al máximo. */
export function nextFortUpgrade(game) {
  return FORT_UPGRADES[game.fortUpgrades.length] || null;
}

export function buyFortUpgrade(game) {
  const up = nextFortUpgrade(game);
  if (!up || game.coins < up.cost) return null;
  game.coins -= up.cost;
  game.fortUpgrades.push(up.id);
  const f = game.map.fort;
  if (up.id === 'muralla_fort') {
    game.fortShield = up.shield;
    game.fortShieldMax = up.shield;
  } else if (up.id === 'torretas_fort') {
    game.fortTurrets = [
      { x: f.x - FORT_WALL_R, y: f.y - FORT_WALL_R, cooldown: 0, aim: Math.PI, flash: 0 },
      { x: f.x - FORT_WALL_R, y: f.y + FORT_WALL_R, cooldown: 0, aim: Math.PI, flash: 0 },
    ];
  } else if (up.id === 'canon_fort') {
    game.fortCannon = { x: f.x, y: f.y, cooldown: 0, aim: Math.PI, flash: 0 };
  }
  pushBurst(game, f.x - 50, f.y, '#fbbf24', 18, 130);
  pushText(game, f.x - 50, f.y - 45, `¡${up.name}!`, '#fbbf24');
  return up;
}

// ---------------------------------------------------------------------------
// Clasificación manual (disparo de precisión)
// ---------------------------------------------------------------------------

export function classifyEnemy(game, enemyId, catIdx) {
  const e = game.enemies.find((x) => x.id === enemyId);
  if (!e || e.classified || e.hp <= 0) return null;
  e.classified = true;
  const correct = e.catIdx === catIdx;
  if (correct) {
    e.revealed = true;
    const dmg = Math.max(Math.round(e.maxHp * CLASSIFY_DMG_PCT), 20);
    applyDamage(game, e, dmg, null);
    const pts = Math.round(150 * scoreMult(game));
    game.score += pts;
    game.energy = Math.min(game.energy + ENERGY_PER_CRIT, ENERGY_MAX);
    pushText(game, e.x, e.y - 28, `¡CRÍTICO! +${pts}`, '#fbbf24');
  } else {
    game.jams[catIdx] = game.time + JAM_SECONDS;
    pushText(game, e.x, e.y - 28, '¡Torres atascadas!', '#ef4444');
  }
  return { correct, enemy: e };
}

/** Pregunta de jefe acertada: golpe del 70% de la vida actual. */
export function bossStrike(game, enemyId) {
  const e = game.enemies.find((x) => x.id === enemyId);
  if (!e || e.hp <= 0) return;
  applyDamage(game, e, Math.ceil(e.hp * 0.7), null);
  pushText(game, e.x, e.y - 40, '¡GOLPE DE SABIDURÍA!', '#a855f7');
}

/** Pregunta de jefe fallada: el jefe se enfurece. */
export function bossEnrage(game, enemyId) {
  const e = game.enemies.find((x) => x.id === enemyId);
  if (!e || e.enraged) return;
  e.enraged = true;
  e.speed *= 1.25;
  pushText(game, e.x, e.y - 40, '¡El jefe se enfurece!', '#ef4444');
}

// ---------------------------------------------------------------------------
// Simulación
// ---------------------------------------------------------------------------

function pushText(game, x, y, text, color) {
  game.particles.push({ kind: 'text', x, y, vx: 0, vy: -28, life: 1.4, maxLife: 1.4, text, color, size: 14 });
}

function pushBurst(game, x, y, color, count = 10, speed = 90) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + game.rng() * 0.5;
    const v = speed * (0.5 + game.rng() * 0.8);
    game.particles.push({
      kind: 'spark', x, y,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      life: 0.5 + game.rng() * 0.4, maxLife: 0.9,
      color, size: 2 + game.rng() * 3,
    });
  }
}

function applyDamage(game, enemy, dmg, tower) {
  let final = dmg;
  if (tower != null && enemy.revealed && tower.catIdx === enemy.catIdx) final *= REVEALED_DMG_MULT;
  enemy.hp -= final;
  enemy.hitFlash = 0.12;
}

function findTarget(game, tower) {
  const range = towerRange(tower, game);
  let best = null;
  for (const e of game.enemies) {
    if (e.hp <= 0) continue;
    const type = TOWER_TYPES[tower.type];
    if (type.needsCategory && e.catIdx !== tower.catIdx) continue;
    if (Math.hypot(e.x - tower.x, e.y - tower.y) > range) continue;
    if (!best || e.dist > best.dist) best = e; // prioriza al más avanzado
  }
  return best;
}

const BARRIER_CONTACT = 22; // px de separación al chocar con una muralla

/**
 * Avanza la simulación dt segundos. Devuelve una lista de eventos para
 * sonido/HUD: shoot, hit, death, leak, boss_spawn, level_up, question_time,
 * minigame_offer, tower_hit, tower_destroyed, ally_spawn, ally_death,
 * victory, defeat.
 */
export function stepGame(game, dt) {
  const events = [];
  if (game.phase !== 'run') {
    updateParticles(game, dt);
    game.time += dt;
    return events;
  }
  game.time += dt;

  // --- nivel de amenaza: sube cada LEVEL_SECONDS y acelera el flujo ---
  if (game.time >= game.levelUpAt) {
    game.level++;
    game.levelUpAt = game.time + LEVEL_SECONDS;
    const lvlCoins = Math.round(LEVEL_COIN_BONUS * game.relicMods.coins);
    game.coins += lvlCoins;
    pushText(game, WORLD.w / 2, WORLD.h / 2 - 60, `¡Nivel ${game.level}! +${lvlCoins} 🪙`, '#fde047');
    events.push({ t: 'level_up', level: game.level });
    // amuleto del bibliotecario: recupera 1 vida al subir de nivel
    if (game.relicMods.lifePerLevel > 0 && game.lives < STARTING_LIVES) {
      game.lives = Math.min(STARTING_LIVES, game.lives + game.relicMods.lifePerLevel);
      pushText(game, game.map.fort.x, game.map.fort.y - 55, '+1 ❤️', '#f87171');
    }
    if (game.mode === 'exam' && game.level >= EXAM_VICTORY_LEVEL && !game.endless) {
      game.phase = 'ended';
      game.score += game.lives * 50; // bonus por vidas restantes
      events.push({ t: 'victory' });
      return events;
    }
    // oferta de reliquia (determinista): 3 opciones del catálogo restante
    if (game.level % RELIC_OFFER_EVERY === 0 && !game.pendingRelics && game.relics.length < MAX_RELICS) {
      const pool = Object.keys(RELICS).filter((id) => !game.relics.includes(id));
      if (pool.length) {
        const options = [];
        while (options.length < Math.min(3, pool.length)) {
          const pick = pool[Math.floor(game.rng() * pool.length)];
          if (!options.includes(pick)) options.push(pick);
        }
        game.pendingRelics = options;
        events.push({ t: 'relic_offer', options });
      }
    }
    // despertar progresivo de las mini-fortalezas enemigas: 1 → 2 → 3 frentes
    const gates = gateCountForLevel(game.level, game.map.paths.length);
    if (gates > game.gatesOpen) {
      game.gatesOpen = gates;
      const p = pointAtDistance(game.map.paths[gates - 1], 45);
      pushBurst(game, p.x, p.y, '#f87171', 22, 150);
      pushText(game, p.x, p.y - 28, '¡Fortaleza enemiga!', '#f87171');
      events.push({ t: 'gate_open', pathId: gates - 1 });
    }
    // la muralla externa se reconstruye poco a poco con cada nivel superado
    if (game.fortShieldMax > 0 && game.fortShield < game.fortShieldMax) {
      game.fortShield++;
      pushText(game, game.map.fort.x - 50, game.map.fort.y - 30, '+1 🛡️', '#fbbf24');
      events.push({ t: 'shield_regen', left: game.fortShield });
    }
    if (game.level % BOSS_EVERY_LEVELS === 0) {
      const boss = spawnEnemy(game, {
        type: 'boss',
        catIdx: Math.floor(game.rng() * game.categories.length),
        pathId: Math.floor(game.rng() * game.gatesOpen),
      });
      events.push({ t: 'boss_spawn', enemy: boss });
    }
    if (game.level % MINIGAME_EVERY_LEVELS === 0) {
      events.push({ t: 'minigame_offer' });
    }
  }

  // --- spawns continuos, cada vez más frecuentes ---
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    const entry = game.injected.length ? game.injected.shift() : nextSpawnEntry(game);
    spawnEnemy(game, entry);
    game.spawnTimer = spawnInterval(game.level) * (0.8 + game.rng() * 0.4);
  }

  // --- pregunta periódica (el Oráculo las acelera) ---
  if (game.time >= game.questionNextAt) {
    const hasOracle = game.towers.some((t) => t.type === 'oraculo');
    game.questionNextAt = game.time + (hasOracle ? QUESTION_INTERVAL_ORACLE : QUESTION_INTERVAL);
    events.push({ t: 'question_time' });
  }

  // --- aliados: salen de la fortaleza y traban combate en el camino ---
  if (game.time >= game.allyNextAt && game.allies.length < ALLY.max) {
    game.allyNextAt = game.time + ALLY.interval * game.relicMods.allyRate;
    const hpMult = (1 + 0.2 * (game.level - 1)) * game.relicMods.allyHp;
    game.allyGateRot = (game.allyGateRot + 1) % game.gatesOpen; // reparte puertas abiertas
    const pathId = game.allyGateRot;
    const path = game.map.paths[pathId];
    const ally = {
      id: game.nextId++,
      pathId,
      dist: path.totalLen - 50,
      hp: Math.round(ALLY.hp * hpMult),
      maxHp: Math.round(ALLY.hp * hpMult),
      targetId: null,
      attackCd: 0,
      swing: 0,
      hitFlash: 0,
      phase: game.rng() * Math.PI * 2,
      x: 0, y: 0, angle: 0,
    };
    const p0 = pointAtDistance(path, ally.dist);
    ally.x = p0.x; ally.y = p0.y;
    game.allies.push(ally);
    events.push({ t: 'ally_spawn', ally });
  }

  for (const a of game.allies) {
    if (a.hp <= 0) continue;
    if (a.hitFlash > 0) a.hitFlash -= dt;
    if (a.swing > 0) a.swing -= dt;

    let target = a.targetId ? game.enemies.find((e) => e.id === a.targetId && e.hp > 0 && !e.leaked) : null;
    if (!target) {
      a.targetId = null;
      for (const e of game.enemies) {
        if (e.hp <= 0 || e.leaked || e.blockedBy) continue;
        // por proximidad real (los caminos comparten el tramo final)
        if (Math.hypot(e.x - a.x, e.y - a.y) < ALLY.engageDist) { target = e; break; }
      }
      if (target) { a.targetId = target.id; a.attackCd = 0.3; }
    }

    if (target) {
      target.blockedBy = a.id;
      a.attackCd -= dt;
      if (a.attackCd <= 0) {
        a.attackCd = ALLY.attackRate;
        a.swing = 0.25;
        applyDamage(game, target, ALLY.dmg, null);
        events.push({ t: 'hit' });
      }
      // el enemigo contraataca
      target.meleeCd = (target.meleeCd ?? 0.9) - dt;
      if (target.meleeCd <= 0) {
        target.meleeCd = 0.9;
        a.hp -= ENEMY_TYPES[target.type].melee;
        a.hitFlash = 0.12;
        if (a.hp <= 0) {
          target.blockedBy = null;
          pushBurst(game, a.x, a.y, '#c4b5fd', 12);
          events.push({ t: 'ally_death', ally: a });
        }
      }
    } else {
      // avanza hacia la entrada de su frente y monta guardia allí
      a.dist = Math.max(a.dist - ALLY.speed * dt, 30);
      const p = pointAtDistance(game.map.paths[a.pathId], a.dist);
      a.x = p.x; a.y = p.y; a.angle = p.angle + Math.PI;
    }
  }
  game.allies = game.allies.filter((a) => a.hp > 0);

  // --- enemigos ---
  for (const e of game.enemies) {
    if (e.hp <= 0) continue;
    if (e.hitFlash > 0) e.hitFlash -= dt;

    // trabado en combate con un caballero: no avanza
    if (e.blockedBy) {
      if (game.allies.some((a) => a.id === e.blockedBy && a.hp > 0)) continue;
      e.blockedBy = null;
    }

    // saboteador: si hay una estructura a tiro, se para a demolerla
    if (e.type === 'sabo') {
      if (!e.attackTowerId) {
        const t = game.towers.find((tw) => Math.hypot(tw.x - e.x, tw.y - e.y) <= SABO_RANGE);
        if (t) { e.attackTowerId = t.id; e.towerCd = 1; }
      }
      if (e.attackTowerId) {
        const t = game.towers.find((tw) => tw.id === e.attackTowerId);
        if (!t) {
          e.attackTowerId = null;
        } else {
          e.towerCd -= dt;
          if (e.towerCd <= 0) {
            e.towerCd = 1;
            t.hp -= SABO_DMG;
            t.flash = 0.12;
            pushBurst(game, t.x, t.y, '#f87171', 5, 70);
            events.push({ t: 'tower_hit' });
            if (t.hp <= 0) {
              game.towers = game.towers.filter((x) => x.id !== t.id);
              pushBurst(game, t.x, t.y, '#f87171', 22, 140);
              pushText(game, t.x, t.y - 20, '¡Estructura destruida!', '#ef4444');
              events.push({ t: 'tower_destroyed', towerId: t.id });
            }
          }
          continue; // ocupado demoliendo
        }
      }
    }

    const path = game.map.paths[e.pathId];
    const slow = game.time < e.slowUntil ? 1 - e.slowPct : 1;
    let newDist = e.dist + e.speed * slow * dt;

    // muralla: bloquea el paso; los enemigos en contacto la van derribando
    let barrier = null;
    let barrierDist = 0;
    for (const b of game.towers) {
      const bd = b.pathDists?.[e.pathId];
      if (bd == null) continue;
      if (bd >= e.dist - 1 && newDist >= bd - BARRIER_CONTACT) {
        if (!barrier || bd < barrierDist) { barrier = b; barrierDist = bd; }
      }
    }
    if (barrier) {
      newDist = Math.min(newDist, barrierDist - BARRIER_CONTACT);
      e.meleeCd = (e.meleeCd ?? 0.9) - dt;
      if (e.meleeCd <= 0) {
        e.meleeCd = 0.9;
        barrier.hp -= ENEMY_TYPES[e.type].melee;
        barrier.flash = 0.12;
        events.push({ t: 'tower_hit' });
        if (barrier.hp <= 0) {
          game.towers = game.towers.filter((x) => x.id !== barrier.id);
          pushBurst(game, barrier.x, barrier.y, '#f87171', 22, 140);
          pushText(game, barrier.x, barrier.y - 20, '¡Muralla derribada!', '#ef4444');
          events.push({ t: 'tower_destroyed', towerId: barrier.id });
        }
      }
    }

    e.dist = newDist;
    const p = pointAtDistance(path, e.dist);
    e.x = p.x; e.y = p.y; e.angle = p.angle;
    if (e.dist >= path.totalLen) {
      e.hp = 0;
      e.leaked = true;
      const dmgLives = e.type === 'boss' ? 3 : 1;
      // la muralla externa absorbe el golpe antes que las vidas
      const absorbed = Math.min(game.fortShield, dmgLives);
      if (absorbed > 0) {
        game.fortShield -= absorbed;
        game.stats.shielded++;
        pushBurst(game, e.x, e.y, '#fbbf24', 10, 110);
        pushText(game, e.x, e.y - 24, '¡Escudo!', '#fbbf24');
        events.push({ t: 'shield_hit', enemy: e, left: game.fortShield });
      }
      const through = dmgLives - absorbed;
      if (through > 0) {
        game.lives = Math.max(0, game.lives - through);
        game.stats.leaks++;
        events.push({ t: 'leak', enemy: e });
        if (game.lives <= 0) {
          game.phase = 'ended';
          events.push({ t: 'defeat' });
          return events;
        }
      }
    }
  }

  // --- santuario: cura periódica + aura ralentizadora ---
  const sanct = game.towers.find((t) => t.type === 'santuario');
  if (sanct) {
    if (game.time >= game.sanctHealAt) {
      game.sanctHealAt = game.time + SANCT_HEAL_INTERVAL;
      if (game.lives < STARTING_LIVES) {
        game.lives++;
        pushText(game, sanct.x, sanct.y - 30, '+1 ❤', '#f472b6');
        events.push({ t: 'heal' });
      }
    }
    const range = towerRange(sanct, game);
    for (const e of game.enemies) {
      if (e.hp <= 0 || Math.hypot(e.x - sanct.x, e.y - sanct.y) > range) continue;
      // no pisar una ralentización más fuerte (Hielo/Ventisca)
      if (!(game.time < e.slowUntil && e.slowPct > SANCT_SLOW_PCT)) {
        e.slowUntil = game.time + 0.25;
        e.slowPct = SANCT_SLOW_PCT;
      }
    }
  }

  // --- torres ---
  for (const tw of game.towers) {
    tw.cooldown -= dt;
    if (tw.flash > 0) tw.flash -= dt;
    const type = TOWER_TYPES[tw.type];
    // argamasa de obsidiana: las murallas se reparan solas
    if (type.kind === 'barrier' && game.relicMods.wallRegen > 0 && tw.hp < tw.maxHp) {
      tw.hp = Math.min(tw.maxHp, tw.hp + game.relicMods.wallRegen * dt);
    }
    if (type.kind === 'oracle' || type.kind === 'barrier' || type.kind === 'sanctuary') continue; // no disparan
    if (type.needsCategory && game.time < game.jams[tw.catIdx]) continue; // atascada
    if (tw.cooldown > 0) continue;
    const target = findTarget(game, tw);
    if (!target) continue;
    tw.aim = Math.atan2(target.y - tw.y, target.x - tw.x);
    tw.cooldown = 1 / type.rate;
    tw.flash = 0.1;
    if (type.kind === 'beam') {
      applyDamage(game, target, towerDmg(tw, game), tw);
      tw.beam = { x: target.x, y: target.y, life: 0.12 };
      events.push({ t: 'shoot', tower: tw.type });
      events.push({ t: 'hit' });
    } else {
      game.projectiles.push({
        id: game.nextId++,
        type: tw.type,
        x: tw.x, y: tw.y - 14,
        targetId: target.id,
        lastX: target.x, lastY: target.y,
        speed: type.projSpeed,
        dmg: towerDmg(tw, game),
        catIdx: tw.catIdx,
        towerLevel: tw.level,
      });
      events.push({ t: 'shoot', tower: tw.type });
    }
  }

  // --- armamento de la fortaleza (torretas gemelas + gran cañón) ---
  const fireFortWeapon = (w, up) => {
    w.cooldown -= dt;
    if (w.flash > 0) w.flash -= dt;
    if (w.cooldown > 0) return;
    let target = null;
    for (const e of game.enemies) {
      if (e.hp <= 0) continue;
      if (Math.hypot(e.x - w.x, e.y - w.y) > up.range) continue;
      if (!target || e.dist > target.dist) target = e; // el más avanzado
    }
    if (!target) return;
    w.aim = Math.atan2(target.y - w.y, target.x - w.x);
    w.cooldown = 1 / up.rate;
    w.flash = up.proj === 'fort_canon' ? 0.35 : 0.1;
    game.projectiles.push({
      id: game.nextId++,
      type: up.proj,
      x: w.x, y: w.y,
      targetId: target.id,
      lastX: target.x, lastY: target.y,
      speed: up.projSpeed,
      dmg: up.dmg,
      catIdx: null, // universal: daña a cualquier categoría
    });
    events.push({ t: 'shoot', tower: up.proj });
  };
  for (const tr of game.fortTurrets) fireFortWeapon(tr, FORT_UPGRADES[1]);
  if (game.fortCannon) fireFortWeapon(game.fortCannon, FORT_UPGRADES[2]);

  // --- proyectiles ---
  for (const pr of game.projectiles) {
    const target = game.enemies.find((e) => e.id === pr.targetId && e.hp > 0);
    const tx = target ? target.x : pr.lastX;
    const ty = target ? target.y : pr.lastY;
    if (target) { pr.lastX = target.x; pr.lastY = target.y; }
    const dx = tx - pr.x, dy = ty - pr.y;
    const d = Math.hypot(dx, dy);
    const step = pr.speed * dt;
    pr.angle = Math.atan2(dy, dx);
    if (d <= step + 6) {
      pr.done = true;
      const type = TOWER_TYPES[pr.type] || FORT_PROJ[pr.type];
      if (type.kind === 'splash') {
        const burstCol = pr.type === 'fort_canon' ? '#c4b5fd' : '#f97316';
        const splashR = type.splash * game.relicMods.splash; // pólvora refinada
        pushBurst(game, tx, ty, burstCol, 14, 120);
        game.particles.push({ kind: 'ring', x: tx, y: ty, life: 0.3, maxLife: 0.3, color: burstCol, size: splashR });
        for (const e of game.enemies) {
          // catIdx null = proyectil universal (armamento de la fortaleza)
          if (e.hp <= 0 || (pr.catIdx != null && e.catIdx !== pr.catIdx)) continue;
          if (Math.hypot(e.x - tx, e.y - ty) <= splashR) {
            applyDamage(game, e, pr.dmg, pr.catIdx != null ? { catIdx: pr.catIdx } : null);
          }
        }
        events.push({ t: 'explosion' });
      } else if (target) {
        applyDamage(game, target, pr.dmg, pr.catIdx != null ? { catIdx: pr.catIdx } : null);
        if (type.kind === 'slow') {
          target.slowUntil = game.time + type.slowDur;
          target.slowPct = type.slowPct;
        }
        events.push({ t: 'hit' });
      }
    } else {
      pr.x += (dx / d) * step;
      pr.y += (dy / d) * step;
    }
  }
  game.projectiles = game.projectiles.filter((p) => !p.done);

  // --- muertes ---
  for (const e of game.enemies) {
    if (e.hp <= 0 && !e.counted) {
      e.counted = true;
      if (!e.leaked) {
        const pts = Math.round(killPoints(e, game.level) * scoreMult(game));
        game.score += pts;
        game.stats.kills++;
        game.energy = Math.min(game.energy + ENERGY_PER_KILL, ENERGY_MAX);
        const color = game.categories[e.catIdx].color;
        pushBurst(game, e.x, e.y, color, e.type === 'boss' ? 26 : 12);
        pushText(game, e.x, e.y - 20, `+${pts}`, '#e5e7eb');
        events.push({ t: 'death', enemy: e });
      }
    }
  }
  game.enemies = game.enemies.filter((e) => e.hp > 0);

  updateParticles(game, dt);

  return events;
}

function updateParticles(game, dt) {
  for (const p of game.particles) {
    p.life -= dt;
    p.x += p.vx ? p.vx * dt : 0;
    p.y += p.vy ? p.vy * dt : 0;
    if (p.kind === 'spark') { p.vy += 160 * dt; }
  }
  game.particles = game.particles.filter((p) => p.life > 0);
  for (const tw of game.towers) {
    if (tw.beam) { tw.beam.life -= dt; if (tw.beam.life <= 0) tw.beam = null; }
  }
}

// ---------------------------------------------------------------------------
// Recompensas de conocimiento (fase de preguntas)
// ---------------------------------------------------------------------------

export function rewardCorrectAnswer(game, streak) {
  const bonus = Math.min(streak * COINS_STREAK_BONUS, COINS_STREAK_CAP);
  const total = Math.round((COINS_PER_CORRECT + bonus) * game.relicMods.coins);
  game.coins += total;
  game.energy = Math.min(game.energy + ENERGY_PER_CORRECT, ENERGY_MAX);
  return total;
}

// ---------------------------------------------------------------------------
// Habilidades activas (se cargan con aciertos; se apuntan sobre el terreno)
// ---------------------------------------------------------------------------

export function canCastAbility(game, abilityId) {
  const ab = ABILITIES[abilityId];
  return !!ab && game.energy >= ab.cost && game.time >= game.abilityCdUntil && game.phase === 'run';
}

/** Lanza una habilidad sobre el punto (x, y) del campo. Devuelve true si se lanzó. */
export function castAbility(game, abilityId, x, y) {
  if (!canCastAbility(game, abilityId)) return false;
  const ab = ABILITIES[abilityId];
  game.energy -= ab.cost;
  game.abilityCdUntil = game.time + ABILITY_GLOBAL_CD * game.relicMods.abilityCd;

  const inArea = game.enemies.filter((e) => e.hp > 0 && Math.hypot(e.x - x, e.y - y) <= ab.radius);

  if (abilityId === 'meteoro') {
    const dmg = 55 + 16 * game.level;
    for (const e of inArea) applyDamage(game, e, dmg, null);
    pushBurst(game, x, y, '#fb923c', 26, 160);
    game.particles.push({ kind: 'ring', x, y, life: 0.4, maxLife: 0.4, color: '#fb923c', size: ab.radius });
  } else if (abilityId === 'ventisca') {
    for (const e of inArea) {
      e.slowUntil = game.time + ab.slowDur;
      e.slowPct = ab.slowPct;
    }
    pushBurst(game, x, y, '#bae6fd', 20, 110);
    game.particles.push({ kind: 'ring', x, y, life: 0.5, maxLife: 0.5, color: '#bae6fd', size: ab.radius });
  } else if (abilityId === 'rayo') {
    let best = null;
    for (const e of inArea) if (!best || e.dist > best.dist) best = e;
    if (best) {
      applyDamage(game, best, Math.round(best.maxHp * 0.55) + 45, null);
      pushBurst(game, best.x, best.y, '#fde047', 16, 140);
      pushText(game, best.x, best.y - 30, '¡ZAP!', '#fde047');
      game.particles.push({ kind: 'bolt', x: best.x, y: best.y, life: 0.3, maxLife: 0.3, color: '#fde047', size: 1 });
    }
  }
  return true;
}
