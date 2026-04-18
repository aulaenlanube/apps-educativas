import React from 'react';

// Robot pixel-art inspirado en la mascota, con 4 vistas distintas según la
// dirección (como en un RPG 2D). Cada sprite usa una rejilla 24x32 de
// "píxeles" (rect unitarios) y shape-rendering="crispEdges" para mantener el
// aspecto pixelado sin anti-aliasing.
//
// Props:
//   dir    -> 'N' | 'E' | 'S' | 'W'  (orientación del robot)
//   moving -> boolean (anima caminar si true, idle si false)

// Paleta reducida estilo pixel-art (minimalista de la mascota)
const C = {
  body:      '#6366f1',
  bodyDk:    '#4338ca',
  bodyHl:    '#a5b4fc',
  head:      '#818cf8',
  headHl:    '#c7d2fe',
  headDk:    '#4f46e5',
  visor:     '#0f172a',
  visorHl:   '#1e293b',
  eye:       '#22d3ee',
  eyeHl:     '#a5f3fc',
  metal:     '#64748b',
  metalHl:   '#94a3b8',
  metalDk:   '#334155',
  foot:      '#0f172a',
  ant:       '#475569',
  light:     '#fbbf24',
  lightHl:   '#fde68a',
  ledR:      '#ef4444',
  ledG:      '#22c55e',
  panel:     '#1e1b4b',
  panelHl:   '#312e81',
  shadow:    'rgba(0,0,0,0.3)',
};

const rect = (x, y, w, h, fill, key) => (
  <rect key={key} x={x} y={y} width={w} height={h} fill={fill} />
);

// --- VISTA FRONTAL (hacia el sur, mirando a la cámara) -------------
function FrontSprite() {
  return (
    <>
      {/* Sombra */}
      <ellipse cx="12" cy="30.5" rx="7" ry="1.3" fill={C.shadow} className="pb-r-shadow" />

      {/* PIERNAS (detrás del cuerpo) */}
      <g className="pb-r-leg-left pb-r-leg-fb">
        {rect(8, 24, 3, 4, C.metalDk)}
        {rect(8, 24, 3, 1, C.metal)}
        {rect(7, 28, 5, 2, C.foot)}
      </g>
      <g className="pb-r-leg-right pb-r-leg-fb">
        {rect(13, 24, 3, 4, C.metalDk)}
        {rect(13, 24, 3, 1, C.metal)}
        {rect(12, 28, 5, 2, C.foot)}
      </g>

      {/* TORSO */}
      {rect(4, 14, 16, 1, C.bodyHl)}
      {rect(4, 15, 16, 8, C.body)}
      {rect(4, 23, 16, 1, C.bodyDk)}
      {/* Hombros metálicos */}
      {rect(3, 14, 1, 2, C.metalHl)}
      {rect(20, 14, 1, 2, C.metalHl)}
      {rect(3, 16, 1, 1, C.metal)}
      {rect(20, 16, 1, 1, C.metal)}
      {/* Laterales del torso con brillo */}
      {rect(4, 15, 1, 8, C.bodyHl)}
      {rect(19, 15, 1, 8, C.bodyDk)}

      {/* Panel de pecho */}
      {rect(7, 16, 10, 6, C.panel)}
      {rect(7, 16, 10, 1, C.panelHl)}
      {/* LEDs */}
      {rect(8, 17, 1, 1, C.ledR)}
      {rect(11, 17, 1, 1, C.light)}
      {rect(14, 17, 1, 1, C.ledG)}
      {/* Líneas de datos */}
      {rect(8, 19, 8, 1, C.eye)}
      {rect(8, 20, 6, 1, C.eye)}

      {/* BRAZOS (superpuestos al torso, visibles a los lados) */}
      <g className="pb-r-arm-left pb-r-arm-fb">
        {rect(1, 16, 2, 6, C.metal)}
        {rect(1, 16, 1, 6, C.metalHl)}
        {rect(1, 22, 2, 2, C.metalDk)}
      </g>
      <g className="pb-r-arm-right pb-r-arm-fb">
        {rect(21, 16, 2, 6, C.metal)}
        {rect(22, 16, 1, 6, C.metalDk)}
        {rect(21, 22, 2, 2, C.metalDk)}
      </g>

      {/* CUELLO */}
      {rect(10, 13, 4, 1, C.metalDk)}
      {rect(10, 12, 4, 1, C.metal)}

      {/* CABEZA */}
      {rect(5, 4, 14, 1, C.headHl)}
      {rect(4, 5, 16, 7, C.head)}
      {/* Sombra lateral derecha */}
      {rect(18, 5, 2, 7, C.headDk)}
      {/* Tornillos/orejas */}
      {rect(3, 8, 1, 2, C.metal)}
      {rect(20, 8, 1, 2, C.metal)}
      {/* Visor */}
      {rect(5, 7, 14, 4, C.visor)}
      {rect(5, 7, 14, 1, C.visorHl)}
      {/* Ojos */}
      <g className="pb-r-eyes">
        {rect(7, 8, 3, 2, C.eye)}
        {rect(7, 8, 1, 1, C.eyeHl)}
        {rect(14, 8, 3, 2, C.eye)}
        {rect(14, 8, 1, 1, C.eyeHl)}
      </g>

      {/* ANTENA */}
      <g className="pb-r-antenna">
        {rect(11, 2, 2, 2, C.ant)}
        {rect(10, 0, 4, 2, C.light)}
        {rect(10, 0, 2, 1, C.lightHl)}
      </g>
    </>
  );
}

