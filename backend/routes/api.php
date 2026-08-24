<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\UserController;
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

    Route::get('/customers/export/csv', [CustomerController::class, 'exportCsv']);
    Route::get('/customers/export/pdf', [CustomerController::class, 'exportPdf']);
    Route::apiResource('customers', CustomerController::class);
    Route::post('/customers/{customer}/contacts', [ContactController::class, 'store']);

    Route::get('/contacts', [ContactController::class, 'index']);
    Route::put('/contacts/{contact}', [ContactController::class, 'update']);
    Route::delete('/contacts/{contact}', [ContactController::class, 'destroy']);
});
