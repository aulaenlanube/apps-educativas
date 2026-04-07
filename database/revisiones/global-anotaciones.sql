-- =====================================================================
-- Revisión global · Anotaciones internas del autor filtradas a producción
-- 58 UPDATE — reescribe definitions absurdas, mantiene solutions.
-- NO se ejecuta hasta revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- ESO · Biología · 2º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Unidad de masa equivalente a mil gramos (contiene K).' WHERE id = 16177; -- kilo

-- =====================================================================
-- ESO · Física
-- =====================================================================
UPDATE rosco_questions SET definition = 'Acción de hacer más grande algo en una dimensión (contiene X).' WHERE id = 18240; -- extensión (1º)
UPDATE rosco_questions SET definition = 'Dispositivo que almacena energía eléctrica para alimentar circuitos.' WHERE id = 18287; -- batería (2º)
UPDATE rosco_questions SET definition = 'Adjetivo: de menor tamaño (contiene Q).' WHERE id = 18449; -- pequeño (2º)
UPDATE rosco_questions SET definition = 'Símbolo en física de la constante de equilibrio o de Boltzmann (letra K).' WHERE id = 18931; -- k (4º)

-- =====================================================================
-- ESO · Historia · 2º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Fortaleza histórica de Moscú, sede del gobierno ruso (contiene K).' WHERE id = 20522; -- kremlin

-- =====================================================================
-- ESO · Música · 2º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Verbo: tocar un instrumento musical (especialmente de cuerda) (contiene Ñ).' WHERE id = 25032; -- tañer

-- =====================================================================
-- ESO · Plástica · 1º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Estilo musical y artístico tradicional o popular (contiene K).' WHERE id = 25807; -- folk

-- =====================================================================
-- Primaria · Ciencias Naturales · 6º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Adjetivo plural: poco habituales o raras (contiene Ñ).' WHERE id = 10797; -- extrañas
UPDATE rosco_questions SET definition = 'Ave grande blanca y negra de patas largas que anida en tejados (contiene Ñ).' WHERE id = 10798; -- cigüeña
UPDATE rosco_questions SET definition = 'El más pequeño de los cinco dedos de la mano (contiene Ñ).' WHERE id = 10799; -- meñique
UPDATE rosco_questions SET definition = 'Gran elevación natural del terreno (contiene Ñ).' WHERE id = 10802; -- montaña
UPDATE rosco_questions SET definition = 'Unidad de fuerza en el Sistema Internacional, llamada así por un físico inglés (contiene W).' WHERE id = 10850; -- newton
UPDATE rosco_questions SET definition = 'Sustancia o producto que puede ser dañino para la salud (contiene X).' WHERE id = 10854; -- tóxico
UPDATE rosco_questions SET definition = 'Línea de luz o haz de partículas (contiene Y).' WHERE id = 10859; -- rayo
UPDATE rosco_questions SET definition = 'Verbo: fabricar o generar algo (contiene Y).' WHERE id = 10861; -- producir
UPDATE rosco_questions SET definition = 'Sustancia que el cuerpo necesita para vivir y crecer (contiene Y).' WHERE id = 10862; -- alimento
UPDATE rosco_questions SET definition = 'Proteínas que aceleran las reacciones químicas en los seres vivos (contiene Y).' WHERE id = 10863; -- enzimas
UPDATE rosco_questions SET definition = 'Sustancia dulce blanca que se obtiene de la caña o la remolacha (contiene Z).' WHERE id = 10867; -- azúcar
UPDATE rosco_questions SET definition = 'Órgano del olfato situado en la cara (contiene Z).' WHERE id = 10868; -- nariz

