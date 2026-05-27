import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Users,
  RefreshCw,
  Shield,
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Calendar,
  LogOut,
} from 'lucide-react';
import {
  StaffMember,
  AttendanceRecord,
  initStaffFromJSON,
  getTodayAttendance,
  markAttendance,
  syncAttendanceToServer,
  scheduleMidnightSync,
  cancelMidnightSync,
  getLastSyncTime,
  hasCheckedInToday,
} from '../services/staffApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 'select' | 'verify' | 'success';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  loading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function statusBadge(status: AttendanceRecord['status']) {
  if (status === 'present')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3" /> Present
      </span>
    );
  if (status === 'late')
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Clock className="w-3 h-3" /> Late
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="w-3 h-3" /> Absent
    </span>
  );
}

// ---------------------------------------------------------------------------
// Camera hook
// ---------------------------------------------------------------------------

function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setActive(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Camera not accessible';
      setError(`Camera error: ${msg}`);
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const capture = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCaptured(dataUrl);
    stop();
    return dataUrl;
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setCaptured(null);
    setError(null);
  }, [stop]);

  useEffect(() => () => { stop(); }, [stop]);

  return { videoRef, canvasRef, active, error, captured, start, capture, reset };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StaffAttendance() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [step, setStep] = useState<Step>('select');
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<AttendanceRecord | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const camera = useCamera();
  const [location, setLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    loading: false,
    error: null,
  });

  // ----- init -----
  useEffect(() => {
    initStaffFromJSON().then(members => {
      setStaff(members);
      setTodayRecords(getTodayAttendance());
    });
    setLastSync(getLastSyncTime());
    scheduleMidnightSync();
    return () => cancelMidnightSync();
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ----- location -----
  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(l => ({ ...l, error: 'Geolocation not supported by this browser.' }));
      return;
    }
    setLocation(l => ({ ...l, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      err => {
        setLocation(l => ({ ...l, loading: false, error: `Location error: ${err.message}` }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ----- step: select -----
  const handleSelectStaff = (member: StaffMember) => {
    setSelected(member);
    setCode('');
    setError(null);
    camera.reset();
    setLocation({ latitude: 0, longitude: 0, loading: false, error: null });
    setStep('verify');
    // Auto-start camera and location fetch
    setTimeout(() => {
      camera.start();
      fetchLocation();
    }, 300);
  };

  // ----- step: verify → submit -----
  const handleSubmit = async () => {
    if (!selected) return;
    if (!camera.captured) {
      setError('Please capture your photo first.');
      return;
    }
    if (!code.trim()) {
      setError('Please enter your unique attendance code.');
      return;
    }
    if (location.latitude === 0 && location.longitude === 0) {
      setError('Location not captured. Please allow location access and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await markAttendance({
      staff: selected,
      enteredCode: code,
      capturedPhoto: camera.captured,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
    });

    setLoading(false);

    if (result.success && result.record) {
      setSuccessRecord(result.record);
      setTodayRecords(getTodayAttendance());
      setStep('success');
    } else {
      setError(result.message);
    }
  };

  // ----- manual sync -----
  const handleManualSync = async () => {
    setSyncing(true);
    await syncAttendanceToServer();
    setLastSync(getLastSyncTime());
    setSyncing(false);
  };

  // ----- reset flow -----
  const resetFlow = () => {
    setStep('select');
    setSelected(null);
    setCode('');
    setError(null);
    setSuccessRecord(null);
    camera.reset();
    setTodayRecords(getTodayAttendance());
  };

  // ----- filtered staff -----
  const filteredStaff = staff.filter(
    m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------------------------------------------------------
  // Render: header bar
  // ---------------------------------------------------------------------------
  const Header = () => (
    <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-5 mb-6 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Staff Attendance</h1>
            <p className="text-blue-200 text-sm">KZ Plus Auto Care</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Calendar className="w-4 h-4" />
            <span>{formatDate()}</span>
          </div>
          <div className="flex items-center gap-2 text-2xl font-mono font-bold">
            <Clock className="w-5 h-5 text-blue-300" />
            {currentTime.toLocaleTimeString('en-IN')}
          </div>
        </div>
      </div>

      {/* Today summary */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">{todayRecords.length}</div>
          <div className="text-xs text-blue-200">Checked In</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">
            {todayRecords.filter(r => r.status === 'present').length}
          </div>
          <div className="text-xs text-blue-200">On Time</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">
            {todayRecords.filter(r => r.status === 'late').length}
          </div>
          <div className="text-xs text-blue-200">Late</div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render: step — select staff
  // ---------------------------------------------------------------------------
  if (step === 'select') {
    return (
      <div className="max-w-2xl mx-auto px-2 py-4">
        <Header />

        {/* Sync bar */}
        <div className="flex items-center justify-between bg-white dark:bg-dark-800 rounded-xl px-4 py-2.5 mb-5 shadow-sm border border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {syncing ? <Wifi className="w-4 h-4 text-blue-500 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
            {lastSync
              ? `Last synced: ${new Date(lastSync).toLocaleString('en-IN')}`
              : 'Not yet synced'}
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search staff by name, role or department…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Staff list */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Select Your Name</h2>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400">
              <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No staff found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-dark-700">
              {filteredStaff.map(member => {
                const alreadyIn = hasCheckedInToday(member.id);
                return (
                  <li key={member.id}>
                    <button
                      onClick={() => !alreadyIn && handleSelectStaff(member)}
                      disabled={alreadyIn}
                      className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors
                        ${alreadyIn
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-dark-700'
                          : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100'
                        }`}
                    >
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                        ${alreadyIn ? 'bg-green-500' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                        {alreadyIn ? <CheckCircle className="w-5 h-5" /> : member.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.role} · {member.department}</div>
                      </div>

                      {/* Badge or arrow */}
                      {alreadyIn ? (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium flex-shrink-0">
                          Checked In ✓
                        </span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Today's records */}
        {todayRecords.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Today's Attendance</h2>
            </div>
            <ul className="divide-y divide-gray-50 dark:divide-dark-700">
              {todayRecords.map(r => (
                <li key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-xs flex-shrink-0">
                    {r.staffName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{r.staffName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(r.checkInTimestamp)} · {r.location.latitude.toFixed(4)}, {r.location.longitude.toFixed(4)}
                    </div>
                  </div>
                  <div className="flex-shrink-0">{statusBadge(r.status)}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: step — verify identity
  // ---------------------------------------------------------------------------
  if (step === 'verify' && selected) {
    return (
      <div className="max-w-lg mx-auto px-2 py-4">
        {/* Back button */}
        <button
          onClick={resetFlow}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <LogOut className="w-4 h-4 rotate-180" /> Back to staff list
        </button>

        {/* Staff info card */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              {selected.avatar}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selected.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selected.role} · {selected.department}</p>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                <Clock className="w-3 h-3" />
                {currentTime.toLocaleTimeString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-5">
          {(['Photo', 'Location', 'Code'] as const).map((label, i) => {
            const done = [
              !!camera.captured,
              location.latitude !== 0,
              code.trim().length > 0,
            ][i];
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5 flex-1 rounded-xl px-3 py-2 text-xs font-medium
                  ${done ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-dark-700 dark:text-gray-400'}`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
                  {label}
                </div>
                {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* 1. Camera */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Step 1 — Take Photo</h3>
          </div>

          {camera.error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {camera.error}
            </div>
          )}

          {camera.captured ? (
            <div className="relative">
              <img
                src={camera.captured}
                alt="Captured"
                className="w-full rounded-xl object-cover max-h-64"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => { camera.reset(); camera.start(); }}
                  className="bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg"
                >
                  Retake
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Photo captured
              </div>
            </div>
          ) : camera.active ? (
            <div className="relative">
              <video
                ref={camera.videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-xl object-cover max-h-64 bg-black"
              />
              {/* Guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-48 border-4 border-white/60 rounded-full opacity-60" />
              </div>
              <button
                onClick={camera.capture}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-500 hover:border-blue-700 transition-colors"
              >
                <Camera className="w-6 h-6 text-blue-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={camera.start}
              className="w-full py-10 flex flex-col items-center gap-2 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-dashed border-gray-200 dark:border-dark-600 transition-colors"
            >
              <Camera className="w-10 h-10 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Tap to open camera</span>
            </button>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={camera.canvasRef} className="hidden" />
        </div>

        {/* 2. Location */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Step 2 — Location</h3>
            </div>
            <button
              onClick={fetchLocation}
              disabled={location.loading}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${location.loading ? 'animate-spin' : ''}`} />
              {location.loading ? 'Fetching…' : 'Refresh'}
            </button>
          </div>

          {location.error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {location.error}
            </div>
          )}

          {location.latitude !== 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                {location.accuracy && (
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </div>
                )}
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
            </div>
          ) : location.loading ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-center gap-2 text-sm text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Fetching your location…
            </div>
          ) : (
            <button
              onClick={fetchLocation}
              className="w-full py-8 flex flex-col items-center gap-2 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-dashed border-gray-200 dark:border-dark-600 transition-colors"
            >
              <MapPin className="w-9 h-9 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Tap to capture location</span>
            </button>
          )}
        </div>

        {/* 3. Code */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Step 3 — Attendance Code</h3>
          </div>

          <div className="relative">
            <input
              type={showCode ? 'text' : 'password'}
              placeholder="Enter your unique code"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              className="w-full border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowCode(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-4 flex items-start gap-2 text-sm">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-200 dark:shadow-none transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Mark Attendance
            </>
          )}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: step — success
  // ---------------------------------------------------------------------------
  if (step === 'success' && successRecord) {
    return (
      <div className="max-w-lg mx-auto px-2 py-8 text-center">
        {/* Success animation */}
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 dark:shadow-none">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Attendance Marked!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Check-in successfully recorded for today.
        </p>

        {/* Details card */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-5 text-left mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold">
              {selected?.avatar}
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{successRecord.staffName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{selected?.role}</div>
            </div>
            <div className="ml-auto">{statusBadge(successRecord.status)}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-dark-700">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Date</div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{successRecord.date}</div>
            </div>
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Check-in Time</div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{successRecord.checkInTime}</div>
            </div>
            <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3 col-span-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Location</div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm font-mono">
                {successRecord.location.latitude.toFixed(6)}, {successRecord.location.longitude.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Captured photo thumbnail */}
          {successRecord.capturedPhoto && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Captured Photo</div>
              <img
                src={successRecord.capturedPhoto}
                alt="Check-in photo"
                className="w-full max-h-40 object-cover rounded-xl"
              />
            </div>
          )}
        </div>

        <button
          onClick={resetFlow}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-200 dark:shadow-none transition-colors"
        >
          Back to Staff List
        </button>
      </div>
    );
  }

  return null;
}
