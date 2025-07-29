import React from 'react';
import { useOrdenaLaHistoriaGame } from '../../hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '../_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '../_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    // Historias originales
    ["El perro juega.", "Corre en el parque.", "Luego, bebe agua."],
    ["La niña pinta.", "Usa el color rojo.", "Dibuja una casa."],
    ["El sol sale.", "El gallo canta.", "Es un nuevo día."],
    ["Mi gato es mimoso.", "Le gusta dormir.", "Duerme en el sofá."],
    ["Veo un pájaro.", "Está en el árbol.", "Canta una canción."],
    ["La rana salta.", "Salta en el charco.", "El charco tiene agua."],
    ["Tengo una pelota.", "La pelota es azul.", "Juego con la pelota."],
    ["El pez nada.", "Nada en el río.", "El río es largo."],
    ["Es de noche.", "La luna brilla.", "Las estrellas se ven."],
    ["Papá lee un cuento.", "El cuento es de un león.", "El león es valiente."],
    // Nuevas historias
    ["El bebé ríe.", "Juega con un sonajero.", "Su mamá le mira."],
    ["El coche es rojo.", "Tiene cuatro ruedas.", "Hace mucho ruido."],
    ["La flor es bonita.", "Huele muy bien.", "Necesita agua y sol."],
    ["Vamos a la playa.", "Hacemos un castillo.", "Jugamos con la arena."],
    ["El helado está frío.", "Es de fresa.", "Me lo como en verano."],
    ["La mariposa vuela.", "Tiene alas de colores.", "Se posa en una flor."],
    ["El panadero trabaja.", "Hace pan con harina.", "El pan está caliente."],
    ["El tren viaja lejos.", "Va por las vías.", "Hace pii-pii."],
    ["El payaso es gracioso.", "Lleva una nariz roja.", "Cuenta chistes divertidos."],
    ["La gallina cacarea.", "Pone un huevo.", "Del huevo nace un pollito."],
    ["El bombero es valiente.", "Apaga el fuego.", "Usa una manguera grande."],
    ["La abeja busca flores.", "Recoge el néctar.", "Hace miel dulce."],
    ["El barco navega.", "Flota en el mar.", "El capitán mira el mapa."],
    ["Mi abuela me abraza.", "Me da un beso.", "La quiero mucho."],
    ["El caracol es lento.", "Lleva su casa a cuestas.", "Deja un rastro brillante."],
    ["Es mi cumpleaños.", "Soplo las velas.", "Como tarta de chocolate."],
    ["El agricultor siembra.", "Crece una planta.", "Recoge la cosecha."],
    ["El león ruge fuerte.", "Es el rey de la selva.", "Tiene una gran melena."],
    ["La tortuga camina.", "Se esconde en su caparazón.", "Vive muchos años."],
    ["El conejo come zanahorias.", "Tiene orejas largas.", "Salta por el campo."],
    ["El mono come plátanos.", "Se cuelga de los árboles.", "Hace muchas monerías."],
    ["El elefante es enorme.", "Tiene una trompa larga.", "Le gusta el agua."],
    ["Voy al colegio.", "Aprendo los números.", "Juego con mis amigos."],
    ["La lluvia cae.", "El suelo se moja.", "Salen los caracoles."],
    ["El oso come miel.", "Duerme en invierno.", "Vive en el bosque."],
    ["El pingüino vive en el frío.", "Camina muy gracioso.", "Sabe nadar muy bien."],
    ["La jirafa es muy alta.", "Tiene el cuello largo.", "Come hojas de los árboles."],
    ["El lobo aúlla.", "Vive en la montaña.", "Corre en manada."],
    ["El ratón come queso.", "Se esconde del gato.", "Es pequeño y rápido."],
    ["El cerdito juega en el barro.", "Le gusta estar sucio.", "Hace oinc-oinc."],
    ["La oveja tiene lana.", "El pastor la cuida.", "Dice beee-beee."],
    ["El caballo corre mucho.", "Come hierba fresca.", "Vive en el establo."],
    ["El cocodrilo es verde.", "Tiene dientes grandes.", "Abre su boca enorme."],
    ["La serpiente se arrastra.", "No tiene patas.", "Cambia de piel."],
    ["El pulpo tiene ocho brazos.", "Lanza tinta para escapar.", "Vive en el fondo del mar."],
    ["La ardilla busca nueces.", "Sube a los árboles.", "Tiene una cola peluda."],
    ["El médico me cura.", "Usa un fonendoscopio.", "Me da una medicina."],
    ["El maestro enseña.", "Escribe en la pizarra.", "Leemos juntos un libro."],
    ["El policía nos cuida.", "Dirige el tráfico.", "Lleva un uniforme."],
    ["El pollito es amarillo.", "Dice pío-pío.", "Sigue a su mamá gallina."]
];

const OrdenaLaHistoria1 = () => {
    // El 'false' indica que no hay temporizador para este nivel
    const game = useOrdenaLaHistoriaGame(historias, false); 

    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoria1;