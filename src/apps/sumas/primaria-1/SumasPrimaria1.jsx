// src/apps/sumas/SumasPrimaria1.jsx
import React from 'react';
import { useSumasGame } from '/src/hooks/useSumasGame';
import SumasUI from '/src/apps/_shared/SumasUI';
import SumasTestScreen from '/src/apps/_shared/SumasTestScreen';
import '/src/apps/_shared/Sumas.css';

const SumasPrimaria1 = () => {
  const game = useSumasGame({ withTimer: false });

  if (game.isTestMode) {
    return <SumasTestScreen game={game} />;
  }
  return (
    <SumasUI
      currentOperands={game.currentOperands}
      currentAnswer={game.currentAnswer}
      setCurrentAnswer={game.setCurrentAnswer}
      startPracticeMission={game.startPracticeMission}
      checkPracticeAnswer={game.checkPracticeAnswer}
      startTest={game.startTest}
    />
  );
};

export default SumasPrimaria1;
