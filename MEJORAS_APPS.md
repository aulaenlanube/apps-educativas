# MEJORAS_APPS.md — Backlog de mejoras y ampliaciones de las apps

> AUTOGENERADO por tools/build-apps-catalog.mjs a partir del análisis de código de cada
> app (campo `ideasMejora` de APPS_INTERNAL.md) + síntesis de patrones transversales.
> Es un backlog para implementar en el futuro; no es un compromiso ni un orden de prioridad.

Apps con propuestas: **57** · Ideas registradas: **228**.

## 🎯 Temas transversales (afectan a varias apps a la vez)

Estos patrones aparecen en el análisis de muchas apps; abordarlos de forma común
tiene más impacto que app por app.

### 1. Unificar el cálculo de nota y el tracking
Varias apps calculan la nota /10 "inline" en lugar de usar el helper estándar
`Math.round(correct/total*100)/10`, no envían `durationSeconds` real, o fijan un
`maxScore` heurístico que distorsiona el ranking. Conviene una pasada que homogenice
`onGameComplete` (nota, durationSeconds, maxScore coherente) en todas. *Apps citadas:*
Rosco, Velocidad, Runner, entre otras.

### 2. Selección de dificultad en pantalla previa (no en pestañas durante la partida)
CLAUDE.md exige elegir el modo ANTES de jugar; algunas apps aún usan tabs que reinician
la partida al cambiarlas a mitad. *Apps citadas:* Velocidad. Revisar el resto.

### 3. El modo examen no debería ser un toggle desactivable
En apps donde "examen" es un interruptor que el alumno puede dejar en práctica, las
partidas pueden no contar como intento de tarea. Forzar examen cuando corresponde.
*Apps citadas:* Runner.

### 4. Duelos 1 vs 1 pendientes
Apps con formato idóneo para duelo que aún no lo tienen (componente `<Nombre>Duel.jsx`
+ `duelableApps.js` + `DuelChatBar`). *Candidatas:* Velocidad, Runner, La Fortaleza
(motor ya preparado), y revisar más en cada ficha.

### 5. Instrucciones y material de estudio
Hay `InstructionsModal` desactualizados respecto al código real o ausentes, y apps de
vocabulario sin "material de estudio" (glosario por letra, patrón de Anagramas/RoscoUI).
*Apps citadas:* Velocidad (modal desactualizado), Runner (sin modal estándar).

### 6. Feedback sensorial y accesibilidad coherentes
Confeti/sonidos de acierto-fallo inconsistentes entre apps; oportunidades de TTS opcional
y modos de más tiempo para accesibilidad. Definir un estándar y aplicarlo.

> El detalle por app está debajo. Es un volcado de las "ideas de mejora" detectadas al
> leer el código de cada una; priorízalas según impacto y esfuerzo.



## 📚 Juegos de palabras y repaso

### 🅿️ El Rosco del Saber `(rosco-del-saber)`
- [ ] Unificar el cálculo de la nota con el helper estándar (Math.round(correct/total*100)/10) y enviar durationSeconds en onGameComplete para alinearlo con el resto de apps y aprovechar mejor el tracking y el bonus por tiempo.
- [ ] Revisar el mode enviado en RoscoUI: en partidas que forman parte de un duelo debería ser mode:'duel' (no 'test') según la convención de CLAUDE.md, para garantizar que el duelo nunca cuente como intento de examen.
- [ ] Añadir feedback sensorial coherente con el resto de la plataforma (canvas-confetti al completar el rosco perfecto y sonidos de acierto/fallo/pasapalabra opcionales) para reforzar la motivación.
- [ ] Extender el selector de 4 dificultades también a Primaria (hoy carga directo) o, al menos, ofrecer un modo de repaso espaciado configurable, y añadir un botón de instrucciones con InstructionsModal del patrón compartido.

### 🎯 Ahorcado `(ahorcado)`
- [ ] Unificar la entrada al patrón estándar de pantalla previa de selección de modo (Fácil/Medio/Examen) en lugar de pestañas, o al menos ofrecer niveles de dificultad con vidas variables (p. ej. 6/5/4) y límite de tiempo, hoy MAX_FAILS es constante.
- [ ] Añadir lectura por voz (TTS de la pista o de la palabra resuelta) y refuerzo de accesibilidad, especialmente útil para Atención a la Diversidad y conciencia fonológica.
- [ ] Material de estudio: incorporar el botón 'Ver material de estudio' (modal con palabras/términos agrupados por letra inicial, patrón de Anagramas/RoscoUI), que el CLAUDE.md recomienda para apps de vocabulario y aquí no existe.
- [ ] En el duelo, permitir frases además de palabras (hoy AhorcadoDuel solo usa getRoscoData) y mostrar la categoría/tema durante el duelo para igualar la experiencia con el modo individual.

### 🧩 Crucigrama `(crucigrama)`
- [ ] Registrar nota parcial: disparar onGameComplete en el cleanup/al salir del examen con nota = palabras_correctas/total·10 (como Anagramas), para que un examen abandonado no quede como 0 y el alumno reciba crédito por lo resuelto.
- [ ] Alinear con el patrón estándar de la plataforma: pantalla previa de selección de dificultad en lugar de tabs vivos durante la partida (evita regeneraciones a mitad), o al menos un modal de confirmación antes de cambiar de modo si hay progreso.
- [ ] Activar el duelo 1vs1 ya esbozado (duel shared-word, bestOf 5): crear CrucigramaDuel.jsx con DuelChatBar y registrarlo en duelableApps para aprovechar la mecánica 1vs1 que el resto de apps de vocabulario ya tienen.
- [ ] Añadir feedback de progreso en examen (palabras completadas / total y opcional límite de tiempo con bonus), y un botón de pista limitada en examen que reste de la nota, para dar matices más allá del 10 fijo.

### 🔍 Sopa de Letras `(sopa-de-letras)`
- [ ] Migrar el selector a la pantalla previa estándar (easy/medium/exam) o al menos impedir que alternar la pestaña Práctica/Examen reinicie una partida ya empezada, para no romper el tracking ni frustrar al alumno.
- [ ] Añadir un temporizador/objetivo opcional y registrar también partidas de práctica con un contador de rachas para dar feedback de progreso sin contar como examen.
- [ ] Incluir lectura por voz (TTS) de las definiciones en modo examen para mejorar accesibilidad y encaje en Atención a la Diversidad y primeros cursos de Primaria.
- [ ] Soportar duelo 1 vs 1 (SopaDeLetrasDuel + alta en duelableApps.js con DuelChatBar), generando la misma sopa para ambos rivales a partir del mismo pool/semilla.

### 💰 Millonario `(millonario)`
- [ ] Mover la selección de modo a una pantalla previa (patrón estándar de la plataforma) para evitar que cambiar de tab reinicie la partida a mitad y rompa el tracking.
- [ ] Añadir navegación y selección por teclado (teclas A/B/C/D y Enter) y retroalimentación sonora opcional para reforzar accesibilidad y feedback multicanal.
- [ ] Integrar 'Ver material de estudio' (glosario término→definición agrupado por letra, como en Anagramas/RoscoUI) para que el alumno pueda repasar el vocabulario antes de jugar.
- [ ] Implementar modo duelo 1vs1 (registrarla en duelableApps con MillonarioDuel.jsx + DuelChatBar) aprovechando que ya es un test por turnos, idóneo para enfrentamientos.

