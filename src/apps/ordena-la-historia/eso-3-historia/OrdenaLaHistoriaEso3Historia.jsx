// src/apps/ordena-la-historia/eso-3-historia/OrdenaLaHistoriaEso3Historia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La Revolución Industrial transformó por completo la sociedad y la economía.", "Comenzó en Gran Bretaña en el siglo XVIII con la invención de la máquina de vapor.", "La producción artesanal en talleres fue sustituida por la producción en masa en fábricas.", "Surgió una nueva clase social, el proletariado, formada por los obreros industriales.", "Las ciudades crecieron rápidamente y aparecieron nuevos problemas sociales."],
    ["La Revolución Francesa de 1789 marcó el fin del Antiguo Régimen.", "La burguesía, descontenta con los privilegios de la nobleza y el clero, impulsó la revolución.", "La toma de la Bastilla se convirtió en el símbolo del levantamiento popular.", "Se proclamó la Declaración de los Derechos del Hombre y del Ciudadano.", "Sus ideales de libertad, igualdad y fraternidad se extendieron por todo el mundo."],
    ["Napoleón Bonaparte fue una figura clave a principios del siglo XIX.", "Dio un golpe de Estado en Francia y se proclamó emperador.", "Con sus ejércitos, conquistó gran parte de Europa, extendiendo las ideas revolucionarias.", "Sin embargo, su invasión de España y Rusia marcó el inicio de su declive.", "Finalmente, fue derrotado en la batalla de Waterloo en 1815."],
    ["El imperialismo fue la expansión de las potencias europeas por África y Asia en el siglo XIX.", "Buscaban nuevos mercados para sus productos y materias primas para sus industrias.", "La Conferencia de Berlín de 1885 organizó el reparto de África entre estas potencias.", "Esta dominación tuvo graves consecuencias para los pueblos colonizados.", "Las tensiones entre las potencias imperialistas fueron una de las causas de la Primera Guerra Mundial."],
    ["La Primera Guerra Mundial fue un conflicto devastador que tuvo lugar entre 1914 y 1918.", "Enfrentó a dos grandes alianzas: la Triple Entente y las Potencias Centrales.", "Fue una guerra de trincheras, con un enorme coste en vidas humanas.", "La entrada de Estados Unidos en el conflicto fue decisiva para la victoria aliada.", "El Tratado de Versalles impuso duras condiciones a Alemania, lo que generaría futuros conflictos."],
    ["La economía globalizada actual se caracteriza por la interconexión de los mercados.", "Las empresas multinacionales operan en muchos países diferentes.", "La deslocalización industrial traslada la producción a países con mano de obra más barata.", "Las tecnologías de la información y la comunicación han sido clave para este proceso.", "Aunque ofrece oportunidades, la globalización también genera grandes desigualdades."],
    ["El sector servicios es el más importante en las economías de los países desarrollados.", "Incluye actividades muy diversas como el comercio, el turismo, la sanidad o la educación.", "No produce bienes materiales, sino que ofrece prestaciones a las personas o a las empresas.", "El desarrollo del turismo ha sido fundamental para la economía de países como España."],
    ["La Unión Europea es un proyecto de integración económica y política único en el mundo.", "Nació tras la Segunda Guerra Mundial con el objetivo de asegurar la paz en el continente.", "Ha creado un mercado único donde personas, bienes y capitales circulan libremente.", "La mayoría de sus países miembros comparten una moneda única, el euro.", "Toma decisiones importantes que afectan a la vida de sus ciudadanos."],
    ["La Revolución Rusa de 1917 tuvo un impacto mundial.", "Acabó con el gobierno de los zares e instauró el primer estado comunista de la historia.", "Líderes como Lenin y Trotsky dirigieron a los bolcheviques en la toma del poder.", "Se basaba en las ideas del filósofo Karl Marx.", "Este acontecimiento marcó el inicio de la Guerra Fría con Estados Unidos."],
    ["España en el siglo XIX fue un período de gran agitación política y social.", "Tras la Guerra de la Independencia contra Napoleón, se intentó establecer un régimen liberal.", "Se sucedieron numerosos cambios de gobierno, pronunciamientos militares y guerras civiles.", "La monarquía de Isabel II fue inestable y terminó con una revolución en 1868.", "El siglo finalizó con la pérdida de las últimas colonias: Cuba, Puerto Rico y Filipinas."]
];

const OrdenaLaHistoriaEso3Historia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso3Historia;
