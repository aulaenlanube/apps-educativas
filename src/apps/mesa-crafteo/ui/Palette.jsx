// src/apps/mesa-crafteo/ui/Palette.jsx
// Tira de elementos. Tocar = unir al átomo seleccionado. Arrastrar = soltar
// sobre el átomo o el hueco que se quiera (con imán: el hueco se ilumina).
// Teclado: Enter/Espacio sobre la ficha equivale a tocarla.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { tokenInfo } from '../chem/elements';

const DRAG_START = 9; // px antes de considerar que es un arrastre

export function AtomBall({ tok, size = 40, className = '' }) {
  const info = tokenInfo(tok);
  return (
    <span className={`mc-ball ${className}`} style={{ '--el': info.color, '--sz': `${size}px` }} aria-hidden="true">
      <span className="mc-ball__sym">{info.label}</span>
    </span>
  );
}

// Puntos de valencia alrededor de la ficha (electrones para enlazar).
function ValenceDots({ n }) {
  const dots = [];
  for (let i = 0; i < n; i++) {
    const a = (-90 + (i - (n - 1) / 2) * (n > 4 ? 40 : 46)) * (Math.PI / 180);
    dots.push(<i key={i} style={{ '--x': `${Math.cos(a) * 25}px`, '--y': `${Math.sin(a) * 25}px` }} />);
  }
  return <span className="mc-tile__dots" aria-hidden="true">{dots}</span>;
}

export default function Palette({ tokens, onPick, onDragMove, onDrop, disabled = false, highlight = null, compactNames = false }) {
  const drag = useRef(null);
  const [ghost, setGhost] = useState(null); // { tok, x, y }

  const end = useCallback(() => {
    drag.current = null;
    setGhost(null);
    window.removeEventListener('pointermove', onMoveRef.current);
    window.removeEventListener('pointerup', onUpRef.current);
    window.removeEventListener('pointercancel', onCancelRef.current);
  }, []);

  const onMoveRef = useRef(null);
  const onUpRef = useRef(null);
  const onCancelRef = useRef(null);

  onMoveRef.current = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    if (!d.dragging && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_START) d.dragging = true;
    if (d.dragging) {
      setGhost({ tok: d.tok, x: e.clientX, y: e.clientY });
      onDragMove?.(d.tok, e.clientX, e.clientY);
    }
  };
  onUpRef.current = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    if (d.dragging) onDrop?.(d.tok, e.clientX, e.clientY);
    else onPick?.(d.tok);
    end();
  };
  onCancelRef.current = () => { if (drag.current?.dragging) onDrop?.(null); end(); };

  useEffect(() => end, [end]);

  const down = (tok) => (e) => {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { tok, id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false };
    window.addEventListener('pointermove', onMoveRef.current);
    window.addEventListener('pointerup', onUpRef.current);
    window.addEventListener('pointercancel', onCancelRef.current);
  };

  return (
    <div className={`mc-palette ${tokens.length > 8 ? 'is-many' : ''}`} role="toolbar" aria-label="Elementos disponibles">
      {tokens.map((tok) => {
        const info = tokenInfo(tok);
        return (
          <button
            key={tok}
            type="button"
            className={`mc-tile ${highlight === tok ? 'is-hint' : ''}`}
            style={{ '--el': info.color }}
            disabled={disabled}
            onPointerDown={down(tok)}
            onClick={(e) => { if (e.detail === 0) onPick?.(tok); }}
            aria-label={`${info.name}: ${info.valences[0]} enlace${info.valences[0] > 1 ? 's' : ''}`}
            title={`${info.name} · valencia ${info.valences.join(', ')}`}
          >
            <span className="mc-tile__orb">
              <AtomBall tok={tok} size={38} />
              <ValenceDots n={info.valences[0]} />
            </span>
            {!compactNames && <span className="mc-tile__name">{info.name.replace(/ \(.*\)/, '')}{info.charge ? (info.charge > 0 ? ' (+)' : ' (−)') : ''}</span>}
            <span className="mc-tile__val">{info.valences.length > 1 ? info.valences.join('/') : info.valences[0]} enl.</span>
          </button>
        );
      })}
      {ghost && createPortal(
        <span className="mc-dragghost" style={{ transform: `translate3d(${ghost.x - 26}px, ${ghost.y - 26}px, 0)` }}>
          <AtomBall tok={ghost.tok} size={52} />
        </span>,
        document.body,
      )}
    </div>
  );
}
