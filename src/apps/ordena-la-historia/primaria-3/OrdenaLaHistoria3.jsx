import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El astronauta flotaba en el espacio.", "Observaba la Tierra desde su nave.", "Mañana volverá a casa."],
    ["Ayer, mi equipo ganó el partido de baloncesto.", "Metí la canasta decisiva en el último segundo.", "Lo celebramos todos juntos."],
    ["Los romanos construyeron grandes acueductos.", "Llevaban agua a las ciudades importantes.", "Aún hoy se pueden ver sus ruinas."],
    ["El científico mezcló dos líquidos en su laboratorio.", "De repente, la mezcla empezó a echar humo.", "Había descubierto una nueva reacción."],
    ["La orquesta se preparaba para el concierto.", "El director levantó su batuta.", "La música comenzó a sonar maravillosamente."],
    ["Hace millones de años, los dinosaurios dominaban la Tierra.", "Algunos eran herbívoros y otros carnívoros.", "Se extinguieron por un gran meteorito."],
    ["El detective siguió las huellas en el barro.", "Las pistas lo llevaron a una vieja cabaña.", "Allí dentro, resolvió el enigma."],
    ["El año que viene, mi familia y yo iremos a la montaña.", "Aprenderé a esquiar en la nieve.", "Construiremos un muñeco de nieve gigante."],
    ["El panadero se levanta antes que el sol.", "Prepara la masa con harina y agua.", "Hornea el pan hasta que está dorado y crujiente."],
    ["La exploradora viajó a la selva del Amazonas.", "Navegó por el río en una pequeña canoa.", "Descubrió una especie de rana desconocida."],
    ["El volcán estuvo inactivo durante cien años.", "Un día, empezó a temblar con fuerza.", "Finalmente, entró en erupción con una gran explosión."],
    ["El viejo marinero recordaba sus aventuras.", "Hablaba de tormentas y monstruos marinos.", "Siempre terminaba diciendo que el mar era su hogar."],
    ["El jardinero plantó un rosal en primavera.", "Lo cuidó con agua y abono todo el verano.", "En otoño, el rosal dio unas flores rojas preciosas."],
    ["Mi hermana pequeña está aprendiendo a leer.", "Junta las letras para formar palabras.", "Pronto podrá leer cuentos ella sola."],
    ["El castillo estaba encantado, según la leyenda.", "Por las noches se oían ruidos extraños.", "Unos niños valientes decidieron investigar el misterio."],
    ["El águila construyó su nido en lo alto de la montaña.", "Desde allí, vigilaba todo el valle.", "Se lanzaba en picado para cazar a sus presas."],
    ["Los egipcios construyeron las pirámides.", "Eran tumbas para sus faraones.", "Dentro guardaban grandes tesoros."],
    ["El caballo galopaba por el campo verde.", "El viento movía su larga crin.", "Saltó un arroyo sin ninguna dificultad."],
    ["El próximo sábado será el cumpleaños de mi abuelo.", "Toda la familia se reunirá para celebrarlo.", "Le hemos comprado un libro de historia."],
    ["El zorro astuto quería robar las gallinas.", "Se acercó al gallinero sin hacer ruido.", "Pero el perro guardián lo descubrió y ladró."],
    ["El pintor preparó sus pinceles y su paleta.", "Miró el paisaje durante un largo rato.", "Empezó a pintar la puesta de sol sobre el mar."],
    ["Cuando sea mayor, quiero ser veterinaria.", "Cuidaré de los perros y los gatos.", "Ayudaré a todos los animales que estén enfermos."],
    ["Las cigüeñas viajan a África en invierno.", "Buscan un lugar más cálido para vivir.", "En primavera, regresan a sus nidos."],
    ["El tren de alta velocidad cruzó el país.", "Viajaba a más de 300 kilómetros por hora.", "Llegó a su destino en muy poco tiempo."],
    ["La tortuga marina nadó hasta la playa.", "Hizo un nido en la arena.", "Puso sus huevos y volvió al mar."],
    ["Anoche hubo una fuerte tormenta.", "Los relámpagos iluminaban todo el cielo.", "Los truenos sonaban con mucha fuerza."],
    ["El leñador fue al bosque con su hacha.", "Eligió un árbol grande y seco.", "Cortó la leña para pasar el invierno."],
    ["El músico afinó su violín.", "Cerró los ojos para concentrarse.", "Tocó una melodía muy triste y bonita."],
    ["El topo vive en túneles subterráneos.", "No puede ver muy bien.", "Usa su olfato para encontrar comida."],
    ["El equipo de rescate subió a la montaña.", "Buscaban a un excursionista perdido.", "Lo encontraron sano y salvo al anochecer."],
    ["La abeja obrera recoge polen de las flores.", "Lo lleva a la colmena para hacer miel.", "Así alimentan a toda la colonia."],
    ["El escritor se sentó frente a la hoja en blanco.", "Pensó en una nueva aventura para su personaje.", "Comenzó a escribir la primera frase."],
    ["El semáforo se puso en rojo.", "Todos los coches se detuvieron.", "Los peatones cruzaron la calle con seguridad."],
    ["El camaleón se quedó muy quieto en la rama.", "Su piel cambió al color de las hojas.", "Así, sus enemigos no podían verlo."],
    ["Mi padre me enseñó a pescar en el lago.", "Lanzamos el anzuelo con un cebo.", "Después de un rato, un pez picó."],
    ["La orquesta sinfónica afinaba sus instrumentos.", "El público esperaba en silencio.", "El concierto estaba a punto de empezar."],
    ["El guepardo es el felino más veloz.", "Puede alcanzar grandes velocidades en pocos segundos.", "Usa su velocidad para cazar gacelas."],
    ["La Tierra da una vuelta completa sobre sí misma cada 24 horas.", "A este movimiento lo llamamos rotación.", "Esto crea el día y la noche."],
    ["Los bomberos recibieron una llamada de emergencia.", "Se pusieron sus trajes rápidamente.", "Salieron con el camión haciendo sonar la sirena."],
    ["El arqueólogo encontró un jarrón antiguo.", "Lo limpió con mucho cuidado.", "Pertenecía a una civilización muy antigua."],
    ["El ruiseñor canta al atardecer.", "Su trino es uno de los más bellos.", "La gente se para a escucharlo en el parque."],
    ["El Sol es una estrella gigante.", "Nos da la luz y el calor necesarios para vivir.", "Sin él, la Tierra sería un planeta helado."],
    ["El oso pardo busca bayas en el bosque.", "También le gusta pescar salmones en el río.", "En invierno, duerme en su osera."],
    ["El chef probó la salsa con una cuchara.", "Añadió un poco más de sal y pimienta.", "Ahora estaba perfecta para la pasta."],
    ["La golondrina hizo su nido de barro.", "Lo pegó debajo del alero de una casa.", "Allí criará a sus polluelos."],
    ["El inventor trabajó en su taller durante meses.", "Estaba construyendo una máquina del tiempo.", "Finalmente, apretó el botón para probarla."],
    ["El capitán del barco miró el horizonte.", "Vio una isla a lo lejos.", "Dirigió el barco hacia la nueva tierra."],
    ["La Luna tiene diferentes fases.", "A veces la vemos llena y otras veces creciente.", "Esto ocurre por cómo la ilumina el Sol."],
    ["El escultor golpeaba la piedra con su cincel.", "Poco a poco, una figura empezó a aparecer.", "Era la estatua de un caballo."],
    ["El colibrí es un pájaro muy pequeño.", "Sus alas se mueven tan rápido que zumban.", "Puede volar hacia atrás."]
];

const OrdenaLaHistoria3 = () => {
    // A partir de 3º, activamos el temporizador en el modo test
    const game = useOrdenaLaHistoriaGame(historias, true); 

    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoria3;