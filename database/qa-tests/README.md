# QA Tests · Validación manual de contenido

Sistema de QA continuo para validar el contenido de las apps educativas. Las muestras aleatorias se validan manualmente (lectura crítica por Claude Code) y los resultados se acumulan sesión tras sesión.

## Estructura

```
database/qa-tests/
├── runs/                   # Cada ejecución, un .md con timestamp
│   └── YYYY-MM-DD_HHMM_app.md
├── flagged.json            # IDs marcados acumulados (todas las apps)
└── README.md
```

## Veredictos

- ✅ **OK** — La entrada es correcta y apropiada
- ⚠️ **WARNING** — Funciona pero tiene algún problema menor (def imprecisa, vocabulario discutible, redacción mejorable)
- ❌ **ERROR** — Bug claro (información incorrecta, no encaja en categoría, nivel inadecuado)

## Cómo usar

Pídele a Claude Code:

> "Haz un test QA aleatorio de la app X con N muestras"

Ejemplos:
- "Haz un test QA del rosco, muestra 20"
- "Haz un test QA de parejas filtrando primaria"
- "Repite QA del rosco pero solo ESO matemáticas"

Claude tomará la muestra del dump local correspondiente, la validará y generará el `.md` en `runs/`.

## Acumulación

`flagged.json` mantiene la lista de IDs marcados como ⚠️ o ❌ a lo largo del tiempo:

```json
{
  "rosco_questions": {
    "22853": {
      "first_seen": "2026-04-08",
      "times_flagged": 2,
      "last_verdict": "ERROR",
      "notes": ["def describe sobreesdrújula", "concepto incorrecto"]
    }
  }
}
```

Si una entrada se marca varias veces, sube de prioridad para revisión.
