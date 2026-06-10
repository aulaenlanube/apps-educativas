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

export const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

export const STARTING_COINS = 200;
export const STARTING_LIVES = 10;
export const COINS_PER_CORRECT = 70;
export const COINS_STREAK_BONUS = 10;   // por punto de racha, capado
export const COINS_STREAK_CAP = 50;
export const COINS_WAVE_CLEAR = 30;
export const EXAM_WAVES = 10;           // examen: 10 oleadas, jefes en la 5 y la 10
export const JAM_SECONDS = 3;           // atasco al fallar una clasificación
export const CLASSIFY_DMG_PCT = 0.45;   // daño del disparo de precisión (sobre HP máx)
export const REVEALED_DMG_MULT = 1.25;  // enemigos clasificados reciben más daño

export const TOWER_TYPES = {
  arquero: { id: 'arquero', name: 'Arquero', emoji: '🏹', cost: 80, dmg: 14, range: 115, rate: 1.1, projSpeed: 420, kind: 'single', needsCategory: true, desc: 'Equilibrado. Dispara flechas a su categoría.' },
  rafaga:  { id: 'rafaga', name: 'Ráfaga', emoji: '⚡', cost: 110, dmg: 6, range: 95, rate: 3.2, projSpeed: 520, kind: 'single', needsCategory: true, desc: 'Disparo muy rápido de poco daño.' },
  canon:   { id: 'canon', name: 'Cañón', emoji: '💣', cost: 160, dmg: 24, range: 105, rate: 0.55, projSpeed: 300, kind: 'splash', splash: 55, needsCategory: true, desc: 'Daño en área a su categoría. Lento pero demoledor.' },
  hielo:   { id: 'hielo', name: 'Hielo', emoji: '❄️', cost: 130, dmg: 4, range: 105, rate: 1.0, projSpeed: 380, kind: 'slow', slowPct: 0.5, slowDur: 2, needsCategory: false, desc: 'Apoyo: ralentiza a CUALQUIER enemigo.' },
  prisma:  { id: 'prisma', name: 'Prisma', emoji: '🔮', cost: 260, dmg: 16, range: 130, rate: 1.3, kind: 'beam', needsCategory: false, desc: 'Rayo universal: daña a cualquier categoría.' },
};

export const MAX_TOWER_LEVEL = 3;
export const upgradeCost = (type, level) => Math.round(TOWER_TYPES[type].cost * (level === 1 ? 0.6 : 0.9));
export const sellValue = (tower) => Math.round(tower.invested * 0.6);

export const ENEMY_TYPES = {
  scout:  { id: 'scout', hp: 18, speed: 72, radius: 12 },
  normal: { id: 'normal', hp: 32, speed: 46, radius: 16 },
  brute:  { id: 'brute', hp: 80, speed: 30, radius: 21 },
  boss:   { id: 'boss', hp: 380, speed: 22, radius: 30 },
};

const waveHpMult = (wave) => 1 + 0.22 * (wave - 1) + 0.015 * (wave - 1) * (wave - 1);
const waveSpeedMult = (wave) => 1 + Math.min(0.025 * (wave - 1), 0.5);
export const killPoints = (enemy, wave) => (enemy.type === 'boss' ? 300 : 10 + 2 * wave);

// ---------------------------------------------------------------------------
// Generación procedural del mapa (camino ortogonal + suavizado Chaikin)
// ---------------------------------------------------------------------------

