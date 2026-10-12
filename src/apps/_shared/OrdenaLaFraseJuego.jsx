import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import { getOrdenaFrasesData } from '../../services/gameDataService';
import { GameShell, GameHeader, GameLoading, GameEmpty } from './kit';

// Colores del icono de la app (fichas blancas sobre baldosa rosa + ficha índigo)
const SHELL = { accent: '#f43f5e', accent2: '#8b5cf6' };

const OrdenaLaFraseJuego = ({ onGameComplete } = {}) => {
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
      const frasesData = await getOrdenaFrasesData(level, grade, asignatura);
      setFrases(frasesData || []);
      setIsLoading(false);
    };
    cargarContenido();
  }, [level, grade, subjectId]);

  if (isLoading) {
    return (
      <GameShell {...SHELL}>
        <GameLoading label="Preparando frases…" />
      </GameShell>
    );
  }
  if (!frases || frases.length === 0) {
    return (
      <GameShell {...SHELL}>
        <GameHeader />
        <GameEmpty title="Aún no hay frases">
          No hay contenido disponible para este juego todavía.
        </GameEmpty>
      </GameShell>
    );
  }

  // Un único componente UI gestiona práctica y test
  return <OrdenaLaFraseUI game={game} onGameComplete={onGameComplete} total={frases.length} />;
};

export default OrdenaLaFraseJuego;
