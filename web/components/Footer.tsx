'use client';

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export function Footer() {
  const [modClientOnline, setModClientOnline] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/status');
        if (res.ok) {
          const data = await res.json();
          setModClientOnline(!!data.modClientOnline);
        }
      } catch (e) {
        setModClientOnline(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-black text-zinc-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo & Brand & Version */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-bold text-sm text-white tracking-tight">mtx-api</span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
            v1.0
          </span>
        </div>

        {/* Copyright */}
        <div className="font-mono text-[11px] text-zinc-500">
          © {new Date().getFullYear()} mtx-api.
        </div>

        {/* Live API & Mod Client Status */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono">
          {modClientOnline ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-medium">All Systems Functional</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
              <span className="text-rose-400 font-medium">Client Disconnected</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
