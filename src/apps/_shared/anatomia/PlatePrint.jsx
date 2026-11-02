// Láminas imprimibles para el profesorado (atlas → «Imprimir»): la lámina
// actual en A4 (vertical u horizontal según convenga), en el idioma activo,
// en dos versiones:
//   - muda: números con línea guía hasta cada estructura (anclas `c`), panel
//     para escribir las respuestas y hoja de soluciones aparte;
//   - con nombres: el nombre de cada estructura en los márgenes.
// Vista de impresión propia (@media print en anatomia.css) y window.print();
// el resto de la página no se imprime mientras dura el trabajo.
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FileText, ListOrdered, Printer, Tags } from 'lucide-react';
import { GameButton, Segmented } from '../kit';
import { BY_KEY } from './data/structures';
import { PLATE_BY_ID } from './data/plates';
import { APP_UI } from './uiStrings';
import { nameOf } from './text';
import { MUTE, NAMED, PAGE_MARGIN_MM, printPlan } from './printLayout';

const LI = { es: 0, en: 1, va: 2 };

/* ───────── figura (SVG en milímetros) ───────── */

function PrintFigure({ plan, img, ghost }) {
  const { col, plateW, plateH, figW, figH, callouts } = plan;
  const mute = plan.mode === 'mute';
  const end = (c) => {
    if (mute) return c.side === 'L' ? -(col / 2) + MUTE.r : plateW + col / 2 - MUTE.r;
    return c.side === 'L' ? -0.8 : plateW + 0.8;
  };
  return (
    <svg
      className="ana-print-fig"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${-col} 0 ${figW} ${figH}`}
      style={{ width: `${figW}mm`, height: `${figH}mm` }}
    >
      {ghost && <image href={ghost} width={plateW} height={plateH} preserveAspectRatio="none" opacity="0.3" />}
      <image href={img} width={plateW} height={plateH} preserveAspectRatio="none" />
      <g fill="none" strokeLinecap="round">
        {callouts.map((c) => <line key={`h${c.n}`} x1={c.x} y1={c.y} x2={end(c)} y2={c.ly} stroke="#fff" strokeWidth="0.9" strokeOpacity="0.85" />)}
        {callouts.map((c) => <line key={`l${c.n}`} x1={c.x} y1={c.y} x2={end(c)} y2={c.ly} stroke="#0f172a" strokeWidth="0.25" />)}
      </g>
      {callouts.map((c) => <circle key={`d${c.n}`} cx={c.x} cy={c.y} r="0.75" fill="#0f172a" stroke="#fff" strokeWidth="0.35" />)}
      {mute ? callouts.map((c) => {
        const cx = c.side === 'L' ? -(col / 2) : plateW + col / 2;
        return (
          <g key={`n${c.n}`}>
            <circle cx={cx} cy={c.ly} r={MUTE.r} fill="#fff" stroke="#0f172a" strokeWidth="0.3" />
            <text x={cx} y={c.ly + 1.05} textAnchor="middle" fontSize="3" fontWeight="800" fill="#0f172a">{c.n}</text>
          </g>
        );
      }) : callouts.map((c) => {
        const x = c.side === 'L' ? -1.6 : plateW + 1.6;
        const y0 = c.ly - ((c.lines.length - 1) * NAMED.line) / 2 + NAMED.font * 0.36;
        return (
          <text key={`t${c.n}`} x={x} y={y0} textAnchor={c.side === 'L' ? 'end' : 'start'} fontSize={NAMED.font} fontWeight="700" fill="#0f172a">
            {c.lines.map((ln, i) => <tspan key={i} x={x} dy={i ? NAMED.line : 0}>{ln}</tspan>)}
          </text>
        );
      })}
    </svg>
  );
}

/* ───────── hojas ───────── */

function PrintSheet({ job }) {
  const { plan, t, title, img, ghost, credit, lang } = job;
  const mute = plan.mode === 'mute';
  const rows = Math.ceil(plan.callouts.length / plan.answers.cols);
  const head = (sub) => (
    <header className="ana-print-head">
      <div>
        <small>EduApps · {t.atlas}</small>
        <h1>{title}{sub ? <span> · {sub}</span> : null}</h1>
      </div>
      {mute && !sub && (
        <div className="ana-print-fields">
          <span>{t.printName}: <i className="is-long" /></span>
          <span>{t.printClass}: <i /></span>
          <span>{t.printDate}: <i /></span>
        </div>
      )}
    </header>
  );
  return (
    <div className="ana-print-root" lang={lang === 'va' ? 'ca' : lang} aria-hidden="true">
      <section className="ana-print-page">
        {head(null)}
        {mute && <p className="ana-print-task">{t.printTask}</p>}
        <div className="ana-print-main">
          <PrintFigure plan={plan} img={img} ghost={ghost} />
          {mute && (
            <ol
              className="ana-print-answers"
              aria-label={t.printAnswers}
              style={{ width: `${plan.panelW}mm`, gridTemplateColumns: `repeat(${plan.answers.cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, ${plan.answers.rowH}mm)` }}
            >
              {plan.callouts.map((c) => <li key={c.n}><b>{c.n}</b><i /></li>)}
            </ol>
          )}
        </div>
        <footer className="ana-print-foot">{credit}</footer>
      </section>
      {mute && (
        <section className="ana-print-page ana-print-page--key">
          {head(t.printSolutions)}
          <ol className="ana-print-key">
            {plan.callouts.map((c) => <li key={c.n}><b>{c.n}</b> {c.name}</li>)}
          </ol>
          <footer className="ana-print-foot">{credit}</footer>
        </section>
      )}
    </div>
  );
}

// Carga (y decodifica) una imagen antes de imprimir.
const preload = (src) => (src ? new Promise((resolve) => {
  const im = new Image();
  im.onload = () => resolve();
  im.onerror = () => resolve();
  im.src = src;
}) : Promise.resolve());

/* ───────── diálogo ───────── */

export default function PrintDialog({ open, onClose, world, plateId, lang = 'es', lv = 6 }) {
  const t = APP_UI[lang] || APP_UI.es;
  const li = LI[lang] ?? 0;
  const plate = world.plates.get(plateId);
  const [mode, setMode] = useState('mute');
  const [which, setWhich] = useState('course');
  const [job, setJob] = useState(null);

  const all = useMemo(() => (plate ? [...plate.entries.values()].filter((e) => BY_KEY[e.key] && e.centroid) : []), [plate]);
  const course = useMemo(() => all.filter((e) => BY_KEY[e.key].l <= lv), [all, lv]);
  const choose = course.length > 0 && course.length < all.length;
  const list = choose && which === 'course' ? course : all;
  const plan = useMemo(() => (plate && list.length ? printPlan({
    plate: { w: plate.w, h: plate.h },
    entries: list.map((e) => ({ k: e.key, c: e.centroid })),
    nameOf: (k) => nameOf(k, lang),
    mode,
  }) : null), [plate, list, lang, mode]);

  // Trabajo de impresión: la hoja se pinta fuera de la vista y solo se ve al imprimir.
  useEffect(() => {
    if (!job) return undefined;
    let alive = true;
    const root = document.documentElement;
    const page = document.createElement('style');
    page.textContent = `@page { size: A4 ${job.plan.landscape ? 'landscape' : 'portrait'}; margin: ${PAGE_MARGIN_MM}mm; }`;
    const cleanup = () => {
      root.classList.remove('ana-printing');
      page.remove();
    };
    const finish = () => {
      cleanup();
      if (alive) setJob(null);
    };
    Promise.all([preload(job.img), preload(job.ghost)]).then(() => {
      if (!alive) return;
      document.head.appendChild(page);
      root.classList.add('ana-printing');
      window.addEventListener('afterprint', finish, { once: true });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (alive) window.print();
      }));
    });
    return () => {
      alive = false;
      window.removeEventListener('afterprint', finish);
      cleanup();
    };
  }, [job]);

  const go = () => {
    if (!plan || !plate) return;
    setJob({
      plan,
      t,
      lang,
      title: PLATE_BY_ID[plateId]?.t[li] || plateId,
      img: plate.img,
      ghost: plate.ghost,
      credit: plate.kind === 'render' ? t.printCreditRender : t.printCreditSvg,
    });
    onClose();
  };

  return (
    <>
      {open && plan && (
        <motion.div className="ana-printdlg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
          <motion.div
            className="gk-dialog ana-printdlg__box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ana-printdlg-title"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="gk-dialog__icon ana-printdlg__icon"><Printer size={26} /></span>
            <h3 id="ana-printdlg-title">{t.printTitle}</h3>
            <p className="ana-printdlg__sub">
              <strong>{PLATE_BY_ID[plateId]?.t[li] || plateId}</strong> · {t.printPaper(plan.landscape)}
            </p>
            <div className="ana-printdlg__opts" role="radiogroup" aria-label={t.printTitle}>
              {[
                { id: 'mute', icon: ListOrdered, title: t.printMute, desc: t.printMuteDesc },
                { id: 'named', icon: Tags, title: t.printNamed, desc: t.printNamedDesc },
              ].map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={mode === o.id} className={`ana-printdlg__opt${mode === o.id ? ' is-on' : ''}`} onClick={() => setMode(o.id)}>
                  <o.icon size={22} aria-hidden="true" />
                  <span>
                    <strong>{o.title}</strong>
                    <small>{o.desc}</small>
                  </span>
                </button>
              ))}
            </div>
            {choose && (
              <div className="ana-printdlg__which">
                <span><FileText size={14} aria-hidden="true" /> {t.printWhich}</span>
                <Segmented size="sm" value={which} onChange={setWhich} options={[{ value: 'course', label: t.printCourse(course.length) }, { value: 'all', label: t.printAll(all.length) }]} />
              </div>
            )}
            <p className="ana-printdlg__note">{t.printIntro}</p>
            <div className="gk-dialog__actions">
              <GameButton variant="soft" onClick={onClose}>{t.cancel}</GameButton>
              <GameButton variant="primary" icon={Printer} onClick={go} autoFocus>{t.printGo}</GameButton>
            </div>
          </motion.div>
        </motion.div>
      )}
      {job && createPortal(<PrintSheet job={job} />, document.body)}
    </>
  );
}
