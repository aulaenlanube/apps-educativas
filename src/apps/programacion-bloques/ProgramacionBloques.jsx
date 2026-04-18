import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Play, RotateCcw, Trash2, ChevronLeft, ChevronRight, Check, X, Code2, Copy, Grid3x3, EyeOff, ArrowRight, Bot, HelpCircle } from 'lucide-react';
import { BLOCKS, blocksForGrade, getBlock, newNode, cloneNode, SENSORS, CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS, gradeIdFromParams, GRADE_LABELS } from './pbBlocks';
import { simulate, transpile } from './pbEngine';
import { getLevels, getRetos, checkLevel } from './pbLevels';
import Robot from './Robot';
import { FloorTile, WallTile, WaterTile, HoleTile, EnergyItem, TargetFlag, biomeForLevel, BIOME_INFO } from './PixelTiles';
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
  return (
    <div className="pb-legend">
      <div className="pb-legend-title">Leyenda</div>
      <div className="pb-legend-grid">
        <LegendEntry label="Suelo"><FloorTile x={0} y={0} biome={biome} /></LegendEntry>
        {has(world.walls) && <LegendEntry label="Obstáculo"><WallTile x={0} y={0} biome={biome} /></LegendEntry>}
        {has(world.water) && <LegendEntry label="Agua"><WaterTile x={0} y={0} biome={biome} /></LegendEntry>}
        {has(world.holes) && <LegendEntry label="Hoyo"><HoleTile biome={biome} /></LegendEntry>}
        {has(world.items) && <LegendEntry label="Energía"><EnergyItem /></LegendEntry>}
        {world.target && <LegendEntry label="Meta"><TargetFlag /></LegendEntry>}
      </div>
    </div>
  );
}

/* -------------------- BOARD -------------------- */
function Board({ world, robot, itemsLeft, moving, showGrid, biome }) {
  const cols = world.cols, rows = world.rows;
  const walls = useMemo(() => toSet(world.walls), [world.walls]);
  const water = useMemo(() => toSet(world.water), [world.water]);
  const holes = useMemo(() => toSet(world.holes), [world.holes]);
  const cellPx = 56; // tablero = 448x448

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
    }
  }

  const target = world.target ? (
    <div className="pb-cell" style={{
      left: world.target.x * cellPx + cellPx * 0.18, top: world.target.y * cellPx + cellPx * 0.1,
      width: cellPx * 0.64, height: cellPx * 0.8,
    }}><TargetFlag /></div>
  ) : null;

  const items = [...toSet(itemsLeft)].map((k) => {
    const [x, y] = k.split(',').map(Number);
    return <div key={k} className="pb-item" style={{
      left: x * cellPx + cellPx * 0.22, top: y * cellPx + cellPx * 0.1,
      width: cellPx * 0.56, height: cellPx * 0.8,
    }}><EnergyItem /></div>;
  });

  return (
    <div className={`pb-board pb-biome-${biome} ${showGrid ? 'pb-board-grid' : ''}`}
      style={{ width: cols * cellPx, height: rows * cellPx, background: BIOME_INFO[biome]?.bg, '--pb-cell': `${cellPx}px` }}>
      {floor}{overlays}{target}{items}
      {showGrid && <div className="pb-grid-overlay" />}
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
function BlockNode({ node, path, onField, onAdd, onRemove, disabled }) {
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
          <Dropzone path={[...path, s]} items={node.slots?.[s] || []} onField={onField} onAdd={onAdd} onRemove={onRemove} disabled={disabled} indent />
        </div>
      ))}
      <div className="pb-c-foot" />
    </div>
  );
}

