-- =====================================================================
-- Revisión rosco · ESO · Tecnología · 1º a 4º ESO
-- AVISO: 3º ESO sufre un borrado masivo (~196 entradas placeholder).
-- NO se ejecuta hasta revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================

DELETE FROM rosco_questions WHERE id IN (
  27713, -- 'Junta' mayúscula duplica con 27714 'junta'
  27731, -- 'kilo' def níquel (no K)
  27802  -- 'níquel' Q (níquel no contiene Q)
);

-- =====================================================================
-- 2º ESO
-- =====================================================================

DELETE FROM rosco_questions WHERE id IN (
  28001, -- 'kilo' def coque (no K)
  28002, -- 'kilo' def níquel (no K)
  28007, -- 'Ley' mayúscula duplica con 28008
  28073  -- 'níquel' Q (no contiene Q)
);

-- =====================================================================
-- 3º ESO · BORRADO MASIVO DE PLACEHOLDERS
-- =====================================================================

-- Letra A (4 placeholders 'agua')
DELETE FROM rosco_questions WHERE id IN (28164, 28166, 28169, 28172);

-- Letra B (8 placeholders 'banio maria')
DELETE FROM rosco_questions WHERE id IN (28174, 28176, 28177, 28178, 28179, 28180, 28182, 28183);

-- Letra C (5 placeholders 'capa de ozono')
DELETE FROM rosco_questions WHERE id IN (28184, 28186, 28187, 28191, 28193);

-- Letra D (6 placeholders 'dioxido de carbono')
DELETE FROM rosco_questions WHERE id IN (28197, 28198, 28199, 28200, 28201, 28203);

-- Letra E (10 placeholders 'energia no renovable' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28204, 28205, 28206, 28207, 28208, 28209, 28210, 28211, 28212, 28213);

-- Letra F (4 placeholders 'frecuencia cardiaca')
DELETE FROM rosco_questions WHERE id IN (28215, 28216, 28219, 28220);

-- Letra G (9 placeholders 'gato')
DELETE FROM rosco_questions WHERE id IN (28224, 28225, 28226, 28228, 28229, 28230, 28231, 28232, 28233);

-- Letra H (7 placeholders 'homo sapiens')
DELETE FROM rosco_questions WHERE id IN (28235, 28236, 28239, 28240, 28241, 28242, 28243);

-- Letra I (9 placeholders 'isla')
DELETE FROM rosco_questions WHERE id IN (28245, 28246, 28247, 28248, 28249, 28250, 28251, 28252, 28253);

-- Letra J (9 placeholders 'juegos olimpicos')
DELETE FROM rosco_questions WHERE id IN (28255, 28256, 28257, 28258, 28259, 28260, 28261, 28262, 28263);

-- Letra K (7 placeholders 'kilo')
DELETE FROM rosco_questions WHERE id IN (28266, 28268, 28269, 28270, 28271, 28272, 28273);

-- Letra L (7 placeholders 'lugar geometrico')
DELETE FROM rosco_questions WHERE id IN (28274, 28278, 28279, 28280, 28281, 28282, 28283);

-- Letra M (8 placeholders 'mano alzada')
DELETE FROM rosco_questions WHERE id IN (28284, 28285, 28287, 28289, 28290, 28291, 28292, 28293);

-- Letra N (10 placeholders 'numero atomico' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28294, 28295, 28296, 28297, 28298, 28299, 28300, 28301, 28302, 28303);

-- Letra Ñ (10 placeholders 'mañana' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28304, 28305, 28306, 28307, 28308, 28309, 28310, 28311, 28312, 28313);

-- Letra O (9 placeholders 'ojo')
DELETE FROM rosco_questions WHERE id IN (28315, 28316, 28317, 28318, 28319, 28320, 28321, 28322, 28323);

-- Letra P (6 placeholders 'presion de grupo')
DELETE FROM rosco_questions WHERE id IN (28325, 28326, 28331, 28332, 28333);

-- Letra Q (10 placeholders 'queso' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28334, 28335, 28336, 28337, 28338, 28339, 28340, 28341, 28342, 28343);

-- Letra R (7 placeholders 'rosa de los vientos')
DELETE FROM rosco_questions WHERE id IN (28345, 28348, 28349, 28350, 28351, 28352, 28353);

-- Letra S (8 placeholders 'sol')
DELETE FROM rosco_questions WHERE id IN (28356, 28358, 28359, 28360, 28361, 28362, 28363);

-- Letra T (6 placeholders 'toma de decisiones')
DELETE FROM rosco_questions WHERE id IN (28366, 28367, 28370, 28371, 28373);

