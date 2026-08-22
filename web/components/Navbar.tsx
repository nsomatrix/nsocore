'use client';

import React from 'react';
import { Terminal, Cpu, Radio, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenInspectModal: () => void;
  playerCount: number;
}

export function Navbar({ onOpenInspectModal, playerCount }: NavbarProps) {
  return (
    <header className="border-b border-bios-border bg-bios-dark font-mono sticky top-0 z-30">
      {/* Top API Status Ticker */}
      <div className="bg-bios-panel border-b border-bios-border/60 px-4 py-1 text-[11px] flex items-center justify-between overflow-x-auto text-bios-muted">
        <div className="flex items-center space-x-4 shrink-0">
          <span className="flex items-center text-bios-green font-bold">
            <span className="w-2 h-2 rounded-full bg-bios-green animate-ping mr-2"></span>
            SYS_STATUS: ONLINE [200 OK]
          </span>
          <span>|</span>
          <span className="text-bios-cyan">ENDPOINT: /api/v1/players</span>
          <span>|</span>
          <span className="text-bios-amber">POLL_QUEUE: /api/v1/inspect [ACTIVE]</span>
        </div>
        <div className="hidden md:flex items-center space-x-3 shrink-0 text-bios-muted">
          <span>HOST: VERCEl_EDGE</span>
          <span>SYSTEM_TIME: {new Date().toISOString().substring(11, 19)} UTC</span>
        </div>
      </div>

      {/* Main BIOS Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 border border-bios-green bg-bios-green/10 flex items-center justify-center text-bios-green font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-vt323 text-2xl text-bios-green tracking-wider bios-glow uppercase">
                NSO_MATRIX_BIOS v2.17
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] bg-bios-green/10 border border-bios-green/40 text-bios-green uppercase">
                API_GATEWAY
              </span>
            </div>
            <p className="text-[11px] text-bios-muted uppercase">
              J2ME Telemetry & Remote Inspect Controller
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 border border-bios-border bg-bios-panel text-xs text-bios-muted">
            <Cpu className="w-3.5 h-3.5 text-bios-cyan" />
            <span>DB_RECORDS:</span>
            <span className="text-bios-green font-bold">{playerCount}</span>
          </div>

          <button
            onClick={onOpenInspectModal}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-bios-green text-black font-bold text-xs hover:bg-bios-amber transition-all uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>[ + DISPATCH TARGET ]</span>
          </button>
        </div>
      </div>
    </header>
  );
}
