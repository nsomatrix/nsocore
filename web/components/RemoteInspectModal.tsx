'use client';

import React from 'react';
import { X, Send, Radio, CheckCircle2 } from 'lucide-react';

interface RemoteInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RemoteInspectModal({ isOpen, onClose }: RemoteInspectModalProps) {
  const [targetName, setTargetName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Inspection queued for "${targetName.trim()}". J2ME client will dispatch Packet 93.`);
        setTargetName('');
      } else {
        alert(data.error || 'Failed to queue inspection target');
      }
    } catch (err: any) {
      alert('Error connecting to REST API server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
      <div className="bg-supabase-card border border-supabase-border rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-supabase-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Remote Target Inspector</h3>
              <p className="text-xs text-supabase-muted">Dispatch Packet 93 via REST Bridge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-supabase-muted hover:text-white hover:bg-supabase-border/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-supabase-subtle mb-2">
              Target Character Name
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="e.g. manixstar"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-black border border-supabase-border focus:border-emerald-500 focus:outline-none text-white text-sm font-mono placeholder:text-supabase-subtle"
            />
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-2 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-supabase-border text-xs text-supabase-muted hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !targetName.trim()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Queuing...' : 'Dispatch Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
