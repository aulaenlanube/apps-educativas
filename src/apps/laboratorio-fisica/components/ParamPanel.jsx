// Panel de parámetros generado desde simDef.paramsDef + controles de
// reproducción + ayudas visuales + lecturas en vivo (throttled por el shell)
// + fórmula viva. Solo presentación (kit _shared/kit): los valores y los
// manejadores llegan del shell y no se transforman aquí.
import React from 'react';
import {
  Play, Pause, RotateCcw, Eye, EyeOff, Route, Turtle, Rabbit, Gauge, Activity, SlidersHorizontal, Clapperboard,
} from 'lucide-react';
import { GameButton, Segmented } from '../../_shared/kit';
import { fmt } from '../engine/integrator';

const SPEEDS = [
  { value: 0.25, label: '0,25×', icon: Turtle },
  { value: 1, label: '1×', icon: Play },
  { value: 2, label: '2×', icon: Rabbit },
];

function ParamControl({ def, value, onChange, disabled }) {
  if (def.type === 'toggle') {
    return (
      <div className={`fislab-param fislab-param--toggle ${disabled ? 'is-disabled' : ''}`}>
        <span className="fislab-param__label">{def.label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          aria-label={def.label}
          className={`fislab-switch ${value ? 'is-on' : ''}`}
          onClick={() => !disabled && onChange(!value)}
        >
          <span className="fislab-switch__knob" />
        </button>
      </div>
    );
  }
  if (def.type === 'select') {
    return (
      <div className={`fislab-param ${disabled ? 'is-disabled' : ''}`}>
        <span className="fislab-param__label">{def.label}</span>
        <Segmented
          size="sm"
          options={def.options.map((o) => ({ value: o.value, label: o.label, disabled }))}
          value={value}
          onChange={(v) => !disabled && onChange(v)}
        />
      </div>
    );
  }
  // slider numérico
  const decimals = def.decimals ?? (def.step < 1 ? 1 : 0);
  const span = def.max - def.min;
  const pct = span > 0 ? Math.max(0, Math.min(100, ((value - def.min) / span) * 100)) : 0;
  return (
    <div className={`fislab-param ${disabled ? 'is-disabled' : ''}`}>
      <span className="fislab-param__head">
        <span className="fislab-param__label">{def.label}</span>
        <output className="fislab-param__value">
          {fmt(value, decimals)}{def.unit ? <small> {def.unit}</small> : null}
        </output>
      </span>
      <input
        type="range"
        className="fislab-range"
        style={{ '--pct': `${pct}%` }}
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        disabled={disabled}
        aria-label={def.label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="fislab-param__ends" aria-hidden="true">
        <span>{fmt(def.min, decimals)}</span>
        <span>{fmt(def.max, decimals)}</span>
      </span>
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
      <section className="fislab-section">
        <h5 className="fislab-section__title"><Clapperboard size={13} /> Simulación</h5>
        <div className="fislab-transport">
          <GameButton
            variant={playing ? 'warning' : 'success'}
            icon={playing ? Pause : Play}
            className="fislab-transport__play"
            onClick={onPlayPause}
          >
            {playing ? 'Pausa' : 'Reproducir'}
          </GameButton>
          <button type="button" className="gk-iconbtn" onClick={onReset} title="Reiniciar" aria-label="Reiniciar">
            <RotateCcw size={17} />
          </button>
        </div>
        <div className="fislab-speedrow">
          <span className="fislab-minilabel"><Gauge size={13} /> Velocidad</span>
          <Segmented size="sm" options={SPEEDS} value={speed} onChange={onSpeedChange} />
        </div>

        {/* ayudas visuales */}
        {(simDef.usaVectores !== false || simDef.usaTrayectoria !== false) && (
          <div className="fislab-aids">
            {simDef.usaVectores !== false && (
              <button type="button" className={`fislab-aid ${showVectors ? 'is-on' : ''}`} aria-pressed={!!showVectors} onClick={onToggleVectors}>
                {showVectors ? <Eye size={14} /> : <EyeOff size={14} />} Vectores
              </button>
            )}
            {simDef.usaTrayectoria !== false && (
              <button type="button" className={`fislab-aid ${showTrajectory ? 'is-on' : ''}`} aria-pressed={!!showTrajectory} onClick={onToggleTrajectory}>
                <Route size={14} /> Trayectoria
              </button>
            )}
          </div>
        )}
      </section>

      {/* parámetros */}
      <section className="fislab-section">
        <h5 className="fislab-section__title"><SlidersHorizontal size={13} /> Parámetros</h5>
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
      </section>

      {/* lecturas en vivo */}
      {readouts?.length > 0 && (
        <section className="fislab-section">
          <h5 className="fislab-section__title"><Activity size={13} /> Medidas en vivo</h5>
          <div className="fislab-readouts">
            {readouts.map((r) => (
              <div className="fislab-readout" key={r.label}>
                <span className="fislab-readout__label">{r.label}</span>
                <span className="fislab-readout__value">
                  {typeof r.value === 'number' ? fmt(r.value, r.decimals ?? 2) : r.value}
                  {r.unit ? <small> {r.unit}</small> : null}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* fórmula viva */}
      {formulaViva && <div className="fislab-formula-inline">{formulaViva}</div>}

      {children}
    </div>
  );
}
