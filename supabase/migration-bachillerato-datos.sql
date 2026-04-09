-- ============================================================
-- MIGRACIÓN: Datos adicionales para Bachillerato
-- Ordena Frases, Ordena Historias, Detective, Comprensión,
-- y más Rosco/Runner para asignaturas pendientes
-- ============================================================

-- ============================================================
-- 1. ORDENA FRASES — Bachillerato
-- ============================================================

INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
-- Lengua 1º-2º
('lengua', 'bachillerato', '{1,2}', 'La metáfora identifica un término real con otro imaginario estableciendo una relación de semejanza'),
('lengua', 'bachillerato', '{1,2}', 'El Renacimiento recuperó los modelos clásicos grecolatinos como ideal de belleza y armonía'),
('lengua', 'bachillerato', '{1,2}', 'Garcilaso de la Vega introdujo el soneto italianizante en la poesía española del siglo XVI'),
('lengua', 'bachillerato', '{1,2}', 'La Generación del 27 fusionó la tradición popular con las vanguardias europeas'),
('lengua', 'bachillerato', '{1,2}', 'El ensayo es un género literario en prosa que expone ideas de forma argumentativa y personal'),
('lengua', 'bachillerato', '{1,2}', 'La oración subordinada sustantiva desempeña las mismas funciones que un sustantivo'),
('lengua', 'bachillerato', '{1,2}', 'El Barroco se caracteriza por la complejidad formal y el contraste entre apariencia y realidad'),
('lengua', 'bachillerato', '{1,2}', 'Cervantes creó la novela moderna con Don Quijote de la Mancha publicada en 1605'),
-- Filosofía 1º
('filosofia', 'bachillerato', '{1}', 'Platón distinguía entre el mundo sensible de las apariencias y el mundo inteligible de las Ideas'),
('filosofia', 'bachillerato', '{1}', 'Aristóteles consideraba que la felicidad se alcanza mediante la práctica de las virtudes'),
('filosofia', 'bachillerato', '{1}', 'Descartes estableció la duda metódica como punto de partida del conocimiento filosófico'),
('filosofia', 'bachillerato', '{1}', 'Kant distinguió entre los juicios analíticos a priori y los juicios sintéticos a posteriori'),
('filosofia', 'bachillerato', '{1}', 'El imperativo categórico de Kant exige actuar según una máxima universalizable'),
('filosofia', 'bachillerato', '{1}', 'Nietzsche criticó la moral tradicional y propuso la transvaloración de todos los valores'),
('filosofia', 'bachillerato', '{1}', 'El existencialismo de Sartre afirma que la existencia precede a la esencia'),
('filosofia', 'bachillerato', '{1}', 'La epistemología estudia la naturaleza del conocimiento y sus condiciones de validez'),
-- Matemáticas 1º
('matematicas', 'bachillerato', '{1}', 'El límite de una función describe el valor al que se aproxima cuando la variable tiende a un punto'),
('matematicas', 'bachillerato', '{1}', 'La derivada de una función en un punto representa la pendiente de la recta tangente'),
('matematicas', 'bachillerato', '{1}', 'Una función es continua en un punto si el límite coincide con el valor de la función'),
('matematicas', 'bachillerato', '{1}', 'El determinante de una matriz cuadrada indica si el sistema de ecuaciones tiene solución única'),
('matematicas', 'bachillerato', '{1}', 'La integral definida calcula el área encerrada entre una curva y el eje de abscisas'),
('matematicas', 'bachillerato', '{1}', 'Dos vectores son linealmente independientes si ninguno es múltiplo escalar del otro'),
-- Historia del Mundo 1º
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Francesa de 1789 puso fin al Antiguo Régimen y proclamó los derechos del hombre'),
('historia-mundo', 'bachillerato', '{1}', 'La Revolución Industrial transformó la producción artesanal en producción fabril mecanizada'),
('historia-mundo', 'bachillerato', '{1}', 'El Tratado de Versalles impuso duras condiciones a Alemania tras la Primera Guerra Mundial'),
('historia-mundo', 'bachillerato', '{1}', 'La Guerra Fría dividió el mundo en dos bloques liderados por Estados Unidos y la Unión Soviética'),
('historia-mundo', 'bachillerato', '{1}', 'La caída del Muro de Berlín en 1989 simbolizó el fin de la división ideológica de Europa'),
('historia-mundo', 'bachillerato', '{1}', 'El proceso de descolonización acelerado tras 1945 transformó el mapa político de África y Asia'),
-- Física y Química 1º
('fisica', 'bachillerato', '{1}', 'La segunda ley de Newton establece que la fuerza es igual a la masa por la aceleración'),
('fisica', 'bachillerato', '{1}', 'La energía cinética de un cuerpo depende de su masa y del cuadrado de su velocidad'),
('fisica', 'bachillerato', '{1}', 'En una reacción química se conserva la masa total según la ley de Lavoisier'),
('fisica', 'bachillerato', '{1}', 'El número atómico indica la cantidad de protones presentes en el núcleo de un átomo'),
('fisica', 'bachillerato', '{1}', 'La tabla periódica organiza los elementos químicos según su número atómico creciente'),
('fisica', 'bachillerato', '{1}', 'El principio de conservación de la energía establece que esta no se crea ni se destruye'),
-- Biología 1º
('biologia', 'bachillerato', '{1}', 'La mitosis produce dos células hijas genéticamente idénticas a la célula madre'),
('biologia', 'bachillerato', '{1}', 'La fotosíntesis transforma la energía luminosa en energía química almacenada en glucosa'),
('biologia', 'bachillerato', '{1}', 'El ADN se replica de forma semiconservativa antes de la división celular'),
('biologia', 'bachillerato', '{1}', 'Las enzimas son proteínas que actúan como catalizadores biológicos acelerando las reacciones'),
('biologia', 'bachillerato', '{1}', 'La meiosis reduce a la mitad el número de cromosomas para formar los gametos'),
('biologia', 'bachillerato', '{1}', 'La respiración celular degrada la glucosa para obtener energía en forma de ATP'),
-- Economía 1º
('economia', 'bachillerato', '{1}', 'La ley de la oferta y la demanda determina el precio de equilibrio en un mercado competitivo'),
('economia', 'bachillerato', '{1}', 'El Producto Interior Bruto mide el valor total de los bienes y servicios producidos en un país'),
('economia', 'bachillerato', '{1}', 'La inflación es el aumento generalizado y sostenido de los precios de bienes y servicios'),
('economia', 'bachillerato', '{1}', 'El Banco Central Europeo controla la política monetaria de la zona euro'),
('economia', 'bachillerato', '{1}', 'Un monopolio existe cuando una sola empresa controla toda la oferta de un producto'),
('economia', 'bachillerato', '{1}', 'El coste de oportunidad es el valor de la mejor alternativa a la que se renuncia al elegir'),
-- Latín 1º
('latin', 'bachillerato', '{1}', 'El latín es la lengua madre del español y de las demás lenguas románicas'),
('latin', 'bachillerato', '{1}', 'La tercera declinación latina incluye sustantivos de tema en consonante y en vocal'),
('latin', 'bachillerato', '{1}', 'Virgilio escribió la Eneida narrando el viaje de Eneas desde Troya hasta Italia'),
('latin', 'bachillerato', '{1}', 'El ablativo absoluto es una construcción participial independiente del resto de la oración'),
-- Historia de España 2º
('historia-espana', 'bachillerato', '{2}', 'La Reconquista fue el proceso de recuperación cristiana del territorio peninsular musulmán'),
('historia-espana', 'bachillerato', '{2}', 'Los Reyes Católicos unificaron los reinos de Castilla y Aragón con su matrimonio en 1469'),
('historia-espana', 'bachillerato', '{2}', 'La Constitución de 1978 estableció la monarquía parlamentaria como forma de gobierno'),
('historia-espana', 'bachillerato', '{2}', 'La Transición española fue el proceso pacífico de paso de la dictadura a la democracia'),
('historia-espana', 'bachillerato', '{2}', 'La Guerra Civil española enfrentó al bando republicano contra los sublevados entre 1936 y 1939'),
('historia-espana', 'bachillerato', '{2}', 'El Sexenio Democrático fue un periodo de gobierno liberal progresista entre 1868 y 1874'),
-- Química 2º
('quimica', 'bachillerato', '{2}', 'El principio de Le Chatelier establece que un sistema en equilibrio se opone a las perturbaciones'),
('quimica', 'bachillerato', '{2}', 'La electrolisis utiliza corriente eléctrica para provocar una reacción química no espontánea'),
('quimica', 'bachillerato', '{2}', 'La velocidad de reacción depende de la concentración de los reactivos y de la temperatura'),
('quimica', 'bachillerato', '{2}', 'Los isómeros son compuestos con la misma fórmula molecular pero diferente estructura'),
('quimica', 'bachillerato', '{2}', 'Una reacción redox implica transferencia de electrones entre las especies químicas'),
('quimica', 'bachillerato', '{2}', 'La entalpía de una reacción indica si el proceso es exotérmico o endotérmico'),
-- Geografía 2º
('geografia', 'bachillerato', '{2}', 'España presenta un relieve variado con una meseta central rodeada de cordilleras periféricas'),
('geografia', 'bachillerato', '{2}', 'El clima mediterráneo se caracteriza por veranos secos y calurosos e inviernos templados y húmedos'),
('geografia', 'bachillerato', '{2}', 'La población española se concentra principalmente en las áreas litorales y las grandes ciudades'),
('geografia', 'bachillerato', '{2}', 'El sector servicios representa más del sesenta por ciento del PIB español'),
('geografia', 'bachillerato', '{2}', 'La Unión Europea ha transformado la economía española desde la integración en 1986'),
-- Arte 2º
('arte', 'bachillerato', '{2}', 'El arte románico se desarrolló entre los siglos XI y XIII con arquitectura de muros gruesos'),
('arte', 'bachillerato', '{2}', 'El Renacimiento italiano recuperó los cánones estéticos de la Antigüedad clásica'),
('arte', 'bachillerato', '{2}', 'El Impresionismo capturó los efectos de la luz natural mediante pinceladas sueltas de color'),
('arte', 'bachillerato', '{2}', 'Picasso revolucionó el arte con el Cubismo descomponiendo las formas en planos geométricos'),
('arte', 'bachillerato', '{2}', 'Las Meninas de Velázquez es una obra maestra del Barroco español por su uso de la perspectiva'),
-- Inglés 1º-2º
('ingles', 'bachillerato', '{1,2}', 'The Industrial Revolution transformed manufacturing processes throughout Europe in the nineteenth century'),
('ingles', 'bachillerato', '{1,2}', 'Climate change is one of the most pressing challenges facing humanity in the twenty first century'),
('ingles', 'bachillerato', '{1,2}', 'Artificial intelligence is rapidly transforming the way we work and communicate with each other'),
('ingles', 'bachillerato', '{1,2}', 'Shakespeare is widely regarded as one of the greatest writers in the English language'),
('ingles', 'bachillerato', '{1,2}', 'The European Union was established to promote economic cooperation and political stability');

