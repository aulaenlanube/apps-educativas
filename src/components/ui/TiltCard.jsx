import React, { useRef, useCallback } from 'react';

// Tarjeta con inclinación 3D sutil + foco de luz que sigue al puntero.
// Escribe variables CSS (--rx, --ry, --mx, --my) directamente en el nodo en un
// rAF, sin re-renderizar React por cada movimiento. El estilo vive en fx.css
// (.fx-tilt). Solo actúa con ratón/lápiz (en táctil no tiene sentido inclinar).
//
// Uso:
//   <TiltCard as={Link} to="/curso/primaria/1" className="..." max={8}>…</TiltCard>
const TiltCard = React.forwardRef(function TiltCard(
    { as: Comp = 'div', max = 8, className = '', children, onPointerMove, onPointerLeave, ...rest },
    forwardedRef,
) {
    const localRef = useRef(null);
    const rafRef = useRef(0);

    const setRefs = useCallback((node) => {
        localRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    const handleMove = (e) => {
        onPointerMove?.(e);
        if (e.pointerType === 'touch') return;
        const el = localRef.current;
        if (!el) return;
        const { clientX, clientY } = e;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            const r = el.getBoundingClientRect();
            const x = (clientX - r.left) / r.width;
            const y = (clientY - r.top) / r.height;
            el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
            el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
            el.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
            el.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
        });
    };

    const handleLeave = (e) => {
        onPointerLeave?.(e);
        cancelAnimationFrame(rafRef.current);
        const el = localRef.current;
        if (!el) return;
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
    };

    return (
        <Comp
            ref={setRefs}
            className={`fx-tilt fx-spotlight ${className}`}
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            {...rest}
        >
            {children}
        </Comp>
    );
});

export default TiltCard;
