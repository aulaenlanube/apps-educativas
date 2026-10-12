import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft, Save, Play, Trash2, Users, User, Check, AlertTriangle, Eraser, ArrowUp, ArrowRight,
  ArrowDown, ArrowLeft, Lightbulb, Pencil,
} from 'lucide-react';
import { FloorTile, WallTile, WaterTile, HoleTile, EnergyItem, EnergyStack, CrateTile, TargetFlag, biomeForLevel, BIOME_INFO } from './PixelTiles';
import Robot from './Robot';
import PbDialog from './PbDialog';
import { GameShell, GameHeader, Panel, Chip, GameButton, Segmented } from '../_shared/kit';

// Editor de niveles de "Programa al Robot" (rediseño 2026 sobre el kit).
// Solo presentación: la lógica de pintado, validación y guardado es la de antes.
const SHELL = { accent: '#f59e0b', accent2: '#ec4899' };
const at = (x, y) => ({ '--x': x, '--y': y });

const makeDefaultWorld = (cols = 8, rows = 8) => ({
  cols, rows,
  robot: { x: 0, y: rows - 1, dir: 'E' },
  walls: [], water: [], holes: [], crates: [], items: [],
  target: { x: cols - 1, y: 0 },
});

const SIZES = [8, 10, 12];

// Cada herramienta se dibuja con su propia pieza del tablero (no con emojis).
const TOOLS = [
  { key: 'robot',  label: 'Robot',   art: () => <Robot dir="S" moving={false} /> },
  { key: 'target', label: 'Meta',    art: () => <TargetFlag /> },
  { key: 'wall',   label: 'Muro',    art: (b) => <WallTile x={0} y={0} biome={b} /> },
  { key: 'water',  label: 'Agua',    art: (b) => <WaterTile x={0} y={0} biome={b} /> },
  { key: 'hole',   label: 'Hoyo',    art: (b) => <HoleTile biome={b} /> },
  { key: 'crate',  label: 'Caja',    art: (b) => <CrateTile biome={b} /> },
  { key: 'item',   label: 'Energía', art: () => <EnergyItem /> },
  { key: 'erase',  label: 'Borrar',  art: () => <Eraser size={22} strokeWidth={2.4} /> },
];

const DIRS = [
  { key: 'N', label: 'Norte', Icon: ArrowUp },
  { key: 'E', label: 'Este', Icon: ArrowRight },
  { key: 'S', label: 'Sur', Icon: ArrowDown },
  { key: 'W', label: 'Oeste', Icon: ArrowLeft },
];