/* -------------------- DROPZONE -------------------- */
function Dropzone({ path, items, onField, onAdd, onRemove, disabled, indent }) {
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
      const cloned = cloneNode(d.node);
      onRemove(d.path);
      onAdd(path, cloned, items.length);
    }
  };
  return (
    <div className={`pb-dropzone ${over ? 'is-over' : ''} ${indent ? 'is-indent' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {items.length === 0 && <div className="pb-dropzone-empty">{indent ? '⇣ bloques aquí' : '→ arrastra bloques aquí'}</div>}
      {items.map((it, idx) => (
        <BlockNode key={it.id} node={it} path={[...path, idx]} onField={onField} onAdd={onAdd} onRemove={onRemove} disabled={disabled} />
      ))}
    </div>
  );
}

/* -------------------- PALETTE (compacta, solo bloques del curso) -------------------- */
function Palette({ gradeId }) {
  const byCat = useMemo(() => {
    const m = {};
    for (const b of blocksForGrade(gradeId)) (m[b.category] = m[b.category] || []).push(b);
    return m;
  }, [gradeId]);
  const onDragStart = (e, kind) => {
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
                       draggable onDragStart={(e) => onDragStart(e, b.kind)} title={b.tpl}>
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

  // Fases: 'menu' (eligiendo modo/misión) o 'play' (en la partida)
  const [phase, setPhase] = useState('menu');
  const [mode, setMode] = useState('normal'); // 'easy' | 'normal' | 'examen' | 'reto'
  const [currentIdx, setCurrentIdx] = useState(0);

  const levels = useMemo(
    () => (mode === 'reto' ? getRetos(level, grade) : getLevels(level, grade)),
    [level, grade, mode]
  );
  const normalLevels = useMemo(() => getLevels(level, grade), [level, grade]);
  const retosList = useMemo(() => getRetos(level, grade), [level, grade]);

  const [program, setProgram] = useState([]);
  const [robot, setRobot] = useState(null);
  const [itemsLeft, setItemsLeft] = useState(new Set());
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelLang, setPanelLang] = useState('python');
  const [moving, setMoving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const reportedRef = useRef(new Set());
  const playTimerRef = useRef(null);
  const currentLevel = levels[currentIdx];
  const biome = useMemo(() => biomeForLevel(currentIdx), [currentIdx]);

  useEffect(() => {
    if (phase === 'play' && currentLevel) {
      setRobot({ ...currentLevel.world.robot });
      setItemsLeft(new Set(currentLevel.world.items || []));
      setProgram([]); setError(null); setStatus(null);
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
  }, [phase, currentIdx, currentLevel]);

  const cloneBlock = (n) => ({ ...n, fields: { ...(n.fields || {}) }, slots: Object.fromEntries(Object.entries(n.slots || {}).map(([k, v]) => [k, [...v]])) });

  const onAdd = useCallback((path, node, index) => {
    setProgram((prev) => {
      if (path[0] !== 'body') return prev;
      const build = (arr, d) => {
        if (d * 2 + 1 === path.length) {
          const next = [...arr]; next.splice(Math.max(0, Math.min(next.length, index)), 0, node); return next;
        }
        const idx = path[d * 2 + 1], next = [...arr], p = cloneBlock(next[idx]), ns = path[d * 2 + 2];
        p.slots[ns] = build(p.slots[ns] || [], d + 1); next[idx] = p; return next;
      };
      return build(prev, 0);
    });
    setStatus(null);
  }, []);

  const onField = useCallback((path, field, val) => {
    setProgram((prev) => {
      if (path[0] !== 'body') return prev;
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
  }, []);

  const onRemove = useCallback((path) => {
    setProgram((prev) => {
      if (path[0] !== 'body') return prev;
      const build = (arr, d) => {
        const idx = path[d * 2 + 1]; if (idx == null || idx < 0 || idx >= arr.length) return arr;
        if (d * 2 + 2 === path.length) return arr.filter((_, i) => i !== idx);
        const next = [...arr], p = cloneBlock(next[idx]), ns = path[d * 2 + 2];
        p.slots[ns] = build(p.slots[ns] || [], d + 1); next[idx] = p; return next;
      };
      return build(prev, 0);
    });
    setStatus(null);
  }, []);

  const reset = () => {
    if (playTimerRef.current) { clearInterval(playTimerRef.current); playTimerRef.current = null; }
    setRobot({ ...currentLevel.world.robot });
    setItemsLeft(new Set(currentLevel.world.items || []));
    setStatus(null); setError(null); setMoving(false);
  };
  const clearProgram = () => { setProgram([]); reset(); };

  const run = () => {
    if (!currentLevel) return;
    reset();
    const result = simulate(program, currentLevel.world);
    setStatus('running');
    let i = 0;
    playTimerRef.current = setInterval(() => {
      if (i >= result.trace.length) {
        clearInterval(playTimerRef.current); playTimerRef.current = null;
        setMoving(false);
        const ok = checkLevel(currentLevel, result);
        setStatus(ok ? 'ok' : 'wrong');
        if (result.error) setError(result.error);
        if (ok && !reportedRef.current.has(currentLevel.id)) {
          reportedRef.current.add(currentLevel.id);
          onGameComplete?.({
            mode: mode === 'examen' ? 'test' : 'practice',
            score: reportedRef.current.size * 50,
            maxScore: levels.length * 50,
            correctAnswers: reportedRef.current.size,
            totalQuestions: levels.length,
          });
        }
        return;
      }
      const step = result.trace[i++];
      setRobot(step.robot); setItemsLeft(new Set(step.items));
      setMoving(step.kind === 'move');
    }, 240);
  };

  const next = () => { if (currentIdx < levels.length - 1) setCurrentIdx(currentIdx + 1); };
  const prev = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); };
  const goMenu = () => { setPhase('menu'); if (playTimerRef.current) clearInterval(playTimerRef.current); };

  const transpiled = useMemo(() => transpile(program, panelLang), [program, panelLang]);

  const startMission = (idx, selectedMode = 'normal') => {
    setMode(selectedMode);
    setCurrentIdx(idx);
    setShowGrid(selectedMode === 'easy');
    reportedRef.current = new Set();
    setPhase('play');
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
            <Board world={currentLevel.world} robot={robot} itemsLeft={itemsLeft} moving={moving} showGrid={showGrid} biome={biome} />
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

            <div className="pb-workspace">
              <div className="pb-workspace-title">🧠 Mi programa</div>
              <Dropzone path={['body']} items={program} onAdd={onAdd} onField={onField} onRemove={onRemove} disabled={status === 'running'} />
            </div>

            {status === 'ok' && <div className="pb-feedback pb-feedback-ok"><Check size={14} /> ¡Nivel superado!</div>}
            {status === 'wrong' && <div className="pb-feedback pb-feedback-ko"><X size={14} /> Intenta otra vez</div>}
            {error && <div className="pb-error">⚠ {error}</div>}
          </div>

          {/* Columna 3: paleta */}
          <div className="pb-palette-col">
            <Palette gradeId={gradeId} />
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
