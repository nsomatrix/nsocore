'use client';

import React from 'react';
import { Shield, Sparkles, Server, Activity, Layers, Code2 } from 'lucide-react';

interface PlatformHeroProps {
  activeModuleCount: number;
  totalTargetCount: number;
}

export function PlatformHero({ activeModuleCount, totalTargetCount }: PlatformHeroProps) {
  return (
    <section className="relative rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-black border border-zinc-800/80 p-6 sm:p-10 overflow-hidden shadow-2xl">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        {/* Top Tag Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Unified REST API Platform for J2ME</span>
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
          mtx-api <span className="text-emerald-400">Control Hub</span>
        </h1>
        <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-2xl font-sans">
          The central REST gateway and modular modding engine for Ninja School Online J2ME. Monitor live game telemetry, inspect characters, and manage upcoming platform services.
        </p>

        {/* Platform KPI Metric Grid */}
        <div className="pt-6 border-t border-zinc-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/60 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block font-sans uppercase tracking-wider">Gateway</span>
              <span className="text-white font-bold">Online v1.0</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/60 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block font-sans uppercase tracking-wider">Active Modules</span>
              <span className="text-emerald-400 font-bold">{activeModuleCount} Enabled</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/60 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block font-sans uppercase tracking-wider">Targets Sync</span>
              <span className="text-white font-bold">{totalTargetCount} Profiles</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800/60 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block font-sans uppercase tracking-wider">Endpoints</span>
              <span className="text-amber-400 font-bold">4 Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
