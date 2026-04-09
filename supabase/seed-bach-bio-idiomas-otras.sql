-- =============================================================================
-- SEED: Bachillerato — Biología, Idiomas y Asignaturas Restantes
-- Asignaturas: biologia, ingles, frances, valenciano, literatura-universal,
--              dibujo-tecnico, tecnologia, ed-fisica, programacion
-- =============================================================================

BEGIN;

-- #############################################################################
-- BIOLOGÍA 1º (Biología, Geología y CC Ambientales)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — biologia 1º
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Proceso por el cual las células obtienen energía sin oxígeno','anaerobio','biologia','bachillerato','{1}',2),
('B','empieza','Ciencia que estudia la diversidad de los seres vivos y su clasificación','biologia','biologia','bachillerato','{1}',1),
('C','empieza','Unidad estructural y funcional básica de todos los seres vivos','celula','biologia','bachillerato','{1}',1),
('D','empieza','Proceso de división celular que reduce a la mitad el número de cromosomas, también llamado división reduccional','division','biologia','bachillerato','{1}',2),
('E','empieza','Conjunto de seres vivos, el medio físico y las relaciones que se establecen entre ellos','ecosistema','biologia','bachillerato','{1}',1),
('F','empieza','Proceso de conversión de luz en energía química realizado por organismos autótrofos','fotosintesis','biologia','bachillerato','{1}',1),
('G','empieza','Ciencia que estudia la herencia biológica y la variación de los caracteres','genetica','biologia','bachillerato','{1}',2),
('H','empieza','Capacidad de los organismos de mantener constantes las condiciones internas del medio','homeostasis','biologia','bachillerato','{1}',2),
('I','contiene','Tipo de roca formada por la solidificación del magma','ignea','biologia','bachillerato','{1}',2),
('J','contiene','Capa de células que recubre las hojas de las plantas y controla el intercambio gaseoso','tejido','biologia','bachillerato','{1}',2),
('K','contiene','Proteína estructural presente en pelo, uñas y cuernos de los vertebrados','queratina','biologia','bachillerato','{1}',2),
('L','empieza','Orgánulo celular encargado de la digestión intracelular','lisosoma','biologia','bachillerato','{1}',2),
('M','empieza','División celular que produce dos células hijas genéticamente idénticas','mitosis','biologia','bachillerato','{1}',1),
('N','empieza','Orgánulo que contiene el material genético de la célula eucariota','nucleo','biologia','bachillerato','{1}',1),
('O','empieza','Estructura subcelular que realiza funciones específicas dentro de la célula','organulo','biologia','bachillerato','{1}',1),
('P','empieza','Macromolécula formada por aminoácidos unidas por enlaces peptídicos','proteina','biologia','bachillerato','{1}',1),
('Q','contiene','Sustancia orgánica que acelera las reacciones bioquímicas celulares','bioquimica','biologia','bachillerato','{1}',3),
('R','empieza','Proceso de duplicación del ADN previo a la división celular','replicacion','biologia','bachillerato','{1}',2),
('S','empieza','Tipo de roca formada por acumulación y compactación de sedimentos','sedimentaria','biologia','bachillerato','{1}',2),
('T','empieza','Conjunto de células especializadas que realizan una función común','tejido','biologia','bachillerato','{1}',1),
('U','contiene','Tipo de célula que posee núcleo diferenciado rodeado de membrana','eucariota','biologia','bachillerato','{1}',1),
('V','empieza','Agente infeccioso acelular formado por ácido nucleico y cápside proteica','virus','biologia','bachillerato','{1}',1),
('W','contiene','Científico que propuso junto a Crick la estructura del ADN en doble hélice','watson','biologia','bachillerato','{1}',2),
('X','empieza','Tipo de planta adaptada a ambientes secos con poca disponibilidad de agua','xerofita','biologia','bachillerato','{1}',3),
('Y','contiene','Proceso que consiste en la degradación de glucosa para obtener energía en forma de ATP','glucolisis','biologia','bachillerato','{1}',2),
('Z','contiene','Tipo de reproducción asexual por la que un organismo se fragmenta para generar nuevos individuos','escision','biologia','bachillerato','{1}',3);

-- ---------------------------------------------------------------------------
-- rosco_questions — biologia 2º
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Molécula de tres fosfatos que constituye la principal fuente de energía celular','atp','biologia','bachillerato','{2}',1),
('B','empieza','Técnica que utiliza organismos vivos para obtener productos útiles para el ser humano','biotecnologia','biologia','bachillerato','{2}',1),
('C','empieza','Estructura proteica que forma los cromosomas junto al ADN','cromatina','biologia','bachillerato','{2}',2),
('D','empieza','Técnica de electroforesis que permite separar fragmentos de ADN por tamaño','desnaturalizacion','biologia','bachillerato','{2}',3),
('E','empieza','Proteína que cataliza reacciones bioquímicas reduciendo la energía de activación','enzima','biologia','bachillerato','{2}',1),
('F','empieza','Proceso metabólico de degradación de ácidos grasos para obtener energía','fermentacion','biologia','bachillerato','{2}',2),
('G','empieza','Conjunto completo de genes de un organismo contenido en su ADN','genoma','biologia','bachillerato','{2}',1),
('H','empieza','Tipo de herencia en la que ambos alelos se expresan por igual en el fenotipo','herencia','biologia','bachillerato','{2}',2),
('I','empieza','Sistema de defensa del organismo frente a agentes patógenos','inmunidad','biologia','bachillerato','{2}',1),
('J','contiene','Proceso de unión de dos gametos para formar un cigoto','conjugacion','biologia','bachillerato','{2}',3),
('K','contiene','Conjunto de cromosomas de una célula ordenados por tamaño y forma','cariotipo','biologia','bachillerato','{2}',2),
('L','empieza','Célula del sistema inmunitario que produce anticuerpos','linfocito','biologia','bachillerato','{2}',1),
('M','empieza','Cambio heredable en la secuencia de nucleótidos del ADN','mutacion','biologia','bachillerato','{2}',1),
('N','empieza','Monómero que forma los ácidos nucleicos compuesto por base, azúcar y fosfato','nucleotido','biologia','bachillerato','{2}',1),
('O','empieza','Gen que al mutar puede provocar la transformación de una célula normal en cancerosa','oncogen','biologia','bachillerato','{2}',2),
('P','empieza','Técnica de laboratorio que amplifica fragmentos específicos de ADN','pcr','biologia','bachillerato','{2}',2),
('Q','contiene','Proteínas de defensa producidas por los linfocitos B ante un antígeno','anticuerpo','biologia','bachillerato','{2}',2),
('R','empieza','Molécula de ácido nucleico que transmite la información del ADN al ribosoma','ribosoma','biologia','bachillerato','{2}',2),
('S','empieza','Proceso de selección de los individuos mejor adaptados al medio','seleccion','biologia','bachillerato','{2}',1),
('T','empieza','Proceso de síntesis de ARN mensajero a partir de una cadena de ADN','transcripcion','biologia','bachillerato','{2}',1),
('U','contiene','Proceso de síntesis de proteínas a partir de la información del ARN mensajero','traduccion','biologia','bachillerato','{2}',2),
('V','empieza','Preparado biológico que estimula la producción de anticuerpos sin causar enfermedad','vacuna','biologia','bachillerato','{2}',1),
('W','contiene','Botánico que describió el movimiento aleatorio de partículas en suspensión','browniano','biologia','bachillerato','{2}',3),
('X','contiene','Cromosoma sexual que en humanos determina el sexo femenino en doble dosis','cromosoma','biologia','bachillerato','{2}',2),
('Y','contiene','Proceso de obtención de energía a partir de la glucosa en presencia de oxígeno','citolisis','biologia','bachillerato','{2}',3),
('Z','contiene','Enzima que corta el ADN en secuencias específicas usada en ingeniería genética','enzima','biologia','bachillerato','{2}',2);

