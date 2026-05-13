// src/apps/infografias-interactivas/data/infografiasData.js
// Catálogo de infografías interactivas. Cada infografía define:
//   - zones: puntos numerados sobre la imagen (% x, % y) que el alumno debe etiquetar
//   - questions: preguntas de opción múltiple sobre el contenido
//   - targets: cursos/asignaturas donde aparece (level + grades + subjects)
//
// Las posiciones (x, y) son porcentajes 0-100 del ancho y alto de la imagen.
// Aliases son alternativas válidas (sin tildes / sinónimos cortos).

export const INFOGRAFIAS = [
  // -------------------------------------------------------------------
  {
    id: 'ciclo-agua',
    title: 'El ciclo del agua',
    subtitle: 'Procesos hidrológicos en la Tierra',
    image: '/images/infografias/01-ciclo-agua.webp',
    icon: '💧',
    targets: [
      { level: 'primaria', grades: [3, 4, 5, 6], subjects: ['ciencias-naturales'] },
      { level: 'eso', grades: [1, 2, 3], subjects: ['biologia'] },
    ],
    zones: [
      { n: 1, x: 23, y: 20, label: 'Evaporación', aliases: ['evaporacion'] },
      { n: 4, x: 65, y: 16, label: 'Condensación', aliases: ['condensacion'] },
      { n: 5, x: 72, y: 32, label: 'Precipitación', aliases: ['precipitacion', 'lluvia'] },
      { n: 7, x: 73, y: 52, label: 'Infiltración', aliases: ['infiltracion'] },
      { n: 10, x: 22, y: 62, label: 'Acumulación', aliases: ['acumulacion', 'almacenamiento'] },
    ],
    questions: [
      { q: '¿Qué proceso convierte el agua líquida en vapor por efecto del calor solar?', options: ['Evaporación', 'Condensación', 'Infiltración', 'Precipitación'], correct: 0 },
      { q: '¿Cómo se llama el agua que cae del cielo en forma de lluvia, nieve o granizo?', options: ['Escorrentía', 'Precipitación', 'Transpiración', 'Percolación'], correct: 1 },
      { q: 'La transformación del vapor de agua en gotas que forman nubes se llama:', options: ['Evaporación', 'Acumulación', 'Condensación', 'Infiltración'], correct: 2 },
      { q: '¿Qué tipo de flujos circula bajo tierra entre las rocas y acuíferos?', options: ['Flujos atmosféricos', 'Flujos superficiales', 'Flujos subterráneos', 'Flujos solares'], correct: 2 },
      { q: 'La liberación de vapor de agua a través de las plantas se llama:', options: ['Evaporación', 'Transpiración', 'Sublimación', 'Precipitación'], correct: 1 },
      { q: '¿Qué fuente de energía impulsa el ciclo del agua?', options: ['El viento', 'El Sol', 'La gravedad terrestre', 'La rotación de la Tierra'], correct: 1 },
      { q: 'El agua que penetra en el suelo a través de la superficie se llama:', options: ['Escorrentía', 'Infiltración', 'Evaporación', 'Condensación'], correct: 1 },
      { q: '¿Dónde se almacena la mayor parte del agua dulce líquida del planeta?', options: ['En los océanos', 'En los acuíferos y lagos', 'En las nubes', 'En los seres vivos'], correct: 1 },
      { q: 'El paso directo de hielo a vapor (sin pasar por líquido) se llama:', options: ['Fusión', 'Sublimación', 'Evaporación', 'Condensación'], correct: 1 },
      { q: '¿Qué porcentaje aproximado del agua del planeta es agua dulce?', options: ['Un 3%', 'Un 30%', 'Un 50%', 'Un 97%'], correct: 0 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'fotosintesis',
    title: 'La fotosíntesis',
    subtitle: 'Conversión de energía lumínica en química',
    image: '/images/infografias/02-fotosintesis.webp',
    icon: '🌱',
    targets: [
      { level: 'primaria', grades: [4, 5, 6], subjects: ['ciencias-naturales'] },
      { level: 'eso', grades: [1, 2, 3], subjects: ['biologia'] },
    ],
    zones: [
      { n: 2, x: 47, y: 14, label: 'Hojas', aliases: ['las hojas', 'hoja'] },
      { n: 3, x: 65, y: 16, label: 'CO2', aliases: ['dióxido de carbono', 'dioxido de carbono', 'co₂'] },
      { n: 4, x: 79, y: 20, label: 'Oxígeno', aliases: ['oxigeno', 'o2', 'o₂'] },
      { n: 5, x: 38, y: 36, label: 'Glucosa', aliases: ['azúcar', 'azucar', 'c6h12o6'] },
      { n: 6, x: 28, y: 53, label: 'Raíces', aliases: ['raices', 'raiz'] },
    ],
    questions: [
      { q: '¿Qué pigmento permite a las plantas captar la luz solar?', options: ['Clorofila', 'Melanina', 'Hemoglobina', 'Caroteno'], correct: 0 },
      { q: 'En la fotosíntesis, las plantas absorben agua del suelo y este gas del aire:', options: ['Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Hidrógeno'], correct: 2 },
      { q: '¿Cuál es el producto final azucarado de la fotosíntesis?', options: ['Almidón', 'Glucosa', 'Fructosa', 'Sacarosa'], correct: 1 },
      { q: 'La fase de la fotosíntesis que ocurre en las membranas de los tilacoides se llama:', options: ['Ciclo de Calvin', 'Fase oscura', 'Fase luminosa', 'Glucólisis'], correct: 2 },
      { q: '¿Qué gas liberan las plantas como producto de la fotosíntesis?', options: ['CO2', 'O2', 'N2', 'H2'], correct: 1 },
      { q: '¿En qué orgánulo de la célula vegetal se realiza la fotosíntesis?', options: ['Mitocondria', 'Núcleo', 'Cloroplasto', 'Ribosoma'], correct: 2 },
      { q: 'La ecuación global de la fotosíntesis produce glucosa y:', options: ['Nitrógeno', 'Oxígeno', 'Hidrógeno', 'Dióxido de carbono'], correct: 1 },
      { q: 'Los organismos que fabrican su propio alimento mediante fotosíntesis son:', options: ['Heterótrofos', 'Autótrofos', 'Descomponedores', 'Carnívoros'], correct: 1 },
      { q: 'El ciclo de Calvin se produce en:', options: ['El estroma del cloroplasto', 'La membrana del tilacoide', 'La mitocondria', 'El núcleo'], correct: 0 },
      { q: 'La fotosíntesis transforma energía:', options: ['Eléctrica en química', 'Lumínica en química', 'Mecánica en térmica', 'Térmica en eléctrica'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'estados-materia',
    title: 'Estados de la materia',
    subtitle: 'Propiedades macro y comportamiento microscópico',
    image: '/images/infografias/03-estados-materia.webp',
    icon: '🧊',
    targets: [
      { level: 'primaria', grades: [5, 6], subjects: ['ciencias-naturales'] },
      { level: 'eso', grades: [1, 2, 3, 4], subjects: ['fisica'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['fisica', 'quimica'] },
    ],
    zones: [
      { n: 1, x: 19, y: 12, label: 'Sólido', aliases: ['solido'] },
      { n: 2, x: 41, y: 12, label: 'Líquido', aliases: ['liquido'] },
      { n: 3, x: 62, y: 12, label: 'Gas', aliases: ['gaseoso'] },
      { n: 4, x: 84, y: 12, label: 'Plasma', aliases: [] },
      { n: 5, x: 50, y: 55, label: 'Fusión', aliases: ['fusion'] },
    ],
    questions: [
      { q: '¿En qué estado las partículas tienen forma y volumen definidos y están muy próximas?', options: ['Sólido', 'Líquido', 'Gas', 'Plasma'], correct: 0 },
      { q: 'El cambio de estado de sólido a líquido se llama:', options: ['Sublimación', 'Vaporización', 'Fusión', 'Solidificación'], correct: 2 },
      { q: 'El paso directo de sólido a gas, sin pasar por líquido, se llama:', options: ['Condensación', 'Sublimación', 'Evaporación', 'Fusión'], correct: 1 },
      { q: '¿Qué estado posee la mayor energía y está formado por iones y electrones libres?', options: ['Plasma', 'Gas', 'Líquido', 'Sólido'], correct: 0 },
      { q: 'En el estado líquido las partículas están:', options: ['Muy separadas y libres', 'En red rígida', 'Próximas pero desordenadas', 'Ionizadas'], correct: 2 },
      { q: 'El paso de gas a líquido se llama:', options: ['Vaporización', 'Sublimación', 'Condensación', 'Solidificación'], correct: 2 },
      { q: 'La temperatura a la que un sólido se convierte en líquido se llama:', options: ['Punto de ebullición', 'Punto de fusión', 'Punto crítico', 'Cero absoluto'], correct: 1 },
      { q: '¿Dónde se encuentra el plasma de forma natural?', options: ['En el hielo polar', 'En el agua del mar', 'En las estrellas y el Sol', 'En las rocas'], correct: 2 },
      { q: 'A mayor temperatura, las partículas de una sustancia:', options: ['Se mueven más despacio', 'Se mueven con más energía', 'Quedan inmóviles', 'Desaparecen'], correct: 1 },
      { q: '¿Qué estado de la materia adopta la forma del recipiente pero NO ocupa todo su volumen?', options: ['Sólido', 'Líquido', 'Gas', 'Plasma'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'pitagoras',
    title: 'Teorema de Pitágoras',
    subtitle: 'Relación métrica en el triángulo rectángulo',
    image: '/images/infografias/05-pitagoras.webp',
    icon: '📐',
    targets: [
      { level: 'primaria', grades: [6], subjects: ['matematicas'] },
      { level: 'eso', grades: [1, 2, 3, 4], subjects: ['matematicas'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['matematicas'] },
    ],
    zones: [
      { n: 1, x: 41, y: 22, label: 'Cateto a', aliases: ['cateto', 'a'] },
      { n: 2, x: 53, y: 32, label: 'Hipotenusa', aliases: ['c', 'hipotenusa c'] },
      { n: 3, x: 48, y: 47, label: 'Cateto b', aliases: ['cateto', 'b'] },
      { n: 4, x: 26, y: 67, label: 'a²', aliases: ['a cuadrado', 'a^2', 'cuadrado de a'] },
      { n: 5, x: 25, y: 80, label: 'b²', aliases: ['b cuadrado', 'b^2', 'cuadrado de b'] },
    ],
    questions: [
      { q: 'En un triángulo rectángulo, el lado opuesto al ángulo recto se llama:', options: ['Cateto', 'Hipotenusa', 'Mediana', 'Altura'], correct: 1 },
      { q: 'La fórmula del teorema de Pitágoras es:', options: ['a + b = c', 'a² · b² = c²', 'a² + b² = c²', 'a² - b² = c²'], correct: 2 },
      { q: 'Si los catetos miden 3 y 4, la hipotenusa mide:', options: ['5', '6', '7', '4'], correct: 0 },
      { q: '¿En qué tipo de triángulo se aplica directamente el teorema?', options: ['Equilátero', 'Isósceles', 'Rectángulo', 'Obtusángulo'], correct: 2 },
      { q: '¿Cuál NO es una aplicación típica del teorema de Pitágoras?', options: ['Cálculo de distancias', 'Topografía', 'Reacciones químicas', 'Arquitectura'], correct: 2 },
      { q: 'Si los catetos miden 5 y 12, la hipotenusa mide:', options: ['13', '15', '17', '7'], correct: 0 },
      { q: 'La terna 6, 8, 10 forma un triángulo:', options: ['Equilátero', 'Rectángulo', 'Obtusángulo', 'Acutángulo'], correct: 1 },
      { q: 'En geometría analítica, la distancia entre (0,0) y (3,4) es:', options: ['7', '5', '12', '√7'], correct: 1 },
      { q: 'Si la hipotenusa mide 10 y un cateto 6, el otro cateto mide:', options: ['8', '4', '14', '16'], correct: 0 },
      { q: '¿En qué civilización vivió Pitágoras?', options: ['Egipcia', 'Romana', 'Griega antigua', 'Mesopotámica'], correct: 2 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'newton',
    title: 'Las leyes de Newton',
    subtitle: 'Fundamentos de la dinámica clásica',
    image: '/images/infografias/06-newton.webp',
    icon: '🍎',
    targets: [
      { level: 'eso', grades: [2, 3, 4], subjects: ['fisica'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['fisica'] },
    ],
    zones: [
      { n: 1, x: 10, y: 11, label: 'Inercia', aliases: ['ley de inercia', 'primera ley'] },
      { n: 2, x: 10, y: 37, label: 'F=ma', aliases: ['fundamental', 'segunda ley', 'dinámica', 'dinamica'] },
      { n: 3, x: 10, y: 67, label: 'Acción-reacción', aliases: ['accion reaccion', 'tercera ley', 'acción reacción', 'accion-reaccion'] },
      { n: 4, x: 35, y: 50, label: 'Fuerza', aliases: ['fuerza neta', 'f'] },
      { n: 5, x: 75, y: 50, label: 'Aceleración', aliases: ['aceleracion', 'a'] },
    ],
    questions: [
      { q: 'La primera ley de Newton se conoce como:', options: ['Ley de la gravedad', 'Ley de la inercia', 'Ley de acción-reacción', 'Ley de la fuerza'], correct: 1 },
      { q: 'La fórmula F = m · a corresponde a:', options: ['Primera ley', 'Segunda ley', 'Tercera ley', 'Ley de Hooke'], correct: 1 },
      { q: 'Si empujas una pared, la pared te empuja con la misma fuerza. Esto es la:', options: ['Primera ley', 'Segunda ley', 'Tercera ley', 'Ley de gravitación'], correct: 2 },
      { q: 'Un cuerpo en reposo seguirá en reposo a menos que actúe sobre él:', options: ['El tiempo', 'Una fuerza neta', 'La temperatura', 'La masa'], correct: 1 },
      { q: 'La unidad de fuerza en el Sistema Internacional es:', options: ['Julio (J)', 'Vatio (W)', 'Newton (N)', 'Pascal (Pa)'], correct: 2 },
      { q: 'Si aplicas una fuerza de 10 N a un objeto de 2 kg, su aceleración será:', options: ['2 m/s²', '5 m/s²', '12 m/s²', '20 m/s²'], correct: 1 },
      { q: 'Un cohete avanza basándose principalmente en:', options: ['La primera ley', 'La segunda ley', 'La tercera ley (acción-reacción)', 'La ley de gravitación'], correct: 2 },
      { q: 'A mayor masa, con la misma fuerza, la aceleración:', options: ['Aumenta', 'No cambia', 'Disminuye', 'Se vuelve cero'], correct: 2 },
      { q: 'La propiedad de los cuerpos para resistir cambios en su movimiento se llama:', options: ['Densidad', 'Inercia', 'Fricción', 'Gravedad'], correct: 1 },
      { q: '¿Cómo se relacionan las fuerzas de acción y reacción?', options: ['Mismo sentido y misma intensidad', 'Sentidos opuestos e igual intensidad', 'Sentidos opuestos e intensidades distintas', 'Solo actúan sobre el mismo cuerpo'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'ia-aprende',
    title: '¿Cómo aprende una IA?',
    subtitle: 'Fundamentos del aprendizaje automático',
    image: '/images/infografias/08-ia-aprende.webp',
    icon: '🧠',
    targets: [
      { level: 'eso', grades: [1, 2, 3, 4], subjects: ['ia', 'programacion', 'tecnologia'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['programacion', 'tecnologia'] },
    ],
    zones: [
      { n: 1, x: 32, y: 18, label: 'Datos', aliases: ['recolección', 'recoleccion', 'recolección de datos'] },
      { n: 2, x: 32, y: 27, label: 'Preprocesamiento', aliases: ['preprocesado', 'limpieza'] },
      { n: 3, x: 32, y: 38, label: 'Entrenamiento', aliases: ['training', 'entrenamiento del modelo'] },
      { n: 4, x: 32, y: 49, label: 'Validación', aliases: ['validacion', 'evaluación', 'evaluacion'] },
      { n: 5, x: 32, y: 60, label: 'Inferencia', aliases: ['predicción', 'prediccion', 'predicciones'] },
    ],
    questions: [
      { q: 'Una IA necesita ejemplos, registros o conjuntos de... ¿para aprender?', options: ['Imágenes únicamente', 'Datos', 'Algoritmos', 'Hardware'], correct: 1 },
      { q: 'La fase en la que se limpian, organizan y transforman los datos es:', options: ['Inferencia', 'Validación', 'Preprocesamiento', 'Mejora continua'], correct: 2 },
      { q: 'Cuando el modelo ya ajustado se usa para predecir nuevos casos, hablamos de:', options: ['Entrenamiento', 'Inferencia', 'Validación', 'Recolección'], correct: 1 },
      { q: 'La calidad, cantidad y diversidad de los... influyen mucho en el resultado:', options: ['Datos', 'Parámetros', 'Cables', 'Píxeles'], correct: 0 },
      { q: '¿Cómo se llama el proceso de comparar las predicciones con los resultados esperados?', options: ['Recolección', 'Validación', 'Optimización', 'Entrenamiento'], correct: 1 },
      { q: '¿Qué tipo de aprendizaje utiliza datos etiquetados con la respuesta correcta?', options: ['No supervisado', 'Supervisado', 'Por refuerzo', 'Aleatorio'], correct: 1 },
      { q: 'Un modelo que asigna imágenes a categorías es un ejemplo de:', options: ['Regresión', 'Clasificación', 'Generación', 'Limpieza'], correct: 1 },
      { q: 'Cuando un modelo memoriza los ejemplos y falla con datos nuevos, se llama:', options: ['Underfitting', 'Overfitting (sobreajuste)', 'Validación', 'Compilación'], correct: 1 },
      { q: 'Una red neuronal está formada por:', options: ['Bombillas conectadas', 'Capas de neuronas o nodos artificiales', 'Discos duros', 'Sensores físicos'], correct: 1 },
      { q: '¿Por qué es importante la calidad de los datos en una IA?', options: ['Por su tamaño únicamente', 'Porque afecta directamente al resultado del modelo', 'No influye', 'Solo importa la velocidad'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'sistema-solar',
    title: 'El sistema solar',
    subtitle: 'Estructura y componentes',
    image: '/images/infografias/10-sistema-solar.webp',
    icon: '🪐',
    targets: [
      { level: 'primaria', grades: [3, 4, 5, 6], subjects: ['ciencias-naturales'] },
      { level: 'eso', grades: [1, 2], subjects: ['biologia'] },
    ],
    zones: [
      { n: 1, x: 14, y: 14, label: 'Sol', aliases: ['estrella'] },
      { n: 2, x: 24, y: 14, label: 'Mercurio', aliases: [] },
      { n: 4, x: 38, y: 14, label: 'Tierra', aliases: [] },
      { n: 5, x: 51, y: 14, label: 'Marte', aliases: [] },
      { n: 6, x: 65, y: 13, label: 'Júpiter', aliases: ['jupiter'] },
    ],
    questions: [
      { q: '¿Cuál es el planeta más cercano al Sol?', options: ['Venus', 'Tierra', 'Mercurio', 'Marte'], correct: 2 },
      { q: '¿Cuál es el planeta más grande del sistema solar?', options: ['Saturno', 'Júpiter', 'Urano', 'Neptuno'], correct: 1 },
      { q: 'Los planetas interiores (rocosos) son Mercurio, Venus, Tierra y:', options: ['Júpiter', 'Saturno', 'Marte', 'Neptuno'], correct: 2 },
      { q: 'El cinturón de asteroides se encuentra entre:', options: ['Mercurio y Venus', 'Tierra y Marte', 'Marte y Júpiter', 'Saturno y Urano'], correct: 2 },
      { q: '¿Qué tipo de cuerpos forman la nube de Oort?', options: ['Cometas', 'Planetas', 'Estrellas', 'Galaxias'], correct: 0 },
      { q: '¿Cuántos planetas tiene el sistema solar?', options: ['7', '8', '9', '10'], correct: 1 },
      { q: '¿Cuál es el único satélite natural de la Tierra?', options: ['Fobos', 'Europa', 'La Luna', 'Titán'], correct: 2 },
      { q: '¿Qué planeta es conocido por sus espectaculares anillos?', options: ['Júpiter', 'Saturno', 'Marte', 'Mercurio'], correct: 1 },
      { q: '¿Cuál es el planeta más alejado del Sol?', options: ['Plutón', 'Urano', 'Saturno', 'Neptuno'], correct: 3 },
      { q: 'Los planetas exteriores (Júpiter, Saturno, Urano, Neptuno) se clasifican como:', options: ['Rocosos', 'Enanos', 'Gaseosos', 'Helados puros'], correct: 2 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'adn',
    title: 'El ADN',
    subtitle: 'La molécula de la información genética',
    image: '/images/infografias/11-adn.webp',
    icon: '🧬',
    targets: [
      { level: 'eso', grades: [3, 4], subjects: ['biologia'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['biologia'] },
    ],
    zones: [
      { n: 1, x: 19, y: 11, label: 'Estructura', aliases: ['doble hélice', 'doble helice'] },
      { n: 2, x: 19, y: 26, label: 'Nucleótidos', aliases: ['nucleotidos', 'monómero', 'monomero'] },
      { n: 3, x: 19, y: 42, label: 'Bases nitrogenadas', aliases: ['bases', 'nitrogenadas'] },
      { n: 5, x: 78, y: 11, label: 'Genes', aliases: ['gen'] },
      { n: 6, x: 78, y: 25, label: 'Cromosomas', aliases: ['cromosoma'] },
    ],
    questions: [
      { q: '¿Qué estructura tridimensional tiene la molécula de ADN?', options: ['Lámina plegada', 'Hélice simple', 'Doble hélice', 'Triple hélice'], correct: 2 },
      { q: 'Las cuatro bases nitrogenadas del ADN son:', options: ['A, C, G, U', 'A, T, G, C', 'A, T, G, U', 'C, T, G, X'], correct: 1 },
      { q: '¿Con qué base se empareja la adenina en el ADN?', options: ['Citosina', 'Guanina', 'Timina', 'Uracilo'], correct: 2 },
      { q: 'Un... es un fragmento de ADN que contiene información para una proteína:', options: ['Cromosoma', 'Gen', 'Nucleótido', 'Ribosoma'], correct: 1 },
      { q: 'La copia del ADN para la división celular se llama:', options: ['Traducción', 'Transcripción', 'Replicación', 'Mutación'], correct: 2 },
      { q: '¿Qué tipo de azúcar contiene el ADN?', options: ['Glucosa', 'Ribosa', 'Desoxirribosa', 'Fructosa'], correct: 2 },
      { q: 'El proceso que copia ADN a ARN se llama:', options: ['Replicación', 'Transcripción', 'Traducción', 'Mutación'], correct: 1 },
      { q: 'Un cambio en la secuencia del ADN se llama:', options: ['Gen', 'Mutación', 'Cromosoma', 'Replicación'], correct: 1 },
      { q: '¿Quiénes propusieron la estructura de doble hélice del ADN en 1953?', options: ['Mendel y Darwin', 'Watson y Crick', 'Pasteur y Koch', 'Curie y Einstein'], correct: 1 },
      { q: '¿En qué orgánulo de las células eucariotas se encuentra el ADN?', options: ['Mitocondria', 'Ribosoma', 'Núcleo', 'Vacuola'], correct: 2 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'celula',
    title: 'La célula animal y vegetal',
    subtitle: 'Estructura y función de los orgánulos',
    image: '/images/infografias/12-celula.webp',
    icon: '🔬',
    targets: [
      { level: 'primaria', grades: [6], subjects: ['ciencias-naturales'] },
      { level: 'eso', grades: [1, 2, 3, 4], subjects: ['biologia'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['biologia'] },
    ],
    zones: [
      { n: 1, x: 22, y: 25, label: 'Núcleo', aliases: ['nucleo'] },
      { n: 2, x: 22, y: 34, label: 'Ribosomas', aliases: ['ribosoma'] },
      { n: 3, x: 22, y: 43, label: 'Retículo endoplasmático rugoso', aliases: ['reticulo rugoso', 'r.e.r', 'rer', 'retículo rugoso'] },
      { n: 5, x: 22, y: 57, label: 'Mitocondrias', aliases: ['mitocondria'] },
      { n: 6, x: 22, y: 66, label: 'Aparato de Golgi', aliases: ['golgi', 'complejo de golgi'] },
    ],
    questions: [
      { q: '¿Qué orgánulo contiene el material genético de la célula?', options: ['Mitocondria', 'Ribosoma', 'Núcleo', 'Vacuola'], correct: 2 },
      { q: 'Las... son las centrales energéticas que producen ATP:', options: ['Mitocondrias', 'Vacuolas', 'Ribosomas', 'Lisosomas'], correct: 0 },
      { q: '¿Qué estructura realiza la fotosíntesis y solo aparece en células vegetales?', options: ['Aparato de Golgi', 'Cloroplasto', 'Núcleo', 'Lisosoma'], correct: 1 },
      { q: 'La pared celular y la gran vacuola central son típicas de:', options: ['Células animales', 'Células vegetales', 'Bacterias', 'Virus'], correct: 1 },
      { q: '¿Qué orgánulo se encarga de sintetizar proteínas?', options: ['Ribosoma', 'Mitocondria', 'Núcleo', 'Cloroplasto'], correct: 0 },
      { q: 'La pared celular de las células vegetales está formada principalmente por:', options: ['Quitina', 'Celulosa', 'Almidón', 'Proteínas'], correct: 1 },
      { q: 'La membrana plasmática regula:', options: ['La duplicación del ADN', 'El paso de sustancias entre el interior y el exterior', 'La síntesis de proteínas únicamente', 'La fotosíntesis'], correct: 1 },
      { q: '¿Qué orgánulo modifica y empaqueta proteínas para su transporte?', options: ['Núcleo', 'Aparato de Golgi', 'Ribosoma', 'Cloroplasto'], correct: 1 },
      { q: 'Las células con núcleo definido se llaman:', options: ['Procariotas', 'Eucariotas', 'Virus', 'Bacterias'], correct: 1 },
      { q: '¿Qué función NO cumple el retículo endoplasmático?', options: ['Síntesis de proteínas', 'Transporte interno', 'Procesar la luz', 'Síntesis de lípidos'], correct: 2 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'enlace-quimico',
    title: 'El enlace químico',
    subtitle: 'Cómo se unen los átomos para formar sustancias',
    image: '/images/infografias/13-enlace-quimico.webp',
    icon: '⚗️',
    targets: [
      { level: 'eso', grades: [2, 3, 4], subjects: ['fisica'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['fisica', 'quimica'] },
    ],
    zones: [
      { n: 1, x: 10, y: 11, label: 'Iónico', aliases: ['ionico', 'enlace iónico', 'enlace ionico'] },
      { n: 2, x: 10, y: 35, label: 'Covalente', aliases: ['enlace covalente'] },
      { n: 3, x: 10, y: 60, label: 'Metálico', aliases: ['metalico', 'enlace metálico', 'enlace metalico'] },
      { n: 4, x: 35, y: 12, label: 'Transferencia', aliases: ['transferencia de electrones', 'cesión', 'cesion'] },
      { n: 5, x: 35, y: 36, label: 'Compartición', aliases: ['comparticion', 'compartir', 'pares de electrones'] },
    ],
    questions: [
      { q: 'En el enlace iónico, los átomos:', options: ['Comparten electrones', 'Transfieren electrones', 'Comparten protones', 'Pierden neutrones'], correct: 1 },
      { q: 'El enlace covalente consiste en:', options: ['Cesión total de electrones', 'Compartición de pares de electrones', 'Atracción electrostática entre iones', 'Mar de electrones'], correct: 1 },
      { q: '¿Qué tipo de enlace es responsable de la conductividad eléctrica de los metales?', options: ['Iónico', 'Covalente apolar', 'Metálico', 'Puente de hidrógeno'], correct: 2 },
      { q: 'El NaCl (sal común) es un ejemplo de compuesto:', options: ['Iónico', 'Covalente', 'Metálico', 'Molecular apolar'], correct: 0 },
      { q: '¿Qué magnitud mide la capacidad de un átomo para atraer electrones en un enlace?', options: ['Energía de ionización', 'Electronegatividad', 'Afinidad electrónica', 'Radio atómico'], correct: 1 },
      { q: '¿Qué propiedad tienen los compuestos iónicos en estado sólido?', options: ['Conducen la electricidad', 'No conducen la electricidad', 'Son siempre líquidos', 'Son gases'], correct: 1 },
      { q: 'La molécula de agua (H₂O) presenta una geometría:', options: ['Lineal', 'Angular', 'Tetraédrica perfecta', 'Trigonal plana'], correct: 1 },
      { q: 'Los metales conducen bien la electricidad gracias a:', options: ['Sus enlaces iónicos', 'Sus protones libres', 'Sus electrones libres (mar de electrones)', 'Sus neutrones'], correct: 2 },
      { q: 'Un enlace covalente entre átomos de igual electronegatividad se llama:', options: ['Polar', 'Apolar', 'Iónico', 'Metálico'], correct: 1 },
      { q: '¿Qué tipo de enlace se forma típicamente entre un metal y un no metal?', options: ['Covalente apolar', 'Iónico', 'Metálico', 'Puente de hidrógeno'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'derivadas',
    title: 'Derivadas',
    subtitle: 'La tasa de cambio instantánea',
    image: '/images/infografias/14-derivadas.webp',
    icon: '∫',
    targets: [
      { level: 'bachillerato', grades: [1, 2], subjects: ['matematicas'] },
    ],
    zones: [
      { n: 1, x: 14, y: 17, label: 'Definición intuitiva', aliases: ['definicion intuitiva', 'intuitiva', 'definición'] },
      { n: 2, x: 45, y: 17, label: 'Interpretación geométrica', aliases: ['geometrica', 'pendiente', 'recta tangente'] },
      { n: 3, x: 77, y: 17, label: 'Interpretación física', aliases: ['fisica', 'velocidad instantánea', 'velocidad instantanea'] },
      { n: 5, x: 60, y: 47, label: 'Definición formal', aliases: ['definicion formal', 'límite', 'limite'] },
      { n: 7, x: 70, y: 62, label: 'Ejemplo visual', aliases: ['ejemplo', 'ejemplo derivada'] },
    ],
    questions: [
      { q: 'La derivada de una función en un punto representa:', options: ['El área bajo la curva', 'La pendiente de la recta tangente', 'El punto de corte con el eje X', 'La integral'], correct: 1 },
      { q: 'La derivada de f(x) = x² es:', options: ['x', '2x', '2', 'x³/3'], correct: 1 },
      { q: 'La derivada de una constante c es:', options: ['1', 'c', '0', 'x'], correct: 2 },
      { q: 'La velocidad instantánea es la derivada de:', options: ['La aceleración', 'La masa', 'La posición respecto al tiempo', 'La fuerza'], correct: 2 },
      { q: '¿Cuál es la derivada de f(x) = 3x² evaluada en x = 2?', options: ['6', '12', '4', '8'], correct: 1 },
      { q: 'La derivada de sen(x) es:', options: ['cos(x)', '−cos(x)', '−sen(x)', 'tan(x)'], correct: 0 },
      { q: 'La derivada de eˣ es:', options: ['x · eˣ⁻¹', 'eˣ', 'ln(x)', '1/x'], correct: 1 },
      { q: 'En un máximo o mínimo local, f\'(x) vale:', options: ['1', '0', 'Infinito', 'No existe'], correct: 1 },
      { q: 'La derivada de ln(x) es:', options: ['1/x', 'x', 'eˣ', 'ln(x)/x'], correct: 0 },
      { q: 'La regla de la cadena se utiliza para derivar:', options: ['Sumas de funciones', 'Funciones compuestas', 'Productos solamente', 'Constantes'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'integrales',
    title: 'Integrales',
    subtitle: 'Acumulación, área y antiderivadas',
    image: '/images/infografias/15-integrales.webp',
    icon: '∫',
    targets: [
      { level: 'bachillerato', grades: [2], subjects: ['matematicas'] },
    ],
    zones: [
      { n: 1, x: 15, y: 8, label: 'Idea intuitiva', aliases: ['intuitiva', 'idea'] },
      { n: 2, x: 55, y: 8, label: 'Interpretación geométrica', aliases: ['geometrica', 'área bajo la curva', 'area bajo la curva'] },
      { n: 3, x: 15, y: 24, label: 'Integral definida', aliases: ['definida', 'con límites', 'con limites'] },
      { n: 4, x: 55, y: 24, label: 'Integral indefinida', aliases: ['indefinida', 'antiderivada', 'primitiva'] },
      { n: 5, x: 15, y: 45, label: 'Constante de integración', aliases: ['constante', 'c', 'constante de integracion'] },
    ],
    questions: [
      { q: 'La integral indefinida de una función f(x) representa:', options: ['Una única primitiva', 'Una familia de antiderivadas', 'Su derivada', 'Su límite'], correct: 1 },
      { q: 'La integral definida entre a y b representa:', options: ['La pendiente de la curva', 'El área bajo la curva entre a y b', 'La derivada', 'El máximo absoluto'], correct: 1 },
      { q: 'La integral de x² dx es:', options: ['2x + C', 'x³/3 + C', 'x³ + C', 'x²/2 + C'], correct: 1 },
      { q: 'Si F(x) es una primitiva de f(x), entonces F\'(x) =', options: ['0', 'f(x)', 'F(x)', '1/f(x)'], correct: 1 },
      { q: 'El teorema fundamental del cálculo relaciona:', options: ['Suma y resta', 'Derivación e integración', 'Multiplicación y división', 'Senos y cosenos'], correct: 1 },
      { q: 'La integral de cos(x) dx es:', options: ['−sen(x) + C', 'sen(x) + C', 'tan(x) + C', '−cos(x) + C'], correct: 1 },
      { q: '¿Cuánto vale ∫1 dx?', options: ['0', '1', 'x + C', 'C'], correct: 2 },
      { q: 'La integral definida entre a y a (mismos límites) vale:', options: ['1', '0', 'a', 'Infinito'], correct: 1 },
      { q: 'La integración por partes se basa en la fórmula de derivación de:', options: ['Una suma', 'Una composición', 'Un producto', 'Un cociente'], correct: 2 },
      { q: '¿Qué constante se añade siempre a una integral indefinida?', options: ['π', 'C', 'x', 'e'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'electricidad',
    title: 'Electricidad',
    subtitle: 'Carga, corriente, tensión y resistencia',
    image: '/images/infografias/16-electricidad.webp',
    icon: '⚡',
    targets: [
      { level: 'eso', grades: [2, 3, 4], subjects: ['fisica', 'tecnologia'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['fisica', 'tecnologia'] },
    ],
    zones: [
      { n: 1, x: 14, y: 10, label: 'Conceptos fundamentales', aliases: ['fundamentos', 'conceptos'] },
      { n: 2, x: 14, y: 28, label: 'Fórmulas clave', aliases: ['formulas', 'fórmulas', 'leyes'] },
      { n: 3, x: 14, y: 47, label: 'Circuito eléctrico', aliases: ['circuito', 'circuito simple', 'circuito electrico'] },
      { n: 4, x: 14, y: 67, label: 'Corriente continua', aliases: ['continua', 'cc', 'dc'] },
      { n: 5, x: 14, y: 82, label: 'Aplicaciones', aliases: ['usos', 'aplicaciones electricidad'] },
    ],
    questions: [
      { q: 'La unidad de intensidad de corriente eléctrica es:', options: ['Voltio (V)', 'Amperio (A)', 'Ohmio (Ω)', 'Vatio (W)'], correct: 1 },
      { q: 'La Ley de Ohm relaciona V, I y R con la fórmula:', options: ['V = I + R', 'V = I · R', 'V = I / R', 'V = I - R'], correct: 1 },
      { q: 'La potencia eléctrica se calcula como:', options: ['P = V · I', 'P = V / I', 'P = V + I', 'P = V - I'], correct: 0 },
      { q: '¿Qué tipo de corriente cambia periódicamente de sentido?', options: ['Corriente continua', 'Corriente alterna', 'Corriente directa', 'Corriente nula'], correct: 1 },
      { q: 'La oposición al paso de la corriente eléctrica se llama:', options: ['Tensión', 'Resistencia', 'Intensidad', 'Potencia'], correct: 1 },
      { q: 'Si V = 12 V y R = 4 Ω, la intensidad I según la ley de Ohm es:', options: ['48 A', '3 A', '8 A', '0,33 A'], correct: 1 },
      { q: 'La unidad de potencia eléctrica es:', options: ['Voltio', 'Amperio', 'Vatio (W)', 'Ohmio'], correct: 2 },
      { q: 'En una conexión en paralelo, los componentes:', options: ['Comparten la misma corriente', 'Comparten la misma tensión', 'Se queman al primer fallo', 'Reducen la tensión'], correct: 1 },
      { q: 'El consumo doméstico de electricidad se factura habitualmente en:', options: ['Voltios', 'Amperios', 'kWh (kilovatios-hora)', 'Vatios por minuto'], correct: 2 },
      { q: 'La unidad de resistencia eléctrica es:', options: ['Voltio', 'Ohmio (Ω)', 'Faradio', 'Henrio'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'electromagnetismo',
    title: 'Electromagnetismo',
    subtitle: 'La interacción entre electricidad y magnetismo',
    image: '/images/infografias/17-electromagnetismo.webp',
    icon: '🧲',
    targets: [
      { level: 'eso', grades: [4], subjects: ['fisica'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['fisica'] },
    ],
    zones: [
      { n: 1, x: 17, y: 12, label: 'Campo eléctrico', aliases: ['campo electrico', 'campo e'] },
      { n: 2, x: 45, y: 12, label: 'Campo magnético', aliases: ['campo magnetico', 'campo b'] },
      { n: 3, x: 76, y: 12, label: 'Corriente y magnetismo', aliases: ['corriente', 'corriente eléctrica y magnetismo'] },
      { n: 4, x: 25, y: 37, label: 'Inducción electromagnética', aliases: ['induccion', 'inducción', 'faraday'] },
      { n: 5, x: 68, y: 37, label: 'Ondas electromagnéticas', aliases: ['ondas', 'ondas em', 'ondas electromagneticas'] },
    ],
    questions: [
      { q: 'La ley que describe que un campo magnético variable genera corriente eléctrica es la de:', options: ['Coulomb', 'Faraday', 'Newton', 'Ohm'], correct: 1 },
      { q: '¿Qué tipo de onda es la luz visible?', options: ['Mecánica', 'Sonora', 'Electromagnética', 'Sísmica'], correct: 2 },
      { q: 'La fuerza entre dos cargas eléctricas se describe mediante la ley de:', options: ['Faraday', 'Coulomb', 'Lenz', 'Ampère'], correct: 1 },
      { q: 'Una corriente eléctrica genera a su alrededor un:', options: ['Campo gravitatorio', 'Campo magnético', 'Campo eléctrico nulo', 'Campo nuclear'], correct: 1 },
      { q: 'El funcionamiento de motores y generadores se basa en:', options: ['La estática', 'El electromagnetismo', 'La óptica', 'La termodinámica'], correct: 1 },
      { q: 'La unidad del campo magnético en el Sistema Internacional es:', options: ['Tesla', 'Newton', 'Ohmio', 'Pascal'], correct: 0 },
      { q: 'Un electroimán básico está formado por:', options: ['Un imán natural', 'Una bobina de cable con corriente alrededor de un núcleo de hierro', 'Dos pilas en serie', 'Una placa solar'], correct: 1 },
      { q: 'La luz visible es un tipo de onda:', options: ['Mecánica', 'Sonora', 'Electromagnética', 'Sísmica'], correct: 2 },
      { q: 'Las cargas del mismo signo:', options: ['Se atraen', 'Se repelen', 'No interactúan', 'Forman enlaces'], correct: 1 },
      { q: 'Maxwell logró unificar las teorías de:', options: ['Mecánica y termodinámica', 'Electricidad y magnetismo', 'Gravedad y óptica', 'Química y física nuclear'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'internet',
    title: 'Arquitectura de Internet',
    subtitle: 'Cómo viajan los datos por la red global',
    image: '/images/infografias/18-internet.webp',
    icon: '🌐',
    targets: [
      { level: 'eso', grades: [1, 2, 3, 4], subjects: ['tecnologia', 'programacion', 'ia'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['tecnologia', 'programacion'] },
    ],
    zones: [
      { n: 1, x: 10, y: 10, label: 'Dispositivo', aliases: ['dispositivo del usuario', 'usuario', 'cliente'] },
      { n: 2, x: 25, y: 10, label: 'Router doméstico', aliases: ['router', 'router domestico'] },
      { n: 3, x: 41, y: 10, label: 'Proveedor de Internet', aliases: ['isp', 'proveedor', 'isp'] },
      { n: 4, x: 57, y: 10, label: 'Red troncal', aliases: ['backbone', 'red troncal de internet'] },
      { n: 5, x: 73, y: 10, label: 'Servidores', aliases: ['servidor'] },
    ],
    questions: [
      { q: '¿Qué significan las siglas DNS?', options: ['Domain Name System', 'Direct Network Server', 'Data Node Service', 'Digital Network Standard'], correct: 0 },
      { q: 'El conjunto de protocolos que permite la comunicación en Internet es:', options: ['HTTP', 'TCP/IP', 'FTP', 'SMTP'], correct: 1 },
      { q: 'Los datos se envían por Internet divididos en pequeñas unidades llamadas:', options: ['Píxeles', 'Paquetes', 'Bits únicos', 'Mensajes únicos'], correct: 1 },
      { q: '¿Qué dispositivo dirige los paquetes entre redes?', options: ['Servidor', 'Router', 'Switch USB', 'Antena'], correct: 1 },
      { q: 'Una IP sirve para:', options: ['Identificar dispositivos en una red', 'Cifrar contraseñas', 'Acelerar el procesador', 'Almacenar archivos'], correct: 0 },
      { q: '¿Qué significa HTTP?', options: ['High Tech Transfer Procedure', 'HyperText Transfer Protocol', 'Hardware Token Protocol', 'Hosted Tunnel Transport Process'], correct: 1 },
      { q: '¿Qué protocolo añade cifrado seguro a HTTP?', options: ['HTTPS', 'FTP', 'TELNET', 'SMTP'], correct: 0 },
      { q: 'Un dominio como ".com" o ".es" es:', options: ['Una contraseña', 'Un dominio de nivel superior (TLD)', 'Una IP', 'Un puerto'], correct: 1 },
      { q: 'El ordenador que aloja una página web se llama:', options: ['Cliente', 'Router', 'Servidor', 'Switch'], correct: 2 },
      { q: 'La red que conecta varios ordenadores en una misma casa u oficina se llama:', options: ['LAN (red local)', 'WAN', 'Satélite', 'Bluetooth puro'], correct: 0 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'algoritmos',
    title: 'Algoritmos',
    subtitle: 'Instrucciones precisas para resolver problemas',
    image: '/images/infografias/19-algoritmos.webp',
    icon: '🧩',
    targets: [
      { level: 'eso', grades: [1, 2, 3, 4], subjects: ['programacion', 'ia', 'tecnologia'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['programacion'] },
    ],
    zones: [
      { n: 1, x: 14, y: 10, label: 'Definición', aliases: ['definicion', 'algoritmo'] },
      { n: 2, x: 14, y: 25, label: 'Entrada', aliases: ['datos de entrada', 'input'] },
      { n: 3, x: 45, y: 25, label: 'Proceso', aliases: ['operaciones', 'procesado'] },
      { n: 4, x: 75, y: 25, label: 'Salida', aliases: ['resultado', 'output'] },
      { n: 5, x: 14, y: 42, label: 'Estructuras', aliases: ['estructuras de control', 'estructuras basicas'] },
    ],
    questions: [
      { q: 'Un algoritmo es:', options: ['Un lenguaje de programación', 'Una secuencia finita y ordenada de pasos', 'Un componente hardware', 'Un fichero de datos'], correct: 1 },
      { q: '¿Cuál NO es una cualidad esencial de un buen algoritmo?', options: ['Corrección', 'Eficiencia', 'Claridad', 'Tamaño en megabytes'], correct: 3 },
      { q: 'Las estructuras básicas de la programación incluyen secuencia, condicionales y:', options: ['Variables', 'Bucles', 'Strings', 'Funciones aleatorias'], correct: 1 },
      { q: 'Una notación que mide la eficiencia temporal de un algoritmo es:', options: ['Big O', 'HTML', 'CSS', 'JSON'], correct: 0 },
      { q: 'El diagrama de flujo y el pseudocódigo sirven para:', options: ['Compilar programas', 'Representar el algoritmo antes de programarlo', 'Almacenar datos', 'Conectar a Internet'], correct: 1 },
      { q: 'La notación O(n²) describe un algoritmo de complejidad:', options: ['Constante', 'Lineal', 'Cuadrática', 'Logarítmica'], correct: 2 },
      { q: 'Entre estas complejidades, ¿cuál es más eficiente para grandes volúmenes de datos?', options: ['O(n²)', 'O(n!)', 'O(log n)', 'O(2ⁿ)'], correct: 2 },
      { q: 'Un algoritmo que se llama a sí mismo se llama:', options: ['Iterativo', 'Recursivo', 'Paralelo', 'Estático'], correct: 1 },
      { q: 'En una lista ordenada, el método de búsqueda más eficiente es:', options: ['Búsqueda lineal', 'Búsqueda binaria', 'Ordenación burbuja', 'Búsqueda al azar'], correct: 1 },
      { q: '¿Qué estructura básica se usa para repetir instrucciones mientras se cumple una condición?', options: ['Secuencia', 'Bucle', 'Función', 'Variable'], correct: 1 },
    ],
  },

  // -------------------------------------------------------------------
  {
    id: 'cambio-climatico',
    title: 'Cambio climático',
    subtitle: 'Causas, evidencias y consecuencias',
    image: '/images/infografias/20-cambio-climatico.webp',
    icon: '🌍',
    targets: [
      { level: 'primaria', grades: [5, 6], subjects: ['ciencias-naturales'] },
      { level: 'eso', grades: [1, 2, 3, 4], subjects: ['biologia'] },
      { level: 'bachillerato', grades: [1, 2], subjects: ['biologia'] },
    ],
    zones: [
      { n: 1, x: 16, y: 16, label: 'Causas', aliases: ['origen', 'causas del cambio climatico'] },
      { n: 2, x: 16, y: 44, label: 'Evidencias', aliases: ['pruebas', 'señales'] },
      { n: 3, x: 16, y: 71, label: 'Consecuencias', aliases: ['efectos', 'impactos'] },
      { n: 4, x: 55, y: 22, label: 'Efecto invernadero', aliases: ['invernadero', 'gases de efecto invernadero'] },
      { n: 5, x: 80, y: 80, label: 'Migraciones climáticas', aliases: ['migraciones', 'desplazamientos', 'refugiados climáticos'] },
    ],
    questions: [
      { q: '¿Cuál es el principal gas de efecto invernadero emitido por la actividad humana?', options: ['Oxígeno (O₂)', 'Nitrógeno (N₂)', 'Dióxido de carbono (CO₂)', 'Argón (Ar)'], correct: 2 },
      { q: '¿Qué consecuencia NO se atribuye al cambio climático?', options: ['Aumento del nivel del mar', 'Disminución de inundaciones', 'Pérdida de biodiversidad', 'Acidificación de los océanos'], correct: 1 },
      { q: 'La deforestación contribuye al cambio climático porque:', options: ['Aumenta la lluvia', 'Reduce la absorción de CO₂', 'Disminuye la temperatura', 'Crea más oxígeno'], correct: 1 },
      { q: 'Las medidas para reducir las emisiones son acciones de:', options: ['Mitigación', 'Adaptación', 'Negación', 'Aceleración'], correct: 0 },
      { q: 'Una evidencia clave del cambio climático es:', options: ['Aumento de glaciares', 'Retroceso de glaciares', 'Mares más fríos', 'Menos sequías'], correct: 1 },
      { q: '¿Qué siglas corresponden al panel internacional de expertos en cambio climático?', options: ['ONU', 'IPCC', 'OPEP', 'OTAN'], correct: 1 },
      { q: 'El acuerdo internacional de 2015 para limitar el calentamiento global se llama:', options: ['Protocolo de Kioto', 'Acuerdo de París', 'Cumbre de Río', 'Acuerdo de Madrid'], correct: 1 },
      { q: '¿Cuál de estas energías es renovable?', options: ['Carbón', 'Petróleo', 'Solar', 'Gas natural'], correct: 2 },
      { q: 'Las acciones para ajustarse a los efectos del cambio climático ya presentes se llaman:', options: ['Mitigación', 'Adaptación', 'Negación', 'Compensación'], correct: 1 },
      { q: 'El acuerdo de París busca limitar el aumento de temperatura global a, como máximo:', options: ['1,5–2 °C', '5 °C', '10 °C', 'No hay objetivo'], correct: 0 },
    ],
  },
];

// Helper: filtra infografías disponibles para un (level, grade, subject) dado.
export function getInfografiasFor(level, grade, subject) {
  const gradeNum = parseInt(grade, 10);
  return INFOGRAFIAS.filter(info =>
    info.targets.some(t =>
      t.level === level &&
      t.grades.includes(gradeNum) &&
      (!subject || subject === 'general' || t.subjects.includes(subject))
    )
  );
}

// Normaliza una respuesta del alumno para comparación tolerante.
// Quita tildes, normaliza superíndices (a² → a2), pasa a minúsculas y elimina puntuación.
export function normalizeAnswer(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar combinantes diacríticos
    .replace(/[²₂]/g, '2')
    .replace(/[¹₁]/g, '1')
    .replace(/[³₃]/g, '3')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isZoneAnswerCorrect(zone, raw) {
  const norm = normalizeAnswer(raw);
  if (!norm) return false;
  const candidates = [zone.label, ...(zone.aliases || [])].map(normalizeAnswer);
  return candidates.includes(norm);
}
