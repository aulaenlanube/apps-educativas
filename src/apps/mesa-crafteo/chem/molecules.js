// src/apps/mesa-crafteo/chem/molecules.js
// Catálogo de moléculas e iones que se pueden construir en la mesa.
//
// atoms: tokens (ver elements.js: 'O', 'O-', 'N+'…) · bonds: [i, j, orden]
// Cada estructura es una fórmula de Lewis válida: todos los átomos tienen una
// de sus valencias y la suma de cargas formales es la carga del ion.
// rank: curso mínimo (1-4 = 1º-4º ESO, 5-6 = 1º-2º Bachillerato).
// diff: dificultad de construcción 1-5 (la usa el examen para elegir moléculas).
// shape: geometría molecular (VSEPR) · angle: ángulo de enlace característico.
// polar: true/false, o null en los iones.

export const MOLECULES = [
  // ───────── Diatómicas ─────────
  {
    id: 'h2', name: 'Hidrógeno', formula: 'H₂', rank: 1, diff: 1,
    atoms: ['H', 'H'], bonds: [[0, 1, 1]],
    shape: 'Lineal', angle: null, polar: false,
    uses: 'Combustible de cohetes y de pilas de hidrógeno; materia prima del amoníaco.',
    fact: 'Es la molécula más ligera que existe: un globo de hidrógeno sube más rápido que uno de helio.',
  },
  {
    id: 'hcl', name: 'Cloruro de hidrógeno', formula: 'HCl', rank: 1, diff: 1,
    atoms: ['H', 'Cl'], bonds: [[0, 1, 1]],
    shape: 'Lineal', angle: null, polar: true,
    uses: 'Disuelto en agua es el ácido clorhídrico (salfumán), que también está en tu jugo gástrico.',
    fact: 'Tu estómago fabrica a diario entre 1 y 2 litros de jugo gástrico con ácido clorhídrico.',
  },
  {
    id: 'cl2', name: 'Cloro', formula: 'Cl₂', rank: 1, diff: 1,
    atoms: ['Cl', 'Cl'], bonds: [[0, 1, 1]],
    shape: 'Lineal', angle: null, polar: false,
    uses: 'Desinfección del agua potable y de las piscinas; fabricación del PVC.',
    fact: 'Es un gas amarillo verdoso: su nombre viene del griego chlorós, "verde pálido".',
  },
  {
    id: 'hf', name: 'Fluoruro de hidrógeno', formula: 'HF', rank: 1, diff: 1,
    atoms: ['H', 'F'], bonds: [[0, 1, 1]],
    shape: 'Lineal', angle: null, polar: true,
    uses: 'Su disolución (ácido fluorhídrico) se usa para grabar el vidrio.',
    fact: 'Es uno de los pocos ácidos capaces de atacar el vidrio, por eso se guarda en botes de plástico.',
  },
  {
    id: 'f2', name: 'Flúor', formula: 'F₂', rank: 1, diff: 1,
    atoms: ['F', 'F'], bonds: [[0, 1, 1]],
    shape: 'Lineal', angle: null, polar: false,
    uses: 'Fabricación de teflón y de compuestos fluorados como los de la pasta de dientes.',
    fact: 'Es el elemento más electronegativo de la tabla periódica: reacciona con casi todo.',
  },
  {
    id: 'hbr', name: 'Bromuro de hidrógeno', formula: 'HBr', rank: 1, diff: 1,
    atoms: ['H', 'Br'], bonds: [[0, 1, 1]],
    shape: 'Lineal', angle: null, polar: true,
    uses: 'Reactivo en química orgánica para fabricar compuestos bromados.',
    fact: 'Es menos polar que el HCl: el bromo atrae los electrones con menos fuerza que el cloro.',
  },

  // ───────── Formas en el espacio ─────────
  {
    id: 'h2o', name: 'Agua', formula: 'H₂O', rank: 1, diff: 1,
    atoms: ['O', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1]],
    shape: 'Angular', angle: '104,5°', polar: true,
    uses: 'Disolvente universal: sin ella no hay vida tal y como la conocemos.',
    fact: 'Los dos pares solitarios del oxígeno empujan a los hidrógenos y cierran el ángulo hasta 104,5°.',
  },
  {
    id: 'nh3', name: 'Amoníaco', formula: 'NH₃', rank: 1, diff: 2,
    atoms: ['N', 'H', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
    shape: 'Piramidal trigonal', angle: '107°', polar: true,
    uses: 'Fertilizantes y productos de limpieza.',
    fact: 'Casi la mitad de los átomos de nitrógeno de tu cuerpo pasaron por una fábrica de amoníaco.',
  },
  {
    id: 'ch4', name: 'Metano', formula: 'CH₄', rank: 1, diff: 2,
    atoms: ['C', 'H', 'H', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
    shape: 'Tetraédrica', angle: '109,5°', polar: false,
    uses: 'Componente principal del gas natural que se usa en cocinas y calefacciones.',
    fact: 'Es un gas de efecto invernadero unas 80 veces más potente que el CO₂ a corto plazo.',
  },
  {
    id: 'h2s', name: 'Sulfuro de hidrógeno', formula: 'H₂S', rank: 1, diff: 1,
    atoms: ['S', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1]],
    shape: 'Angular', angle: '92°', polar: true,
    uses: 'Se obtiene de él el azufre que se usa para fabricar ácido sulfúrico.',
    fact: 'Es el responsable del olor a huevo podrido.',
  },
  {
    id: 'ph3', name: 'Fosfano', formula: 'PH₃', rank: 1, diff: 2,
    atoms: ['P', 'H', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
    shape: 'Piramidal trigonal', angle: '93,5°', polar: true,
    uses: 'Fumigante para proteger los granos almacenados y dopante en la industria de los chips.',
    fact: 'Su nombre clásico es fosfina; es un gas muy tóxico.',
  },
  {
    id: 'ch3cl', name: 'Clorometano', formula: 'CH₃Cl', rank: 1, diff: 2,
    atoms: ['C', 'Cl', 'H', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
    shape: 'Tetraédrica', angle: '≈ 109,5°', polar: true,
    uses: 'Se usa para fabricar siliconas.',
    fact: 'Las algas y los hongos del océano lo producen de forma natural.',
  },
  {
    id: 'ccl4', name: 'Tetraclorometano', formula: 'CCl₄', rank: 1, diff: 2,
    atoms: ['C', 'Cl', 'Cl', 'Cl', 'Cl'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
    shape: 'Tetraédrica', angle: '109,5°', polar: false,
    uses: 'Antiguo disolvente y extintor; hoy está prohibido por dañar la capa de ozono.',
    fact: 'Tiene enlaces polares pero es apolar: los cuatro dipolos se anulan por simetría.',
  },
  {
    id: 'h2o2', name: 'Peróxido de hidrógeno', formula: 'H₂O₂', rank: 1, diff: 2,
    atoms: ['O', 'O', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1], [1, 3, 1]],
    shape: 'Angular en cada O (forma de libro abierto)', angle: '≈ 95°', polar: true,
    uses: 'Agua oxigenada: desinfectante y blanqueador.',
    fact: 'Las burbujas al echarlo en una herida son oxígeno: la enzima catalasa lo descompone.',
  },

  // ───────── Dobles y triples ─────────
  {
    id: 'o2', name: 'Oxígeno', formula: 'O₂', rank: 1, diff: 2,
    atoms: ['O', 'O'], bonds: [[0, 1, 2]],
    shape: 'Lineal', angle: null, polar: false,
    uses: 'Respiración y combustiones; hospitales y soldadura.',
    fact: 'El oxígeno líquido es azul pálido y lo atrae un imán.',
  },
  {
    id: 'co2', name: 'Dióxido de carbono', formula: 'CO₂', rank: 1, diff: 2,
    atoms: ['C', 'O', 'O'], bonds: [[0, 1, 2], [0, 2, 2]],
    shape: 'Lineal', angle: '180°', polar: false,
    uses: 'Burbujas de los refrescos, extintores y fotosíntesis de las plantas.',
    fact: 'Sólido se llama hielo seco y pasa directamente a gas (sublima) a −78 °C.',
  },
  {
    id: 'n2', name: 'Nitrógeno', formula: 'N₂', rank: 1, diff: 2,
    atoms: ['N', 'N'], bonds: [[0, 1, 3]],
    shape: 'Lineal', angle: null, polar: false,
    uses: 'Atmósfera protectora en envases de alimentos; nitrógeno líquido para congelar.',
    fact: 'Su triple enlace es tan fuerte que el N₂ del aire casi no reacciona: es el 78 % de lo que respiras.',
  },
  {
    id: 'hcn', name: 'Cianuro de hidrógeno', formula: 'HCN', rank: 1, diff: 3,
    atoms: ['C', 'H', 'N'], bonds: [[0, 1, 1], [0, 2, 3]],
    shape: 'Lineal', angle: '180°', polar: true,
    uses: 'Fabricación de plásticos acrílicos y nailon.',
    fact: 'Las semillas de la manzana y de la almendra amarga lo liberan en pequeñas cantidades.',
  },
  {
    id: 'ch2o', name: 'Metanal', formula: 'CH₂O', rank: 1, diff: 3,
    atoms: ['C', 'O', 'H', 'H'], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]],
    shape: 'Trigonal plana', angle: '≈ 120°', polar: true,
    uses: 'También llamado formaldehído: resinas, tableros de madera y conservación de muestras.',
    fact: 'Su disolución en agua es el formol que conserva los especímenes de los museos.',
  },
  {
    id: 'c2h4', name: 'Eteno', formula: 'C₂H₄', rank: 1, diff: 3,
    atoms: ['C', 'C', 'H', 'H', 'H', 'H'], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
    shape: 'Trigonal plana en cada C (molécula plana)', angle: '≈ 120°', polar: false,
    uses: 'También llamado etileno: con él se fabrica el polietileno de las bolsas.',
    fact: 'Las frutas lo desprenden al madurar: un plátano maduro acelera a los que tiene al lado.',
  },
  {
    id: 'c2h2', name: 'Etino', formula: 'C₂H₂', rank: 1, diff: 3,
    atoms: ['C', 'C', 'H', 'H'], bonds: [[0, 1, 3], [0, 2, 1], [1, 3, 1]],
    shape: 'Lineal', angle: '180°', polar: false,
    uses: 'También llamado acetileno: soplete oxiacetilénico para soldar y cortar metales.',
    fact: 'Su llama con oxígeno supera los 3000 °C.',
  },

  // ───────── Química del carbono ─────────
  {
    id: 'c2h6', name: 'Etano', formula: 'C₂H₆', rank: 3, diff: 3,
    atoms: ['C', 'C', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]],
    shape: 'Tetraédrica en cada C', angle: '109,5°', polar: false,
    uses: 'Segundo componente del gas natural; se transforma en eteno para hacer plásticos.',
    fact: 'Los dos grupos CH₃ pueden girar libremente alrededor del enlace sencillo C–C.',
  },
  {
    id: 'c3h8', name: 'Propano', formula: 'C₃H₈', rank: 3, diff: 3,
    atoms: ['C', 'C', 'C', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [1, 7, 1], [2, 8, 1], [2, 9, 1], [2, 10, 1]],
    shape: 'Tetraédrica en cada C (cadena en zigzag)', angle: '≈ 112° (C–C–C)', polar: false,
    uses: 'Gas de las bombonas de cocinas, barbacoas y calentadores.',
    fact: 'Se licúa con poca presión: por eso cabe tanto gas en una bombona.',
  },
  {
    id: 'ch3oh', name: 'Metanol', formula: 'CH₃OH', rank: 3, diff: 3,
    atoms: ['C', 'O', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1]],
    shape: 'Tetraédrica en el C, angular en el O', angle: '≈ 108,5° (C–O–H)', polar: true,
    uses: 'Disolvente, anticongelante y combustible.',
    fact: 'Es muy tóxico: unos pocos mililitros pueden causar ceguera.',
  },
  {
    id: 'c2h5oh', name: 'Etanol', formula: 'C₂H₅OH', rank: 3, diff: 4,
    atoms: ['C', 'C', 'O', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [1, 7, 1], [2, 8, 1]],
    shape: 'Tetraédrica en los C, angular en el O', angle: '≈ 109°', polar: true,
    uses: 'Alcohol de las bebidas, desinfectante y biocombustible.',
    fact: 'Tiene un isómero, el metoximetano: misma fórmula, C₂H₆O, y propiedades muy distintas.',
  },
  {
    id: 'ch3och3', name: 'Metoximetano', formula: 'CH₃OCH₃', rank: 3, diff: 4,
    atoms: ['C', 'O', 'C', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [2, 6, 1], [2, 7, 1], [2, 8, 1]],
    shape: 'Angular en el O', angle: '≈ 112° (C–O–C)', polar: true,
    uses: 'También llamado dimetil éter: propelente de aerosoles y combustible limpio.',
    fact: 'Es isómero del etanol, pero a temperatura ambiente es un gas.',
  },
  {
    id: 'ch3cho', name: 'Etanal', formula: 'CH₃CHO', rank: 3, diff: 4,
    atoms: ['C', 'C', 'O', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 2], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1]],
    shape: 'Trigonal plana en el C del grupo C=O', angle: '≈ 120°', polar: true,
    uses: 'También llamado acetaldehído: fabricación de ácido acético y perfumes.',
    fact: 'Tu hígado lo produce al descomponer el alcohol: es parte de la causa de la resaca.',
  },
  {
    id: 'ch3coch3', name: 'Propanona', formula: 'CH₃COCH₃', rank: 3, diff: 4,
    atoms: ['C', 'C', 'C', 'O', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 1], [1, 3, 2], [0, 4, 1], [0, 5, 1], [0, 6, 1], [2, 7, 1], [2, 8, 1], [2, 9, 1]],
    shape: 'Trigonal plana en el C=O', angle: '≈ 120°', polar: true,
    uses: 'También llamada acetona: quitaesmaltes y disolvente de pinturas.',
    fact: 'Tu cuerpo la fabrica en pequeñas cantidades cuando quema grasas.',
  },
  {
    id: 'hcooh', name: 'Ácido metanoico', formula: 'HCOOH', rank: 3, diff: 4,
    atoms: ['C', 'O', 'O', 'H', 'H'],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [2, 4, 1]],
    shape: 'Trigonal plana en el C', angle: '≈ 120°', polar: true,
    uses: 'También llamado ácido fórmico: curtido de pieles y conservante de piensos.',
    fact: 'Es el ácido de la picadura de las hormigas (formica, en latín).',
  },
  {
    id: 'ch3cooh', name: 'Ácido etanoico', formula: 'CH₃COOH', rank: 3, diff: 4,
    atoms: ['C', 'C', 'O', 'O', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [0, 5, 1], [0, 6, 1], [0, 7, 1]],
    shape: 'Trigonal plana en el grupo –COOH', angle: '≈ 120°', polar: true,
    uses: 'También llamado ácido acético: es el ácido del vinagre.',
    fact: 'Puro se congela a 17 °C formando cristales como el hielo: por eso se llama "glacial".',
  },

  // ───────── Ácidos y anillos ─────────
  {
    id: 'h2co3', name: 'Ácido carbónico', formula: 'H₂CO₃', rank: 4, diff: 4,
    atoms: ['C', 'O', 'O', 'O', 'H', 'H'],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [2, 4, 1], [3, 5, 1]],
    shape: 'Trigonal plana en el C', angle: '≈ 120°', polar: true,
    uses: 'Se forma al disolver CO₂ en agua: da el toque ácido a las bebidas con gas.',
    fact: 'Regula el pH de tu sangre junto con el ion hidrogenocarbonato.',
  },
  {
    id: 'hclo', name: 'Ácido hipocloroso', formula: 'HClO', rank: 4, diff: 3,
    atoms: ['O', 'H', 'Cl'], bonds: [[0, 1, 1], [0, 2, 1]],
    shape: 'Angular', angle: '≈ 103°', polar: true,
    uses: 'Es el desinfectante activo de la lejía y del cloro de las piscinas.',
    fact: 'Tus glóbulos blancos lo fabrican para destruir bacterias.',
  },
  {
    id: 'ch3nh2', name: 'Metilamina', formula: 'CH₃NH₂', rank: 4, diff: 3,
    atoms: ['C', 'N', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1]],
    shape: 'Tetraédrica en el C, piramidal en el N', angle: '≈ 109°', polar: true,
    uses: 'Fabricación de fármacos, pesticidas y disolventes.',
    fact: 'Contribuye al olor a pescado: las aminas huelen así.',
  },
  {
    id: 'urea', name: 'Urea', formula: 'CO(NH₂)₂', rank: 4, diff: 4,
    atoms: ['C', 'O', 'N', 'N', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [2, 4, 1], [2, 5, 1], [3, 6, 1], [3, 7, 1]],
    shape: 'Trigonal plana en el C', angle: '≈ 120°', polar: true,
    uses: 'Fertilizante más usado del mundo y crema hidratante.',
    fact: 'En 1828 Wöhler la sintetizó en el laboratorio: la primera molécula "de la vida" fabricada a partir de sustancias inorgánicas.',
  },
  {
    id: 'glicerina', name: 'Propano-1,2,3-triol', formula: 'C₃H₈O₃', rank: 4, diff: 5,
    atoms: ['C', 'C', 'C', 'O', 'O', 'O', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [1, 4, 1], [2, 5, 1], [3, 6, 1], [4, 7, 1], [5, 8, 1], [0, 9, 1], [0, 10, 1], [1, 11, 1], [2, 12, 1], [2, 13, 1]],
    shape: 'Tetraédrica en los C', angle: '≈ 109,5°', polar: true,
    uses: 'También llamada glicerina: cosméticos, jarabes y fabricación de jabón.',
    fact: 'Con ácido nítrico se convierte en nitroglicerina, el explosivo que Nobel domesticó en la dinamita.',
  },
  {
    id: 'c6h12', name: 'Ciclohexano', formula: 'C₆H₁₂', rank: 4, diff: 5, ring: true,
    atoms: ['C', 'C', 'C', 'C', 'C', 'C', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 0, 1],
      [0, 6, 1], [0, 7, 1], [1, 8, 1], [1, 9, 1], [2, 10, 1], [2, 11, 1], [3, 12, 1], [3, 13, 1], [4, 14, 1], [4, 15, 1], [5, 16, 1], [5, 17, 1]],
    shape: 'Anillo en forma de silla', angle: '≈ 111°', polar: false,
    uses: 'Materia prima del nailon y disolvente industrial.',
    fact: 'No es plano: se pliega en forma de "silla" para que cada C mantenga su ángulo tetraédrico.',
  },
  {
    id: 'c6h6', name: 'Benceno', formula: 'C₆H₆', rank: 4, diff: 5, ring: true,
    atoms: ['C', 'C', 'C', 'C', 'C', 'C', 'H', 'H', 'H', 'H', 'H', 'H'],
    bonds: [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [1, 7, 1], [2, 8, 1], [3, 9, 1], [4, 10, 1], [5, 11, 1]],
    shape: 'Hexágono plano', angle: '120°', polar: false,
    uses: 'Base de plásticos, resinas, tintes y medicamentos.',
    fact: 'Kekulé contó que imaginó su anillo al soñar con una serpiente que se mordía la cola. En realidad los 6 enlaces C–C son iguales (resonancia).',
  },

  // ───────── Iones y cargas formales (Bachillerato) ─────────
  {
    id: 'oh-', name: 'Ion hidróxido', formula: 'OH⁻', rank: 5, diff: 3, charge: -1,
    atoms: ['O-', 'H'], bonds: [[0, 1, 1]],
    shape: 'Lineal', angle: null, polar: null,
    uses: 'Es el responsable del carácter básico de la sosa cáustica (NaOH).',
    fact: 'El oxígeno lleva la carga −1: tiene tres pares solitarios y un solo enlace.',
  },
  {
    id: 'h3o+', name: 'Ion oxonio', formula: 'H₃O⁺', rank: 5, diff: 3, charge: 1,
    atoms: ['O+', 'H', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
    shape: 'Piramidal trigonal', angle: '≈ 113°', polar: null,
    uses: 'Es la forma en la que existen los "H⁺" de los ácidos disueltos en agua.',
    fact: 'También se le llama ion hidronio. Cuanto más H₃O⁺, menor es el pH.',
  },
  {
    id: 'nh4+', name: 'Ion amonio', formula: 'NH₄⁺', rank: 5, diff: 3, charge: 1,
    atoms: ['N+', 'H', 'H', 'H', 'H'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
    shape: 'Tetraédrica', angle: '109,5°', polar: null,
    uses: 'Forma parte de abonos como el nitrato de amonio.',
    fact: 'Se forma cuando el par solitario del NH₃ capta un H⁺: el N pasa a tener 4 enlaces y carga +1.',
  },
  {
    id: 'cn-', name: 'Ion cianuro', formula: 'CN⁻', rank: 5, diff: 3, charge: -1,
    atoms: ['C-', 'N'], bonds: [[0, 1, 3]],
    shape: 'Lineal', angle: null, polar: null,
    uses: 'Extracción de oro en minería y galvanizado de metales.',
    fact: 'Es isoelectrónico del N₂: tienen los mismos electrones y el mismo triple enlace.',
  },
  {
    id: 'no3-', name: 'Ion nitrato', formula: 'NO₃⁻', rank: 5, diff: 4, charge: -1,
    atoms: ['N+', 'O', 'O-', 'O-'], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]],
    shape: 'Trigonal plana', angle: '120°', polar: null,
    uses: 'Abonos nitrogenados y pólvora (nitrato de potasio).',
    fact: 'Tiene tres estructuras resonantes: el doble enlace está "repartido" entre los tres oxígenos.',
  },
  {
    id: 'co3--', name: 'Ion carbonato', formula: 'CO₃²⁻', rank: 5, diff: 4, charge: -2,
    atoms: ['C', 'O', 'O-', 'O-'], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1]],
    shape: 'Trigonal plana', angle: '120°', polar: null,
    uses: 'Forma la caliza, el mármol, las conchas y la tiza (CaCO₃).',
    fact: 'Las estalactitas crecen gota a gota cuando el carbonato de calcio precipita del agua.',
  },
  {
    id: 'o3', name: 'Ozono', formula: 'O₃', rank: 5, diff: 4,
    atoms: ['O+', 'O', 'O-'], bonds: [[0, 1, 2], [0, 2, 1]],
    shape: 'Angular', angle: '117°', polar: true,
    uses: 'Potabilización del agua; en la estratosfera nos protege de la radiación ultravioleta.',
    fact: 'El olor "a limpio" tras una tormenta eléctrica es ozono formado por los rayos.',
  },
  {
    id: 'hno3', name: 'Ácido nítrico', formula: 'HNO₃', rank: 5, diff: 5,
    atoms: ['N+', 'O', 'O-', 'O', 'H'], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [3, 4, 1]],
    shape: 'Trigonal plana en el N', angle: '≈ 120°', polar: true,
    uses: 'Fabricación de abonos, explosivos y grabado de metales.',
    fact: 'Los alquimistas lo llamaban "agua fuerte" porque disolvía la plata.',
  },

  // ───────── Geometría VSEPR avanzada (Bachillerato) ─────────
  {
    id: 'becl2', name: 'Cloruro de berilio', formula: 'BeCl₂', rank: 5, diff: 3,
    atoms: ['Be', 'Cl', 'Cl'], bonds: [[0, 1, 1], [0, 2, 1]],
    shape: 'Lineal', angle: '180°', polar: false,
    uses: 'Catalizador en síntesis orgánica.',
    fact: 'En fase gas es una excepción a la regla del octeto: el Be se queda con solo 4 electrones.',
  },
  {
    id: 'bf3', name: 'Trifluoruro de boro', formula: 'BF₃', rank: 5, diff: 3,
    atoms: ['B', 'F', 'F', 'F'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
    shape: 'Trigonal plana', angle: '120°', polar: false,
    uses: 'Catalizador en la industria de los plásticos.',
    fact: 'El boro se queda con 6 electrones: por eso acepta pares de otras moléculas (es un ácido de Lewis).',
  },
  {
    id: 'so2', name: 'Dióxido de azufre', formula: 'SO₂', rank: 5, diff: 4,
    atoms: ['S', 'O', 'O'], bonds: [[0, 1, 2], [0, 2, 2]],
    shape: 'Angular', angle: '119°', polar: true,
    uses: 'Conservante del vino (sulfitos) y fabricación de ácido sulfúrico.',
    fact: 'Los volcanes lo expulsan a la atmósfera y es uno de los causantes de la lluvia ácida.',
  },
  {
    id: 'so3', name: 'Trióxido de azufre', formula: 'SO₃', rank: 5, diff: 4,
    atoms: ['S', 'O', 'O', 'O'], bonds: [[0, 1, 2], [0, 2, 2], [0, 3, 2]],
    shape: 'Trigonal plana', angle: '120°', polar: false,
    uses: 'Intermedio de la fabricación del ácido sulfúrico.',
    fact: 'A diferencia del SO₂, no tiene par solitario en el S: por eso es plano y apolar.',
  },
  {
    id: 'h2so4', name: 'Ácido sulfúrico', formula: 'H₂SO₄', rank: 5, diff: 5,
    atoms: ['S', 'O', 'O', 'O', 'O', 'H', 'H'], bonds: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [0, 4, 1], [3, 5, 1], [4, 6, 1]],
    shape: 'Tetraédrica en el S', angle: '≈ 109,5°', polar: true,
    uses: 'El producto químico más fabricado del mundo: abonos, baterías de coche, detergentes.',
    fact: 'Disolverlo en agua desprende tanto calor que siempre se echa el ácido sobre el agua, nunca al revés.',
  },
  {
    id: 'h3po4', name: 'Ácido fosfórico', formula: 'H₃PO₄', rank: 5, diff: 5,
    atoms: ['P', 'O', 'O', 'O', 'O', 'H', 'H', 'H'], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [0, 4, 1], [2, 5, 1], [3, 6, 1], [4, 7, 1]],
    shape: 'Tetraédrica en el P', angle: '≈ 109,5°', polar: true,
    uses: 'Acidulante de los refrescos de cola y fabricación de abonos fosfatados.',
    fact: 'Los fosfatos que derivan de él forman el esqueleto del ADN.',
  },
  {
    id: 'pcl5', name: 'Pentacloruro de fósforo', formula: 'PCl₅', rank: 5, diff: 4,
    atoms: ['P', 'Cl', 'Cl', 'Cl', 'Cl', 'Cl'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1]],
    shape: 'Bipirámide trigonal', angle: '120° y 90°', polar: false,
    uses: 'Reactivo para introducir cloro en moléculas orgánicas.',
    fact: 'Sus cloros no son todos iguales: tres están en el "ecuador" y dos en los "polos".',
  },
  {
    id: 'sf6', name: 'Hexafluoruro de azufre', formula: 'SF₆', rank: 5, diff: 4,
    atoms: ['S', 'F', 'F', 'F', 'F', 'F', 'F'], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1]],
    shape: 'Octaédrica', angle: '90°', polar: false,
    uses: 'Aislante eléctrico en subestaciones de alta tensión.',
    fact: 'Es tan denso que, si lo respiras, tu voz se vuelve grave (al revés que el helio).',
  },
];

export const MOLECULE_BY_ID = Object.fromEntries(MOLECULES.map((m) => [m.id, m]));

// Rango de curso: 1-4 ESO, 5-6 Bachillerato. Primaria/otros → 1.
export function courseRank(level, grade) {
  const g = Math.max(1, parseInt(grade, 10) || 1);
  if (level === 'bachillerato') return Math.min(6, 4 + g);
  if (level === 'eso') return Math.min(4, g);
  return 1;
}

export const moleculesForRank = (rank) => MOLECULES.filter((m) => m.rank <= rank);

// Tokens distintos de una molécula (para la paleta).
export const tokensOf = (m) => [...new Set(m.atoms)];
