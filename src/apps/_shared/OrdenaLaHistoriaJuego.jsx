import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import { getHistorias } from './../../../public/data/api';

const OrdenaLaHistoriaJuego = () => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => {
    const n = parseInt(gradeParam, 10);
    return Number.isNaN(n) ? 1 : n;
  }, [gradeParam]);

  const [historias, setHistorias] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const conTemporizador = grade >= 3;
  const game = useOrdenaLaHistoriaGame(historias || [], conTemporizador);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      setIsLoading(true);
      const asignatura = level === 'primaria' ? (subjectId || 'general') : subjectId;
      const data = await getHistorias(level, grade, asignatura);
      if (!vivo) return;
      setHistorias(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };
    cargar();
    return () => { vivo = false; };
  }, [level, grade, subjectId]);

  if (isLoading) return <div className="text-center p-10 font-bold">Cargando juego...</div>;
  if (!historias || historias.length === 0)
    return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía</div>;

  // Un único UI que muestra práctica o test según game.isTestMode
  return <OrdenaLaHistoriaUI game={game} />;
};

export default OrdenaLaHistoriaJuego;