### 🔀 Anagramas `(anagramas)`
- [ ] Anadir disparo de onGameComplete en el cleanup/unmount cuando la partida esta en curso (como en el brief y en CLAUDE.md), para registrar la nota parcial si el alumno abandona el examen a medias; hoy solo se trackea al completar las 10 palabras.
- [ ] Soportar arrastrar y soltar (drag&drop) y control por teclado (escribir/borrar letras, Enter para comprobar) ademas del click, mejorando accesibilidad y velocidad en pantallas tactiles y de escritorio.
- [ ] Revisar la coherencia del timer: el comentario dice 'solo examen' pero MODE_CONFIG activa 30s en easy/medium/exam; decidir si facil/medio deben ir sin reloj (mas amable para Primaria/AD) y alinear codigo, comentarios e instrucciones.
- [ ] Permitir insertar una ficha en un hueco concreto (no solo en el primer libre) y reordenar letras ya colocadas intercambiandolas, para reducir la friccion de tener que vaciar todo el slot cuando el alumno se equivoca de posicion.

### 🔐 Criptograma `(criptograma)`
- [ ] Migrar el selector de dificultad a una pantalla previa (como recomienda el CLAUDE.md) para evitar que cambiar de tab durante la partida regenere el puzzle y pueda confundir el tracking; alternativamente, bloquear el cambio de modo mientras hay una partida en curso.
- [ ] Añadir el botón 'Ver material de estudio' (patrón Anagramas/RoscoUI) con el vocabulario/definiciones del área agrupado, dado que la app ya maneja palabras con pista.
- [ ] Mostrar in-game un contador de frecuencia de cada código DENTRO del propio criptograma (cuántas veces aparece cada número) para reforzar el criptoanálisis y conectar mejor con la tabla de frecuencias del español.
- [ ] Evaluar registrar la app en duelableApps con un CriptogramaDuel (descifrado por velocidad cabeza a cabeza) montando DuelChatBar, ya que el bonus de velocidad del examen encaja de forma natural con un formato 1vs1.

### ⚡ Velocidad `(velocidad-respuesta)`
- [ ] Sincronizar el modal de instrucciones con MODE_CONFIG real (5/8/10 preguntas, tiempos base, ayudas, ausencia de vidas y fórmula de puntos correcta) y eliminar referencias a 'vidas'/'lost' que ya no aplican, para no confundir al alumnado.
- [ ] Migrar la selección de dificultad a una pantalla previa (no tabs en partida) como exige el CLAUDE.md, evitando reinicios accidentales y la pérdida de progreso al tocar una pestaña a mitad de ronda.
- [ ] Medir y enviar durationSeconds real y revisar el cálculo de maxScore (acotar el score con un techo coherente con racha+timeBonus) para que el ranking sea justo; valorar también enviar puntuación en práctica para que esas partidas cuenten en high_scores.
- [ ] Añadir lectura por voz (TTS opcional) de la definición y/o un modo accesible con más tiempo, además de un material de estudio (glosario por letra inicial) reutilizando el patrón de Anagramas/RoscoUI; opcionalmente integrarla como app de duelo 1vs1 dado su formato rápido por turnos.

### 🧲 Conecta Parejas `(conecta-parejas)`
- [ ] Mover la selección de dificultad a una pantalla previa (como exige el estándar de la plataforma) para que cambiar de modo no reinicie la partida y no rompa el tracking de sesión.
- [ ] Convertir 'Pista extra' en una verificación real (resaltar conexiones dudosas o descartar definiciones) en lugar de duplicar 'Revelar par', y plantear que las ayudas no inflen correctCount para que la nota /10 del examen refleje aciertos genuinos.
- [ ] Añadir accesibilidad/controles de teclado (navegación y selección con flechas/Enter) y soporte TTS para leer definiciones, dado su uso en Atención a la Diversidad.
- [ ] Recalcular las líneas SVG también en scroll y con un ResizeObserver del tablero para evitar desalineaciones, y permitir definiciones multi-palabra ampliando la fuente de datos para no descartar tanto vocabulario.

### ✍️ Dictado `(dictado-interactivo)`
- [ ] Medir y enviar durationSeconds real (timestamp de inicio de partida) para enriquecer el tracking y permitir bonus/ranking por velocidad coherente.
- [ ] Migrar los tabs de dificultad a la pantalla de selección previa recomendada en CLAUDE.md, evitando reinicios accidentales a mitad de partida y alineando el patrón con el resto de apps.
- [ ] Robustecer el TTS: precargar/forzar voz es-ES, fallback con resaltado de sílabas o repetición más lenta automática, y mensaje claro (o deshabilitar examen) cuando no haya voz española disponible.
- [ ] Añadir una pestaña de 'errores frecuentes' o repaso al final que reúna las palabras falladas para reintentarlas, reforzando el aprendizaje ortográfico de los términos concretos donde el alumno erró.

### 🏗️ Torre de Palabras `(torre-palabras)`
- [ ] Migrar el selector de modos de tabs a una pantalla de selección previa (como exige el CLAUDE.md) para evitar reinicios accidentales y posibles inconsistencias de tracking al cambiar de modo a mitad de partida.
- [ ] Añadir lectura en voz alta (TTS Web Speech) de la palabra del bloque, especialmente útil para los primeros cursos de Primaria y para el uso en Atención a la Diversidad.
- [ ] Registrar `durationSeconds` real (medir tiempo de inicio a 'won') y revisar el `maxScore` del examen para que refleje el máximo realmente alcanzable, mejorando la calidad del ranking.
- [ ] Introducir una verdadera mecánica de derrota/equilibrio (p. ej. la torre se desmorona tras X errores o bloques temblorosos acumulados) y, opcionalmente, soporte de duelo 1 vs 1 con un TorrePalabrasDuel + DuelChatBar para sumarla a duelableApps.

### 🔎 Busca el Intruso `(busca-el-intruso)`
- [ ] Implementar el useRef anti-doble-disparo obligatorio sobre onGameComplete y disparar tambien la nota parcial en el cleanup si el alumno abandona el examen a medias (como en Anagramas).
- [ ] Unificar la formula de puntuacion: la tarjeta de resultados y finalizarTest usan calculos distintos, de modo que los puntos mostrados al alumno no son los que se envian al ranking; deberian coincidir.
- [ ] Adoptar el patron estandar de selector previo de dificultad (easy/medium/exam) en lugar de botones que cambian de modo a mitad de partida, evitando reinicios que rompen el conteo; p. ej. graduar tamano de rejilla, tiempo por ronda o introducir 'casi-intrusos' mas dificiles en medium/exam.
- [ ] Anadir accesibilidad por teclado (navegacion con flechas + Enter/Espacio) y soporte TTS opcional para leer la categoria, util en Primaria temprana y Atencion a la Diversidad.

### 🗂️ Clasificador `(clasificador)`
- [ ] Añadir lectura por voz (TTS con SpeechSynthesis) de la palabra mostrada para reforzar la asociación oído-significado, especialmente valioso en el bloque AD de conciencia fonológica y lectoescritura.
- [ ] Introducir un tercer nivel de dificultad real (p. ej. 'difícil' con más de 4 categorías visibles o con tiempo por pregunta) para alinearse mejor con el patrón easy/medium/exam y aumentar el techo de reto.
- [ ] Soportar control por teclado (teclas 1-4 para elegir categoría) para mejorar accesibilidad y la velocidad en el modo examen, hoy solo jugable con ratón/táctil.
- [ ] Sustituir el ConfettiEffect manual por canvas-confetti (ya usado en otras apps) para unificar el feedback celebrativo y reducir coste de render con muchos motion.div.

