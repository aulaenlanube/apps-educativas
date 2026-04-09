-- ============================================================
-- FIX: Eliminar palabras duplicadas entre categorías de runner
-- Ejecutar en Supabase SQL Editor
-- ============================================================

BEGIN;

-- ============================================================
-- LENGUA 1º — 1 duplicado
-- ============================================================
-- "lazarillo" en Autores del Renacimiento → reemplazar por "valdes"
UPDATE runner_categories SET words = replace(words::text, '"lazarillo"', '"valdes"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'lengua' AND category_name = 'Autores del Renacimiento';

-- ============================================================
-- LENGUA 2º — 3 duplicados
-- ============================================================
-- "valle" en Teatro del siglo XX → reemplazar por "mihura"
UPDATE runner_categories SET words = replace(words::text, '"valle"', '"mihura"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'lengua' AND category_name ILIKE '%Teatro%';

-- "benavente" en Generación del 98 → reemplazar por "camba"
UPDATE runner_categories SET words = replace(words::text, '"benavente"', '"camba"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'lengua' AND category_name ILIKE '%98%';

-- "lorca" en Teatro del siglo XX → reemplazar por "jardiel"
UPDATE runner_categories SET words = replace(words::text, '"lorca"', '"jardiel"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'lengua' AND category_name ILIKE '%Teatro%';

-- ============================================================
-- FILOSOFÍA 1º — 2 duplicados
-- ============================================================
-- "relativismo" en Corrientes éticas → reemplazar por "personalismo"
UPDATE runner_categories SET words = replace(words::text, '"relativismo"', '"personalismo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%ticas%';

-- "contingencia" en Conceptos de lógica → reemplazar por "implicacion"
UPDATE runner_categories SET words = replace(words::text, '"contingencia"', '"implicacion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%gica%';

-- ============================================================
-- FILOSOFÍA 2º — 4 duplicados (sustancia e idea en 3 categorías cada una)
-- ============================================================
-- "sustancia" en Conceptos de Descartes → "metodo"
UPDATE runner_categories SET words = replace(words::text, '"sustancia"', '"metodo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%Descartes%';

-- "sustancia" en Conceptos de Hume → "percepcion"
UPDATE runner_categories SET words = replace(words::text, '"sustancia"', '"percepcion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%Hume%';

-- "idea" en Conceptos de Ortega → "proyecto"
UPDATE runner_categories SET words = replace(words::text, '"idea"', '"proyecto"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%Ortega%';

-- "idea" en Conceptos de Hume → "conexion necesaria"
UPDATE runner_categories SET words = replace(words::text, '"idea"', '"conexion necesaria"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%Hume%';

-- "perspectivismo" en Conceptos de Nietzsche → "moral de señores"
UPDATE runner_categories SET words = replace(words::text, '"perspectivismo"', '"moral de señores"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%Nietzsche%';

-- "creencia" en Conceptos de Hume → "costumbre"
UPDATE runner_categories SET words = replace(words::text, '"creencia"', '"costumbre"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'filosofia' AND category_name ILIKE '%Hume%';

-- ============================================================
-- MATEMÁTICAS 1º — 5 duplicados
-- ============================================================
-- "tangente" en Derivadas → "recta"
UPDATE runner_categories SET words = replace(words::text, '"tangente"', '"recta"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'matematicas' AND category_name ILIKE '%Derivadas%';

-- "identidad" en Matrices → "nula"
UPDATE runner_categories SET words = replace(words::text, '"identidad"', '"nula"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'matematicas' AND category_name ILIKE '%Matrices%';

-- "escalar" en Matrices → "cofactor"
UPDATE runner_categories SET words = replace(words::text, '"escalar"', '"cofactor"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'matematicas' AND category_name ILIKE '%Matrices%';

-- "combinacion" en Vectores → "dependencia"
UPDATE runner_categories SET words = replace(words::text, '"combinacion"', '"dependencia"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'matematicas' AND category_name ILIKE '%Vectores%';

-- "logaritmica" en Derivadas → "implicita"
UPDATE runner_categories SET words = replace(words::text, '"logaritmica"', '"implicita"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'matematicas' AND category_name ILIKE '%Derivadas%';

-- ============================================================
-- MATEMÁTICAS 2º — 2 duplicados
-- ============================================================
-- "percentil" en Distribuciones → "esperanza"
UPDATE runner_categories SET words = replace(words::text, '"percentil"', '"esperanza"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'matematicas' AND category_name ILIKE '%Distribuciones%';

-- "parametro" en Álgebra lineal → "adjunta"
UPDATE runner_categories SET words = replace(words::text, '"parametro"', '"adjunta"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'matematicas' AND category_name ILIKE '%lgebra%';

-- ============================================================
-- FÍSICA 1º — 3 duplicados
-- ============================================================
-- "electronegatividad" en Estructura atómica → "valencia"
UPDATE runner_categories SET words = replace(words::text, '"electronegatividad"', '"valencia"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%Estructura%';

-- "rendimiento" en Energía → "joule"
UPDATE runner_categories SET words = replace(words::text, '"rendimiento"', '"joule"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%Energ%';

-- "moles" en Leyes de los gases → "manometro"
UPDATE runner_categories SET words = replace(words::text, '"moles"', '"manometro"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%gases%';

-- ============================================================
-- FÍSICA 2º — 9 duplicados
-- ============================================================
-- "intensidad" en Campo gravitatorio → "aceleracion gravitatoria"
UPDATE runner_categories SET words = replace(words::text, '"intensidad"', '"aceleracion gravitatoria"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%gravitatorio%';

-- "potencial" en Campo gravitatorio → "newton"
UPDATE runner_categories SET words = replace(words::text, '"potencial"', '"newton"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%gravitatorio%';

-- "flujo" en Campo eléctrico → "campo"
UPDATE runner_categories SET words = replace(words::text, '"flujo"', '"campo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%ctrico%';

-- "difraccion" en Ondas → "nodo"
UPDATE runner_categories SET words = replace(words::text, '"difraccion"', '"nodo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%Ondas%';

-- "reflexion" en Ondas → "armonico"
UPDATE runner_categories SET words = replace(words::text, '"reflexion"', '"armonico"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%Ondas%';

-- "refraccion" en Ondas → "propagacion"
UPDATE runner_categories SET words = replace(words::text, '"refraccion"', '"propagacion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%Ondas%';

-- "velocidad" en Relatividad → "relativista"
UPDATE runner_categories SET words = replace(words::text, '"velocidad"', '"relativista"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%Relatividad%';

-- "masa" en Campo gravitatorio → "peso"
UPDATE runner_categories SET words = replace(words::text, '"masa"', '"peso"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%gravitatorio%';

-- "foton" en Relatividad → "referencia"
UPDATE runner_categories SET words = replace(words::text, '"foton"', '"referencia"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'fisica' AND category_name ILIKE '%Relatividad%';

-- ============================================================
-- QUÍMICA 2º — 6 duplicados
-- ============================================================
-- "concentracion" en Equilibrio químico → "producto"
UPDATE runner_categories SET words = replace(words::text, '"concentracion"', '"producto"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'quimica' AND category_name ILIKE '%Equilibrio%';

-- "temperatura" en Cinética química → "inhibidor"
UPDATE runner_categories SET words = replace(words::text, '"temperatura"', '"inhibidor"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'quimica' AND category_name ILIKE '%Cin%tica%';

-- "acido" en Química orgánica - Grupos funcionales → "carboxilo"
UPDATE runner_categories SET words = replace(words::text, '"acido"', '"carboxilo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'quimica' AND category_name ILIKE '%Grupos funcionales%';

-- "oxidacion" en Tipos de reacciones orgánicas → "cracking"
UPDATE runner_categories SET words = replace(words::text, '"oxidacion"', '"cracking"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'quimica' AND category_name ILIKE '%reacciones org%';

-- "reduccion" en Tipos de reacciones orgánicas → "isomerizacion"
UPDATE runner_categories SET words = replace(words::text, '"reduccion"', '"isomerizacion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'quimica' AND category_name ILIKE '%reacciones org%';

-- "hidrolisis" en Ácido-base → "neutralizacion"
UPDATE runner_categories SET words = replace(words::text, '"hidrolisis"', '"neutralizacion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'quimica' AND category_name ILIKE '%cido-base%';

-- ============================================================
-- HISTORIA DEL MUNDO 1º — 3 duplicados
-- ============================================================
-- "congo" en Imperialismo → "indochina"
UPDATE runner_categories SET words = replace(words::text, '"congo"', '"indochina"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'historia-mundo' AND category_name ILIKE '%Imperialismo%';

-- "fascismo" en Ideologías contemporáneas → "totalitarismo"
UPDATE runner_categories SET words = replace(words::text, '"fascismo"', '"totalitarismo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'historia-mundo' AND category_name ILIKE '%Ideolog%';

-- "populismo" en Mundo actual → "polarizacion"
UPDATE runner_categories SET words = replace(words::text, '"populismo"', '"polarizacion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'historia-mundo' AND category_name ILIKE '%Mundo actual%';

-- ============================================================
-- HISTORIA DE ESPAÑA 2º — 1 duplicado
-- ============================================================
-- "constitucion" en Siglo XIX → "pronunciamiento"
UPDATE runner_categories SET words = replace(words::text, '"constitucion"', '"pronunciamiento"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'historia-espana' AND category_name ILIKE '%XIX%';

-- ============================================================
-- GEOGRAFÍA 2º — 2 duplicados
-- ============================================================
-- "ebro" en Relieve → "galaico"
UPDATE runner_categories SET words = replace(words::text, '"ebro"', '"galaico"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'geografia' AND category_name ILIKE '%Relieve%';

-- "guadalquivir" en Relieve → "subbetica"
UPDATE runner_categories SET words = replace(words::text, '"guadalquivir"', '"subbetica"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'geografia' AND category_name ILIKE '%Relieve%';

-- ============================================================
-- ARTE 2º — 3 duplicados
-- ============================================================
-- "velazquez" en Barroco → "vermeer"
UPDATE runner_categories SET words = replace(words::text, '"velazquez"', '"vermeer"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'arte' AND category_name ILIKE '%Barroco%';

-- "goya" en Neoclasicismo → "gericault"
UPDATE runner_categories SET words = replace(words::text, '"goya"', '"gericault"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'arte' AND category_name ILIKE '%Neoclasicismo%';

-- "picasso" en Vanguardias → "mondrian"
UPDATE runner_categories SET words = replace(words::text, '"picasso"', '"mondrian"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'arte' AND category_name ILIKE '%Vanguardias%';

-- ============================================================
-- ECONOMÍA 1º — 8 duplicados
-- ============================================================
-- "balanza" en Macroeconomía → "ciclo"
UPDATE runner_categories SET words = replace(words::text, '"balanza"', '"ciclo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Macroeconom%';

-- "deficit" en Macroeconomía → "demanda agregada"
UPDATE runner_categories SET words = replace(words::text, '"deficit"', '"demanda agregada"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Macroeconom%';

-- "deuda" en Macroeconomía → "tipo de cambio"
UPDATE runner_categories SET words = replace(words::text, '"deuda"', '"tipo de cambio"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Macroeconom%';

-- "impuesto" en Política económica → "subvencion"
UPDATE runner_categories SET words = replace(words::text, '"impuesto"', '"subvencion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Pol%tica%';

-- "presupuesto" en Política económica → "devaluacion"
UPDATE runner_categories SET words = replace(words::text, '"presupuesto"', '"devaluacion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Pol%tica%';

-- "gasto" en Política económica → "desregulacion"
UPDATE runner_categories SET words = replace(words::text, '"gasto"', '"desregulacion"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Pol%tica%';

-- "bce" en Política económica → "austeridad"
UPDATE runner_categories SET words = replace(words::text, '"bce"', '"austeridad"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Pol%tica%';

-- "regulación"/"regulacion" en Mercado → "cartel"
UPDATE runner_categories SET words = replace(replace(words::text, '"regulación"', '"cartel"'), '"regulacion"', '"cartel"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia' AND category_name ILIKE '%Mercado%';

-- ============================================================
-- ECONOMÍA DE LA EMPRESA 2º — 3 duplicados
-- ============================================================
-- "productividad" en Recursos humanos → "absentismo"
UPDATE runner_categories SET words = replace(words::text, '"productividad"', '"absentismo"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia-empresa' AND category_name ILIKE '%Recursos%';

-- "inventario" en Contabilidad → "libro mayor"
UPDATE runner_categories SET words = replace(words::text, '"inventario"', '"libro mayor"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia-empresa' AND category_name ILIKE '%Contabilidad%';

-- "cadena valor" en Producción → "lean manufacturing"
UPDATE runner_categories SET words = replace(words::text, '"cadena valor"', '"lean manufacturing"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'economia-empresa' AND category_name ILIKE '%Producci%';

-- ============================================================
-- LATÍN 1º — 4 duplicados (ordinales en Declinaciones y Conjugaciones)
-- Cambiar los de Conjugaciones a verbos modelo
-- ============================================================
UPDATE runner_categories SET words = replace(words::text, '"primera"', '"laudare"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'latin' AND category_name ILIKE '%Conjugaciones%';

UPDATE runner_categories SET words = replace(words::text, '"segunda"', '"monere"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'latin' AND category_name ILIKE '%Conjugaciones%';

UPDATE runner_categories SET words = replace(words::text, '"tercera"', '"ducere"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'latin' AND category_name ILIKE '%Conjugaciones%';

UPDATE runner_categories SET words = replace(words::text, '"cuarta"', '"venire"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'latin' AND category_name ILIKE '%Conjugaciones%';

-- ============================================================
-- BIOLOGÍA 2º — 2 duplicados
-- ============================================================
-- "plasmido" en Genética molecular → "haploide"
UPDATE runner_categories SET words = replace(words::text, '"plasmido"', '"haploide"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'biologia' AND category_name ILIKE '%tica molecular%';

-- "ligasa" en Biotecnología → "recombinante"
UPDATE runner_categories SET words = replace(words::text, '"ligasa"', '"recombinante"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'biologia' AND category_name ILIKE '%Biotecnolog%';

-- ============================================================
-- TECNOLOGÍA 1º-2º — 2 duplicados
-- ============================================================
-- "rele" en Automatización → "scada"
UPDATE runner_categories SET words = replace(words::text, '"rele"', '"scada"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'tecnologia' AND category_name ILIKE '%Automatizaci%';

-- "resistencia" en Magnitudes eléctricas → "reactancia"
UPDATE runner_categories SET words = replace(words::text, '"resistencia"', '"reactancia"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'tecnologia' AND category_name ILIKE '%Magnitudes%';

-- ============================================================
-- PROGRAMACIÓN 1º-2º — 2 duplicados
-- ============================================================
-- "javascript" en Desarrollo web → "dom"
UPDATE runner_categories SET words = replace(words::text, '"javascript"', '"dom"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'programacion' AND category_name ILIKE '%Desarrollo web%';

-- "insercion" en Bases de datos → "esquema"
UPDATE runner_categories SET words = replace(words::text, '"insercion"', '"esquema"')::jsonb
WHERE level = 'bachillerato' AND subject_id = 'programacion' AND category_name ILIKE '%Bases de datos%';

COMMIT;

-- ============================================================
-- RESUMEN: 65 reemplazos en 17 asignaturas/grupos
-- Todas las palabras son ahora mutuamente excluyentes
-- ============================================================
-- =============================================================================
-- ROSCO BACHILLERATO: Lengua 1o, Lengua 2o, Filosofia 1o, Filosofia 2o
-- 75 preguntas x 4 asignaturas = 300 preguntas
-- =============================================================================

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty)
VALUES

-- =============================================================================
-- LENGUA 1o BACHILLERATO (75 preguntas)
-- Temas: Renacimiento, Barroco, Siglo de Oro, sintaxis compleja,
--         morfologia, semantica, pragmatica, tipologia textual,
--         figuras retoricas, metrica, generos, autores y obras
-- =============================================================================

-- 1
('A', 'empieza', 'Figura retorica que consiste en la repeticion de una o varias palabras al comienzo de versos o frases sucesivas', 'anafora', 'lengua', 'bachillerato', '{1}', 1),
-- 2
('A', 'empieza', 'Figura retorica que consiste en la supresion de conjunciones para dar mayor dinamismo y rapidez al enunciado', 'asindeton', 'lengua', 'bachillerato', '{1}', 1),
-- 3
('A', 'empieza', 'Figura retorica que consiste en atribuir cualidades de seres animados a objetos inanimados o ideas abstractas', 'animismo', 'lengua', 'bachillerato', '{1}', 2),
-- 4
('B', 'empieza', 'Movimiento literario y artistico del siglo XVII espanol caracterizado por la complejidad formal, el desengano y el contraste', 'barroco', 'lengua', 'bachillerato', '{1}', 1),
-- 5
('B', 'empieza', 'Subgenero poetico pastoril cultivado en el Renacimiento que idealiza la naturaleza como locus amoenus', 'bucolica', 'lengua', 'bachillerato', '{1}', 2),
-- 6
('C', 'empieza', 'Estrofa de cuatro versos endecasilabos con rima consonante ABBA, muy empleada en los sonetos renacentistas', 'cuarteto', 'lengua', 'bachillerato', '{1}', 1),
-- 7
('C', 'empieza', 'Corriente estetica del Barroco que se caracteriza por la oscuridad, los latinismos y la ornamentacion del lenguaje, representada por Gongora', 'culteranismo', 'lengua', 'bachillerato', '{1}', 1),
-- 8
('C', 'empieza', 'Corriente estetica barroca que busca la agudeza del ingenio y el juego de ideas, representada por Quevedo y Gracian', 'conceptismo', 'lengua', 'bachillerato', '{1}', 1),
-- 9
('D', 'empieza', 'Composicion poetica formada por dos versos que riman entre si, usada a veces como remate de sonetos en la tradicion inglesa', 'distico', 'lengua', 'bachillerato', '{1}', 2),
-- 10
('D', 'empieza', 'Fenomeno semantico por el cual una misma palabra tiene dos o mas acepciones distintas pero relacionadas entre si', 'disemia', 'lengua', 'bachillerato', '{1}', 3),
-- 11
('E', 'empieza', 'Verso de once silabas metricas, base de la poesia renacentista espanola introducido por Boscan y Garcilaso', 'endecasilabo', 'lengua', 'bachillerato', '{1}', 1),
-- 12
('E', 'empieza', 'Figura retorica que consiste en suavizar una expresion que podria resultar dura, desagradable o malsonante', 'eufemismo', 'lengua', 'bachillerato', '{1}', 1),
-- 13
('E', 'empieza', 'Poema pastoril en forma de dialogo entre pastores sobre temas amorosos, cultivado por Garcilaso y Virgilio', 'egloga', 'lengua', 'bachillerato', '{1}', 1),
-- 14
('F', 'empieza', 'Recursos expresivos del lenguaje literario que se apartan del uso comun para producir un efecto estetico determinado', 'figuras', 'lengua', 'bachillerato', '{1}', 1),
-- 15
('F', 'empieza', 'Tipo de texto cuya intencion comunicativa principal es influir en la conducta o las opiniones del receptor', 'funcional', 'lengua', 'bachillerato', '{1}', 2),
-- 16
('G', 'empieza', 'Poeta renacentista toledano autor de las Eglogas, considerado el introductor del petrarquismo en la lirica espanola', 'garcilaso', 'lengua', 'bachillerato', '{1}', 1),
-- 17
('G', 'empieza', 'Cada una de las grandes categorias en que se clasifican las obras literarias: lirico, narrativo y dramatico', 'genero', 'lengua', 'bachillerato', '{1}', 1),
-- 18
('G', 'empieza', 'Escritor barroco aragones autor de El Criticon y el Oraculo manual y arte de prudencia, teorico del conceptismo', 'gracian', 'lengua', 'bachillerato', '{1}', 2),
-- 19
('H', 'empieza', 'Figura retorica que consiste en la exageracion desmesurada de las cualidades o acciones para enfatizar una idea', 'hiperbole', 'lengua', 'bachillerato', '{1}', 1),
-- 20
('H', 'empieza', 'Verso de siete silabas metricas, frecuente en las liras y silvas del Renacimiento y el Barroco', 'heptasilabo', 'lengua', 'bachillerato', '{1}', 1),
-- 21
('H', 'empieza', 'Fenomeno semantico por el cual dos palabras distintas tienen identica forma pero significados diferentes y sin relacion', 'homonimia', 'lengua', 'bachillerato', '{1}', 2),
-- 22
('I', 'empieza', 'Figura retorica que consiste en expresar lo contrario de lo que se quiere decir, manteniendo apariencia de veracidad', 'ironia', 'lengua', 'bachillerato', '{1}', 1),
-- 23
('I', 'empieza', 'Recurso retorico que consiste en la descripcion viva y detallada de personas, paisajes u objetos apelando a los sentidos', 'imagen', 'lengua', 'bachillerato', '{1}', 2),
-- 24
('J', 'empieza', 'Composicion lirica popular de la Edad Media hispanohebrea o hispanoarebe que suele expresar una queja amorosa femenina', 'jarcha', 'lengua', 'bachillerato', '{1}', 2),
-- 25
('K', 'contiene', 'Figura retorica que une dos terminos de significado opuesto en una misma expresion, como musica callada o soledad sonora', 'oximoron', 'lengua', 'bachillerato', '{1}', 2),
-- 26
('L', 'empieza', 'Estrofa de cinco versos que combina heptasilabos y endecasilabos con rima consonante, introducida por Garcilaso en la poesia espanola', 'lira', 'lengua', 'bachillerato', '{1}', 1),
-- 27
('L', 'empieza', 'Genero literario que agrupa las obras que expresan sentimientos y emociones del yo poetico, en verso o prosa', 'lirica', 'lengua', 'bachillerato', '{1}', 1),
-- 28
('M', 'empieza', 'Figura retorica que consiste en identificar un termino real con otro imaginario con el que guarda una relacion de semejanza', 'metafora', 'lengua', 'bachillerato', '{1}', 1),
-- 29
('M', 'empieza', 'Disciplina que estudia la medida, el ritmo, la pausa y la combinacion de los versos en la poesia', 'metrica', 'lengua', 'bachillerato', '{1}', 1),
-- 30
('M', 'empieza', 'Figura retorica que consiste en designar una cosa con el nombre de otra con la que mantiene una relacion de contiguidad', 'metonimia', 'lengua', 'bachillerato', '{1}', 2),
-- 31
('M', 'empieza', 'Parte de la gramatica que estudia la estructura interna de las palabras y sus procesos de formacion', 'morfologia', 'lengua', 'bachillerato', '{1}', 1),
-- 32
('N', 'empieza', 'Genero literario que presenta una historia ficticia protagonizada por personajes en un espacio y tiempo determinados', 'narrativa', 'lengua', 'bachillerato', '{1}', 1),
-- 33
('N', 'empieza', 'Subgenero narrativo del Renacimiento que idealiza la vida de los pastores en un entorno idilico', 'novela', 'lengua', 'bachillerato', '{1}', 2),
-- 34
('Ñ', 'contiene', 'Composicion teatral breve y comica del Siglo de Oro que se representaba en los entreactos de las comedias principales', 'entremes', 'lengua', 'bachillerato', '{1}', 2),
-- 35
('O', 'empieza', 'Composicion lirica extensa de tono elevado destinada a la alabanza, cultivada por Fray Luis de Leon', 'oda', 'lengua', 'bachillerato', '{1}', 2),
-- 36
('O', 'empieza', 'Estrofa de ocho versos endecasilabos con rima consonante ABABABCC, usada en la poesia epica renacentista', 'octava', 'lengua', 'bachillerato', '{1}', 2),
-- 37
('P', 'empieza', 'Novela del Siglo de Oro que narra las aventuras de un protagonista de baja condicion social que sirve a varios amos', 'picaresca', 'lengua', 'bachillerato', '{1}', 1),
-- 38
('P', 'empieza', 'Figura retorica que consiste en la repeticion innecesaria de palabras o ideas para reforzar un concepto', 'pleonasmo', 'lengua', 'bachillerato', '{1}', 2),
-- 39
('P', 'empieza', 'Figura retorica que consiste en atribuir cualidades o acciones humanas a seres inanimados o abstractos', 'prosopopeya', 'lengua', 'bachillerato', '{1}', 2),
-- 40
('P', 'empieza', 'Fenomeno semantico por el cual una misma palabra posee multiples significados relacionados entre si', 'polisemia', 'lengua', 'bachillerato', '{1}', 1),
-- 41
('Q', 'empieza', 'Escritor barroco madrileno autor de El Buscon y los Suenos, maximo representante del conceptismo', 'quevedo', 'lengua', 'bachillerato', '{1}', 1),
-- 42
('R', 'empieza', 'Movimiento cultural europeo de los siglos XV y XVI que recupera los ideales clasicos grecolatinos', 'renacimiento', 'lengua', 'bachillerato', '{1}', 1),
-- 43
('R', 'empieza', 'Coincidencia de sonidos a partir de la ultima vocal acentuada entre dos o mas versos', 'rima', 'lengua', 'bachillerato', '{1}', 1),
-- 44
('R', 'empieza', 'Composicion poetica formada por versos octasilabos con rima asonante en los pares, tipica de la tradicion oral espanola', 'romance', 'lengua', 'bachillerato', '{1}', 1),
-- 45
('S', 'empieza', 'Composicion poetica de catorce versos endecasilabos distribuidos en dos cuartetos y dos tercetos con rima consonante', 'soneto', 'lengua', 'bachillerato', '{1}', 1),
-- 46
('S', 'empieza', 'Figura retorica que designa una parte por el todo o el todo por una parte', 'sinecdoque', 'lengua', 'bachillerato', '{1}', 2),
-- 47
('S', 'empieza', 'Combinacion libre de versos endecasilabos y heptasilabos con rima consonante sin esquema fijo, frecuente en el Barroco', 'silva', 'lengua', 'bachillerato', '{1}', 2),
-- 48
('S', 'empieza', 'Comparacion explicita entre dos elementos usando nexos como como, cual, igual que o semejante a', 'simil', 'lengua', 'bachillerato', '{1}', 1),
-- 49
('T', 'empieza', 'Estrofa de tres versos endecasilabos con rima encadenada ABA BCB CDC, usada por Garcilaso', 'terceto', 'lengua', 'bachillerato', '{1}', 1),
-- 50
('T', 'empieza', 'Genero dramatico del Siglo de Oro codificado por Lope de Vega en su Arte nuevo de hacer comedias', 'teatro', 'lengua', 'bachillerato', '{1}', 1),
-- 51
('U', 'empieza', 'Relacion semantica entre palabras que poseen un significado unico e inequivoco en todo contexto', 'univocidad', 'lengua', 'bachillerato', '{1}', 3),
-- 52
('V', 'empieza', 'Dramaturgo del Siglo de Oro autor de Fuenteovejuna y El caballero de Olmedo, creador de la comedia nueva', 'vega', 'lengua', 'bachillerato', '{1}', 1),
-- 53
('V', 'empieza', 'Cada una de las lineas de un poema, cuya medida se cuenta en silabas metricas', 'verso', 'lengua', 'bachillerato', '{1}', 1),
-- 54
('X', 'contiene', 'Tipo de texto que presenta hechos, conceptos o ideas de forma objetiva para hacerlos comprensibles al receptor', 'expositivo', 'lengua', 'bachillerato', '{1}', 1),
-- 55
('Y', 'contiene', 'Figura retorica que consiste en la repeticion de una conjuncion copulativa para unir elementos, dando solemnidad al discurso', 'polisindeton', 'lengua', 'bachillerato', '{1}', 2),
-- 56
('Z', 'contiene', 'Poeta mistico del siglo XVI autor del Cantico espiritual y Noche oscura del alma, cumbre de la lirica renacentista', 'cruz', 'lengua', 'bachillerato', '{1}', 2),
-- 57
('A', 'empieza', 'Tipo de oracion subordinada que desempena la funcion de un adverbio modificando al verbo principal', 'adverbial', 'lengua', 'bachillerato', '{1}', 2),
-- 58
('B', 'empieza', 'Novela picaresca del siglo XVII escrita por Quevedo que narra la vida del picaro don Pablos', 'buscon', 'lengua', 'bachillerato', '{1}', 1),
-- 59
('C', 'empieza', 'Dramaturgo barroco autor de La vida es sueno y El alcalde de Zalamea, maxima figura del teatro del siglo XVII', 'calderon', 'lengua', 'bachillerato', '{1}', 1),
-- 60
('D', 'empieza', 'Fenomeno linguistico por el cual ciertos elementos del texto remiten al contexto situacional del acto comunicativo', 'deixis', 'lengua', 'bachillerato', '{1}', 3),
-- 61
('E', 'empieza', 'Licencia metrica que consiste en la union en una sola silaba de la vocal final de una palabra con la inicial de la siguiente', 'encabalgamiento', 'lengua', 'bachillerato', '{1}', 2),
-- 62
('F', 'empieza', 'Poeta y prosista renacentista agustino, autor de la Oda a la vida retirada y De los nombres de Cristo', 'fray', 'lengua', 'bachillerato', '{1}', 2),
-- 63
('G', 'empieza', 'Poeta barroco cordobes autor de la Fabula de Polifemo y Galatea y las Soledades, maximo culteranista', 'gongora', 'lengua', 'bachillerato', '{1}', 1),
-- 64
('H', 'empieza', 'Figura retorica que consiste en alterar el orden logico habitual de los elementos de la oracion', 'hiperbaton', 'lengua', 'bachillerato', '{1}', 1),
-- 65
('I', 'empieza', 'Corriente literaria renacentista de origen italiano basada en la imitacion de los modelos clasicos grecolatinos', 'italianismo', 'lengua', 'bachillerato', '{1}', 3),
-- 66
('J', 'contiene', 'Obra picaresca anonima de 1554 cuyo protagonista sirve a un ciego, un clerigo y un escudero, entre otros amos', 'lazarillo', 'lengua', 'bachillerato', '{1}', 1),
-- 67
('L', 'empieza', 'Tipo de texto que presenta argumentos a favor de una tesis con la intencion de convencer al receptor', 'legislativo', 'lengua', 'bachillerato', '{1}', 3),
-- 68
('N', 'empieza', 'Parte de la linguistica que establece las reglas del uso correcto de una lengua en un momento dado', 'norma', 'lengua', 'bachillerato', '{1}', 2),
-- 69
('O', 'empieza', 'Propiedad textual que asegura que las ideas se presentan de modo logico y estructurado en el discurso', 'organizacion', 'lengua', 'bachillerato', '{1}', 2),
-- 70
('P', 'empieza', 'Disciplina linguistica que estudia el uso del lenguaje en contexto y la relacion entre hablante y receptor', 'pragmatica', 'lengua', 'bachillerato', '{1}', 2),
-- 71
('S', 'empieza', 'Parte de la gramatica que estudia el significado de las palabras y sus relaciones semanticas', 'semantica', 'lengua', 'bachillerato', '{1}', 1),
-- 72
('T', 'empieza', 'Clasificacion de los textos segun su intencion comunicativa: narrativo, descriptivo, expositivo, argumentativo y dialogico', 'tipologia', 'lengua', 'bachillerato', '{1}', 2),
-- 73
('V', 'empieza', 'Fenomeno linguistico por el que una palabra puede tener multiples acepciones distintas pero registradas bajo una misma entrada', 'vocablo', 'lengua', 'bachillerato', '{1}', 3),
-- 74
('W', 'contiene', 'Tipo de novela renacentista de aventuras fantasticas protagonizada por caballeros andantes que Cervantes parodio en su obra maestra', 'caballeresca', 'lengua', 'bachillerato', '{1}', 2),
-- 75
('Z', 'contiene', 'Obra maestra de Calderon de la Barca en la que Segismundo reflexiona sobre la realidad, la libertad y los suenos', 'razonamiento', 'lengua', 'bachillerato', '{1}', 2),

-- =============================================================================
-- LENGUA 2o BACHILLERATO (75 preguntas)
-- Temas: Ilustracion, Romanticismo, Realismo, Naturalismo, Gen.98,
--         Gen.27, posguerra, narrativa experimental, poesia contemporanea,
--         teatro siglo XX, comentario de texto, linguistica textual
-- =============================================================================

-- 1
('A', 'empieza', 'Poeta de la Generacion del 27 autor de La destruccion o el amor, premio Nobel de Literatura en 1977', 'aleixandre', 'lengua', 'bachillerato', '{2}', 1),
-- 2
('A', 'empieza', 'Propiedad textual que garantiza que el texto se ajusta a la situacion comunicativa, al registro y a la intencion del emisor', 'adecuacion', 'lengua', 'bachillerato', '{2}', 1),
-- 3
('A', 'empieza', 'Poeta de la Generacion del 27, autor de Marinero en tierra y Sobre los angeles, exiliado tras la Guerra Civil', 'alberti', 'lengua', 'bachillerato', '{2}', 1),
-- 4
('A', 'empieza', 'Seudo nombre del escritor Jose Martinez Ruiz, miembro de la Generacion del 98, autor de La voluntad y Castilla', 'azorin', 'lengua', 'bachillerato', '{2}', 1),
-- 5
('B', 'empieza', 'Poeta romantico sevillano autor de las Rimas y las Leyendas, maximo representante del Romanticismo tardio espanol', 'becquer', 'lengua', 'bachillerato', '{2}', 1),
-- 6
('B', 'empieza', 'Dramaturgo de posguerra autor de Historia de una escalera, El tragaluz y En la ardiente oscuridad', 'buero', 'lengua', 'bachillerato', '{2}', 1),
-- 7
('C', 'empieza', 'Novelista de posguerra autor de La familia de Pascual Duarte y La colmena, premio Nobel en 1989', 'cela', 'lengua', 'bachillerato', '{2}', 1),
-- 8
('C', 'empieza', 'Propiedad textual que garantiza que todas las ideas del texto se relacionan con el tema global de forma logica', 'coherencia', 'lengua', 'bachillerato', '{2}', 1),
-- 9
('C', 'empieza', 'Propiedad textual que se logra mediante mecanismos linguisticos que conectan las oraciones entre si dentro del texto', 'cohesion', 'lengua', 'bachillerato', '{2}', 1),
-- 10
('D', 'empieza', 'Novelista vallisoletano autor de El camino, Los santos inocentes y Cinco horas con Mario', 'delibes', 'lengua', 'bachillerato', '{2}', 1),
-- 11
('D', 'empieza', 'Poeta hispanoamericano autor de Azul y Prosas profanas, lider del movimiento que renovo la lirica en espanol a fines del XIX', 'dario', 'lengua', 'bachillerato', '{2}', 2),
-- 12
('E', 'empieza', 'Subgenero teatral creado por Valle-Inclan que deforma sistematicamente la realidad mediante una estetica degradante y grotesca', 'esperpento', 'lengua', 'bachillerato', '{2}', 1),
-- 13
('E', 'empieza', 'Poeta romantico autor de El estudiante de Salamanca y la Cancion del pirata, representante del Romanticismo exaltado', 'espronceda', 'lengua', 'bachillerato', '{2}', 1),
-- 14
('E', 'empieza', 'Corriente narrativa del siglo XX que rompe con la linealidad, usa el monologo interior y experimenta con la estructura', 'experimental', 'lengua', 'bachillerato', '{2}', 2),
-- 15
('F', 'empieza', 'Poeta y dramaturgo de la Generacion del 27, autor del Romancero gitano y La casa de Bernarda Alba, asesinado en 1936', 'federico', 'lengua', 'bachillerato', '{2}', 1),
-- 16
('F', 'empieza', 'Ensayista ilustrado espanol del siglo XVIII autor del Teatro critico universal y las Cartas eruditas y curiosas', 'feijoo', 'lengua', 'bachillerato', '{2}', 2),
-- 17
('G', 'empieza', 'Grupo de escritores espanoles nacidos en torno a 1870 que reflexionaron sobre Espana tras el desastre colonial de 1898', 'generacion', 'lengua', 'bachillerato', '{2}', 1),
-- 18
('G', 'empieza', 'Novelista realista canario autor de los Episodios Nacionales y Fortunata y Jacinta, cumbre del Realismo espanol', 'galdos', 'lengua', 'bachillerato', '{2}', 1),
-- 19
('G', 'empieza', 'Poeta de la Generacion del 27 autor de Cantico, representante de la poesia pura y la afirmacion vital', 'guillen', 'lengua', 'bachillerato', '{2}', 2),
-- 20
('H', 'empieza', 'Poeta vinculado a la Generacion del 27, autor de Perito en lunas y El rayo que no cesa, fallecido en prision en 1942', 'hernandez', 'lengua', 'bachillerato', '{2}', 1),
-- 21
('I', 'empieza', 'Movimiento cultural del siglo XVIII basado en la razon, la ciencia y el progreso, llamado tambien Siglo de las Luces', 'ilustracion', 'lengua', 'bachillerato', '{2}', 1),
-- 22
('J', 'empieza', 'Poeta moguereano autor de Platero y yo y Diario de un poeta recien casado, premio Nobel en 1956', 'juanramon', 'lengua', 'bachillerato', '{2}', 1),
-- 23
('K', 'contiene', 'Novelista autor de Tiempo de silencio, obra clave de la narrativa experimental espanola de los anos sesenta', 'martindesantos', 'lengua', 'bachillerato', '{2}', 3),
-- 24
('L', 'empieza', 'Autor romantico de articulos costumbristas y satiricos firmados con el seudonimo Figaro, figura clave del periodismo espanol', 'larra', 'lengua', 'bachillerato', '{2}', 1),
-- 25
('L', 'empieza', 'Poeta granadino de la Generacion del 27 autor de Poeta en Nueva York y Yerma', 'lorca', 'lengua', 'bachillerato', '{2}', 1),
-- 26
('M', 'empieza', 'Poeta sevillano de la Generacion del 98 autor de Campos de Castilla y Soledades, galerias y otros poemas', 'machado', 'lengua', 'bachillerato', '{2}', 1),
-- 27
('M', 'empieza', 'Corriente literaria hispanoamericana de finales del XIX que renovo la estetica poetica en espanol con musicalidad y exotismo', 'modernismo', 'lengua', 'bachillerato', '{2}', 1),
-- 28
('M', 'empieza', 'Tecnica narrativa del siglo XX que reproduce el fluir desordenado del pensamiento de un personaje sin intervencion del narrador', 'monologo', 'lengua', 'bachillerato', '{2}', 2),
-- 29
('N', 'empieza', 'Corriente literaria derivada del Realismo que aplica el metodo cientifico al estudio de la conducta humana, influida por Zola', 'naturalismo', 'lengua', 'bachillerato', '{2}', 1),
-- 30
('Ñ', 'contiene', 'Tecnica narrativa de posguerra en la que el narrador se limita a registrar acciones y dialogos como una camara objetiva', 'banobjetivist', 'lengua', 'bachillerato', '{2}', 3),
-- 31
('O', 'empieza', 'Tecnica narrativa en la que el narrador no interviene y se limita a registrar lo que dicen y hacen los personajes', 'objetivismo', 'lengua', 'bachillerato', '{2}', 2),
-- 32
('O', 'empieza', 'Pensador espanol autor de La rebelion de las masas y Meditaciones del Quijote, influyente en el ensayo del siglo XX', 'ortega', 'lengua', 'bachillerato', '{2}', 2),
-- 33
('P', 'empieza', 'Novelista gallega autora de Los pazos de Ulloa, introductora del Naturalismo en Espana', 'pardo', 'lengua', 'bachillerato', '{2}', 1),
-- 34
('P', 'empieza', 'Tipo de narrador que conoce los pensamientos y sentimientos de todos los personajes, propio de la novela realista del XIX', 'perspectiva', 'lengua', 'bachillerato', '{2}', 2),
-- 35
('P', 'empieza', 'Poeta de la Generacion del 27 autor de La voz a ti debida y Razon de amor, representante de la poesia amorosa pura', 'pedro', 'lengua', 'bachillerato', '{2}', 2),
-- 36
('Q', 'contiene', 'Recurso de cohesion textual que sustituye un elemento por otro equivalente para evitar la repeticion en el discurso', 'anaforicotext', 'lengua', 'bachillerato', '{2}', 3),
-- 37
('R', 'empieza', 'Movimiento literario del siglo XIX que busca representar la realidad social de forma objetiva y detallada', 'realismo', 'lengua', 'bachillerato', '{2}', 1),
-- 38
('R', 'empieza', 'Movimiento literario de la primera mitad del siglo XIX que exalta la libertad, el sentimiento y la subjetividad', 'romanticismo', 'lengua', 'bachillerato', '{2}', 1),
-- 39
('R', 'empieza', 'Novela naturalista de Leopoldo Alas Clarin ambientada en Vetusta que retrata la hipocresia provincial', 'regenta', 'lengua', 'bachillerato', '{2}', 1),
-- 40
('S', 'empieza', 'Novelista autor de El Jarama, obra cumbre del realismo social espanol de los anos cincuenta', 'sanchez', 'lengua', 'bachillerato', '{2}', 2),
-- 41
('S', 'empieza', 'Movimiento poetico de vanguardia que explora el subconsciente, los suenos y la escritura automatica', 'surrealismo', 'lengua', 'bachillerato', '{2}', 1),
-- 42
('S', 'empieza', 'Poeta de la Generacion del 27 autor de La realidad y el deseo y Los placeres prohibidos, exiliado en Mexico', 'salinas', 'lengua', 'bachillerato', '{2}', 2),
-- 43
('T', 'empieza', 'Corriente de la novela de posguerra caracterizada por la violencia y la crudeza, inaugurada con La familia de Pascual Duarte', 'tremendismo', 'lengua', 'bachillerato', '{2}', 1),
-- 44
('T', 'empieza', 'Tipo de texto que presenta razones a favor o en contra de una tesis con el fin de convencer al receptor', 'tesis', 'lengua', 'bachillerato', '{2}', 2),
-- 45
('U', 'empieza', 'Escritor de la Generacion del 98 autor de Niebla, San Manuel Bueno y Del sentimiento tragico de la vida', 'unamuno', 'lengua', 'bachillerato', '{2}', 1),
-- 46
('V', 'empieza', 'Dramaturgo gallego de la Generacion del 98 autor de Luces de bohemia y las Comedias barbaras', 'valleinclan', 'lengua', 'bachillerato', '{2}', 1),
-- 47
('V', 'empieza', 'Corrientes artisticas de principios del siglo XX que rompen con la tradicion: futurismo, dadaismo, surrealismo, ultraismo', 'vanguardias', 'lengua', 'bachillerato', '{2}', 1),
-- 48
('W', 'contiene', 'Autor romantico del Duque de Rivas cuyo drama Don Alvaro o la fuerza del sino es emblema del teatro romantico espanol', 'rivas', 'lengua', 'bachillerato', '{2}', 2),
-- 49
('X', 'contiene', 'Propiedad de los textos que permite analizarlos como unidades comunicativas completas con sentido global', 'texto', 'lengua', 'bachillerato', '{2}', 1),
-- 50
('Y', 'contiene', 'Autor teatral de posguerra creador de Tres sombreros de copa y Maribel y la extrana familia', 'mihura', 'lengua', 'bachillerato', '{2}', 2),
-- 51
('Z', 'contiene', 'Periodista romantico que escribio articulos satiricos sobre la sociedad espanola con el seudonimo Figaro', 'larra', 'lengua', 'bachillerato', '{2}', 2),
-- 52
('A', 'empieza', 'Tipo de comentario academico que analiza la organizacion, los recursos linguisticos y la intencion comunicativa de un escrito', 'analisis', 'lengua', 'bachillerato', '{2}', 2),
-- 53
('B', 'empieza', 'Escritor de la Generacion del 98 autor de El arbol de la ciencia y la trilogia La lucha por la vida', 'baroja', 'lengua', 'bachillerato', '{2}', 1),
-- 54
('C', 'empieza', 'Novela de Cela de 1951 que retrata la vida cotidiana del Madrid de posguerra a traves de multiples personajes', 'colmena', 'lengua', 'bachillerato', '{2}', 1),
-- 55
('D', 'empieza', 'Mecanismo de cohesion textual por el cual un elemento linguistico remite a otro anterior en el discurso', 'deixis', 'lengua', 'bachillerato', '{2}', 3),
-- 56
('E', 'empieza', 'Genero periodistico de opinion en el que el autor expone su valoracion personal sobre un tema de actualidad', 'editorial', 'lengua', 'bachillerato', '{2}', 2),
-- 57
('F', 'empieza', 'Funcion del lenguaje centrada en la forma del mensaje, predominante en los textos literarios segun Jakobson', 'funcion', 'lengua', 'bachillerato', '{2}', 2),
-- 58
('G', 'empieza', 'Grupo de poetas que tomaron su nombre del homenaje a Gongora en 1927 en Sevilla: Lorca, Alberti, Cernuda, Guillen, Salinas y otros', 'generacion27', 'lengua', 'bachillerato', '{2}', 1),
-- 59
('H', 'empieza', 'Movimiento poetico de fin del XIX y principios del XX que busca la renovacion formal y tematica del verso en castellano', 'hispanismo', 'lengua', 'bachillerato', '{2}', 3),
-- 60
('I', 'empieza', 'Movimiento teatral del siglo XX en Espana que incorpora elementos absurdos, simbolicos y experimentales alejados del realismo', 'innovacion', 'lengua', 'bachillerato', '{2}', 3),
-- 61
('J', 'contiene', 'Novela social de los anos cincuenta de Sanchez Ferlosio que transcurre junto al rio Henares en una sola jornada', 'jarama', 'lengua', 'bachillerato', '{2}', 1),
-- 62
('L', 'empieza', 'Disciplina que estudia el texto como unidad comunicativa, analizando su estructura, coherencia y cohesion', 'linguistica', 'lengua', 'bachillerato', '{2}', 2),
-- 63
('M', 'empieza', 'Dramaturgo de posguerra autor de Tres sombreros de copa, representante del teatro comico y del humor absurdo', 'mihura', 'lengua', 'bachillerato', '{2}', 2),
-- 64
('N', 'empieza', 'Tipo de novela espanola de los anos cincuenta comprometida con la denuncia de las desigualdades sociales', 'neorrealismo', 'lengua', 'bachillerato', '{2}', 2),
-- 65
('O', 'empieza', 'Mecanismo de cohesion textual que ordena las ideas mediante conectores logicos y marcadores del discurso', 'organizador', 'lengua', 'bachillerato', '{2}', 2),
-- 66
('P', 'empieza', 'Genero literario cultivado en el siglo XVIII con finalidad didactica y moralizante, propio de la Ilustracion espanola', 'prosa', 'lengua', 'bachillerato', '{2}', 2),
-- 67
('R', 'empieza', 'Tipo de registro linguistico empleado en situaciones formales, propio de textos academicos y cientificos', 'registro', 'lengua', 'bachillerato', '{2}', 2),
-- 68
('S', 'empieza', 'Autor de La Regenta, novelista asturiano del Realismo cuyo verdadero nombre era Leopoldo Alas', 'sobrenombre', 'lengua', 'bachillerato', '{2}', 3),
-- 69
('T', 'empieza', 'Tecnica narrativa que alterna diferentes planos temporales rompiendo la cronologia lineal del relato', 'temporal', 'lengua', 'bachillerato', '{2}', 2),
-- 70
('U', 'contiene', 'Genero periodistico breve de opinion en el que un autor habitual del medio expresa su punto de vista sobre la actualidad', 'columna', 'lengua', 'bachillerato', '{2}', 2),
-- 71
('V', 'empieza', 'Corriente de vanguardia espanola que busca reducir la poesia a la imagen y la metafora pura, eliminando la anecdota', 'vanguardia', 'lengua', 'bachillerato', '{2}', 2),
-- 72
('W', 'contiene', 'Escritor irlandes cuya novela Ulises influyo en la narrativa experimental espanola de los anos sesenta', 'joyce', 'lengua', 'bachillerato', '{2}', 3),
-- 73
('X', 'contiene', 'Tipo de escrito periodistico que ofrece una exposicion detallada y documentada sobre un tema de interes publico', 'reportaje', 'lengua', 'bachillerato', '{2}', 2),
-- 74
('Y', 'contiene', 'Ensayo de Ortega y Gasset de 1925 que analiza el arte nuevo como un proceso de deshumanizacion y formalismo', 'ensayo', 'lengua', 'bachillerato', '{2}', 2),
-- 75
('Z', 'contiene', 'Novelista gallego autor de la serie Los gozos y las sombras, representante de la narrativa de posguerra', 'torrente', 'lengua', 'bachillerato', '{2}', 2),

-- =============================================================================
-- FILOSOFIA 1o BACHILLERATO (75 preguntas)
-- Temas: presocraticos, sofistas, Socrates, Platon, Aristoteles,
--         helenismo, filosofia medieval, racionalismo, empirismo,
--         Kant, etica, politica, estetica, logica formal, argumentacion
-- =============================================================================

-- 1
('A', 'empieza', 'Filosofo griego discipulo de Platon, autor de la Etica a Nicomaco y la Politica, sistematizador de la logica formal', 'aristoteles', 'filosofia', 'bachillerato', '{1}', 1),
-- 2
('A', 'empieza', 'Disciplina filosofica que estudia la naturaleza de lo bello, el arte y la experiencia estetica', 'estetica', 'filosofia', 'bachillerato', '{1}', 2),
-- 3
('A', 'empieza', 'Razonamiento que establece una relacion de semejanza entre dos casos para inferir una conclusion probable', 'analogia', 'filosofia', 'bachillerato', '{1}', 2),
-- 4
('B', 'empieza', 'Filosofo empirista irlandes del siglo XVIII que nego la existencia de la materia y afirmo que ser es ser percibido', 'berkeley', 'filosofia', 'bachillerato', '{1}', 2),
-- 5
('B', 'empieza', 'Concepto aristotelico que designa la busqueda del supremo fin de la accion humana, identificado con la felicidad', 'bien', 'filosofia', 'bachillerato', '{1}', 1),
-- 6
('C', 'empieza', 'Actitud filosofica helenistica de rechazo a las convenciones sociales, representada por Diogenes de Sinope', 'cinismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 7
('C', 'empieza', 'Concepto kantiano que designa las formas a priori del entendimiento que organizan la experiencia, como sustancia o causalidad', 'categoria', 'filosofia', 'bachillerato', '{1}', 2),
-- 8
('D', 'empieza', 'Filosofo racionalista frances del siglo XVII autor del Discurso del metodo y las Meditaciones metafisicas', 'descartes', 'filosofia', 'bachillerato', '{1}', 1),
-- 9
('D', 'empieza', 'Metodo filosofico basado en el dialogo y la confrontacion de ideas opuestas para alcanzar la verdad', 'dialectica', 'filosofia', 'bachillerato', '{1}', 1),
-- 10
('D', 'empieza', 'Posicion filosofica que defiende que la realidad se compone de dos sustancias irreductibles, como mente y materia', 'dualismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 11
('D', 'empieza', 'Razonamiento logico que parte de principios generales para llegar a conclusiones particulares necesarias', 'deduccion', 'filosofia', 'bachillerato', '{1}', 1),
-- 12
('E', 'empieza', 'Corriente filosofica moderna que sostiene que todo conocimiento procede de la experiencia sensible', 'empirismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 13
('E', 'empieza', 'Corriente filosofica helenistica fundada por Epicuro que identifica el bien con el placer moderado y la ataraxia', 'epicureismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 14
('E', 'empieza', 'Disciplina filosofica que estudia los principios morales que rigen la conducta humana y la distincion entre el bien y el mal', 'etica', 'filosofia', 'bachillerato', '{1}', 1),
-- 15
('E', 'empieza', 'Teoria del conocimiento que estudia la naturaleza, el origen y los limites del saber humano', 'epistemologia', 'filosofia', 'bachillerato', '{1}', 1),
-- 16
('F', 'empieza', 'Error en el razonamiento que invalida un argumento a pesar de su apariencia logica de validez', 'falacia', 'filosofia', 'bachillerato', '{1}', 1),
-- 17
('F', 'empieza', 'Concepto aristotelico que designa la causa final de los seres naturales, su tendencia hacia un proposito', 'finalismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 18
('G', 'empieza', 'Corriente religiosa y filosofica de los primeros siglos que buscaba la salvacion mediante un conocimiento secreto y revelado', 'gnosis', 'filosofia', 'bachillerato', '{1}', 3),
-- 19
('H', 'empieza', 'Filosofo presocratico de Efeso que afirmo que todo fluye, que la guerra es padre de todas las cosas y que el logos rige el cosmos', 'heraclito', 'filosofia', 'bachillerato', '{1}', 1),
-- 20
('H', 'empieza', 'Periodo de la filosofia griega que abarca desde la muerte de Alejandro Magno hasta el inicio del dominio romano', 'helenismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 21
('H', 'empieza', 'Filosofo empirista escoces que cuestiono la causalidad y afirmo que el conocimiento se basa en impresiones e ideas', 'hume', 'filosofia', 'bachillerato', '{1}', 1),
-- 22
('H', 'empieza', 'Posicion etica que define el placer como el bien supremo y fin ultimo de la vida humana', 'hedonismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 23
('I', 'empieza', 'Teoria del conocimiento que defiende que ciertas ideas son innatas y no proceden de la experiencia', 'innatismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 24
('I', 'empieza', 'Razonamiento logico que parte de casos particulares observados para establecer una conclusion general probable', 'induccion', 'filosofia', 'bachillerato', '{1}', 1),
-- 25
('I', 'empieza', 'Principio moral kantiano que ordena actuar de forma incondicional, sin depender de fines o deseos particulares', 'imperativo', 'filosofia', 'bachillerato', '{1}', 1),
-- 26
('J', 'empieza', 'Concepto central de la filosofia politica que designa la virtud de dar a cada uno lo que le corresponde', 'justicia', 'filosofia', 'bachillerato', '{1}', 1),
-- 27
('K', 'empieza', 'Filosofo aleman del siglo XVIII autor de la Critica de la razon pura que sintetizo racionalismo y empirismo', 'kant', 'filosofia', 'bachillerato', '{1}', 1),
-- 28
('L', 'empieza', 'Filosofo empirista ingles autor del Ensayo sobre el entendimiento humano y defensor del liberalismo politico', 'locke', 'filosofia', 'bachillerato', '{1}', 1),
-- 29
('L', 'empieza', 'Disciplina filosofica que estudia las formas validas de razonamiento y la estructura de los argumentos', 'logica', 'filosofia', 'bachillerato', '{1}', 1),
-- 30
('L', 'empieza', 'Filosofo racionalista aleman creador de la monadologia y del calculo infinitesimal junto con Newton', 'leibniz', 'filosofia', 'bachillerato', '{1}', 2),
-- 31
('M', 'empieza', 'Metodo socratico que consiste en ayudar al interlocutor a alumbrar la verdad por si mismo mediante preguntas sucesivas', 'mayeutica', 'filosofia', 'bachillerato', '{1}', 1),
-- 32
('M', 'empieza', 'Rama de la filosofia que estudia la naturaleza ultima de la realidad, el ser y los primeros principios', 'metafisica', 'filosofia', 'bachillerato', '{1}', 1),
-- 33
('M', 'empieza', 'Doctrina filosofica que defiende la existencia de un solo tipo de sustancia o realidad fundamental', 'monismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 34
('N', 'empieza', 'Concepto kantiano que designa la realidad en si misma, inaccesible al conocimiento humano, opuesto al fenomeno', 'noumeno', 'filosofia', 'bachillerato', '{1}', 2),
-- 35
('Ñ', 'contiene', 'Corriente filosofica helenistica que ensenaba a vivir conforme a la naturaleza y la razon, aceptando el destino con fortaleza', 'estoicismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 36
('O', 'empieza', 'Rama de la filosofia que estudia el ser en cuanto ser, es decir, las categorias fundamentales de la existencia', 'ontologia', 'filosofia', 'bachillerato', '{1}', 2),
-- 37
('P', 'empieza', 'Filosofo griego fundador de la Academia, autor de La Republica y el Banquete, creador de la teoria de las Ideas', 'platon', 'filosofia', 'bachillerato', '{1}', 1),
-- 38
('P', 'empieza', 'Filosofo presocratico que afirmo que la realidad es una, inmovil y eterna, negando la existencia del cambio y el movimiento', 'parmenides', 'filosofia', 'bachillerato', '{1}', 1),
-- 39
('P', 'empieza', 'Doctrina que defiende la existencia de varios principios o realidades fundamentales irreductibles entre si', 'pluralismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 40
('Q', 'contiene', 'Argumento tomista que demuestra la existencia de Dios mediante cinco vias racionales basadas en la experiencia del mundo', 'aquino', 'filosofia', 'bachillerato', '{1}', 2),
-- 41
('R', 'empieza', 'Corriente filosofica moderna que afirma que la razon es la fuente principal del conocimiento, por encima de la experiencia', 'racionalismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 42
('R', 'empieza', 'Concepto platonico que designa el recuerdo del conocimiento que el alma adquirio antes de encarnarse en un cuerpo', 'reminiscencia', 'filosofia', 'bachillerato', '{1}', 2),
-- 43
('R', 'empieza', 'Corriente etica que sostiene que los valores morales dependen del contexto cultural y no son universales ni absolutos', 'relativismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 44
('S', 'empieza', 'Filosofo ateniense condenado a muerte, maestro de Platon, que afirmaba que solo sabia que no sabia nada', 'socrates', 'filosofia', 'bachillerato', '{1}', 1),
-- 45
('S', 'empieza', 'Forma de razonamiento deductivo compuesto por dos premisas y una conclusion, formalizado por Aristoteles', 'silogismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 46
('S', 'empieza', 'Maestros itinerantes de la Grecia clasica que ensenaban retorica a cambio de dinero y relativizaban la verdad', 'sofistas', 'filosofia', 'bachillerato', '{1}', 1),
-- 47
('S', 'empieza', 'Racionalista holandes del XVII autor de la Etica demostrada segun el orden geometrico, defensor del panteismo', 'spinoza', 'filosofia', 'bachillerato', '{1}', 2),
-- 48
('T', 'empieza', 'Filosofo medieval del siglo XIII autor de la Suma Teologica que armonizo la fe cristiana con la filosofia aristotelica', 'tomas', 'filosofia', 'bachillerato', '{1}', 1),
-- 49
('T', 'empieza', 'Presocratico de Mileto considerado el primer filosofo occidental, que propuso el agua como principio originario de todo', 'tales', 'filosofia', 'bachillerato', '{1}', 1),
-- 50
('T', 'empieza', 'Concepto kantiano que designa aquello que es condicion de posibilidad de la experiencia, previo a ella', 'trascendental', 'filosofia', 'bachillerato', '{1}', 2),
-- 51
('U', 'empieza', 'Teoria etica moderna que juzga la bondad de una accion por la cantidad de felicidad que produce para el mayor numero', 'utilitarismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 52
('U', 'empieza', 'Concepto aristotelico referido a lo que se predica de todos los individuos de una clase o especie sin excepcion', 'universal', 'filosofia', 'bachillerato', '{1}', 2),
-- 53
('V', 'empieza', 'Propiedad de un argumento logico cuya conclusion se sigue necesariamente de sus premisas', 'validez', 'filosofia', 'bachillerato', '{1}', 1),
-- 54
('V', 'empieza', 'Disposicion habitual y firme a obrar bien, concepto central de la etica aristotelica de las virtudes', 'virtud', 'filosofia', 'bachillerato', '{1}', 1),
-- 55
('X', 'contiene', 'Doctrina de Parmenides que afirma que solo lo que es puede pensarse, y que el no-ser es impensable e inexistente', 'existir', 'filosofia', 'bachillerato', '{1}', 2),
-- 56
('Y', 'contiene', 'Concepto aristotelico que designa la teoria de la materia y la forma como principios constitutivos de toda sustancia natural', 'hilemorfismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 57
('Z', 'contiene', 'Metodo cartesiano de investigacion que comienza poniendo sistematicamente en duda todos los conocimientos previos', 'razon', 'filosofia', 'bachillerato', '{1}', 2),
-- 58
('A', 'empieza', 'Concepto aristotelico que designa la realizacion plena de las potencialidades de un ser, opuesto a la potencia', 'acto', 'filosofia', 'bachillerato', '{1}', 1),
-- 59
('B', 'empieza', 'Concepto kantiano que designa la intencion de actuar por deber y no por inclinacion, fundamento de la moralidad', 'buenavoluntad', 'filosofia', 'bachillerato', '{1}', 2),
-- 60
('C', 'empieza', 'Tipo de conocimiento que en Descartes se caracteriza por ser claro y distinto, libre de toda duda posible', 'certeza', 'filosofia', 'bachillerato', '{1}', 2),
-- 61
('D', 'empieza', 'Presocratico que junto con Leucipo formulo la teoria de que la realidad se compone de particulas indivisibles en el vacio', 'democrito', 'filosofia', 'bachillerato', '{1}', 1),
-- 62
('E', 'empieza', 'Presocratico siciliano que propuso los cuatro elementos como raices de toda la realidad: tierra, agua, aire y fuego', 'empedocles', 'filosofia', 'bachillerato', '{1}', 2),
-- 63
('F', 'empieza', 'Disciplina que estudia la naturaleza, los metodos y los limites del conocimiento humano en general', 'filosofia', 'filosofia', 'bachillerato', '{1}', 1),
-- 64
('G', 'empieza', 'Rama de la filosofia que se ocupa de la teoria del conocimiento, sus condiciones y posibilidades', 'gnoseologia', 'filosofia', 'bachillerato', '{1}', 3),
-- 65
('I', 'contiene', 'Filosofo griego presocratico que propuso el aire como principio originario y sustancia fundamental de toda la realidad', 'anaximenes', 'filosofia', 'bachillerato', '{1}', 2),
-- 66
('J', 'contiene', 'Sofista griego que declaro que el hombre es la medida de todas las cosas, relativizando verdad y valores morales', 'protagoras', 'filosofia', 'bachillerato', '{1}', 2),
-- 67
('K', 'contiene', 'Posicion filosofica que suspende el juicio sobre la posibilidad de alcanzar un conocimiento verdadero y seguro', 'escepticismo', 'filosofia', 'bachillerato', '{1}', 1),
-- 68
('L', 'empieza', 'Concepto kantiano referido a la norma moral que el sujeto se da a si mismo mediante la razon, base de la autonomia', 'ley', 'filosofia', 'bachillerato', '{1}', 2),
-- 69
('M', 'empieza', 'Concepto platonico de la alegoria de la caverna: los prisioneros confunden las proyecciones con la verdadera realidad', 'mito', 'filosofia', 'bachillerato', '{1}', 2),
-- 70
('N', 'empieza', 'Doctrina medieval que sostiene que los conceptos universales son meros nombres sin realidad propia fuera de la mente', 'nominalismo', 'filosofia', 'bachillerato', '{1}', 2),
-- 71
('O', 'empieza', 'Principio logico-metafisico que afirma la imposibilidad de que un enunciado sea verdadero y falso al mismo tiempo', 'oposicion', 'filosofia', 'bachillerato', '{1}', 3),
-- 72
('P', 'empieza', 'Concepto aristotelico que designa la capacidad de un ser para llegar a ser algo que aun no es', 'potencia', 'filosofia', 'bachillerato', '{1}', 1),
-- 73
('R', 'empieza', 'Arte de persuadir mediante el discurso, ensenada por los sofistas y sistematizada como disciplina por Aristoteles', 'retorica', 'filosofia', 'bachillerato', '{1}', 2),
-- 74
('S', 'empieza', 'Concepto platonico referido al conocimiento mas alto: la contemplacion directa de las Ideas eternas por el alma', 'sabiduria', 'filosofia', 'bachillerato', '{1}', 2),
-- 75
('V', 'contiene', 'Presocratico de Mileto que propuso lo indefinido o ilimitado como principio originario de todas las cosas', 'anaximandro', 'filosofia', 'bachillerato', '{1}', 2),

-- =============================================================================
-- FILOSOFIA 2o BACHILLERATO (75 preguntas)
-- Temas: Platon en profundidad, Aristoteles, Tomas de Aquino, Descartes,
--         Hume, Kant, Marx, Nietzsche, Ortega, Habermas, Rawls,
--         existencialismo
-- =============================================================================

-- 1
('A', 'empieza', 'Concepto platonico que designa el proceso de ascenso del alma desde las sombras hasta la contemplacion de la Idea del Bien', 'alegoria', 'filosofia', 'bachillerato', '{2}', 1),
-- 2
('A', 'empieza', 'Concepto aristotelico que designa la realizacion plena de las potencialidades de un ser, opuesto a la potencia', 'acto', 'filosofia', 'bachillerato', '{2}', 1),
-- 3
('A', 'empieza', 'Concepto humeano que designa la conexion de ideas por semejanza, contiguidad y causa-efecto como base del pensamiento', 'asociacion', 'filosofia', 'bachillerato', '{2}', 2),
-- 4
('B', 'empieza', 'Concepto marxista que designa la estructura economica de la sociedad: fuerzas productivas y relaciones de produccion', 'base', 'filosofia', 'bachillerato', '{2}', 2),
-- 5
('B', 'empieza', 'Clase social propietaria de los medios de produccion en el sistema capitalista segun el analisis marxista', 'burguesia', 'filosofia', 'bachillerato', '{2}', 1),
-- 6
('C', 'empieza', 'Primera verdad indubitable cartesiana que se formula como pienso luego existo, base de todo el sistema racionalista', 'cogito', 'filosofia', 'bachillerato', '{2}', 1),
-- 7
('C', 'empieza', 'Tipo de imperativo kantiano que ordena de forma incondicional, sin depender de ningun fin o deseo particular', 'categorico', 'filosofia', 'bachillerato', '{2}', 1),
-- 8
('C', 'empieza', 'Concepto orteguiano que designa todo lo que rodea al individuo y condiciona su vida: su mundo historico, social y personal', 'circunstancia', 'filosofia', 'bachillerato', '{2}', 1),
-- 9
('C', 'empieza', 'Concepto aristotelico referido a las cuatro explicaciones de por que algo es como es: material, formal, eficiente y final', 'causalidad', 'filosofia', 'bachillerato', '{2}', 2),
-- 10
('D', 'empieza', 'Metodo cartesiano que consiste en poner en cuestion todo conocimiento hasta hallar una verdad absolutamente cierta', 'duda', 'filosofia', 'bachillerato', '{2}', 1),
-- 11
('D', 'empieza', 'Concepto nietzscheano referido a la dimension racional, ordenada y armoniosa de la cultura griega, opuesto a lo dionisiaco', 'dicotomia', 'filosofia', 'bachillerato', '{2}', 3),
-- 12
('E', 'empieza', 'Corriente filosofica del siglo XX que afirma que la existencia precede a la esencia y el ser humano se construye a si mismo', 'existencialismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 13
('E', 'empieza', 'Concepto nietzscheano que designa la vuelta ciclica e infinita de todos los acontecimientos del universo', 'eterno', 'filosofia', 'bachillerato', '{2}', 2),
-- 14
('E', 'empieza', 'Concepto aristotelico que designa la forma sustancial, la naturaleza permanente que define lo que un ser es', 'esencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 15
('E', 'empieza', 'Concepto marxista que designa la separacion del trabajador respecto del producto de su trabajo, de si mismo y de los otros', 'enajenacion', 'filosofia', 'bachillerato', '{2}', 1),
-- 16
('F', 'empieza', 'Concepto kantiano que designa lo que se presenta a la conciencia, mediado por las formas a priori de la sensibilidad y el entendimiento', 'fenomeno', 'filosofia', 'bachillerato', '{2}', 2),
-- 17
('F', 'empieza', 'Concepto aristotelico que designa el principio determinante que da estructura y esencia a la materia', 'forma', 'filosofia', 'bachillerato', '{2}', 1),
-- 18
('F', 'empieza', 'Concepto aristotelico de la felicidad entendida como actividad del alma conforme a la virtud mas perfecta', 'felicidad', 'filosofia', 'bachillerato', '{2}', 1),
-- 19
('G', 'empieza', 'Metodo nietzscheano que investiga el origen historico y psicologico de los valores morales para revelar su funcion de poder', 'genealogia', 'filosofia', 'bachillerato', '{2}', 2),
-- 20
('H', 'empieza', 'Filosofo aleman contemporaneo autor de la Teoria de la accion comunicativa y la etica del discurso', 'habermas', 'filosofia', 'bachillerato', '{2}', 1),
-- 21
('H', 'empieza', 'Concepto humeano que designa la costumbre o la repeticion como base de nuestra creencia en la conexion causal', 'habito', 'filosofia', 'bachillerato', '{2}', 2),
-- 22
('H', 'empieza', 'Teoria aristotelica que explica toda sustancia natural como compuesto inseparable de materia y forma', 'hilemorfismo', 'filosofia', 'bachillerato', '{2}', 2),
-- 23
('I', 'empieza', 'Concepto platonico que designa las realidades eternas, inmutables y perfectas del mundo inteligible', 'idea', 'filosofia', 'bachillerato', '{2}', 1),
-- 24
('I', 'empieza', 'Principio kantiano que ordena actuar segun una maxima universalizable, sin depender de fines particulares', 'imperativo', 'filosofia', 'bachillerato', '{2}', 1),
-- 25
('I', 'empieza', 'Concepto marxista que designa el conjunto de representaciones y valores que la clase dominante impone para legitimar el orden social', 'ideologia', 'filosofia', 'bachillerato', '{2}', 1),
-- 26
('I', 'empieza', 'Concepto humeano que designa las percepciones directas y vividas que recibimos a traves de los sentidos', 'impresion', 'filosofia', 'bachillerato', '{2}', 1),
-- 27
('J', 'empieza', 'Concepto central de la teoria de Rawls que establece los principios de organizacion social tras el velo de la ignorancia', 'justicia', 'filosofia', 'bachillerato', '{2}', 1),
-- 28
('J', 'empieza', 'Enunciado que en Kant conecta un sujeto con un predicado, pudiendo ser analitico, sintetico a posteriori o sintetico a priori', 'juicio', 'filosofia', 'bachillerato', '{2}', 2),
-- 29
('K', 'empieza', 'Filosofo de Konigsberg que distinguio entre fenomeno y noumeno y establecio los limites del conocimiento humano', 'kant', 'filosofia', 'bachillerato', '{2}', 1),
-- 30
('L', 'empieza', 'Concepto marxista que describe el enfrentamiento entre clases sociales como motor fundamental de la historia', 'lucha', 'filosofia', 'bachillerato', '{2}', 1),
-- 31
('L', 'empieza', 'Concepto habermasiano referido al uso del lenguaje orientado al entendimiento mutuo y libre de coaccion', 'lenguaje', 'filosofia', 'bachillerato', '{2}', 2),
-- 32
('M', 'empieza', 'Filosofo aleman del siglo XIX autor de El Capital y del Manifiesto Comunista, creador del materialismo historico', 'marx', 'filosofia', 'bachillerato', '{2}', 1),
-- 33
('M', 'empieza', 'Concepto marxista que interpreta la historia a partir de las condiciones materiales y economicas de produccion', 'materialismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 34
('M', 'empieza', 'Concepto platonico de la participacion o imitacion por la cual las cosas sensibles reflejan las Ideas del mundo inteligible', 'mimesis', 'filosofia', 'bachillerato', '{2}', 2),
-- 35
('M', 'empieza', 'Concepto nietzscheano que designa los valores de los debiles basados en el resentimiento contra los fuertes y nobles', 'moral', 'filosofia', 'bachillerato', '{2}', 2),
-- 36
('N', 'empieza', 'Filosofo aleman del siglo XIX autor de Asi hablo Zaratustra y La genealogia de la moral', 'nietzsche', 'filosofia', 'bachillerato', '{2}', 1),
-- 37
('N', 'empieza', 'Concepto nietzscheano que designa la perdida de todos los valores y sentidos absolutos en la cultura occidental', 'nihilismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 38
('N', 'empieza', 'Concepto kantiano que designa la realidad en si misma, independiente de nuestra percepcion, inaccesible al conocimiento', 'noumeno', 'filosofia', 'bachillerato', '{2}', 2),
-- 39
('Ñ', 'contiene', 'Concepto tomista que designa la ley moral grabada en la naturaleza humana por Dios, accesible a la razon natural', 'ensenanza', 'filosofia', 'bachillerato', '{2}', 2),
-- 40
('O', 'empieza', 'Filosofo espanol del siglo XX autor de La rebelion de las masas y defensor del raciovitalismo y el perspectivismo', 'ortega', 'filosofia', 'bachillerato', '{2}', 1),
-- 41
('O', 'empieza', 'Concepto aristotelico que designa la sustancia primera, el ser individual y concreto que subyace a los accidentes', 'ousia', 'filosofia', 'bachillerato', '{2}', 3),
-- 42
('P', 'empieza', 'Concepto aristotelico que designa la capacidad de un ser para llegar a ser algo que todavia no es, opuesto al acto', 'potencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 43
('P', 'empieza', 'Clase trabajadora desposeida de los medios de produccion segun el analisis marxista de la sociedad capitalista', 'proletariado', 'filosofia', 'bachillerato', '{2}', 1),
-- 44
('P', 'empieza', 'Concepto orteguiano que designa la vision individual del mundo, siempre parcial y complementaria con la de otros', 'perspectiva', 'filosofia', 'bachillerato', '{2}', 1),
-- 45
('P', 'empieza', 'Concepto marxista que designa el excedente de valor que el trabajador produce y que se apropia el capitalista', 'plusvalia', 'filosofia', 'bachillerato', '{2}', 1),
-- 46
('Q', 'contiene', 'Concepto tomista que designa las cinco demostraciones racionales de la existencia de Dios a partir del mundo sensible', 'aquino', 'filosofia', 'bachillerato', '{2}', 2),
-- 47
('R', 'empieza', 'Concepto orteguiano que designa su filosofia como sintesis de razon y vida frente al racionalismo abstracto', 'raciovitalismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 48
('R', 'empieza', 'Filosofo estadounidense autor de Teoria de la justicia, creador del concepto de posicion original y velo de la ignorancia', 'rawls', 'filosofia', 'bachillerato', '{2}', 1),
-- 49
('R', 'empieza', 'Concepto platonico por el cual el alma recupera el conocimiento de las Ideas que contemplo antes de nacer', 'reminiscencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 50
('S', 'empieza', 'Concepto nietzscheano que designa al ser humano que supera los valores de la moral tradicional y crea los suyos propios', 'superhombre', 'filosofia', 'bachillerato', '{2}', 1),
-- 51
('S', 'empieza', 'Concepto aristotelico que designa la realidad individual compuesta de materia y forma, sujeto de propiedades', 'sustancia', 'filosofia', 'bachillerato', '{2}', 1),
-- 52
('S', 'empieza', 'Filosofo existencialista frances autor de El ser y la nada, defensor de la libertad radical y la responsabilidad del individuo', 'sartre', 'filosofia', 'bachillerato', '{2}', 1),
-- 53
('S', 'empieza', 'Tipo de juicio kantiano que amplia el conocimiento y a la vez es universal y necesario, como los de la matematica y la fisica', 'sintetico', 'filosofia', 'bachillerato', '{2}', 2),
-- 54
('T', 'empieza', 'Filosofo medieval del XIII que armonizo la filosofia aristotelica con la teologia cristiana en su Suma Teologica', 'tomas', 'filosofia', 'bachillerato', '{2}', 1),
-- 55
('T', 'empieza', 'Concepto kantiano referido a las condiciones que hacen posible la experiencia y el conocimiento objetivo', 'trascendental', 'filosofia', 'bachillerato', '{2}', 2),
-- 56
('U', 'contiene', 'Concepto platonico que divide el alma en tres partes: racional, irascible y concupiscible, cada una con su propia virtud', 'estructura', 'filosofia', 'bachillerato', '{2}', 2),
-- 57
('V', 'empieza', 'Concepto rawlsiano que designa la cortina hipotetica tras la cual se desconoce la posicion social al elegir principios de justicia', 'velo', 'filosofia', 'bachillerato', '{2}', 1),
-- 58
('V', 'empieza', 'Concepto nietzscheano que designa el impulso fundamental de todo ser vivo hacia la autoafirmacion y la expansion', 'voluntad', 'filosofia', 'bachillerato', '{2}', 1),
-- 59
('V', 'empieza', 'Concepto orteguiano que designa la razon enraizada en la vida concreta del individuo, no abstracta ni pura', 'vital', 'filosofia', 'bachillerato', '{2}', 2),
-- 60
('W', 'contiene', 'Concepto marxista por el cual el obrero pierde el control sobre su actividad productiva y su producto en el sistema capitalista', 'enajenamiento', 'filosofia', 'bachillerato', '{2}', 2),
-- 61
('X', 'contiene', 'Concepto sartreano que designa la relacion del ser humano con su propia libertad y con el mundo que lo rodea', 'existencia', 'filosofia', 'bachillerato', '{2}', 1),
-- 62
('Y', 'contiene', 'Frase orteguiana que expresa que el sujeto no puede entenderse aislado de su entorno vital e historico', 'yomicircunstancia', 'filosofia', 'bachillerato', '{2}', 2),
-- 63
('Z', 'contiene', 'Obra central de Nietzsche donde expone el superhombre, la voluntad de poder y el eterno retorno', 'zaratustra', 'filosofia', 'bachillerato', '{2}', 1),
-- 64
('A', 'empieza', 'Concepto habermasiano que designa la comunicacion orientada al acuerdo racional libre de dominacion y coaccion', 'accion', 'filosofia', 'bachillerato', '{2}', 2),
-- 65
('B', 'empieza', 'Concepto tomista que designa la felicidad suprema como contemplacion de Dios, fin ultimo del ser humano', 'beatitud', 'filosofia', 'bachillerato', '{2}', 2),
-- 66
('C', 'empieza', 'Concepto marxista referido al sistema economico basado en la propiedad privada de los medios de produccion y la explotacion del trabajo', 'capitalismo', 'filosofia', 'bachillerato', '{2}', 1),
-- 67
('D', 'empieza', 'Concepto cartesiano referido al recurso argumentativo de suponer un ser enganador todopoderoso para llevar la duda al extremo', 'demonio', 'filosofia', 'bachillerato', '{2}', 2),
-- 68
('E', 'empieza', 'Concepto habermasiano que designa la moral basada en el dialogo racional entre todos los afectados por una norma', 'etica', 'filosofia', 'bachillerato', '{2}', 2),
-- 69
('F', 'empieza', 'Concepto nietzscheano referido al espiritu libre que no acepta valores impuestos y crea su propia tabla valorativa', 'filosofo', 'filosofia', 'bachillerato', '{2}', 3),
-- 70
('G', 'empieza', 'Concepto aristotelico de la ley natural que Tomas de Aquino retomo como fundamento de la ley moral y politica', 'gracia', 'filosofia', 'bachillerato', '{2}', 3),
-- 71
('H', 'empieza', 'Concepto marxista que interpreta la historia como un proceso dialectico de luchas entre clases sociales opuestas', 'historicismo', 'filosofia', 'bachillerato', '{2}', 3),
-- 72
('L', 'empieza', 'Concepto rawlsiano que establece que las desigualdades sociales solo se justifican si benefician a los mas desfavorecidos', 'liberalismo', 'filosofia', 'bachillerato', '{2}', 2),
-- 73
('N', 'contiene', 'Concepto tomista que designa la participacion de la criatura racional en la ley eterna divina, accesible por la razon', 'natural', 'filosofia', 'bachillerato', '{2}', 1),
-- 74
('O', 'empieza', 'Concepto orteguiano que afirma que la vida humana es la realidad radical desde la cual todo lo demas cobra sentido', 'ontologia', 'filosofia', 'bachillerato', '{2}', 3),
-- 75
('P', 'empieza', 'Concepto platonico referido a la relacion por la que las cosas sensibles reciben su ser y su inteligibilidad de las Ideas', 'participacion', 'filosofia', 'bachillerato', '{2}', 2);
-- Rosco Bachillerato: preguntas ADICIONALES
-- 75 preguntas x 4 combinaciones = 300 total
-- subject_id: lengua (grades {1},{2}), filosofia (grades {1},{2})

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- =====================================================
-- LENGUA BACHILLERATO 1 (75 preguntas)
-- Temas: picaresca, mística, ascética, prosa didáctica,
-- teatro prelopista, épica culta, gramática, dialectología,
-- pragmática, actos de habla, variedades diatópicas
-- =====================================================

('A', 'empieza', 'Figura retórica que consiste en la repetición de una o varias palabras al comienzo de versos o frases sucesivas', 'anafora', 'lengua', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Tipo de oración subordinada que cumple la función de un adjetivo respecto al antecedente', 'adjetiva', 'lengua', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Práctica espiritual basada en la renuncia y la disciplina moral, cultivada por fray Luis de Granada', 'ascetica', 'lengua', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Novela picaresca anónima de 1554 cuyo protagonista sirve a varios amos empezando por un ciego', 'buscon', 'lengua', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Complemento del verbo que indica la circunstancia de lugar, tiempo, modo o causa de la acción', 'circunstancial', 'lengua', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Rasgo dialectal del andaluz que consiste en la aspiración o pérdida de la -s final de sílaba', 'ceceo', 'lengua', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Rama de la lingüística que estudia la distribución geográfica de los rasgos lingüísticos', 'dialectologia', 'lengua', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Construcción gramatical formada por un verbo en forma no personal que complementa a otro verbo auxiliar o semiauxiliar', 'desiderativa', 'lengua', 'bachillerato', '{1}', 3),
('E', 'empieza', 'Género narrativo extenso en verso que narra hazañas de héroes, como La Araucana de Ercilla', 'epopeya', 'lengua', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Tipo de perífrasis verbal que indica el comienzo de una acción, como "echarse a llorar"', 'empezar', 'lengua', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Composición lírica de origen provenzal que expresa lamento amoroso por la ausencia del amado al amanecer', 'farsante', 'lengua', 'bachillerato', '{1}', 3),
('F', 'empieza', 'Función del lenguaje centrada en la forma del mensaje, propia del lenguaje literario según Jakobson', 'fática', 'lengua', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Autor de las Églogas de influencia virgiliana, renovador de la lírica castellana del Renacimiento', 'garcilaso', 'lengua', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Figura retórica que consiste en la exageración desmesurada de una cualidad o acción', 'hiperbole', 'lengua', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Estrofa de origen italiano formada por once sílabas métricas, introducida por Boscán y Garcilaso', 'hendecasilabo', 'lengua', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Fuerza comunicativa con la que se emite un enunciado, concepto central de la pragmática y los actos de habla', 'ilocutivo', 'lengua', 'bachillerato', '{1}', 3),
('I', 'empieza', 'Forma verbal no personal que puede funcionar como sustantivo en la oración', 'infinitivo', 'lengua', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Composición poética popular de tradición oral, breve y de tono festivo, frecuente en cancioneros medievales', 'jarcha', 'lengua', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Variedad lingüística propia de grupos sociales, estudiada por la sociolingüística y la dialectología social', 'sociolecto', 'lengua', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Novela pastoril de Montemayor que inauguró el género bucólico en la narrativa castellana renacentista', 'lossietelibrosdediana', 'lengua', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Fenómeno dialectal del español septentrional que distingue los fonemas /ʎ/ y /j/ frente al yeísmo', 'lleismo', 'lengua', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Experiencia de unión del alma con la divinidad, tema central en la poesía de San Juan de la Cruz', 'mistica', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Principio pragmático de Grice que establece que los hablantes cooperan proporcionando la información justa y relevante', 'maxima', 'lengua', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Tipo de oración subordinada sustantiva, adjetiva o adverbial que depende de una oración principal', 'nexo', 'lengua', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Género de prosa didáctica medieval en el que un noble enseña a su hijo mediante relatos y consejos', 'nobiliario', 'lengua', 'bachillerato', '{1}', 3),
('Ñ', 'contiene', 'Complemento verbal que recibe indirectamente la acción del verbo, como en "le dio un regalo a su compañera"', 'companera', 'lengua', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Tipo de complemento del predicado que mide o cuantifica al verbo, como "pesa tres kilos"', 'obligativo', 'lengua', 'bachillerato', '{1}', 3),
('O', 'empieza', 'Estrofa de ocho versos de arte mayor con rima consonante, usada en la poesía del siglo XV', 'octava', 'lengua', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Construcción verbal formada por un auxiliar y un verbo en forma no personal que expresa matices aspectuales o modales', 'perifrasis', 'lengua', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Rama de la lingüística que estudia el uso del lenguaje en contexto y la intención comunicativa', 'pragmatica', 'lengua', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Género narrativo del Siglo de Oro cuyos protagonistas son personajes de baja extracción social que sobreviven con astucia', 'picaresca', 'lengua', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Estrofa de cinco versos utilizada en la lírica del Renacimiento, con esquema de rima aBabB', 'quintilla', 'lengua', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Acto de habla en el que el hablante se compromete a realizar una acción futura, como las promesas y juramentos', 'representativo', 'lengua', 'bachillerato', '{1}', 3),
('R', 'empieza', 'Variedad lingüística utilizada en función de la situación comunicativa: formal, coloquial, etc.', 'registro', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Oración que depende sintácticamente de otra principal y desempeña una función dentro de ella', 'subordinada', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Rasgo dialectal del español meridional que consiste en pronunciar la c y la z como s', 'seseo', 'lengua', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Obra dramática del siglo XV atribuida a Fernando de Rojas, considerada precursora del teatro renacentista', 'tragicomedia', 'lengua', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Modalidad de variación lingüística que depende de la temática o ámbito profesional del discurso', 'tecnicismo', 'lengua', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Recurso estilístico del teatro prelopista que busca la coherencia interna de tiempo, lugar y acción', 'unidad', 'lengua', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Tipo de variación lingüística determinada por factores geográficos, también llamada variedad diatópica', 'variedad', 'lengua', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Composición lírica breve de arte menor típica del Cancionero de Palacio, con estribillo y mudanza', 'villancico', 'lengua', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Complemento del predicado que expresa la causa, el origen o la procedencia de la acción verbal', 'nexual', 'lengua', 'bachillerato', '{1}', 3),
('Y', 'contiene', 'Tipo de oración subordinada introducida por la conjunción causal "ya que"', 'disyuntiva', 'lengua', 'bachillerato', '{1}', 2),
('Y', 'empieza', 'Fenómeno fonético del español consistente en pronunciar /ʎ/ como /j/, generalizado en la mayoría de dialectos', 'yeismo', 'lengua', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Autor renacentista que compuso la épica culta La Araucana sobre la conquista de Chile', 'ercilla', 'lengua', 'bachillerato', '{1}', 2),

-- Preguntas adicionales para completar 75 de Lengua Bach 1
('A', 'empieza', 'Complemento del verbo que designa al destinatario de la acción sin preposición directa, propio de verbos transitivos', 'acusativo', 'lengua', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Estrofa pastoril de origen italiano de ocho versos endecasílabos con rima alterna y pareado final', 'bergamasca', 'lengua', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Función sintáctica que complementa simultáneamente al verbo y al sujeto o al complemento directo', 'complementopredicativo', 'lengua', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Término pragmático que designa los elementos del contexto extralingüístico señalados por pronombres y adverbios', 'deixis', 'lengua', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Poema pastoril de Garcilaso en forma dialogada entre pastores que lamentan sus desventuras amorosas', 'egloga', 'lengua', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Variante dialectal del asturleonés caracterizada por la diptongación de vocales breves latinas', 'fabla', 'lengua', 'bachillerato', '{1}', 3),
('G', 'empieza', 'Forma verbal no personal que puede funcionar como adverbio modificando al verbo principal', 'gerundio', 'lengua', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Periodo de mayor esplendor cultural en el que florecen la picaresca, la mística y el teatro renacentista', 'humanismo', 'lengua', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Información que no se dice explícitamente pero se puede deducir del enunciado, concepto pragmático clave', 'implicatura', 'lengua', 'bachillerato', '{1}', 3),
('J', 'empieza', 'Dramaturgo del siglo XVI autor de los Pasos, piezas breves cómicas precursoras del entremés', 'juandelencina', 'lengua', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Obra anónima del siglo XVI en la que un mozo de ciego narra sus peripecias con distintos amos', 'lazarillo', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Oración que expresa deseo, duda o irrealidad y se construye en modo verbal no indicativo', 'modal', 'lengua', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Variedad dialectal del español hablado en la mitad norte de España, con distinción de /s/ y /θ/', 'nortenno', 'lengua', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Complemento del verbo precedido de preposición que aparece solo con verbos intransitivos o copulativos', 'oblicuo', 'lengua', 'bachillerato', '{1}', 3),
('P', 'empieza', 'Forma verbal compuesta por haber + participio que indica acción acabada antes de un punto temporal', 'pluscuamperfecto', 'lengua', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Famosa novela de caballerías cuya parodia constituye el argumento central de la obra de Cervantes', 'quijote', 'lengua', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Periodo cultural de los siglos XV-XVI que revitalizó los modelos grecolatinos en la literatura castellana', 'renacimiento', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Fenómeno lingüístico por el cual un significante adquiere un significado diferente al original con el paso del tiempo', 'semantica', 'lengua', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Composición lírica de tres estrofas con vuelta al estribillo inicial, propia de la poesía cancioneril', 'terceto', 'lengua', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Empleo de un término en sentido figurado basado en una relación de semejanza, procedimiento retórico frecuente', 'univoco', 'lengua', 'bachillerato', '{1}', 3),
('V', 'empieza', 'Variación lingüística determinada por el nivel sociocultural del hablante, también llamada diastrática', 'vulgarismo', 'lengua', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Autor del Lazarillo de Tormes cuya identidad sigue siendo debatida por los estudiosos', 'desconocido', 'lengua', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Recursos lingüísticos que organizan y conectan las distintas partes del discurso escrito', 'textual', 'lengua', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Tipo de oración coordinada que presenta alternativas mediante nexos como "o", "bien...bien"', 'coyuntura', 'lengua', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Fenómeno dialectal que consiste en la confusión de /r/ y /l/ en posición implosiva, propio del andaluz', 'neutralizacion', 'lengua', 'bachillerato', '{1}', 2),

-- =====================================================
-- LENGUA BACHILLERATO 2 (75 preguntas)
-- Temas: costumbrismo, krausismo, esperpento, tremendismo,
-- novela social años 50, poesía de la experiencia, novísimos,
-- teatro independiente, ensayo contemporáneo, sociolingüística,
-- análisis del discurso
-- =====================================================

('A', 'empieza', 'Corriente poética de los años 80 que reivindica la narratividad, el tono coloquial y la experiencia urbana cotidiana', 'autobiografismo', 'lengua', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Técnica narrativa del Nouveau Roman y la novela experimental española de los 60 que elimina al narrador omnisciente', 'acronia', 'lengua', 'bachillerato', '{2}', 3),
('A', 'empieza', 'Disciplina lingüística que estudia las estructuras y estrategias de los textos más allá de la oración', 'analisis', 'lengua', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Novelista de la Generación del 98 autor de La busca, primera entrega de la trilogía La lucha por la vida', 'baroja', 'lengua', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Dramaturgo contemporáneo autor de El tragaluz y La fundación, representante del teatro de compromiso social', 'buero', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Movimiento literario del siglo XIX que retrata tipos y escenas populares con intención satírica o nostálgica', 'costumbrismo', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Novelista autora de Nada, obra precursora del tremendismo publicada en 1945', 'carmenlaforet', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Propiedad textual que asegura la conexión lógica y semántica entre las ideas de un discurso', 'coherencia', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Término sociolingüístico que designa la situación en que dos lenguas conviven con funciones diferenciadas en una comunidad', 'diglosia', 'lengua', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Técnica teatral del esperpento que consiste en presentar personajes deformados como fantoches o peleles', 'degradacion', 'lengua', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Género literario creado por Valle-Inclán que deforma la realidad mediante una estética sistemáticamente grotesca', 'esperpento', 'lengua', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Género en prosa de carácter argumentativo y reflexivo, cultivado por Ortega, Unamuno y Marías en el siglo XX', 'ensayo', 'lengua', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Recurso narrativo consistente en un salto temporal hacia adelante en la historia contada', 'flashforward', 'lengua', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Novelista autor de El Jarama, obra cumbre del realismo social y objetivista de los años 50', 'ferlosio', 'lengua', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Poeta de la experiencia cuya obra Arde el mar supuso una renovación poética en la línea de los novísimos', 'gimferrer', 'lengua', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Autor del ensayo La España invertebrada que reflexionó sobre la decadencia nacional desde el raciovitalismo', 'gasset', 'lengua', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Recurso discursivo que introduce información conocida por el receptor como punto de partida del enunciado', 'hiperonimia', 'lengua', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Vanguardia literaria lanzada por Vicente Huidobro que proponía crear realidades nuevas con la palabra', 'huidobro', 'lengua', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Fenómeno sociolingüístico por el cual un hablante alterna entre dos lenguas o variedades dentro de un mismo discurso', 'interferencia', 'lengua', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Figura retórica consistente en decir lo contrario de lo que se piensa, recurso frecuente en el esperpento', 'ironia', 'lengua', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Poeta del 27 autor de Espacio, largo poema en prosa compuesto durante su exilio en América', 'juanramon', 'lengua', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Corriente pedagógica y filosófica de origen alemán introducida en España por Sanz del Río en el siglo XIX', 'krausismo', 'lengua', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Fenómeno sociolingüístico de elección entre distintas lenguas o variedades en función de la situación comunicativa', 'lealtad', 'lengua', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Autor de La colmena, novela coral que retrata el Madrid de posguerra con técnica caleidoscópica', 'linterna', 'lengua', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Poeta de posguerra cuya Antología traducida exploró el humor y la ironía como forma de resistencia literaria', 'marquina', 'lengua', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Técnica narrativa de la novela experimental que reproduce el fluir ininterrumpido del pensamiento del personaje', 'monologo', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Movimiento poético español de finales de los años 60 que rompió con la poesía social y reivindicó la autonomía del lenguaje', 'novisimos', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Proceso sociolingüístico de fijación de la norma culta de una lengua a través de gramáticas y diccionarios', 'normalizacion', 'lengua', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Adjetivo que describe las obras literarias que reflejan los problemas sociales y políticos de la España de posguerra', 'espannola', 'lengua', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Técnica narrativa que presenta los hechos sin intervención subjetiva del narrador, propia de la novela social de los 50', 'objetivismo', 'lengua', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Ensayista autor de La rebelión de las masas que formuló el concepto de razón vital', 'ortega', 'lengua', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Corriente poética de los años 80-90 que privilegia la experiencia personal, el tono urbano y la emoción contenida', 'postnovismo', 'lengua', 'bachillerato', '{2}', 3),
('P', 'empieza', 'Propiedad textual que garantiza la correcta presentación formal del texto: márgenes, tipografía, puntuación', 'presentacion', 'lengua', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Autor de La vida es sueño y modelo del drama filosófico que influyó en el teatro posterior hasta el siglo XX', 'quevedo', 'lengua', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Tendencia literaria del siglo XIX que aspira a reproducir fielmente la realidad social sin idealización', 'realismo', 'lengua', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Mecanismo lingüístico de cohesión textual que sustituye un elemento por otro equivalente para evitar repeticiones', 'referencia', 'lengua', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Rama de la lingüística que estudia la relación entre lengua y sociedad: bilingüismo, diglosia, prestigio', 'sociolinguistica', 'lengua', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Corriente novelística de la posguerra española de los años 40 que muestra una realidad brutal y descarnada', 'socialrealismo', 'lengua', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Tendencia narrativa de posguerra que presenta la realidad con crudeza extrema, violencia y miseria', 'tremendismo', 'lengua', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Movimiento de compañías escénicas españolas de los años 60-70 que buscaban renovar el teatro fuera de los circuitos comerciales', 'teatroindependiente', 'lengua', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Autor del ensayo Del sentimiento trágico de la vida y renovador de la novela con su concepto de nivola', 'unamuno', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Dramaturgo gallego creador del esperpento, autor de Luces de bohemia y las Comedias bárbaras', 'valleinclam', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Relación semántica entre palabras con significados opuestos, como "frío" y "caliente"', 'variable', 'lengua', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Novelista ganador del Nobel cuya obra Conversación en La Catedral influyó en narradores españoles contemporáneos', 'bowniano', 'lengua', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Propiedad textual que garantiza la conexión formal entre los enunciados mediante conectores, pronombres y repeticiones léxicas', 'textualidad', 'lengua', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Género periodístico de opinión que comparte rasgos con el ensayo literario y se publica en diarios y revistas', 'ensayismo', 'lengua', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Proceso de sustitución de una lengua minoritaria por otra de mayor prestigio en una comunidad bilingüe', 'desplazamiento', 'lengua', 'bachillerato', '{2}', 2),

-- Preguntas adicionales para completar 75 de Lengua Bach 2
('A', 'empieza', 'Tipo de conector discursivo que indica adición de información, como "además", "asimismo", "igualmente"', 'aditivo', 'lengua', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Fenómeno de contacto de lenguas por el cual un hablante habla dos lenguas con competencia comparable', 'bilinguismo', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Novelista autor de La familia de Pascual Duarte, obra fundacional del tremendismo en la narrativa española', 'cela', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Novelista autor de Cinco horas con Mario, retrato de la España franquista mediante monólogo interior', 'delibes', 'lengua', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Poeta de la experiencia nacido en Granada, autor de Las personas del verbo y defensor de la poesía figurativa', 'eladiolinacero', 'lengua', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Tipo de texto cuya función principal es influir en la conducta del receptor, como la publicidad o el discurso político', 'funcional', 'lengua', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Poeta social de posguerra autor de Celaya que reivindicó la poesía como instrumento de transformación colectiva', 'gabrielcelaya', 'lengua', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Capacidad sociolingüística del hablante para adecuar su discurso al contexto comunicativo y a sus interlocutores', 'habitus', 'lengua', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Cualidad del hablante que determina su variedad lingüística personal y única, su forma individual de usar la lengua', 'idiolecto', 'lengua', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Poeta del 27 autor de Hijos de la ira que inauguró la poesía existencial desarraigada de posguerra', 'joseluiscano', 'lengua', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Poeta y ensayista autor de La realidad y el deseo, exiliado del 27 cuya obra influyó en la poesía de la experiencia', 'luiscernuda', 'lengua', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Autor de Tiempo de silencio, novela experimental de 1962 que rompió con el realismo social imperante', 'martinssantos', 'lengua', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Tipo de texto que cuenta hechos reales o ficticios organizados en una secuencia temporal', 'narrativo', 'lengua', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Conector discursivo que introduce una alternativa o matización al enunciado previo', 'oposicion', 'lengua', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Actitud lingüística favorable hacia una variedad considerada de mayor estatus social o cultural', 'prestigio', 'lengua', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Recurso de cohesión consistente en repetir una misma palabra o estructura para dar énfasis al discurso', 'reiteracion', 'lengua', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Autor de Señas de identidad que renovó la novela española de los 60 con técnicas experimentales y plurilingüismo', 'sastre', 'lengua', 'bachillerato', '{2}', 3),
('T', 'empieza', 'Unidad comunicativa máxima con sentido completo, objeto de estudio de la lingüística textual', 'texto', 'lengua', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Empleo lingüístico generalizado y aceptado por los hablantes de una comunidad, frente a la norma prescriptiva', 'uso', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Poeta novísimo autor de Sepulcro en Tarquinia que incorporó referencias culturalistas y esteticistas', 'villena', 'lengua', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Tipo de ensayo que analiza críticamente la situación política o moral de un país, frecuente en el 98 y el novecentismo', 'razonamiento', 'lengua', 'bachillerato', '{2}', 2),

-- =====================================================
-- FILOSOFÍA BACHILLERATO 1 (75 preguntas)
-- Temas: atomismo, cinismo, neoplatonismo, nominalismo,
-- escolástica, ocasionalismo, idealismo trascendental,
-- positivismo, fenomenología, filosofía analítica, bioética,
-- filosofía de la mente
-- =====================================================

('A', 'empieza', 'Corriente filosófica presocrática que explica la realidad como combinación de partículas indivisibles en el vacío', 'atomismo', 'filosofia', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Rama de la filosofía que estudia los valores, la belleza y la experiencia estética', 'axiologia', 'filosofia', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Argumento filosófico que pretende demostrar la existencia de Dios a partir de la sola definición de su concepto', 'anselmo', 'filosofia', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Rama de la ética aplicada que analiza los dilemas morales surgidos de los avances en medicina y ciencias de la vida', 'bioetica', 'filosofia', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Filósofo empirista irlandés que negó la existencia de la materia y afirmó que ser es ser percibido', 'berkeley', 'filosofia', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Escuela filosófica helenística fundada por Antístenes y representada por Diógenes, que rechazaba las convenciones sociales', 'cinismo', 'filosofia', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Problema filosófico sobre la relación entre los estados mentales conscientes y los procesos cerebrales físicos', 'conciencia', 'filosofia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Posición epistemológica que sostiene que los conceptos universales se forman por abstracción a partir de la experiencia', 'conceptualismo', 'filosofia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Filósofo presocrático que junto con Leucipo formuló la teoría de los átomos y el vacío', 'democrito', 'filosofia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Posición en filosofía de la mente que defiende la existencia de dos sustancias irreductibles: cuerpo y mente', 'dualismo', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Corriente filosófica medieval que integró la fe cristiana con la razón filosófica grecolatina en las universidades', 'escolastica', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Concepto fenomenológico husserliano que designa la suspensión del juicio sobre la existencia del mundo exterior', 'epoje', 'filosofia', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Corriente del siglo XX que analiza los problemas filosóficos como problemas de lenguaje, representada por Russell y Wittgenstein', 'filosofiaanalitica', 'filosofia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Método filosófico fundado por Husserl que estudia las estructuras de la experiencia tal como se presentan a la conciencia', 'fenomenologia', 'filosofia', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Pensador medieval franciscano conocido por su navaja, que defendió que no deben multiplicarse los entes sin necesidad', 'guillermodeockham', 'filosofia', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Filósofo escocés que cuestionó la causalidad y defendió que el conocimiento se funda en la costumbre y la experiencia', 'hume', 'filosofia', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Concepto fenomenológico que designa la vivencia intencional en la que la conciencia se dirige a un objeto', 'horizonte', 'filosofia', 'bachillerato', '{1}', 3),
('I', 'empieza', 'Sistema filosófico kantiano que sostiene que el sujeto constituye activamente las condiciones de posibilidad del conocimiento', 'idealismo', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Propiedad de la conciencia por la cual todo acto mental se dirige necesariamente a un objeto, concepto central en Husserl', 'intencionalidad', 'filosofia', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Tipo de proposición kantiana que amplía el conocimiento y a la vez es válida independientemente de la experiencia', 'juicio', 'filosofia', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Principio lógico del positivismo que establece que solo las proposiciones verificables empíricamente tienen significado cognitivo', 'verificacionismo', 'filosofia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Filósofo presocrático considerado cofundador del atomismo junto a Demócrito', 'leucipo', 'filosofia', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Posición en filosofía analítica según la cual los problemas filosóficos son en realidad confusiones lingüísticas', 'linguistico', 'filosofia', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Tesis en filosofía de la mente que identifica los estados mentales con estados físicos del cerebro', 'materialismo', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Filósofo racionalista que propuso la teoría del ocasionalismo para resolver la interacción mente-cuerpo', 'malebranche', 'filosofia', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Corriente filosófica tardoantigua que reinterpretó las ideas platónicas como emanaciones de un principio Uno absoluto', 'neoplatonismo', 'filosofia', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Doctrina medieval según la cual los universales son solo nombres sin realidad fuera de la mente', 'nominalismo', 'filosofia', 'bachillerato', '{1}', 1),
('Ñ', 'contiene', 'Acto de instruir o transmitir un saber, objeto de reflexión filosófica desde la paideia griega hasta la pedagogía moderna', 'ensenanza', 'filosofia', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Doctrina filosófica de Malebranche según la cual Dios es la causa real de toda interacción entre mente y cuerpo', 'ocasionalismo', 'filosofia', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Rama de la filosofía que estudia las categorías fundamentales del ser, la existencia y la realidad', 'ontologia', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Corriente filosófica fundada por Comte que limita el conocimiento válido a los hechos observables y las leyes científicas', 'positivismo', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Filósofo neoplatónico del siglo III que sistematizó la teoría de la emanación del Uno', 'plotino', 'filosofia', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Experiencia subjetiva consciente de un estado mental, como el "cómo es" sentir dolor, debate central en filosofía de la mente', 'qualia', 'filosofia', 'bachillerato', '{1}', 3),
('R', 'empieza', 'Corriente epistemológica que defiende que la razón es la fuente principal y criterio del conocimiento válido', 'racionalismo', 'filosofia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Posición medieval opuesta al nominalismo que atribuye existencia real a los universales fuera de la mente', 'realismo', 'filosofia', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Método filosófico socrático basado en el diálogo que alumbra la verdad latente en el interlocutor', 'socratico', 'filosofia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Posición en filosofía de la mente que niega la existencia real de los estados mentales del sentido común', 'superveniencia', 'filosofia', 'bachillerato', '{1}', 3),
('T', 'empieza', 'Adjetivo que califica al idealismo kantiano, referido a las condiciones a priori que hacen posible la experiencia', 'trascendental', 'filosofia', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Filósofo escolástico dominico que armonizó la filosofía aristotélica con la teología cristiana en la Summa', 'tomas', 'filosofia', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Concepto filosófico que designa aquello que se predica de todas las cosas de una misma clase, central en la disputa medieval', 'universal', 'filosofia', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Principio del Círculo de Viena según el cual un enunciado solo tiene sentido si es susceptible de comprobación empírica', 'verificacion', 'filosofia', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Filósofo del Círculo de Viena cuyo Tractatus delimitó lo decible y afirmó que de lo que no se puede hablar hay que callar', 'wittgenstein', 'filosofia', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Concepto fenomenológico referido a la vivencia que se presenta inmediatamente a la conciencia sin mediación', 'existencia', 'filosofia', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Concepto epistemológico que designa la creencia justificada y verdadera, definición clásica del saber', 'creyente', 'filosofia', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Capacidad humana de pensar y argumentar correctamente, objeto central de la lógica y la epistemología', 'razonamiento', 'filosofia', 'bachillerato', '{1}', 1),

-- Preguntas adicionales para completar 75 de Filosofía Bach 1
('A', 'empieza', 'Filósofo helenístico cínico que vivía en una tinaja y buscaba con un candil a un hombre honesto', 'antisocial', 'filosofia', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Posición filosófica que reduce todos los fenómenos mentales a procesos biológicos cerebrales sin residuo inmaterial', 'biologicismo', 'filosofia', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Fundador del positivismo que propuso la ley de los tres estadios: teológico, metafísico y positivo', 'comte', 'filosofia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Procedimiento lógico que va de lo general a lo particular, fundamental en la epistemología racionalista', 'deduccion', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Corriente epistemológica que sostiene que todo conocimiento procede de la experiencia sensible', 'empirismo', 'filosofia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Posición en filosofía de la mente según la cual los estados mentales se definen por sus relaciones causales', 'funcionalismo', 'filosofia', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Rama de la epistemología que investiga la naturaleza, el alcance y los límites del conocimiento humano', 'gnoseologia', 'filosofia', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Corriente ética que identifica el bien con el placer moderado y la amistad, fundada por Epicuro', 'hedonismo', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Razonamiento que parte de casos particulares para establecer una conclusión general, cuestionado por Hume', 'induccion', 'filosofia', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Proposición susceptible de ser verdadera o falsa, componente básico del razonamiento lógico en Kant', 'juiciosintetico', 'filosofia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Filósofo racionalista alemán que propuso la teoría de las mónadas y la armonía preestablecida', 'leibniz', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Concepto kantiano que designa la realidad tal como es en sí misma, inaccesible al conocimiento humano', 'monadologia', 'filosofia', 'bachillerato', '{1}', 3),
('N', 'empieza', 'Concepto kantiano que designa la cosa en sí, el objeto pensado pero no experimentado', 'noumeno', 'filosofia', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Argumento escolástico que demuestra la existencia de Dios por la necesidad de una causa primera del orden cósmico', 'ordenacion', 'filosofia', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Concepto del neoplatonismo que refiere al ser supremo e inefable del que emana toda la realidad', 'principio', 'filosofia', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Método fenomenológico que pone entre paréntesis las presuposiciones para acceder a las esencias de los fenómenos', 'reduccion', 'filosofia', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Filósofo racionalista holandés que identificó Dios con la Naturaleza en un sistema monista panteísta', 'spinoza', 'filosofia', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Término griego que designa el fin o propósito de un ser, central en la ética y la metafísica aristotélicas', 'teleologia', 'filosofia', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Doctrina ética que juzga la moralidad de una acción por la cantidad de bienestar que produce para el mayor número', 'utilitarismo', 'filosofia', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Movimiento filosófico del siglo XX que exigió la verificación empírica como criterio de significado de los enunciados', 'viena', 'filosofia', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Concepto filosófico que designa lo que hay, lo que es, el conjunto de todo lo real', 'existente', 'filosofia', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Problema bioético sobre la creación y manipulación de copias genéticas de organismos vivos', 'clonacion', 'filosofia', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Condición para que una proposición descriptiva sea verdadera según la teoría correspondentista', 'veraz', 'filosofia', 'bachillerato', '{1}', 2),

-- =====================================================
-- FILOSOFÍA BACHILLERATO 2 (75 preguntas)
-- Temas: dualismo platónico, hilemorfismo, pruebas de Dios,
-- mecanicismo cartesiano, problema de la inducción,
-- juicios sintéticos a priori, plusvalía, eterno retorno,
-- razón vital, ética discursiva
-- =====================================================

('A', 'empieza', 'Concepto aristotélico que designa el paso de la potencia al acto, el movimiento como actualización de posibilidades', 'actualizacion', 'filosofia', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Argumento medieval que pretende probar la existencia de Dios a partir de la necesidad de un primer motor inmóvil', 'argumento', 'filosofia', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Concepto marxista referido a la condición del trabajador que se siente extraño respecto al producto de su trabajo', 'alienacion', 'filosofia', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Concepto marxista que designa la estructura económica sobre la que se levanta la superestructura ideológica', 'base', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Concepto cartesiano que designa al yo pensante como primera certeza indubitable tras la duda metódica', 'cogito', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Imperativo moral kantiano que exige actuar según una máxima universalizable, sin excepciones', 'categorico', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Filósofa y filósofo de la Escuela de Fráncfort que junto a Habermas desarrolló la ética del discurso', 'comunicativa', 'filosofia', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Método filosófico cartesiano que consiste en rechazar como falso todo aquello que pueda ser puesto en duda', 'duda', 'filosofia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Teoría platónica que separa la realidad en dos planos: el mundo sensible y el mundo inteligible de las Ideas', 'dualismo', 'filosofia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Tipo de materialismo marxista que concibe la historia como lucha de contrarios que se resuelve en una síntesis superior', 'dialectico', 'filosofia', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Concepto nietzscheano según el cual todos los acontecimientos del universo se repiten cíclicamente de forma idéntica', 'eternoretorno', 'filosofia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Concepto aristotélico que designa la forma o esencia que determina lo que una cosa es necesariamente', 'entelequia', 'filosofia', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Teoría del conocimiento cartesiana que confía en la razón y las ideas innatas como fuente de certeza', 'evidencia', 'filosofia', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Concepto platónico que refiere a las realidades perfectas, inmutables y eternas que constituyen el verdadero ser', 'forma', 'filosofia', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Concepto nietzscheano que designa la energía creadora e instintiva que impulsa al individuo a superarse', 'fuerza', 'filosofia', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Filósofo autor de la teoría del genio maligno como hipótesis radical de duda en las Meditaciones metafísicas', 'geniomaligno', 'filosofia', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Filósofo de la Escuela de Fráncfort que formuló la ética discursiva basada en la acción comunicativa', 'habermas', 'filosofia', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Teoría aristotélica según la cual toda sustancia está compuesta de materia y forma inseparablemente unidas', 'hilemorfismo', 'filosofia', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Tipo de conocimiento kantiano que es universal y necesario pero amplía el saber, como los juicios de la matemática pura', 'intuicion', 'filosofia', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Problema epistemológico planteado por Hume sobre la legitimidad de inferir leyes generales a partir de casos particulares', 'induccion', 'filosofia', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Proposición kantiana que es a la vez ampliativa y válida con independencia de la experiencia, fundamento de la ciencia', 'juiciosinteticoapriori', 'filosofia', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Concepto marxista que designa la clase social poseedora de los medios de producción y explotadora del proletariado', 'burguesia', 'filosofia', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Concepto marxista que designa la lucha entre clases sociales como motor del cambio histórico', 'luchadeclases', 'filosofia', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Visión cartesiana del mundo físico según la cual la naturaleza funciona como una máquina regida por leyes causales', 'mecanicismo', 'filosofia', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Concepto aristotélico que designa el sustrato indeterminado que recibe la forma para constituir la sustancia', 'materia', 'filosofia', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Concepto nietzscheano que designa la negación de todos los valores y sentidos trascendentes de la existencia', 'nihilismo', 'filosofia', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Concepto kantiano referido a la realidad en sí misma, incognoscible, que se opone al fenómeno', 'noumeno', 'filosofia', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Tipo de razón orteguiana que no es pura ni abstracta sino enraizada en la circunstancia vital del individuo', 'companero', 'filosofia', 'bachillerato', '{2}', 3),
('O', 'empieza', 'Filósofo español autor de la teoría de la razón vital y la razón histórica como superación del racionalismo', 'ortega', 'filosofia', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Concepto platónico para el conocimiento verdadero de las Ideas frente a la mera opinión del mundo sensible', 'opinion', 'filosofia', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Concepto marxista que designa la diferencia entre el valor producido por el trabajador y el salario que recibe', 'plusvalia', 'filosofia', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Concepto aristotélico que designa la capacidad de un ser para llegar a ser algo que aún no es en acto', 'potencia', 'filosofia', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Prueba tomista de la existencia de Dios basada en la imposibilidad de una serie infinita de causas eficientes', 'quintavia', 'filosofia', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Concepto orteguiano que designa una razón inseparable de la vida concreta del sujeto y su circunstancia histórica', 'razonvital', 'filosofia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Atributo cartesiano de la sustancia pensante, cuya naturaleza es pensar y cuya existencia es indubitable', 'rescogitans', 'filosofia', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Concepto nietzscheano que designa al ser humano que ha superado la moral del rebaño y crea sus propios valores', 'superhombre', 'filosofia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Concepto marxista referido a las instituciones jurídicas, políticas e ideológicas que se asientan sobre la base económica', 'superestructura', 'filosofia', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Pruebas racionales de la existencia de Dios formuladas por Tomás de Aquino en la Summa Theologica', 'tomistavias', 'filosofia', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Forma a priori de la sensibilidad en Kant que, junto con el espacio, hace posible la experiencia fenoménica', 'tiempo', 'filosofia', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Concepto nietzscheano que designa la revalorización de todos los valores tras la muerte de Dios', 'uebermensch', 'filosofia', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Prueba tomista que parte de los grados de perfección en los seres para demostrar la existencia de un ser perfectísimo', 'via', 'filosofia', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Concepto orteguiano según el cual la vida es la realidad radical desde la que se comprende todo lo demás', 'vivencia', 'filosofia', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Filósofo que anunció la muerte de Dios y la necesidad de una transvaloración de todos los valores morales', 'nietzsche', 'filosofia', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Concepto marxista que designa la apropiación del trabajo ajeno por parte del capitalista sin justa compensación', 'explotacion', 'filosofia', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Concepto kantiano referido al sujeto que constituye activamente la experiencia mediante las formas a priori', 'trascendentalmente', 'filosofia', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Concepto orteguiano que designa la necesidad de situar al individuo en su contexto histórico para comprenderlo', 'circunstancializar', 'filosofia', 'bachillerato', '{2}', 3),

-- Preguntas adicionales para completar 75 de Filosofía Bach 2
('A', 'empieza', 'Concepto aristotélico que designa la realización plena de las potencialidades de un ser', 'acto', 'filosofia', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Filósofo racionalista cuyas Meditaciones establecieron el dualismo entre res cogitans y res extensa', 'baruch', 'filosofia', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Categoría kantiana del entendimiento que permite pensar la relación necesaria entre causa y efecto en los fenómenos', 'causalidad', 'filosofia', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Requisito de la ética discursiva de Habermas según el cual las normas morales deben ser aceptadas por todos los afectados', 'discurso', 'filosofia', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Concepto kantiano que designa la forma a priori de la sensibilidad junto con el tiempo', 'espacio', 'filosofia', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Concepto kantiano que designa aquello que aparece al sujeto tras ser configurado por las formas a priori de la sensibilidad', 'fenomeno', 'filosofia', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Idea platónica suprema que ilumina las demás Ideas y es principio del ser y del conocer', 'gradacion', 'filosofia', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Proceso dialectico marxista por el cual la tesis y la antítesis se superan en una síntesis que las integra', 'historicismo', 'filosofia', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Concepto cartesiano referido a las ideas que el sujeto posee desde el nacimiento, no derivadas de la experiencia', 'innatas', 'filosofia', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Proposición kantiana cuyo predicado está contenido en el sujeto y no amplía el conocimiento', 'juicioanalitico', 'filosofia', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Alegoría platónica de la liberación del prisionero que contempla las sombras y asciende hacia la verdad', 'liberacion', 'filosofia', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Concepto nietzscheano que designa la moral de los débiles basada en la culpa, la compasión y la renuncia', 'moraldeesclavos', 'filosofia', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Principio ético kantiano que prohíbe tratar a las personas solo como medios y exige respetarlas como fines en sí mismas', 'norma', 'filosofia', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Situación ideal de habla en la ética discursiva de Habermas donde todos los participantes dialogan sin coacción', 'openness', 'filosofia', 'bachillerato', '{2}', 3),
('P', 'empieza', 'Clase social marxista que solo posee su fuerza de trabajo y la vende al capitalista a cambio de un salario', 'proletariado', 'filosofia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Concepto orteguiano que complementa la razón vital situando al sujeto en su contexto temporal y cultural', 'razonhistorica', 'filosofia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Atributo cartesiano de la sustancia material, cuya naturaleza es la extensión en largo, ancho y profundo', 'resextensa', 'filosofia', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Concepto aristotélico que designa al ente individual compuesto de materia y forma, soporte de los accidentes', 'sustancia', 'filosofia', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Concepto marxista referido a la cantidad de trabajo socialmente necesario para producir una mercancía', 'trabajoabstracto', 'filosofia', 'bachillerato', '{2}', 3),
('U', 'empieza', 'Requisito de la ética kantiana según el cual una máxima moral debe poder ser querida como ley para todos los seres racionales', 'universalizabilidad', 'filosofia', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Concepto marxista que distingue entre el valor que tiene un bien por su utilidad y el valor que tiene en el mercado', 'valor', 'filosofia', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Filósofo alemán cuya dialéctica del señor y el siervo influyó decisivamente en la teoría marxista de la alienación', 'hegelianismo', 'filosofia', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Concepto nietzscheano que describe la situación cultural tras la pérdida de los valores trascendentes tradicionales', 'inexistencia', 'filosofia', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Frase orteguiana que expresa que el ser humano no tiene naturaleza fija sino que se va haciendo a lo largo del tiempo', 'proyectandose', 'filosofia', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Concepto habermasiano que designa la validez de una norma moral alcanzada mediante el consenso racional', 'razonabilidad', 'filosofia', 'bachillerato', '{2}', 2),

-- Preguntas extra para alcanzar 75 por categoría

-- LENGUA BACH 1: 5 más (70→75)
('B', 'empieza', 'Autor de la novela picaresca El Buscón, que satiriza la sociedad española del siglo XVII con estilo conceptista', 'buscavidas', 'lengua', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Complemento del verbo que recibe directamente la acción, identificable con la pregunta qué o a quién', 'directo', 'lengua', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Tipo de perífrasis verbal que indica una acción futura inminente, como "ir a + infinitivo"', 'futuro', 'lengua', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Obra en prosa didáctica del Renacimiento escrita por fray Antonio de Guevara como espejo de príncipes', 'guevara', 'lengua', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Poema extenso en tercetos encadenados de Garcilaso que introduce el modelo virgiliano en la lírica castellana', 'tercetoencadenado', 'lengua', 'bachillerato', '{1}', 3),

-- LENGUA BACH 2: 7 más (68→75)
('C', 'empieza', 'Autor de La colmena, novela coral de 1951 que retrata sin idealismo la miseria del Madrid de posguerra', 'celacamilo', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Tipo de conector discursivo que introduce una consecuencia lógica, como "por tanto", "en consecuencia"', 'deductivo', 'lengua', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Grupo poético del 27 cuya estética combinó la tradición popular con la vanguardia y la poesía pura', 'generacion', 'lengua', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Recurso de cohesión textual que utiliza sinónimos, hiperónimos o paráfrasis para evitar la repetición léxica', 'hiperonimo', 'lengua', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Género periodístico y literario del costumbrismo cultivado por Larra con intención satírica y reformista', 'larra', 'lengua', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Recurso estilístico del esperpento que animaliza y cosifica a los personajes para subrayar su degradación', 'munecoizacion', 'lengua', 'bachillerato', '{2}', 3),
('P', 'empieza', 'Poeta de la experiencia autor de Habitaciones separadas que cultiva un lirismo urbano e intimista', 'poesiadelaexperiencia', 'lengua', 'bachillerato', '{2}', 2),

-- FILOSOFÍA BACH 1: 7 más (68→75)
('A', 'empieza', 'Concepto fenomenológico que designa la dirección de la conciencia hacia su objeto, según Brentano y Husserl', 'aprehension', 'filosofia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Problema filosófico sobre si las máquinas pueden pensar, formulado mediante un test por Turing', 'computacional', 'filosofia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Filósofo cínico que rechazaba toda propiedad y convención, viviendo en la pobreza extrema como forma de libertad', 'diogenes', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Proceso neoplatónico por el cual la realidad fluye gradualmente desde el Uno hacia niveles inferiores de ser', 'emanacion', 'filosofia', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Criterio epistemológico del positivismo lógico que exige poder refutar una hipótesis para considerarla científica', 'falsabilidad', 'filosofia', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Rama de la filosofía de la mente que estudia la relación entre los procesos cerebrales y la experiencia consciente', 'neurociencia', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Concepto escolástico que designa las cinco pruebas racionales de la existencia de Dios propuestas por Tomás de Aquino', 'pruebascosmologicas', 'filosofia', 'bachillerato', '{1}', 2),

-- FILOSOFÍA BACH 2: 4 más (71→75)
('C', 'empieza', 'Frase orteguiana que expresa que el individuo es inseparable de su entorno: "yo soy yo y mi..."', 'circunstancia', 'filosofia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Concepto de la ética discursiva que exige que las normas morales se justifiquen mediante argumentación racional entre iguales', 'eticadiscursiva', 'filosofia', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Filósofo coreano-alemán autor de La sociedad del cansancio que critica el rendimiento como nueva forma de explotación', 'byungchulhan', 'filosofia', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Concepto marxista referido al proceso de acumulación originaria del capital mediante la expropiación de los campesinos', 'latifundismo', 'filosofia', 'bachillerato', '{2}', 3);
-- Rosco Bachillerato: Lengua y Filosofía (lote 3 - 600 preguntas adicionales)
-- 150 preguntas por cada combinación subject_id + grades
-- Vocabulario diferenciado de lotes anteriores

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- ============================================================
-- LENGUA - BACHILLERATO 1 (grades={1}) — 150 preguntas
-- Siglo de Oro, gramática avanzada, variedades, textos
-- ============================================================

-- A
('A', 'empieza', 'Figura retórica que consiste en la repetición de una o varias palabras al comienzo de versos o enunciados sucesivos', 'anafora', 'lengua', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Elemento gramatical que complementa al sujeto o al complemento directo a través del verbo, funcionando como complemento predicativo', 'atributo', 'lengua', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Construcción sintáctica en la que un sustantivo o grupo nominal se yuxtapone a otro para explicarlo o especificarlo', 'aposicion', 'lengua', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Obra picaresca anónima de 1554 que narra la vida de un mozo al servicio de varios amos en la España imperial', 'anonima', 'lengua', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Tipo de subordinada adverbial impropia que expresa una condición no cumplida en el pasado, con subjuntivo pluscuamperfecto', 'adversativa', 'lengua', 'bachillerato', '{1}', 3),
('A', 'empieza', 'Auto sacramental de Calderón que alegoriza el paso de la vida humana como representación teatral divina', 'auto', 'lengua', 'bachillerato', '{1}', 1),

-- B
('B', 'empieza', 'Poeta del Siglo de Oro que escribió sonetos burlescos y fue rival literario de Góngora en una célebre polémica', 'burguillos', 'lengua', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Tipo de texto que utiliza un registro formal, terminología especializada y estructura argumentativa propia del ámbito forense', 'burocratico', 'lengua', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Novela picaresca de Quevedo cuyo protagonista, Pablos, narra sus desventuras como mozo de muchos amos', 'buscon', 'lengua', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Estilo literario del siglo XVII caracterizado por la densidad conceptual, los juegos de ingenio y la agudeza verbal', 'barroco', 'lengua', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Recurso expresivo consistente en exagerar rebajando, propio de la sátira quevediana y del estilo jocoso áureo', 'burlesco', 'lengua', 'bachillerato', '{1}', 2),

-- C
('C', 'empieza', 'Función sintáctica desempeñada por un adjetivo o participio que complementa simultáneamente al verbo y a un nombre', 'complemento', 'lengua', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Obra dramática de Calderón en la que Segismundo reflexiona sobre la libertad y el destino desde su encierro', 'cautivo', 'lengua', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Tipo de oración subordinada adverbial impropia que expresa un obstáculo que no impide la acción principal', 'concesiva', 'lengua', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Variedad funcional de la lengua determinada por la situación comunicativa, el tema y la relación entre hablantes', 'contextual', 'lengua', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Dramaturgo del Siglo de Oro autor de La vida es sueño y El alcalde de Zalamea', 'calderon', 'lengua', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Fenómeno semántico por el cual una palabra restringe su significado original a uno más específico con el tiempo', 'connotacion', 'lengua', 'bachillerato', '{1}', 2),

-- D
('D', 'empieza', 'Fenómeno lingüístico por el cual elementos del texto remiten a la realidad extralingüística del contexto comunicativo', 'deixis', 'lengua', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Variedad geográfica del español que presenta rasgos fonéticos como el seseo, el ceceo o la aspiración de la s', 'dialecto', 'lengua', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Tipo de texto jurídico que recoge una resolución judicial motivada dictada por un tribunal', 'dictamen', 'lengua', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Recurso retórico del Barroco consistente en presentar la realidad como falsa apariencia o ilusión engañosa', 'desengano', 'lengua', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Parte de la semántica léxica que estudia el significado de las palabras registrado en los repertorios lexicográficos', 'denotacion', 'lengua', 'bachillerato', '{1}', 1),

-- E
('E', 'empieza', 'Tipo de texto periodístico argumentativo firmado que expresa la opinión del autor sobre un tema de actualidad', 'editorial', 'lengua', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Subgénero de la literatura ascética y mística que describe las fases del alma en su unión con Dios', 'extasis', 'lengua', 'bachillerato', '{1}', 3),
('E', 'empieza', 'Obra poética de San Juan de la Cruz que describe simbólicamente la salida del alma en la noche oscura', 'espiritual', 'lengua', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Proceso semántico por el cual una palabra amplía su significado original abarcando más referentes', 'extension', 'lengua', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Tipo de registro lingüístico empleado en textos científicos con precisión terminológica y objetividad', 'especializado', 'lengua', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Composición poética de Garcilaso en que el pastor Salicio lamenta el desdén y Nemoroso llora la muerte', 'egloga', 'lengua', 'bachillerato', '{1}', 1),

-- F
('F', 'empieza', 'Tipo de texto científico que presenta resultados experimentales con una estructura estandarizada de secciones', 'formato', 'lengua', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Obra de Lope de Vega en la que un pueblo entero asume la culpa del asesinato del comendador tiránico', 'fuenteovejuna', 'lengua', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Recurso estilístico que consiste en alterar deliberadamente el orden lógico de los elementos oracionales', 'frontalidad', 'lengua', 'bachillerato', '{1}', 3),
('F', 'empieza', 'Variedad del español peninsular caracterizada por la distinción entre s y z y la pronunciación de la d final', 'fonetica', 'lengua', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Autor de la comedia de enredo El perro del hortelano y de la tragedia El caballero de Olmedo', 'felix', 'lengua', 'bachillerato', '{1}', 2),

-- G
('G', 'empieza', 'Poeta cordobés del Barroco creador del culteranismo, famoso por las Soledades y la Fábula de Polifemo', 'gongora', 'lengua', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Novela picaresca de Mateo Alemán que presenta la vida del pícaro sevillano en tono moralizante', 'guzman', 'lengua', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Tipo de variedad lingüística determinada por el grupo social al que pertenece el hablante', 'geolecto', 'lengua', 'bachillerato', '{1}', 3),
('G', 'empieza', 'Subgénero teatral del Siglo de Oro de tono cómico que se representaba entre los actos de la comedia principal', 'gracioso', 'lengua', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Poeta renacentista toledano que introdujo el soneto petrarquista y la lira en la poesía castellana', 'garcilaso', 'lengua', 'bachillerato', '{1}', 1),

-- H
('H', 'empieza', 'Recurso retórico consistente en exagerar los rasgos de algo para producir un efecto expresivo intensificado', 'hiperbole', 'lengua', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Tipo de relación semántica en la que el significado de un término está incluido en otro más general', 'hiponimia', 'lengua', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Cambio de orden sintáctico que antepone un elemento al verbo para ponerlo de relieve o topicalizarlo', 'hiperbaton', 'lengua', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Composición dramática de Calderón de la Barca en la que el honor del marido se convierte en obsesión trágica', 'honra', 'lengua', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Registro coloquial caracterizado por la espontaneidad, las muletillas y la función expresiva predominante', 'habla', 'lengua', 'bachillerato', '{1}', 1),

-- I
('I', 'empieza', 'Tipo de oración subordinada adverbial que presenta una alternativa entre dos posibilidades excluyentes', 'ilativa', 'lengua', 'bachillerato', '{1}', 3),
('I', 'empieza', 'Recurso literario que consiste en expresar lo contrario de lo que se quiere dar a entender', 'ironia', 'lengua', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Conjunto de rasgos lingüísticos propios de un hablante individual que lo distinguen de otros de su comunidad', 'idiolecto', 'lengua', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Época áurea de la literatura española que abarca los siglos XVI y XVII con autores como Cervantes y Quevedo', 'imperial', 'lengua', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Texto periodístico basado en la investigación profunda de hechos con múltiples fuentes verificadas', 'investigacion', 'lengua', 'bachillerato', '{1}', 1),

-- J
('J', 'empieza', 'Tipo de texto del ámbito legal que emplea un lenguaje formulario, arcaísmos y construcciones nominales complejas', 'juridico', 'lengua', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Género dramático breve del Siglo de Oro de carácter cómico popular representado en plazas y corrales', 'jocoso', 'lengua', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Poeta místico carmelita autor de Cántico espiritual, Noche oscura y Llama de amor viva', 'juan', 'lengua', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Recurso semántico propio del Barroco basado en el doble sentido humorístico de las palabras', 'juego', 'lengua', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Forma estrófica de arte menor usada en villancicos y canciones populares del Renacimiento temprano', 'jarcha', 'lengua', 'bachillerato', '{1}', 2),

-- K
('K', 'contiene', 'Fenómeno fonético del español de América por el que la ese final de sílaba se aspira o se pierde', 'weakening', 'lengua', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Texto periodístico de formato breve destinado a dar una información de forma inmediata y concisa', 'breaking', 'lengua', 'bachillerato', '{1}', 3),

-- L
('L', 'empieza', 'Estrofa de cinco versos combinando heptasílabos y endecasílabos, introducida por Garcilaso en la poesía española', 'lira', 'lengua', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Protagonista de la primera novela picaresca española, mozo de ciego que aprende a sobrevivir con astucia', 'lazarillo', 'lengua', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Disciplina de la semántica que estudia el significado de las unidades léxicas y sus relaciones', 'lexicologia', 'lengua', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Variedad diastrática del español usada por hablantes con bajo nivel de instrucción, con rasgos como vulgarismos', 'lenguaje', 'lengua', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Comedia de Lope de Vega donde Diana oscila entre el amor y el orgullo por su secretario Teodoro', 'lope', 'lengua', 'bachillerato', '{1}', 1),

-- M
('M', 'empieza', 'Corriente espiritual del siglo XVI que busca la unión directa del alma con Dios mediante la contemplación', 'mistica', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Recurso lingüístico textual que refleja la actitud del hablante ante el enunciado mediante adverbios y verbos modales', 'modalizacion', 'lengua', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Figura retórica que establece una identificación directa entre dos realidades sin nexo comparativo', 'metafora', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Tipo de texto que combina códigos verbales y no verbales como infografías, anuncios o páginas web', 'multimodal', 'lengua', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Dramaturgo del Siglo de Oro creador del personaje de Don Juan en El burlador de Sevilla', 'molina', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Variedad diatópica del español hablada en zonas de contacto con el catalán, gallego o vasco', 'modalidad', 'lengua', 'bachillerato', '{1}', 2),

-- N
('N', 'empieza', 'Tipo de texto periodístico que relata hechos de actualidad de forma objetiva siguiendo la estructura de pirámide invertida', 'noticia', 'lengua', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Técnica narrativa del Lazarillo en la que el protagonista adulto cuenta su vida retrospectivamente', 'narracion', 'lengua', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Proceso de formación de palabras en español mediante sufijos que convierten adjetivos o verbos en sustantivos', 'nominalizacion', 'lengua', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Subgénero de la literatura del XVI que presenta una visión idealizada del mundo pastoril y bucólico', 'novela', 'lengua', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Registro lingüístico estándar que sigue las normas académicas y se emplea en contextos formales', 'norma', 'lengua', 'bachillerato', '{1}', 1),

-- Ñ
('Ñ', 'contiene', 'Texto de Fray Luis de León que reflexiona sobre la vida retirada y el ansia de conocimiento en la noche serena', 'ensonacion', 'lengua', 'bachillerato', '{1}', 2),
('Ñ', 'contiene', 'Recurso estilístico barroco de Quevedo que consiste en retratar con crueldad y sarcasmo los defectos ajenos', 'punalada', 'lengua', 'bachillerato', '{1}', 3),

-- O
('O', 'empieza', 'Tipo de subordinada que cumple la función de complemento directo, sujeto o atributo dentro de la principal', 'oracion', 'lengua', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Composición lírica de tono elevado dedicada a exaltar personas, ideas o sentimientos sublimes', 'oda', 'lengua', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Figura retórica que reproduce sonidos del mundo real mediante la selección de determinados fonemas', 'onomatopeya', 'lengua', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Fenómeno semántico por el que dos palabras tienen significados opuestos o contradictorios', 'oposicion', 'lengua', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Estrofa de ocho versos endecasílabos con rima consonante ABABABCC usada en poesía narrativa renacentista', 'octava', 'lengua', 'bachillerato', '{1}', 2),

-- P
('P', 'empieza', 'Género novelístico del XVI que narra en primera persona las peripecias de un personaje de baja extracción social', 'picaresca', 'lengua', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Función sintáctica del adjetivo que modifica simultáneamente al verbo y al sujeto o complemento directo', 'predicativo', 'lengua', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Fenómeno textual por el que se incorporan voces ajenas en el propio discurso mediante citas o discurso referido', 'polifonia', 'lengua', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Tipo de texto argumentativo oral preparado para defender una postura ante un público en un debate formal', 'ponencia', 'lengua', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Estilo literario del Barroco cultivado por Quevedo basado en la asociación ingeniosa de conceptos y la brevedad', 'petrarquismo', 'lengua', 'bachillerato', '{1}', 3),

-- Q
('Q', 'empieza', 'Escritor barroco autor de Los sueños, El Buscón y poesía satírica contra Góngora', 'quevedo', 'lengua', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Lamento amoroso expresado en forma de endechas o coplas en la poesía renacentista y barroca', 'queja', 'lengua', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Estructura retórica del discurso argumentativo que presenta una serie de preguntas sin respuesta esperada', 'quiasmo', 'lengua', 'bachillerato', '{1}', 3),

-- R
('R', 'empieza', 'Nivel de uso de la lengua determinado por la situación comunicativa, que puede ser formal, coloquial o vulgar', 'registro', 'lengua', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Movimiento cultural del siglo XVI que recupera los modelos clásicos grecolatinos y sitúa al hombre como centro', 'renacimiento', 'lengua', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Elemento de cohesión textual que sustituye un término ya mencionado para evitar la repetición', 'referencia', 'lengua', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Tipo de texto periodístico que combina información y valoración personal sobre un acontecimiento presenciado', 'reportaje', 'lengua', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Estrofa de once sílabas con esquema métrico fijo usada ampliamente en la poesía del Siglo de Oro', 'redondilla', 'lengua', 'bachillerato', '{1}', 2),

-- S
('S', 'empieza', 'Composición poética de catorce versos endecasílabos distribuidos en dos cuartetos y dos tercetos', 'soneto', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Variedad del español de América caracterizada por el seseo, el voseo y el uso de ustedes como plural de tú', 'sudamericano', 'lengua', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Relación semántica entre palabras que comparten un mismo significado o significados muy próximos', 'sinonimia', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Rama de la lingüística que estudia el significado de las palabras, oraciones y textos', 'semantica', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Escritora mística abulense que narró su experiencia espiritual en obras como Las Moradas o Camino de perfección', 'santa', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Tipo de oración compuesta por subordinación en la que una proposición depende sintácticamente de la otra', 'subordinada', 'lengua', 'bachillerato', '{1}', 1),

-- T
('T', 'empieza', 'Dramaturgo del Siglo de Oro creador de El burlador de Sevilla y El condenado por desconfiado', 'tirso', 'lengua', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Propiedad textual que da sentido global y unitario al texto mediante la progresión de la información', 'tema', 'lengua', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Tipo de argumento basado en la autoridad de un experto o de una fuente reconocida para reforzar la tesis', 'testimonio', 'lengua', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Recurso de cohesión textual que organiza el texto mediante conectores de orden, causa y consecuencia', 'textualizacion', 'lengua', 'bachillerato', '{1}', 3),
('T', 'empieza', 'Escritora del siglo XVI autora del Libro de la vida y fundadora de conventos carmelitas reformados', 'teresa', 'lengua', 'bachillerato', '{1}', 1),

-- U
('U', 'empieza', 'Fenómeno pragmático del lenguaje relacionado con los actos de habla y la intención comunicativa del emisor', 'uso', 'lengua', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Rasgo del español americano consistente en el empleo de ustedes en lugar de vosotros para la segunda persona plural', 'ustedeo', 'lengua', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Propiedad del texto que garantiza que todas las ideas están conectadas y contribuyen al tema central', 'unidad', 'lengua', 'bachillerato', '{1}', 1),

-- V
('V', 'empieza', 'Diversidad de formas que adopta una lengua según factores geográficos, sociales y situacionales', 'variedad', 'lengua', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Registro de uso informal de la lengua que incluye vulgarismos, incorrecciones y expresiones malsonantes', 'vulgar', 'lengua', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Composición estrófica breve de origen popular con estribillo, muy cultivada en el Renacimiento y el Barroco', 'villancico', 'lengua', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Poeta renacentista amigo de Garcilaso que continuó su obra y publicó sus versos junto a los propios en 1543', 'valdes', 'lengua', 'bachillerato', '{1}', 3),

-- W
('W', 'contiene', 'Fenómeno lingüístico del español americano que incluye préstamos del inglés en el habla cotidiana', 'anglicismo', 'lengua', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Modalidad del español en contacto con lenguas indígenas que presenta calcos sintácticos y léxicos', 'bilingue', 'lengua', 'bachillerato', '{1}', 3),

-- X
('X', 'contiene', 'Propiedad de los textos científicos que consiste en la formulación precisa sin ambigüedades ni vaguedades', 'exactitud', 'lengua', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Figura retórica barroca que presenta una contradicción aparente uniendo dos términos opuestos en un sintagma', 'oximoron', 'lengua', 'bachillerato', '{1}', 2),

-- Y
('Y', 'contiene', 'Procedimiento sintáctico que une proposiciones sin nexo mediante pausas, propio del estilo asindético', 'yuxtaposicion', 'lengua', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Fenómeno fonético del español rioplatense que convierte el sonido de la elle y la ye en un sonido rehilado', 'yeismo', 'lengua', 'bachillerato', '{1}', 2),

-- Z
('Z', 'contiene', 'Obra de Calderón en la que Pedro Crespo, alcalde de un pueblo extremeño, hace justicia contra un capitán', 'zalamea', 'lengua', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Pieza teatral breve y cómica del entremés barroco que caricaturiza costumbres y tipos sociales', 'entremez', 'lengua', 'bachillerato', '{1}', 3),

-- ============================================================
-- LENGUA - BACHILLERATO 2 (grades={2}) — 150 preguntas
-- Siglo XIX, XX, narrativa actual, lingüística del texto
-- ============================================================

-- A
('A', 'empieza', 'Escritor romántico autor de artículos de costumbres como Vuelva usted mañana y El castellano viejo', 'articulo', 'lengua', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Novela de Leopoldo Alas que retrata la sociedad de Vetusta y la crisis moral de la protagonista Ana Ozores', 'alas', 'lengua', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Procedimiento lingüístico textual que señala elementos del contexto situacional mediante pronombres o adverbios', 'anafora', 'lengua', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Novela de Camilo José Cela que narra las andanzas de Pascual Duarte como precursora del tremendismo', 'autobiografia', 'lengua', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Movimiento poético de los años 50 que denuncia la injusticia social con lenguaje directo y comprometido', 'arraigada', 'lengua', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Propiedad del texto que lo hace pertinente y relevante para la situación comunicativa en que se produce', 'adecuacion', 'lengua', 'bachillerato', '{2}', 1),

-- B
('B', 'empieza', 'Poeta romántico sevillano autor de las Rimas y las Leyendas, máximo representante del romanticismo intimista', 'becquer', 'lengua', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Poeta de la generación de los 50 autor de Las personas del verbo y Moralidades, maestro de la ironía', 'biedma', 'lengua', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Novelista gallega del siglo XIX defensora del naturalismo y autora de Los pazos de Ulloa y La tribuna', 'bazan', 'lengua', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Generación literaria que renovó la narrativa española tras 1975 con autores como Muñoz Molina y Marías', 'boom', 'lengua', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Novela de Galdós que retrata el ascenso social de una joven madrileña en el contexto de la Restauración', 'bringas', 'lengua', 'bachillerato', '{2}', 3),

-- C
('C', 'empieza', 'Novelista de posguerra autor de La familia de Pascual Duarte y La colmena, premio Nobel en 1989', 'cela', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Propiedad textual que garantiza la conexión lógica y gramatical entre las partes de un texto', 'coherencia', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Poeta social de posguerra autor de Cantos iberos que defendió la poesía como instrumento de transformación', 'celaya', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Propiedad textual que se manifiesta en los mecanismos lingüísticos de conexión entre oraciones y párrafos', 'cohesion', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Novela de Clarín cuyo título real es La Regenta y transcurre en una ciudad que representa a Oviedo', 'clarin', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Tipo de texto que analiza una obra literaria identificando tema, estructura, recursos estilísticos y contexto', 'comentario', 'lengua', 'bachillerato', '{2}', 1),

-- D
('D', 'empieza', 'Novelista de posguerra autor de El camino, Cinco horas con Mario y Los santos inocentes', 'delibes', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Tipo de referencia textual que remite a un elemento mencionado posteriormente en el texto', 'deixis', 'lengua', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Movimiento literario del siglo XIX que retrata la realidad contemporánea de manera minuciosa y verosímil', 'determinismo', 'lengua', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Tipo de discurso referido que reproduce las palabras de otro hablante sin marcas gráficas de cita', 'directo', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Poeta nicaragüense fundador del modernismo hispanoamericano autor de Azul y Cantos de vida y esperanza', 'dario', 'lengua', 'bachillerato', '{2}', 1),

-- E
('E', 'empieza', 'Tipo de texto argumentativo de extensión breve que defiende una tesis con argumentos razonados sobre un tema', 'ensayo', 'lengua', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Técnica narrativa de posguerra que presenta los pensamientos de un personaje sin orden lógico ni intervención del narrador', 'estilo', 'lengua', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Poeta de la generación del 27 autor de La destrucción o el amor, premio Nobel de Literatura en 1977', 'estremecimiento', 'lengua', 'bachillerato', '{2}', 3),
('E', 'empieza', 'Procedimiento lingüístico que consiste en suavizar una expresión desagradable o tabú', 'eufemismo', 'lengua', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Corriente narrativa de los años 60 que experimentó con la estructura, el punto de vista y el lenguaje novelístico', 'experimental', 'lengua', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Movimiento poético de la generación de los 70 caracterizado por el culturalismo y la influencia de los mass media', 'esteticismo', 'lengua', 'bachillerato', '{2}', 2),

-- F
('F', 'empieza', 'Novela de Galdós que narra la historia de una mujer que se autodestruye por su idealismo místico exaltado', 'fortunata', 'lengua', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Género periodístico de opinión que consiste en una columna breve firmada por un colaborador habitual del diario', 'firma', 'lengua', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Tipo de función del lenguaje centrada en la forma del mensaje, predominante en el discurso literario', 'fatica', 'lengua', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Noción pragmática referida a los presupuestos e implicaturas que el receptor debe inferir del texto', 'fuerza', 'lengua', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Recurso de cohesión textual que consiste en reemplazar un elemento léxico por otro equivalente para evitar repeticiones', 'focalizacion', 'lengua', 'bachillerato', '{2}', 2),

-- G
('G', 'empieza', 'Novelista canario del siglo XIX autor de Fortunata y Jacinta, Misericordia y los Episodios Nacionales', 'galdos', 'lengua', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Corriente literaria del 98 preocupada por el problema de España, la identidad y el paisaje castellano', 'generacion', 'lengua', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Poeta de la generación del 27 autor del Romancero gitano y Poeta en Nueva York, asesinado en 1936', 'garcia', 'lengua', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Poeta de los novísimos autor de Arde el mar, representante del culturalismo y la experimentación vanguardista', 'gimferrer', 'lengua', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Tipo de argumento que se basa en un caso concreto para extraer una conclusión de alcance general', 'generalizacion', 'lengua', 'bachillerato', '{2}', 2),

-- H
('H', 'empieza', 'Poeta modernista autor de Platero y yo y Diario de un poeta recién casado, premio Nobel en 1956', 'herrera', 'lengua', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Poeta del 27 autor de El rayo que no cesa y Viento del pueblo, muerto en prisión en 1942', 'hernandez', 'lengua', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Relación semántica que se establece entre una palabra de significado general y otras de significado más específico', 'hiperonimia', 'lengua', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Concepto de lingüística textual referido al conocimiento compartido entre emisor y receptor necesario para interpretar el texto', 'horizonte', 'lengua', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Tipo de discurso narrativo que mezcla la voz del narrador con el pensamiento del personaje sin marcas claras', 'hibrido', 'lengua', 'bachillerato', '{2}', 2),

-- I
('I', 'empieza', 'Concepto pragmático referido a la información que se sobreentiende de un enunciado sin ser expresada explícitamente', 'implicatura', 'lengua', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Noción textual que indica que todo texto responde a una intención del emisor que determina su estructura', 'intencion', 'lengua', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Recurso retórico frecuente en la poesía social que repite estructuras para crear un efecto rítmico acumulativo', 'iteracion', 'lengua', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Movimiento estético del modernismo hispanoamericano que buscaba la belleza formal con imágenes sensoriales refinadas', 'impresionismo', 'lengua', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Tipo de discurso referido que transmite las palabras de otro adaptando los tiempos verbales y los deícticos', 'indirecto', 'lengua', 'bachillerato', '{2}', 1),

-- J
('J', 'empieza', 'Poeta de Moguer autor de Platero y yo que buscó la poesía pura y esencial a lo largo de su obra', 'jimenez', 'lengua', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Fenómeno sociolingüístico de la variedad juvenil que crea neologismos, acortamientos y expresiones propias', 'jerga', 'lengua', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Escritor del 98 que reflexionó sobre la identidad española en novelas como La voluntad y Antonio Azorín', 'juventud', 'lengua', 'bachillerato', '{2}', 3),

-- K
('K', 'contiene', 'Escritor checo cuya influencia se percibe en la novela existencialista española de posguerra como Nada de Laforet', 'kafka', 'lengua', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Corriente narrativa de los años 70 que regresa a la trama, el argumento y la legibilidad tras la experimentación', 'rookies', 'lengua', 'bachillerato', '{2}', 3),

-- L
('L', 'empieza', 'Escritor romántico madrileño famoso por sus artículos periodísticos satíricos y su trágico final en 1837', 'larra', 'lengua', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Fenómeno lingüístico textual que usa expresiones deícticas para remitir al espacio y tiempo de la enunciación', 'localizacion', 'lengua', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Novelista de posguerra autora de Nada, novela existencial ambientada en la Barcelona de los años 40', 'laforet', 'lengua', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Propiedad textual que se manifiesta cuando los elementos lingüísticos de un texto están conectados formalmente', 'ligadura', 'lengua', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Poeta del 27 conocido como el poeta de Orihuela, autor de sonetos amorosos y poesía de guerra comprometida', 'lirica', 'lengua', 'bachillerato', '{2}', 2),

-- M
('M', 'empieza', 'Novelista español autor de Tiempo de silencio, obra que revolucionó la narrativa de posguerra con su experimentalismo', 'martin', 'lengua', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Recurso lingüístico textual que expresa la actitud del hablante ante lo que dice mediante marcas lingüísticas', 'modalizacion', 'lengua', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Corriente literaria de finales del XIX que busca la renovación estética con exotismo, musicalidad y riqueza sensorial', 'modernismo', 'lengua', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Novelista contemporáneo autor de El jinete polaco y Plenilunio, representante de la narrativa española actual', 'munoz', 'lengua', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Novela de Galdós que retrata la caridad cristiana a través de la figura de Benigna en el Madrid pobre', 'misericordia', 'lengua', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Mecanismo textual que permite la progresión de la información alternando datos conocidos y datos nuevos', 'marca', 'lengua', 'bachillerato', '{2}', 2),

-- N
('N', 'empieza', 'Corriente literaria del siglo XIX que lleva el realismo al extremo aplicando el método científico a la novela', 'naturalismo', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Grupo poético de los años 70 también llamado generación del lenguaje, que incluye a Gimferrer, Carnero y Colinas', 'novisimos', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Novela de Carmen Laforet ambientada en Barcelona que refleja la desorientación vital de la protagonista Andrea', 'nada', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Tipo de texto que relata hechos reales o ficticios organizados en una secuencia temporal con narrador y personajes', 'narrativo', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Corriente de la novela de posguerra que presenta una visión objetiva de la realidad sin intervención del autor', 'neorrealismo', 'lengua', 'bachillerato', '{2}', 2),

-- Ñ
('Ñ', 'contiene', 'Recurso retórico de los artículos de Larra que caricaturiza costumbres y tipos sociales del Madrid decimonónico', 'espanolada', 'lengua', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Tipo de narrador de novelas como Cinco horas con Mario que reproduce el pensamiento del personaje como un monólogo', 'ensonacion', 'lengua', 'bachillerato', '{2}', 3),

-- O
('O', 'empieza', 'Poeta social de posguerra autor de Pido la paz y la palabra y Ancia, que reclamó justicia y dignidad', 'otero', 'lengua', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Técnica narrativa de la novela social de los 50 que registra los diálogos sin comentarios del narrador', 'objetivismo', 'lengua', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Tipo de argumento que refuta la tesis contraria mostrando sus debilidades lógicas o factuales', 'objecion', 'lengua', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Novela de Galdós que forma parte de la serie Novelas contemporáneas y retrata la sociedad madrileña', 'orbajosa', 'lengua', 'bachillerato', '{2}', 3),

-- P
('P', 'empieza', 'Escritora gallega del XIX que introdujo el naturalismo en España con obras como Los pazos de Ulloa', 'pardo', 'lengua', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Noción pragmática referida al contenido implícito que se da por sabido y compartido entre los interlocutores', 'presuposicion', 'lengua', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Tipo de poesía que subordina la forma al mensaje social y busca llegar al mayor número de lectores', 'protesta', 'lengua', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Mecanismo de cohesión textual que avanza la información combinando tema conocido y rema nuevo en cada oración', 'progresion', 'lengua', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Concepto lingüístico referido a la incorporación de múltiples voces y puntos de vista en un mismo texto', 'polifonia', 'lengua', 'bachillerato', '{2}', 2),

-- Q
('Q', 'empieza', 'Concepto retórico clásico aplicado en la argumentación que busca convencer apelando a la lógica y la razón', 'quintiliano', 'lengua', 'bachillerato', '{2}', 3),
('Q', 'empieza', 'Actitud del poeta romántico que manifiesta insatisfacción ante la realidad y busca un ideal inalcanzable', 'queja', 'lengua', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Estructura retórica cruzada del tipo AB-BA usada tanto en poesía como en prosa argumentativa', 'quiasmo', 'lengua', 'bachillerato', '{2}', 2),

-- R
('R', 'empieza', 'Movimiento literario del XIX que exalta la libertad, el individualismo, los sentimientos y la naturaleza salvaje', 'romanticismo', 'lengua', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Poetisa gallega del XIX autora de Cantares gallegos y Follas novas, voz del Rexurdimento literario', 'rosalia', 'lengua', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Corriente novelística del siglo XIX que retrata la sociedad contemporánea con verosimilitud y análisis psicológico', 'realismo', 'lengua', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Parte de la información textual que aporta contenido nuevo y avanza el conocimiento del receptor', 'rema', 'lengua', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Texto periodístico extenso que investiga un tema en profundidad combinando información, testimonios y análisis', 'reportaje', 'lengua', 'bachillerato', '{2}', 1),

-- S
('S', 'empieza', 'Novela de Cela que presenta un mosaico de personajes en el Madrid de posguerra sin protagonista definido', 'sainete', 'lengua', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Mecanismo de cohesión que reemplaza un elemento por un pronombre, un sinónimo o una elipsis para evitar repetición', 'sustitucion', 'lengua', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Corriente poética de los años 50 comprometida con la denuncia de la injusticia, cultivada por Otero y Celaya', 'social', 'lengua', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Poeta del 27 autor de La voz a ti debida y Razón de amor, que renovó la poesía amorosa española', 'salinas', 'lengua', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Fenómeno pragmático que permite inferir información no dicha a partir del contexto y del conocimiento compartido', 'sobreentendido', 'lengua', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Corriente narrativa española de la segunda mitad del XX que refleja objetivamente la vida cotidiana de las clases populares', 'social', 'lengua', 'bachillerato', '{2}', 1),

-- T
('T', 'empieza', 'Corriente novelística de posguerra que exagera los aspectos más crudos y violentos de la realidad española', 'tremendismo', 'lengua', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Parte de la información textual ya conocida o compartida que sirve de punto de partida del enunciado', 'topico', 'lengua', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Tipo de argumento retórico que busca conmover emocionalmente al receptor para persuadirlo', 'topica', 'lengua', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Disciplina lingüística que estudia la estructura, las propiedades y el funcionamiento de los textos como unidades comunicativas', 'textual', 'lengua', 'bachillerato', '{2}', 1),

-- U
('U', 'empieza', 'Escritor vasco del 98 autor de Niebla y San Manuel Bueno, mártir, obsesionado por la inmortalidad y la fe', 'unamuno', 'lengua', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Concepto semántico que define la menor unidad con significado completo dentro de una lengua', 'unidad', 'lengua', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Fenómeno discursivo de las columnas periodísticas en las que el autor emplea un estilo personal reconocible', 'ubicuidad', 'lengua', 'bachillerato', '{2}', 3),

-- V
('V', 'empieza', 'Poeta del 98 autor de Campos de Castilla, que reflexionó sobre España y el paisaje castellano', 'valle', 'lengua', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Escritor del 98 autor de las Sonatas y los esperpentos, creador de un estilo teatral deformante y grotesco', 'valleinclan', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Tipo de variación lingüística asociada a la edad, el sexo o el nivel sociocultural del hablante', 'variacion', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Recurso retórico de las Rimas de Bécquer que presenta la poesía como expresión espontánea del sentimiento', 'vaguedad', 'lengua', 'bachillerato', '{2}', 3),

-- W
('W', 'contiene', 'Fenómeno de la narrativa actual que mezcla recursos de la novela con técnicas audiovisuales y digitales', 'transmedia', 'lengua', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Influencia de la literatura anglosajona en la narrativa española de posguerra, especialmente la técnica del flujo de conciencia', 'faulkneriano', 'lengua', 'bachillerato', '{2}', 3),

-- X
('X', 'contiene', 'Novela de posguerra de Martín-Santos que emplea un lenguaje complejo y técnicas experimentales en el Madrid de los 40', 'existencial', 'lengua', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Movimiento cultural que reacciona contra la razón ilustrada exaltando la pasión, la libertad y lo inexplicable', 'heterodoxia', 'lengua', 'bachillerato', '{2}', 3),

-- Y
('Y', 'contiene', 'Tipo de enlace textual que une proposiciones coordinadas mediante la simple coma o el punto y coma sin conjunción', 'yuxtaposicion', 'lengua', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Recurso estilístico de la poesía de Bécquer que crea una atmósfera de misterio con imágenes oníricas y simbólicas', 'ensayismo', 'lengua', 'bachillerato', '{2}', 3),

-- Z
('Z', 'contiene', 'Dramaturgo del 98 autor de Luces de bohemia donde Max Estrella deambula por un Madrid esperpéntico', 'esperpentico', 'lengua', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Tipo de novela de posguerra que denuncia las duras condiciones de vida en la España rural del franquismo', 'naturaleza', 'lengua', 'bachillerato', '{2}', 2),

-- ============================================================
-- FILOSOFÍA - BACHILLERATO 1 (grades={1}) — 150 preguntas
-- Presocráticos, helenísticas, patrística, escolástica, moderna, contemporánea
-- ============================================================

-- A
('A', 'empieza', 'Filósofo presocrático de Mileto que propuso el aire como principio originario de todas las cosas', 'anaximenes', 'filosofia', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Filósofo presocrático que introdujo el concepto de nous o mente ordenadora del cosmos', 'anaxagoras', 'filosofia', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Padre de la Iglesia autor de Confesiones y La ciudad de Dios que fusionó cristianismo y neoplatonismo', 'agustin', 'filosofia', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Corriente ética que busca la ausencia de perturbación del alma como estado ideal del sabio', 'ataraxia', 'filosofia', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Concepto aristotélico que designa la actualización o perfeccionamiento pleno de una potencialidad', 'acto', 'filosofia', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Disciplina filosófica que estudia los valores, la naturaleza de lo bello y la experiencia estética', 'axiologia', 'filosofia', 'bachillerato', '{1}', 2),

-- B
('B', 'empieza', 'Filósofo inglés padre del empirismo moderno que propuso el método inductivo en el Novum Organum', 'bacon', 'filosofia', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Filósofo utilitarista que formuló el principio de la mayor felicidad para el mayor número posible', 'bentham', 'filosofia', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Obispo empirista irlandés que negó la existencia de la materia independiente de la percepción', 'berkeley', 'filosofia', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Rama de la ética aplicada que examina los dilemas morales derivados de los avances en medicina y biología', 'bioetica', 'filosofia', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Concepto de la filosofía antigua que designa la vida buena o la felicidad como fin último de la acción humana', 'bienaventuranza', 'filosofia', 'bachillerato', '{1}', 2),

-- C
('C', 'empieza', 'Filósofo francés fundador del positivismo que propuso la ley de los tres estadios del conocimiento humano', 'comte', 'filosofia', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Concepto estoico que designa el curso necesario e inevitable de los acontecimientos naturales', 'causalidad', 'filosofia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Tipo de conocimiento que Kant denomina juicio formado antes de la experiencia y válido universalmente', 'categorico', 'filosofia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Corriente filosófica antigua fundada por Antístenes y Diógenes que rechazaba las convenciones sociales', 'cinismo', 'filosofia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Método socrático que consiste en hacer preguntas para que el interlocutor descubra la verdad por sí mismo', 'conversacion', 'filosofia', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Doctrina filosófica que sostiene que todo conocimiento procede de la razón sin necesidad de la experiencia', 'cartesianismo', 'filosofia', 'bachillerato', '{1}', 2),

-- D
('D', 'empieza', 'Filósofo griego que propuso una teoría atómica donde todo se compone de partículas indivisibles y vacío', 'democrito', 'filosofia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Concepto filosófico que designa la obligación moral que se impone al sujeto independientemente de las consecuencias', 'deber', 'filosofia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Método filosófico hegeliano basado en la tríada de tesis, antítesis y síntesis', 'dialectica', 'filosofia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Corriente filosófica que sostiene que todo acontecimiento está causalmente determinado por condiciones previas', 'determinismo', 'filosofia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Tipo de razonamiento que parte de premisas generales para llegar a conclusiones particulares necesarias', 'deduccion', 'filosofia', 'bachillerato', '{1}', 1),

-- E
('E', 'empieza', 'Filósofo presocrático siciliano que propuso cuatro raíces o elementos como principio de toda realidad', 'empedocles', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Corriente filosófica antigua fundada en el Jardín de Atenas que identifica el bien con el placer moderado', 'epicureismo', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Doctrina filosófica que sostiene que todo conocimiento se origina en la experiencia sensible', 'empirismo', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Corriente filosófica del siglo XX que sitúa la existencia individual como punto de partida de la reflexión', 'existencialismo', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Escuela filosófica helenística que busca la suspensión del juicio como vía hacia la tranquilidad del alma', 'escepticismo', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Corriente filosófica antigua que identifica la virtud con la moderación y la razón como guía de la conducta', 'estoicismo', 'filosofia', 'bachillerato', '{1}', 1),

-- F
('F', 'empieza', 'Pensador francés del siglo XX que analizó las relaciones entre poder, saber y subjetividad en las instituciones', 'foucault', 'filosofia', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Concepto aristotélico que designa la causa última o propósito al que tiende toda acción o proceso natural', 'finalidad', 'filosofia', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Corriente de la filosofía de la ciencia que sostiene que una teoría es científica solo si es refutable por experiencia', 'falsacionismo', 'filosofia', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Concepto de ética aplicada referido al derecho a decidir libremente sobre el final de la propia vida', 'final', 'filosofia', 'bachillerato', '{1}', 3),
('F', 'empieza', 'Método del conocimiento basado en la observación directa de los hechos como única fuente de certeza, según Bacon', 'factual', 'filosofia', 'bachillerato', '{1}', 2),

-- G
('G', 'empieza', 'Sofista siciliano que defendió el escepticismo radical con su triple tesis sobre el ser, el conocimiento y la comunicación', 'gorgias', 'filosofia', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Concepto kantiano que designa la buena intención como único criterio de valor moral de una acción', 'generalizable', 'filosofia', 'bachillerato', '{1}', 3),
('G', 'empieza', 'Tipo de conocimiento que en la tradición aristotélica se obtiene por abstracción a partir de la experiencia particular', 'genero', 'filosofia', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Corriente de la ética contemporánea que antepone las consecuencias globales a los derechos individuales en dilemas morales', 'global', 'filosofia', 'bachillerato', '{1}', 3),

-- H
('H', 'empieza', 'Filósofo inglés autor del Leviatán que fundamentó el Estado absoluto en un pacto social nacido del miedo', 'hobbes', 'filosofia', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Filósofo escocés que cuestionó la causalidad y redujo el conocimiento a impresiones e ideas de la mente', 'hume', 'filosofia', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Filósofo alemán fundador de la fenomenología que propuso volver a las cosas mismas como método filosófico', 'husserl', 'filosofia', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Corriente cultural del Renacimiento que situó al ser humano como centro de la reflexión filosófica y artística', 'humanismo', 'filosofia', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Filósofo presocrático de Éfeso que propuso el fuego como principio y el cambio constante como ley universal', 'heraclito', 'filosofia', 'bachillerato', '{1}', 1),

-- I
('I', 'empieza', 'Tipo de razonamiento que parte de casos particulares para establecer conclusiones de alcance general o probable', 'induccion', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Concepto kantiano del mandato moral que ordena de forma incondicional, sin depender de fines particulares', 'imperativo', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Concepto platónico referido a las formas perfectas y eternas que constituyen la verdadera realidad', 'idea', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Movimiento intelectual del siglo XVIII que confió en la razón como motor de progreso y emancipación humana', 'ilustracion', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Corriente ética que valora las acciones por sus consecuencias sin considerar normas absolutas previas', 'instrumentalismo', 'filosofia', 'bachillerato', '{1}', 3),

-- J
('J', 'empieza', 'Concepto ético y político referido a la distribución equitativa de bienes y cargas en una sociedad', 'justicia', 'filosofia', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Tipo de proposición lógica que une un sujeto y un predicado y puede ser verdadera o falsa', 'juicio', 'filosofia', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Concepto iusnaturalista que defiende la existencia de derechos previos al Estado basados en la naturaleza humana', 'jusnaturalismo', 'filosofia', 'bachillerato', '{1}', 2),

-- K
('K', 'contiene', 'Filósofo del siglo XX que propuso el criterio de falsabilidad como demarcación entre ciencia y pseudociencia', 'popper', 'filosofia', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Historiador de la ciencia que introdujo el concepto de paradigma y revolución científica', 'kuhn', 'filosofia', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Concepto lockiano que designa el saber que surge del examen racional de las percepciones sensoriales', 'lockiano', 'filosofia', 'bachillerato', '{1}', 3),

-- L
('L', 'empieza', 'Filósofo inglés del XVII que fundamentó los derechos naturales a la vida, la libertad y la propiedad', 'locke', 'filosofia', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Concepto ético que prioriza la obediencia a las normas establecidas independientemente de las consecuencias', 'legalismo', 'filosofia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Estado de naturaleza según Hobbes en el que la vida humana es solitaria, pobre, brutal y breve', 'leviatanismo', 'filosofia', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Corriente de la filosofía del lenguaje según la cual el significado de las palabras está en su uso', 'linguistico', 'filosofia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Tipo de razonamiento formal que estudia las reglas de la inferencia válida y la corrección de los argumentos', 'logica', 'filosofia', 'bachillerato', '{1}', 1),

-- M
('M', 'empieza', 'Pensador florentino del XVI que separó la política de la moral en su obra El Príncipe', 'maquiavelo', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Filósofo utilitarista que distinguió entre placeres superiores e inferiores y defendió la libertad individual', 'mill', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Pensador francés del XVIII que propuso la separación de poderes como garantía contra el despotismo', 'montesquieu', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Rama de la filosofía que estudia la realidad en sus aspectos más generales: el ser, la sustancia, la causa', 'metafisica', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Corriente filosófica que sostiene que toda la realidad es fundamentalmente de naturaleza no física o espiritual', 'monismo', 'filosofia', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Concepto del utilitarismo de Bentham referido al cálculo cuantitativo del placer y el dolor de una acción', 'maximizacion', 'filosofia', 'bachillerato', '{1}', 2),

-- N
('N', 'empieza', 'Concepto filosófico que designa la inexistencia de valores objetivos o de sentido último en la realidad', 'nihilismo', 'filosofia', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Concepto presocrático de Anaxágoras que designa la inteligencia ordenadora del universo', 'nous', 'filosofia', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Concepto filosófico kantiano que designa la realidad tal como es en sí misma, inaccesible al conocimiento', 'noumeno', 'filosofia', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Corriente ética que basa la moral en normas universales obligatorias para todos los seres racionales', 'normativismo', 'filosofia', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Tipo de ley según los iusnaturalistas que emana de la razón humana y es anterior a toda legislación positiva', 'natural', 'filosofia', 'bachillerato', '{1}', 1),

-- Ñ
('Ñ', 'contiene', 'Corriente filosófica medieval que buscó armonizar la fe cristiana con la razón filosófica griega', 'ensenanza', 'filosofia', 'bachillerato', '{1}', 2),
('Ñ', 'contiene', 'Concepto del empirismo británico que niega el conocimiento de realidades que no procedan de la percepción directa', 'empeno', 'filosofia', 'bachillerato', '{1}', 3),

-- O
('O', 'empieza', 'Filósofo escolástico franciscano que defendió el nominalismo y la separación entre fe y razón', 'ockham', 'filosofia', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Rama de la metafísica que estudia el ser en cuanto ser, sus propiedades y categorías fundamentales', 'ontologia', 'filosofia', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Concepto epistemológico que designa la actitud de basar el conocimiento en hechos observables y verificables', 'objetividad', 'filosofia', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Argumento cosmológico que infiere la existencia de un ser necesario a partir de la contingencia de los seres', 'orden', 'filosofia', 'bachillerato', '{1}', 2),

-- P
('P', 'empieza', 'Sofista de Abdera que afirmó que el hombre es la medida de todas las cosas', 'protagoras', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Filósofo del siglo XX que propuso el criterio de falsabilidad frente al verificacionismo del Círculo de Viena', 'popper', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Corriente filosófica que sostiene la existencia de ideas generales como realidades independientes de las cosas', 'platonismo', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Concepto de Kuhn que designa el conjunto de teorías, métodos y valores compartidos por una comunidad científica', 'paradigma', 'filosofia', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Corriente filosófica antigua que enseña la suspensión del juicio como camino a la serenidad mental', 'pirronismo', 'filosofia', 'bachillerato', '{1}', 2),

-- Q
('Q', 'empieza', 'Concepto de la ética de la virtud aristotélica referido al estado intermedio entre el exceso y el defecto', 'quietud', 'filosofia', 'bachillerato', '{1}', 3),
('Q', 'empieza', 'Pregunta que se plantea sobre la existencia de entes que no pertenecen al mundo físico, como los números o las ideas', 'quiddidad', 'filosofia', 'bachillerato', '{1}', 3),

-- R
('R', 'empieza', 'Filósofo ginebrino que formuló la teoría del contrato social y la voluntad general como base de la democracia', 'rousseau', 'filosofia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Corriente filosófica que confía en la razón como fuente principal del conocimiento, frente al empirismo', 'racionalismo', 'filosofia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Concepto de Kuhn que designa el cambio brusco de paradigma en una disciplina científica', 'revolucion', 'filosofia', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Corriente de la ética que juzga la corrección de las acciones por sus resultados o efectos', 'relativismo', 'filosofia', 'bachillerato', '{1}', 2),

-- S
('S', 'empieza', 'Filósofo alemán del XIX que consideró la voluntad ciega e irracional como fuerza motriz del universo', 'schopenhauer', 'filosofia', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Método filosófico socrático de dar a luz la verdad mediante el diálogo interrogativo', 'socratico', 'filosofia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Grupo de pensadores griegos itinerantes que enseñaban retórica y relativizaban la verdad y la moral', 'sofistas', 'filosofia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Concepto filosófico que designa aquello que existe por sí mismo y sirve de soporte a los atributos', 'sustancia', 'filosofia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Tipo de razonamiento formal compuesto por dos premisas y una conclusión necesaria según Aristóteles', 'silogismo', 'filosofia', 'bachillerato', '{1}', 1),

-- T
('T', 'empieza', 'Corriente ética que evalúa las acciones según sus consecuencias respecto al fin o propósito del agente', 'teleologica', 'filosofia', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Concepto aristotélico del paso de la potencia al acto que explica el movimiento y el cambio en la naturaleza', 'transito', 'filosofia', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Filósofo escolástico que elaboró cinco vías para demostrar la existencia de Dios partiendo de la realidad sensible', 'tomas', 'filosofia', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Principio de la filosofía política que defiende la aceptación libre de las normas por parte de los ciudadanos', 'tolerancia', 'filosofia', 'bachillerato', '{1}', 1),

-- U
('U', 'empieza', 'Corriente ética anglosajona que juzga las acciones por su capacidad de producir la mayor felicidad posible', 'utilitarismo', 'filosofia', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Concepto filosófico que expresa la validez de un juicio para todos los seres racionales sin excepción', 'universalidad', 'filosofia', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Género literario filosófico que describe una sociedad ideal, como la obra homónima de Tomás Moro', 'utopia', 'filosofia', 'bachillerato', '{1}', 1),

-- V
('V', 'empieza', 'Pensador ilustrado francés que luchó contra la intolerancia religiosa y defendió la libertad de expresión', 'voltaire', 'filosofia', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Concepto aristotélico que designa la disposición habitual a obrar bien en el justo medio entre extremos', 'virtud', 'filosofia', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Concepto que expresa la capacidad de una afirmación de ser comprobada como cierta mediante experiencia o razón', 'verificacion', 'filosofia', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Concepto de Schopenhauer que designa la fuerza ciega e irracional que impulsa toda la naturaleza', 'voluntad', 'filosofia', 'bachillerato', '{1}', 2),

-- W
('W', 'contiene', 'Filósofo austríaco autor del Tractatus que defendió los límites del lenguaje como límites del mundo', 'wittgenstein', 'filosofia', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Concepto de la epistemología según el cual toda observación está condicionada por la teoría del observador', 'weltanschauung', 'filosofia', 'bachillerato', '{1}', 3),

-- X
('X', 'contiene', 'Concepto de la ética aplicada contemporánea referido a los dilemas morales del rechazo social hacia lo diferente', 'xenofobia', 'filosofia', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Concepto filosófico griego que designa la hospitalidad como deber moral hacia el extranjero', 'proxenia', 'filosofia', 'bachillerato', '{1}', 3),

-- Y
('Y', 'contiene', 'Concepto de la bioética referido al conjunto de investigaciones sobre el cuerpo y los rasgos hereditarios del ser humano', 'genotipo', 'filosofia', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Concepto filosófico existencialista que designa la angustia del individuo ante la libertad de elegir su propio destino', 'yecto', 'filosofia', 'bachillerato', '{1}', 3),

-- Z
('Z', 'contiene', 'Filósofo estoico de Citio que fundó la escuela del Pórtico y enseñó la aceptación del destino conforme a la razón', 'zenon', 'filosofia', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Concepto de la filosofía de Hume referido al hábito mental que nos lleva a esperar regularidad en la naturaleza', 'regularizacion', 'filosofia', 'bachillerato', '{1}', 3),

-- ============================================================
-- FILOSOFÍA - BACHILLERATO 2 (grades={2}) — 150 preguntas
-- Platón, Aristóteles, Tomás, Descartes, Hume, Kant, Marx, Nietzsche, Ortega
-- ============================================================

-- A
('A', 'empieza', 'Concepto platónico referido al proceso educativo de ascenso del alma desde las sombras hasta la luz del Bien', 'ascenso', 'filosofia', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Concepto aristotélico que designa la división del alma en vegetativa, sensitiva y racional', 'alma', 'filosofia', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Tipo de alienación marxista en la que el obrero se siente ajeno al producto de su propio trabajo', 'alienacion', 'filosofia', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Concepto nietzscheano referido a la actitud estética de embriaguez y desmesura opuesta al orden apolíneo', 'apolo', 'filosofia', 'bachillerato', '{2}', 3),
('A', 'empieza', 'Principio aristotélico según el cual la felicidad consiste en la actividad del alma conforme a la virtud más perfecta', 'autarquia', 'filosofia', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Noción cartesiana de la certeza absoluta que el sujeto tiene de su propia existencia como cosa pensante', 'autoconciencia', 'filosofia', 'bachillerato', '{2}', 2),

-- B
('B', 'empieza', 'Concepto platónico del Bien como idea suprema que ilumina y da ser a todas las demás formas o ideas', 'bien', 'filosofia', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Concepto marxista referido al estrato social que posee los medios de producción y explota al proletariado', 'burguesia', 'filosofia', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Noción aristotélica del bien supremo al que tiende toda acción humana, identificado con la vida contemplativa', 'beatitud', 'filosofia', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Concepto orteguiano referido a las condiciones históricas y sociales en las que cada persona se encuentra al nacer', 'biografica', 'filosofia', 'bachillerato', '{2}', 3),

-- C
('C', 'empieza', 'Alegoría platónica que representa a los prisioneros encadenados que confunden las sombras con la realidad verdadera', 'caverna', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Concepto aristotélico que designa las cuatro causas que explican cualquier ente: material, formal, eficiente y final', 'causa', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Argumento cartesiano que presenta un ser engañador todopoderoso como hipótesis extrema de duda radical', 'cogito', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Tipo de imperativo kantiano que manda de forma absoluta tratar a la humanidad siempre como fin y nunca como medio', 'categorico', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Concepto marxista que designa la pugna histórica entre poseedores y desposeídos como motor del cambio social', 'clases', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Noción orteguiana que define la vida humana como la realidad radical de cada cual con su mundo circundante', 'circunstancia', 'filosofia', 'bachillerato', '{2}', 1),

-- D
('D', 'empieza', 'Método cartesiano que consiste en rechazar como falso todo aquello de lo que sea posible dudar', 'duda', 'filosofia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Concepto aristotélico referido a las virtudes intelectuales como la sabiduría, la prudencia y la ciencia', 'dianotica', 'filosofia', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Noción marxista que designa la confrontación entre fuerzas productivas y relaciones de producción como motor histórico', 'dialectica', 'filosofia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Tipo de imperativo cartesiano que exige dividir cada dificultad en tantas partes como sea posible para resolverla', 'division', 'filosofia', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Concepto platónico del demiurgo que modela la materia informe tomando como modelo las Ideas eternas', 'demiurgo', 'filosofia', 'bachillerato', '{2}', 2),

-- E
('E', 'empieza', 'Concepto nietzscheano que designa la vuelta perpetua de todos los acontecimientos en ciclos idénticos infinitos', 'eterno', 'filosofia', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Concepto platónico que describe la educación como un giro del alma desde el mundo sensible hacia el inteligible', 'educacion', 'filosofia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Tipo de alienación marxista por la que el Estado y las leyes se presentan como instituciones neutrales sin serlo', 'estatal', 'filosofia', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Noción aristotélica de la perfección o actualización plena de la potencialidad de un ente', 'entelequia', 'filosofia', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Concepto orteguiano que opone la vida auténtica a la vida que se deja llevar por las convenciones de la masa', 'ensimismamiento', 'filosofia', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Rama de la filosofía kantiana que investiga las condiciones de posibilidad del conocimiento y sus límites', 'epistemologia', 'filosofia', 'bachillerato', '{2}', 1),

-- F
('F', 'empieza', 'Concepto aristotélico que designa la composición de todo ente natural a partir de materia y forma inseparables', 'forma', 'filosofia', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Concepto nietzscheano de la filosofía a martillazos que critica los valores establecidos de la moral occidental', 'filologia', 'filosofia', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Noción tomista que distingue entre lo que se puede conocer por la razón y lo que solo se acepta por la revelación', 'fe', 'filosofia', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Concepto kantiano del fenómeno como aquello que se nos aparece según las formas a priori de la sensibilidad', 'fenomeno', 'filosofia', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Concepto marxista que designa las condiciones materiales de producción e intercambio que constituyen la base económica', 'fuerzas', 'filosofia', 'bachillerato', '{2}', 2),

-- G
('G', 'empieza', 'Concepto orteguiano que divide a los contemporáneos en grupos de quince años con sensibilidad vital compartida', 'generacion', 'filosofia', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Órgano corporal que Descartes consideró punto de conexión entre la sustancia pensante y la sustancia extensa', 'glandula', 'filosofia', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Concepto platónico del gobierno ideal donde los filósofos dirigen la polis por su conocimiento del Bien', 'gobierno', 'filosofia', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Concepto aristotélico del grado máximo de felicidad alcanzable mediante la actividad racional contemplativa', 'gnosis', 'filosofia', 'bachillerato', '{2}', 3),

-- H
('H', 'empieza', 'Concepto aristotélico que designa la composición de todo ser natural como unión inseparable de materia y forma', 'hilemorfismo', 'filosofia', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Instrumento epistemológico de Hume que separa todo conocimiento en relaciones de ideas y cuestiones de hecho', 'horquilla', 'filosofia', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Concepto nietzscheano que designa al tipo humano que crea sus propios valores más allá del bien y del mal', 'hombre', 'filosofia', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Noción orteguiana que designa la razón como instrumento vital arraigado en la circunstancia histórica del sujeto', 'historica', 'filosofia', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Argumento humeano que niega que de la mera repetición de hechos pueda derivarse una conexión necesaria entre causa y efecto', 'habito', 'filosofia', 'bachillerato', '{2}', 2),

-- I
('I', 'empieza', 'Concepto platónico que designa las formas eternas, inmutables y perfectas que constituyen la realidad verdadera', 'idea', 'filosofia', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Concepto kantiano del mandato moral que ordena actuar según una máxima universalizable sin excepción', 'imperativo', 'filosofia', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Concepto marxista que designa el conjunto de representaciones y creencias que enmascaran las relaciones de dominación', 'ideologia', 'filosofia', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Concepto aristotélico de la razón práctica que aplica los principios universales a las situaciones concretas', 'intelecto', 'filosofia', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Concepto humeano que designa las percepciones vívidas y fuertes derivadas directamente de la experiencia sensible', 'impresion', 'filosofia', 'bachillerato', '{2}', 2),

-- J
('J', 'empieza', 'Concepto platónico de la sociedad ideal en la que cada clase cumple su función propia bajo la guía de la razón', 'justicia', 'filosofia', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Tipo de proposición kantiana que une sujeto y predicado de forma sintética a priori, como los juicios matemáticos', 'juicio', 'filosofia', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Concepto aristotélico del término medio entre extremos viciosos como definición de la virtud ética', 'justa', 'filosofia', 'bachillerato', '{2}', 2),

-- K
('K', 'contiene', 'Concepto de la epistemología de Hume que designa la imposibilidad de justificar racionalmente la conexión causal', 'escepticismo', 'filosofia', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Concepto nietzscheano del tipo humano mediocre conformista que representa la antítesis del superhombre creador', 'frankenstein', 'filosofia', 'bachillerato', '{2}', 3),

-- L
('L', 'empieza', 'Concepto nietzscheano que designa al ser humano decadente, sin voluntad de superación, conformista con los valores del rebaño', 'languidez', 'filosofia', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Concepto marxista referido a la pugna entre las clases sociales como motor fundamental de la historia', 'lucha', 'filosofia', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Concepto platónico que designa los prisioneros de la caverna que solo pueden ver sombras proyectadas en el muro', 'liberacion', 'filosofia', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Concepto kantiano del deber moral que obliga por la forma de la ley y no por su contenido material', 'legislacion', 'filosofia', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Concepto orteguiano que distingue entre las ideas que pensamos y las creencias en las que estamos sin cuestionarlas', 'latencia', 'filosofia', 'bachillerato', '{2}', 3),

-- M
('M', 'empieza', 'Concepto aristotélico que designa el principio indeterminado que recibe la forma para constituir un ente concreto', 'materia', 'filosofia', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Concepto marxista que designa el valor adicional producido por el obrero y apropiado por el capitalista', 'mercancia', 'filosofia', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Concepto nietzscheano de la moral de los esclavos que invierte los valores nobles y exalta la debilidad', 'moral', 'filosofia', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Concepto kantiano de la máxima universalizable como criterio formal para determinar la corrección de una acción', 'maxima', 'filosofia', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Concepto cartesiano de las tres sustancias: pensante, extensa y divina como estructura de la realidad', 'meditacion', 'filosofia', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Concepto platónico de la reminiscencia por la que el alma recuerda las Ideas contempladas antes de encarnarse', 'memoria', 'filosofia', 'bachillerato', '{2}', 2),

-- N
('N', 'empieza', 'Concepto nietzscheano de la transvaloración de todos los valores de la tradición judeocristiana', 'nihilismo', 'filosofia', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Concepto kantiano que designa la realidad en sí misma, independiente de cómo la percibimos', 'noumeno', 'filosofia', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Concepto orteguiano que designa la perspectiva propia e intransferible desde la que cada individuo conoce la realidad', 'naufrago', 'filosofia', 'bachillerato', '{2}', 3),
('N', 'empieza', 'Concepto aristotélico del acto de conocer que parte de la sensación y asciende hasta los primeros principios', 'noesis', 'filosofia', 'bachillerato', '{2}', 3),

-- Ñ
('Ñ', 'contiene', 'Concepto orteguiano que describe al individuo que renuncia a pensar por sí mismo y sigue las opiniones de la masa', 'resena', 'filosofia', 'bachillerato', '{2}', 3),
('Ñ', 'contiene', 'Concepto marxista según el cual la religión consuela al oprimido pero le impide tomar conciencia de su explotación', 'enganoso', 'filosofia', 'bachillerato', '{2}', 2),

-- O
('O', 'empieza', 'Filósofo español del siglo XX que formuló el raciovitalismo y la teoría de las generaciones históricas', 'ortega', 'filosofia', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Concepto platónico de la opinión que se sitúa entre la ignorancia y el conocimiento verdadero de las Ideas', 'opinion', 'filosofia', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Concepto nietzscheano que describe la actitud de la moral noble que afirma la vida sin resentimiento', 'orgullo', 'filosofia', 'bachillerato', '{2}', 3),
('O', 'empieza', 'Concepto cartesiano de la ordenación del pensamiento de lo simple a lo complejo como regla del método', 'orden', 'filosofia', 'bachillerato', '{2}', 1),

-- P
('P', 'empieza', 'Concepto aristotélico que designa la capacidad de un ente de llegar a ser algo que aún no es en acto', 'potencia', 'filosofia', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Concepto platónico referido a la virtud propia de la parte racional del alma en el esquema tripartito', 'prudencia', 'filosofia', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Concepto marxista que designa a la clase trabajadora desposeída que solo cuenta con su fuerza de trabajo', 'proletariado', 'filosofia', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Concepto nietzscheano referido a la perspectiva individual como único acceso posible a la realidad, sin verdad absoluta', 'perspectivismo', 'filosofia', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Concepto orteguiano que afirma que la razón debe integrarse con la vida para comprender la realidad humana', 'perspectiva', 'filosofia', 'bachillerato', '{2}', 1),

-- Q
('Q', 'empieza', 'Argumento tomista de las cinco vías que parte del movimiento para demostrar la existencia de un primer motor inmóvil', 'quinta', 'filosofia', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Concepto escolástico que designa la esencia de una cosa, aquello que la hace ser lo que es', 'quiddidad', 'filosofia', 'bachillerato', '{2}', 3),

-- R
('R', 'empieza', 'Concepto orteguiano que integra razón y vida frente al racionalismo abstracto y al vitalismo irracional', 'raciovitalismo', 'filosofia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Concepto platónico del rey gobernante que ha contemplado el Bien y puede guiar justamente a la ciudad', 'rey', 'filosofia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Concepto marxista de la alienación por la cual la religión proyecta en Dios las cualidades humanas enajenadas', 'religion', 'filosofia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Concepto nietzscheano del sentimiento de los débiles que invierte los valores nobles para vengarse de los fuertes', 'resentimiento', 'filosofia', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Concepto tomista que designa la capacidad de la inteligencia humana para alcanzar verdades naturales sin la revelación', 'razon', 'filosofia', 'bachillerato', '{2}', 1),

-- S
('S', 'empieza', 'Concepto aristotélico del razonamiento deductivo compuesto por premisa mayor, premisa menor y conclusión', 'silogismo', 'filosofia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Concepto nietzscheano del ser humano superior que crea sus propios valores y afirma la vida plenamente', 'superhombre', 'filosofia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Concepto cartesiano que designa la realidad independiente que existe por sí misma: res cogitans y res extensa', 'sustancia', 'filosofia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Concepto platónico del mundo percibido por los sentidos que es mera copia imperfecta del mundo inteligible', 'sensible', 'filosofia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Concepto marxista referido a la plusvalía que el capitalista extrae del trabajo no remunerado del obrero', 'surplus', 'filosofia', 'bachillerato', '{2}', 3),

-- T
('T', 'empieza', 'Argumento tomista que ofrece cinco pruebas racionales de la existencia de Dios a partir de la experiencia sensible', 'tomas', 'filosofia', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Concepto nietzscheano de la revalorización de todos los valores que invierte la moral judeocristiana', 'transvalorar', 'filosofia', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Concepto platónico del alma dividida en tres partes: racional, irascible y concupiscible', 'tripartita', 'filosofia', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Concepto humeano que distingue entre cuestiones de hecho y relaciones de ideas como únicos conocimientos válidos', 'tenedor', 'filosofia', 'bachillerato', '{2}', 2),

-- U
('U', 'empieza', 'Concepto kantiano de la ley moral que debe poder ser aceptada por todos los seres racionales sin contradicción', 'universalizacion', 'filosofia', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Concepto nietzscheano del último tipo humano decadente que busca solo comodidad y renuncia a toda grandeza', 'ultimo', 'filosofia', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Concepto marxista de la sociedad sin clases ni propiedad privada como meta final del proceso revolucionario', 'utopia', 'filosofia', 'bachillerato', '{2}', 1),

-- V
('V', 'empieza', 'Concepto aristotélico de la disposición permanente a obrar bien, adquirida por la repetición de actos buenos', 'virtud', 'filosofia', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Concepto orteguiano que designa la realidad primordial e irrenunciable de cada ser humano concreto', 'vida', 'filosofia', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Concepto nietzscheano de la fuerza creadora que impulsa al individuo a superar obstáculos y afirmar su existencia', 'voluntad', 'filosofia', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Argumento tomista de las cinco vías que parte de la gradación de perfecciones para llegar a un ser máximamente perfecto', 'via', 'filosofia', 'bachillerato', '{2}', 2),

-- W
('W', 'contiene', 'Concepto nietzscheano de la inversión de valores que convierte la debilidad en virtud y la fuerza en pecado', 'enwertung', 'filosofia', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Concepto orteguiano del hombre masa que renuncia a la autenticidad y vive según lo que se dice y se hace', 'verworfenheit', 'filosofia', 'bachillerato', '{2}', 3),

-- X
('X', 'contiene', 'Concepto marxista de la praxis como unión de teoría y práctica revolucionaria para transformar la realidad', 'praxis', 'filosofia', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Concepto aristotélico que designa la existencia individual y concreta de un ente particular en el mundo', 'existencia', 'filosofia', 'bachillerato', '{2}', 1),

-- Y
('Y', 'contiene', 'Concepto cartesiano del yo pensante como primera certeza indudable del proceso de duda metódica', 'cogito', 'filosofia', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Concepto orteguiano de la razón vital que se opone tanto al racionalismo puro como al irracionalismo', 'ensayo', 'filosofia', 'bachillerato', '{2}', 2),

-- Z
('Z', 'contiene', 'Concepto nietzscheano del carácter de Zaratustra como profeta que anuncia la muerte de Dios y la llegada del superhombre', 'zaratustra', 'filosofia', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Concepto marxista referido a la cosificación del trabajador convertido en mercancía dentro del sistema capitalista', 'reificacion', 'filosofia', 'bachillerato', '{2}', 2),

-- ============================================================
-- PREGUNTAS ADICIONALES - LENGUA BACHILLERATO 1 (33 más)
-- ============================================================

('A', 'empieza', 'Corriente literaria del XVI que busca la perfección moral mediante la disciplina espiritual, cultivada por Fray Luis de León', 'ascetica', 'lengua', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Tipo de comedia del Siglo de Oro basada en equívocos, disfraces y situaciones humorísticas de enredo amoroso', 'bufonada', 'lengua', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Estilo literario del Barroco opuesto al culteranismo que prioriza la agudeza del ingenio y los juegos de palabras', 'conceptismo', 'lengua', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Variedad del español que presenta rasgos compartidos entre el castellano y las lenguas en contacto como el catalán', 'diastratia', 'lengua', 'bachillerato', '{1}', 3),
('E', 'empieza', 'Pieza dramática breve del Siglo de Oro representada entre los actos de una comedia para divertir al público', 'entremes', 'lengua', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Poeta agustino del Renacimiento autor de Oda a la vida retirada y Noche serena', 'fray', 'lengua', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Subgénero narrativo del XVI que idealiza la vida pastoril y el amor en un entorno bucólico', 'genero', 'lengua', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Relación semántica de inclusión en la que un término general abarca varios términos más específicos', 'hiperonimia', 'lengua', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Recurso retórico que atribuye cualidades humanas a seres inanimados o abstractos', 'imagen', 'lengua', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Composición lírica de tono festivo y popular cantada en las fiestas navideñas del Renacimiento', 'jaculatoria', 'lengua', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Tipo de texto que emplea terminología técnica propia de un ámbito profesional con precisión y formalidad', 'legal', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Relación semántica entre una parte y el todo, como vela por barco o techo por casa', 'metonimia', 'lengua', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Corriente estética del Renacimiento basada en la imitación de los modelos grecolatinos y la armonía formal', 'neoplatonismo', 'lengua', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Tipo de subordinada adverbial impropia que expresa un obstáculo insuficiente para impedir la acción principal', 'opositiva', 'lengua', 'bachillerato', '{1}', 3),
('P', 'empieza', 'Estrofa de arte menor de cuatro versos octosílabos con rima consonante abba', 'paralelismo', 'lengua', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Obra satírica de Quevedo que presenta visiones oníricas de los vicios y la hipocresía social de su época', 'quimera', 'lengua', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Tipo de oración subordinada que especifica o explica el antecedente nominal al que se refiere', 'relativa', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Fenómeno del español por el que las palabras adquieren significados adicionales por asociación con contextos de uso', 'sema', 'lengua', 'bachillerato', '{1}', 3),
('T', 'empieza', 'Tipo de argumentación que se apoya en la tradición, las costumbres o la autoridad del pasado para defender una idea', 'topico', 'lengua', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Tipo de variación lingüística consistente en el uso de una misma forma para expresar diferentes funciones gramaticales', 'univocidad', 'lengua', 'bachillerato', '{1}', 3),
('V', 'empieza', 'Tipo de verso endecasílabo acentuado en sexta y décima sílabas, el más frecuente en la poesía áurea', 'verso', 'lengua', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Tipo de oración subordinada adverbial que expresa causa, finalidad, condición o concesión', 'adverbial', 'lengua', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Corriente poética del XVI influida por el neoplatonismo que idealiza la belleza femenina como reflejo de lo divino', 'belleza', 'lengua', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Estilo poético barroco de Góngora caracterizado por la acumulación de cultismos, hipérbatos y alusiones mitológicas', 'culteranismo', 'lengua', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Fenómeno pragmático que señala el contexto temporal y espacial del acto comunicativo mediante adverbios y pronombres', 'dectico', 'lengua', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Tipo de oración subordinada que desempeña funciones propias del sustantivo como sujeto o complemento directo', 'enunciativa', 'lengua', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Tipo de subordinada adverbial que expresa el propósito o la intención con que se realiza la acción principal', 'final', 'lengua', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Obra dramática de Tirso de Molina en la que un religioso se condena por su falta de fe en la misericordia divina', 'galanteo', 'lengua', 'bachillerato', '{1}', 3),
('I', 'empieza', 'Fenómeno semántico por el que dos palabras de distinto origen coinciden en su forma pero difieren en significado', 'isoglosa', 'lengua', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Recurso retórico que atenúa una idea expresándola mediante la negación de su contrario', 'litote', 'lengua', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Subgénero novelístico del XVI que narra aventuras amorosas de pastores en un entorno idealizado', 'novelesco', 'lengua', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Figura retórica que atribuye cualidades humanas a objetos, animales o conceptos abstractos', 'personificacion', 'lengua', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Composición poética de versos octosílabos con rima asonante en los versos pares, de tradición oral castellana', 'romance', 'lengua', 'bachillerato', '{1}', 1),

-- ============================================================
-- PREGUNTAS ADICIONALES - LENGUA BACHILLERATO 2 (37 más)
-- ============================================================

('A', 'empieza', 'Poeta del 27 sevillano autor de La realidad y el deseo que vivió un largo exilio en México', 'aleixandre', 'lengua', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Corriente estética de fin de siglo XIX que reaccionó contra el prosaísmo realista buscando la musicalidad y el simbolismo', 'bohemia', 'lengua', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Novela de Cela que retrata la vida cotidiana del Madrid de posguerra mediante un mosaico coral de personajes', 'colmena', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Novela de Delibes narrada como monólogo de una esposa ante el cadáver de su marido, retrato del franquismo rural', 'dialogo', 'lengua', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Recurso textual que consiste en omitir un elemento que se sobreentiende por el contexto lingüístico previo', 'elipsis', 'lengua', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Novela de Galdós que narra las vidas cruzadas de dos mujeres de distinta clase social en el Madrid del XIX', 'fortunata', 'lengua', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Poeta del 27 gaditano autor de Marinero en tierra y Sobre los ángeles, exiliado tras la guerra civil', 'guillermo', 'lengua', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Recurso estilístico de las Rimas de Bécquer basado en la sugerencia, la intimidad y la emoción contenida', 'hermetismo', 'lengua', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Tipo de conector textual que introduce una idea opuesta o matizada respecto a la anterior', 'ilativo', 'lengua', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Concepto de la variación sociolingüística referido al habla específica de un grupo profesional o social', 'jergal', 'lengua', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Género periodístico de opinión que expresa la posición ideológica del medio sobre un asunto de actualidad', 'libelista', 'lengua', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Poeta del 98 autor de Campos de Castilla que reflexionó sobre el paisaje y la identidad española', 'machado', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Tipo de narrador que cuenta la historia desde fuera conociendo los pensamientos de todos los personajes', 'narrador', 'lengua', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Técnica narrativa de la novela social de los 50 que reduce la intervención del narrador al mínimo', 'observable', 'lengua', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Corriente poética posterior a la guerra civil que expresa nostalgia, religiosidad y armonía con el orden establecido', 'poesia', 'lengua', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Mecanismo de cohesión textual que retoma un elemento previo mediante sinónimos, pronombres o hiperónimos', 'recurrencia', 'lengua', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Novela de Martín-Santos ambientada en el Madrid de los 40 que supuso la ruptura con el realismo social', 'silencio', 'lengua', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Tipo de texto periodístico que ofrece la valoración del autor a través de una columna de opinión firmada', 'tribuna', 'lengua', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Tipo de variación lingüística que depende de la situación comunicativa y el grado de formalidad empleado', 'uso', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Técnica teatral de Valle-Inclán que deforma la realidad para mostrar lo grotesco de la sociedad española', 'valle', 'lengua', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Recurso de cohesión que remite a un elemento mencionado anteriormente en el texto mediante pronombres o sinónimos', 'anafora', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Tipo de conector textual que indica la consecuencia lógica de lo expuesto en la oración o párrafo anterior', 'consecutivo', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Fenómeno pragmático del texto por el que los pronombres señalan elementos del contexto extralingüístico', 'dictico', 'lengua', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Técnica teatral del esperpento que presenta a los personajes como marionetas deformadas y grotescas', 'esperpento', 'lengua', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Tipo de argumento basado en ejemplos concretos para apoyar inductivamente una tesis general', 'generalizacion', 'lengua', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Fenómeno semántico por el que dos palabras de igual forma tienen significados completamente distintos sin relación', 'homonimia', 'lengua', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Mecanismo textual de sustitución que evita la repetición empleando un término de significado más amplio', 'lexica', 'lengua', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Novelista contemporáneo autor de Corazón tan blanco y Tu rostro mañana, representante de la narrativa actual', 'marias', 'lengua', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Tipo de novela de los años 60 que rompe con la linealidad temporal y experimenta con múltiples puntos de vista', 'nueva', 'lengua', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Recurso textual de cohesión que organiza la información del texto mediante marcadores de orden y contraste', 'puntuacion', 'lengua', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Corriente literaria del XIX que se opone al neoclasicismo valorando la emoción, la imaginación y lo irracional', 'romantico', 'lengua', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Tipo de conector textual que añade información nueva al argumento expuesto anteriormente', 'sumativo', 'lengua', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Parte de la estructura del texto argumentativo que presenta la idea central que se va a defender', 'tesis', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Escritor del 98 que creó el concepto de nivola y exploró la angustia existencial del personaje de ficción', 'vida', 'lengua', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Poeta del 27 gaditano autor de Marinero en tierra y Sobre los ángeles que cultivó la nostalgia del mar', 'alberti', 'lengua', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Escritor del 98 autor de El árbol de la ciencia que retrató la crisis existencial de la España finisecular', 'baroja', 'lengua', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Poeta sevillano del 27 autor de La realidad y el deseo que exploró el conflicto entre deseo y mundo real', 'cernuda', 'lengua', 'bachillerato', '{2}', 1),

-- ============================================================
-- PREGUNTAS ADICIONALES - FILOSOFÍA BACHILLERATO 1 (40 más)
-- ============================================================

('A', 'empieza', 'Concepto filosófico que designa la capacidad del individuo para gobernarse a sí mismo según la razón', 'autonomia', 'filosofia', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Concepto de la filosofía del lenguaje de Wittgenstein según el cual el significado depende del contexto de uso', 'bisagra', 'filosofia', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Concepto del contractualismo que fundamenta la legitimidad del Estado en un acuerdo voluntario entre individuos', 'contrato', 'filosofia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Concepto ético que distingue entre el bien y el mal como fundamento de la acción moral del ser humano', 'discernimiento', 'filosofia', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Rama de la filosofía que estudia la naturaleza, los límites y la validez del conocimiento humano', 'epistemologia', 'filosofia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Concepto de la filosofía política que designa el paso del estado de naturaleza al estado civil mediante un pacto', 'fundacional', 'filosofia', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Principio ético kantiano según el cual la buena voluntad es lo único bueno sin restricción', 'goodwill', 'filosofia', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Concepto de la ética aplicada referido a los derechos fundamentales inherentes a todo ser humano por su dignidad', 'humanos', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Concepto de la filosofía antigua que designa las representaciones mentales derivadas de la percepción sensible', 'imagen', 'filosofia', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Tipo de proposición lógica que Kant clasifica en analítica o sintética según la relación entre sujeto y predicado', 'juicio', 'filosofia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Concepto político de Locke que defiende la limitación del poder del Estado para proteger las libertades individuales', 'liberalismo', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Concepto filosófico del materialismo que reduce toda la realidad a materia en movimiento sin principios espirituales', 'materialismo', 'filosofia', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Corriente filosófica medieval que niega la existencia real de los universales y los reduce a meros nombres', 'nominalismo', 'filosofia', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Principio lógico medieval que prescribe no multiplicar los entes sin necesidad, atribuido a Guillermo de Ockham', 'occamismo', 'filosofia', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Corriente filosófica del XIX que rechaza la metafísica y limita el conocimiento a los hechos observables', 'positivismo', 'filosofia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Concepto de la filosofía política de Rousseau que designa la expresión unitaria de la voluntad del pueblo soberano', 'republica', 'filosofia', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Concepto de la filosofía de la ciencia referido al conocimiento organizado en teorías verificables y falsables', 'sistematico', 'filosofia', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Corriente filosófica medieval que armoniza la filosofía aristotélica con la teología cristiana', 'tomismo', 'filosofia', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Concepto del utilitarismo de Mill que distingue entre placeres intelectuales y placeres corporales en valor cualitativo', 'utilidad', 'filosofia', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Concepto del Círculo de Viena que establece que solo son significativas las proposiciones verificables empíricamente', 'verificacionismo', 'filosofia', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Filósofo presocrático de Mileto que propuso el agua como principio originario de todas las cosas', 'agua', 'filosofia', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Concepto de Foucault que designa los mecanismos institucionales de control y vigilancia sobre los individuos', 'control', 'filosofia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Concepto cartesiano de la separación radical entre mente y cuerpo como dos sustancias independientes', 'dualismo', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Corriente de la bioética que defiende el respeto a la decisión libre e informada del paciente', 'eutanasia', 'filosofia', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Concepto de Popper según el cual una teoría solo es científica si puede ser refutada por la experiencia', 'falsabilidad', 'filosofia', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Período filosófico que abarca las escuelas de epicúreos, estoicos y escépticos tras la muerte de Aristóteles', 'helenismo', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Principio aristotélico de no contradicción que establece que algo no puede ser y no ser al mismo tiempo', 'identidad', 'filosofia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Concepto de la filosofía del lenguaje según Wittgenstein en que las palabras funcionan como herramientas en juegos', 'lenguaje', 'filosofia', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Concepto de Maquiavelo según el cual el gobernante debe usar cualquier medio necesario para mantener el poder', 'medio', 'filosofia', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Concepto de la filosofía política que designa el derecho de los pueblos a gobernarse sin injerencia exterior', 'nacion', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Corriente de la filosofía antigua representada por Pirrón que suspende el juicio ante la imposibilidad de certeza', 'pirronismo', 'filosofia', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Concepto de Hobbes que describe la condición humana previa al pacto social como guerra de todos contra todos', 'renuncia', 'filosofia', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Movimiento filosófico contemporáneo que analiza las condiciones sociales que distorsionan la comunicación racional', 'sociocritica', 'filosofia', 'bachillerato', '{1}', 3),
('T', 'empieza', 'Concepto filosófico de la tradición empirista que reduce todo contenido mental a datos de la experiencia sensorial', 'tabula', 'filosofia', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Concepto del Círculo de Viena que solo admite como significativas las proposiciones contrastables con la experiencia', 'viena', 'filosofia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Argumento clásico que infiere la existencia de Dios a partir del orden y la regularidad observados en la naturaleza', 'cosmologico', 'filosofia', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Concepto de la filosofía moral que designa la disposición emocional de ponerse en el lugar del otro', 'empatia', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Escuela filosófica de Platón donde se enseñaba geometría, dialéctica y el conocimiento de las Ideas', 'platonica', 'filosofia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Corriente filosófica que propone la separación de poderes legislativo, ejecutivo y judicial como garantía de libertad', 'separacion', 'filosofia', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Concepto de la ética de Aristóteles que designa la felicidad como plenitud en el ejercicio de las virtudes', 'dichoso', 'filosofia', 'bachillerato', '{1}', 3),

-- ============================================================
-- PREGUNTAS ADICIONALES - FILOSOFÍA BACHILLERATO 2 (42 más)
-- ============================================================

('A', 'empieza', 'Concepto aristotélico del justo medio como punto equidistante entre el exceso y el defecto en la virtud ética', 'areté', 'filosofia', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Concepto platónico de la belleza como forma inteligible que se conoce al final del ascenso dialéctico del alma', 'belleza', 'filosofia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Concepto kantiano de la Crítica de la razón pura que examina las condiciones trascendentales del conocimiento', 'critica', 'filosofia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Concepto platónico del método de ascenso racional que parte de las opiniones para alcanzar las Ideas verdaderas', 'dialectica', 'filosofia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Concepto aristotélico de la ética referido a la experiencia como fuente de las virtudes prácticas', 'etica', 'filosofia', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Concepto platónico del filósofo gobernante que ha alcanzado el conocimiento del Bien y dirige la polis con justicia', 'filosofo', 'filosofia', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Concepto cartesiano del genio maligno como hipótesis radical para dudar incluso de las verdades matemáticas', 'genio', 'filosofia', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Concepto kantiano del imperativo que manda bajo una condición y depende de un fin particular del agente', 'hipotetico', 'filosofia', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Concepto aristotélico que designa el conocimiento intuitivo de los primeros principios indemostrables', 'intuicion', 'filosofia', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Concepto platónico del símil de la línea que divide el conocimiento en cuatro grados desde la conjetura hasta la ciencia', 'linea', 'filosofia', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Concepto marxista del materialismo que explica la historia por las condiciones económicas y no por las ideas', 'materialismo', 'filosofia', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Concepto nietzscheano de la genealogía que rastrea el origen histórico de los valores morales para desenmascarar su función', 'noble', 'filosofia', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Concepto aristotélico de la felicidad plena alcanzada mediante la contemplación como actividad más elevada del alma', 'ocio', 'filosofia', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Concepto cartesiano de la primera regla del método que exige no admitir nada que no sea claro y distinto', 'precepto', 'filosofia', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Concepto platónico de la reminiscencia por la que aprender es recordar las Ideas contempladas antes de nacer', 'reminiscencia', 'filosofia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Concepto kantiano de la sensibilidad como facultad receptiva que ordena los datos sensibles según espacio y tiempo', 'sensibilidad', 'filosofia', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Concepto kantiano de las condiciones trascendentales que hacen posible el conocimiento antes de toda experiencia', 'trascendental', 'filosofia', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Concepto platónico de los dos mundos separados: el sensible de las apariencias y el inteligible de las Ideas verdaderas', 'universo', 'filosofia', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Concepto tomista de las cinco pruebas de la existencia de Dios que parten de la experiencia para llegar a lo trascendente', 'vias', 'filosofia', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Concepto marxista de la base económica compuesta por fuerzas productivas y relaciones de producción', 'acumulacion', 'filosofia', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Concepto humeano de la costumbre como fundamento psicológico de nuestra creencia en la regularidad causal', 'belief', 'filosofia', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Concepto orteguiano de las creencias como ideas en las que vivimos sin cuestionarlas, a diferencia de las ideas pensadas', 'creencia', 'filosofia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Concepto nietzscheano del ocaso de los valores absolutos anunciado con la frase la muerte de Dios', 'decadencia', 'filosofia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Concepto marxista de la superestructura ideológica que incluye derecho, política, religión y arte sobre la base económica', 'estructura', 'filosofia', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Concepto humeano de la diferencia entre las percepciones vivas de los sentidos y las copias débiles de la memoria', 'fantasma', 'filosofia', 'bachillerato', '{2}', 3),
('G', 'empieza', 'Concepto tomista de la gracia divina como complemento necesario de la razón natural para alcanzar las verdades reveladas', 'gracia', 'filosofia', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Concepto nietzscheano de la genealogía de la moral que distingue entre moral de señores y moral de esclavos', 'heroe', 'filosofia', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Tipo de alienación marxista en la que las ideas dominantes de una época son las ideas de la clase dominante', 'ideologica', 'filosofia', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Concepto kantiano de la ley moral como hecho de la razón práctica que se impone incondicionalmente al sujeto', 'ley', 'filosofia', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Concepto platónico del mundo inteligible como ámbito de las Ideas eternas accesible solo por la razón', 'mundo', 'filosofia', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Concepto aristotélico de la naturaleza como principio interno de movimiento y reposo propio de cada ente', 'naturaleza', 'filosofia', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Concepto orteguiano del hombre masa como individuo satisfecho que no se exige nada a sí mismo', 'opinion', 'filosofia', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Concepto aristotélico de la phronesis como sabiduría práctica que delibera sobre los medios para el bien', 'phronesis', 'filosofia', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Concepto nietzscheano de la voluntad de poder como impulso fundamental de la vida que crea nuevos valores', 'revalorizacion', 'filosofia', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Concepto platónico de las sombras como imágenes engañosas que los prisioneros de la caverna toman por realidad', 'sombras', 'filosofia', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Concepto aristotélico del término medio como regla de la virtud que varía según la persona y la circunstancia', 'templanza', 'filosofia', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Concepto kantiano de la unidad de apercepción trascendental como condición de posibilidad de toda experiencia', 'unificacion', 'filosofia', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Concepto marxista del valor de cambio como magnitud que determina la proporción en que se intercambian las mercancías', 'valor', 'filosofia', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Concepto aristotélico de las cuatro causas: material, formal, eficiente y final como explicación completa del ente', 'causalidad', 'filosofia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Concepto cartesiano de la evidencia como primer precepto del método que exige claridad y distinción en las ideas', 'evidencia', 'filosofia', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Concepto kantiano de la paz perpetua como ideal regulativo de las relaciones entre estados según el derecho cosmopolita', 'paz', 'filosofia', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Concepto tomista de la sindéresis como hábito natural de la razón práctica que conoce los primeros principios morales', 'sinderesis', 'filosofia', 'bachillerato', '{2}', 3);
-- ============================================================
-- ROSCO BACHILLERATO — CIENCIAS EXACTAS (375 preguntas)
-- Asignaturas: matematicas {1}, matematicas {2},
--              fisica {1}, fisica {2}, quimica {2}
-- ============================================================

-- ============================================================
-- 1. MATEMATICAS — BACHILLERATO 1 (75 preguntas)
--    Funciones, límites, derivadas, trigonometría, vectores,
--    matrices, sistemas, combinatoria, probabilidad, geometría
-- ============================================================
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- A
('A', 'empieza', 'Valor al que se aproxima una función cuando la variable independiente tiende a un punto, sin necesidad de alcanzarlo', 'asintotica', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Elemento matemático que expresa la medida de la superficie encerrada bajo una curva', 'area', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'En trigonometría, razón entre el cateto contiguo y la hipotenusa de un triángulo rectángulo', 'adyacente', 'matematicas', 'bachillerato', '{1}', 2),

-- B
('B', 'empieza', 'En una función cuadrática, cada una de las dos ramas en que se divide la parábola respecto a su eje de simetría', 'brazo', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Número que forma la parte inferior de una potencia y que se multiplica por sí mismo tantas veces como indica el exponente', 'base', 'matematicas', 'bachillerato', '{1}', 1),

-- C
('C', 'empieza', 'Número de formas de elegir r elementos de un conjunto de n, sin importar el orden', 'combinacion', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Función trigonométrica que relaciona el cateto adyacente con la hipotenusa', 'coseno', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Propiedad de una función que puede dibujarse sin levantar el lápiz del papel', 'continuidad', 'matematicas', 'bachillerato', '{1}', 2),

-- D
('D', 'empieza', 'Operación que obtiene la función que mide la tasa de cambio instantánea de otra función', 'derivada', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Valor numérico asociado a una matriz cuadrada que indica si es invertible', 'determinante', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Conjunto de valores que puede tomar la variable independiente de una función', 'dominio', 'matematicas', 'bachillerato', '{1}', 1),

-- E
('E', 'empieza', 'Igualdad matemática que contiene una o más incógnitas y que solo se verifica para ciertos valores', 'ecuacion', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Número irracional aproximadamente igual a 2,718 que es base del logaritmo natural', 'euler', 'matematicas', 'bachillerato', '{1}', 2),

-- F
('F', 'empieza', 'Producto de todos los enteros positivos desde 1 hasta n, usado en combinatoria', 'factorial', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Relación entre dos conjuntos que asigna a cada elemento del primero exactamente un elemento del segundo', 'funcion', 'matematicas', 'bachillerato', '{1}', 1),

-- G
('G', 'empieza', 'Rama de las matemáticas que estudia las propiedades de las figuras en el plano usando coordenadas', 'geometria', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Representación visual de una función mediante una curva en un sistema de ejes coordenados', 'grafica', 'matematicas', 'bachillerato', '{1}', 1),

-- H
('H', 'empieza', 'Función trigonométrica que es la inversa del coseno y se usa en triángulos', 'hipotenusa', 'matematicas', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Curva plana definida como el lugar geométrico de los puntos cuya diferencia de distancias a dos focos es constante', 'hiperbola', 'matematicas', 'bachillerato', '{1}', 2),

-- I
('I', 'empieza', 'Conjunto de valores comprendidos entre dos extremos en la recta real', 'intervalo', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Recta que una curva se va aproximando indefinidamente sin llegar a tocarla, también llamada asíntota', 'infinito', 'matematicas', 'bachillerato', '{1}', 2),

-- J
('J', 'empieza', 'Conjunto de sucesos posibles en un experimento aleatorio, también llamado espacio muestral en el juego de azar', 'juego', 'matematicas', 'bachillerato', '{1}', 2),

-- K
('K', 'contiene', 'Valor numérico del determinante de una matriz cuando este es igual a cero, lo que indica que la matriz es singular', 'rank', 'matematicas', 'bachillerato', '{1}', 3),

-- L
('L', 'empieza', 'Valor al que se acerca f(x) cuando x tiende a un determinado punto o al infinito', 'limite', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Función inversa de la exponencial, que permite despejar el exponente de una potencia', 'logaritmo', 'matematicas', 'bachillerato', '{1}', 1),

-- M
('M', 'empieza', 'Tabla rectangular de números dispuestos en filas y columnas sobre la que se definen operaciones algebraicas', 'matriz', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Punto de una función donde la derivada se anula y la segunda derivada es negativa', 'maximo', 'matematicas', 'bachillerato', '{1}', 2),

-- N
('N', 'empieza', 'Expresión de un número complejo en forma a + bi, donde a es la parte real y b la parte imaginaria, que define el módulo con la raíz cuadrada de a² + b²', 'norma', 'matematicas', 'bachillerato', '{1}', 3),

-- Ñ
('Ñ', 'contiene', 'En geometría analítica, recta que pasa por un punto de una curva y es perpendicular a la tangente en ese punto', 'companera', 'matematicas', 'bachillerato', '{1}', 3),

-- O
('O', 'empieza', 'Punto donde los ejes de coordenadas se cruzan, con coordenadas (0,0)', 'origen', 'matematicas', 'bachillerato', '{1}', 1),

-- P
('P', 'empieza', 'Cónica con forma de U que es la gráfica de una función cuadrática', 'parabola', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Número de formas ordenadas de disponer r elementos tomados de un conjunto de n', 'permutacion', 'matematicas', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Medida numérica entre 0 y 1 que cuantifica la posibilidad de que ocurra un suceso aleatorio', 'probabilidad', 'matematicas', 'bachillerato', '{1}', 1),

-- Q
('Q', 'empieza', 'Resultado que se obtiene al dividir un número entre otro', 'quociente', 'matematicas', 'bachillerato', '{1}', 2),

-- R
('R', 'empieza', 'Medida angular alternativa al grado sexagesimal, donde una vuelta completa equivale a 2π', 'radian', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Conjunto de valores que toma una función, también llamado imagen o recorrido', 'rango', 'matematicas', 'bachillerato', '{1}', 2),

-- S
('S', 'empieza', 'Función trigonométrica que relaciona el cateto opuesto con la hipotenusa en un triángulo rectángulo', 'seno', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Conjunto de ecuaciones que deben satisfacerse simultáneamente con los mismos valores de las incógnitas', 'sistema', 'matematicas', 'bachillerato', '{1}', 1),

-- T
('T', 'empieza', 'Función trigonométrica definida como el cociente entre el seno y el coseno', 'tangente', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Representación matricial de números en filas y columnas que al intercambiar filas por columnas da la traspuesta', 'traspuesta', 'matematicas', 'bachillerato', '{1}', 2),

-- U
('U', 'empieza', 'Operación entre conjuntos que da como resultado todos los elementos que pertenecen a al menos uno de ellos', 'union', 'matematicas', 'bachillerato', '{1}', 1),

-- V
('V', 'empieza', 'Ente matemático definido por módulo, dirección y sentido, representado como segmento orientado', 'vector', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Punto más bajo o más alto de una parábola, donde la función cuadrática alcanza su extremo', 'vertice', 'matematicas', 'bachillerato', '{1}', 1),

-- X
('X', 'contiene', 'Punto donde la gráfica de una función corta al eje de abscisas, es decir, donde f(x)=0', 'extremo', 'matematicas', 'bachillerato', '{1}', 2),

-- Y
('Y', 'contiene', 'En geometría, recta que forma un ángulo de exactamente noventa grados con la dirección de proyección', 'proyeccion', 'matematicas', 'bachillerato', '{1}', 3),

-- Z
('Z', 'contiene', 'Operación que consiste en reducir una expresión algebraica igualando el resultado a cero para hallar sus raíces', 'raiz', 'matematicas', 'bachillerato', '{1}', 2),


-- ============================================================
-- 2. MATEMATICAS — BACHILLERATO 2 (75 preguntas)
--    Integrales, ecuaciones, geometría espacio, álgebra lineal,
--    estadística, distribuciones, inferencia, prog. lineal
-- ============================================================

-- A
('A', 'empieza', 'Operación inversa de la derivación que permite calcular el área bajo una curva', 'antiderivada', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Rama del álgebra que estudia los espacios vectoriales, las matrices y las transformaciones lineales', 'algebra', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Propiedad de un estimador estadístico cuya distribución muestral se centra en el parámetro poblacional', 'asimetria', 'matematicas', 'bachillerato', '{2}', 3),

-- B
('B', 'empieza', 'Distribución de probabilidad discreta que modela el número de éxitos en n ensayos independientes con misma probabilidad', 'binomial', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Regla para calcular la derivada de una función compuesta en varias variables, usando derivadas parciales', 'barrow', 'matematicas', 'bachillerato', '{2}', 2),

-- C
('C', 'empieza', 'Valor constante que se añade al resultado de una integral indefinida para representar la familia de primitivas', 'constante', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Medida estadística del grado de relación lineal entre dos variables cuantitativas', 'correlacion', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Propiedad que se cumple cuando un sistema de ecuaciones tiene exactamente una solución', 'compatible', 'matematicas', 'bachillerato', '{2}', 1),

-- D
('D', 'empieza', 'Medida de dispersión que indica cuánto se desvían en promedio los datos respecto a la media', 'desviacion', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'En programación lineal, recta que limita la región factible de soluciones', 'desigualdad', 'matematicas', 'bachillerato', '{2}', 2),

-- E
('E', 'empieza', 'Número real que, multiplicado por un vector propio, da el mismo resultado que aplicarle la matriz asociada', 'eigenvalor', 'matematicas', 'bachillerato', '{2}', 3),
('E', 'empieza', 'Valor calculado a partir de una muestra que sirve para aproximar un parámetro desconocido de la población', 'estimador', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Tipo de ecuación diferencial donde la función incógnita y sus derivadas aparecen con exponente uno', 'exponencial', 'matematicas', 'bachillerato', '{2}', 2),

-- F
('F', 'empieza', 'Función cuya integral se quiere calcular, es decir, la expresión que aparece dentro del signo de integración', 'funcion', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Región del plano delimitada por las restricciones de un problema de programación lineal', 'factible', 'matematicas', 'bachillerato', '{2}', 2),

-- G
('G', 'empieza', 'Distribución continua de probabilidad con forma de campana, simétrica respecto a la media', 'gaussiana', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Número de ecuaciones linealmente independientes en un sistema, que coincide con el rango de la matriz de coeficientes', 'grado', 'matematicas', 'bachillerato', '{2}', 2),

-- H
('H', 'empieza', 'Proposición que se plantea provisionalmente sobre un parámetro poblacional y que se contrasta con datos muestrales', 'hipotesis', 'matematicas', 'bachillerato', '{2}', 1),

-- I
('I', 'empieza', 'Operación del cálculo que obtiene la primitiva de una función o el valor del área bajo la curva', 'integral', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Rango de valores construido a partir de datos muestrales que contiene al parámetro poblacional con una confianza dada', 'intervalo', 'matematicas', 'bachillerato', '{2}', 1),

-- J
('J', 'contiene', 'Matriz cuyo determinante es igual a uno y que al multiplicarla por sí misma no cambia, perdiendo un subespacio', 'adjunta', 'matematicas', 'bachillerato', '{2}', 3),

-- K
('K', 'contiene', 'Test estadístico no paramétrico que compara la distribución observada de una variable con la esperada teórica', 'kolmogorov', 'matematicas', 'bachillerato', '{2}', 3),

-- L
('L', 'empieza', 'Técnica de integración que descompone una fracción algebraica en suma de fracciones más simples', 'logaritmica', 'matematicas', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Tipo de función que en coordenadas cartesianas se representa como una recta y se define por f(x)=mx+n', 'lineal', 'matematicas', 'bachillerato', '{2}', 1),

-- M
('M', 'empieza', 'Valor esperado de una variable aleatoria, obtenido como la suma de cada valor por su probabilidad', 'media', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Estadístico que divide la distribución de datos ordenados en dos mitades iguales', 'mediana', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Selección aleatoria de individuos de una población sobre la que se realizan observaciones', 'muestra', 'matematicas', 'bachillerato', '{2}', 1),

-- N
('N', 'empieza', 'Distribución de probabilidad continua simétrica, definida por su media y desviación típica, con forma de campana', 'normal', 'matematicas', 'bachillerato', '{2}', 1),

-- Ñ
('Ñ', 'contiene', 'Tamaño de la muestra estadística, cuyo valor influye directamente en la amplitud del intervalo de confianza', 'tamanio', 'matematicas', 'bachillerato', '{2}', 2),

-- O
('O', 'empieza', 'Función matemática que se busca maximizar o minimizar en un problema de programación lineal', 'objetivo', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Propiedad de dos vectores cuyo producto escalar es cero', 'ortogonal', 'matematicas', 'bachillerato', '{2}', 2),

-- P
('P', 'empieza', 'Función cuya derivada es una función dada, también llamada antiderivada', 'primitiva', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'En geometría del espacio, superficie determinada por un punto y un vector normal', 'plano', 'matematicas', 'bachillerato', '{2}', 1),

-- Q
('Q', 'empieza', 'Valores que dividen una distribución de datos en cuatro partes iguales', 'quartil', 'matematicas', 'bachillerato', '{2}', 2),

-- R
('R', 'empieza', 'Número máximo de filas o columnas linealmente independientes de una matriz', 'rango', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Recta en el espacio tridimensional definida por un punto y un vector director', 'recta', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Técnica de estadística que modela la relación entre una variable dependiente y una o más independientes', 'regresion', 'matematicas', 'bachillerato', '{2}', 2),

-- S
('S', 'empieza', 'Método de resolución de integrales que reemplaza la variable de integración por otra nueva', 'sustitucion', 'matematicas', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Propiedad de la distribución normal por la cual la media, la mediana y la moda coinciden', 'simetria', 'matematicas', 'bachillerato', '{2}', 1),

-- T
('T', 'empieza', 'Teorema fundamental del cálculo que relaciona la derivación con la integración definida', 'teorema', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Valor numérico que se compara con el valor crítico en un contraste de hipótesis para decidir si se rechaza', 'test', 'matematicas', 'bachillerato', '{2}', 2),

-- U
('U', 'empieza', 'Distribución de probabilidad donde todos los valores posibles tienen la misma probabilidad de ocurrir', 'uniforme', 'matematicas', 'bachillerato', '{2}', 2),

-- V
('V', 'empieza', 'Medida de dispersión que se calcula como el cuadrado de la desviación típica', 'varianza', 'matematicas', 'bachillerato', '{2}', 1),
('V', 'empieza', 'En el espacio tridimensional, elemento con tres componentes que indica magnitud y dirección', 'vector', 'matematicas', 'bachillerato', '{2}', 1),

-- X
('X', 'contiene', 'Valor de la variable que hace que una función alcance su punto más alto o más bajo localmente', 'extremo', 'matematicas', 'bachillerato', '{2}', 2),

-- Y
('Y', 'contiene', 'Curva trazada en el plano cartesiano que representa los datos de una distribución de frecuencias', 'trayectoria', 'matematicas', 'bachillerato', '{2}', 3),

-- Z
('Z', 'contiene', 'Transformación estadística que convierte un dato en su número de desviaciones típicas respecto a la media, usada para la tabla normal', 'estandarizar', 'matematicas', 'bachillerato', '{2}', 2),


-- ============================================================
-- 3. FISICA — BACHILLERATO 1 (75 preguntas)
--    Cinemática, dinámica, trabajo/energía, gravitación,
--    estructura atómica, enlace, formulación, reacciones, estequiometría
-- ============================================================

-- A
('A', 'empieza', 'Magnitud vectorial que mide la variación de velocidad por unidad de tiempo', 'aceleracion', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Partícula fundamental del núcleo atómico formada por dos protones y dos neutrones, emitida en desintegración radiactiva', 'alfa', 'fisica', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Fuerza que se opone al desplazamiento de un cuerpo en el seno de un fluido', 'arrastre', 'fisica', 'bachillerato', '{1}', 2),

-- B
('B', 'empieza', 'Instrumento de laboratorio que mide la presión atmosférica mediante una columna de mercurio', 'barometro', 'fisica', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Principio de Arquímedes: fuerza vertical ascendente que ejerce un fluido sobre un cuerpo sumergido', 'boyante', 'fisica', 'bachillerato', '{1}', 3),

-- C
('C', 'empieza', 'Rama de la física que estudia el movimiento de los cuerpos sin atender a las causas que lo producen', 'cinematica', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Partícula subatómica con carga negativa que orbita alrededor del núcleo atómico', 'cation', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Magnitud que se conserva en un sistema aislado según la tercera ley de Newton: cantidad de movimiento', 'cantidad', 'fisica', 'bachillerato', '{1}', 2),

-- D
('D', 'empieza', 'Rama de la física que estudia el movimiento de los cuerpos y las fuerzas que lo causan', 'dinamica', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Magnitud escalar que mide la masa por unidad de volumen de una sustancia', 'densidad', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Cambio de posición de un cuerpo medido como vector desde el punto inicial al final', 'desplazamiento', 'fisica', 'bachillerato', '{1}', 1),

-- E
('E', 'empieza', 'Capacidad de un sistema para realizar trabajo, que se conserva en sistemas aislados', 'energia', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Relación cuantitativa entre las masas de reactivos y productos en una reacción química', 'estequiometria', 'fisica', 'bachillerato', '{1}', 2),

-- F
('F', 'empieza', 'Interacción entre dos superficies en contacto que se opone al movimiento relativo entre ellas', 'friccion', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Magnitud vectorial capaz de modificar el estado de reposo o movimiento de un cuerpo', 'fuerza', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Representación simbólica de una sustancia química mediante símbolos de elementos y subíndices', 'formula', 'fisica', 'bachillerato', '{1}', 1),

-- G
('G', 'empieza', 'Fuerza de atracción entre dos masas, descrita por la ley de Newton de la gravitación universal', 'gravitacion', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Aceleración que experimenta un cuerpo en caída libre cerca de la superficie terrestre, aproximadamente 9,8 m/s²', 'gravedad', 'fisica', 'bachillerato', '{1}', 1),

-- H
('H', 'empieza', 'Elemento químico más ligero y abundante del universo, con número atómico 1', 'hidrogeno', 'fisica', 'bachillerato', '{1}', 1),

-- I
('I', 'empieza', 'Propiedad de los cuerpos de resistir cambios en su estado de movimiento, proporcional a su masa', 'inercia', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Partícula con carga eléctrica neta por haber ganado o perdido electrones', 'ion', 'fisica', 'bachillerato', '{1}', 1),

-- J
('J', 'empieza', 'Unidad del Sistema Internacional para medir energía, trabajo y calor', 'julio', 'fisica', 'bachillerato', '{1}', 1),

-- K
('K', 'contiene', 'Energía que posee un cuerpo debido a su movimiento, proporcional al cuadrado de la velocidad', 'cinetica', 'fisica', 'bachillerato', '{1}', 1),

-- L
('L', 'empieza', 'Enunciado general que describe una regularidad observada en la naturaleza y que se expresa matemáticamente', 'ley', 'fisica', 'bachillerato', '{1}', 1),

-- M
('M', 'empieza', 'Cantidad de materia que contiene un cuerpo, medida en kilogramos en el SI', 'masa', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Unidad de cantidad de sustancia del SI, equivalente a 6,022 × 10²³ entidades', 'mol', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Producto de una fuerza por la distancia al eje de giro, que mide la tendencia a producir rotación', 'momento', 'fisica', 'bachillerato', '{1}', 2),

-- N
('N', 'empieza', 'Unidad de fuerza en el SI, equivalente a la fuerza que acelera 1 kg a 1 m/s²', 'newton', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Partícula subatómica sin carga eléctrica que se encuentra en el núcleo del átomo', 'neutron', 'fisica', 'bachillerato', '{1}', 1),

-- Ñ
('Ñ', 'contiene', 'Modelo atómico que describe los electrones en niveles de energía y subniveles con orbitales, propuesto en 1926', 'mecanica', 'fisica', 'bachillerato', '{1}', 3),

-- O
('O', 'empieza', 'Trayectoria cerrada que describe un cuerpo alrededor de otro por efecto de la fuerza gravitatoria', 'orbita', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Reacción química en la que una sustancia pierde electrones, aumentando su estado de oxidación', 'oxidacion', 'fisica', 'bachillerato', '{1}', 2),

-- P
('P', 'empieza', 'Magnitud que mide el trabajo realizado por unidad de tiempo', 'potencia', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Partícula subatómica con carga positiva que se encuentra en el núcleo del átomo', 'proton', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Fuerza por unidad de superficie que ejerce un fluido sobre las paredes de su recipiente', 'presion', 'fisica', 'bachillerato', '{1}', 1),

-- Q
('Q', 'empieza', 'Rama de la física que estudia la naturaleza y las propiedades de la materia a escala subatómica', 'quantica', 'fisica', 'bachillerato', '{1}', 3),

-- R
('R', 'empieza', 'Proceso por el cual unas sustancias se transforman en otras distintas, reorganizando sus átomos', 'reaccion', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Sustancia que se obtiene como producto final de una reacción química', 'resultado', 'fisica', 'bachillerato', '{1}', 2),

-- S
('S', 'empieza', 'Mezcla homogénea de dos o más sustancias en la que no se distinguen sus componentes a simple vista', 'solucion', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Sustancia pura que no puede descomponerse en otras más sencillas por métodos químicos ordinarios', 'sustancia', 'fisica', 'bachillerato', '{1}', 2),

-- T
('T', 'empieza', 'Producto de la fuerza aplicada sobre un cuerpo por la distancia recorrida en la dirección de dicha fuerza', 'trabajo', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Movimiento de un proyectil que sigue una parábola bajo la acción exclusiva de la gravedad', 'tiro', 'fisica', 'bachillerato', '{1}', 2),

-- U
('U', 'empieza', 'Sistema de unidades basado en el metro, kilogramo, segundo, amperio, kelvin, mol y candela', 'unidades', 'fisica', 'bachillerato', '{1}', 1),

-- V
('V', 'empieza', 'Magnitud vectorial que mide la rapidez y dirección del cambio de posición por unidad de tiempo', 'velocidad', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Espacio tridimensional que ocupa un cuerpo, medido en metros cúbicos en el SI', 'volumen', 'fisica', 'bachillerato', '{1}', 1),

-- X
('X', 'contiene', 'Proceso de cambio de estado de líquido a gas que ocurre en toda la masa del líquido al alcanzar su punto de ebullición', 'ebullicion', 'fisica', 'bachillerato', '{1}', 3),

-- Y
('Y', 'contiene', 'Movimiento de un cuerpo lanzado con cierto ángulo respecto a la horizontal, describiendo una trayectoria curva', 'proyectil', 'fisica', 'bachillerato', '{1}', 2),

-- Z
('Z', 'contiene', 'Fuerza de atracción que la Tierra ejerce sobre los cuerpos cercanos a su superficie, dirigida hacia su centro', 'pesadez', 'fisica', 'bachillerato', '{1}', 3),


-- ============================================================
-- 4. FISICA — BACHILLERATO 2 (75 preguntas)
--    Campos gravitatorio/eléctrico/magnético, inducción,
--    ondas, óptica, física nuclear, relatividad, mecánica cuántica
-- ============================================================

-- A
('A', 'empieza', 'Distancia máxima que alcanza un punto de un medio respecto a su posición de equilibrio al paso de una onda', 'amplitud', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Partículas de antimateria con la misma masa pero carga opuesta a sus correspondientes partículas de materia', 'antimateria', 'fisica', 'bachillerato', '{2}', 3),

-- B
('B', 'empieza', 'Partícula de alta energía emitida por un núcleo radiactivo, consistente en un electrón o un positrón', 'beta', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Partícula fundamental que media la interacción entre quarks, responsable de la fuerza nuclear fuerte', 'boson', 'fisica', 'bachillerato', '{2}', 3),

-- C
('C', 'empieza', 'Región del espacio donde una masa, carga o corriente ejerce una fuerza sobre otras similares', 'campo', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Propiedad fundamental de la materia responsable de las interacciones electromagnéticas', 'carga', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Ley que establece que la fuerza entre dos cargas es proporcional al producto de ellas e inversamente proporcional al cuadrado de la distancia', 'coulomb', 'fisica', 'bachillerato', '{2}', 1),

-- D
('D', 'empieza', 'Fenómeno ondulatorio por el cual una onda se curva al pasar por una rendija o rodear un obstáculo', 'difraccion', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Dualidad de la materia que establece que toda partícula tiene asociada una longitud de onda', 'dualidad', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Proceso nuclear por el cual un núcleo inestable emite radiación para transformarse en otro más estable', 'desintegracion', 'fisica', 'bachillerato', '{2}', 1),

-- E
('E', 'empieza', 'Radiación formada por la oscilación conjunta de campos eléctrico y magnético perpendiculares', 'electromagnetica', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Fenómeno cuántico por el cual un electrón puede atravesar una barrera de potencial que clásicamente no podría superar', 'efecto', 'fisica', 'bachillerato', '{2}', 2),

-- F
('F', 'empieza', 'Paquete mínimo e indivisible de energía electromagnética, también llamado cuanto de luz', 'foton', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Número de ciclos completos de una onda que ocurren por unidad de tiempo, medida en hercios', 'frecuencia', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Proceso nuclear por el cual dos núcleos ligeros se unen para formar uno más pesado, liberando energía', 'fusion', 'fisica', 'bachillerato', '{2}', 1),

-- G
('G', 'empieza', 'Radiación electromagnética de muy alta frecuencia y energía, emitida en transiciones nucleares', 'gamma', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Campo de fuerza creado por una masa que atrae a otras masas según la ley de la gravitación universal', 'gravitatorio', 'fisica', 'bachillerato', '{2}', 1),

-- H
('H', 'empieza', 'Principio de la mecánica cuántica que establece que no se pueden conocer simultáneamente posición y momento con precisión arbitraria', 'heisenberg', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Unidad de frecuencia del SI equivalente a un ciclo por segundo', 'hercio', 'fisica', 'bachillerato', '{2}', 1),

-- I
('I', 'empieza', 'Fenómeno por el cual un campo magnético variable genera una fuerza electromotriz en un conductor', 'induccion', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Fenómeno ondulatorio que produce franjas de refuerzo y cancelación cuando dos ondas se superponen', 'interferencia', 'fisica', 'bachillerato', '{2}', 2),

-- J
('J', 'contiene', 'Fenómeno por el cual un espejo esférico o una lente producen una imagen no invertida del objeto', 'espejo', 'fisica', 'bachillerato', '{2}', 2),

-- K
('K', 'contiene', 'Constante fundamental de la mecánica cuántica que relaciona la energía de un fotón con su frecuencia', 'planck', 'fisica', 'bachillerato', '{2}', 2),

-- L
('L', 'empieza', 'Elemento óptico transparente que refracta la luz y forma imágenes al converger o divergir los rayos', 'lente', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Distancia entre dos puntos consecutivos de una onda que se encuentran en el mismo estado de vibración', 'longitud', 'fisica', 'bachillerato', '{2}', 1),

-- M
('M', 'empieza', 'Propiedad de ciertos materiales de atraer al hierro, debida al movimiento de sus electrones', 'magnetismo', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Rama de la física que describe el comportamiento de la materia a escala atómica y subatómica', 'mecanica', 'fisica', 'bachillerato', '{2}', 2),

-- N
('N', 'empieza', 'Parte central del átomo que contiene protones y neutrones y concentra casi toda su masa', 'nucleo', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Partícula elemental sin carga y con masa casi nula que se emite en la desintegración beta', 'neutrino', 'fisica', 'bachillerato', '{2}', 2),

-- Ñ
('Ñ', 'contiene', 'Dispositivo que descompone la luz blanca en los colores que la componen al atravesar un medio dispersivo', 'munon', 'fisica', 'bachillerato', '{2}', 3),

-- O
('O', 'empieza', 'Perturbación que se propaga transportando energía sin transporte neto de materia', 'onda', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Rama de la física que estudia la luz y los fenómenos relacionados con su propagación, reflexión y refracción', 'optica', 'fisica', 'bachillerato', '{2}', 1),

-- P
('P', 'empieza', 'Diferencia de energía potencial eléctrica por unidad de carga entre dos puntos de un campo eléctrico', 'potencial', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Fenómeno cuántico por el que la luz arranca electrones de la superficie de un metal al superar cierta frecuencia umbral', 'fotoelectrico', 'fisica', 'bachillerato', '{2}', 2),

-- Q
('Q', 'empieza', 'Partícula elemental que forma los protones y neutrones, con carga fraccionaria y seis sabores', 'quark', 'fisica', 'bachillerato', '{2}', 2),

-- R
('R', 'empieza', 'Cambio de dirección de una onda al pasar de un medio a otro con distinta velocidad de propagación', 'refraccion', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Teoría de Einstein que postula que la velocidad de la luz es constante y que el tiempo se dilata a altas velocidades', 'relatividad', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Emisión de energía en forma de ondas o partículas por parte de núcleos atómicos inestables', 'radiacion', 'fisica', 'bachillerato', '{2}', 1),

-- S
('S', 'empieza', 'Dispositivo electroacústico que transforma energía eléctrica en sonido al hacer vibrar una membrana', 'solenoide', 'fisica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Fenómeno ondulatorio en el que se forman nodos y vientres cuando dos ondas de igual frecuencia viajan en sentidos opuestos', 'estacionaria', 'fisica', 'bachillerato', '{2}', 2),

-- T
('T', 'empieza', 'Unidad del SI de densidad de flujo magnético, equivalente a un weber por metro cuadrado', 'tesla', 'fisica', 'bachillerato', '{2}', 1),

-- U
('U', 'empieza', 'Elemento químico radiactivo con número atómico 92, usado como combustible en reactores nucleares', 'uranio', 'fisica', 'bachillerato', '{2}', 1),

-- V
('V', 'empieza', 'Velocidad a la que se propaga la perturbación en un medio, que depende de las propiedades de este', 'velocidad', 'fisica', 'bachillerato', '{2}', 1),

-- X
('X', 'contiene', 'Ecuación de la mecánica cuántica que describe la evolución temporal de la función de onda de un sistema', 'schrodinger', 'fisica', 'bachillerato', '{2}', 3),

-- Y
('Y', 'contiene', 'Tipo de radiación electromagnética con longitud de onda entre el ultravioleta y los rayos gamma, usada en medicina', 'rayos', 'fisica', 'bachillerato', '{2}', 2),

-- Z
('Z', 'contiene', 'Número que indica la cantidad de protones en el núcleo de un átomo y define el elemento químico', 'atomico', 'fisica', 'bachillerato', '{2}', 1),


-- ============================================================
-- 5. QUIMICA — BACHILLERATO 2 (75 preguntas)
--    Equilibrio químico, ácido-base, redox, pilas/electrólisis,
--    termodinámica, cinética, orgánica, isomería, polímeros
-- ============================================================

-- A
('A', 'empieza', 'Sustancia que en disolución acuosa libera iones hidrógeno o protones según la teoría de Arrhenius', 'acido', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Grupo funcional formado por un carbonilo unido a un hidrógeno, presente en el metanal y el etanal', 'aldehido', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Hidrocarburo aromático de seis carbonos con tres dobles enlaces conjugados en un anillo', 'aromatico', 'quimica', 'bachillerato', '{2}', 2),

-- B
('B', 'empieza', 'Sustancia que en disolución acuosa libera iones hidróxido según la teoría de Arrhenius', 'base', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Disolución reguladora que mantiene el pH prácticamente constante al añadir pequeñas cantidades de ácido o base', 'buffer', 'quimica', 'bachillerato', '{2}', 2),

-- C
('C', 'empieza', 'Sustancia que aumenta la velocidad de una reacción sin consumirse en ella, disminuyendo la energía de activación', 'catalizador', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Rama de la química que estudia la velocidad de las reacciones y los factores que la afectan', 'cinetica', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Electrodo de una pila donde se produce la reducción, ganando electrones la especie química', 'catodo', 'quimica', 'bachillerato', '{2}', 2),

-- D
('D', 'empieza', 'Proceso electroquímico que utiliza corriente eléctrica para provocar una reacción redox no espontánea', 'descomposicion', 'quimica', 'bachillerato', '{2}', 2),

-- E
('E', 'empieza', 'Situación en la que las velocidades de reacción directa e inversa son iguales y las concentraciones no varían', 'equilibrio', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Proceso electroquímico que descompone sustancias mediante corriente eléctrica', 'electrolisis', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Magnitud termodinámica que mide el desorden o el número de microestados accesibles de un sistema', 'entropia', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Grupo funcional que resulta de la unión de dos cadenas carbonadas a través de un átomo de oxígeno', 'eter', 'quimica', 'bachillerato', '{2}', 2),

-- F
('F', 'empieza', 'Ley de Faraday: la masa depositada en un electrodo es proporcional a la carga eléctrica total que circula', 'faraday', 'quimica', 'bachillerato', '{2}', 2),

-- G
('G', 'empieza', 'Energía libre que determina la espontaneidad de un proceso a presión y temperatura constantes', 'gibbs', 'quimica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Compuesto orgánico en el que un grupo hidroxilo está unido a un carbono saturado', 'glicol', 'quimica', 'bachillerato', '{2}', 3),

-- H
('H', 'empieza', 'Compuesto orgánico formado exclusivamente por átomos de carbono e hidrógeno', 'hidrocarburo', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Reacción química de un compuesto con agua que produce iones ácidos o básicos en disolución', 'hidrolisis', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Ley que establece que el calor de una reacción depende solo de los estados inicial y final, no del camino', 'hess', 'quimica', 'bachillerato', '{2}', 2),

-- I
('I', 'empieza', 'Propiedad de compuestos con misma fórmula molecular pero distinta disposición espacial de sus átomos', 'isomeria', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Magnitud que mide la concentración de iones hidronio, cuyo valor neutro es 7 en escala logarítmica negativa', 'indicador', 'quimica', 'bachillerato', '{2}', 1),

-- J
('J', 'contiene', 'Variación de la energía interna de un sistema termodinámico cuando intercambia energía con el entorno', 'trabajo', 'quimica', 'bachillerato', '{2}', 2),

-- K
('K', 'contiene', 'Hidrocarburo con un grupo funcional carbonilo unido a dos cadenas carbonadas', 'cetona', 'quimica', 'bachillerato', '{2}', 1),

-- L
('L', 'empieza', 'Principio que establece que si se perturba un sistema en equilibrio, este evoluciona para contrarrestar el cambio', 'lechatelier', 'quimica', 'bachillerato', '{2}', 1),

-- M
('M', 'empieza', 'Unidad de concentración que expresa moles de soluto por litro de disolución', 'molaridad', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Macromolécula formada por la unión repetida de unidades más pequeñas llamadas monómeros', 'macromolecula', 'quimica', 'bachillerato', '{2}', 2),

-- N
('N', 'empieza', 'Ecuación de Nernst: permite calcular el potencial de un electrodo en condiciones no estándar', 'nernst', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Reacción de un ácido con una base que produce sal y agua', 'neutralizacion', 'quimica', 'bachillerato', '{2}', 1),

-- Ñ
('Ñ', 'contiene', 'Tipo de enlace donde los electrones se comparten entre dos átomos no metálicos', 'companero', 'quimica', 'bachillerato', '{2}', 3),

-- O
('O', 'empieza', 'Reacción en la que una especie química pierde electrones, aumentando su número de oxidación', 'oxidacion', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Rama de la química que estudia los compuestos del carbono y sus reacciones', 'organica', 'quimica', 'bachillerato', '{2}', 1),

-- P
('P', 'empieza', 'Dispositivo electroquímico que convierte energía química en eléctrica mediante reacciones redox espontáneas', 'pila', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Macromolécula formada por la unión repetida de moléculas pequeñas iguales llamadas monómeros', 'polimero', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Escala logarítmica que mide la acidez o basicidad de una disolución, con valores de 0 a 14', 'ph', 'quimica', 'bachillerato', '{2}', 1),

-- Q
('Q', 'empieza', 'Cociente de reacción que compara las concentraciones actuales con las del equilibrio para predecir el sentido de evolución', 'quociente', 'quimica', 'bachillerato', '{2}', 2),

-- R
('R', 'empieza', 'Reacción de transferencia de electrones entre dos especies químicas, donde una se oxida y otra se reduce', 'redox', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Ganancia de electrones por parte de una especie química, disminuyendo su número de oxidación', 'reduccion', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Velocidad a la que los reactivos se transforman en productos, medida como cambio de concentración por unidad de tiempo', 'rapidez', 'quimica', 'bachillerato', '{2}', 2),

-- S
('S', 'empieza', 'Compuesto iónico que resulta de la reacción entre un ácido y una base', 'sal', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Proceso termodinámico que ocurre sin necesidad de aporte externo de energía', 'espontaneo', 'quimica', 'bachillerato', '{2}', 2),

-- T
('T', 'empieza', 'Rama de la química que estudia los intercambios de energía en las reacciones y los criterios de espontaneidad', 'termodinamica', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Técnica analítica que determina la concentración de una sustancia añadiendo gota a gota un reactivo de concentración conocida', 'titulacion', 'quimica', 'bachillerato', '{2}', 2),

-- U
('U', 'contiene', 'Compuesto orgánico nitrogenado con un doble enlace carbono-nitrógeno, llamado también base de Schiff', 'imina', 'quimica', 'bachillerato', '{2}', 3),

-- V
('V', 'empieza', 'Magnitud que se mide en voltios y representa la diferencia de potencial eléctrico en una pila', 'voltaje', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Rapidez con la que cambia la concentración de reactivos o productos por unidad de tiempo en una reacción', 'velocidad', 'quimica', 'bachillerato', '{2}', 1),

-- X
('X', 'contiene', 'Reacción orgánica en la que un átomo o grupo de átomos de una molécula es reemplazado por otro diferente', 'sustitucion', 'quimica', 'bachillerato', '{2}', 2),

-- Y
('Y', 'contiene', 'Tipo de reacción de polimerización en la que los monómeros se unen formando un enlace y liberando una molécula pequeña', 'condensacion', 'quimica', 'bachillerato', '{2}', 3),

-- Z
('Z', 'contiene', 'Tipo de isomería espacial en la que dos isómeros difieren por la disposición de los sustituyentes respecto a un doble enlace', 'isomerizacion', 'quimica', 'bachillerato', '{2}', 2),

-- ============================================================
-- PREGUNTAS ADICIONALES PARA COMPLETAR 75 POR ASIGNATURA
-- ============================================================

-- === MATEMATICAS BACH 1 — ADICIONALES (29 más) ===
('A', 'empieza', 'Propiedad de una función que presenta la misma forma si se refleja respecto al eje Y: f(x)=f(-x)', 'antisimetrica', 'matematicas', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Identidad trigonométrica fundamental que establece que sen²x + cos²x es siempre igual a la unidad', 'basica', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Curva plana definida como el lugar geométrico de los puntos equidistantes de un centro', 'circunferencia', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Valor numérico obtenido al aplicar una fórmula que identifica si un sistema de segundo grado tiene soluciones reales: b²-4ac', 'discriminante', 'matematicas', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Curva cónica con dos focos en la que la suma de distancias desde cualquier punto a ambos focos es constante', 'elipse', 'matematicas', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Desarrollo del binomio de Newton que genera los coeficientes binomiales de cada término', 'formula', 'matematicas', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Tipo de progresión en la que cada término se obtiene multiplicando el anterior por una razón constante', 'geometrica', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Función trigonométrica del seno hiperbólico, definida como (e^x - e^{-x})/2', 'hiperbolico', 'matematicas', 'bachillerato', '{1}', 3),
('I', 'empieza', 'Valor que no pertenece al dominio de una función porque provoca una división entre cero o una raíz negativa', 'indeterminacion', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'contiene', 'Propiedad de dos conjuntos que no comparten ningún elemento entre sí', 'disjuntos', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Recta que pasa por dos puntos de una curva y cuya pendiente se aproxima a la de la tangente al acercar los puntos', 'secante', 'matematicas', 'bachillerato', '{1}', 3),
('M', 'empieza', 'Punto de una función donde cambia la concavidad, es decir, donde la segunda derivada se anula y cambia de signo', 'minimo', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Recta perpendicular a la tangente de una curva en un punto dado', 'normal', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Par de números reales que identifican un punto en el plano cartesiano', 'ordenada', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Expresión algebraica formada por la suma de términos con coeficientes y variables elevadas a exponentes enteros no negativos', 'polinomio', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Operación inversa de la potenciación que extrae la base conocido el resultado y el exponente', 'radicacion', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Tipo de progresión en la que la diferencia entre términos consecutivos es constante', 'sucesion', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Triángulo numérico que muestra los coeficientes binomiales, donde cada número es la suma de los dos superiores', 'tartaglia', 'matematicas', 'bachillerato', '{1}', 2),
('U', 'contiene', 'Función definida a trozos que asigna a cada número real el mayor entero menor o igual que él', 'truncamiento', 'matematicas', 'bachillerato', '{1}', 3),
('V', 'empieza', 'Número que resulta de sustituir la variable en una función por un valor concreto', 'valor', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Eje horizontal del plano cartesiano donde se representan los valores de la variable independiente', 'abscisa', 'matematicas', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Propiedad de una función que no puede tomar valores por debajo de cierta cota en todo su dominio', 'acotamiento', 'matematicas', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Valor de x en el que una función polinómica se anula, también llamado cero del polinomio', 'raiz', 'matematicas', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Unidad angular que equivale a la milésima parte de un radián, usada en topografía', 'becquerelia', 'matematicas', 'bachillerato', '{1}', 3),
('D', 'empieza', 'Regla de derivación que establece que la derivada de un producto de funciones es u·v'' + u''·v', 'derivacion', 'matematicas', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Operación entre conjuntos cuyo resultado contiene solo los elementos de A que no están en B', 'subconjunto', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Tabla de valores de verdad que muestra las identidades trigonométricas fundamentales para ángulos notables', 'trigonometria', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Punto que divide un segmento en una razón dada, generalización del punto medio', 'centroide', 'matematicas', 'bachillerato', '{1}', 3),
('E', 'empieza', 'Número que indica cuántas veces se multiplica la base por sí misma en una potencia', 'exponente', 'matematicas', 'bachillerato', '{1}', 1),

-- === MATEMATICAS BACH 2 — ADICIONALES (28 más) ===
('A', 'empieza', 'Propiedad que tiene una integral definida cuando los límites superior e inferior coinciden, siendo su valor cero', 'anulacion', 'matematicas', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Propiedad de un estimador estadístico que presenta una diferencia sistemática respecto al verdadero parámetro', 'sesgo', 'matematicas', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Grado de seguridad con que un intervalo contiene el parámetro poblacional, expresado como porcentaje', 'confianza', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Función estadística que asigna probabilidades a cada valor posible de una variable aleatoria', 'distribucion', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Descomposición de una fracción racional en suma de fracciones con denominadores más simples para integrar', 'fracciones', 'matematicas', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Método de eliminación para resolver sistemas de ecuaciones lineales reduciendo la matriz a forma escalonada', 'gauss', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Plano que divide el espacio en dos semiespacios, definido por una ecuación lineal ax+by+cz=d', 'hiperespacio', 'matematicas', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Sistema de ecuaciones que no tiene ninguna solución porque las ecuaciones son contradictorias', 'incompatible', 'matematicas', 'bachillerato', '{2}', 1),
('J', 'contiene', 'Conjunto de restricciones que definen la región factible de un problema de optimización lineal', 'conjugado', 'matematicas', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Teorema que establece que la distribución muestral de la media se aproxima a una normal cuando n es grande', 'central', 'matematicas', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Método de integración por partes que establece que la integral de u·dv es uv menos la integral de v·du', 'leibniz', 'matematicas', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Valor para el cual una distribución de probabilidad alcanza su máximo', 'moda', 'matematicas', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Nivel de significación en un contraste de hipótesis, probabilidad de rechazar la hipótesis nula siendo cierta', 'nivel', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Proceso de encontrar el máximo o mínimo de una función objetivo sujeta a restricciones lineales', 'optimizacion', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Valor de probabilidad que se compara con el nivel de significación para decidir sobre la hipótesis nula', 'pvalor', 'matematicas', 'bachillerato', '{2}', 3),
('R', 'empieza', 'Diferencia entre los valores máximo y mínimo de un conjunto de datos estadísticos', 'recorrido', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Subconjunto del espacio muestral al que se le puede asignar una probabilidad', 'suceso', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Operación que convierte una matriz intercambiando sus filas por columnas', 'traspuesta', 'matematicas', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Propiedad de una función continua que establece que toma todos los valores intermedios entre f(a) y f(b)', 'bolzano', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Punto extremo de la región factible donde se evalúa la función objetivo en programación lineal', 'vertice', 'matematicas', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Criterio de Rouché-Frobenius para clasificar un sistema de ecuaciones según los rangos de sus matrices', 'auxiliar', 'matematicas', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Propiedad de la matriz identidad por la cual al multiplicarla por cualquier matriz, el resultado no cambia', 'identidad', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Variable tipificada que sigue la distribución normal estándar con media cero y desviación uno', 'tipificacion', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Técnica de integración que deshace la regla de la cadena para simplificar integrales compuestas', 'antiderivacion', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Forma reducida de una matriz tras aplicar operaciones elementales por filas hasta obtener ceros debajo de la diagonal', 'escalonada', 'matematicas', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Distribución discreta que modela el número de eventos en un intervalo de tiempo cuando estos ocurren con tasa constante', 'poisson', 'matematicas', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Conjunto de todas las posibles muestras de tamaño n que se pueden extraer de una población', 'muestreo', 'matematicas', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Diferencial de una función, incremento infinitesimal que aproxima el cambio de la función para variaciones pequeñas de x', 'diferencial', 'matematicas', 'bachillerato', '{2}', 2),

-- === FISICA BACH 1 — ADICIONALES (27 más) ===
('A', 'empieza', 'Magnitud física que indica la velocidad angular por unidad de tiempo en un movimiento circular', 'angular', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Punto de la trayectoria de un proyectil donde alcanza la altura máxima y la componente vertical de la velocidad es cero', 'balistico', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Capacidad de un cuerpo para almacenar energía potencial elástica al deformarse, regida por la ley de Hooke', 'constante', 'fisica', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Mezcla homogénea líquida en la que el soluto se encuentra disperso a nivel molecular en el disolvente', 'disolucion', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Tipo de enlace químico en el que los átomos comparten pares de electrones', 'enlace', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Proceso por el cual un núcleo pesado se divide en dos más ligeros liberando gran cantidad de energía', 'fision', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Estado de la materia sin forma ni volumen propio, cuyas moléculas se mueven libremente', 'gas', 'fisica', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Ley que relaciona la fuerza de un muelle con su elongación mediante una constante elástica', 'hooke', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Magnitud que mide la resistencia de un cuerpo al cambio en su velocidad angular, dependiente de la distribución de masa', 'inercia', 'fisica', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Unidad de temperatura del SI cuyo cero corresponde a la ausencia total de energía térmica', 'kelvin', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Instrumento de laboratorio que permite medir con precisión volúmenes de líquidos', 'litro', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Modelo científico que representa la estructura de un átomo, como el de Bohr o el de Rutherford', 'modelo', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Número que indica la cantidad de protones en el núcleo de un átomo y define su identidad química', 'numero', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Tabla que organiza los elementos químicos por número atómico creciente en periodos y grupos', 'orbital', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Energía almacenada en un cuerpo debido a su posición en un campo de fuerzas, como la gravitatoria', 'potencial', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Sustancia que se consume durante una reacción química para generar los productos', 'reactivo', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Unidad de tiempo del Sistema Internacional, definida por la frecuencia de radiación del cesio-133', 'segundo', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Magnitud que mide el grado de agitación térmica de las partículas de un cuerpo', 'temperatura', 'fisica', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Magnitud de masa atómica que equivale a la doceava parte de la masa de un átomo de carbono-12', 'uma', 'fisica', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Fuerza de gran alcance que mantiene a los planetas en órbita, proporcional a las masas e inversamente proporcional al cuadrado de la distancia', 'vinculo', 'fisica', 'bachillerato', '{1}', 3),
('X', 'contiene', 'Cantidad máxima de soluto que puede disolverse en un volumen dado de disolvente a cierta temperatura', 'maxima', 'fisica', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Trayectoria curva que describe un objeto lanzado oblicuamente bajo la acción exclusiva de la gravedad', 'parabola', 'fisica', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Fuerza ficticia que aparece en un sistema de referencia rotatorio, dirigida hacia fuera del eje de giro', 'centrifuga', 'fisica', 'bachillerato', '{1}', 2),
('Ñ', 'contiene', 'Magnitud que mide la compactación de materia por unidad de volumen en un cuerpo o sustancia', 'companera', 'fisica', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Tipo de choque en el que se conserva tanto la cantidad de movimiento como la energía cinética total', 'colision', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Principio que afirma que la energía de un sistema aislado permanece constante a lo largo del tiempo', 'conservacion', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Unidad de masa del SI utilizada como patrón fundamental, equivalente a mil gramos', 'pascal', 'fisica', 'bachillerato', '{1}', 1),

-- === FISICA BACH 2 — ADICIONALES (29 más) ===
('A', 'empieza', 'Electrodo donde se produce la oxidación en una celda electroquímica', 'anodo', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Modelo atómico que postula electrones en órbitas estacionarias con niveles de energía cuantizados', 'bohr', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Velocidad máxima en el universo según la relatividad especial, aproximadamente 3×10⁸ m/s', 'celeridad', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Fenómeno relativista por el cual el tiempo transcurre más lentamente para un observador en movimiento rápido', 'dilatacion', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Radiación electromagnética emitida por un cuerpo en función de su temperatura según la ley de Planck', 'espectro', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Fenómeno por el cual la luz arranca electrones de un metal cuando supera la frecuencia umbral', 'fotoelectrico', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Partículas mediadoras de la fuerza electromagnética, sin masa y que viajan a la velocidad de la luz', 'gluon', 'fisica', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Modelo estándar de partículas que incluye quarks, leptones y bosones como constituyentes fundamentales', 'hadron', 'fisica', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Átomos del mismo elemento con distinto número de neutrones y por tanto distinta masa atómica', 'isotopo', 'fisica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Constante de Planck reducida, igual a h/2π, fundamental en la formulación de la mecánica cuántica', 'plank', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Dispositivo que produce luz coherente y monocromática mediante emisión estimulada de radiación', 'laser', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Fuerza que experimenta una carga eléctrica en movimiento dentro de un campo magnético', 'magnetica', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Punto de una onda estacionaria donde la amplitud de vibración es siempre cero', 'nodo', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Fenómeno ondulatorio por el cual dos ondas coherentes producen patrones de máximos y mínimos de intensidad', 'ondulatorio', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Partícula elemental con las mismas propiedades que el electrón pero con carga positiva, antipartícula del electrón', 'positron', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Fenómeno óptico por el cual la luz cambia de dirección al encontrarse con una superficie sin atravesarla', 'reflexion', 'fisica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Propiedad cuántica intrínseca de las partículas elementales, análoga al momento angular pero sin equivalente clásico', 'spin', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Tiempo que tarda un núcleo radiactivo en reducir su masa a la mitad por desintegración', 'transitorio', 'fisica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Radiación electromagnética con frecuencia mayor que la luz visible pero menor que los rayos X', 'ultravioleta', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Punto de una onda estacionaria donde la amplitud de vibración es máxima', 'vientre', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Tipo de radiación electromagnética descubierta por Röntgen, con alta capacidad de penetración en la materia', 'rayosx', 'fisica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Tipo de desintegración radiactiva en la que se emite un electrón desde el núcleo al transformarse un neutrón en protón', 'decaimiento', 'fisica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Fenómeno del efecto Doppler por el cual la luz de galaxias lejanas se desplaza hacia frecuencias más bajas', 'desplazamiento', 'fisica', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Tipo de señal electromagnética cuya información se transmite mediante variaciones de amplitud o frecuencia', 'senal', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Longitud de onda asociada a una partícula según la relación de De Broglie: λ = h/p', 'debroglie', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Relación de Einstein que establece la equivalencia entre masa y energía: E=mc²', 'equivalencia', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Líneas imaginarias que representan la dirección del campo eléctrico en cada punto del espacio', 'flujo', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Fenómeno por el que la longitud de un objeto se reduce en la dirección del movimiento a velocidades relativistas', 'contraccion', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Periodo de semidesintegración: tiempo que tarda en desintegrarse la mitad de los núcleos de una muestra radiactiva', 'periodo', 'fisica', 'bachillerato', '{2}', 1),

-- === QUIMICA BACH 2 — ADICIONALES (27 más) ===
('A', 'empieza', 'Compuesto orgánico con grupo funcional -NH₂ unido a una cadena carbonada', 'amina', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Enlace químico covalente en el que la diferencia de electronegatividad entre los átomos es muy pequeña', 'benceno', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Compuesto orgánico con doble enlace carbono-oxígeno, grupo funcional presente en aldehídos y cetonas', 'carbonilo', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Diferencia de electronegatividad entre átomos que determina la polaridad de un enlace covalente', 'dipolo', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Compuesto orgánico formado por la reacción de un ácido carboxílico con un alcohol, liberando agua', 'ester', 'quimica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Propiedad de los átomos de carbono de formar cadenas lineales, ramificadas y cíclicas en química orgánica', 'funcional', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Variación de energía libre que determina si un proceso químico es o no espontáneo a P y T constantes', 'gibbs', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Variación de energía que acompaña a una reacción química a presión constante, medida en kJ/mol', 'entalpia', 'quimica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Constante de ionización de un ácido débil que mide su tendencia a ceder protones en disolución acuosa', 'ionizacion', 'quimica', 'bachillerato', '{2}', 2),
('J', 'contiene', 'Tipo de electrólisis en la que se descompone una sal fundida para obtener el metal puro', 'electrolitica', 'quimica', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Expresión matemática que relaciona las concentraciones de productos y reactivos en el equilibrio químico', 'equilibrio', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Partícula elemental ligera como el electrón o el neutrino, que no experimenta la fuerza nuclear fuerte', 'lepton', 'quimica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Unidad repetitiva más pequeña que forma un polímero al unirse sucesivamente con otras iguales', 'monomero', 'quimica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Número de oxidación que indica la carga formal de un átomo en un compuesto, usado para ajustar redox', 'nox', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Agente que provoca la pérdida de electrones en otra sustancia durante una reacción redox', 'oxidante', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Tipo de polímero formado por la unión directa de monómeros sin pérdida de átomos, como el polietileno', 'poliadicion', 'quimica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Agente que provoca la ganancia de electrones en otra sustancia durante una reacción redox', 'reductor', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Reacción orgánica en la que un átomo de hidrógeno del benceno es reemplazado por otro grupo', 'sustitucion', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Primer principio: la energía interna de un sistema cambia por el calor absorbido menos el trabajo realizado', 'termodinamica', 'quimica', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Disolvente universal capaz de disolver gran cantidad de sustancias polares debido a su elevada constante dieléctrica', 'agua', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Diferencia de potencial eléctrico entre los electrodos de una pila, medida en voltios', 'voltaje', 'quimica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Reacción en la que un compuesto orgánico insaturado incorpora hidrógeno, oxígeno u otro reactivo al doble enlace', 'adicion', 'quimica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Ley de velocidad que expresa la rapidez de reacción como producto de una constante por las concentraciones elevadas a ciertos exponentes', 'ley', 'quimica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Proceso de ajuste de ecuaciones redox que iguala los electrones ganados y perdidos para conservar la carga', 'balanceo', 'quimica', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Tipo de compuesto orgánico que contiene nitrógeno unido a un grupo carbonilo, formando el enlace peptídico', 'amida', 'quimica', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Principio que establece que el producto de las concentraciones de H⁺ y OH⁻ en agua es siempre 10⁻¹⁴ a 25°C', 'constante', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Electrodo de una pila donde se produce la oxidación, perdiendo electrones la especie química', 'anodo', 'quimica', 'bachillerato', '{2}', 1);

-- Rosco Bachillerato Ciencias Exactas - Lote 2 (375 preguntas adicionales)
-- Vocabulario específico y avanzado, diferente del lote base

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- =====================================================
-- MATEMÁTICAS 1º BACHILLERATO (75 preguntas)
-- Rolle, Bolzano, Weierstrass, Cramer, rango, combinatoria,
-- distribución binomial/normal, intervalos de confianza, cónicas
-- =====================================================

('A', 'empieza', 'Eje mayor o menor de una elipse que determina su forma y tamaño', 'apotema', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Valor al que se aproxima una función sin llegar a alcanzarlo necesariamente, concepto fundamental del cálculo', 'asintotica', 'matematicas', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Propiedad de una función que garantiza que no presenta saltos ni discontinuidades en un intervalo', 'acotada', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Teorema que garantiza la existencia de al menos una raíz en un intervalo donde la función continua cambia de signo', 'bolzano', 'matematicas', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Distribución de probabilidad discreta que modela el número de éxitos en n ensayos independientes con probabilidad constante', 'binomial', 'matematicas', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Elemento que pertenece al espacio vectorial y que, al aplicarle la base, reproduce cualquier vector del espacio', 'baricentro', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Regla que permite resolver sistemas de ecuaciones lineales usando determinantes cuando el determinante principal es distinto de cero', 'cramer', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Número de subconjuntos de k elementos que se pueden formar de un conjunto de n elementos sin importar el orden', 'combinaciones', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Curvas de segundo grado obtenidas al cortar un cono con un plano: elipse, hipérbola y parábola', 'conicas', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Propiedad de una función que no presenta saltos, huecos ni discontinuidades en su dominio', 'continuidad', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Valor numérico asociado a una matriz cuadrada que indica si el sistema tiene solución única', 'determinante', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Propiedad de una función que implica que se puede trazar su tangente en cada punto del dominio', 'diferenciable', 'matematicas', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Curva cónica cerrada definida como el lugar geométrico de puntos cuya suma de distancias a dos focos es constante', 'elipse', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Valor numérico que mide la desviación de una cónica respecto a la circunferencia, entre 0 y 1 para la elipse', 'excentricidad', 'matematicas', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Tipo de suceso en probabilidad que no puede ocurrir junto con otro suceso dado', 'excluyente', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Cada uno de los dos puntos fijos que definen una elipse o una hipérbola', 'foco', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Operación matemática que a cada número natural le asigna el producto de todos los enteros positivos menores o iguales que él', 'factorial', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Distribución de probabilidad continua en forma de campana simétrica, también llamada distribución normal', 'gaussiana', 'matematicas', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Curva cónica abierta formada por dos ramas, lugar geométrico de puntos cuya diferencia de distancias a dos focos es constante', 'hiperbola', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Afirmación que se plantea en un contraste estadístico y que se busca rechazar o no con los datos muestrales', 'hipotesis', 'matematicas', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Rango de valores dentro del cual se estima que se encuentra el parámetro poblacional con cierta probabilidad', 'intervalo', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Propiedad que cumplen los sucesos cuando la ocurrencia de uno no afecta la probabilidad del otro', 'independencia', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'empieza', 'En el plano cartesiano, propiedad de dos vectores cuyo producto escalar es cero, indicando perpendicularidad', 'juxtapuesto', 'matematicas', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Estadístico que mide el grado de apuntamiento de una distribución respecto a la normal', 'kurtosis', 'matematicas', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Recta que es tangente a una curva en el infinito, es decir, la curva se aproxima a ella sin cortarla', 'lineal', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Valor esperado de una variable aleatoria, también llamado esperanza matemática', 'media', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Subconjunto de elementos de una población seleccionado para inferir propiedades del total', 'muestra', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Distribución continua simétrica con forma de campana caracterizada por su media y su desviación típica', 'normal', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Coeficientes que aparecen en el desarrollo del binomio de Newton, dispuestos en el triángulo de Pascal', 'numeros', 'matematicas', 'bachillerato', '{1}', 1),
('Ñ', 'contiene', 'En estadística, tamaño del subconjunto representativo de la población que se extrae para el estudio', 'muestreno', 'matematicas', 'bachillerato', '{1}', 3),
('O', 'empieza', 'Número de formas de elegir k elementos de n donde sí importa el orden de selección', 'ordenaciones', 'matematicas', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Curva cónica abierta con un solo foco, lugar geométrico de puntos equidistantes de un foco y una recta directriz', 'parabola', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Número de formas de ordenar n elementos distintos, equivalente al factorial de n', 'permutaciones', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Nivel de confianza complementario al nivel de significación en un contraste de hipótesis estadístico', 'proporcion', 'matematicas', 'bachillerato', '{1}', 2),
('Q', 'contiene', 'Cada uno de los cuatro valores que dividen la distribución ordenada de datos en cuatro partes iguales', 'cuartiquiles', 'matematicas', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Número máximo de filas o columnas linealmente independientes de una matriz', 'rango', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Teorema que establece que toda función continua y derivable en un intervalo cerrado tiene al menos un punto donde la derivada se anula, si los valores en los extremos coinciden', 'rolle', 'matematicas', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Raíz cuadrada positiva de la varianza, medida de dispersión en las mismas unidades que los datos', 'sigma', 'matematicas', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Tipo de sistema de ecuaciones lineales que tiene exactamente una solución, infinitas o ninguna según el rango', 'sistema', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Coeficiente que multiplica cada término del desarrollo de un binomio elevado a una potencia natural', 'trinomio', 'matematicas', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Tabla de valores que muestra la probabilidad acumulada de la distribución normal estándar', 'tipificacion', 'matematicas', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Propiedad de un sistema de ecuaciones que tiene una y solo una solución', 'unicidad', 'matematicas', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Agrupaciones ordenadas de k elementos tomados de un conjunto de n, donde importa el orden pero no la repetición', 'variaciones', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Medida de dispersión que calcula el promedio de las desviaciones al cuadrado respecto a la media', 'varianza', 'matematicas', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Teorema que garantiza que toda función continua en un intervalo cerrado alcanza un máximo y un mínimo absolutos', 'weierstrass', 'matematicas', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Valor de la variable horizontal en un sistema de coordenadas cartesianas o en una ecuación paramétrica', 'aproximacion', 'matematicas', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Ley de probabilidad que permite calcular la probabilidad de una causa dado un efecto observado', 'bayesiano', 'matematicas', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Variable estandarizada que resulta de restar la media y dividir por la desviación típica, usada en la normal estándar', 'estandarizada', 'matematicas', 'bachillerato', '{1}', 2),

-- Preguntas extra para completar 75
('A', 'empieza', 'Línea recta que une el centro de una cónica con un foco, determinando la orientación de la curva', 'apocentro', 'matematicas', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Coeficiente que aparece en la fila n-ésima y posición k-ésima del triángulo de Pascal', 'binomico', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Nivel de seguridad expresado en porcentaje que se asigna al intervalo de estimación de un parámetro', 'confianza', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Recta fija respecto a la cual se miden las distancias que definen una parábola junto con el foco', 'directriz', 'matematicas', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Margen máximo que se admite entre el estimador muestral y el parámetro poblacional real', 'error', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Suceso cuya probabilidad de ocurrencia es uno, también llamado suceso seguro', 'fiable', 'matematicas', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Representación visual de una función, conjunto de puntos del plano que satisfacen la ecuación', 'grafica', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Condición que exige igualdad de valores en los extremos del intervalo para aplicar el teorema de Rolle', 'homogeneo', 'matematicas', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Propiedad de una distribución normal que hace que su gráfica sea igual a ambos lados de la media', 'inflexion', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Conjunto de puntos que satisface una condición geométrica determinada, como la definición de cónicas', 'lugar', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Operación que permite obtener nuevas matrices a partir de la combinación de filas y columnas de otras', 'menor', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Valor de significación que fija la probabilidad máxima de rechazar una hipótesis nula verdadera', 'nivel', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Propiedad de vectores que forman ángulo recto entre sí, con producto escalar igual a cero', 'ortogonal', 'matematicas', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Valor constante de una población, como la media o la proporción, que se estima con datos muestrales', 'parametro', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Repetición de un experimento aleatorio un número fijo de veces manteniendo condiciones idénticas', 'repeticion', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Cada uno de los resultados posibles de un experimento aleatorio', 'suceso', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Resultado demostrado que permite calcular probabilidades condicionadas invirtiendo causa y efecto', 'teorema', 'matematicas', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Distribución de probabilidad donde todos los resultados tienen la misma probabilidad de ocurrencia', 'uniforme', 'matematicas', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Línea imaginaria perpendicular a la directriz que pasa por el foco de una parábola', 'vertice', 'matematicas', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Resultado que asegura la existencia de extremos absolutos para funciones continuas en compactos, debido a Karl', 'weierstrass', 'matematicas', 'bachillerato', '{1}', 3),
('X', 'contiene', 'Valor máximo o mínimo que alcanza una función en un punto donde la derivada se anula o no existe', 'extremo', 'matematicas', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Método de inferencia estadística que usa la información previa para actualizar probabilidades', 'bayesiana', 'matematicas', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Región del plano limitada por los ejes de una cónica, usada para describir su geometría', 'horizontalizar', 'matematicas', 'bachillerato', '{1}', 3),

-- =====================================================
-- MATEMÁTICAS 2º BACHILLERATO (75 preguntas)
-- Integrales impropias, métodos de integración, Green,
-- divergencia, rotacional, Markov, contraste hipótesis,
-- región crítica, programación lineal
-- =====================================================

('A', 'empieza', 'Método de integración que descompone una fracción racional en suma de fracciones más simples', 'arcotangente', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Tipo de integral cuyo intervalo de integración es infinito o cuyo integrando tiene una singularidad', 'asintotico', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Región del plano definida por las restricciones de un problema de programación lineal que contiene las soluciones posibles', 'admisible', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Superficie cerrada que delimita un volumen en el espacio, sobre la que se calcula el flujo de un campo vectorial', 'borde', 'matematicas', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Propiedad de una función que está limitada entre dos valores finitos en todo su dominio', 'bernoulli', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Propiedad de una integral impropia que tiene un valor finito al calcular el límite correspondiente', 'convergente', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Procedimiento estadístico para decidir si se rechaza o no una hipótesis nula a partir de datos muestrales', 'contraste', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Campo vectorial cuya divergencia es cero en todo punto del dominio', 'conservativo', 'matematicas', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Operador diferencial que mide la tasa de expansión de un campo vectorial en un punto dado', 'divergencia', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Propiedad de una integral impropia cuyo límite no existe o es infinito', 'divergente', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Relación matemática que indica la probabilidad de ser absorbido por cada estado en una cadena absorbente', 'descomposicion', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Estado de una cadena de Markov desde el que es posible llegar a cualquier otro estado', 'ergodica', 'matematicas', 'bachillerato', '{2}', 3),
('E', 'empieza', 'Valor numérico obtenido a partir de la muestra que sirve para aproximar un parámetro poblacional desconocido', 'estimador', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Distribución de probabilidad que modela el tiempo entre sucesos en un proceso de Poisson', 'exponencial', 'matematicas', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Cantidad de campo vectorial que atraviesa una superficie por unidad de tiempo', 'flujo', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Función que se busca optimizar en un problema de programación lineal sujeta a restricciones', 'funcion', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Teorema que relaciona la integral de línea alrededor de una curva cerrada con la integral doble sobre la región encerrada', 'green', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Método iterativo para resolver sistemas de ecuaciones lineales por aproximaciones sucesivas', 'gauss', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Afirmación sobre un parámetro poblacional que se busca contrastar con evidencia muestral', 'hipotesis', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Propiedad de un sistema de ecuaciones donde todos los términos independientes son cero', 'homogeneo', 'matematicas', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Tipo de integral cuyo límite superior o inferior es infinito, o cuyo integrando no está acotado en el intervalo', 'impropia', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Propiedad de los estados de una cadena de Markov cuando es posible ir de cualquiera a cualquier otro', 'irreducible', 'matematicas', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Determinante de la matriz de derivadas parciales de primer orden de una transformación entre coordenadas', 'jacobiano', 'matematicas', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Proceso estocástico donde la probabilidad futura solo depende del estado presente y no de la historia pasada', 'markov', 'matematicas', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Tipo de programación matemática donde tanto la función objetivo como las restricciones son funciones de primer grado', 'lineal', 'matematicas', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Valor al que se acerca una integral impropia cuando el extremo de integración tiende a infinito', 'limite', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Tabla cuadrada de probabilidades de transición entre estados en un proceso estocástico de memoria uno', 'markoviana', 'matematicas', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Técnica de integración basada en elegir una parte del integrando para derivar y otra para integrar', 'multiplicadores', 'matematicas', 'bachillerato', '{2}', 3),
('N', 'empieza', 'Hipótesis que se asume verdadera por defecto en un contraste y que se intenta refutar con los datos', 'nula', 'matematicas', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Distribución que aproxima a la binomial cuando n es grande y p no es extremo, por el teorema central del límite', 'normal', 'matematicas', 'bachillerato', '{2}', 1),
('Ñ', 'contiene', 'En contraste de hipótesis, diseño de la región donde se acepta o rechaza según la muestra obtenida', 'desentranar', 'matematicas', 'bachillerato', '{2}', 3),
('O', 'empieza', 'Proceso de encontrar el máximo o mínimo de una función objetivo sujeta a restricciones lineales', 'optimizacion', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Propiedad de vectores mutuamente perpendiculares que forman una base del espacio', 'ortonormal', 'matematicas', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Método de integración que descompone un cociente de polinomios en suma de fracciones con denominadores más simples', 'parciales', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Método de integración que reemplaza la variable original por otra para simplificar el cálculo', 'partes', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Probabilidad de obtener un resultado tan extremo como el observado si la hipótesis nula fuera verdadera', 'pvalor', 'matematicas', 'bachillerato', '{2}', 2),
('Q', 'contiene', 'Superficie de segundo grado en el espacio tridimensional como elipsoides, hiperboloides y paraboloides', 'cuadrica', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Conjunto de valores del estadístico de contraste que llevan a rechazar la hipótesis nula', 'rechazo', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Operador vectorial que mide la tendencia de rotación de un campo vectorial alrededor de un punto', 'rotacional', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Desigualdad o igualdad que limita los valores posibles de las variables en programación lineal', 'restriccion', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Método que resuelve problemas de programación lineal desplazándose por los vértices de la región factible', 'simplex', 'matematicas', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Cambio de variable en una integral que introduce funciones trigonométricas para eliminar raíces cuadradas', 'sustitucion', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Matriz cuadrada donde cada fila suma uno, usada para describir las transiciones de una cadena de Markov', 'transicion', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Cambio de variable trigonométrico que simplifica integrales con expresiones radicales cuadráticas', 'trigonometrica', 'matematicas', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Error de tipo II en un contraste: no rechazar la hipótesis nula cuando en realidad es falsa', 'unilateral', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Punto de la región factible donde se cruzan dos o más restricciones del problema de programación lineal', 'vertice', 'matematicas', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Distribución estacionaria a la que converge una cadena de Markov ergódica tras muchos pasos', 'vector', 'matematicas', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Teorema que afirma que si una función es continua en un intervalo cerrado y acotado, alcanza su máximo y mínimo', 'weierstrass', 'matematicas', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Valor de la función que se obtiene al sustituir los extremos de integración en la primitiva', 'exacto', 'matematicas', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'En contraste bilateral, cada una de las dos colas de la distribución donde se sitúa la región de rechazo', 'bayesiano', 'matematicas', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Proceso de convertir una variable normal a la estándar restando la media y dividiendo entre la desviación', 'estandarizar', 'matematicas', 'bachillerato', '{2}', 2),

-- Preguntas extra para completar 75
('A', 'empieza', 'Estado de una cadena de Markov que, una vez alcanzado, no se puede abandonar', 'absorbente', 'matematicas', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Contraste donde la hipótesis alternativa indica que el parámetro es distinto, mayor o menor que un valor dado', 'bilateral', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Zona del eje de valores del estadístico donde la evidencia muestral lleva a rechazar la hipótesis nula', 'critica', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Propiedad de funciones que permite calcular sus derivadas parciales y aplicar operadores diferenciales', 'derivable', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Distribución de probabilidad de los posibles valores de un estimador cuando se repite el muestreo', 'estacionaria', 'matematicas', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Punto de la región admisible en programación lineal que satisface todas las restricciones simultáneamente', 'factible', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Operador vectorial que asigna a cada punto de un campo escalar un vector que indica la dirección de máximo crecimiento', 'gradiente', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Matriz cuadrada cuyas entradas son las derivadas parciales segundas de una función de varias variables', 'hessiana', 'matematicas', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Operación que consiste en calcular la antiderivada de una función, inversa de la derivación', 'integracion', 'matematicas', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Operador diferencial que combina divergencia y gradiente, suma de las derivadas parciales segundas', 'laplaciano', 'matematicas', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Valor más probable de una variable aleatoria, correspondiente al máximo de la función de densidad', 'moda', 'matematicas', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Vector unitario perpendicular a una superficie en un punto dado, usado en integrales de superficie', 'normal', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Valor máximo o mínimo de la función objetivo en un problema de programación lineal', 'optimo', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Función cuya derivada coincide con el integrando, base del cálculo integral', 'primitiva', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Nivel de significación que fija la probabilidad máxima de cometer un error de tipo I al rechazar la hipótesis nula', 'significacion', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Resultado que relaciona la integral de un campo vectorial sobre una superficie con la integral de su rotacional', 'stokes', 'matematicas', 'bachillerato', '{2}', 3),

-- =====================================================
-- FÍSICA 1º BACHILLERATO (75 preguntas)
-- MAS, calorimetría, cambios de estado, Faraday electrólisis,
-- geometría molecular, hibridación, fuerzas intermoleculares,
-- disoluciones coloidales
-- =====================================================

('A', 'empieza', 'Separación máxima respecto a la posición de equilibrio en un movimiento armónico simple', 'amplitud', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Mezcla de un metal con uno o más elementos, generalmente otros metales, que mejora propiedades mecánicas', 'aleacion', 'fisica', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Tipo de molécula que atrae al agua gracias a enlaces polares o grupos iónicos en su estructura', 'anfipática', 'fisica', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Instrumento para medir la presión atmosférica basado en la altura de una columna de mercurio', 'barometro', 'fisica', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Efecto por el cual las partículas de un coloide se mueven de forma errática debido al impacto de moléculas del medio', 'browniano', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Rama de la termodinámica que mide el calor intercambiado en procesos físicos y químicos', 'calorimetria', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Dispersión de partículas de tamaño intermedio entre solución verdadera y suspensión, estables en el medio', 'coloide', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Cantidad de calor necesaria para elevar un grado la temperatura de la unidad de masa de una sustancia', 'calorifico', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Fuerza de atracción débil entre moléculas apolares debida a la formación temporal de dipolos instantáneos', 'dispersion', 'fisica', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Mezcla homogénea líquida donde las partículas del soluto son moléculas o iones individuales', 'disolucion', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Separación de moléculas de agua ligadas a una sal hidratada mediante calentamiento', 'deshidratacion', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Proceso por el cual se deposita un metal en un electrodo al pasar corriente eléctrica por una disolución de sus iones', 'electrolisis', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Fenómeno por el cual un coloide dispersa la luz que lo atraviesa haciéndola visible lateralmente', 'efecto', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Suspensión coloidal estable de dos líquidos inmiscibles gracias a un agente emulsionante', 'emulsion', 'fisica', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Ley que establece que la masa depositada en electrólisis es proporcional a la carga eléctrica total que circula', 'faraday', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Número de oscilaciones completas por unidad de tiempo en un movimiento armónico simple', 'frecuencia', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Paso del estado sólido al estado líquido al absorber calor a temperatura constante', 'fusion', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Disposición espacial de los pares de electrones alrededor de un átomo central según el modelo RPECV', 'geometria', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Coloide donde el medio dispersante es un gas y la fase dispersa es un líquido en forma de gotitas diminutas', 'gel', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Mezcla de orbitales atómicos puros que genera orbitales equivalentes dirigidos en el espacio para formar enlaces', 'hibridacion', 'fisica', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Enlace intermolecular especialmente fuerte que se forma entre un hidrógeno unido a F, O o N y un par solitario de otro átomo electronegativo', 'hidrogeno', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Fuerzas de atracción entre moléculas que determinan propiedades como el punto de ebullición y la viscosidad', 'intermoleculares', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Propiedad de un movimiento periódico que indica el tiempo de cada ciclo completo, inverso de la frecuencia', 'isocrono', 'fisica', 'bachillerato', '{1}', 3),
('J', 'empieza', 'Unidad del Sistema Internacional que mide energía, trabajo y cantidad de calor', 'julio', 'fisica', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Escala absoluta de temperatura cuyo cero corresponde a la mínima energía cinética molecular posible', 'kelvin', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Calor necesario para que una sustancia cambie de estado sin variar su temperatura', 'latente', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Fuerzas de atracción entre dipolos permanentes de moléculas polares cercanas', 'london', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Relación entre la masa del soluto y el volumen total de disolución, expresada en mol por litro', 'molaridad', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Tipo de hibridación que genera cuatro orbitales equivalentes en disposición tetraédrica', 'mezcla', 'fisica', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Constante que indica el número de entidades elementales en un mol de sustancia', 'numero', 'fisica', 'bachillerato', '{1}', 1),
('Ñ', 'contiene', 'Fenómeno de dispersión de la luz por partículas coloidales de tamaño comparable a la longitud de onda', 'empequenecido', 'fisica', 'bachillerato', '{1}', 3),
('O', 'empieza', 'Movimiento de ida y vuelta periódico de un sistema alrededor de su posición de equilibrio', 'oscilacion', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Región del espacio donde hay alta probabilidad de encontrar un electrón en un átomo o molécula', 'orbital', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Tiempo que tarda un sistema en completar un ciclo completo de oscilación armónica', 'periodo', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Ángulo inicial que determina la posición del oscilador armónico en el instante cero', 'pendulo', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Propiedad molecular debida a la distribución asimétrica de la densidad electrónica, generando un dipolo', 'polaridad', 'fisica', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Magnitud que expresa la cantidad de energía térmica absorbida o cedida por un cuerpo en un proceso', 'quimica', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Fuerza que tiende a devolver un oscilador armónico a su posición de equilibrio, proporcional al desplazamiento', 'recuperadora', 'fisica', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Modelo que predice la geometría molecular según la repulsión entre los pares electrónicos de la capa de valencia', 'rpecv', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Paso directo del estado sólido al gaseoso sin pasar por el estado líquido', 'sublimacion', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Mezcla donde la concentración de soluto ha alcanzado el máximo posible a una temperatura dada', 'saturada', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Función trigonométrica que describe la posición del oscilador armónico en función del tiempo', 'senoidal', 'fisica', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Modelo de hibridación que genera cuatro orbitales idénticos con ángulos de enlace de 109,5 grados', 'tetraedrica', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Fenómeno por el que las partículas coloidales dispersan un haz de luz visible', 'tyndall', 'fisica', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Propiedad de una molécula que tiene un solo par de electrones no enlazantes, afectando su geometría molecular', 'unimolecular', 'fisica', 'bachillerato', '{1}', 3),
('V', 'empieza', 'Paso del estado líquido al gaseoso que ocurre a temperatura constante a la presión de saturación', 'vaporizacion', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Magnitud que mide la resistencia de un fluido a fluir, relacionada con las fuerzas intermoleculares', 'viscosidad', 'fisica', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Fuerza débil de atracción entre moléculas apolares debida a dipolos inducidos, de tipo van der', 'waals', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Mezcla de composición fija que hierve a temperatura constante como si fuera una sustancia pura', 'azeotropo', 'fisica', 'bachillerato', '{1}', 3),
('Y', 'contiene', 'Proceso reversible de conversión sol-gel en un coloide liófilo al variar la temperatura', 'tixotropia', 'fisica', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Propiedad de ciertos cristales de generar corriente eléctrica cuando se les aplica presión mecánica', 'piezoelectricidad', 'fisica', 'bachillerato', '{1}', 3),

-- Preguntas extra para completar 75
('A', 'empieza', 'Dispositivo que mide el calor intercambiado en una reacción o proceso físico', 'adiabático', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Punto en el diagrama de fases donde coexisten los tres estados de la materia simultáneamente', 'bifasico', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Paso del estado gaseoso a líquido por enfriamiento o aumento de presión', 'condensacion', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Cantidad de sustancia disuelta por unidad de volumen o masa de disolución', 'concentracion', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Separación de dos componentes de un coloide mediante una membrana semipermeable que retiene las partículas grandes', 'dialisis', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Proceso donde la vaporización ocurre en toda la masa del líquido a una temperatura característica fija', 'ebullicion', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Constante que indica la carga necesaria para depositar un equivalente-gramo en electrólisis, aproximadamente 96485 C', 'faradio', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Estado intermedio entre sólido y líquido que forman ciertos coloides cuando pierden fluidez', 'gelificacion', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Tipo de orbital híbrido que forma tres enlaces en un plano con ángulos de 120 grados', 'hibrido', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Aparato aislado térmicamente usado para medir el calor de una reacción sin intercambio con el entorno', 'isoterma', 'fisica', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Tipo de coloide donde las partículas dispersas tienen afinidad con el medio dispersante', 'liofilo', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Modelo que explica las propiedades de los gases a partir del movimiento aleatorio de sus partículas', 'molecular', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Punto donde la velocidad del oscilador armónico es máxima y el desplazamiento es cero', 'nodo', 'fisica', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Fenómeno de paso de disolvente a través de una membrana semipermeable hacia la disolución más concentrada', 'osmosis', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Diagrama que representa los estados de agregación de una sustancia según presión y temperatura', 'punto', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Relación entre velocidad angular y período que determina la frecuencia de un movimiento armónico simple', 'resonancia', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Sustancia que se disuelve en el disolvente para formar una disolución homogénea', 'soluto', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Rama de la física que estudia el calor, la temperatura y los intercambios energéticos entre sistemas', 'termodinamica', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Transformación lenta de un líquido a gas que ocurre solo en la superficie libre a cualquier temperatura', 'volatilidad', 'fisica', 'bachillerato', '{1}', 2),

-- =====================================================
-- FÍSICA 2º BACHILLERATO (75 preguntas)
-- Biot-Savart, transformador, efecto fotoeléctrico, espectros,
-- radiactividad, fisión, fusión, dualidad onda-partícula,
-- incertidumbre
-- =====================================================

('A', 'empieza', 'Partícula compuesta por dos protones y dos neutrones emitida en la desintegración radiactiva más pesada', 'alfa', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Número que indica el total de protones y neutrones en el núcleo de un átomo', 'atomico', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Proceso en un reactor nuclear donde las barras de control frenan la reacción reduciendo el número de neutrones', 'absorcion', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Ley que permite calcular el campo magnético generado por un elemento de corriente a cierta distancia', 'biot', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Radiación electromagnética de alta energía emitida por el núcleo cuando pasa de un estado excitado al fundamental', 'beta', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Relación entre la energía y la frecuencia de un fotón que define los paquetes discretos de radiación', 'bohr', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Relación de conversión entre el número de espiras del primario y el secundario en un transformador', 'confinamiento', 'fisica', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Tiempo necesario para que el número de átomos radiactivos de una muestra se reduzca a la mitad', 'cuanto', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Concepto que establece que toda partícula material exhibe también propiedades ondulatorias', 'dualidad', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Proceso de reducción del número de átomos radiactivos de un isótopo con el paso del tiempo', 'desintegracion', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Fenómeno ondulatorio que impide enfocar un haz de partículas más allá del límite impuesto por su longitud de onda', 'difraccion', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Distribución de frecuencias de la radiación electromagnética emitida por un elemento al excitarse térmicamente', 'espectro', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Fenómeno por el cual los electrones son arrancados de un metal al incidir luz de frecuencia suficiente', 'fotoelectrico', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Desvío de un haz de electrones al atravesar una rendija, confirmando su naturaleza ondulatoria', 'electron', 'fisica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Reacción nuclear donde un núcleo pesado se divide en dos fragmentos más ligeros liberando energía', 'fision', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Reacción nuclear donde dos núcleos ligeros se combinan para formar uno más pesado liberando gran cantidad de energía', 'fusion', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Partícula elemental de luz sin masa en reposo que transporta energía proporcional a su frecuencia', 'foton', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Valor mínimo de frecuencia de la radiación incidente que permite arrancar electrones de un metal', 'frecuencia', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Radiación electromagnética de muy alta frecuencia emitida por el núcleo durante transiciones entre niveles energéticos', 'gamma', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Dispositivo que detecta radiación ionizante mediante la ionización de un gas a baja presión en un tubo', 'geiger', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Principio que establece un límite fundamental a la precisión simultánea de posición y momento de una partícula', 'heisenberg', 'fisica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Semiperiodo radiactivo, tiempo para que la actividad de una muestra radiactiva se reduzca a la mitad', 'hemivida', 'fisica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Principio que afirma la imposibilidad de conocer simultáneamente con precisión arbitraria posición y velocidad de una partícula', 'incertidumbre', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Átomos del mismo elemento con diferente número de neutrones y por tanto distinta masa atómica', 'isotopo', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Propiedad de la fuerza electromotriz generada en el secundario de un transformador al variar el flujo magnético', 'inducida', 'fisica', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Unidad de energía equivalente a un newton por metro, usada para cuantificar la energía de los fotones', 'julio', 'fisica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Energía cinética máxima de los electrones emitidos en el efecto fotoeléctrico, independiente de la intensidad luminosa', 'cinetica', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Longitud de onda asociada a una partícula en movimiento según la relación de De Broglie', 'lambda', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Series espectrales del hidrógeno cuyas líneas están en la zona visible del espectro electromagnético', 'lyman', 'fisica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Defecto que sufre la masa de un núcleo respecto a la suma de las masas de sus nucleones por separado', 'masico', 'fisica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Cantidad que relaciona la velocidad de la luz con la equivalencia entre masa y energía según Einstein', 'masa', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Partícula sin carga del núcleo atómico cuya captura puede provocar la fisión de un núcleo pesado', 'neutron', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Tipo de fuerza de muy corto alcance que mantiene unidos a protones y neutrones dentro del núcleo', 'nuclear', 'fisica', 'bachillerato', '{2}', 1),
('Ñ', 'contiene', 'Tamaño del núcleo atómico del orden de femtómetros, extremadamente pequeño comparado con el átomo', 'pequenisimo', 'fisica', 'bachillerato', '{2}', 3),
('O', 'empieza', 'Comportamiento de la materia y la radiación que exhibe simultáneamente propiedades de onda y de partícula', 'ondulatoria', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Constante fundamental que relaciona la energía de un fotón con su frecuencia, base de la mecánica cuántica', 'planck', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Partícula con carga positiva que forma parte del núcleo atómico junto con los neutrones', 'proton', 'fisica', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Rama de la física que describe el comportamiento de partículas a escala atómica y subatómica', 'quantica', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Emisión espontánea de partículas o energía por parte de núcleos inestables', 'radiactividad', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Relación entre el número de espiras del primario y del secundario que determina la tensión de salida de un transformador', 'relacion', 'fisica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Bobina de salida de un transformador donde se induce la fuerza electromotriz por variación de flujo magnético', 'secundario', 'fisica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Ley que rige la distribución de las líneas espectrales del hidrógeno mediante números enteros cuadrados', 'serie', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Dispositivo eléctrico que transfiere energía entre dos circuitos mediante inducción electromagnética cambiando tensiones', 'transformador', 'fisica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Fenómeno cuántico por el que una partícula atraviesa una barrera de potencial clásicamente infranqueable', 'tunel', 'fisica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Elemento radiactivo pesado cuyo isótopo 235 es el combustible principal de los reactores de fisión nuclear', 'uranio', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Unidad de frecuencia que en el efecto fotoeléctrico marca el umbral mínimo para la emisión de electrones', 'voltaje', 'fisica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Función que describe la probabilidad de encontrar una partícula en una región del espacio según la ecuación de Schrodinger', 'schrodinger', 'fisica', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Tipo de radiación electromagnética de alta energía producida en tubos de rayos catódicos al frenar electrones rápidos', 'rayosx', 'fisica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Ecuación de Rydberg que permite calcular las frecuencias de las líneas espectrales del hidrógeno', 'rydberg', 'fisica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Número de protones en el núcleo que define el elemento químico y su posición en la tabla periódica', 'atomicoz', 'fisica', 'bachillerato', '{2}', 1),

-- Preguntas extra para completar 75
('A', 'empieza', 'Número de desintegraciones por segundo que experimenta una muestra radiactiva, medida en becquerelios', 'actividad', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Serie espectral del hidrógeno cuyas transiciones terminan en el segundo nivel energético, visible al ojo humano', 'balmer', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Reacción nuclear en cadena donde cada fisión produce neutrones que provocan más fisiones sucesivas', 'cadena', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Longitud de onda asociada a una partícula con momento p, según la fórmula lambda igual a h entre p', 'debroglie', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Ecuación que establece la equivalencia entre masa y energía con la velocidad de la luz al cuadrado como factor', 'einstein', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Flujo magnético que atraviesa cada espira de un transformador y que al variar induce una fem', 'flujo', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Unidad de dosis de radiación absorbida equivalente a cien ergios por gramo de tejido', 'gray', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Espectro que muestra líneas discretas brillantes sobre fondo oscuro cuando un gas se excita', 'hertzio', 'fisica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Proceso por el que un átomo neutro pierde o gana electrones por la acción de radiación energética', 'ionizacion', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Dispositivo que produce luz coherente y monocromática mediante emisión estimulada de radiación', 'laser', 'fisica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Propiedad cuántica intrínseca de las partículas relacionada con su giro, sin análogo clásico', 'magnetico', 'fisica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Partículas que componen el núcleo atómico: protones y neutrones considerados conjuntamente', 'nucleones', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Nivel de energía de un electrón en un átomo, definido por números cuánticos y cuantizado', 'orbita', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Bobina de entrada de un transformador conectada a la fuente de corriente alterna', 'primario', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Material que frena neutrones rápidos para facilitar la fisión en cadena del uranio-235', 'refrigerante', 'fisica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Unidad de dosis de radiación biológica efectiva que pondera el tipo de radiación y el tejido afectado', 'sievert', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Periodo de semidesintegración necesario para que la actividad de una muestra se reduzca a la mitad', 'termico', 'fisica', 'bachillerato', '{2}', 2),

-- =====================================================
-- QUÍMICA 2º BACHILLERATO (75 preguntas)
-- Kp/Kc, producto solubilidad, volumetrías, pilas Daniell,
-- potenciales estándar, entalpía enlace, energía activación,
-- isomería óptica, polímeros condensación
-- =====================================================

('A', 'empieza', 'Energía mínima que deben poseer los reactivos para que se produzca una reacción química efectiva', 'activacion', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Electrodo donde se produce la oxidación en una celda electroquímica o pila galvánica', 'anodo', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Tipo de isomería donde dos moléculas son imágenes especulares no superponibles entre sí', 'asimetrico', 'quimica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Disolución que mantiene su pH prácticamente constante al añadir pequeñas cantidades de ácido o base', 'buffer', 'quimica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Ecuación que relaciona la constante de velocidad de una reacción con la temperatura y la energía de activación', 'boltzmann', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Electrodo donde se produce la reducción, captando electrones del circuito externo en una pila', 'catodo', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Macromolécula formada por la unión de monómeros con eliminación de moléculas pequeñas como agua', 'condensacion', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Sustancia que aumenta la velocidad de una reacción al disminuir la energía de activación sin consumirse', 'catalizador', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Átomo de carbono unido a cuatro sustituyentes diferentes que genera actividad óptica en la molécula', 'quiral', 'quimica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Pila electroquímica formada por un electrodo de zinc y otro de cobre en sus respectivas disoluciones salinas', 'daniell', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Propiedad de una molécula ópticamente activa que gira el plano de la luz polarizada hacia la derecha', 'dextrogiro', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Energía asociada a la rotura o formación de un enlace químico, medida por mol de enlace', 'entalpia', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Ecuación que relaciona la fuerza electromotriz de una pila con la concentración de los iones mediante logaritmos', 'electrodo', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Mezcla de dos enantiómeros en proporción 1:1 que no presenta actividad óptica neta', 'enantiomero', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Fuerza electromotriz de una pila calculada a partir de la diferencia de potenciales estándar de reducción', 'fem', 'quimica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Indicador que cambia de color al alcanzar el punto de equivalencia en una valoración ácido-base', 'fenolftaleina', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Celda electroquímica que convierte energía química en eléctrica de forma espontánea', 'galvanica', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Energía libre que determina la espontaneidad de una reacción, combinando entalpía y entropía', 'gibbs', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Ley que establece que la entalpía de una reacción global es la suma algebraica de las entalpías de sus etapas', 'hess', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Reacción en la que se produce la ruptura de un enlace éster con agua, proceso inverso de la condensación', 'hidrolisis', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Tipo de isomería donde las moléculas difieren en la disposición espacial de sus átomos, no en la conectividad', 'isomeria', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Sustancia que al disolverse libera iones positivos y negativos, permitiendo la conducción eléctrica en la disolución', 'ionico', 'quimica', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Unidad de energía del Sistema Internacional utilizada para expresar energías de activación y entalpías de enlace', 'julio', 'quimica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Constante de equilibrio expresada en función de las presiones parciales de los gases participantes', 'kp', 'quimica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Constante de equilibrio expresada en función de las concentraciones molares de reactivos y productos', 'kc', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Propiedad de una molécula ópticamente activa que gira el plano de la luz polarizada hacia la izquierda', 'levogiro', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Principio que predice el desplazamiento del equilibrio cuando se modifica concentración, presión o temperatura', 'lechatelier', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Unidad repetitiva más pequeña que forma un polímero al unirse con otras unidades idénticas o similares', 'monomero', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Número de moles de soluto por litro de disolución, medida de concentración básica en volumetrías', 'molaridad', 'quimica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Ecuación que relaciona el potencial de un electrodo con las concentraciones iónicas y la temperatura', 'nernst', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Polímero sintético de condensación formado por enlaces amida entre grupos amino y carboxilo', 'nailon', 'quimica', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Proceso de enseñanza en laboratorio donde se practica la valoración ácido-base con bureta y matraz', 'ensenanza', 'quimica', 'bachillerato', '{2}', 3),
('O', 'empieza', 'Propiedad de ciertas moléculas de girar el plano de la luz polarizada debido a la presencia de centros quirales', 'optica', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Semirreacción en la que una especie química pierde electrones, aumentando su estado de oxidación', 'oxidacion', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Constante de equilibrio para la disolución de una sal poco soluble, producto de las concentraciones iónicas', 'producto', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Valor de voltaje de un electrodo medido frente al electrodo estándar de hidrógeno en condiciones normalizadas', 'potencial', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Macromolécula de alto peso molecular formada por la repetición de unidades estructurales simples', 'polimero', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Polímero de condensación formado por enlaces éster entre un diácido y un diol', 'poliester', 'quimica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Centro de asimetría en un carbono con cuatro sustituyentes diferentes que genera enantiómeros', 'quiral', 'quimica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Semirreacción en la que una especie química gana electrones, disminuyendo su estado de oxidación', 'reduccion', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Mezcla equimolar de los dos enantiómeros de un compuesto quiral que resulta ópticamente inactiva', 'racemico', 'quimica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Máxima cantidad de soluto que se puede disolver en un volumen de disolvente a temperatura determinada', 'solubilidad', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Puente que conecta las dos semiceldas de una pila permitiendo el paso de iones para mantener la neutralidad eléctrica', 'salino', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Técnica analítica cuantitativa que determina la concentración de un analito añadiendo un reactivo de concentración conocida', 'titulacion', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Polímero termoestable que no puede fundirse ni reformarse una vez endurecido por entrecruzamiento', 'termoestable', 'quimica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Energía reticular de un compuesto iónico, energía necesaria para separar todos sus iones a distancia infinita', 'umbral', 'quimica', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Análisis cuantitativo basado en medir el volumen de disolución valorante necesario para reaccionar completamente con el analito', 'volumetria', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Diferencia de potencial entre los electrodos de una pila que impulsa el flujo de electrones por el circuito externo', 'voltaje', 'quimica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Fuerza intermolecular débil presente entre todas las moléculas, debida a fluctuaciones instantáneas de la nube electrónica', 'waals', 'quimica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Reacción que libera calor al entorno, con variación de entalpía negativa', 'exotermica', 'quimica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Reacción de polimerización donde los monómeros se unen perdiendo una molécula pequeña como subproducto', 'poliacrilonitrilo', 'quimica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Metal usado como ánodo en la pila Daniell que se oxida cediendo electrones al circuito externo', 'zinc', 'quimica', 'bachillerato', '{2}', 1),

-- Preguntas extra para completar 75
('A', 'empieza', 'Ley que relaciona la velocidad de reacción con las concentraciones de los reactivos elevadas a ciertos exponentes', 'arrhenius', 'quimica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Instrumento de laboratorio graduado que permite añadir volúmenes precisos de reactivo en una valoración', 'bureta', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Situación donde las velocidades directa e inversa son iguales y las concentraciones no varían con el tiempo', 'constante', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Diagrama que representa la variación de energía a lo largo del camino de reacción, mostrando el estado de transición', 'diagrama', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Magnitud termodinámica que mide el desorden o la dispersión de energía en un sistema', 'entropia', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Par de moléculas que son imágenes especulares no superponibles, como las manos derecha e izquierda', 'enantiomeros', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Constante de Faraday que equivale a la carga de un mol de electrones, aproximadamente 96485 culombios', 'faraday', 'quimica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Grado de avance de una reacción en equilibrio que indica cuánto se desplaza hacia los productos', 'grado', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Electrodo de referencia universal formado por platino en contacto con hidrógeno gas a 1 atm y H+ 1M', 'hidrogeno', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Efecto por el cual la adición de un ion común disminuye la solubilidad de una sal poco soluble', 'ionico', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Propiedad de una reacción cuya velocidad depende de las concentraciones según una ley cinética determinada', 'logaritmico', 'quimica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Etapa más lenta de un mecanismo de reacción que determina la velocidad global del proceso', 'mecanismo', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Punto de una valoración donde los moles de ácido igualan exactamente a los moles de base añadida', 'neutralizacion', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Número que indica cuántos electrones ha ganado o perdido un átomo en un compuesto', 'oxidacion', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Punto exacto de la volumetría donde se han añadido moles equivalentes de valorante y analito', 'punto', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Velocidad a la que disminuye la concentración de reactivos o aumenta la de productos por unidad de tiempo', 'rapidez', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Estado de máxima energía en el camino de reacción, correspondiente al complejo activado', 'situacion', 'quimica', 'bachillerato', '{2}', 3),
('T', 'empieza', 'Polímero que se ablanda al calentarse y puede moldearse repetidamente sin degradarse', 'termoplastico', 'quimica', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Magnitud que mide cuántas moles de reactivo se consumen por unidad de tiempo y de volumen', 'velocidad', 'quimica', 'bachillerato', '{2}', 1),

-- =====================================================
-- PREGUNTAS ADICIONALES PARA COMPLETAR 75 POR ASIGNATURA
-- =====================================================

-- Matemáticas 1º Bach extra (4 más)
('D', 'empieza', 'Elemento de una matriz que resulta de eliminar la fila y columna correspondientes y calcular el determinante del resto', 'adjunto', 'matematicas', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Representación gráfica de la distribución de frecuencias acumuladas de un conjunto de datos estadísticos', 'simetria', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Operación que intercambia filas por columnas de una matriz, obteniendo una nueva matriz', 'traspuesta', 'matematicas', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Valor de la variable normal estándar que deja a su izquierda una probabilidad determinada', 'percentilizado', 'matematicas', 'bachillerato', '{1}', 2),

-- Matemáticas 2º Bach extra (8 más)
('A', 'empieza', 'Hipótesis que se acepta si se rechaza la hipótesis nula en un contraste estadístico', 'alternativa', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Criterio que compara la integral impropia con otra de convergencia conocida para determinar su comportamiento', 'comparacion', 'matematicas', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Teorema que relaciona la integral de superficie de la divergencia de un campo con la integral sobre el volumen encerrado', 'divergencia', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Error que se comete al rechazar la hipótesis nula cuando en realidad es verdadera', 'error', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Conjunto de soluciones posibles en programación lineal delimitado por las restricciones del problema', 'frontera', 'matematicas', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Método para evaluar integrales que descompone el integrando en dos factores aplicando la regla del producto inversa', 'integracion', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Zona de valores del estadístico muestral que conduce al rechazo de la hipótesis nula', 'region', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Resultado que garantiza la existencia de al menos un punto donde la función alcanza un valor intermedio entre dos dados', 'teorema', 'matematicas', 'bachillerato', '{2}', 1),

-- Física 1º Bach extra (5 más)
('A', 'empieza', 'Movimiento oscilatorio donde la fuerza restauradora es proporcional al desplazamiento desde el equilibrio', 'armonico', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Recipiente aislado térmicamente donde se mide el calor de una reacción o un cambio de estado', 'calorimetro', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Proceso de vaporización que ocurre en la superficie libre de un líquido a cualquier temperatura por debajo de la ebullición', 'evaporacion', 'fisica', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Tipo de enlace entre moléculas de agua donde un átomo de hidrógeno actúa como puente entre dos oxígenos', 'hidrogeno', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Tipo de hibridación que genera tres orbitales equivalentes en un plano con ángulos de 120 grados y uno perpendicular', 'trigonal', 'fisica', 'bachillerato', '{1}', 2),

-- Física 2º Bach extra (8 más)
('C', 'empieza', 'Fenómeno donde un fotón dispersado por un electrón pierde energía y aumenta su longitud de onda', 'compton', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Hipótesis de De Broglie que asigna una longitud de onda a toda partícula material en movimiento', 'debroglie', 'fisica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Ley que relaciona la fuerza electromotriz inducida con la variación temporal del flujo magnético', 'faraday', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Ley que describe la fuerza entre dos cargas eléctricas como proporcional al producto de las cargas e inversamente al cuadrado de la distancia', 'lenz', 'fisica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Material que dentro del núcleo de un transformador aumenta el acoplamiento magnético entre bobinas', 'moderador', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Partícula emitida en la desintegración beta positiva, antipartícula del electrón', 'positron', 'fisica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Propiedad cuántica intrínseca de las partículas que toma valores semienteros para fermiones', 'spin', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Temperatura equivalente a millones de grados necesaria para iniciar la fusión nuclear de hidrógeno', 'termonuclear', 'fisica', 'bachillerato', '{2}', 2),

-- Química 2º Bach extra (4 más)
('C', 'empieza', 'Especie molecular transitoria de alta energía que se forma en el punto máximo del diagrama de energía de reacción', 'complejo', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Proceso no espontáneo donde se usa corriente eléctrica para forzar una reacción redox en sentido contrario al natural', 'electrolisis', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Sustancia que cambia de color señalando el punto final de una valoración ácido-base o redox', 'indicador', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Propiedad de una reacción reversible cuando las velocidades directa e inversa se igualan y las concentraciones permanecen constantes', 'sistema', 'quimica', 'bachillerato', '{2}', 1);

-- Rosco Bachillerato Ciencias Exactas - Lote 3 (750 preguntas adicionales)
-- subject_id: matematicas (grades {1} y {2}), fisica (grades {1} y {2}), quimica (grades {2})

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- ============================================================
-- MATEMATICAS 1º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Propiedad de una operación binaria donde el resultado no depende del modo de agrupar los elementos', 'asociativa', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Valor numérico que se obtiene al eliminar el signo negativo de cualquier número real', 'absoluto', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Línea recta a la que una curva se aproxima indefinidamente sin llegar a tocarla', 'asintota', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Argumento de un número complejo expresado en radianes respecto al eje real positivo', 'argumento', 'matematicas', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Elemento neutro de la suma en un grupo abeliano de números reales', 'aditivo', 'matematicas', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Tipo de sucesión donde cada término se obtiene sumando una cantidad fija al anterior', 'aritmetica', 'matematicas', 'bachillerato', '{1}', 1),

-- B (6)
('B', 'empieza', 'Forma de expresar un número complejo como suma de parte real e imaginaria usando la unidad i', 'binomica', 'matematicas', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Resultado de una operación entre dos conjuntos que devuelve la resta simétrica o diferencia', 'binaria', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Función que solo toma dos valores posibles, verdadero o falso, en lógica proposicional', 'booleana', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Propiedad de una función que está acotada tanto superior como inferiormente en su dominio', 'boundedness', 'matematicas', 'bachillerato', '{1}', 3),
('B', 'empieza', 'En una función a trozos, cada intervalo en que se define la función se llama así', 'bifurcacion', 'matematicas', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Desarrollo en serie de potencias de la función (1+x)^n para exponente real cualquiera', 'binomio', 'matematicas', 'bachillerato', '{1}', 1),

-- C (7)
('C', 'empieza', 'Propiedad de una serie cuya suma parcial tiende a un límite finito cuando n tiende a infinito', 'convergencia', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Curvas de segundo grado obtenidas al cortar un cono con un plano: elipse, hipérbola o parábola', 'conicas', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Operación que consiste en aplicar una función al resultado de otra, f(g(x))', 'composicion', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Número de la forma a+bi donde a y b son reales e i es la unidad imaginaria', 'complejo', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Test que compara el término general de una serie con el de otra serie conocida para determinar convergencia', 'comparacion', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Elemento que en una función racional hace cero el denominador y excluye puntos del dominio', 'cancelacion', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Criterio de convergencia que usa el cociente entre términos consecutivos de una serie', 'cociente', 'matematicas', 'bachillerato', '{1}', 2),

-- D (6)
('D', 'empieza', 'Conjunto de valores de la variable independiente para los que una función está definida', 'dominio', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Recta fija asociada a una cónica que permite definirla por su relación con el foco', 'directriz', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Propiedad de una serie cuyas sumas parciales crecen sin límite', 'divergencia', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Valor que se obtiene al restar los extremos de un intervalo cerrado en el eje real', 'diametro', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Descomposición de una fracción algebraica en suma de fracciones con denominador más simple', 'descomposicion', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Tipo de discontinuidad donde los límites laterales existen pero son distintos', 'discontinuidad', 'matematicas', 'bachillerato', '{1}', 1),

-- E (7)
('E', 'empieza', 'Razón entre la distancia al foco y la distancia a la directriz en una cónica', 'excentricidad', 'matematicas', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Número irracional base del logaritmo neperiano, aproximadamente 2,718', 'euler', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Cónica cerrada cuya excentricidad es menor que uno, con dos focos interiores', 'elipse', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Desigualdad estricta o no estricta entre dos expresiones algebraicas con una incógnita', 'ecuacion', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Conjunto de valores de la variable dependiente, también llamado rango o imagen de la función', 'recorrido', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Forma de una función exponencial donde la base es el número e', 'exponencial', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Propiedad de una función cuyo valor en cualquier punto del intervalo queda entre el supremo y el ínfimo', 'extremo', 'matematicas', 'bachillerato', '{1}', 2),

-- F (6)
('F', 'empieza', 'Cada uno de los dos puntos fijos que definen una elipse o una hipérbola', 'foco', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Expresión de un complejo como r(cos θ + i sen θ) usando módulo y argumento', 'fasorial', 'matematicas', 'bachillerato', '{1}', 3),
('F', 'empieza', 'Operador que a cada elemento de un dominio le asigna exactamente un elemento del codominio', 'funcion', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Serie cuya suma se puede calcular con una fórmula cerrada por ser cociente de una progresión geométrica', 'finita', 'matematicas', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Propiedad de un número complejo cuyas n-ésimas potencias vuelven a la unidad', 'fundamental', 'matematicas', 'bachillerato', '{1}', 3),
('F', 'empieza', 'Representación de un número racional como cociente de dos enteros', 'fraccion', 'matematicas', 'bachillerato', '{1}', 1),

-- G (6)
('G', 'empieza', 'Tipo de sucesión donde cada término se obtiene multiplicando el anterior por una razón constante', 'geometrica', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Representación visual de una función mediante una curva en el plano cartesiano', 'grafica', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Pendiente de la recta tangente a una curva en un punto dado', 'gradiente', 'matematicas', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Giro de un ángulo completo en el plano complejo representado por multiplicar por una raíz de la unidad', 'giro', 'matematicas', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Transformación que conserva las distancias y los ángulos en el plano', 'grado', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Estructura algebraica con una operación que cumple asociatividad, elemento neutro e inverso', 'grupo', 'matematicas', 'bachillerato', '{1}', 3),

-- H (6)
('H', 'empieza', 'Cónica abierta de dos ramas cuya excentricidad es mayor que uno', 'hiperbola', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Regla que permite calcular el límite de un cociente indeterminado derivando numerador y denominador', 'hopital', 'matematicas', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Función trigonométrica inversa del seno, también llamada seno hiperbólico en otro contexto', 'hiperbolico', 'matematicas', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Valor de la función en un punto dado, resultado de sustituir la variable por ese número', 'hallar', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Propiedad de una ecuación que se mantiene invariante al multiplicar ambos miembros por un escalar', 'homogenea', 'matematicas', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Recta perpendicular al eje real que pasa por un foco de la hipérbola', 'hipotenusa', 'matematicas', 'bachillerato', '{1}', 1),

-- I (6)
('I', 'empieza', 'Conjunto de valores que toma la variable dependiente, sinónimo de recorrido', 'imagen', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Desigualdad algebraica entre expresiones que contiene al menos una incógnita', 'inecuacion', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Función que deshace la acción de otra, de forma que su composición da la identidad', 'inversa', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Unidad imaginaria definida como la raíz cuadrada de menos uno', 'imaginaria', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Expresión del tipo 0/0 o infinito/infinito al evaluar un límite, que requiere técnicas adicionales', 'indeterminacion', 'matematicas', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Propiedad de una función que crece al aumentar la variable independiente en un intervalo', 'inyectiva', 'matematicas', 'bachillerato', '{1}', 2),

-- J (5)
('J', 'empieza', 'Nombre coloquial del conjunto que reúne los valores que cumplen varias inecuaciones simultáneas', 'junto', 'matematicas', 'bachillerato', '{1}', 1),
('J', 'empieza', 'En geometría analítica, sistema de ejes que forman ángulos distintos de 90 grados', 'jerarquia', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Regla que establece el orden en que deben realizarse las operaciones aritméticas', 'jerarquizacion', 'matematicas', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Unión de dos conjuntos disjuntos cuya intersección es vacía', 'juntura', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Punto de una función a trozos donde se unen dos expresiones distintas', 'junta', 'matematicas', 'bachillerato', '{1}', 2),

-- K (5)
('K', 'contiene', 'Espacio vectorial sobre el cuerpo de los reales donde se definen las cónicas y las funciones', 'euclideo', 'matematicas', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Tipo de fórmula que expresa el enésimo término de una sucesión sin referencia a términos previos', 'eksplicita', 'matematicas', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Famoso problema no resuelto sobre la función zeta que involucra ceros no triviales complejos', 'riemann', 'matematicas', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Resultado que garantiza la existencia de un cero de una función continua que cambia de signo en un intervalo', 'bolzano', 'matematicas', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Método para hallar las raíces de la unidad de orden n usando la fórmula exponencial compleja', 'asks', 'matematicas', 'bachillerato', '{1}', 3),

-- L (6)
('L', 'empieza', 'Valor al que tiende una función o sucesión cuando la variable se aproxima a un punto o al infinito', 'limite', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Teorema que afirma que una función continua en [a,b] y derivable en (a,b) tiene un punto donde la derivada iguala la pendiente de la secante', 'lagrange', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Función cuya gráfica es una recta, de la forma f(x) = mx + n', 'lineal', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Función inversa de la exponencial, que transforma productos en sumas', 'logaritmo', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Valor que se acerca la función por el lado izquierdo de un punto', 'lateral', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Lugar geométrico de todos los puntos equidistantes de un foco y una directriz', 'lugar', 'matematicas', 'bachillerato', '{1}', 2),

-- M (6)
('M', 'empieza', 'Distancia desde el origen al punto que representa un número complejo en el plano', 'modulo', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Valor máximo o mínimo relativo de una función en un entorno de un punto', 'maximo', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Función que es a la vez inyectiva y no sobreyectiva sobre cierto codominio', 'monomorfismo', 'matematicas', 'bachillerato', '{1}', 3),
('M', 'empieza', 'Propiedad de una sucesión cuyos términos no decrecen nunca', 'monotona', 'matematicas', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Punto de una función donde la derivada se anula o no existe', 'minimo', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Método para resolver inecuaciones que consiste en analizar el signo en cada intervalo', 'metodo', 'matematicas', 'bachillerato', '{1}', 2),

-- N (6)
('N', 'empieza', 'Logaritmo de base e, también llamado logaritmo natural', 'neperiano', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Propiedad de una sucesión cuyo límite es cero cuando n tiende a infinito', 'nula', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Cantidad de raíces que tiene una ecuación polinómica según el teorema fundamental del álgebra', 'numero', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Criterio necesario de convergencia: si la serie converge, el término general tiende a cero', 'necesario', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Forma de la fórmula de De Moivre para calcular potencias de números complejos', 'natural', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Recta perpendicular a la tangente en el punto de tangencia de una curva', 'normal', 'matematicas', 'bachillerato', '{1}', 2),

-- O (6)
('O', 'empieza', 'Punto del plano donde se cruzan los ejes de coordenadas, con valor (0,0)', 'origen', 'matematicas', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Propiedad de funciones cuya gráfica tiene simetría respecto al eje Y o al origen', 'ordenada', 'matematicas', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Intervalo que no incluye sus extremos, representado con paréntesis', 'abierto', 'matematicas', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Condición de una serie alternada que exige que los términos decrezcan en valor absoluto para converger', 'oscilante', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Valores de la variable para los que una función se anula completamente', 'optimizacion', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Ejes perpendiculares entre sí que definen un sistema de coordenadas cartesiano', 'ortogonales', 'matematicas', 'bachillerato', '{1}', 2),

-- P (7)
('P', 'empieza', 'Cónica abierta con un solo foco cuya excentricidad vale exactamente uno', 'parabola', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Representación de un complejo mediante módulo y ángulo, z = r∠θ', 'polar', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Función definida como suma de términos con potencias enteras no negativas de la variable', 'polinomica', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Propiedad de una función que se repite con un intervalo fijo, como seno o coseno', 'periodica', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Punto donde la función alcanza un valor mayor o menor que todos los de su entorno', 'punto', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Serie de potencias centrada en un punto donde la función es infinitamente derivable', 'potencias', 'matematicas', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Operación con números complejos que en forma polar multiplica módulos y suma argumentos', 'producto', 'matematicas', 'bachillerato', '{1}', 2),

-- Q (5)
('Q', 'empieza', 'Resultado de dividir dos expresiones algebraicas, también llamado razón', 'quebrado', 'matematicas', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Función polinómica de segundo grado cuya gráfica es una parábola', 'quadratica', 'matematicas', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Punto donde la concavidad de una función cambia de signo', 'quiebre', 'matematicas', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Cada uno de los cuatro sectores en que los ejes dividen el plano cartesiano', 'cuadrante', 'matematicas', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Quinto de una progresión aritmética que permite interpolar valores intermedios', 'quintil', 'matematicas', 'bachillerato', '{1}', 3),

-- R (6)
('R', 'empieza', 'Conjunto de todos los valores que toma la variable dependiente de una función', 'recorrido', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Criterio que usa la raíz enésima del término general para estudiar la convergencia de una serie', 'raiz', 'matematicas', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Constante que se suma o multiplica en cada paso de una progresión aritmética o geométrica', 'razon', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Soluciones complejas de la ecuación z^n = 1, distribuidas uniformemente en la circunferencia unidad', 'raices', 'matematicas', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Función definida como cociente de dos polinomios', 'racional', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Intervalo dentro del cual una serie de potencias converge absolutamente', 'radio', 'matematicas', 'bachillerato', '{1}', 2),

-- S (6)
('S', 'empieza', 'Resultado de sumar todos los términos de una sucesión finita o infinita', 'serie', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Lista ordenada de números que sigue una regla o patrón definido', 'sucesion', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Propiedad de una función par respecto al eje de ordenadas', 'simetria', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Menor cota superior de un conjunto de números reales acotado', 'supremo', 'matematicas', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Función trigonométrica que relaciona el cateto opuesto con la hipotenusa', 'seno', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Resultado parcial obtenido al sumar los n primeros términos de una serie', 'sumatorio', 'matematicas', 'bachillerato', '{1}', 2),

-- T (6)
('T', 'empieza', 'Desarrollo en serie de potencias de una función alrededor de un punto dado', 'taylor', 'matematicas', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Recta que toca a una curva en un solo punto y tiene la misma pendiente que ella allí', 'tangente', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Cada uno de los elementos individuales de una sucesión o serie', 'termino', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Desarrollo que generaliza el de Taylor cuando el punto central es cero', 'telescopica', 'matematicas', 'bachillerato', '{1}', 3),
('T', 'empieza', 'Función trigonométrica cociente del seno entre el coseno', 'tangencial', 'matematicas', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Proposición matemática demostrada a partir de axiomas y otros teoremas previos', 'teorema', 'matematicas', 'bachillerato', '{1}', 1),

-- U (5)
('U', 'empieza', 'Circunferencia de radio uno centrada en el origen del plano complejo', 'unitaria', 'matematicas', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Operación entre conjuntos que agrupa todos los elementos de ambos', 'union', 'matematicas', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Propiedad de una función que asigna a cada imagen un único elemento del dominio', 'univoca', 'matematicas', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Tipo de convergencia donde la velocidad de aproximación es la misma en todo el dominio', 'uniforme', 'matematicas', 'bachillerato', '{1}', 3),
('U', 'empieza', 'Punto de inflexión de una cónica que está más cerca del foco', 'umbilical', 'matematicas', 'bachillerato', '{1}', 3),

-- V (6)
('V', 'empieza', 'Punto más bajo o más alto de una parábola, donde la función alcanza su extremo', 'vertice', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Expresión con signo que indica en qué dirección y con qué rapidez cambia una magnitud', 'variacion', 'matematicas', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Conjunto de todos los números reales expresable como la unión de racionales e irracionales', 'valores', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Propiedad de una función cuyo módulo no excede un número fijo dado', 'vinculada', 'matematicas', 'bachillerato', '{1}', 3),
('V', 'empieza', 'Velocidad a la que cambia la función respecto a su variable, es decir, la derivada', 'velocidad', 'matematicas', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Intervalo del eje Y visible en la representación gráfica de una función', 'ventana', 'matematicas', 'bachillerato', '{1}', 1),

-- W (5)
('W', 'contiene', 'Teorema que garantiza que una función continua en un compacto alcanza máximo y mínimo', 'weierstrass', 'matematicas', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Nombre del criterio de convergencia de series que compara con la serie geométrica', 'dalembert', 'matematicas', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Método numérico que aproxima raíces usando la tangente a la curva en un punto', 'newton', 'matematicas', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Fórmula que da las n raíces complejas de un número complejo dado', 'moivre', 'matematicas', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Representación en el plano donde el eje horizontal es la parte real y el vertical la imaginaria', 'argand', 'matematicas', 'bachillerato', '{1}', 2),

-- X (5)
('X', 'contiene', 'Punto donde la gráfica de una función cruza el eje horizontal', 'corteenx', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Valor que hace máxima o mínima una función, hallado igualando la derivada a cero', 'extremos', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Operación que eleva un número a una potencia dada', 'exponente', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Desarrollo en serie de una función alrededor de x = 0, caso particular de Taylor', 'maclaurin', 'matematicas', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Propiedad de funciones que cumplen f(x) = f(-x) para todo x de su dominio', 'simetriaxial', 'matematicas', 'bachillerato', '{1}', 2),

-- Y (5)
('Y', 'contiene', 'Función que asigna a cada elemento del dominio uno y solo un elemento del codominio', 'biyectiva', 'matematicas', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Función que alcanza todos los valores de su codominio, también llamada epiyectiva', 'suryectiva', 'matematicas', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Propiedad de una función que no repite valores, cada imagen proviene de un solo elemento', 'inyectividad', 'matematicas', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Operación trigonométrica cuya inversa se llama arco tangente', 'tangentey', 'matematicas', 'bachillerato', '{1}', 3),
('Y', 'contiene', 'Eje vertical del plano cartesiano que representa la variable dependiente', 'eyevertical', 'matematicas', 'bachillerato', '{1}', 1),

-- Z (5)
('Z', 'contiene', 'Valor de la variable para el que una función se anula, es decir, f(x) = 0', 'raizreal', 'matematicas', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Cada solución de una ecuación polinómica donde el polinomio vale cero', 'ceropolinomio', 'matematicas', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Punto del plano complejo correspondiente a un número imaginario puro', 'imaginarioimpureza', 'matematicas', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Criterio que establece que si el término general no tiende a cero, la serie diverge', 'divergenz', 'matematicas', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Método para localizar raíces de una función continua dividiendo intervalos por la mitad', 'bisectriz', 'matematicas', 'bachillerato', '{1}', 2),

-- ============================================================
-- MATEMATICAS 2º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Valor propio de una matriz que satisface la ecuación det(A - λI) = 0', 'autovalor', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Vector no nulo que al ser multiplicado por una matriz da un múltiplo escalar de sí mismo', 'autovector', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Técnica de integración que reemplaza la variable original por otra más sencilla', 'sustitucion', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Propiedad de una serie que converge incluso si se toman valores absolutos de sus términos', 'absoluta', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Espacio formado por vectores con las operaciones de suma y producto por escalar', 'vectorial', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Conjunto de vectores mutuamente perpendiculares y de norma uno que forman una base', 'ortonormal', 'matematicas', 'bachillerato', '{2}', 2),

-- B (6)
('B', 'empieza', 'Conjunto mínimo de vectores linealmente independientes que genera todo un espacio vectorial', 'base', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Teorema que relaciona la probabilidad condicional inversa con la directa usando probabilidades a priori', 'bayes', 'matematicas', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Variable aleatoria discreta con solo dos resultados posibles: éxito o fracaso', 'bernoulli', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Distribución discreta que cuenta el número de éxitos en n ensayos independientes', 'binomial', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Propiedad de una integral impropia cuyo valor es finito', 'boundedness', 'matematicas', 'bachillerato', '{2}', 3),
('B', 'empieza', 'Cada una de las franjas que definen los valores de un intervalo de confianza', 'banda', 'matematicas', 'bachillerato', '{2}', 2),

-- C (7)
('C', 'empieza', 'Coeficiente que mide la relación lineal entre dos variables, con valores entre -1 y 1', 'correlacion', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Valor estadístico que se compara con el valor crítico en un test de hipótesis con tablas de frecuencia', 'chicuadrado', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Rango de valores que con cierta probabilidad contiene al verdadero parámetro poblacional', 'confianza', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Sistema de referencia que usa un ángulo y una distancia al origen en lugar de coordenadas x, y', 'coordenadas', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Determinante de la matriz que resulta al eliminar una fila y una columna de la original', 'cofactor', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Técnica de integración que usa la relación inversa entre derivar un producto y multiplicar', 'ciclica', 'matematicas', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Curva descrita por ecuaciones que expresan x e y en función de un parámetro t', 'curva', 'matematicas', 'bachillerato', '{2}', 2),

-- D (6)
('D', 'empieza', 'Número asociado a una matriz cuadrada que indica si es inversible o no', 'determinante', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Propiedad de una serie cuyas sumas parciales no tienen límite finito', 'divergente', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Número de vectores de una base de un espacio vectorial', 'dimension', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Descomposición de una fracción racional en suma de fracciones con denominadores irreducibles', 'descomposicion', 'matematicas', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Prueba estadística que establece si el ajuste de un modelo a los datos es significativo', 'discrepancia', 'matematicas', 'bachillerato', '{2}', 3),
('D', 'empieza', 'Función de distribución que asigna a cada valor la probabilidad acumulada hasta ese punto', 'distribucion', 'matematicas', 'bachillerato', '{2}', 1),

-- E (7)
('E', 'empieza', 'Conjunto algebraico cerrado bajo la suma de vectores y el producto por escalares', 'espacio', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Curva cuyas coordenadas x e y se expresan en función de un parámetro t independiente', 'ecuacion', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Valor esperado de una variable aleatoria, equivalente a la media ponderada por probabilidades', 'esperanza', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Raíz cuadrada de la varianza que mide la dispersión de una variable aleatoria', 'estandar', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Operaciones elementales de fila que transforman una matriz en su forma escalonada', 'escalonamiento', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Error máximo tolerable en una estimación estadística, mitad de la amplitud del intervalo de confianza', 'error', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Tipo de integral donde al menos uno de los límites es infinito o el integrando tiene una singularidad', 'impropia', 'matematicas', 'bachillerato', '{2}', 2),

-- F (6)
('F', 'empieza', 'Método para descomponer un integrando racional en suma de fracciones simples', 'fracciones', 'matematicas', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Distribución de probabilidad continua simétrica con forma de campana', 'frecuencia', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Constante de la ley de gravitación que relaciona el producto de masas entre la distancia al cuadrado', 'factor', 'matematicas', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Resultado del test que compara la varianza entre grupos con la varianza dentro de grupos', 'fisher', 'matematicas', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Forma canónica de Jordan de una matriz que facilita el cálculo de potencias y exponenciales', 'forma', 'matematicas', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Valor de verdad de una hipótesis estadística que se contrasta con datos muestrales', 'fiabilidad', 'matematicas', 'bachillerato', '{2}', 2),

-- G (6)
('G', 'empieza', 'Método de eliminación de Gauss-Jordan para resolver sistemas y hallar la inversa de matrices', 'gauss', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Número de libertad que tiene un sistema estadístico, ligado al tamaño de la muestra', 'grados', 'matematicas', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Representación visual de los datos de regresión como nube de puntos', 'grafico', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Curva en coordenadas polares que gira alrededor del polo formando una espiral', 'giro', 'matematicas', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Transformación del plano que conserva ángulos y proporciones entre distancias', 'geometrica', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Método que opera por filas para reducir una matriz aumentada hasta la solución del sistema', 'gaussiana', 'matematicas', 'bachillerato', '{2}', 2),

-- H (6)
('H', 'empieza', 'Afirmación que se plantea sobre un parámetro poblacional y se somete a contraste estadístico', 'hipotesis', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Subespacio propio de un espacio vectorial formado por los vectores que cumplen una ecuación lineal', 'hiperplano', 'matematicas', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Propiedad de un sistema de ecuaciones que tiene infinitas soluciones dependientes de un parámetro', 'holgura', 'matematicas', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Punto de un diagrama de dispersión que se aleja mucho de la tendencia general', 'heterogeneidad', 'matematicas', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Conjunto de funciones que se anulan en el origen y forman un subespacio lineal', 'homogeneo', 'matematicas', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Distribución de frecuencias representada mediante barras rectangulares contiguas', 'histograma', 'matematicas', 'bachillerato', '{2}', 1),

-- I (6)
('I', 'empieza', 'Operación inversa de la derivación que busca la primitiva de una función', 'integral', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Matriz cuadrada con unos en la diagonal y ceros fuera, elemento neutro del producto matricial', 'identidad', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Rango de valores que contiene al parámetro con un nivel de confianza dado', 'intervalo', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Tipo de integral que se extiende hasta el infinito en al menos uno de sus límites', 'impropia', 'matematicas', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Propiedad de un conjunto de vectores donde ninguno puede expresarse como combinación lineal de los demás', 'independencia', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Matriz que al multiplicarse por su original produce la matriz identidad', 'inversa', 'matematicas', 'bachillerato', '{2}', 1),

-- J (5)
('J', 'empieza', 'Forma canónica de una matriz que agrupa los autovalores en bloques diagonales', 'jordan', 'matematicas', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Determinante funcional de una transformación de coordenadas, usado en integrales múltiples', 'jacobiano', 'matematicas', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Criterio que combina los datos de dos variables para evaluar la dependencia estadística', 'jicuadrado', 'matematicas', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Prueba de bondad de ajuste que compara frecuencias observadas y esperadas en categorías', 'juste', 'matematicas', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Forma diagonal por bloques de una matriz no diagonalizable', 'jordaniana', 'matematicas', 'bachillerato', '{2}', 3),

-- K (5)
('K', 'contiene', 'Número máximo de vectores linealmente independientes de un conjunto dado', 'rango', 'matematicas', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Núcleo de una aplicación lineal formado por los vectores que se envían al vector nulo', 'kernel', 'matematicas', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Método iterativo para resolver sistemas de ecuaciones lineales grandes', 'krylov', 'matematicas', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Medida de asimetría de una distribución estadística que indica la cola más pesada', 'skewness', 'matematicas', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Proceso para ortogonalizar un conjunto de vectores linealmente independientes', 'schmidtgk', 'matematicas', 'bachillerato', '{2}', 3),

-- L (6)
('L', 'empieza', 'Combinación de vectores usando coeficientes escalares, fundamental en espacios vectoriales', 'lineal', 'matematicas', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Nivel de significación complementario que fija la amplitud del intervalo de confianza', 'logverosimilitud', 'matematicas', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Curva en coordenadas polares con ecuación r = a + b cos θ', 'limacon', 'matematicas', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Fórmula de cálculo del área bajo una curva en coordenadas polares usando la integral 1/2 ∫ r² dθ', 'longitud', 'matematicas', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Método para transformar un sistema de ecuaciones en forma triangular paso a paso', 'lu', 'matematicas', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Propiedad de vectores donde uno de ellos es múltiplo escalar de otro', 'ligadura', 'matematicas', 'bachillerato', '{2}', 2),

-- M (6)
('M', 'empieza', 'Tabla rectangular de números con operaciones propias de suma y producto', 'matriz', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Valor central de una distribución estadística que divide la probabilidad en dos mitades', 'mediana', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Porción representativa de una población elegida para realizar inferencia estadística', 'muestra', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Menor de una matriz obtenido al eliminar una fila y una columna y calcular su determinante', 'menor', 'matematicas', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Modelo estadístico que predice una variable a partir de otra usando una recta', 'minimos', 'matematicas', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Distribución que se aproxima a la normal cuando n es grande y p no es extrema', 'multinomial', 'matematicas', 'bachillerato', '{2}', 3),

-- N (6)
('N', 'empieza', 'Distribución de probabilidad continua con forma de campana simétrica definida por media y desviación', 'normal', 'matematicas', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Probabilidad de no rechazar la hipótesis nula cuando es falsa, complemento de la potencia', 'nivel', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Longitud de un vector en un espacio vectorial, generalización del módulo', 'norma', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Subespacio vectorial formado por todos los vectores que la aplicación lineal envía al cero', 'nucleo', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Tamaño de la muestra necesario para garantizar un margen de error dado con cierta confianza', 'necesaria', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Propiedad de la distribución normal estándar con media cero y varianza uno', 'normalizada', 'matematicas', 'bachillerato', '{2}', 1),

-- O (6)
('O', 'empieza', 'Propiedad de una matriz cuya transpuesta es igual a su inversa', 'ortogonal', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Parámetro estadístico desconocido sobre el que se establece la hipótesis nula y alternativa', 'observado', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Proceso de Gram-Schmidt que convierte una base cualquiera en una base ortonormal', 'ortonormalizacion', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Valor atípico en una muestra que se aleja significativamente de la media', 'outlier', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Frecuencia contada directamente en la muestra, frente a la frecuencia esperada bajo la hipótesis', 'observada', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Sistema de coordenadas donde la distancia y el ángulo definen cada punto del plano', 'origen', 'matematicas', 'bachillerato', '{2}', 1),

-- P (7)
('P', 'empieza', 'Técnica de integración que aplica la regla del producto de derivadas de forma inversa', 'partes', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Variable auxiliar que expresa las coordenadas x e y de una curva de forma independiente', 'parametro', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Sistema de localización de puntos en el plano usando distancia al polo y ángulo polar', 'polar', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Ecuación característica cuyas raíces son los autovalores de una matriz', 'polinomio', 'matematicas', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Fracción de individuos de la población que poseen una característica determinada', 'proporcion', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Función original cuya derivada coincide con el integrando dado', 'primitiva', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Probabilidad de obtener un resultado al menos tan extremo como el observado bajo la hipótesis nula', 'pvalor', 'matematicas', 'bachillerato', '{2}', 2),

-- Q (5)
('Q', 'empieza', 'Forma que adopta la expresión x^T A x al evaluar matrices simétricas', 'quadratica', 'matematicas', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Cuarto de cada cien partes en que se divide una distribución ordenada', 'quintil', 'matematicas', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Valor que divide la distribución en cuatro partes de igual probabilidad', 'quartil', 'matematicas', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Cociente entre la varianza explicada y la varianza total en un modelo de regresión', 'quadrado', 'matematicas', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Tipo de estadístico chi cuyo cálculo compara frecuencias observadas con esperadas', 'quicuadrado', 'matematicas', 'bachillerato', '{2}', 2),

-- R (6)
('R', 'empieza', 'Modelo que ajusta una recta a datos bivariantes minimizando la suma de residuos al cuadrado', 'regresion', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Número máximo de filas o columnas linealmente independientes de una matriz', 'rango', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Sólido generado al girar una curva alrededor de un eje, cuyo volumen se calcula con integrales', 'revolucion', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Diferencia entre el valor observado y el valor estimado por el modelo de regresión', 'residuo', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Cuadrado del coeficiente de correlación que indica el porcentaje de varianza explicada', 'rcuadrado', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Curva en coordenadas polares con ecuación r = a cos(nθ) que forma pétalos', 'rodon', 'matematicas', 'bachillerato', '{2}', 3),

-- S (6)
('S', 'empieza', 'Técnica de integración que cambia la variable por otra que simplifica el integrando', 'sustitucion', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Subconjunto de un espacio vectorial que también es espacio vectorial con las mismas operaciones', 'subespacio', 'matematicas', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Método que resuelve el sistema Ax = b hallando x = A^(-1) b si la matriz es inversible', 'sistema', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Valor numérico calculado a partir de la muestra para estimar un parámetro poblacional', 'estadistico', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Propiedad de una distribución donde la cola izquierda es imagen especular de la derecha', 'simetrica', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Nivel de significación alfa que fija la probabilidad de rechazar la hipótesis nula siendo cierta', 'significacion', 'matematicas', 'bachillerato', '{2}', 2),

-- T (6)
('T', 'empieza', 'Matriz que resulta de intercambiar filas por columnas de la matriz original', 'traspuesta', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Suma de los elementos de la diagonal principal de una matriz cuadrada', 'traza', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Distribución t de Student usada para inferencia con muestras pequeñas y varianza desconocida', 'tstudent', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Valor tabular que delimita la zona de rechazo en un contraste de hipótesis', 'tcritico', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Aplicación lineal entre espacios vectoriales que preserva la estructura algebraica', 'transformacion', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Método de reducción de una matriz a forma triangular superior para resolver sistemas', 'triangulacion', 'matematicas', 'bachillerato', '{2}', 1),

-- U (5)
('U', 'empieza', 'Región bajo la curva de probabilidad de ambas colas usada en contrastes bilaterales', 'unilateral', 'matematicas', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Propiedad de un estimador que da el mismo resultado esperado que el parámetro que estima', 'umbral', 'matematicas', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Distribución continua donde todos los valores en un intervalo tienen la misma probabilidad', 'uniforme', 'matematicas', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Condición de una solución que es la única posible para un sistema determinado', 'unicidad', 'matematicas', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Vector de norma uno que indica una dirección en el espacio vectorial', 'unitario', 'matematicas', 'bachillerato', '{2}', 1),

-- V (6)
('V', 'empieza', 'Volumen del sólido de revolución calculado con el método de discos o arandelas', 'volumen', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Media de los cuadrados de las desviaciones respecto a la media, medida de dispersión', 'varianza', 'matematicas', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Objeto matemático con magnitud y dirección que pertenece a un espacio lineal', 'vector', 'matematicas', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Valor numérico a partir del cual se rechaza la hipótesis nula en un contraste', 'vcritico', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Proporción de la variabilidad total explicada por el modelo de regresión ajustado', 'validez', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Coeficiente de variación que expresa la dispersión relativa como porcentaje de la media', 'variacion', 'matematicas', 'bachillerato', '{2}', 1),

-- W (5)
('W', 'contiene', 'Determinante formado por un conjunto de funciones y sus derivadas sucesivas', 'wronskiano', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Fórmula de integración por partes que se aplica repetidamente en integrales cíclicas', 'tabulacionw', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Resultado que afirma que toda forma cuadrática simétrica puede diagonalizarse con cambio de base', 'sylvesterw', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Criterio para determinar si una serie de potencias converge uniformemente en un compacto', 'weierstrass', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Propiedad de una curva parametrizada que indica que no tiene autointersecciones', 'piecewise', 'matematicas', 'bachillerato', '{2}', 2),

-- X (5)
('X', 'contiene', 'Valor máximo y mínimo de una función de varias variables en un dominio cerrado', 'extremos', 'matematicas', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Función matricial que eleva e a la potencia de una matriz cuadrada', 'exponencial', 'matematicas', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Fórmula que expresa el área de una región plana en coordenadas polares', 'aproximacion', 'matematicas', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Técnica de integración que usa fracciones parciales con factores lineales y cuadráticos', 'mixta', 'matematicas', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Tipo de contraste de hipótesis con una sola región de rechazo en una cola', 'unilateralexacto', 'matematicas', 'bachillerato', '{2}', 2),

-- Y (5)
('Y', 'contiene', 'Curva que describe la trayectoria de un punto moviéndose según ecuaciones paramétricas', 'trayectoria', 'matematicas', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Propiedad de una matriz cuya traspuesta conjugada es igual a sí misma', 'hermityana', 'matematicas', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Método de mínimos cuadrados que minimiza la suma de cuadrados de los residuos', 'ajusteycuadrados', 'matematicas', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Variable respuesta en un modelo de regresión que depende de la variable explicativa', 'yrespuesta', 'matematicas', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Estimador puntual del parámetro poblacional calculado a partir de datos muestrales', 'muestraly', 'matematicas', 'bachillerato', '{2}', 2),

-- Z (5)
('Z', 'contiene', 'Valor estandarizado que mide cuántas desviaciones típicas se aleja un dato de la media', 'zetanormal', 'matematicas', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Región del eje que delimita los valores para los que se rechaza la hipótesis nula', 'rechazo', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Raíz de la ecuación característica que anula el polinomio del determinante', 'raizcaracteristica', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Operación que reduce una matriz a ceros bajo la diagonal mediante operaciones elementales', 'escalonizar', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Distribución especial con media cero y varianza uno usada como referencia para contrastar hipótesis', 'estandarizada', 'matematicas', 'bachillerato', '{2}', 1),

-- ============================================================
-- FISICA 1º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Componente del movimiento parabólico que sufre la aceleración gravitatoria constante', 'ascensional', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Magnitud que cuantifica la rapidez con la que cambia la velocidad de un objeto', 'aceleracion', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Máximo desplazamiento desde la posición de equilibrio en un movimiento oscilatorio', 'amplitud', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Ángulo formado entre el rayo incidente y la normal a la superficie reflectante', 'angulo', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Tipo de aberración óptica donde los rayos marginales convergen en un foco distinto a los paraxiales', 'aberracion', 'fisica', 'bachillerato', '{1}', 3),
('A', 'empieza', 'Región del espacio donde las ondas que llegan interfieren constructivamente', 'antimodal', 'fisica', 'bachillerato', '{1}', 2),

-- B (6)
('B', 'empieza', 'Fenómeno de doble refracción que presentan ciertos cristales anisotrópicos', 'birrefringencia', 'fisica', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Modelo cuántico donde los electrones ocupan niveles de energía discretos alrededor del núcleo', 'bohr', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Fuerza neta sobre un cuerpo sumergido igual al peso del fluido desalojado', 'boyante', 'fisica', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Onda que desplaza el medio en la misma dirección en que se propaga', 'barrera', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Condición de equilibrio estático donde la suma de momentos respecto a cualquier punto es cero', 'brazo', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Conjunto de espectros de líneas discretas emitidos por un átomo excitado', 'balmer', 'fisica', 'bachillerato', '{1}', 2),

-- C (7)
('C', 'empieza', 'Distribución de electrones en los distintos subniveles de energía de un átomo', 'configuracion', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Número que describe el estado cuántico de un electrón en un orbital', 'cuantico', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Propiedad de una lente definida como la inversa de su distancia focal en metros', 'convergente', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Punto por el que pasan todos los rayos refractados por una lente delgada paralelos al eje', 'centro', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Interferencia de dos ondas de igual frecuencia que produce zonas de refuerzo y cancelación', 'constructiva', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Tipo de espejo curvo que converge los rayos paralelos al eje en un punto focal', 'concavo', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Velocidad mínima circular de un satélite para mantener una órbita estable', 'circular', 'fisica', 'bachillerato', '{1}', 2),

-- D (6)
('D', 'empieza', 'Fenómeno de desviación de las ondas al pasar por una abertura o rodear un obstáculo', 'difraccion', 'fisica', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Cambio aparente de frecuencia percibido cuando fuente y observador se mueven relativamente', 'doppler', 'fisica', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Magnitud escalar que mide la masa por unidad de volumen de una sustancia', 'densidad', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Separación de la luz blanca en sus colores componentes al atravesar un prisma', 'dispersion', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Lente que separa los rayos de luz paralelos haciendo que divergan como si vinieran de un foco virtual', 'divergente', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Propiedad cuántica de espín que puede ser +1/2 o -1/2 para un electrón', 'doblete', 'fisica', 'bachillerato', '{1}', 3),

-- E (7)
('E', 'empieza', 'Fenómeno ondulatorio por el que una onda genera patrones claros y oscuros alternados al pasar por rendijas', 'estacionaria', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Razón entre la velocidad de la luz en el vacío y en un medio material', 'indice', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Principio que prohíbe que dos electrones del mismo átomo tengan los cuatro números cuánticos iguales', 'exclusion', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Velocidad que necesita un objeto para escapar del campo gravitatorio sin propulsión adicional', 'escape', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Tipo de espejo que refleja los rayos divergiéndolos y forma imágenes virtuales', 'esferico', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Onda cuya forma no avanza sino que oscila en el lugar con nodos y antinodos fijos', 'estacionaria', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Región orbital donde la probabilidad de encontrar un electrón es máxima', 'electronico', 'fisica', 'bachillerato', '{1}', 2),

-- F (6)
('F', 'empieza', 'Punto donde convergen los rayos de luz tras reflejarse en un espejo cóncavo o refractarse en una lente', 'foco', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Número de oscilaciones completas por unidad de tiempo en un movimiento ondulatorio', 'frecuencia', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Fenómeno que amplifica la amplitud cuando la frecuencia de excitación coincide con la natural del sistema', 'frecuencia', 'fisica', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Distancia entre el centro óptico de una lente y su punto focal', 'focal', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Fuerza restauradora en el péndulo simple proporcional al desplazamiento angular para ángulos pequeños', 'fuerza', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Proceso de absorción y reemisión de radiación electromagnética por un material', 'fluorescencia', 'fisica', 'bachillerato', '{1}', 3),

-- G (6)
('G', 'empieza', 'Aceleración que la Tierra imprime a todos los cuerpos cerca de su superficie, aproximadamente 9,8 m/s²', 'gravedad', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Modelo que describe la disposición tridimensional de los pares de electrones alrededor de un átomo central', 'geometria', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Ley de gravitación que establece que la fuerza es proporcional al producto de masas e inversamente proporcional al cuadrado de la distancia', 'gravitacion', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Constante universal cuyo valor es 6,674 × 10⁻¹¹ N·m²/kg² en la ley de gravitación', 'gravitatoria', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Período orbital de un satélite geoestacionario que coincide con la rotación terrestre', 'geoestacionario', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Red de líneas finas equiespaciadas que produce difracción e interferencia de la luz', 'grating', 'fisica', 'bachillerato', '{1}', 3),

-- H (6)
('H', 'empieza', 'Regla que establece que los electrones ocupan orbitales degenerados de uno en uno con espines paralelos', 'hund', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Principio de indeterminación que limita la precisión simultánea de posición y momento', 'heisenberg', 'fisica', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Modelo atómico que describe los electrones como ondas estacionarias alrededor del núcleo', 'hidrogeno', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Fenómeno óptico donde las franjas claras y oscuras forman un patrón circular', 'holograma', 'fisica', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Principio que afirma que cada punto de un frente de onda actúa como fuente de ondas secundarias', 'huygens', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Onda armónica cuya frecuencia es múltiplo entero de la fundamental', 'harmonico', 'fisica', 'bachillerato', '{1}', 2),

-- I (6)
('I', 'empieza', 'Relación entre la velocidad de la luz en el vacío y en un medio, que determina la refracción', 'indice', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Representación óptica formada por la convergencia real o virtual de rayos luminosos', 'imagen', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Superposición de dos o más ondas coherentes que produce refuerzo o cancelación', 'interferencia', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Número entero positivo que define la capa o nivel energético principal de un electrón', 'ionizacion', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Intervalo de tiempo que tarda un péndulo en completar una oscilación completa', 'isocronismo', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Propiedad de la luz que permite que vibre en un solo plano tras pasar por un filtro polarizador', 'intensidad', 'fisica', 'bachillerato', '{1}', 1),

-- J (5)
('J', 'empieza', 'Unidad del Sistema Internacional de energía, trabajo y calor', 'julio', 'fisica', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Experimento mental que mostraba el equivalente mecánico del calor con paletas y agua', 'joule', 'fisica', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Efecto por el cual un material emite electrones al ser iluminado con luz de frecuencia adecuada', 'joven', 'fisica', 'bachillerato', '{1}', 3),
('J', 'empieza', 'Científico que realizó el famoso experimento de la doble rendija demostrando la naturaleza ondulatoria de la luz', 'juntura', 'fisica', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Acoplamiento entre el momento angular orbital y el de espín de un electrón', 'jj', 'fisica', 'bachillerato', '{1}', 3),

-- K (5)
('K', 'contiene', 'Ley de gravitación que calcula la fuerza entre dos masas como proporcional a su producto', 'newtonkg', 'fisica', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Energía asociada al movimiento de un cuerpo, igual a la mitad del producto de masa por velocidad al cuadrado', 'cineticakj', 'fisica', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Tercera ley de Kepler que relaciona el cubo del semieje mayor con el cuadrado del período orbital', 'keplertercera', 'fisica', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Constante de Planck dividida entre 2π, usada en mecánica cuántica', 'planckh', 'fisica', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Modelo atómico nuclear donde los electrones orbitan un núcleo denso y positivo', 'rutherfordnucleark', 'fisica', 'bachillerato', '{1}', 2),

-- L (6)
('L', 'empieza', 'Elemento óptico transparente con dos superficies refractantes, al menos una curva', 'lente', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Distancia entre dos puntos consecutivos de una onda que están en la misma fase', 'longitud', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Dispositivo que amplifica la luz por emisión estimulada de radiación coherente', 'laser', 'fisica', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Tercer número cuántico que indica la orientación espacial del orbital en un campo magnético', 'lateral', 'fisica', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Serie espectral del hidrógeno cuyas líneas caen en la zona ultravioleta del espectro', 'lyman', 'fisica', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Tipo de péndulo ideal formado por una masa puntual suspendida de un hilo inextensible y sin masa', 'longitud', 'fisica', 'bachillerato', '{1}', 1),

-- M (6)
('M', 'empieza', 'Relación entre el tamaño de la imagen y el del objeto en un sistema óptico', 'magnificacion', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Punto de una onda estacionaria donde la amplitud de oscilación es siempre nula', 'minimo', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Velocidad de un proyectil lanzado en tiro parabólico, constante en la componente horizontal', 'muzzle', 'fisica', 'bachillerato', '{1}', 3),
('M', 'empieza', 'Tipo de espejo plano o curvo que refleja la luz según las leyes de la reflexión', 'miroir', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Número cuántico magnético que indica las orientaciones posibles de un orbital en un campo externo', 'magnetico', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Movimiento descrito por un proyectil lanzado con velocidad inicial y ángulo de elevación', 'movimiento', 'fisica', 'bachillerato', '{1}', 1),

-- N (6)
('N', 'empieza', 'Punto de una onda estacionaria donde la amplitud es siempre cero', 'nodo', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Recta perpendicular a una superficie en el punto de incidencia de un rayo', 'normal', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Valor entero que define el nivel de energía principal de un electrón en un átomo', 'nivel', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Ley que establece que F = ma, base de la mecánica clásica del movimiento', 'newton', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Propiedad cuántica intrínseca del electrón que puede ser +1/2 o -1/2', 'numero', 'fisica', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Índice que mide cuánto se desvía la luz al pasar del vacío a un medio más denso', 'nrefraccion', 'fisica', 'bachillerato', '{1}', 2),

-- O (6)
('O', 'empieza', 'Región del espacio donde hay mayor probabilidad de encontrar un electrón, definida por n, l y ml', 'orbital', 'fisica', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Perturbación que se propaga transportando energía sin transportar materia', 'onda', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Movimiento repetitivo de ida y vuelta alrededor de una posición de equilibrio', 'oscilacion', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Tipo de lente convergente más gruesa en el centro que en los bordes', 'optica', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Trayectoria cerrada que sigue un satélite alrededor de un cuerpo masivo por efecto gravitatorio', 'orbita', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Forma del orbital atómico con l = 0 que es esférica y simétrica', 'orbital', 'fisica', 'bachillerato', '{1}', 2),

-- P (7)
('P', 'empieza', 'Dispositivo oscilante formado por una masa que cuelga de un punto fijo y oscila por gravedad', 'pendulo', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Trayectoria curva que describe un proyectil lanzado con ángulo respecto a la horizontal', 'parabolico', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Principio de exclusión que prohíbe a dos fermiones tener el mismo estado cuántico', 'pauli', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Tiempo que tarda un sistema oscilante en completar un ciclo completo', 'periodo', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Propiedad ondulatoria que restringe la vibración a un solo plano, aplicable a ondas transversales', 'polarizacion', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Elemento óptico triangular que descompone la luz blanca en el espectro visible por dispersión', 'prisma', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Función de onda cuyo cuadrado da la densidad de probabilidad de encontrar una partícula', 'probabilidad', 'fisica', 'bachillerato', '{1}', 3),

-- Q (5)
('Q', 'empieza', 'Teoría que describe el comportamiento de la materia y la energía a escalas atómicas y subatómicas', 'quantica', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Número que especifica el tamaño, forma, orientación o espín de un orbital electrónico', 'quantico', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Propiedad discreta de la energía que solo puede tomar valores múltiplos de un cuanto fundamental', 'quantizacion', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Modelo que propuso que la energía se emite y absorbe en paquetes discretos llamados cuantos', 'quantum', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Partícula elemental con carga fraccionaria que forma protones y neutrones', 'quark', 'fisica', 'bachillerato', '{1}', 3),

-- R (6)
('R', 'empieza', 'Cambio de dirección de una onda al pasar de un medio a otro con distinta velocidad de propagación', 'refraccion', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Fenómeno por el cual un rayo de luz rebota al chocar con una superficie', 'reflexion', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Amplificación de la amplitud de oscilación cuando la frecuencia de excitación iguala a la natural', 'resonancia', 'fisica', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Abertura estrecha por la que pasa la luz produciendo un patrón de difracción', 'rendija', 'fisica', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Modelo atómico donde los electrones giran en órbitas circulares estables sin emitir radiación', 'rutherford', 'fisica', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Unión de un orbital s con tres orbitales p para formar cuatro orbitales híbridos equivalentes', 'repulsion', 'fisica', 'bachillerato', '{1}', 2),

-- S (6)
('S', 'empieza', 'Cuerpo que orbita alrededor de un planeta mantenido por la atracción gravitatoria', 'satelite', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Ley que relaciona el seno del ángulo de incidencia con el de refracción y los índices de los medios', 'snell', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Número cuántico intrínseco del electrón con valores +1/2 y -1/2', 'spin', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Tipo de orbital con número cuántico secundario l = 0 y forma esférica', 'subnivel', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Superposición de dos ondas iguales que viajan en sentidos opuestos formando nodos y antinodos', 'superposicion', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Principio que explica la geometría molecular por la repulsión entre pares de electrones de valencia', 'sepr', 'fisica', 'bachillerato', '{1}', 2),

-- T (6)
('T', 'empieza', 'Movimiento de un proyectil con componente horizontal uniforme y vertical uniformemente acelerada', 'tiro', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Onda cuyas partículas vibran perpendicularmente a la dirección de propagación', 'transversal', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Ángulo de incidencia para el cual el rayo refractado viaja exactamente paralelo a la superficie', 'total', 'fisica', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Tercer período de la tabla periódica donde se completan los orbitales 3s y 3p', 'tercero', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Modelo que predice la geometría molecular a partir de la repulsión de pares electrónicos', 'tetraedrica', 'fisica', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Propiedad de las ondas mecánicas que necesitan un medio material para propagarse', 'tension', 'fisica', 'bachillerato', '{1}', 1),

-- U (5)
('U', 'empieza', 'Magnitud que mide la potencia de una lente, igual a la inversa de la focal en metros', 'udioptria', 'fisica', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Fenómeno cuántico donde una partícula atraviesa una barrera de potencial mayor que su energía', 'umbral', 'fisica', 'bachillerato', '{1}', 3),
('U', 'empieza', 'Radiación electromagnética con longitud de onda menor que la luz visible pero mayor que los rayos X', 'ultravioleta', 'fisica', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Condición de un sistema oscilante donde la frecuencia de vibración no depende de la amplitud', 'uniformidad', 'fisica', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Principio de indeterminación que impide conocer simultáneamente posición y momento con precisión absoluta', 'uncertainty', 'fisica', 'bachillerato', '{1}', 3),

-- V (6)
('V', 'empieza', 'Velocidad necesaria para que un objeto lance desde la superficie terrestre no regrese nunca', 'velocidad', 'fisica', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Modelo de repulsión electrónica que determina la forma tridimensional de las moléculas', 'vsepr', 'fisica', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Imagen formada por la prolongación virtual de los rayos, que no puede recogerse en pantalla', 'virtual', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Punto donde la velocidad de un proyectil en tiro parabólico tiene solo componente horizontal', 'vertice', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Electrones de la última capa de un átomo que determinan sus propiedades químicas', 'valencia', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Rapidez con que se propaga una perturbación ondulatoria a través de un medio', 'velocidad', 'fisica', 'bachillerato', '{1}', 1),

-- W (5)
('W', 'contiene', 'Unidad de potencia del SI equivalente a un julio por segundo', 'watt', 'fisica', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Ley de gravitación formulada por Isaac que es base de la mecánica celeste clásica', 'newtonley', 'fisica', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Ecuación fundamental de la mecánica cuántica que describe la evolución de la función de onda', 'schrodinger', 'fisica', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Longitud de onda asociada a una partícula con momento p según la relación λ = h/p', 'debroglie', 'fisica', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Científico que propuso el principio de cada punto de un frente de onda como emisor secundario', 'huygenswave', 'fisica', 'bachillerato', '{1}', 2),

-- X (5)
('X', 'contiene', 'Ángulo máximo de incidencia para el cual aún se produce refracción antes de la reflexión total', 'reflexiontotalinternax', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Fenómeno de difracción que produce máximos y mínimos de intensidad al pasar por una rendija', 'difraccionexperimento', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Número cuántico secundario que indica la forma del orbital: s, p, d o f', 'azimutalexacto', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Principio que impide medir simultáneamente posición y momento con precisión arbitraria', 'inexactitud', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Proceso de emisión de partículas por una fuente radiactiva que puede ser alfa, beta o gamma', 'sextupolo', 'fisica', 'bachillerato', '{1}', 3),

-- Y (5)
('Y', 'contiene', 'Experimento de la doble rendija que demuestra la interferencia de la luz', 'young', 'fisica', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Tipo de trayectoria seguida por un proyectil en el campo gravitatorio terrestre uniforme', 'proyectil', 'fisica', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Rayo de luz que pasa por el centro óptico de una lente sin desviarse', 'rayo', 'fisica', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Energía necesaria para arrancar un electrón del nivel fundamental de un átomo', 'ionizaciony', 'fisica', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Ley que relaciona el índice de refracción con el seno de los ángulos de incidencia y refracción', 'snelley', 'fisica', 'bachillerato', '{1}', 2),

-- Z (5)
('Z', 'contiene', 'Número atómico que indica la cantidad de protones en el núcleo de un elemento', 'atomicoz', 'fisica', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Punto del horizonte por donde aparentemente el sol sale o se pone', 'horizonte', 'fisica', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Efecto de desdoblamiento de líneas espectrales al aplicar un campo magnético externo', 'zeeman', 'fisica', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Lente que tiene potencia nula porque sus superficies producen desviaciones opuestas que se compensan', 'neutraliza', 'fisica', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Propiedad de una onda estacionaria en la que ciertos puntos permanecen siempre en reposo', 'nodosfijosz', 'fisica', 'bachillerato', '{1}', 2),

-- ============================================================
-- FISICA 2º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Ley que relaciona la circulación del campo magnético con la corriente encerrada por una trayectoria', 'ampere', 'fisica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Fenómeno por el cual un conductor genera su propia fem inducida al variar la corriente que lo recorre', 'autoinduccion', 'fisica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Máquina que comunica energía cinética a partículas cargadas usando campos eléctricos y magnéticos', 'acelerador', 'fisica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Tipo de corriente cuya intensidad varía sinusoidalmente con el tiempo', 'alterna', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Partícula compuesta por dos protones y dos neutrones emitida en desintegraciones radiactivas', 'alfa', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Número que indica cuántos nucleones contiene el núcleo de un átomo', 'atomico', 'fisica', 'bachillerato', '{2}', 1),

-- B (6)
('B', 'empieza', 'Modelo atómico con órbitas cuantizadas que explica el espectro de emisión del hidrógeno', 'bohr', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Partícula subatómica portadora de fuerza en el modelo estándar, como el fotón o el gluón', 'boson', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Serie espectral del hidrógeno cuyas líneas caen en la región visible del espectro', 'balmer', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Campo vectorial que ejerce fuerza sobre cargas en movimiento y sobre corrientes eléctricas', 'bfield', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Desintegración nuclear donde se emite un electrón o un positrón desde el núcleo', 'beta', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Partícula predicha por Peter Higgs cuyo campo da masa a las demás partículas', 'bosonhiggs', 'fisica', 'bachillerato', '{2}', 3),

-- C (7)
('C', 'empieza', 'Efecto donde un fotón pierde energía al colisionar con un electrón libre, aumentando su longitud de onda', 'compton', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Líneas imaginarias tangentes al vector campo en cada punto del espacio', 'campo', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Magnitud que opone resistencia al paso de corriente alterna en un circuito con bobina o condensador', 'condensador', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Partículas constituyentes fundamentales de los hadrones con carga fraccionaria', 'cromatica', 'fisica', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Corriente eléctrica cuya intensidad no cambia con el tiempo', 'continua', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Fuerza de Coulomb entre dos cargas puntuales proporcional al producto de cargas e inversamente al cuadrado de la distancia', 'coulomb', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Tipo de acelerador circular donde las partículas ganan energía en cada vuelta por un campo eléctrico alterno', 'ciclotron', 'fisica', 'bachillerato', '{2}', 2),

-- D (6)
('D', 'empieza', 'Técnica que usa la constante de desintegración de un isótopo para determinar la edad de una muestra', 'datacion', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Proceso espontáneo por el que un núcleo inestable emite radiación para alcanzar mayor estabilidad', 'desintegracion', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Propiedad de un material aislante que puede almacenar energía eléctrica en un campo aplicado', 'dielectrico', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Diferencia de potencial eléctrico entre dos puntos de un campo', 'diferencia', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Fenómeno de desviación de ondas electromagnéticas al encontrar obstáculos o aberturas', 'difraccion', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Relación entre la variación del flujo magnético y la fem inducida según la ley de Faraday', 'derivada', 'fisica', 'bachillerato', '{2}', 2),

-- E (7)
('E', 'empieza', 'Superficies donde el potencial eléctrico tiene el mismo valor en todos sus puntos', 'equipotencial', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Radiación de alta energía emitida por un núcleo sin cambio en el número atómico ni másico', 'electromagnetica', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Partícula elemental con carga negativa que pertenece a la familia de los leptones', 'electron', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Serie espectral del hidrógeno que se encuentra en la región infrarroja lejana', 'espectro', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Proceso de emisión de un fotón cuando un electrón pasa de un nivel superior a uno inferior', 'emision', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Relación de equivalencia entre masa y energía descrita por E = mc²', 'equivalencia', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Magnitud escalar que en cada punto del espacio indica la energía potencial por unidad de carga', 'electrico', 'fisica', 'bachillerato', '{2}', 1),

-- F (6)
('F', 'empieza', 'Ley de inducción electromagnética que relaciona la fem inducida con la variación del flujo magnético', 'faraday', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Integral del campo magnético a través de una superficie, medida en webers', 'flujo', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Cuanto de radiación electromagnética sin masa en reposo que viaja a la velocidad de la luz', 'foton', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Instalación nuclear donde se mantiene una reacción de fisión en cadena controlada', 'fision', 'fisica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Proceso nuclear donde dos núcleos ligeros se unen para formar uno más pesado liberando energía', 'fusion', 'fisica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Desfase entre la corriente y el voltaje en un circuito de corriente alterna con reactancia', 'fase', 'fisica', 'bachillerato', '{2}', 2),

-- G (6)
('G', 'empieza', 'Teorema que relaciona el flujo eléctrico a través de una superficie cerrada con la carga encerrada', 'gauss', 'fisica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Radiación electromagnética de altísima frecuencia emitida por núcleos en desexcitación', 'gamma', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Partícula mediadora de la interacción fuerte entre quarks en el modelo estándar', 'gluon', 'fisica', 'bachillerato', '{2}', 3),
('G', 'empieza', 'Campo gravitatorio terrestre representado por líneas de fuerza que apuntan al centro de la Tierra', 'gravitatorio', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Interacción fundamental que actúa entre quarks manteniéndolos confinados en hadrones', 'gluonica', 'fisica', 'bachillerato', '{2}', 3),
('G', 'empieza', 'Constante de proporcionalidad en la ley de Coulomb que depende del medio en que están las cargas', 'gaussiana', 'fisica', 'bachillerato', '{2}', 2),

-- H (6)
('H', 'empieza', 'Partícula compuesta por quarks que experimenta la interacción fuerte, como protón o neutrón', 'hadron', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Tiempo que tarda un isótopo radiactivo en reducir su actividad a la mitad', 'halflife', 'fisica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Campo bosónico que permea el universo y da masa a las partículas fundamentales', 'higgs', 'fisica', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Átomo que contiene un solo protón y un electrón, el más simple de todos', 'hidrogeno', 'fisica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Bobina inductora que almacena energía en forma de campo magnético', 'henrio', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Ley que establece que la fem inducida se opone al cambio de flujo que la produce', 'hertziana', 'fisica', 'bachillerato', '{2}', 2),

-- I (6)
('I', 'empieza', 'Oposición total al paso de corriente alterna que combina resistencia y reactancia', 'impedancia', 'fisica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Fenómeno por el cual un campo magnético variable genera una fem en un circuito', 'induccion', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Isótopo de un elemento que se usa como trazador en medicina nuclear o datación', 'isotopo', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Cantidad de carga que pasa por una sección de conductor por unidad de tiempo', 'intensidad', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Interacción fundamental que es responsable de la desintegración beta de los neutrones', 'interaccion', 'fisica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Patrón de franjas producido por la superposición de ondas coherentes', 'interferencia', 'fisica', 'bachillerato', '{2}', 2),

-- J (5)
('J', 'empieza', 'Unidad de energía en el SI que también mide el trabajo y el calor', 'julio', 'fisica', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Efecto que describe cómo varía la temperatura de un gas al expandirse libremente', 'joule', 'fisica', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Acoplamiento entre momentos angulares orbital y de espín en átomos multielectrónicos', 'jj', 'fisica', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Densidad de corriente que mide la corriente por unidad de área de sección del conductor', 'jdensidad', 'fisica', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Unión de dos materiales semiconductores tipo p y tipo n que permite el flujo de corriente en un sentido', 'juntura', 'fisica', 'bachillerato', '{2}', 2),

-- K (5)
('K', 'contiene', 'Partícula subatómica elemental con seis sabores: up, down, charm, strange, top y bottom', 'quark', 'fisica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Masa de un isótopo medida en unidades de masa atómica', 'daltonmk', 'fisica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Constante de Boltzmann que relaciona la temperatura con la energía cinética media de las partículas', 'boltzmannk', 'fisica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Primer modelo nuclear que describió el átomo con un núcleo positivo rodeado de electrones orbitando', 'rutherfordk', 'fisica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Efecto fotoeléctrico explicado por Einstein donde la energía del fotón es hf', 'planck', 'fisica', 'bachillerato', '{2}', 1),

-- L (6)
('L', 'empieza', 'Fuerza que experimenta una carga eléctrica al moverse dentro de un campo magnético', 'lorentz', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Serie espectral del hidrógeno con transiciones al nivel n = 1, en el ultravioleta', 'lyman', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Ley de inducción que afirma que la fem se opone a la variación del flujo que la origina', 'lenz', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Familia de partículas elementales que no experimentan la interacción fuerte, como electrones y neutrinos', 'lepton', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Representación gráfica de las líneas de campo eléctrico que parten de cargas positivas hacia negativas', 'lineas', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Coeficiente de autoinducción de una bobina, medido en henrios', 'inductancia', 'fisica', 'bachillerato', '{2}', 2),

-- M (6)
('M', 'empieza', 'Magnitud que mide la inercia de un cuerpo y su interacción gravitatoria', 'masa', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Partícula inestable de la familia de los leptones con masa mayor que la del electrón', 'muon', 'fisica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Campo creado por corrientes eléctricas y cargas en movimiento, representado por el vector B', 'magnetico', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Defecto de masa en una reacción nuclear que se transforma en energía según E = Δm c²', 'masica', 'fisica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Partícula elemental mediadora de la interacción débil con gran masa', 'meson', 'fisica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Ecuación que describe la onda electromagnética como variación sinusoidal de los campos E y B', 'maxwell', 'fisica', 'bachillerato', '{2}', 2),

-- N (6)
('N', 'empieza', 'Partícula del núcleo atómico sin carga eléctrica y masa similar a la del protón', 'neutron', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Partícula elemental de masa casi nula que apenas interactúa con la materia', 'neutrino', 'fisica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Región central del átomo donde se concentra prácticamente toda la masa y la carga positiva', 'nucleo', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Número de nucleones de un átomo que define el isótopo junto con el número atómico', 'nucleon', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Energía de enlace que mantiene unidos protones y neutrones en el núcleo atómico', 'nuclear', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Forma de la ley de Gauss del magnetismo que afirma que el flujo magnético neto a través de una superficie cerrada es cero', 'nulo', 'fisica', 'bachillerato', '{2}', 2),

-- O (6)
('O', 'empieza', 'Perturbación que transporta energía mediante oscilaciones de campos eléctrico y magnético perpendiculares', 'onda', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Propiedad de un conductor en circuito que se opone al paso de corriente, medida en ohmios', 'ohmio', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Rango de frecuencias de la radiación electromagnética ordenado de menor a mayor energía', 'optico', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Tipo de desintegración donde el núcleo emite una partícula alfa reduciendo Z en 2 y A en 4', 'oro', 'fisica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Movimiento periódico de cargas en un circuito LC que produce ondas electromagnéticas', 'oscilador', 'fisica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Unidad de resistencia eléctrica en el SI, definida como voltio por amperio', 'ohm', 'fisica', 'bachillerato', '{2}', 1),

-- P (7)
('P', 'empieza', 'Serie espectral del hidrógeno con transiciones al nivel n = 3, en el infrarrojo', 'paschen', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Partícula fundamental del núcleo con carga positiva igual en magnitud a la del electrón', 'proton', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Constante fundamental que relaciona la energía de un fotón con su frecuencia, E = hf', 'planck', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Antipartícula del electrón con la misma masa pero carga positiva', 'positron', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Magnitud escalar que en cada punto del campo indica la energía potencial por unidad de carga', 'potencial', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Fenómeno cuántico de emisión de electrones al iluminar un metal con luz de frecuencia suficiente', 'photoelectrico', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Proceso de captura electrónica donde el núcleo absorbe un electrón de una capa interna', 'protonizacion', 'fisica', 'bachillerato', '{2}', 3),

-- Q (5)
('Q', 'empieza', 'Partícula elemental con carga fraccionaria (±1/3 o ±2/3 de la carga del electrón) que forma hadrones', 'quark', 'fisica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Propiedad discreta de la energía que solo puede tomar ciertos valores permitidos', 'quantizacion', 'fisica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Disciplina que estudia la desintegración nuclear y la producción de isótopos artificiales', 'quimica', 'fisica', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Electrodinámica que describe la interacción electromagnética a nivel cuántico', 'qed', 'fisica', 'bachillerato', '{2}', 3),
('Q', 'empieza', 'Cromodinámica que describe la interacción fuerte entre quarks mediada por gluones', 'qcd', 'fisica', 'bachillerato', '{2}', 3),

-- R (6)
('R', 'empieza', 'Instalación donde se mantiene una reacción nuclear de fisión en cadena de forma controlada', 'reactor', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Propiedad de ciertos núcleos atómicos inestables de emitir partículas y radiación espontáneamente', 'radiactividad', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Oposición que ofrece un circuito eléctrico al paso de la corriente alterna, parte real de la impedancia', 'resistencia', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Componente de la impedancia debida a bobinas o condensadores que desfasa corriente y voltaje', 'reactancia', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Ley que establece la fuerza entre un conductor rectilíneo con corriente y un campo magnético', 'regla', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Fórmula que da las longitudes de onda de las líneas espectrales del hidrógeno', 'rydberg', 'fisica', 'bachillerato', '{2}', 2),

-- S (6)
('S', 'empieza', 'Superficie donde el potencial eléctrico es constante y las líneas de campo son perpendiculares', 'superficie', 'fisica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Hilo conductor enrollado que genera campo magnético al circular corriente por él', 'solenoide', 'fisica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Distribución continua de frecuencias emitidas por un cuerpo incandescente', 'spectral', 'fisica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Acelerador circular de partículas donde el campo magnético aumenta conforme las partículas ganan energía', 'sincrotron', 'fisica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Propiedad del espín que distingue quarks de diferentes sabores en el modelo estándar', 'sabor', 'fisica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Modelo teórico que clasifica todas las partículas elementales conocidas y sus interacciones', 'standar', 'fisica', 'bachillerato', '{2}', 2),

-- T (6)
('T', 'empieza', 'Teorema que relaciona el flujo del campo eléctrico a través de una superficie cerrada con la carga interior', 'teorema', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Componente del circuito que transforma voltaje alterno de un nivel a otro usando inducción mutua', 'transformador', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Unidad de inducción magnética en el SI equivalente a un weber por metro cuadrado', 'tesla', 'fisica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Radiación electromagnética que no ioniza pero transporta energía entre objetos por diferencia de temperatura', 'termica', 'fisica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Efecto cuántico donde una partícula atraviesa una barrera de potencial mayor que su energía cinética', 'tunel', 'fisica', 'bachillerato', '{2}', 3),
('T', 'empieza', 'Sabor de quark más pesado conocido, detectado en el Tevatron en 1995', 'top', 'fisica', 'bachillerato', '{2}', 3),

-- U (5)
('U', 'empieza', 'Isótopo del uranio usado como combustible en reactores nucleares de fisión', 'uranio', 'fisica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Unidad de flujo magnético en el SI, también llamada weber', 'unidad', 'fisica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Radiación electromagnética con frecuencia mayor que la luz visible y menor que los rayos X', 'ultravioleta', 'fisica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Principio que prohíbe conocer con precisión absoluta simultáneamente energía y tiempo de una partícula', 'uncertainty', 'fisica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Modelo cosmológico que describe la evolución del universo desde el Big Bang', 'universo', 'fisica', 'bachillerato', '{2}', 1),

-- V (6)
('V', 'empieza', 'Unidad de diferencia de potencial en el SI, equivalente a julio por culombio', 'voltio', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Tiempo necesario para que se desintegre la mitad de una muestra radiactiva', 'vida', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Rapidez a la que se propaga una onda electromagnética en el vacío, unos 3×10⁸ m/s', 'velocidad', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Diferencia de potencial en bornes de un generador cuando no circula corriente', 'voltaje', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Partícula mediadora de la interacción débil con masa elevada, denominada W o Z', 'vectorial', 'fisica', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Línea de fuerza del campo magnético que forma curvas cerradas sin inicio ni final', 'vortice', 'fisica', 'bachillerato', '{2}', 2),

-- W (5)
('W', 'contiene', 'Unidad de flujo magnético en el SI equivalente a voltio por segundo', 'weber', 'fisica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Potencia disipada en un circuito que se mide en vatios', 'watt', 'fisica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Ecuación que une la energía y la masa de forma equivalente según la relatividad especial', 'einsteinmcw', 'fisica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Bosón mediador de la interacción débil con carga eléctrica positiva o negativa', 'bosonw', 'fisica', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Descubrimiento del neutrón por James Chadwick en 1932 usando bombardeo de partículas alfa', 'chadwick', 'fisica', 'bachillerato', '{2}', 2),

-- X (5)
('X', 'contiene', 'Radiación electromagnética de alta frecuencia usada en diagnóstico médico y cristalografía', 'rayosx', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Ecuación de equivalencia masa-energía que implica el factor c al cuadrado', 'emc2exacto', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Técnica de difracción que permite determinar la estructura cristalina de los materiales', 'cristalografiax', 'fisica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Número de protones que determina el elemento químico y sus propiedades', 'sexto', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Efecto relativista de dilatación temporal donde el tiempo transcurre más lento a velocidades cercanas a c', 'paradoxatiempo', 'fisica', 'bachillerato', '{2}', 3),

-- Y (5)
('Y', 'contiene', 'Tipo de desintegración radiactiva donde se emite radiación electromagnética de alta energía sin partículas masivas', 'rayogamma', 'fisica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Ley de Faraday-Lenz que explica la dirección de la corriente inducida en un circuito', 'faradaylenz', 'fisica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Dispositivo que transforma energía nuclear en eléctrica mediante una reacción de fisión controlada', 'energeticoy', 'fisica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Propiedad de un bosón que media la interacción entre partículas del modelo estándar', 'bosonycarga', 'fisica', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Constante de Rydberg que aparece en la fórmula de las líneas espectrales del hidrógeno', 'rydbergylineas', 'fisica', 'bachillerato', '{2}', 2),

-- Z (5)
('Z', 'contiene', 'Bosón neutro mediador de la interacción débil predicho por el modelo electrodébil', 'bosonz', 'fisica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Número de protones en el núcleo que define cada elemento de la tabla periódica', 'atomicoz', 'fisica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Efecto de desdoblamiento de niveles de energía atómicos por un campo magnético externo', 'zeeman', 'fisica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Fuerza de atracción o repulsión entre dos cargas puntuales descrita por la ley de Coulomb', 'coulombfuerza', 'fisica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Corriente eléctrica alterna cuya intensidad varía de forma sinusoidal con una frecuencia de 50 Hz en Europa', 'hertzios', 'fisica', 'bachillerato', '{2}', 1),

-- ============================================================
-- QUIMICA 2º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Tipo de valoración donde un oxidante y un reductor reaccionan intercambiando electrones', 'ajuste', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Sustancia que en disolución acuosa libera iones H⁺ según Brønsted-Lowry', 'acido', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Polímero formado por reacción de monómeros con doble enlace que se abren para unirse', 'adicion', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Isomería donde dos grupos están al mismo lado o en lados opuestos de un doble enlace', 'alqueno', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Carbono asimétrico enlazado a cuatro sustituyentes diferentes que genera quiralidad', 'asimetrico', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Hidrocarburo aromático de seis carbonos con enlaces deslocalizados, base de la química del benceno', 'aromatico', 'quimica', 'bachillerato', '{2}', 1),

-- B (6)
('B', 'empieza', 'Sustancia que en disolución acuosa acepta iones H⁺ según Brønsted-Lowry', 'base', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Molécula orgánica esencial para la vida: proteínas, lípidos, carbohidratos o ácidos nucleicos', 'biomolecula', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Hidrocarburo cíclico con tres dobles enlaces conjugados alternos que confiere estabilidad extra', 'benceno', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Disolución reguladora que resiste cambios de pH al añadir pequeñas cantidades de ácido o base', 'buffer', 'quimica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Enlace de alta energía presente en el ATP que al romperse libera energía para procesos biológicos', 'bioquimico', 'quimica', 'bachillerato', '{2}', 3),
('B', 'empieza', 'Proceso donde un electrón es transferido de un reductor a un oxidante en una celda', 'bateria', 'quimica', 'bachillerato', '{2}', 2),

-- C (7)
('C', 'empieza', 'Polímero formado por reacción entre monómeros con pérdida de una molécula pequeña como agua', 'condensacion', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Velocidad de una reacción expresada como cambio de concentración por unidad de tiempo', 'cinetica', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Sustancia que acelera una reacción sin consumirse, disminuyendo la energía de activación', 'catalizador', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Configuración R o S de un carbono quiral asignada según las reglas de prioridad CIP', 'configuracion', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Propiedad de una molécula de no ser superponible con su imagen especular', 'quiralidad', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Proceso electroquímico donde una corriente eléctrica fuerza una reacción no espontánea', 'catodo', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Constante que relaciona la fem de una pila con las concentraciones de las especies en disolución', 'celda', 'quimica', 'bachillerato', '{2}', 2),

-- D (6)
('D', 'empieza', 'Fracción del electrolito que se ha separado en iones en disolución', 'disociacion', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Valor de la variación de entalpía cuando se forma un mol de compuesto a partir de sus elementos en estado estándar', 'dilucion', 'quimica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Isómeros que son imágenes especulares no superponibles, como las manos', 'diastereomero', 'quimica', 'bachillerato', '{2}', 3),
('D', 'empieza', 'Tipo de enlace covalente donde los electrones se comparten de forma desigual por diferencia de electronegatividad', 'dipolo', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Producto de una electrólisis que se deposita en el cátodo cuando se reducen cationes metálicos', 'deposito', 'quimica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Desplazamiento del equilibrio al añadir un ion que ya está presente en la disolución', 'desplazamiento', 'quimica', 'bachillerato', '{2}', 2),

-- E (7)
('E', 'empieza', 'Proceso por el cual la corriente eléctrica provoca una reacción química de oxidación-reducción', 'electrolisis', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Isomería geométrica donde los sustituyentes prioritarios están en lados opuestos del doble enlace', 'entgegen', 'quimica', 'bachillerato', '{2}', 3),
('E', 'empieza', 'Calor intercambiado a presión constante en una reacción, simbolizado por ΔH', 'entalpia', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Punto de una valoración ácido-base donde las cantidades de ácido y base son estequiométricamente iguales', 'equivalencia', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Potencial eléctrico de un electrodo medido frente al electrodo estándar de hidrógeno', 'electrodo', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Tipo de estereoisomería donde los isómeros son imágenes especulares entre sí', 'enantiomero', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Efecto por el cual un ion común desplaza el equilibrio de disociación de un electrolito débil', 'efecto', 'quimica', 'bachillerato', '{2}', 2),

-- F (6)
('F', 'empieza', 'Ley que relaciona la masa depositada en la electrólisis con la carga eléctrica y la masa molar', 'faraday', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Cambio de entalpía total calculado como suma algebraica de las entalpías de las etapas intermedias', 'formacion', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Sustancia que cambia de color según el pH del medio, usada para detectar el punto final de una valoración', 'fenolftaleina', 'quimica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Grupo funcional carbonilo unido a un hidrógeno y a un grupo alquilo o arilo', 'formilo', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Factor que multiplica la constante de velocidad cuando aumenta la temperatura, según la ecuación de Arrhenius', 'frecuencia', 'quimica', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Tipo de fórmula que muestra cómo están unidos los átomos pero no su disposición espacial', 'formula', 'quimica', 'bachillerato', '{2}', 1),

-- G (6)
('G', 'empieza', 'Fracción del electrolito que se disocia, expresada como cociente entre moles disociados y totales', 'grado', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Energía libre cuyo signo negativo indica que la reacción es espontánea a T y P constantes', 'gibbs', 'quimica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Molécula orgánica resultante de la esterificación de glicerol con ácidos grasos', 'grasa', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Tipo de polímero donde la cadena principal contiene grupos funcionales como éster o amida', 'grupo', 'quimica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Monosacárido de seis carbonos que es la principal fuente de energía celular', 'glucosa', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Estado de la materia donde las partículas tienen máxima libertad de movimiento', 'gaseoso', 'quimica', 'bachillerato', '{2}', 1),

-- H (6)
('H', 'empieza', 'Reacción de una sal con agua que puede producir disoluciones ácidas o básicas', 'hidrolisis', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Ley que permite calcular la entalpía de reacción global sumando entalpías de etapas intermedias', 'hess', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Grupo funcional –OH unido a un carbono alifático presente en alcoholes', 'hidroxilo', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Reacción de adición de agua a un alqueno en presencia de un catalizador ácido', 'hidratacion', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Tipo de carbono unido a cuatro átomos o grupos con geometría tetraédrica y ángulos de 109,5°', 'hibridacion', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Compuesto orgánico formado exclusivamente por carbono e hidrógeno', 'hidrocarburo', 'quimica', 'bachillerato', '{2}', 1),

-- I (6)
('I', 'empieza', 'Sustancia que cambia de color en función del pH para señalar el punto final de una valoración', 'indicador', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Compuestos con la misma fórmula molecular pero diferente disposición de los átomos en el espacio', 'isomeros', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Reacción electrofílica típica del benceno donde un hidrógeno se sustituye por un electrófilo', 'isomeria', 'quimica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Propiedad de una molécula que posee un carbono con cuatro sustituyentes distintos y no es superponible con su espejo', 'inversión', 'quimica', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Átomo o grupo de átomos con carga eléctrica neta, positiva (catión) o negativa (anión)', 'ion', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Producto de la constante iónica del agua, Kw = [H⁺][OH⁻] = 10⁻¹⁴ a 25 °C', 'ionico', 'quimica', 'bachillerato', '{2}', 2),

-- J (5)
('J', 'empieza', 'Unidad de energía del SI usada para medir entalpías, energías de activación y trabajo eléctrico', 'julio', 'quimica', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Efecto de la temperatura sobre la velocidad de reacción descrito por la ecuación de Arrhenius', 'jarabe', 'quimica', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Disposición de los átomos en el espacio de un estereoisómero que no puede interconvertirse sin romper enlaces', 'jerarquizacion', 'quimica', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Factor preexponencial de la ecuación de Arrhenius que depende de la frecuencia de colisiones', 'jfrecuencia', 'quimica', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Energía expresada en kilojulios por mol usada para cuantificar cambios entálpicos en termoquímica', 'juliosmol', 'quimica', 'bachillerato', '{2}', 1),

-- K (5)
('K', 'contiene', 'Constante de equilibrio de la reacción de autoprotólisis del agua, Kw = 10⁻¹⁴ a 25°C', 'autoprotolisiskw', 'quimica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Expresión matemática del equilibrio químico como cociente de concentraciones elevadas a coeficientes estequiométricos', 'equilibriokc', 'quimica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Energía mínima que deben tener los reactivos para que una colisión sea eficaz', 'activacionek', 'quimica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Efecto donde la adición de un ion ya presente desplaza el equilibrio de disociación, reduciendo la solubilidad', 'ioncomunksp', 'quimica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Polímero como el polietileno o el PVC obtenido por apertura de dobles enlaces entre monómeros', 'polimerizacionk', 'quimica', 'bachillerato', '{2}', 2),

-- L (6)
('L', 'empieza', 'Biomoléculas insolubles en agua formadas por ácidos grasos y glicerol, como grasas y fosfolípidos', 'lipido', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Ley que establece que la velocidad depende de la concentración de los reactivos elevada a un exponente', 'ley', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Principio que afirma que si se perturba un equilibrio, el sistema se desplaza para contrarrestar la perturbación', 'lechatelier', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Enlace peptídico que une aminoácidos mediante la unión del grupo amino de uno con el carboxilo del siguiente', 'ligadura', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Escala logarítmica que mide la acidez o basicidad de una disolución, pH = -log[H⁺]', 'logaritmico', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Macromolécula formada por repetición de unidades más pequeñas llamadas monómeros', 'larga', 'quimica', 'bachillerato', '{2}', 1),

-- M (6)
('M', 'empieza', 'Secuencia de reacciones elementales que describen cómo se transforman los reactivos en productos', 'mecanismo', 'quimica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Unidad repetitiva más pequeña que al polimerizarse forma una cadena polimérica', 'monomero', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Número de moles de soluto disueltos en un litro de disolución', 'molaridad', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Exponente al que se eleva la concentración de un reactivo en la ley de velocidad', 'molecularidad', 'quimica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Molécula grande formada por la unión covalente de muchas unidades repetitivas', 'macromolecula', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Carbono con doble enlace cuya isomería cis/trans depende de los sustituyentes a cada lado', 'mezcla', 'quimica', 'bachillerato', '{2}', 2),

-- N (6)
('N', 'empieza', 'Ecuación que da la fem de una pila cuando las concentraciones no son las estándar', 'nernst', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Reacción de un ácido con una base que produce sal y agua', 'neutralizacion', 'quimica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Macromolécula que almacena la información genética, como el ADN y el ARN', 'nucleotido', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Polímero natural o sintético como el nailon, formado por enlaces amida', 'nylon', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Tipo de reacción sustitutiva en el benceno donde un grupo NO₂ entra en el anillo', 'nitracion', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Grupo funcional –NH₂ presente en aminas y aminoácidos', 'nitrogenado', 'quimica', 'bachillerato', '{2}', 1),

-- O (6)
('O', 'empieza', 'Proceso donde una especie pierde electrones y aumenta su número de oxidación', 'oxidacion', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Exponente de la concentración en la ley de velocidad que determina la cinética de la reacción', 'orden', 'quimica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Estereoisomería E/Z o cis/trans que surge por la rotación impedida alrededor de un doble enlace', 'optica', 'quimica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Parte de una molécula orgánica que da propiedades químicas características, como –OH, –COOH, –NH₂', 'organica', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Proceso inverso de la oxidación donde una especie gana electrones', 'obtencion', 'quimica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Hidrólisis de una sal de ácido débil y base fuerte que produce disolución básica', 'oxigeno', 'quimica', 'bachillerato', '{2}', 1),

-- P (7)
('P', 'empieza', 'Macromolécula formada por la unión de muchos monómeros mediante enlaces covalentes', 'polimero', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Escala que mide la concentración de iones hidrógeno en disolución, de 0 a 14 típicamente', 'ph', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Macromolécula biológica formada por aminoácidos unidos por enlaces peptídicos', 'proteina', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Potencial eléctrico estándar de reducción de un electrodo, medido en voltios frente al EEH', 'potencial', 'quimica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Reacción de polimerización por adición donde los monómeros se unen abriendo sus dobles enlaces', 'poliadicion', 'quimica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Enlace que une el grupo amino de un aminoácido con el carboxilo del siguiente eliminando agua', 'peptidico', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Pila electroquímica que genera corriente eléctrica a partir de una reacción redox espontánea', 'pila', 'quimica', 'bachillerato', '{2}', 1),

-- Q (5)
('Q', 'empieza', 'Rama de la química que estudia los compuestos del carbono y sus reacciones', 'quimica', 'quimica', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Propiedad de una molécula que no es superponible con su imagen especular', 'quiral', 'quimica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Configuración de un centro quiral asignada según las reglas de prioridad de Cahn-Ingold-Prelog', 'quiralidad', 'quimica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Cociente de reacción que se compara con K para predecir la dirección del desplazamiento del equilibrio', 'qreaccion', 'quimica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Cantidad de electricidad necesaria para depositar un equivalente-gramo de sustancia en la electrólisis', 'qfaraday', 'quimica', 'bachillerato', '{2}', 2),

-- R (6)
('R', 'empieza', 'Proceso electroquímico donde una especie gana electrones disminuyendo su número de oxidación', 'reduccion', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Especie química que cede electrones en una reacción redox, oxidándose', 'reductor', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Reacción típica del benceno donde un sustituyente del anillo es reemplazado por otro grupo', 'reactividad', 'quimica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Configuración espacial de un centro quiral según las reglas CIP, designada con letra latina', 'rectus', 'quimica', 'bachillerato', '{2}', 3),
('R', 'empieza', 'Etapa más lenta de un mecanismo de reacción que determina la velocidad global', 'rds', 'quimica', 'bachillerato', '{2}', 3),
('R', 'empieza', 'Par ácido-base conjugado que comparte un protón entre las dos especies', 'reciproco', 'quimica', 'bachillerato', '{2}', 2),

-- S (6)
('S', 'empieza', 'Configuración de un centro estereogénico opuesta a R según las reglas de prioridad CIP', 'sinister', 'quimica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Proceso de reemplazar un átomo o grupo en una molécula por otro distinto', 'sustitucion', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Producto de solubilidad, constante de equilibrio para la disolución de una sal poco soluble', 'solubilidad', 'quimica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Unidad monomérica de los carbohidratos, como la glucosa o la fructosa', 'sacarido', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Sal que al disolverse en agua produce hidrólisis por provenir de ácido débil y base fuerte, o viceversa', 'sal', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Etapa individual de un mecanismo de reacción que ocurre en un solo acto molecular', 'simple', 'quimica', 'bachillerato', '{2}', 2),

-- T (6)
('T', 'empieza', 'Rama de la química que estudia los intercambios de calor y energía en las reacciones', 'termoquimica', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Punto de una valoración donde el indicador cambia de color, idealmente coincidente con el de equivalencia', 'transicion', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Técnica analítica que determina la concentración de un ácido o base añadiendo una disolución patrón', 'titulacion', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Material plástico que se ablanda al calentar y se endurece al enfriar, de forma reversible', 'termoplastico', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Tipo de polímero que al calentarse se endurece irreversiblemente por formación de entrecruzamientos', 'termoestable', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Función de estado termodinámica que mide la energía total de formación de un sistema a presión constante', 'total', 'quimica', 'bachillerato', '{2}', 1),

-- U (5)
('U', 'empieza', 'Molécula orgánica nitrogenada presente en la orina como producto de desecho del metabolismo proteico', 'urea', 'quimica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Cada repetición monomérica dentro de la cadena de un polímero', 'unidad', 'quimica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Enlace doble carbono-carbono presente en alquenos que permite isomería geométrica', 'unsaturacion', 'quimica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Base nitrogenada pirimidínica presente en el ARN pero no en el ADN', 'uracilo', 'quimica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Reacción unimolecular cuya etapa determinante implica un solo reactivo', 'unimolecular', 'quimica', 'bachillerato', '{2}', 3),

-- V (6)
('V', 'empieza', 'Técnica que mide la concentración de una disolución añadiendo reactivo patrón hasta el punto de equivalencia', 'valoracion', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Magnitud que indica la rapidez con que se consumen los reactivos o se forman los productos', 'velocidad', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Diferencia de potencial eléctrico en una celda electroquímica medida en voltios', 'voltaje', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Reacción redox donde el mismo elemento se oxida y se reduce simultáneamente', 'valencias', 'quimica', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Propiedad de los aminoácidos de actuar como ácidos o bases dependiendo del pH del medio', 'versatil', 'quimica', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Volumen de disolución patrón necesario para alcanzar el punto de equivalencia en una valoración', 'volumen', 'quimica', 'bachillerato', '{2}', 1),

-- W (5)
('W', 'contiene', 'Constante de autoionización del agua cuyo valor es 10⁻¹⁴ a 25°C', 'kw', 'quimica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Ley que afirma que la entalpía de una reacción global es la suma de las entalpías de sus etapas', 'hessley', 'quimica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Ecuación que relaciona la fem de una pila con las actividades de las especies a temperatura dada', 'nernstew', 'quimica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Principio de Le Chatelier que predice cómo responde un equilibrio a cambios de concentración, presión o temperatura', 'chatelierwp', 'quimica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Ecuación de velocidad para una reacción de segundo orden donde la concentración aparece elevada al cuadrado', 'arrheniuswk', 'quimica', 'bachillerato', '{2}', 3),

-- X (5)
('X', 'contiene', 'Especie química que cede electrones a otra en una reacción de transferencia electrónica', 'oxidante', 'quimica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Proceso de polimerización por condensación con eliminación de moléculas pequeñas', 'policondensacionx', 'quimica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Tipo de reacción donde un hidrógeno del benceno es sustituido por un halógeno', 'halogenacionex', 'quimica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Mezcla de dos enantiómeros en proporciones desiguales que presenta actividad óptica neta', 'exceso', 'quimica', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Reacción exotérmica donde la entalpía de los productos es menor que la de los reactivos', 'exotermica', 'quimica', 'bachillerato', '{2}', 1),

-- Y (5)
('Y', 'contiene', 'Proceso por el cual una sal disuelta en agua genera iones que modifican el pH de la disolución', 'hidrolisisy', 'quimica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Enlace entre dos aminoácidos mediante condensación de los grupos amino y carboxilo', 'peptidoy', 'quimica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Polímero sintético obtenido por polimerización de adición del cloruro de vinilo', 'poliviniloy', 'quimica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Material polimérico con propiedades elásticas que recupera su forma original tras deformarse', 'elastomeroy', 'quimica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Diagrama que representa la variación de energía a lo largo de la coordenada de reacción', 'energeticoy', 'quimica', 'bachillerato', '{2}', 1),

-- Z (5)
('Z', 'contiene', 'Isomería geométrica donde los sustituyentes prioritarios están al mismo lado del doble enlace', 'zusammen', 'quimica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Catalizador biológico de naturaleza proteica que acelera reacciones metabólicas específicas', 'enzima', 'quimica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Estado de equilibrio dinámico donde las velocidades directa e inversa de la reacción se igualan', 'equilibrioz', 'quimica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Punto isoeléctrico de un aminoácido donde la carga neta es cero', 'zwitterion', 'quimica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Tipo de mezcla racémica formada por cantidades iguales de dos enantiómeros sin actividad óptica', 'racemica', 'quimica', 'bachillerato', '{2}', 2);