-- Letra U (10 placeholders 'uno' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28374, 28375, 28376, 28377, 28378, 28379, 28380, 28381, 28382, 28383);

-- Letra V (7 placeholders 'vaso de precipitados')
DELETE FROM rosco_questions WHERE id IN (28386, 28387, 28388, 28389, 28390, 28391, 28393);

-- Letra W (9 placeholders 'kiwi')
DELETE FROM rosco_questions WHERE id IN (28395, 28396, 28397, 28398, 28399, 28400, 28401, 28402, 28403);

-- Letra X (10 placeholders 'examen' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28404, 28405, 28406, 28407, 28408, 28409, 28410, 28411, 28412, 28413);

-- Letra Y (10 placeholders 'espacios y lineas' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28414, 28415, 28416, 28417, 28418, 28419, 28420, 28421, 28422, 28423);

-- Letra Z (10 placeholders 'zona' — toda la letra)
DELETE FROM rosco_questions WHERE id IN (28424, 28425, 28426, 28427, 28428, 28429, 28430, 28431, 28432, 28433);

-- =====================================================================
-- 3º ESO · INSERCIÓN DE CONTENIDO NUEVO
-- ~70 entradas para rellenar las 8 letras vacías y reforzar las
-- letras con menos de 5 entradas tras el borrado masivo.
-- Vocabulario LOMLOE de 3º ESO Tecnología.
-- =====================================================================

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- LETRA B (refuerzo, +3)
('B','empieza','Componente eléctrico que ilumina al pasar la corriente.','bombilla','tecnologia','eso',ARRAY[3],1),
('B','empieza','Pieza del taladro para hacer agujeros.','broca','tecnologia','eso',ARRAY[3],1),
('B','empieza','Barra que une el pistón con el cigüeñal en un motor.','biela','tecnologia','eso',ARRAY[3],2),

-- LETRA D (refuerzo, +1)
('D','empieza','Representación gráfica del funcionamiento de un circuito.','diagrama','tecnologia','eso',ARRAY[3],2),

-- LETRA E (vacía, +5)
('E','empieza','Disposición de elementos que sostienen una construcción.','estructura','tecnologia','eso',ARRAY[3],2),
('E','empieza','Tensión interna que sufre un material (tracción, compresión, flexión).','esfuerzo','tecnologia','eso',ARRAY[3],2),
('E','empieza','Mecanismo formado por ruedas dentadas que transmiten movimiento.','engranaje','tecnologia','eso',ARRAY[3],2),
('E','empieza','Forma de energía que mueve electrones por un circuito.','electricidad','tecnologia','eso',ARRAY[3],1),
('E','empieza','Relación matemática entre las medidas del dibujo y la realidad.','escala','tecnologia','eso',ARRAY[3],1),

-- LETRA G (refuerzo, +4)
('G','empieza','Máquina que produce corriente eléctrica a partir de movimiento.','generador','tecnologia','eso',ARRAY[3],2),
('G','empieza','Mineral de carbono conductor, presente en la mina del lápiz.','grafito','tecnologia','eso',ARRAY[3],2),
('G','empieza','Movimiento de rotación alrededor de un eje.','giro','tecnologia','eso',ARRAY[3],1),
('G','empieza','Unidad de medida de ángulos.','grados','tecnologia','eso',ARRAY[3],1),

-- LETRA H (refuerzo, +2)
('H','empieza','Parte física del ordenador (placa, procesador, memoria...).','hardware','tecnologia','eso',ARRAY[3],2),
('H','empieza','Utensilio manual usado en el taller (sierra, martillo, lima...).','herramienta','tecnologia','eso',ARRAY[3],1),

-- LETRA I (refuerzo, +4)
('I','empieza','Dispositivo que abre o cierra un circuito eléctrico.','interruptor','tecnologia','eso',ARRAY[3],2),
('I','empieza','Cantidad de corriente que circula por un cable, medida en amperios.','intensidad','tecnologia','eso',ARRAY[3],2),
('I','empieza','Red mundial de ordenadores conectados entre sí.','internet','tecnologia','eso',ARRAY[3],1),
('I','empieza','Periférico de salida que pasa información a papel.','impresora','tecnologia','eso',ARRAY[3],1),