### 🧠 Juego de Memoria `(juego-memoria)`
- [ ] Corregir el cálculo de la nota de derrota para usar el gridSize dinámico en lugar de la constante GRID_SIZE=9, evitando notas mal escaladas (e.g. con 12 cajas se puede superar 10 y con 6 nunca se llega a 10).
- [ ] Sustituir la penalización de reinicio total del progreso por una más graduada (p. ej. perder solo la racha actual o N posiciones) para reducir frustración, sobre todo con 12 cajas; opción de 'vidas' configurable.
- [ ] Añadir TTS / lectura en voz de la palabra objetivo (útil en inglés/valenciano y en atención a la diversidad) y un botón de 'Material de estudio' con las palabras de la categoría agrupadas, alineando la app con el patrón de InstructionsModal compartido.
- [ ] Alinear los modos con el estándar de la plataforma (pantalla previa fácil/medio/examen mapeada a las configuraciones actuales) y registrar formalmente la app como single_mode en app_scoring_config; opcionalmente crear un JuegoMemoriaDuel para soportar duelo 1 vs 1.

### 🟨 Education Dash `(runner)`
- [ ] Migrar al patrón de modos estándar de la plataforma (pantalla previa fácil/medio/examen) o, al menos, hacer que 'examen' sea un modo explícito y no un toggle que el alumno puede desactivar, para garantizar que las partidas cuenten correctamente como intento de tarea.
- [ ] Mostrar la nota /10 y el mensaje cualitativo (Excelente/Muy bien/Aprobado/Necesitas repasar) en la pantalla de Game Over del modo examen, hoy ausente: el alumno solo ve 'puntos' y la nota se calcula silenciosamente en el tracker.
- [ ] Convertir Education Dash en app duelable 1 vs 1 (RunnerDuel.jsx + duelableApps + DuelChatBar) usando seed determinista de spawns para que ambos jugadores afronten el mismo recorrido y comparen palabras correctas/tiempo.
- [ ] Añadir feedback sonoro y/o accesibilidad (TTS de la palabra al aproximarse, indicador de error más claro), y revisar el maxScore=1000 arbitrario para que el high_score y el ranking reflejen mejor el rendimiento real.

### 🚀 Nave Palabras `(nave-palabras)`
- [ ] Unificar la física del duelo con la del modo solo (migrar NavePalabrasDuel a velocidades en px/seg con deltaTime en lugar de SHIP_SPEED/PROJ_SPEED por frame en setInterval), para que la jugabilidad sea idéntica entre dispositivos y no dependa del tick fijo.
- [ ] Añadir feedback sonoro y/o confeti (canvas-confetti) en aciertos, combos altos y al recuperar cadencia, e integrar TTS opcional para leer la palabra al impactarla, reforzando vocabulario y accesibilidad en Atención a la Diversidad.
- [ ] Permitir elegir o fijar la categoría objetivo de forma persistente y mostrar al final un desglose por palabras acertadas/falladas (qué términos se confundieron), convirtiendo el resumen en material de repaso real.
- [ ] Revisar el cálculo de nota: hoy es min(10, hits) sin penalizar fallos, por lo que un alumno disparando a todo puede sumar aciertos; considerar una métrica de precisión (aciertos vs fallos) o capar por ratio para que la nota refleje discriminación real, no solo volumen de disparos.

### 🐍 Snake `(snake)`
- [ ] Unificar la nota del examen: hacer que la nota mostrada en el Game Over y la enviada a la plataforma coincidan (pasar 'nota' explícita en onGameComplete o adoptar la fórmula estándar correct/total·10) para evitar discrepancia entre lo que ve el alumno y lo que se registra.
- [ ] Añadir refuerzo educativo inmediato al fallar: mostrar brevemente a qué categoría pertenecía realmente el intruso comido (o por qué no era válido) para convertir el error en aprendizaje, e incorporar feedback sonoro y confeti en hitos de racha como hacen otras apps.
- [ ] Integrar el material de estudio/instrucciones estándar (InstructionsModal + botón 'Ver material de estudio') ya presente en otras apps, además del cheat-sheet actual, para coherencia con el resto de la plataforma.
- [ ] Robustecer el bucle de juego del modo individual reemplazando el patrón savedCallback re-asignado en cada render por un tick basado en requestAnimationFrame con paso fijo o un reducer determinista, mejorando estabilidad y permitiendo reutilizar lógica con el duelo.

### 🌧️ Lluvia de Palabras `(lluvia-de-palabras)`
- [ ] Añadir retroalimentación auditiva (TTS de la palabra al caer o al atraparla, especialmente útil en inglés y en Atención a la Diversidad) y un canvas-confetti al superar el examen, alineándolo con el resto de apps.
- [ ] Revisar la nota de examen para que respete el rango 0–10 (o documentar explícitamente que `fast` puede exceder 10) y mostrar el mensaje cualitativo estándar (Excelente/Muy bien/Aprobado/Necesitas repasar) en el resumen.
- [ ] Incorporar control por teclado (flechas para intercambiar cajas) y arrastre táctil de las palabras, mejorando accesibilidad y la experiencia en móvil.
- [ ] Implementar el modo duelo 1 vs 1 (LluviaDePalabrasDuel.jsx + registro en duelableApps con DuelChatBar) dado que el bucle por puntuación encaja bien con una partida simétrica.

### 🃏 Parejas de Cartas `(parejas)`
- [ ] Disparar onGameComplete tambien en el cleanup/desmontaje (patron de Anagramas) para registrar nota parcial cuando el alumno abandona un examen a medias, evitando exámenes 'fantasma' sin registro.
- [ ] Alinear con el contrato del CLAUDE.md: mensajes de nota (Excelente/Muy bien/Aprobado/Necesitas repasar) y valorar nombrar los modos easy/medium/exam; revisar si los modificadores -1/+1 deben mantenerse o sustituirse por la doble progresion estandar (nota capada + puntos paralelos).
- [ ] Anadir accesibilidad y control por teclado (foco navegable, Enter/Espacio para girar carta, aria-labels) y, opcionalmente, TTS del termino para reforzar en AD y en idiomas.
- [ ] Reemplazar el barajado sesgado (sort aleatorio) por un Fisher-Yates correcto y considerar soporte de duelo 1 vs 1 (ParejasDuel + DuelChatBar) dado que la mecanica por turnos encaja bien en formato competitivo.

### 🎯 Cazapalabras 3D `(cazapalabras-3d)`
- [ ] Añadir audio: efectos de disparo/impacto y, opcionalmente, lectura por voz (speechSynthesis) de la palabra al acertarla o de la definición, reforzando la asociación grafía-fonema sin penalizar rendimiento.
- [ ] Soportar duelo 1 vs 1 (componente Cazapalabras3DDuel con DuelChatBar y registro en duelableApps.js), aprovechando que ya hay semilla determinista posible vía pickPair/spawnFlyer con un rng inyectado para igualar las dianas de ambos jugadores.
- [ ] Modo accesible/baja exigencia motriz: opción de mirilla magnética (snap suave a la diana válida más cercana) o ralentización global, para alumnado de Atención a la Diversidad o con dificultades de coordinación, sin alterar la lógica de puntuación.
- [ ] Resumen final más formativo: listar las palabras válidas que escaparon o se ignoraron y las definiciones falladas, con su solución, para convertir el cierre de partida en repaso dirigido.

