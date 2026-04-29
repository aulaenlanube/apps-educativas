// Diagnóstico/limpieza de high_scores.
// Uso:
//   node tools/_score-cleanup.mjs           → diagnóstico detallado
//   node tools/_score-cleanup.mjs delete    → ejecuta borrado (preguntas Y/N omitidas: confirmar antes en el código)

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const role = env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon';
const supabase = createClient(url, key);

const cmd = process.argv[2] || 'diagnose';

if (cmd === 'diagnose') {
  console.log(`→ role: ${role}`);

  // Cargar todo (con paginado por si acaso)
  let all = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('high_scores')
      .select('id, app_id, score, level, grade, mode, achieved_at, user_type, user_id, nota')
      .eq('mode', 'test')
      .order('app_id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) { console.error(error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`Total filas en high_scores: ${all.length}\n`);

  // Agrupar por app
  const byApp = {};
  for (const r of all) {
    if (!byApp[r.app_id]) byApp[r.app_id] = [];
    byApp[r.app_id].push(r);
  }

  // Para cada app: ordenar por score desc, calcular ratio top1/top2 y mediana
  const summary = Object.entries(byApp).map(([app, rows]) => {
    rows.sort((a, b) => b.score - a.score);
    const max = rows[0].score;
    const second = rows[1]?.score ?? 0;
    const median = rows[Math.floor(rows.length / 2)].score;
    const ratio = second > 0 ? max / second : (max > 0 ? Infinity : 0);
    return { app, n: rows.length, max, second, median, ratio, top: rows.slice(0, 5) };
  });

  // Mostrar todos
  summary.sort((a, b) => b.max - a.max);
  console.log('APP_ID                          N    MAX    2º    MED   RATIO   FECHA TOP   CURSO TOP');
  for (const s of summary) {
    const t = s.top[0];
    const fecha = (t.achieved_at || '').slice(0, 10);
    const curso = `${t.level}-${t.grade}`;
    console.log(
      `${s.app.padEnd(30)} ${String(s.n).padStart(3)}  ${String(s.max).padStart(5)}  ${String(s.second).padStart(5)}  ${String(s.median).padStart(5)}  ${s.ratio === Infinity ? ' ∞ ' : s.ratio.toFixed(2).padStart(5)}   ${fecha}   ${curso}`
    );
  }

  // Outliers candidatos: ratio max/2º > 1.8 (top muy por encima del resto)
  console.log('\n=== POSIBLES OUTLIERS (max ≥ 1.8× del 2º, n ≥ 2) ===');
  const outliers = summary.filter(s => s.n >= 2 && s.ratio >= 1.8 && s.max > 100);
  for (const o of outliers) {
    console.log(`\n· ${o.app}  (n=${o.n}, max=${o.max}, 2º=${o.second}, ratio=${o.ratio.toFixed(2)})`);
    for (const r of o.top) {
      console.log(`    score=${String(r.score).padStart(6)}  nota=${r.nota}  curso=${r.level}-${r.grade}  fecha=${(r.achieved_at || '').slice(0, 10)}  user=${r.user_type}  id=${r.id}`);
    }
  }
}

if (cmd === 'delete-medidas') {
  if (role !== 'service_role' && role !== 'anon') {
    console.error('Sin credencial');
    process.exit(1);
  }
  const { count, error } = await supabase
    .from('high_scores')
    .delete({ count: 'exact' })
    .like('app_id', 'medidas-%');
  console.log(`medidas-*: ${error ? error.message : count + ' filas borradas'}`);
}

if (cmd === 'delete-ids') {
  const ids = (process.argv[3] || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!ids.length) { console.error('Falta lista de IDs'); process.exit(1); }
  const { count, error } = await supabase
    .from('high_scores')
    .delete({ count: 'exact' })
    .in('id', ids);
  console.log(`Borradas ${error ? error.message : count + ' filas'}`);
}
