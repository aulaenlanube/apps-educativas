import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Play, Pause, Square, RotateCcw, Trash2, X, Lightbulb, Trophy, Target, Gauge, Clock,
  Sparkles, Flame, GraduationCap, LayoutGrid, Puzzle, Map as MapIcon,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, Panel, Chip, GameButton, ModeSelect,
  RoundBanner, ResultsScreen, FeedbackItem, GameLoading, GradeRing,
} from '../_shared/kit';
import { GRADE_BLOCKS, CONDITIONS, getMissions, prepareWorld } from './misionesData';
import { fetchNormalMissions, pickRandomReto, recordRetoCompletion } from './robotMissionsService';
import { useAuth } from '@/contexts/AuthContext';
import { TopBot, Gem, TargetPad, MissionThumb, BlockGlyph } from './MrArt';
import './MisionesRoboticas.css';

// -----------------------------------------------------------------------------
// Constantes del motor
// -----------------------------------------------------------------------------

const DIR_VECTORS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const DIRS_CW = ['N', 'E', 'S', 'W'];
const rotCW = (d) => DIRS_CW[(DIRS_CW.indexOf(d) + 1) % 4];
const rotCCW = (d) => DIRS_CW[(DIRS_CW.indexOf(d) + 3) % 4];

const MAX_STEPS = 800;
const DRAG_THRESHOLD = 4;
const SNAP_MAX_DIST = 180;

// -----------------------------------------------------------------------------
// Catálogo de bloques
// -----------------------------------------------------------------------------

const BLOCK_DEFS = {
  move:    { label: 'Avanza',          icon: '⬆',   cat: 'move',   container: false },
  turnL:   { label: 'Gira izquierda',  icon: '↺',  cat: 'move',   container: false },
  turnR:   { label: 'Gira derecha',    icon: '↻',  cat: 'move',   container: false },
  turn180: { label: 'Media vuelta',    icon: '⟲',  cat: 'move',   container: false },
  pick:    { label: 'Recoger',         icon: '🫴', cat: 'action', container: false },
  repeat:  { label: 'Repetir',         icon: '🔁', cat: 'loop',   container: true, bodies: ['body'] },
  while:   { label: 'Mientras',        icon: '🔄', cat: 'loop',   container: true, bodies: ['body'] },
  if:      { label: 'Si',              icon: '❓', cat: 'if',     container: true, bodies: ['body'] },
  ifelse:  { label: 'Si…/Si no',       icon: '🔀', cat: 'if',     container: true, bodies: ['body', 'elseBody'] },
};

const CAT_LABEL = {
  move: 'Movimiento',
  action: 'Acción',
  loop: 'Bucles',
  if: 'Decisión',
};

// -----------------------------------------------------------------------------
// Árbol de bloques
// -----------------------------------------------------------------------------

let _uid = 0;
const nextId = () => `b${Date.now()}_${_uid++}`;

const buildBlock = (type) => {
  const base = { id: nextId(), type };
  if (type === 'repeat') return { ...base, count: 3, body: [] };
  if (type === 'while')  return { ...base, cond: 'canMove', body: [] };
  if (type === 'if')     return { ...base, cond: 'canMove', body: [] };
  if (type === 'ifelse') return { ...base, cond: 'canMove', body: [], elseBody: [] };
  return base;
};

const deepCloneTree = (nodes) => nodes.map((n) => {
  const copy = { ...n };
  if (Array.isArray(n.body)) copy.body = deepCloneTree(n.body);
  if (Array.isArray(n.elseBody)) copy.elseBody = deepCloneTree(n.elseBody);
  return copy;
});

const splitBodyId = (bodyId) => {
  if (bodyId === 'root') return { blockId: null, key: null };
  const idx = bodyId.lastIndexOf(':');
  return { blockId: bodyId.slice(0, idx), key: bodyId.slice(idx + 1) };
};

const findBlockRef = (program, blockId) => {
  for (const b of program) {
    if (b.id === blockId) return b;
    if (Array.isArray(b.body)) {
      const r = findBlockRef(b.body, blockId);
      if (r) return r;
    }
    if (Array.isArray(b.elseBody)) {
      const r = findBlockRef(b.elseBody, blockId);
      if (r) return r;
    }
  }
  return null;
};

const getBodyRef = (cloned, bodyId) => {
  const { blockId, key } = splitBodyId(bodyId);
  if (!blockId) return cloned;
  const block = findBlockRef(cloned, blockId);
  return block ? block[key] : null;
};

// Extrae block y todos sus hermanos posteriores como "chain". Devuelve el
// programa modificado (sin esos bloques) y los datos para reinsertarlos.
const detachChainFromBlock = (program, blockId) => {
  const cloned = deepCloneTree(program);
  let chain = null;
  let bodyId = null;
  let originIndex = -1;

  const recurse = (arr, currentBodyId) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === blockId) {
        chain = arr.splice(i, arr.length - i);
        bodyId = currentBodyId;
        originIndex = i;
        return true;
      }
      if (Array.isArray(arr[i].body) && recurse(arr[i].body, `${arr[i].id}:body`)) return true;
      if (Array.isArray(arr[i].elseBody) && recurse(arr[i].elseBody, `${arr[i].id}:elseBody`)) return true;
    }
    return false;
  };
  recurse(cloned, 'root');
  return { program: cloned, chain: chain || [], bodyId, originIndex };
};

const insertChainAt = (program, bodyId, index, chain) => {
  const cloned = deepCloneTree(program);
  const body = getBodyRef(cloned, bodyId);
  if (body) {
    const safeIdx = Math.max(0, Math.min(body.length, index));
    body.splice(safeIdx, 0, ...chain);
  }
  return cloned;
};

const removeBlockById = (root, blockId) => {
  const cloned = deepCloneTree(root);
  const recurse = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === blockId) { arr.splice(i, 1); return true; }
      if (Array.isArray(arr[i].body) && recurse(arr[i].body)) return true;
      if (Array.isArray(arr[i].elseBody) && recurse(arr[i].elseBody)) return true;
    }
    return false;
  };
  recurse(cloned);
  return cloned;
};

const setBlockField = (root, blockId, field, value) => {
  const cloned = deepCloneTree(root);
  const b = findBlockRef(cloned, blockId);
  if (b) b[field] = value;
  return cloned;
};

const countAllBlocks = (nodes) => {
  let n = 0;
  for (const b of nodes) {
    n += 1;
    if (Array.isArray(b.body)) n += countAllBlocks(b.body);
    if (Array.isArray(b.elseBody)) n += countAllBlocks(b.elseBody);
  }
  return n;
};

