import { Booking } from '../types';

const SHEET_CSV_URL: string =
  (import.meta.env.VITE_GOOGLE_SHEET_CSV_URL as string) || '';

type FuelLevel = 'Reserve' | 'Empty' | 'Half' | 'Full' | '';

interface TripRow {
  timestamp: string;
  tripAction: 'Start Trip' | 'End Trip' | 'Extend Trip' | string;
  customerName: string;
  vehicleNumber: string;
  vehicleModel: string;
  tripStartDate: string;
  tripEndDate: string;
  kmsReading: string;
  fastTagBalance: string;
  fuelLevel: FuelLevel;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        cur.push(field);
        field = '';
      } else if (ch === '\r') {
        // Skip carriage return
      } else if (ch === '\n') {
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows.filter((r) => r.some((c) => c && c.trim() !== ''));
}

function matchesBooking(row: TripRow, booking: Booking): boolean {
  const modelMatch =
    (row.vehicleModel || '').trim().toLowerCase() ===
    (booking.carName || '').trim().toLowerCase();
  const customerMatch =
    (row.customerName || '').trim().toLowerCase() ===
    (booking.customerName || '').trim().toLowerCase();
  return modelMatch && customerMatch;
}

export function normalizeSheetDateToIso(d: string): string {
  if (!d) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

  const raw = String(d).trim();
  const parts = raw.split(/[-/.]/).map((p) => Number(p.trim()));
  if (parts.length !== 3) return d;
  if (parts.some((n) => Number.isNaN(n))) return d;

  let y: number, m: number, day: number;

  if (parts[0] >= 1000) {
    y = parts[0];
    m = parts[1];
    day = parts[2];
  } else if (parts[2] >= 1000) {
    if (parts[0] > 12) {
      day = parts[0];
      m = parts[1];
      y = parts[2];
    } else if (parts[1] > 12) {
      m = parts[0];
      day = parts[1];
      y = parts[2];
    } else {
      day = parts[0];
      m = parts[1];
      y = parts[2];
    }
  } else {
    let yy = parts[2];
    yy = yy < 50 ? 2000 + yy : 1900 + yy;
    if (parts[0] > 12) {
      day = parts[0];
      m = parts[1];
    } else if (parts[1] > 12) {
      m = parts[0];
      day = parts[1];
    } else {
      day = parts[0];
      m = parts[1];
    }
    y = yy;
  }

  if (m < 1 || m > 12 || day < 1 || day > 31 || y < 1970) return d;
  const mm = String(m).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export interface LatestTripDates {
  startDate: string;
  endDate: string;
  tripAction: string;
  timestamp: string;
  vehicleNumber: string;
  kmsReading: string;
  fastTagBalance: string;
  fuelLevel: string;
}

export async function fetchLatestTripData(
  bookings: Booking[]
): Promise<Map<string, LatestTripDates>> {
  const result = new Map<string, LatestTripDates>();

  if (!SHEET_CSV_URL || !SHEET_CSV_URL.includes('docs.google.com')) {
    return result;
  }

  try {
    const response = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.text();
    const grid = parseCsv(raw);
    if (grid.length < 2) return result;

    const dataRows: TripRow[] = grid.slice(1).map((r) => ({
      timestamp: r[0] || '',
      tripAction: (r[1] || '').trim() as TripRow['tripAction'],
      customerName: r[2] || '',
      vehicleNumber: r[3] || '',
      vehicleModel: r[4] || '',
      tripStartDate: r[5] || '',
      tripEndDate: r[6] || '',
      kmsReading: r[7] || '',
      fastTagBalance: r[8] || '',
      fuelLevel: (r[9] || '').trim() as FuelLevel | '',
    }));

    for (const booking of bookings) {
      const matchingRows = dataRows
        .filter(
          (r) =>
            (r.tripAction === 'Start Trip' || r.tripAction === 'Extend Trip') &&
            matchesBooking(r, booking)
        )
        .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

      if (matchingRows.length > 0) {
        const latest = matchingRows[0];
        const startIso = normalizeSheetDateToIso(latest.tripStartDate);
        const endIso = normalizeSheetDateToIso(latest.tripEndDate);
        result.set(booking.id, {
          startDate: startIso || '',
          endDate: endIso || '',
          tripAction: latest.tripAction,
          timestamp: latest.timestamp,
          vehicleNumber: latest.vehicleNumber,
          kmsReading: latest.kmsReading,
          fastTagBalance: latest.fastTagBalance,
          fuelLevel: latest.fuelLevel,
        });
      }
    }
  } catch (error) {
    console.error('Failed to fetch trip data from Google Sheets:', error);
  }

  return result;
}