-- =====================================================================
-- Primaria · Ciencias Sociales · 6º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Conjunto de técnicas comerciales para vender un producto (contiene K).' WHERE id = 11620; -- marketing
UPDATE rosco_questions SET definition = 'Lugar donde se compran y venden productos (contiene K).' WHERE id = 11622; -- mercado
UPDATE rosco_questions SET definition = 'Conjunto de mercancías almacenadas (contiene K).' WHERE id = 11624; -- stock
UPDATE rosco_questions SET definition = 'Templo musulmán para la oración (contiene Q).' WHERE id = 11660; -- mezquita
UPDATE rosco_questions SET definition = 'Ciencia que estudia las civilizaciones antiguas a partir de sus restos materiales (contiene Q).' WHERE id = 11662; -- arqueología
UPDATE rosco_questions SET definition = 'Acción de cavar la tierra para extraer restos arqueológicos (contiene X).' WHERE id = 11698; -- excavación
UPDATE rosco_questions SET definition = 'Sostén o ayuda que se da a alguien (contiene Y).' WHERE id = 11704; -- apoyo
UPDATE rosco_questions SET definition = 'Ciudad valenciana famosa por sus fiestas de Moros y Cristianos (contiene Y).' WHERE id = 11705; -- alcoy
UPDATE rosco_questions SET definition = 'Ciudad neerlandesa donde se firmaron tratados sobre cultivos en bancales (contiene Z).' WHERE id = 11708; -- terrazas
UPDATE rosco_questions SET definition = 'Espacio público abierto en el centro de una ciudad (contiene Z).' WHERE id = 11709; -- plaza
UPDATE rosco_questions SET definition = 'Habitantes del Imperio Romano de Oriente, con capital en Constantinopla (contiene Z).' WHERE id = 11710; -- bizantinos
UPDATE rosco_questions SET definition = 'Trabajo de cultivar la tierra (contiene Z).' WHERE id = 11712; -- labranza

-- =====================================================================
-- Primaria · Inglés · 5º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Insect with colorful wings (starts with B).' WHERE id = 12385; -- butterfly
UPDATE rosco_questions SET definition = 'Adjective: very nice to look at (starts with B).' WHERE id = 12386; -- beautiful

-- =====================================================================
-- Primaria · Lengua · 5º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Elemento químico no metal usado en sal y desinfectantes (empieza por Y).' WHERE id = 13311; -- yodo

-- =====================================================================
-- Primaria · Matemáticas
-- =====================================================================
UPDATE rosco_questions SET definition = 'Verbo: trazar líneas con un lápiz (contiene Y).' WHERE id = 14139; -- rayar (5º)
UPDATE rosco_questions SET definition = 'Dimensión o magnitud de un objeto (contiene Ñ).' WHERE id = 14220; -- tamaño (6º)
UPDATE rosco_questions SET definition = 'Plural de plan o esbozo gráfico de algo (contiene Ñ).' WHERE id = 14223; -- diseños (6º)
UPDATE rosco_questions SET definition = 'Pieza acabada en ángulo agudo para hender o partir (contiene Ñ).' WHERE id = 14224; -- cuña (6º)
UPDATE rosco_questions SET definition = 'Acción de proyectar una figura sobre un plano (contiene Y).' WHERE id = 14281; -- proyección (6º)
UPDATE rosco_questions SET definition = 'Línea que parte del centro de la circunferencia hasta su borde (contiene Y).' WHERE id = 14282; -- rayo (6º)
UPDATE rosco_questions SET definition = 'Camino o recorrido de un punto a otro (contiene Y).' WHERE id = 14283; -- trayecto (6º)
UPDATE rosco_questions SET definition = 'Línea o recorrido dibujado sobre un plano (contiene Z).' WHERE id = 14286; -- trazado (6º)

-- =====================================================================
-- Primaria · Programación · 6º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Enlace o vínculo entre dos páginas web (contiene K).' WHERE id = 14452; -- link
UPDATE rosco_questions SET definition = 'Pegatina digital usada en mensajería (contiene K).' WHERE id = 14453; -- sticker
UPDATE rosco_questions SET definition = 'Conjunto de archivos o módulos que se distribuyen juntos (contiene Q).' WHERE id = 14489; -- paquete
UPDATE rosco_questions SET definition = 'Resumen visual o estructura simplificada de una idea (contiene Q).' WHERE id = 14492; -- esquema
UPDATE rosco_questions SET definition = 'Conjunto de letras y caracteres con un estilo gráfico (contiene T).' WHERE id = 14508; -- tipografía
UPDATE rosco_questions SET definition = 'Prueba para evaluar conocimientos o también verificar el código (contiene X).' WHERE id = 14528; -- examen
UPDATE rosco_questions SET definition = 'Introducción de código malicioso en un programa (contiene Y).' WHERE id = 14535; -- inyección

-- =====================================================================
-- Primaria · Tutoría · 6º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Esfuerzo o constancia para conseguir algo (contiene Ñ).' WHERE id = 14887; -- empeño
UPDATE rosco_questions SET definition = 'Espectáculo público o exhibición (contiene W).' WHERE id = 14931; -- show
UPDATE rosco_questions SET definition = 'Fruta verde por dentro y peluda por fuera (contiene W).' WHERE id = 14934; -- kiwi
UPDATE rosco_questions SET definition = 'Conversación entre dos o más personas para resolver algo (contiene Y).' WHERE id = 14943; -- diálogo
UPDATE rosco_questions SET definition = 'Sostén moral o emocional que se da a alguien (contiene Y).' WHERE id = 14945; -- apoyo
UPDATE rosco_questions SET definition = 'Sentimiento de gran alegría y placer (contiene Z).' WHERE id = 14949; -- gozo

