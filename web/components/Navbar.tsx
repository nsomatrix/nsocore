'use client';

import React from 'react';
import { Shield, PlusCircle, Radio } from 'lucide-react';

interface NavbarProps {
  onOpenInspectModal: () => void;
  playerCount: number;
}

export function Navbar({ onOpenInspectModal, playerCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-supabase-border bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-base tracking-tight text-white">
                NSO MATRIX
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                v1.0 REST
              </span>
            </div>
            <p className="text-xs text-supabase-muted hidden sm:block font-sans">
              Ninja School Remote Target Inspector
            </p>
          </div>
        </div>

        {/* Live REST Status & Inspect Action Button */}
        <div className="flex items-center space-x-3">
          {/* Live REST Status Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-supabase-card border border-supabase-border text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-supabase-muted text-[11px]">REST STREAMING</span>
            <span className="text-supabase-border">|</span>
            <span className="text-emerald-400 font-mono font-medium text-[11px]">{playerCount} TARGETS</span>
          </div>

          {/* Action Button */}
          <button
            onClick={onOpenInspectModal}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-xs sm:text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inspect Player</span>
          </button>
        </div>
      </div>
    </header>
  );
}
