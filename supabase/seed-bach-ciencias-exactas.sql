-- ============================================================
-- SEED: Bachillerato — Matemáticas, Física y Química
-- Datos masivos para ciencias exactas
-- ============================================================

BEGIN;

-- ************************************************************
-- 1. ROSCO_QUESTIONS
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Función que asocia a cada elemento del dominio un único elemento del codominio, también llamada función inyectiva parcial', 'aplicacion', 'matematicas', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Base del sistema de logaritmos naturales, número irracional aproximadamente igual a 2,718', 'base', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Razón trigonométrica que relaciona el cateto contiguo con la hipotenusa en un triángulo rectángulo', 'coseno', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Operación que calcula la tasa de cambio instantánea de una función respecto a su variable', 'derivada', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Tipo de función cuya gráfica es una curva que crece o decrece de forma exponencial, de la forma f(x)=a^x', 'exponencial', 'matematicas', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Relación entre dos conjuntos que asigna a cada elemento del dominio exactamente un elemento del rango', 'funcion', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Representación visual de una función en el plano cartesiano', 'grafica', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Lado más largo de un triángulo rectángulo, opuesto al ángulo recto', 'hipotenusa', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Tipo de forma que puede adoptar un límite cuando al evaluar se obtiene 0/0 o infinito/infinito', 'indeterminacion', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'contiene', 'Propiedad de las matrices que establece que el producto no es conmutativo, es decir AB distinto de BA en general', 'conjugado', 'matematicas', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Unidad de medida de temperatura en el Sistema Internacional que equivale a grados Celsius más 273', 'kelvin', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Valor al que se aproxima una función cuando la variable independiente tiende a un punto determinado', 'limite', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Disposición rectangular de números en filas y columnas sobre la que se definen operaciones algebraicas', 'matriz', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Logaritmo en base e, también llamado logaritmo neperiano', 'neperiano', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Operación entre vectores que devuelve un escalar, también llamada producto escalar', 'ortogonal', 'matematicas', 'bachillerato', '{1}', 3),
('P', 'empieza', 'Rama de las matemáticas que estudia los fenómenos aleatorios y cuantifica la incertidumbre', 'probabilidad', 'matematicas', 'bachillerato', '{1}', 1),
('Q', 'contiene', 'Igualdad entre dos razones o fracciones, usada para resolver problemas de proporcionalidad', 'equivalencia', 'matematicas', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Número que al multiplicarse por sí mismo da como resultado el número original, inverso de elevar al cuadrado', 'raiz', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Razón trigonométrica que relaciona el cateto opuesto con la hipotenusa', 'seno', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Razón trigonométrica definida como el cociente entre el seno y el coseno de un ángulo', 'tangente', 'matematicas', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Operación conjuntista que combina todos los elementos de dos o más conjuntos', 'union', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Magnitud que tiene módulo, dirección y sentido, representado por una flecha en el plano o el espacio', 'vector', 'matematicas', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Teorema que relaciona los lados y ángulos de un triángulo no rectángulo, generalización del teorema de Pitágoras', 'newton', 'matematicas', 'bachillerato', '{1}', 3),
('X', 'empieza', 'Valor máximo de una función en un intervalo cerrado', 'extremo', 'matematicas', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Regla de derivación que permite derivar el cociente de dos funciones', 'cociente', 'matematicas', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Valor de x donde la función se anula, es decir, f(x)=0', 'raiz', 'matematicas', 'bachillerato', '{1}', 1);

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Rama del álgebra que estudia espacios vectoriales, transformaciones lineales y sistemas de ecuaciones', 'algebra', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Propiedad de una función que significa que está acotada tanto superior como inferiormente', 'biyeccion', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Función primitiva de otra, resultado de la integración indefinida', 'continuidad', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Número real asociado a una matriz cuadrada que determina si tiene inversa', 'determinante', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Relación que contiene una función incógnita y sus derivadas', 'ecuacion', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Teorema fundamental del cálculo que relaciona derivación e integración', 'fundamental', 'matematicas', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Rama de las matemáticas que estudia las propiedades del espacio usando coordenadas', 'geometria', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Prueba estadística que se formula para ser contrastada con datos muestrales', 'hipotesis', 'matematicas', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Operación inversa de la derivación que calcula el área bajo una curva', 'integral', 'matematicas', 'bachillerato', '{2}', 1),
('J', 'contiene', 'Matriz formada por las derivadas parciales de primer orden de una función vectorial', 'jacobiano', 'matematicas', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Método iterativo para resolver ecuaciones no lineales que usa la derivada de la función', 'cramer', 'matematicas', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Combinación de vectores multiplicados por escalares cuya suma da otro vector', 'lineal', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Valor esperado de una variable aleatoria, también llamado esperanza matemática', 'media', 'matematicas', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Distribución de probabilidad continua simétrica en forma de campana, también llamada de Gauss', 'normal', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Propiedad de dos vectores cuyo producto escalar es cero', 'ortogonalidad', 'matematicas', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Función de segundo grado cuya gráfica es una parábola', 'polinomio', 'matematicas', 'bachillerato', '{2}', 1),
('Q', 'contiene', 'Método de resolución de sistemas lineales que usa los determinantes de matrices asociadas', 'equivalente', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Número que indica el orden de la mayor submatriz con determinante no nulo', 'rango', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Conjunto de ecuaciones lineales que se resuelven simultáneamente', 'sistema', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Resultado demostrado rigurosamente a partir de axiomas y definiciones previas', 'teorema', 'matematicas', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Distribución estadística que se utiliza como aproximación de la normal para muestras pequeñas', 'student', 'matematicas', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Medida de dispersión que indica cuánto se alejan los datos de la media, igual a la desviación típica al cuadrado', 'varianza', 'matematicas', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Método de eliminación para resolver sistemas de ecuaciones lineales escalonando la matriz', 'gauss', 'matematicas', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Punto donde una función alcanza un valor mayor o menor que en todos los puntos cercanos', 'extremo', 'matematicas', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Regla de integración por partes que se aplica al producto de dos funciones', 'ley', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Valor de la variable aleatoria normal estandarizada usado en intervalos de confianza', 'estandarizar', 'matematicas', 'bachillerato', '{2}', 2);

-- ----- Física y Química 1º Bach -----
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Magnitud que mide la variación de velocidad por unidad de tiempo', 'aceleracion', 'fisica', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Principio que establece que un cuerpo sumergido experimenta un empuje igual al peso del fluido desalojado', 'bernoulli', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Movimiento en el que la trayectoria descrita es una circunferencia', 'circular', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Parte de la mecánica que estudia las causas del movimiento, es decir, las fuerzas', 'dinamica', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Magnitud escalar que se conserva en un sistema aislado y puede transformarse de unas formas a otras', 'energia', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Interacción entre dos cuerpos que puede modificar el estado de reposo o movimiento', 'fuerza', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Aceleración que experimentan los cuerpos en caída libre cerca de la superficie terrestre, aproximadamente 9,8 m/s²', 'gravedad', 'fisica', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Átomo del elemento más ligero del universo, con un solo protón y un electrón', 'hidrogeno', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Propiedad de los cuerpos que se opone a los cambios en su estado de movimiento, proporcional a la masa', 'inercia', 'fisica', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Unidad del Sistema Internacional para medir energía y trabajo', 'julio', 'fisica', 'bachillerato', '{1}', 1),
('K', 'empieza', 'Energía asociada al movimiento de un cuerpo, igual a un medio de m por v al cuadrado', 'cinetica', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Segunda ley de Newton que establece que la fuerza neta es igual a masa por aceleración', 'ley', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Magnitud que mide la cantidad de materia de un cuerpo, expresada en kilogramos', 'masa', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Partícula subatómica sin carga eléctrica que se encuentra en el núcleo del átomo', 'neutron', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Proceso químico de pérdida de electrones por parte de un átomo o ion', 'oxidacion', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Magnitud vectorial igual al producto de la masa por la velocidad de un cuerpo', 'potencia', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Rama de la física que estudia los fenómenos a escala atómica y subatómica', 'quimica', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Proceso en el que unos reactivos se transforman en productos diferentes', 'reaccion', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Cantidad de sustancia que contiene tantas entidades como átomos hay en 12 g de carbono-12', 'sustancia', 'fisica', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Clasificación de los elementos químicos ordenados por número atómico creciente', 'tabla', 'fisica', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Forma de enlace químico que se establece entre átomos no metálicos compartiendo electrones', 'union', 'fisica', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Magnitud vectorial que indica la rapidez y dirección del movimiento de un cuerpo', 'velocidad', 'fisica', 'bachillerato', '{1}', 1),
('W', 'empieza', 'Unidad de potencia del Sistema Internacional equivalente a un julio por segundo', 'vatio', 'fisica', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Tipo de reacción donde se intercambian iones entre dos compuestos en disolución', 'oxidorreduccion', 'fisica', 'bachillerato', '{1}', 3),
('Y', 'contiene', 'Ley que establece que la presión y el volumen de un gas a temperatura constante son inversamente proporcionales', 'boyle', 'fisica', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Fuerza que actúa sobre un cuerpo en movimiento circular y lo dirige hacia el centro', 'centripeta', 'fisica', 'bachillerato', '{1}', 2);

-- ----- Física 2º Bach -----
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Propiedad de la materia o del espacio que genera fuerzas de atracción o repulsión sobre partículas cargadas', 'atraccion', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Modelo atómico que propone órbitas cuantizadas para el electrón del átomo de hidrógeno', 'bohr', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Magnitud que describe la influencia gravitatoria, eléctrica o magnética en cada punto del espacio', 'campo', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Fenómeno ondulatorio que ocurre cuando una onda encuentra un obstáculo o abertura y se curva', 'difraccion', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Radiación electromagnética formada por fotones que se propaga a la velocidad de la luz', 'electromagnetica', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Fenómeno por el cual electrones son emitidos por un metal al incidir luz de frecuencia suficiente', 'fotoelectrico', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Campo de fuerzas producido por las masas, descrito por la ley de Newton de gravitación universal', 'gravitatorio', 'fisica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Principio de la mecánica cuántica que establece que es imposible conocer simultáneamente posición y momento con precisión arbitraria', 'heisenberg', 'fisica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Fenómeno en que dos o más ondas se superponen produciendo una onda resultante', 'interferencia', 'fisica', 'bachillerato', '{2}', 1),
('J', 'contiene', 'Ley que describe la fuerza entre dos cargas eléctricas y es análoga a la gravitación', 'coulomb', 'fisica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Energía mínima necesaria para arrancar un electrón de la superficie de un metal', 'trabajo', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Dispositivo óptico que concentra o dispersa los rayos de luz al refractarlos', 'lente', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Campo vectorial producido por cargas en movimiento o corrientes eléctricas', 'magnetico', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Partícula elemental sin carga eléctrica y masa casi nula, emitida en desintegraciones beta', 'neutrino', 'fisica', 'bachillerato', '{2}', 3),
('O', 'empieza', 'Rama de la física que estudia la propagación de la luz y los fenómenos asociados', 'optica', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Diferencia de potencial eléctrico entre dos puntos de un campo', 'potencial', 'fisica', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Magnitud mínima e indivisible de energía según la teoría de Planck', 'cuanto', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Teoría de Einstein que establece que las leyes de la física son las mismas en todos los sistemas inerciales', 'relatividad', 'fisica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Fenómeno de superposición de dos ondas de igual frecuencia que viajan en sentidos opuestos', 'estacionaria', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Dispositivo que transforma la tensión alterna aprovechando la inducción electromagnética', 'transformador', 'fisica', 'bachillerato', '{2}', 2),
('U', 'contiene', 'Ecuación de Einstein que relaciona masa y energía: E=mc²', 'equivalencia', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Magnitud constante a la que se propagan las ondas electromagnéticas en el vacío', 'velocidad', 'fisica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Científico que propuso la dualidad onda-partícula de la materia, asociando una longitud de onda a cada partícula', 'broglie', 'fisica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Ecuación de onda de la mecánica cuántica que describe la evolución temporal de un sistema', 'schrodinger', 'fisica', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Ley de inducción electromagnética que establece que la fem inducida es proporcional a la variación del flujo magnético', 'faraday', 'fisica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Fuerza que experimenta una carga eléctrica en movimiento dentro de un campo magnético', 'lorentz', 'fisica', 'bachillerato', '{2}', 2);

-- ----- Química 2º Bach -----
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES
('A', 'empieza', 'Sustancia que en disolución acuosa libera iones hidrógeno según la teoría de Arrhenius', 'acido', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Sustancia que en disolución acuosa libera iones hidróxido y neutraliza ácidos', 'base', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Rama de la química que estudia la velocidad de las reacciones y los factores que la afectan', 'cinetica', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Mezcla homogénea de un soluto en un disolvente a nivel molecular', 'disolucion', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Estado de una reacción reversible en el que las velocidades directa e inversa son iguales', 'equilibrio', 'quimica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Grupo funcional formado por un carbono unido a un oxígeno por doble enlace y a un hidrógeno', 'formilo', 'quimica', 'bachillerato', '{2}', 3),
('G', 'empieza', 'Energía libre de una reacción a presión constante que determina su espontaneidad', 'gibbs', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Reacción de un compuesto con agua que produce un ácido y una base', 'hidrolisis', 'quimica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Átomo o grupo de átomos con carga eléctrica neta, positiva o negativa', 'ion', 'quimica', 'bachillerato', '{2}', 1),
('J', 'contiene', 'Reacción en la que una sustancia gana electrones, disminuyendo su estado de oxidación', 'reduccion', 'quimica', 'bachillerato', '{2}', 1),
('K', 'empieza', 'Constante de equilibrio de una reacción que se expresa en función de las concentraciones molares', 'keq', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Principio que predice el desplazamiento del equilibrio cuando se modifica una condición', 'lechatelier', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Número de moles de soluto por litro de disolución, medida de concentración', 'molaridad', 'quimica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Reacción entre un ácido y una base que produce sal y agua', 'neutralizacion', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Rama de la química que estudia los compuestos del carbono y sus reacciones', 'organica', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Escala logarítmica que mide la acidez o basicidad de una disolución', 'ph', 'quimica', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Proceso en el que un metal se deteriora por reacción con el medio ambiente, generalmente por oxidación', 'quimisorcion', 'quimica', 'bachillerato', '{2}', 3),
('R', 'empieza', 'Reacción de transferencia de electrones entre un oxidante y un reductor', 'redox', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Producto de la constante de solubilidad, que indica la máxima cantidad de soluto disoluble', 'solubilidad', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Rama de la química que estudia los intercambios de calor en las reacciones', 'termodinamica', 'quimica', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Tipo de enlace covalente en el que los electrones compartidos no están equitativamente distribuidos', 'insaturado', 'quimica', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Operación de laboratorio que permite determinar la concentración de una disolución midiendo el volumen de otra de concentración conocida', 'valoracion', 'quimica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Ecuación que relaciona la constante de equilibrio con la variación de energía libre estándar de Gibbs', 'nernst', 'quimica', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Reacción en la que se libera energía en forma de calor al entorno', 'exotermica', 'quimica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Ley que establece que la velocidad de reacción depende de la concentración de los reactivos elevada a un exponente', 'ley', 'quimica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Sustancia que acelera una reacción química sin consumirse en el proceso', 'catalizador', 'quimica', 'bachillerato', '{2}', 1);


-- ************************************************************
-- 2. RUNNER_CATEGORIES
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('matematicas', 'bachillerato', '{1}', 'Funciones', '["dominio","rango","inyectiva","sobreyectiva","biyectiva","continua","derivable","creciente","decreciente","extremo","asintotas","composicion"]'),
('matematicas', 'bachillerato', '{1}', 'Trigonometría', '["seno","coseno","tangente","cosecante","secante","cotangente","radian","grado","identidad","arcocoseno","arcoseno","arcotangente"]'),
('matematicas', 'bachillerato', '{1}', 'Derivadas', '["pendiente","tangente","maximos","minimos","concavidad","convexidad","inflexion","regla","cadena","cociente","producto","logaritmica"]'),
('matematicas', 'bachillerato', '{1}', 'Límites', '["convergencia","divergencia","indeterminacion","asintotica","lateral","infinito","continuidad","discontinuidad","acotada","hopital"]'),
('matematicas', 'bachillerato', '{1}', 'Vectores', '["modulo","direccion","sentido","componentes","unitario","escalar","vectorial","paralelo","perpendicular","colineal","combinacion","base"]'),
('matematicas', 'bachillerato', '{1}', 'Matrices', '["cuadrada","rectangular","diagonal","identidad","transpuesta","inversa","determinante","adjunta","fila","columna","escalar","simetrica"]'),
('matematicas', 'bachillerato', '{1}', 'Probabilidad', '["suceso","espacio","muestral","independiente","condicionada","bayes","combinatoria","permutacion","variacion","combinacion","factorial","laplace"]'),
('matematicas', 'bachillerato', '{1}', 'Tipos de funciones', '["lineal","cuadratica","polinomica","racional","exponencial","logaritmica","trigonometrica","constante","afin","proporcional","radical","definida"]');

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('matematicas', 'bachillerato', '{2}', 'Integrales', '["primitiva","indefinida","definida","impropia","sustitucion","partes","parciales","racional","trigonometrica","area","volumen","barrow"]'),
('matematicas', 'bachillerato', '{2}', 'Álgebra lineal', '["determinante","rango","sistema","compatible","incompatible","indeterminado","gauss","cramer","homogeneo","parametro","dependencia","independencia"]'),
('matematicas', 'bachillerato', '{2}', 'Geometría analítica', '["recta","plano","perpendicular","paralelo","interseccion","distancia","angulo","proyeccion","simetrico","haz","ecuacion","parametricas"]'),
('matematicas', 'bachillerato', '{2}', 'Estadística', '["media","mediana","moda","varianza","desviacion","tipica","frecuencia","histograma","cuartil","percentil","correlacion","regresion"]'),
('matematicas', 'bachillerato', '{2}', 'Distribuciones', '["normal","binomial","uniforme","poisson","campana","simetrica","estandar","tipificacion","tabla","percentil","probabilidad","acumulada"]'),
('matematicas', 'bachillerato', '{2}', 'Inferencia estadística', '["muestra","poblacion","estimacion","intervalo","confianza","significacion","contraste","hipotesis","error","proporcion","parametro","estadistico"]'),
('matematicas', 'bachillerato', '{2}', 'Ecuaciones diferenciales', '["ordinaria","parcial","lineal","separable","homogenea","particular","general","constante","coeficiente","solucion","condicion","inicial"]'),
('matematicas', 'bachillerato', '{2}', 'Continuidad y derivabilidad', '["continua","derivable","diferenciable","limite","lateral","bolzano","weierstrass","rolle","lagrange","cauchy","hopital","taylor"]');

-- ----- Física y Química 1º Bach -----
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('fisica', 'bachillerato', '{1}', 'Cinemática', '["posicion","desplazamiento","velocidad","aceleracion","trayectoria","rectilineo","circular","parabolico","uniforme","acelerado","caida","libre"]'),
('fisica', 'bachillerato', '{1}', 'Dinámica', '["fuerza","masa","peso","newton","friccion","normal","tension","inercia","impulso","momento","equilibrio","accion"]'),
('fisica', 'bachillerato', '{1}', 'Energía', '["cinetica","potencial","mecanica","termica","electrica","quimica","nuclear","conservacion","trabajo","potencia","rendimiento","disipacion"]'),
('fisica', 'bachillerato', '{1}', 'Estructura atómica', '["proton","neutron","electron","nucleo","orbital","capa","subcapa","cuantico","spin","configuracion","electronegatividad","afinidad"]'),
('fisica', 'bachillerato', '{1}', 'Tabla periódica', '["periodo","grupo","metal","no metal","semimetal","alcalino","halogeno","noble","transicion","lantanido","actinido","electronegatividad"]'),
('fisica', 'bachillerato', '{1}', 'Enlace químico', '["ionico","covalente","metalico","polar","apolar","coordinado","intermolecular","hidrogeno","dipolo","fuerzas","london","hibridacion"]'),
('fisica', 'bachillerato', '{1}', 'Reacciones químicas', '["reactivo","producto","estequiometria","ajuste","moles","rendimiento","limitante","exceso","precipitacion","combustion","neutralizacion","redox"]'),
('fisica', 'bachillerato', '{1}', 'Leyes de los gases', '["presion","volumen","temperatura","boyle","charles","avogadro","ideal","moles","constante","atmosfera","pascal","kelvin"]');

-- ----- Física 2º Bach -----
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('fisica', 'bachillerato', '{2}', 'Campo gravitatorio', '["gravedad","masa","distancia","atraccion","potencial","intensidad","orbita","kepler","satelite","geoestacionario","escape","universal"]'),
('fisica', 'bachillerato', '{2}', 'Campo eléctrico', '["carga","coulomb","intensidad","potencial","lineas","flujo","gauss","condensador","dielectrico","permitividad","dipolo","superposicion"]'),
('fisica', 'bachillerato', '{2}', 'Campo magnético', '["corriente","solenoide","bobina","induccion","faraday","lenz","flujo","tesla","ampere","lorentz","fuerza","electromagnetismo"]'),
('fisica', 'bachillerato', '{2}', 'Ondas', '["frecuencia","longitud","amplitud","periodo","velocidad","transversal","longitudinal","interferencia","difraccion","reflexion","refraccion","estacionaria"]'),
('fisica', 'bachillerato', '{2}', 'Óptica', '["reflexion","refraccion","difraccion","lente","espejo","convergente","divergente","focal","imagen","aumento","prisma","snell"]'),
('fisica', 'bachillerato', '{2}', 'Física nuclear', '["radiactividad","alfa","beta","gamma","fision","fusion","desintegracion","semiperiodo","nucleon","isotopo","cadena","becquerel"]'),
('fisica', 'bachillerato', '{2}', 'Relatividad', '["einstein","velocidad","tiempo","masa","energia","inercia","simultaneidad","dilatacion","contraccion","equivalencia","foton","invariante"]'),
('fisica', 'bachillerato', '{2}', 'Mecánica cuántica', '["planck","foton","cuanto","onda","particula","dualidad","incertidumbre","schrodinger","probabilidad","orbital","funcion","broglie"]');

-- ----- Química 2º Bach -----
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('quimica', 'bachillerato', '{2}', 'Equilibrio químico', '["constante","equilibrio","concentracion","presion","temperatura","lechatelier","desplazamiento","homogeneo","heterogeneo","reversible","cociente","reaccion"]'),
('quimica', 'bachillerato', '{2}', 'Ácido-base', '["acido","base","ph","poh","hidrolisis","tampon","indicador","valoracion","equivalencia","fuerte","debil","anfotero"]'),
('quimica', 'bachillerato', '{2}', 'Redox', '["oxidacion","reduccion","oxidante","reductor","electrodo","anodo","catodo","pila","electrolisis","nernst","potencial","semicelda"]'),
('quimica', 'bachillerato', '{2}', 'Química orgánica - Grupos funcionales', '["alcano","alqueno","alquino","alcohol","aldehido","cetona","acido","ester","eter","amina","amida","nitrilo"]'),
('quimica', 'bachillerato', '{2}', 'Química orgánica - Nomenclatura', '["metano","etano","propano","butano","metanol","etanol","metanal","etanal","propanona","butanona","benceno","ciclohexano"]'),
('quimica', 'bachillerato', '{2}', 'Termodinámica química', '["entalpia","entropia","gibbs","exotermica","endotermica","espontanea","calorimetria","formacion","combustion","disolucion","hess","calorimetro"]'),
('quimica', 'bachillerato', '{2}', 'Cinética química', '["velocidad","concentracion","temperatura","catalizador","activacion","arrhenius","orden","molecularidad","mecanismo","intermedio","elemental","compleja"]'),
('quimica', 'bachillerato', '{2}', 'Tipos de reacciones orgánicas', '["sustitucion","adicion","eliminacion","condensacion","polimerizacion","oxidacion","reduccion","hidrolisis","esterificacion","saponificacion","halogenacion","deshidratacion"]');


-- ************************************************************
-- 3. INTRUSO_SETS
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('matematicas', 'bachillerato', '{1}', 'Razones trigonométricas', '["seno","coseno","tangente","cosecante"]', '["derivada","integral"]'),
('matematicas', 'bachillerato', '{1}', 'Propiedades de funciones', '["continuidad","derivabilidad","monotonia","acotacion"]', '["determinante","rango"]'),
('matematicas', 'bachillerato', '{1}', 'Tipos de matrices', '["diagonal","identidad","simetrica","triangular"]', '["tangente","limite"]'),
('matematicas', 'bachillerato', '{1}', 'Operaciones con vectores', '["suma","resta","producto escalar","producto vectorial"]', '["derivada","factorial"]'),
('matematicas', 'bachillerato', '{1}', 'Tipos de discontinuidad', '["evitable","salto finito","salto infinito","asintotica"]', '["simetrica","transpuesta"]'),
('matematicas', 'bachillerato', '{1}', 'Reglas de derivación', '["cadena","cociente","producto","potencia"]', '["moda","mediana"]'),
('matematicas', 'bachillerato', '{1}', 'Distribuciones de probabilidad', '["binomial","normal","poisson","uniforme"]', '["tangente","secante"]'),
('matematicas', 'bachillerato', '{1}', 'Elementos de una función', '["dominio","recorrido","imagen","preimagen"]', '["hipotenusa","cateto"]'),
('matematicas', 'bachillerato', '{1}', 'Tipos de límites', '["lateral","bilateral","infinito","indeterminado"]', '["escalar","vectorial"]'),
('matematicas', 'bachillerato', '{1}', 'Funciones elementales', '["lineal","cuadratica","exponencial","logaritmica"]', '["neutrón","protón"]');

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('matematicas', 'bachillerato', '{2}', 'Métodos de integración', '["sustitucion","partes","fracciones parciales","trigonometrica"]', '["gauss","cramer"]'),
('matematicas', 'bachillerato', '{2}', 'Tipos de sistemas', '["compatible determinado","compatible indeterminado","incompatible","homogeneo"]', '["derivable","integrable"]'),
('matematicas', 'bachillerato', '{2}', 'Medidas de dispersión', '["varianza","desviacion tipica","rango","coeficiente de variacion"]', '["determinante","rango matricial"]'),
('matematicas', 'bachillerato', '{2}', 'Teoremas del cálculo', '["Rolle","Lagrange","Bolzano","Weierstrass"]', '["Gauss","Cramer"]'),
('matematicas', 'bachillerato', '{2}', 'Elementos de geometría 3D', '["punto","recta","plano","vector director"]', '["derivada","integral"]'),
('matematicas', 'bachillerato', '{2}', 'Posiciones relativas de rectas', '["secantes","paralelas","coincidentes","cruzadas"]', '["continua","derivable"]'),
('matematicas', 'bachillerato', '{2}', 'Parámetros estadísticos', '["media","mediana","moda","percentil"]', '["asintotas","discontinuidad"]'),
('matematicas', 'bachillerato', '{2}', 'Propiedades de determinantes', '["antisimetrico","multilineal","fila nula implica cero","triangular igual producto diagonal"]', '["binomial","poisson"]'),
('matematicas', 'bachillerato', '{2}', 'Tipos de integrales', '["definida","indefinida","impropia","doble"]', '["frecuencia","amplitud"]'),
('matematicas', 'bachillerato', '{2}', 'Distribuciones continuas', '["normal","t de Student","chi cuadrado","F de Fisher"]', '["binomial","geometrica"]');

-- ----- Física y Química 1º Bach -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('fisica', 'bachillerato', '{1}', 'Magnitudes cinemáticas', '["posicion","velocidad","aceleracion","desplazamiento"]', '["masa","temperatura"]'),
('fisica', 'bachillerato', '{1}', 'Leyes de Newton', '["inercia","fuerza igual a masa por aceleracion","accion y reaccion","principio de superposicion"]', '["ley de Ohm","ley de Gauss"]'),
('fisica', 'bachillerato', '{1}', 'Tipos de energía', '["cinetica","potencial gravitatoria","elastica","termica"]', '["fuerza","aceleracion"]'),
('fisica', 'bachillerato', '{1}', 'Partículas subatómicas', '["proton","neutron","electron","quark"]', '["foton","molecula"]'),
('fisica', 'bachillerato', '{1}', 'Números cuánticos', '["principal","secundario","magnetico","spin"]', '["atomico","masico"]'),
('fisica', 'bachillerato', '{1}', 'Tipos de enlace', '["ionico","covalente","metalico","coordinado"]', '["nuclear","gravitatorio"]'),
('fisica', 'bachillerato', '{1}', 'Gases nobles', '["helio","neon","argon","kripton"]', '["oxigeno","nitrogeno"]'),
('fisica', 'bachillerato', '{1}', 'Halógenos', '["fluor","cloro","bromo","yodo"]', '["sodio","potasio"]'),
('fisica', 'bachillerato', '{1}', 'Tipos de reacción química', '["combustion","neutralizacion","precipitacion","redox"]', '["difraccion","interferencia"]'),
('fisica', 'bachillerato', '{1}', 'Unidades del SI', '["metro","kilogramo","segundo","amperio"]', '["atmosfera","caloría"]');

-- ----- Física 2º Bach -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('fisica', 'bachillerato', '{2}', 'Campos de fuerza', '["gravitatorio","electrico","magnetico","electromagnetico"]', '["termico","acústico"]'),
('fisica', 'bachillerato', '{2}', 'Leyes de Kepler', '["orbitas elipticas","areas iguales en tiempos iguales","relacion periodo-semieje","movimiento planetario"]', '["ley de Ohm","ley de Hooke"]'),
('fisica', 'bachillerato', '{2}', 'Fenómenos ondulatorios', '["reflexion","refraccion","difraccion","interferencia"]', '["inercia","gravitacion"]'),
('fisica', 'bachillerato', '{2}', 'Componentes de un circuito', '["resistencia","condensador","bobina","generador"]', '["lente","prisma"]'),
('fisica', 'bachillerato', '{2}', 'Tipos de radiación', '["alfa","beta","gamma","rayos X"]', '["infrasonido","ultrasonido"]'),
('fisica', 'bachillerato', '{2}', 'Ecuaciones de Maxwell', '["Gauss electrica","Gauss magnetica","Faraday","Ampere-Maxwell"]', '["Newton","Kepler"]'),
('fisica', 'bachillerato', '{2}', 'Consecuencias de la relatividad', '["dilatacion temporal","contraccion de longitud","equivalencia masa-energia","limite velocidad luz"]', '["principio de Arquimedes","ley de Hooke"]'),
('fisica', 'bachillerato', '{2}', 'Científicos de mecánica cuántica', '["Planck","Bohr","Heisenberg","Schrodinger"]', '["Aristoteles","Ptolomeo"]'),
('fisica', 'bachillerato', '{2}', 'Tipos de espectros', '["emision","absorcion","continuo","de lineas"]', '["covalente","ionico"]'),
('fisica', 'bachillerato', '{2}', 'Elementos ópticos', '["lente convergente","lente divergente","espejo concavo","espejo convexo"]', '["resistencia","condensador"]');

-- ----- Química 2º Bach -----
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('quimica', 'bachillerato', '{2}', 'Ácidos fuertes', '["clorhidrico","nitrico","sulfurico","perchlorico"]', '["acetico","carbonico"]'),
('quimica', 'bachillerato', '{2}', 'Indicadores ácido-base', '["fenolftaleina","azul de bromotimol","naranja de metilo","rojo de metilo"]', '["permanganato","dicromato"]'),
('quimica', 'bachillerato', '{2}', 'Funciones orgánicas oxigenadas', '["alcohol","aldehido","cetona","acido carboxilico"]', '["amina","nitrilo"]'),
('quimica', 'bachillerato', '{2}', 'Factores que afectan al equilibrio', '["concentracion","presion","temperatura","catalizador"]', '["masa atomica","numero atomico"]'),
('quimica', 'bachillerato', '{2}', 'Componentes de una pila', '["anodo","catodo","puente salino","electrolito"]', '["catalizador","disolvente"]'),
('quimica', 'bachillerato', '{2}', 'Funciones termodinámicas', '["entalpia","entropia","energia libre de Gibbs","energia interna"]', '["velocidad","aceleracion"]'),
('quimica', 'bachillerato', '{2}', 'Factores cinéticos', '["temperatura","concentracion","superficie de contacto","catalizador"]', '["color","olor"]'),
('quimica', 'bachillerato', '{2}', 'Tipos de isomería', '["cadena","posicion","funcion","geometrica"]', '["isotopo","alotropo"]'),
('quimica', 'bachillerato', '{2}', 'Reacciones orgánicas', '["sustitucion","adicion","eliminacion","condensacion"]', '["difusion","osmosis"]'),
('quimica', 'bachillerato', '{2}', 'Alcanos de cadena corta', '["metano","etano","propano","butano"]', '["eteno","etino"]');


-- ************************************************************
-- 4. PAREJAS_ITEMS
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('matematicas', 'bachillerato', '{1}', 'sen(0°)', '0'),
('matematicas', 'bachillerato', '{1}', 'cos(0°)', '1'),
('matematicas', 'bachillerato', '{1}', 'sen(90°)', '1'),
('matematicas', 'bachillerato', '{1}', 'cos(90°)', '0'),
('matematicas', 'bachillerato', '{1}', 'tan(45°)', '1'),
('matematicas', 'bachillerato', '{1}', 'Derivada de x²', '2x'),
('matematicas', 'bachillerato', '{1}', 'Derivada de sen(x)', 'cos(x)'),
('matematicas', 'bachillerato', '{1}', 'Derivada de eˣ', 'eˣ'),
('matematicas', 'bachillerato', '{1}', 'Derivada de ln(x)', '1/x'),
('matematicas', 'bachillerato', '{1}', 'Derivada de cos(x)', '-sen(x)'),
('matematicas', 'bachillerato', '{1}', 'lím x→0 sen(x)/x', '1'),
('matematicas', 'bachillerato', '{1}', 'Matriz identidad 2×2', 'Diagonal de unos'),
('matematicas', 'bachillerato', '{1}', 'Vector unitario', 'Módulo igual a 1'),
('matematicas', 'bachillerato', '{1}', 'P(A∪B)', 'P(A)+P(B)-P(A∩B)'),
('matematicas', 'bachillerato', '{1}', 'Función par', 'f(-x)=f(x)'),
('matematicas', 'bachillerato', '{1}', 'Función impar', 'f(-x)=-f(x)'),
('matematicas', 'bachillerato', '{1}', 'Asíntota horizontal', 'Límite en el infinito'),
('matematicas', 'bachillerato', '{1}', 'Punto de inflexión', 'f''''(x) cambia de signo'),
('matematicas', 'bachillerato', '{1}', 'Máximo relativo', 'f''(x)=0 y f''''(x)<0'),
('matematicas', 'bachillerato', '{1}', 'π radianes', '180 grados');

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('matematicas', 'bachillerato', '{2}', '∫x dx', 'x²/2 + C'),
('matematicas', 'bachillerato', '{2}', '∫1/x dx', 'ln|x| + C'),
('matematicas', 'bachillerato', '{2}', '∫eˣ dx', 'eˣ + C'),
('matematicas', 'bachillerato', '{2}', '∫cos(x) dx', 'sen(x) + C'),
('matematicas', 'bachillerato', '{2}', '∫sen(x) dx', '-cos(x) + C'),
('matematicas', 'bachillerato', '{2}', 'det(A·B)', 'det(A)·det(B)'),
('matematicas', 'bachillerato', '{2}', 'Rango máximo 3×3', '3'),
('matematicas', 'bachillerato', '{2}', 'Sistema compatible determinado', 'Solución única'),
('matematicas', 'bachillerato', '{2}', 'Sistema incompatible', 'Sin solución'),
('matematicas', 'bachillerato', '{2}', 'Teorema de Bolzano', 'Existencia de raíz'),
('matematicas', 'bachillerato', '{2}', 'Teorema de Rolle', 'f''(c)=0 en (a,b)'),
('matematicas', 'bachillerato', '{2}', 'Distribución N(0,1)', 'Normal estándar'),
('matematicas', 'bachillerato', '{2}', 'Varianza', 'σ²'),
('matematicas', 'bachillerato', '{2}', 'Desviación típica', 'σ'),
('matematicas', 'bachillerato', '{2}', 'Mediana', 'Valor central ordenado'),
('matematicas', 'bachillerato', '{2}', 'Moda', 'Valor más frecuente'),
('matematicas', 'bachillerato', '{2}', 'Covarianza positiva', 'Relación directa'),
('matematicas', 'bachillerato', '{2}', 'Correlación r=1', 'Relación lineal perfecta'),
('matematicas', 'bachillerato', '{2}', 'Intervalo de confianza 95%', 'z=1,96'),
('matematicas', 'bachillerato', '{2}', 'Regla de Barrow', '∫ₐᵇ f(x)dx = F(b)-F(a)');

-- ----- Física y Química 1º Bach -----
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('fisica', 'bachillerato', '{1}', 'F = m·a', 'Segunda ley de Newton'),
('fisica', 'bachillerato', '{1}', 'Ec = ½mv²', 'Energía cinética'),
('fisica', 'bachillerato', '{1}', 'Ep = mgh', 'Energía potencial gravitatoria'),
('fisica', 'bachillerato', '{1}', 'W = F·d·cos(α)', 'Trabajo mecánico'),
('fisica', 'bachillerato', '{1}', 'P = W/t', 'Potencia'),
('fisica', 'bachillerato', '{1}', 'p = m·v', 'Momento lineal'),
('fisica', 'bachillerato', '{1}', 'PV = nRT', 'Ley de los gases ideales'),
('fisica', 'bachillerato', '{1}', 'Número atómico Z', 'Número de protones'),
('fisica', 'bachillerato', '{1}', 'Número másico A', 'Protones + neutrones'),
('fisica', 'bachillerato', '{1}', 'Enlace iónico', 'Metal + no metal'),
('fisica', 'bachillerato', '{1}', 'Enlace covalente', 'No metal + no metal'),
('fisica', 'bachillerato', '{1}', 'Enlace metálico', 'Metal + metal'),
('fisica', 'bachillerato', '{1}', 'Principio de Pauli', 'Máximo 2 electrones por orbital'),
('fisica', 'bachillerato', '{1}', 'Regla de Hund', 'Máxima multiplicidad de spin'),
('fisica', 'bachillerato', '{1}', 'Mol', '6,022 × 10²³ entidades'),
('fisica', 'bachillerato', '{1}', '1 newton', '1 kg·m/s²'),
('fisica', 'bachillerato', '{1}', '1 julio', '1 N·m'),
('fisica', 'bachillerato', '{1}', '1 vatio', '1 J/s'),
('fisica', 'bachillerato', '{1}', 'MRU', 'Velocidad constante'),
('fisica', 'bachillerato', '{1}', 'MRUA', 'Aceleración constante');

-- ----- Física 2º Bach -----
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('fisica', 'bachillerato', '{2}', 'F = G·m₁m₂/r²', 'Gravitación universal'),
('fisica', 'bachillerato', '{2}', 'F = k·q₁q₂/r²', 'Ley de Coulomb'),
('fisica', 'bachillerato', '{2}', 'E = mc²', 'Equivalencia masa-energía'),
('fisica', 'bachillerato', '{2}', 'E = hf', 'Energía del fotón'),
('fisica', 'bachillerato', '{2}', 'λ = h/mv', 'Longitud de onda de De Broglie'),
('fisica', 'bachillerato', '{2}', 'Δx·Δp ≥ ℏ/2', 'Principio de Heisenberg'),
('fisica', 'bachillerato', '{2}', 'Velocidad de la luz', '3 × 10⁸ m/s'),
('fisica', 'bachillerato', '{2}', 'Constante de Planck', '6,626 × 10⁻³⁴ J·s'),
('fisica', 'bachillerato', '{2}', 'Ley de Snell', 'n₁·sen(θ₁) = n₂·sen(θ₂)'),
('fisica', 'bachillerato', '{2}', 'Ley de Faraday', 'fem = -dΦ/dt'),
('fisica', 'bachillerato', '{2}', 'Fuerza de Lorentz', 'F = qv × B'),
('fisica', 'bachillerato', '{2}', 'Campo eléctrico', 'E = F/q'),
('fisica', 'bachillerato', '{2}', 'Potencial gravitatorio', 'V = -GM/r'),
('fisica', 'bachillerato', '{2}', 'Velocidad orbital', 'v = √(GM/r)'),
('fisica', 'bachillerato', '{2}', 'Efecto fotoeléctrico', 'Einstein 1905'),
('fisica', 'bachillerato', '{2}', 'Dilatación temporal', 't'' = t/√(1-v²/c²)'),
('fisica', 'bachillerato', '{2}', 'Periodo de onda', 'T = 1/f'),
('fisica', 'bachillerato', '{2}', 'Velocidad de onda', 'v = λ·f'),
('fisica', 'bachillerato', '{2}', 'Ley de Lenz', 'Corriente inducida se opone al cambio'),
('fisica', 'bachillerato', '{2}', 'Condensador', 'C = Q/V');

-- ----- Química 2º Bach -----
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('quimica', 'bachillerato', '{2}', 'pH = 7', 'Disolución neutra'),
('quimica', 'bachillerato', '{2}', 'pH < 7', 'Disolución ácida'),
('quimica', 'bachillerato', '{2}', 'pH > 7', 'Disolución básica'),
('quimica', 'bachillerato', '{2}', 'Kw = 10⁻¹⁴', 'Producto iónico del agua'),
('quimica', 'bachillerato', '{2}', 'pH + pOH', '14 a 25°C'),
('quimica', 'bachillerato', '{2}', 'ΔG < 0', 'Reacción espontánea'),
('quimica', 'bachillerato', '{2}', 'ΔG > 0', 'Reacción no espontánea'),
('quimica', 'bachillerato', '{2}', 'ΔH < 0', 'Reacción exotérmica'),
('quimica', 'bachillerato', '{2}', 'ΔH > 0', 'Reacción endotérmica'),
('quimica', 'bachillerato', '{2}', 'ΔG = ΔH - TΔS', 'Ecuación de Gibbs'),
('quimica', 'bachillerato', '{2}', 'Ánodo', 'Electrodo de oxidación'),
('quimica', 'bachillerato', '{2}', 'Cátodo', 'Electrodo de reducción'),
('quimica', 'bachillerato', '{2}', '-OH', 'Grupo hidroxilo'),
('quimica', 'bachillerato', '{2}', '-CHO', 'Grupo aldehído'),
('quimica', 'bachillerato', '{2}', '-COOH', 'Grupo carboxilo'),
('quimica', 'bachillerato', '{2}', '-CO-', 'Grupo carbonilo (cetona)'),
('quimica', 'bachillerato', '{2}', '-NH₂', 'Grupo amino'),
('quimica', 'bachillerato', '{2}', 'Ecuación de Nernst', 'E = E° - (RT/nF)·lnQ'),
('quimica', 'bachillerato', '{2}', 'Ka grande', 'Ácido fuerte'),
('quimica', 'bachillerato', '{2}', 'Le Chatelier', 'Desplazamiento del equilibrio');


-- ************************************************************
-- 5. ORDENA_FRASES
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('matematicas', 'bachillerato', '{1}', 'La derivada de una función en un punto representa la pendiente de la recta tangente a la curva en ese punto'),
('matematicas', 'bachillerato', '{1}', 'El límite de una función cuando x tiende a un valor es el número al que se aproximan las imágenes'),
('matematicas', 'bachillerato', '{1}', 'Una función es continua en un punto si el límite existe y coincide con el valor de la función'),
('matematicas', 'bachillerato', '{1}', 'Las matrices se pueden sumar cuando tienen el mismo número de filas y de columnas'),
('matematicas', 'bachillerato', '{1}', 'El producto de matrices no es conmutativo en general pero sí es asociativo y distributivo'),
('matematicas', 'bachillerato', '{1}', 'La probabilidad de un suceso es un número entre cero y uno que mide su verosimilitud'),
('matematicas', 'bachillerato', '{1}', 'El teorema de Bayes permite calcular probabilidades a posteriori conocidas las probabilidades a priori'),
('matematicas', 'bachillerato', '{1}', 'El módulo de un vector se calcula como la raíz cuadrada de la suma de los cuadrados de sus componentes'),
('matematicas', 'bachillerato', '{1}', 'Dos vectores son perpendiculares si y solo si su producto escalar es igual a cero'),
('matematicas', 'bachillerato', '{1}', 'El seno de un ángulo se define como la razón entre el cateto opuesto y la hipotenusa del triángulo'),
('matematicas', 'bachillerato', '{1}', 'La identidad fundamental de la trigonometría establece que el seno al cuadrado más el coseno al cuadrado es uno'),
('matematicas', 'bachillerato', '{1}', 'Una función creciente tiene derivada positiva y una función decreciente tiene derivada negativa en ese intervalo'),
('matematicas', 'bachillerato', '{1}', 'Los puntos de inflexión son aquellos donde la función cambia de concavidad y la segunda derivada se anula'),
('matematicas', 'bachillerato', '{1}', 'La regla de la cadena permite derivar funciones compuestas multiplicando la derivada externa por la interna'),
('matematicas', 'bachillerato', '{1}', 'Las asíntotas son rectas a las que la gráfica de la función se acerca indefinidamente sin llegar a tocarlas');

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('matematicas', 'bachillerato', '{2}', 'La integral definida de una función positiva entre dos valores calcula el área encerrada bajo la curva'),
('matematicas', 'bachillerato', '{2}', 'El teorema fundamental del cálculo establece que la derivación y la integración son operaciones inversas'),
('matematicas', 'bachillerato', '{2}', 'Un sistema de ecuaciones lineales es compatible si tiene al menos una solución que satisface todas las ecuaciones'),
('matematicas', 'bachillerato', '{2}', 'El rango de una matriz es el número de filas linealmente independientes que contiene'),
('matematicas', 'bachillerato', '{2}', 'El teorema de Rouché-Frobenius clasifica los sistemas según los rangos de la matriz de coeficientes y la ampliada'),
('matematicas', 'bachillerato', '{2}', 'La distribución normal es simétrica respecto a la media y tiene forma de campana de Gauss'),
('matematicas', 'bachillerato', '{2}', 'Un intervalo de confianza proporciona un rango de valores que probablemente contiene el parámetro poblacional'),
('matematicas', 'bachillerato', '{2}', 'La recta de regresión minimiza la suma de los cuadrados de las distancias verticales a los puntos'),
('matematicas', 'bachillerato', '{2}', 'El coeficiente de correlación lineal toma valores entre menos uno y uno e indica la fuerza de asociación'),
('matematicas', 'bachillerato', '{2}', 'La distancia entre un punto y un plano se calcula usando la fórmula del valor absoluto del producto escalar'),
('matematicas', 'bachillerato', '{2}', 'Dos rectas en el espacio pueden ser secantes paralelas coincidentes o cruzarse sin cortarse'),
('matematicas', 'bachillerato', '{2}', 'La regla de Cramer resuelve sistemas compatibles determinados usando cocientes de determinantes'),
('matematicas', 'bachillerato', '{2}', 'El método de integración por partes se aplica cuando el integrando es un producto de dos funciones'),
('matematicas', 'bachillerato', '{2}', 'El teorema de Bolzano garantiza la existencia de al menos una raíz en un intervalo donde la función cambia de signo'),
('matematicas', 'bachillerato', '{2}', 'La varianza mide la dispersión de los datos respecto a la media y se calcula como el promedio de las desviaciones al cuadrado');

-- ----- Física y Química 1º Bach -----
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('fisica', 'bachillerato', '{1}', 'La segunda ley de Newton establece que la fuerza neta sobre un cuerpo es igual al producto de su masa por la aceleración'),
('fisica', 'bachillerato', '{1}', 'La energía mecánica total de un sistema aislado se conserva cuando solo actúan fuerzas conservativas'),
('fisica', 'bachillerato', '{1}', 'En un movimiento circular uniforme la velocidad angular permanece constante y existe una aceleración centrípeta'),
('fisica', 'bachillerato', '{1}', 'La ley de los gases ideales relaciona presión volumen temperatura y cantidad de sustancia mediante la ecuación PV igual a nRT'),
('fisica', 'bachillerato', '{1}', 'Los electrones se distribuyen en los orbitales atómicos siguiendo los principios de Aufbau Pauli y la regla de Hund'),
('fisica', 'bachillerato', '{1}', 'El enlace iónico se forma por transferencia de electrones entre un metal y un no metal creando iones de cargas opuestas'),
('fisica', 'bachillerato', '{1}', 'En una reacción química el número total de átomos de cada elemento debe ser igual en reactivos y productos'),
('fisica', 'bachillerato', '{1}', 'El número de Avogadro indica cuántas entidades elementales hay en un mol de cualquier sustancia'),
('fisica', 'bachillerato', '{1}', 'La velocidad de un proyectil lanzado horizontalmente tiene una componente horizontal constante y una vertical acelerada'),
('fisica', 'bachillerato', '{1}', 'El trabajo realizado por una fuerza constante es el producto de la fuerza por el desplazamiento por el coseno del ángulo'),
('fisica', 'bachillerato', '{1}', 'La tabla periódica organiza los elementos por número atómico creciente en filas llamadas periodos y columnas llamadas grupos'),
('fisica', 'bachillerato', '{1}', 'Las fuerzas intermoleculares son interacciones débiles entre moléculas que determinan las propiedades físicas de las sustancias'),
('fisica', 'bachillerato', '{1}', 'El rendimiento de una reacción es el cociente entre la cantidad de producto obtenida y la cantidad teórica esperada'),
('fisica', 'bachillerato', '{1}', 'Un enlace covalente se forma cuando dos átomos no metálicos comparten uno o más pares de electrones'),
('fisica', 'bachillerato', '{1}', 'La electronegatividad es la tendencia de un átomo a atraer hacia sí los electrones de un enlace covalente');

-- ----- Física 2º Bach -----
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('fisica', 'bachillerato', '{2}', 'El campo gravitatorio es la región del espacio donde una masa experimenta una fuerza de atracción gravitatoria'),
('fisica', 'bachillerato', '{2}', 'La ley de Coulomb establece que la fuerza entre dos cargas es proporcional al producto de las cargas e inversamente proporcional al cuadrado de la distancia'),
('fisica', 'bachillerato', '{2}', 'El efecto fotoeléctrico demuestra que la luz se comporta como partículas llamadas fotones con energía proporcional a la frecuencia'),
('fisica', 'bachillerato', '{2}', 'Las ecuaciones de Maxwell unifican los fenómenos eléctricos y magnéticos en una teoría electromagnética completa'),
('fisica', 'bachillerato', '{2}', 'La dualidad onda-partícula establece que toda partícula material tiene asociada una longitud de onda según De Broglie'),
('fisica', 'bachillerato', '{2}', 'El principio de incertidumbre de Heisenberg impide conocer simultáneamente la posición y el momento de una partícula con precisión absoluta'),
('fisica', 'bachillerato', '{2}', 'La velocidad orbital de un satélite depende de la masa del cuerpo central y del radio de la órbita'),
('fisica', 'bachillerato', '{2}', 'La ley de Faraday establece que la fuerza electromotriz inducida es igual a la variación del flujo magnético por unidad de tiempo'),
('fisica', 'bachillerato', '{2}', 'Las ondas electromagnéticas se propagan en el vacío a la velocidad de la luz y no necesitan medio material'),
('fisica', 'bachillerato', '{2}', 'La energía total de un sistema es la suma de su energía en reposo más su energía cinética relativista'),
('fisica', 'bachillerato', '{2}', 'La interferencia constructiva ocurre cuando dos ondas se encuentran en fase y la destructiva cuando están en contrafase'),
('fisica', 'bachillerato', '{2}', 'Un condensador almacena energía en forma de campo eléctrico entre dos placas conductoras separadas por un dieléctrico'),
('fisica', 'bachillerato', '{2}', 'La ley de Snell relaciona los ángulos de incidencia y refracción con los índices de refracción de los medios'),
('fisica', 'bachillerato', '{2}', 'En la teoría de la relatividad especial la masa de un cuerpo aumenta con la velocidad según el factor de Lorentz'),
('fisica', 'bachillerato', '{2}', 'La fisión nuclear consiste en la ruptura de un núcleo pesado en dos más ligeros liberando una gran cantidad de energía');

-- ----- Química 2º Bach -----
INSERT INTO ordena_frases (subject_id, level, grades, sentence) VALUES
('quimica', 'bachillerato', '{2}', 'El principio de Le Chatelier predice que un sistema en equilibrio se desplaza para contrarrestar una perturbación externa'),
('quimica', 'bachillerato', '{2}', 'La constante de equilibrio relaciona las concentraciones de productos y reactivos elevadas a sus coeficientes estequiométricos'),
('quimica', 'bachillerato', '{2}', 'Un ácido fuerte se disocia completamente en agua mientras que un ácido débil solo se disocia parcialmente'),
('quimica', 'bachillerato', '{2}', 'La hidrólisis de una sal produce una disolución ácida básica o neutra según la naturaleza del ácido y la base que la forman'),
('quimica', 'bachillerato', '{2}', 'En una reacción redox el oxidante gana electrones y se reduce mientras que el reductor pierde electrones y se oxida'),
('quimica', 'bachillerato', '{2}', 'La ecuación de Nernst permite calcular el potencial de una pila en condiciones diferentes a las estándar'),
('quimica', 'bachillerato', '{2}', 'Los compuestos orgánicos se clasifican según sus grupos funcionales que determinan sus propiedades químicas características'),
('quimica', 'bachillerato', '{2}', 'La entalpía de reacción es la cantidad de calor intercambiado con el entorno a presión constante'),
('quimica', 'bachillerato', '{2}', 'La entropía es una medida del desorden de un sistema y tiende a aumentar en los procesos espontáneos'),
('quimica', 'bachillerato', '{2}', 'Un catalizador aumenta la velocidad de reacción porque disminuye la energía de activación sin consumirse en el proceso'),
('quimica', 'bachillerato', '{2}', 'La ley de Hess establece que la variación de entalpía de una reacción es independiente del camino seguido'),
('quimica', 'bachillerato', '{2}', 'Las disoluciones reguladoras o tampón resisten cambios de pH al añadir pequeñas cantidades de ácido o base'),
('quimica', 'bachillerato', '{2}', 'La velocidad de una reacción química aumenta con la temperatura porque se incrementa la energía cinética de las moléculas'),
('quimica', 'bachillerato', '{2}', 'En la electrólisis se fuerza una reacción redox no espontánea aplicando una corriente eléctrica externa'),
('quimica', 'bachillerato', '{2}', 'Los ésteres se forman por reacción de condensación entre un ácido carboxílico y un alcohol eliminando una molécula de agua');


-- ************************************************************
-- 6. ORDENA_HISTORIAS
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('matematicas', 'bachillerato', '{1}', '["Dada la función f(x) = x³ - 3x, primero calculamos su dominio que es todo R.","A continuación hallamos la derivada: f''(x) = 3x² - 3.","Igualamos la derivada a cero para encontrar los puntos críticos: x = -1 y x = 1.","Estudiamos el signo de la derivada para determinar los intervalos de crecimiento y decrecimiento.","Concluimos que f tiene un máximo relativo en x = -1 y un mínimo relativo en x = 1."]'),
('matematicas', 'bachillerato', '{1}', '["Para calcular el límite de una función racional cuando x tiende a infinito, primero identificamos los grados del numerador y denominador.","Si ambos tienen el mismo grado, el límite es el cociente de los coeficientes principales.","Si el grado del numerador es mayor, el límite es infinito.","Si el grado del denominador es mayor, el límite es cero.","Aplicamos esta regla para clasificar las asíntotas horizontales de la función."]'),
('matematicas', 'bachillerato', '{1}', '["Queremos multiplicar las matrices A (2×3) y B (3×2).","Verificamos que el número de columnas de A coincide con el número de filas de B.","El resultado será una matriz C de dimensión 2×2.","Cada elemento c_ij se calcula como la suma de los productos de la fila i de A por la columna j de B.","Realizamos los cálculos y obtenemos la matriz producto final."]'),
('matematicas', 'bachillerato', '{1}', '["Definimos el espacio muestral como el conjunto de todos los resultados posibles del experimento.","Identificamos los sucesos elementales que componen el suceso favorable.","Aplicamos la regla de Laplace dividiendo casos favorables entre casos posibles.","Si los sucesos no son equiprobables, usamos la definición axiomática de probabilidad.","Finalmente comprobamos que la probabilidad obtenida está entre 0 y 1."]'),
('matematicas', 'bachillerato', '{1}', '["Para resolver un triángulo conocidos dos lados y el ángulo comprendido, aplicamos el teorema del coseno.","Calculamos el tercer lado usando c² = a² + b² - 2ab·cos(C).","A continuación usamos el teorema del seno para hallar uno de los ángulos restantes.","El tercer ángulo se obtiene sabiendo que la suma de los tres ángulos es 180 grados.","Verificamos los resultados comprobando que se cumplen las relaciones trigonométricas."]');

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('matematicas', 'bachillerato', '{2}', '["Dado el sistema de tres ecuaciones con tres incógnitas, formamos la matriz de coeficientes A y la ampliada A*.","Calculamos el determinante de A para comprobar si el sistema es compatible determinado.","Si det(A) ≠ 0, aplicamos la regla de Cramer para hallar cada incógnita.","Cada incógnita se obtiene como el cociente del determinante de la matriz modificada entre det(A).","Sustituimos los valores obtenidos en las ecuaciones originales para verificar la solución."]'),
('matematicas', 'bachillerato', '{2}', '["Para calcular el área entre dos curvas, primero hallamos sus puntos de intersección.","Determinamos cuál función es mayor en el intervalo de integración.","Planteamos la integral definida de la diferencia de ambas funciones.","Aplicamos el teorema fundamental del cálculo usando la regla de Barrow.","El resultado absoluto de la integral nos da el área encerrada entre las dos curvas."]'),
('matematicas', 'bachillerato', '{2}', '["Tomamos una muestra aleatoria de tamaño n de la población.","Calculamos la media muestral y la desviación típica de la muestra.","Elegimos el nivel de confianza deseado y buscamos el valor z correspondiente.","Construimos el intervalo de confianza sumando y restando el error a la media muestral.","Interpretamos que el parámetro poblacional se encuentra en ese intervalo con la probabilidad indicada."]'),
('matematicas', 'bachillerato', '{2}', '["Queremos hallar la distancia entre dos rectas que se cruzan en el espacio tridimensional.","Tomamos un punto de cada recta y formamos el vector que los une.","Calculamos el producto vectorial de los vectores directores de ambas rectas.","Proyectamos el vector de unión sobre el producto vectorial obtenido.","La distancia es el valor absoluto de esa proyección dividido entre el módulo del producto vectorial."]'),
('matematicas', 'bachillerato', '{2}', '["Para integrar por partes elegimos u y dv del integrando según la regla LIATE.","Calculamos du derivando u y v integrando dv.","Aplicamos la fórmula: integral de u·dv = u·v menos integral de v·du.","Si la nueva integral sigue siendo compleja, repetimos el proceso.","Finalmente añadimos la constante de integración al resultado."]');

-- ----- Física y Química 1º Bach -----
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('fisica', 'bachillerato', '{1}', '["Un cuerpo se lanza verticalmente hacia arriba con una velocidad inicial de 20 m/s.","Durante la subida, la gravedad decelera el cuerpo a razón de 9,8 m/s².","El cuerpo alcanza la altura máxima cuando su velocidad se anula.","A partir de ese instante comienza a caer con aceleración constante igual a g.","El tiempo total de vuelo es el doble del tiempo de subida por simetría del movimiento."]'),
('fisica', 'bachillerato', '{1}', '["Para ajustar una ecuación química, primero escribimos los reactivos y productos sin ajustar.","Contamos el número de átomos de cada elemento en ambos lados de la ecuación.","Colocamos coeficientes estequiométricos para igualar los átomos de cada elemento.","Empezamos ajustando los elementos que aparecen en menos compuestos.","Verificamos que el número total de átomos de cada elemento coincide en reactivos y productos."]'),
('fisica', 'bachillerato', '{1}', '["La configuración electrónica del sodio es 1s² 2s² 2p⁶ 3s¹.","Al tener un solo electrón en la capa de valencia, tiende a perderlo fácilmente.","Al perder ese electrón, forma el catión Na⁺ con configuración de gas noble.","Este catión puede unirse al anión Cl⁻ mediante enlace iónico.","Se forma así el cloruro de sodio, una sal con estructura cristalina."]'),
('fisica', 'bachillerato', '{1}', '["Un bloque de 5 kg se desliza por una superficie con fricción bajo la acción de una fuerza de 30 N.","Dibujamos el diagrama de cuerpo libre identificando todas las fuerzas: peso, normal, fricción y fuerza aplicada.","Descomponemos las fuerzas en componentes horizontal y vertical.","Aplicamos la segunda ley de Newton en cada dirección para obtener las ecuaciones.","Resolvemos las ecuaciones y obtenemos la aceleración del bloque."]'),
('fisica', 'bachillerato', '{1}', '["Para determinar el reactivo limitante, calculamos los moles de cada reactivo a partir de sus masas.","Dividimos los moles de cada reactivo entre su coeficiente estequiométrico.","El reactivo con menor cociente es el reactivo limitante de la reacción.","Calculamos los moles de producto usando la estequiometría del reactivo limitante.","Convertimos los moles de producto a gramos usando su masa molar."]');

-- ----- Física 2º Bach -----
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('fisica', 'bachillerato', '{2}', '["Un satélite orbita la Tierra a una altitud h sobre la superficie terrestre.","La fuerza gravitatoria proporciona la fuerza centrípeta necesaria para el movimiento circular.","Igualamos GMm/r² = mv²/r, donde r = R_T + h.","Despejamos la velocidad orbital: v = √(GM/r).","Calculamos el periodo orbital usando T = 2πr/v."]'),
('fisica', 'bachillerato', '{2}', '["La luz incide sobre una superficie metálica con una frecuencia superior a la frecuencia umbral.","Cada fotón transfiere toda su energía hf a un electrón del metal.","El electrón necesita una energía mínima (función de trabajo) para escapar del metal.","La energía cinética del electrón emitido es Ec = hf - función de trabajo.","Si la frecuencia de la luz es menor que la umbral, no se emiten electrones independientemente de la intensidad."]'),
('fisica', 'bachillerato', '{2}', '["Un imán se mueve hacia una espira conductora cerrada.","El flujo magnético a través de la espira varía con el tiempo.","Según la ley de Faraday, se induce una fuerza electromotriz proporcional a la variación del flujo.","Por la ley de Lenz, la corriente inducida crea un campo que se opone a la variación del flujo.","Si el imán se aleja, el sentido de la corriente inducida se invierte."]'),
('fisica', 'bachillerato', '{2}', '["Una onda sonora se propaga por el aire y llega a una rendija cuya anchura es comparable a su longitud de onda.","Al pasar por la rendija, la onda se difracta y se expande en todas las direcciones.","Si hay dos rendijas, las ondas difractadas interfieren entre sí.","En los puntos donde las ondas llegan en fase se produce interferencia constructiva.","En los puntos donde llegan en contrafase se produce interferencia destructiva, observándose un patrón de máximos y mínimos."]'),
('fisica', 'bachillerato', '{2}', '["Un electrón se acelera a velocidades próximas a la de la luz en un acelerador de partículas.","Según la relatividad especial, su masa relativista aumenta con el factor de Lorentz.","La energía necesaria para seguir acelerándolo crece enormemente.","El electrón nunca puede alcanzar la velocidad de la luz porque su masa tendería a infinito.","La energía total del electrón es la suma de su energía en reposo mc² y su energía cinética relativista."]');

-- ----- Química 2º Bach -----
INSERT INTO ordena_historias (subject_id, level, grades, sentences) VALUES
('quimica', 'bachillerato', '{2}', '["Se mezclan disoluciones de ácido clorhídrico y acetato de sodio en un vaso.","El ácido clorhídrico, al ser fuerte, se disocia completamente liberando iones H⁺.","Los iones H⁺ reaccionan con los iones acetato para formar ácido acético, que es débil.","El equilibrio se desplaza consumiendo los iones H⁺ añadidos.","La disolución resultante contiene ácido acético e iones sodio y cloruro."]'),
('quimica', 'bachillerato', '{2}', '["Para valorar un ácido con una base, preparamos la bureta con la disolución de base de concentración conocida.","Colocamos un volumen exacto de la disolución ácida en un erlenmeyer con indicador.","Añadimos la base gota a gota desde la bureta mientras agitamos.","En el punto de equivalencia, los moles de ácido igualan los moles de base y el indicador cambia de color.","Anotamos el volumen de base gastado y calculamos la concentración del ácido."]'),
('quimica', 'bachillerato', '{2}', '["Se construye una pila galvánica con un electrodo de cinc y otro de cobre en sus disoluciones respectivas.","El cinc, con menor potencial de reducción, se oxida en el ánodo perdiendo electrones.","Los electrones fluyen por el circuito externo del ánodo al cátodo generando corriente.","En el cátodo, los iones Cu²⁺ se reducen ganando electrones y depositándose como cobre metálico.","El puente salino cierra el circuito interno manteniendo la neutralidad eléctrica de las disoluciones."]'),
('quimica', 'bachillerato', '{2}', '["Un recipiente cerrado contiene N₂O₄ en equilibrio con NO₂ según N₂O₄ ⇌ 2NO₂.","Se aumenta la temperatura del sistema manteniendo el volumen constante.","Como la reacción directa es endotérmica, el equilibrio se desplaza hacia la formación de NO₂.","La concentración de NO₂ aumenta y la de N₂O₄ disminuye hasta alcanzar un nuevo equilibrio.","El valor de la constante de equilibrio Kc aumenta con la temperatura para esta reacción."]'),
('quimica', 'bachillerato', '{2}', '["Se quiere sintetizar un éster a partir de ácido acético y etanol.","Se mezclan ambos reactivos en presencia de un catalizador ácido como el ácido sulfúrico.","Se produce una reacción de esterificación eliminando una molécula de agua.","El producto obtenido es acetato de etilo, un éster con olor afrutado.","Para desplazar el equilibrio hacia el producto se puede eliminar el agua o añadir exceso de reactivo."]');


-- ************************************************************
-- 7. DETECTIVE_SENTENCES
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('matematicas', 'bachillerato', '{1}', 'La derivada de una constante es siempre igual a uno.'),
('matematicas', 'bachillerato', '{1}', 'El coseno de noventa grados vale exactamente uno.'),
('matematicas', 'bachillerato', '{1}', 'Una función puede tener varias asíntotas horizontales pero solo una vertical.'),
('matematicas', 'bachillerato', '{1}', 'El producto de matrices es siempre conmutativo si ambas son cuadradas.'),
('matematicas', 'bachillerato', '{1}', 'La probabilidad de un suceso seguro es igual a cero.'),
('matematicas', 'bachillerato', '{1}', 'Dos vectores paralelos tienen producto escalar igual a cero.'),
('matematicas', 'bachillerato', '{1}', 'La derivada del seno de x es menos coseno de x.'),
('matematicas', 'bachillerato', '{1}', 'El límite de sen(x)/x cuando x tiende a cero es igual a cero.'),
('matematicas', 'bachillerato', '{1}', 'Una función continua en un punto siempre es derivable en ese punto.'),
('matematicas', 'bachillerato', '{1}', 'La tangente de un ángulo se define como coseno dividido entre seno.'),
('matematicas', 'bachillerato', '{1}', 'Si la segunda derivada es positiva en un punto crítico, la función tiene un máximo relativo.'),
('matematicas', 'bachillerato', '{1}', 'El determinante de la matriz identidad es siempre igual a cero.');

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('matematicas', 'bachillerato', '{2}', 'La integral de 1/x es igual a ln(x²) más una constante.'),
('matematicas', 'bachillerato', '{2}', 'Un sistema con determinante cero siempre es incompatible.'),
('matematicas', 'bachillerato', '{2}', 'La distribución normal estándar tiene media uno y desviación típica cero.'),
('matematicas', 'bachillerato', '{2}', 'El rango de una matriz siempre coincide con su número de columnas.'),
('matematicas', 'bachillerato', '{2}', 'Dos rectas en el espacio que no se cortan son siempre paralelas.'),
('matematicas', 'bachillerato', '{2}', 'El coeficiente de correlación lineal puede tomar valores mayores que uno.'),
('matematicas', 'bachillerato', '{2}', 'La varianza de una distribución puede ser un número negativo.'),
('matematicas', 'bachillerato', '{2}', 'La regla de Cramer es aplicable a cualquier sistema de ecuaciones lineales.'),
('matematicas', 'bachillerato', '{2}', 'La integral definida de una función siempre da un resultado positivo.'),
('matematicas', 'bachillerato', '{2}', 'El teorema de Bolzano garantiza que una función continua tiene exactamente una raíz.'),
('matematicas', 'bachillerato', '{2}', 'La mediana y la media de una distribución normal son siempre diferentes.'),
('matematicas', 'bachillerato', '{2}', 'Al aumentar el tamaño de la muestra, el intervalo de confianza se hace más amplio.');

-- ----- Física y Química 1º Bach -----
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('fisica', 'bachillerato', '{1}', 'Un cuerpo en caída libre experimenta una aceleración que aumenta con el tiempo.'),
('fisica', 'bachillerato', '{1}', 'La masa y el peso de un objeto son exactamente la misma magnitud física.'),
('fisica', 'bachillerato', '{1}', 'En un movimiento rectilíneo uniforme la aceleración es constante y distinta de cero.'),
('fisica', 'bachillerato', '{1}', 'La tercera ley de Newton establece que acción y reacción actúan sobre el mismo cuerpo.'),
('fisica', 'bachillerato', '{1}', 'La energía cinética de un cuerpo puede tener valores negativos.'),
('fisica', 'bachillerato', '{1}', 'Los protones se encuentran en los orbitales que rodean el núcleo atómico.'),
('fisica', 'bachillerato', '{1}', 'El enlace iónico se forma entre dos átomos no metálicos que comparten electrones.'),
('fisica', 'bachillerato', '{1}', 'El número atómico de un elemento indica el número total de neutrones en su núcleo.'),
('fisica', 'bachillerato', '{1}', 'La ley de Boyle establece que presión y volumen son directamente proporcionales a temperatura constante.'),
('fisica', 'bachillerato', '{1}', 'Los gases nobles tienen ocho electrones en su capa de valencia, incluido el helio.'),
('fisica', 'bachillerato', '{1}', 'En una reacción exotérmica los productos tienen más energía que los reactivos.'),
('fisica', 'bachillerato', '{1}', 'Un mol de cualquier gas ideal ocupa 22,4 litros a cualquier temperatura y presión.');

-- ----- Física 2º Bach -----
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('fisica', 'bachillerato', '{2}', 'La fuerza gravitatoria entre dos masas es directamente proporcional al cuadrado de la distancia.'),
('fisica', 'bachillerato', '{2}', 'Un fotón tiene masa en reposo igual a la masa del electrón.'),
('fisica', 'bachillerato', '{2}', 'El campo eléctrico dentro de un conductor en equilibrio electrostático es máximo.'),
('fisica', 'bachillerato', '{2}', 'Las ondas electromagnéticas necesitan un medio material para propagarse.'),
('fisica', 'bachillerato', '{2}', 'La velocidad de la luz en el vacío varía según la frecuencia de la onda.'),
('fisica', 'bachillerato', '{2}', 'En el efecto fotoeléctrico, aumentar la intensidad de la luz aumenta la energía de cada electrón emitido.'),
('fisica', 'bachillerato', '{2}', 'El potencial gravitatorio en la superficie terrestre es positivo.'),
('fisica', 'bachillerato', '{2}', 'La fuerza de Lorentz sobre una carga en reposo dentro de un campo magnético es máxima.'),
('fisica', 'bachillerato', '{2}', 'Según la relatividad especial, un objeto con masa puede alcanzar la velocidad de la luz con suficiente energía.'),
('fisica', 'bachillerato', '{2}', 'La ley de Lenz establece que la corriente inducida refuerza la variación del flujo magnético que la origina.'),
('fisica', 'bachillerato', '{2}', 'La difracción solo se produce con ondas de luz visible, no con sonido.'),
('fisica', 'bachillerato', '{2}', 'La energía de un fotón es inversamente proporcional a su frecuencia.');

-- ----- Química 2º Bach -----
INSERT INTO detective_sentences (subject_id, level, grades, sentence) VALUES
('quimica', 'bachillerato', '{2}', 'Un catalizador modifica la constante de equilibrio de una reacción al disminuir la energía de activación.'),
('quimica', 'bachillerato', '{2}', 'El pH de una disolución de ácido fuerte concentrado puede ser un número negativo, lo cual es imposible.'),
('quimica', 'bachillerato', '{2}', 'Al aumentar la temperatura, todas las reacciones de equilibrio se desplazan hacia los productos.'),
('quimica', 'bachillerato', '{2}', 'La entropía del universo puede disminuir en un proceso espontáneo.'),
('quimica', 'bachillerato', '{2}', 'En una pila galvánica, la oxidación se produce en el cátodo.'),
('quimica', 'bachillerato', '{2}', 'La suma de pH y pOH siempre vale 14 independientemente de la temperatura.'),
('quimica', 'bachillerato', '{2}', 'Un alcano con cuatro carbonos solo puede tener estructura lineal sin isómeros posibles.'),
('quimica', 'bachillerato', '{2}', 'La ley de Hess establece que la variación de entalpía depende del camino seguido por la reacción.'),
('quimica', 'bachillerato', '{2}', 'En la electrólisis la reacción que ocurre es espontánea y genera corriente eléctrica.'),
('quimica', 'bachillerato', '{2}', 'Todos los alcoholes son solubles en agua independientemente de la longitud de su cadena carbonada.'),
('quimica', 'bachillerato', '{2}', 'La velocidad de una reacción siempre se duplica exactamente al aumentar la temperatura en diez grados.'),
('quimica', 'bachillerato', '{2}', 'La hidrólisis de una sal formada por ácido fuerte y base fuerte da una disolución ácida.');


-- ************************************************************
-- 8. COMPRENSION_TEXTS
-- ************************************************************

-- ----- Matemáticas I (1º Bach) -----
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('matematicas', 'bachillerato', '{1}', 'El concepto de derivada',
'La derivada de una función en un punto es uno de los conceptos fundamentales del cálculo diferencial. Geométricamente, representa la pendiente de la recta tangente a la curva en ese punto, lo que nos da información sobre cómo cambia la función localmente. Si la derivada es positiva, la función crece; si es negativa, decrece; y si es cero, puede haber un extremo relativo. El proceso de hallar la derivada se llama diferenciación y se basa en el concepto de límite: calculamos el cociente incremental entre la variación de la función y la variación de la variable, y tomamos el límite cuando esta última tiende a cero. Las reglas de derivación, como la regla del producto, del cociente y de la cadena, simplifican enormemente el cálculo. Las aplicaciones de la derivada incluyen la optimización de funciones, el estudio de la monotonía, la concavidad, la determinación de extremos relativos y absolutos, y el cálculo de rectas tangentes. En física, la derivada de la posición respecto al tiempo es la velocidad, y la derivada de la velocidad es la aceleración.',
'[{"pregunta":"¿Qué representa geométricamente la derivada en un punto?","opciones":["El área bajo la curva","La pendiente de la recta tangente","La distancia al origen","El valor máximo de la función"],"correcta":1},{"pregunta":"¿Qué indica una derivada positiva en un intervalo?","opciones":["La función es constante","La función tiene un mínimo","La función es creciente","La función es cóncava"],"correcta":2},{"pregunta":"¿En qué concepto se basa el cálculo de la derivada?","opciones":["La integral","El determinante","El límite","La probabilidad"],"correcta":2},{"pregunta":"¿Qué regla se utiliza para derivar funciones compuestas?","opciones":["Regla del producto","Regla del cociente","Regla de Cramer","Regla de la cadena"],"correcta":3}]'),

('matematicas', 'bachillerato', '{1}', 'Vectores en el plano y el espacio',
'Los vectores son magnitudes que poseen módulo, dirección y sentido, a diferencia de los escalares que solo tienen magnitud. En el plano se representan mediante pares ordenados y en el espacio mediante ternas. Las operaciones fundamentales con vectores incluyen la suma, la resta, el producto por un escalar, el producto escalar y el producto vectorial. El producto escalar de dos vectores da como resultado un número real y se calcula como la suma de los productos de sus componentes. Es especialmente útil para determinar la ortogonalidad: dos vectores son perpendiculares si y solo si su producto escalar es cero. El producto vectorial, definido solo en tres dimensiones, da como resultado otro vector perpendicular a ambos. Los vectores tienen aplicaciones enormes en física para representar fuerzas, velocidades y aceleraciones. En geometría analítica, los vectores directores y normales permiten definir rectas y planos en el espacio. La combinación lineal de vectores y los conceptos de dependencia e independencia lineal son fundamentales en el álgebra lineal moderna.',
'[{"pregunta":"¿Qué diferencia a un vector de un escalar?","opciones":["El vector solo tiene magnitud","El escalar tiene dirección","El vector tiene módulo, dirección y sentido","El escalar tiene sentido"],"correcta":2},{"pregunta":"¿Qué resultado da el producto escalar de dos vectores perpendiculares?","opciones":["Uno","Infinito","Cero","Menos uno"],"correcta":2},{"pregunta":"¿En cuántas dimensiones está definido el producto vectorial?","opciones":["En dos","En tres","En cualquiera","Solo en una"],"correcta":1},{"pregunta":"¿Qué permite definir un vector director en geometría?","opciones":["Un área","Una recta o plano","Un ángulo","Una matriz"],"correcta":1}]'),

('matematicas', 'bachillerato', '{1}', 'Introducción a la probabilidad',
'La probabilidad es la rama de las matemáticas que estudia los fenómenos aleatorios, aquellos cuyo resultado no puede predecirse con certeza. El espacio muestral es el conjunto de todos los resultados posibles de un experimento aleatorio, y un suceso es cualquier subconjunto del espacio muestral. La regla de Laplace establece que, si todos los resultados son equiprobables, la probabilidad de un suceso es el cociente entre el número de casos favorables y el número de casos posibles. Para sucesos no equiprobables se utilizan definiciones axiomáticas y frecuentistas. Las propiedades fundamentales incluyen que la probabilidad siempre está entre cero y uno, la probabilidad del suceso seguro es uno, y la probabilidad de la unión de sucesos mutuamente excluyentes es la suma de sus probabilidades. La probabilidad condicionada mide la probabilidad de un suceso dado que otro ha ocurrido, y el teorema de Bayes permite invertir esta relación. Estos conceptos son esenciales en estadística, inteligencia artificial, ciencias actuariales y toma de decisiones bajo incertidumbre.',
'[{"pregunta":"¿Qué es el espacio muestral?","opciones":["El suceso más probable","El conjunto de todos los resultados posibles","La probabilidad máxima","Un subconjunto de resultados"],"correcta":1},{"pregunta":"¿Cuándo se aplica la regla de Laplace?","opciones":["Siempre que hay probabilidad","Cuando los resultados son equiprobables","Cuando hay dos sucesos","Cuando la probabilidad es cero"],"correcta":1},{"pregunta":"¿Cuál es el rango de valores de la probabilidad?","opciones":["De -1 a 1","De 0 a 100","De 0 a 1","De 0 a infinito"],"correcta":2},{"pregunta":"¿Qué permite calcular el teorema de Bayes?","opciones":["La media de los datos","Invertir la probabilidad condicionada","El área bajo una curva","La varianza de una muestra"],"correcta":1}]');

-- ----- Matemáticas II (2º Bach) -----
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('matematicas', 'bachillerato', '{2}', 'La integral definida y sus aplicaciones',
'La integral definida es una de las herramientas más potentes del cálculo y permite resolver problemas de cálculo de áreas, volúmenes, longitudes de curvas y muchas otras magnitudes. Se define como el límite de las sumas de Riemann cuando el número de subdivisiones tiende a infinito. El teorema fundamental del cálculo, demostrado por Newton y Leibniz de forma independiente, establece la conexión profunda entre derivación e integración: si F es una primitiva de f, entonces la integral definida de f entre a y b es F(b) menos F(a), conocida como regla de Barrow. Los métodos de integración incluyen la sustitución o cambio de variable, la integración por partes y la descomposición en fracciones parciales para funciones racionales. Las integrales impropias extienden el concepto a intervalos infinitos o funciones con discontinuidades. En física, la integral permite calcular el trabajo realizado por una fuerza variable, la posición a partir de la velocidad, y muchas otras magnitudes. En estadística, la integral de la función de densidad de probabilidad entre dos valores da la probabilidad de que la variable aleatoria caiga en ese intervalo.',
'[{"pregunta":"¿Cómo se define formalmente la integral definida?","opciones":["Como la derivada de una función","Como el límite de las sumas de Riemann","Como el producto de funciones","Como la raíz de una ecuación"],"correcta":1},{"pregunta":"¿Qué establece la regla de Barrow?","opciones":["Que toda función tiene derivada","Que la integral de f entre a y b es F(b)-F(a)","Que las sumas son conmutativas","Que toda integral es positiva"],"correcta":1},{"pregunta":"¿Qué tipo de integral se usa para intervalos infinitos?","opciones":["Integral múltiple","Integral parcial","Integral impropia","Integral por partes"],"correcta":2},{"pregunta":"¿Qué se obtiene al integrar una función de densidad de probabilidad?","opciones":["La media","La varianza","La probabilidad","La moda"],"correcta":2}]'),

('matematicas', 'bachillerato', '{2}', 'Sistemas de ecuaciones y álgebra lineal',
'Los sistemas de ecuaciones lineales constituyen uno de los pilares del álgebra lineal y tienen aplicaciones en ingeniería, economía, informática y ciencias naturales. Un sistema se puede representar matricialmente como AX = B, donde A es la matriz de coeficientes, X el vector de incógnitas y B el vector de términos independientes. La clasificación de un sistema depende de los rangos de las matrices A y ampliada: según el teorema de Rouché-Frobenius, el sistema es compatible si ambos rangos coinciden, y determinado si además ese rango iguala al número de incógnitas. El método de Gauss transforma el sistema en uno escalonado equivalente mediante operaciones elementales por filas. La regla de Cramer proporciona una fórmula cerrada para sistemas compatibles determinados usando cocientes de determinantes. Los determinantes tienen propiedades útiles como la multilinealidad y la antisimetría, y se anulan cuando una fila es combinación lineal de las demás. El concepto de rango está íntimamente ligado a la independencia lineal de vectores y a la dimensión del espacio generado por las filas o columnas de la matriz.',
'[{"pregunta":"¿Qué teorema clasifica los sistemas según los rangos de las matrices?","opciones":["Teorema de Bolzano","Teorema de Rouché-Frobenius","Teorema de Rolle","Teorema de Bayes"],"correcta":1},{"pregunta":"¿Cuándo un sistema es compatible determinado?","opciones":["Cuando no tiene solución","Cuando tiene infinitas soluciones","Cuando el rango de A iguala al rango de la ampliada y al número de incógnitas","Cuando el determinante es cero"],"correcta":2},{"pregunta":"¿Qué método transforma un sistema en uno escalonado?","opciones":["Método de Cramer","Método de Gauss","Método de Barrow","Método de Laplace"],"correcta":1},{"pregunta":"¿Cuándo se anula el determinante de una matriz?","opciones":["Cuando es la identidad","Cuando tiene una fila de ceros o filas dependientes","Cuando es simétrica","Cuando es cuadrada"],"correcta":1}]'),

('matematicas', 'bachillerato', '{2}', 'Inferencia estadística',
'La inferencia estadística permite obtener conclusiones sobre una población a partir del estudio de una muestra representativa. Los dos grandes procedimientos son la estimación y el contraste de hipótesis. En la estimación puntual se utiliza un estadístico muestral como estimador del parámetro poblacional; por ejemplo, la media muestral estima la media poblacional. Sin embargo, un solo valor no refleja la incertidumbre asociada, por lo que se construyen intervalos de confianza que proporcionan un rango de valores plausibles para el parámetro. El nivel de confianza, habitualmente del 95%, indica la probabilidad de que el intervalo contenga el verdadero parámetro si repitiéramos el muestreo muchas veces. El margen de error depende del tamaño muestral, la variabilidad y el nivel de confianza elegido: a mayor tamaño de muestra, menor margen de error. El contraste de hipótesis es un procedimiento para decidir si los datos muestrales apoyan una hipótesis sobre el parámetro poblacional. Se formula una hipótesis nula y una alternativa, se calcula un estadístico de contraste y se compara con un valor crítico para aceptar o rechazar la hipótesis nula.',
'[{"pregunta":"¿Qué permite hacer la inferencia estadística?","opciones":["Calcular derivadas","Obtener conclusiones sobre una población a partir de una muestra","Resolver sistemas de ecuaciones","Integrar funciones"],"correcta":1},{"pregunta":"¿Qué proporciona un intervalo de confianza del 95%?","opciones":["Certeza absoluta sobre el parámetro","Un rango con 95% de probabilidad de contener el parámetro","Que la media es 95","Que el error es 5%"],"correcta":1},{"pregunta":"¿Qué ocurre al aumentar el tamaño de la muestra?","opciones":["Aumenta el margen de error","Disminuye el margen de error","El nivel de confianza baja","La media no cambia"],"correcta":1},{"pregunta":"¿Qué se formula en un contraste de hipótesis?","opciones":["Una integral","Una hipótesis nula y una alternativa","Un intervalo de confianza","Un diagrama de dispersión"],"correcta":1}]');

-- ----- Física y Química 1º Bach -----
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('fisica', 'bachillerato', '{1}', 'Las leyes de Newton del movimiento',
'Las tres leyes de Newton constituyen los pilares de la mecánica clásica y describen la relación entre las fuerzas que actúan sobre un cuerpo y su movimiento. La primera ley o ley de inercia establece que un cuerpo permanece en reposo o en movimiento rectilíneo uniforme si la fuerza neta que actúa sobre él es cero. Esta ley define los sistemas de referencia inerciales. La segunda ley relaciona cuantitativamente fuerza, masa y aceleración mediante la ecuación F = ma, indicando que la aceleración es directamente proporcional a la fuerza neta e inversamente proporcional a la masa. La tercera ley o principio de acción y reacción afirma que cuando un cuerpo ejerce una fuerza sobre otro, este ejerce sobre el primero una fuerza igual en magnitud pero de sentido contrario. Es crucial entender que acción y reacción actúan sobre cuerpos diferentes. Estas leyes permiten resolver problemas de equilibrio estático y dinámico, calcular aceleraciones, tensiones y fuerzas de rozamiento. Aunque la mecánica newtoniana es extraordinariamente precisa para velocidades mucho menores que la de la luz, debe ser reemplazada por la relatividad de Einstein a velocidades cercanas a la luz.',
'[{"pregunta":"¿Qué establece la primera ley de Newton?","opciones":["F = ma","Acción y reacción son iguales","Un cuerpo mantiene su estado si la fuerza neta es cero","La energía se conserva"],"correcta":2},{"pregunta":"Según la segunda ley, ¿qué relación hay entre masa y aceleración?","opciones":["Directamente proporcionales","Inversamente proporcionales","No tienen relación","Son iguales"],"correcta":1},{"pregunta":"¿Sobre cuántos cuerpos actúan las fuerzas de acción y reacción?","opciones":["Sobre el mismo cuerpo","Sobre dos cuerpos diferentes","Solo sobre el más pesado","Sobre todos los cuerpos cercanos"],"correcta":1},{"pregunta":"¿Cuándo deja de ser válida la mecánica newtoniana?","opciones":["A bajas temperaturas","Con masas grandes","A velocidades cercanas a la de la luz","Con fuerzas pequeñas"],"correcta":2}]'),

('fisica', 'bachillerato', '{1}', 'El enlace químico',
'El enlace químico es la fuerza que mantiene unidos a los átomos en compuestos y moléculas, y su naturaleza determina las propiedades de las sustancias. Existen tres tipos principales de enlace: iónico, covalente y metálico. El enlace iónico se forma por transferencia de electrones de un metal a un no metal, creando cationes y aniones que se atraen electrostáticamente. Los compuestos iónicos forman redes cristalinas, tienen puntos de fusión elevados y conducen la electricidad en estado fundido o en disolución. El enlace covalente se produce cuando dos átomos no metálicos comparten uno o más pares de electrones para completar su capa de valencia. Puede ser polar, si la diferencia de electronegatividad genera un dipolo, o apolar, si los electrones se comparten equitativamente. El enlace metálico se da entre átomos metálicos cuyos electrones de valencia se deslocalizan formando un mar de electrones que confiere conductividad eléctrica y térmica, brillo y maleabilidad. Además de estos enlaces intramoleculares, las fuerzas intermoleculares como los puentes de hidrógeno, las fuerzas de Van der Waals y las interacciones dipolo-dipolo determinan propiedades como los puntos de ebullición y la solubilidad.',
'[{"pregunta":"¿Cómo se forma el enlace iónico?","opciones":["Compartiendo electrones","Por transferencia de electrones de metal a no metal","Por deslocalización de electrones","Por fuerzas intermoleculares"],"correcta":1},{"pregunta":"¿Qué propiedad confiere el mar de electrones en los metales?","opciones":["Fragilidad","Punto de fusión bajo","Conductividad eléctrica","Transparencia"],"correcta":2},{"pregunta":"¿Cuándo un enlace covalente es polar?","opciones":["Cuando no hay diferencia de electronegatividad","Cuando hay diferencia de electronegatividad","Cuando se transfieren electrones","Cuando los átomos son metales"],"correcta":1},{"pregunta":"¿Qué tipo de fuerza es el puente de hidrógeno?","opciones":["Un enlace iónico","Un enlace covalente fuerte","Una fuerza intermolecular","Un enlace metálico"],"correcta":2}]'),

('fisica', 'bachillerato', '{1}', 'Energía y trabajo en mecánica',
'En mecánica, el trabajo es la transferencia de energía que se produce cuando una fuerza actúa sobre un cuerpo desplazándolo. Se calcula como el producto escalar de la fuerza por el desplazamiento: W = F·d·cos(α), donde α es el ángulo entre la fuerza y el desplazamiento. La potencia es la rapidez con que se realiza trabajo y se mide en vatios. La energía es la capacidad de un sistema para realizar trabajo y puede presentarse en diversas formas: cinética, asociada al movimiento y dada por Ec = ½mv²; potencial gravitatoria, asociada a la posición en un campo gravitatorio y dada por Ep = mgh; y elástica, almacenada en cuerpos deformados. El principio de conservación de la energía mecánica establece que, en ausencia de fuerzas no conservativas como el rozamiento, la suma de energía cinética y potencial permanece constante. Cuando hay fuerzas disipativas, la energía mecánica disminuye y se transforma en energía térmica. Este principio es uno de los más fundamentales de la física y tiene validez universal, desde la mecánica clásica hasta la termodinámica y la física de partículas.',
'[{"pregunta":"¿Cómo se calcula el trabajo de una fuerza constante?","opciones":["W = m·a","W = F·d·cos(α)","W = ½mv²","W = mgh"],"correcta":1},{"pregunta":"¿Qué forma de energía se asocia al movimiento?","opciones":["Potencial gravitatoria","Elástica","Cinética","Térmica"],"correcta":2},{"pregunta":"¿Cuándo se conserva la energía mecánica?","opciones":["Siempre","Cuando no hay fuerzas conservativas","Cuando no hay fuerzas no conservativas como el rozamiento","Nunca se conserva"],"correcta":2},{"pregunta":"¿Qué ocurre con la energía mecánica cuando hay rozamiento?","opciones":["Aumenta","Se mantiene constante","Disminuye y se transforma en energía térmica","Desaparece"],"correcta":2}]');

-- ----- Física 2º Bach -----
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('fisica', 'bachillerato', '{2}', 'El campo gravitatorio',
'El campo gravitatorio es una propiedad del espacio generada por la presencia de masa. Newton formuló la ley de gravitación universal, que establece que dos masas se atraen con una fuerza directamente proporcional al producto de sus masas e inversamente proporcional al cuadrado de la distancia que las separa: F = GMm/r². La intensidad del campo gravitatorio en un punto es la fuerza por unidad de masa: g = GM/r², y su dirección siempre apunta hacia la masa que genera el campo. El potencial gravitatorio es una magnitud escalar definida como V = -GM/r, siempre negativo, que indica la energía potencial por unidad de masa. Las líneas de campo son radiales y convergentes hacia la masa. Las leyes de Kepler, deducibles a partir de la gravitación de Newton, describen el movimiento de los planetas: las órbitas son elipses con el Sol en un foco, la línea que une el planeta al Sol barre áreas iguales en tiempos iguales, y el cuadrado del periodo orbital es proporcional al cubo del semieje mayor. La velocidad orbital y la velocidad de escape son conceptos esenciales para la astronáutica y la comprensión del movimiento de satélites artificiales y naturales.',
'[{"pregunta":"¿Cómo varía la fuerza gravitatoria con la distancia?","opciones":["Proporcionalmente a la distancia","Inversamente proporcional a la distancia","Inversamente proporcional al cuadrado de la distancia","No depende de la distancia"],"correcta":2},{"pregunta":"¿Cuál es el signo del potencial gravitatorio?","opciones":["Siempre positivo","Siempre negativo","Puede ser positivo o negativo","Siempre cero"],"correcta":1},{"pregunta":"Según la primera ley de Kepler, ¿qué forma tienen las órbitas planetarias?","opciones":["Circular","Elíptica","Parabólica","Hiperbólica"],"correcta":1},{"pregunta":"¿Qué velocidad debe superar un objeto para escapar del campo gravitatorio terrestre?","opciones":["Velocidad orbital","Velocidad de la luz","Velocidad de escape","Velocidad del sonido"],"correcta":2}]'),

('fisica', 'bachillerato', '{2}', 'Ondas y fenómenos ondulatorios',
'Las ondas son perturbaciones que se propagan transportando energía sin transporte neto de materia. Se clasifican en mecánicas, que necesitan un medio material, y electromagnéticas, que se propagan en el vacío. Según la dirección de vibración respecto a la propagación, pueden ser transversales o longitudinales. Las magnitudes características de una onda son la amplitud, la frecuencia, el periodo, la longitud de onda y la velocidad de propagación, relacionadas por v = λf. Los fenómenos ondulatorios fundamentales son la reflexión, cuando la onda rebota al chocar con una superficie; la refracción, cuando cambia de velocidad y dirección al pasar a otro medio; la difracción, cuando rodea obstáculos o se expande al pasar por aberturas; y la interferencia, cuando dos ondas se superponen produciendo refuerzo o cancelación. Las ondas estacionarias se forman por superposición de dos ondas iguales que viajan en sentidos opuestos, creando nodos y vientres fijos. El efecto Doppler describe el cambio aparente de frecuencia cuando fuente u observador se mueven. Todos estos fenómenos se observan tanto en ondas mecánicas como en luz y otras radiaciones electromagnéticas.',
'[{"pregunta":"¿Qué transportan las ondas?","opciones":["Materia","Energía sin transporte neto de materia","Masa","Carga eléctrica"],"correcta":1},{"pregunta":"¿Qué relación liga velocidad, longitud de onda y frecuencia?","opciones":["v = λ/f","v = λ + f","v = λ·f","v = f/λ"],"correcta":2},{"pregunta":"¿Qué fenómeno se produce cuando una onda rodea un obstáculo?","opciones":["Reflexión","Refracción","Difracción","Polarización"],"correcta":2},{"pregunta":"¿Qué describe el efecto Doppler?","opciones":["La polarización de la luz","El cambio aparente de frecuencia por movimiento relativo","La formación de ondas estacionarias","La absorción de energía"],"correcta":1}]'),

('fisica', 'bachillerato', '{2}', 'Física cuántica y dualidad onda-partícula',
'A principios del siglo XX, varios experimentos pusieron de manifiesto las limitaciones de la física clásica para explicar fenómenos a escala atómica. Max Planck propuso en 1900 que la energía se emite y absorbe en paquetes discretos llamados cuantos, con energía E = hf, donde h es la constante de Planck. Einstein explicó el efecto fotoeléctrico en 1905 proponiendo que la luz está formada por partículas llamadas fotones, cada uno con energía hf. Solo si la frecuencia de la luz supera un valor umbral, los electrones del metal absorben suficiente energía para ser arrancados, independientemente de la intensidad luminosa. En 1924, De Broglie postuló que toda partícula material tiene una longitud de onda asociada dada por λ = h/mv, estableciendo la dualidad onda-partícula. Heisenberg formuló el principio de incertidumbre, que limita la precisión simultánea con que se pueden conocer posición y momento de una partícula. Schrödinger desarrolló una ecuación de onda cuya solución, la función de onda, permite calcular probabilidades de encontrar la partícula en una región del espacio. Estos descubrimientos revolucionaron la comprensión de la naturaleza y dieron lugar a la mecánica cuántica moderna.',
'[{"pregunta":"¿Quién propuso la cuantización de la energía?","opciones":["Einstein","Bohr","Planck","Schrödinger"],"correcta":2},{"pregunta":"¿De qué depende que se emitan electrones en el efecto fotoeléctrico?","opciones":["De la intensidad de la luz","De la frecuencia de la luz","Del tamaño del metal","De la temperatura"],"correcta":1},{"pregunta":"¿Qué establece la hipótesis de De Broglie?","opciones":["Que la luz es una onda","Que toda partícula tiene una longitud de onda asociada","Que los electrones son estáticos","Que la energía no se conserva"],"correcta":1},{"pregunta":"¿Qué permite calcular la función de onda de Schrödinger?","opciones":["La masa del electrón","La velocidad exacta","Probabilidades de posición","La carga eléctrica"],"correcta":2}]');

-- ----- Química 2º Bach -----
INSERT INTO comprension_texts (subject_id, level, grades, title, text_content, questions) VALUES
('quimica', 'bachillerato', '{2}', 'Equilibrio químico',
'El equilibrio químico es el estado al que llega una reacción reversible cuando las velocidades de la reacción directa e inversa se igualan. En este punto, las concentraciones de reactivos y productos permanecen constantes, aunque las reacciones siguen ocurriendo a nivel microscópico. La constante de equilibrio Kc se define como el cociente de las concentraciones de los productos elevadas a sus coeficientes estequiométricos entre las de los reactivos elevadas a los suyos. Un valor grande de Kc indica que el equilibrio favorece a los productos, mientras que un valor pequeño favorece a los reactivos. El principio de Le Chatelier predice cómo responde el sistema ante perturbaciones: un aumento de concentración de un reactivo desplaza el equilibrio hacia los productos; un aumento de presión favorece el lado con menor número de moles gaseosos; y un aumento de temperatura favorece la reacción endotérmica. Es importante recordar que un catalizador no modifica la posición del equilibrio ni el valor de Kc, solo acelera el tiempo necesario para alcanzarlo. El cociente de reacción Q permite predecir la dirección del desplazamiento comparándolo con Kc.',
'[{"pregunta":"¿Qué ocurre con las concentraciones en el equilibrio químico?","opciones":["Todas se igualan","Las de productos son siempre mayores","Permanecen constantes","Siguen cambiando"],"correcta":2},{"pregunta":"¿Qué indica un valor grande de Kc?","opciones":["La reacción es lenta","El equilibrio favorece a los reactivos","El equilibrio favorece a los productos","No hay equilibrio"],"correcta":2},{"pregunta":"Según Le Chatelier, ¿qué efecto tiene aumentar la temperatura en una reacción exotérmica?","opciones":["Desplaza el equilibrio hacia los productos","Desplaza el equilibrio hacia los reactivos","No tiene efecto","Duplica Kc"],"correcta":1},{"pregunta":"¿Qué efecto tiene un catalizador sobre Kc?","opciones":["La aumenta","La disminuye","No la modifica","La hace infinita"],"correcta":2}]'),

('quimica', 'bachillerato', '{2}', 'Reacciones de oxidación-reducción',
'Las reacciones redox implican transferencia de electrones entre especies químicas. La oxidación es la pérdida de electrones y la reducción es la ganancia. El oxidante es la especie que gana electrones y se reduce, mientras que el reductor pierde electrones y se oxida. Los números de oxidación permiten identificar qué átomos se oxidan y cuáles se reducen en una reacción. Para ajustar reacciones redox se utiliza el método del ion-electrón, que consiste en separar la reacción en dos semirreacciones, ajustar cada una independientemente en masa y carga, y combinarlas igualando el número de electrones transferidos. Las pilas galvánicas aprovechan reacciones redox espontáneas para generar corriente eléctrica. El ánodo es el electrodo donde se produce la oxidación y el cátodo donde se produce la reducción. La fuerza electromotriz de la pila es la diferencia de potenciales de reducción estándar de ambos electrodos. La electrólisis es el proceso inverso: se utiliza energía eléctrica para forzar una reacción redox no espontánea, con aplicaciones en la obtención de metales, la galvanoplastia y la producción de cloro y sosa cáustica.',
'[{"pregunta":"¿Qué es la oxidación?","opciones":["Ganancia de electrones","Pérdida de electrones","Ganancia de protones","Pérdida de neutrones"],"correcta":1},{"pregunta":"¿En qué electrodo se produce la reducción en una pila?","opciones":["En el ánodo","En el puente salino","En el cátodo","En ambos"],"correcta":2},{"pregunta":"¿Qué es la electrólisis?","opciones":["Una reacción espontánea","Uso de energía eléctrica para forzar una reacción redox","La medición del pH","Un tipo de valoración"],"correcta":1},{"pregunta":"¿Cómo se calcula la fem de una pila?","opciones":["Sumando los potenciales","Como diferencia de potenciales de reducción","Multiplicando los potenciales","Dividiendo los potenciales"],"correcta":1}]'),

('quimica', 'bachillerato', '{2}', 'Introducción a la química orgánica',
'La química orgánica es la rama de la química que estudia los compuestos del carbono, un elemento excepcional por su capacidad de formar cuatro enlaces covalentes y cadenas de longitud prácticamente ilimitada. Los hidrocarburos son los compuestos más simples y se clasifican en alcanos (enlaces simples), alquenos (doble enlace) y alquinos (triple enlace). Los compuestos aromáticos contienen anillos de benceno con electrones deslocalizados. Los grupos funcionales son agrupaciones de átomos que determinan las propiedades químicas de los compuestos: el grupo hidroxilo (-OH) define los alcoholes, el grupo carbonilo (C=O) define aldehídos y cetonas, el grupo carboxilo (-COOH) define los ácidos carboxílicos, y el grupo amino (-NH₂) define las aminas. La isomería permite que compuestos con la misma fórmula molecular tengan diferentes estructuras y propiedades. Las reacciones orgánicas fundamentales incluyen la sustitución, la adición, la eliminación y la condensación. La nomenclatura IUPAC proporciona reglas sistemáticas para nombrar compuestos orgánicos según su estructura, cadena principal, insaturaciones y grupos funcionales. La química orgánica es esencial para la comprensión de la bioquímica, la farmacología y la ciencia de materiales.',
'[{"pregunta":"¿Por qué el carbono es especial en química orgánica?","opciones":["Porque es el más abundante","Porque forma cuatro enlaces y cadenas ilimitadas","Porque es un gas noble","Porque no forma enlaces"],"correcta":1},{"pregunta":"¿Qué grupo funcional define a los ácidos carboxílicos?","opciones":["-OH","-NH₂","-COOH","-CHO"],"correcta":2},{"pregunta":"¿Qué son los isómeros?","opciones":["Compuestos con distinta fórmula molecular","Compuestos con misma fórmula molecular pero diferente estructura","Átomos con distinto número de neutrones","Elementos del mismo grupo"],"correcta":1},{"pregunta":"¿Qué tipo de enlace caracteriza a los alquenos?","opciones":["Simple","Doble","Triple","Iónico"],"correcta":1}]');

COMMIT;
