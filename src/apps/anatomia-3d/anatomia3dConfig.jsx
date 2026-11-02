// Configuración de Anatomía 3D para el motor de mapas (src/apps/_shared/geo/GeoQuizApp.jsx)
// y para su duelo. Todo se juega sobre el modelo 3D del cuerpo (src/apps/_shared/anatomia3d/).
import React from 'react';
import { makeAnatomyConfig } from '../_shared/anatomia/makeConfig';
import { AnatomyArt, ICONS } from '../_shared/anatomia/components';
import { PLATES } from '../_shared/anatomia/data/plates';
import { courseLevel, GAMES, regionsFor } from './engine/config';
import { buildRound } from './engine/questions';
import { PlaceQuestion, UnderSubject, CutSubject } from './components/Questions3D';

const { Bone, Brain, HeartPulse, ScanLine, Sparkles } = ICONS;

const ARTS = {
  donde: { plate: 'esq-a', ghost: 'a', x: 50, y: 30, zoom: 1.9, icon: ScanLine },
  quees: { plate: 'org-a', ghost: 'a', x: 50, y: 30, zoom: 2.3, icon: Sparkles },
  monta: { plate: 'craneo-a', x: 50, y: 45, zoom: 1.05, icon: Bone },
  debajo: { plate: 'org-a', ghost: 'a', x: 48, y: 36, zoom: 3.1, icon: HeartPulse },
  tac: { plate: 'encefalo-s', x: 50, y: 50, zoom: 1.05, icon: Brain },
  atlas: { plate: 'mus-a', ghost: 'a', x: 50, y: 30, zoom: 1.4, ratio: '1 / 1' },
};

