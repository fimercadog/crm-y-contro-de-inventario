<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

trait SoftDeleteListing
{
    /**
     * Narrow a query built with withTrashed() by ?trashed=only|none.
     * Default (no param): show everything — active and deleted alike.
     */
    protected function applyTrashed($query, Request $request)
    {
        return match ($request->string('trashed')->value()) {
            'only' => $query->onlyTrashed(),
            'none' => $query->whereNull('deleted_at'),
            default => $query,
        };
    }
}
