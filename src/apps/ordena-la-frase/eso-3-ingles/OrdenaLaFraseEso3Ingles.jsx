// src/apps/ordena-la-frase-eso-3-ingles/OrdenaLaFraseEso3Ingles.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "If I had studied harder, I would have passed the exam.",
    "This film is said to be one of the best of the year.",
    "She has been working in this company for over ten years.",
    "By this time next year, we will have finished our project.",
    "He asked me if I was going to the party on Saturday.",
    "I wish I had more free time to read books.",
    "Despite the heavy rain, they decided to go for a walk.",
    "The man who lives next door is a famous writer.",
    "It is important to learn how to manage your time effectively.",
    "She must have forgotten about our meeting.",
    "I would rather stay at home than go to the cinema tonight.",
    "This is the first time I have ever tried sushi.",
    "The problem was too difficult for me to solve.",
    "He is not only a great musician but also a talented painter.",
    "Unless you hurry up, you will miss the train.",
    "My phone was stolen while I was on the bus.",
    "I am looking forward to hearing from you soon.",
    "She is used to getting up early in the morning.",
    "He suggested that we should go on a trip together.",
    "The more you practice, the better you will become.",
    "I regret not telling you the truth earlier.",
    "It's no use crying over spilt milk.",
    "She was made to clean the entire house by herself.",
    "I would appreciate it if you could help me with this.",
    "He is likely to win the competition.",
    "I am having my car repaired tomorrow morning.",
    "It is worth visiting that museum if you have time.",
    "She has a tendency to arrive late for appointments.",
    "I am not accustomed to living in such a big city.",
    "He denied having broken the window.",
    "There is little point in arguing about it now.",
    "I can't help feeling nervous before an exam.",
    "She was on the verge of bursting into tears.",
    "It is high time you started taking your studies seriously.",
    "I have difficulty in understanding what he says.",
    "He is capable of solving complex mathematical problems.",
    "She succeeded in persuading him to change his mind.",
    "I am in charge of organizing the event.",
    "He is known for his great sense of humour.",
    "I am fed up with listening to your complaints."
];

const OrdenaLaFraseEso3Ingles = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso3Ingles;
