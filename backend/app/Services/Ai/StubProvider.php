<?php

namespace App\Services\Ai;

/**
 * Offline provider used by default in local/testing. It does no network calls:
 * it echoes the business snapshot it was given plus the question, so the whole
 * pipeline (context building, endpoint, UI) is exercisable without an API key.
 */
class StubProvider implements AiProvider
{
    public function complete(string $system, string $prompt): string
    {
        return implode("\n", [
            'Asistente en modo local (sin proveedor de IA configurado).',
            'Configura AI_PROVIDER=openai|anthropic y su API key para respuestas reales.',
            '',
            'Contexto disponible del negocio:',
            trim($system),
            '',
            'Tu consulta:',
            trim($prompt),
        ]);
    }

    public function name(): string
    {
        return 'stub';
    }
}
