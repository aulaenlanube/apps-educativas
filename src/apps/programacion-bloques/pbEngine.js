// Motor: parser de expresiones + simulador del robot + transpilers C/Java/Python.

// --------------------------- Parser de expresiones (para grados avanzados) ---------------------------
const TOK = { NUM: 'NUM', STR: 'STR', IDENT: 'IDENT', OP: 'OP', LP: '(', RP: ')', LBR: '[', RBR: ']', COMMA: ',', EOF: 'EOF' };
const KW_BOOL = new Set(['true', 'false', 'True', 'False']);

function tokenize(src) {
  const t = []; let i = 0; const s = String(src).trim();
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) {
      let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
      t.push({ type: TOK.NUM, value: parseFloat(s.slice(i, j)) }); i = j; continue;
    }
    if (c === '"' || c === "'") {
      const q = c; let j = i + 1, v = '';
      while (j < s.length && s[j] !== q) { if (s[j] === '\\' && j + 1 < s.length) { v += s[j + 1]; j += 2; } else { v += s[j]; j++; } }
      t.push({ type: TOK.STR, value: v }); i = j + 1; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i; while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      const w = s.slice(i, j);
      if (KW_BOOL.has(w)) t.push({ type: TOK.IDENT, value: w, bool: true });
      else t.push({ type: TOK.IDENT, value: w });
      i = j; continue;
    }
    const two = s.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '&&', '||', '**'].includes(two)) { t.push({ type: TOK.OP, value: two }); i += 2; continue; }
    if ('+-*/%<>!'.includes(c)) { t.push({ type: TOK.OP, value: c }); i++; continue; }
    if (c === '(') { t.push({ type: TOK.LP, value: c }); i++; continue; }
    if (c === ')') { t.push({ type: TOK.RP, value: c }); i++; continue; }
    if (c === '[') { t.push({ type: TOK.LBR, value: c }); i++; continue; }
    if (c === ']') { t.push({ type: TOK.RBR, value: c }); i++; continue; }
    if (c === ',') { t.push({ type: TOK.COMMA, value: c }); i++; continue; }
    throw new Error('Carácter inesperado: ' + c);
  }
  t.push({ type: TOK.EOF }); return t;
}

const PREC = { '||': 1, '&&': 2, '==': 3, '!=': 3, '<': 3, '<=': 3, '>': 3, '>=': 3, '+': 4, '-': 4, '*': 5, '/': 5, '%': 5, '**': 6 };

class P {
  constructor(t) { this.t = t; this.i = 0; }
  peek() { return this.t[this.i]; }
  expr(min = 0) {
    let l = this.unary();
    while (true) {
      const tk = this.peek();
      if (tk.type !== TOK.OP) break;
      const p = PREC[tk.value]; if (p == null || p < min) break;
      this.i++;
      const r = this.expr(p + 1);
      l = { t: 'bin', op: tk.value, l, r };
    }
    return l;
  }
  unary() {
    const tk = this.peek();
    if (tk.type === TOK.OP && (tk.value === '-' || tk.value === '!')) {
      this.i++; return { t: 'un', op: tk.value, e: this.unary() };
    }
    return this.primary();
  }
  primary() {
    const tk = this.peek();
    if (tk.type === TOK.NUM) { this.i++; return { t: 'num', v: tk.value }; }
    if (tk.type === TOK.STR) { this.i++; return { t: 'str', v: tk.value }; }
    if (tk.type === TOK.LBR) {
      this.i++; const items = [];
      if (this.peek().type !== TOK.RBR) { items.push(this.expr()); while (this.peek().type === TOK.COMMA) { this.i++; items.push(this.expr()); } }
      if (this.peek().type !== TOK.RBR) throw new Error('Se esperaba ]'); this.i++;
      return { t: 'list', items };
    }
    if (tk.type === TOK.LP) { this.i++; const e = this.expr(); if (this.peek().type !== TOK.RP) throw new Error('Se esperaba )'); this.i++; return e; }
    if (tk.type === TOK.IDENT) {
      this.i++;
      if (tk.bool) return { t: 'bool', v: tk.value === 'true' || tk.value === 'True' };
      if (this.peek().type === TOK.LP) {
        this.i++; const args = [];
        if (this.peek().type !== TOK.RP) { args.push(this.expr()); while (this.peek().type === TOK.COMMA) { this.i++; args.push(this.expr()); } }
        if (this.peek().type !== TOK.RP) throw new Error('Se esperaba )'); this.i++;
        return { t: 'call', name: tk.value, args };
      }
      let n = { t: 'id', v: tk.value };
      while (this.peek().type === TOK.LBR) { this.i++; const idx = this.expr(); if (this.peek().type !== TOK.RBR) throw new Error('Se esperaba ]'); this.i++; n = { t: 'idx', obj: n, idx }; }
      return n;
    }
    throw new Error('Expresión inesperada');
  }
}

