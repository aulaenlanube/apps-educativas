-- ============================================================
-- SEED: Intruso sets para asignaturas STEM de ESO
-- Completa sets faltantes en biologia, fisica, matematicas,
-- tecnologia, ia, robotica y programacion hasta ~10 por combo.
-- ============================================================

-- ----- BIOLOGIA 1º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('biologia', 'eso', '{1}', 'Caracteristicas de los seres vivos', '["nutricion","relacion","reproduccion","crecimiento","metabolismo","adaptacion","homeostasis","excrecion","respiracion","evolucion","celula","herencia","estimulo","muerte","organizacion"]'::jsonb, '["mineral","combustion","erosion","sedimentacion","magnetismo","cristalizacion","gravitacion"]'::jsonb);

-- ----- BIOLOGIA 2º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('biologia', 'eso', '{2}', 'Tipos de tejidos animales', '["tejido epitelial","tejido conectivo","tejido muscular liso","tejido muscular estriado","tejido muscular cardiaco","tejido nervioso","tejido adiposo","tejido cartilaginoso","tejido oseo","tejido sanguineo","tejido linfatico","tejido glandular","tejido conjuntivo denso","tejido conjuntivo laxo"]'::jsonb, '["xilema","floema","parenquima","meristemo","epidermis vegetal","colenquima","esclerenquima"]'::jsonb);

-- ----- BIOLOGIA 3º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('biologia', 'eso', '{3}', 'Glandulas del sistema endocrino', '["hipofisis","tiroides","paratiroides","suprarrenales","pancreas","ovarios","testiculos","pineal","timo","hipotalamo","glandulas mamarias","glandulas salivales","placenta","islotes de Langerhans"]'::jsonb, '["higado","rinon","bazo","vesicula biliar","apendice","medula osea","amigdalas"]'::jsonb);

-- ----- BIOLOGIA 4º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('biologia', 'eso', '{4}', 'Pruebas de la evolucion', '["fosiles","homologias anatomicas","analogias","organos vestigiales","embriologia comparada","biogeografia","bioquimica comparada","ADN mitocondrial","similitud genetica","registro paleontologico","especies transicionales","seleccion artificial","resistencia a antibioticos","observacion directa"]'::jsonb, '["ley de Ohm","efecto Doppler","modelo atomico","tabla periodica","leyes de Kepler","principio de Arquimedes","ley de Hooke"]'::jsonb),
('biologia', 'eso', '{4}', 'Tipos de mutaciones geneticas', '["puntual","silenciosa","missense","nonsense","insercion","delecion","duplicacion","inversion","translocacion","frameshift","cromosomica","genica","genomica","espontanea"]'::jsonb, '["fotosintesis","respiracion","digestion","glucolisis","transpiracion","circulacion","excrecion"]'::jsonb);

-- ----- FISICA 1º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('fisica', 'eso', '{1}', 'Metodo cientifico (pasos)', '["observacion","pregunta","hipotesis","experimentacion","toma de datos","analisis","conclusion","comunicacion","teoria","ley","prediccion","control variables","medicion","replicacion"]'::jsonb, '["poesia","cuento","novela","pintura","melodia","coreografia","esculpir"]'::jsonb);

-- ----- FISICA 2º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('fisica', 'eso', '{2}', 'Instrumentos de medida', '["regla","cinta metrica","calibre","micrometro","balanza","dinamometro","cronometro","termometro","probeta","bureta","amperimetro","voltimetro","manometro","barometro","pie de rey"]'::jsonb, '["martillo","sierra","alicates","destornillador","tornillo","clavo","tenazas"]'::jsonb);

-- ----- FISICA 3º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('fisica', 'eso', '{3}', 'Metales alcalinos y alcalinoterreos', '["litio","sodio","potasio","rubidio","cesio","francio","berilio","magnesio","calcio","estroncio","bario","radio"]'::jsonb, '["cloro","fluor","bromo","azufre","oxigeno","nitrogeno","helio"]'::jsonb);

