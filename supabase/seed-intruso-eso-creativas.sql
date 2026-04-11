-- =====================================================================
-- Seed Intruso: ESO asignaturas creativas (musica, plastica, ed-fisica, tutoria)
-- 36 sets: 9 por asignatura (3 por curso aproximadamente)
-- Cada set: 13-15 items correctos + 7 intrusos
-- Items en minusculas sin acentos; apostrofos escapados con ''
-- =====================================================================

INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES

-- =====================================================================
-- MUSICA
-- =====================================================================

-- MUSICA 1 ESO
('musica', 'eso', '{1}', 'Instrumentos de cuerda frotada',
'["violin","viola","violonchelo","contrabajo","rabel","viola da gamba","zanfona","erhu","nyckelharpa","fidula","kemence","kamancha","sarangui","hardanger"]'::jsonb,
'["guitarra","arpa","laud","piano","clavicembalo","citara","banjo"]'::jsonb),

('musica', 'eso', '{1}', 'Instrumentos de viento madera',
'["flauta travesera","flauta dulce","flautin","clarinete","oboe","fagot","corno ingles","saxofon","contrafagot","clarinete bajo","chirimia","dulzaina","gaita","ocarina"]'::jsonb,
'["trompeta","trombon","tuba","trompa","corneta","bombardino","fliscorno"]'::jsonb),

('musica', 'eso', '{1}', 'Instrumentos de percusion afinada',
'["xilofono","marimba","vibrafono","timbales","celesta","carillon","glockenspiel","campanas tubulares","balafon","steel drum","kalimba","lira","metalofono","crotalos"]'::jsonb,
'["bombo","caja","pandero","triangulo","claves","maracas","cencerro"]'::jsonb),

-- MUSICA 2 ESO
('musica', 'eso', '{2}', 'Instrumentos de viento metal',
'["trompeta","trombon","tuba","trompa","corneta","bombardino","fliscorno","cornetin","saxhorn","serpenton","olifante","clarin","trompa alpina","sousafon"]'::jsonb,
'["clarinete","oboe","flauta","fagot","saxofon","gaita","armonica"]'::jsonb),

('musica', 'eso', '{2}', 'Indicaciones de tempo italianas',
'["largo","lento","adagio","andante","moderato","allegro","vivace","presto","prestissimo","larghetto","andantino","allegretto","grave","sostenuto"]'::jsonb,
'["forte","piano","crescendo","staccato","legato","pianissimo","mezzoforte"]'::jsonb),

('musica', 'eso', '{2}', 'Instrumentos electronicos y amplificados',
'["sintetizador","organo electronico","guitarra electrica","bajo electrico","theremin","sampler","caja de ritmos","secuenciador","vocoder","mellotron","ondas martenot","piano electrico","controlador midi","loopera"]'::jsonb,
'["violin","clavicordio","arpa","flauta dulce","pandereta","laud","clavicembalo"]'::jsonb),

-- MUSICA 3 ESO
('musica', 'eso', '{3}', 'Compositores del Barroco',
'["johann sebastian bach","antonio vivaldi","george friedrich handel","henry purcell","claudio monteverdi","arcangelo corelli","domenico scarlatti","georg philipp telemann","jean philippe rameau","jean baptiste lully","tomaso albinoni","johann pachelbel","francois couperin","heinrich schutz"]'::jsonb,
'["wolfgang amadeus mozart","ludwig van beethoven","franz schubert","frederic chopin","johannes brahms","claude debussy","igor stravinsky"]'::jsonb),

('musica', 'eso', '{3}', 'Instrumentos del folclore espanol',
'["castanuelas","pandereta","dulzaina","gaita gallega","bandurria","laud espanol","timple canario","txistu","alboka","rabel","zambomba","carraca","botella de anis","tamboril"]'::jsonb,
'["violin","piano","sitar","didgeridoo","balalaika","banjo","koto"]'::jsonb),

('musica', 'eso', '{3}', 'Formas musicales vocales',
'["opera","oratorio","cantata","lied","madrigal","motete","aria","recitativo","coral","misa","requiem","villancico","cancion","salmo"]'::jsonb,
'["sinfonia","sonata","concierto","fuga","preludio","suite","cuarteto"]'::jsonb),

-- MUSICA 4 ESO
('musica', 'eso', '{4}', 'Compositores espanoles',
'["manuel de falla","isaac albeniz","enrique granados","joaquin rodrigo","tomas luis de victoria","cristobal de morales","francisco tarrega","pablo sarasate","joaquin turina","federico moreno torroba","antonio soler","fernando sor","luis de narvaez","juan del encina"]'::jsonb,
'["johann sebastian bach","giuseppe verdi","frederic chopin","piotr tchaikovsky","richard wagner","claude debussy","gustav mahler"]'::jsonb),

