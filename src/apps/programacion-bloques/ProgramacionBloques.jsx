import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Play, RotateCcw, Trash2, ChevronLeft, ChevronRight, Check, X, Code2, Copy, Grid3x3, EyeOff, ArrowRight, Bot, HelpCircle, Pencil, Users, User } from 'lucide-react';
import { BLOCKS, blocksForGrade, getBlock, newNode, cloneNode, SENSORS, CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS, gradeIdFromParams, GRADE_LABELS } from './pbBlocks';
import { simulate, transpile } from './pbEngine';
import { getLevels, getRetos, checkLevel } from './pbLevels';
import Robot from './Robot';
import { FloorTile, WallTile, WaterTile, HoleTile, EnergyItem, EnergyStack, CrateTile, LaserBlast, TargetFlag, biomeForLevel, BIOME_INFO } from './PixelTiles';
import LevelEditor from './LevelEditor';
import { createRobotLevel, updateRobotLevel, deleteRobotLevel, listMyRobotLevels, listSharedRobotLevels, incrementRobotLevelPlays } from './pbLevelsService';
import { useAuth } from '../../contexts/AuthContext';
import './ProgramacionBloques.css';

const dragRef = { current: null };
const stop = (e) => e.stopPropagation();
const toSet = (v) => (v instanceof Set ? v : new Set(v || []));

/* -------------------- LEGEND -------------------- */
function LegendEntry({ children, label }) {
  return (
    <div className="pb-legend-entry">
      <div className="pb-legend-ico">{children}</div>
      <span>{label}</span>
    </div>
  );
}
function Legend({ biome, world }) {
  const has = (arr) => (arr || []).length > 0;
  const hasStacks = (world.items || []).some((s) => String(s).includes(':'));
  return (
    <div className="pb-legend">
      <div className="pb-legend-title">Leyenda</div>
      <div className="pb-legend-grid">
        <LegendEntry label="Suelo"><FloorTile x={0} y={0} biome={biome} /></LegendEntry>
        {has(world.walls) && <LegendEntry label="Obstáculo"><WallTile x={0} y={0} biome={biome} /></LegendEntry>}
        {has(world.water) && <LegendEntry label="Agua"><WaterTile x={0} y={0} biome={biome} /></LegendEntry>}
        {has(world.holes) && <LegendEntry label="Hoyo"><HoleTile biome={biome} /></LegendEntry>}
        {has(world.crates) && <LegendEntry label="Caja (láser)"><CrateTile biome={biome} /></LegendEntry>}
        {has(world.items) && <LegendEntry label={hasStacks ? 'Energía (×N)' : 'Energía'}>{hasStacks ? <EnergyStack count={3} /> : <EnergyItem />}</LegendEntry>}
        {world.target && <LegendEntry label="Meta"><TargetFlag /></LegendEntry>}
      </div>
    </div>
  );
}

/* -------------------- BOARD -------------------- */
// Ítems pueden venir como Map<cell, count> (nuevo motor) o Set<cell> (legacy).
function stacksToMap(input) {
  if (input instanceof Map) return input;
  const m = new Map();
  if (!input) return m;
  const iter = input instanceof Set ? [...input] : (Array.isArray(input) ? input : []);
  for (const raw of iter) {
    const s = String(raw); const [cell, cnt] = s.split(':');
    m.set(cell, (m.get(cell) || 0) + Math.max(1, parseInt(cnt, 10) || 1));
  }
  return m;
}

// Escala responsive por tamaño de tablero
function computeCellPx(cols, rows) {
  const max = Math.max(cols || 8, rows || 8);
  if (max <= 8) return 52;
  if (max <= 10) return 44;
  if (max <= 12) return 36;
  return Math.max(28, Math.floor(432 / max));
}

