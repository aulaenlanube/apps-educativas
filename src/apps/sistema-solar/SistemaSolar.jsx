// src/apps/sistema-solar/SistemaSolar.jsx
// Sistema Solar 3D: explorador + misiones con nota (app single_mode).
//
//   Explorar  → escena 3D (scene/SolarScene) con tres escalas, ficha de cada
//               astro (ui/PlanetSheet), puntos de interés y vídeos.
//   Interior  → visor de capas que se abre y se separa (scene/InteriorScene).
//   Misiones  → centro de misiones (ui/MissionHub) con 6 juegos y progreso
//               local por estrellas/rango (progress.js).
//
// CONTRATO DE REGISTRO (CLAUDE.md §3 y §5): explorar NO registra nada. Cada
// misión terminada llama a onGameComplete UNA vez con el payload de
// missionScoring.buildPayload → { mode: 'test', score, maxScore,
// correctAnswers, totalQuestions, durationSeconds, nota }. Cada misión vive
// en un montaje propio (key = run): repetir = partida nueva = registro nuevo.
// Además de la guarda (useRef) de cada misión, aquí se ignora un segundo
// aviso del mismo run.
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Check, X, HelpCircle, ChevronDown, Gauge, Eye, RotateCcw, PlayCircle, Pause, Play, Rocket, Star,
  Settings2, Tag, Orbit, CalendarClock, Sparkles,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import AppIcon from '@/components/AppIcon';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import FrameLimiter from '@/components/ui/bg3d/FrameLimiter';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import {
  GLOBAL_QUALITY_PARAMS, effectiveDpr, createFpsGovernor, lowerTier, QUALITY_LABELS, isWebGLAvailable, markWebGLUnavailable,
} from '@/services/graphicsQuality';
import { GameShell, GameButton, Segmented, ConfirmDialog, useAppMeta, cleanAppName } from '../_shared/kit';
import { solarSystemData } from './model/solarSystemData';
import { BODY_COLOR, BODY_ORDER, PLANET_IDS, bodyName } from './model/planetFacts';
import { INTERIOR_IDS } from './model/interiors';
import { MISSIONS, missionById, tierFor } from './model/missions';
import {
  loadProgress, saveProgress, recordMission, markBody, markInterior, totalStars, rankFor, isUnlocked, starsForNota, MAX_STARS,
} from './progress';
import SolarScene from './scene/SolarScene';
import InteriorScene from './scene/InteriorScene';
import { sceneQuality } from './scene/quality';
import { SCALE_MODES, VISUAL, meanLongitude } from './scene/layout';
import PlanetOrb from './ui/PlanetOrb';
import PlanetSheet from './ui/PlanetSheet';
import InteriorPanel from './ui/InteriorPanel';
import MissionHub from './ui/MissionHub';
import QuizMission from './ui/QuizMission';
import RiddleMission from './ui/RiddleMission';
import LayersMission from './ui/LayersMission';
import OrderMission from './SolarSystemActivity';
import './SistemaSolar.css';
import './ui/missions.css';
import ContextLossGuard from '@/components/ui/bg3d/ContextLossGuard';

/* ───────────────────────── Datos de apoyo ───────────────────────── */

const BODY_DATA = {};
solarSystemData.forEach((p) => {
  BODY_DATA[p.id] = p;
  p.moons?.forEach((m) => { BODY_DATA[m.id] = m; });
});

const NAV_IDS = BODY_ORDER; // Sol, planetas y la Luna junto a la Tierra

const TOTAL_SPOTS = Object.values(BODY_DATA).reduce((n, b) => n + (b.advanced?.hotspots?.length || 0), 0);

// Vídeos de divulgación (Kurzgesagt en español)
const VIDEOS = {
  sun: { id: 'R89xJYeExPc', title: 'El Sol: nuestra estrella' },
  mercury: { id: 'r0JuWXs7lPA', title: 'Las estrellas más grandes del universo' },
  venus: { id: 'vyyK3om1a10', title: 'Cómo terraformar Venus (rápidamente)' },
  mars: { id: 'u1CZH4OrxBk', title: 'Marte: el planeta rojo' },
  jupiter: { id: 'TFhRXnE2xck', title: 'Agujeros negros: los monstruos del universo' },
  saturn: { id: 'fD69KtLjjfQ', title: 'Estrellas de neutrones: los astros más extremos' },
  uranus: { id: 'duIDvO_QGBY', title: 'Agujeros de gusano: ¿se puede viajar por el espacio-tiempo?' },
  neptune: { id: '5NBQ2PBiobM', title: 'Cómo construir una Esfera de Dyson' },
  moon: { id: 'rF7llfSvEmY', title: 'La Luna: nuestro satélite natural' },
};

