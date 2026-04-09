-- ============================================================
-- MIGRACIÓN: Añadir Bachillerato como nivel educativo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. ACTUALIZAR CONSTRAINTS de nivel en todas las tablas
-- Eliminamos la constraint antigua y añadimos la nueva que incluye 'bachillerato'

-- subjects
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_level_check;
ALTER TABLE subjects ADD CONSTRAINT subjects_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- runner_categories
ALTER TABLE runner_categories DROP CONSTRAINT IF EXISTS runner_categories_level_check;
ALTER TABLE runner_categories ADD CONSTRAINT runner_categories_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- rosco_questions
ALTER TABLE rosco_questions DROP CONSTRAINT IF EXISTS rosco_questions_level_check;
ALTER TABLE rosco_questions ADD CONSTRAINT rosco_questions_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- intruso_sets
ALTER TABLE intruso_sets DROP CONSTRAINT IF EXISTS intruso_sets_level_check;
ALTER TABLE intruso_sets ADD CONSTRAINT intruso_sets_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- parejas_items
ALTER TABLE parejas_items DROP CONSTRAINT IF EXISTS parejas_items_level_check;
ALTER TABLE parejas_items ADD CONSTRAINT parejas_items_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- ordena_frases
ALTER TABLE ordena_frases DROP CONSTRAINT IF EXISTS ordena_frases_level_check;
ALTER TABLE ordena_frases ADD CONSTRAINT ordena_frases_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- ordena_historias
ALTER TABLE ordena_historias DROP CONSTRAINT IF EXISTS ordena_historias_level_check;
ALTER TABLE ordena_historias ADD CONSTRAINT ordena_historias_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- detective_sentences
ALTER TABLE detective_sentences DROP CONSTRAINT IF EXISTS detective_sentences_level_check;
ALTER TABLE detective_sentences ADD CONSTRAINT detective_sentences_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- comprension_texts
ALTER TABLE comprension_texts DROP CONSTRAINT IF EXISTS comprension_texts_level_check;
ALTER TABLE comprension_texts ADD CONSTRAINT comprension_texts_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato'));

-- app_content
ALTER TABLE app_content DROP CONSTRAINT IF EXISTS app_content_level_check;
ALTER TABLE app_content ADD CONSTRAINT app_content_level_check CHECK (level IN ('primaria', 'eso', 'bachillerato') OR level IS NULL);

-- game_sessions (si existe constraint de level)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'game_sessions' AND constraint_type = 'CHECK'
    AND constraint_name LIKE '%level%'
  ) THEN
    EXECUTE 'ALTER TABLE game_sessions DROP CONSTRAINT ' ||
      (SELECT constraint_name FROM information_schema.table_constraints
       WHERE table_name = 'game_sessions' AND constraint_type = 'CHECK'
       AND constraint_name LIKE '%level%' LIMIT 1);
  END IF;
END $$;

