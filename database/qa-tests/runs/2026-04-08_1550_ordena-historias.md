# QA Run · App Ordena Historias · 2026-04-08 15:50

## Configuración
- App: ordena_historias · Muestra: 10 mixta

## Resultados

| id | sub/curso | tema | veredicto | nota |
|---|---|---|---|---|
| 114 | prim/ccnn/4 | Atmósfera | ✅ OK | Secuencia lógica clara |
| 150 | prim/ccnn/5 | Reproducción asexual | ⚠️ WARNING | Las 3 frases son afirmaciones independientes, no hay un orden cronológico/lógico único. El alumno podría ordenarlas de varias formas |
| 173 | prim/ccnn/6 | Sonido (ondas) | ✅ OK | Buena progresión: definición → mecanismo → percepción → caso especial |
| 181 | prim/ccnn/6 | Migración aves | ⚠️ WARNING | Frases descriptivas no secuenciales. Se pueden permutar |
| 192 | prim/ccss/1 | Granjero | ✅ OK | Secuencia simple y clara para 1º |
| 201 | prim/ccss/1 | Normas de clase | ✅ OK | Causa-efecto correcto |
| 338 | prim/ccss/6 | Monarquía parlamentaria | ⚠️ WARNING | Las 4 frases son hechos independientes sobre el sistema. No hay una única secuencia correcta |
| 789 | prim/leng/3 | Lluvia | ✅ OK | Secuencia narrativa perfecta |
| 1482 | eso/bio/1 | Reproducción asexual | ✅ OK | Secuencia: definición → característica → ejemplo 1 → ejemplo 2 |
| 2808 | eso/mat/4 | Estadística bidimensional | ✅ OK | Progresión didáctica correcta |

## Resumen
- ✅ OK: 7 · ⚠️ WARNING: 3 · ❌ ERROR: 0

## Hallazgo importante

⚠️ **Patrón detectado: 3 historias de tipo "lista de hechos" en lugar de secuencia**:
- id 150 (reproducción asexual primaria)
- id 181 (migración aves)
- id 338 (monarquía parlamentaria)

Estas historias **no tienen un orden cronológico/lógico único**. Son frases descriptivas que se pueden permutar. La mecánica de "ordena la historia" pierde sentido. Mejor candidatas para "ordena las frases" o reescribir con conectores temporales/lógicos.

## Acciones
- IDs flagged: 150, 181, 338