### 🏰 La Fortaleza `(la-fortaleza)`
- [ ] Completar el duelo 1vs1 ya cimentado: crear FortalezaDuel.jsx que use injectEnemies/onProgress, montar DuelChatBar y registrarlo en duelableApps.js (el motor ya lo soporta, es el siguiente paso natural).
- [ ] Aumentar el número de categorías activas simultáneas o permitir más de 4 colores con asignación rotatoria, para cursos con muchas categorías donde el subconjunto de 3 deja gran parte del vocabulario fuera de la mecánica visual.
- [ ] Persistir y mostrar al docente métricas académicas más finas por formato (def/rev/vf/cat/intruso) en el resumen, ya que academicRef solo agrega questions/classify/boss; ayudaría a detectar qué destreza falla el alumno.
- [ ] Ofrecer un nivel intermedio entre Práctica (sin nota) y Examen (nivel 9 fijo), p.ej. un 'Medio' con menos preguntas escritas o pistas parciales, para suavizar la curva sin saltar directamente al examen sin ayudas.

### ⛏️ Excavación Selectiva `(excavacion-selectiva)`
- [ ] Llevar un recuento real de aciertos/errores/distractores en el hook y enviarlo en onGameComplete (correctAnswers/totalQuestions reales) en lugar de derivarlos del score; mostrar también precisión (% de bloques correctos) en la pantalla final.
- [ ] Sustituir window.location.reload() de 'NUEVA PARTIDA' por un reinicio de estado del hook (resetear data/score/timer) para evitar recargar toda la página y volver a pedir datos a Supabase.
- [ ] Adoptar el ajuste GLOBAL de calidad gráfica (src/services/graphicsQuality.js + useGraphicsQuality + GraphicsQualitySelector con Canvas key={tier}) para dispositivos modestos, ya que la escena 3D con texturas procedurales y partículas puede ser exigente.
- [ ] Añadir feedback sonoro/TTS (leer la palabra minada o la consigna) y canvas-confetti al lograr estrellas o combos altos, reforzando la asociación palabra-categoría y la accesibilidad para Atención a la Diversidad.

### 📝 Ordena la Frase `(ordena-la-frase)`
- [ ] Normalizar la comparación de respuestas (trim, colapsar espacios y, opcionalmente, ignorar mayúsculas/tildes) para evitar falsos negativos por datos de BD con puntuación o espacios irregulares.
- [ ] Revisar la puntuación cuando NO hay temporizador (primaria 1º-2º): con elapsedTime=0 el timeBonus da el máximo (300) sin esfuerzo; convendría desactivar el bonus de tiempo o aplicar uno alternativo en esos cursos para un ranking justo.
- [ ] Añadir feedback por frase en examen (marcar verde/rojo al pasar de pregunta) o al menos resaltar la palabra fuera de sitio, conservando el carácter de examen pero mejorando el valor formativo.
- [ ] Soportar frases con varias soluciones válidas (p. ej. orden alternativo de complementos) marcando aceptadas en BD, e incorporar audio TTS opcional de la frase formada para reforzar comprensión oral en AD.

### 📚 Ordena la Historia `(ordena-la-historia)`
- [ ] Permitir contenido con audio (TTS con SpeechSynthesis para escuchar cada frase, útil en lectoescritura y AD), ya que actualmente no hay narración por voz.
- [ ] Robustecer la validación: comparar por identidad/índice de frase en vez de por texto concatenado para soportar relatos con frases repetidas y evitar falsos aciertos; mostrar en resultados qué historias falló el alumno (ahora solo muestra el orden correcto, no su respuesta).
- [ ] Añadir niveles de dificultad explícitos (nº de frases por historia, con/sin pistas de conectores, o frases intrusas) en pantalla previa, alineando la app con el patrón estándar easy/medium/exam.
- [ ] Incorporar duelo 1 vs 1 (OrdenaLaHistoriaDuel + registro en duelableApps con DuelChatBar) reutilizando el hook, ya que la mecánica por rondas encaja bien con el formato de duelo.

### 🕵️ Detective de Palabras `(detective-de-palabras)`
- [ ] Unificar al patrón estándar de selección previa easy/medium/exam (p. ej. fácil = frases cortas con ayuda de marcado en vivo, medio = sin ayuda, examen = actual) en lugar de los dos botones de modo, para alinearse con el resto de apps y con el tracking de tareas.
- [ ] Pasar nota explícita en onGameComplete y desacoplar la comparación de la tipografía (normalizar mayúsculas/acentos al comparar) para que elegir 'Mayúsculas' no altere la corrección.
- [ ] Añadir control por teclado/accesibilidad (espacio/flechas para mover el cursor de separación y marcar) y soporte de lector de pantalla en los separadores, hoy solo accionables con clic.
- [ ] Incorporar InstructionsModal/botón de material de estudio y feedback sonoro opcional; además, en examen, mostrar marcado por color de los espacios acertados/fallados en el resumen para reforzar el aprendizaje.


## 📖 Comprensión lectora y oral

### 📖 Comprensión Escrita `(comprension-escrita)`
- [ ] Unificar la fórmula de puntos: usar una sola función de cálculo para el valor enviado en onGameComplete y el mostrado en el summary, eliminando la divergencia actual entre la línea de finalizar() y la del render.
- [ ] Resaltar la respuesta correcta dentro del texto o añadir una breve justificación/explicación por pregunta en la corrección, para reforzar el aprendizaje inferencial, no solo marcar acierto/fallo.
- [ ] Añadir TTS también a la variante escrita (ya existe la infraestructura SpeechSynthesis) como apoyo opcional de accesibilidad, e incluir resaltado de la palabra leída (karaoke) para lectores con dificultades.
- [ ] Permitir barajar el orden de las opciones y evitar repetir ejercicios ya completados en la misma sesión, además de exponer dificultad por longitud de texto/nº de preguntas para diferenciar niveles.

### 🎧 Comprensión Oral `(comprension-oral)`
- [ ] Unificar la fórmula de puntos: el totalPoints mostrado en la pantalla de resultado debe ser exactamente el enviado a onGameComplete (hoy difieren) para que el alumno vea los puntos reales que cuentan en el ranking.
- [ ] Limitar el 'Material de Estudio' en modo oral: ocultar el texto completo (o mostrarlo solo tras corregir) y/o no exponer las preguntas antes de responder, para que la escucha siga siendo el canal de entrada y no se rompa la naturaleza de comprensión oral.
- [ ] Robustez del TTS: detectar ausencia de SpeechSynthesis o de voces es-ES y ofrecer un aviso/fallback (selección de voz disponible o audio pregrabado), además de permitir un número máximo de reproducciones para subir la exigencia.
- [ ] Tracking de abandono y reescucha controlada: registrar partida parcial si se sale en preguntas (como Anagramas) y registrar cuántas veces se ha reproducido el audio como señal pedagógica para el docente.


## 🧮 Matemáticas

