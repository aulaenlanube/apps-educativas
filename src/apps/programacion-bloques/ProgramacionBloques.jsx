import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RotateCcw, Trash2, ChevronLeft, ChevronRight, Check, X, Code2, Copy, Grid3x3, EyeOff,
  Pencil, Users, User, AlertTriangle, LayoutGrid, Flag, Flame, Gauge, GraduationCap, Map as MapIcon,
  MapPin, Award, Target, Plus, Box, Puzzle, Gamepad2, ArrowRight,
} from 'lucide-react';
import { blocksForGrade, getBlock, newNode, cloneNode, SENSORS, CATEGORY_LABELS, CATEGORY_ORDER, gradeIdFromParams, GRADE_LABELS } from './pbBlocks';
import { simulate, transpile } from './pbEngine';
import { getLevels, getRetos, checkLevel } from './pbLevels';
import Robot from './Robot';
import { FloorTile, WallTile, WaterTile, HoleTile, EnergyItem, EnergyStack, CrateTile, LaserBlast, TargetFlag, biomeForLevel, BIOME_INFO } from './PixelTiles';
import { BiomeScene, MiniMap, blockIcon } from './PbArt';
import PbDialog from './PbDialog';
import LevelEditor from './LevelEditor';
import { createRobotLevel, updateRobotLevel, deleteRobotLevel, listMyRobotLevels, listSharedRobotLevels, incrementRobotLevelPlays } from './pbLevelsService';
import { useAuth } from '../../contexts/AuthContext';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, Panel, Chip, GameButton, ModeSelect, RoundBanner,
  ResultsScreen, FeedbackItem, GameLoading, GameEmpty, Segmented,
} from '../_shared/kit';
import './ProgramacionBloques.css';

// Rediseño 2026 sobre el kit (_shared/kit). Solo presentación: el motor
// (pbEngine), los niveles (pbLevels), la comprobación, la puntuación y el
// onGameComplete son exactamente los de antes.

const dragRef = { current: null };
const SHELL = { accent: '#f59e0b', accent2: '#ec4899' };

const stop = (e) => e.stopPropagation();
const toSet = (v) => (v instanceof Set ? v : new Set(v || []));

// Posición de una pieza en el tablero: el tamaño de casilla (--c) lo decide el
// CSS según el ancho disponible (container queries), así el tablero se adapta.
const at = (x, y) => ({ '--x': x, '--y': y });

