// Personas y grupos del mundo falso (SOLO desarrollo).
import { mockId, rngFor, pick, randInt, toUsername, daysAgo } from './util.js';

export const IDS = {
  teacherEdu: mockId('7ea0', 1),
  teacherLaura: mockId('7ea0', 2),
  teacherCarmen: mockId('7ea0', 3),
  freeMarta: mockId('f4ee', 1),
  group1A: mockId('6400', 1),
  group3B: mockId('6400', 2),
  group2Bach: mockId('6400', 3),
  groupClub: mockId('6400', 4),
  lucia: mockId('5700', 1),
};

export const MOCK_STUDENT_TOKEN = 'dev-mock-student-session-token';

// Mismas listas que StudentProfileEditor (emoji + gradiente de fondo).
const EMOJIS = ['🎓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄', '🐲', '🦋', '🌟', '🚀', '⚽', '🎨', '🎵', '📚', '🦈', '🐧', '🦉', '🐝', '🌈', '🎮', '🏆', '💎', '🔥', '⚡', '🍕', '🌍', '🎯', '🧩', '🤖', '👾'];
const COLORS = [
  'from-blue-500 to-purple-500', 'from-pink-500 to-rose-500', 'from-green-500 to-emerald-500',
  'from-orange-500 to-amber-500', 'from-cyan-500 to-blue-500', 'from-violet-500 to-fuchsia-500',
  'from-red-500 to-orange-500', 'from-teal-500 to-cyan-500', 'from-indigo-500 to-blue-500',
  'from-yellow-400 to-orange-500', 'from-slate-600 to-slate-800', 'from-rose-400 to-purple-500',
];
// Avatares que un alumno "normal" suele tener equipados (comunes/raros/épicos).
const COMMON_AVATARS = ['avatar_031', 'avatar_082', 'avatar_090', 'avatar_083', 'avatar_085', 'avatar_071', 'avatar_077', 'avatar_084', 'avatar_086', 'avatar_087'];
const RARE_AVATARS = ['avatar_005', 'avatar_019', 'avatar_043', 'avatar_026', 'avatar_017', 'avatar_093', 'avatar_024', 'avatar_009'];
const EPIC_AVATARS = ['avatar_013', 'avatar_018', 'avatar_036', 'avatar_002'];

const FIRST_NAMES = [
  'Sofía', 'Martina', 'María', 'Julia', 'Daniela', 'Alba', 'Lola', 'Vega', 'Carmen', 'Inés', 'Blanca',
  'Ainhoa', 'Elena', 'Marta', 'Laia', 'Olivia', 'Abril', 'Candela', 'Zoe', 'Jimena', 'Rocío', 'Lara',
  'Martín', 'Lucas', 'Mateo', 'Leo', 'Alejandro', 'Manuel', 'Álvaro', 'Marc', 'Javier', 'Izan',
  'Nicolás', 'Rubén', 'Sergio', 'Joel', 'Héctor', 'Rodrigo', 'Samuel', 'Aarón', 'Óscar', 'Jorge',
];
const SURNAMES = [
  'García', 'Martínez', 'Sánchez', 'González', 'Pérez', 'Rodríguez', 'Fernández', 'Gómez', 'Ruiz',
  'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Blanco', 'Delgado',
  'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos',
  'Lozano', 'Guerrero', 'Méndez', 'Cruz', 'Calvo', 'Gallego', 'Cabrera', 'Flores', 'Campos', 'Fuentes',
  'Carrasco', 'Reyes', 'Caballero', 'Nieto', 'Aguilar', 'Montero', 'Ibáñez', 'Giménez', 'Mompó', 'Ferrando',
];

// 3º ESO B (el grupo de Lucía) va escrito a mano: sus nombres aparecen en
// duelos, chats y batallas, así que conviene que sean estables y legibles.
const ROSTER_3B = [
  'Lucía Martín', 'Hugo Navarro', 'Álex Romero', 'Daniel Castro', 'Paula Sanz', 'Mario Gil',
  'Sara Vidal', 'Bruno Ortiz', 'Claudia Vega', 'Marcos León', 'Noa Ferrer', 'Enzo Prieto',
  'Iker Ramos', 'Martina López', 'Carla Benítez', 'Adrián Molina', 'Valeria Cano', 'Javier Peña',
  'Aitana Climent', 'Diego Serrano', 'Irene Puig', 'Gonzalo Ribes', 'Nerea Pascual', 'Thiago Herrera',
  'Emma Soler',
];
const NEEDS_PASSWORD_3B = new Set(['Gonzalo Ribes', 'Emma Soler']);

export const GROUP_DEFS = [
  {
    key: '1A', id: IDS.group1A, name: '1º ESO A', description: 'Matemáticas · grupo de mañana',
    level: 'eso', grade: '1', subject_id: 'matematicas', group_code: 'GRP-1A42',
    ownerId: IDS.teacherEdu, createdDaysAgo: 36, size: 24, fixedNames: ['Pablo Ortega'],
  },
  {
    key: '3B', id: IDS.group3B, name: '3º ESO B', description: 'Lengua Castellana y Literatura',
    level: 'eso', grade: '3', subject_id: 'lengua', group_code: 'GRP-3B7K',
    ownerId: IDS.teacherEdu, createdDaysAgo: 35, size: ROSTER_3B.length,
    coTeacherIds: [IDS.teacherLaura],
  },
  {
    key: '2BACH', id: IDS.group2Bach, name: '2º Bachillerato', description: 'Historia de España · preparación PAU',
    level: 'bachillerato', grade: '2', subject_id: 'historia-espana', group_code: 'GRP-2B9H',
    ownerId: IDS.teacherCarmen, createdDaysAgo: 33, size: 22, coTeacherIds: [IDS.teacherEdu],
  },
];

