import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Fuel,
  Gauge,
  CreditCard,
  IndianRupee,
  Play,
  Square,
  FileSpreadsheet,
  Link as LinkIcon,
  CalendarClock,
} from 'lucide-react';
import { Booking } from '../types';
import {
  buildTripFormUrl,
  formatDateIso,
  TRIP_FORM_CONFIG_EXPORT,
} from './BookingList';
import { LoadingSpinner } from './LoadingSpinner';

const { TRIP_FORM, TRIP_ACTION_FORM_VALUE } = TRIP_FORM_CONFIG_EXPORT;

// ============================================================
// GOOGLE SHEET CSV PUBLISH URL — for fetching START TRIP data
// ------------------------------------------------------------
// How to get this value (do this ONCE in Google Sheets):
//   1) Open your "Trip Management - Responses" spreadsheet
//   2) Click menu: File -> Share -> "Publish to web"
//   3) Under "Link" tab:
//        - Sheet:      choose "Form Responses 1" (NOT the per-car tabs!)
//        - Format:    change "Web page" to "Comma-separated values (.csv)"
//   4) Click "Publish" -> confirm OK
//   5) COPY the generated URL. It looks like:
//        https://docs.google.com/spreadsheets/d/e/<LONGID>/pub?gid=0&single=true&output=csv
//   6) Paste it into your frontend .env file as:
//        VITE_GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/<LONGID>/pub?gid=0&single=true&output=csv
// ============================================================
const SHEET_CSV_URL: string =
  (import.meta.env.VITE_GOOGLE_SHEET_CSV_URL as string) || '';

const FUEL_OPTIONS = ['Reserve', 'Empty', 'Half', 'Full'] as const;
type FuelLevel = (typeof FUEL_OPTIONS)[number];

/** Numeric weight for fuel levels so we can calculate fuel used. */
const FUEL_VALUE: Record<FuelLevel, number> = {
  Reserve: 0.1,
  Empty: 0.0,
  Half: 0.5,
  Full: 1.0,
};

/** Representation of a parsed row from the Google Sheet Form Responses CSV. */
interface TripRow {
  timestamp: string;          // Col A
  tripAction: 'Start Trip' | 'End Trip' | 'Extend Trip' | string;  // Col B
  customerName: string;       // Col C
  vehicleNumber: string;      // Col D
  vehicleModel: string;       // Col E
  tripStartDate: string;      // Col F
  tripEndDate: string;        // Col G
  kmsReading: string;         // Col H
  fastTagBalance: string;     // Col I
  fuelLevel: FuelLevel | '';  // Col J
}

/** Robust CSV -> array of arrays parser. */
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
        /* skip */
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

/** Match a start trip row against the target booking. */
function matchesBooking(row: TripRow, booking: Booking): boolean {
  const modelMatch =
    (row.vehicleModel || '').trim().toLowerCase() ===
    (booking.carName || '').trim().toLowerCase();
  const customerMatch =
    (row.customerName || '').trim().toLowerCase() ===
    (booking.customerName || '').trim().toLowerCase();
  return modelMatch && customerMatch;
}

