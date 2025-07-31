// src/apps/ordena-la-historia/eso-3-tutoria/OrdenaLaHistoriaEso3Tutoria.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Al finalizar la ESO, se debe tomar una decisión importante sobre el futuro académico.", "Existen dos caminos principales: el Bachillerato o la Formación Profesional.", "El Bachillerato está más orientado a preparar para estudios universitarios.", "La Formación Profesional ofrece una preparación más práctica y enfocada a un oficio.", "Es fundamental informarse bien sobre las opciones para elegir la que mejor se adapte a nuestros intereses.", "Hablar con orientadores, profesores y familia puede ser de gran ayuda."],
    ["La inteligencia emocional es la capacidad de reconocer y gestionar nuestras propias emociones.", "También implica comprender las emociones de los demás y relacionarnos eficazmente.", "Una persona con alta inteligencia emocional sabe controlar sus impulsos.", "Es capaz de automotivarse y de ser empático con quienes le rodean.", "Esta habilidad es tan importante o más que la inteligencia puramente académica."],
    ["Un grupo de amigos quería organizar un viaje de fin de semana.", "Surgieron varios desacuerdos sobre el destino y el presupuesto.", "Decidieron utilizar una técnica de resolución de conflictos.", "Primero, cada uno expuso su punto de vista sin ser interrumpido.", "Luego, buscaron una solución creativa que satisficiera a todos.", "Acordaron ir a un lugar intermedio y compartir los gastos de forma justa."],
    ["El pensamiento crítico es la habilidad de analizar la información de forma objetiva.", "No consiste en aceptar las cosas sin más, sino en cuestionarlas y evaluarlas.", "Cuando leemos una noticia, debemos preguntarnos quién la escribe y con qué intención.", "Es importante buscar diferentes fuentes para contrastar la información.", "Desarrollar esta habilidad nos protege de la manipulación y las noticias falsas."],
    ["El uso responsable de las redes sociales es fundamental en la adolescencia.", "Debemos ser conscientes de que todo lo que publicamos crea nuestra identidad digital.", "Es crucial proteger nuestra privacidad y no compartir datos personales con desconocidos.", "Hay que tratar a los demás con el mismo respeto que en la vida real.", "Ante cualquier situación de ciberacoso, es vital pedir ayuda a un adulto de confianza."],
    ["Para establecer metas personales, primero debemos saber qué queremos conseguir.", "Las metas deben ser específicas, medibles, alcanzables, relevantes y con un plazo de tiempo.", "Por ejemplo, en lugar de 'mejorar en mates', una meta sería 'sacar un 7 en el próximo examen'.", "Luego, debemos dividir la meta grande en pequeños pasos más manejables.", "Celebrar cada pequeño logro nos ayuda a mantener la motivación."],
    ["La presión de grupo puede influir en nuestras decisiones, a veces de forma negativa.", "Es la sensación de que debemos hacer algo para ser aceptados por nuestros amigos.", "Es importante tener confianza en uno mismo y en nuestros propios valores.", "Aprender a decir 'no' de forma asertiva es una herramienta muy poderosa.", "Los verdaderos amigos respetarán nuestras decisiones aunque no las compartan."],
    ["El voluntariado es una forma de contribuir a mejorar nuestra comunidad.", "Consiste en dedicar parte de nuestro tiempo a una causa social de forma altruista.", "Se puede colaborar con organizaciones que ayudan a personas mayores, al medio ambiente o a los animales.", "Es una experiencia muy enriquecedora que nos permite desarrollar la empatía y la solidaridad.", "Además, nos ayuda a conocer otras realidades y a sentirnos útiles."],
    ["La igualdad de género significa que hombres y mujeres deben tener los mismos derechos y oportunidades.", "Sin embargo, todavía existen muchos estereotipos que limitan a las personas.", "Un estereotipo es una idea simplificada sobre cómo deben ser los hombres o las mujeres.", "Es tarea de todos cuestionar estos estereotipos en nuestro día a día.", "Una sociedad más igualitaria es una sociedad más justa para todos."],
    ["Desarrollar una buena autoestima es clave para nuestro bienestar.", "Implica aceptarnos y querernos tal y como somos, con nuestras virtudes y defectos.", "No debemos compararnos constantemente con los demás.", "Es bueno reconocer nuestros logros y aprender de nuestros errores sin culparnos en exceso.", "Rodearse de personas que nos aprecian y nos apoyan también ayuda a fortalecerla."]
];

const OrdenaLaHistoriaEso3Tutoria = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso3Tutoria;
