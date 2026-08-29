<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Project rule: deleting a record never removes the row, it soft-deletes.
 * Customers and products already had this; this brings the rest in line.
 */
return new class extends Migration
{
    private const TABLES = ['contacts', 'activities', 'opportunities', 'categories', 'brands', 'units', 'suppliers'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->softDeletes();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
