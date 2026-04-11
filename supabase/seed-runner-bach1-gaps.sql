-- Runner categories: Bachillerato 1º - Gaps (2 new categories per subject)
-- 12 asignaturas x 2 categorias x 10 palabras = 240 palabras

-- ============================================
-- BIOLOGIA (citologia, metabolismo, bioquimica)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('biologia', 'bachillerato', '{1}', 'Rutas metabolicas', '["glucolisis","krebs","betaoxidacion","gluconeogenesis","fermentacion","ureagenesis","calvin","lipogenesis","proteolisis","quimiosintesis"]'),
('biologia', 'bachillerato', '{1}', 'Enzimas y cofactores', '["amilasa","lipasa","pepsina","tripsina","catalasa","lactasa","polimerasa","ligasa","nadh","fad"]');

-- ============================================
-- DIBUJO TECNICO (poligonos, instrumentos, sistemas)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('dibujo-tecnico', 'bachillerato', '{1}', 'Trazados fundamentales', '["mediatriz","bisectriz","perpendicular","paralela","arcoarco","tangencia","enlace","division","equidistante","lugar"]'),
('dibujo-tecnico', 'bachillerato', '{1}', 'Tipos de lineas', '["continua","discontinua","trazos","puntos","gruesa","fina","auxiliar","ejes","ocultas","ruptura"]');

-- ============================================
-- ECONOMIA (indicadores, mercados, politicas)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('economia', 'bachillerato', '{1}', 'Empresa y produccion', '["empresario","beneficio","capital","trabajo","materia","tecnologia","productividad","costefijo","costevariable","amortizacion"]'),
('economia', 'bachillerato', '{1}', 'Mercado laboral', '["salario","convenio","contrato","sindicato","paro","epa","activos","inactivos","ocupados","temporalidad"]');

-- ============================================
-- EDUCACION FISICA (cualidades, deportes, musculos)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('ed-fisica', 'bachillerato', '{1}', 'Sistemas energeticos', '["aerobico","anaerobico","lactico","alactico","fosfageno","glucolitico","oxidativo","umbral","vo2max","recuperacion"]'),
('ed-fisica', 'bachillerato', '{1}', 'Deportes colectivos', '["futbol","baloncesto","balonmano","voleibol","rugby","hockey","waterpolo","beisbol","softbol","hurling"]');

-- ============================================
-- FISICA (magnitudes, leyes, unidades)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('fisica', 'bachillerato', '{1}', 'Unidades SI', '["metro","segundo","kilogramo","amperio","mol","candela","hertz","watt","voltio","ohmio"]'),
('fisica', 'bachillerato', '{1}', 'Ondas y vibraciones', '["amplitud","longitud","periodo","fase","refraccion","reflexion","difraccion","interferencia","resonancia","armonico"]');

-- ============================================
-- FRANCES (palabras en frances, sin acentos)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('frances', 'bachillerato', '{1}', 'Monde du travail', '["entreprise","bureau","salarie","patron","stage","carriere","reunion","projet","collegue","formation"]'),
('frances', 'bachillerato', '{1}', 'Voyages et tourisme', '["avion","valise","hotel","douane","passeport","billet","sejour","aeroport","frontiere","itineraire"]');

-- ============================================
-- LATIN (terminos en latin)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('latin', 'bachillerato', '{1}', 'Expresiones latinas', '["carpediem","veniviidivici","alea","cogito","errarehumanum","menssana","panemcircenses","memento","inmemoriam","adhoc"]'),
('latin', 'bachillerato', '{1}', 'Numeros romanos', '["unus","duo","tres","quattuor","quinque","sex","septem","octo","novem","decem"]');

-- ============================================
-- LITERATURA UNIVERSAL (autores, obras, movimientos)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('literatura-universal', 'bachillerato', '{1}', 'Autores medievales', '["chretien","villon","chaucer","ruteboeuf","manrique","troyes","wolfram","gottfried","ronsard","jorgemanrique"]'),
('literatura-universal', 'bachillerato', '{1}', 'Personajes literarios', '["quijote","otelo","macbeth","fausto","hester","ahab","gregorio","meursault","rastignac","karenina"]');

-- ============================================
-- MATEMATICAS (funciones, conceptos, operaciones)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('matematicas', 'bachillerato', '{1}', 'Conjuntos numericos', '["naturales","enteros","racionales","irracionales","reales","complejos","primos","pares","impares","ordinales"]'),
('matematicas', 'bachillerato', '{1}', 'Estadistica descriptiva', '["media","mediana","moda","varianza","desviacion","rango","percentil","cuartil","correlacion","covarianza"]');

-- ============================================
-- PROGRAMACION (POO, bases datos, web)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'bachillerato', '{1}', 'Control de versiones', '["git","commit","branch","merge","pull","push","clone","repositorio","fork","conflicto"]'),
('programacion', 'bachillerato', '{1}', 'Seguridad informatica', '["cifrado","hash","token","firewall","malware","phishing","vulnerabilidad","autenticacion","autorizacion","certificado"]');

-- ============================================
-- TECNOLOGIA (energias, mecanismos, electronica)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('tecnologia', 'bachillerato', '{1}', 'Herramientas de taller', '["martillo","destornillador","alicate","llave","sierra","taladro","lima","soldador","calibre","escofina"]'),
('tecnologia', 'bachillerato', '{1}', 'Puertas logicas', '["and","or","not","nand","nor","xor","xnor","buffer","flipflop","latch"]');

-- ============================================
-- VALENCIANO (palabras en valenciano)
-- ============================================
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('valenciano', 'bachillerato', '{1}', 'Festes valencianes', '["falles","fogueres","moros","cristians","mascleta","muixeranga","bunyols","ninot","cavalcada","orxata"]'),
('valenciano', 'bachillerato', '{1}', 'Natura valenciana', '["albufera","montgo","penyagolosa","turia","xuquer","serpis","dunes","marjal","garrofer","tarongina"]');