### 🔴 Ordena las Bolas `(ordena-bolas)`
- [ ] Unificar el motor físico y el generador de bolas en un módulo compartido (`_shared/`) para eliminar la duplicación entre OrdenaBolas y OrdenaBolasDuel y reducir el riesgo de divergencia.
- [ ] Sustituir la muerte súbita por un modelo de vidas o penalización de tiempo, y calcular una nota /10 graduada (p. ej. proporción de bolas ordenadas antes de fallar) en vez de 10/0, evitando que la nota sea binaria.
- [ ] Acoplar la dificultad al modo de tarea/examen (fijar nº de bolas, giro y operaciones según curso/dificultad como en el duelo) para que la nota sea comparable y el alumno no pueda trivializar con 3 bolas; añadir además una capa de 'puntos paralelos' coherente con la guía.
- [ ] Integrar el selector global de calidad gráfica (`useGraphicsQuality`) y escalar `pixelRatio`/tamaño del tablero de forma responsive; añadir un modal de instrucciones (InstructionsModal) que hoy no existe en la app.

### 🧮 Fracciones PRO `(fracciones-eso)`
- [ ] Añadir niveles de dificultad seleccionables (rangos de denominadores/numeradores, fracciones impropias, operaciones encadenadas de 3 fracciones) para diferenciar 1º ESO de Bachillerato, hoy idénticos.
- [ ] Incorporar un useRef anti-doble-disparo en onGameComplete y reportar también partidas de práctica como mode:'practice' para que cuenten en XP/ranking, igual que el resto de apps.
- [ ] Pasar una 'nota' explícita en onGameComplete con puntos paralelos (racha/rapidez) coherentes con la guía 3.2, y mostrar mensajes Excelente/Muy bien/Aprobado/Necesitas repasar en el dashboard de resultados.
- [ ] Convertirla en duelable (FraccionesESODuel.jsx + DuelChatBar + alta en duelableApps) y/o aprovechar la mecánica de pasos intermedios para una variante con conversión de fracción a número mixto o a decimal.

### 📐 Regla de Tres `(regla-de-tres)`
- [ ] Añadir un modo duelo 1 vs 1 (ReglaDeTresDuel.jsx + registro en duelableApps + DuelChatBar) ya que la generación procedural con seed determinista encajaría bien para enfrentar a dos alumnos con los mismos problemas.
- [ ] Incluir feedback de audio/TTS opcional para leer el enunciado (accesibilidad) y un temporizador visible por pregunta en examen para que el bonus de velocidad sea percibible.
- [ ] Ampliar a regla de tres compuesta (tres o más magnitudes) y a problemas de proporcionalidad mixta como cuarto nivel, aprovechando que el generador ya separa directa/inversa.
- [ ] Permitir respuesta razonada opcional (elegir primero si es directa o inversa antes de calcular) para reforzar el diagnóstico del tipo de proporción, fuente típica de errores.

### 📊 Porcentajes y Proporciones `(porcentajes-proporciones)`
- [ ] Adaptar la dificultad/tipos al curso real leyendo level/grade de useParams (p. ej. limitar variación y escalas en Primaria y reforzar IVA/repartos en ESO), ya que hoy el banco es idéntico para 5º Primaria y 4º ESO.
- [ ] Añadir un breve repaso teórico ('material de estudio') accesible desde el setup con las fórmulas clave y un ejemplo resuelto por tipo, reutilizando los componentes visuales SVG ya existentes (PieChart, StackBars, ProportionEq).
- [ ] Incluir la app en duelableApps.js con un PorcentajesDuel (mode:'duel' + DuelChatBar) para aprovechar el formato de 10 preguntas cronometradas en 1vs1.
- [ ] Mostrar en el summary del examen un desglose por tipo de problema (aciertos en porcentajes vs proporciones vs IVA, etc.) para que el alumno detecte su punto débil, aprovechando que examHistory ya guarda label/type por pregunta.

### 🔄 Giros y Rotaciones `(rotaciones-grid)`
- [ ] Reportar también las partidas de práctica (o al menos un onGameComplete con mode:'practice') y, como en Anagramas, disparar nota parcial en el cleanup si el alumno abandona el examen a medias, para no perder el intento.
- [ ] Añadir traslaciones y simetrías (reflexiones) como nuevos tipos de transformación, e incluir ángulos no rectos o composición de movimientos, para extender la app a ESO y enriquecer el bloque de isometrías.
- [ ] Validar que toda figura rotada quepa dentro de la malla 9x9 (o ampliar/recentrar dinámicamente) y permitir pintar arrastrando el ratón/dedo para mejorar la jugabilidad táctil.
- [ ] Convertirla en app con duelo 1 vs 1 (FortalezaDuel-style) o añadir feedback sonoro/TTS del enunciado para accesibilidad, alineándola con el resto de apps de la plataforma.

### 🏛️ Números Romanos `(numeros-romanos)`
- [ ] Añadir el modo inverso (mostrar un romano y pedir el arábigo) e intercalarlo, para entrenar la conversión en ambos sentidos en lugar de sólo arábigo→romano.
- [ ] Implementar el patrón estándar de selección previa de dificultad (easy/medium/exam) o al menos un modo medio con ayudas intermedias, y soporte de duelo 1 vs 1 (componente Duel + DuelChatBar) ya que la mecánica de fichas encaja bien en pique.
- [ ] Reforzar la accesibilidad y el uso en táctil/teclado: el drag&drop HTML5 nativo falla en muchos móviles (sólo queda el click); convendría drag táctil real o navegación por teclado y aria-labels en las fichas.
- [ ] Mostrar feedback didáctico más rico en el fallo del examen (resaltar qué regla se incumplió y la descomposición canónica), aprovechando que validateRomanStructure ya conoce el motivo de invalidez.

### ⚖️ Mayor, Menor o Igual `(mayor-menor)`
- [ ] Añadir soporte de teclado (teclas <, =, > y flechas para reordenar) y arrastrar-soltar real para el sub-modo ordenar, mejorando accesibilidad y rapidez frente al actual botón ⇄.
- [ ] Exponer el sub-modo 'ordenar' como ficha de catálogo propia con su pantalla de dificultad y registrar duelo 1 vs 1 (duelableApps + componente Duel) dado que la mecánica encaja bien en comparación rápida.
- [ ] Endurecer generateOrderProblem para evitar valores duplicados y órdenes ambiguos, y validar el orden de forma estricta cuando se desee solución única; añadir explicación del porqué del signo en los fallos del examen (no solo 'Era >').
- [ ] Permitir contenido curable/temático desde la BD vía getAppContent (p. ej. problemas contextualizados o por evaluación) para que el docente pueda ajustar dificultad sin tocar el generador procedural.

### 🔢 Ordena los Números `(ordena-numeros)`
- [ ] Mostrar la nota /10 con color (verde>=8, azul>=5, rojo<5) y mensaje (Excelente/Muy bien/Aprobado/Necesitas repasar) en la pantalla de Resultados, tal como pide la guía 3.1, en lugar de solo 'score/10' y puntos brutos.
- [ ] Sustituir el intercambio por botón ⇄ por arrastrar y soltar real (con soporte táctil) y permitir reordenar a cualquier posición, no solo adyacentes, para una manipulación más natural; añadir también navegación por teclado por accesibilidad.
- [ ] Garantizar que el conjunto inicial nunca aparezca ya ordenado (re-barajar si el orden de partida coincide con el correcto) y evitar valores duplicados consecutivos para que la solución sea siempre única.
- [ ] Crear un componente OrdenaNumerosDuel y registrarlo en duelableApps.js (montando DuelChatBar) para ofrecer la modalidad 1vs1, dado que el motor de examen por preguntas se presta bien a ello.

