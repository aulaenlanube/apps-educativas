import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, Save, Play, Trash2, Users, User, Check } from 'lucide-react';
import { FloorTile, WallTile, WaterTile, HoleTile, EnergyItem, EnergyStack, CrateTile, TargetFlag, biomeForLevel, BIOME_INFO } from './PixelTiles';
import Robot from './Robot';

const makeDefaultWorld = (cols = 8, rows = 8) => ({
  cols, rows,
  robot: { x: 0, y: rows - 1, dir: 'E' },
  walls: [], water: [], holes: [], crates: [], items: [],
  target: { x: cols - 1, y: 0 },
});

const SIZES = [8, 10, 12];

const TOOLS = [
  { key: 'robot',  label: 'Robot',    icon: '🤖', color: '#60a5fa' },
  { key: 'target', label: 'Meta',     icon: '🏁', color: '#fbbf24' },
  { key: 'wall',   label: 'Muro',     icon: '🧱', color: '#111' },
  { key: 'water',  label: 'Agua',     icon: '💧', color: '#3b82f6' },
  { key: 'hole',   label: 'Hoyo',     icon: '🕳️', color: '#0f172a' },
  { key: 'crate',  label: 'Caja',     icon: '📦', color: '#b45309' },
  { key: 'item',   label: 'Energía',  icon: '🔋', color: '#22c55e' },
  { key: 'erase',  label: 'Borrar',   icon: '❌', color: '#ef4444' },
];