-- ----- FISICA 4º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('fisica', 'eso', '{4}', 'Tipos de ondas', '["transversal","longitudinal","mecanica","electromagnetica","superficial","estacionaria","viajera","armonica","periodica","sonora","luminosa","sismica","onda en cuerda","onda de presion"]'::jsonb, '["fotosintesis","gravitacion","oxidacion","combustion","ionizacion","fusion nuclear","combinacion"]'::jsonb),
('fisica', 'eso', '{4}', 'Espectro electromagnetico', '["radio","microondas","infrarrojo","visible","ultravioleta","rayos X","rayos gamma","ondas largas","ondas cortas","ondas milimetricas","luz roja","luz violeta","radiacion termica","radiacion ionizante"]'::jsonb, '["onda sonora","onda sismica","onda de agua","ultrasonido","infrasonido","vibracion mecanica","pulso acustico"]'::jsonb),
('fisica', 'eso', '{4}', 'Componentes de un circuito electrico', '["generador","pila","bateria","conductor","resistencia","bombilla","interruptor","pulsador","fusible","motor electrico","amperimetro","voltimetro","diodo","condensador"]'::jsonb, '["engranaje","polea","palanca","cadena","biela","manivela","rueda dentada"]'::jsonb);

-- ----- MATEMATICAS 2º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('matematicas', 'eso', '{2}', 'Tipos de cuadrilateros', '["cuadrado","rectangulo","rombo","romboide","trapecio","trapezoide","paralelogramo","trapecio isosceles","trapecio rectangulo","deltoide","cometa","trapecio escaleno","rectangulo aureo","cuadrilatero ciclico"]'::jsonb, '["triangulo equilatero","pentagono","hexagono","circulo","semicirculo","sector circular","elipse"]'::jsonb);

-- ----- MATEMATICAS 3º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('matematicas', 'eso', '{3}', 'Productos notables e identidades', '["cuadrado de la suma","cuadrado de la diferencia","suma por diferencia","cubo de la suma","cubo de la diferencia","diferencia de cuadrados","suma de cubos","diferencia de cubos","triangulo de Pascal","binomio de Newton","factor comun","trinomio cuadrado perfecto","agrupamiento","identidad notable"]'::jsonb, '["teorema de Tales","teorema de Pitagoras","regla de tres","teorema del resto","teorema de Thales","media aritmetica","varianza"]'::jsonb);

-- ----- MATEMATICAS 4º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('matematicas', 'eso', '{4}', 'Tipos de matrices', '["matriz fila","matriz columna","matriz cuadrada","matriz rectangular","matriz nula","matriz identidad","matriz diagonal","matriz triangular superior","matriz triangular inferior","matriz simetrica","matriz antisimetrica","matriz traspuesta","matriz inversa","matriz escalar"]'::jsonb, '["vector unitario","numero complejo","polinomio","funcion lineal","ecuacion","inecuacion","sistema"]'::jsonb),
('matematicas', 'eso', '{4}', 'Formas de representar una funcion', '["expresion analitica","tabla de valores","grafica cartesiana","descripcion verbal","diagrama de flechas","ecuacion explicita","ecuacion implicita","forma parametrica","ecuacion por partes","grafo","regla de correspondencia","diagrama sagital","funcion a trozos","forma canonica"]'::jsonb, '["histograma","diagrama de sectores","diagrama de barras","pictograma","pirámide de poblacion","diagrama de caja","diagrama de Venn"]'::jsonb);

-- ----- TECNOLOGIA 1º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('tecnologia', 'eso', '{1}', 'Tipos de dibujo tecnico', '["croquis","boceto","plano","vista frontal","vista planta","vista perfil","perspectiva caballera","perspectiva isometrica","acotacion","escala","linea de eje","linea auxiliar","despiece","detalle"]'::jsonb, '["retrato","paisaje","bodegon","caricatura","mural","graffiti","acuarela"]'::jsonb);

-- ----- TECNOLOGIA 2º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('tecnologia', 'eso', '{2}', 'Tipos de uniones fijas y desmontables', '["tornillo y tuerca","remache","soldadura","pegamento","clavo","grapa","pasador","chaveta","encaje","cola","cinta adhesiva","union por encolado","union roscada","union por presion"]'::jsonb, '["palanca","polea","engranaje","rueda","plano inclinado","biela","cigueñal"]'::jsonb),
('tecnologia', 'eso', '{2}', 'Simbolos de circuitos electricos', '["generador","pila","resistencia","bombilla","interruptor","pulsador","conmutador","led","motor","zumbador","fusible","voltimetro","amperimetro","conductor"]'::jsonb, '["tornillo","tuerca","arandela","clavo","remache","chapa","perfil"]'::jsonb);

