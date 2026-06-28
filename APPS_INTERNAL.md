# APPS_INTERNAL.md — Ficha técnica y pedagógica de cada app de EduApps

> Documento de referencia AUTOGENERADO (tools/build-apps-catalog.mjs) a partir del
> análisis del código fuente de cada app. Sirve para entender el funcionamiento interno
> (software + jugabilidad + pedagogía) y planificar mejoras/ampliaciones. La versión
> "de usuario" de estas fichas se publica en la web en /catalogo.

Total de apps analizadas: **57** de 57 previstas.


# 📚 Juegos de palabras y repaso

## 🅿️ El Rosco del Saber `(rosco-del-saber)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego tipo Pasapalabra (rueda A-Z con pistas 'empieza por' / 'contiene la') construido en React con un hook de máquina de estados (useRoscoGame), una UI compartida (RoscoUI) y un contenedor (RoscoJuego) que carga y mezcla preguntas por dificultad. Soporta 1 jugador, 2 jugadores locales y duelo 1 vs 1 por turnos en tiempo real (RoscoDuel).

**Software.** Arquitectura en tres capas. (1) Contenedor src/apps/rosco/RoscoJuego.jsx: lee level/grade/subjectId con useParams, decide si mostrar selector de dificultad (solo para índice de progresión >=6, es decir 1º ESO en adelante; Primaria carga directo), y compone el pool de preguntas combinando varias llamadas a getRoscoData con maxDifficulty 1-3 mediante helpers locales pickOnePerLetter / mixQuestions (ponderación por copias en pool) / shuffle (Fisher-Yates). Genera 'Material de Estudio' deduplicando por solución y agrupando por letra. (2) Hook src/hooks/useRoscoGame.js: máquina de estados ('config'|'playing'|'finished') con players[], activePlayerIndex, feedback, animState, config y timer (setInterval por segundo). Semáforo isProcessing (useRef) para evitar dobles disparos; normalización de respuesta con NFD + strip de diacríticos (cleanText) para comparación tolerante a tildes/mayúsculas; rotación de turno (handleTurnChange/advancePlayerIndexInternal recorre letras 'pending' circularmente); importState para rehidratar en rejoin de duelo. score = nº de aciertos. (3) UI src/apps/_shared/RoscoUI.jsx: dibuja la rueda posicionando cada letra con trigonometría (cos/sin sobre radio 135), pantallas de config/finished/playing. Librerías: framer-motion (animaciones del selector de dificultad), react-icons/fa (iconos), avatares propios RoscoAvatars; NO usa three/@react-three/fiber ni canvas-confetti (el feedback es por overlays CSS). Integra Web Speech API (SpeechRecognition es-ES) para dictado de respuestas, comando de voz 'pasapalabra' y modo auto-grabación, además de webcam opcional (getUserMedia). Nota /10 en el summary calculada inline como (winner.score / config.questionCount) * 10 con un decimal. onGameComplete se dispara con mode:'test' protegido por trackedRef (useRef booleano) en un useEffect que vigila gameState==='finished'. NOTA: el TestScreen.jsx de _shared NO lo usa esta app (pertenece al supermercado); Rosco implementa su propio resumen y cálculo.

**Jugabilidad.** Bucle: pantalla de configuración (1 o 2 jugadores, nombre, avatar, nº de preguntas 5-26 con slider, temporizador opcional 30-300s) → partida → resumen. En la partida aparece una rueda de letras; en cada turno se muestra la letra activa, el tipo de pista ('Empieza por X' / 'Contiene la X') y la definición. El jugador escribe la respuesta (teclado/táctil), la dicta por voz o pulsa PASAPALABRA. Acierto: la letra se pone verde, +1 y avanza a la siguiente pendiente; fallo: letra roja y, en multijugador, cambia el turno (regla clásica de Pasapalabra). En 2 jugadores/duelo se alternan turnos y gana quien más aciertos sume (con empate gestionado). Condición de fin: todas las letras resueltas, sin pendientes, o se agota el tiempo del jugador. Dificultad (solo ESO/Bach): Principiante, Intermedio, Avanzado, Experto, que cambian la mezcla de cursos/asignaturas y el rango de dificultad de las preguntas. Feedback: overlays de '¡Correcto!', corrección ortográfica ('Se escribe...'), '¡Pasapalabra!' y revelado de la solución al fallar; animaciones de cambio de turno/pasapalabra; sin confeti ni sonidos integrados.

**Educativo.** Refuerza vocabulario, definiciones y terminología curricular a través del formato Pasapalabra: el alumno debe recuperar el término exacto a partir de su definición y de una pista posicional (inicial o que contenga una letra). Entrena recuperación léxica, precisión ortográfica (la comparación es tolerante a tildes pero el resumen muestra la grafía correcta), agilidad mental y atención. Encaje curricular amplio: registrada en Primaria (1º-6º, por defecto Lengua), ESO (1º-4º) y Bachillerato (1º-2º) en múltiples asignaturas; en Primaria carga directo el rosco del curso, y en ESO/Bach añade una capa de dificultad que recicla cursos anteriores y cultura general (Principiante) o se centra en el temario propio (Experto), favoreciendo el repaso espaciado.

**Datos.** El contenido proviene de getRoscoData(level, grade, subjectId, maxDifficulty) en src/services/gameDataService.js, que llama a la RPC get_rosco_data de Supabase y devuelve [{letra, tipo ('empieza'|'contiene'), definicion, solucion, difficulty}] (cacheado en cliente). RoscoJuego realiza varias llamadas con distintos maxDifficulty (1-3) y distintos cursos/asignaturas y las combina con mixQuestions/shuffle según la dificultad elegida; consulta public/data/materias.json para saber qué asignaturas existen en cada curso anterior. No usa getAppContent ni datos hardcodeados de preguntas (solo metadatos de dificultad y la lista de asignaturas).

**Integración.** Modos: a nivel de curso no usa el patrón easy/medium/exam clásico; el contenedor ofrece su propio selector de 4 dificultades (Principiante/Intermedio/Avanzado/Experto) SOLO en ESO/Bachillerato, y partida de 1 o 2 jugadores locales. Toda partida individual reporta onGameComplete con mode:'test' (cuenta como intento de examen/tarea): score = aciertos*100 + bonus de tiempo (hasta 300), maxScore = questionCount*100 + 300, correctAnswers/totalQuestions reales; el ranking lo aplica AppRunnerPage. El duelo 1 vs 1 está soportado (commonApps: duel { supported:true, bestOf:1, mode:'turn-based' }; duelComponents mapea 'rosco-del-saber' → RoscoDuel). RoscoDuel.jsx es host-authority: el host corre useRoscoGame real y difunde snapshots por el canal de Supabase Realtime (useDuel), el guest envía acciones answer/pass y renderiza el snapshot; incluye recuperación de estado en rejoin (importState), reporte de ganador (reportResult), forfeit por abandono y DuelChatBar para las frases. El tracking de sesión lo gestiona AppRunnerPage/useGameTracker al montar la app (no se ve useGameTracker dentro del componente; el componente solo emite onGameComplete). Particularidades a vigilar para mejoras: (a) onGameComplete usa best player (en 2 jugadores reporta SOLO al mejor, no por alumno); (b) en multijugador/duelo el modo enviado sigue siendo 'test' en RoscoUI, no 'duel' — el duelo evita doble conteo por la propia lógica del componente Duel, pero conviene revisarlo; (c) no hay durationSeconds en el onGameComplete; (d) la nota /10 se calcula inline (no con el helper estándar Math.round(correct/total*100)/10).

**Ideas de mejora.**
- Unificar el cálculo de la nota con el helper estándar (Math.round(correct/total*100)/10) y enviar durationSeconds en onGameComplete para alinearlo con el resto de apps y aprovechar mejor el tracking y el bonus por tiempo.
- Revisar el mode enviado en RoscoUI: en partidas que forman parte de un duelo debería ser mode:'duel' (no 'test') según la convención de CLAUDE.md, para garantizar que el duelo nunca cuente como intento de examen.
- Añadir feedback sensorial coherente con el resto de la plataforma (canvas-confetti al completar el rosco perfecto y sonidos de acierto/fallo/pasapalabra opcionales) para reforzar la motivación.
- Extender el selector de 4 dificultades también a Primaria (hoy carga directo) o, al menos, ofrecer un modo de repaso espaciado configurable, y añadir un botón de instrucciones con InstructionsModal del patrón compartido.

### Ficha de usuario

**¿Qué es?** El Rosco del Saber es un juego de preguntas con el formato del clásico Pasapalabra. Aparece una rueda con las letras del alfabeto y, en cada una, una definición acompañada de una pista: la respuesta empieza por esa letra o la contiene. El alumno tiene que adivinar la palabra escondida escribiéndola o diciéndola en voz alta. Se puede jugar solo, en parejas en el mismo dispositivo o en un duelo uno contra uno por turnos, repasando vocabulario y conceptos de su curso y asignatura.

**¿Por qué es relevante?** Es un recurso muy completo para consolidar vocabulario y terminología de cualquier materia. Al partir de la definición y una pista posicional, obliga a recuperar el término exacto de memoria (recuperación activa), una de las técnicas de estudio con más respaldo pedagógico, y a fijarse en la ortografía correcta. El formato de concurso aporta motivación, ritmo y un punto de reto sano, sobre todo en las partidas a dos o en los duelos. En ESO y Bachillerato, los niveles de dificultad combinan repaso de cursos anteriores con el temario actual, lo que favorece el repaso espaciado. Desarrolla competencia lingüística, agilidad mental, atención y autonomía, y el material de estudio integrado permite preparar la partida antes de jugar.

**¿Cómo funciona?** El juego presenta una rueda con las letras del abecedario. En cada turno muestra una letra, si la palabra empieza por ella o la contiene, y una definición. El jugador responde escribiendo o por voz: si acierta, la letra se pone verde y pasa a la siguiente; si falla, se pone roja (y en partidas a dos cambia el turno). También puede pulsar 'Pasapalabra' para dejarla para más tarde. La partida termina al resolver todas las letras o al agotarse el tiempo, y se muestra una nota sobre 10 y los aciertos.

**Cómo se juega.**
1. Elige el número de jugadores (1 o 2) y, si quieres, escribe tu nombre y selecciona un avatar.
2. En ESO y Bachillerato, elige antes el nivel de dificultad: Principiante, Intermedio, Avanzado o Experto.
3. Ajusta el número de preguntas y activa el temporizador si quieres jugar contrarreloj; puedes abrir 'Ver Material de Estudio' para repasar.
4. Pulsa '¡Empezar Partida!' para comenzar con la rueda de letras.
5. Lee la pista (empieza por / contiene) y la definición de la letra activa.
6. Escribe la respuesta y pulsa el botón de validar, o usa el micrófono para decirla en voz alta.
7. Si no la sabes, pulsa 'PASAPALABRA' para dejarla pendiente y volver a ella después.
8. Sigue hasta resolver todas las letras o agotar el tiempo; consulta tu nota sobre 10 y tus aciertos al terminar.

**Modos.**
- **Principiante**: Solo en ESO y Bachillerato. Conceptos básicos de cursos anteriores y cultura general, ideal para calentar.
- **Intermedio**: Solo en ESO y Bachillerato. Mezcla preguntas de tu asignatura actual con repasos de cursos anteriores.
- **Avanzado**: Solo en ESO y Bachillerato. Preguntas de tu asignatura y curso con dificultad media-alta.
- **Experto**: Solo en ESO y Bachillerato. Todo el temario de tu asignatura y nivel, el máximo reto.
- **1 Jugador**: Partida individual; cuenta para tu nota y tu progreso.
- **2 Jugadores**: Dos jugadores se turnan en el mismo dispositivo; gana quien sume más aciertos.
- **Duelo 1 vs 1**: Reto por turnos contra otro alumno en tiempo real, con chat de frases.

**Consejos.**
- Usa el 'Pasapalabra' sin miedo: deja las difíciles para el final y vuelve a ellas cuando hayas sumado las fáciles.
- Repasa el 'Material de Estudio' antes de empezar para familiarizarte con los términos que pueden salir.
- Si tu dispositivo lo permite, prueba el dictado por voz: responde más rápido y puedes decir 'pasapalabra' en voz alta.
- En ESO y Bachillerato, empieza por un nivel cómodo y sube a Experto a medida que ganes seguridad con el temario.

---

## 🎯 Ahorcado `(ahorcado)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego del Ahorcado clásico adaptado a contenido curricular: el alumno adivina una palabra o frase letra a letra antes de agotar las 6 vidas. Implementado como componente React funcional (Ahorcado.jsx) con un componente hermano AhorcadoDuel.jsx para el modo 1 vs 1 sobre Supabase Realtime.

**Software.** Arquitectura: src/apps/ahorcado/Ahorcado.jsx (un solo jugador, ~940 líneas) + Ahorcado.css + AhorcadoDuel.jsx (duelo). Librerías: framer-motion (motion/AnimatePresence para entradas de tarjeta, dibujo progresivo del muñeco y feedback), canvas-confetti (celebración al acertar y al sacar >=8 en examen), lucide-react (iconos Heart, Trophy, Skull, GraduationCap, etc.). No usa three/@react-three/fiber ni TTS. El muñeco es un SVG dibujado por partes (4 fijas del patíbulo + 6 partes del cuerpo reveladas según `fails`). Estado: hooks locales (useState/useMemo/useCallback) — sin store global. Constantes clave: MAX_FAILS=6, EXAM_QUESTIONS=5, ALPHABET incluye 'Ñ'. `normalize()` quita tildes (NFD + strip diacríticos) y pasa a mayúsculas, de modo que la comparación es sin acentos. `lettersNeeded` (useMemo) calcula el set de letras [A-ZÑ] requeridas; la victoria se detecta cuando todas están en `guessed`, la derrota cuando `fails >= 6`. Nota /10 en examen: `examScore = round(correct/5 · 10, 1 decimal)`, coloreada (>=8 excellent, >=5 good, <5 fail) con mensajes Excelente/Muy bien/Aprobado/Necesitas repasar. Puntos paralelos del examen (`examPoints`): base 100 por acierto + 30 por vida sobrante de cada pregunta ganada + bonus de tiempo `max(0, 300·(1−elapsed/(5·24)))`. Refs anti-doble-disparo: `trackedRef` (por ronda), `examTrackedRef` (por examen completo), más `examResultsRef`/`examModeRef`/`examStartRef` y `onGameCompleteRef` sincronizados para poder registrar el examen en el cleanup aunque el alumno abandone a mitad (cada pregunta no contestada cuenta como 0).

**Jugabilidad.** Bucle: se elige un ítem aleatorio del pool; el alumno pulsa letras (teclado en pantalla de 27 botones o teclado físico — listener keydown que acepta a-z/ñ y vocales acentuadas, y Enter/Espacio para continuar). Acierto: la letra se revela en todas sus posiciones; fallo: −1 vida y se añade una parte al muñeco. Modos: pestañas Práctica/Examen. En Práctica hay sub-selector Palabra/Frase, pista opcional (botón 'Ver pista' que muestra la definición), botón 'Saltar', contador de victorias/derrotas y rondas infinitas. En Examen: 5 preguntas mixtas palabra/frase, sin pistas ni saltos, barra de progreso con puntos OK/KO y pantalla-resumen con nota, puntos y retroalimentación por pregunta (solución + pista). Victoria: todas las letras adivinadas. Derrota: 6 fallos. Feedback: confeti (120 partículas práctica, 80 examen, 200 si nota >=8), animación del muñeco y del texto, corazones de vidas.

**Educativo.** Objetivo pedagógico: refuerzo de vocabulario y ortografía mediante recuperación activa de léxico curricular. Destrezas que entrena: reconocimiento ortográfico, conciencia fonológica y de patrones (vocales/consonantes frecuentes), ampliación de vocabulario por asignatura, deducción a partir de pista/definición y, en modo frase, comprensión sintáctica. Encaje curricular: contenido por nivel/curso/asignatura (`level`, `grade`, `subjectId` de la ruta). Aparece como app común en Primaria, ESO y Bachillerato (heredada en `appsBase`) y Atención a la Diversidad, con el contenido de cualquier asignatura que tenga datos de rosco o frases.

**Datos.** Dos fuentes vía src/services/gameDataService.js: `getRoscoData(level, grade, asignatura)` para las palabras (usa `solucion` como texto y `definicion` como pista; filtra soluciones de longitud >=2) y `getOrdenaFrasesData(level, grade, asignatura)` para las frases (sin pista). Ambas son RPC de Supabase (`get_rosco_data`, `get_ordena_frases_data`) cacheadas 5 min en memoria. El `tema` que se muestra sale de public/data/materias.json (nombre + icono de la asignatura). En Atención a la Diversidad, gameDataService remapea internamente a contenido de Primaria (AD_SUBJECT_MAP). El duelo solo usa `getRoscoData` (palabras, no frases).

**Integración.** Modos: en un solo jugador hay Práctica (palabra/frase, equivalente a easy/medium con ayudas) y Examen (mode:'test', genera nota a tarea). No usa el patrón estándar de pantalla previa de dificultad ni single_mode: el cambio Práctica/Examen es por pestañas en cabecera (excepción admitida tipo Sopa/Crucigrama: práctica + examen). Tracking: el componente NO importa useGameTracker directamente; recibe `onGameComplete` desde AppRunnerPage, que sí monta useGameTracker (una fila por partida; el session_id se consume tras el primer finish y las rondas siguientes caen al fallback INSERT). En práctica envía `onGameComplete({mode:'practice', score:0, maxScore:0, correctAnswers: aciertos, totalQuestions: letras})` — solo XP, no nota. En examen envía `mode:'test'` con score=examPoints, maxScore=5·100+5·6·30+300, y nota override = correct/5·10. Ranking: el examen manda score/maxScore, así que entra en high_scores/ranking; la práctica no (score 0). Duelo: AhorcadoDuel.jsx, palabra compartida, por turnos alternos, al mejor de 5 (TARGET_WINS=3, LIVES=6), host autoritativo sobre canal Supabase (broadcast de score/round/hints/action, recuperación de estado en rejoin); resolver la palabra entera se permite a cualquiera en cualquier momento y un fallo al resolver cuesta 2 vidas; comodín de 1 pista por jugador. Al terminar reporta con `reportResult(winnerId)` y `onGameComplete({mode:'duel', ...ceros})` para que no cuente como intento de examen. Particularidades a vigilar: el muñeco de 6 partes es fijo (no escala con dificultad); el examen no consume el `session_id` reutilizándolo, sino que cada partida genera su fila; el registro al abandonar el examen depende de refs en el cleanup — cuidado al refactorizar.

**Ideas de mejora.**
- Unificar la entrada al patrón estándar de pantalla previa de selección de modo (Fácil/Medio/Examen) en lugar de pestañas, o al menos ofrecer niveles de dificultad con vidas variables (p. ej. 6/5/4) y límite de tiempo, hoy MAX_FAILS es constante.
- Añadir lectura por voz (TTS de la pista o de la palabra resuelta) y refuerzo de accesibilidad, especialmente útil para Atención a la Diversidad y conciencia fonológica.
- Material de estudio: incorporar el botón 'Ver material de estudio' (modal con palabras/términos agrupados por letra inicial, patrón de Anagramas/RoscoUI), que el CLAUDE.md recomienda para apps de vocabulario y aquí no existe.
- En el duelo, permitir frases además de palabras (hoy AhorcadoDuel solo usa getRoscoData) y mostrar la categoría/tema durante el duelo para igualar la experiencia con el modo individual.

### Ficha de usuario

**¿Qué es?** El Ahorcado es la versión educativa del juego clásico de toda la vida: hay que adivinar una palabra o una frase oculta probando letras, una a una, antes de que se agoten las seis vidas y el muñeco quede dibujado por completo. Lo especial es que las palabras y frases no son al azar, sino vocabulario y contenidos de la asignatura, el curso y el nivel que esté trabajando el alumno. Se puede jugar en plan práctica, con rondas ilimitadas y pistas, o en modo examen, que pone nota.

**¿Por qué es relevante?** Es un recurso muy completo para trabajar vocabulario y ortografía sin que parezca un ejercicio. Al tener que pensar qué letras faltan, el alumnado practica la recuperación activa del léxico, refuerza la conciencia de cómo se escriben las palabras y aprende a deducir a partir de pistas y del contexto. En el modo frase, además, se trabaja la comprensión y la estructura de las oraciones. Al estar el contenido vinculado a cada asignatura y curso, lo que se repasa es justo lo que toca en clase, de forma significativa. El componente de juego (vidas, muñeco, confeti, retos) aumenta la motivación y la atención, y el modo examen permite al docente convertir la práctica en una nota objetiva sobre 10, mientras que la práctica libre invita a repetir sin miedo a equivocarse.

**¿Cómo funciona?** El alumno elige entre Práctica (palabras o frases, con pista y rondas infinitas) o Examen (5 preguntas mixtas sin ayudas). Pulsa letras en el teclado de la pantalla o escribe con su teclado físico. Cada acierto descubre la letra en su sitio; cada fallo resta una vida y dibuja una parte del muñeco. Si completa la palabra antes de los seis fallos, gana. En el modo examen, al terminar las cinco preguntas recibe una nota sobre 10, sus puntos y la corrección de cada pregunta.

**Cómo se juega.**
1. Elige el modo: Práctica para entrenar sin presión o Examen para que cuente como nota.
2. En Práctica, decide si quieres adivinar una Palabra o una Frase con los botones de arriba.
3. Fíjate en el tema (la asignatura) y en el número de huecos para hacerte una idea de la palabra.
4. Pulsa una letra en el teclado de la pantalla o escríbela directamente con tu teclado.
5. Si aciertas, la letra aparece en su lugar; si fallas, pierdes una vida y se dibuja una parte del muñeco.
6. En Práctica, usa el botón 'Ver pista' si te atascas, o 'Saltar' para cambiar de palabra.
7. Completa la palabra o frase antes de cometer seis fallos para ganar la ronda.
8. En el Examen, encadena las cinco preguntas; al final verás tu nota sobre 10 y la solución de cada una.

**Modos.**
_Sin modos diferenciados._

**Consejos.**
_—_

---

## 🧩 Crucigrama `(crucigrama)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de crucigrama autogenerado a partir del vocabulario de la asignatura. Componente React (Crucigrama.jsx) que consume getRoscoData y un generador greedy propio (crosswordGenerator.js); ofrece tres tamaños en modo práctica y un modo examen forzado a tamaño grande sin ayudas.

**Software.** Arquitectura en dos ficheros: src/apps/crucigrama/Crucigrama.jsx (UI + bucle de juego) y src/apps/crucigrama/crosswordGenerator.js (algoritmo de generación). Librerías: framer-motion (animaciones de tarjeta, pista actual y pantalla de completado con AnimatePresence), canvas-confetti (200 partículas al completar), lucide-react (iconos) e InstructionsModal/InstructionsButton de _shared. Estado por hooks de React (useState/useMemo/useCallback/useRef): allWords, crossword, userGrid (matriz de letras del usuario), selected {row,col}, direction 'h'|'v', wrongCells/revealedCells (Set de claves 'r,c'), hintsUsed, completed, timer. El generador es un greedy con intersecciones: coloca la primera palabra horizontal en el centro y cruza las demás buscando letras coincidentes (findPlacement con canPlace que valida bordes y vecinos perpendiculares), hace 8 intentos quedándose con el de más palabras, recorta el bounding box (trimGrid) y numera celdas de inicio en orden de lectura (assignNumbers); groupClues separa horizontales/verticales. La entrada se gestiona con un input oculto enfocado (HIDDEN_SENTINEL=' ' para que el Backspace del teclado virtual Android siempre dispare evento): onKeyDown para teclado físico (flechas, espacio para alternar dirección, Backspace, letras a-zA-Zñáéíóú) y onInput/inputType para teclado virtual. Puntuación compuesta en finalScore (useMemo): basePoints = nº palabras x 100, timeBonus = max(0, round(300·(1 - timer/300))), noHintsBonus = 100 si hintsUsed===0. La nota /10 en examen NO se calcula con la fórmula estándar correct/total·10: está HARDCODEADA a 10 (nota=10, color 'excellent', mensaje 'Excelente') porque sólo se llega a la pantalla de completado si el crucigrama está totalmente correcto; un comentario menciona penalización por tiempo pero no se aplica. Anti-doble-disparo: trackedRef (useRef) protege el efecto que llama a onGameComplete una sola vez por partida; se resetea a false en cada regenerate.

**Jugabilidad.** Bucle: el alumno selecciona pestaña Práctica/Examen, en práctica elige tamaño (Pequeño 6 / Mediano 10 / Grande 15 palabras), se genera el tablero y rellena las casillas blancas con las pistas horizontales y verticales que se cruzan. Controles: click en casilla para seleccionar (segundo click alterna dirección), teclado físico (letras autoavanzan, flechas para moverse, espacio alterna dirección, retroceso borra y retrocede) y teclado táctil vía input oculto; click en una pista del panel derecho salta a esa palabra. Un banner morado muestra siempre la pista activa con número y dirección, y se resaltan las celdas de la palabra actual (highlightedCells). Victoria: checkComplete compara cada casilla con la solución normalizada; al estar todo correcto se marca completed, salta confeti y aparece la pantalla de resumen (tiempo, nº palabras, ayudas/sin ayudas, puntos). No hay condición de derrota ni límite de tiempo (el timer sólo suma). Feedback en práctica: Revelar letra, Comprobar (marca en rojo las erróneas) y Solución (revela todo); cada uso incrementa hintsUsed.

**Educativo.** Objetivo pedagógico: afianzar vocabulario y ortografía de cada asignatura asociando definición/pista con la palabra exacta y deletreándola casilla a casilla. Destrezas: reconocimiento léxico, ortografía (la normalización ignora tildes pero exige la grafía correcta letra a letra), razonamiento deductivo por intersección de palabras, y comprensión de definiciones. Encaje curricular: transversal a cualquier asignatura con vocabulario (lengua, inglés, ciencias, etc.). Disponible en Primaria 1º-6º, ESO 1º-4º, Bachillerato 1º-2º (heredado a todas las asignaturas vía appsBase) y Atención a la Diversidad (varios bloques: articulación, vocabulario, conciencia fonológica, lectoescritura, memoria, etc.), donde los datos se redirigen a contenido de Primaria accesible mediante AD_SUBJECT_MAP.

**Datos.** Fuente: getRoscoData(level, grade, asignatura) de src/services/gameDataService.js (RPC get_rosco_data en Supabase, cacheada 5 min). Se filtran los pares {solucion, definicion} válidos mapeándolos a {word, clue}, descartando palabras con espacios o guiones y de menos de 3 letras. El generador vuelve a normalizar (quita caracteres no A-ZÑ), descarta duplicados y limita longitud a maxSize-2. Comparte el banco de datos del rosco con Ahorcado, Sopa, Millonario, Anagramas, etc. La asignatura por defecto es 'lengua' en primaria y 'general' en otros niveles; el nombre/icono de la materia sale de public/data/materias.json. No usa getAppContent ni datos propios embebidos.

**Integración.** Modos: práctica (tres tamaños small/medium/large) y examen (siempre tamaño grande, sin pistas; banner 'sin ayudas'). NO sigue el patrón estándar de pantalla previa de dificultad easy/medium/exam: usa pestañas práctica/examen (tabs) y un switch de tamaño que cambian el modo durante la sesión, lo que regenera el tablero (resetea timer y trackedRef en cada cambio). No es single_mode ni está registrada en duelableApps (sin duelo 1vs1, pese a que existe un objeto duel en commonApps con duel:{supported:true,bestOf:5,mode:'shared-word'} que NO se exporta en appCrucigrama). No importa useGameTracker directamente: el tracking/ranking lo gestiona AppRunnerPage a partir del onGameComplete que dispara al completar, enviando mode 'test' en examen (con score=finalScore y maxScore=palabras·100+400) o 'practice' (con score=0, maxScore=0). Particularidades a vigilar para mejoras: (1) la nota de examen está fijada a 10 y sólo se emite si se completa el 100%; si el alumno abandona a medias no hay onGameComplete ni nota parcial (a diferencia de Anagramas, que dispara en cleanup) — un examen incompleto no cuenta como intento y queda como 0 en la media de tareas; (2) el modo examen no tiene límite de tiempo ni de intentos; (3) cambiar de pestaña/tamaño a mitad regenera y pierde el progreso.

**Ideas de mejora.**
- Registrar nota parcial: disparar onGameComplete en el cleanup/al salir del examen con nota = palabras_correctas/total·10 (como Anagramas), para que un examen abandonado no quede como 0 y el alumno reciba crédito por lo resuelto.
- Alinear con el patrón estándar de la plataforma: pantalla previa de selección de dificultad en lugar de tabs vivos durante la partida (evita regeneraciones a mitad), o al menos un modal de confirmación antes de cambiar de modo si hay progreso.
- Activar el duelo 1vs1 ya esbozado (duel shared-word, bestOf 5): crear CrucigramaDuel.jsx con DuelChatBar y registrarlo en duelableApps para aprovechar la mecánica 1vs1 que el resto de apps de vocabulario ya tienen.
- Añadir feedback de progreso en examen (palabras completadas / total y opcional límite de tiempo con bonus), y un botón de pista limitada en examen que reste de la nota, para dar matices más allá del 10 fijo.

### Ficha de usuario

**¿Qué es?** El Crucigrama es un juego de palabras que se crea automáticamente con el vocabulario de la asignatura. El alumnado rellena las casillas blancas que se cruzan entre sí, usando pistas horizontales y verticales que describen cada palabra. Hay tres tamaños de tablero para practicar (pequeño, mediano y grande) y un modo examen con un crucigrama grande sin ayudas. Cada partida usa palabras y definiciones reales del curso y la materia, por lo que repasa contenidos concretos mientras se juega.

**¿Por qué es relevante?** El crucigrama es una herramienta clásica con un gran respaldo pedagógico para fijar vocabulario y ortografía. Al tener que escribir cada palabra letra a letra, el alumnado practica la grafía correcta y, al cruzarse las palabras, debe razonar de forma deductiva: una letra acertada ayuda a descubrir la palabra vecina. Esto entrena la comprensión de definiciones, el reconocimiento léxico, la atención y la memoria de trabajo. Como las pistas describen el significado, también refuerza la relación entre concepto y término, clave en cualquier asignatura. El formato de juego, con cronómetro, confeti y puntuación, aumenta la motivación y favorece la repetición espaciada del vocabulario, una de las estrategias más eficaces para consolidar lo aprendido a largo plazo.

**¿Cómo funciona?** Al entrar se elige entre Práctica (con tres tamaños) o Examen (crucigrama grande sin ayudas). El juego genera automáticamente un crucigrama con palabras del curso y la asignatura. Se selecciona una casilla, se lee la pista que aparece arriba y se escribe la palabra; las letras avanzan solas. Las palabras comparten letras donde se cruzan. En práctica hay botones para revelar una letra, comprobar errores o mostrar la solución. Cuando todas las casillas son correctas, salta el confeti y aparece el resumen con tiempo, palabras y puntos.

**Cómo se juega.**
1. Elige el modo en las pestañas de arriba: Práctica o Examen.
2. Si estás en Práctica, selecciona el tamaño del tablero: Pequeño, Mediano o Grande.
3. Haz clic en una casilla blanca para empezar; un segundo clic cambia entre horizontal y vertical.
4. Lee la pista que aparece en el banner morado y en el panel de la derecha.
5. Escribe la palabra con el teclado; las letras avanzan solas y puedes usar las flechas para moverte.
6. Aprovecha las casillas que se cruzan: una letra acertada te ayuda con la palabra vecina.
7. En Práctica, si te atascas, usa Revelar letra, Comprobar (marca errores en rojo) o Solución.
8. Completa todas las casillas correctamente para terminar y ver tu tiempo y tus puntos.
9. Pulsa Nuevo u Otro crucigrama para jugar otra partida distinta.

**Modos.**
- **Práctica · Pequeño**: Crucigrama de unas 6 palabras, ideal para empezar. Con ayudas (revelar letra, comprobar y solución).
- **Práctica · Mediano**: Unas 10 palabras, un reto equilibrado. Mantiene todas las ayudas disponibles.
- **Práctica · Grande**: Unas 15 palabras para un desafío mayor, también con ayudas.
- **Examen**: Crucigrama grande sin pistas ni ayudas. Sólo se supera completándolo entero y cuenta para la nota de la tarea.

**Consejos.**
- Empieza por las pistas que te resulten más fáciles: cada letra colocada te ayuda con las palabras que se cruzan.
- En Práctica, usa Comprobar antes de rendirte para ver sólo las letras que tienes mal y corregirlas.
- No te dejes guiar sólo por una dirección: combina pistas horizontales y verticales para confirmar las letras compartidas.
- Recuerda que en Examen no hay ayudas, así que practica antes con el tamaño grande para llegar preparado.

---

## 🔍 Sopa de Letras `(sopa-de-letras)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de sopa de letras en React que oculta el vocabulario de la asignatura en una rejilla y el alumno lo localiza arrastrando. Está construida sobre un generador propio (wordSearchGenerator.js) y consume el vocabulario del catálogo mediante getRoscoData.

**Software.** Componente único src/apps/sopa-de-letras/SopaDeLetras.jsx + hoja de estilos SopaDeLetras.css + generador propio src/apps/sopa-de-letras/wordSearchGenerator.js (sin three/r3f ni TTS). Librerías: framer-motion (montaje de tarjeta, pantalla de victoria y modal de entrega con AnimatePresence), canvas-confetti (celebración al completar), lucide-react (iconos Timer, Search, Lightbulb, GraduationCap, Trophy, Puzzle…). Estado con useState/useRef/useMemo/useCallback: allWords (vocabulario cargado), puzzle ({grid, size, placed}), foundMap (palabra→índice de color), foundCount, completed, timer (interval por useEffect), y estado de drag (isDragging, selectionStart, selectionCells, hintCells, wrongFlash). El generador coloca palabras en 8 direcciones (DIRECTIONS), normaliza con NFD quitando acentos y filtra a A-Z+Ñ, rellena huecos con letras aleatorias (ALPHABET incluye Ñ), ordena por longitud descendente y usa hasta 120 intentos por palabra. La selección se resuelve con snapSelection (ajuste a línea horizontal/vertical/diagonal 45°) y checkSelection (compara cadena y su inversa contra placed). Puntuación: finalScore = foundCount*POINTS_PER_WORD(100) + timeBonus, donde timeBonus = max(0, round(REF_TIME_SEC(300)*(1 - timer/300))). Nota /10 en examen: nota = round(foundCount/totalWords*100)/10 (Math.round a 1 decimal), con color verde≥8 / azul≥5 / rojo<5 y mensajes Excelente/Muy bien/Aprobado/Necesitas repasar. Anti-doble-disparo: trackedRef.current (useRef) protege el useEffect que llama onGameComplete; se resetea en regenerate(). El modal de entrega anticipada es propio (overlay motion.div, no window.confirm).

**Jugabilidad.** Bucle: se genera una rejilla con N palabras ocultas y el alumno las busca. Control por puntero unificado (onPointerDown inicia, onPointerEnter extiende, pointerup global en window cierra) — funciona con ratón, táctil y stylus; la selección se autoajusta a la línea recta más cercana. Acierto → la palabra queda fijada con un color propio de la paleta FOUND_COLORS y se tacha en el panel; fallo → flash rojo breve (350 ms) y se limpia la selección. Tres tamaños: Pequeño (10×10, 8 palabras, solo horizontal/vertical), Mediano (12×12, 10 palabras, añade diagonales), Grande (14×14, 12 palabras, las 8 direcciones incluido al revés). Victoria cuando foundCount≥placed.length → confeti + pantalla de resumen. En práctica hay botón Pista (ilumina 1,6 s la primera letra de una palabra pendiente al azar) y Nueva sopa; el panel muestra las palabras. En examen el panel muestra las definiciones (no las palabras): hay que adivinar el término y luego localizarlo; sin pistas, tamaño bloqueado una vez empezado, y botón Entregar examen (modal de confirmación que muestra found/total y nota previstas). No hay condición de derrota ni temporizador límite; el timer solo cuenta para el bonus.

**Educativo.** Refuerza el reconocimiento visual de léxico, la conciencia ortográfica y el barrido visual sistemático; en examen añade comprensión semántica al obligar a deducir la palabra desde su definición antes de buscarla. Trabaja vocabulario específico de la materia, atención sostenida y discriminación visoespacial (8 direcciones). Encaje curricular amplio: está dada de alta en Primaria (lengua, inglés, matemáticas, ciencias-naturales y más), ESO y Bachillerato (heredada a todas las asignaturas vía appsBase). Por el redireccionamiento de gameDataService, también es accesible desde Atención a la Diversidad mapeando a contenidos de Primaria.

**Datos.** El vocabulario procede de getRoscoData(level, grade, asignatura) de src/services/gameDataService.js (RPC get_rosco_data sobre Supabase, con caché en memoria de 5 min y soporte de mapeo AD→Primaria vía resolveADParams). El componente toma cada item con solucion, lo usa como palabra y definicion como pista, y filtra a palabras sin espacios ni guiones de 3 a 15 letras. Requiere al menos 3 palabras o muestra estado vacío. No usa getAppContent ni datos propios embebidos; la rejilla se sintetiza en cliente con wordSearchGenerator.js.

**Integración.** Modos reales: pestañas Práctica/Examen (NO el patrón estándar easy/medium/exam de pantalla previa) más un selector de tamaño small/medium/large que actúa como dificultad. No es single_mode ni está en duelableApps.js (sin duelo 1 vs 1). onGameComplete se dispara una sola vez al completar: en examen envía mode:'test', score=finalScore y maxScore=totalWords*100+300; en práctica envía mode:'practice' con score=0 y maxScore=0 (no puntúa para ranking ni cuenta como examen). El tracking real lo hace AppRunnerPage con useGameTracker (track_session_start al montar y track_session_finish/track_student_session por partida; el ranking lo gestionan upsert_high_score + get_app_ranking con el multiplicador de curso). Particularidades a vigilar: (1) cambiar de modo o de tamaño con tabs/botones durante el juego regenera el puzzle vía el useEffect [loading,size,gameMode,regenerate] — en examen el tamaño se bloquea una vez empezado (examInProgress), pero alternar la pestaña Práctica/Examen sí reinicia; (2) en práctica no se envía puntuación, así que esas partidas no alimentan ranking; (3) regenerate depende de gameMode pero no lo usa internamente (dependencia muerta); (4) la nota usa Math.round (no truncado), correcto para /10 pero conviene revisar coherencia con otras apps.

**Ideas de mejora.**
- Migrar el selector a la pantalla previa estándar (easy/medium/exam) o al menos impedir que alternar la pestaña Práctica/Examen reinicie una partida ya empezada, para no romper el tracking ni frustrar al alumno.
- Añadir un temporizador/objetivo opcional y registrar también partidas de práctica con un contador de rachas para dar feedback de progreso sin contar como examen.
- Incluir lectura por voz (TTS) de las definiciones en modo examen para mejorar accesibilidad y encaje en Atención a la Diversidad y primeros cursos de Primaria.
- Soportar duelo 1 vs 1 (SopaDeLetrasDuel + alta en duelableApps.js con DuelChatBar), generando la misma sopa para ambos rivales a partir del mismo pool/semilla.

### Ficha de usuario

**¿Qué es?** Sopa de Letras es un juego en el que el alumno busca palabras del vocabulario de su asignatura escondidas dentro de una cuadrícula de letras. Cada palabra puede aparecer en horizontal, vertical, diagonal e incluso al revés, según el tamaño elegido. Se encuentra arrastrando el dedo o el ratón desde la primera hasta la última letra. Hay un modo de práctica relajado, con la lista de palabras a la vista y pistas, y un modo examen en el que solo se ven las definiciones y se obtiene una nota del 0 al 10.

**¿Por qué es relevante?** Es una actividad con un valor pedagógico sólido y muy versátil. Al buscar las palabras, el alumnado consolida el vocabulario específico de la materia y refuerza la ortografía, ya que tiene que reconocer la grafía exacta de cada término. El rastreo de letras en ocho direcciones entrena la atención sostenida, la discriminación visual y la orientación espacial, destrezas básicas para la lectura. El modo examen eleva la exigencia cognitiva: al mostrar solo las definiciones, obliga a comprender el significado y a recuperar la palabra de memoria antes de localizarla, integrando comprensión y léxico. Por su sencillez se adapta a casi cualquier curso y asignatura, y la nota del 0 al 10 la hace útil como repaso evaluable.

**¿Cómo funciona?** La app toma el vocabulario de la asignatura y genera una cuadrícula nueva cada vez, ocultando varias palabras entre letras al azar. El alumno elige tamaño y modo, y va marcando las palabras que encuentra; cada acierto se resalta con un color y se tacha en el panel lateral. Al hallarlas todas aparece una celebración con confeti y un resumen con el tiempo y la puntuación. En modo examen, además, se calcula una nota del 0 al 10 según las palabras encontradas.

**Cómo se juega.**
1. Elige el modo: Práctica (con lista de palabras y pistas) o Examen (solo definiciones y con nota).
2. Selecciona el tamaño: Pequeño (10×10), Mediano (12×12) o Grande (14×14); a mayor tamaño, más palabras y más direcciones.
3. Observa el panel de la derecha: en práctica verás las palabras a buscar; en examen verás las definiciones del vocabulario.
4. Para marcar una palabra, haz clic (o toca) en su primera letra y arrastra hasta la última; la selección se ajusta sola a la línea recta.
5. Si aciertas, la palabra se queda marcada con su color y se tacha en el panel; si fallas, verás un breve destello rojo.
6. En práctica, pulsa Pista si te atascas: se ilumina un instante la primera letra de una palabra pendiente.
7. Continúa hasta encontrarlas todas y disfruta de la celebración con el resumen de tiempo y puntos.
8. En examen, puedes pulsar Entregar examen cuando quieras para terminar antes; se calculará la nota con las palabras que lleves.
9. Pulsa Nueva sopa u Otra sopa para generar un tablero distinto y volver a practicar.

**Modos.**
- **Práctica**: Modo de entrenamiento sin nota: ves la lista de palabras a buscar y puedes pedir pistas. Ideal para repasar sin presión.
- **Examen**: Solo se muestran las definiciones (no las palabras) y se calcula una nota del 0 al 10. Sin pistas y con el tamaño bloqueado una vez empezado.
- **Tamaño Pequeño**: Cuadrícula 10×10 con 8 palabras, solo en horizontal y vertical. El más sencillo.
- **Tamaño Mediano**: Cuadrícula 12×12 con 10 palabras; añade las diagonales.
- **Tamaño Grande**: Cuadrícula 14×14 con 12 palabras en las 8 direcciones, incluidas las palabras al revés. El mayor reto.

**Consejos.**
- En examen, lee primero la definición y trata de adivinar la palabra; te costará menos localizarla en la cuadrícula.
- Empieza por las palabras más largas: suelen verse antes y reducen las opciones para el resto.
- Recuerda que en los tamaños mediano y grande las palabras también van en diagonal y al revés: rastrea la rejilla en todas las direcciones.
- Si vas a por buena puntuación en el ranking, intenta resolver rápido: el tiempo otorga un bonus de velocidad.

---

## 💰 Millonario `(millonario)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de tipo test (4 opciones) inspirada en el concurso '¿Quién quiere ser millonario?', con escalera de premios, redes de seguridad y tres comodines. Un único componente React de cliente (Millonario.jsx) que genera las preguntas en el navegador a partir del vocabulario del Rosco de la asignatura.

**Software.** Componente único 'src/apps/millonario/Millonario.jsx' + 'Millonario.css'. Librerías: framer-motion (motion/AnimatePresence para transiciones de pregunta, tarjetas y feedback), canvas-confetti (explosión al ganar), lucide-react (iconos Trophy, Crown, Timer, Users, Shuffle, etc.). NO usa three/@react-three/fiber ni TTS. Estado con useState/useRef/useMemo/useCallback (sin store externo): allWords, questions, currentIndex, status ('playing'|'correct'|'wrong'|'won'|'lost'), lives, maxReached, flags de comodines (usedFifty/usedAudience/usedSwap), hiddenOptions (Set para 50:50), audiencePoll, timeLeft. Datos cargados en un useEffect con flag 'cancelled' anti-race. Generación de preguntas local (generateQuestions): filtra entradas con solucion+definicion, ordena por difficulty ascendente (pirámide fácil→difícil), toma N como correctas y por cada una baraja 3 distractores de otras respuestas; descarta si no hay 3 distractores. Puntuación: SOLO el modo examen envía score real. examScore = correct*100 + (perfecto ? 100 : 0) + timeBonus, donde timeBonus = max(0, round((total*15 - elapsedSec) * 5)) (presupuesto 15s/pregunta, coef. 5); maxScore = total*100 + 100 + total*15*5. Nota /10 = round((maxReached/questions.length)*100)/10 con color (>=8 excellent, >=5 good, <5 fail) y mensajes por umbral, siguiendo el contrato de CLAUDE.md. 'correctAnswers' = maxReached (mayor nivel alcanzado, no aciertos sueltos). Refs anti-doble-disparo: trackedRef.current evita reentrada del efecto que lanza confetti + onGameComplete; gameStartRef marca el inicio para medir duración; timerRef gestiona el setInterval del cronómetro.

**Jugabilidad.** Bucle: leer la definición → elegir una de 4 opciones (A/B/C/D) con clic/tap. Acierto → status 'correct', sube maxReached, feedback verde con premio y auto-avance a los 1400 ms. Fallo (o tiempo agotado en examen) → status 'wrong', resta una vida; si quedan vidas en modos con ayudas se reintenta la MISMA pregunta, si no se acaba la partida ('lost'). Completar todas → 'won' con confetti. Controles solo ratón/táctil (no hay atajos de teclado). Tres comodines (50:50 deja la correcta y un distractor; Público muestra una encuesta sesgada a la correcta ~40-70%; Cambio sustituye la pregunta por otra del pool no usada y reinicia el cronómetro), uno por partida, disponibles en TODOS los modos incluido examen. Escalera de premios clásica (100€→1M€) recortada a 5/10/15 niveles según modo, con redes de seguridad en niveles 5 y 10 (solo medio/examen) que aseguran el último premio. Feedback: confetti al ganar, colores verde/rojo, barras de encuesta del público, corazones de vidas y cronómetro en rojo bajo 10s. No hay sonido.

**Educativo.** Refuerzo y evaluación de vocabulario/terminología por asignatura: dado un significado (definición) hay que reconocer el término correcto entre cuatro candidatos. Entrena reconocimiento léxico, discriminación entre términos próximos (los distractores son respuestas reales del mismo banco), comprensión de definiciones y, en examen, gestión del tiempo y toma de decisiones bajo presión. La progresión por dificultad (pirámide) escala de lo simple a lo complejo. Aparece en Primaria (1º-6º), ESO (1º-4º) y Bachillerato (heredada en appsBase, todas las asignaturas), y en Atención a la Diversidad mapeada a contenidos de Primaria (vocabulario, morfosintaxis, pragmática, comprensión oral, habilidades sociales, razonamiento, autonomía).

**Datos.** getRoscoData(level, grade, asignatura) de 'src/services/gameDataService.js' → RPC Supabase 'get_rosco_data' (cache en memoria 5 min). Reutiliza el mismo banco que Rosco/Ahorcado/Crucigrama, etc.: array de {letra, tipo, definicion, solucion, difficulty}. El componente usa 'definicion' como enunciado de la pregunta y 'solucion' como respuesta correcta; los distractores son otras 'solucion' del mismo conjunto. Requiere >=4 entradas válidas (con solucion y definicion) o muestra estado vacío. La asignatura por defecto es 'lengua' en primaria y 'general' en otros niveles. En nivel 'ad' los parámetros se traducen a fuentes de Primaria vía resolveADParams.

**Integración.** Modos easy (5 preguntas, 3 vidas, sin tiempo), medium (10 preguntas, 2 vidas, red en nivel 5) y exam (15 preguntas, 1 vida, 30s/pregunta, redes 5 y 10) seleccionables por TABS visibles durante el juego: cambiar de tab dispara startGame y reinicia la partida (no es la pantalla previa que recomienda CLAUDE.md; cambiar a media partida la reinicia). Tracking vía onGameComplete: práctica (easy/medium) envía mode:'practice' con score=0/maxScore=0 (cuenta como sesión pero no puntúa ranking); examen envía mode:'test' con score/maxScore reales para nota y ranking. Lo monta AppRunnerPage, que aplica el multiplicador de curso y persiste vía track_student_session/useGameTracker. NO es single_mode ni está en duelableApps (sin duelo 1vs1). Particularidades a vigilar: 'correctAnswers'=maxReached (no aciertos totales), por lo que un fallo intermedio frena la cuenta aunque hubiera más aciertos posteriores; el timer del examen se reinicia al usar el comodín Cambio; los comodines siguen disponibles en examen pese a cfg.helps=false (helps solo gobierna vidas/reintento).

**Ideas de mejora.**
- Mover la selección de modo a una pantalla previa (patrón estándar de la plataforma) para evitar que cambiar de tab reinicie la partida a mitad y rompa el tracking.
- Añadir navegación y selección por teclado (teclas A/B/C/D y Enter) y retroalimentación sonora opcional para reforzar accesibilidad y feedback multicanal.
- Integrar 'Ver material de estudio' (glosario término→definición agrupado por letra, como en Anagramas/RoscoUI) para que el alumno pueda repasar el vocabulario antes de jugar.
- Implementar modo duelo 1vs1 (registrarla en duelableApps con MillonarioDuel.jsx + DuelChatBar) aprovechando que ya es un test por turnos, idóneo para enfrentamientos.

### Ficha de usuario

**¿Qué es?** Millonario es un juego de preguntas tipo test inspirado en el famoso concurso de televisión. En cada pregunta aparece la definición de una palabra del vocabulario de la asignatura y el alumno debe elegir el término correcto entre cuatro opciones (A, B, C y D). Acertando se sube por una escalera de premios que va de 100€ hasta el millón. Cuenta con tres comodines clásicos para ayudar en los momentos difíciles: 50:50, el público y cambiar de pregunta.

**¿Por qué es relevante?** Es una forma motivadora de consolidar vocabulario y terminología de cualquier materia. El formato concurso, con su escalera de premios, redes de seguridad y comodines, convierte el repaso en un reto con tensión positiva que engancha. Pedagógicamente trabaja el reconocimiento léxico y la comprensión de definiciones: al partir del significado y tener que identificar el término, el alumno ejercita una recuperación más profunda que el simple reconocimiento. Como los distractores son otras palabras reales del mismo tema, se entrena la discriminación fina entre conceptos parecidos. El modo examen, con tiempo limitado y una sola vida, añade autorregulación y gestión de la presión, y aporta una nota sobre 10 que sirve para evaluar el dominio del vocabulario de la unidad.

**¿Cómo funciona?** La app toma el vocabulario de la asignatura (el mismo banco del Rosco) y genera preguntas: muestra la definición y ofrece cuatro respuestas, una correcta y tres distractores reales. Cada acierto hace avanzar un peldaño en la escalera de premios; un fallo resta una vida. En los modos con ayudas se puede reintentar mientras queden vidas; en examen solo hay una vida y cuenta el tiempo. Las preguntas se ordenan de más fáciles a más difíciles y se dispone de tres comodines de un solo uso por partida.

**Cómo se juega.**
1. Elige el nivel de dificultad en las pestañas superiores: Fácil, Medio o Examen.
2. Lee con atención la pregunta, que es la definición de una palabra.
3. Pulsa una de las cuatro opciones (A, B, C o D) para responder.
4. Si aciertas, avanzas un peldaño en la escalera de premios; si fallas, pierdes una vida.
5. Usa los comodines si lo necesitas: 50:50 elimina dos opciones incorrectas, Público muestra una encuesta orientativa y Cambio sustituye la pregunta.
6. Recuerda que cada comodín solo puede usarse una vez por partida.
7. En modo Examen responde antes de que se agote el cronómetro de 30 segundos por pregunta.
8. Completa todas las preguntas para convertirte en millonario; en examen recibirás además tu nota sobre 10.

**Modos.**
- **Fácil**: 5 preguntas, 3 vidas y sin límite de tiempo. Ideal para empezar y practicar sin presión.
- **Medio**: 10 preguntas, 2 vidas y una red de seguridad en el nivel 5 que asegura ese premio.
- **Examen**: 15 preguntas, 1 vida y 30 segundos por pregunta, con redes en los niveles 5 y 10. Da una nota sobre 10 que cuenta para las tareas.

**Consejos.**
- Reserva los comodines para las preguntas más difíciles del final; gastarlos pronto te deja sin ayuda cuando más la necesitas.
- Antes de responder en examen, descarta primero las opciones que sabes que son falsas: te quedará una elección más clara.
- Apunta a llegar a las redes de seguridad (niveles 5 y 10): aunque falles después, te aseguras ese premio.
- Practica antes en modo Fácil o Medio para familiarizarte con el vocabulario y llegar al examen con más soltura.

---

## 🔀 Anagramas `(anagramas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Anagramas es una app de un solo fichero (src/apps/anagramas/Anagramas.jsx, sin Duel) en la que el alumno reordena fichas de letras de colores para reconstruir palabras del vocabulario de la asignatura. Construida en React con framer-motion (LayoutGroup para que las fichas vuelen entre banco y huecos), canvas-confetti y lucide-react.

**Software.** Componente funcional unico Anagramas.jsx + Anagramas.css; sin three.js/r3f ni TTS. Librerias: framer-motion (motion, AnimatePresence, LayoutGroup; las fichas comparten layoutId para animar el vuelo banco<->slot, animaciones idle de flotacion, onda al acertar y shake al fallar), canvas-confetti (confeti pequeno de 80 particulas por acierto con los colores de las fichas + estallido de 240 al terminar), lucide-react (iconos). Importa InstructionsModal/InstructionsButton de _shared y lee materias.json para el nombre/icono de la asignatura. Estado todo con useState/useMemo/useCallback local (no Redux/Context propio): allWords, gameMode, phase ('select'|'playing'), questions, currentIndex, status ('idle|playing|correct|wrong|won'), tiles [{id,letter,color,placedAt}], y gamificacion (score, streak, maxStreak, correctCount, lastGain, helpsRemaining, hintVisible, revealedFirst, timeLeft). Los slots y el banco se derivan de tiles via useMemo segun placedAt; formedWord se recalcula y un useEffect con setTimeout de 350ms autocomprueba. Puntuacion por palabra: basePoints 100 * streakMultiplier (1+streak*0.15) + timeBonus (hasta 200 segun timeLeft/timer). Nota /10 = Math.round((correctCount/totalQuestions)*100)/10 con color (>=8 excellent, >=5 good, <5 fail) y mensaje. maxScore que se envia al ranking = questions.length*450 (referencia teorica ~435/palabra). Refs anti-doble-disparo: trackedRef (onGameComplete una sola vez al pasar a 'won'), timerRef (intervalo del timer) y autoCheckRef (timeout de autocomprobacion). normalize() pasa a mayusculas, preserva la N protegiendola de la descomposicion NFD/quita tildes y descarta no-letras.

**Jugabilidad.** Bucle: pantalla previa de seleccion de dificultad -> partida de 10 palabras. Por palabra se barajan las letras (scrambleDistinct evita dejarlas en orden) y se reparten colores aleatorios. El alumno hace click en una ficha del banco (vuela al primer hueco libre) o en una colocada (vuelve al banco); cuando todos los huecos estan llenos se autocomprueba a los 350ms. Controles: solo raton/tap (no hay drag&drop ni teclado). Sin vidas y sin saltos: un acierto suma puntos+racha+confeti y avanza a los 1200ms; un fallo o agotar los 30s rompe la racha, muestra la solucion y avanza a los 1800ms. La partida solo termina (status 'won') al completar las 10 palabras. Comodines: Pista (muestra la definicion), 1a letra (coloca automaticamente la primera letra liberando el hueco 0) y Mezclar (rebaraja el banco, ilimitado). Feedback: confeti, animacion de onda en las fichas al acertar, shake rojo al fallar, contador de puntos flotante (+N), racha con icono de llama y multiplicador visible desde racha>=2.

**Educativo.** Objetivo pedagogico: consolidar ortografia y vocabulario de la asignatura reconstruyendo la grafia exacta de cada termino a partir de sus letras desordenadas. Entrena conciencia ortografica y de la estructura de la palabra, memoria de trabajo visual, reconocimiento de patrones letra-a-letra y, con las definiciones como pista, asociacion significado-significante. Es transversal: como se alimenta de getRoscoData funciona en cualquier asignatura con vocabulario (Lengua, Inglés, Ciencias, etc.). Cubre Primaria 1-6, ESO 1-4, Bachillerato 1-2 y Atencion a la Diversidad (esta ultima remapeada a datos de Primaria via resolveADParams). La dificultad se ajusta por longitud de palabra (facil 3-8, medio 4-10, examen 4-12 letras) y por numero de ayudas. Incluye boton de material de estudio con el vocabulario agrupado por letra inicial para repaso previo.

**Datos.** El contenido procede de getRoscoData(level, grade, asignatura) en src/services/gameDataService.js, que llama a la RPC get_rosco_data de Supabase (con cache en memoria de 5 min y soporte de Atencion a la Diversidad via resolveADParams). De cada item se usa solucion (palabra a formar), definicion (clue/pista) y letra. El componente normaliza, filtra palabras de 3-14 letras y descarta las que tienen espacios o guiones, luego por modo filtra por minLen/maxLen y escoge 10 al azar. No usa getAppContent ni datos propios embebidos; la paleta de 16 colores de las fichas si es del componente.

**Integración.** Registrada en commonApps.js como appAnagramas (id 'anagramas', component Anagramas, lazy). Tres modos en pantalla previa de seleccion (no tabs durante la partida): easy y medium -> onGameComplete con mode:'practice'; exam -> mode:'test' (cuenta para tarea). NO es single_mode ni duelable (no aparece en duelableApps.js ni existe AnagramasDuel; no monta DuelChatBar). Tracking via onGameComplete (no usa useGameTracker directamente; lo orquesta AppRunnerPage), disparado una sola vez al llegar a 'won' protegido por trackedRef, enviando mode, score, maxScore=questions.length*450, correctAnswers, totalQuestions y durationSeconds. El ranking es automatico (AppRunnerPage aplica multiplicador de curso y guarda en game_sessions/high_scores). Particularidades para mejoras: (1) el timer de 30s esta activo en los TRES modos pese a que CLAUDE.md sugiere que solo examen lleva timer, y el comentario 'solo examen' del codigo no coincide con MODE_CONFIG; (2) NO existe disparo de onGameComplete en cleanup si el alumno abandona a media partida (a diferencia de lo descrito en el brief y en CLAUDE.md): el useEffect de tracking solo corre con status==='won', asi que abandonar deja la partida sin registrar; (3) no se pasa 'nota' explicita, se infiere de correct/total; (4) no hay drag&drop ni control por teclado; (5) la nota /10 se muestra siempre, no solo en examen.

**Ideas de mejora.**
- Anadir disparo de onGameComplete en el cleanup/unmount cuando la partida esta en curso (como en el brief y en CLAUDE.md), para registrar la nota parcial si el alumno abandona el examen a medias; hoy solo se trackea al completar las 10 palabras.
- Soportar arrastrar y soltar (drag&drop) y control por teclado (escribir/borrar letras, Enter para comprobar) ademas del click, mejorando accesibilidad y velocidad en pantallas tactiles y de escritorio.
- Revisar la coherencia del timer: el comentario dice 'solo examen' pero MODE_CONFIG activa 30s en easy/medium/exam; decidir si facil/medio deben ir sin reloj (mas amable para Primaria/AD) y alinear codigo, comentarios e instrucciones.
- Permitir insertar una ficha en un hueco concreto (no solo en el primer libre) y reordenar letras ya colocadas intercambiandolas, para reducir la friccion de tener que vaciar todo el slot cuando el alumno se equivoca de posicion.

### Ficha de usuario

**¿Qué es?** Anagramas es un juego de vocabulario en el que aparece una palabra de la asignatura con sus letras desordenadas, convertidas en fichas de colores. La tarea consiste en colocar esas fichas en el orden correcto para reconstruir la palabra. Cada partida son 10 palabras y hay un cronometro de 30 segundos por palabra. Si las definiciones estan disponibles, sirven de pista. Es un reto rapido, visual y divertido que mezcla ortografia, atencion y un punto de competicion con puntos y rachas.

**¿Por qué es relevante?** Reconstruir una palabra letra a letra obliga a fijarse en su grafia exacta, por lo que refuerza la ortografia y la imagen mental de cada termino, una de las claves para escribir bien. Ademas entrena el vocabulario de la asignatura, la memoria de trabajo, la atencion sostenida y el reconocimiento de patrones, competencias utiles en cualquier materia. Al apoyarse en el vocabulario de la plataforma, funciona en Lengua, Inglés, Ciencias y muchas mas, y se adapta de Primaria a Bachillerato y a Atencion a la Diversidad. La dificultad crece con la longitud de las palabras y se reduce el numero de ayudas, lo que permite progresar de forma natural. El cronometro, las rachas y los puntos aportan una motivacion sana sin penalizar el error: un fallo no quita vidas, solo corta la racha y muestra la solucion, de modo que el alumno siempre aprende la palabra correcta.

**¿Cómo funciona?** Eliges una dificultad y empieza la partida de 10 palabras. Para cada una ves las letras desordenadas como fichas de colores: haces clic en una ficha del banco y vuela al siguiente hueco libre, o en una ya colocada para devolverla al banco. Cuando completas todos los huecos se comprueba sola: si aciertas, confeti, puntos y suma de racha; si fallas o se acaba el tiempo, ves la solucion y pasas a la siguiente. Cuentas con tres comodines: pista (definicion), colocar la primera letra y mezclar el banco.

**Cómo se juega.**
1. Pulsa Ver material de estudio si quieres repasar antes el vocabulario por letras (opcional).
2. Elige la dificultad: Facil, Medio o Examen, y pulsa Empezar partida.
3. Observa las fichas de colores desordenadas y el numero de letras de la palabra.
4. Haz clic en una ficha del banco para enviarla al siguiente hueco libre.
5. Si te equivocas de letra, haz clic en una ficha ya colocada para devolverla al banco.
6. Usa los comodines si lo necesitas: Pista (definicion), 1a letra (la coloca por ti) o Mezclar (rebaraja el banco, ilimitado).
7. Completa todos los huecos: la palabra se comprueba automaticamente.
8. Resuelve antes de que acaben los 30 segundos y encadena aciertos para subir tu racha y multiplicador.
9. Termina las 10 palabras para ver tu nota sobre 10, los puntos y la racha maxima; pulsa Jugar otra vez o Cambiar dificultad para repetir.

**Modos.**
- **Facil**: Palabras de 3 a 8 letras, con la pista visible y muchas ayudas (10 pistas de definicion y 5 de primera letra). 10 palabras, 30 s por palabra.
- **Medio**: Palabras de 4 a 10 letras y ayudas moderadas (5 pistas de definicion y 5 de primera letra). 10 palabras, 30 s por palabra.
- **Examen**: Palabras de 4 a 12 letras y pocas ayudas (2 pistas y 2 de primera letra). Cuenta como intento de examen para la tarea. 10 palabras, 30 s por palabra.

**Consejos.**
- Si te bloqueas con una palabra, pulsa Mezclar: ver el banco barajado de otra forma ayuda a descubrir la solucion.
- Reserva los comodines de pista y primera letra para las palabras mas largas o dificiles, que son las que mas puntos dan.
- Resuelve rapido: cuanto mas tiempo te sobre en cada palabra, mas puntos de bonus consigues.
- Encadena aciertos sin fallar para mantener la racha y disparar el multiplicador de puntuacion.

---

## 🔐 Criptograma `(criptograma)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Criptograma es un juego de cifrado por sustitución monoalfabética (cada letra del alfabeto se reemplaza por un número único 1-27) en el que el alumno descifra una palabra o frase secreta. Es un componente React funcional autónomo (Criptograma.jsx + cipherGenerator.js + Criptograma.css) que se nutre de getRoscoData y getOrdenaFrasesData.

**Software.** Arquitectura: componente único Criptograma.jsx (~600 líneas) apoyado en el módulo puro cipherGenerator.js (generación del mapa de cifrado, encriptado de texto, getUniqueLetters y la tabla SPANISH_FREQ). Estilos en Criptograma.css. Librerías: framer-motion (animaciones del card, teclas con whileTap, AnimatePresence para frecuencias y resultado), canvas-confetti (celebración al completar), lucide-react (iconos Lock/Unlock/Eye/Timer/BarChart3/etc.). Sin three/r3f ni TTS. Reutiliza InstructionsModal + InstructionsButton de _shared. Gestión de estado: useState local abundante (cipherMap, encrypted, guesses code→letra, selectedCode, lockedCodes y wrongCodes como Set, completed, hintsUsed, revealsUsed, timer, timeLeft). cipherGenerator.generateCipherMap baraja con Fisher-Yates intentando un derangement parcial (hasta 50 intentos para que ninguna letra caiga en su número natural). El cifrado normaliza con NFD (quita tildes), pasa a mayúsculas y respeta Ñ. uniqueCodes (memo) deduplica los códigos del texto; isAllCorrect (memo) comprueba que cada código adivinado coincide con cipherMap.codeToLetter. Puntuación: en examen finalScore = correctCount·100 (EXAM_POINTS_PER_LETTER) + bonus de velocidad max(0, round(300·(1−timer/300))); maxScore = totalLetras·100 + 300. En práctica el score informativo (base 100/letra + bonus de 180s + 100 por sin ayudas) NO se manda al ranking (se envía score:0, maxScore:0). Nota /10 = round((correctCount/totalLetters)·100)/10 con colores excellent/good/fail y mensajes Excelente/Muy bien/Aprobado/Necesitas repasar, conforme a la guía. Anti-doble-disparo: trackedRef (useRef) guarda el onGameComplete a UNA llamada por partida y se resetea en generatePuzzle; timerRef gestiona el setInterval.

**Jugabilidad.** Bucle: se genera un puzzle (palabra o frase según modo), se muestra el texto cifrado como números con un hueco '_' debajo; el jugador hace click en un número (selectedCode) y escribe/pulsa una letra que se propaga a todas las apariciones de ese código (todas las apariciones del mismo número se actualizan a la vez). Auto-avance al siguiente código sin resolver. Una letra solo puede asignarse a un código (no impide colisiones visuales pero resalta same-guess). Controles: teclado físico (A-Z y Ñ asignan, Backspace/Delete borra, Escape deselecciona), teclado on-screen con tecla de borrador, y click/táctil sobre los números. Dificultad en TABS (no pantalla previa): Fácil (palabra suelta, vocales reveladas y bloqueadas, 3 reveals + frecuencias + comprobar), Medio (frase corta ≤60 chars, sin vocales, 2 reveals + ayudas), Examen (frase larga >30 chars, timer de 300s, SIN ayudas). Victoria: todos los códigos correctos → completed + confeti multicolor. Derrota: en examen, si se agota el timeLeft se marca completed con 'Tiempo agotado' y nota parcial. Feedback: confeti al ganar, animaciones, marca de letras incorrectas (wrongCodes) al usar Comprobar, tabla de frecuencias del español como ayuda visual. Sin sonidos/TTS.

**Educativo.** Objetivo pedagógico: razonamiento lógico-deductivo y alfabetización aplicada mediante criptoanálisis básico por frecuencias. Entrena: reconocimiento de patrones (palabras de 1-2 letras, dobles LL/RR/CC), conocimiento de la frecuencia de letras del español (E,A,O,S,R,N), vocabulario y ortografía del área, atención sostenida y memoria de trabajo. El contenido es curricular porque las palabras llevan su definición como pista y las frases provienen del banco del curso/asignatura. Aparece en Primaria, ESO, Bachillerato (heredado en appsBase) y, de forma destacada, en Atención a la Diversidad: morfosintaxis, lectoescritura, atención, memoria, funciones ejecutivas y razonamiento.

**Datos.** Doble fuente vía gameDataService: getRoscoData(level, grade, asignatura) aporta las PALABRAS (filtra items con solucion+definicion → {text: solucion, hint: definicion}; la definición se usa como pista en Fácil/Medio) y getOrdenaFrasesData(level, grade, asignatura) aporta las FRASES (strings >10 chars → {text, hint:''}). Ambas se cargan en paralelo con Promise.all y .catch(()=>[]). No usa getAppContent ni datos hardcodeados de contenido; solo cipherGenerator.SPANISH_FREQ (tabla de frecuencias) y materias.json para el nombre/icono de la asignatura. La selección de pool por modo tiene fallbacks: si no hay frases largas/cortas suficientes (≥3) cae a todas las frases o a palabras.

**Integración.** Modos: easy/medium/exam mapeados internamente a onGameComplete con mode 'practice' (easy/medium) o 'test' (exam). NO es single_mode (solo el examen cuenta para tareas/ranking) y NO está en duelableApps (sin duelo 1vs1, sin DuelChatBar). Tracking: recibe onGameComplete por props desde AppRunnerPage (que monta useGameTracker); envía mode, score/maxScore (0 en práctica, puntos reales en examen), correctAnswers, totalQuestions, durationSeconds. Ranking: solo en examen, AppRunnerPage aplica el multiplicador de curso y guarda en game_sessions/high_scores. Particularidades a vigilar: (1) usa TABS de modo durante la partida, lo que contradice la recomendación del CLAUDE.md de selector en pantalla previa (cambiar de tab regenera el puzzle vía useEffect→generatePuzzle); (2) no pasa la prop 'nota' a onGameComplete, deja que AppRunner la calcule como correct/total·10 (coincide con su cálculo interno); (3) no monta material de estudio aunque maneja vocabulario; (4) el confeti dispara en isAllCorrect pero el examen por tiempo agotado también marca completed sin victoria.

**Ideas de mejora.**
- Migrar el selector de dificultad a una pantalla previa (como recomienda el CLAUDE.md) para evitar que cambiar de tab durante la partida regenere el puzzle y pueda confundir el tracking; alternativamente, bloquear el cambio de modo mientras hay una partida en curso.
- Añadir el botón 'Ver material de estudio' (patrón Anagramas/RoscoUI) con el vocabulario/definiciones del área agrupado, dado que la app ya maneja palabras con pista.
- Mostrar in-game un contador de frecuencia de cada código DENTRO del propio criptograma (cuántas veces aparece cada número) para reforzar el criptoanálisis y conectar mejor con la tabla de frecuencias del español.
- Evaluar registrar la app en duelableApps con un CriptogramaDuel (descifrado por velocidad cabeza a cabeza) montando DuelChatBar, ya que el bonus de velocidad del examen encaja de forma natural con un formato 1vs1.

### Ficha de usuario

**¿Qué es?** Criptograma es un juego de descifrado en el que cada letra de una palabra o frase secreta se ha sustituido por un número. La misión del alumnado es averiguar qué letra se esconde detrás de cada número hasta revelar el mensaje completo. Funciona como los pasatiempos clásicos de cifrado, pero con vocabulario y frases del curso y la asignatura: así, mientras se resuelve el reto, se repasan contenidos. Incluye pistas, una tabla con las letras más frecuentes del español y tres niveles de dificultad para adaptarse a cada alumno.

**¿Por qué es relevante?** Es una actividad muy completa porque combina lengua y razonamiento lógico. Para descifrar el mensaje hay que aplicar criptoanálisis básico: fijarse en las palabras cortas, en las letras dobles y, sobre todo, en la frecuencia de las letras del español (la E, la A o la O son las más habituales). Eso desarrolla el pensamiento deductivo, la atención sostenida y la memoria de trabajo, a la vez que refuerza vocabulario y ortografía. Al usar palabras con su definición y frases del propio temario, el repaso de contenidos es real y significativo, no un ejercicio aislado. Es ideal para trabajar el razonamiento y la lectoescritura, por eso aparece de forma destacada en Atención a la Diversidad, además de en Primaria, ESO y Bachillerato. La motivación de 'romper el código' mantiene el interés mucho más que una ficha tradicional.

**¿Cómo funciona?** La pantalla muestra el mensaje cifrado: una fila de números con un hueco vacío debajo de cada uno. El jugador pincha en un número y escribe la letra que cree correcta; al instante, todas las apariciones de ese mismo número muestran esa letra. Se va probando, corrigiendo y deduciendo hasta colocar todas las letras. En los niveles más fáciles hay ayudas (revelar letras, comprobar fallos y ver la tabla de frecuencias); en el examen hay tiempo limitado y se obtiene una nota sobre 10. Al acertar todo, salta la celebración.

**Cómo se juega.**
1. Elige un nivel de dificultad en las pestañas de arriba: Fácil, Medio o Examen.
2. Lee la pista (en Fácil y Medio aparece una definición que orienta sobre la palabra o frase).
3. Haz clic en uno de los números del mensaje cifrado para seleccionarlo.
4. Escribe en el teclado (físico o en pantalla) la letra que crees que le corresponde; se copiará en todos los números iguales.
5. Empieza por las palabras de 1-2 letras y por los números más repetidos: suelen ser E, A u O.
6. Usa el borrador o la tecla de borrar para corregir una letra mal puesta.
7. En Fácil y Medio, apóyate en 'Revelar', 'Frecuencias' y 'Comprobar' cuando te atasques.
8. Completa todas las letras correctamente para descifrar el mensaje y ganar.
9. Pulsa 'Nuevo' u 'Otro criptograma' para jugar otra ronda.

**Modos.**
- **Fácil**: Una palabra suelta con las vocales ya reveladas. Incluye 3 revelaciones de letra, tabla de frecuencias y opción de comprobar fallos. Cuenta como práctica.
- **Medio**: Una frase corta, sin vocales reveladas. Dispone de 2 revelaciones, frecuencias y comprobar. Cuenta como práctica.
- **Examen**: Una frase larga con 5 minutos de tiempo y sin ninguna ayuda. Da nota sobre 10 y puntos para el ranking (más rápido, más puntos).

**Consejos.**
- Las letras más frecuentes del español son E, A, O, S, R y N: prueba con ellas en los números que más se repiten.
- Fíjate en las palabras de una o dos letras (a, y, de, el, la) y en las letras dobles como LL o RR: dan muchas pistas.
- En el examen, ve rápido pero seguro: el tiempo suma puntos extra para el ranking, pero un fallo te baja la nota.

---

## ⚡ Velocidad `(velocidad-respuesta)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Mini-juego arcade de vocabulario contrarreloj: se muestra una definición y el alumno teclea la palabra antes de que se agote la barra de tiempo. Componente React único (VelocidadRespuesta.jsx) con su CSS, que reutiliza el vocabulario del rosco (getRoscoData) y el modal de instrucciones compartido.

**Software.** Arquitectura de un solo componente funcional en src/apps/velocidad-respuesta/VelocidadRespuesta.jsx (+ VelocidadRespuesta.css). Librerías: framer-motion (motion/AnimatePresence para tarjeta, transición de preguntas, badges y resultado), canvas-confetti (celebración al completar la ronda con paleta multicolor), lucide-react (iconos Zap, Timer, Flame, Star, Send, Check, X, Trophy, Award, etc.), react-router-dom (useParams para level/grade/subjectId) y el InstructionsModal/InstructionsButton de _shared. NO usa three/@react-three/fiber ni TTS. Estado con useState/useRef: allWords, questions, currentIndex, status (idle|playing|correct|wrong|timeout|won|lost), answer, score, streak/maxStreak, correctCount, mistakes, pendingTimeBonus, timeLeft/maxTime, helpsRemaining, revealedFirst. Constantes: MODE_CONFIG (easy/medium/exam con questions/baseTime/helps/speedUp), GRADE_TIME_MULTIPLIERS (escala el tiempo por curso, 2.2x en 1º Primaria hasta 0.85x en 2º Bach; getBaseTime redondea a 0.5s y nunca baja de 3s). Temporizador: useEffect que crea un setInterval cada 50ms decrementando timeLeft en 0.05; al llegar a 0 pasa a 'timeout'. Comparación de respuesta con normalize() (NFD, quita diacríticos, a mayúsculas, solo A-Z/Ñ/espacio). Puntuación por acierto: streakMultiplier = 1 + streak*0.1; timeBonus = round(20 * (timeLeft/adjBase)); gained = round(100*streakMultiplier + timeBonus) (la base real es 100 fija; el modal dice '100 + longitud×15' pero eso no está implementado). speedUp en medium/exam reduce ~5% del base cada 3 rachas (suelo en 50% del base y 3s). Nota /10 (solo examen): nota = round((correctCount/questions.length)*100)/10, con notaColor (>=8 excellent, >=5 good, <5 fail) y notaMsg (>=9/>=7/>=5/<5) siguiendo el patrón del CLAUDE.md. Anti-doble-disparo con trackedRef (useRef) que protege el useEffect de fin de partida; se resetea en startGame.

**Jugabilidad.** Bucle por pregunta: se baraja allWords, se toman N preguntas (5/8/10), se ordenan por dificultad (fáciles primero); por cada una se muestra la definición (clue) y un meta con el número de letras, una barra de tiempo que cambia de color (verde>50% / amarillo>25% / rojo) y un input. Controles: input de texto + botón Enviar (icono Send) o tecla Enter (handleKeyDown). Autofoco al input. Dos ayudas (lifelines) limitadas por modo: 'Ver 1ª letra' (rellena la primera letra) y 'Saltar' (avanza sin puntuar y resetea racha). Acierto: feedback verde '¡Correcto!' con +puntos, racha y multiplicador (badge Flame visible desde racha 2, ×multiplier), avance a los 800ms. Fallo o timeout: feedback rojo mostrando la palabra correcta, suma a 'mistakes', resetea racha y otorga pendingTimeBonus (50% del base, mín 2s) que se aplica a la siguiente pregunta; avance a los 1800ms. Importante: fallar NO termina la partida (a pesar de la etiqueta 'vidas'/X en stats y del texto del modal, no hay condición de derrota real por fallos); la ronda solo acaba cuando no quedan preguntas → status 'won'. Final: confeti, tarjeta de resultado con puntos, aciertos/total y racha máxima; en examen además la nota /10 grande con color y mensaje. Botón 'Jugar otra vez'.

**Educativo.** Objetivo pedagógico: consolidar y automatizar el reconocimiento de vocabulario y términos de cada asignatura a partir de su definición, ejercitando recuperación léxica rápida (fluidez), ortografía y velocidad de tecleo bajo presión temporal. Entrena memoria semántica, lectura comprensiva de definiciones, atención sostenida y toma de decisiones rápida. Encaje curricular: como reutiliza el vocabulario del rosco (getRoscoData), aparece transversalmente en todas las asignaturas y cursos de Primaria (1º-6º), ESO (1º-4º) y Bachillerato (1º-2º), con tiempos escalados por curso para ajustar la exigencia, y por el resolveADParams del servicio también es jugable en Atención a la Diversidad (redirige a contenido de Primaria). La asignatura se deriva de subjectId (por defecto 'lengua' en Primaria, 'general' en otros).

**Datos.** Contenido 100% reutilizado del banco del rosco: getRoscoData(level, grade, asignatura) en src/services/gameDataService.js → RPC Supabase get_rosco_data (con caché en memoria 5 min y resolveADParams para nivel 'ad'). De cada item del rosco toma {solucion→word, definicion→clue, difficulty}. FILTRA a respuestas de una sola palabra: descarta soluciones vacías, sin definición o que contengan espacio/guion (!/\s|-/), por lo que el conjunto efectivo es menor que el del rosco. Requiere al menos 4 palabras válidas; si no, muestra 'No hay suficientes palabras para esta asignatura'. El nombre/icono de la asignatura sale de public/data/materias.json (getSubjectInfo). No usa getAppContent ni datos propios embebidos.

**Integración.** Registrada en src/apps/config/commonApps.js como appVelocidadRespuesta (id 'velocidad-respuesta', component VelocidadRespuesta). Modos: tres niveles easy/medium/exam, pero seleccionados mediante TABS visibles durante el juego (veloc-gamemode-tabs) que reinician la partida vía un useEffect que vuelve a llamar startGame al cambiar gameMode — esto contradice la pauta del CLAUDE.md de usar pantalla de selección previa en lugar de tabs en partida. NO es single_mode y NO está en duelableApps.js (sin duelo 1vs1, sin DuelChatBar). Tracking: la app NO usa useGameTracker directamente; recibe onGameComplete por props desde AppRunnerPage. En el fin de partida (useEffect protegido por trackedRef) llama onGameComplete una vez con: examen → mode:'test', score, maxScore = questions.length*170, correctAnswers=correctCount, totalQuestions, durationSeconds:0; práctica (easy/medium) → mode:'practice', score:0, maxScore:0. AppRunnerPage aplica el multiplicador de curso al maxScore/score y dispara gamification_process_session (XP, insignias, ranking) y el alta en game_sessions/high_scores. Particularidades a vigilar para mejoras: (1) durationSeconds siempre 0 → no se mide tiempo real de partida; (2) maxScore=questions.length*170 es heurístico y no acota el score real posible (multiplicador de racha + timeBonus pueden superarlo), distorsionando ranking; (3) en práctica se envía score 0 y maxScore 0 → esas partidas no aportan al ranking; (4) el texto del InstructionsModal está DESACTUALIZADO respecto a MODE_CONFIG (dice 10/15/20 preguntas, 'vidas' y fórmula '100 + longitud×15' que no existen en el código); (5) status 'lost' está contemplado en el código pero nunca se alcanza (no hay derrota).

**Ideas de mejora.**
- Sincronizar el modal de instrucciones con MODE_CONFIG real (5/8/10 preguntas, tiempos base, ayudas, ausencia de vidas y fórmula de puntos correcta) y eliminar referencias a 'vidas'/'lost' que ya no aplican, para no confundir al alumnado.
- Migrar la selección de dificultad a una pantalla previa (no tabs en partida) como exige el CLAUDE.md, evitando reinicios accidentales y la pérdida de progreso al tocar una pestaña a mitad de ronda.
- Medir y enviar durationSeconds real y revisar el cálculo de maxScore (acotar el score con un techo coherente con racha+timeBonus) para que el ranking sea justo; valorar también enviar puntuación en práctica para que esas partidas cuenten en high_scores.
- Añadir lectura por voz (TTS opcional) de la definición y/o un modo accesible con más tiempo, además de un material de estudio (glosario por letra inicial) reutilizando el patrón de Anagramas/RoscoUI; opcionalmente integrarla como app de duelo 1vs1 dado su formato rápido por turnos.

### Ficha de usuario

**¿Qué es?** Velocidad es un juego educativo tipo arcade para repasar vocabulario contrarreloj. En pantalla aparece la definición de una palabra y el alumno tiene que escribir la palabra correcta antes de que se agote una barra de tiempo. Las palabras y sus pistas salen del mismo banco de vocabulario que usa el Rosco, adaptado a la asignatura y al curso. Cada acierto suma puntos, encadena rachas y dispara multiplicadores, con un final celebrado con confeti y un resumen de aciertos y puntuación.

**¿Por qué es relevante?** Trabaja la recuperación léxica rápida: reconocer un término a partir de su definición y escribirlo bien en pocos segundos. Esa práctica con límite de tiempo ayuda a automatizar el vocabulario (pasar de 'lo reconozco si pienso' a 'me sale solo'), algo clave para la comprensión lectora y la expresión escrita. Además entrena ortografía, atención sostenida y autocontrol bajo presión, y refuerza la motivación gracias a las rachas, los puntos y el multiplicador. Al ser transversal, sirve para repasar lengua, ciencias, historia o idiomas en cualquier curso, y el tiempo disponible se ajusta automáticamente a la edad: más margen en Primaria y menos en cursos superiores. En modo Examen ofrece una nota sobre 10 que orienta al alumnado y al docente sobre el grado de dominio del vocabulario.

**¿Cómo funciona?** El juego elige varias palabras del vocabulario de la asignatura (ordenadas de más fácil a más difícil) y plantea una pregunta cada vez: muestra la definición y cuántas letras tiene la palabra. Una barra que cambia de verde a rojo marca el tiempo restante. El alumno escribe su respuesta y pulsa Enter; si acierta gana puntos y sube la racha, y si falla o se le acaba el tiempo se le muestra la solución y recibe algo de tiempo extra en la siguiente. Hay ayudas limitadas: revelar la primera letra y saltar la pregunta.

**Cómo se juega.**
1. Elige el modo de dificultad (Fácil, Medio o Examen) en las pestañas superiores.
2. Lee con atención la definición que aparece y fíjate en el número de letras indicado.
3. Escribe la palabra en el cuadro de texto antes de que la barra de tiempo se agote.
4. Pulsa Enter o el botón de enviar para comprobar tu respuesta.
5. Si aciertas, encadena respuestas seguidas para subir la racha y el multiplicador de puntos.
6. Si te atascas, usa la ayuda '1ª letra' o 'Saltar' (tienen usos limitados según el modo).
7. No te preocupes por las tildes: la corrección ignora los acentos.
8. Al terminar la ronda, revisa tu puntuación, tus aciertos y tu racha máxima (y la nota sobre 10 en modo Examen).
9. Pulsa 'Jugar otra vez' para repetir e intentar superar tu marca.

**Modos.**
- **🟢 Fácil**: 5 preguntas con más tiempo por palabra y bastantes ayudas (varias pistas de primera letra y varios saltos). El tiempo no se reduce con la racha.
- **🟡 Medio**: 8 preguntas con menos tiempo y solo una pista y un salto. La velocidad aumenta a medida que encadenas aciertos.
- **🔴 Examen**: 10 preguntas con poco tiempo, una sola pista y sin saltos; la velocidad sube con la racha y al final obtienes una nota sobre 10.

**Consejos.**
- Empieza por leer el número de letras: te ayuda a descartar respuestas y a escribir más rápido.
- Aprovecha las rachas: responder seguido sin fallar multiplica tus puntos, pero en Medio y Examen también te deja menos tiempo, así que mantén la calma.
- Guarda las ayudas de 'primera letra' y 'saltar' para las palabras que de verdad se te resistan.
- No escribas tildes ni te preocupes por mayúsculas: céntrate en acertar la palabra cuanto antes.

---

## 🧲 Conecta Parejas `(conecta-parejas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de emparejamiento palabra-definición en dos columnas, unidas mediante líneas SVG curvas de colores al acertar. Componente React único (ConectaParejas.jsx) que consume vocabulario del rosco vía getRoscoData, con tres modos de dificultad y nota /10 en examen.

**Software.** Componente funcional único `src/apps/conecta-parejas/ConectaParejas.jsx` + CSS hermano; no usa los componentes de `_shared` salvo `InstructionsModal`/`InstructionsButton`. Librerías: framer-motion (motion/AnimatePresence para la card, los items con `whileTap`/`layout` y el panel de resultado), canvas-confetti (200 partículas al ganar) y lucide-react (Link2, Timer, Heart, Trophy, Star, Flame, etc.). No usa three/r3f ni TTS. Estado con useState/useRef: las dos columnas (`leftItems`/`rightItems`), `selected`, `matched` (pairId→índice de color), `wrongFlash`, contadores (`score`, `streak`, `maxStreak`, `correctCount`, `wrongCount`, `lives`), temporizadores (`timer` ascendente y `timeLeft` descendente en examen) y `helpsRemaining`. Las líneas que unen los pares se calculan en `recalcLines` leyendo `getBoundingClientRect` de refs por item (`leftRefs`/`rightRefs`) relativos a `containerRef`, y se pintan como paths SVG cúbicos; se recalculan en cambios de `matched` y en `resize`. Puntuación por acierto: `Math.round(100 · (1 + streak·0.1) + timeBonus)`, con `timeBonus = max(0, round(20·(1 − timer/refTime)))` (refTime = timer del modo o 120). Nota /10 = `round(correctCount/totalPairs · 100)/10` con código de color (>=8 excellent, >=5 good, <5 fail) y mensajes estándar. Anti-doble-disparo con `trackedRef` (useRef bool) que se resetea en `generatePuzzle`; la condición de victoria/derrota vive en effects separados sobre `correctCount`/`lives`.

**Jugabilidad.** Bucle: se generan N pares barajados (palabra a la izquierda, definición a la derecha, ambas columnas mezcladas por separado). El jugador hace click en un item de una columna y luego en uno de la otra; si los `pairId` coinciden se bloquean ambos, se dibuja una línea de color y suma puntos con multiplicador de racha + bonus de tiempo; si fallan, flash rojo 600 ms, se rompe la racha y se pierde una vida (cuando aplica). Click en el mismo lado cambia la selección. Solo ratón/táctil (no hay controles de teclado). Dificultades: Fácil (5 pares, vidas infinitas, 2 reveals + 3 pistas, sin reloj), Medio (8 pares, 3 vidas, 1 reveal + 1 pista), Examen (12 pares, 2 vidas, 180 s, 1 reveal, sin pista). Victoria al conectar todos los pares (confeti); derrota al agotar vidas o que llegue el cronómetro de examen a 0. Ayudas: 'Revelar par' empareja uno pendiente al azar (cuenta como acierto) y 'Pista extra' que internamente llama también a `revealPair`. Feedback visual de selección/acierto/error; no hay sonidos.

**Educativo.** Entrena vocabulario y comprensión de definiciones (asociar término con su significado), memoria semántica y razonamiento por descarte. Es transversal: usa el banco de rosco de cualquier asignatura del nivel/curso, filtrando solo soluciones de una sola palabra (sin espacios). Registrada en Primaria, ESO, Bachillerato y Atención a la Diversidad; en AD aparece en numerosos bloques (vocabulario, morfosintaxis, pragmática, comprensión-oral, memoria, habilidades-sociales, razonamiento), redirigidos a datos de Primaria 1º-3º Lengua/Tutoría según el mapeo de gameDataService.

**Datos.** Contenido cargado con `getRoscoData(level, grade, asignatura)` (RPC `get_rosco_data`), el mismo banco que Rosco, Ahorcado, Crucigrama, Sopa, etc. Cada item aporta `solucion` (columna izquierda) y `definicion` (columna derecha). Filtro propio en el componente: descarta items sin solución/definición y aquellos cuya solución contenga espacios, por lo que solo entran palabras de un único token. La asignatura se deriva de `subjectId` (fallback: 'lengua' en primaria, 'general' en el resto). Se exige un mínimo de 5 palabras o se muestra pantalla de 'no hay suficientes palabras'.

**Integración.** Tres modos easy/medium/exam expuestos como TABS visibles DURANTE la partida (no en pantalla previa), lo que contradice el patrón estándar de la plataforma: pulsar otra pestaña dispara `generatePuzzle` y reinicia la partida en curso. `onGameComplete` se llama una vez (protegido por `trackedRef`) con `mode: 'test'` solo en examen (enviando `score` y `maxScore = totalPairs · 170`) y `mode: 'practice'` con `score`/`maxScore` a 0 en fácil/medio; de ahí cuelgan XP, insignias, avatares y ranking vía AppRunnerPage. No usa directamente `useGameTracker` (lo gestiona el wrapper). NO está en `duelableApps.js` (sin duelo 1 vs 1) ni registrada como `single_mode`. Particularidades a vigilar: las líneas SVG dependen de `getBoundingClientRect`, sensible a scroll/zoom/reflow (solo se recalcula en cambios de `matched` y `resize`); la 'Pista extra' es en realidad un segundo 'Revelar par'; y los reveals inflan `correctCount` (cuentan como aciertos para la nota /10 del examen).

**Ideas de mejora.**
- Mover la selección de dificultad a una pantalla previa (como exige el estándar de la plataforma) para que cambiar de modo no reinicie la partida y no rompa el tracking de sesión.
- Convertir 'Pista extra' en una verificación real (resaltar conexiones dudosas o descartar definiciones) en lugar de duplicar 'Revelar par', y plantear que las ayudas no inflen correctCount para que la nota /10 del examen refleje aciertos genuinos.
- Añadir accesibilidad/controles de teclado (navegación y selección con flechas/Enter) y soporte TTS para leer definiciones, dado su uso en Atención a la Diversidad.
- Recalcular las líneas SVG también en scroll y con un ResizeObserver del tablero para evitar desalineaciones, y permitir definiciones multi-palabra ampliando la fuente de datos para no descartar tanto vocabulario.

### Ficha de usuario

**¿Qué es?** Conecta Parejas es un juego de asociación en el que aparecen dos columnas: a la izquierda, palabras; a la derecha, sus definiciones, ambas desordenadas. La tarea consiste en unir cada palabra con la definición que le corresponde. Cada acierto se marca con una línea de color que enlaza ambos elementos y los deja fijados. Funciona con vocabulario de la asignatura y el curso del alumno, e incluye distintos niveles de dificultad, puntos, rachas y, en el modo examen, una nota sobre 10.

**¿Por qué es relevante?** Asociar un término con su significado es una de las formas más eficaces de consolidar vocabulario: obliga a comprender, no solo a memorizar de forma mecánica. El alumno desarrolla competencia léxica y comprensión lectora, además de razonamiento por descarte (cuantas menos parejas quedan, más fácil deducir las restantes) y atención sostenida. Al ser un banco de términos transversal, sirve igual para repasar conceptos de Lengua, Ciencias, Matemáticas o cualquier materia. El formato visual de líneas de colores da una retroalimentación inmediata y clara, y el sistema de rachas y puntos mantiene la motivación. En el modo examen aporta una nota objetiva sobre 10, útil para que el docente valore el dominio del vocabulario trabajado.

**¿Cómo funciona?** El juego elige un grupo de palabras del temario y coloca las palabras en una columna y sus definiciones en otra, todo mezclado. El alumno pulsa una palabra y después su definición; si acierta, ambas se unen con una línea de color y se bloquean, y suma puntos (más cuantos aciertos seguidos encadene y más rápido vaya). Si falla, ve un parpadeo rojo y, según el modo, pierde una vida. La partida termina al conectar todas las parejas o al quedarse sin vidas o sin tiempo.

**Cómo se juega.**
1. Elige el nivel de dificultad en las pestañas superiores (Fácil, Medio o Examen).
2. Lee las palabras de la columna izquierda y las definiciones de la derecha.
3. Haz clic en una palabra (o en una definición) para seleccionarla.
4. Haz clic en el elemento de la otra columna que creas que es su pareja.
5. Si aciertas, se unen con una línea de color y quedan bloqueados; si fallas, verás un parpadeo rojo.
6. Para cambiar de selección, pulsa otro elemento del mismo lado.
7. Usa 'Revelar par' o 'Pista extra' si te atascas (el número indica cuántas te quedan).
8. Continúa hasta conectar todas las parejas antes de quedarte sin vidas o sin tiempo.
9. Pulsa 'Jugar otra vez' o 'Nuevo' para empezar una partida diferente.

**Modos.**
- **Fácil**: 5 parejas, vidas ilimitadas y sin reloj, con 2 revelaciones y 3 pistas. Ideal para empezar.
- **Medio**: 8 parejas, 3 vidas, 1 revelación y 1 pista. Un reto intermedio.
- **Examen**: 12 parejas, 2 vidas, 3 minutos de tiempo y 1 revelación. Da nota sobre 10 y cuenta para las tareas.

**Consejos.**
- Empieza por las parejas que tengas más claras: al quitarlas, las que quedan son más fáciles de deducir por descarte.
- Encadena aciertos sin fallar: cada acierto seguido aumenta el multiplicador de puntos.
- En el modo examen ve rápido pero sin precipitarte, porque resolver pronto da puntos extra de tiempo, pero cada fallo cuesta una vida.
- Guarda las ayudas ('Revelar par' y 'Pista extra') para las parejas que de verdad se te resistan.

---

## ✍️ Dictado `(dictado-interactivo)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de dictado en React (componente único DictadoInteractivo.jsx) que pronuncia palabras y frases mediante la Web Speech API (TTS) y evalúa lo escrito letra a letra, con bonus por ortografía perfecta. Tres modos (fácil/medio/examen) y nota /10 en examen.

**Software.** Componente funcional único en src/apps/dictado-interactivo/DictadoInteractivo.jsx (+ DictadoInteractivo.css). Librerías: framer-motion (motion/AnimatePresence para tarjeta, transiciones de pregunta y diff), canvas-confetti (celebración al completar), lucide-react (iconos Volume2/Timer/Trophy/Flame/etc.). El audio NO usa three ni librerías externas de voz: es Web Speech API nativa (SpeechSynthesisUtterance) con helper speakText(text, rate), selección de voz española (pickSpanishVoice busca es-ES o es) y precarga de voces vía evento 'voiceschanged' con flag ttsReady. Estado con useState/useRef puro (sin Redux/Zustand): questions, currentIndex, answer, status (idle|playing|correct|wrong|won|lost), diff, score, streak, maxStreak, correctCount, replaysLeft, playbackSpeed, timeLeft, mistakes. Refs: timerRef (intervalo del temporizador), inputRef (foco automático del input) y trackedRef (flag anti-doble-disparo de onGameComplete). La comparación se hace con normalize() (NFD + quita diacríticos + mayúsculas + trim) y diffWord(input, expected) que genera un array {char, expected, correct, extra, missing} para el render letra a letra. Puntuación al acertar: basePoints=100 · streakMultiplier(1+streak·0,1) + orthoBonus(+20 si coincide con tildes exactas) + timeBonus(hasta 20, proporcional a timeLeft/timer en examen). La nota /10 se calcula nota = round((correctCount/questions.length)·100)/10 con color (>=8 excellent, >=5 good, <5 fail) y mensaje (>=9 Excelente, >=7 Muy bien, >=5 Aprobado, <5 Necesitas repasar). En examen se envía score real y maxScore=questions.length·170; en práctica score y maxScore van a 0.

**Jugabilidad.** Bucle: al presentar cada pregunta se reproduce el audio automáticamente (delay de 200ms) y se reinicia el contador de repeticiones del modo; el alumno escucha, escribe en el input y pulsa Enter (o el botón flecha) para enviar. submitAnswer compara la respuesta, fija el diff, suma puntos/racha si acierta o incrementa fallos y rompe la racha si falla; tras 1,2s (acierto) o 2,5s (fallo) avanza. Controles: teclado (escribir + Enter), ratón/táctil (botón enviar, botón Repetir audio, selector de velocidad Lento/Normal/Rápido, botón Nuevo). En examen hay temporizador de 20s por palabra; al agotarse cuenta como fallo (diff contra cadena vacía) pero la partida NO termina. Condición de fin única: completar todas las preguntas (status 'won'); fallar nunca termina la partida ('lost' está declarado pero no se alcanza). Feedback: diff visual letra a letra con colores (verde correcto, rojo incorrecto con la esperada debajo, gris sobrante, hueco azul faltante), aviso de tildes perfectas, racha con icono de llama, y confeti al terminar. Si el navegador no soporta TTS (ttsReady false) se muestra aviso recomendando Chrome/Edge y se deshabilita el audio.

**Educativo.** Objetivo pedagógico: ortografía y escritura al dictado. Entrena percepción auditiva (escucha activa del TTS), correspondencia fonema-grafema, ortografía de la palabra (tildes y letras problemáticas h, b/v, g/j según la propia instrucción) y atención sostenida. El feedback letra a letra hace visible el error concreto. Encaje curricular: principalmente Lengua, aunque se ofrece en todas las asignaturas porque reutiliza el vocabulario/definiciones del rosco de cada materia (escritura correcta de términos del área). Aparece en Primaria, ESO y Bachillerato (registrada en primariaApps, esoApps y bachilleratoApps); en Atención a la Diversidad funciona vía el mapeo AD del gameDataService que redirige a contenidos de Primaria.

**Datos.** Dos fuentes combinadas vía gameDataService.js: getRoscoData(level, grade, asignatura) aporta las PALABRAS (se filtran las entradas con solucion y definicion que sean de una sola palabra —sin espacios—, usando definicion como pista) y getOrdenaFrasesData(level, grade, asignatura) aporta las FRASES (strings de >8 caracteres, sin pista). asignatura = subjectId o 'lengua' (primaria) / 'general' (resto). Modos easy/medium usan solo palabras (source 'word'), examen usa 'mixed' (palabras + hasta questions/3 frases). materias.json (import estático) solo se usa para el nombre/icono de la asignatura en el subtítulo. No usa getAppContent ni datos hardcodeados de contenido.

**Integración.** Tres modos como TABS en la cabecera (no pantalla previa de selección): Fácil (8 palabras, velocidad lenta, repeticiones ∞, pista visible), Medio (10 palabras, 3 repeticiones), Examen (10 mixtos, 1 repetición, 20s/palabra → mode 'test' con nota /10). No es single_mode ni duelo (no está en duelableApps). Tracking: recibe onGameComplete como prop (lo inyecta AppRunnerPage con useGameTracker); se dispara UNA vez al pasar a 'won', protegido por trackedRef.current. En examen envía {mode:'test', score, maxScore: questions.length·170, correctAnswers, totalQuestions}; en práctica {mode:'practice', score:0, maxScore:0}. durationSeconds se envía siempre como 0 (no mide tiempo real de partida). El ranking se alimenta automáticamente desde AppRunnerPage con score/maxScore (solo aporta en examen, ya que práctica manda 0). Particularidades para mejoras: (1) usar tabs durante la partida contradice la guía de CLAUDE.md (pantalla previa de dificultad) —cambiar de modo reinicia vía startGame; (2) durationSeconds siempre 0 deja sin valor el campo de duración; (3) el dependency array del efecto que reproduce el audio incluye 'status === playing' como booleano (anti-patrón con eslint-disable); (4) la nota /10 NO pasa override por la prop nota, se recalcula en AppRunnerPage como correct/total·10 (coincide con el cálculo local); (5) el examen depende del TTS del navegador: sin voz es-ES la experiencia se degrada.

**Ideas de mejora.**
- Medir y enviar durationSeconds real (timestamp de inicio de partida) para enriquecer el tracking y permitir bonus/ranking por velocidad coherente.
- Migrar los tabs de dificultad a la pantalla de selección previa recomendada en CLAUDE.md, evitando reinicios accidentales a mitad de partida y alineando el patrón con el resto de apps.
- Robustecer el TTS: precargar/forzar voz es-ES, fallback con resaltado de sílabas o repetición más lenta automática, y mensaje claro (o deshabilitar examen) cuando no haya voz española disponible.
- Añadir una pestaña de 'errores frecuentes' o repaso al final que reúna las palabras falladas para reintentarlas, reforzando el aprendizaje ortográfico de los términos concretos donde el alumno erró.

### Ficha de usuario

**¿Qué es?** Dictado es una actividad en la que el ordenador pronuncia en voz alta una palabra o una frase y tú debes escribirla correctamente. El programa compara tu respuesta letra a letra y te muestra al instante qué has acertado y qué has fallado, prestando especial atención a la ortografía y a las tildes. Puedes escuchar el audio las veces que el modo permita, ajustar la velocidad de la voz a tu ritmo y avanzar pulsando Enter. Es una forma amena de practicar escritura correcta en cualquier asignatura.

**¿Por qué es relevante?** El dictado es uno de los ejercicios más sólidos para consolidar la ortografía porque obliga a unir lo que se oye con cómo se escribe, sin tener la palabra delante. Esta versión digital añade dos ventajas clave: la corrección es inmediata y muy visual (cada letra se marca como correcta, incorrecta, sobrante o faltante), de modo que el alumno ve exactamente dónde está el error y no solo si acertó o no; y el sistema premia las tildes perfectas, animando a cuidar la acentuación. Entrena escucha activa, atención sostenida, memoria de trabajo y la relación entre sonido y grafía (las letras conflictivas como h, b/v o g/j). Al reutilizar el vocabulario propio de cada materia, también afianza la escritura correcta de los términos clave de cada asignatura.

**¿Cómo funciona?** Eliges un modo de dificultad y empieza la ronda. En cada turno el ordenador pronuncia una palabra o frase; escuchas, puedes repetir el audio (según el modo) o cambiar la velocidad, y escribes lo que has oído. Al enviar, el sistema compara tu texto con el correcto letra a letra y colorea cada acierto y error. Ganas puntos por acertar, por encadenar respuestas seguidas y por escribir las tildes exactas. Aunque falles, la partida no se acaba: siempre completas todas las palabras hasta ver tu resultado.

**Cómo se juega.**
1. Elige un modo de dificultad en las pestañas superiores: Fácil, Medio o Examen.
2. Al empezar cada palabra se reproduce el audio automáticamente; escucha con atención.
3. Si lo necesitas, pulsa el botón del altavoz para repetir (las repeticiones dependen del modo) y ajusta la velocidad a Lento, Normal o Rápido.
4. Escribe en la caja de texto exactamente lo que has oído, cuidando las tildes.
5. Pulsa Enter o el botón de la flecha para enviar tu respuesta.
6. Revisa la corrección letra a letra: verde es correcto, rojo es error, gris es letra sobrante y el hueco azul es una letra que faltaba.
7. Continúa con la siguiente palabra; aunque falles, seguirás hasta completar todas.
8. Al terminar, consulta tu resultado: en modo Examen verás tu nota sobre 10, y en todos los modos tus puntos y tu mejor racha.
9. Pulsa 'Jugar otra vez' para practicar con una nueva ronda.

**Modos.**
- **🟢 Fácil**: 8 dictados de palabras, velocidad inicial lenta, repeticiones de audio ilimitadas y pista (definición) visible. Ideal para empezar.
- **🟡 Medio**: 10 dictados de palabras a velocidad normal, con un máximo de 3 repeticiones por palabra y sin pista.
- **🔴 Examen**: 10 dictados mixtos (palabras y frases), una sola repetición, 20 segundos por dictado y nota sobre 10 al final.

**Consejos.**
- Fíjate bien en las tildes y en las letras silenciosas o que suenan parecido (h, b/v, g/j): escribir las tildes perfectas te da puntos extra.
- Si una palabra es larga o difícil, usa primero la velocidad Lento para captar bien cada sonido antes de escribir.
- Encadena aciertos sin fallar para subir la racha y multiplicar tus puntos.
- Usa Chrome o Edge y sube el volumen para que la voz se escuche con claridad.

---

## 🏗️ Torre de Palabras `(torre-palabras)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Torre de Palabras es un juego de clasificación léxica de una sola pantalla: cada bloque muestra una palabra y el alumno debe pulsar la categoría a la que pertenece; cada acierto apila un bloque y hace crecer una torre visual. Está implementado como un único componente React funcional (TorrePalabras.jsx) con su CSS propio, sin lógica 3D ni servidor adicional.

**Software.** Componente único `src/apps/torre-palabras/TorrePalabras.jsx` + `TorrePalabras.css`. Librerías: `framer-motion` (animaciones del bloque actual, apilado por resorte, AnimatePresence para entradas/salidas y resultado), `canvas-confetti` (celebración al completar la torre) y `lucide-react` (iconografía: Layers, Timer, Flame, Trophy, Star, etc.). Reutiliza `_shared/InstructionsModal` (modal + InstructionsButton) e importa `public/data/materias.json` para resolver nombre e icono de la asignatura (`getSubjectInfo`). Estado: hooks locales `useState` (allCategories, categories, blocks, currentBlockIdx, status como máquina de estados idle|playing|correct|wrong|timeout|won|lost, towerHeight, score, streak/maxStreak, correctCount, wrongCount, helpsRemaining, timeLeft) más `useRef` para el intervalo del timer (`timerRef`) y el flag anti-doble-disparo (`trackedRef`). Configuración declarativa por modo en `MODE_CONFIG` (rounds, categories, showCategory, timer, helps). El puzzle se genera en `startGame`: filtra categorías con >=3 palabras, elige N al azar, reparte `Math.ceil(rounds/cats)` palabras por categoría, baraja con un Fisher-Yates propio (`shuffle`) y recorta a `rounds` (12). Puntuación por acierto: `Math.round(100 * (1 + streak*0.1) + timeBonus)`, con `timeBonus = Math.max(0, round(20 * timeLeft/timer))` solo en examen. Nota /10: `Math.round((correctCount / blocks.length) * 100) / 10`, con color (>=8 excellent, >=5 good, <5 fail) y mensajes (>=9 Excelente, >=7 Muy bien, >=5 Aprobado, <5 Necesitas repasar), siguiendo el patrón obligatorio del CLAUDE.md. El disparo de `onGameComplete` está protegido por `trackedRef.current` dentro de un `useEffect` que reacciona a `status==='won'`, garantizando una sola llamada por partida.

**Jugabilidad.** Bucle: aparece una palabra en el bloque central, debajo se muestran 2-4 botones de categoría (color + nombre formateado con `formatCategoryName`). El alumno pulsa la categoría correcta. Acierto → estado 'correct', se incrementa torre/score/racha y autoavance a los 700 ms; fallo → estado 'wrong', la torre 'tiembla' (clase shaking 600 ms), suma error, rompe racha, revela la categoría correcta y autoavanza a los 1400 ms. Solo control de ratón/táctil (clics en botones); no hay teclado ni arrastre. Tres niveles: Fácil (2 categorías, categoría correcta resaltada de inicio, 2 saltos + 3 pistas, sin tiempo), Medio (3 categorías, 1 salto + 1 pista) y Examen (4 categorías, 8 s por bloque, 0 saltos + 1 pista, con bonus de tiempo). El examen tiene timer por bloque que al agotarse marca 'timeout' (cuenta como fallo). No hay derrota real: siempre se recorren los 12 bloques hasta 'won' (la torre completada). Feedback: confeti al terminar, animación de apilado por resorte, contador de racha (Flame, visible a partir de 2), badge de errores y puntuación en vivo. Ayudas: Pista (revela la categoría correcta resaltándola), Saltar (avanza sin penalizar acierto pero rompe racha) y Nuevo (reinicia).

**Educativo.** Objetivo pedagógico: clasificación semántica y categorización de vocabulario — asociar cada término a su campo léxico/categoría conceptual. Entrena vocabulario, razonamiento por categorías, atención selectiva y, en examen, velocidad de procesamiento bajo presión temporal. Encaja en cualquier asignatura con vocabulario agrupable (lengua, inglés, ciencias naturales/sociales, etc.). Aparece registrada para Primaria (lengua, matemáticas, ciencias-naturales y otras listas), ESO y Bachillerato (heredada vía appsBase), y por el mapeo AD también es jugable en Atención a la Diversidad (redirige a datos de primaria). Requiere al menos 2 categorías con >=3 palabras para la asignatura; si no, muestra estado vacío explicativo.

**Datos.** Contenido proveniente de `getRunnerData(level, grade, asignatura)` de `gameDataService.js`, que llama a la RPC `get_runner_data` de Supabase y devuelve el formato `{categoria: [palabras]}` (cacheado 5 min en memoria, con deepParseJSON). La misma fuente que Runner, Memoria, Clasificador, Lluvia, Excavación y Snake; confirmado también por el mapeo `'torre-palabras': 'runner'` en DataStatsTable. El componente filtra a categorías con >=3 palabras, normaliza con trim y descarta vacíos. La asignatura se resuelve de `useParams` (`subjectId` o fallback 'lengua' en primaria / 'general' en otros niveles). En nivel 'ad' la capa de servicio remapea a primaria mediante AD_SUBJECT_MAP. No usa getAppContent ni datos propios embebidos.

**Integración.** Tres modos estándar easy/medium/exam definidos en MODE_CONFIG. NO es single_mode (no figura en app_scoring_config) y NO es duelable (no aparece en duelableApps.js), por lo que solo el modo Examen cuenta para tareas: en 'won' envía `mode: 'test'` si examen (score real, maxScore=blocks.length*170, correctAnswers, totalQuestions, durationSeconds:0) y `mode: 'practice'` en fácil/medio (score y maxScore a 0, para que no afecte al ranking). El tracking lo cierra `AppRunnerPage` vía `useGameTracker.trackGameSession`, que aplica el multiplicador de curso (1.0-2.1), persiste en game_sessions/high_scores y dispara XP, insignias, avatares y ranking. Registrada en commonApps.js como `appTorrePalabras` (id 'torre-palabras') y en primaria/eso/bachillerato. Particularidades a vigilar: (1) los modos se cambian con TABS visibles durante la partida en vez de la pantalla de selección previa que pide el CLAUDE.md — al pulsar una pestaña el useEffect llama a startGame y reinicia la partida, lo que puede romper el tracking si se cambia a media partida; (2) `durationSeconds` siempre es 0; (3) el maxScore de examen (170/bloque) es teórico y puede no alinearse con el score realmente alcanzable (100 + racha + 20 bonus), lo que distorsiona ligeramente el ratio score/maxScore del ranking.

**Ideas de mejora.**
- Migrar el selector de modos de tabs a una pantalla de selección previa (como exige el CLAUDE.md) para evitar reinicios accidentales y posibles inconsistencias de tracking al cambiar de modo a mitad de partida.
- Añadir lectura en voz alta (TTS Web Speech) de la palabra del bloque, especialmente útil para los primeros cursos de Primaria y para el uso en Atención a la Diversidad.
- Registrar `durationSeconds` real (medir tiempo de inicio a 'won') y revisar el `maxScore` del examen para que refleje el máximo realmente alcanzable, mejorando la calidad del ranking.
- Introducir una verdadera mecánica de derrota/equilibrio (p. ej. la torre se desmorona tras X errores o bloques temblorosos acumulados) y, opcionalmente, soporte de duelo 1 vs 1 con un TorrePalabrasDuel + DuelChatBar para sumarla a duelableApps.

### Ficha de usuario

**¿Qué es?** Torre de Palabras es un juego educativo de clasificación de vocabulario. En cada ronda aparece una palabra dentro de un bloque y, debajo, varios botones con nombres de categorías (por ejemplo: Animales, Plantas, Minerales). El alumnado debe pulsar la categoría a la que pertenece esa palabra. Cada acierto coloca un bloque sobre la torre, que va creciendo en pantalla; el objetivo es construir la torre más alta posible clasificando correctamente las doce palabras de la partida.

**¿Por qué es relevante?** Clasificar palabras por categorías es una de las destrezas de base del desarrollo del lenguaje y del pensamiento: ayuda a organizar el vocabulario en campos semánticos, a establecer relaciones entre conceptos y a recuperar las palabras con más rapidez. La actividad entrena vocabulario, razonamiento por categorías y atención selectiva, y en su modo más exigente añade rapidez de respuesta. Como se nutre del vocabulario de cada asignatura y curso, sirve igual para lengua, inglés, ciencias naturales o sociales. La torre que crece con cada acierto da una recompensa visual inmediata que motiva a seguir, mientras que el contador de racha y la puntuación premian la constancia. El modo Examen ofrece además una nota sobre 10, útil para que el profesorado lo use como tarea evaluable.

**¿Cómo funciona?** La app carga el vocabulario de la asignatura y el curso y lo organiza en categorías. En cada partida elige un grupo de palabras y las va mostrando una a una. El alumno pulsa la categoría correcta: si acierta, el bloque se apila y la torre crece; si falla, la torre tiembla, se marca el error y se muestra cuál era la categoría correcta antes de pasar a la siguiente palabra. Tras las doce palabras se muestra el resultado con la altura alcanzada, los aciertos, la mejor racha y, en modo Examen, la nota sobre 10.

**Cómo se juega.**
1. Elige el modo de dificultad en las pestañas superiores: Fácil, Medio o Examen.
2. Lee la palabra que aparece en el bloque central.
3. Mira los botones de categorías que hay debajo (por ejemplo: Animales, Plantas, Minerales).
4. Pulsa el botón de la categoría a la que crees que pertenece la palabra.
5. Si aciertas, el bloque se apila y la torre crece; si fallas, la torre tiembla y verás la categoría correcta.
6. Si dudas, usa el botón Pista para resaltar la categoría correcta, o Saltar para pasar de palabra (gastas una ayuda).
7. Continúa hasta clasificar las doce palabras de la partida.
8. Revisa tu resultado: altura de la torre, aciertos, mejor racha y, en Examen, tu nota sobre 10.
9. Pulsa Jugar otra vez o Nuevo para empezar una partida diferente.

**Modos.**
- **Fácil**: 12 bloques y solo 2 categorías. La categoría correcta aparece resaltada desde el principio y dispones de 2 saltos y 3 pistas. Sin tiempo. Ideal para empezar.
- **Medio**: 12 bloques y 3 categorías, sin resaltar la respuesta. Dispones de 1 salto y 1 pista, sin límite de tiempo.
- **Examen**: 12 bloques y 4 categorías, con 8 segundos por palabra y solo 1 pista. Da una nota sobre 10 y cuenta como tarea para el profesorado.

**Consejos.**
- Piensa en el significado de la palabra y en qué grupo encaja antes de pulsar; un acierto rápido y una buena racha suman más puntos.
- En modo Fácil fíjate en la categoría resaltada para ir aprendiendo las asociaciones antes de pasar a Medio o Examen.
- Guarda las pistas y los saltos para las palabras que de verdad te bloqueen, sobre todo en el modo Examen, donde son escasos.

---

## 🔎 Busca el Intruso `(busca-el-intruso)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego de discriminación visual y semántica en el que el alumno localiza, dentro de una rejilla, el único elemento que no encaja con el resto. Componente React de un solo fichero (BuscaElIntruso.jsx + BuscaElIntruso.css) con estado local vía useState/useRef, sin librerías de animación pesadas: usa CSS y requestAnimationFrame.

**Software.** Arquitectura monocomponente: src/apps/busca-el-intruso/BuscaElIntruso.jsx (+ .css), cargado de forma lazy en src/apps/config/commonApps.js (appBuscaElIntruso, id 'busca-el-intruso'). Recibe props { tema, onGameComplete } y lee level/grade/subjectId de useParams. Estado centralizado en un único objeto `estado` (useState) con campos modo, ronda, rondasTotales=10, aciertos, errores, indiceIntruso, bloqueoClicks, tablero, rows/cols, mensaje, categoria, feedbackCellIndex/Status y combo; refs auxiliares datosRef (datos del juego sincronizado por useEffect) y temporizadorRef. Detecta automáticamente dos sub-modos lógicos (`modoLogico`): 'visual' si los datos son un array de strings/emojis (rejilla 4x8, todas las celdas iguales salvo una, par elegido con elegirParEmojisVisual) y 'conceptual' si son objetos {categoria, correctos, intrusos} (rejilla 3x4 = 11 correctos + 1 intruso insertado con splice en posición aleatoria). El cronómetro NO usa setInterval: corre con requestAnimationFrame midiendo performance.now() (iniciarCronometro/detenerCronometro). Librerías: react-icons/fa (FaBook, FaTimes) para el botón de Material y el modal; prop-types; no usa framer-motion, canvas-confetti, three/@react-three/fiber, lucide-react ni TTS. El feedback visual es puramente CSS (clases shaking, sparkle-effect ✨, cross-effect ❌, message-banner, combo-counter, partículas de fondo generadas con useMemo) y emojis inline; no hay confeti ni sonido. El modal de Material de Estudio usa clases Tailwind. Puntuación: en finalizarTest() basePoints = aciertos*100, timeBonus = max(0, round(300*(1 - elapsed/(rondasTotales*8)))), comboBonus = min(combo*15, 200); totalPoints se manda como score y maxScore = rondasTotales*100 + 500. La nota /10 se calcula en la tarjeta de resultados como Math.round((aciertos/rondasTotales)*100)/10 con colores (>=8 verde, >=5 azul, <5 rojo) y mensajes ('Excelente'/'Muy bien'/'Aprobado'/'Necesitas repasar'), siguiendo el patrón del CLAUDE.md. Atención: NO hay ref anti-doble-disparo sobre onGameComplete/finalizarTest (el patrón useRef-flag obligatorio de la sección 5 no está implementado); el bloqueo de clicks (bloqueoClicks) evita doble clic por celda pero no protege la llamada final si finalizarTest se invocara dos veces.

**Jugabilidad.** Bucle: se renderiza una rejilla; el alumno hace clic/toca la celda que cree distinta; gestionarClick activa bloqueoClicks, compara el índice con indiceIntruso, marca acierto (combo++, 'GENIAL', clase ok, ✨) o error (combo=0, 'UPS! ESE NO ES', clase ko, ❌), y tras 1200 ms genera la siguiente colección (modo libre, infinito) o avanza de ronda (modo examen). Control único: ratón/táctil sobre celdas (no hay teclado). Dos modos de juego accesibles desde botones del HUD, sin pantalla previa de selección de dificultad: 'OTRO INTRUSO' (modo libre, partidas encadenadas sin fin ni nota) y 'EXAMEN' (10 rondas con cronómetro, indicador 'Pregunta X de 10' y pantalla de resultados con nota/10 y puntos). No hay condición de derrota por vidas ni por tiempo: el examen siempre termina al completar las 10 rondas; los errores solo bajan precisión, combo y nota. Feedback de combo (xN COMBO!) y partículas de fondo decorativas. En modo conceptual aparece un badge con la categoría y un botón 'MATERIAL' que abre el modal de estudio.

**Educativo.** Objetivo pedagogico: entrenar la discriminacion perceptiva (modo visual) y la categorizacion semantica / razonamiento por exclusion (modo conceptual: detectar el termino que no pertenece a una categoria). Destrezas: atencion selectiva, velocidad de procesamiento, vocabulario y campos semanticos, flexibilidad cognitiva. Esta dado de alta de forma muy transversal: Primaria, ESO, Bachillerato y Atencion a la Diversidad, en lengua, ingles, frances, valenciano, ciencias naturales, ciencias sociales, programacion y, en AD, en bloques como vocabulario, pragmatica, comprension-oral, habilidades-sociales y razonamiento. La doble naturaleza visual/conceptual lo hace util tanto para los cursos mas tempranos/AD (emojis) como para discriminacion lexica avanzada.

**Datos.** El contenido procede de getIntrusoData(level, grade, subject) en src/services/gameDataService.js, que llama a la RPC Supabase get_intruso_data y devuelve un array de {categoria, correctos, intrusos} (parseado con deepParseJSON y cacheado). El componente hace fallback: si la asignatura no tiene datos reintenta con 'general'. Segun la forma del primer elemento decide modoLogico: array de strings -> 'visual' (emojis/iconos repetidos); array de objetos -> 'conceptual' (11 correctos + 1 intruso). No usa getAppContent ni datos hardcodeados propios; solo las particulas de fondo son generadas localmente.

**Integración.** Modos: NO sigue el patron estandar easy/medium/exam con selector previo; ofrece 'modo libre' (practica infinita, sin onGameComplete) y 'examen' (10 rondas) conmutables por botones del HUD a mitad de sesion. Solo el examen reporta: finalizarTest llama onGameComplete con mode:'test', score/maxScore, correctAnswers, totalQuestions, durationSeconds (sin pasar `nota`, que AppRunner/back calcula). No esta registrada como single_mode ni en duelableApps.js (no soporta duelo 1 vs 1; no monta DuelChatBar). El tracking lo gestiona AppRunnerPage via useGameTracker (track_session_start al montar, trackGameSession al completar) aplicando el multiplicador de curso (1.0-2.1) sobre score/maxScore antes de track_student_session/upsert_high_score, y dispara XP/insignias/avatares/ranking via gamification_process_session. Particularidades a vigilar: (1) falta el ref anti-doble-disparo de la seccion 5; (2) la formula de puntos de finalizarTest (timeBonus 300, comboBonus 15/cap200) NO coincide con la que muestra la tarjeta de resultados (aciertos*100 + (120-elapsed)*5 + combo*30), por lo que los puntos en pantalla no son los que se envian al ranking; (3) cambiar de modo a mitad de partida es justo lo que el CLAUDE.md desaconseja (rompe tracking).

**Ideas de mejora.**
- Implementar el useRef anti-doble-disparo obligatorio sobre onGameComplete y disparar tambien la nota parcial en el cleanup si el alumno abandona el examen a medias (como en Anagramas).
- Unificar la formula de puntuacion: la tarjeta de resultados y finalizarTest usan calculos distintos, de modo que los puntos mostrados al alumno no son los que se envian al ranking; deberian coincidir.
- Adoptar el patron estandar de selector previo de dificultad (easy/medium/exam) en lugar de botones que cambian de modo a mitad de partida, evitando reinicios que rompen el conteo; p. ej. graduar tamano de rejilla, tiempo por ronda o introducir 'casi-intrusos' mas dificiles en medium/exam.
- Anadir accesibilidad por teclado (navegacion con flechas + Enter/Espacio) y soporte TTS opcional para leer la categoria, util en Primaria temprana y Atencion a la Diversidad.

### Ficha de usuario

**¿Qué es?** Busca el Intruso es un juego de agudeza visual y vocabulario en el que aparece una cuadricula llena de elementos y tu mision es encontrar el unico que no encaja con los demas. A veces son dibujos o emojis casi identicos en los que hay que detectar el diferente; otras veces son palabras de una misma categoria (por ejemplo, frutas) entre las que se ha colado un intruso. Tocas el elemento que sobra y el juego te dice al instante si has acertado.

**¿Por qué es relevante?** Detectar lo que no encaja es una de las formas mas naturales y potentes de aprender a clasificar y a razonar. La app trabaja la atencion selectiva y la velocidad de procesamiento (hay que fijarse bien y rapido), y, sobre todo, la categorizacion semantica: para saber que palabra sobra, el alumno tiene que entender que tienen en comun las demas. Esto refuerza el vocabulario, los campos semanticos y el razonamiento por exclusion, competencias clave en lengua, en idiomas y en ciencias. Al ofrecer una version con imagenes y otra con conceptos, sirve igual de bien para los mas pequenos y para el alumnado de Atencion a la Diversidad que para discriminacion lexica avanzada en ESO y Bachillerato. El modo libre permite practicar sin presion y el examen pone a prueba lo aprendido con una nota.

**¿Cómo funciona?** El juego carga automaticamente los contenidos del curso y la asignatura. Si son imagenes, llena una cuadricula con el mismo elemento repetido y uno diferente; si son palabras, muestra once de una misma categoria mas un intruso. Tocas la celda que crees que sobra y recibes un aviso inmediato: acierto (con efecto de chispas y racha de combo) o fallo. En modo libre encadenas retos sin fin; en modo examen resuelves diez con cronometro y al final obtienes tu nota sobre 10 y tus puntos.

**Cómo se juega.**
1. Espera a que cargue la cuadricula con los elementos del reto.
2. Observa con atencion: si son dibujos, busca el que es distinto; si son palabras, piensa que categoria comparten casi todas.
3. Toca o haz clic en el unico elemento que no encaja (el intruso).
4. Comprueba el aviso inmediato: acierto (chispas) o fallo, y observa tu contador de combo.
5. En modo libre, pulsa o espera para que aparezca otro intruso y sigue practicando.
6. Cuando quieras una nota, pulsa EXAMEN para empezar las diez rondas con cronometro.
7. Resuelve cada una de las diez preguntas lo mas rapido y certero que puedas.
8. Si la version es de palabras, abre el boton MATERIAL para repasar las categorias y los intrusos antes o despues.
9. Al terminar el examen, revisa tu nota sobre 10, tus puntos y, si quieres, repite para mejorar.

**Modos.**
- **Otro intruso (modo libre)**: Practica sin limite ni nota: se encadenan retos uno tras otro para entrenar a tu ritmo.
- **Examen**: Diez rondas con cronometro; al final obtienes una nota sobre 10, mensaje de animo y puntos.

**Consejos.**
- En la version de palabras, antes de tocar pregúntate que tienen en comun la mayoria: el que rompe esa idea es el intruso.
- Encadena aciertos sin fallar para subir el combo y conseguir mas puntos en el examen.
- Usa primero el modo libre para coger soltura y, cuando te sientas seguro, pasa al examen.
- Si la version es conceptual, repasa el boton MATERIAL para conocer las categorias y sus intrusos.

---

## 🗂️ Clasificador `(clasificador)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Clasificador es una app de categorización de conceptos: muestra una palabra y el alumno elige a cuál de hasta 4 categorías pertenece. Es un componente React único (src/apps/_shared/Clasificador.jsx) sin CSS propio, con todo el estilo resuelto en clases utilitarias de Tailwind y animaciones de framer-motion.

**Software.** Componente funcional único Clasificador.jsx (763 líneas), sin fichero .css asociado (estilado 100% con Tailwind). Librerías: framer-motion (motion/AnimatePresence para transiciones de tarjeta rotateX, shake en fallo, barra de progreso, confeti), lucide-react (iconografía) y el Button de @/components/ui/button. NO usa canvas-confetti (implementa un ConfettiEffect propio con 30 motion.div), NO usa three/@react-three/fiber, NO usa TTS ni el InstructionsModal compartido (en su lugar tiene un modal propio 'Guía de Categorías'/cheat sheet). Estado con useState/useMemo/useCallback/useRef: gameMode ('selection'|'practice'|'test'), allQuestions, categories (hasta MAX_CATEGORIES=4 elegidas al azar), rawGameData, currentIndex, score, streak, highStreak, finished, feedback, examResult. activeQuestions se deriva con useMemo barajando allQuestions y, en examen, cortando a TEST_QUESTION_COUNT=10. Puntuación: en juego, score acumula 10 + bonus de racha (min(streak,5)*2, solo fuera de práctica). Al terminar (effect sobre finished) recalcula puntos de examen: basePoints = aciertos*POINTS_PER_CORRECT(100), timeBonus = round(MAX_SPEED_BONUS=200 * (1 - min(elapsed,120)/120)), streakBonus = min(highStreak*15, MAX_STREAK_BONUS=200); total = suma. Nota /10: Math.round((correctAnswersCount/totalQuestions)*100)/10, con color (>=8 verde, >=5 azul, <5 rojo) y mensajes Excelente/Muy bien/Aprobado/Necesitas repasar. Anti-doble-disparo: trackedRef (useRef) protege onGameComplete dentro del effect de finished y se resetea cuando finished vuelve a false. gameStartRef marca el inicio del examen para medir elapsed. Hay un skipTimeout (setTimeout 1200ms acierto / 2500ms fallo) gestionado para avanzar y limpiado en restart/handleNextWord.

**Jugabilidad.** Bucle: pantalla de selección (Práctica / Examen / Guía de Categorías) → tarjeta central con una palabra y la pregunta '¿A qué categoría pertenece?' + grid de hasta 4 botones de categoría temáticos (violet/pink/sky/orange) → el alumno pulsa una categoría → feedback inmediato (borde verde + check y +puntos, o borde rojo + shake, tachado de la palabra y revelado de la categoría correcta con bombilla) → avance automático tras un timeout. Controles: solo ratón/táctil (clic en botones); no hay atajos de teclado. Indicadores en cabecera: racha en llama (x hasta 5), puntos y, en examen, contador de pregunta y barra de progreso indigo-púrpura. En práctica hay botón Saltar (skipWord, rompe racha) y acceso directo a Examen; en examen hay Reiniciar y volver a Práctica. Sin vidas ni game over: la partida termina al agotar las preguntas (todas en práctica, 10 en examen). Feedback final con trofeo, nota/10 (solo examen), desglose Base/Velocidad/Racha y confeti si nota>=9 (examen) o ratio de puntos >=0.9 (práctica).

**Educativo.** Objetivo pedagógico: consolidar la categorización y clasificación semántica de vocabulario y conceptos, una destreza transversal de organización del conocimiento (agrupar por campo semántico, tipo o propiedad). Entrena reconocimiento rápido, memoria de trabajo (recordar a qué grupo pertenece cada término) y atención sostenida. El modal 'Guía de Categorías' permite estudiar previamente todos los grupos y sus palabras, reforzando el aprendizaje antes de la evaluación. Encaje curricular: app común disponible en Primaria, ESO, Bachillerato y Atención a la Diversidad; especialmente útil en lengua/vocabulario, ciencias y cualquier materia con taxonomías. En AD aparece en bloques como vocabulario, funciones-ejecutivas, razonamiento y autonomía (datos remapeados a Primaria 1º-3º).

**Datos.** El contenido procede de getRunnerData(level, grade, subjectId) de src/services/gameDataService.js, que invoca la RPC Supabase get_runner_data y devuelve un objeto { categoria: [palabras...] } (mismo formato que usan Runner, Memoria, Lluvia, Excavación, Snake, Torre). El componente filtra las claves 'title' e 'instructions', baraja las categorías y selecciona hasta 4 (MAX_CATEGORIES), construyendo las preguntas como { word, category }. Para Atención a la Diversidad (level='ad'), resolveADParams remapea la asignatura a una fuente real de Primaria (p. ej. vocabulario→Primaria 3º lengua). Hay caché en memoria de 5 min por (nivel, curso, asignatura) en el propio servicio. No usa datos propios embebidos ni getAppContent.

**Integración.** Modos: NO sigue el patrón estándar easy/medium/exam; es una de las excepciones tipo Sopa/Crucigrama con dos modos en pantalla previa — Práctica (mode 'practice') y Examen (mode 'test', 10 preguntas, requiere >=10 items o el botón se deshabilita). NO está registrada como single_mode ni en duelableApps.js, por lo que no cuenta todas las partidas para tareas ni admite duelo 1 vs 1. Tracking: AppRunnerPage monta la app y pasa onGameComplete; useGameTracker crea la sesión al montar (track_session_start) y la cierra con track_session_finish, consumiendo el session_id para que cada ronda sea fila propia. Particularidad relevante: en práctica el componente envía score:0 y maxScore:0 a onGameComplete, de modo que la sesión de práctica no aporta high score ni ranking (solo el examen, con score=total y maxScore=totalQuestions*100+200+200, alimenta upsert_high_score y get_app_ranking). La nota /10 viaja por correctAnswers/totalQuestions; no se pasa override de nota. Gamificación (XP, insignias, avatares) se dispara desde gamification_process_session al completar.

**Ideas de mejora.**
- Añadir lectura por voz (TTS con SpeechSynthesis) de la palabra mostrada para reforzar la asociación oído-significado, especialmente valioso en el bloque AD de conciencia fonológica y lectoescritura.
- Introducir un tercer nivel de dificultad real (p. ej. 'difícil' con más de 4 categorías visibles o con tiempo por pregunta) para alinearse mejor con el patrón easy/medium/exam y aumentar el techo de reto.
- Soportar control por teclado (teclas 1-4 para elegir categoría) para mejorar accesibilidad y la velocidad en el modo examen, hoy solo jugable con ratón/táctil.
- Sustituir el ConfettiEffect manual por canvas-confetti (ya usado en otras apps) para unificar el feedback celebrativo y reducir coste de render con muchos motion.div.

### Ficha de usuario

**¿Qué es?** Clasificador es un juego educativo en el que aparece una palabra o concepto en el centro de la pantalla y el alumno debe decidir a cuál de hasta cuatro categorías pertenece. Por ejemplo, colocar 'manzana' en 'Frutas' o 'tiburón' en 'Animales marinos'. Acierto tras acierto, suma puntos y encadena rachas. Es una actividad rápida, visual y muy adaptable: las categorías y las palabras dependen de la asignatura y el curso, así que sirve para repasar vocabulario, clasificaciones de ciencias o cualquier contenido organizado en grupos.

**¿Por qué es relevante?** Clasificar es una de las destrezas cognitivas más importantes del aprendizaje: agrupar la información en categorías ayuda a comprenderla, recordarla y relacionarla. Esta app entrena precisamente esa capacidad de organizar el conocimiento, además de la memoria de trabajo (recordar a qué grupo pertenece cada término), la atención y la velocidad de reconocimiento. El feedback es inmediato: cuando el alumno se equivoca, ve al instante cuál era la categoría correcta, lo que convierte cada error en una oportunidad de aprendizaje. La 'Guía de Categorías' permite estudiar antes de jugar, favoreciendo el repaso activo. Al adaptarse a cada materia y nivel (Primaria, ESO, Bachillerato y Atención a la Diversidad), refuerza el vocabulario específico de la asignatura de forma lúdica y motivadora, sin la presión de un examen tradicional.

**¿Cómo funciona?** Al entrar se elige entre Práctica (sin tiempo ni presión, para aprender) y Examen (diez preguntas que cuentan para la nota). El juego muestra una palabra y varios botones de categoría de colores; el alumno pulsa la que cree correcta y recibe respuesta al momento, con animaciones, sonido visual de acierto o error y rachas que multiplican la motivación. En el modo Examen, al terminar se calcula una nota sobre 10 con un desglose de puntos por aciertos, velocidad y racha, además de confeti si el resultado es sobresaliente.

**Cómo se juega.**
1. Pulsa 'Guía de Categorías' para repasar primero todos los grupos y sus palabras (opcional pero recomendable).
2. Elige el modo: 'Práctica' para entrenar sin presión o 'Examen' para que cuente la nota.
3. Lee la palabra que aparece en el centro de la tarjeta.
4. Observa los botones de categoría de colores que hay debajo.
5. Pulsa la categoría a la que creas que pertenece la palabra.
6. Comprueba el resultado: verde si aciertas, rojo si fallas (y verás cuál era la correcta).
7. Encadena aciertos seguidos para activar la racha y ganar más puntos.
8. En el modo Examen, completa las diez preguntas para ver tu nota sobre 10 y el desglose de puntos.
9. Pulsa 'Jugar de nuevo' para repetir o 'Cambiar modo / Inicio' para volver al menú.

**Modos.**
- **Práctica**: Sin tiempo ni presión y con la opción de saltar palabras. Ideal para aprender y repasar; no influye en la nota de las tareas.
- **Examen**: Diez preguntas aleatorias que sí cuentan para la nota. Al terminar muestra la calificación sobre 10 y un desglose de puntos por aciertos, velocidad y racha. Requiere al menos diez preguntas disponibles.

**Consejos.**
- Repasa la 'Guía de Categorías' antes de hacer el examen: ver todas las palabras agrupadas ayuda a memorizar.
- Practica primero en el modo Práctica hasta sentirte seguro y luego pasa al Examen.
- Intenta no romper la racha: responder seguido y con acierto suma puntos extra.
- En el examen, equilibra rapidez y acierto: la velocidad da bonus, pero fallar rompe la racha.

---

## 🧠 Juego de Memoria `(juego-memoria)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de memoria espacial sobre una rejilla de cartas con vocabulario educativo: el alumno memoriza la posición de las palabras durante 5 segundos y luego debe destaparlas en el orden pedido contra reloj. Componente React autocontenido (JuegoMemoria.jsx) con estado local mediante useState/useEffect/useRef, framer-motion para los modales y canvas-confetti para la victoria.

**Software.** Componente único 'src/apps/juego-memoria/JuegoMemoria.jsx' con su CSS asociado; no usa el componente '_shared/MemoryMatchGame.jsx' (este es un emparejador de parejas independiente, no importado por esta app). Librerías: framer-motion (AnimatePresence + motion.div para overlays de resultado, ajustes y ayuda), canvas-confetti (200 partículas al ganar). Sin three/r3f, sin TTS, sin lucide-react. Gestión de estado: ~15 useState (words, targetOrder, currentIndex, gameState como máquina de estados 'loading|memorize|playing|shaking|won|lost', timeLeft, memorizeTimeLeft, revealedIndex, correctIndices como Set, errorIndex, errorCountdown y config gridSize/gameTime/errorWaitTime/isRandomOrder). Dos timers via setInterval: memorización (1000ms, decrementa de 5 a 0) y juego (100ms, decrementa timeLeft en 0,1s con precisión decimal). Puntuación: basePoints = correctIndices.size·100, timeBonus = ganar ? round(300·(timeLeft/GAME_TIME)) : 0; totalPoints = base+bonus; maxScore = gridSize·100 + 300. Nota /10 en el summary: ganar fija nota=10, perder calcula round((correctIndices.size/GRID_SIZE)·100)/10 — OJO: usa la constante GRID_SIZE=9 fija, no el gridSize dinámico, por lo que con 6 o 12 cajas la nota de derrota queda mal escalada (con 12 puede pasar de 10, con 6 nunca llega a 10). Colores de nota: >=8 verde, >=5 azul, <5 rojo, con mensajes Excelente/Muy bien/Aprobado/Necesitas repasar. Anti-doble-disparo: trackedRef (useRef) que se pone a true al primer disparo de onGameComplete y se rearma al volver a 'memorize'/'playing'; timerRef para limpiar el interval del juego.

**Jugabilidad.** Bucle: cargar palabras -> fase de memorización (5s con todas las cartas boca arriba y rejilla en clase 'memorizing') -> fase de juego (cartas boca abajo numeradas, se muestra la palabra objetivo 'ENCUENTRA:' y el alumno debe pulsar la carta correcta). Controles: ratón/táctil (clic en carta) y teclado (números 1-9 y letras a/b/c para las cajas 10-12). Acierto: la carta queda revelada 800ms y se fija como 'correct', avanza al siguiente objetivo. Error: la carta se marca en rojo con cuenta atrás (errorWaitTime 1-3s) y se PENALIZA reiniciando todo el progreso (correctIndices a vacío, currentIndex a 0); en modo Aleatorio además se rebaraja el orden objetivo. Victoria: destapar las gridSize cartas antes de agotar el tiempo (confeti + modal). Derrota: se agota timeLeft (modal 'Tiempo agotado'). Feedback: confeti al ganar, shake al pedir nueva partida, parpadeo en la fase de memorizar, contador visual de error. No hay sonidos/TTS.

**Educativo.** Objetivo pedagógico: memoria de trabajo y memoria espacial aplicadas a vocabulario curricular. Entrena retención visoespacial (recordar qué palabra está en cada posición), atención sostenida bajo presión temporal y reconocimiento léxico. El contenido es vocabulario real por categorías de la asignatura, así que refuerza de paso el léxico específico de la materia. Encaje curricular: registrada en Primaria, ESO y Bachillerato (heredada por asignaturas); aparece en lengua, inglés, valenciano, ciencias sociales, etc. Por defecto level='eso', grade=1, subjectId='biologia'.

**Datos.** Fuente: getRunnerData(level, grade, subjectId) de 'src/services/gameDataService.js', que invoca la RPC get_runner_data y devuelve un objeto {categoria: [palabras]}. La app elige al azar una categoría que tenga al menos gridSize palabras (si ninguna llega, concatena todas bajo 'General'), deduplica con Set, baraja (Fisher-Yates) y toma las primeras gridSize. No usa getAppContent ni datos propios embebidos. Hay una constante FIXED_SEQUENCE marcada como LEGACY-NOT USED.

**Integración.** No usa la pantalla previa estándar de selección easy/medium/exam; en su lugar tiene un modal de Configuración propio (nº de cajas 6/9/12, tiempo 40/60/80s, espera de error 1/2/3s y modo de orden Fijo/Aleatorio). Siempre reporta mode:'test' en onGameComplete, por lo que toda partida cuenta como intento de examen/tarea (se comporta de facto como single_mode aunque su config no esté necesariamente registrada como tal). El tracking real (XP, insignias, ranking, avatares) lo gestiona el wrapper AppRunnerPage vía onGameComplete -> useGameTracker/gamification_process_session; el componente no importa useGameTracker directamente. No está registrada en duelableApps.js (sin duelo 1 vs 1). Para el ranking solo envía score y maxScore; AppRunnerPage aplica el multiplicador de curso. Particularidades a vigilar: (1) la nota de derrota usa GRID_SIZE=9 fijo en vez de gridSize, bug de escalado con 6/12 cajas; (2) maxScore varía con la config del alumno (gridSize·100+300), lo que hace comparables-pero-no-idénticos los topes entre partidas; (3) no hay InstructionsModal compartido ni botón de material de estudio (usa su propio modal de Ayuda); (4) el penalty de reinicio total puede ser muy frustrante con 12 cajas.

**Ideas de mejora.**
- Corregir el cálculo de la nota de derrota para usar el gridSize dinámico en lugar de la constante GRID_SIZE=9, evitando notas mal escaladas (e.g. con 12 cajas se puede superar 10 y con 6 nunca se llega a 10).
- Sustituir la penalización de reinicio total del progreso por una más graduada (p. ej. perder solo la racha actual o N posiciones) para reducir frustración, sobre todo con 12 cajas; opción de 'vidas' configurable.
- Añadir TTS / lectura en voz de la palabra objetivo (útil en inglés/valenciano y en atención a la diversidad) y un botón de 'Material de estudio' con las palabras de la categoría agrupadas, alineando la app con el patrón de InstructionsModal compartido.
- Alinear los modos con el estándar de la plataforma (pantalla previa fácil/medio/examen mapeada a las configuraciones actuales) y registrar formalmente la app como single_mode en app_scoring_config; opcionalmente crear un JuegoMemoriaDuel para soportar duelo 1 vs 1.

### Ficha de usuario

**¿Qué es?** Juego de Memoria es una actividad de memoria visual con vocabulario de la asignatura. Sobre un tablero de cartas, el alumno dispone de unos segundos para memorizar dónde está cada palabra y, después, debe destaparlas en el orden que se le va pidiendo antes de que se agote el tiempo. Cada partida usa palabras reales de una categoría del temario (por ejemplo, términos de ciencias, de inglés o de valenciano), así que mientras se ejercita la memoria también se repasa el vocabulario.

**¿Por qué es relevante?** Esta app trabaja una competencia clave para aprender: la memoria de trabajo y la memoria espacial, es decir, la capacidad de retener información y recordar dónde está colocada. Recordar la posición de cada palabra obliga a concentrarse, crear referencias visuales y mantener la atención bajo una ligera presión de tiempo, algo que se transfiere al estudio diario. Al construirse sobre vocabulario del temario, refuerza además el reconocimiento de términos específicos de la materia. El formato de juego, con su penalización por error y su recompensa al completar el tablero, fomenta la concentración y la paciencia, y convierte la repetición del léxico en un reto motivador en lugar de una tarea memorística aburrida. Es útil en idiomas, ciencias y áreas con vocabulario propio.

**¿Cómo funciona?** Al empezar, todas las cartas se muestran boca arriba durante 5 segundos para memorizar dónde está cada palabra. Después se ponen boca abajo y aparece una palabra objetivo: hay que pulsar la carta donde estaba esa palabra. Si se acierta, la carta queda descubierta y se pide la siguiente; si se falla, la carta se marca en rojo, hay que esperar unos segundos y el progreso se reinicia. Se gana al destapar todas las cartas antes de que termine el tiempo.

**Cómo se juega.**
1. Espera a que el tablero muestre todas las palabras y memoriza durante 5 segundos en qué posición está cada una.
2. Cuando las cartas se pongan boca abajo, lee la palabra que aparece en 'ENCUENTRA:' arriba.
3. Pulsa (con el ratón o el dedo) la carta donde crees que estaba esa palabra; también puedes usar los números 1-9 del teclado y las letras a, b, c para las cajas 10, 11 y 12.
4. Si aciertas, la carta queda descubierta y se te pedirá la siguiente palabra.
5. Si fallas, la carta se marcará en rojo, deberás esperar unos segundos y tu progreso se reiniciará: vuelve a empezar con cuidado.
6. Sigue destapando palabras hasta completar todo el tablero antes de que se acabe el tiempo.
7. Si completas todas las cartas a tiempo, ¡ganas y recibes tu nota y tus puntos!
8. Pulsa el botón de Configuración (engranaje) para ajustar el nº de cajas, el tiempo y la dificultad antes de una nueva partida.

**Modos.**
- **Número de cajas**: Elige entre 6, 9 o 12 cartas: cuantas más cartas, más difícil es recordar todas las posiciones.
- **Tiempo de juego**: Ajusta la duración de la partida a 40, 60 u 80 segundos según el reto que quieras.
- **Tiempo de espera por error**: Define la penalización de tiempo (1, 2 o 3 segundos) cada vez que fallas una carta.
- **Orden Fijo**: El orden de las palabras a buscar se genera al azar al inicio pero se mantiene durante toda la partida; si fallas, sigues buscando la misma palabra.
- **Orden Aleatorio**: El orden de las palabras se reorganiza cada vez que cometes un error, cambiando la siguiente palabra a encontrar y aumentando la dificultad.

**Consejos.**
- Durante los 5 segundos de memorización, fíjate primero en las palabras más raras o largas y asóciala a su posición (esquinas, centro, fila).
- Como un fallo reinicia todo el progreso, mejor pensar un segundo antes de pulsar que arriesgar a lo loco.
- Empieza con 6 cajas y tiempo amplio para coger soltura, y ve subiendo a 9 y 12 cartas cuando domines.
- Usa el teclado numérico para ir más rápido cuando ya tengas memorizadas las posiciones.

---

## 🟨 Education Dash `(runner)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Endless runner de plataformas con estética Geometry Dash construido como componente compartido (src/apps/_shared/Runner.jsx). El cubo corre por un escenario neón saltando obstáculos y debe atrapar solo las palabras que pertenecen a la categoría/misión activa, esquivando las que no. El bucle de juego es un requestAnimationFrame con física propia (gravedad, salto, colisiones AABB) gobernado por refs para evitar re-renders, y un único setTick fuerza el repintado de React.

**Software.** Componente único Runner.jsx (sin CSS-in-JS; estilos en Runner.css para partículas de derrape/skid y scrollbars). UI con primitivas propias del design system (@/components/ui/button, card, slider), iconos lucide-react (RotateCcw, Shuffle, Star, BookOpen, Eye/EyeOff, ListChecks, X) y framer-motion (motion + AnimatePresence) solo para el modal 'Guía de misiones'. El confeti de Game Over se monta vía <ConfettiProvider /> (wrapper de _shared, no canvas-confetti directo). NO usa three/@react-three/fiber ni TTS. Gestión de estado: el estado de React mínimo (gameState start/playing/gameover, score, targetType, gameData, isInvincible) y TODA la simulación vive en useRef (playerRef con x/y/velocityY/isJumping/onPlatform, entitiesRef, explosionsRef, rotationRef, collectedWordsRef, speedRef/gravityRef/jumpForceRef, invincibleUntilRef, distanceTraveledRef, lastTimeRef). El gameLoop usa delta-time (timeScale = deltaTime/16.67) para independizar la física del framerate y descarta frames con deltaTime>100ms (cambio de pestaña). Colisiones: helper checkAABB; los pinchos usan una hitbox reducida (25%-50% del ancho, 60% de alto) para ser indulgentes. Spawn por distancia recorrida (BASE_SPAWN_DISTANCE=600) con 6 patrones ponderados (pinchos 25%, plataforma baja 20%, alta+pincho 20%, ítem flotante 15%, encadenadas 15%, estrella 5%). Puntuación: SCORE = nº de palabras correctas recogidas (setScore +1 por acierto), sin tope. Nota /10 en examen: Runner NO calcula la nota; pasa correctAnswers=wordsCollected y totalQuestions=EXAM_TARGET(10) y delega el cómputo en useGameTracker.calculateNota (ratio·10, cap 10), de modo que 10 palabras correctas = 10. En examen añade un timeBonus al score (presupuesto 5s/palabra, TIME_BUDGET=50s, SPEED_COEF=5) que solo aplica si wordsCollected>=10; el score crece sin límite para el ranking. Anti-doble-disparo: NO hay useRef flag dedicado; la protección es que gameOver() pone isPlayingRef.current=false y cancela el rAF, y cada rama de colisión que llama a gameOver() ejecuta 'return' inmediatamente, por lo que dentro de un mismo frame solo se dispara una vez. onGameComplete se invoca solo en gameOver (única salida del juego).

**Jugabilidad.** Bucle infinito de auto-scroll: el cubo avanza solo y el jugador solo controla el salto (un salto, sin doble salto; rota 90º por salto para el efecto Geometry Dash). Controles: ratón (mousedown en el tablero), táctil (touchstart en el tablero + botón gigante SALTAR fijo en móvil) y teclado (Espacio o Flecha Arriba). Antes de jugar: pantalla de menú para elegir personaje (Clásico amarillo, Neon cian, Dark púrpura), cambiar de misión/categoría (Shuffle o botón), ver la 'Guía de palabras' (cheat sheet con todas las categorías y sus términos) y, en Ajustes avanzados, regular velocidad (2-16, default 8) y gravedad (0,5-2,0, default 1). Misión: una categoría activa; hay que recoger SOLO las palabras de esa categoría. Pickups de estrella (★) dan 10 s de invencibilidad que permite destruir pinchos y palabras erróneas con explosión en vez de morir (HUD muestra cuenta atrás). Derrota inmediata: chocar con un pincho o recoger una palabra de otra categoría sin invencibilidad. No hay condición de victoria explícita (endless): se juega hasta morir; el 'objetivo' pedagógico interno son 10 palabras = nota 10. En la pantalla de Game Over se listan todas las palabras recogidas y se lanza confeti. Feedback visual: glow neón, partículas de derrape al tocar suelo, animación de explosión (ping naranja), HUD de SCORE y de misión pulsante.

**Educativo.** Refuerza vocabulario y categorización semántica: el alumno debe decidir en tiempo real si cada palabra pertenece o no a la categoría-misión, entrenando reconocimiento léxico, atención selectiva, velocidad de procesamiento y control inhibitorio (frenar el impulso de coger todo). Las ayudas (showHints) colorean en verde/rojo los ítems según pertenezcan a la misión, haciendo el modo práctica más guiado. Encaje curricular amplio porque consume los mismos sets categoría→palabras que el resto de apps de vocabulario: aparece en Primaria (1º-6º, principalmente Lengua e idiomas), ESO (1º-4º, heredada en asignaturas con datos runner) y Bachillerato. También está mapeada en Atención a la Diversidad (adApps: vocabulario, atención, funciones-ejecutivas), donde el nivel 'ad' redirige a contenidos de Primaria 1º-3º vía AD_SUBJECT_MAP.

**Datos.** Contenido 100% dinámico desde Supabase mediante getRunnerData(level, grade, subjectId) de gameDataService.js, que llama a la RPC get_runner_data y devuelve un objeto { categoria: [palabras...] } (mismo formato que comparten Memoria, Clasificador, Lluvia, Snake, Excavación, Torre). Datos cacheados 5 min en memoria (deepParseJSON normaliza JSONB anidado). Las claves 'title' e 'instructions' se filtran en la cheat sheet. Para nivel 'ad' se resuelve con AD_SUBJECT_MAP a Primaria. No hay datos hardcodeados de contenido en el componente (solo CHARACTERS y patrones de spawn). Si la RPC no devuelve datos, muestra 'Error de datos / No se encontró {subjectId}-runner.json'.

**Integración.** Registrada como appRunner (id:'runner') en commonApps.js (lazy import de _shared/Runner) y añadida a primariaApps, esoApps, bachilleratoApps y adApps. Modos: NO sigue el patrón estándar de selección previa de 3 niveles; en su lugar hay un toggle inline 'Examen: SÍ/NO' (botón showHints). Hints ON => práctica (mode='practice', ítems coloreados, no cuenta para tareas); hints OFF => examen (mode='test', ítems neutros, cuenta para tareas y activa el timeBonus). Velocidad y gravedad son ajustes libres que afectan dificultad pero no el modo. NO es single_mode, NO es duelable (no figura en duelableApps ni tiene componente Duel). Tracking: el componente NO usa useGameTracker directamente; recibe onGameComplete desde AppRunnerPage, que envuelve trackGameSession (sesión iniciada al montar con track_session_start, finalizada con track_session_finish, fila por partida). AppRunnerPage aplica el multiplicador de curso (1.0-2.1) a score/maxScore antes de persistir y dispara XP/insignias/avatares vía gamification_process_session y el ranking vía upsert_high_score. Particularidades a tener en cuenta: (1) maxScore se fija a Math.max(finalScore,1000), un valor arbitrario que distorsiona cualquier ratio score/maxScore (irrelevante porque la nota se deriva de correct/total, pero a vigilar). (2) El 'modo examen' depende de un toggle que el alumno puede dejar en práctica, evitando que la partida cuente para tareas; no hay forzado de examen. (3) No hay InstructionsModal/InstructionsButton ni botón estándar de 'material de estudio' (la cheat sheet cumple ese rol de forma propia). (4) durationSeconds se mide desde gameStartRef. (5) No hay guard ref explícito anti-doble onGameComplete.

**Ideas de mejora.**
- Migrar al patrón de modos estándar de la plataforma (pantalla previa fácil/medio/examen) o, al menos, hacer que 'examen' sea un modo explícito y no un toggle que el alumno puede desactivar, para garantizar que las partidas cuenten correctamente como intento de tarea.
- Mostrar la nota /10 y el mensaje cualitativo (Excelente/Muy bien/Aprobado/Necesitas repasar) en la pantalla de Game Over del modo examen, hoy ausente: el alumno solo ve 'puntos' y la nota se calcula silenciosamente en el tracker.
- Convertir Education Dash en app duelable 1 vs 1 (RunnerDuel.jsx + duelableApps + DuelChatBar) usando seed determinista de spawns para que ambos jugadores afronten el mismo recorrido y comparen palabras correctas/tiempo.
- Añadir feedback sonoro y/o accesibilidad (TTS de la palabra al aproximarse, indicador de error más claro), y revisar el maxScore=1000 arbitrario para que el high_score y el ranking reflejen mejor el rendimiento real.

### Ficha de usuario

**¿Qué es?** Education Dash es un juego de correr y saltar al estilo Geometry Dash con un toque educativo. Controlas un cubo que avanza sin parar por un escenario neón lleno de obstáculos: pinchos que esquivar, plataformas a las que subir y palabras que van apareciendo. Tu misión es atrapar únicamente las palabras que pertenecen a la categoría indicada (por ejemplo, 'animales' o 'verbos') y evitar las que no encajan. Cada acierto suma puntos y, al final, ves la lista de todas las palabras que has recogido.

**¿Por qué es relevante?** Combina la motivación de un videojuego de habilidad con un objetivo de aprendizaje muy concreto: clasificar vocabulario por categorías a toda velocidad. Para acertar, el alumnado tiene que reconocer el significado de cada palabra y decidir en una fracción de segundo si pertenece o no a la misión, lo que entrena el vocabulario, la categorización semántica, la atención selectiva y el autocontrol (resistir el impulso de coger todo lo que aparece). Al ser un juego rápido y con reintentos inmediatos, favorece la práctica repetida sin que resulte aburrida, ideal para afianzar léxico. Funciona porque transforma una tarea de discriminación de palabras, que en papel sería monótona, en un reto de reflejos donde equivocarse tiene consecuencias inmediatas y acertar se celebra con puntos y confeti.

**¿Cómo funciona?** El cubo corre solo; tú solo decides cuándo saltar. Primero eliges personaje y, si quieres, ajustas velocidad y gravedad. Aparece una categoría-misión y debes saltar para atrapar solo las palabras de esa categoría, esquivando los pinchos y evitando las palabras que no encajan: tocar un pincho o coger una palabra equivocada termina la partida. De vez en cuando aparece una estrella que te da 10 segundos de invencibilidad para destruir obstáculos. Al final ves tus puntos y todas las palabras recogidas.

**Cómo se juega.**
1. En el menú, elige tu personaje (Clásico, Neon o Dark) y, si lo deseas, abre 'Guía de palabras' para repasar las categorías y sus términos.
2. Comprueba cuál es tu misión (la categoría indicada). Pulsa el icono de mezclar para cambiarla si quieres practicar otra.
3. Decide el modo con el botón 'Examen: SÍ/NO': con 'Examen: NO' las palabras correctas se pintan de verde como ayuda; con 'Examen: SÍ' se ocultan las pistas y la partida cuenta para tus tareas.
4. Si quieres, abre 'Ajustes avanzados' para regular la velocidad y la gravedad a tu gusto.
5. Pulsa JUGAR. Para saltar, haz clic o toca la pantalla, usa la barra espaciadora o la flecha arriba (en móvil tienes el botón gigante SALTAR).
6. Salta para atrapar SOLO las palabras de tu categoría y para superar los pinchos y subir a las plataformas.
7. No toques los pinchos ni cojas palabras de otras categorías: cualquiera de las dos cosas acaba la partida.
8. Si recoges una estrella, aprovecha los 10 segundos de invencibilidad para arrasar con los obstáculos sin riesgo.
9. Al terminar, revisa tus puntos y la lista de palabras recogidas, y pulsa MENÚ para volver a intentarlo.

**Modos.**
- **Práctica (Examen: NO)**: Las palabras de tu categoría se resaltan en verde y las erróneas en rojo como ayuda. Ideal para aprender; no cuenta para las tareas.
- **Examen (Examen: SÍ)**: Sin pistas de color: tú decides qué palabra coger. Cuenta para las tareas y da una nota; recoger 10 palabras correctas equivale a un 10, con bonus extra por rapidez.

**Consejos.**
- Antes de empezar en serio, abre la 'Guía de palabras' para tener claras las categorías y sus términos.
- Si vas justo de reflejos, baja la velocidad y ajusta la gravedad en 'Ajustes avanzados' hasta encontrar tu punto.
- Prioriza esquivar: es mejor dejar pasar una palabra dudosa que arriesgarte a coger la equivocada y perder.
- Guarda la invencibilidad de la estrella para los tramos con más pinchos y palabras trampa.

---

## 🚀 Nave Palabras `(nave-palabras)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Arcade tipo space-shooter en 2D donde el alumno pilota una nave durante 60 segundos y dispara únicamente a las palabras que pertenecen a la categoría objetivo. Está hecho en React puro con un bucle de juego propio sobre requestAnimationFrame (independiente del framerate vía deltaTime), render imperativo mediante refs y forceRender, y con SVG dibujados a mano para las naves; incluye además una versión de duelo 1 vs 1 (NavePalabrasDuel.jsx) host-autoritativa sobre canal de tiempo real de Supabase.

**Software.** Dos componentes en src/apps/nave-palabras/: NavePalabras.jsx (modo solo) y NavePalabrasDuel.jsx (duelo arena), compartiendo NavePalabras.css y el subcomponente exportado Ship (SVG paramétrico con gradiente por nave). Librerías: framer-motion (AnimatePresence para el flash de fallo, banner de controles invertidos, modales y cuenta atrás), lucide-react (Play, Rocket, Target, Trophy, Swords, Skull, Zap, etc.) y el Button propio de @/components/ui/button. NO usa canvas-confetti, NO usa three/@react-three/fiber ni TTS: todo es DOM posicionado en absoluto dentro de un viewport fijo 800x520 escalado por aspect-ratio. Gestión de estado: híbrida. El estado 'lento' de UI vive en useState (phase menu|playing|over, score, hits, misses, timeLeftMs, activePowers, penaltyLevel, combo, missFlashKey); el estado 'caliente' del bucle vive en refs mutables (shipXRef, wordsRef, projsRef, lastSpawnRef, lastFireRef, keysRef, powersRef, hitsRef/missesRef/scoreRef, penaltyRef, comboRef, modeRef) y se repinta cada frame con un tick() vacío (forceRender). El bucle (useEffect dependiente de phase/targetCat) calcula dt capado a 100ms, mueve nave/proyectiles/palabras en px/seg, gestiona spawn (BASE_SPAWN_MS=650, 8% de probabilidad de bloque especial), cadencia de disparo (BASE_FIRE_MS=260 modulado por modo, power 'rapid' y penalización) y resuelve colisiones AABB proyectil-palabra. Puntuación (scoreRef): +10 por palabra de la categoría objetivo (x2 con power 'double'), +5 por power benigno, 0 por bloque trampa 'invert', -2 y registro de fallo si aciertas a palabra de otra categoría; dejar caer una palabra objetivo al suelo (FLOOR_Y) también cuenta como fallo. Nota /10 en la pantalla final: notaNum = Math.min(10, hits) (cada acierto vale un punto, tope 10), con color verde/azul/rojo y mensaje Excelente/Muy bien/Aprobado/Necesitas repasar. Anti-doble-disparo: completedRef (useRef) protege endGame para que onGameComplete se llame una sola vez; en el duelo el equivalente es reportedRef. Sistema de penalización/combo: hasta 3 niveles de penalización (PENALTY_FIRE [1, 1.6, 2.2, 3.0]) que SOLO encarecen la cadencia de disparo (nunca la velocidad de la nave, que es fija para todos); se recupera un nivel cada 5 aciertos seguidos (COMBO_TO_RECOVER).

**Jugabilidad.** Bucle: durante 60s caen palabras desde arriba con velocidad aleatoria (72-144 px/s) y hay sesgo hacia la categoría objetivo (75% fácil, 60% medio, 50% examen) para que aparezcan suficientes objetivos válidos. El alumno mueve la nave y dispara hacia arriba; debe acertar solo a las palabras de la categoría objetivo, evitar las de ruido y aprovechar bloques especiales (⚡ disparo rápido, 🌧️ lluvia de palabras, ✨ puntos x2, ⚠️ trampa que invierte tus controles 5s y no da puntos). Controles: ratón/táctil (mover = posición de la nave, pulsar = disparar) y teclado (flechas o A/D para mover; Espacio, flecha arriba o W para disparar); botón flotante 'DISPARAR' en móvil. Tres dificultades elegidas en pantalla previa (Fácil: pistas marcadas y disparo un 30% más ágil; Medio: pistas de color en las palabras objetivo; Examen: sin pistas y cuenta para tareas). No hay vidas ni condición de derrota explícita: la partida termina por tiempo (remaining<=0 → endGame). Feedback: HUD con cronómetro, aciertos, puntos, categoría objetivo y medidor de cadencia (3 rayos); flash rojo de pantalla + texto '¡FALLO!' animado al fallar; banner de controles invertidos; badges de powers activos con cuenta atrás. No hay confeti ni sonido. El selector permite además elegir entre 5 diseños de nave (Clásica, Interceptor, Bombardero, Sigilo, Rayo) y consultar un modal con todas las palabras válidas por categoría.

**Educativo.** Objetivo pedagógico: reforzar la categorización léxica y el reconocimiento rápido de vocabulario, obligando al alumno a discriminar bajo presión de tiempo qué palabras pertenecen a una categoría semántica concreta (la 'categoría objetivo') frente a distractores de otras categorías. Entrena atención selectiva, velocidad de procesamiento, control inhibitorio (no disparar al ruido), memoria de trabajo y coordinación visomotora. El modal 'Guía de palabras' refuerza el aprendizaje explícito del vocabulario por categorías. Encaje curricular: al consumir getRunnerData (datos por nivel/curso/asignatura) sirve para Lengua, idiomas, ciencias y cualquier materia con vocabulario clasificable. Disponibilidad confirmada en la configuración: aparece en Primaria, ESO y Bachillerato (registrada en esoApps.js y bachilleratoApps.js/appsBase) y, vía el mapeo AD de gameDataService, también es jugable en Atención a la Diversidad redirigiendo a contenido de Primaria.

**Datos.** El contenido procede de getRunnerData(level, grade, subjectId) de src/services/gameDataService.js, que llama a la RPC get_runner_data de Supabase y devuelve un objeto { categoria: [palabras...] } (mismo formato que usan Runner, Memoria, Clasificador, Lluvia, Excavación, Snake y Torre). El componente filtra las claves 'title' e 'instructions', toma las restantes como categorías y elige una al azar como objetivo (cambiable con el botón Shuffle). No tiene datos propios embebidos salvo el catálogo de 4 powerups (POWERS) y los 5 diseños SVG de nave (SHIPS). Para el nivel 'ad' (Atención a la Diversidad) resolveADParams reescribe nivel/curso/asignatura hacia datos reales de Primaria. La capa de servicio cachea en memoria 5 minutos y hace deepParseJSON del JSONB devuelto.

**Integración.** Modos de dificultad: easy/medium/exam en pantalla de selección previa (no tabs en juego). En endGame se reporta mode 'test' si es examen (cuenta para tareas) o 'practice' si es fácil/medio; NO es single_mode. onGameComplete envía { mode, score, maxScore: max(score,500), correctAnswers: hits, totalQuestions: 10, durationSeconds: 60 }, por lo que la nota la deriva AppRunnerPage como aciertos/10·10 (la app no pasa override 'nota', pero su nota visual local usa min(10,hits), equivalente). Tracking de sesión: lo gestiona AppRunnerPage/useGameTracker; el componente solo dispara onGameComplete una vez (protegido por completedRef). Ranking: automático a partir de score/maxScore. Duelo 1 vs 1: registrado como duelable en commonApps (duel: { supported:true, bestOf:1, mode:'arena' }) y mapeado en duelComponents.js a NavePalabrasDuel; NO aparece en duelableApps.js (la integración del duelo se hace por DUEL_COMPONENTS, no por ese fichero). NavePalabrasDuel es host-autoritativo (el host corre la física a ~30Hz y broadcastea estado ~15Hz por canal Supabase vía useDuel; el guest envía input_pos/input_fire), monta DuelChatBar como exige el CLAUDE.md, implementa respawn (RESPAWN_MS=3000), kills (KILL_BONUS=3), bloque trampa 'invert' que afecta al rival, cuenta atrás 3-2-1, forfeit/registerDuelExit, reporta el ganador con reportResult(winnerId) y guarda la sesión con mode 'duel' (no cuenta como intento de examen). Particularidades a vigilar: el medidor de tiempo y los powers usan performance.now() para el render fuera del bucle; el duelo duplica constantes y lógica del modo solo (riesgo de divergencia: el solo usa px/seg dt-based y el duelo aún usa px/frame con SHIP_SPEED=7, PROJ_SPEED=12 a paso fijo de setInterval); el modo solo no integra getAppContent ni instructions del dataset (ayuda propia en modal). totalQuestions está fijado a 10 de forma artificial para la nota.

**Ideas de mejora.**
- Unificar la física del duelo con la del modo solo (migrar NavePalabrasDuel a velocidades en px/seg con deltaTime en lugar de SHIP_SPEED/PROJ_SPEED por frame en setInterval), para que la jugabilidad sea idéntica entre dispositivos y no dependa del tick fijo.
- Añadir feedback sonoro y/o confeti (canvas-confetti) en aciertos, combos altos y al recuperar cadencia, e integrar TTS opcional para leer la palabra al impactarla, reforzando vocabulario y accesibilidad en Atención a la Diversidad.
- Permitir elegir o fijar la categoría objetivo de forma persistente y mostrar al final un desglose por palabras acertadas/falladas (qué términos se confundieron), convirtiendo el resumen en material de repaso real.
- Revisar el cálculo de nota: hoy es min(10, hits) sin penalizar fallos, por lo que un alumno disparando a todo puede sumar aciertos; considerar una métrica de precisión (aciertos vs fallos) o capar por ratio para que la nota refleje discriminación real, no solo volumen de disparos.

### Ficha de usuario

**¿Qué es?** Nave Palabras es un juego de naves espaciales para aprender vocabulario. Durante 60 segundos pilotas tu nave por una arena estelar mientras caen palabras desde arriba. Tu misión es disparar solo a las palabras que pertenecen a la categoría objetivo (por ejemplo, 'animales' o 'verbos') y dejar pasar las que no encajan. Si aciertas a una palabra del grupo correcto sumas puntos; si disparas a la categoría equivocada, fallas. Puedes jugar en solitario o retar a un compañero en un duelo 1 contra 1.

**¿Por qué es relevante?** Detrás de la diversión hay un trabajo cognitivo serio: clasificar palabras por categorías es una de las bases de la competencia lingüística y de la organización del vocabulario en la mente. Al obligar a decidir muy rápido si una palabra pertenece o no al grupo objetivo, el juego entrena la atención selectiva, la velocidad de lectura, el control de impulsos (no disparar a lo que no toca) y la memoria de trabajo, todo a la vez. La presión amable de los 60 segundos y el sistema de aciertos y rachas generan una motivación alta que invita a repetir, y cada repetición es una nueva exposición al vocabulario. Funciona en cualquier asignatura con palabras agrupables (Lengua, idiomas, ciencias), se adapta al curso del alumno y ofrece tres niveles de ayuda para ajustar el reto.

**¿Cómo funciona?** El juego carga automáticamente el vocabulario del curso y la asignatura, organizado en categorías. Elige una categoría como objetivo y empieza a hacer caer palabras de esa y de otras categorías. Tú mueves la nave con el ratón, el dedo o el teclado y disparas hacia arriba. Cada palabra del grupo correcto que destruyes suma puntos; las equivocadas restan y, si fallas, tu nave dispara más despacio hasta que encadenas varios aciertos. Algunos bloques especiales dan ventajas (disparo rápido, puntos dobles) o son trampas. Al acabar el tiempo se muestra tu nota sobre 10.

**Cómo se juega.**
1. Elige tu nave entre los cinco diseños disponibles en el menú.
2. Mira cuál es la categoría objetivo (arriba) y, si quieres, pulsa el icono del libro para repasar todas las palabras válidas; usa el botón de barajar para cambiar de categoría.
3. Selecciona la dificultad: Fácil, Medio o Examen (recuerda que el modo Examen cuenta para las tareas).
4. Pulsa JUGAR: tienes 60 segundos.
5. Mueve la nave con el ratón o el dedo (o con las flechas / A y D del teclado) para colocarte bajo la palabra correcta.
6. Dispara con clic, con el botón DISPARAR en móvil o con Espacio, flecha arriba o W.
7. Acierta solo a las palabras de la categoría objetivo: las de otra categoría restan puntos y reducen tu cadencia de disparo.
8. Aprovecha los bloques especiales buenos (disparo rápido, puntos x2) y ten cuidado con el bloque de trampa que invierte tus controles.
9. Al terminar, consulta tu nota sobre 10 y pulsa Revancha para mejorar tu marca.

**Modos.**
- **Fácil**: Las palabras objetivo aparecen marcadas y la nave dispara más rápido; ideal para empezar.
- **Medio**: Las palabras objetivo se distinguen por color, pero el reto y la velocidad aumentan.
- **Examen**: Sin pistas de color: debes reconocer las palabras por ti mismo. Esta partida cuenta para las tareas.
- **Duelo (arena 1 vs 1)**: Reto en tiempo real contra un compañero: ganáis puntos por palabras correctas y derribando la nave rival.

**Consejos.**
- Antes de empezar, abre la guía de palabras (icono del libro) para tener clara la categoría objetivo.
- Encadena cinco aciertos seguidos para recuperar la cadencia de disparo si has fallado.
- No dispares a todo: cada disparo a una palabra equivocada te resta puntos y ralentiza tu nave.
- Persigue los bloques de puntos x2 y disparo rápido, pero evita el bloque rojo de controles invertidos.

---

## 🐍 Snake `(snake)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Snake (NEON SNAKE) es una reinterpretación educativa del clásico de la serpiente: el alumno dirige la serpiente para comer únicamente las palabras que pertenecen a la categoría-objetivo del momento. Está construido en React con un bucle de juego propio basado en setInterval sobre una rejilla CSS Grid; tiene un componente individual (SnakePalabras.jsx) y un componente de duelo 1 vs 1 host-autoritativo (SnakeDuel.jsx).

**Software.** Dos ficheros en src/apps/snake/: SnakePalabras.jsx (individual, ~907 líneas) y SnakeDuel.jsx (duelo, ~712 líneas). Librerías: react-router-dom (useParams), framer-motion (AnimatePresence/motion en el cheat-sheet, popups de duelo, level-up), lucide-react (iconos), componente Button de @/components/ui y util cn (clsx/tailwind-merge); NO usa canvas-confetti, three/r3f ni TTS. Render sobre CSS Grid de GRID_SIZE=25 (individual) / GRID=35 (duelo) celdas; la serpiente y la comida se posicionan con gridColumnStart/gridRowStart. Animaciones de cabeza (shake/popGreen/popGold) y level-up vía keyframes en una etiqueta <style> inline. Estado con useState/useRef; el tick usa el patrón de callback guardado en ref (savedCallback.current) re-asignado en cada render para capturar estado fresco, y un setInterval cuya cadencia se recalcula como Math.max(SPEED_MIN=100, SPEED_INITIAL=250 - floor(score/50)) (acelera con la puntuación). La comida tiene caducidad (ITEM_LIFESPAN=15000ms, parpadeo a los 5000ms restantes) y se repone hasta 4 ítems. Puntuación: palabra correcta suma combo*50 (combo creciente), palabra incorrecta resta 15 (Math.max(0,...)) y resetea combos, estrella bonus suma starCombo*500 y cambia de temática. Nota /10 en examen (dificultad 'hard'): se calcula y muestra en el game over como Math.min(score/1000, 10).toFixed(2). El tracking real lo hace el subcomponente SnakeTracker con un useRef (tracked) anti-doble-disparo que llama onGameComplete una sola vez al entrar en 'gameover': deriva wordsCollected=floor(score/10), TARGET_WORDS=30, mode 'test' si hard si no 'practice', y añade un timeBonus por rapidez en examen (presupuesto 4s/palabra, coef 5). SnakeDuel.jsx mantiene el estado autoritativo en el host: createRound/placeFood/pickWord, structuredClone del round en cada tick (TICK_MS=180), colisiones contra paredes y cuerpos, y sincroniza por broadcast (score/round/countdown/levelup/game_end/input/request_state/forfeit_request) vía useDuel; refs anti-doble (reportedRef, awardedRef) protegen el reparto de rondas y el reporte final.

**Jugabilidad.** Bucle clásico de Snake adaptado: aparece una categoría-objetivo en el header y el tablero se llena de palabras; comer una palabra válida (de la categoría activa) da puntos crecientes por racha y feedback verde, comer una de otra categoría (intruso) resta puntos, rompe la racha y da feedback rojo (shake). Cada cierto tiempo aparece una estrella dorada (bonus, prob. ~8%) que da muchos puntos, hace crecer la serpiente y dispara una transición de 'Nueva Temática' de 3 segundos que cambia la categoría-objetivo. Controles: flechas de teclado, botones táctiles en cruceta (visibles hasta breakpoint 2xl) y pausa con P/Escape; en duelo además WASD. Tres dificultades: Fácil (paredes que envuelven/wrap, ayuda de color siempre disponible), Medio (paredes mortales) y Examen (paredes mortales y sin ayuda de color forzada). Derrota: chocar con la pared (salvo en Fácil) o contra el propio cuerpo. Feedback: animaciones de cabeza (verde/oro/shake rojo), indicador de racha 'xN Racha!', popup de level-up con Star/Sparkles y popup de Game Over con puntuación final; NO hay confeti ni sonidos. Ayudas: botón de bombilla (color de comida) y modal 'Guía de palabras' (cheat sheet) con todas las categorías y términos, además de un slider de tamaño de texto. El duelo es a mejor de 5 (TARGET_WINS=3) en tablero compartido: gana la ronda quien sobreviva o, en empate, mayor puntuación.

**Educativo.** Objetivo pedagógico: clasificación y reconocimiento léxico-semántico: el alumno debe discriminar en tiempo real qué palabras pertenecen a una categoría dada (campo semántico, familia, tipo gramatical, etc.) y descartar los intrusos, reforzando vocabulario y categorización. Entrena además atención sostenida, control inhibitorio (no comer el intruso aunque esté cerca), planificación espacial y velocidad de procesamiento bajo presión temporal (la serpiente acelera y las palabras caducan). El cambio periódico de temática obliga a flexibilidad cognitiva. Encaje curricular: app común incluida en Primaria, ESO, Bachillerato (heredada a todas las asignaturas vía appsBase) y Atención a la Diversidad (vocabulario, atención, funciones ejecutivas), por lo que aparece transversalmente; el contenido concreto depende de las categorías del curso/asignatura cargado.

**Datos.** El contenido viene de getRunnerData(level, grade, subjectId) en src/services/gameDataService.js, que llama a la RPC get_runner_data de Supabase y devuelve un objeto {categoria: [palabras]} (deepParseJSON, cacheado en frontend). Las claves del objeto son las categorías (objetivos rotativos) y los valores las listas de palabras. La palabra válida sale de la categoría-objetivo actual y los intrusos de las demás categorías. Es la misma fuente que usan Runner, Memoria, Clasificador, Lluvia, Excavación y Torre. No usa getAppContent ni datos hardcodeados en el componente.

**Integración.** Registrada como appSnake (id 'snake') en commonApps.js con duel: {supported:true, bestOf:5, mode:'shared-board'}; presente en primariaApps, esoApps, bachilleratoApps (appsBase) y adApps; el duelo está en duelComponents.js (SnakeDuel) y en DUELABLE_APPS de duelableApps.js. Modos: Fácil ('easy'), Medio ('medium') y Examen ('hard'→ mode 'test'), seleccionados en pantalla previa (menú) y reconfigurables en pausa con modal propio de confirmación de reinicio. No es single_mode. Tracking: SnakePalabras NO usa useGameTracker directamente; delega en onGameComplete (inyectado por AppRunnerPage) a través de SnakeTracker, que dispara una vez por partida al Game Over con score+timeBonus, maxScore, correctAnswers, totalQuestions y durationSeconds. El duelo llama reportResult(winnerId) y onGameComplete con mode 'duel' (score 0) para no contar como intento de examen. El ranking es automático vía score/maxScore. Particularidades a vigilar: (1) la nota /10 se calcula con la fórmula propia min(score/1000,10) en lugar del estándar correctAnswers/totalQuestions·10 del CLAUDE.md (el onGameComplete no pasa 'nota', así que el cómputo de la plataforma usará floor(score/10)/30·10, que difiere de lo que ve el alumno en pantalla); (2) el setInterval del individual depende del patrón savedCallback re-asignado en cada render con un useEffect 'trigger' algo frágil; (3) el examen no limita tiempo ni vidas más allá de la mecánica de Snake.

**Ideas de mejora.**
- Unificar la nota del examen: hacer que la nota mostrada en el Game Over y la enviada a la plataforma coincidan (pasar 'nota' explícita en onGameComplete o adoptar la fórmula estándar correct/total·10) para evitar discrepancia entre lo que ve el alumno y lo que se registra.
- Añadir refuerzo educativo inmediato al fallar: mostrar brevemente a qué categoría pertenecía realmente el intruso comido (o por qué no era válido) para convertir el error en aprendizaje, e incorporar feedback sonoro y confeti en hitos de racha como hacen otras apps.
- Integrar el material de estudio/instrucciones estándar (InstructionsModal + botón 'Ver material de estudio') ya presente en otras apps, además del cheat-sheet actual, para coherencia con el resto de la plataforma.
- Robustecer el bucle de juego del modo individual reemplazando el patrón savedCallback re-asignado en cada render por un tick basado en requestAnimationFrame con paso fijo o un reducer determinista, mejorando estabilidad y permitiendo reutilizar lógica con el duelo.

### Ficha de usuario

**¿Qué es?** Snake es una versión educativa del clásico juego de la serpiente. En pantalla aparece una temática (por ejemplo, un campo de palabras) y el tablero se va llenando de términos. El alumnado guía a la serpiente con las flechas para comer solo las palabras que pertenecen a esa temática y esquivar las de otras categorías. Comer correctamente suma puntos y hace crecer la serpiente; comer una palabra intrusa o chocar termina la partida. Cada cierto tiempo aparece una estrella que cambia la temática y plantea un nuevo reto.

**¿Por qué es relevante?** Esta app convierte un juego muy conocido en un ejercicio de clasificación de vocabulario con una justificación pedagógica sólida. Para acertar, el alumno tiene que reconocer al instante si una palabra pertenece o no a la categoría activa, lo que refuerza el vocabulario y los campos semánticos y, sobre todo, entrena el control inhibitorio: resistir la tentación de comer una palabra que está cerca pero no es válida. Al mismo tiempo desarrolla atención sostenida, velocidad de procesamiento y orientación espacial, porque la serpiente acelera con los puntos y las palabras desaparecen pasado un tiempo. El cambio periódico de temática obliga a adaptarse y ejercita la flexibilidad mental. Es, además, motivador: el sistema de rachas y estrellas premia jugar con calma y leyendo bien, no solo correr.

**¿Cómo funciona?** Al empezar se elige la dificultad y el tamaño del texto. La serpiente avanza sola y el alumno solo decide hacia dónde girar. El header muestra la temática objetivo y la puntuación con la racha. Las palabras buenas suman puntos crecientes según la racha; las palabras de otra categoría restan y rompen la racha; la estrella dorada da muchos puntos, hace crecer la serpiente y cambia la temática con un breve aviso. Hay botones de ayuda de color, una guía de palabras y pausa. En modo Examen se calcula una nota sobre 10.

**Cómo se juega.**
1. Elige la dificultad (Fácil, Medio o Examen) y ajusta el tamaño del texto con el deslizador.
2. Fíjate en la temática objetivo que aparece arriba: solo debes comer palabras de esa categoría.
3. Mueve la serpiente con las flechas del teclado, la cruceta táctil o las teclas WASD (en duelo).
4. Lleva la cabeza hasta las palabras correctas para sumar puntos y encadenar racha.
5. Evita las palabras de otras categorías: restan puntos y rompen tu racha.
6. Caza la estrella dorada para ganar muchos puntos y avanzar a una nueva temática.
7. No choques con las paredes (salvo en Fácil, que tiene paredes que te trasladan al otro lado) ni con tu propio cuerpo.
8. Usa el botón de la bombilla para ver los colores de ayuda y el icono de libro para abrir la Guía de palabras si dudas.
9. Pulsa P o Escape para pausar cuando lo necesites; en Examen, intenta sumar la máxima nota antes de fallar.

**Modos.**
- **Fácil**: Las paredes no matan: al salir por un lado apareces por el contrario. Tienes ayuda de color para distinguir las palabras. Ideal para empezar.
- **Medio**: Las paredes son mortales y la serpiente acelera con los puntos. Mantiene la ayuda de color disponible.
- **Examen**: Sin ayuda de color y con paredes mortales. Al terminar se calcula una nota sobre 10 y cuenta para las tareas.
- **Duelo 1 vs 1**: Dos jugadores compiten en el mismo tablero al mejor de 5 rondas: gana cada ronda quien sobreviva (o tenga más puntos en caso de empate).

**Consejos.**
- No corras: es mejor ir más despacio y leer bien cada palabra que encadenar fallos por las prisas.
- Abre la Guía de palabras antes de empezar o cuando cambie la temática para tener claras las categorías.
- Aprovecha las estrellas, pero planifica el giro: hacen crecer mucho a la serpiente y el espacio se reduce.
- En Fácil, usa las paredes que te trasladan al otro lado para escapar de situaciones complicadas.

---

## 🌧️ Lluvia de Palabras `(lluvia-de-palabras)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego arcade de clasificación de vocabulario en el que el alumno mueve cajas-categoría para atrapar palabras que caen del cielo. Es un único componente React (LluviaDePalabras.jsx) construido sobre DOM/CSS (sin canvas ni WebGL) con un bucle de requestAnimationFrame, animaciones de framer-motion e iconos de lucide-react.

**Software.** Componente único src/apps/lluvia-de-palabras/LluviaDePalabras.jsx, sin CSS propio (estilos vía Tailwind inline + un bloque <style> con una grid animada por keyframes). Librerías: framer-motion (motion/AnimatePresence para menús, cajas con layout/layoutId y animaciones de éxito/error), lucide-react (CloudRain, ArrowLeftRight, BookOpen, Play, Pause, etc.) y @/components/ui (Button). NO usa canvas-confetti, NO usa three/@react-three/fiber, NO usa TTS ni sonidos. useToast se importa pero su `toast` no se emplea en el flujo de juego. Estado con useState (gamePhase: loading/menu/playing/paused/gameOver; difficulty; examSubMode; score; lives; categories; availableWords; fallingWords) y una batería de useRef para el motor: requestRef (rAF), lastSpawnTime, difficultyRef (nivel dinámico), speedRef/baseSpeedRef, baseSpawnRef, gameStartRef (timestamp) y trackedRef (flag anti-doble-disparo). El loop updateGame (useCallback) calcula la tasa de spawn (baseSpawn − nivel·25, mínimo 800ms), genera palabras desde availableWords, las desplaza por `y` con speedRef y resuelve la colisión al llegar al 84% de altura: acierto si la categoría de la columna coincide con la de la palabra (+10, difficultyRef+1, sube velocidad), fallo si no (pierde vida, difficultyRef−10). Puntuación: 10 puntos por palabra correcta. Nota /10 en examen: wordsCollected=score/10, TARGET_WORDS=30, baseNota=min(words/30·10, 10); en examen se aplica EXAM_SUBMODE_MODIFIER (slow −1, normal 0, fast +1) sumado a la base, con clip inferior a 0 pero SIN tope superior (puede pasar de 10 con `fast`). Se calcula además un timeBonus de examen (presupuesto 60s, coef 5) que se suma al `score` enviado al ranking, NO a la nota. El anti-doble-disparo es trackedRef: el efecto de tracking solo dispara onGameComplete una vez al entrar en gameOver y se rearma al salir de esa fase.

**Jugabilidad.** Bucle: caen palabras por columnas; cada columna tiene debajo una caja-categoría. El control central es reordenar las cajas con los botones-gema (ArrowLeftRight) situados entre cajas adyacentes (swapCategories intercambia posiciones) para colocar la categoría correcta bajo la palabra antes de que aterrice. Controles 100% de pulsación (ratón/táctil sobre los botones de intercambio, pausa, ayuda y guía); no hay teclado ni arrastre de palabras. Dificultad: Fácil (2 cajas), Medio (3 cajas + interruptor de ayuda visual que colorea cada palabra con el color de su categoría), Examen/hard (3 cajas, sin ayuda, con submenú de velocidad: Lento/Normal/Rápido que ajustan velocidad inicial y ritmo de aparición y modifican la nota ±1). 3 vidas (corazones). Derrota: agotar las vidas; en examen también finaliza al llegar a 300 puntos (30 palabras = examen superado). Cada acierto/fallo acelera o ralentiza el juego (curva de dificultad dinámica). Feedback exclusivamente visual: animación de la caja (glow rosa/violeta en acierto, sacudida + sombra interior en error vía getBoxAnimation), pérdida de corazones y contador. No hay confeti ni audio. Modales propios para pausa y para la 'Guía de palabras' (cheat sheet con todas las categorías y palabras).

**Educativo.** Objetivo pedagógico: clasificación y categorización léxica bajo presión temporal. Entrena vocabulario y la asociación palabra→categoría (sustantivos/verbos/adjetivos, campos semánticos, familias por asignatura), atención sostenida, velocidad de procesamiento y toma de decisiones rápida. El gesto de reordenar cajas añade una capa de planificación espacial. Encaje curricular: figura en Primaria (lengua, ciencias naturales, ciencias sociales, inglés, etc.) y, por la herencia de las listas de apps, en cursos de ESO/Bachillerato y en Atención a la Diversidad (que reutiliza datos de Primaria vía resolveADParams). La guía de palabras integrada funciona como material de estudio consultable durante la partida.

**Datos.** Contenido vía getRunnerData(level, grade, subjectId) de src/services/gameDataService.js → RPC get_runner_data, que devuelve un objeto { categoria: [palabras...] } (formato runner, compartido con Runner, Memoria, Clasificador, Excavación, Snake, Torre). Las claves `title` e `instructions` se filtran como metadatos (título e instrucciones del menú). Si no hay subjectId carga un mock embebido (gramática: Sustantivos/Verbos/Adjetivos) y ante error de carga cae a un fallback mínimo ('Cat A'/'Cat B'). Al iniciar, baraja las claves con Fisher-Yates y selecciona 2 (fácil) o hasta 3 categorías; los colores de caja también se barajan.

**Integración.** Modos: practice (easy/medium) y test (examen hard con submodos slow/normal/fast). NO es single_mode (las partidas easy/medium son `practice` y no cuentan como intento de tarea; solo el examen es `test`). NO tiene duelo: no está en src/apps/config/duelableApps.js ni existe LluviaDePalabrasDuel.jsx. Registrada en commonApps.js (id 'lluvia-de-palabras', lazy import) y en las listas de primaria/eso/bachillerato. onGameComplete se invoca una sola vez por partida (protegido por trackedRef) con { mode, score: score+timeBonus, maxScore, correctAnswers: wordsCollected, totalQuestions: 30, durationSeconds, nota }. AppRunnerPage/useGameTracker se encargan del tracking de sesión (una fila por partida), XP, insignias y ranking (aplica el multiplicador de curso sobre score/maxScore). Particularidades a vigilar: (1) la nota de examen puede superar 10 por el modificador `fast`, fuera del rango canónico 0–10 que asume CLAUDE.md; (2) la nota se calcula con `difficulty === 'hard'`, no con `mode === 'test'`, así que cualquier refactor debe mantener ese acoplamiento; (3) no usa el patrón estándar de mensaje de nota (Excelente/Muy bien/Aprobado) del summary; (4) no monta InstructionsModal compartido (instrucciones embebidas en el menú).

**Ideas de mejora.**
- Añadir retroalimentación auditiva (TTS de la palabra al caer o al atraparla, especialmente útil en inglés y en Atención a la Diversidad) y un canvas-confetti al superar el examen, alineándolo con el resto de apps.
- Revisar la nota de examen para que respete el rango 0–10 (o documentar explícitamente que `fast` puede exceder 10) y mostrar el mensaje cualitativo estándar (Excelente/Muy bien/Aprobado/Necesitas repasar) en el resumen.
- Incorporar control por teclado (flechas para intercambiar cajas) y arrastre táctil de las palabras, mejorando accesibilidad y la experiencia en móvil.
- Implementar el modo duelo 1 vs 1 (LluviaDePalabrasDuel.jsx + registro en duelableApps con DuelChatBar) dado que el bucle por puntuación encaja bien con una partida simétrica.

### Ficha de usuario

**¿Qué es?** Lluvia de Palabras es un juego de clasificación de vocabulario en el que las palabras caen del cielo en columnas y, debajo, hay cajas con el nombre de cada categoría. El reto consiste en colocar la caja correcta bajo cada palabra antes de que aterrice, usando unos botones mágicos que intercambian las cajas. Cada acierto suma puntos y cada palabra mal clasificada cuesta una vida. Es una forma ágil y visual de repasar familias de palabras, campos semánticos o tipos de palabras de cualquier asignatura.

**¿Por qué es relevante?** La app entrena una destreza clave del aprendizaje lingüístico: categorizar el vocabulario, es decir, reconocer a qué grupo pertenece cada palabra (sustantivo, verbo, adjetivo, campo semántico, tema de una asignatura). Hacerlo a contrarreloj desarrolla la atención sostenida, la velocidad de procesamiento y la toma de decisiones, mientras el gesto de reordenar las cajas añade planificación y rapidez de reacción. Al asociar repetidamente cada palabra con su categoría se consolida el léxico de manera activa y motivadora, mucho más eficaz que memorizar listas. La dificultad se adapta sola dentro de la partida (acelera con los aciertos), y la guía de palabras integrada permite repasar en cualquier momento, lo que la convierte en una herramienta útil tanto para refuerzo como para evaluación.

**¿Cómo funciona?** Tras elegir dificultad, empiezan a caer palabras por varias columnas y aparecen las cajas-categoría en la parte inferior. El alumno pulsa los botones de intercambio para mover las cajas y dejar la correcta justo debajo de cada palabra antes de que llegue al suelo. Si acierta, suma 10 puntos y el juego se acelera; si falla, pierde una de sus tres vidas. La partida termina al quedarse sin vidas y, en el modo Examen, al reunir 30 palabras correctas, que equivale a superar la prueba.

**Cómo se juega.**
1. Elige el modo: Fácil (2 cajas), Medio (3 cajas con ayuda de color) o Examen (3 cajas sin ayuda).
2. Si eliges Examen, escoge la velocidad: Lento (resta 1 punto a la nota), Normal (sin cambios) o Rápido (suma 1 punto).
3. Observa qué palabra cae por cada columna y a qué categoría pertenece.
4. Pulsa los botones mágicos (la gema con las flechas) situados entre las cajas para intercambiarlas y colocar la correcta debajo de la palabra.
5. Atrapa la palabra en su caja correcta para sumar 10 puntos antes de que aterrice.
6. Evita que una palabra caiga en la caja equivocada: cada error te cuesta una de tus tres vidas.
7. Usa el botón de la bombilla (en Fácil y Medio) para ver cada palabra coloreada con el color de su categoría.
8. Abre la Guía de palabras (icono de libro) siempre que necesites repasar qué palabras van en cada categoría.
9. En Examen, reúne 30 palabras correctas para superar la prueba; en cualquier modo, la partida acaba al quedarte sin vidas.

**Modos.**
- **Fácil**: Solo 2 cajas y posibilidad de activar la ayuda visual que colorea cada palabra con el color de su categoría. Ideal para empezar.
- **Medio**: 3 cajas con la ayuda visual disponible. Un punto intermedio entre la práctica guiada y el reto.
- **Examen (Lento / Normal / Rápido)**: 3 cajas sin ayudas y con nota sobre 10. La velocidad elegida modifica la nota: Lento −1 punto, Normal sin cambios y Rápido +1 punto. Se supera reuniendo 30 palabras correctas.

**Consejos.**
- Antes de empezar, abre la Guía de palabras para repasar qué palabras pertenecen a cada categoría.
- Anticípate: mira la palabra que viene y prepara la caja correcta moviéndola con tiempo, no en el último segundo.
- En Medio, activa la ayuda de color mientras aprendes y desactívala cuando te sientas seguro para entrenar de cara al Examen.
- En Examen, elige Rápido solo si dominas el vocabulario: arriesgas más, pero ganas un punto extra en la nota.

---

## 🃏 Parejas de Cartas `(parejas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego clásico de memoria (memory/concentration) implementado como componente React único (ParejasDeCartas.jsx) que voltea cartas para emparejar dos lados de un concepto (term_a/term_b). Cada pareja se construye con un anverso y un reverso del mismo par; el alumno debe localizar ambas cartas. Es un componente autónomo, sin dependencias de _shared, con estado local por useState y refs.

**Software.** Componente único src/apps/parejas-de-cartas/ParejasDeCartas.jsx + ParejasDeCartas.css; carga diferida (lazy) desde commonApps.js (appParejas, id 'parejas'). Librerias: React (useState/useEffect/useRef), react-router-dom (useParams para level/grade/subjectId), canvas-confetti para la victoria. NO usa framer-motion (las animaciones de volteo/peek/shake son CSS puro vía clases flipped/matched/peeking/shaking), NO three/r3f, NO lucide-react (los iconos son emojis), NO TTS. El estilo de UI mezcla clases Tailwind utilitarias inline con CSS propio. Estado: fase ('menu'|'juego'|'resumen'), config {filas,columnas,parejas,ayudas,isExam,notaModifier}, vidas, zoom, datosCrudos (pares de la BD), cartas (array barajado con {contenido,pairId,uniqueId,matched,peeking}), eleccionUno/eleccionDos (uniqueId de las dos cartas giradas), bloqueado, turnos. Refs: peekTimeoutRef/peekIntervalRef (ciclo de ayudas visuales), colaAyudasRef, randomDelaysRef (delays aleatorios del shake al reiniciar), gameStartRef (timestamp de inicio para el bonus de tiempo) y trackedRef (flag anti-doble-disparo de onGameComplete). Puntuacion (solo se envia con score>0 en examen): basePoints = parejasEncontradas*100; turnosBonus = max(0, round(300*(1-(turnos-minTurnos)/(minTurnos*2)))) con minTurnos=parejas; timeBonus = max(0, round((parejas*8 - segundos)*5)); totalPoints = suma. maxScore = parejas*100 + 300 + parejas*8*5. Nota /10 en examen: notaBase = (parejasEncontradas/parejas)*10, notaFinal = clip(0,10, notaBase + notaModifier) donde notaModifier es -1 (Basico), 0 (Medio) o +1 (Avanzado); se redondea a 1 decimal y se pasa como override 'nota' en onGameComplete. La nota NO sigue el patron de mensajes Excelente/Muy bien del CLAUDE.md (muestra solo el numero con color verde/rojo segun queden vidas). El disparo de tracking esta en un useEffect ligado a fase==='resumen' protegido por trackedRef, que se rearma cuando fase deja de ser 'resumen'.

**Jugabilidad.** Bucle: pantalla de menu con dos secciones (Entrenamiento con Facil/Normal/Dificil y Modo Examen con Basico/Medio/Avanzado) -> tablero de cartas boca abajo -> el alumno hace clic en dos cartas, si coinciden (mismo pairId) quedan emparejadas (clase matched) y si no se vuelven a girar tras 1s. Controles: solo raton/tactil (clic en carta), sin teclado; la seleccion esta bloqueada durante la comprobacion (bloqueado), durante restarting/revealing y sobre cartas ya emparejadas o ya seleccionadas. Tableros: Entrenamiento 2x4/4 parejas, 3x4/6, 4x5/10; Examen 4x4/8, 4x6/12, 5x8/20 (las parejas reales se capan a datosCrudos.length). Victoria: todas las cartas matched -> fase resumen + confetti(150 particulas). Derrota: SOLO en examen, donde hay 3 vidas y cada fallo resta una; al llegar a 0 vidas se va a resumen sin confeti ('Examen Finalizado', nota en rojo). En entrenamiento no hay vidas ni derrota, el resumen muestra 'Completado en N turnos'. Ayudas visuales (peek): en entrenamiento es un toggle (boton Ayudas ON/OFF), en examen estan forzadas a ON; un intervalo (2000ms normal / 1500ms examen) revela durante 1s dos cartas aleatorias no emparejadas para reforzar la memoria. Extras de UI: control de zoom del tablero (0.4-1.8 vía propiedad CSS zoom), boton Reiniciar (con animacion de shake escalonado por carta), boton Ayuda que abre un modal con todas las parejas (anverso ↔ reverso). Escalado tipografico dinamico del texto de cada carta segun densidad de columnas y longitud de cadena; detecta si el contenido es imagen (.png/.webp/.jpg) o texto/simbolo.

**Educativo.** Objetivo pedagogico: memoria de trabajo y memoria visual a corto plazo, atencion sostenida y asociacion de conceptos pareados (term_a ↔ term_b): puede vincular palabra-definicion, simbolo-nombre, termino-traduccion, operacion-resultado, imagen-concepto, segun el contenido de la asignatura. Destrezas: concentracion, recuerdo espacial (recordar la posicion de cartas vistas), reconocimiento y vocabulario/terminologia. Encaja como repaso ludico transversal. Aparece en multiples asignaturas de Primaria y, vía herencia de config, en ESO y Bachillerato (registrada como appParejas en primariaApps.js — lengua, matematicas, ciencias-naturales, etc. — esoApps.js y bachilleratoApps.js); en Atencion a la Diversidad reutiliza datos de Primaria (nivel 3) mapeados por bloque en gameDataService. Util en AD por su bajo coste de lectura y refuerzo multisensorial.

**Datos.** Contenido vía getParejasData(nivel, curso, asignatura) de src/services/gameDataService.js, que invoca la RPC Supabase get_parejas_data (p_level, p_grade, p_subject) y devuelve un array [{id, a, b}] (term_a/term_b en la BD), cacheado 5 min en memoria. Para nivel 'ad' resolveADParams redirige a datos reales de Primaria. Fallback embebido si la carga falla o viene vacia: 4 pares sol/luna/estrella/nube con emojis. No usa getAppContent ni datos propios mas alla del fallback.

**Integración.** Modos: tres de entrenamiento (mode 'practice', score 0, no cuenta para tarea) y tres de examen (mode 'test', con nota /10 override). NO es single_mode (no aparece registrada en codigo como tal) y NO tiene duelo (no esta en duelableApps.js, no monta DuelChatBar). Tracking: NO usa el hook useGameTracker directamente dentro del componente; depende de la prop onGameComplete que inyecta AppRunnerPage (que sí gestiona session_id/track_session_start). Se invoca una sola vez por partida protegido por trackedRef al entrar en 'resumen'. Ranking: solo se alimenta en examen porque score/maxScore son 0 en practica; AppRunnerPage aplica el multiplicador de curso. Particularidades/riesgos a vigilar: (1) en practica score=0 y maxScore=0, asi que esas partidas no aportan al ranking aunque sí cuentan como sesion/unique_apps; (2) los modificadores de nota -1/+1 por dificultad son una excepcion al patron estandar y pueden inflar/deflactar la nota frente a otras apps; (3) el menu usa tabs/secciones de seleccion previa (correcto), pero NO sigue el naming easy/medium/exam ni los mensajes Excelente/Aprobado del CLAUDE.md; (4) si el alumno abandona la partida a medias, onGameComplete NO se dispara (no hay cleanup que lo fuerce como en Anagramas), por lo que las partidas incompletas no quedan registradas; (5) la barajada usa sort(()=>Math.random()-0.5), sesgo conocido de Fisher-Yates incompleto.

**Ideas de mejora.**
- Disparar onGameComplete tambien en el cleanup/desmontaje (patron de Anagramas) para registrar nota parcial cuando el alumno abandona un examen a medias, evitando exámenes 'fantasma' sin registro.
- Alinear con el contrato del CLAUDE.md: mensajes de nota (Excelente/Muy bien/Aprobado/Necesitas repasar) y valorar nombrar los modos easy/medium/exam; revisar si los modificadores -1/+1 deben mantenerse o sustituirse por la doble progresion estandar (nota capada + puntos paralelos).
- Anadir accesibilidad y control por teclado (foco navegable, Enter/Espacio para girar carta, aria-labels) y, opcionalmente, TTS del termino para reforzar en AD y en idiomas.
- Reemplazar el barajado sesgado (sort aleatorio) por un Fisher-Yates correcto y considerar soporte de duelo 1 vs 1 (ParejasDuel + DuelChatBar) dado que la mecanica por turnos encaja bien en formato competitivo.

### Ficha de usuario

**¿Qué es?** Parejas de Cartas es un juego de memoria al estilo clasico del 'memory'. En el tablero hay cartas boca abajo que esconden conceptos relacionados de dos en dos: por un lado un termino y por otro su pareja (por ejemplo, una palabra y su significado, un simbolo y su nombre, o una imagen y el concepto que representa). El alumnado va levantando cartas para encontrar las parejas que encajan. Los contenidos se adaptan a la asignatura y al curso, de modo que sirve para repasar vocabulario, terminologia y conceptos de forma amena.

**¿Por qué es relevante?** Es una actividad muy valiosa porque entrena de forma directa la memoria de trabajo y la memoria visual, dos capacidades clave para todo el aprendizaje escolar. Al tener que recordar donde estaba cada carta vista, el alumnado ejercita la atencion sostenida y la concentracion, mientras asocia parejas de conceptos (palabra-definicion, termino-traduccion, simbolo-significado). Esa asociacion refuerza el vocabulario y la terminologia de cada materia mucho mejor que la simple repeticion, porque obliga a procesar el significado. Es un formato inclusivo: apenas exige lectura, da feedback inmediato y permite ajustar la dificultad, por lo que funciona bien tambien en Atencion a la Diversidad. El componente ludico mantiene la motivacion y convierte el repaso en un reto agradable que el alumnado quiere repetir.

**¿Cómo funciona?** Al entrar se elige una dificultad: en Entrenamiento (Facil, Normal o Dificil) se practica sin presion, y en Modo Examen (Basico, Medio o Avanzado) la partida cuenta para la nota y se juega con tres vidas. El tablero muestra las cartas boca abajo; al tocar dos, si forman pareja se quedan descubiertas y si no, vuelven a taparse. Una pista visual va destapando brevemente cartas para ayudar a memorizar. Al emparejarlas todas se gana, con confeti de celebracion.

**Cómo se juega.**
1. Elige una dificultad: Entrenamiento (Facil, Normal o Dificil) para practicar, o Modo Examen (Basico, Medio o Avanzado) si quieres que cuente para la nota.
2. Observa el tablero de cartas boca abajo y aprovecha las pistas que destapan cartas durante un instante para ir memorizando posiciones.
3. Toca una primera carta para girarla y descubrir su contenido.
4. Toca una segunda carta: si las dos forman pareja, se quedaran descubiertas; si no, se volveran a tapar pasado un momento.
5. Sigue buscando parejas recordando donde viste cada carta.
6. En Modo Examen vigila tus tres vidas (cada fallo resta una): si las pierdes todas, la partida termina.
7. Usa el boton de Ayuda para ver todas las parejas, el control de tamano para agrandar o reducir el tablero y el boton de Reiniciar si quieres empezar de nuevo.
8. Empareja todas las cartas para ganar y ver tu resultado: turnos empleados en Entrenamiento o tu nota en Modo Examen.

**Modos.**
- **Entrenamiento - Facil**: Tablero 2x4 con 4 parejas. Sin vidas ni nota; ideal para empezar y coger soltura.
- **Entrenamiento - Normal**: Tablero 3x4 con 6 parejas. Practica sin presion con dificultad media.
- **Entrenamiento - Dificil**: Tablero 4x5 con 10 parejas. Mas cartas que memorizar, para reforzar el reto sin contar para la nota.
- **Examen - Basico**: Tablero 4x4 con 8 parejas y 3 vidas. Cuenta para la nota, con un pequeno ajuste a la baja por ser el mas sencillo.
- **Examen - Medio**: Tablero 4x6 con 12 parejas y 3 vidas. Cuenta para la nota, sin ajustes.
- **Examen - Avanzado**: Tablero 5x8 con 20 parejas y 3 vidas. Cuenta para la nota, con un bonus por ser el mas dificil.

**Consejos.**
- Memoriza por zonas: cuando una carta no encaje, intenta retener su posicion para usarla mas tarde.
- Aprovecha las pistas que destapan cartas durante un instante; en Modo Examen aparecen mas a menudo.
- En Modo Examen ve sobre seguro: confirma primero las parejas que ya conoces para no gastar vidas en tanteos.
- Si el tablero se te queda pequeno o grande, usa el control de tamano para verlo comodo antes de empezar a memorizar.

---

## 🎯 Cazapalabras 3D `(cazapalabras-3d)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Shooter FPS educativo de vocabulario en 3D a pantalla completa: el alumno apunta con una mirilla central y dispara a palabras que vuelan por el cielo de la isla low-poly de la plataforma, puntuando solo las de 2 categorías que rotan, más retos de definición. Construido con React + @react-three/fiber/three, con el estado de juego autoritativo en refs y espejo en React solo para el HUD.

**Software.** Componente raíz src/apps/cazapalabras-3d/Cazapalabras3D.jsx (shell de pantallas select/play/summary) + CSS propio. Render 3D en components/GameCanvas.jsx (Canvas r3f con dpr/AA/sombras por tier de calidad global, governor de FPS en modo auto, remonte por key={tier-ctxKey} y recuperación de pérdida de contexto WebGL) y components/Scene.jsx, que monta el MISMO entorno low-poly del Laboratorio de Física (LabEnvironment) con cámara en primera persona FIJA (solo mouse-look yaw/pitch + micro-respiración). Motor puro en engine/: flyers.js (spawn de dianas voladoras con trayectorias 'cross'/'rise' y gravedad parabólica, pickPair para rotar el par de categorías, pickScale con sesgo de tamaño por dificultad), pool.js (buildPool combina getRunnerData→categorías y getRoscoData→definiciones; expone byCategory, rotatableNames, definitions; poolUsable valida ≥6 palabras), config.js (DIFICULTADES, BUFF/DEBUFF, SCORE_PRINCIPAL=5/SCORE_SECUNDARIA=2, notaColor/notaMensaje), wordTexture.js (texturas de texto cacheadas). Disparo = raycast THREE desde el centro de la pantalla {x:0,y:0} sobre los meshes vivos, con cooldown de cadencia; updateWorldMatrix antes del raycast para usar la pose de ESTE frame. Librerías: three + @react-three/fiber, framer-motion (transiciones de UI, banner de categorías, toasts), canvas-confetti (celebración final), lucide-react (iconos), @react-three/postprocessing implícito vía Effects (bloom selectivo por BLOOM_LAYER). NO usa TTS ni audio (no hay Web Audio/speechSynthesis). Estado: gsRef (autoritativo: timeLeft, score, combo, defSolved/defPresented, debuffs/buffs, par de categorías activo), controlRef (yaw/pitch/shootQueued), espejo a React con snapshot() ~11 Hz para el HUD sin re-renderizar el Canvas (memo). Puntuación: principal +5, secundaria +2, definición acertada = points·DEF_BONUS_MULT(4); gemas doradas +9 y moradas +14 son puntos PARALELOS (no cuentan como palabra/def). maxScore≈totalTime·12. Nota /10 en examen = round(defSolved/defPresented·100)/10 (0 si no se presentó ninguna). Anti-doble-registro: trackedRef + commitResult() idempotente; sessionStartRef para duración; fbId/catBannerId como contadores de feedback.

**Jugabilidad.** Partidas por TIEMPO (60 s en todas las dificultades). Bucle: un requestAnimationFrame maestro descuenta tiempo, gestiona la aparición de definiciones y la rotación de categorías y refresca el HUD; el useFrame de la escena integra las trayectorias, hace spawn (cadencia + relleno mínimo + gemas), orienta los billboards hacia la cámara y resuelve disparos por raycast. Controles universales: en ordenador clic captura el ratón (pointer lock), mover el ratón gira y clic dispara, ESC libera el cursor; en táctil arrastrar apunta y tap dispara (umbral de movimiento <11 px y <500 ms para distinguir tap de arrastre). Dificultades fácil/medio/difícil ajustan cadencia, velocidad de vuelo, proporción de válidas (validRatio), sesgo a tamaños diminutos (sizeBias) y frecuencia de rotación de categorías. Solo 2 categorías puntúan a la vez y cambian cada catRotateSec con aviso grande sobre la mirilla; las palabras no llevan pista visual, hay que reconocer la categoría. Disparar una palabra NO válida no resta puntos pero hace huir hasta 2 válidas en vuelo y, con 45% de probabilidad, aplica un debuff de mirilla. Gemas doradas: puntos extra + buff (⚡ disparo rápido, 🚀 mirilla ágil, ⏱ +6 s). Gemas moradas: más puntos pero debuff (🐌 lenta, 🔄 invertida, 📳 vibración). Retos de definición: la palabra-respuesta vuela sin resaltar entre las demás. Sin condición de derrota (acaba el reloj); feedback: hit-markers en la mirilla, viñeta que se enciende con el combo, tinte por debuff, banners y confeti final (siempre en práctica; en examen solo si nota≥5).

**Educativo.** Objetivo pedagógico: ampliar y consolidar vocabulario y comprensión de definiciones de la asignatura. Entrena reconocimiento léxico rápido, categorización semántica (clasificar palabras en categorías que además cambian, lo que exige flexibilidad cognitiva), asociación definición→término y lectura veloz bajo presión temporal. La capa de mirilla añade coordinación óculo-manual y control inhibitorio (decidir cuándo NO disparar a un señuelo, y si compensa arriesgar con una gema trampa). El examen evalúa específicamente la competencia de emparejar definición y palabra. Encaje curricular: registrada para ESO (1º-4º) y Bachillerato (1º-2º) heredada a todas las asignaturas; usa el vocabulario de la asignatura/curso activos. Por defecto asignatura 'general' en ESO/Bachillerato, con fallback a 'general' si la asignatura concreta no tiene datos. Incluye material de estudio (categorías que pueden puntuar con sus palabras, señuelos y lista de definiciones).

**Datos.** Contenido 100% de Supabase vía gameDataService: getRunnerData(level,grade,asignatura) aporta las categorías con palabras ({categoria:[palabras]}) que forman las dianas y las categorías rotables; getRoscoData(level,grade,asignatura) aporta las definiciones (solucion+definicion+difficulty) para los retos de definición y soluciones del rosco como señuelos ('Otras'). buildPool() (engine/pool.js) deduplica cada palabra a su primera categoría, exige ≥3 palabras para que una categoría sea rotable y, si solo hay rosco, crea una única categoría 'Vocabulario'. Hay fallback a la asignatura 'general' cuando la asignatura pedida no devuelve datos. Sin datos suficientes (poolUsable: <6 palabras o sin categorías rotables) muestra pantalla de error. NO usa getAppContent ni datos hardcodeados de contenido.

**Integración.** Modos: pantalla de selección previa con fácil/medio/difícil (práctica → mode 'practice') y examen (mode 'test', nota/10 por definiciones). El modo examen se oculta automáticamente si el pool no tiene definiciones. No es single_mode y NO está en duelableApps.js (sin duelo 1 vs 1). Tracking: onGameComplete se llama una sola vez por partida (commitResult protegido por trackedRef), también en el cleanup de desmontaje a mitad de partida (resultado parcial); el AppRunnerPage lo enlaza con useGameTracker (track_session_start al montar, track_session_finish/track_student_session por partida → game_sessions + high_scores + gamification_process_session para XP/insignias/avatares). Ranking automático con score/maxScore (maxScore≈totalTime·12) y multiplicador de curso. Calidad gráfica global (useGraphicsQuality + GraphicsQualitySelector + auto-downgrade por FPS con toast). Particularidades para mejoras: la nota de examen depende de defPresented (no se infla porque solo cuenta al hacerse VISIBLE la diana de respuesta); la rotación de categorías y la ausencia de pistas visuales son el núcleo de dificultad; en práctica correctAnswers=wordsHit/totalQuestions=wordsHit (ratio siempre alto, irrelevante para nota porque solo el examen genera nota de tarea).

**Ideas de mejora.**
- Añadir audio: efectos de disparo/impacto y, opcionalmente, lectura por voz (speechSynthesis) de la palabra al acertarla o de la definición, reforzando la asociación grafía-fonema sin penalizar rendimiento.
- Soportar duelo 1 vs 1 (componente Cazapalabras3DDuel con DuelChatBar y registro en duelableApps.js), aprovechando que ya hay semilla determinista posible vía pickPair/spawnFlyer con un rng inyectado para igualar las dianas de ambos jugadores.
- Modo accesible/baja exigencia motriz: opción de mirilla magnética (snap suave a la diana válida más cercana) o ralentización global, para alumnado de Atención a la Diversidad o con dificultades de coordinación, sin alterar la lógica de puntuación.
- Resumen final más formativo: listar las palabras válidas que escaparon o se ignoraron y las definiciones falladas, con su solución, para convertir el cierre de partida en repaso dirigido.

### Ficha de usuario

**¿Qué es?** Cazapalabras 3D es un juego de puntería en primera persona y a pantalla completa para aprender vocabulario. Desde un escenario en 3D, el alumnado apunta con una mirilla y dispara a las palabras que vuelan por el cielo describiendo arcos. Solo dos categorías de palabras puntúan en cada momento (y van cambiando), así que hay que leer y clasificar cada palabra antes de disparar. De vez en cuando aparece una definición y hay que acertar la palabra que la cumple. Incluye un modo examen con nota.

**¿Por qué es relevante?** Combina la motivación de un videojuego de acción con un trabajo léxico exigente. Al puntuar solo dos categorías que además rotan, el juego entrena algo más que memorizar palabras: obliga a reconocer a qué categoría pertenece cada término y a reorganizar esa clasificación cuando cambian las reglas, ejercitando la flexibilidad cognitiva y la atención sostenida. Los retos de definición desarrollan la competencia clave de emparejar un significado con su palabra, base de la comprensión lectora. Decidir cuándo NO disparar a un señuelo (o si arriesgarse con una gema trampa) entrena el autocontrol. Todo bajo presión de tiempo, lo que favorece la lectura ágil y el acceso rápido al léxico. El contenido sale del vocabulario real de la asignatura y curso, por lo que el repaso es pertinente y graduado por dificultad.

**¿Cómo funciona?** Cada partida dura un minuto. Eliges dificultad (fácil, medio o difícil) o el modo examen. Estás de pie en una isla 3D y mueves la vista para seguir las palabras voladoras; disparas a las de las dos categorías que puntúan (una da +5 y otra +2) y cada poco esas categorías cambian, avisándote en pantalla. Aparecen también definiciones cuya palabra debes cazar. Hay gemas doradas que dan ventajas y gemas moradas que dan más puntos pero te complican la mirilla. En examen, la nota sale de las definiciones que aciertes.

**Cómo se juega.**
1. Pulsa Ver material de estudio para repasar las categorías, sus palabras y las definiciones.
2. Elige un modo: Fácil, Medio o Difícil para practicar, o Examen si quieres nota.
3. En ordenador, haz clic para capturar el ratón; mueve el ratón para apuntar y haz clic para disparar (pulsa ESC para soltar el ratón). En tablet o móvil, arrastra para apuntar y toca para disparar.
4. Mira la leyenda de abajo: dispara solo a las palabras de las dos categorías que puntúan (principal +5, secundaria +2) y lee cada palabra antes de disparar.
5. Atento al aviso grande sobre la mirilla: cada poco tiempo cambian las categorías que puntúan.
6. Cuando aparezca una definición arriba, busca entre las palabras voladoras la que la cumple (no está resaltada) y dispárale a tiempo.
7. Aprovecha las gemas doradas (puntos y ventajas) y decide si te arriesgas con las moradas (más puntos pero estorban tu mirilla).
8. Evita disparar a palabras que no puntúan: no restan, pero hacen huir palabras válidas y a veces estropean la mirilla.
9. Aguanta hasta que se acabe el tiempo y revisa tu resumen: puntos, palabras, definiciones y mejor combo.

**Modos.**
- **Fácil**: Más tiempo entre palabras y definiciones más espaciadas. Ideal para empezar.
- **Medio**: Ritmo equilibrado y velocidad estándar. El reto normal.
- **Difícil**: Cadencia rápida, palabras más pequeñas y veloces y cambios de categoría más frecuentes. Para expertos.
- **Examen**: Genera nota sobre 10 a partir de las definiciones que encuentres y aciertes.

**Consejos.**
- No dispares por impulso: primero lee la palabra y comprueba si pertenece a una de las dos categorías que puntúan ahora mismo.
- Encadena aciertos para subir el combo, pero ten paciencia con las palabras pequeñas y rápidas: apunta y espera el momento justo.
- Las gemas doradas no penalizan si fallas; con las moradas, dispara solo si crees que el premio compensa el lío de mirilla.
- Antes del examen, repasa las definiciones en el material de estudio: la nota depende justo de acertarlas.

---

## 🏰 La Fortaleza `(la-fortaleza)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Tower defense educativo en 3D propio: el alumno responde preguntas para ganar monedas, construye torres por categoría y defiende la Biblioteca contra oleadas continuas de enemigos. Está hecho con un motor de juego determinista en JS puro (engine.js) y un renderizador three.js procedural, todo separado de la capa React (LaFortaleza.jsx como contenedor, FortalezaGame.jsx como partida).

**Software.** Tres capas claramente separadas. (1) Contenedor LaFortaleza.jsx: carga datos, prepara el contenido de la partida de forma determinista por seed (prepareRun/buildQuestionDeck con mulberry32 + seededShuffle), gestiona pantallas select/playing/summary, dispara confetti (canvas-confetti) en victoria y llama a onGameComplete. (2) Motor engine.js: estado plano sin singletons ni Date.now(); todo el azar sale de game.rng (mulberry32) → mismo seed = misma partida. stepGame(dt) avanza la simulación a paso variable (dt capado a 0.05s) y emite eventos (shoot, hit, leak, boss_spawn, level_up, victory, defeat, etc.). Sistemas: mapa procedural (camino ortogonal + ramas en L con 3 puertas), torres (arquero/ráfaga/cañón/hielo/prisma/muralla/oráculo/santuario), mejoras de fortaleza (muralla externa/torretas/gran cañón), reliquias roguelite (8 con efectos pasivos en relicMods), minijuegos (Mercader, Pozo, Geoda, Desafío Relámpago), aliados (caballeros), saboteadores que demuelen torres, habilidades activas con energía (meteoro/ventisca/rayo), asedio infinito tras victoria. (3) FortalezaGame.jsx: monta la escena 3D (createScene3D de render3d.js, three.js puro con RoundedBoxGeometry + EffectComposer/UnrealBloomPass, sin assets externos), corre el bucle requestAnimationFrame, sincroniza HUD vía setHud comparando estado para evitar renders, y mapea interacción puntero (tap/orbit/zoom). Estado: useRef para el motor (uno por montaje), refs espejo (phaseRef, overlayRef, academicRef…) para el bucle rAF, y useState solo para HUD/overlays. Calidad gráfica vía servicio GLOBAL graphicsQuality (preferencia + detección de hardware + governor de FPS que baja tier en Auto; cambiar tier reconstruye la escena con key=gfxTier sin perder la partida). Sonido 100% procedural con WebAudio (sound.js, osciladores+ruido, sin ficheros ni TTS). Iconografía lucide-react + FortIcons propios; animaciones framer-motion. Puntuación: monedas/score interno del juego (kills, rachas, minijuegos, scoreMult del asedio). Nota /10 en examen = Math.round((correct/total)·100)/10 sobre la contabilidad académica (academicRef: questions/classify/boss); al ganar el examen la nota se SELLA (sealedRef) para que el asedio infinito no la altere. Anti-doble-disparo: trackedRef en el contenedor (handleEnd) + endedRef en el juego (endGame), más cleanup de desmontaje que registra el parcial como 'abandoned'.

**Jugabilidad.** Bucle: fase de preparación (2 preguntas que dan monedas/energía) → construir defensas → acción continua que nunca para. Cada 30s sube el nivel de amenaza, acelera spawns, despierta nuevas fortalezas enemigas (1→2→3 frentes), paga monedas, ofrece reliquias (cada 2 niveles), jefes (niveles 4,8,12), Desafío Relámpago (3,6,9) y Pozo (5,10,15). Durante la acción llegan preguntas periódicas (el Oráculo las acelera), aparecen Mercader y Geoda, y el jugador puede clasificar enemigos (disparo de precisión), lanzar habilidades con energía y gestionar torres. Controles unificados por puntero: tap corto = acción/selección, arrastre = orbitar cámara, rueda/pellizco = zoom; todo táctil y ratón. Botones HUD: velocidad x2, mejoras de fortaleza, terminar/salir, calidad, fullscreen, sonido. Dos modos: Práctica (supervivencia infinita, tipo test, color de pista, sin nota) y Examen (sobrevive al nivel 9, mezcla escribir/test, sin pistas, nota /10). Victoria examen = llegar al nivel 9 (+bonus por vidas); derrota = 0 vidas (en asedio infinito caer sigue contando como victoria con nota sellada). Feedback: confetti en victoria, sonidos procedurales por evento, textos flotantes y partículas en la escena.

**Educativo.** Objetivo pedagógico: consolidar vocabulario, definiciones y categorización semántica de la asignatura bajo presión de tiempo, premiando el conocimiento (los aciertos son la economía del juego: monedas, energía, golpes a jefes). Destrezas: recuperación léxica (definición→palabra, también escrita en examen), comprensión inversa (palabra→significado), discriminación verdadero/falso, clasificación por categorías y detección del intruso. La toma de decisiones estratégica (qué torre, dónde, qué reliquia, cuánto arriesgar en el pozo) añade razonamiento y planificación. Encaje curricular: principalmente Lengua/vocabulario, pero al alimentarse de los datos genéricos de rosco+runner sirve para cualquier asignatura con glosario. Aparece en Primaria (1º-6º), ESO (1º-4º), Bachillerato (heredada a todas las asignaturas vía appsBase) y Atención a la Diversidad (bloque vocabulario).

**Datos.** Contenido 100% reutilizado de la BD vía gameDataService, sin getAppContent ni datos propios. Carga en paralelo getRoscoData(level,grade,asignatura) → preguntas {definicion, solucion, difficulty} (las mismas que Rosco/Ahorcado/Crucigrama…) y getRunnerData(level,grade,asignatura) → {categoria:[palabras]} (las de Runner/Memoria/Clasificador…). El cliente filtra (categorías con ≥4 palabras, preguntas con definición+solución) y, con el seed, construye un mazo de 5 formatos (def, rev, vf, cat, intruso) en buildQuestionDeck; las preguntas de categoría/intruso usan el POOL COMPLETO del curso aunque solo se 'muestren' 2-3 categorías activas. Requiere mínimo 2 categorías y 8 preguntas o muestra estado vacío.

**Integración.** Modos: 'practice' y 'exam' (NO el triádico easy/medium/exam; no es single_mode). Tracking vía onGameComplete (no usa useGameTracker directamente; lo envuelve AppRunnerPage): examen → mode:'test', maxScore fijo 3000, nota implícita correct/total·10; práctica → mode:'practice', maxScore=score. correctAnswers/totalQuestions salen de academicRef; durationSeconds del tiempo del motor. Ranking automático estándar (solo score+maxScore; AppRunnerPage aplica multiplicador de curso). El asedio infinito multiplica el score (scoreMult) para el ranking sin tocar la nota sellada. Anti-doble-disparo robusto (trackedRef+endedRef) y registro del parcial al abandonar. Duelo 1vs1: el motor está PREPARADO (injectEnemies para insertar enemigos del rival + callback onProgress que ya emite hp/level_up), pero NO existe FortalezaGame conectado a duelo, NO hay FortalezaDuel.jsx ni está en duelableApps.js (coincide con la nota de memoria 'La Fortaleza: duelo 1vs1 pendiente'). Particularidades para mejoras: la estrella de valoración global se oculta en partida vía clase body 'fort-in-game'; la escena se reconstruye al cambiar calidad (key=gfxTier) sin perder estado; el determinismo por seed debe preservarse en cualquier cambio del motor.

**Ideas de mejora.**
- Completar el duelo 1vs1 ya cimentado: crear FortalezaDuel.jsx que use injectEnemies/onProgress, montar DuelChatBar y registrarlo en duelableApps.js (el motor ya lo soporta, es el siguiente paso natural).
- Aumentar el número de categorías activas simultáneas o permitir más de 4 colores con asignación rotatoria, para cursos con muchas categorías donde el subconjunto de 3 deja gran parte del vocabulario fuera de la mecánica visual.
- Persistir y mostrar al docente métricas académicas más finas por formato (def/rev/vf/cat/intruso) en el resumen, ya que academicRef solo agrega questions/classify/boss; ayudaría a detectar qué destreza falla el alumno.
- Ofrecer un nivel intermedio entre Práctica (sin nota) y Examen (nivel 9 fijo), p.ej. un 'Medio' con menos preguntas escritas o pistas parciales, para suavizar la curva sin saltar directamente al examen sin ayudas.

### Ficha de usuario

**¿Qué es?** La Fortaleza es un juego de estrategia y defensa (tower defense) educativo en 3D. El alumno protege su Biblioteca de oleadas de enemigos que avanzan por un camino, y para hacerlo necesita monedas… que se ganan respondiendo preguntas de la asignatura. Con esas monedas construye torres mágicas, mejora su fortaleza y consigue poderes especiales. Cada enemigo lleva una palabra de una categoría, así que conviene leer bien y colocar cada torre en el sitio adecuado. Saber más es, literalmente, defenderse mejor.

**¿Por qué es relevante?** Convierte el repaso de vocabulario en una decisión que importa: cada acierto se transforma en monedas, energía y defensas, así que el conocimiento tiene una recompensa inmediata y visible. Entrena varias competencias a la vez: recuperación de vocabulario (relacionar definición y palabra, incluso escribiéndola en el modo Examen), comprensión, clasificación de palabras por categorías y detección del intruso. A esto suma razonamiento estratégico y planificación (qué torre construir, dónde, qué reliquia elegir, cuánto arriesgar), lo que mantiene una alta implicación. Funciona pedagógicamente porque mezcla práctica espaciada, dificultad creciente y retroalimentación constante: el alumno ve sus aciertos reflejados en el juego y repite contenido sin sentir que está 'estudiando'. Encaja en Primaria, ESO, Bachillerato y Atención a la Diversidad.

**¿Cómo funciona?** Al empezar respondes unas preguntas para reunir monedas y, con ellas, levantas tus defensas. Luego comienza un asedio que no para: cada 30 segundos sube la amenaza, llegan más enemigos y aparecen nuevos frentes. Durante la partida sigues respondiendo preguntas sorpresa, eliges reliquias con poderes, te enfrentas a jefes y aprovechas minijuegos para ganar más monedas. Tus torres solo disparan a los enemigos de su categoría, así que leer las palabras es clave. Giras y acercas la cámara para verlo todo en 3D.

**Cómo se juega.**
1. Elige el modo: Práctica (aguanta todo lo que puedas, con pistas de color) o Examen (sobrevive hasta el nivel 9 y consigue tu nota sobre 10).
2. Responde las primeras preguntas para conseguir monedas y energía antes de que empiece el asedio.
3. Con esas monedas, construye torres en las casillas libres; recuerda que cada torre de categoría solo dispara a los enemigos de SU categoría (lee bien sus palabras).
4. Pulsa '¡Defender la Fortaleza!' y prepárate: los enemigos saldrán sin parar y cada vez más rápido.
5. Sigue respondiendo las preguntas sorpresa durante la acción para no quedarte sin monedas ni energía.
6. Toca un enemigo para acertar su categoría (golpe crítico) y usa tus habilidades (meteoro, ventisca, rayo) apuntando sobre el campo.
7. Mejora la Biblioteca (muralla, torretas, gran cañón), elige reliquias cuando te las ofrezcan y aprovecha al Mercader, el Pozo y la Geoda para ganar monedas extra.
8. Vence a los jefes acertando su pregunta a tiempo y resiste hasta cumplir el objetivo del modo.
9. Al terminar, revisa tu resumen: nivel alcanzado, puntos, aciertos y, en Examen, tu nota sobre 10.

**Modos.**
- **🟢 Práctica**: Supervivencia sin fin con preguntas tipo test y pistas de color. No pone nota: el reto es ver hasta qué nivel de amenaza llegas.
- **🔴 Examen**: Aguanta hasta el nivel 9, mezcla de preguntas escritas y tipo test y sin pistas. Da nota sobre 10; si ganas, la nota queda sellada y puedes seguir en el Asedio infinito.

**Consejos.**
- Lee la palabra de cada enemigo antes de colocar una torre: si la torre y el enemigo no son de la misma categoría, no le hará nada.
- No descuides las preguntas durante la acción: son tu fuente de monedas y energía para seguir defendiéndote.
- Coloca murallas en los cuellos de botella (donde los caminos se juntan) para frenar a varios enemigos a la vez mientras tus torres disparan.
- En el Pozo arriesga con cabeza: solo apuesta monedas que te sobren y cuando estés seguro de la respuesta.

---

## ⛏️ Excavación Selectiva `(excavacion-selectiva)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego educativo 3D en primera persona (estilo Minecraft) construido con React Three Fiber: el alumno camina por un mapa y mina solo los bloques cuya palabra pertenece a la categoría-objetivo, evitando distractores. La lógica de juego vive íntegramente en el hook useExcavacionSelectiva; ExcavacionSelectiva.jsx es la capa de presentación (Canvas, HUD, controles y modales).

**Software.** Arquitectura: componente raíz src/apps/excavacion-selectiva/ExcavacionSelectiva.jsx + hook de estado src/hooks/useExcavacionSelectiva.js (toda la mecánica: blocks, timeLeft, score, gameState, mission, combo, isSuddenDeath, isFrozen, lastEvent, y la acción mineBlock). Escena 3D con @react-three/fiber (Canvas, useFrame, useThree) y @react-three/drei (PointerLockControls para ratón, Text/Edges para texto y bordes de bloque). Componentes de escena: Bloque3D.jsx (cubo con boxGeometry, texturas procedurales tipo Minecraft generadas con THREE.DataTexture + NearestFilter, texto en 5 caras, partículas al destruir, detección de proximidad camera.distanceTo<5, estados isClose/isError/isDestroying y refs hasBeenMinedRef/isHoveredRef), Player.jsx (movimiento WASD+SHIFT y joystick, RUN/WALK speed, brazos animados estilo Minecraft con renderOrder 999 y depthTest:false), MobileLookControls.jsx (rotación de cámara con joystick derecho, clamp vertical, rotation.order YXZ) y Arbol3D.jsx (decoración). Móvil con react-joystick-component (doble joystick). UI: framer-motion (motion/AnimatePresence en pantalla final y modal de guía), lucide-react (Tablet, MousePointer2, BookOpen, X), Button de @/components/ui/button, crosshair SVG inline y cursor pico ⛏️ emoji con animación swing. Gestión de estado: useState/useRef/useMemo locales en el componente para control (controlMode, isLocked, cursorType, joysticks) y todo el modelo de juego encapsulado en el hook con varios useEffect (timer a 100ms, respawn de oro cada 10s, reset al cargar data) y refs (processedIdsRef anti-doble-proceso de bloque, streakRef para estrellas, suddenDeathCapRef, currentCategoryRef/allCategoriesRef/isCategorizedRef). Puntuación: target +10·multiplicador (multiplier=floor(combo/5)+1), oro +25·multiplicador, estrella +50, distractor −5, TNT −20 y −10s, freeze congela el tiempo 5s; combo se rompe a 0 con error o TNT. Nota /10 en pantalla final: Math.min((score/2000)*10, 10) — derivada del score, NO de aciertos/total. Refs anti-doble-disparo: trackedRef en el componente protege onGameComplete (se llama una vez al pasar a 'lost'); processedIdsRef en el hook evita procesar dos veces el mismo id (con excepción: en distractores se hace delete del id para permitir reintento), y hasBeenMinedRef en Bloque3D evita doble mina del cubo.

**Jugabilidad.** Bucle: el jugador elige TÁCTIL u ORDENADOR, se le asigna una categoría-objetivo (mission: '¡Busca: X!') y dispone de 60s. Recorre un mundo 3D de 200x200 con 40 árboles y ~32 bloques iniciales (15 target, 12 distractores, 3 especiales, 2 oro). Acercándose a menos de 5 unidades el cursor cambia a pico; al clicar un bloque válido (target/oro/freeze/TNT) se destruye con partículas, los distractores no se eliminan: tiemblan en rojo y penalizan. Cada 3 aciertos seguidos aparece una estrella bonus (+50 y regenera el mapa con nueva categoría). El oro reaparece cada 10s y tras minarlo. Controles: PC con PointerLock (ratón mira, clic mina, WASD mueve, SHIFT corre, ESC libera); móvil con doble joystick (izq mover, der mirar). Sin victoria por objetivos: al agotarse los 60s entra MUERTE SÚBITA (cap de 5s que se reduce 0,1s por acierto y baja 1s por error/distractor); cuando el cronómetro de muerte súbita llega a 0, gameState='lost' y aparece la pantalla final con XP y nota. Feedback: animación de pico (swing), partículas 3D, eventos visuales por clase CSS (shake-effect en TNT, time-frozen en freeze, sudden-death-mode), overlays de TIEMPO DETENIDO y ¡MUERTE SÚBITA! ¡CORRE!, indicador de COMBO xN. No se observa canvas-confetti ni TTS en este código.

**Educativo.** Objetivo pedagógico: clasificación y discriminación léxico-semántica — el alumno debe reconocer rápidamente qué palabras pertenecen a una categoría (la categoría-objetivo) frente a distractores de otras categorías, reforzando vocabulario, campos semánticos y atención sostenida bajo presión de tiempo. Entrena velocidad de procesamiento, control inhibitorio (no minar el distractor), memoria de la consigna y orientación espacial en un entorno 3D. Aparece de forma transversal: figura en commonApps y se reparte por asignaturas en primariaApps, esoApps y bachilleratoApps, además de Atención a la Diversidad (adApps) en bloques como 'vocabulario' y 'atencion'. Al no tener modos easy/medium/exam, es una actividad de práctica continua apta para repaso de vocabulario en cualquier materia que tenga datos tipo runner.

**Datos.** El contenido educativo se obtiene con getRunnerData(level, grade, subjectPrefix) de src/services/gameDataService.js, que llama a la RPC get_runner_data y devuelve un objeto categorizado { categoria: [palabras...] } (con cache en memoria de 5 min y resolución de nivel 'ad' vía AD_SUBJECT_MAP). subjectPrefix = subjectId || (level==='primaria' ? 'lengua' : 'general'). El hook detecta el formato: si recibe data.wallData (array) usa una rama 'excavación' con {text,isTarget}; en la práctica getRunnerData entrega el formato categorizado, por lo que isCategorizedRef=true y se elige una categoría-objetivo al azar entre Object.keys; los target salen de esa categoría y los distractores de las demás. La 'GUÍA DE PALABRAS' (cheat sheet) muestra todas las categorías y palabras filtrando las claves title e instructions.

**Integración.** Sin modos de dificultad: es single_mode (registrada así en app_scoring_config según CLAUDE.md; Excavación Selectiva está en la lista de single_mode junto a Célula Animal/Vegetal y Sistema Solar). Tracking: onGameComplete se dispara una sola vez al entrar en gameState==='lost' (protegido por trackedRef y reseteado al volver a 'playing'), con payload mode:'practice', score, maxScore: Math.max(score,2000), correctAnswers: floor(score/100) y totalQuestions: max(floor(score/100),1). No se importa useGameTracker directamente en el componente: el tracking de sesión y el procesamiento de XP/insignias/ranking los gestiona AppRunnerPage al recibir onGameComplete. La nota mostrada en pantalla (score/2000·10 capada a 10) es informativa y no se envía como override nota. La app se trata como 'wide' (WIDE_APP_IDS en AppRunnerPage). No es duelable (no aparece en duelableApps). Particularidades a vigilar: (1) NUEVA PARTIDA hace window.location.reload(), lo que reinicia toda la página en vez de reestablecer estado; (2) correctAnswers/totalQuestions se derivan del score, no del recuento real de aciertos, por lo que cualquier ajuste de scoring afecta a las métricas de sesión; (3) la nota de pantalla y los campos de onGameComplete usan escalas distintas (2000 vs floor(score/100)); (4) la rama wallData del hook está presente pero no la alimenta getRunnerData.

**Ideas de mejora.**
- Llevar un recuento real de aciertos/errores/distractores en el hook y enviarlo en onGameComplete (correctAnswers/totalQuestions reales) en lugar de derivarlos del score; mostrar también precisión (% de bloques correctos) en la pantalla final.
- Sustituir window.location.reload() de 'NUEVA PARTIDA' por un reinicio de estado del hook (resetear data/score/timer) para evitar recargar toda la página y volver a pedir datos a Supabase.
- Adoptar el ajuste GLOBAL de calidad gráfica (src/services/graphicsQuality.js + useGraphicsQuality + GraphicsQualitySelector con Canvas key={tier}) para dispositivos modestos, ya que la escena 3D con texturas procedurales y partículas puede ser exigente.
- Añadir feedback sonoro/TTS (leer la palabra minada o la consigna) y canvas-confetti al lograr estrellas o combos altos, reforzando la asociación palabra-categoría y la accesibilidad para Atención a la Diversidad.

### Ficha de usuario

**¿Qué es?** Excavación Selectiva es un juego educativo en 3D, en primera persona y con estética de bloques tipo Minecraft. Te mueves por un mundo lleno de cubos que llevan escrita una palabra y, al empezar la partida, recibes una categoría objetivo (por ejemplo, un campo semántico concreto). Tu tarea es excavar únicamente los bloques cuya palabra pertenece a esa categoría y dejar intactos los demás. Por el camino aparecen bloques especiales (oro, estrellas, hielo y dinamita) que premian o complican la excavación. Es repaso de vocabulario convertido en aventura.

**¿Por qué es relevante?** Trabaja una destreza clave del aprendizaje: clasificar palabras por su significado y distinguir lo que pertenece a una categoría de lo que no. Al obligar a decidir rápido cuál minar, entrena vocabulario y campos semánticos, pero también atención sostenida, velocidad de procesamiento y, sobre todo, control de impulsos: hay que frenar antes de excavar un bloque que no toca. El entorno 3D y la cuenta atrás convierten un ejercicio de discriminación léxica en una experiencia motivadora, y la fase de muerte súbita añade tensión que mantiene la concentración. Funciona porque combina repetición espaciada (muchas palabras en poco tiempo) con feedback inmediato: cada acierto suma y cada error penaliza al instante, de modo que el alumno ajusta su criterio sobre la marcha. Es transversal a muchas asignaturas y muy adecuada para repaso y para Atención a la Diversidad.

**¿Cómo funciona?** Al entrar eliges si jugar con ordenador o en táctil. Recibes una categoría que buscar y dispones de 60 segundos. Te desplazas por el escenario, te acercas a los cubos para leer su palabra y excavas solo los correctos. Los aciertos suman puntos y encadenarlos activa combos y bonus; los errores restan. Cuando se acaba el tiempo entra la muerte súbita, en la que cada acierto te da unos segundos extra. Al final ves tu puntuación XP y una nota sobre 10.

**Cómo se juega.**
1. Elige tu modo de control: TÁCTIL (móvil o tablet) u ORDENADOR (ratón y teclado). Si quieres, abre antes la GUÍA DE PALABRAS para repasar las categorías.
2. Lee arriba la misión: la categoría de palabras que debes buscar y excavar.
3. Muévete por el mundo: en ordenador con WASD y SHIFT para correr; en táctil con el joystick izquierdo para moverte y el derecho para mirar.
4. Acércate a un bloque hasta que el punto de mira se convierta en un pico: solo entonces puedes excavarlo.
5. Excava (clic o toque) únicamente los bloques cuya palabra pertenezca a la categoría buscada; deja los distractores quietos para no perder puntos.
6. Encadena aciertos seguidos para subir el combo y multiplicar tus puntos, y consigue estrellas bonus cada 3 aciertos.
7. Aprovecha los bloques de oro (puntos extra) y los de hielo ❄️ (congelan el tiempo), y evita la dinamita TNT, que resta puntos y tiempo.
8. Cuando el reloj llegue a cero entrarás en MUERTE SÚBITA: sigue acertando para ganar segundos y aguantar lo máximo posible.
9. Al terminar, revisa tu puntuación XP y tu nota sobre 10, y pulsa NUEVA PARTIDA para volver a intentarlo.

**Modos.**
_Sin modos diferenciados._

**Consejos.**
- No tengas prisa con los distractores: es mejor perder un segundo leyendo bien la palabra que excavar un bloque equivocado y perder puntos y racha.
- Vigila el combo: tres aciertos seguidos hacen aparecer una estrella que da muchos puntos y renueva el reto con una categoría nueva.
- Guarda la cabeza fría en la muerte súbita: cada acierto te regala tiempo, así que prioriza los bloques que tengas más cerca y seguros.
- Si dudas de qué palabras entran en cada categoría, consulta la GUÍA DE PALABRAS antes de empezar.

---

## 📝 Ordena la Frase `(ordena-la-frase)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de construcción de frases por arrastre de palabras. Arquitectura clásica de tres capas: un wrapper (OrdenaLaFraseJuego.jsx) que resuelve params y carga datos, un hook con toda la lógica (useOrdenaLaFraseGame.js) y un único componente de presentación (OrdenaLaFraseUI.jsx) que gestiona tanto práctica como examen sin librerías 3D ni animación.

**Software.** Tres ficheros principales: (1) src/apps/_shared/OrdenaLaFraseJuego.jsx — wrapper fino que lee level/grade/subjectId con useParams, carga el contenido con getOrdenaFrasesData (RPC get_ordena_frases_data) en un useEffect, calcula conTemporizador = (primaria && grade>=3) || eso, instancia el hook y renderiza la UI; muestra estados de carga y de 'sin contenido'. (2) src/hooks/useOrdenaLaFraseGame.js — concentra TODO el estado (palabrasOrigen, palabrasDestino, mision, feedback, isTestMode, testQuestions, userAnswers, score, elapsedTime, showResults, fontStyle) con useState/useRef/useCallback; no usa reducer ni store global. (3) src/apps/_shared/OrdenaLaFraseUI.jsx + OrdenaLaFraseShared.css — presentación de práctica, examen y pantalla de resultados. Librerías: SOLO canvas-confetti (importado directamente en el hook, lanzado en el centro de la zona destino vía getBoundingClientRect al acertar en práctica). NO usa framer-motion, three/@react-three/fiber, lucide-react ni TTS; los iconos son emojis y un SVG inline (papelera). Drag-and-drop: HTML5 nativo para ratón (handleDragStart/Over/Drop con dataTransfer implícito vía draggedItem ref) e implementación táctil propia (handleTouchStart clona el nodo DOM a document.body con clase palabra-clone y lo mueve con transform; handleTouchEnd hace hit-test contra la zona destino). Reordenado por inserción usando getDropTarget (hit-test de coordenadas). Click-to-move como tercera vía (handleOriginWordClick / handleRemoveWord). Puntuación examen: calculateScore = correctCount*100 + timeBonus, con timeBonus = max(0, round(300*(1 - time/(5*20)))) solo si hay aciertos; comparación por igualdad estricta de strings (newAnswers[i] === q.solucion). Nota /10 en la UI: Math.round((correct/TOTAL_TEST_QUESTIONS)*100)/10 con color (>=8 excellent, >=5 good, <5 fail) y mensaje (>=9 Excelente, >=7 Muy bien, >=5 Aprobado, <5 Necesitas repasar). Anti-doble-disparo: trackedRef (examen, se rearma al salir de resultados) y practiceTrackedRef (práctica, con reset a 500ms tras cada acierto) en OrdenaLaFraseUI.

**Jugabilidad.** Bucle: se muestra una frase desordenada cuyas palabras están en la zona origen; el alumno las lleva a la zona destino en el orden correcto. Tres formas de mover palabra: arrastrar (ratón), arrastrar/tocar (táctil con clon visual) o hacer clic (origen→destino) y botón papelera (destino→origen). Modo Práctica Libre: infinito, botones 'Comprobar' (feedback textual ¡Correcto!/Casi... + confeti al acertar), 'Otra Frase' (carga otra evitando repetir la anterior) y 'Solución' (toggle que muestra la frase correcta). Modo Examen: 5 frases (TOTAL_TEST_QUESTIONS) seleccionadas aleatorias y únicas, barra de progreso, botón Siguiente/Finalizar, SIN feedback por frase ni confeti; pantalla de resultados con nota/10, puntos, tiempo y revisión frase a frase (tu respuesta vs solución). Temporizador visible solo en examen y solo si conTemporizador (primaria>=3º o ESO). No hay vidas ni derrota: el examen siempre termina y se puntúa lo logrado; en práctica no hay fin. Selector de tipografía (slider Imprenta/Ligada/Mayúsculas) compartido por ambos modos.

**Educativo.** Objetivo: construcción sintáctica y orden de los constituyentes de la oración (sujeto-verbo-complementos), coherencia y sentido. Entrena morfosintaxis, conciencia del orden de palabras, lectura y autocorrección. El selector Imprenta/Ligada/Mayúsculas favorece a primeros lectores y a alumnado con necesidades de lectoescritura. Encaje curricular: aparece en Lengua de Primaria, ESO y Bachillerato (heredada en appsBase), y de forma destacada en Atención a la Diversidad (morfosintaxis, pragmática, comprensión-oral, lectoescritura y lectoescritura-adaptada, funciones-ejecutivas, habilidades-sociales, autonomía).

**Datos.** Contenido 100% externo: getOrdenaFrasesData(level, grade, asignatura) en src/services/gameDataService.js, que llama a la RPC Supabase get_ordena_frases_data (con resolveADParams para Atención a la Diversidad y caché en memoria). Devuelve un array de strings (cada string es una frase-solución). El hook reparte la frase con solucion.split(' ') y baraja las palabras; la 'solución' es la propia frase tal cual viene de BD. No hay datos hardcodeados en el componente salvo el feedback inicial (flechas) y los textos de UI.

**Integración.** Modos: solo Práctica Libre y Examen (no hay tres niveles easy/medium/exam: la dificultad la marca el contenido por curso). NO está registrada como single_mode ni en app_scoring_config, y NO está en duelableApps.js (sin duelo 1 vs 1 ni DuelChatBar). Tracking vía onGameComplete: en examen dispara una vez (mode:'test', score, maxScore=TOTAL_TEST_QUESTIONS*100+300=800, correctAnswers, totalQuestions, durationSeconds); en práctica dispara mode:'practice' con score 0 por cada frase acertada solo para registrar tiempo de juego (no puntúa). AppRunnerPage/useGameTracker aplican multiplicador de curso, XP, insignias, avatares y ranking. Particularidades a vigilar: (1) la comparación es igualdad EXACTA de string, así que tildes, mayúsculas, espacios dobles o signos de puntuación en los datos de BD pueden hacer 'imposible' una frase; (2) maxScore=800 es fijo y el ranking depende de tiempo, lo que penaliza a quien no juega con temporizador (primaria 1º-2º) porque siempre obtiene timeBonus=0 si elapsedTime=0... en realidad con time=0 el bonus sería 300 (1-0)=300, conviene revisar el caso sin temporizador; (3) no hay límite de tiempo por frase ni vidas en examen; (4) selección de examen usa solo 5 frases distintas, si el set tiene <5 frases únicas el examen es más corto.

**Ideas de mejora.**
- Normalizar la comparación de respuestas (trim, colapsar espacios y, opcionalmente, ignorar mayúsculas/tildes) para evitar falsos negativos por datos de BD con puntuación o espacios irregulares.
- Revisar la puntuación cuando NO hay temporizador (primaria 1º-2º): con elapsedTime=0 el timeBonus da el máximo (300) sin esfuerzo; convendría desactivar el bonus de tiempo o aplicar uno alternativo en esos cursos para un ranking justo.
- Añadir feedback por frase en examen (marcar verde/rojo al pasar de pregunta) o al menos resaltar la palabra fuera de sitio, conservando el carácter de examen pero mejorando el valor formativo.
- Soportar frases con varias soluciones válidas (p. ej. orden alternativo de complementos) marcando aceptadas en BD, e incorporar audio TTS opcional de la frase formada para reforzar comprensión oral en AD.

### Ficha de usuario

**¿Qué es?** Ordena la Frase es un juego de lengua en el que aparecen las palabras de una oración desordenadas y hay que colocarlas en el orden correcto para que la frase tenga sentido. El alumnado arrastra o pulsa cada palabra para llevarla a su sitio y, cuando cree que está bien, comprueba el resultado. Incluye un selector de tipo de letra (imprenta, ligada o mayúsculas) para adaptarse a cada lector, y funciona igual de bien con ratón, teclado táctil o pantalla.

**¿Por qué es relevante?** Ordenar palabras para formar oraciones es una de las mejores maneras de interiorizar la estructura de la lengua: el alumnado descubre, manipulando, dónde va el sujeto, el verbo y los complementos, y por qué un orden suena bien y otro no. Trabaja la conciencia sintáctica, la lectura comprensiva, la atención y la autocorrección, porque cada intento obliga a releer y a comprobar si la frase tiene sentido. Al ser una actividad manipulativa y con respuesta inmediata, mantiene la motivación y permite el ensayo y error sin penalización en el modo práctica. El selector de letra (imprenta, ligada, mayúsculas) lo hace especialmente útil en los primeros cursos y en Atención a la Diversidad, donde adaptar el formato del texto marca la diferencia.

**¿Cómo funciona?** Hay dos formas de jugar. En Práctica Libre el alumno construye frases sin límite, comprueba cuando quiere, recibe ánimo y confeti al acertar y puede pedir la solución o pasar a otra frase. En Examen se proponen cinco frases seguidas, sin pistas, y al terminar se obtiene una nota sobre 10, los puntos conseguidos y un repaso de cada respuesta junto a la solución correcta. En los cursos a partir de 3º de Primaria y en la ESO el examen incluye un cronómetro que premia la rapidez con puntos extra.

**Cómo se juega.**
1. Lee las palabras desordenadas que aparecen en la zona inferior.
2. Si quieres, elige el tipo de letra con el deslizador (imprenta, ligada o mayúsculas).
3. Lleva cada palabra a la zona superior arrastrándola, tocándola o haciendo clic sobre ella, en el orden que forme una frase con sentido.
4. Para devolver una palabra, pulsa el icono de papelera que aparece sobre ella en la zona superior.
5. En Práctica Libre, pulsa 'Comprobar' para ver si la frase es correcta; si te atascas, usa 'Solución' o 'Otra Frase'.
6. Para examinarte, pulsa 'Examen': tendrás cinco frases seguidas y sin ayudas.
7. En el examen, ordena cada frase y pulsa 'Siguiente'; en la última pulsa 'Finalizar'.
8. Consulta tu nota sobre 10, tus puntos y el repaso de cada frase con su solución.
9. Pulsa 'Volver a intentar' para repetir el examen o 'Modo Práctica' para seguir entrenando.

**Modos.**
- **Práctica Libre**: Construyes frases sin límite, con botón de comprobar, ayuda para ver la solución y confeti al acertar. No cuenta para la nota.
- **Examen**: Cinco frases seguidas sin pistas. Al final obtienes nota sobre 10, puntos y repaso de cada respuesta. A partir de 3º de Primaria y en la ESO incluye cronómetro con puntos extra por rapidez.

**Consejos.**
- Lee la frase completa en voz baja antes de comprobar: si suena natural, suele estar bien ordenada.
- Empieza colocando el sujeto y el verbo, y luego encaja los complementos a su alrededor.
- En el examen ve con calma pero sin pararte demasiado: si hay cronómetro, la rapidez suma puntos extra.
- Si una frase se te resiste en práctica, usa 'Solución' para aprender el orden correcto y vuelve a intentarlo.

---

## 📚 Ordena la Historia `(ordena-la-historia)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de secuenciación narrativa: el alumno reordena las frases sueltas de un relato hasta reconstruir el orden lógico-temporal correcto. Implementada como componente React con un hook de lógica propio (useOrdenaLaHistoriaGame) y una UI compartida sin framer-motion (animaciones de reordenación via FLIP manual con getBoundingClientRect).

**Software.** Tres ficheros principales: src/apps/_shared/OrdenaLaHistoriaJuego.jsx (contenedor que lee useParams, carga datos y monta la UI), src/apps/_shared/OrdenaLaHistoriaUI.jsx (render de práctica/examen/resultados) y src/hooks/useOrdenaLaHistoriaGame.js (toda la lógica y estado). Estado vía useState/useRef en el hook: frasesDesordenadas, historiaCorrecta, feedback, fontStyle, isTestMode, testQuestions, currentStoryIndex, userAnswers, score, elapsedTime, showResults. Librerías: canvas-confetti (confeti al acertar en práctica, origen calculado sobre el centro del dropZoneRef). NO usa framer-motion, three/r3f, TTS ni lucide-react; los iconos de las flechas son SVG inline y el icono de la app es el emoji 📚. Las animaciones de reordenación se hacen con una técnica FLIP casera en useLayoutEffect: itemsRef (Map id->elemento) + prevPositions, calculando deltaY y aplicando transform+transition CSS. Drag and drop nativo HTML5 (handleDragStart/Drop/Over con getDragAfterElement por geometría) más un sistema táctil propio con clon flotante (handleTouchStart crea un cloneNode fixed, handleTouchMove lo mueve, handleTouchEnd hace hit-test contra el dropZone). Puntuación de examen: calculateScore = correctCount*100 + timeBonus, donde timeBonus = round(300*(1 - tiempo/(TOTAL_TEST_STORIES*30))) capado a >=0 y solo si hay aciertos (ref 30s por historia). maxScore declarado = TOTAL_TEST_STORIES*100 + 300 = 800. Nota /10 calculada en la UI: Math.round((correct/TOTAL_TEST_STORIES)*100)/10 con colores excellent>=8 / good>=5 / fail y mensajes Excelente>=9, Muy bien>=7, Aprobado>=5, Necesitas repasar. La validación del orden es por igualdad de strings (frases unidas con join). Anti-doble-disparo: dos refs en la UI, trackedRef (examen, se resetea cuando !showResults) y practiceTrackedRef (práctica, con reset por setTimeout de 500ms tras cada acierto).

**Jugabilidad.** Bucle: se presenta un relato con sus frases desordenadas y el alumno las recoloca arrastrando (ratón o táctil) o con botones de flecha por cada frase (subir/bajar y, en los extremos, doble flecha para mover al principio/final). Modo Práctica Libre: botón Comprobar valida el orden (feedback verde 'Correcto, la historia tiene sentido' + confeti, o rojo 'Casi, intenta ordenar de otra manera'), botón 'Otra Historia' carga otra distinta (evita repetir la inmediatamente anterior) y botón Solución muestra el orden correcto en lista numerada. Modo Examen: 5 historias (TOTAL_TEST_STORIES) seleccionadas aleatoriamente y deduplicadas, con barra de progreso y botón Siguiente/Finalizar; en cursos grade>=3 hay temporizador (conTemporizador = grade>=3) que cuenta tiempo y alimenta el bonus de velocidad. No hay vidas ni condición de derrota; la 'derrota' es nota baja. Pantalla de resultados con nota/10, puntos, tiempo total y el orden correcto de las 5 historias. Selector de tipografía (slider Imprenta/Ligada/Mayúsculas) para adaptarse a lectores noveles.

**Educativo.** Objetivo pedagógico: comprensión lectora y estructura narrativa (secuenciación temporal y causal de eventos, identificar inicio-nudo-desenlace, uso de conectores). Entrena ordenación lógico-cronológica, coherencia y cohesión textual, memoria de trabajo y razonamiento secuencial. Encaje curricular principal en Lengua/lectoescritura, pero al heredarse a múltiples asignaturas también sirve para ordenar procesos (ciencias), secuencias históricas (sociales) o pasos de un procedimiento. Registrada en Primaria 1º-6º (Lengua, Ciencias Naturales, Sociales, Inglés, Valenciano, Francés, Programación y algunas variantes de Matemáticas), ESO (67 referencias en esoApps.js) y Bachillerato (appsBase, heredada a todas las asignaturas). El selector de tipografía y la ausencia de penalización agresiva la hacen apta también para primeros cursos y Atención a la Diversidad.

**Datos.** El contenido proviene de getOrdenaHistoriasData(level, grade, asignatura) en src/services/gameDataService.js, que llama a la RPC Supabase get_ordena_historias_data (params p_level, p_grade, p_subject), con resolución de parámetros AD (resolveADParams) y cacheo en frontend (cacheKey/getCached/setCache) más deepParseJSON. Devuelve un array de historias, cada una un array de frases (strings) en su orden correcto. En primaria la asignatura por defecto es 'general' si no hay subjectId. El hook mapea cada frase a un item con id único (frase-timestamp-index) y baraja con sort aleatorio.

**Integración.** Modos: NO sigue el patrón estándar easy/medium/exam de selección previa; ofrece dos modos conmutables con botones (Práctica Libre y Examen), y la 'dificultad' real se modula por curso (temporizador activo solo en grade>=3). onGameComplete se dispara con mode='test' al terminar el examen (score, maxScore=800, correctAnswers, totalQuestions=5, durationSeconds=elapsedTime) y con mode='practice' (score 0, maxScore 0) cada vez que se acierta una historia en práctica, lo que solo registra tiempo de juego, no completa tareas. El tracking de sesión lo gestiona AppRunnerPage/useGameTracker (session_id por montaje, una fila por partida). Ranking automático: solo se envían score y maxScore y AppRunnerPage aplica el multiplicador de curso. No está en duelableApps.js (sin duelo 1 vs 1) ni monta DuelChatBar. No figura como single_mode, por lo que solo el modo examen cuenta para completar tareas. Particularidades a vigilar para mejoras: (1) la comparación de orden por join de strings es frágil si dos frases de una historia son textualmente idénticas (pueden dar falsos positivos/negativos); (2) maxScore fijo a 800 mientras la nota se calcula aparte por aciertos, cumpliendo la doble progresión; (3) el reset de practiceTrackedRef por setTimeout puede generar múltiples eventos practice si se acierta repetidamente; (4) los ids basados en Date.now()+index pueden colisionar al mapear varias historias en el mismo tick.

**Ideas de mejora.**
- Permitir contenido con audio (TTS con SpeechSynthesis para escuchar cada frase, útil en lectoescritura y AD), ya que actualmente no hay narración por voz.
- Robustecer la validación: comparar por identidad/índice de frase en vez de por texto concatenado para soportar relatos con frases repetidas y evitar falsos aciertos; mostrar en resultados qué historias falló el alumno (ahora solo muestra el orden correcto, no su respuesta).
- Añadir niveles de dificultad explícitos (nº de frases por historia, con/sin pistas de conectores, o frases intrusas) en pantalla previa, alineando la app con el patrón estándar easy/medium/exam.
- Incorporar duelo 1 vs 1 (OrdenaLaHistoriaDuel + registro en duelableApps con DuelChatBar) reutilizando el hook, ya que la mecánica por rondas encaja bien con el formato de duelo.

### Ficha de usuario

**¿Qué es?** Ordena la Historia es un juego de comprensión lectora en el que aparece un relato con sus frases mezcladas y desordenadas. La tarea consiste en recolocar esas frases hasta reconstruir el orden correcto de la historia, de principio a fin. Se puede jugar en modo práctica, para entrenar sin presión y con ayudas, o en modo examen, donde se ordenan cinco historias seguidas y se obtiene una nota. Incluye un selector de tipografía (imprenta, ligada o mayúsculas) para adaptarse a cada lector.

**¿Por qué es relevante?** Ordenar los acontecimientos de un relato es una de las destrezas básicas de la comprensión lectora: obliga a entender qué pasó antes y después, a identificar causas y consecuencias y a reconocer la estructura inicio-nudo-desenlace. Al manipular las frases físicamente, el alumnado razona sobre los conectores temporales, la coherencia y el sentido global del texto, no solo sobre palabras sueltas. Desarrolla competencia en comunicación lingüística, razonamiento lógico y memoria de trabajo. Funciona pedagógicamente porque convierte una tarea abstracta de comprensión en una manipulación concreta y reversible: el alumno prueba, comprueba, recibe respuesta inmediata y corrige, aprendiendo del error sin penalización. El selector de tipografía y el modo práctica lo hacen accesible desde los primeros lectores hasta cursos superiores.

**¿Cómo funciona?** La aplicación carga relatos adaptados al curso y la asignatura y muestra sus frases desordenadas. El alumno las reordena arrastrándolas o usando las flechas de cada frase. En práctica puede comprobar el orden cuantas veces quiera, pedir otra historia o ver la solución. En examen ordena cinco historias seguidas y al terminar recibe una nota sobre diez, los puntos conseguidos y el orden correcto de cada relato. En los cursos a partir de tercero el examen cronometra, premiando también la rapidez con puntos extra.

**Cómo se juega.**
1. Elige el modo: empieza en Práctica Libre para entrenar o pulsa Examen cuando quieras nota.
2. Lee todas las frases desordenadas que forman la historia.
3. Recoloca cada frase: arrástrala con el ratón o el dedo, o usa las flechas arriba y abajo de cada frase.
4. Para mover una frase directamente al principio o al final, usa los botones de doble flecha de los extremos.
5. En práctica, pulsa Comprobar para ver si el orden es correcto; si aciertas, saltará el confeti.
6. Si te atascas, pulsa Solución para ver el orden correcto, u Otra Historia para probar con un relato distinto.
7. En examen, ordena la historia y pulsa Siguiente; repite hasta completar las cinco historias y pulsar Finalizar.
8. Revisa al final tu nota sobre diez, los puntos obtenidos y el orden correcto de cada relato.
9. Si lo necesitas, ajusta el tipo de letra (imprenta, ligada o mayúsculas) con el deslizador superior.

**Modos.**
- **Práctica Libre**: Entrenamiento sin nota: ordena historias de una en una, comprueba cuantas veces quieras, cambia de relato o consulta la solución. Ideal para aprender sin presión.
- **Examen**: Cinco historias seguidas para ordenar; al final se obtiene nota sobre diez, puntos y el orden correcto. A partir de tercero incluye cronómetro con bonus por rapidez.

**Consejos.**
- Localiza primero la frase que abre la historia y la que la cierra; el resto encaja más fácil entre medias.
- Fíjate en los conectores y marcadores temporales (primero, luego, después, al final) para deducir el orden.
- En práctica, usa el botón Solución solo cuando lo hayas intentado de verdad: se aprende más equivocándose y corrigiendo.
- Si lees mejor con un tipo de letra concreto, ajusta el deslizador de tipografía antes de empezar.

---

## 🕵️ Detective de Palabras `(detective-de-palabras)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego de segmentación léxica en el que se muestra una frase escrita sin espacios y el alumno marca, haciendo clic entre letras, dónde van las separaciones de palabra. Está construido con un patrón contenedor/UI/hook: DetectiveDePalabrasJuego.jsx (carga de datos), DetectiveDePalabrasUI.jsx (vista) y el hook useDetectiveDePalabras.js (toda la lógica de estado y puntuación).

**Software.** Arquitectura en tres capas dentro de src/apps/_shared y src/hooks. (1) Contenedor src/apps/_shared/DetectiveDePalabrasJuego.jsx: lee level/grade/subjectId con useParams de react-router-dom, normaliza grado (cap 6 primaria / 4 ESO) y asignatura, carga el contenido con getDetectiveData y aplica una cadena de fallbacks (asignatura→'general'→grado 1); normaliza cada item a {solucion} y baraja con Fisher-Yates antes de pasarlo al hook. (2) Vista src/apps/_shared/DetectiveDePalabrasUI.jsx: render de la frase como spans de letra con separadores clicables, cabecera con slider de tipografía (Imprenta/Ligada/Mayúsculas), barra de progreso y pantalla de resultados. (3) Hook src/hooks/useDetectiveDePalabras.js: gestiona todo el estado con useState/useCallback/useEffect (letras[], puntuacion, score, isTestMode, testQuestions, userAnswers, startTime/elapsedTime, showResults, fontStyle). Librerías: canvas-confetti (única dependencia externa de efectos; se dispara con origin calculado desde containerRef.getBoundingClientRect normalizado al viewport). NO usa framer-motion, three/@react-three/fiber, lucide-react ni TTS; las animaciones (shake del feedback, gradient-text) son CSS en DetectiveDePalabrasShared.css. Estado: local al hook, sin store global. Puntuación examen: calculateScore = correctCount·100 (BASE_POINTS_PER_QUESTION) + bonus de velocidad lineal hasta 200 (MAX_SPEED_BONUS) decreciente en ventana de 180 s; DETECTIVE_MAX_SCORE = 5·100+200 = 700. La nota /10 se calcula en la UI como Math.round((correct/5)·100)/10 con colores excellent/good/fail y mensajes Excelente/Muy bien/Aprobado/Necesitas repasar. En práctica la puntuacion suma +10 por frase resuelta pero no se reporta. Anti-doble-disparo: trackedRef (useRef) protege el onGameComplete de examen (se resetea cuando showResults pasa a false) y practiceTrackedRef con timeout de 500 ms protege el envío de práctica. Comparación de respuestas: getTransformedSolution aplica toUpperCase si la tipografía es 'uppercase', por lo que la corrección depende del estilo de fuente seleccionado.

**Jugabilidad.** Bucle: se presenta la frase objetivo sin espacios (replace de espacios sobre la solución) y el jugador inserta/quita separadores haciendo clic con toggleSeparador, tanto sobre la letra como sobre el hueco separador. Controles: solo ratón/táctil (clic/tap entre letras); no hay control por teclado. Modos: Práctica Libre (botón ¡Comprobar! que pinta cada separador de verde 'correcto'/rojo 'incorrecto', con feedback textual; acierto total solo si todos los espacios de la solución están marcados y no sobra ninguno) y Examen (5 frases seleccionadas al azar, cronómetro visible, se avanza con Siguiente/Finalizar y al final pantalla de resultados). En examen no hay marcado por color durante la partida: la respuesta del usuario se serializa con getUserAttempt y se compara literal contra la solución transformada. Victoria/derrota: en práctica no hay derrota, solo acierto por frase; en examen no hay vidas, la 'nota' es proporcional a frases exactas. Feedback: confeti (canvas-confetti) centrado sobre la frase al resolver en práctica, animación shake en error, mensajes con emoji. No hay sonidos.

**Educativo.** Objetivo pedagógico: trabajar la segmentación léxica y la conciencia de los límites de palabra, una destreza clave de lectoescritura. Entrena reconocimiento de palabras dentro de una cadena gráfica continua, separación correcta de palabras al escribir (hiposegmentación, error frecuente en lectoescritores noveles), atención visual y análisis fonológico-ortográfico. El slider de tipografía (imprenta, ligada/cursiva, mayúsculas) permite adaptar la presentación al momento lector del alumno. Encaje curricular: aparece en el bloque de Lengua y áreas de idioma. Cursos: ESO y Bachillerato (en asignaturas de idioma, appsIdioma) y, sobre todo, en Atención a la Diversidad, donde figura en numerosos itinerarios (morfosintaxis, pragmática, lectoescritura, lectoescritura-adaptada, atención, funciones-ejecutivas), lo que la convierte en un recurso transversal de refuerzo. En AD los parámetros de contenido se remapean vía resolveADParams/AD_SUBJECT_MAP a un nivel/grado/asignatura reales de la BD.

**Datos.** El contenido procede de getDetectiveData(level, grade, subjectId) en src/services/gameDataService.js, que llama a la RPC de Supabase get_detective_data (con cache propia por clave y deepParseJSON). Devuelve una lista de frases cuya solución (con espacios correctos) puede venir como string suelto o como objeto {solucion}; el contenedor normaliza ambos a {solucion}. No usa getAppContent ni datos hardcodeados en el componente: el banco de frases es 100% de BD. Para AD, resolveADParams traduce la asignatura AD a (level, grade, subject) reales antes de consultar.

**Integración.** Modos: solo Práctica Libre y Examen (mode:'test'); NO implementa selección previa de tres niveles easy/medium/exam, sino dos botones de modo dentro de la misma pantalla. NO es single_mode y NO está en duelableApps.js (no hay componente Duel ni soporte 1 vs 1). Registro: appDetectiveDePalabras en commonApps.js (id 'detective-de-palabras') y referenciado en esoApps.js, bachilleratoApps.js (appsIdioma) y adApps.js. Tracking: el onGameComplete lo dispara la UI directamente (no se ve uso de useGameTracker en estos ficheros; el wrapping de sesión lo aporta AppRunnerPage). En examen reporta {mode:'test', score, maxScore:700, correctAnswers, totalQuestions:5, durationSeconds}; en práctica reporta micro-eventos {mode:'practice', score:0, maxScore:0, correctAnswers:1,...} por cada frase resuelta. Ranking: automático vía score/maxScore al subir AppRunnerPage los datos a track_student_session. Particularidades para mejoras: (a) la nota se recalcula en la UI y no se pasa explícitamente como nota a onGameComplete; (b) la corrección literal depende de getTransformedSolution, lo que acopla resultado y tipografía seleccionada (mayúsculas); (c) TOTAL_TEST_QUESTIONS=5 está duplicado como constante en hook y UI; (d) startTest hace slice(0,5) sin garantizar 5 frases si el banco es menor.

**Ideas de mejora.**
- Unificar al patrón estándar de selección previa easy/medium/exam (p. ej. fácil = frases cortas con ayuda de marcado en vivo, medio = sin ayuda, examen = actual) en lugar de los dos botones de modo, para alinearse con el resto de apps y con el tracking de tareas.
- Pasar nota explícita en onGameComplete y desacoplar la comparación de la tipografía (normalizar mayúsculas/acentos al comparar) para que elegir 'Mayúsculas' no altere la corrección.
- Añadir control por teclado/accesibilidad (espacio/flechas para mover el cursor de separación y marcar) y soporte de lector de pantalla en los separadores, hoy solo accionables con clic.
- Incorporar InstructionsModal/botón de material de estudio y feedback sonoro opcional; además, en examen, mostrar marcado por color de los espacios acertados/fallados en el resumen para reforzar el aprendizaje.

### Ficha de usuario

**¿Qué es?** Detective de Palabras es un juego de lectura en el que aparece una frase escrita de corrido, sin ningún espacio entre sus palabras, y tu misión es descubrir dónde van las separaciones. Haciendo clic entre las letras vas marcando los límites de cada palabra hasta reconstruir la frase original. Puedes elegir el tipo de letra (imprenta, ligada o mayúsculas) para leerla como mejor te venga. Es un reto sencillo de entender pero muy útil para afinar la vista lectora y la ortografía de la separación de palabras.

**¿Por qué es relevante?** Separar correctamente las palabras al leer y al escribir es una de las bases de la lectoescritura, y uno de los errores más típicos de quienes empiezan es 'pegar' palabras que deberían ir sueltas. Esta app entrena justo esa destreza: la conciencia de dónde empieza y acaba cada palabra dentro de una cadena de letras. Al hacerlo se trabajan a la vez la atención visual, el reconocimiento rápido de palabras y la ortografía. Funciona bien porque convierte un contenido abstracto en una tarea manipulativa e inmediata: marcas, compruebas y ves al momento si has acertado. Por eso resulta especialmente valiosa en refuerzo y en Atención a la Diversidad, donde está presente en muchos itinerarios de lectoescritura, morfosintaxis y atención.

**¿Cómo funciona?** El juego te muestra una frase sin espacios. Tú haces clic entre las letras para colocar las separaciones donde creas que termina cada palabra. En Práctica Libre puedes pulsar 'Comprobar' cuantas veces quieras: las marcas correctas se ponen en verde y las equivocadas en rojo, y al resolverla salta el confeti. En el modo Examen resuelves cinco frases seguidas con cronómetro y, al acabar, recibes una nota sobre 10 y tus puntos, con un repaso de tus respuestas frente a las soluciones.

**Cómo se juega.**
1. Elige el tipo de letra con el deslizador superior (Imprenta, Ligada o Mayúsculas) para leer la frase cómodamente.
2. Lee con atención la frase, que aparece escrita sin ningún espacio.
3. Haz clic entre dos letras para colocar una separación donde creas que acaba una palabra.
4. Si te equivocas, vuelve a hacer clic en el mismo punto para quitar esa separación.
5. En Práctica Libre, pulsa '¡Comprobar!' para ver en verde los aciertos y en rojo los errores.
6. Corrige las marcas rojas y comprueba de nuevo hasta resolver la frase y ver el confeti.
7. Pulsa 'Otra Frase' o 'Siguiente Frase' para seguir practicando.
8. Cuando te sientas preparado, pulsa 'Examen' para resolver cinco frases con cronómetro.
9. Avanza con 'Siguiente' y, en la última, pulsa 'Finalizar' para ver tu nota sobre 10 y tus puntos.

**Modos.**
- **Práctica Libre**: Resuelves frases sueltas sin límite de intentos; al comprobar ves los aciertos en verde y los fallos en rojo, con confeti al resolver. No cuenta para la nota.
- **Examen**: Cinco frases seguidas con cronómetro y sin pistas de color durante el juego. Al terminar obtienes una nota sobre 10, puntos (con bonus por rapidez) y la corrección de cada frase.

**Consejos.**
- Lee primero la frase entera de un vistazo para hacerte una idea antes de empezar a marcar separaciones.
- Apóyate en las palabras pequeñas y frecuentes (el, la, de, que, y) para encontrar los cortes con más facilidad.
- En el examen no te precipites, pero ten en cuenta que resolver rápido suma puntos extra por velocidad.
- Si una frase se te resiste, cambia el tipo de letra: a veces en imprenta o en mayúsculas se ven mejor los límites de las palabras.

---


# 📖 Comprensión lectora y oral

## 📖 Comprensión Escrita `(comprension-escrita)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de comprensión lectora basada en textos + preguntas tipo test de opción múltiple. ComprensionEscrita.jsx es un wrapper mínimo que delega en el componente compartido _shared/ComprensionJuego.jsx pasándole tipo="escrita"; el mismo motor sirve también a Comprensión Oral (tipo="oral").

**Software.** Arquitectura: ComprensionEscrita.jsx (14 líneas) solo renderiza <ComprensionJuego tipo="escrita" .../> con level/grade/subjectId/onGameComplete. Toda la lógica vive en src/apps/_shared/ComprensionJuego.jsx (~490 líneas) con estilos en _shared/ComprensionShared.css. Estado con useState/useEffect/useRef de React puro (no hay store global). Librerías: canvas-confetti para la celebración; SpeechSynthesis (Web Speech API, SpeechSynthesisUtterance, lang='es-ES') solo en la variante oral; NO usa framer-motion (animaciones por clases CSS: fade-in-up, shake-exit, bounce-in, pop-in, pulse-animation), NO usa three/@react-three/fiber, NO usa lucide-react (todos los iconos son emojis). Máquina de fases con la variable `mode` ('lectura' → 'preguntas' → 'resultado') controlada por cambiarFase() con setTimeout para transiciones. Carga de datos en useEffect: getComprensionData(level, grade, subjectId), baraja el array con sort(()=>0.5-Math.random()) y arranca el cronómetro de lectura (readingStart). Cronometraje doble: readingTime (tiempo en pantalla de lectura, fijado al pulsar Preguntas) y answersTime (tiempo respondiendo, fijado al corregir). Puntuación en finalizar(): aciertos = nº de respuestas[idx]===p.correcta; nota /10 = Math.round((aciertos/total)*100)/10; puntos paralelos = aciertos*100 + readBonus(max 150, decae con readingTime/180) + answerBonus(max 150, decae con respTime/120); confetti si nota>=5. Anti-doble-disparo con trackedRef (useRef bool) que protege la llamada a onGameComplete y se reinicia en siguienteEjercicio(). OJO: el totalPoints que se envía en onGameComplete (línea ~142, base+readBonus+answerBonus, maxScore=total*100+300) NO coincide con el totalPoints que se PINTA en el summary (línea ~210: score*100 + (180-readingTime)*2 + (120-answersTime)*3) — dos fórmulas distintas para la misma idea, lo que produce una cifra mostrada al alumno diferente de la enviada al ranking. Accesibilidad lectora: slider de estilo de letra (print/cursive/uppercase vía clases font-*), slider de tamaño (5 niveles size-xs..size-xxl), y 'guía de lectura' (regla horizontal que sigue el clientY del ratón sobre textRef con handleMouseMove). En la variante oral: control de velocidad de TTS (0.5/1/1.5) y botón play/pausa/continuar.

**Jugabilidad.** Bucle de un ejercicio: (1) pantalla de Lectura mostrando título + texto (con reglas de accesibilidad o, en oral, botón de audio TTS); (2) pulsar 'Preguntas ➡️' para pasar al test; (3) responder todas las preguntas de opción múltiple (botones .btn-opcion, una opción marcada como 'seleccionada' por pregunta) — el botón 'Corregir' solo aparece cuando Object.keys(respuestas).length === nº preguntas, hasta entonces muestra el aviso 'Responde todo para terminar'; (4) pantalla de Resultado con estrellas (3 si nota>=9, 2 si >=5, 1 si >=3), nota /10 coloreada, mensaje motivacional, puntos, tiempos de lectura/respuesta y un desplegable 'Ver Corrección' que lista cada pregunta con ✅/❌ y, en las falladas, la respuesta del alumno frente a la correcta. 'Siguiente Historia' avanza cíclicamente al siguiente ejercicio ((prev+1)%data.length) reseteando estado y cronómetros. Controles: ratón/táctil (todo son botones y sliders) + el ratón mueve la guía de lectura. No hay niveles de dificultad ni teclado. No hay condición de derrota/game over: siempre se completa y se obtiene nota. Feedback: confeti si nota>=5, animaciones CSS, estrellas y mensajes; el oral añade audio. Botón 'Material de Estudio' abre un modal con sidebar de todas las historias, su texto completo y la lista de preguntas (sin respuestas).

**Educativo.** Objetivo pedagógico: comprensión lectora literal e inferencial. Destrezas: lectura comprensiva, localización de información explícita en el texto, inferencia, atención sostenida y vocabulario. Las ayudas de accesibilidad (tipografía ligada/mayúsculas, tamaño ajustable, guía de lectura horizontal) la hacen apta para lectores noveles y alumnado con dislexia o dificultades visuales/atencionales, lo que encaja especialmente en Atención a la Diversidad. Encaje curricular: área de Lengua (competencia lingüística/lectora). Aparece en Primaria, ESO y Bachillerato (heredada vía appsBase) en asignaturas de Lengua, y en Atención a la Diversidad en varias áreas (pragmática, comprension-oral, habilidades-sociales, autonomía), según los ficheros de config.

**Datos.** Contenido 100% remoto: getComprensionData(level, grade, subjectId) en src/services/gameDataService.js, que llama a la RPC Supabase get_comprension_data (parámetros p_level/p_grade/p_subject, con resolveADParams para Atención a la Diversidad), cachea el resultado y hace deepParseJSON. Cada ejercicio tiene la forma {titulo, texto, preguntas:[{pregunta, opciones:[...], correcta}]} (índice de la opción correcta). El componente baraja el conjunto al cargar. No hay datos hardcodeados en el componente; no usa getRoscoData/getRunnerData/getAppContent.

**Integración.** Solo modo examen: onGameComplete se emite siempre con mode:'test' (no hay easy/medium ni selector de dificultad; es una de las excepciones válidas 'solo examen' del CLAUDE.md). No es single_mode ni soporta duelo (no está en duelableApps). Tracking estándar: el componente NO usa useGameTracker directamente; ese hook lo gestiona AppRunnerPage.jsx, que inicia la sesión y consume el resultado de onGameComplete para disparar XP/insignias/avatares/ranking vía gamification_process_session. Envía score (puntos paralelos), maxScore (total*100+300), correctAnswers, totalQuestions y durationSeconds (lectura+respuesta). Protegido por trackedRef para una sola emisión por ejercicio. Particularidades a vigilar para mejoras: (1) discrepancia entre el totalPoints enviado al tracker y el mostrado en pantalla (dos fórmulas distintas); (2) cada 'Siguiente Historia' reinicia trackedRef y vuelve a emitir, de modo que cada ejercicio cuenta como una partida/intento independiente; (3) no se aporta override de `nota` (se infiere de correct/total); (4) los datos se barajan en cliente, el orden no es estable entre cargas.

**Ideas de mejora.**
- Unificar la fórmula de puntos: usar una sola función de cálculo para el valor enviado en onGameComplete y el mostrado en el summary, eliminando la divergencia actual entre la línea de finalizar() y la del render.
- Resaltar la respuesta correcta dentro del texto o añadir una breve justificación/explicación por pregunta en la corrección, para reforzar el aprendizaje inferencial, no solo marcar acierto/fallo.
- Añadir TTS también a la variante escrita (ya existe la infraestructura SpeechSynthesis) como apoyo opcional de accesibilidad, e incluir resaltado de la palabra leída (karaoke) para lectores con dificultades.
- Permitir barajar el orden de las opciones y evitar repetir ejercicios ya completados en la misma sesión, además de exponer dificultad por longitud de texto/nº de preguntas para diferenciar niveles.

### Ficha de usuario

**¿Qué es?** Comprensión Escrita es una actividad de lectura comprensiva. El alumnado lee un texto y, a continuación, responde a varias preguntas tipo test sobre lo que ha leído. Al terminar recibe una nota sobre 10, estrellas, puntos y una corrección detallada que muestra los aciertos y, en los fallos, cuál era la respuesta correcta. Incluye ayudas de lectura (tipo y tamaño de letra y una guía que resalta la línea) pensadas para que cualquier lector se sienta cómodo. Hay un botón de Material de Estudio para repasar todos los textos.

**¿Por qué es relevante?** La comprensión lectora es una competencia transversal: condiciona el rendimiento en todas las áreas, no solo en Lengua. Esta app la entrena de forma directa, obligando a leer con atención y a volver al texto para localizar la información o inferirla antes de elegir la respuesta. El formato de opción múltiple con corrección inmediata y revisión de los fallos cierra el círculo de aprendizaje: el alumno no solo sabe cuánto ha acertado, sino por qué se ha equivocado. Las ayudas de accesibilidad (letra ligada o en mayúsculas, tamaño ajustable y guía de lectura que sigue la línea) la hacen especialmente valiosa para lectores que empiezan y para alumnado con dislexia o dificultades atencionales, lo que la integra de forma natural en Atención a la Diversidad. Desarrolla competencia lingüística, atención sostenida, vocabulario y razonamiento.

**¿Cómo funciona?** La app carga una serie de textos con sus preguntas y los presenta de uno en uno. Primero aparece la pantalla de lectura, donde el alumno lee el texto con las ayudas que prefiera; cuando está listo, pasa a las preguntas y elige una opción en cada una. Solo puede corregir cuando ha respondido a todas. Entonces ve su nota sobre 10, estrellas, puntos y la corrección. La nota cuenta como examen y se suma a su progreso. Después puede pasar a la siguiente historia.

**Cómo se juega.**
1. Lee con calma el texto que aparece en la pantalla de lectura.
2. Si lo necesitas, ajusta el tipo y el tamaño de letra y activa la guía de lectura que resalta la línea.
3. Cuando lo tengas claro, pulsa 'Preguntas' para empezar el test.
4. Lee cada pregunta y selecciona la opción que creas correcta (puedes cambiarla antes de corregir).
5. Responde a TODAS las preguntas: el botón de corregir solo aparece cuando no falta ninguna.
6. Pulsa 'Corregir' para ver tu nota sobre 10, las estrellas y los puntos.
7. Despliega 'Ver Corrección' para revisar tus aciertos y, en los fallos, cuál era la respuesta correcta.
8. Pulsa 'Siguiente Historia' para continuar con otro texto.
9. Usa el botón 'Material de Estudio' cuando quieras releer los textos y sus preguntas con tranquilidad.

**Modos.**
- **Examen**: Único modo disponible: lees el texto, respondes el test y obtienes una nota sobre 10 que cuenta para tu progreso. No hay niveles fácil o medio.

**Consejos.**
- Antes de pasar a las preguntas, lee el texto entero al menos una vez; no hay prisa y la lectura tranquila mejora la nota.
- Si dudas en una pregunta, vuelve al texto a buscar la información en lugar de adivinar.
- Si te cuesta seguir las líneas, activa la guía de lectura y aumenta el tamaño de la letra.
- Aprovecha el Material de Estudio para repasar los textos antes de hacer el ejercicio en serio.

---

## 🎧 Comprensión Oral `(comprension-oral)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de comprensión auditiva: un texto se lee en voz alta por síntesis de voz del navegador (Web Speech API, locale es-ES) y luego el alumno responde preguntas tipo test. ComprensionOral.jsx es un wrapper de una línea que delega en el componente compartido _shared/ComprensionJuego.jsx pasándole tipo="oral"; el mismo componente sirve también a Comprensión Escrita con tipo="escrita".

**Software.** Arquitectura: ComprensionOral.jsx (wrapper) → ComprensionJuego.jsx (lógica completa) + ComprensionShared.css. Gestión de estado con React useState/useRef (no Redux ni contextos propios): fases en `mode` ('lectura' → 'preguntas' → 'resultado'), `data` con los ejercicios barajados, `respuestas` (mapa preguntaIndex→opciónIndex), timers `readingStart/readingTime` y `answersStart/answersTime`, y estados de audio `speechRate/isSpeaking/isPaused`. Librerías reales: canvas-confetti (confeti al aprobar) y la Web Speech API nativa del navegador (SpeechSynthesisUtterance con lang='es-ES', rate ajustable, pause/resume/cancel) para el TTS. NO usa framer-motion ni three/@react-three/fiber ni lucide-react: todas las animaciones y transiciones son clases CSS (fade-in-up, shake-exit, bounce-in, pop-in, pulse-animation) y los iconos son emojis. Puntuación: base = aciertos·100; bonus por rapidez de lectura = max(0, round(150·(1 − readingTime/180))) y de respuesta = max(0, round(150·(1 − respTime/120))); totalPoints = base + ambos bonus, con maxScore = total·100 + 300 enviado en onGameComplete. La nota /10 se calcula como Math.round((aciertos/total)·100)/10, con coloreado (>=8 'excellent', >=5 'good', <5 'fail'), mensaje motivacional por tramos y 1–3 estrellas. Anti-doble-disparo: trackedRef (useRef bool) que se pone a true en finalizar() para que onGameComplete se llame UNA sola vez por partida, y se resetea en siguienteEjercicio(). Limpieza de audio en el cleanup del useEffect y entre ejercicios (detenerAudio → speechSynthesis.cancel).

**Jugabilidad.** Bucle de tres fases en una sola pantalla: (1) Lectura/escucha — botón grande 'Escuchar Historia' que reproduce el texto por TTS con control play/pausa/continuar y un slider de velocidad (Lento 0.5 / Normal 1 / Rápido 1.5); botones 'Otra' (cambia de historia) y 'Preguntas ➡️'. (2) Preguntas — batería de preguntas de opción múltiple; el alumno selecciona una opción por pregunta (clic/táctil) y el botón 'Corregir' solo aparece cuando todas están respondidas, si no muestra el aviso 'Responde todo para terminar'. (3) Resultado — nota /10, estrellas, puntos totales, tiempos de lectura y respuesta, y desplegable 'Ver Corrección' que marca aciertos/fallos y muestra la respuesta correcta en las falladas. Controles: ratón/táctil (no hay teclado). No hay vidas ni game over: se corrige y se pasa a la siguiente historia (índice cíclico módulo data.length). Feedback: confeti canvas-confetti cuando la nota es >=5, animaciones CSS y mensajes por tramos. La guía de lectura (regla) y los ajustes de letra/tamaño existen en el código pero están condicionados a tipo=='escrita', así que en la versión oral no aparecen.

**Educativo.** Objetivo pedagógico: entrenar la comprensión auditiva (escucha activa). El alumno debe extraer información, retener y responder preguntas a partir de un texto que solo oye, sin apoyo visual del texto durante la fase de escucha. Destrezas: atención y memoria auditiva, comprensión literal e inferencial, vocabulario en contexto. El control de velocidad permite graduar la dificultad de la escucha y favorece la accesibilidad. Encaje curricular: pensado para Lengua pero registrado de forma transversal en todas las asignaturas e idiomas (lengua, inglés, valenciano, francés, ciencias, etc.). Aparece en Primaria 1º-6º, ESO 1º-4º, Bachillerato 1º-2º y Atención a la Diversidad (bloques 'comprension-oral', 'pragmatica', 'habilidades-sociales'), donde el nivel 'ad' se remapea a contenidos de Primaria 3º (tutoría) vía AD_SUBJECT_MAP en gameDataService.

**Datos.** Contenido servido por getComprensionData(level, grade, subjectId) de src/services/gameDataService.js, que llama a la RPC de Supabase get_comprension_data y devuelve [{id, titulo, texto, preguntas:[{pregunta, opciones[], correcta}]}]. El array se baraja en el cliente (sort aleatorio) al cargar. No usa getAppContent ni datos propios embebidos en el componente. Hay caché en memoria de 5 min por clave nivel/curso/asignatura en gameDataService, y resolveADParams traduce el nivel 'ad' a una fuente real (Primaria) antes de la consulta. El TTS lee data[currentIndex].texto, por lo que la voz reproduce literalmente el mismo campo de texto que la versión escrita.

**Integración.** Modo único: examen. ComprensionJuego llama siempre a onGameComplete con mode:'test' (no hay easy/medium ni selector de dificultad ni single_mode declarado; encaja con la excepción de CLAUDE.md 'Comprensión solo examen'). No tiene componente de duelo (no está en duelableApps) ni DuelChatBar. Tracking: onGameComplete sube a AppRunnerPage, que aplica el multiplicador de curso (1.0–2.1) a score y maxScore y delega en useGameTracker.trackGameSession → gamification_process_session (XP, insignias, avatares, high_scores y ranking automáticos). Particularidades a vigilar para mejoras: (1) discrepancia de puntos — el totalPoints enviado en finalizar() usa bonus 150·(1−t/180) y 150·(1−t/120), pero el totalPoints que se PINTA en la pantalla de resultado (línea 210) usa otra fórmula (180−readingTime)·2 y (120−answersTime)·3, así que el número visible no coincide con el puntuado/ranqueado; (2) el botón 'Material de Estudio' muestra el texto completo y las preguntas antes de responder, lo que en un modo examen oral permite leer en vez de escuchar y ver las preguntas de antemano; (3) si el alumno abandona en fase de preguntas sin corregir, onGameComplete no se dispara (no hay tracking de abandono como en Anagramas); (4) depende del soporte de SpeechSynthesis y de voces es-ES instaladas en el navegador/SO, sin fallback de audio.

**Ideas de mejora.**
- Unificar la fórmula de puntos: el totalPoints mostrado en la pantalla de resultado debe ser exactamente el enviado a onGameComplete (hoy difieren) para que el alumno vea los puntos reales que cuentan en el ranking.
- Limitar el 'Material de Estudio' en modo oral: ocultar el texto completo (o mostrarlo solo tras corregir) y/o no exponer las preguntas antes de responder, para que la escucha siga siendo el canal de entrada y no se rompa la naturaleza de comprensión oral.
- Robustez del TTS: detectar ausencia de SpeechSynthesis o de voces es-ES y ofrecer un aviso/fallback (selección de voz disponible o audio pregrabado), además de permitir un número máximo de reproducciones para subir la exigencia.
- Tracking de abandono y reescucha controlada: registrar partida parcial si se sale en preguntas (como Anagramas) y registrar cuántas veces se ha reproducido el audio como señal pedagógica para el docente.

### Ficha de usuario

**¿Qué es?** Comprensión Oral es una actividad de escucha activa. La aplicación lee en voz alta una pequeña historia o texto usando la voz del navegador y, después, plantea varias preguntas tipo test sobre lo que se ha escuchado. El alumno no ve el texto mientras escucha: tiene que prestar atención, retener la información y luego elegir la respuesta correcta. Al terminar, recibe una nota sobre 10, estrellas, puntos y una corrección detallada que indica los aciertos y los fallos con la respuesta correcta.

**¿Por qué es relevante?** La comprensión oral es una competencia básica y muchas veces poco entrenada: entender instrucciones, explicaciones o relatos solo escuchándolos es esencial en clase y en la vida diaria. Esta actividad desarrolla la escucha activa, la atención sostenida, la memoria auditiva y la capacidad de extraer ideas e inferir significado sin apoyo visual, además de ampliar vocabulario en contexto. Funciona pedagógicamente porque separa con claridad la fase de escuchar de la de responder, obliga a procesar la información en lugar de copiarla de un texto a la vista, y da retroalimentación inmediata con corrección razonada. El control de velocidad permite ajustar el reto al alumno y mejora la accesibilidad, por lo que sirve tanto en clase ordinaria como en apoyo y atención a la diversidad, y en cualquier asignatura o idioma.

**¿Cómo funciona?** La app carga varias historias con sus preguntas. Primero aparece un botón grande para escuchar el texto, con opción de pausar, continuar y ajustar la velocidad. Cuando el alumno se siente preparado, pasa a las preguntas: cada una tiene varias opciones y hay que responderlas todas para poder corregir. Al pulsar Corregir, la app calcula la nota sobre 10, muestra estrellas y puntos, lanza confeti si se aprueba y ofrece ver la corrección. Después se puede pasar a otra historia.

**Cómo se juega.**
1. Pulsa 'Escuchar Historia' y atiende al texto que lee la voz; puedes pausar y continuar cuando quieras.
2. Si lo necesitas, ajusta la velocidad de la voz (Lento, Normal o Rápido) antes o entre reproducciones.
3. Vuelve a escuchar la historia las veces que necesites hasta entenderla bien.
4. Cuando estés preparado, pulsa 'Preguntas' para empezar la batería de preguntas.
5. Lee cada pregunta y toca la opción que creas correcta; puedes cambiar tu elección.
6. Responde TODAS las preguntas: el botón 'Corregir' solo se activa cuando no falta ninguna.
7. Pulsa 'Corregir' para ver tu nota sobre 10, las estrellas y los puntos conseguidos.
8. Abre 'Ver Corrección' para repasar tus aciertos y fallos y aprender la respuesta correcta de las que fallaste.
9. Pulsa 'Siguiente Historia' para practicar con un texto nuevo.

**Modos.**
- **Examen**: Único modo disponible: escuchas el texto y respondes las preguntas; al corregir obtienes una nota sobre 10 que cuenta para tus tareas y para el ranking, junto con puntos por rapidez.

**Consejos.**
- Empieza con la velocidad Normal y baja a Lento solo si te cuesta seguir el texto; subirla a Rápido es un buen reto cuando ya dominas la actividad.
- Escucha el texto entero al menos una vez antes de ir a las preguntas, y vuelve a escuchar las partes dudosas antes de corregir.
- Responde con calma pero sin perder tiempo: hay puntos extra por rapidez tanto al escuchar como al contestar.
- Usa siempre 'Ver Corrección' al final para entender por qué fallaste; es la mejor forma de mejorar en la siguiente historia.

---


# 🧮 Matemáticas

## 🔴 Ordena las Bolas `(ordena-bolas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Juego de física para matemáticas: el alumno pulsa bolas que rebotan dentro de una caja giratoria, en orden de menor a mayor valor. Implementado en React con motor de física propio basado en Matter.js (canvas), con versión 1 jugador (OrdenaBolas.jsx) y versión duelo shared-board (OrdenaBolasDuel.jsx).

**Software.** Dos componentes: `src/apps/ordena-bolas/OrdenaBolas.jsx` (1 jugador) y `src/apps/ordena-bolas/OrdenaBolasDuel.jsx` (duelo). No hay CSS propio: todo el estilo es Tailwind inline + componentes `@/components/ui/button`. Librerías: `matter-js` (Engine/Render/Runner/Bodies/Composite/Events/Query) como motor físico y de render sobre canvas; `lucide-react` (iconos RefreshCw, Trophy, Timer, Play, Settings, Swords...); en el duelo además `framer-motion` (animaciones VS/cuenta atrás/overlays), `UserAvatar` y `DuelChatBar`. NO usa three/@react-three/fiber, canvas-confetti ni TTS. El confeti de victoria se simula con cuerpos rectangulares de Matter.js lanzados con velocidad (no canvas-confetti). Estado con useState/useRef: en 1P `gameState` ('config'|'playing'|'won'|'lost'), `config` (ballCount, rotationSpeed, randomSize, ops), `timeElapsed` y un `key` que fuerza el re-montaje del efecto físico al reiniciar; la lógica de juego viva (targetIndex, isGameOver, isVictory) se guarda en un objeto cerrado dentro del efecto de Matter, no en el estado de React, y el render dibuja las etiquetas en `afterRender`. El click se resuelve con `Query.point` sobre las posiciones físicas. Puntuación (1P): `basePoints = won ? ballCount*100 : 0` + `timeBonus` por rapidez (presupuesto de 5 s/bola, 10 pt por segundo ahorrado); `maxScore = ballCount*100 + TIME_BUDGET*SPEED_COEF`. NO calcula ni pasa `nota` /10: deja que `AppRunnerPage` la derive de `correctAnswers/totalQuestions` (ballCount si gana, 0 si pierde → la nota es binaria 10 o 0). Anti-doble-disparo: `trackedRef` en 1P (se rearma al volver a 'config'/'playing'); en el duelo `reportedRef` y `startedRef`. El duelo es host-authoritative: el host genera bolas con seed propia, mantiene `state` (marks/scores/remaining) y lo difunde por el canal Supabase (`setup`/`state`/`phase`/`game_end`); el guest envía `mark_request` (Supabase no hace eco al emisor, por eso el host procesa sus clicks directo vía `processMarkRef`). Checkpoint en localStorage (`orderballsduel:<duelId>`) para sobrevivir a un F5 a mitad de partida.

**Jugabilidad.** Bucle 1P: pantalla de configuración → partida → won/lost. El alumno configura nº de bolas (3-20), velocidad de giro de la caja (0-10), tipos de contenido y un toggle 'tamaño engañoso'. Al jugar, las bolas (etiquetadas con números u operaciones) rebotan en una caja que rota; hay que pulsarlas de menor a mayor valor. Acierto → la bola se pone roja y avanza el objetivo; un único fallo termina la partida ('¡Fallaste!'). Victoria al marcar todas en orden, con cronómetro (mm:ss:cc) y 'confeti' físico. Controles: solo puntero (`pointerdown` sobre el canvas), táctil y ratón; no hay teclado. Sin vidas: muerte súbita al primer error. Niveles de dificultad = parámetros que el alumno ajusta (no hay easy/medium/exam): cantidad, giro, tamaño engañoso, y operaciones permitidas filtradas por curso (1º-3º Primaria: números/sumas/restas; 4º-6º: +mult/div; ESO/Bach: +potencias/raíces/ecuaciones). Duelo (shared-board, BALL_COUNT=15, solo números, giro 3): cuenta atrás 3-2-1, ambos ven el mismo tablero y el 'siguiente valor'; el primero que marca correctamente se lleva el punto, si falla el punto va al rival; gana quien tenga más puntos al agotar las bolas. Feedback: overlays de victoria/derrota con marcador, animaciones framer-motion y frases de duelo (DuelChatBar).

**Educativo.** Objetivo pedagógico: comparar y ordenar magnitudes numéricas de menor a mayor, y en cursos superiores resolver mentalmente operaciones (sumas, restas, multiplicaciones, divisiones, potencias, raíces y ecuaciones de primer grado) para obtener el valor con el que comparar. Entrena cálculo mental ágil, sentido numérico, comparación de cantidades y atención sostenida bajo presión (la caja gira y un solo fallo penaliza). El toggle 'tamaño engañoso' separa deliberadamente el tamaño visual del valor real, obligando a leer el número en lugar de fiarse de la percepción. Encaje curricular: bloque de Números/Sentido numérico de Matemáticas. Aparece como app de la asignatura `matematicas` en Primaria 1º-6º, ESO 1º-4º y Bachillerato 1º-2º, con el contenido autoajustado por curso.

**Datos.** No usa `gameDataService` ni `getAppContent` ni Supabase para el contenido: las bolas se generan de forma 100% procedural en el propio componente (`generateBallData` en 1P y `makeOperand`/`generateBallData` en el duelo) con `Math.random`, evitando valores duplicados mediante un `Set`. El único dato externo es `level`/`grade` de `useParams`, que `getAllowedOperations()` usa para decidir qué tipos de operación se permiten por curso. No hay fuente de datos editable: cualquier cambio de contenido es código.

**Integración.** Registrada en `commonApps.js` como `appOrdenaBolas` (id 'ordena-bolas', `duel: { supported: true, bestOf: 1, mode: 'shared-board' }`) y añadida a `matematicas` en primaria/eso/bachillerato; duelo en `duelableApps.js`. NO sigue el patrón estándar de modos easy/medium/exam: usa una pantalla de configuración propia y SIEMPRE reporta `onGameComplete` con `mode: 'test'` en 1P (toda partida cuenta como intento de examen y por tanto para tareas), pero no está registrada como `single_mode` en CLAUDE.md. El tracking NO usa `useGameTracker` directamente dentro del componente: confía en `onGameComplete` (lo capta `AppRunnerPage`), disparado una sola vez vía `trackedRef`. Ranking automático con `score`/`maxScore`. El duelo monta `DuelChatBar` (cumple la regla de duelos), usa `useDuel`, reporta `reportResult(winnerId)` + `onGameComplete({ mode: 'duel', ... ceros })` para que no cuente como intento de examen, y persiste checkpoint en localStorage. Particularidades a vigilar para mejoras: (1) nota binaria 10/0 por la muerte súbita; (2) la dificultad la elige el alumno, no el modo de tarea, así que un alumno puede minimizar bolas para subir nota fácil; (3) el motor 1P y el del duelo están duplicados (dos `generateBallData`, dos setups de Matter casi idénticos); (4) no respeta el ajuste global de calidad gráfica (`graphicsQuality`) pese a renderizar física; (5) altura del canvas fija (600/700 px) y `pixelRatio: 1`.

**Ideas de mejora.**
- Unificar el motor físico y el generador de bolas en un módulo compartido (`_shared/`) para eliminar la duplicación entre OrdenaBolas y OrdenaBolasDuel y reducir el riesgo de divergencia.
- Sustituir la muerte súbita por un modelo de vidas o penalización de tiempo, y calcular una nota /10 graduada (p. ej. proporción de bolas ordenadas antes de fallar) en vez de 10/0, evitando que la nota sea binaria.
- Acoplar la dificultad al modo de tarea/examen (fijar nº de bolas, giro y operaciones según curso/dificultad como en el duelo) para que la nota sea comparable y el alumno no pueda trivializar con 3 bolas; añadir además una capa de 'puntos paralelos' coherente con la guía.
- Integrar el selector global de calidad gráfica (`useGraphicsQuality`) y escalar `pixelRatio`/tamaño del tablero de forma responsive; añadir un modal de instrucciones (InstructionsModal) que hoy no existe en la app.

### Ficha de usuario

**¿Qué es?** Ordena las Bolas es un juego de matemáticas con física: dentro de una caja que gira, varias bolas con números rebotan sin parar. El reto consiste en pulsarlas en orden, de la de menor valor a la de mayor. En los cursos más altos, cada bola no muestra un número directo sino una operación (una suma, una multiplicación, una raíz o una ecuación) que hay que resolver mentalmente para saber su valor antes de tocarla. Hay una versión para jugar en solitario y otra para retar a un compañero en un duelo uno contra uno.

**¿Por qué es relevante?** Trabaja una destreza básica y muchas veces poco entrenada: comparar cantidades y ordenarlas con seguridad. Al añadir operaciones, convierte el cálculo mental en algo útil y con propósito, porque el resultado sirve para decidir el orden, no para rellenar una ficha. El movimiento constante de las bolas y la opción de 'tamaño engañoso' obligan a fijarse en el número real y no en la apariencia, reforzando la atención y el control de impulsos: un solo fallo termina la partida, así que premia pensar antes de pulsar. La dificultad se adapta al curso (en Primaria solo números y operaciones sencillas; en Secundaria y Bachillerato potencias, raíces y ecuaciones), por lo que crece con el alumno. El cronómetro y el modo duelo aportan motivación sin perder el foco matemático.

**¿Cómo funciona?** El alumno elige cuántas bolas quiere, a qué velocidad gira la caja y qué tipo de contenido aparece (números u operaciones, según su curso). Al empezar, las bolas caen y rebotan dentro del recipiente. Hay que ir tocándolas de menor a mayor valor: cada acierto la marca y descubre la siguiente, pero un error acaba la partida. Si se completan todas en el orden correcto, hay victoria, confeti y un tiempo final. En el duelo, dos jugadores comparten el mismo tablero y compiten por marcar antes y mejor.

**Cómo se juega.**
1. Abre la app y, en la pantalla de configuración, ajusta la cantidad de bolas (de 3 a 20).
2. Elige la velocidad de giro de la caja (0 = quieta, 10 = muy rápida) según el reto que quieras.
3. Marca los tipos de contenido (números, sumas, restas... las opciones disponibles dependen de tu curso).
4. Si quieres más dificultad, activa 'Tamaño engañoso' para que el tamaño de la bola no indique su valor.
5. Pulsa '¡Jugar!' y observa las bolas que rebotan dentro del recipiente.
6. Toca primero la bola de menor valor; en los cursos altos, resuelve antes la operación de cada bola.
7. Sigue marcando de menor a mayor: un acierto la pone en rojo, un solo fallo termina la partida.
8. Completa todas las bolas en orden para ganar y ver tu tiempo; usa Reiniciar o Ajustes para volver a intentarlo.
9. En modo duelo, espera la cuenta atrás y compite por marcar la bola correcta antes que tu rival.

**Modos.**
- **Un jugador (configurable)**: Partida en solitario en la que tú decides número de bolas, velocidad de giro, tipos de operación y si el tamaño engaña. Cada partida cuenta como intento para la tarea.
- **Duelo 1 contra 1 (tablero compartido)**: Reto contra un compañero con 15 bolas de números y giro moderado: ambos veis el mismo tablero y gana quien marque correctamente más bolas; acertar da un punto y fallar se lo da al rival.

**Consejos.**
- No te fíes del tamaño de la bola: lee siempre el número o resuelve la operación antes de pulsar, sobre todo con 'tamaño engañoso' activado.
- Si la caja gira muy rápido y te cuesta, baja la velocidad de giro o reduce el número de bolas para practicar con calma.
- Como un solo fallo termina la partida, tómate un segundo para identificar la bola más pequeña que quede antes de tocarla.
- En el duelo, busca el equilibrio entre rapidez y seguridad: precipitarte y fallar regala el punto a tu rival.

---

## 🧮 Fracciones PRO `(fracciones-eso)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Calculadora-juego autocontenida en React para operar con fracciones (sumas, restas, multiplicaciones, simplificar, m.c.m. y M.C.D.). Todo el contenido se genera por procedimiento con Math.random() dentro del propio componente FraccionesESO.jsx; no consume gameDataService ni Supabase para los ejercicios.

**Software.** Un único componente funcional FraccionesESO.jsx (~940 líneas) + FraccionesESO.css (existe también un FraccionesESO_fixed.css residual). Librerías: framer-motion (motion/AnimatePresence para tarjetas, modal de ayuda, barra de progreso y animaciones de revisión), canvas-confetti (celebración al acertar y al aprobar el examen) y lucide-react (iconografía: Plus, Minus, X, Check, Calculator, Layers, Award, ClipboardCheck, etc.). No usa TTS ni three/@react-three/fiber. Estado local con useState: section, exercise, userAnswer {num,den,single}, intermediate {n1,n2,den} para el denominador común, feedback, showHelp/showHint, e isExamMode/examStep/examQuestions/examAnswers/showResults/score. Subcomponentes internos Fraction, FractionInput y FractionInputSmall. Matemática con dos helpers recursivos: gcd (Euclides) y lcm = a*b/gcd. La validación normaliza la respuesta del alumno con su propio gcd, de modo que acepta cualquier fracción equivalente ya reducida (salvo en 'simplificar', que exige el resultado totalmente reducido exacto). En sumas/restas valida primero el paso intermedio (denominador común vía lcm y numeradores ajustados) antes de la respuesta final. PUNTUACIÓN: en práctica lleva un score local (+10 acierto, -5 fallo, suelo en 0) que NO se envía a ningún sitio. Solo el examen reporta resultado: finishExam calcula correctCount, nota visual (correctCount/12*10 con clase pass/fail según >=5) y llama onGameComplete con mode:'test', score = correctCount*100 + timeBonus, maxScore = 1200 + 360*5, correctAnswers=correctCount, totalQuestions=12, durationSeconds. La NOTA /10 que cuenta para la tarea no la calcula la app (no pasa override 'nota'): la deriva useGameTracker.calculateNota como correctAnswers/totalQuestions*10. Bonus de rapidez: presupuesto TIME_BUDGET=12*30=360 s, SPEED_COEF=5, timeBonus = max(0,(360-elapsed)*5), que infla score/maxScore pero no la nota. Anti-doble-disparo: hay examStartRef (solo para cronometrar) pero NO un useRef flag que blinde onGameComplete; el disparo único depende del flujo (finishExam solo se alcanza en la pregunta 12). Botón 'Volver' a mitad de examen aborta sin reportar.

**Jugabilidad.** Pantalla inicial con un banner que lanza el examen y una rejilla de 6 tarjetas (Sumas, Restas, Multiplicaciones, Simplificar, m.c.m., M.C.D.). En modo libre el alumno entra a una sección, ve un ejercicio aleatorio, rellena los inputs (numerador/denominador, paso intermedio en sumas/restas, o un único campo en m.c.m./M.C.D.) y pulsa Comprobar: acierto -> mensaje verde + confeti + nuevo ejercicio a los 2 s; fallo -> mensaje rojo con la respuesta correcta. Botón 'Nueva' regenera (con animación de vibración) y botones de Ayuda (modal teórico por sección con ejemplos visuales) y de pistas dinámicas que despliegan tablas de múltiplos o divisores. Controles por ratón/teclado/táctil sobre inputs numéricos HTML. El examen son 12 preguntas (2 de cada tipo, barajadas), sin pistas ni ayuda ni feedback intermedio: cada Comprobar avanza a la siguiente y registra acierto/fallo; al terminar muestra un dashboard con Nota Final, aciertos y una rejilla de revisión pregunta a pregunta (operación, tu respuesta, correcta). No hay vidas ni temporizador visible; el tiempo solo alimenta el bonus de rapidez.

**Educativo.** Entrena el cálculo con fracciones del primer ciclo de la ESO: reducción a común denominador vía m.c.m. para sumar/restar, producto directo de numeradores y denominadores, simplificación con el M.C.D., y el cálculo aislado de m.c.m. y M.C.D. de dos números. El diseño con paso intermedio obligatorio en sumas/restas refuerza el procedimiento (no solo el resultado) y las pistas de múltiplos/divisores andamian el razonamiento. Aparece en ESO 1º (matemáticas) y se hereda a Bachillerato 1º; encaja con los bloques de números y operaciones del currículo.

**Datos.** Contenido 100% autogenerado en el cliente: createExerciseData produce numeradores/denominadores y pares de números con Math.random() (denominadores 2-9, numeradores 1-10, factor común 2-6 para simplificar, números pares 4-32 para m.c.m./M.C.D.). NO usa getRoscoData, getRunnerData, getAppContent ni ninguna RPC de gameDataService; tampoco lee de Supabase para los ejercicios. La única integración con backend es el reporte de sesión vía onGameComplete -> useGameTracker.

**Integración.** Registrada como appFraccionesESO (id 'fracciones-eso') en commonApps.js, listada en esoApps (1º matemáticas) y heredada en bachilleratoApps (appsBase). Está en WIDE_APP_IDS de AppRunnerPage (layout ancho). NO es single_mode ni está en duelableApps (sin duelo 1v1, sin DuelChatBar). Modos efectivos: práctica libre por sección (sin tracking, no cuenta) y examen único de 12 preguntas que sí reporta con mode:'test'. No existe el esquema estándar easy/medium/exam: es 'práctica + examen' (excepción válida estilo Sopa/Crucigrama). El tracking lo gestiona AppRunnerPage+useGameTracker; el examen genera la sesión de examen y dispara XP/insignias/ranking vía gamification_process_session y upsert_high_score. Particularidades para mejoras: (1) la nota de la tarea sale de correct/12*10 en useGameTracker, no del cálculo interno, así que cualquier cambio de nº de preguntas debe reflejarse en totalQuestions; (2) no hay useRef que blinde onGameComplete; (3) la práctica no aporta nada al ranking porque nunca llama onGameComplete; (4) dificultad fija no parametrizable por curso (un alumno de Bachillerato ve los mismos rangos que 1º ESO).

**Ideas de mejora.**
- Añadir niveles de dificultad seleccionables (rangos de denominadores/numeradores, fracciones impropias, operaciones encadenadas de 3 fracciones) para diferenciar 1º ESO de Bachillerato, hoy idénticos.
- Incorporar un useRef anti-doble-disparo en onGameComplete y reportar también partidas de práctica como mode:'practice' para que cuenten en XP/ranking, igual que el resto de apps.
- Pasar una 'nota' explícita en onGameComplete con puntos paralelos (racha/rapidez) coherentes con la guía 3.2, y mostrar mensajes Excelente/Muy bien/Aprobado/Necesitas repasar en el dashboard de resultados.
- Convertirla en duelable (FraccionesESODuel.jsx + DuelChatBar + alta en duelableApps) y/o aprovechar la mecánica de pasos intermedios para una variante con conversión de fracción a número mixto o a decimal.

### Ficha de usuario

**¿Qué es?** Fracciones PRO es una calculadora-juego para practicar todas las operaciones con fracciones: sumar, restar y multiplicar fracciones, simplificarlas y calcular el mínimo común múltiplo (m.c.m.) y el máximo común divisor (M.C.D.) de dos números. El alumno elige una sección, resuelve ejercicios que aparecen al azar y escribe su respuesta en casillas de numerador y denominador. Cada acierto se celebra con confeti y, cuando se siente preparado, puede ponerse a prueba con un examen final de doce preguntas.

**¿Por qué es relevante?** Las fracciones son uno de los grandes escollos del paso a la ESO: muchos errores no vienen de no entender la idea, sino de fallar en el procedimiento. Esta app refuerza precisamente eso. En sumas y restas obliga a escribir el paso intermedio (reducir a común denominador con el m.c.m.) antes de dar el resultado, de modo que el alumno interioriza el método y no solo memoriza respuestas. Las pistas de múltiplos y divisores y la ayuda teórica con ejemplos sirven de andamiaje para quien aún duda, mientras que el examen sin ayudas mide lo aprendido. Trabaja competencia matemática, cálculo mental, atención y autonomía, y el acierto inmediato con celebración mantiene la motivación. Al aceptar cualquier fracción equivalente correcta, premia el razonamiento por encima de una única forma rígida.

**¿Cómo funciona?** Desde la pantalla principal se elige una de las seis secciones o se inicia el examen. En cada ejercicio aparece una operación al azar y unas casillas para escribir la respuesta; al pulsar Comprobar, la app indica si es correcta y, si no, muestra la solución. Hay botones de ayuda con la teoría y pistas con tablas de múltiplos o divisores. El examen encadena doce preguntas variadas, sin ayudas, y al final muestra la nota, los aciertos y una revisión de todas las respuestas.

**Cómo se juega.**
1. En la pantalla inicial, elige una sección (Sumas, Restas, Multiplicaciones, Simplificar, m.c.m. o M.C.D.) o pulsa 'Iniciar Modo EXAMEN'.
2. Lee la operación que aparece y, si lo necesitas, pulsa 'Ayuda' para ver el método o el botón de pistas para mostrar los múltiplos o divisores.
3. En sumas y restas, completa primero el paso intermedio: pon el denominador común y los numeradores ajustados, y después la fracción resultado.
4. En multiplicaciones y simplificar, escribe el numerador y el denominador de tu respuesta en las dos casillas.
5. En m.c.m. y M.C.D., escribe el número resultado en la casilla única.
6. Pulsa 'Comprobar': si aciertas verás confeti y un nuevo ejercicio; si fallas, aparecerá la respuesta correcta para que la revises.
7. Usa 'Nueva' para cambiar de ejercicio dentro de la misma sección cuando quieras seguir practicando.
8. En el examen, responde las doce preguntas seguidas pulsando 'Siguiente'; al terminar revisa tu nota, los aciertos y el repaso de cada pregunta.

**Modos.**
- **Práctica libre**: Entrenas una operación concreta (sumas, restas, multiplicaciones, simplificar, m.c.m. o M.C.D.) con ejercicios ilimitados, ayuda teórica y pistas de múltiplos/divisores. Ideal para aprender el método.
- **Examen**: Reto final de 12 preguntas variadas y barajadas, sin pistas ni ayuda. Al acabar da tu nota sobre 10, los aciertos y una revisión pregunta a pregunta. Es el modo que cuenta para la tarea.

**Consejos.**
- En sumas y restas, calcula bien el m.c.m. de los denominadores antes de operar: si el paso intermedio falla, el resultado también.
- Antes del examen, practica cada sección por separado y usa las pistas hasta que ya no las necesites.
- Recuerda simplificar siempre la fracción final; la app acepta cualquier fracción equivalente correcta, pero la respuesta limpia es la mejor.
- En el examen el tiempo da una pequeña ventaja de puntos: ve con seguridad, pero sin entretenerte de más.

---

## 📐 Regla de Tres `(regla-de-tres)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de matemáticas en React que entrena la resolución de problemas de proporcionalidad directa e inversa mediante regla de tres. Es 100% autocontenida: genera los enunciados de forma procedural (sin Supabase) con un módulo propio (problemGenerator.js) y ofrece tres dificultades (fácil/medio/examen) con ayudas visuales SVG.

**Software.** Componente único `src/apps/regla-de-tres/ReglaDeTres.jsx` (función React con hooks) más `problemGenerator.js` (lógica pura de generación/validación) y `ReglaDeTres.css`. Librerías: framer-motion (animaciones de tarjetas, feedback y modal de salida con AnimatePresence), canvas-confetti (celebración en aciertos de práctica), lucide-react (iconos: Calculator, Check, X, Lightbulb, Eye/EyeOff, LogOut, RefreshCw, Sparkles, ChevronRight). Reutiliza `_shared/InstructionsModal` (InstructionsModal + InstructionsButton). NO usa three/@react-three/fiber ni TTS. Estado por useState: phase ('setup'|'play'|'finished'), difficulty, problem, userInput, feedback, showHelp, y estado de examen (examIndex, examCorrect, examPoints, examHistory). Refs: examStartRef y questionStartRef (cronometraje), trackedRef (flag anti-doble-disparo de onGameComplete). startGame/nextProblem/handleCheck memorizados con useCallback. Puntuación de examen: por pregunta correcta POINTS_PER_CORRECT=100 + bonus de velocidad lineal (hasta MAX_SPEED_BONUS=100 si se responde instantáneo, decreciendo hasta 0 en SPEED_BONUS_WINDOW_SEC=30 s); fallos suman 0. Nota /10 en el summary y en el modal de salida: `Math.round((examCorrect/TOTAL_EXAM_QUESTIONS)*100)/10` con TOTAL_EXAM_QUESTIONS=10, coloreada (>=8 verde, >=5 azul, <5 rojo) y mensaje (>=9 Excelente, >=7 Muy bien, >=5 Aprobado, <5 Necesitas repasar) según el estándar del CLAUDE.md. Validación de respuesta en checkAnswer: normaliza coma→punto, parseFloat y compara con tolerancia |num-expected|<0.011 (absorbe redondeo). formatNumber redondea a 2 decimales y muestra coma decimal española. Los dos diagramas de ayuda (ProportionDiagram en SVG con gradientes y flechas direccionales según directa/inversa, y FormulaHint con la fórmula desarrollada sin resultado) son subcomponentes locales.

**Jugabilidad.** Bucle: pantalla de SETUP con selección previa de dificultad (3 tarjetas) → PLAY → (solo examen) FINISHED con resumen. En PRÁCTICA (fácil/medio) el bucle es indefinido: el alumno escribe la respuesta, pulsa Comprobar o Enter, recibe feedback inmediato (correcto/incorrecto), ve la explicación paso a paso si falla, y pulsa 'Otro problema' para generar otro; no hay vidas ni derrota. En EXAMEN son 10 preguntas encadenadas sin feedback intermedio, con barra de progreso y badge de tipo (directa/inversa); avanza automáticamente al comprobar y al llegar a la 10ª pasa a FINISHED. Controles: ratón/táctil (input numérico con inputMode='decimal', botones) y teclado (Enter = comprobar o siguiente; autoFocus en el input). Condición de 'victoria': en examen, la nota; no hay condición de derrota más allá de fallar preguntas. Feedback: confeti verde solo en aciertos de práctica; animaciones motion en feedback y explicación; modal propio de confirmación al salir del examen (entrega con la nota actual, sin window.confirm). Las ayudas visuales están siempre activas en fácil, son toggleables (off por defecto) en medio mediante un botón Eye/EyeOff, y deshabilitadas en examen.

**Educativo.** Objetivo pedagógico: comprender y aplicar la proporcionalidad directa (más→más) e inversa (más→menos) mediante la regla de tres, distinguiendo el tipo de relación antes de operar. Destrezas: identificación del tipo de proporción, planteamiento (producto cruzado en directa, producto en línea en inversa), cálculo con decimales, lectura de enunciados contextualizados y razonamiento con magnitudes (precios, velocidad, trabajo, recetas, cobertura, reparto). El diagrama SVG con flechas direccionales y la fórmula desarrollada (sin dar el resultado) andamian el razonamiento sin resolver por el alumno. Encaje curricular: proporcionalidad de 5º-6º de Primaria y 1º-4º de ESO. Registrada en Matemáticas de Primaria 5º y 6º, en Matemáticas de TODOS los cursos de ESO (1º-4º) y heredada por Bachillerato vía appsBase.

**Datos.** NO usa gameDataService ni Supabase para el contenido. Todos los enunciados se generan de forma procedural en el cliente con `src/apps/regla-de-tres/problemGenerator.js`: ~45 plantillas de texto para regla de tres directa (DIRECTA_TEMPLATES) y ~25 para inversa (INVERSA_TEMPLATES), parametrizadas por generateDirecta/generateInversa según dificultad (fácil: solo directa con constante k entera y resultados enteros; medio: directa e inversa con hasta 1 decimal; examen: hasta 2 decimales y rangos mayores). generateProblem ensambla tipo, parámetros (a1,b1,a2,answer) y plantilla aleatoria. Esto hace la app independiente del curso/asignatura (useParams se invoca solo por consistencia, no se usa) y reproduce contenido infinito sin coste de red.

**Integración.** Modos: easy/medium (práctica, sin tracking de nota) y exam (mode:'test', 10 preguntas, con nota → tarea), siguiendo el patrón estándar de selección previa. NO es single_mode (solo el examen cuenta como intento). NO está en duelableApps.js (no soporta duelo 1 vs 1, no monta DuelChatBar). Tracking: la app no usa useGameTracker directamente; solo llama `onGameComplete` una vez (protegido por trackedRef) en un useEffect cuando phase pasa a 'finished', enviando {mode:'test', score:examPoints, maxScore:TOTAL_EXAM_QUESTIONS*(POINTS_PER_CORRECT+MAX_SPEED_BONUS)=2000, correctAnswers, totalQuestions:10, durationSeconds}. AppRunnerPage es quien monta la sesión, aplica el multiplicador de curso y persiste en game_sessions/high_scores, por lo que el ranking y el XP/insignias/avatares funcionan automáticamente. Hay un avatar ligado a la app (avatar_014 'Maestra de las Matemáticas': 3 exámenes con nota≥8 vía unlock_requirement app_sessions/app_id 'regla-de-tres'). Particularidad para mejoras: como solo se envía maxScore fijo y nota=correct/10·10, el bonus de velocidad alimenta el ranking pero no la nota; salir del examen a medias también dispara onGameComplete (nota parcial sobre 10 preguntas, contando las no respondidas como fallo).

**Ideas de mejora.**
- Añadir un modo duelo 1 vs 1 (ReglaDeTresDuel.jsx + registro en duelableApps + DuelChatBar) ya que la generación procedural con seed determinista encajaría bien para enfrentar a dos alumnos con los mismos problemas.
- Incluir feedback de audio/TTS opcional para leer el enunciado (accesibilidad) y un temporizador visible por pregunta en examen para que el bonus de velocidad sea percibible.
- Ampliar a regla de tres compuesta (tres o más magnitudes) y a problemas de proporcionalidad mixta como cuarto nivel, aprovechando que el generador ya separa directa/inversa.
- Permitir respuesta razonada opcional (elegir primero si es directa o inversa antes de calcular) para reforzar el diagnóstico del tipo de proporción, fuente típica de errores.

### Ficha de usuario

**¿Qué es?** Regla de Tres es una app de matemáticas para practicar problemas de proporcionalidad directa e inversa. En cada partida aparece un problema de la vida real (precios, velocidades, trabajadores, recetas, reparto...) con una tabla y un esquema visual, y el alumno tiene que calcular el valor que falta usando la regla de tres. Ofrece práctica libre con ayudas paso a paso o un examen de diez preguntas con nota sobre diez. Los problemas se generan automáticamente, así que nunca se repiten.

**¿Por qué es relevante?** La proporcionalidad es uno de los contenidos más transversales y útiles de Primaria y ESO: aparece en porcentajes, escalas, velocidad, recetas, presupuestos y multitud de situaciones cotidianas. Esta app desarrolla el razonamiento proporcional, la comprensión lectora de enunciados, el cálculo con decimales y, sobre todo, la destreza clave de distinguir cuándo una relación es directa (más es más) o inversa (más es menos), que es el error más frecuente del alumnado. Los diagramas con flechas y la fórmula desarrollada andamian el proceso sin dar la solución, de modo que el estudiante aprende a plantear, no solo a copiar. La variedad infinita de enunciados favorece la práctica espaciada y evita la memorización mecánica, consolidando un aprendizaje funcional y transferible.

**¿Cómo funciona?** Se elige una de las tres dificultades en la pantalla inicial. En los modos de práctica, la app muestra el enunciado, un esquema de la proporción y, si quieres, la fórmula; escribes el resultado, compruebas y recibes una explicación inmediata, pudiendo encadenar tantos problemas como quieras. En el modo Examen se resuelven diez preguntas seguidas sin ayudas y al final obtienes una nota de 0 a 10, los aciertos, los puntos para el ranking y un repaso de cada pregunta. Cuanto más rápido respondes, más puntos sumas.

**Cómo se juega.**
1. Pulsa el botón de instrucciones si tienes dudas y elige una dificultad: Fácil, Medio o Examen.
2. Lee con atención el enunciado y fíjate en la tabla y el esquema de la proporción.
3. Decide si la relación es directa (cuando una cantidad sube, la otra también) o inversa (cuando una sube, la otra baja).
4. Calcula el resultado mentalmente o con papel y lápiz aplicando la regla de tres.
5. Escribe el número en la casilla (con coma o punto si es decimal) y pulsa Comprobar o la tecla Enter.
6. En práctica, revisa el resultado y la explicación, y pulsa 'Otro problema' para seguir entrenando.
7. En Examen, responde las diez preguntas seguidas; no hay pistas y se avanza automáticamente.
8. Al terminar el examen, consulta tu nota sobre diez, tus puntos y el repaso de cada pregunta, y repite si quieres mejorar.

**Modos.**
- **🟢 Fácil**: Solo regla de tres directa y resultados enteros. Muestra siempre el esquema y la fórmula de ayuda, ideal para empezar.
- **🟡 Medio**: Mezcla de proporciones directas e inversas con hasta un decimal. Las ayudas se pueden activar o desactivar con un botón.
- **🔴 Examen**: Diez preguntas de directa e inversa con hasta dos decimales, sin ayudas. Da nota de 0 a 10 y cuenta para las tareas; responder rápido suma más puntos.

**Consejos.**
- Antes de operar, decide siempre si el problema es de proporción directa o inversa: es lo que más errores evita.
- En la regla directa multiplicas en cruz y divides; en la inversa multiplicas en línea (los dos datos de la misma fila) y divides.
- Usa coma o punto para los decimales; la app acepta ambos y tolera pequeños redondeos.
- Entrena primero en Fácil y Medio con las ayudas activadas y pasa al Examen cuando distingas con soltura los dos tipos de proporción.

---

## 📊 Porcentajes y Proporciones `(porcentajes-proporciones)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de cálculo de porcentajes y proporciones construida con React (un único componente Porcentajes.jsx) sobre un generador de problemas procedural propio (problemGenerator.js); sin dependencia de Supabase para el contenido. Tres dificultades (fácil/medio/examen) con ayudas visuales SVG dibujadas a mano y nota /10 en examen.

**Software.** Arquitectura de un solo componente funcional (src/apps/porcentajes/Porcentajes.jsx, ~1060 líneas) con máquina de estados por fase mediante useState: 'setup' -> 'play' -> 'finished'. La generación de contenido está separada en src/apps/porcentajes/problemGenerator.js, que exporta generateProblem(difficulty), checkAnswer(input, expected) y formatNumber(n). Hay 10 generadores por tipo (genPercentageOf, genWhatPercent, genFindTotal, genIncrease, genDecrease, genIva, genVariation, genProportion, genScale, genShare); cada uno devuelve {type, label, text, unit, answer, params}. El conjunto de tipos disponibles depende de la dificultad (TYPES_BY_DIFFICULTY: easy 5 tipos, medium 8, exam 10). checkAnswer normaliza coma/punto y '%', y valida con tolerancia |num-expected|<0.011. Librerías: framer-motion (animaciones de tarjetas, modal de salida con AnimatePresence), canvas-confetti (confeti verde al acertar en práctica) y lucide-react (iconos). NO usa three/@react-three/fiber, ni TTS, ni audio. Las ayudas visuales (Fraction, PercentGrid100 10x10, PieChart, StackBars, ProportionEq con flechas en cruz, ScaleVisual, ShareVisual) son SVG inline propios; ProblemHelper hace switch por label para componer visual+fórmula+ejemplo usando problem.params. Gestión de estado: hooks locales (useState/useRef/useCallback/useEffect), sin contexto ni store global. Puntuación de examen: POINTS_PER_CORRECT=100 + bonus de velocidad lineal (MAX_SPEED_BONUS=100 dentro de SPEED_BONUS_WINDOW_SEC=30s por pregunta) medido con questionStartRef; examPoints acumula y maxScore=10*(100+100)=2000. Nota /10 en summary calculada como Math.round((examCorrect/TOTAL_EXAM_QUESTIONS)*100)/10 con colores (>=8 verde, >=5 azul, <5 rojo) y mensajes según el patrón de CLAUDE.md. Anti-doble-disparo: trackedRef (useRef) protege el useEffect que llama onGameComplete una sola vez al entrar en fase 'finished' (se resetea en startGame).

**Jugabilidad.** Bucle: pantalla de selección de dificultad (3 tarjetas) -> partida. En práctica (fácil/medio) se muestra un problema, el alumno escribe la respuesta en un input (inputMode='decimal', autoFocus), pulsa Comprobar (o Enter) y recibe feedback inmediato (correcto/incorrecto con la solución; confeti al acertar; explicación textual del cálculo al fallar vía explainProblem). Puede pedir 'Otro problema' ilimitadamente o cambiar de dificultad. En examen son 10 preguntas encadenadas sin feedback por pregunta, con barra de progreso y badge n/10; al responder pasa automáticamente a la siguiente y al final muestra summary con nota, aciertos, puntos, tiempo e historial pregunta a pregunta (etiqueta de tipo, puntos/tiempo si acierta, respuesta correcta si falla). Controles: ratón/táctil + teclado (Enter comprueba o avanza; en práctica Enter tras feedback genera el siguiente). Sin vidas ni temporizador de derrota; el tiempo solo modula el bonus de velocidad. Hay modal propio de 'Salir del examen' (entrega parcial guardando la nota actual), cumpliendo la prohibición de window.confirm.

**Educativo.** Objetivo: dominar el cálculo de porcentajes (porcentaje de una cantidad, qué porcentaje representa una parte, hallar el total a partir de un porcentaje, aumentos, descuentos, IVA al 4/10/21%, variación porcentual) y proporcionalidad (proporciones con producto cruzado, escalas de planos/mapas con conversión de unidades cm->m/km, repartos proporcionales p:q). Entrena razonamiento proporcional, identificación del tipo de problema antes de aplicar la fórmula, cálculo mental y aproximado, lectura de enunciados contextualizados (compras, sueldos, aforos, mapas) y manejo de decimales. Las representaciones visuales (cuadrícula 100, tarta, barras apiladas, proporción en cruz) apoyan la comprensión conceptual frente al cálculo mecánico. Encaje curricular: aparece en Primaria 5º y 6º (matemáticas) y en ESO 1º-4º (matemáticas). No está en Bachillerato ni en Atención a la Diversidad.

**Datos.** Contenido 100% procedural y autocontenido en src/apps/porcentajes/problemGenerator.js; NO consume gameDataService ni getAppContent ni ninguna RPC de Supabase para los problemas. Cada partida genera combinaciones de números y escenarios (enunciados predefinidos por tipo, elegidos al azar) según la dificultad. Esto implica que el contenido no varía por nivel/curso/asignatura (un alumno de 5º Primaria y uno de 4º ESO reciben el mismo banco de generadores); el componente ni siquiera lee level/grade/subjectId de useParams.

**Integración.** Modos: tres dificultades en pantalla previa (easy, medium, exam). Solo el examen reporta resultado: onGameComplete se invoca con mode:'test', score=examPoints, maxScore=2000, correctAnswers, totalQuestions=10 y durationSeconds; práctica no llama a onGameComplete (no cuenta para tareas, alineado con el patrón estándar). El tracking de sesión y XP/insignias/ranking lo gestiona AppRunnerPage vía useGameTracker a partir de ese onGameComplete; el ranking se alimenta de score/maxScore (puntos con bonus de velocidad). No está registrada como single_mode ni en duelableApps.js (sin duelo 1vs1). Particularidades a tener en cuenta: (1) el componente no usa level/grade/subjectId, por lo que la dificultad real no se adapta al curso; (2) no hay material de estudio (botón 'Ver material de estudio') porque no hay glosario; (3) la nota se basa solo en aciertos/total, no en los puntos; (4) la salida anticipada del examen guarda nota parcial correctamente (trackedRef + fase finished).

**Ideas de mejora.**
- Adaptar la dificultad/tipos al curso real leyendo level/grade de useParams (p. ej. limitar variación y escalas en Primaria y reforzar IVA/repartos en ESO), ya que hoy el banco es idéntico para 5º Primaria y 4º ESO.
- Añadir un breve repaso teórico ('material de estudio') accesible desde el setup con las fórmulas clave y un ejemplo resuelto por tipo, reutilizando los componentes visuales SVG ya existentes (PieChart, StackBars, ProportionEq).
- Incluir la app en duelableApps.js con un PorcentajesDuel (mode:'duel' + DuelChatBar) para aprovechar el formato de 10 preguntas cronometradas en 1vs1.
- Mostrar en el summary del examen un desglose por tipo de problema (aciertos en porcentajes vs proporciones vs IVA, etc.) para que el alumno detecte su punto débil, aprovechando que examHistory ya guarda label/type por pregunta.

### Ficha de usuario

**¿Qué es?** Porcentajes y Proporciones es una app para practicar cálculo de porcentajes y razones de forma interactiva. En cada partida resuelves problemas variados: el porcentaje de una cantidad, qué porcentaje representa una parte, hallar el total, aumentos, descuentos, IVA, variaciones porcentuales, proporciones con la regla del producto cruzado, escalas de planos y mapas, y repartos proporcionales. Los enunciados aparecen ambientados en situaciones reales (compras, sueldos, aforos, distancias) y se generan distintos cada vez, así que puedes practicar tantas veces como quieras sin repetir.

**¿Por qué es relevante?** Los porcentajes y la proporcionalidad son de los contenidos matemáticos más útiles en la vida diaria: rebajas, IVA, intereses, subidas de precio, escalas de mapas o repartos justos. La app desarrolla el razonamiento proporcional, una competencia clave que conecta fracciones, decimales y porcentajes, y entrena algo decisivo: identificar primero qué tipo de problema es antes de aplicar la fórmula, que es donde se concentran la mayoría de los errores. Las ayudas visuales (cuadrículas de 100 casillas, gráficos de tarta, barras de precio, proporciones en cruz) muestran el porqué del cálculo y no solo el cómo, favoreciendo la comprensión profunda frente a la memorización mecánica. El feedback inmediato y la posibilidad de practicar sin límite refuerzan el aprendizaje por ensayo y corrección.

**¿Cómo funciona?** Eliges una dificultad y empiezas. En los modos de práctica (Fácil y Medio) lees el enunciado, escribes tu respuesta y la app te dice al instante si es correcta, con una explicación y un esquema visual cuando fallas; puedes pedir otro problema cuantas veces quieras. En el modo Examen resuelves 10 preguntas seguidas contra el reloj: al final obtienes una nota de 0 a 10, los puntos conseguidos (mejores cuanto antes respondas) y el repaso de cada pregunta. Todo se controla con el ratón, el teclado o la pantalla táctil.

**Cómo se juega.**
1. Pulsa el botón de instrucciones (?) si quieres repasar los tipos de problema y las fórmulas.
2. Elige una dificultad: Fácil (resultados enteros, con ayudas), Medio (hasta 1 decimal, con ayuda activable) o Examen (10 preguntas, hasta 2 decimales, sin ayudas).
3. Lee con atención el enunciado e identifica qué te piden (un porcentaje, el total, una variación, una proporción...).
4. Calcula y escribe solo el número en el cuadro de respuesta; usa coma o punto para los decimales y no escribas el símbolo %.
5. Pulsa Comprobar o la tecla Enter para validar tu respuesta.
6. En práctica, revisa el resultado y la explicación; pulsa Otro problema (o Enter) para seguir, o cambia de dificultad cuando quieras.
7. En el examen, responde las 10 preguntas seguidas; cada respuesta te lleva automáticamente a la siguiente.
8. Al terminar el examen, consulta tu nota sobre 10, tus puntos y el repaso pregunta a pregunta; puedes repetir o cambiar de dificultad.
9. Si necesitas dejar el examen antes de acabar, usa Salir del examen para entregarlo con la nota que llevas.

**Modos.**
- **🟢 Fácil**: Porcentaje de un número, encontrar el total, proporciones y aumentos/descuentos básicos con resultados enteros. Incluye ayudas visuales y explicación al fallar.
- **🟡 Medio**: Añade calcular qué porcentaje es, IVA y repartos proporcionales, con resultados de hasta un decimal. La ayuda visual se puede activar o desactivar.
- **🔴 Examen**: 10 preguntas con todos los tipos (incluye variación porcentual y escalas), hasta dos decimales y sin ayudas. Da nota de 0 a 10 y puntos según la rapidez.

**Consejos.**
- Antes de calcular, identifica el tipo de problema: la mayoría de errores vienen de aplicar la fórmula equivocada, no de calcular mal.
- En escalas, fíjate bien en las unidades que te piden (metros o kilómetros) y convierte el resultado.
- En variación porcentual escribe el valor sin signo, tanto si ha subido como si ha bajado.
- Empieza por Fácil o Medio para afianzar cada tipo con las ayudas visuales y pasa al Examen cuando vayas con soltura.

---

## 🔄 Giros y Rotaciones `(rotaciones-grid)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de geometría espacial (un único componente React, RotacionesGrid.jsx) en la que el alumno dibuja sobre una cuadrícula 9x9 la figura resultante de girar una pieza tipo poliominó un ángulo dado (90/180/270º) a derecha o izquierda. El contenido es propio del componente (no usa Supabase), la rotación se calcula con trigonometría sobre el centro de la malla y la comparación se hace por forma normalizada.

**Software.** Componente único `src/apps/rotaciones-grid/RotacionesGrid.jsx` + CSS propio. Librerías: `canvas-confetti` (confeti al acertar en práctica) e `InstructionsModal`/`InstructionsButton` de `_shared` (que internamente usan `framer-motion` y `lucide-react`). No usa three/@react-three/fiber ni TTS. Estado por `useState` (mode practice/exam, currentFigure, targetRotation, isClockwise, userCells, difficulty 0-2, feedback, examStep/examScore/examPoints/examHistory, flags de modales showHelp/showIndex/showInstructions/colorMode) y un `useRef` (`questionStartRef`) para el cronómetro de cada pregunta. Constantes: GRID_SIZE=9, CENTER=4, BASE_POINTS=100, MAX_SPEED_BONUS=100, SPEED_BONUS_WINDOW_SEC=30, DIFFICULTY_MULT=[1.0,1.5,2.5]. Núcleo geométrico: `rotatePoint(x,y,angleDeg,clockwise)` aplica matriz de rotación 2D (sin/cos) respecto a CENTER con `Math.round` para reanclar a la rejilla; `getRotatedCells` mapea la figura y conserva el índice original para el coloreado; `normalizeShape` traslada la figura a (0,0) restando minX/minY, serializa `x,y` ordenado y compara como string, de modo que se valida la FORMA con independencia de la posición/colocación en la malla y del color/orden. Puntuación de examen (`nextExamStep`): por pregunta acertada `(BASE_POINTS + speedBonus)·mult`, donde `speedBonus = round((1 - min(elapsed,30)/30)·100)`; `maxScore = 5·round((100+100)·mult)`. Nota /10 en la pantalla final: `Math.round((examScore/5)·100)/10` con color (>=8 verde #10b981, >=5 azul #3b82f6, <5 rojo #ef4444) y mensajes Excelente/Muy bien/Aprobado/Necesitas repasar, cumpliendo la sección 3.1 de CLAUDE.md; aplica además la doble progresión (nota capada + puntos sin tope por velocidad/dificultad). No hay ref anti-doble-disparo explícito: `onGameComplete` se invoca una sola vez dentro del `setTimeout` de la última pregunta del examen (examStep === TOTAL_EXAM_STEPS-1); el resto de la protección de fila por partida la aporta `useGameTracker` (consumo del session_id).

**Jugabilidad.** Bucle: se genera un ejercicio aleatorio (figura del nivel elegido colocada en el centro, ángulo entre 90/180/270 y sentido horario/antihorario al azar), el alumno pinta casillas en la cuadrícula 'Tu Dibujo' (click para pintar/borrar; un botón Borrar vacía todo) y pulsa Validar. Control por ratón/táctil mediante `onClick` en cada celda (no hay atajos de teclado ni arrastre). En práctica, acertar lanza confeti y mensaje de éxito (bloquea más clicks hasta nueva figura) y fallar muestra mensaje de error sin penalización, pudiendo reintentar o pedir 'Nueva'. Herramientas de práctica: 'Entrenar' (modal con la figura que se gira visualmente +/-90º con CSS transform para anticipar el resultado) y 'Catálogo' (todas las figuras agrupadas por dificultad en mini-rejillas). Toggle 'Colores' que pinta cada punto de un color distinto como ayuda visual. Examen: 5 preguntas, dificultad bloqueada, cada respuesta (acierto o fallo) avanza tras 2 s; sin vidas. Pantalla final con nota /10, aciertos, puntos, multiplicador e historial pregunta a pregunta (en los fallos compara mini-rejilla 'Tu dibujo' vs 'Solución'). No hay derrota: el examen siempre se completa salvo abandono.

**Educativo.** Trabaja el razonamiento espacial y la geometría de transformaciones (rotaciones/giros en el plano), competencia clave del bloque de Geometría de Matemáticas: identificar el efecto de un giro de amplitud y sentido dados sobre una figura, conservación de la forma y el tamaño bajo isometrías, orientación espacial y visualización mental. Entrena además atención al detalle, planificación y autocorrección (en el examen se confronta el dibujo con la solución). En la plataforma aparece solo en Primaria 4º, 5º y 6º dentro de Matemáticas (no está en ESO ni Bachillerato), encajando con la introducción de movimientos en el plano en el tercer ciclo de Primaria.

**Datos.** El contenido es propio del componente: la constante `FIGURES` define 3 listas de poliominós por dificultad (simples 3-4 casillas, compuestas 5-6, complejas 7-10) como arrays de offsets `[dx,dy]`. No invoca ninguna función de `gameDataService` (ni `getAppContent`, `getRoscoData`, etc.) ni consulta Supabase para sus contenidos; los ejercicios se generan localmente eligiendo figura, ángulo y sentido al azar. La paleta `COLORS` y los multiplicadores también son constantes del fichero.

**Integración.** Registrada en `commonApps.js` (`appRotacionesGrid`, id `rotaciones-grid`, carga lazy) e incluida en `primariaApps.js` para 4º/5º/6º Matemáticas. Modos: una sola pantalla con práctica libre (selector de dificultad por slider 0-2 siempre visible y modificable) y un Examen de 5 preguntas con la dificultad bloqueada; NO sigue el patrón estándar easy/medium/exam de tres botones (la dificultad es ortogonal al modo). No es single_mode ni tiene duelo 1 vs 1 (no está en `duelableApps.js`, no monta DuelChatBar). Tracking: solo emite `onGameComplete` UNA vez al terminar el examen con `mode:'test'`, score(puntos), maxScore, correctAnswers, totalQuestions; AppRunnerPage lo enruta a `useGameTracker.trackGameSession`, que calcula la nota como correct/total, registra `game_sessions`+`high_scores` y dispara XP/insignias/avatares/ranking. Particularidades a tener en cuenta: (1) la práctica NO llama a onGameComplete, así que jugar en práctica no cuenta para tareas, XP ni ranking; solo el examen tributa. (2) No hay refs anti-doble-disparo ni manejo de abandono propio: si el alumno sale a mitad de examen no se reporta nota parcial (a diferencia de Anagramas). (3) score que se manda a maxScore depende del multiplicador de dificultad, pero AppRunnerPage aplica además su propio multiplicador de curso al ranking. (4) `rotatePoint` usa `Math.round` tras rotar; con figuras muy anchas cerca del borde podría salirse de la rejilla 9x9 visible, conviene revisar que toda figura rotada quepa.

**Ideas de mejora.**
- Reportar también las partidas de práctica (o al menos un onGameComplete con mode:'practice') y, como en Anagramas, disparar nota parcial en el cleanup si el alumno abandona el examen a medias, para no perder el intento.
- Añadir traslaciones y simetrías (reflexiones) como nuevos tipos de transformación, e incluir ángulos no rectos o composición de movimientos, para extender la app a ESO y enriquecer el bloque de isometrías.
- Validar que toda figura rotada quepa dentro de la malla 9x9 (o ampliar/recentrar dinámicamente) y permitir pintar arrastrando el ratón/dedo para mejorar la jugabilidad táctil.
- Convertirla en app con duelo 1 vs 1 (FortalezaDuel-style) o añadir feedback sonoro/TTS del enunciado para accesibilidad, alineándola con el resto de apps de la plataforma.

### Ficha de usuario

**¿Qué es?** Giros y Rotaciones es una app de geometría en la que ves una figura formada por casillas sobre una cuadrícula y tienes que dibujar cómo queda esa figura después de girarla los grados que se indican (90º, 180º o 270º) hacia la derecha o hacia la izquierda. Tú pintas las casillas en tu propia cuadrícula y la app comprueba si la forma girada es correcta. Incluye un modo de práctica con ayudas y un examen de cinco preguntas con nota.

**¿Por qué es relevante?** Es una de las pocas actividades que entrena de forma directa el razonamiento espacial y la visualización mental, una competencia matemática fundamental que muchas veces queda poco trabajada con lápiz y papel. Al obligar al alumnado a imaginar el resultado de un giro y luego representarlo, desarrolla la comprensión de las isometrías (giros que conservan la forma y el tamaño), la orientación en el plano, la atención al detalle y la capacidad de autocorrección. Funciona pedagógicamente porque ofrece feedback inmediato y visual: en el examen se compara el dibujo con la solución casilla a casilla, de modo que el error se convierte en aprendizaje. El modo Entrenar permite ver el giro paso a paso antes de dibujar, andamiando el salto de lo concreto a lo abstracto, ideal para el tercer ciclo de Primaria.

**¿Cómo funciona?** La app muestra dos cuadrículas: a la izquierda la figura original y a la derecha una vacía donde dibujas. Lee el enunciado (cuántos grados girar y en qué sentido), imagina cómo queda la figura y pinta las casillas correspondientes haciendo clic. Cuando crees que está bien, pulsas Validar. Se evalúa solo la forma: no importa el color ni el lugar exacto de la cuadrícula donde la coloques, siempre que sea la figura correctamente girada. En práctica puedes pedir pistas; en examen respondes cinco preguntas seguidas y recibes una nota.

**Cómo se juega.**
1. Elige el nivel de dificultad con el deslizador (Simple, Compuesto o Complejo) según el tamaño de las figuras.
2. Observa la figura de la cuadrícula 'Original' y lee el enunciado: los grados del giro y si es hacia la derecha o hacia la izquierda.
3. Si lo necesitas, pulsa 'Entrenar' para ver la figura girando paso a paso, o 'Catálogo' para repasar todas las figuras.
4. Haz clic en las casillas de la cuadrícula 'Tu Dibujo' para pintar la figura ya girada; vuelve a hacer clic para borrar una casilla.
5. Usa el botón 'Borrar' si quieres vaciar tu cuadrícula y empezar de nuevo.
6. Pulsa 'Validar' para comprobar tu respuesta; si aciertas en práctica, verás confeti.
7. En práctica, pulsa 'Nueva' para generar otro ejercicio y seguir entrenando.
8. Cuando te sientas seguro, pulsa 'Examen': responde las cinco preguntas (la dificultad queda bloqueada) y consulta tu nota y el repaso final.

**Modos.**
- **Práctica**: Juego libre con ayudas (Entrenar, Catálogo y colores), confeti al acertar y ejercicios ilimitados. No tiene nota.
- **Examen**: Cinco preguntas seguidas con la dificultad bloqueada; al final muestra nota de 0 a 10, puntos y un repaso de cada pregunta con la solución.
- **Nivel Simple (x1.0)**: Figuras de 3 a 4 casillas. Ideal para empezar a visualizar los giros.
- **Nivel Compuesto (x1.5)**: Figuras de 5 a 6 casillas, algo más exigentes; los puntos valen más.
- **Nivel Complejo (x2.5)**: Figuras de 7 a 10 casillas para el mayor reto y la máxima puntuación.

**Consejos.**
- Usa el modo Entrenar antes del examen: girar la figura paso a paso te ayuda a 'ver' el resultado antes de dibujarlo.
- Fíjate en el sentido del giro: a la derecha (horario) y a la izquierda (antihorario) dan resultados distintos.
- Activa los Colores para seguir adónde se mueve cada punto de la figura; recuerda que solo se evalúa la forma, no el color ni la posición exacta.
- En el examen responde con calma pero sin demorarte: cuanto antes aciertes, más puntos de velocidad ganas.

---

## 🏛️ Números Romanos `(numeros-romanos)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de conversión arábigo→romano construida como un único componente reutilizable (NumerosRomanosGame.jsx) parametrizado por la prop maxNumber, que se exporta en cinco variantes de dificultad (3º, 4º, 5º, 6º y ESO). El jugador compone el número romano arrastrando o pulsando fichas de letras, con validación estructural propia (sin regex) y dos modos en pantalla: práctica libre y examen de 10 preguntas.

**Software.** Fichero único src/apps/_shared/NumerosRomanosGame.jsx + NumerosRomanos.css. Librerías: framer-motion (motion/AnimatePresence para entrada de fichas, layout animado, tarjetas de resultado), canvas-confetti (acierto y examen aprobado) y lucide-react (icono X para borrar ficha). Estado local con useState/useRef (sin Zustand ni contexto): isTestMode, targetNumber, userTiles (array de {id, value}), feedback, testStats {questions, currentIndex, score, answers, finished}, y cronómetro con testStartTimeRef + elapsedTime/finalTime actualizado por un setInterval. Lógica de dominio: toRoman() genera el romano canónico (mapa con barra superior U+0305 para miles, hasta 1.000.000); validateRomanStructure() valida el array de fichas sin regex (repetición sólo en potencias de 10 y máx 3, restas sólo I/X/C al nivel siguiente, no doble resta, no resta encadenada ilegal tipo CMC) y fromRoman() devuelve null si la estructura es inválida; getAvailableTiles(max) decide la paleta según maxNumber. Puntuación: computeRomanScore(correct, time) = correct·100 (0-1000) + bonus de tiempo (fastBonus 0-300 + longBonus 0-200) escalado por la proporción de aciertos; ROMAN_MAX_SCORE≈1500. Nota /10 en examen: Math.round((correct/10)*100)/10 con color (>=8 excellent, >=5 good, <5 fail) y mensaje. Anti-doble-disparo: useRef trackedRef2 dentro del useEffect que llama onGameComplete una sola vez al marcar finished (se resetea cuando finished vuelve a false).

**Jugabilidad.** Bucle: aparece un número arábigo objetivo (generado al azar dentro del rango de la variante); el alumno arrastra (HTML5 drag&drop con dataTransfer) o pulsa fichas de la paleta para apilarlas en la drop-zone, puede borrar cualquier ficha pulsándola, y comprueba la respuesta. En práctica libre da feedback inmediato ('¡Correcto!', 'Incorrecto. Eso es N.' o 'Estructura no válida') y permite generar un nuevo número; dos interruptores de ayuda (Ayuda Visual muestra el valor calculado en vivo, Ayuda Valores despliega tabla de letras + reglas). En examen son 10 preguntas con cabecera Pregunta x/10, cronómetro, barra de progreso y sin ayuda visual activada por defecto; al acertar lanza confeti centrado en la zona, al finalizar muestra nota /10, puntos, aciertos, tiempo y la corrección pregunta a pregunta con la solución. No hay vidas ni derrota por fallo: el examen siempre se completa. Controles ratón/táctil (arrastrar y click) y teclado parcial; soporta hasta 1.000.000 con notación de raya.

**Educativo.** Objetivo: dominar el sistema de numeración romana y la conversión bidireccional arábigo↔romano. Entrena reconocimiento de los símbolos (I, V, X, L, C, D, M y sus equivalentes con raya), las reglas de suma, resta, repetición y multiplicación por mil, y razonamiento numérico/descomposición. Encaje curricular: bloque de numeración de Matemáticas de Primaria con progresión clara entre variantes — 3º Básico (1-20), 4º Intermedio (hasta 100), 5º Avanzado (hasta 3999), 6º Experto (hasta 1.000.000 con raya, con distribución de dificultad mixta) y una variante para ESO idéntica al rango experto. El mismo concepto se escala añadiendo símbolos a la paleta y ampliando el rango.

**Datos.** No usa gameDataService ni getAppContent: el contenido es 100% procedural y autocontenido en el componente. generateNumber() produce números aleatorios dentro de maxNumber; para la variante de 6º/ESO (maxNumber>3999) aplica una distribución ponderada (20% hasta 3999, 30% 4k-50k, 30% 50k-500k, 20% 500k-1M) para mezclar números normales y con raya. El romano correcto y la validación se calculan en cliente con toRoman/fromRoman/validateRomanStructure.

**Integración.** Recibe maxNumber, title y onGameComplete desde las exportaciones por variante (NumerosRomanos3/4/5/6/ESO) montadas vía lazy en commonApps.js y registradas en primariaApps.js (por curso 3º-6º) y esoApps.js (variante ESO). Modos: no sigue el patrón estándar de pantalla previa easy/medium/exam — expone dos pestañas en pantalla (Práctica Libre y Examen) mediante botones que alternan isTestMode; sólo el examen llama a onGameComplete con mode:'test'. La práctica libre NO emite onGameComplete (no genera sesión ni nota). No tiene single_mode ni soporte de duelo (no está en duelableApps). El tracking lo aporta AppRunnerPage: onGameComplete pasa por trackGameSession/useGameTracker (XP, insignias, avatares) y por el multiplicador de curso (1.0-2.1) antes de guardar en game_sessions/high_scores para el ranking. La nota /10 se calcula internamente como correct/10·10 (no se pasa override 'nota' explícito; AppRunnerPage la deriva de correctAnswers/totalQuestions).

**Ideas de mejora.**
- Añadir el modo inverso (mostrar un romano y pedir el arábigo) e intercalarlo, para entrenar la conversión en ambos sentidos en lugar de sólo arábigo→romano.
- Implementar el patrón estándar de selección previa de dificultad (easy/medium/exam) o al menos un modo medio con ayudas intermedias, y soporte de duelo 1 vs 1 (componente Duel + DuelChatBar) ya que la mecánica de fichas encaja bien en pique.
- Reforzar la accesibilidad y el uso en táctil/teclado: el drag&drop HTML5 nativo falla en muchos móviles (sólo queda el click); convendría drag táctil real o navegación por teclado y aria-labels en las fichas.
- Mostrar feedback didáctico más rico en el fallo del examen (resaltar qué regla se incumplió y la descomposición canónica), aprovechando que validateRomanStructure ya conoce el motivo de invalidez.

### Ficha de usuario

**¿Qué es?** Números Romanos es una app de matemáticas para practicar la conversión entre números normales (arábigos) y números romanos. La pantalla muestra un número, por ejemplo 47, y el alumno tiene que construir su versión romana arrastrando o pulsando fichas con las letras I, V, X, L, C, D y M (y las versiones con raya para los miles). Hay práctica libre con ayudas y pistas, y un examen de diez preguntas que pone nota. Existen varias versiones según el curso, con números cada vez más grandes.

**¿Por qué es relevante?** Trabajar la numeración romana consolida competencias clave de matemáticas: comprender que existen distintos sistemas de numeración, descomponer cantidades, y aplicar reglas lógicas de suma, resta, repetición y multiplicación por mil. Al tener que componer cada número pieza a pieza, el alumnado no memoriza de forma mecánica, sino que razona la estructura del número y detecta sus propios errores gracias a la ayuda visual que muestra el valor en tiempo real. La progresión por cursos (del 1-20 hasta el millón) permite ajustar el reto al nivel real de cada alumno, manteniendo el desafío sin frustración. Además, conecta las matemáticas con la cultura y la historia, ya que los números romanos siguen presentes en relojes, siglos, capítulos y monumentos, lo que da sentido y motivación al aprendizaje.

**¿Cómo funciona?** La app muestra un número y una paleta de fichas con las letras romanas. El alumno arrastra o pulsa las fichas para formar el número romano correcto en la zona de respuesta, donde puede quitar cualquier ficha si se equivoca. Dos interruptores de ayuda muestran el valor que lleva construido y una tabla con las letras y sus reglas. En práctica libre comprueba cuantas veces quiera con un número nuevo cada vez; en el examen responde diez preguntas cronometradas y al final recibe su nota sobre diez y la corrección detallada.

**Cómo se juega.**
1. Observa el número que aparece arriba, en cifras normales (por ejemplo, 47).
2. Si lo necesitas, activa los interruptores de ayuda para ver el valor que llevas y la tabla de letras y reglas.
3. Arrastra las fichas de letras hasta la zona de respuesta, o simplemente púlsalas, para ir formando el número romano.
4. Coloca las letras en el orden correcto aplicando las reglas de suma, resta y repetición.
5. Si te equivocas, pulsa una ficha colocada para quitarla y vuelve a intentarlo.
6. Pulsa 'Comprobar' para ver si tu número es correcto; en práctica libre puedes pedir un 'Nuevo Número' cuando quieras.
7. Para evaluarte, pulsa 'Iniciar examen' y resuelve las diez preguntas, una tras otra, antes de pulsar 'Finalizar'.
8. Al terminar el examen revisa tu nota sobre diez, los puntos, el tiempo y la solución de cada pregunta.

**Modos.**
- **Práctica Libre**: Practica sin presión con números ilimitados, feedback inmediato y ayudas (valor en vivo y tabla de reglas). No cuenta para la nota.
- **Examen**: Diez preguntas cronometradas sin ayudas por defecto. Al acabar muestra la nota sobre diez, los puntos y la corrección. Esta es la modalidad que cuenta para las tareas.

**Consejos.**
- Recuerda las restas básicas: IV es 4, IX es 9, XL es 40 y XC es 90; te ahorran muchos errores.
- Una letra solo puede repetirse hasta tres veces seguidas (III, XXX), y V, L y D nunca se repiten.
- En práctica libre activa la 'Ayuda Visual' para ver el valor que llevas y aprender corrigiendo sobre la marcha.
- En las versiones avanzadas, la raya sobre una letra multiplica su valor por mil: úsala para los números más grandes.

---

## ⚖️ Mayor, Menor o Igual `(mayor-menor)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de comparación numérica (mayor/menor/igual) construida sobre el motor compartido MayorMenorGame.jsx, que ofrece dos sub-modos (comparar y ordenar) con seis niveles de dificultad procedurales. Cada ficha del catálogo (mayor-menor-1..6) es un wrapper que fija level y fixedMode='comparar'.

**Software.** Componente único src/apps/_shared/MayorMenorGame.jsx con su hoja src/apps/_shared/MayorMenor.css. Librerías: React (useState/useEffect/useCallback/useRef), framer-motion (motion + layout para reordenar tarjetas con spring en el sub-modo 'ordenar') y canvas-confetti (acierto en práctica y celebración fin de examen >=5). No usa three/r3f, lucide-react ni TTS. Toda la generación de problemas es procedural en el propio fichero: makeExpressionForValue, generateOrderProblem y el generador principal generateLevelProblem(level), que producen pares left/right por nivel (1: 1-20; 2: hasta 100 y sumas; 3: multiplicaciones; 4: combinadas a x b +/- c; 5: decimales con 2 cifras padeadas para evitar la trampa 5,5 vs 5,15; 6: expresiones con negativos y multiplicación decimal). Hay un 20% de probabilidad forzada de que el par sea igual (caso '='). Estado local por useState (phase, gameMode, isTestMode, leftItem/rightItem, orderItems, selectedSign, testStats). El examen son TOTAL_TEST_QUESTIONS=10 preguntas pregeneradas. Puntuación de examen: basePoints = aciertos x BASE_POINTS_PER_HIT(200) + timeBonus = max(0, (timeBudget - segundos) x SPEED_COEF(5)) con timeBudget = 8s x 10; examMaxScore = 10x200 + timeBudget x 5. La nota /10 NO se calcula en el componente: se delega a AppRunnerPage/useGameTracker pasando score=examPoints y maxScore=examMaxScore (el summary propio solo muestra aciertos/10 y desglose de puntos). Anti-doble-disparo: trackedRef (useRef) que se arma al terminar y se rearma si testStats.finished pasa a false; el efecto exige también finalElapsed>0. testStartRef guarda el inicio para el cronómetro.

**Jugabilidad.** Dos sub-modos. Comparar: se muestran dos tarjetas (number-card) con un hueco central (sign-drop-zone); el alumno pulsa <, = o > en la paleta de signos y Comprobar. Ordenar: 3, 4 o 5 tarjetas que se reordenan con botones de intercambio ⇄ (animación spring de framer-motion); objetivo de menor a mayor. Controles por ratón/táctil (botones); no hay atajos de teclado. Dos toggles dentro del juego: Práctica (intentos infinitos, feedback inmediato con confeti verde en acierto y shake + mensaje correctivo en fallo, avanza solo tras 1,5s) y Examen (10 preguntas, sin vidas, sin feedback por pregunta, botón Siguiente/Finalizar). Al terminar el examen: pantalla de resultados con puntuación aciertos/10, desglose de puntos, lista revisable de respuestas (Era X en los fallos) y confeti lateral continuo 3s si score>=5. No hay condición de derrota; el examen siempre concluye al responder las 10.

**Educativo.** Objetivo: dominar la comparación y ordenación de cantidades y resultados de operaciones, consolidando el sentido numérico (valor relativo, equivalencia y orden) y el uso correcto de los signos <, = y >. Entrena cálculo mental (sumas, multiplicaciones, combinadas, decimales y enteros negativos según nivel), valor posicional y la lectura cuidadosa de decimales (nivel 5 con el clásico 5,5 vs 5,15). Encaja en el bloque de Números/Sentido numérico de Matemáticas. Aparece en Primaria por curso (1º a 6º, una variante por curso para comparar y otra para ordenar) y la variante de nivel 6 (Reto de Comparación / Reto de Ordenación) se reutiliza en ESO como repaso.

**Datos.** No usa gameDataService ni Supabase para el contenido: no llama a getRoscoData, getRunnerData, getAppContent ni ninguna RPC. Todos los problemas se generan de forma procedural y determinada por azar dentro del propio componente (generateLevelProblem, generateOrderProblem, makeExpressionForValue, randomInt), parametrizados solo por el prop numérico level (1-6). Esto hace la app autónoma e infinita pero sin posibilidad de curar contenido desde la BD.

**Integración.** Registrada en commonApps.js (12 wrappers: MayorMenor1-6 con fixedMode='comparar' + OrdenaNumeros1-6 con fixedMode='ordenar') y enlazada en primariaApps.js por curso y en esoApps.js (solo nivel 6). NO está en duelableApps.js: no hay duelo 1 vs 1. Tracking: solo el examen reporta a onGameComplete con mode:'test' (score=examPoints, maxScore=examMaxScore, correctAnswers, totalQuestions, durationSeconds); la práctica NO dispara onGameComplete (no se envía mode:'practice'). El ranking, XP, insignias y nota /10 los aplica AppRunnerPage/useGameTracker a partir de score/maxScore. No está marcada como single_mode. Particularidades a vigilar: (1) la nota del examen depende de correctAnswers/totalQuestions aguas arriba, mientras score/maxScore llevan el bonus de rapidez en paralelo — coherente con el sistema; (2) generateOrderProblem ordena los items por id (Math.random) y no garantiza que no haya valores idénticos, lo que puede crear órdenes ambiguos; (3) la validación de 'ordenar' solo comprueba no-decreciente, por lo que con valores iguales puede haber varias soluciones válidas; (4) la app comparte un único app_id para las 6 variantes salvo que el id de catálogo las separe — relevante para requisitos de avatares por (app_id, level, grade, subject).

**Ideas de mejora.**
- Añadir soporte de teclado (teclas <, =, > y flechas para reordenar) y arrastrar-soltar real para el sub-modo ordenar, mejorando accesibilidad y rapidez frente al actual botón ⇄.
- Exponer el sub-modo 'ordenar' como ficha de catálogo propia con su pantalla de dificultad y registrar duelo 1 vs 1 (duelableApps + componente Duel) dado que la mecánica encaja bien en comparación rápida.
- Endurecer generateOrderProblem para evitar valores duplicados y órdenes ambiguos, y validar el orden de forma estricta cuando se desee solución única; añadir explicación del porqué del signo en los fallos del examen (no solo 'Era >').
- Permitir contenido curable/temático desde la BD vía getAppContent (p. ej. problemas contextualizados o por evaluación) para que el docente pueda ajustar dificultad sin tocar el generador procedural.

### Ficha de usuario

**¿Qué es?** Mayor, Menor o Igual es un juego de matemáticas para comparar números y resultados de operaciones. En cada ronda aparecen dos cantidades y tú decides si la primera es mayor, menor o igual que la segunda, eligiendo el signo correcto (>, < o =). También incluye un modo de ordenar varios números de menor a mayor. Hay seis niveles que crecen en dificultad: desde números del 1 al 20 hasta decimales y expresiones complejas con operaciones combinadas. Es perfecto para practicar el sentido numérico de forma rápida y visual.

**¿Por qué es relevante?** Comparar y ordenar cantidades es una de las bases del sentido numérico: entender cuánto vale un número en relación con otro sostiene casi todo el cálculo posterior. Esta app trabaja esa competencia de forma activa y progresiva, obligando al alumnado a calcular mentalmente (sumas, multiplicaciones, operaciones combinadas, decimales y negativos según el nivel) antes de decidir el signo. El nivel de decimales incluye trampas pensadas a propósito, como distinguir 5,5 de 5,15, que ayudan a corregir errores muy frecuentes sobre el valor posicional. El acierto se refuerza al instante con animaciones, y el modo examen aporta una nota y un repaso de fallos que favorece el aprendizaje autónomo. Al ser contenido generado sin límite, cada partida es distinta y permite practicar tanto como haga falta.

**¿Cómo funciona?** La app propone parejas de números u operaciones y el alumnado elige el signo correcto entre <, = y >. En el modo Ordenar, coloca varias tarjetas de menor a mayor con botones para intercambiarlas. Hay dos formas de jugar: Práctica, con intentos ilimitados y pistas inmediatas tras cada respuesta, y Examen, con diez preguntas seguidas que terminan en una nota, puntos extra por rapidez y un repaso de los aciertos y fallos. La dificultad la marca el curso (del 1 al 6).

**Cómo se juega.**
1. Abre la app y elige el modo: Comparar (mayor, menor o igual) u Ordenar (de menor a mayor).
2. Si eliges Ordenar, indica cuántos valores quieres colocar (3, 4 o 5).
3. Decide si quieres Práctica (para entrenar sin presión) o Examen (diez preguntas con nota).
4. En el modo Comparar, mira las dos tarjetas, calcula si hace falta y pulsa el signo correcto: <, = o >.
5. En el modo Ordenar, usa el botón ⇄ entre tarjetas para intercambiarlas hasta dejarlas de menor a mayor.
6. Pulsa Comprobar para validar tu respuesta; en práctica verás al momento si es correcta o el motivo del error.
7. En el examen, pulsa Siguiente hasta llegar a la última pregunta y luego Finalizar.
8. Revisa la pantalla de resultados: tu nota, los puntos por rapidez y la lista de aciertos y fallos.
9. Repite el examen o vuelve a practicar para mejorar tu marca.

**Modos.**
- **Comparar**: Decide si el primer número u operación es mayor, menor o igual que el segundo eligiendo el signo correcto.
- **Ordenar**: Coloca de menor a mayor un conjunto de 3, 4 o 5 valores intercambiando las tarjetas.
- **Práctica**: Intentos ilimitados con pistas inmediatas tras cada respuesta; ideal para entrenar.
- **Examen**: Diez preguntas seguidas con nota final, puntos extra por rapidez y repaso de aciertos y fallos.

**Consejos.**
- En los niveles con decimales, fíjate bien en las cifras tras la coma: 5,5 es mayor que 5,15 aunque parezca lo contrario.
- En el modo Examen responde con calma pero sin pararte demasiado: hay puntos extra por rapidez.
- Antes de elegir el signo, calcula mentalmente el resultado de cada operación y luego compáralos.
- Usa el modo Práctica para repasar los errores; el mensaje te dice cuál era la relación correcta.

---

## 🔢 Ordena los Números `(ordena-numeros)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Variante del motor compartido MayorMenorGame (src/apps/_shared/MayorMenorGame.jsx) invocado con fixedMode='ordenar': el alumno coloca de menor a mayor un conjunto de 3, 4 o 5 valores. Existen 6 fichas de catálogo (ordena-numeros-1 a -6), una por curso, que solo cambian el prop level (1-6) y el title; el componente es 100% autocontenido y genera todo el contenido por código.

**Software.** Componente único MayorMenorGame.jsx que exporta wrappers OrdenaNumeros1..6 (cada uno fija level numérico al final de los props para no ser pisado por el level string de la URL, y title). Estilos en MayorMenor.css. Librerías: framer-motion (motion.div con layout + transición spring stiffness 300/damping 30 para animar el reordenado de las tarjetas) y canvas-confetti (estallido en acierto de práctica y lluvia lateral continua de 3s al terminar examen con score>=5). Sin three/r3f, sin TTS, sin lucide-react (los iconos son emojis ⇄ 🔢). Estado local con useState: phase ('quantity'|'play' al venir con fixedMode), orderItems (array {id,text,value}), isTestMode, testStats ({questions, currentIndex, score, answers, finished}), shakeError, feedback. Generación: generateOrderProblem(level, count) crea 'count' items; el value es el número real y text puede ser el número o una expresión equivalente (suma/resta vía makeExpressionForValue, multiplicación, operación combinada, decimal con coma, o expresión con negativos en nivel 6). Validación del orden: recorre orderItems y exige value[i] <= value[i+1]. Puntuación de examen: BASE_POINTS_PER_HIT=200 por acierto (basePoints = score*200) más bonus de rapidez timeBonus = max(0, round((8*10 - segundos) * 5)); examMaxScore = 10*200 + 80*5. NO calcula una nota /10 propia en el summary (muestra 'Puntuación: score/10' y los puntos brutos); la nota /10 reglamentaria la deriva AppRunnerPage a partir de correctAnswers/totalQuestions. Anti-doble-disparo: trackedRef (useRef) que se pone a true antes de llamar onGameComplete y se rearma cuando el test deja de estar finished; testStartRef guarda el timestamp de inicio para medir finalElapsed.

**Jugabilidad.** Bucle: pantalla previa '¿Cuántos valores?' (3/4/5) → tablero con las tarjetas desordenadas y separadores con el signo '<' fijo entre ellas. Control: botón ⇄ entre cada par de tarjetas para intercambiar posiciones adyacentes (bubble-sort manual); es por clic/táctil, NO hay drag&drop real ni atajos de teclado. Dentro del tablero hay un toggle Práctica/Examen. En Práctica: 'Comprobar' valida el orden (confeti verde + mensaje y autoavance a 1,5s si correcto; shake-animation 0,5s + mensaje 'Aún no están en orden' si no), y 'Siguiente' salta sin penalización. En Examen: 10 preguntas, contador 'Pregunta X/10', botón Siguiente/Finalizar; sin vidas ni temporizador visible por pregunta (el tiempo solo alimenta el bonus). Al acabar: pantalla de Resultados con score/10, desglose (aciertos + bonus rapidez + total), lista de respuestas marcadas OK/Incorrecto y botones Repetir Examen / Salir.

**Educativo.** Objetivo: consolidar el sentido de magnitud y la relación de orden (<, =, >) ordenando de menor a mayor. Destrezas según el nivel del curso (level): nivel 1 conteo hasta 20; nivel 2 números y sumas hasta 100; nivel 3 resultados de tablas de multiplicar; nivel 4 operaciones combinadas (axb±c); nivel 5 comparación de decimales con dos cifras (incluye la trampa 5,5 vs 5,15); nivel 6 expresiones complejas con multiplicaciones/sumas/restas y números negativos. Encaja en el bloque de Numeración y Operaciones de Matemáticas de Primaria 1º-6º (una ficha por curso); la variante de nivel 6 (Reto de Ordenación) está además disponible en toda la ESO.

**Datos.** No usa gameDataService ni getAppContent ni ninguna fuente de Supabase: todo el contenido se genera proceduralmente en el cliente con randomInt y las funciones generateOrderProblem / makeExpressionForValue, parametrizadas por el prop level. Es contenido infinito y aleatorio, sin BD ni JSON de apoyo.

**Integración.** Modos: dentro de cada ficha hay un toggle Práctica/Examen (no la pantalla previa estándar de tres dificultades easy/medium/exam; la 'dificultad' viene fijada por el curso vía level, y la única elección previa es la cantidad 3/4/5). Solo el Examen dispara onGameComplete con mode:'test' (score=examPoints, maxScore=examMaxScore, correctAnswers, totalQuestions=10, durationSeconds); la práctica nunca llama a onGameComplete. NO está registrada como single_mode ni en duelableApps.js (no tiene componente Duel), por lo que no hay duelo 1vs1 ni chat de frases. El tracking de sesión, XP, insignias, avatares y ranking los gestiona AppRunnerPage/useGameTracker a partir de ese onGameComplete; el ranking aplica el multiplicador de curso sobre score/maxScore. Particularidades a vigilar: (1) el summary muestra puntos brutos pero NO la nota /10 con color/mensaje que exige el CLAUDE.md, la nota la calcula el runner; (2) el modo Ordenar comparte componente con el modo Comparar (Mayor/Menor), de ahí el state gameMode; (3) generateOrderProblem ordena los items por id (Math.random) al crearlos, así que el desorden inicial es aleatorio pero podría salir ya ordenado por azar.

**Ideas de mejora.**
- Mostrar la nota /10 con color (verde>=8, azul>=5, rojo<5) y mensaje (Excelente/Muy bien/Aprobado/Necesitas repasar) en la pantalla de Resultados, tal como pide la guía 3.1, en lugar de solo 'score/10' y puntos brutos.
- Sustituir el intercambio por botón ⇄ por arrastrar y soltar real (con soporte táctil) y permitir reordenar a cualquier posición, no solo adyacentes, para una manipulación más natural; añadir también navegación por teclado por accesibilidad.
- Garantizar que el conjunto inicial nunca aparezca ya ordenado (re-barajar si el orden de partida coincide con el correcto) y evitar valores duplicados consecutivos para que la solución sea siempre única.
- Crear un componente OrdenaNumerosDuel y registrarlo en duelableApps.js (montando DuelChatBar) para ofrecer la modalidad 1vs1, dado que el motor de examen por preguntas se presta bien a ello.

### Ficha de usuario

**¿Qué es?** Ordena los Números es una actividad de matemáticas en la que el alumno coloca varios valores en orden de menor a mayor. En la pantalla aparecen tres, cuatro o cinco tarjetas desordenadas y la tarea consiste en moverlas hasta dejarlas bien colocadas. Según el curso, las tarjetas muestran números sencillos, sumas, resultados de multiplicaciones, operaciones combinadas, decimales o expresiones más complejas. Es una práctica corta, visual y repetible que entrena el sentido del orden y la comparación de cantidades de forma amena.

**¿Por qué es relevante?** Ordenar cantidades es una de las destrezas matemáticas más básicas y, a la vez, más reveladoras: para colocar bien las tarjetas el alumno tiene que comparar magnitudes y, en muchos casos, calcular antes el resultado de una suma, una multiplicación o una operación combinada. Así se trabaja a la vez el cálculo mental y el sentido numérico. La progresión por cursos es muy cuidada: empieza con números hasta 20 y llega a decimales y expresiones con negativos, incluyendo trampas clásicas como distinguir 5,5 de 5,15, donde muchos alumnos fallan. Al ser contenido generado al azar e infinito, cada partida es distinta, lo que favorece la práctica repetida sin memorizar respuestas. El intercambio paso a paso de tarjetas hace visible el razonamiento del orden y refuerza la idea de la relación menor-mayor.

**¿Cómo funciona?** El alumno elige cuántos valores quiere ordenar (3, 4 o 5) y aparecen las tarjetas desordenadas con un símbolo menor-que entre ellas. Usando los botones de intercambio va cambiando de sitio las tarjetas hasta dejarlas de menor a mayor. En modo Práctica puede comprobar cuantas veces quiera y recibe pistas y celebración al acertar; en modo Examen resuelve diez ordenaciones seguidas y al final ve su puntuación, un resumen de aciertos y un bonus por rapidez. Cada partida usa números nuevos generados automáticamente.

**Cómo se juega.**
1. Elige cuántos valores quieres ordenar: 3, 4 o 5.
2. Observa las tarjetas desordenadas y, si muestran operaciones, calcula mentalmente su resultado.
3. Decide cuál es el orden correcto, de menor a mayor.
4. Pulsa el botón de intercambio (⇄) entre dos tarjetas para cambiarlas de sitio, repitiendo hasta dejarlas bien colocadas.
5. Cuando creas que están en orden, pulsa Comprobar.
6. Si aciertas, verás la celebración y pasarás a una nueva ronda; si no, ajusta las tarjetas e inténtalo otra vez.
7. Para ponerte a prueba, cambia al modo Examen y resuelve las diez ordenaciones.
8. Al terminar el examen, revisa tu puntuación, el resumen de aciertos y el bonus por rapidez.

**Modos.**
- **Práctica**: Ordenaciones ilimitadas con pistas, comprobación libre y celebración al acertar. No cuenta para la nota.
- **Examen**: Diez ordenaciones seguidas con puntuación, bonus por rapidez y resumen final. Cuenta para la tarea y el ranking.

**Consejos.**
- En los niveles con sumas, multiplicaciones u operaciones, calcula primero el resultado de cada tarjeta y ordénalas por ese valor, no por cómo se ven.
- Con decimales, fíjate bien en las cifras tras la coma: 5,5 es mayor que 5,15 aunque tenga menos dígitos.
- Empieza colocando la tarjeta más pequeña a la izquierda y la más grande a la derecha; luego ajusta las del medio.
- En modo Examen no te precipites, pero recuerda que resolver con agilidad suma puntos extra por rapidez.

---

## 📏 Medidas (Longitud, Masa y Capacidad) `(medidas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Motor único React (MedidasGame.jsx) para comparar y ordenar medidas de longitud, masa y capacidad con conversión de unidades del Sistema Métrico Decimal. Se expone como 6 fichas del catálogo mediante wrappers finos (forcedType × forcedMode) sobre el mismo componente.

**Software.** Componente único src/apps/_shared/MedidasGame.jsx + hoja Medidas.css. Se exportan 6 wrappers (LongitudComparar/Ordenar, MasaComparar/Ordenar, CapacidadComparar/Ordenar) que solo fijan forcedType ('longitud'|'masa'|'capacidad') y forcedMode ('comparar'|'ordenar') y un title; registrados con lazy import en commonApps.js. Librerías: react (useState/useEffect/useCallback/useMemo/useRef), react-router-dom (useParams para leer grade), framer-motion (layout animations de las tarjetas en modo ordenar, spring stiffness 300/damping 30), canvas-confetti (acierto en práctica y celebración final si score>=5) y el InstructionsModal/InstructionsButton compartidos de _shared. No usa three/r3f, ni lucide-react, ni TTS. Estado: todo local con useState (phase setup/quantity/play, measureType, gameMode, orderCount, leftItem/rightItem, orderItems, selectedSign, feedback, showHelper, isTestMode y un objeto testStats con questions/currentIndex/score/points/answers/finished). Las constantes del sistema de unidades viven en MEASURE_TYPES (factores 1..1000000 sobre la unidad base mm/mg/ml y orden km..mm). Generación de contenido 100% procedimental en el propio componente (generateProblemData para comparar, generateOrderProblemManual para ordenar); el nivel de dificultad (1-6) se resuelve de la URL con resolveLevelFromGrade(grade) (default 6) o de levelProp si es numérico. La comparación se decide por valueBase (todo convertido a la unidad mínima) restando left.valueBase - right.valueBase; el orden se valida comprobando que la secuencia es no decreciente. Puntuación de examen: por pregunta acertada questionPoints = BASE_POINTS(100) + speedBonus, donde speedBonus = round((1 - min(elapsed,20)/20) · 100) medido con questionStartRef; falladas suman 0. Nota /10 = round(score/10 · 100)/10 con color y mensaje (>=8 verde, >=5 azul, <5 rojo; Excelente/Muy bien/Aprobado/Necesitas repasar). maxScore = 10·(100+100)=2000. Anti-doble-disparo con trackedRef (useRef bool) que se arma al terminar el test y se rearma si finished pasa a false.

**Jugabilidad.** Bucle: en variantes forzadas se entra por una mini-pantalla setup ('Pulsa para empezar') que lleva a 'play'; el modo (comparar/ordenar) y la magnitud ya vienen fijados por la ficha. Comparar: se muestran dos tarjetas de medida y el alumno pulsa uno de los tres botones de signo (<, =, >) y comprueba; acierto en práctica lanza confeti verde y autogenera otro problema a los 1,5 s, fallo muestra el mensaje explicativo (MAYOR/MENOR/IGUAL). Ordenar: 3-5 tarjetas (orderCountForLevel: <=2 nivel→3, <=4→4, resto→5) con botones ⇄ entre tarjetas para intercambiar posiciones (animación spring de framer-motion); se valida que estén de menor a mayor, con animación shake si falla. Controles solo de ratón/táctil (clic en botones); no hay teclado ni drag&drop libre (el reordenado es por swaps adyacentes). Toggle Práctica/Examen en cabecera; en práctica hay un switch de 'Ayuda' que despliega una escalera visual de unidades (peldaños con x10 entre cada uno, base resaltada). Examen: 10 preguntas, contador 'Pregunta n/10', sin ayudas, cronometrado por pregunta; al final pantalla de resultados con nota grande, aciertos, puntos y desglose pregunta a pregunta (tiempo y puntos), botones Repetir Examen / Salir. Sin vidas ni game over; el 'fallo' en examen solo resta puntos de esa pregunta.

**Educativo.** Objetivo: dominar el Sistema Métrico Decimal —ordenar las unidades de mayor a menor, comprender que cada peldaño multiplica/divide por 10 y convertir entre unidades para comparar magnitudes expresadas en unidades distintas (ej. 3 m vs 250 cm)—. Entrena conversión de unidades, comparación de cantidades, razonamiento con el valor posicional decimal y, en niveles altos, descomposición de medidas complejas (ej. '2 km 300 m'). Encaja en el bloque de Magnitudes y Medida del área de Matemáticas. Está disponible en toda Primaria (1º-6º), donde el nivel de dificultad escala con el curso (grade 1-6 → niveles 1-6), y también en ESO como refuerzo (donde el grade 1-4 mapea a niveles 1-4). La progresión interna va de pocas unidades cercanas y valores pequeños (niveles 1-2: par unidad pequeña/media, máx. 20-100) a toda la escalera de unidades, valores grandes y medidas compuestas/equivalencias exactas (niveles 4-6).

**Datos.** No usa gameDataService ni getAppContent ni Supabase para el contenido: todos los problemas se generan en el propio componente de forma procedimental y aleatoria a partir de la tabla de factores MEASURE_TYPES y de funciones puras (generateMeasurement, generateProblemData, generateOrderProblemManual, randomInt, pickUnit). Lo único que toma del exterior es el parámetro grade de la URL (useParams) para fijar el nivel de dificultad, y opcionalmente levelProp. Esto hace el contenido infinito y autocontenido, pero también significa que no es editable desde el panel docente ni curado por la base de datos.

**Integración.** Modos reales: Práctica (con/sin ayuda) y Examen (mode:'test', 10 preguntas) seleccionables con un toggle dentro de la partida; NO sigue el patrón estándar de selección previa easy/medium/exam ni hay pantalla de dificultad por niveles (la dificultad la marca el curso). No es single_mode ni está en app_scoring_config como tal, no aparece en duelableApps.js (sin duelo 1vs1) y por tanto no monta DuelChatBar. Tracking vía onGameComplete: se llama UNA vez al finalizar el examen, protegido por trackedRef, con {mode:'test', score:puntos, maxScore:2000, correctAnswers, totalQuestions:10}; no envía nota (deja que AppRunnerPage la calcule como correct/total·10). El modo práctica NO dispara onGameComplete, así que solo el examen cuenta para tareas/ranking/XP/insignias/avatares. El ranking se alimenta solo de score/maxScore (multiplicador de curso lo aplica AppRunnerPage). Particularidades a vigilar: (1) el toggle Práctica/Examen está en pantalla durante la partida —contradice el aviso de CLAUDE.md de poner el selector en pantalla previa, aunque aquí el cambio sí reinicia limpio porque arranca un test nuevo—; (2) en modo ordenar examen, answers.user guarda 'OK'/'FAIL' y el render del resumen no muestra el orden esperado; (3) generateProblemData puede emitir tarjetas con texto compuesto ('part1 + part2 unidad') como fallback, poco habitual visualmente.

**Ideas de mejora.**
- Permitir reordenar en modo Ordenar con drag & drop (ya hay framer-motion layout) y soporte de teclado, manteniendo los botones ⇄ como alternativa accesible.
- Mostrar en el resumen del examen, para las preguntas de Ordenar falladas, la secuencia correcta de menor a mayor (hoy solo dice 'Incorrecto'), para que el repaso sea formativo.
- Añadir TTS/lectura en voz alta de las medidas y de la escalera de unidades para Atención a la Diversidad y primeros cursos, reutilizando el patrón TTS de la plataforma.
- Habilitar duelo 1vs1 (MedidasDuel + DuelChatBar) con problemas deterministas por semilla compartida, dado que el contenido es generado y sería sencillo sincronizar el seed entre rivales.

### Ficha de usuario

**¿Qué es?** Medidas es un juego de matemáticas para practicar las unidades de longitud, masa y capacidad. Hay seis fichas, una por cada magnitud y tarea: longitud, masa y capacidad, cada una en modo Comparar y en modo Ordenar. En Comparar decides si una medida es mayor, menor o igual que otra (por ejemplo, 3 m frente a 250 cm). En Ordenar colocas varias medidas de menor a mayor. Todos los problemas se generan automáticamente, así que el alumnado siempre encuentra ejercicios nuevos.

**¿Por qué es relevante?** Comparar y ordenar medidas es uno de los aprendizajes clave del bloque de magnitudes en Matemáticas y una destreza muy útil en la vida diaria (cocina, distancias, pesos, líquidos). El juego obliga a convertir unidades antes de comparar, lo que consolida la comprensión del Sistema Métrico Decimal y la idea de que cada escalón multiplica o divide por diez. Desarrolla competencia matemática, razonamiento numérico y atención al valor de cada unidad. La ayuda visual de la escalera de unidades hace tangible una idea abstracta, y el modo examen aporta una nota clara sobre diez y puntos para el ranking, lo que motiva a mejorar. Al subir de curso, los problemas incorporan más unidades, valores más grandes y medidas combinadas, asegurando un reto ajustado a cada nivel.

**¿Cómo funciona?** El alumnado elige una ficha (por ejemplo, Longitud: Comparar) y empieza a jugar. La dificultad se ajusta sola según el curso. En Práctica puede activar una ayuda con la escalera de unidades y resolver problemas sin límite, recibiendo confeti y mensajes al acertar. En Examen resuelve diez preguntas cronometradas, sin ayudas; al terminar ve su nota sobre diez, los aciertos, los puntos conseguidos y un repaso de cada pregunta. Cuanto más rápido se responde correctamente, más puntos para el ranking.

**Cómo se juega.**
1. Elige una de las seis fichas según la magnitud (longitud, masa o capacidad) y la tarea (comparar u ordenar).
2. Pulsa para empezar; entrarás directamente en el juego con la dificultad de tu curso.
3. En modo Comparar, lee las dos medidas y pulsa el signo correcto: menor que (<), igual (=) o mayor que (>).
4. En modo Ordenar, usa los botones ⇄ entre las tarjetas para intercambiarlas hasta dejarlas de menor a mayor.
5. Pulsa Comprobar para ver si tu respuesta es correcta; en práctica puedes pasar a otro problema con Siguiente.
6. En Práctica, activa el interruptor de Ayuda para ver la escalera de unidades y entender cómo se multiplica por 10 cada escalón.
7. Cuando estés preparado, pulsa Examen para hacer las diez preguntas cronometradas sin ayudas.
8. Al terminar el examen, revisa tu nota sobre diez, los puntos y el repaso de cada pregunta, y repite si quieres mejorar.

**Modos.**
- **Práctica**: Problemas ilimitados con confeti al acertar y la opción de activar la escalera de unidades como ayuda. No cuenta para la nota.
- **Examen**: Diez preguntas cronometradas y sin ayudas. Da una nota de 0 a 10 y puntos para el ranking; cuenta para las tareas.
- **Comparar**: Decidir si la primera medida es mayor, menor o igual que la segunda usando los signos <, = o >.
- **Ordenar**: Colocar entre 3 y 5 medidas de menor a mayor intercambiando posiciones con los botones de flecha.

**Consejos.**
- Antes de comparar, convierte mentalmente las dos medidas a la misma unidad: así verás clara cuál es mayor.
- En práctica, activa la ayuda de la escalera y fíjate en que cada paso multiplica o divide por 10.
- En el examen, busca el equilibrio entre rapidez y acierto: responder bien y rápido suma más puntos, pero fallar no da ninguno.
- Empieza por modo Comparar para coger soltura y pasa después a Ordenar, que exige pensar en toda la secuencia.

---

## ➕ Sumas `(sumas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Familia de seis fichas (1º a 6º de Primaria) que reproducen la suma en columna "como en el cole": el alumno arrastra o pulsa cifras de una paleta 0-9 para rellenar las casillas de resultado y de llevadas. Todas comparten dos piezas reutilizables (UniversalSumBoard como tablero y MathOperationLayout/SumasLayout como envoltorio de UI, modos y tracking) y solo se diferencian en la lógica de generación de operandos de cada componente por curso.

**Software.** Arquitectura por composición: cada curso es un componente propio (src/apps/sumas/primaria-N/SumasPrimariaN.jsx) que aporta su generador de operandos y su cálculo de solución/llevadas, y delega TODA la UI en dos compartidos. UniversalSumBoard.jsx (src/apps/_shared) calcula con buildColumnPlan() el plan de columnas (ancho de enteros, posición de la coma, índices de dígitos saltando la coma) y pinta el tablero: caja de llevada por columna, filas de operandos, línea de operación y caja de resultado o coma. Soporta entrada por arrastre HTML5 nativo (draggable + dataTransfer, validando con /^\d$/) y por clic (selección de casilla activa + paleta). getValidationClass() colorea verde/rojo al comprobar, con lógica especial para ceros a la izquierda vacíos (firstNonZeroIdx) y llevadas vacías=0. SumasLayout.jsx es un fino re-export que traduce la API legacy a MathOperationLayout.jsx, donde vive el grueso de la lógica transversal: header con InstructionsModal/InstructionsButton, selector Práctica Libre/Examen, toggle opcional 'Ayuda con llevadas', barra de progreso, paleta numérica y pantalla de resultados. Estado: hooks de React (useState/useCallback/useEffect), sin store global ni Supabase directo; los operandos se generan en cliente con Math.random. Puntuación de examen (en MathOperationLayout): 200 pts/acierto + bonus de velocidad de 5 pts por segundo ahorrado bajo un presupuesto de 30 s/pregunta (cronómetro con startTimeRef/finalElapsed); maxScore = total·200 + presupuesto·5. La nota /10 se calcula como Math.min(10, round(aciertos/total·100)/10) y se muestra prominente y coloreada (>=8 verde, >=5 azul, <5 rojo) con mensajes Excelente/Muy bien/Aprobado/Necesitas repasar, conforme al estándar de CLAUDE.md. Librerías: canvas-confetti (celebración al acertar en práctica), React; no usa framer-motion, three/r3f, lucide ni TTS. Anti-doble-disparo: trackedRef (useRef) que solo dispara onGameComplete una vez por examen y se resetea al salir de resultados; el comprobante por componente usa checkInfo/show para evitar revalidaciones.

**Jugabilidad.** Bucle: al montar se genera automáticamente un ejercicio de práctica (useEffect→startPractice). El alumno rellena el resultado de derecha a izquierda (la casilla de unidades queda activa por defecto y hay auto-avance hacia la izquierda al colocar cada cifra). En los cursos con llevadas, al colocar una cifra correcta de resultado se autocompleta la llevada de la columna a la izquierda si el toggle 'Ayuda con llevadas' está activo (visto en P5). Controles: arrastrar tiles 0-9 a las casillas, o pulsar casilla (se resalta azul) y luego un número de la paleta; ambos compatibles con ratón y táctil. En Práctica Libre el botón Comprobar pinta casillas en verde/rojo y, si todo es correcto (resultado y, si procede, llevadas), muestra feedback de éxito y lanza confeti (100 partículas); 'Nueva Suma' genera otro ejercicio. El examen presenta 5 preguntas con barra de progreso, botón Siguiente/Finalizar y una pantalla final con nota /10, desglose de puntos (aciertos + bonus de velocidad) y revisión pregunta a pregunta. No hay vidas ni derrota: la condición de éxito es resolver correctamente; el examen siempre termina y reporta resultado.

**Educativo.** Objetivo pedagógico: dominar el algoritmo estándar de la suma en columna (alineación por valor posicional, suma columna a columna, gestión de llevadas y, en cursos altos, alineación por la coma decimal). Destrezas: sentido del valor posicional, automatización del cálculo, control de la llevada y precisión. Encaje curricular: bloque de Números y Operaciones de Matemáticas en Educación Primaria. Progresión por curso real en el código: 1º sin llevadas (dos cifras, fuerza ausencia de llevada en unidades y decenas); 2º con llevadas (dos cifras); 3º tres y cuatro cifras; 4º sumas triples (tres sumandos de 3-4 cifras, soporta llevadas >1); 5º con decimales (2-3 cifras enteras y 0-2 decimales, alineando por la coma); 6º triples con decimales. La curva está bien graduada y aísla una sola dificultad nueva por nivel.

**Datos.** No usa gameDataService ni getAppContent ni Supabase para el contenido: cada componente genera sus propios operandos en cliente con Math.random dentro de su generateOperands/generateExercise, aplicando las restricciones del curso (rango de cifras, presencia/ausencia de llevadas, número de decimales, número de sumandos). La solución y las llevadas esperadas se calculan localmente en calculateSolution. Lo único que sale del componente es el resultado de la sesión vía onGameComplete.

**Integración.** Modos: Práctica Libre (no puntúa para tareas) y Examen (mode:'test', 5 preguntas), con selector previo en el header (no tabs durante la partida), conforme al estándar. Algunos cursos (p. ej. 5º) añaden el toggle 'Ayuda con llevadas'. No es single_mode ni tiene componente de duelo. Tracking: onGameComplete se invoca UNA vez desde MathOperationLayout al mostrar resultados del examen (protegido por trackedRef y condicionado a finalElapsed>0), enviando mode/score/maxScore/correctAnswers/totalQuestions/durationSeconds; AppRunnerPage + useGameTracker se encargan de XP, insignias, avatares y ranking (multiplicador de curso → track_student_session → upsert_high_score). La nota /10 se deja calcular por defecto (aciertos/total·10). Particularidades para mejoras: el componente mantiene su propio cómputo de score (hits·200) que NO se usa para el ranking —el score real lo recalcula MathOperationLayout con bonus de velocidad—, de modo que el setScore interno es prácticamente vestigial; el tracking solo dispara si finalElapsed>0, así que un examen instantáneo (0 s) podría no reportarse; y la entrada por arrastre depende de la API drag-and-drop nativa, menos fiable en algunos navegadores táctiles.

**Ideas de mejora.**
- Añadir feedback de audio/voz (TTS) leyendo el resultado y refuerzo accesible, dado que hoy solo hay confeti visual; ayudaría a alumnado con dificultades lectoras o visuales.
- Eliminar el cálculo de score vestigial de cada componente (hits·200/setScore no se usa para ranking) y centralizar toda la puntuación en MathOperationLayout para reducir duplicación y posibles desajustes.
- Hacer configurable el número de preguntas del examen (hoy fijo en 5) y dar realimentación inmediata por dígito en examen, además de blindar el reporte cuando el tiempo transcurrido sea 0 s.
- Mejorar la experiencia táctil sustituyendo o complementando el drag-and-drop HTML5 nativo por pointer events, y considerar un modo duelo 1 vs 1 reutilizando el patrón de duelos de la plataforma.

### Ficha de usuario

**¿Qué es?** Sumas es una colección de actividades para aprender a sumar "como en el cole", colocando las cifras en columnas igual que en el cuaderno. El alumno arrastra o pulsa números del 0 al 9 para rellenar las casillas del resultado y, cuando toca, las casillas de las llevadas. Hay una ficha distinta para cada curso de Primaria, desde sumas sencillas de dos cifras hasta sumas de varios sumandos con decimales, de modo que la dificultad va creciendo a la vez que el alumno.

**¿Por qué es relevante?** Sumar en columna es una de las primeras grandes destrezas de cálculo de Primaria, y esta app la entrena de forma activa: el alumno no ve la cuenta resuelta, la construye él, cifra a cifra, respetando el orden de las unidades, decenas y centenas. Eso refuerza el sentido del valor posicional y la comprensión de la llevada, no solo la memoria. La práctica libre permite equivocarse sin presión, ver las casillas en verde o rojo y volver a intentarlo, mientras que el modo examen consolida lo aprendido y deja constancia para el profesor. La progresión por cursos introduce una única dificultad nueva cada vez (primero las llevadas, luego más cifras, luego varios sumandos, finalmente los decimales), lo que evita saltos bruscos y ayuda a automatizar el algoritmo con confianza.

**¿Cómo funciona?** Al abrir la actividad aparece una suma planteada en columnas. El alumno elige las cifras de una paleta inferior, arrastrándolas a las casillas o pulsando primero la casilla y luego el número. La cuenta se rellena de derecha a izquierda y, en los cursos con llevadas, una ayuda opcional puede ir marcándolas. En Práctica Libre se pulsa Comprobar para ver los aciertos y errores resaltados y celebrar con confeti las sumas correctas; en el modo Examen se resuelven cinco sumas seguidas y se obtiene una nota sobre 10 con su puntuación.

**Cómo se juega.**
1. Elige el modo: "Práctica Libre" para entrenar sin nota o "Iniciar Examen" para que cuente.
2. Observa la suma colocada en columnas y empieza por la casilla de las unidades (la de más a la derecha, que aparece resaltada).
3. Arrastra el número correcto desde la paleta de abajo, o pulsa la casilla y luego el número.
4. Continúa hacia la izquierda; la siguiente casilla se selecciona sola al colocar cada cifra.
5. Si tu curso usa llevadas, coloca también la cifra que te llevas en la casilla pequeña de arriba (puedes activar la ayuda).
6. En Práctica Libre, pulsa "Comprobar" para ver en verde lo correcto y en rojo lo que hay que repasar.
7. Corrige las casillas en rojo volviendo a pulsarlas y poniendo el número adecuado.
8. Pulsa "Nueva Suma" para practicar otra, o en el examen pulsa "Siguiente" hasta "Finalizar" y consulta tu nota.

**Modos.**
- **Práctica Libre**: Sumas ilimitadas con comprobación al instante (casillas en verde y rojo) y confeti al acertar. No cuenta para la nota; ideal para entrenar.
- **Examen**: Cinco sumas seguidas con barra de progreso; al final muestra la nota sobre 10, la puntuación con bonus por rapidez y la revisión de cada pregunta. Cuenta para la tarea.

**Consejos.**
- Empieza siempre por las unidades y avanza hacia la izquierda, como en el cuaderno.
- Si te equivocas, vuelve a pulsar la casilla en rojo y coloca el número correcto; no hace falta borrar todo.
- En las sumas con llevadas, activa la "Ayuda con llevadas" hasta que cojas soltura y luego prueba a hacerlas sin ayuda.
- En el examen, ir rápido suma puntos extra, pero asegúrate primero de acertar: la nota se basa en los aciertos.

---

## ➖ Restas `(restas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Familia de seis fichas (restas-primaria-1 a 6) que reproducen la resta en columna 'como en el cole' con casillas de resultado, cajas de llevadas (préstamos) y operandos decimales, todas montadas sobre el layout compartido MathOperationLayout. El contenido es 100% generado en cliente con Math.random; no usa gameDataService ni Supabase para el contenido.

**Software.** Cada curso es un componente React propio (RestasPrimaria1..6.jsx) con estado local vía useState/useMemo/useCallback. Importan canvas-confetti y el CSS compartido (Restas.css / MathBoxShared.css). El armazón común es src/apps/_shared/MathOperationLayout.jsx (header, selector de modo, toggle de ayuda, paleta numérica 0-9 con drag&drop y click, modal de instrucciones vía InstructionsModal). Variantes 2 y 5 dibujan su propia rejilla CSS Grid inline (filas minuendo/sustraendo/línea/resultado + círculos de llevada con borde discontinuo); la 1 reutiliza UniversalSubtractionBoard.jsx (que a su vez reutiliza buildColumnPlan de UniversalSumBoard.js) y SumasLayout; el examen de 5 y 6 usa OperationTestBoard.jsx (formato 'N1 − N2 =' con casillas de solución). Estado clave: operands/structure, resultSlots[], carrySlots[], activeSlot {type,index}, showHelp, y el bloque de test (testQuestions, userAnswers, currentQuestionIndex, score, showResults). Lógica de préstamo: expectedCarries se calcula en useMemo recorriendo dígitos de derecha a izquierda; getVisualSubtrahendDigit incrementa visualmente el dígito del sustraendo (+1)%10 cuando el alumno marca llevada a su derecha. Decimales (4,5,6): se trabaja en enteros multiplicando por factor=10^decimales para evitar errores de coma flotante (Math.round(num*factor)). La PUNTUACIÓN y la NOTA /10 las centraliza MathOperationLayout: 200 pts por acierto + bonus de velocidad (5 pts por segundo ahorrado sobre presupuesto de 30s/pregunta), nota = min(10, round(hits/total*100)/10) con color (>=8 verde, >=5 azul, <5 rojo) y mensajes Excelente/Muy bien/Aprobado/Necesitas repasar. Anti-doble-disparo: trackedRef (useRef) en el layout garantiza un único onGameComplete por examen; startTimeRef cronometra; finalElapsed se captura al mostrar resultados. Cada componente además mantiene su propio state.score (hits*200) sin bonus, redundante con el cálculo del layout.

**Jugabilidad.** Práctica libre: se genera una resta nueva, el alumno selecciona una casilla (resultado o círculo de llevada) y la rellena pulsando o arrastrando un número de la paleta; al rellenar bien una cifra de resultado con la ayuda activa, la llevada de esa columna se autocompleta. Botón Comprobar pinta verde/rojo cada dígito y, con ayuda activa, también valida las llevadas (mensaje específico si el resultado está bien pero las llevadas mal); acierto total lanza confetti. Botón Nueva Resta regenera. Toggle 'Ayuda con llevadas' muestra u oculta los círculos de préstamo. Examen: 5 preguntas, barra de progreso, casillas dígito a dígito en OperationTestBoard, botón Siguiente/Finalizar; pantalla de resultados con nota /10, desglose de puntos y revisión pregunta a pregunta. No hay vidas ni temporizador visible de derrota; el único límite es el cronómetro interno para el bonus. Controles: ratón/táctil (click) y drag&drop; no hay control por teclado.

**Educativo.** Entrena el algoritmo estándar de la resta en columna con alineación posicional, el concepto de llevada/préstamo y el trabajo con decimales y la coma. La progresión por curso es explícita: 1º sin llevadas 2 cifras; 2º con llevadas 2 cifras; 3º llevadas de 3-4 cifras; 4º introducción al decimal; 5º restas con decimales (2-3 enteros + decimales); 6º 'a completar', donde se oculta minuendo o sustraendo y el alumno deduce la cifra que falta (razonamiento inverso). Encaja en Matemáticas de Primaria 1º-6º (sentido numérico y operaciones). Refuerza valor posicional, cálculo, autocorrección y, en 6º, pensamiento algebraico incipiente.

**Datos.** No usa gameDataService.getRoscoData ni getAppContent: todos los problemas se generan en el propio componente con Math.random respetando rangos por curso (cifras enteras, posiciones decimales, garantía minuendo>=sustraendo, evitar n1===n2). Por tanto el contenido es procedimental e infinito, sin tabla de Supabase asociada al ejercicio.

**Integración.** Modos: 'Práctica Libre' (no nota) e 'Iniciar Examen' (mode:'test', 5 preguntas, sí nota → tarea), seleccionables en pantalla previa vía el selector de MathOperationLayout. No es single_mode, no tiene duelo (no está en duelableApps; el examen usa enteros, no la mecánica visual de columnas con llevadas/decimales). Tracking: el componente pasa onGameComplete al layout, que lo dispara UNA vez con {mode:'test', score (con bonus velocidad), maxScore, correctAnswers, totalQuestions, durationSeconds}; AppRunnerPage lo enlaza a useGameTracker (startSession/trackGameSession) y de ahí a XP, insignias, avatares y ranking con multiplicador de curso. Registro: commonApps.js (6 defs lazy), primariaApps.js (1 por curso). Particularidades para mejoras: (1) la práctica libre nunca llama onGameComplete, así que esas partidas no generan tracking; (2) el examen abandona la rica mecánica visual de columnas y solo pide el resultado entero en casillas, desligado de las llevadas/decimales practicados; (3) cada componente mantiene un state.score paralelo redundante con el cálculo real del layout; (4) sin control por teclado.

**Ideas de mejora.**
- Unificar las seis variantes en un único componente parametrizado (rango de cifras, decimales, modo 'a completar') sobre UniversalSubtractionBoard para eliminar la duplicación masiva de lógica de generación, llevadas y test entre RestasPrimaria1..6.
- Hacer que el examen conserve la mecánica de columna con llevadas y decimales (en vez de pedir solo el resultado entero en OperationTestBoard) para que evalúe lo que realmente se ha practicado, incluyendo decimales en 4º-6º.
- Añadir control por teclado (números 0-9, flechas para cambiar de casilla, Enter para comprobar) y soporte de lectura por voz (TTS) del enunciado para accesibilidad.
- Registrar también la práctica libre como sesión ligera (o un mini-resumen de aciertos) para alimentar progreso/insignias sin penalizar, y mostrar racha de restas correctas seguidas.

### Ficha de usuario

**¿Qué es?** Restas es una colección de fichas para aprender a restar en columna, tal como se hace en el cuaderno del cole. En pantalla aparece la resta con el número de arriba, el de abajo y las casillas vacías del resultado, además de los pequeños círculos para anotar las llevadas (los préstamos). El alumnado completa cada cifra colocando números de una paleta, comprueba su trabajo y recibe una corrección inmediata, con celebración incluida cuando acierta toda la operación.

**¿Por qué es relevante?** La resta con llevadas es uno de los aprendizajes que más cuesta consolidar en Primaria, porque exige entender el valor posicional y el préstamo entre columnas, no solo memorizar. Esta app trabaja exactamente ese punto: hace visible la llevada con un círculo y muestra cómo cambia el dígito de abajo, conectando el gesto mecánico con el porqué. Al corregir cifra a cifra en colores, el alumno detecta dónde falla y reflexiona, en lugar de recibir solo un 'bien o mal'. Desarrolla sentido numérico, cálculo, atención y autocorrección. La variante de 6º, donde hay que descubrir el número que falta, añade razonamiento inverso, una primera puerta al pensamiento algebraico. Y como cada resta se genera al azar, la práctica es prácticamente infinita y siempre distinta.

**¿Cómo funciona?** Hay una ficha por curso, de 1º a 6º, con dificultad creciente: empieza con restas sencillas sin llevadas y avanza hasta restas con decimales y restas 'a completar'. En Práctica Libre se resuelven restas una tras otra con ayuda opcional de llevadas y corrección al instante. En el modo Examen se plantean cinco restas seguidas, sin tanta ayuda, y al final se obtiene una nota sobre 10 con bonus por rapidez y un repaso de cada respuesta. Esa nota cuenta para las tareas del alumno.

**Cómo se juega.**
1. Elige el modo: 'Práctica Libre' para entrenar o 'Iniciar Examen' para que cuente la nota.
2. Activa o desactiva el interruptor 'Ayuda con llevadas' según necesites ver los círculos de préstamo.
3. Pulsa la casilla del resultado que quieras rellenar (empezando por la derecha) para seleccionarla.
4. Toca un número de la paleta de abajo o arrástralo hasta la casilla para colocarlo.
5. Si hay llevada, anótala pulsando el círculo correspondiente y eligiendo el número.
6. Cuando tengas toda la resta, pulsa 'Comprobar': verás en verde los aciertos y en rojo los errores.
7. Corrige las casillas marcadas en rojo y vuelve a comprobar hasta que salga el mensaje de acierto.
8. Pulsa 'Nueva Resta' para practicar otra, o avanza con 'Siguiente' si estás en el examen.
9. Al terminar el examen, revisa tu nota sobre 10 y el repaso de cada pregunta.

**Modos.**
- **Práctica Libre**: Restas ilimitadas con corrección al instante y ayuda opcional de llevadas; no cuenta para la nota.
- **Examen**: Cinco restas seguidas con menos ayudas; al final da una nota sobre 10 con bonus por rapidez, y cuenta para las tareas.

**Consejos.**
- Empieza siempre por la columna de la derecha (las unidades) y ve avanzando hacia la izquierda.
- Si aún te lías con los préstamos, deja activada la ayuda de llevadas y fíjate en cómo cambia el número de abajo.
- En el examen no te bloquees: hay un pequeño bonus por ir rápido, pero acertar es lo que más suma.
- Cuando ya domines un curso, prueba la ficha del curso siguiente para subir de dificultad.

---

## ✖️ Multiplicaciones `(multiplicaciones)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de cálculo que reproduce la multiplicación en columna (algoritmo escrito) sobre un tablero de casillas dígito a dígito, con cuatro variantes (3º a 6º de Primaria) que comparten layout y motor de examen. Cada variante es un componente React propio (MultiplicacionesPrimaria3/4/5/6.jsx) montado sobre el wrapper compartido MathOperationLayout y el tablero de examen MultiplicacionTestBoard.

**Software.** Arquitectura: cuatro componentes en src/apps/multiplicaciones/primaria-{3,4,5,6}/, cada uno con su lógica de generación y cálculo propia, todos envueltos en src/apps/_shared/MathOperationLayout.jsx (cabecera, selector Práctica/Examen, toggle 'Ayuda con llevadas', paleta numérica 0-9, feedback, instrucciones vía InstructionsModal) y reutilizando src/apps/_shared/MultiplicacionTestBoard.jsx para el examen. Estilos en _shared/Multiplicaciones.css y MathBoxShared.css. Estado: hooks locales useState/useCallback/useMemo (sin store global); el problema vive en arrays de 'digitos'/'llevadas' por columna, con estados paralelos para entradas del alumno y clases CSS ('correct'/'incorrect'/'selected'). El motor calcula los productos parciales y los acarreos columna a columna (calcularFilaProducto / calcularParciales + sumarParciales en 6º). La 'Ayuda con llevadas' autocompleta el acarreo cuando el dígito del producto es correcto y autoavanza el foco (activeSlot). La 6º añade gestión de la coma decimal (commaSlot, posición esperada = ancho - decimalesTotal) y validación de dígitos de relleno a cero. Librerías: canvas-confetti (celebración al acertar), React puro; NO usa framer-motion, three/@react-three/fiber, lucide-react ni TTS. Puntuación y nota /10: en PRÁCTICA no hay puntuación ni tracking (solo feedback + confetti). En EXAMEN la lógica vive en MathOperationLayout: 200 pts por acierto (BASE_POINTS_PER_HIT) + bonus de velocidad (SPEED_COEF=5 pts por segundo ahorrado bajo un presupuesto de 30s/pregunta · TIME_BUDGET_PER_Q), maxScore = total·200 + presupuesto·5; nota = min(10, round(hits/total·100)/10), con color (>=8 verde, >=5 azul, <5 rojo) y mensaje. Cada componente también calcula localmente score = hits·200 pero el valor que se reporta es el de MathOperationLayout (incluye bonus). Refs anti-doble-disparo: trackedRef en MathOperationLayout dispara onGameComplete una sola vez (resetea cuando showResults pasa a false) y exige finalElapsed>0; useGameTracker añade completedRef y consume el session_id tras el primer finish.

**Jugabilidad.** Bucle: el alumno elige 'Práctica Libre' o 'Iniciar Examen'. En práctica se genera una multiplicación y se rellena el tablero en columna pulsando una casilla (se resalta en azul) y luego un número de la paleta; con la ayuda activada el acarreo se autorrellena y el foco salta a la siguiente casilla (de unidades a izquierda, fila a fila en 4º/5º/6º). En 6º además hay que colocar la coma decimal pulsando su ranura. 'Comprobar' marca casillas en rojo/verde, lanza confeti si todo es correcto y muestra feedback; 'Nueva' genera otra. Controles: ratón/táctil (pulsar casilla + paleta) y arrastrar-soltar los números (draggable). No hay teclado físico para introducir cifras, ni temporizador ni vidas en práctica. Niveles: la dificultad la fija la variante (curso), no hay selector low/medium dentro de la app; el único conmutador es la ayuda con llevadas. Examen: 5 preguntas, se escribe solo el resultado final dígito a dígito en MultiplicacionTestBoard, barra de progreso, sin penalización por fallo; no hay derrota, solo nota final. Feedback: confeti (canvas-confetti) al acertar, mensajes de texto, código de color en casillas y en la nota.

**Educativo.** Objetivo pedagógico: automatizar el algoritmo de la multiplicación en columna y la comprensión del valor posicional, los productos parciales, las llevadas/acarreos y, en 6º, la colocación de la coma en el producto con decimales. Destrezas: cálculo multiplicativo, alineación por columnas, gestión de acarreos, atención y precisión, y sentido del número decimal. Encaje curricular (Primaria, área de Matemáticas, sentido de la operación): progresión 3º (multiplicador de 1 cifra sobre multiplicando de 2-3 cifras) → 4º (por 2 cifras, dos productos parciales) → 5º (por 3 cifras, tres parciales) → 6º (con decimales). Aparece en las cuatro variantes dentro de 'matematicas' de 3º a 6º de Primaria.

**Datos.** Contenido 100% autogenerado en el cliente; NO usa gameDataService ni getAppContent ni ninguna RPC de contenido. Cada componente genera operandos aleatorios con su propio generarNumero/randInt y calcula la solución (productos parciales, acarreos, suma final, coma) con funciones locales (calcularFilaProducto, calcularParciales, sumarParciales, prepararMultiplicacion). El examen genera sus pares con generarParTest (3º/4º/5º multiplicando de 2-3 cifras por 1 dígito o varias; en 6º el examen usa enteros 3×3 cifras, sin decimales, por simplicidad declarada en el código).

**Integración.** Modos: 'Práctica Libre' (sin nota, sin tracking, solo feedback+confeti) y 'Examen' (5 preguntas, mode:'test'). NO es single_mode ni está en duelableApps (no tiene componente Duel ni DuelChatBar). Tracking: solo el examen reporta vía onGameComplete (mode:'test', score con bonus de velocidad, maxScore, correctAnswers, totalQuestions, durationSeconds) desde MathOperationLayout; AppRunnerPage lo procesa con useGameTracker → track_session_finish/track_student_session, gamification_process_session (XP, insignias, avatares) y upsert_high_score (ranking con multiplicador de curso). Registrada en commonApps.js (ids multiplicaciones-primaria-3/4/5/6, lazy import) y en primariaApps.js bajo matematicas de cada curso. Particularidades para mejoras: (1) la práctica no genera ninguna sesión ni XP, todo el peso de tareas/ranking recae en el examen; (2) cada variante duplica casi toda la lógica de generación y cálculo (candidato a refactor a un motor compartido); (3) el examen de 6º no ejercita decimales pese a ser el foco de la práctica; (4) el examen mide solo el resultado final, no el proceso (parciales/llevadas) que sí valida la práctica.

**Ideas de mejora.**
- Unificar el examen de 6º para que incluya multiplicaciones con decimales (su competencia clave), reutilizando el motor de la práctica en vez de generar enteros 3×3.
- Extraer un motor común (generación + cálculo de parciales/acarreos/suma) a _shared para eliminar la duplicación entre las cuatro variantes y reducir el riesgo de divergencias.
- Permitir que la práctica registre progreso ligero (sesión completada / XP por operación resuelta) o introducir un modo intermedio puntuable, ya que hoy solo el examen cuenta para tareas y ranking.
- Añadir soporte de teclado físico para introducir cifras y navegar entre casillas (accesibilidad y velocidad), además del ratón/táctil y arrastrar.

### Ficha de usuario

**¿Qué es?** Multiplicaciones es una app de cálculo donde el alumnado resuelve multiplicaciones 'como en el cole', escribiéndolas en columna sobre un tablero de casillas. En lugar de teclear el resultado de golpe, se va colocando cada cifra en su sitio: los productos parciales, las llevadas y, en el nivel más alto, la coma de los decimales. Hay cuatro fichas, una por curso de Primaria, que van de multiplicar por una cifra hasta multiplicar números con decimales, siguiendo la misma forma de trabajar paso a paso.

**¿Por qué es relevante?** La multiplicación en columna es uno de los aprendizajes clave de Primaria y una fuente habitual de errores: olvidar una llevada, desalinear las columnas o colocar mal la coma. Esta app obliga a hacer el algoritmo de verdad, casilla a casilla, en lugar de dar solo el resultado, por lo que entrena el valor posicional, el control de los acarreos y la precisión. La corrección inmediata (cada casilla se pone verde o roja) ayuda a localizar el fallo exacto y a aprender del error, y la ayuda con llevadas sirve de andamiaje que se puede retirar. La progresión por cursos (de una cifra a varios dígitos y a decimales) consolida la técnica de forma gradual y refuerza la confianza al calcular. El modo Examen, además, mide y refleja el aprendizaje con una nota clara sobre 10.

**¿Cómo funciona?** Al entrar se elige Práctica Libre o Examen. En la práctica aparece una multiplicación en columna con casillas vacías: se pulsa una casilla, se toca el número correcto en la paleta de abajo (o se arrastra) y la operación se va completando, incluidas las llevadas y, en 6º, la coma. El botón Comprobar marca en verde y rojo y lanza confeti si está todo bien; Nueva genera otra operación. En el Examen se resuelven 5 multiplicaciones escribiendo el resultado final, con una nota sobre 10 al terminar.

**Cómo se juega.**
1. Elige 'Práctica Libre' para entrenar o 'Iniciar Examen' para que cuente.
2. Pulsa la casilla que quieras rellenar; se resaltará en azul.
3. Toca el número correcto en la paleta de abajo (o arrástralo hasta la casilla).
4. Completa los productos parciales y, si la ayuda con llevadas está activada, comprueba los acarreos que se rellenan solos.
5. En 6º, pulsa la ranura de la coma para colocar la coma decimal en el resultado.
6. Cuando lo tengas, pulsa 'Comprobar': verás cada casilla en verde o rojo y, si está perfecto, confeti.
7. Pulsa 'Nueva' para practicar con otra multiplicación.
8. En el Examen, escribe directamente el resultado final de cada una de las 5 multiplicaciones y pulsa 'Siguiente' o 'Finalizar' para ver tu nota.

**Modos.**
- **Práctica Libre**: Resuelves la multiplicación completa en columna (parciales, llevadas y coma), con ayuda opcional de llevadas y corrección casilla a casilla. No pone nota.
- **Examen**: 5 multiplicaciones en las que escribes solo el resultado final. Al acabar obtienes una nota sobre 10 y puntos extra por rapidez.

**Consejos.**
- Empieza siempre por las unidades (la columna de la derecha) y ve avanzando hacia la izquierda.
- Deja activada la 'Ayuda con llevadas' al principio y desactívala cuando ya domines los acarreos.
- En 6º, cuenta los decimales del multiplicando y del multiplicador para saber dónde va la coma del resultado.
- Si una casilla sale en rojo, fíjate solo en esa columna y revisa la llevada anterior antes de cambiar el número.

---

## ➗ Divisiones `(divisiones)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de división en caja (algoritmo estándar paso a paso) construida como tres variantes React independientes (DivisionesPrimaria4/5/6) que comparten el layout y el tablero de examen en src/apps/_shared (MathOperationLayout + OperationTestBoard). Cada variante calcula su propio plan de solución dígito a dígito y deja que el alumno rellene cociente y restos en una rejilla CSS Grid.

**Software.** Tres componentes funcionales con hooks (useState/useEffect/useCallback; el 5º y 6º también useMemo): src/apps/divisiones/primaria-4/DivisionesPrimaria4.jsx, .../primaria-5/DivisionesPrimaria5.jsx y .../primaria-6/DivisionesPrimaria6.jsx. Cada uno importa el wrapper compartido src/apps/_shared/MathOperationLayout.jsx (header, selector de modo, paleta numérica 0-9, feedback, instrucciones via InstructionsModal y pantalla de resultados del examen) y src/apps/_shared/OperationTestBoard.jsx (tablero N1 ÷ N2 = ___ del examen). Estilos en src/apps/_shared/Divisiones.css y MathBoxShared.css. Librería externa: canvas-confetti (única dependencia de animación; NO usan framer-motion, three/r3f ni TTS). Estado por componente: operands, steps (plan de solución), userInputs/quotientSlots/remainderSlots, activeSlot, feedback, más el bloque de estado de examen (testQuestions, currentQuestionIndex, userAnswers, testResultSlots, testActiveIdx, showResults). La lógica del algoritmo es propia de cada variante: P4 usa calculateDivisionSteps (cociente + resto por paso, dividendo de 2-3 cifras, divisor 2-9); P5 calculateSolutionPlan con divisores de 2-3 cifras y restos multi-dígito alineados por columna en la rejilla; P6 amplía el plan para gestionar la coma decimal (calcula expectedCommaIndex y una ranura de coma clicable en el cociente). Puntuación y nota /10: las gestiona MathOperationLayout en el examen, no el componente hijo. BASE_POINTS_PER_HIT=200 por acierto + bonus de velocidad (SPEED_COEF=5 pts/segundo ahorrado sobre un presupuesto de 30s/pregunta). La nota se calcula testNota = min(10, round((aciertos/total)*100)/10) y se pinta con color (>=8 verde, >=5 azul, <5 rojo) y mensaje (Excelente/Muy bien/Aprobado/Necesitas repasar). Ojo: el componente hijo también mantiene un estado score = hits*200 propio, pero es vestigial: el score real que va al tracking lo recalcula el layout con bonus de velocidad. Ref anti-doble-disparo: trackedRef en MathOperationLayout protege la llamada a onGameComplete (se arma al mostrar resultados con finalElapsed>0 y se rearma al salir de resultados). startTimeRef cronometra el examen.

**Jugabilidad.** Práctica libre: se genera una división aleatoria y el alumno la resuelve en caja, paso a paso, sobre una rejilla. Selecciona una casilla (cociente o resto) pulsándola y coloca el dígito con la paleta numérica inferior (clic o drag&drop; los tiles son draggable). El foco avanza automáticamente en orden canónico del algoritmo (primero la cifra del cociente, luego los dígitos del resto, luego baja la siguiente cifra). El toggle 'Mostrar ayudas' resalta en color los operandos activos del paso actual y muestra una flecha ↓ al bajar cifras; P5 y P6 añaden un toggle 'Ayudas extra' que despliega la tabla de multiplicar del divisor. En P6 hay además ranuras de coma clicables para colocar la coma decimal en el cociente. El botón Comprobar valida todas las casillas (y la coma en P6): si todo es correcto lanza confeti y mensaje de éxito; si no, pinta en rojo las casillas erróneas. 'Nueva' genera otro problema. No hay vidas ni temporizador en la práctica. Modo Examen: 5 preguntas (TOTAL_TEST_QUESTIONS=5), tablero simplificado donde solo se escribe el cociente entero dígito a dígito (de derecha a izquierda); cronómetro activo para el bonus de velocidad. Controles 100% ratón/táctil (no hay manejo de teclado físico).

**Educativo.** Objetivo pedagógico: automatizar el algoritmo estándar de la división (división en caja) con andamiaje visual. Destrezas: estimación del cociente, dominio de las tablas de multiplicar (de hecho ofrece la tabla del divisor como ayuda), cálculo de restos parciales, valor posicional y, en 6º, colocación de la coma decimal. La progresión entre variantes es curricular: P4 = iniciación con divisor de una cifra (2-9) y dividendos de 2-3 cifras; P5 = divisores de 2 y 3 cifras con dividendos grandes (hasta 150000) y restos multi-dígito; P6 = división con decimales en el dividendo y manejo de la coma en el cociente. Encaje: bloque de Sentido numérico / operaciones de Matemáticas de Educación Primaria. Registradas solo en la asignatura 'matematicas' de 4º (appDivisionesPrimaria4), 5º (appDivisionesPrimaria5) y 6º (appDivisionesPrimaria6) en src/apps/config/primariaApps.js.

**Datos.** Sin fuente externa de contenido: NO usan gameDataService.js ni getAppContent. Cada componente genera los problemas de forma procedural con Math.random en generateNewProblem (práctica) y generarParTest (examen), y deriva el plan de solución con sus propias funciones (calculateDivisionSteps en P4, calculateSolutionPlan en P5/P6). El contenido es por tanto infinito y autocontenido, parametrizado por rangos de divisor/dividendo distintos en cada curso.

**Integración.** Modos: 'Práctica Libre' (sin nota, ayudas y confeti) e 'Iniciar Examen' (mode:'test', 5 preguntas, sí cuenta para tareas), seleccionados en pantalla previa via el selector de MathOperationLayout. No es single_mode, no tiene duelo 1 vs 1 (no aparece en duelableApps.js) y no usa InstructionsButton extra ni material de estudio. Tracking: el componente recibe onGameComplete (inyectado por AppRunnerPage) y lo pasa al layout; el layout dispara onGameComplete una sola vez al mostrar resultados del examen con mode:'test', score (base 200/acierto + bonus velocidad), maxScore, correctAnswers, totalQuestions y durationSeconds. A partir de ahí AppRunnerPage/useGameTracker registran la sesión, aplican multiplicador de curso y alimentan ranking (high_scores) + XP + insignias + avatares. Particularidades a tener en cuenta: (1) la práctica libre NO emite onGameComplete, así que no genera sesiones ni XP; solo el examen puntúa. (2) El examen valida únicamente el cociente entero (la parte entera de a/b), ignorando resto y, en P6, los decimales: la riqueza didáctica del modo práctica (restos, coma) no se evalúa. (3) El estado 'score' interno de cada componente es muerto (lo recalcula el layout). (4) Solo ratón/táctil: sin atajos de teclado para introducir dígitos.

**Ideas de mejora.**
- Hacer que el modo examen evalúe la división completa (cociente + resto, y la coma decimal en 6º) reutilizando la rejilla en caja en lugar de pedir solo el cociente entero, para que la nota refleje la destreza real que se practica.
- Añadir entrada por teclado físico (números 0-9, flechas para mover el foco, Enter para comprobar) además del clic/drag, mejorando accesibilidad y velocidad en sobremesa.
- Emitir onGameComplete también en práctica libre (mode:'practice') o introducir niveles easy/medium como define el estándar de la plataforma, para que el entrenamiento sin examen otorgue algo de progreso y tracking.
- Unificar las tres variantes en un único componente parametrizado por nivel (divisor/dividendo/decimales) para eliminar la duplicación de calculateSolutionPlan y reducir el riesgo de divergencia de bugs entre P4/P5/P6.

### Ficha de usuario

**¿Qué es?** Divisiones es una app para aprender a dividir 'en caja', es decir, con el método de la cuadrícula que se enseña en el colegio. El alumnado resuelve divisiones paso a paso sobre una rejilla: va colocando cada cifra del cociente y cada resto parcial con un teclado numérico en pantalla. Hay tres versiones según el curso, desde la iniciación con divisores de una cifra hasta las divisiones con decimales. Incluye ayudas visuales que guían cada paso y una tabla de multiplicar del divisor para apoyarse.

**¿Por qué es relevante?** La división es una de las operaciones que más cuesta automatizar en Primaria porque encadena varias destrezas a la vez: estimar el cociente, dominar las tablas de multiplicar, restar y respetar el valor posicional. Esta app desarrolla precisamente esas competencias matemáticas (sentido numérico y cálculo) practicando el algoritmo completo, no solo el resultado final. Funciona pedagógicamente porque ofrece andamiaje gradual: resalta en color la cifra con la que toca trabajar, muestra flechas al bajar números y permite consultar la tabla del divisor, de modo que el alumno entiende el porqué de cada paso. La corrección inmediata (casillas en rojo donde hay error, confeti al acertar) y la progresión por cursos consolidan la técnica sin frustración, y el modo examen permite comprobar lo aprendido con una nota objetiva.

**¿Cómo funciona?** Al entrar se genera automáticamente una división. El alumno toca una casilla vacía para seleccionarla y pulsa un número del teclado de la pantalla para colocarlo (también puede arrastrarlo). El programa va guiando el orden: primero la cifra del cociente, luego el resto, y después baja la siguiente cifra. Cuando termina, pulsa 'Comprobar' y la app marca en verde lo correcto y en rojo lo que hay que revisar. Con 'Nueva' aparece otra división. En modo examen resuelve 5 divisiones y obtiene una nota sobre 10.

**Cómo se juega.**
1. Elige el modo: 'Práctica Libre' para entrenar sin nota o 'Iniciar Examen' para que cuente.
2. Si quieres ayuda, activa el interruptor 'Mostrar ayudas' (resalta los números del paso actual) y, en 5º y 6º, 'Ayudas extra' para ver la tabla de multiplicar del divisor.
3. Toca la casilla del cociente que está marcada para seleccionarla.
4. Pulsa en el teclado numérico el dígito correcto (o arrástralo hasta la casilla).
5. Continúa con las casillas del resto en el orden que te va indicando la app y baja la siguiente cifra.
6. En 6º, pulsa la ranura de la coma del cociente para colocar la coma decimal cuando corresponda.
7. Cuando hayas rellenado toda la división, pulsa 'Comprobar': lo correcto se pone en verde y lo erróneo en rojo.
8. Pulsa 'Nueva' para practicar con otra división distinta.
9. En el examen, escribe solo el cociente de cada una de las 5 divisiones y, al terminar, consulta tu nota sobre 10.

**Modos.**
- **Práctica Libre**: Divisiones ilimitadas sin nota, con ayudas visuales, tabla del divisor y confeti al acertar. Ideal para entrenar el algoritmo.
- **Examen**: 5 divisiones en las que se escribe el cociente. Da una nota sobre 10 y suma puntos extra por rapidez; cuenta para las tareas del curso.

**Consejos.**
- Empieza siempre en Práctica Libre con las ayudas activadas y, cuando te sientas seguro, apágalas para comprobar si dominas el algoritmo tú solo.
- Apóyate en la tabla de multiplicar del divisor (en 5º y 6º) para estimar mejor cada cifra del cociente y cometer menos errores.
- En el examen no te precipites, pero recuerda que resolver con agilidad suma puntos extra por velocidad en el ranking.
- En 6º, fíjate bien en dónde va la coma del cociente: colocarla mal es el fallo más habitual con decimales.

---

## 🛒 Supermercado Matemático `(supermercado-matematico)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Familia de seis apps (una ficha por curso de Primaria, supermercado-matematico-1 a -6) que plantean problemas aritméticos contextualizados en la compra. Todas comparten el mismo motor: un hook React (useSupermercadoGame) y una pantalla de examen común (TestScreen). Cada variante aporta solo su catálogo de productos hardcodeado y su función generarNuevaMision, que define la dificultad y el tipo de operación.

**Software.** Arquitectura de 'cáscara fina + motor compartido'. Cada componente de curso (src/apps/supermercado-matematico/primaria-N/SupermercadoMatematicoN.jsx) es prácticamente idéntico: define un array local 'productos' [{nombre, emoji, precio}] y una función 'generarNuevaMision()' que devuelve {texto, solucion}, y delega toda la lógica en el hook 'src/hooks/useSupermercadoGame.js'. El hook gestiona el estado con useState (isTestMode, testQuestions, currentQuestionIndex, userAnswers, mision, respuesta, feedback, startTime, elapsedTime, score, showResults) y un useRef (containerRef) para anclar el confeti. El examen vive en el componente compartido 'src/apps/_shared/TestScreen.jsx'. Estilos en 'src/apps/_shared/SupermercadoShared.css'. Librería externa: canvas-confetti (importada en el hook; se dispara desde el centro del contenedor de la misión calculando origin x/y con getBoundingClientRect). NO usa framer-motion, three/@react-three/fiber, lucide-react ni TTS. PUNTUACIÓN (examen): el test son siempre 5 preguntas (TOTAL_TEST_QUESTIONS=5). calculateScore = correctas*200 (baseScore) + bono por tiempo escalado por aciertos: fastBonus=max(0,200-time*10), longBonus=max(0,100-floor(time/2)), timeBonus=round((fastBonus+longBonus)*(correctas/5)). maxScore reportado = 5*200 = 1000. La comparación de respuestas normaliza coma->punto (parseFloat(replace(',','.'))) y tolera Math.abs(dif)<0.001. NOTA /10: calculada en TestScreen como Math.round((correctas/5)*100)/10, con color (>=8 excellent, >=5 good, <5 fail) y mensaje (>=9 Excelente, >=7 Muy bien, >=5 Aprobado, <5 Necesitas repasar); cumple la guía de la sección 3.1. ANTI-DOBLE-DISPARO: TestScreen usa un useRef 'trackedRef' que se pone a true al entrar en showResults y solo entonces llama a onGameComplete una vez; se resetea a false cuando deja de mostrar resultados. El cronómetro (setInterval cada 1s) corre siempre en examen aunque withTimer controle si se muestra el reloj en el header.

**Jugabilidad.** Dos modos en una sola pantalla con botones 'Práctica Libre' / 'Iniciar examen' (no es la pantalla de selección previa estándar de la plataforma). PRÁCTICA: se muestra el panel de productos con precios, una 'misión' textual ('Compra: 1 Leche y 1 Pan', etc.), un input numérico/texto y un botón 'Comprobar'; si aciertas, feedback verde '¡Correcto!' + confeti; si fallas, feedback rojo que revela la solución correcta y anima a reintentar (sin penalización ni vidas). Botón '¡Otra Misión!' genera un problema nuevo. EXAMEN: secuencia fija de 5 preguntas con barra de progreso y contador 'Pregunta X/5'; input de texto con autoFocus, avance con botón 'Siguiente'/'Finalizar' o tecla Enter; al terminar muestra resumen con nota/10, puntos, aciertos, tiempo total y revisión pregunta a pregunta (tu respuesta vs correcta), con botones 'Volver a intentar' y 'Modo Práctica'. Controles: ratón + teclado (Enter en examen) + táctil. No hay condición de derrota; la 'victoria' es completar el examen, la nota refleja los aciertos. Feedback: confeti (solo en práctica), colores de feedback y mensajes; sin sonido.

**Educativo.** Objetivo pedagógico: trabajar el cálculo aritmético dentro de un contexto funcional y cotidiano (la compra), uno de los anclajes clásicos de la competencia matemática y de la educación financiera básica. Destrezas por curso, con progresión real codificada en generarNuevaMision: 1º suma de 2 productos con precios enteros (tope 10€); 2º suma con cantidades y precios mayores 'con llevadas' (tope 20€); 3º multiplicación (cantidad x precio unitario); 4º suma de 2 productos con precios decimales (céntimos); 5º mezcla ponderada de suma (40%), cálculo del cambio respecto a un billete (40%) y descuento simple 10/50% (20%); 6º problemas compuestos (descuento + cambio, o suma de dos productos + cupón de descuento 10/20/25/50%). Encaje curricular: Primaria, asignatura 'matematicas', una variante por cada grado de 1º a 6º (registrada como appSupermercadoMatematico1..6 en primariaApps.js). Entrena lectura comprensiva de enunciados, identificación de la operación adecuada y manejo del euro/decimales.

**Datos.** Contenido 100% autocontenido en el propio componente: NO usa gameDataService.js, getAppContent ni ninguna RPC de contenido (grep confirma cero coincidencias en la carpeta). Cada variante define su array local 'productos' (6-10 ítems con nombre, emoji y precio) y genera los problemas de forma procedural y aleatoria en 'generarNuevaMision()' con Math.random (mezcla de productos, cantidades, billetes y descuentos). Implicación: el contenido no es editable desde BD ni por el docente; cualquier ajuste de dificultad o de catálogo requiere tocar el código de cada variante.

**Integración.** Modos: solo 'práctica' (no trackeada) y 'examen' (mode:'test'); NO implementa los tres niveles easy/medium/exam de la guía, no es single_mode, y no soporta duelo (no aparece en duelableApps.js). Tracking: el componente no importa useGameTracker; delega en AppRunnerPage, que pasa onGameComplete y lo conecta a useGameTracker (track_session_start al montar + track_student_session por partida). TestScreen llama a onGameComplete UNA vez (protegido por trackedRef) con {mode:'test', score, maxScore: 1000, correctAnswers, totalQuestions:5, durationSeconds}. NO pasa 'nota', así que AppRunnerPage la calcula como correct/total*10 (coincide con la mostrada). Ranking: automático vía el score/maxScore enviados (multiplicador de curso + high_scores). Particularidades para mejoras: (1) la selección de modo es por botones en pantalla, no la pantalla previa estándar; (2) el examen son 5 preguntas (no 10 como otras apps); (3) no hay botón de instrucciones (InstructionsModal) ni material de estudio; (4) el feedback de error en práctica usa solucion.toFixed(2) siempre con 2 decimales y coma, lo que en variantes de enteros muestra '6,00€'; (5) en 1º el bucle de generación puede producir un único producto si la suma supera 10 (el 'continue' descarta el segundo), o incluso 0 si ambos exceden el tope.

**Ideas de mejora.**
- Unificar la generación de misiones en un único archivo de configuración por curso (tipo de operación, rangos de precio, topes y pesos de cada problema) para eliminar la duplicación entre las 6 variantes y permitir afinar dificultad sin tocar 6 componentes casi idénticos.
- Añadir InstructionsModal + un panel de 'cómo calcular el cambio/descuento' y, opcionalmente, una pista paso a paso, alineándolo con el patrón de instrucciones de la plataforma.
- Incorporar feedback sonoro (acierto/error) y revisar el formato del feedback de error para respetar enteros (mostrar '6€' en vez de '6,00€' en las variantes 1-3), reutilizando el helper formatPrice de TestScreen también en práctica.
- Valorar implementar el modo duelo 1 vs 1 (componente SupermercadoMatematicoDuel + DuelChatBar) ya que el examen de 5 preguntas rápidas encaja bien con un enfrentamiento por velocidad y aciertos.

### Ficha de usuario

**¿Qué es?** Supermercado Matemático es un juego de cálculo en el que el alumno se convierte en cliente de un supermercado. En pantalla aparecen productos con sus precios (leche, pan, manzanas, queso...) y una 'misión' de compra. Hay que resolver la operación que plantea cada situación: sumar lo que cuesta la cesta, multiplicar cantidades por precio, calcular cuánto dinero te devuelven o aplicar un descuento. Existe una versión para cada curso de Primaria, de 1º a 6º, con problemas adaptados a su nivel.

**¿Por qué es relevante?** Aprender a calcular 'en seco' es útil, pero hacerlo dentro de una situación real, ir a la compra, multiplica el sentido de la actividad. Esta app desarrolla la competencia matemática (suma, multiplicación, decimales, porcentajes) unida a la comprensión lectora de enunciados y a una primera educación financiera: manejar el euro, los céntimos, el cambio y los descuentos. Al estar el cálculo anclado en un contexto cotidiano, el alumnado entiende para qué sirve lo que practica y transfiere mejor lo aprendido a la vida diaria. Además, en el modo práctica se puede fallar y reintentar sin penalización, lo que reduce el miedo al error y favorece el ensayo; y el modo examen ofrece una nota sobre 10 que ayuda a familias y docentes a ver el progreso de forma clara.

**¿Cómo funciona?** La app muestra el catálogo de productos con sus precios y un enunciado de compra distinto cada vez, generado automáticamente. El alumno lee la misión, hace el cálculo y escribe el resultado en euros. En 'Práctica Libre' comprueba al instante: si acierta, ve confeti y un mensaje de ánimo; si falla, se le muestra la respuesta correcta para volver a intentarlo. En el modo examen responde una serie de 5 preguntas seguidas y, al terminar, obtiene su nota sobre 10, sus puntos y la corrección de cada pregunta.

**Cómo se juega.**
1. Observa el panel de productos y fíjate bien en el precio de cada uno.
2. Elige el modo: pulsa 'Práctica Libre' para entrenar sin nota o 'Iniciar examen' para que cuente.
3. Lee con atención la misión (por ejemplo: '1 Leche y 1 Pan', o 'pagas con un billete de 10€').
4. Haz el cálculo que pida el enunciado: sumar, multiplicar, calcular el cambio o aplicar el descuento.
5. Escribe el resultado en euros en la casilla (usa la coma para los céntimos, por ejemplo 4,75).
6. Pulsa 'Comprobar' (en práctica) o 'Siguiente'/'Finalizar', o la tecla Enter (en examen).
7. En práctica, si fallas mira la respuesta correcta y pulsa '¡Otra Misión!' para seguir practicando.
8. En examen, responde las 5 preguntas y revisa al final tu nota sobre 10, tus puntos y las correcciones.

**Modos.**
- **Práctica Libre**: Entrenas sin límite de tiempo ni nota: resuelves misiones, recibes feedback al instante y puedes reintentar tantas veces como quieras.
- **Examen**: Serie de 5 preguntas seguidas. Al terminar obtienes nota sobre 10, puntos (que tienen en cuenta tu rapidez) y la corrección de cada pregunta. Cuenta para las tareas y el ranking.

**Consejos.**
- En el modo examen la rapidez suma puntos extra, pero asegúrate primero de acertar: cada acierto vale mucho más que ir deprisa.
- Para el cambio, recuerda restar el precio total al billete con el que pagas; para los descuentos, calcula primero cuánto se rebaja y réstalo al precio.
- Usa la 'Práctica Libre' para soltarte antes de hacer el examen: puedes equivocarte sin que cuente.
- Escribe los céntimos con coma (por ejemplo 3,50) tal y como se ven los precios en pantalla.

---

## 📈 Laboratorio de Funciones 2D `(laboratorio-funciones-2d)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Herramienta de exploración matemática tipo sandbox que representa y manipula en tiempo real 9 familias de funciones (lineal, cuadrática, seno, exponencial, logarítmica, raíz, racional/hipérbola, valor absoluto y un modo 'Composer' de transformaciones) sobre un plano cartesiano dibujado en SVG. Componente React de un solo archivo, sin backend ni puntuación: es un visualizador interactivo, no un juego.

**Software.** Arquitectura de un único componente funcional 'LaboratorioFunciones2D' en src/apps/laboratorio-funciones-2d/LaboratorioFunciones2D.jsx (~600 líneas), sin CSS propio: estiliza con clases Tailwind utilitarias. Dependencias: framer-motion (animaciones del path SVG via motion.path con animate={{d}} y de los paneles colapsables con AnimatePresence), lucide-react (iconos LineChart, Settings, Variable, Layers, etc.) y los componentes compartidos del design system @/components/ui/slider (Slider) y @/components/ui/button (Button). NO usa three/@react-three/fiber, NO usa canvas-confetti, NO usa TTS ni Recharts (el doc catalog dice 'Recharts' pero el código real dibuja a mano un path SVG, no usa esa librería). Estado local con useState: selectedType (familia activa), composerBase (función base del modo Composer entre 8 opciones x, x2, x3, sin, cos, abs, sqrt, inv), params {a,b,c,d}, showGrid, zoom (px/unidad, 10-150), hoveredPoint, activeTab (graph/config móvil) y los flags de colapso de paneles. Dos catálogos como constantes: FUNCTIONS_TYPES (cada entrada con id, name, formula, params con min/max/step/default, función calculate(x,p) y desc) y COMPOSER_BASES (func + generador de latex). La curva se genera con un useMemo 'pathData': barre x con step 0.05 sobre un rango dependiente del zoom, evalúa calculateY(x), descarta NaN y valores |y|>500 (asíntotas) levantando la pluma (isPenDown) para no unir ramas discontinuas, y convierte a coordenadas SVG (centerX + x*zoom, centerY - y*zoom) en un viewBox 800x600. Otro useMemo 'gridLines' genera ejes y rejilla con etiquetas numéricas. Un useEffect resetea params a los defaults al cambiar de familia. NO hay cálculo de puntuación, NO hay nota /10, NO hay refs anti-doble-disparo: no aplica porque la app no produce resultado de partida.

**Jugabilidad.** No hay bucle de juego ni condiciones de victoria/derrota: es manipulación libre y continua. El usuario elige una familia de funciones en el panel lateral 'Funciones', ajusta los parámetros (a, b, c, d según la familia) con sliders y ve la curva redibujarse al instante con una transición suave de framer-motion; la fórmula con los valores actuales se muestra en el panel superior. Controles: ratón/táctil sobre los sliders y botones; al mover el ratón sobre el lienzo SVG aparece un indicador rojo pulsante con las coordenadas (x, y) del punto de la curva bajo el cursor (onMouseMove → calculateY), que desaparece al salir (onMouseLeave). Botones de zoom acercar/alejar (40px/unidad por defecto, límites 10-150) y de restablecer vista/parámetros (RotateCcw). En móvil hay pestañas Gráfico/Configuración. No hay niveles de dificultad ni feedback de acierto/error (sin confeti ni sonidos).

**Educativo.** Objetivo pedagógico: comprender visualmente cómo los parámetros de una función afectan a su representación gráfica (pendiente y ordenada, concavidad y vértice de la parábola, amplitud/frecuencia/fase de una sinusoide, base de la exponencial, asíntotas de la hipérbola, dominio de logaritmo y raíz, transformaciones geométricas en el modo Composer: estiramientos y traslaciones horizontal/vertical). Entrena interpretación de gráficas, relación símbolo-gráfica, lectura de coordenadas y razonamiento sobre dominio/continuidad. Encaja en el bloque de Funciones del currículo. Registrada solo en la asignatura de Matemáticas de ESO (1º-4º) y Bachillerato (1º-2º).

**Datos.** No usa gameDataService ni getAppContent ni ninguna RPC de Supabase: todo el contenido (familias de funciones, parámetros, fórmulas, funciones base del Composer y textos descriptivos) está definido como constantes literales dentro del propio componente (FUNCTIONS_TYPES y COMPOSER_BASES). Es contenido estático embebido, no editable desde la BD.

**Integración.** Registrada en commonApps.js (appLaboratorioFunciones2D, id 'laboratorio-funciones-2d'), añadida a appsMatematicas en esoApps.js (1º-4º) y bachilleratoApps.js (1º-2º). Está en WIDE_APP_IDS de AppRunnerPage (contenedor ancho ~1600px) y en courseBackgrounds.js. Particularidad clave: es una app SIN modos y SIN tracking — no llama a onGameComplete, no monta useGameTracker, no envía score/maxScore, no participa en ranking, XP, insignias ni nota, y no soporta duelo (no está en duelableApps.js). Encaja en la excepción del CLAUDE.md de 'apps sin modos' (como Isla de la Calma o Banco de Recursos). Para mejoras: cualquier intento de gamificarla obligaría a introducir useGameTracker + onGameComplete con un modo y, si es examen, nota /10 y puntos paralelos; mientras siga siendo sandbox no genera ninguna fila en game_sessions.

**Ideas de mejora.**
- Añadir un modo 'Reto/Examen' opcional que muestre una gráfica objetivo y pida ajustar parámetros hasta replicarla (con tolerancia), integrando onGameComplete + useGameTracker, nota /10 y confeti, para que pueda contar como tarea sin perder el modo libre de exploración.
- Permitir superponer varias funciones a la vez (multitrazo con colores distintos) para comparar familias o ver el efecto de cambiar un parámetro frente a la curva original; hoy solo se dibuja una curva.
- Mostrar elementos analíticos calculados: raíces, vértice, puntos de corte con los ejes, asíntotas marcadas y dominio, además del actual tooltip de coordenadas, reforzando el contenido curricular de análisis de funciones.
- Añadir paneo arrastrando el lienzo y zoom con rueda/pellizco (actualmente el zoom solo se controla por botones y el centro es fijo), y corregir/alinear la etiqueta del catálogo (docs/app-catalog.md indica 'Recharts' cuando el render real es SVG a mano).

### Ficha de usuario

**¿Qué es?** Laboratorio de Funciones 2D es una pizarra matemática interactiva donde se exploran y dibujan funciones en un plano cartesiano. Permite elegir entre familias de funciones (lineal, cuadrática, seno, exponencial, logarítmica, raíz cuadrada, hipérbola y valor absoluto) y un modo avanzado de transformaciones. Moviendo unos deslizadores se cambian los parámetros de la función (pendiente, curvatura, amplitud, desplazamientos...) y la gráfica se redibuja al instante, mostrando siempre la fórmula con los valores actuales.

**¿Por qué es relevante?** El gran obstáculo del alumnado con las funciones es conectar la fórmula con su dibujo: ver por qué un signo cambia la concavidad de una parábola o cómo la frecuencia estira una onda. Esta app resuelve ese salto haciendo el cambio visible y reversible en tiempo real, que es la forma más eficaz de construir intuición. Desarrolla competencia matemática y de pensamiento computacional: interpretación de gráficas, relación entre lenguaje algebraico y representación visual, lectura de coordenadas y razonamiento sobre dominio, continuidad y asíntotas. Al ser un entorno de exploración libre, sin nota ni penalización por error, invita a experimentar y a formular hipótesis ('¿qué pasa si...?'), un enfoque de aprendizaje por descubrimiento muy adecuado para el bloque de funciones de la ESO y el Bachillerato.

**¿Cómo funciona?** Es una herramienta de exploración libre, no un juego con puntuación. Se selecciona el tipo de función en el panel lateral y se ajustan sus parámetros con deslizadores; la curva se actualiza al momento sobre una rejilla con ejes. Arriba aparece la fórmula con los valores elegidos. Al pasar el ratón por la gráfica se muestran las coordenadas del punto. Hay botones para acercar y alejar el zoom y para restablecer la vista. No hay aciertos, fallos ni tiempo: se experimenta sin presión.

**Cómo se juega.**
1. Elige en el panel 'Funciones' el tipo que quieres estudiar (por ejemplo, Función Cuadrática).
2. Observa la fórmula general que aparece arriba y fíjate en la curva inicial dibujada en el plano.
3. Mueve los deslizadores de parámetros (a, b, c...) y mira cómo cambia la gráfica al instante.
4. Pasa el ratón por encima de la curva para leer las coordenadas (x, y) del punto bajo el cursor.
5. Usa los botones de zoom para acercar o alejar y ver mejor la zona que te interese.
6. Pulsa el botón de restablecer para volver a los valores por defecto y empezar de nuevo.
7. Para profundizar, abre el modo 'Transformaciones (Composer)', elige una función base y aplica estiramientos y desplazamientos para ver cómo se mueve la gráfica.
8. Lee el recuadro de información de cada función para entender qué representa cada parámetro.

**Modos.**
- **Exploración libre**: Modo único: se manipulan funciones y parámetros sin puntuación, sin tiempo y sin condiciones de victoria. Pensado para experimentar y entender.
- **Transformaciones (Composer)**: Modo avanzado dentro de la app: se elige una función base (x, x², x³, seno, coseno, valor absoluto, raíz o 1/x) y se le aplican traslaciones y escalados horizontales y verticales.

**Consejos.**
- Cambia un solo parámetro cada vez y observa el efecto antes de tocar el siguiente: así aíslas qué hace cada letra de la fórmula.
- Prueba valores negativos: verás cómo se invierte una parábola o una raíz, algo difícil de imaginar solo con la fórmula.
- En las funciones logarítmica, raíz e hipérbola fíjate en dónde se interrumpe la curva: ahí está el límite del dominio o una asíntota.
- Usa el modo Composer para comprobar que muchas funciones son 'la misma' transformada: desplazar y estirar una curva base.

---

## 🧊 Laboratorio de Figuras 3D `(visualizador-3d)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Visualizador/manipulador interactivo de 12 cuerpos geométricos en 3D con cálculo de volumen y área en tiempo real, construido como un único componente React (VisualizadorFiguras3D.jsx) sobre three / @react-three/fiber / @react-three/drei. Es una herramienta exploratoria, sin objetivo de partida, puntuación, modos ni tracking.

**Software.** Componente único src/apps/visualizador-figuras-3d/VisualizadorFiguras3D.jsx (~408 líneas), sin CSS propio: estiliza con clases utilitarias (Tailwind) y usa los componentes UI compartidos @/components/ui/button y @/components/ui/label; iconos de lucide-react (Box, Rotate3D, Palette, Calculator, Ruler, Settings2, Menu, etc.). Renderizado 3D con @react-three/fiber (Canvas, useFrame) y helpers de @react-three/drei: OrbitControls (con enableDamping y límite maxPolarAngle), GizmoHelper + GizmoViewport (cubo de ejes abajo-derecha), ContactShadows (sombra de contacto) y Float (flotación sutil). Geometrías nativas de three vía JSX r3f: boxGeometry, sphereGeometry, cylinderGeometry (reusada para cilindro, prisma triangular con 3 lados, prisma hexagonal con 6 y pirámide con 4 lados y radio superior 0), coneGeometry, tetrahedron/octahedron/dodecahedron/icosahedronGeometry y torusGeometry; material meshPhysicalMaterial con presets (plástico, metal, cerámica, cristal con transmission/opacity). Iluminación: ambientLight + spotLight con sombras (shadow-mapSize 1024) + dos pointLight de relleno; gridHelper y axesHelper en el suelo. Estado 100% local con useState (figuraActual, dimensiones {tamano, radio, altura, tubo}, autoRotar, wireframe, tipoMaterial, colorFigura, colorFondo, sidebarOpen); useRef en la malla para la rotación automática (rotation.y += delta*0.5 dentro de useFrame); useMemo para recalcular volumen/área al cambiar figura o dimensiones. NO hay sistema de puntuación, NO hay nota /10, NO hay modo examen y NO existen refs anti-doble-disparo porque no hay onGameComplete. La matemática vive en la constante DATOS_FIGURAS: cada figura define formulaVolumen, formulaArea y una función calc(d) que devuelve {v, a}; los resultados se muestran formateados con toFixed(2) en m³ y m². UI lateral mediante un acordeón propio (SeccionDesplegable) con secciones Selección de Figura, Dimensiones y Medidas, Fórmulas y Cálculo y Apariencia; sidebar responsive con breakpoint lg (tablet se comporta como móvil) y botones flotantes Settings/Menu para reabrirla.

**Jugabilidad.** No es un juego con bucle de partida, victoria o derrota: es un laboratorio de exploración libre. El usuario elige una de 12 figuras (cubo, esfera, cilindro, cono, tetraedro, octaedro, dodecaedro, icosaedro, prisma triangular, prisma hexagonal, pirámide, toro), ajusta sus dimensiones con sliders (arista/lado, radio, altura, grosor de tubo; cada figura expone solo los sliders pertinentes según su campo tipo) y observa cómo el volumen y el área de superficie se recalculan al instante. Controles de cámara con OrbitControls: ratón (arrastrar para orbitar, rueda para zoom) y gestos táctiles equivalentes; el gizmo de ejes y el OrbitControls cubren la navegación, sin atajos de teclado dedicados. Opciones de apariencia: 4 materiales, color de figura y de fondo (inputs de color), alternar malla (wireframe) y activar/detener la rotación automática. No hay niveles de dificultad, ni temporizador, ni feedback de acierto/error, ni confeti ni sonidos: el feedback es puramente visual (la escena 3D y los paneles numéricos).

**Educativo.** Objetivo pedagógico: desarrollar la visión espacial y la comprensión de los cuerpos geométricos y sus fórmulas de volumen y área superficial mediante manipulación directa. Entrena el razonamiento espacial (rotar/orbitar para entender caras, aristas y vértices), la relación entre las dimensiones de una figura y sus magnitudes derivadas (al mover un slider se ve el efecto en V y A), el reconocimiento de los sólidos platónicos y de cuerpos de revolución, y la lectura/aplicación de fórmulas geométricas. Encaje curricular en geometría del espacio; aparece en ESO 1º-4º y Bachillerato 1º-2º (registrada en esoApps.js y en appsBase de bachilleratoApps.js, presente en todas las asignaturas porque hereda). No está en Primaria ni en Atención a la Diversidad.

**Datos.** Contenido 100% interno y estático en el propio componente: la constante DATOS_FIGURAS (definiciones, fórmulas, funciones calc y texto info de cada figura) y PRESETS_MATERIAL. NO consume gameDataService.js, NO llama a getAppContent ni a ninguna RPC de Supabase, y no carga JSON externo. Esto implica que el contenido no varía por nivel, curso ni asignatura: todos los alumnos ven exactamente las mismas 12 figuras.

**Integración.** Integración mínima. Registrada en commonApps.js como appVisualizador3D = { id: 'visualizador-3d', name, description, component } SIN modos, SIN single_mode y SIN duelo. No usa useGameTracker ni invoca onGameComplete (de hecho ni siquiera recibe la prop), por lo que NO genera filas en game_sessions, NO otorga XP/insignias/avatares y NO participa en el ranking ni en la nota /10. AppRunnerPage la trata como app sin scoring: figura en WIDE_APP_IDS (contenedor ancho max-w-[1600px]) y en courseBackgrounds.js. Pertenece al grupo de apps sin modos descrito en CLAUDE.md (como Banco de Recursos o Generador de Personajes). Particularidades para mejoras: usa r3f/three (mismo stack que sistema-solar, célula-animal/vegetal, excavación, mesa-crafteo; chunk 3D separado en vite.config.js); NO está enganchada al ajuste global de calidad gráfica (graphicsQuality/useGraphicsQuality) que recomienda CLAUDE.md para apps 3D; el Canvas no tiene governor de FPS ni manejo de pérdida de contexto WebGL; varias figuras son aproximaciones visuales con factores de escala (tetraedro/octaedro *0.8, dodecaedro *1.2, prismas/pirámide vía cylinderGeometry con divisor), de modo que el sólido renderizado no coincide exactamente en tamaño con el valor numérico de la arista usado en las fórmulas.

**Ideas de mejora.**
- Añadir un modo evaluable opcional (quiz tipo examen): mostrar una figura con dimensiones dadas y pedir calcular volumen o área, con nota /10, useGameTracker/onGameComplete, ranking y feedback (confeti/sonidos) siguiendo el patrón estándar de la plataforma, conservando el laboratorio libre como modo de exploración.
- Enganchar la app al ajuste global de calidad gráfica (useGraphicsQuality + GraphicsQualitySelector con Canvas key={tier}), añadir governor de FPS y recuperación de contexto WebGL como en laboratorio-fisica, para robustez en tablets y móviles de gama baja.
- Visualizar elementos didácticos sobre la figura: contador y resaltado de caras, aristas y vértices (relación de Euler V-A+C=2), desarrollo plano (red) desplegable, y opción de mostrar las medidas acotadas sobre el modelo para reforzar la conexión geometría-fórmula.
- Sincronizar el tamaño real del sólido renderizado con la arista de las fórmulas (eliminar los factores de escala 0.8/1.2/1.7/1.4 o reflejarlos en el cálculo) y permitir comparar dos figuras lado a lado para estudiar relaciones de volumen entre cuerpos.

### Ficha de usuario

**¿Qué es?** El Laboratorio de Figuras 3D es una herramienta interactiva para explorar los principales cuerpos geométricos en tres dimensiones. Incluye 12 figuras: cubo, esfera, cilindro, cono, tetraedro, octaedro, dodecaedro, icosaedro, prisma triangular, prisma hexagonal, pirámide y toro. El alumnado las puede girar con el ratón o el dedo, cambiar sus dimensiones con barras deslizantes y ver al instante cómo se calculan su volumen y el área de su superficie, además de modificar su color, material y fondo.

**¿Por qué es relevante?** Trabaja una de las destrezas más difíciles de la geometría: la visión espacial, es decir, imaginar un cuerpo de tres dimensiones a partir de un dibujo plano. Al poder rotar libremente cada figura, el alumnado comprende de verdad sus caras, aristas y vértices, y deja de memorizar fórmulas sin sentido. Como el volumen y el área se recalculan en tiempo real al mover cada medida, se ve con claridad la relación entre las dimensiones de un cuerpo y sus magnitudes: por qué al doblar la arista el volumen crece mucho más que la superficie. Esta manipulación directa, propia del aprendizaje activo, fija mejor los conceptos que una explicación estática y conecta las fórmulas con la realidad visual de cada sólido, reforzando la competencia matemática y el razonamiento espacial.

**¿Cómo funciona?** Eliges una figura en el panel lateral y aparece en el centro de la escena 3D. Con barras deslizantes ajustas sus medidas (arista, radio, altura o grosor) y, en el panel de fórmulas, ves al momento el volumen y el área de superficie recalculados. Puedes girar la figura arrastrando con el ratón o el dedo, acercarte o alejarte, activar o detener la rotación automática, ver la malla interior y personalizar color, material y fondo. No hay puntos ni examen: es un espacio libre para observar y experimentar.

**Cómo se juega.**
1. Abre el panel lateral (icono de ajustes o menú) y, en Selección de Figura, elige el cuerpo que quieres estudiar.
2. Lee la descripción breve de la figura para conocer sus caras y características.
3. En Dimensiones y Medidas, mueve las barras deslizantes (arista, radio, altura o grosor del tubo) para cambiar su tamaño.
4. Abre Fórmulas y Cálculo y observa cómo cambian el volumen y el área de superficie al ajustar las medidas.
5. Gira la figura arrastrando con el ratón o el dedo, y usa la rueda o el gesto de pellizco para acercar y alejar.
6. Usa el botón de rotación para detener o reanudar el giro automático y ver la figura desde el ángulo que quieras.
7. En Apariencia, prueba distintos materiales, cambia el color de la figura y del fondo, y activa el modo malla para ver su estructura.
8. Compara figuras eligiendo otra y repitiendo el proceso para entender en qué se parecen y en qué se diferencian.

**Modos.**
_Sin modos diferenciados._

**Consejos.**
- Cambia una sola medida cada vez y fíjate en cómo varían el volumen y el área: así entenderás qué influye más en cada figura.
- Activa el modo malla para contar caras, aristas y vértices, sobre todo en los sólidos platónicos (tetraedro, octaedro, dodecaedro, icosaedro).
- Detén la rotación automática y orienta tú la figura para observar con calma una cara o un vértice concreto.
- Antes de mirar el resultado, intenta predecir el volumen o el área a mano con la fórmula que aparece, y luego comprueba si acertaste.

---


# 🔬 Ciencia y naturaleza

## 🧲 Laboratorio de Física 3D `(laboratorio-fisica)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Simulador 3D de fuerzas y fluidos para ESO y Bachillerato: un catálogo de 23 escenas físicas interactivas (caída libre, rozamiento, planos, muelles, Arquímedes, presión, gravitación, órbitas, Coulomb/Lorentz, etc.) con un motor físico propio determinista a paso fijo, renderizado con @react-three/fiber y tres modos (Explora, Retos, Examen POE). El shell vive en LaboratorioFisica.jsx; cada simulación es un fichero scenes/<id>.jsx que cumple un contrato común (CONTRATO_ESCENAS.md).

**Software.** Arquitectura: shell LaboratorioFisica.jsx (máquina de pantallas: select/catalog/sim/exam-intro/exam/summary) + registry.js (catálogo SIMS de 23 simDef y filtrado por curso) + engine/ (exam.js generador POE con semilla, integrator.js con FIXED_DT=1/120 s y clamp de dt, rng.js mulberry32, ambiences.js, constants.js). Cada escena exporta un simDef con paramsDef, retos[], examTemplates[], formulas[], Scene (componente r3f), cámara y controles. Componentes: SimViewport.jsx (Canvas con key={tier}-{ctxKey}, dpr/antialias/shadows fijados al crear contexto, OrbitControls, GovernorTicker de FPS, manejo de webglcontextlost que remonta reconstruyendo desde world, LabEnvironment), ParamPanel.jsx (sliders/selects/toggles + play/pausa/reset + velocidades 0,25x/1x/2x + ayudas + lecturas), GraphPanel.jsx (canvas 2D imperativo x-t/v-t), EnergyBars.jsx, VectorArrow.jsx, Texto3D.jsx, ExamScreen.jsx (flujo Predice→Observa→Explica), SimInfoModal.jsx. Librerías: react, react-router-dom (useParams), framer-motion (UI/AnimatePresence), canvas-confetti (retos y aprobado), three + @react-three/fiber + @react-three/drei (OrbitControls, Billboard), lucide-react (iconos). No usa TTS. Calidad gráfica vía servicio global graphicsQuality.js + hook useGraphicsQuality + GraphicsQualitySelector; el tier solo escala particleBudget/shadows/dpr, nunca la física. Gestión de estado: useState para UI; el estado físico vive en worldRef ({t,_acc,data}, fuera de React, sobrevive a remounts del Canvas); telemetría a 60 Hz desde la escena vía onTelemetry, throttleada a 10 Hz para la UI (lastUiRef); seriesRef como buffer de gráficas (decimado a 30 Hz, cap 2400 puntos); stateRef como espejo del estado para callbacks estables. Puntuación: en Examen cada pregunta vale predicción 70% + explicación 30%; nota /10 = Math.round((qScore/total)*100)/10 con qScore = Σ(0,7·predOk + 0,3·explOk); colores >=8 verde, >=5 azul, <5 rojo. Puntos paralelos sin tope (puntosPregunta): +100 por acierto, hasta +50 por rapidez, +25 por precisión (<1% error), +15 por racha>=2, +30 por explicación; EXAM_MAX_SCORE=2200. En Explora/Retos la puntuación se deriva de simulaciones visitadas (visited*20) o de retos superados (50 + 25 sin pista, maxScore totalRetos*75). Refs anti-doble-disparo: trackedRef bloquea múltiples onGameComplete; cleanupRef en useEffect de desmontaje dispara nota parcial si se abandona el examen (patrón Anagramas) o firePractice en Explora/Retos.

**Jugabilidad.** Bucle: pantalla de selección de modo → catálogo de simulaciones del curso → escena 3D a pantalla completa con panel flotante de controles (derecha, plegable), gráfica plegable (abajo-izquierda), fórmula viva centrada y barra superior (volver, Info, puntos). Controles: ratón/táctil para orbitar la cámara (OrbitControls, un dedo rota, dos dedos zoom; pan desactivado por defecto), sliders/pills/switches para los parámetros, botones play/pausa/reset y velocidad 0,25x/1x/2x, toggles de vectores y trayectoria. En Explora no hay victoria/derrota: es sandbox libre. En Retos cada simulación tiene 3-4 misiones con check(tel,params) evaluado en la telemetría; al cumplirse se otorgan puntos (50, +25 si no se abrió pista) con toast y confeti, y se marca completado. En Examen (POE) cada una de las 10 preguntas pasa por Predice (respuesta numérica con coma/punto o test de opciones), Observa (la simulación real se ejecuta con los parámetros del enunciado hasta done o simDuracion), veredicto, y Explica (opción múltiple de justificación); racha visible ×N; sin ayudas. Feedback: confeti al superar retos y al aprobar el examen (nota>=5), toasts de retos y de bajada de calidad, barras de energía, vectores de fuerza con magnitud.

**Educativo.** Objetivo pedagógico: aprendizaje activo de la física por indagación: el alumno manipula variables (masa, ángulo, μ, densidad, g del planeta, k, cargas, campos…) y observa relaciones causa-efecto en tiempo real, viendo a la vez vectores, gráficas x-t/v-t, barras de energía y la fórmula con valores sustituidos. El modo Examen usa el ciclo Predice-Observa-Explica, que combate ideas previas erróneas obligando a anticipar, contrastar con la simulación y justificar. Destrezas: razonamiento cuantitativo y proporcional (p. ej. el tiempo crece con √h), interpretación de gráficas, uso de fórmulas y unidades SI, descomposición vectorial, conexión modelo-realidad. Encaje curricular: mapeado a LOMLOE (RD 217/2022 ESO y RD 243/2022 Bachillerato). Aparece en Física y Química de ESO 1º-4º y en Física de 1º-2º Bachillerato. Catálogo acumulativo: en ESO todos los cursos ven el catálogo completo de la ESO (cada tarjeta etiquetada con su curso nativo); en Bachillerato es acumulativo y cada curso estrena simulaciones. Bernoulli (túnel de viento) y Stokes son de ampliación: visibles pero nunca evaluables.

**Datos.** Datos PROPIOS en código, no en BD: no usa gameDataService ni getAppContent. El catálogo (registry.js → SIMS) importa 23 simDef de scenes/*.jsx; cada uno declara sus paramsDef, fórmulas, retos (con callbacks check) y examTemplates (con generar(rng) que sustituye números). El examen se construye con generarExamen(SIMS, level, grade, seed) (engine/exam.js): toma el pool acumulado del curso sin ampliaciones, ~60% de preguntas de las simulaciones estrenadas en el curso y el resto de repaso, todo parametrizado por semilla mulberry32 (la semilla actual deriva de Date.now). Constantes físicas (planetas, densidades…) en engine/constants.js; SIM_INFO (simInfo.js) alimenta el modal de información. La decisión de mantener los datos en código (no como JSON libre) está documentada en LABORATORIO_FISICA.md por el fuerte acoplamiento a los rangos y validadores de cada escena.

**Integración.** Modos: tres estándar en pantalla de selección previa: Explora (sandbox, mode='practice'), Retos (guiado, mode='practice') y Examen POE (mode='test', genera nota /10). NO es single_mode (solo el examen cuenta para tareas) y NO tiene duelo en v1 (candidato a v2 según el diseño). Tracking: la app recibe onGameComplete desde AppRunnerPage (que internamente usa useGameTracker) y lo llama UNA vez por partida, protegido por trackedRef; en examen envía {mode:'test', score:points, maxScore:2200, correctAnswers:predCorrect, totalQuestions, durationSeconds, nota}, calculando la nota como override; en Explora/Retos envía mode:'practice' con score/maxScore derivados de simulaciones visitadas o retos. Cleanup en desmontaje (useEffect) dispara nota/practica parcial si se abandona. Ranking automático: AppRunnerPage aplica multiplicador de curso y guarda en game_sessions/high_scores. Calidad gráfica global (eduapps-graphics-quality) con governor de FPS y auto-downgrade que muestra toast; remonta el Canvas al cambiar tier o al perder contexto WebGL, conservando el estado físico en worldRef. Particularidades a tener en cuenta: el estado físico fuera de React es deliberado (no moverlo a useState); las magnitudes medibles deben salir de la física/fórmula analítica, nunca de las partículas; el contrato CONTRATO_ESCENAS.md es obligatorio para escenas nuevas (paso fijo, RNG mulberry32, sin assets externos, español con fmt y coma decimal); los examTemplates deben calcular respuesta con la MISMA física que enseña la simulación.

**Ideas de mejora.**
- Implementar el duelo 1 vs 1 ya previsto en el diseño (reto contrarreloj con misma semilla, mode='duel' + DuelChatBar), que daría a esta app integración en el sistema de duelos como el resto de apps duelables.
- Persistir el progreso de Retos por alumno (hoy retosDone/retosPoints viven solo en estado local y se pierden al salir); guardarlo permitiría retomar misiones y mostrar avance acumulado entre sesiones.
- Permitir al docente elegir qué simulaciones entran en el examen o fijar la semilla, para alinear el examen con la unidad trabajada en clase (hoy la semilla deriva de Date.now y el pool es automático por curso).
- Añadir un breve 'porqué' tras cada predicción fallida del examen (mini-explicación del cálculo correcto con la fórmula viva), reforzando la fase Explica más allá del test de opción múltiple.

### Ficha de usuario

**¿Qué es?** El Laboratorio de Física 3D es un simulador interactivo donde el alumnado experimenta con la física en escenas tridimensionales. Reúne 23 simulaciones (caída libre, rozamiento, planos inclinados, muelles, presión, Arquímedes, gravitación, órbitas, cargas y campos, fluidos…) en las que se mueven parámetros como la masa, el ángulo, el rozamiento, la densidad o la gravedad de cada planeta y se ve, al instante, qué ocurre. Permite explorar libremente, superar retos guiados y examinarse, con vectores de fuerza, gráficas y fórmulas visibles en todo momento.

**¿Por qué es relevante?** Es relevante porque convierte la física abstracta en algo manipulable y visual, base del aprendizaje por indagación: el alumno cambia una variable y observa el efecto, construyendo intuición antes que memorizar fórmulas. El modo Examen usa el ciclo Predice-Observa-Explica, una estrategia muy eficaz contra las ideas previas erróneas: obliga a anticipar un resultado, comprobarlo con la simulación real y justificar el porqué. Así desarrolla competencia científica, razonamiento cuantitativo y proporcional, lectura de gráficas, uso correcto de unidades y la conexión entre modelo y realidad. El contenido está alineado con el currículo LOMLOE de ESO y Bachillerato, y el catálogo crece con el curso para que cada nivel estrene simulaciones nuevas sin perder el repaso.

**¿Cómo funciona?** Eliges un modo y entras en una simulación 3D que ocupa toda la pantalla. Con el panel lateral mueves los parámetros (masa, ángulo, gravedad…), pulsas reproducir y observas el experimento, pudiendo girar la cámara con el ratón o el dedo, activar los vectores de fuerza, la trayectoria y las gráficas. En Retos cumples misiones para sumar puntos; en Examen predices un resultado, la simulación lo comprueba y explicas el porqué. Al terminar el examen obtienes una nota del 0 al 10.

**Cómo se juega.**
1. Pulsa el modo que quieras: Explora (libre), Retos (misiones) o Examen (nota).
2. Elige una simulación del catálogo de tu curso tocando su tarjeta.
3. Mueve los parámetros del panel (masa, ángulo, rozamiento, gravedad…) con los sliders y botones.
4. Pulsa Reproducir para lanzar el experimento; usa pausa, reset y la velocidad (0,25x, 1x, 2x) cuando lo necesites.
5. Gira la cámara arrastrando con el ratón o un dedo, y activa Vectores y Trayectoria para entender las fuerzas.
6. En Retos, lee la misión y ajusta los parámetros hasta superarla (la pista ayuda, pero resta bonus).
7. En Examen, escribe o elige tu predicción y pulsa Comprobar con la simulación.
8. Observa cómo la simulación confirma o corrige tu predicción y responde la pregunta de Explica.
9. Repite las 10 preguntas y consulta tu nota y tus puntos en el resumen final.

**Modos.**
- **Explora**: Laboratorio libre: entra en cualquier simulación, toca todos los parámetros y observa vectores, gráficas y fórmulas. Sin nota.
- **Retos**: Misiones guiadas en cada simulación (por ejemplo, lograr una caída de cierta duración). Suma puntos; las pistas ayudan pero restan bonus.
- **Examen**: 10 preguntas con el ciclo Predice-Observa-Explica, sin ayudas. Genera una nota del 0 al 10 y puntos extra por rapidez, precisión y racha.

**Consejos.**
- Antes de mover nada, activa los vectores y la trayectoria: ver las fuerzas dibujadas ayuda a entender por qué pasa lo que pasa.
- En el examen, usa la fase Observa para fijarte de verdad en la simulación: es donde compruebas y aprendes de tus errores.
- Puedes escribir los decimales con coma o con punto, y recuerda usar g = 9,8 m/s² salvo que el enunciado indique otra cosa.
- Consulta el botón Formulario del menú para repasar las fórmulas de tu curso agrupadas por simulación.

---

## 🧪 Mesa de Crafteo `(mesa-crafteo)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Constructor 3D de moléculas inspirado en mesas de crafteo de videojuegos: el alumno selecciona elementos químicos y los conecta por sus 'puertos' de valencia para reproducir la estructura de una molécula objetivo. Es un componente React con escena Three.js (react-three-fiber) y un motor propio de geometría VSEPR y comparación de grafos moleculares.

**Software.** Componente principal src/apps/mesa-crafteo/MesaCrafteo.jsx (~730 líneas) con estilos MesaCrafteo.css. La escena 3D se monta en MoleculeBuilder3D.jsx (Canvas de @react-three/fiber + OrbitControls/Html de @react-three/drei), que renderiza Atom3D.jsx (esferas, etiquetas flotantes y discos de puerto interactivos) y Bond3D.jsx (enlaces). Toda la lógica geométrica y de validación vive en atomConfig.js: mapa ELEMENT_VALENCES, getPortPositions (geometrías VSEPR reales: lineal, trigonal plana, tetraédrica ~109,47°, bipiramidal, octaédrica y distribución Fibonacci como fallback), orientación de puertos por cuaterniones (three.js), createInitialPorts, layoutMoleculeFromGraph (colocación BFS para 'Ver Solución') y moleculesMatch (compara composición + forma canónica del grafo con vecindarios ordenados, por lo que valida la conectividad real, no solo el recuento de átomos). Recetas en craftingRecipes.js (50 moléculas con name/formula/grade/description/funFact/atoms/bonds). UI con framer-motion (AnimatePresence, motion.div) y celebración con canvas-confetti. Estado en useState/useMemo/useCallback; descubrimientos persistidos en localStorage (clave mesa_crafteo_discoveries) y flag de tutorial visto. Modales reutilizados: PeriodicTableModal y AppOrientationWarning de _shared; TutorialModal propio. La nota /10 en examen se calcula en el bloque showExamResults: nota = round(ratio · gradeMax · 10)/10 con gradeMax variable por dificultad (9/10/11). La puntuación para ranking la genera computeCrafteoScore (basePoints = aciertos·100 + bonus de tiempo decreciente fastBonus/longBonus, escalado por proporción de aciertos y multiplicador de dificultad 0,85/1,0/1,25). Anti-doble-disparo del tracking con examTrackedRef (useRef) en el useEffect que llama onGameComplete; examStartTimeRef congela el tiempo final. No usa useGameTracker directamente: el wrapper AppRunnerPage lo aporta a través de onGameComplete.

**Jugabilidad.** Bucle: aparece una molécula objetivo (aleatoria en modo libre); el alumno elige un elemento del inventario (tabla periódica filtrada hasta Z≤36 más Ag/I/Au/Pb), hace clic en el espacio 3D para colocar el primer átomo y después en los puertos verdes libres para enganchar átomos sucesivos respetando la valencia y geometría. Controles: ratón (clic izquierdo rotar, scroll zoom, clic derecho desplazar) sobre OrbitControls; clics en esferas/puertos para construir; botones Deshacer, Limpiar, Revelar Fórmula y Ver Solución. Al pulsar Craftear se valida con moleculesMatch: si coincide, modal de SÍNTESIS EXITOSA con descripción y dato científico + confeti verde y se guarda el descubrimiento; si no, modal de FALLO DE FUSIÓN. En modo libre no hay derrota: se reintenta o se pasa a otra molécula (botón dado). En examen no hay feedback inmediato ni ayudas (Recetario/Tabla/Revelar/Solución deshabilitados), cronómetro visible, y al final una tarjeta de resultados con nota grande coloreada (>=8 verde, >=5 azul, <5 rojo), mensaje (Excelente/Muy bien/Aprobado/Necesitas repasar), puntos, aciertos, tiempo y desglose pregunta a pregunta con la solución de las falladas.

**Educativo.** Objetivo pedagógico: comprender de forma tangible y espacial la composición y, sobre todo, la conectividad de las moléculas (qué átomos hay y cómo se enlazan), reforzando los conceptos de valencia y de geometría molecular (VSEPR). Entrena lectura e interpretación de fórmulas químicas, conteo de átomos, identificación de elementos en la tabla periódica y razonamiento estructural (el validador exige el grafo correcto, no solo el recuento). El catálogo de 50 moléculas está graduado por curso (grade 1-4) cubriendo desde compuestos básicos (agua, sal, óxidos, sales binarias) hasta hidrocarburos, ácidos, oxoácidos y sales complejas, con descripciones y curiosidades que contextualizan cada compuesto en la vida real. Encaja en Física y Química de ESO (1º-4º) y en química de Bachillerato.

**Datos.** Dos fuentes. Los datos de elementos (símbolo, número atómico, categoría/familia, nombre) se cargan de Supabase con getAppContent('elementos-quimica') (RPC get_app_content) y alimentan el inventario, los colores por familia (FAMILIES en _shared/QuimicaHelpers.js) y el PeriodicTableModal. Las moléculas objetivo NO vienen de la BD: están en el fichero local craftingRecipes.js (array molecules), filtradas por curso con m.grade <= cursoActual.

**Integración.** Registrada en commonApps.js (id mesa-crafteo) y añadida a ESO (1º-4º, lista de asignaturas tipo Física y Química) y a Bachillerato (química); NO aparece en Primaria. No está en duelableApps.js, así que no soporta duelo 1 vs 1, y no figura como single_mode. Tiene un modo libre (práctica/descubrimiento, sin tracking de nota) y un modo Examen con tres dificultades internas (easy 4 preguntas/nota máx 9, medium 6/nota base 10, hard 10/nota hasta 11). Solo el examen dispara onGameComplete con mode:'test', enviando score (computeCrafteoScore), maxScore estimado, correctAnswers, totalQuestions y durationSeconds, protegido por examTrackedRef para una única llamada. El ranking y el XP los gestiona AppRunnerPage/useGameTracker a partir de ese onGameComplete. Particularidades a vigilar: el grade por defecto es 1 y la etiqueta de curso está fijada a 'º ESO' (no contempla Bachillerato en el texto); el maxScore es una estimación heurística (total·100+700)·mult, no un máximo real alcanzable, lo que puede distorsionar el porcentaje del ranking; la nota puede superar 10 en dificultad difícil (gradeMax 11), algo coherente con el diseño de la app pero a tener presente frente al estándar /10 del CLAUDE.md; el modo libre escribe descubrimientos en localStorage por dispositivo (no se sincroniza con la cuenta).

**Ideas de mejora.**
- Corregir la etiqueta de curso ('º ESO' fija) para que muestre el nivel real (ESO/Bachillerato) y, ya puesto, internacionalizar gradeLabel a partir de level/grade reales del wrapper.
- Servir las recetas de moléculas también desde getAppContent (como elementos-quimica) en lugar del fichero local, para poder ampliar/editar el catálogo por curso sin desplegar y alinearlo con el resto de apps.
- Añadir soporte de duelo 1 vs 1 (MesaCrafteoDuel.jsx + DuelChatBar + alta en duelableApps.js): el motor de validación por grafo encaja bien en un reto de velocidad de construcción.
- Revisar el maxScore enviado a onGameComplete para que refleje un máximo realmente alcanzable (tiempo mínimo) y así el porcentaje del ranking sea más justo y comparable entre alumnos.

### Ficha de usuario

**¿Qué es?** Mesa de Crafteo es un laboratorio de química en 3D donde el alumnado construye moléculas reales conectando átomos, como si montara piezas en una mesa de crafteo de videojuego. La app propone una molécula objetivo (por ejemplo agua, dióxido de carbono o metano) y el estudiante debe elegir los elementos correctos de un inventario y unirlos por sus puntos de enlace hasta reproducir su estructura. Puede girar, acercar y mover la escena para verla desde cualquier ángulo, consultar la tabla periódica y un recetario, y celebrar cada molécula que sintetiza con éxito.

**¿Por qué es relevante?** Convierte un contenido habitualmente abstracto, las fórmulas y los enlaces químicos, en algo manipulable y visual. Al exigir no solo los átomos correctos sino también cómo se conectan entre sí, el juego trabaja la valencia y la geometría molecular de una forma activa: el alumnado deja de memorizar fórmulas y empieza a entender por qué una molécula tiene esa estructura. Desarrolla la competencia científica (interpretar fórmulas, usar la tabla periódica, razonar la conectividad de los átomos), el razonamiento espacial al manipular la escena en 3D y la autonomía mediante el ensayo-error con pistas progresivas. Las descripciones y curiosidades de cada compuesto, además, conectan la química con la vida cotidiana, reforzando la motivación y el aprendizaje significativo. El modo examen permite evaluar de forma objetiva con una nota clara y un desglose de los aciertos y fallos.

**¿Cómo funciona?** Cada ronda muestra una molécula objetivo. El alumno selecciona un elemento del inventario, lo coloca en el espacio 3D y va enganchando más átomos en los puntos de enlace verdes que tiene cada átomo. Cuando cree que la estructura es correcta, pulsa Craftear y el programa comprueba que tanto los átomos como sus uniones coinciden con la molécula real. En el modo libre hay pistas (revelar la fórmula, ver la solución, recetario y tabla periódica); en el modo examen se quitan las ayudas, corre un cronómetro y al final se obtiene una nota.

**Cómo se juega.**
1. Lee la molécula objetivo que aparece en el panel de la derecha (su nombre y, si la revelas, su fórmula).
2. Selecciona en el inventario de elementos el átomo que quieras colocar.
3. Haz clic en el espacio 3D para colocar el primer átomo de la molécula.
4. Haz clic en los puntos de enlace verdes de un átomo para engancharle nuevos átomos del elemento seleccionado.
5. Gira la escena con el clic izquierdo, haz zoom con la rueda y desplázala con el clic derecho para ver bien la estructura.
6. Usa Deshacer o Limpiar si te equivocas, y Revelar Fórmula o Ver Solución si necesitas ayuda (solo en modo libre).
7. Cuando la estructura esté completa, pulsa Craftear para comprobar si has acertado.
8. Para evaluarte, pulsa Examen, elige la dificultad (Fácil, Medio o Difícil) y construye todas las moléculas que te pidan; al terminar verás tu nota y el repaso de aciertos y fallos.

**Modos.**
- **Libre (práctica)**: Construye moléculas al azar sin presión, con todas las ayudas disponibles (revelar fórmula, ver solución, recetario y tabla periódica) y celebración al acertar. No cuenta como examen.
- **Examen Fácil**: 4 moléculas sin ayudas; la nota se limita a un máximo de 9 (un punto menos que la base).
- **Examen Medio**: 6 moléculas sin ayudas; nota de referencia sobre 10.
- **Examen Difícil**: 10 moléculas sin ayudas; permite subir la nota hasta 11 y otorga más puntuación.

**Consejos.**
- Antes de construir, abre el Recetario o la Tabla Periódica para repasar de qué átomos se compone la molécula y cuántos lleva de cada uno.
- Fíjate en los puntos de enlace verdes: cada átomo solo admite tantas conexiones como su valencia, así que planifica el orden en que los unes.
- Practica primero en modo libre usando Revelar Fórmula y Ver Solución; cuando te salgan con soltura, pasa al examen sin ayudas.
- Recuerda que no basta con tener los átomos correctos: deben estar enlazados como en la molécula real, así que revisa bien las uniones antes de craftear.

---

## 🔬 Entrenador de Tabla Periódica `(entrenador-tabla)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de práctica de la tabla periódica construida como un único componente React funcional (EntrenadorTabla.jsx) con máquina de estados (setup/study/playing/result), que presenta preguntas de opción múltiple o respuesta escrita sobre nombres, símbolos y números atómicos de los 118 elementos. Reutiliza el modal compartido PeriodicTableModal.jsx para consultar la tabla completa.

**Software.** Componente único src/apps/entrenador-tabla/EntrenadorTabla.jsx (estilos EntrenadorTabla.css) con gestión de estado mediante useState/useEffect/useMemo (no Redux ni contexto). Estado en tres bloques: config (gameMode, scope, clueType, selectedCategories, range), session (targets, currentIndex, score, streak, startTime, answers) y estado de UI de la pregunta (currentOptions, selectedAnswer, userInput, isCorrect). Una máquina de estados con la variable gameState ('setup' | 'study' | 'playing' | 'result') gobierna el render dentro de un AnimatePresence (framer-motion). Librerías: framer-motion (motion + AnimatePresence para transiciones de pantalla y del modal de detalle de elemento) y canvas-confetti (confeti al alcanzar racha de 5 y al terminar la sesión). NO usa three/@react-three/fiber, TTS ni lucide-react; los iconos son emojis literales. Comparte src/apps/_shared/QuimicaHelpers.js (constante FAMILIES con 11 familias + color/label y normalizeString, que pasa a minúsculas y quita tildes vía NFD) y src/apps/_shared/PeriodicTableModal.jsx (renderiza la rejilla 7x18 + filas lantánidos/actínidos por la propiedad pos[fila,columna] y abre una ficha científica del elemento con masa, energía de ionización, electronegatividad, configuración y estados de oxidación, limpiando placeholders 'no data'/'unknown' con cleanData). Puntuación: en handleAnswer se acumula score (aciertos) y streak; al cerrar la sesión se calcula score = aciertos*100 + timeBonus y maxScore = total*100 + TIME_BUDGET*5, donde TIME_BUDGET = total*10 s y timeBonus = max(0, (TIME_BUDGET − segundos)·5). La nota /10 NO se calcula en el componente: se envía correctAnswers/totalQuestions y la deriva la capa de tracking (AppRunnerPage → useGameTracker → gamification_process_session) como correct/total·10. Anti-doble-disparo: NO hay un useRef de flag; se apoya en el guard 'if (selectedAnswer) return' (presente tanto en handleAnswer como en handleTextSubmit) y en que onGameComplete solo se invoca en la rama del último target dentro del setTimeout de 1200 ms.

**Jugabilidad.** Bucle: pantalla de setup donde se elige modo, tipo de pregunta y ámbito; startSession baraja el pool y toma 20 targets (práctica) o 10 (examen/examen-pro). Cada pregunta muestra una pista (renderClue) según clueType y, en modos no PRO, los primeros 100 caracteres de la descripción del elemento. En práctica y examen se responde por opción múltiple (4 botones: el correcto + 3 distractores aleatorios tomados de TODOS los elementos, no solo del pool); en examen-pro se escribe la respuesta en un input de texto comparada con normalizeString. Controles: ratón/táctil (botones de opción) y teclado (input + Enter/submit en PRO). Feedback inmediato: la opción se colorea correct/wrong, se revela la respuesta correcta, racha x en cabecera; confeti a racha 5 y confeti final. No hay vidas ni derrota: la sesión termina al agotar las preguntas y siempre llega a 'result' con porcentaje de aciertos. Tras 1200 ms se avanza a la siguiente pregunta automáticamente.

**Educativo.** Objetivo: memorizar y reconocer nombres, símbolos y número atómico de los elementos, y asociarlos a su familia química. Entrena memoria de pares símbolo↔nombre, reconocimiento por número atómico (las pistas atomicToName/protonsToName/electronsToName existen en renderClue aunque la UI solo expone símbolo↔nombre y nombre↔símbolo) y, vía el modal de estudio, lectura de propiedades (masa atómica, electronegatividad, estados de oxidación, configuración electrónica). Encaje curricular: Física y Química / Ciencias de ESO y Química de Bachillerato. Registrada en appsCiencias y appsQuimica de bachilleratoApps.js y en las listas de ciencias de esoApps.js (ESO 1-4 y Bachillerato 1-2).

**Datos.** Contenido global de elementos cargado con getAppContent('elementos-quimica') (gameDataService.js → RPC get_app_content, cacheado y deep-parseado), que devuelve un objeto con la propiedad elements. Es el MISMO dataset compartido con Mesa de Crafteo (mesa-crafteo) y catalogado en el admin (DataStatsTable/DataExplorer) como 'elementos-quimica'. Cada elemento aporta name, symbol, atomicNumber, category, pos[fila,columna], description y campos científicos (atomicMass, ionizationEnergy, electronegativity, config, oxidationStates). No usa getRoscoData ni datos por curso/asignatura: el pool es el mismo independientemente del level/grade desde el que se lance.

**Integración.** Modos propios del componente: practice (20 Q), exam (10 Q) y exam-pro (10 Q, texto libre) — NO sigue el patrón estándar easy/medium/exam de CLAUDE.md ni hay pantalla previa con tres niveles de dificultad; el selector previo elige modo, tipo de pregunta y ámbito. IMPORTANTE: las TRES variantes envían onGameComplete con mode:'test', por lo que cualquier partida (incluida 'Práctica Libre') cuenta como intento de examen para la nota de la tarea. No está registrada en app_scoring_config como single_mode ni en duelableApps.js (no soporta duelo 1vs1 ni DuelChatBar). Tracking estándar: AppRunnerPage monta el componente, useGameTracker abre/cierra la sesión, aplica el multiplicador de curso (1.0-2.1) al score/maxScore y persiste en game_sessions + high_scores; el ranking sale automático. No pasa el campo nota como override, así que la nota /10 es correct/total·10. Particularidades para mejoras: el scope 'range' está implementado en config/pool pero NO tiene UI para fijarlo; los distractores se sacan de todos los elementos aunque el ámbito sea 'por familias'; en modos no-PRO se accede a currentTarget.description sin guard (riesgo si un elemento no trae descripción); el cálculo del score final compensa el cierre obsoleto de session.score con +(correct?1:0).

**Ideas de mejora.**
- Alinear con el contrato de la plataforma: separar claramente práctica (mode:'practice') de examen (mode:'test') para que la Práctica Libre no compute como intento de tarea, y mostrar la nota /10 prominente con su mensaje y color en la pantalla de resultados (hoy solo enseña aciertos y porcentaje).
- Exponer en la UI el ámbito por rango de número atómico (ya soportado en config.range y en el pool) y restringir los distractores al ámbito seleccionado, para que el modo 'por familias' o por rango sea coherente y no mezcle elementos de fuera.
- Activar las pistas ya implementadas atomicToName/protonsToName/electronsToName (número atómico, protones, electrones) como tipos de pregunta seleccionables, ampliando las destrezas más allá de símbolo↔nombre.
- Robustez y accesibilidad: guard ante description ausente, integrar InstructionsModal + botón 'Ver material de estudio' del patrón compartido, y añadir TTS opcional para nombres/símbolos; sustituir el botón SALIR sin confirmación por un modal propio coherente con el resto de la plataforma.

### Ficha de usuario

**¿Qué es?** El Entrenador de Tabla Periódica es una app de Física y Química para practicar los elementos de la tabla. Te muestra una pista (un símbolo, un nombre o un número atómico) y tienes que identificar el elemento correcto, eligiendo entre cuatro opciones o escribiendo la respuesta tú mismo. Incluye una tabla periódica completa e interactiva que puedes consultar antes de jugar, con la ficha científica de cada elemento: masa atómica, electronegatividad, configuración electrónica y estados de oxidación. Es una forma rápida y motivadora de memorizar nombres, símbolos y números atómicos.

**¿Por qué es relevante?** Dominar los símbolos y nombres de los elementos es la base imprescindible para formular, ajustar reacciones y entender la química de ESO y Bachillerato; sin esa memoria automática, todo lo demás cuesta el doble. La app entrena exactamente esa fluidez mediante repetición espaciada y recuperación activa: en lugar de releer la tabla, el alumno tiene que recordar la respuesta, que es lo que de verdad consolida la memoria a largo plazo. El feedback inmediato (acierto/error y respuesta correcta revelada) corrige errores al instante, y poder estudiar antes la ficha de cada elemento conecta el símbolo con sus propiedades. La racha, el confeti y la puntuación añaden una motivación sana que sostiene la práctica repetida, que es justo lo que requiere memorizar 118 elementos.

**¿Cómo funciona?** Eliges un modo (práctica de 20 preguntas, examen o examen PRO de 10), el tipo de pregunta (de símbolo a nombre o de nombre a símbolo) y el ámbito (toda la tabla o por familias químicas). En cada pregunta ves la pista y respondes pulsando una de las cuatro opciones o, en el modo PRO, escribiendo. La app te dice al momento si has acertado, lleva la cuenta de aciertos y de tu racha, y al terminar te muestra el porcentaje conseguido. Puedes abrir la tabla periódica completa para repasar cuando quieras.

**Cómo se juega.**
1. Si lo necesitas, pulsa 'Ver Tabla Periódica' para repasar los elementos y, tocando cualquiera, consultar su ficha científica.
2. Elige el modo de juego: Práctica Libre (20 preguntas), Modo Examen (10) o Modo Examen PRO (10, escribiendo la respuesta).
3. Selecciona el tipo de pregunta: 'Símbolo a Nombre' o 'Nombre a Símbolo'.
4. Decide el ámbito de estudio: toda la tabla (1-118) o solo algunas familias químicas.
5. Pulsa '¡Empezar entrenamiento!' para comenzar la sesión.
6. Lee la pista de cada pregunta y responde: toca la opción correcta entre las cuatro, o escríbela y pulsa 'Enviar' en el modo PRO.
7. Comprueba al momento si has acertado y observa cómo suben tus aciertos y tu racha en la cabecera.
8. Encadena 5 aciertos seguidos para conseguir confeti y mantén el ritmo hasta la última pregunta.
9. Al final, revisa tu porcentaje de aciertos y pulsa 'Volver a entrenar' para repetir y mejorar.

**Modos.**
- **Práctica Libre**: 20 preguntas de opción múltiple con una pista descriptiva del elemento para aprender sin presión.
- **Modo Examen**: 10 preguntas de opción múltiple, con la pista descriptiva, para ponerte a prueba de forma más corta.
- **Modo Examen PRO**: 10 preguntas en las que escribes tú la respuesta, sin opciones ni descripción; el reto máximo.

**Consejos.**
- Antes de empezar, dedica unos minutos a la tabla periódica interactiva: ver el símbolo junto a su nombre y familia facilita memorizarlos.
- Empieza por familias (alcalinos, gases nobles, halógenos...) y ve ampliando a toda la tabla cuando domines cada grupo.
- Cuando ya respondas con seguridad en opción múltiple, pasa al Modo Examen PRO: escribir la respuesta consolida mucho mejor la memoria.
- Intenta encadenar rachas largas y responder con agilidad; ir rápido y sin fallos mejora tu puntuación final.

---

## 🌌 Sistema Solar 3D `(sistema-solar)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Simulador interactivo del sistema solar renderizado en 3D con react-three-fiber/three.js, donde el alumnado explora libremente los planetas, la Luna, el cinturón de asteroides y puntos de interés ('hotspots') con fichas técnicas, descripciones adaptadas por curso y vídeos divulgativos embebidos. Incluye una mini-actividad opcional de ordenar y emparejar planetas. Es una app de exploración (single_mode), sin examen ni nota.

**Software.** Componente principal src/apps/sistema-solar/SistemaSolar.jsx (~1570 líneas) más SolarSystemActivity.jsx (mini-juego) y el modelo de datos local model/solarSystemData.js. Stack 3D: @react-three/fiber (Canvas, useFrame), @react-three/drei (OrbitControls, Stars, Html, useTexture) y three (THREE.*) directamente. NO usa framer-motion, canvas-confetti, lucide-react ni TTS; los iconos son emojis/SVG inline y las animaciones se hacen vía useFrame y CSS (SistemaSolar.css). Renderizado: un único Canvas con cámara perspectiva (pos [0,80,140], fov 50, far 2000), shadows, y frameloop condicional 'never'/'always' (se pausa el render cuando hay vídeo o actividad abierta para ahorrar GPU). Escena: planetas como esferas texturizadas (texturas .webp 2k locales de Solar System Scope importadas en solarSystemData.js), capa de nubes para la Tierra (CloudLayer), corona solar multicapa animada (SunCorona), halos atmosféricos (AtmosphereGlow), anillos de Saturno con remapeo manual de UVs (PlanetRing), cinturón de asteroides con instancedMesh de 600 dodecaedros (AsteroidBelt), estrellas (Stars), polvo cósmico (CosmicDust, 300 puntos con AdditiveBlending) y 5 estrellas fugaces (ShootingStars). Robustez: TextureErrorBoundary (class component con getDerivedStateFromError) + React.Suspense envuelven cada material con textura y caen a ColoredMaterial si falla la carga. La cámara la gobierna CameraController vía useFrame: hace lerp del target/posición hacia el planeta seleccionado, detecta interacción del usuario (eventos start/end de OrbitControls con timeout de 4s) para no luchar contra el ratón, y vuelve a la vista por defecto al deseleccionar; al seleccionar un planeta se pausan las órbitas (isPaused = !!selectedPlanet). Gestión de estado: useState/useRef/useMemo/useCallback locales; planetRefs (objeto de refs) para localizar cada grupo 3D; visitedHotspots se persiste en localStorage ('solarSystem_visited'). Datos físicos (planetStats) y descripciones por nivel viven inline/en el modelo. El VideoModal se monta con createPortal a document.body (escapa del stacking context del Canvas) e incrusta iframes de YouTube (canal Kurzgesagt 'En Pocas Palabras'). IMPORTANTE: no calcula puntuación, nota /10 ni hay refs anti-doble-disparo, porque la app NUNCA llama a onGameComplete (no recibe esa prop; solo recibe level y grade).

**Jugabilidad.** Bucle de exploración libre, no hay condición de victoria/derrota ni vidas en el simulador. Controles: ratón/táctil vía OrbitControls (orbitar, zoom con rueda/pellizco, paneo deshabilitado cuando hay planeta seleccionado), clic sobre un planeta/luna o sobre la barra inferior PlanetNavBar para enfocarlo (la cámara hace zoom automático y se abre InfoPanel con descripción adaptada al curso, ficha técnica —diámetro, gravedad, temperatura, rotación, órbita, satélites, distancia al Sol— y barras comparativas de tamaño/gravedad frente a la Tierra, más sección desplegable 'Composición y Datos'). Hotspots: puntos pulsantes 3D sobre cada cuerpo (4 por planeta) que al pulsarse abren un popup con curiosidad y se marcan como 'visitados'; el Centro de Control (ConfigPanel) muestra un HUD radial con el porcentaje de hotspots descubiertos (visitedCount/totalCount) y permite reiniciar la exploración (modal propio ResetModal + animación 'REBOOTING', sin window.confirm). Estrellas amarillas junto a cada planeta abren vídeos divulgativos. Sliders ajustan velocidad orbital, velocidad de rotación, opacidad y grosor de las órbitas. Mini-actividad opcional 'Desafío de Planetas' (SolarSystemActivity, modal de 3 fases): Fase 1 ordenar los 8 planetas por distancia al Sol (botones izquierda/derecha + 'Verificar Orden', con animación shake si falla), Fase 2 emparejar cada planeta con una característica aleatoria de sus hotspots, Fase 3 pantalla de éxito con trofeo 🏆. NO hay niveles de dificultad seleccionables ni confeti/sonidos: el feedback es visual (pulse, shake, HUD, animación de reinicio) y no hay audio.

**Educativo.** Objetivo: comprender la estructura del sistema solar (orden, tamaños relativos, gravedad, temperatura, periodos, composición) mediante exploración visual e indagación. Entrena alfabetización científica, vocabulario astronómico, lectura comprensiva de fichas técnicas, comparación de magnitudes y, en el mini-juego, memoria y secuenciación (ordenar por distancia, asociar características). Las descripciones se adaptan automáticamente por curso (getDescription): primaryBasic para Primaria 1º-3º, primaryAdvanced para Primaria 4º-6º y secondary para ESO/Bachillerato, con composición química y curiosidades técnicas para los mayores. Encaje curricular: Ciencias Naturales en Primaria (1º-6º) y Biología en ESO (1º-4º) y Bachillerato (1º-2º), según commonApps.js, primariaApps.js, esoApps.js y bachilleratoApps.js.

**Datos.** Contenido 100% local del componente: model/solarSystemData.js (planetas, lunas, descripciones por nivel, hotspots, composición, geografía, curiosidades, rutas a texturas .webp importadas). Los datos físicos tabulados (planetStats), el mapa de colores atmosféricos, el catálogo de vídeos de YouTube (planetVideos, Kurzgesagt) están definidos como constantes inline en SistemaSolar.jsx. NO usa gameDataService.js (ni getAppContent, ni getRunnerData, ni ningún RPC de Supabase para el contenido). El único estado persistido es localStorage 'solarSystem_visited'.

**Integración.** single_mode (registrada en app_scoring_config con single_mode=true junto a Célula Animal/Vegetal y Excavación Selectiva): no tiene modos easy/medium/exam ni pantalla previa de dificultad, y no es duelable (no aparece en duelableApps.js). El componente solo recibe level y grade; no llama a onGameComplete, así que NO genera score, nota /10 ni ranking propio. El tracking lo realiza íntegramente AppRunnerPage vía useGameTracker: startSession al montar y abandonSession al desmontar, de modo que la sesión cuenta como tiempo de uso / app distinta para XP, insignias y desbloqueo de avatares (varios avatares dependen de 'app_sessions' con app_id 'sistema-solar', algunos con mode 'test' que esta app no emite —ver matiz abajo). Particularidades para futuras mejoras: (1) el avatar_032 ('Aprueba 5 exámenes del Sistema Solar', mode:'test') y avatar_050 son técnicamente inalcanzables porque la app nunca registra sesiones en modo examen; conviene revisar esos requisitos o añadir un modo evaluable. (2) frameloop se pausa con vídeo/actividad para rendimiento, pero la app NO usa el ajuste global de calidad gráfica (graphicsQuality/useGraphicsQuality) como recomienda CLAUDE.md para apps 3D. (3) El progreso de hotspots vive solo en localStorage (no en BD), por lo que no se sincroniza entre dispositivos.

**Ideas de mejora.**
- Integrar el selector global de calidad gráfica (src/services/graphicsQuality.js + useGraphicsQuality + GraphicsQualitySelector y Canvas con key={tier}) para escalar instancedMesh del cinturón, número de estrellas/polvo y resolución de texturas en equipos modestos, tal y como exige CLAUDE.md para apps 3D.
- Convertir el 'Desafío de Planetas' en un modo examen real que llame a onGameComplete con mode:'test', nota /10 y puntos (aciertos en ordenar + emparejar, con bonus por tiempo): así se desbloquearían los avatares avatar_032/avatar_050 (hoy inalcanzables por exigir mode:'test') y la app aportaría a la nota.
- Añadir narración por voz (TTS con speechSynthesis) de las descripciones e hitos, y feedback sonoro/confeti (canvas-confetti) en la fase de éxito del mini-juego, para reforzar accesibilidad y motivación.
- Persistir visitedHotspots en Supabase por alumno (en lugar de solo localStorage) para sincronizar el progreso de exploración entre dispositivos y poder mostrar logros de 'sistema explorado al 100%'.

### Ficha de usuario

**¿Qué es?** Sistema Solar 3D es un planetario interactivo en tres dimensiones que puedes recorrer con el ratón o el dedo. Verás el Sol, los ocho planetas, la Luna y el cinturón de asteroides girando en sus órbitas. Al tocar cualquier cuerpo, la cámara vuela hasta él y se abre una ficha con su descripción, su tamaño, su gravedad, su temperatura y curiosidades. También hay puntos brillantes para descubrir secretos de cada planeta, vídeos divulgativos y un pequeño desafío final para repasar lo aprendido.

**¿Por qué es relevante?** Aprender astronomía a través de un modelo manipulable es mucho más eficaz que memorizar listas: el alumnado construye una imagen mental real del orden de los planetas, sus tamaños relativos y sus distancias, algo difícil de captar en un libro. La app desarrolla la competencia científica y la curiosidad por indagar, la comprensión lectora (al leer fichas técnicas adaptadas a su edad) y la capacidad de comparar magnitudes (tamaño y gravedad frente a la Tierra). Las descripciones se ajustan solas al curso, así que el mismo recurso sirve desde Primaria hasta Bachillerato. El desafío de ordenar y emparejar planetas pone en juego la memoria y el razonamiento secuencial, y los vídeos de divulgación amplían el horizonte hacia estrellas, agujeros negros o futuras exploraciones espaciales. Es exploración libre: aprender sin presión, a su propio ritmo.

**¿Cómo funciona?** Al entrar aparece el sistema solar girando. Arrastra para girar la vista y usa la rueda o el pellizco para acercarte. Pulsa un planeta (o su nombre en la barra inferior) y la cámara viajará hasta él mostrando su ficha. Toca los puntos brillantes para descubrir curiosidades y las estrellas amarillas para ver un vídeo. Desde el Centro de Control ajustas la velocidad de las órbitas, ves tu porcentaje de exploración y lanzas el Desafío de Planetas para repasar.

**Cómo se juega.**
1. Espera a la breve presentación inicial y observa el sistema solar girando.
2. Arrastra con el ratón o el dedo para girar la vista; usa la rueda o el pellizco para acercarte o alejarte.
3. Pulsa un planeta, la Luna o su nombre en la barra de abajo para volar hasta él y leer su ficha.
4. Dentro de la ficha, despliega 'Composición y Datos' para ver curiosidades y mira las barras que comparan su tamaño y gravedad con la Tierra.
5. Toca los puntos brillantes que rodean cada cuerpo para descubrir sus secretos; se marcarán como visitados.
6. Pulsa las estrellas amarillas para abrir un vídeo divulgativo sobre ese tema.
7. Abre el Centro de Control (rueda dentada) para ajustar la velocidad de las órbitas y ver tu porcentaje de exploración.
8. Lanza el 'Desafío de Planetas': ordénalos por distancia al Sol y empareja cada uno con su característica.
9. Cuando completes el desafío verás la pantalla de Misión Completada; puedes reiniciar la exploración cuando quieras.

**Modos.**
- **Exploración libre**: Recorre el sistema solar a tu ritmo, enfoca planetas, descubre puntos de interés y ve vídeos. Sin límites de tiempo ni nota.
- **Desafío de Planetas**: Mini-actividad de repaso en tres fases: ordenar los planetas por distancia al Sol y emparejar cada uno con su característica hasta completar la misión.

**Consejos.**
- Antes de lanzar el Desafío, recorre todos los planetas y lee sus fichas: te será mucho más fácil ordenarlos y emparejarlos.
- Si te mareas con el movimiento, baja la velocidad orbital con el slider del Centro de Control o selecciona un planeta para detener las órbitas.
- Intenta descubrir el 100% de los puntos de interés; el HUD del Centro de Control te indica cuántos te quedan.
- Aprovecha las barras de comparación de tamaño y gravedad para entender de un vistazo lo enorme que es Júpiter o lo ligero que pesarías en Marte.

---

## 🔬 La Célula Animal `(celula-animal)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Atlas interactivo de la célula animal: un diagrama SVG vectorial dibujado a mano (gradientes, filtros y micro-animaciones nativas SVG) sobre el que se exploran 13 orgánulos con ficha descriptiva, más dos minijuegos de repaso (Test de localización y Reto de emparejamiento). Es un componente React autocontenido sin dependencia de datos de Supabase.

**Software.** Fichero único src/apps/celula-animal/CelulaAnimal.jsx (+ CelulaAnimal.css). Dos componentes: CellDiagram (SVG 600x500 con <defs> de radial/linearGradients, filtros glow/innerShadow/dropShadow y tres <animateMotion> nativos para vesículas y partícula de ATP; cada orgánulo es un <g class='organelle-region'> clicable) y el contenedor CelulaAnimal. Estado con useState/useRef/useMemo: modo ('explore'|'quiz'|'match'), orgánulo seleccionado, Set de visitedIds, estado del Test (quizTarget, quizScore, quizFeedback) y del Reto (matchDifficulty, matchPairs, matchFunctions, matchAnswers, testSubmitted, testGrade). Zoom/pan propio basado en viewBox (zoom 1-4x con rueda no-pasiva, pan por pointer events con clampOrigin para no salirse, ResizeObserver para reposicionar las etiquetas HTML superpuestas calculando el letterboxing del SVG con preserveAspectRatio). Librerías: lucide-react (iconos X, Info, Lightbulb, Activity, Box, Target, CheckCircle2, XCircle, ZoomOut), canvas-confetti (al aprobar el Reto), react-router-dom (useNavigate, no usado de forma efectiva), y AppOrientationWarning de _shared. NO usa framer-motion ni three/r3f ni TTS. La nota /10 del Reto se calcula como Math.round((correct/matchPairs.length)*10*10)/10. No hay refs anti-doble-disparo porque NO existe llamada a onGameComplete.

**Jugabilidad.** Tres modos conmutables por pestañas en el header (Explorar/Test/Reto). EXPLORAR: clic en un dot/etiqueta, en el dock inferior de iconos o en la propia región SVG abre un panel lateral con descripción, funciones, estructura y curiosidad ('¿Sabías que…?'); barra de progreso de orgánulos visitados (x/13). Zoom con rueda y arrastre para hacer pan (umbral de 5px distingue clic de arrastre). TEST: aparece un objetivo ('ENCUENTRA: …') y hay que clicar el orgánulo correcto en el diagrama; acierto suma 1 punto y tras 1,5s salta al siguiente (objetivos aleatorios, sin fin ni derrota), fallo muestra feedback rojo 1s. RETO: selector previo de dificultad (6/9/12 orgánulos = Fácil/Normal/Difícil); se emparejan orgánulos con su función (subtitle) seleccionando uno y luego su función, con opción de descartar; al completar todos se pulsa Corregir, se muestra nota /10 con emoji y mensaje (Sobresaliente/Notable/Aprobado/Necesitas repasar) y confeti si nota>=5; botones de repetir o volver. Controles ratón/táctil (pointer events); sin soporte de teclado ni sonido.

**Educativo.** Objetivo: aprender la estructura, funciones y orgánulos de la célula animal (biología). Entrena reconocimiento visual de orgánulos, asociación estructura-función, vocabulario científico y comprensión de procesos (síntesis de proteínas, respiración celular, división, digestión celular). El Reto practica recuperación activa (relacionar orgánulo↔función) y el Test la localización espacial. Encaje curricular: Biología/Biología y Geología. Registrada en biología de ESO 1º-4º y en Bachillerato 1º-2º (heredada de appsBase). No aparece en Primaria ni Atención a la Diversidad.

**Datos.** Contenido 100% local, hardcodeado en el array organelleData del propio componente (13 orgánulos con id, name, icon, subtitle, labelPos, description, functions[], structure, funFact). NO consume gameDataService (ni getAppContent ni getRoscoData ni nada de Supabase): el contenido es estático e igual para todos los cursos/asignaturas en los que se ofrece.

**Integración.** La app no recibe ni invoca la prop onGameComplete y no importa useGameTracker, por lo que sus modos internos (Test/Reto) NO persisten nada: ni puntuación, ni nota, ni XP, ni insignias, ni ranking, ni progreso de avatares por resultado. Sus 'modos' (Explorar/Test/Reto y las dificultades 6/9/12) son enteramente client-side y no se mapean a los modos canónicos easy/medium/exam de la plataforma. Lo único que sí se registra es la sesión de uso: AppRunnerPage llama startSession al montar y abandonSession al desmontar (useGameTracker), de modo que la app cuenta como 'app visitada' (relevante para unique_apps de avatares y tiempo total de juego), pero sin score. Catalogada como single_mode en app_scoring_config, aunque ese flag es backend y aquí no tiene efecto porque no se emiten sesiones con resultado. No es duelable (no está en duelableApps). courseBackgrounds la marca como fondo 'dark-glass'. Para mejoras, lo crítico es: si se quiere que el Reto cuente para la tarea/nota, hay que cablear onGameComplete (mode 'test', score, maxScore, correctAnswers, totalQuestions, durationSeconds, nota) protegido por un useRef anti-doble-disparo.

**Ideas de mejora.**
- Cablear onGameComplete en el modo Reto (y opcionalmente en el Test, fijando un número de rondas) para que la nota /10 y los puntos cuenten realmente hacia la tarea, XP, insignias y ranking, protegido con un useRef anti-doble-disparo como exige el contrato de la plataforma.
- Hacer el Test finito y evaluable (p. ej. localizar los 13 orgánulos una vez, con temporizador y racha) para poder enviar correctAnswers/totalQuestions y puntos paralelos por velocidad.
- Añadir accesibilidad y feedback sonoro: navegación por teclado entre orgánulos, foco visible, lectura TTS de la ficha (patrón ya usado en otras apps) y sonidos de acierto/error, además de respetar el ajuste global de calidad si se animan más elementos.
- Enriquecer el contenido y la rejugabilidad: distractores en el Reto que mezclen funciones de orgánulos no presentes en la ronda, un modo 'comparar con célula vegetal' enlazando con celula-vegetal, y barajado de qué texto se pide emparejar (función/estructura/descripción) en lugar de solo el subtítulo.

### Ficha de usuario

**¿Qué es?** La Célula Animal es un atlas interactivo para explorar, por dentro, cómo es una célula animal. Sobre un dibujo detallado de la célula puedes pinchar en cada orgánulo (núcleo, mitocondrias, aparato de Golgi, lisosomas, ribosomas y muchos más) y ver una ficha con su descripción, sus funciones, su estructura y una curiosidad sorprendente. Además de explorar, incluye dos juegos de repaso: uno para localizar orgánulos y otro para relacionar cada orgánulo con su función. Es una forma visual y manejable de estudiar biología celular.

**¿Por qué es relevante?** La biología celular es muy abstracta y memorística cuando solo se lee en el libro; esta app la convierte en algo visual y manipulable, que es como mejor se aprende. Trabaja competencia científica y vocabulario específico, pero sobre todo dos destrezas clave: reconocer cada estructura dentro del conjunto (el modo Test entrena la localización espacial) y asociar cada orgánulo con lo que hace (el modo Reto practica la recuperación activa, una de las estrategias de estudio más eficaces). Poder hacer zoom, observar las animaciones del transporte celular y comprobar al instante si has acertado refuerza la comprensión y la memoria a largo plazo, conecta la forma con la función y mantiene la motivación. Encaja en Biología de ESO y Bachillerato como apoyo, repaso o introducción del tema.

**¿Cómo funciona?** La pantalla muestra una célula animal completa que puedes ampliar con la rueda del ratón y desplazar arrastrando. Arriba eliges entre tres modos: Explorar, Test y Reto. En Explorar, al pulsar un orgánulo se abre su ficha completa y se va marcando lo que ya has visto. En Test te pide encontrar un orgánulo concreto en el dibujo y suma puntos por aciertos. En Reto eliges cuántos orgánulos (6, 9 o 12) y emparejas cada uno con su función; al corregir obtienes una nota sobre 10 con confeti si apruebas.

**Cómo se juega.**
1. Espera a que cargue la célula y, si te lo pide, gira el dispositivo a horizontal para verla mejor.
2. En el modo Explorar, pincha en un orgánulo (en el dibujo, en su etiqueta o en la barra de iconos de abajo) para abrir su ficha con descripción, funciones, estructura y curiosidad.
3. Usa la rueda del ratón para acercarte y arrastra para moverte; pulsa el botón 1:1 para volver a la vista normal.
4. Intenta visitar todos los orgánulos: arriba verás cuántos llevas explorados.
5. Cambia al modo Test y busca en el dibujo el orgánulo que se te pide en cada ronda; cada acierto suma un punto.
6. Cambia al modo Reto y elige la dificultad: 6 (Fácil), 9 (Normal) o 12 (Difícil) orgánulos.
7. Selecciona un orgánulo de la izquierda y pulsa su función en la derecha para emparejarlos; usa la X para deshacer una pareja si te equivocas.
8. Cuando hayas asignado todos, pulsa Corregir para ver tu nota sobre 10 y qué has acertado o fallado.
9. Repite el reto o vuelve a explorar para repasar lo que se te haya resistido.

**Modos.**
- **Explorar**: Recorre la célula libremente y consulta la ficha de cada orgánulo (descripción, funciones, estructura y curiosidad), con barra de progreso de lo visitado.
- **Test**: Se te pide localizar un orgánulo concreto en el dibujo; cada acierto suma un punto. Juego de práctica continuo, sin nota.
- **Reto: Fácil (6 orgánulos)**: Empareja 6 orgánulos con su función y obtén una nota sobre 10 al corregir.
- **Reto: Normal (9 orgánulos)**: Igual que el Fácil pero con 9 orgánulos; más memoria y atención.
- **Reto: Difícil (12 orgánulos)**: La versión más exigente, con 12 orgánulos para relacionar con su función.

**Consejos.**
- Empieza siempre por Explorar y lee la curiosidad de cada orgánulo: ayuda a recordar mejor su función.
- Usa el zoom para fijarte en los detalles (las crestas de las mitocondrias, los poros del núcleo, las cisternas del Golgi) antes de pasar a los juegos.
- En el Reto, si dudas, descarta primero los orgánulos que tengas claros para acotar las funciones que quedan.
- Repite el Reto subiendo de 6 a 9 y a 12 orgánulos a medida que ganes seguridad.

---

## 🌿 La Célula Vegetal `(celula-vegetal)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App interactiva de un solo fichero (CelulaVegetal.jsx) que renderiza un diagrama vectorial SVG de una célula vegetal con 12 orgánulos clicables y tres modos (Explorar, Test, Reto). Todo el contenido educativo está hardcodeado en el propio componente; no consume datos de Supabase ni recibe props de juego.

**Software.** Componente funcional React único: src/apps/celula-vegetal/CelulaVegetal.jsx + CelulaVegetal.css. Subcomponente CellDiagram que dibuja a mano un SVG (600x500) con gradientes lineales/radiales, filtros (glow, softGlow, dropShadow), patrón de fibras de celulosa y varias animaciones nativas SMIL (<animate>/<animateMotion>: ondas de la vacuola, vesículas Golgi→pared, partículas de ATP, ciclosis citoplasmática, partícula de fotosíntesis). Librerías: lucide-react (iconos X, Info, Lightbulb, Activity, Box, Target, CheckCircle2, XCircle, ZoomOut), canvas-confetti (celebración al aprobar el Reto), react-router-dom (useNavigate, aunque no se usa para navegar realmente) y el shared AppOrientationWarning. NO usa framer-motion, three/@react-three/fiber ni TTS. Estado: todo con useState/useRef/useCallback/useMemo locales — selectedOrganelle, visitedIds (Set), mode, quizTarget/quizScore/quizFeedback, matchDifficulty/matchPairs/matchFunctions/matchSelected/matchAnswers, testSubmitted/testGrade, y estado de cámara (zoom, viewOrigin, isPanning) con ResizeObserver para mapear coordenadas SVG↔píxel del contenedor (letterboxing xMidYMid). Puntuación: en Test cada acierto suma +10 (quizScore), sin tope ni envío. En Reto la nota se calcula como (correct/matchPairs.length)*10 y se muestra con toFixed(1) sobre 10, con emoji/etiqueta por tramos (>=9, >=7, >=5, resto). NO hay refs anti-doble-disparo de onGameComplete porque el componente nunca llama a onGameComplete: ignora por completo las props que AppRunnerPage le inyecta (onGameComplete, level, grade, subjectId).

**Jugabilidad.** Tres modos seleccionables con tabs en la cabecera (cambiar de modo reinicia su estado vía switchMode). Explorar: clic en orgánulo (sobre el SVG, en marcadores/etiquetas flotantes o en el dock inferior) abre un panel con descripción, funciones, estructura y un dato curioso; una barra de progreso cuenta orgánulos visitados (N/12). Hay zoom con rueda (1x–4x) y paneo con arrastre cuando zoom>1, con detección de drag (umbral 5px) para no disparar selección al arrastrar, y botón 1:1 para restaurar. Test: aparece un objetivo 'ENCUENTRA: X' y el alumno debe pinchar el orgánulo correcto en el diagrama; acierto = +10 puntos, feedback verde/rojo y avance automático tras 1,5s eligiendo preferentemente no visitados; fallo = mensaje y reintento. Reto: selección previa de dificultad (6 Fácil / 9 Normal / 12 Difícil pares), se relacionan orgánulos con su primera función mediante clic-clic (seleccionar orgánulo, luego función), con opción de descartar pareja; al pulsar Corregir se calcula la nota /10, confeti si >=5, y botones Repetir/Volver. Controles: ratón/táctil (pointer events) y rueda; sin teclado. Sin condición de derrota ni vidas/temporizador.

**Educativo.** Objetivo: reconocer las partes de la célula vegetal y sus funciones, con énfasis en lo distintivo frente a la animal (pared celular de celulosa, cloroplastos/fotosíntesis, gran vacuola central y turgencia, núcleo desplazado). Destrezas: identificación visual de estructuras en un diagrama, asociación estructura-función, vocabulario científico y memorización espacial. El modo Reto entrena el emparejamiento orgánulo↔función. Encaje curricular: Biología y Geología de ESO (la biología celular se trabaja sobre todo en 1º y 3º ESO) y Biología de Bachillerato. Registrada en la asignatura 'biologia' de ESO 1-4 y Bachillerato 1-2 (heredada por appsBase); no aparece en Primaria.

**Datos.** Contenido 100% propio y hardcodeado en el array organelleData del componente (12 orgánulos: pared celular, membrana, citoplasma, vacuola, núcleo, nucléolo, RER, REL, cloroplastos, mitocondria, Golgi, ribosomas), cada uno con id, name, icon, subtitle, labelPos, description, functions[], structure y funFact. La geometría del diagrama también está dibujada manualmente en CellDiagram. NO usa gameDataService (ni getAppContent, ni getRoscoData, etc.) ni ninguna RPC de Supabase para el contenido.

**Integración.** Registro estándar en commonApps.js (appCelulaVegetal, component CelulaVegetal, lazy) y en esoApps.js / bachilleratoApps.js bajo 'biologia'. AppRunnerPage la monta con Suspense y le pasa onGameComplete/level/grade/subjectId, pero el componente NO acepta props ni invoca onGameComplete, por lo que NO reporta score, maxScore ni la nota /10 al backend. El único tracking real es el ciclo startSession (al montar) / abandonSession (al desmontar) de useGameTracker en AppRunnerPage; no se genera fila de partida con resultado en game_sessions ni se otorgan XP/insignias/avatares/ranking por jugar, pese a estar catalogada como single_mode en CLAUDE.md. Modos 'easy/medium/exam' del estándar de la plataforma NO existen aquí; los tres modos son Explorar/Test/Reto (con tres dificultades internas en Reto). No tiene duelo. Particularidad para mejoras: hay que cablear onGameComplete (en Test al cerrar/abandonar y en Reto tras Corregir, pasando score/maxScore/correctAnswers/totalQuestions/nota y un useRef anti-doble-disparo) para que cuente de verdad como single_mode; el SVG es pesado y enteramente manual, conviene no romper el mapeo de coordenadas de pan/zoom.

**Ideas de mejora.**
- Cablear onGameComplete: enviar la nota /10 del Reto y la puntuación del Test (con useRef anti-doble-disparo) para que la app cumpla de verdad su rol single_mode y otorgue XP, insignias, avatares y ranking.
- Añadir un botón de instrucciones reutilizando _shared/InstructionsModal y un modal de 'material de estudio' con el glosario de orgánulos (descripciones y funciones agrupadas), siguiendo el patrón de la plataforma.
- Enriquecer el modo Reto para usar las varias funciones de cada orgánulo (hoy solo functions[0]) y/o un modo examen formal con preguntas sobre fotosíntesis, turgencia y pared celular, además del simple emparejamiento.
- Lectura por voz (TTS) de descripciones y datos curiosos y mejoras de accesibilidad/teclado (navegación entre orgánulos sin ratón), ya que ahora todo depende de pointer events.

### Ficha de usuario

**¿Qué es?** La Célula Vegetal es una app interactiva donde se explora una célula de una planta dibujada con gran detalle. Sobre el diagrama puedes pinchar cada orgánulo (pared celular, cloroplastos, vacuola, núcleo, mitocondrias, aparato de Golgi y más) para descubrir qué es, qué funciones tiene, cómo es su estructura y un dato curioso. Además de explorar, ofrece dos juegos: uno para localizar orgánulos a contrarreloj de aciertos y otro para relacionar cada parte con su función. Incluye zoom y desplazamiento para verlo todo de cerca.

**¿Por qué es relevante?** Trabaja la biología celular de forma visual y manipulativa, justo donde el alumnado suele tener más dificultad: distinguir las estructuras propias de la célula vegetal (pared de celulosa, cloroplastos y fotosíntesis, gran vacuola y turgencia) frente a la animal. Al combinar exploración guiada con dos retos de identificación y de asociación estructura-función, refuerza el vocabulario científico, la observación y la memoria espacial, y convierte un contenido habitualmente memorístico en una actividad activa. La nota sobre 10 del modo Reto da una autoevaluación inmediata que ayuda a detectar lagunas, y el aprendizaje por descubrimiento (pinchar, leer, comprobar) consolida mejor que la simple lectura del libro. Encaja en Biología de ESO y Bachillerato.

**¿Cómo funciona?** La app tiene tres modos que se eligen con los botones de arriba. En Explorar pinchas los orgánulos y lees su ficha. En Test te pide encontrar un orgánulo concreto en el dibujo y sumas puntos por cada acierto. En Reto eliges dificultad (6, 9 o 12 parejas) y relacionas cada orgánulo con su función; al corregir obtienes una nota sobre 10 con confeti si apruebas. Puedes hacer zoom con la rueda y arrastrar para moverte por la célula.

**Cómo se juega.**
1. Empieza en el modo Explorar y pincha cualquier orgánulo del dibujo, de la barra inferior o de las etiquetas.
2. Lee su ficha (descripción, funciones, estructura y el dato curioso) y cierra el panel para seguir; tu progreso de orgánulos vistos aparece arriba.
3. Usa la rueda del ratón para acercarte y arrastra para moverte; pulsa el botón 1:1 para volver a la vista completa.
4. Cuando conozcas las partes, pulsa el botón Test: lee el orgánulo que te piden encontrar y pínchalo en el dibujo.
5. Acierta para sumar 10 puntos y avanzar al siguiente; si fallas, vuelve a intentarlo.
6. Para el modo Reto, elige la dificultad (Fácil 6, Normal 9 o Difícil 12 parejas).
7. Selecciona un orgánulo de la izquierda y luego la función correcta de la derecha; repite hasta asignarlas todas (puedes descartar una pareja con la X).
8. Pulsa Corregir para ver tu nota sobre 10 y, si quieres, usa Repetir para mejorar o Volver para salir.

**Modos.**
- **Explorar**: Modo libre para descubrir cada orgánulo y leer su descripción, funciones, estructura y un dato curioso, con barra de progreso de partes vistas.
- **Test**: La app te pide encontrar un orgánulo concreto y debes pincharlo en el dibujo; cada acierto suma 10 puntos.
- **Reto (Fácil 6 / Normal 9 / Difícil 12)**: Relaciona cada orgánulo con su función. Al corregir obtienes una nota sobre 10; el número de parejas marca la dificultad.

**Consejos.**
- Dedica un rato al modo Explorar antes de jugar: leer las fichas hace mucho más fácil acertar luego en Test y Reto.
- Usa el zoom y el arrastre para fijarte en los detalles de orgánulos pequeños como ribosomas, nucléolo o el aparato de Golgi.
- Fíjate en lo que diferencia a la célula vegetal de la animal (pared celular, cloroplastos y la gran vacuola): suele ser la clave de los exámenes.
- En el Reto, empieza por las funciones que tengas más claras y deja para el final las dudosas; puedes descartar una pareja si te equivocas.

---

## 🗺️ Infografías Interactivas `(infografias-interactivas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de estudio guiado: el alumno observa una infografía con zoom/pan y luego responde un test de opción múltiple sobre sus datos, obteniendo una nota /10. Es un único componente React (InfografiasInteractivas.jsx) con datos 100% locales en data/infografiasData.js; no usa Supabase para el contenido.

**Software.** Arquitectura mínima y autocontenida. Ficheros: src/apps/infografias-interactivas/InfografiasInteractivas.jsx (componente), InfografiasInteractivas.css (estilos) y data/infografiasData.js (catálogo estático de 15 infografías, cada una con título, subtítulo, imagen .webp en /images/infografias/, icono emoji, targets curso/asignatura, un array zones y 10 preguntas de opción múltiple con índice correct). Librerías: framer-motion (animaciones de tarjetas y del círculo de nota), canvas-confetti (celebración si nota>=7), lucide-react (iconografía). NO usa three/@react-three/fiber, ni TTS, ni sonidos. Reutiliza _shared/InstructionsModal (InstructionsModal + InstructionsButton). Estado por useState: phase (selector/study/quiz/summary), selectedInfo, quizAnswers (objeto índice->opción), results, zoom (1-3, paso 0.25), isFullscreen, testStartedAt. La fuente de datos es la función local getInfografiasFor(level, grade, subject) que filtra el array INFOGRAFIAS por targets; el componente NO consume gameDataService ni getAppContent. Puntuación: en submitQuiz cuenta aciertos comparando quizAnswers[i] === q.correct; total = nº de preguntas (10); nota = Math.round((correct/total)*100)/10 (cumple la fórmula del CLAUDE.md). durationSeconds desde testStartedAt. Anti-doble-disparo: un único useRef completedRef.current que protege el bloque de confeti + onGameComplete (se resetea al reiniciar la infografía). Detalle relevante: las utilidades normalizeAnswer e isZoneAnswerCorrect y el array zones (puntos x/y% con label y aliases) están definidos en el módulo de datos pero NO se importan ni usan en el componente — es andamiaje preparado para un futuro modo de etiquetado sobre la imagen, hoy código muerto. El visor de imagen implementa zoom (botones +/-/reset), pantalla completa (requestFullscreen sincronizado con fullscreenchange) y arrastre con ratón para hacer pan cuando hay desbordamiento (listeners mousedown/mousemove/mouseup/blur).

**Jugabilidad.** Bucle lineal de 4 fases. SELECTOR: rejilla de tarjetas con las infografías disponibles para el curso/asignatura; al pulsar una se pasa a STUDY. STUDY: visor de la imagen con barra de herramientas (zoom in/out, %, reset, pantalla completa) y arrastre para desplazar; banner que recuerda el nº de preguntas; botón 'Empezar examen'. QUIZ: lista de las 10 preguntas, cada una con 2-4 opciones etiquetadas A/B/C/D; el botón 'Enviar respuestas' permanece deshabilitado hasta responder a TODAS (allAnswered). SUMMARY: círculo grande con la nota /10 (color verde>=8, azul>=5, rojo<5; mensaje Excelente/Muy bien/Aprobado/Necesitas repasar), tarjetas de aciertos y tiempo, y revisión pregunta a pregunta con la respuesta dada y la solución correcta en los fallos. Controles: ratón/táctil (la barra y las opciones son botones); el pan es arrastre con clic izquierdo. No hay niveles de dificultad ni vidas ni temporizador con presión: solo se mide el tiempo empleado. Condición de 'victoria' implícita: aprobar (nota>=5); no hay derrota real, se puede repetir. Feedback: confeti solo si nota>=7; animación spring del círculo de nota. No hay efectos de sonido.

**Educativo.** Objetivo pedagógico: lectura comprensiva de representaciones visuales (infografías) y recuperación de información de un esquema. Entrena observación, alfabetización visual/gráfica, comprensión de procesos y vocabulario científico-técnico, y memoria a corto plazo (estudiar y luego responder sin la imagen delante). Cubre 15 temas transversales: ciclo del agua, fotosíntesis, estados de la materia, Pitágoras, leyes de Newton, cómo aprende una IA, sistema solar, ADN, célula, enlace químico, derivadas, integrales, electricidad, electromagnetismo, arquitectura de Internet, algoritmos y cambio climático. Encaje curricular: aparece en Primaria (Ciencias Naturales, Matemáticas), ESO (Biología, Física, Matemáticas, Tecnología, Programación, IA) y Bachillerato (todas las asignaturas la heredan vía appsBase, con contenidos como derivadas/integrales reservados a Bachillerato). Cada infografía declara sus targets (level + grades + subjects), por lo que el alumno solo ve las pertinentes a su curso y materia.

**Datos.** Datos 100% locales y hardcodeados en src/apps/infografias-interactivas/data/infografiasData.js (constante INFOGRAFIAS). No se consulta Supabase ni gameDataService.js ni getAppContent: el contenido (imágenes .webp, preguntas, opciones, respuesta correcta, targets) vive en el repositorio. La selección de qué infografías mostrar la resuelve getInfografiasFor(level, grade, subject), que filtra por coincidencia de level, inclusión del grade y de la asignatura (acepta 'general' o sin subject como comodín). Las imágenes se sirven desde /images/infografias/.

**Integración.** Modo único: siempre examen. submitQuiz llama onGameComplete con mode:'test', score=aciertos, maxScore=total, correctAnswers, totalQuestions, durationSeconds y nota explícita. Registrada en commonApps.js como appInfografiasInteractivas (id 'infografias-interactivas') y añadida a primariaApps, esoApps y bachilleratoApps (esta última vía appsBase, presente en casi todas las materias). NO está en duelableApps.js: no soporta duelo 1 vs 1. AppRunnerPage envuelve onGameComplete: aplica el multiplicador de dificultad por curso (1.0-2.1) a score/maxScore antes de trackGameSession, que dispara XP, insignias, avatares y ranking (upsert_high_score / get_app_ranking) y crea la fila en game_sessions. El texto del modal de ayuda dice 'Modo único: cada infografía completada cuenta como tarea', pero NO se ha encontrado registro de single_mode en app_scoring_config dentro del código del repo (es comportamiento de facto: toda partida es 'test'). Particularidades para mejoras: como cada infografía manda solo el mismo maxScore=10 sin puntos paralelos (tiempo/racha), no hay la doble progresión que recomienda el CLAUDE.md; el tracking usa el flujo estándar de useGameTracker (una fila por partida, sin reutilizar session_id).

**Ideas de mejora.**
- Activar el modo de etiquetado sobre la imagen ya esbozado en los datos (zones + isZoneAnswerCorrect + normalizeAnswer): arrastrar o escribir etiquetas en los puntos numerados antes del test, aprovechando el código ya existente pero hoy sin usar.
- Añadir puntos paralelos (bonus por tiempo/racha) y enviarlos en score/maxScore para cumplir la doble progresión del CLAUDE.md y dar más recorrido al ranking, hoy limitado a un maxScore fijo de 10.
- Migrar el catálogo a contenido editable por Supabase (getAppContent) para que profesorado o admin pueda crear nuevas infografías sin desplegar código, e incorporar más temas de Lengua, Historia y Geografía (hoy el catálogo es muy STEM).
- Mejorar accesibilidad y feedback: lectura por voz (TTS) de la pregunta y de la solución, barajado de opciones y de preguntas para evitar memorización del orden, y revisión que enlace cada fallo con la zona concreta de la infografía.

### Ficha de usuario

**¿Qué es?** Infografías Interactivas es una actividad de estudio y repaso. Primero observas una infografía a pantalla completa (puedes acercar la imagen, alejarla y desplazarte por ella para fijarte en los detalles) y, cuando te sientes preparado o preparada, respondes a un test de diez preguntas sobre lo que muestra. Al terminar obtienes tu nota sobre diez y una corrección pregunta a pregunta. Hay infografías de muchos temas: ciclo del agua, fotosíntesis, célula, sistema solar, ADN, Pitágoras, leyes de Newton, electricidad, derivadas o cambio climático, entre otros.

**¿Por qué es relevante?** Saber leer una infografía es hoy una competencia básica: gran parte de la información que recibimos llega en forma de esquemas, diagramas y gráficos. Esta app entrena precisamente esa alfabetización visual, además de la comprensión de procesos, el vocabulario científico-técnico y la capacidad de retener y recuperar información (estudias la imagen y luego respondes sin tenerla delante, lo que refuerza la memoria activa). Conecta con las competencias STEM, digital y de aprender a aprender del currículo. Funciona pedagógicamente porque separa el momento de estudio del de evaluación, dando autonomía al alumnado para mirar con calma, y porque la corrección final con la solución de cada error convierte el examen en una oportunidad de aprendizaje, no solo en una calificación. Cada alumno ve únicamente las infografías adecuadas a su curso y asignatura.

**¿Cómo funciona?** Eliges una infografía de tu asignatura entre las disponibles. Se abre el visor, donde puedes ampliar la imagen, moverte por ella y verla a pantalla completa todo el tiempo que necesites. Cuando lo tengas claro, pulsas para empezar el examen y respondes a diez preguntas de opción múltiple. La app calcula tu nota sobre diez según los aciertos, muestra el tiempo empleado y repasa contigo cada pregunta indicando la respuesta correcta. Puedes repetir la misma infografía o elegir otra.

**Cómo se juega.**
1. Pulsa el botón de ayuda (?) si quieres leer las instrucciones antes de empezar.
2. Elige una infografía de tu asignatura en la pantalla inicial.
3. Estudia la imagen con calma: usa los botones de zoom para acercarla o alejarla y arrastra con el ratón para desplazarte; el botón de pantalla completa te da más espacio.
4. Cuando te sientas preparado o preparada, pulsa 'Empezar examen'.
5. Lee cada una de las diez preguntas y selecciona la opción que creas correcta (A, B, C o D).
6. Responde a todas las preguntas: el botón de enviar se activa cuando no queda ninguna en blanco.
7. Pulsa 'Enviar respuestas' para ver tu nota sobre diez y el mensaje según tu resultado.
8. Revisa la corrección pregunta a pregunta para aprender de los fallos y ver la solución correcta.
9. Si quieres mejorar, pulsa 'Repetir esta infografía' o elige otra para seguir practicando.

**Modos.**
_Sin modos diferenciados._

**Consejos.**
- Dedica tiempo de verdad a la fase de estudio: amplía las zonas con texto pequeño y fíjate en los números y nombres de cada parte, porque luego no tendrás la imagen delante.
- Usa la pantalla completa para ver los detalles más finos sin distracciones.
- No tengas prisa al enviar: revisa que todas las respuestas reflejan lo que recuerdas de la infografía.
- Aprovecha la corrección final para releer las preguntas falladas; repetir la infografía después suele subir bastante la nota.

---


# 🤖 Programación y robótica

## 🤖 Programa al Robot (bloques) `(programacion-bloques)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Editor de programación visual por bloques (estilo Scratch) en el que el alumnado arrastra instrucciones para guiar a un robot por una cuadrícula con obstáculos. Está construido como un componente React autónomo con un motor de simulación e intérprete propios (sin librerías de bloques externas tipo Blockly) y transpiladores que muestran el mismo programa en Python, Java y C.

**Software.** Componente raíz: src/apps/programacion-bloques/ProgramacionBloques.jsx. Arquitectura modular con ficheros locales: pbBlocks.js (catálogo de 23 bloques con kind/label/category/minGrade/tpl/fields/slots, SENSORS, categorías y colores estilo Scratch, helpers newNode/cloneNode/blocksForGrade y mapeo grade->gradeId), pbEngine.js (tokenizer + parser Pratt de expresiones con precedencias, evaluador con scopes encadenados, simulador del robot que produce un 'trace' de pasos {kind, robot, itemStacks, crates}, y tres transpiladores toPython/toJava/toC), pbLevels.js (120 niveles fijos = 10 por curso x12 cursos + retos por curso, helpers getLevels/getRetos/checkLevel, mundos definidos con un helper W()), pbLevelsService.js (CRUD de niveles de usuario vía RPCs Supabase robot_level_*), LevelEditor.jsj, Robot.jsx y PixelTiles.jsx (tiles SVG/pixel-art por bioma). Estado con useState/useRef/useMemo/useCallback puro de React (no hay store global). El programa es un árbol de nodos {id,kind,fields,slots}; las operaciones onAdd/onField/onRemove/onMove navegan el árbol por 'path' (índices pares=arrays, impares=slots) con funciones puras extractPath/insertPath/movePath; soporta arrastre cross-panel entre 'body' (programa principal) y 'defs' (definiciones de funciones/procedimientos, visible solo desde 3º ESO, gradeId>=9) usando queueMicrotask para coordinar los dos setters. Drag&drop nativo HTML5 (dataTransfer + dragRef module-level), sin librería. La ejecución anima el trace con setInterval a 240ms; el láser se muestra 420ms con setTimeout. Iconos de lucide-react; NO usa framer-motion, canvas-confetti, three/r3f ni TTS. Puntuación: score = nivelesSuperados*50 + timeBonus; maxScore = nº niveles*50 (+ presupuesto de tiempo en examen). En examen hay bonus de rapidez (TIME_BUDGET_PER_LEVEL=90s, SPEED_COEF=2, timeBonus = max(0,(90-elapsedSec)*2)). La nota /10 NO se calcula en el componente: se delega en useGameTracker.calculateNota (correctAnswers/totalQuestions*10, tope 10) ya que onGameComplete envía correctAnswers=nivelesSuperados y totalQuestions=levels.length sin pasar 'nota' override. Anti-doble-disparo: reportedRef (useRef Set de ids de nivel ya reportados) garantiza un único onGameComplete por nivel superado; se resetea en startMission/playCustom. Limpieza de timers (playTimerRef, laserTimerRef) en reset/run/goMenu.

**Jugabilidad.** Bucle: el alumno elige modo en el menú, llega a una misión con tablero (columna izquierda), área 'Mi programa' + controles (centro) y paleta de bloques por categorías (derecha). Arrastra o hace clic en bloques de la paleta (Movimiento: avanzar/girar/media vuelta; Acciones: recoger/disparar láser; Bucles: repetir N, mientras sensor, repetir hasta meta, for, while expr; Condiciones: si/si-no por sensor o expresión; Variables: crear/asignar/constante; Funciones: procedimientos y funciones con parámetros y return), rellena campos (números, selects de sensor/operador, expresiones de texto) y pulsa Ejecutar. El robot se anima paso a paso; al terminar checkLevel valida que llegó a la meta, recogió todas las energías y (si aplica) que no chocó/cayó. Controles: ratón (drag&drop, clic en bloques, papelera por bloque, Reiniciar/Vaciar); navegación de niveles con flechas; botón Ver código abre modal con pestañas Python/Java/C y Copiar. El sensor de errores devuelve mensajes claros (choque contra muro, agua, caja sin destruir, caída en agujero, bucle infinito tras MAX_STEPS=3000). Modos: Fácil (rejilla siempre visible), Normal (10 misiones con todos los bloques del curso), Examen (sin ayudas, rejilla oculta, nota /10 + bonus rapidez), Reto (5 niveles muy difíciles por curso). Feedback visual: 'Nivel superado'/'Intenta otra vez', botón Siguiente, banner de error; NO hay confeti ni sonidos. Obstáculos por bioma: muros, agua, agujeros, cajas (destruibles con láser) y pilas de energía (×N).

**Educativo.** Objetivo pedagógico: introducir el pensamiento computacional y los fundamentos de la programación estructurada (secuencia, iteración, selección, descomposición en subrutinas, variables y expresiones) de forma manipulativa y progresiva. Entrena: razonamiento algorítmico y lógico, anticipación/simulación mental, depuración (probar-fallar-corregir), abstracción y reutilización (procedimientos/funciones), y alfabetización en sintaxis real al ver el mismo algoritmo transpilado a Python, Java y C. Encaje curricular: cubre TODOS los cursos de Primaria (1º-6º), ESO (1º-4º) y Bachillerato (1º-2º); la disponibilidad de bloques escala por edad mediante minGrade (1º Prim: solo movimiento; 2º: repetir; 3º: recoger; 5º: condiciones/láser; 6º: si/si-no; 1º ESO: while/until; 2º: bucles anidados; 3º ESO: procedimientos; 4º: variables/expresiones; 1º Bach: funciones con parámetros y return; 2º Bach: algoritmos avanzados como wall-follower, backtracking y cobertura). Encaja en programación, tecnología, robótica y matemáticas. Aparece en Primaria y ESO dentro de la asignatura 'programacion' y en Bachillerato en 'appsProgramacion' (Infografías, Programación por bloques, Terminal Retro).

**Datos.** NO usa gameDataService ni getAppContent. Todo el contenido educativo (los 120 niveles del currículo + retos) es estático y vive en el propio módulo pbLevels.js (constantes PRIMARIA/ESO/BACH y RETOS_*), con mundos definidos por el helper W(). El catálogo de bloques está en pbBlocks.js. La única fuente externa son los NIVELES CREADOS POR USUARIOS, que se guardan/leen en Supabase (tabla robot_user_levels) vía pbLevelsService.js con RPCs robot_level_create/update/delete/list_mine/list_shared/increment_plays, dependientes de la sesión (useAuth: student o teacher).

**Integración.** Modos disponibles: easy, normal, examen y reto (4 tarjetas en el menú), más 'custom' para jugar niveles propios/compartidos. Solo el modo Examen reporta mode:'test' a onGameComplete (cuenta para tarea); easy/normal/reto/custom reportan mode:'practice'. NO está registrada como single_mode en app_scoring_config ni como app de duelo (no aparece en duelableApps.js, no monta DuelChatBar). Tracking: el componente NO usa useGameTracker directamente; recibe onGameComplete de AppRunnerPage (que sí monta useGameTracker, aplica el multiplicador de curso al score, persiste game_sessions + high_scores y dispara gamificación/insignias/avatares/ranking). Está en WIDE_APP_IDS de AppRunnerPage (layout ancho). Particularidades a tener en cuenta: (1) onGameComplete se dispara UNA vez por nivel superado (reportedRef), por lo que cada nivel ganado genera un evento de tracking independiente y, en práctica, varias sesiones por partida; correctAnswers crece monotónicamente con reportedRef.size pero totalQuestions=levels.length, así la 'nota' parcial que calcula useGameTracker sube nivel a nivel. (2) En examen la rejilla se oculta y se añade timeBonus por rapidez al score (no a la nota, que sigue topada a 10). (3) checkLevel admite un level.check personalizado, items en pilas 'x,y:N' y flag opcional requireAllCratesDestroyed. (4) usa window.confirm y window.alert (saveEditor/removeLevel), lo que VIOLA la regla del proyecto de no usar diálogos nativos del navegador.

**Ideas de mejora.**
- Sustituir los window.confirm/window.alert de guardar/borrar niveles (saveEditor, removeLevel) por modales propios con motion.div, como exige CLAUDE.md, para coherencia y para no romper la UX en móvil.
- Añadir una pantalla de Resumen real en modo examen con la nota /10 prominente y coloreada (verde>=8 / azul>=5 / rojo<5) y mensaje cualitativo, en lugar de depender solo del banner por nivel; hoy no hay summary y el contrato de nota /10 del proyecto se cumple de forma implícita.
- Soporte de duelo 1 vs 1 (componente ProgramacionBloquesDuel + registro en duelableApps + DuelChatBar): por ejemplo, resolver el mismo nivel en menos bloques o menos tiempo, aprovechando que el motor ya es determinista y produce un trace y un conteo de pasos.
- Soporte táctil/teclado para el drag&drop (actualmente solo HTML5 drag nativo, poco usable en tabletas) y un control de velocidad de la animación (240ms fijo) para acelerar/pausar la ejecución y facilitar la depuración.

### Ficha de usuario

**¿Qué es?** Programa al Robot es un taller de programación con bloques, parecido a Scratch, donde el alumnado guía a un robot por un tablero con muros, agua, agujeros, cajas y energías que recoger. En lugar de escribir código, se arrastran piezas de colores (avanzar, girar, repetir, condiciones, variables y funciones) para construir el programa. Al pulsar Ejecutar, el robot se mueve siguiendo esas órdenes. Además, en cualquier momento se puede ver ese mismo programa traducido a Python, Java y C.

**¿Por qué es relevante?** Trabaja el pensamiento computacional, una de las competencias clave del currículo actual: secuenciar pasos, repetir con bucles, decidir con condiciones, descomponer un problema en funciones y usar variables. Al ser visual y manipulativo, el alumnado aprende programación sin frustrarse con la sintaxis, y depura su propio razonamiento probando, fallando y corrigiendo (ensayo-error guiado). Los bloques disponibles crecen con la edad, de modo que un niño de 1º de Primaria solo mueve y gira, mientras que en Bachillerato se enfrenta a algoritmos avanzados. Ver el programa traducido a Python, Java y C tiende un puente natural hacia la programación con código real y muestra que un mismo algoritmo se expresa en cualquier lenguaje. Desarrolla lógica, abstracción, anticipación y resolución de problemas, destrezas transferibles a matemáticas, tecnología y robótica.

**¿Cómo funciona?** Cada curso tiene 10 misiones progresivas (más retos) en escenarios que cambian de bioma: pradera, bosque, montaña, ciudad y centro de datos. El alumno arrastra bloques al área 'Mi programa', ajusta sus valores (cuántas veces repetir, qué sensor comprobar, qué condición) y pulsa Ejecutar para ver al robot moverse paso a paso. El juego comprueba si ha llegado a la meta y recogido todas las energías; si choca, cae o se queda corto, avisa para reintentar.

**Cómo se juega.**
1. Elige un modo en el menú (Fácil, Normal, Examen o Reto) o entra directamente en una misión del curso.
2. Lee el objetivo de la misión (arriba) y observa el tablero: dónde está el robot, la meta y los obstáculos.
3. Desde la paleta de la derecha, arrastra los bloques que necesites al área 'Mi programa' (también puedes hacer clic para añadirlos al final).
4. Rellena los campos de cada bloque: número de repeticiones, sensor o condición a comprobar, valor de una variable, etc.
5. Pulsa 'Ejecutar' y mira cómo se mueve el robot siguiendo tu programa.
6. Si no llega o choca, lee el aviso, usa 'Reiniciar' para volver a empezar o 'Vaciar' para rehacer el programa, y prueba de nuevo.
7. Cuando superes el nivel, pulsa 'Siguiente' para pasar a la siguiente misión.
8. Si quieres, abre 'Ver código' para descubrir tu programa escrito en Python, Java y C.
9. Anímate a crear tu propio nivel y a compartirlo con la clase, o juega los de tus compañeros.

**Modos.**
- **Fácil**: La rejilla del tablero siempre está visible y hay pistas claras. Ideal para empezar.
- **Normal**: Desafío estándar: 10 misiones progresivas con todos los bloques propios del curso.
- **Examen**: Completa las 10 misiones sin ayudas y con la rejilla oculta; tu nota se calcula sobre 10 y hay bonus por rapidez.
- **Reto**: Una tanda de niveles muy difíciles diseñados para tu curso, solo para expertos.
- **Mis niveles / De mis compañeros**: Diseña tus propios mapas con el editor y juégalos, o prueba los niveles que ha compartido tu clase.

**Consejos.**
- Antes de ejecutar, recorre el camino con el dedo o imagina los pasos del robot: te ahorrará muchos intentos.
- Cuando repitas la misma secuencia varias veces, usa el bloque 'repetir' o crea un procedimiento en lugar de copiar bloques: tu programa será más corto y claro.
- Si te atascas, abre 'Ver código' para entender qué está haciendo realmente tu programa paso a paso.
- Aprovecha el editor para crear un nivel y retar a tus compañeros: diseñar problemas también enseña a resolverlos.

---

## 🤖 Programa al Robot (misiones) `(misiones-roboticas)`

### Ficha interna (técnica / pedagógica)

**Resumen.** App de programación visual por bloques tipo puzzle (estilo Blockly/Scratch ligero) en la que el alumno programa a un robot sobre una rejilla 8x8 para que llegue a una meta, recoja cristales y evite muros y agujeros. Es un componente React autónomo (MisionesRoboticas.jsx) con su propio intérprete de bloques y motor de simulación, datos de misiones servidos desde Supabase con fallback local.

**Software.** Componente principal src/apps/misiones-roboticas/MisionesRoboticas.jsx (~1500 líneas), con datos en misionesData.js y capa de servicio robotMissionsService.js. Librerías: framer-motion (animación del robot con spring, ghost de arrastre, overlays de modales, AnimatePresence de feedback/resultado), canvas-confetti (celebración en éxito de misión, reto y desbloqueo de insignia), lucide-react (iconografía). NO usa three/@react-three/fiber ni TTS: el tablero es 2D con divs/emojis posicionados absolutamente (CELL_PX 48 / 34 móvil vía hook useResponsiveCell). Estado: todo con useState/useRef locales (program como árbol de bloques, world, robot, itemsRemaining como Set, drag, examResults, etc.); no Redux ni contexto propio salvo useAuth para identificar al usuario. Motor: BLOCK_DEFS define el catálogo (move, turnL, turnR, turn180, pick, repeat, while, if, ifelse); el programa es un árbol de nodos con bodies anidables; helpers puros (deepCloneTree, detachChainFromBlock, insertChainAt, removeBlockById, setBlockField, countAllBlocks) manipulan el árbol de forma inmutable. El intérprete simulate() ejecuta el árbol recursivamente generando una lista de 'steps' que luego se animan con setTimeout (220ms/paso); guardas anti-bucle-infinito (MAX_STEPS=800, guard en while, repeat capado a 50). Drag & drop propio implementado con pointer events globales (pointermove/up/cancel), umbral DRAG_THRESHOLD=4, detección de drop zone por distancia vertical (SNAP_MAX_DIST=180), ghost que sigue el cursor y marcador de inserción fixed; bloquea userSelect/touchAction durante el arrastre. Puntuación/nota: missionScoreRatio(r) = 0 si falla, 1 si blocksUsed<=suggested, si no max(0.3, suggested/blocksUsed). En examen (finishExam) la nota /10 = media de ratios de las 10 misiones × 10 (Math.round(avg*100)/10); en reto, nota = ratio*10. Puntos paralelos para ranking sin tope: examen score = avg*total*120 + perfectos*40 + timeBonus (max(0,900-segs)*2), maxScore = total*120+total*40+1800; reto score = ratio*240 sobre 240. Anti-doble-disparo: completedRef (useRef bool) protege onGameComplete; se resetea en cada start (startPractice/startExam/startReto/restart). OJO: el summary recalcula y MUESTRA la nota como solved/total*10 (porcentaje de misiones resueltas), distinto de la nota que se ENVÍA en onGameComplete (media de ratios de optimización) — hay una discrepancia entre la nota visible y la enviada.

**Jugabilidad.** Bucle: el alumno elige modo en la intro, arrastra bloques de la paleta al área 'Mi programa', configura parámetros (nº de repeticiones, condición del sensor en if/while), pulsa Ejecutar y ve al robot animarse paso a paso por la rejilla. Controles 100% puntero (ratón/táctil) vía pointer events; los inputs number/select de los bloques se editan con teclado/clic. Cuatro modos: Fácil (pista siempre visible), Medio (pista opcional contabilizada con hintsUsed), Examen (10 misiones seguidas, sin ayudas, cronómetro, nota /10) y Reto (nivel aleatorio de alta dificultad del pool del curso, nota por optimización + registro en Supabase). Victoria: alcanzar la meta vivo + recoger los ítems requeridos (collectItems) + cumplir noDeath si aplica + sin error. Derrota/errores: choque contra muro ('bump'), caída en agujero ('fall', fin de partida), bucle infinito (MAX_STEPS), o no llegar/no recoger. Feedback: confeti en éxito (90 partículas misión, 120 reto, 200 al desbloquear insignia), mensajes contextuales de error, marcador de bloques usados vs sugeridos en el HUD. No hay sonido/TTS.

**Educativo.** Objetivo: introducir el pensamiento computacional y la programación visual sin sintaxis. Destrezas: secuenciación de instrucciones, descomposición de problemas, bucles (Repetir N, Mientras), condicionales con sensores (puede avanzar, hay obstáculo, hay ítem, en/no en la meta), abstracción y optimización de código (la nota premia usar menos bloques). El catálogo de bloques es progresivo por curso (GRADE_BLOCKS): 1º ESO solo movimiento + repeat + pick; 2º añade if y turn180; 3º y 4º añaden while e ifelse, con laberintos, agujeros y objetivos múltiples. Encaje curricular ESO: Tecnología/Tecnología y Digitalización (programación, algoritmos, robótica) y Matemáticas (razonamiento lógico). Cubre los 4 cursos de ESO (grade 1-4), 10 misiones normales + 5 retos por curso.

**Datos.** NO usa gameDataService.js ni getAppContent. Datos propios del módulo: misionesData.js (constantes locales: GRADE_BLOCKS, CONDITIONS, MISSIONS_BY_GRADE con 10 misiones/curso, RETO_MISSIONS_BY_GRADE con 5 retos/curso, prepareWorld que parsea el grid textual a Sets de walls/holes/items + target + robot). En runtime las misiones se cargan desde Supabase vía robotMissionsService.js: fetchNormalMissions -> RPC get_robot_missions(p_level='eso', p_grade, p_kind='normal'); pickRandomReto -> get_robot_missions kind='reto'; con caché en memoria y FALLBACK a los datos locales si la RPC falla o no devuelve filas (adaptRow mapea slug/title/grid/start_dir/objectives/suggested_blocks). recordRetoCompletion -> RPC record_robot_reto registra el reto superado y devuelve new_badges/distinct_retos/total_retos.

**Integración.** Modos: easy/medium se reportan a onGameComplete con mode:'practice' (score/maxScore 0, sin nota) solo al terminar las 10 misiones; examen y reto reportan mode:'test' con nota /10, score/maxScore para ranking. NO es single_mode ni está en app_scoring_config como tal; NO tiene duelo (no figura en duelableApps.js). NO usa useGameTracker directamente: recibe onGameComplete e isPaused por props desde AppRunnerPage (que monta el tracking). Particularidad de tracking del reto: además de onGameComplete, llama a su propia RPC record_robot_reto con userId/userType resueltos de useAuth (funciona también para teacher), con su propio sistema de insignias por curso (progreso x/5 retos). Está en WIDE_APP_IDS de AppRunnerPage (layout ancho). PROBLEMA DE REGISTRO: appMisionesRoboticas está definido y exportado en commonApps.js e IMPORTADO en esoApps.js (línea 12), pero NO está añadido a ninguna lista de asignaturas (p.ej. 'tecnologia'), por lo que actualmente no aparece en el catálogo de apps de ESO. La intro habla de '10 misiones' pero el InstructionsModal interno aún dice '5 misiones del curso' (texto desactualizado). La nota mostrada en el summary (solved/total) no coincide con la nota enviada (media de ratios de optimización).

**Ideas de mejora.**
- Registrar la app en las listas de asignatura de esoApps.js (Tecnología/Matemáticas) — hoy se importa pero no se inserta, así que no es visible en el catálogo.
- Unificar la nota: el summary muestra solved/total·10 mientras onGameComplete envía la media de ratios de optimización; mostrar la misma nota que se computa y se reporta para evitar confusión al alumno y al docente.
- Añadir ejecución paso a paso / depuración (botón 'paso a paso', velocidad ajustable, resaltado del bloque en ejecución) y control de pausa real ligado a isPaused durante la animación, hoy no se usa para frenar la simulación.
- Soporte de duelo 1 vs 1 (DuelComponent + entrada en duelableApps con DuelChatBar) o batalla de optimización, dado que la mecánica de 'menos bloques = más nota' encaja muy bien con un pique competitivo; y corregir el texto desactualizado del modal de instrucciones (sigue diciendo 5 misiones).

### Ficha de usuario

**¿Qué es?** Programa al Robot es una app de programación con bloques visuales. Sobre un tablero cuadriculado aparece un robot que tiene que llegar a una meta, recoger cristales y esquivar muros y agujeros. El alumnado no escribe código: arrastra y encaja piezas tipo puzzle (avanzar, girar, recoger, repetir, mientras, si…/si no) para construir el programa del robot. Al pulsar Ejecutar, el robot se mueve siguiendo las instrucciones y se ve al instante si el plan funciona. Hay 10 misiones por curso de ESO, con dificultad creciente.

**¿Por qué es relevante?** Es una introducción sólida al pensamiento computacional, una de las competencias clave del currículo de Tecnología y Digitalización de la ESO. Trabajar con bloques elimina la barrera de la sintaxis y permite centrarse en lo importante: descomponer un problema, ordenar pasos, repetir acciones con bucles y tomar decisiones con condicionales y sensores. Funciona pedagógicamente porque el alumnado aprende probando: ejecuta, ve el resultado, detecta el error y corrige, en un ciclo rápido de ensayo y mejora. Además, la nota premia resolver con el menor número de bloques, lo que fomenta la abstracción y la elegancia del código, no solo acertar. La dificultad y los bloques disponibles crecen curso a curso, acompañando el desarrollo del razonamiento lógico.

**¿Cómo funciona?** El alumno elige un modo y se le presenta una misión con su tablero. Arrastra bloques desde la paleta de la izquierda hasta la zona de programa, los encaja como piezas de puzzle y, en los bloques de bucle o decisión, ajusta cuántas veces se repiten o qué sensor comprueban. Al pulsar Ejecutar, el robot recorre la rejilla paso a paso. Si llega a la meta, recoge los cristales pedidos y no cae en ningún agujero, la misión se supera con confeti. En examen y reto, la nota depende de lo optimizado que sea el programa.

**Cómo se juega.**
1. Elige un modo en la pantalla inicial: Fácil, Medio, Examen o Reto.
2. Lee la misión: a dónde tiene que llegar el robot, cuántos cristales recoger y qué evitar.
3. Arrastra bloques desde la paleta (Avanza, Gira, Recoger, Repetir, Mientras, Si…) hasta tu programa y encájalos en orden.
4. En los bloques de Repetir ajusta el número de veces, y en Si/Mientras elige el sensor (por ejemplo, hay obstáculo delante o hay un ítem aquí).
5. Arrastra los bloques de bucle o decisión para anidar otros dentro de sus huecos.
6. Pulsa Ejecutar y observa cómo se mueve el robot por el tablero.
7. Si choca, cae o no llega, lee el aviso, pulsa Reiniciar, corrige tu programa y vuelve a probar.
8. Cuando lo resuelvas, pasa a la siguiente misión; intenta usar los menos bloques posibles para sacar más nota.
9. Pulsa Vaciar para borrar todo el programa y empezar de cero, o el botón de ayuda para repasar cómo se juega.

**Modos.**
- **Fácil**: La pista de la misión está siempre visible y recibes feedback claro al ejecutar. Ideal para empezar.
- **Medio**: Sin pista visible; puedes pedirla, pero cada vez que la usas se cuenta. Más autonomía.
- **Examen**: Las 10 misiones del curso seguidas, sin ayudas y con cronómetro. Nota sobre 10 según lo optimizado que sea tu código.
- **Reto**: Un nivel aleatorio mucho más difícil. Resuélvelo con la menor cantidad de bloques posible; suma insignias del curso.

**Consejos.**
- Antes de poner bloques, planifica mentalmente el recorrido del robot casilla a casilla.
- Si repites varias veces la misma acción, usa un bloque Repetir en lugar de muchos Avanza: gastas menos bloques y subes la nota.
- Usa los sensores (hay obstáculo, hay un ítem) con Si y Mientras para que el robot decida solo y tu programa sirva aunque cambie el mapa.
- Ejecuta a menudo: ver al robot moverse te ayuda a localizar dónde se tuerce el plan.

---

## 🤖 Laboratorio de Robótica `(laboratorio-robotica)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Simulador 2D de circuitos electrónicos y Arduino: el alumno conecta cables entre los pines de componentes sobre un lienzo con zoom/pan/arrastre. Componente React monolítico (LaboratorioRobotica.jsx, ~1675 líneas) con datos de ejercicios y plantillas de componentes embebidos en roboticaData.js y persistencia del Modo libre en robotLabDesignsService.js.

**Software.** Arquitectura: un único componente funcional LaboratorioRobotica.jsx más roboticaData.js (COMPONENT_TEMPLATES con 18 tipos de componente -batería, LED, LED2, RGB, zumbador, motor, servo, interruptor, pulsador, potenciómetro, LDR, NTC, PIR, IR, ultrasonidos, resistencia 220Ω/10kΩ, Arduino UNO, puente H- y EXERCISES_BY_GRADE) y robotLabDesignsService.js (persistencia del Modo libre). Librerías: framer-motion (animaciones de tarjetas/modales/feedback), canvas-confetti (acierto), lucide-react (iconos). NO usa three/@react-three/fiber: todo se dibuja con divs/CSS y los cables son SVG con curvas Bézier (wirePath) o polilíneas con waypoints (polylinePath), más un algoritmo computeWireOffsets para abrir en abanico los cables que comparten pin. Audio: zumbadores generados con Web Audio API (osciladores square ~700Hz, gestión por buzzerNodesRef + audioCtxRef, sin TTS ni ficheros de sonido). Estado: useState/useRef/useMemo locales (no Redux/Context salvo useAuth para identificar usuario en Modo libre). El motor de circuito (buildCircuitGraph + analyzeCircuit) es un BFS sobre el grafo de pines que calcula qué componentes quedan 'encendidos' (fuentes HIGH 5V/batería+/OUT de sensor, sumideros LOW GND/batería−) para el feedback visual y el sonido. IMPORTANTE: la corrección NO usa ese motor, sino comparación topológica del conjunto de pares de pines del alumno (userSet) contra exercise.target (targetSet). Nota /10 en examen: ratio = totalCorrect/totalTargets, con penalización suave por cables sobrantes (min(extra·0,05, 0,3)); nota = round(max(0, ratio·(1-penalty))·100)/10. Puntos paralelos: score = correct·100 + timeBonus (max(0,300-secs)·2) + perfectBonus (ejercicios perfectos·100); maxScore = exercises.length·400. Anti-doble-disparo: completedRef (useRef bool) protege onGameComplete tanto en finishExam como en nextExercise.

**Jugabilidad.** Bucle: pantalla intro con 4 tarjetas (Fácil/Medio/Examen/Libre) y listado de ejercicios → pantalla de juego con el tablero (BOARD_W 820 x BOARD_H 480) → summary. Controles 100% ratón/táctil mediante pointer events: clic en un pin inicia cable y clic en otro pin lo cierra; clic en el vacío con cable en curso añade un waypoint; clic derecho quita el último waypoint o cancela; clic sobre un cable lo borra (salvo en examen). Arrastre de componentes, pan del lienzo arrastrando el vacío y zoom con rueda centrado en el cursor (0,4x–2,5x) más botones de zoom/reset. Teclado: Escape cancela el cable en curso; Suprimir/Backspace borra el componente seleccionado en Modo libre. Componentes interactivos: interruptor (toggle), pulsador (mantener pulsado), potenciómetro (3 posiciones), sensores PIR/IR (simular detección). Victoria de ejercicio (práctica): conjunto de cables idéntico al target (sin faltar ni sobrar) → confeti + mensaje y botón Siguiente. En examen no hay validación intermedia: se encadenan los ejercicios del curso y se puntúan al final. Feedback: banner de éxito/error/aviso (framer-motion), confeti, sonido de zumbador por Web Audio (silenciable) y animaciones CSS de LEDs/motor/servo/ondas del zumbador.

**Educativo.** Objetivo pedagógico: introducir la electrónica básica y el control con Arduino de forma visual y manipulativa. Destrezas: lectura de esquemas, identificación de componentes y sus terminales (ánodo/cátodo, VCC/GND/señal), conexiones en serie y paralelo, función de resistencias limitadoras y divisores de tensión, uso de sensores (LDR, NTC, PIR, IR, ultrasonidos) y actuadores (LED, RGB, zumbador, motor, servo), y nociones de pines digitales/analógicos y PWM del Arduino UNO. Progresión por curso: ESO 1º circuitos con pila (LED, interruptor, serie/paralelo, motor, timbre); ESO 2º resistencias, LDR/NTC, potenciómetro, ramas combinadas; ESO 3º-4º Arduino (Blink, pull-down, RGB por PWM, servo+potenciómetro, ultrasonidos, PIR, puente H, robot seguidor de línea, sistemas de seguridad). Encaje curricular: Tecnología y Digitalización / Tecnología de la ESO. Solo aparece en ESO (param grade, etiqueta 'ESO Nº', registrada exclusivamente en esoApps.js bajo la asignatura 'robotica'); no está en Primaria, Bachillerato ni Atención a la Diversidad.

**Datos.** Contenido 100% local del propio módulo, NO usa gameDataService ni getAppContent: los ejercicios salen de EXERCISES_BY_GRADE en roboticaData.js (getExercises(grade), con fallback a grade '1'), donde cada ejercicio define components, target (pares de pines normalizados con pair()), title, description y hint. Las plantillas de componentes (geometría, pines, color, icono) están en COMPONENT_TEMPLATES. La única dependencia de backend es el Modo libre: robotLabDesignsService.js persiste diseños vía RPCs de Supabase (list/save/delete_robot_lab_design) cuando hay alumno o docente autenticado (useAuth), con fallback a localStorage (clave rob_lab_designs_v1) si no hay sesión.

**Integración.** Modos: easy, medium y exam (selección previa en la intro, sin tabs durante la partida) más un 'libre' propio (sandbox sin puntuación). NO es single_mode: solo el examen llama a onGameComplete con mode:'test' (nota, score, maxScore, correctAnswers=ejercicios perfectos, totalQuestions=nº ejercicios, durationSeconds). La práctica al terminar dispara onGameComplete con mode:'practice' y score/maxScore a 0 (no cuenta como intento de examen). El Modo libre nunca llama a onGameComplete. Tracking: vía onGameComplete → AppRunnerPage/useGameTracker → gamification_process_session (XP, insignias, ranking automáticos con multiplicador de curso). El ranking se alimenta del score paralelo del examen. NO soporta duelo 1 vs 1 (no está en duelableApps.js, no monta DuelChatBar). Particularidades para mejoras: (1) la app está marcada como WIDE_APP en AppRunnerPage; (2) hay incoherencia entre la descripción del config ('5 ejercicios por curso' en commonApps.js) y los textos de la intro ('10 ejercicios') frente al contenido real (10 ejercicios por curso en roboticaData.js); (3) la corrección es topológica (comparación de pares de pines) y no usa el motor de simulación BFS, que solo sirve para feedback visual/sonoro; (4) tiene su propia tabla/RPCs de diseños del Modo libre.

**Ideas de mejora.**
- Resolver la incoherencia '5 vs 10 ejercicios': el config (commonApps.js) dice 5 y los textos de la intro dicen 10, pero hay 10 por curso; unificar el copy y, si se quiere, ofrecer examen corto (5) o largo (10).
- Aprovechar el motor de simulación (analyzeCircuit) también para la corrección: aceptar como válido cualquier cableado eléctricamente equivalente al objetivo (no solo el conjunto exacto de pares), premiando soluciones alternativas correctas en serie/paralelo.
- Añadir verificación y compartición en el Modo libre (botón 'Probar mi circuito' que reutilice el motor para indicar qué se enciende, y exportar/importar diseños o galería de clase) y, opcionalmente, soporte de duelo 1 vs 1 para encajar con el resto de la plataforma.
- Mejorar accesibilidad y experiencia táctil: los controles dependen de clic-en-pin y rueda de zoom; añadir pinch-to-zoom, snapping de pines y navegación por teclado haría la app más usable en tablet y para alumnado con dificultades motrices.

### Ficha de usuario

**¿Qué es?** El Laboratorio de Robótica es un simulador donde el alumnado monta circuitos electrónicos y pequeños proyectos con Arduino conectando cables entre los componentes, igual que en un laboratorio real pero en la pantalla. Trae pilas, LEDs, resistencias, interruptores, pulsadores, potenciómetros, zumbadores, motores, servomotores y sensores (de luz, temperatura, movimiento, infrarrojos y ultrasonidos), además de la placa Arduino UNO. Cada curso de la ESO incluye una serie de retos de dificultad creciente, desde encender un LED con una pila hasta montar un robot seguidor de línea.

**¿Por qué es relevante?** Esta app desarrolla el pensamiento técnico y la competencia STEM de una forma segura, sin material caro ni riesgo de quemar componentes. Al conectar los cables, el alumnado aprende a leer esquemas, distinguir terminales (ánodo y cátodo, alimentación, masa y señal) y entender conceptos clave como los circuitos en serie y en paralelo, las resistencias limitadoras, los divisores de tensión y el control digital con Arduino. La progresión por cursos acompaña el currículo de Tecnología y Digitalización de la ESO y conecta cada montaje con un proyecto reconocible (un semáforo, una alarma, una luz nocturna inteligente, un robot). El ensayo y error inmediato, con LEDs que se encienden y zumbadores que suenan, refuerza el aprendizaje activo y la motivación, y el Modo libre fomenta la creatividad y el diseño propio.

**¿Cómo funciona?** En la pantalla de inicio se elige entre Fácil, Medio, Examen o Modo libre. En el tablero aparecen los componentes del reto y el alumno hace clic en un pin para empezar un cable y en otro pin para cerrarlo, pudiendo mover las piezas, hacer zoom y borrar cables. En Fácil y Medio se comprueba cada circuito y, si es correcto, se pasa al siguiente con confeti. En Examen se encadenan todos los retos del curso y se obtiene una nota sobre 10 que entra en el ranking. El Modo libre es un taller abierto para diseñar y guardar tus propios circuitos.

**Cómo se juega.**
1. En la pantalla de inicio, elige un modo: Fácil, Medio, Examen o Modo libre.
2. Lee el enunciado del ejercicio y fíjate en los componentes que aparecen en el tablero.
3. Haz clic en un pin de un componente para empezar un cable y, a continuación, en el pin de destino para cerrarlo.
4. Si lo necesitas, mueve los componentes arrastrándolos, usa la rueda para hacer zoom y arrastra el vacío para desplazarte; pulsa Escape para cancelar un cable a medias.
5. Para borrar un cable, haz clic sobre él; usa el botón Borrar cables para empezar de nuevo.
6. Cuando creas que el circuito está completo, pulsa Comprobar (en Examen, pasa al siguiente ejercicio).
7. En Fácil y Medio, si está bien aparece el confeti y pulsas Siguiente; en Examen, al terminar verás tu nota sobre 10 y el resumen.
8. En Modo libre, añade componentes desde la paleta, conéctalos a tu gusto y pulsa Guardar para conservar tu diseño y abrirlo más tarde.

**Modos.**
- **Fácil**: Práctica guiada con la solución sugerida y pistas ilimitadas. Ideal para empezar a aprender.
- **Medio**: Sin solución visible; puedes pedir pistas, pero cada una cuenta. Más autonomía.
- **Examen**: Todos los ejercicios del curso seguidos, sin ayudas, con nota sobre 10 y entrada al ranking.
- **Modo libre**: Taller abierto: diseña tus propios circuitos con todos los componentes y guarda tus diseños.

**Consejos.**
- Empieza por el Modo Fácil para familiarizarte con los pines y la idea de positivo (+) y negativo (−) antes de pasar al Examen.
- Fíjate siempre en cerrar el circuito: la corriente debe salir del positivo y volver al negativo o al GND; si un LED no se enciende, repasa ese recorrido.
- Usa el zoom y el arrastre para ordenar los componentes y que los cables no se crucen; así verás mejor cada conexión.
- En el Modo libre, ponle nombre y guarda tus diseños para retomarlos o mejorarlos en otra sesión.

---

## 📟 Terminal de Hackeo `(terminal-retro)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Mini-IDE retro (estética terminal verde sobre negro) donde el alumno escribe pseudocódigo tipo BASIC para 'hackear' un sistema. Es un componente React monolítico (TerminalRetro.jsx) con un intérprete propio escrito a mano; no usa el patrón estándar de modos/onGameComplete de la plataforma.

**Software.** Un único fichero src/apps/terminal-retro/TerminalRetro.jsx (~514 líneas), sin CSS aparte: todo el estilado es Tailwind inline más un bloque <style> embebido (animación scanline, scrollbars personalizados, glow). NO usa framer-motion, canvas-confetti, three/@react-three/fiber, lucide-react ni TTS. Estado con useState: levelData, currentLevelIndex, code (textarea), inputs (buffer de salida de consola), isRunning, isSuccess, feedback, userAnswer (para niveles 'trace'), y flags de modales (showHelp, showExamples, hoveredCmd). Refs codeAreaRef (foco del textarea) y bottomRef (ancla, declarada pero sin scroll automático efectivo). El corazón es runInterpreter(): un intérprete asíncrono que tokeniza con regex /(?:[^\s"]+|"[^"]*")+/g y ejecuta SET/ADD/SUB/MUL/DIV/MOD/PRINT/READ/REPEAT/IF/ELSE/END sobre un objeto 'variables'. READ consume de una cola simulada ["HOLA","5","10","20"]. Hay un guard anti-bucle-infinito (limit<1000). REPEAT delega cada línea a processLine(), pero processLine SOLO implementa ADD y PRINT (el resto de comandos dentro de bucles se ignora). WHILE aparece en la ayuda/ejemplos pero NO está implementado en el intérprete (comentado explícitamente). La validación NO es por puntos: validateOutput() compara el buffer de salida contra currentLevel.solutionCriteria (outputContains / outputContainsAll / outputMatchRegex); los niveles 'trace' comparan userAnswer.trim() contra currentLevel.solution.trim(). NO existe cálculo de score, maxScore ni nota /10; el resultado es binario (éxito/fallo). No hay useRef anti-doble-disparo porque no hay evento de fin de partida que disparar.

**Jugabilidad.** Dos tipos de nivel por dato: 'coding' (escribir código en el textarea, botones de comandos clicables que insertan tokens, ejecutar con ▶ EJECUTAR, botón LIMPIAR) y 'trace' (código read-only que el alumno debe 'trazar' mentalmente e introducir el resultado en un input, botón CHECK). El bucle: leer objetivo -> escribir/insertar comandos -> ejecutar -> ver salida en la consola 'System Output' con efecto de tipeo (delay 30ms por línea). Si la salida cumple los criterios -> feedback verde 'MISSION ACCOMPLISHED' y botón animado 'SIGUIENTE NIVEL'; si no, feedback rojo. Controles: ratón (insertar comandos, modales de Ayuda y Ejemplos con tooltips al hover) y teclado (escribir libremente en el textarea). Sin temporizador, sin vidas, sin niveles de dificultad seleccionables por el alumno (la 'dificultad' FACIL/MEDIO/DIFICIL solo aparece como ejemplos didácticos en un modal). Feedback puramente textual/visual retro: NO hay confeti ni sonidos. La progresión es lineal nivel a nivel; no hay pantalla de resumen ni nota final.

**Educativo.** Introducción al pensamiento computacional y la programación imperativa: variables, asignación, operaciones aritméticas, entrada/salida, condicionales y bucles, además de la destreza de 'trace' (ejecutar código a mano para predecir su salida). Trabaja descomposición de problemas y lógica secuencial con una sintaxis pseudocódigo en mayúsculas muy cercana al castellano. Encaje curricular: aparece en la asignatura 'Programación' de los 4 cursos de ESO (1º-4º) y en el itinerario de Bachillerato (appsProgramacion). Carga contenido específicamente para 'eso' con el grade de la URL.

**Datos.** getAppContent('terminal-retro', 'eso', grade || '1') -> RPC get_app_content (JSONB en BD, cacheado). Devuelve un array de niveles; cada nivel puede traer 'variants' (array) del que el componente elige uno al azar al cargar. Estructura por nivel: id, title, description, type ('coding'|'trace'), goal, initialCode/code, solutionCriteria {outputContains|outputContainsAll|outputMatchRegex} o solution (para trace). Los datos EXAMPLES y HELP_DOCS están hardcodeados en el componente (no vienen de BD).

**Integración.** INTEGRACIÓN MÍNIMA / DESCONECTADA del sistema de gamificación. El componente NO recibe ni invoca onGameComplete, NO usa useGameTracker, NO envía score/maxScore, NO calcula nota /10 y NO declara modos easy/medium/exam. AppRunnerPage sí inyecta onGameComplete a las apps, pero TerminalRetro lo ignora por completo, así que NO genera XP, insignias, ranking ni cuenta para tareas/duelos. No es single_mode ni duelable. Particularidades para mejoras: el intérprete está incompleto (WHILE no implementado pese a documentarse; processLine solo soporta ADD/PRINT dentro de bucles; PRINT usa substring(6) fijo asumiendo 'PRINT '+espacio, frágil); la validación es binaria sin métricas de calidad; no hay accesibilidad ni soporte táctil pensado más allá del textarea; usa una textura externa (transparenttextures.com) que choca con la política de CSP del proyecto.

**Ideas de mejora.**
- Integrar el patrón estándar de la plataforma: pantalla previa de selección de dificultad, modo examen con nota /10 (correctAnswers/totalQuestions·10) y puntos paralelos, y llamada a onGameComplete (protegida con useRef) para que genere XP, insignias, ranking y cuente para tareas.
- Completar el intérprete: implementar WHILE realmente (con guard de iteraciones), dar a processLine soporte completo a SUB/MUL/DIV/MOD/IF dentro de bucles y anidamiento correcto, y robustecer el parseo de PRINT (no depender de substring(6)).
- Añadir feedback de éxito alineado con el resto de apps (canvas-confetti y/o sonidos opcionales) y una pantalla de resumen final con tiempo, niveles superados y nota, en lugar del resultado binario actual.
- Eliminar la dependencia de la textura externa (transparenttextures.com) sustituyéndola por un patrón local/CSS para cumplir la CSP, y mejorar accesibilidad/soporte táctil de los botones de comandos.

### Ficha de usuario

**¿Qué es?** Terminal de Hackeo es un juego de iniciación a la programación con estética de consola retro (letras verdes sobre fondo negro). El alumnado asume el papel de un hacker que debe 'desbloquear' un sistema escribiendo pequeños programas en un lenguaje sencillo de comandos en mayúsculas (SET, PRINT, ADD, IF, REPEAT...). En cada misión hay que lograr que la consola muestre el resultado pedido. También incluye retos de 'análisis', en los que se da un código ya escrito y el alumno debe predecir qué resultado produce e introducirlo para superar el nivel.

**¿Por qué es relevante?** Desarrolla el pensamiento computacional, una competencia clave del currículo de tecnología y programación en la ESO y el Bachillerato. Al escribir sus propias instrucciones, el alumnado practica variables, operaciones, condiciones y bucles, y aprende a descomponer un problema en pasos ordenados y a anticipar la salida de un programa (destreza de 'trazado'). La sintaxis está en castellano y muy próxima al lenguaje natural, lo que reduce la barrera de entrada frente a un lenguaje de programación real, pero conserva la lógica esencial. El formato de misiones, con retos progresivos y feedback inmediato (acceso concedido o denegado), motiva la prueba y el error de forma segura y convierte un contenido a menudo abstracto en una experiencia narrativa y atractiva.

**¿Cómo funciona?** La app carga una serie de niveles según el curso. En los niveles de codificación, el alumno escribe comandos en un editor (puede pulsar los botones de comandos para insertarlos) y ejecuta el programa; la consola muestra la salida y comprueba si cumple el objetivo. En los niveles de análisis, se muestra un código que no se puede editar y el alumno introduce el resultado que cree que producirá. Si acierta, aparece el mensaje de éxito y un botón para avanzar al siguiente nivel.

**Cómo se juega.**
1. Lee el objetivo del nivel en el panel izquierdo (qué debe mostrar el sistema).
2. Si tienes dudas, abre 'Manual de Ayuda' para consultar qué hace cada comando, o 'Ejemplos de código' para ver programas modelo.
3. En los niveles de codificación, escribe tu programa en el editor o pulsa los botones de comandos (SET, PRINT, ADD, IF, REPEAT...) para insertarlos.
4. Pulsa '▶ EJECUTAR' y observa la salida en la consola 'System Output'.
5. Si la salida no cumple el objetivo, usa 'LIMPIAR' o corrige tu código y vuelve a ejecutar.
6. En los niveles de análisis (READ-ONLY), lee con calma el código mostrado y calcula mentalmente qué imprimirá.
7. Escribe ese resultado en el recuadro 'Introduce el resultado' y pulsa 'CHECK'.
8. Cuando veas el mensaje de éxito, pulsa 'SIGUIENTE NIVEL' para continuar.

**Modos.**
- **Codificación**: Escribes tu propio programa con los comandos para que la consola muestre el resultado pedido.
- **Análisis (trazado)**: Se te da un código ya escrito y debes predecir e introducir el resultado que produce.

**Consejos.**
- Empieza por programas cortos: define las variables con SET y muéstralas con PRINT antes de añadir bucles o condiciones.
- Usa el botón de comandos para no equivocarte al escribir las palabras clave en mayúsculas.
- En los retos de análisis, ve anotando paso a paso cómo cambia cada variable; así no se te escapa el resultado final.
- Apóyate en los Ejemplos de código cuando no sepas cómo plantear un bucle REPEAT o un IF.

---


# 🤝 Tutoría y bienestar

## 🏝️ Isla de la Calma `(isla-de-la-calma)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Ejercicio de respiración guiada (mindfulness) que muestra un círculo que se expande y contrae junto a instrucciones por fases (Inhala / Sostén / Exhala / Mantén) durante un número configurable de ciclos. Es un componente React autocontenido, sin backend ni datos externos y sin puntuación.

**Software.** Componente único `src/apps/isla-de-la-calma/IslaDeLaCalma.jsx` (315 líneas) + `IslaDeLaCalma.css`. Sin subcomponentes externos: define internamente `FloatingParticles` (18 partículas con posición/duración aleatorias memoizadas con `useMemo`), `WavesBackground` (tres SVG con paths de olas y animación CSS) y `BreathCircle` (anillos pulsantes + núcleo cuyo `transform: scale()` se controla por estado, con clases de color por fase). Librerías: `framer-motion` (motion/AnimatePresence para transiciones entre pantallas inicio/respiración/final y micro-interacciones de botones whileHover/whileTap) y `lucide-react` (iconos Wind, Waves, Play, RotateCcw, Minus, Plus, Volume2, VolumeX). NO usa canvas-confetti, three/@react-three/fiber ni TTS. Estado con `useState`: `pantalla` ('inicio'|'respiracion'|'final'), `numeroCiclos` (1-15, default 5), `instruccion`, `escalaCirculo`, `cicloActual`, `audioActivado`; `audioRef` apunta a un `<audio src="/audio/calm-sound.mp3" loop>` con play/pause manual. La máquina de fases vive en un único `useEffect` dependiente de `[pantalla, cicloActual, numeroCiclos]`: una cuenta atrás inicial de 2500 ms ('Prepárate...'), luego un `setInterval` de 4000 ms que recorre la secuencia de 4 fases (cada ciclo = 16 s) y, al superar `numeroCiclos`, transiciona a la pantalla final. NO calcula puntuación ni nota /10 ni usa refs anti-doble-disparo: no hay `onGameComplete`, así que no aplica el sistema de evaluación.

**Jugabilidad.** Bucle de tres pantallas. Inicio: el usuario ajusta el número de respiraciones con botones -/+ (clamp 1-15) y pulsa 'Comenzar'. Respiración: el círculo se agranda (scale 1.5) en Inhala/Sostén y se encoge (scale 1) en Exhala/Mantén siguiendo el `setInterval` de 4 s; una barra de progreso muestra 'X de N'. Final: mensaje 'Muy bien hecho' con icono 🌊 girando y botón 'Hacer otra vez' que reinicia. Controles solo de ratón/táctil (clic en botones); sin teclado dedicado ni gestos. Botón flotante de audio (esquina) activa/silencia una pista ambiente en bucle. No hay niveles de dificultad, ni condición de derrota, ni victoria competitiva: completar los ciclos es el único desenlace. Feedback puramente visual/animado (partículas, olas, anillos pulsantes, transiciones) y sonoro opcional; sin confeti.

**Educativo.** Objetivo pedagógico de autorregulación emocional y bienestar: técnica de respiración acompasada (inspirado en respiración cuadrada/box breathing con cuatro fases iguales) para reducir activación/ansiedad y mejorar el foco atencional antes o después de tareas exigentes. Entrena atención plena, regulación del sistema nervioso y conciencia corporal. Encaja en tutoría, educación emocional y atención a la diversidad. Está registrada en ESO (todos los cursos, asignatura tutoría), Bachillerato (heredada vía appsBase + tutoría) y Atención a la Diversidad (bloques 'tutoria', 'habilidades-sociales' y 'autonomia'); también aparece en primaria según `primariaApps.js`. Es transversal y no curricular en sentido estricto.

**Datos.** No consume datos de `gameDataService` ni de Supabase: no llama a `getAppContent`, `getRunnerData`, `getRoscoData` ni a ninguna RPC. Todo el contenido (textos de fase, secuencia de respiración) está hardcodeado en el propio componente. El único recurso externo es el fichero estático de audio `/audio/calm-sound.mp3` servido desde `public`. El fondo de la app se mapea al preset 'calma' en `src/services/courseBackgrounds.js`.

**Integración.** App SIN modos (no easy/medium/exam, no single_mode, no duelo): no figura en `app_scoring_config` ni en `duelableApps.js`. El componente se renderiza sin props — su firma es `() => {}`, no recibe `onGameComplete`, `level`, `grade` ni `subjectId` — por lo que NO dispara `track_student_session`/`onGameComplete` y NO genera filas en `game_sessions` ni `high_scores`. En consecuencia: no aporta XP, ni nota /10, ni ranking, ni cuenta para tareas, avatares por `unique_apps`/`app_sessions` ni insignias. `AppRunnerPage` igualmente monta la app e inicia su `useGameTracker` (startSession) genérico, pero al no haber finish la sesión quedaría sin cierre/abandonada. Particularidad a tener en cuenta: cualquier mejora que quiera registrar uso (p. ej. tiempo de respiración acumulado) debe añadir explícitamente la integración con tracking, ya que hoy la app es completamente 'silenciosa' para el backend.

**Ideas de mejora.**
- Ofrecer patrones de respiración seleccionables (4-7-8 para dormir, box 4-4-4-4, respiración rápida de activación) con tiempos por fase configurables, en vez de los 4000 ms fijos por fase actuales.
- Añadir guía por voz (Web Speech API/TTS) y un temporizador/contador visible de segundos por fase para alumnado que no quiera depender solo de la animación; mejorar accesibilidad con soporte de teclado (Enter para comenzar, Espacio para pausar).
- Registrar uso opcional vía `onGameComplete` con `mode:'practice'` y maxScore 0 (o un tracker ligero de minutos de calma) para que el docente vea que el alumno usa la herramienta y, si procede, otorgar una insignia de bienestar/racha sin alterar la nota.
- Permitir pausar/reanudar la sesión a mitad y precargar/gestionar mejor el audio (autoplay bloqueado por el navegador hoy se silencia con `.catch(() => {})` sin avisar al usuario).

### Ficha de usuario

**¿Qué es?** Isla de la Calma es un ejercicio de respiración guiada para encontrar la tranquilidad. En pantalla aparece un círculo que crece y se encoge mientras te indica cuándo inhalar, sostener el aire, exhalar y mantener. Tú eliges cuántas respiraciones quieres hacer y, al pulsar Comenzar, solo tienes que seguir la animación y el ritmo. Un fondo de mar con olas suaves, partículas flotantes y una música ambiente opcional acompañan el ejercicio para ayudarte a desconectar y relajarte unos minutos.

**¿Por qué es relevante?** El bienestar emocional es la base sobre la que se sostiene cualquier aprendizaje: un alumno tenso, nervioso o saturado rinde peor y se concentra menos. Isla de la Calma trabaja la educación emocional y la autorregulación, competencias hoy centrales en el currículo y en la tutoría. La respiración acompasada en cuatro fases ayuda a reducir la ansiedad, a bajar la activación antes de un examen o tras un conflicto y a recuperar el foco atencional. Es una herramienta de mindfulness sencilla, sin pantallas competitivas ni puntuaciones, lo que la hace ideal para atención a la diversidad y para momentos de transición en clase. Practicar la respiración consciente entrena la conciencia corporal y da al alumnado un recurso autónomo que puede usar dentro y fuera del aula.

**¿Cómo funciona?** La app guía un ciclo de respiración en cuatro fases iguales: inhalar, sostener, exhalar y mantener. El círculo central se expande cuando toca tomar aire y se contrae al soltarlo, de modo que basta con seguirlo con la vista para acompasar la respiración. Antes de empezar eliges cuántas respiraciones quieres hacer (de 1 a 15). Una barra de progreso te muestra por cuál vas. Al terminar aparece un mensaje de enhorabuena y puedes repetir las veces que quieras. No hay aciertos, fallos ni nota.

**Cómo se juega.**
1. En la pantalla de inicio, ajusta el número de respiraciones con los botones - y + (puedes elegir entre 1 y 15).
2. Si quieres música ambiente, pulsa el botón de sonido de la esquina para activarla.
3. Pulsa Comenzar y espera el breve aviso de Prepárate.
4. Cuando el círculo crezca y leas Inhala, toma aire despacio por la nariz.
5. Mantén el aire mientras dure la fase Sostén.
6. Cuando el círculo se encoja y leas Exhala, suelta el aire poco a poco por la boca.
7. Aguanta sin aire durante la fase Mantén y repite el ciclo siguiendo la animación.
8. Observa la barra de progreso para ver cuántas respiraciones llevas.
9. Al completar todas, lee el mensaje final y pulsa Hacer otra vez si quieres repetir.

**Modos.**
_Sin modos diferenciados._

**Consejos.**
- Siéntate con la espalda recta y los hombros relajados, y deja que sea el círculo quien marque el ritmo: no fuerces la respiración.
- Úsala en momentos clave: antes de un examen, al volver del recreo o cuando notes nervios o agobio.
- Empieza con pocas respiraciones (4 o 5) e ve subiendo a medida que te resulte cómodo.
- Si puedes, hazlo con la música activada y en un ambiente tranquilo para aprovecharlo mejor.

---

## ✨ Generador de personajes históricos `(generador-personajes-historicos)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Herramienta de aula (no es un juego puntuable) que genera personajes históricos al azar con filtros por sexo y categoría, e incluye un asignador que reparte personajes entre una lista de alumnos. Componente React funcional simple (src/apps/generador-personajes/GeneradorPersonajes.jsx) con estado local y sin tracking ni gamificación.

**Software.** Un único componente funcional `GeneradorPersonajes` (273 líneas) con estado mediante `useState` (personajes, sexo, categoria, aleatorioTotal, resultado, mensaje, error, ultimoNombre y el bloque del asignador: isAssignerVisible, studentList, assignments, categorias). Carga datos en un `useEffect` dependiente de `[level, grade]` vía `getAppContent('generador-personajes', level, grade)`. NO usa framer-motion, canvas-confetti, three/@react-three/fiber, lucide-react ni TTS. Solo `react` y `react-router-dom` (useParams para level/grade). Estilos propios aislados con prefijo `gp-` en GeneradorPersonajes.css (paleta turquesa, mezclados con utilidades tipo Tailwind en el JSX). La selección aleatoria usa `Math.random()` con un bucle anti-repetición (hasta 10 intentos para no repetir `ultimoNombre`). El asignador baraja con Fisher-Yates y reparte por índice módulo (`index % shuffledPersonajes.length`). Exporta a CSV con separador `;`, cabecera `Alumno;Personaje;Sexo;Categoría`, BOM `﻿` para Excel, creando un Blob y un enlace de descarga temporal. NO calcula puntuación ni nota/10, no hay `mode='test'`, y no existen refs anti-doble-disparo porque no hay evento de fin de partida.

**Jugabilidad.** No es un juego con bucle de victoria/derrota: es un generador/utilidad. El usuario marca opcionalmente «Aleatorio total» (que deshabilita los selects), o elige Sexo (Cualquiera/Mujer/Hombre) y Categoría (poblada dinámicamente desde los datos), y pulsa «Obtener personaje»; aparece una tarjeta con nombre, sexo y categoría. Si no hay coincidencias muestra el aviso «Sin coincidencias». Controles 100% de ratón/táctil (checkbox, selects, botones, textarea). El bloque «Asignador por Alumno» se despliega con un botón: se pega una lista de alumnos (uno por línea), se pulsa «Asignar Personajes» (reparto barajado) y se puede «Exportar a CSV». No hay niveles de dificultad, ni confeti, ni sonidos, ni temporizador, ni puntuación. La región de resultado usa `aria-live="polite"`.

**Educativo.** Pensada como apoyo a actividades de Historia/Ciencias Sociales y de aula en general: sirve para asignar al alumnado un personaje histórico que investigar, exponer o dramatizar, o para sorteos/dinámicas de grupo. Entrena indirectamente la investigación, la exposición oral y el conocimiento de figuras históricas (según el contenido de la categoría), pero la app en sí no evalúa ni mide destrezas del alumno. Es transversal por curso: aparece en Primaria, ESO, Bachillerato y Atención a la Diversidad (en AD, dentro de tutoría), sin contenido dependiente del nivel salvo lo que devuelva la BD para `generador-personajes`.

**Datos.** Los personajes provienen de `getAppContent('generador-personajes', level, grade)` (src/services/gameDataService.js), que llama a la RPC Supabase `get_app_content` con `p_app_type='generador-personajes'`. Devuelve un array de objetos JSONB con la forma `{nombre, sexo, categoria}` (parseados con `deepParseJSON` y cacheados 5 min en memoria). Las categorías del select se derivan en cliente con `[...new Set(data.map(p => p.categoria))]`. La lista de alumnos del asignador es entrada local del usuario y NO se persiste en ningún servidor (aviso de privacidad explícito en la UI).

**Integración.** App SIN modos (no easy/medium/exam), sin single_mode y sin duelo. No invoca `onGameComplete` ni `useGameTracker`, por lo que no genera filas en `game_sessions`, no otorga XP/insignias/avatares y no participa en el ranking ni en la nota/10 — es puramente una utilidad docente, igual que Banco de Recursos o Isla de la Calma (categoría «sin modos» del CLAUDE.md). Registrada en src/apps/config/commonApps.js como `appGeneradorPersonajes` (id `generador-personajes-historicos`) y añadida a primariaApps, esoApps, bachilleratoApps (appsBase) y adApps (tutoría). Particularidades a vigilar: usa clases tipo Tailwind con colores fijos de tema claro (`text-gray-700`, `bg-blue-100`) que pueden contrastar mal en modo oscuro; el reparto por `index % length` repite personajes si hay más alumnos que personajes; el CSS menciona «escena 3D» en comentarios pero el componente no la monta (la aporta el fondo global de la plataforma).

**Ideas de mejora.**
- Permitir reparto sin repetición o con control de duplicados (avisar cuando hay más alumnos que personajes en lugar de repetir con `index % length`), y opción de reparto respetando los filtros activos de sexo/categoría.
- Enriquecer la ficha del personaje con una breve biografía, época, datos clave o imagen/avatar (ampliando el JSON de `getAppContent`), e incluir botón de lectura por voz (TTS) para reforzar accesibilidad.
- Adaptar los estilos del asignador y los avisos al ThemeContext (tema oscuro) sustituyendo las clases con colores fijos `text-gray-*`/`bg-blue-100`, y añadir feedback/animaciones ligeras (framer-motion) coherentes con el resto de apps.
- Exportar la asignación también a PDF/imprimible y permitir guardar/cargar la lista de alumnos en localStorage (manteniendo la promesa de no enviarla a servidor) para reutilizarla entre sesiones.

### Ficha de usuario

**¿Qué es?** El Generador de personajes históricos es una herramienta de aula que crea al azar un personaje histórico cada vez que pulsas un botón. Puedes pedir un personaje totalmente aleatorio o afinar la búsqueda filtrando por sexo (mujer u hombre) y por categoría. Además incluye un «Asignador por Alumno»: pegas la lista de tu clase y la herramienta reparte un personaje a cada estudiante de forma barajada, con opción de exportar el resultado a un archivo CSV para abrirlo en Excel.

**¿Por qué es relevante?** Es un recurso de apoyo docente ideal para arrancar proyectos de investigación, exposiciones orales, dramatizaciones o trabajos cooperativos en Historia y Ciencias Sociales. Al asignar a cada alumno una figura concreta, se favorece la responsabilidad individual, la curiosidad y la equidad (el reparto es aleatorio, sin favoritismos). El alumnado desarrolla competencias de investigación, síntesis y comunicación al documentar y presentar a su personaje, y la diversidad de categorías ayuda a visibilizar figuras femeninas y de distintos ámbitos. Es transversal: se usa en Primaria, ESO, Bachillerato y Atención a la Diversidad. Y respeta la privacidad: la lista de alumnos nunca sale del navegador, no se guarda en ningún servidor.

**¿Cómo funciona?** Al abrirla, la app carga una lista de personajes desde la plataforma. Eliges si quieres un personaje totalmente aleatorio o usar los filtros de sexo y categoría, y pulsas «Obtener personaje» para ver el resultado en una tarjeta con su nombre, sexo y categoría. Si quieres repartir personajes a toda la clase, despliegas el «Asignador por Alumno», pegas los nombres (uno por línea), pulsas «Asignar Personajes» y, si lo deseas, exportas la tabla a CSV. Todo el proceso ocurre en tu propio dispositivo.

**Cómo se juega.**
1. Abre la app: verás los controles y una tarjeta que te invita a empezar.
2. Para un personaje al azar sin restricciones, marca la casilla «Aleatorio total».
3. Si prefieres acotar, deja la casilla sin marcar y elige Sexo (Cualquiera, Mujer u Hombre) y Categoría.
4. Pulsa «Obtener personaje» para ver el nombre, el sexo y la categoría en la tarjeta.
5. Repite las veces que quieras; la app evita repetir el último personaje mostrado.
6. Para repartir personajes a tu clase, pulsa «Mostrar Asignador por Alumno».
7. Pega la lista de alumnos en el cuadro de texto, un nombre por línea.
8. Pulsa «Asignar Personajes» para ver a quién le toca cada figura.
9. Si lo necesitas, pulsa «Exportar a CSV» para descargar la asignación y abrirla en Excel.

**Modos.**
_Sin modos diferenciados._

**Consejos.**
- Si te sale «Sin coincidencias», cambia el sexo o la categoría: esa combinación no tiene personajes disponibles.
- Usa el «Aleatorio total» para sorteos rápidos y los filtros cuando trabajes una época o ámbito concreto en clase.
- Para repartir a toda la clase de una vez, copia los nombres directamente desde tu lista y pégalos uno por línea; el reparto es aleatorio y la lista no se guarda en ningún servidor.
- Si tienes más alumnos que personajes disponibles, algunos personajes se repetirán: tenlo en cuenta al planificar el trabajo.

---

## 🎓 Banco de Recursos Tutoriales `(banco-recursos-tutoria)`

### Ficha interna (técnica / pedagógica)

**Resumen.** Aplicación de consulta (no juego) que muestra un dossier estructurado de dinámicas y recursos para la acción tutorial: bloques temáticos, cada uno con varias sesiones que incluyen recurso didáctico, actividad individual, actividad grupal y rúbricas de evaluación desplegables. Es un componente React de presentación de contenido cargado por RPC, sin puntuación ni examen.

**Software.** Componente único `src/apps/banco-recursos-tutoria/BancoRecursosTutoria.jsx` (~239 líneas) más su CSS hermano `BancoRecursosTutoria.css`. Registrado en `src/apps/config/commonApps.js` como `appBancoRecursosTutoria` (id `banco-recursos-tutoria`), cargado con `lazy()`. Librerías: `framer-motion` (animaciones de entrada con `motion` y transiciones `AnimatePresence mode="wait"` al cambiar de bloque/sesión y al desplegar rúbricas con animación height auto/0); iconografía vía Font Awesome 6.4.0 importado por CSS (`@import` cdnjs), con clases `fa-*` que vienen embebidas en los propios datos (`block.icon`, `session.resource.icon`, etc.). Tipografías Google Fonts Fredoka y Lexend importadas en CSS. NO usa canvas-confetti, three/@react-three/fiber, TTS ni lucide-react. Gestión de estado: cuatro `useState` locales (`blocks`, `loading`, `activeBlock` por defecto `'block1'`, `activeSessionIdx`, `expandedRubrics` como mapa de booleanos por clave `${activeBlock}-${activeSessionIdx}-ind|grp`). Carga de datos en un `useEffect` que invoca `getAppContent('banco-tutoria')` y vuelca el array en `blocks`; pantallas de loading (spinner CSS) y de error si no hay datos. NO calcula puntuación, nota /10 ni examen: no hay lógica de scoring, ni `useRef` anti-doble-disparo, ni invocación de `onGameComplete` (aunque AppRunnerPage le pasa la prop, nunca se llama). Selección de bloque vía `handleBlockChange` (resetea sesión a 0 y colapsa rúbricas); rúbricas con `toggleRubric(id)`.

**Jugabilidad.** No es un juego con bucle ni condiciones de victoria/derrota; es un navegador de recursos. Interacción exclusivamente por clic/táctil: barra superior de "burbujas" de bloques siempre visible (navegación entre categorías), botones "Sesión 1/2/..." dentro de cada bloque, y botones "Ver/Ocultar rúbrica" que despliegan una tabla de criterios (Criterio · Excelente · Mejorable) tanto para la actividad individual como la grupal. Cada sesión muestra título, duración (pill con icono reloj), un recurso didáctico (título + texto), una actividad individual y una grupal, cada una con su rúbrica opcional. No hay teclado, dificultad, vidas, temporizador, confeti ni sonidos. El único feedback es visual: animaciones de framer-motion al cambiar de vista y resaltado del bloque/sesión activos con el color propio del bloque (`currentBlock.color`).

**Educativo.** Herramienta de apoyo al docente/tutor para la acción tutorial (Plan de Acción Tutorial). Objetivo pedagógico: ofrecer un banco listo para usar de dinámicas agrupadas por bloques temáticos, con propuestas de trabajo individual y grupal y rúbricas de evaluación, de modo que el tutor pueda planificar sesiones de tutoría (cohesión de grupo, convivencia, emociones, técnicas de estudio, etc., según el contenido de la BD). No entrena destrezas del alumnado de forma autónoma: es material de consulta/planificación. Disponible de forma transversal: aparece en Primaria 1º-6º, ESO 1º-4º, Bachillerato 1º-2º y Atención a la Diversidad (registrada en primariaApps, esoApps, bachilleratoApps y adApps, esta última bajo la asignatura/clave 'tutoria').

**Datos.** Contenido 100% remoto y global, no propio del componente. Se obtiene con `getAppContent('banco-tutoria')` (src/services/gameDataService.js), que llama a la RPC `get_app_content` con `p_app_type='banco-tutoria'`, `p_level=null`, `p_grade=null` (no depende de nivel/curso/asignatura) y devuelve un único registro JSONB que `deepParseJSON` desanida. La estructura esperada por la UI: array de bloques `{id, title, desc, color, icon, sessions:[{title, duration, resource:{icon,title,text}, individual:{icon,title,text,rubric:[{criterion,excellent,improvable}]}, group:{icon,title,text,rubric:[...]}}]}`. El contenido se gestiona/inspecciona desde el panel admin (DataExplorer/DataStatsTable lo tratan como contenido global, 1 fila para todo). Cacheado en frontend por `getCached/setCache`.

**Integración.** SIN modos (confirmado en CLAUDE.md: 'Banco de Recursos... sin modos'). No es single_mode ni duelable (no figura en duelableApps; en build-apps-catalog y app-catalog se marca explícitamente como app de tutoría que no se valora porque no es un juego). Tracking: AppRunnerPage llama `startSession({appId, appName, level, grade, subjectId})` al montar y `abandonSession()` al desmontar; como el componente nunca invoca `onGameComplete`, la sesión queda registrada como consulta/abandono — NO genera `game_sessions` con score, NO computa nota /10, NO entra en `high_scores` ni en el ranking, NO otorga XP/insignias/avatares (no pasa por `gamification_process_session`). Recibe props `level/grade/subjectId/onGameComplete` que ignora por completo. Particularidades para mejoras: al ser contenido global e independiente de curso/asignatura, todos los niveles ven exactamente lo mismo; cualquier mejora que dependa de nivel/curso requeriría parametrizar `getAppContent`. La dependencia de Font Awesome vía CDN externo (cdnjs) y Google Fonts es un punto de fragilidad/CSP a vigilar.

**Ideas de mejora.**
- Permitir al docente exportar/imprimir una sesión o un bloque completo (PDF/ficha imprimible) con recurso, actividades y rúbricas, para llevarlo al aula sin pantalla.
- Parametrizar el contenido por nivel/curso (aprovechando los argumentos ya disponibles de `getAppContent(level, grade)`) para ofrecer dinámicas adaptadas a Primaria, ESO, Bachillerato y AD en lugar de un único dossier global.
- Añadir buscador/filtros por temática, duración o tipo de actividad (individual/grupal) y favoritos del tutor, ya que con muchos bloques la navegación por burbujas se queda corta.
- Internalizar las fuentes e iconos (sustituir Font Awesome y Google Fonts vía CDN por assets locales o lucide-react) para reducir dependencias externas, evitar problemas de CSP y mejorar la carga offline.

### Ficha de usuario

**¿Qué es?** El Banco de Recursos Tutoriales es una biblioteca digital pensada para tutores y tutoras. No es un juego, sino un dossier organizado de dinámicas y recursos para las sesiones de tutoría. Está dividido en bloques temáticos y, dentro de cada bloque, en varias sesiones listas para llevar al aula. Cada sesión incluye un recurso didáctico, una actividad individual, una actividad en grupo y las rúbricas de evaluación correspondientes. En pocos clics, el docente encuentra una propuesta completa y estructurada para trabajar la acción tutorial con su grupo.

**¿Por qué es relevante?** La acción tutorial es una pieza clave del desarrollo personal, social y emocional del alumnado, pero a menudo el profesorado dispone de poco tiempo para preparar dinámicas de calidad. Esta herramienta resuelve esa necesidad ofreciendo recursos ya pensados, secuenciados y evaluables. Al combinar trabajo individual y cooperativo, ayuda a desarrollar competencias como la convivencia, la cohesión de grupo, la autorregulación emocional y las habilidades sociales. Las rúbricas (con niveles "Excelente" y "Mejorable") aportan criterios claros para observar y orientar al alumnado, dando un sentido formativo a la tutoría. Funciona pedagógicamente porque convierte la planificación en algo ágil y riguroso: el tutor dedica su energía a acompañar al grupo, no a buscar materiales dispersos.

**¿Cómo funciona?** Al abrir la app aparece una barra superior con los distintos bloques temáticos en forma de burbujas. Al elegir un bloque, se muestra su descripción y los botones de sus sesiones. Seleccionas la sesión que quieras y verás, una bajo otra, el recurso didáctico, la actividad individual y la actividad grupal. Cada actividad tiene un botón para desplegar su rúbrica de evaluación. Todo es consulta: no hay puntuación, exámenes ni partidas, solo material listo para usar en clase.

**Cómo se juega.**
1. Abre el Banco de Recursos Tutoriales y espera a que cargue el contenido.
2. En la barra superior, pulsa la burbuja del bloque temático que te interese.
3. Lee la breve descripción del bloque que aparece en la tarjeta de introducción.
4. Elige una sesión con los botones "Sesión 1", "Sesión 2", etc.
5. Consulta el recurso didáctico propuesto para empezar la sesión.
6. Revisa la actividad individual y la actividad grupal sugeridas.
7. Pulsa "Ver rúbrica" en cada actividad para desplegar los criterios de evaluación.
8. Vuelve a pulsar "Ocultar rúbrica" o cambia de sesión o de bloque para seguir explorando.

**Modos.**
_Sin modos diferenciados._

**Consejos.**
- Recorre primero todos los bloques para tener una visión general antes de planificar la programación de tutoría del curso.
- Apóyate en las rúbricas "Excelente / Mejorable" para dar al alumnado un feedback claro y orientado a la mejora.
- Combina la actividad individual y la grupal de cada sesión: la primera invita a la reflexión personal y la segunda fomenta la cooperación.
- Como el contenido es de consulta y no puntúa, úsalo con tranquilidad para preparar tus sesiones; no afecta a la nota ni al ranking del alumnado.

---

