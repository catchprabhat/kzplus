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
  ArrowRightLeft,
  FileSpreadsheet,
  CalendarClock,
} from 'lucide-react';
import { Booking } from '../types';
import {
  buildTripFormUrl,
  formatDateIso,
  TRIP_FORM_CONFIG_EXPORT,
} from './BookingList';
import { LoadingSpinner } from './LoadingSpinner';

const { TRIP_FORM } = TRIP_FORM_CONFIG_EXPORT;

const SHEET_CSV_URL: string =
  (import.meta.env.VITE_GOOGLE_SHEET_CSV_URL as string) || '';

const FUEL_OPTIONS = ['Reserve', 'Empty', 'Half', 'Full'] as const;
type FuelLevel = (typeof FUEL_OPTIONS)[number];

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
  fuelLevel: FuelLevel | '';
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

function matchesBooking(row: TripRow, booking: Booking): boolean {
  const modelMatch =
    (row.vehicleModel || '').trim().toLowerCase() ===
    (booking.carName || '').trim().toLowerCase();
  const customerMatch =
    (row.customerName || '').trim().toLowerCase() ===
    (booking.customerName || '').trim().toLowerCase();
  return modelMatch && customerMatch;
}

function normalizeSheetDateToIso(d: string): string {
  if (!d) return '';
  // Already YYYY-MM-DD? Return as-is.
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

  const raw = String(d).trim();
  const parts = raw.split(/[-/\.]/).map((p) => Number(p.trim()));
  if (parts.length !== 3) return d;
  if (parts.some((n) => Number.isNaN(n))) return d;

  let y: number, m: number, day: number;

  // Case A: YYYY-MM-DD style (first number is 4 digits = year)
  if (parts[0] >= 1000) {
    y = parts[0];
    m = parts[1];
    day = parts[2];
  }
  // Case B: Indian / EU format DD/MM/YYYY  (e.g. "21/09/2026")
  // Heuristic: first part > 12 MUST be a day, not a month.
  // Or first part <=12, second part <=12 but first <=31 and second<=12 and third>31
  // Default to DD/MM/YYYY for India users (last part is year)
  else if (parts[2] >= 1000) {
    // Last number is a 4-digit year → format is [D, M, Y] or [M, D, Y]
    // Disambiguate:
    if (parts[0] > 12) {
      // Definitely DD/MM/YYYY (day > 12 cannot be a month)
      day = parts[0]; m = parts[1]; y = parts[2];
    } else if (parts[1] > 12) {
      // Definitely MM/DD/YYYY (month-2 > 12 cannot be month -> first must be month, second day)
      m = parts[0]; day = parts[1]; y = parts[2];
    } else {
      // Both parts[0] and parts[1] are <=12 → ambiguous.
      // For this India-based app, default to DD/MM/YYYY to match Google Sheet locale.
      day = parts[0]; m = parts[1]; y = parts[2];
    }
  }
  // Case C: 2-digit year, e.g. M/D/YY or D/M/YY → treat 00-49 as 2000s, 50-99 as 1900s
  else {
    let yy = parts[2];
    yy = yy < 50 ? 2000 + yy : 1900 + yy;
    if (parts[0] > 12) { day = parts[0]; m = parts[1]; }
    else if (parts[1] > 12) { m = parts[0]; day = parts[1]; }
    else { day = parts[0]; m = parts[1]; }
    y = yy;
  }

  if (m < 1 || m > 12 || day < 1 || day > 31 || y < 1970) return d;
  const mm = String(m).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export const ExtendTripPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = (location.state as any)?.booking as Booking | undefined;

  useEffect(() => {
    if (!booking) {
      alert(
        'Please open this Extend Trip page via the "Extend Trip" menu on the My Trips page.'
      );
      navigate('/my-trips');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        'VITE_GOOGLE_SHEET_CSV_URL is not set. Follow the instructions at the top of ExtendTripPage.tsx to publish your Google Sheet as CSV and paste the URL into c:\\kzplus\\.env .\n\nYou can still fill the Extend Trip form manually below.'
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
          )}.\n\nMake sure you published "Form Responses 1" as CSV (see instructions at top of ExtendTripPage.tsx).\n\nYou can still fill the Extend Trip form manually below.`
        );
      })
      .finally(() => setFetching(false));
  }, [booking]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(todayIso);
  const [endDate, setEndDate] = useState<string>(todayIso);

  useEffect(() => {
    if (booking) {
      const pickupIso = formatDateIso(booking.pickupDate);
      const dropIso = formatDateIso(booking.dropDate);
      setStartDate(pickupIso);
      setEndDate(dropIso);
    }
  }, [booking]);

  useEffect(() => {
    if (startRow) {
      const resolvedStart = normalizeSheetDateToIso(
        startRow.tripStartDate
      );
      const resolvedEnd = normalizeSheetDateToIso(startRow.tripEndDate);
      if (resolvedStart) setStartDate(resolvedStart);
      if (resolvedEnd) setEndDate(resolvedEnd);
    }
  }, [startRow]);

  const extendTripFormUrl = useMemo(() => {
    if (!booking) return '';
    const resolvedStartDate = startDate;
    const resolvedEndDate = endDate;
    return buildTripFormUrl('extend', booking, {
      vehicleNumber: startRow?.vehicleNumber || '',
      kmsReading: startRow?.kmsReading || '',
      fastTagBalance: startRow?.fastTagBalance || '',
      fuelLevel: startRow?.fuelLevel || '',
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
    });
  }, [booking, startRow, startDate, endDate]);

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/my-trips')}
          className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Trips
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Extend Trip: {booking.carName}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Customer:{' '}
          <span className="font-semibold">{booking.customerName}</span>
          &nbsp;&nbsp;
          
        </p>
      </div>

      {/* SECTION 1: Original Start Trip Details (read-only reference) */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-5 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-gray-200 dark:border-dark-700 flex items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Original Start Trip Details
          </h3>
          <span className="ml-auto text-xs text-indigo-700 dark:text-indigo-400 italic">
            Locked — cannot be changed
          </span>
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
              <InfoCell
                icon={<CalendarClock className="w-4 h-4" />}
                label="Last submitted"
                value={startRow.timestamp}
              />
              <InfoCell
                icon={<FileSpreadsheet className="w-4 h-4" />}
                label="Source action"
                value={startRow.tripAction}
              />
              <InfoCell
                icon={<User className="w-4 h-4" />}
                label="Customer"
                value={startRow.customerName || '—'}
              />
              <InfoCell
                icon={<Car className="w-4 h-4" />}
                label="Vehicle Model"
                value={startRow.vehicleModel || booking.carName}
              />
              <InfoCell
                icon={<CreditCard className="w-4 h-4" />}
                label="Vehicle Number"
                value={startRow.vehicleNumber || '—'}
              />
              <InfoCell
                icon={<Gauge className="w-4 h-4" />}
                label="KMs Reading"
                value={startRow.kmsReading ? `${startRow.kmsReading} km` : '—'}
                highlight
              />
              <InfoCell
                icon={<IndianRupee className="w-4 h-4" />}
                label="Fast Tag Balance"
                value={
                  startRow.fastTagBalance ? `₹${startRow.fastTagBalance}` : '—'
                }
                highlight
              />
              <InfoCell
                icon={<Fuel className="w-4 h-4" />}
                label="Fuel Level"
                value={startRow.fuelLevel || '—'}
                highlight
              />
              <InfoCell
                icon={<ArrowRightLeft className="w-4 h-4" />}
                label="Trip Action"
                value={startRow.tripAction || 'Start Trip'}
              />
            </div>
          ) : (
            !fetching &&
            !fetchErr && (
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p>
                  🔎 No{' '}
                  <span className="font-semibold">Start Trip / Extend Trip</span>{' '}
                  submission was found in Google Sheet for this exact vehicle +
                  customer combo yet.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-1 text-gray-500 dark:text-gray-400">
                  <li>
                    Make sure you already submitted a Start Trip form for this
                    booking.
                  </li>
                  <li>
                    Vehicle model name in the Start Trip form must be exactly{' '}
                    <strong>{booking.carName}</strong>.
                  </li>
                  <li>
                    Customer name must be exactly{' '}
                    <strong>{booking.customerName}</strong>.
                  </li>
                  <li>
                    Wait ~10 seconds after Google Form submission before
                    trying again, then refresh this page.
                  </li>
                </ul>
                <p className="text-gray-500 dark:text-gray-400 italic mt-3">
                  (You can still fill the Extend Trip form manually — dates
                  will be prefilled from the original booking dates.)
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* SECTION 2: Editable Dates Only */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-gray-200 dark:border-dark-700 flex items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Edit Trip Dates
          </h3>
          <span className="ml-auto text-xs text-amber-700 dark:text-amber-400">
            Only these fields change
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Trip Start Date *">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Change this to adjust when the extended trip began.
            </p>
          </Field>
          <Field label="New Trip End Date *">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Change this to extend the trip to a new end date.
            </p>
          </Field>
        </div>
      </div>

      {/* SECTION 3: Summary of what will be submitted */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-5 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-dark-700 flex items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Upcoming Submission Preview
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCell
            icon={<ArrowRightLeft className="w-4 h-4" />}
            label="Trip Action"
            value="Extend Trip"
            highlight
          />
          <InfoCell
            icon={<User className="w-4 h-4" />}
            label="Customer Name"
            value={booking.customerName}
          />
          <InfoCell
            icon={<Car className="w-4 h-4" />}
            label="Vehicle Model"
            value={booking.carName}
          />
          <InfoCell
            icon={<CreditCard className="w-4 h-4" />}
            label="Vehicle Number"
            value={startRow?.vehicleNumber || '—'}
          />
          <InfoCell
            icon={<Gauge className="w-4 h-4" />}
            label="KMs Reading"
            value={startRow?.kmsReading ? `${startRow.kmsReading} km` : '—'}
          />
          <InfoCell
            icon={<IndianRupee className="w-4 h-4" />}
            label="Fast Tag Balance"
            value={startRow?.fastTagBalance ? `₹${startRow.fastTagBalance}` : '—'}
          />
          <InfoCell
            icon={<Fuel className="w-4 h-4" />}
            label="Fuel Level"
            value={startRow?.fuelLevel || '—'}
          />
          <InfoCell
            icon={<Calendar className="w-4 h-4" />}
            label="NEW Start Date"
            value={startDate || '—'}
            highlight
          />
          <InfoCell
            icon={<Calendar className="w-4 h-4" />}
            label="NEW End Date"
            value={endDate || '—'}
            highlight
          />
        </div>
      </div>

      {/* SECTION 4: Open Google Form */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
            Submit Extend Trip
          </h2>
          <p className="text-white/90 sm:text-lg">
            Verify the new dates and Submit Below
          </p>
         
          <a
            href={extendTripFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-bold shadow-xl transition-transform active:scale-95 ${
              !extendTripFormUrl || TRIP_FORM.formId.startsWith('REPLACE_')
                ? 'bg-white/30 text-white/70 pointer-events-none'
                : 'bg-white text-amber-700 hover:bg-amber-50'
            }`}
          >
            Submit Here
          </a>
        </div>
      </div>

      {/* Customer contact strip */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md border border-gray-200 dark:border-dark-700 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCell
          icon={<User className="w-4 h-4" />}
          label="Customer"
          value={booking.customerName}
        />
        <InfoCell
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          value={booking.customerEmail}
        />
        <InfoCell
          icon={<Phone className="w-4 h-4" />}
          label="Phone"
          value={booking.customerPhone}
        />
      </div>
    </div>
  );
};

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
