// src/apps/mesa-crafteo/craftingRecipes.js

export const molecules = [
    // 1º ESO (20 moléculas)
    { name: 'Agua', formula: 'H₂O', grade: 1, description: 'Esencial para la vida.', pattern: [['H', 'O', 'H'], [null, null, null], [null, null, null]], funFact: '¡Tu cuerpo es aproximadamente un 60% agua!' },
    { name: 'Dióxido de Carbono', formula: 'CO₂', grade: 1, description: 'Gas vital para las plantas.', pattern: [['O', 'C', 'O'], [null, null, null], [null, null, null]], funFact: '¡Es lo que hace que los refrescos tengan burbujas!' },
    { name: 'Sal común', formula: 'NaCl', grade: 1, description: 'Condimento esencial.', pattern: [['Na', 'Cl', null], [null, null, null], [null, null, null]], funFact: 'Se usaba como moneda en la antigüedad.' },
    { name: 'Ácido Clorhídrico', formula: 'HCl', grade: 1, description: 'Ácido del estómago.', pattern: [['H', 'Cl', null], [null, null, null], [null, null, null]], funFact: '¡Ayuda a digerir la comida!' },
    { name: 'Oxígeno (Gas)', formula: 'O₂', grade: 1, description: 'Gas que respiramos.', pattern: [['O', 'O', null], [null, null, null], [null, null, null]], funFact: 'Sin él no podríamos vivir.' },
    { name: 'Hidrógeno (Gas)', formula: 'H₂', grade: 1, description: 'El elemento más ligero.', pattern: [['H', 'H', null], [null, null, null], [null, null, null]], funFact: 'Es el combustible de las estrellas.' },
    { name: 'Nitrógeno (Gas)', formula: 'N₂', grade: 1, description: 'Gas más abundante en el aire.', pattern: [['N', 'N', null], [null, null, null], [null, null, null]], funFact: 'Constituye el 78% de la atmósfera.' },
    { name: 'Óxido de Calcio', formula: 'CaO', grade: 1, description: 'Conocido como cal viva.', pattern: [['Ca', 'O', null], [null, null, null], [null, null, null]], funFact: 'Se usa en la construcción.' },
    { name: 'Óxido de Magnesio', formula: 'MgO', grade: 1, description: 'Se usa para la acidez.', pattern: [['Mg', 'O', null], [null, null, null], [null, null, null]], funFact: 'Es un polvo blanco muy ligero.' },
    { name: 'Fluoruro de Sodio', formula: 'NaF', grade: 1, description: 'Eficaz contra las caries.', pattern: [['Na', 'F', null], [null, null, null], [null, null, null]], funFact: 'Se añade habitualmente a la pasta de dientes.' },
    { name: 'Bromuro de Potasio', formula: 'KBr', grade: 1, description: 'Sal usada en medicina antigua.', pattern: [['K', 'Br', null], [null, null, null], [null, null, null]], funFact: 'Se usaba como sedante en el siglo XIX.' },
    { name: 'Yoduro de Sodio', formula: 'NaI', grade: 1, description: 'Fuente de yodo.', pattern: [['Na', 'I', null], [null, null, null], [null, null, null]], funFact: 'Se añade a la sal para evitar el bocio.' },
    { name: 'Óxido de Hierro (II)', formula: 'FeO', grade: 1, description: 'Óxido mineral.', pattern: [['Fe', 'O', null], [null, null, null], [null, null, null]], funFact: 'Es una de las formas en que el hierro se oxida.' },
    { name: 'Sulfuro de Hierro (II)', formula: 'FeS', grade: 1, description: 'Mineral llamado pirita (falsa).', pattern: [['Fe', 'S', null], [null, null, null], [null, null, null]], funFact: 'Se confunde fácilmente con el oro por su brillo.' },
    { name: 'Cloruro de Potasio', formula: 'KCl', grade: 1, description: 'Sustituto de la sal.', pattern: [['K', 'Cl', null], [null, null, null], [null, null, null]], funFact: 'Se usa en fertilizantes y medicina.' },
    { name: 'Óxido de Zinc', formula: 'ZnO', grade: 1, description: 'Polvo para la piel.', pattern: [['Zn', 'O', null], [null, null, null], [null, null, null]], funFact: 'Se usa en cremas solares y pomadas.' },
    { name: 'Cloruro de Magnesio', formula: 'MgCl₂', grade: 1, description: 'Sal de magnesio.', pattern: [['Cl', 'Mg', 'Cl'], [null, null, null], [null, null, null]], funFact: 'Se extrae directamente del agua de mar.' },
    { name: 'Óxido de Aluminio', formula: 'Al₂O₃', grade: 1, description: 'Mineral base del rubí.', pattern: [['Al', 'O', 'Al'], ['O', null, 'O'], [null, null, null]], funFact: 'Es extremadamente duro y resistente.' },
    { name: 'Fluoruro de Calcio', formula: 'CaF₂', grade: 1, description: 'Mineral fluorita.', pattern: [['F', 'Ca', 'F'], [null, null, null], [null, null, null]], funFact: 'Brilla bajo luz ultravioleta.' },
    { name: 'Bromuro de Plata', formula: 'AgBr', grade: 1, description: 'Sensible a la luz.', pattern: [['Ag', 'Br', null], [null, null, null], [null, null, null]], funFact: 'Fue fundamental para la fotografía analógica.' },

    // 2º ESO (+10 moléculas = 30)
    { name: 'Ozono', formula: 'O₃', grade: 2, description: 'Protección ultravioleta.', pattern: [['O', 'O', 'O'], [null, null, null], [null, null, null]], funFact: 'Huele a metal después de una tormenta.' },
    { name: 'Amoníaco', formula: 'NH₃', grade: 2, description: 'Gas de olor fuerte.', pattern: [[null, 'H', null], ['H', 'N', 'H'], [null, null, null]], funFact: 'Se usa mucho en limpieza y fertilizantes.' },
    { name: 'Hipoclorito de Sodio', formula: 'NaClO', grade: 2, description: 'Componente de la lejía.', pattern: [['Na', 'Cl', 'O'], [null, null, null], [null, null, null]], funFact: 'Es un potente desinfectante.' },
    { name: 'Monóxido de Carbono', formula: 'CO', grade: 2, description: 'Gas tóxico incoloro.', pattern: [['C', 'O', null], [null, null, null], [null, null, null]], funFact: 'Se produce por mala combustión.' },
    { name: 'Hidróxido de Sodio', formula: 'NaOH', grade: 2, description: 'Sosa cáustica.', pattern: [['Na', 'O', 'H'], [null, null, null], [null, null, null]], funFact: 'Se usa para fabricar jabón y desatascar.' },
    { name: 'Hidróxido de Magnesio', formula: 'Mg(OH)₂', grade: 2, description: 'Leche de magnesia.', pattern: [['H', 'O', 'Mg'], ['O', 'H', null], [null, null, null]], funFact: 'Se usa como antiácido estomacal.' },
    { name: 'Ácido Nítrico', formula: 'HNO₃', grade: 2, description: 'Ácido muy fuerte.', pattern: [['H', 'O', 'N'], ['O', null, 'O'], [null, null, null]], funFact: 'Se usa para fabricar explosivos y abonos.' },
    { name: 'Carbonato de Calcio', formula: 'CaCO₃', grade: 2, description: 'Mármol y tiza.', pattern: [['Ca', 'O', null], ['O', 'C', 'O'], [null, null, null]], funFact: 'Es de lo que están hechas las conchas marinas.' },
    { name: 'Hidróxido de Calcio', formula: 'Ca(OH)₂', grade: 2, description: 'Cal apagada.', pattern: [['O', 'Ca', 'O'], ['H', null, 'H'], [null, null, null]], funFact: 'Se usa en el tratamiento de aguas.' },
    { name: 'Pentahielo de Nitrógeno', formula: 'N₂O₅', grade: 2, description: 'Óxido de nitrógeno (V).', pattern: [['O', 'N', 'O'], [null, 'O', null], ['O', 'N', 'O']], funFact: 'Es un potente agente nitrante.' },

    // 3º ESO (+10 moléculas = 40)
    { name: 'Metano', formula: 'CH₄', grade: 3, description: 'Gas natural.', pattern: [[null, 'H', null], ['H', 'C', 'H'], [null, 'H', null]], funFact: 'Es un potente gas de efecto invernadero.' },
    { name: 'Dióxido de Silicio', formula: 'SiO₂', grade: 3, description: 'Arena y cuarzo.', pattern: [['O', 'Si', 'O'], [null, null, null], [null, null, null]], funFact: 'Es el material base para fabricar vidrio.' },
    { name: 'Peróxido de Hidrógeno', formula: 'H₂O₂', grade: 3, description: 'Agua oxigenada.', pattern: [['H', 'O', null], [null, 'O', 'H'], [null, null, null]], funFact: 'Su burbujeo en heridas es liberación de oxígeno.' },
    { name: 'Sulfuro de Hidrógeno', formula: 'H₂S', grade: 3, description: 'Huele a huevos podridos.', pattern: [['H', 'S', 'H'], [null, null, null], [null, null, null]], funFact: 'Es un gas muy tóxico e inflamable.' },
    { name: 'Etano', formula: 'C₂H₆', grade: 3, description: 'Gas de dos carbonos.', pattern: [['H', 'C', 'H'], ['H', 'C', 'H'], ['H', null, 'H']], funFact: 'Segundo componente más común del gas natural.' },
    { name: 'Propano', formula: 'C₃H₈', grade: 3, description: 'Gas para calefacción.', pattern: [['H', 'C', 'H'], ['H', 'C', 'H'], ['H', 'C', 'H']], funFact: 'Se almacena líquido a alta presión.' },
    { name: 'Ácido Sulfúrico', formula: 'H₂SO₄', grade: 3, description: 'Ácido de batería.', pattern: [['O', 'S', 'O'], ['O', 'H', 'O'], [null, 'H', null]], funFact: 'Es el producto químico más producido en el mundo.' },
    { name: 'Bicarbonato de Sodio', formula: 'NaHCO₃', grade: 3, description: 'Para repostería.', pattern: [['Na', 'O', 'C'], ['O', null, 'O'], [null, 'H', null]], funFact: 'Ayuda a que los bizcochos suban al hornear.' },
    { name: 'Etanol', formula: 'C₂H₅OH', grade: 3, description: 'Alcohol común.', pattern: [['C', 'C', 'O'], ['H', 'H', 'H'], ['H', 'H', 'H']], funFact: 'Se obtiene por fermentación de azúcares.' },
    { name: 'Acetona', formula: 'CH₃COCH₃', grade: 3, description: 'Disolvente de uñas.', pattern: [['C', 'C', 'C'], ['H', 'O', 'H'], ['H', 'H', 'H']], funFact: 'Es un disolvente orgánico muy eficaz.' },

    // 4º ESO (+10 moléculas = 50)
    { name: 'Sulfato de Cobre', formula: 'CuSO₄', grade: 4, description: 'Cristales azules.', pattern: [['O', 'Cu', 'O'], [null, 'S', null], ['O', null, 'O']], funFact: 'Se usa como fungicida.' },
    { name: 'Glucosa', formula: 'C₆H₁₂O₆ (Simp.)', grade: 4, description: 'Energía celular.', pattern: [['C', 'C', 'C'], ['H', 'O', 'H'], ['H', 'O', 'H']], funFact: 'Es producida en la fotosíntesis.' },
    { name: 'Ácido Fosfórico', formula: 'H₃PO₄', grade: 4, description: 'En bebidas de cola.', pattern: [['H', 'O', 'P'], ['O', 'H', 'O'], [null, 'O', 'H']], funFact: 'Se usa para dar sabor ácido a los refrescos.' },
    { name: 'Permanganato de Potasio', formula: 'KMnO₄', grade: 4, description: 'Oxidante púrpura.', pattern: [['K', 'O', 'Mn'], ['O', null, 'O'], [null, 'O', null]], funFact: 'Tiñe la piel de marrón al contacto.' },
    { name: 'Glicerina', formula: 'C₃H₈O₃', grade: 4, description: 'Líquido viscoso dulce.', pattern: [['C', 'C', 'C'], ['O', 'O', 'O'], ['H', 'H', 'H']], funFact: 'Se usa en cosmética y para fabricar dinamita.' },
    { name: 'Ácido Acético', formula: 'CH₃COOH', grade: 4, description: 'Ácido del vinagre.', pattern: [['C', 'C', 'O'], ['H', 'H', 'O'], ['H', 'H', 'H']], funFact: 'Le da al vinagre su olor y sabor agrio.' },
    { name: 'Benceno', formula: 'C₆H₆ (Simp.)', grade: 4, description: 'Anillo aromático.', pattern: [['C', 'C', 'C'], ['C', 'C', 'C'], ['H', 'H', 'H']], funFact: 'Es el hidrocarburo aromático más sencillo.' },
    { name: 'Clorato de Potasio', formula: 'KClO₃', grade: 4, description: 'Para cerillas y fuegos.', pattern: [['K', 'O', 'Cl'], ['O', null, 'O'], [null, null, null]], funFact: 'Es un potente comburente.' },
    { name: 'Nitrato de Plata', formula: 'AgNO₃', grade: 4, description: 'Piedra infernal.', pattern: [['Ag', 'O', 'N'], ['O', null, 'O'], [null, null, null]], funFact: 'Deja manchas negras en la piel que tardan en irse.' },
    { name: 'Dicromato de Potasio', formula: 'K₂Cr₂O₇', grade: 4, description: 'Cristales naranjas.', pattern: [['K', 'O', 'Cr'], ['O', 'O', 'O'], ['Cr', 'O', 'K']], funFact: 'Es un oxidante fuerte usado en laboratorios.' }
];
