// src/apps/generador-personajes/GeneradorPersonajes.jsx
// Generador de personajes históricos — herramienta docente (rediseño 2026 sobre
// el kit _shared/kit). Sin modos ni nota (CLAUDE.md §3).
//
// La lógica NO cambia: carga con getAppContent('generador-personajes', level, grade),
// selección aleatoria (total o con filtros de sexo/categoría, evitando repetir el
// último nombre), asignador por alumno (Fisher-Yates) y exportación a CSV con el
// mismo formato y nombre de fichero. Aquí solo cambia la presentación: carta
// coleccionable con medallón y laureles, controles del kit y asignaciones en fichas.
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dices, Users, Download, Wand2, ShieldCheck, Shuffle, AlertTriangle, ChevronDown,
  FlaskConical, Palette, Landmark, Scale, Compass, Trophy, Sparkles, LayoutGrid, ArrowRight,
  Zap, Clapperboard, BookOpen, PawPrint,
} from 'lucide-react';
import { getAppContent } from '../../services/gameDataService';
import {
  GameShell, GameHeader, Hud, HudStat, Panel, Chip, GameButton, Segmented, GameLoading,
} from '../_shared/kit';
import useArtIds from '@/components/art/useArtIds';
import { GlowGradient, GlossGradient, MaterialGradient, Sparkle } from '@/components/art/primitives';
import '@/styles/art.css';
import './GeneradorPersonajes.css';

/* ── Presentación: tonos e iconos ─────────────────────────────── */

const SEXO_OPTIONS = [
  { value: 'Cualquiera', label: 'Cualquiera' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Hombre', label: 'Hombre' },
];

// Icono y tono de cada categoría (por palabras clave; las desconocidas usan el genérico).
const CATEGORY_STYLES = [
  { re: /cienc|tecno/i, Icon: FlaskConical, tone: 'cyan' },
  { re: /arte|cultur|m[uú]sic|liter/i, Icon: Palette, tone: 'pink' },
  { re: /pol[ií]t|l[ií]der/i, Icon: Landmark, tone: 'amber' },
  { re: /derech|socied/i, Icon: Scale, tone: 'violet' },
  { re: /explor|descubr/i, Icon: Compass, tone: 'emerald' },
  { re: /deport/i, Icon: Trophy, tone: 'orange' },
  // categorías de los primeros cursos de Primaria (personajes de ficción)
  { re: /super|h[ée]roe/i, Icon: Zap, tone: 'orange' },
  { re: /dibuj|animad/i, Icon: Clapperboard, tone: 'pink' },
  { re: /cuento|f[áa]bula/i, Icon: BookOpen, tone: 'violet' },
  { re: /animal/i, Icon: PawPrint, tone: 'emerald' },
];
const ANY_CATEGORY = { Icon: LayoutGrid, tone: 'indigo' };
const categoryStyle = (cat) => CATEGORY_STYLES.find((c) => c.re.test(cat || '')) || { Icon: Sparkles, tone: 'indigo' };

const sexoTone = (s) => (s === 'Mujer' ? 'mujer' : s === 'Hombre' ? 'hombre' : 'neutro');
const initialOf = (nombre) => (nombre || '?').trim().charAt(0).toUpperCase();

/* ── Medallón con laureles (SVG, sin filtros) ────────────────── */

const FIELD = {
  mujer: ['#f5d0fe', '#c026d3', '#4a044e'],
  hombre: ['#bfdbfe', '#2563eb', '#172554'],
  neutro: ['#ddd6fe', '#7c3aed', '#2e1065'],
};

// Hojas de la corona: dos ramas que suben desde abajo por los lados del medallón.
const LAUREL = (() => {
  const C = 100;
  const R = 79;
  const rad = (d) => (d * Math.PI) / 180;
  const at = (deg, r) => [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))];
  const leaves = [];
  for (let k = 0; k < 8; k++) {
    const l = 106 + k * 15; // rama izquierda: abajo → arriba
    const r = 74 - k * 15; // rama derecha
    const [lo, li] = [at(l, R + 6.5), at(l - 4, R - 6)];
    const [ro, ri] = [at(r, R + 6.5), at(r + 4, R - 6)];
    leaves.push({ id: `l${k}o`, x: lo[0], y: lo[1], rot: l + 90 - 32 });
    leaves.push({ id: `l${k}i`, x: li[0], y: li[1], rot: l + 90 + 30 });
    leaves.push({ id: `r${k}o`, x: ro[0], y: ro[1], rot: r - 90 + 32 });
    leaves.push({ id: `r${k}i`, x: ri[0], y: ri[1], rot: r - 90 - 30 });
  }
  const [a1, a2, b1, b2] = [at(100, R), at(214, R), at(80, R), at(-34, R)];
  const stems = [
    `M${a1[0].toFixed(1)} ${a1[1].toFixed(1)}A${R} ${R} 0 0 1 ${a2[0].toFixed(1)} ${a2[1].toFixed(1)}`,
    `M${b1[0].toFixed(1)} ${b1[1].toFixed(1)}A${R} ${R} 0 0 0 ${b2[0].toFixed(1)} ${b2[1].toFixed(1)}`,
  ];
  return { leaves, stems };
})();

