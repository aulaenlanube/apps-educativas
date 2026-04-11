-- =====================================================================
-- PAREJAS CREATIVAS ESO — Ed. Física, Música, Plástica, Tecnología, Tutoría
-- =====================================================================
-- Completa los combos que solo tenían 12 parejas (pictogramas) añadiendo
-- 13 nuevas parejas conceptuales por curso, inequívocas y sin colisión
-- semántica con las existentes ni entre sí.
-- =====================================================================

-- =====================================================================
-- EDUCACIÓN FÍSICA (ed-fisica)
-- Existentes (todos los cursos): Fútbol⚽, Baloncesto🏀, Tenis🎾, Natación🏊,
-- Ciclismo🚴, Voleibol🏐, Tenis de mesa🏓, Judo🥋, Portería🥅, Zapatilla👟,
-- Cronómetro⏱️, Medalla de oro🥇
-- =====================================================================

-- ED. FÍSICA 1º ESO — capacidades básicas, anatomía introductoria, hábitos
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ed-fisica', 'eso', '{1}', 'Calentamiento', 'Prepara el cuerpo antes del ejercicio'),
('ed-fisica', 'eso', '{1}', 'Estiramiento', 'Relaja el músculo tras el esfuerzo'),
('ed-fisica', 'eso', '{1}', 'Pulso', 'Latidos por minuto'),
('ed-fisica', 'eso', '{1}', 'Bíceps', 'Flexiona el codo'),
('ed-fisica', 'eso', '{1}', 'Cuádriceps', 'Extiende la rodilla'),
('ed-fisica', 'eso', '{1}', 'Escápula', 'Omóplato de la espalda'),
('ed-fisica', 'eso', '{1}', 'Diafragma', 'Músculo de la respiración'),
('ed-fisica', 'eso', '{1}', 'Hidratación', 'Beber agua durante la actividad'),
('ed-fisica', 'eso', '{1}', 'Equilibrio', 'Pino sobre un pie'),
('ed-fisica', 'eso', '{1}', 'Coordinación', 'Saltar a la comba'),
('ed-fisica', 'eso', '{1}', 'Goma de saltar', 'Juego popular infantil'),
('ed-fisica', 'eso', '{1}', 'Pañuelo', 'Juego tradicional de equipos'),
('ed-fisica', 'eso', '{1}', 'Cuerda', 'Trepa vertical en gimnasio');

-- ED. FÍSICA 2º ESO — capacidades físicas básicas y sus ejercicios
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ed-fisica', 'eso', '{2}', 'Resistencia aeróbica', 'Correr 20 minutos suaves'),
('ed-fisica', 'eso', '{2}', 'Fuerza explosiva', 'Salto vertical máximo'),
('ed-fisica', 'eso', '{2}', 'Velocidad de reacción', 'Salida de tacos'),
('ed-fisica', 'eso', '{2}', 'Flexibilidad', 'Tocar la punta del pie'),
('ed-fisica', 'eso', '{2}', 'Agilidad', 'Circuito de conos en zigzag'),
('ed-fisica', 'eso', '{2}', 'Isquiotibiales', 'Parte posterior del muslo'),
('ed-fisica', 'eso', '{2}', 'Gemelos', 'Músculo de la pantorrilla'),
('ed-fisica', 'eso', '{2}', 'Abdominales', 'Flexionan el tronco hacia delante'),
('ed-fisica', 'eso', '{2}', 'Pectoral', 'Se trabaja con flexiones'),
('ed-fisica', 'eso', '{2}', 'Relevos 4x100', 'Prueba de atletismo por equipos'),
('ed-fisica', 'eso', '{2}', 'Salto de longitud', 'Se mide en metros desde tabla'),
('ed-fisica', 'eso', '{2}', 'Lanzamiento de peso', 'Empujar bola metálica'),
('ed-fisica', 'eso', '{2}', 'Maratón', 'Carrera de 42,195 km');

