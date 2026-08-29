<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use App\Support\TableExporter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

class AuditLogController extends Controller
{
    private const EXPORT_COLUMNS = [
        'created_at' => 'Fecha',
        'user_name' => 'Usuario',
        'event' => 'Evento',
        'entity' => 'Entidad',
        'auditable_id' => 'ID',
        'ip_address' => 'IP',
    ];

    public function index(Request $request)
    {
        $logs = $this->filteredQuery($request)
            ->paginate($request->integer('per_page', 25))
            ->withQueryString();

        return AuditLogResource::collection($logs);
    }

    public function exportCsv(Request $request)
    {
        return TableExporter::csv('auditoria', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    public function exportPdf(Request $request)
    {
        return TableExporter::pdf('auditoria', 'Auditoría', self::EXPORT_COLUMNS, $this->exportRows($request));
    }

    private function exportRows(Request $request): Collection
    {
        return $this->filteredQuery($request)->get()->map(fn (AuditLog $log) => [
            'created_at' => $log->created_at?->toDateTimeString(),
            'user_name' => $log->user?->name ?? 'Sistema',
            'event' => $log->event,
            'entity' => class_basename($log->auditable_type),
            'auditable_id' => $log->auditable_id,
            'ip_address' => $log->ip_address,
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        abort_unless($request->user()->can('audit.view'), Response::HTTP_FORBIDDEN);

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

        return $query;
    }
}
