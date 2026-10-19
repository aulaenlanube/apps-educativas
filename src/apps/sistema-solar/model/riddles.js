// src/apps/sistema-solar/model/riddles.js
// Pistas de «¿Qué planeta soy?»: de la más vaga (1) a la más reveladora (3).
// basic → Primaria; adv → ESO y Bachillerato (con datos).

export const RIDDLES = {
  sun: {
    basic: ['No soy un planeta: ¡soy una estrella!', 'Doy luz y calor a todos los planetas.', 'Estoy en el centro del Sistema Solar.'],
    adv: [
      'Reúno el 99,86 % de toda la masa del Sistema Solar.',
      'En mi núcleo se fusiona hidrógeno en helio a unos 15 millones de grados.',
      'Soy una enana amarilla de tipo G con unos 4.600 millones de años: la estrella más cercana a la Tierra.',
    ],
  },
  mercury: {
    basic: ['Soy el planeta más pequeño.', 'Estoy lleno de cráteres, como la Luna.', 'Soy el planeta más cercano al Sol.'],
    adv: [
      'Casi no tengo atmósfera: de día alcanzo 427 °C y de noche bajo a −173 °C.',
      'Mi año dura solo 88 días terrestres: soy el que orbita más rápido (47 km/s).',
      'Soy el primer planeta desde el Sol y el más pequeño de los ocho.',
    ],
  },
  venus: {
    basic: ['Soy el planeta más caliente, aunque no el más cercano al Sol.', 'Mis nubes, muy espesas, atrapan el calor.', 'Brillo mucho al amanecer o al atardecer: me llaman «lucero».'],
    adv: [
      'Giro al revés que casi todos los planetas: mi rotación es retrógrada.',
      'Tardo 243 días terrestres en girar sobre mí mismo, más que en dar la vuelta al Sol (225 días).',
      'Mi atmósfera de CO₂ tiene 92 veces la presión terrestre y en mi suelo hay 464 °C.',
    ],
  },
  earth: {
    basic: ['Tengo mucha agua líquida en mi superficie.', 'Tengo un único satélite natural.', 'Soy el único planeta donde sabemos que hay vida.'],
    adv: [
      'Soy el planeta más denso del Sistema Solar: 5,51 g/cm³.',
      'El 21 % de mi atmósfera es oxígeno y tengo placas tectónicas activas.',
      'Estoy a 1 UA del Sol: su luz tarda unos 8 minutos en llegarme.',
    ],
  },
  moon: {
    basic: ['No tengo luz propia: reflejo la del Sol.', 'Cada noche me ves con una forma distinta: tengo fases.', 'Soy el satélite natural de la Tierra.'],
    adv: [
      'Siempre muestro la misma cara a mi planeta (rotación síncrona).',
      'Mi gravedad es una sexta parte de la terrestre.',
      'En 1969 el Apolo 11 llevó a las primeras personas a mi superficie.',
    ],
  },
  mars: {
    basic: ['Soy de color rojizo.', 'Tengo dos lunas pequeñas: Fobos y Deimos.', 'Me llaman «el planeta rojo».'],
    adv: [
      'Mi día dura casi lo mismo que el terrestre: 24 h 37 min.',
      'Tengo el volcán más alto del Sistema Solar, el Monte Olimpo (unos 22 km).',
      'Soy el cuarto planeta; mi gravedad es el 38 % de la terrestre y varios rovers recorren mi suelo.',
    ],
  },
  jupiter: {
    basic: ['Soy un gigante hecho sobre todo de gas.', 'Tengo una tormenta enorme: la Gran Mancha Roja.', 'Soy el planeta más grande de todos.'],
    adv: [
      'Tengo 2,5 veces más masa que todos los demás planetas juntos.',
      'Mi día dura menos de 10 horas: soy el planeta que gira más rápido.',
      'Galileo descubrió en 1610 mis cuatro grandes lunas: Ío, Europa, Ganímedes y Calisto.',
    ],
  },
  saturn: {
    basic: ['Soy un gigante de gas de color dorado.', 'Tengo muchísimas lunas; la mayor se llama Titán.', 'Tengo los anillos más grandes y brillantes.'],
    adv: [
      'Mi densidad media (0,69 g/cm³) es menor que la del agua.',
      'En mi polo norte hay una corriente de nubes con forma de hexágono.',
      'Mis anillos de hielo miden más de 270.000 km de lado a lado, pero casi nunca más de 1 km de grosor.',
    ],
  },
  uranus: {
    basic: ['Soy un gigante helado de color azul verdoso.', 'Soy muy, muy frío.', 'Giro tumbado de lado, como una pelota que rueda.'],
    adv: [
      'El metano de mi atmósfera absorbe la luz roja: por eso me ves de color cian.',
      'Mi eje está inclinado 98°: cada polo pasa unos 42 años de día y 42 de noche.',
      'Fui el primer planeta descubierto con telescopio (William Herschel, 1781).',
    ],
  },
  neptune: {
    basic: ['Soy un gigante helado de color azul intenso.', 'En mí soplan los vientos más fuertes.', 'Soy el planeta más lejano del Sol.'],
    adv: [
      'Mis vientos superan los 2.000 km/h.',
      'Me descubrieron gracias a cálculos matemáticos (Le Verrier y Galle, 1846).',
      'Tardo unos 165 años en dar la vuelta al Sol; Tritón, mi luna mayor, orbita al revés.',
    ],
  },
};