export function parseExpr(src) {
  if (src == null || String(src).trim() === '') return null;
  const p = new P(tokenize(src));
  const e = p.expr();
  if (p.peek().type !== TOK.EOF) throw new Error('Tokens sobrantes');
  return e;
}

// --------------------------- Robot simulator ---------------------------
const DIR = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const CW = ['N', 'E', 'S', 'W'];
const rotCW = (d) => CW[(CW.indexOf(d) + 1) % 4];
const rotCCW = (d) => CW[(CW.indexOf(d) + 3) % 4];
const MAX_STEPS = 3000;

function evalExpr(node, ctx) {
  if (!node) return undefined;
  switch (node.t) {
    case 'num': return node.v;
    case 'str': return node.v;
    case 'bool': return node.v;
    case 'id': {
      // Busca en env actual hacia arriba
      let e = ctx.env;
      while (e) { if (Object.prototype.hasOwnProperty.call(e.vars, node.v)) return e.vars[node.v]; e = e.parent; }
      throw new Error(`Variable '${node.v}' no definida`);
    }
    case 'list': return node.items.map((x) => evalExpr(x, ctx));
    case 'idx': { const o = evalExpr(node.obj, ctx); return o[evalExpr(node.idx, ctx)]; }
    case 'un': { const e = evalExpr(node.e, ctx); return node.op === '!' ? !e : -e; }
    case 'bin': {
      const l = evalExpr(node.l, ctx), r = evalExpr(node.r, ctx);
      switch (node.op) {
        case '+': return l + r; case '-': return l - r; case '*': return l * r;
        case '/': return r === 0 ? 0 : l / r; case '%': return l % r; case '**': return l ** r;
        case '==': return l === r; case '!=': return l !== r;
        case '<': return l < r; case '<=': return l <= r; case '>': return l > r; case '>=': return l >= r;
        case '&&': return l && r; case '||': return l || r;
      }
      return 0;
    }
    case 'call': {
      const args = node.args.map((a) => evalExpr(a, ctx));
      switch (node.name) {
        case 'length': case 'len': return (args[0] || '').length || 0;
        case 'abs': return Math.abs(args[0]);
        case 'min': return Math.min(...args);
        case 'max': return Math.max(...args);
        case 'sqrt': return Math.sqrt(args[0]);
        case 'floor': return Math.floor(args[0]);
        case 'ceil': return Math.ceil(args[0]);
        case 'round': return Math.round(args[0]);
        case 'random': return Math.floor(Math.random() * ((args[1] ?? 100) - (args[0] ?? 0) + 1)) + (args[0] ?? 0);
      }
      // función de usuario
      const fn = ctx.funcs[node.name];
      if (!fn) throw new Error(`Función '${node.name}' no definida`);
      const sub = { vars: Object.create(ctx.env.vars), parent: ctx.env };
      fn.params.forEach((p, i) => (sub.vars[p] = args[i]));
      const prev = ctx.env; ctx.env = sub;
      try { execBody(fn.body, ctx); } catch (e) { if (e && e.__ret) return e.v; throw e; } finally { ctx.env = prev; }
      return undefined;
    }
  }
  return undefined;
}

