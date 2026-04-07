-- =====================================================================
-- Revisión rosco · ESO · Valencià · 1º a 4º ESO
-- 3º ESO: regeneración casi completa.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id IN (29894, 29895, 29899, 29900);
UPDATE rosco_questions
SET solution = 'kilo',
    definition = 'Mil grams (unitat de massa).'
WHERE id = 29891;

-- =====================================================================
-- 2º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id IN (30177, 30178, 30182, 30183);
UPDATE rosco_questions
SET solution = 'kilòmetre',
    definition = 'Unitat de distància equivalent a mil metres.'
WHERE id = 30174;

-- =====================================================================
-- 4º ESO
-- =====================================================================
UPDATE rosco_questions SET solution = 'ausiàs' WHERE id = 30612;

-- =====================================================================
-- 3º ESO · BORRADO MASIVO POR FILTRO
-- =====================================================================

DELETE FROM rosco_questions
WHERE level='eso' AND subject_id='valenciano'
  AND grades = ARRAY[3]
  AND solution IN (
    'agua','banio maria','capa de ozono','dioxido de carbono','energia no renovable',
    'frecuencia cardiaca','gato','homo sapiens','isla','juegos olimpicos','kilo',
    'lugar geometrico','mano alzada','numero atomico','mañana','ojo','presion de grupo',
    'queso','rosa de los vientos','sol','toma de decisiones','uno','vaso de precipitados',
    'kiwi','web','xilófono','yate','zoologia'
  );

-- Bug 30366: 'bo,' tiene coma en la solución
UPDATE rosco_questions
SET solution = 'dolent',
    definition = 'Adjectiu: el contrari de bo.'
WHERE id = 30366;

-- =====================================================================
-- 3º ESO · INSERCIÓN DE CONTENIDO NUEVO (~120 entradas)
-- Vocabulario LOMLOE 3º ESO Valencià
-- =====================================================================

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- LETRA A (+2)
('A','empieza','Categoria gramatical que acompanya al nom per qualificar-lo.','adjectiu','valenciano','eso',ARRAY[3],2),
('A','empieza','Conjunt ordenat de les lletres d''una llengua.','alfabet','valenciano','eso',ARRAY[3],1),

-- LETRA B (+2)
('B','empieza','Adverbi: de manera correcta.','bé','valenciano','eso',ARRAY[3],1),
('B','empieza','Narració de la vida d''una persona.','biografia','valenciano','eso',ARRAY[3],2),

-- LETRA C (+3)
('C','empieza','Paraula invariable que enllaça oracions o paraules (i, però, perquè...).','conjunció','valenciano','eso',ARRAY[3],2),
('C','empieza','Nom de família que segueix al nom propi.','cognom','valenciano','eso',ARRAY[3],1),
('C','empieza','Capacitat d''entendre un text llegit.','comprensió','valenciano','eso',ARRAY[3],2),

-- LETRA D (+3)
('D','empieza','Unió de dues vocals en una mateixa síl·laba.','diftong','valenciano','eso',ARRAY[3],2),
('D','empieza','Llibre que recull les paraules d''una llengua amb el seu significat.','diccionari','valenciano','eso',ARRAY[3],1),
('D','empieza','Tipus de text que explica com és alguna cosa o algú.','descripció','valenciano','eso',ARRAY[3],2),

-- LETRA E (+4)
('E','empieza','Persona que envia el missatge en la comunicació.','emissor','valenciano','eso',ARRAY[3],1),
('E','empieza','Text breu que encapçala un capítol o obra.','epígraf','valenciano','eso',ARRAY[3],3),
('E','empieza','Persona que escriu obres literàries.','escriptor','valenciano','eso',ARRAY[3],1),
('E','empieza','Estudi de l''origen i història de les paraules.','etimologia','valenciano','eso',ARRAY[3],3),

-- LETRA F (+4)
('F','empieza','Unitat mínima de so d''una llengua.','fonema','valenciano','eso',ARRAY[3],2),
('F','empieza','Conjunt de paraules amb sentit complet.','frase','valenciano','eso',ARRAY[3],1),
('F','empieza','Narració breu amb animals i moralitat.','faula','valenciano','eso',ARRAY[3],2),
('F','empieza','Tot allò imaginari, no real.','ficció','valenciano','eso',ARRAY[3],2),

