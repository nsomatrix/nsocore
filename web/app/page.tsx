'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { PlayerCard } from '@/components/PlayerCard';
import { PlayerDetailModal } from '@/components/PlayerDetailModal';
import { RemoteInspectModal } from '@/components/RemoteInspectModal';
import { Terminal, RefreshCw, Filter, Search, Plus, Cpu, Radio, Shield, Code } from 'lucide-react';

export default function Dashboard() {
  const [players, setPlayers] = React.useState<PlayerProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSchool, setSelectedSchool] = React.useState('All');
  const [selectedClass, setSelectedClass] = React.useState('All');
  const [showApiDocs, setShowApiDocs] = React.useState(false);
  
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
    // Poll REST API every 4 seconds for fresh J2ME telemetry payloads
    const interval = setInterval(fetchPlayers, 4000);
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

  const maxLevel = players.reduce((max, p) => (p.level > max ? p.level : max), 0);

  return (
    <div className="min-h-screen bg-bios-bg text-bios-green flex flex-col font-mono selection:bg-bios-green selection:text-black">
      {/* Top BIOS Navbar */}
      <Navbar
        onOpenInspectModal={() => setInspectModalOpen(true)}
        playerCount={players.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* BIOS ASCII System Control Banner */}
        <div className="bios-box p-4 border border-bios-border space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bios-border/80 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-bios-amber font-bold text-base">&gt;</span>
                <h2 className="font-vt323 text-3xl text-bios-green bios-glow tracking-wider uppercase">
                  SYSTEM_STATUS :: REST_API_GATEWAY
                </h2>
              </div>
              <p className="text-xs text-bios-muted mt-1 uppercase">
                J2ME MIDP 2.0 Telemetry Stream Receiver &amp; Async Queue Controller
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => setShowApiDocs(!showApiDocs)}
                className="px-3 py-1.5 border border-bios-cyan text-bios-cyan hover:bg-bios-cyan/10 font-bold uppercase transition-all"
              >
                {showApiDocs ? '[ HIDE API SPEC ]' : '[ VIEW API SPEC ]'}
              </button>
              <button
                onClick={() => setInspectModalOpen(true)}
                className="px-3.5 py-1.5 bg-bios-green text-black font-bold hover:bg-bios-amber transition-all uppercase"
              >
                [ + INSPECT TARGET ]
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-bios-dark p-2.5 border border-bios-border">
              <span className="text-[10px] text-bios-muted block uppercase">TARGET_RECORDS</span>
              <span className="text-lg font-vt323 font-bold text-bios-green bios-glow">{players.length} PROFILES</span>
            </div>
            <div className="bg-bios-dark p-2.5 border border-bios-border">
              <span className="text-[10px] text-bios-muted block uppercase">PEAK_LEVEL</span>
              <span className="text-lg font-vt323 font-bold text-bios-amber bios-glow-amber">LVL {maxLevel}</span>
            </div>
            <div className="bg-bios-dark p-2.5 border border-bios-border">
              <span className="text-[10px] text-bios-muted block uppercase">REST_ENDPOINT</span>
              <span className="text-xs font-mono text-bios-cyan truncate block">/api/v1/players</span>
            </div>
            <div className="bg-bios-dark p-2.5 border border-bios-border">
              <span className="text-[10px] text-bios-muted block uppercase">INSPECT_QUEUE</span>
              <span className="text-xs font-mono text-bios-green truncate block">/api/v1/inspect</span>
            </div>
          </div>

          {/* Expandable API Specification Drawer */}
          {showApiDocs && (
            <div className="mt-4 p-3 bg-bios-dark border border-bios-cyan/60 text-xs space-y-3 font-mono">
              <div className="flex justify-between items-center text-bios-cyan font-bold border-b border-bios-border pb-1">
                <span>[ API CENTRIC SPECIFICATION & ENDPOINT DOCUMENTATION ]</span>
                <span className="text-[10px] text-bios-muted">FORMAT: JSON</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-1">
                  <span className="text-bios-amber font-bold">POST /api/v1/players</span>
                  <p className="text-bios-muted">Ingests 18-attribute J2ME player JSON payload from game mod.</p>
                  <pre className="p-2 bg-black border border-bios-border text-bios-green text-[10px]">
                    {`POST /api/v1/players HTTP/1.1\nContent-Type: application/json\n\n{"name":"PlayerName","level":75,...}`}
                  </pre>
                </div>
                <div className="space-y-1">
                  <span className="text-bios-amber font-bold">GET /api/v1/inspect &amp; POST /api/v1/inspect</span>
                  <p className="text-bios-muted">Web dispatches target name; J2ME mod polls queue &amp; sends Packet 93.</p>
                  <pre className="p-2 bg-black border border-bios-border text-bios-cyan text-[10px]">
                    {`GET /api/v1/inspect -> {"status":200,"target":"manixstar"}\nPOST /api/v1/inspect -> {"name":"manixstar"}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BIOS Filter & Terminal Search Bar */}
        <div className="bios-box p-3 border border-bios-border space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="flex-1 flex items-center bg-bios-dark border border-bios-border px-3 py-1.5 focus-within:border-bios-green">
              <Search className="w-4 h-4 text-bios-muted mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH_BY_NAME > e.g. manixstar..."
                className="w-full bg-transparent text-bios-green placeholder:text-bios-muted focus:outline-none text-xs font-mono uppercase"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchPlayers()}
              className="px-3.5 py-1.5 border border-bios-border bg-bios-dark hover:border-bios-green text-bios-muted hover:text-bios-green text-xs font-mono flex items-center justify-center space-x-2 uppercase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>[ REFRESH ]</span>
            </button>
          </div>

          {/* School & Class Filter Tabs */}
          <div className="flex flex-wrap gap-2 text-xs items-center border-t border-bios-border/60 pt-2">
            <span className="text-bios-muted uppercase mr-1">&gt; SCHOOL:</span>
            {['All', 'Hirosaki', 'Haruna', 'Ookasa'].map((sch) => (
              <button
                key={sch}
                onClick={() => setSelectedSchool(sch)}
                className={`px-2.5 py-0.5 border text-xs uppercase ${
                  selectedSchool === sch
                    ? 'bg-bios-green text-black font-bold border-bios-green'
                    : 'bg-bios-dark border-bios-border text-bios-muted hover:text-bios-green'
                }`}
              >
                [{sch}]
              </button>
            ))}

            <span className="text-bios-muted uppercase ml-4 mr-1">&gt; CLASS:</span>
            {['All', 'Ninja Sword', 'Ninja Fan', 'Ninja Kunai', 'Ninja Dart'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-0.5 border text-xs uppercase ${
                  selectedClass === cls
                    ? 'bg-bios-green text-black font-bold border-bios-green'
                    : 'bg-bios-dark border-bios-border text-bios-muted hover:text-bios-green'
                }`}
              >
                [{cls}]
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid Display */}
        {loading && players.length === 0 ? (
          <div className="bios-box p-12 text-center text-bios-muted space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-bios-green" />
            <p className="text-xs uppercase font-mono">&gt; CONNECTING TO REST STORE... READING /api/v1/players...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="bios-box p-12 text-center space-y-3 border-dashed border-bios-border">
            <Terminal className="w-10 h-10 mx-auto text-bios-muted" />
            <h3 className="font-vt323 text-2xl text-bios-amber uppercase">&gt; NO MATCHING RECORDS FOUND</h3>
            <p className="text-xs text-bios-muted max-w-sm mx-auto uppercase">
              No character record matched the current filter. Use the dispatch command to queue an inspection.
            </p>
            <button
              onClick={() => setInspectModalOpen(true)}
              className="px-4 py-2 bg-bios-green text-black font-bold text-xs uppercase hover:bg-bios-amber transition-colors"
            >
              [ + DISPATCH NEW TARGET ]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        className="sm:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-bios-green text-black font-bold flex items-center justify-center shadow-2xl border-2 border-black active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Footer */}
      <footer className="border-t border-bios-border bg-bios-dark py-4 text-center text-xs text-bios-muted mt-auto font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NSO MATRIX BIOS v2.17 — TELEMETRY & REST GATEWAY</span>
          <span className="text-bios-green">VT323 / SHARE TECH MONO CRT TERMINAL ENGINE</span>
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
