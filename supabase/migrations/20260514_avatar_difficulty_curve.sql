-- Endurece los criterios de desbloqueo de avatares para que la curva de
-- progresión sea más exigente:
--   - common  : ligeramente más alto (~1.5x)
--   - rare    : algo más exigente (~2x)
--   - epic    : bastante más difícil (~2.5-3x)
--   - legendary: bastante más difícil (~3-4x)
--   - mythic  : se mantienen los criterios actuales, salvo avatar_046 (Gana 50
--               batallas) que sube a 75 para que legendary < mythic siga ordenado
--               tras pisotearles los topes.
--
-- Además se renombran labels de batallas para hablar siempre en términos de
-- "Gana X batallas":
--   - avatar_042: "Termina en podio en 10 batallas" → "Gana 22 batallas"
--   - avatar_047: "Gana 15 Quiz Battles en 1ª posición" → "Gana 40 batallas"
--     (también se quita position=1 del JSON, era redundante con el default).
--
-- Los avatares ya desbloqueados por alumnos NO se revocan
-- (avatar_check_unlocks solo INSERTA en student_avatars).

-- ============================================================================
-- COMMON (22)
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Publica 2 comentarios de valoración',
    unlock_requirement = '{"type":"feedback_messages","count":2}'::jsonb
WHERE code = 'avatar_057';

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 5 días jugando',
    unlock_requirement = '{"type":"streak_days","count":5}'::jsonb
WHERE code = 'avatar_071';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 13 partidas',
    unlock_requirement = '{"type":"total_sessions","count":13}'::jsonb
WHERE code = 'avatar_072';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 4 sesiones de Mesa de Crafteo',
    unlock_requirement = '{"type":"app_sessions","count":4,"app_id":"mesa-crafteo"}'::jsonb
WHERE code = 'avatar_073';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 4 misiones de Robótica',
    unlock_requirement = '{"type":"app_sessions","count":4,"app_id":"misiones-roboticas"}'::jsonb
WHERE code = 'avatar_074';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 16 partidas',
    unlock_requirement = '{"type":"total_sessions","count":16}'::jsonb
WHERE code = 'avatar_075';

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 6 días jugando',
    unlock_requirement = '{"type":"streak_days","count":6}'::jsonb
WHERE code = 'avatar_076';

UPDATE public.avatar_definitions
SET unlock_label = 'Valora 2 apps',
    unlock_requirement = '{"type":"apps_rated","count":2}'::jsonb
WHERE code = 'avatar_077';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 4 sesiones de Excavación Selectiva',
    unlock_requirement = '{"type":"app_sessions","count":4,"app_id":"excavacion-selectiva"}'::jsonb
WHERE code = 'avatar_078';

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 7 días jugando',
    unlock_requirement = '{"type":"streak_days","count":7}'::jsonb
WHERE code = 'avatar_079';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 4 sesiones del Sistema Solar',
    unlock_requirement = '{"type":"app_sessions","count":4,"app_id":"sistema-solar"}'::jsonb
WHERE code = 'avatar_080';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 18 partidas',
    unlock_requirement = '{"type":"total_sessions","count":18}'::jsonb
WHERE code = 'avatar_081';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 9 partidas',
    unlock_requirement = '{"type":"total_sessions","count":9}'::jsonb
WHERE code = 'avatar_082';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega al menos 5 apps distintas',
    unlock_requirement = '{"type":"unique_apps","count":5}'::jsonb
WHERE code = 'avatar_083';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 4 sesiones de Memoria',
    unlock_requirement = '{"type":"app_sessions","count":4,"app_id":"juego-memoria"}'::jsonb
WHERE code = 'avatar_084';

UPDATE public.avatar_definitions
SET unlock_label = 'Prueba 8 apps distintas',
    unlock_requirement = '{"type":"unique_apps","count":8}'::jsonb
WHERE code = 'avatar_085';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 4 sesiones de Detective de Palabras',
    unlock_requirement = '{"type":"app_sessions","count":4,"app_id":"detective-de-palabras"}'::jsonb
WHERE code = 'avatar_086';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 11 partidas',
    unlock_requirement = '{"type":"total_sessions","count":11}'::jsonb
WHERE code = 'avatar_087';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 4 sesiones de Comprensión Escrita',
    unlock_requirement = '{"type":"app_sessions","count":4,"app_id":"comprension-escrita"}'::jsonb
WHERE code = 'avatar_088';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 14 partidas',
    unlock_requirement = '{"type":"total_sessions","count":14}'::jsonb
