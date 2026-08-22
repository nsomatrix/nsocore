'use client';

import React from 'react';
import { PlayerProfile } from '@/lib/store';
import { X, Copy, Check, Terminal, Code, Cpu } from 'lucide-react';

interface PlayerDetailModalProps {
  player: PlayerProfile | null;
  onClose: () => void;
}

export function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [copiedCurl, setCopiedCurl] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'GRID' | 'JSON' | 'HEADERS'>('GRID');

  if (!player) return null;

  const rawJsonString = JSON.stringify(player, null, 2);
  const curlString = `curl -X POST https://mtx-api.vercel.app/api/v1/players \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(player)}'`;

  const copyToClipboard = (text: string, type: 'JSON' | 'CURL') => {
    navigator.clipboard.writeText(text);
    if (type === 'JSON') {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="bios-box border-2 border-bios-green w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-bios-green">
        
        {/* BIOS Modal Header */}
        <div className="bg-bios-dark px-4 py-2.5 border-b border-bios-green flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-bios-amber" />
            <h2 className="font-vt323 text-2xl text-bios-green bios-glow tracking-wider uppercase">
              [ INSPECTION_PAYLOAD :: {player.name} ]
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-bios-border text-bios-muted hover:text-bios-red hover:border-bios-red transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-bios-border bg-bios-panel text-xs">
          <button
            onClick={() => setActiveTab('GRID')}
            className={`px-4 py-2 border-r border-bios-border font-bold uppercase transition-all ${
              activeTab === 'GRID'
                ? 'bg-bios-green text-black'
                : 'text-bios-muted hover:text-bios-green'
            }`}
          >
            [ 1. 18-STAT TABLE ]
          </button>

          <button
            onClick={() => setActiveTab('JSON')}
            className={`px-4 py-2 border-r border-bios-border font-bold uppercase transition-all ${
              activeTab === 'JSON'
                ? 'bg-bios-green text-black'
                : 'text-bios-muted hover:text-bios-green'
            }`}
          >
            [ 2. RAW JSON ]
          </button>

          <button
            onClick={() => setActiveTab('HEADERS')}
            className={`px-4 py-2 font-bold uppercase transition-all ${
              activeTab === 'HEADERS'
                ? 'bg-bios-green text-black'
                : 'text-bios-muted hover:text-bios-green'
            }`}
          >
            [ 3. HTTP HEADERS ]
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'GRID' && (
            <div className="space-y-4">
              {/* ASCII Overview Summary */}
              <div className="p-3 bg-bios-dark border border-bios-border text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div><span className="text-bios-muted">NAME:</span> <span className="text-bios-green font-bold">{player.name}</span></div>
                <div><span className="text-bios-muted">LEVEL:</span> <span className="text-bios-amber font-bold">Lvl {player.level}</span></div>
                <div><span className="text-bios-muted">CLASS:</span> <span className="text-bios-cyan font-bold">{player.class}</span></div>
                <div><span className="text-bios-muted">SCHOOL:</span> <span className="text-bios-amber font-bold">{player.school}</span></div>
              </div>

              {/* 18 Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-bios-border bg-bios-panel p-3 space-y-1.5">
                  <span className="text-bios-amber font-bold block border-b border-bios-border pb-1 uppercase text-[10px]">
                    &gt; OFFENSIVE & AGILITY ATTRIBUTES
                  </span>
                  <div className="flex justify-between"><span className="text-bios-muted">Attack Range:</span><span className="text-bios-green">{player.attackMin} - {player.attackMax} DMG</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Movement Speed:</span><span className="text-bios-green">{player.speed}</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Accuracy Point:</span><span className="text-bios-green">{player.accurate}</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Dodge Ability:</span><span className="text-bios-green">{player.dodge}</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Critical Strike:</span><span className="text-bios-cyan">{player.critical}%</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Counter Strike:</span><span className="text-bios-cyan">{player.counterStrike}%</span></div>
                </div>

                <div className="border border-bios-border bg-bios-panel p-3 space-y-1.5">
                  <span className="text-bios-amber font-bold block border-b border-bios-border pb-1 uppercase text-[10px]">
                    &gt; DEFENSIVE & RESISTANCE ATTRIBUTES
                  </span>
                  <div className="flex justify-between"><span className="text-bios-muted">Anti Fire:</span><span className="text-bios-red">{player.antiFire}</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Anti Ice:</span><span className="text-bios-cyan">{player.antiIce}</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Anti Wind:</span><span className="text-emerald-400">{player.antiWind}</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Pain Reduction:</span><span className="text-bios-amber">{player.reducePain}%</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Anti Chakra:</span><span className="text-bios-green">{player.antiChakra}</span></div>
                  <div className="flex justify-between"><span className="text-bios-muted">Anti Chakra Back:</span><span className="text-bios-green">{player.antiChakraBack}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'JSON' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-bios-muted text-[11px]">
                <span>RAW_PAYLOAD_BODY (APPLICATION/JSON)</span>
                <button
                  onClick={() => copyToClipboard(rawJsonString, 'JSON')}
                  className="flex items-center space-x-1 text-bios-green hover:underline uppercase"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? '[ COPIED! ]' : '[ COPY JSON ]'}</span>
                </button>
              </div>
              <pre className="p-3 bg-bios-dark border border-bios-border text-bios-green overflow-x-auto text-[11px] font-mono leading-relaxed">
                {rawJsonString}
              </pre>
            </div>
          )}

          {activeTab === 'HEADERS' && (
            <div className="space-y-3">
              <div className="p-3 bg-bios-dark border border-bios-border text-[11px] space-y-1 text-bios-muted font-mono">
                <div><span className="text-bios-cyan">HTTP/1.1</span> <span className="text-bios-green">201 CREATED</span></div>
                <div><span className="text-bios-amber">Content-Type:</span> application/json</div>
                <div><span className="text-bios-amber">User-Agent:</span> NSOCore-MatrixAPI/1.0 (J2ME MIDP2.0)</div>
                <div><span className="text-bios-amber">X-Vercel-Cache:</span> MISS</div>
                <div><span className="text-bios-amber">Last-Modified:</span> {player.lastUpdated}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-bios-muted text-[11px]">
                  <span>REPLICATE VIA CURL</span>
                  <button
                    onClick={() => copyToClipboard(curlString, 'CURL')}
                    className="flex items-center space-x-1 text-bios-cyan hover:underline uppercase"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? '[ COPIED! ]' : '[ COPY CURL ]'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-bios-dark border border-bios-border text-bios-cyan overflow-x-auto text-[11px] font-mono">
                  {curlString}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-bios-dark border-t border-bios-border flex justify-between items-center text-xs">
          <span className="text-bios-muted text-[10px]">INSPECTED_AT: {player.lastUpdated}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-bios-green text-black font-bold hover:bg-bios-amber transition-colors uppercase"
          >
            [ CLOSE INSPECTOR ]
          </button>
        </div>

      </div>
    </div>
  );
}
