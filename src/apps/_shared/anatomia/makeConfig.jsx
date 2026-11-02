// Fábrica de configuración del motor de mapas para las apps del cuerpo humano.
// Cada app aporta sus minijuegos, textos y arte; aquí se monta lo común:
// idiomas, carga de láminas, tema de escáner, atlas anatómico y textos del motor.
import React, { lazy, Suspense } from 'react';
import { loadBodyWorld } from './world';
import { setLang, systemName } from './text';
import { ENGINE_UI, APP_UI } from './uiStrings';
import { AnatomyScene, makeRenderSubject, SpeakButton } from './components';
import BodyAtlas from './BodyAtlas';
import { PLATES } from './data/plates';
import { VIEW_TEXT } from '../anatomia3d/ui3d';
import { isWebGLAvailable, loadQualityPref, resolveQuality } from '@/services/graphicsQuality';
import './anatomia.css';

// Modo 3D: el visor y el modelo se cargan solo si se elige (three.js no entra en las láminas).
async function ensure3d(world, lv) {
  const [{ attach3d, to3d }, { default: Map3DView }] = await Promise.all([
    import('../anatomia3d/world3d.js'),
    import('../anatomia3d/Map3DView.jsx'),
  ]);
  await attach3d(world, Map3DView);
  world.lv3d = lv;
  world.to3d = to3d;
  return world;
}

// Movimientos con el esqueleto 3D articulado (sujeto 'move3d', lo pone to3d en modo 3D).
const Move3D = lazy(() => import('../anatomia3d/Move3D.jsx'));
const SUBJECTS_3D = {
  move3d: (q) => <Suspense fallback={null}><Move3D fig={q.subject.fig} /></Suspense>,
};

// 3D por defecto desde 5.º de Primaria si el equipo lo mueve bien; si no, láminas.
export function defaultView(lv) {
  if (lv < 3 || typeof window === 'undefined') return '2d';
  try {
    if (!isWebGLAvailable() || resolveQuality(loadQualityPref()) === 'low') return '2d';
  } catch { return '2d'; }
  return '3d';
}

const LI = { es: 0, en: 1, va: 2 };
export const LANGUAGES = [
  { id: 'es', label: 'Castellano' },
  { id: 'va', label: 'Valencià' },
  { id: 'en', label: 'English' },
];
const LANG_SUBJECTS = { ingles: 'en', valenciano: 'va' };

// app = {
//   id, title: [es,en,va], accent, accent2,
//   levelFor(level, grade, subjectId), games: [{ id, from, usesRegion, t:[…], d:[…], tint? }],
//   platesFor(gameId, lv), regionsFor?(lv) → [systemId] | null, buildRound(ctx, gameId, n),
//   texts: { es|en|va: { modes, instructions, atlasCta, regionQuestion, allRegions, regionScope(name), allRegionsScope, ignoresRegion, pool(lv, region) } },
//   atlasPlates(lv) → [ids], arts: { gameId|atlas: art }, subjects?: { type: (q, done) => node }, mapHud?,
//   no3d?: sin modo 3D · always3d?: siempre en 3D (Anatomía 3D: sin selector de vista, atlas en 3D)
//   renderQuestion?(q, opts): preguntas propias (kind 'custom')
// }
export function makeAnatomyConfig(app) {
  const GameArt = ({ game }) => app.renderArt(game);
  const renderSubject = makeRenderSubject({ ...SUBJECTS_3D, ...app.subjects });
  const localized = new Map();

  const localize = (langIn) => {
    const lang = langIn === 'en' || langIn === 'va' ? langIn : 'es';
    setLang(lang);
    if (localized.has(lang)) return localized.get(lang);
    const li = LI[lang];
    const tx = app.texts[lang] || app.texts.es;
    const appUi = APP_UI[lang];
    const c = {
      ...base,
      title: app.title[li],
      ui: { ...ENGINE_UI.es, ...(lang === 'es' ? {} : ENGINE_UI[lang]) },
      games: (lv) => app.games.filter((g) => g.from <= lv).map((g) => ({ id: g.id, title: g.t[li], desc: g.d[li], usesRegion: g.usesRegion, tint: g.tint })),
      regions: (lv) => {
        const r = app.regionsFor?.(lv);
        return r ? r.map((id) => ({ id, label: systemName(id, lang) })) : null;
      },
      regionLabel: (id) => (id && id !== 'all' ? systemName(id, lang) : appUi.all),
      regionQuestion: tx.regionQuestion || appUi.whichSystem,
      allRegionsLabel: appUi.all,
      regionScope: (id) => tx.regionScope(systemName(id, lang)),
      allRegionsScope: tx.allRegionsScope,
      ignoresRegionNote: tx.ignoresRegion,
      changeModeLabel: ENGINE_UI[lang]?.changeModeRegion || ENGINE_UI.es.changeModeRegion,
      poolText: (lv, region) => tx.pool(lv, region),
      buildRound: (ctx, gameId, n) => {
        const qs = app.buildRound({ ...ctx, lang }, gameId, n);
        return ctx.view === '3d' && !app.always3d && ctx.world?.to3d && !ctx.duel ? qs.map((q) => ctx.world.to3d(q, ctx.world)) : qs;
      },
      renderQuestion: app.renderQuestion ? (q, opts) => app.renderQuestion(q, { ...opts, lang }) : undefined,
      viewModes: app.no3d || app.always3d ? null : [{ id: '2d', label: VIEW_TEXT[lang].d2 }, { id: '3d', label: VIEW_TEXT[lang].d3 }],
      viewLabel: VIEW_TEXT[lang].label,
      modes: tx.modes,
      instructions: tx.instructions,
      helpTitle: tx.helpTitle,
      atlasCta: tx.atlasCta,
      atlas: (world, lv, opts = {}) => ({
        title: appUi.atlas,
        view3d: opts.view === '3d' || Boolean(app.always3d),
        subtitle: tx.atlasCta.text,
        plates: app.atlasPlates(lv).filter((id) => world.available(id)),
        lv,
        lang,
      }),
      Atlas: BodyAtlas,
      GameArt,
      renderSubject,
      mapHud: app.mapHud,
      // Práctica: altavoz para escuchar el nombre de la respuesta.
      feedbackExtra: (q) => (q.card?.title ? <SpeakButton text={q.card.title} lang={lang} className="ana-speak--fb" /> : null),
    };
    localized.set(lang, c);
    return c;
  };

  const base = {
    id: app.id,
    title: app.title[0],
    shell: { accent: app.accent, accent2: app.accent2, theme: 'dark', scene: <AnatomyScene /> },
    load: loadBodyWorld,
    prepare: async (gameId, world, lv, opts = {}) => {
      await world.ensure(app.platesFor(gameId, lv));
      if ((opts.view === '3d' || app.always3d) && !app.no3d) await ensure3d(world, lv);
      return world;
    },
    defaultViewMode: app.no3d || app.always3d ? undefined : (level, subjectId, lv) => defaultView(lv),
    levelFor: app.levelFor,
    languages: LANGUAGES,
    defaultLang: (level, subjectId) => LANG_SUBJECTS[subjectId] || 'es',
    localize,
  };
  // Valores por defecto (castellano) por si algo lee la config sin localizar.
  Object.assign(base, localize('es'));
  return base;
}

export const atlasPlatesUpTo = (lv, cats) => PLATES.filter((p) => p.lv <= Math.max(lv, 2) && (!cats || cats.includes(p.cat))).map((p) => p.id);
