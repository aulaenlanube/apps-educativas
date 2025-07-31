// src/apps/ordena-la-historia/eso-1-biologia/OrdenaLaHistoriaEso1Biologia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["La fotosíntesis es un proceso vital para las plantas.", "La planta absorbe agua por las raíces y dióxido de carbono por las hojas.", "Utilizando la energía de la luz solar, transforma estos componentes en su alimento.", "Como producto de desecho, la planta libera el oxígeno que respiramos.", "Por eso, los bosques son fundamentales para la vida en la Tierra."],
    ["La célula es la unidad más pequeña que forma a todos los seres vivos.", "Posee una membrana que la rodea y protege del exterior.", "En su interior se encuentra el citoplasma, donde están los orgánulos.", "El núcleo es el orgánulo que contiene la información genética.", "Existen seres unicelulares y pluricelulares."],
    ["Una cadena alimentaria comienza con los productores, que son las plantas.", "Los consumidores primarios, o herbívoros, se alimentan de las plantas.", "Los consumidores secundarios, o carnívoros, se alimentan de los herbívoros.", "Finalmente, los descomponedores transforman la materia muerta en nutrientes.", "Este ciclo asegura el equilibrio en el ecosistema."],
    ["El ciclo del agua comienza con la evaporación del agua de mares y ríos.", "El vapor de agua asciende y se enfría, formando las nubes en un proceso de condensación.", "Cuando las gotas de agua en las nubes se hacen grandes, caen en forma de precipitación.", "El agua regresa a los ríos y mares, y el ciclo vuelve a empezar."],
    ["Los animales vertebrados se caracterizan por tener un esqueleto interno con columna vertebral.", "Se clasifican en cinco grandes grupos: mamíferos, aves, reptiles, anfibios y peces.", "Los mamíferos, como los perros, alimentan a sus crías con leche.", "Las aves, como las águilas, tienen el cuerpo cubierto de plumas.", "Los peces, como el salmón, respiran por branquias bajo el agua."],
    ["La Tierra está formada por varias capas concéntricas.", "La capa más externa y delgada es la corteza terrestre.", "Debajo se encuentra el manto, que es mucho más grueso y está muy caliente.", "En el centro del planeta está el núcleo, compuesto principalmente de hierro."],
    ["Un ecosistema es un sistema formado por los seres vivos y el medio físico en el que habitan.", "Los factores bióticos son todos los seres vivos, como plantas y animales.", "Los factores abióticos son los componentes no vivos, como el agua, el aire y las rocas.", "Todos estos elementos interactúan entre sí de forma equilibrada."],
    ["Los fósiles son restos de seres vivos que vivieron en el pasado.", "Normalmente, se conservan las partes duras como huesos o conchas.", "Al morir, el organismo es cubierto por sedimentos que se transforman en roca.", "Los fósiles nos dan información muy valiosa sobre la historia de la vida."],
    ["El reino de los hongos incluye organismos como las setas, los mohos y las levaduras.", "No son plantas porque no pueden fabricar su propio alimento.", "Se alimentan descomponiendo materia orgánica del suelo.", "Desempeñan un papel muy importante como descomponedores en los ecosistemas."],
    ["Las rocas se forman de diferentes maneras en la naturaleza.", "Las rocas magmáticas se originan por el enfriamiento del magma.", "Las rocas sedimentarias se forman por la acumulación y compactación de sedimentos.", "Las rocas metamórficas se crean cuando otras rocas se transforman por el calor y la presión."]
];

const OrdenaLaHistoriaEso1Biologia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso1Biologia;
