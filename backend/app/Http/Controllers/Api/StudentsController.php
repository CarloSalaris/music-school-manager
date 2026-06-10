<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
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

    public function view(Student $student)
    {
        return response()->json([
            'data' => $student
        ]);
    }

    public function add(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());

        return response()->json([
            'data' => $student,
        ], 201);
    }

    public function edit(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return response()->json([
            'data' => $student->fresh(),
        ]);
    }

    public function delete(Request $request)
    {
        $student = Student::findOrFail($request->input('id'));
        $student->delete();

        return response()->json([
            'message' => 'Allievo eliminato',
        ]);
    }
}