-- ============================================================
-- 2. ORDENA HISTORIAS — Bachillerato
-- ============================================================

INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
-- Historia del Mundo 1º
('historia-mundo', 'bachillerato', '{1}', '["Estalla la Revolución Francesa en 1789 con la toma de la Bastilla","Se proclama la Declaración de los Derechos del Hombre y del Ciudadano","Robespierre instaura el periodo del Terror con ejecuciones masivas","Napoleón da un golpe de Estado y se proclama cónsul en 1799","Napoleón se corona emperador de Francia en 1804"]'),
('historia-mundo', 'bachillerato', '{1}', '["El archiduque Francisco Fernando es asesinado en Sarajevo en 1914","Austria-Hungría declara la guerra a Serbia y se activan las alianzas","Las trincheras definen el frente occidental en una guerra de desgaste","Estados Unidos entra en la guerra en 1917 inclinando la balanza","Se firma el armisticio el 11 de noviembre de 1918"]'),
('historia-mundo', 'bachillerato', '{1}', '["La crisis económica de 1929 provoca el crack de Wall Street","El desempleo masivo y la miseria extienden el descontento social","Hitler es nombrado canciller de Alemania en enero de 1933","Alemania invade Polonia el 1 de septiembre de 1939","Comienza la Segunda Guerra Mundial con la declaración de guerra aliada"]'),
('historia-mundo', 'bachillerato', '{1}', '["La URSS y EE.UU. emergen como superpotencias tras la Segunda Guerra Mundial","Se crea la OTAN como alianza militar occidental en 1949","La URSS forma el Pacto de Varsovia como respuesta en 1955","La crisis de los misiles de Cuba lleva al mundo al borde de la guerra nuclear","Gorbachov impulsa la Perestroika y la Glasnost en la URSS en los años 80"]'),
-- Filosofía 1º
('filosofia', 'bachillerato', '{1}', '["Los primeros filósofos presocráticos buscan el origen de todas las cosas","Sócrates propone el diálogo y la mayéutica como método filosófico","Platón funda la Academia y desarrolla la teoría de las Ideas","Aristóteles sistematiza el conocimiento y funda el Liceo","La filosofía helenística se centra en la ética y la felicidad individual"]'),
('filosofia', 'bachillerato', '{1}', '["Descartes inaugura la filosofía moderna con la duda metódica","El racionalismo y el empirismo debaten sobre el origen del conocimiento","Kant propone la síntesis entre razón y experiencia en la Crítica de la razón pura","Hegel desarrolla la dialéctica como motor de la historia","Marx aplica la dialéctica al análisis de la sociedad y la economía"]'),
-- Biología 1º
('biologia', 'bachillerato', '{1}', '["El ADN se desenrolla y las cadenas se separan por acción de la helicasa","La ARN polimerasa sintetiza una cadena de ARN mensajero complementaria","El ARNm sale del núcleo y se une a un ribosoma en el citoplasma","Los ARN de transferencia aportan los aminoácidos correspondientes a cada codón","La cadena de aminoácidos se pliega formando una proteína funcional"]'),
('biologia', 'bachillerato', '{1}', '["La célula entra en la fase S del ciclo celular y replica su ADN","En la profase los cromosomas se condensan y se hace visible la cromatina","Durante la metafase los cromosomas se alinean en el plano ecuatorial","En la anafase las cromátidas hermanas se separan hacia polos opuestos","La telofase reconstituye las membranas nucleares y se completa la citocinesis"]'),
-- Física 1º
('fisica', 'bachillerato', '{1}', '["Dalton propone el primer modelo atómico como esferas indivisibles","Thomson descubre el electrón y propone el modelo del budín de pasas","Rutherford demuestra la existencia del núcleo atómico con su experimento","Bohr introduce órbitas cuantizadas para los electrones alrededor del núcleo","El modelo mecánico-cuántico describe los electrones como nubes de probabilidad"]'),
-- Historia de España 2º
('historia-espana', 'bachillerato', '{2}', '["Los visigodos establecen un reino en la Península tras la caída de Roma","Los musulmanes conquistan la mayor parte de la Península en el 711","Los reinos cristianos inician la Reconquista desde el norte peninsular","Los Reyes Católicos conquistan Granada en 1492 y unifican los reinos","España se convierte en un imperio global con la colonización de América"]'),
('historia-espana', 'bachillerato', '{2}', '["La crisis del 98 provoca la pérdida de las últimas colonias españolas","La dictadura de Primo de Rivera gobierna entre 1923 y 1930","Se proclama la Segunda República española en abril de 1931","La Guerra Civil estalla en julio de 1936 tras el golpe militar","Franco instaura una dictadura que dura hasta su muerte en 1975"]'),
('historia-espana', 'bachillerato', '{2}', '["Franco muere en noviembre de 1975 y Juan Carlos I es proclamado rey","Adolfo Suárez es nombrado presidente del gobierno para liderar la Transición","Se celebran las primeras elecciones democráticas en junio de 1977","Se aprueba la Constitución española por referéndum en diciembre de 1978","España ingresa en la Comunidad Económica Europea en 1986"]'),
-- Química 2º
('quimica', 'bachillerato', '{2}', '["Se identifica el tipo de reacción química: ácido-base, redox o precipitación","Se escribe la ecuación química con reactivos y productos","Se ajusta la ecuación igualando el número de átomos de cada elemento","Se calculan las cantidades molares usando las masas moleculares","Se aplica la estequiometría para determinar la cantidad de producto formado"]'),
-- Arte 2º
('arte', 'bachillerato', '{2}', '["El arte románico domina Europa occidental entre los siglos XI y XII","El gótico introduce la bóveda de crucería y los grandes ventanales","El Renacimiento recupera la proporción clásica y la perspectiva lineal","El Barroco exalta el movimiento, la emoción y los contrastes de luz","El Neoclasicismo retorna a la sobriedad y racionalidad de la Antigüedad"]'),
('arte', 'bachillerato', '{2}', '["Los impresionistas rompen con la tradición académica pintando al aire libre","Los postimpresionistas como Cézanne y Van Gogh exploran nuevas formas","Las vanguardias del siglo XX cuestionan radicalmente la representación","Picasso y Braque fragmentan la realidad en el Cubismo","El arte abstracto abandona completamente la figuración representativa"]');

