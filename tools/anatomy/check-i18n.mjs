#!/usr/bin/env node
// Comprueba las traducciones de src/apps/_shared/anatomia/i18n/<lang>.js:
// cada estructura con p/f/act/ori/ins en castellano debe tenerlos traducidos (y nada más).
// Uso: node tools/anatomy/check-i18n.mjs en|va
import { STRUCTURES } from '../../src/apps/_shared/anatomia/data/structures.js';

const lang = process.argv[2];
if (!['en', 'va'].includes(lang)) { console.error('Uso: node tools/anatomy/check-i18n.mjs en|va'); process.exit(1); }
const { default: T } = await import(`../../src/apps/_shared/anatomia/i18n/${lang}.js?t=${Date.now()}`);
const missing = []; const extra = [];
let total = 0;
for (const s of STRUCTURES) {
  for (const f of ['p', 'f', 'act', 'ori', 'ins']) {
    if (!s[f]) { if (T[s.k]?.[f]) extra.push(`${s.k}.${f}`); continue; }
    total += 1;
    const v = T[s.k]?.[f];
    if (!v || typeof v !== 'string' || !v.trim()) missing.push(`${s.k}.${f}`);
  }
}
for (const k of Object.keys(T)) if (!STRUCTURES.some((s) => s.k === k)) extra.push(`${k} (clave desconocida)`);
console.log(`${lang}: ${total - missing.length}/${total} textos`);
if (missing.length) console.log(`Faltan (${missing.length}): ${missing.join(', ')}`);
if (extra.length) console.log(`Sobran (${extra.length}): ${extra.join(', ')}`);
process.exit(missing.length || extra.length ? 1 : 0);