function generateMap(rng) {
  const { cols, cell } = GRID;
  let r = 2 + Math.floor(rng() * 5); // fila inicial 2..6
  let c = 0;
  const cells = [[c, r]];
  const visited = new Set([`${c},${r}`]);

  while (c < cols - 1) {
    // tramo horizontal hacia la derecha (1..3 celdas)
    const hLen = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < hLen && c < cols - 1; i++) {
      c++; cells.push([c, r]); visited.add(`${c},${r}`);
    }
    if (c >= cols - 1) break;
    // tramo vertical (0..3 celdas) sin salirse de 1..7 ni pisar celdas previas
    const dir = rng() < 0.5 ? -1 : 1;
    const vLen = Math.floor(rng() * 4);
    for (let i = 0; i < vLen; i++) {
      const nr = r + dir;
      if (nr < 1 || nr > GRID.rows - 2 || visited.has(`${c},${nr}`)) break;
      r = nr; cells.push([c, r]); visited.add(`${c},${r}`);
    }
  }

  // Polilínea por los centros, con entrada y salida fuera de pantalla
  let pts = cells.map(([cc, rr]) => ({ x: cc * cell + cell / 2, y: rr * cell + cell / 2 }));
  pts = [{ x: -cell / 2, y: pts[0].y }, ...pts, { x: WORLD.w + cell / 2, y: pts[pts.length - 1].y }];

  // Suavizado Chaikin (2 pasadas) conservando extremos
  for (let pass = 0; pass < 2; pass++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      out.push({ x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25 });
      out.push({ x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75 });
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }

  // Distancias acumuladas para mover enemigos por distancia recorrida
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }

  return {
    pathCells: visited,
    points: pts,
    cum,
    totalLen: cum[cum.length - 1],
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
    wave: 0,
    phase: 'idle', // idle | wave (la fase de quiz/build la lleva el componente)
    coins: STARTING_COINS,
    lives: STARTING_LIVES,
    score: 0,
    enemies: [],
    towers: [],
    projectiles: [],
    particles: [],
    spawnQueue: [],
    spawnTimer: 0,
    nextWave: null,        // composición precalculada (para el pronóstico)
    jams: categories.map(() => 0), // instante hasta el que cada categoría está atascada
    waveLeaks: 0,
    nextId: 1,
    stats: { kills: 0, leaks: 0, perfectWaves: 0, towersBuilt: 0 },
  };
}

function drawWord(game, catIdx) {
  const cat = game.categories[catIdx];
  if (cat.deck.length === 0) cat.deck = seededShuffle(cat.words, game.rng);
  return cat.deck.pop();
}

// ---------------------------------------------------------------------------
// Oleadas
// ---------------------------------------------------------------------------

export function planNextWave(game) {
  const wave = game.wave + 1;
  const rng = game.rng;
  const isBossWave = wave % 5 === 0;
  const n = Math.min(4 + Math.ceil(wave * 1.8), 26);

  // Oleada 1-2 usa solo 2 categorías; después, todas las activas
  const catCount = wave <= 2 ? Math.min(2, game.categories.length) : game.categories.length;

  // Los enemigos llegan en ráfagas de 2-4 de la misma categoría (defendible con
  // torres de categoría, y refuerza la lectura de palabras en bloque)
  const entries = [];
  let remaining = n;
  while (remaining > 0) {
    const catIdx = Math.floor(rng() * catCount);
    const cluster = Math.min(2 + Math.floor(rng() * 3), remaining);
    for (let i = 0; i < cluster; i++) {
      let type = 'normal';
      const roll = rng();
      if (wave >= 2 && roll < Math.min(0.12 + 0.02 * wave, 0.3)) type = 'scout';
      else if (wave >= 3 && roll > 1 - Math.min(0.08 + 0.025 * wave, 0.3)) type = 'brute';
      entries.push({ type, catIdx });
    }
    remaining -= cluster;
  }
  if (isBossWave) {
    entries.push({ type: 'boss', catIdx: Math.floor(rng() * catCount) });
  }

  const interval = Math.max(1.5 - 0.05 * wave, 0.75);
  game.nextWave = { wave, entries, interval, isBossWave };
  return game.nextWave;
}

export function startWave(game) {
  if (!game.nextWave) planNextWave(game);
  const plan = game.nextWave;
  game.wave = plan.wave;
  game.phase = 'wave';
  game.waveLeaks = 0;
  game.spawnTimer = 0.5;
  game.spawnQueue = plan.entries.map((e, i) => ({
    ...e,
    delay: e.type === 'boss' ? plan.interval * 2 : plan.interval * (0.7 + game.rng() * 0.6),
    order: i,
  }));
  game.nextWave = null;
}