-- ============================================================
-- 3. DETECTIVE SENTENCES — Bachillerato
-- ============================================================

INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
-- Lengua 1º-2º
('lengua', 'bachillerato', '{1,2}', 'La literatura española del Siglo de Oro abarca el Renacimiento y el Barroco'),
('lengua', 'bachillerato', '{1,2}', 'El soneto es una composición poética de catorce versos endecasílabos'),
('lengua', 'bachillerato', '{1,2}', 'Quevedo y Góngora representan las dos corrientes del Barroco español'),
('lengua', 'bachillerato', '{1,2}', 'Las oraciones subordinadas adverbiales expresan circunstancias de la acción principal'),
('lengua', 'bachillerato', '{1,2}', 'Federico García Lorca fusionó la tradición popular con las técnicas surrealistas'),
('lengua', 'bachillerato', '{1,2}', 'El realismo literario del siglo XIX pretendía retratar la sociedad de forma objetiva'),
-- Filosofía 1º
('filosofia', 'bachillerato', '{1}', 'La mayéutica socrática consiste en hacer preguntas para que el interlocutor descubra la verdad'),
('filosofia', 'bachillerato', '{1}', 'El mito de la caverna de Platón ilustra la diferencia entre apariencia y realidad'),
('filosofia', 'bachillerato', '{1}', 'El empirismo sostiene que todo conocimiento procede de la experiencia sensorial'),
('filosofia', 'bachillerato', '{1}', 'La ética kantiana se basa en el deber y no en las consecuencias de las acciones'),
-- Matemáticas 1º
('matematicas', 'bachillerato', '{1}', 'Una función es derivable en un punto si existe el límite del cociente incremental'),
('matematicas', 'bachillerato', '{1}', 'El teorema de Bolzano garantiza la existencia de una raíz en un intervalo cerrado'),
('matematicas', 'bachillerato', '{1}', 'Los vectores linealmente independientes forman una base del espacio vectorial'),
('matematicas', 'bachillerato', '{1}', 'La probabilidad condicionada mide la probabilidad de un suceso dado que ha ocurrido otro'),
-- Física 1º
('fisica', 'bachillerato', '{1}', 'La ley de Coulomb describe la fuerza entre dos cargas eléctricas puntuales'),
('fisica', 'bachillerato', '{1}', 'La energía mecánica se conserva cuando solo actúan fuerzas conservativas'),
('fisica', 'bachillerato', '{1}', 'El movimiento circular uniforme tiene aceleración centrípeta dirigida al centro'),
('fisica', 'bachillerato', '{1}', 'La velocidad de una reacción química aumenta con la temperatura'),
-- Biología 1º
('biologia', 'bachillerato', '{1}', 'Las mitocondrias son los orgánulos encargados de la respiración celular aerobia'),
('biologia', 'bachillerato', '{1}', 'La doble hélice del ADN está formada por nucleótidos unidos por puentes de hidrógeno'),
('biologia', 'bachillerato', '{1}', 'Las leyes de Mendel explican la herencia de los caracteres genéticos'),
('biologia', 'bachillerato', '{1}', 'La selección natural favorece la supervivencia de los individuos mejor adaptados'),
-- Economía 1º
('economia', 'bachillerato', '{1}', 'La curva de demanda muestra la relación inversa entre precio y cantidad demandada'),
('economia', 'bachillerato', '{1}', 'El mercado de competencia perfecta tiene muchos compradores y vendedores sin poder de mercado'),
('economia', 'bachillerato', '{1}', 'La política fiscal del gobierno regula los impuestos y el gasto público'),
-- Historia de España 2º
('historia-espana', 'bachillerato', '{2}', 'La desamortización de Mendizábal puso en venta los bienes eclesiásticos en 1836'),
('historia-espana', 'bachillerato', '{2}', 'El sistema de la Restauración se basaba en el turno pacífico de partidos'),
('historia-espana', 'bachillerato', '{2}', 'La Constitución de 1978 reconoce el derecho a la autonomía de las nacionalidades'),
-- Química 2º
('quimica', 'bachillerato', '{2}', 'La constante de equilibrio relaciona las concentraciones de productos y reactivos'),
('quimica', 'bachillerato', '{2}', 'Los ácidos carboxílicos contienen el grupo funcional menos COOH'),
('quimica', 'bachillerato', '{2}', 'La entropía mide el grado de desorden de un sistema termodinámico'),
-- Geografía 2º
('geografia', 'bachillerato', '{2}', 'La meseta central es la unidad de relieve más extensa de la Península Ibérica'),
('geografia', 'bachillerato', '{2}', 'El envejecimiento de la población española plantea retos al sistema de pensiones'),
('geografia', 'bachillerato', '{2}', 'El turismo es uno de los principales motores económicos de España'),
-- Arte 2º
('arte', 'bachillerato', '{2}', 'La arquitectura gótica se caracteriza por el arco apuntado y la bóveda de crucería'),
('arte', 'bachillerato', '{2}', 'El claroscuro de Caravaggio revolucionó la pintura barroca europea'),
('arte', 'bachillerato', '{2}', 'El Guernica de Picasso denuncia los horrores del bombardeo durante la Guerra Civil'),
-- Inglés 1º-2º
('ingles', 'bachillerato', '{1,2}', 'The United Nations was founded in 1945 to promote international cooperation and peace'),
('ingles', 'bachillerato', '{1,2}', 'Renewable energy sources are becoming increasingly important in the fight against climate change'),
('ingles', 'bachillerato', '{1,2}', 'Critical thinking skills are essential for evaluating information in the digital age'),
('ingles', 'bachillerato', '{1,2}', 'Globalization has connected economies and cultures around the world in unprecedented ways');

