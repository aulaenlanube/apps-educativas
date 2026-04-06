/**
 * Script para importar chistes desde jokes.json a Supabase.
 *
 * Uso: node database/import-jokes.mjs
 *
 * Requiere las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 * o bien editar las constantes de abajo.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer .env manualmente (sin dependencias extra)
const envPath = resolve(__dirname, '..', '.env');
const env = {};
try {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) env[key.trim()] = val.join('=').trim();
  });
} catch { /* no .env */ }

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const jokesPath = resolve(__dirname, '..', 'public', 'jokes.json');
const jokes = JSON.parse(readFileSync(jokesPath, 'utf-8'));

console.log(`Importando ${jokes.length} chistes...`);

const rows = jokes.map(text => ({ text }));

// Insertar en lotes de 50
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50);
  const { error } = await supabase.from('jokes').insert(batch);
  if (error) {
    console.error(`Error en lote ${i}:`, error.message);
    process.exit(1);
  }
  console.log(`  Insertados ${Math.min(i + 50, rows.length)}/${rows.length}`);
}

console.log('Importacion completada.');