function spawnEnemy(game, entry) {
  const base = ENEMY_TYPES[entry.type];
  const hpMult = entry.type === 'boss' ? 1 + 0.35 * (game.wave - 1) : waveHpMult(game.wave);
  const maxHp = Math.round(base.hp * hpMult);
  const enemy = {
    id: game.nextId++,
    type: entry.type,
    catIdx: entry.catIdx,
    word: drawWord(game, entry.catIdx),
    dist: 0,
    hp: maxHp,
    maxHp,
    speed: base.speed * waveSpeedMult(game.wave),
    radius: base.radius,
    slowUntil: 0,
    slowPct: 0,
    classified: false,
    revealed: false,
    enraged: false,
    // forma procedural del blob: radios y fase de animación con semilla
    shape: Array.from({ length: 8 }, () => 0.82 + game.rng() * 0.32),
    phase: game.rng() * Math.PI * 2,
    hue: Math.floor(game.rng() * 360),
    x: -30, y: game.map.points[0].y, angle: 0,
  };
  game.enemies.push(enemy);
  return enemy;
}

/** Duelo futuro: el rival inyecta enemigos extra en la oleada en curso. */
export function injectEnemies(game, entries) {
  for (const e of entries) {
    game.spawnQueue.push({ type: e.type || 'normal', catIdx: e.catIdx ?? 0, delay: 0.4, order: 999 });
  }
}

// ---------------------------------------------------------------------------
// Torres
// ---------------------------------------------------------------------------

export function canBuildAt(game, col, row) {
  if (col < 0 || row < 0 || col >= GRID.cols || row >= GRID.rows) return false;
  if (game.map.pathCells.has(`${col},${row}`)) return false;
  return !game.towers.some((t) => t.col === col && t.row === row);
}

export function placeTower(game, col, row, typeId, catIdx = null) {
  const type = TOWER_TYPES[typeId];
  if (!type || game.coins < type.cost || !canBuildAt(game, col, row)) return null;
  game.coins -= type.cost;
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
  };
  game.towers.push(tower);
  game.stats.towersBuilt++;
  return tower;
}

export function upgradeTower(game, towerId) {
  const t = game.towers.find((x) => x.id === towerId);
  if (!t || t.level >= MAX_TOWER_LEVEL) return false;
  const cost = upgradeCost(t.type, t.level);
  if (game.coins < cost) return false;
  game.coins -= cost;
  t.invested += cost;
  t.level++;
  return true;
}

export function sellTower(game, towerId) {
  const idx = game.towers.findIndex((x) => x.id === towerId);
  if (idx === -1) return false;
  game.coins += sellValue(game.towers[idx]);
  game.towers.splice(idx, 1);
  return true;
}

const towerDmg = (t) => TOWER_TYPES[t.type].dmg * Math.pow(1.4, t.level - 1);
export const towerRange = (t) => TOWER_TYPES[t.type].range + 12 * (t.level - 1);

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
    game.score += 150;
    pushText(game, e.x, e.y - 28, '¡CRÍTICO! +150', '#fbbf24');
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
  const range = towerRange(tower);
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

/**
 * Avanza la simulación dt segundos. Devuelve una lista de eventos para
 * sonido/HUD: shoot, hit, death, leak, boss_spawn, wave_end, defeat, victory_wave.
 */
