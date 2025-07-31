// src/apps/ordena-la-historia/eso-2-tecnologia/OrdenaLaHistoriaEso2Tecnologia.jsx
import React from 'react';
import { useOrdenaLaHistoriaGame } from '@/hooks/useOrdenaLaHistoriaGame';
import OrdenaLaHistoriaUI from '@/apps/_shared/OrdenaLaHistoriaUI';
import OrdenaLaHistoriaTestScreen from '@/apps/_shared/OrdenaLaHistoriaTestScreen';

const historias = [
    ["Para dibujar las vistas de un objeto, utilizamos el sistema diédrico.", "La vista principal que elegimos es el alzado.", "La planta es la vista del objeto desde arriba.", "El perfil es la vista del objeto desde un lado.", "Las tres vistas nos dan una idea completa de la forma del objeto."],
    ["Las estructuras triangulares son muy utilizadas en construcción por su rigidez.", "Se basan en que el triángulo es el único polígono que no se deforma.", "Al aplicar una fuerza, los lados del triángulo trabajan a tracción o a compresión.", "Esto las hace muy estables y capaces de soportar grandes pesos.", "Podemos verlas en puentes, grúas y torres eléctricas."],
    ["Un mecanismo de tornillo sin fin y corona es un gran reductor de velocidad.", "El tornillo sin fin, al girar, hace que la corona gire muy lentamente.", "Por cada vuelta completa del tornillo, la corona solo avanza un diente.", "Se utiliza en mecanismos que necesitan mucha fuerza y poca velocidad.", "Un ejemplo es el sistema de clavijas para afinar una guitarra."],
    ["El sistema operativo es el programa más importante de un ordenador.", "Se encarga de gestionar todos los recursos del hardware, como la memoria o el procesador.", "Proporciona una interfaz para que el usuario pueda interactuar con la máquina.", "Permite instalar y ejecutar otros programas o aplicaciones."],
    ["Para crear un objeto con una impresora 3D, primero se necesita un diseño digital.", "Este diseño se crea con un programa de modelado 3D o CAD.", "El programa de la impresora divide el modelo en capas muy finas.", "La impresora va depositando el material fundido capa por capa.", "Así, poco a poco, se construye el objeto físico desde la base."],
    ["La ley de Ohm es fundamental para entender los circuitos eléctricos.", "Relaciona tres magnitudes: el voltaje, la intensidad y la resistencia.", "Establece que el voltaje es igual a la intensidad multiplicada por la resistencia.", "Nos permite calcular una de las magnitudes si conocemos las otras dos."],
    ["Los metales son materiales muy importantes en tecnología.", "Se extraen de los minerales que se encuentran en la corteza terrestre.", "Son buenos conductores del calor y la electricidad.", "Se pueden deformar sin romperse, lo que permite fabricar láminas o hilos."],
    ["Una red de ordenadores permite compartir recursos e información.", "Los ordenadores se conectan entre sí mediante cables o de forma inalámbrica (wifi).", "Un dispositivo llamado router gestiona el tráfico de datos en la red.", "Internet es la red de redes más grande que existe."],
    ["El proceso para reciclar el papel comienza con su recogida selectiva.", "En la planta de reciclaje, se mezcla con agua para obtener una pasta.", "Esta pasta se limpia para eliminar tintas y otros residuos.", "Luego, se blanquea y se pasa por unos rodillos para formar nuevas hojas de papel.", "Reciclar papel ayuda a salvar árboles y a ahorrar energía."],
    ["Una palanca de primer género tiene el punto de apoyo entre la fuerza y la resistencia.", "Un balancín o unas tijeras son ejemplos de este tipo.", "Permite amplificar la fuerza que aplicamos.", "Cuanto más lejos del punto de apoyo apliquemos la fuerza, mayor será el efecto."]
];

const OrdenaLaHistoriaEso2Tecnologia = () => {
    const game = useOrdenaLaHistoriaGame(historias, true);
    if (game.isTestMode) {
        return <OrdenaLaHistoriaTestScreen game={game} />;
    }
    return <OrdenaLaHistoriaUI {...game} />;
};

export default OrdenaLaHistoriaEso2Tecnologia;
