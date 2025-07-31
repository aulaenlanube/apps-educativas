// src/apps/ordena-la-historia/eso-3-biologia/OrdenaLaHistoriaEso3Biologia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El proceso de la digestión comienza en la boca.", "Allí, los dientes trituran los alimentos y la saliva comienza la digestión química.", "El bolo alimenticio pasa por la faringe y el esófago hasta llegar al estómago.", "En el estómago, los jugos gástricos continúan descomponiendo los alimentos.", "Finalmente, en el intestino delgado se absorben los nutrientes.", "Los restos no digeridos pasan al intestino grueso y se eliminan."],
    ["El sistema nervioso central es el centro de control de nuestro cuerpo.", "Está formado por el encéfalo, que se encuentra en el cráneo, y la médula espinal.", "El encéfalo se encarga de procesar la información, pensar y tomar decisiones.", "La médula espinal transmite los impulsos nerviosos entre el encéfalo y el resto del cuerpo.", "Además, la médula es responsable de los actos reflejos."],
    ["Una dieta saludable debe ser completa, equilibrada y variada.", "Debe aportarnos todos los nutrientes que nuestro cuerpo necesita: glúcidos, lípidos, proteínas, vitaminas y minerales.", "Los glúcidos, como el pan o la pasta, nos dan energía rápida.", "Las proteínas, presentes en la carne o las legumbres, son necesarias para construir nuestros tejidos.", "Es importante limitar el consumo de grasas saturadas y azúcares."],
    ["El sistema inmunitario nos defiende de los microorganismos que causan enfermedades.", "Cuando un patógeno entra en nuestro cuerpo, los glóbulos blancos lo detectan.", "Algunos glóbulos blancos producen anticuerpos, que son proteínas que neutralizan al invasor.", "Otros glóbulos blancos se encargan de destruir directamente a los patógenos.", "Gracias a la memoria inmunológica, el cuerpo reacciona más rápido en futuras infecciones."],
    ["La tectónica de placas es la teoría que explica la estructura de la corteza terrestre.", "La litosfera está dividida en grandes fragmentos llamados placas tectónicas.", "Estas placas se desplazan lentamente sobre el manto, chocando o separándose entre sí.", "En los límites de las placas es donde se concentran los terremotos y los volcanes.", "El movimiento de las placas es el responsable de la formación de las montañas."],
    ["La circulación sanguínea en los humanos es doble y completa.", "Es doble porque la sangre pasa dos veces por el corazón en cada recorrido.", "Hay un circuito menor que va a los pulmones para oxigenar la sangre.", "Y un circuito mayor que reparte esa sangre oxigenada por todo el cuerpo.", "Es completa porque la sangre rica en oxígeno nunca se mezcla con la sangre pobre en oxígeno."],
    ["Para prevenir enfermedades infecciosas, la higiene es fundamental.", "Lavarse las manos con frecuencia es una de las medidas más eficaces.", "También es importante mantener una correcta higiene de los alimentos que consumimos.", "Las vacunas son otra herramienta clave para prevenir muchas enfermedades graves.", "Nos protegen a nosotros y a las personas que nos rodean."],
    ["El aparato locomotor nos permite movernos y relacionarnos con el entorno.", "Está formado por el sistema esquelético y el sistema muscular.", "El esqueleto, compuesto por los huesos, nos da soporte y protege los órganos.", "Los músculos se unen a los huesos y, al contraerse, generan el movimiento.", "Los huesos y los músculos trabajan de forma coordinada."],
    ["Las rocas metamórficas se forman a partir de otras rocas preexistentes.", "Estas rocas originales son sometidas a altas presiones y temperaturas en el interior de la Tierra.", "Estas condiciones provocan cambios en sus minerales y en su estructura.", "Sin embargo, la roca no llega a fundirse por completo.", "La pizarra o el mármol son ejemplos de rocas metamórficas."],
    ["Un estilo de vida saludable va más allá de la alimentación.", "Incluye la práctica regular de actividad física adaptada a nuestra edad.", "También es fundamental tener un descanso adecuado y dormir las horas suficientes.", "Evitar el consumo de sustancias tóxicas como el tabaco o el alcohol es crucial.", "Cuidar nuestra salud mental y nuestras relaciones sociales también forma parte de ello."]
];

const OrdenaLaHistoriaEso3Biologia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso3Biologia;
