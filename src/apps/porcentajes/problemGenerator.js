// src/apps/porcentajes/problemGenerator.js
// Generador de problemas de porcentajes y proporciones para distintas dificultades.

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;

export const formatNumber = (n) => {
  if (!Number.isFinite(n)) return '0';
  const r = round2(n);
  if (Number.isInteger(r)) return String(r);
  return r.toString().replace('.', ',');
};

// ============================================================
//   GENERADORES POR TIPO DE PROBLEMA
// ============================================================

// 1) ¿Cuánto es el P% de V? -- answer = V * P / 100
const genPercentageOf = (difficulty) => {
  let P, V;
  if (difficulty === 'easy') {
    P = pick([10, 20, 25, 50, 75]);
    if (P === 10) V = pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 200]);
    else if (P === 20) V = pick([15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200]);
    else if (P === 25) V = pick([16, 20, 24, 28, 32, 40, 48, 60, 80, 100, 120, 200]);
    else if (P === 50) V = pick([10, 14, 18, 20, 24, 30, 40, 50, 60, 80, 100, 150, 200]);
    else V = pick([20, 40, 60, 80, 100, 120, 160, 200]);
  } else if (difficulty === 'medium') {
    P = pick([5, 10, 15, 20, 25, 30, 40, 60, 70, 80]);
    V = randomInt(20, 400);
  } else {
    P = randomInt(5, 95);
    V = randomInt(40, 800);
  }
  const answer = round2(V * P / 100);

  const scenarios = [
    { text: `¿Cuánto es el ${P}% de ${V}?`, unit: '' },
    { text: `Calcula el ${P}% de ${V}.`, unit: '' },
    { text: `En una caja hay ${V} bombones y el ${P}% son de chocolate negro. ¿Cuántos hay de chocolate negro?`, unit: 'bombones' },
    { text: `Una pastelería hizo ${V} pasteles y el ${P}% se vendieron por la mañana. ¿Cuántos se vendieron por la mañana?`, unit: 'pasteles' },
    { text: `En un cole de ${V} alumnos, el ${P}% participa en el coro. ¿Cuántos alumnos hay en el coro?`, unit: 'alumnos' },
    { text: `Un equipo jugó ${V} partidos y ganó el ${P}%. ¿Cuántos partidos ganó?`, unit: 'partidos' },
    { text: `Una piscina tiene ${V} litros y se ha llenado el ${P}%. ¿Cuántos litros tiene ya?`, unit: 'litros' },
    { text: `Una librería tenía ${V} libros y vendió el ${P}% en una semana. ¿Cuántos libros vendió?`, unit: 'libros' },
    { text: `En un examen había ${V} preguntas y un alumno acertó el ${P}%. ¿Cuántas preguntas acertó?`, unit: 'preguntas' },
    { text: `De ${V} habitantes de un pueblo, el ${P}% son menores de edad. ¿Cuántos menores hay?`, unit: 'habitantes' },
    { text: `Una mochila pesa ${V} g y el ${P}% del peso son los libros. ¿Cuánto pesan los libros?`, unit: 'g' },
    { text: `Una empresa tiene ${V} empleados y el ${P}% trabaja en remoto. ¿Cuántos trabajan en remoto?`, unit: 'empleados' },
    { text: `Un agricultor recogió ${V} kg de fruta y el ${P}% eran manzanas. ¿Cuántos kg eran manzanas?`, unit: 'kg' },
    { text: `Un autobús lleva ${V} pasajeros y el ${P}% se baja en la primera parada. ¿Cuántos se bajan?`, unit: 'pasajeros' },
  ];
  const sc = pick(scenarios);
  return { type: 'porcentaje', label: '% de un número', text: sc.text, unit: sc.unit, answer, params: { P, V } };
};

