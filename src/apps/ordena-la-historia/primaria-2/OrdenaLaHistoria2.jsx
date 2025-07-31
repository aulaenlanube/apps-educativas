import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Había una vez un gato negro.", "Siempre dormía sobre el tejado rojo.", "Por la noche, miraba la luna brillante."],
    ["Ana fue al mercado con su cesta.", "Compró manzanas rojas y plátanos amarillos.", "Luego, volvió a casa muy contenta."],
    ["El coche de papá es azul y grande.", "Los fines de semana vamos al campo.", "Cantamos canciones durante el viaje."],
    ["Primero, plantamos una pequeña semilla.", "Después, la regamos todos los días.", "Finalmente, creció una flor preciosa."],
    ["El pirata encontró un mapa del tesoro.", "Navegó en su barco por el océano.", "En una isla, encontró un cofre lleno de oro."],
    ["El pájaro carpintero hizo un agujero.", "Buscaba insectos en la madera.", "Su pico sonaba como un tambor."],
    ["El sol se esconde por la noche.", "Entonces, la luna sale a saludar.", "Las estrellas empiezan a parpadear."],
    ["Mi helado favorito es el de chocolate.", "Tiene trocitos de galleta.", "Me lo como antes de que se derrita."],
    ["El castillo medieval tenía torres altas.", "Un foso con agua lo rodeaba.", "Dentro vivía un rey muy sabio."],
    ["La oruga comió una hoja verde.", "Después, construyó una crisálida.", "Se convirtió en una mariposa de colores."],
    ["El detective buscaba pistas con su lupa.", "Encontró una huella en el suelo.", "Resolvió el misterio del pastel desaparecido."],
    ["El dinosaurio Rex era muy grande.", "Tenía unos dientes muy afilados.", "Daba pisotones que hacían temblar la tierra."],
    ["Cuando llueve, abro mi paraguas.", "Me pongo las botas de agua.", "Salto en los charcos sin mojarme."],
    ["El granjero se levanta muy temprano.", "Da de comer a las gallinas.", "Luego, recoge la leche de la vaca."],
    ["La foca juega con una pelota.", "Aplaude con sus aletas.", "Se desliza rápido por el hielo."],
    ["El astronauta se puso su traje espacial.", "Subió a la nave espacial.", "Despegó hacia las estrellas."],
    ["En la biblioteca hay mucho silencio.", "Elegimos un libro de aventuras.", "Nos sentamos a leer tranquilamente."],
    ["El cocinero prepara una sopa caliente.", "Le añade zanahorias y patatas.", "La sopa huele muy bien."],
    ["El oso polar vive en el Ártico.", "Tiene un pelaje blanco y espeso.", "Nada en el agua helada para pescar."],
    ["Mi amigo y yo construimos una cabaña.", "Usamos ramas y hojas secas.", "Es nuestro escondite secreto."],
    ["El cartero llega con su bicicleta.", "Trae una carta para mi mamá.", "Siempre sonríe y dice buenos días."],
    ["El león es el rey de la sabana.", "Ruge con fuerza para asustar a otros animales.", "Descansa a la sombra de un gran árbol."],
    ["La araña teje su telaraña.", "Espera pacientemente a que un insecto caiga.", "Es una trampa pegajosa y perfecta."],
    ["El mago hizo un truco increíble.", "Sacó una paloma de su sombrero.", "Todo el mundo aplaudió con fuerza."],
    ["El tiburón nada muy rápido en el mar.", "Tiene muchas filas de dientes.", "Es un gran depredador del océano."],
    ["En otoño, las hojas de los árboles caen.", "El viento las sopla por las calles.", "El suelo se cubre con una alfombra marrón."],
    ["El topo cava túneles bajo la tierra.", "No le gusta la luz del sol.", "Busca lombrices para comer."],
    ["El camello camina por el desierto.", "Guarda agua en sus jorobas.", "Puede aguantar muchos días sin beber."],
    ["El búho es un ave nocturna.", "Sale a cazar cuando es de noche.", "Puede girar su cabeza casi por completo."],
    ["El cangrejo camina de lado por la playa.", "Se esconde en la arena cuando hay peligro.", "Tiene dos pinzas muy fuertes."],
    ["El médico escucha mi corazón.", "Me mira la garganta con una luz.", "Me dice que pronto estaré mejor."],
    ["El erizo tiene el cuerpo cubierto de púas.", "Cuando se asusta, se convierte en una bola.", "Las púas le sirven para protegerse."],
    ["El pulpo puede cambiar de color.", "Se camufla con las rocas del mar.", "Tiene tres corazones."],
    ["La abeja reina es la más grande de la colmena.", "Es la única que pone huevos.", "Todas las demás abejas la cuidan."],
    ["El colibrí mueve sus alas muy deprisa.", "Puede quedarse quieto en el aire.", "Bebe el néctar de las flores."],
    ["En el circo, hay trapecistas.", "Vuelan muy alto por los aires.", "El público mira con la boca abierta."],
    ["El volcán estaba dormido.", "Un día, empezó a echar humo.", "Expulsó lava caliente por la cima."],
    ["El delfín es un mamífero muy listo.", "Le gusta saltar fuera del agua.", "Se comunica con otros delfines con silbidos."],
    ["El esqueleto nos ayuda a mantenernos de pie.", "Protege nuestros órganos importantes.", "Está formado por muchos huesos."],
    ["La hormiga es muy trabajadora.", "Lleva trozos de hojas a su hormiguero.", "Trabaja en equipo con sus compañeras."],
    ["El pintor mezcla el azul y el amarillo.", "Así consigue el color verde.", "Pinta un paisaje lleno de árboles."],
    ["El pez payaso vive en una anémona.", "Sus colores brillantes avisan del peligro.", "La anémona no le hace daño."],
    ["El águila vuela muy alto en el cielo.", "Tiene una vista excelente.", "Desde arriba, busca su comida."],
    ["Mi cometa vuela con el viento.", "Tiene una cola de colores largos.", "Tengo que sujetar fuerte el hilo."],
    ["El robot de juguete tiene luces.", "Puede caminar hacia adelante.", "Funciona con pilas."],
    ["El fantasma vive en una casa vieja.", "Por las noches, hace 'buuuu'.", "En realidad, es un fantasma bueno."],
    ["El murciélago duerme boca abajo.", "Sale a volar cuando no hay sol.", "Usa sus oídos para encontrar el camino."],
    ["El alfarero trabaja con el barro.", "Modela una vasija con sus manos.", "Después, la cuece en un horno."],
    ["El carpintero usa un martillo y clavos.", "Construye una silla de madera.", "Al final, la lija para que esté suave."],
    ["La florista prepara un ramo precioso.", "Combina rosas rojas y margaritas blancas.", "Lo envuelve con un lazo de seda."]
];

const OrdenaLaHistoria2 = () => {
    // El 'false' indica que no hay temporizador para este nivel
    const game = useOrdenaLaHistoriaGame(historias, false); 

    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoria2;