// -----------------------------------------------------------------------------
// Intérprete del programa
// -----------------------------------------------------------------------------

const simulate = (program, world) => {
  const walls = world.walls;
  const holes = world.holes;
  const itemsRemaining = new Set(world.items);
  let robot = { ...world.robot };
  const steps = [];
  let alive = true;
  let stepCount = 0;
  let errored = null;

  const pushStep = (kind, extra = {}) => {
    steps.push({
      kind,
      robot: { ...robot },
      itemsRemaining: new Set(itemsRemaining),
      ...extra,
    });
  };

  pushStep('init');

  const cellBlocked = (x, y) => {
    if (x < 0 || y < 0 || x >= world.cols || y >= world.rows) return true;
    if (walls.has(`${x},${y}`)) return true;
    return false;
  };

  const frontCell = () => {
    const [dx, dy] = DIR_VECTORS[robot.dir];
    return { x: robot.x + dx, y: robot.y + dy };
  };

  const evalCond = (cond) => {
    const fc = frontCell();
    switch (cond) {
      case 'canMove':        return !cellBlocked(fc.x, fc.y);
      case 'obstacleAhead':  return cellBlocked(fc.x, fc.y);
      case 'itemHere':       return itemsRemaining.has(`${robot.x},${robot.y}`);
      case 'onTarget':       return robot.x === world.target.x && robot.y === world.target.y;
      case 'notOnTarget':    return !(robot.x === world.target.x && robot.y === world.target.y);
      default: return false;
    }
  };

  const exec = (nodes) => {
    for (const node of nodes) {
      if (!alive || errored) return;
      if (stepCount++ > MAX_STEPS) {
        errored = 'Demasiados pasos: parece un bucle infinito. Simplifica tu programa.';
        return;
      }
      switch (node.type) {
        case 'move': {
          const fc = frontCell();
          if (cellBlocked(fc.x, fc.y)) {
            pushStep('bump');
            errored = 'El robot ha chocado contra un muro.';
            return;
          }
          robot = { ...robot, x: fc.x, y: fc.y };
          pushStep('move');
          if (holes.has(`${robot.x},${robot.y}`)) {
            pushStep('fall');
            alive = false;
            errored = '¡El robot ha caído en un agujero!';
            return;
          }
          break;
        }
        case 'turnL':   robot = { ...robot, dir: rotCCW(robot.dir) }; pushStep('turn'); break;
        case 'turnR':   robot = { ...robot, dir: rotCW(robot.dir) };  pushStep('turn'); break;
        case 'turn180': robot = { ...robot, dir: rotCW(rotCW(robot.dir)) }; pushStep('turn'); break;
        case 'pick': {
          const key = `${robot.x},${robot.y}`;
          if (itemsRemaining.has(key)) {
            itemsRemaining.delete(key);
            pushStep('pick');
          } else {
            pushStep('pickEmpty');
          }
          break;
        }
        case 'repeat': {
          const count = Math.max(0, Math.min(50, parseInt(node.count, 10) || 0));
          for (let i = 0; i < count; i++) {
            exec(node.body || []);
            if (!alive || errored) return;
          }
          break;
        }
        case 'while': {
          let guard = 0;
          while (evalCond(node.cond)) {
            exec(node.body || []);
            if (!alive || errored) return;
            if (++guard > MAX_STEPS) {
              errored = 'Bucle Mientras interminable. Revisa la condición.';
              return;
            }
          }
          break;
        }
        case 'if':     if (evalCond(node.cond)) exec(node.body || []); break;
        case 'ifelse': if (evalCond(node.cond)) exec(node.body || []); else exec(node.elseBody || []); break;
        default: break;
      }
    }
  };

  exec(program);

  const onTarget = robot.x === world.target.x && robot.y === world.target.y;
  pushStep('end');

  return {
    steps,
    finalRobot: robot,
    itemsRemaining,
    onTarget,
    alive,
    errored,
    itemsCollected: world.initialItems - itemsRemaining.size,
  };
};

// -----------------------------------------------------------------------------
// Tablero
// -----------------------------------------------------------------------------

const CELL_PX = 48;
const MOBILE_CELL_PX = 34;

const useResponsiveCell = () => {
  const [px, setPx] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 720 ? MOBILE_CELL_PX : CELL_PX));
  useEffect(() => {
    const onResize = () => setPx(window.innerWidth < 720 ? MOBILE_CELL_PX : CELL_PX);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return px;
};

// Tablero visto desde arriba: baldosas de laboratorio, muros en relieve,
// agujeros, cristales y plataforma de meta. El robot se mueve con transform.
const Board = ({ world, robot, itemsRemaining, running }) => {
  const cellPx = useResponsiveCell();
  const cells = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const key = `${x},${y}`;
      const isWall = world.walls.has(key);
      const isHole = !isWall && world.holes.has(key);
      const isTarget = world.target && world.target.x === x && world.target.y === y;
      let cls = `mr-cell ${(x + y) % 2 ? 'is-alt' : ''}`;
      if (isWall) cls += ' is-wall';
      else if (isHole) cls += ' is-hole';
      if (isTarget) cls += ' is-target';
      cells.push(
        <div key={key} className={cls} style={{ left: x * cellPx, top: y * cellPx, width: cellPx, height: cellPx }}>
          {isTarget && <span className="mr-cell-art"><TargetPad /></span>}
        </div>
      );
    }
  }

  const itemEls = [...itemsRemaining].map((key) => {
    const [x, y] = key.split(',').map(Number);
    return (
      <div key={`item-${key}`} className="mr-item" style={{ left: x * cellPx, top: y * cellPx, width: cellPx, height: cellPx }}>
        <span className="mr-item-float"><Gem /></span>
      </div>
    );
  });

  const dirRot = { N: -90, E: 0, S: 90, W: 180 };

  return (
    <div className={`mr-board ${running ? 'is-running' : ''}`} style={{ width: world.cols * cellPx, height: world.rows * cellPx }}>
      {cells}
      {itemEls}
      <motion.div
        className="mr-robot"
        initial={false}
        animate={{ x: robot.x * cellPx, y: robot.y * cellPx, rotate: dirRot[robot.dir] }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ width: cellPx, height: cellPx }}
      >
        <TopBot />
      </motion.div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Rendering de bloques con formas de puzzle
// -----------------------------------------------------------------------------