// 2) ¿Qué % es X de V?
const genWhatPercent = (difficulty) => {
  let V, X;
  if (difficulty === 'easy') {
    V = pick([20, 25, 40, 50, 80, 100, 200]);
    const ratios = [0.1, 0.2, 0.25, 0.5, 0.75];
    X = round2(V * pick(ratios));
  } else if (difficulty === 'medium') {
    V = pick([20, 25, 40, 50, 60, 80, 100, 120, 150, 200, 250]);
    X = randomInt(2, V - 1);
  } else {
    V = randomInt(40, 600);
    X = randomInt(5, V - 5);
  }
  const answer = round2((X / V) * 100);

  const scenarios = [
    { text: `¿Qué porcentaje es ${formatNumber(X)} de ${V}?` },
    { text: `Calcula qué porcentaje representa ${formatNumber(X)} sobre un total de ${V}.` },
    { text: `Un equipo jugó ${V} partidos y ganó ${formatNumber(X)}. ¿Qué porcentaje ganó?` },
    { text: `De ${V} alumnos, ${formatNumber(X)} usan gafas. ¿Qué porcentaje usa gafas?` },
    { text: `Un coche debe recorrer ${V} km y ya lleva ${formatNumber(X)} km. ¿Qué porcentaje del trayecto ha hecho?` },
    { text: `Una piscina tiene capacidad para ${V} l y contiene ${formatNumber(X)} l. ¿A qué porcentaje está llena?` },
    { text: `Un alumno saca ${formatNumber(X)} puntos en un examen sobre ${V}. ¿Qué porcentaje de aciertos tiene?` },
    { text: `En un autobús hay ${V} asientos y van ${formatNumber(X)} ocupados. ¿Qué porcentaje está ocupado?` },
    { text: `Un comercio vendió ${formatNumber(X)} unidades de un total de ${V}. ¿Qué porcentaje se ha vendido?` },
    { text: `De ${V} días del trimestre, han faltado ${formatNumber(X)} a clase. ¿Qué porcentaje supone?` },
    { text: `En una urna había ${V} votos y ${formatNumber(X)} fueron a la opción A. ¿Qué porcentaje obtuvo A?` },
    { text: `Un coche tenía ${V} l de combustible y ha gastado ${formatNumber(X)} l. ¿Qué porcentaje ha gastado?` },
  ];
  const sc = pick(scenarios);
  return { type: 'porcentaje', label: 'qué % es', text: sc.text, unit: '%', answer, params: { X, V } };
};

// 3) X es el P% de un número, ¿cuál es?
const genFindTotal = (difficulty) => {
  let P, total;
  if (difficulty === 'easy') {
    P = pick([10, 20, 25, 50]);
    total = pick([20, 40, 60, 80, 100, 120, 150, 200, 240]);
  } else if (difficulty === 'medium') {
    P = pick([5, 10, 15, 20, 25, 40, 50, 60, 75]);
    total = randomInt(20, 500);
  } else {
    P = randomInt(5, 80);
    total = randomInt(50, 800);
  }
  const X = round2(total * P / 100);
  const answer = round2((X * 100) / P);

  const scenarios = [
    { text: `${formatNumber(X)} es el ${P}% de un número. ¿Cuál es ese número?`, unit: '' },
    { text: `El ${P}% de un número vale ${formatNumber(X)}. ¿Cuál es el número?`, unit: '' },
    { text: `${formatNumber(X)} alumnos representan el ${P}% del cole. ¿Cuántos alumnos tiene el cole en total?`, unit: 'alumnos' },
    { text: `Una clase tiene ${formatNumber(X)} aprobados, que son el ${P}% de la clase. ¿Cuántos alumnos hay en la clase?`, unit: 'alumnos' },
    { text: `${formatNumber(X)} € son el ${P}% del precio total de un mueble. ¿Cuál es el precio total?`, unit: '€' },
    { text: `Una marca rebajó un ${P}% y la rebaja vale ${formatNumber(X)} €. ¿Cuál era el precio inicial?`, unit: '€' },
    { text: `${formatNumber(X)} vehículos representan el ${P}% del aparcamiento. ¿Cuál es la capacidad total del aparcamiento?`, unit: 'vehículos' },
    { text: `${formatNumber(X)} kg de manzanas son el ${P}% de la cosecha. ¿Cuál es la cosecha total?`, unit: 'kg' },
    { text: `${formatNumber(X)} entradas vendidas son el ${P}% del aforo. ¿Cuál es el aforo total?`, unit: 'entradas' },
    { text: `Un alumno ha leído ${formatNumber(X)} páginas, que son el ${P}% del libro. ¿Cuántas páginas tiene el libro?`, unit: 'páginas' },
  ];
  const sc = pick(scenarios);
  return { type: 'porcentaje', label: 'encontrar total', text: sc.text, unit: sc.unit, answer, params: { P, X } };
};