('musica', 'eso', '{4}', 'Grupos legendarios de rock',
'["the beatles","the rolling stones","led zeppelin","pink floyd","queen","the who","the doors","ac dc","deep purple","nirvana","u2","metallica","guns n roses","the clash"]'::jsonb,
'["abba","bee gees","michael jackson","madonna","daft punk","beyonce","bruno mars"]'::jsonb),

('musica', 'eso', '{4}', 'Pequena percusion y accesorios',
'["claves","maracas","pandero","pandereta","triangulo","cencerro","guiro","cabasa","shaker","castanuelas","crotalos","caja china","palo de lluvia","carraca"]'::jsonb,
'["piano","guitarra","violin","trompeta","flauta","bajo electrico","saxofon"]'::jsonb),

-- =====================================================================
-- PLASTICA
-- =====================================================================

-- PLASTICA 1 ESO
('plastica', 'eso', '{1}', 'Herramientas de escultura',
'["gubia","cincel","maceta","formon","buril","escofina","lima","espatula","puntero","trinchante","desbastador","vaciador","escoplo","mazo de madera","alambre de modelar"]'::jsonb,
'["pincel","acuarela","lapiz de colores","rotulador","goma de borrar","tinta china","carboncillo"]'::jsonb),

('plastica', 'eso', '{1}', 'Colores primarios y secundarios pigmento',
'["rojo","amarillo","azul","verde","naranja","violeta","morado","magenta","cian","carmesi","bermellon","limon","ultramar","purpura"]'::jsonb,
'["marron","negro","blanco","gris","beige","ocre","plata"]'::jsonb),

('plastica', 'eso', '{1}', 'Soportes para pintar o dibujar',
'["papel","cartulina","lienzo","tabla de madera","carton","papel vegetal","papel kraft","papel acuarela","bastidor","tela","panel","pergamino","papiro","yute"]'::jsonb,
'["pincel","lapiz","goma","tijeras","pegamento","regla","escuadra"]'::jsonb),

-- PLASTICA 2 ESO
('plastica', 'eso', '{2}', 'Colores calidos',
'["rojo","naranja","amarillo","bermellon","carmesi","ocre","siena","magenta","coral","salmon","terracota","ambar","rojo ingles","rojo cadmio"]'::jsonb,
'["azul","verde","violeta","cian","turquesa","anil","lila"]'::jsonb),

('plastica', 'eso', '{2}', 'Artistas del Renacimiento',
'["leonardo da vinci","miguel angel","rafael sanzio","donatello","botticelli","masaccio","tiziano","durero","piero della francesca","brunelleschi","ghirlandaio","mantegna","el greco","veronese"]'::jsonb,
'["picasso","dali","van gogh","monet","cezanne","kandinsky","matisse"]'::jsonb),

('plastica', 'eso', '{2}', 'Tecnicas pictoricas humedas',
'["acuarela","oleo","acrilico","tempera","gouache","tinta china","fresco","encaustica","aguada","sumi e","acrilico diluido","tinta de nogal","acuarela liquida","esmalte"]'::jsonb,
'["carboncillo","sanguina","lapiz de grafito","pastel seco","ceras duras","grafito","creta"]'::jsonb),

-- PLASTICA 3 ESO
('plastica', 'eso', '{3}', 'Pintores impresionistas',
'["claude monet","edgar degas","pierre auguste renoir","camille pissarro","alfred sisley","berthe morisot","edouard manet","gustave caillebotte","mary cassatt","frederic bazille","armand guillaumin","eva gonzales","giuseppe de nittis","giovanni boldini"]'::jsonb,
'["pablo picasso","salvador dali","rene magritte","joan miro","andy warhol","jackson pollock","mark rothko"]'::jsonb),

('plastica', 'eso', '{3}', 'Obras maestras del Museo del Prado',
'["las meninas","el jardin de las delicias","la maja desnuda","el 3 de mayo en madrid","el caballero de la mano en el pecho","la fragua de vulcano","las lanzas","la anunciacion de fra angelico","el descendimiento","el lavatorio","las hilanderas","la trinidad del greco","saturno devorando a su hijo","david vencedor de goliat"]'::jsonb,
'["la gioconda","la noche estrellada","el grito","la ultima cena","la persistencia de la memoria","el nacimiento de venus","la joven de la perla"]'::jsonb),