-- ----- TECNOLOGIA 3º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('tecnologia', 'eso', '{3}', 'Tipos de software', '["sistema operativo","aplicacion de escritorio","aplicacion movil","navegador web","procesador de texto","hoja de calculo","editor de imagen","antivirus","compilador","entorno de desarrollo","base de datos","firmware","driver","utilidad de sistema"]'::jsonb, '["procesador cpu","memoria ram","disco duro","placa base","teclado","raton","monitor"]'::jsonb);

-- ----- TECNOLOGIA 4º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('tecnologia', 'eso', '{4}', 'Componentes de sistemas hidraulicos', '["bomba hidraulica","deposito","valvula distribuidora","valvula antirretorno","cilindro hidraulico","filtro","manometro","tuberia","racor","acumulador","fluido hidraulico","valvula limitadora de presion","caudalimetro","actuador"]'::jsonb, '["resistencia electrica","condensador","diodo","transistor","led","bobina","rele"]'::jsonb),
('tecnologia', 'eso', '{4}', 'Tipos de sensores', '["sensor de temperatura","sensor de luz","sensor de presion","sensor de humedad","sensor de ultrasonidos","sensor de infrarrojos","sensor de movimiento","sensor de proximidad","sensor de tacto","sensor de color","sensor de gas","acelerometro","giroscopio","sensor de campo magnetico"]'::jsonb, '["motor paso a paso","servomotor","led","zumbador","pantalla lcd","altavoz","rele"]'::jsonb),
('tecnologia', 'eso', '{4}', 'Sistemas de control automatico', '["lazo abierto","lazo cerrado","realimentacion","controlador","sensor","actuador","comparador","setpoint","error","funcion de transferencia","sistema PID","senal de entrada","senal de salida","perturbacion"]'::jsonb, '["soldadura","perforacion","torneado","fresado","lijado","pintado","pulido"]'::jsonb);

-- ============================================================
-- IA (Inteligencia Artificial) - 5 sets por curso ESO
-- ============================================================

-- ----- IA 1º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ia', 'eso', '{1}', 'Tareas que sabe hacer una IA', '["clasificar imagenes","reconocer voz","traducir idiomas","generar texto","recomendar contenidos","jugar ajedrez","conducir coches","detectar fraude","predecir el tiempo","generar imagenes","resumir textos","responder preguntas","filtrar spam","reconocer rostros"]'::jsonb, '["cocinar paella","pasear al perro","regar las plantas","barrer el suelo","coser botones","lavar ropa","fregar platos"]'::jsonb),
('ia', 'eso', '{1}', 'Asistentes virtuales famosos', '["Alexa","Siri","Google Assistant","Cortana","Bixby","Watson","ChatGPT","Gemini","Claude","Copilot","Meta AI","Mistral","Perplexity","DeepSeek"]'::jsonb, '["Facebook","Instagram","Twitter","Tiktok","Spotify","Netflix","Youtube"]'::jsonb),
('ia', 'eso', '{1}', 'Datos que entrenan una IA', '["imagenes etiquetadas","textos","audios","videos","tablas numericas","paginas web","correos","sensores IoT","logs","encuestas","documentos escaneados","fotografias","grabaciones de voz","conjuntos de datos publicos"]'::jsonb, '["ladrillos","piedras","madera","hormigon","arcilla","cemento","tejas"]'::jsonb),
('ia', 'eso', '{1}', 'Sesgos y riesgos de la IA', '["sesgo de genero","sesgo racial","sobreajuste","alucinaciones","perdida de privacidad","deepfakes","uso indebido","dependencia excesiva","errores en diagnostico","discriminacion","desinformacion","manipulacion","plagio","consumo energetico"]'::jsonb, '["oxidacion","erosion","vulcanismo","terremoto","tsunami","sequia","inundacion"]'::jsonb),
('ia', 'eso', '{1}', 'IA en la vida cotidiana', '["recomendaciones de peliculas","autocompletado del movil","filtros de camara","navegador GPS","traductor automatico","chatbots de atencion","reconocimiento de huella","desbloqueo facial","ordenar fotos","subtitulos automaticos","correccion ortografica","control parental","alarmas inteligentes","sugerencias de compra"]'::jsonb, '["bolsillo de pantalon","cordon de zapato","cremallera","boton","velcro","hebilla","elastico"]'::jsonb);

