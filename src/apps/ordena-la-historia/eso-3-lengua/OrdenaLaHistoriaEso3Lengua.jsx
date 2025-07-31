// src/apps/ordena-la-historia/eso-3-lengua/OrdenaLaHistoriaEso3Lengua.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["El Romanticismo fue un movimiento que exaltaba los sentimientos por encima de la razón.", "Sus autores anhelaban la libertad y a menudo se sentían en conflicto con la sociedad.", "Gustavo Adolfo Bécquer, con sus 'Rimas', es un ejemplo del posromanticismo español.", "En sus poemas, exploraba el amor idealizado y el desengaño con gran sensibilidad.", "Su obra se caracteriza por una aparente sencillez formal que esconde una gran profundidad."],
    ["El Realismo literario del siglo XIX buscaba ser un espejo de la sociedad de su tiempo.", "Los novelistas observaban y describían con detalle la vida de la burguesía.", "Benito Pérez Galdós es uno de los máximos exponentes de esta corriente en España.", "En novelas como 'Fortunata y Jacinta', retrató magistralmente el Madrid de la época.", "Su objetivo era realizar una crónica fiel de la realidad social y los conflictos humanos."],
    ["Una oración subordinada sustantiva es aquella que desempeña la función de un sustantivo.", "Puede funcionar, por ejemplo, como sujeto de la oración principal.", "También puede actuar como complemento directo de un verbo.", "Se introduce mediante nexos como 'que' o 'si', o con un infinitivo.", "Por ejemplo, en 'Me gusta que vengas', la subordinada es el sujeto."],
    ["La Generación del 98 fue un grupo de escritores preocupados por la decadencia de España.", "Tras la pérdida de las últimas colonias en 1898, reflexionaron sobre la identidad del país.", "Autores como Unamuno, Machado o Baroja buscaron las raíces de la cultura española.", "Su estilo era sobrio y antirretórico, en contraposición al Modernismo.", "Mostraban un gran amor por los paisajes de Castilla, que veían como el alma de España."],
    ["Para realizar un comentario de texto, primero debemos leerlo atentamente varias veces.", "A continuación, resumimos su contenido y determinamos el tema principal.", "Después, analizamos su estructura interna, dividiéndolo en partes lógicas.", "Luego, se estudian los aspectos formales, como el lenguaje y las figuras retóricas.", "Finalmente, redactamos una conclusión personal y una valoración crítica de la obra."],
    ["El Modernismo, liderado por Rubén Darío, renovó profundamente la poesía en español.", "Buscaba la belleza sensorial a través de imágenes exóticas y un lenguaje musical.", "Los modernistas sentían una profunda evasión de la realidad cotidiana y burguesa.", "El cisne se convirtió en uno de los símbolos más representativos del movimiento.", "Su lema era 'el arte por el arte', defendiendo la autonomía de la creación artística."],
    ["La Generación del 27 reunió a un grupo de poetas excepcionales como Lorca, Alberti o Cernuda.", "Combinaron la admiración por la poesía tradicional española con las nuevas vanguardias europeas.", "Utilizaron tanto formas clásicas como el soneto, como el verso libre.", "La metáfora se convirtió en el recurso central de su lenguaje poético.", "La Guerra Civil Española dispersó trágicamente al grupo y marcó el fin de su trayectoria conjunta."],
    ["Una proposición subordinada adjetiva funciona igual que un adjetivo.", "Su función principal es la de complementar a un sustantivo de la oración principal.", "Este sustantivo al que complementa se denomina antecedente.", "El nexo más común para introducirlas es el pronombre relativo 'que'.", "Por ejemplo, en 'El libro que me prestaste es interesante', la subordinada modifica a 'libro'."],
    ["El teatro del Barroco español se representaba en los corrales de comedias.", "Lope de Vega fue uno de sus dramaturgos más prolíficos y populares.", "Creó una nueva fórmula teatral que mezclaba lo trágico y lo cómico.", "Las obras trataban temas como el honor, la monarquía y la religión.", "El público, de todas las clases sociales, acudía masivamente a las representaciones."],
    ["El análisis morfológico de una palabra consiste en descomponerla en sus morfemas.", "Primero, identificamos el lexema o raíz, que contiene el significado principal.", "Luego, buscamos los morfemas flexivos, que indican género, número o tiempo verbal.", "También podemos encontrar morfemas derivativos, como prefijos o sufijos, que crean nuevas palabras.", "Este análisis nos permite comprender la estructura interna del vocabulario."]
];

const OrdenaLaHistoriaEso3Lengua = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso3Lengua;
