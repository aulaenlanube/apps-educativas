// Contenedor del juego Detective de Palabras
// - Carga JSON por nivel/curso/asignatura
// - Decide temporizador
// - Pasa el estado/control del hook a la UI unificada

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDetectiveDePalabras } from '../../hooks/useDetectiveDePalabras';
import DetectiveDePalabrasUI from './DetectiveDePalabrasUI';

const DetectiveDePalabrasJuego = () => {
  // Parámetros de ruta
  const { level, grade, subjectId } = useParams();

  // Normalizar grado
  const grado = useMemo(() => {
    const n = parseInt(grade, 10);
    if (!Number.isFinite(n) || n < 1) return '1';
    const max = level === 'primaria' ? 6 : 4;
    return n <= max ? String(n) : '1';
  }, [grade, level]);

  // Normalizar asignatura
  const asignatura = useMemo(() => {
    if (typeof subjectId === 'string' && subjectId.trim()) return subjectId.trim();
    return level === 'primaria' ? 'general' : '';
  }, [subjectId, level]);

  // Estado de datos
  const [frasesDelNivel, setFrasesDelNivel] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Regla del temporizador
  const conTemporizador = useMemo(() => {
    const g = parseInt(grado, 10);
    if (level === 'eso') return true;
    return g >= 3;
  }, [grado, level]);

  // Hook del juego
  const game = useDetectiveDePalabras(frasesDelNivel, conTemporizador);

  // Utilidades
  const normalizar = (entrada) => {
    if (!Array.isArray(entrada)) throw new Error('Formato inválido');
    return entrada
      .map((it) => (typeof it === 'string' ? { solucion: it.trim() } : (it?.solucion ? { solucion: it.solucion.trim() } : null)))
      .filter(Boolean);
  };

  const barajar = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Carga de contenido
  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError(null);

    const base = import.meta.env.BASE_URL || '/';
    const nivel = level === 'primaria' ? 'primaria' : 'eso';
    const urlSubject = asignatura && asignatura !== 'general'
      ? `${base}data/${nivel}/${grado}/${asignatura}-detective-palabras.json`
      : null;
    const urlGeneric = `${base}data/${nivel}/${grado}/detective-palabras.json`;
    const urlFallback = `${base}data/${nivel}/1/detective-palabras.json`;

    const cargar = async (url) => {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const datos = await r.json();
      return barajar(normalizar(datos));
    };

    (async () => {
      try {
        if (urlSubject) {
          const f = await cargar(urlSubject);
          if (vivo) {
            setFrasesDelNivel(f);
            setCargando(false);
            return;
          }
        }
        const g = await cargar(urlGeneric);
        if (vivo) {
          setFrasesDelNivel(g);
          setCargando(false);
          return;
        }
      } catch {
        // Continuar con fallback
      }
      try {
        const fb = await cargar(urlFallback);
        if (vivo) {
          setFrasesDelNivel(fb);
          setCargando(false);
        }
      } catch {
        if (vivo) {
          setError('No se pudieron cargar las frases');
          setCargando(false);
        }
      }
    })();

    return () => { vivo = false; };
  }, [level, grado, asignatura]);

  if (cargando) return <div className="text-center p-10 font-bold">Cargando juego...</div>;
  if (error) return <div className="text-center p-10 font-bold text-red-600">{error}</div>;
  if (!frasesDelNivel.length) {
    return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía</div>;
  }

  // UI unificada: gestiona práctica y test según game.isTestMode
  return <DetectiveDePalabrasUI game={game} />;
};

export default DetectiveDePalabrasJuego;