function evalSensor(ctx, key) {
  const { robot, world } = ctx;
  const [dx, dy] = DIR[robot.dir]; const fx = robot.x + dx, fy = robot.y + dy;
  const blocked = (x, y) => x < 0 || y < 0 || x >= world.cols || y >= world.rows || world.walls.has(`${x},${y}`) || world.water.has(`${x},${y}`);
  switch (key) {
    case 'canMove': return !blocked(fx, fy);
    case 'obstacleAhead': return blocked(fx, fy);
    case 'itemHere': return world.items.has(`${robot.x},${robot.y}`);
    case 'onTarget': return world.target && robot.x === world.target.x && robot.y === world.target.y;
    case 'notOnTarget': return !(world.target && robot.x === world.target.x && robot.y === world.target.y);
  }
  return false;
}

function execBody(body, ctx) { for (const s of body || []) execStmt(s, ctx); }

function execStmt(node, ctx) {
  if (++ctx.steps > MAX_STEPS) throw new Error('Demasiadas instrucciones (bucle infinito?)');
  const f = node.fields || {}, sl = node.slots || {};
  const push = (kind, extra = {}) => ctx.trace.push({ kind, robot: { ...ctx.robot }, items: new Set(ctx.world.items), ...extra });
  const world = ctx.world;
  const blocked = (x, y) => x < 0 || y < 0 || x >= world.cols || y >= world.rows || world.walls.has(`${x},${y}`) || world.water.has(`${x},${y}`);

  switch (node.kind) {
    case 'move': {
      const [dx, dy] = DIR[ctx.robot.dir];
      const nx = ctx.robot.x + dx, ny = ctx.robot.y + dy;
      const isWater = world.water.has(`${nx},${ny}`);
      if (blocked(nx, ny)) { push('bump'); throw new Error(isWater ? 'El robot no puede entrar en el agua.' : 'El robot ha chocado contra un muro.'); }
      ctx.robot = { ...ctx.robot, x: nx, y: ny };
      push('move');
      if (world.holes.has(`${ctx.robot.x},${ctx.robot.y}`)) { push('fall'); throw new Error('¡El robot cayó en un agujero!'); }
      return;
    }
    case 'turnL': ctx.robot = { ...ctx.robot, dir: rotCCW(ctx.robot.dir) }; push('turn'); return;
    case 'turnR': ctx.robot = { ...ctx.robot, dir: rotCW(ctx.robot.dir) };  push('turn'); return;
    case 'turn180': ctx.robot = { ...ctx.robot, dir: rotCW(rotCW(ctx.robot.dir)) }; push('turn'); return;
    case 'pick': {
      const k = `${ctx.robot.x},${ctx.robot.y}`;
      if (world.items.has(k)) { world.items.delete(k); push('pick'); }
      else push('pickEmpty');
      return;
    }
    case 'repeat_n': {
      const n = Math.max(0, Math.min(1000, parseInt(f.count || '0', 10) || 0));
      for (let i = 0; i < n; i++) execBody(sl.body, ctx);
      return;
    }
    case 'while_sensor': {
      let g = 0;
      while (evalSensor(ctx, f.cond)) { execBody(sl.body, ctx); if (++g > MAX_STEPS) throw new Error('Bucle interminable'); }
      return;
    }
    case 'until_meta': {
      let g = 0;
      while (!(world.target && ctx.robot.x === world.target.x && ctx.robot.y === world.target.y)) {
        execBody(sl.body, ctx); if (++g > MAX_STEPS) throw new Error('Bucle interminable');
      }
      return;
    }
    case 'for_range': {
      const from = evalExpr(parseExpr(f.from || '0'), ctx);
      const to = evalExpr(parseExpr(f.to || '0'), ctx);
      const name = f.name || 'i';
      ctx.env.vars[name] = from;
      while (ctx.env.vars[name] < to) { execBody(sl.body, ctx); ctx.env.vars[name]++; }
      return;
    }
    case 'while_expr': {
      let g = 0;
      while (evalExpr(parseExpr(f.cond || 'false'), ctx)) { execBody(sl.body, ctx); if (++g > MAX_STEPS) throw new Error('Bucle interminable'); }
      return;
    }
    case 'if_sensor': {
      if (evalSensor(ctx, f.cond)) execBody(sl.body, ctx);
      return;
    }
    case 'ifelse_sensor': {
      if (evalSensor(ctx, f.cond)) execBody(sl.body, ctx); else execBody(sl.elseBody, ctx);
      return;
    }
    case 'if_expr': {
      if (evalExpr(parseExpr(f.cond || 'false'), ctx)) execBody(sl.body, ctx);
      return;
    }
    case 'ifelse_expr': {
      if (evalExpr(parseExpr(f.cond || 'false'), ctx)) execBody(sl.body, ctx); else execBody(sl.elseBody, ctx);
      return;
    }
    case 'var_decl': {
      const v = f.value?.trim() ? evalExpr(parseExpr(f.value), ctx) : 0;
      ctx.env.vars[f.name || 'x'] = v; return;
    }
    case 'const_decl': {
      const v = evalExpr(parseExpr(f.value || '0'), ctx);
      ctx.env.vars[f.name || 'K'] = v; ctx.consts.add(f.name); return;
    }
    case 'assign': {
      if (ctx.consts.has(f.name)) throw new Error(`No puedes reasignar la constante '${f.name}'`);
      const op = f.op || '=';
      const rhs = evalExpr(parseExpr(f.value || '0'), ctx);
      let e = ctx.env;
      while (e) {
        if (Object.prototype.hasOwnProperty.call(e.vars, f.name)) {
          if (op === '=') e.vars[f.name] = rhs;
          else if (op === '+=') e.vars[f.name] += rhs;
          else if (op === '-=') e.vars[f.name] -= rhs;
          else if (op === '*=') e.vars[f.name] *= rhs;
          else if (op === '/=') e.vars[f.name] /= rhs;
          return;
        }
        e = e.parent;
      }
      ctx.env.vars[f.name] = rhs; // si no existe, crea en local
      return;
    }
    case 'proc_decl': {
      ctx.procs[f.name || 'r'] = { body: sl.body || [] }; return;
    }
    case 'proc_call': {
      const pr = ctx.procs[f.name]; if (!pr) throw new Error(`Procedimiento '${f.name}' no definido`);
      execBody(pr.body, ctx); return;
    }
    case 'func_decl': {
      ctx.funcs[f.name || 'f'] = {
        params: (f.params || '').split(',').map((p) => p.trim()).filter(Boolean),
        body: sl.body || [],
      };
      return;
    }
    case 'func_call': {
      const fn = ctx.funcs[f.name]; if (!fn) throw new Error(`Función '${f.name}' no definida`);
      const args = (f.args || '').split(',').filter((x) => x.trim() !== '').map((s) => evalExpr(parseExpr(s), ctx));
      const sub = { vars: Object.create(ctx.env.vars), parent: ctx.env };
      fn.params.forEach((p, i) => (sub.vars[p] = args[i]));
      const prev = ctx.env; ctx.env = sub;
      try { execBody(fn.body, ctx); } catch (e) { if (e && e.__ret) return; throw e; } finally { ctx.env = prev; }
      return;
    }
    case 'return': {
      const v = f.value?.trim() ? evalExpr(parseExpr(f.value), ctx) : undefined;
      const err = new Error('return'); err.__ret = true; err.v = v; throw err;
    }
  }
}

