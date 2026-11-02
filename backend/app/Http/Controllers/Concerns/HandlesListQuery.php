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
     * - relative: the operator the field accepts (contains | equals | between)
     * - columns:  DB columns matched with OR (e.g. search over nome + cognome)
     * - apply:    alternative to columns for derived fields (e.g. a model scope);
     *             receives the query and the validated value
     *
     * @return array<string, array{
     *     relative: 'contains'|'equals'|'between',
     *     columns?: list<string>,
     *     apply?: callable(Builder, mixed): void
     * }>
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

            $value = $this->validatedValue($definition['relative'], $filter['value'] ?? null, $field);

            if (isset($definition['apply'])) {
                $definition['apply']($query, $value);
                continue;
            }

            $columns = $definition['columns'];
            match ($definition['relative']) {
                'contains' => $this->whereContains($query, $columns, $value),
                'equals' => $query->whereAny($columns, '=', $value),
                'between' => $this->whereDateBetween($query, $columns, $value),
            };
        }

        return $query;
    }

    /** Interprets a filter value as a boolean ("1"/"0", true/false); 422 otherwise. */
    protected function booleanValue(mixed $value, string $field): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE)
            ?? $this->invalidValue($field);
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

    /**
     * Checks the value shape required by the operator:
     * contains → string, equals → scalar, between → [from, to] of "Y-m-d" or null.
     */
    private function validatedValue(string $relative, mixed $value, string $field): mixed
    {
        return match ($relative) {
            'contains' => is_string($value) ? $value : $this->invalidValue($field),
            'equals' => is_scalar($value) ? $value : $this->invalidValue($field),
            'between' => is_array($value) && count($value) === 2
                ? array_map(fn ($date) => $this->parseDate($date, $field), array_values($value))
                : $this->invalidValue($field),
        };
    }

    /** Every word of the value must match at least one of the columns. */
    private function whereContains(Builder $query, array $columns, string $value): void
    {
        $terms = preg_split('/\s+/', trim($value), -1, PREG_SPLIT_NO_EMPTY);
        foreach ($terms as $term) {
            $escaped = addcslashes($term, '\\%_');
            $query->whereAny($columns, 'like', "%{$escaped}%");
        }
    }

    /** Open-ended range: either end may be null. */
    private function whereDateBetween(Builder $query, array $columns, array $range): void
    {
        [$from, $to] = $range;
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