export default function LevelEditor({ gradeId, level, grade, biomeIdx = 0, canShare, onBack, onSaved, onPlay, editTarget }) {
  const [title, setTitle] = useState(editTarget?.title || '');
  const [description, setDescription] = useState(editTarget?.description || '');
  const [shared, setShared] = useState(!!editTarget?.shared);
  const [tool, setTool] = useState('wall');
  const [itemCount, setItemCount] = useState(1); // cantidad por defecto al pintar energía (1..9)
  const [robotDir, setRobotDir] = useState(editTarget?.world?.robot?.dir || 'E');
  const [world, setWorld] = useState(() => normalizeWorld(editTarget?.world) || makeDefaultWorld(8, 8));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [pendingConfirm, setPendingConfirm] = useState(null); // { title, text, confirmLabel, onConfirm }

  const biome = useMemo(() => biomeForLevel(biomeIdx), [biomeIdx]);
  const cellPx = useMemo(() => {
    const max = Math.max(world.cols, world.rows);
    if (max <= 8) return 52;
    if (max <= 10) return 44;
    return 36;
  }, [world.cols, world.rows]);

  const changeSize = (n) => {
    if (n === world.cols && n === world.rows) return;
    setPendingConfirm({
      title: `¿Cambiar el tablero a ${n}×${n}?`,
      text: 'Se borrarán los elementos que queden fuera del nuevo rango.',
      confirmLabel: 'Cambiar tamaño',
      onConfirm: () => applySize(n),
    });
  };

  const applySize = (n) => {
    setWorld((w) => {
      const inRange = (k) => { const [x, y] = k.split(':')[0].split(',').map(Number); return x < n && y < n; };
      const nextRobot = { ...w.robot, x: Math.min(w.robot.x, n - 1), y: Math.min(w.robot.y, n - 1) };
      const nextTarget = w.target ? { x: Math.min(w.target.x, n - 1), y: Math.min(w.target.y, n - 1) } : { x: n - 1, y: 0 };
      return {
        ...w, cols: n, rows: n,
        robot: nextRobot, target: nextTarget,
        walls: w.walls.filter(inRange),
        water: w.water.filter(inRange),
        holes: w.holes.filter(inRange),
        crates: (w.crates || []).filter(inRange),
        items: w.items.filter(inRange),
      };
    });
  };

  const keyOf = (x, y) => `${x},${y}`;

  const placeAt = useCallback((x, y) => {
    setErr('');
    setWorld((w) => {
      const k = keyOf(x, y);
      const removeAtK = (list) => list.filter((v) => String(v).split(':')[0] !== k);
      const clean = {
        ...w,
        walls: removeAtK(w.walls),
        water: removeAtK(w.water),
        holes: removeAtK(w.holes),
        crates: removeAtK(w.crates || []),
        items: removeAtK(w.items),
      };
      const isRobotCell = w.robot.x === x && w.robot.y === y;
      const isTargetCell = w.target && w.target.x === x && w.target.y === y;

      if (tool === 'robot') {
        return { ...clean, robot: { x, y, dir: robotDir } };
      }
      if (tool === 'target') {
        return { ...clean, target: { x, y } };
      }
      if (tool === 'erase') {
        return {
          ...clean,
          robot: isRobotCell ? { x: 0, y: w.rows - 1, dir: 'E' } : w.robot,
          target: isTargetCell ? null : w.target,
        };
      }
      // No permitir obstáculos encima del robot ni de la meta
      if (isRobotCell || isTargetCell) return w;
      if (tool === 'item') {
        // Si ya había ítem aquí, incrementamos su cantidad (hasta 9); si no, creamos con itemCount
        const existing = (w.items || []).find((raw) => String(raw).split(':')[0] === k);
        if (existing) {
          const cur = parseInt(String(existing).split(':')[1], 10) || 1;
          const next = Math.min(9, cur + 1);
          const keyVal = next <= 1 ? k : `${k}:${next}`;
          return { ...clean, items: [...clean.items, keyVal] };
        }
        const keyVal = itemCount <= 1 ? k : `${k}:${itemCount}`;
        return { ...clean, items: [...clean.items, keyVal] };
      }
      const arrKey = { wall: 'walls', water: 'water', hole: 'holes', crate: 'crates' }[tool];
      const already = (w[arrKey] || []).includes(k);
      return { ...clean, [arrKey]: already ? clean[arrKey] : [...clean[arrKey], k] };
    });
  }, [tool, robotDir, itemCount]);

  // Al cambiar dirección con el tool='robot', actualizamos la dir del robot colocado
  const changeRobotDir = (d) => {
    setRobotDir(d);
    setWorld((w) => ({ ...w, robot: { ...w.robot, dir: d } }));
  };

  const clearAll = () => {
    setPendingConfirm({
      title: '¿Vaciar todo el diseño?',
      text: 'Se quitarán todos los elementos del tablero.',
      confirmLabel: 'Vaciar',
      onConfirm: () => {
        setWorld(makeDefaultWorld(world.cols, world.rows));
        setErr('');
      },
    });
  };

  const validate = () => {
    if (!title.trim()) return 'Pon un título al nivel.';
    if (!world.target) return 'Tienes que colocar una meta 🏁.';
    const rk = keyOf(world.robot.x, world.robot.y);
    const tk = keyOf(world.target.x, world.target.y);
    if (rk === tk) return 'El robot y la meta no pueden estar en la misma casilla.';
    return '';
  };

  const handleSave = async () => {
    const e = validate(); if (e) { setErr(e); return; }
    setSaving(true); setErr('');
    try {
      const saved = await onSaved({ title: title.trim(), description: description.trim(), world, shared });
      if (saved === false) throw new Error('No se pudo guardar');
    } catch (e) {
      setErr(e.message || 'No se pudo guardar el nivel.');
    } finally {
      setSaving(false);
    }
  };

  const handlePlay = () => {
    const e = validate(); if (e) { setErr(e); return; }
    onPlay?.({ title: title.trim() || 'Mi nivel', world });
  };

  // Render del grid (clickable)
  const cells = [];
  const itemCountAt = (x, y) => {
    const k = keyOf(x, y);
    const raw = (world.items || []).find((v) => String(v).split(':')[0] === k);
    if (!raw) return 0;
    const [, cnt] = String(raw).split(':');
    return Math.max(1, parseInt(cnt, 10) || 1);
  };
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      const k = keyOf(x, y);
      const isWall = world.walls.includes(k);
      const isWater = world.water.includes(k);
      const isHole = world.holes.includes(k);
      const isCrate = (world.crates || []).includes(k);
      const itemN = itemCountAt(x, y);
      const isRobot = world.robot.x === x && world.robot.y === y;
      const isTarget = world.target && world.target.x === x && world.target.y === y;
      cells.push(
        <div
          key={k}
          className="pbx-cell pbx-ed-cell"
          onClick={() => placeAt(x, y)}
          style={at(x, y)}
          title={`(${x}, ${y})${itemN > 1 ? ` · ×${itemN}` : ''}`}
        >
          <div className="pbx-ed-layer"><FloorTile x={x} y={y} biome={biome} /></div>
          {isWall && <div className="pbx-ed-layer"><WallTile x={x} y={y} biome={biome} /></div>}
          {isWater && <div className="pbx-ed-layer"><WaterTile x={x} y={y} biome={biome} /></div>}
          {isHole && <div className="pbx-ed-layer"><HoleTile biome={biome} /></div>}
          {isCrate && <div className="pbx-ed-layer"><CrateTile biome={biome} /></div>}
          {itemN > 0 && !isWall && !isWater && !isHole && !isCrate && (
            <div className="pbx-ed-item">{itemN > 1 ? <EnergyStack count={itemN} /> : <EnergyItem />}</div>
          )}
          {isTarget && !isWall && !isWater && !isHole && !isCrate && (
            <div className="pbx-ed-target"><TargetFlag /></div>
          )}
          {isRobot && (
            <div className="pbx-ed-robot"><Robot dir={world.robot.dir} moving={false} /></div>
          )}
        </div>
      );
    }
  }

  const toolInfo = TOOLS.find((t) => t.key === tool);

  return (
    <GameShell {...SHELL} wide className="pbx">
      <GameHeader
        subtitle={editTarget?.id ? 'Editar nivel' : 'Crear nivel'}
        right={(
          <>
            <GameButton variant="soft" size="sm" icon={ChevronLeft} onClick={onBack}>Volver</GameButton>
            <GameButton variant="soft" size="sm" icon={Play} onClick={handlePlay} disabled={saving}>Probar</GameButton>
            <GameButton size="sm" icon={Save} onClick={handleSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</GameButton>
          </>
        )}
      />

      <div className="pbx-ed">
        <div className="pbx-ed__main">
          {/* Herramientas */}
          <Panel variant="surface" className="pbx-ed__tools">
            <div className="pbx-section-title"><Pencil size={16} /> Herramienta <small>{toolInfo?.label}</small></div>
            <div className="pbx-ed__toolgrid" role="radiogroup" aria-label="Herramientas">
              {TOOLS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="radio"
                  aria-checked={tool === t.key}
                  className={`pbx-tool is-${t.key} ${tool === t.key ? 'is-active' : ''}`}
                  onClick={() => setTool(t.key)}
                >
                  <span className="pbx-tool__art">{t.art(biome)}</span>
                  <span className="pbx-tool__label">{t.label}</span>
                </button>
              ))}
            </div>

            {tool === 'robot' && (
              <div className="pbx-ed__opt">
                <span className="pbx-ed__opt-label">Dirección</span>
                <div className="pbx-ed__dirs">
                  {DIRS.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      className={`pbx-chipbtn ${robotDir === d.key ? 'is-active' : ''}`}
                      onClick={() => changeRobotDir(d.key)}
                      aria-label={d.label}
                      title={d.label}
                    ><d.Icon size={16} strokeWidth={2.6} /></button>
                  ))}
                </div>
              </div>
            )}
            {tool === 'item' && (
              <div className="pbx-ed__opt">
                <span className="pbx-ed__opt-label">Cantidad por casilla</span>
                <div className="pbx-ed__dirs">
                  {[1, 2, 3, 5, 9].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`pbx-chipbtn ${itemCount === n ? 'is-active' : ''}`}
                      onClick={() => setItemCount(n)}
                      title={`Pintará casillas con ${n} unidad${n > 1 ? 'es' : ''}`}
                    >×{n}</button>
                  ))}
                </div>
                <span className="pbx-ed__hint">Clic sobre una casilla con energía: suma 1.</span>
              </div>
            )}
            <div className="pbx-ed__opt">
              <span className="pbx-ed__opt-label">Tamaño del tablero</span>
              <Segmented
                size="sm"
                value={world.cols}
                onChange={changeSize}
                options={SIZES.map((sz) => ({ value: sz, label: `${sz}×${sz}` }))}
              />
            </div>
            <div className="pbx-ed__tip"><Lightbulb size={15} /> Haz clic en una casilla para aplicar la herramienta. Las cajas se destruyen con «disparar láser».</div>
          </Panel>

          {/* Tablero */}
          <div className="pbx-arena pbx-arena--editor">
            <div className="pbx-arena__board">
              <div
                className={`pbx-board pbx-biome-${biome} has-grid pbx-ed-board`}
                style={{
                  '--cols': world.cols,
                  '--rows': world.rows,
                  '--cmax': `${cellPx}px`,
                  background: BIOME_INFO[biome]?.bg,
                }}
              >
                {cells}
                <div className="pbx-grid-overlay" />
              </div>
            </div>
            <div className="pbx-ed__counts">
              <span className="pbx-legend__item"><span className="pbx-legend__ico"><WallTile x={0} y={0} biome={biome} /></span>{world.walls.length}</span>
              <span className="pbx-legend__item"><span className="pbx-legend__ico"><WaterTile x={0} y={0} biome={biome} /></span>{world.water.length}</span>
              <span className="pbx-legend__item"><span className="pbx-legend__ico"><HoleTile biome={biome} /></span>{world.holes.length}</span>
              <span className="pbx-legend__item"><span className="pbx-legend__ico"><CrateTile biome={biome} /></span>{(world.crates || []).length}</span>
              <span className="pbx-legend__item"><span className="pbx-legend__ico"><EnergyItem /></span>{totalUnitsOf(world.items)}</span>
              <GameButton variant="ghost" size="sm" icon={Trash2} onClick={clearAll}>Vaciar</GameButton>
            </div>
          </div>
        </div>

        {/* Metadatos */}
        <Panel variant="surface" className="pbx-ed__meta">
          <label className="pbx-label" htmlFor="pbx-ed-title">Título</label>
          <input
            id="pbx-ed-title"
            className="pbx-input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Mi nivel imposible" maxLength={80}
          />

          <label className="pbx-label" htmlFor="pbx-ed-desc">Descripción</label>
          <textarea
            id="pbx-ed-desc"
            className="pbx-input pbx-input--area" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Explica qué tiene que hacer el robot…" rows={4} maxLength={400}
          />

          {canShare && (
            <label className="pbx-switch">
              <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />
              <span className="pbx-switch__track" aria-hidden="true"><span className="pbx-switch__knob" /></span>
              <span className="pbx-switch__text"><Users size={15} /> Compartir con mi clase</span>
            </label>
          )}

          {err && <div className="pbx-error"><AlertTriangle size={15} /> {err}</div>}

          <div className="pbx-ed__info">
            <Chip icon={User}>Nivel: {level} {grade}º</Chip>
            <Chip icon={Check}>Se practica con los bloques de tu curso</Chip>
          </div>
        </Panel>
      </div>

      <PbDialog
        open={!!pendingConfirm}
        tone="danger"
        title={pendingConfirm?.title}
        text={pendingConfirm?.text}
        onClose={() => setPendingConfirm(null)}
        actions={[
          { label: 'Cancelar', variant: 'soft', onClick: () => setPendingConfirm(null) },
          {
            label: pendingConfirm?.confirmLabel || 'Aceptar',
            variant: 'danger',
            onClick: () => { pendingConfirm?.onConfirm(); setPendingConfirm(null); },
            autoFocus: true,
          },
        ]}
      />
    </GameShell>
  );
}

// Normaliza un world guardado en BD (arrays que pueden venir como strings jsonb)
function normalizeWorld(w) {
  if (!w) return null;
  return {
    cols: w.cols || 8, rows: w.rows || 8,
    robot: w.robot || { x: 0, y: (w.rows || 8) - 1, dir: 'E' },
    walls: w.walls || [], water: w.water || [], holes: w.holes || [],
    crates: w.crates || [], items: w.items || [],
    target: w.target || null,
  };
}

function totalUnitsOf(items) {
  let t = 0;
  for (const raw of (items || [])) {
    const [, cnt] = String(raw).split(':');
    t += Math.max(1, parseInt(cnt, 10) || 1);
  }
  return t;
}
