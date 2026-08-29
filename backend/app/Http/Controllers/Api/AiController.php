<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Ai\Assistant;
use App\Services\Ai\AiUnavailableException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AiController extends Controller
{
    public function ask(Request $request, Assistant $assistant)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['sometimes', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:4000'],
        ]);

        try {
            $result = $assistant->ask(
                $request->user(),
                $validated['message'],
                $validated['history'] ?? [],
            );
        } catch (AiUnavailableException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return response()->json($result);
    }
}
