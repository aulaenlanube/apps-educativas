# Insignias redibujadas — formato y reglas (2026)

Las insignias se pintan dentro del medallón por rareza de
`src/components/ui/BadgeIcon.jsx` (aro metálico + cara + brillo, en CSS). Este
directorio solo contiene el **dibujo central**; `BADGE_OVERRIDES` (index.js)
tiene prioridad sobre el dibujo original de `BadgeIcon.jsx`.

## Formato

```jsx
const BADGES = {
  first_game: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}body`} …>…</linearGradient>
      </defs>
      … <rect fill={`url(#${id}body)`} /> …
    </>
  ),
};
export default BADGES;
```

- Se renderiza dentro de `<svg viewBox="0 0 64 64">` que ocupa el 78 % del
  medallón. Deja ~3 unidades de aire al borde.
- **Todos** los ids con el prefijo `${id}` que recibe la función.
- Tamaños reales: 36 px (admin), 48-56 px (paneles de logros), 88-140 px (modal).
  La silueta tiene que leerse a 36 px.

## Reglas

1. Sin `<filter>`, sin `filter:` en estilos, sin SMIL, sin animaciones inline.
2. Animación SOLO con las clases existentes de `BadgeIcon.css` (se activan
   únicamente cuando la insignia se muestra con `animated`, en el modal):
   `<g className="ba-anim anim-X">` con X ∈ spin, pulse, bob, flicker,
   twinkle, tick, orbit, sway, shake, rise, zoom, bolt, grow, wave, blink-seq,
   ring-expand, fall, rise-fade, gleam, needle, spin-fast, spin-back, flame,
   zoom-pop, dart-fly, ember, runner, twinkle-2, twinkle-3, spin-rev,
   orbit-fast. `.ba-anim` usa `transform-box: fill-box`, así que un origen en
   px se mediría desde la caja de la pieza: si lo das en coordenadas de la
   rejilla 64×64, pon también `transformBox: 'view-box'`:
   `style={{ transformBox: 'view-box', transformOrigin: '32px 32px' }}`.
   Máximo 2-3 piezas animadas por insignia. **No uses** anim-glow, anim-draw,
   anim-checkdraw, anim-dash-slide ni anim-bar (animan filter/stroke y repintan).
3. Lenguaje visual = `src/components/art/README.md` §3 (luz arriba-izquierda,
   MaterialGradient, sombra propia, borde de luz, brillo especular, destellos),
   adaptado a tamaño pequeño: **perfil oscuro teñido** (no negro) de 1,6-2,2
   del tono más oscuro del objeto para que se lea a 36 px, formas rotundas,
   poco detalle fino (nada por debajo de 0,8 de grosor).
4. Coherencia de SERIE: las insignias de una misma familia (games_5 → games_500,
   streak_2 → streak_50, rank_*, battle_*, teacher_*…) deben verse como
   escalones de una progresión: misma composición base y más riqueza / metal
   / gemas / número a medida que sube el umbral. Si la insignia cuenta algo
   (5 partidas, 30 días…), el número debe verse (cinta, placa o chapa con
   `fontFamily="Fredoka, system-ui, sans-serif"` `fontWeight="700"`).
5. Si aparece un robot, es la mascota (`src/components/RobotMascot.jsx`).

## Comprobar

```bash
node tools/art-shots.mjs --set=badge-set1 --scale=2 --out=<carpeta> [--only=games_5,games_10]
```
Muestra el dibujo antiguo, el nuevo en las 5 rarezas y el nuevo animado.
