---
title: "Nota del alumno paso a paso: tareas, duelos, batallas, nivel y avatares"
slug: nota-del-alumno-tareas-duelos-batallas-nivel-avatares
date: 2026-05-10
category: guias-plataforma
excerpt: "Cómo se calcula la nota del alumno en apps-educativas.com: base de tareas al 90% más cuatro bonus capados de duelos, batallas, nivel y avatares. Fórmula, casos reales y cómo lo ve el alumno."
hero: /images/blog/nota-del-alumno-tareas-duelos-batallas-nivel-avatares.webp
keywords:
  - nota alumno
  - sistema doble base
  - bonus duelos
  - bonus avatares
  - nivel 101
  - evaluación actual
  - apps-educativas.com
tldr:
  - "La nota del alumno es base_tareas · 0,9 + bonus_duelos (±0,5) + bonus_batallas (+0,5) + bonus_nivel (+0,5) + bonus_avatares (+0,5), clip [0, 10]."
  - "La base de tareas pesa el 90 % en la fórmula final para dejar margen real a los bonus — no porque la nota de tareas se reescale en pantalla, sino solo al combinar con bonus."
  - "Cada bonus tiene curva concava (raíz cuadrada) salvo duelos y avatares que son lineales — premia la variedad por encima del grinding repetitivo."
  - "La plataforma tiene 101 niveles, pero solo los primeros 50 aportan al bonus de nivel (0,5 max). Del 50 al 101 es prestigio puro: avatares legendarios + insignia mítica."
  - "La nota que ve el alumno en su panel es la de la evaluación actual (1.ª, 2.ª o 3.ª) — global no se muestra para evitar la presión acumulada."
faq:
  - q: "¿Por qué se multiplica la base de tareas por 0,9 en la fórmula?"
    a: "Para garantizar margen real a los bonus. Si la base pesara 1,0 y los bonus sumaran +2, el cap de 10 los anularía constantemente. Multiplicando por 0,9 dejas espacio para que un alumno con base 10 sume +1 de bonus y obtenga la nota máxima. Es una decisión de diseño para que los bonus motiven, no decoren."
  - q: "¿Cómo se calcula el bonus de nivel en la plataforma?"
    a: "Con la fórmula 0,5 · √((nivel-1)/49). Llega al máximo +0,5 en el nivel 50. Del 50 al 101 no aporta más al bonus — es prestigio puro (avatares legendarios y míticos, insignia mythic_max_level). La XP para el nivel 100 son 831.448 puntos; el 101 cuesta otros tantos. Calibrado para que sea ambicioso pero alcanzable."
  - q: "¿Por qué los avatares dan bonus también?"
    a: "Porque desbloquear avatares requiere recorrer la plataforma con variedad (apps distintas, exámenes perfectos, duelos ganados, racha de días, etc.). El bonus por avatar suma 0,1 a 0,5 según rareza (común a mítico) con cap de +0,5 total. Es bonus global, no por evaluación — los avatares desbloqueados se conservan curso a curso."
  - q: "¿Si reseteo el progreso del curso de un alumno, pierde sus avatares?"
    a: "No. El reset solo borra del cálculo de nota lo del curso actual (game_sessions, quiz_battles, duels). Los avatares, XP, nivel e insignias son globales y se mantienen. El alumno reseteado vuelve a empezar la nota desde 0 pero conserva todo su prestigio acumulado."
  - q: "¿Puedo cambiar manualmente una nota o el modelo de cálculo?"
    a: "El modelo de cálculo está fijado por la plataforma — es la garantía de que la nota es transparente y reproducible. Lo que sí puedes es: (1) ajustar pesos de cada tarea, (2) crear o eliminar tareas, (3) resetear progreso del curso de un alumno, (4) cambiar la evaluación actual del grupo. Con estas palancas tienes flexibilidad suficiente sin romper el modelo."
tags: [nota, evaluacion, bonus, gamificacion, plataforma]
---

Hola qué tal docente. Si has llegado al último post de esta serie sobre [Guías de la plataforma](/blog/categoria/guias-plataforma), es momento de abrir la caja negra: **cómo se calcula exactamente la nota del alumno** en apps-educativas.com.

