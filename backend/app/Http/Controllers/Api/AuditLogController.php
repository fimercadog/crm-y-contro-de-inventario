<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogController extends Controller
{
    private const ROLES = ['super-admin', 'administrador'];

    public function index(Request $request)
    {
        abort_unless($request->user()->hasAnyRole(self::ROLES), Response::HTTP_FORBIDDEN);

        $query = AuditLog::query()
            ->where('company_id', $request->user()->company_id)
            ->with('user')
            ->latest('created_at');

        if ($event = $request->string('event')->value()) {
            $query->where('event', $event);
        }

        if ($entity = $request->string('entity')->value()) {
            $query->where('auditable_type', 'App\\Models\\'.$entity);
        }

        if ($userId = $request->integer('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        $logs = $query->paginate($request->integer('per_page', 25))->withQueryString();

        return AuditLogResource::collection($logs);
    }
}
