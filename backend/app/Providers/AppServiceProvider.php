<?php

namespace App\Providers;

use App\Services\Ai\AiProvider;
use App\Services\Ai\AnthropicProvider;
use App\Services\Ai\OpenAiProvider;
use App\Services\Ai\StubProvider;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AiProvider::class, function () {
            $config = config('services.ai');

            return match ($config['provider']) {
                'stub' => new StubProvider,
                'openai' => new OpenAiProvider($config['openai']['key'] ?? '', $config['openai']['model']),
                'anthropic' => new AnthropicProvider($config['anthropic']['key'] ?? '', $config['anthropic']['model']),
                default => throw new InvalidArgumentException("Proveedor de IA desconocido: {$config['provider']}"),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
