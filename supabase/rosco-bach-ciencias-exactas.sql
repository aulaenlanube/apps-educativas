-- ============================================================
-- ROSCO BACHILLERATO — CIENCIAS EXACTAS (375 preguntas)
-- Asignaturas: matematicas {1}, matematicas {2},
--              fisica {1}, fisica {2}, quimica {2}
-- ============================================================

-- ============================================================
-- 1. MATEMATICAS — BACHILLERATO 1 (75 preguntas)
--    Funciones, límites, derivadas, trigonometría, vectores,
--    matrices, sistemas, combinatoria, probabilidad, geometría
-- ============================================================
INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- A
('A', 'empieza', 'Valor al que se aproxima una función cuando la variable independiente tiende a un punto, sin necesidad de alcanzarlo', 'asintotica', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Elemento matemático que expresa la medida de la superficie encerrada bajo una curva', 'area', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'En trigonometría, razón entre el cateto contiguo y la hipotenusa de un triángulo rectángulo', 'adyacente', 'matematicas', 'bachillerato', '{1}', 2),

-- B
('B', 'empieza', 'En una función cuadrática, cada una de las dos ramas en que se divide la parábola respecto a su eje de simetría', 'brazo', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Número que forma la parte inferior de una potencia y que se multiplica por sí mismo tantas veces como indica el exponente', 'base', 'matematicas', 'bachillerato', '{1}', 1),

-- C
('C', 'empieza', 'Número de formas de elegir r elementos de un conjunto de n, sin importar el orden', 'combinacion', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Función trigonométrica que relaciona el cateto adyacente con la hipotenusa', 'coseno', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Propiedad de una función que puede dibujarse sin levantar el lápiz del papel', 'continuidad', 'matematicas', 'bachillerato', '{1}', 2),

-- D
('D', 'empieza', 'Operación que obtiene la función que mide la tasa de cambio instantánea de otra función', 'derivada', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Valor numérico asociado a una matriz cuadrada que indica si es invertible', 'determinante', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Conjunto de valores que puede tomar la variable independiente de una función', 'dominio', 'matematicas', 'bachillerato', '{1}', 1),

-- E
('E', 'empieza', 'Igualdad matemática que contiene una o más incógnitas y que solo se verifica para ciertos valores', 'ecuacion', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Número irracional aproximadamente igual a 2,718 que es base del logaritmo natural', 'euler', 'matematicas', 'bachillerato', '{1}', 2),

-- F
('F', 'empieza', 'Producto de todos los enteros positivos desde 1 hasta n, usado en combinatoria', 'factorial', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Relación entre dos conjuntos que asigna a cada elemento del primero exactamente un elemento del segundo', 'funcion', 'matematicas', 'bachillerato', '{1}', 1),

-- G
('G', 'empieza', 'Rama de las matemáticas que estudia las propiedades de las figuras en el plano usando coordenadas', 'geometria', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Representación visual de una función mediante una curva en un sistema de ejes coordenados', 'grafica', 'matematicas', 'bachillerato', '{1}', 1),

-- H
('H', 'empieza', 'Función trigonométrica que es la inversa del coseno y se usa en triángulos', 'hipotenusa', 'matematicas', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Curva plana definida como el lugar geométrico de los puntos cuya diferencia de distancias a dos focos es constante', 'hiperbola', 'matematicas', 'bachillerato', '{1}', 2),

-- I
('I', 'empieza', 'Conjunto de valores comprendidos entre dos extremos en la recta real', 'intervalo', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Recta que una curva se va aproximando indefinidamente sin llegar a tocarla, también llamada asíntota', 'infinito', 'matematicas', 'bachillerato', '{1}', 2),

-- J
('J', 'empieza', 'Conjunto de sucesos posibles en un experimento aleatorio, también llamado espacio muestral en el juego de azar', 'juego', 'matematicas', 'bachillerato', '{1}', 2),

-- K
('K', 'contiene', 'Valor numérico del determinante de una matriz cuando este es igual a cero, lo que indica que la matriz es singular', 'rank', 'matematicas', 'bachillerato', '{1}', 3),

-- L
('L', 'empieza', 'Valor al que se acerca f(x) cuando x tiende a un determinado punto o al infinito', 'limite', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Función inversa de la exponencial, que permite despejar el exponente de una potencia', 'logaritmo', 'matematicas', 'bachillerato', '{1}', 1),

-- M
('M', 'empieza', 'Tabla rectangular de números dispuestos en filas y columnas sobre la que se definen operaciones algebraicas', 'matriz', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Punto de una función donde la derivada se anula y la segunda derivada es negativa', 'maximo', 'matematicas', 'bachillerato', '{1}', 2),

-- N
('N', 'empieza', 'Expresión de un número complejo en forma a + bi, donde a es la parte real y b la parte imaginaria, que define el módulo con la raíz cuadrada de a² + b²', 'norma', 'matematicas', 'bachillerato', '{1}', 3),

-- Ñ
('Ñ', 'contiene', 'En geometría analítica, recta que pasa por un punto de una curva y es perpendicular a la tangente en ese punto', 'companera', 'matematicas', 'bachillerato', '{1}', 3),

-- O
('O', 'empieza', 'Punto donde los ejes de coordenadas se cruzan, con coordenadas (0,0)', 'origen', 'matematicas', 'bachillerato', '{1}', 1),

-- P
('P', 'empieza', 'Cónica con forma de U que es la gráfica de una función cuadrática', 'parabola', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Número de formas ordenadas de disponer r elementos tomados de un conjunto de n', 'permutacion', 'matematicas', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Medida numérica entre 0 y 1 que cuantifica la posibilidad de que ocurra un suceso aleatorio', 'probabilidad', 'matematicas', 'bachillerato', '{1}', 1),

-- Q
('Q', 'empieza', 'Resultado que se obtiene al dividir un número entre otro', 'quociente', 'matematicas', 'bachillerato', '{1}', 2),

-- R
('R', 'empieza', 'Medida angular alternativa al grado sexagesimal, donde una vuelta completa equivale a 2π', 'radian', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Conjunto de valores que toma una función, también llamado imagen o recorrido', 'rango', 'matematicas', 'bachillerato', '{1}', 2),

-- S
('S', 'empieza', 'Función trigonométrica que relaciona el cateto opuesto con la hipotenusa en un triángulo rectángulo', 'seno', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Conjunto de ecuaciones que deben satisfacerse simultáneamente con los mismos valores de las incógnitas', 'sistema', 'matematicas', 'bachillerato', '{1}', 1),

-- T
('T', 'empieza', 'Función trigonométrica definida como el cociente entre el seno y el coseno', 'tangente', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Representación matricial de números en filas y columnas que al intercambiar filas por columnas da la traspuesta', 'traspuesta', 'matematicas', 'bachillerato', '{1}', 2),

-- U
('U', 'empieza', 'Operación entre conjuntos que da como resultado todos los elementos que pertenecen a al menos uno de ellos', 'union', 'matematicas', 'bachillerato', '{1}', 1),

-- V
('V', 'empieza', 'Ente matemático definido por módulo, dirección y sentido, representado como segmento orientado', 'vector', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Punto más bajo o más alto de una parábola, donde la función cuadrática alcanza su extremo', 'vertice', 'matematicas', 'bachillerato', '{1}', 1),

-- X
('X', 'contiene', 'Punto donde la gráfica de una función corta al eje de abscisas, es decir, donde f(x)=0', 'extremo', 'matematicas', 'bachillerato', '{1}', 2),

-- Y
('Y', 'contiene', 'En geometría, recta que forma un ángulo de exactamente noventa grados con la dirección de proyección', 'proyeccion', 'matematicas', 'bachillerato', '{1}', 3),

-- Z
('Z', 'contiene', 'Operación que consiste en reducir una expresión algebraica igualando el resultado a cero para hallar sus raíces', 'raiz', 'matematicas', 'bachillerato', '{1}', 2),


-- ============================================================
-- 2. MATEMATICAS — BACHILLERATO 2 (75 preguntas)
--    Integrales, ecuaciones, geometría espacio, álgebra lineal,
--    estadística, distribuciones, inferencia, prog. lineal
-- ============================================================

-- A
('A', 'empieza', 'Operación inversa de la derivación que permite calcular el área bajo una curva', 'antiderivada', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Rama del álgebra que estudia los espacios vectoriales, las matrices y las transformaciones lineales', 'algebra', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Propiedad de un estimador estadístico cuya distribución muestral se centra en el parámetro poblacional', 'asimetria', 'matematicas', 'bachillerato', '{2}', 3),

-- B
('B', 'empieza', 'Distribución de probabilidad discreta que modela el número de éxitos en n ensayos independientes con misma probabilidad', 'binomial', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Regla para calcular la derivada de una función compuesta en varias variables, usando derivadas parciales', 'barrow', 'matematicas', 'bachillerato', '{2}', 2),

-- C
('C', 'empieza', 'Valor constante que se añade al resultado de una integral indefinida para representar la familia de primitivas', 'constante', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Medida estadística del grado de relación lineal entre dos variables cuantitativas', 'correlacion', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Propiedad que se cumple cuando un sistema de ecuaciones tiene exactamente una solución', 'compatible', 'matematicas', 'bachillerato', '{2}', 1),

-- D
('D', 'empieza', 'Medida de dispersión que indica cuánto se desvían en promedio los datos respecto a la media', 'desviacion', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'En programación lineal, recta que limita la región factible de soluciones', 'desigualdad', 'matematicas', 'bachillerato', '{2}', 2),

-- E
('E', 'empieza', 'Número real que, multiplicado por un vector propio, da el mismo resultado que aplicarle la matriz asociada', 'eigenvalor', 'matematicas', 'bachillerato', '{2}', 3),
('E', 'empieza', 'Valor calculado a partir de una muestra que sirve para aproximar un parámetro desconocido de la población', 'estimador', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Tipo de ecuación diferencial donde la función incógnita y sus derivadas aparecen con exponente uno', 'exponencial', 'matematicas', 'bachillerato', '{2}', 2),

-- F
('F', 'empieza', 'Función cuya integral se quiere calcular, es decir, la expresión que aparece dentro del signo de integración', 'funcion', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Región del plano delimitada por las restricciones de un problema de programación lineal', 'factible', 'matematicas', 'bachillerato', '{2}', 2),

-- G
('G', 'empieza', 'Distribución continua de probabilidad con forma de campana, simétrica respecto a la media', 'gaussiana', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Número de ecuaciones linealmente independientes en un sistema, que coincide con el rango de la matriz de coeficientes', 'grado', 'matematicas', 'bachillerato', '{2}', 2),

-- H
('H', 'empieza', 'Proposición que se plantea provisionalmente sobre un parámetro poblacional y que se contrasta con datos muestrales', 'hipotesis', 'matematicas', 'bachillerato', '{2}', 1),

-- I
('I', 'empieza', 'Operación del cálculo que obtiene la primitiva de una función o el valor del área bajo la curva', 'integral', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Rango de valores construido a partir de datos muestrales que contiene al parámetro poblacional con una confianza dada', 'intervalo', 'matematicas', 'bachillerato', '{2}', 1),

-- J
('J', 'contiene', 'Matriz cuyo determinante es igual a uno y que al multiplicarla por sí misma no cambia, perdiendo un subespacio', 'adjunta', 'matematicas', 'bachillerato', '{2}', 3),

-- K
('K', 'contiene', 'Test estadístico no paramétrico que compara la distribución observada de una variable con la esperada teórica', 'kolmogorov', 'matematicas', 'bachillerato', '{2}', 3),

-- L
('L', 'empieza', 'Técnica de integración que descompone una fracción algebraica en suma de fracciones más simples', 'logaritmica', 'matematicas', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Tipo de función que en coordenadas cartesianas se representa como una recta y se define por f(x)=mx+n', 'lineal', 'matematicas', 'bachillerato', '{2}', 1),

-- M
('M', 'empieza', 'Valor esperado de una variable aleatoria, obtenido como la suma de cada valor por su probabilidad', 'media', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Estadístico que divide la distribución de datos ordenados en dos mitades iguales', 'mediana', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Selección aleatoria de individuos de una población sobre la que se realizan observaciones', 'muestra', 'matematicas', 'bachillerato', '{2}', 1),

-- N
('N', 'empieza', 'Distribución de probabilidad continua simétrica, definida por su media y desviación típica, con forma de campana', 'normal', 'matematicas', 'bachillerato', '{2}', 1),

-- Ñ
('Ñ', 'contiene', 'Tamaño de la muestra estadística, cuyo valor influye directamente en la amplitud del intervalo de confianza', 'tamanio', 'matematicas', 'bachillerato', '{2}', 2),

-- O
('O', 'empieza', 'Función matemática que se busca maximizar o minimizar en un problema de programación lineal', 'objetivo', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Propiedad de dos vectores cuyo producto escalar es cero', 'ortogonal', 'matematicas', 'bachillerato', '{2}', 2),

-- P
('P', 'empieza', 'Función cuya derivada es una función dada, también llamada antiderivada', 'primitiva', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'En geometría del espacio, superficie determinada por un punto y un vector normal', 'plano', 'matematicas', 'bachillerato', '{2}', 1),

-- Q
('Q', 'empieza', 'Valores que dividen una distribución de datos en cuatro partes iguales', 'quartil', 'matematicas', 'bachillerato', '{2}', 2),

-- R
('R', 'empieza', 'Número máximo de filas o columnas linealmente independientes de una matriz', 'rango', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Recta en el espacio tridimensional definida por un punto y un vector director', 'recta', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Técnica de estadística que modela la relación entre una variable dependiente y una o más independientes', 'regresion', 'matematicas', 'bachillerato', '{2}', 2),

-- S
('S', 'empieza', 'Método de resolución de integrales que reemplaza la variable de integración por otra nueva', 'sustitucion', 'matematicas', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Propiedad de la distribución normal por la cual la media, la mediana y la moda coinciden', 'simetria', 'matematicas', 'bachillerato', '{2}', 1),

-- T
('T', 'empieza', 'Teorema fundamental del cálculo que relaciona la derivación con la integración definida', 'teorema', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Valor numérico que se compara con el valor crítico en un contraste de hipótesis para decidir si se rechaza', 'test', 'matematicas', 'bachillerato', '{2}', 2),

-- U
('U', 'empieza', 'Distribución de probabilidad donde todos los valores posibles tienen la misma probabilidad de ocurrir', 'uniforme', 'matematicas', 'bachillerato', '{2}', 2),

-- V
('V', 'empieza', 'Medida de dispersión que se calcula como el cuadrado de la desviación típica', 'varianza', 'matematicas', 'bachillerato', '{2}', 1),
('V', 'empieza', 'En el espacio tridimensional, elemento con tres componentes que indica magnitud y dirección', 'vector', 'matematicas', 'bachillerato', '{2}', 1),

-- X
('X', 'contiene', 'Valor de la variable que hace que una función alcance su punto más alto o más bajo localmente', 'extremo', 'matematicas', 'bachillerato', '{2}', 2),

-- Y
('Y', 'contiene', 'Curva trazada en el plano cartesiano que representa los datos de una distribución de frecuencias', 'trayectoria', 'matematicas', 'bachillerato', '{2}', 3),

-- Z
('Z', 'contiene', 'Transformación estadística que convierte un dato en su número de desviaciones típicas respecto a la media, usada para la tabla normal', 'estandarizar', 'matematicas', 'bachillerato', '{2}', 2),


-- ============================================================
-- 3. FISICA — BACHILLERATO 1 (75 preguntas)
--    Cinemática, dinámica, trabajo/energía, gravitación,
--    estructura atómica, enlace, formulación, reacciones, estequiometría
-- ============================================================

-- A
('A', 'empieza', 'Magnitud vectorial que mide la variación de velocidad por unidad de tiempo', 'aceleracion', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Partícula fundamental del núcleo atómico formada por dos protones y dos neutrones, emitida en desintegración radiactiva', 'alfa', 'fisica', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Fuerza que se opone al desplazamiento de un cuerpo en el seno de un fluido', 'arrastre', 'fisica', 'bachillerato', '{1}', 2),

-- B
('B', 'empieza', 'Instrumento de laboratorio que mide la presión atmosférica mediante una columna de mercurio', 'barometro', 'fisica', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Principio de Arquímedes: fuerza vertical ascendente que ejerce un fluido sobre un cuerpo sumergido', 'boyante', 'fisica', 'bachillerato', '{1}', 3),

-- C
('C', 'empieza', 'Rama de la física que estudia el movimiento de los cuerpos sin atender a las causas que lo producen', 'cinematica', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Partícula subatómica con carga negativa que orbita alrededor del núcleo atómico', 'cation', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Magnitud que se conserva en un sistema aislado según la tercera ley de Newton: cantidad de movimiento', 'cantidad', 'fisica', 'bachillerato', '{1}', 2),

-- D
('D', 'empieza', 'Rama de la física que estudia el movimiento de los cuerpos y las fuerzas que lo causan', 'dinamica', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Magnitud escalar que mide la masa por unidad de volumen de una sustancia', 'densidad', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Cambio de posición de un cuerpo medido como vector desde el punto inicial al final', 'desplazamiento', 'fisica', 'bachillerato', '{1}', 1),

-- E
('E', 'empieza', 'Capacidad de un sistema para realizar trabajo, que se conserva en sistemas aislados', 'energia', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Relación cuantitativa entre las masas de reactivos y productos en una reacción química', 'estequiometria', 'fisica', 'bachillerato', '{1}', 2),

-- F
('F', 'empieza', 'Interacción entre dos superficies en contacto que se opone al movimiento relativo entre ellas', 'friccion', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Magnitud vectorial capaz de modificar el estado de reposo o movimiento de un cuerpo', 'fuerza', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Representación simbólica de una sustancia química mediante símbolos de elementos y subíndices', 'formula', 'fisica', 'bachillerato', '{1}', 1),

-- G
('G', 'empieza', 'Fuerza de atracción entre dos masas, descrita por la ley de Newton de la gravitación universal', 'gravitacion', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Aceleración que experimenta un cuerpo en caída libre cerca de la superficie terrestre, aproximadamente 9,8 m/s²', 'gravedad', 'fisica', 'bachillerato', '{1}', 1),

-- H
('H', 'empieza', 'Elemento químico más ligero y abundante del universo, con número atómico 1', 'hidrogeno', 'fisica', 'bachillerato', '{1}', 1),

-- I
('I', 'empieza', 'Propiedad de los cuerpos de resistir cambios en su estado de movimiento, proporcional a su masa', 'inercia', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Partícula con carga eléctrica neta por haber ganado o perdido electrones', 'ion', 'fisica', 'bachillerato', '{1}', 1),

-- J
('J', 'empieza', 'Unidad del Sistema Internacional para medir energía, trabajo y calor', 'julio', 'fisica', 'bachillerato', '{1}', 1),

-- K
('K', 'contiene', 'Energía que posee un cuerpo debido a su movimiento, proporcional al cuadrado de la velocidad', 'cinetica', 'fisica', 'bachillerato', '{1}', 1),

-- L
('L', 'empieza', 'Enunciado general que describe una regularidad observada en la naturaleza y que se expresa matemáticamente', 'ley', 'fisica', 'bachillerato', '{1}', 1),

-- M
('M', 'empieza', 'Cantidad de materia que contiene un cuerpo, medida en kilogramos en el SI', 'masa', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Unidad de cantidad de sustancia del SI, equivalente a 6,022 × 10²³ entidades', 'mol', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Producto de una fuerza por la distancia al eje de giro, que mide la tendencia a producir rotación', 'momento', 'fisica', 'bachillerato', '{1}', 2),

-- N
('N', 'empieza', 'Unidad de fuerza en el SI, equivalente a la fuerza que acelera 1 kg a 1 m/s²', 'newton', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Partícula subatómica sin carga eléctrica que se encuentra en el núcleo del átomo', 'neutron', 'fisica', 'bachillerato', '{1}', 1),

-- Ñ
('Ñ', 'contiene', 'Modelo atómico que describe los electrones en niveles de energía y subniveles con orbitales, propuesto en 1926', 'mecanica', 'fisica', 'bachillerato', '{1}', 3),

-- O
('O', 'empieza', 'Trayectoria cerrada que describe un cuerpo alrededor de otro por efecto de la fuerza gravitatoria', 'orbita', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Reacción química en la que una sustancia pierde electrones, aumentando su estado de oxidación', 'oxidacion', 'fisica', 'bachillerato', '{1}', 2),

-- P
('P', 'empieza', 'Magnitud que mide el trabajo realizado por unidad de tiempo', 'potencia', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Partícula subatómica con carga positiva que se encuentra en el núcleo del átomo', 'proton', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Fuerza por unidad de superficie que ejerce un fluido sobre las paredes de su recipiente', 'presion', 'fisica', 'bachillerato', '{1}', 1),

-- Q
('Q', 'empieza', 'Rama de la física que estudia la naturaleza y las propiedades de la materia a escala subatómica', 'quantica', 'fisica', 'bachillerato', '{1}', 3),

-- R
('R', 'empieza', 'Proceso por el cual unas sustancias se transforman en otras distintas, reorganizando sus átomos', 'reaccion', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Sustancia que se obtiene como producto final de una reacción química', 'resultado', 'fisica', 'bachillerato', '{1}', 2),

-- S
('S', 'empieza', 'Mezcla homogénea de dos o más sustancias en la que no se distinguen sus componentes a simple vista', 'solucion', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Sustancia pura que no puede descomponerse en otras más sencillas por métodos químicos ordinarios', 'sustancia', 'fisica', 'bachillerato', '{1}', 2),

-- T
('T', 'empieza', 'Producto de la fuerza aplicada sobre un cuerpo por la distancia recorrida en la dirección de dicha fuerza', 'trabajo', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Movimiento de un proyectil que sigue una parábola bajo la acción exclusiva de la gravedad', 'tiro', 'fisica', 'bachillerato', '{1}', 2),

-- U
('U', 'empieza', 'Sistema de unidades basado en el metro, kilogramo, segundo, amperio, kelvin, mol y candela', 'unidades', 'fisica', 'bachillerato', '{1}', 1),

-- V
('V', 'empieza', 'Magnitud vectorial que mide la rapidez y dirección del cambio de posición por unidad de tiempo', 'velocidad', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Espacio tridimensional que ocupa un cuerpo, medido en metros cúbicos en el SI', 'volumen', 'fisica', 'bachillerato', '{1}', 1),

-- X
('X', 'contiene', 'Proceso de cambio de estado de líquido a gas que ocurre en toda la masa del líquido al alcanzar su punto de ebullición', 'ebullicion', 'fisica', 'bachillerato', '{1}', 3),

-- Y
('Y', 'contiene', 'Movimiento de un cuerpo lanzado con cierto ángulo respecto a la horizontal, describiendo una trayectoria curva', 'proyectil', 'fisica', 'bachillerato', '{1}', 2),

-- Z
('Z', 'contiene', 'Fuerza de atracción que la Tierra ejerce sobre los cuerpos cercanos a su superficie, dirigida hacia su centro', 'pesadez', 'fisica', 'bachillerato', '{1}', 3),


-- ============================================================
-- 4. FISICA — BACHILLERATO 2 (75 preguntas)
--    Campos gravitatorio/eléctrico/magnético, inducción,
--    ondas, óptica, física nuclear, relatividad, mecánica cuántica
-- ============================================================

-- A
('A', 'empieza', 'Distancia máxima que alcanza un punto de un medio respecto a su posición de equilibrio al paso de una onda', 'amplitud', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Partículas de antimateria con la misma masa pero carga opuesta a sus correspondientes partículas de materia', 'antimateria', 'fisica', 'bachillerato', '{2}', 3),

-- B
('B', 'empieza', 'Partícula de alta energía emitida por un núcleo radiactivo, consistente en un electrón o un positrón', 'beta', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Partícula fundamental que media la interacción entre quarks, responsable de la fuerza nuclear fuerte', 'boson', 'fisica', 'bachillerato', '{2}', 3),

-- C
('C', 'empieza', 'Región del espacio donde una masa, carga o corriente ejerce una fuerza sobre otras similares', 'campo', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Propiedad fundamental de la materia responsable de las interacciones electromagnéticas', 'carga', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Ley que establece que la fuerza entre dos cargas es proporcional al producto de ellas e inversamente proporcional al cuadrado de la distancia', 'coulomb', 'fisica', 'bachillerato', '{2}', 1),

-- D
('D', 'empieza', 'Fenómeno ondulatorio por el cual una onda se curva al pasar por una rendija o rodear un obstáculo', 'difraccion', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Dualidad de la materia que establece que toda partícula tiene asociada una longitud de onda', 'dualidad', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Proceso nuclear por el cual un núcleo inestable emite radiación para transformarse en otro más estable', 'desintegracion', 'fisica', 'bachillerato', '{2}', 1),

-- E
('E', 'empieza', 'Radiación formada por la oscilación conjunta de campos eléctrico y magnético perpendiculares', 'electromagnetica', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Fenómeno cuántico por el cual un electrón puede atravesar una barrera de potencial que clásicamente no podría superar', 'efecto', 'fisica', 'bachillerato', '{2}', 2),

-- F
('F', 'empieza', 'Paquete mínimo e indivisible de energía electromagnética, también llamado cuanto de luz', 'foton', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Número de ciclos completos de una onda que ocurren por unidad de tiempo, medida en hercios', 'frecuencia', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Proceso nuclear por el cual dos núcleos ligeros se unen para formar uno más pesado, liberando energía', 'fusion', 'fisica', 'bachillerato', '{2}', 1),

-- G
('G', 'empieza', 'Radiación electromagnética de muy alta frecuencia y energía, emitida en transiciones nucleares', 'gamma', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Campo de fuerza creado por una masa que atrae a otras masas según la ley de la gravitación universal', 'gravitatorio', 'fisica', 'bachillerato', '{2}', 1),

-- H
('H', 'empieza', 'Principio de la mecánica cuántica que establece que no se pueden conocer simultáneamente posición y momento con precisión arbitraria', 'heisenberg', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Unidad de frecuencia del SI equivalente a un ciclo por segundo', 'hercio', 'fisica', 'bachillerato', '{2}', 1),

-- I
('I', 'empieza', 'Fenómeno por el cual un campo magnético variable genera una fuerza electromotriz en un conductor', 'induccion', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Fenómeno ondulatorio que produce franjas de refuerzo y cancelación cuando dos ondas se superponen', 'interferencia', 'fisica', 'bachillerato', '{2}', 2),

-- J
('J', 'contiene', 'Fenómeno por el cual un espejo esférico o una lente producen una imagen no invertida del objeto', 'espejo', 'fisica', 'bachillerato', '{2}', 2),

-- K
('K', 'contiene', 'Constante fundamental de la mecánica cuántica que relaciona la energía de un fotón con su frecuencia', 'planck', 'fisica', 'bachillerato', '{2}', 2),

-- L
('L', 'empieza', 'Elemento óptico transparente que refracta la luz y forma imágenes al converger o divergir los rayos', 'lente', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Distancia entre dos puntos consecutivos de una onda que se encuentran en el mismo estado de vibración', 'longitud', 'fisica', 'bachillerato', '{2}', 1),

-- M
('M', 'empieza', 'Propiedad de ciertos materiales de atraer al hierro, debida al movimiento de sus electrones', 'magnetismo', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Rama de la física que describe el comportamiento de la materia a escala atómica y subatómica', 'mecanica', 'fisica', 'bachillerato', '{2}', 2),

-- N
('N', 'empieza', 'Parte central del átomo que contiene protones y neutrones y concentra casi toda su masa', 'nucleo', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Partícula elemental sin carga y con masa casi nula que se emite en la desintegración beta', 'neutrino', 'fisica', 'bachillerato', '{2}', 2),

-- Ñ
('Ñ', 'contiene', 'Dispositivo que descompone la luz blanca en los colores que la componen al atravesar un medio dispersivo', 'munon', 'fisica', 'bachillerato', '{2}', 3),

-- O
('O', 'empieza', 'Perturbación que se propaga transportando energía sin transporte neto de materia', 'onda', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Rama de la física que estudia la luz y los fenómenos relacionados con su propagación, reflexión y refracción', 'optica', 'fisica', 'bachillerato', '{2}', 1),

-- P
('P', 'empieza', 'Diferencia de energía potencial eléctrica por unidad de carga entre dos puntos de un campo eléctrico', 'potencial', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Fenómeno cuántico por el que la luz arranca electrones de la superficie de un metal al superar cierta frecuencia umbral', 'fotoelectrico', 'fisica', 'bachillerato', '{2}', 2),

-- Q
('Q', 'empieza', 'Partícula elemental que forma los protones y neutrones, con carga fraccionaria y seis sabores', 'quark', 'fisica', 'bachillerato', '{2}', 2),

-- R
('R', 'empieza', 'Cambio de dirección de una onda al pasar de un medio a otro con distinta velocidad de propagación', 'refraccion', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Teoría de Einstein que postula que la velocidad de la luz es constante y que el tiempo se dilata a altas velocidades', 'relatividad', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Emisión de energía en forma de ondas o partículas por parte de núcleos atómicos inestables', 'radiacion', 'fisica', 'bachillerato', '{2}', 1),

-- S
('S', 'empieza', 'Dispositivo electroacústico que transforma energía eléctrica en sonido al hacer vibrar una membrana', 'solenoide', 'fisica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Fenómeno ondulatorio en el que se forman nodos y vientres cuando dos ondas de igual frecuencia viajan en sentidos opuestos', 'estacionaria', 'fisica', 'bachillerato', '{2}', 2),

-- T
('T', 'empieza', 'Unidad del SI de densidad de flujo magnético, equivalente a un weber por metro cuadrado', 'tesla', 'fisica', 'bachillerato', '{2}', 1),

-- U
('U', 'empieza', 'Elemento químico radiactivo con número atómico 92, usado como combustible en reactores nucleares', 'uranio', 'fisica', 'bachillerato', '{2}', 1),

-- V
('V', 'empieza', 'Velocidad a la que se propaga la perturbación en un medio, que depende de las propiedades de este', 'velocidad', 'fisica', 'bachillerato', '{2}', 1),

-- X
('X', 'contiene', 'Ecuación de la mecánica cuántica que describe la evolución temporal de la función de onda de un sistema', 'schrodinger', 'fisica', 'bachillerato', '{2}', 3),

-- Y
('Y', 'contiene', 'Tipo de radiación electromagnética con longitud de onda entre el ultravioleta y los rayos gamma, usada en medicina', 'rayos', 'fisica', 'bachillerato', '{2}', 2),

-- Z
('Z', 'contiene', 'Número que indica la cantidad de protones en el núcleo de un átomo y define el elemento químico', 'atomico', 'fisica', 'bachillerato', '{2}', 1),


-- ============================================================
-- 5. QUIMICA — BACHILLERATO 2 (75 preguntas)
--    Equilibrio químico, ácido-base, redox, pilas/electrólisis,
--    termodinámica, cinética, orgánica, isomería, polímeros
-- ============================================================

-- A
('A', 'empieza', 'Sustancia que en disolución acuosa libera iones hidrógeno o protones según la teoría de Arrhenius', 'acido', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Grupo funcional formado por un carbonilo unido a un hidrógeno, presente en el metanal y el etanal', 'aldehido', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Hidrocarburo aromático de seis carbonos con tres dobles enlaces conjugados en un anillo', 'aromatico', 'quimica', 'bachillerato', '{2}', 2),

-- B
('B', 'empieza', 'Sustancia que en disolución acuosa libera iones hidróxido según la teoría de Arrhenius', 'base', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Disolución reguladora que mantiene el pH prácticamente constante al añadir pequeñas cantidades de ácido o base', 'buffer', 'quimica', 'bachillerato', '{2}', 2),

-- C
('C', 'empieza', 'Sustancia que aumenta la velocidad de una reacción sin consumirse en ella, disminuyendo la energía de activación', 'catalizador', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Rama de la química que estudia la velocidad de las reacciones y los factores que la afectan', 'cinetica', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Electrodo de una pila donde se produce la reducción, ganando electrones la especie química', 'catodo', 'quimica', 'bachillerato', '{2}', 2),

-- D
('D', 'empieza', 'Proceso electroquímico que utiliza corriente eléctrica para provocar una reacción redox no espontánea', 'descomposicion', 'quimica', 'bachillerato', '{2}', 2),

-- E
('E', 'empieza', 'Situación en la que las velocidades de reacción directa e inversa son iguales y las concentraciones no varían', 'equilibrio', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Proceso electroquímico que descompone sustancias mediante corriente eléctrica', 'electrolisis', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Magnitud termodinámica que mide el desorden o el número de microestados accesibles de un sistema', 'entropia', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Grupo funcional que resulta de la unión de dos cadenas carbonadas a través de un átomo de oxígeno', 'eter', 'quimica', 'bachillerato', '{2}', 2),

-- F
('F', 'empieza', 'Ley de Faraday: la masa depositada en un electrodo es proporcional a la carga eléctrica total que circula', 'faraday', 'quimica', 'bachillerato', '{2}', 2),

-- G
('G', 'empieza', 'Energía libre que determina la espontaneidad de un proceso a presión y temperatura constantes', 'gibbs', 'quimica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Compuesto orgánico en el que un grupo hidroxilo está unido a un carbono saturado', 'glicol', 'quimica', 'bachillerato', '{2}', 3),

-- H
('H', 'empieza', 'Compuesto orgánico formado exclusivamente por átomos de carbono e hidrógeno', 'hidrocarburo', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Reacción química de un compuesto con agua que produce iones ácidos o básicos en disolución', 'hidrolisis', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Ley que establece que el calor de una reacción depende solo de los estados inicial y final, no del camino', 'hess', 'quimica', 'bachillerato', '{2}', 2),

-- I
('I', 'empieza', 'Propiedad de compuestos con misma fórmula molecular pero distinta disposición espacial de sus átomos', 'isomeria', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Magnitud que mide la concentración de iones hidronio, cuyo valor neutro es 7 en escala logarítmica negativa', 'indicador', 'quimica', 'bachillerato', '{2}', 1),

-- J
('J', 'contiene', 'Variación de la energía interna de un sistema termodinámico cuando intercambia energía con el entorno', 'trabajo', 'quimica', 'bachillerato', '{2}', 2),

-- K
('K', 'contiene', 'Hidrocarburo con un grupo funcional carbonilo unido a dos cadenas carbonadas', 'cetona', 'quimica', 'bachillerato', '{2}', 1),

-- L
('L', 'empieza', 'Principio que establece que si se perturba un sistema en equilibrio, este evoluciona para contrarrestar el cambio', 'lechatelier', 'quimica', 'bachillerato', '{2}', 1),

-- M
('M', 'empieza', 'Unidad de concentración que expresa moles de soluto por litro de disolución', 'molaridad', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Macromolécula formada por la unión repetida de unidades más pequeñas llamadas monómeros', 'macromolecula', 'quimica', 'bachillerato', '{2}', 2),

-- N
('N', 'empieza', 'Ecuación de Nernst: permite calcular el potencial de un electrodo en condiciones no estándar', 'nernst', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Reacción de un ácido con una base que produce sal y agua', 'neutralizacion', 'quimica', 'bachillerato', '{2}', 1),

-- Ñ
('Ñ', 'contiene', 'Tipo de enlace donde los electrones se comparten entre dos átomos no metálicos', 'companero', 'quimica', 'bachillerato', '{2}', 3),

-- O
('O', 'empieza', 'Reacción en la que una especie química pierde electrones, aumentando su número de oxidación', 'oxidacion', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Rama de la química que estudia los compuestos del carbono y sus reacciones', 'organica', 'quimica', 'bachillerato', '{2}', 1),

-- P
('P', 'empieza', 'Dispositivo electroquímico que convierte energía química en eléctrica mediante reacciones redox espontáneas', 'pila', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Macromolécula formada por la unión repetida de moléculas pequeñas iguales llamadas monómeros', 'polimero', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Escala logarítmica que mide la acidez o basicidad de una disolución, con valores de 0 a 14', 'ph', 'quimica', 'bachillerato', '{2}', 1),

-- Q
('Q', 'empieza', 'Cociente de reacción que compara las concentraciones actuales con las del equilibrio para predecir el sentido de evolución', 'quociente', 'quimica', 'bachillerato', '{2}', 2),

-- R
('R', 'empieza', 'Reacción de transferencia de electrones entre dos especies químicas, donde una se oxida y otra se reduce', 'redox', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Ganancia de electrones por parte de una especie química, disminuyendo su número de oxidación', 'reduccion', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Velocidad a la que los reactivos se transforman en productos, medida como cambio de concentración por unidad de tiempo', 'rapidez', 'quimica', 'bachillerato', '{2}', 2),

-- S
('S', 'empieza', 'Compuesto iónico que resulta de la reacción entre un ácido y una base', 'sal', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Proceso termodinámico que ocurre sin necesidad de aporte externo de energía', 'espontaneo', 'quimica', 'bachillerato', '{2}', 2),

-- T
('T', 'empieza', 'Rama de la química que estudia los intercambios de energía en las reacciones y los criterios de espontaneidad', 'termodinamica', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Técnica analítica que determina la concentración de una sustancia añadiendo gota a gota un reactivo de concentración conocida', 'titulacion', 'quimica', 'bachillerato', '{2}', 2),

-- U
('U', 'contiene', 'Compuesto orgánico nitrogenado con un doble enlace carbono-nitrógeno, llamado también base de Schiff', 'imina', 'quimica', 'bachillerato', '{2}', 3),

-- V
('V', 'empieza', 'Magnitud que se mide en voltios y representa la diferencia de potencial eléctrico en una pila', 'voltaje', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Rapidez con la que cambia la concentración de reactivos o productos por unidad de tiempo en una reacción', 'velocidad', 'quimica', 'bachillerato', '{2}', 1),

-- X
('X', 'contiene', 'Reacción orgánica en la que un átomo o grupo de átomos de una molécula es reemplazado por otro diferente', 'sustitucion', 'quimica', 'bachillerato', '{2}', 2),

-- Y
('Y', 'contiene', 'Tipo de reacción de polimerización en la que los monómeros se unen formando un enlace y liberando una molécula pequeña', 'condensacion', 'quimica', 'bachillerato', '{2}', 3),

-- Z
('Z', 'contiene', 'Tipo de isomería espacial en la que dos isómeros difieren por la disposición de los sustituyentes respecto a un doble enlace', 'isomerizacion', 'quimica', 'bachillerato', '{2}', 2),

-- ============================================================
-- PREGUNTAS ADICIONALES PARA COMPLETAR 75 POR ASIGNATURA
-- ============================================================

-- === MATEMATICAS BACH 1 — ADICIONALES (29 más) ===
('A', 'empieza', 'Propiedad de una función que presenta la misma forma si se refleja respecto al eje Y: f(x)=f(-x)', 'antisimetrica', 'matematicas', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Identidad trigonométrica fundamental que establece que sen²x + cos²x es siempre igual a la unidad', 'basica', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Curva plana definida como el lugar geométrico de los puntos equidistantes de un centro', 'circunferencia', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Valor numérico obtenido al aplicar una fórmula que identifica si un sistema de segundo grado tiene soluciones reales: b²-4ac', 'discriminante', 'matematicas', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Curva cónica con dos focos en la que la suma de distancias desde cualquier punto a ambos focos es constante', 'elipse', 'matematicas', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Desarrollo del binomio de Newton que genera los coeficientes binomiales de cada término', 'formula', 'matematicas', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Tipo de progresión en la que cada término se obtiene multiplicando el anterior por una razón constante', 'geometrica', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Función trigonométrica del seno hiperbólico, definida como (e^x - e^{-x})/2', 'hiperbolico', 'matematicas', 'bachillerato', '{1}', 3),
('I', 'empieza', 'Valor que no pertenece al dominio de una función porque provoca una división entre cero o una raíz negativa', 'indeterminacion', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'contiene', 'Propiedad de dos conjuntos que no comparten ningún elemento entre sí', 'disjuntos', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Recta que pasa por dos puntos de una curva y cuya pendiente se aproxima a la de la tangente al acercar los puntos', 'secante', 'matematicas', 'bachillerato', '{1}', 3),
('M', 'empieza', 'Punto de una función donde cambia la concavidad, es decir, donde la segunda derivada se anula y cambia de signo', 'minimo', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Recta perpendicular a la tangente de una curva en un punto dado', 'normal', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Par de números reales que identifican un punto en el plano cartesiano', 'ordenada', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Expresión algebraica formada por la suma de términos con coeficientes y variables elevadas a exponentes enteros no negativos', 'polinomio', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Operación inversa de la potenciación que extrae la base conocido el resultado y el exponente', 'radicacion', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Tipo de progresión en la que la diferencia entre términos consecutivos es constante', 'sucesion', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Triángulo numérico que muestra los coeficientes binomiales, donde cada número es la suma de los dos superiores', 'tartaglia', 'matematicas', 'bachillerato', '{1}', 2),
('U', 'contiene', 'Función definida a trozos que asigna a cada número real el mayor entero menor o igual que él', 'truncamiento', 'matematicas', 'bachillerato', '{1}', 3),
('V', 'empieza', 'Número que resulta de sustituir la variable en una función por un valor concreto', 'valor', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Eje horizontal del plano cartesiano donde se representan los valores de la variable independiente', 'abscisa', 'matematicas', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Propiedad de una función que no puede tomar valores por debajo de cierta cota en todo su dominio', 'acotamiento', 'matematicas', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Valor de x en el que una función polinómica se anula, también llamado cero del polinomio', 'raiz', 'matematicas', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Unidad angular que equivale a la milésima parte de un radián, usada en topografía', 'becquerelia', 'matematicas', 'bachillerato', '{1}', 3),
('D', 'empieza', 'Regla de derivación que establece que la derivada de un producto de funciones es u·v'' + u''·v', 'derivacion', 'matematicas', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Operación entre conjuntos cuyo resultado contiene solo los elementos de A que no están en B', 'subconjunto', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Tabla de valores de verdad que muestra las identidades trigonométricas fundamentales para ángulos notables', 'trigonometria', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Punto que divide un segmento en una razón dada, generalización del punto medio', 'centroide', 'matematicas', 'bachillerato', '{1}', 3),
('E', 'empieza', 'Número que indica cuántas veces se multiplica la base por sí misma en una potencia', 'exponente', 'matematicas', 'bachillerato', '{1}', 1),

-- === MATEMATICAS BACH 2 — ADICIONALES (28 más) ===
('A', 'empieza', 'Propiedad que tiene una integral definida cuando los límites superior e inferior coinciden, siendo su valor cero', 'anulacion', 'matematicas', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Propiedad de un estimador estadístico que presenta una diferencia sistemática respecto al verdadero parámetro', 'sesgo', 'matematicas', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Grado de seguridad con que un intervalo contiene el parámetro poblacional, expresado como porcentaje', 'confianza', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Función estadística que asigna probabilidades a cada valor posible de una variable aleatoria', 'distribucion', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Descomposición de una fracción racional en suma de fracciones con denominadores más simples para integrar', 'fracciones', 'matematicas', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Método de eliminación para resolver sistemas de ecuaciones lineales reduciendo la matriz a forma escalonada', 'gauss', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Plano que divide el espacio en dos semiespacios, definido por una ecuación lineal ax+by+cz=d', 'hiperespacio', 'matematicas', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Sistema de ecuaciones que no tiene ninguna solución porque las ecuaciones son contradictorias', 'incompatible', 'matematicas', 'bachillerato', '{2}', 1),
('J', 'contiene', 'Conjunto de restricciones que definen la región factible de un problema de optimización lineal', 'conjugado', 'matematicas', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Teorema que establece que la distribución muestral de la media se aproxima a una normal cuando n es grande', 'central', 'matematicas', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Método de integración por partes que establece que la integral de u·dv es uv menos la integral de v·du', 'leibniz', 'matematicas', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Valor para el cual una distribución de probabilidad alcanza su máximo', 'moda', 'matematicas', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Nivel de significación en un contraste de hipótesis, probabilidad de rechazar la hipótesis nula siendo cierta', 'nivel', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Proceso de encontrar el máximo o mínimo de una función objetivo sujeta a restricciones lineales', 'optimizacion', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Valor de probabilidad que se compara con el nivel de significación para decidir sobre la hipótesis nula', 'pvalor', 'matematicas', 'bachillerato', '{2}', 3),
('R', 'empieza', 'Diferencia entre los valores máximo y mínimo de un conjunto de datos estadísticos', 'recorrido', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Subconjunto del espacio muestral al que se le puede asignar una probabilidad', 'suceso', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Operación que convierte una matriz intercambiando sus filas por columnas', 'traspuesta', 'matematicas', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Propiedad de una función continua que establece que toma todos los valores intermedios entre f(a) y f(b)', 'bolzano', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Punto extremo de la región factible donde se evalúa la función objetivo en programación lineal', 'vertice', 'matematicas', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Criterio de Rouché-Frobenius para clasificar un sistema de ecuaciones según los rangos de sus matrices', 'auxiliar', 'matematicas', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Propiedad de la matriz identidad por la cual al multiplicarla por cualquier matriz, el resultado no cambia', 'identidad', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Variable tipificada que sigue la distribución normal estándar con media cero y desviación uno', 'tipificacion', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Técnica de integración que deshace la regla de la cadena para simplificar integrales compuestas', 'antiderivacion', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Forma reducida de una matriz tras aplicar operaciones elementales por filas hasta obtener ceros debajo de la diagonal', 'escalonada', 'matematicas', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Distribución discreta que modela el número de eventos en un intervalo de tiempo cuando estos ocurren con tasa constante', 'poisson', 'matematicas', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Conjunto de todas las posibles muestras de tamaño n que se pueden extraer de una población', 'muestreo', 'matematicas', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Diferencial de una función, incremento infinitesimal que aproxima el cambio de la función para variaciones pequeñas de x', 'diferencial', 'matematicas', 'bachillerato', '{2}', 2),

-- === FISICA BACH 1 — ADICIONALES (27 más) ===
('A', 'empieza', 'Magnitud física que indica la velocidad angular por unidad de tiempo en un movimiento circular', 'angular', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Punto de la trayectoria de un proyectil donde alcanza la altura máxima y la componente vertical de la velocidad es cero', 'balistico', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Capacidad de un cuerpo para almacenar energía potencial elástica al deformarse, regida por la ley de Hooke', 'constante', 'fisica', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Mezcla homogénea líquida en la que el soluto se encuentra disperso a nivel molecular en el disolvente', 'disolucion', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Tipo de enlace químico en el que los átomos comparten pares de electrones', 'enlace', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Proceso por el cual un núcleo pesado se divide en dos más ligeros liberando gran cantidad de energía', 'fision', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Estado de la materia sin forma ni volumen propio, cuyas moléculas se mueven libremente', 'gas', 'fisica', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Ley que relaciona la fuerza de un muelle con su elongación mediante una constante elástica', 'hooke', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Magnitud que mide la resistencia de un cuerpo al cambio en su velocidad angular, dependiente de la distribución de masa', 'inercia', 'fisica', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Unidad de temperatura del SI cuyo cero corresponde a la ausencia total de energía térmica', 'kelvin', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Instrumento de laboratorio que permite medir con precisión volúmenes de líquidos', 'litro', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Modelo científico que representa la estructura de un átomo, como el de Bohr o el de Rutherford', 'modelo', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Número que indica la cantidad de protones en el núcleo de un átomo y define su identidad química', 'numero', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Tabla que organiza los elementos químicos por número atómico creciente en periodos y grupos', 'orbital', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Energía almacenada en un cuerpo debido a su posición en un campo de fuerzas, como la gravitatoria', 'potencial', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Sustancia que se consume durante una reacción química para generar los productos', 'reactivo', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Unidad de tiempo del Sistema Internacional, definida por la frecuencia de radiación del cesio-133', 'segundo', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Magnitud que mide el grado de agitación térmica de las partículas de un cuerpo', 'temperatura', 'fisica', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Magnitud de masa atómica que equivale a la doceava parte de la masa de un átomo de carbono-12', 'uma', 'fisica', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Fuerza de gran alcance que mantiene a los planetas en órbita, proporcional a las masas e inversamente proporcional al cuadrado de la distancia', 'vinculo', 'fisica', 'bachillerato', '{1}', 3),
('X', 'contiene', 'Cantidad máxima de soluto que puede disolverse en un volumen dado de disolvente a cierta temperatura', 'maxima', 'fisica', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Trayectoria curva que describe un objeto lanzado oblicuamente bajo la acción exclusiva de la gravedad', 'parabola', 'fisica', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Fuerza ficticia que aparece en un sistema de referencia rotatorio, dirigida hacia fuera del eje de giro', 'centrifuga', 'fisica', 'bachillerato', '{1}', 2),
('Ñ', 'contiene', 'Magnitud que mide la compactación de materia por unidad de volumen en un cuerpo o sustancia', 'companera', 'fisica', 'bachillerato', '{1}', 3),
('C', 'empieza', 'Tipo de choque en el que se conserva tanto la cantidad de movimiento como la energía cinética total', 'colision', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Principio que afirma que la energía de un sistema aislado permanece constante a lo largo del tiempo', 'conservacion', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Unidad de masa del SI utilizada como patrón fundamental, equivalente a mil gramos', 'pascal', 'fisica', 'bachillerato', '{1}', 1),

-- === FISICA BACH 2 — ADICIONALES (29 más) ===
('A', 'empieza', 'Electrodo donde se produce la oxidación en una celda electroquímica', 'anodo', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Modelo atómico que postula electrones en órbitas estacionarias con niveles de energía cuantizados', 'bohr', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Velocidad máxima en el universo según la relatividad especial, aproximadamente 3×10⁸ m/s', 'celeridad', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Fenómeno relativista por el cual el tiempo transcurre más lentamente para un observador en movimiento rápido', 'dilatacion', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Radiación electromagnética emitida por un cuerpo en función de su temperatura según la ley de Planck', 'espectro', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Fenómeno por el cual la luz arranca electrones de un metal cuando supera la frecuencia umbral', 'fotoelectrico', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Partículas mediadoras de la fuerza electromagnética, sin masa y que viajan a la velocidad de la luz', 'gluon', 'fisica', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Modelo estándar de partículas que incluye quarks, leptones y bosones como constituyentes fundamentales', 'hadron', 'fisica', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Átomos del mismo elemento con distinto número de neutrones y por tanto distinta masa atómica', 'isotopo', 'fisica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Constante de Planck reducida, igual a h/2π, fundamental en la formulación de la mecánica cuántica', 'plank', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Dispositivo que produce luz coherente y monocromática mediante emisión estimulada de radiación', 'laser', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Fuerza que experimenta una carga eléctrica en movimiento dentro de un campo magnético', 'magnetica', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Punto de una onda estacionaria donde la amplitud de vibración es siempre cero', 'nodo', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Fenómeno ondulatorio por el cual dos ondas coherentes producen patrones de máximos y mínimos de intensidad', 'ondulatorio', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Partícula elemental con las mismas propiedades que el electrón pero con carga positiva, antipartícula del electrón', 'positron', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Fenómeno óptico por el cual la luz cambia de dirección al encontrarse con una superficie sin atravesarla', 'reflexion', 'fisica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Propiedad cuántica intrínseca de las partículas elementales, análoga al momento angular pero sin equivalente clásico', 'spin', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Tiempo que tarda un núcleo radiactivo en reducir su masa a la mitad por desintegración', 'transitorio', 'fisica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Radiación electromagnética con frecuencia mayor que la luz visible pero menor que los rayos X', 'ultravioleta', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Punto de una onda estacionaria donde la amplitud de vibración es máxima', 'vientre', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Tipo de radiación electromagnética descubierta por Röntgen, con alta capacidad de penetración en la materia', 'rayosx', 'fisica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Tipo de desintegración radiactiva en la que se emite un electrón desde el núcleo al transformarse un neutrón en protón', 'decaimiento', 'fisica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Fenómeno del efecto Doppler por el cual la luz de galaxias lejanas se desplaza hacia frecuencias más bajas', 'desplazamiento', 'fisica', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Tipo de señal electromagnética cuya información se transmite mediante variaciones de amplitud o frecuencia', 'senal', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Longitud de onda asociada a una partícula según la relación de De Broglie: λ = h/p', 'debroglie', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Relación de Einstein que establece la equivalencia entre masa y energía: E=mc²', 'equivalencia', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Líneas imaginarias que representan la dirección del campo eléctrico en cada punto del espacio', 'flujo', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Fenómeno por el que la longitud de un objeto se reduce en la dirección del movimiento a velocidades relativistas', 'contraccion', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Periodo de semidesintegración: tiempo que tarda en desintegrarse la mitad de los núcleos de una muestra radiactiva', 'periodo', 'fisica', 'bachillerato', '{2}', 1),

-- === QUIMICA BACH 2 — ADICIONALES (27 más) ===
('A', 'empieza', 'Compuesto orgánico con grupo funcional -NH₂ unido a una cadena carbonada', 'amina', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Enlace químico covalente en el que la diferencia de electronegatividad entre los átomos es muy pequeña', 'benceno', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Compuesto orgánico con doble enlace carbono-oxígeno, grupo funcional presente en aldehídos y cetonas', 'carbonilo', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Diferencia de electronegatividad entre átomos que determina la polaridad de un enlace covalente', 'dipolo', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Compuesto orgánico formado por la reacción de un ácido carboxílico con un alcohol, liberando agua', 'ester', 'quimica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Propiedad de los átomos de carbono de formar cadenas lineales, ramificadas y cíclicas en química orgánica', 'funcional', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Variación de energía libre que determina si un proceso químico es o no espontáneo a P y T constantes', 'gibbs', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Variación de energía que acompaña a una reacción química a presión constante, medida en kJ/mol', 'entalpia', 'quimica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Constante de ionización de un ácido débil que mide su tendencia a ceder protones en disolución acuosa', 'ionizacion', 'quimica', 'bachillerato', '{2}', 2),
('J', 'contiene', 'Tipo de electrólisis en la que se descompone una sal fundida para obtener el metal puro', 'electrolitica', 'quimica', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Expresión matemática que relaciona las concentraciones de productos y reactivos en el equilibrio químico', 'equilibrio', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Partícula elemental ligera como el electrón o el neutrino, que no experimenta la fuerza nuclear fuerte', 'lepton', 'quimica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Unidad repetitiva más pequeña que forma un polímero al unirse sucesivamente con otras iguales', 'monomero', 'quimica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Número de oxidación que indica la carga formal de un átomo en un compuesto, usado para ajustar redox', 'nox', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Agente que provoca la pérdida de electrones en otra sustancia durante una reacción redox', 'oxidante', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Tipo de polímero formado por la unión directa de monómeros sin pérdida de átomos, como el polietileno', 'poliadicion', 'quimica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Agente que provoca la ganancia de electrones en otra sustancia durante una reacción redox', 'reductor', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Reacción orgánica en la que un átomo de hidrógeno del benceno es reemplazado por otro grupo', 'sustitucion', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Primer principio: la energía interna de un sistema cambia por el calor absorbido menos el trabajo realizado', 'termodinamica', 'quimica', 'bachillerato', '{2}', 1),
('U', 'contiene', 'Disolvente universal capaz de disolver gran cantidad de sustancias polares debido a su elevada constante dieléctrica', 'agua', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Diferencia de potencial eléctrico entre los electrodos de una pila, medida en voltios', 'voltaje', 'quimica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Reacción en la que un compuesto orgánico insaturado incorpora hidrógeno, oxígeno u otro reactivo al doble enlace', 'adicion', 'quimica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Ley de velocidad que expresa la rapidez de reacción como producto de una constante por las concentraciones elevadas a ciertos exponentes', 'ley', 'quimica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Proceso de ajuste de ecuaciones redox que iguala los electrones ganados y perdidos para conservar la carga', 'balanceo', 'quimica', 'bachillerato', '{2}', 2),
('Ñ', 'contiene', 'Tipo de compuesto orgánico que contiene nitrógeno unido a un grupo carbonilo, formando el enlace peptídico', 'amida', 'quimica', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Principio que establece que el producto de las concentraciones de H⁺ y OH⁻ en agua es siempre 10⁻¹⁴ a 25°C', 'constante', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Electrodo de una pila donde se produce la oxidación, perdiendo electrones la especie química', 'anodo', 'quimica', 'bachillerato', '{2}', 1);

