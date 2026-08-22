'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProfile } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PlatformHero } from '@/components/PlatformHero';
import { ModuleGrid } from '@/components/ModuleGrid';
import { PlayerInspectorModule } from '@/components/PlayerInspectorModule';
import { ApiExplorer } from '@/components/ApiExplorer';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const scrollToInspector = () => {
    const el = document.getElementById('player-inspector-module');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Industry Standard Responsive Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playerCount={players.length}
      />

      {/* Main Platform Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Platform Hero Overview */}
        <PlatformHero
          activeModuleCount={1}
          totalTargetCount={players.length}
        />

        {/* Operational Modules Grid */}
        <ModuleGrid
          onOpenPlayerInspector={scrollToInspector}
          targetCount={players.length}
        />

        {/* Operational Module #1: Player Inspector */}
        <PlayerInspectorModule
          players={players}
          loading={loading}
          onRefresh={fetchPlayers}
        />

        {/* REST API Directory */}
        <ApiExplorer />
      </main>

      {/* Industry Standard Responsive Footer */}
      <Footer />
    </div>
  );
}