export function stepGame(game, dt) {
  const events = [];
  if (game.phase !== 'wave') {
    updateParticles(game, dt);
    game.time += dt;
    return events;
  }
  game.time += dt;

  // --- spawns ---
  if (game.spawnQueue.length > 0) {
    game.spawnTimer -= dt;
    if (game.spawnTimer <= 0) {
      const entry = game.spawnQueue.shift();
      const e = spawnEnemy(game, entry);
      if (entry.type === 'boss') events.push({ t: 'boss_spawn', enemy: e });
      game.spawnTimer = game.spawnQueue.length > 0 ? game.spawnQueue[0].delay : 0;
    }
  }

  // --- enemigos ---
  for (const e of game.enemies) {
    if (e.hp <= 0) continue;
    const slow = game.time < e.slowUntil ? 1 - e.slowPct : 1;
    e.dist += e.speed * slow * dt;
    const p = pointAtDistance(game.map, e.dist);
    e.x = p.x; e.y = p.y; e.angle = p.angle;
    if (e.hitFlash > 0) e.hitFlash -= dt;
    if (e.dist >= game.map.totalLen) {
      e.hp = 0;
      e.leaked = true;
      const dmgLives = e.type === 'boss' ? 3 : 1;
      game.lives = Math.max(0, game.lives - dmgLives);
      game.waveLeaks++;
      game.stats.leaks++;
      events.push({ t: 'leak', enemy: e });
      if (game.lives <= 0) {
        game.phase = 'ended';
        events.push({ t: 'defeat' });
        return events;
      }
    }
  }

  // --- torres ---
  for (const tw of game.towers) {
    tw.cooldown -= dt;
    if (tw.flash > 0) tw.flash -= dt;
    const type = TOWER_TYPES[tw.type];
    if (type.needsCategory && game.time < game.jams[tw.catIdx]) continue; // atascada
    if (tw.cooldown > 0) continue;
    const target = findTarget(game, tw);
    if (!target) continue;
    tw.aim = Math.atan2(target.y - tw.y, target.x - tw.x);
    tw.cooldown = 1 / type.rate;
    tw.flash = 0.1;
    if (type.kind === 'beam') {
      applyDamage(game, target, towerDmg(tw), tw);
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
        dmg: towerDmg(tw),
        catIdx: tw.catIdx,
        towerLevel: tw.level,
      });
      events.push({ t: 'shoot', tower: tw.type });
    }
  }

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
      const type = TOWER_TYPES[pr.type];
      if (type.kind === 'splash') {
        pushBurst(game, tx, ty, '#f97316', 14, 120);
        game.particles.push({ kind: 'ring', x: tx, y: ty, life: 0.3, maxLife: 0.3, color: '#f97316', size: type.splash });
        for (const e of game.enemies) {
          if (e.hp <= 0 || e.catIdx !== pr.catIdx) continue;
          if (Math.hypot(e.x - tx, e.y - ty) <= type.splash) {
            applyDamage(game, e, pr.dmg, { catIdx: pr.catIdx });
          }
        }
        events.push({ t: 'explosion' });
      } else if (target) {
        applyDamage(game, target, pr.dmg, { catIdx: pr.catIdx });
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
        const pts = killPoints(e, game.wave);
        game.score += pts;
        game.stats.kills++;
        const color = game.categories[e.catIdx].color;
        pushBurst(game, e.x, e.y, color, e.type === 'boss' ? 26 : 12);
        pushText(game, e.x, e.y - 20, `+${pts}`, '#e5e7eb');
        events.push({ t: 'death', enemy: e });
      }
    }
  }
  game.enemies = game.enemies.filter((e) => e.hp > 0);

  updateParticles(game, dt);

  // --- fin de oleada ---
  if (game.spawnQueue.length === 0 && game.enemies.every((e) => e.hp <= 0)) {
    game.enemies = [];
    game.phase = 'idle';
    const perfect = game.waveLeaks === 0;
    if (perfect) {
      game.stats.perfectWaves++;
      game.score += 100 + 10 * game.wave;
    }
    game.coins += COINS_WAVE_CLEAR;
    if (game.mode === 'exam' && game.wave >= EXAM_WAVES) {
      game.phase = 'ended';
      game.score += game.lives * 50; // bonus por vidas restantes
      events.push({ t: 'victory' });
    } else {
      events.push({ t: 'wave_end', wave: game.wave, perfect });
    }
  }

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
  const total = COINS_PER_CORRECT + bonus;
  game.coins += total;
  return total;
}
