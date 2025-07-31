// src/apps/ordena-la-frase-eso-4-ingles/OrdenaLaFraseEso4Ingles.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "If I had known you were coming, I would have baked a cake.",
    "The novel is thought to have been written in the 19th century.",
    "She has been learning French since she was a little child.",
    "By the time you arrive, the film will have already started.",
    "He asked me what I was doing the following weekend.",
    "I wish I could travel more often, but I don't have enough money.",
    "In spite of feeling tired, he went to the gym as usual.",
    "The woman whose car was stolen reported it to the police.",
    "It is essential to understand the consequences of our actions.",
    "She can't have forgotten her keys; I saw her put them in her bag.",
    "I would rather read a book than watch that silly TV show.",
    "This is the most beautiful place I have ever visited in my life.",
    "The instructions were so complicated that I couldn't understand them.",
    "Not only did he apologize, but he also offered to pay for the damage.",
    "Provided that you study hard, you will pass your exams.",
    "My wallet was taken while I wasn't looking.",
    "I am looking forward to seeing you at the party.",
    "He is used to working under a lot of pressure.",
    "The teacher recommended that we read the book before the class.",
    "The harder you work, the more successful you will be.",
    "I regret not having taken your advice.",
    "It's no use complaining about the situation.",
    "The employees were made to work overtime without extra pay.",
    "I would be grateful if you could send me the information.",
    "He is bound to be late; he never arrives on time.",
    "I am having my house painted next week.",
    "It is worth making an effort to achieve your goals.",
    "She has a reputation for being an excellent doctor.",
    "I am not accustomed to such cold weather.",
    "He admitted having made a serious mistake.",
    "There is no point in trying to convince him.",
    "I can't help wondering what will happen next.",
    "She was on the point of giving up when she found the solution.",
    "It is about time the government did something about unemployment.",
    "I have no difficulty in expressing my ideas in English.",
    "He is capable of running a marathon in under three hours.",
    "She succeeded in getting a promotion after years of hard work.",
    "I am responsible for managing the new project.",
    "He is well known for his contributions to science.",
    "I am tired of listening to the same excuses all the time."
];

const OrdenaLaFraseEso4Ingles = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso4Ingles;
