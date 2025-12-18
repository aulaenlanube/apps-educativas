import React from 'react';
import ComprensionJuego from '../_shared/ComprensionJuego';

const ComprensionEscrita = ({ level, grade, subjectId }) => {
    return (
        <ComprensionJuego 
            level={level}
            grade={grade}
            subjectId={subjectId}
            tipo="escrita" 
        />
    );
};

export default ComprensionEscrita;