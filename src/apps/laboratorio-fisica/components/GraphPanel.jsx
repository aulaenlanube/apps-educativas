// Gráficas en vivo (x-t, v-t...) SIN estado React por frame: el shell empuja
// muestras a seriesRef.current (array de {t, <clave>: valor}) y aquí se dibuja
// imperativamente en un <canvas> 2D a ~20 fps. Cero re-renders del árbol React.
import React, { useEffect, useRef } from 'react';
import { fmt } from '../engine/integrator';

const PAD_L = 44;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 22;

export default function GraphPanel({ seriesRef, lines, windowSecs = 12, height = 150 }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = 0;

    const draw = (ts) => {
      raf = requestAnimationFrame(draw);
      if (ts - last < 50) return; // ~20 fps es de sobra para una gráfica
      last = ts;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = height;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const data = seriesRef.current || [];
      const tMax = data.length ? data[data.length - 1].t : 0;
      const t0 = Math.max(0, tMax - windowSecs);
      const visible = data.filter((s) => s.t >= t0);

      // escala Y conjunta (autoajustada a lo visible, simétrica si hay negativos)
      let yMin = 0;
      let yMax = 1;
      visible.forEach((s) => {
        lines.forEach((l) => {
          const v = s[l.key];
          if (Number.isFinite(v)) {
            if (v < yMin) yMin = v;
            if (v > yMax) yMax = v;
          }
        });
      });
      const span = Math.max(yMax - yMin, 0.5);
      yMax += span * 0.08;
      yMin -= span * 0.08;

      const plotW = w - PAD_L - PAD_R;
      const plotH = h - PAD_T - PAD_B;
      const xOf = (t) => PAD_L + ((t - t0) / windowSecs) * plotW;
      const yOf = (v) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * plotH;

      // rejilla + ejes
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px ui-monospace, monospace';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const v = yMin + ((yMax - yMin) * i) / 4;
        const y = yOf(v);
        ctx.beginPath();
        ctx.moveTo(PAD_L, y);
        ctx.lineTo(w - PAD_R, y);
        ctx.stroke();
        ctx.fillText(fmt(v, Math.abs(yMax - yMin) < 5 ? 1 : 0), 4, y + 3);
      }
      for (let i = 0; i <= 4; i++) {
        const t = t0 + (windowSecs * i) / 4;
        const x = xOf(t);
        ctx.fillText(`${fmt(t, 0)}s`, x - 6, h - 8);
      }
      // línea del cero si es visible
      if (yMin < 0 && yMax > 0) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.beginPath();
        ctx.moveTo(PAD_L, yOf(0));
        ctx.lineTo(w - PAD_R, yOf(0));
        ctx.stroke();
      }

      // series
      lines.forEach((l) => {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        visible.forEach((s) => {
          const v = s[l.key];
          if (!Number.isFinite(v)) return;
          const x = xOf(s.t);
          const y = yOf(v);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [seriesRef, lines, windowSecs, height]);

  return (
    <div className="fislab-graph" ref={wrapRef}>
      <div className="fislab-graph-legend">
        {lines.map((l) => (
          <span key={l.key} style={{ color: l.color }}>● {l.label}</span>
        ))}
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