export function buildTeachers(now) {
  const base = {
    bio: null, website: null, specialty: null, center_name: null, education_levels: [],
    avatar_color: 'from-blue-500 to-purple-500', selected_avatar_code: null,
  };
  const edu = {
    ...base,
    id: IDS.teacherEdu,
    role: 'teacher',
    display_name: 'Edu Torregrosa',
    email: 'edu.torregrosa@example.com',
    teacher_code: 'EDUT-4821',
    avatar_emoji: '👨‍🏫',
    avatar_color: 'from-violet-500 to-fuchsia-500',
    selected_avatar_code: 'avatar_017',
    bio: 'Profe de Lengua y Matemáticas en la ESO. Me encanta gamificar el aula y ver a la clase picarse en las batallas.',
    website: 'https://example.com/aula-edu',
    specialty: 'Lengua Castellana y Literatura',
    center_name: 'IES Las Acacias (Valencia)',
    education_levels: ['eso', 'bachillerato'],
    timezone: 'Europe/Madrid',
    created_at: daysAgo(now, 410, 18, 5),
    updated_at: daysAgo(now, 6, 21, 40),
  };
  const laura = {
    ...base, id: IDS.teacherLaura, role: 'teacher', display_name: 'Laura Gómez', email: 'laura.gomez@example.com',
    teacher_code: 'LAGO-5521', avatar_emoji: '👩‍🏫', created_at: daysAgo(now, 220), updated_at: daysAgo(now, 20),
  };
  const carmen = {
    ...base, id: IDS.teacherCarmen, role: 'teacher', display_name: 'Carmen Llopis', email: 'carmen.llopis@example.com',
    teacher_code: 'CALL-3307', avatar_emoji: '📜', created_at: daysAgo(now, 300), updated_at: daysAgo(now, 40),
  };
  const marta = {
    ...base, id: IDS.freeMarta, role: 'free', display_name: 'Marta Ruiz', email: 'marta.ruiz@example.com',
    teacher_code: null, avatar_emoji: '🦉', avatar_color: 'from-orange-500 to-amber-500',
    created_at: daysAgo(now, 58, 19, 12), updated_at: daysAgo(now, 3),
  };
  return { edu, laura, carmen, marta };
}

function generateNames(r, count, taken) {
  const out = [];
  let guard = 0;
  while (out.length < count && guard < 1000) {
    guard += 1;
    const name = `${pick(r, FIRST_NAMES)} ${pick(r, SURNAMES)}`;
    if (taken.has(name)) continue;
    taken.add(name);
    out.push(name);
  }
  return out;
}

function avatarFor(r, name) {
  if (name === 'Lucía Martín') {
    return { avatar_emoji: '🦊', avatar_color: 'from-violet-500 to-fuchsia-500', selected_avatar_code: 'avatar_005' };
  }
  const x = r();
  let selected = null;
  if (x < 0.22) selected = pick(r, COMMON_AVATARS);
  else if (x < 0.36) selected = pick(r, RARE_AVATARS);
  else if (x < 0.42) selected = pick(r, EPIC_AVATARS);
  return { avatar_emoji: pick(r, EMOJIS), avatar_color: pick(r, COLORS), selected_avatar_code: selected };
}

/** Devuelve { groups: [def+rows], students: [...], byGroup: Map, byId: Map }. */
export function buildRosters(now) {
  const taken = new Set(ROSTER_3B);
  const students = [];
  const byGroup = new Map();
  const counter = { n: 1 };

  for (const g of GROUP_DEFS) {
    const r = rngFor(`roster:${g.key}`);
    let names;
    if (g.key === '3B') names = ROSTER_3B.slice();
    else {
      const fixed = g.fixedNames || [];
      fixed.forEach((n) => taken.add(n));
      names = [...fixed, ...generateNames(r, g.size - fixed.length, taken)];
    }
    const list = names.map((display_name, idx) => {
      const id = display_name === 'Lucía Martín' ? IDS.lucia : mockId('5700', (counter.n += 1));
      const av = avatarFor(r, display_name);
      const needsPassword = g.key === '3B' ? NEEDS_PASSWORD_3B.has(display_name) : (g.key === '1A' && idx === 17);
      const skill = display_name === 'Lucía Martín' ? 0.9 : 0.42 + (r() * 0.55);
      return {
        id,
        username: toUsername(display_name),
        display_name,
        ...av,
        password_hash: needsPassword ? null : '$2a$06$devmock.hash.no.real',
        created_at: daysAgo(now, g.createdDaysAgo - 1, 9, randInt(r, 0, 59)),
        group_id: g.id,
        group_key: g.key,
        skill,
      };
    });
    // get_group_students ordena por display_name
    list.sort((a, b) => a.display_name.localeCompare(b.display_name, 'es'));
    byGroup.set(g.id, list);
    students.push(...list);
  }
  const byId = new Map(students.map((s) => [s.id, s]));
  return { students, byGroup, byId };
}
