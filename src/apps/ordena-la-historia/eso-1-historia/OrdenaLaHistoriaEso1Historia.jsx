// src/apps/ordena-la-historia/eso-1-historia/OrdenaLaHistoriaEso1Historia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La Prehistoria es la etapa más larga del pasado de la humanidad.", "Se divide en Paleolítico, Neolítico y Edad de los Metales.", "En el Paleolítico, los humanos eran nómadas, cazadores y recolectores.", "Con la invención de la agricultura en el Neolítico, se hicieron sedentarios.", "En la Edad de los Metales aprendieron a fabricar herramientas de metal."],
    ["La civilización egipcia surgió a orillas del río Nilo.", "El faraón era su rey y lo consideraban un dios.", "Construyeron grandes pirámides como tumbas para los faraones.", "Desarrollaron la escritura jeroglífica para registrar su historia.", "Creían en la vida después de la muerte y momificaban a sus difuntos."],
    ["La democracia nació en la antigua ciudad griega de Atenas.", "Todos los ciudadanos varones podían participar en la asamblea.", "En la asamblea se votaban las leyes y se tomaban las decisiones importantes.", "Este sistema de gobierno ha influido en nuestras sociedades actuales."],
    ["El Imperio Romano llegó a dominar todas las tierras alrededor del mar Mediterráneo.", "Construyeron una gran red de calzadas para conectar sus provincias.", "El latín, su lengua, se extendió por todo el imperio.", "Su impresionante arquitectura, como el Coliseo, todavía se conserva."],
    ["El planeta Tierra realiza un movimiento de rotación sobre sí mismo.", "Este movimiento dura aproximadamente 24 horas.", "Es el responsable de la sucesión de los días y las noches.", "La zona iluminada por el Sol está de día, mientras que la zona a oscuras está de noche."],
    ["Los mapas son representaciones planas de la superficie terrestre.", "Utilizan una escala para mostrar la relación entre las distancias del mapa y la realidad.", "Los símbolos y colores de la leyenda nos ayudan a interpretar la información.", "Gracias a los mapas, podemos orientarnos y conocer lugares lejanos."],
    ["El clima de una zona depende de factores como la latitud y la altitud.", "La temperatura y las precipitaciones son los elementos principales del clima.", "Existen diferentes tipos de climas en el mundo, como el ecuatorial o el polar.", "El clima influye en la vegetación, la fauna y las actividades humanas."],
    ["En el Neolítico, los seres humanos descubrieron la agricultura y la ganadería.", "Esto les permitió producir sus propios alimentos y dejar de ser nómadas.", "Construyeron los primeros poblados estables cerca de tierras fértiles.", "También inventaron la cerámica para almacenar alimentos y la rueda para el transporte."],
    ["La sociedad romana estaba dividida en patricios y plebeyos.", "Los patricios eran las familias ricas y poderosas que controlaban el gobierno.", "Los plebeyos eran el resto de la población: campesinos, artesanos y comerciantes.", "Los esclavos no tenían derechos y eran considerados propiedad de sus amos."],
    ["El relieve de la península ibérica se organiza en torno a la Meseta Central.", "Esta meseta está rodeada por importantes sistemas montañosos.", "Las cordilleras más importantes son los Pirineos, el Sistema Central y las Cordilleras Béticas.", "Las zonas costeras presentan llanuras litorales y rías." ]
];

const OrdenaLaHistoriaEso1Historia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso1Historia;
