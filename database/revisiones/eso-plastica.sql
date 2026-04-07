-- =====================================================================
-- Revisión rosco · ESO · Plástica · 1º a 4º ESO
-- 3º ESO sufre borrado masivo + inserción de contenido nuevo.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 2º ESO
-- =====================================================================
UPDATE rosco_questions SET solution = 'mano' WHERE id = 26100;

-- =====================================================================
-- 3º ESO · BORRADO MASIVO DE PLACEHOLDERS
-- =====================================================================

-- Letra B: 3 banio maria
DELETE FROM rosco_questions WHERE id IN (26255, 26259, 26262);

-- Letra D: 2 dioxido de carbono
DELETE FROM rosco_questions WHERE id IN (26275, 26280);

-- Letra E: 1 energia no renovable
DELETE FROM rosco_questions WHERE id = 26289;

-- Letra F: 1 forte (def musical errónea en plástica)
DELETE FROM rosco_questions WHERE id = 26299;

-- Letra G: 2 gato + grosor con def errónea
DELETE FROM rosco_questions WHERE id IN (26308, 26310, 26313);

-- Letra H: 4 homo sapiens
DELETE FROM rosco_questions WHERE id IN (26319, 26320, 26321, 26322);

-- Letra I: 2 isla
DELETE FROM rosco_questions WHERE id IN (26327, 26333);

-- Letra J: 9 juegos olimpicos + eje (no encaja en J)
DELETE FROM rosco_questions WHERE id IN (26334, 26335, 26336, 26337, 26338, 26339, 26340, 26341, 26342, 26343);

-- Letra K: 8 sketch placeholder
DELETE FROM rosco_questions WHERE id IN (26344, 26346, 26347, 26348, 26350, 26351, 26352, 26353);

-- Letra L: 1 lugar geometrico (def errónea)
DELETE FROM rosco_questions WHERE id = 26363;

-- Letra M: 4 mano alzada
DELETE FROM rosco_questions WHERE id IN (26365, 26371, 26372, 26373);

-- Letra N: 5 numero atomico
DELETE FROM rosco_questions WHERE id IN (26378, 26380, 26381, 26382, 26383);

-- Letra Ñ: 9 mañana
DELETE FROM rosco_questions WHERE id IN (26385, 26386, 26387, 26388, 26389, 26390, 26391, 26392, 26393);

-- Letra O: 4 ojo
DELETE FROM rosco_questions WHERE id IN (26397, 26398, 26401, 26403);

-- Letra P: 1 presion de grupo
DELETE FROM rosco_questions WHERE id = 26410;

-- Letra Q: 10 queso (toda la letra)
DELETE FROM rosco_questions WHERE id IN (26414, 26415, 26416, 26417, 26418, 26419, 26420, 26421, 26422, 26423);

-- Letra R: 2 rosa de los vientos
DELETE FROM rosco_questions WHERE id IN (26431, 26433);

-- Letra S: 1 suave (def musical)
DELETE FROM rosco_questions WHERE id = 26434;

-- Letra T: 2 toma de decisiones
DELETE FROM rosco_questions WHERE id IN (26449, 26451);

-- Letra U: 2 uno + Unidad mayúscula
DELETE FROM rosco_questions WHERE id IN (26455, 26456, 26463);

-- Letra V: violín (no plástica) + 2 vaso de precipitados
DELETE FROM rosco_questions WHERE id IN (26469, 26470, 26473);

-- Letra W: 10 kiwi (toda la letra)
DELETE FROM rosco_questions WHERE id IN (26474, 26475, 26476, 26477, 26478, 26479, 26480, 26481, 26482, 26483);

-- Letra X: 4 examen
DELETE FROM rosco_questions WHERE id IN (26490, 26491, 26492, 26493);

-- Letra Y: 2 yate placeholder + 8 espacios y lineas
DELETE FROM rosco_questions WHERE id IN (26494, 26495, 26496, 26497, 26498, 26499, 26500, 26501, 26502, 26503);

-- Letra Z: 2 zona placeholder + 4 capa de ozono
DELETE FROM rosco_questions WHERE id IN (26505, 26506, 26510, 26511, 26512, 26513);

