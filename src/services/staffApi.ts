/**
 * Staff Attendance Service
 *
 * Local-storage-backed attendance DB with midnight REST API sync.
 * Schema mirrors what the backend expects so the sync loop can
 * flush records straight to the server with no transformation.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://api.kzplusautocare.in/api'
    : 'http://localhost:5000/api');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
  joinDate: string;
  avatar: string;
  attendanceCode: string; // SHA-256 hex of the secret code
  photoRef: string;       // base64 reference photo (set on first check-in if empty)
}

export interface AttendanceRecord {
  id: string;                    // e.g. "ATT_2024-04-12_S001"
  staffId: string;
  staffName: string;
  date: string;                  // "YYYY-MM-DD"
  checkInTime: string;           // "HH:MM:SS"
  checkInTimestamp: number;      // Unix ms
  checkOutTime?: string;
  checkOutTimestamp?: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  capturedPhoto: string;         // base64 photo taken at check-in
  status: 'present' | 'absent' | 'late';
  synced: boolean;
}

// ---------------------------------------------------------------------------
// LocalStorage keys
// ---------------------------------------------------------------------------

const LS_STAFF_KEY = 'kzplus_staff_members';
const LS_ATTENDANCE_KEY = 'kzplus_attendance_records';
const LS_LAST_SYNC_KEY = 'kzplus_attendance_last_sync';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute SHA-256 hex digest of a string (browser WebCrypto). */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

function nowTimeString(): string {
  const d = new Date();
  return d.toTimeString().split(' ')[0]; // "HH:MM:SS"
}

// ---------------------------------------------------------------------------
// Staff member CRUD (LocalStorage)
// ---------------------------------------------------------------------------

export function getStaffMembers(): StaffMember[] {
  try {
    const raw = localStorage.getItem(LS_STAFF_KEY);
    return raw ? (JSON.parse(raw) as StaffMember[]) : [];
  } catch {
    return [];
  }
}

export function saveStaffMembers(members: StaffMember[]): void {
  localStorage.setItem(LS_STAFF_KEY, JSON.stringify(members));
}

/** Seed staff list from the bundled JSON if LocalStorage is empty. */
export async function initStaffFromJSON(): Promise<StaffMember[]> {
  const existing = getStaffMembers();
  if (existing.length > 0) return existing;

  try {
    const mod = await import('../data/staff.json');
    const members: StaffMember[] = mod.default.staff as StaffMember[];
    saveStaffMembers(members);
    return members;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Attendance CRUD (LocalStorage)
// ---------------------------------------------------------------------------

export function getAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(LS_ATTENDANCE_KEY);
    return raw ? (JSON.parse(raw) as AttendanceRecord[]) : [];
  } catch {
    return [];
  }
}

function saveAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(LS_ATTENDANCE_KEY, JSON.stringify(records));
}

export function getTodayAttendance(): AttendanceRecord[] {
  const today = todayString();
  return getAttendanceRecords().filter(r => r.date === today);
}

export function hasCheckedInToday(staffId: string): boolean {
  return getTodayAttendance().some(r => r.staffId === staffId);
}

// ---------------------------------------------------------------------------
// Mark attendance
// ---------------------------------------------------------------------------

export interface MarkAttendanceParams {
  staff: StaffMember;
  enteredCode: string;
  capturedPhoto: string; // base64 data URL
  location: { latitude: number; longitude: number; accuracy?: number };
}

export interface MarkAttendanceResult {
  success: boolean;
  message: string;
  record?: AttendanceRecord;
}

export async function markAttendance(
  params: MarkAttendanceParams
): Promise<MarkAttendanceResult> {
  const { staff, enteredCode, capturedPhoto, location } = params;

  // 1. Verify unique code
  const codeHash = await sha256(enteredCode.trim());
  if (codeHash !== staff.attendanceCode) {
    return { success: false, message: 'Invalid attendance code. Please try again.' };
  }

  // 2. Guard against duplicate check-in on the same day
  if (hasCheckedInToday(staff.id)) {
    return { success: false, message: `${staff.name} has already checked in today.` };
  }

  // 3. Determine status (after 10:00 AM is "late")
  const hour = new Date().getHours();
  const status: AttendanceRecord['status'] = hour >= 10 ? 'late' : 'present';

  // 4. Build record
  const record: AttendanceRecord = {
    id: `ATT_${todayString()}_${staff.id}`,
    staffId: staff.id,
    staffName: staff.name,
    date: todayString(),
    checkInTime: nowTimeString(),
    checkInTimestamp: Date.now(),
    location,
    capturedPhoto,
    status,
    synced: false,
  };

  // 5. Persist locally
  const records = getAttendanceRecords();
  records.push(record);
  saveAttendanceRecords(records);

  // 6. Store reference photo on first check-in if not already set
  const members = getStaffMembers();
  const idx = members.findIndex(m => m.id === staff.id);
  if (idx >= 0 && !members[idx].photoRef) {
    members[idx].photoRef = capturedPhoto;
    saveStaffMembers(members);
  }

  // 7. Try immediate background sync (non-blocking)
  syncAttendanceSingle(record).catch(() => { /* will retry at midnight */ });

  return { success: true, message: `Attendance marked for ${staff.name}!`, record };
}

// ---------------------------------------------------------------------------
// Sync with REST API
// ---------------------------------------------------------------------------

async function syncAttendanceSingle(record: AttendanceRecord): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/staff/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Mark synced
  const all = getAttendanceRecords();
  const updated = all.map(r => (r.id === record.id ? { ...r, synced: true } : r));
  saveAttendanceRecords(updated);
}

/** Push all unsynced records to the server, then clear yesterday's data. */
export async function syncAttendanceToServer(): Promise<{
  synced: number;
  failed: number;
}> {
  const records = getAttendanceRecords();
  const unsynced = records.filter(r => !r.synced);
  let synced = 0;
  let failed = 0;

  for (const record of unsynced) {
    try {
      await syncAttendanceSingle(record);
      synced++;
    } catch {
      failed++;
    }
  }

  // After sync, pull fresh staff list from server and replace LocalStorage
  try {
    const res = await fetch(`${API_BASE_URL}/staff`);
    if (res.ok) {
      const data = (await res.json()) as StaffMember[];
      saveStaffMembers(data);
    }
  } catch { /* ignore */ }

  // Remove previous day's records that have been synced
  const today = todayString();
  const cleaned = getAttendanceRecords().filter(r => r.date === today || !r.synced);
  saveAttendanceRecords(cleaned);

  localStorage.setItem(LS_LAST_SYNC_KEY, new Date().toISOString());
  return { synced, failed };
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(LS_LAST_SYNC_KEY);
}

// ---------------------------------------------------------------------------
// Midnight scheduler
// ---------------------------------------------------------------------------

let midnightTimer: ReturnType<typeof setTimeout> | null = null;

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 5, 0); // 00:00:05 next day
  return midnight.getTime() - now.getTime();
}

export function scheduleMidnightSync(): void {
  if (midnightTimer) clearTimeout(midnightTimer);

  const delay = msUntilMidnight();
  midnightTimer = setTimeout(async () => {
    await syncAttendanceToServer();
    scheduleMidnightSync(); // reschedule for next midnight
  }, delay);
}

export function cancelMidnightSync(): void {
  if (midnightTimer) {
    clearTimeout(midnightTimer);
    midnightTimer = null;
  }
}