const instructions = {
  es: (
    <>
      <h3>🧍 Objetivo</h3>
      <p>Explora un <strong>cuerpo humano completo en 3D</strong>, hecho con un modelo anatómico real: gíralo, acércate, quítale capas, córtalo como en un escáner y monta sus piezas. El contenido se adapta a tu curso.</p>
      <h3>🕹️ Minijuegos</h3>
      <ul>
        <li><strong>¿Dónde está?</strong> Toca la estructura. En medio y examen tendrás que girar el cuerpo y acercarte tú.</li>
        <li><strong>¿Qué es?</strong> Una pieza se ilumina: gírala para verla bien y elige su nombre.</li>
        <li><strong>Monta el cuerpo:</strong> arrastra la pieza suelta hasta su sitio.</li>
        <li><strong>¿Qué hay debajo?</strong> (desde 1.º de ESO) ¿Qué órgano hay justo debajo del punto marcado en la piel?</li>
        <li><strong>Cortes y TAC</strong> (desde 3.º de ESO): el cuerpo cortado por un plano. ¿Qué plano es? ¿Qué estructura atraviesa?</li>
      </ul>
      <h3>🎮 Cómo se maneja</h3>
      <ul>
        <li><strong>Girar:</strong> arrastra con un dedo o con el ratón. <strong>Acercar:</strong> dos dedos o la rueda. <strong>Mover:</strong> dos dedos o botón derecho.</li>
        <li>Los botones de la esquina acercan, alejan, giran y vuelven a ver el cuerpo entero.</li>
      </ul>
      <h3>🎓 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Fácil</strong>3 opciones, 3 intentos y la cámara empieza cerca. Al montar piezas se marca el hueco.</div>
        <div className="instr-mode medium"><strong>Medio</strong>4 opciones y 2 intentos. Muchas veces hay que buscar en el cuerpo entero.</div>
        <div className="instr-mode exam"><strong>Examen</strong>10 preguntas mezcladas, un intento. Nota sobre 10 y puntos por rapidez y racha.</div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consejos:</strong> abre el <strong>Laboratorio 3D</strong> (botón del libro) para estudiar: capas, lupa de rayos X, cortes, despiece, latido del corazón y la ficha de cada estructura. Puedes jugar en <strong>castellano, valenciano o inglés</strong>.
      </div>
    </>
  ),
  en: (
    <>
      <h3>🧍 Goal</h3>
      <p>Explore a <strong>complete human body in 3D</strong>, made from a real anatomical model: turn it, zoom in, peel off layers, slice it like a scanner and put its parts back together. The content adapts to your year.</p>
      <h3>🕹️ Games</h3>
      <ul>
        <li><strong>Where is it?</strong> Tap the structure. In medium and exam you have to turn the body and zoom in yourself.</li>
        <li><strong>What is it?</strong> A part lights up: turn it to see it well and choose its name.</li>
        <li><strong>Build the body:</strong> drag the loose part back into place.</li>
        <li><strong>What lies beneath?</strong> (from Year 8) Which organ lies right under the point marked on the skin?</li>
        <li><strong>Sections and CT</strong> (from Year 10): the body cut by a plane. Which plane is it? Which structure does it cut through?</li>
      </ul>
      <h3>🎮 Controls</h3>
      <ul>
        <li><strong>Turn:</strong> drag with one finger or the mouse. <strong>Zoom:</strong> two fingers or the wheel. <strong>Move:</strong> two fingers or the right button.</li>
        <li>The corner buttons zoom in, zoom out, turn and show the whole body again.</li>
      </ul>
      <h3>🎓 Modes</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Easy</strong>3 options, 3 tries and the camera starts close. When building, the empty slot is marked.</div>
        <div className="instr-mode medium"><strong>Medium</strong>4 options and 2 tries. You often have to search the whole body.</div>
        <div className="instr-mode exam"><strong>Exam</strong>10 mixed questions, one try. Mark out of 10 and points for speed and streaks.</div>
      </div>
      <div className="instr-tips">
        <strong>💡 Tips:</strong> open the <strong>3D Lab</strong> (book button) to study: layers, X-ray lens, sections, exploded view, heartbeat and the card for each structure. You can play in <strong>English, Spanish or Valencian</strong>.
      </div>
    </>
  ),
  va: (
    <>
      <h3>🧍 Objectiu</h3>
      <p>Explora un <strong>cos humà complet en 3D</strong>, fet amb un model anatòmic real: gira’l, acosta’t, lleva-li capes, talla’l com en un escàner i munta les seues peces. El contingut s’adapta al teu curs.</p>
      <h3>🕹️ Minijocs</h3>
      <ul>
        <li><strong>On està?</strong> Toca l’estructura. En mitjà i examen hauràs de girar el cos i acostar-te tu.</li>
        <li><strong>Què és?</strong> Una peça s’il·lumina: gira-la per a veure-la bé i tria el seu nom.</li>
        <li><strong>Munta el cos:</strong> arrossega la peça solta fins al seu lloc.</li>
        <li><strong>Què hi ha davall?</strong> (des de 1r d’ESO) Quin òrgan hi ha just davall del punt marcat en la pell?</li>
        <li><strong>Talls i TAC</strong> (des de 3r d’ESO): el cos tallat per un pla. Quin pla és? Quina estructura travessa?</li>
      </ul>
      <h3>🎮 Com es maneja</h3>
      <ul>
        <li><strong>Girar:</strong> arrossega amb un dit o amb el ratolí. <strong>Acostar:</strong> dos dits o la roda. <strong>Moure:</strong> dos dits o el botó dret.</li>
        <li>Els botons del cantó acosten, allunyen, giren i tornen a mostrar el cos sencer.</li>
      </ul>
      <h3>🎓 Modes</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Fàcil</strong>3 opcions, 3 intents i la càmera comença prop. En muntar peces es marca el buit.</div>
        <div className="instr-mode medium"><strong>Mitjà</strong>4 opcions i 2 intents. Moltes vegades cal buscar en el cos sencer.</div>
        <div className="instr-mode exam"><strong>Examen</strong>10 preguntes mesclades, un intent. Nota sobre 10 i punts per rapidesa i ratxa.</div>
      </div>
      <div className="instr-tips">
        <strong>💡 Consells:</strong> obri el <strong>Laboratori 3D</strong> (botó del llibre) per a estudiar: capes, lupa de raigs X, talls, desmuntatge, batec del cor i la fitxa de cada estructura. Pots jugar en <strong>valencià, castellà o anglés</strong>.
      </div>
    </>
  ),
};

