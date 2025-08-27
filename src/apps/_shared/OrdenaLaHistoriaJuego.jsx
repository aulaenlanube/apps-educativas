// Modificación de OrdenaLaHistoriaJuego para enlazar los JSON según la materia
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';
import { getHistorias } from './../../../public/data/api';

const OrdenaLaHistoriaJuego = () => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => {
    const n = parseInt(gradeParam, 10);
    return Number.isNaN(n) ? 1 : n;
  }, [gradeParam]);

  const [historias, setHistorias] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Regla igual que tenías: temporizador desde 3º
  const conTemporizador = grade >= 3;

  const game = useOrdenaLaHistoriaGame(historias || [], conTemporizador);

  useEffect(() => {
    let vivo = true;
    const cargarContenido = async () => {
      setIsLoading(true);
      const asignatura = level === 'primaria' ? (subjectId || 'general') : subjectId;
      const historiasData = await getHistorias(level, grade, asignatura);
      if (!vivo) return;
      setHistorias(Array.isArray(historiasData) ? historiasData : []);
      setIsLoading(false);
    };
    cargarContenido();
    return () => { vivo = false; };
  }, [level, grade, subjectId]);

  if (isLoading) {
    return <div className="text-center p-10 font-bold">Cargando juego...</div>;
  }
  if (!historias || historias.length === 0) {
    return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía</div>;
  }
  if (game.isTestMode) {
    return <OrdenaLaHistoriaTestScreen game={game} />;
  }
  return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaJuego;
