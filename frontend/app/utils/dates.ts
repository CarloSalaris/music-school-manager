/**
 * Date-only values travel to/from the API as local "YYYY-MM-DD" strings.
 * Never send a Date object: JSON serializes it in UTC, which for any
 * timezone ahead of UTC turns local midnight into the previous day.
 */

/** "YYYY-MM-DD" → local-midnight Date (null for empty input). */
export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Date → "YYYY-MM-DD" using local calendar fields (null for non-dates). */
export function toIsoDate(date: unknown): string | null {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
