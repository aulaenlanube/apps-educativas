// Juego de parejas genérico (data.pairs con contentA/contentB) — rediseño 2026
// sobre el kit de interfaz (_shared/kit): escenario, marcador de turnos, cartas
// con giro 3D y aviso de victoria. Sin tracking (no recibe onGameComplete).
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RefreshCw, Repeat, Link2, Check } from 'lucide-react';
import { GameShell, GameHeader, Hud, HudStat, GameButton, RoundBanner } from './kit';
import './MemoryMatchGame.css';

const MemoryMatchGame = ({ data }) => {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Mezclar cartas al inicio
  const shuffleCards = () => {
    // Construcción del mazo: dos cartas por pareja (contenido A y B) con el mismo pairId
    let deck = [];
    data.pairs.forEach(pair => {
      deck.push({ ...pair, content: pair.contentA, type: pair.typeA, uniqueId: Math.random(), isFlipped: false, isMatched: false, pairId: pair.id });
      deck.push({ ...pair, content: pair.contentB, type: pair.typeB, uniqueId: Math.random(), isFlipped: false, isMatched: false, pairId: pair.id });
    });

    // Algoritmo de mezcla Fisher-Yates
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(deck);
    setTurns(0);
    setIsWon(false);
    setDisabled(false);
  };

  useEffect(() => {
    shuffleCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Manejar elección
  const handleChoice = (card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  // Comparar cartas seleccionadas
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.pairId === choiceTwo.pairId) {
        setCards(prevCards => {
          return prevCards.map(card => {
            if (card.pairId === choiceOne.pairId) {
              return { ...card, isMatched: true };
            }
            return card;
          });
        });
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  // Verificar victoria
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsWon(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cards, turns]);

  // Resetear turno
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(prevTurns => prevTurns + 1);
    setDisabled(false);
  };

  const matchedPairs = cards.filter(c => c.isMatched).length / 2;

  return (
    <GameShell accent="#8b5cf6" accent2="#ec4899">
      <GameHeader
        title={data.title}
        subtitle={data.description}
        right={(
          <Hud>
            <HudStat icon={Link2} tone="good" value={`${matchedPairs}/${data.pairs.length}`} label="Parejas" />
            <HudStat icon={Repeat} tone="progress" value={turns} label="Turnos" />
            <GameButton variant="soft" size="sm" icon={RefreshCw} onClick={shuffleCards} aria-label="Barajar de nuevo">Barajar</GameButton>
          </Hud>
        )}
      />

      <RoundBanner
        show={isWon}
        status="won"
        title="¡Felicidades!"
        subtitle={`Has completado el juego en ${turns} turnos.`}
        action={shuffleCards}
        actionLabel="Jugar otra vez"
        actionIcon={RefreshCw}
      />

      <div className="mm-board">
        {cards.map(card => (
          <SingleCard
            key={card.uniqueId}
            card={card}
            handleChoice={handleChoice}
            flipped={card === choiceOne || card === choiceTwo || card.isMatched}
            disabled={disabled}
          />
        ))}
      </div>
    </GameShell>
  );
};

// Subcomponente Carta Individual
const SingleCard = ({ card, handleChoice, flipped, disabled }) => {
  const handleClick = () => {
    if (!disabled && !flipped) {
      handleChoice(card);
    }
  };

  return (
    <button
      type="button"
      className={`mm-card ${flipped ? 'is-flipped' : ''} ${card.isMatched ? 'is-matched' : ''}`}
      onClick={handleClick}
      aria-label={flipped ? String(card.content) : 'Carta boca abajo'}
    >
      <span className="mm-card__inner">
        {/* Dorso */}
        <span className="mm-card__back" aria-hidden="true"><span className="mm-card__emblem" /></span>

        {/* Cara (contenido) */}
        <span className="mm-card__face">
          {card.type === 'image' ? (
            <img src={card.content} alt="" className="mm-card__img" loading="lazy" decoding="async" />
          ) : (
            <span className={`mm-card__text ${String(card.content).length > 5 ? 'is-long' : ''}`}>
              {card.content}
            </span>
          )}
          {card.isMatched && <span className="mm-card__check" aria-hidden="true"><Check size={13} strokeWidth={3.5} /></span>}
        </span>
      </span>
    </button>
  );
};

export default MemoryMatchGame;
