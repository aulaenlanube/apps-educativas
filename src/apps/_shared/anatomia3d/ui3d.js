// Textos del visor 3D del cuerpo humano (castellano, inglés, valenciano).
export const UI3D = {
  es: {
    layers: 'Capas',
    stops: { piel: 'Piel', musculos: 'Músculos', 'musculos-prof': 'Músculos profundos', organos: 'Órganos', esqueleto: 'Esqueleto' },
    vessels: 'Vasos sanguíneos',
    nerves: 'Nervios',
    xray: 'Rayos X',
    xrayHelp: 'Pasa el dedo o el ratón por el cuerpo para ver lo que hay debajo.',
    cut: 'Corte',
    cutAxes: { x: 'Sagital', z: 'Frontal', y: 'Transversal' },
    cutOff: 'Sin corte',
    explode: 'Despiece',
    beat: 'Latido y respiración',
    reset: 'Ver todo el cuerpo',
    search: 'Busca una estructura…',
    isolate: 'Aislar',
    center: 'Centrar',
    showAll: 'Ver todo',
    inside: 'Ver por dentro',
    tapHint: 'Toca una estructura para ver qué es. Gira con un dedo y amplía con dos.',
    tapHintMouse: 'Haz clic en una estructura para ver qué es. Arrastra para girar y usa la rueda para ampliar.',
    loading: 'Cargando el modelo 3D…',
    error: 'No se ha podido cargar el modelo 3D.',
    noWebgl: 'Este dispositivo no puede mostrar el modelo 3D. Usa las láminas.',
    detail: 'Alta definición',
    left: 'izquierdo', right: 'derecho', leftF: 'izquierda', rightF: 'derecha',
    rotate: 'Girar', zoomIn: 'Acercar', zoomOut: 'Alejar',
    credits: 'Modelo 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).',
  },
  en: {
    layers: 'Layers',
    stops: { piel: 'Skin', musculos: 'Muscles', 'musculos-prof': 'Deep muscles', organos: 'Organs', esqueleto: 'Skeleton' },
    vessels: 'Blood vessels',
    nerves: 'Nerves',
    xray: 'X-ray',
    xrayHelp: 'Move your finger or mouse over the body to see what lies underneath.',
    cut: 'Section',
    cutAxes: { x: 'Sagittal', z: 'Frontal', y: 'Transverse' },
    cutOff: 'No section',
    explode: 'Exploded view',
    beat: 'Heartbeat and breathing',
    reset: 'Whole body',
    search: 'Search for a structure…',
    isolate: 'Isolate',
    center: 'Centre',
    showAll: 'Show all',
    inside: 'See inside',
    tapHint: 'Tap a structure to see what it is. Turn with one finger and zoom with two.',
    tapHintMouse: 'Click a structure to see what it is. Drag to turn and use the wheel to zoom.',
    loading: 'Loading the 3D model…',
    error: 'The 3D model could not be loaded.',
    noWebgl: 'This device cannot show the 3D model. Use the plates instead.',
    detail: 'High definition',
    left: 'left', right: 'right', leftF: 'left', rightF: 'right',
    rotate: 'Turn', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    credits: '3D model: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).',
  },
  va: {
    layers: 'Capes',
    stops: { piel: 'Pell', musculos: 'Músculs', 'musculos-prof': 'Músculs profunds', organos: 'Òrgans', esqueleto: 'Esquelet' },
    vessels: 'Vasos sanguinis',
    nerves: 'Nervis',
    xray: 'Raigs X',
    xrayHelp: 'Passa el dit o el ratolí pel cos per a veure el que hi ha davall.',
    cut: 'Tall',
    cutAxes: { x: 'Sagital', z: 'Frontal', y: 'Transversal' },
    cutOff: 'Sense tall',
    explode: 'Desmuntatge',
    beat: 'Batec i respiració',
    reset: 'Veure tot el cos',
    search: 'Busca una estructura…',
    isolate: 'Aïllar',
    center: 'Centrar',
    showAll: 'Veure-ho tot',
    inside: 'Veure per dins',
    tapHint: "Toca una estructura per a veure què és. Gira amb un dit i amplia amb dos.",
    tapHintMouse: "Fes clic en una estructura per a veure què és. Arrossega per a girar i usa la roda per a ampliar.",
    loading: 'Carregant el model 3D…',
    error: "No s'ha pogut carregar el model 3D.",
    noWebgl: 'Aquest dispositiu no pot mostrar el model 3D. Usa les làmines.',
    detail: 'Alta definició',
    left: 'esquerre', right: 'dret', leftF: 'esquerra', rightF: 'dreta',
    rotate: 'Girar', zoomIn: 'Acostar', zoomOut: 'Allunyar',
    credits: 'Model 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).',
  },
};

export const ui3d = (lang) => UI3D[lang] || UI3D.es;

// Selector de vista en la pantalla previa de las apps del cuerpo.
export const VIEW_TEXT = {
  es: { label: 'Vista', d2: 'Láminas', d3: 'Cuerpo 3D' },
  en: { label: 'View', d2: 'Plates', d3: '3D body' },
  va: { label: 'Vista', d2: 'Làmines', d3: 'Cos 3D' },
};

// Paradas del deslizador de capas: qué se ve en cada una, qué recorta la lupa de
// rayos X y qué queda debajo (se pinta solo con la lupa encendida).
export const STOPS = [
  { id: 'piel', layers: { piel: 'solid' }, cut: ['piel'], under: { musculos: 'solid', 'musculos-prof': 'solid', esqueleto: 'solid' } },
  { id: 'musculos', layers: { piel: 'ghost', musculos: 'solid', 'musculos-prof': 'solid', esqueleto: 'solid' }, cut: ['musculos'], under: {} },
  { id: 'musculos-prof', layers: { piel: 'ghost', 'musculos-prof': 'solid', organos: 'solid', esqueleto: 'solid' }, cut: ['musculos-prof'], under: {} },
  { id: 'organos', layers: { piel: 'ghost', organos: 'solid', esqueleto: 'ghost' }, cut: ['organos'], under: { esqueleto: 'solid' } },
  { id: 'esqueleto', layers: { piel: 'ghost', esqueleto: 'solid' }, cut: ['esqueleto'], under: { organos: 'solid' } },
];

// Configuración de una parada: capas (con vasos y nervios si se encienden) y, con
// la lupa, qué capas se recortan dentro del círculo (lensCut) y cuáles se ven solo
// dentro (lensOnly: lo que hay debajo).
export function stopConfig(stopId, { vessels = false, nerves = false, lens = false } = {}) {
  const st = STOPS.find((s) => s.id === stopId) || STOPS[0];
  const layers = { piel: 'hidden', musculos: 'hidden', 'musculos-prof': 'hidden', organos: 'hidden', vasos: 'hidden', nervios: 'hidden', esqueleto: 'hidden', ...st.layers };
  if ((vessels || nerves) && st.id === 'piel') layers.piel = 'ghost';
  if (vessels) layers.vasos = 'solid';
  if (nerves) layers.nervios = 'solid';
  const lensOnly = [];
  if (lens) {
    for (const k of Object.keys(st.under)) {
      if (layers[k] === 'solid') continue;
      layers[k] = 'solid';
      lensOnly.push(k);
    }
  }
  return { layers, lensCut: lens ? st.cut.filter((k) => layers[k] === 'solid') : [], lensOnly };
}
