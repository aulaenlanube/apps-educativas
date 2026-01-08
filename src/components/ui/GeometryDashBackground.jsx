import React, { useEffect, useRef } from 'react';

const GeometryDashBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Configuración
        const backgroundColor = '#1a0b2e'; // Dark purple/blue base

        // Cuadros grandes
        const cellSize = 120;

        const draw = () => {
            if (!canvas) return;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Background Fill
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // GRID IS STATIC (offsetX = 0)
            const offsetX = 0;
            const time = Date.now() * 0.001;

            // --- FUNCTION TO DRAW A STATIC GRID LAYER WITH PATTERNS ---
            const drawLayer = (scrollX, scale, opacity) => {
                const effectiveCell = cellSize * scale;
                // Since scrollX is 0, startCol is 0.
                const startCol = 0;
                const endCol = Math.ceil(canvas.width / effectiveCell);
                const rows = Math.ceil(canvas.height / effectiveCell);

                ctx.lineWidth = 1;

                for (let col = startCol; col <= endCol; col++) {
                    const x = (col * effectiveCell) + scrollX; // scrollX is 0

                    for (let row = 0; row < rows; row++) {
                        const y = row * effectiveCell;

                        // DETERMINISTIC PATTERN GENERATION
                        const isMajor = (col % 4 === 0) && (row % 2 === 0);
                        const isMinorPattern = ((col + row) % 3 === 0);
                        const isDiagonal = ((col - row) % 5 === 0);

                        // 1. Draw Lines (Non-uniform)
                        ctx.beginPath();

                        // Vertical segments
                        if (row % 2 !== 0 || isMajor) {
                            ctx.moveTo(x, y);
                            ctx.lineTo(x, y + effectiveCell);
                        }

                        // Horizontal segments
                        if (col % 2 !== 0 || isMajor) {
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + effectiveCell, y);
                        }

                        ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * (isMajor ? 0.3 : 0.1)})`;
                        ctx.stroke();

                        // 2. Draw Pattern Fills (The "Shapes")
                        if (isMajor) {
                            // Big Squares
                            ctx.fillStyle = `rgba(255, 0, 255, ${opacity * 0.05})`;
                            ctx.fillRect(x + 10, y + 10, effectiveCell - 20, effectiveCell - 20);
                        } else if (isDiagonal) {
                            // Triangles
                            ctx.fillStyle = `rgba(0, 255, 255, ${opacity * 0.03})`;
                            ctx.beginPath();
                            ctx.moveTo(x, y + effectiveCell);
                            ctx.lineTo(x + effectiveCell, y + effectiveCell);
                            ctx.lineTo(x + effectiveCell, y);
                            ctx.fill();
                        } else if (isMinorPattern) {
                            // Small dots/squares in center
                            ctx.fillStyle = `rgba(0, 255, 200, ${opacity * 0.05})`;
                            const s = effectiveCell * 0.2;
                            ctx.fillRect(x + (effectiveCell - s) / 2, y + (effectiveCell - s) / 2, s, s);
                        }
                    }
                }
            };

            // Draw Static Background Layer
            drawLayer(offsetX, 1, 1.0);

            // --- FLOATING LARGE GEOMETRY (MOVING) ---
            for (let i = 0; i < 3; i++) {
                // Keep movement logic based on time
                const floatX = (canvas.width * (0.2 + i * 0.35) + Math.sin(time * 0.5 + i) * 100) % (canvas.width + 200) - 100;
                const floatY = (canvas.height * 0.3 + i * 200 + Math.sin(time + i) * 50);

                ctx.save();
                ctx.translate(floatX, floatY);
                ctx.rotate(time * 0.2 * (i % 2 === 0 ? 1 : -1));

                ctx.strokeStyle = `rgba(255, 0, 255, 0.15)`; // Slightly brighter
                ctx.lineWidth = 4;
                const size = 150;
                ctx.strokeRect(-size / 2, -size / 2, size, size);

                // Inner shape
                ctx.fillStyle = `rgba(0, 255, 255, 0.05)`;
                ctx.beginPath();
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(size / 2, 0);
                ctx.lineTo(0, size / 2);
                ctx.lineTo(-size / 2, 0);
                ctx.fill();

                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        const render = () => {
            draw();
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    );
};

export default GeometryDashBackground;
