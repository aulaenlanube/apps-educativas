import sunTexture from '../textures/2k_sun.jpg';
import mercuryTexture from '../textures/2k_mercury.jpg';
import venusTexture from '../textures/2k_venus_atmosphere.jpg';
import earthTexture from '../textures/2k_earth_daymap.jpg';
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
        emissiveIntensity: 2,
        size: 8, // Mucho más grande
        distance: 0,
        speed: 0,
        textureUrl: sunTexture,
        description: {
            primaryBasic: "Es la estrella que nos da luz y calor. ¡Es gigante!",
            primaryAdvanced: "El Sol es una estrella enorme de gas caliente. Es el centro de nuestro sistema solar y su gravedad mantiene a todos los planetas girando a su alrededor.",
            secondary: "El Sol es una estrella de tipo G (enana amarilla) que constituye el 99.86% de la masa del sistema solar. Su energía proviene de la fusión nuclear de hidrógeno en helio en su núcleo, alcanzando temperaturas de 15 millones de grados Celsius.",
        }
    },
    {
        id: 'mercury',
        name: 'Mercurio',
        type: 'planet',
        color: '#A5A5A5',
        size: 0.38,
        distance: 12, // Más alejado del sol para que quepa su tamaño
        speed: 0.04,
        textureUrl: mercuryTexture,
        description: {
            primaryBasic: "Es el planeta más pequeño y el más cercano al Sol.",
            primaryAdvanced: "Mercurio es un planeta rocoso lleno de cráteres, parecido a nuestra Luna. Hace mucho calor de día y mucho frío de noche.",
            secondary: "Mercurio es el planeta más pequeño y cercano al Sol. Carece de atmósfera significativa para retener el calor, provocando variaciones extremas de temperatura (-180°C a 430°C). Su superficie está marcada por cráteres de impacto.",
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
        description: {
            primaryBasic: "¡Es nuestro hogar! El único lugar donde sabemos que hay vida.",
            primaryAdvanced: "La Tierra es el 'planeta azul'. Tiene mucha agua líquida y una capa de aire que nos protege y nos permite respirar.",
            secondary: "La Tierra es el único planeta conocido con vida. Su atmósfera rica en nitrógeno y oxígeno, junto con su campo magnético, protege la superficie de la radiación solar. El 71% de su superficie está cubierta de agua.",
        },
        moons: [
            {
                id: 'moon',
                name: 'Luna',
                size: 0.8, // Mucho más grande relativo
                distance: 4.5, // Un poco más lejos
                speed: 0.03, // Velocidad orbital ajustada
                textureUrl: moonTexture,
                color: '#DDDDDD',
                description: {
                    primaryBasic: "Es nuestro satélite natural y gira alrededor de la Tierra.",
                    primaryAdvanced: "La Luna es el único satélite natural de la Tierra. No tiene luz propia, refleja la del Sol. Causa las mareas en nuestros océanos.",
                    secondary: "La Luna es el satélite natural de la Tierra. Su influencia gravitatoria produce las mareas y estabiliza la inclinación del eje terrestre. Es el quinto satélite más grande del sistema solar.",
                }
            }
        ]
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
        }
    },
    {
        id: 'jupiter',
        name: 'Júpiter',
        type: 'planet',
        color: '#F9CA24',
        size: 3.8, // Significativamente más grande
        distance: 40, // Gran salto en distancia (cinturón asteroides implícito)
        speed: 0.004,
        textureUrl: jupiterTexture,
        description: {
            primaryBasic: "Es el planeta más grande de todos. ¡Es gigante!",
            primaryAdvanced: "Júpiter es una bola gigante de gas. Tiene una tormenta roja enorme que lleva girando siglos, llamada la Gran Mancha Roja.",
            secondary: "Júpiter es un gigante gaseoso, el planeta más grande del sistema solar (más de 300 veces la masa de la Tierra). Su Gran Mancha Roja es una tormenta anticiclónica más grande que la Tierra. Tiene docenas de lunas, como Europa y Ganímedes.",
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
        }
    }
];
