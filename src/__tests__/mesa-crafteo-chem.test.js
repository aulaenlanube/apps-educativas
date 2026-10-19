// Mesa de Crafteo: química pura (valencias, fórmulas, isomorfismo, diagnóstico, geometría VSEPR).
import { describe, it, expect } from 'vitest';
import { MOLECULES, MOLECULE_BY_ID, courseRank } from '@/apps/mesa-crafteo/chem/molecules';
import { tokenInfo, lonePairs, targetValence } from '@/apps/mesa-crafteo/chem/elements';
import {
  emptyModel, addAtom, linkAtoms, cycleBond, removeAtom, atomStatus, isSaturated, attachTarget,
  hillFormula, matchesMolecule, identify, diagnose, totalCharge,
} from '@/apps/mesa-crafteo/chem/graph';
import { computeLayout, bondAngle, vec } from '@/apps/mesa-crafteo/chem/layout';

const toModel = (m) => ({
  atoms: m.atoms.map((t, i) => ({ id: i + 1, tok: t })),
  bonds: m.bonds.map(([a, b, o]) => ({ a: a + 1, b: b + 1, order: o })),
  nextId: m.atoms.length + 1,
});

// Construye como lo haría el alumno: cada token se une al átomo `parent` (índice en la receta).
function buildLike(steps) {
  let model = emptyModel();
  const ids = [];
  for (const [tok, parent] of steps) {
    const r = addAtom(model, tok, parent == null ? null : ids[parent]);
    if (!r) throw new Error(`no cabe ${tok}`);
    model = r.model; ids.push(r.id);
  }
  return { model, ids };
}

describe('catálogo de moléculas', () => {
  it('todas son estructuras de Lewis válidas (valencias y carga)', () => {
    for (const m of MOLECULES) {
      const model = toModel(m);
      expect(isSaturated(model), m.id).toBe(true);
      expect(totalCharge(model), m.id).toBe(m.charge || 0);
      for (const a of model.atoms) {
        const st = atomStatus(model, a.id);
        expect(st.ok, `${m.id} átomo ${a.tok}`).toBe(true);
      }
    }
  });

  it('la fórmula del catálogo tiene los mismos átomos que la estructura', () => {
    // Compara recuento de elementos: la fórmula escrita puede ser semidesarrollada (CH₃COOH).
    const SUB = '₀₁₂₃₄₅₆₇₈₉';
    const parse = (f) => {
      const s = f.replace(/[⁺⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/g, '').replace(/[₀-₉]/g, (d) => String(SUB.indexOf(d)));
      const count = (str) => {
        const out = {};
        const re = /([A-Z][a-z]?)(\d*)|\(([^)]+)\)(\d*)/g;
        let mm;
        while ((mm = re.exec(str))) {
          if (mm[1]) out[mm[1]] = (out[mm[1]] || 0) + (mm[2] ? +mm[2] : 1);
          else { const inner = count(mm[3]); for (const k in inner) out[k] = (out[k] || 0) + inner[k] * (mm[4] ? +mm[4] : 1); }
        }
        return out;
      };
      return count(s);
    };
    for (const m of MOLECULES) {
      const counts = {};
      m.atoms.forEach((t) => { const el = tokenInfo(t).el; counts[el] = (counts[el] || 0) + 1; });
      expect(parse(m.formula), m.id).toEqual(counts);
    }
  });

  it('ids únicos y rango de curso coherente', () => {
    expect(new Set(MOLECULES.map((m) => m.id)).size).toBe(MOLECULES.length);
    expect(courseRank('eso', 2)).toBe(2);
    expect(courseRank('bachillerato', 1)).toBe(5);
    expect(courseRank('bachillerato', 2)).toBe(6);
    expect(courseRank('primaria', 6)).toBe(1);
  });
});

describe('valencias', () => {
  it('pares solitarios VSEPR', () => {
    expect(lonePairs('O', 2)).toBe(2);
    expect(lonePairs('N', 3)).toBe(1);
    expect(lonePairs('C', 4)).toBe(0);
    expect(lonePairs('O-', 1)).toBe(3);
    expect(lonePairs('O+', 3)).toBe(1);
    expect(lonePairs('N+', 4)).toBe(0);
    expect(lonePairs('S', 4)).toBe(1); // SO₂
    expect(lonePairs('S', 6)).toBe(0);
    expect(lonePairs('Cl', 1)).toBe(3);
  });
  it('octeto expandido: S pasa de valencia 2 a 4 y 6', () => {
    expect(targetValence('S', 2)).toBe(2);
    expect(targetValence('S', 3)).toBe(4);
    expect(targetValence('S', 5)).toBe(6);
  });
  it('no deja superar la valencia máxima', () => {
    let { model, ids } = buildLike([['O', null], ['H', 0], ['H', 0]]);
    expect(addAtom(model, 'H', ids[0])).toBeNull();
    expect(addAtom(model, 'H', ids[1])).toBeNull();
    ({ model } = buildLike([['H', null]]));
    expect(addAtom(model, 'O', null)).toBeNull(); // solo una molécula en la mesa
  });
});