-- ============================================================
-- 4. COMPRENSIÓN TEXTS — Bachillerato
-- ============================================================

INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
-- Filosofía 1º
('filosofia', 'bachillerato', '{1}', 'El mito de la caverna',
'En el libro VII de La República, Platón presenta la alegoría de la caverna. Imagina unos prisioneros encadenados desde su nacimiento en el fondo de una cueva, de espaldas a la entrada. Solo pueden ver las sombras que se proyectan en la pared del fondo, producidas por objetos que pasan frente a un fuego situado detrás de ellos. Para los prisioneros, esas sombras son la única realidad que conocen. Si uno de ellos fuera liberado y obligado a salir al exterior, al principio la luz del sol lo cegaría. Poco a poco se acostumbraría y descubriría el mundo real: los objetos, los árboles, el cielo y finalmente el sol, fuente de toda luz y vida. Si volviera a la caverna para contar lo que ha visto, los demás prisioneros no le creerían y lo tomarían por loco.',
'[{"pregunta":"¿Qué representan las sombras en la pared según Platón?","opciones":["El mundo real","Las apariencias del mundo sensible","Los recuerdos de los prisioneros","Las ideas de los filósofos"],"correcta":1},{"pregunta":"¿Qué simboliza el sol en la alegoría?","opciones":["El fuego de la caverna","La idea del Bien y la verdad suprema","El mundo sensible","La ignorancia humana"],"correcta":1},{"pregunta":"¿Qué le ocurre al prisionero liberado al salir?","opciones":["Se queda dormido","Regresa inmediatamente","La luz lo ciega al principio","Encuentra otra caverna"],"correcta":2},{"pregunta":"¿Cuál es el mensaje principal de la alegoría?","opciones":["La realidad es solo lo que vemos","El conocimiento verdadero requiere superar las apariencias","Los prisioneros son felices en la ignorancia","La filosofía es inútil"],"correcta":1}]'),

