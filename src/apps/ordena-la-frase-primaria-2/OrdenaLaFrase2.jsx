import React from 'react';
import { useOrdenaLaFraseGame } from '../../hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '../_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '../_shared/OrdenaLaFraseTestScreen';

const frases = [
    "El pájaro azul canta en la ventana.", "Mi bicicleta roja es muy rápida.", "Los peces de colores nadan en el río.",
    "La casa grande tiene un jardín bonito.", "El gato negro duerme sobre el sofá.", "Mi abuela cocina galletas deliciosas.",
    "El sol amarillo calienta por la mañana.", "Las nubes blancas parecen de algodón.", "El coche verde va por la carretera.",
    "El elefante gris tiene orejas grandes.", "La jirafa alta come hojas del árbol.", "El mono divertido salta entre las ramas.",
    "El helado de fresa está muy frío.", "La sopa de verduras es saludable.", "El zumo de naranja tiene vitaminas.",
    "Mi amigo Juan juega muy bien al fútbol.", "La profesora explica la lección con paciencia.", "Los bomberos apagan el fuego con agua.",
    "El policía dirige el tráfico en la calle.", "El médico cura a las personas enfermas.", "El león feroz ruge en la selva.",
    "La tortuga camina muy despacio.", "En invierno nieva mucho en las montañas.", "Me gusta leer cuentos de aventuras.",
    "El castillo tenía un dragón dormido.", "Mi mochila nueva es de color verde.", "El pastel de chocolate es mi postre favorito.",
    "Los barcos navegan por el mar azul.", "El avión vuela por encima de las nubes.", "El agricultor recoge las manzanas del campo.",
    "La luna llena ilumina el campo por la noche.", "Mi perro pequeño juega con una pelota amarilla.", "El payaso gracioso lleva zapatos enormes.",
    "Mi hermano menor construye torres con bloques.", "La mariposa de colores vuela entre las flores.", "El tren largo viaja por las vías de metal.",
    "En el bosque viven muchos animales salvajes.", "El cocodrilo verde tiene dientes muy afilados.", "La bailarina danza con un vestido rosa.",
    "El pirata busca un tesoro escondido.", "La estrella fugaz cruzó el cielo rápidamente.", "El mago sacó un conejo de su sombrero.",
    "El fantasma simpático vive en el castillo.", "El robot inteligente puede hablar y caminar.", "El dinosaurio gigante comía plantas y hojas.",
    "La sirena canta una bonita canción en el mar.", "El superhéroe valiente salva a la ciudad.", "El ogro verde vive en una ciénaga lejana.",
    "El hada madrina concedió tres deseos.", "El dragón rojo escupe fuego por la boca.", "Mi padre lee el periódico todas las mañanas.",
    "Mi madre prepara la cena para toda la familia.", "El bebé de mi tía duerme en su cuna.", "Los niños corren felices por el parque.",
    "El jardinero cuida las flores con mucho cariño.", "El panadero amasa el pan muy temprano.", "El carpintero hace muebles de madera.",
    "La costurera cose un vestido precioso.", "El pintor mezcla los colores en su paleta.", "El músico toca el violín en la orquesta.",
    "El escritor inventa historias fantásticas.", "El científico hace experimentos en su laboratorio.", "El astronauta viaja al espacio en una nave.",
    "El explorador descubre nuevos lugares en el mapa.", "El deportista entrena duro para la competición.", "El profesor enseña a los alumnos a sumar.",
    "El heladero vende helados de muchos sabores.", "El granjero conduce su tractor por el campo.", "La florista vende ramos de flores preciosos.",
    "El zapatero arregla los zapatos rotos.", "El cartero trae las cartas a mi casa.", "El cocinero usa un gorro blanco muy alto.",
    "El dentista nos ayuda a tener dientes sanos.", "El peluquero corta el pelo con sus tijeras.", "El mecánico arregla los coches en el taller.",
    "El camarero sirve la comida en el restaurante.", "El juez es justo en sus decisiones.", "El piloto vuela el avión por el cielo.",
    "El capitán dirige su barco en el océano.", "El actor interpreta un papel en la película.", "La actriz sale en un programa de televisión.",
    "El fotógrafo hace fotos de paisajes bonitos.", "El veterinario cuida de los animales enfermos.", "El bibliotecario ordena los libros en las estanterías.",
    "El socorrista vigila la piscina en verano.", "El guía nos enseña los monumentos de la ciudad.", "El director de orquesta mueve su batuta.",
    "El agricultor siembra semillas en la tierra.", "El apicultor recoge la miel de las abejas.", "El pastor cuida de sus ovejas en el monte.",
    "El leñador corta árboles con su hacha.", "El minero busca minerales bajo tierra.", "El pescador lanza su red al mar.",
    "El alfarero hace vasijas de barro.", "El reloj de la torre da las horas.", "La fuente del parque tiene agua fresca."
];

const OrdenaLaFrase2 = () => {
    const game = useOrdenaLaFraseGame(frases, false); // false = sin temporizador
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFrase2;