-- ED. FÍSICA 3º ESO — fisiología, nutrición deportiva, deportes alternativos
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ed-fisica', 'eso', '{3}', 'Frecuencia cardíaca máxima', 'Fórmula 220 menos edad'),
('ed-fisica', 'eso', '{3}', 'VO2 máx', 'Consumo máximo de oxígeno'),
('ed-fisica', 'eso', '{3}', 'Ácido láctico', 'Fatiga muscular por esfuerzo'),
('ed-fisica', 'eso', '{3}', 'Glucógeno', 'Reserva energética del músculo'),
('ed-fisica', 'eso', '{3}', 'Hidratos de carbono', 'Energía rápida para el deporte'),
('ed-fisica', 'eso', '{3}', 'Proteína', 'Reparación del tejido muscular'),
('ed-fisica', 'eso', '{3}', 'IMC', 'Índice de masa corporal'),
('ed-fisica', 'eso', '{3}', 'Badminton', 'Deporte de raqueta con volante'),
('ed-fisica', 'eso', '{3}', 'Balonmano', 'Siete jugadores por equipo'),
('ed-fisica', 'eso', '{3}', 'Rugby', 'Oval que se chuta tras placaje'),
('ed-fisica', 'eso', '{3}', 'Hockey hierba', 'Stick curvo y bola'),
('ed-fisica', 'eso', '{3}', 'Orientación', 'Brújula y mapa en el bosque'),
('ed-fisica', 'eso', '{3}', 'Escalada', 'Presas de colores en rocódromo');

-- ED. FÍSICA 4º ESO — reglas y deportes, primeros auxilios, técnica
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ed-fisica', 'eso', '{4}', 'Fuera de juego', 'Infracción propia del fútbol'),
('ed-fisica', 'eso', '{4}', 'Triple', 'Canasta desde más de 6,75 m'),
('ed-fisica', 'eso', '{4}', 'Set', 'Unidad de partido de tenis'),
('ed-fisica', 'eso', '{4}', 'Tanda de penaltis', 'Desempate al final del fútbol'),
('ed-fisica', 'eso', '{4}', 'Ippon', 'Victoria total en judo'),
('ed-fisica', 'eso', '{4}', 'Touché', 'Punto válido en esgrima'),
('ed-fisica', 'eso', '{4}', 'RCP', 'Reanimación cardiopulmonar'),
('ed-fisica', 'eso', '{4}', 'Desfibrilador', 'Aparato para parada cardíaca'),
('ed-fisica', 'eso', '{4}', 'Vendaje compresivo', 'Primeros auxilios en esguince'),
('ed-fisica', 'eso', '{4}', 'Protocolo RICE', 'Reposo, hielo, compresión, elevación'),
('ed-fisica', 'eso', '{4}', 'Dopaje', 'Sustancia prohibida en competición'),
('ed-fisica', 'eso', '{4}', 'Fair play', 'Juego limpio y deportividad'),
('ed-fisica', 'eso', '{4}', 'Árbitro', 'Vela por el cumplimiento del reglamento');

-- =====================================================================
-- MÚSICA (musica)
-- Existentes (todos los cursos): Piano🎹, Guitarra🎸, Violín🎻, Batería🥁,
-- Saxofón🎷, Trompeta🎺, Partitura🎼, Micrófono🎤, Auriculares🎧,
-- Nota musical🎵, Radio📻, Flauta🪈
-- =====================================================================

-- MÚSICA 1º ESO — elementos básicos del lenguaje musical
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('musica', 'eso', '{1}', 'Pentagrama', 'Cinco líneas paralelas'),
('musica', 'eso', '{1}', 'Clave de sol', 'Símbolo al inicio del pentagrama'),
('musica', 'eso', '{1}', 'Redonda', 'Dura cuatro tiempos'),
('musica', 'eso', '{1}', 'Blanca', 'Dura dos tiempos'),
('musica', 'eso', '{1}', 'Negra', 'Dura un tiempo'),
('musica', 'eso', '{1}', 'Corchea', 'Dura medio tiempo'),
('musica', 'eso', '{1}', 'Silencio', 'Ausencia de sonido con duración'),
('musica', 'eso', '{1}', 'Compás', 'Agrupación de tiempos'),
('musica', 'eso', '{1}', 'Fa', 'Cuarta nota de la escala'),
('musica', 'eso', '{1}', 'Sostenido', 'Sube medio tono'),
('musica', 'eso', '{1}', 'Bemol', 'Baja medio tono'),
('musica', 'eso', '{1}', 'Becuadro', 'Anula alteración anterior'),
('musica', 'eso', '{1}', 'Ligadura', 'Une dos notas iguales');

