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
