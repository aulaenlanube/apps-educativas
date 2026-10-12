-- Excavación Selectiva enviaba correctAnswers = totalQuestions = floor(score/100), así
-- que cualquier partida con ≥100 XP quedaba con nota 10. La app ya envía la nota real
-- (2.000 XP = 10, src/apps/excavacion-selectiva/excavacionScoring.js). Se recalculan las
-- partidas afectadas a partir de su score (que lleva el multiplicador de curso de
-- AppRunnerPage). Aplicada el 12-oct-2026: 5 filas (10 → 7,6 · 3,1 · 3,0 · 0,6 · 1,7);
-- ninguna tarea dependía de ellas (no había tareas de esta app).
-- Deshacer: UPDATE game_sessions g SET nota = b.nota
--           FROM game_sessions_backup_excavacion_20261012 b WHERE b.id = g.id;
CREATE TABLE public.game_sessions_backup_excavacion_20261012 AS
  SELECT * FROM public.game_sessions
  WHERE app_id = 'excavacion-selectiva' AND nota >= 9.95;
ALTER TABLE public.game_sessions_backup_excavacion_20261012 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.game_sessions_backup_excavacion_20261012 FROM anon, authenticated;

UPDATE public.game_sessions gs
SET nota = ROUND(LEAST(10, (gs.score / (CASE gs.level || '-' || gs.grade
      WHEN 'primaria-1' THEN 1.0 WHEN 'primaria-2' THEN 1.1 WHEN 'primaria-3' THEN 1.2
      WHEN 'primaria-4' THEN 1.3 WHEN 'primaria-5' THEN 1.4 WHEN 'primaria-6' THEN 1.5
      WHEN 'eso-1' THEN 1.6 WHEN 'eso-2' THEN 1.7 WHEN 'eso-3' THEN 1.8 WHEN 'eso-4' THEN 1.9
      WHEN 'bachillerato-1' THEN 2.0 WHEN 'bachillerato-2' THEN 2.1 ELSE 1.0 END)) / 2000.0 * 10)::numeric, 1)
WHERE gs.id IN (SELECT id FROM public.game_sessions_backup_excavacion_20261012);
