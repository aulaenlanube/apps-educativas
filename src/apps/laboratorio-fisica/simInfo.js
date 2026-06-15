// Contenido informativo de cada simulación del Laboratorio de Física 3D.
// Lo muestra SimInfoModal (se abre al entrar en una simulación y desde el botón
// "Info" de la barra superior). Cada entrada explica, en lenguaje sencillo pero
// detallado: qué se está viendo, las leyes que usa, cómo personalizarlo y cómo
// sacarle el máximo partido. Las FÓRMULAS no se repiten aquí: el modal ya las
// toma de sim.formulas (definidas en cada escena).
//
// Estructura por id:
//   { queEs: string, leyes: [{nombre, texto}], personaliza: [{control, texto}], tips: [string] }

const SIM_INFO = {
  'caida-libre': {
    queEs: 'Sueltas un objeto desde cierta altura y lo ves caer hasta el suelo mientras un cronómetro y un radar miden el tiempo que tarda y la velocidad con la que llega. Puedes cambiar de planeta y activar el aire para comparar.',
    leyes: [
      { nombre: 'Caída libre (MRUA)', texto: 'sin aire, todo cae con la misma aceleración g y la velocidad aumenta de forma uniforme.' },
      { nombre: 'Independencia de la masa', texto: 'en el vacío, una pluma y una bola de hierro caen exactamente igual. Lo demostró Galileo.' },
      { nombre: 'Resistencia del aire', texto: 'si la activas, el aire frena el objeto y aparece una velocidad límite (terminal); entonces la masa y la forma sí importan.' },
    ],
    personaliza: [
      { control: 'Masa', texto: 'en el vacío no cambia el tiempo de caída; con aire, más masa cae algo más rápido.' },
      { control: 'Altura inicial', texto: 'cuanto más alto sueltas, más tarda y más rápido llega (v = √(2·g·h)).' },
      { control: 'Lugar (g)', texto: 'cambia la gravedad: Luna 1,6 · Marte 3,7 · Tierra 9,8 · Júpiter 24,8 m/s². Menos g → cae más lento.' },
      { control: 'Resistencia del aire', texto: 'activa o desactiva el rozamiento con el aire.' },
    ],
    tips: [
      'Pon dos masas muy distintas SIN aire: caen a la vez. Luego activa el aire y mira cómo cambia.',
      'Compara el mismo objeto en la Luna y en Júpiter para sentir qué significa "más gravedad".',
      'Comprueba a mano la velocidad del radar con v = g·t usando el tiempo del cronómetro.',
    ],
  },

  rozamiento: {
    queEs: 'Empujas una caja sobre distintos suelos. Verás que no se mueve hasta que tu fuerza supera el rozamiento; a partir de ahí, acelera. Los vectores muestran tu fuerza y la del rozamiento.',
    leyes: [
      { nombre: 'Rozamiento estático', texto: 'mientras la caja está quieta, el rozamiento iguala tu fuerza y la frena, hasta un máximo de μs·N.' },
      { nombre: 'Rozamiento dinámico', texto: 'una vez en marcha, el rozamiento vale μk·N (algo menor) y se mantiene constante.' },
      { nombre: '2ª ley de Newton', texto: 'lo que sobra de fuerza acelera la caja: a = (F − F_roz) / m.' },
    ],
    personaliza: [
      { control: 'Fuerza aplicada', texto: 'súbela hasta superar el umbral y ver arrancar la caja.' },
      { control: 'Masa de la caja', texto: 'más masa → más peso (N = m·g) → más rozamiento → cuesta más moverla.' },
      { control: 'Superficie', texto: 'hielo (poco rozamiento), madera (medio) o goma (mucho).' },
    ],
    tips: [
      'Sube la fuerza despacio y fíjate en el instante exacto en que la caja "se suelta": ahí estás justo en μs.',
      'Compara el mismo empuje sobre hielo y sobre goma.',
      'Con la caja en marcha, baja la fuerza por debajo del rozamiento y observa cómo frena.',
    ],
  },

  muelles: {
    queEs: 'Cuelgas una masa de un muelle. El muelle se estira hasta equilibrar el peso y, si le das un tirón extra, oscila arriba y abajo. Mides cuánto se alarga.',
    leyes: [
      { nombre: 'Ley de Hooke', texto: 'la fuerza que hace el muelle es proporcional a lo que se estira: F = k·x.' },
      { nombre: 'Equilibrio', texto: 'el muelle se detiene cuando su fuerza iguala al peso colgado: x_eq = m·g / k.' },
    ],
    personaliza: [
      { control: 'Constante del muelle k', texto: 'un muelle más "duro" (k alto) se estira menos con el mismo peso.' },
      { control: 'Masa colgada', texto: 'más masa → más peso → más alargamiento.' },
      { control: 'Estirón inicial extra', texto: 'lo separa de su posición de equilibrio para verlo oscilar.' },
    ],
    tips: [
      'Duplica la masa y comprueba que el alargamiento también se duplica (eso es la proporcionalidad de Hooke).',
      'Combina un k pequeño con una masa grande para un muelle muy blando.',
      'Sin estirón extra el muelle se queda quieto en el equilibrio; con estirón, rebota.',
    ],
  },

  gases: {
    queEs: 'Una caja llena de partículas que chocan sin parar contra las paredes. Cada choque es un golpecito de presión. El manómetro marca la presión que resulta de comprimir, calentar o meter más gas.',
    leyes: [
      { nombre: 'Ley de los gases ideales', texto: 'relaciona presión, volumen, cantidad y temperatura: p·V = n·R·T.' },
      { nombre: 'Modelo cinético', texto: 'la temperatura es agitación: más calientes, las partículas chocan más fuerte y más a menudo → más presión.' },
      { nombre: 'Casos particulares', texto: 'a temperatura fija, comprimir sube la presión (Boyle); a volumen fijo, calentar sube la presión (Gay-Lussac).' },
    ],
    personaliza: [
      { control: 'Cantidad de gas (n)', texto: 'más moles → más partículas → más choques → más presión.' },
      { control: 'Temperatura (T)', texto: 'en kelvin: caliéntalo y verás las partículas acelerarse.' },
      { control: 'Volumen (V)', texto: 'comprime la caja y la presión sube.' },
    ],
    tips: [
      'Deja n y T fijos y baja el volumen: comprueba la ley de Boyle (p·V se mantiene).',
      'Sube solo la temperatura y mira subir el manómetro (ley de Gay-Lussac).',
      'Recuerda: la temperatura va en kelvin (K). 0 °C son 273 K.',
    ],
  },

  'plano-inclinado': {
    queEs: 'Un bloque sobre una rampa. Su peso se reparte en dos: una parte lo empuja rampa abajo y otra lo aprieta contra la rampa. Según el ángulo y el rozamiento, el bloque desliza o se queda quieto.',
    leyes: [
      { nombre: 'Descomposición del peso', texto: 'a lo largo de la rampa actúa m·g·sen θ y perpendicular m·g·cos θ.' },
      { nombre: 'Fuerza normal', texto: 'la rampa solo soporta la parte perpendicular: N = m·g·cos θ.' },
      { nombre: '¿Desliza?', texto: 'empieza a deslizar cuando tan θ supera a μs; si no, el rozamiento estático lo sujeta.' },
      { nombre: 'Aceleración', texto: 'a = g·(sen θ − μk·cos θ), y no depende de la masa.' },
    ],
    personaliza: [
      { control: 'Ángulo de la rampa', texto: 'más inclinación → más fuerza tirando hacia abajo.' },
      { control: 'Masa del bloque', texto: 'cambia las fuerzas y la normal, pero no la aceleración ni la velocidad de llegada.' },
      { control: 'Superficie', texto: 'sin rozamiento, hielo, madera o goma.' },
    ],
    tips: [
      'Empieza con goma y sube el ángulo hasta que justo empiece a deslizar: ahí tan θ = μs.',
      'En "sin rozamiento" comprueba que a = g·sen θ.',
      'Cambia la masa y verás que la velocidad de llegada no cambia.',
    ],
  },

  'flota-o-hunde': {
    queEs: 'Sueltas un cubo de un material dentro de un líquido. Flota o se hunde según quién sea más denso, y si flota verás qué fracción del cubo queda bajo la superficie.',
    leyes: [
      { nombre: 'Principio de Arquímedes', texto: 'el líquido empuja hacia arriba con una fuerza igual al peso del líquido que el objeto desaloja.' },
      { nombre: 'Regla de densidades', texto: 'un cuerpo macizo flota si es menos denso que el líquido.' },
      { nombre: 'Fracción sumergida', texto: 'al flotar, el porcentaje que queda bajo el agua es ρ_objeto / ρ_líquido.' },
    ],
    personaliza: [
      { control: 'Material', texto: 'elige entre 7 densidades, del corcho (240) al oro (19300).' },
      { control: 'Volumen del cubo', texto: 'cambia el tamaño: no decide si flota, pero sí el empuje total.' },
      { control: 'Líquido', texto: 'gasolina, aceite, agua o mercurio.' },
    ],
    tips: [
      'Pon hielo (917) en agua (1000): flota con ~92% sumergido, como un iceberg.',
      'Mete acero (7850) en mercurio (13600): ¡el metal flota!',
      'El volumen no decide flotar o no: lo deciden solo las densidades.',
    ],
  },

  'mru-mrua': {
    queEs: 'Dos móviles compiten: A va a velocidad constante (una recta en la gráfica) y B parte parado pero acelera (una curva). Verás quién llega antes a la meta y dónde se cruzan.',
    leyes: [
      { nombre: 'MRU (móvil A)', texto: 'velocidad constante: recorre lo mismo cada segundo, x = v·t.' },
      { nombre: 'MRUA (móvil B)', texto: 'parte del reposo y acelera: empieza lento y se va haciendo más rápido, x = ½·a·t².' },
      { nombre: 'Punto de alcance', texto: 'B alcanza a A en el instante t* = 2·vA / aB.' },
    ],
    personaliza: [
      { control: 'Velocidad de A (MRU)', texto: 'lo rápido que va el de velocidad constante.' },
      { control: 'Aceleración de B (MRUA)', texto: 'cuánto gana de velocidad cada segundo el acelerado.' },
      { control: 'Distancia a la meta', texto: 'dónde está la línea de llegada.' },
    ],
    tips: [
      'Ajusta vA y aB para un "foto-finish" en que lleguen casi a la vez.',
      'Mira la gráfica posición-tiempo: recta (A) frente a parábola (B).',
      'Si la meta está cerca suele ganar A; si está lejos, casi siempre gana B.',
    ],
  },

  poleas: {
    queEs: 'Dos montajes clásicos. En la máquina de Atwood dos masas cuelgan de una polea y la más pesada baja. En la mesa con polea, una masa colgante arrastra a otra que está sobre la mesa. Mides la tensión de la cuerda.',
    leyes: [
      { nombre: 'Sistema acoplado', texto: 'al ser la cuerda inextensible, las dos masas comparten la misma aceleración y la misma tensión.' },
      { nombre: 'Atwood', texto: 'manda la diferencia de masas: a = g·(m₂−m₁)/(m₁+m₂).' },
      { nombre: 'Mesa con polea', texto: 'arranca solo si el peso colgante supera al rozamiento, y entonces a = g·(m₂−μk·m₁)/(m₁+m₂).' },
    ],
    personaliza: [
      { control: 'Montaje', texto: 'Atwood (dos colgando) o mesa con polea.' },
      { control: 'Masa 1 / Masa 2', texto: 'cambia el desequilibrio; en Atwood la diferencia es lo que acelera.' },
      { control: 'Superficie (mesa)', texto: 'madera o hielo cambian el rozamiento de la mesa.' },
    ],
    tips: [
      'En Atwood pon m₁ = m₂: el sistema queda en equilibrio (a = 0) y la tensión iguala al peso.',
      'Fíjate en que la tensión nunca vale los dos pesos a la vez: por eso el sistema acelera.',
      'En la mesa con hielo, casi cualquier masa colgante lo pone en marcha.',
    ],
  },

  'presion-hidrostatica': {
    queEs: 'Bajas una sonda dentro de un líquido y mides cómo aumenta la presión con la profundidad. Cuanto más hondo, más aprieta el líquido que tienes encima.',
    leyes: [
      { nombre: 'Presión hidrostática', texto: 'crece de forma lineal con la profundidad: p_h = ρ·g·h.' },
      { nombre: 'Presión total', texto: 'hay que sumar la atmósfera que aprieta en la superficie: p = p₀ + ρ·g·h.' },
      { nombre: 'Solo cuenta la profundidad', texto: 'no importa la forma ni la anchura del recipiente, solo cuántos metros tienes encima.' },
    ],
    personaliza: [
      { control: 'Profundidad objetivo', texto: 'a qué hondura llevas la sonda.' },
      { control: 'Líquido', texto: 'agua, aceite o mercurio: cuanto más denso, más presión por cada metro.' },
      { control: 'Lugar (g)', texto: 'en la Luna (menos g) la presión sube más despacio con la profundidad.' },
    ],
    tips: [
      'En agua, cada ~10 m de profundidad añaden aproximadamente 1 atmósfera.',
      'Compara la misma profundidad en agua y en mercurio.',
      'Cambia a la Luna y verás que con menos g la presión crece más lentamente.',
    ],
  },

  pascal: {
    queEs: 'Dos émbolos conectados por un líquido. Aprietas el pequeño con poca fuerza y el grande sube con mucha más: así un gato hidráulico levanta un coche con poco esfuerzo.',
    leyes: [
      { nombre: 'Principio de Pascal', texto: 'la presión se transmite igual a todo el líquido confinado: p = F₁/S₁ = F₂/S₂.' },
      { nombre: 'Multiplicación de la fuerza', texto: 'cuanto mayor es el émbolo grande, más fuerza obtienes: F₂ = F₁·(S₂/S₁).' },
      { nombre: 'No hay magia (energía)', texto: 'el émbolo pequeño baja mucho para que el grande suba poco; no se gana energía gratis.' },
    ],
    personaliza: [
      { control: 'Fuerza aplicada F₁', texto: 'lo que empujas en el émbolo pequeño.' },
      { control: 'Émbolos S₁ y S₂', texto: 'la relación de áreas S₂/S₁ es el "multiplicador" de fuerza.' },
      { control: 'Carga a levantar', texto: 'el peso que quieres subir; verás si la fuerza obtenida lo supera.' },
    ],
    tips: [
      'Haz S₂ mucho mayor que S₁ para levantar el coche con muy poca fuerza.',
      'Mira cuánto baja el émbolo pequeño: ese recorrido extra es el precio de multiplicar la fuerza.',
      'Si no levanta, sube F₁ o agranda S₂ hasta que F₂ supere el peso de la carga.',
    ],
  },

  arquimedes: {
    queEs: 'Cuelgas un objeto de un dinamómetro y lo sumerges en un líquido. La aguja marca menos peso: el líquido lo empuja hacia arriba. Mides ese "peso aparente" y el empuje.',
    leyes: [
      { nombre: 'Principio de Arquímedes', texto: 'el empuje hacia arriba vale E = ρ_líquido·g·V_sumergido (el peso del líquido desalojado).' },
      { nombre: 'Peso aparente', texto: 'lo que marca el dinamómetro es P_ap = m·g − E.' },
      { nombre: 'Flotación', texto: 'si el empuje llega a igualar al peso (E ≥ m·g), el objeto flota y el dinamómetro marca 0.' },
    ],
    personaliza: [
      { control: 'Masa del objeto', texto: 'su peso real fuera del líquido.' },
      { control: 'Volumen del objeto', texto: 'cuanto mayor, más líquido desaloja y más empuje recibe.' },
      { control: 'Líquido', texto: 'agua, aceite, mercurio o gasolina: más denso → más empuje.' },
    ],
    tips: [
      'Aumenta el volumen sin cambiar la masa: el empuje crece hasta que el objeto flota.',
      'En mercurio casi todo flota, porque es densísimo.',
      'Calcula la densidad del objeto (m/V) y compárala con la del líquido para predecir si flotará.',
    ],
  },

  'presion-atmosferica': {
    queEs: 'Reproduce el experimento de Torricelli: la atmósfera empuja un líquido por un tubo y lo sostiene a cierta altura. Esa altura de la columna mide la presión del aire.',
    leyes: [
      { nombre: 'Equilibrio de presiones', texto: 'la columna de líquido pesa justo lo que aprieta la atmósfera: p_atm = ρ·g·h.' },
      { nombre: 'Altura de la columna', texto: 'h = p_atm/(ρ·g); con mercurio salen 760 mm, con agua ¡más de 10 metros!' },
      { nombre: 'Menos aire arriba', texto: 'en altura hay menos atmósfera encima → menos presión → columna más baja.' },
    ],
    personaliza: [
      { control: 'Líquido del barómetro', texto: 'mercurio (columna corta), agua o aceite (columnas larguísimas).' },
      { control: 'Lugar', texto: 'nivel del mar, montaña (3.000 m) o el Everest: cada uno con menos presión.' },
    ],
    tips: [
      'Con mercurio a nivel del mar busca los clásicos 760 mm Hg.',
      'Cambia a agua para entender por qué los barómetros usan mercurio: ¡el de agua mediría 10 m!',
      'Sube al Everest y mira cómo se desploma la altura de la columna.',
    ],
  },

  gravitacion: {
    queEs: 'Dos montajes. Con dos esferas mides la diminuta atracción gravitatoria que hay entre ellas. Con la báscula planetaria te "pesas" en distintos cuerpos del Sistema Solar.',
    leyes: [
      { nombre: 'Gravitación universal', texto: 'toda masa atrae a toda masa: F = G·m₁·m₂/r².' },
      { nombre: 'Inverso del cuadrado', texto: 'si duplicas la distancia, la fuerza cae a la cuarta parte.' },
      { nombre: 'Peso', texto: 'P = m·g, y g cambia en cada planeta porque g = G·M/R².' },
    ],
    personaliza: [
      { control: 'Montaje', texto: 'dos esferas (experimento de Cavendish) o báscula planetaria.' },
      { control: 'Masa 1 / Masa 2', texto: 'más masa → más atracción.' },
      { control: 'Distancia (esferas)', texto: 'acércalas y la fuerza se dispara.' },
      { control: 'Cuerpo celeste (báscula)', texto: 'Luna, Marte, Tierra o Júpiter.' },
    ],
    tips: [
      'Con dos esferas verás lo increíblemente débil que es la gravedad entre objetos pequeños.',
      'Acerca las esferas a la mitad de distancia y comprueba que la fuerza se multiplica por 4.',
      'Pésate en la Luna y en Júpiter para sentir la diferencia de g.',
    ],
  },

  energia: {
    queEs: 'Sueltas un carro desde lo alto de una montaña rusa. Verás cómo su energía potencial (por estar alto) se convierte en cinética (movimiento) y, si hay rozamiento, cómo parte se pierde en forma de calor.',
    leyes: [
      { nombre: 'Energía potencial', texto: 'la que tiene por su altura: Ep = m·g·h.' },
      { nombre: 'Energía cinética', texto: 'la de su movimiento: Ec = ½·m·v².' },
      { nombre: 'Conservación de la energía', texto: 'sin rozamiento, Ep + Ec se mantiene constante; en el valle v = √(2·g·H).' },
      { nombre: 'Trabajo del rozamiento', texto: 'al rodar por el llano con rozamiento, parte de la energía se va como calor: W = μ·m·g·d (en una rampa habría que usar la normal real, m·g·cos θ).' },
    ],
    personaliza: [
      { control: 'Altura inicial', texto: 'más altura → más energía total y más velocidad abajo.' },
      { control: 'Masa del carro', texto: 'cambia las energías, pero no la velocidad en el valle (sin rozamiento).' },
      { control: 'Rozamiento del llano μ', texto: 'con μ > 0 el carro acaba frenándose.' },
    ],
    tips: [
      'Pon μ = 0 y mira las barras de energía intercambiarse sin perder nada.',
      'Comprueba que dos masas distintas llegan al valle a la misma velocidad (de nuevo, Galileo).',
      'Sube μ y observa cuántos metros recorre antes de pararse: el calor se "come" la energía.',
    ],
  },

  'movimiento-circular': {
    queEs: 'Una bola atada a una cuerda gira en círculo. La cuerda tira de ella hacia el centro (fuerza centrípeta). Si pides demasiado, la cuerda no aguanta, se rompe y la bola sale disparada en línea recta.',
    leyes: [
      { nombre: 'Velocidad lineal', texto: 'v = ω·r: a más radio o más giro, más rápida va la bola.' },
      { nombre: 'Fuerza centrípeta', texto: 'Fc = m·v²/r = m·ω²·r y apunta SIEMPRE hacia el centro.' },
      { nombre: 'Inercia al romperse', texto: 'sin cuerda no hay fuerza al centro: la bola sigue recta, tangente al círculo (no "hacia fuera").' },
    ],
    personaliza: [
      { control: 'Radio', texto: 'el tamaño del círculo.' },
      { control: 'Velocidad angular ω', texto: 'lo rápido que gira, en radianes por segundo.' },
      { control: 'Masa', texto: 'más masa → más fuerza centrípeta necesaria.' },
    ],
    tips: [
      'Sube ω y mira crecer la tensión de la cuerda hasta que no aguanta.',
      'Cuando se rompa, fíjate bien: la bola sale recta (tangente), no radial.',
      'Comprueba que Fc crece con el cuadrado de ω: doble velocidad de giro → cuádruple fuerza.',
    ],
  },

  'tiro-parabolico': {
    queEs: 'Lanzas un proyectil y trazas su parábola. Es la suma de dos movimientos a la vez: uno horizontal a velocidad constante y otro vertical de caída libre.',
    leyes: [
      { nombre: 'Composición de movimientos', texto: 'horizontal uniforme (x = v₀·cos θ·t) + vertical con la gravedad, a la vez e independientes.' },
      { nombre: 'Alcance', texto: 'R = v₀²·sen(2θ)/g, máximo cuando lanzas a 45°.' },
      { nombre: 'Altura máxima', texto: 'depende solo de la componente vertical de la velocidad (v₀·sen θ).' },
    ],
    personaliza: [
      { control: 'Velocidad inicial v₀', texto: 'más rapidez → más alcance y más altura.' },
      { control: 'Ángulo de lanzamiento', texto: 'prueba 30° y 60° (¡llegan igual de lejos!) y 45° (alcance máximo).' },
      { control: 'Altura de lanzamiento', texto: 'lanzar desde alto añade distancia al alcance.' },
      { control: 'Resistencia del aire', texto: 'actívala para ver la trayectoria real, más corta y ladeada.' },
    ],
    tips: [
      'Comprueba que 30° y 60° llegan a la misma distancia (son ángulos complementarios).',
      'Busca el alcance máximo afinando alrededor de 45°.',
      'Activa el aire y observa cómo la parábola se acorta y pierde su simetría.',
    ],
  },

  choques: {
    queEs: 'Dos carros chocan en un riel sin rozamiento. Ajustas las masas, las velocidades y el tipo de choque (de pegajoso a perfectamente elástico) y compruebas que el momento total nunca cambia.',
    leyes: [
      { nombre: 'Conservación del momento', texto: 'la suma de m·v de los dos carros es la misma antes y después del choque.' },
      { nombre: 'Coeficiente de restitución e', texto: 'e = 1 es elástico (también se conserva la energía); e = 0 es inelástico (quedan pegados).' },
      { nombre: 'Caso del billar', texto: 'con masas iguales y uno parado y e = 1, intercambian sus velocidades.' },
    ],
    personaliza: [
      { control: 'Masas (carro 1 y 2)', texto: 'cambian quién "manda" en el choque.' },
      { control: 'Velocidades iniciales', texto: 'pueden ir en sentidos opuestos (usa el signo).' },
      { control: 'Restitución e', texto: 'desliza de 0 (quedan pegados) a 1 (rebote perfecto).' },
    ],
    tips: [
      'Masas iguales, uno quieto y e = 1: el que llega se para y el otro sale (como en el billar).',
      'Pon e = 0 para un choque perfectamente inelástico y comprueba que salen pegados.',
      'Suma m·v antes y después: siempre da lo mismo, cambies lo que cambies.',
    ],
  },

  estatica: {
    queEs: 'Un balancín. Cada peso, según la distancia a la que cuelga del eje, crea un momento que tiende a hacerlo girar. El balancín queda en equilibrio cuando los momentos de los dos lados se compensan.',
    leyes: [
      { nombre: 'Momento de una fuerza', texto: 'M = F·d: es la fuerza multiplicada por su distancia al eje (el "brazo").' },
      { nombre: 'Equilibrio de rotación', texto: 'la suma de momentos es cero: m₁·d₁ = m₂·d₂.' },
      { nombre: 'El truco de la palanca', texto: 'una masa pequeña lejos del eje puede equilibrar a una grande que esté cerca.' },
    ],
    personaliza: [
      { control: 'Masa izquierda / derecha', texto: 'el peso de cada lado del balancín.' },
      { control: 'Distancia izquierda / derecha', texto: 'a qué distancia del eje cuelga cada peso.' },
    ],
    tips: [
      'Equilibra un peso grande cerca del eje con uno pequeño colocado lejos (David y Goliat).',
      'Antes de soltar, comprueba la regla m₁·d₁ = m₂·d₂.',
      'Mueve solo una distancia y predice hacia qué lado girará.',
    ],
  },

  orbitas: {
    queEs: 'Lanzas un satélite alrededor de la Tierra. Si va muy lento, cae; si va demasiado rápido, escapa; y en el punto justo, se queda dando vueltas en una órbita circular o elíptica.',
    leyes: [
      { nombre: 'Velocidad orbital', texto: 'para una órbita circular, v = √(μ/r), midiendo r desde el centro de la Tierra.' },
      { nombre: 'Velocidad de escape', texto: 'con ve = √2·v_circular o más, el satélite se marcha para siempre.' },
      { nombre: '3ª ley de Kepler', texto: 'el periodo depende solo del tamaño de la órbita: T² ∝ a³.' },
    ],
    personaliza: [
      { control: 'Altura inicial', texto: 'a qué altura sueltas el satélite (de 200 a 40.000 km).' },
      { control: 'Velocidad de inserción', texto: 'la clave de todo: ajústala para órbita circular, elíptica o escape.' },
    ],
    tips: [
      'A 400 km de altura prueba unos 7.700 m/s para una órbita casi circular.',
      'Sube la velocidad hasta ver una elipse, y un poco más hasta que el satélite escape.',
      'Busca la órbita geoestacionaria (~35.800 km), donde el periodo es de 24 horas.',
    ],
  },

  oscilaciones: {
    queEs: 'Un péndulo o una masa colgada de un muelle oscilando. Cronometras el periodo (lo que tarda una ida y vuelta completa) y lo comparas con lo que predice la fórmula.',
    leyes: [
      { nombre: 'Periodo del péndulo', texto: 'T = 2π·√(L/g): depende de la longitud y de g, pero NO de la masa ni (casi) de la amplitud.' },
      { nombre: 'Periodo masa-muelle', texto: 'T = 2π·√(m/k): depende de la masa y del muelle, pero NO de g ni de la amplitud.' },
      { nombre: 'Frecuencia', texto: 'f = 1/T: el número de oscilaciones por segundo (en hercios).' },
    ],
    personaliza: [
      { control: 'Montaje', texto: 'péndulo o masa-muelle.' },
      { control: 'Longitud L (péndulo)', texto: 'un péndulo más largo oscila más lento.' },
      { control: 'Amplitud', texto: 'cuánto lo separas del centro (en un MAS casi no cambia el periodo).' },
      { control: 'k y Masa (muelle)', texto: 'muelle duro → rápido; más masa → lento.' },
      { control: 'Lugar (péndulo)', texto: 'en la Luna oscila más lento, porque hay menos g.' },
    ],
    tips: [
      'Busca la longitud que da T = 2 s: es el péndulo "segundero".',
      'Cambia la amplitud y comprueba que el periodo apenas se inmuta (el gran descubrimiento de Galileo).',
      'Lleva el péndulo a la Luna y verás cómo se ralentiza.',
    ],
  },

  'cargas-campos': {
    queEs: 'Dos montajes. En Coulomb, dos cargas eléctricas se atraen o se repelen. En Lorentz, un ion lanzado dentro de un campo magnético describe un círculo perfecto.',
    leyes: [
      { nombre: 'Ley de Coulomb', texto: 'F = k·q₁·q₂/r²: cargas del mismo signo se repelen y de signo opuesto se atraen.' },
      { nombre: 'Fuerza de Lorentz', texto: 'F = q·v×B, siempre perpendicular a la velocidad: curva la trayectoria sin cambiar la rapidez.' },
      { nombre: 'Radio de giro', texto: 'R = m·v/(q·B); curiosamente, el periodo de giro no depende de la velocidad.' },
    ],
    personaliza: [
      { control: 'Montaje', texto: 'Coulomb (dos cargas) o Lorentz (ion en un campo magnético B).' },
      { control: 'q₁, q₂ y distancia r (Coulomb)', texto: 'juega con los signos y con la separación.' },
      { control: 'Carga, masa, velocidad y B (Lorentz)', texto: 'cambian el tamaño del círculo que describe el ion.' },
    ],
    tips: [
      'En Coulomb pon una carga + y otra − para ver la atracción; con el mismo signo se repelen.',
      'Acerca las cargas (r menor) y la fuerza se dispara (inverso del cuadrado).',
      'En Lorentz sube el campo B y mira cómo el círculo se hace más pequeño.',
    ],
  },

  'tunel-viento': {
    queEs: 'Un perfil de ala dentro de una corriente de aire. Ves las líneas de flujo acelerarse por la parte de arriba y mides la sustentación, la fuerza que mantiene volando a un avión.',
    leyes: [
      { nombre: 'Principio de Bernoulli', texto: 'donde el aire va más rápido, la presión es menor: por eso el ala es empujada hacia arriba.' },
      { nombre: 'Sustentación (Kutta-Joukowski)', texto: 'L = ρ·U·Γ: crece con la velocidad del viento y con el ángulo del ala.' },
      { nombre: 'Ángulo de ataque', texto: 'más ángulo da más sustentación… hasta que el ala entra en pérdida.' },
    ],
    personaliza: [
      { control: 'Velocidad del viento U', texto: 'más rápido → más sustentación (crece con el cuadrado de U).' },
      { control: 'Ángulo de ataque', texto: 'inclina el ala respecto a la corriente de aire.' },
    ],
    tips: [
      'Sube U y mira crecer la sustentación; fíjate en que aumenta con U².',
      'Pon un ángulo negativo y verás sustentación hacia abajo (como en vuelo invertido).',
      'Observa que sin inclinación (sin circulación) casi no hay sustentación.',
    ],
  },

  stokes: {
    queEs: 'Dejas caer una bola dentro de un fluido viscoso (miel, glicerina…). Tras un instante alcanza una velocidad constante, la velocidad terminal, en la que el peso, el empuje y el rozamiento del fluido se equilibran.',
    leyes: [
      { nombre: 'Arrastre de Stokes', texto: 'el fluido frena la bola con F = 6π·η·R·v: más a las bolas grandes y rápidas.' },
      { nombre: 'Velocidad terminal', texto: 'cuando peso = empuje + arrastre, la bola deja de acelerar: v_t = 2·R²·g·(ρ_bola−ρ_fluido)/(9·η).' },
      { nombre: 'Límite de validez', texto: 'la fórmula solo vale si el flujo es suave (número de Reynolds Re < 1).' },
    ],
    personaliza: [
      { control: 'Radio de la bola', texto: 'las bolas más grandes caen mucho más rápido (v_t crece con R²).' },
      { control: 'Material', texto: 'plástico, aluminio, acero u oro: más denso → más rápido.' },
      { control: 'Fluido', texto: 'agua, aceite, glicerina o miel: más viscoso → más lento.' },
    ],
    tips: [
      'En miel verás la velocidad terminal clarísima: cae despacito y a ritmo constante.',
      'Sube el radio y comprueba que la velocidad crece muy deprisa (con R²).',
      'Prueba una bola grande en agua: el Reynolds se dispara y Stokes deja de valer (la sim lo avisa).',
    ],
  },
};

export default SIM_INFO;
