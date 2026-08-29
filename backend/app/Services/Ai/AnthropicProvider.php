<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use Throwable;

class AnthropicProvider implements AiProvider
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
    ) {}

    public function complete(string $system, string $prompt): string
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
            ])
                ->timeout(30)
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => $this->model,
                    'max_tokens' => 1024,
                    'system' => $system,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);
        } catch (Throwable $e) {
            throw new AiUnavailableException('No se pudo contactar a Anthropic.', 0, $e);
        }

        if ($response->failed()) {
            throw new AiUnavailableException('Anthropic respondió con error '.$response->status().'.');
        }

        return trim((string) $response->json('content.0.text', ''));
    }

    public function name(): string
    {
        return 'anthropic';
    }
}
