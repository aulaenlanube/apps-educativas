// Re-export de MathOperationLayout para compatibilidad con imports existentes.
// Las apps de sumas y restas-1 importan este fichero.
// Internamente traduce la API legacy (actions, practiceState, options) a la API nueva.
import React from 'react';
import MathOperationLayout from './MathOperationLayout';

const SumasLayout = ({
  title,
  isTestMode, setTestMode,
  testState,
  practiceState,     // { feedback }
  actions,           // { startPractice, startTest, checkPractice, nextQuestion, exitTest, onPaletteClick }
  options,           // { showCarries, setShowCarries }
  onGameComplete,
  instructions,
  children
}) => {
  return (
    <MathOperationLayout
      title={title}
      emoji="🧮"
      isTestMode={isTestMode}
      setTestMode={setTestMode}
      testState={testState}
      actions={actions ? {
        startPractice: actions.startPractice,
        startTest: actions.startTest,
        nextQuestion: actions.nextQuestion,
        exitTest: actions.exitTest,
      } : undefined}
      feedback={practiceState?.feedback}
      onCheck={actions?.checkPractice}
      onNew={actions?.startPractice}
      newLabel="Nueva Suma"
      onPaletteClick={actions?.onPaletteClick}
      toggleLabel={options ? 'Ayuda con llevadas' : undefined}
      toggleValue={options?.showCarries}
      onToggleChange={options?.setShowCarries}
      onGameComplete={onGameComplete}
      instructions={instructions}
    >
      {children}
    </MathOperationLayout>
  );
};

export default SumasLayout;
