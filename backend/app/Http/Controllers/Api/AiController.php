<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Ai\Assistant;
use App\Services\Ai\AiUnavailableException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AiController extends Controller
{
    /** Same gate as the aggregate reports: the snapshot is company-wide, not row-scoped. */
    private const ROLES = ['super-admin', 'administrador'];

    public function ask(Request $request, Assistant $assistant)
    {
        abort_unless($request->user()->hasAnyRole(self::ROLES), Response::HTTP_FORBIDDEN);

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
