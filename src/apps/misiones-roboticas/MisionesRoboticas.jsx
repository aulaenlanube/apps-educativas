import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowRight, Play, Pause, Square, RotateCcw, Trash2, X, Lightbulb, Trophy,
  Target, Gauge, Clock, Sparkles, Bot,
} from 'lucide-react';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import { GRADE_BLOCKS, CONDITIONS, getMissions, prepareWorld } from './misionesData';
import { fetchNormalMissions, pickRandomReto, recordRetoCompletion } from './robotMissionsService';
import { useAuth } from '@/contexts/AuthContext';
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

const Board = ({ world, robot, itemsRemaining }) => {
  const cellPx = useResponsiveCell();
  const cells = [];
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const key = `${x},${y}`;
      let cls = 'mr-cell';
      if (world.walls.has(key)) cls += ' wall';
      else if (world.holes.has(key)) cls += ' hole';
      if (world.target && world.target.x === x && world.target.y === y) cls += ' target';
      cells.push(
        <div key={key} className={cls} style={{ left: x * cellPx, top: y * cellPx, width: cellPx, height: cellPx }}>
          {world.target && world.target.x === x && world.target.y === y && (
            <span className="mr-target-ico">🎯</span>
          )}
          {world.holes.has(key) && !world.walls.has(key) && (
            <span className="mr-hole-ico">🕳</span>
          )}
        </div>
      );
    }
  }

  const itemEls = [...itemsRemaining].map((key) => {
    const [x, y] = key.split(',').map(Number);
    return (
      <motion.div
        key={`item-${key}`}
        className="mr-item"
        style={{ left: x * cellPx, top: y * cellPx, width: cellPx, height: cellPx }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        💎
      </motion.div>
    );
  });

  const dirRot = { N: -90, E: 0, S: 90, W: 180 };

  return (
    <div className="mr-board" style={{ width: world.cols * cellPx, height: world.rows * cellPx }}>
      {cells}
      {itemEls}
      <motion.div
        className="mr-robot"
        animate={{ left: robot.x * cellPx, top: robot.y * cellPx, rotate: dirRot[robot.dir] }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{ width: cellPx, height: cellPx }}
      >
        <span className="mr-robot-emoji">🤖</span>
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
      <span className="mr-block-ico" aria-hidden>{def.icon}</span>
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
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
        >
          <X size={11} />
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
          <div className="mr-c-foot" />
        </div>
      ))}
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
        <span className="mr-block-ico">{def.icon}</span>
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
          <div className="mr-c-foot" />
        </div>
      ))}
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
    <div className="mr-palette">
      <div className="mr-palette-head">
        <span className="mr-palette-title">🧩 Paleta</span>
        <span className="mr-palette-hint">arrastra los bloques al programa →</span>
      </div>
      {Object.entries(groups).map(([cat, types]) => (
        <div key={cat} className={`mr-palette-group cat-${cat}`}>
          <div className="mr-palette-group-title">{CAT_LABEL[cat]}</div>
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
                    <span className="mr-block-ico">{def.icon}</span>
                    <span className="mr-block-label">{def.label}</span>
                  </div>
                  {def.container && (
                    <>
                      <div className="mr-c-section is-then">
                        <div className="mr-c-mouth mini"><div className="mr-empty-slot">…</div></div>
                        <div className="mr-c-foot" />
                      </div>
                      {t === 'ifelse' && (
                        <div className="mr-c-section is-else">
                          <div className="mr-c-label">si no:</div>
                          <div className="mr-c-mouth mini"><div className="mr-empty-slot">…</div></div>
                          <div className="mr-c-foot" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Componente principal
// -----------------------------------------------------------------------------

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
  if (screen === 'intro') {
    return (
      <div className="mr-shell">
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          title="Cómo jugar a Programa al Robot"
        >
          <h3>🎯 Objetivo</h3>
          <p>Programa al robot con bloques para que cumpla cada misión: llegar a la meta 🎯, recoger ítems 💎 y evitar agujeros 🕳.</p>
          <h3>🧩 Cómo programar</h3>
          <ul>
            <li><b>Arrastra</b> un bloque desde la paleta hasta el programa.</li>
            <li>Los bloques tienen pestañas y muescas: se encajan unos con otros como piezas de puzzle.</li>
            <li>Los bloques 🔁 🔄 ❓ 🔀 tienen huecos donde puedes <b>anidar</b> otros bloques.</li>
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
          <ul>
            <li><b>Fácil</b>: pista siempre visible y feedback claro.</li>
            <li><b>Medio</b>: pista opcional (cuenta las que pides).</li>
            <li><b>Examen</b>: las 5 misiones del curso seguidas, sin ayudas. Nota sobre 10.</li>
          </ul>
        </InstructionsModal>

        <div className="mr-frame mr-frame-intro">
         <div className="mr-hero">
          <div className="mr-hero-top">
            <div className="mr-hero-title">
              <div className="mr-hero-badge"><Bot size={18} /> ESO {grade}º</div>
              <h1>Programa al Robot</h1>
              <p>Programa a tu robot con bloques visuales tipo puzzle y resuelve 10 misiones crecientes: bucles, condicionales y sensores aplicados a programación.</p>
            </div>
            <InstructionsButton onClick={() => setShowInstructions(true)} />
          </div>

          <div className="mr-mode-grid">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mr-mode-card mr-mode-easy" onClick={() => startPractice('easy')}>
              <div className="mr-mode-icon">🌱</div>
              <h3>Modo Fácil</h3>
              <p>Pista siempre visible y feedback al ejecutar. Perfecto para empezar.</p>
              <span className="mr-mode-cta">Empezar <ArrowRight size={16} /></span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mr-mode-card mr-mode-medium" onClick={() => startPractice('medium')}>
              <div className="mr-mode-icon">⚡</div>
              <h3>Modo Medio</h3>
              <p>Sin pista visible. Puedes pedirla, pero cada una cuenta. Más autonomía.</p>
              <span className="mr-mode-cta">Empezar <ArrowRight size={16} /></span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mr-mode-card mr-mode-exam" onClick={() => setShowExamIntro(true)}>
              <div className="mr-mode-icon">🎯</div>
              <h3>Modo Examen</h3>
              <p>Las 10 misiones del curso seguidas, sin ayudas. La nota depende de lo optimizado que sea tu código.</p>
              <span className="mr-mode-cta">Empezar <ArrowRight size={16} /></span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mr-mode-card mr-mode-reto" onClick={() => setShowRetoIntro(true)}>
              <div className="mr-mode-icon">🔥</div>
              <h3>Modo Reto</h3>
              <p>Un nivel aleatorio mucho más difícil. Resuélvelo con la menor cantidad de bloques posible.</p>
              <span className="mr-mode-cta">Empezar <ArrowRight size={16} /></span>
            </motion.button>
          </div>

          <div className="mr-missions-grid">
            <h3>📋 Misiones de ESO {grade}º</h3>
            <div className="mr-missions-cards">
              {missions.map((m, i) => (
                <div key={m.id} className="mr-mini-mission">
                  <div className="mr-mini-mission-num">{i + 1}</div>
                  <div className="mr-mini-mission-title">{m.title.replace(/^\d+\.\s*/, '')}</div>
                </div>
              ))}
            </div>
          </div>
         </div>
        </div>

        <AnimatePresence>
          {showExamIntro && (
            <motion.div
              className="mr-exam-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExamIntro(false)}
            >
              <motion.div
                className="mr-exam-modal"
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2>🎯 Modo Examen</h2>
                <p className="mr-exam-lead">
                  Tienes que completar las <b>10 misiones</b> del curso seguidas, sin saltarte ninguna y sin ayudas.
                </p>
                <div className="mr-exam-rules">
                  <h3>📏 Cómo se calcula la nota</h3>
                  <ul>
                    <li>La nota depende de <b>lo optimizado que sea tu código</b>.</li>
                    <li>Cuantos <b>menos bloques</b> uses para resolver cada misión, <b>más nota</b>.</li>
                    <li>Cada misión se compara con el número óptimo de bloques:
                      <ul>
                        <li>Usas los bloques óptimos o menos → <b>1 punto</b>.</li>
                        <li>Usas más bloques → menos puntos (proporcional).</li>
                        <li>No la completas → <b>0 puntos</b> en esa misión.</li>
                      </ul>
                    </li>
                    <li>La <b>nota final /10</b> es la media de puntos de las 10 misiones × 10.</li>
                  </ul>
                </div>
                <div className="mr-exam-actions">
                  <button className="mr-btn-secondary" onClick={() => setShowExamIntro(false)}>Cancelar</button>
                  <button className="mr-btn-primary" onClick={() => { setShowExamIntro(false); startExam(); }}>
                    <Play size={16} /> Empezar examen
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {showRetoIntro && (
            <motion.div
              className="mr-exam-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRetoIntro(false)}
            >
              <motion.div
                className="mr-exam-modal mr-reto-modal"
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2>🔥 Modo Reto</h2>
                <p className="mr-exam-lead">
                  Te tocará un <b>nivel aleatorio</b> mucho más difícil que los normales.
                </p>
                <div className="mr-exam-rules">
                  <h3>🧠 Cómo funciona</h3>
                  <ul>
                    <li>Se elige <b>al azar</b> entre un conjunto de niveles de alta dificultad.</li>
                    <li>Cada reto es más exigente que las misiones normales del curso.</li>
                    <li>Sin pistas ni selector: enfrentas el reto de primera.</li>
                    <li>La <b>nota depende de la optimización</b> de tu código:
                      <ul>
                        <li>Bloques óptimos o menos → <b>10/10</b>.</li>
                        <li>Más bloques → menos nota (proporcional).</li>
                        <li>Si no lo completas → <b>0/10</b>.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div className="mr-exam-actions">
                  <button className="mr-btn-secondary" onClick={() => setShowRetoIntro(false)}>Cancelar</button>
                  <button className="mr-btn-primary" onClick={() => { setShowRetoIntro(false); startReto(); }}>
                    <Play size={16} /> Afrontar reto
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (screen === 'summary') {
    const solved = examResults.filter((r) => r.success).length;
    const total = missions.length;
    const nota = Math.round((solved / total) * 100) / 10;
    const colorClass = nota >= 8 ? 'grade-high' : nota >= 5 ? 'grade-mid' : 'grade-low';
    const msg = nota >= 9 ? '¡Excelente!' : nota >= 7 ? '¡Muy bien!' : nota >= 5 ? 'Aprobado' : 'Necesitas repasar';

    return (
      <div className="mr-shell">
       <div className="mr-frame mr-frame-summary">
        <div className="mr-summary-card">
          <h1><Trophy size={28} /> {isExam ? 'Examen terminado' : 'Práctica terminada'}</h1>
          {isExam ? (
            <>
              <div className={`mr-note ${colorClass}`}>
                <span className="mr-note-value">{nota.toFixed(1)}</span>
                <span className="mr-note-max">/10</span>
              </div>
              <p className="mr-note-msg">{msg}</p>
              <div className="mr-summary-stats">
                <div className="mr-stat"><span>🏆 Misiones completadas</span><b>{solved} / {total}</b></div>
                <div className="mr-stat"><span>⏱️ Tiempo total</span><b>{Math.floor(elapsed / 60)}m {elapsed % 60}s</b></div>
              </div>
              <div className="mr-summary-list">
                {examResults.map((r, i) => {
                  const ratio = missionScoreRatio(r);
                  const pts = Math.round(ratio * 100) / 100;
                  return (
                    <div key={r.id} className={`mr-summary-row ${r.success ? 'ok' : 'ko'}`}>
                      <span className="mr-summary-idx">{i + 1}.</span>
                      <span className="mr-summary-title">{r.title}</span>
                      <span className="mr-summary-score">
                        {r.success ? '✓' : '✗'} · {r.blocksUsed}{r.suggested ? `/${r.suggested}` : ''} bloques
                        <b className="mr-summary-pts">{pts.toFixed(2)} pt</b>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="mr-summary-text">Has completado las {total} misiones de ESO {grade}º. ¡Gran trabajo programando!</p>
          )}
          <div className="mr-summary-actions">
            <button className="mr-btn-primary" onClick={restart}><RotateCcw size={16} /> Volver al menú</button>
            {isExam && (<button className="mr-btn-secondary" onClick={startExam}><Play size={16} /> Repetir examen</button>)}
          </div>
        </div>
       </div>
      </div>
    );
  }

  // --- Pantalla de juego ---
  if (!world || !robot) return null;
  const progress = `${missionIndex + 1} / ${missions.length}`;
  const collectedCount = world.initialItems - itemsRemaining.size;
  const needItems = mission.objectives?.collectItems || 0;

  return (
    <div className="mr-shell mr-playing">
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Ayuda rápida"
      >
        <p><b>Arrastra</b> bloques desde la paleta al programa. Los bloques encajan entre sí como piezas de puzzle.</p>
        <p>Los bloques 🔁 🔄 ❓ 🔀 tienen un hueco donde puedes soltar otros bloques dentro.</p>
        <p>Para moverlo: arrástralo; para eliminarlo: pulsa ✕ en su esquina.</p>
      </InstructionsModal>

      <div className="mr-frame">
        <div className="mr-playhead">
          <div className="mr-playhead-left">
            <span className={`mr-mode-chip mode-${mode}`}>
              {mode === 'easy' && '🌱 Fácil'}
              {mode === 'medium' && '⚡ Medio'}
              {mode === 'exam' && '🎯 Examen'}
              {mode === 'reto' && '🔥 Reto'}
            </span>
            <span className="mr-progress">{isReto ? mission.title : `Misión ${progress}`}</span>
            <div className="mr-hud-item"><Target size={14} /> <span>Objetivo</span> <b>{needItems ? `${collectedCount}/${needItems} 💎` : 'Meta 🎯'}</b></div>
            <div className="mr-hud-item"><Gauge size={14} /> <span>Bloques</span> <b>{countAllBlocks(program)}{mission.suggestedBlocks ? ` (≈${mission.suggestedBlocks})` : ''}</b></div>
            {isExam && (<span className="mr-timer"><Clock size={14} /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>)}
          </div>
          <div className="mr-playhead-right">
            <InstructionsButton onClick={() => setShowInstructions(true)} />
            <button className="mr-icon-btn" onClick={restart} title="Salir al menú"><RotateCcw size={16} /></button>
          </div>
        </div>

        {!isExam && !isReto && (
          <div className="mr-mission-picker" role="tablist" aria-label="Selector de misión">
            {missions.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className={`mr-mission-pick ${i === missionIndex ? 'active' : ''}`}
                onClick={() => setMissionIndex(i)}
                title={m.title}
                aria-selected={i === missionIndex}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <div className="mr-layout">
          <div className="mr-left">
            <Board world={world} robot={robot} itemsRemaining={itemsRemaining} />
            <Palette allowed={allowedTypes} onPalettePointerDown={handlePalettePointerDown} />
          </div>

          <div className="mr-right">
            <div className="mr-mission-card">
              <div className="mr-mission-title">
                <Sparkles size={18} />
                <h2>{mission.title}</h2>
              </div>
              <p className="mr-mission-desc">{mission.description}</p>
              {(mode === 'easy' || (mode === 'medium' && showHint)) && (
                <div className="mr-hint-box"><Lightbulb size={14} /> {mission.hint}</div>
              )}
            </div>

            <div className="mr-controls">
              <div className="mr-run-toolbar">
                <button className="mr-btn-run" onClick={handleRun} disabled={running || program.length === 0}>
                  {running ? (<><Pause size={16} /> Ejecutando…</>) : (<><Play size={16} /> Ejecutar</>)}
                </button>
                <button className="mr-btn-ghost" onClick={handleStop} disabled={running}>
                  <Square size={16} /> Reiniciar
                </button>
                {mode === 'medium' && !showHint && (
                  <button className="mr-btn-hint" onClick={useHint}>
                    <Lightbulb size={16} /> Pista {hintsUsed > 0 ? `(${hintsUsed})` : ''}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    key={feedback.text}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mr-feedback mr-feedback-${feedback.type}`}
                  >
                    {feedback.text}
                    {feedback.type === 'success' && !isExam && !isReto && (
                      <button className="mr-btn-primary mr-feedback-next" onClick={nextMission}>
                        {missionIndex < missions.length - 1 ? 'Siguiente misión' : 'Terminar'} <ArrowRight size={16} />
                      </button>
                    )}
                  </motion.div>
                )}
                {isReto && retoResult && (
                  <motion.div
                    key="reto-result"
                    className={`mr-reto-result ${retoResult.success ? 'ok' : 'ko'}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mr-reto-result-head">
                      <Trophy size={20} /> {retoResult.success ? 'Reto superado' : 'Reto fallido'}
                    </div>
                    <div className="mr-reto-result-body">
                      <div className="mr-reto-note">{retoResult.nota.toFixed(1)}<span>/10</span></div>
                      <div className="mr-reto-stats">
                        <div><span>Bloques usados</span><b>{retoResult.blocksUsed}{retoResult.suggested ? ` / ${retoResult.suggested}` : ''}</b></div>
                        <div><span>Ítems</span><b>{retoResult.collected}/{retoResult.neededItems}</b></div>
                        {retoResult.progress != null && (
                          <div><span>Retos del curso</span><b>{retoResult.progress}/5 🔥</b></div>
                        )}
                      </div>
                    </div>
                    {retoResult.newBadge && (
                      <div className="mr-badge-unlock">
                        <span className="mr-badge-ico">{retoResult.newBadge.icon}</span>
                        <div>
                          <div className="mr-badge-title">¡Nueva insignia!</div>
                          <div className="mr-badge-name">{retoResult.newBadge.name_es}</div>
                          <div className="mr-badge-desc">{retoResult.newBadge.description_es} · <b>+{retoResult.newBadge.xp_reward} XP</b></div>
                        </div>
                      </div>
                    )}
                    <div className="mr-reto-actions">
                      <button className="mr-btn-secondary" onClick={restart}>Volver al menú</button>
                      <button className="mr-btn-primary" onClick={newReto}>
                        <RotateCcw size={16} /> Otro reto
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mr-program">
              <div className="mr-program-head">
                <span>🧠 Mi programa</span>
                <button className="mr-mini-btn danger" onClick={handleClearProgram} disabled={program.length === 0} title="Borrar todo el programa">
                  <Trash2 size={12} /> Vaciar
                </button>
              </div>
              <div
                className={`mr-program-root ${drag?.hover?.bodyId === 'root' ? 'over' : ''}`}
                ref={(n) => registerBody('root', n)}
                data-body-id="root"
              >
                {program.length === 0 && (
                  <div className="mr-program-empty">
                    Arrastra bloques desde la paleta y encájalos aquí.
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
    </div>
  );
};

export default MisionesRoboticas;