-- Biología 1º
('biologia', 'bachillerato', '{1}', 'La fotosíntesis',
'La fotosíntesis es el proceso mediante el cual las plantas, algas y ciertas bacterias convierten la energía luminosa en energía química. Ocurre principalmente en los cloroplastos, orgánulos que contienen el pigmento clorofila, responsable del color verde de las plantas. El proceso se divide en dos fases: la fase luminosa y la fase oscura (ciclo de Calvin). En la fase luminosa, la clorofila absorbe la luz solar y la utiliza para descomponer moléculas de agua (fotólisis), liberando oxígeno como subproducto y generando ATP y NADPH. En la fase oscura, que no requiere luz directa, el CO₂ atmosférico se fija y se reduce utilizando el ATP y NADPH producidos anteriormente, formando glucosa (C₆H₁₂O₆). La ecuación global simplificada es: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂. La fotosíntesis es fundamental para la vida en la Tierra, ya que produce el oxígeno que respiramos y constituye la base de las cadenas alimentarias.',
'[{"pregunta":"¿Dónde ocurre principalmente la fotosíntesis?","opciones":["En las mitocondrias","En los cloroplastos","En el núcleo celular","En los ribosomas"],"correcta":1},{"pregunta":"¿Qué se produce en la fase luminosa?","opciones":["Glucosa y CO₂","Solo oxígeno","ATP, NADPH y oxígeno","Proteínas y lípidos"],"correcta":2},{"pregunta":"¿Qué gas se libera como subproducto de la fotosíntesis?","opciones":["Dióxido de carbono","Nitrógeno","Oxígeno","Hidrógeno"],"correcta":2},{"pregunta":"¿En qué fase se fija el CO₂ atmosférico?","opciones":["En la fase luminosa","En la fotólisis","En el ciclo de Calvin","En la fase de transporte"],"correcta":2}]'),

-- Historia del Mundo 1º
('historia-mundo', 'bachillerato', '{1}', 'La Guerra Fría',
'La Guerra Fría fue el periodo de tensión geopolítica entre Estados Unidos y la Unión Soviética que se extendió aproximadamente desde 1947 hasta 1991. Aunque nunca hubo un enfrentamiento militar directo entre ambas superpotencias, el conflicto se manifestó a través de guerras proxy, carreras armamentísticas, competencia tecnológica y rivalidad ideológica. El mundo quedó dividido en dos bloques: el bloque occidental, liderado por EE.UU. y articulado en la OTAN (1949), y el bloque oriental, liderado por la URSS y organizado en el Pacto de Varsovia (1955). La crisis de los misiles de Cuba (1962) llevó al mundo al borde de una guerra nuclear. La carrera espacial también fue un campo de competencia: la URSS lanzó el Sputnik en 1957 y envió al primer humano al espacio (Gagarin, 1961), pero EE.UU. logró el primer alunizaje en 1969. La Guerra Fría terminó con la caída del Muro de Berlín (1989) y la disolución de la URSS (1991).',
'[{"pregunta":"¿Entre qué años se desarrolló aproximadamente la Guerra Fría?","opciones":["1939-1945","1947-1991","1950-1980","1914-1918"],"correcta":1},{"pregunta":"¿Qué fue la crisis de los misiles de Cuba?","opciones":["Una guerra entre Cuba y EE.UU.","Una crisis que llevó al mundo al borde de la guerra nuclear","La invasión de Cuba por la URSS","Un acuerdo comercial entre Cuba y la URSS"],"correcta":1},{"pregunta":"¿Quién fue el primer humano en el espacio?","opciones":["Neil Armstrong","John Glenn","Yuri Gagarin","Buzz Aldrin"],"correcta":2},{"pregunta":"¿Qué evento simbolizó el fin de la Guerra Fría?","opciones":["La crisis de Cuba","La guerra de Vietnam","La caída del Muro de Berlín","La creación de la OTAN"],"correcta":2}]'),

-- Economía 1º
('economia', 'bachillerato', '{1}', 'La oferta y la demanda',
'La ley de la oferta y la demanda es uno de los principios fundamentales de la economía de mercado. La demanda representa la cantidad de un bien o servicio que los consumidores están dispuestos a comprar a cada nivel de precio: cuando el precio sube, la cantidad demandada tiende a bajar (relación inversa). La oferta representa la cantidad que los productores están dispuestos a vender: cuando el precio sube, la cantidad ofrecida tiende a aumentar (relación directa). El punto donde la curva de oferta y la curva de demanda se cruzan se denomina punto de equilibrio, y determina el precio y la cantidad de equilibrio del mercado. Cuando el precio está por encima del equilibrio, se produce un exceso de oferta (excedente); cuando está por debajo, se produce un exceso de demanda (escasez). Los desplazamientos de las curvas pueden deberse a cambios en los gustos, la renta, los costes de producción o la tecnología.',
'[{"pregunta":"¿Qué ocurre con la cantidad demandada cuando sube el precio?","opciones":["Aumenta","Se mantiene igual","Disminuye","Desaparece"],"correcta":2},{"pregunta":"¿Qué es el punto de equilibrio?","opciones":["El precio más alto posible","Donde se cruzan oferta y demanda","El punto de máximo beneficio","Donde la demanda es cero"],"correcta":1},{"pregunta":"¿Qué ocurre cuando el precio está por debajo del equilibrio?","opciones":["Exceso de oferta","Equilibrio perfecto","Exceso de demanda","Los productores ganan más"],"correcta":2},{"pregunta":"¿Qué puede desplazar la curva de demanda?","opciones":["Solo el precio del producto","Cambios en los gustos o la renta","La cantidad producida","El coste de las materias primas"],"correcta":1}]'),

