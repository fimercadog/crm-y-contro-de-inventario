<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Records created/updated/deleted events for a model into audit_logs, with
 * the acting user and a field-level diff. Sensitive fields are never stored.
 * Seeders run with WithoutModelEvents, so they don't generate audit noise.
 */
trait Auditable
{
    /** @var array<int, string> */
    protected array $auditExclude = ['password', 'remember_token', 'updated_at', 'created_at'];

    public static function bootAuditable(): void
    {
        static::created(fn (Model $model) => $model->writeAuditLog('created', $model->getAttributes()));
        static::updated(fn (Model $model) => $model->writeAuditLog('updated', $model->getChanges(), $model->getOriginal()));
        static::deleted(fn (Model $model) => $model->writeAuditLog('deleted', []));
    }

    protected function writeAuditLog(string $event, array $new, array $original = []): void
    {
        $exclude = array_flip($this->auditExclude);
        $new = array_diff_key($new, $exclude);

        if ($event === 'updated') {
            $changes = [];
            foreach ($new as $key => $value) {
                $changes[$key] = ['from' => $original[$key] ?? null, 'to' => $value];
            }
            if ($changes === []) {
                return;
            }
        } else {
            $changes = $new;
        }

        AuditLog::create([
            'company_id' => $this->auditCompanyId(),
            'user_id' => Auth::id(),
            'event' => $event,
            'auditable_type' => $this->getMorphClass(),
            'auditable_id' => $this->getKey(),
            'changes' => $changes ?: null,
            'ip_address' => request()->getClientIp(),
        ]);
    }

    protected function auditCompanyId(): ?int
    {
        if (array_key_exists('company_id', $this->getAttributes())) {
            return $this->getAttribute('company_id');
        }

        return $this->getMorphClass() === \App\Models\Company::class ? $this->getKey() : null;
    }
}
