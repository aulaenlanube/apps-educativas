// Decorado de fondo de las apps de mapas (Explorador del Mundo y de España):
// noche con un globo de alambre tenue en el color de la app. Va en el hueco
// `scene` del GameShell; estático (sin animaciones).
const R = 300;
const MERIDIANS = [15, 35, 55, 75, 90]; // grados desde el meridiano central
const PARALLELS = [-60, -40, -20, 0, 20, 40, 60];

export default function MapScene() {
  const rad = (d) => (d * Math.PI) / 180;
  return (
    <div className="gq-scene" aria-hidden="true">
      <div className="gq-scene__glow" />
      <svg className="gq-scene__globe" viewBox="-320 -320 640 640" fill="none" stroke="currentColor">
        <circle r={R} strokeWidth="2" />
        <line x1="0" y1={-R} x2="0" y2={R} strokeWidth="1.2" />
        {MERIDIANS.map((d) => (
          <ellipse key={d} rx={R * Math.sin(rad(d))} ry={R} strokeWidth="1.2" />
        ))}
        {PARALLELS.map((d) => {
          const y = -R * Math.sin(rad(d));
          const w = R * Math.cos(rad(d));
          return <line key={d} x1={-w} y1={y} x2={w} y2={y} strokeWidth={d === 0 ? 1.8 : 1.2} />;
        })}
      </svg>
      <div className="gq-scene__dots" />
    </div>
  );
}
