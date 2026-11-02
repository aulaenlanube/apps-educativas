#!/usr/bin/env node
// Comprueba una lámina dibujada (tools/anatomy/plates-svg/<id>.svg) y genera
// dos capturas para revisarla: la ilustración sobre el fondo oscuro de la app
// y las zonas de toque coloreadas con su clave.
// Uso: node tools/anatomy/check-plate.mjs <id> [carpeta de salida]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { parsePlate, SVG_DIR } from './hand.mjs';

const [id, outArg] = process.argv.slice(2);
if (!id) { console.error('Uso: node tools/anatomy/check-plate.mjs <id> [salida]'); process.exit(1); }
const out = outArg || fs.mkdtempSync(path.join(os.tmpdir(), `plate-${id}-`));
fs.mkdirSync(out, { recursive: true });
const svg = fs.readFileSync(path.join(SVG_DIR, `${id}.svg`), 'utf8');
const { vw, vh, art, hits, errors, def } = parsePlate(id, svg);
const W = 1000; const H = Math.round((W * vh) / vw);
const bg = `<rect width="${vw}" height="${vh}" fill="#0b1626"/>`;
const inner = (s) => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const artPng = path.join(out, `${id}-art.png`);
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${W}" height="${H}">${bg}${inner(art)}</svg>`)).png().toFile(artPng);
const pal = ['#ff4d6d', '#4dabf7', '#ffd43b', '#69db7c', '#da77f2', '#ff922b', '#3bc9db', '#f783ac', '#a9e34b', '#748ffc', '#ffa94d', '#63e6be', '#e599f7', '#ffe066', '#8ce99a'];
const zones = hits.map((h, i) => `<path d="${h.d}" fill="${pal[i % pal.length]}" fill-opacity="0.55" stroke="#fff" stroke-width="${vw / 500}" fill-rule="evenodd"/>`).join('');
const hitsPng = path.join(out, `${id}-hits.png`);
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${W}" height="${H}">${bg}<g opacity="0.45">${inner(art)}</g>${zones}</svg>`)).png().toFile(hitsPng);
// Leyenda de colores (texto solo en la captura de revisión)
const legend = hits.map((h, i) => `${pal[i % pal.length]} ${h.k}`).join('\n');
console.log(`Lámina ${id}: ${hits.length} zonas · ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
console.log(legend);
console.log(errors.length ? `\n✗ ERRORES:\n- ${errors.join('\n- ')}` : '\n✓ Sin errores de contrato');
if (def) console.log(`Claves esperadas: ${def.keys.join(', ')}`);
console.log(`\nCapturas:\n${artPng}\n${hitsPng}`);