-- =====================================================================
-- Primaria · Valenciano · 6º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Pintura o representació gràfica emmarcada (conté Q).' WHERE id = 15737; -- quadre
UPDATE rosco_questions SET definition = 'Possibilitat que una cosa es puga dur a terme (conté Y).' WHERE id = 15780; -- viabilitat

-- =====================================================================
-- AMPLIACIÓN: 51 entradas adicionales detectadas en el grep extendido
-- (patrón "Buscamos:", "Busquemos:", "Usarem:", "(no).", "trampa)")
-- =====================================================================

-- Primaria · Ciencias Naturales · 5º
UPDATE rosco_questions SET definition = 'Estado de la materia que fluye y toma la forma del recipiente (contiene Q).' WHERE id = 10669; -- líquido
UPDATE rosco_questions SET definition = 'Verbo: introducir un líquido en el cuerpo con jeringa (contiene Y).' WHERE id = 10713; -- inyectar

-- Primaria · Ciencias Sociales · 5º
UPDATE rosco_questions SET definition = 'Pequeña construcción donde se vende prensa o golosinas (contiene K).' WHERE id = 11472; -- quiosco
UPDATE rosco_questions SET definition = 'Organización No Gubernamental que ayuda a los más necesitados (siglas).' WHERE id = 11499; -- ong
UPDATE rosco_questions SET definition = 'Espacio público con árboles y zonas verdes (contiene Q).' WHERE id = 11513; -- parque
UPDATE rosco_questions SET definition = 'Territorio gobernado por un marqués (contiene Q).' WHERE id = 11515; -- marquesado
UPDATE rosco_questions SET definition = 'Conjunto de palabras escritas con sentido (contiene X).' WHERE id = 11549; -- texto
UPDATE rosco_questions SET definition = 'Que está formado por elementos diversos (contiene X).' WHERE id = 11550; -- mixto
UPDATE rosco_questions SET definition = 'Símbolo religioso formado por dos líneas perpendiculares (contiene Z).' WHERE id = 11560; -- cruz
UPDATE rosco_questions SET definition = 'Cereal blanco muy consumido en Asia (contiene Z).' WHERE id = 11561; -- arroz

-- Primaria · Ciencias Sociales · 6º
UPDATE rosco_questions SET definition = 'Conjunto de monumentos, paisajes y obras de arte protegidos por su valor histórico.' WHERE id = 11574; -- bienes culturales
UPDATE rosco_questions SET definition = 'Institución internacional que vela por la estabilidad financiera mundial (FMI).' WHERE id = 11592; -- fondo monetario internacional
UPDATE rosco_questions SET definition = 'Pueblo o ciudad gobernada por un ayuntamiento.' WHERE id = 11633; -- municipio
UPDATE rosco_questions SET definition = 'Sustancia química rica en nitrógeno usada como abono.' WHERE id = 11637; -- nitrogenada
UPDATE rosco_questions SET definition = 'Adjetivo: relativo a la jerarquía o al orden de mando (contiene Q).' WHERE id = 11658; -- jerárquico
UPDATE rosco_questions SET definition = 'Obra cumbre de Cervantes y nombre de su protagonista (contiene Q).' WHERE id = 11663; -- quijote
UPDATE rosco_questions SET definition = 'Crecimiento o aumento del territorio o la economía (contiene X).' WHERE id = 11699; -- expansión
UPDATE rosco_questions SET definition = 'Edificio donde se gobierna un municipio (contiene Y).' WHERE id = 11703; -- ayuntamiento

-- Primaria · Francés · 6º
UPDATE rosco_questions SET definition = 'Une grande ville (lo contraire de village).' WHERE id = 12088; -- ville

-- Primaria · Inglés · 6º
UPDATE rosco_questions SET definition = 'Adjective: quick, moving at high speed (starts with F).' WHERE id = 12547; -- fast
UPDATE rosco_questions SET definition = 'A heavy snowstorm with strong wind (contains Z).' WHERE id = 12647; -- blizzard
UPDATE rosco_questions SET definition = 'Adjective: confusing or hard to understand (contains Z).' WHERE id = 12648; -- puzzling

