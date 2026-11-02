// Configuración del Explorador del Cuerpo Humano para el motor de mapas
// (src/apps/_shared/geo/GeoQuizApp.jsx) y para su duelo.
import React from 'react';
import { makeAnatomyConfig, atlasPlatesUpTo } from '../_shared/anatomia/makeConfig';
import { AnatomyArt, ICONS } from '../_shared/anatomia/components';
import { STRUCTURES } from '../_shared/anatomia/data/structures';
import { courseLevel, GAMES, platesFor, regionsFor } from './engine/config';
import { buildRound } from './engine/questions';

const { Activity, Brain, Eye, HeartPulse, Microscope, ScanLine, Sparkles, Wind } = ICONS;

const ARTS = {
  partes: { plate: 'cuerpo-a', x: 50, y: 22, zoom: 1.5, icon: ScanLine },
  organos: { plate: 'org-a', ghost: 'a', x: 50, y: 30, zoom: 2.3, icon: HeartPulse },
  funciones: { plate: 'corazon-ext', x: 50, y: 45, zoom: 1.05, icon: Activity },
  sentidos: { plate: 'org-a', ghost: 'a', x: 50, y: 8, zoom: 4, icon: Eye },
  sistemas: { plate: 'org-prof-a', ghost: 'a', x: 50, y: 30, zoom: 2.1, icon: Sparkles },
  siluetas: { plate: 'org-a', x: 46, y: 37, zoom: 3.2, icon: Sparkles },
  dentro: { plate: 'encefalo-s', x: 50, y: 50, zoom: 1.05, icon: Brain },
  reproduccion: { plate: 'gametos', x: 50, y: 50, zoom: 1.1, fit: 'contain', icon: Microscope },
  organizacion: { plate: 'tejidos', x: 50, y: 50, zoom: 1.05, icon: Microscope },
  hormonas: { plate: 'endocrino', x: 50, y: 22, zoom: 1.6, icon: Sparkles },
  salud: { plate: 'pulmones-a', x: 50, y: 45, zoom: 1.1, icon: Wind },
  lenguaje: { plate: 'areas', x: 50, y: 50, zoom: 1.05, icon: Brain },
  atlas: { plate: 'cuerpo-a', x: 50, y: 30, zoom: 1.3, ratio: '1 / 1' },
};

const EXPLORER = new Set(['ext', 'sentidos', 'nervioso', 'digestivo', 'respiratorio', 'circulatorio', 'excretor', 'endocrino', 'inmune', 'reproductor', 'organizacion']);
const poolSize = (lv, region) => STRUCTURES.filter((s) => s.l <= lv && EXPLORER.has(s.s) && (!region || region === 'all' || s.s === region)).length;