-- LETRA G (+5)
('G','empieza','Categoria literària: lírica, narrativa, dramàtica.','gènere','valenciano','eso',ARRAY[3],2),
('G','empieza','Ciència que estudia l''estructura d''una llengua.','gramàtica','valenciano','eso',ARRAY[3],2),
('G','empieza','Forma no personal del verb acabada en -ant, -ent, -int.','gerundi','valenciano','eso',ARRAY[3],2),
('G','empieza','Llista de paraules difícils amb el seu significat.','glossari','valenciano','eso',ARRAY[3],2),
('G','empieza','Cada lletra o conjunt de lletres que representen un so.','grafia','valenciano','eso',ARRAY[3],2),

-- LETRA H (+5)
('H','empieza','Dues vocals seguides que pertanyen a síl·labes diferents.','hiat','valenciano','eso',ARRAY[3],2),
('H','empieza','Paraula amb significat més general que altres (flor és ... de rosa).','hiperònim','valenciano','eso',ARRAY[3],3),
('H','empieza','Paraula que sona o s''escriu igual que una altra.','homònim','valenciano','eso',ARRAY[3],2),
('H','empieza','Relat de fets passats o ciència que els estudia.','història','valenciano','eso',ARRAY[3],1),
('H','empieza','Personatge principal d''una gesta o llegenda.','heroi','valenciano','eso',ARRAY[3],1),

-- LETRA I (+5)
('I','empieza','Forma no personal del verb (acabada en -ar, -re, -er, -ir).','infinitiu','valenciano','eso',ARRAY[3],2),
('I','empieza','Mode verbal usat per donar ordres.','imperatiu','valenciano','eso',ARRAY[3],2),
('I','empieza','Mode verbal de les accions reals.','indicatiu','valenciano','eso',ARRAY[3],2),
('I','empieza','Sistema de comunicació d''un poble (Sinònim de llengua).','idioma','valenciano','eso',ARRAY[3],1),
('I','empieza','Part inicial d''un text on es presenta el tema.','introducció','valenciano','eso',ARRAY[3],2),

-- LETRA J (+5)
('J','empieza','Poeta i músic medieval que recitava en públic.','joglar','valenciano','eso',ARRAY[3],2),
('J','empieza','Escriptura egípcia antiga formada per dibuixos.','jeroglífic','valenciano','eso',ARRAY[3],3),
('J','empieza','Activitat lúdica o recurs literari (... de paraules).','joc','valenciano','eso',ARRAY[3],1),
('J','empieza','Valor de donar a cadascú el que li correspon.','justícia','valenciano','eso',ARRAY[3],1),
('J','empieza','Etapa de la vida entre la infància i l''edat adulta.','joventut','valenciano','eso',ARRAY[3],1),

-- LETRA K (+5)
('K','empieza','Unitat de distància de mil metres.','kilòmetre','valenciano','eso',ARRAY[3],1),
('K','empieza','Marsupial australià que viu als eucaliptus.','koala','valenciano','eso',ARRAY[3],1),
('K','empieza','Art marcial japonés.','karate','valenciano','eso',ARRAY[3],1),
('K','empieza','Salsa de tomaca molt popular.','ketchup','valenciano','eso',ARRAY[3],1),
('K','empieza','Fruita verda peluda rica en vitamina C.','kiwi','valenciano','eso',ARRAY[3],1),

-- LETRA L (+5)
('L','empieza','Sistema de comunicació verbal d''un poble.','llengua','valenciano','eso',ARRAY[3],1),
('L','empieza','Objecte amb pàgines escrites per llegir.','llibre','valenciano','eso',ARRAY[3],1),
('L','empieza','Narració tradicional que mescla realitat i fantasia.','llegenda','valenciano','eso',ARRAY[3],2),
('L','empieza','Conjunt de paraules d''una llengua (Vocabulari).','lèxic','valenciano','eso',ARRAY[3],2),
('L','empieza','Art que utilitza la paraula com a mitjà d''expressió.','literatura','valenciano','eso',ARRAY[3],2),