const TEXTS = {
  es: {
    modes: {
      easy: { desc: 'Para aprender: la cámara empieza cerca y hay ayudas.', features: ['3 opciones', '3 intentos', 'Hueco marcado al montar'] },
      medium: { desc: 'Busca tú: gira el cuerpo y acércate.', features: ['4 opciones', '2 intentos', 'Cuerpo entero'] },
      exam: { desc: (n) => `Diez preguntas mezcladas de los ${n} minijuegos de tu curso.`, features: ['Nota sobre 10', 'Puntos por rapidez y racha', 'Un intento'] },
    },
    atlasCta: { title: 'Laboratorio 3D', text: 'Gira, quita capas, usa la lupa de rayos X, corta el cuerpo y despieza el cráneo o el corazón.' },
    regionScope: (name) => `Jugarás con: ${name}.`,
    allRegionsScope: 'Jugarás con todo el cuerpo.',
    ignoresRegion: 'Usa todo el cuerpo',
    pool: () => 'Cuerpo humano completo en 3D',
    helpTitle: 'Cómo se juega: Anatomía 3D',
    instructions: instructions.es,
  },
  en: {
    modes: {
      easy: { desc: 'To learn: the camera starts close and there is help.', features: ['3 options', '3 tries', 'Empty slot marked when building'] },
      medium: { desc: 'Search yourself: turn the body and zoom in.', features: ['4 options', '2 tries', 'Whole body'] },
      exam: { desc: (n) => `Ten mixed questions from the ${n} games of your year.`, features: ['Mark out of 10', 'Points for speed and streaks', 'One try'] },
    },
    atlasCta: { title: '3D Lab', text: 'Turn the body, peel off layers, use the X-ray lens, slice it and take the skull or the heart apart.' },
    regionScope: (name) => `You will play with: ${name}.`,
    allRegionsScope: 'You will play with the whole body.',
    ignoresRegion: 'Uses the whole body',
    pool: () => 'Complete human body in 3D',
    helpTitle: 'How to play: 3D Anatomy',
    instructions: instructions.en,
  },
  va: {
    modes: {
      easy: { desc: 'Per a aprendre: la càmera comença prop i hi ha ajudes.', features: ['3 opcions', '3 intents', 'Buit marcat en muntar'] },
      medium: { desc: 'Busca tu: gira el cos i acosta’t.', features: ['4 opcions', '2 intents', 'Cos sencer'] },
      exam: { desc: (n) => `Deu preguntes mesclades dels ${n} minijocs del teu curs.`, features: ['Nota sobre 10', 'Punts per rapidesa i ratxa', 'Un intent'] },
    },
    atlasCta: { title: 'Laboratori 3D', text: 'Gira, lleva capes, usa la lupa de raigs X, talla el cos i desmunta el crani o el cor.' },
    regionScope: (name) => `Jugaràs amb: ${name}.`,
    allRegionsScope: 'Jugaràs amb tot el cos.',
    ignoresRegion: 'Usa tot el cos',
    pool: () => 'Cos humà complet en 3D',
    helpTitle: 'Com es juga: Anatomia 3D',
    instructions: instructions.va,
  },
};

// Láminas del atlas que acompañan al modelo 3D («ver por dentro»): las de órganos por dentro y las dibujadas.
const atlasPlates = (lv) => PLATES.filter((p) => p.lv <= Math.max(lv, 3)).map((p) => p.id);

export const anatomia3dConfig = makeAnatomyConfig({
  id: 'anatomia-3d',
  title: ['Anatomía 3D', '3D Anatomy', 'Anatomia 3D'],
  accent: '#22d3ee',
  accent2: '#a78bfa',
  always3d: true,
  levelFor: courseLevel,
  games: GAMES,
  platesFor: () => [],
  regionsFor,
  buildRound,
  texts: TEXTS,
  atlasPlates,
  renderArt: (game) => <AnatomyArt art={ARTS[game] || ARTS.atlas} />,
  subjects: {
    under3d: (q, done) => <UnderSubject s={q.subject} done={done} />,
    cut3d: (q, done) => <CutSubject s={q.subject} done={done} />,
  },
  renderQuestion: (q, opts) => (q.type === 'place'
    ? <PlaceQuestion key={`${q.layer}:${q.n}:${q.key}`} q={q} {...opts} />
    : null),
});
