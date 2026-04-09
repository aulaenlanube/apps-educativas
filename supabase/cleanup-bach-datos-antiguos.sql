-- ============================================================
-- LIMPIEZA: Eliminar datos de bachillerato insertados por
-- migration-bachillerato-datos.sql antes de cargar los seeds masivos
-- Ejecutar ANTES de los seed-bach-*.sql
-- ============================================================

DELETE FROM rosco_questions WHERE level = 'bachillerato';
DELETE FROM runner_categories WHERE level = 'bachillerato';
DELETE FROM intruso_sets WHERE level = 'bachillerato';
DELETE FROM parejas_items WHERE level = 'bachillerato';
DELETE FROM ordena_frases WHERE level = 'bachillerato';
DELETE FROM ordena_historias WHERE level = 'bachillerato';
DELETE FROM detective_sentences WHERE level = 'bachillerato';
DELETE FROM comprension_texts WHERE level = 'bachillerato';

-- NO tocamos: subjects (catálogo de asignaturas) ni app_content
-- Esos se mantienen del migration-bachillerato.sql original

-- ============================================================
-- Ahora ejecutar en orden:
-- 1. seed-bach-lengua-filosofia.sql
-- 2. seed-bach-ciencias-exactas.sql
-- 3. seed-bach-sociales.sql
-- 4. seed-bach-bio-idiomas-otras.sql
-- ============================================================
