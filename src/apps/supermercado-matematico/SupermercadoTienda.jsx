// Supermercado matemático — interfaz común de los 6 cursos (rediseño 2026 sobre _shared/kit).
// Tienda con estantería de productos con etiqueta de precio, ticket de la misión
// (cesta, billetes y cupones) y caja registradora con pantalla y teclado.
//
// SOLO presentación: la lógica vive en useSupermercadoGame (misiones, examen,
// tiempo, puntos). El registro del examen (onGameComplete) es el MISMO efecto que
// tenía _shared/TestScreen.jsx, copiado sin cambios (payload, momento y flag).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Clock, ClipboardList, Delete, LayoutGrid, RefreshCw, ShoppingBasket, SkipForward, Target, Trophy, Flame,
} from 'lucide-react';
import useArtIds from '@/components/art/useArtIds';
import InstructionsModal from '@/apps/_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressBar, KeyTile, GameButton, ModeSelect, RoundBanner,
  ResultsScreen, FeedbackItem,
} from '@/apps/_shared/kit';
import '@/apps/_shared/SupermercadoShared.css';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lee la misión para dibujar la cesta (solo presentación): productos que
// aparecen en el texto con su cantidad, billete con el que se paga y descuento.
const parseMission = (texto = '', productos = []) => {
  const items = [];
  productos.forEach((p) => {
    const re = new RegExp(`(?:(\\d+)\\s+(?:de\\s+)?|un\\/a\\s+|un\\s+)?${escapeRe(p.nombre)}(?![a-záéíóúñ])`, 'gi');
    let qty = 0;
    let m = re.exec(texto);
    while (m) {
      qty += m[1] ? parseInt(m[1], 10) : 1;
      m = re.exec(texto);
    }
    if (qty > 0) items.push({ ...p, qty });
  });
  const bill = texto.match(/billete de (\d+)\s*€/i);
  const discount = texto.match(/(\d+)\s*%/);
  return { items, bill: bill ? Number(bill[1]) : null, discount: discount ? Number(discount[1]) : null };
};

/* ───────────────────────── Ilustraciones (SVG sin filtros) ───────────────────────── */

const BILL_TONES = {
  5: ['#e2e8f0', '#94a3b8', '#475569'],
  10: ['#fecaca', '#f87171', '#b91c1c'],
  20: ['#bfdbfe', '#60a5fa', '#1d4ed8'],
  50: ['#fed7aa', '#fb923c', '#c2410c'],
};