const BlockBody = ({ block, onChangeField }) => {
  const def = BLOCK_DEFS[block.type];
  return (
    <>
      <BlockGlyph type={block.type} />
      <span className="mr-block-label">{def.label}</span>
      {block.type === 'repeat' && (
        <>
          <input
            type="number"
            min="1"
            max="50"
            className="mr-block-input"
            value={block.count}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => onChangeField(block.id, 'count', Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
          />
          <span className="mr-block-suffix">veces</span>
        </>
      )}
      {(block.type === 'while' || block.type === 'if' || block.type === 'ifelse') && (
        <select
          className="mr-block-select"
          value={block.cond}
          onPointerDown={(e) => e.stopPropagation()}
          onChange={(e) => onChangeField(block.id, 'cond', e.target.value)}
        >
          {CONDITIONS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      )}
    </>
  );
};

const BlockNode = ({ block, onBlockPointerDown, onRemove, onChangeField, registerBody, depth }) => {
  const def = BLOCK_DEFS[block.type];
  const bodyKeys = def.bodies || [];

  return (
    <div
      className={`mr-block mr-block-${def.cat} ${def.container ? 'is-container' : 'is-stack'}`}
      data-block-id={block.id}
      onPointerDown={(e) => onBlockPointerDown(e, block.id)}
      style={{ '--depth': depth }}
    >
      <div className="mr-block-head">
        <BlockBody block={block} onChangeField={onChangeField} />
        <button
          type="button"
          className="mr-block-remove"
          title="Eliminar bloque"
          aria-label="Eliminar bloque"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
        >
          <X size={12} strokeWidth={3} />
        </button>
      </div>

      {def.container && bodyKeys.map((bk) => (
        <div key={bk} className={`mr-c-section ${bk === 'elseBody' ? 'is-else' : 'is-then'}`}>
          {block.type === 'ifelse' && (
            <div className="mr-c-label">{bk === 'elseBody' ? 'si no:' : 'si sí:'}</div>
          )}
          <div
            className="mr-c-mouth"
            ref={(n) => registerBody(`${block.id}:${bk}`, n)}
            data-body-id={`${block.id}:${bk}`}
          >
            {(block[bk] || []).length === 0 ? (
              <div className="mr-empty-slot">suelta bloques aquí</div>
            ) : (
              (block[bk] || []).map((child) => (
                <BlockNode
                  key={child.id}
                  block={child}
                  onBlockPointerDown={onBlockPointerDown}
                  onRemove={onRemove}
                  onChangeField={onChangeField}
                  registerBody={registerBody}
                  depth={depth + 1}
                />
              ))
            )}
          </div>
        </div>
      ))}
      {def.container && <div className="mr-c-foot" />}
    </div>
  );
};

// Ghost preview (lo que sigue al cursor durante el arrastre)
const BlockGhost = ({ block, depth }) => {
  const def = BLOCK_DEFS[block.type];
  const bodyKeys = def.bodies || [];
  return (
    <div
      className={`mr-block mr-block-${def.cat} ghost ${def.container ? 'is-container' : 'is-stack'}`}
      style={{ '--depth': depth }}
    >
      <div className="mr-block-head">
        <BlockGlyph type={block.type} />
        <span className="mr-block-label">{def.label}</span>
        {block.type === 'repeat' && <span className="mr-block-suffix">{block.count} veces</span>}
        {(block.type === 'while' || block.type === 'if' || block.type === 'ifelse') && (
          <span className="mr-block-suffix">{CONDITIONS.find(c => c.id === block.cond)?.label}</span>
        )}
      </div>
      {def.container && bodyKeys.map((bk) => (
        <div key={bk} className={`mr-c-section ${bk === 'elseBody' ? 'is-else' : 'is-then'}`}>
          {block.type === 'ifelse' && (
            <div className="mr-c-label">{bk === 'elseBody' ? 'si no:' : 'si sí:'}</div>
          )}
          <div className="mr-c-mouth">
            {(block[bk] || []).length === 0 ? (
              <div className="mr-empty-slot">…</div>
            ) : (
              (block[bk] || []).map((child) => (
                <BlockGhost key={child.id} block={child} depth={depth + 1} />
              ))
            )}
          </div>
        </div>
      ))}
      {def.container && <div className="mr-c-foot" />}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Paleta
// -----------------------------------------------------------------------------

const Palette = ({ allowed, onPalettePointerDown }) => {
  const groups = {};
  Object.keys(BLOCK_DEFS).forEach((type) => {
    const def = BLOCK_DEFS[type];
    if (!allowed.includes(type)) return;
    if (!groups[def.cat]) groups[def.cat] = [];
    groups[def.cat].push(type);
  });
  return (
    <Panel variant="surface" className="mr-palette">
      <div className="mr-section-title"><Puzzle size={16} /> Bloques <small>arrastra al programa</small></div>
      <div className="mr-palette-groups">
        {Object.entries(groups).map(([cat, types]) => (
          <div key={cat} className={`mr-palette-group cat-${cat}`}>
            <div className="mr-palette-group-title"><span className="mr-palette-dot" />{CAT_LABEL[cat]}</div>
            <div className="mr-palette-group-items">
              {types.map((t) => {
                const def = BLOCK_DEFS[t];
                return (
                  <div
                    key={t}
                    className={`mr-block mr-block-${def.cat} palette ${def.container ? 'is-container' : 'is-stack'}`}
                    onPointerDown={(e) => onPalettePointerDown(e, t)}
                  >
                    <div className="mr-block-head">
                      <BlockGlyph type={t} />
                      <span className="mr-block-label">{def.label}</span>
                    </div>
                    {def.container && <div className="mr-c-foot mini" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

// -----------------------------------------------------------------------------
// Componente principal
// -----------------------------------------------------------------------------

const SHELL = { accent: '#14b8a6', accent2: '#6366f1' };

const MisionesRoboticas = ({ onGameComplete, isPaused }) => {
  const { grade: gradeParam } = useParams();
  const grade = useMemo(() => String(gradeParam || '1'), [gradeParam]);
  const gradeCfg = useMemo(() => GRADE_BLOCKS[grade] || GRADE_BLOCKS['1'], [grade]);
  // Las misiones normales se cargan desde Supabase (con fallback local).
  const [missions, setMissions] = useState(() => getMissions(grade));
  useEffect(() => {
    let mounted = true;
    fetchNormalMissions(grade).then((list) => {
      if (mounted && list && list.length > 0) setMissions(list);
    });
    return () => { mounted = false; };
  }, [grade]);

  // Datos del usuario autenticado para tracking de retos e insignias.
  const { student, teacher, isStudent, isTeacher } = useAuth();
  const userId = isStudent ? student?.id : isTeacher ? teacher?.id : null;
  const userType = isStudent ? 'student' : isTeacher ? 'teacher' : null;

  const [screen, setScreen] = useState('intro');
  const [mode, setMode] = useState('easy');
  const [missionIndex, setMissionIndex] = useState(0);
  const [program, setProgram] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showExamIntro, setShowExamIntro] = useState(false);
  const [showRetoIntro, setShowRetoIntro] = useState(false);
  const [retoMission, setRetoMission] = useState(null); // misión aleatoria en modo reto
  const [retoResult, setRetoResult] = useState(null);

  const [world, setWorld] = useState(null);
  const [robot, setRobot] = useState(null);
  const [itemsRemaining, setItemsRemaining] = useState(new Set());
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const [examStep, setExamStep] = useState(0);
  const [examResults, setExamResults] = useState([]);
  const [examStartAt, setExamStartAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [summaryScore, setSummaryScore] = useState(0); // solo visual (puntos del resumen)
  const completedRef = useRef(false);

  // ---- Drag & drop state ---------------------------------------------------
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  useEffect(() => { dragRef.current = drag; }, [drag]);

  const bodyRefs = useRef(new Map());
  const registerBody = useCallback((bodyId, node) => {
    if (node) bodyRefs.current.set(bodyId, node);
    else bodyRefs.current.delete(bodyId);
  }, []);

  const isExam = mode === 'exam';
  const isReto = mode === 'reto';
  const mission = isReto ? retoMission : missions[missionIndex];

  const allowedTypes = useMemo(() => {
    const out = [];
    gradeCfg.simple.forEach(t => out.push(t));
    gradeCfg.actions.forEach(t => out.push(t));
    gradeCfg.loops.forEach(t => out.push(t));
    gradeCfg.conds.forEach(t => out.push(t));
    return out;
  }, [gradeCfg]);

  useEffect(() => {
    if (!mission) return;
    const w = prepareWorld(mission);
    setWorld(w);
    setRobot({ ...w.robot });
    setItemsRemaining(new Set(w.items));
    setProgram([]);
    setFeedback(null);
    setHintsUsed(0);
    setShowHint(false);
    setRunning(false);
    setDrag(null);
  }, [missionIndex, mode, mission, retoMission]);

  useEffect(() => {
    if (!isExam || screen !== 'play' || isPaused) return;
    const id = setInterval(() => {
      if (examStartAt) setElapsed(Math.floor((Date.now() - examStartAt) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [isExam, screen, examStartAt, isPaused]);

  // ---- Drag & drop helpers -------------------------------------------------
  const findDropZone = useCallback((x, y) => {
    let best = null;
    let bestDist = Infinity;
    for (const [bodyId, node] of bodyRefs.current.entries()) {
      if (!node) continue;
      const bodyRect = node.getBoundingClientRect();
      const hMargin = 100;
      if (x < bodyRect.left - hMargin || x > bodyRect.right + hMargin) continue;
      if (y < bodyRect.top - hMargin || y > bodyRect.bottom + hMargin) continue;

      const children = Array.from(node.querySelectorAll(':scope > .mr-block'));
      const points = [];
      if (children.length === 0) {
        points.push({ y: bodyRect.top + 20, index: 0 });
      } else {
        children.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          points.push({ y: r.top, index: i });
        });
        const lastRect = children[children.length - 1].getBoundingClientRect();
        points.push({ y: lastRect.bottom, index: children.length });
      }

      for (const pt of points) {
        const dist = Math.abs(pt.y - y);
        if (dist < bestDist) {
          bestDist = dist;
          best = { bodyId, index: pt.index, markerY: pt.y, bodyRect };
        }
      }
    }
    if (bestDist > SNAP_MAX_DIST) return null;
    return best;
  }, []);

  // Event handlers globales (se registran una vez)
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const hover = findDropZone(e.clientX, e.clientY);
      setDrag({ ...d, pointer: { x: e.clientX, y: e.clientY }, hover });
    };
    const onUp = () => {
      const d = dragRef.current;
      if (!d) return;
      setDrag(null);
      if (d.hover) {
        setProgram((p) => insertChainAt(p, d.hover.bodyId, d.hover.index, d.chain));
      } else if (d.origin) {
        // Devolver al origen si no se soltó en zona válida
        setProgram((p) => insertChainAt(p, d.origin.bodyId, d.origin.index, d.chain));
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [findDropZone]);

  // Bloquear selección de texto y scroll touch durante drag
  useEffect(() => {
    if (drag) {
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    }
  }, [drag]);

  // ---- Iniciar drag desde paleta ------------------------------------------
  const handlePalettePointerDown = useCallback((e, type) => {
    e.preventDefault();
    const targetEl = e.currentTarget;
    const rect = targetEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
    let activated = false;

    const onMoveLocal = (ev) => {
      if (!activated) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        activated = true;
        const block = buildBlock(type);
        setDrag({
          chain: [block],
          fromPalette: true,
          offsetX,
          offsetY,
          pointer: { x: ev.clientX, y: ev.clientY },
          hover: null,
          origin: null,
        });
      }
    };
    const onUpLocal = () => {
      window.removeEventListener('pointermove', onMoveLocal);
      window.removeEventListener('pointerup', onUpLocal);
      window.removeEventListener('pointercancel', onUpLocal);
    };
    window.addEventListener('pointermove', onMoveLocal);
    window.addEventListener('pointerup', onUpLocal);
    window.addEventListener('pointercancel', onUpLocal);
  }, []);

  // ---- Iniciar drag desde bloque del workspace -----------------------------
  const handleBlockPointerDown = useCallback((e, blockId) => {
    // Ignorar si clic sobre input/select/botón
    const tgt = e.target;
    if (tgt.closest('.mr-block-input, .mr-block-select, .mr-block-remove')) return;
    e.preventDefault();
    e.stopPropagation();

    const blockEl = e.currentTarget;
    const rect = blockEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
    let activated = false;

    const onMoveLocal = (ev) => {
      if (!activated) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        activated = true;
        const { program: np, chain, bodyId, originIndex } = detachChainFromBlock(program, blockId);
        if (!chain.length) return;
        setProgram(np);
        setDrag({
          chain,
          fromPalette: false,
          offsetX,
          offsetY,
          pointer: { x: ev.clientX, y: ev.clientY },
          hover: null,
          origin: { bodyId, index: originIndex },
        });
      }
    };
    const onUpLocal = () => {
      window.removeEventListener('pointermove', onMoveLocal);
      window.removeEventListener('pointerup', onUpLocal);
      window.removeEventListener('pointercancel', onUpLocal);
    };
    window.addEventListener('pointermove', onMoveLocal);
    window.addEventListener('pointerup', onUpLocal);
    window.addEventListener('pointercancel', onUpLocal);
  }, [program]);

  const handleRemove = useCallback((id) => {
    setProgram((p) => removeBlockById(p, id));
  }, []);

  const handleChangeField = useCallback((id, field, value) => {
    setProgram((p) => setBlockField(p, id, field, value));
  }, []);

  const handleClearProgram = useCallback(() => {
    setProgram([]);
    setFeedback(null);
  }, []);

  const handleStop = useCallback(() => {
    setRunning(false);
    const w = prepareWorld(mission);
    setWorld(w);
    setRobot({ ...w.robot });
    setItemsRemaining(new Set(w.items));
  }, [mission]);

  const handleRun = useCallback(async () => {
    if (running || program.length === 0 || !world) return;
    setFeedback(null);
    setRunning(true);

    const result = simulate(program, world);
    const stepDelay = 220;
    for (let i = 0; i < result.steps.length; i++) {
      await new Promise((res) => setTimeout(res, stepDelay));
      const step = result.steps[i];
      setRobot(step.robot);
      setItemsRemaining(new Set(step.itemsRemaining));
    }
    setRunning(false);

    const obj = mission.objectives || {};
    const needItems = obj.collectItems || 0;
    const reachedTarget = result.onTarget && result.alive;
    const collected = result.itemsCollected;
    const noDeathOk = !obj.noDeath || result.alive;
    const success = reachedTarget && collected >= needItems && noDeathOk && !result.errored;

    if (isExam) {
      const record = {
        id: mission.id,
        title: mission.title,
        success,
        collected,
        neededItems: needItems,
        blocksUsed: countAllBlocks(program),
        suggested: mission.suggestedBlocks || 0,
        errored: result.errored,
      };
      const nextResults = [...examResults, record];
      setExamResults(nextResults);
      if (examStep < missions.length - 1) {
        setTimeout(() => {
          setExamStep((s) => s + 1);
          setMissionIndex((i) => i + 1);
        }, 900);
      } else {
        finishExam(nextResults);
      }
      return;
    }

    if (isReto) {
      const blocksUsed = countAllBlocks(program);
      const record = {
        id: mission.id,
        title: mission.title,
        success,
        collected,
        neededItems: needItems,
        blocksUsed,
        suggested: mission.suggestedBlocks || 0,
        errored: result.errored,
      };
      const ratio = missionScoreRatio(record);
      const nota = Math.round(ratio * 100) / 10;
      setRetoResult({ ...record, nota });
      if (success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
      }
      // Registrar en Supabase (usuario autenticado) y obtener insignias nuevas.
      if (success && userId && userType) {
        recordRetoCompletion({
          userId,
          userType,
          missionSlug: mission.id,
          grade: parseInt(grade, 10),
          blocksUsed,
          nota,
        }).then((res) => {
          if (res?.new_badges?.length) {
            const b = res.new_badges[0];
            setRetoResult((prev) => (prev ? { ...prev, newBadge: b, progress: res.distinct_retos } : prev));
            setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } }), 400);
          } else if (res?.distinct_retos != null) {
            setRetoResult((prev) => (prev ? { ...prev, progress: res.distinct_retos } : prev));
          }
        });
      }
      if (!completedRef.current && typeof onGameComplete === 'function') {
        completedRef.current = true;
        onGameComplete({
          mode: 'test',
          score: Math.round(ratio * 240),
          maxScore: 240,
          correctAnswers: success ? 1 : 0,
          totalQuestions: 1,
          durationSeconds: 0,
          nota,
        });
      }
      return;
    }

    if (success) {
      setFeedback({ type: 'success', text: '¡Misión completada! Buen trabajo.' });
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
    } else if (result.errored) {
      setFeedback({ type: 'error', text: result.errored });
    } else if (!reachedTarget) {
      setFeedback({ type: 'error', text: 'El robot no ha llegado a la meta 🎯.' });
    } else if (collected < needItems) {
      setFeedback({ type: 'error', text: `Te faltan ítems por recoger: ${collected}/${needItems}.` });
    }
    // Dependencias originales: el resto de valores se leen en el momento de ejecutar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, world, mission, running, isExam, examStep, examResults, missions.length]);

  // Nota basada en la optimización de bloques de cada misión.
  //   · Misión fallida:           0 puntos
  //   · Misión completada al óptimo (blocksUsed ≤ suggested):  1.0
  //   · Más bloques que lo sugerido: ratio = suggested / blocksUsed (mín 0.3)
  // Nota final = media de puntos × 10 (sobre 10).
  const missionScoreRatio = (r) => {
    if (!r.success) return 0;
    if (!r.suggested) return 1;
    if (r.blocksUsed <= r.suggested) return 1;
    return Math.max(0.3, r.suggested / r.blocksUsed);
  };

  const finishExam = (results) => {
    const solved = results.filter((r) => r.success).length;
    const total = missions.length;
    const scores = results.map(missionScoreRatio);
    const avg = scores.reduce((a, b) => a + b, 0) / total;
    const nota = Math.round(avg * 100) / 10;
    const totalSecs = Math.max(1, Math.floor((Date.now() - examStartAt) / 1000));
    // Puntos paralelos sin tope (tiempo + bonus perfectos) para el ranking.
    const perfectCount = results.filter(r => r.success && r.blocksUsed <= (r.suggested || 0)).length;
    const timeBonus = Math.max(0, 900 - totalSecs) * 2;
    const score = Math.round(avg * total * 120 + perfectCount * 40 + timeBonus);

    setSummaryScore(score);
    setScreen('summary');
    if (!completedRef.current && typeof onGameComplete === 'function') {
      completedRef.current = true;
      onGameComplete({
        mode: 'test',
        score,
        maxScore: total * 120 + total * 40 + 1800,
        correctAnswers: solved,
        totalQuestions: total,
        durationSeconds: totalSecs,
        nota,
      });
    }
  };

  const startPractice = (difficulty) => {
    setMode(difficulty);
    setMissionIndex(0);
    setScreen('play');
    completedRef.current = false;
  };

  const startExam = () => {
    setMode('exam');
    setMissionIndex(0);
    setExamStep(0);
    setExamResults([]);
    setExamStartAt(Date.now());
    setElapsed(0);
    setScreen('play');
    completedRef.current = false;
  };

  const startReto = async () => {
    setMode('reto');
    const picked = await pickRandomReto(grade);
    setRetoMission(picked);
    setRetoResult(null);
    setScreen('play');
    completedRef.current = false;
  };

  const newReto = async () => {
    const current = retoMission?.id;
    const picked = await pickRandomReto(grade, current);
    setRetoMission(picked);
    setRetoResult(null);
    setProgram([]);
    completedRef.current = false;
  };

  const nextMission = () => {
    if (missionIndex < missions.length - 1) {
      setMissionIndex(missionIndex + 1);
    } else {
      setScreen('summary');
      if (!completedRef.current && typeof onGameComplete === 'function') {
        completedRef.current = true;
        onGameComplete({
          mode: 'practice',
          score: 0,
          maxScore: 0,
          correctAnswers: missions.length,
          totalQuestions: missions.length,
          durationSeconds: 0,
        });
      }
    }
  };

  const restart = () => {
    setScreen('intro');
    setMode('easy');
    setMissionIndex(0);
    setProgram([]);
    setExamResults([]);
    setExamStep(0);
    setExamStartAt(null);
    setElapsed(0);
    completedRef.current = false;
  };

  const useHint = () => {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
  };

  // ---------------------------------------------------------------- Pantallas
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const instructions = (
    <InstructionsModal
      isOpen={showInstructions}
      onClose={() => setShowInstructions(false)}
      title={screen === 'play' ? 'Ayuda rápida' : 'Cómo jugar a Programa al Robot'}
    >
      <h3>🎯 Objetivo</h3>
      <p>Programa al robot con bloques para que cumpla cada misión: llegar a la <b>meta</b>, recoger los <b>cristales</b> y evitar los <b>agujeros</b>.</p>
      <h3>🧩 Cómo programar</h3>
      <ul>
        <li><b>Arrastra</b> un bloque desde la paleta hasta el programa.</li>
        <li>Los bloques tienen pestañas y muescas: se encajan unos con otros como piezas de puzzle.</li>
        <li>Los bloques <b>Repetir</b>, <b>Mientras</b>, <b>Si</b> y <b>Si…/Si no</b> tienen huecos donde puedes <b>anidar</b> otros bloques.</li>
        <li>Arrastra un bloque ya colocado para moverlo (se lleva consigo todos los bloques que tenga debajo).</li>
        <li>Pulsa ✕ para eliminar un bloque.</li>
      </ul>
      <h3>🧠 Conceptos que aprendes</h3>
      <ul>
        <li>Secuencias de instrucciones.</li>
        <li>Bucles (Repetir N, Mientras).</li>
        <li>Condicionales con sensores (obstáculo, ítem, meta…).</li>
        <li>Pensamiento algorítmico aplicado a robótica real.</li>
      </ul>
      <h3>🎮 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Fácil</strong>Pista siempre visible y feedback claro.</div>
        <div className="instr-mode medium"><strong>Medio</strong>Pista opcional (cuenta las que pides).</div>
        <div className="instr-mode exam"><strong>Examen</strong>Las misiones del curso seguidas, sin ayudas. Nota sobre 10.</div>
      </div>
    </InstructionsModal>
  );

  if (screen === 'intro') {
    const modes = [
      { id: 'easy', tone: 'easy', title: 'Fácil', desc: 'Pista siempre visible y feedback al ejecutar. Perfecto para empezar.', features: ['Pista siempre visible', 'Elige cualquier misión'] },
      { id: 'medium', tone: 'medium', icon: Gauge, title: 'Medio', desc: 'Sin pista visible. Puedes pedirla, pero cada una cuenta.', features: ['Pistas bajo demanda', 'Más autonomía'] },
      { id: 'exam', tone: 'exam', title: 'Examen', desc: `Las ${missions.length} misiones seguidas, sin ayudas. La nota depende de lo optimizado que sea tu código.`, features: ['Nota sobre 10', 'Menos bloques, más nota'] },
      { id: 'reto', tone: 'reto', icon: Flame, title: 'Reto', desc: 'Un nivel aleatorio mucho más difícil. Resuélvelo con la menor cantidad de bloques posible.', features: ['Nivel sorpresa', 'Insignias de reto'] },
    ];
    const selectMode = (id) => {
      if (id === 'exam') { setShowExamIntro(true); return; }
      if (id === 'reto') { setShowRetoIntro(true); return; }
      startPractice(id);
    };
    return (
      <GameShell {...SHELL} wide className="mr-shell">
        <ModeSelect
          description="Programa a tu robot con bloques visuales tipo puzzle y resuelve misiones crecientes: bucles, condicionales y sensores aplicados a la programación."
          modes={modes}
          onSelect={selectMode}
          onHelp={() => setShowInstructions(true)}
          extra={(
            <section className="mr-missions" aria-label={`Misiones de ESO ${grade}º`}>
              <header className="mr-sec-head">
                <span className="mr-sec-head__ico"><MapIcon size={18} /></span>
                <div>
                  <h3>Misiones de ESO {grade}º</h3>
                  <p>Llega a la meta, recoge los cristales y esquiva los agujeros.</p>
                </div>
              </header>
              <div className="mr-missions-grid">
                {missions.map((m, i) => (
                  <div key={m.id} className="mr-mission-tile" style={{ '--i': i }}>
                    <span className="mr-mission-tile__thumb"><MissionThumb grid={m.grid} /></span>
                    <span className="mr-mission-tile__num">{i + 1}</span>
                    <span className="mr-mission-tile__title">{m.title.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        />
        {instructions}

        <MrDialog
          open={showExamIntro}
          tone="exam"
          icon={GraduationCap}
          title="Modo Examen"
          lead={<>Tienes que completar las <b>{missions.length} misiones</b> del curso seguidas, sin saltarte ninguna y sin ayudas.</>}
          onClose={() => setShowExamIntro(false)}
          actions={[
            { label: 'Cancelar', variant: 'soft', onClick: () => setShowExamIntro(false) },
            { label: 'Empezar examen', variant: 'danger', icon: Play, onClick: () => { setShowExamIntro(false); startExam(); }, autoFocus: true },
          ]}
        >
          <h4><Gauge size={16} /> Cómo se calcula la nota</h4>
          <ul>
            <li>La nota depende de <b>lo optimizado que sea tu código</b>: cuantos <b>menos bloques</b> uses, <b>más nota</b>.</li>
            <li>Bloques óptimos o menos → <b>1 punto</b> en esa misión.</li>
            <li>Más bloques → menos puntos (proporcional).</li>
            <li>No la completas → <b>0 puntos</b> en esa misión.</li>
            <li>La <b>nota final /10</b> es la media de puntos de todas las misiones × 10.</li>
          </ul>
        </MrDialog>

        <MrDialog
          open={showRetoIntro}
          tone="reto"
          icon={Flame}
          title="Modo Reto"
          lead={<>Te tocará un <b>nivel aleatorio</b> mucho más difícil que los normales.</>}
          onClose={() => setShowRetoIntro(false)}
          actions={[
            { label: 'Cancelar', variant: 'soft', onClick: () => setShowRetoIntro(false) },
            { label: 'Afrontar reto', icon: Play, onClick: () => { setShowRetoIntro(false); startReto(); }, autoFocus: true },
          ]}
        >
          <h4><Sparkles size={16} /> Cómo funciona</h4>
          <ul>
            <li>Se elige <b>al azar</b> entre un conjunto de niveles de alta dificultad.</li>
            <li>Sin pistas ni selector: enfrentas el reto de primera.</li>
            <li>Bloques óptimos o menos → <b>10/10</b>; más bloques → menos nota; sin completar → <b>0/10</b>.</li>
          </ul>
        </MrDialog>
      </GameShell>
    );
  }

  if (screen === 'summary') {
    const solved = examResults.filter((r) => r.success).length;
    const total = missions.length;
    // Misma fórmula que finishExam (la nota que se registra): media de puntos × 10.
    const avg = examResults.map(missionScoreRatio).reduce((a, b) => a + b, 0) / total;
    const nota = Math.round(avg * 100) / 10;
    const optimal = examResults.filter((r) => r.success && r.blocksUsed <= (r.suggested || 0)).length;

    return (
      <GameShell {...SHELL} wide className="mr-shell">
        {isExam ? (
          <ResultsScreen
            subtitle={`Programa al Robot · ESO ${grade}º`}
            nota={nota}
            points={summaryScore}
            stats={[
              { icon: Target, tone: 'good', label: 'Completadas', value: `${solved}/${total}` },
              { icon: Gauge, tone: 'score', label: 'Óptimas', value: optimal },
              { icon: Clock, tone: 'time', label: 'Tiempo', value: fmtTime(elapsed) },
            ]}
            actions={[
              { label: 'Repetir examen', onClick: startExam, icon: RotateCcw },
              { label: 'Volver al menú', onClick: restart, icon: LayoutGrid, variant: 'soft' },
            ]}
          >
            {examResults.map((r, i) => {
              const pts = Math.round(missionScoreRatio(r) * 100) / 100;
              return (
                <FeedbackItem key={r.id} index={i + 1} ok={r.success} title={String(r.title).replace(/^\d+\.\s*/, '')}>
                  {r.blocksUsed}{r.suggested ? `/${r.suggested}` : ''} bloques · <b>{pts.toFixed(2)} pt</b>
                  {r.errored ? ` · ${r.errored}` : ''}
                </FeedbackItem>
              );
            })}
          </ResultsScreen>
        ) : (
          <motion.div
            className="mr-done"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            <span className="mr-done__art" aria-hidden="true"><span className="mr-done__ring" /><TopBot /></span>
            <h2>Práctica terminada</h2>
            <p>Has completado las {total} misiones de ESO {grade}º. ¡Gran trabajo programando!</p>
            <GameButton size="lg" icon={LayoutGrid} onClick={restart}>Volver al menú</GameButton>
          </motion.div>
        )}
      </GameShell>
    );
  }

  // --- Pantalla de juego ---
  if (!world || !robot) {
    return (
      <GameShell {...SHELL} wide className="mr-shell">
        <GameLoading label="Preparando la misión…" />
      </GameShell>
    );
  }
  const collectedCount = world.initialItems - itemsRemaining.size;
  const needItems = mission.objectives?.collectItems || 0;
  const headerMode = mode === 'exam' ? 'exam' : mode === 'easy' ? 'easy' : 'medium';
  const headerLabel = { easy: 'Fácil', medium: 'Medio', exam: 'Examen', reto: 'Reto' }[mode];

  return (
    <GameShell {...SHELL} wide className="mr-shell mr-playing">
      <GameHeader
        mode={headerMode}
        modeLabel={headerLabel}
        onHelp={() => setShowInstructions(true)}
        right={(
          <Hud>
            <HudStat icon={Target} tone="good" value={needItems ? `${collectedCount}/${needItems}` : 'Meta'} label={needItems ? 'Cristales' : 'Objetivo'} />
            <HudStat icon={Gauge} tone="score" value={`${countAllBlocks(program)}${mission.suggestedBlocks ? ` · ≈${mission.suggestedBlocks}` : ''}`} label="Bloques" />
            {isExam && <HudStat icon={Clock} tone="time" value={fmtTime(elapsed)} label="Tiempo" />}
          </Hud>
        )}
      />

      <div className="mr-route">
        <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={restart}>Menú</GameButton>
        {!isExam && !isReto && (
          <div className="mr-route__nodes" role="tablist" aria-label="Selector de misión">
            {missions.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className={`mr-route__node ${i === missionIndex ? 'is-current' : ''}`}
                onClick={() => setMissionIndex(i)}
                title={m.title}
                role="tab"
                aria-selected={i === missionIndex}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        {isExam && (
          <div className="mr-route__dots">
            <ProgressDots total={missions.length} current={examStep} results={examResults.map((r) => r.success)} />
          </div>
        )}
        {isReto && <Chip tone="accent" icon={Flame}>{mission.title}</Chip>}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={mission.id}
          className="mr-brief"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          <span className="mr-brief__avatar" aria-hidden="true"><TopBot /></span>
          <div className="mr-brief__bubble">
            <span className="mr-brief__eyebrow">{isReto ? 'Reto' : `Misión ${missionIndex + 1} de ${missions.length}`}</span>
            <h2 className="mr-brief__title">{String(mission.title).replace(/^\d+\.\s*/, '')}</h2>
            <p className="mr-brief__desc">{mission.description}</p>
            {(mode === 'easy' || (mode === 'medium' && showHint)) && (
              <div className="mr-hint"><Lightbulb size={16} /> {mission.hint}</div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="mr-play">
        <div className="mr-play__grid">
          <div className="mr-left">
            <div className="mr-arena">
              <div className="mr-arena__board">
                <Board world={world} robot={robot} itemsRemaining={itemsRemaining} running={running} />
              </div>
              <div className="mr-legend" aria-label="Leyenda">
                <span className="mr-legend__item"><span className="mr-legend__ico is-bot"><TopBot /></span>Robot</span>
                <span className="mr-legend__item"><span className="mr-legend__ico"><TargetPad /></span>Meta</span>
                <span className="mr-legend__item"><span className="mr-legend__ico"><Gem /></span>Cristal</span>
                <span className="mr-legend__item"><span className="mr-legend__ico is-wall" />Muro</span>
                <span className="mr-legend__item"><span className="mr-legend__ico is-hole" />Agujero</span>
              </div>
            </div>
            <Palette allowed={allowedTypes} onPalettePointerDown={handlePalettePointerDown} />
          </div>

          <div className="mr-right">
            <div className="mr-run-toolbar">
              <GameButton icon={running ? Pause : Play} onClick={handleRun} disabled={running || program.length === 0} className="mr-btn-run">
                {running ? 'Ejecutando…' : 'Ejecutar'}
              </GameButton>
              <GameButton variant="soft" size="sm" icon={Square} onClick={handleStop} disabled={running}>Reiniciar</GameButton>
              {mode === 'medium' && !showHint && (
                <GameButton variant="warning" size="sm" icon={Lightbulb} onClick={useHint}>
                  Pista {hintsUsed > 0 ? `(${hintsUsed})` : ''}
                </GameButton>
              )}
            </div>

            <RoundBanner
              show={!!feedback}
              status={feedback?.type === 'success' ? 'won' : 'lost'}
              title={feedback?.type === 'success' ? '¡Misión completada!' : 'Intenta otra vez'}
              subtitle={feedback?.type === 'success' ? 'Buen trabajo.' : feedback?.text}
              action={feedback?.type === 'success' && !isExam && !isReto ? nextMission : undefined}
              actionLabel={missionIndex < missions.length - 1 ? 'Siguiente misión' : 'Terminar'}
            />

            <AnimatePresence>
              {isReto && retoResult && (
                <motion.div
                  key="reto-result"
                  className={`mr-reto ${retoResult.success ? 'is-ok' : 'is-ko'}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                >
                  <div className="mr-reto__head"><Trophy size={20} /> {retoResult.success ? 'Reto superado' : 'Reto fallido'}</div>
                  <div className="mr-reto__body">
                    <GradeRing nota={retoResult.nota} size={128} />
                    <div className="mr-reto__stats">
                      <div><span>Bloques usados</span><b>{retoResult.blocksUsed}{retoResult.suggested ? ` / ${retoResult.suggested}` : ''}</b></div>
                      <div><span>Ítems</span><b>{retoResult.collected}/{retoResult.neededItems}</b></div>
                      {retoResult.progress != null && (
                        <div><span>Retos del curso</span><b>{retoResult.progress}/5</b></div>
                      )}
                    </div>
                  </div>
                  {retoResult.newBadge && (
                    <div className="mr-badge">
                      <span className="mr-badge__ico">{retoResult.newBadge.icon}</span>
                      <div>
                        <div className="mr-badge__title">¡Nueva insignia!</div>
                        <div className="mr-badge__name">{retoResult.newBadge.name_es}</div>
                        <div className="mr-badge__desc">{retoResult.newBadge.description_es} · <b>+{retoResult.newBadge.xp_reward} XP</b></div>
                      </div>
                    </div>
                  )}
                  <div className="mr-reto__actions">
                    <GameButton variant="soft" icon={LayoutGrid} onClick={restart}>Volver al menú</GameButton>
                    <GameButton icon={RotateCcw} onClick={newReto}>Otro reto</GameButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mr-program">
              <div className="mr-program-head">
                <span className="mr-hat"><Play size={13} fill="currentColor" /> al pulsar <b>Ejecutar</b></span>
                <GameButton variant="ghost" size="sm" icon={Trash2} onClick={handleClearProgram} disabled={program.length === 0} title="Borrar todo el programa">
                  Vaciar
                </GameButton>
              </div>
              <div
                className={`mr-program-root ${drag?.hover?.bodyId === 'root' ? 'over' : ''}`}
                ref={(n) => registerBody('root', n)}
                data-body-id="root"
              >
                {program.length === 0 && (
                  <div className="mr-program-empty">
                    <Puzzle size={18} /> Arrastra bloques desde la paleta y encájalos aquí.
                  </div>
                )}
                {program.map((b) => (
                  <BlockNode
                    key={b.id}
                    block={b}
                    onBlockPointerDown={handleBlockPointerDown}
                    onRemove={handleRemove}
                    onChangeField={handleChangeField}
                    registerBody={registerBody}
                    depth={0}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {instructions}

      {/* Drop marker global */}
      {drag?.hover && (
        <div
          className="mr-drop-marker"
          style={{
            position: 'fixed',
            top: drag.hover.markerY - 3,
            left: drag.hover.bodyRect.left + 4,
            width: Math.max(80, drag.hover.bodyRect.width - 8),
          }}
        />
      )}

      {/* Ghost chain */}
      {drag && (
        <div
          className="mr-drag-ghost"
          style={{
            position: 'fixed',
            left: drag.pointer.x - drag.offsetX,
            top: drag.pointer.y - drag.offsetY,
          }}
        >
          {drag.chain.map((b) => (
            <BlockGhost key={b.id} block={b} depth={0} />
          ))}
        </div>
      )}
    </GameShell>
  );
};

// Diálogo propio (sin window.confirm): reglas del examen / del reto.
function MrDialog({ open, tone = 'exam', icon: Icon, title, lead, children, actions = [], onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="mr-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className={`mr-dialog gk-tone-${tone}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 14 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mr-dialog__band" aria-hidden="true" />
            <span className="mr-dialog__medal" aria-hidden="true">{Icon && <Icon size={28} />}</span>
            <h2 className="mr-dialog__title">{title}</h2>
            {lead && <p className="mr-dialog__lead">{lead}</p>}
            <div className="mr-dialog__rules">{children}</div>
            <div className="mr-dialog__actions">
              {actions.map((a) => (
                <GameButton key={a.label} variant={a.variant || 'primary'} icon={a.icon} onClick={a.onClick} autoFocus={a.autoFocus}>{a.label}</GameButton>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MisionesRoboticas;
