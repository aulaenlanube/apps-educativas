-- Seis frases nuevas para el chat de duelos/batallas:
--   * 1 paz · 3 fútbol · 1 broma castiza · 1 optimista
-- Todas son unlockables (is_default=false) con criterios variados.
-- Tras esta migración: 25 default + 31 unlockables = 56 frases totales.

INSERT INTO public.duel_phrase_definitions
  (code, text, emoji, category, rarity, is_default, unlock_requirement, sort_order)
VALUES
  -- Paz y amor: gesto pacifista. Se gana enviando feedback positivo a apps
  -- (apps_rated). El propio acto de calificar es "buena vibra".
  ('spicy_26', 'Paz y amor 💖',
                '☮️',  'cheer', 'rare',      false,
                '{"type":"apps_rated","count":3}',                       150),

  -- Trío futbolero. Sistema simétrico: cada uno desbloquea con un eje
  -- distinto del juego para que un fan no las consiga "todas" siguiendo el
  -- mismo camino. Madrid → batallas (las gana en directo); Barça →
  -- duelos (juego pausado y técnico); Valencia → racha de días (resistir
  -- es la marca de la afiliación regional).
  ('spicy_27', 'Amunt Valencia',
                '🦇',  'cheer', 'rare',      false,
                '{"type":"streak_days","count":4}',                       151),

  ('spicy_28', 'Hala Madrid',
                '👑',  'cheer', 'rare',      false,
                '{"type":"battles_won","count":7}',                        152),

  ('spicy_29', 'Força Barça',
                '🔵',  'cheer', 'rare',      false,
                '{"type":"duels_won","count":7}',                          153),

  -- Broma castiza: rude pero cariñosa. Tiene que demostrar nivel antes de
  -- soltarla — ascendemos a épica con un criterio sólido.
  ('spicy_30', 'Ojos que no ven, mierda que pisas',
                '👀',  'tease', 'epic',      false,
                '{"type":"perfect_exams","count":10}',                     154),

  -- Serrat. Optimismo a la vieja escuela; encaja con quien sostiene una
  -- racha sólida de juego diario.
  ('spicy_31', 'Hoy puede ser un gran día',
                '☀️',  'cheer', 'rare',      false,
                '{"type":"streak_days","count":7}',                        155)
ON CONFLICT (code) DO NOTHING;
