const IST = 'Asia/Kolkata';

export function formatIstDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: IST,
  });
}

export function formatIstTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: IST,
  });
}

export type Clock12 = {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
};

export function clock12To24(clock: Clock12): { hours: number; minutes: number } {
  let hours = clock.hour % 12;
  if (clock.period === 'PM') hours += 12;
  return { hours, minutes: clock.minute };
}

/**
 * Parse booking datetimes as local wall-clock unless an explicit timezone is present.
 * Date-only strings are local midnight, not UTC, so IST does not shift the day.
 */
export function parseLocalDateTime(value: Date | string): Date {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  const s = String(value).trim();
  const match = s.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/
  );

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const hours = match[4] != null ? parseInt(match[4], 10) : 0;
    const minutes = match[5] != null ? parseInt(match[5], 10) : 0;
    const seconds = match[6] != null ? parseInt(match[6], 10) : 0;
    const tz = match[7];

    // ISO with Z or an explicit offset is a real instant.
    if (tz) {
      return new Date(s.includes('T') ? s : s.replace(' ', 'T'));
    }

    return new Date(year, month, day, hours, minutes, seconds);
  }

  return new Date(s);
}

export function combineDateWithClock(date: Date | string, clock: Clock12): Date {
  const local = parseLocalDateTime(date);
  const { hours, minutes } = clock12To24(clock);
  local.setHours(hours, minutes, 0, 0);
  return local;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local `YYYY-MM-DDTHH:mm:ss` for React state / form inputs. */
export function formatLocalDateTimeInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** IST wall-clock `YYYY-MM-DDTHH:mm:ss+05:30` for the booking API / database. */
export function formatLocalDateTimeForDatabase(
  value: Date | string,
  clock?: Clock12
): string {
  const date = clock ? combineDateWithClock(value, clock) : parseLocalDateTime(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}+05:30`;
}