No hay magia. Hay una fórmula transparente con 5 componentes y un cap. Vamos paso a paso, con casos reales, para que puedas explicársela a alumnado, familias y dirección sin dudar.

Al lío.

## La fórmula, en una línea

```
nota_final = base_tareas · 0,9
           + bonus_duelos    (±0,5)
           + bonus_batallas  (+0,5)
           + bonus_nivel     (+0,5)
           + bonus_avatares  (+0,5)
           → clip [0, 10]
```

Cinco componentes. Cuatro bonus capados. Clip final a [0, 10] para que no salgan rarezas tipo "11,3" o "−0,4".

Vamos uno por uno.

## Componente 1: base de tareas

Es la **media ponderada de las tareas asignadas** al alumno durante la evaluación actual, calculada como:

```
base_tareas = Σ (nota_tarea · peso_tarea) / Σ pesos
```

Con dos detalles importantes:

- **El mejor intento** de cada tarea es el que cuenta (el alumno puede repetir).
- **Lo no intentado cuenta como 0** — esto premia constancia. Lo expongo en el [post sobre tareas](/blog/tareas-con-modo-examen-como-crear-y-asignar).

### El factor 0,9

Cuando se combina con los bonuses, la base se multiplica por **0,9**. Razón:

- Si la base pesara 1,0 → base 10 + bonus +1 = 11 → cap a 10. El bonus no aporta nada.
- Si la base pesa 0,9 → base 10 + bonus +1 = 10. El bonus aporta su +1 real.

**El alumno necesita base alta Y bonus para llegar a 10**. Es intencional: te obliga a recorrer la plataforma, no solo machacar tareas.

En la UI, la `base_tareas` que ve el alumno **sigue siendo sobre 10**. El 0,9 solo se aplica al combinar internamente. No se reescala visualmente.

## Componente 2: bonus de duelos

Suma de dos fuentes (ver [post sobre duelos y batalla](/blog/duelos-1vs1-y-quiz-battle-competicion-sana)):

| Fuente | Cómo aporta |
|---|---|
| Duelos-tarea ganados | +0,10 fijo por victoria al ledger |
| Duelos personales con apuesta | ±stake (0,1/0,2/0,3) según resultado |
| Duelos personales amistosos | Nada (0 puntos) |

Combinación:

```
task_bonus = min(0,5, max(0, Σ deltas de entries is_task))
personal_delta = Σ deltas de entries no-task (con signo)
bonus_duelos_total = clamp(task_bonus + personal_delta, −0,5, +0,5)
```

Es decir: hasta +0,5 por duelos-tarea ganados, más/menos lo de duelos personales, capado en [−0,5, +0,5].

Es el único bonus que puede ser **negativo** — si pierdes muchos duelos personales con apuesta alta, te resta. Por eso el modo amistoso existe: para jugar sin riesgo.

## Componente 3: bonus de batallas (Quiz Battle)

Cada vez que el alumno queda en el podio de un Quiz Battle:

| Posición | Aporta al score acumulado |
|---|---|
| 1.º | 1,000 |
| 2.º | 0,667 |
| 3.º | 0,333 |

El bonus se calcula como:

```
bonus_batallas = 0,5 · √(min(score_total, 10) / 10)
```

Curva concava (raíz cuadrada). Los primeros podios suman mucho; los siguientes, cada vez menos.

| Score acumulado | Bonus |
|---|---|
| 1 (1 podio) | 0,158 |
| 3 (3 podios variados) | 0,274 |
| 5 (5 podios variados) | 0,354 |
| 10 (10+ podios) | 0,500 (cap) |

El cap a 10 evita que un alumno top de batallas pueda ganar +5 por esto solo. **Premia variedad sin obsesionar**.

## Componente 4: bonus de nivel

La XP se acumula partida a partida. Cada nivel cuesta más XP. La plataforma tiene **101 niveles** (curva por tramos):

| Tramo | Coste por nivel |
|---|---|
| Niveles 1-49 | Curva estándar |
| Niveles 50-79 | +200 XP por nivel (lineal) |
| Niveles 80-89 | +5 % por nivel |
| Niveles 90-99 | +25 % por nivel |
| Niveles 100→101 | Cuesta tanto como llegar a 100 entero |

Hitos:

