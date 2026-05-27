import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Save,
  X,
  Car,
  Phone,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  User,
  FileText,
  Shield,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ADMIN_EMAILS = [
  'catchprabhat@gmail.com',
  'umrsjd455@gmail.com',
  'umrsjd562@gmail.com',
];

const PLAN_OPTIONS: { months: 3 | 4 | 6 | 12; label: string; discount: string }[] = [
  { months: 3, label: '3 Months', discount: '' },
  { months: 4, label: '4 Months', discount: '5% off' },
  { months: 6, label: '6 Months', discount: '10% off' },
  { months: 12, label: '12 Months', discount: '15% off' },
];

const LS_KEY = 'kzplus_subscriptions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Subscription {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  vehicleNumber: string;
  vehicleType?: string;
  plan: 3 | 4 | 6 | 12;
  amount: number;
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
}

interface CustomerInfo {
  id?: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType?: string;
  email?: string;
}

type SearchType = 'phone' | 'vehicle';

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Subscription[]) : [];
  } catch {
    return [];
  }
}

function saveSubscriptions(subs: Subscription[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(subs));
}

function generateId(): string {
  return `SUB_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function isExpired(endDate: string): boolean {
  return new Date(endDate) < new Date(todayISO());
}

function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - new Date(todayISO()).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status, endDate }: { status: Subscription['status']; endDate: string }) {
  const expired = status === 'active' && isExpired(endDate);
  const effective = expired ? 'expired' : status;

  const map = {
    active: { icon: <CheckCircle className="w-3.5 h-3.5" />, cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Active' },
    expired: { icon: <XCircle className="w-3.5 h-3.5" />, cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Expired' },
    pending: { icon: <Clock className="w-3.5 h-3.5" />, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
    cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, cls: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', label: 'Cancelled' },
  };
  const { icon, cls, label } = map[effective as keyof typeof map] ?? map.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {icon} {label}
    </span>
  );
}

function FieldWrapper({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition';

const readonlyCls =
  'w-full rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-not-allowed select-none';

// ---------------------------------------------------------------------------
// Blank form
// ---------------------------------------------------------------------------

const blankForm = (): Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> => ({
  customerName: '',
  phone: '',
  vehicleNumber: '',
  vehicleType: '',
  plan: 3,
  amount: 0,
  startDate: todayISO(),
  endDate: addMonths(todayISO(), 3),
  status: 'active',
  notes: '',
  customerId: undefined,
  synced: false,
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? '');

  // Search
  const [searchType, setSearchType] = useState<SearchType>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);

  // Subscription list
  const [allSubs, setAllSubs] = useState<Subscription[]>([]);
  const [customerSubs, setCustomerSubs] = useState<Subscription[]>([]);

  // Form state
  const [formMode, setFormMode] = useState<'view' | 'create' | 'edit'>('view');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Confirm delete
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Load from LS on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setAllSubs(loadSubscriptions());
  }, []);

  // ---------------------------------------------------------------------------
  // Filter subs by customer whenever customer or allSubs changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!customer) {
      setCustomerSubs([]);
      return;
    }
    const filtered = allSubs.filter(
      s =>
        (customer.phone && s.phone === customer.phone) ||
        (customer.vehicleNumber && s.vehicleNumber.toLowerCase() === customer.vehicleNumber.toLowerCase())
    );
    setCustomerSubs(filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [customer, allSubs]);

  // ---------------------------------------------------------------------------
  // Auto-calculate end date when plan or start date changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (formMode !== 'view') {
      setForm(f => ({ ...f, endDate: addMonths(f.startDate, f.plan) }));
    }
  }, [form.startDate, form.plan, formMode]);

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------
  const handleSearch = useCallback(async () => {
    const val = searchValue.trim();
    if (!val) {
      setSearchError('Please enter a value to search.');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    setCustomer(null);
    setFormMode('view');

    try {
      let result: any;
      if (searchType === 'phone') {
        const phone = val.startsWith('+91') ? val : '+91' + val.replace(/\D/g, '');
        result = await apiService.searchUserByPhone(phone);
      } else {
        result = await apiService.searchVehicleByNumber(val.toUpperCase());
      }

      if (result) {
        const info: CustomerInfo = {
          id: result.id ?? result.userId,
          name: result.ownerName ?? result.name ?? 'N/A',
          phone: result.ownerPhone ?? result.phone ?? '',
          vehicleNumber: result.vehicleNumber ?? result.vehicle_number ?? '',
          vehicleType: result.vehicleType ?? result.vehicle_type ?? '',
          email: result.ownerEmail ?? result.email ?? '',
        };
        setCustomer(info);
      } else {
        setSearchError('No customer found. Try a different search term.');
      }
    } catch {
      setSearchError('Search failed. Please check your connection and try again.');
    } finally {
      setSearchLoading(false);
    }
  }, [searchValue, searchType]);

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------
  const openCreate = () => {
    if (!customer) return;
    setForm({
      ...blankForm(),
      customerName: customer.name,
      phone: customer.phone,
      vehicleNumber: customer.vehicleNumber,
      vehicleType: customer.vehicleType ?? '',
      customerId: customer.id,
    });
    setEditingId(null);
    setFormMode('create');
    setFormError('');
  };

  const openEdit = (sub: Subscription) => {
    setForm({
      customerName: sub.customerName,
      phone: sub.phone,
      vehicleNumber: sub.vehicleNumber,
      vehicleType: sub.vehicleType ?? '',
      plan: sub.plan,
      amount: sub.amount,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      notes: sub.notes ?? '',
      customerId: sub.customerId,
      synced: sub.synced,
    });
    setEditingId(sub.id);
    setFormMode('edit');
    setFormError('');
  };

  const cancelForm = () => {
    setFormMode('view');
    setEditingId(null);
    setFormError('');
  };

  const handleSave = async () => {
    if (!form.customerName.trim()) { setFormError('Customer name is required.'); return; }
    if (!form.phone.trim()) { setFormError('Phone number is required.'); return; }
    if (!form.vehicleNumber.trim()) { setFormError('Vehicle number is required.'); return; }
    if (form.amount <= 0) { setFormError('Amount must be greater than 0.'); return; }
    if (!form.startDate) { setFormError('Start date is required.'); return; }
    if (!form.endDate) { setFormError('End date is required.'); return; }
    if (form.endDate <= form.startDate) { setFormError('End date must be after start date.'); return; }

    setSaving(true);
    setFormError('');

    const now = new Date().toISOString();
    let updated: Subscription[];

    if (formMode === 'create') {
      const newSub: Subscription = {
        id: generateId(),
        ...form,
        createdAt: now,
        updatedAt: now,
        synced: false,
      };
      updated = [newSub, ...allSubs];
    } else {
      updated = allSubs.map(s =>
        s.id === editingId ? { ...s, ...form, updatedAt: now, synced: false } : s
      );
    }

    saveSubscriptions(updated);
    setAllSubs(updated);
    setSaving(false);
    setSaved(true);
    setFormMode('view');
    setEditingId(null);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = allSubs.filter(s => s.id !== id);
    saveSubscriptions(updated);
    setAllSubs(updated);
    setDeleteConfirmId(null);
  };

  const f = (key: keyof typeof form, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto px-3 py-6 space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Subscription Manager</h1>
              <p className="text-purple-200 text-sm">KZ Plus Auto Care</p>
            </div>
          </div>
          {isAdmin && (
            <span className="flex items-center gap-1.5 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">
              <Shield className="w-3.5 h-3.5" /> Admin Mode
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search section                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-600" /> Find Customer
        </h2>

        {/* Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-dark-600 mb-4">
          {(['phone', 'vehicle'] as SearchType[]).map(t => (
            <button
              key={t}
              onClick={() => { setSearchType(t); setSearchValue(''); setSearchError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors
                ${searchType === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-50 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
                }`}
            >
              {t === 'phone' ? <Phone className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              {t === 'phone' ? 'Phone Number' : 'Vehicle Number'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            {searchType === 'phone' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400 pointer-events-none">
                +91
              </span>
            )}
            <input
              type="text"
              placeholder={searchType === 'phone' ? '10-digit number' : 'e.g. KA01AB1234'}
              value={searchValue}
              onChange={e => {
                const v = e.target.value;
                setSearchValue(searchType === 'phone' ? v.replace(/\D/g, '').slice(0, 10) : v.toUpperCase());
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className={`${inputCls} ${searchType === 'phone' ? 'pl-10' : ''}`}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {searchError && (
          <div className="mt-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {searchError}
          </div>
        )}

        {/* Customer info card */}
        {customer && (
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white">{customer.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                {customer.vehicleNumber && (
                  <span className="flex items-center gap-1"><Car className="w-3 h-3" />{customer.vehicleNumber}</span>
                )}
                {customer.vehicleType && <span className="text-xs text-purple-600 dark:text-purple-400">{customer.vehicleType}</span>}
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded-lg font-medium flex-shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" /> New
              </button>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Subscription form (create / edit)                                   */}
      {/* ------------------------------------------------------------------ */}
      {(formMode === 'create' || formMode === 'edit') && isAdmin && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-purple-200 dark:border-purple-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {formMode === 'create'
                ? <><Plus className="w-5 h-5 text-purple-600" /> New Subscription</>
                : <><Edit2 className="w-5 h-5 text-purple-600" /> Edit Subscription</>
              }
            </h2>
            <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <FieldWrapper label="Customer Name" icon={<User className="w-3.5 h-3.5" />}>
              <input
                className={inputCls}
                value={form.customerName}
                onChange={e => f('customerName', e.target.value)}
                placeholder="Full name"
              />
            </FieldWrapper>

            {/* Phone */}
            <FieldWrapper label="Phone Number" icon={<Phone className="w-3.5 h-3.5" />}>
              <input
                className={inputCls}
                value={form.phone}
                onChange={e => f('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </FieldWrapper>

            {/* Vehicle Number */}
            <FieldWrapper label="Vehicle Number" icon={<Car className="w-3.5 h-3.5" />}>
              <input
                className={inputCls}
                value={form.vehicleNumber}
                onChange={e => f('vehicleNumber', e.target.value.toUpperCase())}
                placeholder="KA01AB1234"
              />
            </FieldWrapper>

            {/* Vehicle Type */}
            <FieldWrapper label="Vehicle Type" icon={<Car className="w-3.5 h-3.5" />}>
              <input
                className={inputCls}
                value={form.vehicleType ?? ''}
                onChange={e => f('vehicleType', e.target.value)}
                placeholder="e.g. SUV, Sedan, Hatchback"
              />
            </FieldWrapper>

            {/* Plan */}
            <FieldWrapper label="Subscription Plan" icon={<Calendar className="w-3.5 h-3.5" />}>
              <div className="grid grid-cols-4 gap-1.5">
                {PLAN_OPTIONS.map(opt => (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => f('plan', opt.months)}
                    className={`py-2 rounded-xl text-xs font-semibold border-2 flex flex-col items-center gap-0.5 transition-colors
                      ${form.plan === opt.months
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                      }`}
                  >
                    {opt.months}
                    <span className="text-[10px] opacity-80">mo</span>
                    {opt.discount && (
                      <span className={`text-[9px] font-bold ${form.plan === opt.months ? 'text-purple-200' : 'text-green-600'}`}>
                        {opt.discount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </FieldWrapper>

            {/* Amount */}
            <FieldWrapper label="Amount Paid (₹)" icon={<IndianRupee className="w-3.5 h-3.5" />}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  className={`${inputCls} pl-7`}
                  value={form.amount || ''}
                  onChange={e => f('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </FieldWrapper>

            {/* Start Date */}
            <FieldWrapper label="Start Date" icon={<Calendar className="w-3.5 h-3.5" />}>
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={e => f('startDate', e.target.value)}
              />
            </FieldWrapper>

            {/* End Date */}
            <FieldWrapper label="End Date" icon={<Calendar className="w-3.5 h-3.5" />}>
              <input
                type="date"
                className={inputCls}
                value={form.endDate}
                min={form.startDate}
                onChange={e => f('endDate', e.target.value)}
              />
            </FieldWrapper>

            {/* Status */}
            <FieldWrapper label="Status" icon={<CheckCircle className="w-3.5 h-3.5" />}>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-8`}
                  value={form.status}
                  onChange={e => f('status', e.target.value as Subscription['status'])}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </FieldWrapper>

            {/* Notes */}
            <FieldWrapper label="Notes (optional)" icon={<FileText className="w-3.5 h-3.5" />}>
              <input
                className={inputCls}
                value={form.notes ?? ''}
                onChange={e => f('notes', e.target.value)}
                placeholder="Any remarks…"
              />
            </FieldWrapper>
          </div>

          {formError && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {saving
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Subscription</>}
            </button>
            <button
              onClick={cancelForm}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success toast */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium z-50 animate-bounce-once">
          <CheckCircle className="w-5 h-5" /> Subscription saved successfully!
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Subscription list for the found customer                            */}
      {/* ------------------------------------------------------------------ */}
      {customer && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Subscriptions for {customer.name}
              <span className="ml-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                {customerSubs.length}
              </span>
            </h2>
          </div>

          {customerSubs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No subscriptions found for this customer.</p>
              {isAdmin && (
                <button onClick={openCreate} className="mt-3 text-purple-600 text-sm font-medium hover:underline">
                  + Add first subscription
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-dark-700">
              {customerSubs.map(sub => {
                const days = daysRemaining(sub.endDate);
                const isEditing = editingId === sub.id && formMode === 'edit';

                return (
                  <li key={sub.id} className={`px-5 py-4 ${isEditing ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {sub.plan}-Month Plan
                        </span>
                        <StatusBadge status={sub.status} endDate={sub.endDate} />
                        {sub.status === 'active' && !isExpired(sub.endDate) && days <= 7 && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            ⚠ {days}d left
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => openEdit(sub)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {deleteConfirmId === sub.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs text-gray-500 px-2 py-1 rounded-lg border border-gray-200 dark:border-dark-600"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(sub.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-2.5 text-center">
                        <div className="text-xs text-gray-400 mb-0.5">Amount</div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                          ₹{sub.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-2.5 text-center">
                        <div className="text-xs text-gray-400 mb-0.5">Start</div>
                        <div className="font-medium text-gray-900 dark:text-white text-xs">{sub.startDate}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-2.5 text-center">
                        <div className="text-xs text-gray-400 mb-0.5">End</div>
                        <div className="font-medium text-gray-900 dark:text-white text-xs">{sub.endDate}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-2.5 text-center">
                        <div className="text-xs text-gray-400 mb-0.5">Vehicle</div>
                        <div className="font-medium text-gray-900 dark:text-white text-xs truncate">{sub.vehicleNumber}</div>
                      </div>
                    </div>

                    {/* Read-only fields for non-admin */}
                    {!isAdmin && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <FieldWrapper label="Customer Name" icon={<User className="w-3.5 h-3.5" />}>
                          <div className={readonlyCls}>{sub.customerName}</div>
                        </FieldWrapper>
                        <FieldWrapper label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
                          <div className={readonlyCls}>{sub.phone}</div>
                        </FieldWrapper>
                        {sub.notes && (
                          <FieldWrapper label="Notes" icon={<FileText className="w-3.5 h-3.5" />}>
                            <div className={`${readonlyCls} col-span-2`}>{sub.notes}</div>
                          </FieldWrapper>
                        )}
                      </div>
                    )}

                    {/* Notes (admin view) */}
                    {isAdmin && sub.notes && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">{sub.notes}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* All subscriptions (admin overview, shown when no customer selected) */}
      {/* ------------------------------------------------------------------ */}
      {!customer && isAdmin && allSubs.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" /> All Subscriptions
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                {allSubs.length}
              </span>
            </h2>
          </div>
          <ul className="divide-y divide-gray-50 dark:divide-dark-700">
            {allSubs.slice(0, 20).map(sub => (
              <li key={sub.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-xs flex-shrink-0">
                  {sub.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{sub.customerName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {sub.vehicleNumber} · {sub.plan}mo · ₹{sub.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={sub.status} endDate={sub.endDate} />
                  <button
                    onClick={() => { setCustomer({ name: sub.customerName, phone: sub.phone, vehicleNumber: sub.vehicleNumber, vehicleType: sub.vehicleType, id: sub.customerId }); openEdit(sub); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {allSubs.length > 20 && (
            <div className="px-5 py-3 text-center text-sm text-gray-400">
              +{allSubs.length - 20} more — search a customer to see their subscriptions
            </div>
          )}
        </div>
      )}

      {/* Empty state when no customer searched */}
      {!customer && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Search by phone or vehicle number to view subscriptions.</p>
        </div>
      )}
    </div>
  );
};
