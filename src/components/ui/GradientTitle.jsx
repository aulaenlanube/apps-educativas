import React from 'react';
import './GradientTitle.css';

const GradientTitle = ({ children, className = "", tag = "h1" }) => {
  const Tag = tag;
  return (
    <Tag className={`font-bold gradient-text ${className}`}>
      {children}
    </Tag>
  );
};

// Título letra a letra con flotación y degradado.
// Rendimiento (igual que el hero de la home): degradado FIJO repartido entre
// las letras (cada una muestra su tramo) y perfil blanco en la letra interior,
// que se rasteriza una vez; la flotación del span exterior es solo transform
// (GPU) y solo en nivel de efectos alto (.agt-char en GradientTitle.css).
// Antes cada letra desplazaba su degradado y el filtro del perfil envolvía
// el título entero: 4 drop-shadows del título completo en cada frame.
export const AnimatedGradientTitle = ({ children, className = "", tag = "h1" }) => {
  const Tag = tag;
  const text = typeof children === 'string' ? children : String(children);
  const words = text.split(' ');
  const total = Math.max(2, text.replace(/ /g, '').length);
  let charIndex = 0;
  return (
    <Tag className={`font-bold ${className}`} style={{ lineHeight: 1.4 }}>
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          {wi > 0 && <span>{'\u00A0'}</span>}
          <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
            {word.split('').map((char) => {
              const i = charIndex++;
              return (
                <span key={i} className="agt-char" style={{ animationDelay: `${i * 0.12}s` }}>
                  <span
                    className="agt-glyph gradient-title-stroke"
                    style={{
                      backgroundSize: `${total * 100}% 100%`,
                      backgroundPosition: `${(i / (total - 1)) * 100}% 0`,
                      animationDelay: `${0.3 + i * 0.04}s`,
                    }}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default GradientTitle;