// 4) Aumento
const genIncrease = (difficulty) => {
  let V, P;
  if (difficulty === 'easy') {
    P = pick([10, 20, 25, 50]);
    V = pick([20, 40, 60, 80, 100, 120, 200]);
  } else if (difficulty === 'medium') {
    P = pick([5, 10, 15, 20, 25, 30]);
    V = randomInt(20, 300);
  } else {
    P = randomInt(3, 50);
    V = randomInt(30, 500);
  }
  const answer = round2(V * (1 + P / 100));

  const scenarios = [
    { text: `Un libro cuesta ${V} €. Sube un ${P}%. ¿Cuál es el precio nuevo?`, unit: '€' },
    { text: `Un producto valía ${V} € y ha subido un ${P}%. ¿Cuánto cuesta ahora?`, unit: '€' },
    { text: `El alquiler de un piso era ${V} € y ha subido un ${P}%. ¿Cuál es el alquiler ahora?`, unit: '€' },
    { text: `Un trabajador ganaba ${V} € y le suben el sueldo un ${P}%. ¿Cuánto gana ahora?`, unit: '€' },
    { text: `Una camiseta cuesta ${V} € y le aplican un ${P}% de recargo por personalización. ¿Cuál es el precio final?`, unit: '€' },
    { text: `Una pieza de joyería costaba ${V} € pero su valor sube un ${P}%. ¿Cuál es el valor actual?`, unit: '€' },
    { text: `El billete de tren costaba ${V} € y se incrementa un ${P}%. ¿Cuánto cuesta ahora?`, unit: '€' },
    { text: `Un café costaba ${V} € y la cafetería sube precios un ${P}%. ¿Cuánto vale ahora el café?`, unit: '€' },
    { text: `Un pueblo tenía ${V} habitantes. Su población crece un ${P}%. ¿Cuántos habitantes tiene ahora?`, unit: 'habitantes' },
    { text: `Una entrada de cine costaba ${V} € y suben los precios un ${P}%. ¿Cuál es el nuevo precio?`, unit: '€' },
  ];
  const sc = pick(scenarios);
  return { type: 'aumento', label: 'aumento %', text: sc.text, unit: sc.unit, answer, params: { V, P } };
};

