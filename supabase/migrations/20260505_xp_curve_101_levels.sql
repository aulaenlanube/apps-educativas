-- =====================================================
-- 101 niveles con curva por tramos
-- =====================================================
--   1..49   : delta = 200 + (L-1)*34          (igual que la curva original)
--   50..79  : delta = 1832 + 200*(L-49)       (lineal, +200 XP por nivel)
--   80..89  : delta = floor(7832 * 1.05^(L-79))   (+5% por nivel — duro)
--   90..99  : delta = floor(7832 * 1.05^10 * 1.25^(L-89))  (+25% por nivel — crece fuerte)
--   100→101 : delta(100) = total_xp_acumulado_a_100  (el último escalón duplica todo)
--
-- Resultado en hitos:
--   nivel 50  → 49.784 XP
--   nivel 80  → 197.744 XP
--   nivel 90  → 301.174 XP
--   nivel 100 → 831.448 XP
--   nivel 101 → 1.662.896 XP (exactamente 2× el total a nivel 100)
--
-- Bonus de nota por nivel: tope sigue en +0,5 alcanzado en nivel 50
-- (ver _compute_student_term_grades). Pasar de 50 a 101 es prestigio puro
-- (avatares legendarios/míticos + insignia mítica), sin más bonus en nota.
-- =====================================================

CREATE OR REPLACE FUNCTION public.xp_for_level(p_level integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_xp bigint := 0;
  v_delta bigint;
  v_L integer;
  v_target integer;
BEGIN
  IF p_level <= 1 THEN RETURN 0; END IF;
  v_target := LEAST(p_level, 101);

  FOR v_L IN 1..LEAST(v_target - 1, 99) LOOP
    IF v_L < 50 THEN
      v_delta := 200 + (v_L - 1) * 34;
    ELSIF v_L < 80 THEN
      v_delta := 1832 + 200 * (v_L - 49);
    ELSIF v_L < 90 THEN
      v_delta := floor(7832 * power(1.05::numeric, v_L - 79))::bigint;
    ELSE -- 90..99
      v_delta := floor(7832 * power(1.05::numeric, 10) * power(1.25::numeric, v_L - 89))::bigint;
    END IF;
    v_xp := v_xp + v_delta;
  END LOOP;

  IF v_target = 101 THEN
    v_xp := v_xp * 2;
  END IF;

  RETURN v_xp::int;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_level(p_xp integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_acc bigint := 0;
  v_delta bigint;
  v_L integer;
  v_total_at_100 bigint;
BEGIN
  IF p_xp IS NULL OR p_xp < 0 THEN RETURN 1; END IF;

  FOR v_L IN 1..99 LOOP
    IF v_L < 50 THEN
      v_delta := 200 + (v_L - 1) * 34;
    ELSIF v_L < 80 THEN
      v_delta := 1832 + 200 * (v_L - 49);
    ELSIF v_L < 90 THEN
      v_delta := floor(7832 * power(1.05::numeric, v_L - 79))::bigint;
    ELSE
      v_delta := floor(7832 * power(1.05::numeric, 10) * power(1.25::numeric, v_L - 89))::bigint;
    END IF;

    IF p_xp::bigint < v_acc + v_delta THEN
      RETURN v_L;
    END IF;
    v_acc := v_acc + v_delta;
  END LOOP;

  v_total_at_100 := v_acc;
  IF p_xp::bigint < 2 * v_total_at_100 THEN
    RETURN 100;
  END IF;
  RETURN 101;
END;
$function$;

-- Redistribución de avatares con requisito por nivel para aprovechar el rango 1..101
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',3),   unlock_label='Alcanza el nivel 3'   WHERE code='avatar_085';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',10),  unlock_label='Alcanza el nivel 10'  WHERE code='avatar_033';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',25),  unlock_label='Alcanza el nivel 25'  WHERE code='avatar_068';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',40),  unlock_label='Alcanza el nivel 40'  WHERE code='avatar_003';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',50),  unlock_label='Alcanza el nivel 50'  WHERE code='avatar_063';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',65),  unlock_label='Alcanza el nivel 65'  WHERE code='avatar_041';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',75),  unlock_label='Alcanza el nivel 75'  WHERE code='avatar_055';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',85),  unlock_label='Alcanza el nivel 85'  WHERE code='avatar_100';
UPDATE public.avatar_definitions SET unlock_requirement = jsonb_build_object('type','level','value',101), unlock_label='Alcanza el nivel 101 (máximo absoluto)' WHERE code='avatar_066';

-- Insignia mítica del nivel máximo: target 50 → 101
UPDATE public.badge_definitions
SET check_params = jsonb_build_object('target', 101),
    description_es = 'Has alcanzado el nivel 101, la cima absoluta de la plataforma. Solo al alcance de muy muy pocos.'
WHERE code = 'mythic_max_level';
