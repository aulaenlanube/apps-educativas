import React from 'react';
import { useOrdenaLaFraseGame } from '../../hooks/useOrdenaLaFraseGame';
import OrdenaLaFraseUI from '../_shared/OrdenaLaFraseUI';
import OrdenaLaFraseTestScreen from '../_shared/OrdenaLaFraseTestScreen';

const frases = [
    "La novela fue escrita por un autor anónimo durante el siglo pasado.", "Si todos colaboramos, conseguiremos un planeta mucho más limpio y sostenible.",
    "El guía turístico explicó que la catedral fue construida hace más de quinientos años.", "A pesar de la intensa lluvia, el partido de fútbol no fue suspendido.",
    "Los científicos investigan cómo las células madre podrían curar enfermedades.", "La película, que está basada en una historia real, ha ganado varios premios.",
    "El juez dictaminó que el acusado era inocente de todos los cargos.", "Para que un ecosistema esté en equilibrio, todas sus partes deben funcionar correctamente.",
    "El Quijote, escrito por Miguel de Cervantes, es la obra más importante de la literatura española.", "La Declaración Universal de los Derechos Humanos fue proclamada en 1948.",
    "Los arqueólogos utilizan herramientas muy precisas para no dañar los restos encontrados.", "El efecto invernadero ha aumentado debido a la emisión de gases contaminantes.",
    "El oxígeno que respiramos es producido principalmente por las plantas y las algas.", "La partitura de la sinfonía fue interpretada magistralmente por la orquesta.",
    "El mensaje fue enviado a través del océano mediante un cable submarino.", "Aunque el viaje fue largo y agotador, la experiencia resultó inolvidable.",
    "El acusado fue declarado culpable después de un juicio que duró varias semanas.", "El Amazonas, que es el río más caudaloso del mundo, atraviesa varios países.",
    "La energía eólica se genera aprovechando la fuerza del viento con aerogeneradores.", "El telescopio espacial Hubble ha capturado imágenes impresionantes del universo.",
    "La democracia garantiza que los ciudadanos puedan elegir a sus gobernantes libremente.", "El famoso cuadro fue pintado por un artista que vivió en el Renacimiento.",
    "Si no protegemos a las especies en extinción, podrían desaparecer para siempre.", "La ciudad fue completamente reconstruida después del devastador terremoto.",
    "Los antibióticos son medicamentos que combaten las infecciones causadas por bacterias.", "El debate sobre el cambio climático involucra a científicos, políticos y ciudadanos.",
    "La libertad de expresión es un derecho fundamental en las sociedades democráticas.", "El motor de combustión interna revolucionó el transporte a principios del siglo XX.",
    "Las vacunas han salvado millones de vidas a lo largo de la historia.", "El misterio fue resuelto por el detective gracias a una pequeña pista.",
    "El pan es un alimento básico que ha sido elaborado durante miles de años.", "La brújula, que siempre apunta al norte, fue un invento crucial para la navegación.",
    "El sol proporciona la energía necesaria para que exista vida en la Tierra.", "Los derechos del niño deben ser protegidos en todas las naciones del mundo.",
    "La noticia fue difundida rápidamente por todos los medios de comunicación.", "El atleta batió el récord mundial después de un intenso entrenamiento.",
    "El puente fue diseñado por un ingeniero famoso para cruzar el ancho río.", "La erupción del volcán obligó a evacuar a miles de personas.",
    "El libro que me recomendaste me está gustando mucho más de lo que esperaba.", "Los ecosistemas acuáticos son muy sensibles a la contaminación del agua.",
    "La ley fue aprobada por el parlamento tras un largo debate.", "El descubrimiento de la penicilina por Fleming cambió la medicina para siempre.",
    "Si quieres aprender un nuevo idioma, debes practicarlo todos los días.", "El monumento fue visitado por miles de turistas durante el verano.",
    "La red de internet conecta a personas de casi todos los países del mundo.", "El poema fue recitado por el autor en un evento cultural.",
    "Aunque el problema era difícil, encontramos la solución trabajando en equipo.", "La selva amazónica es considerada el pulmón del planeta.",
    "La Constitución garantiza la igualdad de todos los ciudadanos ante la ley.", "El fósil del dinosaurio fue cuidadosamente extraído de la roca por los paleontólogos.",
    "La teoría de la relatividad fue desarrollada por el físico Albert Einstein.", "El agua es un recurso escaso que debemos utilizar de forma responsable.",
    "El partido se jugará mañana, a menos que las condiciones meteorológicas empeoren.", "La obra de teatro fue aplaudida por el público durante varios minutos.",
    "El reciclaje de plástico es fundamental para reducir la contaminación de los océanos.", "El telescopio James Webb nos permite observar las galaxias más lejanas.",
    "La canción fue compuesta por un músico que buscaba inspirar a la gente.", "Si la temperatura baja de cero grados, el agua se convierte en hielo.",
    "El tratado de paz fue firmado por los representantes de ambos países.", "Los arrecifes de coral están amenazados por el calentamiento global.",
    "El atleta, a pesar de su lesión, consiguió terminar la carrera.", "La agricultura sostenible busca producir alimentos respetando el medio ambiente.",
    "El primer viaje a la Luna fue un hito histórico para la humanidad.", "La novela narra las aventuras de un joven que viaja por todo el mundo.",
    "El premio fue otorgado al científico por sus importantes descubrimientos.", "Para resolver la ecuación, primero debes despejar la incógnita.",
    "El edificio fue diseñado por un arquitecto de renombre internacional.", "La biodiversidad de la selva tropical es asombrosa y muy variada.",
    "El voto es un derecho y una responsabilidad de todos los ciudadanos.", "El cuadro, que había estado perdido durante años, fue encontrado en un desván.",
    "La energía nuclear genera electricidad, pero también produce residuos peligrosos.", "El sistema solar está compuesto por ocho planetas que orbitan una estrella.",
    "La libertad de prensa es vital para que una sociedad esté bien informada.", "El Everest es la montaña más alta del mundo y está en el Himalaya.",
    "La Revolución Industrial transformó la sociedad con nuevas máquinas y fábricas.", "El agua potable es esencial para la salud y el bienestar de las personas.",
    "El Coliseo Romano era un anfiteatro donde luchaban los gladiadores.", "La capa de ozono nos protege de la radiación ultravioleta del sol.",
    "El ADN contiene las instrucciones genéticas para el desarrollo de los seres vivos.", "La deforestación contribuye al cambio climático y a la pérdida de hábitats.",
    "El sistema inmunológico nos defiende de los virus y las bacterias.", "La invención de la rueda fue un paso fundamental en la historia del transporte.",
    "Los derechos de los animales son un tema de debate en muchas sociedades.", "El Canal de Panamá conecta los océanos Atlántico y Pacífico.",
    "La tabla periódica organiza todos los elementos químicos conocidos.", "El lenguaje de signos es utilizado por muchas personas con discapacidad auditiva.",
    "La Vía Láctea es la galaxia en la que se encuentra nuestro sistema solar.", "El reciclaje de vidrio y metal ahorra una gran cantidad de energía.",
    "La Declaración de Independencia de los Estados Unidos se firmó en 1776.", "Los agujeros negros son regiones del espacio con una gravedad extremadamente fuerte.",
    "El respeto a la diversidad cultural enriquece a toda la sociedad.", "La energía geotérmica aprovecha el calor del interior de la Tierra.",
    "El cerebro humano es el órgano más complejo que se conoce.", "La extinción de los dinosaurios probablemente fue causada por un meteorito.",
    "El desarrollo sostenible busca satisfacer nuestras necesidades sin comprometer el futuro.", "La comunicación no verbal, como los gestos, también transmite mucha información.",
    "El conocimiento de la historia nos ayuda a comprender el presente.", "La empatía es la capacidad de ponerse en el lugar de otra persona.",
    "El pensamiento crítico nos permite analizar la información de forma objetiva."
];

const OrdenaLaFrase6 = () => {
    const game = useOrdenaLaFraseGame(frases, true); // true = con temporizador
    if (game.isTestMode) {
        return <OrdenaLaFraseTestScreen game={game} />;
    }
    return <OrdenaLaFraseUI {...game} />;
};

export default OrdenaLaFrase6;