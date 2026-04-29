// src/apps/regla-de-tres/problemGenerator.js
// Generador de problemas de regla de 3 (directa e inversa) para distintas dificultades.

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const formatNumber = (n) => {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toString().replace('.', ',');
};

const round2 = (n) => Math.round(n * 100) / 100;

// ============================================================
//  PLANTILLAS DE REGLA DE 3 DIRECTA (más cantidad → más resultado)
// ============================================================
const DIRECTA_TEMPLATES = [
  // -------- Compras: precio por cantidad --------
  ({ a1, b1, a2 }) => ({
    text: `Si ${a1} kg de manzanas cuestan ${formatNumber(b1)} €, ¿cuánto costarán ${a2} kg?`,
    unit: '€', a1Label: 'kg', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} kg de patatas cuestan ${formatNumber(b1)} €. ¿Cuánto costarán ${a2} kg?`,
    unit: '€', a1Label: 'kg', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una frutería vende ${a1} kg de naranjas por ${formatNumber(b1)} €. ¿Cuánto cuestan ${a2} kg?`,
    unit: '€', a1Label: 'kg', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} barras de pan cuestan ${formatNumber(b1)} €. ¿Cuánto costarán ${a2} barras iguales?`,
    unit: '€', a1Label: 'barras', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} bolígrafos del mismo modelo cuestan ${formatNumber(b1)} €. ¿Cuánto costarán ${a2}?`,
    unit: '€', a1Label: 'bolis', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} cuadernos iguales valen ${formatNumber(b1)} €. ¿Cuánto valdrán ${a2}?`,
    unit: '€', a1Label: 'cuadernos', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Si ${a1} libros cuestan ${formatNumber(b1)} €, ¿cuánto costarán ${a2} libros del mismo precio?`,
    unit: '€', a1Label: 'libros', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una caja con ${a1} botellas de agua cuesta ${formatNumber(b1)} €. ¿Cuánto costaría una caja con ${a2} botellas?`,
    unit: '€', a1Label: 'botellas', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un paquete de ${a1} galletas cuesta ${formatNumber(b1)} €. ¿Cuánto costaría un paquete de ${a2} galletas iguales?`,
    unit: '€', a1Label: 'galletas', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} m de tela cuestan ${formatNumber(b1)} €. ¿Cuánto costarán ${a2} m de la misma tela?`,
    unit: '€', a1Label: 'm', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} m de cable cuestan ${formatNumber(b1)} €. ¿Cuánto costarán ${a2} m del mismo cable?`,
    unit: '€', a1Label: 'm', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Si ${a1} l de gasolina cuestan ${formatNumber(b1)} €, ¿cuánto costarán ${a2} l?`,
    unit: '€', a1Label: 'l', b1Label: '€'
  }),

  // -------- Velocidad / distancia --------
  ({ a1, b1, a2 }) => ({
    text: `Un coche recorre ${formatNumber(b1)} km en ${a1} horas a velocidad constante. ¿Cuántos km recorrerá en ${a2} horas?`,
    unit: 'km', a1Label: 'horas', b1Label: 'km'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un tren AVE hace ${formatNumber(b1)} km en ${a1} horas. Si mantiene la velocidad, ¿cuánto recorrerá en ${a2} horas?`,
    unit: 'km', a1Label: 'horas', b1Label: 'km'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un ciclista recorre ${formatNumber(b1)} km en ${a1} horas. ¿Cuántos km hará en ${a2} horas al mismo ritmo?`,
    unit: 'km', a1Label: 'horas', b1Label: 'km'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Andando, una persona avanza ${formatNumber(b1)} m en ${a1} minutos. ¿Cuántos metros avanzará en ${a2} minutos?`,
    unit: 'm', a1Label: 'minutos', b1Label: 'm'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un atleta corre ${formatNumber(b1)} m en ${a1} segundos. ¿Cuántos m correrá en ${a2} segundos al mismo ritmo?`,
    unit: 'm', a1Label: 'segundos', b1Label: 'm'
  }),

  // -------- Trabajo / salario --------
  ({ a1, b1, a2 }) => ({
    text: `Un trabajador cobra ${formatNumber(b1)} € por ${a1} horas. ¿Cuánto cobrará por ${a2} horas?`,
    unit: '€', a1Label: 'horas', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una niñera cobra ${formatNumber(b1)} € por ${a1} horas de cuidado. ¿Cuánto cobrará por ${a2} horas?`,
    unit: '€', a1Label: 'horas', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un albañil cobra ${formatNumber(b1)} € por ${a1} días de trabajo. ¿Cuánto cobrará por ${a2} días?`,
    unit: '€', a1Label: 'días', b1Label: '€'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un alumno ahorra ${formatNumber(b1)} € en ${a1} semanas. Al mismo ritmo, ¿cuánto ahorrará en ${a2} semanas?`,
    unit: '€', a1Label: 'semanas', b1Label: '€'
  }),

  // -------- Producción --------
  ({ a1, b1, a2 }) => ({
    text: `Una máquina produce ${formatNumber(b1)} botellas en ${a1} minutos. ¿Cuántas producirá en ${a2} minutos?`,
    unit: 'botellas', a1Label: 'minutos', b1Label: 'botellas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una fábrica de coches monta ${formatNumber(b1)} unidades en ${a1} días. ¿Cuántas montará en ${a2} días?`,
    unit: 'coches', a1Label: 'días', b1Label: 'coches'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una impresora saca ${formatNumber(b1)} copias en ${a1} minutos. ¿Cuántas copias hará en ${a2} minutos al mismo ritmo?`,
    unit: 'copias', a1Label: 'minutos', b1Label: 'copias'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una panadería hace ${formatNumber(b1)} barras en ${a1} horas. ¿Cuántas hará en ${a2} horas?`,
    unit: 'barras', a1Label: 'horas', b1Label: 'barras'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un molino muele ${formatNumber(b1)} kg de trigo en ${a1} horas. ¿Cuántos kg molerá en ${a2} horas?`,
    unit: 'kg', a1Label: 'horas', b1Label: 'kg'
  }),

  // -------- Recetas / cocina --------
  ({ a1, b1, a2 }) => ({
    text: `Una receta para ${a1} personas necesita ${formatNumber(b1)} g de harina. ¿Cuántos gramos hacen falta para ${a2} personas?`,
    unit: 'g', a1Label: 'personas', b1Label: 'g'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Para hacer ${a1} pasteles iguales se usan ${formatNumber(b1)} g de azúcar. ¿Cuántos gramos hacen falta para ${a2} pasteles?`,
    unit: 'g', a1Label: 'pasteles', b1Label: 'g'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Para preparar ${a1} pizzas se necesitan ${formatNumber(b1)} g de queso. ¿Cuánto queso hace falta para ${a2} pizzas iguales?`,
    unit: 'g', a1Label: 'pizzas', b1Label: 'g'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una paella para ${a1} comensales lleva ${formatNumber(b1)} g de arroz. ¿Cuántos gramos hacen falta para ${a2} comensales?`,
    unit: 'g', a1Label: 'comensales', b1Label: 'g'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Para ${a1} bocadillos se usan ${formatNumber(b1)} g de jamón. ¿Cuánto se usará para ${a2} bocadillos iguales?`,
    unit: 'g', a1Label: 'bocadillos', b1Label: 'g'
  }),

  // -------- Cobertura / pintura / construcción --------
  ({ a1, b1, a2 }) => ({
    text: `${a1} l de pintura cubren ${formatNumber(b1)} m² de pared. ¿Cuántos m² cubrirán ${a2} l?`,
    unit: 'm²', a1Label: 'l', b1Label: 'm²'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} kg de fertilizante alcanzan para ${formatNumber(b1)} m² de huerto. ¿Para cuántos m² alcanzarán ${a2} kg?`,
    unit: 'm²', a1Label: 'kg', b1Label: 'm²'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} sacos de cemento cubren ${formatNumber(b1)} m² de suelo. ¿Cuántos m² cubrirán ${a2} sacos?`,
    unit: 'm²', a1Label: 'sacos', b1Label: 'm²'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} cajas de baldosas cubren ${formatNumber(b1)} m² de cocina. ¿Cuántos m² cubrirán ${a2} cajas?`,
    unit: 'm²', a1Label: 'cajas', b1Label: 'm²'
  }),

  // -------- Pesos --------
  ({ a1, b1, a2 }) => ({
    text: `Si ${a1} cuadernos iguales pesan ${formatNumber(b1)} g, ¿cuánto pesarán ${a2} cuadernos?`,
    unit: 'g', a1Label: 'cuadernos', b1Label: 'g'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} mochilas idénticas pesan ${formatNumber(b1)} kg. ¿Cuánto pesarán ${a2} mochilas iguales?`,
    unit: 'kg', a1Label: 'mochilas', b1Label: 'kg'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} libros del mismo tomo pesan ${formatNumber(b1)} g. ¿Cuánto pesarán ${a2}?`,
    unit: 'g', a1Label: 'libros', b1Label: 'g'
  }),

  // -------- Lectura / tiempo --------
  ({ a1, b1, a2 }) => ({
    text: `Un alumno lee ${formatNumber(b1)} páginas en ${a1} días. ¿Cuántas páginas leerá en ${a2} días al mismo ritmo?`,
    unit: 'páginas', a1Label: 'días', b1Label: 'páginas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un narrador graba ${formatNumber(b1)} minutos de audiolibro en ${a1} sesiones. ¿Cuántos minutos grabará en ${a2} sesiones?`,
    unit: 'minutos', a1Label: 'sesiones', b1Label: 'minutos'
  }),

  // -------- Animales / agricultura (proporcional) --------
  ({ a1, b1, a2 }) => ({
    text: `${a1} perros consumen ${formatNumber(b1)} kg de pienso al mes. ¿Cuántos kg consumirán ${a2} perros del mismo tamaño?`,
    unit: 'kg', a1Label: 'perros', b1Label: 'kg'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} gallinas ponen ${formatNumber(b1)} huevos al día. ¿Cuántos huevos pondrán ${a2} gallinas al día (en promedio)?`,
    unit: 'huevos', a1Label: 'gallinas', b1Label: 'huevos'
  }),
];

// ============================================================
//  PLANTILLAS DE REGLA DE 3 INVERSA (más cantidad → menos resultado)
// ============================================================
const INVERSA_TEMPLATES = [
  // -------- Obreros / tiempo --------
  ({ a1, b1, a2 }) => ({
    text: `${a1} obreros pintan una pared en ${formatNumber(b1)} horas. ¿Cuánto tardarán ${a2} obreros (al mismo ritmo)?`,
    unit: 'horas', a1Label: 'obreros', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} albañiles construyen un muro en ${formatNumber(b1)} días. ¿Cuánto tardarán ${a2} albañiles iguales?`,
    unit: 'días', a1Label: 'albañiles', b1Label: 'días'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} carpinteros hacen una mesa en ${formatNumber(b1)} horas. ¿Cuánto tardarán ${a2} carpinteros?`,
    unit: 'horas', a1Label: 'carpinteros', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} pintores acaban una habitación en ${formatNumber(b1)} horas. ¿Cuánto tardarán ${a2} pintores trabajando al mismo ritmo?`,
    unit: 'horas', a1Label: 'pintores', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} jardineros podan un seto en ${formatNumber(b1)} horas. ¿Cuánto tardarán ${a2} jardineros?`,
    unit: 'horas', a1Label: 'jardineros', b1Label: 'horas'
  }),

  // -------- Comida / personas / días --------
  ({ a1, b1, a2 }) => ({
    text: `Tenemos comida para ${a1} personas durante ${formatNumber(b1)} días. Si fueran ${a2} personas, ¿para cuántos días alcanzaría?`,
    unit: 'días', a1Label: 'personas', b1Label: 'días'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una despensa tiene reservas para ${a1} soldados durante ${formatNumber(b1)} días. ¿Cuántos días duraría con ${a2} soldados?`,
    unit: 'días', a1Label: 'soldados', b1Label: 'días'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un saco de pienso da de comer a ${a1} perros durante ${formatNumber(b1)} días. ¿Cuántos días duraría con ${a2} perros del mismo tamaño?`,
    unit: 'días', a1Label: 'perros', b1Label: 'días'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Hay heno suficiente para ${a1} caballos durante ${formatNumber(b1)} días. ¿Cuántos días duraría con ${a2} caballos?`,
    unit: 'días', a1Label: 'caballos', b1Label: 'días'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un montón de heno alimenta a ${a1} vacas durante ${formatNumber(b1)} días. ¿Para cuántos días dará con ${a2} vacas?`,
    unit: 'días', a1Label: 'vacas', b1Label: 'días'
  }),

  // -------- Velocidad / tiempo en mismo trayecto --------
  ({ a1, b1, a2 }) => ({
    text: `Un coche viaja a ${a1} km/h y tarda ${formatNumber(b1)} horas en llegar a su destino. ¿Cuánto tardará si va a ${a2} km/h?`,
    unit: 'horas', a1Label: 'km/h', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un tren a ${a1} km/h cubre el trayecto en ${formatNumber(b1)} horas. ¿Cuánto tardará si fuera a ${a2} km/h?`,
    unit: 'horas', a1Label: 'km/h', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un autobús a ${a1} km/h hace una ruta en ${formatNumber(b1)} horas. ¿Cuánto tardará si va a ${a2} km/h?`,
    unit: 'horas', a1Label: 'km/h', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Un ciclista a ${a1} km/h tarda ${formatNumber(b1)} horas en una ruta. ¿Cuánto tardaría a ${a2} km/h?`,
    unit: 'horas', a1Label: 'km/h', b1Label: 'horas'
  }),

  // -------- Llenado / vaciado --------
  ({ a1, b1, a2 }) => ({
    text: `${a1} grifos llenan un depósito en ${formatNumber(b1)} minutos. ¿Cuánto tardarán ${a2} grifos iguales?`,
    unit: 'minutos', a1Label: 'grifos', b1Label: 'minutos'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} bombas vacían un pozo en ${formatNumber(b1)} horas. ¿Cuánto tardarán ${a2} bombas iguales?`,
    unit: 'horas', a1Label: 'bombas', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} mangueras llenan una piscina en ${formatNumber(b1)} horas. ¿Cuánto tardarán ${a2} mangueras del mismo caudal?`,
    unit: 'horas', a1Label: 'mangueras', b1Label: 'horas'
  }),

  // -------- Reparto (más comparten → menos toca) --------
  ({ a1, b1, a2 }) => ({
    text: `Un grupo de ${a1} amigos paga la factura del viaje y cada uno aporta ${formatNumber(b1)} €. Si fueran ${a2} amigos, ¿cuánto aportaría cada uno?`,
    unit: '€', a1Label: 'amigos', b1Label: '€/persona'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} hermanos reparten una herencia y cada uno recibe ${formatNumber(b1)} €. Si fueran ${a2} hermanos, ¿cuánto recibiría cada uno?`,
    unit: '€', a1Label: 'hermanos', b1Label: '€/persona'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una caja de bombones se reparte entre ${a1} niños y a cada uno le tocan ${formatNumber(b1)} bombones. Si fueran ${a2} niños, ¿cuántos tocaría a cada uno?`,
    unit: 'bombones', a1Label: 'niños', b1Label: 'bombones'
  }),

  // -------- Producción inversa --------
  ({ a1, b1, a2 }) => ({
    text: `${a1} máquinas terminan un pedido en ${formatNumber(b1)} horas. ¿Cuánto tardarán ${a2} máquinas iguales?`,
    unit: 'horas', a1Label: 'máquinas', b1Label: 'horas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} ordenadores procesan unos datos en ${formatNumber(b1)} minutos. ¿Cuánto tardarán ${a2} ordenadores iguales?`,
    unit: 'minutos', a1Label: 'ordenadores', b1Label: 'minutos'
  }),
  ({ a1, b1, a2 }) => ({
    text: `${a1} fotocopiadoras hacen un encargo en ${formatNumber(b1)} minutos. ¿Cuánto tardarán ${a2} fotocopiadoras iguales?`,
    unit: 'minutos', a1Label: 'copiadoras', b1Label: 'minutos'
  }),

  // -------- Texto / formato --------
  ({ a1, b1, a2 }) => ({
    text: `Un libro escrito con ${a1} palabras por página tiene ${formatNumber(b1)} páginas. ¿Cuántas páginas tendría con ${a2} palabras por página?`,
    unit: 'páginas', a1Label: 'palabras/pág.', b1Label: 'páginas'
  }),
  ({ a1, b1, a2 }) => ({
    text: `Una redacción ocupa ${formatNumber(b1)} renglones con ${a1} palabras por renglón. ¿Cuántos renglones ocupará con ${a2} palabras por renglón?`,
    unit: 'renglones', a1Label: 'palabras/línea', b1Label: 'renglones'
  }),
];