-- LETRA J (refuerzo, +4)
('J','empieza','Unidad de energía en el Sistema Internacional.','julio','tecnologia','eso',ARRAY[3],1),
('J','empieza','Mando de control con palanca para videojuegos.','joystick','tecnologia','eso',ARRAY[3],2),
('J','empieza','Holgura o pequeño espacio entre dos piezas mecánicas.','juego','tecnologia','eso',ARRAY[3],1),
('J','empieza','Pieza de goma que evita fugas entre dos elementos.','junta','tecnologia','eso',ARRAY[3],1),

-- LETRA K (refuerzo, +3)
('K','empieza','Unidad de temperatura absoluta del Sistema Internacional.','kelvin','tecnologia','eso',ARRAY[3],1),
('K','empieza','Unidad de información digital equivalente a 1024 bytes.','kilobyte','tecnologia','eso',ARRAY[3],2),
('K','empieza','Conjunto de piezas listas para montar uno mismo.','kit','tecnologia','eso',ARRAY[3],1),

-- LETRA L (refuerzo, +2)
('L','empieza','Sustancia que reduce el rozamiento entre piezas mecánicas.','lubricante','tecnologia','eso',ARRAY[3],2),
('L','empieza','Material cerámico cocido usado en construcción.','ladrillo','tecnologia','eso',ARRAY[3],1),

-- LETRA M (refuerzo, +3)
('M','empieza','Máquina que transforma energía en movimiento.','motor','tecnologia','eso',ARRAY[3],1),
('M','empieza','Material orgánico obtenido de los troncos de los árboles.','madera','tecnologia','eso',ARRAY[3],1),
('M','empieza','Conjunto de piezas que transmiten fuerza y movimiento.','mecanismo','tecnologia','eso',ARRAY[3],2),

-- LETRA N (vacía, +5)
('N','empieza','Almacenamiento de archivos y servicios en internet.','nube','tecnologia','eso',ARRAY[3],1),
('N','empieza','Tecnología que usa aire comprimido para transmitir fuerza.','neumática','tecnologia','eso',ARRAY[3],2),
('N','empieza','Programa para visitar páginas web.','navegador','tecnologia','eso',ARRAY[3],1),
('N','empieza','Cable eléctrico de retorno, de color azul.','neutro','tecnologia','eso',ARRAY[3],1),
('N','empieza','Punto de unión o intersección en un circuito o red.','nodo','tecnologia','eso',ARRAY[3],2),

-- LETRA Ñ (vacía, +5)
('Ñ','contiene','Rueda dentada pequeña de un engranaje (contiene Ñ).','piñón','tecnologia','eso',ARRAY[3],1),
('Ñ','contiene','Fase creativa del proyecto tecnológico (contiene Ñ).','diseño','tecnologia','eso',ARRAY[3],1),
('Ñ','contiene','Metal blando usado en la soldadura blanda de circuitos (contiene Ñ).','estaño','tecnologia','eso',ARRAY[3],1),
('Ñ','contiene','Parte de una ventana de un navegador web (contiene Ñ).','pestaña','tecnologia','eso',ARRAY[3],2),
('Ñ','contiene','Indicación de seguridad en el taller (contiene Ñ).','señal','tecnologia','eso',ARRAY[3],1),

-- LETRA O (refuerzo, +4)
('O','empieza','Máquina electrónica programable que procesa datos.','ordenador','tecnologia','eso',ARRAY[3],1),
('O','empieza','Vibración eléctrica que se propaga por un medio.','onda','tecnologia','eso',ARRAY[3],2),
('O','empieza','Capa rojiza que aparece en el hierro al contacto con el aire.','óxido','tecnologia','eso',ARRAY[3],1),
('O','empieza','Cualquier cosa material que se diseña o fabrica.','objeto','tecnologia','eso',ARRAY[3],1),

-- LETRA Q (vacía, +5)
('Q','contiene','Dibujo simplificado con símbolos de un circuito (contiene Q).','esquema','tecnologia','eso',ARRAY[3],2),
('Q','contiene','Dispositivo que realiza un trabajo mecánico (contiene Q).','máquina','tecnologia','eso',ARRAY[3],2),
('Q','contiene','Estructura interna de un ordenador (contiene Q).','arquitectura','tecnologia','eso',ARRAY[3],2),
('Q','contiene','Conjunto de instrucciones agrupadas en programación (contiene Q).','bloque','tecnologia','eso',ARRAY[3],1),
('Q','contiene','Pegatina con la clasificación energética de un electrodoméstico (contiene Q).','etiqueta','tecnologia','eso',ARRAY[3],2),

-- LETRA R (refuerzo, +2)
('R','empieza','Fuerza que se opone al movimiento entre dos superficies en contacto.','rozamiento','tecnologia','eso',ARRAY[3],2),
('R','empieza','Máquina automática programable capaz de realizar tareas.','robot','tecnologia','eso',ARRAY[3],1),