WHERE code = 'avatar_089';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 3 partidas',
    unlock_requirement = '{"type":"total_sessions","count":3}'::jsonb
WHERE code = 'avatar_090';

-- avatar_031 (Completa tu primera partida) se mantiene en count=1, es simbólico.

-- ============================================================================
-- RARE (27)
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 6 exámenes del Rosco del Saber',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":6,"app_id":"rosco-del-saber","min_nota":7}'::jsonb
WHERE code = 'avatar_005';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 6 exámenes de Anagramas',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":6,"app_id":"anagramas","min_nota":7}'::jsonb
WHERE code = 'avatar_008';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 6 exámenes de Comprensión Escrita',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":6,"app_id":"comprension-escrita","min_nota":7}'::jsonb
WHERE code = 'avatar_009';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 10 sesiones de Personajes Históricos',
    unlock_requirement = '{"type":"app_sessions","count":10,"app_id":"generador-personajes-historicos"}'::jsonb
WHERE code = 'avatar_010';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 10 misiones del Laboratorio de Robótica',
    unlock_requirement = '{"type":"app_sessions","count":10,"app_id":"laboratorio-robotica"}'::jsonb
WHERE code = 'avatar_011';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 10 misiones de Programación por Bloques',
    unlock_requirement = '{"type":"app_sessions","count":10,"app_id":"programacion-bloques"}'::jsonb
WHERE code = 'avatar_012';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 6 exámenes de Regla de Tres con nota ≥ 8',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":6,"app_id":"regla-de-tres","min_nota":8}'::jsonb
WHERE code = 'avatar_014';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 7 sesiones de Mesa de Crafteo',
    unlock_requirement = '{"type":"app_sessions","count":7,"app_id":"mesa-crafteo"}'::jsonb
WHERE code = 'avatar_015';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 6 exámenes de Excavación Selectiva',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":6,"app_id":"excavacion-selectiva"}'::jsonb
WHERE code = 'avatar_016';

UPDATE public.avatar_definitions
SET unlock_label = 'Publica 20 comentarios de valoración',
    unlock_requirement = '{"type":"feedback_messages","count":20}'::jsonb
WHERE code = 'avatar_017';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 6 batallas',
    unlock_requirement = '{"type":"battles_won","count":6}'::jsonb
WHERE code = 'avatar_019';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 10 exámenes de Velocidad de Respuesta',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":10,"app_id":"velocidad-respuesta"}'::jsonb
WHERE code = 'avatar_020';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 6 duelos',
    unlock_requirement = '{"type":"duels_won","count":6}'::jsonb
WHERE code = 'avatar_022';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 12 duelos',
    unlock_requirement = '{"type":"duels_won","count":12}'::jsonb
WHERE code = 'avatar_023';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 10 sesiones de Excavación Selectiva',
    unlock_requirement = '{"type":"app_sessions","count":10,"app_id":"excavacion-selectiva"}'::jsonb
WHERE code = 'avatar_024';

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 12 días jugando',
    unlock_requirement = '{"type":"streak_days","count":12}'::jsonb
WHERE code = 'avatar_026';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥7 en 10 apps distintas',
    unlock_requirement = '{"type":"high_score_exams","count":10,"min_nota":7}'::jsonb
WHERE code = 'avatar_028';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 10 sesiones del Sistema Solar',
    unlock_requirement = '{"type":"app_sessions","count":10,"app_id":"sistema-solar"}'::jsonb
WHERE code = 'avatar_030';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 10 exámenes del Sistema Solar',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":10,"app_id":"sistema-solar"}'::jsonb
WHERE code = 'avatar_032';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 22 días seguidos',
    unlock_requirement = '{"type":"streak_days","count":22}'::jsonb
WHERE code = 'avatar_033';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 10 exámenes de Detective de Palabras',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":10,"app_id":"detective-de-palabras"}'::jsonb
WHERE code = 'avatar_034';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 10 misiones de Robótica',
    unlock_requirement = '{"type":"app_sessions","count":10,"app_id":"misiones-roboticas"}'::jsonb
WHERE code = 'avatar_035';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 10 exámenes de Velocidad de Respuesta con nota ≥ 7',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":10,"app_id":"velocidad-respuesta","min_nota":7}'::jsonb
WHERE code = 'avatar_040';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega al menos 14 apps distintas',
    unlock_requirement = '{"type":"unique_apps","count":14}'::jsonb
WHERE code = 'avatar_043';

