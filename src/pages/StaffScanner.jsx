import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Search,
  Flashlight,
  FlashlightOff,
  KeyRound,
  ScanLine,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const STAFF_KEY_STORAGE = 'diwaliBall.staff.key';
const QR_READER_ID = 'qr-reader-element';

// ─── Audio ─────────────────────────────────────────────────────────────────
function playChime(type = 'success') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const config = {
      success: {
        notes: [{ f: 523.25, t: 0 }, { f: 659.25, t: 0.12 }, { f: 783.99, t: 0.24 }],
        type: 'sine',
      },
      warning: { notes: [{ f: 440, t: 0 }, { f: 370, t: 0.18 }], type: 'triangle' },
      error:   { notes: [{ f: 220, t: 0 }, { f: 196, t: 0.2 }],  type: 'triangle' },
    };
    const { notes, type: waveType } = config[type] ?? config.error;
    notes.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = waveType;
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.35);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.4);
    });
  } catch { /* unsupported */ }
}

function vibrate(pattern) {
  try { navigator?.vibrate?.(pattern); } catch { /* unsupported */ }
}

// ─── Token extraction ───────────────────────────────────────────────────────
function extractToken(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  try {
    const url = new URL(s);
    const t = url.searchParams.get('token');
    if (t) return t;
  } catch { /* raw token */ }
  return s;
}

// ─── Result card ────────────────────────────────────────────────────────────
function ResultCard({ glow, children }) {
  const glowMap = {
    green: 'border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)]',
    amber: 'border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    red:   'border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.15)]',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`backdrop-blur-2xl bg-black/50 rounded-3xl p-6 border ${glowMap[glow]}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Staff key gate ──────────────────────────────────────────────────────────
