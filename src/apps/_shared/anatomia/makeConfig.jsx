// Fábrica de configuración del motor de mapas para las apps del cuerpo humano.
// Cada app aporta sus minijuegos, textos y arte; aquí se monta lo común:
// idiomas, carga de láminas, tema de escáner, atlas anatómico y textos del motor.
import React from 'react';
import { loadBodyWorld } from './world';
import { setLang, systemName } from './text';
import { ENGINE_UI, APP_UI } from './uiStrings';
import { AnatomyScene, makeRenderSubject } from './components';
import BodyAtlas from './BodyAtlas';
import { PLATES } from './data/plates';
import './anatomia.css';

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
// }
export function makeAnatomyConfig(app) {
  const GameArt = ({ game }) => app.renderArt(game);
  const renderSubject = makeRenderSubject(app.subjects);
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
      buildRound: (ctx, gameId, n) => app.buildRound({ ...ctx, lang }, gameId, n),
      modes: tx.modes,
      instructions: tx.instructions,
      helpTitle: tx.helpTitle,
      atlasCta: tx.atlasCta,
      atlas: (world, lv) => ({
        title: appUi.atlas,
        subtitle: tx.atlasCta.text,
        plates: app.atlasPlates(lv).filter((id) => world.available(id)),
        lv,
        lang,
      }),
      Atlas: BodyAtlas,
      GameArt,
      renderSubject,
      mapHud: app.mapHud,
    };
    localized.set(lang, c);
    return c;
  };

  const base = {
    id: app.id,
    title: app.title[0],
    shell: { accent: app.accent, accent2: app.accent2, theme: 'dark', scene: <AnatomyScene /> },
    load: loadBodyWorld,
    prepare: (gameId, world, lv) => world.ensure(app.platesFor(gameId, lv)),
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
