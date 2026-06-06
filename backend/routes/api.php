<?php

use App\http\Controllers\Api\StudentsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('students')->group(function () {
    // Route::get('/', [StudentsController::class, 'index']);
    Route::post('/index', [StudentsController::class, 'index']); // POST because I will add filters
    Route::get('/view/{student}', [StudentsController::class, 'view']);
    Route::post('/add', [StudentsController::class, 'add']);
    Route::post('/edit/{student}', [StudentsController::class, 'edit']);
    Route::delete('/delete', [StudentsController::class, 'delete']);
});
