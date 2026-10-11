/**
 * Contrato de rendimiento de las ilustraciones SVG de la plataforma
 * (src/components/art/README.md). Antes los iconos animaban decenas de piezas
 * con estilos inline, filtros y SMIL, y cada uno repintaba su SVG en cada frame:
 * la home y el catálogo iban a tirones. Estas comprobaciones evitan que vuelva.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ICONS_DIR = path.resolve(__dirname, '../components/icons');

const listJsx = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  if (e.isDirectory()) return listJsx(p);
  return /\.jsx$/.test(e.name) ? [p] : [];
});

const files = listJsx(ICONS_DIR).filter((f) => !f.endsWith('IconXSocial.jsx'));
const rel = (f) => path.relative(ICONS_DIR, f);

describe('Ilustraciones: contrato de rendimiento', () => {
  it('hay sets de iconos que comprobar', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const f of files) {
    const src = fs.readFileSync(f, 'utf-8');
    describe(rel(f), () => {
      it('no usa filtros SVG ni CSS', () => {
        expect(src).not.toMatch(/<filter\b/);
        expect(src).not.toMatch(/\bfilter=\{?["'`]url/);
        expect(src).not.toMatch(/\bfilter:\s/);
      });
      it('no usa SMIL', () => {
        expect(src).not.toMatch(/<animate(Transform|Motion)?\b/);
      });
      it('no declara animaciones inline (solo clases art-*/ba-anim)', () => {
        expect(src).not.toMatch(/animation\s*:/);
        expect(src).not.toMatch(/@keyframes/);
      });
      it('no inyecta estilos en tiempo de ejecución', () => {
        expect(src).not.toContain('document.createElement');
      });
      it('no usa ids fijos en <defs> (usa useArtIds o el prefijo recibido)', () => {
        // id="algo" literal → choques entre instancias. Los ids válidos son
        // expresiones: id={id('x')} o id={`${id}x`}.
        expect(src).not.toMatch(/\sid="[^"]+"/);
      });
    });
  }
});

describe('Ilustraciones: CSS compartido', () => {
  it('art.css define las clases de reposo y hover y se apaga fuera del nivel alto', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../styles/art.css'), 'utf-8');
    for (const k of ['art-i-twinkle', 'art-i-bob', 'art-h-lift', 'art-h-pop', 'art-float']) {
      expect(css).toContain(k);
    }
    expect(css).toMatch(/html:not\(\[data-fx="high"\]\)/);
    expect(css).toContain('.art-off');
  });
});