function Board({ world, robot, itemsLeft, crates, laser, moving, showGrid, biome }) {
  const cols = world.cols, rows = world.rows;
  const walls = useMemo(() => toSet(world.walls), [world.walls]);
  const water = useMemo(() => toSet(world.water), [world.water]);
  const holes = useMemo(() => toSet(world.holes), [world.holes]);
  const crateSet = useMemo(() => toSet(crates), [crates]);
  const itemsMap = useMemo(() => stacksToMap(itemsLeft), [itemsLeft]);
  const cellPx = computeCellPx(cols, rows);

  const floor = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      floor.push(<div key={`f${x}-${y}`} className="pb-cell pb-cell-floor"
        style={{ left: x * cellPx, top: y * cellPx, width: cellPx, height: cellPx }}>
        <FloorTile x={x} y={y} biome={biome} />
      </div>);
    }
  }

  const overlays = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = `${x},${y}`;
      const style = { left: x * cellPx, top: y * cellPx, width: cellPx, height: cellPx };
      if (walls.has(k)) overlays.push(<div key={`w${k}`} className="pb-cell" style={style}><WallTile x={x} y={y} biome={biome} /></div>);
      else if (water.has(k)) overlays.push(<div key={`wa${k}`} className="pb-cell" style={style}><WaterTile x={x} y={y} biome={biome} /></div>);
      else if (holes.has(k)) overlays.push(<div key={`h${k}`} className="pb-cell" style={style}><HoleTile biome={biome} /></div>);
      else if (crateSet.has(k)) overlays.push(<div key={`cr${k}`} className="pb-cell pb-crate" style={style}><CrateTile biome={biome} /></div>);
    }
  }

  const target = world.target ? (
    <div className="pb-cell" style={{
      left: world.target.x * cellPx + cellPx * 0.18, top: world.target.y * cellPx + cellPx * 0.1,
      width: cellPx * 0.64, height: cellPx * 0.8,
    }}><TargetFlag /></div>
  ) : null;

  const items = [...itemsMap.entries()].map(([k, count]) => {
    const [x, y] = k.split(',').map(Number);
    return (
      <div key={k} className="pb-item" style={{
        left: x * cellPx + cellPx * 0.12, top: y * cellPx + cellPx * 0.08,
        width: cellPx * 0.76, height: cellPx * 0.84,
      }}>
        {count > 1 ? <EnergyStack count={count} /> : <EnergyItem />}
      </div>
    );
  });

  // Láser: explosión centrada en la celda objetivo (un poco más grande que la celda)
  let laserEl = null;
  if (laser) {
    const size = cellPx * 1.35;
    const cx = laser.target.x * cellPx + cellPx / 2;
    const cy = laser.target.y * cellPx + cellPx / 2;
    laserEl = (
      <div key={`laser-${laser.id}`} className="pb-blast-wrap" style={{ left: cx - size / 2, top: cy - size / 2, width: size, height: size }}>
        <LaserBlast />
      </div>
    );
  }

  return (
    <div className={`pb-board pb-biome-${biome} ${showGrid ? 'pb-board-grid' : ''}`}
      style={{ width: cols * cellPx, height: rows * cellPx, background: BIOME_INFO[biome]?.bg, '--pb-cell': `${cellPx}px` }}>
      {floor}{overlays}{target}{items}
      {showGrid && <div className="pb-grid-overlay" />}
      {laserEl}
      <div className="pb-robot" style={{
        left: robot.x * cellPx + cellPx * -0.1,
        top: robot.y * cellPx - cellPx * 0.3,
        width: cellPx * 1.2, height: cellPx * 1.35,
      }}>
        <Robot dir={robot.dir} moving={moving} />
      </div>
    </div>
  );
}

