import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
const all = [];
let from = 0;
while (true) {
  const { data, error } = await supabase
    .from('ordena_historias')
    .select('id,subject_id,level,grades,sentences')
    .order('id', { ascending: true })
    .range(from, from + 999);
  if (error) { console.error(error); process.exit(1); }
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < 1000) break;
  from += 1000;
}

fs.writeFileSync(path.join(__dirname, 'ordena_historias_dump.json'), JSON.stringify(all, null, 2));
console.log(`✅ ${all.length} historias guardadas`);
const byKey = {};
for (const r of all) {
  const k = `${r.level}::${r.subject_id}`;
  byKey[k] = byKey[k] || { total: 0, byGrade: {}, totalSentences: 0 };
  byKey[k].total++;
  byKey[k].totalSentences += (r.sentences || []).length;
  for (const g of (r.grades || [])) byKey[k].byGrade[g] = (byKey[k].byGrade[g] || 0) + 1;
}
console.log('\n📊 Resumen:');
for (const [k, v] of Object.entries(byKey).sort()) {
  console.log(`  ${k}: ${v.total} historias (${v.totalSentences} frases) cursos=${JSON.stringify(v.byGrade)}`);
}
