import { describe, expect, it } from 'vitest';
import {
  combineDateWithClock,
  formatLocalDateTimeForDatabase,
  parseLocalDateTime,
} from './dateTime';

describe('booking date times', () => {
  it('keeps selected 9:00 AM instead of defaulting to noon', () => {
    const date = new Date(2026, 9, 1, 0, 0, 0);
    const stored = formatLocalDateTimeForDatabase(date, {
      hour: 9,
      minute: 0,
      period: 'AM',
    });
    expect(stored).toBe('2026-10-01T09:00:00+05:30');
  });

  it('keeps 6:30 PM as 18:30', () => {
    const date = new Date(2026, 9, 2, 0, 0, 0);
    const stored = formatLocalDateTimeForDatabase(date, {
      hour: 6,
      minute: 30,
      period: 'PM',
    });
    expect(stored).toBe('2026-10-02T18:30:00+05:30');
  });

  it('parses naive timestamps as local wall-clock and ISO UTC as an instant', () => {
    const parsed = parseLocalDateTime('2026-10-01 09:00:00');
    expect(parsed.getHours()).toBe(9);
    expect(parsed.getMinutes()).toBe(0);

    const fromOffset = parseLocalDateTime('2026-10-01T09:00:00+05:30');
    expect(fromOffset.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })).toMatch(/9:00/);
  });

  it('combines calendar date with clock', () => {
    const combined = combineDateWithClock(new Date(2026, 9, 1), {
      hour: 11,
      minute: 15,
      period: 'AM',
    });
    expect(combined.getHours()).toBe(11);
    expect(combined.getMinutes()).toBe(15);
    expect(combined.getDate()).toBe(1);
  });
});
