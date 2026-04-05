-- ============================================================
-- MIGRACIÓN: Reestructuración de datos de juegos educativos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. MATERIAS (catálogo de asignaturas)
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grade INT NOT NULL,
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  UNIQUE (level, grade, subject_id)
);

CREATE INDEX idx_subjects_level_grade ON subjects (level, grade);

-- 2. RUNNER CATEGORIES (palabras por categoría)
-- Usado por: Runner, JuegoMemoria, Clasificador, LluviaDePalabras, ExcavacionSelectiva, SnakePalabras
CREATE TABLE IF NOT EXISTS runner_categories (
  id SERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,  -- ej: {1,2,3,4} para compartir entre cursos
  category_name TEXT NOT NULL,
  words JSONB NOT NULL    -- ["palabra1", "palabra2", ...]
);

CREATE INDEX idx_runner_level_subject ON runner_categories (level, subject_id);
CREATE INDEX idx_runner_grades ON runner_categories USING GIN (grades);

-- 3. ROSCO QUESTIONS (preguntas del pasapalabra)
-- Organizado por letra, materia y dificultad
CREATE TABLE IF NOT EXISTS rosco_questions (
  id SERIAL PRIMARY KEY,
  letter VARCHAR(2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'empieza' CHECK (type IN ('empieza', 'contiene', 'conté')),
  definition TEXT NOT NULL,
  solution TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,
  difficulty INT NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3)
  -- 1 = fácil, 2 = medio, 3 = difícil
);

CREATE INDEX idx_rosco_letter ON rosco_questions (letter);
CREATE INDEX idx_rosco_subject_level ON rosco_questions (subject_id, level);
CREATE INDEX idx_rosco_difficulty ON rosco_questions (difficulty);
CREATE INDEX idx_rosco_grades ON rosco_questions USING GIN (grades);

-- 4. INTRUSO SETS (busca el intruso)
CREATE TABLE IF NOT EXISTS intruso_sets (
  id SERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,
  category TEXT NOT NULL,
  correct_items JSONB NOT NULL,  -- ["🦁", "🦅", ...] o ["texto1", "texto2", ...]
  intruder_items JSONB NOT NULL  -- ["🦋", "🐌", ...]
);

CREATE INDEX idx_intruso_level_subject ON intruso_sets (level, subject_id);
CREATE INDEX idx_intruso_grades ON intruso_sets USING GIN (grades);

-- 5. PAREJAS ITEMS (parejas de cartas)
CREATE TABLE IF NOT EXISTS parejas_items (
  id SERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,
  term_a TEXT NOT NULL,
  term_b TEXT NOT NULL
);

CREATE INDEX idx_parejas_level_subject ON parejas_items (level, subject_id);
CREATE INDEX idx_parejas_grades ON parejas_items USING GIN (grades);

-- 6. ORDENA FRASES (frases para reordenar palabras)
CREATE TABLE IF NOT EXISTS ordena_frases (
  id SERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,
  sentence TEXT NOT NULL
);

CREATE INDEX idx_ordena_frases_level_subject ON ordena_frases (level, subject_id);
CREATE INDEX idx_ordena_frases_grades ON ordena_frases USING GIN (grades);

-- 7. ORDENA HISTORIAS (secuencias de frases)
CREATE TABLE IF NOT EXISTS ordena_historias (
  id SERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,
  sentences JSONB NOT NULL  -- ["frase1", "frase2", "frase3", ...]
);

CREATE INDEX idx_ordena_historias_level_subject ON ordena_historias (level, subject_id);
CREATE INDEX idx_ordena_historias_grades ON ordena_historias USING GIN (grades);

-- 8. DETECTIVE SENTENCES (frases sin espacios)
CREATE TABLE IF NOT EXISTS detective_sentences (
  id SERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,
  sentence TEXT NOT NULL
);

CREATE INDEX idx_detective_level_subject ON detective_sentences (level, subject_id);
CREATE INDEX idx_detective_grades ON detective_sentences USING GIN (grades);

-- 9. COMPRENSION TEXTS (textos + preguntas de comprensión)
CREATE TABLE IF NOT EXISTS comprension_texts (
  id SERIAL PRIMARY KEY,
  subject_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primaria', 'eso')),
  grades INT[] NOT NULL,
  title TEXT NOT NULL,
  text_content TEXT NOT NULL,
  questions JSONB NOT NULL
  -- [{pregunta, opciones: [...], correcta: int}, ...]
);

CREATE INDEX idx_comprension_level_subject ON comprension_texts (level, subject_id);
CREATE INDEX idx_comprension_grades ON comprension_texts USING GIN (grades);

-- 10. APP CONTENT (datos especializados: bloques, terminal, personajes, elementos, etc.)
CREATE TABLE IF NOT EXISTS app_content (
  id SERIAL PRIMARY KEY,
  app_type TEXT NOT NULL,  -- 'bloques', 'terminal-retro', 'generador-personajes', 'elementos-quimica', 'banco-tutoria'
  subject_id TEXT,
  level TEXT CHECK (level IN ('primaria', 'eso') OR level IS NULL),
  grades INT[],
  content JSONB NOT NULL   -- Contenido completo en formato nativo
);

