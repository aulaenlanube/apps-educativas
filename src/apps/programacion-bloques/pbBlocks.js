// Catálogo de bloques para "Programa al Robot".
// Todos los niveles mueven un robot por una cuadrícula, pero a partir de
// 4º ESO aparecen variables, condiciones avanzadas y funciones.

export const GRADE_LABELS = {
  1: '1º Primaria', 2: '2º Primaria', 3: '3º Primaria', 4: '4º Primaria',
  5: '5º Primaria', 6: '6º Primaria',
  7: '1º ESO', 8: '2º ESO', 9: '3º ESO', 10: '4º ESO',
  11: '1º Bach', 12: '2º Bach',
};
export function gradeIdFromParams(level, grade) {
  const g = parseInt(grade, 10);
  if (level === 'primaria') return g;
  if (level === 'eso') return 6 + g;
  if (level === 'bachillerato') return 10 + g;
  return 1;
}

// Sensores y condiciones predefinidas (para if/while simples, hasta 3º ESO)
export const SENSORS = [
  { value: 'canMove',       label: 'puedo avanzar' },
  { value: 'obstacleAhead', label: 'hay muro delante' },
  { value: 'itemHere',      label: 'hay objeto aquí' },
  { value: 'crateAhead',    label: 'hay caja delante' },
  { value: 'onTarget',      label: 'estoy en la meta' },
  { value: 'notOnTarget',   label: 'no estoy en la meta' },
];

// Categorías y colores vivos (estilo Scratch)
export const CATEGORY_ORDER = ['move', 'action', 'loop', 'control', 'vars', 'func', 'ops'];
export const CATEGORY_LABELS = {
  move:    'Movimiento',
  action:  'Acciones',
  loop:    'Bucles',
  control: 'Condiciones',
  vars:    'Variables',
  func:    'Funciones',
  ops:     'Operadores',
};
export const CATEGORY_COLORS = {
  move:    '#3b82f6', // azul vivo
  action:  '#06b6d4', // cian
  loop:    '#f59e0b', // ámbar
  control: '#10b981', // verde
  vars:    '#ef4444', // rojo
  func:    '#a855f7', // púrpura
  ops:     '#84cc16', // lima (no se arrastra, solo info)
};