-- =====================================================================
-- 3º ESO · INSERCIÓN DE CONTENIDO NUEVO
-- 27 entradas con vocabulario plástico/dibujo técnico LOMLOE
-- =====================================================================

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- LETRA J (+5)
('J','empieza','Escritura simbólica del antiguo Egipto basada en dibujos.','jeroglífico','plastica','eso',ARRAY[3],2),
('J','empieza','Recipiente decorativo de cerámica para flores o adorno.','jarrón','plastica','eso',ARRAY[3],1),
('J','empieza','Estilo de columna clásica con voluta en el capitel.','jónico','plastica','eso',ARRAY[3],2),
('J','empieza','Tipo de pintura veteada que imita las vetas del jaspe.','jaspeado','plastica','eso',ARRAY[3],3),
('J','empieza','Formato común de archivo de imagen comprimida.','jpg','plastica','eso',ARRAY[3],1),

-- LETRA K (+3)
('K','empieza','Papel marrón resistente usado como soporte de dibujo y embalaje.','kraft','plastica','eso',ARRAY[3],2),
('K','empieza','Pintor ruso pionero del arte abstracto.','kandinsky','plastica','eso',ARRAY[3],3),
('K','empieza','Pintor austriaco modernista, autor de "El beso".','klimt','plastica','eso',ARRAY[3],3),

-- LETRA Ñ (+4, contiene Ñ)
('Ñ','contiene','Adjetivo: de tamaño reducido, opuesto a grande (contiene Ñ).','pequeño','plastica','eso',ARRAY[3],1),
('Ñ','contiene','Elemento del paisaje: gran elevación natural del terreno (contiene Ñ).','montaña','plastica','eso',ARRAY[3],1),
('Ñ','contiene','Persona con quien se realiza un trabajo en grupo (contiene Ñ).','compañero','plastica','eso',ARRAY[3],1),
('Ñ','contiene','Tallo hueco vegetal usado a veces como mango de pinceles (contiene Ñ).','caña','plastica','eso',ARRAY[3],2),

-- LETRA Q (+5, contiene Q)
('Q','contiene','Arte y técnica de proyectar y construir edificios (contiene Q).','arquitectura','plastica','eso',ARRAY[3],2),
('Q','contiene','Modelo a escala reducida de un edificio o proyecto (contiene Q).','maqueta','plastica','eso',ARRAY[3],2),
('Q','contiene','Dibujo simplificado que resume las partes de algo (contiene Q).','esquema','plastica','eso',ARRAY[3],2),
('Q','contiene','Dibujo previo y rápido de una idea, sin detalles (contiene Q).','bosquejo','plastica','eso',ARRAY[3],2),
('Q','contiene','Principio compositivo: estabilidad visual de los elementos (contiene Q).','equilibrio','plastica','eso',ARRAY[3],2),

-- LETRA W (+5, contiene W)
('W','contiene','Pintor estadounidense del Pop Art famoso por sus latas de sopa (contiene W).','warhol','plastica','eso',ARRAY[3],3),
('W','contiene','Pintor estadounidense del s.XIX, autor del retrato de su madre (contiene W).','whistler','plastica','eso',ARRAY[3],3),
('W','contiene','Pintor francés del rococó famoso por sus escenas galantes (contiene W).','watteau','plastica','eso',ARRAY[3],3),
('W','contiene','Famoso arquitecto estadounidense del siglo XX (Frank Lloyd...) (contiene W).','wright','plastica','eso',ARRAY[3],3),
('W','contiene','Página de internet, soporte habitual del diseño digital (contiene W).','web','plastica','eso',ARRAY[3],1),

-- LETRA Y (+5)
('Y','empieza','Mineral blanco usado en escultura y construcción.','yeso','plastica','eso',ARRAY[3],1),
('Y','contiene','Plan de trabajo para diseñar una obra (contiene Y).','proyecto','plastica','eso',ARRAY[3],1),
('Y','contiene','Práctica artística para perfeccionar la técnica (contiene Y).','ensayo','plastica','eso',ARRAY[3],2),
('Y','contiene','Recurso compositivo: colocar elementos uno al lado del otro (contiene Y).','yuxtaposición','plastica','eso',ARRAY[3],3),
('Y','contiene','Tamaño grande de un formato de papel (contiene Y).','mayor','plastica','eso',ARRAY[3],1);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
