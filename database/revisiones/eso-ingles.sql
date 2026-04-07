-- =====================================================================
-- Revisión rosco · ESO · Inglés · 1º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1) Corrección de definición errónea: 'autumn' es británico, no americano
-- ---------------------------------------------------------------------
UPDATE rosco_questions
SET definition = 'Otoño en inglés (palabra británica).'
WHERE id = 21366;

-- ---------------------------------------------------------------------
-- 2) Reclasificaciones de difficulty: subir de 1 → 2
--    (palabras menos frecuentes / A2 / ortografía atípica)
-- ---------------------------------------------------------------------
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  21516, -- often
  21513, -- ocean
  21536, -- quite
  21533, -- queue
  21462, -- knee
  21461, -- knife
  21466, -- keep
  21578  -- violet
);

-- ---------------------------------------------------------------------
-- 3) Reclasificaciones de difficulty: bajar de 2 → 1
--    (vocabulario A1 puro de meses, días, familia, casa, escuela…)
-- ---------------------------------------------------------------------
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  21370, -- brother
  21372, -- breakfast
  21375, -- bedroom
  21380, -- classroom
  21381, -- computer
  21386, -- clothes
  21391, -- december
  21397, -- elephant
  21404, -- english
  21406, -- evening
  21412, -- february
  21419, -- grandfather
  21420, -- grandmother
  21425, -- glasses
  21426, -- geography
  21430, -- homework
  21437, -- ice cream
  21439, -- internet
  21447, -- january
  21459, -- kitchen
  21473, -- library
  21496, -- notebook
  21491, -- november
  21509, -- october
  21528, -- question
  21552, -- saturday
  21553, -- september
  21561, -- teacher
  21562, -- tuesday
  21563, -- thursday
  21581, -- vegetable
  21584, -- volleyball
  21590, -- wednesday
  21606, -- exercise
  21612  -- yesterday
);

-- ---------------------------------------------------------------------
-- 4) Letra Ñ: ELIMINAR. En inglés no existe la letra Ñ.
--    El hook (useRoscoGame.js) y la UI (RoscoUI.jsx) agrupan dinámicamente
--    por las letras presentes en los datos y posicionan el rosco en
--    función de letters.length, así que al borrar estas filas el rosco
--    de inglés pasa automáticamente a 26 letras sin tocar código.
-- ---------------------------------------------------------------------
DELETE FROM rosco_questions WHERE id BETWEEN 21497 AND 21506;

-- ---------------------------------------------------------------------
-- 5) Mejoras de redacción de definiciones (desambiguación)
-- ---------------------------------------------------------------------
UPDATE rosco_questions SET definition = 'Preposición de lugar: dentro de.' WHERE id = 21441; -- in
UPDATE rosco_questions SET definition = 'Preposición o adverbio: hacia arriba.' WHERE id = 21570; -- up
UPDATE rosco_questions SET definition = 'Pequeño examen o concurso de preguntas.' WHERE id = 21532; -- quiz

-- ---------------------------------------------------------------------
-- 6) 'uk' no era vocabulario sino siglas. Reescribir como palabra real.
--    Sustituido por 'useful' (A2, encaja con 1º ESO subido a difficulty 2).
-- ---------------------------------------------------------------------
UPDATE rosco_questions
SET solution = 'useful',
    definition = 'Que sirve para algo, que tiene utilidad.',
    difficulty = 2
WHERE id = 21576;


-- =====================================================================
-- 2º ESO
-- =====================================================================

-- Letra Ñ: ELIMINAR (igual que en 1º ESO).
DELETE FROM rosco_questions WHERE id BETWEEN 21767 AND 21776;

-- Bajar de 2 → 1 (A1 escolar)
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  21639, -- because
  21643, -- biology
  21652, -- chemistry
  21687, -- geography
  21702, -- history
  21705, -- hospital
  21734, -- kitchen
  21743, -- library
  21794, -- picture
  21838, -- umbrella
  21848, -- vegetable
  21851, -- village
  21854, -- volleyball
  21856, -- vocabulary
  21865, -- weather
  21880, -- yesterday
  21882  -- yoghurt
);

-- Subir de 1 → 2 (A2 en 2º ESO)
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  21640, -- become
  21644, -- borrow
  21671, -- engine
  21686, -- forget
  21704, -- hope
  21725, -- just
  21746, -- luck
  21762  -- news
);

