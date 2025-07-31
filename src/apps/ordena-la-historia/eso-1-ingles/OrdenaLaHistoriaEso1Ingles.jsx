// src/apps/ordena-la-historia/eso-1-ingles/OrdenaLaHistoriaEso1Ingles.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Yesterday, Sarah went to the local market.", "She wanted to buy some fresh fruit for breakfast.", "She bought some red apples and sweet strawberries.", "Then, she went back home to prepare a delicious fruit salad.", "Her family loved the healthy and tasty breakfast."],
    ["Tom has a new puppy named Max.", "Every morning, he takes Max for a walk in the park.", "Max loves to run and play with other dogs.", "After the walk, Tom gives him food and fresh water.", "They are best friends and have a lot of fun together."],
    ["Last summer, my family and I travelled to Italy.", "We visited the famous Colosseum in Rome.", "We also ate a lot of delicious pizza and pasta.", "It was a fantastic holiday with beautiful weather.", "I hope we can go back there again soon."],
    ["A group of friends decided to go camping in the forest.", "They set up their tent near a clear river.", "At night, they sat around a campfire and told stories.", "The next morning, they went hiking to explore the area.", "It was an adventurous and memorable weekend."],
    ["Maria is preparing for her final exams.", "She studies for two hours every day after school.", "Her favourite subject is science because she loves experiments.", "She wants to get good marks to become a doctor in the future."],
    ["A brave knight lived in a big castle on a hill.", "One day, a fearsome dragon appeared in the kingdom.", "The knight decided to fight the dragon to save the people.", "After a long battle, he defeated the beast.", "The king and the people celebrated their hero."],
    ["On Saturday, I am going to a birthday party.", "It is for my best friend, Laura, who is turning thirteen.", "I have bought her a new book by her favourite author.", "There will be music, games, and a big chocolate cake.", "I am very excited to celebrate with her."],
    ["A little bird fell from its nest in a tall tree.", "A kind girl found the bird on the ground.", "She carefully picked it up and took it home.", "She fed it and kept it warm in a small box.", "When it was strong enough, she released it back into the wild."],
    ["The school is organizing a sports day next week.", "There will be many competitions like running and jumping.", "I am going to participate in the 100-meter race.", "I have been training every day to be faster.", "I hope my team wins the final trophy."],
    ["A curious cat was exploring the garden.", "It saw a colourful butterfly flying among the flowers.", "The cat tried to catch the butterfly, jumping and running.", "But the butterfly was too fast and flew away.", "The cat then decided to take a long nap in the sun."]
];

const OrdenaLaHistoriaEso1Ingles = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso1Ingles;
