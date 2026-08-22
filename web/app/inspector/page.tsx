'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProfile } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PlayerInspectorModule } from '@/components/PlayerInspectorModule';

export default function InspectorPage() {
  const [activeTab, setActiveTab] = useState('inspector');
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
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

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, [fetchPlayers]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Industry Standard Responsive Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playerCount={players.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dedicated Module Header */}
        <div className="border-b border-zinc-800/80 pb-6">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-semibold">
              MODULE 01
            </span>
            <span className="text-zinc-500 text-xs font-mono">•</span>
            <span className="text-zinc-400 text-xs font-mono">REST Telemetry & Packet 93</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight mt-2">
            Player Inspector Engine
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl font-sans mt-1">
            Dedicated operational environment for requesting remote character inspections and viewing 18-attribute bytecode stats in real time.
          </p>
        </div>

        {/* Dedicated Player Inspector Component */}
        <PlayerInspectorModule
          players={players}
          loading={loading}
          onRefresh={fetchPlayers}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