-- Historia de España 2º
('historia-espana', 'bachillerato', '{2}', 'La Transición española',
'La Transición española es el periodo histórico comprendido entre la muerte de Francisco Franco (20 de noviembre de 1975) y la consolidación del sistema democrático, generalmente situado en torno a 1982 con la llegada del PSOE al poder. Tras la muerte de Franco, Juan Carlos I fue proclamado rey y designó a Adolfo Suárez como presidente del gobierno en julio de 1976. Suárez impulsó la Ley para la Reforma Política, aprobada por las Cortes franquistas y ratificada en referéndum en diciembre de 1976. Las primeras elecciones democráticas se celebraron el 15 de junio de 1977, ganadas por la UCD de Suárez. El consenso entre las fuerzas políticas permitió redactar la Constitución de 1978, aprobada por referéndum el 6 de diciembre. El intento de golpe de Estado del 23 de febrero de 1981 (23-F) fue el momento más crítico, pero la firme postura del rey contribuyó a su fracaso. La Transición es considerada un modelo de cambio pacífico de régimen.',
'[{"pregunta":"¿Quién fue el primer presidente del gobierno tras Franco?","opciones":["Felipe González","Adolfo Suárez","Leopoldo Calvo-Sotelo","Santiago Carrillo"],"correcta":1},{"pregunta":"¿En qué año se aprobó la Constitución española?","opciones":["1975","1976","1977","1978"],"correcta":3},{"pregunta":"¿Qué ocurrió el 23 de febrero de 1981?","opciones":["Se aprobó la Constitución","Murió Franco","Hubo un intento de golpe de Estado","España entró en la CEE"],"correcta":2},{"pregunta":"¿Cuándo se celebraron las primeras elecciones democráticas?","opciones":["Diciembre de 1976","Junio de 1977","Diciembre de 1978","Octubre de 1982"],"correcta":1}]'),

-- Lengua 1º
('lengua', 'bachillerato', '{1,2}', 'El Quijote y la novela moderna',
'El ingenioso hidalgo Don Quijote de la Mancha, publicado en dos partes (1605 y 1615), es considerada la primera novela moderna de la literatura universal. Miguel de Cervantes creó un personaje complejo: un hidalgo manchego que, enloquecido por la lectura de novelas de caballerías, decide hacerse caballero andante. Acompañado de su escudero Sancho Panza, Don Quijote confunde la realidad con la ficción: ve gigantes donde hay molinos de viento y castillos donde hay ventas. Sin embargo, la obra va mucho más allá de la parodia: Cervantes reflexiona sobre la relación entre ficción y realidad, la libertad, la justicia y la condición humana. La estructura narrativa es innovadora: incluye relatos intercalados, juegos metaficcionales (en la segunda parte, los personajes conocen la primera) y una evolución psicológica profunda de los protagonistas. Don Quijote idealiza la realidad mientras Sancho la ve con pragmatismo, pero ambos se influyen mutuamente a lo largo de la obra.',
'[{"pregunta":"¿En qué año se publicó la primera parte del Quijote?","opciones":["1492","1605","1615","1700"],"correcta":1},{"pregunta":"¿Qué confunde Don Quijote con gigantes?","opciones":["Árboles","Castillos","Molinos de viento","Montañas"],"correcta":2},{"pregunta":"¿Qué elemento metaficcional aparece en la segunda parte?","opciones":["Don Quijote escribe un libro","Los personajes conocen la primera parte","Sancho se vuelve loco","Cervantes aparece como personaje"],"correcta":1},{"pregunta":"¿Cómo se define la visión de Sancho Panza?","opciones":["Idealista","Romántica","Pragmática","Pesimista"],"correcta":2}]'),

-- Inglés 1º-2º
('ingles', 'bachillerato', '{1,2}', 'The Impact of Social Media',
'Social media has transformed the way people communicate, share information, and interact with each other. Platforms such as Facebook, Instagram, Twitter, and TikTok have billions of users worldwide and have become integral parts of daily life for many people. On the positive side, social media enables instant communication across distances, facilitates the spread of information, and provides a platform for marginalized voices to be heard. It has also revolutionized marketing and business, allowing companies to reach target audiences with unprecedented precision. However, social media also presents significant challenges. The spread of misinformation and fake news has become a major concern, as false content can go viral before it is fact-checked. Studies have linked excessive social media use to increased anxiety, depression, and feelings of social isolation, particularly among young people. Privacy concerns have also emerged, as platforms collect vast amounts of personal data. The debate about how to regulate social media while preserving free expression remains one of the most important discussions of our time.',
'[{"pregunta":"What is one positive effect of social media mentioned in the text?","opciones":["It replaces traditional education","It enables instant communication across distances","It eliminates all privacy concerns","It reduces business costs to zero"],"correcta":1},{"pregunta":"What is a major concern related to social media?","opciones":["Too few users","The spread of misinformation","Excessive regulation","Lack of marketing tools"],"correcta":1},{"pregunta":"Who is particularly affected by excessive social media use?","opciones":["Elderly people","Business owners","Young people","Politicians"],"correcta":2},{"pregunta":"What ongoing debate does the text mention?","opciones":["Whether to ban all social media","How to regulate social media while preserving free expression","Whether companies should use social media","How to increase the number of platforms"],"correcta":1}]');

-- ============================================================
-- 5. ROSCO ADICIONAL — Asignaturas sin datos previos
-- ============================================================

