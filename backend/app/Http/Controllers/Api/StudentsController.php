<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentsController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        // Sort
        $sortField = $request->query('sort', 'cognome');
        $sortDirection = $request->query('direction', 'ASC');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $perPage = $request->query('limit', 50);
        $students = $query->paginate($perPage);

        return response()->json([
            'data' => $students->items(),
            'pagination' => [
                'total' => $students->total(),
                'per_page' => $students->perPage(),
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
            ],
        ]);
    }
}