-- 2. INSERTAR ASIGNATURAS DE BACHILLERATO EN subjects
INSERT INTO subjects (level, grade, subject_id, name, icon) VALUES
  -- 1º Bachillerato
  ('bachillerato', 1, 'lengua', 'Lengua Castellana y Literatura I', '✍️'),
  ('bachillerato', 1, 'matematicas', 'Matemáticas I', '🧮'),
  ('bachillerato', 1, 'filosofia', 'Filosofía', '🤔'),
  ('bachillerato', 1, 'historia-mundo', 'Historia del Mundo Contemporáneo', '🌍'),
  ('bachillerato', 1, 'biologia', 'Biología, Geología y Ciencias Ambientales', '🔬'),
  ('bachillerato', 1, 'fisica', 'Física y Química', '🧪'),
  ('bachillerato', 1, 'dibujo-tecnico', 'Dibujo Técnico I', '📐'),
  ('bachillerato', 1, 'economia', 'Economía', '📈'),
  ('bachillerato', 1, 'latin', 'Latín I', '🏛️'),
  ('bachillerato', 1, 'literatura-universal', 'Literatura Universal', '📖'),
  ('bachillerato', 1, 'tecnologia', 'Tecnología e Ingeniería I', '💻'),
  ('bachillerato', 1, 'ed-fisica', 'Educación Física', '🤸'),
  ('bachillerato', 1, 'ingles', 'Inglés I', '🇬🇧'),
  ('bachillerato', 1, 'valenciano', 'Valenciano', '🍊'),
  ('bachillerato', 1, 'frances', 'Francés', '🇫🇷'),
  ('bachillerato', 1, 'tutoria', 'Tutoría', '🤝'),
  ('bachillerato', 1, 'programacion', 'Programación', '💻'),
  -- 2º Bachillerato
  ('bachillerato', 2, 'lengua', 'Lengua Castellana y Literatura II', '✍️'),
  ('bachillerato', 2, 'matematicas', 'Matemáticas II', '🧮'),
  ('bachillerato', 2, 'historia-espana', 'Historia de España', '🇪🇸'),
  ('bachillerato', 2, 'filosofia', 'Historia de la Filosofía', '🤔'),
  ('bachillerato', 2, 'biologia', 'Biología', '🔬'),
  ('bachillerato', 2, 'fisica', 'Física', '🧪'),
  ('bachillerato', 2, 'quimica', 'Química', '⚗️'),
  ('bachillerato', 2, 'dibujo-tecnico', 'Dibujo Técnico II', '📐'),
  ('bachillerato', 2, 'economia-empresa', 'Economía de la Empresa', '📈'),
  ('bachillerato', 2, 'latin', 'Latín II', '🏛️'),
  ('bachillerato', 2, 'geografia', 'Geografía', '🌍'),
  ('bachillerato', 2, 'arte', 'Historia del Arte', '🎨'),
  ('bachillerato', 2, 'tecnologia', 'Tecnología e Ingeniería II', '💻'),
  ('bachillerato', 2, 'ingles', 'Inglés II', '🇬🇧'),
  ('bachillerato', 2, 'valenciano', 'Valenciano', '🍊'),
  ('bachillerato', 2, 'frances', 'Francés', '🇫🇷'),
  ('bachillerato', 2, 'tutoria', 'Tutoría', '🤝'),
  ('bachillerato', 2, 'programacion', 'Programación', '💻')
ON CONFLICT (level, grade, subject_id) DO NOTHING;

-- ============================================================
-- 3. DATOS SEED — Rosco (Pasapalabra) para Bachillerato
-- Ejemplos iniciales por asignatura. Ampliar progresivamente.
-- ============================================================

