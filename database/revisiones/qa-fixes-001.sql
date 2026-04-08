-- =====================================================================
-- QA Fixes 001 · Resultados de las primeras 10 runs de QA
-- 2 ERROR + 25 WARNING corregidos
-- =====================================================================

BEGIN;

-- =====================================================================
-- ERRORES CRÍTICOS (2)
-- =====================================================================

-- 🔴 rosco id 13319: nariz "por donde comemos" → contra-pedagógico
UPDATE rosco_questions
SET definition = 'Órgano de la cara que sirve para oler y respirar (contiene Z).'
WHERE id = 13319;

-- 🔴 intruso id 205: "Sumas de Centenas" con sumas que dan 100 + intrusos sin coherencia
UPDATE intruso_sets
SET category = 'Sumas que dan 100',
    intruder_items = '["50+10","20+20","30+30","40+40","60+60","70+10","99","101"]'::jsonb
WHERE id = 205;

-- =====================================================================
-- WARNINGS · ROSCO (13)
-- =====================================================================

-- 13093: ojo "Ojo de la cara" → tautología
UPDATE rosco_questions
SET definition = 'Órgano del sentido de la vista (contiene J).'
WHERE id = 13093;

-- 14369: teclado coloquial
UPDATE rosco_questions
SET definition = 'Periférico con teclas para escribir en el ordenador.'
WHERE id = 14369;

-- 16507: pelo "Vello corporal" pobre para 3º ESO
UPDATE rosco_questions
SET definition = 'Filamento de queratina que crece de la piel.'
WHERE id = 16507;

-- 16573: visión "sentido que permite ver" tautológica
UPDATE rosco_questions
SET definition = 'Sentido que percibe la luz y las imágenes a través de los ojos.'
WHERE id = 16573;

-- 16867: dióxido con pista revelada en paréntesis
UPDATE rosco_questions
SET definition = 'Gas que expulsamos al respirar y absorben las plantas (contiene X).'
WHERE id = 16867;

-- 16934: esfuerzo describía 'fuerza/capacidad física'
UPDATE rosco_questions
SET definition = 'Acción de aplicar energía física o mental para conseguir algo.'
WHERE id = 16934;

-- 17743: bebida → describía 'bebida isotónica'
UPDATE rosco_questions
SET definition = 'Líquido que se ingiere para hidratarse.'
WHERE id = 17743;

-- 17795: gesto demasiado escueto
UPDATE rosco_questions
SET definition = 'Movimiento técnico característico de una acción deportiva.'
WHERE id = 17795;

-- 20920: watt confunde unidad y persona
UPDATE rosco_questions
SET definition = 'Apellido del inventor escocés de la máquina de vapor (James...) (contiene W).'
WHERE id = 20920;

-- 21218: zona con anotación trunca '(ej. ... desmilitarizada)'
UPDATE rosco_questions
SET definition = 'Área geográfica delimitada con características comunes.'
WHERE id = 21218;

-- 22478: frase con pista en paréntesis
UPDATE rosco_questions
SET definition = 'Conjunto de palabras con sentido completo.'
WHERE id = 22478;

-- 22529: kilogramo con anotación interna '(completo)'
UPDATE rosco_questions
SET definition = 'Unidad básica de masa del Sistema Internacional, mil gramos.'
WHERE id = 22529;

-- =====================================================================
-- WARNINGS · ORDENA HISTORIAS (3)
-- Las 3 son listas de hechos sin orden único; reescribo añadiendo
-- conectores temporales/causales para que sea ordenable.
-- =====================================================================

-- 150: reproducción asexual primaria 5
UPDATE ordena_historias
SET sentences = '["Existen varios tipos de reproducción en los seres vivos.","La reproducción asexual solo necesita un individuo.","Algunas plantas pueden reproducirse por esquejes a partir de un trozo.","Una estrella de mar incluso puede regenerarse a partir de un solo brazo."]'::jsonb
WHERE id = 150;

-- 181: migración aves primaria 6
UPDATE ordena_historias
SET sentences = '["Cada otoño, miles de aves comienzan un viaje increíble.","Recorren miles de kilómetros en busca de alimento o un clima mejor.","Para no perderse, se orientan con el campo magnético, el Sol y las estrellas.","Cuando llega la primavera, regresan a sus lugares de origen para criar."]'::jsonb
WHERE id = 181;

-- 338: monarquía parlamentaria primaria 6
UPDATE ordena_historias
SET sentences = '["España es una monarquía parlamentaria con un sistema democrático.","Primero, los ciudadanos eligen a sus representantes en unas elecciones.","Después, esos representantes forman el Parlamento, que elabora las leyes.","Finalmente, el rey ejerce la Jefatura del Estado de forma simbólica."]'::jsonb
WHERE id = 338;

-- =====================================================================
-- WARNINGS · ORDENA FRASES (1)
-- =====================================================================

-- 5867: música lounge fuera de currículo
UPDATE ordena_frases
SET sentence = 'La música clásica del Romanticismo expresa sentimientos intensos y profundos.'
WHERE id = 5867;

-- =====================================================================
-- WARNINGS · DETECTIVE (2)
-- =====================================================================

-- 1047: lavender vocabulario poco común para 3º Primaria
UPDATE detective_sentences
SET sentence = 'The butterfly lands gently on the flower.'
WHERE id = 1047;

-- 3134: poema con autor poco conocido + sin punto
UPDATE detective_sentences
SET sentence = 'El valencià té una llarga tradició literària amb autors clàssics i moderns.'
WHERE id = 3134;

-- =====================================================================
-- WARNINGS · INTRUSO (2)
-- =====================================================================

-- 112: Pays du Monde mezcla francófonos y no francófonos
UPDATE intruso_sets
SET category = 'Pays Européens',
    correct_items = '["France","Espagne","Italie","Allemagne","Belgique","Portugal","Suisse","Pays-Bas","Grèce","Pologne"]'::jsonb,
    intruder_items = '["Brésil","Japon","Chine","Argentine","Égypte","Australie","Canada","Mexique"]'::jsonb
WHERE id = 112;

-- 185: "Prefijos Y Sufijos" pero solo había prefijos
UPDATE intruso_sets
SET category = 'Palabras con Prefijo',
    correct_items = '["Deshacer","Inmortal","Rehacer","Imposible","Despegar","Invisible","Releer","Incapaz","Subterráneo","Anteayer"]'::jsonb
WHERE id = 185;

-- =====================================================================
-- WARNINGS · PAREJAS (2)
-- =====================================================================

-- 612: B↔b trivial pero válido para 1º; reescribo a parte gramatical
UPDATE parejas_items
SET term_a = 'A mayúscula',
    term_b = 'a minúscula'
WHERE id = 612;

-- 693: diptongo definición incompleta
UPDATE parejas_items
SET term_b = 'Dos vocales en la misma sílaba'
WHERE id = 693;

-- =====================================================================
-- WARNINGS · RUNNER (2)
-- =====================================================================

-- 258: reino_plantas mezcla criterios → renombrar a plantas_diversas
UPDATE runner_categories
SET category_name = 'plantas_y_arboles'
WHERE id = 258;

-- 274: organizacion_cuerpo mezcla niveles con funciones → separar
UPDATE runner_categories
SET category_name = 'niveles_organizacion_corporal',
    words = '["célula","tejido","órgano","aparato","sistema","organismo","población","comunidad","ecosistema","biosfera"]'::jsonb
WHERE id = 274;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
