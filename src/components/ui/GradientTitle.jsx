import React from 'react';

const GradientTitle = ({ children, className = "", tag = "h1" }) => {
  const Tag = tag;
  return (
    <Tag className={`font-bold gradient-text ${className}`}>
      {children}
    </Tag>
  );
};

export default GradientTitle;