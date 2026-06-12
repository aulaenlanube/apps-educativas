# Contrato de escenas — Laboratorio de Física 3D

Cada simulación es UN fichero en `scenes/<id>.jsx` que exporta por defecto un
objeto `simDef`. La escena de referencia es [scenes/caida-libre.jsx](scenes/caida-libre.jsx):
**léela entera antes de escribir una escena nueva** y copia su estructura.

## Reglas de oro

1. **Física determinista a paso fijo.** Toda la física avanza dentro de
   `useFixedStep(world, playing, speed, stepFn)` a 1/120 s. NUNCA uses el
   `delta` del frame para integrar física.
2. **El estado vive en `world`, no en React.** `world = { t, _acc, data }` lo
   crea el shell y SOBREVIVE a los remounts del Canvas (cambio de calidad,
   pérdida de contexto). Inicializa con una función `reinit(world, params)` en
   `useEffect [world, resetToken]` y, si cambian condiciones iniciales en
   pausa, también con `useEffect [playing, params.X...]` (solo cuando
   `!playing`).
3. **Las magnitudes medibles salen de la física/fórmula analítica**, jamás de
   la estadística de partículas visuales ni del framerate. El
   `quality.particleBudget` solo escala CUÁNTAS partículas se ven.
4. **Objetos rápidos = imperativos.** La bola/carro/masa se mueve con
   `ref.current.position... ` dentro de `useFrame`. Los vectores y textos son
   declarativos y se refrescan con `useThrottledTick(12)`.
5. **`onTelemetry(tel)` en cada frame** (el shell ya throttlea la UI). Formato:
   ```js
   {
     t,                      // reloj de simulación (s)
     done,                   // true cuando la simulación termina (si aplica)
     readouts: [{ label, value, unit, decimals? }],   // 3-5 lecturas
     series: { clave: valor },   // solo si simDef.graficas existe
     formulaViva: 'F = μ·N = 0,3 · 19,6 = 5,88 N',    // con fmt() y coma decimal
     extra: { ... },         // valores propios para los checks de retos
   }
   ```
6. **Texto SIEMPRE en español, números con `fmt()`** (coma decimal). Unidades SI.
7. **Nada de assets externos** (texturas, modelos): geometría procedural y
   materiales planos. Sombras solo si `quality.shadows`.
8. **RNG solo con `mulberry32`** (de `engine/rng.js`), nunca `Math.random()`.

## Forma del simDef

```js
const simDef = {
  id: 'kebab-case',                 // = nombre del fichero
  nombre: 'Nombre visible',
  icono: '🍎',                      // un emoji
  descripcion: 'Una frase.',
  curso: { level: 'eso'|'bachillerato', grade: n },  // primer curso evaluable
  esAmpliacion: false,              // true → visible pero NUNCA en examen
  ampliacionEn: null,               // opcional {level, grade}: visible antes como "Ampliación"
  usaTrayectoria: true,             // false oculta el toggle
  usaVectores: true,                // false oculta el toggle
  paramsDef: [                      // 3-5 parámetros
    { key, label, min, max, step, def, unit, decimals? },            // slider
    { key, label, type: 'select', def, options: [{ value, label }] },// pills
    { key, label, type: 'toggle', def: false },                      // switch
  ],
  graficas: [{ key, label, color }] | null,   // claves de tel.series
  formulas: [{ titulo, expr, leyenda }],      // para el Formulario
  fondo: (params) => '#0b1026',     // color de fondo del Canvas
  camara: { position: [x, y, z], fov: 45 },
  controles: { target: [x, y, z], maxDistance: n },
  Scene,                            // ver props abajo
  retos: [                          // 3-4 retos ALCANZABLES (verifica los números)
    { id, titulo, descripcion, pista, check: (tel, params) => bool },
  ],
  examTemplates: [                  // 4 plantillas con explica
    {
      id,
      generar: (rng) => ({
        enunciado,                  // con los números ya sustituidos
        tipo: 'numerica' | 'opciones',
        // numerica:
        unidad, respuesta, toleranciaAbs,
        // opciones:
        opciones: ['...'], correcta: idx,
        simParams: { ... },         // configuración para la fase Observa
        simDuracion: segundos,      // cuánto se reproduce la simulación
        explica: { pregunta, opciones: [3], correcta: idx },
      }),
    },
  ],
};
export default simDef;
```

## Props del componente Scene

```jsx
function Scene({ world, params, playing, speed, resetToken, showVectors,
                 showTrajectory, quality, onTelemetry })
```

- `params`: valores actuales (¡pueden cambiar EN VIVO! — usa `paramsRef`).
- `quality`: `{ tier, particleBudget, shadows }`.
- La cámara/luces/fondo los pone el shell (`SimViewport`); la escena solo
  renderiza su contenido (suelo incluido).

## Checklist antes de dar una escena por terminada

- [ ] Los 4 examTemplates calculan `respuesta` con la MISMA física que la
      simulación enseña (verifica un caso a mano).
- [ ] `simParams` de cada plantilla reproduce exactamente el enunciado.
- [ ] Los retos son alcanzables con los rangos de `paramsDef` (haz la cuenta).
- [ ] `reinit` deja el estado coherente con los `params` actuales.
- [ ] Sin `Math.random`, sin `Date.now`, sin texturas, sin estado React por frame.
- [ ] Escala visual razonable (escena cabe en ~±15 unidades, cámara la encuadra).
