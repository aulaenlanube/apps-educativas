-- Avatares 091-100 (set "Stranger Things" — pandilla del misterio sobrenatural)
-- Idempotente: usa ON CONFLICT (code) DO UPDATE para que pueda re-aplicarse sin duplicar.

INSERT INTO avatar_definitions (code, title, description, rarity, points_bonus, image_lg, image_md, image_sm, unlock_label, unlock_requirement, sort_order) VALUES
('avatar_091', 'Líder de la Pandilla', 'Walkie-talkie en mano, mapa de la ciudad sobre la mesa y un cuaderno lleno de pistas. Cuando algo raro pasa, convoca al equipo y se asegura de que nadie se quede atrás.', 'legendary', 0.4, '/images/avatar/512/avatar-091.webp', '/images/avatar/256/avatar-091.webp', '/images/avatar/128/avatar-091.webp', 'Juega al menos 15 apps distintas', '{"type": "unique_apps", "count": 15}'::jsonb, 91),
('avatar_092', 'La Psíquica del Silencio', 'Levanta una mano y los objetos del pasillo flotan a su alrededor. Habla poco porque no le hace falta: cada cuchara doblada cuenta una historia.', 'legendary', 0.4, '/images/avatar/512/avatar-092.webp', '/images/avatar/256/avatar-092.webp', '/images/avatar/128/avatar-092.webp', 'Consigue 25 exámenes con nota perfecta (10)', '{"type": "perfect_exams", "count": 25}'::jsonb, 92),
('avatar_093', 'El Bromista de la Banda', 'Gorra colorida, snacks de sobra y un walkie en el cinturón. Convierte cualquier misión en una aventura ochentera con marcador en neón.', 'rare', 0.2, '/images/avatar/512/avatar-093.webp', '/images/avatar/256/avatar-093.webp', '/images/avatar/128/avatar-093.webp', 'Juega 25 partidas', '{"type": "total_sessions", "count": 25}'::jsonb, 93),
('avatar_094', 'Director de Partida', 'Sostiene el dado de veinte caras como quien sostiene un universo. Prepara la mazmorra, narra el combate y deja que los demás imaginen lo imposible.', 'epic', 0.3, '/images/avatar/512/avatar-094.webp', '/images/avatar/256/avatar-094.webp', '/images/avatar/128/avatar-094.webp', 'Aprueba 10 exámenes con nota ≥ 8', '{"type": "high_score_exams", "count": 10, "min_nota": 8}'::jsonb, 94),
('avatar_095', 'El Observador del Cuarto Oscuro', 'Cámara instantánea, luz roja en el techo y negativos colgando como banderas. Encuentra en cada foto el detalle que los demás dejaron pasar.', 'rare', 0.2, '/images/avatar/512/avatar-095.webp', '/images/avatar/256/avatar-095.webp', '/images/avatar/128/avatar-095.webp', 'Aprueba 5 exámenes de Memoria', '{"type": "app_sessions", "app_id": "juego-memoria", "mode": "test", "count": 5}'::jsonb, 95),
('avatar_096', 'La Skater del Atardecer', 'Se cae diez veces y aterriza el truco a la once. El parking del instituto es su pista; las hojas de otoño, su público.', 'rare', 0.2, '/images/avatar/512/avatar-096.webp', '/images/avatar/256/avatar-096.webp', '/images/avatar/128/avatar-096.webp', 'Mantén una racha de 10 días jugando', '{"type": "streak_days", "count": 10}'::jsonb, 96),
('avatar_097', 'El Protector del Barrio', 'Bate de madera al hombro, mirada cansada pero amable. No busca pelea: vigila la calle, cuida del grupo y aparece cuando hace falta.', 'epic', 0.3, '/images/avatar/512/avatar-097.webp', '/images/avatar/256/avatar-097.webp', '/images/avatar/128/avatar-097.webp', 'Gana 12 duelos', '{"type": "duels_won", "count": 12}'::jsonb, 97),
('avatar_098', 'La Periodista de Pistas', 'Grabadora encendida, libreta llena de preguntas y un titular en mente: STRANGE SIGNALS. La verdad está en alguna esquina y ella va a encontrarla.', 'epic', 0.3, '/images/avatar/512/avatar-098.webp', '/images/avatar/256/avatar-098.webp', '/images/avatar/128/avatar-098.webp', 'Aprueba 5 exámenes de Comprensión Escrita con nota ≥ 8', '{"type": "app_sessions", "app_id": "comprension-escrita", "mode": "test", "count": 5, "min_nota": 8}'::jsonb, 98),
('avatar_099', 'El Científico del Nivel 7', 'Bata blanca, identificación borrosa y un portapapeles que no enseña a nadie. Sabe demasiado, duda si decir la verdad y aún así sigue investigando.', 'legendary', 0.4, '/images/avatar/512/avatar-099.webp', '/images/avatar/256/avatar-099.webp', '/images/avatar/128/avatar-099.webp', 'Aprueba 15 exámenes de Naturales con nota ≥ 9', '{"type": "subject_exams", "subject_id": "naturales", "count": 15, "min_nota": 9}'::jsonb, 99),
('avatar_100', 'La Sombra Floral del Otro Lado', 'Emerge entre niebla roja y raíces retorcidas, en un pasillo que no debería existir. No habla. No necesita hacerlo: solo se manifiesta para quienes han llegado muy lejos.', 'legendary', 0.4, '/images/avatar/512/avatar-100.webp', '/images/avatar/256/avatar-100.webp', '/images/avatar/128/avatar-100.webp', 'Alcanza el nivel 40', '{"type": "level", "value": 40}'::jsonb, 100)
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
