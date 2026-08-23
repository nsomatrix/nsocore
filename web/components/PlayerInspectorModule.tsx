'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlayerProfile } from '@/lib/store';
import { Search, RefreshCw, X, Activity, Zap, Copy, Check, ChevronRight, Trash2, Clock, AlertTriangle, Loader2, Download, Shield, Sparkles, Radio, Play } from 'lucide-react';

export function PlayerInspectorModule() {
  const [sessionPlayers, setSessionPlayers] = useState<PlayerProfile[]>([]);
  const [targetName, setTargetName] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(true);
  const [syncStartTime, setSyncStartTime] = useState<number | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // 5-Second Live Telemetry Sync for Active Session Cards (Auto-stops after 1 minute)
  useEffect(() => {
    if (sessionPlayers.length === 0) {
      setSyncStartTime(null);
      setIsLiveSyncActive(true);
      return;
    }

    // Initialize timer start when first active session starts
    if (!syncStartTime) {
      setSyncStartTime(Date.now());
    }

    if (!isLiveSyncActive) return;

    const liveSyncInterval = setInterval(async () => {
      // Check 1-minute (60,000ms) timeout limit
      if (syncStartTime && Date.now() - syncStartTime >= 60000) {
        setIsLiveSyncActive(false);
        clearInterval(liveSyncInterval);
        return;
      }

      try {
        // Read latest streamed player profiles from REST API (GET /api/v1/players)
        const res = await fetch('/api/v1/players');
        if (res.ok) {
          const data = await res.json();
          const allStored: PlayerProfile[] = data.players || [];
          
          setSessionPlayers((prevSession) => {
            let updatedAny = false;
            const nextSession = prevSession.map((p) => {
              const fresh = allStored.find((s) => s.name.toLowerCase() === p.name.toLowerCase());
              if (fresh && JSON.stringify(fresh) !== JSON.stringify(p)) {
                updatedAny = true;
                return fresh;
              }
              return p;
            });
            return updatedAny ? nextSession : prevSession;
          });

          setSelectedPlayer((prevSelected) => {
            if (!prevSelected) return null;
            const freshSelected = allStored.find((s) => s.name.toLowerCase() === prevSelected.name.toLowerCase());
            return freshSelected || prevSelected;
          });
        }
      } catch (err) {
        console.warn('Live telemetry sync warning:', err);
      }
    }, 5000);

    return () => clearInterval(liveSyncInterval);
  }, [sessionPlayers.length, isLiveSyncActive, syncStartTime]);

  const MAX_LIVE_CARDS = 4;

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = targetName.trim();
    if (!cleanName) return;

    // Check maximum active session capacity cap
    const existsAlready = sessionPlayers.some((p) => p.name.toLowerCase() === cleanName.toLowerCase());
    if (!existsAlready && sessionPlayers.length >= MAX_LIVE_CARDS) {
      setFetchMsg({
        type: 'error',
        text: `Live cap reached (${MAX_LIVE_CARDS} max). Clear session to inspect additional targets.`
      });
      return;
    }

    stopPolling();
    setSyncStartTime(Date.now());
    setIsLiveSyncActive(true);
    setFetching(true);
    setFetchMsg({ type: 'info', text: `Queueing Packet 93 inspection for "${cleanName}"...` });

    try {
      // 1. Post inspection request target
      const res = await fetch('/api/v1/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFetchMsg({ type: 'error', text: data.error || 'Failed to queue fetch target' });
        setFetching(false);
        return;
      }

      setFetchMsg({ type: 'info', text: `Waiting for J2ME client to respond to Packet 93 for "${cleanName}"...` });

      // 2. Poll targeted player REST endpoint every 1.5s for up to 15 seconds
      const startTime = Date.now();
      const pollTarget = async () => {
        try {
          const checkRes = await fetch(`/api/v1/players?q=${encodeURIComponent(cleanName)}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            const found = (checkData.players || []).find(
              (p: PlayerProfile) => p.name.toLowerCase() === cleanName.toLowerCase()
            );

            if (found) {
              stopPolling();
              setSessionPlayers((prev) => {
                const idx = prev.findIndex((p) => p.name.toLowerCase() === found.name.toLowerCase());
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = found;
                  return updated;
                }
                return [found, ...prev];
              });
              setFetchMsg({ type: 'success', text: `Successfully retrieved 18-attribute profile for "${found.name}"!` });
              setFetching(false);
              setTargetName('');
              return true;
            }
          }
        } catch (err) {
          console.warn('Target poll error:', err);
        }

        // Timeout after 15 seconds
        if (Date.now() - startTime > 15000) {
          stopPolling();
          setFetchMsg({
            type: 'info',
            text: `Inspection queued for "${cleanName}". J2ME client will stream stats when online.`
          });
          setFetching(false);
          return true;
        }
        return false;
      };

      // Immediate check then interval
      const done = await pollTarget();
      if (!done) {
        pollIntervalRef.current = setInterval(pollTarget, 1500);
      }
    } catch (err) {
      setFetchMsg({ type: 'error', text: 'Error connecting to REST API' });
      setFetching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    try {
      const res = await fetch(`/api/v1/players?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const results: PlayerProfile[] = data.players || [];
        if (results.length > 0) {
          setSessionPlayers((prev) => {
            const combined = [...prev];
            results.forEach((r) => {
              if (!combined.some((p) => p.name.toLowerCase() === r.name.toLowerCase())) {
                combined.unshift(r);
              }
            });
            return combined;
          });
        }
      }
    } catch (e) {
      console.error('Search lookup error:', e);
    }
  };

  const handleClearSession = () => {
    fetch('/api/v1/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '__CLEAR__' }),
    }).catch(() => {});
    setSessionPlayers([]);
    setFetchMsg(null);
  };

  const handleConfirmClearAll = async () => {
    setClearing(true);
    try {
      fetch('/api/v1/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '__CLEAR__' }),
      }).catch(() => {});
      const res = await fetch('/api/v1/players', { method: 'DELETE' });
      if (res.ok) {
        setSessionPlayers([]);
        setFetchMsg(null);
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

  const filteredPlayers = sessionPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cleanSchoolName(p.school).toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="player-inspector-module" className="space-y-6 pt-4">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-display font-extrabold text-white">
              Player Inspector Module
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              COMMUNITY REST API
            </span>
            {sessionPlayers.length > 0 && (
              isLiveSyncActive ? (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <span>LIVE 5s TELEMETRY ({sessionPlayers.length}/{MAX_LIVE_CARDS})</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSyncStartTime(Date.now());
                    setIsLiveSyncActive(true);
                  }}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors shadow-sm cursor-pointer"
                >
                  <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>PAUSED (1m Timeout) • Resume Sync</span>
                </button>
              )
            )}
          </div>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Enter any player name to trigger on-demand J2ME Packet 93 remote inspection.
          </p>
        </div>

        {/* Fetch Target Input Form */}
        <form onSubmit={handleFetch} className="flex items-center space-x-2">
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            placeholder="Enter character name..."
            className="px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 focus:border-emerald-500 focus:outline-none text-xs text-white font-mono placeholder:text-zinc-600 min-w-[190px]"
          />
          <button
            type="submit"
            disabled={fetching || !targetName.trim()}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all disabled:opacity-50 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)] min-w-[95px]"
          >
            {fetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Fetch</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Dynamic Status Toast Banner */}
      {fetchMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between animate-fade-in ${
            fetchMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : fetchMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {fetchMsg.type === 'success' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
            {fetchMsg.type === 'info' && <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />}
            {fetchMsg.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{fetchMsg.text}</span>
          </div>
          <button onClick={() => setFetchMsg(null)} className="hover:opacity-75 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active session or press Enter to lookup database..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-xs text-white font-mono placeholder:text-zinc-600"
          />
        </form>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {sessionPlayers.length > 0 && (
            <button
              onClick={handleClearSession}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Session</span>
            </button>
          )}

          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Server Store</span>
          </button>
        </div>
      </div>

      {/* Empty State vs Active Session Cards */}
      {filteredPlayers.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-800/80 rounded-2xl p-8 bg-zinc-950/40 text-xs text-zinc-500 font-mono space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-zinc-300 font-sans">No Active Inspection Targets</p>
            <p className="text-zinc-500 max-w-sm mx-auto font-sans">
              Enter a Ninja character name above and click <span className="text-emerald-400 font-medium">Fetch</span> to request a live Packet 93 inspection.
            </p>
          </div>
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
                className="group p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all cursor-pointer space-y-4 flex flex-col justify-between relative overflow-hidden"
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
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${hpPercent}%` }} />
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
                        <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${mpPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Preview Key Stats - Rich Brown Pills with Rich Gold Yellow Text */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-[#593722]/60 font-mono text-[11px]">
                    <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#3b2416] border border-[#6b4229]/80 shadow-sm">
                      <span className="text-[11px] text-[#fef08a] font-sans font-medium">Attack DMG</span>
                      <span className="text-[#facc15] font-extrabold">{p.attackMin} - {p.attackMax}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#3b2416] border border-[#6b4229]/80 shadow-sm">
                      <span className="text-[11px] text-[#fef08a] font-sans font-medium">Critical Strike</span>
                      <span className="text-[#facc15] font-extrabold">{p.critical}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#3b2416] border border-[#6b4229]/80 shadow-sm">
                      <span className="text-[11px] text-[#fef08a] font-sans font-medium">Reduce Pain</span>
                      <span className="text-[#facc15] font-extrabold">{p.reducePain}</span>
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

      {/* 18-Attribute Modal Detail Dialog - Sleek Game-Like List with Live Sync */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
                  {selectedPlayer.level}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-display font-bold text-white">{selectedPlayer.name}</h3>
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                      <Radio className="w-2.5 h-2.5 text-emerald-400" />
                      <span>LIVE</span>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedPlayer.class} • <span className="text-emerald-400 font-medium">{cleanSchoolName(selectedPlayer.school)}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Health & Mana Points */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-rose-500/20">
                <span className="text-rose-400 font-sans flex items-center space-x-1.5 font-semibold">
                  <Activity className="w-4 h-4" />
                  <span>HP</span>
                </span>
                <span className="text-sm font-bold text-white">{selectedPlayer.hp} / {selectedPlayer.maxHp}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/60 rounded-xl border border-cyan-500/20">
                <span className="text-cyan-400 font-sans flex items-center space-x-1.5 font-semibold">
                  <Zap className="w-4 h-4" />
                  <span>MP</span>
                </span>
                <span className="text-sm font-bold text-white">{selectedPlayer.mp} / {selectedPlayer.maxMp}</span>
              </div>
            </div>

            {/* Unified Sleek Game-Like Stats Panel (Continuous List with Rich Brown Pills & Rich Gold Yellow Text) */}
            <div className="bg-[#24160e] rounded-2xl border border-[#593722] overflow-hidden divide-y divide-[#4a2e1c]/80 text-xs font-mono shadow-xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Attack Min</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.attackMin}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Attack Max</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.attackMax}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Speed</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.speed}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#422919] hover:bg-[#52331f] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Critical Strike</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.critical}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Accurate Point</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.accurate}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Dodge Ability</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.dodge}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#422919] hover:bg-[#52331f] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Anti Fire</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.antiFire}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#422919] hover:bg-[#52331f] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Anti Ice</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.antiIce}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#422919] hover:bg-[#52331f] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Anti Wind</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.antiWind}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#422919] hover:bg-[#52331f] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Reduce Pain</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.reducePain}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Counter Strike</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.counterStrike}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Anti Chakra</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.antiChakra}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-[#3b2416] hover:bg-[#4a2e1c] transition-colors">
                <span className="text-[#fef08a] font-sans font-medium">Anti Chakra Back</span>
                <span className="text-[#facc15] font-extrabold">{selectedPlayer.antiChakraBack}</span>
              </div>
            </div>

            {/* Footer Action Row */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => handleCopyJson(selectedPlayer)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-zinc-800 bg-black text-xs text-zinc-400 hover:text-white font-mono transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON!' : 'Copy Raw Payload'}</span>
              </button>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom OLED Clear Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl font-sans">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">Purge Server Database?</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This will purge all player profiles from server memory and disk.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 text-xs font-mono text-zinc-400 space-y-1">
              <p className="text-rose-400 font-semibold">⚠️ Action Warning</p>
              <p className="text-[11px]">All stored inspection records will be cleared globally.</p>
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{clearing ? 'Clearing...' : 'Confirm Purge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
