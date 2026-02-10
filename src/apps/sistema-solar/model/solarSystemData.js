import sunTexture from '../textures/2k_sun.jpg';
import mercuryTexture from '../textures/2k_mercury.jpg';
import venusTexture from '../textures/2k_venus_atmosphere.jpg';
import earthTexture from '../textures/2k_earth_daymap.jpg';
import earthCloudsTexture from '../textures/2k_earth_clouds.jpg';
import marsTexture from '../textures/2k_mars.jpg';
import jupiterTexture from '../textures/2k_jupiter.jpg';
import saturnTexture from '../textures/2k_saturn.jpg';
import uranusTexture from '../textures/2k_uranus.jpg';
import neptuneTexture from '../textures/2k_neptune.jpg';
import saturnRingTexture from '../textures/2k_saturn_ring_alpha.png';
import moonTexture from '../textures/2k_moon.jpg';

export const solarSystemData = [
    {
        id: 'sun',
        name: 'Sol',
        type: 'star',
        color: '#FDB813',
        emissive: '#FDB813',
        emissiveIntensity: 0.8, // Reduced intensity to show texture better
        size: 8, // Mucho más grande
        distance: 0,
        speed: 0,
        textureUrl: sunTexture,
        description: {
            primaryBasic: "Es la estrella que nos da luz y calor. ¡Es gigante!",
            primaryAdvanced: "El Sol es una estrella enorme de gas caliente. Es el centro de nuestro sistema solar y su gravedad mantiene a todos los planetas girando a su alrededor.",
            secondary: "El Sol es una estrella de tipo G (enana amarilla) que constituye el 99.86% de la masa del sistema solar. Su energía proviene de la fusión nuclear de hidrógeno en helio en su núcleo, alcanzando temperaturas de 15 millones de grados Celsius.",
        },
        advanced: {
            composition: {
                elements: ["Hidrógeno (73.46%)", "Helio (24.85%)", "Oxígeno (0.77%)", "Carbono (0.29%)"],
                compounds: ["Plasma (Gas ionizado)", "Vientos solares (Protones y electrones)"]
            },
            geography: "No tiene superficie sólida. Se divide en núcleo, zona radiativa, zona convectiva, fotosfera, cromosfera y corona.",
            curiosities: [
                "El Sol pierde 4 millones de toneladas de masa cada segundo convertidas en energía.",
                "Tardaría 170.000 años para que un fotón viaje desde el núcleo hasta la superficie.",
                "Cabe un millón de Tierras dentro del Sol."
            ],
            hotspots: [
                { pos: [0, 8.5, 0], title: "Corona Solar", desc: "La capa más externa, que curiosamente es mucho más caliente que la superficie.", zoom: 1.2, tilt: 0.8 },
                { pos: [4, 1, 5], title: "Manchas Solares", desc: "Regiones con temperaturas más bajas debido a la intensa actividad magnética.", zoom: 0.7, tilt: 0.2 },
                { pos: [-6, 3, -4], title: "Prominencias", desc: "Bucle gigante de gas ionizado que sale de la fotosfera hacia la corona.", zoom: 0.9, tilt: -0.3 },
                { pos: [0, 0, 8], title: "Núcleo", desc: "Donde ocurre la fusión nuclear que nos envía luz y calor.", zoom: 1.5, tilt: 0.5 }
            ]
        }
    },
    {
        id: 'mercury',
        name: 'Mercurio',
        type: 'planet',
        color: '#A5A5A5',
        size: 0.38,
        distance: 12,
        speed: 0.04,
        textureUrl: mercuryTexture,
        description: {
            primaryBasic: "Es el planeta más pequeño y el más cercano al Sol.",
            primaryAdvanced: "Mercurio es un planeta rocoso lleno de cráteres, parecido a nuestra Luna. Hace mucho calor de día y mucho frío de noche.",
            secondary: "Mercurio es el planeta más pequeño y cercano al Sol. Carece de atmósfera significativa para retener el calor, provocando variaciones extremas de temperatura (-180°C a 430°C). Su superficie está marcada por cráteres de impacto.",
        },
        advanced: {
            composition: {
                elements: ["Hierro (Núcleo 70%)", "Silicio", "Magnesio", "Calcio"],
                compounds: ["Silicatos (Corteza y manto)", "Oxígeno metálico"]
            },
            geography: "Superficie similar a la Luna con llanuras lisas y grandes escarpes (fallas tectónicas) que sugieren que el planeta se está 'encogiendo'.",
            curiosities: [
                "Un día en Mercurio dura 59 días terrestres.",
                "Es el único planeta cuyo núcleo es proporcionalmente más grande que la Tierra.",
                "A pesar de estar cerca del Sol, posee hielo en sus polos norte y sur."
            ],
            // Radio 0.38
            hotspots: [
                { pos: [0, 0.38, 0], title: "Polo Norte", desc: "Se ha detectado hielo de agua en cráteres que están siempre a la sombra.", zoom: 0.6, tilt: 1.2 }, // Polo
                { pos: [0.35, 0.15, 0], title: "Cuenca Caloris", desc: "Uno de los cráteres de impacto más grandes del Sistema Solar.", zoom: 0.5, tilt: 0.3 }, // Lat 30
                { pos: [-0.3, -0.1, 0.2], title: "Escarpes", desc: "Grandes grietas que demuestran que el planeta se enfrió y encogió.", zoom: 0.8, tilt: -0.2 }, // Ecuador aprox
                { pos: [0, 0, 0.45], title: "Exosfera", desc: "Su atmósfera es tan delgada que los átomos escapan al espacio.", zoom: 1.2, tilt: 0.1 } // Un poco fuera
            ]
        }
    },
    {
        id: 'venus',
        name: 'Venus',
        type: 'planet',
        color: '#E3BB76',
        size: 0.95,
        distance: 16,
        speed: 0.015,
        textureUrl: venusTexture,
        description: {
            primaryBasic: "Es el planeta más brillante y caluroso del cielo.",
            primaryAdvanced: "Aunque no es el más cercano al Sol, es el más caliente porque tiene muchas nubes que atrapan el calor. Brilla mucho al amanecer o atardecer.",
            secondary: "Venus tiene una atmósfera densa de dióxido de carbono que provoca un efecto invernadero descontrolado, elevando su temperatura a 465°C. Rota en sentido contrario a la mayoría de los planetas (rotación retrógrada).",
        },
        advanced: {
            composition: {
                elements: ["Dióxido de Carbono (96.5%)", "Nitrógeno (3.5%)"],
                compounds: ["Ácido Sulfúrico (Nubes)", "Dióxido de azufre", "Argón"]
            },
            geography: "Superficie dominada por llanuras volcánicas, dos grandes continentes (Ishtar Terra y Aphrodite Terra) y miles de volcanes.",
            curiosities: [
                "Un día en Venus es más largo que su año.",
                "La presión atmosférica es 90 veces superior a la de la Tierra.",
                "Es el objeto más brillante en el cielo nocturno después de la Luna."
            ],
            // Radio 0.95
            hotspots: [
                { pos: [0, 1.05, 0], title: "Nubes de Ácido", desc: "Capas densas que reflejan la luz y atrapan el calor infernal.", zoom: 1.3, tilt: 0.8 },
                { pos: [0.4, 0.1, 0.85], title: "Maat Mons", desc: "El volcán más alto de Venus con 8 km de altura.", zoom: 0.6, tilt: 0.4 }, // Ecuador
                { pos: [-0.8, -0.2, -0.4], title: "Llanuras de Lava", desc: "El 80% de la superficie está cubierta por rocas volcánicas lisas.", zoom: 0.9, tilt: -0.4 },
                { pos: [0.95, 0, 0], title: "Efecto Invernadero", desc: "Su atmósfera de CO2 atrapa el calor de forma descontrolada.", zoom: 1.1, tilt: 0.1 }
            ]
        }
    },
    {
        id: 'earth',
        name: 'Tierra',
        type: 'planet',
        color: '#22A6B3',
        size: 1,
        distance: 21,
        speed: 0.01,
        textureUrl: earthTexture,
        cloudTextureUrl: earthCloudsTexture,
        description: {
            primaryBasic: "¡Es nuestro hogar! El único lugar donde sabemos que hay vida.",
            primaryAdvanced: "La Tierra es el 'planeta azul'. Tiene mucha agua líquida y una capa de aire que nos protege y nos permite respirar.",
            secondary: "La Tierra es el único planeta conocido con vida. Su atmósfera rica en nitrógeno y oxígeno, junto con su campo magnético, protege la superficie de la radiación solar. El 71% de su superficie está cubierta de agua.",
        },
        moons: [
            {
                id: 'moon',
                name: 'Luna',
                size: 0.27, // AJUSTE: Tamaño más realista relativo a Tierra (1.0 vs 0.27)
                distance: 3, // Distancia visual
                speed: 0.03,
                textureUrl: moonTexture,
                color: '#DDDDDD',
                description: {
                    primaryBasic: "Es nuestro satélite natural y gira alrededor de la Tierra.",
                    primaryAdvanced: "La Luna es el único satélite natural de la Tierra. No tiene luz propia, refleja la del Sol. Causa las mareas en nuestros océanos.",
                    secondary: "La Luna es el satélite natural de la Tierra. Su influencia gravitatoria produce las mareas y estabiliza la inclinación del eje terrestre. Es el quinto satélite más grande del sistema solar.",
                },
                advanced: {
                    composition: {
                        elements: ["Oxígeno (43%)", "Silicio (21%)", "Magnesio", "Hierro"],
                        compounds: ["Silicatos", "Óxidos de aluminio", "Regolito"]
                    },
                    geography: "Tierras altas (cráteres) y mares (llanuras de basalto volcánico). Tiene montañas más altas que el Everest.",
                    curiosities: [
                        "La Luna se aleja de la Tierra unos 3.8 cm por año.",
                        "Solo vemos una cara de la Luna debido a la rotación sincrónica.",
                        "Tiene terremotos o 'lunamotos' menores."
                    ],
                    // Radio 0.27
                    hotspots: [
                        { pos: [0.1, 0.05, 0.25], title: "Mar de la Tranquilidad", desc: "Donde aterrizó el Apolo 11 en 1969.", zoom: 0.4, tilt: 0.6 },
                        { pos: [0.05, -0.2, 0.15], title: "Cráter Tycho", desc: "Uno de los cráteres más brillantes y visibles.", zoom: 0.5, tilt: 0.3 }, // Hemisferio Sur visible
                        { pos: [-0.27, 0, 0], title: "Cara Oculta", desc: "Mucho más accidentada y con pocos 'mares' de lava.", zoom: 0.6, tilt: -0.2 }, // Lado opuesto
                        { pos: [0, -0.27, 0], title: "Regolito", desc: "Polvo fino que cubre toda la superficie lunar.", zoom: 0.6, tilt: -0.5 }
                    ]
                }
            }
        ],
        advanced: {
            composition: {
                elements: ["Nitrógeno (78%)", "Oxígeno (21%)", "Hierro (Núcleo)"],
                compounds: ["Agua (H2O)", "Dióxido de Carbono", "Cloruro de sodio (Sal)"]
            },
            geography: "Montañas, océanos, llanuras, mesetas. Siete continentes y cinco océanos principales.",
            curiosities: [
                "Es el planeta más denso del sistema solar.",
                "La mayoría de la Tierra es hierro, oxígeno y silicio.",
                "Es el único planeta con placas tectónicas activas."
            ],
            // Radio 1.0
            hotspots: [
                { pos: [0.95, 0.3, 0], title: "Atmósfera", desc: "Protege de la radiación y mantiene la temperatura.", zoom: 1.2, tilt: 1.0 },
                { pos: [-0.5, 0, 0.86], title: "Océano Pacífico", desc: "Cubre gran parte del planeta y regula el clima.", zoom: 0.6, tilt: -0.2 }, // Zona agua
                { pos: [0.75, 0.45, 0.45], title: "Himalaya", desc: "La cordillera más alta creada por placas tectónicas.", zoom: 0.5, tilt: 0.5 }, // Asia aprox
                { pos: [0.1, 0.1, 1.1], title: "Campo Magnético", desc: "Generado por el núcleo, invisible pero vital.", zoom: 1.5, tilt: -0.8 } // Punto alejado
            ]
        }
    },
    {
        id: 'mars',
        name: 'Marte',
        type: 'planet',
        color: '#EB4D4B',
        size: 0.53,
        distance: 27,
        speed: 0.008,
        textureUrl: marsTexture,
        description: {
            primaryBasic: "El 'Planeta Rojo'. Tiene volcanes gigantes.",
            primaryAdvanced: "Marte es rojo por el óxido (como el hierro oxidado). Tiene el volcán más grande de todo el sistema solar, el Monte Olimpo.",
            secondary: "Marte es un planeta desértico y frío. Su color rojo se debe al óxido de hierro. Alberga el Monte Olimpo, el volcán más grande del sistema solar, y valles que sugieren que el agua fluyó por su superficie en el pasado.",
        },
        advanced: {
            composition: {
                elements: ["Hierro", "Magnesio", "Aluminio", "Calcio", "Potasio"],
                compounds: ["Óxido de hierro (Rojizo)", "Dióxido de carbono (Hielo seco)"]
            },
            geography: "Cañones gigantes (Valles Marineris), volcanes extintos y casquetes polares de hielo y CO2.",
            curiosities: [
                "Tardaría un año en Marte casi el doble que en la Tierra.",
                "Posee dos lunas pequeñas llamadas Fobos y Deimos.",
                "La gravedad en Marte es el 38% de la terrestre."
            ],
            // Radio 0.53
            hotspots: [
                { pos: [-0.3, 0.15, 0.4], title: "Monte Olimpo", desc: "El volcán más grande del sistema solar (21 km de alto).", zoom: 0.4, tilt: 0.9 }, // 18N
                { pos: [0.1, -0.1, 0.5], title: "Valles Marineris", desc: "Un sistema de cañones tan largo como toda Europa.", zoom: 0.5, tilt: 0.1 }, // 14S
                { pos: [0, 0.53, 0], title: "Casquete Polar", desc: "Mezcla de hielo de agua y hielo seco (dióxido de carbono).", zoom: 0.6, tilt: 1.2 }, // Polo N
                { pos: [0.4, 0.15, 0.3], title: "Crater Jezero", desc: "Donde el rover Perseverance busca rastros de vida antigua.", zoom: 0.4, tilt: 0.4 } // 18N
            ]
        }
    },
    {
        id: 'jupiter',
        name: 'Júpiter',
        type: 'planet',
        color: '#F9CA24',
        size: 3.8,
        distance: 40,
        speed: 0.004,
        textureUrl: jupiterTexture,
        description: {
            primaryBasic: "Es el planeta más grande de todos. ¡Es gigante!",
            primaryAdvanced: "Júpiter es una bola gigante de gas. Tiene una tormenta roja enorme que lleva girando siglos, llamada la Gran Mancha Roja.",
            secondary: "Júpiter es un gigante gaseoso, el planeta más grande del sistema solar (más de 300 veces la masa de la Tierra). Su Gran Mancha Roja es una tormenta anticiclónica más grande que la Tierra. Tiene docenas de lunas, como Europa y Ganímedes.",
        },
        advanced: {
            composition: {
                elements: ["Hidrógeno (89%)", "Helio (10%)"],
                compounds: ["Metano", "Amoníaco", "Metano cristalino"]
            },
            geography: "No tiene superficie sólida; las nubes crean franjas y remolinos. En el interior hay hidrógeno metálico líquido.",
            curiosities: [
                "Tiene un campo magnético 14 veces más fuerte que el de la Tierra.",
                "Gira tan rápido que un día dura solo 10 horas.",
                "Tiene 95 lunas reconocidas hasta la fecha."
            ],
            // Radio 3.8
            hotspots: [
                { pos: [1.5, -1.2, 3.2], title: "Gran Mancha Roja", desc: "Una tormenta gigante donde caben dos Tierras.", zoom: 0.5, tilt: -0.2 }, // Lat -22 aprox
                { pos: [0, 3.8, 0], title: "Auroras Polares", desc: "Intensa radiación que crea luces brillantes en los polos.", zoom: 0.8, tilt: 1.2 }, // Polo
                { pos: [-3.5, 0.5, 1], title: "Bandas de Nubes", desc: "Vientos de 600 km/h que crean las franjas de colores.", zoom: 1.0, tilt: 0.2 }, // Ecuador
                { pos: [0, 0, 4.0], title: "Hidrógeno Metálico", desc: "Bajo la presión extrema, el hidrógeno se vuelve conductor.", zoom: 1.5, tilt: 0 } // Frente
            ]
        }
    },
    {
        id: 'saturn',
        name: 'Saturno',
        type: 'planet',
        color: '#F0932B',
        size: 3.2,
        distance: 55,
        speed: 0.003,
        hasRings: true,
        textureUrl: saturnTexture,
        ringTextureUrl: saturnRingTexture,
        ringInnerRadius: 4.2,
        ringOuterRadius: 7.5,
        description: {
            primaryBasic: "Es famoso por sus preciosos anillos.",
            primaryAdvanced: "Saturno es otro gigante de gas, pero tiene unos anillos brillantes hechos de hielo y rocas que giran a su alrededor.",
            secondary: "Saturno es conocido por su complejo sistema de anillos compuestos principalmente de partículas de hielo y roca. Es el planeta menos denso; flotaría en el agua. Titán, su luna más grande, tiene una atmósfera densa.",
        },
        advanced: {
            composition: {
                elements: ["Hidrógeno (96%)", "Helio (3%)"],
                compounds: ["Etano", "Metano", "Metano gaseoso"]
            },
            geography: "Similar a Júpiter, con atmósfera de hidrógeno-helio y posibles nubes de amoníaco e hidrosulfuro amónico.",
            curiosities: [
                "Sus anillos son tan finos que podrías ver a través de ellos.",
                "Tarda unos 29.5 años terrestres en rodear el Sol.",
                "La luna Titán tiene mares de metano líquido."
            ],
            // Radio 3.2
            hotspots: [
                { pos: [0, 3.1, 0.5], title: "Vórtice Hexagonal", desc: "Una extraña corriente de aire con forma de hexágono en el polo norte.", zoom: 0.5, tilt: 1.3 }, // Polo N visible
                { pos: [1.5, 0.5, 2.7], title: "Atmósfera Dorada", desc: "Nubes de amoníaco que le dan su característico color pálido.", zoom: 0.7, tilt: 0.2 },
                { pos: [6.5, 0, 0], title: "Anillo A", desc: "La sección más externa y brillante de los anillos principales.", zoom: 1.2, tilt: 0.5 }, // En el anillo (radio > 4.2)
                { pos: [-4.5, 0, 2], title: "División de Cassini", desc: "Espacio aparentemente vacío entre los dos anillos más brillantes.", zoom: 1.1, tilt: 0.4 } // En el anillo
            ]
        }
    },
    {
        id: 'uranus',
        name: 'Urano',
        type: 'planet',
        color: '#7ED6DF',
        size: 1.8,
        distance: 70,
        speed: 0.002,
        textureUrl: uranusTexture,
        description: {
            primaryBasic: "Es un gigante de hielo de color azul clarito.",
            primaryAdvanced: "Urano es muy frío y gira 'tumbado' sobre un lado. Su color azul viene de un gas llamado metano.",
            secondary: "Urano es un gigante de hielo. Su atmósfera contiene hidrógeno, helio y metano, lo que le da su color cian. Su característica más única es que su eje de rotación está inclinado casi 98 grados, orbitando 'de lado'.",
        },
        advanced: {
            composition: {
                elements: ["Hidrógeno (83%)", "Helio (15%)", "Metano (2%)"],
                compounds: ["Hielo de agua", "Amoníaco", "Metano sólido"]
            },
            geography: "Núcleo de roca y hielo rodeado por un manto de hielo fluido y una densa atmósfera.",
            curiosities: [
                "Es el planeta más frío del sistema solar con -224°C.",
                "Tiene anillos verticales debido a su inclinación extrema.",
                "Su día dura 17 horas, pero su año 84 años terrestres."
            ],
            // Radio 1.8
            hotspots: [
                { pos: [0, 0, 1.8], title: "Polo Sur Iluminado", desc: "Debido a su inclinación, los polos reciben luz directa durante años.", zoom: 0.6, tilt: 0.0 }, // Apunta a Z
                { pos: [0, 2.5, 0], title: "Anillos Verticales", desc: "Al estar tumbado, sus anillos parecen rodearlo de arriba a abajo.", zoom: 1.2, tilt: 1.5 }, // Arriba visualmente
                { pos: [-1.8, 0, 0], title: "Manto de Hielo", desc: "Fluido denso y caliente de 'hielo' de agua y amoníaco.", zoom: 0.8, tilt: -0.4 },
                { pos: [1.2, 1, 0.8], title: "Metano Atmosférico", desc: "Absorbe la luz roja y refleja el azul verdoso intenso.", zoom: 0.7, tilt: 0.6 }
            ]
        }
    },
    {
        id: 'neptune',
        name: 'Neptuno',
        type: 'planet',
        color: '#4834D4',
        size: 1.75,
        distance: 85,
        speed: 0.001,
        textureUrl: neptuneTexture,
        description: {
            primaryBasic: "Es el planeta más lejano y ventoso.",
            primaryAdvanced: "Es oscuro, frío y ventoso. Está tan lejos que tarda casi 165 años en dar una vuelta al Sol.",
            secondary: "Neptuno es el planeta más lejano del Sol (ahora que Plutón es planeta enano). Tiene los vientos más fuertes del sistema solar (2.100 km/h). Su intenso color azul se debe al metano en su atmósfera.",
        },
        advanced: {
            composition: {
                elements: ["Hidrógeno (80%)", "Helio (19%)", "Metano (1.5%)"],
                compounds: ["Hielo", "Silicatos", "Amoníaco fundido"]
            },
            geography: "Dinámica atmosférica extrema con tormentas gigantescas (Gran Mancha Oscura) y un manto líquido de alta presión.",
            curiosities: [
                "Fue descubierto mediante cálculos matemáticos antes de verse.",
                "Tritón, su luna más grande, es el único satélite que orbita al revés.",
                "Se cree que puede llover diamantes en su interior."
            ],
            // Radio 1.75
            hotspots: [
                { pos: [0.8, -0.6, 1.4], title: "Gran Mancha Oscura", desc: "Una tormenta del tamaño de la Tierra que desaparece y vuelve.", zoom: 0.6, tilt: -0.3 }, // Lat -20 aprox
                { pos: [-1.2, 0.8, -0.9], title: "Vientos Supersónicos", desc: "Los más rápidos del sistema solar, superando los 2.000 km/h.", zoom: 0.8, tilt: 0.4 },
                { pos: [0, 1.75, 0], title: "Polo Norte", desc: "Región polar cubierta de nubes de metano.", zoom: 0.7, tilt: 1.2 },
                { pos: [0.5, -0.5, 1.6], title: "Lluvia de Diamantes", desc: "La presión extrema podría cristalizar el carbono en diamantes.", zoom: 1.2, tilt: -0.5 }
            ]
        }
    }
];
