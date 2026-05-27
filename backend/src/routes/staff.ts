/**
 * Staff Attendance Routes
 *
 * GET  /api/staff          - list all staff members
 * POST /api/staff          - create / upsert a staff member (admin)
 * GET  /api/staff/attendance          - get attendance records (optional ?date=YYYY-MM-DD)
 * POST /api/staff/attendance          - record a single attendance check-in (from device sync)
 * POST /api/staff/attendance/bulk     - bulk-sync multiple records (midnight sync)
 *
 * The route also serves the staff.json seed file so the frontend can
 * pull the canonical staff list via REST instead of bundled JSON.
 */

import express, { Request, Response, Router } from 'express';
import crypto from 'crypto';

const router: Router = express.Router();

// ---------------------------------------------------------------------------
// In-memory store (mirrors localStorage JSON structure on the server side).
// In production this would be replaced by proper DB calls via `sql`.
// ---------------------------------------------------------------------------

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
  joinDate: string;
  avatar: string;
  attendanceCode: string; // SHA-256 hash of the secret code
  photoRef: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkInTime: string;
  checkInTimestamp: number;
  checkOutTime?: string;
  checkOutTimestamp?: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  capturedPhoto: string;
  status: 'present' | 'absent' | 'late';
  synced: boolean;
}

// Seed data - same as src/data/staff.json
const staffStore: StaffMember[] = [
  {
    id: 'S001',
    name: 'Ravi Kumar',
    role: 'Senior Technician',
    phone: '9876543210',
    email: 'ravi.kumar@kzplus.in',
    department: 'Service',
    joinDate: '2022-01-15',
    avatar: 'RK',
    attendanceCode: '5e884898da28047151d0e56f8dc6292773603d0d21991614e5e8d',
    photoRef: '',
  },
  {
    id: 'S002',
    name: 'Meena Sharma',
    role: 'Front Desk Executive',
    phone: '9876543211',
    email: 'meena.sharma@kzplus.in',
    department: 'Operations',
    joinDate: '2022-03-20',
    avatar: 'MS',
    attendanceCode: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    photoRef: '',
  },
  {
    id: 'S003',
    name: 'Arjun Patel',
    role: 'Driver',
    phone: '9876543212',
    email: 'arjun.patel@kzplus.in',
    department: 'Transport',
    joinDate: '2021-11-10',
    avatar: 'AP',
    attendanceCode: 'ef92b778bafe771207c92e5f6e450c9df33d2c4c52ac3c74a77a75cc16f2f',
    photoRef: '',
  },
  {
    id: 'S004',
    name: 'Sunita Nair',
    role: 'Detailing Specialist',
    phone: '9876543213',
    email: 'sunita.nair@kzplus.in',
    department: 'Service',
    joinDate: '2023-02-01',
    avatar: 'SN',
    attendanceCode: 'b14a7b8059d9c055954c92674ce60032e98f8c1564de5f57c98c99',
    photoRef: '',
  },
  {
    id: 'S005',
    name: 'Rahul Verma',
    role: 'Mechanic',
    phone: '9876543214',
    email: 'rahul.verma@kzplus.in',
    department: 'Service',
    joinDate: '2022-07-18',
    avatar: 'RV',
    attendanceCode: '4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e52',
    photoRef: '',
  },
  {
    id: 'S006',
    name: 'Priya Reddy',
    role: 'Customer Relations',
    phone: '9876543215',
    email: 'priya.reddy@kzplus.in',
    department: 'Operations',
    joinDate: '2023-05-10',
    avatar: 'PR',
    attendanceCode: '1ba3d16e9881bb0c5ac0826ccbd8f87a0a3da5a11a3e9da39ae6e1',
    photoRef: '',
  },
];

