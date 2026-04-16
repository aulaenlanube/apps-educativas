#!/usr/bin/env node
// Deploy end-to-end a Hostinger via SSH.
//
// Flujo:
//   1. Tests de seguridad (aborta si fallan).
//   2. `npm run build` -> dist/.
//   3. Empaqueta dist/ en dist.tar.gz (contenido en la raiz del tar).
//   4. scp a domains/apps-educativas.com/.
//   5. Swap atomico en el servidor:
//        - Extrae en public_html.new/
//        - Renombra el public_html actual a public_html.old-STAMP
//        - Renombra public_html.new a public_html
//        - Deja solo los 2 rollbacks mas recientes.
//   6. Limpieza local.
//
// Requiere: alias SSH `hostinger-wp` configurado en ~/.ssh/config.

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, statSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const tarPath = path.join(root, 'dist.tar.gz');

const SSH_HOST = 'hostinger-wp';
const REMOTE_BASE = 'domains/apps-educativas.com';
const STAMP = new Date().toISOString().replace(/[:.]/g, '').replace('T', '-').slice(0, 15);

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
  console.error('\nERROR: dist/ no existe tras el build.');
  process.exit(1);
}

step(3, 'Empaquetando dist/ en dist.tar.gz');
if (existsSync(tarPath)) rmSync(tarPath);
run(`tar czf dist.tar.gz -C dist .`);
const sizeMB = (statSync(tarPath).size / 1024 / 1024).toFixed(2);
console.log(`  ${sizeMB} MB`);

step(4, `Subiendo a ${SSH_HOST}:${REMOTE_BASE}/`);
run(`scp dist.tar.gz ${SSH_HOST}:${REMOTE_BASE}/dist.tar.gz`);

step(5, 'Swap atomico en el servidor');
// Script remoto. `set -eu` aborta ante cualquier fallo o variable no definida.
const remoteScript = `set -eu
cd ${REMOTE_BASE}
rm -rf public_html.new
mkdir public_html.new
tar xzf dist.tar.gz -C public_html.new/
if [ -d public_html ]; then
  mv public_html public_html.old-${STAMP}
fi
mv public_html.new public_html
rm -f dist.tar.gz
# Mantener solo los 2 rollbacks mas recientes (directorios + tarballs legacy)
ls -1td public_html.old-* 2>/dev/null | tail -n +3 | xargs -r rm -rf
ls -1td public_html.bak-*.tar.gz 2>/dev/null | tail -n +3 | xargs -r rm -f
echo
echo "--- public_html tras el swap ---"
ls -la public_html | head -10
echo
echo "--- rollbacks disponibles ---"
ls -1td public_html.old-* 2>/dev/null || true
`;

const sshResult = spawnSync('ssh', [SSH_HOST, 'bash', '-s'], {
  input: remoteScript,
  stdio: ['pipe', 'inherit', 'inherit'],
  cwd: root,
});
if (sshResult.status !== 0) {
  console.error('\nERROR: el paso remoto fallo.');
  process.exit(sshResult.status || 1);
}

step(6, 'Limpieza local');
rmSync(tarPath);

console.log('\n=====================================');
console.log('OK  apps-educativas.com actualizado.');
console.log('=====================================');
console.log('Hard-refresh (Ctrl+Shift+R) para ver los cambios.');
console.log(`Rollback: ssh ${SSH_HOST} 'cd ${REMOTE_BASE} && rm -rf public_html && mv public_html.old-${STAMP} public_html'\n`);
