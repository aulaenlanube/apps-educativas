// src/apps/ordena-la-frase-eso-2-historia/OrdenaLaFraseEso2Historia.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La Edad Media comienza con la caída del Imperio Romano de Occidente.",
    "El feudalismo fue el sistema social, político y económico de la Edad Media.",
    "Los musulmanes conquistaron la Península Ibérica en el año 711.",
    "Al-Ándalus fue el territorio de la península bajo dominio musulmán.",
    "La Reconquista fue el proceso por el cual los reinos cristianos recuperaron el territorio.",
    "Las Cruzadas fueron expediciones militares de los cristianos para recuperar Tierra Santa.",
    "El arte románico se caracteriza por sus muros gruesos y arcos de medio punto.",
    "El arte gótico buscaba la altura y la luminosidad en sus catedrales.",
    "La Peste Negra fue una epidemia que asoló Europa en el siglo XIV.",
    "La invención de la imprenta por Gutenberg revolucionó la difusión de la cultura.",
    "Los Reyes Católicos unificaron los reinos de Castilla y Aragón.",
    "El descubrimiento de América en 1492 abrió nuevas rutas comerciales.",
    "El Renacimiento fue un movimiento cultural que surgió en Italia.",
    "La Reforma Protestante fue iniciada por Martín Lutero en Alemania.",
    "El clima oceánico se caracteriza por temperaturas suaves y lluvias abundantes.",
    "El clima mediterráneo tiene veranos secos y calurosos e inviernos suaves.",
    "Los ríos de la vertiente atlántica son largos y caudalosos.",
    "La población de un país se estudia mediante censos y padrones.",
    "La densidad de población relaciona el número de habitantes con la superficie.",
    "El sector primario incluye actividades como la agricultura y la ganadería.",
    "La industria pertenece al sector secundario de la economía.",
    "El sector terciario engloba los servicios como el comercio o el turismo.",
    "La Unión Europea es una organización económica y política de países europeos.",
    "La globalización es la creciente interconexión entre los países del mundo.",
    "El Camino de Santiago fue una importante ruta de peregrinación medieval.",
    "Los monasterios fueron centros de cultura durante la Edad Media.",
    "La sociedad feudal se dividía en estamentos: nobleza, clero y pueblo llano.",
    "La burguesía surgió en las ciudades medievales como un nuevo grupo social.",
    "El Humanismo puso al ser humano en el centro del universo.",
    "Artistas como Leonardo da Vinci o Miguel Ángel destacaron en el Renacimiento.",
    "El Imperio Inca se desarrolló en la cordillera de los Andes.",
    "Los aztecas fundaron la gran ciudad de Tenochtitlán.",
    "El relieve de España se organiza en torno a la Meseta Central.",
    "Los Pirineos son una importante cordillera que separa España de Francia.",
    "El río Ebro es el más caudaloso de España.",
    "La natalidad es el número de nacimientos que se producen en un lugar.",
    "La mortalidad es el número de fallecimientos en una población.",
    "El éxodo rural es el desplazamiento de la población del campo a la ciudad.",
    "La agricultura de secano depende exclusivamente de la lluvia.",
    "El turismo es una de las actividades económicas más importantes de España."
];

const OrdenaLaFraseEso2Historia = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso2Historia;
