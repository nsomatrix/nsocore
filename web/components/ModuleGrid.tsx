'use client';

import React from 'react';
import { UserCheck, Map, Terminal, Database, Shield, Zap, ArrowRight, Lock } from 'lucide-react';

interface ModuleGridProps {
  onOpenPlayerInspector: () => void;
  targetCount: number;
}

export function ModuleGrid({ onOpenPlayerInspector, targetCount }: ModuleGridProps) {
  const modules = [
    {
      id: 'player-inspector',
      title: 'Player Inspector',
      version: 'v1.0 ACTIVE',
      active: true,
      icon: UserCheck,
      description: 'Capture 18-attribute player profiles via J2ME REST streaming & dispatch Packet 93 remote inspections.',
      badgeText: `${targetCount} Profiles`,
      actionText: 'Launch Module',
      onClick: onOpenPlayerInspector,
    },
    {
      id: 'boss-tracker',
      title: 'World Boss & Map Tracker',
      version: 'UPCOMING',
      active: false,
      icon: Map,
      description: 'Track live mob spawns, boss respawn timers, and zone player distributions across Ninja School realms.',
      badgeText: 'Planned v1.1',
      actionText: 'Coming Soon',
    },
    {
      id: 'server-terminal',
      title: 'Remote Command Terminal',
      version: 'UPCOMING',
      active: false,
      icon: Terminal,
      description: 'Dispatch raw network packets, inspect client debug logs, and execute admin server commands.',
      badgeText: 'Planned v1.2',
      actionText: 'Coming Soon',
    },
    {
      id: 'item-db',
      title: 'Item & Inventory Registry',
      version: 'UPCOMING',
      active: false,
      icon: Database,
      description: 'Database of equipment IDs, stats, drop rates, and real-time market trade transaction tracking.',
      badgeText: 'Planned v1.3',
      actionText: 'Coming Soon',
    },
    {
      id: 'guild-analytics',
      title: 'Guild & Clan Analytics',
      version: 'UPCOMING',
      active: false,
      icon: Shield,
      description: 'Clan roster management, territory conquest leaderboard stats, and automated guild activity feeds.',
      badgeText: 'Planned v1.4',
      actionText: 'Coming Soon',
    },
    {
      id: 'webhooks-automation',
      title: 'Webhooks & Bot Automations',
      version: 'UPCOMING',
      active: false,
      icon: Zap,
      description: 'Trigger Discord webhooks for rare boss drops, high-level player achievements, and automated alerts.',
      badgeText: 'Planned v1.5',
      actionText: 'Coming Soon',
    },
  ];

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
            Platform Modules
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Select an active platform module or explore upcoming REST integrations.
          </p>
        </div>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={mod.active && mod.onClick ? mod.onClick : undefined}
              className={`group relative rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                mod.active
                  ? 'bg-zinc-900/80 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-zinc-900 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.08)]'
                  : 'bg-zinc-950/60 border-zinc-800/60 opacity-75'
              }`}
            >
              <div>
                {/* Module Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      mod.active
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800/40 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                      mod.active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {mod.version}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
                  {mod.description}
                </p>
              </div>

              {/* Card Footer Call-to-Action */}
              <div className="pt-6 mt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-zinc-500">{mod.badgeText}</span>
                <div
                  className={`flex items-center space-x-1.5 font-semibold text-xs transition-colors ${
                    mod.active
                      ? 'text-emerald-400 group-hover:translate-x-1 transition-transform'
                      : 'text-zinc-600'
                  }`}
                >
                  <span>{mod.actionText}</span>
                  {mod.active ? (
                    <ArrowRight className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
