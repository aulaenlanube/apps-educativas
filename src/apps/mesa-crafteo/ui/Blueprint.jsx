// src/apps/mesa-crafteo/ui/Blueprint.jsx
// "Plano" 2D de una molécula: proyección en SVG de su geometría VSEPR.
// Sirve de pista, de miniatura del álbum, de solución en el examen y, en modo
// interactivo, de mesa de construcción cuando el navegador no tiene WebGL.
import React, { useMemo } from 'react';
import { tokenInfo, labelInk } from '../chem/elements';
import { computeLayout } from '../chem/layout';
import { atomStatus } from '../chem/graph';

const SCALE = 46; // px por unidad

export default function Blueprint({
  model, layout: layoutProp, className = '', interactive = false, showSlots = false, showLP = false,
  selectedId = null, attachId = null, onAtomTap, onSlotTap, onBondTap, title, mystery = false,
}) {
  const layout = useMemo(
    () => layoutProp || computeLayout(model, null, { fresh: true, display: true }),
    [layoutProp, model],
  );
  const view = useMemo(() => {
    const pts = model.atoms.map((a) => {
      const p = layout.pos[a.id] || [0, 0, 0];
      return { id: a.id, tok: a.tok, x: p[0] * SCALE, y: -p[1] * SCALE, z: p[2], r: tokenInfo(a.tok).radius * SCALE };
    });
    const pad = 30 + (showSlots ? 16 : 0);
    const xs = pts.map((p) => p.x); const ys = pts.map((p) => p.y);
    const minX = Math.min(0, ...xs) - pad - 20; const maxX = Math.max(0, ...xs) + pad + 20;
    const minY = Math.min(0, ...ys) - pad - 20; const maxY = Math.max(0, ...ys) + pad + 20;
    return { pts, box: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`, byId: new Map(pts.map((p) => [p.id, p])) };
  }, [model, layout, showSlots]);

  const bonds = model.bonds.map((b) => {
    const A = view.byId.get(b.a); const B = view.byId.get(b.b);
    if (!A || !B) return null;
    const dx = B.x - A.x; const dy = B.y - A.y; const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L; const ny = dx / L;
    const offs = b.order === 3 ? [-6, 0, 6] : b.order === 2 ? [-4, 4] : [0];
    return { b, A, B, nx, ny, offs, z: (A.z + B.z) / 2 };
  }).filter(Boolean);

  const sorted = [...view.pts].sort((p, q) => p.z - q.z);

  return (
    <svg className={`mc-bp ${interactive ? 'is-interactive' : ''} ${className}`} viewBox={view.box} role="img" aria-label={title || 'Plano de la molécula'}>
      <defs>
        <radialGradient id="mcbp-shine" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </radialGradient>
      </defs>
      {bonds.map(({ b, A, B, nx, ny, offs }) => (
        <g key={`${b.a}-${b.b}`} className="mc-bp__bond"
          onClick={interactive ? () => onBondTap?.(b.a, b.b) : undefined}>
          {offs.map((o) => (
            <line key={o} x1={A.x + nx * o} y1={A.y + ny * o} x2={B.x + nx * o} y2={B.y + ny * o} />
          ))}
          {interactive && <line className="mc-bp__hit" x1={A.x} y1={A.y} x2={B.x} y2={B.y} />}
        </g>
      ))}
      {sorted.map((p) => {
        const info = tokenInfo(p.tok);
        const depth = Math.max(0.78, Math.min(1.12, 1 + p.z * 0.06));
        const r = p.r * depth;
        const dom = layout.dom[p.id] || { slots: [], lps: [] };
        const st = interactive || showSlots ? atomStatus(model, p.id) : null;
        const color = mystery ? '#64748b' : info.color;
        return (
          <g key={p.id} className={`mc-bp__atom ${selectedId === p.id ? 'is-sel' : ''} ${attachId === p.id ? 'is-attach' : ''}`}
            onClick={interactive ? () => onAtomTap?.(p.id) : undefined}>
            {showLP && dom.lps.map((d, k) => {
              const len = Math.hypot(d[0], d[1]);
              if (len < 0.35) return null;
              const ux = d[0] / len; const uy = -d[1] / len;
              const cx = p.x + ux * (r + 7); const cy = p.y + uy * (r + 7);
              return (
                <g key={`lp${k}`} className="mc-bp__lp">
                  <circle cx={cx - uy * 3.6} cy={cy + ux * 3.6} r="2.2" />
                  <circle cx={cx + uy * 3.6} cy={cy - ux * 3.6} r="2.2" />
                </g>
              );
            })}
            <circle cx={p.x} cy={p.y} r={r} fill={color} className="mc-bp__ball" />
            <circle cx={p.x} cy={p.y} r={r} fill="url(#mcbp-shine)" />
            {!mystery && (
              <text x={p.x} y={p.y + 1} fill={labelInk(info.color)} fontSize={Math.max(11, r * (info.label.length > 2 ? 0.62 : 0.8))}>{info.label}</text>
            )}
            {(showSlots || interactive) && st && dom.slots.map((d, k) => {
              const len = Math.hypot(d[0], d[1]) || 1;
              const ux = d[0] / len; const uy = -d[1] / len;
              return (
                <circle key={`s${k}`} className="mc-bp__slot" cx={p.x + ux * (r + 10)} cy={p.y + uy * (r + 10)} r="5"
                  onClick={interactive ? (e) => { e.stopPropagation(); onSlotTap?.(p.id, k); } : undefined} />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