- Nivel 50: ~49.784 XP
- Nivel 80: ~197.744 XP
- Nivel 90: ~301.174 XP
- Nivel 100: ~831.448 XP
- Nivel 101: ~1.662.896 XP

El **bonus** solo va con los primeros 50 niveles:

```
bonus_nivel = 0,5 · √((nivel - 1) / 49)
```

Cap +0,5 en nivel 50. Del 50 al 101 **no se gana más bonus**.

¿Por qué entonces hay niveles más allá del 50?

- **Avatares legendarios y míticos** se desbloquean con requisitos de nivel >50.
- **Insignia `mythic_max_level`** al llegar a 101.
- **Prestigio puro** — el alumno top sigue teniendo metas.

No queremos que un alumno de nivel 90 tenga ventaja matemática contra uno de nivel 50. Ambos tienen el mismo cap de bonus. La diferencia es estética y de coleccionismo.

## Componente 5: bonus de avatares

Cada avatar **desbloqueado** (no equipado) suma según rareza:

| Rareza | Aporta |
|---|---|
| Común | 0,1 |
| Raro | 0,2 |
| Épico | 0,3 |
| Legendario | 0,4 |
| Mítico | 0,5 |

Cap total: +0,5. Con 5 comunes o con 1 mítico llegas igual al cap. Premia recorrer la plataforma.

**Bonus global** (no por evaluación): los avatares desbloqueados se conservan curso a curso. El alumno que llega a 4.º ESO con 30 avatares mantiene su +0,5 desde el primer día.

Equipar un avatar es solo cosmético. Lo que cuenta para el bonus es **haberlos desbloqueado**.

### Cómo se desbloquean

Hay 70 avatares con requisitos variados (ver detalle en `avatar_definitions` de la BD):

- Por sesiones jugadas, apps distintas, exámenes perfectos, duelos ganados, batallas ganadas, top de clase, racha de días, insignias acumuladas, nivel alcanzado, mensajes al docente, apps valoradas, etc.

Cada partida la plataforma comprueba si se desbloquea algún avatar y notifica al alumno con un modal celebrativo.

## Caso real 1: alumno medio que solo hace tareas

| Componente | Valor |
|---|---|
| base_tareas | 7,0 |
| bonus_duelos | 0,0 (no juega duelos) |
| bonus_batallas | 0,0 (no participa) |
| bonus_nivel | 0,2 (nivel 8) |
| bonus_avatares | 0,3 (3 avatares comunes desbloqueados) |
| **Nota final** | **7,0·0,9 + 0,5 = 6,8** |

Saca casi su nota cruda de tareas. Los bonus apenas le suman. Es el patrón típico del alumno que solo va a tareas.

## Caso real 2: alumno todoterreno

| Componente | Valor |
|---|---|
| base_tareas | 7,0 |
| bonus_duelos | +0,4 (gana 4 duelos-tarea, juega amistosos sin perder) |
| bonus_batallas | +0,4 (8 podios variados) |
| bonus_nivel | +0,5 (nivel 50, cap) |
| bonus_avatares | +0,5 (20+ avatares, cap) |
| **Nota final** | **7,0·0,9 + 1,8 = 8,1** |

Con la misma base de tareas, **gana +1,3 puntos por gamificación**. El sistema premia al que recorre la plataforma entera.

## Caso real 3: alumno top de tareas, perezoso de bonus

| Componente | Valor |
|---|---|
| base_tareas | 10,0 |
| bonus_duelos | 0 |
| bonus_batallas | 0 |
| bonus_nivel | 0,1 (nivel 3) |
| bonus_avatares | 0,1 (1 avatar) |
| **Nota final** | **10·0,9 + 0,2 = 9,2** |

Aunque las tareas son perfectas, **no llega al 10**. Para llegar tiene que tocar bonus. Es por diseño — si la nota máxima fuera regalable solo con tareas, los bonus serían decoración.

## Caso real 4: alumno gamer, débil en tareas

| Componente | Valor |
|---|---|
| base_tareas | 4,0 |
| bonus_duelos | +0,5 (cap, top de duelos del grupo) |
| bonus_batallas | +0,5 (cap, top de batallas) |
| bonus_nivel | +0,5 (cap, nivel 50) |
| bonus_avatares | +0,5 (cap, 30 avatares) |
| **Nota final** | **4,0·0,9 + 2,0 = 5,6** |

