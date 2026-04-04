import React from 'react';
import ComprensionJuego from '../_shared/ComprensionJuego';

const ComprensionOral = ({ level, grade, subjectId, onGameComplete }) => {
    return (
        <ComprensionJuego
            level={level}
            grade={grade}
            subjectId={subjectId}
            tipo="oral"
            onGameComplete={onGameComplete}
        />
    );
};

export default ComprensionOral;