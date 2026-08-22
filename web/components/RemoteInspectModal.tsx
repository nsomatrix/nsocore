'use client';

import React from 'react';
import { X, Terminal, Send, Check, AlertCircle } from 'lucide-react';

interface RemoteInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RemoteInspectModal({ isOpen, onClose }: RemoteInspectModalProps) {
  const [targetName, setTargetName] = React.useState('');
  const [status, setStatus] = React.useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    setStatus('LOADING');
    setMessage('Dispatching POST /api/v1/inspect payload to Vercel queue...');

    try {
      const res = await fetch('/api/v1/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('SUCCESS');
        setMessage(`HTTP 200 OK: Target "${targetName.trim()}" queued for J2ME MIDP client polling.`);
        setTargetName('');
      } else {
        setStatus('ERROR');
        setMessage(data.error || 'Failed to dispatch inspect request.');
      }
    } catch (e: any) {
      setStatus('ERROR');
      setMessage('Network error: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs text-bios-green">
      <div className="bios-box border-2 border-bios-green w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* BIOS Header */}
        <div className="bg-bios-dark px-4 py-2.5 border-b border-bios-green flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-bios-amber" />
            <h3 className="font-vt323 text-2xl text-bios-green bios-glow tracking-wider uppercase">
              [ DISPATCH_REMOTE_INSPECT ]
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-bios-border text-bios-muted hover:text-bios-red hover:border-bios-red"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="text-[11px] text-bios-muted space-y-1">
            <p>Enter target character name to push into the Vercel REST queue.</p>
            <p className="text-bios-amber">&gt; J2ME mod will poll GET /api/v1/inspect & dispatch Packet 93.</p>
          </div>

          {/* Terminal Command Input */}
          <div className="space-y-1">
            <label className="block text-[10px] text-bios-cyan uppercase font-bold">
              &gt; INPUT_TARGET_NAME:
            </label>
            <div className="flex items-center bg-bios-dark border border-bios-green p-2 focus-within:border-bios-amber">
              <span className="text-bios-green font-bold mr-2">&gt;</span>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. manixstar"
                className="w-full bg-transparent text-bios-green placeholder:text-bios-muted focus:outline-none font-mono text-sm uppercase"
                autoFocus
              />
            </div>
          </div>

          {/* Curl Command Preview */}
          <div className="p-2.5 bg-bios-dark border border-bios-border text-[10px] space-y-1">
            <span className="text-bios-muted block border-b border-bios-border/50 pb-0.5">DISPATCH TELEMETRY PREVIEW:</span>
            <div className="text-bios-cyan font-mono overflow-x-auto">
              curl -X POST https://mtx-api.vercel.app/api/v1/inspect -d &#39;&#123;&quot;name&quot;:&quot;{targetName.trim() || 'TARGET'}&quot;&#125;&#39;
            </div>
          </div>

          {/* Status Output Console */}
          {status !== 'IDLE' && (
            <div className={`p-3 border text-[11px] font-mono ${
              status === 'SUCCESS'
                ? 'bg-bios-green/10 border-bios-green text-bios-green'
                : status === 'ERROR'
                ? 'bg-bios-red/10 border-bios-red text-bios-red'
                : 'bg-bios-amber/10 border-bios-amber text-bios-amber'
            }`}>
              <div className="flex items-start space-x-2">
                {status === 'SUCCESS' && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                {status === 'ERROR' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                {status === 'LOADING' && <div className="w-3 h-3 border-2 border-bios-amber border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />}
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-bios-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-bios-border text-bios-muted hover:text-bios-green uppercase text-xs"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              disabled={status === 'LOADING' || !targetName.trim()}
              className="px-4 py-1.5 bg-bios-green text-black font-bold hover:bg-bios-amber transition-colors uppercase text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>[ DISPATCH REQUEST ]</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