### 📏 Medidas (Longitud, Masa y Capacidad) `(medidas)`
- [ ] Permitir reordenar en modo Ordenar con drag & drop (ya hay framer-motion layout) y soporte de teclado, manteniendo los botones ⇄ como alternativa accesible.
- [ ] Mostrar en el resumen del examen, para las preguntas de Ordenar falladas, la secuencia correcta de menor a mayor (hoy solo dice 'Incorrecto'), para que el repaso sea formativo.
- [ ] Añadir TTS/lectura en voz alta de las medidas y de la escalera de unidades para Atención a la Diversidad y primeros cursos, reutilizando el patrón TTS de la plataforma.
- [ ] Habilitar duelo 1vs1 (MedidasDuel + DuelChatBar) con problemas deterministas por semilla compartida, dado que el contenido es generado y sería sencillo sincronizar el seed entre rivales.

### ➕ Sumas `(sumas)`
- [ ] Añadir feedback de audio/voz (TTS) leyendo el resultado y refuerzo accesible, dado que hoy solo hay confeti visual; ayudaría a alumnado con dificultades lectoras o visuales.
- [ ] Eliminar el cálculo de score vestigial de cada componente (hits·200/setScore no se usa para ranking) y centralizar toda la puntuación en MathOperationLayout para reducir duplicación y posibles desajustes.
- [ ] Hacer configurable el número de preguntas del examen (hoy fijo en 5) y dar realimentación inmediata por dígito en examen, además de blindar el reporte cuando el tiempo transcurrido sea 0 s.
- [ ] Mejorar la experiencia táctil sustituyendo o complementando el drag-and-drop HTML5 nativo por pointer events, y considerar un modo duelo 1 vs 1 reutilizando el patrón de duelos de la plataforma.

### ➖ Restas `(restas)`
- [ ] Unificar las seis variantes en un único componente parametrizado (rango de cifras, decimales, modo 'a completar') sobre UniversalSubtractionBoard para eliminar la duplicación masiva de lógica de generación, llevadas y test entre RestasPrimaria1..6.
- [ ] Hacer que el examen conserve la mecánica de columna con llevadas y decimales (en vez de pedir solo el resultado entero en OperationTestBoard) para que evalúe lo que realmente se ha practicado, incluyendo decimales en 4º-6º.
- [ ] Añadir control por teclado (números 0-9, flechas para cambiar de casilla, Enter para comprobar) y soporte de lectura por voz (TTS) del enunciado para accesibilidad.
- [ ] Registrar también la práctica libre como sesión ligera (o un mini-resumen de aciertos) para alimentar progreso/insignias sin penalizar, y mostrar racha de restas correctas seguidas.

### ✖️ Multiplicaciones `(multiplicaciones)`
- [ ] Unificar el examen de 6º para que incluya multiplicaciones con decimales (su competencia clave), reutilizando el motor de la práctica en vez de generar enteros 3×3.
- [ ] Extraer un motor común (generación + cálculo de parciales/acarreos/suma) a _shared para eliminar la duplicación entre las cuatro variantes y reducir el riesgo de divergencias.
- [ ] Permitir que la práctica registre progreso ligero (sesión completada / XP por operación resuelta) o introducir un modo intermedio puntuable, ya que hoy solo el examen cuenta para tareas y ranking.
- [ ] Añadir soporte de teclado físico para introducir cifras y navegar entre casillas (accesibilidad y velocidad), además del ratón/táctil y arrastrar.

### ➗ Divisiones `(divisiones)`
- [ ] Hacer que el modo examen evalúe la división completa (cociente + resto, y la coma decimal en 6º) reutilizando la rejilla en caja en lugar de pedir solo el cociente entero, para que la nota refleje la destreza real que se practica.
- [ ] Añadir entrada por teclado físico (números 0-9, flechas para mover el foco, Enter para comprobar) además del clic/drag, mejorando accesibilidad y velocidad en sobremesa.
- [ ] Emitir onGameComplete también en práctica libre (mode:'practice') o introducir niveles easy/medium como define el estándar de la plataforma, para que el entrenamiento sin examen otorgue algo de progreso y tracking.
- [ ] Unificar las tres variantes en un único componente parametrizado por nivel (divisor/dividendo/decimales) para eliminar la duplicación de calculateSolutionPlan y reducir el riesgo de divergencia de bugs entre P4/P5/P6.

### 🛒 Supermercado Matemático `(supermercado-matematico)`
- [ ] Unificar la generación de misiones en un único archivo de configuración por curso (tipo de operación, rangos de precio, topes y pesos de cada problema) para eliminar la duplicación entre las 6 variantes y permitir afinar dificultad sin tocar 6 componentes casi idénticos.
- [ ] Añadir InstructionsModal + un panel de 'cómo calcular el cambio/descuento' y, opcionalmente, una pista paso a paso, alineándolo con el patrón de instrucciones de la plataforma.
- [ ] Incorporar feedback sonoro (acierto/error) y revisar el formato del feedback de error para respetar enteros (mostrar '6€' en vez de '6,00€' en las variantes 1-3), reutilizando el helper formatPrice de TestScreen también en práctica.
- [ ] Valorar implementar el modo duelo 1 vs 1 (componente SupermercadoMatematicoDuel + DuelChatBar) ya que el examen de 5 preguntas rápidas encaja bien con un enfrentamiento por velocidad y aciertos.

### 📈 Laboratorio de Funciones 2D `(laboratorio-funciones-2d)`
- [ ] Añadir un modo 'Reto/Examen' opcional que muestre una gráfica objetivo y pida ajustar parámetros hasta replicarla (con tolerancia), integrando onGameComplete + useGameTracker, nota /10 y confeti, para que pueda contar como tarea sin perder el modo libre de exploración.
- [ ] Permitir superponer varias funciones a la vez (multitrazo con colores distintos) para comparar familias o ver el efecto de cambiar un parámetro frente a la curva original; hoy solo se dibuja una curva.
- [ ] Mostrar elementos analíticos calculados: raíces, vértice, puntos de corte con los ejes, asíntotas marcadas y dominio, además del actual tooltip de coordenadas, reforzando el contenido curricular de análisis de funciones.
- [ ] Añadir paneo arrastrando el lienzo y zoom con rueda/pellizco (actualmente el zoom solo se controla por botones y el centro es fijo), y corregir/alinear la etiqueta del catálogo (docs/app-catalog.md indica 'Recharts' cuando el render real es SVG a mano).

### 🧊 Laboratorio de Figuras 3D `(visualizador-3d)`
- [ ] Añadir un modo evaluable opcional (quiz tipo examen): mostrar una figura con dimensiones dadas y pedir calcular volumen o área, con nota /10, useGameTracker/onGameComplete, ranking y feedback (confeti/sonidos) siguiendo el patrón estándar de la plataforma, conservando el laboratorio libre como modo de exploración.
- [ ] Enganchar la app al ajuste global de calidad gráfica (useGraphicsQuality + GraphicsQualitySelector con Canvas key={tier}), añadir governor de FPS y recuperación de contexto WebGL como en laboratorio-fisica, para robustez en tablets y móviles de gama baja.
- [ ] Visualizar elementos didácticos sobre la figura: contador y resaltado de caras, aristas y vértices (relación de Euler V-A+C=2), desarrollo plano (red) desplegable, y opción de mostrar las medidas acotadas sobre el modelo para reforzar la conexión geometría-fórmula.
- [ ] Sincronizar el tamaño real del sólido renderizado con la arista de las fórmulas (eliminar los factores de escala 0.8/1.2/1.7/1.4 o reflejarlos en el cálculo) y permitir comparar dos figuras lado a lado para estudiar relaciones de volumen entre cuerpos.