-- ----- IA 2º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ia', 'eso', '{2}', 'Tipos de aprendizaje automatico', '["supervisado","no supervisado","semisupervisado","por refuerzo","auto supervisado","transferencia","online","offline","batch","incremental","activo","few shot","zero shot","meta aprendizaje"]'::jsonb, '["fotosintesis","respiracion","reproduccion","digestion","excrecion","circulacion","osmosis"]'::jsonb),
('ia', 'eso', '{2}', 'Pasos de un proyecto de IA', '["definir problema","recopilar datos","limpiar datos","etiquetar datos","dividir dataset","elegir modelo","entrenar","validar","ajustar hiperparametros","evaluar","desplegar","monitorizar","mantener","documentar"]'::jsonb, '["pintar","serrar","taladrar","lijar","pegar","clavar","atornillar"]'::jsonb),
('ia', 'eso', '{2}', 'Redes neuronales y capas', '["capa de entrada","capa oculta","capa de salida","neurona","peso","sesgo","funcion de activacion","relu","sigmoide","tanh","softmax","retropropagacion","gradiente","dropout"]'::jsonb, '["arteria","vena","capilar","auricula","ventriculo","valvula","corazon"]'::jsonb),
('ia', 'eso', '{2}', 'Metricas de evaluacion de modelos', '["precision","exactitud","recall","f1 score","matriz de confusion","curva ROC","AUC","error cuadratico medio","MAE","R cuadrado","accuracy","loss","perplejidad","top k"]'::jsonb, '["longitud","anchura","altura","peso","volumen","densidad","temperatura"]'::jsonb),
('ia', 'eso', '{2}', 'Herramientas de IA sin codigo', '["Teachable Machine","Scratch IA","Machine Learning for Kids","Code.org AI Lab","Google AI Experiments","Runway","Canva IA","Lobe","Hugging Face Spaces","Replit Ghostwriter","Bing Image Creator","Dall-E","Craiyon","Kaggle datasets"]'::jsonb, '["Microsoft Word","Excel","PowerPoint","Photoshop","Illustrator","Premiere","Audacity"]'::jsonb);

-- ----- IA 3º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ia', 'eso', '{3}', 'Tipos de IA segun capacidad', '["IA debil","IA estrecha","IA fuerte","IA general","superinteligencia","IA reactiva","memoria limitada","teoria de la mente","autoconsciente","IA simbolica","IA conexionista","IA hibrida","IA evolutiva","IA borrosa"]'::jsonb, '["inteligencia emocional","cociente intelectual","memoria fotografica","intuicion humana","sexto sentido","instinto","telepatia"]'::jsonb),
('ia', 'eso', '{3}', 'Problemas eticos de la IA', '["privacidad","sesgo algoritmico","transparencia","responsabilidad","explicabilidad","autonomia","propiedad intelectual","impacto laboral","vigilancia masiva","armas autonomas","deepfakes","desinformacion","consentimiento","discriminacion"]'::jsonb, '["rendimiento de la CPU","velocidad de internet","resolucion de pantalla","capacidad del disco","memoria RAM","tipo de teclado","tamano del monitor"]'::jsonb),
('ia', 'eso', '{3}', 'Procesamiento del lenguaje natural', '["tokenizacion","lematizacion","stemming","stop words","embeddings","word2vec","bolsa de palabras","n gramas","analisis de sentimiento","traduccion automatica","NER","part of speech","parseo sintactico","resumen automatico"]'::jsonb, '["pincelada","lienzo","oleo","acuarela","carboncillo","paleta","caballete"]'::jsonb),
('ia', 'eso', '{3}', 'Modelos de IA generativa', '["GPT","Claude","Gemini","Llama","Mistral","DALL-E","Stable Diffusion","Midjourney","Firefly","Sora","Imagen","Suno","Flux","ElevenLabs"]'::jsonb, '["Mozart","Beethoven","Picasso","Van Gogh","Dali","Monet","Cervantes"]'::jsonb),
('ia', 'eso', '{3}', 'Algoritmos clasicos de machine learning', '["regresion lineal","regresion logistica","arbol de decision","random forest","k vecinos","k means","SVM","naive Bayes","gradient boosting","XGBoost","DBSCAN","PCA","LDA","perceptron"]'::jsonb, '["quicksort","bubble sort","merge sort","busqueda binaria","dijkstra","floyd","bellman ford"]'::jsonb);