const TEXTS = {
  es: {
    modes: {
      easy: { desc: 'Para aprender: la lámina se acerca a la zona y hay pistas.', features: ['3 opciones por pregunta', 'Pistas gratis', '3 intentos en la lámina'] },
      medium: { desc: 'Opciones del mismo aparato y el cuerpo entero.', features: ['4 opciones', 'Pista opcional (−50 %)', '2 intentos en la lámina'] },
      exam: { desc: (n) => `Diez preguntas mezcladas de los ${n} minijuegos de tu curso.`, features: ['Nota sobre 10', 'Puntos por rapidez y racha', 'Sin pistas, un intento'] },
    },
    atlasCta: { title: 'Atlas anatómico', text: 'Explora el cuerpo por capas: piel, músculos, órganos, vasos, nervios y esqueleto, con lupa de rayos X.' },
    regionScope: (name) => `Jugarás con: ${name}.`,
    allRegionsScope: 'Jugarás con todo el cuerpo.',
    ignoresRegion: 'Usa todo el cuerpo',
    pool: (lv, region) => `${poolSize(lv, region)} estructuras en juego`,
    helpTitle: 'Cómo se juega: Explorador del Cuerpo Humano',
    instructions: (
      <>
        <h3>🫀 Objetivo</h3>
        <p>Descubre <strong>qué hay dentro de tu cuerpo y dónde está</strong>: las partes del cuerpo, los órganos de los sentidos, los aparatos digestivo, respiratorio, circulatorio, excretor y reproductor, el sistema nervioso y el endocrino. Las láminas están hechas con un modelo 3D real del cuerpo humano. El contenido se adapta a tu curso.</p>
        <h3>🕹️ Minijuegos</h3>
        <ul>
          <li><strong>Partes del cuerpo:</strong> cabeza, tronco, extremidades y la cara.</li>
          <li><strong>¿Dónde está?</strong> Toca cada órgano dentro del cuerpo, o di qué órgano está iluminado.</li>
          <li><strong>¿Para qué sirve?</strong> Cada órgano y su trabajo.</li>
          <li><strong>Los sentidos:</strong> los cinco sentidos y, desde 5.º, el ojo, el oído y la piel por dentro.</li>
          <li><strong>Aparatos y sistemas</strong> y <strong>Siluetas</strong> (desde 3.º).</li>
          <li><strong>Por dentro</strong> y <strong>Reproducción</strong> (desde 5.º): corazón, encéfalo, pulmones, riñón, neurona…</li>
          <li><strong>Células y tejidos</strong> (desde 1.º de ESO), <strong>Glándulas y hormonas</strong> y <strong>Salud</strong> (desde 3.º de ESO) y <strong>Lenguaje médico</strong> (Bachillerato).</li>
        </ul>
        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Fácil</strong>3 opciones, pistas gratis, la lámina empieza cerca de la zona y tienes 3 intentos.</div>
          <div className="instr-mode medium"><strong>Medio</strong>4 opciones parecidas y 2 intentos. La pista resta la mitad de los puntos.</div>
          <div className="instr-mode exam"><strong>Examen</strong>10 preguntas mezcladas, sin pistas y con un solo intento. Nota sobre 10.</div>
        </div>
        <div className="instr-tips">
          <strong>💡 Consejos:</strong> abre el <strong>Atlas anatómico</strong> (botón del libro) para estudiar cada estructura con su ficha y usa la <strong>lupa de rayos X</strong> para ver debajo de la piel. Puedes jugar en <strong>castellano, valenciano o inglés</strong>. Arrastra y haz zoom en las láminas para tocar las piezas pequeñas.
        </div>
        <h3>📚 Créditos</h3>
        <p>Modelos 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
  en: {
    modes: {
      easy: { desc: 'To learn: the plate zooms in on the area and there are hints.', features: ['3 options per question', 'Free hints', '3 tries on the plate'] },
      medium: { desc: 'Options from the same system and the whole body.', features: ['4 options', 'Optional hint (−50 %)', '2 tries on the plate'] },
      exam: { desc: (n) => `Ten mixed questions from the ${n} games of your course.`, features: ['Mark out of 10', 'Points for speed and streaks', 'No hints, one try'] },
    },
    atlasCta: { title: 'Anatomy atlas', text: 'Explore the body layer by layer: skin, muscles, organs, vessels, nerves and skeleton, with an X-ray lens.' },
    regionScope: (name) => `You will play with: ${name}.`,
    allRegionsScope: 'You will play with the whole body.',
    ignoresRegion: 'Uses the whole body',
    pool: (lv, region) => `${poolSize(lv, region)} structures to discover`,
    helpTitle: 'How to play: Human Body Explorer',
    instructions: (
      <>
        <h3>🫀 Goal</h3>
        <p>Find out <strong>what is inside your body and where it is</strong>: body parts, sense organs, the digestive, respiratory, circulatory, excretory and reproductive systems, and the nervous and endocrine systems. The plates are made from a real 3D model of the human body. The content adapts to your course.</p>
        <h3>🕹️ Games</h3>
        <ul>
          <li><strong>Parts of the body:</strong> head, trunk, limbs and the face.</li>
          <li><strong>Where is it?</strong> Tap each organ inside the body, or name the highlighted organ.</li>
          <li><strong>What does it do?</strong> Each organ and its job.</li>
          <li><strong>The senses:</strong> the five senses and, in higher years, inside the eye, the ear and the skin.</li>
          <li><strong>Body systems</strong>, <strong>Silhouettes</strong>, <strong>Inside</strong>, <strong>Reproduction</strong>, <strong>Cells and tissues</strong>, <strong>Glands and hormones</strong>, <strong>Health</strong> and <strong>Medical language</strong> unlock as you move up through school.</li>
        </ul>
        <h3>🎓 Modes</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Easy</strong>3 options, free hints, the plate starts close to the area and you have 3 tries.</div>
          <div className="instr-mode medium"><strong>Medium</strong>4 similar options and 2 tries. Hints cost half the points.</div>
          <div className="instr-mode exam"><strong>Exam</strong>10 mixed questions, no hints and only one try. Mark out of 10.</div>
        </div>
        <div className="instr-tips">
          <strong>💡 Tips:</strong> open the <strong>Anatomy atlas</strong> (book button) to study each structure and use the <strong>X-ray lens</strong> to see under the skin. You can play in <strong>English, Spanish or Valencian</strong>. Drag and zoom the plates to tap small parts.
        </div>
        <h3>📚 Credits</h3>
        <p>3D models: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
  va: {
    modes: {
      easy: { desc: 'Per a aprendre: la làmina s’acosta a la zona i hi ha pistes.', features: ['3 opcions per pregunta', 'Pistes gratis', '3 intents a la làmina'] },
      medium: { desc: 'Opcions del mateix aparell i el cos sencer.', features: ['4 opcions', 'Pista opcional (−50 %)', '2 intents a la làmina'] },
      exam: { desc: (n) => `Deu preguntes mesclades dels ${n} minijocs del teu curs.`, features: ['Nota sobre 10', 'Punts per rapidesa i ratxa', 'Sense pistes, un intent'] },
    },
    atlasCta: { title: 'Atles anatòmic', text: 'Explora el cos per capes: pell, músculs, òrgans, vasos, nervis i esquelet, amb lupa de raigs X.' },
    regionScope: (name) => `Jugaràs amb: ${name}.`,
    allRegionsScope: 'Jugaràs amb tot el cos.',
    ignoresRegion: 'Usa tot el cos',
    pool: (lv, region) => `${poolSize(lv, region)} estructures en joc`,
    helpTitle: "Com es juga: Explorador del Cos Humà",
    instructions: (
      <>
        <h3>🫀 Objectiu</h3>
        <p>Descobreix <strong>què hi ha dins del teu cos i on està</strong>: les parts del cos, els òrgans dels sentits, els aparells digestiu, respiratori, circulatori, excretor i reproductor, el sistema nerviós i l'endocrí. Les làmines estan fetes amb un model 3D real del cos humà. El contingut s'adapta al teu curs.</p>
        <h3>🕹️ Minijocs</h3>
        <ul>
          <li><strong>Parts del cos:</strong> cap, tronc, extremitats i la cara.</li>
          <li><strong>On està?</strong> Toca cada òrgan dins del cos o digues quin òrgan està il·luminat.</li>
          <li><strong>Per a què serveix?</strong> Cada òrgan i el seu treball.</li>
          <li><strong>Els sentits:</strong> els cinc sentits i, des de 5é, l'ull, l'orella i la pell per dins.</li>
          <li><strong>Aparells i sistemes</strong>, <strong>Siluetes</strong>, <strong>Per dins</strong>, <strong>Reproducció</strong>, <strong>Cèl·lules i teixits</strong>, <strong>Glàndules i hormones</strong>, <strong>Salut</strong> i <strong>Llenguatge mèdic</strong> es desbloquegen segons el curs.</li>
        </ul>
        <h3>🎓 Modes</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Fàcil</strong>3 opcions, pistes gratis, la làmina comença prop de la zona i tens 3 intents.</div>
          <div className="instr-mode medium"><strong>Mitjà</strong>4 opcions semblants i 2 intents. La pista resta la meitat dels punts.</div>
          <div className="instr-mode exam"><strong>Examen</strong>10 preguntes mesclades, sense pistes i amb un sol intent. Nota sobre 10.</div>
        </div>
        <div className="instr-tips">
          <strong>💡 Consells:</strong> obri l'<strong>Atles anatòmic</strong> (botó del llibre) per a estudiar cada estructura amb la seua fitxa i usa la <strong>lupa de raigs X</strong> per a veure sota la pell. Pots jugar en <strong>valencià, castellà o anglés</strong>. Arrossega i fes zoom a les làmines per a tocar les peces menudes.
        </div>
        <h3>📚 Crèdits</h3>
        <p>Models 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
};

export const cuerpoConfig = makeAnatomyConfig({
  id: 'explorador-cuerpo',
  title: ['Explorador del Cuerpo Humano', 'Human Body Explorer', 'Explorador del Cos Humà'],
  accent: '#22d3ee',
  accent2: '#f472b6',
  levelFor: courseLevel,
  games: GAMES,
  platesFor,
  regionsFor,
  buildRound,
  texts: TEXTS,
  atlasPlates: (lv) => atlasPlatesUpTo(lv),
  renderArt: (game) => <AnatomyArt art={ARTS[game] || ARTS.atlas} />,
});