CREATE INDEX idx_app_content_type ON app_content (app_type);
CREATE INDEX idx_app_content_level ON app_content (app_type, level);
CREATE INDEX idx_app_content_grades ON app_content USING GIN (grades);

-- ============================================================
-- FUNCIONES RPC para consultar datos de juegos
-- ============================================================

-- Obtener categorías runner para un nivel/curso/asignatura
CREATE OR REPLACE FUNCTION get_runner_data(p_level TEXT, p_grade INT, p_subject TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_object_agg(category_name, words)
  FROM runner_categories
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$$ LANGUAGE sql STABLE;

-- Obtener preguntas del rosco con filtro de dificultad opcional
CREATE OR REPLACE FUNCTION get_rosco_data(
  p_level TEXT,
  p_grade INT,
  p_subject TEXT,
  p_max_difficulty INT DEFAULT 3
)
RETURNS JSONB AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'letra', letter,
      'tipo', type,
      'definicion', definition,
      'solucion', solution,
      'materia', subject_id,
      'difficulty', difficulty
    ) ORDER BY letter, difficulty
  )
  FROM rosco_questions
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades)
    AND difficulty <= p_max_difficulty;
$$ LANGUAGE sql STABLE;

-- Obtener sets de intruso
CREATE OR REPLACE FUNCTION get_intruso_data(p_level TEXT, p_grade INT, p_subject TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'categoria', category,
      'correctos', correct_items,
      'intrusos', intruder_items
    )
  )
  FROM intruso_sets
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$$ LANGUAGE sql STABLE;

-- Obtener parejas
CREATE OR REPLACE FUNCTION get_parejas_data(p_level TEXT, p_grade INT, p_subject TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'a', term_a,
      'b', term_b
    )
  )
  FROM parejas_items
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$$ LANGUAGE sql STABLE;

-- Obtener frases para ordenar
CREATE OR REPLACE FUNCTION get_ordena_frases_data(p_level TEXT, p_grade INT, p_subject TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_agg(sentence)
  FROM ordena_frases
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$$ LANGUAGE sql STABLE;

-- Obtener historias para ordenar
CREATE OR REPLACE FUNCTION get_ordena_historias_data(p_level TEXT, p_grade INT, p_subject TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_agg(sentences)
  FROM ordena_historias
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$$ LANGUAGE sql STABLE;

-- Obtener frases detective
CREATE OR REPLACE FUNCTION get_detective_data(p_level TEXT, p_grade INT, p_subject TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_agg(sentence)
  FROM detective_sentences
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$$ LANGUAGE sql STABLE;

-- Obtener textos de comprensión
CREATE OR REPLACE FUNCTION get_comprension_data(p_level TEXT, p_grade INT, p_subject TEXT)
RETURNS JSONB AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'titulo', title,
      'texto', text_content,
      'preguntas', questions
    )
  )
  FROM comprension_texts
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$$ LANGUAGE sql STABLE;

-- Obtener contenido de apps especializadas
CREATE OR REPLACE FUNCTION get_app_content(p_app_type TEXT, p_level TEXT DEFAULT NULL, p_grade INT DEFAULT NULL)
RETURNS JSONB AS $$
  SELECT jsonb_agg(content)
  FROM app_content
  WHERE app_type = p_app_type
    AND (p_level IS NULL OR level = p_level OR level IS NULL)
    AND (p_grade IS NULL OR p_grade = ANY(grades) OR grades IS NULL);
$$ LANGUAGE sql STABLE;

-- Obtener materias por nivel y curso
CREATE OR REPLACE FUNCTION get_subjects(p_level TEXT, p_grade INT)
RETURNS JSONB AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', subject_id,
      'nombre', name,
      'icon', icon
    )
  )
  FROM subjects
  WHERE level = p_level
    AND grade = p_grade;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- RLS (Row Level Security) - Acceso público de lectura
-- ============================================================
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE runner_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosco_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intruso_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parejas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordena_frases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordena_historias ENABLE ROW LEVEL SECURITY;
ALTER TABLE detective_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprension_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_content ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (anon) para datos de juego
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read runner" ON runner_categories FOR SELECT USING (true);
CREATE POLICY "Public read rosco" ON rosco_questions FOR SELECT USING (true);
CREATE POLICY "Public read intruso" ON intruso_sets FOR SELECT USING (true);
CREATE POLICY "Public read parejas" ON parejas_items FOR SELECT USING (true);
CREATE POLICY "Public read ordena_frases" ON ordena_frases FOR SELECT USING (true);
CREATE POLICY "Public read ordena_historias" ON ordena_historias FOR SELECT USING (true);
CREATE POLICY "Public read detective" ON detective_sentences FOR SELECT USING (true);
CREATE POLICY "Public read comprension" ON comprension_texts FOR SELECT USING (true);
CREATE POLICY "Public read app_content" ON app_content FOR SELECT USING (true);
