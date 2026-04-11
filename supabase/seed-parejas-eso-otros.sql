-- ============================================================================
-- Seed Parejas ESO - Francés, Valenciano, Robótica, Física
-- Completa combos existentes hasta 25-28 parejas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FRANCÉS 2º ESO (+5 → 25) - Vocabulario intermedio en francés
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('frances', 'eso', '{2}', 'Bonjour', 'Salutation du matin'),
('frances', 'eso', '{2}', 'Merci', 'Expression de gratitude'),
('frances', 'eso', '{2}', 'Lundi', 'Premier jour de la semaine'),
('frances', 'eso', '{2}', 'Hiver', 'Saison froide'),
('frances', 'eso', '{2}', 'Professeur', 'Personne qui enseigne à l''école');

-- ----------------------------------------------------------------------------
-- FRANCÉS 3º ESO (+5 → 25) - Verbos y gramática
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('frances', 'eso', '{3}', 'Je suis', 'Verbe être au présent'),
('frances', 'eso', '{3}', 'J''ai', 'Verbe avoir au présent'),
('frances', 'eso', '{3}', 'Demain', 'Le jour après aujourd''hui'),
('frances', 'eso', '{3}', 'Boulangerie', 'Magasin où l''on achète du pain'),
('frances', 'eso', '{3}', 'Médecin', 'Personne qui soigne les malades');

-- ----------------------------------------------------------------------------
-- FRANCÉS 4º ESO (+5 → 25) - Cultura y expresiones avanzadas
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('frances', 'eso', '{4}', 'Tour Eiffel', 'Monument célèbre de Paris'),
('frances', 'eso', '{4}', 'Marseillaise', 'Hymne national français'),
('frances', 'eso', '{4}', 'Victor Hugo', 'Auteur des Misérables'),
('frances', 'eso', '{4}', 'Francophonie', 'Ensemble des pays de langue française'),
('frances', 'eso', '{4}', 'Passé composé', 'Temps verbal avec auxiliaire');

-- ----------------------------------------------------------------------------
-- VALENCIANO 3º ESO (+5 → 25) - Literatura, gramàtica, cultura
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('valenciano', 'eso', '{3}', 'Ausiàs March', 'Poeta valencià del segle XV'),
('valenciano', 'eso', '{3}', 'Tirant lo Blanc', 'Novel·la cavalleresca de Joanot Martorell'),
('valenciano', 'eso', '{3}', 'Substantiu', 'Paraula que designa persones o coses'),
('valenciano', 'eso', '{3}', 'Dialecte apitxat', 'Parla de l''àrea de València'),
('valenciano', 'eso', '{3}', 'Nou d''Octubre', 'Dia del poble valencià');

-- ----------------------------------------------------------------------------
-- ROBÓTICA 2º ESO (+5 → 25) - Electrónica básica y Arduino
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('robotica', 'eso', '{2}', 'LED', 'Diodo emisor de luz'),
('robotica', 'eso', '{2}', 'Servo', 'Motor con posición controlada'),
('robotica', 'eso', '{2}', 'Arduino UNO', 'Placa con ATmega328'),
('robotica', 'eso', '{2}', 'LDR', 'Sensor de luminosidad'),
('robotica', 'eso', '{2}', 'Pin GND', 'Referencia de tierra');

-- ----------------------------------------------------------------------------
-- ROBÓTICA 3º ESO (+5 → 25) - Programación y control de motores
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('robotica', 'eso', '{3}', 'setup()', 'Función de inicialización'),
('robotica', 'eso', '{3}', 'loop()', 'Bucle principal de ejecución'),
('robotica', 'eso', '{3}', 'Motor paso a paso', 'Giro por incrementos discretos'),
('robotica', 'eso', '{3}', 'Acelerómetro', 'Sensor de aceleración'),
('robotica', 'eso', '{3}', 'Condicional if', 'Toma de decisiones');

-- ----------------------------------------------------------------------------
-- ROBÓTICA 4º ESO (+5 → 25) - IoT, IA y sistemas avanzados
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('robotica', 'eso', '{4}', 'SPI', 'Bus serie síncrono'),
('robotica', 'eso', '{4}', 'Raspberry Pi', 'Microordenador de placa única'),
('robotica', 'eso', '{4}', 'TensorFlow Lite', 'IA en dispositivos embebidos'),
('robotica', 'eso', '{4}', 'HTTP REST', 'Protocolo web de servicios'),
('robotica', 'eso', '{4}', 'SLAM', 'Localización y mapeo simultáneos');

-- ----------------------------------------------------------------------------
-- FÍSICA 1º ESO (+3 → 27) - Magnitudes y unidades
-- ----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('fisica', 'eso', '{1}', 'Longitud', 'Metro (m)'),
('fisica', 'eso', '{1}', 'Masa', 'Kilogramo (kg)'),
('fisica', 'eso', '{1}', 'Tiempo', 'Segundo (s)');
