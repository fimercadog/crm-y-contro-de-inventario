<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use Throwable;

class OpenAiProvider implements AiProvider
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
    ) {}

    public function complete(string $system, string $prompt): string
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);
        } catch (Throwable $e) {
            throw new AiUnavailableException('No se pudo contactar a OpenAI.', 0, $e);
        }

        if ($response->failed()) {
            throw new AiUnavailableException('OpenAI respondió con error '.$response->status().'.');
        }

        return trim((string) $response->json('choices.0.message.content', ''));
    }

    public function name(): string
    {
        return 'openai';
    }
}