UPDATE public.avatar_definitions
SET unlock_label = 'Valora 20 apps distintas',
    unlock_requirement = '{"type":"apps_rated","count":20}'::jsonb
WHERE code = 'avatar_093';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 10 exámenes de Memoria',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":10,"app_id":"juego-memoria"}'::jsonb
WHERE code = 'avatar_095';

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 17 días jugando',
    unlock_requirement = '{"type":"streak_days","count":17}'::jsonb
WHERE code = 'avatar_096';

-- ============================================================================
-- EPIC (24)
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Valora 90 apps distintas',
    unlock_requirement = '{"type":"apps_rated","count":90}'::jsonb
WHERE code = 'avatar_001';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥8.5 en 12 apps distintas',
    unlock_requirement = '{"type":"high_score_exams","count":12,"min_nota":8.5}'::jsonb
WHERE code = 'avatar_002';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 25 duelos',
    unlock_requirement = '{"type":"duels_won","count":25}'::jsonb
WHERE code = 'avatar_004';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 12 exámenes de Ahorcado con nota ≥ 8',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":12,"app_id":"ahorcado","min_nota":8}'::jsonb
WHERE code = 'avatar_006';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥8 en 12 apps distintas de Lengua',
    unlock_requirement = '{"type":"subject_exams","count":12,"min_nota":8,"subject_id":"lengua"}'::jsonb
WHERE code = 'avatar_013';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 18 batallas',
    unlock_requirement = '{"type":"battles_won","count":18}'::jsonb
WHERE code = 'avatar_018';

UPDATE public.avatar_definitions
SET unlock_label = 'Publica 100 comentarios de valoración',
    unlock_requirement = '{"type":"feedback_messages","count":100}'::jsonb
WHERE code = 'avatar_021';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥8 en 12 apps distintas de Sociales',
    unlock_requirement = '{"type":"subject_exams","count":12,"min_nota":8,"subject_id":"sociales"}'::jsonb
WHERE code = 'avatar_025';

UPDATE public.avatar_definitions
SET unlock_label = 'Sé el #1 de tu clase',
    unlock_requirement = '{"type":"top_class","position":1}'::jsonb
WHERE code = 'avatar_027';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 40 duelos',
    unlock_requirement = '{"type":"duels_won","count":40}'::jsonb
WHERE code = 'avatar_029';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥7 en 14 apps distintas',
    unlock_requirement = '{"type":"high_score_exams","count":14,"min_nota":7}'::jsonb
WHERE code = 'avatar_036';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥8 en 12 apps distintas de Naturales',
    unlock_requirement = '{"type":"subject_exams","count":12,"min_nota":8,"subject_id":"naturales"}'::jsonb
WHERE code = 'avatar_038';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥8 en 14 apps distintas de Matemáticas',
    unlock_requirement = '{"type":"subject_exams","count":14,"min_nota":8,"subject_id":"matematicas"}'::jsonb
WHERE code = 'avatar_039';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 22 batallas',
    unlock_requirement = '{"type":"battles_won","count":22}'::jsonb
WHERE code = 'avatar_042';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9 en 12 apps distintas de Matemáticas',
    unlock_requirement = '{"type":"subject_exams","count":12,"min_nota":9,"subject_id":"matematicas"}'::jsonb
WHERE code = 'avatar_049';

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 45 días',
    unlock_requirement = '{"type":"streak_days","count":45}'::jsonb
WHERE code = 'avatar_058';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9 en 12 apps distintas de Lengua',
    unlock_requirement = '{"type":"subject_exams","count":12,"min_nota":9,"subject_id":"lengua"}'::jsonb
WHERE code = 'avatar_059';

UPDATE public.avatar_definitions
SET unlock_label = 'Completa 120 partidas en modo examen',
    unlock_requirement = '{"mode":"test","type":"total_sessions","count":120}'::jsonb
WHERE code = 'avatar_062';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 50 duelos',
    unlock_requirement = '{"type":"duels_won","count":50}'::jsonb
WHERE code = 'avatar_064';

UPDATE public.avatar_definitions
SET unlock_label = 'Domina 50 apps distintas',
    unlock_requirement = '{"type":"unique_apps","count":50}'::jsonb
WHERE code = 'avatar_068';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9.5 en 14 apps distintas',
    unlock_requirement = '{"type":"high_score_exams","count":14,"min_nota":9.5}'::jsonb
WHERE code = 'avatar_070';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥8 en 14 apps distintas',
    unlock_requirement = '{"type":"high_score_exams","count":14,"min_nota":8}'::jsonb