-- ----- IA 4º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ia', 'eso', '{4}', 'Arquitecturas de redes neuronales', '["perceptron multicapa","red convolucional","red recurrente","LSTM","GRU","autoencoder","GAN","transformer","red residual","U-Net","red siamesa","capsula","red bayesiana","RBM"]'::jsonb, '["LAN","WAN","VPN","Ethernet","Wifi","Bluetooth","4G"]'::jsonb),
('ia', 'eso', '{4}', 'Vision por computador', '["deteccion de objetos","clasificacion de imagenes","segmentacion semantica","reconocimiento facial","OCR","estimacion de pose","tracking","reconstruccion 3D","realidad aumentada","deteccion de bordes","filtros convolucionales","YOLO","ResNet","VGG"]'::jsonb, '["telescopio optico","microscopio","lupa","binoculares","gafas","lente de contacto","prismaticos"]'::jsonb),
('ia', 'eso', '{4}', 'Hardware especializado para IA', '["GPU","TPU","NPU","FPGA","ASIC","chip neuromorfico","aceleradores de IA","CUDA cores","tensor cores","Jetson","Coral Edge","memoria HBM","GPU NVIDIA","chips Apple Neural"]'::jsonb, '["ventilador","fuente de alimentacion","disco HDD","lector DVD","carcasa","teclado","raton"]'::jsonb),
('ia', 'eso', '{4}', 'Frameworks y librerias de IA', '["TensorFlow","PyTorch","Keras","scikit-learn","Hugging Face","JAX","MXNet","Caffe","Theano","fastai","OpenCV","NumPy","pandas","LangChain"]'::jsonb, '["React","Angular","Vue","Bootstrap","jQuery","Laravel","Django"]'::jsonb),
('ia', 'eso', '{4}', 'Leyes y regulaciones sobre IA', '["RGPD","AI Act europeo","ISO 42001","derechos del usuario","consentimiento informado","derecho al olvido","transparencia algoritmica","proteccion de datos","auditoria algoritmica","responsabilidad civil","evaluacion de impacto","marcado CE IA","certificacion","codigo de conducta"]'::jsonb, '["codigo penal antiguo","codigo civil romano","fuero juzgo","ley de hammurabi","codigo napoleonico","leyes medievales","fueros locales"]'::jsonb);

-- ============================================================
-- ROBOTICA - varios sets por curso ESO
-- ============================================================

