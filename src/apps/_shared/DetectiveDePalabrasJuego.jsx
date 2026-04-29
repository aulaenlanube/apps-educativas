// Contenedor del juego Detective de Palabras
// - Carga JSON por nivel/curso/asignatura
// - Decide temporizador
// - Pasa el estado/control del hook a la UI unificada

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDetectiveDePalabras } from '../../hooks/useDetectiveDePalabras';
import { getDetectiveData } from '../../services/gameDataService';
import DetectiveDePalabrasUI from './DetectiveDePalabrasUI';

const DetectiveDePalabrasJuego = ({ onGameComplete } = {}) => {
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

  // En examen siempre se mide el tiempo y aporta bonus de velocidad a la puntuación.
  const game = useDetectiveDePalabras(frasesDelNivel, true);

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

    // Usar el nivel real (antes se forzaba 'eso' para cualquier nivel no-primaria,
    // lo que ignoraba los datos de bachillerato existentes en la tabla)
    const nivel = level;
    const effectiveSubject = (asignatura && asignatura !== 'general') ? asignatura : 'general';

    (async () => {
      try {
        let datos = await getDetectiveData(nivel, grado, effectiveSubject);
        // Fallback a 'general' si no hay datos
        if ((!datos || datos.length === 0) && effectiveSubject !== 'general') {
          datos = await getDetectiveData(nivel, grado, 'general');
        }
        // Fallback a grado 1
        if (!datos || datos.length === 0) {
          datos = await getDetectiveData(nivel, 1, effectiveSubject);
        }
        if (vivo) {
          setFrasesDelNivel(barajar(normalizar(datos || [])));
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
  return <DetectiveDePalabrasUI game={game} onGameComplete={onGameComplete} />;
};

export default DetectiveDePalabrasJuego;
