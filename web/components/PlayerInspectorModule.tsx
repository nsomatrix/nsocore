'use client';

import React, { useState } from 'react';
import { PlayerProfile } from '@/lib/store';
import { Search, Send, RefreshCw, X, Activity, Zap, Copy, Check, ChevronRight, Trash2, Clock, AlertTriangle, Shield } from 'lucide-react';

interface PlayerInspectorModuleProps {
  players: PlayerProfile[];
  loading: boolean;
  onRefresh: () => void;
}

export function PlayerInspectorModule({ players, loading, onRefresh }: PlayerInspectorModuleProps) {
  const [targetName, setTargetName] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Custom Modal States
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    setDispatching(true);
    setDispatchMsg('');

    try {
      const res = await fetch('/api/v1/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setDispatchMsg(`Target "${targetName.trim()}" queued! J2ME client will poll and send Packet 93.`);
        setTargetName('');
      } else {
        alert(data.error || 'Failed to queue target');
      }
    } catch (err) {
      alert('Error connecting to REST API');
    } finally {
      setDispatching(false);
    }
  };

  const handleConfirmClearAll = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/v1/players', { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        setShowClearConfirmModal(false);
      }
    } catch (e) {
      console.error('Failed to clear profiles:', e);
    } finally {
      setClearing(false);
    }
  };

  const handleCopyJson = (player: PlayerProfile) => {
    navigator.clipboard.writeText(JSON.stringify(player, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanSchoolName = (schoolStr: string) => {
    if (!schoolStr) return 'Unknown';
    return schoolStr.replace(/^School:\s*/i, '').trim();
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cleanSchoolName(p.school).toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="player-inspector-module" className="space-y-6 pt-4">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-display font-extrabold text-white">
              Player Inspector Module
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0 ACTIVE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Dispatch Packet 93 remote inspections or view 18-attribute profiles captured via REST streaming.
          </p>
        </div>

        {/* Remote Inspect Quick Bar */}
        <form onSubmit={handleDispatch} className="flex items-center space-x-2">
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="Target player name..."
            className="px-3.5 py-2 rounded-xl bg-black border border-zinc-800 focus:border-emerald-500 focus:outline-none text-xs text-white font-mono placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={dispatching || !targetName.trim()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-all disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{dispatching ? 'Queuing...' : 'Dispatch'}</span>
          </button>
        </form>
      </div>

      {dispatchMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
          ✓ {dispatchMsg}
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, class, or school..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-xs text-white font-mono placeholder:text-zinc-600"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Auto-Clear Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Auto-clears in 30m</span>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {players.length > 0 && (
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Player Cards Display Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-950/40 text-xs text-zinc-500 font-mono space-y-2">
          <p>No player profiles recorded yet (or profiles auto-cleared after 30 min).</p>
          <p className="text-[11px] text-zinc-600">Dispatch a player name above to inspect in-game.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((p) => {
            const hpPercent = p.maxHp > 0 ? Math.min(100, Math.round((p.hp / p.maxHp) * 100)) : 0;
            const mpPercent = p.maxMp > 0 ? Math.min(100, Math.round((p.mp / p.maxMp) * 100)) : 0;
            const schoolName = cleanSchoolName(p.school);

            return (
              <div
                key={p.name}
                onClick={() => setSelectedPlayer(p)}
                className="group p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all cursor-pointer space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Name & School Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                          {p.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Lvl {p.level}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-sans">
                        {p.class} • <span className="text-zinc-300 font-medium">{schoolName}</span>
                      </p>
                    </div>
                  </div>

                  {/* HP / MP Gauges */}
                  <div className="space-y-2 pt-3 border-t border-zinc-800/60 mt-3 font-mono text-[11px]">
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span className="text-rose-400 flex items-center">
                          <Activity className="w-3 h-3 mr-1" /> HP
                        </span>
                        <span>{p.hp} / {p.maxHp}</span>
                      </div>
                      <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-zinc-800">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${hpPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span className="text-cyan-400 flex items-center">
                          <Zap className="w-3 h-3 mr-1" /> MP
                        </span>
                        <span>{p.mp} / {p.maxMp}</span>
                      </div>
                      <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-zinc-800">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${mpPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Vertical List Layout for Player Stats */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-black/60 border border-zinc-800/50">
                      <span className="text-[10px] text-zinc-400 font-sans">Attack DMG</span>
                      <span className="text-white font-bold">{p.attackMin} - {p.attackMax}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-black/60 border border-zinc-800/50">
                      <span className="text-[10px] text-zinc-400 font-sans">Critical Strike</span>
                      <span className="text-emerald-400 font-bold">{p.critical}%</span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-black/60 border border-zinc-800/50">
                      <span className="text-[10px] text-zinc-400 font-sans">Accuracy</span>
                      <span className="text-zinc-300 font-bold">{p.accurate}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-black/60 border border-zinc-800/50">
                      <span className="text-[10px] text-zinc-400 font-sans">Dodge</span>
                      <span className="text-zinc-300 font-bold">{p.dodge}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-black/60 border border-zinc-800/50">
                      <span className="text-[10px] text-zinc-400 font-sans">Pain Reduce</span>
                      <span className="text-purple-400 font-bold">-{p.reducePain}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs text-zinc-500 group-hover:text-emerald-400 font-medium transition-colors border-t border-zinc-800/40">
                  <span>View All 18 Attributes</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 18-Attribute Modal Detail Dialog */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                  {selectedPlayer.level}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white">{selectedPlayer.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedPlayer.class} • <span className="text-emerald-400 font-medium">{cleanSchoolName(selectedPlayer.school)}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Health & Mana Points Header */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-black rounded-xl border border-rose-500/20">
                <span className="text-[10px] text-rose-400 font-sans block">Hit Points (HP)</span>
                <span className="text-sm font-bold text-white">{selectedPlayer.hp} / {selectedPlayer.maxHp}</span>
              </div>
              <div className="p-3 bg-black rounded-xl border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400 font-sans block">Mana Points (MP)</span>
                <span className="text-sm font-bold text-white">{selectedPlayer.mp} / {selectedPlayer.maxMp}</span>
              </div>
            </div>

            {/* Complete 18 Bytecode Attribute Display Grid (No Commas) */}
            <div className="space-y-4 text-xs font-mono">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-sans">
                Offense & Agility Attributes
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Attack Min</span>
                  <span className="text-white font-bold">{selectedPlayer.attackMin}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Attack Max</span>
                  <span className="text-white font-bold">{selectedPlayer.attackMax}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Speed</span>
                  <span className="text-white font-bold">{selectedPlayer.speed}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Critical Strike</span>
                  <span className="text-emerald-400 font-bold">{selectedPlayer.critical}%</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Accurate Point</span>
                  <span className="text-white font-bold">{selectedPlayer.accurate}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Dodge Ability</span>
                  <span className="text-white font-bold">{selectedPlayer.dodge}</span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-zinc-400 pt-2 uppercase tracking-wider font-sans">
                Defense & Elemental Resistances
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 bg-black rounded-lg border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 block font-sans">Anti Fire</span>
                  <span className="text-white font-bold">+{selectedPlayer.antiFire}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 block font-sans">Anti Ice</span>
                  <span className="text-white font-bold">+{selectedPlayer.antiIce}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 block font-sans">Anti Wind</span>
                  <span className="text-white font-bold">+{selectedPlayer.antiWind}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-purple-500/20">
                  <span className="text-[10px] text-purple-400 block font-sans">Pain Reduce</span>
                  <span className="text-white font-bold">-{selectedPlayer.reducePain}%</span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-zinc-400 pt-2 uppercase tracking-wider font-sans">
                Chakra Control & Counter Strike
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Counter Strike</span>
                  <span className="text-white font-bold">+{selectedPlayer.counterStrike}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Anti Chakra</span>
                  <span className="text-white font-bold">+{selectedPlayer.antiChakra}</span>
                </div>
                <div className="p-2.5 bg-black rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block font-sans">Anti Chakra Back</span>
                  <span className="text-white font-bold">+{selectedPlayer.antiChakraBack}</span>
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => handleCopyJson(selectedPlayer)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-black text-xs text-zinc-400 hover:text-white font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON!' : 'Copy Raw Payload'}</span>
              </button>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Next.js OLED Clear Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl font-sans">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">Clear Stored Profiles?</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This will purge all recorded player profiles from REST memory and disk.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 text-xs font-mono text-zinc-400 space-y-1">
              <p className="text-rose-400 font-semibold">⚠️ Action Warning</p>
              <p className="text-[11px]">All target inspections recorded via REST will be permanently cleared.</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:text-white hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmClearAll}
                disabled={clearing}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {clearing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{clearing ? 'Clearing...' : 'Confirm Clear'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