const DIRS = [
  { key: 'N', label: '↑' },
  { key: 'E', label: '→' },
  { key: 'S', label: '↓' },
  { key: 'W', label: '←' },
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

  const biome = useMemo(() => biomeForLevel(biomeIdx), [biomeIdx]);
  const cellPx = useMemo(() => {
    const max = Math.max(world.cols, world.rows);
    if (max <= 8) return 52;
    if (max <= 10) return 44;
    return 36;
  }, [world.cols, world.rows]);

  const changeSize = (n) => {
    if (n === world.cols && n === world.rows) return;
    if (!confirm(`Cambiar el tamaño del tablero a ${n}×${n} borrará los elementos fuera del nuevo rango. ¿Continuar?`)) return;
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
    if (!confirm('¿Vaciar todo el diseño?')) return;
    setWorld({ ...DEFAULT_WORLD });
    setErr('');
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
          className="pb-ed-cell"
          onClick={() => placeAt(x, y)}
          style={{ left: x * cellPx, top: y * cellPx, width: cellPx, height: cellPx }}
          title={`(${x}, ${y})${itemN > 1 ? ` · ×${itemN}` : ''}`}
        >
          <div className="pb-ed-floor"><FloorTile x={x} y={y} biome={biome} /></div>
          {isWall && <div className="pb-ed-overlay"><WallTile x={x} y={y} biome={biome} /></div>}
          {isWater && <div className="pb-ed-overlay"><WaterTile x={x} y={y} biome={biome} /></div>}
          {isHole && <div className="pb-ed-overlay"><HoleTile biome={biome} /></div>}
          {isCrate && <div className="pb-ed-overlay"><CrateTile biome={biome} /></div>}
          {itemN > 0 && !isWall && !isWater && !isHole && !isCrate && (
            <div className="pb-ed-item">{itemN > 1 ? <EnergyStack count={itemN} /> : <EnergyItem />}</div>
          )}
          {isTarget && !isWall && !isWater && !isHole && !isCrate && (
            <div className="pb-ed-target"><TargetFlag /></div>
          )}
          {isRobot && (
            <div className="pb-ed-robot"><Robot dir={world.robot.dir} moving={false} /></div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="pb-root">
      <div className="pb-frame pb-frame-play">
        <div className="pb-play-header">
          <button className="pb-icon-btn" onClick={onBack}><ChevronLeft size={16} /> Volver</button>
          <div className="pb-play-title">
            <span className="pb-play-emoji">🎨</span>
            <span className="pb-play-text">Crear nivel</span>
          </div>
          <div className="pb-spacer" />
          <button className="pb-btn pb-btn-ghost" onClick={handlePlay} disabled={saving}>
            <Play size={14} /> Probar
          </button>
          <button className="pb-btn pb-btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>

        <div className="pb-ed-body">
          {/* Col izquierda: herramientas + grid */}
          <div className="pb-ed-main">
            <div className="pb-ed-tools">
              <div className="pb-ed-tools-row">
                {TOOLS.map((t) => (
                  <button
                    key={t.key}
                    className={`pb-ed-tool ${tool === t.key ? 'active' : ''}`}
                    onClick={() => setTool(t.key)}
                    style={tool === t.key ? { borderColor: t.color, background: `${t.color}22` } : undefined}
                  >
                    <span className="pb-ed-tool-icon">{t.icon}</span>
                    <span className="pb-ed-tool-label">{t.label}</span>
                  </button>
                ))}
              </div>
              {tool === 'robot' && (
                <div className="pb-ed-dir">
                  <span>Dirección:</span>
                  {DIRS.map((d) => (
                    <button
                      key={d.key}
                      className={`pb-ed-dir-btn ${robotDir === d.key ? 'active' : ''}`}
                      onClick={() => changeRobotDir(d.key)}
                    >{d.label}</button>
                  ))}
                </div>
              )}
              {tool === 'item' && (
                <div className="pb-ed-dir">
                  <span>Cantidad por casilla:</span>
                  {[1, 2, 3, 5, 9].map((n) => (
                    <button
                      key={n}
                      className={`pb-ed-dir-btn ${itemCount === n ? 'active' : ''}`}
                      onClick={() => setItemCount(n)}
                      title={`Pintará casillas con ${n} unidad${n > 1 ? 'es' : ''}`}
                    >×{n}</button>
                  ))}
                  <span className="pb-ed-hint-sm">(clic sobre una con ítem suma 1)</span>
                </div>
              )}
              <div className="pb-ed-size">
                <span>Tamaño del tablero:</span>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    className={`pb-ed-dir-btn ${world.cols === s ? 'active' : ''}`}
                    onClick={() => changeSize(s)}
                  >{s}×{s}</button>
                ))}
              </div>
              <div className="pb-ed-tools-hint">💡 Haz clic en una casilla para aplicar la herramienta. Las cajas 📦 se destruyen con disparar láser.</div>
            </div>

            <div
              className={`pb-board pb-biome-${biome} pb-ed-grid`}
              style={{
                width: world.cols * cellPx,
                height: world.rows * cellPx,
                background: BIOME_INFO[biome]?.bg,
                '--pb-cell': `${cellPx}px`,
              }}
            >
              {cells}
              <div className="pb-grid-overlay" />
            </div>

            <div className="pb-ed-actions-row">
              <button className="pb-btn pb-btn-ghost" onClick={clearAll}><Trash2 size={14} /> Vaciar</button>
              <span className="pb-ed-counter">
                🧱 {world.walls.length} · 💧 {world.water.length} · 🕳️ {world.holes.length} · 📦 {(world.crates || []).length} · 🔋 {totalUnitsOf(world.items)}
              </span>
            </div>
          </div>

          {/* Col derecha: metadatos */}
          <div className="pb-ed-meta">
            <label className="pb-ed-label">Título</label>
            <input
              className="pb-ed-input" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Mi nivel imposible" maxLength={80}
            />

            <label className="pb-ed-label">Descripción</label>
            <textarea
              className="pb-ed-textarea" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué tiene que hacer el robot…" rows={4} maxLength={400}
            />

            {canShare && (
              <label className="pb-ed-share">
                <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />
                <span><Users size={14} /> Compartir con mi clase</span>
              </label>
            )}

            {err && <div className="pb-error">⚠ {err}</div>}

            <div className="pb-ed-info">
              <div><User size={12} /> Nivel: {level} {grade}º</div>
              <div><Check size={12} /> Se practica con los bloques de tu curso.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