-- ----- ROBOTICA 1º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('robotica', 'eso', '{1}', 'Partes basicas de un robot', '["chasis","motor","rueda","sensor","bateria","cable","placa controladora","interruptor","engranaje","estructura","pinza","brazo","cabeza","oruga"]'::jsonb, '["melodia","cuento","poema","receta","cancion","libro","pintura"]'::jsonb),
('robotica', 'eso', '{1}', 'Tipos de robots', '["robot industrial","robot domestico","robot educativo","robot humanoide","robot movil","robot submarino","robot aereo","dron","robot quirurgico","robot de rescate","robot social","cobot","brazo articulado","AGV"]'::jsonb, '["taladro manual","martillo","sierra","destornillador","alicates","llave inglesa","lima"]'::jsonb),
('robotica', 'eso', '{1}', 'Movimientos basicos de un robot', '["avanzar","retroceder","girar a la derecha","girar a la izquierda","detenerse","subir","bajar","agarrar","soltar","empujar","tirar","rotar","elevar brazo","cerrar pinza"]'::jsonb, '["llorar","reir","sonar","pensar","sentir","amar","odiar"]'::jsonb),
('robotica', 'eso', '{1}', 'Bloques de programacion en Scratch', '["bandera verde","mover 10 pasos","girar 15 grados","decir hola","repetir","por siempre","si entonces","esperar 1 segundo","tocar sonido","cambiar disfraz","ir a x y","crear variable","anadir a lista","enviar mensaje"]'::jsonb, '["caminar","correr","saltar","bailar","comer","dormir","jugar"]'::jsonb),
('robotica', 'eso', '{1}', 'Kits de robotica educativa', '["LEGO WeDo","LEGO Spike","LEGO Mindstorms","mBot","Micro:bit","Arduino Starter","VEX IQ","Sphero","Ozobot","Dash and Dot","Bee Bot","Botley","KIBO","Makey Makey"]'::jsonb, '["tablet","smartphone","consola","reloj digital","television","altavoz","impresora"]'::jsonb);

-- ----- ROBOTICA 2º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('robotica', 'eso', '{2}', 'Conceptos de Arduino basicos', '["pin digital","pin analogico","pinMode","digitalWrite","analogRead","setup","loop","Serial.begin","Serial.print","delay","if","for","while","const int"]'::jsonb, '["css","html","div","span","class","id","padding"]'::jsonb),
('robotica', 'eso', '{2}', 'Herramientas del taller de robotica', '["soldador de estano","estanio","pelacables","tercera mano","multimetro","protoboard","cables jumper","destornillador de precision","pistola de silicona","cinta aislante","alicates","crimpadora","pinzas","lupa"]'::jsonb, '["licuadora","microondas","tostadora","lavadora","nevera","horno","cafetera"]'::jsonb),
('robotica', 'eso', '{2}', 'Tipos de motores para robots', '["motor DC","servomotor","motor paso a paso","motor brushless","motor lineal","motor vibrador","micromotor","motor de engranajes","motor reductor","motor de corriente continua","motor magnetico","motor piezoelectrico","motor neumatico","motor hidraulico"]'::jsonb, '["bombilla led","resistencia","condensador","diodo","transistor","fusible","potenciometro"]'::jsonb),
('robotica', 'eso', '{2}', 'Sensores analogicos comunes', '["LDR","NTC","PTC","potenciometro","sensor de flexion","microfono","sensor de humedad suelo","sensor de fuerza","acelerometro analogico","sensor de gas MQ","fototransistor","sensor de efecto Hall","termopar","piranometro"]'::jsonb, '["pulsador","interruptor","final de carrera","rele","conmutador","contactor","microrruptor"]'::jsonb),
('robotica', 'eso', '{2}', 'Estructura de un programa Arduino', '["include","define","variables globales","void setup","void loop","funciones personalizadas","comentarios","constantes","declaracion de pines","inicializacion serie","entradas y salidas","logica de control","retornos","bucle principal"]'::jsonb, '["parrafo","capitulo","titulo","subtitulo","indice","bibliografia","prologo"]'::jsonb),
('robotica', 'eso', '{2}', 'Fabricacion y prototipado', '["impresion 3D","corte laser","fresado CNC","corte por agua","termoformado","moldeado","lijado","taladrado","serigrafia","grabado","soldadura","montaje","ensamblaje","acabado"]'::jsonb, '["respiracion","meditacion","yoga","baile","canto","dibujo libre","escritura creativa"]'::jsonb);