function StaffKeyGate({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) { setError('Please enter the staff key.'); return; }
    onUnlock(value.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand-500)]/5 rounded-full blur-[120px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm w-full relative z-10"
      >
        <div className="backdrop-blur-3xl bg-[#0a0a0a]/80 rounded-[2.5rem] p-10 border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 flex items-center justify-center mb-6">
              <KeyRound className="w-9 h-9 text-[var(--color-brand-500)]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Staff Access</h1>
            <p className="text-sm text-zinc-500 mt-1 text-center">Enter your staff key to open the gate scanner.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="staff-key-input"
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              autoComplete="off"
              className="w-full bg-[#141414] border border-[#27272a] rounded-[1.25rem] py-4 px-5 text-white focus:outline-none focus:border-[var(--color-brand-500)]/50 transition-all duration-300 placeholder-zinc-600 font-mono tracking-widest"
              placeholder="••••••••••••"
            />
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-semibold flex items-center gap-2 px-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button type="submit"
              className="w-full py-4 rounded-[1.25rem] bg-[var(--color-brand-500)] text-black font-black uppercase tracking-[0.15em] text-sm hover:brightness-110 transition-all duration-300 shadow-lg">
              Unlock Scanner
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Camera component (isolated so its div is always mounted before the effect) ─
function CameraView({ staffKey, onScanSuccess }) {
  const html5QrRef = useRef(null);
  const startedRef = useRef(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const toggleTorch = async () => {
    try {
      const caps = html5QrRef.current?.getRunningTrackCameraCapabilities?.();
      const torchFeature = caps?.torchFeature?.();
      if (torchFeature) {
        await torchFeature.apply(!torchOn);
        setTorchOn((v) => !v);
      }
    } catch { /* unsupported */ }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Dynamically import so any load errors don't crash the whole component tree
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const scanner = new Html5Qrcode(QR_READER_ID, { verbose: false });
      html5QrRef.current = scanner;

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (text) => { onScanSuccess(text); },
        () => { /* frequent no-match callback, ignore */ }
      ).catch((err) => {
        setCameraError(String(err?.message ?? err) || 'Camera unavailable.');
      });
    }).catch(() => {
      setCameraError('QR scanner library failed to load.');
    });

    return () => {
      html5QrRef.current?.stop().catch(() => {}).finally(() => {
        html5QrRef.current?.clear?.();
      });
      startedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-[0_20px_60px_rgba(0,0,0,0.5)] min-h-[320px] flex flex-col items-center justify-center">
      {/* Camera target — must exist before the effect runs */}
      <div id={QR_READER_ID} className="w-full [&>video]:w-full [&>video]:object-cover [&>img]:hidden [&_button]:hidden [&_select]:hidden [&_span]:hidden" />

      {cameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center pointer-events-none">
          <ScanLine className="w-10 h-10 text-zinc-700" />
          <p className="text-sm text-zinc-500">{cameraError}</p>
          <p className="text-xs text-zinc-700">Use manual search below.</p>
        </div>
      ) : (
        /* Corner bracket overlay */
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[250px] h-[250px]">
            {[
              'top-0 left-0 border-r-0 border-b-0 rounded-tl-xl',
              'top-0 right-0 border-l-0 border-b-0 rounded-tr-xl',
              'bottom-0 left-0 border-r-0 border-t-0 rounded-bl-xl',
              'bottom-0 right-0 border-l-0 border-t-0 rounded-br-xl',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 border-[3px] border-[var(--color-brand-500)] ${cls}`} />
            ))}
            {/* Scan line */}
            <motion.div
              animate={{ top: ['6%', '90%', '6%'] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              style={{ position: 'absolute', left: '4%', right: '4%' }}
              className="h-0.5 bg-gradient-to-r from-transparent via-[var(--color-brand-500)] to-transparent opacity-80"
            />
          </div>
        </div>
      )}

      {/* Torch toggle */}
      {!cameraError && (
        <button
          onClick={toggleTorch}
          className={`absolute bottom-3 right-3 z-20 p-2.5 rounded-xl border transition-all duration-300 ${
            torchOn
              ? 'bg-[var(--color-brand-500)] border-transparent text-black'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:border-white/20'
          }`}
        >
          {torchOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function StaffScanner() {
  const [staffKey, setStaffKey] = useState(
    () => window.localStorage.getItem(STAFF_KEY_STORAGE) || ''
  );
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const scanLockRef = useRef(false);
  const dismissTimerRef = useRef(null);

  const handleUnlock = (key) => {
    window.localStorage.setItem(STAFF_KEY_STORAGE, key);
    setStaffKey(key);
  };

  const scheduleDismiss = useCallback(() => {
    clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setResult(null);
      setApiError('');
      scanLockRef.current = false;
    }, 5000);
  }, []);

  const dismissNow = () => {
    clearTimeout(dismissTimerRef.current);
    setResult(null);
    setApiError('');
    scanLockRef.current = false;
  };

  const performCheckIn = useCallback(async (token) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    setIsProcessing(true);
    setApiError('');
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-staff-key': staffKey },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (data.status === 'checked-in' && data.message === 'Ticket checked in successfully.') {
        playChime('success');
        vibrate(200);
      } else if (data.status === 'checked-in') {
        playChime('warning');
        vibrate([100, 50, 100]);
      } else {
        playChime('error');
        vibrate([150, 80, 150]);
      }

      setResult(data);
      scheduleDismiss();
    } catch {
      setApiError('Network error — could not reach the API.');
      scanLockRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  }, [staffKey, scheduleDismiss]);

  const handleScanSuccess = useCallback((decodedText) => {
    const token = extractToken(decodedText);
    if (token) performCheckIn(token);
  }, [performCheckIn]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) { setSearchError('Enter at least 2 characters.'); return; }
    setIsSearching(true);
    setSearchError('');
    setSearchResults(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/staff/search?q=${encodeURIComponent(searchQuery)}`,
        { headers: { 'x-staff-key': staffKey } }
      );
      const data = await res.json();
      if (!res.ok) setSearchError(data.message || 'Search failed.');
      else setSearchResults(data.attendees ?? []);
    } catch {
      setSearchError('Network error during search.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualCheckIn = async (attendee) => {
    if (!attendee.ticketToken) { setApiError('No ticket token for this attendee.'); return; }
    setSearchResults(null);
    setSearchQuery('');
    await performCheckIn(attendee.ticketToken);
  };

  if (!staffKey) return <StaffKeyGate onUnlock={handleUnlock} />;

  const isSuccess  = result?.status === 'checked-in' && result?.message === 'Ticket checked in successfully.';
  const isAlreadyIn = result?.status === 'checked-in' && !isSuccess;
  const isInvalid  = result && !isSuccess && !isAlreadyIn;

  return (
    <div className="min-h-screen bg-[#030303] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-brand-500)]/4 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-16 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Gate Scanner</h1>
            <p className="text-xs text-zinc-500 mt-0.5 uppercase tracking-widest">Muzicorp Diwali Ball</p>
          </div>
          <button
            onClick={() => { window.localStorage.removeItem(STAFF_KEY_STORAGE); setStaffKey(''); }}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            Lock
          </button>
        </div>

        {/* Camera */}
        <div className="relative">
          <CameraView staffKey={staffKey} onScanSuccess={handleScanSuccess} />

          {/* Processing overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-3xl gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-[3px] border-white/10 border-t-[var(--color-brand-500)]"
                />
                <p className="text-xs text-zinc-400 font-semibold tracking-widest uppercase">Verifying…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result card */}
        <AnimatePresence mode="wait">
          {(result || apiError) && (
            <div className="relative">
              <button onClick={dismissNow}
                className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {apiError ? (
                <ResultCard glow="red">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-base text-red-400">Network Error</p>
                      <p className="text-sm text-zinc-400 mt-0.5">{apiError}</p>
                    </div>
                  </div>
                </ResultCard>
              ) : isSuccess ? (
                <ResultCard glow="green">
                  <div className="flex items-start gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}>
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-500 uppercase tracking-widest font-bold mb-1">Checked In ✓</p>
                      <p className="font-black text-2xl text-white truncate">{result.ticket?.name}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold">
                          Table {result.ticket?.tableId ?? '—'}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm capitalize">
                          {result.ticket?.ticketType ?? 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                </ResultCard>
              ) : isAlreadyIn ? (
                <ResultCard glow="amber">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-9 h-9 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-500 uppercase tracking-widest font-bold mb-1">Already Checked In</p>
                      <p className="font-black text-xl text-white truncate">{result.ticket?.name}</p>
                      <p className="text-sm text-zinc-500 mt-1">
                        This ticket was already scanned.
                        {result.ticket?.checkedInAt && (
                          <> Entry at {new Date(result.ticket.checkedInAt).toLocaleTimeString()}.</>
                        )}
                      </p>
                    </div>
                  </div>
                </ResultCard>
              ) : isInvalid ? (
                <ResultCard glow="red">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-9 h-9 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-red-500 uppercase tracking-widest font-bold mb-1">Invalid Ticket</p>
                      <p className="font-black text-xl text-white">Access Denied</p>
                      <p className="text-sm text-zinc-400 mt-1">{result?.message || 'QR code not recognised.'}</p>
                    </div>
                  </div>
                </ResultCard>
              ) : null}
            </div>
          )}
        </AnimatePresence>

        {/* Manual search */}
        <div className="backdrop-blur-xl bg-white/[0.03] rounded-3xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-500" />
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Manual Lookup</span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              id="manual-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or username…"
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--color-brand-500)]/60 transition-colors"
            />
            <button type="submit" disabled={isSearching}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors flex items-center gap-2 text-sm font-semibold text-zinc-300 disabled:opacity-50">
              {isSearching ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-zinc-300" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </form>

          <AnimatePresence>
            {searchError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" /> {searchError}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {searchResults && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No attendees found.</p>
                ) : searchResults.map((a) => (
                  <div key={a.attendeeId}
                    className="flex items-center justify-between bg-black/30 border border-white/[0.06] rounded-2xl px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white truncate">{a.name}</p>
                      <p className="text-xs text-zinc-500">@{a.username} · Table {a.tableId ?? '—'}</p>
                    </div>
                    <div className="shrink-0">
                      {a.ticketStatus === 'checked-in' ? (
                        <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> In
                        </span>
                      ) : a.ticketStatus === 'valid' ? (
                        <button onClick={() => handleManualCheckIn(a)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--color-brand-500)] text-black text-xs font-black flex items-center gap-1 hover:brightness-110 transition-all">
                          <Zap className="w-3 h-3" /> Check In
                        </button>
                      ) : (
                        <span className="text-xs text-red-400 font-bold">Invalid</span>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[10px] text-zinc-700 uppercase tracking-widest">
          Gate staff only · Muzicorp Diwali Ball
        </p>
      </div>
    </div>
  );
}
