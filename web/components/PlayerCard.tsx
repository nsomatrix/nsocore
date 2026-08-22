'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { StatBadge } from './StatBadge';
import { Zap, Activity, ChevronRight, Clock } from 'lucide-react';

interface PlayerCardProps {
  player: PlayerProfile;
  onSelect: (player: PlayerProfile) => void;
}

export function PlayerCard({ player, onSelect }: PlayerCardProps) {
  const hpPercent = player.maxHp > 0 ? Math.min(100, Math.round((player.hp / player.maxHp) * 100)) : 0;
  const mpPercent = player.maxMp > 0 ? Math.min(100, Math.round((player.mp / player.maxMp) * 100)) : 0;

  // Format relative timestamp
  const timeAgo = React.useMemo(() => {
    if (!player.lastUpdated) return 'Recently';
    const diff = Math.floor((Date.now() - new Date(player.lastUpdated).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }, [player.lastUpdated]);

  return (
    <div
      onClick={() => onSelect(player)}
      className="group relative bg-supabase-card border border-supabase-border rounded-xl p-5 hover:border-supabase-borderHover hover:bg-supabase-elevated transition-all duration-200 cursor-pointer shadow-lg card-glow flex flex-col justify-between"
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                {player.name}
              </h3>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Lvl {player.level}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <StatBadge type="class" value={player.class} />
              <StatBadge type="school" value={player.school} />
            </div>
          </div>
          <div className="text-xs text-supabase-subtle flex items-center space-x-1 font-mono">
            <Clock className="w-3 h-3 text-supabase-subtle" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Vital HP & MP Gauges */}
        <div className="space-y-2 mb-4 pt-2.5 border-t border-supabase-border/60">
          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono text-supabase-muted mb-1">
              <span className="flex items-center text-rose-400 font-medium">
                <Activity className="w-3 h-3 mr-1" /> HP
              </span>
              <span>{player.hp} / {player.maxHp}</span>
            </div>
            <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-supabase-border/40">
              <div
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono text-supabase-muted mb-1">
              <span className="flex items-center text-cyan-400 font-medium">
                <Zap className="w-3 h-3 mr-1" /> MP
              </span>
              <span>{player.mp} / {player.maxMp}</span>
            </div>
            <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-supabase-border/40">
              <div
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Combat Stat Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-black/60 rounded-lg p-2.5 border border-supabase-border/40 font-mono mb-3">
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider font-sans">Attack Power</span>
            <span className="text-white font-medium">{player.attackMin} - {player.attackMax}</span>
          </div>
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider font-sans">Speed / Dodge</span>
            <span className="text-white font-medium">{player.speed} / {player.dodge}</span>
          </div>
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider font-sans">Critical</span>
            <span className="text-emerald-400 font-medium">{player.critical}%</span>
          </div>
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider font-sans">Elemental</span>
            <span className="text-amber-400 font-medium">F:{player.antiFire} I:{player.antiIce} W:{player.antiWind}</span>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="pt-2 flex items-center justify-between text-xs text-supabase-muted group-hover:text-emerald-400 font-medium transition-colors">
        <span>Inspect All 18 Attributes</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
