'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { PlayerCard } from '@/components/PlayerCard';
import { PlayerDetailModal } from '@/components/PlayerDetailModal';
import { RemoteInspectModal } from '@/components/RemoteInspectModal';
import { Search, Filter, RefreshCw, Users, ShieldAlert, Sparkles, Plus } from 'lucide-react';

export default function Dashboard() {
  const [players, setPlayers] = React.useState<PlayerProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSchool, setSelectedSchool] = React.useState('All');
  const [selectedClass, setSelectedClass] = React.useState('All');
  
  const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerProfile | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = React.useState(false);

  const fetchPlayers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/players');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players || []);
      }
    } catch (e) {
      console.error('Error fetching player profiles:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPlayers();
    // Poll REST API every 5 seconds for new player profiles
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, [fetchPlayers]);

  // Filtered players list
  const filteredPlayers = React.useMemo(() => {
    return players.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSchool = selectedSchool === 'All' || p.school.toLowerCase() === selectedSchool.toLowerCase();
      const matchesClass = selectedClass === 'All' || p.class.toLowerCase() === selectedClass.toLowerCase();
      return matchesSearch && matchesSchool && matchesClass;
    });
  }, [players, searchQuery, selectedSchool, selectedClass]);

  // Derived metrics
  const maxLevel = players.reduce((max, p) => (p.level > max ? p.level : max), 0);
  const avgAttack = players.length > 0
    ? Math.round(players.reduce((sum, p) => sum + (p.attackMin + p.attackMax) / 2, 0) / players.length)
    : 0;

  return (
    <div className="min-h-screen bg-supabase-bg text-supabase-text flex flex-col font-sans selection:bg-supabase-green/30 selection:text-supabase-green">
      {/* Top Header Navbar */}
      <Navbar
        onOpenInspectModal={() => setInspectModalOpen(true)}
        playerCount={players.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero & Stat Summary Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-supabase-card via-supabase-card to-supabase-elevated border border-supabase-border p-6 sm:p-8 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-supabase-green/10 border border-supabase-green/30 text-supabase-green text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NinjaDex REST API Synchronizer</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-supabase-text">
              Real-Time Ninja School Online <span className="text-supabase-green">Target Inspector</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-supabase-muted leading-relaxed">
              Explore 18-stat character profiles captured directly from the game client via J2ME REST API streaming.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-6 pt-6 border-t border-supabase-border/50 grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
            <div className="p-3 rounded-xl bg-supabase-bg/60 border border-supabase-border/40">
              <span className="text-[11px] text-supabase-subtle block uppercase tracking-wider">Total Targets</span>
              <span className="text-lg font-bold text-supabase-text">{players.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-supabase-bg/60 border border-supabase-border/40">
              <span className="text-[11px] text-supabase-subtle block uppercase tracking-wider">Highest Level</span>
              <span className="text-lg font-bold text-supabase-green">Lvl {maxLevel}</span>
            </div>
            <div className="p-3 rounded-xl bg-supabase-bg/60 border border-supabase-border/40 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-supabase-subtle block uppercase tracking-wider">Avg Damage</span>
              <span className="text-lg font-bold text-amber-400">{avgAttack} DMG</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-supabase-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by character name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-supabase-card border border-supabase-border focus:border-supabase-green focus:outline-none text-supabase-text text-sm font-mono placeholder:text-supabase-subtle"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchPlayers()}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-supabase-card border border-supabase-border hover:border-supabase-borderHover text-xs text-supabase-muted hover:text-supabase-text transition-colors font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* School & Class Filter Pill Badges */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-supabase-subtle font-semibold mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> School:
            </span>
            {['All', 'Hirosaki', 'Haruna', 'Ookasa'].map((sch) => (
              <button
                key={sch}
                onClick={() => setSelectedSchool(sch)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  selectedSchool === sch
                    ? 'bg-supabase-green/15 text-supabase-green border-supabase-green/40 font-semibold'
                    : 'bg-supabase-card border-supabase-border text-supabase-muted hover:text-supabase-text'
                }`}
              >
                {sch}
              </button>
            ))}

            <span className="text-supabase-subtle font-semibold ml-4 mr-1 flex items-center">
              Class:
            </span>
            {['All', 'Ninja Sword', 'Ninja Fan', 'Ninja Kunai', 'Ninja Dart'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  selectedClass === cls
                    ? 'bg-supabase-green/15 text-supabase-green border-supabase-green/40 font-semibold'
                    : 'bg-supabase-card border-supabase-border text-supabase-muted hover:text-supabase-text'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid Display */}
        {loading && players.length === 0 ? (
          <div className="py-16 text-center text-supabase-muted space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-supabase-green" />
            <p className="text-sm">Loading player profiles from REST store...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-supabase-border rounded-2xl space-y-3 p-8">
            <Users className="w-10 h-10 mx-auto text-supabase-subtle" />
            <h3 className="text-base font-bold text-supabase-text">No Matching Players Found</h3>
            <p className="text-xs text-supabase-muted max-w-sm mx-auto">
              No character profile matched your search query. Use the inspect button to queue a target player.
            </p>
            <button
              onClick={() => setInspectModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-supabase-green text-black font-semibold text-xs hover:bg-supabase-greenHover transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Inspect New Target</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.name}
                player={player}
                onSelect={(p) => setSelectedPlayer(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile Devices */}
      <button
        onClick={() => setInspectModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-supabase-green text-black flex items-center justify-center shadow-2xl hover:bg-supabase-greenHover transition-all active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Footer */}
      <footer className="border-t border-supabase-border py-6 text-center text-xs text-supabase-subtle mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NSO Core — Ninja School Online REST API Synchronization Portal</span>
          <span className="font-mono text-supabase-muted">Engineered with Next.js 14 & Supabase Dark Styling</span>
        </div>
      </footer>

      {/* Modals */}
      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />

      <RemoteInspectModal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
      />
    </div>
  );
}