## 🔬 Ciencia y naturaleza

### 🧲 Laboratorio de Física 3D `(laboratorio-fisica)`
- [ ] Implementar el duelo 1 vs 1 ya previsto en el diseño (reto contrarreloj con misma semilla, mode='duel' + DuelChatBar), que daría a esta app integración en el sistema de duelos como el resto de apps duelables.
- [ ] Persistir el progreso de Retos por alumno (hoy retosDone/retosPoints viven solo en estado local y se pierden al salir); guardarlo permitiría retomar misiones y mostrar avance acumulado entre sesiones.
- [ ] Permitir al docente elegir qué simulaciones entran en el examen o fijar la semilla, para alinear el examen con la unidad trabajada en clase (hoy la semilla deriva de Date.now y el pool es automático por curso).
- [ ] Añadir un breve 'porqué' tras cada predicción fallida del examen (mini-explicación del cálculo correcto con la fórmula viva), reforzando la fase Explica más allá del test de opción múltiple.

### 🧪 Mesa de Crafteo `(mesa-crafteo)`
- [ ] Corregir la etiqueta de curso ('º ESO' fija) para que muestre el nivel real (ESO/Bachillerato) y, ya puesto, internacionalizar gradeLabel a partir de level/grade reales del wrapper.
- [ ] Servir las recetas de moléculas también desde getAppContent (como elementos-quimica) en lugar del fichero local, para poder ampliar/editar el catálogo por curso sin desplegar y alinearlo con el resto de apps.
- [ ] Añadir soporte de duelo 1 vs 1 (MesaCrafteoDuel.jsx + DuelChatBar + alta en duelableApps.js): el motor de validación por grafo encaja bien en un reto de velocidad de construcción.
- [ ] Revisar el maxScore enviado a onGameComplete para que refleje un máximo realmente alcanzable (tiempo mínimo) y así el porcentaje del ranking sea más justo y comparable entre alumnos.

### 🔬 Entrenador de Tabla Periódica `(entrenador-tabla)`
- [ ] Alinear con el contrato de la plataforma: separar claramente práctica (mode:'practice') de examen (mode:'test') para que la Práctica Libre no compute como intento de tarea, y mostrar la nota /10 prominente con su mensaje y color en la pantalla de resultados (hoy solo enseña aciertos y porcentaje).
- [ ] Exponer en la UI el ámbito por rango de número atómico (ya soportado en config.range y en el pool) y restringir los distractores al ámbito seleccionado, para que el modo 'por familias' o por rango sea coherente y no mezcle elementos de fuera.
- [ ] Activar las pistas ya implementadas atomicToName/protonsToName/electronsToName (número atómico, protones, electrones) como tipos de pregunta seleccionables, ampliando las destrezas más allá de símbolo↔nombre.
- [ ] Robustez y accesibilidad: guard ante description ausente, integrar InstructionsModal + botón 'Ver material de estudio' del patrón compartido, y añadir TTS opcional para nombres/símbolos; sustituir el botón SALIR sin confirmación por un modal propio coherente con el resto de la plataforma.

### 🌌 Sistema Solar 3D `(sistema-solar)`
- [ ] Integrar el selector global de calidad gráfica (src/services/graphicsQuality.js + useGraphicsQuality + GraphicsQualitySelector y Canvas con key={tier}) para escalar instancedMesh del cinturón, número de estrellas/polvo y resolución de texturas en equipos modestos, tal y como exige CLAUDE.md para apps 3D.
- [ ] Convertir el 'Desafío de Planetas' en un modo examen real que llame a onGameComplete con mode:'test', nota /10 y puntos (aciertos en ordenar + emparejar, con bonus por tiempo): así se desbloquearían los avatares avatar_032/avatar_050 (hoy inalcanzables por exigir mode:'test') y la app aportaría a la nota.
- [ ] Añadir narración por voz (TTS con speechSynthesis) de las descripciones e hitos, y feedback sonoro/confeti (canvas-confetti) en la fase de éxito del mini-juego, para reforzar accesibilidad y motivación.
- [ ] Persistir visitedHotspots en Supabase por alumno (en lugar de solo localStorage) para sincronizar el progreso de exploración entre dispositivos y poder mostrar logros de 'sistema explorado al 100%'.

### 🔬 La Célula Animal `(celula-animal)`
- [ ] Cablear onGameComplete en el modo Reto (y opcionalmente en el Test, fijando un número de rondas) para que la nota /10 y los puntos cuenten realmente hacia la tarea, XP, insignias y ranking, protegido con un useRef anti-doble-disparo como exige el contrato de la plataforma.
- [ ] Hacer el Test finito y evaluable (p. ej. localizar los 13 orgánulos una vez, con temporizador y racha) para poder enviar correctAnswers/totalQuestions y puntos paralelos por velocidad.
- [ ] Añadir accesibilidad y feedback sonoro: navegación por teclado entre orgánulos, foco visible, lectura TTS de la ficha (patrón ya usado en otras apps) y sonidos de acierto/error, además de respetar el ajuste global de calidad si se animan más elementos.
- [ ] Enriquecer el contenido y la rejugabilidad: distractores en el Reto que mezclen funciones de orgánulos no presentes en la ronda, un modo 'comparar con célula vegetal' enlazando con celula-vegetal, y barajado de qué texto se pide emparejar (función/estructura/descripción) en lugar de solo el subtítulo.

### 🌿 La Célula Vegetal `(celula-vegetal)`
- [ ] Cablear onGameComplete: enviar la nota /10 del Reto y la puntuación del Test (con useRef anti-doble-disparo) para que la app cumpla de verdad su rol single_mode y otorgue XP, insignias, avatares y ranking.
- [ ] Añadir un botón de instrucciones reutilizando _shared/InstructionsModal y un modal de 'material de estudio' con el glosario de orgánulos (descripciones y funciones agrupadas), siguiendo el patrón de la plataforma.
- [ ] Enriquecer el modo Reto para usar las varias funciones de cada orgánulo (hoy solo functions[0]) y/o un modo examen formal con preguntas sobre fotosíntesis, turgencia y pared celular, además del simple emparejamiento.
- [ ] Lectura por voz (TTS) de descripciones y datos curiosos y mejoras de accesibilidad/teclado (navegación entre orgánulos sin ratón), ya que ahora todo depende de pointer events.

### 🗺️ Infografías Interactivas `(infografias-interactivas)`
- [ ] Activar el modo de etiquetado sobre la imagen ya esbozado en los datos (zones + isZoneAnswerCorrect + normalizeAnswer): arrastrar o escribir etiquetas en los puntos numerados antes del test, aprovechando el código ya existente pero hoy sin usar.
- [ ] Añadir puntos paralelos (bonus por tiempo/racha) y enviarlos en score/maxScore para cumplir la doble progresión del CLAUDE.md y dar más recorrido al ranking, hoy limitado a un maxScore fijo de 10.
- [ ] Migrar el catálogo a contenido editable por Supabase (getAppContent) para que profesorado o admin pueda crear nuevas infografías sin desplegar código, e incorporar más temas de Lengua, Historia y Geografía (hoy el catálogo es muy STEM).
- [ ] Mejorar accesibilidad y feedback: lectura por voz (TTS) de la pregunta y de la solución, barajado de opciones y de preguntas para evitar memorización del orden, y revisión que enlace cada fallo con la zona concreta de la infografía.


