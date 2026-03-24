import React, { useMemo, useState } from 'react';
import { CheckCircle2, ShieldAlert, Ticket, ScanLine } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const STAFF_KEY_STORAGE = 'diwaliBall.staff.key';

function extractToken(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const token = parsed.searchParams.get('token');
    if (token) return token;
  } catch {
    // Raw token was entered directly.
  }

  return raw;
}

export default function StaffScanner() {
  const [staffKey, setStaffKey] = useState(() => window.localStorage.getItem(STAFF_KEY_STORAGE) || '');
  const [scanInput, setScanInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const token = useMemo(() => extractToken(scanInput), [scanInput]);

  const persistStaffKey = (value) => {
    setStaffKey(value);
    window.localStorage.setItem(STAFF_KEY_STORAGE, value);
  };

  const handleVerify = async () => {
    if (!token) {
      setError('Paste a ticket token or verify URL first.');
      return;
    }

    setError('');
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/verify?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      setResult(data);
    } catch {
      setError('Failed to verify ticket. Check API availability.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!token) {
      setError('Paste a ticket token or verify URL first.');
      return;
    }
    if (!staffKey) {
      setError('Enter staff key first.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-staff-key': staffKey,
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      setResult(data);
      if (!response.ok) {
        setError(data.message || 'Check-in failed.');
      }
    } catch {
      setError('Failed to check in ticket. Check API availability.');
    } finally {
      setIsLoading(false);
    }
  };

  const status = result?.status;

  return (
    <section className="min-h-screen bg-[var(--color-bg-dark)] text-white px-4 py-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass rounded-3xl p-8 border border-white/10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Staff Ticket Scanner</h1>
          <p className="text-gray-400 text-sm">
            Paste a scanned QR verify URL (or token), verify ticket state, then check-in.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 space-y-5">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Staff Key</span>
            <input
              type="password"
              value={staffKey}
              onChange={(e) => persistStaffKey(e.target.value)}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--color-brand-500)]"
              placeholder="Enter STAFF_API_KEY"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Ticket URL or Token</span>
            <textarea
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 focus:outline-none focus:border-[var(--color-brand-500)]"
              placeholder="Paste scanned QR value (https://.../api/tickets/verify?token=...)"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition inline-flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4" /> Verify
            </button>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-[var(--color-brand-500)] text-black font-bold hover:brightness-110 transition inline-flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Check In
            </button>
          </div>
        </div>

        {(error || result) && (
          <div className="glass rounded-3xl p-8 border border-white/10 space-y-3">
            {error && (
              <p className="text-red-300 text-sm inline-flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {error}
              </p>
            )}
            {result && (
              <>
                <p className="text-sm uppercase tracking-widest text-gray-400">Status</p>
                <p className="text-2xl font-black inline-flex items-center gap-2">
                  <Ticket className="w-6 h-6" />
                  {status}
                </p>
                {result.ticket && (
                  <div className="text-sm text-gray-200 space-y-1">
                    <p>Name: {result.ticket.name}</p>
                    <p>Ticket ID: {result.ticket.ticketId}</p>
                    <p>Table: {result.ticket.tableId}</p>
                    <p>Type: {result.ticket.ticketType}</p>
                    {result.ticket.checkedInAt && <p>Checked In: {result.ticket.checkedInAt}</p>}
                  </div>
                )}
                {result.message && <p className="text-sm text-gray-400">{result.message}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