const SPEEDS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20];

function useMedia(query, initial = false) {
  const [m, setM] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : initial));
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [query]);
  return m;
}

/* ───────────────────────── Piezas DOM de la escena ───────────────────────── */

const _n = new THREE.Vector3();
const _w = new THREE.Vector3();
const _c = new THREE.Vector3();

// Punto de interés pegado a la superficie; se apaga cuando queda de espaldas
function Hotspot({ position, title, desc, onClick, isVisited, isActive }) {
  const ref = useRef();
  const dom = useRef();
  const back = useRef(null);
  useFrame(({ camera }) => {
    if (!ref.current || !dom.current) return;
    ref.current.getWorldPosition(_w);
    ref.current.parent.getWorldPosition(_c);
    _n.copy(_w).sub(_c).normalize();
    const isBack = _n.dot(_c.copy(camera.position).sub(_w).normalize()) < -0.05;
    if (isBack !== back.current) {
      back.current = isBack;
      dom.current.classList.toggle('is-back', isBack);
    }
  });
  return (
    <group ref={ref} position={position}>
      <Html center zIndexRange={[14, 0]} className="ss-hotspot-wrap">
        <div ref={dom} className={`ss-hotspot ${isVisited ? 'is-visited' : ''} ${isActive ? 'is-active' : ''}`}>
          <button type="button" className="ss-hotspot__dot" aria-label={title} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {isVisited ? <Check size={10} strokeWidth={4} /> : <span className="ss-hotspot__pulse" />}
          </button>
          {isActive && (
            <div className="ss-hotspot__card">
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function VideoStar({ video, onOpen }) {
  return (
    <Html position={[-1.05, 0.75, 0]} center zIndexRange={[14, 0]}>
      <button type="button" className="ss-star" onClick={(e) => { e.stopPropagation(); onOpen(video); }} title={video.title} aria-label={`Ver vídeo: ${video.title}`}>
        <svg className="ss-star__svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" />
        </svg>
        <span className="ss-star__ring" />
        <span className="ss-star__ring is-delay" />
      </button>
    </Html>
  );
}

function normalizedSpot(id, pos) {
  const vis = VISUAL[id]?.size || 1;
  const n = pos.map((v) => v / vis);
  const len = Math.hypot(...n) || 1;
  const k = len < 1.03 ? 1.03 / len : 1;
  return n.map((v) => v * k);
}

function VideoModal({ video, onClose }) {
  useEffect(() => {
    if (!video) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [video, onClose]);
  if (!video) return null;
  return createPortal(
    <div className="ss-video" onClick={onClose}>
      <div className="ss-video__card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={video.title}>
        <div className="ss-video__head">
          <span className="ss-video__badge"><PlayCircle size={14} /> Kurzgesagt</span>
          <h3>{video.title}</h3>
          <button type="button" className="ss-video__close" onClick={onClose} aria-label="Cerrar vídeo"><X size={20} /></button>
        </div>
        <div className="ss-video__player">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
        <div className="ss-video__foot">En Pocas Palabras – Kurzgesagt</div>
      </div>
    </div>,
    document.body,
  );
}

function GovernorTicker({ onDowngrade }) {
  const gov = useRef(null);
  if (!gov.current) gov.current = createFpsGovernor({ onDowngrade });
  useFrame((_, dt) => gov.current.tick(dt));
  return null;
}

/* ───────────────────────── Centro de mando ───────────────────────── */

function RangeField({ label, display, min, max, step, value, onChange }) {
  return (
    <label className="ss-range">
      <span className="ss-range__row">
        <span className="ss-range__label">{label}</span>
        <span className="ss-range__value">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} style={{ '--p': `${((value - min) / (max - min)) * 100}%` }} />
    </label>
  );
}

function SimClock({ simRef, paused }) {
  const [years, setYears] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setYears(simRef.current.years), 500);
    return () => clearInterval(id);
  }, [simRef]);
  const date = new Date(Date.now() + years * 365.25 * 86400000);
  const label = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  return (
    <span className={`ss-clock ${paused ? 'is-paused' : ''}`}>
      <CalendarClock size={14} /> {years < 0.02 ? 'Hoy' : label}
    </span>
  );
}

function ControlPanel({
  progress, onMissions, onHelp, mode, onMode, config, setConfig, simRef, onReset, narrow, explored,
}) {
  const [open, setOpen] = useState(false);
  const meta = useAppMeta();
  const stars = totalStars(progress);
  const { rank, next, progress: pr } = rankFor(stars);
  const speedIdx = Math.max(0, SPEEDS.indexOf(config.speed));
  const secsPerYear = Math.round(60 / config.speed);

  return (
    <section className={`ss-control ${open ? 'is-open' : ''}`} aria-label="Centro de mando">
      <div className="ss-control__head">
        <button type="button" className="ss-control__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span className="ss-control__icon"><AppIcon appId="sistema-solar" size={narrow ? 34 : 40} /></span>
          <span className="ss-control__titles">
            <strong>{cleanAppName(meta.name) || 'Sistema Solar 3D'}</strong>
            <span>{open ? 'Ajustes del simulador' : 'Centro de mando'}</span>
          </span>
          <span className="ss-control__stars" title={`${stars} de ${MAX_STARS} estrellas`}><Star size={13} fill="currentColor" /> {stars}</span>
          <span className={`ss-control__chev ${open ? 'is-up' : ''}`}><Settings2 size={17} /></span>
        </button>
        <button type="button" className="gk-iconbtn" onClick={onHelp} title="Cómo funciona" aria-label="Cómo funciona"><HelpCircle size={18} /></button>
      </div>

      <div className="ss-rankline">
        <span className="ss-rankline__name"><Sparkles size={13} /> {rank.name}</span>
        <span className="ss-rankline__bar"><i style={{ transform: `scaleX(${pr})` }} /></span>
        <span className="ss-rankline__next">{next ? `${next.min - stars} ★ para subir` : 'Rango máximo'}</span>
      </div>

      <div className="ss-challenge">
        <GameButton variant="warning" icon={Rocket} onClick={onMissions} className="ss-challenge__cta">Misiones</GameButton>
        <span className="ss-challenge__note">6 juegos con nota /10 · cuentan para tus tareas</span>
      </div>

      <div className="ss-scale">
        <span className="ss-sec__title"><Eye size={13} /> Escala</span>
        <Segmented size="sm" options={SCALE_MODES.map((m) => ({ value: m.id, label: narrow ? m.label.replace(' reales', '') : m.label }))} value={mode} onChange={onMode} />
      </div>

      <div className="ss-simrow">
        <button type="button" className="ss-play" onClick={() => setConfig({ ...config, paused: !config.paused })} aria-label={config.paused ? 'Reanudar órbitas' : 'Pausar órbitas'}>
          {config.paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <SimClock simRef={simRef} paused={config.paused} />
        <span className="ss-simrow__rate">1 año = {secsPerYear >= 60 ? `${Math.round(secsPerYear / 60)} min` : `${secsPerYear} s`}</span>
      </div>

      {open && (
        <div className="ss-control__deploy">
          <div className="ss-sec">
            <h4 className="ss-sec__title"><Gauge size={14} /> Simulación</h4>
            <RangeField
              label="Velocidad del tiempo"
              display={`×${String(config.speed).replace('.', ',')}`}
              min={0} max={SPEEDS.length - 1} step={1}
              value={speedIdx}
              onChange={(e) => setConfig({ ...config, speed: SPEEDS[Number(e.target.value)] })}
            />
            <RangeField
              label="Giro de los planetas"
              display={`×${config.spin.toFixed(1).replace('.', ',')}`}
              min={0} max={4} step={0.1}
              value={config.spin}
              onChange={(e) => setConfig({ ...config, spin: parseFloat(e.target.value) })}
            />
            <p className="ss-sec__text">Los periodos son reales y proporcionales: Mercurio da 4 vueltas mientras la Tierra da una. Las posiciones de partida son las de hoy.</p>
          </div>
          <div className="ss-sec">
            <h4 className="ss-sec__title"><Orbit size={14} /> Visualización</h4>
            <div className="ss-toggles">
              <button type="button" className={`ss-toggle ${config.orbits ? 'is-on' : ''}`} onClick={() => setConfig({ ...config, orbits: !config.orbits })} aria-pressed={config.orbits}><Orbit size={14} /> Órbitas</button>
              <button type="button" className={`ss-toggle ${config.labels ? 'is-on' : ''}`} onClick={() => setConfig({ ...config, labels: !config.labels })} aria-pressed={config.labels}><Tag size={14} /> Nombres</button>
            </div>
            <RangeField
              label="Brillo de las órbitas"
              display={`${Math.round(config.orbitOpacity * 100)} %`}
              min={0.05} max={0.6} step={0.01}
              value={config.orbitOpacity}
              onChange={(e) => setConfig({ ...config, orbitOpacity: parseFloat(e.target.value) })}
            />
          </div>
          <div className="ss-sec">
            <h4 className="ss-sec__title"><Settings2 size={14} /> Calidad gráfica</h4>
            <GraphicsQualitySelector className="gfxsel-on-dark" />
          </div>
          <div className="ss-sec ss-sec--foot">
            <p className="ss-sec__text">Diario: {explored.bodies}/10 astros · {explored.spots}/{TOTAL_SPOTS} puntos de interés · {explored.interiors}/10 interiores.</p>
            <GameButton variant="soft" size="sm" icon={RotateCcw} onClick={onReset} className="ss-reset">Reiniciar puntos de interés</GameButton>
            <p className="ss-credits">
              Texturas: <a href="https://www.solarsystemscope.com/" target="_blank" rel="noopener noreferrer">Solar System Scope</a> · Datos: NASA
            </p>
          </div>
        </div>
      )}
      {!open && !narrow && <button type="button" className="ss-control__more" onClick={() => setOpen(true)}><ChevronDown size={15} /> Más ajustes</button>}
    </section>
  );
}

function NavBar({ selected, onSelect, highlight }) {
  return (
    <nav className="ss-nav" aria-label="Astros">
      {NAV_IDS.map((id) => {
        const active = selected === id;
        return (
          <button
            type="button" key={id}
            className={`ss-nav__item ${active ? 'is-active' : ''} ${id === 'moon' ? 'is-moon' : ''} ${highlight?.[id] ? `is-${highlight[id]}` : ''}`}
            onClick={() => onSelect(id)}
            title={bodyName(id)}
            aria-pressed={active}
            style={{ '--pc': BODY_COLOR[id] }}
          >
            <PlanetOrb id={id} size={id === 'moon' ? 20 : 26} />
            <span className="ss-nav__name">{bodyName(id)}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ───────────────────────── Componente principal ───────────────────────── */

const SistemaSolar = ({ level, grade, onGameComplete }) => {
  const stage = useMemo(() => tierFor(level, grade), [level, grade]);
  const narrow = useMedia('(max-width: 720px)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');

  // ---- calidad gráfica global + governor (patrón de laboratorio-fisica) ----
  const { pref, tier: prefTier } = useGraphicsQuality();
  const [tierOverride, setTierOverride] = useState(null);
  useEffect(() => { setTierOverride(null); }, [pref, prefTier]);
  const gfxTier = tierOverride || prefTier;
  const Q = sceneQuality(gfxTier);
  const P = GLOBAL_QUALITY_PARAMS[gfxTier] || GLOBAL_QUALITY_PARAMS.medium;
  const [ctxKey, setCtxKey] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [webgl] = useState(() => isWebGLAvailable());
  const [glFailed, setGlFailed] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleDowngrade = useCallback(() => {
    const nxt = lowerTier(gfxTier);
    if (nxt === gfxTier) return;
    setTierOverride(nxt);
    showToast(`Rendimiento bajo: calidad ajustada a ${QUALITY_LABELS[nxt]}`);
  }, [gfxTier, showToast]);

  // Pérdida de contexto → remontar (ver ContextLossGuard: sin bucle al cambiar de calidad)
  const onContextLost = useCallback(() => setCtxKey((k) => k + 1), []);

  // ---- estado de la app ----
  const [view, setView] = useState('explore'); // explore | interior | hub | mission
  const [selectedId, setSelectedId] = useState(null);
  const [scaleMode, setScaleMode] = useState('visual');
  const [config, setConfig] = useState({ speed: 1, spin: 1, orbits: true, labels: true, orbitOpacity: 0.3, paused: false });
  const [interior, setInterior] = useState({ bodyId: 'earth', open: true, explode: false, selected: null });
  const [mission, setMission] = useState(null); // { id, run }
  const [missionDone, setMissionDone] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [missionFocus, setMissionFocus] = useState(null);
  const [missionScene, setMissionScene] = useState(null);
  const [pickEvent, setPickEvent] = useState(null);
  const pickSeq = useRef(0);
  const reported = useRef(new Set());
  const [video, setVideo] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [intro, setIntro] = useState(true);
  const [activeSpots, setActiveSpots] = useState({});

  const simRef = useRef(null);
  if (!simRef.current) {
    const now = new Date();
    simRef.current = { angles: Object.fromEntries([...PLANET_IDS.map((id) => [id, meanLongitude(id, now)]), ['moon', 0]]), sizes: {}, years: 0 };
  }

  // ---- progreso local ----
  const [progress, setProgress] = useState(() => loadProgress(level));
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; saveProgress(level, progress); }, [progress, level]);

  const [visited, setVisited] = useState(() => {
    try {
      const saved = localStorage.getItem('solarSystem_visited');
      const v = saved ? JSON.parse(saved) : {};
      return v && typeof v === 'object' ? v : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try { localStorage.setItem('solarSystem_visited', JSON.stringify(visited)); } catch { /* modo privado */ }
  }, [visited]);

  const explored = {
    bodies: Object.keys(progress.bodies).length,
    interiors: Object.keys(progress.interiors).length,
    spots: Object.keys(visited).length,
    spotsTotal: TOTAL_SPOTS,
  };

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), reduced ? 600 : 3000);
    return () => clearTimeout(t);
  }, [reduced]);

  // ---- explorar ----
  const selectBody = useCallback((id) => {
    setSelectedId((cur) => (cur === id ? cur : id));
    setActiveSpots({});
    setProgress((p) => markBody(p, id));
  }, []);

  const closeSheet = useCallback(() => { setSelectedId(null); setActiveSpots({}); }, []);

  const openInterior = useCallback((id) => {
    const bodyId = INTERIOR_IDS.includes(id) ? id : 'earth';
    setInterior({ bodyId, open: true, explode: false, selected: null });
    setView('interior');
    setProgress((p) => markInterior(p, bodyId));
  }, []);

  const handleSpot = useCallback((key, data) => {
    setActiveSpots({ [key]: data });
    setVisited((v) => ({ ...v, [key]: true }));
  }, []);

  const extras = useCallback((id) => {
    if (view !== 'explore' || selectedId !== id) return null;
    const spots = BODY_DATA[id]?.advanced?.hotspots || [];
    return (
      <>
        {spots.map((hs, i) => {
          const key = `${id}-${i}`;
          return (
            <Hotspot
              key={key}
              position={normalizedSpot(id, hs.pos)}
              title={hs.title}
              desc={hs.desc}
              isVisited={!!visited[key]}
              isActive={!!activeSpots[key]}
              onClick={() => handleSpot(key, hs)}
            />
          );
        })}
        {VIDEOS[id] && <VideoStar video={VIDEOS[id]} onOpen={setVideo} />}
      </>
    );
  }, [view, selectedId, visited, activeSpots, handleSpot]);

  // ---- misiones ----
  const startMission = useCallback((id) => {
    setMission({ id, run: `${id}-${Date.now()}` });
    setMissionDone(false);
    setOutcome(null);
    setMissionFocus(null);
    setMissionScene(null);
    setSelectedId(null);
    setView('mission');
  }, []);

  const restartMission = useCallback(() => {
    setMission((m) => (m ? { ...m, run: `${m.id}-${Date.now()}` } : m));
    setMissionDone(false);
    setOutcome(null);
    setMissionFocus(null);
    setMissionScene(null);
  }, []);

  const toHub = useCallback(() => { setMission(null); setMissionDone(false); setMissionFocus(null); setView('hub'); }, []);
  const toExplore = useCallback(() => { setMission(null); setMissionDone(false); setMissionFocus(null); setView('explore'); }, []);

  const handleMissionComplete = useCallback((payload) => {
    const m = mission;
    if (!m || reported.current.has(m.run)) return;
    reported.current.add(m.run);
    onGameComplete?.(payload);
    const prev = progressRef.current;
    const nextP = recordMission(prev, m.id, { nota: payload.nota, points: payload.score });
    const before = rankFor(totalStars(prev));
    const after = rankFor(totalStars(nextP));
    setOutcome({
      stars: starsForNota(payload.nota),
      prevStars: prev.missions[m.id]?.stars || 0,
      record: !!prev.missions[m.id] && payload.nota > (prev.missions[m.id].best || 0),
      newRank: after.index > before.index ? after.rank.name : null,
      unlocked: MISSIONS.filter((x) => !isUnlocked(x, prev) && isUnlocked(x, nextP)).map((x) => x.title),
    });
    setProgress(nextP);
    setMissionDone(true);
  }, [mission, onGameComplete]);

  const pick = useCallback((id) => {
    pickSeq.current += 1;
    setPickEvent({ id, seq: pickSeq.current });
  }, []);

  // ---- reinicio de puntos de interés (modal propio) ----
  const doReset = () => {
    setConfirmReset(false);
    setIsResetting(true);
    setTimeout(() => {
      setVisited({});
      setActiveSpots({});
      setSelectedId(null);
      setIsResetting(false);
    }, reduced ? 200 : 2200);
  };

  // Escape cierra lo que haya abierto al explorar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || video) return;
      if (view === 'interior') setView('explore');
      else if (view === 'hub') setView('explore');
      else if (view === 'explore' && selectedId) closeSheet();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, selectedId, video, closeSheet]);

  // ---- qué pinta la escena ----
  const mDef = mission ? missionById(mission.id) : null;
  const kind = mDef?.kind;
  const inMission = view === 'mission' && !!mDef;
  const sceneKind = (view === 'interior' || (inMission && kind === 'layers')) ? 'interior' : 'system';
  const overlayFull = !!video || view === 'hub' || (inMission && (kind === 'order' || kind === 'quiz' || missionDone));
  const frameloop = overlayFull ? 'never' : Q.fps ? 'demand' : 'always';

  let scene = null;
  if (sceneKind === 'interior') {
    const ms = inMission ? missionScene : null;
    scene = (
      <InteriorScene
        Q={Q}
        tier={stage}
        reduced={reduced}
        bodyId={ms ? ms.bodyId : interior.bodyId}
        open={ms ? 1 : interior.open ? 1 : 0}
        explode={ms ? 1 : interior.explode ? 1 : 0}
        selected={ms ? ms.selected : interior.selected}
        feedback={ms ? ms.feedback : null}
        markerMode={ms ? ms.markerMode : narrow ? 'numbers' : 'names'}
        frame={narrow ? 'bottom' : inMission ? 'right' : 'left'}
        showMarkers={ms ? true : interior.open}
        onPick={inMission ? pick : (id) => setInterior((s) => ({ ...s, selected: s.selected === id ? null : id }))}
      />
    );
  } else {
    const riddle = inMission && kind === 'riddle';
    const focus = riddle ? missionFocus : view === 'explore' ? selectedId : null;
    scene = (
      <SolarScene
        Q={Q}
        simRef={simRef}
        mode={riddle ? 'visual' : scaleMode}
        focusId={focus}
        paused={config.paused || !!focus}
        speed={config.speed}
        spin={config.spin}
        showOrbits={config.orbits}
        orbitOpacity={config.orbitOpacity}
        showLabels={config.labels}
        onBodyClick={riddle ? pick : view === 'explore' ? selectBody : undefined}
        extras={extras}
        reduced={reduced}
        frame={riddle ? 'bottom' : narrow ? 'bottom' : 'left'}
      />
    );
  }

  const runKey = mission?.run;
  const missionProps = mission && mDef ? {
    mission: mDef,
    stage,
    outcome,
    onComplete: handleMissionComplete,
    onExit: toHub,
    onRestart: restartMission,
    onHub: toHub,
    onExplore: toExplore,
  } : null;

  const showWebGL = webgl && !glFailed;

  return (
    <GameShell
      theme="dark"
      wide
      accent="#818cf8"
      accent2="#fbbf24"
      className={`ss-shell ss-view-${view} ${video ? 'is-video' : ''} ${intro ? 'is-intro' : ''} ${overlayFull ? 'is-covered' : ''} ${selectedId && view === 'explore' ? 'has-sheet' : ''}`}
    >

      <div className={`ss-intro ${intro ? 'is-visible' : ''}`} aria-hidden={!intro}>
        <div className="ss-intro__content">
          <span className="ss-intro__halo" aria-hidden="true" />
          <span className="ss-intro__icon"><AppIcon appId="sistema-solar" size={120} /></span>
          <h1 className="ss-intro__title">Sistema Solar 3D</h1>
          <p className="ss-intro__subtitle">Explora · descubre · supera misiones</p>
          <div className="ss-intro__bar"><div className="ss-intro__fill" /></div>
        </div>
      </div>

      <div className="ss-scene">
        {showWebGL ? (
          <SceneBoundary onError={() => { markWebGLUnavailable(); setGlFailed(true); }}>
            <Canvas
              key={`${gfxTier}-${ctxKey}`}
              dpr={effectiveDpr(gfxTier)}
              gl={{ antialias: P.antialias, powerPreference: 'high-performance' }}
              camera={{ position: [0, 300, 640], fov: 45, near: 0.1, far: 14000 }}
              frameloop={frameloop}
            >
              <ContextLossGuard onLost={onContextLost} />
              {frameloop === 'demand' && <FrameLimiter fps={Q.fps} />}
              {pref === 'auto' && gfxTier !== 'low' && <GovernorTicker key={gfxTier} onDowngrade={handleDowngrade} />}
              <Suspense fallback={null}>{scene}</Suspense>
            </Canvas>
          </SceneBoundary>
        ) : (
          <div className="ss-nogl">
            <div className="ss-nogl__orbits" aria-hidden="true">
              {PLANET_IDS.map((id, i) => <span key={id} style={{ '--i': i + 1, '--pc': BODY_COLOR[id] }}><i /></span>)}
            </div>
            <p>Este navegador no puede mostrar gráficos 3D (WebGL desactivado). Puedes consultar las fichas y jugar las misiones igualmente.</p>
          </div>
        )}
      </div>

      {view === 'explore' && (
        <>
          <ControlPanel
            progress={progress}
            onMissions={() => { setSelectedId(null); setView('hub'); }}
            onHelp={() => setShowHelp(true)}
            mode={scaleMode}
            onMode={(m) => { setScaleMode(m); setSelectedId(null); }}
            config={config}
            setConfig={setConfig}
            simRef={simRef}
            onReset={() => setConfirmReset(true)}
            narrow={narrow}
            explored={explored}
          />
          {scaleMode !== 'visual' && !selectedId && (
            <div className="ss-scalehint" role="status">
              <Eye size={15} /> {SCALE_MODES.find((m) => m.id === scaleMode).hint}
            </div>
          )}
          {selectedId && (
            <PlanetSheet
              key={selectedId}
              id={selectedId}
              body={BODY_DATA[selectedId]}
              stage={stage}
              level={level}
              grade={grade}
              onClose={closeSheet}
              onInterior={() => openInterior(selectedId)}
              video={VIDEOS[selectedId]}
              onVideo={() => setVideo(VIDEOS[selectedId])}
              found={(BODY_DATA[selectedId]?.advanced?.hotspots || []).filter((_, i) => visited[`${selectedId}-${i}`]).length}
              foundTotal={BODY_DATA[selectedId]?.advanced?.hotspots?.length || 0}
            />
          )}
          <NavBar selected={selectedId} onSelect={selectBody} />
        </>
      )}

      {view === 'interior' && (
        <InteriorPanel
          bodyId={interior.bodyId}
          stage={stage}
          open={interior.open}
          explode={interior.explode}
          selected={interior.selected}
          onBody={(id) => { setInterior({ bodyId: id, open: true, explode: false, selected: null }); setProgress((p) => markInterior(p, id)); }}
          onOpen={(open) => setInterior((s) => ({ ...s, open, explode: open ? s.explode : false }))}
          onExplode={(explode) => setInterior((s) => ({ ...s, explode }))}
          onSelect={(id) => setInterior((s) => ({ ...s, selected: id }))}
          onClose={() => { setView('explore'); setSelectedId(interior.bodyId); }}
        />
      )}

      {view === 'hub' && (
        <MissionHub progress={progress} stage={stage} explored={explored} onStart={startMission} onClose={() => setView('explore')} />
      )}

      {inMission && kind === 'order' && <OrderMission key={runKey} {...missionProps} />}
      {inMission && kind === 'quiz' && <QuizMission key={runKey} {...missionProps} />}
      {inMission && kind === 'riddle' && (
        <>
          <RiddleMission key={runKey} {...missionProps} pickEvent={pickEvent} onFocus={setMissionFocus} />
          {!missionDone && <NavBar selected={missionFocus} onSelect={pick} />}
        </>
      )}
      {inMission && kind === 'layers' && <LayersMission key={runKey} {...missionProps} pickEvent={pickEvent} onScene={setMissionScene} />}

      {toast && <div className="ss-toast" role="status">{toast}</div>}

      <ConfirmDialog
        open={confirmReset}
        tone="danger"
        title="¿Reiniciar los puntos de interés?"
        confirmLabel="Sí, reiniciar"
        onConfirm={doReset}
        onCancel={() => setConfirmReset(false)}
      >
        Se borrarán los puntos de interés descubiertos en este dispositivo. Tus estrellas y misiones no se tocan.
      </ConfirmDialog>

      <VideoModal video={video} onClose={() => setVideo(null)} />

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo funciona el Sistema Solar 3D">
        <h3>🔭 Explorar</h3>
        <ul>
          <li>Toca un astro en la escena (o en la <strong>barra inferior</strong>) para volar hasta él y abrir su <strong>ficha</strong>: datos, comparación con la Tierra, «Tú allí» (tu peso y tu edad) y misiones espaciales.</li>
          <li>Los <strong>puntos dorados</strong> son puntos de interés; la <strong>estrella</strong> abre un vídeo.</li>
          <li>Cambia la <strong>escala</strong>: visual, distancias reales o tamaños reales. ¡Verás lo enorme que es el Sistema Solar!</li>
          <li>Los planetas parten de su posición real de hoy y giran con sus periodos reales. Arrastra para girar la cámara y usa la rueda o dos dedos para el zoom.</li>
        </ul>
        <h3>🧅 Interior en 3D</h3>
        <p>Desde la ficha, pulsa <strong>Ver el interior en 3D</strong>: el astro se abre por la mitad y puedes separar sus capas y tocarlas para conocerlas.</p>
        <h3>🚀 Misiones</h3>
        <ul>
          <li><strong>Ordena el Sistema Solar</strong>, <strong>¿Qué planeta soy?</strong>, <strong>¿Más o menos?</strong>, <strong>Viaje al interior</strong>, <strong>Plan de vuelo</strong> y el <strong>Gran examen</strong>.</li>
          <li>Cada misión terminada tiene <strong>nota sobre 10</strong> (lo que aciertas a la primera) y cuenta para tus tareas. Además ganas puntos por rapidez, racha y usar pocas pistas.</li>
          <li>Con 5, 7 y 9 consigues 1, 2 o 3 estrellas. Las estrellas suben tu rango y desbloquean misiones nuevas.</li>
        </ul>
      </InstructionsModal>

      <div className={`ss-reboot ${isResetting ? 'is-active' : ''}`} aria-hidden={!isResetting}>
        <div className="ss-reboot__wipe" />
        <div className="ss-reboot__scan" />
        <div className="ss-reboot__bar" />
        <div className="ss-reboot__text">
          <strong>Reiniciando el diario</strong>
          <span>Calibrando telescopios…</span>
        </div>
      </div>
    </GameShell>
  );
};

// Si el renderer no se puede crear (WebGL bloqueado a mitad), no tumbamos la app
class SceneBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.warn('[sistema-solar] escena 3D desactivada:', err?.message); this.props.onError?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default SistemaSolar;
