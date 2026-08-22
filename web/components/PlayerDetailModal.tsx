'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { StatBadge } from './StatBadge';
import { X, Shield, Zap, Activity, Flame, ShieldAlert, Crosshair, Award, Copy, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-supabase-card border border-supabase-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-supabase-border flex items-center justify-between sticky top-0 bg-supabase-card/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-supabase-green/10 border border-supabase-green/30 flex items-center justify-center text-supabase-green font-mono font-bold text-lg">
              {player.level}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-supabase-text">{player.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-supabase-border text-supabase-muted">
                  Level {player.level}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
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
          {/* Health & Mana Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-supabase-bg/80 border border-supabase-border/60">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-rose-400 font-medium flex items-center">
                  <Activity className="w-4 h-4 mr-1.5" /> Hit Points (HP)
                </span>
                <span className="text-supabase-text">{player.hp} / {player.maxHp}</span>
              </div>
              <div className="w-full bg-supabase-border/40 rounded-full h-2.5 overflow-hidden">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${hpPercent}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-supabase-bg/80 border border-supabase-border/60">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-cyan-400 font-medium flex items-center">
                  <Zap className="w-4 h-4 mr-1.5" /> Mana Points (MP)
                </span>
                <span className="text-supabase-text">{player.mp} / {player.maxMp}</span>
              </div>
              <div className="w-full bg-supabase-border/40 rounded-full h-2.5 overflow-hidden">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${mpPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Full 18-Attribute Category Grids */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-supabase-muted">
              Combat Attributes & Mastery (18 Bytecode Fields)
            </h3>

            {/* Attack & Agility */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Attack Damage</span>
                <span className="text-sm font-mono font-bold text-supabase-text">{player.attackMin} - {player.attackMax}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Movement Speed</span>
                <span className="text-sm font-mono font-bold text-supabase-text">{player.speed}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Critical Strike</span>
                <span className="text-sm font-mono font-bold text-supabase-green">{player.critical}%</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Accurate Point</span>
                <span className="text-sm font-mono font-bold text-supabase-text">{player.accurate}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Dodge Ability</span>
                <span className="text-sm font-mono font-bold text-supabase-text">{player.dodge}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Counter Strike</span>
                <span className="text-sm font-mono font-bold text-supabase-text">{player.counterStrike}</span>
              </div>
            </div>

            {/* Defenses & Resistances */}
            <h4 className="text-xs font-semibold text-supabase-muted pt-2">Elemental Resistances & Defense</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-supabase-bg/50 border border-amber-500/20 rounded-lg">
                <span className="text-[11px] text-amber-400 block">Anti Fire</span>
                <span className="text-sm font-mono font-bold text-supabase-text">+{player.antiFire}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-cyan-500/20 rounded-lg">
                <span className="text-[11px] text-cyan-400 block">Anti Ice</span>
                <span className="text-sm font-mono font-bold text-supabase-text">+{player.antiIce}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-emerald-500/20 rounded-lg">
                <span className="text-[11px] text-emerald-400 block">Anti Wind</span>
                <span className="text-sm font-mono font-bold text-supabase-text">+{player.antiWind}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-purple-500/20 rounded-lg">
                <span className="text-[11px] text-purple-400 block">Pain Reduction</span>
                <span className="text-sm font-mono font-bold text-supabase-text">-{player.reducePain}%</span>
              </div>
            </div>

            {/* Anti Chakra Stats */}
            <h4 className="text-xs font-semibold text-supabase-muted pt-2">Chakra Control & Counter</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Anti Chakra</span>
                <span className="text-sm font-mono font-bold text-supabase-text">+{player.antiChakra}</span>
              </div>
              <div className="p-3 bg-supabase-bg/50 border border-supabase-border/50 rounded-lg">
                <span className="text-[11px] text-supabase-subtle block">Anti Chakra Back</span>
                <span className="text-sm font-mono font-bold text-supabase-text">+{player.antiChakraBack}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-supabase-border bg-supabase-card/95 flex items-center justify-between sticky bottom-0">
          <button
            onClick={handleCopyJson}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-supabase-border bg-supabase-bg hover:border-supabase-borderHover text-xs text-supabase-muted hover:text-supabase-text transition-colors font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-supabase-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON!' : 'Copy Raw Payload'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-supabase-border hover:bg-supabase-borderHover text-supabase-text text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