-- MÚSICA 2º ESO — cualidades del sonido, tempi y dinámicas
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('musica', 'eso', '{2}', 'Altura', 'Grave o agudo'),
('musica', 'eso', '{2}', 'Intensidad', 'Fuerte o suave'),
('musica', 'eso', '{2}', 'Duración', 'Largo o corto'),
('musica', 'eso', '{2}', 'Timbre', 'Color característico del sonido'),
('musica', 'eso', '{2}', 'Forte', 'Matiz de volumen fuerte'),
('musica', 'eso', '{2}', 'Mezzoforte', 'Matiz medio-fuerte'),
('musica', 'eso', '{2}', 'Crescendo', 'Aumentar poco a poco el volumen'),
('musica', 'eso', '{2}', 'Diminuendo', 'Disminuir poco a poco el volumen'),
('musica', 'eso', '{2}', 'Allegro', 'Tempo rápido y alegre'),
('musica', 'eso', '{2}', 'Adagio', 'Tempo lento y reposado'),
('musica', 'eso', '{2}', 'Andante', 'Tempo moderado, al paso'),
('musica', 'eso', '{2}', 'Staccato', 'Articulación corta y separada'),
('musica', 'eso', '{2}', 'Legato', 'Articulación ligada y unida');

-- MÚSICA 3º ESO — compositores y obras célebres, historia
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('musica', 'eso', '{3}', 'Mozart', 'Compuso Las bodas de Fígaro'),
('musica', 'eso', '{3}', 'Beethoven', 'Compuso la Novena sinfonía'),
('musica', 'eso', '{3}', 'Bach', 'Compuso los Conciertos de Brandemburgo'),
('musica', 'eso', '{3}', 'Vivaldi', 'Compuso Las cuatro estaciones'),
('musica', 'eso', '{3}', 'Chopin', 'Compositor polaco del romanticismo'),
('musica', 'eso', '{3}', 'Wagner', 'Compuso El anillo del nibelungo'),
('musica', 'eso', '{3}', 'Falla', 'Compuso El amor brujo'),
('musica', 'eso', '{3}', 'Rodrigo', 'Compuso el Concierto de Aranjuez'),
('musica', 'eso', '{3}', 'Edad Media', 'Canto gregoriano'),
('musica', 'eso', '{3}', 'Renacimiento', 'Polifonía vocal de Palestrina'),
('musica', 'eso', '{3}', 'Barroco', 'Nacimiento de la ópera'),
('musica', 'eso', '{3}', 'Clasicismo', 'Forma sonata'),
('musica', 'eso', '{3}', 'Romanticismo', 'Música expresiva del XIX');

-- MÚSICA 4º ESO — géneros populares, música del XX, tecnología musical
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('musica', 'eso', '{4}', 'Jazz', 'Nació en Nueva Orleans'),
('musica', 'eso', '{4}', 'Blues', 'Base rítmica de 12 compases'),
('musica', 'eso', '{4}', 'Rock and roll', 'Lo popularizó Elvis Presley'),
('musica', 'eso', '{4}', 'Reggae', 'Género jamaicano de Bob Marley'),
('musica', 'eso', '{4}', 'Hip hop', 'Incluye el rap como vertiente'),
('musica', 'eso', '{4}', 'Flamenco', 'Cante jondo andaluz'),
('musica', 'eso', '{4}', 'Bossa nova', 'Género brasileño suave'),
('musica', 'eso', '{4}', 'Electrónica', 'Música creada con sintetizadores'),
('musica', 'eso', '{4}', 'MIDI', 'Protocolo de instrumentos digitales'),
('musica', 'eso', '{4}', 'Secuenciador', 'Programa para montar pistas'),
('musica', 'eso', '{4}', 'Altavoz', 'Transforma señal eléctrica en sonido'),
('musica', 'eso', '{4}', 'Stravinsky', 'Compuso La consagración de la primavera'),
('musica', 'eso', '{4}', 'Schönberg', 'Creador del dodecafonismo');

