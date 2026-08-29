<?php

namespace App\Services\Ai;

use App\Models\User;

class Assistant
{
    public function __construct(
        private readonly AiProvider $provider,
        private readonly BusinessContext $context,
    ) {}

    /**
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array{answer: string, provider: string}
     */
    public function ask(User $user, string $message, array $history = []): array
    {
        $system = $this->context->for($user);

        $lines = [];
        foreach ($history as $turn) {
            $who = ($turn['role'] ?? 'user') === 'assistant' ? 'Asistente' : 'Usuario';
            $lines[] = "{$who}: {$turn['content']}";
        }
        $lines[] = "Usuario: {$message}";
        $prompt = implode("\n", $lines);

        return [
            'answer' => $this->provider->complete($system, $prompt),
            'provider' => $this->provider->name(),
        ];
    }
}
