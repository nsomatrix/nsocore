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
      <div className="bg-supabase-card border border-supabase-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col font-sans">
        {/* Header */}
        <div className="p-6 border-b border-supabase-border flex items-center justify-between sticky top-0 bg-supabase-card/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-base">
              {player.level}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-display font-extrabold text-white">{player.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Level {player.level}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1.5">
                <StatBadge type="class" value={player.class} />
                <StatBadge type="school" value={player.school} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-supabase-muted hover:text-white hover:bg-supabase-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Health & Mana Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black border border-supabase-border/60">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-rose-400 font-medium flex items-center">
                  <Activity className="w-4 h-4 mr-1.5" /> Hit Points (HP)
                </span>
                <span className="text-white">{player.hp} / {player.maxHp} ({hpPercent}%)</span>
              </div>
              <div className="w-full bg-supabase-card rounded-full h-2 overflow-hidden border border-supabase-border/40">
                <div className="bg-rose-500 h-full rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)]" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black border border-supabase-border/60">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-cyan-400 font-medium flex items-center">
                  <Zap className="w-4 h-4 mr-1.5" /> Mana Points (MP)
                </span>
                <span className="text-white">{player.mp} / {player.maxMp} ({mpPercent}%)</span>
              </div>
              <div className="w-full bg-supabase-card rounded-full h-2 overflow-hidden border border-supabase-border/40">
                <div className="bg-cyan-500 h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]" style={{ width: `${mpPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Full 18-Attribute Category Grids */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Combat Attributes & Mastery (18 Bytecode Fields)
            </h3>

            {/* Attack & Agility */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Attack Damage</span>
                <span className="text-sm font-mono font-bold text-white">{player.attackMin} - {player.attackMax}</span>
              </div>
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Movement Speed</span>
                <span className="text-sm font-mono font-bold text-white">{player.speed}</span>
              </div>
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Critical Strike</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{player.critical}%</span>
              </div>
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Accurate Point</span>
                <span className="text-sm font-mono font-bold text-white">{player.accurate}</span>
              </div>
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Dodge Ability</span>
                <span className="text-sm font-mono font-bold text-white">{player.dodge}</span>
              </div>
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Counter Strike</span>
                <span className="text-sm font-mono font-bold text-white">{player.counterStrike}</span>
              </div>
            </div>

            {/* Defenses & Resistances */}
            <h4 className="text-xs font-mono font-medium text-supabase-muted pt-2 uppercase">Elemental Resistances</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-black/60 border border-amber-500/20 rounded-lg">
                <span className="text-[11px] text-amber-400 block font-sans">Anti Fire</span>
                <span className="text-sm font-bold text-white">+{player.antiFire}</span>
              </div>
              <div className="p-3 bg-black/60 border border-cyan-500/20 rounded-lg">
                <span className="text-[11px] text-cyan-400 block font-sans">Anti Ice</span>
                <span className="text-sm font-bold text-white">+{player.antiIce}</span>
              </div>
              <div className="p-3 bg-black/60 border border-emerald-500/20 rounded-lg">
                <span className="text-[11px] text-emerald-400 block font-sans">Anti Wind</span>
                <span className="text-sm font-bold text-white">+{player.antiWind}</span>
              </div>
              <div className="p-3 bg-black/60 border border-purple-500/20 rounded-lg">
                <span className="text-[11px] text-purple-400 block font-sans">Pain Reduction</span>
                <span className="text-sm font-bold text-white">-{player.reducePain}%</span>
              </div>
            </div>

            {/* Anti Chakra Stats */}
            <h4 className="text-xs font-mono font-medium text-supabase-muted pt-2 uppercase">Chakra Control & Counter</h4>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Anti Chakra</span>
                <span className="text-sm font-bold text-white">+{player.antiChakra}</span>
              </div>
              <div className="p-3 bg-black/60 border border-supabase-border/60 rounded-lg">
                <span className="text-[11px] font-sans text-supabase-subtle block">Anti Chakra Back</span>
                <span className="text-sm font-bold text-white">+{player.antiChakraBack}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-supabase-border bg-supabase-card/95 flex items-center justify-between sticky bottom-0">
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-supabase-border bg-black hover:border-emerald-500/40 text-xs text-supabase-muted hover:text-white transition-colors font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON!' : 'Copy Raw Payload'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-supabase-border hover:bg-supabase-borderHover text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