-- LETRA M (+4)
('M','empieza','Informació que el emissor envia al receptor.','missatge','valenciano','eso',ARRAY[3],2),
('M','empieza','Gènere gramatical contrari a femení.','masculí','valenciano','eso',ARRAY[3],1),
('M','empieza','Paraula d''una sola síl·laba.','monosíl·laba','valenciano','eso',ARRAY[3],2),
('M','empieza','Unitat mínima de significat que es suma al lexema.','morfema','valenciano','eso',ARRAY[3],3),

-- LETRA N (+5)
('N','empieza','Categoria gramatical (Substantiu).','nom','valenciano','eso',ARRAY[3],1),
('N','empieza','Obra literària narrativa de gran extensió.','novel·la','valenciano','eso',ARRAY[3],1),
('N','empieza','Veu que conta la història en un text narratiu.','narrador','valenciano','eso',ARRAY[3],2),
('N','empieza','Acció de contar fets reals o imaginaris.','narració','valenciano','eso',ARRAY[3],2),
('N','empieza','Que no és ni masculí ni femení (gènere ...).','neutre','valenciano','eso',ARRAY[3],2),

-- LETRA O (+5)
('O','empieza','Conjunt de paraules amb sentit complet i verb.','oració','valenciano','eso',ARRAY[3],2),
('O','empieza','Conjunt de normes per escriure correctament.','ortografia','valenciano','eso',ARRAY[3],2),
('O','empieza','Producció literària o artística d''un autor.','obra','valenciano','eso',ARRAY[3],1),
('O','empieza','Composició lírica solemne d''alabança.','oda','valenciano','eso',ARRAY[3],2),
('O','empieza','Vers de huit síl·labes, típic dels romanços.','octosíl·lab','valenciano','eso',ARRAY[3],3),

-- LETRA P (+5)
('P','empieza','Paraula que substitueix al nom.','pronom','valenciano','eso',ARRAY[3],2),
('P','empieza','Part de l''oració que diu alguna cosa del subjecte.','predicat','valenciano','eso',ARRAY[3],2),
('P','empieza','Unitat mínima del lèxic amb significat.','paraula','valenciano','eso',ARRAY[3],1),
('P','empieza','Gènere literari escrit en vers.','poesia','valenciano','eso',ARRAY[3],1),
('P','empieza','Forma d''escriure sense mètrica, oposada al vers.','prosa','valenciano','eso',ARRAY[3],1),

-- LETRA Q (+5)
('Q','empieza','Quarta part d''alguna cosa.','quart','valenciano','eso',ARRAY[3],1),
('Q','empieza','Adverbi de temps interrogatiu.','quan','valenciano','eso',ARRAY[3],1),
('Q','empieza','Pronom interrogatiu de persona.','qui','valenciano','eso',ARRAY[3],1),
('Q','empieza','Número 40 en valencià.','quaranta','valenciano','eso',ARRAY[3],1),
('Q','contiene','Conjunció causal molt comuna en valencià (conté Q).','perquè','valenciano','eso',ARRAY[3],1),

-- LETRA R (+5)
('R','empieza','Repetició de sons al final dels versos.','rima','valenciano','eso',ARRAY[3],1),
('R','empieza','Conte breu o narració.','relat','valenciano','eso',ARRAY[3],2),
('R','empieza','Composició poètica medieval de versos octosíl·labs.','romanç','valenciano','eso',ARRAY[3],2),
('R','empieza','Eina expressiva de la literatura (... literari).','recurs','valenciano','eso',ARRAY[3],2),
('R','empieza','Cadència o moviment regular d''un text.','ritme','valenciano','eso',ARRAY[3],1),

-- LETRA S (+5)
('S','empieza','Persona o cosa que realitza l''acció del verb.','subjecte','valenciano','eso',ARRAY[3],2),
('S','empieza','Grup de paraules amb funció sintàctica.','sintagma','valenciano','eso',ARRAY[3],3),
('S','empieza','Categoria gramatical que designa éssers o objectes (Nom).','substantiu','valenciano','eso',ARRAY[3],2),
('S','empieza','Paraula amb el mateix significat que altra.','sinònim','valenciano','eso',ARRAY[3],1),
('S','empieza','Morfema que va darrere del lexema.','sufix','valenciano','eso',ARRAY[3],2),