// Billete de euro.
export const Banknote = ({ value }) => {
  const [id, url] = useArtIds();
  const [l, b, d] = BILL_TONES[value] || BILL_TONES[20];
  return (
    <svg viewBox="0 0 132 70" className="smk-bill" role="img" aria-label={`Billete de ${value} euros`}>
      <defs>
        <linearGradient id={id('paper')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={l} />
          <stop offset=".55" stopColor={b} />
          <stop offset="1" stopColor={d} />
        </linearGradient>
      </defs>
      <rect x="2" y="5" width="128" height="62" rx="7" fill={d} opacity=".35" />
      <rect x="2" y="2" width="128" height="62" rx="7" fill={url('paper')} />
      <rect x="7" y="7" width="118" height="52" rx="4" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.4" />
      <circle cx="96" cy="33" r="17" fill="#fff" opacity=".22" />
      <path d="M80 50 V30 Q96 12 112 30 V50" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2.2" />
      <path d="M86 50 V33 Q96 22 106 33 V50" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.6" />
      <text x="14" y="36" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="800" fontSize="26" fill="#fff">{value}</text>
      <text x="15" y="53" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="11" fill="#fff" opacity=".9">EURO</text>
      <text x="96" y="39" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="800" fontSize="16" fill="#fff">€</text>
      <path d="M6 14 Q30 4 60 10" stroke="#fff" strokeOpacity=".45" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Moneda de euro (bimetálica o dorada).
const Coin = ({ kind = '1', x = 0, y = 0, r = 16 }) => {
  const [id, url] = useArtIds();
  const outer = kind === '2' ? 'silver' : 'gold';
  const inner = kind === '1' ? 'silver' : 'gold';
  const flat = kind === '50';
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id('gold')} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset=".5" stopColor="#facc15" />
          <stop offset="1" stopColor="#a16207" />
        </radialGradient>
        <radialGradient id={id('silver')} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#64748b" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy={r * 0.25} rx={r} ry={r} fill="#1e1b4b" opacity=".25" />
      <circle r={r} fill={url(flat ? 'gold' : outer)} />
      {!flat && <circle r={r * 0.66} fill={url(inner)} />}
      <circle r={r * 0.86} fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="1" strokeDasharray="1.5 2" />
      <text y={r * 0.3} textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="800" fontSize={r * (flat ? 0.75 : 0.9)} fill={flat ? '#854d0e' : '#334155'}>
        {flat ? '50' : kind}
      </text>
      <path d={`M${-r * 0.6} ${-r * 0.45} Q${-r * 0.2} ${-r * 0.85} ${r * 0.25} ${-r * 0.8}`} stroke="#fff" strokeOpacity=".8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
};

// Bandeja del cambio (decoración de la caja).
const CoinTray = () => (
  <svg viewBox="0 0 150 52" className="smk-tray" aria-hidden="true">
    <path d="M6 22 H144 Q146 22 145 26 L138 46 Q137 50 132 50 H18 Q13 50 12 46 L5 26 Q4 22 6 22 Z" fill="#1e1b4b" opacity=".18" />
    <Coin kind="2" x={40} y={28} r={15} />
    <Coin kind="1" x={74} y={32} r={14} />
    <Coin kind="50" x={104} y={30} r={12} />
    <Coin kind="1" x={126} y={34} r={10} />
  </svg>
);

/* ───────────────────────── Piezas ───────────────────────── */

const ProductCard = ({ p, price, wanted }) => (
  <div className={`smk-prod ${wanted ? 'is-wanted' : ''}`}>
    <span className="smk-prod__tag" aria-label={`Precio ${price} euros`}>
      <span className="smk-prod__hole" aria-hidden="true" />
      {price}<small>€</small>
    </span>
    <span className="smk-prod__emoji" aria-hidden="true">{p.emoji}</span>
    <span className="smk-prod__name">{p.nombre}</span>
    {wanted > 1 && <span className="smk-prod__qty">×{wanted}</span>}
  </div>
);

const KEYS_DEC = ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', 'del'];
const KEYS_INT = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'clear', '0', 'del'];

/* ───────────────────────── Componente ───────────────────────── */

const SupermercadoTienda = ({ game, productos, onGameComplete, pregunta, placeholder = '0', decimals = false }) => {
  // Pantalla previa de modos (CLAUDE.md §3). El examen lo controla el hook (isTestMode).
  const [screen, setScreen] = useState('menu');
  const [showHelp, setShowHelp] = useState(false);
  const [practiceHits, setPracticeHits] = useState(0);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const inputRef = useRef(null);

  const formatPrice = (price) => (decimals ? price.toFixed(2).replace('.', ',') : String(price));
  // Mismo formato que tenía TestScreen para las soluciones del resumen.
  const formatSolution = (price) => (Number.isInteger(price) ? price : price.toFixed(2).replace('.', ','));

  const basket = useMemo(() => parseMission(game.mision?.texto, productos), [game.mision, productos]);

  // Marcador de práctica: un acierto por misión (solo presentación).
  const scoredMisionRef = useRef(null);
  useEffect(() => {
    if (game.isTestMode) return;
    if (game.feedback.clase === 'correcta') {
      if (scoredMisionRef.current !== game.mision) {
        scoredMisionRef.current = game.mision;
        setPracticeHits((h) => h + 1);
        setPracticeStreak((s) => s + 1);
      }
    } else if (game.feedback.clase === 'incorrecta') {
      setPracticeStreak(0);
    }
  }, [game.feedback, game.mision, game.isTestMode]);

  // --- Registro del examen: copiado tal cual de _shared/TestScreen.jsx ---
  const trackedRef = useRef(false);
  useEffect(() => {
    if (game.showResults && !trackedRef.current) {
      trackedRef.current = true;
      const correct = game.testQuestions.filter((q, i) => {
        const userAnswer = parseFloat(String(game.userAnswers[i]).replace(',', '.'));
        return Math.abs(userAnswer - q.solucion) < 0.001;
      }).length;
      onGameComplete?.({
        mode: 'test',
        score: game.score,
        maxScore: game.TOTAL_TEST_QUESTIONS * 200,
        correctAnswers: correct,
        totalQuestions: game.TOTAL_TEST_QUESTIONS,
        durationSeconds: game.elapsedTime || undefined,
      });
    }
    if (!game.showResults) trackedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.showResults, game.score, onGameComplete]);

  // En el examen, al pasar de misión la pantalla de la caja recupera el foco
  // para seguir tecleando (solo con ratón/teclado; en táctil no abre el teclado).
  useEffect(() => {
    if (!game.isTestMode || game.showResults) return;
    if (window.matchMedia?.('(pointer: coarse)').matches) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [game.isTestMode, game.showResults, game.currentQuestionIndex]);

  const shellProps = { accent: '#f97316', accent2: '#db2777' };

  const instructions = (
    <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo se juega">
      <h3>🎯 Objetivo</h3>
      <p>Lee la <strong>misión</strong> del ticket, busca los precios en la estantería y calcula cuánto hay que pagar (o cuánto te devuelven).</p>
      <h3>🕹️ Cómo se juega</h3>
      <ul>
        <li>Cada producto lleva su <strong>etiqueta de precio</strong>.</li>
        <li>Escribe el resultado en la pantalla de la caja con el teclado numérico (o con el de tu ordenador){decimals ? ' y usa la coma para los céntimos' : ''}.</li>
        <li>Pulsa <strong>Comprobar</strong> (o Intro) para saber si has acertado.</li>
      </ul>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Práctica</strong>Misiones sin fin con corrección al momento.</div>
        <div className="instr-mode exam"><strong>Examen</strong>{game.TOTAL_TEST_QUESTIONS} misiones seguidas. Nota sobre 10 y puntos extra por rapidez.</div>
      </div>
      <div className="instr-tips"><strong>💡 Truco:</strong> para el cambio, resta lo que cuesta la compra al dinero con el que pagas.</div>
    </InstructionsModal>
  );

  // --- Resultados del examen ---
  if (game.isTestMode && game.showResults) {
    const isOk = (q, i) => Math.abs(parseFloat(String(game.userAnswers[i]).replace(',', '.')) - q.solucion) < 0.001;
    const correctAnswers = game.testQuestions.filter(isOk).length;
    const nota = Math.round((correctAnswers / game.TOTAL_TEST_QUESTIONS) * 100) / 10;
    return (
      <GameShell {...shellProps}>
        <ResultsScreen
          nota={nota}
          points={game.score}
          stats={[
            { icon: Target, tone: 'good', label: 'Aciertos', value: `${correctAnswers}/${game.TOTAL_TEST_QUESTIONS}` },
            { icon: Clock, tone: 'time', label: 'Tiempo', value: `${game.elapsedTime}s` },
          ]}
          actions={[
            { label: 'Volver a intentar', onClick: game.startTest, icon: RefreshCw },
            { label: 'Cambiar de modo', onClick: () => { game.exitTestMode(); setScreen('menu'); }, icon: LayoutGrid, variant: 'soft' },
          ]}
        >
          {game.testQuestions.map((q, i) => (
            <FeedbackItem key={i} index={i + 1} ok={isOk(q, i)} title={`Solución: ${formatSolution(q.solucion)} €`}>
              {q.texto}
              <span className="smk-fb-answer"> · Tu respuesta: <strong>{game.userAnswers[i] || 'N/A'}</strong></span>
            </FeedbackItem>
          ))}
        </ResultsScreen>
      </GameShell>
    );
  }

  // --- Pantalla previa ---
  if (!game.isTestMode && screen === 'menu') {
    const modes = [
      {
        id: 'practice', tone: 'easy', title: 'Práctica',
        desc: 'Misiones de compra sin fin: calcula y comprueba en la caja.',
        features: ['Corrección al instante', 'Estantería con precios'],
      },
      {
        id: 'exam', tone: 'exam', title: 'Examen',
        desc: `${game.TOTAL_TEST_QUESTIONS} misiones seguidas contra el reloj. Al final, tu nota.`,
        features: ['Nota sobre 10', 'Puntos extra por rapidez'],
      },
    ];
    const selectMode = (id) => {
      if (id === 'exam') game.startTest();
      else game.startPracticeMission();
      setScreen('play');
    };
    return (
      <GameShell {...shellProps}>
        <ModeSelect modes={modes} onSelect={selectMode} onHelp={() => setShowHelp(true)} />
        {instructions}
      </GameShell>
    );
  }

  const isExam = game.isTestMode;
  const isLast = game.currentQuestionIndex === game.TOTAL_TEST_QUESTIONS - 1;
  const fb = game.feedback;
  const submit = () => (isExam ? game.handleNextQuestion() : game.checkPracticeAnswer());
  const pressKey = (k) => {
    if (k === 'del') game.setRespuesta((r) => String(r).slice(0, -1));
    else if (k === 'clear') game.setRespuesta('');
    else game.setRespuesta((r) => `${r}${k}`);
    inputRef.current?.focus({ preventScroll: true });
  };
  const wantedQty = (p) => (!isExam ? basket.items.find((it) => it.nombre === p.nombre)?.qty || 0 : 0);
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const tillState = !isExam && fb.clase === 'correcta' ? 'is-won' : !isExam && fb.clase === 'incorrecta' ? 'is-lost' : '';

  return (
    <GameShell {...shellProps}>
      <GameHeader
        mode={isExam ? 'exam' : 'easy'}
        modeLabel={isExam ? 'Examen' : 'Práctica'}
        onHelp={() => setShowHelp(true)}
        right={
          <Hud>
            {isExam ? (
              <>
                <HudStat icon={Target} tone="progress" value={`${game.currentQuestionIndex + 1}/${game.TOTAL_TEST_QUESTIONS}`} label="Misión" />
                <HudStat icon={Clock} tone="time" value={`${game.elapsedTime}s`} label="Tiempo" />
              </>
            ) : (
              <>
                <HudStat icon={Trophy} tone="good" value={practiceHits} label="Aciertos" />
                <HudStat icon={Flame} tone="streak" value={practiceStreak} label="Racha" />
              </>
            )}
          </Hud>
        }
      />

      {isExam && (
        <div className="smk-progress">
          <ProgressBar value={game.currentQuestionIndex + 1} max={game.TOTAL_TEST_QUESTIONS} label="Progreso del examen" />
        </div>
      )}

      <div className="smk-store">
        {/* Estantería */}
        <section className="smk-shelf" aria-label="Estantería de productos">
          <div className="smk-awning" aria-hidden="true" />
          <div className="smk-shelf__grid">
            {productos.map((p) => (
              <ProductCard key={p.nombre} p={p} price={formatPrice(p.precio)} wanted={wantedQty(p)} />
            ))}
          </div>
        </section>

        {/* Mostrador: ticket + caja */}
        <section className="smk-counter">
          <AnimatePresence mode="wait">
            <motion.div
              key={isExam ? `q${game.currentQuestionIndex}` : game.mision?.texto}
              ref={game.containerRef}
              className="smk-ticket"
              initial={{ opacity: 0, y: -14, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="smk-ticket__head">
                <ClipboardList size={16} /> {isExam ? `Misión ${game.currentQuestionIndex + 1}` : '¡Tu misión!'}
              </div>
              <p className="smk-ticket__text">{game.mision?.texto}</p>
              {(basket.items.length > 0 || basket.bill || basket.discount) && (
                <div className="smk-ticket__basket">
                  {basket.items.length > 0 && (
                    <span className="smk-basket" aria-label="Cesta">
                      <ShoppingBasket size={16} className="smk-basket__icon" />
                      {basket.items.map((it) => (
                        <span key={it.nombre} className="smk-basket__item" title={it.nombre}>
                          <span aria-hidden="true">{it.emoji}</span>
                          <b>×{it.qty}</b>
                        </span>
                      ))}
                    </span>
                  )}
                  {basket.discount && <span className="smk-coupon">−{basket.discount}%</span>}
                  {basket.bill && <Banknote value={basket.bill} />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className={`smk-till ${tillState}`}>
            <div className="smk-till__head">
              <span className="smk-till__brand">CAJA</span>
              <span className="smk-till__q">{pregunta}</span>
            </div>
            <label className="smk-lcd">
              <input
                ref={inputRef}
                className="smk-lcd__input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={game.respuesta}
                onChange={(e) => game.setRespuesta(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                placeholder={isExam ? 'Tu respuesta…' : placeholder}
                aria-label={pregunta}
                autoFocus={isExam && !coarse}
              />
              <span className="smk-lcd__eur" aria-hidden="true">€</span>
            </label>
            <div className="smk-keypad" role="group" aria-label="Teclado numérico">
              {(decimals ? KEYS_DEC : KEYS_INT).map((k) => (
                <KeyTile
                  key={k}
                  className={`smk-key ${k === 'del' || k === 'clear' ? 'is-fn' : ''}`}
                  onClick={() => pressKey(k)}
                  aria-label={k === 'del' ? 'Borrar' : k === 'clear' ? 'Vaciar' : k}
                >
                  {k === 'del' ? <Delete size={20} /> : k === 'clear' ? 'C' : k}
                </KeyTile>
              ))}
            </div>
            <GameButton
              size="lg"
              variant={isExam ? 'primary' : 'success'}
              icon={isExam ? undefined : Check}
              iconRight={isExam ? SkipForward : undefined}
              onClick={submit}
              className="smk-till__go"
            >
              {isExam ? (isLast ? 'Finalizar' : 'Siguiente') : 'Comprobar'}
            </GameButton>
            <CoinTray />
          </div>
        </section>
      </div>

      <RoundBanner
        show={!isExam && !!fb.texto}
        status={fb.clase === 'correcta' ? 'won' : 'lost'}
        title={fb.clase === 'correcta' ? '¡Correcto!' : 'Casi…'}
        subtitle={fb.clase === 'correcta' ? fb.texto : fb.texto.replace(/^Casi\.\.\.\s*/, '')}
        action={fb.clase === 'correcta' ? game.startPracticeMission : undefined}
        actionLabel="Otra misión"
      />

      <div className="smk-footer">
        {!isExam ? (
          <>
            <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={() => setScreen('menu')}>Cambiar modo</GameButton>
            <GameButton variant="ghost" size="sm" icon={SkipForward} onClick={game.startPracticeMission}>Otra misión</GameButton>
          </>
        ) : (
          <span className="smk-footer__info">Modo examen · la nota se ve al final</span>
        )}
      </div>

      {instructions}
    </GameShell>
  );
};

export default SupermercadoTienda;
