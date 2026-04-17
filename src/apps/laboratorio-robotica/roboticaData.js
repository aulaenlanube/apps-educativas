// Plantillas de componentes electrónicos
// Cada componente: w/h (tamaño en px), icon, label, color, pins.
// Pines: {id, x, y} coordenadas relativas al origen del componente.
export const COMPONENT_TEMPLATES = {
  battery: {
    w: 110, h: 70, icon: '🔋', label: 'Pila 9V', color: '#fbbf24',
    pins: [
      { id: '+', x: 110, y: 22, label: '+' },
      { id: '-', x: 110, y: 48, label: '−' },
    ],
  },
  led: {
    w: 80, h: 80, icon: '💡', label: 'LED', color: '#ef4444',
    pins: [
      { id: '+', x: 0, y: 40, label: 'A' },
      { id: '-', x: 80, y: 40, label: 'K' },
    ],
  },
  led2: {
    w: 80, h: 80, icon: '💡', label: 'LED', color: '#22c55e',
    pins: [
      { id: '+', x: 0, y: 40, label: 'A' },
      { id: '-', x: 80, y: 40, label: 'K' },
    ],
  },
  switch: {
    w: 90, h: 60, icon: '🎛️', label: 'Interruptor', color: '#0ea5e9',
    pins: [
      { id: 'a', x: 0, y: 30, label: 'a' },
      { id: 'b', x: 90, y: 30, label: 'b' },
    ],
  },
  button: {
    w: 80, h: 70, icon: '⏺️', label: 'Pulsador', color: '#8b5cf6',
    pins: [
      { id: 'a', x: 0, y: 35, label: 'a' },
      { id: 'b', x: 80, y: 35, label: 'b' },
    ],
  },
  resistor: {
    w: 110, h: 50, icon: '〰️', label: 'Resistencia 220Ω', color: '#a16207',
    pins: [
      { id: 'a', x: 0, y: 25, label: 'a' },
      { id: 'b', x: 110, y: 25, label: 'b' },
    ],
  },
  resistorK: {
    w: 110, h: 50, icon: '〰️', label: 'Resistencia 10kΩ', color: '#78350f',
    pins: [
      { id: 'a', x: 0, y: 25, label: 'a' },
      { id: 'b', x: 110, y: 25, label: 'b' },
    ],
  },
  buzzer: {
    w: 80, h: 80, icon: '🔔', label: 'Zumbador', color: '#f59e0b',
    pins: [
      { id: '+', x: 0, y: 40, label: '+' },
      { id: '-', x: 80, y: 40, label: '−' },
    ],
  },
  motor: {
    w: 90, h: 90, icon: '⚙️', label: 'Motor DC', color: '#16a34a',
    pins: [
      { id: 'a', x: 0, y: 45, label: 'a' },
      { id: 'b', x: 90, y: 45, label: 'b' },
    ],
  },
  pot: {
    w: 100, h: 90, icon: '🎚️', label: 'Potenciómetro', color: '#ec4899',
    pins: [
      { id: '1', x: 0, y: 45, label: '1' },
      { id: '2', x: 50, y: 90, label: '2' },
      { id: '3', x: 100, y: 45, label: '3' },
    ],
  },
  ldr: {
    w: 80, h: 70, icon: '☀️', label: 'LDR', color: '#fde047',
    pins: [
      { id: 'a', x: 0, y: 35, label: 'a' },
      { id: 'b', x: 80, y: 35, label: 'b' },
    ],
  },
  ntc: {
    w: 80, h: 70, icon: '🌡️', label: 'NTC', color: '#fb923c',
    pins: [
      { id: 'a', x: 0, y: 35, label: 'a' },
      { id: 'b', x: 80, y: 35, label: 'b' },
    ],
  },
  rgb: {
    w: 100, h: 110, icon: '🌈', label: 'LED RGB', color: '#a855f7',
    pins: [
      { id: 'R', x: 0, y: 25, label: 'R' },
      { id: 'G', x: 0, y: 50, label: 'G' },
      { id: 'B', x: 0, y: 75, label: 'B' },
      { id: 'GND', x: 100, y: 55, label: 'GND' },
    ],
  },
  pir: {
    w: 100, h: 100, icon: '🚨', label: 'Sensor PIR', color: '#06b6d4',
    pins: [
      { id: 'VCC', x: 0, y: 25, label: 'VCC' },
      { id: 'OUT', x: 0, y: 55, label: 'OUT' },
      { id: 'GND', x: 0, y: 85, label: 'GND' },
    ],
  },
  ultrasonic: {
    w: 130, h: 100, icon: '📡', label: 'Ultrasonidos', color: '#6366f1',
    pins: [
      { id: 'VCC', x: 0, y: 22, label: 'VCC' },
      { id: 'TRIG', x: 0, y: 45, label: 'TRIG' },
      { id: 'ECHO', x: 0, y: 68, label: 'ECHO' },
      { id: 'GND', x: 0, y: 90, label: 'GND' },
    ],
  },
  servo: {
    w: 100, h: 100, icon: '🤖', label: 'Servomotor', color: '#14b8a6',
    pins: [
      { id: 'VCC', x: 0, y: 25, label: 'VCC' },
      { id: 'SIG', x: 0, y: 55, label: 'SIG' },
      { id: 'GND', x: 0, y: 85, label: 'GND' },
    ],
  },
  ir: {
    w: 100, h: 90, icon: '👁️', label: 'Sensor IR', color: '#dc2626',
    pins: [
      { id: 'VCC', x: 0, y: 22, label: 'VCC' },
      { id: 'OUT', x: 0, y: 50, label: 'OUT' },
      { id: 'GND', x: 0, y: 78, label: 'GND' },
    ],
  },
  arduino: {
    w: 170, h: 240, icon: '🧠', label: 'Arduino UNO', color: '#0ea5e9',
    pins: [
      { id: '5V', x: 0, y: 30, label: '5V' },
      { id: 'GND', x: 0, y: 55, label: 'GND' },
      { id: 'A0', x: 0, y: 80, label: 'A0' },
      { id: 'A1', x: 0, y: 105, label: 'A1' },
      { id: 'A2', x: 0, y: 130, label: 'A2' },
      { id: 'D2', x: 170, y: 30, label: 'D2' },
      { id: 'D3', x: 170, y: 55, label: 'D3' },
      { id: 'D4', x: 170, y: 80, label: 'D4' },
      { id: 'D5', x: 170, y: 105, label: 'D5' },
      { id: 'D6', x: 170, y: 130, label: 'D6' },
      { id: 'D8', x: 170, y: 155, label: 'D8' },
      { id: 'D9', x: 170, y: 180, label: 'D9' },
      { id: 'D10', x: 170, y: 205, label: 'D10' },
      { id: 'D11', x: 170, y: 230, label: 'D11' },
      { id: 'D13', x: 0, y: 215, label: 'D13' },
    ],
  },
  driverH: {
    w: 140, h: 120, icon: '⚡', label: 'Puente H', color: '#64748b',
    pins: [
      { id: 'VCC', x: 0, y: 25, label: 'VCC' },
      { id: 'GND', x: 0, y: 50, label: 'GND' },
      { id: 'IN1', x: 0, y: 75, label: 'IN1' },
      { id: 'IN2', x: 0, y: 100, label: 'IN2' },
      { id: 'M1A', x: 140, y: 40, label: 'M1+' },
      { id: 'M1B', x: 140, y: 80, label: 'M1−' },
    ],
  },
};

