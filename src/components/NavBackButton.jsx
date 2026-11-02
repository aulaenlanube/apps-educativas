// Botones de navegación de la cabecera y de la barra de las apps (Inicio,
// Asignaturas, Volver a la asignatura, Quién soy) y flechas para cambiar de curso.
// Cristal oscuro con el icono en una pastilla de color: se leen igual sobre la
// cabecera oscura, sobre el fondo 3D y sobre fondos claros. Sin bucles animados.
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import './NavBackButton.css';

// icon: componente de lucide (ArrowLeft por defecto, que se desplaza al pasar el ratón)
// kicker: texto pequeño encima de la etiqueta ("Volver a", "3º ESO"…)
// tone: 'brand' (violeta → rosa) | 'soft' (pastilla de cristal, para acciones secundarias)
export function NavPill({ children, onClick, icon: Icon = ArrowLeft, kicker, tone = 'brand', title, className = '' }) {
  const isBack = Icon === ArrowLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`nav-pill nav-pill--${tone}${isBack ? ' is-back' : ''}${kicker ? ' has-kicker' : ''} ${className}`}
    >
      <span className="nav-pill__icon" aria-hidden="true"><Icon size={17} strokeWidth={2.4} /></span>
      <span className="nav-pill__text">
        {kicker && <span className="nav-pill__kicker">{kicker}</span>}
        <span className="nav-pill__label">{children}</span>
      </span>
    </button>
  );
}

// Flecha redonda para pasar al curso anterior / siguiente.
export function NavArrow({ direction = 'left', onClick, label }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`nav-arrow nav-arrow--${direction}`}
      aria-label={label}
      title={label}
    >
      <Icon size={24} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}

export default NavPill;
