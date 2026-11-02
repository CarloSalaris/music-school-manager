<?php

namespace App\Http\Controllers\Concerns;

use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Server side of the frontend `useList` contract for `POST /{model}/index`:
 * - body:  { filters: { <field>: { value, relative } } }
 * - query: sort, direction, page, limit
 *
 * Controllers whitelist what can be filtered and sorted. Unknown filters or
 * operators are rejected with a 422; an unknown sort falls back to the default.
 */
trait HandlesListQuery
{
    private const MAX_PER_PAGE = 100;

    /**
     * Filterable fields, keyed by the field name the frontend sends.
     * - columns:  DB columns matched with OR (e.g. search over nome + cognome)
     * - relative: the operator the field accepts (contains | equals | between)
     *
     * @return array<string, array{columns: list<string>, relative: 'contains'|'equals'|'between'}>
     */
    abstract protected function filterable(): array;

    /** @return list<string> Columns the list may be sorted by */
    abstract protected function sortable(): array;

    protected function applyFilters(Builder $query, Request $request): Builder
    {
        $filters = $request->input('filters', []);
        if (! is_array($filters)) {
            throw ValidationException::withMessages(['filters' => 'Formato dei filtri non valido.']);
        }

        $definitions = $this->filterable();

        foreach ($filters as $field => $filter) {
            $definition = $definitions[$field] ?? null;
            if ($definition === null || ($filter['relative'] ?? null) !== $definition['relative']) {
                throw ValidationException::withMessages(["filters.$field" => 'Filtro non supportato.']);
            }

            $value = $filter['value'] ?? null;
            $columns = $definition['columns'];

            match ($definition['relative']) {
                'contains' => $this->whereContains($query, $columns, $value, $field),
                'equals' => $this->whereEquals($query, $columns, $value, $field),
                'between' => $this->whereDateBetween($query, $columns, $value, $field),
            };
        }

        return $query;
    }

    protected function applySort(Builder $query, Request $request, string $defaultField): Builder
    {
        $field = $request->query('sort');
        if (! in_array($field, $this->sortable(), true)) {
            $field = $defaultField;
        }
        $direction = strtoupper((string) $request->query('direction')) === 'DESC' ? 'desc' : 'asc';

        // Secondary key keeps pagination stable when the sort column has ties
        return $query->orderBy($field, $direction)->orderBy('id');
    }

    protected function paginatedResponse(Builder $query, Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('limit', 50), 1), self::MAX_PER_PAGE);
        $page = $query->paginate($perPage);

        return response()->json([
            'data' => $page->items(),
            'pagination' => [
                'total' => $page->total(),
                'per_page' => $page->perPage(),
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
            ],
        ]);
    }

    /** Every word of the value must match at least one of the columns. */
    private function whereContains(Builder $query, array $columns, mixed $value, string $field): void
    {
        if (! is_string($value)) {
            $this->invalidValue($field);
        }

        $terms = preg_split('/\s+/', trim($value), -1, PREG_SPLIT_NO_EMPTY);
        foreach ($terms as $term) {
            $escaped = addcslashes($term, '\\%_');
            $query->whereAny($columns, 'like', "%{$escaped}%");
        }
    }

    private function whereEquals(Builder $query, array $columns, mixed $value, string $field): void
    {
        if (! is_scalar($value)) {
            $this->invalidValue($field);
        }

        $query->whereAny($columns, '=', $value);
    }

    /** Value is [from, to] as "Y-m-d" strings; either end may be null (open range). */
    private function whereDateBetween(Builder $query, array $columns, mixed $value, string $field): void
    {
        if (! is_array($value) || count($value) !== 2) {
            $this->invalidValue($field);
        }

        [$from, $to] = array_map(fn ($date) => $this->parseDate($date, $field), array_values($value));
        if ($from === null && $to === null) {
            return;
        }

        $query->where(function (Builder $query) use ($columns, $from, $to) {
            foreach ($columns as $column) {
                $query->orWhere(function (Builder $query) use ($column, $from, $to) {
                    if ($from !== null) {
                        $query->whereDate($column, '>=', $from);
                    }
                    if ($to !== null) {
                        $query->whereDate($column, '<=', $to);
                    }
                });
            }
        });
    }

    private function parseDate(mixed $date, string $field): ?string
    {
        if ($date === null || $date === '') {
            return null;
        }

        $parsed = is_string($date) ? DateTimeImmutable::createFromFormat('!Y-m-d', $date) : false;
        if ($parsed === false || $parsed->format('Y-m-d') !== $date) {
            $this->invalidValue($field);
        }

        return $date;
    }

    private function invalidValue(string $field): never
    {
        throw ValidationException::withMessages(["filters.$field" => 'Valore del filtro non valido.']);
    }
}
