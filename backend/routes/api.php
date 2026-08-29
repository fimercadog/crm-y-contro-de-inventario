<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InventoryMovementController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\PipelineStageController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/company', [CompanyController::class, 'show']);
    Route::put('/company', [CompanyController::class, 'update']);

    Route::get('/users', [UserController::class, 'index']);
    Route::apiResource('admin/users', UserManagementController::class)->except('show');
    Route::get('/admin/roles', [RoleController::class, 'index']);

    Route::get('/customers/export/csv', [CustomerController::class, 'exportCsv']);
    Route::get('/customers/export/pdf', [CustomerController::class, 'exportPdf']);
    Route::apiResource('customers', CustomerController::class);
    Route::post('/customers/{customer}/contacts', [ContactController::class, 'store']);

    Route::get('/contacts', [ContactController::class, 'index']);
    Route::put('/contacts/{contact}', [ContactController::class, 'update']);
    Route::delete('/contacts/{contact}', [ContactController::class, 'destroy']);

    Route::get('/pipeline', [PipelineStageController::class, 'index']);

    Route::get('/opportunities/export/csv', [OpportunityController::class, 'exportCsv']);
    Route::get('/opportunities/export/pdf', [OpportunityController::class, 'exportPdf']);
    Route::patch('/opportunities/{opportunity}/stage', [OpportunityController::class, 'updateStage']);
    Route::apiResource('opportunities', OpportunityController::class);

    Route::apiResource('activities', ActivityController::class);

    foreach ([
        'categories' => CategoryController::class,
        'brands' => BrandController::class,
        'units' => UnitController::class,
        'suppliers' => SupplierController::class,
    ] as $uri => $controller) {
        Route::get("/{$uri}/export/csv", [$controller, 'exportCsv']);
        Route::get("/{$uri}/export/pdf", [$controller, 'exportPdf']);
        Route::apiResource($uri, $controller)->except('show');
    }

    Route::get('/products/export/csv', [ProductController::class, 'exportCsv']);
    Route::get('/products/export/pdf', [ProductController::class, 'exportPdf']);
    Route::apiResource('products', ProductController::class);

    Route::apiResource('inventory-movements', InventoryMovementController::class)->only(['index', 'store']);
});
