import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';
import { getFrases } from './../../../public/data/api';

const OrdenaLaFraseJuego = () => {
  const { level, grade: gradeParam, subjectId } = useParams();
  const grade = useMemo(() => parseInt(gradeParam, 10), [gradeParam]);

  const [frases, setFrases] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const conTemporizador = (level === 'primaria' && grade >= 3) || level === 'eso';
  const game = useOrdenaLaFraseGame(frases || [], conTemporizador);

  useEffect(() => {
    const cargarContenido = async () => {
      setIsLoading(true);
      const asignatura = level === 'primaria' ? (subjectId || 'general') : subjectId;
      const frasesData = await getFrases(level, grade, asignatura);
      setFrases(frasesData || []);
      setIsLoading(false);
    };
    cargarContenido();
  }, [level, grade, subjectId]);

  if (isLoading) return <div className="text-center p-10 font-bold">Cargando juego...</div>;
  if (!frases || frases.length === 0) {
    return <div className="text-center p-10 font-bold text-orange-600">No hay contenido disponible para este juego todavía</div>;
  }

  return game.isTestMode ? <OrdenaLaFraseTestScreen game={game} /> : <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseJuego;
