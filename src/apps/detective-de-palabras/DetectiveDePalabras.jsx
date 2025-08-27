// Modified version of the DetectiveDePalabras component to support
// loading subject‑specific JSON files for primary and ESO education.  This
// component now reads the level (primaria or eso), the grade and the subject
// identifier from the URL parameters.  When the subject identifier is present,
// it attempts to load a JSON file named `<subject>-detective-palabras.json`.
// If that file is unavailable it falls back to the generic `detective-palabras.json`
// for the same grade and finally to the grade 1 generic file.  This ensures
// that each subject in grades 1–6 of primary and grades 1–4 of ESO can have
// its own customised detective de palabras content.

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDetectiveDePalabras } from '../../hooks/useDetectiveDePalabras';
import DetectiveDePalabrasUI from '../_shared/DetectiveDePalabrasUI';
import DetectiveDePalabrasTestScreen from '../_shared/DetectiveDePalabrasTestScreen';

const DetectiveDePalabras = () => {
  // Extract level, grade and optional subjectId from the route parameters
  const { level, grade, subjectId } = useParams();

  // Normalise the grade: primary courses go from 1 to 6 and ESO from 1 to 4.
  // Any out-of-range or invalid value falls back to '1'.
  const grado = useMemo(() => {
    const n = parseInt(grade, 10);
    if (!Number.isFinite(n) || n < 1) return '1';
    const maxGrade = level === 'primaria' ? 6 : 4;
    return n <= maxGrade ? String(n) : '1';
  }, [grade, level]);

  // Normalise the subject identifier.  In primary education the
  // `subjectId` is optional: when absent or empty we fall back to
  // 'general'.  In secondary education (`eso`) the subject must be
  // provided; we simply trim the value and trust the router.
  const asignatura = useMemo(() => {
    if (typeof subjectId === 'string' && subjectId.trim().length > 0) {
      return subjectId.trim();
    }
    return level === 'primaria' ? 'general' : '';
  }, [subjectId, level]);

  // Component state
  const [frasesDelNivel, setFrasesDelNivel] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Enable the timer for ESO (secondary) in all grades and for
  // primary courses from grade 3 onwards, mirroring the behaviour of
  // the other ordering games.
  const conTemporizador = useMemo(() => {
    const g = parseInt(grado, 10);
    if (level === 'eso') return true;
    return g >= 3;
  }, [grado, level]);

  // Always initialise the game hook to maintain hooks order
  const game = useDetectiveDePalabras(frasesDelNivel, conTemporizador);

  // Helper to normalise the incoming JSON format to the one used by
  // the game.  Accepts either strings or objects with a 'solucion' field.
  const normalizar = (entrada) => {
    if (!Array.isArray(entrada)) throw new Error('Formato inválido');
    return entrada
      .map((item) => {
        if (typeof item === 'string') return { solucion: item.trim() };
        if (item && typeof item.solucion === 'string') return { solucion: item.solucion.trim() };
        return null;
      })
      .filter(Boolean);
  };

  // Simple Fisher–Yates shuffle to randomise the phrases
  const shuffle = (arr) => {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  };

  // Load the JSON data whenever level, grade or subject changes
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    const base = import.meta.env.BASE_URL || '/';
    // Construct URLs depending on the educational level.  For primary
    // courses we first try a subject‑specific file when the subject
    // isn't 'general'.  We then fall back to the generic file for the
    // same grade and finally to the grade 1 generic.  For ESO courses
    // there is no generic file per subject; instead we try the
    // subject‑specific file and then attempt to load a generic
    // detective-palabras.json for the same grade and ultimately a
    // generic from grade 1 (useful if some subjects share content).
    const nivel = level === 'primaria' ? 'primaria' : 'eso';
    const urlSubject =
      asignatura && asignatura !== 'general'
        ? `${base}data/${nivel}/${grado}/${asignatura}-detective-palabras.json`
        : null;
    const urlGeneric = `${base}data/${nivel}/${grado}/detective-palabras.json`;
    const urlFallback = `${base}data/${nivel}/1/detective-palabras.json`;

    const cargar = async (url) => {
      const resp = await fetch(url, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const datos = await resp.json();
      return shuffle(normalizar(datos));
    };

    (async () => {
      try {
        // Try subject‑specific file when defined
        if (urlSubject) {
          const frases = await cargar(urlSubject);
          if (!cancelado) {
            setFrasesDelNivel(frases);
            setCargando(false);
            return;
          }
        }
        // Try generic file for the same grade
        const gen = await cargar(urlGeneric);
        if (!cancelado) {
          setFrasesDelNivel(gen);
          setCargando(false);
          return;
        }
      } catch {
        // ignore and continue to fallback
      }
      try {
        // Final fallback to grade 1 generic file
        const fallback = await cargar(urlFallback);
        if (!cancelado) {
          setFrasesDelNivel(fallback);
          setCargando(false);
          return;
        }
      } catch {
        if (!cancelado) {
          setError('No se pudieron cargar las frases');
          setCargando(false);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [level, grado, asignatura]);

  // Render loading or error states
  if (cargando) return <span>Cargando frases…</span>;
  if (error) return <span>{error}</span>;

  // When in test mode, show the dedicated screen
  if (game.isTestMode) return <DetectiveDePalabrasTestScreen game={game} />;
  // Otherwise render the main UI
  return <DetectiveDePalabrasUI game={game} />;
};

export default DetectiveDePalabras;