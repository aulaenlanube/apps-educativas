-- ============================================================================
-- Feature: Duelos 1v1 entre alumnos
-- Fecha: 2026-04-20
-- ----------------------------------------------------------------------------
-- Incluye:
--   * Tablas: duels, duel_rounds, duel_grade_ledger
--   * Extension de user_notifications (tipos nuevos de notificacion: solo
--     anaden valores, no modifican esquema)
--   * Extension de assignments para tareas tipo duelo
--   * Indices + RLS
--   * RPCs (SECURITY DEFINER) para orquestar todo el ciclo
--
-- Conceptos:
--   * stake         -> cantidad en juego (0.1 / 0.2 / 0.3)
--   * ledger        -> tabla append-only con deltas +/-, el balance
--                      del alumno es SUM(delta) y la deuda por duelo
--                      concreto es SUM(delta WHERE duel_id=X)
--   * recovery      -> cada partida en solitario en la app del duelo
--                      perdido genera un +delta (reason='recovery')
--                      hasta saldar la deuda de ese duelo concreto
--   * host-authority-> el retador ejecuta la simulacion autoritativa;
--                      al reportar el resultado la RPC valida y escribe
-- ============================================================================

-- ============================================================================
-- 1. ENUM tipos
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE duel_status AS ENUM (
    'pending',     -- invitacion enviada, a la espera de aceptacion
    'accepted',    -- aceptada, ambos en lobby antes de empezar
    'in_progress', -- partida activa
    'finished',    -- terminada con ganador valido
    'rejected',    -- el oponente la rechazo
    'cancelled',   -- cancelada antes de empezar (timeout, retirada)
    'void'         -- anulada por desconexion/fallo (sin afectar ledger)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE duel_ledger_reason AS ENUM (
    'win',        -- +stake
    'loss',       -- -stake
    'recovery'    -- +parcial recuperado jugando en solitario
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 2. TABLAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.duels (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id      uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  opponent_id        uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  -- Duelos pueden ser entre alumnos de distintos grupos del mismo profesor.
  -- teacher_id es el profesor "raiz" (siempre). group_id se rellena solo si
  -- ambos alumnos comparten un grupo (mismo grupo = mejor trazabilidad).
  teacher_id         uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  group_id           uuid REFERENCES public.groups(id)            ON DELETE SET NULL,
  app_id             text NOT NULL,
  app_name           text NOT NULL,
  level              text NOT NULL,
  grade              text NOT NULL,
  subject_id         text,
  stake              numeric(3,1) NOT NULL CHECK (stake IN (0.1, 0.2, 0.3)),
  is_hidden          boolean NOT NULL DEFAULT false,
  -- mejor de N partidas/rondas; 1 para apps turn-based de una sola ronda
  best_of            smallint NOT NULL DEFAULT 1 CHECK (best_of IN (1, 3, 5, 7)),
  status             duel_status NOT NULL DEFAULT 'pending',
  winner_id          uuid REFERENCES public.students(id) ON DELETE SET NULL,
  void_reason        text,
  -- asignacion por profesor (NULL si es reto directo alumno-alumno)
  assignment_pair_id uuid,
  created_at         timestamptz NOT NULL DEFAULT now(),
  accepted_at        timestamptz,
  started_at         timestamptz,
  finished_at        timestamptz,
  CONSTRAINT duels_distinct_players CHECK (challenger_id <> opponent_id)
);

CREATE INDEX IF NOT EXISTS idx_duels_challenger ON public.duels(challenger_id, status);
CREATE INDEX IF NOT EXISTS idx_duels_opponent   ON public.duels(opponent_id, status);
CREATE INDEX IF NOT EXISTS idx_duels_teacher    ON public.duels(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_duels_group      ON public.duels(group_id, status);
CREATE INDEX IF NOT EXISTS idx_duels_assignment ON public.duels(assignment_pair_id);
CREATE INDEX IF NOT EXISTS idx_duels_created    ON public.duels(created_at DESC);

-- Rondas (para Snake/Ahorcado best-of-5). Apps turn-based de una sola
-- partida (Rosco) no generan filas aqui.
CREATE TABLE IF NOT EXISTS public.duel_rounds (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id     uuid NOT NULL REFERENCES public.duels(id) ON DELETE CASCADE,
  round_index smallint NOT NULL,
  winner_id   uuid REFERENCES public.students(id) ON DELETE SET NULL,
  payload     jsonb,              -- datos opcionales (longitud serpiente, tiempo, etc.)
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (duel_id, round_index)
);

CREATE INDEX IF NOT EXISTS idx_duel_rounds_duel ON public.duel_rounds(duel_id, round_index);

-- Libro mayor append-only de bonificaciones/penalizaciones por duelos.
--   * Balance del alumno   = SUM(delta) de sus filas
--   * Deuda de un duelo X  = -SUM(delta WHERE duel_id=X) cuando es >0
CREATE TABLE IF NOT EXISTS public.duel_grade_ledger (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  duel_id           uuid NOT NULL REFERENCES public.duels(id)    ON DELETE CASCADE,
  delta             numeric(4,2) NOT NULL,  -- positivo o negativo
  reason            duel_ledger_reason NOT NULL,
  -- solo para reason='recovery' (la sesion solitaria que recupero algo)
  game_session_id   uuid REFERENCES public.game_sessions(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_student      ON public.duel_grade_ledger(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_student_duel ON public.duel_grade_ledger(student_id, duel_id);
CREATE INDEX IF NOT EXISTS idx_ledger_duel         ON public.duel_grade_ledger(duel_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ledger_session_duel
  ON public.duel_grade_ledger(student_id, duel_id, game_session_id)
  WHERE game_session_id IS NOT NULL;

-- ============================================================================
-- 3. EXTENSION DE assignments (tareas de tipo duelo)
-- ============================================================================

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS assignment_type text NOT NULL DEFAULT 'standard'
    CHECK (assignment_type IN ('standard', 'duel'));

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS duel_stake numeric(3,1)
    CHECK (duel_stake IS NULL OR duel_stake IN (0.1, 0.2, 0.3));

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS duel_pair_id uuid;

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS duel_id uuid REFERENCES public.duels(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_duel_pair ON public.assignments(duel_pair_id)
  WHERE duel_pair_id IS NOT NULL;

-- ============================================================================
-- 4. RLS
-- ============================================================================

ALTER TABLE public.duels              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_rounds        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_grade_ledger  ENABLE ROW LEVEL SECURITY;

-- Los alumnos usan sesion custom (no auth.uid()). Toda escritura se hace
-- exclusivamente via RPCs SECURITY DEFINER. Para lectura, permitimos a
-- cualquier sesion autenticada leer (el alumno pide solo lo suyo desde
-- RPCs tambien SECURITY DEFINER). Mantenemos RLS habilitado para blindar
-- acceso directo desde el cliente.

-- Profesor lee duelos cuyo teacher_id coincide (reto directo) o donde
-- co-ensena el grupo (para duelos asignados como tarea con group_id).
DROP POLICY IF EXISTS duels_teacher_read ON public.duels;
CREATE POLICY duels_teacher_read ON public.duels
  FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR (
      group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_teachers gt
        WHERE gt.group_id = duels.group_id
          AND gt.teacher_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS duel_rounds_teacher_read ON public.duel_rounds;
CREATE POLICY duel_rounds_teacher_read ON public.duel_rounds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.duels d
      WHERE d.id = duel_rounds.duel_id
        AND (d.teacher_id = auth.uid()
             OR (d.group_id IS NOT NULL AND EXISTS (
                  SELECT 1 FROM public.group_teachers gt
                  WHERE gt.group_id = d.group_id AND gt.teacher_id = auth.uid()
             )))
    )
  );

DROP POLICY IF EXISTS ledger_teacher_read ON public.duel_grade_ledger;
CREATE POLICY ledger_teacher_read ON public.duel_grade_ledger
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.student_groups sg ON sg.student_id = s.id
      JOIN public.group_teachers gt ON gt.group_id = sg.group_id
      WHERE s.id = duel_grade_ledger.student_id
        AND gt.teacher_id = auth.uid()
    )
  );

-- Lectura para alumnos autenticados via auth.users (student_link_auth_user):
DROP POLICY IF EXISTS duels_student_read ON public.duels;
CREATE POLICY duels_student_read ON public.duels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.auth_user_id = auth.uid()
        AND (s.id = duels.challenger_id OR s.id = duels.opponent_id)
    )
  );

DROP POLICY IF EXISTS duel_rounds_student_read ON public.duel_rounds;
CREATE POLICY duel_rounds_student_read ON public.duel_rounds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.duels d
      JOIN public.students s ON s.auth_user_id = auth.uid()
      WHERE d.id = duel_rounds.duel_id
        AND (s.id = d.challenger_id OR s.id = d.opponent_id)
    )
  );

DROP POLICY IF EXISTS ledger_student_read ON public.duel_grade_ledger;
CREATE POLICY ledger_student_read ON public.duel_grade_ledger
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.auth_user_id = auth.uid() AND s.id = duel_grade_ledger.student_id
    )
  );