-- Economía 1º Bach
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Registro contable del total de transacciones económicas de un país con el exterior', 'arancelaria', 'economia', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Institución financiera que custodia depósitos y concede préstamos', 'banco', 'economia', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Capacidad de producir un bien o servicio a menor coste que otro país', 'competitividad', 'economia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Cantidad de un bien o servicio que los consumidores desean comprar a un precio dado', 'demanda', 'economia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Situación del mercado en la que oferta y demanda se igualan', 'equilibrio', 'economia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Política del gobierno que regula impuestos y gasto público', 'fiscal', 'economia', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Aumento generalizado y sostenido del nivel de precios', 'inflacion', 'economia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Estructura de mercado con un único vendedor que controla la oferta', 'monopolio', 'economia', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Cantidad de un bien que los productores están dispuestos a vender a un precio determinado', 'oferta', 'economia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Indicador que mide el valor total de los bienes y servicios producidos en un país', 'pib', 'economia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Periodo de contracción económica con caída del PIB durante al menos dos trimestres', 'recesion', 'economia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Situación en la que los ingresos del Estado superan a los gastos', 'superavit', 'economia', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Pago obligatorio al Estado sin contraprestación directa', 'tributo', 'economia', 'bachillerato', '{1}', 1);

-- Geografía 2º Bach
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Comunidad autónoma del sur de España con capital en Sevilla', 'andalucia', 'geografia', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Tipo de clima predominante en la mayor parte de la Península Ibérica', 'continentalizado', 'geografia', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Fenómeno de pérdida progresiva de población en las zonas rurales', 'despoblacion', 'geografia', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Proceso de envejecimiento progresivo de la estructura demográfica', 'envejecimiento', 'geografia', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Zona costera del Mediterráneo español con gran actividad turística', 'litoral', 'geografia', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Unidad de relieve central de la Península Ibérica', 'meseta', 'geografia', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Cordillera que separa la Península Ibérica de Francia', 'pirineos', 'geografia', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Recurso hídrico fundamental formado por corrientes de agua que desembocan en el mar', 'rio', 'geografia', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Sector económico que incluye servicios y turismo, predominante en España', 'servicios', 'geografia', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Actividad económica que convierte a España en el segundo destino mundial', 'turismo', 'geografia', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Proceso de crecimiento de las ciudades y concentración de población en áreas urbanas', 'urbanizacion', 'geografia', 'bachillerato', '{2}', 1);

-- Arte 2º Bach
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Corriente artística del siglo XX que prescinde de la representación figurativa', 'abstraccion', 'arte', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Estilo artístico del siglo XVII caracterizado por el dinamismo y los contrastes de luz', 'barroco', 'arte', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Vanguardia artística creada por Picasso y Braque que fragmenta las formas en planos', 'cubismo', 'arte', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Corriente artística que busca expresar las emociones internas del artista', 'expresionismo', 'arte', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Estilo arquitectónico medieval con arcos apuntados y vidrieras', 'gotico', 'arte', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Movimiento pictórico del siglo XIX que captura los efectos de la luz natural', 'impresionismo', 'arte', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Corriente artística de principios del siglo XX asociada a Rubén Darío en literatura', 'modernismo', 'arte', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Estilo artístico del siglo XVIII que recupera las formas clásicas grecorromanas', 'neoclasicismo', 'arte', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Técnica artística que permite representar la profundidad en una superficie plana', 'perspectiva', 'arte', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Periodo artístico de los siglos XV-XVI que recupera los ideales de la Antigüedad', 'renacimiento', 'arte', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Vanguardia artística que explora el inconsciente y los sueños, con Dalí como referente', 'surrealismo', 'arte', 'bachillerato', '{2}', 1);

-- ============================================================
-- 6. RUNNER CATEGORIES ADICIONALES — Asignaturas pendientes
-- ============================================================

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
-- Economía empresa 2º
('economia-empresa', 'bachillerato', '{2}', 'Tipos de empresa', '["sociedad anónima","sociedad limitada","cooperativa","autónomo","franquicia","multinacional","PYME","startup","holding","joint venture"]'),
('economia-empresa', 'bachillerato', '{2}', 'Marketing', '["segmentación","posicionamiento","benchmarking","branding","merchandising","targeting","feedback","engagement","lead","conversión"]'),
-- Dibujo Técnico 1º-2º
('dibujo-tecnico', 'bachillerato', '{1,2}', 'Elementos geométricos', '["punto","recta","plano","circunferencia","elipse","parábola","hipérbola","tangente","secante","bisectriz"]'),
('dibujo-tecnico', 'bachillerato', '{1,2}', 'Sistemas de representación', '["diédrico","axonométrico","cónico","perspectiva","alzado","planta","perfil","isométrico","caballera","militar"]'),
-- Filosofía 2º (Historia de la Filosofía)
('filosofia', 'bachillerato', '{2}', 'Conceptos filosóficos clave', '["sustancia","accidente","contingencia","necesidad","trascendental","fenómeno","noúmeno","dialéctica","alienación","praxis"]'),
('filosofia', 'bachillerato', '{2}', 'Obras filosóficas', '["República","Metafísica","Meditaciones","Crítica","Leviatán","Fenomenología","Capital","Ser y Tiempo","Tractatus","Vigilar y Castigar"]'),
-- Tecnología 1º-2º
('tecnologia', 'bachillerato', '{1,2}', 'Materiales de ingeniería', '["acero","aluminio","cobre","titanio","fibra de carbono","polietileno","silicona","cerámica","grafeno","nailon"]'),
('tecnologia', 'bachillerato', '{1,2}', 'Energías y sostenibilidad', '["solar","eólica","hidráulica","geotérmica","biomasa","nuclear","maremotriz","hidrógeno","fotovoltaica","termosolar"]'),
-- Literatura Universal 1º
('literatura-universal', 'bachillerato', '{1}', 'Autores universales', '["Shakespeare","Kafka","Dostoievski","Tolstói","Dickens","Flaubert","Goethe","Dante","Homero","Virgilio"]'),
('literatura-universal', 'bachillerato', '{1}', 'Obras maestras', '["Hamlet","La metamorfosis","Crimen y castigo","Ana Karenina","Oliver Twist","Madame Bovary","Fausto","Divina Comedia","Ilíada","Eneida"]'),
-- Valenciano 1º-2º
('valenciano', 'bachillerato', '{1,2}', 'Vocabulari acadèmic', '["anàlisi","hipòtesi","conclusió","argument","referència","evidència","perspectiva","context","metodologia","investigació"]'),
('valenciano', 'bachillerato', '{1,2}', 'Autors valencians', '["Ausiàs March","Joanot Martorell","Isabel de Villena","Roís de Corella","Joan Fuster","Enric Valor","Mercè Rodoreda","Vicent Andrés Estellés","Carmelina Sánchez-Cutillas","Manuel Sanchis Guarner"]'),
-- Francés 1º-2º
('frances', 'bachillerato', '{1,2}', 'Vocabulaire académique', '["analyse","synthèse","hypothèse","conclusion","argument","démonstration","perspective","contexte","méthodologie","recherche"]'),
('frances', 'bachillerato', '{1,2}', 'Auteurs français', '["Molière","Hugo","Balzac","Flaubert","Zola","Camus","Sartre","Proust","Voltaire","Baudelaire"]');