-- LETRA T (+4)
('T','empieza','Gènere literari per ser representat.','teatre','valenciano','eso',ARRAY[3],1),
('T','empieza','Assumpte principal d''un text.','tema','valenciano','eso',ARRAY[3],1),
('T','empieza','Obra dramàtica de final desgraciat.','tragèdia','valenciano','eso',ARRAY[3],2),
('T','empieza','Conjunt d''enunciats amb sentit complet.','text','valenciano','eso',ARRAY[3],1),

-- LETRA U (+4)
('U','empieza','Element bàsic d''una mesura.','unitat','valenciano','eso',ARRAY[3],1),
('U','empieza','Òrgan de la vista.','ull','valenciano','eso',ARRAY[3],1),
('U','empieza','Femení singular del numeral 1.','una','valenciano','eso',ARRAY[3],1),
('U','empieza','Acció d''utilitzar alguna cosa.','ús','valenciano','eso',ARRAY[3],1),

-- LETRA V (+5)
('V','empieza','Lletra que no és consonant (a, e, i, o, u).','vocal','valenciano','eso',ARRAY[3],1),
('V','empieza','Paraula que indica acció o estat.','verb','valenciano','eso',ARRAY[3],1),
('V','empieza','Cada línia d''un poema.','vers','valenciano','eso',ARRAY[3],1),
('V','empieza','Llengua romànica parlada al País Valencià.','valencià','valenciano','eso',ARRAY[3],1),
('V','empieza','Conjunt de paraules que coneix una persona.','vocabulari','valenciano','eso',ARRAY[3],2),

-- LETRA W (+5, contiene W)
('W','contiene','Pàgina d''internet (conté W).','web','valenciano','eso',ARRAY[3],1),
('W','contiene','Unitat de potència elèctrica (conté W).','watt','valenciano','eso',ARRAY[3],2),
('W','contiene','Fruita peluda i verda (conté W).','kiwi','valenciano','eso',ARRAY[3],1),
('W','contiene','Entrepà de pa de motle (conté W).','sandvitx','valenciano','eso',ARRAY[3],2),
('W','contiene','Xarxa social de missatges curts (conté W).','twitter','valenciano','eso',ARRAY[3],2),

-- LETRA X (+5, contiene X)
('X','contiene','Conjunt d''enunciats amb sentit (conté X).','text','valenciano','eso',ARRAY[3],1),
('X','contiene','Morfema que va darrere del lexema (conté X).','sufix','valenciano','eso',ARRAY[3],2),
('X','contiene','Mostra que aclareix una explicació (conté X).','exemple','valenciano','eso',ARRAY[3],1),
('X','contiene','Morfema que va davant del lexema (conté X).','prefix','valenciano','eso',ARRAY[3],2),
('X','contiene','Acció de presentar un treball oralment (conté X).','exposició','valenciano','eso',ARRAY[3],2),

-- LETRA Y (+3)
('Y','empieza','Disciplina oriental que combina cos i ment per relaxar-se.','yoga','valenciano','eso',ARRAY[3],2),
('Y','empieza','Aliment llacti fermentat.','yogur','valenciano','eso',ARRAY[3],1),
('Y','empieza','Plataforma de vídeos d''internet.','youtube','valenciano','eso',ARRAY[3],1),

-- LETRA Z (+5)
('Z','empieza','Número 0.','zero','valenciano','eso',ARRAY[3],1),
('Z','empieza','Àrea o regió.','zona','valenciano','eso',ARRAY[3],1),
('Z','empieza','Parc on es veuen animals salvatges.','zoo','valenciano','eso',ARRAY[3],1),
('Z','empieza','Animal africà a ratlles blanques i negres.','zebra','valenciano','eso',ARRAY[3],1),
('Z','empieza','Metall de símbol Zn usat per recobrir l''acer.','zinc','valenciano','eso',ARRAY[3],2);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
