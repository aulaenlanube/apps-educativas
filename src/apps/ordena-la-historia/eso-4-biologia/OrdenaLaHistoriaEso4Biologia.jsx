// src/apps/ordena-la-historia/eso-4-biologia/OrdenaLaHistoriaEso4Biologia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El ADN es la molécula que contiene las instrucciones para la vida.", "Está formado por una doble hélice de dos cadenas de nucleótidos.", "Un gen es un segmento de ADN con la información para fabricar una proteína.", "El conjunto de todos los genes de un organismo constituye su genoma.", "La replicación es el proceso por el que el ADN hace una copia de sí mismo antes de la división celular."],
    ["La teoría de la evolución por selección natural fue propuesta por Darwin y Wallace.", "Plantea que los individuos de una población presentan variaciones hereditarias.", "El medio ambiente ejerce una presión que selecciona a los individuos mejor adaptados.", "Estos individuos tienen más probabilidades de sobrevivir y reproducirse.", "Con el tiempo, la acumulación de estas variaciones puede dar lugar a una nueva especie.", "Los fósiles y la anatomía comparada son pruebas que apoyan esta teoría."],
    ["La meiosis es un tipo especial de división celular que produce los gametos.", "A partir de una célula diploide, se obtienen cuatro células haploides.", "Durante la meiosis, se produce la recombinación genética, que aumenta la variabilidad.", "Este proceso es fundamental para la reproducción sexual.", "Asegura que los descendientes tengan un número de cromosomas correcto.", "La variabilidad que genera es la materia prima sobre la que actúa la selección natural."],
    ["Un ecosistema está formado por el biotopo y la biocenosis.", "El biotopo es el medio físico, con sus factores abióticos como la luz o la temperatura.", "La biocenosis es el conjunto de seres vivos que habitan en él.", "Entre ellos se establecen relaciones tróficas que forman cadenas y redes.", "La energía fluye desde los productores a los consumidores, mientras que la materia se recicla.", "El equilibrio del ecosistema es delicado y puede ser alterado por la actividad humana."],
    ["La ingeniería genética es un conjunto de técnicas que permiten manipular el ADN.", "Una de sus herramientas son las enzimas de restricción, que pueden cortar el ADN en puntos específicos.", "Permite introducir genes de una especie en otra, creando organismos transgénicos.", "Tiene aplicaciones en medicina, como la producción de insulina humana en bacterias.", "También se utiliza en agricultura para crear plantas más resistentes a las plagas.", "Sin embargo, su uso genera un importante debate ético y social."],
    ["Las leyes de Mendel describen cómo se transmiten los caracteres hereditarios.", "Mendel realizó sus experimentos cruzando diferentes variedades de guisantes.", "Descubrió que existen factores (hoy llamados alelos) dominantes y recesivos.", "La primera ley establece que los híbridos de la primera generación son todos iguales.", "La segunda ley explica que los alelos se segregan durante la formación de los gametos.", "Sus trabajos sentaron las bases de la genética moderna."],
    ["La tectónica de placas explica la dinámica de la superficie terrestre.", "La litosfera está fragmentada en placas que se mueven sobre el manto.", "En los bordes convergentes, las placas chocan, formando cordilleras o zonas de subducción.", "En los bordes divergentes, las placas se separan, permitiendo la salida de magma y creando nueva corteza.", "En los bordes transformantes, las placas se deslizan lateralmente, provocando intensos terremotos."],
    ["La biodiversidad o diversidad biológica es la gran variedad de seres vivos que existen en la Tierra.", "Incluye la diversidad de especies, la diversidad genética dentro de cada especie y la diversidad de ecosistemas.", "Es el resultado de miles de millones de años de evolución.", "La actividad humana, como la deforestación o la contaminación, es su principal amenaza.", "Conservar la biodiversidad es esencial para el equilibrio del planeta y nuestro propio bienestar."],
    ["El proceso de fosilización permite que los restos de un organismo se conserven durante millones de años.", "Tras la muerte del ser vivo, sus partes blandas se descomponen rápidamente.", "Sus partes duras, como huesos o conchas, son cubiertas por sedimentos.", "Con el tiempo, los minerales de los sedimentos sustituyen la materia orgánica del resto.", "El sedimento se compacta y se convierte en roca, conservando el fósil en su interior.", "Los fósiles son una ventana al pasado de la vida en nuestro planeta."],
    ["El ciclo celular es el conjunto de etapas por las que pasa una célula desde que nace hasta que se divide.", "La mayor parte del tiempo, la célula se encuentra en la interfase, durante la cual crece y duplica su ADN.", "La fase de división o fase M es cuando se produce el reparto del material genético.", "En las células somáticas, esta división se realiza por mitosis.", "El ciclo está finamente regulado, y un fallo en esta regulación puede provocar cáncer."]
];

const OrdenaLaHistoriaEso4Biologia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso4Biologia;