// 5) Descuento
const genDecrease = (difficulty) => {
  let V, P;
  if (difficulty === 'easy') {
    P = pick([10, 20, 25, 50]);
    V = pick([20, 40, 60, 80, 100, 120, 200]);
  } else if (difficulty === 'medium') {
    P = pick([5, 10, 15, 20, 25, 30, 40]);
    V = randomInt(20, 300);
  } else {
    P = randomInt(5, 70);
    V = randomInt(30, 500);
  }
  const answer = round2(V * (1 - P / 100));

  const scenarios = [
    { text: `Una chaqueta cuesta ${V} € y tiene un ${P}% de descuento. ¿Cuál es el precio final?`, unit: '€' },
    { text: `Un producto valía ${V} € y baja un ${P}%. ¿Cuánto cuesta ahora?`, unit: '€' },
    { text: `Una entrada de cine cuesta ${V} € y aplican un ${P}% de descuento por ser martes. ¿Cuánto pagas?`, unit: '€' },
    { text: `Un televisor de ${V} € está rebajado un ${P}%. ¿Cuál es su precio rebajado?`, unit: '€' },
    { text: `Una bici de ${V} € se ofrece con un ${P}% de descuento. ¿Cuál es el precio final?`, unit: '€' },
    { text: `Un libro costaba ${V} € y el cliente VIP recibe un ${P}% de descuento. ¿Cuánto paga?`, unit: '€' },
    { text: `Una habitación de hotel a ${V} € por noche se ofrece con ${P}% de descuento. ¿Cuál es el precio?`, unit: '€' },
    { text: `Un móvil costaba ${V} € y baja un ${P}% en el Black Friday. ¿Cuánto cuesta?`, unit: '€' },
    { text: `Un curso online de ${V} € tiene un ${P}% de descuento por inscripción anticipada. ¿Cuál es el precio final?`, unit: '€' },
    { text: `Un menú de restaurante de ${V} € se rebaja un ${P}% al medio día. ¿Cuánto cuesta a esa hora?`, unit: '€' },
  ];
  const sc = pick(scenarios);
  return { type: 'descuento', label: 'descuento %', text: sc.text, unit: sc.unit, answer, params: { V, P } };
};

// 6) IVA
const genIva = (difficulty) => {
  const P = pick([4, 10, 21]);
  let V;
  if (difficulty === 'easy') V = pick([100, 200, 50, 60, 80]);
  else if (difficulty === 'medium') V = randomInt(20, 300);
  else V = randomInt(30, 600);
  const answer = round2(V * (1 + P / 100));
  const scenarios = [
    { text: `Un electrodoméstico cuesta ${V} € sin IVA. Con un ${P}% de IVA, ¿cuál es el precio final?` },
    { text: `Una factura de ${V} € no incluye el IVA. Si el IVA es del ${P}%, ¿cuál es el total a pagar?` },
    { text: `Un producto vale ${V} € antes de impuestos. Aplica un ${P}% de IVA. ¿Cuál es el precio final?` },
    { text: `Un fontanero cobra ${V} € por un trabajo, sin IVA. Aplicando el ${P}% de IVA, ¿cuánto paga el cliente?` },
    { text: `Un menú vale ${V} € sin IVA. Con un ${P}% de IVA incluido, ¿cuánto se paga al final?` },
    { text: `La reserva de un hotel asciende a ${V} € sin IVA. Con un ${P}% de IVA, ¿cuál es el total?` },
    { text: `Un técnico factura ${V} € sin IVA. Con el ${P}% de IVA aplicado, ¿cuál es el importe total?` },
    { text: `Un mueble cuesta ${V} € antes de impuestos. Tras añadir el ${P}% de IVA, ¿cuál es su precio final?` },
  ];
  const sc = pick(scenarios);
  return { type: 'aumento', label: 'IVA', text: sc.text, unit: '€', answer, params: { V, P } };
};

// 7) Variación
const genVariation = (difficulty) => {
  let A, B;
  if (difficulty === 'easy') {
    A = pick([100, 200, 50, 80]);
    const factor = pick([1.1, 1.2, 1.25, 1.5, 0.75, 0.8, 0.9]);
    B = round2(A * factor);
  } else if (difficulty === 'medium') {
    A = randomInt(40, 200);
    const factor = pick([1.1, 1.2, 1.25, 1.3, 0.7, 0.75, 0.8, 0.9, 1.4, 1.5]);
    B = round2(A * factor);
  } else {
    A = randomInt(30, 400);
    B = randomInt(15, 600);
    while (B === A) B = randomInt(15, 600);
  }
  const variation = ((B - A) / A) * 100;
  const sign = variation >= 0 ? 'subido' : 'bajado';
  const scenarios = [
    `Un producto pasa de ${formatNumber(A)} € a ${formatNumber(B)} €. ¿Qué porcentaje ha ${sign}? (escribe el valor sin signo)`,
    `Una población pasa de ${formatNumber(A)} habitantes a ${formatNumber(B)}. ¿Qué porcentaje ha ${sign}? (sin signo)`,
    `El precio del pan pasa de ${formatNumber(A)} céntimos a ${formatNumber(B)} céntimos. ¿Qué porcentaje ha ${sign}?`,
    `Una acción cotiza a ${formatNumber(A)} € y pasa a ${formatNumber(B)} €. ¿Qué porcentaje ha ${sign}? (sin signo)`,
    `Un equipo pasa de ${formatNumber(A)} aficionados a ${formatNumber(B)}. ¿Qué porcentaje ha ${sign}?`,
    `La temperatura media pasa de ${formatNumber(A)} a ${formatNumber(B)} (en una escala). ¿Qué porcentaje ha ${sign}? (sin signo)`,
  ];
  const text = pick(scenarios);
  return {
    type: 'variacion',
    label: 'variación %',
    text,
    unit: '%',
    answer: round2(Math.abs(variation)),
    params: { A, B },
  };
};