('plastica', 'eso', '{3}', 'Tipos de linea en dibujo',
'["recta","curva","quebrada","ondulada","espiral","mixta","paralela","perpendicular","oblicua","horizontal","vertical","discontinua","zigzag","radial"]'::jsonb,
'["punto","plano","color","textura","sombra","volumen","mancha"]'::jsonb),

-- PLASTICA 4 ESO
('plastica', 'eso', '{4}', 'Pintores cubistas',
'["pablo picasso","georges braque","juan gris","fernand leger","robert delaunay","albert gleizes","jean metzinger","maria blanchard","francis picabia","andre lhote","louis marcoussis","henri le fauconnier","roger de la fresnaye","auguste herbin"]'::jsonb,
'["claude monet","vincent van gogh","salvador dali","rene magritte","gustav klimt","edvard munch","frida kahlo"]'::jsonb),

('plastica', 'eso', '{4}', 'Arquitectos del siglo XX y XXI',
'["antoni gaudi","le corbusier","frank lloyd wright","mies van der rohe","walter gropius","zaha hadid","frank gehry","norman foster","santiago calatrava","rafael moneo","oscar niemeyer","renzo piano","tadao ando","alvar aalto"]'::jsonb,
'["rodin","canova","donatello","praxiteles","fidias","henry moore","giacometti"]'::jsonb),

('plastica', 'eso', '{4}', 'Colores terciarios y mezclas',
'["rojo anaranjado","amarillo anaranjado","amarillo verdoso","azul verdoso","azul violaceo","rojo violaceo","ocre","siena","tierra sombra","verde oliva","granate","turquesa","malva","caldero"]'::jsonb,
'["rojo puro","amarillo puro","azul puro","blanco","negro","cian","magenta"]'::jsonb),

-- =====================================================================
-- ED-FISICA
-- =====================================================================

-- ED-FISICA 1 ESO
('ed-fisica', 'eso', '{1}', 'Deportes con raqueta',
'["tenis","badminton","padel","tenis de mesa","squash","frontenis","racquetball","pickleball","pelota vasca con pala","soft tenis","beach tennis","speedminton","jianzi","shuttlecock"]'::jsonb,
'["futbol","baloncesto","boxeo","natacion","atletismo","judo","esgrima"]'::jsonb),

('ed-fisica', 'eso', '{1}', 'Deportes de combate y artes marciales',
'["judo","karate","taekwondo","boxeo","lucha libre","lucha grecorromana","kung fu","aikido","kickboxing","muay thai","jiu jitsu","kendo","capoeira","sumo"]'::jsonb,
'["tenis","golf","futbol","voleibol","natacion","ciclismo","atletismo"]'::jsonb),

('ed-fisica', 'eso', '{1}', 'Elementos reglamentarios del futbol',
'["tarjeta amarilla","tarjeta roja","fuera de juego","saque de banda","saque de esquina","penalti","tiro libre","falta","saque de puerta","cambio","prorroga","tanda de penaltis","mano","area grande"]'::jsonb,
'["triple","rebote","zona","mate","canasta","bloqueo","alley oop"]'::jsonb),

-- ED-FISICA 2 ESO
('ed-fisica', 'eso', '{2}', 'Pruebas de atletismo de pista',
'["100 metros","200 metros","400 metros","800 metros","1500 metros","5000 metros","10000 metros","maraton","110 metros vallas","400 metros vallas","3000 metros obstaculos","relevo 4x100","relevo 4x400","20 km marcha"]'::jsonb,
'["salto de altura","lanzamiento de peso","salto con pertiga","lanzamiento de jabalina","lanzamiento de disco","salto de longitud","triple salto"]'::jsonb),

('ed-fisica', 'eso', '{2}', 'Pruebas de atletismo de campo',
'["salto de longitud","salto de altura","triple salto","salto con pertiga","lanzamiento de peso","lanzamiento de disco","lanzamiento de martillo","lanzamiento de jabalina","heptatlon","decatlon","pentatlon","lanzamiento de piedra","lanzamiento de vortex","concurso combinado"]'::jsonb,
'["100 metros lisos","maraton","110 metros vallas","5000 metros","relevo 4x100","3000 obstaculos","marcha atletica"]'::jsonb),

('ed-fisica', 'eso', '{2}', 'Elementos del voleibol',
'["saque","recepcion","colocacion","remate","bloqueo","pase de antebrazos","pase de dedos","finta","libero","zaguero","delantero","rotacion","red","campo"]'::jsonb,
'["corner","penalti","fuera de juego","tarjeta roja","gol","area","portero"]'::jsonb),

