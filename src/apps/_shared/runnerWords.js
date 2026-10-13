// Education Dash (Runner): qué palabras salen en la pista.
//
// Antes cada palabra se sorteaba entre TODAS las categorías, así que con 5
// categorías solo ~1 de cada 5 era de la misión y había rachas largas sin
// ninguna que recoger. Ahora cada partida fija un porcentaje de palabras de la
// misión entre el 40 % y el 60 %, con dos topes de racha para que el ritmo sea
// divertido: nunca más de 2 incorrectas seguidas ni más de 3 correctas seguidas.
// Las palabras salen de "bolsas" barajadas: no se repiten hasta agotar la lista.

export const VALID_MIN = 0.4;
export const VALID_MAX = 0.6;
export const MAX_WRONG_STREAK = 2;
export const MAX_GOOD_STREAK = 3;

// Categorías jugables: claves cuyo valor es una lista con palabras (el contenido
// puede traer también 'title', 'instructions'…).
export const runnerCategories = (data) =>
  Object.keys(data || {}).filter((k) => Array.isArray(data[k]) && data[k].length > 0);

const shuffled = (list, rnd) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function createWordPicker(data, target, rnd = Math.random) {
  const valid = [...new Set((data?.[target] || []).filter(Boolean))];
  const validSet = new Set(valid);
  const wrong = [...new Set(
    runnerCategories(data)
      .filter((k) => k !== target)
      .flatMap((k) => data[k])
      .filter((w) => w && !validSet.has(w)),
  )];
  const ratio = VALID_MIN + rnd() * (VALID_MAX - VALID_MIN);
  let validBag = [];
  let wrongBag = [];
  let goodStreak = 0;
  let wrongStreak = 0;
  let last = null;

  const draw = (bagName) => {
    let bag = bagName === 'valid' ? validBag : wrongBag;
    if (bag.length === 0) {
      bag = shuffled(bagName === 'valid' ? valid : wrong, rnd);
      // que no repita la última palabra al rebarajar
      if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop());
      if (bagName === 'valid') validBag = bag; else wrongBag = bag;
    }
    return bag.pop();
  };

  const next = () => {
    let isValid;
    if (!wrong.length) isValid = true;
    else if (!valid.length) isValid = false;
    else if (wrongStreak >= MAX_WRONG_STREAK) isValid = true;
    else if (goodStreak >= MAX_GOOD_STREAK) isValid = false;
    else isValid = rnd() < ratio;
    const text = draw(isValid ? 'valid' : 'wrong');
    if (isValid) { goodStreak++; wrongStreak = 0; } else { wrongStreak++; goodStreak = 0; }
    last = text;
    return { text, valid: isValid };
  };

  return { next, ratio, isValid: (w) => validSet.has(w) };
}