// ============================================================
//  GENERADORES DE PARÁMETROS POR DIFICULTAD
// ============================================================

const generateDirecta = (difficulty) => {
  let k, a1, b1, a2;
  if (difficulty === 'easy') {
    k = pick([2, 3, 4, 5, 6, 7, 8, 10]);
    a1 = randomInt(2, 6);
    a2 = randomInt(3, 12);
  } else if (difficulty === 'medium') {
    k = pick([1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7.5, 8]);
    a1 = randomInt(2, 8);
    a2 = randomInt(3, 15);
  } else {
    k = pick([1.2, 1.25, 1.5, 1.75, 2.4, 2.5, 3.25, 3.6, 4.5, 5.5, 6.4, 7.5]);
    a1 = randomInt(3, 10);
    a2 = randomInt(4, 18);
  }
  while (a2 === a1) a2 = randomInt(3, 15);
  b1 = round2(a1 * k);
  const answer = round2(a2 * k);
  return { a1, b1, a2, answer };
};

const generateInversa = (difficulty) => {
  let a1, b1, a2;
  if (difficulty === 'easy') {
    a1 = randomInt(2, 6);
    b1 = randomInt(4, 12);
    const P = a1 * b1;
    const divisors = [];
    for (let i = 2; i <= 20; i++) if (P % i === 0 && i !== a1) divisors.push(i);
    a2 = divisors.length > 0 ? pick(divisors) : 2 * a1;
  } else if (difficulty === 'medium') {
    a1 = randomInt(2, 8);
    b1 = randomInt(4, 16);
    a2 = randomInt(2, 12);
    while (a2 === a1) a2 = randomInt(2, 12);
  } else {
    a1 = randomInt(3, 10);
    b1 = randomInt(6, 24);
    a2 = randomInt(4, 16);
    while (a2 === a1) a2 = randomInt(4, 16);
  }
  const answer = round2((a1 * b1) / a2);
  return { a1, b1, a2, answer };
};

