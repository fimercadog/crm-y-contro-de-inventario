# Arquitectura del asistente IA

Fase 13. El asistente responde preguntas en lenguaje natural sobre los datos
de la empresa del usuario autenticado (clientes, inventario, oportunidades).

## Flujo

```
POST /api/ai/ask  { message, history[] }
      │
      ▼
AiController ──► Assistant
                   ├─ BusinessContext::for($user)   → snapshot de texto, SIEMPRE scoped a company_id
                   └─ AiProvider::complete(system, prompt) → respuesta
      │
      ▼
{ answer, provider }
```

- **`BusinessContext`** arma un resumen compacto (conteos, stock bajo, últimos
  movimientos) filtrado por `company_id`. El proveedor nunca recibe datos de
  otro tenant. No hay tool-calling: el modelo solo ve el snapshot.
- **`Assistant`** concatena `history` + `message` en un prompt plano y delega.
- **`AiProvider`** es la interfaz intercambiable. El binding vive en
  `AppServiceProvider::register()` y se elige con `config('services.ai.provider')`.

## Proveedores

| `AI_PROVIDER` | Clase | Requiere |
|---|---|---|
| `stub` (default) | `StubProvider` | nada — offline, devuelve el snapshot + la pregunta |
| `openai` | `OpenAiProvider` | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| `anthropic` | `AnthropicProvider` | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` |

El stub deja todo el pipeline (contexto, endpoint, UI, tests) ejercitable sin
API key. Los tests corren con el stub salvo el que hace `Http::fake` de OpenAI.

## Errores

Los proveedores lanzan `AiUnavailableException` si la API no responde o
devuelve error; el controlador lo traduce a `503` con el mensaje.

## Añadir un proveedor

1. Implementar `AiProvider` en `app/Services/Ai/`.
2. Añadir el caso en el `match` de `AppServiceProvider::register()`.
3. Añadir sus claves a `config/services.php` y `.env.example`.