-- Escritura: siempre via RPC SECURITY DEFINER (no policy INSERT/UPDATE aqui).

-- ============================================================================
-- 5. RPCs
-- ============================================================================

-- Devuelve apps "duelables" disponibles (fuente de verdad: commonApps.js
-- en el frontend; aqui solo validamos el app_id contra la lista cliente).
-- Mantener en sync manualmente es mas sencillo que tener un catalogo DB.

-- ----------------------------------------------------------------------------
-- 5.1 Utilidades internas
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public._duel_student_in_group(p_student uuid, p_group uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_groups
    WHERE student_id = p_student AND group_id = p_group
  );
$$;

-- Devuelve los profesores que ensenan a un alumno (propietario del grupo
-- o co-profesor de cualquier grupo donde el alumno este inscrito).
CREATE OR REPLACE FUNCTION public._duel_student_teachers(p_student uuid)
RETURNS TABLE (teacher_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT g.teacher_id
  FROM public.student_groups sg
  JOIN public.groups g ON g.id = sg.group_id
  WHERE sg.student_id = p_student
  UNION
  SELECT DISTINCT gt.teacher_id
  FROM public.student_groups sg
  JOIN public.group_teachers gt ON gt.group_id = sg.group_id
  WHERE sg.student_id = p_student;
$$;

-- Devuelve un profesor comun a dos alumnos (o NULL si no comparten ninguno).
CREATE OR REPLACE FUNCTION public._duel_shared_teacher(p_a uuid, p_b uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT teacher_id FROM public._duel_student_teachers(p_a)
  INTERSECT
  SELECT teacher_id FROM public._duel_student_teachers(p_b)
  LIMIT 1;
$$;

-- Devuelve un grupo comun a dos alumnos (o NULL si no comparten ninguno).
CREATE OR REPLACE FUNCTION public._duel_shared_group(p_a uuid, p_b uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.group_id
  FROM public.student_groups a
  JOIN public.student_groups b ON b.group_id = a.group_id
  WHERE a.student_id = p_a AND b.student_id = p_b
  LIMIT 1;
$$;

-- Deuda activa del alumno por duelo (sum negativo = aun debe).
-- Devuelve solo duelos perdidos donde el balance especifico < 0.
CREATE OR REPLACE FUNCTION public._duel_active_debts(p_student uuid)
RETURNS TABLE (
  duel_id        uuid,
  app_id         text,
  app_name       text,
  level          text,
  grade          text,
  subject_id     text,
  original_stake numeric,
  remaining      numeric,
  finished_at    timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.id, d.app_id, d.app_name, d.level, d.grade, d.subject_id,
         d.stake            AS original_stake,
         ABS(SUM(l.delta))  AS remaining,
         d.finished_at
  FROM public.duels d
  JOIN public.duel_grade_ledger l ON l.duel_id = d.id AND l.student_id = p_student
  WHERE d.status = 'finished'
    AND d.winner_id IS NOT NULL
    AND d.winner_id <> p_student
  GROUP BY d.id
  HAVING SUM(l.delta) < 0
  ORDER BY d.finished_at ASC;
$$;

-- ----------------------------------------------------------------------------
-- 5.2 Crear duelo (reto directo alumno -> alumno)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_create_duel(
  p_challenger_id uuid,
  p_opponent_id   uuid,
  p_app_id        text,
  p_app_name      text,
  p_level         text,
  p_grade         text,
  p_subject_id    text,
  p_stake         numeric,
  p_best_of       smallint DEFAULT 1,
  p_is_hidden     boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duel_id    uuid;
  v_teacher_id uuid;
  v_group_id   uuid;
BEGIN
  IF p_challenger_id = p_opponent_id THEN
    RAISE EXCEPTION 'No puedes retarte a ti mismo';
  END IF;
  IF p_stake NOT IN (0.1, 0.2, 0.3) THEN
    RAISE EXCEPTION 'Stake invalido';
  END IF;

  v_teacher_id := public._duel_shared_teacher(p_challenger_id, p_opponent_id);
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'No compartis profesor, no podeis retaros';
  END IF;

  v_group_id := public._duel_shared_group(p_challenger_id, p_opponent_id);

  INSERT INTO public.duels (
    challenger_id, opponent_id, teacher_id, group_id, app_id, app_name,
    level, grade, subject_id, stake, best_of, is_hidden
  ) VALUES (
    p_challenger_id, p_opponent_id, v_teacher_id, v_group_id, p_app_id, p_app_name,
    p_level, p_grade, p_subject_id, p_stake, COALESCE(p_best_of, 1), p_is_hidden
  )
  RETURNING id INTO v_duel_id;

  -- Notificacion al oponente
  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES (
    'student', p_opponent_id, 'duel_invite',
    CASE WHEN p_is_hidden THEN 'Te han retado a un duelo oculto' ELSE 'Te han retado a un duelo' END,
    p_app_name,
    jsonb_build_object(
      'duel_id', v_duel_id,
      'app_id',  p_app_id,
      'stake',   p_stake,
      'hidden',  p_is_hidden
    )
  );

  RETURN v_duel_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.3 Aceptar duelo
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_accept_duel(
  p_duel_id    uuid,
  p_student_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duel public.duels%ROWTYPE;
BEGIN
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Duelo inexistente'; END IF;
  IF v_duel.opponent_id <> p_student_id THEN
    RAISE EXCEPTION 'Solo el oponente puede aceptar';
  END IF;
  IF v_duel.status <> 'pending' THEN
    RAISE EXCEPTION 'El duelo ya no esta pendiente';
  END IF;

  UPDATE public.duels
  SET status = 'accepted', accepted_at = now()
  WHERE id = p_duel_id;

  -- Avisar al retador para que entre a la sala
  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES (
    'student', v_duel.challenger_id, 'duel_accepted',
    'Tu duelo ha sido aceptado', v_duel.app_name,
    jsonb_build_object('duel_id', p_duel_id, 'app_id', v_duel.app_id)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.4 Rechazar o cancelar
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_reject_duel(
  p_duel_id    uuid,
  p_student_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duel public.duels%ROWTYPE;
BEGIN
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Duelo inexistente'; END IF;
  IF v_duel.opponent_id <> p_student_id AND v_duel.challenger_id <> p_student_id THEN
    RAISE EXCEPTION 'No eres parte del duelo';
  END IF;
  IF v_duel.status NOT IN ('pending', 'accepted') THEN
    RAISE EXCEPTION 'El duelo ya no puede rechazarse';
  END IF;

  UPDATE public.duels
  SET status = CASE WHEN v_duel.status = 'pending' THEN 'rejected'::duel_status ELSE 'cancelled'::duel_status END,
      finished_at = now()
  WHERE id = p_duel_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.5 Marcar partida como iniciada (cuando ambos estan listos)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_start_duel(
  p_duel_id    uuid,
  p_student_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duel public.duels%ROWTYPE;
BEGIN
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Duelo inexistente'; END IF;
  IF p_student_id NOT IN (v_duel.challenger_id, v_duel.opponent_id) THEN
    RAISE EXCEPTION 'No eres parte del duelo';
  END IF;
  IF v_duel.status = 'in_progress' THEN RETURN; END IF;
  IF v_duel.status <> 'accepted' THEN
    RAISE EXCEPTION 'El duelo no esta aceptado';
  END IF;

  UPDATE public.duels
  SET status = 'in_progress', started_at = now()
  WHERE id = p_duel_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.6 Anular (desconexion, error)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_void_duel(
  p_duel_id uuid,
  p_reason  text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duel public.duels%ROWTYPE;
BEGIN
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Duelo inexistente'; END IF;
  IF v_duel.status IN ('finished', 'void', 'rejected', 'cancelled') THEN RETURN; END IF;

  UPDATE public.duels
  SET status = 'void', void_reason = p_reason, finished_at = now()
  WHERE id = p_duel_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.7 Reportar resultado final (host-authority)
--     - winner_id: ganador. Si NULL -> anula la partida (empate tecnico).
--     - rounds:    array jsonb opcional [{round_index, winner_id, payload}]
--     Escribe ledger solo si hay ganador y el duelo sigue activo.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_report_duel_result(
  p_duel_id   uuid,
  p_reporter  uuid,
  p_winner_id uuid,
  p_rounds    jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duel   public.duels%ROWTYPE;
  v_loser  uuid;
  v_round  jsonb;
BEGIN
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Duelo inexistente'; END IF;
  IF p_reporter <> v_duel.challenger_id THEN
    -- Solo el host (retador) puede reportar en host-authority
    RAISE EXCEPTION 'Solo el retador puede reportar el resultado';
  END IF;
  IF v_duel.status NOT IN ('in_progress', 'accepted') THEN
    RAISE EXCEPTION 'El duelo no esta en curso';
  END IF;

  -- Guardar rondas si se proporcionan (Snake/Ahorcado best-of-N)
  IF p_rounds IS NOT NULL THEN
    FOR v_round IN SELECT * FROM jsonb_array_elements(p_rounds) LOOP
      INSERT INTO public.duel_rounds (duel_id, round_index, winner_id, payload)
      VALUES (
        p_duel_id,
        (v_round->>'round_index')::smallint,
        NULLIF(v_round->>'winner_id', '')::uuid,
        v_round->'payload'
      )
      ON CONFLICT (duel_id, round_index) DO NOTHING;
    END LOOP;
  END IF;

  -- Partida nula
  IF p_winner_id IS NULL THEN
    UPDATE public.duels
    SET status = 'void', void_reason = 'no_winner', finished_at = now()
    WHERE id = p_duel_id;
    RETURN jsonb_build_object('status', 'void');
  END IF;

  IF p_winner_id NOT IN (v_duel.challenger_id, v_duel.opponent_id) THEN
    RAISE EXCEPTION 'El ganador debe ser uno de los participantes';
  END IF;

  v_loser := CASE WHEN p_winner_id = v_duel.challenger_id
                  THEN v_duel.opponent_id ELSE v_duel.challenger_id END;

  UPDATE public.duels
  SET status = 'finished', winner_id = p_winner_id, finished_at = now()
  WHERE id = p_duel_id;

  -- Escribir ledger (+stake ganador, -stake perdedor)
  INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
  VALUES (p_winner_id, p_duel_id,  v_duel.stake, 'win');
  INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
  VALUES (v_loser,     p_duel_id, -v_duel.stake, 'loss');

  -- Notificacion a ambos
  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES
    ('student', p_winner_id, 'duel_result', 'Has ganado el duelo', v_duel.app_name,
      jsonb_build_object('duel_id', p_duel_id, 'result', 'win', 'delta', v_duel.stake)),
    ('student', v_loser,     'duel_result', 'Has perdido el duelo', v_duel.app_name,
      jsonb_build_object('duel_id', p_duel_id, 'result', 'loss', 'delta', -v_duel.stake));

  RETURN jsonb_build_object(
    'status', 'finished',
    'winner_id', p_winner_id,
    'loser_id',  v_loser,
    'stake',     v_duel.stake
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.7b Listar oponentes disponibles para el alumno
--      (todos los alumnos que comparten al menos un profesor, excluyendose
--       a si mismo y a alumnos desactivados).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_get_duel_opponents(p_student_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH my_teachers AS (
    SELECT teacher_id FROM public._duel_student_teachers(p_student_id)
  ),
  my_groups AS (
    SELECT group_id FROM public.student_groups WHERE student_id = p_student_id
  ),
  candidates AS (
    SELECT DISTINCT s.id, s.display_name, s.avatar_emoji, sg.group_id, g.name AS group_name
    FROM public.student_groups sg
    JOIN public.students s ON s.id = sg.student_id
    JOIN public.groups    g ON g.id = sg.group_id
    WHERE s.id <> p_student_id
      AND (
        g.teacher_id IN (SELECT teacher_id FROM my_teachers)
        OR g.id IN (
          SELECT group_id FROM public.group_teachers
          WHERE teacher_id IN (SELECT teacher_id FROM my_teachers)
        )
      )
  )
  SELECT COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
    'id',          c.id,
    'name',        c.display_name,
    'emoji',       c.avatar_emoji,
    'group_id',    c.group_id,
    'group_name',  c.group_name,
    'same_group',  c.group_id IN (SELECT group_id FROM my_groups)
  )), '[]'::jsonb)
  FROM candidates c;
$$;

-- ----------------------------------------------------------------------------
-- 5.8 Listar duelos pendientes/activos del alumno
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_get_duels(p_student_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'incoming', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id',    d.id,
        'challenger', CASE WHEN d.is_hidden AND d.status = 'pending'
                           THEN jsonb_build_object('hidden', true)
                           ELSE jsonb_build_object('id', s.id, 'name', s.display_name, 'emoji', s.avatar_emoji) END,
        'app_id',     d.app_id,
        'app_name',   d.app_name,
        'stake',      d.stake,
        'status',     d.status,
        'is_hidden',  d.is_hidden,
        'best_of',    d.best_of,
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC)
      FROM public.duels d
      JOIN public.students s ON s.id = d.challenger_id
      WHERE d.opponent_id = p_student_id
        AND d.status IN ('pending', 'accepted', 'in_progress')
    ), '[]'::jsonb),
    'outgoing', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id',    d.id,
        'opponent',   jsonb_build_object('id', s.id, 'name', s.display_name, 'emoji', s.avatar_emoji),
        'app_id',     d.app_id,
        'app_name',   d.app_name,
        'stake',      d.stake,
        'status',     d.status,
        'is_hidden',  d.is_hidden,
        'best_of',    d.best_of,
        'created_at', d.created_at
      ) ORDER BY d.created_at DESC)
      FROM public.duels d
      JOIN public.students s ON s.id = d.opponent_id
      WHERE d.challenger_id = p_student_id
        AND d.status IN ('pending', 'accepted', 'in_progress')
    ), '[]'::jsonb)
  );
$$;

-- Estado completo de un duelo para la sala/partida.
CREATE OR REPLACE FUNCTION public.student_get_duel_state(
  p_duel_id    uuid,
  p_student_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_duel   public.duels%ROWTYPE;
  v_result jsonb;
  v_reveal boolean;
BEGIN
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Duelo inexistente'; END IF;
  IF p_student_id NOT IN (v_duel.challenger_id, v_duel.opponent_id) THEN
    RAISE EXCEPTION 'No eres parte del duelo';
  END IF;

  -- Revelamos identidades si ya no es oculto o si ya finalizo o si el que pide es el retador
  v_reveal := (NOT v_duel.is_hidden)
           OR v_duel.status IN ('finished', 'void', 'in_progress')
           OR p_student_id = v_duel.challenger_id;

  SELECT jsonb_build_object(
    'id',            v_duel.id,
    'status',        v_duel.status,
    'app_id',        v_duel.app_id,
    'app_name',      v_duel.app_name,
    'level',         v_duel.level,
    'grade',         v_duel.grade,
    'subject_id',    v_duel.subject_id,
    'stake',         v_duel.stake,
    'best_of',       v_duel.best_of,
    'is_hidden',     v_duel.is_hidden,
    'winner_id',     v_duel.winner_id,
    'void_reason',   v_duel.void_reason,
    'challenger',    CASE WHEN v_reveal THEN
      (SELECT jsonb_build_object('id', s.id, 'name', s.display_name, 'emoji', s.avatar_emoji)
       FROM public.students s WHERE s.id = v_duel.challenger_id)
      ELSE jsonb_build_object('id', v_duel.challenger_id, 'hidden', true) END,
    'opponent',      (SELECT jsonb_build_object('id', s.id, 'name', s.display_name, 'emoji', s.avatar_emoji)
                      FROM public.students s WHERE s.id = v_duel.opponent_id),
    'rounds',        COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'round_index', round_index,
        'winner_id',   winner_id,
        'payload',     payload
      ) ORDER BY round_index) FROM public.duel_rounds WHERE duel_id = v_duel.id
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.9 Balance y deuda del alumno
--     Devuelve:
--       nota_base  -> gradeStats.final_grade (de teacher_get_student_term_grades)
--       bonus      -> SUM(ledger.delta)
--       nota_final -> nota_base + bonus
--       debts[]    -> duelos con saldo negativo (para la UI de deuda)
--       history[]  -> ultimos movimientos
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_get_grade_with_duel_bonus(p_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_bonus    numeric;
  v_term     jsonb;
  v_nota_base numeric;
BEGIN
  SELECT COALESCE(SUM(delta), 0) INTO v_bonus
  FROM public.duel_grade_ledger WHERE student_id = p_student_id;

  -- Reutilizamos el calculo de nota base ya existente
  BEGIN
    v_term := public.teacher_get_student_term_grades(p_student_id);
  EXCEPTION WHEN OTHERS THEN v_term := NULL; END;

  v_nota_base := NULLIF((v_term->>'final_grade')::numeric, 0);

  RETURN jsonb_build_object(
    'nota_base',  v_nota_base,
    'bonus',      v_bonus,
    'nota_final', CASE WHEN v_nota_base IS NULL THEN NULL ELSE v_nota_base + v_bonus END,
    'debts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id',        duel_id,
        'app_id',         app_id,
        'app_name',       app_name,
        'level',          level,
        'grade',          grade,
        'subject_id',     subject_id,
        'original_stake', original_stake,
        'remaining',      remaining,
        'finished_at',    finished_at
      ) ORDER BY finished_at ASC)
      FROM public._duel_active_debts(p_student_id)
    ), '[]'::jsonb),
    'history', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id',   l.duel_id,
        'delta',     l.delta,
        'reason',    l.reason,
        'app_id',    d.app_id,
        'app_name',  d.app_name,
        'at',        l.created_at
      ) ORDER BY l.created_at DESC)
      FROM (
        SELECT * FROM public.duel_grade_ledger
        WHERE student_id = p_student_id
        ORDER BY created_at DESC LIMIT 20
      ) l
      JOIN public.duels d ON d.id = l.duel_id
    ), '[]'::jsonb)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.10 Recuperar deuda al terminar una sesion solitaria
