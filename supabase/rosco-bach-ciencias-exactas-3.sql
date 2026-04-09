-- Rosco Bachillerato Ciencias Exactas - Lote 3 (750 preguntas adicionales)
-- subject_id: matematicas (grades {1} y {2}), fisica (grades {1} y {2}), quimica (grades {2})

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- ============================================================
-- MATEMATICAS 1º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Propiedad de una operación binaria donde el resultado no depende del modo de agrupar los elementos', 'asociativa', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Valor numérico que se obtiene al eliminar el signo negativo de cualquier número real', 'absoluto', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Línea recta a la que una curva se aproxima indefinidamente sin llegar a tocarla', 'asintota', 'matematicas', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Argumento de un número complejo expresado en radianes respecto al eje real positivo', 'argumento', 'matematicas', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Elemento neutro de la suma en un grupo abeliano de números reales', 'aditivo', 'matematicas', 'bachillerato', '{1}', 2),
('A', 'empieza', 'Tipo de sucesión donde cada término se obtiene sumando una cantidad fija al anterior', 'aritmetica', 'matematicas', 'bachillerato', '{1}', 1),

-- B (6)
('B', 'empieza', 'Forma de expresar un número complejo como suma de parte real e imaginaria usando la unidad i', 'binomica', 'matematicas', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Resultado de una operación entre dos conjuntos que devuelve la resta simétrica o diferencia', 'binaria', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Función que solo toma dos valores posibles, verdadero o falso, en lógica proposicional', 'booleana', 'matematicas', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Propiedad de una función que está acotada tanto superior como inferiormente en su dominio', 'boundedness', 'matematicas', 'bachillerato', '{1}', 3),
('B', 'empieza', 'En una función a trozos, cada intervalo en que se define la función se llama así', 'bifurcacion', 'matematicas', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Desarrollo en serie de potencias de la función (1+x)^n para exponente real cualquiera', 'binomio', 'matematicas', 'bachillerato', '{1}', 1),

-- C (7)
('C', 'empieza', 'Propiedad de una serie cuya suma parcial tiende a un límite finito cuando n tiende a infinito', 'convergencia', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Curvas de segundo grado obtenidas al cortar un cono con un plano: elipse, hipérbola o parábola', 'conicas', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Operación que consiste en aplicar una función al resultado de otra, f(g(x))', 'composicion', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Número de la forma a+bi donde a y b son reales e i es la unidad imaginaria', 'complejo', 'matematicas', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Test que compara el término general de una serie con el de otra serie conocida para determinar convergencia', 'comparacion', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Elemento que en una función racional hace cero el denominador y excluye puntos del dominio', 'cancelacion', 'matematicas', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Criterio de convergencia que usa el cociente entre términos consecutivos de una serie', 'cociente', 'matematicas', 'bachillerato', '{1}', 2),

-- D (6)
('D', 'empieza', 'Conjunto de valores de la variable independiente para los que una función está definida', 'dominio', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Recta fija asociada a una cónica que permite definirla por su relación con el foco', 'directriz', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Propiedad de una serie cuyas sumas parciales crecen sin límite', 'divergencia', 'matematicas', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Valor que se obtiene al restar los extremos de un intervalo cerrado en el eje real', 'diametro', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Descomposición de una fracción algebraica en suma de fracciones con denominador más simple', 'descomposicion', 'matematicas', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Tipo de discontinuidad donde los límites laterales existen pero son distintos', 'discontinuidad', 'matematicas', 'bachillerato', '{1}', 1),

-- E (7)
('E', 'empieza', 'Razón entre la distancia al foco y la distancia a la directriz en una cónica', 'excentricidad', 'matematicas', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Número irracional base del logaritmo neperiano, aproximadamente 2,718', 'euler', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Cónica cerrada cuya excentricidad es menor que uno, con dos focos interiores', 'elipse', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Desigualdad estricta o no estricta entre dos expresiones algebraicas con una incógnita', 'ecuacion', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Conjunto de valores de la variable dependiente, también llamado rango o imagen de la función', 'recorrido', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Forma de una función exponencial donde la base es el número e', 'exponencial', 'matematicas', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Propiedad de una función cuyo valor en cualquier punto del intervalo queda entre el supremo y el ínfimo', 'extremo', 'matematicas', 'bachillerato', '{1}', 2),

-- F (6)
('F', 'empieza', 'Cada uno de los dos puntos fijos que definen una elipse o una hipérbola', 'foco', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Expresión de un complejo como r(cos θ + i sen θ) usando módulo y argumento', 'fasorial', 'matematicas', 'bachillerato', '{1}', 3),
('F', 'empieza', 'Operador que a cada elemento de un dominio le asigna exactamente un elemento del codominio', 'funcion', 'matematicas', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Serie cuya suma se puede calcular con una fórmula cerrada por ser cociente de una progresión geométrica', 'finita', 'matematicas', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Propiedad de un número complejo cuyas n-ésimas potencias vuelven a la unidad', 'fundamental', 'matematicas', 'bachillerato', '{1}', 3),
('F', 'empieza', 'Representación de un número racional como cociente de dos enteros', 'fraccion', 'matematicas', 'bachillerato', '{1}', 1),

-- G (6)
('G', 'empieza', 'Tipo de sucesión donde cada término se obtiene multiplicando el anterior por una razón constante', 'geometrica', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Representación visual de una función mediante una curva en el plano cartesiano', 'grafica', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Pendiente de la recta tangente a una curva en un punto dado', 'gradiente', 'matematicas', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Giro de un ángulo completo en el plano complejo representado por multiplicar por una raíz de la unidad', 'giro', 'matematicas', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Transformación que conserva las distancias y los ángulos en el plano', 'grado', 'matematicas', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Estructura algebraica con una operación que cumple asociatividad, elemento neutro e inverso', 'grupo', 'matematicas', 'bachillerato', '{1}', 3),

-- H (6)
('H', 'empieza', 'Cónica abierta de dos ramas cuya excentricidad es mayor que uno', 'hiperbola', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Regla que permite calcular el límite de un cociente indeterminado derivando numerador y denominador', 'hopital', 'matematicas', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Función trigonométrica inversa del seno, también llamada seno hiperbólico en otro contexto', 'hiperbolico', 'matematicas', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Valor de la función en un punto dado, resultado de sustituir la variable por ese número', 'hallar', 'matematicas', 'bachillerato', '{1}', 1),
('H', 'empieza', 'Propiedad de una ecuación que se mantiene invariante al multiplicar ambos miembros por un escalar', 'homogenea', 'matematicas', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Recta perpendicular al eje real que pasa por un foco de la hipérbola', 'hipotenusa', 'matematicas', 'bachillerato', '{1}', 1),

-- I (6)
('I', 'empieza', 'Conjunto de valores que toma la variable dependiente, sinónimo de recorrido', 'imagen', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Desigualdad algebraica entre expresiones que contiene al menos una incógnita', 'inecuacion', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Función que deshace la acción de otra, de forma que su composición da la identidad', 'inversa', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Unidad imaginaria definida como la raíz cuadrada de menos uno', 'imaginaria', 'matematicas', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Expresión del tipo 0/0 o infinito/infinito al evaluar un límite, que requiere técnicas adicionales', 'indeterminacion', 'matematicas', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Propiedad de una función que crece al aumentar la variable independiente en un intervalo', 'inyectiva', 'matematicas', 'bachillerato', '{1}', 2),

-- J (5)
('J', 'empieza', 'Nombre coloquial del conjunto que reúne los valores que cumplen varias inecuaciones simultáneas', 'junto', 'matematicas', 'bachillerato', '{1}', 1),
('J', 'empieza', 'En geometría analítica, sistema de ejes que forman ángulos distintos de 90 grados', 'jerarquia', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Regla que establece el orden en que deben realizarse las operaciones aritméticas', 'jerarquizacion', 'matematicas', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Unión de dos conjuntos disjuntos cuya intersección es vacía', 'juntura', 'matematicas', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Punto de una función a trozos donde se unen dos expresiones distintas', 'junta', 'matematicas', 'bachillerato', '{1}', 2),

-- K (5)
('K', 'contiene', 'Espacio vectorial sobre el cuerpo de los reales donde se definen las cónicas y las funciones', 'euclideo', 'matematicas', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Tipo de fórmula que expresa el enésimo término de una sucesión sin referencia a términos previos', 'eksplicita', 'matematicas', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Famoso problema no resuelto sobre la función zeta que involucra ceros no triviales complejos', 'riemann', 'matematicas', 'bachillerato', '{1}', 3),
('K', 'contiene', 'Resultado que garantiza la existencia de un cero de una función continua que cambia de signo en un intervalo', 'bolzano', 'matematicas', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Método para hallar las raíces de la unidad de orden n usando la fórmula exponencial compleja', 'asks', 'matematicas', 'bachillerato', '{1}', 3),

-- L (6)
('L', 'empieza', 'Valor al que tiende una función o sucesión cuando la variable se aproxima a un punto o al infinito', 'limite', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Teorema que afirma que una función continua en [a,b] y derivable en (a,b) tiene un punto donde la derivada iguala la pendiente de la secante', 'lagrange', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Función cuya gráfica es una recta, de la forma f(x) = mx + n', 'lineal', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Función inversa de la exponencial, que transforma productos en sumas', 'logaritmo', 'matematicas', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Valor que se acerca la función por el lado izquierdo de un punto', 'lateral', 'matematicas', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Lugar geométrico de todos los puntos equidistantes de un foco y una directriz', 'lugar', 'matematicas', 'bachillerato', '{1}', 2),

-- M (6)
('M', 'empieza', 'Distancia desde el origen al punto que representa un número complejo en el plano', 'modulo', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Valor máximo o mínimo relativo de una función en un entorno de un punto', 'maximo', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Función que es a la vez inyectiva y no sobreyectiva sobre cierto codominio', 'monomorfismo', 'matematicas', 'bachillerato', '{1}', 3),
('M', 'empieza', 'Propiedad de una sucesión cuyos términos no decrecen nunca', 'monotona', 'matematicas', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Punto de una función donde la derivada se anula o no existe', 'minimo', 'matematicas', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Método para resolver inecuaciones que consiste en analizar el signo en cada intervalo', 'metodo', 'matematicas', 'bachillerato', '{1}', 2),

-- N (6)
('N', 'empieza', 'Logaritmo de base e, también llamado logaritmo natural', 'neperiano', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Propiedad de una sucesión cuyo límite es cero cuando n tiende a infinito', 'nula', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Cantidad de raíces que tiene una ecuación polinómica según el teorema fundamental del álgebra', 'numero', 'matematicas', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Criterio necesario de convergencia: si la serie converge, el término general tiende a cero', 'necesario', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Forma de la fórmula de De Moivre para calcular potencias de números complejos', 'natural', 'matematicas', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Recta perpendicular a la tangente en el punto de tangencia de una curva', 'normal', 'matematicas', 'bachillerato', '{1}', 2),

-- O (6)
('O', 'empieza', 'Punto del plano donde se cruzan los ejes de coordenadas, con valor (0,0)', 'origen', 'matematicas', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Propiedad de funciones cuya gráfica tiene simetría respecto al eje Y o al origen', 'ordenada', 'matematicas', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Intervalo que no incluye sus extremos, representado con paréntesis', 'abierto', 'matematicas', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Condición de una serie alternada que exige que los términos decrezcan en valor absoluto para converger', 'oscilante', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Valores de la variable para los que una función se anula completamente', 'optimizacion', 'matematicas', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Ejes perpendiculares entre sí que definen un sistema de coordenadas cartesiano', 'ortogonales', 'matematicas', 'bachillerato', '{1}', 2),

-- P (7)
('P', 'empieza', 'Cónica abierta con un solo foco cuya excentricidad vale exactamente uno', 'parabola', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Representación de un complejo mediante módulo y ángulo, z = r∠θ', 'polar', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Función definida como suma de términos con potencias enteras no negativas de la variable', 'polinomica', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Propiedad de una función que se repite con un intervalo fijo, como seno o coseno', 'periodica', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Punto donde la función alcanza un valor mayor o menor que todos los de su entorno', 'punto', 'matematicas', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Serie de potencias centrada en un punto donde la función es infinitamente derivable', 'potencias', 'matematicas', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Operación con números complejos que en forma polar multiplica módulos y suma argumentos', 'producto', 'matematicas', 'bachillerato', '{1}', 2),

-- Q (5)
('Q', 'empieza', 'Resultado de dividir dos expresiones algebraicas, también llamado razón', 'quebrado', 'matematicas', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Función polinómica de segundo grado cuya gráfica es una parábola', 'quadratica', 'matematicas', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Punto donde la concavidad de una función cambia de signo', 'quiebre', 'matematicas', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Cada uno de los cuatro sectores en que los ejes dividen el plano cartesiano', 'cuadrante', 'matematicas', 'bachillerato', '{1}', 1),
('Q', 'empieza', 'Quinto de una progresión aritmética que permite interpolar valores intermedios', 'quintil', 'matematicas', 'bachillerato', '{1}', 3),

-- R (6)
('R', 'empieza', 'Conjunto de todos los valores que toma la variable dependiente de una función', 'recorrido', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Criterio que usa la raíz enésima del término general para estudiar la convergencia de una serie', 'raiz', 'matematicas', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Constante que se suma o multiplica en cada paso de una progresión aritmética o geométrica', 'razon', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Soluciones complejas de la ecuación z^n = 1, distribuidas uniformemente en la circunferencia unidad', 'raices', 'matematicas', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Función definida como cociente de dos polinomios', 'racional', 'matematicas', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Intervalo dentro del cual una serie de potencias converge absolutamente', 'radio', 'matematicas', 'bachillerato', '{1}', 2),

-- S (6)
('S', 'empieza', 'Resultado de sumar todos los términos de una sucesión finita o infinita', 'serie', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Lista ordenada de números que sigue una regla o patrón definido', 'sucesion', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Propiedad de una función par respecto al eje de ordenadas', 'simetria', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Menor cota superior de un conjunto de números reales acotado', 'supremo', 'matematicas', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Función trigonométrica que relaciona el cateto opuesto con la hipotenusa', 'seno', 'matematicas', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Resultado parcial obtenido al sumar los n primeros términos de una serie', 'sumatorio', 'matematicas', 'bachillerato', '{1}', 2),

-- T (6)
('T', 'empieza', 'Desarrollo en serie de potencias de una función alrededor de un punto dado', 'taylor', 'matematicas', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Recta que toca a una curva en un solo punto y tiene la misma pendiente que ella allí', 'tangente', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Cada uno de los elementos individuales de una sucesión o serie', 'termino', 'matematicas', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Desarrollo que generaliza el de Taylor cuando el punto central es cero', 'telescopica', 'matematicas', 'bachillerato', '{1}', 3),
('T', 'empieza', 'Función trigonométrica cociente del seno entre el coseno', 'tangencial', 'matematicas', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Proposición matemática demostrada a partir de axiomas y otros teoremas previos', 'teorema', 'matematicas', 'bachillerato', '{1}', 1),

-- U (5)
('U', 'empieza', 'Circunferencia de radio uno centrada en el origen del plano complejo', 'unitaria', 'matematicas', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Operación entre conjuntos que agrupa todos los elementos de ambos', 'union', 'matematicas', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Propiedad de una función que asigna a cada imagen un único elemento del dominio', 'univoca', 'matematicas', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Tipo de convergencia donde la velocidad de aproximación es la misma en todo el dominio', 'uniforme', 'matematicas', 'bachillerato', '{1}', 3),
('U', 'empieza', 'Punto de inflexión de una cónica que está más cerca del foco', 'umbilical', 'matematicas', 'bachillerato', '{1}', 3),

-- V (6)
('V', 'empieza', 'Punto más bajo o más alto de una parábola, donde la función alcanza su extremo', 'vertice', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Expresión con signo que indica en qué dirección y con qué rapidez cambia una magnitud', 'variacion', 'matematicas', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Conjunto de todos los números reales expresable como la unión de racionales e irracionales', 'valores', 'matematicas', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Propiedad de una función cuyo módulo no excede un número fijo dado', 'vinculada', 'matematicas', 'bachillerato', '{1}', 3),
('V', 'empieza', 'Velocidad a la que cambia la función respecto a su variable, es decir, la derivada', 'velocidad', 'matematicas', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Intervalo del eje Y visible en la representación gráfica de una función', 'ventana', 'matematicas', 'bachillerato', '{1}', 1),

-- W (5)
('W', 'contiene', 'Teorema que garantiza que una función continua en un compacto alcanza máximo y mínimo', 'weierstrass', 'matematicas', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Nombre del criterio de convergencia de series que compara con la serie geométrica', 'dalembert', 'matematicas', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Método numérico que aproxima raíces usando la tangente a la curva en un punto', 'newton', 'matematicas', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Fórmula que da las n raíces complejas de un número complejo dado', 'moivre', 'matematicas', 'bachillerato', '{1}', 2),
('W', 'contiene', 'Representación en el plano donde el eje horizontal es la parte real y el vertical la imaginaria', 'argand', 'matematicas', 'bachillerato', '{1}', 2),

-- X (5)
('X', 'contiene', 'Punto donde la gráfica de una función cruza el eje horizontal', 'corteenx', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Valor que hace máxima o mínima una función, hallado igualando la derivada a cero', 'extremos', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Operación que eleva un número a una potencia dada', 'exponente', 'matematicas', 'bachillerato', '{1}', 1),
('X', 'contiene', 'Desarrollo en serie de una función alrededor de x = 0, caso particular de Taylor', 'maclaurin', 'matematicas', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Propiedad de funciones que cumplen f(x) = f(-x) para todo x de su dominio', 'simetriaxial', 'matematicas', 'bachillerato', '{1}', 2),

-- Y (5)
('Y', 'contiene', 'Función que asigna a cada elemento del dominio uno y solo un elemento del codominio', 'biyectiva', 'matematicas', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Función que alcanza todos los valores de su codominio, también llamada epiyectiva', 'suryectiva', 'matematicas', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Propiedad de una función que no repite valores, cada imagen proviene de un solo elemento', 'inyectividad', 'matematicas', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Operación trigonométrica cuya inversa se llama arco tangente', 'tangentey', 'matematicas', 'bachillerato', '{1}', 3),
('Y', 'contiene', 'Eje vertical del plano cartesiano que representa la variable dependiente', 'eyevertical', 'matematicas', 'bachillerato', '{1}', 1),

-- Z (5)
('Z', 'contiene', 'Valor de la variable para el que una función se anula, es decir, f(x) = 0', 'raizreal', 'matematicas', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Cada solución de una ecuación polinómica donde el polinomio vale cero', 'ceropolinomio', 'matematicas', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Punto del plano complejo correspondiente a un número imaginario puro', 'imaginarioimpureza', 'matematicas', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Criterio que establece que si el término general no tiende a cero, la serie diverge', 'divergenz', 'matematicas', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Método para localizar raíces de una función continua dividiendo intervalos por la mitad', 'bisectriz', 'matematicas', 'bachillerato', '{1}', 2),

-- ============================================================
-- MATEMATICAS 2º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Valor propio de una matriz que satisface la ecuación det(A - λI) = 0', 'autovalor', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Vector no nulo que al ser multiplicado por una matriz da un múltiplo escalar de sí mismo', 'autovector', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Técnica de integración que reemplaza la variable original por otra más sencilla', 'sustitucion', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Propiedad de una serie que converge incluso si se toman valores absolutos de sus términos', 'absoluta', 'matematicas', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Espacio formado por vectores con las operaciones de suma y producto por escalar', 'vectorial', 'matematicas', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Conjunto de vectores mutuamente perpendiculares y de norma uno que forman una base', 'ortonormal', 'matematicas', 'bachillerato', '{2}', 2),

-- B (6)
('B', 'empieza', 'Conjunto mínimo de vectores linealmente independientes que genera todo un espacio vectorial', 'base', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Teorema que relaciona la probabilidad condicional inversa con la directa usando probabilidades a priori', 'bayes', 'matematicas', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Variable aleatoria discreta con solo dos resultados posibles: éxito o fracaso', 'bernoulli', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Distribución discreta que cuenta el número de éxitos en n ensayos independientes', 'binomial', 'matematicas', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Propiedad de una integral impropia cuyo valor es finito', 'boundedness', 'matematicas', 'bachillerato', '{2}', 3),
('B', 'empieza', 'Cada una de las franjas que definen los valores de un intervalo de confianza', 'banda', 'matematicas', 'bachillerato', '{2}', 2),

-- C (7)
('C', 'empieza', 'Coeficiente que mide la relación lineal entre dos variables, con valores entre -1 y 1', 'correlacion', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Valor estadístico que se compara con el valor crítico en un test de hipótesis con tablas de frecuencia', 'chicuadrado', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Rango de valores que con cierta probabilidad contiene al verdadero parámetro poblacional', 'confianza', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Sistema de referencia que usa un ángulo y una distancia al origen en lugar de coordenadas x, y', 'coordenadas', 'matematicas', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Determinante de la matriz que resulta al eliminar una fila y una columna de la original', 'cofactor', 'matematicas', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Técnica de integración que usa la relación inversa entre derivar un producto y multiplicar', 'ciclica', 'matematicas', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Curva descrita por ecuaciones que expresan x e y en función de un parámetro t', 'curva', 'matematicas', 'bachillerato', '{2}', 2),

-- D (6)
('D', 'empieza', 'Número asociado a una matriz cuadrada que indica si es inversible o no', 'determinante', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Propiedad de una serie cuyas sumas parciales no tienen límite finito', 'divergente', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Número de vectores de una base de un espacio vectorial', 'dimension', 'matematicas', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Descomposición de una fracción racional en suma de fracciones con denominadores irreducibles', 'descomposicion', 'matematicas', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Prueba estadística que establece si el ajuste de un modelo a los datos es significativo', 'discrepancia', 'matematicas', 'bachillerato', '{2}', 3),
('D', 'empieza', 'Función de distribución que asigna a cada valor la probabilidad acumulada hasta ese punto', 'distribucion', 'matematicas', 'bachillerato', '{2}', 1),

-- E (7)
('E', 'empieza', 'Conjunto algebraico cerrado bajo la suma de vectores y el producto por escalares', 'espacio', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Curva cuyas coordenadas x e y se expresan en función de un parámetro t independiente', 'ecuacion', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Valor esperado de una variable aleatoria, equivalente a la media ponderada por probabilidades', 'esperanza', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Raíz cuadrada de la varianza que mide la dispersión de una variable aleatoria', 'estandar', 'matematicas', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Operaciones elementales de fila que transforman una matriz en su forma escalonada', 'escalonamiento', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Error máximo tolerable en una estimación estadística, mitad de la amplitud del intervalo de confianza', 'error', 'matematicas', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Tipo de integral donde al menos uno de los límites es infinito o el integrando tiene una singularidad', 'impropia', 'matematicas', 'bachillerato', '{2}', 2),

-- F (6)
('F', 'empieza', 'Método para descomponer un integrando racional en suma de fracciones simples', 'fracciones', 'matematicas', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Distribución de probabilidad continua simétrica con forma de campana', 'frecuencia', 'matematicas', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Constante de la ley de gravitación que relaciona el producto de masas entre la distancia al cuadrado', 'factor', 'matematicas', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Resultado del test que compara la varianza entre grupos con la varianza dentro de grupos', 'fisher', 'matematicas', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Forma canónica de Jordan de una matriz que facilita el cálculo de potencias y exponenciales', 'forma', 'matematicas', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Valor de verdad de una hipótesis estadística que se contrasta con datos muestrales', 'fiabilidad', 'matematicas', 'bachillerato', '{2}', 2),

-- G (6)
('G', 'empieza', 'Método de eliminación de Gauss-Jordan para resolver sistemas y hallar la inversa de matrices', 'gauss', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Número de libertad que tiene un sistema estadístico, ligado al tamaño de la muestra', 'grados', 'matematicas', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Representación visual de los datos de regresión como nube de puntos', 'grafico', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Curva en coordenadas polares que gira alrededor del polo formando una espiral', 'giro', 'matematicas', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Transformación del plano que conserva ángulos y proporciones entre distancias', 'geometrica', 'matematicas', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Método que opera por filas para reducir una matriz aumentada hasta la solución del sistema', 'gaussiana', 'matematicas', 'bachillerato', '{2}', 2),

-- H (6)
('H', 'empieza', 'Afirmación que se plantea sobre un parámetro poblacional y se somete a contraste estadístico', 'hipotesis', 'matematicas', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Subespacio propio de un espacio vectorial formado por los vectores que cumplen una ecuación lineal', 'hiperplano', 'matematicas', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Propiedad de un sistema de ecuaciones que tiene infinitas soluciones dependientes de un parámetro', 'holgura', 'matematicas', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Punto de un diagrama de dispersión que se aleja mucho de la tendencia general', 'heterogeneidad', 'matematicas', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Conjunto de funciones que se anulan en el origen y forman un subespacio lineal', 'homogeneo', 'matematicas', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Distribución de frecuencias representada mediante barras rectangulares contiguas', 'histograma', 'matematicas', 'bachillerato', '{2}', 1),

-- I (6)
('I', 'empieza', 'Operación inversa de la derivación que busca la primitiva de una función', 'integral', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Matriz cuadrada con unos en la diagonal y ceros fuera, elemento neutro del producto matricial', 'identidad', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Rango de valores que contiene al parámetro con un nivel de confianza dado', 'intervalo', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Tipo de integral que se extiende hasta el infinito en al menos uno de sus límites', 'impropia', 'matematicas', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Propiedad de un conjunto de vectores donde ninguno puede expresarse como combinación lineal de los demás', 'independencia', 'matematicas', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Matriz que al multiplicarse por su original produce la matriz identidad', 'inversa', 'matematicas', 'bachillerato', '{2}', 1),

-- J (5)
('J', 'empieza', 'Forma canónica de una matriz que agrupa los autovalores en bloques diagonales', 'jordan', 'matematicas', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Determinante funcional de una transformación de coordenadas, usado en integrales múltiples', 'jacobiano', 'matematicas', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Criterio que combina los datos de dos variables para evaluar la dependencia estadística', 'jicuadrado', 'matematicas', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Prueba de bondad de ajuste que compara frecuencias observadas y esperadas en categorías', 'juste', 'matematicas', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Forma diagonal por bloques de una matriz no diagonalizable', 'jordaniana', 'matematicas', 'bachillerato', '{2}', 3),

-- K (5)
('K', 'contiene', 'Número máximo de vectores linealmente independientes de un conjunto dado', 'rango', 'matematicas', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Núcleo de una aplicación lineal formado por los vectores que se envían al vector nulo', 'kernel', 'matematicas', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Método iterativo para resolver sistemas de ecuaciones lineales grandes', 'krylov', 'matematicas', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Medida de asimetría de una distribución estadística que indica la cola más pesada', 'skewness', 'matematicas', 'bachillerato', '{2}', 3),
('K', 'contiene', 'Proceso para ortogonalizar un conjunto de vectores linealmente independientes', 'schmidtgk', 'matematicas', 'bachillerato', '{2}', 3),

-- L (6)
('L', 'empieza', 'Combinación de vectores usando coeficientes escalares, fundamental en espacios vectoriales', 'lineal', 'matematicas', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Nivel de significación complementario que fija la amplitud del intervalo de confianza', 'logverosimilitud', 'matematicas', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Curva en coordenadas polares con ecuación r = a + b cos θ', 'limacon', 'matematicas', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Fórmula de cálculo del área bajo una curva en coordenadas polares usando la integral 1/2 ∫ r² dθ', 'longitud', 'matematicas', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Método para transformar un sistema de ecuaciones en forma triangular paso a paso', 'lu', 'matematicas', 'bachillerato', '{2}', 3),
('L', 'empieza', 'Propiedad de vectores donde uno de ellos es múltiplo escalar de otro', 'ligadura', 'matematicas', 'bachillerato', '{2}', 2),

-- M (6)
('M', 'empieza', 'Tabla rectangular de números con operaciones propias de suma y producto', 'matriz', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Valor central de una distribución estadística que divide la probabilidad en dos mitades', 'mediana', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Porción representativa de una población elegida para realizar inferencia estadística', 'muestra', 'matematicas', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Menor de una matriz obtenido al eliminar una fila y una columna y calcular su determinante', 'menor', 'matematicas', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Modelo estadístico que predice una variable a partir de otra usando una recta', 'minimos', 'matematicas', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Distribución que se aproxima a la normal cuando n es grande y p no es extrema', 'multinomial', 'matematicas', 'bachillerato', '{2}', 3),

-- N (6)
('N', 'empieza', 'Distribución de probabilidad continua con forma de campana simétrica definida por media y desviación', 'normal', 'matematicas', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Probabilidad de no rechazar la hipótesis nula cuando es falsa, complemento de la potencia', 'nivel', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Longitud de un vector en un espacio vectorial, generalización del módulo', 'norma', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Subespacio vectorial formado por todos los vectores que la aplicación lineal envía al cero', 'nucleo', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Tamaño de la muestra necesario para garantizar un margen de error dado con cierta confianza', 'necesaria', 'matematicas', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Propiedad de la distribución normal estándar con media cero y varianza uno', 'normalizada', 'matematicas', 'bachillerato', '{2}', 1),

-- O (6)
('O', 'empieza', 'Propiedad de una matriz cuya transpuesta es igual a su inversa', 'ortogonal', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Parámetro estadístico desconocido sobre el que se establece la hipótesis nula y alternativa', 'observado', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Proceso de Gram-Schmidt que convierte una base cualquiera en una base ortonormal', 'ortonormalizacion', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Valor atípico en una muestra que se aleja significativamente de la media', 'outlier', 'matematicas', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Frecuencia contada directamente en la muestra, frente a la frecuencia esperada bajo la hipótesis', 'observada', 'matematicas', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Sistema de coordenadas donde la distancia y el ángulo definen cada punto del plano', 'origen', 'matematicas', 'bachillerato', '{2}', 1),

-- P (7)
('P', 'empieza', 'Técnica de integración que aplica la regla del producto de derivadas de forma inversa', 'partes', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Variable auxiliar que expresa las coordenadas x e y de una curva de forma independiente', 'parametro', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Sistema de localización de puntos en el plano usando distancia al polo y ángulo polar', 'polar', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Ecuación característica cuyas raíces son los autovalores de una matriz', 'polinomio', 'matematicas', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Fracción de individuos de la población que poseen una característica determinada', 'proporcion', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Función original cuya derivada coincide con el integrando dado', 'primitiva', 'matematicas', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Probabilidad de obtener un resultado al menos tan extremo como el observado bajo la hipótesis nula', 'pvalor', 'matematicas', 'bachillerato', '{2}', 2),

-- Q (5)
('Q', 'empieza', 'Forma que adopta la expresión x^T A x al evaluar matrices simétricas', 'quadratica', 'matematicas', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Cuarto de cada cien partes en que se divide una distribución ordenada', 'quintil', 'matematicas', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Valor que divide la distribución en cuatro partes de igual probabilidad', 'quartil', 'matematicas', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Cociente entre la varianza explicada y la varianza total en un modelo de regresión', 'quadrado', 'matematicas', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Tipo de estadístico chi cuyo cálculo compara frecuencias observadas con esperadas', 'quicuadrado', 'matematicas', 'bachillerato', '{2}', 2),

-- R (6)
('R', 'empieza', 'Modelo que ajusta una recta a datos bivariantes minimizando la suma de residuos al cuadrado', 'regresion', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Número máximo de filas o columnas linealmente independientes de una matriz', 'rango', 'matematicas', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Sólido generado al girar una curva alrededor de un eje, cuyo volumen se calcula con integrales', 'revolucion', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Diferencia entre el valor observado y el valor estimado por el modelo de regresión', 'residuo', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Cuadrado del coeficiente de correlación que indica el porcentaje de varianza explicada', 'rcuadrado', 'matematicas', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Curva en coordenadas polares con ecuación r = a cos(nθ) que forma pétalos', 'rodon', 'matematicas', 'bachillerato', '{2}', 3),

-- S (6)
('S', 'empieza', 'Técnica de integración que cambia la variable por otra que simplifica el integrando', 'sustitucion', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Subconjunto de un espacio vectorial que también es espacio vectorial con las mismas operaciones', 'subespacio', 'matematicas', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Método que resuelve el sistema Ax = b hallando x = A^(-1) b si la matriz es inversible', 'sistema', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Valor numérico calculado a partir de la muestra para estimar un parámetro poblacional', 'estadistico', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Propiedad de una distribución donde la cola izquierda es imagen especular de la derecha', 'simetrica', 'matematicas', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Nivel de significación alfa que fija la probabilidad de rechazar la hipótesis nula siendo cierta', 'significacion', 'matematicas', 'bachillerato', '{2}', 2),

-- T (6)
('T', 'empieza', 'Matriz que resulta de intercambiar filas por columnas de la matriz original', 'traspuesta', 'matematicas', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Suma de los elementos de la diagonal principal de una matriz cuadrada', 'traza', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Distribución t de Student usada para inferencia con muestras pequeñas y varianza desconocida', 'tstudent', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Valor tabular que delimita la zona de rechazo en un contraste de hipótesis', 'tcritico', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Aplicación lineal entre espacios vectoriales que preserva la estructura algebraica', 'transformacion', 'matematicas', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Método de reducción de una matriz a forma triangular superior para resolver sistemas', 'triangulacion', 'matematicas', 'bachillerato', '{2}', 1),

-- U (5)
('U', 'empieza', 'Región bajo la curva de probabilidad de ambas colas usada en contrastes bilaterales', 'unilateral', 'matematicas', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Propiedad de un estimador que da el mismo resultado esperado que el parámetro que estima', 'umbral', 'matematicas', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Distribución continua donde todos los valores en un intervalo tienen la misma probabilidad', 'uniforme', 'matematicas', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Condición de una solución que es la única posible para un sistema determinado', 'unicidad', 'matematicas', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Vector de norma uno que indica una dirección en el espacio vectorial', 'unitario', 'matematicas', 'bachillerato', '{2}', 1),

-- V (6)
('V', 'empieza', 'Volumen del sólido de revolución calculado con el método de discos o arandelas', 'volumen', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Media de los cuadrados de las desviaciones respecto a la media, medida de dispersión', 'varianza', 'matematicas', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Objeto matemático con magnitud y dirección que pertenece a un espacio lineal', 'vector', 'matematicas', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Valor numérico a partir del cual se rechaza la hipótesis nula en un contraste', 'vcritico', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Proporción de la variabilidad total explicada por el modelo de regresión ajustado', 'validez', 'matematicas', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Coeficiente de variación que expresa la dispersión relativa como porcentaje de la media', 'variacion', 'matematicas', 'bachillerato', '{2}', 1),

-- W (5)
('W', 'contiene', 'Determinante formado por un conjunto de funciones y sus derivadas sucesivas', 'wronskiano', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Fórmula de integración por partes que se aplica repetidamente en integrales cíclicas', 'tabulacionw', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Resultado que afirma que toda forma cuadrática simétrica puede diagonalizarse con cambio de base', 'sylvesterw', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Criterio para determinar si una serie de potencias converge uniformemente en un compacto', 'weierstrass', 'matematicas', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Propiedad de una curva parametrizada que indica que no tiene autointersecciones', 'piecewise', 'matematicas', 'bachillerato', '{2}', 2),

-- X (5)
('X', 'contiene', 'Valor máximo y mínimo de una función de varias variables en un dominio cerrado', 'extremos', 'matematicas', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Función matricial que eleva e a la potencia de una matriz cuadrada', 'exponencial', 'matematicas', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Fórmula que expresa el área de una región plana en coordenadas polares', 'aproximacion', 'matematicas', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Técnica de integración que usa fracciones parciales con factores lineales y cuadráticos', 'mixta', 'matematicas', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Tipo de contraste de hipótesis con una sola región de rechazo en una cola', 'unilateralexacto', 'matematicas', 'bachillerato', '{2}', 2),

-- Y (5)
('Y', 'contiene', 'Curva que describe la trayectoria de un punto moviéndose según ecuaciones paramétricas', 'trayectoria', 'matematicas', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Propiedad de una matriz cuya traspuesta conjugada es igual a sí misma', 'hermityana', 'matematicas', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Método de mínimos cuadrados que minimiza la suma de cuadrados de los residuos', 'ajusteycuadrados', 'matematicas', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Variable respuesta en un modelo de regresión que depende de la variable explicativa', 'yrespuesta', 'matematicas', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Estimador puntual del parámetro poblacional calculado a partir de datos muestrales', 'muestraly', 'matematicas', 'bachillerato', '{2}', 2),

-- Z (5)
('Z', 'contiene', 'Valor estandarizado que mide cuántas desviaciones típicas se aleja un dato de la media', 'zetanormal', 'matematicas', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Región del eje que delimita los valores para los que se rechaza la hipótesis nula', 'rechazo', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Raíz de la ecuación característica que anula el polinomio del determinante', 'raizcaracteristica', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Operación que reduce una matriz a ceros bajo la diagonal mediante operaciones elementales', 'escalonizar', 'matematicas', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Distribución especial con media cero y varianza uno usada como referencia para contrastar hipótesis', 'estandarizada', 'matematicas', 'bachillerato', '{2}', 1),

-- ============================================================
-- FISICA 1º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Componente del movimiento parabólico que sufre la aceleración gravitatoria constante', 'ascensional', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Magnitud que cuantifica la rapidez con la que cambia la velocidad de un objeto', 'aceleracion', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Máximo desplazamiento desde la posición de equilibrio en un movimiento oscilatorio', 'amplitud', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Ángulo formado entre el rayo incidente y la normal a la superficie reflectante', 'angulo', 'fisica', 'bachillerato', '{1}', 1),
('A', 'empieza', 'Tipo de aberración óptica donde los rayos marginales convergen en un foco distinto a los paraxiales', 'aberracion', 'fisica', 'bachillerato', '{1}', 3),
('A', 'empieza', 'Región del espacio donde las ondas que llegan interfieren constructivamente', 'antimodal', 'fisica', 'bachillerato', '{1}', 2),

-- B (6)
('B', 'empieza', 'Fenómeno de doble refracción que presentan ciertos cristales anisotrópicos', 'birrefringencia', 'fisica', 'bachillerato', '{1}', 3),
('B', 'empieza', 'Modelo cuántico donde los electrones ocupan niveles de energía discretos alrededor del núcleo', 'bohr', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Fuerza neta sobre un cuerpo sumergido igual al peso del fluido desalojado', 'boyante', 'fisica', 'bachillerato', '{1}', 1),
('B', 'empieza', 'Onda que desplaza el medio en la misma dirección en que se propaga', 'barrera', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Condición de equilibrio estático donde la suma de momentos respecto a cualquier punto es cero', 'brazo', 'fisica', 'bachillerato', '{1}', 2),
('B', 'empieza', 'Conjunto de espectros de líneas discretas emitidos por un átomo excitado', 'balmer', 'fisica', 'bachillerato', '{1}', 2),

-- C (7)
('C', 'empieza', 'Distribución de electrones en los distintos subniveles de energía de un átomo', 'configuracion', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Número que describe el estado cuántico de un electrón en un orbital', 'cuantico', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Propiedad de una lente definida como la inversa de su distancia focal en metros', 'convergente', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Punto por el que pasan todos los rayos refractados por una lente delgada paralelos al eje', 'centro', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Interferencia de dos ondas de igual frecuencia que produce zonas de refuerzo y cancelación', 'constructiva', 'fisica', 'bachillerato', '{1}', 2),
('C', 'empieza', 'Tipo de espejo curvo que converge los rayos paralelos al eje en un punto focal', 'concavo', 'fisica', 'bachillerato', '{1}', 1),
('C', 'empieza', 'Velocidad mínima circular de un satélite para mantener una órbita estable', 'circular', 'fisica', 'bachillerato', '{1}', 2),

-- D (6)
('D', 'empieza', 'Fenómeno de desviación de las ondas al pasar por una abertura o rodear un obstáculo', 'difraccion', 'fisica', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Cambio aparente de frecuencia percibido cuando fuente y observador se mueven relativamente', 'doppler', 'fisica', 'bachillerato', '{1}', 2),
('D', 'empieza', 'Magnitud escalar que mide la masa por unidad de volumen de una sustancia', 'densidad', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Separación de la luz blanca en sus colores componentes al atravesar un prisma', 'dispersion', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Lente que separa los rayos de luz paralelos haciendo que divergan como si vinieran de un foco virtual', 'divergente', 'fisica', 'bachillerato', '{1}', 1),
('D', 'empieza', 'Propiedad cuántica de espín que puede ser +1/2 o -1/2 para un electrón', 'doblete', 'fisica', 'bachillerato', '{1}', 3),

-- E (7)
('E', 'empieza', 'Fenómeno ondulatorio por el que una onda genera patrones claros y oscuros alternados al pasar por rendijas', 'estacionaria', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Razón entre la velocidad de la luz en el vacío y en un medio material', 'indice', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Principio que prohíbe que dos electrones del mismo átomo tengan los cuatro números cuánticos iguales', 'exclusion', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Velocidad que necesita un objeto para escapar del campo gravitatorio sin propulsión adicional', 'escape', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Tipo de espejo que refleja los rayos divergiéndolos y forma imágenes virtuales', 'esferico', 'fisica', 'bachillerato', '{1}', 1),
('E', 'empieza', 'Onda cuya forma no avanza sino que oscila en el lugar con nodos y antinodos fijos', 'estacionaria', 'fisica', 'bachillerato', '{1}', 2),
('E', 'empieza', 'Región orbital donde la probabilidad de encontrar un electrón es máxima', 'electronico', 'fisica', 'bachillerato', '{1}', 2),

-- F (6)
('F', 'empieza', 'Punto donde convergen los rayos de luz tras reflejarse en un espejo cóncavo o refractarse en una lente', 'foco', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Número de oscilaciones completas por unidad de tiempo en un movimiento ondulatorio', 'frecuencia', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Fenómeno que amplifica la amplitud cuando la frecuencia de excitación coincide con la natural del sistema', 'frecuencia', 'fisica', 'bachillerato', '{1}', 2),
('F', 'empieza', 'Distancia entre el centro óptico de una lente y su punto focal', 'focal', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Fuerza restauradora en el péndulo simple proporcional al desplazamiento angular para ángulos pequeños', 'fuerza', 'fisica', 'bachillerato', '{1}', 1),
('F', 'empieza', 'Proceso de absorción y reemisión de radiación electromagnética por un material', 'fluorescencia', 'fisica', 'bachillerato', '{1}', 3),

-- G (6)
('G', 'empieza', 'Aceleración que la Tierra imprime a todos los cuerpos cerca de su superficie, aproximadamente 9,8 m/s²', 'gravedad', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Modelo que describe la disposición tridimensional de los pares de electrones alrededor de un átomo central', 'geometria', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Ley de gravitación que establece que la fuerza es proporcional al producto de masas e inversamente proporcional al cuadrado de la distancia', 'gravitacion', 'fisica', 'bachillerato', '{1}', 1),
('G', 'empieza', 'Constante universal cuyo valor es 6,674 × 10⁻¹¹ N·m²/kg² en la ley de gravitación', 'gravitatoria', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Período orbital de un satélite geoestacionario que coincide con la rotación terrestre', 'geoestacionario', 'fisica', 'bachillerato', '{1}', 2),
('G', 'empieza', 'Red de líneas finas equiespaciadas que produce difracción e interferencia de la luz', 'grating', 'fisica', 'bachillerato', '{1}', 3),

-- H (6)
('H', 'empieza', 'Regla que establece que los electrones ocupan orbitales degenerados de uno en uno con espines paralelos', 'hund', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Principio de indeterminación que limita la precisión simultánea de posición y momento', 'heisenberg', 'fisica', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Modelo atómico que describe los electrones como ondas estacionarias alrededor del núcleo', 'hidrogeno', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Fenómeno óptico donde las franjas claras y oscuras forman un patrón circular', 'holograma', 'fisica', 'bachillerato', '{1}', 3),
('H', 'empieza', 'Principio que afirma que cada punto de un frente de onda actúa como fuente de ondas secundarias', 'huygens', 'fisica', 'bachillerato', '{1}', 2),
('H', 'empieza', 'Onda armónica cuya frecuencia es múltiplo entero de la fundamental', 'harmonico', 'fisica', 'bachillerato', '{1}', 2),

-- I (6)
('I', 'empieza', 'Relación entre la velocidad de la luz en el vacío y en un medio, que determina la refracción', 'indice', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Representación óptica formada por la convergencia real o virtual de rayos luminosos', 'imagen', 'fisica', 'bachillerato', '{1}', 1),
('I', 'empieza', 'Superposición de dos o más ondas coherentes que produce refuerzo o cancelación', 'interferencia', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Número entero positivo que define la capa o nivel energético principal de un electrón', 'ionizacion', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Intervalo de tiempo que tarda un péndulo en completar una oscilación completa', 'isocronismo', 'fisica', 'bachillerato', '{1}', 2),
('I', 'empieza', 'Propiedad de la luz que permite que vibre en un solo plano tras pasar por un filtro polarizador', 'intensidad', 'fisica', 'bachillerato', '{1}', 1),

-- J (5)
('J', 'empieza', 'Unidad del Sistema Internacional de energía, trabajo y calor', 'julio', 'fisica', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Experimento mental que mostraba el equivalente mecánico del calor con paletas y agua', 'joule', 'fisica', 'bachillerato', '{1}', 1),
('J', 'empieza', 'Efecto por el cual un material emite electrones al ser iluminado con luz de frecuencia adecuada', 'joven', 'fisica', 'bachillerato', '{1}', 3),
('J', 'empieza', 'Científico que realizó el famoso experimento de la doble rendija demostrando la naturaleza ondulatoria de la luz', 'juntura', 'fisica', 'bachillerato', '{1}', 2),
('J', 'empieza', 'Acoplamiento entre el momento angular orbital y el de espín de un electrón', 'jj', 'fisica', 'bachillerato', '{1}', 3),

-- K (5)
('K', 'contiene', 'Ley de gravitación que calcula la fuerza entre dos masas como proporcional a su producto', 'newtonkg', 'fisica', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Energía asociada al movimiento de un cuerpo, igual a la mitad del producto de masa por velocidad al cuadrado', 'cineticakj', 'fisica', 'bachillerato', '{1}', 1),
('K', 'contiene', 'Tercera ley de Kepler que relaciona el cubo del semieje mayor con el cuadrado del período orbital', 'keplertercera', 'fisica', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Constante de Planck dividida entre 2π, usada en mecánica cuántica', 'planckh', 'fisica', 'bachillerato', '{1}', 2),
('K', 'contiene', 'Modelo atómico nuclear donde los electrones orbitan un núcleo denso y positivo', 'rutherfordnucleark', 'fisica', 'bachillerato', '{1}', 2),

-- L (6)
('L', 'empieza', 'Elemento óptico transparente con dos superficies refractantes, al menos una curva', 'lente', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Distancia entre dos puntos consecutivos de una onda que están en la misma fase', 'longitud', 'fisica', 'bachillerato', '{1}', 1),
('L', 'empieza', 'Dispositivo que amplifica la luz por emisión estimulada de radiación coherente', 'laser', 'fisica', 'bachillerato', '{1}', 2),
('L', 'empieza', 'Tercer número cuántico que indica la orientación espacial del orbital en un campo magnético', 'lateral', 'fisica', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Serie espectral del hidrógeno cuyas líneas caen en la zona ultravioleta del espectro', 'lyman', 'fisica', 'bachillerato', '{1}', 3),
('L', 'empieza', 'Tipo de péndulo ideal formado por una masa puntual suspendida de un hilo inextensible y sin masa', 'longitud', 'fisica', 'bachillerato', '{1}', 1),

-- M (6)
('M', 'empieza', 'Relación entre el tamaño de la imagen y el del objeto en un sistema óptico', 'magnificacion', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Punto de una onda estacionaria donde la amplitud de oscilación es siempre nula', 'minimo', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Velocidad de un proyectil lanzado en tiro parabólico, constante en la componente horizontal', 'muzzle', 'fisica', 'bachillerato', '{1}', 3),
('M', 'empieza', 'Tipo de espejo plano o curvo que refleja la luz según las leyes de la reflexión', 'miroir', 'fisica', 'bachillerato', '{1}', 1),
('M', 'empieza', 'Número cuántico magnético que indica las orientaciones posibles de un orbital en un campo externo', 'magnetico', 'fisica', 'bachillerato', '{1}', 2),
('M', 'empieza', 'Movimiento descrito por un proyectil lanzado con velocidad inicial y ángulo de elevación', 'movimiento', 'fisica', 'bachillerato', '{1}', 1),

-- N (6)
('N', 'empieza', 'Punto de una onda estacionaria donde la amplitud es siempre cero', 'nodo', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Recta perpendicular a una superficie en el punto de incidencia de un rayo', 'normal', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Valor entero que define el nivel de energía principal de un electrón en un átomo', 'nivel', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Ley que establece que F = ma, base de la mecánica clásica del movimiento', 'newton', 'fisica', 'bachillerato', '{1}', 1),
('N', 'empieza', 'Propiedad cuántica intrínseca del electrón que puede ser +1/2 o -1/2', 'numero', 'fisica', 'bachillerato', '{1}', 2),
('N', 'empieza', 'Índice que mide cuánto se desvía la luz al pasar del vacío a un medio más denso', 'nrefraccion', 'fisica', 'bachillerato', '{1}', 2),

-- O (6)
('O', 'empieza', 'Región del espacio donde hay mayor probabilidad de encontrar un electrón, definida por n, l y ml', 'orbital', 'fisica', 'bachillerato', '{1}', 2),
('O', 'empieza', 'Perturbación que se propaga transportando energía sin transportar materia', 'onda', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Movimiento repetitivo de ida y vuelta alrededor de una posición de equilibrio', 'oscilacion', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Tipo de lente convergente más gruesa en el centro que en los bordes', 'optica', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Trayectoria cerrada que sigue un satélite alrededor de un cuerpo masivo por efecto gravitatorio', 'orbita', 'fisica', 'bachillerato', '{1}', 1),
('O', 'empieza', 'Forma del orbital atómico con l = 0 que es esférica y simétrica', 'orbital', 'fisica', 'bachillerato', '{1}', 2),

-- P (7)
('P', 'empieza', 'Dispositivo oscilante formado por una masa que cuelga de un punto fijo y oscila por gravedad', 'pendulo', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Trayectoria curva que describe un proyectil lanzado con ángulo respecto a la horizontal', 'parabolico', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Principio de exclusión que prohíbe a dos fermiones tener el mismo estado cuántico', 'pauli', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Tiempo que tarda un sistema oscilante en completar un ciclo completo', 'periodo', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Propiedad ondulatoria que restringe la vibración a un solo plano, aplicable a ondas transversales', 'polarizacion', 'fisica', 'bachillerato', '{1}', 2),
('P', 'empieza', 'Elemento óptico triangular que descompone la luz blanca en el espectro visible por dispersión', 'prisma', 'fisica', 'bachillerato', '{1}', 1),
('P', 'empieza', 'Función de onda cuyo cuadrado da la densidad de probabilidad de encontrar una partícula', 'probabilidad', 'fisica', 'bachillerato', '{1}', 3),

-- Q (5)
('Q', 'empieza', 'Teoría que describe el comportamiento de la materia y la energía a escalas atómicas y subatómicas', 'quantica', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Número que especifica el tamaño, forma, orientación o espín de un orbital electrónico', 'quantico', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Propiedad discreta de la energía que solo puede tomar valores múltiplos de un cuanto fundamental', 'quantizacion', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Modelo que propuso que la energía se emite y absorbe en paquetes discretos llamados cuantos', 'quantum', 'fisica', 'bachillerato', '{1}', 2),
('Q', 'empieza', 'Partícula elemental con carga fraccionaria que forma protones y neutrones', 'quark', 'fisica', 'bachillerato', '{1}', 3),

-- R (6)
('R', 'empieza', 'Cambio de dirección de una onda al pasar de un medio a otro con distinta velocidad de propagación', 'refraccion', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Fenómeno por el cual un rayo de luz rebota al chocar con una superficie', 'reflexion', 'fisica', 'bachillerato', '{1}', 1),
('R', 'empieza', 'Amplificación de la amplitud de oscilación cuando la frecuencia de excitación iguala a la natural', 'resonancia', 'fisica', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Abertura estrecha por la que pasa la luz produciendo un patrón de difracción', 'rendija', 'fisica', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Modelo atómico donde los electrones giran en órbitas circulares estables sin emitir radiación', 'rutherford', 'fisica', 'bachillerato', '{1}', 2),
('R', 'empieza', 'Unión de un orbital s con tres orbitales p para formar cuatro orbitales híbridos equivalentes', 'repulsion', 'fisica', 'bachillerato', '{1}', 2),

-- S (6)
('S', 'empieza', 'Cuerpo que orbita alrededor de un planeta mantenido por la atracción gravitatoria', 'satelite', 'fisica', 'bachillerato', '{1}', 1),
('S', 'empieza', 'Ley que relaciona el seno del ángulo de incidencia con el de refracción y los índices de los medios', 'snell', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Número cuántico intrínseco del electrón con valores +1/2 y -1/2', 'spin', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Tipo de orbital con número cuántico secundario l = 0 y forma esférica', 'subnivel', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Superposición de dos ondas iguales que viajan en sentidos opuestos formando nodos y antinodos', 'superposicion', 'fisica', 'bachillerato', '{1}', 2),
('S', 'empieza', 'Principio que explica la geometría molecular por la repulsión entre pares de electrones de valencia', 'sepr', 'fisica', 'bachillerato', '{1}', 2),

-- T (6)
('T', 'empieza', 'Movimiento de un proyectil con componente horizontal uniforme y vertical uniformemente acelerada', 'tiro', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Onda cuyas partículas vibran perpendicularmente a la dirección de propagación', 'transversal', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Ángulo de incidencia para el cual el rayo refractado viaja exactamente paralelo a la superficie', 'total', 'fisica', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Tercer período de la tabla periódica donde se completan los orbitales 3s y 3p', 'tercero', 'fisica', 'bachillerato', '{1}', 1),
('T', 'empieza', 'Modelo que predice la geometría molecular a partir de la repulsión de pares electrónicos', 'tetraedrica', 'fisica', 'bachillerato', '{1}', 2),
('T', 'empieza', 'Propiedad de las ondas mecánicas que necesitan un medio material para propagarse', 'tension', 'fisica', 'bachillerato', '{1}', 1),

-- U (5)
('U', 'empieza', 'Magnitud que mide la potencia de una lente, igual a la inversa de la focal en metros', 'udioptria', 'fisica', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Fenómeno cuántico donde una partícula atraviesa una barrera de potencial mayor que su energía', 'umbral', 'fisica', 'bachillerato', '{1}', 3),
('U', 'empieza', 'Radiación electromagnética con longitud de onda menor que la luz visible pero mayor que los rayos X', 'ultravioleta', 'fisica', 'bachillerato', '{1}', 1),
('U', 'empieza', 'Condición de un sistema oscilante donde la frecuencia de vibración no depende de la amplitud', 'uniformidad', 'fisica', 'bachillerato', '{1}', 2),
('U', 'empieza', 'Principio de indeterminación que impide conocer simultáneamente posición y momento con precisión absoluta', 'uncertainty', 'fisica', 'bachillerato', '{1}', 3),

-- V (6)
('V', 'empieza', 'Velocidad necesaria para que un objeto lance desde la superficie terrestre no regrese nunca', 'velocidad', 'fisica', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Modelo de repulsión electrónica que determina la forma tridimensional de las moléculas', 'vsepr', 'fisica', 'bachillerato', '{1}', 2),
('V', 'empieza', 'Imagen formada por la prolongación virtual de los rayos, que no puede recogerse en pantalla', 'virtual', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Punto donde la velocidad de un proyectil en tiro parabólico tiene solo componente horizontal', 'vertice', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Electrones de la última capa de un átomo que determinan sus propiedades químicas', 'valencia', 'fisica', 'bachillerato', '{1}', 1),
('V', 'empieza', 'Rapidez con que se propaga una perturbación ondulatoria a través de un medio', 'velocidad', 'fisica', 'bachillerato', '{1}', 1),

-- W (5)
('W', 'contiene', 'Unidad de potencia del SI equivalente a un julio por segundo', 'watt', 'fisica', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Ley de gravitación formulada por Isaac que es base de la mecánica celeste clásica', 'newtonley', 'fisica', 'bachillerato', '{1}', 1),
('W', 'contiene', 'Ecuación fundamental de la mecánica cuántica que describe la evolución de la función de onda', 'schrodinger', 'fisica', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Longitud de onda asociada a una partícula con momento p según la relación λ = h/p', 'debroglie', 'fisica', 'bachillerato', '{1}', 3),
('W', 'contiene', 'Científico que propuso el principio de cada punto de un frente de onda como emisor secundario', 'huygenswave', 'fisica', 'bachillerato', '{1}', 2),

-- X (5)
('X', 'contiene', 'Ángulo máximo de incidencia para el cual aún se produce refracción antes de la reflexión total', 'reflexiontotalinternax', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Fenómeno de difracción que produce máximos y mínimos de intensidad al pasar por una rendija', 'difraccionexperimento', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Número cuántico secundario que indica la forma del orbital: s, p, d o f', 'azimutalexacto', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Principio que impide medir simultáneamente posición y momento con precisión arbitraria', 'inexactitud', 'fisica', 'bachillerato', '{1}', 2),
('X', 'contiene', 'Proceso de emisión de partículas por una fuente radiactiva que puede ser alfa, beta o gamma', 'sextupolo', 'fisica', 'bachillerato', '{1}', 3),

-- Y (5)
('Y', 'contiene', 'Experimento de la doble rendija que demuestra la interferencia de la luz', 'young', 'fisica', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Tipo de trayectoria seguida por un proyectil en el campo gravitatorio terrestre uniforme', 'proyectil', 'fisica', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Rayo de luz que pasa por el centro óptico de una lente sin desviarse', 'rayo', 'fisica', 'bachillerato', '{1}', 1),
('Y', 'contiene', 'Energía necesaria para arrancar un electrón del nivel fundamental de un átomo', 'ionizaciony', 'fisica', 'bachillerato', '{1}', 2),
('Y', 'contiene', 'Ley que relaciona el índice de refracción con el seno de los ángulos de incidencia y refracción', 'snelley', 'fisica', 'bachillerato', '{1}', 2),

-- Z (5)
('Z', 'contiene', 'Número atómico que indica la cantidad de protones en el núcleo de un elemento', 'atomicoz', 'fisica', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Punto del horizonte por donde aparentemente el sol sale o se pone', 'horizonte', 'fisica', 'bachillerato', '{1}', 1),
('Z', 'contiene', 'Efecto de desdoblamiento de líneas espectrales al aplicar un campo magnético externo', 'zeeman', 'fisica', 'bachillerato', '{1}', 3),
('Z', 'contiene', 'Lente que tiene potencia nula porque sus superficies producen desviaciones opuestas que se compensan', 'neutraliza', 'fisica', 'bachillerato', '{1}', 2),
('Z', 'contiene', 'Propiedad de una onda estacionaria en la que ciertos puntos permanecen siempre en reposo', 'nodosfijosz', 'fisica', 'bachillerato', '{1}', 2),

-- ============================================================
-- FISICA 2º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Ley que relaciona la circulación del campo magnético con la corriente encerrada por una trayectoria', 'ampere', 'fisica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Fenómeno por el cual un conductor genera su propia fem inducida al variar la corriente que lo recorre', 'autoinduccion', 'fisica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Máquina que comunica energía cinética a partículas cargadas usando campos eléctricos y magnéticos', 'acelerador', 'fisica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Tipo de corriente cuya intensidad varía sinusoidalmente con el tiempo', 'alterna', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Partícula compuesta por dos protones y dos neutrones emitida en desintegraciones radiactivas', 'alfa', 'fisica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Número que indica cuántos nucleones contiene el núcleo de un átomo', 'atomico', 'fisica', 'bachillerato', '{2}', 1),

-- B (6)
('B', 'empieza', 'Modelo atómico con órbitas cuantizadas que explica el espectro de emisión del hidrógeno', 'bohr', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Partícula subatómica portadora de fuerza en el modelo estándar, como el fotón o el gluón', 'boson', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Serie espectral del hidrógeno cuyas líneas caen en la región visible del espectro', 'balmer', 'fisica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Campo vectorial que ejerce fuerza sobre cargas en movimiento y sobre corrientes eléctricas', 'bfield', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Desintegración nuclear donde se emite un electrón o un positrón desde el núcleo', 'beta', 'fisica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Partícula predicha por Peter Higgs cuyo campo da masa a las demás partículas', 'bosonhiggs', 'fisica', 'bachillerato', '{2}', 3),

-- C (7)
('C', 'empieza', 'Efecto donde un fotón pierde energía al colisionar con un electrón libre, aumentando su longitud de onda', 'compton', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Líneas imaginarias tangentes al vector campo en cada punto del espacio', 'campo', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Magnitud que opone resistencia al paso de corriente alterna en un circuito con bobina o condensador', 'condensador', 'fisica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Partículas constituyentes fundamentales de los hadrones con carga fraccionaria', 'cromatica', 'fisica', 'bachillerato', '{2}', 3),
('C', 'empieza', 'Corriente eléctrica cuya intensidad no cambia con el tiempo', 'continua', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Fuerza de Coulomb entre dos cargas puntuales proporcional al producto de cargas e inversamente al cuadrado de la distancia', 'coulomb', 'fisica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Tipo de acelerador circular donde las partículas ganan energía en cada vuelta por un campo eléctrico alterno', 'ciclotron', 'fisica', 'bachillerato', '{2}', 2),

-- D (6)
('D', 'empieza', 'Técnica que usa la constante de desintegración de un isótopo para determinar la edad de una muestra', 'datacion', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Proceso espontáneo por el que un núcleo inestable emite radiación para alcanzar mayor estabilidad', 'desintegracion', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Propiedad de un material aislante que puede almacenar energía eléctrica en un campo aplicado', 'dielectrico', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Diferencia de potencial eléctrico entre dos puntos de un campo', 'diferencia', 'fisica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Fenómeno de desviación de ondas electromagnéticas al encontrar obstáculos o aberturas', 'difraccion', 'fisica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Relación entre la variación del flujo magnético y la fem inducida según la ley de Faraday', 'derivada', 'fisica', 'bachillerato', '{2}', 2),

-- E (7)
('E', 'empieza', 'Superficies donde el potencial eléctrico tiene el mismo valor en todos sus puntos', 'equipotencial', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Radiación de alta energía emitida por un núcleo sin cambio en el número atómico ni másico', 'electromagnetica', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Partícula elemental con carga negativa que pertenece a la familia de los leptones', 'electron', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Serie espectral del hidrógeno que se encuentra en la región infrarroja lejana', 'espectro', 'fisica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Proceso de emisión de un fotón cuando un electrón pasa de un nivel superior a uno inferior', 'emision', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Relación de equivalencia entre masa y energía descrita por E = mc²', 'equivalencia', 'fisica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Magnitud escalar que en cada punto del espacio indica la energía potencial por unidad de carga', 'electrico', 'fisica', 'bachillerato', '{2}', 1),

-- F (6)
('F', 'empieza', 'Ley de inducción electromagnética que relaciona la fem inducida con la variación del flujo magnético', 'faraday', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Integral del campo magnético a través de una superficie, medida en webers', 'flujo', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Cuanto de radiación electromagnética sin masa en reposo que viaja a la velocidad de la luz', 'foton', 'fisica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Instalación nuclear donde se mantiene una reacción de fisión en cadena controlada', 'fision', 'fisica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Proceso nuclear donde dos núcleos ligeros se unen para formar uno más pesado liberando energía', 'fusion', 'fisica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Desfase entre la corriente y el voltaje en un circuito de corriente alterna con reactancia', 'fase', 'fisica', 'bachillerato', '{2}', 2),

-- G (6)
('G', 'empieza', 'Teorema que relaciona el flujo eléctrico a través de una superficie cerrada con la carga encerrada', 'gauss', 'fisica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Radiación electromagnética de altísima frecuencia emitida por núcleos en desexcitación', 'gamma', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Partícula mediadora de la interacción fuerte entre quarks en el modelo estándar', 'gluon', 'fisica', 'bachillerato', '{2}', 3),
('G', 'empieza', 'Campo gravitatorio terrestre representado por líneas de fuerza que apuntan al centro de la Tierra', 'gravitatorio', 'fisica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Interacción fundamental que actúa entre quarks manteniéndolos confinados en hadrones', 'gluonica', 'fisica', 'bachillerato', '{2}', 3),
('G', 'empieza', 'Constante de proporcionalidad en la ley de Coulomb que depende del medio en que están las cargas', 'gaussiana', 'fisica', 'bachillerato', '{2}', 2),

-- H (6)
('H', 'empieza', 'Partícula compuesta por quarks que experimenta la interacción fuerte, como protón o neutrón', 'hadron', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Tiempo que tarda un isótopo radiactivo en reducir su actividad a la mitad', 'halflife', 'fisica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Campo bosónico que permea el universo y da masa a las partículas fundamentales', 'higgs', 'fisica', 'bachillerato', '{2}', 3),
('H', 'empieza', 'Átomo que contiene un solo protón y un electrón, el más simple de todos', 'hidrogeno', 'fisica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Bobina inductora que almacena energía en forma de campo magnético', 'henrio', 'fisica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Ley que establece que la fem inducida se opone al cambio de flujo que la produce', 'hertziana', 'fisica', 'bachillerato', '{2}', 2),

-- I (6)
('I', 'empieza', 'Oposición total al paso de corriente alterna que combina resistencia y reactancia', 'impedancia', 'fisica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Fenómeno por el cual un campo magnético variable genera una fem en un circuito', 'induccion', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Isótopo de un elemento que se usa como trazador en medicina nuclear o datación', 'isotopo', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Cantidad de carga que pasa por una sección de conductor por unidad de tiempo', 'intensidad', 'fisica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Interacción fundamental que es responsable de la desintegración beta de los neutrones', 'interaccion', 'fisica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Patrón de franjas producido por la superposición de ondas coherentes', 'interferencia', 'fisica', 'bachillerato', '{2}', 2),

-- J (5)
('J', 'empieza', 'Unidad de energía en el SI que también mide el trabajo y el calor', 'julio', 'fisica', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Efecto que describe cómo varía la temperatura de un gas al expandirse libremente', 'joule', 'fisica', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Acoplamiento entre momentos angulares orbital y de espín en átomos multielectrónicos', 'jj', 'fisica', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Densidad de corriente que mide la corriente por unidad de área de sección del conductor', 'jdensidad', 'fisica', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Unión de dos materiales semiconductores tipo p y tipo n que permite el flujo de corriente en un sentido', 'juntura', 'fisica', 'bachillerato', '{2}', 2),

-- K (5)
('K', 'contiene', 'Partícula subatómica elemental con seis sabores: up, down, charm, strange, top y bottom', 'quark', 'fisica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Masa de un isótopo medida en unidades de masa atómica', 'daltonmk', 'fisica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Constante de Boltzmann que relaciona la temperatura con la energía cinética media de las partículas', 'boltzmannk', 'fisica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Primer modelo nuclear que describió el átomo con un núcleo positivo rodeado de electrones orbitando', 'rutherfordk', 'fisica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Efecto fotoeléctrico explicado por Einstein donde la energía del fotón es hf', 'planck', 'fisica', 'bachillerato', '{2}', 1),

-- L (6)
('L', 'empieza', 'Fuerza que experimenta una carga eléctrica al moverse dentro de un campo magnético', 'lorentz', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Serie espectral del hidrógeno con transiciones al nivel n = 1, en el ultravioleta', 'lyman', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Ley de inducción que afirma que la fem se opone a la variación del flujo que la origina', 'lenz', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Familia de partículas elementales que no experimentan la interacción fuerte, como electrones y neutrinos', 'lepton', 'fisica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Representación gráfica de las líneas de campo eléctrico que parten de cargas positivas hacia negativas', 'lineas', 'fisica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Coeficiente de autoinducción de una bobina, medido en henrios', 'inductancia', 'fisica', 'bachillerato', '{2}', 2),

-- M (6)
('M', 'empieza', 'Magnitud que mide la inercia de un cuerpo y su interacción gravitatoria', 'masa', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Partícula inestable de la familia de los leptones con masa mayor que la del electrón', 'muon', 'fisica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Campo creado por corrientes eléctricas y cargas en movimiento, representado por el vector B', 'magnetico', 'fisica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Defecto de masa en una reacción nuclear que se transforma en energía según E = Δm c²', 'masica', 'fisica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Partícula elemental mediadora de la interacción débil con gran masa', 'meson', 'fisica', 'bachillerato', '{2}', 3),
('M', 'empieza', 'Ecuación que describe la onda electromagnética como variación sinusoidal de los campos E y B', 'maxwell', 'fisica', 'bachillerato', '{2}', 2),

-- N (6)
('N', 'empieza', 'Partícula del núcleo atómico sin carga eléctrica y masa similar a la del protón', 'neutron', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Partícula elemental de masa casi nula que apenas interactúa con la materia', 'neutrino', 'fisica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Región central del átomo donde se concentra prácticamente toda la masa y la carga positiva', 'nucleo', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Número de nucleones de un átomo que define el isótopo junto con el número atómico', 'nucleon', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Energía de enlace que mantiene unidos protones y neutrones en el núcleo atómico', 'nuclear', 'fisica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Forma de la ley de Gauss del magnetismo que afirma que el flujo magnético neto a través de una superficie cerrada es cero', 'nulo', 'fisica', 'bachillerato', '{2}', 2),

-- O (6)
('O', 'empieza', 'Perturbación que transporta energía mediante oscilaciones de campos eléctrico y magnético perpendiculares', 'onda', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Propiedad de un conductor en circuito que se opone al paso de corriente, medida en ohmios', 'ohmio', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Rango de frecuencias de la radiación electromagnética ordenado de menor a mayor energía', 'optico', 'fisica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Tipo de desintegración donde el núcleo emite una partícula alfa reduciendo Z en 2 y A en 4', 'oro', 'fisica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Movimiento periódico de cargas en un circuito LC que produce ondas electromagnéticas', 'oscilador', 'fisica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Unidad de resistencia eléctrica en el SI, definida como voltio por amperio', 'ohm', 'fisica', 'bachillerato', '{2}', 1),

-- P (7)
('P', 'empieza', 'Serie espectral del hidrógeno con transiciones al nivel n = 3, en el infrarrojo', 'paschen', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Partícula fundamental del núcleo con carga positiva igual en magnitud a la del electrón', 'proton', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Constante fundamental que relaciona la energía de un fotón con su frecuencia, E = hf', 'planck', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Antipartícula del electrón con la misma masa pero carga positiva', 'positron', 'fisica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Magnitud escalar que en cada punto del campo indica la energía potencial por unidad de carga', 'potencial', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Fenómeno cuántico de emisión de electrones al iluminar un metal con luz de frecuencia suficiente', 'photoelectrico', 'fisica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Proceso de captura electrónica donde el núcleo absorbe un electrón de una capa interna', 'protonizacion', 'fisica', 'bachillerato', '{2}', 3),

-- Q (5)
('Q', 'empieza', 'Partícula elemental con carga fraccionaria (±1/3 o ±2/3 de la carga del electrón) que forma hadrones', 'quark', 'fisica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Propiedad discreta de la energía que solo puede tomar ciertos valores permitidos', 'quantizacion', 'fisica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Disciplina que estudia la desintegración nuclear y la producción de isótopos artificiales', 'quimica', 'fisica', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Electrodinámica que describe la interacción electromagnética a nivel cuántico', 'qed', 'fisica', 'bachillerato', '{2}', 3),
('Q', 'empieza', 'Cromodinámica que describe la interacción fuerte entre quarks mediada por gluones', 'qcd', 'fisica', 'bachillerato', '{2}', 3),

-- R (6)
('R', 'empieza', 'Instalación donde se mantiene una reacción nuclear de fisión en cadena de forma controlada', 'reactor', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Propiedad de ciertos núcleos atómicos inestables de emitir partículas y radiación espontáneamente', 'radiactividad', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Oposición que ofrece un circuito eléctrico al paso de la corriente alterna, parte real de la impedancia', 'resistencia', 'fisica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Componente de la impedancia debida a bobinas o condensadores que desfasa corriente y voltaje', 'reactancia', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Ley que establece la fuerza entre un conductor rectilíneo con corriente y un campo magnético', 'regla', 'fisica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Fórmula que da las longitudes de onda de las líneas espectrales del hidrógeno', 'rydberg', 'fisica', 'bachillerato', '{2}', 2),

-- S (6)
('S', 'empieza', 'Superficie donde el potencial eléctrico es constante y las líneas de campo son perpendiculares', 'superficie', 'fisica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Hilo conductor enrollado que genera campo magnético al circular corriente por él', 'solenoide', 'fisica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Distribución continua de frecuencias emitidas por un cuerpo incandescente', 'spectral', 'fisica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Acelerador circular de partículas donde el campo magnético aumenta conforme las partículas ganan energía', 'sincrotron', 'fisica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Propiedad del espín que distingue quarks de diferentes sabores en el modelo estándar', 'sabor', 'fisica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Modelo teórico que clasifica todas las partículas elementales conocidas y sus interacciones', 'standar', 'fisica', 'bachillerato', '{2}', 2),

-- T (6)
('T', 'empieza', 'Teorema que relaciona el flujo del campo eléctrico a través de una superficie cerrada con la carga interior', 'teorema', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Componente del circuito que transforma voltaje alterno de un nivel a otro usando inducción mutua', 'transformador', 'fisica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Unidad de inducción magnética en el SI equivalente a un weber por metro cuadrado', 'tesla', 'fisica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Radiación electromagnética que no ioniza pero transporta energía entre objetos por diferencia de temperatura', 'termica', 'fisica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Efecto cuántico donde una partícula atraviesa una barrera de potencial mayor que su energía cinética', 'tunel', 'fisica', 'bachillerato', '{2}', 3),
('T', 'empieza', 'Sabor de quark más pesado conocido, detectado en el Tevatron en 1995', 'top', 'fisica', 'bachillerato', '{2}', 3),

-- U (5)
('U', 'empieza', 'Isótopo del uranio usado como combustible en reactores nucleares de fisión', 'uranio', 'fisica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Unidad de flujo magnético en el SI, también llamada weber', 'unidad', 'fisica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Radiación electromagnética con frecuencia mayor que la luz visible y menor que los rayos X', 'ultravioleta', 'fisica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Principio que prohíbe conocer con precisión absoluta simultáneamente energía y tiempo de una partícula', 'uncertainty', 'fisica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Modelo cosmológico que describe la evolución del universo desde el Big Bang', 'universo', 'fisica', 'bachillerato', '{2}', 1),

-- V (6)
('V', 'empieza', 'Unidad de diferencia de potencial en el SI, equivalente a julio por culombio', 'voltio', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Tiempo necesario para que se desintegre la mitad de una muestra radiactiva', 'vida', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Rapidez a la que se propaga una onda electromagnética en el vacío, unos 3×10⁸ m/s', 'velocidad', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Diferencia de potencial en bornes de un generador cuando no circula corriente', 'voltaje', 'fisica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Partícula mediadora de la interacción débil con masa elevada, denominada W o Z', 'vectorial', 'fisica', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Línea de fuerza del campo magnético que forma curvas cerradas sin inicio ni final', 'vortice', 'fisica', 'bachillerato', '{2}', 2),

-- W (5)
('W', 'contiene', 'Unidad de flujo magnético en el SI equivalente a voltio por segundo', 'weber', 'fisica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Potencia disipada en un circuito que se mide en vatios', 'watt', 'fisica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Ecuación que une la energía y la masa de forma equivalente según la relatividad especial', 'einsteinmcw', 'fisica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Bosón mediador de la interacción débil con carga eléctrica positiva o negativa', 'bosonw', 'fisica', 'bachillerato', '{2}', 3),
('W', 'contiene', 'Descubrimiento del neutrón por James Chadwick en 1932 usando bombardeo de partículas alfa', 'chadwick', 'fisica', 'bachillerato', '{2}', 2),

-- X (5)
('X', 'contiene', 'Radiación electromagnética de alta frecuencia usada en diagnóstico médico y cristalografía', 'rayosx', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Ecuación de equivalencia masa-energía que implica el factor c al cuadrado', 'emc2exacto', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Técnica de difracción que permite determinar la estructura cristalina de los materiales', 'cristalografiax', 'fisica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Número de protones que determina el elemento químico y sus propiedades', 'sexto', 'fisica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Efecto relativista de dilatación temporal donde el tiempo transcurre más lento a velocidades cercanas a c', 'paradoxatiempo', 'fisica', 'bachillerato', '{2}', 3),

-- Y (5)
('Y', 'contiene', 'Tipo de desintegración radiactiva donde se emite radiación electromagnética de alta energía sin partículas masivas', 'rayogamma', 'fisica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Ley de Faraday-Lenz que explica la dirección de la corriente inducida en un circuito', 'faradaylenz', 'fisica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Dispositivo que transforma energía nuclear en eléctrica mediante una reacción de fisión controlada', 'energeticoy', 'fisica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Propiedad de un bosón que media la interacción entre partículas del modelo estándar', 'bosonycarga', 'fisica', 'bachillerato', '{2}', 3),
('Y', 'contiene', 'Constante de Rydberg que aparece en la fórmula de las líneas espectrales del hidrógeno', 'rydbergylineas', 'fisica', 'bachillerato', '{2}', 2),

-- Z (5)
('Z', 'contiene', 'Bosón neutro mediador de la interacción débil predicho por el modelo electrodébil', 'bosonz', 'fisica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Número de protones en el núcleo que define cada elemento de la tabla periódica', 'atomicoz', 'fisica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Efecto de desdoblamiento de niveles de energía atómicos por un campo magnético externo', 'zeeman', 'fisica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Fuerza de atracción o repulsión entre dos cargas puntuales descrita por la ley de Coulomb', 'coulombfuerza', 'fisica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Corriente eléctrica alterna cuya intensidad varía de forma sinusoidal con una frecuencia de 50 Hz en Europa', 'hertzios', 'fisica', 'bachillerato', '{2}', 1),

-- ============================================================
-- QUIMICA 2º BACHILLERATO (150 preguntas)
-- ============================================================

-- A (6)
('A', 'empieza', 'Tipo de valoración donde un oxidante y un reductor reaccionan intercambiando electrones', 'ajuste', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Sustancia que en disolución acuosa libera iones H⁺ según Brønsted-Lowry', 'acido', 'quimica', 'bachillerato', '{2}', 1),
('A', 'empieza', 'Polímero formado por reacción de monómeros con doble enlace que se abren para unirse', 'adicion', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Isomería donde dos grupos están al mismo lado o en lados opuestos de un doble enlace', 'alqueno', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Carbono asimétrico enlazado a cuatro sustituyentes diferentes que genera quiralidad', 'asimetrico', 'quimica', 'bachillerato', '{2}', 2),
('A', 'empieza', 'Hidrocarburo aromático de seis carbonos con enlaces deslocalizados, base de la química del benceno', 'aromatico', 'quimica', 'bachillerato', '{2}', 1),

-- B (6)
('B', 'empieza', 'Sustancia que en disolución acuosa acepta iones H⁺ según Brønsted-Lowry', 'base', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Molécula orgánica esencial para la vida: proteínas, lípidos, carbohidratos o ácidos nucleicos', 'biomolecula', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Hidrocarburo cíclico con tres dobles enlaces conjugados alternos que confiere estabilidad extra', 'benceno', 'quimica', 'bachillerato', '{2}', 1),
('B', 'empieza', 'Disolución reguladora que resiste cambios de pH al añadir pequeñas cantidades de ácido o base', 'buffer', 'quimica', 'bachillerato', '{2}', 2),
('B', 'empieza', 'Enlace de alta energía presente en el ATP que al romperse libera energía para procesos biológicos', 'bioquimico', 'quimica', 'bachillerato', '{2}', 3),
('B', 'empieza', 'Proceso donde un electrón es transferido de un reductor a un oxidante en una celda', 'bateria', 'quimica', 'bachillerato', '{2}', 2),

-- C (7)
('C', 'empieza', 'Polímero formado por reacción entre monómeros con pérdida de una molécula pequeña como agua', 'condensacion', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Velocidad de una reacción expresada como cambio de concentración por unidad de tiempo', 'cinetica', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Sustancia que acelera una reacción sin consumirse, disminuyendo la energía de activación', 'catalizador', 'quimica', 'bachillerato', '{2}', 1),
('C', 'empieza', 'Configuración R o S de un carbono quiral asignada según las reglas de prioridad CIP', 'configuracion', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Propiedad de una molécula de no ser superponible con su imagen especular', 'quiralidad', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Proceso electroquímico donde una corriente eléctrica fuerza una reacción no espontánea', 'catodo', 'quimica', 'bachillerato', '{2}', 2),
('C', 'empieza', 'Constante que relaciona la fem de una pila con las concentraciones de las especies en disolución', 'celda', 'quimica', 'bachillerato', '{2}', 2),

-- D (6)
('D', 'empieza', 'Fracción del electrolito que se ha separado en iones en disolución', 'disociacion', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Valor de la variación de entalpía cuando se forma un mol de compuesto a partir de sus elementos en estado estándar', 'dilucion', 'quimica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Isómeros que son imágenes especulares no superponibles, como las manos', 'diastereomero', 'quimica', 'bachillerato', '{2}', 3),
('D', 'empieza', 'Tipo de enlace covalente donde los electrones se comparten de forma desigual por diferencia de electronegatividad', 'dipolo', 'quimica', 'bachillerato', '{2}', 1),
('D', 'empieza', 'Producto de una electrólisis que se deposita en el cátodo cuando se reducen cationes metálicos', 'deposito', 'quimica', 'bachillerato', '{2}', 2),
('D', 'empieza', 'Desplazamiento del equilibrio al añadir un ion que ya está presente en la disolución', 'desplazamiento', 'quimica', 'bachillerato', '{2}', 2),

-- E (7)
('E', 'empieza', 'Proceso por el cual la corriente eléctrica provoca una reacción química de oxidación-reducción', 'electrolisis', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Isomería geométrica donde los sustituyentes prioritarios están en lados opuestos del doble enlace', 'entgegen', 'quimica', 'bachillerato', '{2}', 3),
('E', 'empieza', 'Calor intercambiado a presión constante en una reacción, simbolizado por ΔH', 'entalpia', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Punto de una valoración ácido-base donde las cantidades de ácido y base son estequiométricamente iguales', 'equivalencia', 'quimica', 'bachillerato', '{2}', 1),
('E', 'empieza', 'Potencial eléctrico de un electrodo medido frente al electrodo estándar de hidrógeno', 'electrodo', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Tipo de estereoisomería donde los isómeros son imágenes especulares entre sí', 'enantiomero', 'quimica', 'bachillerato', '{2}', 2),
('E', 'empieza', 'Efecto por el cual un ion común desplaza el equilibrio de disociación de un electrolito débil', 'efecto', 'quimica', 'bachillerato', '{2}', 2),

-- F (6)
('F', 'empieza', 'Ley que relaciona la masa depositada en la electrólisis con la carga eléctrica y la masa molar', 'faraday', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Cambio de entalpía total calculado como suma algebraica de las entalpías de las etapas intermedias', 'formacion', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Sustancia que cambia de color según el pH del medio, usada para detectar el punto final de una valoración', 'fenolftaleina', 'quimica', 'bachillerato', '{2}', 1),
('F', 'empieza', 'Grupo funcional carbonilo unido a un hidrógeno y a un grupo alquilo o arilo', 'formilo', 'quimica', 'bachillerato', '{2}', 2),
('F', 'empieza', 'Factor que multiplica la constante de velocidad cuando aumenta la temperatura, según la ecuación de Arrhenius', 'frecuencia', 'quimica', 'bachillerato', '{2}', 3),
('F', 'empieza', 'Tipo de fórmula que muestra cómo están unidos los átomos pero no su disposición espacial', 'formula', 'quimica', 'bachillerato', '{2}', 1),

-- G (6)
('G', 'empieza', 'Fracción del electrolito que se disocia, expresada como cociente entre moles disociados y totales', 'grado', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Energía libre cuyo signo negativo indica que la reacción es espontánea a T y P constantes', 'gibbs', 'quimica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Molécula orgánica resultante de la esterificación de glicerol con ácidos grasos', 'grasa', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Tipo de polímero donde la cadena principal contiene grupos funcionales como éster o amida', 'grupo', 'quimica', 'bachillerato', '{2}', 2),
('G', 'empieza', 'Monosacárido de seis carbonos que es la principal fuente de energía celular', 'glucosa', 'quimica', 'bachillerato', '{2}', 1),
('G', 'empieza', 'Estado de la materia donde las partículas tienen máxima libertad de movimiento', 'gaseoso', 'quimica', 'bachillerato', '{2}', 1),

-- H (6)
('H', 'empieza', 'Reacción de una sal con agua que puede producir disoluciones ácidas o básicas', 'hidrolisis', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Ley que permite calcular la entalpía de reacción global sumando entalpías de etapas intermedias', 'hess', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Grupo funcional –OH unido a un carbono alifático presente en alcoholes', 'hidroxilo', 'quimica', 'bachillerato', '{2}', 1),
('H', 'empieza', 'Reacción de adición de agua a un alqueno en presencia de un catalizador ácido', 'hidratacion', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Tipo de carbono unido a cuatro átomos o grupos con geometría tetraédrica y ángulos de 109,5°', 'hibridacion', 'quimica', 'bachillerato', '{2}', 2),
('H', 'empieza', 'Compuesto orgánico formado exclusivamente por carbono e hidrógeno', 'hidrocarburo', 'quimica', 'bachillerato', '{2}', 1),

-- I (6)
('I', 'empieza', 'Sustancia que cambia de color en función del pH para señalar el punto final de una valoración', 'indicador', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Compuestos con la misma fórmula molecular pero diferente disposición de los átomos en el espacio', 'isomeros', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Reacción electrofílica típica del benceno donde un hidrógeno se sustituye por un electrófilo', 'isomeria', 'quimica', 'bachillerato', '{2}', 2),
('I', 'empieza', 'Propiedad de una molécula que posee un carbono con cuatro sustituyentes distintos y no es superponible con su espejo', 'inversión', 'quimica', 'bachillerato', '{2}', 3),
('I', 'empieza', 'Átomo o grupo de átomos con carga eléctrica neta, positiva (catión) o negativa (anión)', 'ion', 'quimica', 'bachillerato', '{2}', 1),
('I', 'empieza', 'Producto de la constante iónica del agua, Kw = [H⁺][OH⁻] = 10⁻¹⁴ a 25 °C', 'ionico', 'quimica', 'bachillerato', '{2}', 2),

-- J (5)
('J', 'empieza', 'Unidad de energía del SI usada para medir entalpías, energías de activación y trabajo eléctrico', 'julio', 'quimica', 'bachillerato', '{2}', 1),
('J', 'empieza', 'Efecto de la temperatura sobre la velocidad de reacción descrito por la ecuación de Arrhenius', 'jarabe', 'quimica', 'bachillerato', '{2}', 2),
('J', 'empieza', 'Disposición de los átomos en el espacio de un estereoisómero que no puede interconvertirse sin romper enlaces', 'jerarquizacion', 'quimica', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Factor preexponencial de la ecuación de Arrhenius que depende de la frecuencia de colisiones', 'jfrecuencia', 'quimica', 'bachillerato', '{2}', 3),
('J', 'empieza', 'Energía expresada en kilojulios por mol usada para cuantificar cambios entálpicos en termoquímica', 'juliosmol', 'quimica', 'bachillerato', '{2}', 1),

-- K (5)
('K', 'contiene', 'Constante de equilibrio de la reacción de autoprotólisis del agua, Kw = 10⁻¹⁴ a 25°C', 'autoprotolisiskw', 'quimica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Expresión matemática del equilibrio químico como cociente de concentraciones elevadas a coeficientes estequiométricos', 'equilibriokc', 'quimica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Energía mínima que deben tener los reactivos para que una colisión sea eficaz', 'activacionek', 'quimica', 'bachillerato', '{2}', 1),
('K', 'contiene', 'Efecto donde la adición de un ion ya presente desplaza el equilibrio de disociación, reduciendo la solubilidad', 'ioncomunksp', 'quimica', 'bachillerato', '{2}', 2),
('K', 'contiene', 'Polímero como el polietileno o el PVC obtenido por apertura de dobles enlaces entre monómeros', 'polimerizacionk', 'quimica', 'bachillerato', '{2}', 2),

-- L (6)
('L', 'empieza', 'Biomoléculas insolubles en agua formadas por ácidos grasos y glicerol, como grasas y fosfolípidos', 'lipido', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Ley que establece que la velocidad depende de la concentración de los reactivos elevada a un exponente', 'ley', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Principio que afirma que si se perturba un equilibrio, el sistema se desplaza para contrarrestar la perturbación', 'lechatelier', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Enlace peptídico que une aminoácidos mediante la unión del grupo amino de uno con el carboxilo del siguiente', 'ligadura', 'quimica', 'bachillerato', '{2}', 2),
('L', 'empieza', 'Escala logarítmica que mide la acidez o basicidad de una disolución, pH = -log[H⁺]', 'logaritmico', 'quimica', 'bachillerato', '{2}', 1),
('L', 'empieza', 'Macromolécula formada por repetición de unidades más pequeñas llamadas monómeros', 'larga', 'quimica', 'bachillerato', '{2}', 1),

-- M (6)
('M', 'empieza', 'Secuencia de reacciones elementales que describen cómo se transforman los reactivos en productos', 'mecanismo', 'quimica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Unidad repetitiva más pequeña que al polimerizarse forma una cadena polimérica', 'monomero', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Número de moles de soluto disueltos en un litro de disolución', 'molaridad', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Exponente al que se eleva la concentración de un reactivo en la ley de velocidad', 'molecularidad', 'quimica', 'bachillerato', '{2}', 2),
('M', 'empieza', 'Molécula grande formada por la unión covalente de muchas unidades repetitivas', 'macromolecula', 'quimica', 'bachillerato', '{2}', 1),
('M', 'empieza', 'Carbono con doble enlace cuya isomería cis/trans depende de los sustituyentes a cada lado', 'mezcla', 'quimica', 'bachillerato', '{2}', 2),

-- N (6)
('N', 'empieza', 'Ecuación que da la fem de una pila cuando las concentraciones no son las estándar', 'nernst', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Reacción de un ácido con una base que produce sal y agua', 'neutralizacion', 'quimica', 'bachillerato', '{2}', 1),
('N', 'empieza', 'Macromolécula que almacena la información genética, como el ADN y el ARN', 'nucleotido', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Polímero natural o sintético como el nailon, formado por enlaces amida', 'nylon', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Tipo de reacción sustitutiva en el benceno donde un grupo NO₂ entra en el anillo', 'nitracion', 'quimica', 'bachillerato', '{2}', 2),
('N', 'empieza', 'Grupo funcional –NH₂ presente en aminas y aminoácidos', 'nitrogenado', 'quimica', 'bachillerato', '{2}', 1),

-- O (6)
('O', 'empieza', 'Proceso donde una especie pierde electrones y aumenta su número de oxidación', 'oxidacion', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Exponente de la concentración en la ley de velocidad que determina la cinética de la reacción', 'orden', 'quimica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Estereoisomería E/Z o cis/trans que surge por la rotación impedida alrededor de un doble enlace', 'optica', 'quimica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Parte de una molécula orgánica que da propiedades químicas características, como –OH, –COOH, –NH₂', 'organica', 'quimica', 'bachillerato', '{2}', 1),
('O', 'empieza', 'Proceso inverso de la oxidación donde una especie gana electrones', 'obtencion', 'quimica', 'bachillerato', '{2}', 2),
('O', 'empieza', 'Hidrólisis de una sal de ácido débil y base fuerte que produce disolución básica', 'oxigeno', 'quimica', 'bachillerato', '{2}', 1),

-- P (7)
('P', 'empieza', 'Macromolécula formada por la unión de muchos monómeros mediante enlaces covalentes', 'polimero', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Escala que mide la concentración de iones hidrógeno en disolución, de 0 a 14 típicamente', 'ph', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Macromolécula biológica formada por aminoácidos unidos por enlaces peptídicos', 'proteina', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Potencial eléctrico estándar de reducción de un electrodo, medido en voltios frente al EEH', 'potencial', 'quimica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Reacción de polimerización por adición donde los monómeros se unen abriendo sus dobles enlaces', 'poliadicion', 'quimica', 'bachillerato', '{2}', 2),
('P', 'empieza', 'Enlace que une el grupo amino de un aminoácido con el carboxilo del siguiente eliminando agua', 'peptidico', 'quimica', 'bachillerato', '{2}', 1),
('P', 'empieza', 'Pila electroquímica que genera corriente eléctrica a partir de una reacción redox espontánea', 'pila', 'quimica', 'bachillerato', '{2}', 1),

-- Q (5)
('Q', 'empieza', 'Rama de la química que estudia los compuestos del carbono y sus reacciones', 'quimica', 'quimica', 'bachillerato', '{2}', 1),
('Q', 'empieza', 'Propiedad de una molécula que no es superponible con su imagen especular', 'quiral', 'quimica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Configuración de un centro quiral asignada según las reglas de prioridad de Cahn-Ingold-Prelog', 'quiralidad', 'quimica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Cociente de reacción que se compara con K para predecir la dirección del desplazamiento del equilibrio', 'qreaccion', 'quimica', 'bachillerato', '{2}', 2),
('Q', 'empieza', 'Cantidad de electricidad necesaria para depositar un equivalente-gramo de sustancia en la electrólisis', 'qfaraday', 'quimica', 'bachillerato', '{2}', 2),

-- R (6)
('R', 'empieza', 'Proceso electroquímico donde una especie gana electrones disminuyendo su número de oxidación', 'reduccion', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Especie química que cede electrones en una reacción redox, oxidándose', 'reductor', 'quimica', 'bachillerato', '{2}', 1),
('R', 'empieza', 'Reacción típica del benceno donde un sustituyente del anillo es reemplazado por otro grupo', 'reactividad', 'quimica', 'bachillerato', '{2}', 2),
('R', 'empieza', 'Configuración espacial de un centro quiral según las reglas CIP, designada con letra latina', 'rectus', 'quimica', 'bachillerato', '{2}', 3),
('R', 'empieza', 'Etapa más lenta de un mecanismo de reacción que determina la velocidad global', 'rds', 'quimica', 'bachillerato', '{2}', 3),
('R', 'empieza', 'Par ácido-base conjugado que comparte un protón entre las dos especies', 'reciproco', 'quimica', 'bachillerato', '{2}', 2),

-- S (6)
('S', 'empieza', 'Configuración de un centro estereogénico opuesta a R según las reglas de prioridad CIP', 'sinister', 'quimica', 'bachillerato', '{2}', 3),
('S', 'empieza', 'Proceso de reemplazar un átomo o grupo en una molécula por otro distinto', 'sustitucion', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Producto de solubilidad, constante de equilibrio para la disolución de una sal poco soluble', 'solubilidad', 'quimica', 'bachillerato', '{2}', 2),
('S', 'empieza', 'Unidad monomérica de los carbohidratos, como la glucosa o la fructosa', 'sacarido', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Sal que al disolverse en agua produce hidrólisis por provenir de ácido débil y base fuerte, o viceversa', 'sal', 'quimica', 'bachillerato', '{2}', 1),
('S', 'empieza', 'Etapa individual de un mecanismo de reacción que ocurre en un solo acto molecular', 'simple', 'quimica', 'bachillerato', '{2}', 2),

-- T (6)
('T', 'empieza', 'Rama de la química que estudia los intercambios de calor y energía en las reacciones', 'termoquimica', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Punto de una valoración donde el indicador cambia de color, idealmente coincidente con el de equivalencia', 'transicion', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Técnica analítica que determina la concentración de un ácido o base añadiendo una disolución patrón', 'titulacion', 'quimica', 'bachillerato', '{2}', 1),
('T', 'empieza', 'Material plástico que se ablanda al calentar y se endurece al enfriar, de forma reversible', 'termoplastico', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Tipo de polímero que al calentarse se endurece irreversiblemente por formación de entrecruzamientos', 'termoestable', 'quimica', 'bachillerato', '{2}', 2),
('T', 'empieza', 'Función de estado termodinámica que mide la energía total de formación de un sistema a presión constante', 'total', 'quimica', 'bachillerato', '{2}', 1),

-- U (5)
('U', 'empieza', 'Molécula orgánica nitrogenada presente en la orina como producto de desecho del metabolismo proteico', 'urea', 'quimica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Cada repetición monomérica dentro de la cadena de un polímero', 'unidad', 'quimica', 'bachillerato', '{2}', 1),
('U', 'empieza', 'Enlace doble carbono-carbono presente en alquenos que permite isomería geométrica', 'unsaturacion', 'quimica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Base nitrogenada pirimidínica presente en el ARN pero no en el ADN', 'uracilo', 'quimica', 'bachillerato', '{2}', 2),
('U', 'empieza', 'Reacción unimolecular cuya etapa determinante implica un solo reactivo', 'unimolecular', 'quimica', 'bachillerato', '{2}', 3),

-- V (6)
('V', 'empieza', 'Técnica que mide la concentración de una disolución añadiendo reactivo patrón hasta el punto de equivalencia', 'valoracion', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Magnitud que indica la rapidez con que se consumen los reactivos o se forman los productos', 'velocidad', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Diferencia de potencial eléctrico en una celda electroquímica medida en voltios', 'voltaje', 'quimica', 'bachillerato', '{2}', 1),
('V', 'empieza', 'Reacción redox donde el mismo elemento se oxida y se reduce simultáneamente', 'valencias', 'quimica', 'bachillerato', '{2}', 3),
('V', 'empieza', 'Propiedad de los aminoácidos de actuar como ácidos o bases dependiendo del pH del medio', 'versatil', 'quimica', 'bachillerato', '{2}', 2),
('V', 'empieza', 'Volumen de disolución patrón necesario para alcanzar el punto de equivalencia en una valoración', 'volumen', 'quimica', 'bachillerato', '{2}', 1),

-- W (5)
('W', 'contiene', 'Constante de autoionización del agua cuyo valor es 10⁻¹⁴ a 25°C', 'kw', 'quimica', 'bachillerato', '{2}', 1),
('W', 'contiene', 'Ley que afirma que la entalpía de una reacción global es la suma de las entalpías de sus etapas', 'hessley', 'quimica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Ecuación que relaciona la fem de una pila con las actividades de las especies a temperatura dada', 'nernstew', 'quimica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Principio de Le Chatelier que predice cómo responde un equilibrio a cambios de concentración, presión o temperatura', 'chatelierwp', 'quimica', 'bachillerato', '{2}', 2),
('W', 'contiene', 'Ecuación de velocidad para una reacción de segundo orden donde la concentración aparece elevada al cuadrado', 'arrheniuswk', 'quimica', 'bachillerato', '{2}', 3),

-- X (5)
('X', 'contiene', 'Especie química que cede electrones a otra en una reacción de transferencia electrónica', 'oxidante', 'quimica', 'bachillerato', '{2}', 1),
('X', 'contiene', 'Proceso de polimerización por condensación con eliminación de moléculas pequeñas', 'policondensacionx', 'quimica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Tipo de reacción donde un hidrógeno del benceno es sustituido por un halógeno', 'halogenacionex', 'quimica', 'bachillerato', '{2}', 2),
('X', 'contiene', 'Mezcla de dos enantiómeros en proporciones desiguales que presenta actividad óptica neta', 'exceso', 'quimica', 'bachillerato', '{2}', 3),
('X', 'contiene', 'Reacción exotérmica donde la entalpía de los productos es menor que la de los reactivos', 'exotermica', 'quimica', 'bachillerato', '{2}', 1),

-- Y (5)
('Y', 'contiene', 'Proceso por el cual una sal disuelta en agua genera iones que modifican el pH de la disolución', 'hidrolisisy', 'quimica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Enlace entre dos aminoácidos mediante condensación de los grupos amino y carboxilo', 'peptidoy', 'quimica', 'bachillerato', '{2}', 1),
('Y', 'contiene', 'Polímero sintético obtenido por polimerización de adición del cloruro de vinilo', 'poliviniloy', 'quimica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Material polimérico con propiedades elásticas que recupera su forma original tras deformarse', 'elastomeroy', 'quimica', 'bachillerato', '{2}', 2),
('Y', 'contiene', 'Diagrama que representa la variación de energía a lo largo de la coordenada de reacción', 'energeticoy', 'quimica', 'bachillerato', '{2}', 1),

-- Z (5)
('Z', 'contiene', 'Isomería geométrica donde los sustituyentes prioritarios están al mismo lado del doble enlace', 'zusammen', 'quimica', 'bachillerato', '{2}', 2),
('Z', 'contiene', 'Catalizador biológico de naturaleza proteica que acelera reacciones metabólicas específicas', 'enzima', 'quimica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Estado de equilibrio dinámico donde las velocidades directa e inversa de la reacción se igualan', 'equilibrioz', 'quimica', 'bachillerato', '{2}', 1),
('Z', 'contiene', 'Punto isoeléctrico de un aminoácido donde la carga neta es cero', 'zwitterion', 'quimica', 'bachillerato', '{2}', 3),
('Z', 'contiene', 'Tipo de mezcla racémica formada por cantidades iguales de dos enantiómeros sin actividad óptica', 'racemica', 'quimica', 'bachillerato', '{2}', 2);