// 8) Proporción
const genProportion = (difficulty) => {
  let a, b, d;
  if (difficulty === 'easy') {
    const k = pick([2, 3, 4, 5]);
    a = randomInt(2, 6);
    b = randomInt(2, 6);
    d = b * k;
  } else if (difficulty === 'medium') {
    a = randomInt(2, 12);
    b = randomInt(2, 12);
    d = randomInt(2, 24);
  } else {
    a = randomInt(3, 20);
    b = randomInt(2, 18);
    d = randomInt(3, 30);
  }
  const answer = round2((a * d) / b);
  const scenarios = [
    `Encuentra el valor que falta en la proporción: ${a}/${b} = x/${d}. ¿Cuánto vale x?`,
    `En la proporción ${a}/${b} = x/${d}, ¿qué número va en lugar de x?`,
    `Resuelve: ${a} es a ${b} como x es a ${d}. ¿Cuánto vale x?`,
    `Encuentra x sabiendo que ${a}/${b} = x/${d}.`,
    `Si ${a} y ${b} están en proporción con x y ${d}, ¿qué valor tiene x?`,
  ];
  const text = pick(scenarios);
  return { type: 'proporcion', label: 'proporción', text, unit: '', answer, params: { a, b, d } };
};

// 9) Escala
const genScale = (difficulty) => {
  let N, X;
  if (difficulty === 'easy') {
    N = pick([100, 200, 500]);
    X = randomInt(2, 10);
  } else if (difficulty === 'medium') {
    N = pick([100, 200, 500, 1000, 2000]);
    X = randomInt(2, 18);
  } else {
    N = pick([200, 500, 1000, 2000, 5000, 10000]);
    X = randomInt(3, 25);
  }
  const realCm = X * N;
  let answer, unit, scenarios;
  if (realCm < 10000) {
    answer = round2(realCm / 100);
    unit = 'm';
    scenarios = [
      `En un plano a escala 1:${N}, una distancia mide ${X} cm. ¿Cuántos metros mide en la realidad?`,
      `Un plano a escala 1:${N} muestra una habitación de ${X} cm de largo. ¿Cuál es su largo real en m?`,
      `Una maqueta a escala 1:${N} representa una pieza de ${X} cm. ¿Cuánto mide la pieza real en m?`,
      `En el plano (escala 1:${N}) un mueble mide ${X} cm. ¿Cuánto mide en la realidad (en m)?`,
    ];
  } else {
    answer = round2(realCm / 100000);
    unit = 'km';
    scenarios = [
      `En un mapa a escala 1:${N}, una distancia mide ${X} cm. ¿Cuántos km mide en la realidad?`,
      `Un mapa con escala 1:${N} señala ${X} cm entre dos pueblos. ¿Cuál es la distancia real en km?`,
      `En un mapa (1:${N}) hay ${X} cm entre la salida y la meta. ¿Cuánto son en km?`,
      `Una excursión aparece marcada con ${X} cm en un mapa a escala 1:${N}. ¿Cuántos km recorrerás?`,
    ];
  }
  const text = pick(scenarios);
  return { type: 'escala', label: 'escala', text, unit, answer, params: { N, X } };
};

