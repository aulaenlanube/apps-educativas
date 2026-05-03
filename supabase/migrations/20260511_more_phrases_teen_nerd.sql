-- Más frases con jerga adolescente (default) y nerd/picantes (unlockables).
-- Tras esta migración: 25 default + 25 unlockables = 50 frases totales.

INSERT INTO public.duel_phrase_definitions (code, text, emoji, category, rarity, is_default, sort_order) VALUES
  ('default_21', 'Literalmente, sí',          '💯', 'funny',   'common', true, 21),
  ('default_22', '100% bro',                  '🤜', 'cheer',   'common', true, 22),
  ('default_23', 'GG, bro',                   '🎮', 'neutral', 'common', true, 23),
  ('default_24', 'Eso ha sido un W',          '🏆', 'cheer',   'common', true, 24),
  ('default_25', '67!',                       '🤙', 'funny',   'common', true, 25)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.duel_phrase_definitions (code, text, emoji, category, rarity, is_default, unlock_requirement, sort_order) VALUES
  ('spicy_16', 'Skill issue, bro',                       '⚙️', 'tease', 'rare',      false, '{"type":"duels_won","count":10}',                      140),
  ('spicy_17', 'POV: pierdes',                           '📷', 'tease', 'rare',      false, '{"type":"total_sessions","count":30}',                 141),
  ('spicy_18', 'Eso ha sido un L',                       '😬', 'tease', 'rare',      false, '{"type":"high_score_exams","count":7,"min_nota":8}',  142),
  ('spicy_19', 'Cerebro.exe no responde',                '💻', 'funny', 'rare',      false, '{"type":"perfect_exams","count":5}',                   143),
  ('spicy_20', '404: tu jugada no encontrada',           '🚫', 'funny', 'rare',      false, '{"type":"high_score_exams","count":8,"min_nota":7}',  144),
  ('spicy_21', 'Touch grass después de esto',            '🌱', 'tease', 'epic',      false, '{"type":"duels_won","count":25}',                      145),
  ('spicy_22', 'git push --force mi victoria',           '💾', 'funny', 'epic',      false, '{"type":"perfect_exams","count":15}',                  146),
  ('spicy_23', E'Console.log(\'te he ganado\')',         '🪵', 'funny', 'epic',      false, '{"type":"high_score_exams","count":12,"min_nota":9}', 147),
  ('spicy_24', 'rm -rf tu plan',                         '💀', 'tease', 'legendary', false, '{"type":"duels_won","count":40}',                      148),
  ('spicy_25', 'Stack overflow en tu cerebro',           '🥞', 'funny', 'legendary', false, '{"type":"perfect_exams","count":20}',                  149)
ON CONFLICT (code) DO NOTHING;