export function simulate(program, world) {
  const w = {
    cols: world.cols, rows: world.rows,
    walls: new Set(world.walls || []),
    water: new Set(world.water || []),
    holes: new Set(world.holes || []),
    items: new Set(world.items || []),
    target: world.target || null,
  };
  const initialItems = w.items.size;
  const ctx = {
    world: w,
    robot: { ...world.robot },
    env: { vars: {}, parent: null },
    procs: {}, funcs: {}, consts: new Set(),
    trace: [],
    steps: 0,
  };
  ctx.trace.push({ kind: 'init', robot: { ...ctx.robot }, items: new Set(w.items) });
  let error = null;
  try { execBody(program, ctx); }
  catch (e) { error = e.message || String(e); }
  ctx.trace.push({ kind: 'end', robot: { ...ctx.robot }, items: new Set(w.items) });
  const onTarget = w.target ? (ctx.robot.x === w.target.x && ctx.robot.y === w.target.y) : true;
  const itemsCollected = initialItems - w.items.size;
  return { trace: ctx.trace, finalRobot: ctx.robot, itemsRemaining: w.items, onTarget, itemsCollected, initialItems, error };
}

// --------------------------- Transpilers ---------------------------
function indent(n) { return '  '.repeat(n); }

// Helpers comunes
function sensorText(key, lang) {
  const map = {
    python: { canMove: 'puede_avanzar()', obstacleAhead: 'hay_muro()', itemHere: 'hay_objeto()', onTarget: 'en_meta()', notOnTarget: 'not en_meta()' },
    java:   { canMove: 'puedeAvanzar()',  obstacleAhead: 'hayMuro()',  itemHere: 'hayObjeto()',  onTarget: 'enMeta()',  notOnTarget: '!enMeta()' },
    c:      { canMove: 'puede_avanzar()', obstacleAhead: 'hay_muro()', itemHere: 'hay_objeto()', onTarget: 'en_meta()', notOnTarget: '!en_meta()' },
  };
  return map[lang][key] || key;
}

