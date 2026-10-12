// src/apps/_shared/TestScreen.jsx
// Examen del Supermercado Matemático (API sin cambios: game, productos, onGameComplete).
// Rediseño 2026 sobre el kit (_shared/kit): estantería de productos, ticket con la
// pregunta en pantalla oscura, caja para la respuesta y resumen con la nota /10.
// SOLO presentación: el registro del examen (onGameComplete) es el de siempre.
import React, { useEffect, useRef } from 'react';
import { Clock, ListChecks, RefreshCw, ShoppingCart, Target, ArrowRight, Award, Receipt } from 'lucide-react';
import {
    GameShell, GameHeader, Hud, HudStat, Panel, GameButton, ProgressBar,
    ResultsScreen, FeedbackItem, useAppMeta,
} from './kit';
import './TestScreen.css';

const SHELL = { accent: '#f97316', accent2: '#e11d48' };
const fmtSecs = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`);

const TestScreen = ({ game, productos, onGameComplete }) => {
    const meta = useAppMeta();
    // La barra de progreso ahora refleja la pregunta actual, no la completada
    const progressPercentage = ((game.currentQuestionIndex + 1) / game.TOTAL_TEST_QUESTIONS) * 100;

    // Helper para formatear precios consistentemente
    const formatPrice = (price) => {
        // Si el precio es un número entero, no muestra decimales
        if (Number.isInteger(price)) {
            return price;
        }
        // Si tiene decimales, lo formatea a dos y usa coma
        return price.toFixed(2).replace('.', ',');
    };

    const trackedRef = useRef(false);
    useEffect(() => {
        if (game.showResults && !trackedRef.current) {
            trackedRef.current = true;
            const correct = game.testQuestions.filter((q, i) => {
                const userAnswer = parseFloat(String(game.userAnswers[i]).replace(',', '.'));
                return Math.abs(userAnswer - q.solucion) < 0.001;
            }).length;
            onGameComplete?.({
                mode: 'test',
                score: game.score,
                maxScore: game.TOTAL_TEST_QUESTIONS * 200,
                correctAnswers: correct,
                totalQuestions: game.TOTAL_TEST_QUESTIONS,
                durationSeconds: game.elapsedTime || undefined,
            });
        }
        if (!game.showResults) trackedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.showResults, game.score, onGameComplete]);

    if (game.showResults) {
        const isOk = (q, i) => Math.abs(parseFloat(String(game.userAnswers[i]).replace(',', '.')) - q.solucion) < 0.001;
        const correctAnswers = game.testQuestions.filter((q, i) => isOk(q, i)).length;

        const nota = Math.round((correctAnswers / game.TOTAL_TEST_QUESTIONS) * 100) / 10;

        return (
            <GameShell {...SHELL} className="tsc">
                <ResultsScreen
                    title="¡Test completado!"
                    subtitle="Supermercado Matemático"
                    nota={nota}
                    points={game.score}
                    stats={[
                        { icon: Target, tone: 'good', label: 'Aciertos', value: `${correctAnswers}/${game.TOTAL_TEST_QUESTIONS}` },
                        game.elapsedTime > 0 && { icon: Clock, tone: 'time', label: 'Tiempo', value: `${game.elapsedTime}s` },
                    ].filter(Boolean)}
                    actions={[
                        { label: 'Volver a intentar', onClick: game.startTest, icon: RefreshCw },
                        { label: 'Modo práctica', onClick: game.exitTestMode, icon: ShoppingCart, variant: 'soft' },
                    ]}
                >
                    {game.testQuestions.map((q, i) => {
                        const ok = isOk(q, i);
                        return (
                            <FeedbackItem key={i} index={i + 1} ok={ok} title={`Pregunta ${i + 1}`}>
                                <span className="tsc-fb__q">{q.texto}</span>
                                <span className="tsc-fb__row">
                                    <span className={`tsc-fb__ans ${ok ? 'is-ok' : 'is-ko'}`}><small>Tú</small> {game.userAnswers[i] || 'N/A'}{game.userAnswers[i] ? ' €' : ''}</span>
                                    <span className="tsc-fb__ans is-right"><small>Correcta</small> {formatPrice(q.solucion)} €</span>
                                </span>
                            </FeedbackItem>
                        );
                    })}
                </ResultsScreen>
            </GameShell>
        );
    }

    const isLast = game.currentQuestionIndex === game.TOTAL_TEST_QUESTIONS - 1;

    return (
        <GameShell {...SHELL} className="tsc">
            <GameHeader
                title={meta.name ? undefined : 'Supermercado Matemático'}
                mode="exam"
                right={
                    <Hud>
                        <HudStat icon={ListChecks} tone="progress" value={`${game.currentQuestionIndex + 1}/${game.TOTAL_TEST_QUESTIONS}`} label="Pregunta" />
                        {game.elapsedTime > 0 && <HudStat icon={Clock} tone="time" value={fmtSecs(game.elapsedTime)} label="Tiempo" />}
                    </Hud>
                }
            />

            <ProgressBar value={progressPercentage} max={100} label="Progreso del examen" />

            {/* Estantería con los precios */}
            <div className="tsc-shelf">
                <div className="tsc-shelf__items">
                    {productos.map(p => (
                        <div key={p.nombre} className="tsc-product">
                            <span className="tsc-product__emoji" aria-hidden="true">{p.emoji}</span>
                            <span className="tsc-product__name">{p.nombre}</span>
                            <span className="tsc-product__price">{formatPrice(p.precio)} €</span>
                        </div>
                    ))}
                </div>
                <span className="tsc-shelf__plank" aria-hidden="true" />
            </div>

            {/* Ticket con la pregunta */}
            <Panel variant="screen" className="tsc-mission" key={game.currentQuestionIndex}>
                <span className="tsc-mission__kicker"><Receipt size={15} /> ¡Pregunta {game.currentQuestionIndex + 1}!</span>
                <p className="tsc-mission__text">{game.mision.texto}</p>
            </Panel>

            {/* Caja: respuesta */}
            <div className="tsc-answer">
                <label className="tsc-answer__field">
                    <input
                        key={game.currentQuestionIndex}
                        type="text"
                        inputMode="decimal"
                        value={game.respuesta}
                        onChange={(e) => game.setRespuesta(e.target.value)}
                        placeholder="Tu respuesta..."
                        aria-label="Tu respuesta en euros"
                        autoFocus
                        onKeyPress={(event) => event.key === 'Enter' && game.handleNextQuestion()}
                    />
                    <span className="tsc-answer__unit" aria-hidden="true">€</span>
                </label>
                <GameButton size="lg" icon={isLast ? Award : undefined} iconRight={isLast ? undefined : ArrowRight} variant={isLast ? 'success' : 'primary'} onClick={game.handleNextQuestion}>
                    {isLast ? 'Finalizar' : 'Siguiente'}
                </GameButton>
            </div>
        </GameShell>
    );
};

export default TestScreen;