describe('construcción', () => {
  it('agua: O + H + H es correcta y saturada', () => {
    const { model } = buildLike([['O', null], ['H', 0], ['H', 0]]);
    expect(isSaturated(model)).toBe(true);
    expect(matchesMolecule(model, MOLECULE_BY_ID.h2o)).toBe(true);
    expect(hillFormula(model.atoms.map((a) => a.tok))).toBe('H₂O');
  });

  it('CO₂ necesita dos dobles enlaces (tocar el enlace sube el orden)', () => {
    let { model, ids } = buildLike([['C', null], ['O', 0], ['O', 0]]);
    expect(isSaturated(model)).toBe(false);
    model = cycleBond(model, ids[0], ids[1]);
    model = cycleBond(model, ids[0], ids[2]);
    expect(isSaturated(model)).toBe(true);
    expect(matchesMolecule(model, MOLECULE_BY_ID.co2)).toBe(true);
    // un tercer toque: O ya no admite triple → vuelve a sencillo
    model = cycleBond(model, ids[0], ids[1]);
    expect(model.bonds.find((b) => b.b === ids[1]).order).toBe(1);
  });

  it('N₂: 1 → 2 → 3 → 1', () => {
    let { model, ids } = buildLike([['N', null], ['N', 0]]);
    model = cycleBond(model, ids[0], ids[1]);
    model = cycleBond(model, ids[0], ids[1]);
    expect(matchesMolecule(model, MOLECULE_BY_ID.n2)).toBe(true);
    model = cycleBond(model, ids[0], ids[1]);
    expect(model.bonds[0].order).toBe(1);
  });

  it('cerrar un anillo con linkAtoms (benceno)', () => {
    const steps = [['C', null], ['C', 0], ['C', 1], ['C', 2], ['C', 3], ['C', 4]];
    let { model, ids } = buildLike(steps);
    model = linkAtoms(model, ids[5], ids[0]);
    expect(model).not.toBeNull();
    expect(linkAtoms(model, ids[5], ids[0])).toBeNull(); // ya están unidos
    for (let k = 0; k < 6; k += 2) model = cycleBond(model, ids[k], ids[k + 1]);
    for (let k = 0; k < 6; k++) { const r = addAtom(model, 'H', ids[k]); model = r.model; }
    expect(matchesMolecule(model, MOLECULE_BY_ID.c6h6)).toBe(true);
  });

  it('quitar un átomo central conserva el trozo más grande', () => {
    // H–O–O–H: quitar el primer O deja O–H (el trozo con 2 átomos)
    const { model, ids } = buildLike([['O', null], ['O', 0], ['H', 0], ['H', 1]]);
    const next = removeAtom(model, ids[0]);
    expect(next.atoms.map((a) => a.tok).sort()).toEqual(['H', 'O']);
    expect(next.bonds).toHaveLength(1);
  });

  it('attachTarget: el seleccionado o el último con huecos', () => {
    const { model, ids } = buildLike([['C', null], ['O', 0], ['H', 1]]);
    expect(attachTarget(model, ids[0])).toBe(ids[0]);
    expect(attachTarget(model, ids[2])).toBe(ids[0]); // el H está lleno → C
    expect(attachTarget(emptyModel(), null)).toBeNull();
  });
});

describe('identificación y diagnóstico', () => {
  it('distingue isómeros: etanol ≠ metoximetano', () => {
    const eth = toModel(MOLECULE_BY_ID.c2h5oh);
    expect(matchesMolecule(eth, MOLECULE_BY_ID.c2h5oh)).toBe(true);
    expect(matchesMolecule(eth, MOLECULE_BY_ID.ch3och3)).toBe(false);
    expect(identify(eth, MOLECULE_BY_ID ? MOLECULES : []).id).toBe('c2h5oh');
    const d = diagnose(eth, MOLECULE_BY_ID.ch3och3, MOLECULES);
    expect(d.kind).toBe('other-molecule');
    expect(d.other.id).toBe('c2h5oh');
  });

  it('todas las moléculas se reconocen a sí mismas aunque se numeren al revés', () => {
    for (const m of MOLECULES) {
      const n = m.atoms.length;
      const rev = { ...m, atoms: [...m.atoms].reverse(), bonds: m.bonds.map(([a, b, o]) => [n - 1 - a, n - 1 - b, o]) };
      expect(matchesMolecule(toModel(rev), m), m.id).toBe(true);
    }
  });

  it('mensajes: faltan átomos, sobran átomos y orden de enlace', () => {
    const { model, ids } = buildLike([['O', null], ['H', 0]]);
    expect(diagnose(model, MOLECULE_BY_ID.h2o).text).toMatch(/falta 1 H/);
    const extra = addAtom(addAtom(model, 'H', ids[0]).model, 'H', null);
    expect(extra).toBeNull();
    const co2single = buildLike([['C', null], ['O', 0], ['O', 0]]).model;
    expect(diagnose(co2single, MOLECULE_BY_ID.co2).kind).toBe('bond-order');
    const ch4 = toModel(MOLECULE_BY_ID.ch4);
    expect(diagnose(ch4, MOLECULE_BY_ID.nh3).text).toMatch(/sobra/);
  });

  it('isómero que no está en el catálogo', () => {
    const ether = toModel(MOLECULE_BY_ID.ch3och3);
    const d = diagnose(ether, MOLECULE_BY_ID.c2h5oh, [MOLECULE_BY_ID.c2h5oh]);
    expect(d.kind).toBe('isomer');
    expect(diagnose(toModel(MOLECULE_BY_ID.hcl), MOLECULE_BY_ID.hclo, MOLECULES).kind).toBe('other-molecule');
  });
});

