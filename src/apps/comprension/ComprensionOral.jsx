import React from 'react';
import ComprensionJuego from '../_shared/ComprensionJuego';

const ComprensionOral = ({ level, grade, subjectId }) => {
    return (
        <ComprensionJuego 
            level={level}
            grade={grade}
            subjectId={subjectId}
            tipo="oral" 
        />
    );
};

export default ComprensionOral;