--      Se llama desde el cliente justo tras track_student_session.
--      Reglas:
--        * Solo aplica si el alumno tiene deuda en la misma app (por-duelo)
--        * Factor dificultad: easy 0.020, medium 0.030, test/exam 0.045
--        * Nota normalizada (0..1) * factor = maximo recuperable
--        * Paga deudas mas antiguas primero (FIFO)
--        * Nunca excede la deuda pendiente
--        * Idempotente por (student_id, duel_id, game_session_id)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.student_apply_duel_debt_recovery(
  p_student_id  uuid,
  p_session_id  uuid
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session       public.game_sessions%ROWTYPE;
  v_factor        numeric;
  v_pool          numeric;
  v_debt          RECORD;
  v_applied_total numeric := 0;
  v_apply         numeric;
  v_applied_detail jsonb := '[]'::jsonb;
BEGIN
  SELECT * INTO v_session FROM public.game_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sesion inexistente'; END IF;
  IF v_session.user_type <> 'student' OR v_session.user_id <> p_student_id THEN
    RAISE EXCEPTION 'La sesion no pertenece al alumno';
  END IF;

  v_factor := CASE
    WHEN v_session.mode = 'test' THEN 0.045
    WHEN v_session.mode = 'medium' THEN 0.030
    ELSE 0.020
  END;

  v_pool := COALESCE(v_session.nota, 0) / 10.0 * v_factor;
  IF v_pool <= 0 THEN
    RETURN jsonb_build_object('recovered', 0, 'details', '[]'::jsonb);
  END IF;

  -- Iterar deudas abiertas en la app de la sesion (FIFO)
  FOR v_debt IN
    SELECT * FROM public._duel_active_debts(p_student_id)
    WHERE app_id = v_session.app_id
      AND level  = v_session.level
      AND grade  = v_session.grade
      AND COALESCE(subject_id, '') = COALESCE(v_session.subject_id, '')
    ORDER BY finished_at ASC
  LOOP
    EXIT WHEN v_pool <= 0;
    v_apply := LEAST(v_pool, v_debt.remaining);
    v_apply := ROUND(v_apply::numeric, 2);
    IF v_apply <= 0 THEN CONTINUE; END IF;

    BEGIN
      INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason, game_session_id)
      VALUES (p_student_id, v_debt.duel_id, v_apply, 'recovery', p_session_id);
    EXCEPTION WHEN unique_violation THEN
      -- Ya aplicado para este (student, duel, session)
      CONTINUE;
    END;

    v_pool := v_pool - v_apply;
    v_applied_total := v_applied_total + v_apply;
    v_applied_detail := v_applied_detail || jsonb_build_object(
      'duel_id', v_debt.duel_id, 'amount', v_apply
    );
  END LOOP;

  RETURN jsonb_build_object('recovered', v_applied_total, 'details', v_applied_detail);