-- =====================================================================
-- PLÁSTICA (plastica)
-- Existentes (todos los cursos): Paleta🎨, Pincel🖌️, Cera🖍️, Cuadro🖼️,
-- Máscara🎭, Lápiz✏️, Escuadra📐, Tijeras✂️, Cámara📷, Ladrillo🧱,
-- Hilo🧶, Cerámica🏺
-- =====================================================================

-- PLÁSTICA 1º ESO — teoría del color y elementos básicos
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('plastica', 'eso', '{1}', 'Colores primarios', 'Rojo, amarillo y azul'),
('plastica', 'eso', '{1}', 'Verde', 'Mezcla de azul y amarillo'),
('plastica', 'eso', '{1}', 'Naranja', 'Mezcla de rojo y amarillo'),
('plastica', 'eso', '{1}', 'Violeta', 'Mezcla de rojo y azul'),
('plastica', 'eso', '{1}', 'Colores cálidos', 'Evocan calor y energía'),
('plastica', 'eso', '{1}', 'Colores fríos', 'Evocan calma y distancia'),
('plastica', 'eso', '{1}', 'Complementarios', 'Opuestos en el círculo cromático'),
('plastica', 'eso', '{1}', 'Punto', 'Unidad mínima gráfica'),
('plastica', 'eso', '{1}', 'Línea', 'Sucesión continua de puntos'),
('plastica', 'eso', '{1}', 'Plano', 'Superficie bidimensional'),
('plastica', 'eso', '{1}', 'Textura', 'Aspecto táctil de una superficie'),
('plastica', 'eso', '{1}', 'Simetría', 'Orden por un eje'),
('plastica', 'eso', '{1}', 'Ritmo visual', 'Repetición ordenada de elementos');

-- PLÁSTICA 2º ESO — técnicas y materiales plásticos
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('plastica', 'eso', '{2}', 'Acuarela', 'Pigmento diluido en agua'),
('plastica', 'eso', '{2}', 'Óleo', 'Pigmento con aceite de linaza'),
('plastica', 'eso', '{2}', 'Témpera', 'Pintura opaca lavable'),
('plastica', 'eso', '{2}', 'Pastel', 'Técnica seca que se difumina con el dedo'),
('plastica', 'eso', '{2}', 'Grabado', 'Impresión desde una plancha'),
('plastica', 'eso', '{2}', 'Collage', 'Pegar recortes diversos'),
('plastica', 'eso', '{2}', 'Esgrafiado', 'Raspar capa para ver otra debajo'),
('plastica', 'eso', '{2}', 'Puntillismo', 'Pintar con pequeños puntos'),
('plastica', 'eso', '{2}', 'Claroscuro', 'Contraste de luces y sombras'),
('plastica', 'eso', '{2}', 'Boceto previo', 'Esquema antes del trabajo final'),
('plastica', 'eso', '{2}', 'Carboncillo', 'Carbón vegetal para dibujar'),
('plastica', 'eso', '{2}', 'Tinta china', 'Dibujo con plumilla'),
('plastica', 'eso', '{2}', 'Difumino', 'Cilindro de papel que suaviza trazos');