-- === 1º BACHILLERATO — LENGUA ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Figura retórica que consiste en la repetición de sonidos al inicio de palabras cercanas', 'aliteracion', 'lengua', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Movimiento literario del siglo XVII español caracterizado por la complejidad y el ingenio', 'barroco', 'lengua', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Tipo de verso de arte mayor formado por once sílabas', 'endecasilabo', 'lengua', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Variedad lingüística asociada a una zona geográfica determinada', 'dialecto', 'lengua', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Texto extenso en prosa que explora un tema de forma argumentativa y personal', 'ensayo', 'lengua', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Recurso lingüístico que altera el orden habitual de las palabras en la oración', 'figuraRetorica', 'lengua', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Movimiento literario del siglo XVI que revaloriza la cultura clásica grecolatina', 'garcilasismo', 'lengua', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Exageración deliberada de la realidad con fines expresivos', 'hiperbole', 'lengua', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Figura retórica que expresa lo contrario de lo que se quiere decir', 'ironia', 'lengua', 'bachillerato', '{1}', 1),
('J', 'contiene', 'Composición poética breve de origen japonés formada por tres versos de 5, 7 y 5 sílabas', 'haiku', 'lengua', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Género literario en verso que expresa sentimientos y emociones del autor', 'lirica', 'lengua', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Figura retórica que identifica un término real con uno imaginario por semejanza', 'metafora', 'lengua', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Género literario en prosa que narra hechos ficticios o reales', 'narrativa', 'lengua', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Figura retórica que combina dos conceptos aparentemente contradictorios', 'oximoron', 'lengua', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Corriente literaria del siglo XV que mezcla elementos pastoriles con sentimientos amorosos', 'petrarquismo', 'lengua', 'bachillerato', '{1}', 3),
('R', 'empieza', 'Movimiento literario del siglo XIX que buscaba reflejar la realidad de forma objetiva', 'realismo', 'lengua', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Estrofa de catorce versos endecasílabos con rima consonante', 'soneto', 'lengua', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Género literario dialogado destinado a la representación escénica', 'teatro', 'lengua', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Cada una de las líneas que componen un poema', 'verso', 'lengua', 'bachillerato', '{1}', 1);

-- === 1º BACHILLERATO — FILOSOFÍA ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Filósofo griego discípulo de Platón, autor de la Ética a Nicómaco', 'aristoteles', 'filosofia', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Corriente filosófica que afirma que el conocimiento se obtiene a partir de la experiencia sensorial', 'empirismo', 'filosofia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Filósofo francés autor de "Pienso, luego existo"', 'descartes', 'filosofia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Corriente filosófica del siglo XX centrada en la existencia individual y la libertad', 'existencialismo', 'filosofia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Disciplina filosófica que estudia la naturaleza y estructura de las formas de pensamiento', 'formalLogica', 'filosofia', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Filósofo alemán que desarrolló la dialéctica como método filosófico', 'hegel', 'filosofia', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Corriente filosófica de la Ilustración que defiende la razón como guía del progreso humano', 'ilustracion', 'filosofia', 'bachillerato', '{1}', 1),
('K', 'empieza', 'Filósofo alemán autor de la Crítica de la razón pura', 'kant', 'filosofia', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Disciplina filosófica que estudia las reglas del razonamiento válido', 'logica', 'filosofia', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Rama de la filosofía que estudia la naturaleza última de la realidad', 'metafisica', 'filosofia', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Filósofo alemán que proclamó la muerte de Dios y la voluntad de poder', 'nietzsche', 'filosofia', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Rama de la filosofía que estudia el ser y la existencia', 'ontologia', 'filosofia', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Filósofo griego que fundó la Academia y escribió La República', 'platon', 'filosofia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Corriente filosófica que considera la razón como fuente principal del conocimiento', 'racionalismo', 'filosofia', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Filósofo griego conocido por su método de preguntas para alcanzar la verdad', 'socrates', 'filosofia', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Corriente ética que juzga las acciones por su utilidad para producir felicidad', 'utilitarismo', 'filosofia', 'bachillerato', '{1}', 2);

-- === 1º BACHILLERATO — MATEMÁTICAS ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Valor numérico que toma una función al acercarse a un punto determinado', 'asintotica', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Teorema que permite calcular las probabilidades a posteriori a partir de las a priori', 'bayes', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Rama de las matemáticas que estudia las variaciones de funciones y sus derivadas', 'calculo', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Operación que calcula la tasa de cambio instantánea de una función', 'derivada', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Igualdad matemática que contiene una o más incógnitas', 'ecuacion', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Relación que asigna a cada elemento de un conjunto exactamente un elemento de otro', 'funcion', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Representación visual de una función en el plano cartesiano', 'grafica', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Curva cónica abierta formada por dos ramas simétricas', 'hiperbola', 'matematicas', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Operación inversa de la derivación que calcula el área bajo una curva', 'integral', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Valor al que se aproxima una función cuando la variable se acerca a un punto', 'limite', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Tabla rectangular de números ordenados en filas y columnas', 'matriz', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'contiene', 'Función trigonométrica que relaciona un ángulo con la razón entre el cateto opuesto y la hipotenusa', 'seno', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Curva cónica con forma de U obtenida al cortar un cono con un plano paralelo a su generatriz', 'parabola', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Número que se obtiene al dividir un término entre el anterior en una progresión geométrica', 'razon', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Conjunto de ecuaciones que deben resolverse simultáneamente', 'sistema', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Rama de las matemáticas que estudia las relaciones entre los lados y ángulos de los triángulos', 'trigonometria', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Segmento orientado en el espacio con magnitud y dirección', 'vector', 'matematicas', 'bachillerato', '{1}', 1);

-- === 1º BACHILLERATO — HISTORIA DEL MUNDO CONTEMPORÁNEO ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Unión política de Alemania y Austria llevada a cabo por Hitler en 1938', 'anschluss', 'historia-mundo', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Partido político ruso liderado por Lenin que tomó el poder en 1917', 'bolchevique', 'historia-mundo', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Periodo de tensión geopolítica entre EE.UU. y la URSS tras la Segunda Guerra Mundial', 'guerraFria', 'historia-mundo', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Proceso por el cual las colonias europeas en África y Asia obtuvieron su independencia', 'descolonizacion', 'historia-mundo', 'bachillerato', '{1}', 1),
('E', 'contiene', 'Alianza militar formada por EE.UU. y Europa occidental en 1949', 'otan', 'historia-mundo', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Sistema político totalitario de extrema derecha surgido en Italia con Mussolini', 'fascismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Política de transparencia y apertura impulsada por Gorbachov en la URSS', 'glasnost', 'historia-mundo', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Genocidio perpetrado por la Alemania nazi contra los judíos europeos', 'holocausto', 'historia-mundo', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Ideología política que defiende la unidad y soberanía de los pueblos según su nación', 'imperialismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Sistema económico basado en la propiedad privada y el libre mercado', 'liberalismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Plan estadounidense de ayuda económica para la reconstrucción de Europa tras la IIGM', 'marshall', 'historia-mundo', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Ideología del Partido Nacionalsocialista Obrero Alemán liderado por Hitler', 'nazismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Política de reformas económicas de reestructuración impulsada por Gorbachov', 'perestroika', 'historia-mundo', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Acontecimiento de 1789 que derrocó la monarquía absoluta francesa', 'revolucion', 'historia-mundo', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Ideología política que aboga por la propiedad colectiva de los medios de producción', 'socialismo', 'historia-mundo', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Tratado firmado en 1919 que puso fin a la Primera Guerra Mundial', 'versalles', 'historia-mundo', 'bachillerato', '{1}', 1);

-- === 1º BACHILLERATO — FÍSICA Y QUÍMICA ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Unidad mínima de un elemento químico que conserva sus propiedades', 'atomo', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Magnitud que expresa la cantidad de sustancia por unidad de volumen de una disolución', 'concentracion', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Relación entre la masa y el volumen de un cuerpo', 'densidad', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Capacidad de un cuerpo para realizar un trabajo. Se mide en julios', 'energia', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Interacción que puede cambiar el estado de movimiento de un objeto', 'fuerza', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Fuerza de atracción entre dos masas. Descrita por Newton', 'gravedad', 'fisica', 'bachillerato', '{1}', 1),
('H', 'contiene', 'Ley que establece que la energía de un fotón es proporcional a su frecuencia', 'planck', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Átomos del mismo elemento con diferente número de neutrones', 'isotopo', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Ley de Newton que establece F = m × a', 'ley', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Unidad de cantidad de sustancia equivalente a 6,022 × 10²³ partículas', 'mol', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Partícula subatómica sin carga eléctrica presente en el núcleo del átomo', 'neutron', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Trayectoria que describe un electrón alrededor del núcleo según el modelo atómico', 'orbital', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Tabla que clasifica los elementos químicos por su número atómico', 'periodica', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Proceso por el que sustancias se transforman en otras diferentes', 'reaccion', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Magnitud que mide el grado de agitación térmica de las partículas de un cuerpo', 'temperatura', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Magnitud que mide la rapidez con que un objeto cambia de posición', 'velocidad', 'fisica', 'bachillerato', '{1}', 1);

-- === 1º BACHILLERATO — BIOLOGÍA ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Molécula que almacena energía en las células, conocida como la moneda energética', 'atp', 'biologia', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Conjunto de seres vivos de la misma especie que habitan en un área determinada', 'biocenosis', 'biologia', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Proceso de división celular que produce células genéticamente idénticas', 'citoquinesis', 'biologia', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Ácido nucleico de doble hélice que contiene la información genética', 'adn', 'biologia', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Proteína que actúa como catalizador biológico acelerando reacciones químicas', 'enzima', 'biologia', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Proceso por el que las plantas convierten la luz solar en energía química', 'fotosintesis', 'biologia', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Unidad hereditaria formada por un segmento de ADN', 'gen', 'biologia', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Individuo que posee dos alelos diferentes para un mismo gen', 'heterocigoto', 'biologia', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Orgánulo celular que contiene enzimas digestivas para degradar moléculas', 'lisosoma', 'biologia', 'bachillerato', '{1}', 2),
('M', 'empieza', 'División celular reductiva que produce gametos con la mitad de cromosomas', 'meiosis', 'biologia', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Parte de la célula que contiene el material genético', 'nucleo', 'biologia', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Estructura celular especializada en una función, como la mitocondria', 'organulo', 'biologia', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Macromolécula formada por aminoácidos esencial para las funciones celulares', 'proteina', 'biologia', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Proceso celular que degrada glucosa para obtener energía en forma de ATP', 'respiracion', 'biologia', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Proceso por el que la información del ARNm se traduce en una cadena de aminoácidos', 'traduccion', 'biologia', 'bachillerato', '{1}', 2);

-- === 2º BACHILLERATO — HISTORIA DE ESPAÑA ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Cultura prerromana del sur de la Península Ibérica con influencia fenicia y griega', 'almohade', 'historia-espana', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Dinastía real que reinó en España desde el siglo XVIII, originaria de Francia', 'borbon', 'historia-espana', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Texto fundamental aprobado en 1978 que establece el marco jurídico de la democracia española', 'constitucion', 'historia-espana', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Proceso de eliminación de las leyes e instituciones de la dictadura franquista', 'desamortizacion', 'historia-espana', 'bachillerato', '{2}', 2),
('E', 'contiene', 'Periodo de gobierno liberal progresista entre 1868 y 1874 en España', 'sexenio', 'historia-espana', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Régimen dictatorial que gobernó España desde 1939 hasta 1975', 'franquismo', 'historia-espana', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Conflicto bélico español de 1936-1939 entre republicanos y sublevados', 'guerraCivil', 'historia-espana', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Dinastía real que reinó en España durante los siglos XVI y XVII', 'habsburgo', 'historia-espana', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Tribunal eclesiástico establecido en España en 1478 para perseguir la herejía', 'inquisicion', 'historia-espana', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Corriente ideológica del siglo XIX que defendía las libertades individuales y el parlamentarismo', 'liberalismo', 'historia-espana', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Pueblo norteafricano que invadió la Península Ibérica en 711', 'musulman', 'historia-espana', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Movimiento político del siglo XIX que defendía la identidad y autogobierno de los pueblos', 'nacionalismo', 'historia-espana', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Sistema político de la Restauración basado en la alternancia pactada de partidos', 'pactismo', 'historia-espana', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Proceso militar y político cristiano de recuperación del territorio peninsular musulmán', 'reconquista', 'historia-espana', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Periodo de la historia de España marcado por la monarquía parlamentaria actual', 'sucesion', 'historia-espana', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Periodo de cambio político pacífico de la dictadura a la democracia en España', 'transicion', 'historia-espana', 'bachillerato', '{2}', 1);

-- === 2º BACHILLERATO — QUÍMICA ===
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Compuesto orgánico con un grupo funcional -CHO', 'aldehido', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Disolución cuyo pH resiste cambios al añadir pequeñas cantidades de ácido o base', 'buffer', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Sustancia que aumenta la velocidad de una reacción sin consumirse', 'catalizador', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Mezcla homogénea de un soluto en un disolvente', 'disolucion', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Proceso en el que se utiliza corriente eléctrica para provocar una reacción química', 'electrolisis', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Compuesto orgánico formado únicamente por carbono e hidrógeno', 'hidrocarburo', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Compuesto orgánico con dos radicales hidrocarbonados unidos a un oxígeno (R-O-R)', 'isomero', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Principio que establece que un sistema en equilibrio se opone a los cambios impuestos', 'lechatelier', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Cantidad de sustancia que contiene tantas entidades como átomos hay en 12g de C-12', 'mol', 'quimica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Sistema de reglas para nombrar los compuestos químicos', 'nomenclatura', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Reacción en la que un átomo pierde electrones', 'oxidacion', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Medida de la acidez de una disolución en escala logarítmica', 'ph', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Reacción en la que un átomo gana electrones', 'reduccion', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Estudio de los cambios energéticos en las reacciones químicas', 'termodinamica', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Propiedad coligativa por la que la presión de vapor de un disolvente disminuye al añadir soluto', 'vaporPresion', 'quimica', 'bachillerato', '{2}', 3);

-- === RUNNER CATEGORIES — Bachillerato ===
-- Categorías para Runner, JuegoMemoria, Clasificador, LluviaDePalabras, etc.

INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
-- Lengua 1º Bach
('lengua', 'bachillerato', '{1,2}', 'Figuras retóricas', '["metáfora","símil","hipérbole","anáfora","metonimia","sinestesia","oxímoron","personificación","aliteración","antítesis"]'),
('lengua', 'bachillerato', '{1,2}', 'Movimientos literarios', '["Renacimiento","Barroco","Neoclasicismo","Romanticismo","Realismo","Naturalismo","Modernismo","Generación del 98","Vanguardias","Generación del 27"]'),
('lengua', 'bachillerato', '{1,2}', 'Géneros literarios', '["lírica","narrativa","teatro","ensayo","elegía","oda","soneto","novela","comedia","tragedia"]'),
-- Filosofía 1º Bach
('filosofia', 'bachillerato', '{1}', 'Filósofos antiguos', '["Sócrates","Platón","Aristóteles","Heráclito","Parménides","Demócrito","Epicuro","Zenón","Tales","Pitágoras"]'),
('filosofia', 'bachillerato', '{1}', 'Filósofos modernos', '["Descartes","Kant","Hegel","Nietzsche","Marx","Hume","Locke","Spinoza","Leibniz","Rousseau"]'),
('filosofia', 'bachillerato', '{1,2}', 'Ramas de la filosofía', '["metafísica","epistemología","ética","lógica","estética","ontología","política","antropología","gnoseología","axiología"]'),
-- Matemáticas 1º Bach
('matematicas', 'bachillerato', '{1}', 'Funciones matemáticas', '["lineal","cuadrática","exponencial","logarítmica","trigonométrica","polinómica","racional","radical","constante","inversa"]'),
('matematicas', 'bachillerato', '{1,2}', 'Conceptos de cálculo', '["límite","derivada","integral","continuidad","asíntota","máximo","mínimo","inflexión","tangente","pendiente"]'),
-- Historia del Mundo 1º Bach
('historia-mundo', 'bachillerato', '{1}', 'Revoluciones históricas', '["Francesa","Industrial","Rusa","Americana","China","Cubana","Mexicana","Gloriosa","Iraní","Haitiana"]'),
('historia-mundo', 'bachillerato', '{1}', 'Tratados y acuerdos', '["Versalles","Westfalia","Tordesillas","Utrecht","Viena","Yalta","Roma","Maastricht","París","Ginebra"]'),
-- Física y Química 1º Bach
('fisica', 'bachillerato', '{1}', 'Magnitudes físicas', '["velocidad","aceleración","fuerza","energía","potencia","presión","temperatura","densidad","momento","impulso"]'),
('fisica', 'bachillerato', '{1}', 'Elementos químicos', '["hidrógeno","helio","litio","carbono","nitrógeno","oxígeno","sodio","cloro","hierro","oro"]'),
-- Biología 1º Bach
('biologia', 'bachillerato', '{1,2}', 'Orgánulos celulares', '["mitocondria","ribosoma","lisosoma","cloroplasto","retículo","Golgi","núcleo","vacuola","centrosoma","peroxisoma"]'),
('biologia', 'bachillerato', '{1,2}', 'Procesos biológicos', '["fotosíntesis","respiración","mitosis","meiosis","transcripción","traducción","replicación","fermentación","ósmosis","difusión"]'),
-- Economía 1º Bach
('economia', 'bachillerato', '{1}', 'Conceptos económicos', '["oferta","demanda","inflación","PIB","monopolio","oligopolio","deflación","recesión","superávit","déficit"]'),
-- Latín 1º Bach
('latin', 'bachillerato', '{1,2}', 'Vocabulario latino', '["aqua","terra","ignis","aer","vita","mors","amor","bellum","pax","lex"]'),
-- Historia de España 2º Bach
('historia-espana', 'bachillerato', '{2}', 'Reyes de España', '["Isabel","Fernando","Carlos","Felipe","Alfonso","Amadeo","Juan Carlos","Felipe VI","Juana","Enrique"]'),
('historia-espana', 'bachillerato', '{2}', 'Periodos históricos', '["Reconquista","Descubrimiento","Habsburgo","Borbón","Restauración","República","Franquismo","Transición","Democracia","Ilustración"]'),
-- Química 2º Bach
('quimica', 'bachillerato', '{2}', 'Grupos funcionales', '["alcohol","aldehído","cetona","ácido","éster","éter","amina","amida","nitrilo","haluro"]'),
('quimica', 'bachillerato', '{2}', 'Tipos de reacción', '["oxidación","reducción","neutralización","combustión","hidrólisis","polimerización","sustitución","adición","eliminación","condensación"]'),
-- Geografía 2º Bach
('geografia', 'bachillerato', '{2}', 'Ríos de España', '["Ebro","Duero","Tajo","Guadiana","Guadalquivir","Júcar","Segura","Miño","Nalón","Ter"]'),
('geografia', 'bachillerato', '{2}', 'Comunidades Autónomas', '["Andalucía","Cataluña","Madrid","Valencia","Galicia","Castilla y León","País Vasco","Aragón","Canarias","Asturias"]'),
-- Arte 2º Bach
('arte', 'bachillerato', '{2}', 'Estilos artísticos', '["románico","gótico","renacentista","barroco","neoclásico","impresionista","cubista","surrealista","abstracto","expresionista"]'),
('arte', 'bachillerato', '{2}', 'Artistas españoles', '["Velázquez","Goya","Picasso","Dalí","Miró","El Greco","Murillo","Zurbarán","Sorolla","Tàpies"]'),
-- Inglés 1º-2º Bach
('ingles', 'bachillerato', '{1,2}', 'Academic vocabulary', '["although","therefore","furthermore","nevertheless","meanwhile","consequently","moreover","whereas","despite","regarding"]'),
('ingles', 'bachillerato', '{1,2}', 'Linking words', '["however","additionally","subsequently","ultimately","likewise","otherwise","hence","nonetheless","thereby","accordingly"]');

-- === INTRUSO SETS — Bachillerato ===
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('filosofia', 'bachillerato', '{1}', 'Filósofos griegos', '["Sócrates","Platón","Aristóteles","Heráclito"]', '["Descartes","Kant"]'),
('filosofia', 'bachillerato', '{1}', 'Corrientes éticas', '["utilitarismo","estoicismo","hedonismo","deontología"]', '["empirismo","racionalismo"]'),
('matematicas', 'bachillerato', '{1}', 'Funciones trigonométricas', '["seno","coseno","tangente","cotangente"]', '["derivada","integral"]'),
('historia-mundo', 'bachillerato', '{1}', 'Líderes de la IIGM', '["Churchill","Roosevelt","Stalin","De Gaulle"]', '["Bismarck","Napoleón"]'),
('fisica', 'bachillerato', '{1}', 'Leyes de Newton', '["inercia","fuerza","acción-reacción"]', '["gravitación","relatividad","termodinámica"]'),
('biologia', 'bachillerato', '{1}', 'Fases de la mitosis', '["profase","metafase","anafase","telofase"]', '["interfase","citocinesis"]'),
('lengua', 'bachillerato', '{1,2}', 'Generación del 27', '["Lorca","Alberti","Cernuda","Salinas"]', '["Machado","Unamuno"]'),
('quimica', 'bachillerato', '{2}', 'Ácidos orgánicos', '["acético","fórmico","butanoico","propanoico"]', '["sulfúrico","clorhídrico"]'),
('historia-espana', 'bachillerato', '{2}', 'Presidentes de la democracia', '["Suárez","González","Aznar","Zapatero"]', '["Franco","Primo de Rivera"]');

-- === PAREJAS — Bachillerato ===
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('filosofia', 'bachillerato', '{1}', 'Platón', 'Mundo de las Ideas'),
('filosofia', 'bachillerato', '{1}', 'Aristóteles', 'Ética a Nicómaco'),
('filosofia', 'bachillerato', '{1}', 'Descartes', 'Cogito ergo sum'),
('filosofia', 'bachillerato', '{1}', 'Kant', 'Imperativo categórico'),
('filosofia', 'bachillerato', '{1}', 'Nietzsche', 'Voluntad de poder'),
('filosofia', 'bachillerato', '{1}', 'Marx', 'Materialismo histórico'),
('matematicas', 'bachillerato', '{1}', 'Derivada', 'Tasa de cambio'),
('matematicas', 'bachillerato', '{1}', 'Integral', 'Área bajo la curva'),
('matematicas', 'bachillerato', '{1}', 'Límite', 'Convergencia'),
('matematicas', 'bachillerato', '{1}', 'Matriz', 'Tabla de números'),
('fisica', 'bachillerato', '{1}', 'Newton', 'F = m·a'),
('fisica', 'bachillerato', '{1}', 'Einstein', 'E = mc²'),
('fisica', 'bachillerato', '{1}', 'Ohm', 'V = I·R'),
('fisica', 'bachillerato', '{1}', 'Boyle', 'P·V = constante'),
('biologia', 'bachillerato', '{1}', 'ADN', 'Doble hélice'),
('biologia', 'bachillerato', '{1}', 'ARN', 'Cadena simple'),
('biologia', 'bachillerato', '{1}', 'Mitocondria', 'Central energética'),
('biologia', 'bachillerato', '{1}', 'Ribosoma', 'Síntesis de proteínas'),
('lengua', 'bachillerato', '{1,2}', 'Lorca', 'Romancero gitano'),
('lengua', 'bachillerato', '{1,2}', 'Cervantes', 'Don Quijote'),
('lengua', 'bachillerato', '{1,2}', 'Garcilaso', 'Églogas'),
('lengua', 'bachillerato', '{1,2}', 'Quevedo', 'El Buscón'),
('quimica', 'bachillerato', '{2}', 'pH < 7', 'Ácido'),
('quimica', 'bachillerato', '{2}', 'pH > 7', 'Base'),
('quimica', 'bachillerato', '{2}', 'pH = 7', 'Neutro'),
('historia-espana', 'bachillerato', '{2}', '1492', 'Descubrimiento de América'),
('historia-espana', 'bachillerato', '{2}', '1978', 'Constitución española'),
('historia-espana', 'bachillerato', '{2}', '1936', 'Guerra Civil'),
('arte', 'bachillerato', '{2}', 'Velázquez', 'Las Meninas'),
('arte', 'bachillerato', '{2}', 'Goya', 'Los fusilamientos'),
('arte', 'bachillerato', '{2}', 'Picasso', 'Guernica'),
('arte', 'bachillerato', '{2}', 'Dalí', 'La persistencia de la memoria');

-- ============================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================