-- ED-FISICA 3 ESO
('ed-fisica', 'eso', '{3}', 'Aparatos de gimnasia deportiva',
'["barra de equilibrio","barras paralelas","barras asimetricas","barra fija","anillas","potro","caballo con arcos","suelo","salto de potro","trampolin","colchoneta","mini tramp","plinto","caballo saltador"]'::jsonb,
'["balon","canasta","porteria","red","raqueta","pelota","palo de golf"]'::jsonb),

('ed-fisica', 'eso', '{3}', 'Deportes olimpicos de invierno',
'["esqui alpino","esqui de fondo","biatlon","salto de esqui","combinada nordica","snowboard","hockey sobre hielo","patinaje artistico","patinaje de velocidad","curling","luge","bobsleigh","skeleton","freestyle"]'::jsonb,
'["futbol","atletismo","natacion","gimnasia","baloncesto","voleibol","balonmano"]'::jsonb),

('ed-fisica', 'eso', '{3}', 'Lesiones deportivas frecuentes',
'["esguince de tobillo","rotura fibrilar","distension muscular","contractura","tendinitis","luxacion","fractura","contusion","calambre","desgarro","fascitis plantar","bursitis","sinovitis","condromalacia"]'::jsonb,
'["resfriado","gripe","otitis","caries","conjuntivitis","dolor de cabeza","gastroenteritis"]'::jsonb),

-- ED-FISICA 4 ESO
('ed-fisica', 'eso', '{4}', 'Deportes de aventura en la naturaleza',
'["escalada","rappel","barranquismo","espeleologia","senderismo","montanismo","trekking","piraguismo","rafting","parapente","paracaidismo","surf","windsurf","mountain bike"]'::jsonb,
'["ajedrez","billar","bolos","dardos","petanca","golf","bolera"]'::jsonb),

('ed-fisica', 'eso', '{4}', 'Leyendas de la NBA',
'["michael jordan","lebron james","kobe bryant","magic johnson","larry bird","kareem abdul jabbar","shaquille oneal","tim duncan","wilt chamberlain","bill russell","hakeem olajuwon","kevin durant","stephen curry","pau gasol"]'::jsonb,
'["cristiano ronaldo","lionel messi","rafa nadal","roger federer","usain bolt","michael phelps","tiger woods"]'::jsonb),

('ed-fisica', 'eso', '{4}', 'Elementos de una cancha de baloncesto',
'["canasta","tablero","aro","red","linea de tiros libres","linea de tres","zona","circulo central","linea de banda","linea de fondo","poste","pintura","media cancha","rectangulo del tablero"]'::jsonb,
'["corner","area pequena","punto de penalti","red de porteria","larguero","banderin de corner","punto de penal"]'::jsonb),

-- =====================================================================
-- TUTORIA
-- =====================================================================

-- TUTORIA 1 ESO
('tutoria', 'eso', '{1}', 'Emociones agradables o positivas',
'["alegria","felicidad","entusiasmo","orgullo","satisfaccion","gratitud","esperanza","serenidad","carino","ternura","amor","confianza","ilusion","admiracion"]'::jsonb,
'["tristeza","miedo","ira","asco","vergueenza","culpa","ansiedad"]'::jsonb),

('tutoria', 'eso', '{1}', 'Tipos de acoso escolar',
'["insultos","burlas","motes","rumores","exclusion del grupo","empujones","golpes","robos","amenazas","ciberacoso","mensajes ofensivos","suplantacion de identidad","difusion de fotos","aislamiento"]'::jsonb,
'["ayuda mutua","cooperacion","companerismo","respeto","amistad","dialogo","elogio"]'::jsonb),

('tutoria', 'eso', '{1}', 'Derechos del nino segun la ONU',
'["derecho a la vida","derecho al nombre","derecho a la nacionalidad","derecho a la educacion","derecho a la salud","derecho al juego","derecho a la familia","derecho a la proteccion","derecho a la alimentacion","derecho a la vivienda","derecho a opinar","derecho a la no discriminacion","derecho al descanso","derecho a la identidad"]'::jsonb,
'["derecho a votar","derecho a conducir","derecho al matrimonio","derecho a firmar contratos","derecho a consumir alcohol","derecho a la jubilacion","derecho a portar armas"]'::jsonb),

-- TUTORIA 2 ESO
('tutoria', 'eso', '{2}', 'Emociones desagradables o dificiles',
'["tristeza","miedo","ira","enfado","asco","vergueenza","culpa","envidia","celos","frustracion","ansiedad","aburrimiento","soledad","rencor"]'::jsonb,
'["alegria","felicidad","orgullo","entusiasmo","gratitud","amor","serenidad"]'::jsonb),