-- PLÁSTICA 3º ESO — estilos artísticos y perspectivas
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('plastica', 'eso', '{3}', 'Renacimiento', 'Leonardo pinta La Gioconda'),
('plastica', 'eso', '{3}', 'Barroco', 'Caravaggio y el tenebrismo'),
('plastica', 'eso', '{3}', 'Impresionismo', 'Monet y los nenúfares'),
('plastica', 'eso', '{3}', 'Expresionismo', 'Munch pinta El grito'),
('plastica', 'eso', '{3}', 'Cubismo', 'Picasso descompone la figura'),
('plastica', 'eso', '{3}', 'Surrealismo', 'Dalí pinta relojes blandos'),
('plastica', 'eso', '{3}', 'Pop art', 'Warhol y las latas de sopa'),
('plastica', 'eso', '{3}', 'Perspectiva cónica', 'Un único punto de fuga'),
('plastica', 'eso', '{3}', 'Perspectiva isométrica', 'Ángulos de 120 grados'),
('plastica', 'eso', '{3}', 'Perspectiva caballera', 'Eje Y a 45 grados'),
('plastica', 'eso', '{3}', 'Punto de fuga', 'Donde convergen las paralelas'),
('plastica', 'eso', '{3}', 'Línea de horizonte', 'Altura del ojo del observador'),
('plastica', 'eso', '{3}', 'Encaje', 'Proporciones iniciales del dibujo');

-- PLÁSTICA 4º ESO — diseño, comunicación visual y arte contemporáneo
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('plastica', 'eso', '{4}', 'Logotipo', 'Identidad gráfica de una marca'),
('plastica', 'eso', '{4}', 'Tipografía', 'Estudio de la letra impresa'),
('plastica', 'eso', '{4}', 'Señalética', 'Iconos que orientan en espacios'),
('plastica', 'eso', '{4}', 'Cartel', 'Anuncio gráfico de gran formato'),
('plastica', 'eso', '{4}', 'Storyboard', 'Guion visual plano a plano'),
('plastica', 'eso', '{4}', 'Plano americano', 'Encuadre de la rodilla arriba'),
('plastica', 'eso', '{4}', 'Primer plano', 'Encuadre del rostro'),
('plastica', 'eso', '{4}', 'Diseño industrial', 'Proyecto de objetos de uso'),
('plastica', 'eso', '{4}', 'Infografía', 'Representación visual de información'),
('plastica', 'eso', '{4}', 'Instalación artística', 'Obra pensada para un espacio'),
('plastica', 'eso', '{4}', 'Land art', 'Intervención en el paisaje natural'),
('plastica', 'eso', '{4}', 'Street art', 'Obras en muros urbanos'),
('plastica', 'eso', '{4}', 'Performance', 'Arte efímero en vivo');

-- =====================================================================
-- TECNOLOGÍA (tecnologia)
-- 1º ESO ya tiene 30 parejas conceptuales (NO TOCAR)
-- 2º/3º/4º existentes: Ordenador💻, Robot🤖, Engranaje⚙️, Llave inglesa🔧,
-- Martillo🔨, Enchufe🔌, Antena📡, Cohete🚀, Ratón🖱️, Teclado⌨️,
-- Móvil📱, Construcción🏗️
-- =====================================================================

-- TECNOLOGÍA 2º ESO — dibujo técnico, materiales, estructuras
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tecnologia', 'eso', '{2}', 'Alzado', 'Vista de frente'),
('tecnologia', 'eso', '{2}', 'Planta', 'Vista desde arriba'),
('tecnologia', 'eso', '{2}', 'Perfil', 'Vista lateral'),
('tecnologia', 'eso', '{2}', 'Cota', 'Medida acotada en el plano'),
('tecnologia', 'eso', '{2}', 'Escala', 'Relación real-dibujo'),
('tecnologia', 'eso', '{2}', 'Madera contrachapada', 'Láminas encoladas'),
('tecnologia', 'eso', '{2}', 'Aglomerado', 'Virutas prensadas con resina'),
('tecnologia', 'eso', '{2}', 'Pilar', 'Elemento estructural vertical'),
('tecnologia', 'eso', '{2}', 'Viga', 'Elemento estructural horizontal'),
('tecnologia', 'eso', '{2}', 'Triangulación', 'Refuerzo rígido de estructuras'),
('tecnologia', 'eso', '{2}', 'Arco', 'Estructura curva que salva un vano'),
('tecnologia', 'eso', '{2}', 'Tracción', 'Esfuerzo que estira'),
('tecnologia', 'eso', '{2}', 'Compresión', 'Esfuerzo que aplasta');

