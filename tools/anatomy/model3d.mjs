// Modelo 3D del cuerpo humano (tools/build-anatomy-3d.mjs): qué piezas de
// BodyParts3D forman cada capa y con qué clave del catálogo.
//
// Cada capa se exporta como un único GLB (una sola llamada de dibujo) donde cada
// vértice lleva el número de su pieza. Una pieza = (clave, lado) con todas sus
// mallas unidas. `up`: claves que la contienen (frontal → cráneo), para que
// «toca el cráneo» acepte cualquiera de sus huesos.
//
// part: { k, el, not?, mesh?(ctx), extra?(ctx), mat, color?, sub?, up?, side?: false (no partir por lados) }
// Las piezas se reclaman en orden: las finas primero y al final la del grupo, que
// se queda con lo que sobre. k: null = contexto (se ve, pero no se toca).

import * as PL from './plates.mjs';
import { mergeMeshes } from './meshes.mjs';
import { STRUCTURES } from '../../src/apps/_shared/anatomia/data/structures.js';

const BY_KEY_GRP = Object.fromEntries(STRUCTURES.map((s) => [s.k, s.grp]));

const { P, C, S, SKELETON, MUSCLES_A, MUSCLES_P, MUSCLE_CTX, VAS, VAS_CTX, ORGANS_A, NERV, ART, VEIN } = PL;
// Músculos profundos (los añade la ampliación de musculatura; puede no existir aún).
const MUSCLES_DEEP = PL.MUSCLES_DEEP || [];

const up = (...k) => ({ up: k });
const SK = (k) => SKELETON.find((p) => p.k === k);
const ORG = (k) => ORGANS_A.find((p) => p.k === k);
const NV = (k) => NERV.find((p) => p.k === k);
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const ribs = (a, b) => new RegExp(`^${S}(${ORD.slice(a - 1, b).join('|')}) rib$`, 'i');
const vert = (kind, a, b) => new RegExp(`^(${ORD.slice(a - 1, b).join('|')}) ${kind} vertebra$`, 'i');
const TOOTH = /tooth|incisor|canine|molar/i;
const bone = (k, el, x = {}) => P(k, el, { mat: 'bone', ...x });

/* ───────── esqueleto ───────── */

