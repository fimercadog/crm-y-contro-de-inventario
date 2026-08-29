<?php

namespace App\Services\Ai;

/**
 * A text-completion backend for the assistant. Swap implementations via
 * config('services.ai.provider'); the container binding lives in
 * AppServiceProvider.
 */
interface AiProvider
{
    /**
     * Given a system instruction and a user prompt, return the assistant reply.
     *
     * @throws AiUnavailableException when the backend cannot be reached
     */
    public function complete(string $system, string $prompt): string;

    /** Human-readable id for the UI ("stub", "openai", "anthropic"). */
    public function name(): string;
}
