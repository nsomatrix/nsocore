'use client';

import React from 'react';
import { Zap, PlusCircle } from 'lucide-react';

interface NavbarProps {
  onOpenInspectModal: () => void;
  playerCount: number;
}

export function Navbar({ onOpenInspectModal, playerCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-supabase-border bg-supabase-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Pixel Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-supabase-green/10 border border-supabase-green/30 flex items-center justify-center text-supabase-green shadow-sm">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-pixel text-sm sm:text-base tracking-wider text-supabase-green drop-shadow-[0_0_8px_rgba(62,207,142,0.4)]">
                NSO MATRIX
              </span>
              <span className="px-2 py-0.5 text-[9px] font-pixel bg-supabase-green/15 text-supabase-green rounded border border-supabase-green/30">
                REST v1
              </span>
            </div>
            <p className="text-[11px] font-game text-supabase-muted hidden sm:block">
              Ninja School Remote Target Inspector
            </p>
          </div>
        </div>

        {/* Live Status & Pixel Inspect Action Button */}
        <div className="flex items-center space-x-3">
          {/* Live REST Listener Pill */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-supabase-card border border-supabase-border text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-supabase-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-supabase-green"></span>
            </span>
            <span className="font-game text-supabase-text text-[11px]">REST LISTENER ONLINE</span>
            <span className="text-supabase-subtle">|</span>
            <span className="text-supabase-green font-pixel text-[10px]">{playerCount} INSPECTED</span>
          </div>

          {/* Action Button */}
          <button
            onClick={onOpenInspectModal}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-supabase-green text-black font-pixel text-[10px] sm:text-xs hover:bg-supabase-greenHover transition-all shadow-[0_0_15px_rgba(62,207,142,0.3)] active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>INSPECT TARGET</span>
          </button>
        </div>
      </div>
    </header>
  );
}
