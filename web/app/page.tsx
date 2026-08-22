'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [playerCount, setPlayerCount] = useState(0);

  const handleInspectModal = () => {
    alert('Inspect Modal trigger clicked!');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Industry Standard Responsive Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playerCount={playerCount}
        onOpenInspectModal={handleInspectModal}
      />

      {/* Main Content Placeholder */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-emerald-400">
          mtx-api Dashboard Ready
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white">
          mtx-api Web Engine
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-lg font-sans">
          Refactored brand title to <span className="text-emerald-400 font-mono">mtx-api</span>. Ready to build the next section!
        </p>
      </main>
    </div>
  );
}
