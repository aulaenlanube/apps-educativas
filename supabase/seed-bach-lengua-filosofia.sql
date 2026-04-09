-- ============================================================================
-- SEED: Datos masivos de Bachillerato — Lengua (1º y 2º) y Filosofía (1º y 2º)
-- Fecha: 2026-04-09
-- Contenido académico adaptado al currículo español de Bachillerato
-- ============================================================================

-- ////////////////////////////////////////////////////////////////////////////
-- 1. ROSCO_QUESTIONS
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Figura retórica que consiste en la repetición de una o varias palabras al principio de versos o enunciados sucesivos', 'anafora', 'lengua', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Movimiento literario del siglo XVII caracterizado por la complejidad formal y el desengaño vital', 'barroco', 'lengua', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Estilo poético barroco que busca la dificultad formal mediante metáforas complejas y latinismos, asociado a Góngora', 'culteranismo', 'lengua', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Tipo de texto en el que dos o más interlocutores intercambian turnos de habla', 'dialogo', 'lengua', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Composición lírica renacentista de tema amoroso formada por estrofas de entre 7 y 30 versos', 'egloga', 'lengua', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Tipo de complemento verbal que indica la finalidad de la acción expresada por el verbo', 'finalidad', 'lengua', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Poeta renacentista toledano autor de las Églogas y renovador de la lírica castellana junto a Boscán', 'garcilaso', 'lengua', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Figura retórica que consiste en la exageración desmesurada de una cualidad o situación', 'hiperbole', 'lengua', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Figura retórica que expresa lo contrario de lo que se quiere decir, con intención crítica o humorística', 'ironia', 'lengua', 'bachillerato', '{1}', 1),
('J', 'contiene', 'Tipo de oración subordinada que realiza la función de complemento directo, sujeto u otras funciones propias del sustantivo', 'subjuntivo', 'lengua', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Escritor checo cuya narrativa existencialista influyó en la literatura universal del siglo XX, autor de La metamorfosis', 'kafka', 'lengua', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Novela picaresca anónima de 1554 considerada precursora del género, protagonizada por un pregonero de Toledo', 'lazarillo', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Figura retórica que establece una relación de semejanza entre dos términos sin usar nexo comparativo', 'metafora', 'lengua', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Género literario que engloba la novela, el cuento y otras formas de ficción en prosa', 'narrativa', 'lengua', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Estrofa de ocho versos endecasílabos con rima consonante ABABABCC, usada en poemas épicos renacentistas', 'octava', 'lengua', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Movimiento poético italiano del siglo XIV, encabezado por Francesco Petrarca, que influyó en el Renacimiento español', 'petrarquismo', 'lengua', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Autor de los Sueños y de El Buscón, máximo representante del conceptismo barroco', 'quevedo', 'lengua', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Movimiento cultural europeo de los siglos XV y XVI que recupera los modelos grecolatinos y sitúa al ser humano en el centro', 'renacimiento', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Composición poética de catorce versos endecasílabos distribuidos en dos cuartetos y dos tercetos', 'soneto', 'lengua', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Clasificación de los textos según su intención comunicativa: narración, descripción, exposición, argumentación o diálogo', 'tipologia', 'lengua', 'bachillerato', '{1}', 2),
('U', 'contiene', 'Estilo barroco que busca la agudeza de pensamiento mediante juegos de palabras y dobles sentidos, asociado a Quevedo', 'conceptismo', 'lengua', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Tipo de palabra que expresa acciones, estados o procesos y funciona como núcleo del predicado', 'verbo', 'lengua', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Autor del Quijote, considerado la primera novela moderna de la literatura universal', 'cervantes', 'lengua', 'bachillerato', '{1}', 3),
('X', 'contiene', 'Tipo de texto que presenta información de forma objetiva y ordenada para hacer comprensible un tema al receptor', 'expositivo', 'lengua', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Figura retórica que une dos elementos mediante la conjunción copulativa de forma reiterada', 'polisindeton', 'lengua', 'bachillerato', '{1}', 3),
('Z', 'empieza', 'Estrofa de arte menor compuesta por una mudanza y una vuelta, propia de la lírica tradicional castellana', 'zejel', 'lengua', 'bachillerato', '{1}', 3);

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Corriente poética de los años 20-30 en España que buscó la deshumanización del arte y la imagen visionaria', 'vanguardias', 'lengua', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Autor de La Regenta, máximo exponente del naturalismo literario español', 'alas', 'lengua', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Autor de Luces de bohemia y creador del esperpento como género dramático', 'benavente', 'lengua', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Técnica de análisis textual que estudia la estructura, el tema, los recursos y la intención de un escrito', 'comentario', 'lengua', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Generación literaria de posguerra cuya poesía se caracteriza por el tono existencial y la angustia, con Dámaso Alonso como figura clave', 'desarraigada', 'lengua', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Movimiento artístico y literario que busca la expresión subjetiva de las emociones distorsionando la realidad', 'expresionismo', 'lengua', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Autor granadino de Romancero gitano y Poeta en Nueva York, asesinado en 1936', 'federico', 'lengua', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Grupo poético español de 1927 que fusionó tradición y vanguardia, con Lorca, Alberti, Cernuda y Salinas', 'generacion', 'lengua', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Corriente filosófica y literaria existencialista que influyó en la novela española de posguerra', 'humanismo', 'lengua', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Movimiento literario y artístico de finales del siglo XIX que buscaba sugerir sensaciones mediante el símbolo y la musicalidad', 'impresionismo', 'lengua', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Poeta de Moguer, Nobel en 1956, autor de Platero y yo y Diario de un poeta recién casado', 'jimenez', 'lengua', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Escritor existencialista checo-alemán cuya influencia se percibe en la narrativa experimental española de posguerra', 'kafka', 'lengua', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Novela de Camilo José Cela publicada en 1942, considerada iniciadora del tremendismo en la narrativa de posguerra', 'lazarillo', 'lengua', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Autor de Campos de Castilla y representante de la Generación del 98, reflexionó sobre España y el paisaje castellano', 'machado', 'lengua', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Corriente narrativa de los años 60 en España que renovó la técnica con monólogo interior, perspectivismo y ruptura temporal', 'novela', 'lengua', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Parte del comentario de texto donde se analiza la disposición interna del contenido y la externa de la forma', 'organizacion', 'lengua', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Novela de Benito Pérez Galdós que retrata la sociedad madrileña del XIX con técnica realista', 'fortunata', 'lengua', 'bachillerato', '{2}', 3),
('Q', 'contiene', 'Figura literaria propia del esperpento valleinclanesco que deforma la realidad de manera grotesca', 'esperpento', 'lengua', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Corriente literaria del siglo XIX que busca la representación fiel y objetiva de la realidad social', 'realismo', 'lengua', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Procedimiento por el cual el narrador reproduce el flujo de pensamiento de un personaje sin orden lógico aparente', 'soliloquio', 'lengua', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Corriente narrativa de posguerra caracterizada por la crudeza, la violencia y el pesimismo existencial, iniciada por La familia de Pascual Duarte', 'tremendismo', 'lengua', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Autor de Niebla y San Manuel Bueno, mártir, figura central de la Generación del 98', 'unamuno', 'lengua', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Autor de Luces de bohemia y las Sonatas, creador del esperpento como deformación grotesca de la realidad', 'valle', 'lengua', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Autor de Tirano Banderas, novela que anticipa la narrativa del dictador latinoamericano', 'valleinclan', 'lengua', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Tipo de texto periodístico que expone la opinión razonada del autor sobre un tema de actualidad, propio de la EvAU', 'texto', 'lengua', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Poeta sevillano del 27, autor de La realidad y el deseo, cuya obra gira en torno al conflicto entre anhelo y mundo', 'cernuda', 'lengua', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Novela de Luis Martín Santos publicada en 1962 que renueva la narrativa española con técnica experimental', 'zarabanda', 'lengua', 'bachillerato', '{2}', 3);

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Filósofo griego discípulo de Platón que desarrolló la lógica formal y la teoría del acto y la potencia', 'aristoteles', 'filosofia', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Rama de la filosofía que estudia la naturaleza del bien, la belleza y los valores estéticos', 'belleza', 'filosofia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Corriente filosófica del siglo XVII-XVIII que considera la razón como fuente principal del conocimiento, representada por Descartes', 'cartesianismo', 'filosofia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Método filosófico basado en el diálogo y la contraposición de ideas, empleado por Sócrates, Platón, Hegel y Marx', 'dialectica', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Rama de la filosofía que estudia el origen, la naturaleza y los límites del conocimiento humano', 'epistemologia', 'filosofia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Doctrina ética que establece que la acción moralmente buena es la que produce felicidad al mayor número de personas', 'felicidad', 'filosofia', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Corriente epistemológica que establece que todo conocimiento válido procede de la experiencia sensible y la observación', 'gnoseologia', 'filosofia', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Corriente ética que identifica el placer como el bien supremo y fin último de la vida humana', 'hedonismo', 'filosofia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Corriente filosófica que considera que la realidad es de naturaleza mental o espiritual, no material', 'idealismo', 'filosofia', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Tipo de proposición que emite una valoración sobre algo, pudiendo ser de hecho o de valor', 'juicio', 'filosofia', 'bachillerato', '{1}', 2),
('K', 'empieza', 'Filósofo alemán autor de la Crítica de la razón pura que planteó los límites del conocimiento humano', 'kant', 'filosofia', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Disciplina filosófica que estudia las leyes del razonamiento válido y las formas de la inferencia correcta', 'logica', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Corriente filosófica que afirma que solo existe la realidad material y niega la existencia de entidades espirituales', 'materialismo', 'filosofia', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Corriente filosófica que niega la existencia de valores absolutos y de verdades universales', 'nihilismo', 'filosofia', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Rama de la filosofía que estudia el ser en cuanto ser, la naturaleza de la existencia y la realidad', 'ontologia', 'filosofia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Filósofo griego fundador de la Academia, autor de La República y creador de la teoría de las Ideas', 'platon', 'filosofia', 'bachillerato', '{1}', 1),
('Q', 'contiene', 'Principio lógico que establece que una proposición es verdadera o falsa, sin término medio', 'bivalencia', 'filosofia', 'bachillerato', '{1}', 3),
('R', 'empieza', 'Corriente filosófica que sostiene que la razón es la fuente fundamental del conocimiento, frente a los sentidos', 'racionalismo', 'filosofia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Filósofo griego que empleó la mayéutica para ayudar a sus interlocutores a descubrir la verdad por sí mismos', 'socrates', 'filosofia', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Filósofo medieval que sintetizó la filosofía aristotélica con la teología cristiana en la Summa Theologiae', 'tomas', 'filosofia', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Doctrina ética de Bentham y Mill que juzga la moralidad de una acción por sus consecuencias en la felicidad general', 'utilitarismo', 'filosofia', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Proposición que se puede evaluar como verdadera o falsa mediante criterios de correspondencia, coherencia o pragmáticos', 'verdad', 'filosofia', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Filósofo del siglo XX que investigó los límites del lenguaje y su relación con el pensamiento en el Tractatus', 'wittgenstein', 'filosofia', 'bachillerato', '{1}', 3),
('X', 'contiene', 'Corriente filosófica que parte de la angustia ante la libertad y la responsabilidad del ser humano en el mundo', 'existencialismo', 'filosofia', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Tipo de razonamiento lógico formado por dos premisas y una conclusión, estructura central de la lógica aristotélica', 'silogismo', 'filosofia', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Pensador presocrático que planteó las famosas paradojas del movimiento, como la de Aquiles y la tortuga', 'zenon', 'filosofia', 'bachillerato', '{1}', 2);

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Filósofo estagirita cuya metafísica distingue entre sustancia y accidente, acto y potencia, materia y forma', 'aristoteles', 'filosofia', 'bachillerato', '{2}', 1),
('B', 'contiene', 'Concepto kantiano que designa la buena disposición de la voluntad como lo único bueno sin restricción', 'buenavoluntad', 'filosofia', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Principio cartesiano formulado como Cogito ergo sum, fundamento de la filosofía moderna', 'cogito', 'filosofia', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Filósofo francés padre del racionalismo moderno, autor del Discurso del método y las Meditaciones metafísicas', 'descartes', 'filosofia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Corriente filosófica que sostiene que todo conocimiento procede de la experiencia sensible, representada por Locke y Hume', 'empirismo', 'filosofia', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Concepto nietzscheano de etapa de la cultura en la que la razón apolínea se impone sobre la vitalidad dionisíaca', 'filisteo', 'filosofia', 'bachillerato', '{2}', 3),
('G', 'contiene', 'Concepto platónico referido al conocimiento superior que capta las Ideas inmutables más allá del mundo sensible', 'inteligible', 'filosofia', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Filósofo empirista escocés que negó la causalidad necesaria y redujo el conocimiento a impresiones e ideas', 'hume', 'filosofia', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Concepto kantiano que designa la ley moral universal formulada como principio racional incondicional', 'imperativo', 'filosofia', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Tipo de proposición que según Kant puede ser analítica o sintética, y a priori o a posteriori', 'juicio', 'filosofia', 'bachillerato', '{2}', 2),
('K', 'empieza', 'Filósofo de Königsberg que realizó la síntesis entre racionalismo y empirismo en sus tres Críticas', 'kant', 'filosofia', 'bachillerato', '{2}', 1),
('L', 'contiene', 'Concepto marxista que designa la emancipación del proletariado respecto de la explotación capitalista', 'plusvalia', 'filosofia', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Filósofo alemán que desarrolló el materialismo histórico y la crítica de la economía política capitalista', 'marx', 'filosofia', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Filósofo alemán que proclamó la muerte de Dios y propuso la transmutación de todos los valores', 'nietzsche', 'filosofia', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Filósofo español autor de la teoría del raciovitalismo y de la razón vital e histórica', 'ortega', 'filosofia', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Filósofo ateniense cuya teoría de las Ideas postula un mundo inteligible de formas eternas e inmutables', 'platon', 'filosofia', 'bachillerato', '{2}', 1),
('Q', 'contiene', 'Las cinco pruebas de la existencia de Dios formuladas por Tomás de Aquino en la Summa Theologiae', 'quinquevias', 'filosofia', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Concepto orteguiano que expresa la idea de que la vida humana es la realidad radical desde la cual se entiende todo', 'raciovitalismo', 'filosofia', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Concepto nietzscheano que designa al ser humano que ha superado la moral de esclavos y crea sus propios valores', 'superhombre', 'filosofia', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Filósofo medieval que armonizó fe y razón, demostrando que la teología y la filosofía son compatibles', 'tomas', 'filosofia', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Concepto aristotélico referido al acto de pensar que se piensa a sí mismo, propio del Motor Inmóvil', 'noumenico', 'filosofia', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Concepto central en la filosofía de Nietzsche que designa la fuerza creadora y afirmativa de la vida', 'voluntad', 'filosofia', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Concepto marxista referido a la visión distorsionada de la realidad que justifica la dominación de clase', 'ideologia', 'filosofia', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Tipo de juicio kantiano que amplía el conocimiento y es a priori, propio de la ciencia según la Crítica de la razón pura', 'sintetico', 'filosofia', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Concepto platónico que representa la alegoría de la salida de la ignorancia hacia el conocimiento verdadero', 'caverna', 'filosofia', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Pensador presocrático cuyas aporías sobre el movimiento influyeron en la metafísica de Parménides', 'zenon', 'filosofia', 'bachillerato', '{2}', 2);

-- ////////////////////////////////////////////////////////////////////////////
-- 2. RUNNER_CATEGORIES
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('lengua', 'bachillerato', '{1}', 'Figuras retóricas', '["metafora","anafora","hiperbole","ironia","metonimia","sinestesia","aliteracion","antitesis","paradoja","prosopopeya","elipsis","hiperbaton"]'),
('lengua', 'bachillerato', '{1}', 'Autores del Renacimiento', '["garcilaso","boscan","herrera","fray luis","san juan","santa teresa","lazarillo","montemayor","aldana","cetina","hurtado","acuna"]'),
('lengua', 'bachillerato', '{1}', 'Autores del Barroco', '["quevedo","gongora","lope","calderon","tirso","cervantes","gracian","villamediana","rioja","argensola","jauregui","bocangel"]'),
('lengua', 'bachillerato', '{1}', 'Estrofas y metros', '["soneto","lira","octava","terceto","romance","silva","redondilla","decima","copla","villancico","endecasilabo","alejandrino"]'),
('lengua', 'bachillerato', '{1}', 'Géneros literarios', '["epica","lirica","drama","novela","cuento","ensayo","tragedia","comedia","elegia","oda","satira","epistola"]'),
('lengua', 'bachillerato', '{1}', 'Categorías gramaticales', '["sustantivo","adjetivo","verbo","adverbio","pronombre","preposicion","conjuncion","determinante","interjeccion","participio","gerundio","infinitivo"]'),
('lengua', 'bachillerato', '{1}', 'Funciones sintácticas', '["sujeto","predicado","atributo","complemento directo","complemento indirecto","complemento circunstancial","complemento agente","complemento regimen","complemento predicativo","aposicion","vocativo","modificador"]'),
('lengua', 'bachillerato', '{1}', 'Tipologías textuales', '["narracion","descripcion","exposicion","argumentacion","dialogo","instructivo","predictivo","retórico","periodistico","publicitario","juridico","cientifico"]'),
('lengua', 'bachillerato', '{1}', 'Obras del Siglo de Oro', '["quijote","lazarillo","buscon","celestina","fuenteovejuna","galatea","novelas ejemplares","soledades","polifemo","vida es sueno","burlador","alcalde"]'),
('lengua', 'bachillerato', '{1}', 'Léxico y semántica', '["sinonimia","antonimia","polisemia","homonimia","hiperonimia","hiponimia","denotacion","connotacion","campo semantico","familia lexica","acronimo","neologismo"]');

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('lengua', 'bachillerato', '{2}', 'Generación del 98', '["unamuno","machado","baroja","azorin","valle","maeztu","benavente","ganivet","blasco","zulueta","salaverria","menendez"]'),
('lengua', 'bachillerato', '{2}', 'Generación del 27', '["lorca","alberti","cernuda","salinas","guillen","aleixandre","dámaso","gerardo","prados","altolaguirre","hinojosa","concha"]'),
('lengua', 'bachillerato', '{2}', 'Novela de posguerra', '["cela","delibes","laforet","sender","torrente","goytisolo","matute","aldecoa","ferlosio","benet","marsé","martin santos"]'),
('lengua', 'bachillerato', '{2}', 'Poesía contemporánea', '["hernandez","otero","hierro","celaya","gil de biedma","valente","brines","claudio","rodriguez","carnero","gimferrer","villena"]'),
('lengua', 'bachillerato', '{2}', 'Teatro del siglo XX', '["valle","benavente","lorca","casona","buero","sastre","arrabal","nieva","alonso","cabal","sanchis","mayorga"]'),
('lengua', 'bachillerato', '{2}', 'Movimientos literarios', '["realismo","naturalismo","modernismo","noventayochismo","novecentismo","vanguardismo","surrealismo","tremendismo","existencialismo","social","experimental","posmodernismo"]'),
('lengua', 'bachillerato', '{2}', 'Recursos del comentario', '["tema","resumen","estructura","tesis","argumento","modalidad","registro","cohesion","coherencia","adecuacion","deixis","anafora"]'),
('lengua', 'bachillerato', '{2}', 'Narrativa realista del XIX', '["galdos","clarin","pardo bazan","pereda","valera","palacio valdes","blasco ibanez","alarcon","fernán caballero","coloma","picón","ortega munilla"]'),
('lengua', 'bachillerato', '{2}', 'Obras clave EvAU', '["regenta","buscon","quijote","casa bernarda","luces bohemia","san manuel","arbol ciencia","colmena","camino","jarama","nada","entre visillos"]'),
('lengua', 'bachillerato', '{2}', 'Conectores textuales', '["además","sin embargo","por tanto","en conclusión","no obstante","asimismo","en cambio","por consiguiente","en definitiva","en primer lugar","por otra parte","de hecho"]');

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('filosofia', 'bachillerato', '{1}', 'Ramas de la filosofía', '["metafisica","epistemologia","etica","estetica","logica","ontologia","antropologia","politica","axiologia","hermeneutica","gnoseologia","filosofia del lenguaje"]'),
('filosofia', 'bachillerato', '{1}', 'Filósofos antiguos', '["socrates","platon","aristoteles","tales","heraclito","parmenides","democrito","pitagoras","epicuro","zenon","diogenes","anaxagoras"]'),
('filosofia', 'bachillerato', '{1}', 'Corrientes éticas', '["hedonismo","estoicismo","utilitarismo","eudemonismo","deontologismo","relativismo","emotivismo","contractualismo","etica de virtudes","nihilismo","altruismo","egoismo"]'),
('filosofia', 'bachillerato', '{1}', 'Corrientes epistemológicas', '["racionalismo","empirismo","criticismo","escepticismo","positivismo","pragmatismo","fenomenologia","constructivismo","idealismo","realismo","relativismo","falsacionismo"]'),
('filosofia', 'bachillerato', '{1}', 'Conceptos de lógica', '["premisa","conclusion","silogismo","falacia","validez","verdad","deduccion","induccion","paradoja","tautologia","contradiccion","contingencia"]'),
('filosofia', 'bachillerato', '{1}', 'Conceptos de metafísica', '["ser","sustancia","esencia","existencia","accidente","potencia","acto","causa","efecto","necesidad","contingencia","absoluto"]'),
('filosofia', 'bachillerato', '{1}', 'Conceptos de ética', '["bien","mal","virtud","deber","libertad","responsabilidad","justicia","dignidad","autonomia","heteronomia","norma","valor"]'),
('filosofia', 'bachillerato', '{1}', 'Filósofos modernos', '["descartes","locke","hume","kant","leibniz","spinoza","berkeley","hobbes","rousseau","montesquieu","voltaire","pascal"]'),
('filosofia', 'bachillerato', '{1}', 'Falacias argumentativas', '["ad hominem","ad populum","ad verecundiam","peticion de principio","falso dilema","generalizacion","hombre de paja","pendiente resbaladiza","causa falsa","equivoco","composicion","division"]'),
('filosofia', 'bachillerato', '{1}', 'Tipos de conocimiento', '["empirico","racional","intuitivo","discursivo","a priori","a posteriori","analitico","sintetico","sensible","inteligible","cientifico","vulgar"]');

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('filosofia', 'bachillerato', '{2}', 'Conceptos de Platón', '["idea","demiurgo","caverna","anamnesis","dualismo","bien","justicia","mito","dialectica","participacion","imitacion","alma tripartita"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Aristóteles', '["sustancia","hilemorfismo","potencia","acto","eudaimonia","catarsis","silogismo","entelequia","causa final","motor inmovil","prudencia","virtud"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Descartes', '["cogito","duda metodica","res cogitans","res extensa","glandula pineal","ideas innatas","mecanicismo","sustancia","genio maligno","evidencia","analisis","sintesis"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Kant', '["imperativo","noumeno","fenomeno","juicio sintetico","a priori","razon pura","razon practica","autonomia","deber","categoria","estetica trascendental","analitica"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Marx', '["plusvalia","proletariado","burguesia","alienacion","ideologia","infraestructura","superestructura","materialismo historico","lucha de clases","capital","mercancia","trabajo"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Nietzsche', '["superhombre","eterno retorno","voluntad de poder","muerte de dios","nihilismo","transmutacion","dionisos","apolo","genealogia","resentimiento","amor fati","perspectivismo"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Ortega', '["raciovitalismo","perspectivismo","circunstancia","razon vital","razon historica","masa","elite","generacion","creencia","idea","deshumanizacion","ensimismamiento"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Hume', '["impresion","idea","habito","causalidad","escepticismo","emotivismo","creencia","asociacion","relaciones de ideas","cuestiones de hecho","yo","sustancia"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Tomás de Aquino', '["quinque viae","analogia","ley natural","ley eterna","acto de ser","esencia","existencia","fe y razon","teologia natural","causa primera","bien comun","sindéresis"]'),
('filosofia', 'bachillerato', '{2}', 'Autores de la EvAU', '["platon","aristoteles","tomas","descartes","hume","kant","marx","nietzsche","ortega","agustin","ockham","wittgenstein"]');

-- ////////////////////////////////////////////////////////////////////////////
-- 3. INTRUSO_SETS
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('lengua', 'bachillerato', '{1}', 'Figuras retóricas de repetición', '["anafora","epifora","aliteracion","polisindeton"]', '["metafora","hiperbaton"]'),
('lengua', 'bachillerato', '{1}', 'Autores del Renacimiento español', '["garcilaso","fray luis","san juan","boscan"]', '["quevedo","gongora"]'),
('lengua', 'bachillerato', '{1}', 'Autores del Barroco español', '["quevedo","gongora","lope","calderon"]', '["garcilaso","fray luis"]'),
('lengua', 'bachillerato', '{1}', 'Obras de Cervantes', '["quijote","galatea","novelas ejemplares","persiles"]', '["buscon","soledades"]'),
('lengua', 'bachillerato', '{1}', 'Estrofas de arte mayor', '["soneto","octava","lira","silva"]', '["romance","copla"]'),
('lengua', 'bachillerato', '{1}', 'Funciones del lenguaje', '["referencial","emotiva","conativa","poetica"]', '["dialectal","coloquial"]'),
('lengua', 'bachillerato', '{1}', 'Tipos de oraciones subordinadas', '["sustantiva","adjetiva","adverbial","comparativa"]', '["imperativa","exclamativa"]'),
('lengua', 'bachillerato', '{1}', 'Subgéneros narrativos', '["novela","cuento","leyenda","fabula"]', '["oda","soneto"]'),
('lengua', 'bachillerato', '{1}', 'Tipos de complementos verbales', '["directo","indirecto","circunstancial","agente"]', '["determinante","adverbio"]'),
('lengua', 'bachillerato', '{1}', 'Características del Renacimiento', '["antropocentrismo","imitacion clasica","naturaleza idealizada","neoplatonismo"]', '["desengano","pesimismo"]'),
('lengua', 'bachillerato', '{1}', 'Rasgos del culteranismo', '["latinismos","hiperbaton","metaforas complejas","cultismos"]', '["juego de palabras","conceptos ingeniosos"]'),
('lengua', 'bachillerato', '{1}', 'Novelas picarescas', '["lazarillo","buscon","guzman de alfarache","marcos de obregon"]', '["quijote","galatea"]');

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('lengua', 'bachillerato', '{2}', 'Autores de la Generación del 98', '["unamuno","machado","baroja","azorin"]', '["lorca","alberti"]'),
('lengua', 'bachillerato', '{2}', 'Poetas de la Generación del 27', '["lorca","alberti","cernuda","salinas"]', '["machado","jimenez"]'),
('lengua', 'bachillerato', '{2}', 'Novelistas de posguerra', '["cela","delibes","laforet","matute"]', '["galdos","clarin"]'),
('lengua', 'bachillerato', '{2}', 'Obras del Realismo español', '["regenta","fortunata y jacinta","pepita jimenez","sotileza"]', '["niebla","luces de bohemia"]'),
('lengua', 'bachillerato', '{2}', 'Rasgos del Modernismo', '["musicalidad","exotismo","simbolismo","esteticismo"]', '["tremendismo","objetivismo"]'),
('lengua', 'bachillerato', '{2}', 'Obras de Valle-Inclán', '["luces de bohemia","sonata de otono","tirano banderas","divinas palabras"]', '["la colmena","nada"]'),
('lengua', 'bachillerato', '{2}', 'Rasgos de la novela experimental', '["monologo interior","perspectivismo","ruptura temporal","contrapunto"]', '["narrador omnisciente","orden cronologico"]'),
('lengua', 'bachillerato', '{2}', 'Poetas de posguerra social', '["celaya","otero","hierro","nora"]', '["guillen","salinas"]'),
('lengua', 'bachillerato', '{2}', 'Propiedades textuales', '["coherencia","cohesion","adecuacion","corrección"]', '["metafora","aliteracion"]'),
('lengua', 'bachillerato', '{2}', 'Obras de Lorca', '["bodas de sangre","casa de bernarda alba","yerma","romancero gitano"]', '["la colmena","el jarama"]'),
('lengua', 'bachillerato', '{2}', 'Dramaturgos del XX', '["buero vallejo","sastre","lorca","valle"]', '["delibes","cela"]'),
('lengua', 'bachillerato', '{2}', 'Figuras del Novecentismo', '["ortega","dors","perez de ayala","miro"]', '["baroja","unamuno"]');

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('filosofia', 'bachillerato', '{1}', 'Filósofos presocráticos', '["tales","heraclito","parmenides","democrito"]', '["platon","aristoteles"]'),
('filosofia', 'bachillerato', '{1}', 'Filósofos racionalistas', '["descartes","spinoza","leibniz","malebranche"]', '["locke","hume"]'),
('filosofia', 'bachillerato', '{1}', 'Filósofos empiristas', '["locke","hume","berkeley","bacon"]', '["descartes","spinoza"]'),
('filosofia', 'bachillerato', '{1}', 'Corrientes éticas consecuencialistas', '["utilitarismo","hedonismo","eudemonismo","pragmatismo"]', '["deontologismo","estoicismo"]'),
('filosofia', 'bachillerato', '{1}', 'Conceptos de lógica formal', '["premisa","conclusion","silogismo","validez"]', '["libertad","virtud"]'),
('filosofia', 'bachillerato', '{1}', 'Ramas de la filosofía teórica', '["metafisica","epistemologia","logica","ontologia"]', '["etica","politica"]'),
('filosofia', 'bachillerato', '{1}', 'Características del estoicismo', '["ataraxia","apatia","logos","virtud"]', '["placer","hedonismo"]'),
('filosofia', 'bachillerato', '{1}', 'Falacias informales', '["ad hominem","ad populum","hombre de paja","falso dilema"]', '["modus ponens","modus tollens"]'),
('filosofia', 'bachillerato', '{1}', 'Tipos de saber según Aristóteles', '["episteme","techne","phronesis","sophia"]', '["cogito","noumeno"]'),
('filosofia', 'bachillerato', '{1}', 'Conceptos de filosofía política', '["justicia","estado","democracia","contrato social"]', '["silogismo","tautologia"]'),
('filosofia', 'bachillerato', '{1}', 'Pensadores existencialistas', '["kierkegaard","sartre","heidegger","camus"]', '["comte","carnap"]'),
('filosofia', 'bachillerato', '{1}', 'Conceptos de ética kantiana', '["deber","imperativo","autonomia","dignidad"]', '["placer","utilidad"]');

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('filosofia', 'bachillerato', '{2}', 'Conceptos de la metafísica platónica', '["idea","demiurgo","participacion","mundo inteligible"]', '["sustancia","hilemorfismo"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos del empirismo de Hume', '["impresion","habito","escepticismo","asociacion"]', '["cogito","ideas innatas"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de la filosofía kantiana', '["noumeno","fenomeno","imperativo categorico","juicio sintetico a priori"]', '["voluntad de poder","eterno retorno"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos del materialismo marxista', '["plusvalia","alienacion","infraestructura","lucha de clases"]', '["superhombre","eterno retorno"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Nietzsche', '["superhombre","voluntad de poder","nihilismo","eterno retorno"]', '["imperativo categorico","noumeno"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos de Ortega y Gasset', '["circunstancia","perspectivismo","razon vital","masa"]', '["cogito","duda metodica"]'),
('filosofia', 'bachillerato', '{2}', 'Obras de Platón', '["republica","fedon","banquete","timeo"]', '["metafisica","etica a nicomaco"]'),
('filosofia', 'bachillerato', '{2}', 'Obras de Aristóteles', '["metafisica","etica a nicomaco","politica","poetica"]', '["republica","fedon"]'),
('filosofia', 'bachillerato', '{2}', 'Vías tomistas de la existencia de Dios', '["via del movimiento","via de la causa eficiente","via de la contingencia","via de los grados de perfeccion"]', '["argumento ontologico","apuesta de pascal"]'),
('filosofia', 'bachillerato', '{2}', 'Conceptos del racionalismo cartesiano', '["cogito","duda metodica","res cogitans","ideas innatas"]', '["impresion","habito"]'),
('filosofia', 'bachillerato', '{2}', 'Pensadores medievales', '["tomas de aquino","agustin","ockham","averroes"]', '["descartes","hume"]'),
('filosofia', 'bachillerato', '{2}', 'Obras de Kant', '["critica de la razon pura","critica de la razon practica","critica del juicio","fundamentacion de la metafisica"]', '["el capital","asi hablo zaratustra"]');

-- ////////////////////////////////////////////////////////////////////////////
-- 4. PAREJAS_ITEMS
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('lengua', 'bachillerato', '{1}', 'Garcilaso de la Vega', 'Églogas'),
('lengua', 'bachillerato', '{1}', 'Fray Luis de León', 'Oda a la vida retirada'),
('lengua', 'bachillerato', '{1}', 'San Juan de la Cruz', 'Cántico espiritual'),
('lengua', 'bachillerato', '{1}', 'Quevedo', 'El Buscón'),
('lengua', 'bachillerato', '{1}', 'Góngora', 'Soledades'),
('lengua', 'bachillerato', '{1}', 'Cervantes', 'Don Quijote'),
('lengua', 'bachillerato', '{1}', 'Lope de Vega', 'Fuenteovejuna'),
('lengua', 'bachillerato', '{1}', 'Calderón de la Barca', 'La vida es sueño'),
('lengua', 'bachillerato', '{1}', 'Metáfora', 'Identificación entre dos términos'),
('lengua', 'bachillerato', '{1}', 'Hipérbole', 'Exageración expresiva'),
('lengua', 'bachillerato', '{1}', 'Anáfora', 'Repetición al inicio'),
('lengua', 'bachillerato', '{1}', 'Hipérbaton', 'Alteración del orden sintáctico'),
('lengua', 'bachillerato', '{1}', 'Soneto', 'Catorce versos endecasílabos'),
('lengua', 'bachillerato', '{1}', 'Lira', 'Estrofa de cinco versos 7a11B7a7b11B'),
('lengua', 'bachillerato', '{1}', 'Culteranismo', 'Góngora'),
('lengua', 'bachillerato', '{1}', 'Conceptismo', 'Quevedo'),
('lengua', 'bachillerato', '{1}', 'Lazarillo', 'Novela picaresca anónima'),
('lengua', 'bachillerato', '{1}', 'Sujeto', 'Concuerda con el verbo en número y persona'),
('lengua', 'bachillerato', '{1}', 'Complemento directo', 'Se sustituye por lo, la, los, las'),
('lengua', 'bachillerato', '{1}', 'Texto expositivo', 'Transmite información objetiva'),
('lengua', 'bachillerato', '{1}', 'Texto argumentativo', 'Defiende una tesis con razones'),
('lengua', 'bachillerato', '{1}', 'Renacimiento', 'Siglos XV-XVI'),
('lengua', 'bachillerato', '{1}', 'Barroco', 'Siglo XVII'),
('lengua', 'bachillerato', '{1}', 'Santa Teresa', 'Las moradas');

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('lengua', 'bachillerato', '{2}', 'Unamuno', 'Niebla'),
('lengua', 'bachillerato', '{2}', 'Machado', 'Campos de Castilla'),
('lengua', 'bachillerato', '{2}', 'Baroja', 'El árbol de la ciencia'),
('lengua', 'bachillerato', '{2}', 'Valle-Inclán', 'Luces de bohemia'),
('lengua', 'bachillerato', '{2}', 'Lorca', 'La casa de Bernarda Alba'),
('lengua', 'bachillerato', '{2}', 'Alberti', 'Marinero en tierra'),
('lengua', 'bachillerato', '{2}', 'Cernuda', 'La realidad y el deseo'),
('lengua', 'bachillerato', '{2}', 'Cela', 'La colmena'),
('lengua', 'bachillerato', '{2}', 'Delibes', 'El camino'),
('lengua', 'bachillerato', '{2}', 'Laforet', 'Nada'),
('lengua', 'bachillerato', '{2}', 'Sánchez Ferlosio', 'El Jarama'),
('lengua', 'bachillerato', '{2}', 'Martín Santos', 'Tiempo de silencio'),
('lengua', 'bachillerato', '{2}', 'Buero Vallejo', 'Historia de una escalera'),
('lengua', 'bachillerato', '{2}', 'Juan Ramón Jiménez', 'Platero y yo'),
('lengua', 'bachillerato', '{2}', 'Galdós', 'Fortunata y Jacinta'),
('lengua', 'bachillerato', '{2}', 'Clarín', 'La Regenta'),
('lengua', 'bachillerato', '{2}', 'Esperpento', 'Deformación grotesca de la realidad'),
('lengua', 'bachillerato', '{2}', 'Tremendismo', 'Crudeza y violencia en la narrativa'),
('lengua', 'bachillerato', '{2}', 'Realismo social', 'Denuncia de las injusticias sociales'),
('lengua', 'bachillerato', '{2}', 'Novela experimental', 'Ruptura de técnicas narrativas tradicionales'),
('lengua', 'bachillerato', '{2}', 'Coherencia', 'Unidad temática del texto'),
('lengua', 'bachillerato', '{2}', 'Cohesión', 'Mecanismos de conexión entre enunciados'),
('lengua', 'bachillerato', '{2}', 'Adecuación', 'Adaptación al contexto comunicativo'),
('lengua', 'bachillerato', '{2}', 'Modernismo', 'Renovación estética de finales del XIX');

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('filosofia', 'bachillerato', '{1}', 'Sócrates', 'Mayéutica'),
('filosofia', 'bachillerato', '{1}', 'Platón', 'Teoría de las Ideas'),
('filosofia', 'bachillerato', '{1}', 'Aristóteles', 'Lógica silogística'),
('filosofia', 'bachillerato', '{1}', 'Epicuro', 'Hedonismo racional'),
('filosofia', 'bachillerato', '{1}', 'Zenón de Citio', 'Estoicismo'),
('filosofia', 'bachillerato', '{1}', 'Descartes', 'Duda metódica'),
('filosofia', 'bachillerato', '{1}', 'Kant', 'Imperativo categórico'),
('filosofia', 'bachillerato', '{1}', 'Mill', 'Utilitarismo'),
('filosofia', 'bachillerato', '{1}', 'Epistemología', 'Estudio del conocimiento'),
('filosofia', 'bachillerato', '{1}', 'Ontología', 'Estudio del ser'),
('filosofia', 'bachillerato', '{1}', 'Ética', 'Estudio de la moral'),
('filosofia', 'bachillerato', '{1}', 'Lógica', 'Estudio del razonamiento válido'),
('filosofia', 'bachillerato', '{1}', 'Estética', 'Estudio de la belleza y el arte'),
('filosofia', 'bachillerato', '{1}', 'Racionalismo', 'La razón como fuente de conocimiento'),
('filosofia', 'bachillerato', '{1}', 'Empirismo', 'La experiencia como fuente de conocimiento'),
('filosofia', 'bachillerato', '{1}', 'Idealismo', 'La realidad es de naturaleza mental'),
('filosofia', 'bachillerato', '{1}', 'Materialismo', 'Solo existe la materia'),
('filosofia', 'bachillerato', '{1}', 'Falacia ad hominem', 'Ataque a la persona en vez de al argumento'),
('filosofia', 'bachillerato', '{1}', 'Silogismo', 'Dos premisas y una conclusión'),
('filosofia', 'bachillerato', '{1}', 'Modus ponens', 'Si P entonces Q; P; luego Q'),
('filosofia', 'bachillerato', '{1}', 'Autonomía moral', 'El sujeto se da a sí mismo la ley moral'),
('filosofia', 'bachillerato', '{1}', 'Heteronomía', 'La ley moral viene de fuera del sujeto'),
('filosofia', 'bachillerato', '{1}', 'Relativismo', 'No hay verdades universales'),
('filosofia', 'bachillerato', '{1}', 'Dogmatismo', 'Certeza absoluta en el conocimiento');

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('filosofia', 'bachillerato', '{2}', 'Platón', 'Mundo de las Ideas'),
('filosofia', 'bachillerato', '{2}', 'Aristóteles', 'Hilemorfismo'),
('filosofia', 'bachillerato', '{2}', 'Tomás de Aquino', 'Cinco vías'),
('filosofia', 'bachillerato', '{2}', 'Descartes', 'Cogito ergo sum'),
('filosofia', 'bachillerato', '{2}', 'Hume', 'Crítica a la causalidad'),
('filosofia', 'bachillerato', '{2}', 'Kant', 'Crítica de la razón pura'),
('filosofia', 'bachillerato', '{2}', 'Marx', 'Materialismo histórico'),
('filosofia', 'bachillerato', '{2}', 'Nietzsche', 'Muerte de Dios'),
('filosofia', 'bachillerato', '{2}', 'Ortega', 'Yo soy yo y mi circunstancia'),
('filosofia', 'bachillerato', '{2}', 'Alegoría de la caverna', 'Tránsito de la ignorancia al conocimiento'),
('filosofia', 'bachillerato', '{2}', 'Motor inmóvil', 'Causa primera del movimiento en Aristóteles'),
('filosofia', 'bachillerato', '{2}', 'Res cogitans', 'Sustancia pensante en Descartes'),
('filosofia', 'bachillerato', '{2}', 'Noúmeno', 'Cosa en sí incognoscible en Kant'),
('filosofia', 'bachillerato', '{2}', 'Plusvalía', 'Valor no retribuido al trabajador en Marx'),
('filosofia', 'bachillerato', '{2}', 'Superhombre', 'Ser que crea sus propios valores en Nietzsche'),
('filosofia', 'bachillerato', '{2}', 'Razón vital', 'La vida como realidad radical en Ortega'),
('filosofia', 'bachillerato', '{2}', 'Ley natural', 'Participación racional en la ley eterna según Tomás'),
('filosofia', 'bachillerato', '{2}', 'Dualismo cartesiano', 'Separación de mente y cuerpo'),
('filosofia', 'bachillerato', '{2}', 'Emotivismo moral', 'Los juicios morales expresan sentimientos según Hume'),
('filosofia', 'bachillerato', '{2}', 'Imperativo categórico', 'Ley moral universal e incondicionada'),
('filosofia', 'bachillerato', '{2}', 'Alienación', 'Pérdida de la esencia humana en el trabajo'),
('filosofia', 'bachillerato', '{2}', 'Voluntad de poder', 'Fuerza vital creadora en Nietzsche'),
('filosofia', 'bachillerato', '{2}', 'Perspectivismo', 'Cada sujeto ve la realidad desde su perspectiva'),
('filosofia', 'bachillerato', '{2}', 'Anamnesis', 'Conocer es recordar lo contemplado por el alma');

-- ////////////////////////////////////////////////////////////////////////////
-- 5. ORDENA_FRASES
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('lengua', 'bachillerato', '{1}', 'El Renacimiento supuso la recuperación de los modelos estéticos grecolatinos y del ideal humanista'),
('lengua', 'bachillerato', '{1}', 'Garcilaso de la Vega introdujo el soneto petrarquista en la poesía castellana del siglo dieciséis'),
('lengua', 'bachillerato', '{1}', 'La novela picaresca narra en primera persona las aventuras de un personaje de baja condición social'),
('lengua', 'bachillerato', '{1}', 'El culteranismo busca la belleza formal mediante cultismos hipérbatos y complejas imágenes sensoriales'),
('lengua', 'bachillerato', '{1}', 'Quevedo es el máximo representante del conceptismo un estilo basado en la agudeza del pensamiento'),
('lengua', 'bachillerato', '{1}', 'El Quijote de Cervantes está considerado como la primera novela moderna de la literatura universal'),
('lengua', 'bachillerato', '{1}', 'La metáfora establece una relación de semejanza entre dos términos sin utilizar un nexo comparativo explícito'),
('lengua', 'bachillerato', '{1}', 'Las oraciones subordinadas sustantivas pueden desempeñar las funciones propias del sintagma nominal en la oración'),
('lengua', 'bachillerato', '{1}', 'El texto argumentativo presenta una tesis que se defiende mediante argumentos y una conclusión final razonada'),
('lengua', 'bachillerato', '{1}', 'Fray Luis de León cultivó una poesía de inspiración clásica centrada en la vida retirada y la armonía'),
('lengua', 'bachillerato', '{1}', 'San Juan de la Cruz escribió poesía mística que expresa la unión del alma con Dios mediante símbolos'),
('lengua', 'bachillerato', '{1}', 'Lope de Vega renovó el teatro español creando la comedia nueva con tres actos y mezcla de estilos'),
('lengua', 'bachillerato', '{1}', 'El complemento directo recibe directamente la acción del verbo y puede sustituirse por pronombres átonos'),
('lengua', 'bachillerato', '{1}', 'La descripción literaria utiliza adjetivos epítetos comparaciones y metáforas para crear imágenes sensoriales vívidas'),
('lengua', 'bachillerato', '{1}', 'El sujeto de una oración concuerda obligatoriamente con el verbo en número y persona gramatical');

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('lengua', 'bachillerato', '{2}', 'La Generación del 98 reflexionó sobre el problema de España tras la pérdida de las últimas colonias'),
('lengua', 'bachillerato', '{2}', 'Antonio Machado evolucionó desde un modernismo intimista hacia una poesía comprometida con el paisaje castellano'),
('lengua', 'bachillerato', '{2}', 'Valle-Inclán creó el esperpento como forma de teatro que deforma la realidad mediante lo grotesco'),
('lengua', 'bachillerato', '{2}', 'La Generación del 27 fusionó la tradición literaria española con las innovaciones de las vanguardias europeas'),
('lengua', 'bachillerato', '{2}', 'Federico García Lorca exploró en su teatro los conflictos entre la libertad individual y las normas sociales'),
('lengua', 'bachillerato', '{2}', 'La narrativa de posguerra se inicia con obras tremendistas que reflejan la dureza de la España franquista'),
('lengua', 'bachillerato', '{2}', 'Camilo José Cela inauguró el tremendismo con La familia de Pascual Duarte publicada en mil novecientos cuarenta y dos'),
('lengua', 'bachillerato', '{2}', 'El comentario de texto analiza la estructura el tema los recursos lingüísticos y la intención comunicativa del autor'),
('lengua', 'bachillerato', '{2}', 'La coherencia textual exige que todas las ideas del texto se relacionen con un tema central y común'),
('lengua', 'bachillerato', '{2}', 'El realismo literario del siglo diecinueve pretendía reflejar fielmente la sociedad mediante técnicas narrativas objetivas'),
('lengua', 'bachillerato', '{2}', 'Benito Pérez Galdós retrató la sociedad madrileña del siglo diecinueve en sus Novelas Contemporáneas con detalle'),
('lengua', 'bachillerato', '{2}', 'La novela experimental de los años sesenta introdujo el monólogo interior la ruptura temporal y el perspectivismo'),
('lengua', 'bachillerato', '{2}', 'Unamuno planteó en sus nivolas conflictos existenciales sobre la identidad la fe y la inmortalidad del alma'),
('lengua', 'bachillerato', '{2}', 'Los conectores textuales son elementos lingüísticos que establecen relaciones lógicas entre las partes del discurso'),
('lengua', 'bachillerato', '{2}', 'Juan Ramón Jiménez evolucionó desde el modernismo sensorial hacia una poesía pura desnuda y esencial'),
('lengua', 'bachillerato', '{2}', 'El texto periodístico de opinión presenta la valoración subjetiva del autor sobre un tema de actualidad relevante');

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('filosofia', 'bachillerato', '{1}', 'La filosofía surge en Grecia como intento racional de explicar la realidad frente al pensamiento mítico'),
('filosofia', 'bachillerato', '{1}', 'Sócrates empleaba la mayéutica para que sus interlocutores descubrieran la verdad por sí mismos mediante preguntas'),
('filosofia', 'bachillerato', '{1}', 'Platón distinguió entre el mundo sensible de las apariencias y el mundo inteligible de las Ideas verdaderas'),
('filosofia', 'bachillerato', '{1}', 'Aristóteles consideraba que la felicidad consiste en la actividad del alma conforme a la virtud racional'),
('filosofia', 'bachillerato', '{1}', 'El racionalismo sostiene que la razón es la fuente principal del conocimiento frente a la experiencia sensible'),
('filosofia', 'bachillerato', '{1}', 'El empirismo afirma que todo conocimiento humano procede en última instancia de la experiencia de los sentidos'),
('filosofia', 'bachillerato', '{1}', 'Kant realizó una síntesis entre racionalismo y empirismo al mostrar los límites del conocimiento humano'),
('filosofia', 'bachillerato', '{1}', 'El imperativo categórico ordena actuar según una máxima que puedas querer como ley universal para todos'),
('filosofia', 'bachillerato', '{1}', 'La lógica estudia las formas del razonamiento válido distinguiendo entre argumentos deductivos e inductivos'),
('filosofia', 'bachillerato', '{1}', 'Una falacia es un argumento que parece válido pero contiene un error de razonamiento que lo invalida'),
('filosofia', 'bachillerato', '{1}', 'El utilitarismo de Mill considera que la acción correcta es la que produce mayor felicidad al mayor número'),
('filosofia', 'bachillerato', '{1}', 'La metafísica estudia los principios últimos de la realidad como el ser la sustancia y la causalidad'),
('filosofia', 'bachillerato', '{1}', 'El escepticismo filosófico pone en duda la posibilidad de alcanzar un conocimiento seguro y definitivo sobre la realidad'),
('filosofia', 'bachillerato', '{1}', 'La ética de Aristóteles propone la búsqueda del término medio entre el exceso y el defecto como virtud'),
('filosofia', 'bachillerato', '{1}', 'Los presocráticos buscaron el arjé o principio originario de todas las cosas en la naturaleza material');

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('filosofia', 'bachillerato', '{2}', 'Platón expuso en la alegoría de la caverna el ascenso del alma desde la ignorancia hasta el conocimiento'),
('filosofia', 'bachillerato', '{2}', 'Aristóteles critica la teoría platónica de las Ideas porque separa la esencia de las cosas particulares'),
('filosofia', 'bachillerato', '{2}', 'Tomás de Aquino formuló cinco vías para demostrar la existencia de Dios a partir del mundo sensible'),
('filosofia', 'bachillerato', '{2}', 'Descartes estableció el cogito como primera verdad indubitable mediante la aplicación de la duda metódica'),
('filosofia', 'bachillerato', '{2}', 'Hume negó que la causalidad fuera una conexión necesaria reduciéndola a una costumbre mental del sujeto'),
('filosofia', 'bachillerato', '{2}', 'Kant distinguió entre fenómeno como objeto de experiencia posible y noúmeno como cosa en sí incognoscible'),
('filosofia', 'bachillerato', '{2}', 'Marx afirmó que la historia de toda sociedad existente es la historia de las luchas de clases'),
('filosofia', 'bachillerato', '{2}', 'Nietzsche proclamó la muerte de Dios como el fin de los valores absolutos de la tradición occidental'),
('filosofia', 'bachillerato', '{2}', 'Ortega y Gasset sostuvo que la vida humana es la realidad radical desde la que se comprende todo'),
('filosofia', 'bachillerato', '{2}', 'La República de Platón propone un estado ideal gobernado por filósofos que conocen la Idea del Bien'),
('filosofia', 'bachillerato', '{2}', 'El Motor Inmóvil aristotélico es acto puro sin mezcla de potencia y causa final del universo'),
('filosofia', 'bachillerato', '{2}', 'Descartes distinguió tres tipos de sustancia la pensante la extensa y la infinita que es Dios'),
('filosofia', 'bachillerato', '{2}', 'Marx denunció la alienación del trabajador que en el sistema capitalista pierde el producto de su trabajo'),
('filosofia', 'bachillerato', '{2}', 'Nietzsche propuso la figura del superhombre como ser humano capaz de crear sus propios valores vitales'),
('filosofia', 'bachillerato', '{2}', 'Ortega defendió el perspectivismo afirmando que cada individuo accede a la verdad desde su propia circunstancia');

-- ////////////////////////////////////////////////////////////////////////////
-- 6. ORDENA_HISTORIAS
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('lengua', 'bachillerato', '{1}', '["En el siglo XV la lírica castellana se desarrolló bajo la influencia trovadoresca y el cancionero cortesano.", "Garcilaso de la Vega introdujo los metros italianos en la poesía española a principios del XVI.", "La segunda mitad del XVI vio florecer la poesía religiosa con Fray Luis de León y San Juan de la Cruz.", "El Barroco del XVII transformó la estética renacentista con el culteranismo y el conceptismo.", "Góngora y Quevedo representaron los dos polos estilísticos opuestos de la poesía barroca."]'),
('lengua', 'bachillerato', '{1}', '["La Celestina de Fernando de Rojas apareció a finales del siglo XV como obra dialogada.", "El Lazarillo de Tormes inauguró en 1554 el género de la novela picaresca anónima.", "Cervantes publicó la primera parte del Quijote en 1605 renovando por completo la narrativa.", "La segunda parte del Quijote apareció en 1615 con mayor profundidad psicológica de los personajes.", "Las Novelas Ejemplares de Cervantes mostraron la variedad temática y formal de la narrativa barroca."]'),
('lengua', 'bachillerato', '{1}', '["Lope de Vega formuló el Arte nuevo de hacer comedias estableciendo las bases del teatro nacional.", "El teatro de Lope mezclaba lo trágico y lo cómico rompiendo las unidades clásicas de tiempo y lugar.", "Tirso de Molina creó el personaje de Don Juan en El burlador de Sevilla hacia 1630.", "Calderón de la Barca perfeccionó el auto sacramental y el drama filosófico barroco.", "La vida es sueño de Calderón planteó el conflicto entre destino y libre albedrío."]'),
('lengua', 'bachillerato', '{1}', '["El análisis sintáctico comienza identificando el sujeto y el predicado de la oración.", "A continuación se determina el tipo de predicado: nominal con verbo copulativo o verbal con verbo predicativo.", "Se identifican los complementos del verbo: directo indirecto circunstancial regido y agente.", "Después se analizan las oraciones subordinadas clasificándolas en sustantivas adjetivas y adverbiales.", "Finalmente se revisa la coherencia del análisis comprobando concordancias y funciones asignadas."]'),
('lengua', 'bachillerato', '{1}', '["La lírica renacentista adoptó el endecasílabo y el soneto de la tradición italiana.", "Los temas principales fueron el amor cortés el carpe diem y la naturaleza idealizada.", "Garcilaso perfeccionó la égloga como forma poética con pastores que dialogan sobre el amor.", "En la segunda mitad del XVI la poesía se orientó hacia temas morales y religiosos.", "San Juan de la Cruz llevó la poesía mística a su máxima expresión con el Cántico espiritual."]'),
('lengua', 'bachillerato', '{1}', '["El texto expositivo presenta información de forma clara y ordenada sobre un tema concreto.", "Se organiza mediante una estructura de introducción desarrollo y conclusión.", "Utiliza conectores lógicos para guiar al lector por las distintas partes del contenido.", "El lenguaje expositivo debe ser objetivo preciso y denotativo evitando ambigüedades.", "La finalidad última del texto expositivo es hacer comprensible un tema al destinatario."]');

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('lengua', 'bachillerato', '{2}', '["El Realismo literario español se desarrolló en la segunda mitad del siglo XIX influido por el positivismo.", "Galdós retrató la sociedad madrileña en Fortunata y Jacinta con técnica realista y amplitud temática.", "Clarín publicó La Regenta en 1885 como culmen del naturalismo español ambientado en Vetusta.", "A finales del XIX el Modernismo introdujo la renovación estética con Rubén Darío como referente.", "La Generación del 98 reaccionó ante la crisis nacional con una literatura de reflexión existencial."]'),
('lengua', 'bachillerato', '{2}', '["La Generación del 27 surgió en torno al homenaje a Góngora en el Ateneo de Sevilla en 1927.", "Lorca Alberti y Cernuda fusionaron tradición popular y vanguardia en sus primeras obras.", "La Guerra Civil dispersó al grupo: exilio muerte y silencio marcaron sus destinos tras 1939.", "Los poetas del exilio como Alberti y Cernuda continuaron su obra lejos de España con tono nostálgico.", "La influencia del 27 pervivió en generaciones posteriores como referencia poética ineludible."]'),
('lengua', 'bachillerato', '{2}', '["Tras la Guerra Civil la narrativa española se sumió en un período de censura y aislamiento cultural.", "Cela publicó La familia de Pascual Duarte en 1942 inaugurando la corriente tremendista.", "En los años 50 la novela social denunció las desigualdades con técnicas objetivistas y testimoniales.", "Tiempo de silencio de Martín Santos en 1962 abrió la vía de la novela experimental española.", "Los años 70 y 80 trajeron una narrativa diversa que combinaba tradición e innovación formal."]'),
('lengua', 'bachillerato', '{2}', '["El comentario de texto comienza con la lectura comprensiva y la identificación del tema central.", "A continuación se elabora un resumen breve objetivo y con palabras propias del contenido.", "Se analiza la estructura externa e interna del texto identificando sus partes y progresión temática.", "Después se estudian los recursos lingüísticos y estilísticos que el autor emplea para su propósito.", "Finalmente se redacta una valoración crítica que contextualiza el texto y aporta una opinión argumentada."]'),
('lengua', 'bachillerato', '{2}', '["Unamuno cultivó la nivola como forma narrativa experimental que reflexiona sobre la existencia humana.", "Baroja desarrolló una novela de acción y aventura con estilo directo y visión pesimista de la realidad.", "Azorín creó una prosa impresionista de frases cortas y descripciones minuciosas del paisaje castellano.", "Machado evolucionó desde un modernismo intimista hacia una poesía de compromiso social y filosófico.", "Valle-Inclán transformó el teatro con el esperpento que deformaba la realidad de modo grotesco y crítico."]'),
('lengua', 'bachillerato', '{2}', '["El Modernismo hispanoamericano de Rubén Darío influyó decisivamente en la poesía española de principios del XX.", "Juan Ramón Jiménez evolucionó del modernismo hacia la poesía pura desnuda de todo ornamento.", "Las vanguardias europeas llegaron a España de la mano de Ramón Gómez de la Serna y su greguería.", "El creacionismo y el ultraísmo fueron los primeros movimientos vanguardistas propiamente españoles.", "El surrealismo impactó profundamente en poetas del 27 como Lorca Aleixandre y Cernuda."]');

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('filosofia', 'bachillerato', '{1}', '["Los presocráticos buscaron el principio originario de la realidad en elementos naturales como el agua o el fuego.", "Sócrates desplazó la reflexión filosófica desde la naturaleza hacia las cuestiones morales y humanas.", "Platón sistematizó el pensamiento socrático y construyó una metafísica dualista con la teoría de las Ideas.", "Aristóteles criticó el dualismo platónico y propuso una filosofía basada en la observación empírica.", "Las escuelas helenísticas como el estoicismo y el epicureísmo se centraron en la búsqueda de la felicidad individual."]'),
('filosofia', 'bachillerato', '{1}', '["El racionalismo de Descartes estableció la razón como criterio supremo de verdad en el siglo XVII.", "El empirismo británico de Locke y Hume respondió que todo conocimiento procede de la experiencia sensible.", "Kant intentó superar la oposición entre racionalismo y empirismo en la Crítica de la razón pura.", "El idealismo alemán de Hegel radicalizó la propuesta kantiana convirtiendo la razón en motor de la historia.", "El positivismo de Comte rechazó la metafísica y limitó el conocimiento válido al método científico."]'),
('filosofia', 'bachillerato', '{1}', '["La ética de Sócrates identificaba la virtud con el conocimiento: quien conoce el bien actúa bien.", "Platón propuso que la justicia consiste en que cada parte del alma cumpla su función propia.", "Aristóteles desarrolló una ética de la virtud como término medio entre el exceso y el defecto.", "Kant formuló una ética del deber basada en el imperativo categórico como ley moral universal.", "Mill propuso el utilitarismo que juzga la moralidad de las acciones por sus consecuencias en la felicidad general."]'),
('filosofia', 'bachillerato', '{1}', '["Un argumento deductivo parte de premisas generales para llegar a una conclusión particular necesaria.", "Un argumento inductivo parte de casos particulares para formular una conclusión general probable.", "La validez lógica se refiere a la estructura formal del argumento independientemente de la verdad de sus premisas.", "La solidez combina validez formal con verdad material de las premisas para garantizar la verdad de la conclusión.", "Las falacias son argumentos que parecen válidos pero contienen errores lógicos que invalidan su conclusión."]'),
('filosofia', 'bachillerato', '{1}', '["La filosofía medieval se desarrolló dentro del marco de la fe cristiana como su contexto intelectual.", "San Agustín fusionó el platonismo con el cristianismo estableciendo las bases de la filosofía medieval.", "Tomás de Aquino armonizó la filosofía de Aristóteles con la teología cristiana en el siglo XIII.", "Guillermo de Ockham cuestionó la unión de fe y razón anticipando la separación moderna entre ambas.", "El Renacimiento recuperó el pensamiento grecolatino y situó al ser humano como centro de la reflexión."]'),
('filosofia', 'bachillerato', '{1}', '["La filosofía política de Platón propuso un estado ideal gobernado por filósofos que conocen el Bien.", "Aristóteles concibió al ser humano como animal político cuya naturaleza se realiza en la polis.", "Hobbes justificó el Estado absoluto como solución al estado de naturaleza de guerra de todos contra todos.", "Locke defendió los derechos naturales a la vida la libertad y la propiedad como límites del poder.", "Rousseau planteó el contrato social como acuerdo libre entre ciudadanos para crear la voluntad general."]');

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('filosofia', 'bachillerato', '{2}', '["Platón heredó de Sócrates la búsqueda de definiciones universales y el método dialéctico.", "En la teoría de las Ideas Platón distinguió entre el mundo sensible cambiante y el inteligible inmutable.", "La alegoría de la caverna ilustra el ascenso del alma desde las sombras hasta la contemplación del Bien.", "La República propone un estado ideal donde los filósofos gobiernan guiados por el conocimiento del Bien.", "La influencia de Platón se extendió durante siglos a través del neoplatonismo y la filosofía cristiana."]'),
('filosofia', 'bachillerato', '{2}', '["Aristóteles estudió en la Academia de Platón durante veinte años antes de fundar su propio Liceo.", "Rechazó la separación platónica de las Ideas y situó la esencia en las cosas mismas como forma.", "Su metafísica distingue entre sustancia y accidente acto y potencia materia y forma.", "La ética aristotélica propone la eudaimonía como actividad del alma conforme a la virtud más perfecta.", "La lógica silogística de Aristóteles fue el sistema formal dominante en Occidente durante dos milenios."]'),
('filosofia', 'bachillerato', '{2}', '["Descartes aplicó la duda metódica a todos sus conocimientos previos buscando una verdad indudable.", "Encontró en el cogito ergo sum la primera certeza: si pienso necesariamente existo como ser pensante.", "A partir del cogito dedujo la existencia de Dios como garantía de la verdad de las ideas claras.", "Distinguió dos sustancias finitas: la res cogitans pensante y la res extensa material.", "El racionalismo cartesiano inauguró la filosofía moderna al fundamentar el conocimiento en el sujeto pensante."]'),
('filosofia', 'bachillerato', '{2}', '["Kant despertó del sueño dogmático tras leer a Hume y su crítica de la causalidad como simple hábito.", "En la Crítica de la razón pura estableció que el conocimiento requiere tanto intuiciones como conceptos.", "Distinguió entre fenómeno como aquello que podemos conocer y noúmeno como la cosa en sí incognoscible.", "En la Crítica de la razón práctica formuló el imperativo categórico como ley moral universal y racional.", "La filosofía kantiana limitó el conocimiento teórico para abrir espacio a la moral la libertad y la fe."]'),
('filosofia', 'bachillerato', '{2}', '["Marx heredó la dialéctica de Hegel pero la invirtió dando prioridad a las condiciones materiales de vida.", "Formuló el materialismo histórico según el cual la infraestructura económica determina la superestructura ideológica.", "Analizó el capitalismo como sistema basado en la explotación del trabajo asalariado y la extracción de plusvalía.", "Denunció la alienación del trabajador que pierde su humanidad al convertirse en mercancía del sistema productivo.", "Propuso la revolución proletaria como vía para superar las contradicciones del capitalismo y alcanzar una sociedad sin clases."]'),
('filosofia', 'bachillerato', '{2}', '["Nietzsche diagnosticó el nihilismo europeo como consecuencia de la pérdida de los valores tradicionales.", "Proclamó la muerte de Dios como el acontecimiento que destruye el fundamento de la moral occidental.", "Propuso la transmutación de todos los valores para superar la moral de esclavos basada en el resentimiento.", "Presentó al superhombre como el ser humano capaz de crear nuevos valores desde la afirmación vital.", "El eterno retorno exige vivir cada instante como si fuera a repetirse infinitamente aceptando la vida plenamente."]');

-- ////////////////////////////////////////////////////////////////////////////
-- 7. DETECTIVE_SENTENCES
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('lengua', 'bachillerato', '{1}', 'La poesía renacentista española adoptó las formas métricas italianas como el soneto y la lira'),
('lengua', 'bachillerato', '{1}', 'El Lazarillo de Tormes inauguró el género picaresco con un relato autobiográfico de tono irónico'),
('lengua', 'bachillerato', '{1}', 'Góngora utilizó cultismos y estructuras latinas para elevar el lenguaje poético al máximo artificio'),
('lengua', 'bachillerato', '{1}', 'Las oraciones subordinadas adjetivas funcionan como complemento del nombre y van introducidas por relativos'),
('lengua', 'bachillerato', '{1}', 'El complemento indirecto indica el destinatario de la acción verbal y se sustituye por le o les'),
('lengua', 'bachillerato', '{1}', 'Cervantes creó en Don Quijote un personaje que confunde la ficción caballeresca con la realidad cotidiana'),
('lengua', 'bachillerato', '{1}', 'La metáfora pura sustituye completamente el término real por el término imaginario en el enunciado'),
('lengua', 'bachillerato', '{1}', 'Calderón de la Barca llevó el drama filosófico barroco a su máxima expresión en La vida es sueño'),
('lengua', 'bachillerato', '{1}', 'Un texto argumentativo debe contener una tesis argumentos de apoyo y una conclusión bien fundamentada'),
('lengua', 'bachillerato', '{1}', 'La sinestesia es una figura retórica que asocia sensaciones pertenecientes a distintos sentidos corporales'),
('lengua', 'bachillerato', '{1}', 'Santa Teresa de Jesús combinó la prosa mística con un estilo coloquial y directo en sus escritos'),
('lengua', 'bachillerato', '{1}', 'El endecasílabo es un verso de once sílabas que constituye la base de la métrica renacentista española');

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('lengua', 'bachillerato', '{2}', 'La Generación del 98 se caracterizó por su preocupación existencial y su reflexión sobre la identidad española'),
('lengua', 'bachillerato', '{2}', 'Valle-Inclán definió el esperpento como la deformación grotesca de los héroes clásicos reflejados en espejos cóncavos'),
('lengua', 'bachillerato', '{2}', 'Lorca fusionó lo popular y lo culto en el Romancero gitano creando una poesía de gran fuerza dramática'),
('lengua', 'bachillerato', '{2}', 'La colmena de Cela presenta un mosaico de personajes en el Madrid de la posguerra sin protagonista único'),
('lengua', 'bachillerato', '{2}', 'El comentario de texto requiere identificar el tema resumir el contenido y analizar los recursos lingüísticos'),
('lengua', 'bachillerato', '{2}', 'La cohesión textual se logra mediante mecanismos como la repetición la elipsis los conectores y la referencia'),
('lengua', 'bachillerato', '{2}', 'Galdós empleó el diálogo como herramienta narrativa fundamental para caracterizar a sus personajes realistas'),
('lengua', 'bachillerato', '{2}', 'El modernismo literario buscó la belleza formal la musicalidad y la evasión de la realidad cotidiana'),
('lengua', 'bachillerato', '{2}', 'Machado definió la poesía como palabra esencial en el tiempo aunando intuición y sentimiento filosófico'),
('lengua', 'bachillerato', '{2}', 'La novela social de los años cincuenta utilizó técnicas objetivistas para denunciar las injusticias del franquismo'),
('lengua', 'bachillerato', '{2}', 'Buero Vallejo renovó el teatro de posguerra con dramas realistas que abordaban conflictos éticos y sociales'),
('lengua', 'bachillerato', '{2}', 'Clarín construyó en La Regenta un retrato minucioso de la hipocresía social de la España provinciana');

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('filosofia', 'bachillerato', '{1}', 'La filosofía nació en Grecia como una forma racional de explicar la naturaleza y el ser humano'),
('filosofia', 'bachillerato', '{1}', 'Sócrates fue condenado a muerte por impiedad y por corromper a la juventud ateniense con sus enseñanzas'),
('filosofia', 'bachillerato', '{1}', 'El silogismo aristotélico consta de dos premisas y una conclusión que se deduce necesariamente de ellas'),
('filosofia', 'bachillerato', '{1}', 'La falacia ad hominem consiste en atacar a la persona que argumenta en lugar de refutar su argumento'),
('filosofia', 'bachillerato', '{1}', 'El estoicismo propone aceptar con serenidad aquello que no podemos cambiar y actuar con virtud racional'),
('filosofia', 'bachillerato', '{1}', 'Descartes buscó una verdad absolutamente cierta y la encontró en el hecho indudable de que pensamos'),
('filosofia', 'bachillerato', '{1}', 'El imperativo categórico kantiano exige tratar a las personas siempre como fines y nunca solo como medios'),
('filosofia', 'bachillerato', '{1}', 'La epistemología investiga las condiciones de posibilidad del conocimiento verdadero y sus límites'),
('filosofia', 'bachillerato', '{1}', 'El relativismo moral sostiene que los juicios éticos dependen del contexto cultural y no son universales'),
('filosofia', 'bachillerato', '{1}', 'Los presocráticos propusieron distintos elementos naturales como principio fundamental de toda la realidad'),
('filosofia', 'bachillerato', '{1}', 'La ética utilitarista evalúa la moralidad de las acciones por la cantidad de felicidad que producen'),
('filosofia', 'bachillerato', '{1}', 'Platón expuso la alegoría de la caverna para ilustrar el paso de la ignorancia al conocimiento verdadero');

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('filosofia', 'bachillerato', '{2}', 'Platón identificó la Idea del Bien como el principio supremo que ilumina todas las demás Ideas inteligibles'),
('filosofia', 'bachillerato', '{2}', 'Aristóteles definió la sustancia como aquello que existe por sí mismo y es sujeto de todas las predicaciones'),
('filosofia', 'bachillerato', '{2}', 'Tomás de Aquino demostró la existencia de Dios mediante cinco argumentos basados en la experiencia sensible'),
('filosofia', 'bachillerato', '{2}', 'Descartes encontró en el cogito la primera verdad indubitable sobre la que reconstruir todo el conocimiento'),
('filosofia', 'bachillerato', '{2}', 'Hume redujo todo el contenido de la mente a impresiones originarias e ideas como copias débiles de aquellas'),
('filosofia', 'bachillerato', '{2}', 'Kant estableció que el conocimiento requiere la colaboración entre las intuiciones sensibles y los conceptos puros'),
('filosofia', 'bachillerato', '{2}', 'Marx explicó que la infraestructura económica de la sociedad condiciona toda su superestructura ideológica'),
('filosofia', 'bachillerato', '{2}', 'Nietzsche denunció la moral cristiana como expresión del resentimiento de los débiles contra los fuertes'),
('filosofia', 'bachillerato', '{2}', 'Ortega afirmó que yo soy yo y mi circunstancia y si no la salvo a ella no me salvo yo'),
('filosofia', 'bachillerato', '{2}', 'El dualismo ontológico de Platón distingue el mundo sensible de las copias y el inteligible de los modelos'),
('filosofia', 'bachillerato', '{2}', 'La duda metódica cartesiana somete a examen todas las creencias para encontrar un fundamento absolutamente seguro'),
('filosofia', 'bachillerato', '{2}', 'El materialismo histórico de Marx analiza los procesos sociales a partir de las relaciones económicas de producción');

-- ////////////////////////////////////////////////////////////////////////////
-- 8. COMPRENSION_TEXTS
-- ////////////////////////////////////////////////////////////////////////////

-- ---------- LENGUA 1º BACHILLERATO ----------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('lengua', 'bachillerato', '{1}', 'El Renacimiento literario español',
'El Renacimiento literario español se desarrolló durante el siglo XVI y supuso una profunda transformación de las letras castellanas. La influencia del humanismo italiano, con Petrarca como modelo poético fundamental, llevó a los escritores españoles a adoptar nuevas formas métricas como el soneto y la lira, así como nuevos temas: el amor idealizado, la naturaleza como marco de perfección y la reflexión sobre el paso del tiempo. Garcilaso de la Vega fue el poeta que mejor encarnó estos ideales, fusionando la sensibilidad castellana con la elegancia italiana en sus Églogas y Sonetos. En la segunda mitad del siglo, la Contrarreforma orientó parte de la producción literaria hacia temas religiosos y morales. Fray Luis de León cultivó una poesía de inspiración horaciana centrada en la vida retirada y la armonía del cosmos, mientras que San Juan de la Cruz llevó la lírica mística a cotas insuperables con obras como el Cántico espiritual, donde el amor divino se expresa mediante el simbolismo de la unión amorosa.',
'[{"pregunta":"¿Quién fue el modelo poético italiano fundamental para el Renacimiento español?","opciones":["Dante","Petrarca","Boccaccio","Maquiavelo"],"correcta":1},{"pregunta":"¿Qué formas métricas adoptaron los poetas renacentistas españoles?","opciones":["Romance y copla","Alejandrino y cuaderna vía","Soneto y lira","Décima y seguidilla"],"correcta":2},{"pregunta":"¿Qué orientó la producción literaria hacia temas religiosos en la segunda mitad del XVI?","opciones":["La Reforma protestante","La Contrarreforma","El descubrimiento de América","La expulsión de los moriscos"],"correcta":1},{"pregunta":"¿Cómo expresa San Juan de la Cruz el amor divino en su poesía?","opciones":["Mediante alegorías bélicas","Mediante el simbolismo de la unión amorosa","Mediante descripciones paisajísticas","Mediante sátiras sociales"],"correcta":1}]'),

('lengua', 'bachillerato', '{1}', 'El Barroco y sus dos estilos',
'El Barroco literario español, desarrollado durante el siglo XVII, se caracteriza por la tensión entre la belleza formal y el desengaño vital. Frente al optimismo renacentista, los escritores barrocos expresan una visión pesimista de la existencia: la vida es breve, el tiempo destruye todo, las apariencias engañan. Esta cosmovisión se canaliza a través de dos grandes estilos: el culteranismo y el conceptismo. El culteranismo, cuyo máximo representante fue Luis de Góngora, busca la belleza sensorial del lenguaje mediante latinismos, hipérbatos audaces, metáforas complejas y una sintaxis que imita las construcciones latinas. Sus Soledades y la Fábula de Polifemo y Galatea son obras maestras de dificultad formal. El conceptismo, encabezado por Francisco de Quevedo, prioriza la agudeza del pensamiento sobre la forma: juegos de palabras, dobles sentidos, antítesis y paradojas revelan verdades ocultas tras las apariencias. En El Buscón, Quevedo combina la sátira social con un virtuosismo verbal inigualable. Ambos estilos, aunque aparentemente opuestos, comparten el gusto por la complejidad y el rechazo de la sencillez renacentista.',
'[{"pregunta":"¿Cuál es la visión predominante de la existencia en el Barroco?","opciones":["Optimista y vitalista","Pesimista y desengañada","Indiferente y neutral","Mística y contemplativa"],"correcta":1},{"pregunta":"¿Qué recurso es característico del culteranismo?","opciones":["Juegos de palabras y dobles sentidos","Latinismos e hipérbatos audaces","Sátira política directa","Lenguaje coloquial y popular"],"correcta":1},{"pregunta":"¿Qué obra de Quevedo combina sátira social y virtuosismo verbal?","opciones":["Las Soledades","La vida es sueño","El Buscón","El Criticón"],"correcta":2},{"pregunta":"¿Qué tienen en común culteranismo y conceptismo?","opciones":["El gusto por la sencillez","El optimismo vital","El gusto por la complejidad","La imitación de Petrarca"],"correcta":2}]'),

('lengua', 'bachillerato', '{1}', 'La sintaxis de la oración compuesta',
'La oración compuesta es aquella que contiene más de un predicado, es decir, más de un verbo en forma personal. Se clasifica en tres grandes tipos según la relación entre sus proposiciones: coordinadas, subordinadas y yuxtapuestas. Las oraciones coordinadas unen proposiciones del mismo nivel sintáctico mediante conjunciones: copulativas (y, ni), disyuntivas (o), adversativas (pero, sino), explicativas (es decir) y distributivas (ya... ya). Las oraciones subordinadas establecen una relación de dependencia: una proposición funciona como parte de la otra. Se subdividen en sustantivas (funcionan como un sustantivo: sujeto, CD, etc.), adjetivas (funcionan como un adjetivo: complemento del nombre) y adverbiales (funcionan como un adverbio: tiempo, causa, finalidad, etc.). Las oraciones yuxtapuestas se unen sin nexo explícito, separadas por signos de puntuación, y la relación semántica entre ellas debe deducirse del contexto. El dominio de la sintaxis compleja es imprescindible para comprender y producir textos académicos de calidad.',
'[{"pregunta":"¿Qué define a una oración compuesta?","opciones":["Tiene más de un sujeto","Tiene más de un predicado","Tiene complemento directo","Tiene más de diez palabras"],"correcta":1},{"pregunta":"¿Qué tipo de coordinada introduce la conjunción pero?","opciones":["Copulativa","Disyuntiva","Adversativa","Explicativa"],"correcta":2},{"pregunta":"¿Cómo funcionan las oraciones subordinadas sustantivas?","opciones":["Como un adverbio","Como un adjetivo","Como un sustantivo","Como una interjección"],"correcta":2},{"pregunta":"¿Cómo se unen las oraciones yuxtapuestas?","opciones":["Con conjunciones coordinantes","Con pronombres relativos","Sin nexo explícito, con signos de puntuación","Con preposiciones subordinantes"],"correcta":2}]'),

('lengua', 'bachillerato', '{1}', 'Cervantes y la novela moderna',
'Miguel de Cervantes publicó la primera parte de El ingenioso hidalgo don Quijote de la Mancha en 1605, y la segunda en 1615. La obra narra las aventuras de Alonso Quijano, un hidalgo manchego que enloquece leyendo novelas de caballerías y decide hacerse caballero andante bajo el nombre de Don Quijote. Acompañado por su escudero Sancho Panza, recorre los caminos de España enfrentándose a una realidad que él transforma según sus fantasías caballerescas. La genialidad de Cervantes reside en haber creado una novela que trasciende la simple parodia: Don Quijote encarna el idealismo frente a la cruda realidad, el poder de la imaginación frente a las limitaciones del mundo. Además, Cervantes introduce innovaciones narrativas revolucionarias: la multiplicidad de narradores, la metaficción, el diálogo como motor del relato y la evolución psicológica de los personajes. Sancho se quijotiza progresivamente mientras Don Quijote se sanchifica, en un intercambio que humaniza a ambos. Por todo ello, el Quijote se considera la primera novela moderna de la literatura universal.',
'[{"pregunta":"¿En qué año se publicó la primera parte del Quijote?","opciones":["1554","1599","1605","1615"],"correcta":2},{"pregunta":"¿Qué enloquece a Alonso Quijano?","opciones":["Las novelas picarescas","Las novelas de caballerías","Los libros de filosofía","Las crónicas de Indias"],"correcta":1},{"pregunta":"¿Qué innovación narrativa NO se menciona en el texto?","opciones":["Multiplicidad de narradores","Metaficción","Uso del verso libre","Evolución psicológica de los personajes"],"correcta":2},{"pregunta":"¿Qué significa que Sancho se quijotiza?","opciones":["Se vuelve loco","Adopta progresivamente rasgos idealistas de Don Quijote","Abandona a Don Quijote","Se convierte en caballero andante"],"correcta":1}]');

-- ---------- LENGUA 2º BACHILLERATO ----------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('lengua', 'bachillerato', '{2}', 'La Generación del 98',
'La Generación del 98 agrupa a un conjunto de escritores españoles que vivieron como experiencia decisiva la pérdida de las últimas colonias ultramarinas en 1898: Cuba, Puerto Rico y Filipinas. Este desastre nacional provocó una profunda crisis de identidad que se tradujo en una literatura de reflexión sobre España, su historia, su paisaje y su esencia. Miguel de Unamuno exploró los conflictos existenciales del ser humano en novelas como Niebla y San Manuel Bueno, mártir, cuestionando la racionalidad y afirmando la importancia de la fe y el sentimiento trágico de la vida. Antonio Machado evolucionó desde un modernismo intimista en Soledades hacia una poesía comprometida con el paisaje y los problemas de Castilla en Campos de Castilla. Pío Baroja cultivó una novela de acción con estilo directo, pesimismo filosófico y personajes inadaptados, como se aprecia en El árbol de la ciencia. Azorín creó una prosa impresionista de frases breves que captaban la esencia del paisaje castellano y del tiempo detenido. Los noventayochistas comparten el dolor por España, la sobriedad estilística y la influencia de filósofos como Schopenhauer, Kierkegaard y Nietzsche.',
'[{"pregunta":"¿Qué acontecimiento histórico marcó a la Generación del 98?","opciones":["La Guerra Civil","La pérdida de las colonias en 1898","La Primera Guerra Mundial","La proclamación de la República"],"correcta":1},{"pregunta":"¿Qué exploró Unamuno en sus novelas?","opciones":["La vida rural andaluza","Los conflictos existenciales del ser humano","Las aventuras picarescas","La técnica narrativa experimental"],"correcta":1},{"pregunta":"¿Hacia qué evolucionó la poesía de Machado?","opciones":["Hacia el surrealismo","Hacia la poesía pura","Hacia una poesía comprometida con Castilla","Hacia el ultraísmo"],"correcta":2},{"pregunta":"¿Qué filósofos influyeron en los noventayochistas?","opciones":["Platón, Aristóteles y Tomás","Descartes, Locke y Hume","Marx, Engels y Lenin","Schopenhauer, Kierkegaard y Nietzsche"],"correcta":3}]'),

('lengua', 'bachillerato', '{2}', 'La Generación del 27',
'La Generación del 27 constituye uno de los momentos más brillantes de la literatura española. Este grupo de poetas se formó en la Residencia de Estudiantes de Madrid y se dio a conocer públicamente con el homenaje a Góngora celebrado en el Ateneo de Sevilla en 1927. Su rasgo definitorio es la síntesis entre tradición y vanguardia: admiran tanto el Romancero y la poesía popular como las innovaciones del surrealismo, el creacionismo y el ultraísmo. Federico García Lorca fusionó lo popular andaluz con imágenes visionarias de raíz surrealista en el Romancero gitano y Poeta en Nueva York. Rafael Alberti transitó del neopopularismo de Marinero en tierra al surrealismo de Sobre los ángeles. Luis Cernuda construyó una obra unitaria en La realidad y el deseo, articulada en torno al conflicto entre el anhelo y el mundo hostil. Pedro Salinas cultivó una poesía amorosa intelectualizada, y Jorge Guillén desarrolló una poesía pura de afirmación vital en Cántico. La Guerra Civil truncó la convivencia del grupo: Lorca fue asesinado, varios marcharon al exilio y otros permanecieron en una España en silencio.',
'[{"pregunta":"¿Dónde se formaron los poetas del 27?","opciones":["En la Universidad de Salamanca","En la Residencia de Estudiantes de Madrid","En el Ateneo de Barcelona","En la Universidad de Sevilla"],"correcta":1},{"pregunta":"¿Cuál es el rasgo definitorio de la Generación del 27?","opciones":["El rechazo total de la tradición","La imitación exclusiva de Góngora","La síntesis entre tradición y vanguardia","El compromiso político como único tema"],"correcta":2},{"pregunta":"¿Qué obra de Cernuda articula el conflicto entre deseo y realidad?","opciones":["Marinero en tierra","Poeta en Nueva York","Cántico","La realidad y el deseo"],"correcta":3},{"pregunta":"¿Qué acontecimiento truncó la convivencia del grupo?","opciones":["La dictadura de Primo de Rivera","La pérdida de las colonias","La Guerra Civil","La Segunda Guerra Mundial"],"correcta":2}]'),

('lengua', 'bachillerato', '{2}', 'La narrativa de posguerra española',
'La narrativa española de posguerra atravesó varias etapas claramente diferenciadas. En los años cuarenta, el tremendismo inaugurado por Camilo José Cela con La familia de Pascual Duarte presentó una realidad violenta y brutal, mientras que Carmen Laforet ofreció en Nada la visión desolada de la Barcelona de posguerra a través de los ojos de una joven universitaria. En los años cincuenta, la novela social se convirtió en instrumento de denuncia de las injusticias del franquismo: El Jarama de Sánchez Ferlosio empleó la técnica objetivista, registrando diálogos y acciones sin intervención del narrador. La gran renovación llegó en 1962 con Tiempo de silencio de Luis Martín Santos, que introdujo el monólogo interior, la parodia del lenguaje científico y una estructura fragmentaria que rompía con el realismo convencional. A partir de los años setenta, la narrativa se diversificó: Miguel Delibes profundizó en su humanismo rural, Eduardo Mendoza recuperó la novela de aventuras con La verdad sobre el caso Savolta, y una nueva generación exploró la metaficción y la mezcla de géneros.',
'[{"pregunta":"¿Qué corriente inauguró Cela con La familia de Pascual Duarte?","opciones":["El realismo social","El tremendismo","La novela experimental","El novecentismo"],"correcta":1},{"pregunta":"¿Qué técnica empleó Sánchez Ferlosio en El Jarama?","opciones":["El monólogo interior","La técnica objetivista","La narración epistolar","El flujo de conciencia"],"correcta":1},{"pregunta":"¿Qué obra marca la renovación experimental de 1962?","opciones":["La colmena","El camino","Tiempo de silencio","Nada"],"correcta":2},{"pregunta":"¿Qué autor recuperó la novela de aventuras en los años setenta?","opciones":["Cela","Delibes","Eduardo Mendoza","Martín Santos"],"correcta":2}]'),

('lengua', 'bachillerato', '{2}', 'El comentario de texto: método y estructura',
'El comentario de texto es el ejercicio fundamental de la asignatura de Lengua Castellana y Literatura en segundo de Bachillerato y en la EvAU. Consiste en el análisis sistemático de un texto, generalmente periodístico o literario, siguiendo una estructura organizada. El primer paso es la lectura comprensiva, que permite identificar el tema central del texto: aquello de lo que habla el autor y la perspectiva desde la que lo aborda. A continuación se elabora un resumen breve, objetivo y con palabras propias que recoja las ideas esenciales sin valoraciones personales. El análisis de la estructura implica identificar las partes del texto y la relación entre ellas: estructura analizante (de lo general a lo particular), sintetizante (de lo particular a lo general), encuadrada o paralela. El estudio lingüístico examina los recursos del nivel léxico-semántico, morfosintáctico y textual que el autor emplea para lograr su propósito comunicativo. Finalmente, la valoración crítica contextualiza el texto, relaciona sus ideas con otros conocimientos y aporta una opinión argumentada y personal. La clave del éxito reside en la práctica constante y en la capacidad de argumentar con rigor y coherencia.',
'[{"pregunta":"¿Cuál es el primer paso del comentario de texto?","opciones":["La valoración crítica","El análisis lingüístico","La lectura comprensiva","El resumen del contenido"],"correcta":2},{"pregunta":"¿Cómo debe ser el resumen del texto?","opciones":["Extenso y detallado con citas","Breve, objetivo y con palabras propias","Subjetivo y valorativo","Idéntico al texto original"],"correcta":1},{"pregunta":"¿Qué tipo de estructura va de lo general a lo particular?","opciones":["Sintetizante","Encuadrada","Paralela","Analizante"],"correcta":3},{"pregunta":"¿En qué consiste la valoración crítica?","opciones":["En repetir las ideas del autor","En contextualizar y opinar con argumentos","En identificar figuras retóricas","En clasificar oraciones subordinadas"],"correcta":1}]');

-- ---------- FILOSOFÍA 1º BACHILLERATO ----------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('filosofia', 'bachillerato', '{1}', 'El nacimiento de la filosofía en Grecia',
'La filosofía occidental nació en las colonias griegas de Asia Menor durante el siglo VI a.C. como un intento de explicar la naturaleza (physis) mediante la razón (logos), abandonando las explicaciones míticas y religiosas tradicionales. Los primeros filósofos, llamados presocráticos, se preguntaron por el arjé o principio originario de todas las cosas. Tales de Mileto propuso el agua como principio fundamental; Anaximandro, lo indefinido (ápeiron); Heráclito de Éfeso defendió que todo fluye y que el fuego simboliza el cambio perpetuo; Parménides de Elea, por el contrario, afirmó que el ser es inmóvil, eterno e inmutable, y que el cambio es una ilusión de los sentidos. Demócrito planteó una explicación materialista según la cual toda la realidad está compuesta por átomos indivisibles que se mueven en el vacío. Este paso del mito al logos constituye uno de los acontecimientos intelectuales más importantes de la historia humana, pues estableció los fundamentos del pensamiento racional, la ciencia y la filosofía que llegarían hasta nuestros días.',
'[{"pregunta":"¿Dónde nació la filosofía occidental?","opciones":["En Atenas","En Roma","En las colonias griegas de Asia Menor","En Egipto"],"correcta":2},{"pregunta":"¿Qué propuso Tales de Mileto como principio originario?","opciones":["El fuego","El aire","La tierra","El agua"],"correcta":3},{"pregunta":"¿Qué filósofo afirmó que el ser es inmóvil e inmutable?","opciones":["Heráclito","Parménides","Demócrito","Tales"],"correcta":1},{"pregunta":"¿Cómo explicó Demócrito la realidad?","opciones":["Como compuesta por Ideas eternas","Como una ilusión de los sentidos","Como compuesta por átomos en el vacío","Como emanación de un principio divino"],"correcta":2}]'),

('filosofia', 'bachillerato', '{1}', 'La ética kantiana: el deber y la autonomía',
'Immanuel Kant desarrolló en la Fundamentación de la metafísica de las costumbres y en la Crítica de la razón práctica una ética revolucionaria que se opone tanto al hedonismo como al utilitarismo. Para Kant, una acción es moralmente buena no por sus consecuencias ni por el placer que produce, sino únicamente cuando se realiza por deber, es decir, por respeto a la ley moral que la razón se da a sí misma. Este principio se expresa en el imperativo categórico, cuya formulación principal establece: obra solo según aquella máxima por la cual puedas querer al mismo tiempo que se convierta en ley universal. Una segunda formulación añade: trata a la humanidad, tanto en tu persona como en la de cualquier otro, siempre como fin y nunca solamente como medio. La ética kantiana es formal (no prescribe contenidos concretos sino la forma del deber), autónoma (el sujeto racional se da la ley a sí mismo) y universal (vale para todo ser racional). Su influencia ha sido enorme en la filosofía moral contemporánea y en la fundamentación de los derechos humanos.',
'[{"pregunta":"¿Cuándo es moralmente buena una acción según Kant?","opciones":["Cuando produce placer","Cuando beneficia a la mayoría","Cuando se realiza por deber","Cuando es aprobada por la sociedad"],"correcta":2},{"pregunta":"¿Qué establece la primera formulación del imperativo categórico?","opciones":["Buscar la máxima felicidad","Obrar según máximas universalizables","Seguir los mandamientos religiosos","Actuar según las costumbres del lugar"],"correcta":1},{"pregunta":"¿Qué significa que la ética kantiana es autónoma?","opciones":["Que depende de la autoridad política","Que el sujeto racional se da la ley a sí mismo","Que cada persona decide sin criterio","Que es independiente de la razón"],"correcta":1},{"pregunta":"¿En qué ha influido especialmente la ética kantiana?","opciones":["En la estética romántica","En la física moderna","En los derechos humanos","En la economía liberal"],"correcta":2}]'),

('filosofia', 'bachillerato', '{1}', 'Racionalismo y empirismo: dos caminos hacia el conocimiento',
'La filosofía moderna se articuló en torno a dos grandes corrientes epistemológicas enfrentadas: el racionalismo y el empirismo. El racionalismo, cuyo fundador fue René Descartes en el siglo XVII, sostiene que la razón es la fuente principal del conocimiento verdadero. Descartes defendió la existencia de ideas innatas que la mente posee independientemente de la experiencia, y propuso la duda metódica como procedimiento para alcanzar verdades absolutamente ciertas. Spinoza y Leibniz continuaron esta tradición racionalista. El empirismo, desarrollado fundamentalmente en las Islas Británicas, afirma que todo conocimiento procede de la experiencia sensible. John Locke comparó la mente al nacer con una tabula rasa o pizarra en blanco sobre la que la experiencia escribe. George Berkeley llevó el empirismo al idealismo afirmando que ser es ser percibido. David Hume radicalizó la posición empirista negando que podamos conocer conexiones necesarias entre los hechos: la causalidad no es más que un hábito mental. Fue Immanuel Kant quien intentó superar esta oposición mostrando que el conocimiento requiere tanto datos de la experiencia como estructuras a priori del entendimiento.',
'[{"pregunta":"¿Quién fundó el racionalismo moderno?","opciones":["Locke","Hume","Descartes","Kant"],"correcta":2},{"pregunta":"¿Qué comparación utilizó Locke para describir la mente al nacer?","opciones":["Un espejo roto","Una tabula rasa","Un libro escrito","Una lámpara encendida"],"correcta":1},{"pregunta":"¿Qué negó Hume sobre la causalidad?","opciones":["Que exista el tiempo","Que sea una conexión necesaria entre hechos","Que los sentidos funcionen","Que existan ideas innatas"],"correcta":1},{"pregunta":"¿Cómo intentó Kant superar la oposición entre racionalismo y empirismo?","opciones":["Rechazando ambas corrientes","Mostrando que el conocimiento requiere experiencia y estructuras a priori","Aceptando solo el empirismo","Volviendo a la filosofía griega"],"correcta":1}]'),

('filosofia', 'bachillerato', '{1}', 'La lógica: razonamiento válido y falacias',
'La lógica es la rama de la filosofía que estudia las formas del razonamiento válido. Un argumento es un conjunto de proposiciones donde unas (las premisas) sirven de apoyo a otra (la conclusión). Un argumento es válido cuando su conclusión se sigue necesariamente de sus premisas, independientemente de que estas sean verdaderas o falsas. La lógica aristotélica, basada en el silogismo, dominó el pensamiento occidental durante más de dos mil años. Un silogismo consta de dos premisas y una conclusión: por ejemplo, todos los humanos son mortales, Sócrates es humano, luego Sócrates es mortal. Frente a los argumentos válidos, las falacias son razonamientos que parecen correctos pero contienen errores lógicos. La falacia ad hominem ataca a la persona en vez de refutar su argumento. La falacia ad populum apela a la opinión de la mayoría como prueba de verdad. El falso dilema presenta solo dos opciones cuando existen más. Distinguir argumentos válidos de falacias es una competencia fundamental para el pensamiento crítico, la participación democrática y la toma de decisiones informadas en la sociedad contemporánea.',
'[{"pregunta":"¿Cuándo es válido un argumento?","opciones":["Cuando sus premisas son verdaderas","Cuando la conclusión se sigue necesariamente de las premisas","Cuando lo acepta la mayoría","Cuando lo afirma un experto"],"correcta":1},{"pregunta":"¿De cuántas premisas consta un silogismo?","opciones":["Una","Dos","Tres","Cuatro"],"correcta":1},{"pregunta":"¿Qué falacia ataca a la persona en vez de al argumento?","opciones":["Ad populum","Falso dilema","Ad hominem","Petición de principio"],"correcta":2},{"pregunta":"¿Por qué es importante distinguir argumentos válidos de falacias?","opciones":["Para aprobar exámenes","Para el pensamiento crítico y la participación democrática","Para ganar debates","Para escribir mejor"],"correcta":1}]');

-- ---------- FILOSOFÍA (HISTORIA) 2º BACHILLERATO ----------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('filosofia', 'bachillerato', '{2}', 'Platón: la teoría de las Ideas y la alegoría de la caverna',
'La filosofía de Platón se articula en torno a la teoría de las Ideas o Formas, que constituye el núcleo de su metafísica, su epistemología y su ética. Platón distingue dos niveles de realidad: el mundo sensible, compuesto por las cosas materiales que percibimos con los sentidos, y el mundo inteligible, formado por las Ideas eternas, inmutables y perfectas que solo el intelecto puede captar. Las cosas del mundo sensible son copias imperfectas de las Ideas: una mesa particular participa de la Idea de Mesa, un acto justo participa de la Idea de Justicia. En la cúspide del mundo inteligible se encuentra la Idea del Bien, principio supremo que ilumina todas las demás Ideas como el sol ilumina las cosas visibles. La alegoría de la caverna, expuesta en el libro VII de La República, ilustra este esquema: los prisioneros encadenados solo ven sombras proyectadas en la pared y las toman por la realidad. El filósofo es aquel que se libera de las cadenas, asciende hacia la luz y contempla las cosas tal como son. Su misión es volver a la caverna para guiar a los demás hacia el conocimiento verdadero.',
'[{"pregunta":"¿Qué distingue Platón en su metafísica?","opciones":["Materia y forma","Acto y potencia","Mundo sensible y mundo inteligible","Sustancia y accidente"],"correcta":2},{"pregunta":"¿Qué lugar ocupa la Idea del Bien?","opciones":["Es una idea más entre otras","Es la cúspide del mundo inteligible","Pertenece al mundo sensible","Es una creación del ser humano"],"correcta":1},{"pregunta":"¿Qué ven los prisioneros de la caverna?","opciones":["Las Ideas verdaderas","La Idea del Bien","Sombras proyectadas en la pared","El mundo inteligible"],"correcta":2},{"pregunta":"¿Cuál es la misión del filósofo según la alegoría?","opciones":["Permanecer contemplando las Ideas","Volver a la caverna para guiar a los demás","Destruir la caverna","Ignorar a los prisioneros"],"correcta":1}]'),

('filosofia', 'bachillerato', '{2}', 'Descartes y el fundamento del conocimiento moderno',
'René Descartes inauguró la filosofía moderna con un proyecto ambicioso: encontrar un fundamento absolutamente seguro para todo el conocimiento humano. Para ello diseñó la duda metódica, un procedimiento que consiste en rechazar como falso todo aquello de lo que pueda dudarse mínimamente. Primero dudó de los sentidos, que a veces nos engañan. Luego dudó de la existencia del mundo exterior, pues podríamos estar soñando. Finalmente, introdujo la hipótesis del genio maligno: un ser todopoderoso que nos engaña sistemáticamente sobre todo lo que creemos saber. Sin embargo, incluso bajo esta duda radical, Descartes descubrió una verdad indubitable: si dudo, pienso; si pienso, existo. El cogito ergo sum se convierte así en la primera certeza sobre la que reconstruir el edificio del conocimiento. A partir del cogito, Descartes demuestra la existencia de Dios como ser perfecto que no puede ser engañador, y con ello garantiza la verdad de las ideas claras y distintas. Distingue tres sustancias: la res cogitans (sustancia pensante o alma), la res extensa (sustancia material o cuerpo) y Dios como sustancia infinita. Este dualismo entre mente y cuerpo generó uno de los problemas filosóficos más debatidos de la modernidad.',
'[{"pregunta":"¿En qué consiste la duda metódica?","opciones":["En dudar de todo para encontrar algo indubitable","En negar la existencia de Dios","En aceptar solo la experiencia sensible","En rechazar toda filosofía anterior"],"correcta":0},{"pregunta":"¿Cuál es la primera verdad indubitable para Descartes?","opciones":["Dios existe","El mundo es real","Cogito ergo sum","Los sentidos no engañan"],"correcta":2},{"pregunta":"¿Qué función cumple Dios en el sistema cartesiano?","opciones":["Es irrelevante","Garantiza la verdad de las ideas claras y distintas","Crea las Ideas platónicas","Limita el conocimiento humano"],"correcta":1},{"pregunta":"¿Qué problema generó el dualismo cartesiano?","opciones":["La relación entre mente y cuerpo","La existencia de Dios","La validez de las matemáticas","La fiabilidad de los sentidos"],"correcta":0}]'),

('filosofia', 'bachillerato', '{2}', 'Nietzsche: la crítica de la moral occidental',
'Friedrich Nietzsche llevó a cabo una de las críticas más radicales de la tradición filosófica y moral de Occidente. En La genealogía de la moral, distinguió entre una moral de señores, propia de los fuertes y creadores, basada en la afirmación vital y la excelencia, y una moral de esclavos, surgida del resentimiento de los débiles, que invierte los valores naturales: lo bueno (la fuerza, la salud, la alegría) se convierte en malo, y lo malo (la debilidad, la mansedumbre) se convierte en bueno. Para Nietzsche, el cristianismo y la filosofía platónica son las máximas expresiones de esta moral de esclavos que niega la vida en nombre de un mundo trascendente inexistente. La proclamación de la muerte de Dios no es un ateísmo ingenuo sino el diagnóstico de que los valores absolutos han perdido su vigencia, lo que conduce al nihilismo. Para superar el nihilismo, Nietzsche propone la figura del superhombre: un ser humano que, liberado de la moral del rebaño, crea sus propios valores desde la voluntad de poder como fuerza vital afirmativa. El eterno retorno actúa como criterio existencial: vive de tal modo que quieras que cada instante se repita eternamente.',
'[{"pregunta":"¿Qué distingue Nietzsche en La genealogía de la moral?","opciones":["Ética formal y material","Moral de señores y moral de esclavos","Ética deontológica y consecuencialista","Moral natural y moral civil"],"correcta":1},{"pregunta":"¿De qué surge la moral de esclavos según Nietzsche?","opciones":["De la razón pura","Del resentimiento de los débiles","Del contrato social","De la experiencia sensible"],"correcta":1},{"pregunta":"¿Qué significa la muerte de Dios?","opciones":["Un ateísmo simple","Que los valores absolutos han perdido vigencia","Que la religión ha triunfado","Que la ciencia ha fracasado"],"correcta":1},{"pregunta":"¿Qué propone el superhombre nietzscheano?","opciones":["Seguir la moral cristiana","Volver a los valores griegos","Crear sus propios valores desde la voluntad de poder","Aceptar el nihilismo como destino"],"correcta":2}]'),

('filosofia', 'bachillerato', '{2}', 'Ortega y Gasset: raciovitalismo y perspectivismo',
'José Ortega y Gasset es el filósofo español más influyente del siglo XX. Su pensamiento se articula en torno a dos conceptos clave: el raciovitalismo y el perspectivismo. El raciovitalismo supone una superación tanto del racionalismo abstracto como del vitalismo irracional: la razón no se opone a la vida sino que surge de ella y está a su servicio. La vida humana es la realidad radical, el dato primario desde el cual se comprende todo lo demás, incluidas las categorías filosóficas tradicionales. Ortega lo expresó con su célebre fórmula: yo soy yo y mi circunstancia, y si no la salvo a ella no me salvo yo. El yo no existe aislado sino siempre inserto en una circunstancia concreta: histórica, social, cultural y biográfica. El perspectivismo complementa esta idea: cada individuo accede a la realidad desde su perspectiva particular, que no es un obstáculo para la verdad sino una vía legítima hacia ella. La verdad total sería la integración de todas las perspectivas posibles. En La rebelión de las masas, Ortega analizó la sociedad contemporánea denunciando el conformismo del hombre-masa, que se contenta con ser igual a los demás y renuncia al esfuerzo de la excelencia.',
'[{"pregunta":"¿Qué supera el raciovitalismo?","opciones":["El empirismo y el racionalismo","El racionalismo abstracto y el vitalismo irracional","El idealismo y el materialismo","El escepticismo y el dogmatismo"],"correcta":1},{"pregunta":"¿Qué es la realidad radical para Ortega?","opciones":["La materia","Las Ideas platónicas","La vida humana","El pensamiento puro"],"correcta":2},{"pregunta":"¿Qué significa el perspectivismo de Ortega?","opciones":["Que no hay verdad posible","Que cada individuo accede a la verdad desde su perspectiva","Que solo existe una perspectiva correcta","Que la verdad es relativa al poder"],"correcta":1},{"pregunta":"¿Qué denuncia Ortega en La rebelión de las masas?","opciones":["La desigualdad económica","El conformismo del hombre-masa","La dictadura política","La crisis religiosa"],"correcta":1}]');

-- ============================================================================
-- FIN DEL SEED
-- ============================================================================
