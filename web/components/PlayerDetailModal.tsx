'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { StatBadge } from './StatBadge';
import { X, Zap, Activity, Copy, Check } from 'lucide-react';

interface PlayerDetailModalProps {
  player: PlayerProfile | null;
  onClose: () => void;
}

export function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!player) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(player, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hpPercent = player.maxHp > 0 ? Math.min(100, Math.round((player.hp / player.maxHp) * 100)) : 0;
  const mpPercent = player.maxMp > 0 ? Math.min(100, Math.round((player.mp / player.maxMp) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-supabase-card border border-supabase-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col font-game">
        {/* Header */}
        <div className="p-6 border-b border-supabase-border flex items-center justify-between sticky top-0 bg-supabase-card/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-supabase-green/15 border border-supabase-green/40 flex items-center justify-center text-supabase-green font-pixel text-sm">
              {player.level}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-pixel text-supabase-text">{player.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-pixel bg-supabase-green/15 text-supabase-green border border-supabase-green/30">
                  LVL {player.level}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <StatBadge type="class" value={player.class} />
                <StatBadge type="school" value={player.school} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-supabase-muted hover:text-supabase-text hover:bg-supabase-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Health & Mana Pixel Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-supabase-bg/90 border border-supabase-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-rose-400 font-pixel text-[10px] flex items-center">
                  <Activity className="w-4 h-4 mr-1.5" /> HP
                </span>
                <span className="text-supabase-text">{player.hp} / {player.maxHp} ({hpPercent}%)</span>
              </div>
              <div className="w-full bg-supabase-bg rounded-none h-3 border border-rose-900/50 p-0.5">
                <div className="bg-rose-500 h-full rounded-none shadow-[0_0_10px_rgba(244,63,94,0.7)]" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-supabase-bg/90 border border-supabase-border/60">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-cyan-400 font-pixel text-[10px] flex items-center">
                  <Zap className="w-4 h-4 mr-1.5" /> MP
                </span>
                <span className="text-supabase-text">{player.mp} / {player.maxMp} ({mpPercent}%)</span>
              </div>
              <div className="w-full bg-supabase-bg rounded-none h-3 border border-cyan-900/50 p-0.5">
                <div className="bg-cyan-500 h-full rounded-none shadow-[0_0_10px_rgba(6,182,212,0.7)]" style={{ width: `${mpPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Full 18-Attribute Category Grids */}
          <div className="space-y-4">
            <h3 className="text-xs font-pixel text-supabase-green tracking-wide">
              ATTRIBUTES & MASTERY (18 BYTECODE FIELDS)
            </h3>

            {/* Attack & Agility */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">ATTACK DMG</span>
                <span className="text-sm font-semibold text-supabase-text">{player.attackMin} - {player.attackMax}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">SPEED</span>
                <span className="text-sm font-semibold text-supabase-text">{player.speed}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">CRITICAL</span>
                <span className="text-sm font-semibold text-supabase-green">{player.critical}%</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">ACCURACY</span>
                <span className="text-sm font-semibold text-supabase-text">{player.accurate}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">DODGE</span>
                <span className="text-sm font-semibold text-supabase-text">{player.dodge}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">COUNTER</span>
                <span className="text-sm font-semibold text-supabase-text">{player.counterStrike}</span>
              </div>
            </div>

            {/* Defenses & Resistances */}
            <h4 className="text-[10px] font-pixel text-supabase-muted pt-2">ELEMENTAL RESISTANCES</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-supabase-bg/70 border border-amber-500/30 rounded-lg">
                <span className="text-[9px] font-pixel text-amber-400 block">ANTI FIRE</span>
                <span className="text-sm font-semibold text-supabase-text">+{player.antiFire}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-cyan-500/30 rounded-lg">
                <span className="text-[9px] font-pixel text-cyan-400 block">ANTI ICE</span>
                <span className="text-sm font-semibold text-supabase-text">+{player.antiIce}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-emerald-500/30 rounded-lg">
                <span className="text-[9px] font-pixel text-emerald-400 block">ANTI WIND</span>
                <span className="text-sm font-semibold text-supabase-text">+{player.antiWind}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-purple-500/30 rounded-lg">
                <span className="text-[9px] font-pixel text-purple-400 block">PAIN REDUCE</span>
                <span className="text-sm font-semibold text-supabase-text">-{player.reducePain}%</span>
              </div>
            </div>

            {/* Anti Chakra Stats */}
            <h4 className="text-[10px] font-pixel text-supabase-muted pt-2">CHAKRA CONTROL</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">ANTI CHAKRA</span>
                <span className="text-sm font-semibold text-supabase-text">+{player.antiChakra}</span>
              </div>
              <div className="p-3 bg-supabase-bg/70 border border-supabase-border/60 rounded-lg">
                <span className="text-[9px] font-pixel text-supabase-subtle block">ANTI CHAKRA BACK</span>
                <span className="text-sm font-semibold text-supabase-text">+{player.antiChakraBack}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-supabase-border bg-supabase-card/95 flex items-center justify-between sticky bottom-0">
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-supabase-border bg-supabase-bg hover:border-supabase-green/40 text-xs text-supabase-muted hover:text-supabase-text transition-colors font-game"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-supabase-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED JSON!' : 'COPY RAW PAYLOAD'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-supabase-border hover:bg-supabase-borderHover text-supabase-text font-pixel text-xs transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
