// src/apps/mesa-crafteo/craftingRecipes.js

export const molecules = [
    // 1º ESO (20 moléculas)
    {
        name: 'Agua',
        formula: 'H₂O',
        grade: 1,
        description: 'Sustancia líquida incolora, inodora e insípida que cubre la mayor parte de la Tierra. Es el disolvente universal y un componente esencial para el funcionamiento de todas las formas de vida conocidas.',
        pattern: [['H', 'O', 'H'], [null, null, null], [null, null, null]],
        funFact: '¡Tu cuerpo es aproximadamente un 60% agua!'
    },
    {
        name: 'Dióxido de Carbono',
        formula: 'CO₂',
        grade: 1,
        description: 'Gas incoloro que se produce en la respiración y en las combustiones. Es fundamental para el ciclo del carbono y las plantas lo utilizan para fabricar su propio alimento mediante la fotosíntesis.',
        pattern: [['O', 'C', 'O'], [null, null, null], [null, null, null]],
        funFact: '¡Es lo que hace que los refrescos tengan burbujas!'
    },
    {
        name: 'Sal común',
        formula: 'NaCl',
        grade: 1,
        description: 'Conocida químicamente como Cloruro de Sodio, es un compuesto iónico que forma cristales blancos. Es el ingrediente principal de la sal de mesa y es vital para el equilibrio de fluidos en el cuerpo humano.',
        pattern: [['Na', 'Cl', null], [null, null, null], [null, null, null]],
        funFact: 'Se usaba como moneda en la antigüedad (de ahí viene la palabra "salario").'
    },
    {
        name: 'Ácido Clorhídrico',
        formula: 'HCl',
        grade: 1,
        description: 'Compuesto químico binario formado por hidrógeno y cloro. En su estado líquido es extremadamente corrosivo y es el principal componente de los jugos gástricos que permiten la digestión de los alimentos.',
        pattern: [['H', 'Cl', null], [null, null, null], [null, null, null]],
        funFact: '¡Es tan potente que podría disolver un trozo de metal si estuviera concentrado!'
    },
    {
        name: 'Oxígeno (Gas)',
        formula: 'O₂',
        grade: 1,
        description: 'Gas diatómico incoloro e inodoro que constituye una quinta parte del aire atmosférico. Es indispensable para la respiración celular de la mayoría de los seres vivos y para los procesos de combustión.',
        pattern: [['O', 'O', null], [null, null, null], [null, null, null]],
        funFact: 'Es el tercer elemento más abundante en el universo tras el hidrógeno y el helio.'
    },
    {
        name: 'Hidrógeno (Gas)',
        formula: 'H₂',
        grade: 1,
        description: 'El gas más ligero, incoloro e inflamable. Es el elemento químico más abundante en el universo y constituye la materia prima principal de la que están hechas las estrellas como nuestro Sol.',
        pattern: [['H', 'H', null], [null, null, null], [null, null, null]],
        funFact: 'Fue el primer elemento en crearse después del Big Bang.'
    },
    {
        name: 'Nitrógeno (Gas)',
        formula: 'N₂',
        grade: 1,
        description: 'Gas inerte que constituye el 78% del aire que respiramos. Es un componente esencial de los aminoácidos y el ADN, aunque los animales no podemos absorberlo directamente del aire sino a través de la comida.',
        pattern: [['N', 'N', null], [null, null, null], [null, null, null]],
        funFact: 'En estado líquido está tan frío (-196 °C) que puede congelar objetos instantáneamente.'
    },
    {
        name: 'Óxido de Calcio',
        formula: 'CaO',
        grade: 1,
        description: 'Conocido comúnmente como cal viva. Se obtiene al calentar la piedra caliza y reacciona de forma muy enérgica con el agua desprendiendo una gran cantidad de calor.',
        pattern: [['Ca', 'O', null], [null, null, null], [null, null, null]],
        funFact: 'Se ha utilizado desde la antigüedad para fabricar mortero y cemento.'
    },
    {
        name: 'Óxido de Magnesio',
        formula: 'MgO',
        grade: 1,
        description: 'Un compuesto sólido blanco que se produce al quemar magnesio en presencia de oxígeno. Debido a su alto punto de fusión, se utiliza como material refractario en hornos industriales.',
        pattern: [['Mg', 'O', null], [null, null, null], [null, null, null]],
        funFact: 'Los atletas usan carbonato de magnesio para que no les resbalen las manos.'
    },
    {
        name: 'Fluoruro de Sodio',
        formula: 'NaF',
        grade: 1,
        description: 'Sal inorgánica que aporta iones de flúor. Es muy conocida por su capacidad para fortalecer el esmalte de los dientes y prevenir las caries al inhibir el crecimiento de bacterias bucales.',
        pattern: [['Na', 'F', null], [null, null, null], [null, null, null]],
        funFact: 'Además de la pasta de dientes, se añade en pequeñas cantidades al agua potable.'
    },
    {
        name: 'Bromuro de Potasio',
        formula: 'KBr',
        grade: 1,
        description: 'Sal blanca cristalina que se disuelve fácilmente en agua. Históricamente se utilizó en medicina como sedante y anticonvulsivo, aunque hoy tiene más usos en el revelado fotográfico.',
        pattern: [['K', 'Br', null], [null, null, null], [null, null, null]],
        funFact: 'Fue el primer medicamento efectivo contra la epilepsia descubierto en 1857.'
    },
    {
        name: 'Yoduro de Sodio',
        formula: 'NaI',
        grade: 1,
        description: 'Compuesto químico formado por sodio y yodo. Se emplea como suplemento dietético para asegurar que el cuerpo reciba suficiente yodo, un elemento necesario para el buen funcionamiento de la glándula tiroides.',
        pattern: [['Na', 'I', null], [null, null, null], [null, null, null]],
        funFact: 'La carencia de yodo es la causa más común de discapacidad intelectual prevenible en el mundo.'
    },
    {
        name: 'Óxido de Hierro (II)',
        formula: 'FeO',
        grade: 1,
        description: 'Sólido de color negro que se forma cuando el hierro se oxida con poco oxígeno. No debe confundirse con el óxido de hierro (III) o herrumbre, que tiene un color rojizo característico.',
        pattern: [['Fe', 'O', null], [null, null, null], [null, null, null]],
        funFact: 'Constituye aproximadamente el 9% del manto de la Tierra.'
    },
    {
        name: 'Sulfuro de Hierro (II)',
        formula: 'FeS',
        grade: 1,
        description: 'Compuesto químico de color gris o negro. Se presenta en la naturaleza como el mineral pirrotina y es un componente frecuente de las rocas volcánicas.',
        pattern: [['Fe', 'S', null], [null, null, null], [null, null, null]],
        funFact: 'A veces se asocia con el olor desagradable de algunas aguas termales debido a su descomposición.'
    },
    {
        name: 'Cloruro de Potasio',
        formula: 'KCl',
        grade: 1,
        description: 'Sal mineral muy parecida a la sal común pero con potasio en lugar de sodio. Es fundamental para mantener el ritmo cardíaco y se usa masivamente en la industria de los fertilizantes.',
        pattern: [['K', 'Cl', null], [null, null, null], [null, null, null]],
        funFact: 'En medicina se usa para tratar niveles bajos de potasio en sangre (hipopotasemia).'
    },
    {
        name: 'Óxido de Zinc',
        formula: 'ZnO',
        grade: 1,
        description: 'Compuesto químico sólido y blanco, casi insoluble en agua. Tiene propiedades antisépticas y protectoras para la piel, por lo que es el ingrediente estrella de muchas cremas protectoras solares.',
        pattern: [['Zn', 'O', null], [null, null, null], [null, null, null]],
        funFact: 'También se usa para fabricar gomas blancas y pinturas artísticas.'
    },
    {
        name: 'Cloruro de Magnesio',
        formula: 'MgCl₂',
        grade: 1,
        description: 'Sal formada por un átomo de magnesio y dos de cloro. Es muy soluble en agua y se encuentra de forma natural en el agua de mar, de donde se extrae para usos industriales y nutricionales.',
        pattern: [['Cl', 'Mg', 'Cl'], [null, null, null], [null, null, null]],
        funFact: 'Es el ingrediente principal del "nigari", usado para cuajar la leche de soja y hacer tofu.'
    },
    {
        name: 'Óxido de Aluminio',
        formula: 'Al₂O₃',
        grade: 1,
        description: 'Compuesto cerámico de gran dureza. En la naturaleza aparece como el mineral corindón, cuyas variedades de colores incluyen piedras preciosas tan valiosas como el rubí y el zafiro.',
        pattern: [['Al', 'O', 'Al'], ['O', null, 'O'], [null, null, null]],
        funFact: 'Es tan duro que solo es superado por unos pocos materiales como el diamante.'
    },
    {
        name: 'Fluoruro de Calcio',
        formula: 'CaF₂',
        grade: 1,
        description: 'Mineral conocido como fluorita. Cristaliza en cubos perfectos y es la fuente principal de flúor en el mundo. Se usa en metalurgia y para fabricar lentes especiales en óptica.',
        pattern: [['F', 'Ca', 'F'], [null, null, null], [null, null, null]],
        funFact: 'El fenómeno de la fluorescencia debe su nombre precisamente a este mineral.'
    },
    {
        name: 'Bromuro de Plata',
        formula: 'AgBr',
        grade: 1,
        description: 'Sal de color amarillento que tiene la propiedad única de ser sensible a la luz. Cuando los fotones chocan con ella, liberan átomos de plata metálica, permitiendo capturar imágenes.',
        pattern: [['Ag', 'Br', null], [null, null, null], [null, null, null]],
        funFact: 'Fue la pieza clave que permitió la invención de la fotografía analógica y el cine.'
    },

    // 2º ESO (+10 moléculas = 30)
    {
        name: 'Ozono',
        formula: 'O₃',
        grade: 2,
        description: 'Molécula formada por tres átomos de oxígeno. En la atmósfera superior forma una capa que nos protege de la radiación ultravioleta del Sol, aunque a nivel del suelo es un contaminante irritante.',
        pattern: [['O', 'O', 'O'], [null, null, null], [null, null, null]],
        funFact: 'Huele a metal o a "limpio" después de una tormenta eléctrica intensa.'
    },
    {
        name: 'Amoníaco',
        formula: 'NH₃',
        grade: 2,
        description: 'Gas incoloro con un olor penetrante y picante muy característico. Se produce de forma natural por la descomposición de materia orgánica y es crucial para fabricar fertilizantes que alimentan al mundo.',
        pattern: [[null, 'H', null], ['H', 'N', 'H'], [null, null, null]],
        funFact: 'En el espacio interestelar se han encontrado nubes gigantes compuestas de amoníaco.'
    },
    {
        name: 'Hipoclorito de Sodio',
        formula: 'NaClO',
        grade: 2,
        description: 'Compuesto químico disuelto en agua que conocemos como lejía. Es un oxidante fuerte que destruye bacterias, virus y hongos, además de eliminar pigmentos de color de la ropa.',
        pattern: [['Na', 'Cl', 'O'], [null, null, null], [null, null, null]],
        funFact: 'Es el desinfectante de agua más utilizado en todo el mundo para prevenir enfermedades.'
    },
    {
        name: 'Monóxido de Carbono',
        formula: 'CO',
        grade: 2,
        description: 'Gas incoloro, inodoro e insípido que es muy peligroso porque no se puede detectar con los sentidos. Se produce cuando un combustible se quema sin suficiente oxígeno, como en una estufa mal ventilada.',
        pattern: [['C', 'O', null], [null, null, null], [null, null, null]],
        funFact: 'Se une a la hemoglobina de la sangre 200 veces mejor que el oxígeno, impidiendo la respiración.'
    },
    {
        name: 'Hidróxido de Sodio',
        formula: 'NaOH',
        grade: 2,
        description: 'Base química muy fuerte y corrosiva, también llamada sosa cáustica. En contacto con el agua genera mucho calor y se usa industrialmente para fabricar papel, tejidos y jabones.',
        pattern: [['Na', 'O', 'H'], [null, null, null], [null, null, null]],
        funFact: '¡Es tan fuerte que puede disolver la grasa y el pelo, por eso se usa como desatascador!'
    },
    {
        name: 'Hidróxido de Magnesio',
        formula: 'Mg(OH)₂',
        grade: 2,
        description: 'Compuesto inorgánico blanco y poco soluble. En medicina se usa suspendido en agua (leche de magnesia) para neutralizar el exceso de ácido en el estómago y como laxante suave.',
        pattern: [['H', 'O', 'Mg'], ['O', 'H', null], [null, null, null]],
        funFact: 'Se encuentra en la naturaleza como el mineral brucita.'
    },
    {
        name: 'Ácido Nítrico',
        formula: 'HNO₃',
        grade: 2,
        description: 'Líquido viscoso y muy corrosivo que puede causar quemaduras graves. Es un reactivo fundamental en química para la nitración de compuestos y la fabricación de abonos e incluso explosivos.',
        pattern: [['H', 'O', 'N'], ['O', null, 'O'], [null, null, null]],
        funFact: 'Se utiliza para comprobar la pureza del oro, ya que el oro no se disuelve en él.'
    },
    {
        name: 'Carbonato de Calcio',
        formula: 'CaCO₃',
        grade: 2,
        description: 'Uno de los compuestos más comunes de la corteza terrestre. Es el componente principal de las rocas calizas, los mármoles, las cáscaras de huevo y los esqueletos de los corales.',
        pattern: [['Ca', 'O', null], ['O', 'C', 'O'], [null, null, null]],
        funFact: '¡Las famosas estalactitas y estalagmitas de las cuevas son depósitos de este compuesto!'
    },
    {
        name: 'Hidróxido de Calcio',
        formula: 'Ca(OH)₂',
        grade: 2,
        description: 'También llamado cal apagada. Se obtiene al añadir agua a la cal viva y es una base utilizada históricamente en la pintura de fachadas (encalado) y en el tratamiento de aguas residuales.',
        pattern: [['O', 'Ca', 'O'], ['H', null, 'H'], [null, null, null]],
        funFact: 'Se usa en la industria alimentaria para procesar el maíz en la preparación de tortillas.'
    },
    {
        name: 'Pentóxido de Dinitrógeno',
        formula: 'N₂O₅',
        grade: 2,
        description: 'Óxido de nitrógeno altamente inestable que suele presentarse como cristales blancos. Es un oxidante poderoso y se utiliza como agente para introducir grupos nitrato en otras moléculas orgánicas.',
        pattern: [['O', 'N', 'O'], [null, 'O', null], ['O', 'N', 'O']],
        funFact: 'Es un compuesto poco común que se descompone rápidamente a temperatura ambiente.'
    },

    // 3º ESO (+10 moléculas = 40)
    {
        name: 'Metano',
        formula: 'CH₄',
        grade: 3,
        description: 'El hidrocarburo más simple. Es el componente principal del gas natural que usamos en casa. Se produce por la fermentación de materia orgánica en ausencia de aire, por ejemplo en pantanos.',
        pattern: [[null, 'H', null], ['H', 'C', 'H'], [null, 'H', null]],
        funFact: 'Es un gas de efecto invernadero mucho más potente que el CO₂.'
    },
    {
        name: 'Dióxido de Silicio',
        formula: 'SiO₂',
        grade: 3,
        description: 'Compuesto de silicio y oxígeno que forma el mineral cuarzo. Es el constituyente principal de la arena de las playas y el material básico que permite fabricar el vidrio y los componentes electrónicos.',
        pattern: [['O', 'Si', 'O'], [null, null, null], [null, null, null]],
        funFact: '¡Alrededor del 59% de la masa de la corteza terrestre es sílice!'
    },
    {
        name: 'Peróxido de Hidrógeno',
        formula: 'H₂O₂',
        grade: 3,
        description: 'Líquido más denso que el agua con un átomo de oxígeno extra. Es un potente oxidante y desinfectante. En bajas concentraciones se usa como antiséptico (agua oxigenada) y para aclarar el cabello.',
        pattern: [['H', 'O', null], [null, 'O', 'H'], [null, null, null]],
        funFact: '¡En altas concentraciones se ha usado incluso como combustible para cohetes!'
    },
    {
        name: 'Sulfuro de Hidrógeno',
        formula: 'H₂S',
        grade: 3,
        description: 'Gas incoloro, inflamable y muy tóxico. Se reconoce fácilmente por su olor extremadamente desagradable a materia orgánica en descomposición. Se puede encontrar en volcanes y pozos negros.',
        pattern: [['H', 'S', 'H'], [null, null, null], [null, null, null]],
        funFact: 'A pesar de su mal olor, nuestra nariz deja de olerlo tras un rato, lo cual es muy peligroso.'
    },
    {
        name: 'Etano',
        formula: 'C₂H₆',
        grade: 3,
        description: 'Hidrocarburo alcano de dos carbonos. Es un gas incoloro e inodoro que se encuentra en el gas natural y en el petróleo crudo. Tiene un gran poder calorífico y se usa para producir etileno.',
        pattern: [['H', 'C', 'H'], ['H', 'C', 'H'], ['H', null, 'H']],
        funFact: 'Es el segundo componente más importante del gas natural tras el metano.'
    },
    {
        name: 'Propano',
        formula: 'C₃H₈',
        grade: 3,
        description: 'Gas combustible que se licua fácilmente bajo presión para su transporte en bombonas. Se usa ampliamente para calefacción, cocina y en motores como combustible menos contaminante.',
        pattern: [['H', 'C', 'H'], ['H', 'C', 'H'], ['H', 'C', 'H']],
        funFact: 'No tiene olor natural, por eso se le añade una sustancia especial para detectar fugas.'
    },
    {
        name: 'Ácido Sulfúrico',
        formula: 'H₂SO₄',
        grade: 3,
        description: 'Compuesto químico extremadamente corrosivo conocido como el "rey de la industria". Se usa para fabricar casi todo: desde fertilizantes y detergentes hasta el electrolito de las baterías de los coches.',
        pattern: [['O', 'S', 'O'], ['O', 'H', 'O'], [null, 'H', null]],
        funFact: '¡La cantidad de este ácido que consume un país es un indicador de su desarrollo industrial!'
    },
    {
        name: 'Bicarbonato de Sodio',
        formula: 'NaHCO₃',
        grade: 3,
        description: 'Sólido cristalino blanco que se disuelve en agua. Es un compuesto muy versátil que actúa como antiácido, producto de limpieza biodegradable y como levadura química en repostería.',
        pattern: [['Na', 'O', 'C'], ['O', null, 'O'], [null, 'H', null]],
        funFact: '¡Cuando reacciona con un ácido como el vinagre, libera burbujas de CO₂ a toda velocidad!'
    },
    {
        name: 'Etanol',
        formula: 'C₂H₅OH',
        grade: 3,
        description: 'El alcohol que encontramos en las bebidas fermentadas. Es un líquido inflamable que se usa también como desinfectante de piel, disolvente industrial y biocombustible renovable.',
        pattern: [['C', 'C', 'O'], ['H', 'H', 'H'], ['H', 'H', 'H']],
        funFact: '¡Se puede producir a partir de casi cualquier planta que tenga azúcares o almidón!'
    },
    {
        name: 'Acetona',
        formula: 'CH₃COCH₃',
        grade: 3,
        description: 'Compuesto químico orgánico de olor dulce y muy volátil. Es el disolvente más sencillo y efectivo para quitar lacas y esmaltes, además de ser un componente natural de nuestro metabolismo.',
        pattern: [['C', 'C', 'C'], ['H', 'O', 'H'], ['H', 'H', 'H']],
        funFact: '¡Se evapora tan rápido que produce una sensación de frío inmediata en la piel!'
    },

    // 4º ESO (+10 moléculas = 50)
    {
        name: 'Sulfato de Cobre',
        formula: 'CuSO₄',
        grade: 4,
        description: 'Sal hidratada de un color azul brillante espectacular. Se usa en agricultura como fungicida para proteger plantas, en piscinas para eliminar algas y en el proceso de recubrimiento de metales.',
        pattern: [['O', 'Cu', 'O'], [null, 'S', null], ['O', null, 'O']],
        funFact: 'Es muy famoso en los laboratorios escolares porque permite ver crecer cristales azules gigantes.'
    },
    {
        name: 'Glucosa',
        formula: 'C₆H₁₂O₆ (Simp.)',
        grade: 4,
        description: 'El azúcar más simple y la principal fuente de energía para las células de nuestro cuerpo. Se produce en las plantas verdes durante la fotosíntesis capturando la energía de la luz solar.',
        pattern: [['C', 'C', 'C'], ['H', 'O', 'H'], ['H', 'O', 'H']],
        funFact: '¡Tu cerebro consume aproximadamente 120 gramos de glucosa pura cada día!'
    },
    {
        name: 'Ácido Fosfórico',
        formula: 'H₃PO₄',
        grade: 4,
        description: 'Líquido incoloro y viscoso. Aunque es un ácido, se usa en la industria alimentaria para dar ese toque cítrico y refrescante a las bebidas de cola, además de para fabricar abonos fosfatados.',
        pattern: [['H', 'O', 'P'], ['O', 'H', 'O'], [null, 'O', 'H']],
        funFact: '¡También se usa en odontología para limpiar y acondicionar la superficie de los dientes!'
    },
    {
        name: 'Permanganato de Potasio',
        formula: 'KMnO₄',
        grade: 4,
        description: 'Compuesto formado por cristales de color violeta muy oscuro. Es un oxidante extremadamente fuerte capaz de desinfectar heridas y tratar aguas, tiñendo de púrpura intenso cualquier líquido.',
        pattern: [['K', 'O', 'Mn'], ['O', null, 'O'], [null, 'O', null]],
        funFact: '¡Al reaccionar con la glicerina líquida, puede llegar a prender fuego de forma espontánea!'
    },
    {
        name: 'Glicerina',
        formula: 'C₃H₈O₃',
        grade: 4,
        description: 'Líquido viscoso, dulce y transparente que se obtiene al fabricar jabón. Tiene la capacidad de absorber humedad del aire, por lo que se usa en cosmética para mantener la piel hidratada.',
        pattern: [['C', 'C', 'C'], ['O', 'O', 'O'], ['H', 'H', 'H']],
        funFact: '¡Es la base para fabricar la nitroglicerina, el potente explosivo que inventó Alfred Nobel!'
    },
    {
        name: 'Ácido Acético',
        formula: 'CH₃COOH',
        grade: 4,
        description: 'Ácido orgánico débil que es el responsable del sabor y olor agrio del vinagre. Se forma cuando el alcohol de bebidas como el vino o la sidra se oxida en contacto con el aire.',
        pattern: [['C', 'C', 'O'], ['H', 'H', 'O'], ['H', 'H', 'H']],
        funFact: '¡En su estado puro se llama "glacial" porque se congela a solo 17 °C formando cristales!'
    },
    {
        name: 'Benceno',
        formula: 'C₆H₆ (Simp.)',
        grade: 4,
        description: 'Hidrocarburo aromático líquido, incoloro y de olor dulce. Su estructura en forma de anillo hexagonal es fundamental en química orgánica, siendo la base para fabricar plásticos, resinas y gomas.',
        pattern: [['C', 'C', 'C'], ['C', 'C', 'C'], ['H', 'H', 'H']],
        funFact: 'Su estructura cíclica fue descubierta por Kekulé tras soñar con una serpiente que se mordía la cola.'
    },
    {
        name: 'Clorato de Potasio',
        formula: 'KClO₃',
        grade: 4,
        description: 'Sal blanca que actúa como un oxidante muy vigoroso. Se descompone liberando grandes cantidades de oxígeno al calentarse, por lo que es un ingrediente clave en la fabricación de fuegos artificiales.',
        pattern: [['K', 'O', 'Cl'], ['O', null, 'O'], [null, null, null]],
        funFact: '¡Es el compuesto que hace que las cabezas de las cerillas se inflamen tan rápido al frotarlas!'
    },
    {
        name: 'Nitrato de Plata',
        formula: 'AgNO₃',
        grade: 4,
        description: 'Sal inorgánica transparente. Es muy conocida por su capacidad de reaccionar con la piel humana, dejando manchas negras de plata metálica que son difíciles de eliminar. Se usa para fabricar espejos.',
        pattern: [['Ag', 'O', 'N'], ['O', null, 'O'], [null, null, null]],
        funFact: 'Se usó históricamente para cauterizar heridas y quemar verrugas bajo el nombre de "piedra infernal".'
    },
    {
        name: 'Dicromato de Potasio',
        formula: 'K₂Cr₂O₇',
        grade: 4,
        description: 'Sólido cristalino de un color naranja muy vivo. Es un agente oxidante muy potente utilizado en laboratorios para análisis químicos y en la industria para el curtido de pieles y grabado de metales.',
        pattern: [['K', 'O', 'Cr'], ['O', 'O', 'O'], ['Cr', 'O', 'K']],
        funFact: 'Se utilizaba antiguamente en los alcoholímetros de aire para detectar el grado de embriaguez.'
    }
];