('tutoria', 'eso', '{2}', 'Habitos de alimentacion saludable',
'["comer fruta diaria","incluir verduras","beber agua","desayunar bien","masticar despacio","comer a horas fijas","legumbres semanales","pescado azul","cereales integrales","lacteos adecuados","menos sal","grasas saludables","racion moderada","variedad de alimentos"]'::jsonb,
'["saltarse comidas","picar entre horas","bebidas azucaradas","comida rapida frecuente","bolleria industrial","cenar muy tarde","comer ante pantallas"]'::jsonb),

('tutoria', 'eso', '{2}', 'Pasos para resolver una discusion',
'["mantener la calma","escuchar al otro","usar mensajes yo","no interrumpir","buscar entender","reconocer el error","pedir perdon","proponer soluciones","llegar a un acuerdo","cumplir el compromiso","pedir ayuda a un mediador","respetar turnos","bajar el tono","valorar lo bueno"]'::jsonb,
'["gritar mas fuerte","insultar al otro","ignorar al companero","vengarse","pegar","difundir rumores","burlarse"]'::jsonb),

-- TUTORIA 3 ESO
('tutoria', 'eso', '{3}', 'Profesiones del ambito sanitario',
'["medico","enfermero","cirujano","farmaceutico","fisioterapeuta","odontologo","veterinario","psicologo","nutricionista","podologo","tecnico de laboratorio","radiologo","obstetra","optometrista"]'::jsonb,
'["abogado","arquitecto","periodista","ingeniero","profesor","contable","disenador grafico"]'::jsonb),

('tutoria', 'eso', '{3}', 'Tecnicas de relajacion y bienestar',
'["respiracion profunda","meditacion","mindfulness","yoga","tai chi","visualizacion guiada","relajacion progresiva","musica tranquila","paseo consciente","estiramientos suaves","journaling","respiracion abdominal","escaneo corporal","pausa activa"]'::jsonb,
'["cafeina","energeticas","redes sociales","videojuegos intensos","cine de terror","discusion","trabajo extra"]'::jsonb),

('tutoria', 'eso', '{3}', 'Uso responsable de redes sociales',
'["proteger la privacidad","no compartir datos personales","pensar antes de publicar","contrasenas seguras","bloquear a desconocidos","denunciar acoso","respetar a los demas","verificar la informacion","limitar el tiempo","cerrar sesion en publicos","no aceptar desconocidos","filtros de privacidad","actualizar apps","autenticacion doble"]'::jsonb,
'["compartir ubicacion en tiempo real","publicar fotos intimas","aceptar a todos","insultar anonimamente","suplantar identidades","difundir bulos","piratear cuentas"]'::jsonb),

-- TUTORIA 4 ESO
('tutoria', 'eso', '{4}', 'Carreras universitarias STEM',
'["medicina","ingenieria informatica","ingenieria civil","ingenieria industrial","matematicas","fisica","quimica","biologia","biotecnologia","arquitectura","ingenieria aeroespacial","ingenieria mecanica","farmacia","ciencias ambientales"]'::jsonb,
'["derecho","filosofia","historia del arte","filologia","periodismo","bellas artes","traduccion"]'::jsonb),

('tutoria', 'eso', '{4}', 'Carreras de Humanidades y Sociales',
'["derecho","historia","filosofia","filologia hispanica","historia del arte","traduccion e interpretacion","periodismo","sociologia","antropologia","pedagogia","bellas artes","humanidades","ciencias politicas","educacion social"]'::jsonb,
'["fisica","matematicas","ingenieria informatica","biotecnologia","medicina","quimica","ingenieria aeroespacial"]'::jsonb),

('tutoria', 'eso', '{4}', 'Objetivos de Desarrollo Sostenible (ODS)',
'["fin de la pobreza","hambre cero","salud y bienestar","educacion de calidad","igualdad de genero","agua limpia y saneamiento","energia asequible","trabajo decente","industria e innovacion","reduccion de desigualdades","ciudades sostenibles","produccion responsable","accion por el clima","vida submarina"]'::jsonb,
'["crecimiento economico a cualquier precio","expansion militar","consumismo global","competencia empresarial","beneficios maximos","globalizacion financiera","urbanizacion rapida"]'::jsonb);

-- =====================================================================
-- FIN: 36 sets insertados
-- musica: 12 (3x4 cursos)
-- plastica: 12 (3x4 cursos)
-- ed-fisica: 12 (3x4 cursos)
-- tutoria: 12 (3x4 cursos)
-- =====================================================================