-- ---------------------------------------------------------------------------
-- runner_categories — biologia
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('biologia','bachillerato','{1}','Orgánulos celulares','["mitocondria","ribosoma","lisosoma","nucleo","cloroplasto","reticulo","aparato","vacuola","centriolos","peroxisoma","citoplasma","membrana"]'),
('biologia','bachillerato','{1}','Biomoléculas','["proteina","lipido","glucido","nucleotido","aminoacido","glucosa","celulosa","colageno","hemoglobina","insulina","queratina","almidon"]'),
('biologia','bachillerato','{1}','Tipos de rocas','["granito","basalto","caliza","arenisca","marmol","pizarra","cuarcita","obsidiana","gneis","esquisto","pumita","dolomita"]'),
('biologia','bachillerato','{1}','Ecosistemas','["tundra","taiga","sabana","estepa","manglar","arrecife","pradera","desierto","selva","bosque","humedal","litoral"]'),
('biologia','bachillerato','{1}','Microorganismos','["bacteria","virus","hongo","protozoo","alga","archaea","levadura","ameba","paramecio","diatomea","plasmodio","rickettsia"]'),
('biologia','bachillerato','{1}','Procesos celulares','["mitosis","meiosis","fotosintesis","respiracion","fermentacion","osmosis","difusion","endocitosis","exocitosis","apoptosis","replicacion","transcripcion"]'),
('biologia','bachillerato','{1}','Tejidos animales','["epitelial","conectivo","muscular","nervioso","oseo","cartilaginoso","adiposo","sanguineo","linfatico","tendinoso"]'),
('biologia','bachillerato','{1}','Minerales','["cuarzo","feldespato","mica","calcita","olivino","piroxeno","anfibiol","yeso","halita","magnetita","pirita","fluorita"]'),
('biologia','bachillerato','{2}','Genética molecular','["adn","arn","codon","anticodon","exon","intron","promotor","gen","alelo","cromosoma","genoma","plasmido"]'),
('biologia','bachillerato','{2}','Inmunología','["anticuerpo","antigeno","linfocito","macrofago","histamina","complemento","vacuna","inmunoglobulina","citoquina","interferon","fagocito","mastocito"]'),
('biologia','bachillerato','{2}','Biotecnología','["clonacion","transgenico","pcr","electroforesis","plasmido","vector","ligasa","restriccion","secuenciacion","crispr","fermentador","bioproceso"]'),
('biologia','bachillerato','{2}','Evolución','["seleccion","mutacion","adaptacion","especiacion","filogenia","darwin","lamarck","deriva","aislamiento","convergencia","divergencia","homologia"]'),
('biologia','bachillerato','{2}','Metabolismo','["glucolisis","krebs","fosforilacion","catabolismo","anabolismo","coenzima","nad","fad","piruvato","acetilo","oxalacetato","citrato"]'),
('biologia','bachillerato','{2}','Enzimas','["ligasa","polimerasa","helicasa","proteasa","lipasa","amilasa","catalasa","nucleasa","transcriptasa","kinasa","fosfatasa","isomerasa"]'),
('biologia','bachillerato','{2}','Enfermedades infecciosas','["tuberculosis","malaria","sida","gripe","colera","tetanos","hepatitis","rabia","dengue","sarampion","neumonia","meningitis"]'),
('biologia','bachillerato','{2}','Ecología','["bioma","nicho","habitat","simbiosis","parasitismo","depredacion","competencia","sucesion","biomasa","productividad","piramide","cadena"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — biologia
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('biologia','bachillerato','{1}','Orgánulos membranosos','["mitocondria","lisosoma","reticulo endoplasmatico","aparato de Golgi"]','["ribosoma","centriolos"]'),
('biologia','bachillerato','{1}','Biomoléculas orgánicas','["proteina","lipido","glucido","acido nucleico"]','["agua","sal mineral"]'),
('biologia','bachillerato','{1}','Fases de la mitosis','["profase","metafase","anafase","telofase"]','["interfase","citocinesis"]'),
('biologia','bachillerato','{1}','Rocas sedimentarias','["caliza","arenisca","conglomerado","arcilla"]','["granito","basalto"]'),
('biologia','bachillerato','{1}','Reinos de seres vivos','["animalia","plantae","fungi","protista"]','["mineral","virus"]'),
('biologia','bachillerato','{1}','Componentes del ecosistema','["productores","consumidores","descomponedores","biotopo"]','["litosfera","estratosfera"]'),
('biologia','bachillerato','{1}','Capas de la Tierra','["corteza","manto","nucleo externo","nucleo interno"]','["troposfera","exosfera"]'),
('biologia','bachillerato','{1}','Tipos de tejido animal','["epitelial","conectivo","muscular","nervioso"]','["meristematico","parenquimatico"]'),
('biologia','bachillerato','{1}','Funciones vitales','["nutricion","relacion","reproduccion","homeostasis"]','["erosion","sedimentacion"]'),
('biologia','bachillerato','{1}','Bases nitrogenadas del ADN','["adenina","timina","guanina","citosina"]','["uracilo","ribosa"]'),
('biologia','bachillerato','{2}','Tipos de ARN','["mensajero","transferencia","ribosomal","interferente"]','["historico","plasmidico"]'),
('biologia','bachillerato','{2}','Células del sistema inmune','["linfocito B","linfocito T","macrofago","celula dendritica"]','["eritrocito","plaqueta"]'),
('biologia','bachillerato','{2}','Técnicas de biotecnología','["pcr","electroforesis","clonacion","secuenciacion"]','["destilacion","cromatografia de gases"]'),
('biologia','bachillerato','{2}','Tipos de mutaciones','["puntual","delecion","insercion","translocacion"]','["difusion","osmosis"]'),
('biologia','bachillerato','{2}','Etapas del ciclo de Krebs','["citrato","isocitrato","succinato","oxalacetato"]','["glucosa","fructosa"]'),
('biologia','bachillerato','{2}','Evidencias de la evolución','["fosiles","anatomia comparada","embriologia","bioquimica"]','["astrologia","alquimia"]'),
('biologia','bachillerato','{2}','Tipos de inmunidad','["innata","adaptativa","humoral","celular"]','["termica","mecanica"]'),
('biologia','bachillerato','{2}','Aplicaciones de la ingeniería genética','["insulina recombinante","terapia genica","alimentos transgenicos","diagnostico molecular"]','["fundicion de metales","destilacion fraccionada"]'),
('biologia','bachillerato','{2}','Factores evolutivos','["mutacion","seleccion natural","deriva genetica","flujo genico"]','["reflexion","refraccion"]'),
('biologia','bachillerato','{2}','Componentes del nucleótido','["base nitrogenada","pentosa","grupo fosfato","enlace fosfodiester"]','["aminoacido","enlace peptidico"]');

-- ---------------------------------------------------------------------------
-- parejas_items — biologia
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('biologia','bachillerato','{1}','Mitocondria','Respiración celular'),
('biologia','bachillerato','{1}','Cloroplasto','Fotosíntesis'),
('biologia','bachillerato','{1}','Ribosoma','Síntesis de proteínas'),
('biologia','bachillerato','{1}','Lisosoma','Digestión celular'),
('biologia','bachillerato','{1}','Núcleo','Material genético'),
('biologia','bachillerato','{1}','ADN','Doble hélice'),
('biologia','bachillerato','{1}','Membrana plasmática','Permeabilidad selectiva'),
('biologia','bachillerato','{1}','Célula procariota','Sin núcleo definido'),
('biologia','bachillerato','{1}','Meiosis','Gametos'),
('biologia','bachillerato','{1}','Mitosis','Células somáticas'),
('biologia','bachillerato','{1}','Rocas ígneas','Solidificación del magma'),
('biologia','bachillerato','{1}','Rocas metamórficas','Presión y temperatura'),
('biologia','bachillerato','{1}','Proteína','Aminoácidos'),
('biologia','bachillerato','{1}','Lípido','Ácidos grasos'),
('biologia','bachillerato','{1}','Virus','Parásito intracelular obligado'),
('biologia','bachillerato','{1}','Ecosistema','Biocenosis y biotopo'),
('biologia','bachillerato','{1}','Aparato de Golgi','Secreción celular'),
('biologia','bachillerato','{1}','Retículo endoplasmático','Transporte intracelular'),
('biologia','bachillerato','{1}','Citoesqueleto','Soporte y movimiento'),
('biologia','bachillerato','{1}','Pared celular','Celulosa'),
('biologia','bachillerato','{2}','Codón','Triplete de ARNm'),
('biologia','bachillerato','{2}','Anticodón','ARN de transferencia'),
('biologia','bachillerato','{2}','Linfocito B','Producción de anticuerpos'),
('biologia','bachillerato','{2}','Linfocito T','Inmunidad celular'),
('biologia','bachillerato','{2}','PCR','Amplificación de ADN'),
('biologia','bachillerato','{2}','Enzima de restricción','Corte específico de ADN'),
('biologia','bachillerato','{2}','ADN ligasa','Unión de fragmentos'),
('biologia','bachillerato','{2}','Transcripción','ADN a ARN'),
('biologia','bachillerato','{2}','Traducción','ARN a proteína'),
('biologia','bachillerato','{2}','Selección natural','Darwin'),
('biologia','bachillerato','{2}','Herencia caracteres adquiridos','Lamarck'),
('biologia','bachillerato','{2}','Ciclo de Krebs','Matriz mitocondrial'),
('biologia','bachillerato','{2}','Glucólisis','Citoplasma'),
('biologia','bachillerato','{2}','Fosforilación oxidativa','Cadena de transporte'),
('biologia','bachillerato','{2}','Oncogén','Cáncer'),
('biologia','bachillerato','{2}','Vacuna','Inmunidad activa artificial'),
('biologia','bachillerato','{2}','Suero','Inmunidad pasiva artificial'),
('biologia','bachillerato','{2}','Plásmido','Vector de clonación'),
('biologia','bachillerato','{2}','CRISPR','Edición genética'),
('biologia','bachillerato','{2}','Deriva genética','Cambio aleatorio de frecuencias');

-- ---------------------------------------------------------------------------
-- ordena_frases — biologia
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('biologia','bachillerato','{1}','La célula eucariota se diferencia de la procariota por poseer un núcleo rodeado de membrana nuclear'),
('biologia','bachillerato','{1}','Los orgánulos celulares como las mitocondrias realizan la respiración celular para obtener energía en forma de ATP'),
('biologia','bachillerato','{1}','La fotosíntesis es el proceso por el cual los organismos autótrofos transforman la energía luminosa en química'),
('biologia','bachillerato','{1}','Las proteínas son macromoléculas formadas por cadenas de aminoácidos unidos mediante enlaces peptídicos covalentes'),
('biologia','bachillerato','{1}','La mitosis es un tipo de división celular que produce dos células hijas genéticamente idénticas a la progenitora'),
('biologia','bachillerato','{1}','Los ecosistemas están formados por el conjunto de seres vivos y el medio físico en el que se relacionan'),
('biologia','bachillerato','{1}','Las rocas sedimentarias se forman por la acumulación y compactación de materiales depositados en capas sucesivas'),
('biologia','bachillerato','{1}','La biodiversidad se refiere a la variedad de especies organismos y ecosistemas presentes en un determinado territorio'),
('biologia','bachillerato','{2}','La replicación del ADN es un proceso semiconservativo en el que cada hebra sirve de molde para sintetizar otra nueva'),
('biologia','bachillerato','{2}','Los anticuerpos son proteínas producidas por los linfocitos B en respuesta a la presencia de un antígeno específico'),
('biologia','bachillerato','{2}','La técnica de PCR permite amplificar millones de copias de un fragmento específico de ADN en pocas horas'),
('biologia','bachillerato','{2}','Las mutaciones son cambios heredables en la secuencia del ADN que pueden ser beneficiosas neutras o perjudiciales'),
('biologia','bachillerato','{2}','La selección natural favorece la supervivencia y reproducción de los individuos mejor adaptados a su medio ambiente'),
('biologia','bachillerato','{2}','El ciclo de Krebs tiene lugar en la matriz mitocondrial y produce coenzimas reducidos que alimentan la cadena respiratoria'),
('biologia','bachillerato','{2}','La ingeniería genética utiliza enzimas de restricción y vectores para transferir genes entre organismos diferentes');

-- ---------------------------------------------------------------------------
-- ordena_historias — biologia
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('biologia','bachillerato','{1}','["La célula absorbe nutrientes del medio extracelular a través de la membrana plasmática.","Las mitocondrias degradan la glucosa mediante la respiración celular aeróbica.","Se produce ATP como principal molécula energética utilizable por la célula.","La energía obtenida se emplea en procesos como la síntesis de proteínas y la división celular.","Los productos de desecho como el CO2 se expulsan al exterior de la célula."]'),
('biologia','bachillerato','{1}','["El magma asciende desde el manto terrestre hacia la superficie.","Al enfriarse, el magma se solidifica formando rocas ígneas.","La erosión meteoriza las rocas y transporta los sedimentos.","Los sedimentos se depositan en cuencas y se compactan formando rocas sedimentarias.","La presión y temperatura transforman las rocas en metamórficas cerrando el ciclo."]'),
('biologia','bachillerato','{2}','["El ADN se desenrolla y la ARN polimerasa se une al promotor del gen.","Se sintetiza una cadena de ARN mensajero complementaria a la hebra molde.","El ARNm maduro sale del núcleo hacia el citoplasma.","Los ribosomas leen los codones del ARNm y los ARNt aportan aminoácidos.","La cadena polipeptídica se pliega y forma una proteína funcional."]'),
('biologia','bachillerato','{2}','["Un patógeno entra en el organismo y es detectado por los macrófagos.","Los macrófagos presentan los antígenos a los linfocitos T colaboradores.","Los linfocitos T activan a los linfocitos B para producir anticuerpos específicos.","Los anticuerpos se unen al patógeno y lo neutralizan facilitando su eliminación.","Se generan linfocitos de memoria que permitirán una respuesta más rápida en futuras infecciones."]'),
('biologia','bachillerato','{2}','["Se extrae el gen de interés del organismo donante utilizando enzimas de restricción.","El gen se inserta en un vector como un plásmido bacteriano.","El plásmido recombinante se introduce en una bacteria hospedadora.","La bacteria se multiplica y expresa el gen produciendo la proteína deseada.","La proteína recombinante se purifica y se utiliza con fines terapéuticos o industriales."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — biologia
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('biologia','bachillerato','{1}','Las células procariotas tienen un núcleo bien definido rodeado de doble membrana como las eucariotas'),
('biologia','bachillerato','{1}','La fotosíntesis se realiza en las mitocondrias de las células vegetales para producir glucosa'),
('biologia','bachillerato','{1}','Los lípidos son macromoléculas formadas por aminoácidos unidos mediante enlaces peptídicos'),
('biologia','bachillerato','{1}','La meiosis produce dos células hijas genéticamente idénticas a la célula madre original'),
('biologia','bachillerato','{1}','Las rocas metamórficas se forman por la solidificación directa del magma en la superficie terrestre'),
('biologia','bachillerato','{1}','El ribosoma es un orgánulo rodeado de doble membrana que se encarga de la respiración celular'),
('biologia','bachillerato','{2}','La transcripción del ADN tiene lugar en los ribosomas del citoplasma celular'),
('biologia','bachillerato','{2}','Los linfocitos T son los principales productores de anticuerpos en la respuesta inmunitaria humoral'),
('biologia','bachillerato','{2}','La PCR utiliza temperaturas bajas constantes para separar las dos hebras del ADN en cada ciclo'),
('biologia','bachillerato','{2}','Las mutaciones siempre son perjudiciales para el organismo y nunca contribuyen a la evolución'),
('biologia','bachillerato','{2}','El ciclo de Krebs ocurre en el citoplasma de la célula y no requiere oxígeno para funcionar'),
('biologia','bachillerato','{2}','La selección natural fue propuesta por Lamarck como mecanismo principal de la evolución biológica');

-- ---------------------------------------------------------------------------
-- comprension_texts — biologia
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('biologia','bachillerato','{1}','La célula como unidad de vida',
'La célula es la unidad estructural y funcional básica de todos los seres vivos. Existen dos tipos fundamentales: las células procariotas, que carecen de núcleo definido y cuyo material genético se encuentra disperso en el citoplasma, y las células eucariotas, que poseen un núcleo delimitado por una doble membrana nuclear. Las células eucariotas contienen diversos orgánulos especializados como las mitocondrias, encargadas de la respiración celular, los ribosomas, responsables de la síntesis de proteínas, y el retículo endoplasmático, que participa en el transporte intracelular. En las células vegetales se encuentran además los cloroplastos, orgánulos donde se realiza la fotosíntesis. La membrana plasmática regula el intercambio de sustancias entre la célula y su entorno mediante mecanismos de transporte activo y pasivo. Todos los seres vivos, desde las bacterias más simples hasta los organismos pluricelulares más complejos, comparten esta organización celular básica, lo que constituye una de las evidencias más sólidas de un origen evolutivo común.',
'[{"pregunta":"¿Qué característica distingue a las células eucariotas de las procariotas?","opciones":["Tienen ribosomas","Poseen núcleo delimitado por membrana","Son más pequeñas","Carecen de ADN"],"correcta":1},{"pregunta":"¿En qué orgánulo se realiza la fotosíntesis?","opciones":["Mitocondria","Ribosoma","Cloroplasto","Retículo endoplasmático"],"correcta":2},{"pregunta":"¿Cuál es la función principal de la membrana plasmática?","opciones":["Sintetizar proteínas","Regular el intercambio de sustancias","Almacenar información genética","Producir energía"],"correcta":1},{"pregunta":"Según el texto, ¿qué evidencia apoya el origen evolutivo común?","opciones":["La diversidad de ecosistemas","La organización celular compartida","El tamaño de los organismos","La reproducción sexual"],"correcta":1}]'),
('biologia','bachillerato','{2}','La revolución de la ingeniería genética',
'La ingeniería genética ha transformado la biología moderna al permitir la manipulación directa del material genético de los organismos. El proceso básico consiste en aislar un gen de interés mediante enzimas de restricción, que cortan el ADN en secuencias específicas, e insertarlo en un vector de clonación, generalmente un plásmido bacteriano. La enzima ADN ligasa sella los fragmentos generando ADN recombinante. La técnica de la PCR, desarrollada por Kary Mullis en 1985, revolucionó el campo al permitir amplificar millones de copias de un fragmento de ADN en pocas horas. Más recientemente, el sistema CRISPR-Cas9 ha abierto posibilidades sin precedentes para la edición genética precisa. Entre las aplicaciones más relevantes se encuentran la producción de insulina recombinante para diabéticos, el desarrollo de cultivos transgénicos resistentes a plagas y la terapia génica para enfermedades hereditarias. Sin embargo, estas tecnologías también plantean dilemas éticos sobre los límites de la modificación genética en seres humanos.',
'[{"pregunta":"¿Qué función cumplen las enzimas de restricción?","opciones":["Unen fragmentos de ADN","Cortan el ADN en secuencias específicas","Amplifican el ADN","Transcriben el ADN a ARN"],"correcta":1},{"pregunta":"¿Quién desarrolló la técnica de la PCR?","opciones":["Watson y Crick","Kary Mullis","Charles Darwin","Gregor Mendel"],"correcta":1},{"pregunta":"¿Qué sistema permite la edición genética precisa más reciente?","opciones":["PCR","Electroforesis","CRISPR-Cas9","Clonación"],"correcta":2},{"pregunta":"¿Cuál de estas NO es una aplicación mencionada de la ingeniería genética?","opciones":["Insulina recombinante","Cultivos transgénicos","Terapia génica","Predicción del clima"],"correcta":3}]'),
('biologia','bachillerato','{2}','El sistema inmunitario humano',
'El sistema inmunitario constituye el principal mecanismo de defensa del organismo frente a agentes patógenos. Se distinguen dos tipos de respuesta: la inmunidad innata, que actúa de forma inmediata e inespecífica mediante barreras físicas como la piel y células fagocitarias como los macrófagos, y la inmunidad adaptativa, que es específica para cada patógeno y genera memoria inmunológica. Los linfocitos B producen anticuerpos que se unen a los antígenos del patógeno neutralizándolo, constituyendo la respuesta humoral. Los linfocitos T, por su parte, participan en la respuesta celular destruyendo directamente células infectadas. Tras superar una infección, se generan linfocitos de memoria que permiten una respuesta más rápida y eficaz ante futuras exposiciones al mismo patógeno. Este principio fundamenta el funcionamiento de las vacunas, que introducen antígenos atenuados o inactivados para estimular la producción de anticuerpos y células de memoria sin causar la enfermedad. La inmunología moderna ha permitido desarrollar tratamientos avanzados como los anticuerpos monoclonales y la inmunoterapia contra el cáncer.',
'[{"pregunta":"¿Qué tipo de inmunidad genera memoria inmunológica?","opciones":["Inmunidad innata","Inmunidad adaptativa","Inmunidad pasiva","Inmunidad mecánica"],"correcta":1},{"pregunta":"¿Qué células producen anticuerpos?","opciones":["Linfocitos T","Macrófagos","Linfocitos B","Eritrocitos"],"correcta":2},{"pregunta":"¿Cómo funcionan las vacunas según el texto?","opciones":["Destruyen directamente los patógenos","Introducen antígenos para estimular la respuesta inmune","Aumentan la temperatura corporal","Refuerzan las barreras físicas"],"correcta":1},{"pregunta":"¿Qué avance moderno menciona el texto en inmunología?","opciones":["Antibióticos","Anticuerpos monoclonales","Transfusiones de sangre","Rayos X"],"correcta":1}]');


-- #############################################################################
-- INGLÉS (1º y 2º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — ingles
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','A word meaning to reach a goal or accomplish something successfully','achieve','ingles','bachillerato','{1,2}',1),
('B','empieza','A word meaning to have faith or confidence in something or someone','believe','ingles','bachillerato','{1,2}',1),
('C','empieza','A word meaning the result or effect of an action or situation','consequence','ingles','bachillerato','{1,2}',2),
('D','empieza','A word meaning to refuse to accept or consider something','dismiss','ingles','bachillerato','{1,2}',2),
('E','empieza','A word meaning to make something stronger or more noticeable','emphasize','ingles','bachillerato','{1,2}',2),
('F','empieza','A word meaning possible or likely to happen in the future','feasible','ingles','bachillerato','{1,2}',3),
('G','empieza','A word meaning true, real, or authentic','genuine','ingles','bachillerato','{1,2}',2),
('H','empieza','A word meaning an idea or suggestion not yet proven','hypothesis','ingles','bachillerato','{1,2}',2),
('I','empieza','A word meaning to show or suggest that something is true','imply','ingles','bachillerato','{1,2}',2),
('J','empieza','A word meaning to put at risk or in danger','jeopardize','ingles','bachillerato','{1,2}',3),
('K','empieza','A word meaning awareness or understanding of a subject','knowledge','ingles','bachillerato','{1,2}',1),
('L','empieza','A linking word meaning in the same way or similarly','likewise','ingles','bachillerato','{1,2}',2),
('M','empieza','A word meaning to keep or preserve something in its current state','maintain','ingles','bachillerato','{1,2}',1),
('N','empieza','A word meaning to discuss terms in order to reach an agreement','negotiate','ingles','bachillerato','{1,2}',2),
('O','empieza','A word meaning to get or acquire something','obtain','ingles','bachillerato','{1,2}',1),
('P','empieza','A word meaning to continue doing something despite difficulties','persevere','ingles','bachillerato','{1,2}',2),
('Q','contiene','A word meaning the amount of something that is available or produced','quantity','ingles','bachillerato','{1,2}',1),
('R','empieza','A word meaning related to or important for the matter at hand','relevant','ingles','bachillerato','{1,2}',2),
('S','empieza','A word meaning to replace one thing with another','substitute','ingles','bachillerato','{1,2}',2),
('T','empieza','A word meaning careful and using a lot of effort','thorough','ingles','bachillerato','{1,2}',2),
('U','empieza','A word meaning to go through or experience something','undergo','ingles','bachillerato','{1,2}',2),
('V','empieza','A word meaning having a wide variety or range','versatile','ingles','bachillerato','{1,2}',3),
('W','empieza','A word meaning ready and happy to do something','willing','ingles','bachillerato','{1,2}',1),
('X','contiene','A word meaning a feeling of worry or nervousness about something','anxiety','ingles','bachillerato','{1,2}',2),
('Y','empieza','A word meaning to produce a result or output','yield','ingles','bachillerato','{1,2}',3),
('Z','contiene','A word meaning enthusiasm or great energy for a cause','zeal','ingles','bachillerato','{1,2}',3);

-- ---------------------------------------------------------------------------
-- runner_categories — ingles
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('ingles','bachillerato','{1,2}','Linking words','["however","therefore","moreover","nevertheless","furthermore","although","consequently","meanwhile","nonetheless","whereas","hence","otherwise"]'),
('ingles','bachillerato','{1,2}','Academic vocabulary','["analyze","evaluate","demonstrate","investigate","conclude","hypothesis","evidence","significant","relevant","approach","perspective","methodology"]'),
('ingles','bachillerato','{1,2}','Phrasal verbs','["carry out","bring up","come across","figure out","give up","look into","put forward","set up","turn down","break through","hold back","point out"]'),
('ingles','bachillerato','{1,2}','Prefixes and suffixes','["misunderstand","overcome","redo","unbelievable","meaningful","careless","hopeful","restless","remarkable","irreversible","disagreement","independence"]'),
('ingles','bachillerato','{1,2}','False friends','["actually","eventually","library","sensible","sympathetic","comprehensive","embarrassed","fabric","resume","constipated","carpet","lecture"]'),
('ingles','bachillerato','{1,2}','Environment vocabulary','["sustainability","pollution","deforestation","biodiversity","recycling","emissions","renewable","conservation","greenhouse","ecosystem","drought","endangered"]'),
('ingles','bachillerato','{1,2}','Technology vocabulary','["algorithm","database","bandwidth","encryption","interface","software","hardware","cybersecurity","artificial","automation","blockchain","debugging"]'),
('ingles','bachillerato','{1,2}','Literature terms','["metaphor","irony","allegory","protagonist","narrator","foreshadowing","symbolism","satire","soliloquy","tragedy","dystopia","epiphany"]'),
('ingles','bachillerato','{1,2}','Collocations','["breakthrough","drawback","outcome","deadline","feedback","insight","setback","milestone","framework","guideline","background","overview"]'),
('ingles','bachillerato','{1,2}','Formal register','["regarding","concerning","acknowledge","approximately","considerable","facilitate","implement","preliminary","subsequent","aforementioned","henceforth","notwithstanding"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — ingles
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ingles','bachillerato','{1,2}','Linking words of contrast','["however","nevertheless","although","whereas"]','["moreover","furthermore"]'),
('ingles','bachillerato','{1,2}','Past tenses','["past simple","past continuous","past perfect","past perfect continuous"]','["present perfect","future simple"]'),
('ingles','bachillerato','{1,2}','Modal verbs','["must","should","might","could"]','["wanted","decided"]'),
('ingles','bachillerato','{1,2}','Conditional types','["zero conditional","first conditional","second conditional","third conditional"]','["passive voice","reported speech"]'),
('ingles','bachillerato','{1,2}','Academic writing words','["furthermore","consequently","nevertheless","moreover"]','["awesome","cool"]'),
('ingles','bachillerato','{1,2}','Uncountable nouns','["information","advice","furniture","luggage"]','["chair","book"]'),
('ingles','bachillerato','{1,2}','Relative pronouns','["who","which","whose","whom"]','["but","because"]'),
('ingles','bachillerato','{1,2}','Words with prefix un-','["unable","unlikely","uncertain","unfair"]','["inside","before"]'),
('ingles','bachillerato','{1,2}','Literary genres','["novel","poetry","drama","short story"]','["equation","theorem"]'),
('ingles','bachillerato','{1,2}','Formal greetings','["Dear Sir","To whom it may concern","I am writing to","I look forward to"]','["Hey mate","What is up"]');

-- ---------------------------------------------------------------------------
-- parejas_items — ingles
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ingles','bachillerato','{1,2}','However','No obstante'),
('ingles','bachillerato','{1,2}','Therefore','Por lo tanto'),
('ingles','bachillerato','{1,2}','Moreover','Además'),
('ingles','bachillerato','{1,2}','Nevertheless','Sin embargo'),
('ingles','bachillerato','{1,2}','Although','Aunque'),
('ingles','bachillerato','{1,2}','Achieve','Lograr'),
('ingles','bachillerato','{1,2}','Enhance','Mejorar'),
('ingles','bachillerato','{1,2}','Acknowledge','Reconocer'),
('ingles','bachillerato','{1,2}','Thoroughly','A fondo'),
('ingles','bachillerato','{1,2}','Reliable','Fiable'),
('ingles','bachillerato','{1,2}','Carry out','Llevar a cabo'),
('ingles','bachillerato','{1,2}','Give up','Rendirse'),
('ingles','bachillerato','{1,2}','Look into','Investigar'),
('ingles','bachillerato','{1,2}','Put forward','Proponer'),
('ingles','bachillerato','{1,2}','Turn down','Rechazar'),
('ingles','bachillerato','{1,2}','Metaphor','Metáfora'),
('ingles','bachillerato','{1,2}','Foreshadowing','Presagio literario'),
('ingles','bachillerato','{1,2}','Regardless','Independientemente'),
('ingles','bachillerato','{1,2}','Widespread','Generalizado'),
('ingles','bachillerato','{1,2}','Outcome','Resultado');

-- ---------------------------------------------------------------------------
-- ordena_frases — ingles
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('ingles','bachillerato','{1,2}','If I had studied harder for the exam I would have obtained a much better grade'),
('ingles','bachillerato','{1,2}','The scientist who discovered the vaccine was awarded the Nobel Prize in Medicine last year'),
('ingles','bachillerato','{1,2}','Despite the heavy rain the students decided to carry out their outdoor experiment as planned'),
('ingles','bachillerato','{1,2}','Not only did she pass the exam but she also achieved the highest score in her class'),
('ingles','bachillerato','{1,2}','Had the government invested more in renewable energy the pollution levels would be significantly lower'),
('ingles','bachillerato','{1,2}','The novel which was written in the nineteenth century is still considered a masterpiece of English literature'),
('ingles','bachillerato','{1,2}','It is widely believed that artificial intelligence will transform the way we work and communicate'),
('ingles','bachillerato','{1,2}','The report suggests that climate change is having a devastating impact on biodiversity around the world'),
('ingles','bachillerato','{1,2}','Were it not for the support of her family she would never have been able to pursue her dreams'),
('ingles','bachillerato','{1,2}','By the time the rescue team arrived the survivors had already been waiting for more than twelve hours'),
('ingles','bachillerato','{1,2}','Although many people oppose the new law it has been approved by a large majority in parliament'),
('ingles','bachillerato','{1,2}','The teacher asked the students whether they had finished reading the chapter assigned for that week'),
('ingles','bachillerato','{1,2}','Neither the principal nor the teachers were aware of the problem until several parents filed complaints'),
('ingles','bachillerato','{1,2}','Provided that the weather improves we will be able to hold the ceremony in the outdoor amphitheatre'),
('ingles','bachillerato','{1,2}','The more effort you put into learning a language the more fluent and confident you will eventually become');

-- ---------------------------------------------------------------------------
-- ordena_historias — ingles
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('ingles','bachillerato','{1,2}','["Sarah had always dreamed of studying abroad since she was a child.","She applied to several universities in the United Kingdom and received an offer from Oxford.","After months of preparation she finally moved to England to begin her studies.","Although she found the academic level challenging she adapted quickly to university life.","By the end of her first year she had made lifelong friends and achieved excellent results."]'),
('ingles','bachillerato','{1,2}','["The industrial revolution began in Britain during the late eighteenth century.","New inventions such as the steam engine transformed manufacturing and transport.","Millions of workers moved from rural areas to rapidly growing cities.","Working conditions in factories were extremely harsh especially for women and children.","Eventually labour laws were introduced to protect workers rights and improve conditions."]'),
('ingles','bachillerato','{1,2}','["A group of scientists discovered a new species of deep-sea fish near the Mariana Trench.","They collected samples and brought them back to the laboratory for detailed analysis.","DNA testing revealed that the species was genetically distinct from all known fish.","The discovery was published in a prestigious scientific journal and attracted global attention.","Further expeditions are now being planned to explore the biodiversity of the deep ocean."]'),
('ingles','bachillerato','{1,2}','["Climate change is causing sea levels to rise at an alarming rate.","Small island nations are particularly vulnerable to flooding and coastal erosion.","International organizations have called for urgent action to reduce carbon emissions.","Several countries have committed to achieving carbon neutrality by the year 2050.","However critics argue that current measures are insufficient to prevent catastrophic warming."]'),
('ingles','bachillerato','{1,2}','["Shakespeare wrote Hamlet around the year 1600 during the English Renaissance.","The play explores themes of revenge betrayal and the nature of existence.","The famous soliloquy To be or not to be has become one of the most quoted passages in literature.","Hamlet has been adapted into countless films operas and modern stage productions.","It remains one of the most studied and performed plays in the history of world theatre."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — ingles
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('ingles','bachillerato','{1,2}','If I would have known about the meeting I would have attended it without any hesitation'),
('ingles','bachillerato','{1,2}','The students which passed the exam were congratulated by their teachers and parents'),
('ingles','bachillerato','{1,2}','She suggested him to apply for the scholarship before the deadline was over'),
('ingles','bachillerato','{1,2}','Despite of the bad weather they decided to go ahead with the planned outdoor activity'),
('ingles','bachillerato','{1,2}','The news are very disappointing and have made everyone in the office feel quite upset'),
('ingles','bachillerato','{1,2}','He told me that he has been living in London since five years and enjoys it greatly'),
('ingles','bachillerato','{1,2}','I am used to wake up early every morning because my job starts at seven o clock'),
('ingles','bachillerato','{1,2}','She is more taller than her sister but not as intelligent like her younger brother'),
('ingles','bachillerato','{1,2}','Neither the teacher or the students were prepared for the sudden change in the schedule'),
('ingles','bachillerato','{1,2}','The amount of people attending the conference was much larger than we had initially expected'),
('ingles','bachillerato','{1,2}','He explained me the situation very clearly but I still could not understand the main point'),
('ingles','bachillerato','{1,2}','By the time she will arrive we will have already finished eating dinner and cleaning up');

-- ---------------------------------------------------------------------------
-- comprension_texts — ingles
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('ingles','bachillerato','{1,2}','The Impact of Social Media on Modern Society',
'Social media has fundamentally transformed the way people communicate, access information, and interact with the world around them. Platforms such as Instagram, Twitter, and TikTok have created new forms of expression and enabled individuals to share their ideas with a global audience instantaneously. However, the rise of social media has also raised significant concerns. Studies have shown that excessive use of these platforms is associated with increased levels of anxiety, depression, and loneliness, particularly among young people. The constant exposure to carefully curated images and lifestyles can create unrealistic expectations and damage self-esteem. Furthermore, the spread of misinformation through social networks has become a serious threat to democratic processes and public health. Despite these drawbacks, social media also offers undeniable benefits: it facilitates social movements, connects communities across borders, and provides a powerful tool for education and awareness. The challenge for modern society lies in finding a balance that maximizes the positive potential of these technologies while minimizing their harmful effects.',
'[{"pregunta":"According to the text, what negative effect is associated with excessive social media use?","opciones":["Improved communication skills","Increased anxiety and depression","Better academic performance","Enhanced creativity"],"correcta":1},{"pregunta":"What does the text identify as a threat to democracy?","opciones":["Social movements","Global connectivity","Spread of misinformation","Educational tools"],"correcta":2},{"pregunta":"What positive aspect of social media does the text mention?","opciones":["Creating unrealistic expectations","Damaging self-esteem","Facilitating social movements","Increasing loneliness"],"correcta":2},{"pregunta":"What challenge does the text suggest for modern society?","opciones":["Eliminating all social media","Finding a balance between benefits and harms","Restricting access to young people only","Developing new platforms"],"correcta":1}]'),
('ingles','bachillerato','{1,2}','Shakespeare and the English Renaissance',
'William Shakespeare is widely regarded as the greatest writer in the English language and the world''s most influential dramatist. Born in Stratford-upon-Avon in 1564, he wrote approximately 39 plays, 154 sonnets, and several longer poems during the English Renaissance, a period of extraordinary cultural and intellectual flourishing. His works explore universal themes such as love, jealousy, ambition, betrayal, and the human condition, which continue to resonate with audiences centuries later. Tragedies like Hamlet, Macbeth, and King Lear examine the consequences of flawed human nature, while comedies such as A Midsummer Night''s Dream and Much Ado About Nothing celebrate wit, romance, and the absurdity of social conventions. Shakespeare''s influence on the English language itself is immeasurable: he invented over 1,700 words still in use today, including ''assassination,'' ''lonely,'' and ''generous.'' His plays have been translated into every major language and are performed more often than those of any other playwright. The Globe Theatre, where many of his works premiered, has been reconstructed in London and remains a popular destination for theatre lovers from around the world.',
'[{"pregunta":"How many plays did Shakespeare write approximately?","opciones":["29","39","49","154"],"correcta":1},{"pregunta":"Which of these is NOT mentioned as a Shakespearean tragedy?","opciones":["Hamlet","Macbeth","A Midsummer Night''s Dream","King Lear"],"correcta":2},{"pregunta":"According to the text, how many words did Shakespeare invent?","opciones":["Over 700","Over 1,700","Over 2,700","Over 3,700"],"correcta":1},{"pregunta":"What has been reconstructed in London?","opciones":["Shakespeare''s birthplace","The Royal Theatre","The Globe Theatre","Stratford-upon-Avon"],"correcta":2}]'),
('ingles','bachillerato','{1,2}','Artificial Intelligence: Promise and Peril',
'Artificial intelligence has emerged as one of the most transformative technologies of the twenty-first century. From virtual assistants and self-driving cars to medical diagnosis and climate modelling, AI systems are increasingly being integrated into every aspect of human life. Machine learning algorithms can now process vast amounts of data and identify patterns that would be impossible for humans to detect, leading to breakthroughs in fields ranging from drug discovery to financial analysis. However, the rapid advancement of AI has also sparked intense debate about its potential risks. Critics warn that automation could lead to widespread unemployment as machines replace human workers in manufacturing, transport, and even creative industries. There are also growing concerns about algorithmic bias, privacy violations, and the development of autonomous weapons. Leading researchers have called for robust international regulations to ensure that AI is developed responsibly and ethically. The key question facing humanity is not whether AI will continue to advance, but whether we can shape its development in a way that benefits all of society rather than concentrating power in the hands of a few.',
'[{"pregunta":"What can machine learning algorithms do according to the text?","opciones":["Replace all human jobs","Process data and identify patterns","Eliminate algorithmic bias","Regulate themselves"],"correcta":1},{"pregunta":"What risk of AI does the text mention regarding employment?","opciones":["Higher salaries","Widespread unemployment","More job creation","Better working conditions"],"correcta":1},{"pregunta":"What have leading researchers called for?","opciones":["Stopping AI development","International regulations","More autonomous weapons","Less data processing"],"correcta":1},{"pregunta":"What is the key question facing humanity according to the text?","opciones":["Whether AI will continue to advance","Whether we can shape AI to benefit all of society","Whether machines can think","Whether to ban AI completely"],"correcta":1}]');


-- #############################################################################
-- FRANCÉS (1º y 2º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — frances
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Verbe signifiant obtenir ou acquérir quelque chose par ses efforts','atteindre','frances','bachillerato','{1,2}',2),
('B','empieza','Mot désignant le bonheur ou le bien-être','bonheur','frances','bachillerato','{1,2}',1),
('C','empieza','Mot signifiant la connaissance ou la compréhension d un sujet','connaissance','frances','bachillerato','{1,2}',1),
('D','empieza','Mot signifiant un accord ou une discussion entre deux parties','debat','frances','bachillerato','{1,2}',2),
('E','empieza','Mot signifiant l instruction ou la formation intellectuelle','enseignement','frances','bachillerato','{1,2}',1),
('F','contiene','Mot signifiant la confiance que l on a en quelqu un ou quelque chose','confiance','frances','bachillerato','{1,2}',2),
('G','empieza','Adjectif signifiant qui est sans charge ou sans frais','gratuit','frances','bachillerato','{1,2}',1),
('H','empieza','Mot désignant le fait de recevoir des personnes chez soi ou dans un établissement','hospitalite','frances','bachillerato','{1,2}',2),
('I','empieza','Adjectif signifiant qui ne peut pas être changé ou modifié','immuable','frances','bachillerato','{1,2}',3),
('J','empieza','Mot désignant une publication périodique d information','journal','frances','bachillerato','{1,2}',1),
('K','contiene','Mot désignant un petit pavillon de vente dans la rue','kiosque','frances','bachillerato','{1,2}',2),
('L','empieza','Mot désignant la liberté d expression et de pensée','liberte','frances','bachillerato','{1,2}',1),
('M','empieza','Mot signifiant une grande surface de vente de produits','marche','frances','bachillerato','{1,2}',1),
('N','empieza','Mot signifiant la capacité de distinguer les nuances','nuance','frances','bachillerato','{1,2}',2),
('O','empieza','Mot signifiant ce qui s oppose ou est contraire à quelque chose','opposition','frances','bachillerato','{1,2}',2),
('P','empieza','Mot désignant un point de vue ou une manière de voir les choses','perspective','frances','bachillerato','{1,2}',2),
('Q','empieza','Adjectif signifiant de tous les jours ou habituel','quotidien','frances','bachillerato','{1,2}',1),
('R','empieza','Mot signifiant la capacité de résister ou de ne pas céder','resistance','frances','bachillerato','{1,2}',2),
('S','empieza','Mot signifiant la capacité de maintenir un développement durable','soutenabilite','frances','bachillerato','{1,2}',3),
('T','empieza','Mot désignant l acceptation ou le respect des différences','tolerance','frances','bachillerato','{1,2}',1),
('U','empieza','Adjectif signifiant qui est le seul de son genre','unique','frances','bachillerato','{1,2}',1),
('V','empieza','Mot signifiant la diversité ou le changement dans un ensemble','variete','frances','bachillerato','{1,2}',1),
('W','contiene','Mot emprunté à l anglais désignant un lieu de travail collaboratif','coworking','frances','bachillerato','{1,2}',3),
('X','contiene','Mot signifiant qui est étranger ou vient d un autre pays','exotique','frances','bachillerato','{1,2}',2),
('Y','contiene','Mot désignant une personne qui voyage dans un pays étranger','voyageur','frances','bachillerato','{1,2}',1),
('Z','contiene','Mot désignant une zone géographique ou administrative','zone','frances','bachillerato','{1,2}',1);

-- ---------------------------------------------------------------------------
-- runner_categories — frances
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('frances','bachillerato','{1,2}','Connecteurs logiques','["cependant","neanmoins","toutefois","pourtant","donc","ainsi","par consequent","en revanche","bien que","quoique","afin de","puisque"]'),
('frances','bachillerato','{1,2}','Vocabulaire académique','["analyser","evaluer","argumenter","conclure","demontrer","hypothese","synthese","problematique","these","antithese","bibliographie","dissertation"]'),
('frances','bachillerato','{1,2}','Culture française','["baguette","croissant","beret","fromage","vin","cathedrale","musee","revolution","republique","philosophie","gastronomie","patrimoine"]'),
('frances','bachillerato','{1,2}','Littérature française','["moliere","voltaire","hugo","balzac","flaubert","zola","proust","camus","sartre","beauvoir","baudelaire","rimbaud"]'),
('frances','bachillerato','{1,2}','Environnement','["pollution","recyclage","durable","biodiversite","ecologie","emissions","renouvelable","deforestation","climat","serre","ressources","conservation"]'),
('frances','bachillerato','{1,2}','Médias et communication','["journal","television","radio","reseau","numerique","information","publicite","redaction","chronique","editorial","reportage","interview"]'),
('frances','bachillerato','{1,2}','Vie quotidienne','["logement","transport","alimentation","sante","emploi","loisirs","education","famille","quartier","voisinage","quotidien","routine"]'),
('frances','bachillerato','{1,2}','Sentiments et émotions','["joie","tristesse","colere","peur","surprise","deception","enthousiasme","inquietude","soulagement","nostalgie","admiration","mepris"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — frances
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('frances','bachillerato','{1,2}','Connecteurs d opposition','["cependant","neanmoins","toutefois","pourtant"]','["donc","ainsi"]'),
('frances','bachillerato','{1,2}','Temps du passé','["imparfait","passe compose","plus-que-parfait","passe simple"]','["futur simple","conditionnel"]'),
('frances','bachillerato','{1,2}','Auteurs du XIXe siècle','["hugo","balzac","flaubert","zola"]','["moliere","voltaire"]'),
('frances','bachillerato','{1,2}','Pronoms relatifs','["qui","que","dont","lequel"]','["mais","donc"]'),
('frances','bachillerato','{1,2}','Expressions de cause','["parce que","puisque","car","etant donne que"]','["bien que","quoique"]'),
('frances','bachillerato','{1,2}','Monuments parisiens','["Tour Eiffel","Louvre","Notre-Dame","Arc de Triomphe"]','["Colisee","Big Ben"]'),
('frances','bachillerato','{1,2}','Registre soutenu','["neanmoins","en outre","par ailleurs","en revanche"]','["super","genial"]'),
('frances','bachillerato','{1,2}','Genres littéraires','["roman","poesie","theatre","nouvelle"]','["equation","theoreme"]'),
('frances','bachillerato','{1,2}','Subjonctif après','["il faut que","bien que","pour que","avant que"]','["parce que","pendant que"]'),
('frances','bachillerato','{1,2}','Fromages français','["camembert","roquefort","brie","comte"]','["manchego","gouda"]');

-- ---------------------------------------------------------------------------
-- parejas_items — frances
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('frances','bachillerato','{1,2}','Cependant','Sin embargo'),
('frances','bachillerato','{1,2}','Donc','Por lo tanto'),
('frances','bachillerato','{1,2}','En outre','Además'),
('frances','bachillerato','{1,2}','Bien que','Aunque'),
('frances','bachillerato','{1,2}','Afin de','Con el fin de'),
('frances','bachillerato','{1,2}','Puisque','Ya que'),
('frances','bachillerato','{1,2}','Malgré','A pesar de'),
('frances','bachillerato','{1,2}','Auparavant','Anteriormente'),
('frances','bachillerato','{1,2}','Désormais','De ahora en adelante'),
('frances','bachillerato','{1,2}','Néanmoins','No obstante'),
('frances','bachillerato','{1,2}','Molière','Le Malade imaginaire'),
('frances','bachillerato','{1,2}','Victor Hugo','Les Misérables'),
('frances','bachillerato','{1,2}','Albert Camus','L Étranger'),
('frances','bachillerato','{1,2}','Gustave Flaubert','Madame Bovary'),
('frances','bachillerato','{1,2}','Émile Zola','Germinal'),
('frances','bachillerato','{1,2}','Voltaire','Candide'),
('frances','bachillerato','{1,2}','Balzac','La Comédie humaine'),
('frances','bachillerato','{1,2}','Baudelaire','Les Fleurs du mal'),
('frances','bachillerato','{1,2}','Rimbaud','Le Bateau ivre'),
('frances','bachillerato','{1,2}','Proust','À la recherche du temps perdu');

-- ---------------------------------------------------------------------------
-- ordena_frases — frances
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('frances','bachillerato','{1,2}','Si j avais su que le musée était fermé je ne serais pas venu jusqu ici'),
('frances','bachillerato','{1,2}','Bien que la situation soit difficile nous devons continuer à travailler ensemble pour trouver une solution'),
('frances','bachillerato','{1,2}','Il est essentiel que les jeunes comprennent l importance de protéger l environnement pour les générations futures'),
('frances','bachillerato','{1,2}','Le professeur a demandé aux étudiants de rédiger une dissertation sur les causes de la Révolution française'),
('frances','bachillerato','{1,2}','Non seulement elle parle couramment trois langues mais elle maîtrise également le langage des signes'),
('frances','bachillerato','{1,2}','Les nouvelles technologies ont considérablement transformé notre façon de communiquer et de travailler au quotidien'),
('frances','bachillerato','{1,2}','Après avoir terminé ses études de médecine elle a décidé de partir travailler dans un pays en développement'),
('frances','bachillerato','{1,2}','Il faudrait que le gouvernement investisse davantage dans les énergies renouvelables pour réduire la pollution atmosphérique'),
('frances','bachillerato','{1,2}','Cet auteur dont les romans sont traduits dans le monde entier a reçu le prix Nobel de littérature'),
('frances','bachillerato','{1,2}','Malgré les progrès scientifiques de nombreuses maladies restent encore sans traitement efficace à ce jour'),
('frances','bachillerato','{1,2}','La mondialisation a permis un échange culturel sans précédent entre les peuples du monde entier'),
('frances','bachillerato','{1,2}','Quoique les résultats soient encourageants il reste encore beaucoup de travail à accomplir dans ce domaine'),
('frances','bachillerato','{1,2}','Le réchauffement climatique constitue l un des plus grands défis auxquels l humanité doit faire face aujourd hui'),
('frances','bachillerato','{1,2}','Il est indispensable que chaque citoyen participe activement à la vie démocratique de son pays et de sa communauté'),
('frances','bachillerato','{1,2}','Victor Hugo a écrit Les Misérables pour dénoncer les injustices sociales de la France du dix-neuvième siècle');

-- ---------------------------------------------------------------------------
-- ordena_historias — frances
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('frances','bachillerato','{1,2}','["Marie a toujours rêvé de devenir médecin depuis son enfance.","Elle a étudié avec acharnement pendant six années à la faculté de médecine.","Après avoir obtenu son diplôme elle a effectué un stage dans un hôpital parisien.","Elle a ensuite décidé de rejoindre une organisation humanitaire en Afrique.","Aujourd hui elle dirige un centre de santé et aide des milliers de patients chaque année."]'),
('frances','bachillerato','{1,2}','["La Révolution française a commencé en 1789 avec la prise de la Bastille.","Le peuple réclamait l égalité des droits et la fin des privilèges de la noblesse.","La Déclaration des droits de l homme et du citoyen a été adoptée la même année.","La monarchie a été abolie et la République a été proclamée en 1792.","Cette période a profondément transformé la société française et influencé le monde entier."]'),
('frances','bachillerato','{1,2}','["Un groupe de chercheurs a découvert une nouvelle espèce de poisson dans l océan Pacifique.","Ils ont collecté des échantillons pour les analyser dans leur laboratoire.","Les tests génétiques ont révélé que cette espèce était totalement inconnue de la science.","La découverte a été publiée dans une revue scientifique de renommée internationale.","De nouvelles expéditions sont prévues pour explorer davantage les fonds marins de cette région."]'),
('frances','bachillerato','{1,2}','["Le changement climatique provoque une hausse alarmante du niveau des mers.","Les îles du Pacifique sont particulièrement menacées par les inondations.","Les organisations internationales demandent des mesures urgentes pour réduire les émissions.","Plusieurs pays se sont engagés à atteindre la neutralité carbone d ici 2050.","Cependant les critiques estiment que les efforts actuels sont encore insuffisants."]'),
('frances','bachillerato','{1,2}','["Victor Hugo a écrit Les Misérables pendant son exil politique à Guernesey.","Le roman raconte l histoire de Jean Valjean un ancien forçat en quête de rédemption.","L oeuvre dénonce les injustices sociales et la misère du peuple français au XIXe siècle.","Le livre a connu un succès immédiat et a été traduit dans de nombreuses langues.","Aujourd hui Les Misérables reste l un des romans les plus lus et adaptés au monde."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — frances
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('frances','bachillerato','{1,2}','Si j aurais su la vérité je n aurais jamais accepté cette proposition de travail'),
('frances','bachillerato','{1,2}','Malgré que le temps est beau nous avons décidé de rester à la maison tout le weekend'),
('frances','bachillerato','{1,2}','Il faut que tu vas chez le médecin avant que la situation ne devienne plus grave'),
('frances','bachillerato','{1,2}','Après que nous avions mangé nous sommes sortis nous promener dans le parc du quartier'),
('frances','bachillerato','{1,2}','Les informations que je t ai parlé hier sont très importants pour notre projet final'),
('frances','bachillerato','{1,2}','C est le professeur que les étudiants préfèrent le plus car il explique très bon'),
('frances','bachillerato','{1,2}','Bien que il pleut beaucoup les enfants jouent dehors dans le jardin sans parapluie'),
('frances','bachillerato','{1,2}','Elle a dit qu elle veut partir demain mais je pense pas que c est une bonne idée'),
('frances','bachillerato','{1,2}','Aucun des étudiants n ont réussi à résoudre le problème de mathématiques qui était proposé'),
('frances','bachillerato','{1,2}','La fille que je te parle souvent est la soeur de mon meilleur ami depuis l enfance'),
('frances','bachillerato','{1,2}','Nous sommes allés au cinéma pour voir le film que tout le monde en parle beaucoup'),
('frances','bachillerato','{1,2}','Il est important que les enfants apprennent à lire le plus tôt que possible dès le jeune age');

-- ---------------------------------------------------------------------------
-- comprension_texts — frances
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('frances','bachillerato','{1,2}','L importance de la francophonie',
'La francophonie désigne l ensemble des pays et des communautés qui partagent l usage de la langue française. Avec plus de 300 millions de locuteurs répartis sur les cinq continents, le français est la cinquième langue la plus parlée au monde. L Organisation internationale de la Francophonie, fondée en 1970, regroupe 88 États et gouvernements qui coopèrent dans les domaines de l éducation, de la culture, de la science et du développement durable. La langue française joue un rôle fondamental dans la diplomatie internationale, étant l une des langues officielles de l ONU, de l Union européenne et de nombreuses organisations internationales. En Afrique, le français connaît une croissance démographique remarquable et pourrait devenir d ici 2050 l une des langues les plus parlées au monde grâce à la jeunesse de la population africaine. La francophonie ne se réduit pas à une question linguistique : elle représente un espace de diversité culturelle, de dialogue entre les civilisations et de promotion des valeurs démocratiques et des droits de l homme.',
'[{"pregunta":"Combien de locuteurs parlent français dans le monde ?","opciones":["100 millions","200 millions","Plus de 300 millions","500 millions"],"correcta":2},{"pregunta":"Quand a été fondée l Organisation internationale de la Francophonie ?","opciones":["1950","1960","1970","1980"],"correcta":2},{"pregunta":"Où le français connaît-il une forte croissance démographique ?","opciones":["En Asie","En Amérique","En Afrique","En Océanie"],"correcta":2},{"pregunta":"Selon le texte, que représente la francophonie au-delà de la langue ?","opciones":["Un espace économique uniquement","Un espace de diversité culturelle et dialogue","Une organisation militaire","Un réseau commercial"],"correcta":1}]'),
('frances','bachillerato','{1,2}','Victor Hugo et l engagement social',
'Victor Hugo (1802-1885) est considéré comme l un des plus grands écrivains de la littérature française. Son oeuvre immense comprend des romans, de la poésie, du théâtre et des essais politiques. Les Misérables, publié en 1862, est sans doute son roman le plus célèbre. À travers les personnages de Jean Valjean, Cosette et Javert, Hugo dénonce la misère, l injustice sociale et un système judiciaire impitoyable. Notre-Dame de Paris, publié en 1831, a contribué à sauver la cathédrale de la destruction en attirant l attention du public sur son état de délabrement. Hugo n était pas seulement un écrivain : c était aussi un homme politique engagé qui a lutté contre la peine de mort, défendu l éducation gratuite et obligatoire, et combattu la tyrannie. Exilé pendant dix-neuf ans sous le Second Empire de Napoléon III, il a continué à écrire et à résister depuis les îles anglo-normandes. À sa mort en 1885, deux millions de personnes ont assisté à ses funérailles nationales à Paris, témoignant de l immense respect que lui portait le peuple français.',
'[{"pregunta":"Quel roman de Hugo dénonce l injustice sociale ?","opciones":["Notre-Dame de Paris","Les Contemplations","Les Misérables","Hernani"],"correcta":2},{"pregunta":"Combien de temps Hugo a-t-il été exilé ?","opciones":["Cinq ans","Dix ans","Dix-neuf ans","Vingt-cinq ans"],"correcta":2},{"pregunta":"Contre quoi Hugo a-t-il lutté ?","opciones":["La liberté de la presse","La peine de mort","L éducation obligatoire","La République"],"correcta":1},{"pregunta":"Combien de personnes ont assisté à ses funérailles ?","opciones":["Cent mille","Un million","Deux millions","Cinq millions"],"correcta":2}]'),
('frances','bachillerato','{1,2}','Le défi du changement climatique',
'Le changement climatique constitue l un des défis les plus urgents auxquels l humanité doit faire face au XXIe siècle. Les scientifiques du GIEC ont confirmé que les activités humaines, en particulier la combustion de combustibles fossiles et la déforestation, sont les principales causes du réchauffement global. Les conséquences sont déjà visibles : hausse des températures, fonte des glaciers, élévation du niveau de la mer, multiplication des événements météorologiques extrêmes et perte de biodiversité. L Accord de Paris, signé en 2015 par 196 pays, fixe l objectif de limiter le réchauffement à 1,5 degré Celsius par rapport à l ère préindustrielle. Pour atteindre cet objectif, il est indispensable de réduire drastiquement les émissions de gaz à effet de serre, de développer les énergies renouvelables et de transformer nos modes de production et de consommation. Les jeunes générations, inspirées par des mouvements comme Fridays for Future, jouent un rôle croissant dans la mobilisation citoyenne pour le climat. La transition écologique représente non seulement un impératif environnemental mais aussi une opportunité économique et sociale.',
'[{"pregunta":"Quelle est la principale cause du réchauffement global selon le texte ?","opciones":["Les catastrophes naturelles","Les activités humaines","Les cycles solaires","La rotation de la Terre"],"correcta":1},{"pregunta":"Quel objectif fixe l Accord de Paris ?","opciones":["Éliminer toute pollution","Limiter le réchauffement à 1,5 °C","Interdire les voitures","Planter un milliard d arbres"],"correcta":1},{"pregunta":"Quel mouvement de jeunes est mentionné ?","opciones":["Greenpeace","WWF","Fridays for Future","Extinction Rebellion"],"correcta":2},{"pregunta":"Que représente la transition écologique selon le texte ?","opciones":["Un coût inutile","Une menace économique","Un impératif et une opportunité","Une mode passagère"],"correcta":2}]');


-- #############################################################################
-- VALENCIANO (1º y 2º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Figura retòrica que consisteix en la repetició d una mateixa estructura sintàctica','anafora','valenciano','bachillerato','{1,2}',2),
('B','empieza','Moviment cultural del segle XV que va transformar la literatura i les arts valencianes','barroc','valenciano','bachillerato','{1,2}',2),
('C','empieza','Gènere literari en prosa que narra fets ficticis o reals de manera extensa','cronica','valenciano','bachillerato','{1,2}',1),
('D','empieza','Modalitat de text en què dos o més personatges intercanvien paraules','dialeg','valenciano','bachillerato','{1,2}',1),
('E','empieza','Figura retòrica que suavitza una expressió per evitar paraules desagradables','eufemisme','valenciano','bachillerato','{1,2}',2),
('F','empieza','Autor del Tirant lo Blanc considerat la gran novel·la del segle XV','ferrer','valenciano','bachillerato','{1,2}',2),
('G','empieza','Estudi de les regles i estructura d una llengua','gramatica','valenciano','bachillerato','{1,2}',1),
('H','empieza','Figura retòrica que consisteix en una exageració expressiva','hiperbole','valenciano','bachillerato','{1,2}',1),
('I','empieza','Figura retòrica que consisteix en dir el contrari del que es pensa','ironia','valenciano','bachillerato','{1,2}',1),
('J','empieza','Poeta medieval autor d obres com Lo Somni i altres poemes','jordi','valenciano','bachillerato','{1,2}',3),
('K','contiene','Paraula d origen àrab que designa un tipus de mercat tradicional','souk','valenciano','bachillerato','{1,2}',3),
('L','empieza','Gènere literari que inclou poesia narrativa i cançons populars','lirica','valenciano','bachillerato','{1,2}',1),
('M','empieza','Figura retòrica que estableix una relació d identificació entre dos termes','metafora','valenciano','bachillerato','{1,2}',1),
('N','empieza','Text literari breu en prosa que relata fets ficticis amb pocs personatges','narrativa','valenciano','bachillerato','{1,2}',1),
('O','empieza','Escriptura correcta de les paraules d una llengua segons les normes establertes','ortografia','valenciano','bachillerato','{1,2}',1),
('P','empieza','Conjunt de regles que regulen la formació i ús de les paraules en una oració','predicat','valenciano','bachillerato','{1,2}',2),
('Q','contiene','Paraula que designa la manera com s expressen els sentiments en un text','eloquencia','valenciano','bachillerato','{1,2}',3),
('R','empieza','Moviment literari del segle XIX que valora el sentiment i la llibertat creativa','romanticisme','valenciano','bachillerato','{1,2}',1),
('S','empieza','Unitat mínima de significat que forma part d una paraula','sil·laba','valenciano','bachillerato','{1,2}',1),
('T','empieza','Gènere literari destinat a la representació escènica amb actors','teatre','valenciano','bachillerato','{1,2}',1),
('U','contiene','Forma verbal que expressa una acció o estat sense concretar el subjecte','subjuntiu','valenciano','bachillerato','{1,2}',2),
('V','empieza','Conjunt de paraules que posseeix un parlant o una llengua','vocabulari','valenciano','bachillerato','{1,2}',1),
('W','contiene','Paraula anglesa que designa un seminari o taller de treball creatiu','workshop','valenciano','bachillerato','{1,2}',3),
('X','empieza','Forma abreujada del pronom personal que s usa en posició proclítica','xicotet','valenciano','bachillerato','{1,2}',3),
('Y','contiene','Paraula que fa referència a un estil propi de cada autor o època literària','estil','valenciano','bachillerato','{1,2}',2),
('Z','contiene','Paraula que designa una composició musical i poètica de tradició popular','cançoneta','valenciano','bachillerato','{1,2}',2);

-- ---------------------------------------------------------------------------
-- runner_categories — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('valenciano','bachillerato','{1,2}','Figures retòriques','["metafora","hiperbole","anafora","ironia","metonimia","personificacio","comparacio","antitesi","paradoxa","sinestesia","al·literacio","elipsi"]'),
('valenciano','bachillerato','{1,2}','Autors valencians','["ausiasmarch","joanotmartorell","isabelclarasimo","roigdevela","joanfuster","enricvalor","vicentsalvador","teodorlllorente","renardelpuig","carlesrecio","jesusmoratallon","joseppiera"]'),
('valenciano','bachillerato','{1,2}','Gèneres literaris','["novel·la","poesia","teatre","assaig","cronica","epica","lirica","conte","faula","elegia","oda","sonet"]'),
('valenciano','bachillerato','{1,2}','Connectors textuals','["tanmateix","nogensmenys","aiximateix","percontractant","encanvi","daltraband","perconseguent","totiseguit","endefinitiva","enresum","ames","perdavant"]'),
('valenciano','bachillerato','{1,2}','Moviments literaris','["romanticisme","renaixenca","modernisme","noucentisme","avantguardes","realisme","naturalisme","simbolisme","barroc","classicisme","existencialisme","postmodernisme"]'),
('valenciano','bachillerato','{1,2}','Vocabulari acadèmic','["tesi","hipotesi","argument","conclusio","analisi","sintesi","objectiu","metodologia","referencia","citacio","paragraf","glossari"]'),
('valenciano','bachillerato','{1,2}','Tipologies textuals','["narratiu","descriptiu","argumentatiu","expositiu","instructiu","conversacional","predictiu","retoric","epistolar","periodistic","publicitari","juridic"]'),
('valenciano','bachillerato','{1,2}','Obra Tirant lo Blanc','["tirant","carmesina","plaerdemavida","diafebus","emperador","princesa","batalla","cavaller","constantinoble","honor","amor","aventura"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('valenciano','bachillerato','{1,2}','Figures retòriques de semblança','["metafora","comparacio","al·legoria","simbol"]','["anafora","elipsi"]'),
('valenciano','bachillerato','{1,2}','Autors del Segle d Or','["ausias march","joanot martorell","roig de corella","sor isabel de villena"]','["joan fuster","enric valor"]'),
('valenciano','bachillerato','{1,2}','Gèneres narratius','["novel·la","conte","llegenda","cronica"]','["oda","sonet"]'),
('valenciano','bachillerato','{1,2}','Connectors de contrast','["tanmateix","nogensmenys","en canvi","per contra"]','["a mes","aixi mateix"]'),
('valenciano','bachillerato','{1,2}','Obres de la Renaixença','["canigou","oda a la patria","els jocs florals","l atlantida"]','["tirant lo blanc","lo somni"]'),
('valenciano','bachillerato','{1,2}','Parts de l oració','["substantiu","verb","adjectiu","adverbi"]','["paragraf","capitol"]'),
('valenciano','bachillerato','{1,2}','Tipus de text argumentatiu','["tesi","argument","contraargument","conclusio"]','["descripcio","narracio"]'),
('valenciano','bachillerato','{1,2}','Moviments del segle XX','["avantguardes","noucentisme","postmodernisme","existencialisme"]','["renaixenca","barroc"]'),
('valenciano','bachillerato','{1,2}','Personatges del Tirant lo Blanc','["tirant","carmesina","plaerdemavida","diafebus"]','["don quixot","sancho panza"]'),
('valenciano','bachillerato','{1,2}','Pronoms febles valencians','["em","et","es","en"]','["pero","sino"]');

-- ---------------------------------------------------------------------------
-- parejas_items — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('valenciano','bachillerato','{1,2}','Metàfora','Identificació entre dos termes'),
('valenciano','bachillerato','{1,2}','Hipèrbole','Exageració expressiva'),
('valenciano','bachillerato','{1,2}','Ironia','Dir el contrari del que es pensa'),
('valenciano','bachillerato','{1,2}','Anàfora','Repetició a l inici de versos'),
('valenciano','bachillerato','{1,2}','Antítesi','Contraposició de termes oposats'),
('valenciano','bachillerato','{1,2}','Ausiàs March','Poesia medieval valenciana'),
('valenciano','bachillerato','{1,2}','Joanot Martorell','Tirant lo Blanc'),
('valenciano','bachillerato','{1,2}','Joan Fuster','Assaig contemporani valencià'),
('valenciano','bachillerato','{1,2}','Enric Valor','Narrativa i rondalles valencianes'),
('valenciano','bachillerato','{1,2}','Renaixença','Recuperació cultural segle XIX'),
('valenciano','bachillerato','{1,2}','Noucentisme','Classicisme i ordre estètic'),
('valenciano','bachillerato','{1,2}','Tanmateix','No obstant això'),
('valenciano','bachillerato','{1,2}','Per consegüent','Com a resultat'),
('valenciano','bachillerato','{1,2}','D altra banda','Per altra part'),
('valenciano','bachillerato','{1,2}','En definitiva','En conclusió'),
('valenciano','bachillerato','{1,2}','Novel·la','Narració extensa en prosa'),
('valenciano','bachillerato','{1,2}','Sonet','Poema de catorze versos'),
('valenciano','bachillerato','{1,2}','Assaig','Text argumentatiu de reflexió'),
('valenciano','bachillerato','{1,2}','Crònica','Narració de fets històrics'),
('valenciano','bachillerato','{1,2}','Teodor Llorente','Poeta de la Renaixença valenciana');

-- ---------------------------------------------------------------------------
-- ordena_frases — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('valenciano','bachillerato','{1,2}','Ausiàs March és considerat el poeta més important de la literatura medieval catalana i valenciana'),
('valenciano','bachillerato','{1,2}','El Tirant lo Blanc és una novel·la cavalleresca escrita per Joanot Martorell al segle quinze'),
('valenciano','bachillerato','{1,2}','La Renaixença va ser un moviment cultural que va recuperar l ús literari de la llengua valenciana'),
('valenciano','bachillerato','{1,2}','Les figures retòriques són recursos expressius que enriqueixen el significat i la bellesa dels textos literaris'),
('valenciano','bachillerato','{1,2}','Un comentari de text ha d incloure una anàlisi del contingut de l estructura i dels recursos estilístics'),
('valenciano','bachillerato','{1,2}','Joan Fuster va ser un assagista fonamental per a la reflexió sobre la identitat valenciana contemporània'),
('valenciano','bachillerato','{1,2}','La literatura valenciana del segle vint va experimentar una renovació profunda amb les avantguardes literàries'),
('valenciano','bachillerato','{1,2}','Els connectors textuals són elements lingüístics que asseguren la cohesió i la coherència del discurs escrit'),
('valenciano','bachillerato','{1,2}','El text argumentatiu té com a objectiu convéncer el lector mitjançant raons i arguments ben fonamentats'),
('valenciano','bachillerato','{1,2}','Enric Valor va contribuir a la normalització del valencià a través de la seua obra narrativa i gramatical'),
('valenciano','bachillerato','{1,2}','La poesia d Ausiàs March expressa els sentiments amb una sinceritat i profunditat que la fan única i universal'),
('valenciano','bachillerato','{1,2}','L ortografia valenciana segueix les normes de Castelló aprovades el mil nou-cents trenta-dos com a referència'),
('valenciano','bachillerato','{1,2}','El teatre valencià contemporani ha viscut un renaixement gràcies a companyies i autors compromesos amb la llengua'),
('valenciano','bachillerato','{1,2}','La cohesió textual s aconsegueix mitjançant l ús adequat de pronoms connectors i mecanismes de referència interna'),
('valenciano','bachillerato','{1,2}','La narrativa valenciana actual aborda temes universals com la identitat la memòria històrica i la modernitat');

-- ---------------------------------------------------------------------------
-- ordena_historias — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('valenciano','bachillerato','{1,2}','["Ausiàs March va nàixer a Gandia al voltant de l any 1397.","Va participar en les campanyes militars del rei Alfons el Magnànim al Mediterrani.","La seua poesia trenca amb la tradició trobadoresca i s expressa en un registre personal i sincer.","Els seus poemes exploren temes com l amor el dolor i la recerca de la veritat interior.","Ausiàs March és reconegut com el gran poeta de la literatura medieval en llengua catalana."]'),
('valenciano','bachillerato','{1,2}','["Joanot Martorell va començar a escriure el Tirant lo Blanc cap al 1460.","La novel·la narra les aventures del cavaller Tirant que lluita per defensar l Imperi Bizantí.","A diferència d altres novel·les cavalleresques el Tirant presenta personatges realistes i humans.","Martorell va morir abans de veure publicada la seua obra que va ser editada per Martí Joan de Galba.","El Tirant lo Blanc és considerat una de les millors novel·les de la literatura universal."]'),
('valenciano','bachillerato','{1,2}','["La Renaixença valenciana va començar a mitjan segle XIX amb la recuperació dels Jocs Florals.","Teodor Llorente va ser un dels poetes més destacats d aquest moviment de recuperació cultural.","Els escriptors reivindicaven l ús literari del valencià en una societat cada vegada més castellanitzada.","El moviment va impulsar la creació de revistes periòdics i associacions culturals en llengua valenciana.","La Renaixença va establir les bases per al posterior desenvolupament de la literatura valenciana contemporània."]'),
('valenciano','bachillerato','{1,2}','["Joan Fuster va nàixer a Sueca el 1922 i va estudiar Dret a la Universitat de València.","Des de molt jove es va dedicar a l assaig la crítica literària i el periodisme.","La seua obra Nosaltres els valencians publicada el 1962 va generar un gran debat social.","Fuster va defensar la unitat de la llengua catalana i la necessitat de normalitzar-la.","La seua influència intel·lectual ha marcat profundament el pensament valencià contemporani."]'),
('valenciano','bachillerato','{1,2}','["Enric Valor va recollir i adaptar les rondalles populars valencianes durant dècades.","La seua labor va contribuir a preservar el patrimoni oral del territori valencià.","A més va escriure novel·les i obres gramaticals de referència per a la llengua valenciana.","La seua gramàtica normativa va ajudar a fixar l estàndard escrit del valencià.","Enric Valor és recordat com un dels grans defensors de la cultura i la llengua valencianes."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('valenciano','bachillerato','{1,2}','Ausiàs March va escriure el Tirant lo Blanc una de les novel·les cavalleresques més importants del segle quinze'),
('valenciano','bachillerato','{1,2}','La Renaixença valenciana va començar al segle divuit amb la publicació de les primeres gramàtiques'),
('valenciano','bachillerato','{1,2}','Joan Fuster va nàixer a València i va ser un gran poeta que va escriure versos en castellà'),
('valenciano','bachillerato','{1,2}','El sonet és una composició poètica formada per dotze versos distribuïts en tres estrofes'),
('valenciano','bachillerato','{1,2}','La metàfora és una figura retòrica que consisteix a exagerar les qualitats d un objecte'),
('valenciano','bachillerato','{1,2}','Joanot Martorell va escriure tota la seua obra literària durant el segle dènou a Barcelona'),
('valenciano','bachillerato','{1,2}','L anàfora consisteix en la repetició d una paraula al final de cada vers o oració del poema'),
('valenciano','bachillerato','{1,2}','Enric Valor és conegut principalment per la seua obra teatral i les seues comèdies en prosa'),
('valenciano','bachillerato','{1,2}','El text expositiu té com a objectiu principal convéncer el lector mitjançant arguments subjectius'),
('valenciano','bachillerato','{1,2}','Les Normes de Castelló van ser aprovades l any mil nou-cents cinquanta per regular l ortografia valenciana'),
('valenciano','bachillerato','{1,2}','La ironia és una figura retòrica que estableix una comparació directa entre dos elements usant com'),
('valenciano','bachillerato','{1,2}','Teodor Llorente va ser el principal representant del Modernisme literari al País Valencià durant el segle vint');

-- ---------------------------------------------------------------------------
-- comprension_texts — valenciano
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('valenciano','bachillerato','{1,2}','El Tirant lo Blanc i la novel·la cavalleresca',
'El Tirant lo Blanc, escrit per Joanot Martorell i publicat el 1490, és considerat una de les obres cabdals de la literatura universal. A diferència d altres novel·les cavalleresques de l època, el Tirant destaca pel seu realisme: els personatges mengen, dormen, es feren en batalla i moren de manera versemblant. El protagonista, Tirant lo Blanc, és un cavaller bretó que viatja per Europa i el Mediterrani fins a arribar a Constantinoble, on lluitarà per defensar l Imperi Bizantí contra els turcs. La novel·la combina hàbilment elements d aventura, amor, humor i estratègia militar. El personatge de Plaerdemavida afig un component còmic i transgressor que era molt innovador per a l època. Miguel de Cervantes, en el Quixot, va salvar el Tirant de la foguera dient que era el millor llibre del món en el seu gènere. L obra va ser escrita originalment en valencià i representa el punt culminant de la prosa literària del Segle d Or valencià.',
'[{"pregunta":"Quin any es va publicar el Tirant lo Blanc?","opciones":["1460","1475","1490","1500"],"correcta":2},{"pregunta":"Què diferencia el Tirant d altres novel·les cavalleresques?","opciones":["La seua extensió","El seu realisme","L ús del llatí","L absència d amor"],"correcta":1},{"pregunta":"Quin autor va elogiar el Tirant en la seua obra?","opciones":["Ausiàs March","Joan Fuster","Miguel de Cervantes","Dante Alighieri"],"correcta":2},{"pregunta":"Quin personatge aporta l element còmic?","opciones":["Tirant","Carmesina","Plaerdemavida","Diafebus"],"correcta":2}]'),
('valenciano','bachillerato','{1,2}','Joan Fuster i l assaig valencià',
'Joan Fuster (Sueca, 1922 - 1992) és una de les figures intel·lectuals més rellevants de la cultura valenciana contemporània. Format en Dret a la Universitat de València, aviat va abandonar l exercici de l advocacia per dedicar-se plenament a l escriptura. La seua obra més coneguda, Nosaltres, els valencians (1962), és un assaig fonamental on analitza la identitat del poble valencià, la seua història i les seues contradiccions. Fuster defensava la unitat lingüística del català i la necessitat de normalitzar l ús social de la llengua. El seu pensament va generar un debat intens que encara perdura en la societat valenciana. A més de l assaig, Fuster va cultivar la crítica literària, el periodisme i els aforismes, sempre amb un estil lúcid, irònic i provocador. Va rebre nombrosos premis i reconeixements, i la seua casa de Sueca es va convertir en un centre de referència intel·lectual. Joan Fuster és considerat el pare de l assaig modern en llengua catalana al País Valencià.',
'[{"pregunta":"On va nàixer Joan Fuster?","opciones":["València","Gandia","Sueca","Castelló"],"correcta":2},{"pregunta":"Quina és la seua obra més coneguda?","opciones":["El Tirant lo Blanc","Nosaltres, els valencians","Les rondalles valencianes","La poesia d Ausiàs March"],"correcta":1},{"pregunta":"Quin estil caracteritza l escriptura de Fuster?","opciones":["Romàntic i sentimental","Lúcid irònic i provocador","Formal i acadèmic","Épic i grandiloqüent"],"correcta":1},{"pregunta":"Què defensava Fuster respecte a la llengua?","opciones":["La separació del valencià i el català","La unitat lingüística del català","L ús exclusiu del castellà","La creació d una nova llengua"],"correcta":1}]'),
('valenciano','bachillerato','{1,2}','La Renaixença al País Valencià',
'La Renaixença va ser un moviment cultural que va sorgir a mitjan segle XIX amb l objectiu de recuperar l ús literari i social de la llengua catalana en els territoris de parla catalana. Al País Valencià, el moviment va estar vinculat a la restauració dels Jocs Florals, certàmens poètics que premiaven les millors composicions en llengua valenciana. Teodor Llorente va ser el poeta més representatiu de la Renaixença valenciana. Les seues obres celebraven la bellesa del paisatge valencià, les tradicions populars i la història del territori. Constantí Llombart va ser un altre escriptor fonamental que va impulsar la creació de revistes i associacions culturals en valencià. Malgrat la seua importància, la Renaixença valenciana va ser un moviment predominantment literari que no va aconseguir una normalització social completa de la llengua. L ús del valencià es va mantenir principalment en l àmbit rural i domèstic, mentre que el castellà dominava l administració, l educació i les classes benestants. Tot i això, la Renaixença va establir les bases per al posterior desenvolupament del valencianisme cultural i polític del segle vint.',
'[{"pregunta":"Quin era l objectiu principal de la Renaixença?","opciones":["Crear una nova llengua","Recuperar l ús literari del valencià","Traduir obres del castellà","Abolir els Jocs Florals"],"correcta":1},{"pregunta":"Qui va ser el poeta més representatiu de la Renaixença valenciana?","opciones":["Ausiàs March","Joan Fuster","Teodor Llorente","Enric Valor"],"correcta":2},{"pregunta":"Quina limitació va tindre la Renaixença valenciana?","opciones":["No va produir cap obra rellevant","Va ser només un moviment literari","Va durar pocs anys","Va rebutjar la tradició"],"correcta":1},{"pregunta":"Qui va impulsar revistes i associacions culturals en valencià?","opciones":["Joanot Martorell","Constantí Llombart","Miguel de Cervantes","Enric Valor"],"correcta":1}]');


-- #############################################################################
-- LITERATURA UNIVERSAL (1º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Poema narrativo griego atribuido a Homero que narra la cólera de Aquiles','iliada','literatura-universal','bachillerato','{1}',1),
('B','empieza','Poeta francés autor de Las flores del mal y máximo representante del simbolismo','baudelaire','literatura-universal','bachillerato','{1}',1),
('C','empieza','Escritor checo autor de La metamorfosis y El proceso','kafka','literatura-universal','bachillerato','{1}',1),
('D','empieza','Autor italiano de la Divina Comedia obra cumbre de la literatura medieval','dante','literatura-universal','bachillerato','{1}',1),
('E','empieza','Período literario del siglo XVIII caracterizado por la razón y el progreso','ilustracion','literatura-universal','bachillerato','{1}',1),
('F','empieza','Novelista francés autor de Madame Bovary obra maestra del realismo','flaubert','literatura-universal','bachillerato','{1}',1),
('G','empieza','Escritor alemán autor de Fausto y Las cuitas del joven Werther','goethe','literatura-universal','bachillerato','{1}',1),
('H','empieza','Dramaturgo noruego considerado padre del teatro moderno autor de Casa de muñecas','ibsen','literatura-universal','bachillerato','{1}',2),
('I','contiene','Recurso literario que consiste en expresar lo contrario de lo que se quiere decir','ironia','literatura-universal','bachillerato','{1}',1),
('J','empieza','Escritor irlandés autor de Ulises obra cumbre del modernismo literario','joyce','literatura-universal','bachillerato','{1}',2),
('K','empieza','Escritor checo autor de El castillo y América además de La metamorfosis','kafka','literatura-universal','bachillerato','{1}',1),
('L','contiene','Movimiento artístico del siglo XIX que reacciona contra el Romanticismo idealizante','realismo','literatura-universal','bachillerato','{1}',1),
('M','empieza','Escritor francés autor de En busca del tiempo perdido extensa novela en siete volúmenes','proust','literatura-universal','bachillerato','{1}',2),
('N','empieza','Género literario que relata hechos ficticios en prosa de forma extensa','novela','literatura-universal','bachillerato','{1}',1),
('O','empieza','Poema épico griego que narra el regreso de un héroe a Ítaca tras la guerra de Troya','odisea','literatura-universal','bachillerato','{1}',1),
('P','empieza','Obra de Boccaccio con cien relatos narrados por diez jóvenes durante la peste','decameron','literatura-universal','bachillerato','{1}',2),
('Q','contiene','Personaje de Shakespeare príncipe de Dinamarca que duda entre ser o no ser','hamlet','literatura-universal','bachillerato','{1}',1),
('R','empieza','Movimiento literario del siglo XIX que exalta los sentimientos y la libertad creativa','romanticismo','literatura-universal','bachillerato','{1}',1),
('S','empieza','Dramaturgo inglés autor de Hamlet Romeo y Julieta y Macbeth entre otras','shakespeare','literatura-universal','bachillerato','{1}',1),
('T','empieza','Escritor ruso autor de Guerra y Paz y Anna Karénina obras cumbre del realismo','tolstoi','literatura-universal','bachillerato','{1}',1),
('U','empieza','Novela de James Joyce que transcurre en un solo día en Dublín','ulises','literatura-universal','bachillerato','{1}',2),
('V','empieza','Movimientos artísticos de principios del siglo XX que rompieron con la tradición','vanguardias','literatura-universal','bachillerato','{1}',1),
('W','empieza','Escritora británica pionera del monólogo interior autora de La señora Dalloway','woolf','literatura-universal','bachillerato','{1}',2),
('X','contiene','Término que designa una narración breve de carácter alegórico o simbólico','texto','literatura-universal','bachillerato','{1}',3),
('Y','contiene','Poeta inglés romántico autor de Oda a una urna griega y Oda al otoño','keats','literatura-universal','bachillerato','{1}',3),
('Z','contiene','Escritor francés naturalista autor de Germinal y la serie de los Rougon-Macquart','zola','literatura-universal','bachillerato','{1}',2);

-- ---------------------------------------------------------------------------
-- runner_categories — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('literatura-universal','bachillerato','{1}','Autores grecolatinos','["homero","sofocles","euripides","esquilo","aristofanes","virgilio","ovidio","horacio","platon","aristoteles","safo","pindaro"]'),
('literatura-universal','bachillerato','{1}','Autores del Renacimiento','["dante","petrarca","boccaccio","shakespeare","cervantes","rabelais","montaigne","ariosto","maquiavelo","tomas moro","erasmo","garcilaso"]'),
('literatura-universal','bachillerato','{1}','Autores románticos','["goethe","byron","shelley","keats","hugo","leopardi","poe","heine","novalis","holderlin","pushkin","espronceda"]'),
('literatura-universal','bachillerato','{1}','Autores realistas','["balzac","flaubert","dickens","tolstoi","dostoievski","zola","stendhal","galdos","eliot","turguenev","chejov","maupassant"]'),
('literatura-universal','bachillerato','{1}','Autores del siglo XX','["kafka","joyce","proust","woolf","camus","beckett","faulkner","borges","marquez","hemingway","orwell","mann"]'),
('literatura-universal','bachillerato','{1}','Obras fundamentales','["iliada","odisea","eneida","divina comedia","decameron","hamlet","fausto","misérables","guerra y paz","metamorfosis","ulises","extranjero"]'),
('literatura-universal','bachillerato','{1}','Movimientos literarios','["clasicismo","renacimiento","barroco","ilustracion","romanticismo","realismo","naturalismo","simbolismo","modernismo","vanguardias","existencialismo","posmodernismo"]'),
('literatura-universal','bachillerato','{1}','Géneros y formas','["epopeya","tragedia","comedia","soneto","oda","elegia","novela","cuento","ensayo","drama","fabula","epistola"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('literatura-universal','bachillerato','{1}','Trágicos griegos','["Sófocles","Esquilo","Eurípides","Coéforas"]','["Aristófanes","Menandro"]'),
('literatura-universal','bachillerato','{1}','Obras de Shakespeare','["Hamlet","Macbeth","Otelo","El rey Lear"]','["Fausto","Werther"]'),
('literatura-universal','bachillerato','{1}','Autores del Realismo ruso','["Tolstoi","Dostoievski","Chéjov","Turguénev"]','["Byron","Shelley"]'),
('literatura-universal','bachillerato','{1}','Vanguardias del siglo XX','["surrealismo","dadaísmo","futurismo","expresionismo"]','["romanticismo","clasicismo"]'),
('literatura-universal','bachillerato','{1}','Novelas existencialistas','["El extranjero","La náusea","El ser y la nada","La peste"]','["Madame Bovary","Anna Karénina"]'),
('literatura-universal','bachillerato','{1}','Poetas románticos ingleses','["Byron","Shelley","Keats","Wordsworth"]','["Baudelaire","Rimbaud"]'),
('literatura-universal','bachillerato','{1}','Obras de la Antigüedad','["Ilíada","Odisea","Eneida","Edipo Rey"]','["Divina Comedia","Decamerón"]'),
('literatura-universal','bachillerato','{1}','Técnicas narrativas modernas','["monólogo interior","flujo de conciencia","narrador múltiple","fragmentación temporal"]','["rima consonante","octava real"]'),
('literatura-universal','bachillerato','{1}','Autores del boom latinoamericano','["García Márquez","Cortázar","Vargas Llosa","Fuentes"]','["Dickens","Flaubert"]'),
('literatura-universal','bachillerato','{1}','Obras de Dante','["Divina Comedia","Vita Nuova","De vulgari eloquentia","Convivio"]','["Canzoniere","Decamerón"]');

-- ---------------------------------------------------------------------------
-- parejas_items — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('literatura-universal','bachillerato','{1}','Homero','Ilíada y Odisea'),
('literatura-universal','bachillerato','{1}','Sófocles','Edipo Rey'),
('literatura-universal','bachillerato','{1}','Virgilio','Eneida'),
('literatura-universal','bachillerato','{1}','Dante','Divina Comedia'),
('literatura-universal','bachillerato','{1}','Boccaccio','Decamerón'),
('literatura-universal','bachillerato','{1}','Shakespeare','Hamlet'),
('literatura-universal','bachillerato','{1}','Goethe','Fausto'),
('literatura-universal','bachillerato','{1}','Flaubert','Madame Bovary'),
('literatura-universal','bachillerato','{1}','Tolstoi','Guerra y Paz'),
('literatura-universal','bachillerato','{1}','Dostoievski','Crimen y castigo'),
('literatura-universal','bachillerato','{1}','Kafka','La metamorfosis'),
('literatura-universal','bachillerato','{1}','Joyce','Ulises'),
('literatura-universal','bachillerato','{1}','Proust','En busca del tiempo perdido'),
('literatura-universal','bachillerato','{1}','Woolf','La señora Dalloway'),
('literatura-universal','bachillerato','{1}','Camus','El extranjero'),
('literatura-universal','bachillerato','{1}','Baudelaire','Las flores del mal'),
('literatura-universal','bachillerato','{1}','Zola','Germinal'),
('literatura-universal','bachillerato','{1}','Hugo','Los miserables'),
('literatura-universal','bachillerato','{1}','Ibsen','Casa de muñecas'),
('literatura-universal','bachillerato','{1}','Orwell','1984');

-- ---------------------------------------------------------------------------
-- ordena_frases — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('literatura-universal','bachillerato','{1}','La Ilíada de Homero narra los acontecimientos del último año de la guerra de Troya centrándose en la cólera de Aquiles'),
('literatura-universal','bachillerato','{1}','Dante Alighieri escribió la Divina Comedia un poema alegórico que describe el viaje del poeta por el Infierno el Purgatorio y el Paraíso'),
('literatura-universal','bachillerato','{1}','Shakespeare es considerado el dramaturgo más influyente de la literatura occidental por la profundidad psicológica de sus personajes'),
('literatura-universal','bachillerato','{1}','El Romanticismo surgió como reacción contra el racionalismo ilustrado exaltando los sentimientos la naturaleza y la libertad individual'),
('literatura-universal','bachillerato','{1}','Gustave Flaubert revolucionó la novela realista con Madame Bovary al introducir un estilo narrativo objetivo y depurado'),
('literatura-universal','bachillerato','{1}','Las vanguardias del siglo veinte rompieron con todas las convenciones artísticas anteriores buscando nuevas formas de expresión'),
('literatura-universal','bachillerato','{1}','Franz Kafka exploró en sus obras la alienación del individuo frente a una sociedad burocrática e incomprensible'),
('literatura-universal','bachillerato','{1}','James Joyce utilizó la técnica del flujo de conciencia en Ulises para representar los pensamientos de sus personajes'),
('literatura-universal','bachillerato','{1}','El existencialismo literario representado por Camus y Sartre reflexiona sobre el absurdo de la existencia humana'),
('literatura-universal','bachillerato','{1}','La tragedia griega tenía una función educativa y catártica dentro de las celebraciones religiosas dedicadas al dios Dioniso'),
('literatura-universal','bachillerato','{1}','Tolstoi retrató la sociedad rusa del siglo diecinueve con una profundidad y amplitud incomparables en Guerra y Paz'),
('literatura-universal','bachillerato','{1}','Virginia Woolf fue una de las escritoras más innovadoras del siglo veinte por su uso del monólogo interior'),
('literatura-universal','bachillerato','{1}','El Decamerón de Boccaccio contiene cien relatos narrados por diez jóvenes que huyen de la peste en Florencia'),
('literatura-universal','bachillerato','{1}','El naturalismo de Zola aplicó métodos científicos al análisis de la sociedad describiendo las condiciones de las clases obreras'),
('literatura-universal','bachillerato','{1}','La poesía de Baudelaire abrió las puertas al simbolismo explorando la belleza en lo oscuro y lo marginal');

-- ---------------------------------------------------------------------------
-- ordena_historias — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('literatura-universal','bachillerato','{1}','["La literatura occidental tiene sus raíces en la épica grecolatina con Homero y Virgilio.","Durante la Edad Media Dante escribió la Divina Comedia fusionando tradición clásica y pensamiento cristiano.","El Renacimiento trajo una renovación humanista con autores como Shakespeare y Boccaccio.","El siglo XIX vio nacer el Romanticismo y después el Realismo como movimientos dominantes.","Las vanguardias del siglo XX revolucionaron todas las formas literarias con experimentación radical."]'),
('literatura-universal','bachillerato','{1}','["Sófocles escribió Edipo Rey una de las tragedias más perfectas de la Antigüedad griega.","Edipo busca al culpable de la peste que asola Tebas sin saber que él mismo es el responsable.","Al descubrir la verdad sobre su origen Edipo se arranca los ojos horrorizado.","La obra explora temas universales como el destino la culpa y el conocimiento de uno mismo.","Aristóteles la consideró el modelo perfecto de tragedia en su Poética."]'),
('literatura-universal','bachillerato','{1}','["Goethe comenzó a escribir Fausto en su juventud durante el movimiento Sturm und Drang.","La obra narra el pacto del doctor Fausto con Mefistófeles a cambio de conocimiento y placer.","Fausto recorre el mundo buscando una experiencia que le haga desear detener el tiempo.","La primera parte publicada en 1808 se centra en la tragedia amorosa con Margarita.","La segunda parte completada poco antes de la muerte de Goethe aborda temas filosóficos y políticos."]'),
('literatura-universal','bachillerato','{1}','["A principios del siglo XX surge el modernismo literario como reacción al realismo decimonónico.","James Joyce publica Ulises en 1922 revolucionando la narrativa con el flujo de conciencia.","Virginia Woolf experimenta con la subjetividad del tiempo en La señora Dalloway.","Franz Kafka explora la alienación del individuo moderno en La metamorfosis y El proceso.","Marcel Proust analiza la memoria y el paso del tiempo en su monumental En busca del tiempo perdido."]'),
('literatura-universal','bachillerato','{1}','["Albert Camus publicó El extranjero en 1942 durante la ocupación alemana de Francia.","El protagonista Meursault vive de forma indiferente ante las convenciones sociales.","Tras cometer un crimen absurdo es juzgado más por su actitud que por sus actos.","La novela plantea la filosofía del absurdo el sinsentido de la existencia humana.","Camus recibió el Premio Nobel de Literatura en 1957 por su obra comprometida con la condición humana."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('literatura-universal','bachillerato','{1}','La Odisea de Virgilio narra el viaje de regreso de Ulises a Ítaca después de la guerra de Troya'),
('literatura-universal','bachillerato','{1}','Shakespeare escribió Fausto una obra sobre un hombre que hace un pacto con el diablo por conocimiento'),
('literatura-universal','bachillerato','{1}','El Romanticismo surgió en el siglo XVII como reacción contra el pensamiento ilustrado y racionalista'),
('literatura-universal','bachillerato','{1}','Dostoievski es el autor de Madame Bovary una novela que retrata la insatisfacción de una mujer burguesa'),
('literatura-universal','bachillerato','{1}','El naturalismo literario representado por Baudelaire aplica el método científico al estudio de la sociedad'),
('literatura-universal','bachillerato','{1}','La Divina Comedia fue escrita por Boccaccio y narra un viaje por el Infierno el Purgatorio y el Paraíso'),
('literatura-universal','bachillerato','{1}','James Joyce escribió La metamorfosis donde un hombre amanece convertido en un enorme insecto'),
('literatura-universal','bachillerato','{1}','Las tragedias griegas se representaban en honor al dios Apolo durante las fiestas religiosas de Atenas'),
('literatura-universal','bachillerato','{1}','Tolstoi fue un escritor francés autor de Guerra y Paz una de las novelas más importantes del realismo'),
('literatura-universal','bachillerato','{1}','El existencialismo literario nació en el siglo XVIII con las obras de Voltaire y Montesquieu'),
('literatura-universal','bachillerato','{1}','Virginia Woolf es conocida por su novela Ulises que transcurre en un solo día en la ciudad de Dublín'),
('literatura-universal','bachillerato','{1}','Camus recibió el Premio Nobel de Literatura en mil novecientos sesenta y siete por su obra filosófica');

-- ---------------------------------------------------------------------------
-- comprension_texts — literatura-universal
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('literatura-universal','bachillerato','{1}','La tragedia griega y su legado',
'La tragedia griega constituye uno de los logros artísticos más extraordinarios de la civilización occidental. Surgida en Atenas durante el siglo V a.C., se representaba en el marco de las fiestas Dionisias, celebraciones religiosas dedicadas al dios Dioniso. Los tres grandes trágicos fueron Esquilo, Sófocles y Eurípides, cada uno de los cuales aportó innovaciones fundamentales al género. Esquilo introdujo el segundo actor y dio mayor importancia al diálogo; Sófocles añadió el tercer actor y perfeccionó la estructura dramática; Eurípides humanizó a los personajes y cuestionó las convenciones sociales. La tragedia griega exploraba temas universales como el destino, la hybris (el orgullo desmesurado), la justicia divina y el sufrimiento humano. Aristóteles, en su Poética, definió la tragedia como la imitación de una acción elevada que provoca compasión y temor en el espectador, produciendo así la catarsis o purificación emocional. Obras como Edipo Rey de Sófocles, la Orestíada de Esquilo y las Bacantes de Eurípides siguen representándose en teatros de todo el mundo, demostrando la vigencia intemporal de sus temas y conflictos.',
'[{"pregunta":"¿En honor a qué dios se celebraban las fiestas donde se representaban tragedias?","opciones":["Apolo","Zeus","Dioniso","Atenea"],"correcta":2},{"pregunta":"¿Qué innovación aportó Sófocles a la tragedia?","opciones":["Introdujo el coro","Añadió el tercer actor","Eliminó la música","Creó la comedia"],"correcta":1},{"pregunta":"¿Qué significa catarsis según Aristóteles?","opciones":["Acción dramática","Conflicto trágico","Purificación emocional","Orgullo desmesurado"],"correcta":2},{"pregunta":"¿Qué trágico humanizó más a los personajes?","opciones":["Esquilo","Sófocles","Eurípides","Aristófanes"],"correcta":2}]'),
('literatura-universal','bachillerato','{1}','El Romanticismo literario europeo',
'El Romanticismo fue un movimiento cultural y literario que surgió a finales del siglo XVIII como reacción contra el racionalismo de la Ilustración. Frente a la primacía de la razón, los románticos exaltaron el sentimiento, la imaginación, la naturaleza salvaje y la libertad individual. En Alemania, el movimiento Sturm und Drang (Tempestad e ímpetu) sentó las bases con autores como Goethe, cuya novela Las cuitas del joven Werther provocó una auténtica fiebre sentimental en toda Europa. En Inglaterra, los poetas lakistas (Wordsworth y Coleridge) y la segunda generación romántica (Byron, Shelley y Keats) renovaron la poesía con temas como la naturaleza, el amor apasionado y la rebeldía. En Francia, Victor Hugo lideró el movimiento con el prefacio de Cromwell, donde proclamó la libertad total del arte. El Romanticismo también cultivó el gusto por lo medieval, lo exótico y lo sobrenatural, y dio lugar a géneros como la novela histórica y el cuento de terror. Su influencia se extendió a todas las artes y sentó las bases de la sensibilidad moderna, anticipando movimientos posteriores como el simbolismo y las vanguardias.',
'[{"pregunta":"¿Contra qué movimiento reaccionó el Romanticismo?","opciones":["El Realismo","La Ilustración","El Naturalismo","El Modernismo"],"correcta":1},{"pregunta":"¿Qué obra de Goethe provocó una fiebre sentimental en Europa?","opciones":["Fausto","Las cuitas del joven Werther","Wilhelm Meister","Hermann y Dorotea"],"correcta":1},{"pregunta":"¿Quién lideró el Romanticismo francés según el texto?","opciones":["Flaubert","Balzac","Victor Hugo","Baudelaire"],"correcta":2},{"pregunta":"¿Qué géneros literarios impulsó el Romanticismo?","opciones":["Ensayo filosófico y tratado científico","Novela histórica y cuento de terror","Novela policiaca y ciencia ficción","Comedia musical y ópera bufa"],"correcta":1}]'),
('literatura-universal','bachillerato','{1}','La novela del siglo XX: revolución narrativa',
'El siglo XX supuso una revolución sin precedentes en la historia de la novela. Los escritores modernistas rompieron con las convenciones narrativas del realismo decimonónico y exploraron nuevas formas de representar la realidad interior del ser humano. James Joyce, en su obra Ulises (1922), llevó al extremo la técnica del flujo de conciencia, reproduciendo los pensamientos de sus personajes de forma caótica y asociativa. Virginia Woolf, en La señora Dalloway y Al faro, experimentó con la subjetividad del tiempo y la percepción múltiple de la realidad. Marcel Proust dedicó siete volúmenes a explorar los mecanismos de la memoria involuntaria en En busca del tiempo perdido. Franz Kafka creó universos absurdos y angustiantes donde el individuo se enfrenta a fuerzas incomprensibles, como en La metamorfosis y El proceso. Tras la Segunda Guerra Mundial, el existencialismo de Camus y Sartre cuestionó el sentido de la existencia, mientras que el teatro del absurdo de Beckett llevó la experimentación al escenario. Estas innovaciones transformaron irreversiblemente la literatura y siguen influyendo en los escritores contemporáneos.',
'[{"pregunta":"¿Qué técnica narrativa llevó al extremo James Joyce?","opciones":["Narrador omnisciente","Flujo de conciencia","Narración epistolar","Realismo mágico"],"correcta":1},{"pregunta":"¿Cuántos volúmenes tiene la obra de Proust?","opciones":["Tres","Cinco","Siete","Diez"],"correcta":2},{"pregunta":"¿Qué tema explora Kafka en sus obras?","opciones":["El amor romántico","La naturaleza","La alienación del individuo","La aventura"],"correcta":2},{"pregunta":"¿Qué movimiento literario surgió tras la Segunda Guerra Mundial?","opciones":["Romanticismo","Naturalismo","Existencialismo","Renacimiento"],"correcta":2}]');


-- #############################################################################
-- DIBUJO TÉCNICO (1º y 2º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Representación gráfica que utiliza proyecciones paralelas sobre tres ejes coordenados','axonometria','dibujo-tecnico','bachillerato','{1,2}',1),
('B','empieza','Línea que une los puntos de tangencia de una curva con sus rectas tangentes','bisectriz','dibujo-tecnico','bachillerato','{1,2}',2),
('C','empieza','Curva cerrada plana cuyos puntos equidistan de un punto central llamado centro','circunferencia','dibujo-tecnico','bachillerato','{1,2}',1),
('D','empieza','Sistema de representación que utiliza dos planos perpendiculares de proyección','diedrico','dibujo-tecnico','bachillerato','{1,2}',1),
('E','empieza','Relación numérica entre las dimensiones del dibujo y las del objeto real','escala','dibujo-tecnico','bachillerato','{1,2}',1),
('F','contiene','Punto donde convergen las líneas de fuga en una perspectiva cónica','fuga','dibujo-tecnico','bachillerato','{1,2}',2),
('G','empieza','Rama de las matemáticas que estudia las propiedades de las figuras en el espacio','geometria','dibujo-tecnico','bachillerato','{1,2}',1),
('H','empieza','Curva cónica abierta formada por la intersección de un plano con un cono','hiperbola','dibujo-tecnico','bachillerato','{1,2}',2),
('I','empieza','Tipo de axonometría en la que los tres ejes forman ángulos iguales de ciento veinte grados','isometrica','dibujo-tecnico','bachillerato','{1,2}',1),
('J','contiene','Punto de referencia que se usa para definir la posición de un elemento en el dibujo','fijacion','dibujo-tecnico','bachillerato','{1,2}',3),
('K','contiene','Unidad de medida angular que equivale a una milésima parte de un grado','miliquilate','dibujo-tecnico','bachillerato','{1,2}',3),
('L','empieza','Lugar geométrico de puntos que cumplen una determinada condición','lugar','dibujo-tecnico','bachillerato','{1,2}',2),
('M','empieza','Segmento que une el punto medio de un lado de un triángulo con el vértice opuesto','mediana','dibujo-tecnico','bachillerato','{1,2}',1),
('N','empieza','Conjunto de reglas que regulan la representación gráfica en dibujo técnico industrial','normalizacion','dibujo-tecnico','bachillerato','{1,2}',1),
('O','empieza','Proyección perpendicular de un punto sobre un plano','ortogonal','dibujo-tecnico','bachillerato','{1,2}',2),
('P','empieza','Curva cónica abierta simétrica que resulta de la sección de un cono por un plano paralelo a la generatriz','parabola','dibujo-tecnico','bachillerato','{1,2}',2),
('Q','contiene','Operación geométrica que consiste en dividir un segmento o ángulo en partes proporcionales','quinquefolio','dibujo-tecnico','bachillerato','{1,2}',3),
('R','empieza','Transformación geométrica que gira una figura un ángulo determinado alrededor de un punto','rotacion','dibujo-tecnico','bachillerato','{1,2}',1),
('S','empieza','Representación de un objeto cortado por un plano imaginario para ver su interior','seccion','dibujo-tecnico','bachillerato','{1,2}',1),
('T','empieza','Recta que toca a una curva en un solo punto sin cortarla','tangente','dibujo-tecnico','bachillerato','{1,2}',1),
('U','contiene','Tipo de representación que muestra las tres dimensiones de un objeto en un solo plano','dibujo','dibujo-tecnico','bachillerato','{1,2}',1),
('V','empieza','Punto de intersección de dos rectas o lados de una figura geométrica','vertice','dibujo-tecnico','bachillerato','{1,2}',1),
('W','contiene','Instrumento técnico utilizado para trazar ángulos y medir grados','transportador','dibujo-tecnico','bachillerato','{1,2}',2),
('X','contiene','Uno de los ejes de coordenadas en el plano cartesiano utilizado en geometría analítica','eje','dibujo-tecnico','bachillerato','{1,2}',1),
('Y','contiene','Proyección sobre el eje vertical en un sistema de coordenadas cartesianas','proyeccion','dibujo-tecnico','bachillerato','{1,2}',2),
('Z','contiene','Tercer eje de coordenadas que representa la profundidad en un sistema tridimensional','eje','dibujo-tecnico','bachillerato','{1,2}',2);

-- ---------------------------------------------------------------------------
-- runner_categories — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('dibujo-tecnico','bachillerato','{1,2}','Polígonos regulares','["triangulo","cuadrado","pentagono","hexagono","heptagono","octogono","nonagono","decagono","endecagono","dodecagono","pentadecagono","icosagono"]'),
('dibujo-tecnico','bachillerato','{1,2}','Cuerpos geométricos','["cubo","prisma","piramide","cilindro","cono","esfera","tetraedro","octaedro","dodecaedro","icosaedro","tronco","paralelepipedo"]'),
('dibujo-tecnico','bachillerato','{1,2}','Sistemas de representación','["diedrico","axonometrico","isometrico","dimetrico","trimetrico","caballera","militar","conico","frontal","oblicuo","cenital","anamorfosis"]'),
('dibujo-tecnico','bachillerato','{1,2}','Curvas cónicas','["circunferencia","elipse","parabola","hiperbola","directriz","foco","excentricidad","eje","vertice","asintota","tangente","secante"]'),
('dibujo-tecnico','bachillerato','{1,2}','Transformaciones geométricas','["traslacion","rotacion","simetria","homotecia","afinidad","inversion","semejanza","proyeccion","abatimiento","giro","cambio","rebatimiento"]'),
('dibujo-tecnico','bachillerato','{1,2}','Elementos de acotación','["cota","linea","flecha","referencia","tolerancia","dimension","radio","diametro","angulo","profundidad","anchura","altura"]'),
('dibujo-tecnico','bachillerato','{1,2}','Instrumentos de dibujo','["compas","escuadra","cartabon","regla","transportador","plantilla","escalimetro","tiralíneas","paralex","tecnigrafo","lapiz","portaminas"]'),
('dibujo-tecnico','bachillerato','{1,2}','Normalización','["formato","cajetin","plegado","margen","escala","acotacion","seccion","corte","detalle","vista","alzado","planta"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('dibujo-tecnico','bachillerato','{1,2}','Curvas cónicas','["elipse","parábola","hipérbola","circunferencia"]','["espiral","cicloide"]'),
('dibujo-tecnico','bachillerato','{1,2}','Vistas en sistema diédrico','["alzado","planta","perfil lateral","perfil posterior"]','["perspectiva","axonometría"]'),
('dibujo-tecnico','bachillerato','{1,2}','Poliedros regulares','["tetraedro","cubo","octaedro","dodecaedro"]','["cilindro","cono"]'),
('dibujo-tecnico','bachillerato','{1,2}','Tipos de axonometría','["isométrica","dimétrica","trimétrica","caballera"]','["cónica","diédrica"]'),
('dibujo-tecnico','bachillerato','{1,2}','Elementos del sistema diédrico','["plano horizontal","plano vertical","línea de tierra","punto de vista"]','["punto de fuga","línea de horizonte"]'),
('dibujo-tecnico','bachillerato','{1,2}','Transformaciones del plano','["traslación","rotación","simetría","homotecia"]','["derivación","integración"]'),
('dibujo-tecnico','bachillerato','{1,2}','Instrumentos de precisión','["compás","escuadra","cartabón","escalímetro"]','["martillo","destornillador"]'),
('dibujo-tecnico','bachillerato','{1,2}','Formatos normalizados','["A0","A1","A2","A3"]','["B5","C6"]'),
('dibujo-tecnico','bachillerato','{1,2}','Tipos de línea en dibujo','["continua gruesa","continua fina","discontinua","trazo punto"]','["ondulada","zigzag"]'),
('dibujo-tecnico','bachillerato','{1,2}','Elementos de una cónica','["foco","directriz","excentricidad","eje mayor"]','["mediana","bisectriz"]');

-- ---------------------------------------------------------------------------
-- parejas_items — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('dibujo-tecnico','bachillerato','{1,2}','Elipse','Excentricidad menor que 1'),
('dibujo-tecnico','bachillerato','{1,2}','Parábola','Excentricidad igual a 1'),
('dibujo-tecnico','bachillerato','{1,2}','Hipérbola','Excentricidad mayor que 1'),
('dibujo-tecnico','bachillerato','{1,2}','Circunferencia','Excentricidad igual a 0'),
('dibujo-tecnico','bachillerato','{1,2}','Sistema diédrico','Dos planos de proyección perpendiculares'),
('dibujo-tecnico','bachillerato','{1,2}','Axonometría isométrica','Tres ejes a 120 grados'),
('dibujo-tecnico','bachillerato','{1,2}','Perspectiva caballera','Eje de profundidad a 45 grados'),
('dibujo-tecnico','bachillerato','{1,2}','Perspectiva cónica','Punto de fuga'),
('dibujo-tecnico','bachillerato','{1,2}','Alzado','Vista frontal'),
('dibujo-tecnico','bachillerato','{1,2}','Planta','Vista superior'),
('dibujo-tecnico','bachillerato','{1,2}','Perfil','Vista lateral'),
('dibujo-tecnico','bachillerato','{1,2}','Sección','Corte por un plano imaginario'),
('dibujo-tecnico','bachillerato','{1,2}','Homotecia','Transformación con centro y razón'),
('dibujo-tecnico','bachillerato','{1,2}','Simetría','Transformación respecto a un eje'),
('dibujo-tecnico','bachillerato','{1,2}','Traslación','Desplazamiento según un vector'),
('dibujo-tecnico','bachillerato','{1,2}','Rotación','Giro alrededor de un punto'),
('dibujo-tecnico','bachillerato','{1,2}','Tangente','Recta que toca la curva en un punto'),
('dibujo-tecnico','bachillerato','{1,2}','Secante','Recta que corta la curva en dos puntos'),
('dibujo-tecnico','bachillerato','{1,2}','Escala 1:2','Reducción a la mitad'),
('dibujo-tecnico','bachillerato','{1,2}','Escala 2:1','Ampliación al doble');

-- ---------------------------------------------------------------------------
-- ordena_frases — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('dibujo-tecnico','bachillerato','{1,2}','El sistema diédrico utiliza dos planos perpendiculares de proyección que se cortan en la línea de tierra'),
('dibujo-tecnico','bachillerato','{1,2}','La axonometría isométrica representa los tres ejes del espacio formando ángulos iguales de ciento veinte grados'),
('dibujo-tecnico','bachillerato','{1,2}','Las curvas cónicas se obtienen al seccionar un cono de revolución con un plano en diferentes posiciones'),
('dibujo-tecnico','bachillerato','{1,2}','La normalización establece un conjunto de reglas que unifican la representación gráfica en el dibujo técnico industrial'),
('dibujo-tecnico','bachillerato','{1,2}','La perspectiva cónica simula la visión humana utilizando uno o dos puntos de fuga en la línea de horizonte'),
('dibujo-tecnico','bachillerato','{1,2}','Una sección es la representación del interior de un objeto cortado por un plano imaginario de corte'),
('dibujo-tecnico','bachillerato','{1,2}','Las transformaciones geométricas del plano incluyen la traslación la rotación la simetría y la homotecia'),
('dibujo-tecnico','bachillerato','{1,2}','La escala de un dibujo técnico establece la relación entre las medidas del dibujo y las reales del objeto'),
('dibujo-tecnico','bachillerato','{1,2}','El alzado es la vista principal que muestra la proyección frontal del objeto sobre el plano vertical'),
('dibujo-tecnico','bachillerato','{1,2}','La elipse tiene dos focos y la suma de las distancias de cualquier punto a ambos focos es constante'),
('dibujo-tecnico','bachillerato','{1,2}','Los poliedros regulares son cinco y se conocen como sólidos platónicos por su perfección geométrica'),
('dibujo-tecnico','bachillerato','{1,2}','La acotación es el proceso de indicar las dimensiones reales de un objeto en su representación gráfica'),
('dibujo-tecnico','bachillerato','{1,2}','En el sistema diédrico un punto se representa mediante sus dos proyecciones sobre los planos horizontal y vertical'),
('dibujo-tecnico','bachillerato','{1,2}','La tangencia entre dos circunferencias puede ser exterior o interior según la posición relativa de sus centros'),
('dibujo-tecnico','bachillerato','{1,2}','El abatimiento es una operación que permite obtener la verdadera magnitud de una figura contenida en un plano oblicuo');

-- ---------------------------------------------------------------------------
-- ordena_historias — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('dibujo-tecnico','bachillerato','{1,2}','["Se identifica la pieza tridimensional que se debe representar en el plano.","Se eligen las vistas necesarias: alzado, planta y perfil lateral.","Se trazan las proyecciones ortogonales respetando la correspondencia entre vistas.","Se añaden las líneas ocultas con trazo discontinuo para completar la información.","Se acotan las dimensiones y se incluyen los datos del cajetín según la norma."]'),
('dibujo-tecnico','bachillerato','{1,2}','["Se define el objeto que se va a representar en perspectiva isométrica.","Se trazan los tres ejes isométricos formando ángulos de 120 grados entre sí.","Se marcan las medidas reales del objeto sobre cada eje correspondiente.","Se completan las aristas visibles del cuerpo uniendo los puntos obtenidos.","Se repasan las líneas con el grosor adecuado y se borran las líneas auxiliares."]'),
('dibujo-tecnico','bachillerato','{1,2}','["Se traza la línea de horizonte y se sitúa el punto de fuga en la perspectiva cónica.","Se dibuja la línea de tierra y se ubica el plano del cuadro.","Se proyectan las aristas del objeto hacia el punto de fuga.","Se determinan las profundidades utilizando puntos de medida o distancia.","Se completa la representación con las aristas visibles y se eliminan las auxiliares."]'),
('dibujo-tecnico','bachillerato','{1,2}','["Se identifica el tipo de cónica según la posición del plano secante respecto al cono.","Si el plano es paralelo a la base se obtiene una circunferencia.","Si el plano es oblicuo pero corta ambas generatrices se obtiene una elipse.","Si el plano es paralelo a una generatriz se obtiene una parábola.","Si el plano corta ambas hojas del cono se obtiene una hipérbola."]'),
('dibujo-tecnico','bachillerato','{1,2}','["Se analiza la pieza para decidir por dónde realizar el corte o sección.","Se traza el plano de corte indicándolo con una línea de trazo y punto.","Se proyecta la sección resultante sobre la vista correspondiente.","Se rellena la zona cortada con un rayado a 45 grados según la norma.","Se acotan las dimensiones interiores visibles gracias al corte realizado."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('dibujo-tecnico','bachillerato','{1,2}','En la axonometría isométrica los tres ejes forman ángulos de noventa grados entre sí'),
('dibujo-tecnico','bachillerato','{1,2}','La elipse es una curva cónica cuya excentricidad es mayor que uno'),
('dibujo-tecnico','bachillerato','{1,2}','El sistema diédrico utiliza un único plano de proyección para representar objetos tridimensionales'),
('dibujo-tecnico','bachillerato','{1,2}','La perspectiva caballera tiene el eje de profundidad perpendicular al plano frontal'),
('dibujo-tecnico','bachillerato','{1,2}','La planta es la vista que muestra la proyección lateral del objeto sobre el plano de perfil'),
('dibujo-tecnico','bachillerato','{1,2}','La parábola tiene dos focos y la suma de distancias a ellos es constante desde cualquier punto'),
('dibujo-tecnico','bachillerato','{1,2}','Los sólidos platónicos son seis cuerpos geométricos regulares convexos que se conocen desde la Antigüedad'),
('dibujo-tecnico','bachillerato','{1,2}','En la perspectiva cónica las líneas paralelas convergen en un punto de fuga situado en la línea de tierra'),
('dibujo-tecnico','bachillerato','{1,2}','La homotecia es una transformación geométrica que mantiene invariable el tamaño de la figura original'),
('dibujo-tecnico','bachillerato','{1,2}','El formato A1 tiene la mitad de superficie que el formato A0 y el doble que el A3'),
('dibujo-tecnico','bachillerato','{1,2}','La tangencia entre dos circunferencias exteriores se produce cuando la distancia entre centros es igual al radio'),
('dibujo-tecnico','bachillerato','{1,2}','La escala uno a cinco significa que el dibujo es cinco veces más grande que el objeto real representado');

-- ---------------------------------------------------------------------------
-- comprension_texts — dibujo-tecnico
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('dibujo-tecnico','bachillerato','{1,2}','El sistema diédrico de Monge',
'El sistema diédrico, desarrollado por el matemático francés Gaspard Monge a finales del siglo XVIII, es el método fundamental de representación utilizado en el dibujo técnico. Se basa en la proyección ortogonal de los objetos sobre dos planos perpendiculares entre sí: el plano horizontal de proyección y el plano vertical de proyección, que se cortan en una línea denominada línea de tierra. Cada punto del espacio se representa mediante sus dos proyecciones: la proyección horizontal sobre el plano horizontal y la proyección vertical sobre el plano vertical. Las rectas y los planos se representan igualmente mediante sus proyecciones sobre ambos planos. Este sistema permite determinar con exactitud la posición, la forma y las dimensiones de cualquier objeto tridimensional, así como resolver problemas de intersecciones, distancias y ángulos. Las vistas principales que se obtienen son el alzado (proyección frontal), la planta (proyección horizontal) y el perfil (proyección lateral). La correspondencia entre vistas permite reconstruir mentalmente el objeto en tres dimensiones a partir de su representación bidimensional.',
'[{"pregunta":"¿Quién desarrolló el sistema diédrico?","opciones":["Euclides","Gaspard Monge","Leonardo da Vinci","René Descartes"],"correcta":1},{"pregunta":"¿Cómo se llama la línea donde se cortan los dos planos de proyección?","opciones":["Línea de horizonte","Línea de fuga","Línea de tierra","Línea de corte"],"correcta":2},{"pregunta":"¿Cuántas proyecciones tiene cada punto del espacio en este sistema?","opciones":["Una","Dos","Tres","Cuatro"],"correcta":1},{"pregunta":"¿Qué vista corresponde a la proyección horizontal?","opciones":["Alzado","Planta","Perfil","Sección"],"correcta":1}]'),
('dibujo-tecnico','bachillerato','{1,2}','Las curvas cónicas',
'Las curvas cónicas son un grupo de curvas planas que se obtienen al seccionar un cono de revolución con un plano. Según la inclinación del plano secante respecto al eje del cono, se obtienen cuatro tipos de cónicas: la circunferencia, la elipse, la parábola y la hipérbola. La circunferencia se produce cuando el plano es perpendicular al eje del cono. La elipse aparece cuando el plano corta todas las generatrices del cono de forma oblicua. La parábola se obtiene cuando el plano es paralelo a una generatriz del cono. La hipérbola resulta cuando el plano corta ambas hojas del cono. Cada cónica se define por sus elementos característicos: focos, directrices, ejes y excentricidad. La excentricidad es un parámetro clave: vale cero para la circunferencia, es menor que uno para la elipse, igual a uno para la parábola y mayor que uno para la hipérbola. Las cónicas tienen numerosas aplicaciones en ingeniería, arquitectura, astronomía y física. Por ejemplo, las órbitas de los planetas son elipses, los reflectores de los faros son parábolas y algunas torres de refrigeración tienen forma hiperbólica.',
'[{"pregunta":"¿Qué cónica se obtiene cuando el plano es perpendicular al eje del cono?","opciones":["Elipse","Parábola","Circunferencia","Hipérbola"],"correcta":2},{"pregunta":"¿Cuál es la excentricidad de la parábola?","opciones":["0","Menor que 1","Igual a 1","Mayor que 1"],"correcta":2},{"pregunta":"¿Qué forma tienen las órbitas planetarias?","opciones":["Circunferencia","Elipse","Parábola","Hipérbola"],"correcta":1},{"pregunta":"¿Qué cónica se obtiene al cortar ambas hojas del cono?","opciones":["Circunferencia","Elipse","Parábola","Hipérbola"],"correcta":3}]'),
('dibujo-tecnico','bachillerato','{1,2}','La normalización en dibujo técnico',
'La normalización es el conjunto de reglas y convenciones que regulan la representación gráfica en el dibujo técnico, permitiendo que los planos sean interpretados universalmente por cualquier técnico o profesional. Las normas más utilizadas son las normas UNE (españolas), las normas ISO (internacionales) y las normas DIN (alemanas). La normalización establece aspectos como los formatos de papel (A0, A1, A2, A3, A4), los tipos de línea (continua gruesa para aristas visibles, discontinua para aristas ocultas, trazo punto para ejes), las escalas de representación, el sistema de acotación y la disposición de vistas. El cajetín es un recuadro normalizado situado en la esquina inferior derecha del plano que contiene información identificativa: título del plano, escala, fecha, autor y número de revisión. La acotación es el proceso de indicar las dimensiones reales del objeto mediante líneas de cota, líneas auxiliares y cifras de cota. Las secciones y cortes permiten mostrar el interior de las piezas mediante un rayado normalizado a cuarenta y cinco grados. El dominio de la normalización es imprescindible para la comunicación técnica en ingeniería, arquitectura y diseño industrial.',
'[{"pregunta":"¿Qué tipo de línea se usa para las aristas visibles?","opciones":["Discontinua","Trazo punto","Continua gruesa","Continua fina"],"correcta":2},{"pregunta":"¿Dónde se sitúa el cajetín en un plano normalizado?","opciones":["Centro del plano","Esquina superior izquierda","Esquina inferior derecha","Parte superior"],"correcta":2},{"pregunta":"¿A cuántos grados se realiza el rayado de las secciones?","opciones":["30 grados","45 grados","60 grados","90 grados"],"correcta":1},{"pregunta":"¿Qué normas son las internacionales?","opciones":["UNE","DIN","ISO","ANSI"],"correcta":2}]');


-- #############################################################################
-- TECNOLOGÍA E INGENIERÍA (1º y 2º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Sistema que realiza tareas sin intervención humana directa','automatizacion','tecnologia','bachillerato','{1,2}',1),
('B','empieza','Dispositivo electrónico de dos terminales que permite el paso de corriente en un solo sentido','diodo','tecnologia','bachillerato','{1,2}',2),
('C','empieza','Tipo de circuito donde los componentes están conectados uno tras otro en una sola vía','serie','tecnologia','bachillerato','{1,2}',1),
('D','empieza','Dispositivo que transforma energía mecánica en eléctrica mediante inducción electromagnética','dinamo','tecnologia','bachillerato','{1,2}',2),
('E','empieza','Capacidad de un sistema o proceso para obtener el máximo rendimiento con el mínimo gasto','eficiencia','tecnologia','bachillerato','{1,2}',1),
('F','empieza','Tipo de energía obtenida de materiales como el carbón el petróleo y el gas natural','fosil','tecnologia','bachillerato','{1,2}',1),
('G','empieza','Máquina que transforma energía mecánica en energía eléctrica de corriente alterna','generador','tecnologia','bachillerato','{1,2}',1),
('H','empieza','Tipo de energía renovable que aprovecha la fuerza del agua en movimiento','hidraulica','tecnologia','bachillerato','{1,2}',1),
('I','empieza','Fenómeno por el cual un campo magnético variable genera una corriente eléctrica','induccion','tecnologia','bachillerato','{1,2}',2),
('J','contiene','Material utilizado en la fabricación de circuitos integrados como el germanio','semiconductor','tecnologia','bachillerato','{1,2}',2),
('K','contiene','Unidad de medida de energía eléctrica que equivale a mil vatios durante una hora','kilovatio','tecnologia','bachillerato','{1,2}',1),
('L','empieza','Tipo de motor eléctrico que funciona con corriente continua y escobillas','motor','tecnologia','bachillerato','{1,2}',2),
('M','empieza','Propiedad de los materiales que les permite ser deformados sin romperse','maleabilidad','tecnologia','bachillerato','{1,2}',2),
('N','empieza','Fuente de energía que se obtiene de la fisión o fusión de átomos','nuclear','tecnologia','bachillerato','{1,2}',1),
('O','empieza','Ley que relaciona la intensidad la tensión y la resistencia en un circuito eléctrico','ohm','tecnologia','bachillerato','{1,2}',1),
('P','empieza','Lenguaje de instrucciones que permite controlar el funcionamiento de un ordenador','programacion','tecnologia','bachillerato','{1,2}',1),
('Q','contiene','Componente electrónico que almacena energía en forma de campo eléctrico','condensador','tecnologia','bachillerato','{1,2}',2),
('R','empieza','Componente que se opone al paso de la corriente eléctrica medida en ohmios','resistencia','tecnologia','bachillerato','{1,2}',1),
('S','empieza','Desarrollo que satisface las necesidades presentes sin comprometer las de generaciones futuras','sostenibilidad','tecnologia','bachillerato','{1,2}',1),
('T','empieza','Componente semiconductor de tres terminales que amplifica o conmuta señales electrónicas','transistor','tecnologia','bachillerato','{1,2}',1),
('U','contiene','Tipo de corriente eléctrica cuya polaridad cambia periódicamente','alterna','tecnologia','bachillerato','{1,2}',1),
('V','empieza','Unidad de medida de la potencia eléctrica en el Sistema Internacional','vatio','tecnologia','bachillerato','{1,2}',1),
('W','contiene','Red mundial de comunicación que conecta millones de dispositivos electrónicos','web','tecnologia','bachillerato','{1,2}',1),
('X','contiene','Tipo de conexión inalámbrica de corto alcance usada en dispositivos móviles','bluetooth','tecnologia','bachillerato','{1,2}',2),
('Y','contiene','Ley que establece que la corriente eléctrica produce un campo magnético a su alrededor','ampere','tecnologia','bachillerato','{1,2}',3),
('Z','contiene','Dispositivo que regula la temperatura de un sistema activando o desactivando la calefacción','termostato','tecnologia','bachillerato','{1,2}',2);

-- ---------------------------------------------------------------------------
-- runner_categories — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('tecnologia','bachillerato','{1,2}','Componentes electrónicos','["resistencia","condensador","transistor","diodo","bobina","rele","potenciometro","led","tiristor","fusible","transformador","amplificador"]'),
('tecnologia','bachillerato','{1,2}','Energías renovables','["solar","eolica","hidraulica","geotermica","biomasa","mareas","oleaje","biogas","fotovoltaica","termica","hidrogeno","undimotriz"]'),
('tecnologia','bachillerato','{1,2}','Materiales','["acero","aluminio","cobre","plastico","madera","vidrio","ceramica","hormigon","titanio","fibra","grafeno","silicio"]'),
('tecnologia','bachillerato','{1,2}','Mecanismos','["engranaje","polea","palanca","biela","manivela","leva","cadena","cremallera","tornillo","correa","excéntrica","cigüeñal"]'),
('tecnologia','bachillerato','{1,2}','Programación','["variable","funcion","bucle","condicion","array","clase","objeto","metodo","herencia","interfaz","modulo","libreria"]'),
('tecnologia','bachillerato','{1,2}','Automatización','["sensor","actuador","controlador","plc","robot","servomotor","encoder","microcontrolador","arduino","raspberry","rele","temporizador"]'),
('tecnologia','bachillerato','{1,2}','Magnitudes eléctricas','["voltaje","intensidad","resistencia","potencia","energia","frecuencia","capacitancia","inductancia","impedancia","conductancia","carga","campo"]'),
('tecnologia','bachillerato','{1,2}','Sostenibilidad','["reciclaje","reutilizacion","eficiencia","emisiones","huella","residuos","economia circular","biodegradable","compostaje","reduccion","renovable","limpia"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('tecnologia','bachillerato','{1,2}','Energías renovables','["solar","eólica","hidráulica","geotérmica"]','["nuclear","carbón"]'),
('tecnologia','bachillerato','{1,2}','Componentes pasivos','["resistencia","condensador","bobina","fusible"]','["transistor","diodo"]'),
('tecnologia','bachillerato','{1,2}','Lenguajes de programación','["Python","Java","C++","JavaScript"]','["HTML","CSS"]'),
('tecnologia','bachillerato','{1,2}','Mecanismos de transmisión','["engranaje","polea","cadena","correa"]','["palanca","cuña"]'),
('tecnologia','bachillerato','{1,2}','Magnitudes eléctricas','["voltaje","intensidad","resistencia","potencia"]','["velocidad","aceleración"]'),
('tecnologia','bachillerato','{1,2}','Materiales metálicos','["acero","aluminio","cobre","titanio"]','["polietileno","nailon"]'),
('tecnologia','bachillerato','{1,2}','Sensores','["temperatura","presión","proximidad","luminosidad"]','["motor","bombilla"]'),
('tecnologia','bachillerato','{1,2}','Principios de sostenibilidad','["reducir","reutilizar","reciclar","recuperar"]','["consumir","desechar"]'),
('tecnologia','bachillerato','{1,2}','Tipos de circuito','["serie","paralelo","mixto","puente"]','["espiral","radial"]'),
('tecnologia','bachillerato','{1,2}','Placas de desarrollo','["Arduino","Raspberry Pi","ESP32","micro:bit"]','["Photoshop","Excel"]');

-- ---------------------------------------------------------------------------
-- parejas_items — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tecnologia','bachillerato','{1,2}','Voltaje','Voltios (V)'),
('tecnologia','bachillerato','{1,2}','Intensidad','Amperios (A)'),
('tecnologia','bachillerato','{1,2}','Resistencia','Ohmios (Ω)'),
('tecnologia','bachillerato','{1,2}','Potencia','Vatios (W)'),
('tecnologia','bachillerato','{1,2}','Energía','Julios (J)'),
('tecnologia','bachillerato','{1,2}','Frecuencia','Hercios (Hz)'),
('tecnologia','bachillerato','{1,2}','Transistor','Amplificar y conmutar'),
('tecnologia','bachillerato','{1,2}','Diodo','Permite corriente en un sentido'),
('tecnologia','bachillerato','{1,2}','Condensador','Almacena carga eléctrica'),
('tecnologia','bachillerato','{1,2}','Resistencia','Opone al paso de corriente'),
('tecnologia','bachillerato','{1,2}','LED','Diodo emisor de luz'),
('tecnologia','bachillerato','{1,2}','PLC','Controlador lógico programable'),
('tecnologia','bachillerato','{1,2}','Arduino','Placa de microcontrolador'),
('tecnologia','bachillerato','{1,2}','Ley de Ohm','V = I × R'),
('tecnologia','bachillerato','{1,2}','Energía solar','Paneles fotovoltaicos'),
('tecnologia','bachillerato','{1,2}','Energía eólica','Aerogeneradores'),
('tecnologia','bachillerato','{1,2}','Palanca','Multiplica la fuerza'),
('tecnologia','bachillerato','{1,2}','Engranaje','Transmite movimiento rotativo'),
('tecnologia','bachillerato','{1,2}','Biela-manivela','Convierte rotación en lineal'),
('tecnologia','bachillerato','{1,2}','Sensor','Detecta magnitudes físicas');

-- ---------------------------------------------------------------------------
-- ordena_frases — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('tecnologia','bachillerato','{1,2}','La ley de Ohm establece que la intensidad de corriente es directamente proporcional al voltaje e inversamente proporcional a la resistencia'),
('tecnologia','bachillerato','{1,2}','Los transistores son componentes semiconductores que permiten amplificar señales eléctricas y actuar como interruptores electrónicos'),
('tecnologia','bachillerato','{1,2}','La energía solar fotovoltaica transforma la radiación del sol en electricidad mediante el efecto fotoeléctrico en células de silicio'),
('tecnologia','bachillerato','{1,2}','La automatización industrial utiliza sensores actuadores y controladores programables para optimizar los procesos de fabricación'),
('tecnologia','bachillerato','{1,2}','Los materiales compuestos combinan dos o más componentes para obtener propiedades superiores a las de cada material por separado'),
('tecnologia','bachillerato','{1,2}','La sostenibilidad tecnológica busca un desarrollo que satisfaga las necesidades actuales sin comprometer las generaciones futuras'),
('tecnologia','bachillerato','{1,2}','Un circuito en paralelo mantiene el mismo voltaje en todos sus componentes mientras que la intensidad se reparte'),
('tecnologia','bachillerato','{1,2}','Los microcontroladores como Arduino permiten programar sistemas electrónicos interactivos mediante código y componentes sencillos'),
('tecnologia','bachillerato','{1,2}','La eficiencia energética mide la relación entre la energía útil obtenida y la energía total consumida en un proceso'),
('tecnologia','bachillerato','{1,2}','El sistema de engranajes transmite movimiento y potencia entre ejes modificando la velocidad y el par de giro'),
('tecnologia','bachillerato','{1,2}','La corriente alterna cambia de polaridad periódicamente y se utiliza en la red eléctrica doméstica e industrial'),
('tecnologia','bachillerato','{1,2}','Los robots industriales realizan tareas repetitivas con precisión y velocidad superiores a las del trabajo manual humano'),
('tecnologia','bachillerato','{1,2}','La economía circular propone diseñar productos para que puedan ser reparados reutilizados y reciclados al final de su vida útil'),
('tecnologia','bachillerato','{1,2}','La programación estructurada organiza el código en bloques lógicos como secuencias condiciones y bucles para resolver problemas'),
('tecnologia','bachillerato','{1,2}','La inteligencia artificial permite a las máquinas aprender de los datos y tomar decisiones sin programación explícita para cada caso');

-- ---------------------------------------------------------------------------
-- ordena_historias — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('tecnologia','bachillerato','{1,2}','["Se identifica un problema que puede resolverse mediante un sistema automatizado.","Se diseña el circuito electrónico seleccionando los componentes adecuados.","Se programa el microcontrolador con las instrucciones de control del sistema.","Se monta el prototipo conectando sensores actuadores y el controlador.","Se realizan pruebas y ajustes hasta que el sistema funciona correctamente."]'),
('tecnologia','bachillerato','{1,2}','["La Revolución Industrial comenzó con la invención de la máquina de vapor.","La electricidad permitió desarrollar motores más eficientes y la iluminación artificial.","La electrónica del siglo XX hizo posible los ordenadores y las telecomunicaciones.","La revolución digital transformó la sociedad con Internet y los dispositivos móviles.","Actualmente la inteligencia artificial y la robótica abren una nueva era tecnológica."]'),
('tecnologia','bachillerato','{1,2}','["Se analiza la necesidad de instalar un sistema de energía renovable en un edificio.","Se estudia la orientación del tejado y la irradiación solar de la zona.","Se dimensionan los paneles fotovoltaicos y el inversor según el consumo estimado.","Se instalan los paneles las baterías y el sistema de conexión a la red eléctrica.","Se monitoriza la producción energética y se evalúa el ahorro económico obtenido."]'),
('tecnologia','bachillerato','{1,2}','["Se define el algoritmo que resolverá el problema planteado.","Se escribe el pseudocódigo o diagrama de flujo del programa.","Se codifica la solución en un lenguaje de programación como Python o C++.","Se compila y se ejecuta el programa comprobando los resultados con datos de prueba.","Se depuran los errores y se optimiza el código para mejorar su eficiencia."]'),
('tecnologia','bachillerato','{1,2}','["Se extrae la materia prima necesaria para fabricar el producto tecnológico.","Se transforma el material en componentes mediante procesos industriales.","Se ensamblan las piezas en una línea de producción automatizada.","El producto terminado se distribuye y se utiliza durante su vida útil.","Al final de su vida el producto se recicla o se reutilizan sus componentes."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('tecnologia','bachillerato','{1,2}','La ley de Ohm establece que la resistencia es directamente proporcional a la intensidad de corriente'),
('tecnologia','bachillerato','{1,2}','En un circuito en serie el voltaje es el mismo en todos los componentes conectados'),
('tecnologia','bachillerato','{1,2}','El diodo es un componente que permite el paso de corriente eléctrica en ambos sentidos'),
('tecnologia','bachillerato','{1,2}','La energía nuclear es una fuente renovable porque utiliza uranio que se regenera naturalmente'),
('tecnologia','bachillerato','{1,2}','Los condensadores almacenan energía en forma de campo magnético dentro del circuito eléctrico'),
('tecnologia','bachillerato','{1,2}','La corriente continua cambia de polaridad periódicamente como la que llega a nuestros enchufes domésticos'),
('tecnologia','bachillerato','{1,2}','Los engranajes transmiten movimiento entre ejes paralelos sin modificar la velocidad de giro'),
('tecnologia','bachillerato','{1,2}','La potencia eléctrica se mide en ohmios y se calcula multiplicando voltaje por resistencia'),
('tecnologia','bachillerato','{1,2}','Los paneles solares térmicos generan electricidad a partir de la radiación solar mediante células fotovoltaicas'),
('tecnologia','bachillerato','{1,2}','El transistor es un componente pasivo que no necesita alimentación externa para funcionar correctamente'),
('tecnologia','bachillerato','{1,2}','Arduino es un sistema operativo diseñado para programar aplicaciones de inteligencia artificial'),
('tecnologia','bachillerato','{1,2}','La eficiencia de una máquina puede superar el cien por cien si se aprovecha correctamente la energía residual');

-- ---------------------------------------------------------------------------
-- comprension_texts — tecnologia
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('tecnologia','bachillerato','{1,2}','La revolución de los microcontroladores',
'Los microcontroladores han democratizado el acceso a la electrónica y la programación. Dispositivos como Arduino, creado en 2005 en el Instituto de Diseño Interactivo de Ivrea (Italia), permiten a estudiantes y aficionados crear proyectos electrónicos interactivos sin necesidad de conocimientos avanzados en ingeniería. Un microcontrolador es un pequeño ordenador integrado en un solo chip que contiene un procesador, memoria RAM, memoria de programa y puertos de entrada y salida. Mediante un lenguaje de programación basado en C++, los usuarios pueden escribir código que controle sensores (temperatura, luz, distancia), actuadores (motores, LEDs, servos) y módulos de comunicación (WiFi, Bluetooth). Las aplicaciones son prácticamente ilimitadas: desde estaciones meteorológicas domésticas hasta robots autónomos, sistemas de riego inteligente o instrumentos musicales electrónicos. El movimiento maker, impulsado por plataformas como Arduino y Raspberry Pi, ha fomentado una cultura de innovación, colaboración y aprendizaje práctico que conecta la tecnología con la creatividad. En el ámbito educativo, los microcontroladores se han convertido en una herramienta fundamental para enseñar programación, electrónica y pensamiento computacional de forma motivadora.',
'[{"pregunta":"¿Dónde se creó Arduino?","opciones":["Estados Unidos","Japón","Italia","Alemania"],"correcta":2},{"pregunta":"¿Qué contiene un microcontrolador?","opciones":["Solo un procesador","Procesador, memoria y puertos E/S","Solo memoria","Solo puertos de comunicación"],"correcta":1},{"pregunta":"¿En qué lenguaje se programa Arduino?","opciones":["Python","Java","Basado en C++","HTML"],"correcta":2},{"pregunta":"¿Qué movimiento cultural ha impulsado Arduino?","opciones":["Movimiento punk","Movimiento maker","Movimiento hippie","Movimiento arts and crafts"],"correcta":1}]'),
('tecnologia','bachillerato','{1,2}','Energías renovables y transición energética',
'La transición energética es el proceso de cambio desde un sistema basado en combustibles fósiles hacia uno basado en fuentes de energía renovables y sostenibles. Los combustibles fósiles (carbón, petróleo y gas natural) han sido la principal fuente de energía durante más de dos siglos, pero su combustión libera grandes cantidades de dióxido de carbono, el principal gas de efecto invernadero responsable del cambio climático. Las energías renovables aprovechan recursos naturales inagotables: la energía solar utiliza la radiación del sol mediante paneles fotovoltaicos o térmicos; la energía eólica aprovecha la fuerza del viento con aerogeneradores; la energía hidráulica emplea el movimiento del agua en embalses y ríos; y la energía geotérmica utiliza el calor interno de la Tierra. España cuenta con un gran potencial renovable gracias a sus condiciones climáticas y geográficas privilegiadas. El almacenamiento de energía en baterías y la producción de hidrógeno verde son tecnologías clave para superar la intermitencia de las renovables. La transición energética no solo es una necesidad medioambiental sino también una oportunidad económica que genera empleo y reduce la dependencia de las importaciones de combustibles.',
'[{"pregunta":"¿Cuál es el principal gas de efecto invernadero mencionado?","opciones":["Metano","Dióxido de carbono","Óxido nitroso","Ozono"],"correcta":1},{"pregunta":"¿Qué tecnología se menciona para superar la intermitencia renovable?","opciones":["Centrales térmicas","Baterías e hidrógeno verde","Energía nuclear","Petróleo sintético"],"correcta":1},{"pregunta":"¿Qué aprovecha la energía geotérmica?","opciones":["El viento","El sol","El calor interno de la Tierra","Las mareas"],"correcta":2},{"pregunta":"¿Por qué España tiene gran potencial renovable?","opciones":["Por su industria pesada","Por sus condiciones climáticas y geográficas","Por sus reservas de carbón","Por su población"],"correcta":1}]'),
('tecnologia','bachillerato','{1,2}','Automatización y robótica industrial',
'La automatización industrial consiste en el uso de tecnología para controlar y supervisar procesos de producción con mínima intervención humana. Los sistemas automatizados utilizan tres elementos fundamentales: sensores que detectan magnitudes físicas del entorno (temperatura, presión, posición), controladores que procesan la información y toman decisiones según un programa almacenado, y actuadores que ejecutan las acciones necesarias (motores, electroválvulas, cilindros neumáticos). Los controladores lógicos programables (PLC) son los dispositivos más utilizados en la industria para gestionar procesos automatizados. La robótica industrial ha transformado sectores como la automoción, la alimentación y la logística, donde los robots realizan tareas de soldadura, pintura, ensamblaje y empaquetado con una precisión y velocidad inalcanzables para el trabajo manual. Los robots colaborativos o cobots representan la última generación: trabajan junto a operarios humanos de forma segura, combinando la flexibilidad humana con la precisión robótica. La Industria 4.0, también llamada cuarta revolución industrial, integra la automatización con el Internet de las cosas, el big data y la inteligencia artificial para crear fábricas inteligentes capaces de adaptarse en tiempo real a las demandas del mercado.',
'[{"pregunta":"¿Cuáles son los tres elementos fundamentales de un sistema automatizado?","opciones":["Motor, batería y cable","Sensor, controlador y actuador","Teclado, pantalla y ratón","CPU, RAM y disco duro"],"correcta":1},{"pregunta":"¿Qué significa PLC?","opciones":["Programa Lógico Computacional","Procesador Lineal de Comandos","Controlador Lógico Programable","Plataforma Lógica de Control"],"correcta":2},{"pregunta":"¿Qué son los cobots?","opciones":["Robots de combate","Robots colaborativos","Robots de cocina","Robots de limpieza"],"correcta":1},{"pregunta":"¿Qué integra la Industria 4.0?","opciones":["Solo robótica","Automatización, IoT, big data e IA","Solo inteligencia artificial","Solo sensores"],"correcta":1}]');


-- #############################################################################
-- EDUCACIÓN FÍSICA (1º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Capacidad del organismo para mantener un esfuerzo prolongado en el tiempo','aerobico','ed-fisica','bachillerato','{1}',1),
('B','empieza','Pulsaciones del corazón por minuto medidas en reposo o durante el ejercicio','bradicardia','ed-fisica','bachillerato','{1}',3),
('C','empieza','Capacidad física básica que permite mantener un esfuerzo durante un tiempo prolongado','capacidad','ed-fisica','bachillerato','{1}',1),
('D','empieza','Práctica de ingerir líquidos para reponer el agua perdida durante el ejercicio','deshidratacion','ed-fisica','bachillerato','{1}',2),
('E','empieza','Conjunto de ejercicios de baja intensidad que se realizan después de la actividad física principal','estiramiento','ed-fisica','bachillerato','{1}',1),
('F','empieza','Capacidad del músculo para generar tensión contra una resistencia externa','fuerza','ed-fisica','bachillerato','{1}',1),
('G','empieza','Molécula de azúcar almacenada en el hígado y los músculos como reserva energética','glucogeno','ed-fisica','bachillerato','{1}',2),
('H','empieza','Aumento del tamaño de las fibras musculares como resultado del entrenamiento de fuerza','hipertrofia','ed-fisica','bachillerato','{1}',2),
('I','empieza','Método de entrenamiento que alterna periodos de esfuerzo intenso con recuperación activa','intervalico','ed-fisica','bachillerato','{1}',2),
('J','contiene','Tipo de ejercicio que implica estirar los músculos para mejorar la amplitud de movimiento','estiraje','ed-fisica','bachillerato','{1}',2),
('K','contiene','Unidad de medida de energía utilizada para cuantificar el valor calórico de los alimentos','kilocaloria','ed-fisica','bachillerato','{1}',1),
('L','empieza','Tipo de lesión producida por un estiramiento excesivo de los ligamentos articulares','lesion','ed-fisica','bachillerato','{1}',1),
('M','empieza','Nutrientes que el organismo necesita en grandes cantidades como proteínas grasas y carbohidratos','macronutrientes','ed-fisica','bachillerato','{1}',2),
('N','empieza','Ciencia que estudia la relación entre la alimentación y la salud del organismo','nutricion','ed-fisica','bachillerato','{1}',1),
('O','empieza','Hueso más largo del cuerpo humano situado en el muslo','femur','ed-fisica','bachillerato','{1}',1),
('P','empieza','Maniobra de reanimación que combina compresiones torácicas y ventilación artificial','primeros','ed-fisica','bachillerato','{1}',1),
('Q','contiene','Nutriente presente en alimentos como el queso que aporta calcio y proteínas al organismo','bioquimica','ed-fisica','bachillerato','{1}',3),
('R','empieza','Capacidad de reaccionar de forma rápida ante un estímulo externo','reaccion','ed-fisica','bachillerato','{1}',1),
('S','empieza','Capacidad física que permite recorrer una distancia en el menor tiempo posible','sprint','ed-fisica','bachillerato','{1}',1),
('T','empieza','Músculo del muslo que extiende la rodilla formado por cuatro cabezas musculares','triceps','ed-fisica','bachillerato','{1}',2),
('U','contiene','Tipo de entrenamiento que combina ejercicios de fuerza y resistencia en un mismo circuito','circuito','ed-fisica','bachillerato','{1}',2),
('V','empieza','Cantidad máxima de oxígeno que el organismo puede consumir durante el ejercicio intenso','vo2max','ed-fisica','bachillerato','{1}',2),
('W','contiene','Técnica de calentamiento dinámico que prepara al cuerpo antes de la actividad física','warmup','ed-fisica','bachillerato','{1}',2),
('X','contiene','Capacidad del cuerpo para mantener la amplitud de movimiento en las articulaciones','flexibilidad','ed-fisica','bachillerato','{1}',1),
('Y','contiene','Disciplina que combina posturas respiración y meditación para mejorar el bienestar físico y mental','yoga','ed-fisica','bachillerato','{1}',1),
('Z','contiene','Tipo de frecuencia cardiaca a la que se recomienda entrenar para quemar grasa','zona','ed-fisica','bachillerato','{1}',2);

-- ---------------------------------------------------------------------------
-- runner_categories — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('ed-fisica','bachillerato','{1}','Músculos del cuerpo','["biceps","triceps","cuadriceps","isquiotibiales","gemelos","gluteos","deltoides","pectorales","abdominales","trapecio","dorsal","soleo"]'),
('ed-fisica','bachillerato','{1}','Capacidades físicas','["fuerza","resistencia","velocidad","flexibilidad","coordinacion","equilibrio","agilidad","potencia","reaccion","ritmo","orientacion","diferenciacion"]'),
('ed-fisica','bachillerato','{1}','Nutrientes','["proteinas","carbohidratos","grasas","vitaminas","minerales","fibra","agua","aminoacidos","glucosa","fructosa","calcio","hierro"]'),
('ed-fisica','bachillerato','{1}','Lesiones deportivas','["esguince","fractura","contractura","tendinitis","rotura","luxacion","contusion","desgarro","fascitis","periostitis","bursitis","calambre"]'),
('ed-fisica','bachillerato','{1}','Huesos del cuerpo','["femur","tibia","humero","radio","cubito","pelvis","clavicula","escapula","vertebra","costilla","perone","rotula"]'),
('ed-fisica','bachillerato','{1}','Primeros auxilios','["reanimacion","vendaje","inmovilizacion","torniquete","desfibrilador","triaje","hemostasia","posicion","compresion","maniobra","evaluacion","traslado"]'),
('ed-fisica','bachillerato','{1}','Métodos de entrenamiento','["continuo","intervalico","repeticiones","circuito","fartlek","cuestas","pliometria","isometrico","pesas","crossfit","hiit","tabata"]'),
('ed-fisica','bachillerato','{1}','Deportes olímpicos','["atletismo","natacion","gimnasia","ciclismo","esgrima","judo","remo","tenis","boxeo","halterofilia","triatlon","piragüismo"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ed-fisica','bachillerato','{1}','Músculos del tren superior','["bíceps","tríceps","deltoides","pectorales"]','["cuádriceps","gemelos"]'),
('ed-fisica','bachillerato','{1}','Capacidades físicas básicas','["fuerza","resistencia","velocidad","flexibilidad"]','["inteligencia","memoria"]'),
('ed-fisica','bachillerato','{1}','Macronutrientes','["proteínas","carbohidratos","grasas","agua"]','["vitamina C","hierro"]'),
('ed-fisica','bachillerato','{1}','Lesiones articulares','["esguince","luxación","bursitis","artritis"]','["contractura","desgarro"]'),
('ed-fisica','bachillerato','{1}','Huesos de la pierna','["fémur","tibia","peroné","rótula"]','["húmero","cúbito"]'),
('ed-fisica','bachillerato','{1}','Acciones en RCP','["comprobar consciencia","abrir vía aérea","dar compresiones","ventilar"]','["aplicar hielo","elevar extremidad"]'),
('ed-fisica','bachillerato','{1}','Sistemas energéticos','["aeróbico","anaeróbico láctico","anaeróbico aláctico","mixto"]','["digestivo","nervioso"]'),
('ed-fisica','bachillerato','{1}','Deportes de raqueta','["tenis","bádminton","pádel","squash"]','["fútbol","natación"]'),
('ed-fisica','bachillerato','{1}','Fases del calentamiento','["movilidad articular","carrera suave","estiramientos dinámicos","ejercicios específicos"]','["vuelta a la calma","ducha"]'),
('ed-fisica','bachillerato','{1}','Vitaminas hidrosolubles','["vitamina C","vitamina B1","vitamina B6","vitamina B12"]','["vitamina A","vitamina D"]');

-- ---------------------------------------------------------------------------
-- parejas_items — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ed-fisica','bachillerato','{1}','Bíceps','Flexión del codo'),
('ed-fisica','bachillerato','{1}','Tríceps','Extensión del codo'),
('ed-fisica','bachillerato','{1}','Cuádriceps','Extensión de rodilla'),
('ed-fisica','bachillerato','{1}','Isquiotibiales','Flexión de rodilla'),
('ed-fisica','bachillerato','{1}','Gemelos','Flexión plantar'),
('ed-fisica','bachillerato','{1}','Pectorales','Aducción del brazo'),
('ed-fisica','bachillerato','{1}','Deltoides','Abducción del hombro'),
('ed-fisica','bachillerato','{1}','Dorsal ancho','Extensión del hombro'),
('ed-fisica','bachillerato','{1}','Proteínas','Reparación muscular'),
('ed-fisica','bachillerato','{1}','Carbohidratos','Energía rápida'),
('ed-fisica','bachillerato','{1}','Grasas','Reserva energética'),
('ed-fisica','bachillerato','{1}','Vitamina D','Absorción del calcio'),
('ed-fisica','bachillerato','{1}','Esguince','Lesión de ligamentos'),
('ed-fisica','bachillerato','{1}','Contractura','Contracción mantenida del músculo'),
('ed-fisica','bachillerato','{1}','VO2 máx','Consumo máximo de oxígeno'),
('ed-fisica','bachillerato','{1}','Fartlek','Cambios de ritmo en carrera'),
('ed-fisica','bachillerato','{1}','HIIT','Intervalos de alta intensidad'),
('ed-fisica','bachillerato','{1}','RCP','Reanimación cardiopulmonar'),
('ed-fisica','bachillerato','{1}','Posición lateral de seguridad','Persona inconsciente que respira'),
('ed-fisica','bachillerato','{1}','Maniobra de Heimlich','Atragantamiento');

-- ---------------------------------------------------------------------------
-- ordena_frases — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('ed-fisica','bachillerato','{1}','El calentamiento previo al ejercicio aumenta la temperatura corporal y prepara los músculos para el esfuerzo'),
('ed-fisica','bachillerato','{1}','La resistencia aeróbica permite mantener un esfuerzo de intensidad moderada durante un periodo prolongado de tiempo'),
('ed-fisica','bachillerato','{1}','Las proteínas son macronutrientes esenciales para la reparación y el crecimiento del tejido muscular después del ejercicio'),
('ed-fisica','bachillerato','{1}','La hidratación adecuada antes durante y después del ejercicio es fundamental para mantener el rendimiento deportivo'),
('ed-fisica','bachillerato','{1}','El entrenamiento de fuerza produce hipertrofia muscular al provocar microrroturas en las fibras que luego se reparan'),
('ed-fisica','bachillerato','{1}','La frecuencia cardiaca máxima se calcula aproximadamente restando la edad del deportista a doscientas veinte pulsaciones'),
('ed-fisica','bachillerato','{1}','Los estiramientos después del ejercicio ayudan a recuperar la longitud muscular y prevenir contracturas y lesiones'),
('ed-fisica','bachillerato','{1}','La reanimación cardiopulmonar consiste en aplicar compresiones torácicas y ventilación artificial para mantener la circulación sanguínea'),
('ed-fisica','bachillerato','{1}','Una dieta equilibrada debe incluir carbohidratos proteínas grasas saludables vitaminas minerales y agua en proporciones adecuadas'),
('ed-fisica','bachillerato','{1}','El índice de masa corporal se calcula dividiendo el peso en kilogramos entre la altura en metros elevada al cuadrado'),
('ed-fisica','bachillerato','{1}','La flexibilidad es la capacidad que permite realizar movimientos con la máxima amplitud articular posible sin dolor'),
('ed-fisica','bachillerato','{1}','El sistema anaeróbico láctico produce energía rápidamente pero genera ácido láctico que limita la duración del esfuerzo'),
('ed-fisica','bachillerato','{1}','El deporte regular reduce el riesgo de enfermedades cardiovasculares diabetes obesidad y trastornos mentales como la depresión'),
('ed-fisica','bachillerato','{1}','La posición lateral de seguridad se utiliza para personas inconscientes que respiran para evitar la obstrucción de la vía aérea'),
('ed-fisica','bachillerato','{1}','El principio de supercompensación explica cómo el organismo se adapta al esfuerzo mejorando su capacidad física tras la recuperación');

-- ---------------------------------------------------------------------------
-- ordena_historias — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('ed-fisica','bachillerato','{1}','["Un deportista se prepara para una carrera de diez kilómetros.","Durante las semanas previas sigue un plan de entrenamiento progresivo con series y rodajes.","La alimentación se ajusta aumentando los carbohidratos los días antes de la competición.","El día de la carrera realiza un calentamiento completo con movilidad y activación muscular.","Tras finalizar la carrera realiza estiramientos y se hidrata para favorecer la recuperación."]'),
('ed-fisica','bachillerato','{1}','["Una persona sufre un desmayo en la calle y cae al suelo.","Un testigo se acerca comprueba la consciencia y la respiración del accidentado.","Al comprobar que respira lo coloca en posición lateral de seguridad.","Llama al 112 y proporciona la ubicación exacta y el estado de la víctima.","Permanece junto al accidentado vigilando su respiración hasta que llega la ambulancia."]'),
('ed-fisica','bachillerato','{1}','["El profesor explica los principios básicos del entrenamiento de fuerza.","Los alumnos realizan un calentamiento general con carrera suave y movilidad articular.","Se organizan por parejas y realizan ejercicios con peso corporal en un circuito.","Cada estación trabaja un grupo muscular diferente durante treinta segundos con descanso.","La sesión termina con una vuelta a la calma que incluye estiramientos estáticos."]'),
('ed-fisica','bachillerato','{1}','["Se detecta que un compañero se está atragantando y no puede hablar ni toser.","Se coloca detrás de la víctima y se rodea su cintura con los brazos.","Se sitúa el puño cerrado entre el ombligo y el esternón de la víctima.","Se realizan compresiones abdominales bruscas hacia arriba y hacia adentro.","Se repiten las compresiones hasta que el objeto es expulsado y la víctima puede respirar."]'),
('ed-fisica','bachillerato','{1}','["Un nutricionista analiza la dieta de un deportista adolescente.","Detecta un déficit de hierro y un exceso de grasas saturadas en su alimentación.","Recomienda aumentar el consumo de legumbres carne roja y verduras de hoja verde.","Sugiere sustituir los ultraprocesados por frutas frutos secos y cereales integrales.","Tras tres meses con la nueva dieta el deportista mejora su rendimiento y sus análisis sanguíneos."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('ed-fisica','bachillerato','{1}','El bíceps es el músculo encargado de extender el codo cuando levantamos un peso con la mano'),
('ed-fisica','bachillerato','{1}','Las proteínas son la principal fuente de energía rápida durante el ejercicio físico intenso'),
('ed-fisica','bachillerato','{1}','La frecuencia cardiaca máxima se calcula sumando la edad del deportista a cien pulsaciones'),
('ed-fisica','bachillerato','{1}','El calentamiento debe realizarse después del ejercicio principal para preparar los músculos para el reposo'),
('ed-fisica','bachillerato','{1}','El VO2 máximo mide la cantidad de dióxido de carbono que el organismo puede eliminar durante el esfuerzo'),
('ed-fisica','bachillerato','{1}','El esguince es una lesión que afecta al tendón del músculo debido a un esfuerzo excesivo'),
('ed-fisica','bachillerato','{1}','La vitamina D se obtiene principalmente de los alimentos ricos en hierro como las legumbres'),
('ed-fisica','bachillerato','{1}','En caso de atragantamiento lo primero que se debe hacer es dar golpes en el pecho de la víctima'),
('ed-fisica','bachillerato','{1}','El sistema aeróbico produce ácido láctico como producto de desecho del metabolismo muscular'),
('ed-fisica','bachillerato','{1}','El índice de masa corporal se calcula dividiendo la altura en metros entre el peso en kilogramos'),
('ed-fisica','bachillerato','{1}','La hipertrofia muscular se consigue principalmente con ejercicios aeróbicos de larga duración y baja intensidad'),
('ed-fisica','bachillerato','{1}','La posición lateral de seguridad se aplica a personas conscientes que están sufriendo un infarto');

-- ---------------------------------------------------------------------------
-- comprension_texts — ed-fisica
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('ed-fisica','bachillerato','{1}','Principios del entrenamiento deportivo',
'El entrenamiento deportivo se rige por una serie de principios fundamentales que determinan su eficacia. El principio de sobrecarga establece que para mejorar una capacidad física es necesario someter al organismo a estímulos superiores a los habituales. El principio de progresión indica que la intensidad del entrenamiento debe aumentar gradualmente para seguir produciendo adaptaciones. El principio de especificidad señala que los efectos del entrenamiento son específicos del tipo de ejercicio realizado: para mejorar la resistencia hay que entrenar la resistencia, para la fuerza hay que trabajar con cargas. El principio de individualización reconoce que cada persona responde de manera diferente al mismo estímulo de entrenamiento, por lo que los programas deben adaptarse a las características individuales. Finalmente, el principio de reversibilidad advierte que los beneficios del entrenamiento se pierden cuando se deja de entrenar, produciéndose un desentrenamiento progresivo. La supercompensación es el proceso por el cual el organismo, tras un periodo de recuperación adecuado, alcanza un nivel de rendimiento superior al inicial, constituyendo la base fisiológica de la mejora deportiva.',
'[{"pregunta":"¿Qué establece el principio de sobrecarga?","opciones":["Entrenar siempre igual","Someter al organismo a estímulos superiores","Descansar más que entrenar","Entrenar solo la fuerza"],"correcta":1},{"pregunta":"¿Qué ocurre cuando se deja de entrenar según el principio de reversibilidad?","opciones":["Se mantiene el nivel","Se mejora sin esfuerzo","Se pierden los beneficios","Se gana flexibilidad"],"correcta":2},{"pregunta":"¿Qué es la supercompensación?","opciones":["Entrenar en exceso","Alcanzar un nivel superior tras la recuperación","Perder rendimiento","Cambiar de deporte"],"correcta":1},{"pregunta":"¿Qué principio dice que cada persona responde diferente al entrenamiento?","opciones":["Sobrecarga","Progresión","Especificidad","Individualización"],"correcta":3}]'),
('ed-fisica','bachillerato','{1}','Nutrición y rendimiento deportivo',
'La nutrición desempeña un papel fundamental en el rendimiento deportivo y la recuperación tras el ejercicio. Los macronutrientes (carbohidratos, proteínas y grasas) aportan la energía necesaria para la actividad física. Los carbohidratos son la fuente de energía preferente durante el ejercicio de intensidad moderada y alta, almacenándose en forma de glucógeno en el hígado y los músculos. Las proteínas son esenciales para la reparación y el crecimiento del tejido muscular, especialmente tras el entrenamiento de fuerza. Las grasas constituyen una reserva energética importante y son la principal fuente de combustible durante el ejercicio de baja intensidad y larga duración. Los micronutrientes (vitaminas y minerales) participan en procesos metabólicos esenciales: el hierro transporta oxígeno en la sangre, el calcio mantiene la salud ósea y las vitaminas del grupo B facilitan la obtención de energía. La hidratación es igualmente crucial: una pérdida de tan solo el dos por ciento del peso corporal en agua puede reducir significativamente el rendimiento físico. Los deportistas deben planificar su alimentación antes, durante y después de la competición para optimizar su rendimiento y acelerar la recuperación muscular.',
'[{"pregunta":"¿Cuál es la fuente de energía preferente durante el ejercicio intenso?","opciones":["Grasas","Proteínas","Carbohidratos","Vitaminas"],"correcta":2},{"pregunta":"¿Para qué son esenciales las proteínas en el deporte?","opciones":["Aportar energía rápida","Reparar y hacer crecer el tejido muscular","Mantener la hidratación","Transportar oxígeno"],"correcta":1},{"pregunta":"¿Qué porcentaje de pérdida de agua reduce el rendimiento?","opciones":["1%","2%","5%","10%"],"correcta":1},{"pregunta":"¿Qué función cumple el hierro según el texto?","opciones":["Fortalece los huesos","Transporta oxígeno en la sangre","Repara los músculos","Almacena glucógeno"],"correcta":1}]'),
('ed-fisica','bachillerato','{1}','Primeros auxilios en el deporte',
'Los primeros auxilios son las acciones inmediatas que se realizan ante una emergencia sanitaria antes de que llegue la asistencia médica profesional. En el ámbito deportivo, las lesiones más frecuentes incluyen esguinces, contusiones, fracturas y golpes de calor. La conducta PAS (Proteger, Avisar, Socorrer) establece el protocolo básico de actuación: primero se protege al accidentado y a uno mismo, después se avisa a los servicios de emergencia (112 en España) y finalmente se socorre aplicando las técnicas adecuadas. Ante una parada cardiorrespiratoria, la reanimación cardiopulmonar (RCP) consiste en realizar compresiones torácicas a un ritmo de cien a ciento veinte por minuto alternadas con ventilaciones de rescate. El uso de un desfibrilador externo automático (DEA) puede ser determinante para la supervivencia de la víctima. Para lesiones musculoesqueléticas se aplica el protocolo RICE: reposo (Rest), hielo (Ice), compresión (Compression) y elevación (Elevation). La maniobra de Heimlich se utiliza en casos de atragantamiento, realizando compresiones abdominales para expulsar el cuerpo extraño. Todos los ciudadanos deberían conocer estas técnicas básicas, ya que la actuación en los primeros minutos puede marcar la diferencia entre la vida y la muerte.',
'[{"pregunta":"¿Qué significa la conducta PAS?","opciones":["Parar, Analizar, Seguir","Proteger, Avisar, Socorrer","Primero Auxiliar Siempre","Prevenir, Actuar, Salvar"],"correcta":1},{"pregunta":"¿A qué ritmo se realizan las compresiones torácicas en RCP?","opciones":["50-80 por minuto","80-100 por minuto","100-120 por minuto","120-150 por minuto"],"correcta":2},{"pregunta":"¿Qué significa RICE?","opciones":["Reposo, Inmovilización, Calor, Ejercicio","Reposo, Hielo, Compresión, Elevación","Rehabilitación, Inyección, Cirugía, Evaluación","Respiración, Inspección, Control, Evacuación"],"correcta":1},{"pregunta":"¿Para qué se utiliza la maniobra de Heimlich?","opciones":["Parada cardíaca","Fractura ósea","Atragantamiento","Golpe de calor"],"correcta":2}]');


-- #############################################################################
-- PROGRAMACIÓN (1º y 2º Bachillerato)
-- #############################################################################

-- ---------------------------------------------------------------------------
-- rosco_questions — programacion
-- ---------------------------------------------------------------------------
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A','empieza','Secuencia finita y ordenada de pasos para resolver un problema','algoritmo','programacion','bachillerato','{1,2}',1),
('B','empieza','Estructura de datos que almacena verdadero o falso','booleano','programacion','bachillerato','{1,2}',1),
('C','empieza','Estructura de control que repite instrucciones mientras se cumpla una condición','bucle','programacion','bachillerato','{1,2}',1),
('D','empieza','Proceso de encontrar y corregir errores en un programa informático','depuracion','programacion','bachillerato','{1,2}',1),
('E','empieza','Mecanismo de la POO por el cual una clase oculta sus datos internos','encapsulamiento','programacion','bachillerato','{1,2}',2),
('F','empieza','Bloque de código reutilizable que recibe parámetros y devuelve un valor','funcion','programacion','bachillerato','{1,2}',1),
('G','contiene','Interfaz visual que permite al usuario interactuar con un programa mediante ventanas y botones','grafica','programacion','bachillerato','{1,2}',2),
('H','empieza','Mecanismo de la POO por el cual una clase adquiere propiedades y métodos de otra','herencia','programacion','bachillerato','{1,2}',2),
('I','empieza','Estructura de control que evalúa una condición y ejecuta código según sea verdadera o falsa','if','programacion','bachillerato','{1,2}',1),
('J','empieza','Lenguaje de programación orientado a objetos muy utilizado en desarrollo web y Android','java','programacion','bachillerato','{1,2}',1),
('K','contiene','Palabra reservada que se utiliza en muchos lenguajes para salir de un bucle','break','programacion','bachillerato','{1,2}',2),
('L','empieza','Estructura de datos dinámica donde cada elemento apunta al siguiente','lista','programacion','bachillerato','{1,2}',1),
('M','empieza','Función definida dentro de una clase en programación orientada a objetos','metodo','programacion','bachillerato','{1,2}',2),
('N','empieza','Valor especial que indica la ausencia de un objeto o dato válido','null','programacion','bachillerato','{1,2}',2),
('O','empieza','Instancia concreta de una clase con sus propios atributos y métodos','objeto','programacion','bachillerato','{1,2}',1),
('P','empieza','Capacidad de un mismo método para comportarse de forma diferente según el contexto','polimorfismo','programacion','bachillerato','{1,2}',2),
('Q','contiene','Lenguaje de consulta utilizado para gestionar bases de datos relacionales','sql','programacion','bachillerato','{1,2}',1),
('R','empieza','Técnica en la que una función se llama a sí misma para resolver un problema','recursividad','programacion','bachillerato','{1,2}',2),
('S','empieza','Secuencia de caracteres alfanuméricos utilizada para representar texto en programación','string','programacion','bachillerato','{1,2}',1),
('T','empieza','Colección de elementos organizados en filas y columnas en una base de datos relacional','tabla','programacion','bachillerato','{1,2}',1),
('U','contiene','Estructura de datos que almacena elementos sin un orden específico y sin repeticiones','conjunto','programacion','bachillerato','{1,2}',2),
('V','empieza','Espacio de memoria con un nombre que almacena un dato que puede cambiar durante la ejecución','variable','programacion','bachillerato','{1,2}',1),
('W','empieza','Tipo de bucle que repite instrucciones mientras la condición sea verdadera','while','programacion','bachillerato','{1,2}',1),
('X','contiene','Formato de marcado utilizado para almacenar y transportar datos estructurados','xml','programacion','bachillerato','{1,2}',2),
('Y','contiene','Lenguaje de programación interpretado de alto nivel conocido por su sintaxis sencilla','python','programacion','bachillerato','{1,2}',1),
('Z','contiene','Estructura que permite almacenar pares clave-valor para buscar datos eficientemente','hash','programacion','bachillerato','{1,2}',2);

-- ---------------------------------------------------------------------------
-- runner_categories — programacion
-- ---------------------------------------------------------------------------
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion','bachillerato','{1,2}','Lenguajes de programación','["python","java","javascript","csharp","cpp","ruby","swift","kotlin","go","rust","php","typescript"]'),
('programacion','bachillerato','{1,2}','Estructuras de datos','["array","lista","pila","cola","arbol","grafo","hashmap","conjunto","tupla","diccionario","heap","nodo"]'),
('programacion','bachillerato','{1,2}','Conceptos de POO','["clase","objeto","herencia","polimorfismo","encapsulamiento","abstraccion","metodo","atributo","constructor","interfaz","sobreescritura","sobrecarga"]'),
('programacion','bachillerato','{1,2}','Algoritmos de ordenación','["burbuja","seleccion","insercion","quicksort","mergesort","heapsort","shellsort","radixsort","counting","bucket","timsort","introsort"]'),
('programacion','bachillerato','{1,2}','Bases de datos','["tabla","columna","fila","clave","indice","consulta","insercion","actualizacion","borrado","relacion","join","transaccion"]'),
('programacion','bachillerato','{1,2}','Desarrollo web','["html","css","javascript","react","angular","vue","node","express","api","json","rest","servidor"]'),
('programacion','bachillerato','{1,2}','Operadores','["suma","resta","multiplicacion","division","modulo","asignacion","comparacion","logico","ternario","incremento","decremento","concatenacion"]'),
('programacion','bachillerato','{1,2}','Palabras reservadas','["if","else","while","for","return","class","import","try","catch","break","continue","switch"]');

-- ---------------------------------------------------------------------------
-- intruso_sets — programacion
-- ---------------------------------------------------------------------------
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('programacion','bachillerato','{1,2}','Tipos de datos primitivos','["int","float","boolean","char"]','["array","lista"]'),
('programacion','bachillerato','{1,2}','Estructuras de control','["if","while","for","switch"]','["print","import"]'),
('programacion','bachillerato','{1,2}','Pilares de la POO','["herencia","polimorfismo","encapsulamiento","abstracción"]','["recursividad","iteración"]'),
('programacion','bachillerato','{1,2}','Lenguajes interpretados','["Python","JavaScript","Ruby","PHP"]','["C","C++"]'),
('programacion','bachillerato','{1,2}','Operadores lógicos','["AND","OR","NOT","XOR"]','["SUMA","RESTA"]'),
('programacion','bachillerato','{1,2}','Comandos SQL','["SELECT","INSERT","UPDATE","DELETE"]','["PRINT","RETURN"]'),
('programacion','bachillerato','{1,2}','Algoritmos de búsqueda','["lineal","binaria","en profundidad","en anchura"]','["burbuja","quicksort"]'),
('programacion','bachillerato','{1,2}','Elementos de una función','["nombre","parámetros","cuerpo","retorno"]','["etiqueta","celda"]'),
('programacion','bachillerato','{1,2}','Tecnologías frontend','["HTML","CSS","JavaScript","React"]','["MySQL","PostgreSQL"]'),
('programacion','bachillerato','{1,2}','Estructuras de datos lineales','["array","lista enlazada","pila","cola"]','["árbol","grafo"]');

-- ---------------------------------------------------------------------------
-- parejas_items — programacion
-- ---------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('programacion','bachillerato','{1,2}','Variable','Almacena un dato con nombre'),
('programacion','bachillerato','{1,2}','Función','Bloque reutilizable de código'),
('programacion','bachillerato','{1,2}','Bucle while','Repite mientras condición verdadera'),
('programacion','bachillerato','{1,2}','Bucle for','Repite un número determinado de veces'),
('programacion','bachillerato','{1,2}','If-else','Estructura condicional'),
('programacion','bachillerato','{1,2}','Array','Colección de elementos indexados'),
('programacion','bachillerato','{1,2}','Clase','Plantilla para crear objetos'),
('programacion','bachillerato','{1,2}','Objeto','Instancia de una clase'),
('programacion','bachillerato','{1,2}','Herencia','Una clase extiende a otra'),
('programacion','bachillerato','{1,2}','Polimorfismo','Mismo método diferente comportamiento'),
('programacion','bachillerato','{1,2}','Encapsulamiento','Ocultar datos internos'),
('programacion','bachillerato','{1,2}','Recursividad','Función que se llama a sí misma'),
('programacion','bachillerato','{1,2}','SQL','Lenguaje de consulta de bases de datos'),
('programacion','bachillerato','{1,2}','SELECT','Consultar datos de una tabla'),
('programacion','bachillerato','{1,2}','INSERT','Añadir registros a una tabla'),
('programacion','bachillerato','{1,2}','HTML','Estructura de una página web'),
('programacion','bachillerato','{1,2}','CSS','Estilo visual de una página web'),
('programacion','bachillerato','{1,2}','API','Interfaz de comunicación entre programas'),
('programacion','bachillerato','{1,2}','JSON','Formato ligero de intercambio de datos'),
('programacion','bachillerato','{1,2}','Git','Sistema de control de versiones');

-- ---------------------------------------------------------------------------
-- ordena_frases — programacion
-- ---------------------------------------------------------------------------
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('programacion','bachillerato','{1,2}','Un algoritmo es una secuencia finita y ordenada de pasos que permite resolver un problema de forma sistemática'),
('programacion','bachillerato','{1,2}','Las variables son espacios de memoria con un nombre asignado que almacenan datos que pueden cambiar durante la ejecución'),
('programacion','bachillerato','{1,2}','Los bucles permiten repetir un bloque de instrucciones mientras se cumpla una condición determinada por el programador'),
('programacion','bachillerato','{1,2}','La programación orientada a objetos organiza el código en clases y objetos que encapsulan datos y comportamientos'),
('programacion','bachillerato','{1,2}','La herencia permite crear nuevas clases que heredan los atributos y métodos de una clase padre ya existente'),
('programacion','bachillerato','{1,2}','Una base de datos relacional organiza la información en tablas relacionadas mediante claves primarias y foráneas'),
('programacion','bachillerato','{1,2}','El lenguaje SQL permite realizar consultas de selección inserción actualización y borrado sobre bases de datos relacionales'),
('programacion','bachillerato','{1,2}','Las funciones recursivas resuelven problemas dividiéndolos en subproblemas más pequeños que siguen la misma estructura'),
('programacion','bachillerato','{1,2}','Una API es una interfaz que permite a diferentes programas comunicarse entre sí intercambiando datos de forma estructurada'),
('programacion','bachillerato','{1,2}','El desarrollo web frontend utiliza HTML para la estructura CSS para el estilo y JavaScript para la interactividad'),
('programacion','bachillerato','{1,2}','Los algoritmos de ordenación como quicksort y mergesort organizan colecciones de datos según un criterio establecido'),
('programacion','bachillerato','{1,2}','La depuración es el proceso de identificar localizar y corregir errores en el código fuente de un programa'),
('programacion','bachillerato','{1,2}','El polimorfismo permite que un mismo método se comporte de forma diferente según la clase del objeto que lo invoca'),
('programacion','bachillerato','{1,2}','Git es un sistema de control de versiones que permite gestionar los cambios del código fuente de forma colaborativa'),
('programacion','bachillerato','{1,2}','Una pila es una estructura de datos que sigue el principio último en entrar primero en salir conocido como LIFO');

-- ---------------------------------------------------------------------------
-- ordena_historias — programacion
-- ---------------------------------------------------------------------------
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('programacion','bachillerato','{1,2}','["Se analiza el problema y se identifican los datos de entrada y la salida esperada.","Se diseña el algoritmo utilizando pseudocódigo o un diagrama de flujo.","Se codifica la solución en un lenguaje de programación como Python o Java.","Se ejecuta el programa y se comprueba que los resultados son correctos con datos de prueba.","Se depuran los errores encontrados y se optimiza el código para mejorar su rendimiento."]'),
('programacion','bachillerato','{1,2}','["Se define la clase Vehiculo con atributos como marca modelo y velocidad.","Se crea un constructor que inicializa los atributos al crear un nuevo objeto.","Se definen métodos como acelerar frenar y mostrar información del vehículo.","Se crea la clase Coche que hereda de Vehiculo y añade el atributo número de puertas.","Se instancian objetos de tipo Coche y se prueban los métodos heredados y propios."]'),
('programacion','bachillerato','{1,2}','["Se diseña el modelo de datos identificando las entidades y sus relaciones.","Se crean las tablas en la base de datos definiendo columnas tipos y claves primarias.","Se establecen las relaciones entre tablas mediante claves foráneas.","Se insertan registros de prueba usando sentencias INSERT de SQL.","Se realizan consultas SELECT con JOIN para obtener información combinada de varias tablas."]'),
('programacion','bachillerato','{1,2}','["El cliente solicita una página web para su negocio de panadería.","Se diseña la estructura HTML con secciones de inicio productos y contacto.","Se aplican estilos CSS para dar un aspecto visual atractivo y responsive.","Se añade JavaScript para crear un formulario de contacto interactivo.","Se publica la página en un servidor web y se prueba en diferentes dispositivos."]'),
('programacion','bachillerato','{1,2}','["Se tiene una lista desordenada de números enteros que hay que ordenar.","Se elige el algoritmo de ordenación más adecuado según el tamaño de los datos.","El algoritmo compara elementos y los intercambia siguiendo su lógica de ordenación.","Se repiten los pasos hasta que todos los elementos están en orden creciente.","Se verifica que la lista final está correctamente ordenada y se analiza la eficiencia del algoritmo."]');

-- ---------------------------------------------------------------------------
-- detective_sentences — programacion
-- ---------------------------------------------------------------------------
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('programacion','bachillerato','{1,2}','Una variable de tipo booleano puede almacenar cualquier número entero positivo o negativo'),
('programacion','bachillerato','{1,2}','El bucle for se ejecuta mientras una condición sea verdadera sin necesitar un contador'),
('programacion','bachillerato','{1,2}','La herencia en POO permite que un objeto copie los atributos de cualquier otro objeto en ejecución'),
('programacion','bachillerato','{1,2}','HTML es un lenguaje de programación que permite crear la lógica y funcionalidad de las páginas web'),
('programacion','bachillerato','{1,2}','La sentencia SELECT de SQL se utiliza para insertar nuevos registros en una tabla de la base de datos'),
('programacion','bachillerato','{1,2}','Una pila sigue el principio primero en entrar primero en salir conocido como FIFO'),
('programacion','bachillerato','{1,2}','El polimorfismo consiste en que una clase puede heredar de múltiples clases padre a la vez'),
('programacion','bachillerato','{1,2}','Python es un lenguaje compilado de bajo nivel que se utiliza principalmente para programar hardware'),
('programacion','bachillerato','{1,2}','Una función recursiva siempre necesita un caso base pero nunca debe llamarse a sí misma directamente'),
('programacion','bachillerato','{1,2}','CSS es el lenguaje que define la estructura y el contenido de una página web mediante etiquetas'),
('programacion','bachillerato','{1,2}','Git es un editor de código fuente que permite escribir programas en múltiples lenguajes de programación'),
('programacion','bachillerato','{1,2}','El algoritmo de búsqueda binaria funciona correctamente con cualquier lista sin importar si está ordenada');

-- ---------------------------------------------------------------------------
-- comprension_texts — programacion
-- ---------------------------------------------------------------------------
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('programacion','bachillerato','{1,2}','Programación orientada a objetos',
'La programación orientada a objetos (POO) es un paradigma de programación que organiza el software en torno a objetos en lugar de funciones y procedimientos. Un objeto es una entidad que combina datos (atributos) y comportamientos (métodos) en una sola unidad. Los objetos se crean a partir de clases, que actúan como plantillas o moldes que definen la estructura y el comportamiento común de un grupo de objetos. La POO se sustenta en cuatro pilares fundamentales. La encapsulación permite ocultar los detalles internos de un objeto, exponiendo solo una interfaz pública. La herencia permite crear nuevas clases que reutilizan y extienden el código de clases existentes, estableciendo jerarquías de clases. El polimorfismo permite que objetos de diferentes clases respondan al mismo mensaje de formas distintas. La abstracción permite modelar entidades del mundo real identificando sus características esenciales e ignorando los detalles irrelevantes. Lenguajes como Java, Python, C++ y C# implementan estos principios y son ampliamente utilizados en la industria del software para desarrollar aplicaciones empresariales, videojuegos, aplicaciones móviles y sistemas embebidos.',
'[{"pregunta":"¿Qué es una clase en POO?","opciones":["Una instancia concreta","Una plantilla para crear objetos","Un tipo de variable","Un método especial"],"correcta":1},{"pregunta":"¿Cuántos pilares fundamentales tiene la POO?","opciones":["Dos","Tres","Cuatro","Cinco"],"correcta":2},{"pregunta":"¿Qué permite la herencia?","opciones":["Ocultar datos internos","Crear clases que extienden otras","Responder de formas distintas","Modelar entidades reales"],"correcta":1},{"pregunta":"¿Qué pilar permite que objetos diferentes respondan al mismo mensaje de formas distintas?","opciones":["Encapsulación","Herencia","Polimorfismo","Abstracción"],"correcta":2}]'),
('programacion','bachillerato','{1,2}','Bases de datos relacionales',
'Las bases de datos relacionales son sistemas de almacenamiento de información que organizan los datos en tablas compuestas por filas (registros) y columnas (campos). Cada tabla representa una entidad del mundo real, como clientes, productos o pedidos. Las relaciones entre tablas se establecen mediante claves: la clave primaria identifica de forma única cada registro dentro de una tabla, mientras que la clave foránea hace referencia a la clave primaria de otra tabla, estableciendo así la relación. El lenguaje SQL (Structured Query Language) es el estándar para interactuar con bases de datos relacionales. Las operaciones fundamentales son: SELECT para consultar datos, INSERT para añadir nuevos registros, UPDATE para modificar registros existentes y DELETE para eliminarlos. La cláusula JOIN permite combinar datos de varias tablas relacionadas en una sola consulta. Los sistemas gestores de bases de datos más utilizados incluyen MySQL, PostgreSQL, Oracle y SQL Server. El diseño correcto de una base de datos requiere un proceso de normalización que elimina la redundancia de datos y garantiza la integridad referencial, asegurando que las relaciones entre tablas sean consistentes y los datos se almacenen de forma eficiente.',
'[{"pregunta":"¿Cómo se organizan los datos en una base de datos relacional?","opciones":["En archivos de texto","En tablas con filas y columnas","En listas enlazadas","En árboles binarios"],"correcta":1},{"pregunta":"¿Para qué sirve la clave foránea?","opciones":["Identificar registros únicos","Establecer relaciones entre tablas","Ordenar los datos","Eliminar registros"],"correcta":1},{"pregunta":"¿Qué operación SQL se usa para modificar registros?","opciones":["SELECT","INSERT","UPDATE","DELETE"],"correcta":2},{"pregunta":"¿Qué proceso elimina la redundancia en el diseño de bases de datos?","opciones":["Indexación","Normalización","Compilación","Depuración"],"correcta":1}]'),
('programacion','bachillerato','{1,2}','Algoritmos de ordenación',
'Los algoritmos de ordenación son procedimientos que reorganizan los elementos de una colección de datos según un criterio específico, generalmente de menor a mayor o viceversa. La eficiencia de un algoritmo se mide por su complejidad temporal, expresada con la notación Big O. Los algoritmos más sencillos, como el de burbuja (Bubble Sort), la selección (Selection Sort) y la inserción (Insertion Sort), tienen una complejidad de O(n²) en el caso promedio, lo que significa que su tiempo de ejecución crece de forma cuadrática con el número de elementos. Son adecuados para listas pequeñas pero ineficientes para grandes volúmenes de datos. Los algoritmos más eficientes, como Quicksort y Mergesort, tienen una complejidad promedio de O(n log n). Quicksort elige un elemento pivote y divide la lista en dos sublistas: elementos menores y mayores que el pivote, repitiendo el proceso recursivamente. Mergesort divide la lista por la mitad recursivamente hasta obtener sublistas de un elemento y luego las fusiona de forma ordenada. La elección del algoritmo depende del contexto: tamaño de los datos, si están parcialmente ordenados, la memoria disponible y si se necesita un algoritmo estable que mantenga el orden relativo de elementos iguales.',
'[{"pregunta":"¿Qué notación se usa para expresar la complejidad temporal?","opciones":["Notación decimal","Notación Big O","Notación binaria","Notación científica"],"correcta":1},{"pregunta":"¿Cuál es la complejidad del algoritmo de burbuja?","opciones":["O(n)","O(n log n)","O(n²)","O(log n)"],"correcta":2},{"pregunta":"¿Qué hace Quicksort con el pivote?","opciones":["Lo elimina","Divide la lista en menores y mayores que él","Lo coloca al principio siempre","Lo duplica"],"correcta":1},{"pregunta":"¿Qué significa que un algoritmo sea estable?","opciones":["No tiene errores","Mantiene el orden relativo de elementos iguales","Siempre termina","Usa poca memoria"],"correcta":1}]');

COMMIT;
