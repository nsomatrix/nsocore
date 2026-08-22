'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { StatBadge } from './StatBadge';
import { Shield, Flame, Zap, Sword, Activity, ChevronRight, Clock } from 'lucide-react';

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
      className="group relative bg-supabase-card border border-supabase-border rounded-xl p-5 hover:border-supabase-borderHover hover:bg-supabase-elevated transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-bold text-supabase-text group-hover:text-supabase-green transition-colors">
                {player.name}
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-supabase-green/10 text-supabase-green border border-supabase-green/20">
                Lvl {player.level}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <StatBadge type="class" value={player.class} />
              <StatBadge type="school" value={player.school} />
            </div>
          </div>
          <div className="text-[11px] text-supabase-subtle flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Vital HP & MP Bars */}
        <div className="space-y-2 mb-4 pt-2 border-t border-supabase-border/40">
          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-supabase-muted mb-1">
              <span className="flex items-center text-rose-400">
                <Activity className="w-3 h-3 mr-1" /> HP
              </span>
              <span>{player.hp} / {player.maxHp} ({hpPercent}%)</span>
            </div>
            <div className="w-full bg-supabase-border/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-supabase-muted mb-1">
              <span className="flex items-center text-cyan-400">
                <Zap className="w-3 h-3 mr-1" /> MP
              </span>
              <span>{player.mp} / {player.maxMp} ({mpPercent}%)</span>
            </div>
            <div className="w-full bg-supabase-border/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Combat Stat Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-supabase-bg/60 rounded-lg p-2.5 border border-supabase-border/40 font-mono mb-3">
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider">Attack Power</span>
            <span className="text-supabase-text font-medium">{player.attackMin} - {player.attackMax}</span>
          </div>
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider">Speed / Dodge</span>
            <span className="text-supabase-text font-medium">{player.speed} spd / {player.dodge} dg</span>
          </div>
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider">Critical Hit</span>
            <span className="text-supabase-green font-medium">{player.critical}%</span>
          </div>
          <div>
            <span className="text-supabase-subtle block text-[10px] uppercase tracking-wider">Elemental Anti</span>
            <span className="text-amber-400 font-medium">F:{player.antiFire} I:{player.antiIce} W:{player.antiWind}</span>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="pt-2 flex items-center justify-between text-xs text-supabase-muted group-hover:text-supabase-green font-medium transition-colors">
        <span>Inspect All 18 Stats</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