// --- VISTA TRASERA (hacia el norte, mira al fondo) -----------------
function BackSprite() {
  return (
    <>
      <ellipse cx="12" cy="30.5" rx="7" ry="1.3" fill={C.shadow} className="pb-r-shadow" />

      {/* PIERNAS */}
      <g className="pb-r-leg-left pb-r-leg-fb">
        {rect(8, 24, 3, 4, C.metalDk)}
        {rect(8, 24, 3, 1, C.metal)}
        {rect(7, 28, 5, 2, C.foot)}
      </g>
      <g className="pb-r-leg-right pb-r-leg-fb">
        {rect(13, 24, 3, 4, C.metalDk)}
        {rect(13, 24, 3, 1, C.metal)}
        {rect(12, 28, 5, 2, C.foot)}
      </g>

      {/* TORSO */}
      {rect(4, 14, 16, 1, C.bodyHl)}
      {rect(4, 15, 16, 8, C.body)}
      {rect(4, 23, 16, 1, C.bodyDk)}
      {rect(4, 15, 1, 8, C.bodyDk)}
      {rect(19, 15, 1, 8, C.bodyHl)}
      {rect(3, 14, 1, 2, C.metalHl)}
      {rect(20, 14, 1, 2, C.metalHl)}

      {/* Panel trasero (mochila): enjambre de rejilla + circulo central */}
      {rect(8, 16, 8, 6, C.panel)}
      {rect(8, 16, 8, 1, C.panelHl)}
      {/* Rejilla de ventilación */}
      {rect(9, 18, 1, 1, C.metalDk)}
      {rect(11, 18, 1, 1, C.metalDk)}
      {rect(13, 18, 1, 1, C.metalDk)}
      {rect(9, 20, 1, 1, C.metalDk)}
      {rect(11, 20, 1, 1, C.metalDk)}
      {rect(13, 20, 1, 1, C.metalDk)}

      {/* Brazos */}
      <g className="pb-r-arm-left pb-r-arm-fb">
        {rect(1, 16, 2, 6, C.metal)}
        {rect(1, 16, 1, 6, C.metalDk)}
        {rect(1, 22, 2, 2, C.metalDk)}
      </g>
      <g className="pb-r-arm-right pb-r-arm-fb">
        {rect(21, 16, 2, 6, C.metal)}
        {rect(22, 16, 1, 6, C.metalHl)}
        {rect(21, 22, 2, 2, C.metalDk)}
      </g>

      {/* CUELLO */}
      {rect(10, 12, 4, 2, C.metal)}

      {/* CABEZA (sin cara, con panel trasero) */}
      {rect(5, 4, 14, 1, C.headHl)}
      {rect(4, 5, 16, 7, C.head)}
      {rect(4, 5, 1, 7, C.headDk)}
      {/* Banda superior trasera oscura */}
      {rect(6, 8, 12, 2, C.headDk)}
      {rect(6, 8, 12, 1, C.visor)}
      {/* Luz de estado atrás */}
      {rect(11, 8, 2, 1, C.eye)}
      {/* Tornillos */}
      {rect(3, 8, 1, 2, C.metal)}
      {rect(20, 8, 1, 2, C.metal)}

      {/* ANTENA */}
      <g className="pb-r-antenna">
        {rect(11, 2, 2, 2, C.ant)}
        {rect(10, 0, 4, 2, C.light)}
        {rect(10, 0, 2, 1, C.lightHl)}
      </g>
    </>
  );
}