-- ----- ROBOTICA 3º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('robotica', 'eso', '{3}', 'Funciones de la libreria Servo Arduino', '["Servo.attach","Servo.write","Servo.read","Servo.detach","Servo.writeMicroseconds","Servo.attached","posicion angular","angulo servo","pulso PWM","rango 0 a 180","pin PWM","velocidad","biblioteca servo","objeto servo"]'::jsonb, '["setCursor","print LCD","clear LCD","backlight","scrollDisplayLeft","createChar","home"]'::jsonb),
('robotica', 'eso', '{3}', 'Montaje mecanico de robots', '["chasis","rueda motriz","rueda loca","soporte motor","base","cojinete","rodamiento","eje","tornilleria","separadores","torreta","brazo articulado","pinza","oruga"]'::jsonb, '["navegador web","servidor DNS","direccion IP","correo electronico","chat","foro","wiki"]'::jsonb),
('robotica', 'eso', '{3}', 'Actuadores avanzados', '["servomotor digital","servomotor continuo","motor brushless ESC","motor paso a paso NEMA","electrovalvula","solenoide","actuador lineal","musculo artificial","pinza neumatica","motor vibrador","actuador piezo","motor sin escobillas","actuador magnetico","rele de estado solido"]'::jsonb, '["termometro","higrometro","barometro","anemometro","pluviometro","heliografo","pluviografo"]'::jsonb),
('robotica', 'eso', '{3}', 'Programacion por bloques avanzada', '["mBlock","MakeCode","Scratch for Arduino","Bitbloq","Ardublock","Blockly","App Inventor","Snap","Pictoblox","Open Roberta","Edublocks","Microbit Blocks","Blockly Games","S4A"]'::jsonb, '["PowerPoint","Word","Excel","Access","Publisher","OneNote","Outlook"]'::jsonb),
('robotica', 'eso', '{3}', 'Comunicacion entre dispositivos', '["I2C","SPI","UART","Bluetooth","Wifi","infrarrojos","radiofrecuencia","zigbee","LoRa","NFC","USB","Ethernet","CAN bus","RS485"]'::jsonb, '["lenguaje oral","lengua escrita","mimica","gestos","dibujo","pintura","escultura"]'::jsonb),
('robotica', 'eso', '{3}', 'Pasos para construir un robot', '["definir objetivo","disenar chasis","seleccionar sensores","elegir actuadores","montar estructura","conectar electronica","programar","probar","depurar","optimizar","documentar","presentar","iterar","mejorar"]'::jsonb, '["recitar poesia","cantar opera","tocar piano","bailar flamenco","dibujar manga","escribir novela","pintar mural"]'::jsonb);

-- ----- ROBOTICA 4º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('robotica', 'eso', '{4}', 'Algoritmos de control para robots', '["control PID","control bang bang","control proporcional","control integral","control derivativo","seguimiento de linea","evitacion de obstaculos","control de velocidad","control de posicion","navegacion por GPS","SLAM","odometria","dead reckoning","fusion sensorial"]'::jsonb, '["receta de cocina","guion cinematografico","plano arquitectonico","partitura musical","libreto teatral","poema epico","comic grafico"]'::jsonb),
('robotica', 'eso', '{4}', 'Robotica movil y vehiculos autonomos', '["configuracion diferencial","configuracion Ackermann","robot omnidireccional","robot tipo oruga","robot hexapodo","robot cuadrupedo","drone cuadricoptero","robot humanoide","robot submarino ROV","robot aereo fijo","robot patas","vehiculo autonomo","AGV industrial","AMR autonomo"]'::jsonb, '["bicicleta manual","patinete electrico","monopatin","skateboard","rollerskate","pogo stick","triciclo"]'::jsonb),
('robotica', 'eso', '{4}', 'Simulacion y entornos virtuales', '["Gazebo","Webots","V-REP","CoppeliaSim","Unity ML Agents","ROS","Rviz","MATLAB Simulink","Tinkercad Circuits","Fritzing","Wokwi","Proteus","Robomind","Robologic"]'::jsonb, '["Photoshop","Illustrator","InDesign","Premiere","After Effects","Audacity","FL Studio"]'::jsonb),
('robotica', 'eso', '{4}', 'IA aplicada a robotica', '["vision artificial","reconocimiento de objetos","deteccion de personas","planificacion de rutas","aprendizaje por refuerzo","algoritmos geneticos","control adaptativo","redes neuronales","SLAM visual","odometria visual","procesamiento nube de puntos","mapeo","localizacion","decision autonoma"]'::jsonb, '["receta casera","bricolaje manual","jardineria","cocina tradicional","costura","punto de cruz","decoupage"]'::jsonb),
('robotica', 'eso', '{4}', 'Aplicaciones industriales de la robotica', '["soldadura automatizada","pintura robotizada","ensamblaje","paletizado","empaquetado","inspeccion de calidad","corte laser","manipulacion de materiales","almacen automatizado","pick and place","carga y descarga","mecanizado CNC","fresado robotico","logistica interna"]'::jsonb, '["cocina casera","limpieza manual","jardineria","peluqueria","manicura","maquillaje","masaje"]'::jsonb),
('robotica', 'eso', '{4}', 'Etica y seguridad en robotica', '["leyes de Asimov","seguridad funcional","certificacion CE","parada de emergencia","zonas de seguridad","velocidad limitada","sensor de presencia","proteccion colisiones","responsabilidad","privacidad","trazabilidad","auditoria","mantenimiento preventivo","formacion del operario"]'::jsonb, '["ortografia","gramatica","puntuacion","sintaxis","morfologia","semantica","fonetica"]'::jsonb);

