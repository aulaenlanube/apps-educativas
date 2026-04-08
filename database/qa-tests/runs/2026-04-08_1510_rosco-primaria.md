# QA Run · App Rosco · 2026-04-08 15:10

## Configuración
- App: rosco · Filtro: Primaria · Muestra: 15

## Resultados

| id | sub/curso | letra | sol | def | veredicto | nota |
|---|---|---|---|---|---|---|
| 13009 | leng/3 | S | sustantivo | Sinónimo de nombre. | ✅ OK | Correcto, conciso |
| 13093 | leng/4 | J | ojo | Ojo de la cara (contiene la J). | ⚠️ WARNING | Tautología "ojo de la cara" |
| 13094 | leng/4 | K | kiwi | Fruta marrón peluda. | ✅ OK | (aunque por dentro es verde, descripción exterior válida) |
| 13277 | leng/5 | R | refrán | Breve frase que expresa una enseñanza o consejo. | ✅ OK | |
| 13319 | leng/5 | Z | **nariz** | Punto de la cara por donde **comemos** (contiene la Z). | ❌ ERROR | "Comemos" debería ser "olemos" o "respiramos". Bug grave |
| 13320 | leng/5 | Z | manzana | Fruta roja o verde con pepitas (contiene la Z). | ✅ OK | |
| 13614 | mat/2 | D | diagonal | Línea que une dos vértices no seguidos. | ✅ OK | |
| 13886 | mat/4 | E | esfera | Cuerpo geométrico perfectamente redondo. | ✅ OK | |
| 14314 | prog/1-5 | G | galería | Lugar donde se ven todas tus fotos. | ✅ OK | Apropiado a Primaria |
| 14328 | prog/1-5 | J | jugador | Persona que participa en la partida. | ✅ OK | |
| 14359 | prog/1-5 | Q | izquierda | Dirección contraria a la derecha. | ✅ OK | (contiene Q en izQuierda) |
| 14369 | prog/1-5 | T | teclado | Tiene muchas teclas y letras. | ⚠️ WARNING | Demasiado coloquial; mejor "Periférico con teclas para escribir" |
| 14392 | prog/1-5 | Y | joystick | Palanca de juego. | ✅ OK | (contiene Y) |
| 14401 | prog/6 | A | altavoz | Componente físico que permite escuchar el sonido emitido por el ordenador. | ✅ OK | |
| 14552 | tut/1-3 | C | compartir | Dejar tus cosas a los demás. | ✅ OK | Apropiado nivel |

## Resumen
- ✅ OK: 12 · ⚠️ WARNING: 2 · ❌ ERROR: 1

## Hallazgo crítico

🔴 **id 13319 nariz**: la definición dice "Punto de la cara por donde comemos" — la nariz no es por donde comemos (eso es la boca). Bug factual grave en 5º Primaria Lengua. Los niños de 5º estudiarán que la nariz sirve para oler/respirar, esto es contra-pedagógico.

## Acciones
- IDs flagged: 13093, 13319 (ERROR), 14369