const SKELETON_3D = [
  // cráneo
  bone('frontal', [/^frontal bone$/i], up('craneo')),
  bone('parietal', [new RegExp(`^${S}parietal bone$`, 'i')], up('craneo')),
  bone('temporal', [new RegExp(`^${S}temporal bone$`, 'i')], up('craneo')),
  bone('occipital', [/^occipital bone$/i], up('craneo')),
  bone('esfenoides', [/^sphenoid bone$/i], up('craneo')),
  bone('etmoides', [/^ethmoid$/i], up('craneo')),
  bone('nasal', [new RegExp(`^${S}nasal bone$`, 'i')], up('craneo')),
  bone('lagrimal', [new RegExp(`^${S}lacrimal bone$`, 'i')], up('craneo')),
  bone('cigomatico', [new RegExp(`^${S}zygomatic bone$`, 'i')], up('craneo')),
  bone('vomer', [/^vomer$/i], up('craneo')),
  bone('maxilar', [/^(left |right )?maxilla$/i], up('craneo')),
  P('dientes', [/upper .*(tooth|incisor|canine|molar|premolar)/i], { mat: 'tooth', up: ['maxilar', 'craneo'], side: false }),
  bone('craneo', [/palatine bone|inferior nasal concha/i]),
  bone('mandibula', [/^mandible$/i]),
  P('dientes', [/lower .*(tooth|incisor|canine|molar|premolar)/i], { mat: 'tooth', up: ['mandibula'], side: false }),
  { ...SK('hioides') },
  // columna
  bone('atlas', [/^atlas$/i], up('cervicales', 'columna')),
  bone('axis', [/^axis$/i], up('cervicales', 'columna')),
  bone('cervicales', [vert('cervical', 3, 7)], up('columna')),
  bone('dorsales', [vert('thoracic', 1, 12)], up('columna')),
  bone('lumbares', [vert('lumbar', 1, 5)], up('columna')),
  P('discos', [/^intervertebral disk/i], { mat: 'cartilage', color: '#9fc6d4', up: ['columna'] }),
  bone('sacro', [/^sacrum$/i], up('columna')),
  { ...SK('coxis'), up: ['columna'] },
  // tórax
  bone('costillas-verdaderas', [ribs(1, 7)], up('costillas')),
  bone('costillas-falsas', [ribs(8, 10)], up('costillas')),
  bone('costillas-flotantes', [ribs(11, 12)], up('costillas')),
  P('cartilagos-costales', [/costal cartilage/i], { mat: 'cartilage', up: ['costillas'] }),
  bone('manubrio', [/^manubrium$/i], up('esternon')),
  bone('cuerpo-esternon', [/^body of sternum$/i], up('esternon')),
  bone('xifoides', [/^xiphoid process$/i], up('esternon')),
  // miembro superior
  { ...SK('clavicula') }, { ...SK('escapula') }, { ...SK('humero') }, { ...SK('radio') }, { ...SK('cubito') },
  bone('escafoides', [new RegExp(`^${S}scaphoid$`, 'i')], up('carpo')),
  bone('semilunar', [new RegExp(`^${S}lunate$`, 'i')], up('carpo')),
  bone('piramidal', [new RegExp(`^${S}triquetral$`, 'i')], up('carpo')),
  bone('pisiforme', [new RegExp(`^${S}pisiform$`, 'i')], up('carpo')),
  bone('trapecio-hueso', [new RegExp(`^${S}trapezium$`, 'i')], up('carpo')),
  bone('trapezoide', [new RegExp(`^${S}trapezoid$`, 'i')], up('carpo')),
  bone('grande', [new RegExp(`^${S}capitate$`, 'i')], up('carpo')),
  bone('ganchoso', [new RegExp(`^${S}hamate$`, 'i')], up('carpo')),
  bone('metacarpianos', [/metacarpal bone/i], up('metacarpo')),
  bone('falanges-proximales', [/^proximal phalanx of (left|right) (thumb|index finger|middle finger|ring finger|little finger)$/i], up('falanges-mano')),
  bone('falanges-medias', [/^middle phalanx of (left|right) (index finger|middle finger|ring finger|little finger)$/i], up('falanges-mano')),
  bone('falanges-distales', [/^distal phalanx of (left|right) (thumb|index finger|middle finger|ring finger|little finger)$/i], up('falanges-mano')),
  // miembro inferior
  { ...SK('coxal') }, { ...SK('femur') }, { ...SK('rotula') }, { ...SK('tibia') }, { ...SK('perone') },
  bone('astragalo', [new RegExp(`^${S}talus$`, 'i')], up('tarso')),
  bone('calcaneo', [new RegExp(`^${S}calcaneus$`, 'i')], up('tarso')),
  bone('navicular', [/navicular bone of (left|right) foot$|^(left|right) navicular bone of foot$/i], up('tarso')),
  bone('cuboides', [/(left|right) cuboid bone$|cuboid bone of (left|right)/i], up('tarso')),
  bone('cunas', [/(left|right) (medial|intermediate|lateral) cuneiform bone$|(medial|intermediate|lateral) cuneiform bone of (left|right)/i], up('tarso')),
  { ...SK('tarso') },
  bone('metatarsianos', [/metatarsal bone/i], { not: [/artery|vein|nerve|ligament/i], up: ['metatarso'] }),
  { ...SK('falanges-pie') },
];

/* ───────── músculos ───────── */

// Los que quedan debajo de otros pasan a la capa profunda.
const DEEP_FROM_SUPERFICIAL = ['iliopsoas', 'intercostales', 'romboides', 'erectores'];
const SUPERFICIAL = [...MUSCLES_A, ...MUSCLES_P.filter((p) => !MUSCLES_A.some((a) => a.k === p.k))];
const SUP_GROUPS = new Set(SUPERFICIAL.map((p) => p.k).filter((k) => !DEEP_FROM_SUPERFICIAL.includes(k)));
// Los músculos sueltos de un grupo superficial (recto femoral → cuádriceps) van en la
// capa superficial y antes que su grupo, que se queda con lo que sobre.
const grpOf = (spec) => spec.grp || BY_KEY_GRP[spec.k];
const MUSCLES_SUP_3D = [
  ...MUSCLES_DEEP.filter((p) => SUP_GROUPS.has(grpOf(p))),
  ...SUPERFICIAL.filter((p) => !DEEP_FROM_SUPERFICIAL.includes(p.k)),
];
const MUSCLES_DEEP_3D = [
  ...MUSCLES_DEEP.filter((p) => !SUP_GROUPS.has(grpOf(p))),
  ...SUPERFICIAL.filter((p) => DEEP_FROM_SUPERFICIAL.includes(p.k)),
];

/* ───────── órganos ───────── */

