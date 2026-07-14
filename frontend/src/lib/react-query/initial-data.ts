export function isDefaultPageQuery(
  page: number,
  filters: Record<string, string>,
  defaults: Record<string, string>,
): boolean {
  if (page !== 1) {
    return false;
  }

  return Object.keys(defaults).every((key) => (filters[key] ?? '') === (defaults[key] ?? ''));
}
