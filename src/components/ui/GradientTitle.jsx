import React from 'react';

const GradientTitle = ({ children, className = "", tag = "h1" }) => {
  const Tag = tag;
  return (
    <Tag className={`font-bold gradient-text ${className}`}>
      {children}
    </Tag>
  );
};

export const AnimatedGradientTitle = ({ children, className = "", tag = "h1" }) => {
  const Tag = tag;
  const text = typeof children === 'string' ? children : String(children);
  return (
    <Tag className={`font-bold ${className}`} style={{ lineHeight: 1.4 }}>
      {text.split('').map((char, i) => (
        char === ' '
          ? <span key={i}>{'\u00A0'}</span>
          : <span
              key={i}
              style={{
                display: 'inline-block',
                animation: `hero-float 3s ease-in-out ${i * 0.12}s infinite`,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '0 0.04em',
                  margin: '0 -0.04em',
                  backgroundImage: 'linear-gradient(90deg, #2563EB, #7C3AED, #EC4899, #2563EB)',
                  backgroundSize: '600% 100%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `hero-enter 0.5s ease-out ${0.3 + i * 0.04}s both, hero-gradient 6s linear ${i * -0.35}s infinite`,
                }}
              >
                {char}
              </span>
            </span>
      ))}
    </Tag>
  );
};

export default GradientTitle;