WHERE code = 'avatar_094';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 30 duelos',
    unlock_requirement = '{"type":"duels_won","count":30}'::jsonb
WHERE code = 'avatar_097';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 12 exámenes de Comprensión Escrita con nota ≥ 8',
    unlock_requirement = '{"mode":"test","type":"app_sessions","count":12,"app_id":"comprension-escrita","min_nota":8}'::jsonb
WHERE code = 'avatar_098';

-- ============================================================================
-- LEGENDARY (19)
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9 en 20 apps distintas de Lengua',
    unlock_requirement = '{"type":"subject_exams","count":20,"min_nota":9,"subject_id":"lengua"}'::jsonb
WHERE code = 'avatar_003';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue nota perfecta en 25 apps distintas',
    unlock_requirement = '{"type":"perfect_exams","count":25}'::jsonb
WHERE code = 'avatar_007';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 70 duelos',
    unlock_requirement = '{"type":"duels_won","count":70}'::jsonb
WHERE code = 'avatar_037';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 95 duelos',
    unlock_requirement = '{"type":"duels_won","count":95}'::jsonb
WHERE code = 'avatar_041';

UPDATE public.avatar_definitions
SET unlock_label = 'Publica 250 comentarios de valoración',
    unlock_requirement = '{"type":"feedback_messages","count":250}'::jsonb
WHERE code = 'avatar_044';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 55 batallas',
    unlock_requirement = '{"type":"battles_won","count":55}'::jsonb
WHERE code = 'avatar_045';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 40 batallas',
    unlock_requirement = '{"type":"battles_won","count":40}'::jsonb
WHERE code = 'avatar_047';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue nota perfecta en 15 apps distintas de Naturales',
    unlock_requirement = '{"type":"subject_exams","count":15,"min_nota":9.5,"subject_id":"naturales"}'::jsonb
WHERE code = 'avatar_050';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9 en 25 apps distintas',
    unlock_requirement = '{"type":"high_score_exams","count":25,"min_nota":9}'::jsonb
WHERE code = 'avatar_053';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9.5 en 20 apps distintas de Matemáticas',
    unlock_requirement = '{"type":"subject_exams","count":20,"min_nota":9.5,"subject_id":"matematicas"}'::jsonb
WHERE code = 'avatar_054';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9.5 en 22 apps distintas de Matemáticas',
    unlock_requirement = '{"type":"subject_exams","count":22,"min_nota":9.5,"subject_id":"matematicas"}'::jsonb
WHERE code = 'avatar_055';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 10 apps distintas de Plástica',
    unlock_requirement = '{"type":"subject_exams","count":10,"subject_id":"plastica"}'::jsonb
WHERE code = 'avatar_056';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega a 80 apps distintas de la plataforma',
    unlock_requirement = '{"type":"unique_apps","count":80}'::jsonb
WHERE code = 'avatar_061';

UPDATE public.avatar_definitions
SET unlock_label = 'Acumula 500.000 XP',
    unlock_requirement = '{"type":"xp","amount":500000}'::jsonb
WHERE code = 'avatar_063';

UPDATE public.avatar_definitions
SET unlock_label = 'Valora 200 apps distintas',
    unlock_requirement = '{"type":"apps_rated","count":200}'::jsonb
WHERE code = 'avatar_065';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 85 duelos',
    unlock_requirement = '{"type":"duels_won","count":85}'::jsonb
WHERE code = 'avatar_067';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega al menos 35 apps distintas',
    unlock_requirement = '{"type":"unique_apps","count":35}'::jsonb
WHERE code = 'avatar_091';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue nota perfecta en 30 apps distintas',
    unlock_requirement = '{"type":"perfect_exams","count":30}'::jsonb
WHERE code = 'avatar_092';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con ≥9 en 18 apps distintas de Naturales',
    unlock_requirement = '{"type":"subject_exams","count":18,"min_nota":9,"subject_id":"naturales"}'::jsonb
WHERE code = 'avatar_099';

UPDATE public.avatar_definitions
SET unlock_label = 'Juega 60 días seguidos',
    unlock_requirement = '{"type":"streak_days","count":60}'::jsonb
WHERE code = 'avatar_100';

-- ============================================================================
-- MYTHIC (1) — solo el de batallas, para mantener leg < myth tras subir leg
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 75 batallas',
    unlock_requirement = '{"type":"battles_won","count":75}'::jsonb
WHERE code = 'avatar_046';
