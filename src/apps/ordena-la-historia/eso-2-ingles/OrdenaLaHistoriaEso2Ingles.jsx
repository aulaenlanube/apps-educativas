// src/apps/ordena-la-historia/eso-2-ingles/OrdenaLaHistoriaEso2Ingles.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Last weekend, my friends and I decided to go to the cinema.", "We chose a new action film that looked very exciting.", "We bought popcorn and drinks before the movie started.", "The film was amazing, with lots of special effects.", "After the cinema, we went for a pizza to talk about it."],
    ["Emily is planning a surprise party for her brother's birthday.", "First, she needs to send invitations to all his friends.", "Then, she will buy a big chocolate cake and some decorations.", "On the day of the party, she will hide with averyone.", "Her brother will be very surprised and happy."],
    ["When I was a child, I used to live in a small house in the countryside.", "There was a big garden with many trees and flowers.", "I used to play outside with my dog all day long.", "I remember those days as a very happy time in my life."],
    ["A famous scientist was working in her laboratory late at night.", "She was trying to find a cure for a serious disease.", "Suddenly, she noticed something unexpected in one of her tests.", "She repeated the experiment and confirmed her discovery.", "Her work would go on to save millions of lives."],
    ["If you want to be healthy, you should follow some simple advice.", "First, you should eat a balanced diet with lots of fruit and vegetables.", "It is also very important to do exercise regularly.", "Finally, you must sleep at least eight hours every night."],
    ["A group of astronauts was preparing for a mission to Mars.", "They trained for many months to get ready for the long journey.", "The day of the launch, they boarded the spaceship feeling nervous but excited.", "The rocket took off, and their incredible adventure began.", "They would be the first humans to walk on the red planet."],
    ["Last year, our school organized a trip to a natural park.", "We saw many wild animals, like deer and eagles.", "A guide explained to us the importance of protecting the environment.", "We learned a lot and had a wonderful time in nature."],
    ["Alex was walking home when it started to rain heavily.", "He didn't have an umbrella, so he looked for a place to shelter.", "He ran to a small café and decided to wait there.", "He ordered a hot chocolate while he watched the rain outside.", "He felt warm and comfortable inside the café."],
    ["To make a good cup of tea, you first need to boil some water.", "Then, put a teabag in a cup and pour the hot water over it.", "Let it sit for a few minutes to get the flavour.", "You can add milk or sugar if you like.", "Finally, relax and enjoy your perfect cup of tea."],
    ["A young musician wanted to form a rock band.", "He found a talented drummer and a great bass player.", "They started practicing together in a garage every weekend.", "They wrote their own songs and soon played their first concert.", "It was the beginning of a very successful music career."]
];

const OrdenaLaHistoriaEso2Ingles = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso2Ingles;
