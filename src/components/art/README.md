# Ilustraciones SVG de la plataforma — contrato y guía de estilo (2026)

Aplica a los iconos de curso (`icons/grade/*`), asignatura (`icons/subject/*`),
app (`icons/app/*`) y a cualquier ilustración SVG nueva de la plataforma.
Referencia de nivel de calidad: la mochila de `icons/grade/primaria.jsx`.

## 1. Forma de cada set

```jsx
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

const Lengua = () => {
  const [id, url] = useArtIds();          // ids únicos por instancia
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>… <MaterialGradient id={id('cover')} light="…" base="…" dark="…" /> …</defs>
      … <rect fill={url('cover')} /> …
    </svg>
  );
};

const ICONS = { lengua: Lengua, … };
export default ICONS;
```

- Cada icono es un componente SIN props. El tamaño lo pone el contenedor
  (`ArtFrame`), el SVG ocupa el 100 % (`className="art"`).
- viewBox: curso `0 0 80 80` (se pinta a 150-160 px sobre una tarjeta de
  degradado de color); asignatura `0 0 48 48` (58 px sobre tarjeta de cristal
  blanco o morado oscuro); app `0 0 48 48` (52-64 px, ES una baldosa: incluye su
  propio fondo redondeado).
- `useArtIds()` para TODOS los ids de `<defs>`. Nunca ids fijos.

## 2. Reglas de rendimiento (obligatorias)

1. **Prohibido** `<filter>` (feGaussianBlur, feDropShadow, feTurbulence…),
   `filter:` en estilos, `<animate>`/SMIL, `mask` animadas y `foreignObject`.
   Sombras = formas con degradado; brillos = `GlowGradient` / `GlossGradient`.
2. Solo se animan `transform` y `opacity`, y **solo con las clases de
   `src/styles/art.css`** (nada de `style={{ animation: … }}` ni keyframes propios):
   - Reposo (solo nivel de efectos alto y en pantalla): `art-i-twinkle`,
     `art-i-bob`, `art-i-sway`, `art-i-spin`, `art-i-pulse`, `art-i-blink`,
     `art-i-glow`, `art-i-flicker`. Ajustes por variables CSS en `style`:
     `--d` (retardo), `--dur` (duración), `--amp` (amplitud), `--lo`/`--hi` (glow).
   - Hover (cuando se pasa el ratón por la tarjeta): `art-h-lift`, `art-h-drop`,
     `art-h-tilt`, `art-h-tilt-r`, `art-h-pop`, `art-h-shrink`, `art-h-spin`,
     `art-h-slide`, `art-h-show` (aparece), `art-h-hide`, `art-h-wiggle`,
     `art-h-jump`, `art-h-ring`, `art-h-burst` (destello que estalla y se va).
     Variables: `--lift`, `--drop`, `--tilt`, `--pop`, `--shrink`, `--spin`,
     `--slide`, `--jump`, `--d`.
   - Origen: centro de la pieza por defecto; `art-o-bottom`, `art-o-top`,
     `art-o-left` para cambiarlo.
3. **Nunca** pongas una clase `art-i-*` y una `art-h-*` en el MISMO elemento
   (ambas usan transform): anida `<g>`.
4. Presupuesto de animación en reposo: curso ≤ 4 piezas, asignatura ≤ 2,
   app ≤ 2 (los destellos `Sparkle idle` cuentan). Lo vistoso va en hover:
   curso 3-5 piezas con coreografía, asignatura/app 1-3.
5. Complejidad estática sin miedo (es barata: se rasteriza una vez), pero
   razonable: curso ≤ ~140 elementos, asignatura/app ≤ ~70.

## 3. Lenguaje visual

- **Luz** desde arriba-izquierda. Cada volumen principal lleva:
  `MaterialGradient` (claro arriba-izq → base → oscuro abajo-der) + **sombra
  propia** (forma en el lado derecho/inferior con degradado oscuro a
  transparente, 25-45 %) + **borde de luz** (trazo blanco 35-55 % en el lado
  iluminado) + **brillo especular** (`GlossGradient` en franja o elipse) y, en
  piezas metálicas o de cristal, un **destello** puntual.
- **Contacto con el suelo**: elipse con `ShadowGradient` bajo el objeto.
- **Aura**: en curso, círculo con `GlowGradient` blanco 25-35 % detrás para
  despegar del fondo de color. En asignatura, aura del color de acento
  (sutil, 20-30 %).
- **Paleta** de la plataforma: índigo `#6366F1`, violeta `#8B5CF6`, rosa
  `#EC4899`, ámbar `#F59E0B`/`#FBBF24`, cian `#22D3EE`, esmeralda `#10B981`,
  más los colores propios de cada objeto. Saturados pero no chillones; usa
  tonos claros (`-100/-200`) para luces y oscuros (`-700/-900`) para sombras.
  Evita el negro puro: sombras en índigo/granate/verde muy oscuro.
- **Contornos**: sin trazo negro de contorno. Separación por valor y color.
  Si hace falta perfilar, trazo del tono oscuro del propio material.
- **Detalle con intención**: costuras discontinuas, remaches, reflejos,
  texturas sugeridas (líneas de papel, rejillas, marcas). Que se entienda
  a 58 px: silueta clara primero, detalle después. A 48 px no bajes de
  0,6 unidades de grosor ni de ~2 unidades de tamaño en piezas que importen.
- **Coherencia con la mascota** (robot índigo con visor oscuro, ojo derecho
  mayor, núcleo cian, antena con orbe rosa): si un icono muestra un robot,
  usa ESE robot (ver `src/components/RobotMascot.jsx`).
- **Baldosa de app** (solo `icons/app/*`): fondo `rect` 48×48 `rx=12` con
  degradado propio de la app (claro, luminoso), brillo superior suave (franja
  blanca 25-35 % en el tercio superior), borde interior de 0,8 blanco 50 % y
  una ligera viñeta inferior. El motivo central ocupa ~70 % de la baldosa.
- **Texto** dentro de los SVG: solo letras/números sueltos que formen parte
  del dibujo (A, π, 7…) con `fontFamily="Fredoka, system-ui, sans-serif"` y
  `fontWeight="700"`.

## 4. Cómo comprobar el resultado

Necesita un servidor de desarrollo en `http://localhost:5199` (`pnpm exec vite --port 5199 --strictPort`).
Capturas de la galería `/__art`:

```bash
node tools/art-shots.mjs --set=subject-set1 --out=<carpeta> --scale=2 [--only=lengua,ingles]
```

Sets: `grade-primaria`, `grade-secundaria`, `subject-set1..4`, `app-set1..3`.
La captura muestra el icono a través de su componente público (GradeCardIcon,
SubjectIcon o AppIcon), el dibujo directo, con hover forzado, sobre fondo
oscuro y un zoom. Mira la imagen (Read) y corrige hasta que se lea bien a
tamaño real. La consola de la captura lista errores de React si los hay.

Para un icono nuevo: añádelo al set que corresponda y, si es un set nuevo,
regístralo en `src/dev/art-sets.json` y en el mapa `MAPS` de `src/dev/ArtGallery.jsx`.
