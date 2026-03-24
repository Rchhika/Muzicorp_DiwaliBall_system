import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Calendar, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

function sanitizeFilenamePart(value) {
  return String(value ?? '')
    .trim()
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function svgToPngBlob(svgElement, { size = 1024 } = {}) {
  const cloned = svgElement.cloneNode(true);
  cloned.setAttribute('width', String(size));
  cloned.setAttribute('height', String(size));

  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(cloned);
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = svgUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);

    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!pngBlob) throw new Error('Failed to create PNG');
    return pngBlob;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

const Portal = () => {
  const { user } = useAuth();
  const qrContainerRef = useRef(null);
  const [saveError, setSaveError] = useState('');

  if (!user) return null;

  const qrValue = useMemo(
    () =>
      JSON.stringify({
        id: user.id,
        name: user.name,
        table: user.tableId,
        timestamp: new Date().toISOString(),
      }),
    [user.id, user.name, user.tableId]
  );

  const handleSaveTicket = async () => {
    setSaveError('');

    try {
      const svg = qrContainerRef.current?.querySelector('svg');
      if (!svg) throw new Error('QR code not found');

      const pngBlob = await svgToPngBlob(svg, { size: 1024 });
      const filename = `diwali-ball-ticket-${sanitizeFilenamePart(user.name)}-${sanitizeFilenamePart(user.id)}.png`;

      // Best mobile UX when supported (iOS Safari/Chrome Android support varies by version)
      if (navigator.share && window.File) {
        const file = new File([pngBlob], filename, { type: 'image/png' });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Diwali Ball Ticket' });
          return;
        }
      }

      downloadBlob(pngBlob, filename);
    } catch {
      setSaveError('Unable to save ticket on this device. Please try a different browser.');
    }
  };

  return (
    <div className="min-h-[100svh] w-full flex items-center justify-center bg-[var(--color-bg-dark)] px-4 py-24 relative overflow-hidden">
       {/* Background glow */}
       <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[var(--color-brand-500)]/10 blur-[150px] rounded-full pointer-events-none"></div>

       <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 z-10">
         
         {/* Welcome Details Side */}
         <motion.div 
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6 }}
           className="w-full md:w-1/2 flex flex-col justify-center"
         >
           <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
             Welcome, <br />
             <span className="text-[var(--color-brand-500)] text-glow">{user.name}</span>
           </h1>
           <p className="text-gray-400 text-lg mb-8 max-w-sm">
             Your exclusive access pass to the Muzicorp Diwali Ball 2026.
           </p>

           <div className="space-y-4 mb-10">
             <div className="flex items-center gap-4 py-4 border-b border-[var(--color-border-dark)]">
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                 <Calendar className="w-6 h-6 text-gray-300" />
               </div>
               <div>
                 <p className="text-sm text-gray-500 font-medium">Date</p>
                 <p className="text-white font-bold">October 24, 2026</p>
               </div>
             </div>
             
             <div className="flex items-center gap-4 py-4 border-b border-[var(--color-border-dark)]">
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                 <Clock className="w-6 h-6 text-gray-300" />
               </div>
               <div>
                 <p className="text-sm text-gray-500 font-medium">Doors Open</p>
                 <p className="text-white font-bold">18:30 GMT</p>
               </div>
             </div>
             
             <div className="flex items-center gap-4 py-4 border-b border-[var(--color-border-dark)]">
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                 <MapPin className="w-6 h-6 text-[var(--color-brand-500)]" />
               </div>
               <div>
                 <p className="text-sm text-gray-500 font-medium">Table Assignment</p>
                 <p className="text-white text-xl font-bold">Table {user.tableId}</p>
                 <span className="text-xs text-[var(--color-brand-500)] font-bold">{user.ticketType} SEATING</span>
               </div>
             </div>
           </div>
         </motion.div>

         {/* Ticket Side */}
         <motion.div 
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="w-full md:w-1/2 flex items-center justify-center"
         >
           <div className="w-full max-w-[340px] bg-[#141419] rounded-3xl overflow-hidden border border-[var(--color-border-dark)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
             
             {/* Ticket Header pattern */}
             <div className="h-24 bg-gradient-to-br from-[var(--color-brand-900)] to-[#110524] p-6 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                <h3 className="text-xl font-black tracking-[0.2em] text-white uppercase relative z-10 text-glow">DIWALI BALL</h3>
                
                {/* Torn edge circles */}
                <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[var(--color-bg-dark)] border-t border-r border-[var(--color-border-dark)]"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[var(--color-bg-dark)] border-t border-l border-[var(--color-border-dark)]"></div>
             </div>
             
             <div className="p-8 pb-10 border-t border-dashed border-[#2e2e38] relative flex flex-col items-center">
                <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest text-center mt-2">Admit One</p>
                <p className="text-2xl font-black text-white text-center mb-8">{user.name}</p>

                <div ref={qrContainerRef} className="bg-white p-4 rounded-2xl shadow-inner mb-8">
                  <QRCodeSVG 
                    value={qrValue} 
                    size={200} 
                    bgColor={"#ffffff"}
                    fgColor={"#0a0a0e"}
                    level={"H"}
                  />
                </div>
                
                <div className="w-full flex justify-between items-center px-4 mb-4">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Dietary</p>
                    <p className="text-sm text-white font-medium">{user.dietary}</p>
                  </div>
                  <div className="h-8 w-px bg-[#2e2e38]"></div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Ticket ID</p>
                    <p className="font-mono text-sm text-white font-medium">{user.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveTicket}
                  className="flex items-center justify-center gap-2 text-[var(--color-brand-500)] text-sm font-bold hover:text-white transition-colors mt-4"
                >
                  <Download className="w-4 h-4" /> Save Ticket to Phone
                </button>

                {saveError && (
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-red-400 text-center">
                    {saveError}
                  </p>
                )}
             </div>
           </div>
         </motion.div>

       </div>
    </div>
  );
};

export default Portal;