-- TECNOLOGÍA 3º ESO — electrónica, energías y mecanismos avanzados
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tecnologia', 'eso', '{3}', 'Diodo LED', 'Emite luz al circular corriente'),
('tecnologia', 'eso', '{3}', 'Resistencia eléctrica', 'Limita el paso de corriente'),
('tecnologia', 'eso', '{3}', 'Condensador', 'Almacena carga eléctrica'),
('tecnologia', 'eso', '{3}', 'Transistor', 'Amplifica o conmuta señales'),
('tecnologia', 'eso', '{3}', 'Voltímetro', 'Mide la tensión'),
('tecnologia', 'eso', '{3}', 'Amperímetro', 'Mide la intensidad'),
('tecnologia', 'eso', '{3}', 'Ley de Ohm', 'V es igual a I por R'),
('tecnologia', 'eso', '{3}', 'Energía solar', 'Placas fotovoltaicas'),
('tecnologia', 'eso', '{3}', 'Energía eólica', 'Aerogeneradores'),
('tecnologia', 'eso', '{3}', 'Energía hidráulica', 'Presa con turbina'),
('tecnologia', 'eso', '{3}', 'Engranaje cónico', 'Transmite entre ejes perpendiculares'),
('tecnologia', 'eso', '{3}', 'Tornillo sin fin', 'Gran reducción de velocidad'),
('tecnologia', 'eso', '{3}', 'Leva', 'Convierte rotación en vaivén');

-- TECNOLOGÍA 4º ESO — programación, neumática y control
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tecnologia', 'eso', '{4}', 'Variable', 'Espacio en memoria con valor'),
('tecnologia', 'eso', '{4}', 'Bucle', 'Repite instrucciones mientras se cumpla una condición'),
('tecnologia', 'eso', '{4}', 'Condicional', 'Bifurcación según una prueba lógica'),
('tecnologia', 'eso', '{4}', 'Función', 'Bloque de código reutilizable'),
('tecnologia', 'eso', '{4}', 'Algoritmo', 'Secuencia ordenada de pasos'),
('tecnologia', 'eso', '{4}', 'Arduino', 'Placa microcontroladora libre'),
('tecnologia', 'eso', '{4}', 'Sensor', 'Detecta magnitudes del entorno'),
('tecnologia', 'eso', '{4}', 'Actuador', 'Ejecuta una acción física'),
('tecnologia', 'eso', '{4}', 'Servomotor', 'Motor con posición controlada'),
('tecnologia', 'eso', '{4}', 'Compresor', 'Genera aire a presión'),
('tecnologia', 'eso', '{4}', 'Cilindro neumático', 'Pistón movido por aire'),
('tecnologia', 'eso', '{4}', 'Electroválvula', 'Válvula accionada eléctricamente'),
('tecnologia', 'eso', '{4}', 'Diagrama de flujo', 'Representación gráfica de un algoritmo');

-- =====================================================================
-- TUTORÍA (tutoria)
-- 1º ESO ya tiene 30 parejas conceptuales (NO TOCAR)
-- 2º/3º/4º existentes: Alegría😃, Tristeza😢, Enfado😠, Miedo😱, Amor😍,
-- Sueño😴, Pensar🤔, Confianza😎, Enfermo🤒, Celebración🥳, Silencio🤫,
-- Acuerdo🤝
-- =====================================================================

-- TUTORÍA 2º ESO — técnicas de estudio, convivencia, hábitos
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tutoria', 'eso', '{2}', 'Subrayado', 'Destacar ideas principales del texto'),
('tutoria', 'eso', '{2}', 'Resumen', 'Reducir un texto manteniendo lo esencial'),
('tutoria', 'eso', '{2}', 'Esquema', 'Organización jerárquica con llaves'),
('tutoria', 'eso', '{2}', 'Mapa conceptual', 'Conceptos unidos por flechas y enlaces'),
('tutoria', 'eso', '{2}', 'Lectura comprensiva', 'Entender lo que se lee'),
('tutoria', 'eso', '{2}', 'Repaso espaciado', 'Revisar en sesiones separadas'),
('tutoria', 'eso', '{2}', 'Horario semanal', 'Planificar tiempos de estudio'),
('tutoria', 'eso', '{2}', 'Técnica Pomodoro', 'Bloques de 25 minutos con pausa'),
('tutoria', 'eso', '{2}', 'Desayuno equilibrado', 'Rinde mejor la mañana escolar'),
('tutoria', 'eso', '{2}', 'Ejercicio diario', 'Mejora ánimo y rendimiento'),
('tutoria', 'eso', '{2}', 'Postura correcta', 'Espalda recta al estudiar'),
('tutoria', 'eso', '{2}', 'Pausas activas', 'Estirar cada cierto tiempo'),
('tutoria', 'eso', '{2}', 'Trabajo cooperativo', 'Aprender junto a los compañeros');