-- LETRA S (refuerzo, +2)
('S','empieza','Dispositivo que detecta cambios físicos (luz, temperatura, presión).','sensor','tecnologia','eso',ARRAY[3],2),
('S','empieza','Conjunto de programas y datos del ordenador.','software','tecnologia','eso',ARRAY[3],2),

-- LETRA U (vacía, +5)
('U','empieza','Conector estándar para dispositivos informáticos (siglas).','usb','tecnologia','eso',ARRAY[3],1),
('U','empieza','Conexión fija entre dos piezas mecánicas.','unión','tecnologia','eso',ARRAY[3],1),
('U','empieza','Persona que utiliza un sistema informático.','usuario','tecnologia','eso',ARRAY[3],1),
('U','empieza','Cantidad estándar usada para medir.','unidad','tecnologia','eso',ARRAY[3],1),
('U','empieza','Función o utilidad para la que sirve un objeto.','utilidad','tecnologia','eso',ARRAY[3],2),

-- LETRA V (refuerzo, +2)
('V','empieza','Magnitud física que mide la rapidez de un movimiento.','velocidad','tecnologia','eso',ARRAY[3],2),
('V','empieza','Unidad de tensión eléctrica del Sistema Internacional.','voltio','tecnologia','eso',ARRAY[3],1),

-- LETRA W (refuerzo, +4)
('W','empieza','Conexión inalámbrica a internet.','wifi','tecnologia','eso',ARRAY[3],1),
('W','empieza','Página de internet (red mundial).','web','tecnologia','eso',ARRAY[3],1),
('W','empieza','Sistema operativo más usado en ordenadores personales.','windows','tecnologia','eso',ARRAY[3],2),
('W','empieza','Procesador de textos de Microsoft Office.','word','tecnologia','eso',ARRAY[3],1),

-- LETRA X (vacía, +5)
('X','contiene','Punto mínimo de luz en una pantalla digital (contiene X).','píxel','tecnologia','eso',ARRAY[3],1),
('X','contiene','Circuito que combina conexiones en serie y en paralelo (contiene X).','mixto','tecnologia','eso',ARRAY[3],2),
('X','contiene','Enlace eléctrico entre dos componentes (contiene X).','conexión','tecnologia','eso',ARRAY[3],2),
('X','contiene','Material que se dobla con facilidad sin romperse (contiene X).','flexible','tecnologia','eso',ARRAY[3],2),
('X','contiene','Forma de tuerca con seis lados (contiene X).','hexagonal','tecnologia','eso',ARRAY[3],2),

-- LETRA Y (vacía, +5)
('Y','contiene','Plan de trabajo para diseñar y construir algo (contiene Y).','proyecto','tecnologia','eso',ARRAY[3],1),
('Y','contiene','Prueba experimental para comprobar un material (contiene Y).','ensayo','tecnologia','eso',ARRAY[3],1),
('Y','contiene','Norma fundamental de la física (... de Ohm) (contiene Y).','ley','tecnologia','eso',ARRAY[3],1),
('Y','contiene','Descarga eléctrica natural durante una tormenta (contiene Y).','rayo','tecnologia','eso',ARRAY[3],1),
('Y','empieza','Bloque de hierro sobre el que se forjan los metales.','yunque','tecnologia','eso',ARRAY[3],1),

-- LETRA Z (vacía, +5)
('Z','empieza','Soporte donde se inserta un chip o componente electrónico.','zócalo','tecnologia','eso',ARRAY[3],1),
('Z','empieza','Componente electrónico que emite un sonido o pitido.','zumbador','tecnologia','eso',ARRAY[3],2),
('Z','contiene','Herramienta para sujetar piezas pequeñas (contiene Z).','pinza','tecnologia','eso',ARRAY[3],1),
('Z','contiene','Cada parte de una máquina (contiene Z).','pieza','tecnologia','eso',ARRAY[3],1),
('Z','contiene','Utensilio básico para dibujar o trazar (contiene Z).','lápiz','tecnologia','eso',ARRAY[3],1);

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- 28608 'queso' def placa — borrar (placa no tiene Q)
DELETE FROM rosco_questions WHERE id = 28608;

-- 28610 'queso' def frecuencia — renombrar a frecuencia (sí tiene Q)
UPDATE rosco_questions
SET solution = 'frecuencia',
    definition = 'Número de ciclos por segundo de una señal eléctrica (contiene Q).'
WHERE id = 28610;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