const lobe = (k, re, color) => P(k, [re], { mat: 'brain', color, up: ['cerebro'] });
const BRAIN_3D = [
  P('area-motora', [/^(left|right) precentral gyrus$/i], { mat: 'brain', color: '#e9b7a3', up: ['lobulo-frontal', 'cerebro'] }),
  P('area-broca', [/^left inferior frontal gyrus$/i], { mat: 'brain', color: '#e9b7a3', up: ['lobulo-frontal', 'cerebro'] }),
  lobe('lobulo-frontal', /^(left|right) (superior|middle|inferior) frontal gyrus$|orbital gyrus|^(left|right) (medial frontal|frontal pole|gyrus rectus|paracentral)/i, '#e9b7a3'),
  P('area-sensitiva', [/^(left|right) postcentral gyrus$/i], { mat: 'brain', color: '#e3b8c6', up: ['lobulo-parietal', 'cerebro'] }),
  lobe('lobulo-parietal', /^(left|right) (superior parietal lobule|supramarginal gyrus|angular gyrus|precuneus)/i, '#e3b8c6'),
  P('area-wernicke', [/^posterior part of left superior temporal gyrus$/i], { mat: 'brain', color: '#c9c1e3', up: ['lobulo-temporal', 'cerebro'] }),
  P('area-auditiva', [/^anterior part of left superior temporal gyrus$/i], { mat: 'brain', color: '#c9c1e3', up: ['lobulo-temporal', 'cerebro'] }),
  lobe('lobulo-temporal', /^(anterior|posterior) part of (left|right) superior temporal gyrus$|^(left|right) (middle|inferior) temporal gyrus$|^(left|right) (fusiform|parahippocampal)/i, '#c9c1e3'),
  P('area-visual', [/^(left|right) occipital lobe$/i], { mat: 'brain', color: '#bfdac9', up: ['lobulo-occipital', 'cerebro'] }),
  P('cuerpo-calloso', [/^corpus callosum$/i], { mat: 'brain', color: '#f3ead8', up: ['cerebro'], side: false }),
  P('talamo', [/^(left|right) thalamus$/i], { mat: 'brain', color: '#d79aa4', up: ['cerebro'] }),
  P('hipotalamo', [/hypothalamus$/i], { mat: 'brain', color: '#c27fd6', side: false }),
  P('hipofisis', [/^pituitary gland$/i], { mat: 'organ', color: '#a868d6' }),
  P('pineal', [/^pineal body$/i], { mat: 'organ', color: '#8f6ad0' }),
  P('cerebelo', [/^cerebellum$/i], { mat: 'brain', color: '#d6a59a', side: false }),
  P('mesencefalo', [/^midbrain$/i], { mat: 'brain', color: '#e3b48a', up: ['tronco-encefalico'] }),
  P('protuberancia', [/^pons$/i], { mat: 'brain', color: '#e6c48f', up: ['tronco-encefalico'] }),
  P('bulbo', [/^medulla oblongata$/i], { mat: 'brain', color: '#efd79a', up: ['tronco-encefalico'] }),
  P('cerebro', [/cerebral hemisphere|white matter of cerebral|gyrus|lobe$|lobule|insula/i], { not: [/artery|vein|liver|lung|thymus|caudate lobe|branch|pituitary|prostate|thyroid|mammary|ear\b|auricle/i], mat: 'brain', color: '#dcaaa4' }),
];

const lung = (k) => P(k, [], { mesh: (c) => c.lungs()[k], mat: 'organ', color: '#e79aa4', up: ['pulmones'], side: false });
const gut = (k, el, color, x = {}) => P(k, el, { mat: 'organ', color, ...x });

