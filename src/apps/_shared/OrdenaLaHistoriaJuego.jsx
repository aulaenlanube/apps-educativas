import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import { getOrdenaHistoriasData } from '../../services/gameDataService';
import { GameShell, GameHeader, GameLoading, GameEmpty } from './kit';

// Colores del icono de la app (amanecer → noche: la historia avanza)
const SHELL = { accent: '#f97316', accent2: '#6366f1' };

const OrdenaLaHistoriaJuego = ({ onGameComplete } = {}) => {
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
      const data = await getOrdenaHistoriasData(level, grade, asignatura);
      if (!vivo) return;
      setHistorias(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };
    cargar();
    return () => { vivo = false; };
  }, [level, grade, subjectId]);

  if (isLoading) {
    return (
      <GameShell {...SHELL}>
        <GameLoading label="Preparando historias…" />
      </GameShell>
    );
  }
  if (!historias || historias.length === 0) {
    return (
      <GameShell {...SHELL}>
        <GameHeader />
        <GameEmpty title="Aún no hay historias">
          No hay contenido disponible para este juego todavía.
        </GameEmpty>
      </GameShell>
    );
  }

  // Un único UI que muestra práctica o test según game.isTestMode
  return <OrdenaLaHistoriaUI game={game} onGameComplete={onGameComplete} total={historias.length} />;
};

export default OrdenaLaHistoriaJuego;