function exprStr(expr, lang) {
  if (!expr) return '';
  const E = (e) => exprStr(e, lang);
  switch (expr.t) {
    case 'num': return String(expr.v);
    case 'str': return JSON.stringify(expr.v);
    case 'bool': return lang === 'python' ? (expr.v ? 'True' : 'False') : (expr.v ? 'true' : 'false');
    case 'id': return expr.v;
    case 'list': return lang === 'java' ? `new int[]{${expr.items.map(E).join(', ')}}` : `[${expr.items.map(E).join(', ')}]`;
    case 'idx': return `${E(expr.obj)}[${E(expr.idx)}]`;
    case 'un': return (lang === 'python' && expr.op === '!') ? `not ${E(expr.e)}` : `${expr.op}${E(expr.e)}`;
    case 'bin': {
      let op = expr.op;
      if (lang === 'python') { if (op === '&&') op = ' and '; else if (op === '||') op = ' or '; else op = ` ${op} `; }
      else op = ` ${op} `;
      return `(${E(expr.l)}${op}${E(expr.r)})`;
    }
    case 'call': return `${expr.name}(${(expr.args || []).map(E).join(', ')})`;
  }
  return '';
}
function expr(src, lang) { try { return exprStr(parseExpr(src), lang); } catch { return src || ''; } }

// -------- Python --------
function toPyBody(body, lvl) {
  let out = ''; const I = indent(lvl);
  for (const n of body || []) {
    const f = n.fields || {}, s = n.slots || {};
    const sub = (arr) => toPyBody(arr, lvl + 1) || `${indent(lvl + 1)}pass\n`;
    switch (n.kind) {
      case 'move':   out += `${I}avanzar()\n`; break;
      case 'turnL':  out += `${I}girar_izquierda()\n`; break;
      case 'turnR':  out += `${I}girar_derecha()\n`; break;
      case 'turn180':out += `${I}media_vuelta()\n`; break;
      case 'pick':   out += `${I}recoger()\n`; break;
      case 'repeat_n': out += `${I}for _ in range(${f.count || 0}):\n${sub(s.body)}`; break;
      case 'while_sensor': out += `${I}while ${sensorText(f.cond, 'python')}:\n${sub(s.body)}`; break;
      case 'until_meta': out += `${I}while not en_meta():\n${sub(s.body)}`; break;
      case 'for_range': out += `${I}for ${f.name} in range(${expr(f.from, 'python')}, ${expr(f.to, 'python')}):\n${sub(s.body)}`; break;
      case 'while_expr': out += `${I}while ${expr(f.cond, 'python')}:\n${sub(s.body)}`; break;
      case 'if_sensor': out += `${I}if ${sensorText(f.cond, 'python')}:\n${sub(s.body)}`; break;
      case 'ifelse_sensor': out += `${I}if ${sensorText(f.cond, 'python')}:\n${sub(s.body)}${I}else:\n${sub(s.elseBody)}`; break;
      case 'if_expr': out += `${I}if ${expr(f.cond, 'python')}:\n${sub(s.body)}`; break;
      case 'ifelse_expr': out += `${I}if ${expr(f.cond, 'python')}:\n${sub(s.body)}${I}else:\n${sub(s.elseBody)}`; break;
      case 'var_decl': out += `${I}${f.name} = ${expr(f.value || '0', 'python')}\n`; break;
      case 'const_decl': out += `${I}${f.name} = ${expr(f.value || '0', 'python')}  # const\n`; break;
      case 'assign': out += `${I}${f.name} ${f.op || '='} ${expr(f.value, 'python')}\n`; break;
      case 'proc_decl': out += `${I}def ${f.name}():\n${sub(s.body)}`; break;
      case 'proc_call': out += `${I}${f.name}()\n`; break;
      case 'func_decl': out += `${I}def ${f.name}(${f.params || ''}):\n${sub(s.body)}`; break;
      case 'func_call': out += `${I}${f.name}(${(f.args || '').split(',').map(x => expr(x, 'python')).filter(Boolean).join(', ')})\n`; break;
      case 'return': out += `${I}return${f.value?.trim() ? ' ' + expr(f.value, 'python') : ''}\n`; break;
    }
  }
  return out;
}
function toPython(program) {
  return '# Programa al Robot — Python\n' + (toPyBody(program, 0) || 'pass\n');
}