describe('geometría VSEPR', () => {
  const lay = (id) => { const model = toModel(MOLECULE_BY_ID[id]); return { model, L: computeLayout(model, null, { fresh: true, display: true }) }; };
  const angle = (id) => { const { L } = lay(id); return bondAngle(L, 1, 2, 3); };

  it('ángulos característicos', () => {
    expect(angle('h2o')).toBeGreaterThan(100); expect(angle('h2o')).toBeLessThan(107);
    expect(angle('nh3')).toBeGreaterThan(103); expect(angle('nh3')).toBeLessThan(109);
    expect(angle('ch4')).toBeCloseTo(109.5, 0);
    expect(angle('co2')).toBeGreaterThan(178);
    expect(angle('bf3')).toBeCloseTo(120, 0);
    expect(angle('h2s')).toBeLessThan(97);
    expect(angle('so2')).toBeGreaterThan(110); expect(angle('so2')).toBeLessThan(122);
  });

  it('PCl₅ bipirámide y SF₆ octaedro', () => {
    const { L } = lay('sf6');
    const angs = [];
    for (let a = 2; a <= 7; a++) for (let b = a + 1; b <= 7; b++) angs.push(bondAngle(L, 1, a, b));
    expect(angs.filter((x) => Math.abs(x - 90) < 3)).toHaveLength(12);
    expect(angs.filter((x) => x > 177)).toHaveLength(3);
    const p = lay('pcl5').L;
    const pa = [];
    for (let a = 2; a <= 6; a++) for (let b = a + 1; b <= 6; b++) pa.push(bondAngle(p, 1, a, b));
    expect(pa.filter((x) => Math.abs(x - 120) < 3)).toHaveLength(3);
    expect(pa.filter((x) => Math.abs(x - 90) < 3)).toHaveLength(6);
  });

  it('benceno y eteno son planos', () => {
    for (const id of ['c6h6', 'c2h4']) {
      const { L } = lay(id);
      const zs = Object.values(L.pos).map((p) => p[2]);
      expect(Math.max(...zs) - Math.min(...zs), id).toBeLessThan(0.15);
    }
  });

  it('el ciclohexano no es plano (silla)', () => {
    const { L } = lay('c6h12');
    const ring = [1, 2, 3, 4, 5, 6].map((id) => L.pos[id][2]);
    expect(Math.max(...ring) - Math.min(...ring)).toBeGreaterThan(0.25);
  });

  it('construcción incremental: el agua acaba angular y sin solapes', () => {
    let model = emptyModel();
    let L = null;
    let r = addAtom(model, 'O'); model = r.model; const o = r.id; L = computeLayout(model, L);
    expect(L.dom[o].slots).toHaveLength(2);
    expect(L.dom[o].lps).toHaveLength(2);
    r = addAtom(model, 'H', o); model = r.model; L = computeLayout(model, L);
    r = addAtom(model, 'H', o); model = r.model;
    for (let k = 0; k < 6; k++) L = computeLayout(model, L);
    const ids = model.atoms.map((a) => a.id);
    const ang = bondAngle(L, o, ids[1], ids[2]);
    expect(ang).toBeGreaterThan(98); expect(ang).toBeLessThan(110);
    expect(L.dom[o].slots).toHaveLength(0);
  });

  it('ninguna molécula del catálogo tiene átomos solapados', () => {
    for (const m of MOLECULES) {
      const model = toModel(m);
      const L = computeLayout(model, null, { fresh: true, display: true });
      const ps = Object.values(L.pos);
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          expect(vec.len(vec.sub(ps[i], ps[j])), `${m.id} ${i}-${j}`).toBeGreaterThan(0.55);
        }
      }
    }
  });
});