const ORGANS_3D = [
  ...BRAIN_3D,
  { ...ORG('ojo') },
  { ...ORG('glandulas-salivales') },
  { ...ORG('laringe') }, { ...ORG('tiroides') }, { ...ORG('traquea') },
  P('bronquios', [/main bronchus|lobar bronchus|bronchial tree|segmental bronchus/i], { not: [/artery|vein|branch of/i], mat: 'cartilage', color: '#dccab9', up: ['pulmones'], side: false }),
  ...['lobulo-sup-d', 'lobulo-medio', 'lobulo-inf-d', 'lobulo-sup-i', 'lobulo-inf-i'].map(lung),
  // corazón por partes (las paredes de los ventrículos vienen en una sola malla)
  P('valvula-mitral', [/leaflet of mitral valve/i], { mat: 'organ', color: '#f1d9c6', up: ['corazon'], side: false }),
  P('valvula-tricuspide', [/leaflet of tricuspid valve/i], { mat: 'organ', color: '#f1d9c6', up: ['corazon'], side: false }),
  P('valvula-aortica', [/cusp of aortic valve/i], { mat: 'organ', color: '#f1d9c6', up: ['corazon'], side: false }),
  P('valvula-pulmonar', [/cusp of pulmonary valve/i], { mat: 'organ', color: '#f1d9c6', up: ['corazon'], side: false }),
  P('auricula-d', [/right atrium|right auricle|wall of right atrium/i], { not: [/cavity|vein|artery|valve/i], mat: 'organ', color: '#a8463e', up: ['corazon'], side: false }),
  P('auricula-i', [/left atrium|left auricle|wall of left atrium/i], { not: [/cavity|vein|artery|valve/i], mat: 'organ', color: '#a8463e', up: ['corazon'], side: false }),
  P('ventriculo-d', [], { mesh: (c) => c.heartWalls().d, mat: 'organ', color: '#b23c33', up: ['corazon'], side: false }),
  P('ventriculo-i', [], { mesh: (c) => c.heartWalls().i, mat: 'organ', color: '#a8332c', up: ['corazon'], side: false }),
  P('coronarias', [/coronary artery|interventricular branch|circumflex branch of left coronary|marginal branch of right coronary|ventricular branch of right coronary|diagonal branch|conus branch/i], { not: [/vein/i], mat: ART, up: ['corazon'], side: false }),
  P('corazon', [/cardiac vein|coronary sinus/i], { mat: VEIN, side: false }),
  { ...ORG('esofago') }, { ...ORG('timo'), side: false }, { ...ORG('diafragma'), side: false },
  { ...ORG('higado'), side: false }, { ...ORG('vesicula') }, { ...ORG('estomago') }, { ...ORG('bazo') }, { ...ORG('pancreas') },
  gut('duodeno', [/^duodenum$/i], '#eeb092', up('intestino-delgado')),
  gut('yeyuno', [/^(proximal|middle|distal) part of jejunum$/i], '#e9a68c', up('intestino-delgado')),
  gut('ileon', [/^(proximal|middle|distal) part of ileum$/i], '#e29b85', up('intestino-delgado')),
  gut('ciego', [/^cecum$|ileocecal junction/i], '#c88d6c', up('intestino-grueso')),
  gut('apendice', [/^appendix$/i], '#b97a5b', up('intestino-grueso')),
  gut('colon-ascendente', [/^ascending colon$/i], '#c88d6c', up('intestino-grueso')),
  gut('colon-transverso', [/^transverse colon$/i], '#cf9774', up('intestino-grueso')),
  gut('colon-descendente', [/^descending colon$/i], '#c88d6c', up('intestino-grueso')),
  gut('colon-sigmoide', [], '#c08466', { mesh: (c) => c.proc.sigmoid(), up: ['intestino-grueso'], side: false }),
  gut('recto', [/^rectum$/i], '#b97a5b', up('intestino-grueso')),
  gut('ano', [], '#a96a52', { mesh: (c) => c.proc.anus(), up: ['intestino-grueso'], side: false }),
  gut('intestino-grueso', [/taenia/i], '#c88d6c'),
  { ...ORG('rinones') }, { ...ORG('suprarrenales') }, { ...ORG('ureteres') }, { ...ORG('vejiga') },
];

/* ───────── vasos y nervios ───────── */

const VAS_3D = [
  ...VAS.filter((p) => p.k !== 'corazon').map((p) => ({ ...p, up: [p.gp === 'venas' ? 'venas' : 'arterias'] })),
  ...VAS_CTX,
];
const NERV_3D = NERV.filter((p) => !['cerebro', 'cerebelo', 'bulbo'].includes(p.k)).map((p) => ({ ...p, up: p.gp ? ['nervios'] : [] }));

/* ───────── capas ───────── */

// order: de fuera a dentro (deslizador de capas). system: color del botón.
export const LAYERS_3D = [
  { id: 'piel', regions: true },
  { id: 'musculos', parts: MUSCLES_SUP_3D, context: [] },
  { id: 'musculos-prof', parts: MUSCLES_DEEP_3D, context: MUSCLE_CTX },
  { id: 'organos', parts: ORGANS_3D, context: [] },
  { id: 'vasos', parts: VAS_3D, context: [] },
  { id: 'nervios', parts: NERV_3D, context: [] },
  { id: 'esqueleto', parts: SKELETON_3D, context: [] },
];

export { mergeMeshes, C, TOOTH };
