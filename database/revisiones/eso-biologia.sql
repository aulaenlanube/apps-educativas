-- =====================================================================
-- Revisión rosco · ESO · Biología · 1º a 4º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================

UPDATE rosco_questions
SET definition = 'Punto de unión o articulación entre dos huesos.'
WHERE id = 15886; -- juntura

-- =====================================================================
-- 2º ESO
-- =====================================================================

-- Letra K: renombrar las que tienen palabra real con K, borrar el resto
UPDATE rosco_questions
SET solution = 'krill',
    definition = 'Pequeño crustáceo del plancton del que se alimentan las ballenas (contiene K).'
WHERE id = 16173;

DELETE FROM rosco_questions WHERE id IN (
  16176, -- 'Fragmento de roca en un volcán' (bomba/bloque no contienen K)
  16178, -- 'Conjunto de huesos' (esqueleto no tiene K)
  16179  -- 'Capa externa de la piel' (epidermis no tiene K)
);

-- Letra J: 16161 'juegos olimpicos' con def de mejilla
UPDATE rosco_questions
SET solution = 'mejilla',
    definition = 'Parte carnosa de la cara entre el ojo y la mandíbula (contiene J).',
    difficulty = 1
WHERE id = 16161;

-- Letra J: 16156 'caja' con def de articulación
UPDATE rosco_questions
SET definition = 'Recipiente cuadrado o rectangular (contiene J).'
WHERE id = 16156;

-- Letra J: 16164 pájaro duplicado de 16165 con def errónea
DELETE FROM rosco_questions WHERE id = 16164;

-- Letra Q: 16252 queso con def de barján
UPDATE rosco_questions
SET definition = 'Producto lácteo elaborado a partir de leche cuajada (contiene Q).'
WHERE id = 16252;

-- Duplicados
DELETE FROM rosco_questions WHERE id = 16120; -- fuente duplicado de 16119
DELETE FROM rosco_questions WHERE id = 16171; -- eukarya duplicado de 16180
DELETE FROM rosco_questions WHERE id = 16205; -- 'nucli' errata, duplica con núcleo 16206

-- Erratas ortográficas
UPDATE rosco_questions SET solution = 'médula' WHERE id = 16193;
UPDATE rosco_questions SET solution = 'dióxido de carbono' WHERE id = 16095;
UPDATE rosco_questions SET solution = 'nivel freático' WHERE id = 16209;
UPDATE rosco_questions SET solution = 'jugos gástricos' WHERE id = 16154;

-- =====================================================================
-- 3º ESO
-- =====================================================================

-- Letra K: renombrar válidas, borrar el resto
UPDATE rosco_questions
SET solution = 'eucariota',
    definition = 'Célula con núcleo definido (animales, plantas, hongos) (contiene K en eukaria).'
WHERE id = 16445;
-- Nota: 'eucariota' no contiene K. Mejor renombrar a 'eukarya' (sí contiene K).
-- Corrección:
UPDATE rosco_questions
SET solution = 'eukarya',
    definition = 'Dominio de los seres vivos con núcleo celular: animales, plantas, hongos y protistas (contiene K).'
WHERE id = 16445;

UPDATE rosco_questions
SET solution = 'keratina',
    definition = 'Proteína rica en azufre que forma el pelo y las uñas (contiene K).'
WHERE id = 16449;

DELETE FROM rosco_questions WHERE id IN (
  16446, -- procariota (no K)
  16450, -- epidermis (no K)
  16451, -- analgésico (no K)
  16453, -- duplica plancton/krill
  16454  -- esqueleto (no K)
);

-- Ñ placeholders 3x mañana
DELETE FROM rosco_questions WHERE id IN (16492, 16493);

-- W placeholder web duplicado
DELETE FROM rosco_questions WHERE id = 16576;

-- W placeholder kiwi
UPDATE rosco_questions
SET definition = 'Ave no voladora de Nueva Zelanda o fruta verde por dentro (contiene W).'
WHERE id = 16583;

-- Z placeholder zona duplicado
DELETE FROM rosco_questions WHERE id = 16614;

-- J: 16442 juegos olimpicos con def de adiposo (no encaja en J)
DELETE FROM rosco_questions WHERE id = 16442;

-- T: Trompas mayúscula
UPDATE rosco_questions
SET solution = 'trompas',
    definition = 'Conductos uterinos que llevan el óvulo del ovario al útero (Trompas de Falopio).'
WHERE id = 16554;

-- Errata tilde
UPDATE rosco_questions SET solution = 'dióxido de carbono' WHERE id = 16382;

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- Soluciones con mayúscula que duplican minúsculas
UPDATE rosco_questions
SET solution = 'deriva'
WHERE id = 16648;

DELETE FROM rosco_questions WHERE id IN (
  16747, -- Nicho duplica con 16748 nicho
  16749, -- Nivel duplica con 16750 nivel
  16778  -- Placa duplica con 16779 placa
);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
