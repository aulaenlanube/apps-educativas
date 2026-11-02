// Láminas generadas desde BodyParts3D (tools/build-anatomy.mjs).
//
// part: { k (clave del catálogo), el: [regex de nombres de pieza], not?, mesh?(ctx),
//         mat, color?, sub?: [{ re, mat?, color?, skip? }], gp? (grupo en la lámina),
//         fiber? (eje de fibras: 'auto' o vector), shape? (silueta completa) }
// ctxParts: lo mismo sin clave (se pinta, pero no se puede tocar).
// plate: { id, view, frame ('body' | { pad }), height|width (px), parts, context,
//          near? (corte), grow? (px de zona de toque extra), bias? (contexto al fondo),
//          regions? (cuerpo: partes externas), ao? }

import { mergeMeshes, loadElement, elementsMatching, bbox } from './meshes.mjs';

const P = (k, el, x = {}) => ({ k, el: [].concat(el), ...x });
const mergeLungs = (c) => mergeMeshes(Object.values(c.lungs()));
// Piezas que el modelo trae repetidas (mismo nombre y misma malla, como el
// hioides): pintadas dos veces se pisan y salen oscuras y granuladas.
const once = (re) => (c) => {
  const seen = new Set();
  return mergeMeshes(elementsMatching(c.names, [re]).map((f) => loadElement(c.dir, f)).filter((m) => {
    const b = bbox(m);
    const id = `${m.idx.length}|${b.min.map(Math.round)}|${b.max.map(Math.round)}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }));
};
const C = (el, x = {}) => ({ el: [].concat(el), ...x });
const S = '(left|right) ';

/* ───────── piezas reutilizadas ───────── */

const SKELETON = [
  P('craneo', [/^(frontal bone|occipital bone|sphenoid bone|ethmoid|vomer)$/i, new RegExp(`^${S}(parietal bone|temporal bone|nasal bone|zygomatic bone|lacrimal bone|palatine bone|inferior nasal concha)$`, 'i'), /^(left |right )?maxilla$/i, /upper .*(tooth|incisor|canine|molar|premolar)/i], { mat: 'bone', sub: [{ re: /tooth|incisor|canine|molar/i, mat: 'tooth' }] }),
  P('mandibula', [/^mandible$/i, /lower .*(tooth|incisor|canine|molar|premolar)/i], { mat: 'bone', sub: [{ re: /tooth|incisor|canine|molar/i, mat: 'tooth' }] }),
  P('hioides', [], { mesh: once(/^hyoid bone$/i), mat: 'bone' }),
  P('columna', [/^((first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) (cervical|thoracic|lumbar) vertebra|atlas|axis)$/i, /^intervertebral disk/i], { mat: 'bone', sub: [{ re: /disk/i, mat: 'cartilage' }] }),
  P('sacro', [/^sacrum$/i], { mat: 'bone' }),
  P('coxis', [], { mesh: (c) => c.proc.coccyx(), mat: 'bone' }),
  P('costillas', [new RegExp(`^${S}(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib$`, 'i'), /costal cartilage/i], { mat: 'bone', sub: [{ re: /cartilage/i, mat: 'cartilage' }] }),
  P('esternon', [/^(manubrium|body of sternum|xiphoid process)$/i], { mat: 'bone' }),
  P('clavicula', [new RegExp(`^${S}clavicle$`, 'i')], { mat: 'bone' }),
  P('escapula', [new RegExp(`^${S}scapula$`, 'i')], { mat: 'bone' }),
  P('humero', [new RegExp(`^${S}humerus$`, 'i')], { mat: 'bone' }),
  P('radio', [new RegExp(`^${S}radius$`, 'i')], { mat: 'bone' }),
  P('cubito', [new RegExp(`^${S}ulna$`, 'i')], { mat: 'bone' }),
  P('carpo', [new RegExp(`^${S}(scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate)$`, 'i')], { mat: 'bone' }),
  P('metacarpo', [/metacarpal bone/i], { mat: 'bone' }),
  P('falanges-mano', [/phalanx of (left|right) (thumb|index finger|middle finger|ring finger|little finger)$/i], { mat: 'bone' }),
  P('coxal', [new RegExp(`^${S}hip bone$`, 'i')], { mat: 'bone' }),
  P('femur', [new RegExp(`^${S}femur$`, 'i')], { mat: 'bone' }),
  P('rotula', [new RegExp(`^${S}patella$`, 'i')], { mat: 'bone' }),
  P('tibia', [new RegExp(`^${S}tibia$`, 'i')], { mat: 'bone' }),
  P('perone', [new RegExp(`^${S}fibula$`, 'i')], { mat: 'bone' }),
  P('tarso', [new RegExp(`^${S}(talus|calcaneus|navicular bone of foot|cuboid bone|(medial|intermediate|lateral) cuneiform bone)$`, 'i'), /(navicular|cuboid|cuneiform)/i], { not: [/artery|vein|nerve|ligament|muscle/i], mat: 'bone' }),
  P('metatarso', [/metatarsal bone/i], { not: [/artery|vein|nerve|ligament/i], mat: 'bone' }),
  P('falanges-pie', [/phalanx of (left|right) (big|second|third|fourth|little) toe$/i], { mat: 'bone' }),
];

// Todo el esqueleto como contexto (se pinta detrás, no se toca).
const SKELETON_CTX = SKELETON.map((p) => ({ ...p, k: undefined, mat: p.mat, ctx: true }));

const RE_MUSCLE = /muscle|-is$|ius$|eus$|alis$|aris$|oid$|^(left|right) .*(longus|brevis|magnus|major|minor|maximus|medius|minimus|teres|quadratus|tertius|anterior|posterior|superior|inferior)$|platysma|digastric|sartorius|gracilis|pectineus|soleus|popliteus|supinator|anconeus|brachialis|coracobrachialis|piriformis|plantaris|iliacus|subclavius|trapezius|deltoid|rhomboid|serratus|intercostal|external oblique|head of|part of|scalenus|splenius|semispinalis|longissimus|iliocostalis|spinalis|multifidus|rotator|interspinal|intertransvers|levator|obturator|gemellus|lumbrical|interosse|opponens|abductor|adductor|flexor|extensor|tibialis|fibularis|biceps|triceps|vastus|rectus/i;
const NOT_MUSCLE = /artery|vein|nerve|venous|arterial|tendon of|ligament|branch|bone|vertebra|disk|cartilage|ganglion|plexus|lobe|gyrus|nucleus|duct|gland|eyeball|retina|lens|sclera|cornea|iris|choroid|chamber|valve|cusp|leaflet|papillary|atrium|ventricle|aorta|trunk|sinus|cavity|wall of|layer|membrane|retinaculum|tract|raphe|tooth|phalanx|rib$|lung|bronch|colon|ileum|jejunum|liver|stomach|tract|tongue|uvula|palat|pharyng|laryn|thyro-arytenoid|crico|arytenoid|vocalis|esophag|anal|levator ani|coccygeus|puborectalis|pubococcygeus|iliococcygeus|corpus|penis|hair|skin|lip$|eyebrow|ear$|intestin|mesen|taenia|vesicle|prostate|testis|epididymis|urethra|bladder|ureter|kidney|adrenal|spleen|pancrea|gallbladder|thymus|optic|chiasm|tentorium|ventricle|commissure|fornix|thalamus|colliculus|geniculate|habenula|amygdala|hippocampus|putamen|caudate|globus|insula|septum|cerebell|medulla|pons|midbrain|peduncle|capsule|stria|tuber|mammillary|pineal|pituitary|hypothalamus|lamina|foramen|fossa|interpeduncular|choroid plexus|white matter|cortex|lobule|ocular|rectus capitis|obliquus capitis|levator palpebrae|superior oblique|inferior oblique|medial rectus|lateral rectus|superior rectus|inferior rectus|trochlea|common tendinous ring|tarsal plate/i;

const MUSCLES_A = [
  P('frontal-m', [], { mesh: (c) => c.patch('frontal-m'), mat: 'muscle', fiber: [0, 0, 1] }),
  P('orbicular-ojos', [], { mesh: (c) => c.patch('orbicular-ojos'), mat: 'muscle', fiber: [1, 0, 0] }),
  P('orbicular-labios', [], { mesh: (c) => c.patch('orbicular-labios'), mat: 'muscle', fiber: [1, 0, 0] }),
  P('masetero', [], { mesh: (c) => c.patch('masetero'), mat: 'muscle', fiber: [0, 0.3, 1] }),
  P('temporal-m', [], { mesh: (c) => c.patch('temporal-m'), mat: 'muscle', fiber: [0, 0.4, 1] }),
  P('esternocleidomastoideo', [/sternocleidomastoid$/i], { mat: 'muscle', fiber: 'auto' }),
  P('trapecio', [/part of (left|right) trapezius$/i], { mat: 'muscle', fiber: 'auto' }),
  P('deltoides', [/part of (left|right) deltoid$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
  P('pectoral', [/(left|right) pectoralis major$/i, /part of (left|right) pectoralis major$/i], { mat: 'muscle', fiber: [1, 0, 0.35] }),
  P('serrato', [/(left|right) serratus anterior$/i], { mat: 'muscle', fiber: [0.2, 1, 0.3] }),
  P('biceps', [/head of (left|right) biceps brachii$/i], { mat: 'muscle', fiber: 'auto' }),
  P('triceps', [/head of (left|right) triceps brachii$/i], { mat: 'muscle', fiber: 'auto' }),
  P('braquiorradial', [/(left|right) brachioradialis$/i], { mat: 'muscle', fiber: 'auto' }),
  P('flexores-antebrazo', [/(left|right) (flexor carpi radialis|palmaris longus|flexor digitorum superficialis)$/i, /head of (left|right) (flexor carpi ulnaris|pronator teres)$/i], { mat: 'muscle', fiber: 'auto' }),
  P('extensores-antebrazo', [/(left|right) (extensor carpi radialis longus|extensor carpi radialis brevis|extensor carpi ulnaris|extensor digitorum|extensor digiti minimi|abductor pollicis longus|extensor pollicis brevis|extensor pollicis longus|anconeus)$/i], { mat: 'muscle', fiber: 'auto' }),
  P('recto-abdominal', [], { mesh: (c) => c.splitOblique().rectus, mat: 'muscle', fiber: [0, 0, 1] }),
  P('oblicuo', [], { mesh: (c) => c.splitOblique().oblique, mat: 'muscle', fiber: [0.6, 0, -0.8] }),
  P('intercostales', [/^(left |right )?(external|internal) intercostal muscle$/i], { mat: 'muscle', fiber: [1, 0, -0.6] }),
  P('iliopsoas', [/(left|right) (iliacus|psoas major)$/i], { mat: 'muscle', fiber: 'auto' }),
  P('tensor-fascia', [/(left|right) tensor fasciae latae$/i], { mat: 'muscle', fiber: 'auto' }),
  P('sartorio', [/(left|right) sartorius$/i], { mat: 'muscle', fiber: 'auto' }),
  P('cuadriceps', [/(left|right) (rectus femoris|vastus lateralis|vastus medialis|vastus intermedius)$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
  P('aductores', [/(left|right) (adductor longus|adductor magnus|adductor brevis|gracilis|pectineus)$/i], { mat: 'muscle', fiber: 'auto' }),
  P('tibial-anterior', [/(left|right) tibialis anterior$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
  P('peroneos', [/(left|right) fibularis (longus|brevis|tertius)$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
  P('gemelos', [/head of (left|right) gastrocnemius$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
  P('soleo', [/(left|right) soleus$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
];

const MUSCLES_P = [
  ...MUSCLES_A.filter((p) => ['esternocleidomastoideo', 'trapecio', 'deltoides', 'triceps', 'biceps', 'braquiorradial', 'flexores-antebrazo', 'extensores-antebrazo', 'oblicuo', 'gemelos', 'soleo', 'peroneos', 'aductores', 'temporal-m', 'masetero', 'sartorio'].includes(p.k)),
  P('dorsal-ancho', [], { mesh: (c) => c.patch('dorsal-ancho'), mat: 'muscle', fiber: [0.7, 0, 0.7] }),
  P('infraespinoso', [/(left|right) infraspinatus( muscle)?$/i], { mat: 'muscle', fiber: 'auto' }),
  P('redondo-mayor', [/(left|right) teres major$/i], { mat: 'muscle', fiber: 'auto' }),
  P('romboides', [/(left|right) rhomboid (major|minor)$/i], { mat: 'muscle', fiber: 'auto' }),
  P('erectores', [/(left|right) (iliocostalis (lumborum|thoracis|cervicis)|longissimus (thoracis|cervicis|capitis)|spinalis thoracis)$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
  P('gluteo-mayor', [/(left|right) gluteus maximus$/i], { mat: 'muscle', fiber: [1, 0, -0.8] }),
  P('gluteo-medio', [/(left|right) gluteus medius$/i], { mat: 'muscle', fiber: 'auto' }),
  P('isquiotibiales', [/head of (left|right) biceps femoris$/i, /(left|right) (semitendinosus|semimembranosus)$/i], { mat: 'muscle', fiber: [0, 0, 1] }),
  P('tendon-aquiles', [/(left|right) calcaneal tendon$/i], { mat: 'tendon', fiber: [0, 0, 1] }),
];

const MUSCLE_CTX = [
  // (sin el oblicuo externo: ya se pinta partido en recto del abdomen y oblicuo)
  C([RE_MUSCLE], { not: [NOT_MUSCLE, /platysma|external oblique/i], mat: 'muscle', color: '#a83a32', fiber: 'auto', ctx: true }),
  C([/iliotibial tract|linea alba|flexor retinaculum|extensor retinaculum/i], { mat: 'tendon', ctx: true }),
];

/* ───────── musculatura profunda (3.º-4.º ESO y Bachillerato) ───────── */

// Músculos que en mus-a / mus-p quedan tapados por los superficiales o van
// dentro de un grupo. Claves únicas y estables (las reutiliza el modelo 3D), sin
// repetir las de MUSCLES_A / MUSCLES_P. Las regex pillan los dos lados; cada
// lámina puede quedarse con uno (oneSide).
// grp = grupo del catálogo al que pertenece (structures.js): cuando ese grupo es
// una pieza de MUSCLES_A / MUSCLES_P (cuadriceps, isquiotibiales, aductores,
// gemelos, iliopsoas, erectores, flexores-antebrazo) estas piezas son parte de
// las suyas; 'manguito-rotador' solo existe en el catálogo.
const M = (k, el, x = {}) => P(k, el, { mat: 'muscle', fiber: 'auto', ...x });
const UP = [0, 0, 1];
export const MUSCLES_DEEP = [
  // cuello y nuca
  M('escalenos', [/^(left|right) scalenus (anterior|medius|posterior)$/i]),
  M('elevador-escapula', [/^(left|right) levator scapulae$/i]),
  M('esplenio', [/^(left|right) splenius (capitis|cervicis)$/i]),
  M('semiespinoso', [/^(left|right) semispinalis capitis$/i], { fiber: UP }),
  // hombro y brazo
  M('pectoral-menor', [/^(left|right) pectoralis minor$/i]),
  M('supraespinoso', [/^(left|right) supraspinatus$/i], { grp: 'manguito-rotador' }),
  M('subescapular', [/^(left|right) subscapularis$/i], { grp: 'manguito-rotador' }),
  M('redondo-menor', [/^(left|right) teres minor$/i], { grp: 'manguito-rotador' }),
  M('coracobraquial', [/^(left|right) coracobrachialis$/i]),
  M('braquial', [/^(left|right) brachialis$/i], { fiber: UP }),
  // antebrazo
  M('pronador-redondo', [/^(humeral|ulnar) head of (left|right) pronator teres$/i], { grp: 'flexores-antebrazo' }),
  M('supinador', [/^(left|right) supinator$/i]),
  M('flexor-profundo', [/^(left|right) flexor digitorum profundus$/i], { grp: 'flexores-antebrazo', fiber: UP }),
  M('flexor-largo-pulgar', [/^(left|right) flexor pollicis longus$/i], { grp: 'flexores-antebrazo', fiber: UP }),
  M('pronador-cuadrado', [/^(left|right) pronator quadratus$/i], { fiber: [1, 0, 0] }),
  // tronco
  M('psoas-mayor', [/^(left|right) psoas major$/i], { grp: 'iliopsoas' }),
  M('iliaco', [/^(left|right) iliacus$/i], { grp: 'iliopsoas' }),
  M('iliocostal', [/^(left|right) iliocostalis (lumborum|thoracis|cervicis)$/i], { grp: 'erectores', fiber: UP }),
  M('longisimo', [/^(left|right) longissimus (thoracis|cervicis|capitis)$/i], { grp: 'erectores', fiber: UP }),
  M('espinoso', [/^(left|right) spinalis thoracis$/i, /^spinalis$/i], { grp: 'erectores', fiber: UP }),
  // cadera
  M('gluteo-menor', [/^(left|right) gluteus minimus$/i]),
  M('piriforme', [/^(left|right) piriformis$/i]),
  // muslo
  M('recto-femoral', [/^(left|right) rectus femoris$/i], { grp: 'cuadriceps', fiber: UP }),
  M('vasto-lateral', [/^(left|right) vastus lateralis$/i], { grp: 'cuadriceps', fiber: UP }),
  M('vasto-medial', [/^(left|right) vastus medialis$/i], { grp: 'cuadriceps', fiber: UP }),
  M('vasto-intermedio', [/^(left|right) vastus intermedius$/i], { grp: 'cuadriceps', fiber: UP }),
  M('biceps-femoral', [/^(long|short) head of (left|right) biceps femoris$/i], { grp: 'isquiotibiales', fiber: UP }),
  M('semitendinoso', [/^(left|right) semitendinosus$/i], { grp: 'isquiotibiales', fiber: UP }),
  M('semimembranoso', [/^(left|right) semimembranosus$/i], { grp: 'isquiotibiales', fiber: UP }),
  M('aductor-mayor', [/^(left|right) adductor (magnus|minimus)$/i], { grp: 'aductores' }),
  M('aductor-largo', [/^(left|right) adductor longus$/i], { grp: 'aductores' }),
  M('aductor-corto', [/^(left|right) adductor brevis$/i], { grp: 'aductores' }),
  M('pectineo', [/^(left|right) pectineus$/i], { grp: 'aductores' }),
  M('gracil', [/^(left|right) gracilis$/i], { grp: 'aductores', fiber: UP }),
  // pierna
  M('gemelo-interno', [/^medial head of (left|right) gastrocnemius$/i], { grp: 'gemelos', fiber: UP }),
  M('gemelo-externo', [/^lateral head of (left|right) gastrocnemius$/i], { grp: 'gemelos', fiber: UP }),
  M('popliteo', [/^(left|right) popliteus$/i]),
  M('tibial-posterior', [/^(left|right) tibialis posterior$/i], { fiber: UP }),
  M('flexor-largo-dedos', [/^(left|right) flexor digitorum longus$/i], { fiber: UP }),
  M('flexor-largo-dedo-gordo', [/^(left|right) flexor hallucis longus$/i], { fiber: UP }),
  M('extensor-largo-dedos', [/^(left|right) extensor digitorum longus$/i], { fiber: UP }),
];

// Una pieza solo de un lado del sujeto ('left' | 'right').
const oneSide = (p, side) => ({ ...p, el: p.el.map((r) => new RegExp(r.source.replace(/\(left\|right\)/g, side), r.flags)) });
const DM = (k) => MUSCLES_DEEP.find((p) => p.k === k);
const SM = (k) => [...MUSCLES_A, ...MUSCLES_P].find((p) => p.k === k);

// Lo que tapa la capa profunda (no se pinta en mus-prof-a / mus-prof-p).
const SUPERFICIAL = /sternocleidomastoid|platysma|trapezius|deltoid|pectoralis major|external oblique|serratus posterior|gluteus maximus|biceps brachii|brachioradialis|flexor carpi radialis|palmaris longus|flexor digitorum superficialis|flexor carpi ulnaris|sartorius|tensor fasciae latae|gastrocnemius|plantaris/i;
const DEEP_CTX = (not) => [
  C([RE_MUSCLE], { not: [NOT_MUSCLE, SUPERFICIAL, /intercostal muscle/i, ...not], mat: 'muscle', color: '#a83a32', fiber: 'auto', ctx: true }),
  C([/flexor retinaculum|extensor retinaculum/i], { mat: 'tendon', ctx: true }),
];

// El modelo solo trae los intercostales del lado izquierdo: el derecho es su
// reflejo. Externos, internos e íntimos van en una sola malla (si no, sus
// superficies, casi iguales, se pisan y salen bordes en dientes de sierra).
const mirrorX = (m) => {
  const pos = new Float32Array(m.pos);
  for (let i = 0; i < pos.length; i += 3) pos[i] = -pos[i];
  const idx = new Uint32Array(m.idx);
  for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
  return { pos, idx };
};
const INTERCOSTAL = [/^(external|internal|innermost) intercostal muscle$/i];
const INTERCOSTALES_LR = [
  P('intercostales', [], { mesh: (c) => c.get(INTERCOSTAL), mat: 'muscle', fiber: [1, 0, -0.6] }),
  P('intercostales', [], { mesh: (c) => mirrorX(c.get(INTERCOSTAL)), mat: 'muscle', fiber: [-1, 0, -0.6] }),
];

// Vista anterior: en la pierna derecha del sujeto (izquierda de la lámina) se
// quitan también el recto femoral, el aductor largo y el pectíneo para ver el
// vasto intermedio y el aductor corto.
const MUSCLES_DEEP_A = [
  DM('escalenos'), DM('pectoral-menor'), SM('serrato'), ...INTERCOSTALES_LR, DM('subescapular'),
  DM('coracobraquial'), DM('braquial'), DM('pronador-redondo'), DM('supinador'), DM('flexor-profundo'),
  DM('flexor-largo-pulgar'), DM('pronador-cuadrado'),
  P('diafragma', [/^diaphragm$/i], { mat: 'muscle', color: '#b85a4c', fiber: 'auto' }),
  DM('psoas-mayor'), DM('iliaco'), SM('gluteo-medio'), DM('gluteo-menor'),
  oneSide(DM('recto-femoral'), 'left'), DM('vasto-lateral'), DM('vasto-medial'), DM('vasto-intermedio'),
  oneSide(DM('aductor-largo'), 'left'), oneSide(DM('pectineo'), 'left'), DM('aductor-corto'), DM('aductor-mayor'), DM('gracil'),
  SM('tibial-anterior'), DM('extensor-largo-dedos'), SM('peroneos'), SM('soleo'),
];
// Vista posterior: en el lado derecho del sujeto (derecha de la lámina) se
// quitan el glúteo medio, los gemelos y el sóleo para ver el glúteo menor, el
// poplíteo, el tibial posterior y los flexores largos.
const MUSCLES_DEEP_P = [
  DM('esplenio'), DM('semiespinoso'), DM('elevador-escapula'), SM('romboides'),
  DM('supraespinoso'), SM('infraespinoso'), DM('redondo-menor'), SM('redondo-mayor'), SM('triceps'), ...INTERCOSTALES_LR,
  DM('iliocostal'), DM('longisimo'), DM('espinoso'),
  oneSide(SM('gluteo-medio'), 'left'), DM('gluteo-menor'), DM('piriforme'),
  DM('biceps-femoral'), DM('semitendinoso'), DM('semimembranoso'), DM('aductor-mayor'), DM('gracil'), DM('vasto-lateral'),
  oneSide(DM('gemelo-interno'), 'left'), oneSide(DM('gemelo-externo'), 'left'), oneSide(SM('soleo'), 'left'), oneSide(SM('tendon-aquiles'), 'left'),
  DM('popliteo'), DM('tibial-posterior'), DM('flexor-largo-dedos'), DM('flexor-largo-dedo-gordo'),
];

/* ───────── vasos ───────── */

const ART = 'artery'; const VEIN = 'vein';
const vesselMat = (n) => (/pulmonary (trunk|artery|arterial)|segmental pulmonary artery|subsegmental pulmonary artery|lobar .*pulmonary artery/i.test(n) ? VEIN : /pulmonary vein/i.test(n) ? ART : /vein|venous|vena|sinus/i.test(n) ? VEIN : ART);

const VAS = [
  P('corazon', [/^(wall of (atrium|ventricle)|.*(atrium|ventricle)|.*auricle)$/i, /^heart$/i], { not: [/cavity|lateral ventricle|third ventricle|fourth ventricle|vein|artery/i], mat: 'organ', color: '#b33a32' }),
  P('aorta', [/^(ascending aorta|arch of aorta|descending thoracic aorta|descending aorta|thoracic aorta)$/i], { mat: ART, gp: 'arterias' }),
  P('aorta-abdominal', [/^abdominal aorta$/i], { mat: ART, gp: 'arterias' }),
  P('arteria-pulmonar', [/pulmonary trunk|(left|right) pulmonary artery$/i], { mat: VEIN, gp: 'arterias' }),
  P('venas-pulmonares', [/pulmonary vein$/i], { not: [/segmental|subsegmental|intrapulmonary/i], mat: ART, gp: 'venas' }),
  P('vena-cava-sup', [/^superior vena cava$/i], { mat: VEIN, gp: 'venas' }),
  P('vena-cava-inf', [/^inferior vena cava$/i], { mat: VEIN, gp: 'venas' }),
  P('carotida', [/(left|right) (common|internal|external) carotid artery$/i], { mat: ART, gp: 'arterias' }),
  P('yugular', [/(left|right) (internal|external) jugular vein$/i], { mat: VEIN, gp: 'venas' }),
  P('subclavia-a', [/(left|right) subclavian artery$/i], { mat: ART, gp: 'arterias' }),
  P('subclavia-v', [/(left|right) subclavian vein$/i, /(left|right) brachiocephalic vein$/i], { mat: VEIN, gp: 'venas' }),
  P('arteria-braquial', [/(left|right) (axillary|brachial) artery$/i], { mat: ART, gp: 'arterias' }),
  P('arteria-radial', [/(left|right) radial artery$/i], { mat: ART, gp: 'arterias' }),
  P('arteria-cubital', [/(left|right) ulnar artery$/i], { mat: ART, gp: 'arterias' }),
  P('vena-cefalica', [/(left|right) cephalic vein$/i], { mat: VEIN, gp: 'venas' }),
  P('vena-basilica', [/(left|right) basilic vein$/i], { mat: VEIN, gp: 'venas' }),
  P('iliacas-a', [/(left|right) (common|external|internal) iliac artery$/i], { mat: ART, gp: 'arterias' }),
  P('iliacas-v', [/(left|right) (common|external|internal) iliac vein$/i], { mat: VEIN, gp: 'venas' }),
  P('arteria-femoral', [/(left|right) (femoral|deep femoral|popliteal) artery$/i], { mat: ART, gp: 'arterias' }),
  P('vena-femoral', [/(left|right) (femoral|popliteal) vein$/i], { mat: VEIN, gp: 'venas' }),
  P('safena', [/(left|right) (great|long) saphenous vein$/i], { mat: VEIN, gp: 'venas' }),
  P('arterias-tibiales', [/(left|right) (anterior|posterior) tibial artery$/i, /(left|right) dorsalis pedis artery$/i], { mat: ART, gp: 'arterias' }),
  P('arteria-renal', [/(left|right) renal artery$/i], { mat: ART, gp: 'arterias' }),
  P('vena-renal', [/(left|right) renal vein$/i], { mat: VEIN, gp: 'venas' }),
  P('vena-porta', [/^(hepatic portal vein|portal vein)$/i], { mat: VEIN, gp: 'venas' }),
];
const VAS_CTX = [C([/artery|arterial|aorta|vein|venous|vena|arch$/i], { not: [/nerve|branch of .* nerve|plexus of nerve|hepato|segment [ivx]+$|segmental|lingular|basal|apical|lobar|hepatic artery|hepatic vein|(left|right) portal vein|branch of (left|right) portal/i], notConcept: ['FMA7197'], keepIn: /^(hepatic portal vein|portal vein)$/i, mat: 'auto-vessel', ctx: true })];

/* ───────── órganos ───────── */

const ORGANS_A = [
  P('cerebro', [/cerebral hemisphere|white matter of cerebral|gyrus|lobe$|lobule|insula|corpus callosum|cerebellum|pons|medulla oblongata|midbrain/i], { not: [/artery|vein|liver|lung|thymus|caudate lobe|branch/i], mat: 'brain', shape: true }),
  P('ojo', [/^(left|right) (sclera|iris|lens)$/i], { mat: 'organ', color: '#f1eee6', sub: [{ re: /iris/i, color: '#4f86b8' }, { re: /lens/i, color: '#1d2b3a' }], shape: true }),
  P('glandulas-salivales', [/(left|right) (submandibular|sublingual) gland$/i], { extra: (c) => c.proc.parotid(), mat: 'organ', color: '#d9a777' }),
  P('laringe', [/thyroid cartilage|cricoid cartilage|epiglottis|arytenoid cartilage/i], { not: [/muscle|ligament|membrane/i], mat: 'cartilage' }),
  P('tiroides', [], { mesh: (c) => c.proc.thyroid(), mat: 'organ', color: '#a8473a', shape: true }),
  P('traquea', [/^trachea$/i], { mat: 'cartilage', color: '#e1d0c2' }),
  P('esofago', [/^esophagus$/i], { mat: 'organ', color: '#d38c82' }),
  P('timo', [/lobe of thymus$/i], { mat: 'organ', color: '#e6c3ae' }),
  P('pulmones', [], { mesh: (c) => mergeLungs(c), mat: 'organ', color: '#e79aa4', shape: true }),
  P('corazon', [/^(wall of (atrium|ventricle)|.*auricle)$/i, /(left|right) (atrium|ventricle)$/i, /coronary|cardiac vein|great cardiac/i, /^(ascending aorta|pulmonary trunk|arch of aorta|superior vena cava)$/i], { not: [/cavity/i], mat: 'organ', color: '#b13c33', sub: [{ re: /coronary artery|aorta/i, mat: ART }, { re: /cardiac vein|vena cava|pulmonary trunk/i, mat: VEIN }], shape: true }),
  P('diafragma', [/^diaphragm$/i], { mat: 'muscle', color: '#b85a4c', fiber: 'auto' }),
  P('higado', [], { mesh: (c) => c.liver(), mat: 'organ', color: '#8a2c25', shape: true }),
  P('vesicula', [/^gallbladder$/i], { mat: 'organ', color: '#5d8f3f', shape: true }),
  P('estomago', [/^stomach$/i], { mat: 'organ', color: '#da8f86', shape: true }),
  P('bazo', [/^spleen$/i], { mat: 'organ', color: '#7d3150', shape: true }),
  P('pancreas', [/^(pancreas|parenchyma of pancreas)$/i], { mat: 'organ', color: '#e7c27c', shape: true }),
  P('intestino-delgado', [/^(duodenum|(proximal|middle|distal) part of (jejunum|ileum))$/i], { mat: 'organ', color: '#e9a68c', shape: true }),
  P('intestino-grueso', [/^(cecum|appendix|ascending colon|transverse colon|descending colon|rectum|ileocecal junction)$/i, /taenia/i], { extra: (c) => c.proc.sigmoid(), mat: 'organ', color: '#c88d6c', shape: true }),
  P('rinones', [/^(left|right) kidney$/i], { mat: 'organ', color: '#8c2f2c', shape: true }),
  P('suprarrenales', [/^(left|right) adrenal gland$/i], { mat: 'organ', color: '#e2ab45' }),
  P('ureteres', [/^(left|right) ureter$/i], { mat: 'organ', color: '#e2c19b' }),
  P('vejiga', [/^urinary bladder$/i], { mat: 'organ', color: '#e6b6a0', shape: true }),
];
const ORG = (k) => ORGANS_A.find((p) => p.k === k);

/* ───────── nervioso ───────── */

const NERV = [
  P('cerebro', [/cerebral hemisphere|white matter of cerebral|gyrus|lobe$|lobule|insula|corpus callosum/i], { not: [/artery|vein|liver|lung|thymus|caudate lobe|branch|occipital lobe of|cerebell/i], mat: 'brain' }),
  P('cerebelo', [/^cerebellum$/i], { mat: 'brain', color: '#d7a198' }),
  P('bulbo', [/^(medulla oblongata|pons|midbrain)$/i], { mat: 'brain', color: '#e3c1a8' }),
  P('medula-espinal', [], { mesh: (c) => c.proc.spinalCord(), mat: 'nerve', color: '#f1dc8a' }),
  P('nervios-raquideos', [], { mesh: (c) => c.nerve('raquideos'), mat: 'nerve', gp: 'nervios' }),
  P('plexo-braquial', [], { mesh: (c) => c.nerve('plexo'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-mediano', [], { mesh: (c) => c.nerve('mediano'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-cubital', [], { mesh: (c) => c.nerve('cubital'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-radial', [], { mesh: (c) => c.nerve('radial'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-femoral', [], { mesh: (c) => c.nerve('femoral'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-ciatico', [], { mesh: (c) => c.nerve('ciatico'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-tibial', [], { mesh: (c) => c.nerve('tibial'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-peroneo', [], { mesh: (c) => c.nerve('peroneo'), mat: 'nerve', gp: 'nervios' }),
  P('nervio-vago', [], { mesh: (c) => c.nerve('vago'), mat: 'nerve', gp: 'nervios' }),
  P('nervios-intercostales', [], { mesh: (c) => c.nerve('intercostales'), mat: 'nerve', gp: 'nervios' }),
];
const NV = (...keys) => NERV.filter((p) => keys.includes(p.k));

/* ───────── láminas ───────── */

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const ribs = (from, to) => new RegExp(`^${S}(${ORDINAL.slice(from - 1, to).join('|')}) rib$`, 'i');
const vert = (kind, from, to) => new RegExp(`^(${ORDINAL.slice(from - 1, to).join('|')}) ${kind} vertebra$`, 'i');

export const PLATES = [
  { id: 'cuerpo-a', view: 'anterior', frame: 'body', height: 1800, regions: 'anterior', parts: [] },
  { id: 'cuerpo-p', view: 'posterior', frame: 'body', height: 1800, regions: 'posterior', parts: [] },
  { id: 'esq-a', view: 'anterior', frame: 'body', height: 1800, parts: SKELETON, grow: 3 },
  { id: 'esq-p', view: 'posterior', frame: 'body', height: 1800, parts: SKELETON, grow: 3 },
  { id: 'mus-a', view: 'anterior', frame: 'body', height: 1800, parts: MUSCLES_A, context: [...MUSCLE_CTX, ...SKELETON_CTX.map((p) => ({ ...p, color: '#cdbf9f' }))], grow: 2 },
  { id: 'mus-p', view: 'posterior', frame: 'body', height: 1800, parts: MUSCLES_P, context: [...MUSCLE_CTX, ...SKELETON_CTX.map((p) => ({ ...p, color: '#cdbf9f' }))], grow: 2 },
  {
    id: 'mus-prof-a',
    view: 'anterior',
    frame: 'body',
    height: 1800,
    parts: MUSCLES_DEEP_A,
    context: [...DEEP_CTX([/^right (rectus femoris|adductor longus|pectineus)$/i]), ...SKELETON_CTX.map((p) => ({ ...p, color: '#cdbf9f' }))],
    grow: 2,
  },
  {
    id: 'mus-prof-p',
    view: 'posterior',
    frame: 'body',
    height: 1800,
    parts: MUSCLES_DEEP_P,
    context: [...DEEP_CTX([/^right (gluteus medius|soleus)$/i]), ...SKELETON_CTX.map((p) => ({ ...p, color: '#cdbf9f' }))],
    grow: 2,
  },
  // Perfil (lado izquierdo del sujeto: mira a la izquierda de la lámina).
  { id: 'esq-l', view: 'lateral-i', frame: 'body', height: 1800, parts: SKELETON, grow: 3 },
  {
    id: 'mus-l',
    view: 'lateral-i',
    frame: 'body',
    height: 1800,
    parts: [...new Map([...MUSCLES_A, ...MUSCLES_P].map((p) => [p.k, p])).values()],
    context: [...MUSCLE_CTX, ...SKELETON_CTX.map((p) => ({ ...p, color: '#cdbf9f' }))],
    grow: 2,
  },
  {
    id: 'org-a',
    view: 'anterior',
    frame: 'body',
    height: 1800,
    parts: ['cerebro', 'ojo', 'laringe', 'tiroides', 'traquea', 'esofago', 'timo', 'pulmones', 'corazon', 'higado', 'vesicula', 'estomago', 'bazo', 'pancreas', 'intestino-delgado', 'intestino-grueso', 'rinones', 'suprarrenales', 'ureteres', 'vejiga'].map(ORG),
    context: [C([/^(abdominal aorta|inferior vena cava|descending thoracic aorta)$/i], { mat: 'auto-vessel', ctx: true })],
    grow: 3,
  },
  {
    id: 'org-prof-a',
    view: 'anterior',
    frame: 'body',
    height: 1800,
    parts: [
      ORG('cerebro'), ORG('laringe'), ORG('tiroides'), ORG('traquea'),
      P('bronquios', [/main bronchus|lobar bronchus|bronchial tree|segmental bronchus/i], { not: [/artery|vein|branch of/i], mat: 'cartilage', color: '#dccab9' }),
      ORG('esofago'), ORG('corazon'), ORG('bazo'), ORG('pancreas'),
      P('duodeno', [/^duodenum$/i], { mat: 'organ', color: '#e9a68c' }),
      ORG('rinones'), ORG('suprarrenales'), ORG('ureteres'), ORG('vejiga'),
      P('aorta-abdominal', [/^(abdominal aorta|descending thoracic aorta)$/i], { mat: ART }),
      P('vena-cava-inf', [/^inferior vena cava$/i], { mat: VEIN }),
      P('arteria-renal', [/(left|right) renal artery$/i], { mat: ART }),
      P('vena-renal', [/(left|right) renal vein$/i], { mat: VEIN }),
      P('recto', [/^rectum$/i], { mat: 'organ', color: '#c88d6c' }),
    ],
    grow: 3,
  },
  { id: 'vas-a', view: 'anterior', frame: 'body', height: 1800, parts: VAS, context: VAS_CTX, grow: 5 },
  {
    id: 'nerv-a',
    view: 'anterior',
    frame: 'body',
    height: 1800,
    parts: NV('cerebro', 'cerebelo', 'bulbo', 'medula-espinal', 'nervios-raquideos', 'plexo-braquial', 'nervio-mediano', 'nervio-cubital', 'nervio-radial', 'nervio-femoral', 'nervio-vago', 'nervios-intercostales'),
    context: SKELETON_CTX.map((p) => ({ ...p, color: '#5d6b7c', dim: true })),
    bias: 600,
    grow: 6,
  },
  {
    id: 'nerv-p',
    view: 'posterior',
    frame: 'body',
    height: 1800,
    parts: NV('cerebro', 'cerebelo', 'bulbo', 'medula-espinal', 'nervios-raquideos', 'plexo-braquial', 'nervio-cubital', 'nervio-radial', 'nervio-ciatico', 'nervio-tibial', 'nervio-peroneo'),
    context: SKELETON_CTX.map((p) => ({ ...p, color: '#5d6b7c', dim: true })),
    bias: 600,
    grow: 6,
  },
  {
    id: 'craneo-a',
    view: 'anterior',
    frame: { pad: 14 },
    height: 1100,
    parts: [
      P('frontal', [/^frontal bone$/i], { mat: 'bone' }),
      P('parietal', [/(left|right) parietal bone$/i], { mat: 'bone' }),
      P('temporal', [/(left|right) temporal bone$/i], { mat: 'bone' }),
      P('esfenoides', [/^sphenoid bone$/i], { mat: 'bone' }),
      P('etmoides', [/^ethmoid$/i], { mat: 'bone' }),
      P('nasal', [/(left|right) nasal bone$/i], { mat: 'bone' }),
      P('lagrimal', [/(left|right) lacrimal bone$/i], { mat: 'bone' }),
      P('cigomatico', [/(left|right) zygomatic bone$/i], { mat: 'bone' }),
      P('maxilar', [/^(left |right )?maxilla$/i, /upper .*(tooth|incisor|canine|molar)/i], { mat: 'bone', sub: [{ re: /tooth|incisor|canine|molar/i, mat: 'tooth' }] }),
      P('vomer', [/^vomer$/i], { mat: 'bone' }),
      P('mandibula', [/^mandible$/i, /lower .*(tooth|incisor|canine|molar)/i], { mat: 'bone', sub: [{ re: /tooth|incisor|canine|molar/i, mat: 'tooth' }] }),
    ],
    context: [C([/^occipital bone$|palatine bone|inferior nasal concha/i], { mat: 'bone', ctx: true })],
    grow: 2,
  },
  {
    id: 'craneo-l',
    view: 'lateral-i',
    frame: { pad: 14 },
    height: 1000,
    parts: [
      P('frontal', [/^frontal bone$/i], { mat: 'bone' }),
      P('parietal', [/^left parietal bone$/i], { mat: 'bone' }),
      P('temporal', [/^left temporal bone$/i], { mat: 'bone' }),
      P('occipital', [/^occipital bone$/i], { mat: 'bone' }),
      P('esfenoides', [/^sphenoid bone$/i], { mat: 'bone' }),
      P('nasal', [/^left nasal bone$/i], { mat: 'bone' }),
      P('lagrimal', [/^left lacrimal bone$/i], { mat: 'bone' }),
      P('cigomatico', [/^left zygomatic bone$/i], { mat: 'bone' }),
      P('maxilar', [/^(left )?maxilla$/i, /upper .*(tooth|incisor|canine|molar)/i], { mat: 'bone', sub: [{ re: /tooth|incisor|canine|molar/i, mat: 'tooth' }] }),
      P('mandibula', [/^mandible$/i, /lower .*(tooth|incisor|canine|molar)/i], { mat: 'bone', sub: [{ re: /tooth|incisor|canine|molar/i, mat: 'tooth' }] }),
    ],
    context: [C([/^ethmoid$|^right .*(parietal|temporal|zygomatic|nasal|lacrimal) bone$|palatine bone|vomer|hyoid/i], { mat: 'bone', ctx: true })],
    grow: 2,
  },
  {
    id: 'columna-l',
    view: 'lateral-i',
    frame: { pad: 20 },
    height: 1500,
    parts: [
      P('atlas', [/^atlas$/i], { mat: 'bone' }),
      P('axis', [/^axis$/i], { mat: 'bone' }),
      P('cervicales', [vert('cervical', 3, 7)], { mat: 'bone' }),
      P('dorsales', [vert('thoracic', 1, 12)], { mat: 'bone' }),
      P('lumbares', [vert('lumbar', 1, 5)], { mat: 'bone' }),
      P('discos', [/^intervertebral disk/i], { mat: 'cartilage', color: '#9fc6d4' }),
      P('sacro', [/^sacrum$/i], { mat: 'bone' }),
      P('coxis', [], { mesh: (c) => c.proc.coccyx(), mat: 'bone' }),
    ],
    grow: 2,
  },
  {
    id: 'torax-a',
    view: 'anterior',
    frame: { pad: 16 },
    height: 1100,
    parts: [
      P('costillas-verdaderas', [ribs(1, 7)], { mat: 'bone' }),
      P('costillas-falsas', [ribs(8, 10)], { mat: 'bone' }),
      P('costillas-flotantes', [ribs(11, 12)], { mat: 'bone' }),
      P('cartilagos-costales', [/costal cartilage/i], { mat: 'cartilage' }),
      P('manubrio', [/^manubrium$/i], { mat: 'bone' }),
      P('cuerpo-esternon', [/^body of sternum$/i], { mat: 'bone' }),
      P('xifoides', [/^xiphoid process$/i], { mat: 'bone' }),
      P('clavicula', [/(left|right) clavicle$/i], { mat: 'bone' }),
      P('dorsales', [vert('thoracic', 1, 12)], { mat: 'bone' }),
    ],
    grow: 2,
  },
  {
    id: 'mano',
    view: 'posterior',
    frame: { pad: 10 },
    height: 1200,
    parts: [
      P('escafoides', [/^right scaphoid$/i], { mat: 'bone' }),
      P('semilunar', [/^right lunate$/i], { mat: 'bone' }),
      P('piramidal', [/^right triquetral$/i], { mat: 'bone' }),
      P('pisiforme', [/^right pisiform$/i], { mat: 'bone' }),
      P('trapecio-hueso', [/^right trapezium$/i], { mat: 'bone' }),
      P('trapezoide', [/^right trapezoid$/i], { mat: 'bone' }),
      P('grande', [/^right capitate$/i], { mat: 'bone' }),
      P('ganchoso', [/^right hamate$/i], { mat: 'bone' }),
      P('metacarpianos', [/right .*metacarpal bone|metacarpal bone of right/i], { mat: 'bone' }),
      P('falanges-proximales', [/^proximal phalanx of right (thumb|index finger|middle finger|ring finger|little finger)$/i], { mat: 'bone' }),
      P('falanges-medias', [/^middle phalanx of right (index finger|middle finger|ring finger|little finger)$/i], { mat: 'bone' }),
      P('falanges-distales', [/^distal phalanx of right (thumb|index finger|middle finger|ring finger|little finger)$/i], { mat: 'bone' }),
    ],
    context: [C([/^right (radius|ulna)$/i], { mat: 'bone', ctx: true, clipBelowWrist: true })],
    grow: 2,
  },
  {
    id: 'pie',
    view: 'superior',
    frame: { pad: 10 },
    height: 1200,
    parts: [
      P('astragalo', [/^right talus$/i], { mat: 'bone' }),
      P('calcaneo', [/^right calcaneus$/i], { mat: 'bone' }),
      P('navicular', [/navicular bone of right foot$/i], { mat: 'bone' }),
      P('cuboides', [/right cuboid bone$|cuboid bone of right/i], { mat: 'bone' }),
      P('cunas', [/right (medial|intermediate|lateral) cuneiform bone$|(medial|intermediate|lateral) cuneiform bone of right/i], { mat: 'bone' }),
      P('metatarsianos', [/right .*metatarsal bone|metatarsal bone of right/i], { mat: 'bone' }),
      P('falanges-pie-d', [/phalanx of right (big|second|third|fourth|little) toe$/i], { mat: 'bone' }),
    ],
    grow: 2,
  },
  {
    id: 'encefalo-l',
    view: 'lateral-i',
    frame: { pad: 10 },
    height: 1000,
    parts: [
      P('lobulo-frontal', [/^left (superior|middle|inferior) frontal gyrus$|^left precentral gyrus$|orbital gyrus/i], { mat: 'brain', color: '#e9b7a3' }),
      P('lobulo-parietal', [/^left (postcentral gyrus|superior parietal lobule|supramarginal gyrus|angular gyrus)$/i], { mat: 'brain', color: '#e3b8c6' }),
      P('lobulo-temporal', [/^(anterior|posterior) part of left superior temporal gyrus$|^left (middle|inferior) temporal gyrus$/i], { mat: 'brain', color: '#c9c1e3' }),
      P('lobulo-occipital', [/^left occipital lobe$/i], { mat: 'brain', color: '#bfdac9' }),
      P('cerebelo', [/^cerebellum$/i], { mat: 'brain', color: '#d6a59a' }),
      P('tronco-encefalico', [/^(medulla oblongata|pons|midbrain)$/i], { mat: 'brain', color: '#e6c8ad' }),
      P('medula-espinal', [], { mesh: (c) => c.proc.spinalCord(), mat: 'nerve', color: '#f1dc8a', clipZ: 'cerebellumMin' }),
    ],
    context: [C([/^left (insula|white matter of cerebral hemisphere)$|left cerebral hemisphere/i], { mat: 'brain', color: '#d8a6a0', ctx: true })],
    grow: 2,
  },
  {
    id: 'areas',
    view: 'lateral-i',
    frame: { pad: 10 },
    frameAll: true,
    height: 1000,
    parts: [
      P('area-motora', [/^left precentral gyrus$/i], { mat: 'brain', color: '#f08a7e' }),
      P('area-sensitiva', [/^left postcentral gyrus$/i], { mat: 'brain', color: '#f5b971' }),
      P('area-broca', [/^left inferior frontal gyrus$/i], { mat: 'brain', color: '#8fc6f0' }),
      P('area-wernicke', [/^posterior part of left superior temporal gyrus$/i], { mat: 'brain', color: '#a8e08c' }),
      P('area-auditiva', [/^anterior part of left superior temporal gyrus$/i], { mat: 'brain', color: '#d6a2f0' }),
      P('area-visual', [/^left occipital lobe$/i], { mat: 'brain', color: '#f3d36b' }),
    ],
    context: [C([/^left (superior|middle) frontal gyrus$|orbital gyrus|^left (superior parietal lobule|supramarginal gyrus|angular gyrus|middle temporal gyrus|inferior temporal gyrus|insula)$|^cerebellum$|^(medulla oblongata|pons|midbrain)$/i], { mat: 'brain', color: '#cdb1ad', ctx: true })],
    grow: 2,
  },
  {
    id: 'encefalo-s',
    view: 'lateral-d',
    frame: { pad: 10 },
    height: 1000,
    near: 0.5,
    parts: [
      P('cerebro', [/^left .*gyrus$|^left .*lobule$|^left occipital lobe$|orbital gyrus|^left insula$|^left white matter of cerebral hemisphere$/i], { not: [/artery|vein|branch/i], mat: 'brain', cut: '#ecc9bd' }),
      P('cuerpo-calloso', [/^corpus callosum$/i], { mat: 'brain', color: '#f3ead8', cut: '#f6efe0' }),
      P('talamo', [/^left thalamus$/i], { mat: 'brain', color: '#d79aa4', cut: '#d79aa4' }),
      P('hipotalamo', [/hypothalamus$/i], { mat: 'brain', color: '#c27fd6', cut: '#c27fd6' }),
      P('hipofisis', [/^pituitary gland$/i], { mat: 'organ', color: '#a868d6', cut: '#a868d6' }),
      P('pineal', [/^pineal body$/i], { mat: 'organ', color: '#8f6ad0', cut: '#8f6ad0' }),
      P('mesencefalo', [/^midbrain$/i], { mat: 'brain', color: '#e3b48a', cut: '#e3b48a' }),
      P('protuberancia', [/^pons$/i], { mat: 'brain', color: '#e6c48f', cut: '#e6c48f' }),
      P('bulbo', [/^medulla oblongata$/i], { mat: 'brain', color: '#efd79a', cut: '#efd79a' }),
      P('cerebelo', [/^cerebellum$/i], { mat: 'brain', color: '#d6a59a', cut: '#e0b3a8' }),
      P('medula-espinal', [], { mesh: (c) => c.proc.spinalCord(), mat: 'nerve', color: '#f1dc8a', cut: '#f4e4a4', clipZ: 'cerebellumMin' }),
    ],
    grow: 2,
  },
  {
    id: 'corazon-ext',
    view: 'anterior',
    frame: { pad: 12 },
    height: 1000,
    parts: [
      P('auricula-d', [/right atrium|right auricle|wall of right atrium/i], { not: [/cavity|vein|artery|valve/i], mat: 'organ', color: '#a8463e' }),
      P('auricula-i', [/left atrium|left auricle|wall of left atrium/i], { not: [/cavity|vein|artery|valve/i], mat: 'organ', color: '#a8463e' }),
      P('ventriculo-d', [], { mesh: (c) => c.heartWalls().d, mat: 'organ', color: '#b23c33' }),
      P('ventriculo-i', [], { mesh: (c) => c.heartWalls().i, mat: 'organ', color: '#a8332c' }),
      P('aorta', [/^(ascending aorta|arch of aorta)$/i], { mat: ART }),
      P('arteria-pulmonar', [/^pulmonary trunk$|^(left|right) pulmonary artery$/i], { mat: VEIN }),
      P('vena-cava-sup', [/^superior vena cava$/i], { mat: VEIN }),
      P('vena-cava-inf', [/^inferior vena cava$/i], { mat: VEIN, clipZ: 'heartMin' }),
      P('venas-pulmonares', [/(left|right) (superior|inferior) pulmonary vein$/i], { mat: ART }),
      P('coronarias', [/coronary artery|interventricular branch|circumflex branch of left coronary|marginal branch of right coronary|ventricular branch of right coronary|diagonal branch|conus branch/i], { not: [/vein/i], mat: ART, clipBox: 'heart' }),
    ],
    context: [C([/cardiac vein|coronary sinus/i], { mat: 'auto-vessel', ctx: true, clipBox: 'heart' })],
    grow: 3,
  },
  {
    id: 'pulmones-a',
    view: 'anterior',
    frame: { pad: 14 },
    height: 1000,
    parts: [
      P('lobulo-sup-d', [], { mesh: (c) => c.lungs()['lobulo-sup-d'], mat: 'organ', color: '#eaa0aa' }),
      P('lobulo-medio', [], { mesh: (c) => c.lungs()['lobulo-medio'], mat: 'organ', color: '#f2b6bd' }),
      P('lobulo-inf-d', [], { mesh: (c) => c.lungs()['lobulo-inf-d'], mat: 'organ', color: '#de8f9b' }),
      P('lobulo-sup-i', [], { mesh: (c) => c.lungs()['lobulo-sup-i'], mat: 'organ', color: '#eaa0aa' }),
      P('lobulo-inf-i', [], { mesh: (c) => c.lungs()['lobulo-inf-i'], mat: 'organ', color: '#de8f9b' }),
      P('traquea', [/^trachea$/i], { mat: 'cartilage', color: '#e1d0c2' }),
      P('laringe', [/thyroid cartilage|cricoid cartilage|epiglottis/i], { not: [/muscle|ligament|membrane/i], mat: 'cartilage' }),
    ],
    grow: 3,
  },
  {
    id: 'bronquios-a',
    view: 'anterior',
    frame: { pad: 14 },
    height: 1000,
    parts: [
      P('traquea', [/^trachea$/i], { mat: 'cartilage', color: '#e1d0c2' }),
      P('bronquios', [/main bronchus/i], { mat: 'cartilage', color: '#dccab9' }),
      P('bronquiolos', [/bronchial tree|lobar bronchus|segmental bronchus/i], { not: [/artery|vein|branch of/i], mat: 'cartilage', color: '#e8c3b8' }),
      P('laringe', [/thyroid cartilage|cricoid cartilage|epiglottis/i], { not: [/muscle|ligament|membrane/i], mat: 'cartilage' }),
    ],
    context: [{ el: [], mesh: (c) => mergeLungs(c), mat: 'holo-lung', ctx: true, behind: true }],
    grow: 3,
  },
  {
    id: 'digestivo-a',
    view: 'anterior',
    frame: { pad: 16 },
    height: 1500,
    parts: [
      P('dientes', [/(upper|lower) .*(tooth|incisor|canine|molar|premolar)/i], { mat: 'tooth' }),
      P('lengua', [/^tongue$/i], { mat: 'organ', color: '#d77a7a' }),
      P('glandulas-salivales', [/(left|right) (submandibular|sublingual) gland$/i], { mat: 'organ', color: '#d9a777' }),
      P('faringe', [/(superior|middle|inferior) pharyngeal constrictor$/i], { mat: 'organ', color: '#c97e78' }),
      P('esofago', [/^esophagus$/i], { mat: 'organ', color: '#d38c82' }),
      P('higado', [], { mesh: (c) => c.liver(), mat: 'organ', color: '#8a2c25' }),
      P('vesicula', [/^gallbladder$/i], { mat: 'organ', color: '#5d8f3f' }),
      P('estomago', [/^stomach$/i], { mat: 'organ', color: '#da8f86' }),
      P('pancreas', [/^(pancreas|parenchyma of pancreas)$/i], { mat: 'organ', color: '#e7c27c' }),
      P('duodeno', [/^duodenum$/i], { mat: 'organ', color: '#eeb092' }),
      P('yeyuno', [/^(proximal|middle|distal) part of jejunum$/i], { mat: 'organ', color: '#e9a68c' }),
      P('ileon', [/^(proximal|middle|distal) part of ileum$/i], { mat: 'organ', color: '#e29b85' }),
      P('ciego', [/^cecum$|ileocecal junction/i], { mat: 'organ', color: '#c88d6c' }),
      P('apendice', [/^appendix$/i], { mat: 'organ', color: '#b97a5b' }),
      P('colon-ascendente', [/^ascending colon$/i], { mat: 'organ', color: '#c88d6c' }),
      P('colon-transverso', [/^transverse colon$/i], { mat: 'organ', color: '#cf9774' }),
      P('colon-descendente', [/^descending colon$/i], { mat: 'organ', color: '#c88d6c' }),
      P('colon-sigmoide', [], { mesh: (c) => c.proc.sigmoid(), mat: 'organ', color: '#c08466' }),
      P('recto', [/^rectum$/i], { mat: 'organ', color: '#b97a5b' }),
      P('ano', [], { mesh: (c) => c.proc.anus(), mat: 'organ', color: '#a96a52' }),
    ],
    grow: 3,
  },
];

export const MUSCLE_RE = { RE_MUSCLE, NOT_MUSCLE };
export const VESSEL_MAT = vesselMat;
// Piezas reutilizadas por el modelo 3D (tools/anatomy/model3d.mjs).
export { P, C, S, SKELETON, MUSCLES_A, MUSCLES_P, MUSCLE_CTX, VAS, VAS_CTX, ORGANS_A, NERV, ART, VEIN };
