'use client';

import React from 'react';
import { Zap, Radio, Search, PlusCircle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenInspectModal: () => void;
  playerCount: number;
}

export function Navbar({ onOpenInspectModal, playerCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-supabase-border bg-supabase-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-supabase-green/10 border border-supabase-green/30 flex items-center justify-center text-supabase-green shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-supabase-text">NSO MATRIX</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-supabase-green/15 text-supabase-green rounded border border-supabase-green/30">
                REST v1.0
              </span>
            </div>
            <p className="text-xs text-supabase-muted hidden sm:block">Ninja School Online Remote Player Inspection Portal</p>
          </div>
        </div>

        {/* Live Status Indicator & Inspect Action Button */}
        <div className="flex items-center space-x-3">
          {/* Live REST API Status Pill */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-supabase-card border border-supabase-border text-xs text-supabase-muted">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-supabase-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-supabase-green"></span>
            </span>
            <span className="font-mono text-supabase-text">REST Listener Active</span>
            <span className="text-supabase-subtle">|</span>
            <span className="text-supabase-green font-medium">{playerCount} Inspected</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onOpenInspectModal}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-supabase-green text-black font-semibold text-xs sm:text-sm hover:bg-supabase-greenHover transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inspect Player</span>
          </button>
        </div>
      </div>
    </header>
  );
}
