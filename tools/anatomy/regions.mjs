// Partes externas del cuerpo (cabeza, cuello, brazo, rodilla…) a partir de los
// puntos de referencia de los huesos, en coordenadas de una vista (mm).
// La usan las láminas del cuerpo (build-anatomy.mjs) y el modelo 3D (build-anatomy-3d.mjs).
import { VIEWS } from './raster.mjs';

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function regionClassifier(ctx, view) {
  const L = ctx.landmarks();
  const v = VIEWS[view];
  const p2 = (P) => [dot(P, v.right), dot(P, v.up)];
  const pt = Object.fromEntries(Object.entries(L).filter(([, P]) => Array.isArray(P) && P.length === 3).map(([k, P]) => [k, p2(P)]));
  const segD = (p, a, b) => {
    const dx = b[0] - a[0]; const dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return [Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy), t];
  };
  const dist = (p, a) => Math.hypot(p[0] - a[0], p[1] - a[1]);
  const post = view === 'posterior';
  const sh = (Math.abs(pt.shoulderR[0]) + Math.abs(pt.shoulderL[0])) / 2;
  const il = (Math.abs(pt.iliacR[0]) + Math.abs(pt.iliacL[0])) / 2;
  const hp = (Math.abs(pt.hipR[0]) + Math.abs(pt.hipL[0])) / 2;
  const yS = pt.shoulderR[1]; const yI = pt.iliacR[1]; const yH = pt.hipR[1]; const yP = pt.pubis[1];
  const halfTrunk = (y) => {
    if (y >= yS) return sh - 22;
    if (y >= yI) return (sh - 22) + ((il + 34) - (sh - 22)) * ((yS - y) / (yS - yI));
    if (y >= yH) return il + 34 + ((hp + 52) - (il + 34)) * ((yI - y) / (yI - yH));
    return hp + 60;
  };
  return (x, y) => {
    const p = [x, y];
    if (y > pt.chin[1] - 6) return 'cabeza';
    if (y > pt.jugular[1] + 6 && Math.abs(x) < 64) return post ? 'nuca' : 'cuello';
    const side = (x < 0) === !post ? 'R' : 'L';
    const S = pt[`shoulder${side}`]; const E = pt[`elbow${side}`]; const W = pt[`wrist${side}`]; const H = pt[`hand${side}`];
    const Hp = pt[`hip${side}`]; const K = pt[`knee${side}`]; const A = pt[`ankle${side}`];
    const isArm = y < yP + 20 ? Math.abs(x) > hp + 92 : Math.abs(x) > halfTrunk(y);
    if (isArm) {
      if (dist(p, S) < 64 && y > S[1] - 75) return 'hombro';
      if (dist(p, E) < 34) return 'codo';
      if (dist(p, W) < 23) return 'muneca';
      const [dU] = segD(p, S, E); const [dF] = segD(p, E, W); const [dH, tH] = segD(p, W, H);
      if (dH < Math.min(dU, dF) && tH > 0.05) return 'mano';
      return dU < dF ? 'brazo' : 'antebrazo';
    }
    if (y > yP - 6 || Math.abs(x) < 12) {
      // tronco
      if (y > yS - 20) return Math.abs(x) > sh * 0.62 ? 'hombro' : (post ? 'espalda' : (Math.abs(x) < 64 && y > pt.jugular[1] ? 'cuello' : 'pecho'));
      if (post) {
        if (y > yI + 46) return 'espalda';
        if (y > yI - 4) return 'cintura';
        return 'nalgas';
      }
      if (y > pt.xiphoid[1] - 8) return 'pecho';
      if (dist(p, [0, pt.navel[1]]) < 15) return 'ombligo';
      if (y < yI + 28 && Math.abs(x) > il * 0.6) return 'cadera';
      return 'abdomen';
    }
    // piernas
    if (post && dist(p, pt[`heel${side}`]) < 30) return 'talon';
    if (dist(p, K) < 46) return 'rodilla';
    if (dist(p, A) < 30) return 'tobillo';
    if (y < A[1] - 18) return 'pie';
    if (post && y < yP - 4 && y > yP - 55 && Math.abs(x) < hp + 40) return 'nalgas';
    return y > K[1] ? 'muslo' : (post ? 'pantorrilla' : 'pierna');
  };
}