-- ============================================================
-- 7. INTRUSO SETS ADICIONALES
-- ============================================================

INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('economia', 'bachillerato', '{1}', 'Tipos de mercado', '["competencia perfecta","monopolio","oligopolio","competencia monopolística"]', '["inflación","deflación"]'),
('economia', 'bachillerato', '{1}', 'Indicadores económicos', '["PIB","IPC","tasa de paro","balanza comercial"]', '["velocidad","aceleración"]'),
('geografia', 'bachillerato', '{2}', 'Ríos de la vertiente atlántica', '["Duero","Tajo","Guadiana","Guadalquivir"]', '["Ebro","Júcar"]'),
('geografia', 'bachillerato', '{2}', 'Climas de España', '["mediterráneo","oceánico","subtropical","continental"]', '["tropical","ecuatorial"]'),
('arte', 'bachillerato', '{2}', 'Pintores impresionistas', '["Monet","Renoir","Degas","Pissarro"]', '["Picasso","Dalí"]'),
('arte', 'bachillerato', '{2}', 'Arquitectura gótica', '["arbotante","rosetón","gárgola","pináculo"]', '["columna dórica","frontón"]'),
('lengua', 'bachillerato', '{1,2}', 'Autores del Barroco', '["Quevedo","Góngora","Lope de Vega","Calderón"]', '["Garcilaso","Boscán"]'),
('lengua', 'bachillerato', '{1,2}', 'Tipos de estrofas', '["soneto","lira","silva","octava real"]', '["novela","ensayo"]'),
('matematicas', 'bachillerato', '{1}', 'Tipos de matrices', '["cuadrada","diagonal","identidad","traspuesta"]', '["derivada","integral"]'),
('biologia', 'bachillerato', '{1}', 'Bases nitrogenadas del ADN', '["adenina","timina","guanina","citosina"]', '["uracilo","ribosa"]'),
('quimica', 'bachillerato', '{2}', 'Tipos de enlace', '["iónico","covalente","metálico","por puente de hidrógeno"]', '["gravitatorio","electromagnético"]'),
('historia-espana', 'bachillerato', '{2}', 'Reyes Católicos', '["Isabel I","Fernando II","conquista de Granada","descubrimiento de América"]', '["Felipe V","Guerra de Sucesión"]');

-- ============================================================
-- 8. PAREJAS ADICIONALES
-- ============================================================

INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('economia', 'bachillerato', '{1}', 'Adam Smith', 'La riqueza de las naciones'),
('economia', 'bachillerato', '{1}', 'Keynes', 'Intervención del Estado'),
('economia', 'bachillerato', '{1}', 'Inflación', 'Subida general de precios'),
('economia', 'bachillerato', '{1}', 'PIB', 'Producción total del país'),
('economia', 'bachillerato', '{1}', 'Monopolio', 'Un solo vendedor'),
('economia', 'bachillerato', '{1}', 'Oligopolio', 'Pocos vendedores'),
('geografia', 'bachillerato', '{2}', 'Meseta Central', 'Llanura elevada interior'),
('geografia', 'bachillerato', '{2}', 'Pirineos', 'Frontera con Francia'),
('geografia', 'bachillerato', '{2}', 'Ebro', 'Río más caudaloso de España'),
('geografia', 'bachillerato', '{2}', 'Canarias', 'Clima subtropical'),
('arte', 'bachillerato', '{2}', 'Románico', 'Arco de medio punto'),
('arte', 'bachillerato', '{2}', 'Gótico', 'Arco apuntado'),
('arte', 'bachillerato', '{2}', 'Renacimiento', 'Perspectiva lineal'),
('arte', 'bachillerato', '{2}', 'Impresionismo', 'Pincelada suelta'),
('historia-espana', 'bachillerato', '{2}', '711', 'Invasión musulmana'),
('historia-espana', 'bachillerato', '{2}', '1812', 'Constitución de Cádiz'),
('historia-espana', 'bachillerato', '{2}', '1898', 'Pérdida de las colonias'),
('historia-espana', 'bachillerato', '{2}', '1931', 'Segunda República'),
('literatura-universal', 'bachillerato', '{1}', 'Homero', 'Ilíada y Odisea'),
('literatura-universal', 'bachillerato', '{1}', 'Dante', 'Divina Comedia'),
('literatura-universal', 'bachillerato', '{1}', 'Shakespeare', 'Hamlet'),
('literatura-universal', 'bachillerato', '{1}', 'Kafka', 'La metamorfosis'),
('literatura-universal', 'bachillerato', '{1}', 'Dostoievski', 'Crimen y castigo'),
('literatura-universal', 'bachillerato', '{1}', 'Goethe', 'Fausto');

-- ============================================================
-- FIN DE LA MIGRACIÓN DE DATOS ADICIONALES
-- ============================================================