// 10) Reparto proporcional
const genShare = (difficulty) => {
  let T, p, q;
  if (difficulty === 'easy') {
    p = pick([1, 2, 3]);
    q = pick([1, 2, 3, 4]);
    while (q === p) q = pick([1, 2, 3, 4]);
    const partUnit = pick([5, 10, 15, 20]);
    T = (p + q) * partUnit;
  } else if (difficulty === 'medium') {
    p = randomInt(1, 5);
    q = randomInt(1, 6);
    T = (p + q) * randomInt(3, 15);
  } else {
    p = randomInt(1, 7);
    q = randomInt(1, 8);
    T = (p + q) * randomInt(5, 30);
  }
  const answer = round2((T * p) / (p + q));
  const scenarios = [
    { text: `Reparte ${T} € entre dos personas en proporción ${p}:${q}. ¿Cuánto le toca a la primera?`, unit: '€' },
    { text: `Dos hermanos se reparten ${T} caramelos en proporción ${p}:${q}. ¿Cuántos recibe el primero?`, unit: 'caramelos' },
    { text: `En una clase hay ${T} alumnos. Por cada ${p} niños hay ${q} niñas. ¿Cuántos niños hay?`, unit: 'niños' },
    { text: `Dos socios reparten ${T} € de beneficios en proporción ${p}:${q}. ¿Cuánto recibe el primer socio?`, unit: '€' },
    { text: `Un agricultor reparte ${T} kg de fruta entre dos clientes en proporción ${p}:${q}. ¿Cuánto recibe el primero?`, unit: 'kg' },
    { text: `${T} cromos se reparten entre dos amigos según la proporción ${p}:${q}. ¿Cuántos cromos recibe el primer amigo?`, unit: 'cromos' },
    { text: `Dos hermanas se reparten ${T} bombones en proporción ${p}:${q}. ¿Cuántos bombones recibe la primera?`, unit: 'bombones' },
    { text: `${T} libros se distribuyen entre dos clases en proporción ${p}:${q}. ¿Cuántos libros recibe la primera clase?`, unit: 'libros' },
  ];
  const sc = pick(scenarios);
  return { type: 'reparto', label: 'reparto', text: sc.text, unit: sc.unit, answer, params: { T, p, q } };
};

// ============================================================
//   API PÚBLICA
// ============================================================

const TYPES_BY_DIFFICULTY = {
  easy: ['percentage_of', 'find_total', 'proportion', 'increase', 'decrease'],
  medium: ['percentage_of', 'what_percent', 'find_total', 'increase', 'decrease', 'proportion', 'iva', 'share'],
  exam: ['percentage_of', 'what_percent', 'find_total', 'increase', 'decrease', 'iva', 'variation', 'proportion', 'scale', 'share'],
};

const GEN = {
  percentage_of: genPercentageOf,
  what_percent: genWhatPercent,
  find_total: genFindTotal,
  increase: genIncrease,
  decrease: genDecrease,
  iva: genIva,
  variation: genVariation,
  proportion: genProportion,
  scale: genScale,
  share: genShare,
};

export const generateProblem = (difficulty = 'easy') => {
  const types = TYPES_BY_DIFFICULTY[difficulty] || TYPES_BY_DIFFICULTY.easy;
  const type = pick(types);
  return { ...GEN[type](difficulty), difficulty };
};

export const checkAnswer = (userInput, expected) => {
  if (typeof userInput !== 'string' && typeof userInput !== 'number') return false;
  const cleaned = String(userInput).replace(',', '.').replace('%', '').trim();
  if (!cleaned) return false;
  const num = parseFloat(cleaned);
  if (!Number.isFinite(num)) return false;
  return Math.abs(num - expected) < 0.011;
};