END;
$$;

-- ----------------------------------------------------------------------------
-- 5.11 Tarea duelo del profesor: emparejamiento automatico por nota similar
--      Crea un bloque de duelos tipo 'assignment' emparejando a los alumnos
--      del grupo por su nota media en la app (o global si no hay datos).
--      Cada duelo genera 2 filas en assignments (una por alumno) con
--      assignment_type='duel' y duel_id apuntando al duelo creado.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.teacher_create_duel_assignment(
  p_teacher_id uuid,
  p_group_id   uuid,
  p_app_id     text,
  p_app_name   text,
  p_level      text,
  p_grade      text,
  p_subject_id text,
  p_stake      numeric,
  p_best_of    smallint,
  p_title      text,
  p_due_date   timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_is_teacher boolean;
  v_students   RECORD;
  v_list       uuid[] := '{}';
  v_scores     numeric[] := '{}';
  v_i          int;
  v_j          int;
  v_pair_id    uuid;
  v_duel_id    uuid;
  v_pairs      jsonb := '[]'::jsonb;
BEGIN
  SELECT public.is_teacher_of_group(p_teacher_id, p_group_id) INTO v_is_teacher;
  IF NOT v_is_teacher THEN RAISE EXCEPTION 'No eres profesor de este grupo'; END IF;

  -- Recopilar alumnos del grupo ordenados por su media en la app
  -- (si no hay partidas, usa 0 -> quedan al final, se emparejan entre si)
  FOR v_students IN
    SELECT s.id AS student_id,
           COALESCE(AVG(gs.nota) FILTER (WHERE gs.app_id = p_app_id), 0) AS avg_nota
    FROM public.student_groups sg
    JOIN public.students s ON s.id = sg.student_id
    LEFT JOIN public.game_sessions gs
      ON gs.user_id = s.id AND gs.user_type = 'student' AND gs.app_id = p_app_id
    WHERE sg.group_id = p_group_id
    GROUP BY s.id
    ORDER BY avg_nota DESC, s.id
  LOOP
    v_list   := v_list   || v_students.student_id;
    v_scores := v_scores || v_students.avg_nota;
  END LOOP;

  IF array_length(v_list, 1) IS NULL OR array_length(v_list, 1) < 2 THEN
    RAISE EXCEPTION 'El grupo no tiene al menos 2 alumnos';
  END IF;

  -- Emparejar de 2 en 2 por notas adyacentes (ya ordenados). Si es impar,
  -- el ultimo queda sin duelo (se devuelve en 'unpaired').
  v_i := 1;
  WHILE v_i + 1 <= array_length(v_list, 1) LOOP
    v_j := v_i + 1;
    v_pair_id := gen_random_uuid();

    INSERT INTO public.duels (
      challenger_id, opponent_id, group_id, app_id, app_name,
      level, grade, subject_id, stake, best_of, is_hidden,
      assignment_pair_id, teacher_id, status
    ) VALUES (
      v_list[v_i], v_list[v_j], p_group_id, p_app_id, p_app_name,
      p_level, p_grade, p_subject_id, p_stake, COALESCE(p_best_of, 1), true,
      v_pair_id, p_teacher_id, 'accepted'  -- tarea => saltan el paso de invitacion
    )
    RETURNING id INTO v_duel_id;

    -- Fila assignment para cada alumno
    INSERT INTO public.assignments (
      teacher_id, group_id, student_id, app_id, app_name, min_score,
      title, due_date, level, grade, subject_id,
      assignment_type, duel_stake, duel_pair_id, duel_id
    )
    VALUES
      (p_teacher_id, p_group_id, v_list[v_i], p_app_id, p_app_name, 0,
       p_title, p_due_date, p_level, p_grade, p_subject_id,
       'duel', p_stake, v_pair_id, v_duel_id),
      (p_teacher_id, p_group_id, v_list[v_j], p_app_id, p_app_name, 0,
       p_title, p_due_date, p_level, p_grade, p_subject_id,
       'duel', p_stake, v_pair_id, v_duel_id);

    -- Notificar a ambos
    INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
    VALUES
      ('student', v_list[v_i], 'duel_invite', 'Tu profesor te asigno un duelo', p_app_name,
       jsonb_build_object('duel_id', v_duel_id, 'app_id', p_app_id, 'stake', p_stake, 'assignment', true)),
      ('student', v_list[v_j], 'duel_invite', 'Tu profesor te asigno un duelo', p_app_name,
       jsonb_build_object('duel_id', v_duel_id, 'app_id', p_app_id, 'stake', p_stake, 'assignment', true));

    v_pairs := v_pairs || jsonb_build_object(
      'duel_id', v_duel_id,
      'pair',    jsonb_build_array(v_list[v_i], v_list[v_j]),
      'avg',     jsonb_build_array(v_scores[v_i], v_scores[v_j])
    );

    v_i := v_i + 2;
  END LOOP;

  RETURN jsonb_build_object(
    'pairs',    v_pairs,
    'unpaired', CASE WHEN v_i = array_length(v_list, 1) THEN to_jsonb(v_list[v_i]) ELSE 'null'::jsonb END
  );
END;
$$;

-- ============================================================================
-- 6. GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.student_create_duel                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_get_duel_opponents          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_accept_duel                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_reject_duel                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_start_duel                  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_void_duel                   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_report_duel_result          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_get_duels                   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_get_duel_state              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_get_grade_with_duel_bonus   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_apply_duel_debt_recovery    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_create_duel_assignment      TO authenticated;

-- ============================================================================
-- 7. REALTIME
-- ============================================================================
-- Habilitar replicacion logica para la tabla duels (necesario si quieres
-- suscribirte via postgres_changes). Los canales de partida usan
-- broadcast+presence y no necesitan esto.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['duels', 'duel_rounds', 'user_notifications'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- FIN