/* -------------------- LEGEND -------------------- */
function LegendEntry({ children, label }) {
  return (
    <span className="pbx-legend__item">
      <span className="pbx-legend__ico">{children}</span>
      {label}
    </span>
  );
}
function Legend({ biome, world }) {
  const has = (arr) => (arr || []).length > 0;
  const hasStacks = (world.items || []).some((s) => String(s).includes(':'));
  return (
    <div className="pbx-legend" aria-label="Leyenda">
      <LegendEntry label="Suelo"><FloorTile x={0} y={0} biome={biome} /></LegendEntry>
      {has(world.walls) && <LegendEntry label="Obstáculo"><WallTile x={0} y={0} biome={biome} /></LegendEntry>}
      {has(world.water) && <LegendEntry label="Agua"><WaterTile x={0} y={0} biome={biome} /></LegendEntry>}
      {has(world.holes) && <LegendEntry label="Hoyo"><HoleTile biome={biome} /></LegendEntry>}
      {has(world.crates) && <LegendEntry label="Caja (láser)"><CrateTile biome={biome} /></LegendEntry>}
      {has(world.items) && <LegendEntry label={hasStacks ? 'Energía (×N)' : 'Energía'}>{hasStacks ? <EnergyStack count={3} /> : <EnergyItem />}</LegendEntry>}
      {world.target && <LegendEntry label="Meta"><TargetFlag /></LegendEntry>}
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

// Tamaño MÁXIMO de casilla por tamaño de tablero (el CSS lo reduce si no cabe).
function computeCellPx(cols, rows) {
  const max = Math.max(cols || 8, rows || 8);
  if (max <= 8) return 52;
  if (max <= 10) return 44;
  if (max <= 12) return 36;
  return Math.max(28, Math.floor(432 / max));
}

function Board({ world, robot, itemsLeft, crates, laser, moving, showGrid, biome, status }) {
  const cols = world.cols, rows = world.rows;
  const walls = useMemo(() => toSet(world.walls), [world.walls]);
  const water = useMemo(() => toSet(world.water), [world.water]);
  const holes = useMemo(() => toSet(world.holes), [world.holes]);
  const crateSet = useMemo(() => toSet(crates), [crates]);
  const itemsMap = useMemo(() => stacksToMap(itemsLeft), [itemsLeft]);
  const cellPx = computeCellPx(cols, rows);

  const floor = [];
  const overlays = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = `${x},${y}`;
      floor.push(<div key={`f${k}`} className="pbx-cell" style={at(x, y)}><FloorTile x={x} y={y} biome={biome} /></div>);
      if (walls.has(k)) overlays.push(<div key={`w${k}`} className="pbx-cell" style={at(x, y)}><WallTile x={x} y={y} biome={biome} /></div>);
      else if (water.has(k)) overlays.push(<div key={`wa${k}`} className="pbx-cell" style={at(x, y)}><WaterTile x={x} y={y} biome={biome} /></div>);
      else if (holes.has(k)) overlays.push(<div key={`h${k}`} className="pbx-cell" style={at(x, y)}><HoleTile biome={biome} /></div>);
      else if (crateSet.has(k)) overlays.push(<div key={`cr${k}`} className="pbx-cell pbx-crate" style={at(x, y)}><CrateTile biome={biome} /></div>);
    }
  }

  const items = [...itemsMap.entries()].map(([k, count]) => {
    const [x, y] = k.split(',').map(Number);
    return (
      <div key={k} className="pbx-item" style={at(x, y)}>
        {count > 1 ? <EnergyStack count={count} /> : <EnergyItem />}
      </div>
    );
  });

  return (
    <div
      className={`pbx-board pbx-biome-${biome} ${showGrid ? 'has-grid' : ''} ${status ? `is-${status}` : ''}`}
      style={{ '--cols': cols, '--rows': rows, '--cmax': `${cellPx}px`, background: BIOME_INFO[biome]?.bg }}
    >
      <div className="pbx-board__ground">
        {floor}{overlays}
        {world.target && <div className="pbx-target" style={at(world.target.x, world.target.y)}><TargetFlag /></div>}
        {items}
        {showGrid && <div className="pbx-grid-overlay" />}
      </div>
      {laser && (
        <div key={`laser-${laser.id}`} className="pbx-blast" style={at(laser.target.x, laser.target.y)}>
          <LaserBlast />
        </div>
      )}
      <div className="pbx-robot" style={at(robot.x, robot.y)}>
        <Robot dir={robot.dir} moving={moving} />
      </div>
    </div>
  );
}

/* -------------------- FIELD EDITOR -------------------- */
function FieldEditor({ field, value, onChange, disabled }) {
  if (field.type === 'op') return (
    <select value={value || field.options[0]} onChange={(e) => onChange(e.target.value)} onClick={stop} disabled={disabled} className="pbx-field pbx-field--select">
      {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (field.type === 'sensor') return (
    <select value={value || SENSORS[0].value} onChange={(e) => onChange(e.target.value)} onClick={stop} disabled={disabled} className="pbx-field pbx-field--select pbx-field--sensor" style={{ width: field.width }}>
      {SENSORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
    </select>
  );
  if (field.type === 'number') return (
    <input type="number" min={field.min ?? 0} max={field.max ?? 99} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      onKeyDown={stop} onClick={stop} disabled={disabled} className="pbx-field pbx-field--num" style={{ width: field.width }} />
  );
  return (
    <input type="text" value={value ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)}
      onKeyDown={stop} onClick={stop} disabled={disabled} className="pbx-field" style={{ width: field.width }} />
  );
}

/* -------------------- BLOCK NODE -------------------- */
function BlockIcon({ kind }) {
  const Icon = blockIcon(kind);
  return <span className="pbx-block__ico" aria-hidden="true"><Icon size={14} strokeWidth={2.6} /></span>;
}

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
    return seg.trim() ? <span key={i} className="pbx-block__txt">{seg.trim()}</span> : null;
  });
  const trash = !disabled && (
    <button type="button" className="pbx-block__trash" onClick={(e) => { e.stopPropagation(); onRemove(path); }} title="Quitar bloque" aria-label="Quitar bloque">
      <X size={12} strokeWidth={3} />
    </button>
  );

  if (!isContainer) {
    return (
      <div className={`pbx-block is-stack cat-${def.category}`} draggable={!disabled} onDragStart={onDragStart}>
        <div className="pbx-block__row">
          <BlockIcon kind={node.kind} />
          {renderSegs()}
          {trash}
        </div>
      </div>
    );
  }
  return (
    <div className={`pbx-block is-container cat-${def.category}`} draggable={!disabled} onDragStart={onDragStart}>
      <div className="pbx-block__row pbx-block__head">
        <BlockIcon kind={node.kind} />
        {renderSegs()}
        {trash}
      </div>
      {(def.slots || []).map((s) => (
        <div key={s} className="pbx-block__section">
          {s === 'elseBody' && <div className="pbx-block__label">si no</div>}
          <div className="pbx-block__mouth">
            <Dropzone path={[...path, s]} items={node.slots?.[s] || []} onField={onField} onAdd={onAdd} onMove={onMove} onRemove={onRemove} disabled={disabled} indent />
          </div>
        </div>
      ))}
      <div className="pbx-block__foot" />
    </div>
  );
}

