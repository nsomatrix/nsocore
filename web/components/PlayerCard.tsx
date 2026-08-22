'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { Terminal, Shield, Zap, Flame, Snowflake, Wind, Activity } from 'lucide-react';

interface PlayerCardProps {
  player: PlayerProfile;
  onSelect: (player: PlayerProfile) => void;
}

export function PlayerCard({ player, onSelect }: PlayerCardProps) {
  const hpPercent = Math.min(100, Math.max(0, Math.round((player.hp / (player.maxHp || 1)) * 100)));
  const mpPercent = Math.min(100, Math.max(0, Math.round((player.mp / (player.maxMp || 1)) * 100)));

  // ASCII Progress Bar Generator
  const renderAsciiBar = (percent: number, totalSlots: number = 10, fillChar: string = '█', emptyChar: string = '░') => {
    const filled = Math.round((percent / 100) * totalSlots);
    return fillChar.repeat(filled) + emptyChar.repeat(totalSlots - filled);
  };

  return (
    <div className="bios-box hover:bios-box-active transition-all p-4 flex flex-col justify-between font-mono text-xs text-bios-green group cursor-pointer"
         onClick={() => onSelect(player)}>
      {/* Box ASCII Header */}
      <div>
        <div className="flex items-center justify-between border-b border-bios-border pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-bios-amber font-bold">&gt;</span>
            <h3 className="font-vt323 text-2xl text-bios-green bios-glow tracking-wide uppercase">
              {player.name}
            </h3>
          </div>
          <span className="px-2 py-0.5 border border-bios-amber text-bios-amber font-bold text-[11px]">
            LVL:{player.level}
          </span>
        </div>

        {/* Class & School Tags */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
          <div className="bg-bios-dark p-1.5 border border-bios-border/80">
            <span className="text-bios-muted block text-[9px] uppercase">CLASS:</span>
            <span className="text-bios-cyan font-bold truncate block">{player.class}</span>
          </div>
          <div className="bg-bios-dark p-1.5 border border-bios-border/80">
            <span className="text-bios-muted block text-[9px] uppercase">SCHOOL:</span>
            <span className="text-bios-amber font-bold truncate block">{player.school}</span>
          </div>
        </div>

        {/* Vitals ASCII Gauges */}
        <div className="space-y-2 mb-3 bg-bios-dark/60 p-2.5 border border-bios-border/50 text-[11px]">
          <div>
            <div className="flex justify-between text-bios-red font-bold text-[10px] mb-0.5">
              <span>HP_GAUGE:</span>
              <span>{player.hp}/{player.maxHp} ({hpPercent}%)</span>
            </div>
            <div className="text-bios-red font-mono tracking-widest text-[10px]">
              [{renderAsciiBar(hpPercent)}]
            </div>
          </div>

          <div>
            <div className="flex justify-between text-bios-cyan font-bold text-[10px] mb-0.5">
              <span>MP_GAUGE:</span>
              <span>{player.mp}/{player.maxMp} ({mpPercent}%)</span>
            </div>
            <div className="text-bios-cyan font-mono tracking-widest text-[10px]">
              [{renderAsciiBar(mpPercent)}]
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] mb-3 text-center">
          <div className="bg-bios-panel p-1 border border-bios-border">
            <span className="text-bios-muted block text-[8px]">ATTACK</span>
            <span className="text-bios-amber font-bold">{player.attackMin}-{player.attackMax}</span>
          </div>
          <div className="bg-bios-panel p-1 border border-bios-border">
            <span className="text-bios-muted block text-[8px]">SPEED</span>
            <span className="text-bios-green font-bold">{player.speed}</span>
          </div>
          <div className="bg-bios-panel p-1 border border-bios-border">
            <span className="text-bios-muted block text-[8px]">CRITICAL</span>
            <span className="text-bios-cyan font-bold">{player.critical}%</span>
          </div>
        </div>

        {/* Elemental Resistances */}
        <div className="flex justify-between items-center text-[10px] border-t border-bios-border/60 pt-2 text-bios-muted">
          <span className="flex items-center space-x-1">
            <Flame className="w-3 h-3 text-red-500" />
            <span>F:{player.antiFire}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span>I:{player.antiIce}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>W:{player.antiWind}</span>
          </span>
          <span className="text-bios-amber">PAIN:{player.reducePain}%</span>
        </div>
      </div>

      {/* Footer Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(player);
        }}
        className="mt-3 w-full py-1.5 bg-bios-dark border border-bios-green/60 text-bios-green group-hover:bg-bios-green group-hover:text-black font-bold text-xs transition-colors uppercase tracking-wider text-center"
      >
        [ INSPECT RAW JSON ]
      </button>
    </div>
  );
}