-- Primaria · Lengua · 6º
UPDATE rosco_questions SET definition = 'Función del lenguaje que transmite información objetiva.' WHERE id = 13368; -- informativa
UPDATE rosco_questions SET definition = 'Verbo: cerrar un ojo brevemente como gesto cómplice (contiene Ñ).' WHERE id = 13397; -- guiñar
UPDATE rosco_questions SET definition = 'Sentimiento de tristeza por la ausencia de algo querido (contiene Ñ).' WHERE id = 13399; -- añoranza
UPDATE rosco_questions SET definition = 'Conjunto de palabras de una lengua, vocabulario (contiene X).' WHERE id = 13446; -- léxico
UPDATE rosco_questions SET definition = 'Función sintáctica del adjetivo dentro del sintagma nominal (contiene Y).' WHERE id = 13455; -- adyacente
UPDATE rosco_questions SET definition = 'Adjetivo: rápido, ágil (contiene Z).' WHERE id = 13460; -- veloz

-- Primaria · Matemáticas · 6º
UPDATE rosco_questions SET definition = 'Número entero mayor que cero (contiene Z).' WHERE id = 14287; -- positivo

-- Primaria · Programación · 6º
UPDATE rosco_questions SET definition = 'Pequeña porción de código reutilizable (snippet).' WHERE id = 14425; -- fragmento
UPDATE rosco_questions SET definition = 'Representación visual de datos en un programa.' WHERE id = 14430; -- gráfica
UPDATE rosco_questions SET definition = 'Línea de ejecución dentro de un proceso informático (multitarea).' WHERE id = 14438; -- hilo
UPDATE rosco_questions SET definition = 'Lenguaje de programación creado por Sun Microsystems.' WHERE id = 14445; -- java
UPDATE rosco_questions SET definition = 'Plan o esbozo previo a la creación de un programa o página web (contiene Ñ).' WHERE id = 14473; -- diseño
UPDATE rosco_questions SET definition = 'Verbo: poner en marcha un programa o ejecutar código (contiene Z).' WHERE id = 14540; -- lanzar

-- Primaria · Tutoría · 6º
UPDATE rosco_questions SET definition = 'Cualidad de quien actúa con honor, generosidad y rectitud.' WHERE id = 14881; -- nobleza

-- Primaria · Valenciano · 5º
UPDATE rosco_questions SET definition = 'Eixida d''oci a un lloc allunyat per a passar el dia (conté X).' WHERE id = 15631; -- excursió
UPDATE rosco_questions SET definition = 'Femella del cavall (conté Y).' WHERE id = 15634; -- egua
UPDATE rosco_questions SET definition = 'Cinquè mes de l''any, mes de les flors (conté Y).' WHERE id = 15635; -- maig
UPDATE rosco_questions SET definition = 'Narració tradicional amb elements fantàstics (conté Y).' WHERE id = 15636; -- llegenda

-- Primaria · Valenciano · 6º
UPDATE rosco_questions SET definition = 'Grau de l''adjectiu que serveix per a comparar dos elements.' WHERE id = 15659; -- comparatiu
UPDATE rosco_questions SET definition = 'Que no canvia, que és sempre igual.' WHERE id = 15693; -- invariable
UPDATE rosco_questions SET definition = 'Punt on es troben o s''uneixen dos elements (conté J).' WHERE id = 15696; -- juntura
UPDATE rosco_questions SET definition = 'Estudi del nombre i la mesura dels versos d''un poema.' WHERE id = 15712; -- mètrica
UPDATE rosco_questions SET definition = 'Conjunt de quadrats iguals que formen una xarxa (conté Q).' WHERE id = 15740; -- quadrícula
UPDATE rosco_questions SET definition = 'Narració popular curta, sovint amb elements fantàstics.' WHERE id = 15745; -- rondalla
UPDATE rosco_questions SET definition = 'Que forma una sola unitat o que no es pot dividir.' WHERE id = 15761; -- unitari
UPDATE rosco_questions SET definition = 'Adjectiu: extraordinàriament refinat o de gran qualitat (conté X).' WHERE id = 15777; -- exquisit
UPDATE rosco_questions SET definition = 'Pla detallat per a fer una cosa nova (conté Y).' WHERE id = 15781; -- projecte
UPDATE rosco_questions SET definition = 'Família o dignitat dels reis i nobles (conté Y).' WHERE id = 15782; -- reialesa
UPDATE rosco_questions SET definition = 'Mesura antiga de longitud equivalent a uns 50 cm (conté Z).' WHERE id = 15788; -- colzada

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
