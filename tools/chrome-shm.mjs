// Dónde pone Chrome su memoria compartida. Puppeteer añade por defecto
// --disable-dev-shm-usage, que la manda a /tmp: pensado para Docker, donde
// /dev/shm mide 64 MB. En el portátil /tmp es un tmpfs con cuota por usuario
// (systemd) y, cuando se llena, Chrome no puede reservar memoria compartida y
// sus procesos mueren en bucle con SIGTRAP. Así que usamos /dev/shm siempre
// que sea grande, y solo caemos a /tmp cuando es diminuto.
import fs from 'node:fs';

const MIN_SHM_BYTES = 512 * 1024 * 1024;

function shmIsLarge() {
  try {
    const s = fs.statfsSync('/dev/shm');
    return s.bavail * s.bsize >= MIN_SHM_BYTES;
  } catch {
    return false;
  }
}

// Opciones para puppeteer.launch(); `args` son los argumentos propios del script.
export function chromeLaunchOpts(args = []) {
  if (shmIsLarge()) {
    return {
      args: args.filter((a) => a !== '--disable-dev-shm-usage'),
      ignoreDefaultArgs: ['--disable-dev-shm-usage'],
    };
  }
  return { args: [...new Set([...args, '--disable-dev-shm-usage'])] };
}
