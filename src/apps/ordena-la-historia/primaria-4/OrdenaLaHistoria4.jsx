import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El equipo de exploradores se adentró en la jungla.", "Buscaban una ciudad perdida de la que hablaban las leyendas.", "Después de varios días, encontraron las ruinas cubiertas de vegetación."],
    ["La científica observaba el cielo con su telescopio.", "De repente, vio una luz brillante que se movía muy rápido.", "Supo que acababa de descubrir un nuevo cometa."],
    ["Ayer llovió tanto que el río creció muchísimo.", "El agua se salió de su cauce e inundó algunos campos.", "Afortunadamente, no llegó a las casas del pueblo."],
    ["El emperador romano ordenó construir un gran coliseo.", "Allí, los gladiadores luchaban para entretener al público.", "Miles de personas acudían a ver los espectáculos."],
    ["Para hacer el experimento, primero mezclamos el vinagre con el bicarbonato.", "La mezcla empezó a burbujear y a producir un gas.", "Habíamos creado una reacción química."],
    ["El alpinista se preparó durante meses para escalar el Everest.", "La ascensión fue muy dura a causa del frío y el viento.", "Finalmente, consiguió llegar a la cima más alta del mundo."],
    ["Los animales del bosque se asustaron al oler el humo.", "Un incendio se había declarado en la ladera de la montaña.", "Todos corrieron a refugiarse cerca del río."],
    ["El viejo faro guiaba a los barcos durante la noche.", "Su potente luz giraba sin cesar para evitar que encallasen.", "Había salvado a muchos marineros de las rocas."],
    ["El atleta entrenó cada día para la maratón.", "Corrió bajo el sol, la lluvia y el viento.", "El día de la carrera, cruzó la meta en primera posición."],
    ["La semilla fue arrastrada por el viento hasta un campo fértil.", "Con la lluvia de primavera, la semilla germinó.", "Creció hasta convertirse en un roble fuerte y alto."],
    ["El músico compuso una nueva sinfonía para la orquesta.", "Se inspiró en el sonido de las olas del mar.", "El día del estreno, el público aplaudió emocionado."],
    ["Los constructores medievales tardaron décadas en levantar la catedral.", "Utilizaron grandes bloques de piedra que subían con poleas.", "Sus vidrieras de colores contaban historias de la Biblia."],
    ["El tiburón blanco es el depredador más temido del océano.", "Puede detectar una gota de sangre a kilómetros de distancia.", "Usa sus afilados dientes para atrapar a sus presas."],
    ["El próximo verano, mi familia hará un viaje en caravana.", "Recorreremos la costa visitando diferentes playas.", "Dormiremos cada noche en un lugar distinto."],
    ["El sistema solar está formado por el Sol y ocho planetas.", "La Tierra es el tercer planeta más cercano al Sol.", "Júpiter es el planeta más grande de todos."],
    ["La araña tejió una telaraña perfecta entre dos ramas.", "Esperó pacientemente en el centro sin moverse.", "Al poco tiempo, una mosca despistada quedó atrapada."],
    ["El escritor se quedó despierto toda la noche.", "Estaba terminando el último capítulo de su novela.", "Quería que el final fuera sorprendente para sus lectores."],
    ["Durante la Edad de Hielo, la Tierra estaba cubierta por glaciares.", "Muchos animales grandes, como los mamuts, vivían en ese entorno.", "Se adaptaron al frío con un espeso pelaje."],
    ["Si calientas el agua a cien grados, empieza a hervir.", "En ese momento, se convierte en vapor de agua.", "Este proceso se llama evaporación."],
    ["El guepardo persiguió a la gacela por la sabana.", "Corrió a una velocidad increíble para poder alcanzarla.", "Es el animal terrestre más rápido del planeta."],
    ["Los pájaros migratorios vuelan miles de kilómetros.", "Viajan a lugares más cálidos cuando llega el invierno.", "Se guían por el sol y las estrellas para no perderse."],
    ["El apicultor se puso un traje especial para protegerse.", "Abrió la colmena con mucho cuidado para no asustar a las abejas.", "Extrajo los panales llenos de deliciosa miel."],
    ["Cuando sea mayor, viajaré por todo el mundo.", "Aprenderé a hablar diferentes idiomas.", "Conoceré muchas culturas y personas interesantes."],
    ["El emperador chino ordenó construir la Gran Muralla.", "Quería proteger su imperio de los ataques de los nómadas.", "Es una de las construcciones más impresionantes del mundo."],
    ["La ballena azul es el animal más grande que existe.", "Se comunica con otros de su especie mediante cantos.", "A pesar de su tamaño, se alimenta de pequeños crustáceos."],
    ["El puente colgante se balanceaba con el viento.", "Estaba construido con cuerdas y tablas de madera.", "Cruzarlo era una auténtica aventura."],
    ["El antiguo castillo tenía pasadizos secretos.", "Uno de ellos conducía a una mazmorra subterránea.", "Nadie se había atrevido a entrar en cien años."],
    ["El mecánico revisó el motor del coche.", "Encontró una pieza que estaba rota.", "La cambió y el coche volvió a funcionar perfectamente."],
    ["La fotosíntesis es un proceso vital para las plantas.", "Convierten la luz del sol en su propio alimento.", "Gracias a ellas, tenemos el oxígeno que respiramos."],
    ["El ladrón fue descubierto por un perro policía.", "El perro siguió su rastro por toda la ciudad.", "Finalmente, el policía pudo arrestarlo."],
    ["La célula es la parte más pequeña de un ser vivo.", "Algunos seres vivos tienen solo una célula.", "Los humanos tenemos millones de ellas."],
    ["El viento sopló con tanta fuerza que arrancó un árbol.", "El árbol cayó sobre la carretera y cortó el tráfico.", "Los bomberos tuvieron que venir a retirarlo."],
    ["El camaleón puede mover cada ojo de forma independiente.", "Esto le permite mirar en dos direcciones a la vez.", "Es una gran ventaja para cazar y evitar peligros."],
    ["El próximo mes, en el colegio celebraremos el festival.", "Mi clase representará una obra de teatro.", "Estoy nervioso porque tengo un papel importante."],
    ["El cocodrilo espera inmóvil en la orilla del río.", "Parece un tronco flotando en el agua.", "Cuando un animal se acerca, ataca por sorpresa."],
    ["Las vacunas enseñan a nuestro cuerpo a defenderse.", "Contienen una pequeña parte del virus debilitado.", "Así, nuestro sistema inmunitario crea defensas."],
    ["El submarino se sumergió en las profundidades del océano.", "Iba a explorar una fosa marina muy profunda.", "Sus luces iluminaban peces extraños y desconocidos."],
    ["La Tierra gira alrededor del Sol en un viaje que dura un año.", "Este movimiento se llama traslación.", "Es el que produce las cuatro estaciones."],
    ["El esquimal construyó un iglú con bloques de hielo.", "Dentro del iglú, estaba protegido del viento helado.", "Encendió una lámpara de aceite para calentarse."],
    ["El director de cine gritó '¡Acción!'", "Los actores comenzaron a interpretar su escena.", "La cámara grababa cada uno de sus movimientos."],
    ["Los ecosistemas del desierto tienen poca agua.", "Los animales y plantas se han adaptado para sobrevivir.", "Los cactus, por ejemplo, almacenan agua en su interior."],
    ["La Estatua de la Libertad fue un regalo de Francia a Estados Unidos.", "Representa la libertad y la democracia.", "Se encuentra en la ciudad de Nueva York."],
    ["El corazón es un músculo que nunca deja de trabajar.", "Bombea la sangre para que llegue a todo el cuerpo.", "Lleva el oxígeno y los nutrientes que necesitamos."],
    ["El buitre es un ave carroñera.", "Limpia el campo de animales muertos.", "Realiza una función muy importante en la naturaleza."],
    ["El arqueólogo usó un pincel para limpiar el fósil.", "Era el esqueleto de un pequeño dinosaurio.", "Fue un hallazgo de gran importancia científica."],
    ["La mariposa monarca viaja desde Canadá hasta México.", "Es un viaje increíblemente largo para un insecto tan pequeño.", "Lo hacen para escapar del frío invierno."],
    ["El sistema nervioso es como el centro de control del cuerpo.", "El cerebro envía órdenes a través de los nervios.", "Así podemos movernos, sentir y pensar."],
    ["El canguro tiene unas patas traseras muy fuertes.", "Las usa para dar grandes saltos y desplazarse.", "Su larga cola le ayuda a mantener el equilibrio."],
    ["La selva está llena de sonidos por la noche.", "Se oye el canto de las ranas y el zumbido de los insectos.", "Es un ecosistema con una biodiversidad enorme."],
    ["El juez escuchó a los dos testigos.", "Después, revisó todas las pruebas presentadas.", "Finalmente, dictó una sentencia justa."]
];

const OrdenaLaHistoria4 = () => {
    // El 'true' indica que hay temporizador para este nivel
    const game = useOrdenaLaHistoriaGame(historias, true); 

    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoria4;