## 🤖 Programación y robótica

### 🤖 Programa al Robot (bloques) `(programacion-bloques)`
- [ ] Sustituir los window.confirm/window.alert de guardar/borrar niveles (saveEditor, removeLevel) por modales propios con motion.div, como exige CLAUDE.md, para coherencia y para no romper la UX en móvil.
- [ ] Añadir una pantalla de Resumen real en modo examen con la nota /10 prominente y coloreada (verde>=8 / azul>=5 / rojo<5) y mensaje cualitativo, en lugar de depender solo del banner por nivel; hoy no hay summary y el contrato de nota /10 del proyecto se cumple de forma implícita.
- [ ] Soporte de duelo 1 vs 1 (componente ProgramacionBloquesDuel + registro en duelableApps + DuelChatBar): por ejemplo, resolver el mismo nivel en menos bloques o menos tiempo, aprovechando que el motor ya es determinista y produce un trace y un conteo de pasos.
- [ ] Soporte táctil/teclado para el drag&drop (actualmente solo HTML5 drag nativo, poco usable en tabletas) y un control de velocidad de la animación (240ms fijo) para acelerar/pausar la ejecución y facilitar la depuración.

### 🤖 Programa al Robot (misiones) `(misiones-roboticas)`
- [ ] Registrar la app en las listas de asignatura de esoApps.js (Tecnología/Matemáticas) — hoy se importa pero no se inserta, así que no es visible en el catálogo.
- [ ] Unificar la nota: el summary muestra solved/total·10 mientras onGameComplete envía la media de ratios de optimización; mostrar la misma nota que se computa y se reporta para evitar confusión al alumno y al docente.
- [ ] Añadir ejecución paso a paso / depuración (botón 'paso a paso', velocidad ajustable, resaltado del bloque en ejecución) y control de pausa real ligado a isPaused durante la animación, hoy no se usa para frenar la simulación.
- [ ] Soporte de duelo 1 vs 1 (DuelComponent + entrada en duelableApps con DuelChatBar) o batalla de optimización, dado que la mecánica de 'menos bloques = más nota' encaja muy bien con un pique competitivo; y corregir el texto desactualizado del modal de instrucciones (sigue diciendo 5 misiones).

### 🤖 Laboratorio de Robótica `(laboratorio-robotica)`
- [ ] Resolver la incoherencia '5 vs 10 ejercicios': el config (commonApps.js) dice 5 y los textos de la intro dicen 10, pero hay 10 por curso; unificar el copy y, si se quiere, ofrecer examen corto (5) o largo (10).
- [ ] Aprovechar el motor de simulación (analyzeCircuit) también para la corrección: aceptar como válido cualquier cableado eléctricamente equivalente al objetivo (no solo el conjunto exacto de pares), premiando soluciones alternativas correctas en serie/paralelo.
- [ ] Añadir verificación y compartición en el Modo libre (botón 'Probar mi circuito' que reutilice el motor para indicar qué se enciende, y exportar/importar diseños o galería de clase) y, opcionalmente, soporte de duelo 1 vs 1 para encajar con el resto de la plataforma.
- [ ] Mejorar accesibilidad y experiencia táctil: los controles dependen de clic-en-pin y rueda de zoom; añadir pinch-to-zoom, snapping de pines y navegación por teclado haría la app más usable en tablet y para alumnado con dificultades motrices.

### 📟 Terminal de Hackeo `(terminal-retro)`
- [ ] Integrar el patrón estándar de la plataforma: pantalla previa de selección de dificultad, modo examen con nota /10 (correctAnswers/totalQuestions·10) y puntos paralelos, y llamada a onGameComplete (protegida con useRef) para que genere XP, insignias, ranking y cuente para tareas.
- [ ] Completar el intérprete: implementar WHILE realmente (con guard de iteraciones), dar a processLine soporte completo a SUB/MUL/DIV/MOD/IF dentro de bucles y anidamiento correcto, y robustecer el parseo de PRINT (no depender de substring(6)).
- [ ] Añadir feedback de éxito alineado con el resto de apps (canvas-confetti y/o sonidos opcionales) y una pantalla de resumen final con tiempo, niveles superados y nota, en lugar del resultado binario actual.
- [ ] Eliminar la dependencia de la textura externa (transparenttextures.com) sustituyéndola por un patrón local/CSS para cumplir la CSP, y mejorar accesibilidad/soporte táctil de los botones de comandos.


## 🤝 Tutoría y bienestar

### 🏝️ Isla de la Calma `(isla-de-la-calma)`
- [ ] Ofrecer patrones de respiración seleccionables (4-7-8 para dormir, box 4-4-4-4, respiración rápida de activación) con tiempos por fase configurables, en vez de los 4000 ms fijos por fase actuales.
- [ ] Añadir guía por voz (Web Speech API/TTS) y un temporizador/contador visible de segundos por fase para alumnado que no quiera depender solo de la animación; mejorar accesibilidad con soporte de teclado (Enter para comenzar, Espacio para pausar).
- [ ] Registrar uso opcional vía `onGameComplete` con `mode:'practice'` y maxScore 0 (o un tracker ligero de minutos de calma) para que el docente vea que el alumno usa la herramienta y, si procede, otorgar una insignia de bienestar/racha sin alterar la nota.
- [ ] Permitir pausar/reanudar la sesión a mitad y precargar/gestionar mejor el audio (autoplay bloqueado por el navegador hoy se silencia con `.catch(() => {})` sin avisar al usuario).

### ✨ Generador de personajes históricos `(generador-personajes-historicos)`
- [ ] Permitir reparto sin repetición o con control de duplicados (avisar cuando hay más alumnos que personajes en lugar de repetir con `index % length`), y opción de reparto respetando los filtros activos de sexo/categoría.
- [ ] Enriquecer la ficha del personaje con una breve biografía, época, datos clave o imagen/avatar (ampliando el JSON de `getAppContent`), e incluir botón de lectura por voz (TTS) para reforzar accesibilidad.
- [ ] Adaptar los estilos del asignador y los avisos al ThemeContext (tema oscuro) sustituyendo las clases con colores fijos `text-gray-*`/`bg-blue-100`, y añadir feedback/animaciones ligeras (framer-motion) coherentes con el resto de apps.
- [ ] Exportar la asignación también a PDF/imprimible y permitir guardar/cargar la lista de alumnos en localStorage (manteniendo la promesa de no enviarla a servidor) para reutilizarla entre sesiones.

### 🎓 Banco de Recursos Tutoriales `(banco-recursos-tutoria)`
- [ ] Permitir al docente exportar/imprimir una sesión o un bloque completo (PDF/ficha imprimible) con recurso, actividades y rúbricas, para llevarlo al aula sin pantalla.
- [ ] Parametrizar el contenido por nivel/curso (aprovechando los argumentos ya disponibles de `getAppContent(level, grade)`) para ofrecer dinámicas adaptadas a Primaria, ESO, Bachillerato y AD en lugar de un único dossier global.
- [ ] Añadir buscador/filtros por temática, duración o tipo de actividad (individual/grupal) y favoritos del tutor, ya que con muchos bloques la navegación por burbujas se queda corta.
- [ ] Internalizar las fuentes e iconos (sustituir Font Awesome y Google Fonts vía CDN por assets locales o lucide-react) para reducir dependencias externas, evitar problemas de CSP y mejorar la carga offline.