-- Crear bloque "difícil" en 2º ESO subiendo 2 → 3
UPDATE rosco_questions SET difficulty = 3 WHERE id IN (
  21675, -- expensive
  21676, -- explain
  21761, -- neighbour
  21784, -- opposite
  21841, -- understand
  21846  -- unusual
);

-- Mejora de definición
UPDATE rosco_questions SET definition = 'Conjunción condicional: si.' WHERE id = 21709;

-- =====================================================================
-- 3º ESO
-- =====================================================================

-- Bajar de 2 → 1 (repaso A1)
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  21907, -- breakfast
  21911, -- brother
  21915, -- building
  21918, -- clothes
  21942, -- elephant
  21945, -- evening
  21989, -- january
  22004  -- kitchen
);

-- Subir de 1 → 2 (A2/B1)
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  21902, -- above
  21906, -- allow
  21897, -- awake
  22028, -- narrow
  22078, -- safe
  22108, -- value
  22116, -- vote
  22122  -- warm
);

-- Subir de 2 → 3 (B1 sólido — bloque difícil que falta)
UPDATE rosco_questions SET difficulty = 3 WHERE id IN (
  21927, -- dangerous
  21976, -- healthy
  21986, -- invitation
  21992, -- journey
  22017, -- machine
  22023, -- medicine
  22033, -- neighbor
  22066, -- quotation
  22073, -- remember
  22074, -- restaurant
  22094, -- teenager
  22101, -- understand
  22103, -- university
  22110  -- vehicle
);

-- Definiciones que dan la respuesta o son confusas
UPDATE rosco_questions SET definition = 'Despierto (contrario de asleep).'                          WHERE id = 21897; -- awake
UPDATE rosco_questions SET definition = 'Muy bonito o atractivo.'                                   WHERE id = 21908; -- beautiful
UPDATE rosco_questions SET definition = 'Líquido rojo que circula por el cuerpo.'                   WHERE id = 21910; -- blood
UPDATE rosco_questions SET definition = 'Adjetivo: enfermo, que no se siente bien.'                 WHERE id = 21979; -- ill

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- Subir de 2 → 3 (B2 — crear bloque difícil sustancial)
UPDATE rosco_questions SET difficulty = 3 WHERE id IN (
  22168, -- baggage
  22170, -- behavior
  22180, -- ceiling
  22181, -- challenge
  22184, -- cheerful
  22185, -- childhood
  22192, -- departure
  22193, -- develop
  22196, -- disease
  22199, -- easygoing
  22204, -- employee
  22216, -- foreign
  22245, -- interview
  22249, -- jealous
  22250, -- jewellery
  22270, -- landscape
  22293, -- neighbor
  22305, -- opportunity
  22313, -- performance
  22314, -- perhaps
  22332, -- realize
  22356, -- temperature
  22368, -- valuable
  22370, -- variety
  22384, -- warning
  22405  -- yourself
);

-- Subir de 1 → 2 (B1 que estaba en fácil)
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  22161, -- afford
  22177, -- career
  22183, -- cheat
  22186, -- clever
  22190, -- deal
  22191, -- delay
  22200, -- edge
  22202, -- effort
  22214, -- fee
  22220, -- gather
  22225, -- goal
  22226, -- guess
  22227, -- habit
  22236, -- hire
  22240, -- income
  22243, -- injury
  22248, -- jail
  22255, -- judge
  22257, -- keen
  22267, -- label
  22268, -- lack
  22269, -- ladder
  22273, -- lawyer
  22280, -- manage
  22289, -- nasty
  22294, -- nephew
  22297, -- obey
  22310, -- patient
  22316, -- polite
  22329, -- reach
  22335, -- recipe
  22336, -- refuse
  22339, -- salary
  22343, -- scared
  22350, -- task
  22362, -- unfair
  22365, -- unless
  22366, -- upset
  22385, -- waste
  22404, -- youth
  22406  -- yell
);

UPDATE rosco_questions SET definition = 'Equipaje (variante americana de luggage).' WHERE id = 22168;

-- =====================================================================
-- VERIFICACIÓN FINAL: no debe quedar ninguna letra Ñ en inglés ESO
-- (3º y 4º no la tenían; 1º y 2º se borran arriba)
-- =====================================================================
DELETE FROM rosco_questions WHERE subject_id='ingles' AND level='eso' AND letter='Ñ';

-- COMMIT;  -- descomenta tras revisar todo el fichero
ROLLBACK;
