#!/usr/bin/env node
// Deploy "B": build + empaquetar dist/ en dist.zip para subirlo al File Manager
// de Hostinger (o similar). No hace upload; lo hace el humano.
//
// Uso: npm run deploy
//
// Pasos:
//  1. Lanza los tests de seguridad (rapidos, sin DB) — aborta si fallan.
//  2. Corre `npm run build` -> genera dist/.
//  3. Empaqueta dist/ en dist.zip con el contenido en la raiz del zip.
//  4. Imprime tamano e instrucciones de subida.

import { execSync } from 'node:child_process';
import { rmSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const zipPath = path.join(root, 'dist.zip');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, shell: true });
}

function step(n, title) {
  console.log(`\n==== ${n}. ${title} ====`);
}

step(1, 'Tests de seguridad');
run('npx vitest run src/__tests__/security.test.js');

step(2, 'Build de produccion');
run('npm run build');

if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
  console.error('\nERROR: dist/ no existe despues del build.');
  process.exit(1);
}

step(3, 'Empaquetando dist/ en dist.zip');
if (existsSync(zipPath)) rmSync(zipPath);
const isWin = process.platform === 'win32';
if (isWin) {
  // PowerShell nativo de Windows — sin dependencias extra.
  run(`powershell -NoProfile -Command "Compress-Archive -Path 'dist/*' -DestinationPath 'dist.zip' -Force"`);
} else {
  // Zip desde dentro de dist/ para que el zip no tenga prefijo dist/.
  run(`cd dist && zip -rq ../dist.zip .`);
}

const sizeMB = (statSync(zipPath).size / 1024 / 1024).toFixed(2);

console.log(`\n=====================================`);
console.log(`OK  dist.zip listo (${sizeMB} MB)`);
console.log(`=====================================`);
console.log(`\nSiguientes pasos manuales:`);
console.log(`  1. Abre el File Manager de Hostinger (hPanel).`);
console.log(`  2. Entra en public_html/.`);
console.log(`  3. Borra el contenido antiguo (o muevelo a una carpeta de backup).`);
console.log(`  4. Sube dist.zip a public_html/.`);
console.log(`  5. Clic derecho -> Extract (extraer aqui). Borra el dist.zip tras extraer.`);
console.log(`  6. Verifica que index.html y el directorio assets/ estan en public_html/.\n`);
