import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('='); if (i < 0) continue;
    const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
const all = []; let from = 0;
while (true) {
  const { data, error } = await supabase.from('detective_sentences').select('id,subject_id,level,grades,sentence').order('id').range(from, from+999);
  if (error) { console.error(error); process.exit(1); }
  if (!data?.length) break;
  all.push(...data); if (data.length < 1000) break; from += 1000;
}
fs.writeFileSync(path.join(__dirname, 'detective_dump.json'), JSON.stringify(all, null, 2));
console.log(`✅ ${all.length} frases`);
const byKey = {};
for (const r of all) { const k = `${r.level}::${r.subject_id}`; byKey[k] = (byKey[k]||0)+1; }
for (const [k,v] of Object.entries(byKey).sort()) console.log(`  ${k}: ${v}`);
