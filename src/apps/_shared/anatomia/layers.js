// Capas del cuerpo entero para el deslizador «Capas» del atlas: de fuera
// adentro. Las láminas de cuerpo entero (frame: 'body' en el índice) comparten
// encuadre, así que se pueden fundir una con la siguiente. Cada base + '-a'
// (de frente), '-p' (de espaldas) o '-l' (de lado) es una lámina; la pila de
// una vista son las que existan en el índice (y en el atlas del curso), en
// este orden.
// Funciones puras (tests en src/__tests__/cuerpo-humano-extras.test.js).

export const LAYER_BASES = ['cuerpo', 'mus', 'mus-prof', 'org', 'org-prof', 'esq'];

export const viewOfPlate = (id) => {
  const m = /-([apl])$/.exec(String(id));
  return m ? m[1] : 'a';
};
export const layerBase = (id) => String(id).replace(/-[apl]$/, '');
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Láminas de la pila de una vista ('a' | 'p' | 'l') que existen y que acepta `ok`
// (solo las del mismo tamaño que la primera: se pintan una encima de otra).
export function layerStack(index, view, ok = () => true) {
  const ids = LAYER_BASES
    .map((b) => `${b}-${view}`)
    .filter((id) => index?.plates?.[id]?.frame === 'body' && ok(id));
  const first = index?.plates?.[ids[0]];
  return ids.filter((id) => index.plates[id].w === first.w && index.plates[id].h === first.h);
}

// Pila a la que pertenece una lámina (null si no es una capa o si queda sola).
export function stackFor(index, id, ok = () => true) {
  if (!id || !LAYER_BASES.includes(layerBase(id)) || index?.plates?.[id]?.frame !== 'body' || !ok(id)) return null;
  const s = layerStack(index, viewOfPlate(id), ok);
  return s.length >= 2 && s.includes(id) ? s : null;
}

// Opacidad de cada capa para un valor v ∈ [0, n-1] del deslizador. Entre dos
// capas, la de dentro aparece debajo enseguida (primer tercio) y la de fuera se
// desvanece encima de forma lineal: se "pela" el cuerpo sin ver el hueco entre
// las dos. En un valor entero solo se ve esa capa.
export function layerMix(v, n) {
  if (n <= 0) return [];
  const out = new Array(n).fill(0);
  if (n === 1) {
    out[0] = 1;
    return out;
  }
  const x = clamp(Number(v) || 0, 0, n - 1);
  const i = Math.min(Math.floor(x), n - 2);
  const t = x - i;
  out[i] = 1 - t;
  out[i + 1] = Math.min(1, 3 * t);
  return out;
}

// Capa dominante (la que más se ve): sus zonas son las tocables y su ficha la que se muestra.
export const dominantLayer = (v, n) => (n > 0 ? clamp(Math.round(Number(v) || 0), 0, n - 1) : 0);

// Siguiente capa entera hacia dentro (dir > 0) o hacia fuera (dir < 0).
export function stepLayer(v, dir, n) {
  const x = Number(v) || 0;
  const to = dir > 0 ? Math.floor(x + 1e-6) + 1 : Math.ceil(x - 1e-6) - 1;
  return clamp(to, 0, Math.max(0, n - 1));
}

// Estado compartido del deslizador (valor y lupa) para el fondo del atlas sin
// re-pintar todo el atlas en cada movimiento (useSyncExternalStore).
export function createMixStore(init = {}) {
  let state = { v: 0, lens: null, ...init };
  const subs = new Set();
  return {
    get: () => state,
    set(patch) {
      const next = { ...state, ...patch };
      if (Object.keys(next).every((k) => next[k] === state[k])) return;
      state = next;
      subs.forEach((f) => f());
    },
    subscribe(f) {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
}
