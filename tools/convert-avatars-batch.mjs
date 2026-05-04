import sharp from 'sharp';
import { copyFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Mapa: número avatar → ruta del PNG original (en raíz)
const map = {
  106: 'ChatGPT Image 4 may 2026, 11_36_17.png',  // Mozart (mythic)
};

for (const [n, file] of Object.entries(map)) {
  const src = join(ROOT, file);
  if (!existsSync(src)) {
    console.error(`MISSING: ${src}`);
    process.exit(1);
  }
  for (const size of [512, 256, 128]) {
    const out = join(ROOT, 'public', 'images', 'avatar', String(size), `avatar-${n}.webp`);
    await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 90 })
      .toFile(out);
    console.log(`OK ${size}px -> avatar-${n}.webp`);
  }
  const origDest = join(ROOT, 'tools', 'avatar-sources', '_originals', `avatar-${n}.png`);
  copyFileSync(src, origDest);
  unlinkSync(src);
  console.log(`OK original guardado: avatar-${n}.png`);
}
console.log('\nDone.');
