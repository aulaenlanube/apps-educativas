-- =====================================================================
-- Revisión rosco · ESO · Música · 1º a 4º ESO
-- 3º ESO sufre borrado masivo + inserción de contenido nuevo.
-- NO se ejecuta hasta revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 24692; -- intervalo duplicado

-- =====================================================================
-- 2º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id IN (
  24880, -- ars nova duplicado
  24906, -- clave duplicado
  24940, -- fuerte duplicado
  25026  -- tañer duplicado (25032 ya en global-anotaciones)
);

UPDATE rosco_questions SET solution = 'espacios' WHERE id = 24928; -- Espacios mayúscula

-- =====================================================================
-- 3º ESO · BORRADO MASIVO DE PLACEHOLDERS
-- =====================================================================

-- Letra C: Clasicismo mayúscula con def errónea (describe homofonía)
DELETE FROM rosco_questions WHERE id = 25180;

-- Letra D: 5 dinámica + duo erróneo + drama erróneo
DELETE FROM rosco_questions WHERE id IN (25186, 25187, 25188, 25189, 25190, 25191, 25192);

-- Letra E: 3 escala placeholder
DELETE FROM rosco_questions WHERE id IN (25198, 25202, 25203);

-- Letra F: 2 fuga placeholder
DELETE FROM rosco_questions WHERE id IN (25211, 25212);

-- Letra G: bugs varios con definiciones que apuntan a otras palabras
DELETE FROM rosco_questions WHERE id IN (
  25216, -- glissando placeholder
  25218, -- giocoso (def 'ritmo rápido' es presto/allegro)
  25219, -- glissando placeholder
  25220, -- germanico bug (describe Bach)
  25221, -- genio bug (describe Beethoven)
  25222, -- gama bug (describe trompa)
  25223  -- giachino bug (describe Rossini)
);

-- Letra H: 5 himno placeholder
DELETE FROM rosco_questions WHERE id IN (25226, 25227, 25230, 25232, 25233);

-- Letra I: 3 intervalo placeholder + 2 con defs equivocadas
DELETE FROM rosco_questions WHERE id IN (
  25239, -- instrumento def piano (errónea)
  25240, -- intensidad def forte (errónea)
  25241, 25242, 25243 -- intervalo placeholder
);

-- Letra J: 7 jota placeholder
DELETE FROM rosco_questions WHERE id IN (25245, 25246, 25247, 25250, 25251, 25252, 25253);

-- Letra K: 6 kilo placeholder + rock que no encaja en K
DELETE FROM rosco_questions WHERE id IN (
  25255, 25258, 25259, 25260, 25261, 25262, 25263
);

-- Letra L: 4 legato placeholder
DELETE FROM rosco_questions WHERE id IN (25269, 25271, 25272, 25273);

-- Letra M: 2 métrica placeholder
DELETE FROM rosco_questions WHERE id IN (25282, 25283);

-- Letra N: 7 nota placeholder
DELETE FROM rosco_questions WHERE id IN (25286, 25288, 25289, 25290, 25291, 25292, 25293);

-- Letra Ñ: 10 mañana placeholder (toda la letra)
DELETE FROM rosco_questions WHERE id IN (25294, 25295, 25296, 25297, 25298, 25299, 25300, 25301, 25302, 25303);

-- Letra O: 4 obertura placeholder
DELETE FROM rosco_questions WHERE id IN (25308, 25309, 25311, 25313);

-- Letra P: 4 pentagrama placeholder
DELETE FROM rosco_questions WHERE id IN (25319, 25320, 25321, 25322);

-- Letra Q: 9 queso placeholder
DELETE FROM rosco_questions WHERE id IN (25324, 25326, 25327, 25328, 25329, 25330, 25331, 25332, 25333);

-- Letra R: 5 ritmo placeholder
DELETE FROM rosco_questions WHERE id IN (25338, 25340, 25341, 25342, 25343);

-- Letra S: 3 sinfonía placeholder
DELETE FROM rosco_questions WHERE id IN (25348, 25349, 25353);

-- Letra T: 2 tempo placeholder
DELETE FROM rosco_questions WHERE id IN (25355, 25357);

-- Letra U: 9 unísono placeholder
DELETE FROM rosco_questions WHERE id IN (25365, 25366, 25367, 25368, 25369, 25370, 25371, 25372, 25373);

-- Letra V: 2 vibrato placeholder
DELETE FROM rosco_questions WHERE id IN (25382, 25383);

-- Letra W: 8 waltz placeholder
DELETE FROM rosco_questions WHERE id IN (25386, 25387, 25388, 25389, 25390, 25391, 25392, 25393);

-- Letra X: 9 examen placeholder (toda la letra menos xilófono)
DELETE FROM rosco_questions WHERE id IN (25395, 25396, 25397, 25398, 25399, 25400, 25401, 25402, 25403);

-- Letra Y: 10 yodle placeholder (toda la letra)
DELETE FROM rosco_questions WHERE id IN (25404, 25405, 25406, 25407, 25408, 25409, 25410, 25411, 25412, 25413);

-- Letra Z: 8 zarzuela placeholder
DELETE FROM rosco_questions WHERE id IN (25415, 25416, 25417, 25418, 25419, 25420, 25421, 25422);

-- =====================================================================
-- 3º ESO · INSERCIÓN DE CONTENIDO NUEVO
-- 32 entradas nuevas con vocabulario musical LOMLOE
-- Cada entrada verificada: la solution contiene/empieza por la letra.
-- =====================================================================

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- LETRA D (+2)
('D','empieza','Movimiento del cuerpo al ritmo de la música.','danza','musica','eso',ARRAY[3],1),
('D','empieza','Conjunto musical formado por dos intérpretes.','dúo','musica','eso',ARRAY[3],1),

