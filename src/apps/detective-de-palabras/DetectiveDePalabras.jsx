// Modified version of the DetectiveDePalabras component to support
// loading subject‑specific JSON files for primary education.  This
// component now reads both the grade and the subject identifier from
// the URL parameters.  When the subject identifier is present, it
// attempts to load a JSON file named `<subjectId>-detective-palabras.json`.
// If that file is unavailable it falls back to the generic
// `detective-palabras.json` for the same grade and finally to the
// grade 1 generic file, mirroring the behaviour of ESO apps.  This
// ensures that each subject in grades 1–6 of primary can have its own
// customised detective de palabras content.

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDetectiveDePalabras } from '../../hooks/useDetectiveDePalabras';
import DetectiveDePalabrasUI from '../_shared/DetectiveDePalabrasUI';
import DetectiveDePalabrasTestScreen from '../_shared/DetectiveDePalabrasTestScreen';

const DetectiveDePalabras = () => {
  // Extract grade and optional subjectId from the route parameters
  const { grade, subjectId } = useParams();

  // Normalise the grade: ensure it is between 1 and 6; default to 1
  const grado = useMemo(() => {
    const n = parseInt(grade, 10);
    return Number.isFinite(n) && n >= 1 && n <= 6 ? String(n) : '1';
  }, [grade]);

  // Normalise the subject identifier.  For routes without a subject
  // parameter (as in the original implementation) we fall back to
  // 'general'.  This allows the component to continue working even if
  // the router has not been updated to include the subject segment.
  const asignatura = useMemo(() => {
    if (typeof subjectId === 'string' && subjectId.trim().length > 0) {
      return subjectId.trim();
    }
    return 'general';
  }, [subjectId]);

  // Component state
  const [frasesDelNivel, setFrasesDelNivel] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Enable timer from grade 3 onwards
  const conTemporizador = parseInt(grado, 10) >= 3;

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

  // Load the JSON data whenever grade or subject changes
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    const base = import.meta.env.BASE_URL || '/';
    // Construct URLs in order of priority: subject specific, generic for
    // the same grade, and fallback to grade 1 generic.  The file names
    // follow the convention used across the repository:
    //   <subjectId>-detective-palabras.json
    //   detective-palabras.json
    const urlSubject = `${base}data/primaria/${grado}/${asignatura}-detective-palabras.json`;
    const urlGeneric = `${base}data/primaria/${grado}/detective-palabras.json`;
    const urlFallback = `${base}data/primaria/1/detective-palabras.json`;

    const cargar = async (url) => {
      const resp = await fetch(url, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const datos = await resp.json();
      return shuffle(normalizar(datos));
    };

    (async () => {
      try {
        // Try subject‑specific file first
        const frases = await cargar(urlSubject);
        if (!cancelado) {
          setFrasesDelNivel(frases);
          setCargando(false);
        }
      } catch {
        try {
          // Try generic file for the same grade
          const gen = await cargar(urlGeneric);
          if (!cancelado) {
            setFrasesDelNivel(gen);
            setCargando(false);
          }
        } catch {
          try {
            // Final fallback to grade 1 generic file
            const fallback = await cargar(urlFallback);
            if (!cancelado) {
              setFrasesDelNivel(fallback);
              setCargando(false);
            }
          } catch (e2) {
            if (!cancelado) {
              setError('No se pudieron cargar las frases');
              setCargando(false);
            }
          }
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [grado, asignatura]);

  // Render loading or error states
  if (cargando) return <div style={{ padding: 16 }}>Cargando frases…</div>;
  if (error) return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;

  // When in test mode, show the dedicated screen
  if (game.isTestMode) return <DetectiveDePalabrasTestScreen game={game} />;
  // Otherwise render the main UI
  return <DetectiveDePalabrasUI game={game} />;
};

export default DetectiveDePalabras;