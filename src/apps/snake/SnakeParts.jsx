// Piezas de presentación de Snake (solo dibujo): estrella bonus y guía de palabras.
// Las comparten SnakePalabras.jsx y SnakeDuel.jsx.
import React, { useId } from 'react';
import { Target } from 'lucide-react';

// Estrella bonus con volumen (degradado + brillo), sin filtros SVG.
export function SnakeStar() {
  const uid = useId().replace(/:/g, '');
  return (
    <svg className="snk-star" viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-g`} cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset=".45" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      <path
        d="M20 3.5l4.9 10 11 1.6-8 7.8 1.9 11L20 28.7l-9.8 5.2 1.9-11-8-7.8 11-1.6z"
        fill={`url(#${uid}-g)`}
        stroke="#b45309"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 13.5c1.6-.6 3-.6 4.2.2" stroke="#fff" strokeOpacity=".85" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const pretty = (k) => String(k || '').replace(/_/g, ' ');

// Guía de palabras por temática (va dentro de InstructionsModal).
export function SnakeWordGuide({ data, current }) {
  if (!data) return null;
  const entries = Object.entries(data).filter(([k, v]) => k !== 'title' && k !== 'instructions' && Array.isArray(v));
  return (
    <div className="snk-guide">
      {entries.map(([cat, words]) => (
        <section key={cat} className={`snk-guide__cat ${cat === current ? 'is-current' : ''}`}>
          <h4 className="snk-guide__title">
            {pretty(cat)}
            {cat === current && <span className="snk-guide__now"><Target size={12} /> Ahora</span>}
          </h4>
          <div className="snk-guide__words">
            {words.map((w, i) => <span key={`${w}-${i}`} className="snk-guide__chip">{w}</span>)}
          </div>
        </section>
      ))}
    </div>
  );
}
