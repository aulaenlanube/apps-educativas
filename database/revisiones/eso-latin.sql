-- =====================================================================
-- Revisión rosco · ESO · Latín · 4º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1) BUGS CRÍTICOS
-- =====================================================================

-- 1.1 homo sapiens -> hannibal (definición describía a Aníbal)
UPDATE rosco_questions
SET solution = 'hannibal',
    definition = 'General cartaginés que cruzó los Alpes con elefantes.'
WHERE id = 31240;

-- 1.2 ayuda: anotación interna del autor filtrada
UPDATE rosco_questions
SET solution = 'ayuda',
    definition = 'Asistencia o socorro a alguien (Auxilium).'
WHERE id = 31422;

-- 1.3 Letra Q: 3 entradas con solution='queso' apuntando a otras palabras
UPDATE rosco_questions
SET solution = 'quadrivium',
    definition = 'Cruce de cuatro caminos en una ciudad romana.',
    type = 'empieza'
WHERE id = 31330;

UPDATE rosco_questions
SET solution = 'quintus',
    definition = 'Quinto en latín; nombre romano frecuente y número 5 ordinal.',
    type = 'empieza'
WHERE id = 31333;

UPDATE rosco_questions
SET solution = 'antiquo',
    definition = 'Antiguo en latín, raíz de la palabra anticuario.',
    type = 'contiene'
WHERE id = 31342;

-- 1.4 Guerras (genérico, colisiona con guerra id 31232)
UPDATE rosco_questions
SET solution = 'galos',
    definition = 'Pueblo conquistado por César en la Galia.'
WHERE id = 31231;

-- 1.5 Aurum -> aurum (minúscula) y definición sin pista
UPDATE rosco_questions
SET solution = 'aurum',
    definition = 'Metal precioso amarillo en latín, símbolo químico Au.'
WHERE id = 31177;

-- 1.6 Quattuor -> quattuor (minúscula)
UPDATE rosco_questions
SET solution = 'quattuor',
    definition = 'Número cuatro en latín.'
WHERE id = 31335;

-- 1.7 umbral -> umbra (umbral no viene de umbra)
UPDATE rosco_questions
SET solution = 'umbra',
    definition = 'Sombra que proyecta un cuerpo opaco al recibir luz.'
WHERE id = 31379;

-- 1.8 urna: definición incorrecta
UPDATE rosco_questions
SET definition = 'Vasija romana usada para guardar cenizas o para depositar votos.'
WHERE id = 31380;

-- 1.9 uxoricidio: significado incorrecto
UPDATE rosco_questions
SET definition = 'Asesinato cometido contra la propia esposa (de Uxor: esposa).'
WHERE id = 31381;

-- 1.10 koiné: type incorrecto (empieza por K, no la contiene en medio)
UPDATE rosco_questions
SET type = 'empieza'
WHERE id = 31273;

-- 1.11 Duplicado en J: 31262 julio (mes) y 31268 julio (César)
UPDATE rosco_questions
SET solution = 'juliano',
    definition = 'Calendario romano implantado por Julio César.'
WHERE id = 31268;

-- =====================================================================
-- 2) Definiciones corregidas (etimología que daba la respuesta)
-- =====================================================================

UPDATE rosco_questions
SET definition = 'Adverbio latino: el día anterior a hoy.'
WHERE id = 31249; -- heri

UPDATE rosco_questions
SET definition = 'Día central del mes en el calendario romano (15 en marzo).'
WHERE id = 31252; -- idus

UPDATE rosco_questions
SET definition = 'Queja formal o reclamación judicial.'
WHERE id = 31338; -- querella

-- =====================================================================
-- 3) Reclasificación de difficulty
-- =====================================================================

-- 3.1 Subir 2 → 3 (vocabulario clásico/gramatical realmente complejo)
UPDATE rosco_questions SET difficulty = 3 WHERE id IN (
  31201, -- declinación
  31302, -- nominativo
  31309, -- nominal
  31230, -- genitivo
  31307, -- necrópolis
  31308, -- nihilismo
  31317, -- oratoria
  31337, -- quirites
  31352, -- retórica
  31382  -- universo
);

-- 3.2 Subir 1 → 2 (palabras menos transparentes para un hispanohablante)
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  31244, -- hostis
  31255, -- ius
  31258, -- insula
  31373, -- urbe
  31378, -- urania
  31413  -- yugo
);

-- 3.3 Bajar 2 → 1 (latín cotidiano fácilmente deducible)
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  31168, -- acueducto
  31188, -- coliseo
  31180, -- basílica
  31184, -- biblioteca
  31189, -- calzada
  31197, -- capitolio
  31228, -- gladiador
  31219, -- familia
  31220, -- fortuna
  31250, -- imperio
  31260, -- júpiter
  31291, -- mercurio
  31292, -- mosaico
  31300, -- neptuno
  31322, -- panteón
  31323, -- pompeya
  31346, -- república
  31354, -- saturno
  31371, -- taberna
  31368, -- troyano
  31385  -- vulcano
);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