/* -------------------- DROPZONE -------------------- */
function Dropzone({ path, items, onField, onAdd, onMove, onRemove, disabled, indent, emptyLabel }) {
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
    <div className={`pbx-drop ${over ? 'is-over' : ''} ${indent ? 'is-indent' : ''} ${items.length === 0 ? 'is-empty' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {items.length === 0 && (
        <div className="pbx-drop__empty">
          {indent ? 'suelta bloques aquí' : <><Puzzle size={16} /> {emptyLabel || 'Arrastra bloques aquí (o haz clic en la paleta)'}</>}
        </div>
      )}
      {items.map((it, idx) => (
        <BlockNode key={it.id} node={it} path={[...path, idx]} onField={onField} onAdd={onAdd} onMove={onMove} onRemove={onRemove} disabled={disabled} />
      ))}
    </div>
  );
}

/* -------------------- PALETTE (solo bloques del curso) -------------------- */
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
    <Panel variant="surface" className="pbx-palette">
      <div className="pbx-section-title"><Puzzle size={16} /> Bloques <small>arrastra o pulsa</small></div>
      {CATEGORY_ORDER.map((cat) => {
        if (!byCat[cat]?.length) return null;
        return (
          <div key={cat} className={`pbx-palette__cat cat-${cat}`}>
            <div className="pbx-palette__cat-title"><span className="pbx-palette__dot" />{CATEGORY_LABELS[cat]}</div>
            <div className="pbx-palette__items">
              {byCat[cat].map((b) => {
                const isContainer = (b.slots || []).length > 0;
                return (
                  <div
                    key={b.kind}
                    className={`pbx-block is-palette ${isContainer ? 'is-c' : ''} cat-${b.category}`}
                    draggable={!disabled}
                    onDragStart={(e) => onDragStart(e, b.kind)}
                    onClick={() => !disabled && onAddToEnd?.(b.kind)}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onAddToEnd?.(b.kind); } }}
                    title={`${b.tpl}\n(arrastra o haz clic)`}
                  >
                    <div className="pbx-block__row">
                      <BlockIcon kind={b.kind} />
                      <span className="pbx-block__txt">{b.label}</span>
                      <Plus size={13} className="pbx-palette__plus" aria-hidden="true" />
                    </div>
                    {isContainer && <div className="pbx-block__foot" />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

/* -------------------- MAPA DE MISIONES -------------------- */
const BIOME_ORDER = ['meadow', 'forest', 'mountain', 'city', 'datacenter'];

function MissionMap({ levels, onStart }) {
  const stations = BIOME_ORDER.map((b) => ({
    biome: b,
    missions: levels.map((m, i) => ({ m, i })).filter(({ i }) => biomeForLevel(i) === b),
  })).filter((s) => s.missions.length > 0);
  return (
    <section className="pbx-map" aria-label="Mapa de misiones">
      <header className="pbx-block-title">
        <span className="pbx-block-title__ico"><MapIcon size={18} /></span>
        <div>
          <h3>Mapa de misiones</h3>
          <p>Cinco tierras, dos misiones en cada una. Elige por dónde empezar.</p>
        </div>
      </header>
      <div className="pbx-map__track">
        {stations.map((s, si) => (
          <div key={s.biome} className={`pbx-station pbx-biome-${s.biome}`} style={{ '--i': si }}>
            <div className="pbx-station__scene">
              <BiomeScene biome={s.biome} />
              <span className="pbx-station__label"><MapPin size={12} /> {BIOME_INFO[s.biome].label}</span>
            </div>
            <div className="pbx-station__missions">
              {s.missions.map(({ m, i }) => (
                <button key={m.id} type="button" className="pbx-mission" onClick={() => onStart(i)}>
                  <span className="pbx-mission__thumb"><MiniMap world={m.world} biome={s.biome} /></span>
                  <span className="pbx-mission__text">
                    <span className="pbx-mission__num">Misión {i + 1}</span>
                    <span className="pbx-mission__title">{m.title}</span>
                  </span>
                  <ArrowRight size={15} className="pbx-mission__go" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
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
  // Diálogos propios (el proyecto prohíbe window.confirm/alert)
  const [pendingDelete, setPendingDelete] = useState(null); // id del nivel a borrar
  const [notice, setNotice] = useState(null); // mensaje de aviso
  // Solo visual: instrucciones, resumen del examen y puntos mostrados en él.
  const [showHelp, setShowHelp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examPoints, setExamPoints] = useState(0);
  const [copied, setCopied] = useState(false);

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
    // Los helpers puros de abajo son estables en la práctica: no se añaden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // Solo visual: los puntos que se muestran en el resumen del examen.
          if (isExam) setExamPoints(reportedRef.current.size * 50 + timeBonus);
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
  const goMenu = () => { setPhase('menu'); setShowResults(false); if (playTimerRef.current) clearInterval(playTimerRef.current); };

  const transpiled = useMemo(() => transpile([...definitions, ...program], panelLang), [definitions, program, panelLang]);

  const startMission = (idx, selectedMode = 'normal') => {
    setMode(selectedMode);
    setCurrentIdx(idx);
    setShowGrid(selectedMode === 'easy');
    reportedRef.current = new Set();
    setCustomLevel(null);
    setShowResults(false);
    setExamPoints(0);
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
    setShowResults(false);
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
    if (!creator) { setNotice('Debes iniciar sesión para guardar niveles.'); return false; }
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
      console.error(e); setNotice('No se pudo guardar: ' + (e.message || e));
      return false;
    }
  }, [creator, editTarget, level, grade, refreshMine]);

  // Borrar nivel: primero se pide confirmación en un modal propio.
  const removeLevel = (id) => {
    if (!creator) return;
    setPendingDelete(id);
  };
  const confirmRemoveLevel = async () => {
    const id = pendingDelete;
    setPendingDelete(null);
    if (!creator || id == null) return;
    try {
      await deleteRobotLevel({ id, creatorType: creator.type, creatorId: creator.id });
      refreshMine();
    } catch (e) { setNotice('No se pudo borrar: ' + (e.message || e)); }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(transpiled);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  // Modales propios de confirmación / aviso (se montan en todas las fases).
  const dialogs = (
    <>
      <PbDialog
        open={pendingDelete != null}
        tone="danger"
        icon={Trash2}
        title="¿Borrar este nivel?"
        text="Esta acción no se puede deshacer."
        onClose={() => setPendingDelete(null)}
        actions={[
          { label: 'Cancelar', variant: 'soft', onClick: () => setPendingDelete(null) },
          { label: 'Borrar', variant: 'danger', icon: Trash2, onClick: confirmRemoveLevel, autoFocus: true },
        ]}
      />
      <PbDialog
        open={!!notice}
        tone="info"
        icon={AlertTriangle}
        title="Aviso"
        text={notice}
        onClose={() => setNotice(null)}
        actions={[{ label: 'Entendido', variant: 'primary', onClick: () => setNotice(null), autoFocus: true }]}
      />
    </>
  );

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo programar al robot">
      <h3>🎯 Objetivo</h3>
      <p>
        Construye un <strong>programa con bloques</strong> para que el robot llegue a la <strong>meta</strong>,
        recoja la <strong>energía</strong> y, si hace falta, destruya las <strong>cajas</strong> con el láser.
      </p>
      <h3>🧩 Cómo se juega</h3>
      <ul>
        <li><strong>Arrastra</strong> bloques de la paleta a «Mi programa», o haz <strong>clic</strong> en uno para añadirlo al final.</li>
        <li>Los bloques de <strong>bucle</strong> y <strong>condición</strong> tienen un hueco: suelta otros bloques dentro.</li>
        <li>Pulsa <strong>Ejecutar</strong> para ver al robot seguir tu programa paso a paso.</li>
        <li><strong>Ver código</strong> te enseña tu programa traducido a Python, Java y C.</li>
        <li>No entres en el agua ni en los hoyos, y no choques con los obstáculos.</li>
      </ul>
      <h3>🎓 Modos de juego</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Fácil</strong>Rejilla siempre visible para contar casillas.</div>
        <div className="instr-mode medium"><strong>Normal</strong>Las 10 misiones del curso con todos sus bloques.</div>
        <div className="instr-mode exam"><strong>Examen</strong>Sin ayudas. Cada misión superada suma nota y puntos por rapidez.</div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consejo:</strong> si repites lo mismo varias veces, usa <kbd>repetir</kbd>: tu programa será más corto y elegante.
      </div>
    </InstructionsModal>
  );

  /* -------------------- MENU -------------------- */
  if (phase === 'menu') {
    const modes = [
      { id: 'easy', tone: 'easy', title: 'Fácil', desc: 'Rejilla siempre visible y pistas claras. Perfecto para empezar.', features: ['Rejilla para contar casillas', '10 misiones guiadas'] },
      { id: 'normal', tone: 'medium', icon: Gauge, title: 'Normal', desc: 'El desafío estándar con todos los bloques de tu curso.', features: ['10 misiones progresivas', 'Rejilla opcional'] },
      { id: 'examen', tone: 'exam', title: 'Examen', desc: 'Completa las misiones sin ayudas. Tu nota, sobre 10.', features: ['Nota sobre 10', 'Puntos por rapidez'] },
      { id: 'reto', tone: 'reto', icon: Flame, title: 'Reto', desc: `${retosList.length} retos muy difíciles creados para tu curso.`, features: ['Solo para expertos', 'Tableros enormes'] },
    ];
    return (
      <GameShell {...SHELL} wide className="pbx">
        <ModeSelect
          description="Arrastra bloques visuales para que tu robot cruce 10 misiones por tierras cada vez más complejas: pradera, bosque, montaña, ciudad y centro de datos."
          modes={modes}
          onSelect={(id) => startMission(0, id)}
          onHelp={() => setShowHelp(true)}
          extra={(
            <div className="pbx-menu-extra">
              <MissionMap levels={normalLevels} onStart={(i) => startMission(i, 'normal')} />

              <section className="pbx-create" aria-label="Crea tu propio nivel">
                <header className="pbx-block-title">
                  <span className="pbx-block-title__ico is-pink"><Pencil size={18} /></span>
                  <div>
                    <h3>Crea tu propio nivel</h3>
                    <p>Diseña un mapa con tus obstáculos, compártelo con la clase y juega los de tus compañeros.</p>
                  </div>
                </header>
                <div className="pbx-create__grid">
                  <button type="button" className="pbx-create__card is-create" onClick={openCreate} disabled={!creator} title={!creator ? 'Inicia sesión para crear niveles' : ''}>
                    <span className="pbx-create__ico"><Pencil size={22} /></span>
                    <span className="pbx-create__title">Crear nivel</span>
                    <span className="pbx-create__sub">Dibuja el tablero, pon obstáculos y meta</span>
                  </button>
                  <button type="button" className="pbx-create__card is-mine" onClick={openMine} disabled={!creator}>
                    <span className="pbx-create__ico"><User size={22} /></span>
                    <span className="pbx-create__title">Mis niveles</span>
                    <span className="pbx-create__sub">Juega y edita los que has creado</span>
                  </button>
                  <button type="button" className="pbx-create__card is-shared" onClick={openShared} disabled={!creator}>
                    <span className="pbx-create__ico"><Users size={22} /></span>
                    <span className="pbx-create__title">De mis compañeros</span>
                    <span className="pbx-create__sub">Niveles compartidos por tu clase</span>
                  </button>
                </div>
                {!creator && (
                  <div className="pbx-warn"><AlertTriangle size={16} /> Necesitas iniciar sesión para crear y compartir niveles.</div>
                )}
              </section>
            </div>
          )}
        />
        {instructions}
      </GameShell>
    );
  }

  /* -------------------- EDITOR -------------------- */
  if (phase === 'edit') {
    return (
      <>
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
        {dialogs}
      </>
    );
  }

  /* -------------------- MIS NIVELES / COMPARTIDOS -------------------- */
  if (phase === 'mine' || phase === 'shared') {
    const isMine = phase === 'mine';
    const rows = isMine ? myLevels : sharedLevels;
    return (
      <GameShell {...SHELL} wide className="pbx">
        <GameHeader
          subtitle={isMine ? 'Mis niveles' : 'Niveles de mis compañeros'}
          right={(
            <>
              <GameButton variant="soft" size="sm" icon={ChevronLeft} onClick={goMenu}>Menú</GameButton>
              {isMine && <GameButton size="sm" icon={Pencil} onClick={openCreate}>Crear nuevo</GameButton>}
            </>
          )}
        />
        {loadingLists && <GameLoading label="Cargando niveles…" />}
        {!loadingLists && rows.length === 0 && (
          <GameEmpty title={isMine ? 'Aún no has creado ningún nivel' : 'Aún no hay niveles compartidos'}>
            {isMine ? 'Pulsa «Crear nuevo» para diseñar tu primer tablero.' : 'Aún no hay niveles compartidos en tu clase. ¡Sé el primero en compartir uno!'}
          </GameEmpty>
        )}
        {!loadingLists && rows.length > 0 && (
          <div className="pbx-userlevels">
            {rows.map((row, i) => (
              <motion.article
                key={row.id}
                className="pbx-userlevel"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.04 }}
              >
                <span className="pbx-userlevel__thumb"><MiniMap world={row.world} biome="meadow" /></span>
                <div className="pbx-userlevel__info">
                  <h4>{row.title}</h4>
                  {row.description && <p>{row.description}</p>}
                  <div className="pbx-userlevel__meta">
                    {isMine
                      ? (row.shared ? <Chip tone="accent" icon={Users}>Compartido</Chip> : <Chip icon={User}>Privado</Chip>)
                      : <Chip icon={User}>{row.creator_name}</Chip>}
                    <Chip icon={Gamepad2}>{row.plays} partidas</Chip>
                  </div>
                </div>
                <div className="pbx-userlevel__actions">
                  <GameButton size="sm" icon={Play} onClick={() => playCustom(row)}>Jugar</GameButton>
                  {isMine && <GameButton size="sm" variant="soft" icon={Pencil} onClick={() => openEdit(row)}>Editar</GameButton>}
                  {isMine && (
                    <button type="button" className="gk-iconbtn pbx-userlevel__del" onClick={() => removeLevel(row.id)} title="Borrar nivel" aria-label="Borrar nivel">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
        {dialogs}
      </GameShell>
    );
  }

  /* -------------------- PLAY -------------------- */
  if (!currentLevel || !robot) {
    return (
      <GameShell {...SHELL} wide className="pbx">
        <GameLoading label="Preparando el tablero…" />
      </GameShell>
    );
  }

  const isExamMode = mode === 'examen';
  const passed = reportedRef.current.size;
  const headerMode = mode === 'easy' ? 'easy' : isExamMode ? 'exam' : mode === 'custom' ? 'practice' : 'medium';
  const headerLabel = { easy: 'Fácil', normal: 'Normal', examen: 'Examen', reto: 'Reto', custom: 'Nivel personalizado' }[mode];
  const isLast = currentIdx >= levels.length - 1;
  const allPassed = passed >= levels.length;

  /* ---- Resumen del examen ---- */
  if (isExamMode && showResults) {
    const nota = Math.round((passed / Math.max(1, levels.length)) * 100) / 10;
    return (
      <GameShell {...SHELL} wide className="pbx">
        <ResultsScreen
          subtitle={`Programa al Robot · ${GRADE_LABELS[gradeId] || ''}`}
          nota={nota}
          points={examPoints}
          stats={[
            { icon: Target, tone: 'good', label: 'Superadas', value: `${passed}/${levels.length}` },
            { icon: X, tone: 'bad', label: 'Pendientes', value: levels.length - passed },
          ]}
          actions={[
            { label: 'Repetir examen', onClick: () => startMission(0, 'examen'), icon: RotateCcw },
            ...(!allPassed ? [{ label: 'Seguir con el examen', onClick: () => setShowResults(false), icon: ArrowRight, variant: 'soft' }] : []),
            { label: 'Cambiar de modo', onClick: goMenu, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {levels.map((l, i) => (
            <FeedbackItem key={l.id} index={i + 1} ok={reportedRef.current.has(l.id)} title={l.title}>
              {BIOME_INFO[biomeForLevel(i)]?.label} · {l.goal}
            </FeedbackItem>
          ))}
        </ResultsScreen>
      </GameShell>
    );
  }

  const bannerStatus = status === 'ok' ? 'won' : 'lost';
  let bannerAction;
  let bannerLabel;
  let bannerIcon = ArrowRight;
  if (status === 'ok') {
    if (isExamMode && allPassed) { bannerAction = () => setShowResults(true); bannerLabel = 'Ver resultado'; bannerIcon = Award; }
    else if (!isLast) { bannerAction = next; bannerLabel = 'Siguiente nivel'; }
    else if (isExamMode) { bannerAction = () => setShowResults(true); bannerLabel = 'Ver resultado'; bannerIcon = Award; }
    else { bannerAction = goMenu; bannerLabel = 'Volver al menú'; bannerIcon = LayoutGrid; }
  } else if (status === 'wrong') {
    bannerAction = reset; bannerLabel = 'Reintentar'; bannerIcon = RotateCcw;
  }

  return (
    <GameShell {...SHELL} wide className="pbx">
      <GameHeader
        mode={headerMode}
        modeLabel={headerLabel}
        onHelp={() => setShowHelp(true)}
        right={(
          <Hud>
            <HudStat icon={Flag} tone="progress" value={`${currentIdx + 1}/${levels.length}`} label="Nivel" />
            {isExamMode && <HudStat icon={Check} tone="good" value={`${passed}/${levels.length}`} label="Superados" />}
          </Hud>
        )}
      />

      {/* Ruta de niveles */}
      <div className="pbx-route">
        <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={goMenu}>Menú</GameButton>
        {levels.length > 1 && (
          <div className="pbx-route__path" role="group" aria-label="Niveles">
            <button type="button" className="pbx-route__arrow" onClick={prev} disabled={currentIdx === 0} aria-label="Nivel anterior"><ChevronLeft size={18} /></button>
            <div className="pbx-route__nodes">
              {levels.map((l, i) => {
                const done = reportedRef.current.has(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    className={`pbx-route__node pbx-biome-${biomeForLevel(i)} ${i === currentIdx ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
                    onClick={() => setCurrentIdx(i)}
                    title={`${i + 1}. ${l.title}`}
                    aria-label={`Nivel ${i + 1}: ${l.title}${done ? ' (superado)' : ''}`}
                    aria-current={i === currentIdx ? 'step' : undefined}
                  >
                    {done ? <Check size={13} strokeWidth={3.2} /> : i + 1}
                  </button>
                );
              })}
            </div>
            <button type="button" className="pbx-route__arrow" onClick={next} disabled={isLast} aria-label="Nivel siguiente"><ChevronRight size={18} /></button>
          </div>
        )}
        {isExamMode && (
          <GameButton variant="warning" size="sm" icon={GraduationCap} onClick={() => setShowResults(true)} className="pbx-route__finish">
            Terminar examen
          </GameButton>
        )}
      </div>

      {/* Briefing de la misión */}
      <AnimatePresence mode="wait">
        <motion.section
          key={currentLevel.id}
          className={`pbx-brief pbx-biome-${biome}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          <span className="pbx-brief__scene" aria-hidden="true"><BiomeScene biome={biome} /></span>
          <span className="pbx-brief__avatar" aria-hidden="true"><Robot dir="S" moving={false} /></span>
          <div className="pbx-brief__bubble">
            <span className="pbx-brief__eyebrow">
              {mode === 'custom' ? 'Nivel personalizado' : `${mode === 'reto' ? 'Reto' : 'Misión'} ${currentIdx + 1}`} · {BIOME_INFO[biome].label}
            </span>
            <h2 className="pbx-brief__title">{currentLevel.title}</h2>
            <p className="pbx-brief__goal">{currentLevel.goal}</p>
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="pbx-play">
        <div className="pbx-play__grid">
          {/* Tablero */}
          <section className="pbx-stage" aria-label="Tablero">
            <div className="pbx-arena">
              <div className="pbx-arena__bar">
                <span className="pbx-arena__biome"><MapPin size={13} /> {BIOME_INFO[biome].label}</span>
                <button type="button" className={`pbx-toggle ${showGrid ? 'is-on' : ''}`} onClick={() => setShowGrid((g) => !g)} aria-pressed={showGrid} title={showGrid ? 'Ocultar rejilla' : 'Mostrar rejilla'}>
                  {showGrid ? <Grid3x3 size={14} /> : <EyeOff size={14} />} Rejilla
                  <span className="pbx-toggle__track"><span className="pbx-toggle__knob" /></span>
                </button>
              </div>
              <div className="pbx-arena__board">
                <Board world={currentLevel.world} robot={robot} itemsLeft={itemsLeft} crates={cratesLeft} laser={laser} moving={moving} showGrid={showGrid} biome={biome} status={status} />
              </div>
              <Legend biome={biome} world={currentLevel.world} />
            </div>
          </section>

          {/* Mi programa + controles */}
          <section className="pbx-editor" aria-label="Mi programa">
            <div className="pbx-toolbar">
              <GameButton icon={Play} onClick={run} disabled={status === 'running'} className="pbx-run">
                {status === 'running' ? 'Ejecutando…' : 'Ejecutar'}
              </GameButton>
              <GameButton variant="soft" size="sm" icon={RotateCcw} onClick={reset}>Reiniciar</GameButton>
              <GameButton variant="soft" size="sm" icon={Trash2} onClick={clearProgram}>Vaciar</GameButton>
              <span className="pbx-toolbar__spacer" />
              <GameButton variant="ghost" size="sm" icon={Code2} onClick={() => setPanelOpen(true)}>Ver código</GameButton>
            </div>

            {hasFuncBlocks && (
              <div className="pbx-canvas pbx-canvas--defs">
                <div className="pbx-canvas__head"><Box size={15} /> Definiciones <small>funciones y procedimientos</small></div>
                <Dropzone path={['defs']} items={definitions} onAdd={onAdd} onField={onField} onMove={onMove} onRemove={onRemove} disabled={status === 'running'} emptyLabel="Suelta aquí «definir procedimiento» y llénalo de bloques" />
              </div>
            )}

            <div className={`pbx-canvas ${status === 'running' ? 'is-running' : ''}`}>
              <div className="pbx-hat" aria-hidden="true">
                <Play size={14} fill="currentColor" /> al pulsar <strong>Ejecutar</strong>
              </div>
              <Dropzone path={['body']} items={program} onAdd={onAdd} onField={onField} onMove={onMove} onRemove={onRemove} disabled={status === 'running'} />
            </div>

            <RoundBanner
              show={status === 'ok' || status === 'wrong'}
              status={bannerStatus}
              title={status === 'ok' ? '¡Nivel superado!' : 'Intenta otra vez'}
              subtitle={status === 'ok'
                ? (isExamMode ? `Llevas ${passed} de ${levels.length} misiones superadas.` : 'Tu robot ha cumplido la misión.')
                : (error || 'El robot no ha cumplido el objetivo. Revisa tu programa.')}
              action={bannerAction}
              actionLabel={bannerLabel}
              actionIcon={bannerIcon}
            />
            {error && status !== 'wrong' && <div className="pbx-error"><AlertTriangle size={15} /> {error}</div>}
          </section>

          {/* Paleta */}
          <div className="pbx-palette-col">
            <Palette gradeId={gradeId} onAddToEnd={addToEnd} disabled={status === 'running'} />
          </div>
        </div>
      </div>

      {/* Modal de código (3 pestañas) */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div className="pbx-overlay" onClick={() => setPanelOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="pbx-code"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Código equivalente"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <div className="pbx-code__head">
                <span className="pbx-code__dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="pbx-code__title"><Code2 size={16} /> Código equivalente</span>
                <button type="button" className="pbx-code__close" onClick={() => setPanelOpen(false)} aria-label="Cerrar"><X size={16} /></button>
              </div>
              <div className="pbx-code__tools">
                <Segmented
                  size="sm"
                  value={panelLang}
                  onChange={setPanelLang}
                  options={[{ value: 'python', label: 'Python' }, { value: 'java', label: 'Java' }, { value: 'c', label: 'C' }]}
                />
                <GameButton variant="soft" size="sm" icon={copied ? Check : Copy} onClick={copyCode}>{copied ? 'Copiado' : 'Copiar'}</GameButton>
              </div>
              <pre className="pbx-code__pre">
                <code>
                  {(transpiled || '// arrastra bloques para ver el código').split('\n').map((line, i) => (
                    <span key={i} className="pbx-code__line"><span className="pbx-code__ln">{i + 1}</span>{line || ' '}</span>
                  ))}
                </code>
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {instructions}
      <span className="pbx-sr" aria-live="polite">{status === 'ok' ? 'Nivel superado' : status === 'wrong' ? 'Intenta otra vez' : ''}</span>
    </GameShell>
  );
}
