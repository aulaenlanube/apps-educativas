// Repertorio de "números" de la mascota (RobotMascot). Cada número es una
// animación corta y graciosa que el director de escena del robot lanza de vez en
// cuando mientras nadie interactúa con él, o que una pantalla pide a propósito
// (p. ej. pulsar el botón de la tragaperras).
//
//   dur     duración total en ms (las animaciones CSS usan --act-dur)
//   lines   frases del bocadillo; cada entrada es un texto o [momento 0..1, texto]
//           para cambiar de frase a mitad del número (dormirse → despertarse)
//   eyes    expresión de los ojos durante el número (ver RobotMascot)
//   mouth   expresión de la boca
//   prop    accesorio que aparece (libro, gafas, pizarra, mando, dados, trofeo…)
export const ACTS = {
  // ---------- Generales ----------
  wave: { dur: 2400, eyes: 'happy', mouth: 'grin', lines: ['¡Hola! 👋', '¡Hey, qué tal!', '¡Bienvenido!', '¡Hola, crack!'] },
  dance: { dur: 3800, eyes: 'happy', mouth: 'grin', prop: 'notes', lines: ['♪ Robo-baile ♪', '¡Mira qué pasos!', '♫ Uno, dos, tres… ♫'] },
  flip: { dur: 1800, eyes: 'stars', mouth: 'open', prop: 'sparkles', lines: ['¡Voltereta!', '¡Hop!', '¡Diez puntos!'] },
  sneeze: { dur: 2700, eyes: 'squint', mouth: 'open', prop: 'puff', lines: [[0, 'Ah… ah…'], [0.45, '¡ACHÍS! 🤧'], [0.8, 'Perdón…']] },
  sleep: { dur: 5600, eyes: 'closed', mouth: 'flat', prop: 'zzz', lines: [[0, 'Zzz…'], [0.74, '¡¿Eh?! ¡Estoy despierto!']] },
  juggle: { dur: 4000, eyes: 'focus', mouth: 'grin', prop: 'balls', lines: ['¡Malabares!', 'Ni se me caen…', '¡Tachán!'] },
  idea: { dur: 2800, eyes: 'stars', mouth: 'open', prop: 'bulb', lines: ['¡Tengo una idea!', '¡Eureka!', '¡Ya lo tengo!'] },
  scan: { dur: 3400, eyes: 'scan', mouth: 'flat', prop: 'radar', lines: ['Escaneando…', 'Analizando datos…', 'Buscando cerebritos…'] },
  love: { dur: 2800, eyes: 'hearts', mouth: 'grin', prop: 'hearts', lines: ['¡Me encanta aprender!', '💜💜💜', '¡Te quiero, estudiante!'] },
  rocket: { dur: 3000, eyes: 'focus', mouth: 'open', prop: 'boost', lines: ['¡Turbo!', '¡Despegue! 🚀', '¡Modo cohete!'] },
  spin: { dur: 2200, eyes: 'dizzy', mouth: 'wavy', lines: [[0, '¡Wiii!'], [0.55, 'Uy… me he mareado.']] },
  guitar: { dur: 3800, eyes: 'closed', mouth: 'grin', prop: 'guitar', lines: ['¡Solo de guitarra! 🎸', '¡Rock and robot!', '♪ Yeah! ♪'] },
  selfie: { dur: 3000, eyes: 'happy', mouth: 'grin', prop: 'phone', lines: [[0, '¡Una foto!'], [0.45, '¡Patata! 📸'], [0.75, '¡Salgo genial!']] },

  // ---------- Selector de asignaturas ----------
  read: { dur: 4400, eyes: 'read', mouth: 'flat', prop: 'book', lines: ['Mmm… interesante.', '¡Qué buen libro!', 'Capítulo 3: los robots…'] },
  glasses: { dur: 3600, eyes: 'focus', mouth: 'grin', prop: 'glasses', lines: ['Modo profe: ON 🤓', 'A ver, a ver…', '¡Silencio en clase!'] },
  chalk: { dur: 4400, eyes: 'focus', mouth: 'grin', prop: 'chalkboard', lines: ['2 + 2 = 4 ✔', '¡Apuntad esto!', 'Esto entra en el examen 😉'] },

  // ---------- Selector de apps ----------
  game: { dur: 4000, eyes: 'focus', mouth: 'grin', prop: 'gamepad', lines: ['¡Combo x10!', '¡Nuevo récord!', 'Un nivel más…'] },
  dice: { dur: 2900, eyes: 'stars', mouth: 'open', prop: 'dice', lines: ['¡Seis!', '¿Probamos suerte?', '¡Doble seis!'] },
  trophy: { dur: 3200, eyes: 'happy', mouth: 'grin', prop: 'trophy', lines: ['¡Campeón! 🏆', '¡Para la vitrina!'] },

  // ---------- Tragaperras (los pide la página) ----------
  press: { dur: 900, eyes: 'focus', mouth: 'grin', lines: ['¡Allá va!', '¡Dale!'] },
  watch: { dur: 60000, eyes: 'watch', mouth: 'open', lines: ['¿Cuál saldrá…?', 'Rueda, rueda…'] },
  cheer: { dur: 2600, eyes: 'stars', mouth: 'grin', prop: 'confetti', lines: ['¡Premio!', '¡Esa me encanta!', '¡A jugar!'] },
};

// Números que el robot alterna solo en cada pantalla.
export const CONTEXT_ACTS = {
  home: ['wave', 'dance', 'flip', 'sneeze', 'sleep', 'juggle', 'idea', 'scan', 'love', 'rocket', 'spin', 'guitar', 'selfie'],
  subjects: ['read', 'glasses', 'chalk', 'idea', 'wave', 'juggle', 'scan', 'sneeze', 'spin', 'dance'],
  apps: ['game', 'dice', 'trophy', 'dance', 'flip', 'rocket', 'love', 'sleep', 'sneeze', 'guitar', 'selfie'],
};

export const pick = (list) => list[Math.floor(Math.random() * list.length)];
