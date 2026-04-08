-- =====================================================================
-- Revisión rosco · Primaria · Lengua · 1º a 6º
-- 1 delete + 30 updates. Asignatura estructuralmente sana.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Pala con cuerdas para jugar al tenis o al pádel.' WHERE id = 12738; -- raqueta

-- =====================================================================
-- 2º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Verbo: comunicarse con palabras.' WHERE id = 12821; -- hablar
UPDATE rosco_questions SET definition = 'Arácnido de ocho patas que teje telas (contiene Ñ).' WHERE id = 12858; -- araña
UPDATE rosco_questions SET definition = 'Prenda que se pone en los pies (contiene Z).' WHERE id = 12909; -- zapato

-- =====================================================================
-- 3º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Verbo: hacer entender algo a alguien (contiene X).' WHERE id = 12938; -- explicar
UPDATE rosco_questions SET definition = 'Última parte de una narración o cuento.' WHERE id = 12943; -- final
UPDATE rosco_questions SET definition = 'Lengua propia de un pueblo o nación.' WHERE id = 12957; -- idioma
UPDATE rosco_questions SET definition = 'Enumeración ordenada de elementos.' WHERE id = 12971; -- lista
UPDATE rosco_questions SET definition = 'Persona que escribe una obra literaria.' WHERE id = 12991; -- autor
UPDATE rosco_questions SET definition = 'Adjetivo: de poco tamaño, opuesto a grande (contiene Q).' WHERE id = 13002; -- pequeño
UPDATE rosco_questions SET definition = 'Escritor de una obra literaria (contiene U).' WHERE id = 13023; -- autor
UPDATE rosco_questions SET definition = 'Color del cielo o del mar (contiene Z).' WHERE id = 13042; -- azul

-- =====================================================================
-- 4º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Palabra que une oraciones o partes de un texto.' WHERE id = 13067; -- enlace
UPDATE rosco_questions SET definition = 'Estado de alegría y bienestar.' WHERE id = 13072; -- felicidad
UPDATE rosco_questions SET definition = 'Primera letra de una palabra o nombre.' WHERE id = 13088; -- inicial
UPDATE rosco_questions SET definition = 'Cada uno de los signos del alfabeto.' WHERE id = 13103; -- letra
UPDATE rosco_questions SET definition = 'Letra pequeña, opuesta a la mayúscula.' WHERE id = 13108; -- minúscula
UPDATE rosco_questions SET definition = 'Persona con la que se comparte clase o trabajo (contiene Ñ).' WHERE id = 13117; -- compañero
UPDATE rosco_questions SET definition = 'Adjetivo: de poco tamaño (contiene Q).' WHERE id = 13132; -- pequeño
UPDATE rosco_questions SET definition = 'Atadura que hace una cuerda al doblarse sobre sí misma (contiene U).' WHERE id = 13153; -- nudo
UPDATE rosco_questions SET definition = 'Verbo: dar una razón o aclaración (contiene X).' WHERE id = 13161; -- explicar
UPDATE rosco_questions SET definition = 'Color del cielo y del mar (contiene Z).' WHERE id = 13172; -- azul

-- =====================================================================
-- 5º
-- =====================================================================
-- 13312 yegua: anotación del autor + def absurda
UPDATE rosco_questions
SET definition = 'Hembra del caballo, animal usado en transporte y carrera.'
WHERE id = 13312;

UPDATE rosco_questions SET definition = 'Verbo: sumar o agregar algo más (contiene Ñ).' WHERE id = 13257; -- añadir
UPDATE rosco_questions SET definition = 'Expresión de descontento o protesta (contiene Q).' WHERE id = 13270; -- queja

-- =====================================================================
-- 6º
-- =====================================================================

-- Duplicado métrica: 13388 con def errónea (haiku tiene 3 versos pero la métrica es la disciplina, no un poema). Renombrar a 'madrigal'.
UPDATE rosco_questions
SET solution = 'madrigal',
    definition = 'Composición poética breve sobre temas amorosos o pastoriles.'
WHERE id = 13388;

UPDATE rosco_questions SET definition = 'Persona con quien se realiza una actividad común (contiene Ñ).' WHERE id = 13396; -- compañero
UPDATE rosco_questions SET definition = 'Parte del día desde el amanecer hasta el mediodía (contiene Ñ).' WHERE id = 13398; -- mañana
UPDATE rosco_questions SET definition = 'Adjetivo: que requiere atención inmediata.' WHERE id = 13432; -- urgente

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
