'use client';

import React from 'react';
import { Shield, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-black text-zinc-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <span className="font-display font-bold text-sm text-white tracking-tight">mtx-api</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Ninja School Remote Target Inspector & REST Synchronization Engine
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#dashboard" className="hover:text-emerald-400 transition-colors">
              Dashboard
            </a>
            <a href="#targets" className="hover:text-emerald-400 transition-colors">
              Targets
            </a>
            <a href="/api/v1/players" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
              <span>REST API</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
            <a href="https://github.com/nsomatrix/nsocore" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* Bottom Sub-Footer Row */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
          <div>
            © {new Date().getFullYear()} <span className="text-white font-medium">mtx-api</span>. Built for Ninja School Online J2ME.
          </div>

          {/* System Status Pill */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
