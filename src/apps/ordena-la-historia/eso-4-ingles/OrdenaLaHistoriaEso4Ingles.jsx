// src/apps/ordena-la-historia/eso-4-ingles/OrdenaLaHistoriaEso4Ingles.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["A young woman was backpacking through Southeast Asia.", "She had been travelling for three months and had visited several countries.", "One day, while she was exploring an ancient temple, she found a hidden map.", "The map seemed to lead to a legendary lost city.", "Despite the risks, she decided to follow it.", "Her adventure had just taken a very exciting turn."],
    ["If I had had the chance to meet any historical figure, I would have chosen Leonardo da Vinci.", "I have always been fascinated by his incredible talent in so many different fields.", "I would have asked him about his inventions and his painting techniques.", "It is said that he wrote his notes in code.", "I think a conversation with him would have been an unforgettable experience."],
    ["A new law to protect the environment has been passed by the government.", "From next month, single-use plastic bags will be banned in all supermarkets.", "Companies are being encouraged to use more sustainable materials for packaging.", "Furthermore, a new recycling plant is going to be built.", "It is hoped that these measures will significantly reduce plastic pollution."],
    ["By the time firefighters arrived at the scene, the old factory had already been burning for an hour.", "The fire was so intense that it could be seen from miles away.", "They worked tirelessly for several hours to control the flames.", "Fortunately, the building was empty, so no one was injured.", "The cause of the fire is still being investigated by the police.", "It is suspected that it might have been started deliberately."],
    ["My friend asked me what I would do if I had a superpower.", "I told him that I would choose the ability to fly.", "I have always dreamed of soaring through the sky like a bird.", "I would travel to the most remote places in the world.", "I would also use my power to help people in danger.", "It would be an amazing and useful ability to have."],
    ["The school's drama club is preparing a new play.", "They have been rehearsing every day after school for the past month.", "The play, which was written by a famous playwright, is a comedy.", "The main character is a clumsy detective who solves a case by accident.", "The premiere is next Friday, and everyone is both nervous and excited.", "All the tickets have already been sold out."],
    ["A team of archaeologists made an incredible discovery in Egypt.", "While they were excavating near the pyramids, they found a previously unknown tomb.", "The tomb belonged to a powerful queen who had been forgotten by history.", "Inside, they found treasures and perfectly preserved hieroglyphs.", "This discovery will help us to better understand that period of Egyptian history."],
    ["I wish I had learned to play a musical instrument when I was younger.", "My parents encouraged me to take piano lessons, but I wasn't interested back then.", "Now, I regret not taking that opportunity.", "I think being able to play music is a wonderful skill.", "Maybe it's not too late to start learning now."],
    ["A company has developed a new app that can translate animal sounds into human language.", "The app uses artificial intelligence to analyze the sounds.", "Many people are skeptical, but the first tests with dogs have been surprisingly successful.", "The developers claim that we will soon be able to have real conversations with our pets.", "If it works, it will completely change our relationship with animals."],
    ["Despite the bad weather, the music festival went ahead as planned.", "Thousands of people, wearing raincoats and boots, attended the event.", "The bands played their best songs, and the atmosphere was fantastic.", "The lead singer of my favourite band thanked the audience for their resilience.", "It was a muddy but memorable experience for everyone involved."]
];

const OrdenaLaHistoriaEso4Ingles = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso4Ingles;
