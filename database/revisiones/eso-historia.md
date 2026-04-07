# Revisión: ESO · Historia

Estado actual del slice (`level=eso`, `subject_id=historia`, 1.090 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 274 | 126 | 135 | 13 |
| 2º ESO | 276 | 116 | 141 | 19 |
| 3º ESO | 270 | 86 | 160 | 24 |
| 4º ESO | 270 | 73 | 161 | 36 |

**Distribución excelente**: progresión clara de dificultad de 1º a 4º (los difíciles aumentan de 13 a 36, los fáciles bajan de 126 a 73). Es la **mejor calidad estructural** vista hasta ahora. Ñ correcta en los 4 cursos.

**Diagnóstico**: la asignatura tiene buena progresión cronológica (1º Prehistoria/Antigüedad, 2º Edad Media/Moderna, 3º Edad Moderna/Geografía, 4º Contemporánea) y definiciones generalmente bien escritas. Los bugs son **localizados, no sistémicos**.

---

## 1º ESO

### 🔴 Bugs

| id | problema | corrección |
|---|---|---|
| **20214** | `homo sapiens` H tipo `contiene` con def `'Escritura sagrada de Egipto (contiene H).'` — la definición describe **jeroglífico**. Bug grave. | reescribir como `solution='alhambra'` def `'Conjunto monumental nazarí de Granada (contiene H).'` (y mantener `type='contiene'`) |
| **20213** | `hieroglífico` (3) — errata ortográfica grave. La forma correcta es `jeroglífico` y además duplica concepto con id 20231 `jeroglífico` J. | borrar (es redundante con 20231 J jeroglífico) |
| **20311, 20312, 20319** | **TRIPLICADO**: tres entradas Q con `solution='conquista'`. Las definiciones de 20311 y 20312 son **además absurdas**: 20311 dice "Edad de Piedra Nueva" (= Neolítico), 20312 dice "Edad de Piedra Antigua" (= Paleolítico). | borrar 20311 y 20312, mantener 20319 con la def correcta |
| **20406** | `zona` Z duplica con 20401 (mismas letra y solution). | borrar 20406 |
| **20407** | `capa de ozono` Z def `'Punto más alto del cielo sobre nuestra cabeza (contiene Z).'` — describe **cenit**, no capa de ozono. | reescribir def `'Capa de la atmósfera que protege de los rayos UV (contiene Z).'` |
| **20386** | `máximo` X def `'Cargo religioso romano, Pontifex... (contiene X).'` — describe Pontifex Maximus, da pista. | reescribir def `'Lo más grande, opuesto a mínimo (contiene X).'` |
| 20259 | `lítico` def `'Relativo a la piedra (Paleo...).'` — pista en paréntesis | reescribir def `'Adjetivo: relativo a la piedra como material.'` |

### 🟠 Reclasificaciones

Pocas. La distribución ya es razonable. Solo:
- **23 → 2**: `hieroglífico` 20213 ya se borra.
- **3 → 2**: 20143 (arquitectura — concepto general, no históricamente específico)

---

## 2º ESO

### 🔴 Bugs

| id | problema | corrección |
|---|---|---|
| **20438** | `Carlos` con mayúscula. Duplica con 20439 `carlos` (minúscula). | borrar 20438 |
| **20683** | `capa de ozono` Z def `'Palacio árabe en Zaragoza (Al...).'` — describe **Aljafería**. Mismo bug pattern que 1º ESO id 20407. | reescribir como `solution='aljafería'` def `'Palacio árabe nazarí situado en Zaragoza (contiene Z).'` |
| **20684, 20685** | Dos `zona` Z con definiciones placeholder idénticas: `'Palabra común que empieza por Z.'` Duplica con 20679. | borrar ambos (20684 y 20685) |
| **20670** | `ysabel` Y def `'Reina Católica (escritura antigua).'` — Y inicial es ortografía antigua de Isabel. Decisión: mantener (ingenioso), pero verificar que el rosco acepta la respuesta. | mantener |
| 20522 | kremlin (anotación interna) — **ya cubierto en global-anotaciones.sql** | — |

---

## 3º ESO

Excelente calidad. **Solo bugs menores** de definiciones que dan pista:

| id | problema | corrección |
|---|---|---|
| 20708 | `católicos` def `'Isabel y Fernando (Reyes...).'` da pista directa | reescribir def `'Reyes que unificaron España e iniciaron la conquista de América.'` |
| 20886 | `san` def `'Fundador de los Jesuitas (... Ignacio de Loyola).'` da pista | reescribir def `'Tratamiento honorífico para los fundadores religiosos canonizados.'` |

---

## 4º ESO

Excelente calidad. Solo:

| id | problema | corrección |
|---|---|---|
| **21073** | `Legión` con mayúscula | minúscula `legión` |
| **21160, 21161** | Ambos `triple` T (Triple Entente y Triple Alianza) — son dos cosas distintas con la misma respuesta. | mantener ambos pero verificar UI: probablemente OK porque las definiciones son distintas y solo aparece una en cada partida |
| 21195 | `war` W def `'Guerra en inglés.'` — palabra inglesa en historia española, sin contexto histórico. | reescribir def `'Palabra inglesa para "guerra", clave en la 2GM (World ... II).'` |

---

## Resumen de cambios

| Curso | Bugs (delete) | Bugs (update) | Reclasificaciones |
|---|---|---|---|
| 1º | 4 (hieroglífico, 2x conquista, zona) | 4 (homo sapiens, capa ozono, máximo, lítico) | 1 |
| 2º | 3 (Carlos, 2x zona placeholder) | 1 (capa de ozono → aljafería) | 0 |
| 3º | 0 | 2 (católicos, san) | 0 |
| 4º | 0 | 2 (Legión → legión, war) | 0 |

**Total**: ~17 cambios sobre 1.090 entradas (~1,5%). **La asignatura más limpia hasta ahora**.

---

## Hallazgo curioso

El `id 20407` (1º ESO) y el `id 20683` (2º ESO) tienen ambos `solution='capa de ozono'` con definiciones que describen otras cosas (cenit y aljafería respectivamente). El generador automático parece haber tenido un error sistemático que dejó "capa de ozono" como `solution` cuando no encontraba la palabra correcta para la letra Z. Conviene verificarlo en otras asignaturas:

```sql
SELECT id, subject_id, level, definition FROM rosco_questions
WHERE solution = 'capa de ozono';
```

Lo añado al TODO global de saneamiento.

---

SQL en [eso-historia.sql](eso-historia.sql). **No se aplica nada hasta tu visto bueno.**