// ============================================================
//  API PÚBLICA
// ============================================================

export const generateProblem = (difficulty = 'easy') => {
  // En fácil sólo regla de 3 directa; en medio y examen mezcla directa e inversa.
  let type;
  if (difficulty === 'easy') type = 'directa';
  else type = pick(['directa', 'inversa']);

  const params = type === 'directa' ? generateDirecta(difficulty) : generateInversa(difficulty);
  const templates = type === 'directa' ? DIRECTA_TEMPLATES : INVERSA_TEMPLATES;
  const tpl = pick(templates);
  const rendered = tpl(params);
  return {
    type,
    difficulty,
    a1: params.a1,
    b1: params.b1,
    a2: params.a2,
    answer: params.answer,
    text: rendered.text,
    unit: rendered.unit,
    a1Label: rendered.a1Label,
    b1Label: rendered.b1Label,
  };
};

// Comprueba la respuesta del alumno con tolerancia mínima por redondeo.
export const checkAnswer = (userInput, expected) => {
  if (typeof userInput !== 'string' && typeof userInput !== 'number') return false;
  const cleaned = String(userInput).replace(',', '.').trim();
  if (!cleaned) return false;
  const num = parseFloat(cleaned);
  if (!Number.isFinite(num)) return false;
  return Math.abs(num - expected) < 0.011;
};