// -------- Java --------
function toJavaBody(body, lvl) {
  let out = ''; const I = indent(lvl);
  for (const n of body || []) {
    const f = n.fields || {}, s = n.slots || {};
    switch (n.kind) {
      case 'move':   out += `${I}avanzar();\n`; break;
      case 'turnL':  out += `${I}girarIzquierda();\n`; break;
      case 'turnR':  out += `${I}girarDerecha();\n`; break;
      case 'turn180':out += `${I}mediaVuelta();\n`; break;
      case 'pick':   out += `${I}recoger();\n`; break;
      case 'repeat_n': out += `${I}for (int __r=0; __r<${f.count || 0}; __r++) {\n${toJavaBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'while_sensor': out += `${I}while (${sensorText(f.cond, 'java')}) {\n${toJavaBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'until_meta': out += `${I}while (!enMeta()) {\n${toJavaBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'for_range': out += `${I}for (int ${f.name}=${expr(f.from, 'java')}; ${f.name}<${expr(f.to, 'java')}; ${f.name}++) {\n${toJavaBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'while_expr': out += `${I}while (${expr(f.cond, 'java')}) {\n${toJavaBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'if_sensor': out += `${I}if (${sensorText(f.cond, 'java')}) {\n${toJavaBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'ifelse_sensor': out += `${I}if (${sensorText(f.cond, 'java')}) {\n${toJavaBody(s.body, lvl + 1)}${I}} else {\n${toJavaBody(s.elseBody, lvl + 1)}${I}}\n`; break;
      case 'if_expr': out += `${I}if (${expr(f.cond, 'java')}) {\n${toJavaBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'ifelse_expr': out += `${I}if (${expr(f.cond, 'java')}) {\n${toJavaBody(s.body, lvl + 1)}${I}} else {\n${toJavaBody(s.elseBody, lvl + 1)}${I}}\n`; break;
      case 'var_decl': out += `${I}var ${f.name} = ${expr(f.value || '0', 'java')};\n`; break;
      case 'const_decl': out += `${I}final var ${f.name} = ${expr(f.value || '0', 'java')};\n`; break;
      case 'assign': out += `${I}${f.name} ${f.op || '='} ${expr(f.value, 'java')};\n`; break;
      case 'proc_call': out += `${I}${f.name}();\n`; break;
      case 'func_call': out += `${I}${f.name}(${(f.args || '').split(',').map(x => expr(x, 'java')).filter(Boolean).join(', ')});\n`; break;
      case 'return': out += `${I}return${f.value?.trim() ? ' ' + expr(f.value, 'java') : ''};\n`; break;
    }
  }
  return out;
}
function toJava(program) {
  const procs = program.filter(n => n.kind === 'proc_decl');
  const funcs = program.filter(n => n.kind === 'func_decl');
  const main = program.filter(n => n.kind !== 'proc_decl' && n.kind !== 'func_decl');
  let out = '// Programa al Robot — Java\npublic class Programa {\n';
  for (const p of procs) out += `  static void ${p.fields.name}() {\n${toJavaBody(p.slots.body, 2)}  }\n`;
  for (const fn of funcs) {
    const ps = (fn.fields.params || '').split(',').map(s => s.trim()).filter(Boolean).map(p => `var ${p}`).join(', ');
    out += `  static Object ${fn.fields.name}(${ps}) {\n${toJavaBody(fn.slots.body, 2)}  }\n`;
  }
  out += '  public static void main(String[] args) {\n';
  out += toJavaBody(main, 2);
  out += '  }\n}\n';
  return out;
}

// -------- C --------
function toCBody(body, lvl) {
  let out = ''; const I = indent(lvl);
  for (const n of body || []) {
    const f = n.fields || {}, s = n.slots || {};
    switch (n.kind) {
      case 'move':   out += `${I}avanzar();\n`; break;
      case 'turnL':  out += `${I}girar_izquierda();\n`; break;
      case 'turnR':  out += `${I}girar_derecha();\n`; break;
      case 'turn180':out += `${I}media_vuelta();\n`; break;
      case 'pick':   out += `${I}recoger();\n`; break;
      case 'repeat_n': out += `${I}for (int __r=0; __r<${f.count || 0}; __r++) {\n${toCBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'while_sensor': out += `${I}while (${sensorText(f.cond, 'c')}) {\n${toCBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'until_meta': out += `${I}while (!en_meta()) {\n${toCBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'for_range': out += `${I}for (int ${f.name}=${expr(f.from, 'c')}; ${f.name}<${expr(f.to, 'c')}; ${f.name}++) {\n${toCBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'while_expr': out += `${I}while (${expr(f.cond, 'c')}) {\n${toCBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'if_sensor': out += `${I}if (${sensorText(f.cond, 'c')}) {\n${toCBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'ifelse_sensor': out += `${I}if (${sensorText(f.cond, 'c')}) {\n${toCBody(s.body, lvl + 1)}${I}} else {\n${toCBody(s.elseBody, lvl + 1)}${I}}\n`; break;
      case 'if_expr': out += `${I}if (${expr(f.cond, 'c')}) {\n${toCBody(s.body, lvl + 1)}${I}}\n`; break;
      case 'ifelse_expr': out += `${I}if (${expr(f.cond, 'c')}) {\n${toCBody(s.body, lvl + 1)}${I}} else {\n${toCBody(s.elseBody, lvl + 1)}${I}}\n`; break;
      case 'var_decl': out += `${I}int ${f.name} = ${expr(f.value || '0', 'c')};\n`; break;
      case 'const_decl': out += `${I}const int ${f.name} = ${expr(f.value || '0', 'c')};\n`; break;
      case 'assign': out += `${I}${f.name} ${f.op || '='} ${expr(f.value, 'c')};\n`; break;
      case 'proc_call': out += `${I}${f.name}();\n`; break;
      case 'func_call': out += `${I}${f.name}(${(f.args || '').split(',').map(x => expr(x, 'c')).filter(Boolean).join(', ')});\n`; break;
      case 'return': out += `${I}return${f.value?.trim() ? ' ' + expr(f.value, 'c') : ''};\n`; break;
    }
  }
  return out;
}
function toC(program) {
  const procs = program.filter(n => n.kind === 'proc_decl');
  const funcs = program.filter(n => n.kind === 'func_decl');
  const main = program.filter(n => n.kind !== 'proc_decl' && n.kind !== 'func_decl');
  let out = '// Programa al Robot — C\n#include <stdio.h>\n\n// API del robot declarada externamente\nvoid avanzar(); void girar_izquierda(); void girar_derecha(); void media_vuelta(); void recoger();\nint puede_avanzar(); int hay_muro(); int hay_objeto(); int en_meta();\n\n';
  for (const p of procs) out += `void ${p.fields.name}() {\n${toCBody(p.slots.body, 1)}}\n\n`;
  for (const fn of funcs) {
    const ps = (fn.fields.params || '').split(',').map(s => s.trim()).filter(Boolean).map(p => `int ${p}`).join(', ');
    out += `int ${fn.fields.name}(${ps}) {\n${toCBody(fn.slots.body, 1)}}\n\n`;
  }
  out += 'int main() {\n';
  out += toCBody(main, 1);
  out += '  return 0;\n}\n';
  return out;
}

export function transpile(program, lang) {
  try {
    if (lang === 'python') return toPython(program);
    if (lang === 'java') return toJava(program);
    if (lang === 'c') return toC(program);
  } catch (e) {
    return '// Error: ' + e.message;
  }
  return '';
}