const Medallion = ({ letter, tone = 'neutro' }) => {
  const [id, url] = useArtIds();
  const [fl, fb, fd] = FIELD[tone] || FIELD.neutro;
  return (
    <svg className="art gpx-medal" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fde68a" opacity={0.42} mid={0.4} />
        <MaterialGradient id={id('gold')} light="#fef3c7" base="#fbbf24" dark="#a16207" />
        <MaterialGradient id={id('leaf')} light="#fef9c3" base="#f5b316" dark="#8a4b0b" />
        <radialGradient id={id('field')} cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor={fl} />
          <stop offset="0.45" stopColor={fb} />
          <stop offset="1" stopColor={fd} />
        </radialGradient>
        <linearGradient id={id('letter')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.5" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id={id('vignette')} cx="0.66" cy="0.72" r="0.7">
          <stop offset="0" stopColor="#0b0420" stopOpacity="0.4" />
          <stop offset="1" stopColor="#0b0420" stopOpacity="0" />
        </radialGradient>
        <GlossGradient id={id('gloss')} opacity={0.45} />
      </defs>

      <circle cx="100" cy="100" r="98" fill={url('aura')} />

      {/* corona de laurel dorada */}
      {LAUREL.stems.map((d) => <path key={d} d={d} stroke="#b45309" strokeWidth="2.4" strokeLinecap="round" />)}
      {LAUREL.leaves.map((l) => (
        <ellipse key={l.id} cx={l.x.toFixed(1)} cy={l.y.toFixed(1)} rx="10" ry="4.3" fill={url('leaf')} transform={`rotate(${l.rot.toFixed(1)} ${l.x.toFixed(1)} ${l.y.toFixed(1)})`} />
      ))}

      {/* lazo que ata las dos ramas */}
      <path d="M99 176C92 182 86 188 79 197L86 195.5L88 202C93 194 97 186 101 179Z" fill={fd} />
      <path d="M101 176C108 182 114 188 121 197L114 195.5L112 202C107 194 103 186 99 179Z" fill={fb} />
      <path d="M100 177C94 171 86 170 84 174C82 179 92 181 100 178Z" fill={fb} />
      <path d="M100 177C106 171 114 170 116 174C118 179 108 181 100 178Z" fill={fd} />
      <circle cx="100" cy="177.5" r="5.4" fill={url('gold')} />
      <circle cx="98.4" cy="175.8" r="1.6" fill="#fff" opacity="0.6" />

      {/* medallón */}
      <circle cx="102.5" cy="105" r="66" fill="#12052b" opacity="0.4" />
      <circle cx="100" cy="100" r="64" fill={url('gold')} />
      <circle cx="100" cy="100" r="59.4" stroke="#fef3c7" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.1 6.1" />
      <circle cx="100" cy="100" r="55" fill="#7c2d12" />
      <circle cx="100" cy="100" r="53.4" fill={url('field')} />
      <circle cx="100" cy="100" r="46" stroke="#fff" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="1.5 3.5" />
      <circle cx="100" cy="100" r="53.4" fill={url('vignette')} />

      {/* inicial en relieve */}
      <text x="100" y="104" textAnchor="middle" dominantBaseline="central" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="66" fill="#12052b" opacity="0.4">{letter}</text>
      <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="66" fill={url('letter')} stroke="#78350f" strokeOpacity="0.35" strokeWidth="1.2">{letter}</text>

      {/* brillos */}
      <ellipse cx="82" cy="70" rx="27" ry="12" transform="rotate(-32 82 70)" fill={url('gloss')} />
      <path d="M44.6 78A60 60 0 0 1 80 41.5" stroke="#fff" strokeOpacity="0.8" strokeWidth="2.6" strokeLinecap="round" />
      <Sparkle x={156} y={44} r={8} fill="#fffbeb" idle />
      <Sparkle x={40} y={150} r={4.5} fill="#fde68a" idle delay={1.2} />
    </svg>
  );
};

/* ── Cartas ───────────────────────────────────────────────────── */

const CardFrame = ({ className = '', children }) => (
  <div className={`gpx-card ${className}`}>
    <div className="gpx-card__face">
      <span className="gpx-card__rays" aria-hidden="true" />
      <span className="gpx-card__line" aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      {children}
    </div>
  </div>
);

// Destellos que salen despedidos una sola vez al revelar la carta.
const BURST = [[-120, -96], [118, -110], [140, 10], [-142, 26], [-96, 120], [104, 126], [6, -150], [-30, 150]];

const CharacterCard = ({ personaje }) => {
  const { Icon, tone } = categoryStyle(personaje.categoria);
  const sx = sexoTone(personaje.sexo);
  return (
    <CardFrame className={`gpx-card--front gpx-sx-${sx}`}>
      <span className="gpx-card__sheen" aria-hidden="true" />
      <div className="gpx-card__top">
        <span className="gpx-card__kicker">Tu personaje</span>
        <span className={`gpx-card__badge gpx-tone-${tone}`} title={personaje.categoria}><Icon size={16} /></span>
      </div>
      <div className="gpx-card__portrait">
        <Medallion letter={initialOf(personaje.nombre)} tone={sx} />
      </div>
      <div className="gpx-card__plate">
        <h3 className="gpx-card__name">{personaje.nombre}</h3>
      </div>
      <div className="gpx-card__chips">
        <span className={`gpx-tag gpx-tag--sx-${sx}`}>{personaje.sexo}</span>
        <span className={`gpx-tag gpx-tone-${tone}`}><Icon size={13} /> {personaje.categoria}</span>
      </div>
    </CardFrame>
  );
};

const CardBack = () => (
  <CardFrame className="gpx-card--back">
    <span className="gpx-card__lattice" aria-hidden="true" />
    <div className="gpx-card__top">
      <span className="gpx-card__kicker">Tu personaje</span>
      <span className="gpx-card__badge gpx-tone-amber"><Dices size={16} /></span>
    </div>
    <div className="gpx-card__portrait">
      <Medallion letter="?" tone="neutro" />
    </div>
    <div className="gpx-card__plate">
      <h3 className="gpx-card__name">¿Quién será?</h3>
    </div>
  </CardFrame>
);

const WarningCard = ({ title, children }) => (
  <div className="gpx-warn gk-anim-shake" role="alert">
    <span className="gpx-warn__icon"><AlertTriangle size={30} aria-hidden="true" /></span>
    <strong className="gpx-warn__title">{title}</strong>
    <p className="gpx-warn__text">{children}</p>
  </div>
);

const GeneradorPersonajes = () => {
  const { level, grade } = useParams();
  const [personajes, setPersonajes] = useState([]);
  const [sexo, setSexo] = useState('Cualquiera');
  const [categoria, setCategoria] = useState('Cualquiera');
  const [aleatorioTotal, setAleatorioTotal] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [ultimoNombre, setUltimoNombre] = useState('');

  // New state for the assigner feature
  const [isAssignerVisible, setIsAssignerVisible] = useState(false);
  const [studentList, setStudentList] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    getAppContent('generador-personajes', level, grade)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Los datos no son un array');
        setPersonajes(data);
        const uniqueCategorias = [...new Set(data.map(p => p.categoria))];
        setCategorias(uniqueCategorias);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [level, grade]);

  const seleccionarAleatorioTotal = () => {
    if (personajes.length === 0) return null;
    let candidato = null;
    let intentos = 0;
    do {
      candidato = personajes[Math.floor(Math.random() * personajes.length)];
      intentos++;
    } while (candidato && candidato.nombre === ultimoNombre && intentos < 10);
    return candidato;
  };

  const seleccionarConFiltros = (sexoFiltro, categoriaFiltro) => {
    const candidatos = personajes.filter((p) => {
      const coincideSexo = sexoFiltro === 'Cualquiera' ? true : p.sexo === sexoFiltro;
      const coincideCat = categoriaFiltro === 'Cualquiera' ? true : p.categoria === categoriaFiltro;
      return coincideSexo && coincideCat;
    });
    if (candidatos.length === 0) return null;
    let candidato = null;
    let intentos = 0;
    do {
      candidato = candidatos[Math.floor(Math.random() * candidatos.length)];
      intentos++;
    } while (candidato && candidato.nombre === ultimoNombre && intentos < 10);
    return candidato;
  };

  const handleObtener = async () => {
    if (personajes.length === 0) return;
    let personaje = null;
    if (aleatorioTotal) {
      personaje = seleccionarAleatorioTotal();
    } else {
      personaje = seleccionarConFiltros(sexo, categoria);
    }
    if (!personaje) {
      setResultado(null);
      setMensaje('sin');
      return;
    }
    setMensaje(null);
    setResultado(personaje);
    setUltimoNombre(personaje.nombre);
  };

  const handleAssignCharacters = () => {
    if (personajes.length === 0 || !studentList.trim()) return;

    const students = studentList.trim().split('\n').filter(name => name.trim() !== '');
    if (students.length === 0) return;

    // Shuffle characters array (Fisher-Yates shuffle)
    const shuffledPersonajes = [...personajes];
    for (let i = shuffledPersonajes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPersonajes[i], shuffledPersonajes[j]] = [shuffledPersonajes[j], shuffledPersonajes[i]];
    }

    const newAssignments = students.map((student, index) => ({
      student: student.trim(),
      character: shuffledPersonajes[index % shuffledPersonajes.length]
    }));

    setAssignments(newAssignments);
  };

  const handleExportToCSV = () => {
    if (assignments.length === 0) return;

    const csvHeader = 'Alumno;Personaje;Sexo;Categoría\n';
    const csvRows = assignments.map(item => 
      `${item.student};${item.character.nombre};${item.character.sexo};${item.character.categoria}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'asignacion_personajes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Solo presentación (derivado del estado) ---
  const cargando = personajes.length === 0 && !error;
  const numAlumnos = studentList.split('\n').filter((n) => n.trim() !== '').length;
  const stageKey = error ? 'error'
    : mensaje === 'sin' ? 'sin'
      : resultado ? `p-${resultado.nombre}`
        : cargando ? 'cargando' : 'vacia';

  const renderResultado = () => {
    if (error) {
      return <WarningCard title="Error al cargar datos">{error}</WarningCard>;
    }
    if (mensaje === 'sin') {
      return <WarningCard title="Sin coincidencias">Prueba a cambiar el sexo o la categoría</WarningCard>;
    }
    if (resultado) {
      return (
        <div className="gpx-reveal">
          <span className="gpx-burst" aria-hidden="true">
            {BURST.map(([dx, dy], i) => (
              <i key={i} style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, '--d': `${0.12 + i * 0.03}s` }} />
            ))}
          </span>
          <CharacterCard personaje={resultado} />
        </div>
      );
    }
    if (cargando) {
      return <GameLoading label="Cargando personajes…" />;
    }
    return (
      <div className="gpx-empty">
        <CardBack />
        <div className="gpx-empty__text">
          <strong>Pulsa el botón para empezar</strong>
          <span>Puedes usar «Aleatorio total» o filtrar por sexo y categoría</span>
        </div>
      </div>
    );
  };

  return (
    <GameShell accent="#7c3aed" accent2="#d946ef" className="gpx-shell">
      <GameHeader
        right={personajes.length > 0 && (
          <Hud>
            <HudStat icon={Users} tone="accent" value={personajes.length} label="Personajes" />
            <HudStat icon={LayoutGrid} tone="streak" value={categorias.length} label="Categorías" />
          </Hud>
        )}
      />

      <div className="gpx-main">
        {/* ── Controles ─────────────────────────────── */}
        <Panel variant="surface" className="gpx-controls">
          <label className={`gpx-switch${aleatorioTotal ? ' is-on' : ''}`} htmlFor="gp-aleatorio-total">
            <span className="gpx-switch__icon"><Dices size={20} /></span>
            <span className="gpx-switch__text">
              <strong>Aleatorio total</strong>
              <small>Cualquier personaje, sin filtros</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              id="gp-aleatorio-total"
              className="gpx-switch__input"
              checked={aleatorioTotal}
              onChange={(e) => setAleatorioTotal(e.target.checked)}
            />
            <span className="gpx-switch__track" aria-hidden="true"><span className="gpx-switch__thumb" /></span>
          </label>

          <div className={`gpx-filters${aleatorioTotal ? ' is-disabled' : ''}`}>
            <div className="gpx-field">
              <span className="gpx-field__label">Sexo</span>
              <div className="gpx-seg">
                <Segmented
                  options={SEXO_OPTIONS.map((o) => ({ ...o, disabled: aleatorioTotal }))}
                  value={sexo}
                  onChange={setSexo}
                />
              </div>
            </div>

            <div className="gpx-field">
              <span className="gpx-field__label" id="gpx-cat-label">Categoría</span>
              <div className="gpx-cats" role="radiogroup" aria-labelledby="gpx-cat-label">
                {['Cualquiera', ...categorias].map((cat) => {
                  const { Icon, tone } = cat === 'Cualquiera' ? ANY_CATEGORY : categoryStyle(cat);
                  const on = categoria === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={aleatorioTotal}
                      className={`gpx-cat gpx-tone-${tone}${on ? ' is-on' : ''}`}
                      onClick={() => setCategoria(cat)}
                    >
                      <span className="gpx-cat__icon"><Icon size={15} /></span>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <GameButton size="lg" icon={Shuffle} onClick={handleObtener} className="gpx-cta">
            Obtener personaje
          </GameButton>
        </Panel>

        {/* ── Escenario de la carta ─────────────────── */}
        <Panel variant="screen" className="gpx-stage">
          <span className="gpx-stage__spot" aria-hidden="true" />
          <section className="gpx-stage__table" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stageKey}
                className="gpx-flip"
                initial={{ opacity: 0, rotateY: -90, scale: 0.9 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 22 } }}
                exit={{ opacity: 0, rotateY: 90, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }}
              >
                {renderResultado()}
              </motion.div>
            </AnimatePresence>
          </section>
          {resultado && !error && mensaje !== 'sin' && (
            <p className="gpx-stage__hint"><Shuffle size={14} /> Pulsa otra vez para descubrir otro personaje</p>
          )}
        </Panel>
      </div>

      {/* ── Asignador por alumno ─────────────────────── */}
      <div className="gpx-assigner-toggle">
        <GameButton
          variant="soft"
          icon={Users}
          iconRight={ChevronDown}
          className={`gpx-toggle${isAssignerVisible ? ' is-open' : ''}`}
          aria-expanded={isAssignerVisible}
          onClick={() => setIsAssignerVisible(!isAssignerVisible)}
        >
          {isAssignerVisible ? 'Ocultar Asignador por Alumno' : 'Mostrar Asignador por Alumno'}
        </GameButton>
      </div>

      {isAssignerVisible && (
        <motion.section
          className="gpx-assigner"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Panel variant="surface" className="gpx-assigner__panel">
            <header className="gpx-assigner__head">
              <span className="gpx-assigner__badge" aria-hidden="true"><Wand2 size={22} /></span>
              <div>
                <h2 className="gpx-assigner__title">Asignar Personajes a Alumnos</h2>
                <p className="gpx-assigner__sub">Reparte al azar un personaje a cada alumno de tu lista.</p>
              </div>
            </header>

            <div className="gpx-assigner__grid">
              <div className="gpx-assigner__input">
                <label htmlFor="student-list" className="gpx-field__label">Lista de Alumnos (uno por línea)</label>
                <div className="gpx-textarea-wrap">
                  <textarea
                    id="student-list"
                    className="gpx-textarea"
                    rows="10"
                    value={studentList}
                    onChange={(e) => setStudentList(e.target.value)}
                    placeholder="Pega aquí la lista de alumnos, uno por cada línea..."
                  />
                  <span className="gpx-textarea__count" aria-hidden="true">
                    <Users size={13} /> {numAlumnos}
                  </span>
                </div>
              </div>

              <aside className="gpx-privacy" role="note">
                <span className="gpx-privacy__icon" aria-hidden="true"><ShieldCheck size={22} /></span>
                <p className="gpx-privacy__title">Información de Privacidad</p>
                <p className="gpx-privacy__text">
                  Puedes incluir los nombres reales de tus alumnos sin miedo a la protección de datos. La lista de alumnos NO se almacena en ningún servidor. El proceso se realiza localmente en tu navegador.
                </p>
              </aside>
            </div>

            <div className="gpx-assigner__actions">
              <GameButton icon={Wand2} onClick={handleAssignCharacters}>
                Asignar Personajes
              </GameButton>
              <GameButton
                variant="soft"
                icon={Download}
                onClick={handleExportToCSV}
                disabled={assignments.length === 0}
              >
                Exportar a CSV
              </GameButton>
            </div>

            {assignments.length > 0 && (
              <div className="gpx-results">
                <div className="gpx-results__head">
                  <h3 className="gpx-results__title">Asignaciones</h3>
                  <Chip tone="accent">{assignments.length}</Chip>
                </div>
                <ul className="gpx-pairs" key={assignments.map((a) => a.character.nombre).join('|')}>
                  {assignments.map((item, index) => {
                    const sx = sexoTone(item.character.sexo);
                    return (
                      <motion.li
                        key={index}
                        className={`gpx-pair gpx-sx-${sx}`}
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: Math.min(index, 20) * 0.035, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <span className="gpx-pair__student">{item.student}</span>
                        <ArrowRight size={16} className="gpx-pair__arrow" aria-hidden="true" />
                        <span className="gpx-pair__char">
                          <span className="gpx-pair__seal" aria-hidden="true">{initialOf(item.character.nombre)}</span>
                          <span className="gpx-pair__name">
                            {item.character.nombre}
                            <small>{item.character.categoria}</small>
                          </span>
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Panel>
        </motion.section>
      )}
    </GameShell>
  );
};

export default GeneradorPersonajes;