// Cada bloque:
//   kind, label, category, minGrade, container (si tiene slot body)
//   fields: [{name,type,placeholder,width,options?}]
//   tpl: string con %field% tokens
export const BLOCKS = [
  // -------- MOVIMIENTO --------
  { kind: 'move',   label: 'avanzar',        category: 'move',   minGrade: 1, tpl: 'avanzar', fields: [] },
  { kind: 'turnL',  label: 'girar izquierda',category: 'move',   minGrade: 1, tpl: 'girar izquierda', fields: [] },
  { kind: 'turnR',  label: 'girar derecha',  category: 'move',   minGrade: 1, tpl: 'girar derecha',  fields: [] },
  { kind: 'turn180',label: 'media vuelta',   category: 'move',   minGrade: 2, tpl: 'media vuelta', fields: [] },

  // -------- ACCIONES --------
  { kind: 'pick',        label: 'recoger',       category: 'action', minGrade: 3, tpl: 'recoger objeto', fields: [] },
  { kind: 'fire_laser',  label: 'disparar láser',category: 'action', minGrade: 5, tpl: 'disparar láser', fields: [] },

  // -------- BUCLES --------
  {
    kind: 'repeat_n', label: 'repetir N veces', category: 'loop', minGrade: 2,
    tpl: 'repetir %count% veces', slots: ['body'],
    fields: [{ name: 'count', type: 'number', placeholder: '3', min: 1, max: 50, width: 46 }],
  },
  {
    kind: 'while_sensor', label: 'mientras sensor', category: 'loop', minGrade: 7,
    tpl: 'mientras %cond%', slots: ['body'],
    fields: [{ name: 'cond', type: 'sensor', width: 160 }],
  },
  {
    kind: 'until_meta', label: 'repetir hasta meta', category: 'loop', minGrade: 7,
    tpl: 'repetir hasta estar en la meta', slots: ['body'],
    fields: [],
  },
  {
    kind: 'for_range', label: 'para i desde..hasta', category: 'loop', minGrade: 10,
    tpl: 'para %name% desde %from% hasta %to%', slots: ['body'],
    fields: [
      { name: 'name', type: 'ident', placeholder: 'i', width: 40 },
      { name: 'from', type: 'expr', placeholder: '0', width: 50 },
      { name: 'to',   type: 'expr', placeholder: '10', width: 50 },
    ],
  },
  {
    kind: 'while_expr', label: 'mientras (expr)', category: 'loop', minGrade: 10,
    tpl: 'mientras %cond%', slots: ['body'],
    fields: [{ name: 'cond', type: 'expr', placeholder: 'i < 5', width: 180 }],
  },

  // -------- CONDICIONES --------
  {
    kind: 'if_sensor', label: 'si sensor', category: 'control', minGrade: 5,
    tpl: 'si %cond%', slots: ['body'],
    fields: [{ name: 'cond', type: 'sensor', width: 160 }],
  },
  {
    kind: 'ifelse_sensor', label: 'si sensor / si no', category: 'control', minGrade: 6,
    tpl: 'si %cond%', slots: ['body', 'elseBody'],
    fields: [{ name: 'cond', type: 'sensor', width: 160 }],
  },
  {
    kind: 'if_expr', label: 'si (expr)', category: 'control', minGrade: 10,
    tpl: 'si %cond%', slots: ['body'],
    fields: [{ name: 'cond', type: 'expr', placeholder: 'x > 0', width: 180 }],
  },
  {
    kind: 'ifelse_expr', label: 'si (expr) / si no', category: 'control', minGrade: 10,
    tpl: 'si %cond%', slots: ['body', 'elseBody'],
    fields: [{ name: 'cond', type: 'expr', placeholder: 'x > 0', width: 180 }],
  },

  // -------- VARIABLES --------
  {
    kind: 'var_decl', label: 'crear variable', category: 'vars', minGrade: 10,
    tpl: 'crear %name% = %value%',
    fields: [
      { name: 'name',  type: 'ident', placeholder: 'x', width: 50 },
      { name: 'value', type: 'expr',  placeholder: '0', width: 100 },
    ],
  },
  {
    kind: 'assign', label: 'asignar', category: 'vars', minGrade: 10,
    tpl: '%name% %op% %value%',
    fields: [
      { name: 'name',  type: 'ident', placeholder: 'x', width: 50 },
      { name: 'op',    type: 'op', options: ['=', '+=', '-=', '*=', '/='], width: 52 },
      { name: 'value', type: 'expr',  placeholder: '1', width: 100 },
    ],
  },
  {
    kind: 'const_decl', label: 'crear constante', category: 'vars', minGrade: 10,
    tpl: 'crear constante %name% = %value%',
    fields: [
      { name: 'name',  type: 'ident', placeholder: 'K', width: 50 },
      { name: 'value', type: 'expr',  placeholder: '10', width: 100 },
    ],
  },

  // -------- FUNCIONES (procedimientos 3º ESO, funciones con params 1º Bach) --------
  {
    kind: 'proc_decl', label: 'definir procedimiento', category: 'func', minGrade: 9,
    tpl: 'definir %name%()', slots: ['body'],
    fields: [{ name: 'name', type: 'ident', placeholder: 'rutina', width: 100 }],
  },
  {
    kind: 'proc_call', label: 'llamar', category: 'func', minGrade: 9,
    tpl: 'llamar %name%()',
    fields: [{ name: 'name', type: 'ident', placeholder: 'rutina', width: 100 }],
  },
  {
    kind: 'func_decl', label: 'definir función(params)', category: 'func', minGrade: 11,
    tpl: 'definir %name%(%params%)', slots: ['body'],
    fields: [
      { name: 'name',   type: 'ident', placeholder: 'f', width: 60 },
      { name: 'params', type: 'text',  placeholder: 'a, b', width: 100 },
    ],
  },
  {
    kind: 'func_call', label: 'llamar(args)', category: 'func', minGrade: 11,
    tpl: 'llamar %name%(%args%)',
    fields: [
      { name: 'name', type: 'ident', placeholder: 'f', width: 60 },
      { name: 'args', type: 'text',  placeholder: '1, 2', width: 100 },
    ],
  },
  {
    kind: 'return', label: 'devolver', category: 'func', minGrade: 11,
    tpl: 'devolver %value%',
    fields: [{ name: 'value', type: 'expr', placeholder: 'x', width: 120 }],
  },
];

export function blocksForGrade(gradeId) {
  return BLOCKS.filter((b) => b.minGrade <= gradeId);
}
export function getBlock(kind) { return BLOCKS.find((b) => b.kind === kind); }

let __id = 0;
export function newNode(kind) {
  const def = getBlock(kind);
  if (!def) return null;
  const fields = {};
  for (const f of def.fields || []) {
    if (f.type === 'op') fields[f.name] = f.options[0];
    else if (f.type === 'sensor') fields[f.name] = SENSORS[0].value;
    else if (f.type === 'number') fields[f.name] = '3';
    else fields[f.name] = '';
  }
  const slots = {};
  for (const s of def.slots || []) slots[s] = [];
  return { id: `n${++__id}-${Date.now().toString(36).slice(-4)}`, kind, fields, slots };
}

export function cloneNode(n) {
  if (!n) return n;
  return {
    id: `n${++__id}-${Date.now().toString(36).slice(-4)}`,
    kind: n.kind,
    fields: { ...(n.fields || {}) },
    slots: Object.fromEntries(Object.entries(n.slots || {}).map(([k, v]) => [k, (v || []).map(cloneNode)])),
  };
}