export const EndTripPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = (location.state as any)?.booking as Booking | undefined;

  // Redirect if booking isn't present in router state (came here directly)
  useEffect(() => {
    if (!booking) {
      alert(
        'Please open this End Trip page via the "End Trip" menu on the My Trips page.'
      );
      navigate('/my-trips');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Fetch matching START TRIP from Google Sheet CSV ----------
  const [sheetRows, setSheetRows] = useState<TripRow[]>([]);
  const [startRow, setStartRow] = useState<TripRow | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [fetchErr, setFetchErr] = useState<string>('');
  const ranFetchRef = useRef<boolean>(false);

  useEffect(() => {
    if (!booking || ranFetchRef.current) return;
    ranFetchRef.current = true;

    if (!SHEET_CSV_URL || !SHEET_CSV_URL.includes('docs.google.com')) {
      setFetchErr(
        'VITE_GOOGLE_SHEET_CSV_URL is not set. Follow the instructions at the top of EndTripPage.tsx to publish your Google Sheet as CSV and paste the URL into c:\\kzplus\\.env .\n\nYou can still fill the End Trip form manually below.'
      );
      return;
    }

    setFetching(true);
    fetch(SHEET_CSV_URL, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((raw) => {
        const grid = parseCsv(raw);
        if (grid.length < 2) {
          setSheetRows([]);
          return;
        }
        // First row is headers -> skip, start from row index 1
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
        setSheetRows(dataRows);
        // Find the LATEST Start Trip OR Extend Trip row that matches this booking.
        // We treat Extend Trip as the "new start" after an extension, so its dates
        // and readouts become the baseline for End Trip calculations.
        const starts = dataRows
          .filter(
            (r) =>
              (r.tripAction === 'Start Trip' || r.tripAction === 'Extend Trip') &&
              matchesBooking(r, booking)
          )
          .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
        if (starts.length > 0) setStartRow(starts[0]);
      })
      .catch((e) => {
        console.error('Failed to fetch Google Sheet CSV:', e);
        setFetchErr(
          `Failed to fetch Start Trip data from Google Sheet: ${String(
            e?.message || e
          )}.\n\nMake sure you published "Form Responses 1" as CSV (see instructions at top of EndTripPage.tsx).\n\nYou can still fill the End Trip form manually below.`
        );
      })
      .finally(() => setFetching(false));
  }, [booking]);

  // ---------- End Trip form state (prefilled from start row if possible) ----------
  const todayIso = new Date().toISOString().slice(0, 10);
  const [endDate, setEndDate] = useState<string>(todayIso);
  const [endTime, setEndTime] = useState<string>(
    // Format current time as HH:mm for the datetime-local step via separate date+time
    new Date().toTimeString().slice(0, 5)
  );
  const [endKms, setEndKms] = useState<string>('');
  const [endFastTag, setEndFastTag] = useState<string>('');
  const [endFuel, setEndFuel] = useState<FuelLevel | ''>('');

  // Prefill the "expected" trip end date:
  //  - Prefer the latest Start/Extend Trip sheet row's end date (so EXTENDED trips
  //    show the new extended end date instead of the original booking end date).
  //  - Otherwise fall back to the original booking drop date.
  // Re-run when startRow changes because sheet fetch is async (arrives AFTER booking init).
  // Always normalize through normalizeSheetDateToIso first so DD/MM/YYYY sheet dates
  // become proper YYYY-MM-DD that the <input type="date"> control expects.
  useEffect(() => {
    if (startRow?.tripEndDate) {
      const sheetEndIso = normalizeSheetDateToIso(startRow.tripEndDate);
      if (/^\d{4}-\d{2}-\d{2}$/.test(sheetEndIso)) {
        setEndDate(sheetEndIso);
        return;
      }
    }
    if (booking) {
      const dropIso = formatDateIso(booking.dropDate);
      setEndDate(dropIso);
    }
  }, [booking, startRow]);

  // ---------- Auto-computed metrics ----------
  const metrics = useMemo(() => {
    const startKmsNum = startRow?.kmsReading ? Number(startRow.kmsReading) : NaN;
    const endKmsNum = endKms ? Number(endKms) : NaN;
    const startFastTagNum = startRow?.fastTagBalance
      ? Number(startRow.fastTagBalance)
      : NaN;
    const endFastTagNum = endFastTag ? Number(endFastTag) : NaN;
    const startFuelVal = startRow?.fuelLevel ? FUEL_VALUE[startRow.fuelLevel as FuelLevel] ?? NaN : NaN;
    const endFuelVal = endFuel ? FUEL_VALUE[endFuel as FuelLevel] ?? NaN : NaN;

    let totalDistanceKm: number | null = null;
    if (!Number.isNaN(startKmsNum) && !Number.isNaN(endKmsNum) && endKmsNum >= startKmsNum) {
      totalDistanceKm = +(endKmsNum - startKmsNum).toFixed(1);
    }

    let fastTagUsed: number | null = null;
    if (!Number.isNaN(startFastTagNum) && !Number.isNaN(endFastTagNum)) {
      fastTagUsed = +(startFastTagNum - endFastTagNum).toFixed(2);
    }

    let fuelUsed: string | null = null;
    if (!Number.isNaN(startFuelVal) && !Number.isNaN(endFuelVal)) {
      const delta = startFuelVal - endFuelVal;
      if (delta >= 0) {
        const tankPct = Math.round(delta * 100);
        fuelUsed = `${tankPct}% of tank (${startRow?.fuelLevel ?? '?'} → ${endFuel || '?'})`;
      } else {
        fuelUsed = `Refueled (added ${Math.round(Math.abs(delta) * 100)}% to tank)`;
      }
    }

    // Duration = end date/time vs. booking pickup OR start trip timestamp
    let durationDays: number | null = null;
    let durationHours: number | null = null;
    if (startRow?.tripStartDate && endDate) {
      try {
        // Use our robust normalizer — correctly handles DD/MM/YYYY sheet dates,
        // M/D/YYYY US dates, and YYYY-MM-DD ISO. Returns clean YYYY-MM-DD.
        const startIso = normalizeSheetDateToIso(startRow.tripStartDate);
        if (/^\d{4}-\d{2}-\d{2}$/.test(startIso)) {
          // Parse ISO (YYYY-MM-DD) as LOCAL noon — avoids UTC midnight timezone shifts.
          const [y, mo, d] = startIso.split('-').map(Number);
          const s = new Date(y, (mo || 1) - 1, d || 1, 12, 0, 0);
          const [y2, m2, d2] = endDate.split('-').map(Number);
          const [hh, mm] = endTime.split(':').map((v) => Number(v || 0));
          const e = new Date(y2, (m2 || 1) - 1, d2 || 1, hh || 0, mm || 0);
          const ms = e.getTime() - s.getTime();
          if (ms >= 0) {
            durationHours = Math.round(ms / (1000 * 60 * 60));
            durationDays = +(durationHours / 24).toFixed(2);
          }
        }
      } catch {
        /* ignore */
      }
    }

    return {
      totalDistanceKm,
      fastTagUsed,
      fuelUsed,
      durationDays,
      durationHours,
      startKms: Number.isNaN(startKmsNum) ? null : startKmsNum,
      endKms: Number.isNaN(endKmsNum) ? null : endKmsNum,
      startFastTag: Number.isNaN(startFastTagNum) ? null : startFastTagNum,
      endFastTag: Number.isNaN(endFastTagNum) ? null : endFastTagNum,
      startFuelLevel: startRow?.fuelLevel || null,
      endFuelLevel: endFuel || null,
    };
  }, [startRow, endDate, endTime, endKms, endFastTag, endFuel]);

  // ---------- Pre-filled Google Form URL for End Trip submission ----------
  const endTripFormUrl = useMemo(() => {
    if (!booking) return '';
    // Build a single End Date that combines the user-chosen End Date + End Time
    // so that when the form opens, the correct End Date value is pre-filled
    // (Google Forms date prefill uses Y/M/D subparams only — time is shown in UI separately)
    const resolvedStartDate = startRow?.tripStartDate
      ? normalizeSheetDateToIso(startRow.tripStartDate)
      : formatDateIso(booking.pickupDate);
    const resolvedEndDate = endDate || formatDateIso(booking.dropDate);
    return buildTripFormUrl('end', booking, {
      vehicleNumber: startRow?.vehicleNumber || '',
      kmsReading: endKms || '',
      fastTagBalance: endFastTag || '',
      fuelLevel: endFuel || '',
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
    });
  }, [booking, startRow, endKms, endFastTag, endFuel, endDate]);

  /** Convert Google Sheet date into YYYY-MM-DD so buildTripFormUrl can parse it reliably.
   *
   *  Google Sheets displays dates in the viewer's locale. For Indian users this is
   *  DD/MM/YYYY (e.g. "21/09/2026"). The old parser wrongly assumed US M/D/YYYY which
   *  made day=21 look like month=21 (invalid month), producing "NaN-NaN-NaN" dates
   *  everywhere in the UI. This robust parser detects the format with heuristics:
   *    - first number >= 1000 → YYYY-MM-DD (ISO)
   *    - last number >= 1000 + first number > 12 → DD/MM/YYYY (day can't be a month)
   *    - last number >= 1000 + second number > 12 → MM/DD/YYYY (US)
   *    - otherwise (ambiguous MM vs DD ≤ 12) → default to DD/MM/YYYY for this India app.
   */
  function normalizeSheetDateToIso(d: string): string {
    if (!d) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

    const raw = String(d).trim();
    const parts = raw.split(/[-/\.]/).map((p) => Number(p.trim()));
    if (parts.length !== 3) return d;
    if (parts.some((n) => Number.isNaN(n))) return d;

    let y: number, m: number, day: number;

    if (parts[0] >= 1000) {
      y = parts[0]; m = parts[1]; day = parts[2];
    } else if (parts[2] >= 1000) {
      if (parts[0] > 12)       { day = parts[0]; m = parts[1]; y = parts[2]; }
      else if (parts[1] > 12)  { m   = parts[0]; day = parts[1]; y = parts[2]; }
      else                     { day = parts[0]; m = parts[1]; y = parts[2]; }
    } else {
      let yy = parts[2];
      yy = yy < 50 ? 2000 + yy : 1900 + yy;
      if (parts[0] > 12)       { day = parts[0]; m = parts[1]; }
      else if (parts[1] > 12)  { m   = parts[0]; day = parts[1]; }
      else                     { day = parts[0]; m = parts[1]; }
      y = yy;
    }

    if (m < 1 || m > 12 || day < 1 || day > 31 || y < 1970) return d;
    const mm = String(m).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const allInputsFilledForCalc =
    startRow && endKms && endFastTag && endFuel;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ---------- Top bar / back ---------- */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/my-trips')}
          className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Trips
        </button>
        
      </div>

      {/* ---------- Title ---------- */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          End Trip: {booking.carName}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Customer: <span className="font-semibold">{booking.customerName}</span> &nbsp;·&nbsp;
          {(startRow?.tripStartDate || startRow?.tripEndDate) ? (
            (
              () => {
                // Normalize to YYYY-MM-DD ONCE, then display as raw ISO.
                // Do NOT run an already-normalized string through formatDateIso()/new Date(),
                // because UTC midnight parsing in IST (+05:30) causes off-by-one-day bugs
                // and "NaN-NaN-NaN" display.
                const sRaw = startRow?.tripStartDate;
                const eRaw = startRow?.tripEndDate;
                const sIso = sRaw ? normalizeSheetDateToIso(sRaw) : '';
                const eIso = eRaw ? normalizeSheetDateToIso(eRaw) : '';
                const pickupIso = formatDateIso(booking.pickupDate);
                const dropIso = formatDateIso(booking.dropDate);
                const showS = /^\d{4}-\d{2}-\d{2}$/.test(sIso) ? sIso : pickupIso;
                const showE = /^\d{4}-\d{2}-\d{2}$/.test(eIso) ? eIso : dropIso;
                return (
                  <>
                    Effective:{' '}
                    {showS}
                    {' → '}
                    {showE}
                    {startRow?.tripAction === 'Extend Trip' && (
                      <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium align-middle">
                        extended
                      </span>
                    )}
                  </>
                );
              }
            )()
          ) : (
            <>
              Booking: {formatDateIso(booking.pickupDate)} → {formatDateIso(booking.dropDate)}
            </>
          )}
        </p>
      </div>

      {/* ---------- SECTION 1: Start Trip Details (auto-populated) ---------- */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-5 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-dark-700 flex items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Start Trip Details
          </h3>
        </div>
        <div className="p-5">
          {fetching && (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              <LoadingSpinner size="sm" text="Loading Start Trip data..." />
            </div>
          )}
          {!fetching && fetchErr && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700/50 p-4 text-sm text-amber-800 dark:text-amber-300 whitespace-pre-line">
              ⚠️ {fetchErr}
            </div>
          )}
          {!fetching && startRow ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCell icon={<CalendarClock className="w-4 h-4" />} label="Start Trip submitted" value={startRow.timestamp} />
              <InfoCell icon={<User className="w-4 h-4" />} label="Customer" value={startRow.customerName || '—'} />
              <InfoCell icon={<Car className="w-4 h-4" />} label="Vehicle Model" value={startRow.vehicleModel || booking.carName} />
              <InfoCell icon={<CreditCard className="w-4 h-4" />} label="Vehicle Number" value={startRow.vehicleNumber || '—'} />
              <InfoCell icon={<Calendar className="w-4 h-4" />} label="Start Date" value={startRow.tripStartDate || formatDateIso(booking.pickupDate)} />
              <InfoCell icon={<Calendar className="w-4 h-4" />} label="End Date (booking)" value={startRow.tripEndDate || formatDateIso(booking.dropDate)} />
              <InfoCell highlight icon={<Gauge className="w-4 h-4" />} label="Start KMs Reading" value={startRow.kmsReading ? `${startRow.kmsReading} km` : '—'} />
              <InfoCell highlight icon={<IndianRupee className="w-4 h-4" />} label="Start Fast Tag Balance" value={startRow.fastTagBalance ? `₹${startRow.fastTagBalance}` : '—'} />
              <InfoCell highlight icon={<Fuel className="w-4 h-4" />} label="Start Fuel Level" value={startRow.fuelLevel || '—'} />
            </div>
          ) : (
            !fetching && !fetchErr && (
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p>
                  🔎 No <span className="font-semibold">Start Trip</span> submission was found in Google Sheet for this exact vehicle + customer combo yet.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-1 text-gray-500 dark:text-gray-400">
                  <li>Make sure you already submitted a Start Trip form for this booking.</li>
                  <li>Vehicle model name in the Start Trip form must be exactly <strong>{booking.carName}</strong>.</li>
                  <li>Customer name must be exactly <strong>{booking.customerName}</strong>.</li>
                  <li>Wait ~10 seconds after Google Form submission before trying again, then refresh this page.</li>
                </ul>
                <p className="text-gray-500 dark:text-gray-400 italic mt-3">
                  (You can still fill the End Trip form below manually. Calculations that depend on Start values will show once you also pick matching Start Trip inputs.)
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* ---------- SECTION 2: End Trip form ---------- */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-5 py-3 bg-teal-50 dark:bg-teal-900/20 border-b border-gray-200 dark:border-dark-700 flex items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Enter End Trip Readings
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Trip End Date *">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </Field>
          <Field label="Trip End Time *">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
            />
          </Field>
          <Field label="KMs Reading (at trip end) *">
            <div className="relative">
              <Gauge className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                inputMode="numeric"
                min={startRow?.kmsReading ? Number(startRow.kmsReading) : 0}
                value={endKms}
                onChange={(e) => setEndKms(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km</span>
            </div>
          </Field>
          <Field label="Fast Tag Balance (at trip end) *">
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={endFastTag}
                onChange={(e) => setEndFastTag(e.target.value)}
                placeholder="e.g. 123"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
            </div>
          </Field>
          <Field label="Fuel Level (at trip end) *" className="sm:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FUEL_OPTIONS.map((f) => {
                const active = endFuel === f;
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setEndFuel(f)}
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                      active
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-dark-600 hover:border-teal-400'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>

      {/* ---------- SECTION 3: Auto-calculated metrics ---------- */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-5 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-dark-700 flex items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Summary
          </h3>
          {!allInputsFilledForCalc && (
            <span className="ml-auto text-xs text-purple-700 dark:text-purple-400 italic">
            </span>
          )}
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Trip Duration"
            primary={
              metrics.durationHours != null
                ? `${metrics.durationHours} hour${metrics.durationHours === 1 ? '' : 's'}`
                : '—'
            }
            secondary={
              metrics.durationDays != null ? `≈ ${metrics.durationDays} day${metrics.durationDays === 1 ? '' : 's'}` : undefined
            }
            accent="from-blue-500 to-blue-600"
            icon={<Clock className="w-5 h-5" />}
          />
          <MetricCard
            label="Total Distance Travelled"
            primary={metrics.totalDistanceKm != null ? `${metrics.totalDistanceKm} km` : '—'}
            secondary={
              metrics.startKms != null && metrics.endKms != null
                ? `${metrics.startKms.toLocaleString()} → ${metrics.endKms.toLocaleString()}`
                : undefined
            }
            accent="from-indigo-500 to-violet-600"
            icon={<Gauge className="w-5 h-5" />}
          />
          <MetricCard
            label="Fast Tag Used"
            primary={metrics.fastTagUsed != null ? `₹${metrics.fastTagUsed.toLocaleString()}` : '—'}
            secondary={
              metrics.startFastTag != null && metrics.endFastTag != null
                ? `₹${metrics.startFastTag} start → ₹${metrics.endFastTag} end`
                : undefined
            }
            accent="from-amber-500 to-orange-600"
            icon={<IndianRupee className="w-5 h-5" />}
          />
          <MetricCard
            label="Fuel Used"
            primary={metrics.fuelUsed || '—'}
            secondary={
              metrics.startFuelLevel && metrics.endFuelLevel
                ? `${metrics.startFuelLevel} → ${metrics.endFuelLevel}`
                : undefined
            }
            accent="from-emerald-500 to-green-600"
            icon={<Fuel className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* ---------- SECTION 4: Open Google Form to save End Trip ---------- */}
      <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
            Submit End Trip
          </h2>
          <p className="text-white/90 sm:text-lg">
            Verify the above details and Submit Below
          </p>
          <a
            href={endTripFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-bold shadow-xl transition-transform active:scale-95 ${
              !endTripFormUrl || TRIP_FORM.formId.startsWith('REPLACE_')
                ? 'bg-white/30 text-white/70 pointer-events-none'
                : 'bg-white text-teal-700 hover:bg-teal-50'
            }`}
          >
            
            Submit Here
          </a>
        </div>
      </div>

      {/* ---------- Customer contact strip (admin reference) ---------- */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCell icon={<User className="w-4 h-4" />} label="Customer" value={booking.customerName} />
        <InfoCell icon={<Mail className="w-4 h-4" />} label="Email" value={booking.customerEmail} />
        <InfoCell icon={<Phone className="w-4 h-4" />} label="Phone" value={booking.customerPhone} />
      </div>
    </div>
  );
};

/* --------------------------- small UI helpers --------------------------- */

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => (
  <label className={`block ${className || ''}`}>
    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

const InfoCell: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div
    className={`rounded-lg border p-3 ${
      highlight
        ? 'bg-gray-50 dark:bg-dark-700/60 border-gray-200 dark:border-dark-600'
        : 'border-gray-100 dark:border-dark-700/70'
    }`}
  >
    <div className="flex items-center text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
      <span className="mr-1.5 text-gray-400">{icon}</span>
      {label}
    </div>
    <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
      {value}
    </div>
  </div>
);

const MetricCard: React.FC<{
  label: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  accent: string;
  icon: React.ReactNode;
}> = ({ label, primary, secondary, accent, icon }) => (
  <div className="rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden bg-white dark:bg-dark-700/50">
    <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
    <div className="p-4">
      <div className="flex items-center text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">
        <span className={`w-5 h-5 mr-2 p-1 rounded bg-gradient-to-br ${accent} text-white flex items-center justify-center`}>{icon}</span>
        {label}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug break-words">
        {primary}
      </div>
      {secondary && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {secondary}
        </div>
      )}
    </div>
  </div>
);