import React from 'react';

/**
 * Componente reutilizable para mostrar un título con un estilo de degradado.
 * @param {object} props
 * @param {'h1'|'h2'|'h3'|'h4'|'h5'|'h6'} [props.tag='h1'] - La etiqueta HTML a renderizar.
 * @param {string} [props.className=''] - Clases de Tailwind CSS adicionales para personalizar.
 * @param {React.ReactNode} props.children - El contenido del título.
 */
const GradientTitle = ({ tag = 'h1', className = '', children }) => {
  const Tag = tag;
  const defaultClasses = 'font-bold gradient-text';
  
  return (
    <Tag className={`${defaultClasses} ${className}`}>
      {children}
    </Tag>
  );
};

export default GradientTitle;