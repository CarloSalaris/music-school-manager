<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\HandlesListQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StudentsController extends Controller
{
    use HandlesListQuery;

    public function stats()
    {
        return response()->json([
            'data' => [
                'total' => Student::count(),
                'active' => Student::where('attivo', true)->count(),
            ],
        ]);
    }

    public function index(Request $request)
    {
        $query = Student::query();

        $this->applyFilters($query, $request);
        $this->applySort($query, $request, 'cognome');

        return $this->paginatedResponse($query, $request);
    }

    protected function filterable(): array
    {
        return [
            'search' => ['columns' => ['nome', 'cognome'], 'relative' => 'contains'],
            'attivo' => ['columns' => ['attivo'], 'relative' => 'equals'],
            'is_minorenne' => [
                'relative' => 'equals',
                'apply' => fn (Builder $query, $value) => $query->minorenne(
                    $this->booleanValue($value, 'is_minorenne'),
                ),
            ],
            'data_nascita' => ['columns' => ['data_nascita'], 'relative' => 'between'],
        ];
    }

    protected function sortable(): array
    {
        return ['nome', 'cognome', 'email', 'telefono', 'attivo'];
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
