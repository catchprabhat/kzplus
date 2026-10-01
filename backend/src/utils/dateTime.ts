/**
 * Format booking pickup/drop as India local date + 12-hour time.
 * Stored values are wall-clock (e.g. "2026-10-01 09:00:00"), not UTC noon.
 */
export function formatBookingDateTime(dateString: string): string {
  const match = String(dateString).trim().match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/
  );

  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    const hours = (match[4] ?? '0').padStart(2, '0');
    const minutes = (match[5] ?? '0').padStart(2, '0');
    const seconds = (match[6] ?? '0').padStart(2, '0');
    const tz = match[7];

    // Naive booking timestamps are India wall-clock. Pin +05:30 so a UTC
    // server does not shift 09:00 to 2:30 PM.
    const date =
      tz && tz !== 'Z'
        ? new Date(dateString)
        : new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`);

    return date.toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  }

  const fallback = new Date(dateString);
  if (Number.isNaN(fallback.getTime())) {
    return String(dateString);
  }

  return fallback.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}