// In-memory attendance log. Each entry is unique by (staffId + date).
const attendanceStore: AttendanceRecord[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function isDuplicate(staffId: string, date: string): boolean {
  return attendanceStore.some(r => r.staffId === staffId && r.date === date);
}

function sanitizeRecord(raw: Partial<AttendanceRecord>): AttendanceRecord | null {
  if (
    typeof raw.id !== 'string' ||
    typeof raw.staffId !== 'string' ||
    typeof raw.staffName !== 'string' ||
    typeof raw.date !== 'string' ||
    typeof raw.checkInTime !== 'string' ||
    typeof raw.checkInTimestamp !== 'number' ||
    typeof raw.location?.latitude !== 'number' ||
    typeof raw.location?.longitude !== 'number'
  ) {
    return null;
  }

  return {
    id: raw.id,
    staffId: raw.staffId,
    staffName: raw.staffName,
    date: raw.date,
    checkInTime: raw.checkInTime,
    checkInTimestamp: raw.checkInTimestamp,
    checkOutTime: raw.checkOutTime,
    checkOutTimestamp: raw.checkOutTimestamp,
    location: {
      latitude: raw.location.latitude,
      longitude: raw.location.longitude,
      accuracy: raw.location.accuracy,
    },
    capturedPhoto: typeof raw.capturedPhoto === 'string' ? raw.capturedPhoto : '',
    status: ['present', 'absent', 'late'].includes(raw.status ?? '')
      ? (raw.status as AttendanceRecord['status'])
      : 'present',
    synced: true,
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET /api/staff - list all staff (code hash, no plain codes) */
router.get('/', (_req: Request, res: Response) => {
  // Never expose attendanceCode in list endpoint
  const safe = staffStore.map(({ attendanceCode: _c, ...rest }) => rest);
  res.json(safe);
});

/** POST /api/staff - upsert a staff member */
router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<StaffMember> & { plainCode?: string };

  if (!body.id || !body.name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  const idx = staffStore.findIndex(m => m.id === body.id);
  const member: StaffMember = {
    id: body.id,
    name: body.name,
    role: body.role ?? '',
    phone: body.phone ?? '',
    email: body.email ?? '',
    department: body.department ?? '',
    joinDate: body.joinDate ?? todayISO(),
    avatar: body.avatar ?? body.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    attendanceCode: body.plainCode ? sha256(body.plainCode) : (body.attendanceCode ?? ''),
    photoRef: body.photoRef ?? '',
  };

  if (idx >= 0) {
    staffStore[idx] = member;
  } else {
    staffStore.push(member);
  }

  const { attendanceCode: _c, ...safe } = member;
  res.status(201).json(safe);
});

/** GET /api/staff/attendance?date=YYYY-MM-DD */
router.get('/attendance', (req: Request, res: Response) => {
  const date = (req.query.date as string) ?? todayISO();
  const records = attendanceStore.filter(r => r.date === date);
  // Strip captured photos from list response to reduce payload
  const light = records.map(({ capturedPhoto: _p, ...r }) => r);
  res.json(light);
});

/** POST /api/staff/attendance - record a single check-in */
router.post('/attendance', (req: Request, res: Response) => {
  const record = sanitizeRecord(req.body as Partial<AttendanceRecord>);
  if (!record) {
    return res.status(400).json({ error: 'Invalid attendance record payload' });
  }

  // Idempotent: if record with this id already exists, ignore silently
  if (attendanceStore.some(r => r.id === record.id)) {
    return res.status(200).json({ message: 'Already recorded', record });
  }

  // Prevent double check-in for the same staff+date via server too
  if (isDuplicate(record.staffId, record.date)) {
    return res.status(409).json({ error: 'Attendance already recorded for this staff today' });
  }

  attendanceStore.push(record);
  res.status(201).json({ message: 'Attendance recorded', record });
});

/** POST /api/staff/attendance/bulk - batch sync from device midnight job */
router.post('/attendance/bulk', (req: Request, res: Response) => {
  const body = req.body as { records: Partial<AttendanceRecord>[] };
  if (!Array.isArray(body.records)) {
    return res.status(400).json({ error: '`records` array is required' });
  }

  let saved = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const raw of body.records) {
    const record = sanitizeRecord(raw);
    if (!record) {
      errors.push(`Invalid record: ${JSON.stringify(raw).slice(0, 60)}`);
      skipped++;
      continue;
    }

    if (attendanceStore.some(r => r.id === record.id)) {
      skipped++;
      continue;
    }

    attendanceStore.push(record);
    saved++;
  }

  res.status(200).json({ saved, skipped, errors });
});

export default router;
