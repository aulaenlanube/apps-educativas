-- Seed de 5 avatares nuevos (101-105). Se insertan idempotentemente con
-- ON CONFLICT (code) DO UPDATE para que pueda re-aplicarse sin duplicar.
--
-- Reparto:
--   101 Bardo de las Runas         epic       (subject lengua, 8 con 8,5)
--   102 Vagabundo del Cine Mudo    legendary  (racha 35 días)  ← Chaplin
--   103 Alma Pacífica              mythic     (1.000.000 XP)   ← Gandhi
--   104 Profesor en la Sombra      legendary  (subject fisica, 15 con 9)
--   105 Héroe del Tiempo           mythic     (level 80)       ← Link

INSERT INTO public.avatar_definitions
  (code, title, description, rarity, points_bonus, image_lg, image_md, image_sm, unlock_label, unlock_requirement, sort_order)
VALUES
  ('avatar_101', 'Bardo de las Runas',
   'Habla con los símbolos antes que con la gente. Lleva el saber escrito en los pliegues de su capa y en cada hueso del bosque.',
   'epic', 0.3,
   '/images/avatar/512/avatar-101.webp', '/images/avatar/256/avatar-101.webp', '/images/avatar/128/avatar-101.webp',
   'Aprueba con 8,5 o más en 8 apps distintas de Lengua',
   '{"type":"subject_exams","subject_id":"lengua","count":8,"min_nota":8.5}'::jsonb,
   101),
  ('avatar_102', 'Vagabundo del Cine Mudo',
   'Sombrero hongo, bastón en alto y un gesto que vale más que mil palabras. Cuando el silencio sabe contar la historia, no hace falta nada más.',
   'legendary', 0.4,
   '/images/avatar/512/avatar-102.webp', '/images/avatar/256/avatar-102.webp', '/images/avatar/128/avatar-102.webp',
   'Mantén una racha de 35 días seguidos jugando',
   '{"type":"streak_days","count":35}'::jsonb,
   102),
  ('avatar_103', 'Alma Pacífica',
   'Caminó descalzo y movió un imperio. La fuerza no es el grito; es la calma que se mantiene cuando todo se sacude.',
   'mythic', 0.5,
   '/images/avatar/512/avatar-103.webp', '/images/avatar/256/avatar-103.webp', '/images/avatar/128/avatar-103.webp',
   'Acumula 1.000.000 XP',
   '{"type":"xp","amount":1000000}'::jsonb,
   103),
  ('avatar_104', 'Profesor en la Sombra',
   'Sombrero hundido, gafas oscuras y la tabla periódica como mapa. Cuando explica química, hasta los desiertos se quedan en silencio.',
   'legendary', 0.4,
   '/images/avatar/512/avatar-104.webp', '/images/avatar/256/avatar-104.webp', '/images/avatar/128/avatar-104.webp',
   'Aprueba con 9 o más en 15 apps distintas de Física y Química',
   '{"type":"subject_exams","subject_id":"fisica","count":15,"min_nota":9}'::jsonb,
   104),
  ('avatar_105', 'Héroe del Tiempo',
   'Espada en una mano, escudo en la otra. Cada vez que el reino cae, alguien con la mirada del valor abre los ojos en otra época.',
   'mythic', 0.5,
   '/images/avatar/512/avatar-105.webp', '/images/avatar/256/avatar-105.webp', '/images/avatar/128/avatar-105.webp',
   'Alcanza el nivel 80',
   '{"type":"level","value":80}'::jsonb,
   105)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  rarity = EXCLUDED.rarity,
  points_bonus = EXCLUDED.points_bonus,
  image_lg = EXCLUDED.image_lg,
  image_md = EXCLUDED.image_md,
  image_sm = EXCLUDED.image_sm,
  unlock_label = EXCLUDED.unlock_label,
  unlock_requirement = EXCLUDED.unlock_requirement,
  sort_order = EXCLUDED.sort_order;