-- LETRA G (+1)
('G','empieza','Técnica de deslizar la voz o el dedo entre dos notas continuamente.','glissando','musica','eso',ARRAY[3],2),

-- LETRA J (+2)
('J','empieza','Cancioncilla breve y pegadiza usada en publicidad.','jingle','musica','eso',ARRAY[3],2),
('J','empieza','Fiesta popular ruidosa con música y baile.','jolgorio','musica','eso',ARRAY[3],2),

-- LETRA K (+2)
('K','empieza','Instrumento de cuerda de la antigua Grecia, antecesor de la lira.','kithara','musica','eso',ARRAY[3],3),
('K','empieza','Forma de teatro japonés con música tradicional.','kabuki','musica','eso',ARRAY[3],3),

-- LETRA N (+2)
('N','empieza','Movimiento musical del siglo XIX que usaba folclore del propio país.','nacionalismo','musica','eso',ARRAY[3],2),
('N','empieza','Movimiento musical del siglo XX que recupera las formas clásicas.','neoclasicismo','musica','eso',ARRAY[3],3),

-- LETRA Ñ (+5, contiene Ñ)
('Ñ','contiene','Canción tradicional para dormir a los niños (contiene Ñ).','nana','musica','eso',ARRAY[3],1),
('Ñ','contiene','Persona que comparte la actividad de un grupo musical (contiene Ñ).','compañero','musica','eso',ARRAY[3],1),
('Ñ','contiene','Estación del año retratada por Vivaldi en "Las Cuatro Estaciones" (contiene Ñ).','otoño','musica','eso',ARRAY[3],2),
('Ñ','contiene','Voz blanca infantil característica de los coros (contiene Ñ).','niño','musica','eso',ARRAY[3],1),
('Ñ','contiene','Tema frecuente en las canciones de cuna y nanas (contiene Ñ).','sueño','musica','eso',ARRAY[3],1),

-- LETRA Q (+3, contiene Q + 1 empieza)
('Q','contiene','Conjunto de músicos dirigidos por un director (contiene Q).','orquesta','musica','eso',ARRAY[3],1),
('Q','contiene','Estilo recargado y ornamentado propio del periodo Barroco (contiene Q).','barroquismo','musica','eso',ARRAY[3],3),
('Q','empieza','Flauta andina tradicional de origen indígena.','quena','musica','eso',ARRAY[3],2),

-- LETRA U (+4)
('U','empieza','Instrumento de cuerda hawaiano de cuatro cuerdas.','ukelele','musica','eso',ARRAY[3],1),
('U','empieza','Conexión de dos voces o instrumentos en una sola línea melódica.','unión','musica','eso',ARRAY[3],2),
('U','empieza','Pulso o cantidad básica que organiza el ritmo de una pieza.','unidad','musica','eso',ARRAY[3],2),
('U','empieza','Adjetivo: que es el único intérprete (Solo).','único','musica','eso',ARRAY[3],1),

-- LETRA W (+3, contiene W)
('W','contiene','Pieza musical en compás ternario, "vals" en inglés (contiene W).','waltz','musica','eso',ARRAY[3],2),
('W','contiene','Sintetizador electrónico profesional (contiene W).','workstation','musica','eso',ARRAY[3],3),
('W','contiene','Estilo de jazz de los años 30 muy bailable (contiene W).','swing','musica','eso',ARRAY[3],2),

-- LETRA X (+4, contiene X)
('X','contiene','Instrumento de viento-madera con caña simple inventado por Adolphe Sax (contiene X).','saxofón','musica','eso',ARRAY[3],2),
('X','contiene','Sección inicial de la sonata donde se presentan los temas (contiene X).','exposición','musica','eso',ARRAY[3],2),
('X','contiene','Capacidad de interpretar una pieza con sentimiento (contiene X).','expresión','musica','eso',ARRAY[3],2),
('X','contiene','Conjunto musical de seis intérpretes (contiene X).','sexteto','musica','eso',ARRAY[3],2),

-- LETRA Y (+5, contiene Y + 1 empieza)
('Y','empieza','Canto tradicional alpino con cambios bruscos entre voz natural y falsete.','yodel','musica','eso',ARRAY[3],3),
('Y','contiene','Compositor austriaco padre de la sinfonía clásica (contiene Y).','haydn','musica','eso',ARRAY[3],2),
('Y','contiene','Práctica de un grupo musical antes de un concierto (contiene Y).','ensayo','musica','eso',ARRAY[3],1),
('Y','contiene','Tonalidad alegre, opuesta a la menor (contiene Y).','mayor','musica','eso',ARRAY[3],1),
('Y','contiene','Tecla de reproducción en un dispositivo de audio (contiene Y).','play','musica','eso',ARRAY[3],1),

-- LETRA Z (+3)
('Z','empieza','Baile flamenco con percusión rítmica de los pies.','zapateado','musica','eso',ARRAY[3],2),
('Z','empieza','Música y danza tradicional vasca en compás de 5/8.','zortziko','musica','eso',ARRAY[3],3),
('Z','contiene','Danza polaca de ritmo ternario que cultivaron Chopin y Liszt (contiene Z).','mazurca','musica','eso',ARRAY[3],3);

-- =====================================================================
-- 4º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 25459; -- disco duplicado

UPDATE rosco_questions
SET solution = 'metallica',
    definition = 'Famosa banda estadounidense de heavy metal (contiene K).'
WHERE id = 25532;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