-- TUTORÍA 3º ESO — conflictos, valores democráticos, redes sociales
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tutoria', 'eso', '{3}', 'Diálogo', 'Vía pacífica para resolver desacuerdos'),
('tutoria', 'eso', '{3}', 'Prejuicio', 'Juicio previo sin conocer'),
('tutoria', 'eso', '{3}', 'Estereotipo', 'Idea fija sobre un colectivo'),
('tutoria', 'eso', '{3}', 'Discriminación', 'Trato desigual injustificado'),
('tutoria', 'eso', '{3}', 'Inclusión', 'Todos participan en igualdad'),
('tutoria', 'eso', '{3}', 'Voto', 'Derecho democrático fundamental'),
('tutoria', 'eso', '{3}', 'Pacto', 'Compromiso entre varias partes'),
('tutoria', 'eso', '{3}', 'Huella digital', 'Información personal que dejamos en internet'),
('tutoria', 'eso', '{3}', 'Contraseña segura', 'Mezcla letras, números y símbolos'),
('tutoria', 'eso', '{3}', 'Fake news', 'Noticia falsa que se difunde en redes'),
('tutoria', 'eso', '{3}', 'Grooming', 'Engaño de adultos a menores online'),
('tutoria', 'eso', '{3}', 'Sexting', 'Envío de imágenes íntimas por móvil'),
('tutoria', 'eso', '{3}', 'Netiqueta', 'Buenas formas en la comunicación digital');

-- TUTORÍA 4º ESO — orientación académico-profesional, proyecto de vida
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tutoria', 'eso', '{4}', 'Bachillerato', 'Etapa previa a la universidad'),
('tutoria', 'eso', '{4}', 'FP Grado Medio', 'Ciclo profesional tras la ESO'),
('tutoria', 'eso', '{4}', 'FP Grado Superior', 'Ciclo profesional tras el bachillerato'),
('tutoria', 'eso', '{4}', 'EBAU', 'Examen de acceso a la universidad'),
('tutoria', 'eso', '{4}', 'Curriculum vitae', 'Historial académico y laboral'),
('tutoria', 'eso', '{4}', 'Carta de presentación', 'Explica por qué quieres el puesto'),
('tutoria', 'eso', '{4}', 'Entrevista de trabajo', 'Primer contacto cara a cara con empresa'),
('tutoria', 'eso', '{4}', 'Vocación', 'Inclinación profesional personal'),
('tutoria', 'eso', '{4}', 'Autoconocimiento', 'Saber cuáles son mis puntos fuertes'),
('tutoria', 'eso', '{4}', 'Meta SMART', 'Objetivo específico, medible y alcanzable'),
('tutoria', 'eso', '{4}', 'Toma de decisiones', 'Elegir valorando pros y contras'),
('tutoria', 'eso', '{4}', 'Gestión del estrés', 'Respiración y organización ante exámenes'),
('tutoria', 'eso', '{4}', 'Voluntariado', 'Colaborar sin recibir dinero a cambio');

-- =====================================================================
-- FIN DEL SEED
-- Total de parejas insertadas: 234
--   Ed. Física:   13 × 4 cursos = 52
--   Música:       13 × 4 cursos = 52
--   Plástica:     13 × 4 cursos = 52
--   Tecnología:   13 × 3 cursos = 39
--   Tutoría:      13 × 3 cursos = 39
-- =====================================================================