-- ============================================================
-- PROGRAMACION - completar sets ESO
-- ============================================================

-- ----- PROGRAMACION 1º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('programacion', 'eso', '{1}', 'Tipos de archivos digitales', '["txt","pdf","docx","jpg","png","mp3","mp4","zip","html","css","js","xls","ppt","gif"]'::jsonb, '["rocas","hojas","ramas","tornillos","clavos","piedras","arena"]'::jsonb);

-- ----- PROGRAMACION 2º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('programacion', 'eso', '{2}', 'Tipos de datos basicos', '["entero","decimal","cadena","booleano","caracter","lista","array","objeto","fecha","nulo","float","double","string","long"]'::jsonb, '["verbo","adjetivo","sustantivo","preposicion","adverbio","articulo","pronombre"]'::jsonb),
('programacion', 'eso', '{2}', 'Operadores aritmeticos', '["suma","resta","multiplicacion","division","modulo","potencia","division entera","incremento","decremento","negacion","opuesto","raiz cuadrada","valor absoluto","truncar"]'::jsonb, '["mayor que","menor que","igual a","distinto de","y logico","o logico","negacion logica"]'::jsonb),
('programacion', 'eso', '{2}', 'Errores comunes en programacion', '["error de sintaxis","error semantico","error logico","error en tiempo de ejecucion","excepcion","bucle infinito","desbordamiento","division por cero","variable no definida","null pointer","fuera de rango","tipo incorrecto","recursion infinita","fuga de memoria"]'::jsonb, '["olor desagradable","sabor amargo","color apagado","textura rugosa","brillo bajo","peso excesivo","tamano grande"]'::jsonb),
('programacion', 'eso', '{2}', 'Editores y entornos de codigo', '["Visual Studio Code","Sublime Text","Atom","Notepad++","IntelliJ","PyCharm","Eclipse","NetBeans","Vim","Emacs","Brackets","WebStorm","Thonny","IDLE"]'::jsonb, '["Microsoft Paint","Paint 3D","Inkscape","GIMP","Krita","Photoshop","Canva"]'::jsonb),
('programacion', 'eso', '{2}', 'Conceptos de depuracion', '["punto de ruptura","ejecucion paso a paso","inspeccion de variables","traza de pila","consola de errores","log","print de depuracion","watch","step over","step into","step out","continue","restart","breakpoint condicional"]'::jsonb, '["ensayo literario","resumen","sinopsis","introduccion","conclusion","indice","prologo"]'::jsonb);

-- ----- PROGRAMACION 3º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('programacion', 'eso', '{3}', 'Estructuras de datos basicas', '["lista","array","tupla","diccionario","conjunto","pila","cola","arbol","grafo","cola de prioridad","lista enlazada","hash","matriz","registro"]'::jsonb, '["verso","estrofa","rima","metrica","soneto","epigrama","haiku"]'::jsonb);

-- ----- PROGRAMACION 4º ESO -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('programacion', 'eso', '{4}', 'Paradigmas de programacion', '["imperativo","declarativo","orientado a objetos","funcional","logico","estructurado","procedural","orientado a eventos","reactivo","concurrente","paralelo","distribuido","generico","modular"]'::jsonb, '["romanticismo","barroco","renacimiento","modernismo","impresionismo","cubismo","surrealismo"]'::jsonb);