Aunque los 4 bonus están al cap, **no aprueba con holgura**. El sistema garantiza que la base manda — los bonus no salvan una nota mala. Solo añaden colchón.

Mensaje al alumno: "para subir más, no es jugar más duelos. Es trabajar las tareas".

## Cómo lo ve el alumno

En su panel **Resumen** ve:

| Componente | Valor |
|---|---|
| Nota actual (evaluación 2.ª) | 7,8 / 10 |
| Base tareas | 7,5 / 10 |
| Bonus duelos | +0,3 |
| Bonus batallas | +0,4 |
| Bonus nivel | +0,4 |
| Bonus avatares | +0,3 |

Ve la fórmula viva. **No es una caja negra**. Si suspende, sabe exactamente qué subir.

Y ve **la nota de la evaluación actual**, no global. Esto es deliberado: no quiero que arrastren toda la trayectoria del curso a final de la 3.ª evaluación con presión inmanejable.

## La evaluación actual (la que se está calculando)

El docente decide desde **Editar grupo → Evaluación actual**:

- Automática (por fecha: sep-dic = 1.ª, ene-mar = 2.ª, abr-ago = 3.ª).
- 1.ª, 2.ª o 3.ª manualmente.

La nota que ve el alumno y todas las tareas se filtran por esa evaluación. Las anteriores quedan archivadas — no se borran, pero no afectan al cálculo actual.

## Reset del progreso del curso (sin perder lo global)

A veces hace falta dar borrón y cuenta nueva — alumno que llega tarde, cambio de evaluación, lo que sea. Desde la ficha del alumno, icono History.

Lo que se borra del cálculo de nota:

- game_sessions anteriores al reset.
- quiz_battle_sessions anteriores.
- duel_grade_ledger anterior.

Lo que se mantiene:

- **XP, nivel, avatares desbloqueados, insignias**.
- Historial de partidas (lo siguen viendo).
- Tiempo total de juego.

Es decir: **el alumno empieza de nuevo la nota, pero conserva todo su prestigio acumulado**. No es destructivo. Lo registra `student_group_reset_log` por si hay que auditar.

## Por qué este modelo y no otro

He probado modelos más simples y más complejos en estos años. Lo que valida este específicamente:

1. **Es transparente**: cualquier alumno entiende los 5 componentes en 3 minutos.
2. **No es manipulable**: el algoritmo es fijo; ni el docente ni el alumnado pueden alterar la fórmula.
3. **Recompensa variedad** sin obsesionar (curvas concavas).
4. **Garantiza que la base manda**: los bonus son extras, no atajos.
5. **Sostiene motivación a largo plazo**: hay siempre algo nuevo que desbloquear (avatares, niveles, batallas).
6. **Cumple normativa LOMLOE**: la base son las tareas evaluables con peso justificado; los bonus son gamificación añadida.

Lo que NO he conseguido evitar:

- Algún alumno que se obsesiona con los avatares y descuida tareas — pero el sistema le frena (caso 4).
- Algún docente al que le parece "muchos números" — pero una vez ve los casos reales, le encaja.

## Una recomendación final

Si tu primer trimestre con la plataforma estás dudando del modelo, **deja que pase el trimestre entero**. No cambies la metodología a mitad. Mira las notas de fin de trimestre, compara con tu sistema anterior, escucha al alumnado.

Mi experiencia tras 5 años acumulados con sistemas de este estilo: **la nota es más justa y refleja mejor el aprendizaje real** que un cuaderno tradicional con exámenes puntuales. Porque incluye constancia, variedad y esfuerzo distribuido.

Y si quieres releer cómo se monta todo desde cero, los tres posts anteriores de esta serie son la ruta completa:

1. [Registro y primer grupo en 10 minutos](/blog/registro-y-primer-grupo-en-10-minutos).
2. [Tareas con modo examen](/blog/tareas-con-modo-examen-como-crear-y-asignar).
3. [Duelos 1 vs 1 y Quiz Battle](/blog/duelos-1vs1-y-quiz-battle-competicion-sana).

Con los cuatro juntos tienes manual completo del funcionamiento de la plataforma.

Nos vemos en el siguiente.
