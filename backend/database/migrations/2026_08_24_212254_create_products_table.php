<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('sku');
            $table->string('barcode')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->constrained();
            $table->decimal('cost', 14, 2)->default(0);
            $table->decimal('sale_price', 14, 2)->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->integer('maximum_stock')->nullable();
            /**
             * Managed exclusively by InventoryService (Fase 8) — never set
             * directly from a controller or form. Defaults to 0 on creation.
             */
            $table->integer('current_stock')->default(0);
            $table->enum('status', ['activo', 'inactivo'])->default('activo');
            $table->string('image')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'sku']);
            $table->index(['company_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
