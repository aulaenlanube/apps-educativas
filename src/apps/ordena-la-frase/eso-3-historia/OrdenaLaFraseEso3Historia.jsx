// src/apps/ordena-la-frase-eso-3-historia/OrdenaLaFraseEso3Historia.jsx
import React from 'react';
import { useOrdenaLaFraseGame } from '@/hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '@/apps/_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '@/apps/_shared/OrdenaLaFraseTestScreen';

const frases = [
    "El siglo XVIII es conocido como el Siglo de las Luces o la Ilustración.",
    "La Revolución Industrial comenzó en Gran Bretaña con la invención de la máquina de vapor.",
    "La Revolución Francesa de 1789 supuso el fin del Antiguo Régimen.",
    "Napoleón Bonaparte extendió las ideas revolucionarias por toda Europa.",
    "La Guerra de la Independencia española fue un conflicto contra la invasión napoleónica.",
    "En el siglo XIX, España vivió un periodo de gran inestabilidad política.",
    "El imperialismo fue la expansión de las potencias europeas por África y Asia.",
    "La Primera Guerra Mundial tuvo lugar entre 1914 y 1918.",
    "El sector primario agrupa las actividades económicas que obtienen recursos de la naturaleza.",
    "La Unión Europea es una organización de integración económica y política.",
    "La globalización ha intensificado las relaciones económicas y culturales a nivel mundial.",
    "El relieve de Europa se organiza en torno a la Gran Llanura Europea.",
    "El clima de España es muy variado debido a su latitud y relieve.",
    "La densidad de población es mayor en las zonas costeras e industriales.",
    "El turismo es un pilar fundamental de la economía española.",
    "La descolonización fue el proceso de independencia de las colonias europeas.",
    "La Revolución Rusa de 1917 estableció el primer estado comunista.",
    "El liberalismo defendía los derechos individuales y la soberanía nacional.",
    "El movimiento obrero surgió para mejorar las condiciones de los trabajadores.",
    "La Constitución de 1812 fue la primera constitución liberal de España.",
    "La Ilustración defendía la razón como motor del progreso humano.",
    "El motor de vapor fue una innovación clave de la Revolución Industrial.",
    "La toma de la Bastilla es el acontecimiento simbólico del inicio de la Revolución Francesa.",
    "Las unificaciones de Italia y Alemania cambiaron el mapa político de Europa.",
    "La Conferencia de Berlín repartió el continente africano entre las potencias europeas.",
    "La guerra de trincheras fue una característica terrible de la Primera Guerra Mundial.",
    "El Tratado de Versalles impuso duras condiciones a Alemania tras la guerra.",
    "La crisis de 1929, o Gran Depresión, tuvo consecuencias económicas mundiales.",
    "El ascenso de los fascismos se produjo en el período de entreguerras.",
    "La Segunda Guerra Mundial fue el conflicto más destructivo de la historia.",
    "El Holocausto fue el genocidio sistemático de millones de judíos por los nazis.",
    "La Guerra Fría enfrentó a Estados Unidos y la Unión Soviética.",
    "La caída del Muro de Berlín en 1989 simbolizó el fin de la Guerra Fría.",
    "El sector servicios es el más importante en las economías desarrolladas.",
    "El desarrollo sostenible busca equilibrar el crecimiento económico y la protección del medio ambiente.",
    "La deslocalización industrial traslada la producción a países con costes más bajos.",
    "La Organización de las Naciones Unidas (ONU) fue creada para mantener la paz mundial.",
    "El proceso de urbanización ha concentrado a la población en las ciudades.",
    "La transición demográfica explica la evolución de la natalidad y la mortalidad.",
    "La Constitución española de 1978 estableció un sistema democrático en España."
];

const OrdenaLaFraseEso3Historia = () => {
    const game = useOrdenaLaFraseGame(frases, true);
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFraseEso3Historia;
