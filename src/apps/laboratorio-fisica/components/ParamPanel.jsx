// Panel de parámetros generado desde simDef.paramsDef + controles de
// reproducción + ayudas visuales + lecturas en vivo (throttled por el shell)
// + fórmula viva.
import React from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff, Route } from 'lucide-react';
import { fmt } from '../engine/integrator';

const SPEEDS = [
  { value: 0.25, label: '🐢 0,25×' },
  { value: 1, label: '▶ 1×' },
  { value: 2, label: '⏩ 2×' },
];

function ParamControl({ def, value, onChange, disabled }) {
  if (def.type === 'toggle') {
    return (
      <label className={`fislab-param fislab-param-toggle ${disabled ? 'disabled' : ''}`}>
        <span className="fislab-param-label">{def.label}</span>
        <button
          type="button"
          className={`fislab-switch ${value ? 'on' : ''}`}
          onClick={() => !disabled && onChange(!value)}
          aria-pressed={!!value}
        >
          <span className="fislab-switch-knob" />
        </button>
      </label>
    );
  }
  if (def.type === 'select') {
    return (
      <div className={`fislab-param ${disabled ? 'disabled' : ''}`}>
        <span className="fislab-param-label">{def.label}</span>
        <div className="fislab-param-options">
          {def.options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={value === o.value ? 'active' : ''}
              onClick={() => !disabled && onChange(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
  // slider numérico
  const decimals = def.decimals ?? (def.step < 1 ? 1 : 0);
  return (
    <div className={`fislab-param ${disabled ? 'disabled' : ''}`}>
      <span className="fislab-param-label">
        {def.label}
        <strong>{fmt(value, decimals)} {def.unit}</strong>
      </span>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default function ParamPanel({
  simDef,
  params,
  onParamChange,
  paramsLocked = false,
  playing,
  onPlayPause,
  onReset,
  speed,
  onSpeedChange,
  showVectors,
  onToggleVectors,
  showTrajectory,
  onToggleTrajectory,
  readouts,
  formulaViva,
  children,
}) {
  return (
    <div className="fislab-panel">
      {/* controles de reproducción */}
      <div className="fislab-controls">
        <button type="button" className="fislab-btn-play" onClick={onPlayPause}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
          {playing ? 'Pausa' : 'Reproducir'}
        </button>
        <button type="button" className="fislab-btn-reset" onClick={onReset} title="Reiniciar">
          <RotateCcw size={16} />
        </button>
        <div className="fislab-speeds">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={speed === s.value ? 'active' : ''}
              onClick={() => onSpeedChange(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ayudas visuales */}
      {(simDef.usaVectores !== false || simDef.usaTrayectoria !== false) && (
        <div className="fislab-aids">
          {simDef.usaVectores !== false && (
            <button type="button" className={showVectors ? 'active' : ''} onClick={onToggleVectors}>
              {showVectors ? <Eye size={14} /> : <EyeOff size={14} />} Vectores
            </button>
          )}
          {simDef.usaTrayectoria !== false && (
            <button type="button" className={showTrajectory ? 'active' : ''} onClick={onToggleTrajectory}>
              <Route size={14} /> Trayectoria
            </button>
          )}
        </div>
      )}

      {/* parámetros */}
      <div className="fislab-params">
        {simDef.paramsDef.map((def) => (
          <ParamControl
            key={def.key}
            def={def}
            value={params[def.key]}
            disabled={paramsLocked}
            onChange={(v) => onParamChange(def.key, v)}
          />
        ))}
      </div>

      {/* lecturas en vivo */}
      {readouts?.length > 0 && (
        <div className="fislab-readouts">
          {readouts.map((r) => (
            <div className="fislab-readout" key={r.label}>
              <span>{r.label}</span>
              <strong>{typeof r.value === 'number' ? fmt(r.value, r.decimals ?? 2) : r.value} {r.unit || ''}</strong>
            </div>
          ))}
        </div>
      )}

      {/* fórmula viva */}
      {formulaViva && <div className="fislab-formula-viva">{formulaViva}</div>}

      {children}
    </div>
  );
}