// --- VISTA LATERAL (hacia el este; flip horizontal para oeste) ----
function SideSprite() {
  return (
    <>
      <ellipse cx="12" cy="30.5" rx="6.5" ry="1.3" fill={C.shadow} className="pb-r-shadow" />

      {/* PIERNA TRASERA */}
      <g className="pb-r-leg-side-back">
        {rect(9, 23, 3, 5, C.metalDk)}
        {rect(8, 28, 6, 2, C.foot)}
      </g>

      {/* TORSO (perfil más estrecho) */}
      {rect(7, 14, 10, 1, C.bodyHl)}
      {rect(7, 15, 10, 8, C.body)}
      {rect(7, 23, 10, 1, C.bodyDk)}
      {rect(7, 15, 1, 8, C.bodyHl)}
      {rect(16, 15, 1, 8, C.bodyDk)}
      {/* Panel lateral pequeño */}
      {rect(9, 17, 5, 4, C.panel)}
      {rect(10, 18, 1, 1, C.light)}
      {rect(12, 18, 1, 1, C.eye)}
      {/* Hombro metálico */}
      {rect(15, 14, 2, 2, C.metal)}
      {rect(15, 14, 1, 2, C.metalHl)}

      {/* BRAZO FRONTAL (oscila al caminar) */}
      <g className="pb-r-arm-side">
        {rect(14, 16, 3, 6, C.metal)}
        {rect(14, 16, 1, 6, C.metalHl)}
        {rect(14, 22, 3, 2, C.metalDk)}
      </g>

      {/* PIERNA DELANTERA (por delante del brazo posterior) */}
      <g className="pb-r-leg-side-front">
        {rect(13, 23, 3, 5, C.metalDk)}
        {rect(13, 23, 3, 1, C.metal)}
        {rect(12, 28, 6, 2, C.foot)}
      </g>

      {/* CUELLO */}
      {rect(10, 12, 4, 2, C.metal)}

      {/* CABEZA de perfil (frente hacia la derecha) */}
      {rect(6, 4, 12, 1, C.headHl)}
      {rect(5, 5, 14, 7, C.head)}
      {rect(17, 5, 2, 7, C.headDk)}
      {/* Visor cubre la mitad delantera */}
      {rect(9, 7, 10, 4, C.visor)}
      {rect(9, 7, 10, 1, C.visorHl)}
      {/* Un ojo (lateral) */}
      <g className="pb-r-eyes">
        {rect(14, 8, 3, 2, C.eye)}
        {rect(14, 8, 1, 1, C.eyeHl)}
      </g>
      {/* Oreja/antena lateral */}
      {rect(5, 8, 2, 2, C.metal)}

      {/* ANTENA */}
      <g className="pb-r-antenna">
        {rect(11, 2, 2, 2, C.ant)}
        {rect(10, 0, 4, 2, C.light)}
        {rect(10, 0, 2, 1, C.lightHl)}
      </g>
    </>
  );
}

export default function Robot({ dir = 'S', moving = false }) {
  let Sprite;
  let flipX = false;
  let tiltClass = '';

  switch (dir) {
    case 'N': Sprite = BackSprite; tiltClass = 'pb-r-tilt-up'; break;
    case 'S': Sprite = FrontSprite; tiltClass = 'pb-r-tilt-down'; break;
    case 'W': Sprite = SideSprite; flipX = true; break;
    case 'E':
    default:  Sprite = SideSprite; break;
  }

  return (
    <svg
      viewBox="0 0 24 32"
      shapeRendering="crispEdges"
      className={`pb-robot-pixel pb-r-${dir} ${tiltClass} ${moving ? 'pb-r-walk' : 'pb-r-idle'}`}
      style={{
        width: '100%', height: '100%',
        overflow: 'visible',
        transform: flipX ? 'scaleX(-1)' : 'none',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Sprite />
    </svg>
  );
}