/* -------------------- FIELD EDITOR -------------------- */
function FieldEditor({ field, value, onChange, disabled }) {
  if (field.type === 'op') return (
    <select value={value || field.options[0]} onChange={(e) => onChange(e.target.value)} onClick={stop} disabled={disabled} className="pb-field">
      {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (field.type === 'sensor') return (
    <select value={value || SENSORS[0].value} onChange={(e) => onChange(e.target.value)} onClick={stop} disabled={disabled} className="pb-field" style={{ width: field.width }}>
      {SENSORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
    </select>
  );
  if (field.type === 'number') return (
    <input type="number" min={field.min ?? 0} max={field.max ?? 99} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      onKeyDown={stop} onClick={stop} disabled={disabled} className="pb-field pb-field-num" style={{ width: field.width }} />
  );
  return (
    <input type="text" value={value ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)}
      onKeyDown={stop} onClick={stop} disabled={disabled} className="pb-field" style={{ width: field.width }} />
  );
}

/* -------------------- BLOCK NODE -------------------- */
function BlockNode({ node, path, onField, onAdd, onMove, onRemove, disabled }) {
  const def = getBlock(node.kind);
  if (!def) return null;
  const isContainer = (def.slots || []).length > 0;
  const onDragStart = (e) => {
    if (disabled) return;
    e.stopPropagation();
    dragRef.current = { source: 'workspace', path, node };
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const segs = def.tpl.split(/(%\w+%)/g);
  const renderSegs = () => segs.map((seg, i) => {
    const m = /^%(\w+)%$/.exec(seg);
    if (m) {
      const f = (def.fields || []).find((ff) => ff.name === m[1]);
      if (!f) return null;
      return <FieldEditor key={i} field={f} value={node.fields[f.name]} onChange={(v) => onField(path, f.name, v)} disabled={disabled} />;
    }
    return <span key={i} className="pb-block-txt">{seg}</span>;
  });

  if (!isContainer) {
    return (
      <div className={`pb-block is-stack cat-${def.category}`} draggable={!disabled} onDragStart={onDragStart}>
        {renderSegs()}
        {!disabled && <button className="pb-block-trash" onClick={(e) => { e.stopPropagation(); onRemove(path); }}><Trash2 size={12} /></button>}
      </div>
    );
  }
  return (
    <div className={`pb-block is-container cat-${def.category}`} draggable={!disabled} onDragStart={onDragStart}>
      <div className="pb-block-head">
        {renderSegs()}
        {!disabled && <button className="pb-block-trash" onClick={(e) => { e.stopPropagation(); onRemove(path); }}><Trash2 size={12} /></button>}
      </div>
      {(def.slots || []).map((s) => (
        <div key={s} className="pb-c-section">
          {s === 'elseBody' && <div className="pb-c-label">si no</div>}
          <Dropzone path={[...path, s]} items={node.slots?.[s] || []} onField={onField} onAdd={onAdd} onMove={onMove} onRemove={onRemove} disabled={disabled} indent />
        </div>
      ))}
      <div className="pb-c-foot" />
    </div>
  );
}

/* -------------------- DROPZONE -------------------- */
function Dropzone({ path, items, onField, onAdd, onMove, onRemove, disabled, indent }) {
  const [over, setOver] = useState(false);
  const onDragOver = (e) => { if (disabled) return; e.preventDefault(); e.stopPropagation(); setOver(true); };
  const onDragLeave = (e) => { e.stopPropagation(); setOver(false); };
  const onDrop = (e) => {
    if (disabled) return;
    e.preventDefault(); e.stopPropagation(); setOver(false);
    const d = dragRef.current; dragRef.current = null;
    if (!d) return;
    if (d.source === 'palette') {
      const n = newNode(d.kind);
      if (n) onAdd(path, n, items.length);
    } else if (d.source === 'workspace') {
      onMove?.(d.path, path, items.length);
    }
  };
  return (
    <div className={`pb-dropzone ${over ? 'is-over' : ''} ${indent ? 'is-indent' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {items.length === 0 && <div className="pb-dropzone-empty">{indent ? '⇣ bloques aquí' : '→ arrastra bloques aquí'}</div>}
      {items.map((it, idx) => (
        <BlockNode key={it.id} node={it} path={[...path, idx]} onField={onField} onAdd={onAdd} onMove={onMove} onRemove={onRemove} disabled={disabled} />
      ))}
    </div>
  );
}

/* -------------------- PALETTE (compacta, solo bloques del curso) -------------------- */
function Palette({ gradeId, onAddToEnd, disabled }) {
  const byCat = useMemo(() => {
    const m = {};
    for (const b of blocksForGrade(gradeId)) (m[b.category] = m[b.category] || []).push(b);
    return m;
  }, [gradeId]);
  const onDragStart = (e, kind) => {
    if (disabled) return;
    dragRef.current = { source: 'palette', kind };
    e.dataTransfer.setData('text/plain', kind);
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <div className="pb-palette">
      <div className="pb-palette-title">🧩 Paleta</div>
      {CATEGORY_ORDER.map((cat) => {
        if (!byCat[cat]?.length) return null;
        return (
          <div key={cat} className="pb-pal-cat">
            <div className={`pb-pal-cat-title cat-${cat}`}>{CATEGORY_LABELS[cat]}</div>
            <div className="pb-pal-cat-items">
              {byCat[cat].map((b) => {
                const isContainer = (b.slots || []).length > 0;
                return (
                  <div key={b.kind} className={`pb-block ${isContainer ? 'is-container' : 'is-stack'} cat-${b.category} pb-pal-item`}
                       draggable={!disabled}
                       onDragStart={(e) => onDragStart(e, b.kind)}
                       onClick={() => !disabled && onAddToEnd?.(b.kind)}
                       title={`${b.tpl}\n(arrastra o haz clic)`}>
                    <div className="pb-block-head">
                      <span className="pb-block-txt">{b.label}</span>
                    </div>
                    {isContainer && <div className="pb-c-foot" />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- MAIN -------------------- */
export default function ProgramacionBloques({ onGameComplete } = {}) {
  const { level, grade } = useParams();
  const gradeId = useMemo(() => gradeIdFromParams(level, grade), [level, grade]);

  // Auth — para niveles propios y compartidos
  const auth = useAuth();
  const creator = useMemo(() => {
    if (auth?.student?.id) return { type: 'student', id: auth.student.id, name: auth.displayName || auth.student.display_name || 'Alumno', groupId: auth.student.groups?.[0]?.group_id || auth.student.groups?.[0]?.id || null };
    if (auth?.teacher?.id) return { type: 'teacher', id: auth.teacher.id, name: auth.displayName || auth.teacher.display_name || 'Docente', groupId: null };
    return null;
  }, [auth]);

  // Fases: 'menu' | 'play' | 'edit' | 'mine' (mis niveles) | 'shared' (de compañeros)
  const [phase, setPhase] = useState('menu');
  const [mode, setMode] = useState('normal'); // 'easy' | 'normal' | 'examen' | 'reto' | 'custom'
  const [currentIdx, setCurrentIdx] = useState(0);

  // Niveles creados por el usuario / compañeros
  const [myLevels, setMyLevels] = useState([]);
  const [sharedLevels, setSharedLevels] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // level existente al editar, null al crear
  const [customLevel, setCustomLevel] = useState(null); // nivel a jugar cuando mode='custom'

  const levels = useMemo(() => {
    if (mode === 'custom' && customLevel) return [customLevel];
    if (mode === 'reto') return getRetos(level, grade);
    return getLevels(level, grade);
  }, [level, grade, mode, customLevel]);
  const normalLevels = useMemo(() => getLevels(level, grade), [level, grade]);
  const retosList = useMemo(() => getRetos(level, grade), [level, grade]);

  const [program, setProgram] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const hasFuncBlocks = useMemo(() => {
    const gid = gradeId || 0;
    return gid >= 9; // 3º ESO en adelante (proc_decl / func_decl)
  }, [gradeId]);
  const [robot, setRobot] = useState(null);
  const [itemsLeft, setItemsLeft] = useState(new Map());
  const [cratesLeft, setCratesLeft] = useState(new Set());
  const [laser, setLaser] = useState(null);
  const laserTimerRef = useRef(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelLang, setPanelLang] = useState('python');
  const [moving, setMoving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const reportedRef = useRef(new Set());
  const playTimerRef = useRef(null);
  const levelStartRef = useRef(0);
  const currentLevel = levels[currentIdx];
  const biome = useMemo(() => biomeForLevel(currentIdx), [currentIdx]);

  useEffect(() => {
    if (phase === 'play' && currentLevel) {
      setRobot({ ...currentLevel.world.robot });
      setItemsLeft(stacksToMap(currentLevel.world.items));
      setCratesLeft(new Set(currentLevel.world.crates || []));
      setLaser(null);
      setProgram([]); setDefinitions([]); setError(null); setStatus(null);
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (laserTimerRef.current) clearTimeout(laserTimerRef.current);
      levelStartRef.current = Date.now();
    }
  }, [phase, currentIdx, currentLevel]);

  const cloneBlock = (n) => ({ ...n, fields: { ...(n.fields || {}) }, slots: Object.fromEntries(Object.entries(n.slots || {}).map(([k, v]) => [k, [...v]])) });

  // Elige el setter en función de la raíz del path ('body' = programa principal, 'defs' = panel de definiciones)
  const setterFor = useCallback((root) => (root === 'defs' ? setDefinitions : setProgram), []);

  const onAdd = useCallback((path, node, index) => {
    const setter = setterFor(path[0]);
    setter((prev) => {
      const build = (arr, d) => {
        if (d * 2 + 1 === path.length) {
          const next = [...arr]; next.splice(Math.max(0, Math.min(next.length, index)), 0, node); return next;
        }
        const idx = path[d * 2 + 1];
        const next = [...arr];
        if (idx == null || idx < 0 || idx >= next.length) return next;
        const p = cloneBlock(next[idx]), ns = path[d * 2 + 2];
        p.slots[ns] = build(p.slots[ns] || [], d + 1); next[idx] = p; return next;
      };
      return build(prev, 0);
    });
    setStatus(null);
  }, [setterFor]);

  const onField = useCallback((path, field, val) => {
    const setter = setterFor(path[0]);
    setter((prev) => {
      const build = (arr, d) => {
        const idx = path[d * 2 + 1]; if (idx == null || idx < 0 || idx >= arr.length) return arr;
        const next = [...arr], p = cloneBlock(next[idx]);
        if (d * 2 + 2 === path.length) p.fields = { ...p.fields, [field]: val };
        else { const ns = path[d * 2 + 2]; p.slots[ns] = build(p.slots[ns] || [], d + 1); }
        next[idx] = p; return next;
      };
      return build(prev, 0);
    });
    setStatus(null);
  }, [setterFor]);

  const addToEnd = useCallback((kind) => {
    const n = newNode(kind);
    if (!n) return;
    // Las declaraciones de proc/func van al panel de definiciones; el resto al programa principal
    const isDecl = kind === 'proc_decl' || kind === 'func_decl';
    const setter = isDecl ? setDefinitions : setProgram;
    setter((prev) => [...prev, n]);
    setStatus(null);
  }, []);

  const onRemove = useCallback((path) => {
    const setter = setterFor(path[0]);
    setter((prev) => {
      const build = (arr, d) => {
        const idx = path[d * 2 + 1]; if (idx == null || idx < 0 || idx >= arr.length) return arr;
        if (d * 2 + 2 === path.length) return arr.filter((_, i) => i !== idx);
        const next = [...arr], p = cloneBlock(next[idx]), ns = path[d * 2 + 2];
        p.slots[ns] = build(p.slots[ns] || [], d + 1); next[idx] = p; return next;
      };
      return build(prev, 0);
    });
    setStatus(null);
  }, [setterFor]);

  // Mueve un bloque de fromPath a destPath/destIndex. Admite movimientos entre
  // los paneles 'body' y 'defs' (cross-panel) o dentro del mismo panel.
  const onMove = useCallback((fromPath, destPath, destIndex) => {
    const fromRoot = fromPath[0], destRoot = destPath[0];
    if (!['body', 'defs'].includes(fromRoot) || !['body', 'defs'].includes(destRoot)) return;

    if (fromRoot === destRoot) {
      const setter = setterFor(fromRoot);
      setter((prev) => movePath(prev, fromPath, destPath, destIndex));
      setStatus(null);
      return;
    }

    // Movimiento entre paneles distintos: extraer del origen y luego insertar en el destino
    let extracted = null;
    const setSrc = setterFor(fromRoot);
    setSrc((prev) => {
      const { nextArr, node } = extractPath(prev, fromPath);
      extracted = node;
      return nextArr;
    });
    // Diferido a microtask para asegurar que el setter del destino vea el nodo
    queueMicrotask(() => {
      if (!extracted) return;
      const cloned = cloneNode(extracted);
      const setDst = setterFor(destRoot);
      setDst((prev) => insertPath(prev, destPath, destIndex, cloned));
      setStatus(null);
    });
  }, [setterFor]);

  // Helpers puros para extraer/insertar/mover en un árbol de bloques --------
  function extractPath(arr, fromPath) {
    let node = null;
    const walk = (a, d) => {
      const idx = fromPath[d * 2 + 1]; if (idx == null || idx < 0 || idx >= a.length) return a;
      if (d * 2 + 2 === fromPath.length) { node = a[idx]; return a.filter((_, i) => i !== idx); }
      const next = [...a], p = cloneBlock(next[idx]), ns = fromPath[d * 2 + 2];
      p.slots[ns] = walk(p.slots[ns] || [], d + 1); next[idx] = p; return next;
    };
    return { nextArr: walk(arr, 0), node };
  }
  function insertPath(arr, destPath, destIndex, node) {
    const walk = (a, d) => {
      if (d * 2 + 1 === destPath.length) {
        const next = [...a]; next.splice(Math.max(0, Math.min(next.length, destIndex)), 0, node); return next;
      }
      const idx = destPath[d * 2 + 1];
      const next = [...a];
      if (idx == null || idx < 0 || idx >= next.length) return next;
      const p = cloneBlock(next[idx]), ns = destPath[d * 2 + 2];
      p.slots[ns] = walk(p.slots[ns] || [], d + 1); next[idx] = p; return next;
    };
    return walk(arr, 0);
  }
  function movePath(prev, fromPath, destPath, destIndex) {
    const { nextArr: afterRemove, node } = extractPath(prev, fromPath);
    if (!node) return prev;
    const moved = cloneNode(node);

    // Ajustar índice de inserción si el origen estaba antes del destino en la misma dropzone
    let effectiveIndex = destIndex;
    if (fromPath.length === destPath.length + 1 &&
        fromPath.slice(0, destPath.length).every((v, i) => v === destPath[i]) &&
        typeof fromPath[fromPath.length - 1] === 'number' &&
        destIndex > fromPath[fromPath.length - 1]) {
      effectiveIndex = destIndex - 1;
    }
    return insertPath(afterRemove, destPath, effectiveIndex, moved);
  }

  const reset = () => {
    if (playTimerRef.current) { clearInterval(playTimerRef.current); playTimerRef.current = null; }
    if (laserTimerRef.current) { clearTimeout(laserTimerRef.current); laserTimerRef.current = null; }
    setRobot({ ...currentLevel.world.robot });
    setItemsLeft(stacksToMap(currentLevel.world.items));
    setCratesLeft(new Set(currentLevel.world.crates || []));
    setLaser(null);
    setStatus(null); setError(null); setMoving(false);
  };
  const clearProgram = () => { setProgram([]); setDefinitions([]); reset(); };

  const run = () => {
    if (!currentLevel) return;
    reset();
    const result = simulate([...definitions, ...program], currentLevel.world);
    setStatus('running');
    let i = 0, laserSeq = 0;
    playTimerRef.current = setInterval(() => {
      if (i >= result.trace.length) {
        clearInterval(playTimerRef.current); playTimerRef.current = null;
        setMoving(false);
        const ok = checkLevel(currentLevel, result);
        setStatus(ok ? 'ok' : 'wrong');
        if (result.error) setError(result.error);
        if (ok && !reportedRef.current.has(currentLevel.id)) {
          reportedRef.current.add(currentLevel.id);
          const isExam = mode === 'examen';
          // Bonus por rapidez en examen: 90s/nivel de presupuesto
          const elapsedSec = levelStartRef.current
            ? Math.max(1, Math.round((Date.now() - levelStartRef.current) / 1000))
            : 0;
          const TIME_BUDGET_PER_LEVEL = 90;
          const SPEED_COEF = 2;
          const timeBonus = isExam && elapsedSec > 0
            ? Math.max(0, Math.round((TIME_BUDGET_PER_LEVEL - elapsedSec) * SPEED_COEF))
            : 0;
          onGameComplete?.({
            mode: isExam ? 'test' : 'practice',
            score: reportedRef.current.size * 50 + timeBonus,
            maxScore: levels.length * 50 + (isExam ? TIME_BUDGET_PER_LEVEL * SPEED_COEF : 0),
            correctAnswers: reportedRef.current.size,
            totalQuestions: levels.length,
            durationSeconds: elapsedSec || undefined,
          });
        }
        return;
      }
      const step = result.trace[i++];
      setRobot(step.robot);
      if (step.itemStacks) setItemsLeft(new Map(step.itemStacks));
      else if (step.items) setItemsLeft(stacksToMap(step.items));
      if (step.crates) setCratesLeft(new Set(step.crates));
      setMoving(step.kind === 'move');
      if (step.kind === 'fire') {
        laserSeq++;
        setLaser({ id: laserSeq, from: { x: step.robot.x, y: step.robot.y }, target: step.target });
        if (laserTimerRef.current) clearTimeout(laserTimerRef.current);
        laserTimerRef.current = setTimeout(() => setLaser(null), 420);
      }
    }, 240);
  };

  const next = () => { if (currentIdx < levels.length - 1) setCurrentIdx(currentIdx + 1); };
  const prev = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); };
  const goMenu = () => { setPhase('menu'); if (playTimerRef.current) clearInterval(playTimerRef.current); };

  const transpiled = useMemo(() => transpile([...definitions, ...program], panelLang), [definitions, program, panelLang]);

  const startMission = (idx, selectedMode = 'normal') => {
    setMode(selectedMode);
    setCurrentIdx(idx);
    setShowGrid(selectedMode === 'easy');
    reportedRef.current = new Set();
    setCustomLevel(null);
    setPhase('play');
  };

  // Jugar un nivel personalizado (propio o de un compañero)
  const playCustom = useCallback((row) => {
    const world = row.world || {};
    const cols = world.cols || 8, rows = world.rows || 8;
    const custom = {
      id: row.id ? `custom-${row.id}` : `custom-preview`,
      title: row.title || 'Mi nivel',
      goal: row.description || 'Nivel creado por un usuario',
      world: {
        cols, rows,
        robot: world.robot || { x: 0, y: rows - 1, dir: 'E' },
        walls: world.walls || [], water: world.water || [],
        holes: world.holes || [], crates: world.crates || [],
        items: world.items || [],
        target: world.target || null,
      },
    };
    setCustomLevel(custom);
    setMode('custom');
    setCurrentIdx(0);
    setShowGrid(false);
    reportedRef.current = new Set();
    if (row.id) incrementRobotLevelPlays(row.id).catch(() => {});
    setPhase('play');
  }, []);

  // Lists: cargar al entrar a "mine" / "shared"
  const refreshMine = useCallback(async () => {
    if (!creator) return;
    setLoadingLists(true);
    try {
      const list = await listMyRobotLevels({ creatorType: creator.type, creatorId: creator.id, level, grade: parseInt(grade, 10) });
      setMyLevels(list);
    } catch (e) { console.error(e); }
    finally { setLoadingLists(false); }
  }, [creator, level, grade]);

  const refreshShared = useCallback(async () => {
    if (!creator) return;
    setLoadingLists(true);
    try {
      const list = await listSharedRobotLevels({ groupId: creator.groupId, level, grade: parseInt(grade, 10), excludeCreatorId: creator.id });
      setSharedLevels(list);
    } catch (e) { console.error(e); }
    finally { setLoadingLists(false); }
  }, [creator, level, grade]);

  const openCreate = () => { setEditTarget(null); setPhase('edit'); };
  const openEdit = (row) => { setEditTarget(row); setPhase('edit'); };
  const openMine = () => { refreshMine(); setPhase('mine'); };
  const openShared = () => { refreshShared(); setPhase('shared'); };

  const saveEditor = useCallback(async ({ title: t, description: d, world, shared }) => {
    if (!creator) { alert('Debes iniciar sesión para guardar niveles.'); return false; }
    try {
      if (editTarget?.id) {
        await updateRobotLevel({
          id: editTarget.id, creatorType: creator.type, creatorId: creator.id,
          title: t, description: d, world, shared, groupId: shared ? creator.groupId : null,
        });
      } else {
        await createRobotLevel({
          creatorType: creator.type, creatorId: creator.id, creatorName: creator.name,
          title: t, description: d, world,
          level, grade: parseInt(grade, 10),
          shared, groupId: shared ? creator.groupId : null,
        });
      }
      setPhase('mine');
      refreshMine();
      return true;
    } catch (e) {
      console.error(e); alert('No se pudo guardar: ' + (e.message || e));
      return false;
    }
  }, [creator, editTarget, level, grade, refreshMine]);

  const removeLevel = async (id) => {
    if (!creator) return;
    if (!confirm('¿Borrar este nivel? Esta acción no se puede deshacer.')) return;
    try {
      await deleteRobotLevel({ id, creatorType: creator.type, creatorId: creator.id });
      refreshMine();
    } catch (e) { alert('No se pudo borrar: ' + (e.message || e)); }
  };

  /* -------------------- MENU -------------------- */
  if (phase === 'menu') {
    return (
      <div className="pb-root">
        <div className="pb-frame pb-frame-menu">
          <div className="pb-hero">
            <div className="pb-hero-top">
              <div className="pb-hero-title">
                <div className="pb-hero-badge"><Bot size={16} /> {GRADE_LABELS[gradeId]}</div>
                <h1>Programa al Robot</h1>
                <p>Arrastra bloques visuales para que tu robot cruce 10 misiones por tierras cada vez más complejas: pradera, bosque, montaña, ciudad y centro de datos.</p>
              </div>
            </div>

            <div className="pb-mode-grid">
              <button className="pb-mode-card pb-mode-easy" onClick={() => startMission(0, 'easy')}>
                <div className="pb-mode-icon">🌱</div>
                <h3>Modo Fácil</h3>
                <p>Rejilla siempre visible y pistas claras. Perfecto para empezar.</p>
                <span className="pb-mode-cta">Empezar <ArrowRight size={14} /></span>
              </button>
              <button className="pb-mode-card pb-mode-normal" onClick={() => startMission(0, 'normal')}>
                <div className="pb-mode-icon">⚡</div>
                <h3>Modo Normal</h3>
                <p>Desafío estándar: 10 misiones progresivas con todos los bloques del curso.</p>
                <span className="pb-mode-cta">Empezar <ArrowRight size={14} /></span>
              </button>
              <button className="pb-mode-card pb-mode-exam" onClick={() => startMission(0, 'examen')}>
                <div className="pb-mode-icon">📝</div>
                <h3>Modo Examen</h3>
                <p>Completa las 10 misiones sin ayudas. Tu nota se calcula sobre 10.</p>
                <span className="pb-mode-cta">Empezar <ArrowRight size={14} /></span>
              </button>
              <button className="pb-mode-card pb-mode-reto" onClick={() => startMission(0, 'reto')}>
                <div className="pb-mode-icon">🔥</div>
                <h3>Modo Reto</h3>
                <p>{retosList.length} retos muy difíciles creados para tu curso. Solo para expertos.</p>
                <span className="pb-mode-cta">Empezar <ArrowRight size={14} /></span>
              </button>
            </div>

            <div className="pb-missions-grid">
              <h3>📋 Misiones del curso</h3>
              <div className="pb-missions-cards">
                {normalLevels.map((m, i) => {
                  const b = biomeForLevel(i);
                  return (
                    <button key={m.id} className={`pb-mission-card pb-biome-${b}`} onClick={() => startMission(i, 'normal')}>
                      <div className="pb-mission-num">{i + 1}</div>
                      <div className="pb-mission-info">
                        <div className="pb-mission-title">{m.title}</div>
                        <div className="pb-mission-biome">{BIOME_INFO[b].label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nueva sección: crear y explorar niveles personalizados */}
            <div className="pb-custom-grid">
              <h3>🎨 Crea tu propio nivel</h3>
              <p className="pb-custom-hint">Diseña un mapa con tus obstáculos, compártelo con la clase y juega los de tus compañeros.</p>
              <div className="pb-custom-actions">
                <button className="pb-custom-card pb-custom-create" onClick={openCreate} disabled={!creator} title={!creator ? 'Inicia sesión para crear niveles' : ''}>
                  <div className="pb-custom-icon">🎨</div>
                  <div className="pb-custom-meta">
                    <div className="pb-custom-title">Crear nivel</div>
                    <div className="pb-custom-sub">Dibuja el tablero, pon obstáculos y meta</div>
                  </div>
                </button>
                <button className="pb-custom-card pb-custom-mine" onClick={openMine} disabled={!creator}>
                  <div className="pb-custom-icon"><User size={22} /></div>
                  <div className="pb-custom-meta">
                    <div className="pb-custom-title">Mis niveles</div>
                    <div className="pb-custom-sub">Juega y edita los que has creado</div>
                  </div>
                </button>
                <button className="pb-custom-card pb-custom-shared" onClick={openShared} disabled={!creator}>
                  <div className="pb-custom-icon"><Users size={22} /></div>
                  <div className="pb-custom-meta">
                    <div className="pb-custom-title">De mis compañeros</div>
                    <div className="pb-custom-sub">Niveles compartidos por tu clase</div>
                  </div>
                </button>
              </div>
              {!creator && (
                <div className="pb-custom-warn">⚠ Necesitas iniciar sesión para crear y compartir niveles.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- EDITOR -------------------- */
  if (phase === 'edit') {
    return (
      <LevelEditor
        gradeId={gradeId}
        level={level}
        grade={grade}
        biomeIdx={0}
        canShare={creator?.type === 'student' ? !!creator?.groupId : creator?.type === 'teacher'}
        onBack={goMenu}
        onPlay={playCustom}
        onSaved={saveEditor}
        editTarget={editTarget}
      />
    );
  }

  /* -------------------- MIS NIVELES -------------------- */
  if (phase === 'mine') {
    return (
      <div className="pb-root">
        <div className="pb-frame pb-frame-menu">
          <div className="pb-play-header">
            <button className="pb-icon-btn" onClick={goMenu}><ChevronLeft size={16} /> Menú</button>
            <div className="pb-play-title">
              <span className="pb-play-emoji">👤</span>
              <span className="pb-play-text">Mis niveles</span>
            </div>
            <div className="pb-spacer" />
            <button className="pb-btn pb-btn-primary" onClick={openCreate}><Pencil size={14} /> Crear nuevo</button>
          </div>
          {loadingLists && <p>Cargando…</p>}
          {!loadingLists && myLevels.length === 0 && (
            <p className="pb-empty">Aún no has creado ningún nivel. Pulsa "Crear nuevo" para empezar.</p>
          )}
          <div className="pb-user-levels">
            {myLevels.map((row) => (
              <div key={row.id} className="pb-user-level">
                <div className="pb-user-level-info">
                  <div className="pb-user-level-title">{row.title}</div>
                  {row.description && <div className="pb-user-level-desc">{row.description}</div>}
                  <div className="pb-user-level-meta">
                    {row.shared ? <span><Users size={12} /> Compartido</span> : <span><User size={12} /> Privado</span>}
                    · 🎮 {row.plays} partidas
                  </div>
                </div>
                <div className="pb-user-level-actions">
                  <button className="pb-btn pb-btn-primary" onClick={() => playCustom(row)}><Play size={12} /> Jugar</button>
                  <button className="pb-btn pb-btn-ghost" onClick={() => openEdit(row)}><Pencil size={12} /> Editar</button>
                  <button className="pb-btn pb-btn-ghost" onClick={() => removeLevel(row.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- NIVELES COMPARTIDOS -------------------- */
  if (phase === 'shared') {
    return (
      <div className="pb-root">
        <div className="pb-frame pb-frame-menu">
          <div className="pb-play-header">
            <button className="pb-icon-btn" onClick={goMenu}><ChevronLeft size={16} /> Menú</button>
            <div className="pb-play-title">
              <span className="pb-play-emoji">🌍</span>
              <span className="pb-play-text">Niveles de mis compañeros</span>
            </div>
          </div>
          {loadingLists && <p>Cargando…</p>}
          {!loadingLists && sharedLevels.length === 0 && (
            <p className="pb-empty">Aún no hay niveles compartidos en tu clase. ¡Sé el primero en compartir uno!</p>
          )}
          <div className="pb-user-levels">
            {sharedLevels.map((row) => (
              <div key={row.id} className="pb-user-level">
                <div className="pb-user-level-info">
                  <div className="pb-user-level-title">{row.title}</div>
                  {row.description && <div className="pb-user-level-desc">{row.description}</div>}
                  <div className="pb-user-level-meta">
                    <span><User size={12} /> {row.creator_name}</span> · 🎮 {row.plays} partidas
                  </div>
                </div>
                <div className="pb-user-level-actions">
                  <button className="pb-btn pb-btn-primary" onClick={() => playCustom(row)}><Play size={12} /> Jugar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- PLAY -------------------- */
  if (!currentLevel || !robot) return <div className="pb-root"><div className="pb-frame">Cargando…</div></div>;

  return (
    <div className="pb-root">
      <div className="pb-frame pb-frame-play">
        <div className="pb-play-header">
          <button className="pb-icon-btn" onClick={goMenu} title="Volver al menú"><ChevronLeft size={16} /></button>
          <div className="pb-play-title">
            <span className="pb-play-emoji">🤖</span>
            <span className="pb-play-text">Programa al Robot</span>
            <span className="pb-course-pill">{GRADE_LABELS[gradeId]}</span>
          </div>
          <div className="pb-spacer" />
          <div className="pb-progress">
            <button onClick={prev} disabled={currentIdx === 0}><ChevronLeft size={16} /></button>
            <span>Nivel {currentIdx + 1}/{levels.length}</span>
            <button onClick={next} disabled={currentIdx === levels.length - 1}><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="pb-mission">
          <div className="pb-mission-title">🎯 {currentLevel.title}</div>
          <div className="pb-mission-goal">{currentLevel.goal}</div>
        </div>

        <div className="pb-body">
          {/* Columna 1: tablero */}
          <div className="pb-stage-col">
            <div className="pb-stage-tools">
              <span className="pb-biome-label">📍 {BIOME_INFO[biome].label}</span>
              <button className="pb-icon-btn pb-small" onClick={() => setShowGrid((g) => !g)} title={showGrid ? 'Ocultar rejilla' : 'Mostrar rejilla'}>
                {showGrid ? <Grid3x3 size={14} /> : <EyeOff size={14} />} {showGrid ? 'Rejilla ON' : 'Rejilla OFF'}
              </button>
            </div>
            <Board world={currentLevel.world} robot={robot} itemsLeft={itemsLeft} crates={cratesLeft} laser={laser} moving={moving} showGrid={showGrid} biome={biome} />
            <Legend biome={biome} world={currentLevel.world} />
          </div>

          {/* Columna 2: mi programa + controles */}
          <div className="pb-workspace-col">
            <div className="pb-workspace-header">
              <button className="pb-btn pb-btn-primary" onClick={run} disabled={status === 'running'}><Play size={14} /> Ejecutar</button>
              <button className="pb-btn pb-btn-ghost" onClick={reset}><RotateCcw size={14} /> Reiniciar</button>
              <button className="pb-btn pb-btn-ghost" onClick={clearProgram}><Trash2 size={14} /> Vaciar</button>
              {status === 'ok' && currentIdx < levels.length - 1 && (
                <button className="pb-btn pb-btn-success" onClick={next}><Check size={14} /> Siguiente</button>
              )}
              <div className="pb-spacer" />
              <button className="pb-btn pb-btn-ghost" onClick={() => setPanelOpen(true)} title="Ver código">
                <Code2 size={14} /> Ver código
              </button>
            </div>

            {hasFuncBlocks && (
              <div className="pb-workspace pb-workspace-defs">
                <div className="pb-workspace-title">
                  📦 Definiciones
                  <span className="pb-workspace-hint"> (funciones y procedimientos)</span>
                </div>
                <Dropzone path={['defs']} items={definitions} onAdd={onAdd} onField={onField} onMove={onMove} onRemove={onRemove} disabled={status === 'running'} />
              </div>
            )}

            <div className="pb-workspace">
              <div className="pb-workspace-title">🧠 Mi programa</div>
              <Dropzone path={['body']} items={program} onAdd={onAdd} onField={onField} onMove={onMove} onRemove={onRemove} disabled={status === 'running'} />
            </div>

            {status === 'ok' && <div className="pb-feedback pb-feedback-ok"><Check size={14} /> ¡Nivel superado!</div>}
            {status === 'wrong' && <div className="pb-feedback pb-feedback-ko"><X size={14} /> Intenta otra vez</div>}
            {error && <div className="pb-error">⚠ {error}</div>}
          </div>

          {/* Columna 3: paleta */}
          <div className="pb-palette-col">
            <Palette gradeId={gradeId} onAddToEnd={addToEnd} disabled={status === 'running'} />
          </div>
        </div>

        {/* Modal de código (3 pestañas) */}
        {panelOpen && (
          <div className="pb-modal-backdrop" onClick={() => setPanelOpen(false)}>
            <div className="pb-code-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pb-code-head">
                <span>💻 Código equivalente</span>
                <div className="pb-code-head-actions">
                  <button className="pb-icon-btn pb-small" onClick={() => navigator.clipboard?.writeText(transpiled)} title="Copiar"><Copy size={12} /> Copiar</button>
                  <button className="pb-icon-btn pb-small" onClick={() => setPanelOpen(false)} title="Cerrar"><X size={14} /></button>
                </div>
              </div>
              <div className="pb-lang-tabs">
                {['python', 'java', 'c'].map((l) => (
                  <button key={l} className={`pb-lang-tab ${panelLang === l ? 'active' : ''}`} onClick={() => setPanelLang(l)}>
                    {l === 'python' ? '🐍 Python' : l === 'java' ? '☕ Java' : '⚙️ C'}
                  </button>
                ))}
              </div>
              <pre className="pb-code-pre"><code>{transpiled || '// arrastra bloques para ver el código'}</code></pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