// Helper: crea conexión normalizada
const pair = (a, b) => [a, b].sort().join('|');

// Ejercicios por curso. 5 ejercicios por curso, dificultad creciente.
export const EXERCISES_BY_GRADE = {
  '1': [
    {
      id: 'eso1-led-pila',
      title: '1. Enciende un LED con una pila',
      description: 'Conecta los dos terminales de la pila al LED para que se encienda. Recuerda: el positivo de la pila va al ánodo (A) del LED.',
      hint: 'Une pila + con LED A y LED K con pila −.',
      components: [
        { id: 'bat', type: 'battery', x: 60, y: 160 },
        { id: 'led', type: 'led', x: 420, y: 155 },
      ],
      target: [pair('bat.+', 'led.+'), pair('led.-', 'bat.-')],
    },
    {
      id: 'eso1-interruptor',
      title: '2. Añade un interruptor',
      description: 'Intercala un interruptor entre la pila y el LED para poder encenderlo y apagarlo.',
      hint: 'La corriente debe pasar por el interruptor antes de llegar al LED.',
      components: [
        { id: 'bat', type: 'battery', x: 40, y: 200 },
        { id: 'sw', type: 'switch', x: 240, y: 210 },
        { id: 'led', type: 'led', x: 460, y: 195 },
      ],
      target: [
        pair('bat.+', 'sw.a'),
        pair('sw.b', 'led.+'),
        pair('led.-', 'bat.-'),
      ],
    },
    {
      id: 'eso1-paralelo',
      title: '3. Dos LEDs en paralelo',
      description: 'Conecta dos LEDs en paralelo a la pila para que los dos se enciendan a la vez.',
      hint: 'Los dos LEDs comparten la misma pila: ambos ánodos al +, ambos cátodos al −.',
      components: [
        { id: 'bat', type: 'battery', x: 40, y: 220 },
        { id: 'led', type: 'led', x: 360, y: 120 },
        { id: 'led2', type: 'led2', x: 360, y: 290 },
      ],
      target: [
        pair('bat.+', 'led.+'),
        pair('bat.+', 'led2.+'),
        pair('led.-', 'bat.-'),
        pair('led2.-', 'bat.-'),
      ],
    },
    {
      id: 'eso1-zumbador',
      title: '4. Timbre con pulsador',
      description: 'Mientras mantienes pulsado el botón, el zumbador suena. Conecta el circuito.',
      hint: 'El pulsador interrumpe el paso entre la pila y el zumbador.',
      components: [
        { id: 'bat', type: 'battery', x: 40, y: 200 },
        { id: 'btn', type: 'button', x: 230, y: 205 },
        { id: 'buz', type: 'buzzer', x: 440, y: 195 },
      ],
      target: [
        pair('bat.+', 'btn.a'),
        pair('btn.b', 'buz.+'),
        pair('buz.-', 'bat.-'),
      ],
    },
    {
      id: 'eso1-motor',
      title: '5. Motor con interruptor',
      description: 'Controla un motor de corriente continua con un interruptor.',
      hint: 'Pila → interruptor → motor → pila.',
      components: [
        { id: 'bat', type: 'battery', x: 40, y: 210 },
        { id: 'sw', type: 'switch', x: 240, y: 215 },
        { id: 'mot', type: 'motor', x: 440, y: 195 },
      ],
      target: [
        pair('bat.+', 'sw.a'),
        pair('sw.b', 'mot.a'),
        pair('mot.b', 'bat.-'),
      ],
    },
  ],
  '2': [
    {
      id: 'eso2-resistencia',
      title: '1. LED con resistencia limitadora',
      description: 'Protege el LED añadiendo una resistencia en serie. Así no se quemará.',
      hint: 'La resistencia va entre el + de la pila y el ánodo del LED.',
      components: [
        { id: 'bat', type: 'battery', x: 40, y: 200 },
        { id: 'r', type: 'resistor', x: 220, y: 210 },
        { id: 'led', type: 'led', x: 460, y: 195 },
      ],
      target: [
        pair('bat.+', 'r.a'),
        pair('r.b', 'led.+'),
        pair('led.-', 'bat.-'),
      ],
    },
    {
      id: 'eso2-ldr',
      title: '2. LED con sensor de luz (LDR)',
      description: 'Añade una LDR en serie con el LED. Cuando hay poca luz la LDR deja pasar la corriente.',
      hint: 'Pila → LDR → LED → pila. Incluye la resistencia para proteger el LED.',
      components: [
        { id: 'bat', type: 'battery', x: 20, y: 210 },
        { id: 'ldr', type: 'ldr', x: 180, y: 210 },
        { id: 'r', type: 'resistor', x: 310, y: 215 },
        { id: 'led', type: 'led', x: 490, y: 205 },
      ],
      target: [
        pair('bat.+', 'ldr.a'),
        pair('ldr.b', 'r.a'),
        pair('r.b', 'led.+'),
        pair('led.-', 'bat.-'),
      ],
    },
    {
      id: 'eso2-pot',
      title: '3. Regulador de brillo con potenciómetro',
      description: 'Con el potenciómetro puedes variar la intensidad del LED. Úsalo como resistencia variable entre 1 y 2.',
      hint: 'Pines 1 y 2 se usan como resistencia. Pin 3 queda sin conectar.',
      components: [
        { id: 'bat', type: 'battery', x: 20, y: 210 },
        { id: 'pot', type: 'pot', x: 180, y: 190 },
        { id: 'led', type: 'led', x: 420, y: 200 },
      ],
      target: [
        pair('bat.+', 'pot.1'),
        pair('pot.2', 'led.+'),
        pair('led.-', 'bat.-'),
      ],
    },
    {
      id: 'eso2-dos-botones',
      title: '4. Dos pulsadores, dos LEDs',
      description: 'Cada pulsador controla su propio LED de forma independiente, pero comparten la misma pila.',
      hint: 'Construye dos ramas en paralelo, cada una con su pulsador y su LED.',
      components: [
        { id: 'bat', type: 'battery', x: 30, y: 220 },
        { id: 'b1', type: 'button', x: 220, y: 110 },
        { id: 'led', type: 'led', x: 430, y: 100 },
        { id: 'b2', type: 'button', x: 220, y: 300 },
        { id: 'led2', type: 'led2', x: 430, y: 300 },
      ],
      target: [
        pair('bat.+', 'b1.a'),
        pair('b1.b', 'led.+'),
        pair('led.-', 'bat.-'),
        pair('bat.+', 'b2.a'),
        pair('b2.b', 'led2.+'),
        pair('led2.-', 'bat.-'),
      ],
    },
    {
      id: 'eso2-alarma',
      title: '5. Alarma luminosa y sonora',
      description: 'Al pulsar el botón se encienden un LED rojo y el zumbador a la vez.',
      hint: 'LED y zumbador en paralelo después del pulsador.',
      components: [
        { id: 'bat', type: 'battery', x: 30, y: 220 },
        { id: 'btn', type: 'button', x: 200, y: 225 },
        { id: 'led', type: 'led', x: 380, y: 120 },
        { id: 'buz', type: 'buzzer', x: 380, y: 310 },
      ],
      target: [
        pair('bat.+', 'btn.a'),
        pair('btn.b', 'led.+'),
        pair('btn.b', 'buz.+'),
        pair('led.-', 'bat.-'),
        pair('buz.-', 'bat.-'),
      ],
    },
  ],
  '3': [
    {
      id: 'eso3-blink',
      title: '1. Arduino Blink',
      description: 'Programa estrella: parpadear un LED en el pin digital 13. Añade una resistencia para protegerlo.',
      hint: 'Arduino D13 → resistencia → LED → GND.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 90 },
        { id: 'r', type: 'resistor', x: 260, y: 180 },
        { id: 'led', type: 'led', x: 450, y: 165 },
      ],
      target: [
        pair('ard.D13', 'r.a'),
        pair('r.b', 'led.+'),
        pair('led.-', 'ard.GND'),
      ],
    },
    {
      id: 'eso3-boton-pull',
      title: '2. Pulsador con resistencia pull-down',
      description: 'Lee un pulsador en el pin D2. La resistencia pull-down de 10k mantiene el pin en 0 cuando el botón no se pulsa.',
      hint: 'Botón entre 5V y D2. Resistencia entre D2 y GND.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'btn', type: 'button', x: 300, y: 90 },
        { id: 'rK', type: 'resistorK', x: 300, y: 250 },
      ],
      target: [
        pair('ard.5V', 'btn.a'),
        pair('btn.b', 'ard.D2'),
        pair('ard.D2', 'rK.a'),
        pair('rK.b', 'ard.GND'),
      ],
    },
    {
      id: 'eso3-rgb',
      title: '3. LED RGB por PWM',
      description: 'Controla los colores del LED RGB desde los pines PWM D9, D10 y D11.',
      hint: 'D9 → R, D10 → G, D11 → B, y el GND común va a GND de Arduino.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'rgb', type: 'rgb', x: 360, y: 150 },
      ],
      target: [
        pair('ard.D9', 'rgb.R'),
        pair('ard.D10', 'rgb.G'),
        pair('ard.D11', 'rgb.B'),
        pair('ard.GND', 'rgb.GND'),
      ],
    },
    {
      id: 'eso3-servo-pot',
      title: '4. Servomotor controlado por potenciómetro',
      description: 'Lee un potenciómetro en A0 y usa ese valor para mover un servomotor conectado a D9.',
      hint: 'Pot: 1→5V, 3→GND, 2→A0. Servo: VCC→5V, GND→GND, SIG→D9.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'pot', type: 'pot', x: 280, y: 50 },
        { id: 'servo', type: 'servo', x: 460, y: 210 },
      ],
      target: [
        pair('pot.1', 'ard.5V'),
        pair('pot.3', 'ard.GND'),
        pair('pot.2', 'ard.A0'),
        pair('servo.VCC', 'ard.5V'),
        pair('servo.GND', 'ard.GND'),
        pair('servo.SIG', 'ard.D9'),
      ],
    },
    {
      id: 'eso3-ultra',
      title: '5. Ultrasonidos + Zumbador de alerta',
      description: 'Mide distancia con el sensor ultrasónico y activa un zumbador cuando hay un obstáculo cerca.',
      hint: 'TRIG→D3, ECHO→D4, zumbador en D5, VCC/GND al Arduino.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'us', type: 'ultrasonic', x: 280, y: 70 },
        { id: 'buz', type: 'buzzer', x: 470, y: 240 },
      ],
      target: [
        pair('us.VCC', 'ard.5V'),
        pair('us.GND', 'ard.GND'),
        pair('us.TRIG', 'ard.D3'),
        pair('us.ECHO', 'ard.D4'),
        pair('buz.+', 'ard.D5'),
        pair('buz.-', 'ard.GND'),
      ],
    },
  ],
  '4': [
    {
      id: 'eso4-semaforo',
      title: '1. Semáforo de tres colores',
      description: 'Monta un semáforo con tres LEDs controlados por los pines D8, D9 y D10. Comparten GND común.',
      hint: 'D8 al LED rojo, D9 al ámbar (green2), D10 al verde. Todos los cátodos a GND.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'led', type: 'led', x: 340, y: 80 },
        { id: 'led2', type: 'led2', x: 340, y: 200 },
        { id: 'led3', type: 'led', x: 340, y: 320 },
      ],
      target: [
        pair('ard.D8', 'led.+'),
        pair('ard.D9', 'led2.+'),
        pair('ard.D10', 'led3.+'),
        pair('led.-', 'ard.GND'),
        pair('led2.-', 'ard.GND'),
        pair('led3.-', 'ard.GND'),
      ],
    },
    {
      id: 'eso4-alarma-pir',
      title: '2. Alarma con sensor PIR',
      description: 'El sensor PIR detecta movimiento y envía la señal al Arduino, que activa LED y zumbador.',
      hint: 'PIR: VCC→5V, GND→GND, OUT→D2. LED en D13, zumbador en D5.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'pir', type: 'pir', x: 280, y: 70 },
        { id: 'led', type: 'led', x: 470, y: 170 },
        { id: 'buz', type: 'buzzer', x: 470, y: 290 },
      ],
      target: [
        pair('pir.VCC', 'ard.5V'),
        pair('pir.GND', 'ard.GND'),
        pair('pir.OUT', 'ard.D2'),
        pair('ard.D13', 'led.+'),
        pair('led.-', 'ard.GND'),
        pair('ard.D5', 'buz.+'),
        pair('buz.-', 'ard.GND'),
      ],
    },
    {
      id: 'eso4-puente-h',
      title: '3. Control de motor con puente H',
      description: 'Controla un motor en ambos sentidos usando un puente H. Las entradas IN1 e IN2 vienen de D3 y D4.',
      hint: 'VCC y GND del puente a Arduino. IN1→D3, IN2→D4. El motor va a M1+ y M1−.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'drv', type: 'driverH', x: 280, y: 90 },
        { id: 'mot', type: 'motor', x: 490, y: 150 },
      ],
      target: [
        pair('drv.VCC', 'ard.5V'),
        pair('drv.GND', 'ard.GND'),
        pair('drv.IN1', 'ard.D3'),
        pair('drv.IN2', 'ard.D4'),
        pair('drv.M1A', 'mot.a'),
        pair('drv.M1B', 'mot.b'),
      ],
    },
    {
      id: 'eso4-termometro',
      title: '4. Termómetro con aviso',
      description: 'Lee un sensor NTC en A0 y enciende un LED rojo en D13 si la temperatura supera un umbral.',
      hint: 'NTC + resistencia de 10k forman un divisor. NTC entre 5V y A0; resistencia entre A0 y GND. LED en D13.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 60 },
        { id: 'ntc', type: 'ntc', x: 300, y: 70 },
        { id: 'rK', type: 'resistorK', x: 280, y: 220 },
        { id: 'r', type: 'resistor', x: 280, y: 310 },
        { id: 'led', type: 'led', x: 470, y: 310 },
      ],
      target: [
        pair('ntc.a', 'ard.5V'),
        pair('ntc.b', 'ard.A0'),
        pair('ard.A0', 'rK.a'),
        pair('rK.b', 'ard.GND'),
        pair('ard.D13', 'r.a'),
        pair('r.b', 'led.+'),
        pair('led.-', 'ard.GND'),
      ],
    },
    {
      id: 'eso4-seguidor',
      title: '5. Robot seguidor de línea',
      description: 'Dos sensores IR detectan la línea y controlan las dos entradas del puente H para dirigir el motor.',
      hint: 'IR izquierdo: OUT→D2. IR derecho: OUT→D4. Puente H: IN1→D3, IN2→D5. Alimentación común.',
      components: [
        { id: 'ard', type: 'arduino', x: 30, y: 40 },
        { id: 'irL', type: 'ir', x: 270, y: 30 },
        { id: 'irR', type: 'ir', x: 270, y: 180 },
        { id: 'drv', type: 'driverH', x: 440, y: 320 },
        { id: 'mot', type: 'motor', x: 640, y: 330 },
      ],
      target: [
        pair('irL.VCC', 'ard.5V'),
        pair('irL.GND', 'ard.GND'),
        pair('irL.OUT', 'ard.D2'),
        pair('irR.VCC', 'ard.5V'),
        pair('irR.GND', 'ard.GND'),
        pair('irR.OUT', 'ard.D4'),
        pair('drv.VCC', 'ard.5V'),
        pair('drv.GND', 'ard.GND'),
        pair('drv.IN1', 'ard.D3'),
        pair('drv.IN2', 'ard.D5'),
        pair('drv.M1A', 'mot.a'),
        pair('drv.M1B', 'mot.b'),
      ],
    },
  ],
};

export const getExercises = (grade) => {
  const key = String(grade);
  return EXERCISES_BY_GRADE[key] || EXERCISES_BY_GRADE['1'];
};
