import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

const MemoryMatchGame = ({ data }) => {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const { toast } = useToast();

  // Mezclar cartas al inicio
  const shuffleCards = () => {
    // Duplicamos la lógica: creamos dos cartas por cada par del JSON
    // Una carta lleva el contenido A y la otra el contenido B, pero comparten el pairId
    const shuffledCards = [...data.pairs, ...data.pairs]
      .map((pair, index) => {
        // Determinar si es la 'versión A' o la 'versión B' de la pareja
        // La primera mitad del array mapeado serán las A, la segunda las B (antes del sort)
        // Pero como estamos dentro del map que itera dos veces sobre data.pairs:
        // Una estrategia mejor es construir el array manualmente antes.
        return null; 
      });
    
    // Construcción correcta del mazo
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
      toast({
        title: "¡Felicidades!",
        description: `Has completado el juego en ${turns} turnos.`,
        className: "bg-green-500 text-white border-none"
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

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto">
      
      {/* Cabecera */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-primary">{data.title}</h1>
        <p className="text-muted-foreground">{data.description}</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="bg-white/50 px-4 py-2 rounded-lg font-mono text-xl shadow-sm">
            Turnos: {turns}
          </div>
          <Button onClick={shuffleCards} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tablero */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full">
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

      {isWon && (
        <div className="mt-8 animate-bounce">
          <Button size="lg" onClick={shuffleCards} className="bg-green-600 hover:bg-green-700">
            ¡Jugar otra vez! <CheckCircle2 className="ml-2 h-5 w-5"/>
          </Button>
        </div>
      )}
    </div>
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
    <div className="relative aspect-[3/4] cursor-pointer group perspective-1000" onClick={handleClick}>
      <div className={`w-full h-full transition-all duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
        
        {/* Frente (Interrogación / Dorso) */}
        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white/20">
          <span className="text-4xl font-bold text-white opacity-50">?</span>
        </div>

        {/* Reverso (Contenido) */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-md bg-white flex flex-col items-center justify-center p-2 border-2 border-primary/20 text-center">
          {card.type === 'image' ? (
            <img src={card.content} alt="card" className="w-full h-full object-contain" />
          ) : (
            <span className={`font-bold text-slate-700 select-none ${card.content.length > 5 ? 'text-lg' : 'text-4xl'}`}>
              {card.content}
            </span>
          )}
          {card.isMatched && <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-green-500" />}
        </div>

      </div>
    </div>
  );
};

export default MemoryMatchGame;